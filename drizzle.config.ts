/**
 * drizzle.config.ts
 * Drizzle Kit configuration — points to new PascalCase schema location.
 */
import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

export default {
  schema: './src/Lib/Db/Schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  verbose: true,
  strict: true,
} satisfies Config;
