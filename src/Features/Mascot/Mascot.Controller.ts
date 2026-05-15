/**
 * Mascot.Controller.ts
 * SSE streaming handler for the AI mascot chat.
 *
 * SEV-002: Rate limited to 20 requests/minute per user.
 * SEV-005: Internal errors are logged only, not sent to client.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { CheckRateLimit, AI_RATE_LIMIT } from '@/Shared/Middleware/RateLimit.Middleware';
import { streamChat, type ChatMessage } from '@/lib/ai/Providers';
import { MascotChatSchema } from './Mascot.Schemas';
import { BuildMascotSystemPrompt } from './Mascot.Service';

/**
 * POST /api/v1/mascot — streams mascot response using platform AI providers.
 */
export async function PostMascotChat(Req: NextRequest): Promise<NextResponse | Response> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  // SEV-002: Apply rate limit per user
  const RateLimitResponse = await CheckRateLimit(Req, Session.user.id, AI_RATE_LIMIT);
  if (RateLimitResponse) return RateLimitResponse;

  const Body = await ParseBodyOrBadRequest(Req, MascotChatSchema);
  if (Body instanceof NextResponse) return Body;

  const SystemPrompt = await BuildMascotSystemPrompt(Body.Pathname, Body.Locale);
  const TrimmedMessages = Body.Messages.slice(-12) as ChatMessage[];
  const Encoder = new TextEncoder();

  const Stream = new ReadableStream({
    async start(Controller) {
      try {
        for await (const Text of streamChat(SystemPrompt, TrimmedMessages)) {
          Controller.enqueue(Encoder.encode(`data: ${JSON.stringify({ text: Text })}\n\n`));
        }
      } catch (Err: unknown) {
        // SEV-005: Log full error server-side, send generic message to client
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
