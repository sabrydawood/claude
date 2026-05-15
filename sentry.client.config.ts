/**
 * sentry.client.config.ts
 * Sentry initialization for the client (browser) side.
 * Sample rates are reduced in production to control cost and performance.
 */
import * as Sentry from '@sentry/nextjs';

// SEV-007 — Conditional sample rates: 100% in dev, reduced in production
const IsProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,
  tracesSampleRate:         IsProd ? 0.1  : 1.0,
  profilesSampleRate:       IsProd ? 0.05 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: IsProd ? 0.1  : 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
