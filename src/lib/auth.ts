/**
 * auth.ts
 * Better Auth server-side configuration.
 * generateId uses a function (not the 'uuid' string) so Better Auth generates
 * the ID itself rather than relying on DB defaults — fixing accounts.id issue.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { uuidv7 } from 'uuidv7';
import { db } from './db/Index';
import * as schema from './db/Schema';
import { APP_URL } from '@/lib/utils';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verificationTokens,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || APP_URL,
    APP_URL,
  ],
  advanced: {
    database: {
      generateId: ({ model }) => uuidv7(),
    },
  },
});

export type Auth = typeof auth;
