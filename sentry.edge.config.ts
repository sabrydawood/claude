// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever middleware or edge functions run.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profiling is currently in beta, this option is subject to change
  profilesSampleRate: 1.0,
});
