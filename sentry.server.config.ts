/**
 * sentry.server.config.ts
 * Sentry initialization for the server (Node.js) side.
 * Sample rates are reduced in production to control cost.
 */
import * as Sentry from '@sentry/nextjs';

const IsProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,
  tracesSampleRate:   IsProd ? 0.1  : 1.0,
  profilesSampleRate: IsProd ? 0.05 : 1.0,
});
