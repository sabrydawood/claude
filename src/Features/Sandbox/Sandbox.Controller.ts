/**
 * Sandbox.Controller.ts
 * Sandbox chat with multi-provider support.
 *
 * Priority:
 *   1. User's own API key (any supported provider) → use matching SDK
 *   2. No user key → fall back to system providers via StreamChat
 *
 * SEV-005: Internal error details are logged server-side only.
 */
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { CheckRateLimit, type IRateLimitConfig } from '@/Shared/Middleware/RateLimit.Middleware';
import { db } from '@/lib/db/Index';
import { EncryptedKeys, SandboxSessions, SystemPrompts } from '@/lib/db/Schema';
import { and, eq } from 'drizzle-orm';
import { decryptApiKey } from '@/lib/encryption';
import { StreamChat } from '@/Lib/Ai/Providers';
import { SandboxChatSchema } from './Sandbox.Schemas';

const SANDBOX_RATE_LIMIT: IRateLimitConfig = { MaxRequests: 10, WindowMs: 60_000 };

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Transfer-Encoding': 'chunked',
  'X-Content-Type-Options': 'nosniff',
} as const;

const PROVIDER_CFG: Record<string, { sdk: 'anthropic' | 'openai'; model: string; baseURL?: string }> = {
  anthropic:  { sdk: 'anthropic', model: 'claude-haiku-4-5-20251001' },
  openai:     { sdk: 'openai',    model: 'gpt-4o-mini' },
  gemini:     { sdk: 'openai',    model: 'gemini-2.0-flash-lite', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai' },
  openrouter: { sdk: 'openai',    model: 'openrouter/free',        baseURL: 'https://openrouter.ai/api/v1' },
};

const DEFAULT_SANDBOX_PROMPT = `أنت مساعد تعليمي ذكي متخصص في تعليم البرمجة والذكاء الاصطناعي.
اسمك "ذكاوي" وأنت هنا لمساعدة المتعلمين على فهم المفاهيم التقنية وتطبيقاتها.
كن ودوداً ومشجعاً، واستخدم أمثلة من الحياة اليومية لتوضيح المفاهيم المعقدة.`;

async function GetSandboxSystemPrompt(): Promise<string> {
  const [Row] = await db
    .select({ Content: SystemPrompts.Content })
    .from(SystemPrompts)
    .where(and(eq(SystemPrompts.Key, 'sandbox_base'), eq(SystemPrompts.IsActive, true)))
    .limit(1);
  return Row?.Content ?? DEFAULT_SANDBOX_PROMPT;
}

function isAuthError(err: unknown): boolean {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return true;
  if (err instanceof OpenAI.AuthenticationError || err instanceof OpenAI.PermissionDeniedError) return true;
  const status = (err as { status?: number })?.status;
  return status === 401 || status === 403;
}

function iterableToStreamResponse(iterable: AsyncIterable<string>): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterable) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        console.error('[Sandbox] mid-stream error:', err);
        controller.close();
      }
    },
  });
  return new Response(readable, { headers: STREAM_HEADERS });
}

/**
 * POST /api/v1/sandbox — streams AI response.
 * Uses user's own key when present; falls back to system providers otherwise.
 */
export async function PostSandboxChat(Req: NextRequest): Promise<NextResponse | Response> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const RateLimit = await CheckRateLimit(Req, Session.user.id, SANDBOX_RATE_LIMIT);
  if (RateLimit) return RateLimit;

  const Body = await ParseBodyOrBadRequest(Req, SandboxChatSchema);
  if (Body instanceof NextResponse) return Body;

  const SystemPrompt = await GetSandboxSystemPrompt();

  const [KeyRow] = await db
    .select({ EncryptedKey: EncryptedKeys.EncryptedKey, Provider: EncryptedKeys.Provider })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, Session.user.id))
    .limit(1);

  // No user key → use system providers
  if (!KeyRow) {
    return iterableToStreamResponse(StreamChat(SystemPrompt, Body.Messages));
  }

  // Decrypt user key
  let ApiKey: string;
  try {
    ApiKey = await decryptApiKey(KeyRow.EncryptedKey);
  } catch {
    return NextResponse.json({ Success: false, Error: { Code: 'DECRYPT_FAILED' } }, { status: 500 });
  }

  const Cfg = PROVIDER_CFG[KeyRow.Provider] ?? PROVIDER_CFG.openai;
  const UserId  = Session.user.id;
  const MsgCount = Body.Messages.length + 1;

  try {
    if (Cfg.sdk === 'anthropic') {
      const client = new Anthropic({ apiKey: ApiKey });
      const stream = await client.messages.create({
        model: Cfg.model,
        max_tokens: 2048,
        system: SystemPrompt,
        messages: Body.Messages,
        stream: true,
      });

      async function* anthropicChunks() {
        let inputTokens = 0;
        let outputTokens = 0;
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield event.delta.text;
          }
          if (event.type === 'message_start') inputTokens = event.message.usage.input_tokens;
          if (event.type === 'message_delta' && event.usage) outputTokens = event.usage.output_tokens;
        }
        db.insert(SandboxSessions)
          .values({ UserId, Model: Cfg.model, MessagesCount: MsgCount, TokensUsed: inputTokens + outputTokens })
          .catch(() => {});
      }

      return iterableToStreamResponse(anthropicChunks());
    }

    // OpenAI-compatible (openai / gemini / openrouter)
    const client = new OpenAI({ apiKey: ApiKey, ...(Cfg.baseURL ? { baseURL: Cfg.baseURL } : {}) });
    const stream = await client.chat.completions.create({
      model: Cfg.model,
      max_tokens: 2048,
      messages: [{ role: 'system', content: SystemPrompt }, ...Body.Messages],
      stream: true,
    });

    async function* openaiChunks() {
      let tokens = 0;
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) yield text;
        if (chunk.usage) tokens = (chunk.usage.prompt_tokens ?? 0) + (chunk.usage.completion_tokens ?? 0);
      }
      db.insert(SandboxSessions)
        .values({ UserId, Model: Cfg.model, MessagesCount: MsgCount, TokensUsed: tokens })
        .catch(() => {});
    }

    return iterableToStreamResponse(openaiChunks());
  } catch (err) {
    console.error(`[Sandbox] user key (${KeyRow.Provider}) error:`, (err as Error).message);
    if (isAuthError(err)) {
      return NextResponse.json({ Success: false, Error: { Code: 'USER_KEY_FAILED' } }, { status: 401 });
    }
    return NextResponse.json({ Success: false, Error: { Code: 'STREAM_ERROR' } }, { status: 500 });
  }
}
