/**
 * Auth.Middleware.ts
 * Session validation middleware — returns authenticated session or localized 401 response.
 * The error message is translated based on the request's locale header.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/Features/Auth/Auth.Config';
import { GetRequestError } from '@/lib/i18n/Api.Errors';

export type TAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Validates the session from request headers.
 * Returns the session if valid, or a localized NextResponse 401 if not authenticated.
 * @param Req - Incoming NextRequest (used for both session check and locale detection)
 */
export async function GetSessionOrUnauthorized(
  Req: NextRequest,
): Promise<NonNullable<TAuthSession> | NextResponse> {
  const Session = await auth.api.getSession({ headers: Req.headers });
  if (!Session?.user?.id) {
    const Error = await GetRequestError(Req, 'UNAUTHORIZED');
    return NextResponse.json({ Success: false, Error }, { status: 401 });
  }
  return Session;
}
