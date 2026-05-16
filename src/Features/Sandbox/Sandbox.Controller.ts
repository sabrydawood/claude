/**
 * Sandbox.Controller.ts
 * Sandbox chat with multi-provider support + conversation persistence.
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
import {
  CreateSandboxConversation,
  SaveMessage,
  BumpConversationTimestamp,
  GenerateAndSaveTitle,
} from '@/Features/Conversations/Conversations.Service';
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

function makeStreamResponse(iterable: AsyncIterable<string>, convId: string): Response {
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
  return new Response(readable, {
    headers: { ...STREAM_HEADERS, 'X-Conversation-Id': convId },
  });
}

/**
 * POST /api/v1/sandbox — streams AI response + persists conversation.
 */
export async function PostSandboxChat(Req: NextRequest): Promise<NextResponse | Response> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const RateLimit = await CheckRateLimit(Req, Session.user.id, SANDBOX_RATE_LIMIT);
  if (RateLimit) return RateLimit;

  const Body = await ParseBodyOrBadRequest(Req, SandboxChatSchema);
  if (Body instanceof NextResponse) return Body;

  const SystemPrompt = await GetSandboxSystemPrompt();
  const UserId = Session.user.id;
  const Messages = Body.Messages;
  const IsFirstMessage = Messages.length === 1;
  const UserMessage = Messages[Messages.length - 1].content;

  // Get or create conversation
  const ConvId = Body.ConversationId ?? await CreateSandboxConversation(UserId);

  // Save user message + bump timestamp (fire-and-forget)
  SaveMessage(ConvId, 'user', UserMessage).catch(() => {});
  BumpConversationTimestamp(ConvId).catch(() => {});

  const [KeyRow] = await db
    .select({ EncryptedKey: EncryptedKeys.EncryptedKey, Provider: EncryptedKeys.Provider })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, UserId))
    .limit(1);

  const MsgCount = Body.Messages.length + 1;

  // No user key → use system providers
  if (!KeyRow) {
    async function* systemChunks() {
      let assistantContent = '';
      for await (const chunk of StreamChat(SystemPrompt, Messages)) {
        assistantContent += chunk;
        yield chunk;
      }
      SaveMessage(ConvId, 'assistant', assistantContent).catch(() => {});
      BumpConversationTimestamp(ConvId).catch(() => {});
      if (IsFirstMessage) GenerateAndSaveTitle(ConvId, UserMessage).catch(() => {});
    }
    return makeStreamResponse(systemChunks(), ConvId);
  }

  // Decrypt user key
  let ApiKey: string;
  try {
    ApiKey = await decryptApiKey(KeyRow.EncryptedKey);
  } catch {
    return NextResponse.json({ Success: false, Error: { Code: 'DECRYPT_FAILED' } }, { status: 500 });
  }

  const Cfg = PROVIDER_CFG[KeyRow.Provider] ?? PROVIDER_CFG.openai;

  try {
    if (Cfg.sdk === 'anthropic') {
      const client = new Anthropic({ apiKey: ApiKey });
      const stream = await client.messages.create({
        model: Cfg.model, max_tokens: 2048, system: SystemPrompt, messages: Messages, stream: true,
      });

      async function* anthropicChunks() {
        let assistantContent = '';
        let inputTokens = 0;
        let outputTokens = 0;
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            assistantContent += event.delta.text;
            yield event.delta.text;
          }
          if (event.type === 'message_start') inputTokens = event.message.usage.input_tokens;
          if (event.type === 'message_delta' && event.usage) outputTokens = event.usage.output_tokens;
        }
        SaveMessage(ConvId, 'assistant', assistantContent, 'anthropic').catch(() => {});
        BumpConversationTimestamp(ConvId).catch(() => {});
        if (IsFirstMessage) GenerateAndSaveTitle(ConvId, UserMessage).catch(() => {});
        db.insert(SandboxSessions).values({ UserId, Model: Cfg.model, MessagesCount: MsgCount, TokensUsed: inputTokens + outputTokens }).catch(() => {});
      }

      return makeStreamResponse(anthropicChunks(), ConvId);
    }

    const client = new OpenAI({ apiKey: ApiKey, ...(Cfg.baseURL ? { baseURL: Cfg.baseURL } : {}) });
    const stream = await client.chat.completions.create({
      model: Cfg.model, max_tokens: 2048,
      messages: [{ role: 'system', content: SystemPrompt }, ...Messages],
      stream: true,
    });

    async function* openaiChunks() {
      let assistantContent = '';
      let tokens = 0;
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) { assistantContent += text; yield text; }
        if (chunk.usage) tokens = (chunk.usage.prompt_tokens ?? 0) + (chunk.usage.completion_tokens ?? 0);
      }
      SaveMessage(ConvId, 'assistant', assistantContent, KeyRow.Provider).catch(() => {});
      BumpConversationTimestamp(ConvId).catch(() => {});
      if (IsFirstMessage) GenerateAndSaveTitle(ConvId, UserMessage).catch(() => {});
      db.insert(SandboxSessions).values({ UserId, Model: Cfg.model, MessagesCount: MsgCount, TokensUsed: tokens }).catch(() => {});
    }

    return makeStreamResponse(openaiChunks(), ConvId);
  } catch (err) {
    console.error(`[Sandbox] user key (${KeyRow.Provider}) error:`, (err as Error).message);
    if (isAuthError(err)) {
      return NextResponse.json({ Success: false, Error: { Code: 'USER_KEY_FAILED' } }, { status: 401 });
    }
    return NextResponse.json({ Success: false, Error: { Code: 'STREAM_ERROR' } }, { status: 500 });
  }
}
