/**
 * Sandbox.Controller.ts
 * SSE streaming handler for the user's personal sandbox chat.
 * Uses user's decrypted Anthropic API key.
 *
 * SEV-005: Internal error details are logged server-side only.
 * The client receives only a generic error message.
 */
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { db } from '@/lib/db/Index';
import { EncryptedKeys, SandboxSessions, SystemPrompts } from '@/lib/db/Schema';
import { and, eq } from 'drizzle-orm';
import { decryptApiKey } from '@/lib/encryption';
import { SandboxChatSchema } from './Sandbox.Schemas';

const MODEL = 'claude-haiku-4-5-20251001';

const DEFAULT_SANDBOX_PROMPT = `أنت مساعد تعليمي ذكي متخصص في تعليم الذكاء الاصطناعي باللغة العربية.
اسمك "ذكاوي" وأنت هنا لمساعدة المتعلمين على فهم مفاهيم الذكاء الاصطناعي وتطبيقاتها.
كن ودوداً ومشجعاً، واستخدم أمثلة من الحياة اليومية لتوضيح المفاهيم المعقدة.
عند الإجابة بالعربية، استخدم لغة واضحة وبسيطة مناسبة للمبتدئين.`;

async function GetSandboxSystemPrompt(): Promise<string> {
  const [Row] = await db
    .select({ Content: SystemPrompts.Content })
    .from(SystemPrompts)
    .where(and(eq(SystemPrompts.Key, 'sandbox_base'), eq(SystemPrompts.IsActive, true)))
    .limit(1);
  return Row?.Content ?? DEFAULT_SANDBOX_PROMPT;
}

/**
 * POST /api/v1/sandbox — streams AI response using user's personal Anthropic key.
 */
export async function PostSandboxChat(Req: NextRequest): Promise<NextResponse | Response> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, SandboxChatSchema);
  if (Body instanceof NextResponse) return Body;

  const [KeyRow] = await db
    .select({ EncryptedKey: EncryptedKeys.EncryptedKey })
    .from(EncryptedKeys)
    .where(eq(EncryptedKeys.UserId, Session.user.id))
    .limit(1);

  if (!KeyRow) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'NO_API_KEY' } },
      { status: 400 },
    );
  }

  let ApiKey: string;
  try {
    ApiKey = await decryptApiKey(KeyRow.EncryptedKey);
  } catch {
    return NextResponse.json(
      { Success: false, Error: { Code: 'DECRYPT_FAILED' } },
      { status: 500 },
    );
  }

  const SystemPrompt = await GetSandboxSystemPrompt();

  const Anthropic_ = new Anthropic({ apiKey: ApiKey });
  const Encoder = new TextEncoder();
  let TotalInputTokens = 0;
  let TotalOutputTokens = 0;
  const UserId = Session.user.id;
  const Messages = Body.Messages;

  const Stream = new ReadableStream({
    async start(Controller) {
      try {
        const Response = await Anthropic_.messages.create({
          model: MODEL,
          max_tokens: 2048,
          system: [{ type: 'text', text: SystemPrompt, cache_control: { type: 'ephemeral' } }],
          messages: Messages,
          stream: true,
        });

        for await (const Event of Response) {
          if (Event.type === 'content_block_delta' && Event.delta.type === 'text_delta') {
            Controller.enqueue(Encoder.encode(Event.delta.text));
          }
          if (Event.type === 'message_delta' && Event.usage) {
            TotalOutputTokens = Event.usage.output_tokens ?? 0;
          }
          if (Event.type === 'message_start' && Event.message.usage) {
            TotalInputTokens = Event.message.usage.input_tokens ?? 0;
          }
        }

        Controller.close();

        // Fire-and-forget session record
        db.insert(SandboxSessions)
          .values({
            UserId,
            Model: MODEL,
            MessagesCount: Messages.length + 1,
            TokensUsed: TotalInputTokens + TotalOutputTokens,
          })
          .catch(() => {});
      } catch (Err: unknown) {
        // SEV-005: Log full error server-side only, send error code to client
        console.error('[Sandbox] Stream error:', Err);
        Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ error: 'STREAM_ERROR' })}\n\n`));
        Controller.close();
      }
    },
  });

  return new Response(Stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
