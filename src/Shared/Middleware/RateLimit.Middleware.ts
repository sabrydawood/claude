/**
 * RateLimit.Middleware.ts
 * In-memory sliding window rate limiter per user.
 * Returns a localized 429 response when the limit is exceeded.
 *
 * For multi-instance deployments: replace the Map with Redis (Upstash).
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetRequestError } from '@/lib/i18n/Api.Errors';

export interface IRateLimitConfig {
  /** Maximum requests allowed within the window */
  MaxRequests: number;
  /** Window size in milliseconds */
  WindowMs: number;
}

/** Default AI endpoint rate limit: 20 requests per minute per user */
export const AI_RATE_LIMIT: IRateLimitConfig = {
  MaxRequests: 20,
  WindowMs: 60_000,
};

// Sliding window store: key → array of request timestamps
const RequestStore = new Map<string, number[]>();

/**
 * Checks if a user has exceeded their rate limit.
 * Returns a localized 429 NextResponse if limited, null if allowed.
 * @param Req - Incoming NextRequest (used for locale detection)
 * @param UserId - Unique user identifier
 * @param Config - Rate limit configuration (defaults to AI_RATE_LIMIT)
 */
export async function CheckRateLimit(
  Req: NextRequest,
  UserId: string,
  Config: IRateLimitConfig = AI_RATE_LIMIT,
): Promise<NextResponse | null> {
  const Now = Date.now();
  const WindowStart = Now - Config.WindowMs;
  const Key = `${UserId}:${Config.WindowMs}`;

  const Timestamps = (RequestStore.get(Key) ?? []).filter((T) => T > WindowStart);
  Timestamps.push(Now);
  RequestStore.set(Key, Timestamps);

  if (Timestamps.length > Config.MaxRequests) {
    const RetryAfter = Math.ceil(Config.WindowMs / 1000);
    const Error = await GetRequestError(Req, 'RATE_LIMITED');
    return NextResponse.json(
      { Success: false, Error },
      { status: 429, headers: { 'Retry-After': String(RetryAfter) } },
    );
  }
  return null;
}
