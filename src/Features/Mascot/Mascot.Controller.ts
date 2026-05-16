/**
 * Mascot.Controller.ts
 * SSE streaming handler for the AI mascot chat.
 *
 * Works for both authenticated users and guests.
 * SEV-002: Rate limited — 20 req/min for users, 10 req/min per IP for guests.
 * SEV-005: Internal errors are logged only, not sent to client.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/Features/Auth/Auth.Config';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { CheckRateLimit, AI_RATE_LIMIT } from '@/Shared/Middleware/RateLimit.Middleware';
import { streamChat, type ChatMessage } from '@/lib/ai/Providers';
import { MascotChatSchema } from './Mascot.Schemas';
import { BuildMascotSystemPromptCached } from './Mascot.Service';
import { BuildCacheKey, CheckCache, BumpCacheHit, SaveToCache, GetPageKey } from '@/Lib/Ai/Cache.Service';

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

    // Cache miss — run AI and save result
    let FullResponse = '';
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
