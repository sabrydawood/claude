/**
 * Mascot.Controller.ts
 * SSE streaming handler for the AI mascot chat.
 *
 * Works for both authenticated users and guests.
 * SEV-002: Rate limited — 20 req/min for users, 10 req/min per IP for guests.
 * SEV-005: Internal errors are logged only, not sent to client.
 */
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@/Features/Auth/Auth.Config';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { CheckRateLimit, AI_RATE_LIMIT } from '@/Shared/Middleware/RateLimit.Middleware';
import { streamChat, type ChatMessage } from '@/lib/ai/Providers';
import { MascotChatSchema } from './Mascot.Schemas';
import { BuildMascotSystemPromptCached } from './Mascot.Service';
import { BuildCacheKey, CheckCache, BumpCacheHit, SaveToCache, GetPageKey } from '@/lib/ai/Cache.Service';
import { MascotTools, ClassifyTaskType } from '@/lib/ai/Tools';
import { HandleTool } from '@/lib/ai/ToolHandlers';

const GUEST_RATE_LIMIT = { MaxRequests: 10, WindowMs: 60_000 };

/**
 * POST /api/v1/mascot — streams mascot response using platform AI providers.
 * Accessible to all visitors (guests and authenticated users).
 */
export async function PostMascotChat(Req: NextRequest): Promise<NextResponse | Response> {
  // Optional auth — guests can use the mascot too
  const Session = await auth.api.getSession({ headers: Req.headers }).catch(() => null);

  // Rate limit: by user ID if logged in, by IP for guests
  const RateLimitKey = Session?.user?.id
    ?? (Req.headers.get('x-forwarded-for') ?? Req.headers.get('x-real-ip') ?? 'unknown-ip');
  const Config = Session?.user?.id ? AI_RATE_LIMIT : GUEST_RATE_LIMIT;

  const RateLimitResponse = await CheckRateLimit(Req, RateLimitKey, Config);
  if (RateLimitResponse) return RateLimitResponse;

  const Body = await ParseBodyOrBadRequest(Req, MascotChatSchema);
  if (Body instanceof NextResponse) return Body;

  const SystemPrompt = await BuildMascotSystemPromptCached(Body.Pathname, Body.Locale);
  const TrimmedMessages = Body.Messages.slice(-12) as ChatMessage[];
  const Encoder = new TextEncoder();
  const IsDebug = process.env.AI_DEBUG === 'true';

  // Get the last user message (the actual question to cache)
  const LastUserMsg = Body.Messages.filter(m => m.role === 'user').at(-1);
  const PageKey = GetPageKey(Body.Pathname);

  if (LastUserMsg) {
    const CacheKey = await BuildCacheKey(LastUserMsg.content, PageKey, Body.Locale);
    const CacheHit = await CheckCache(CacheKey);

    if (CacheHit) {
      // Serve from cache — same SSE format as live response
      BumpCacheHit(CacheHit.Id);
      const Enc = new TextEncoder();
      return new Response(
        new ReadableStream({
          start(Ctrl) {
            Ctrl.enqueue(Enc.encode(`data: ${JSON.stringify({ text: CacheHit.Answer })}\n\n`));
            Ctrl.enqueue(Enc.encode('data: [DONE]\n\n'));
            Ctrl.close();
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } },
      );
    }

    // Classify task type for future Provider Router use (logged for now)
    const TaskType = ClassifyTaskType(LastUserMsg.content);
    console.log(`[Mascot] TaskType: ${TaskType}`);

    // Cache miss — run AI and save result
    let FullResponse = '';

    // If Anthropic is available, run the tool-use loop first (non-streaming),
    // then emit the final text as a single SSE chunk.
    // Otherwise fall back to the provider-agnostic streamChat.
    if (process.env.ANTHROPIC_API_KEY) {
      const AnthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const UserId = Session?.user?.id;

      // Build Anthropic-typed messages — separate from ChatMessage[] to allow tool_result blocks
      const AnthropicMessages: Anthropic.MessageParam[] = TrimmedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        let AnthropicResponse = await AnthropicClient.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: SystemPrompt,
          messages: AnthropicMessages,
          tools: MascotTools as unknown as Anthropic.Tool[],
        });

        // Tool-use loop: keep resolving tool calls until AI is done
        while (AnthropicResponse.stop_reason === 'tool_use') {
          const ToolUseBlocks = AnthropicResponse.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
          );

          const ToolResults = await Promise.all(
            ToolUseBlocks.map(async (Block) => {
              const Result = await HandleTool(
                Block.name,
                Block.input as Record<string, unknown>,
                UserId,
              );
              return {
                type: 'tool_result' as const,
                tool_use_id: Block.id,
                content: Result.content,
              };
            }),
          );

          AnthropicMessages.push({ role: 'assistant', content: AnthropicResponse.content });
          AnthropicMessages.push({ role: 'user', content: ToolResults });

          AnthropicResponse = await AnthropicClient.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            system: SystemPrompt,
            messages: AnthropicMessages,
            tools: MascotTools as unknown as Anthropic.Tool[],
          });
        }

        // Extract final text from last response
        for (const Block of AnthropicResponse.content) {
          if (Block.type === 'text') FullResponse += Block.text;
        }

        // Save to cache (fire-and-forget)
        SaveToCache(CacheKey, LastUserMsg.content, FullResponse, PageKey, Body.Locale);

        const Enc = new TextEncoder();
        return new Response(
          new ReadableStream({
            start(Ctrl) {
              Ctrl.enqueue(Enc.encode(`data: ${JSON.stringify({ text: FullResponse })}\n\n`));
              Ctrl.enqueue(Enc.encode('data: [DONE]\n\n'));
              Ctrl.close();
            },
          }),
          { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } },
        );
      } catch (Err: unknown) {
        console.error('[Mascot] Anthropic tool-use error:', Err);
        // Fall through to streamChat below
      }
    }

    // Fallback: provider-agnostic streaming (no tool use)
    const OriginalStream = new ReadableStream({
      async start(Controller) {
        try {
          for await (const Text of streamChat(SystemPrompt, TrimmedMessages, IsDebug ? (info) => {
            Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ debug: info })}\n\n`));
          } : undefined)) {
            FullResponse += Text;
            Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ text: Text })}\n\n`));
          }
          // Save to cache after successful stream (fire-and-forget)
          SaveToCache(CacheKey, LastUserMsg.content, FullResponse, PageKey, Body.Locale);
        } catch (Err: unknown) {
          console.error('[Mascot] Stream error:', Err);
          Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ error: 'AI unavailable' })}\n\n`));
        } finally {
          Controller.enqueue(Encoder.encode('data: [DONE]\n\n'));
          Controller.close();
        }
      },
    });
    return new Response(OriginalStream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  }

  // Fallback: no user message found — run AI without caching
  const Stream = new ReadableStream({
    async start(Controller) {
      try {
        for await (const Text of streamChat(SystemPrompt, TrimmedMessages, IsDebug ? (info) => {
          Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ debug: info })}\n\n`));
        } : undefined)) {
          Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ text: Text })}\n\n`));
        }
      } catch (Err: unknown) {
        console.error('[Mascot] Stream error:', Err);
        Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ error: 'AI unavailable' })}\n\n`));
      } finally {
        Controller.enqueue(Encoder.encode('data: [DONE]\n\n'));
        Controller.close();
      }
    },
  });

  return new Response(Stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
