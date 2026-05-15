/**
 * Index.ts
 * Database connection — Drizzle ORM + postgres.js client.
 * Singleton pattern prevents connection pool exhaustion in dev HMR cycles.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as Schema from './Schema';

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

const Client = globalThis._pgClient ??
  postgres(process.env.DATABASE_URL!, { prepare: false, max: 5, idle_timeout: 20 });

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgClient = Client;
}

export const db = drizzle(Client, { schema: Schema });
