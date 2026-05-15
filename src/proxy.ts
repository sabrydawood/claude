import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './lib/i18n/routing';

const handler = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return handler(request);
}

export const config = {
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)',
  ],
};
