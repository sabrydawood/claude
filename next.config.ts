import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig = {};

// Wrap with next-intl plugin first, then with Sentry for automatic instrumentation
const configWithNextIntl = withNextIntl(nextConfig);

export default withSentryConfig(configWithNextIntl, {
  // Sentry webpack plugin options for source maps upload
  silent: !process.env.CI, // Suppress logs in dev, show in CI
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
