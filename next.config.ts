/**
 * next.config.ts
 * Next.js configuration — security headers, i18n plugin, Sentry instrumentation.
 */
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const WithNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

// SEV-016 — Security headers applied to all routes
const SecurityHeaders = [
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
];

const NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: SecurityHeaders }];
  },
};

const ConfigWithNextIntl = WithNextIntl(NextConfig);

export default withSentryConfig(ConfigWithNextIntl, {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
