/**
 * Auth.Config.ts
 * Better Auth server configuration.
 * Email verification is required — no bot accounts.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db/Index';
import * as Schema from '@/lib/db/Schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: Schema.users,
      session: Schema.sessions,
      account: Schema.accounts,
      verification: Schema.verificationTokens,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: implement email sending via SMTP
      // Use process.env.SMTP_* variables
      console.info('[Auth] Verification email for:', user.email, url);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ],
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
});

export type TAuth = typeof auth;
