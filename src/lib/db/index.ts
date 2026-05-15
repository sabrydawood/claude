/**
 * Index.ts
 * Database connection — Drizzle ORM + postgres.js client.
 * prepare: false required for transaction pool mode (Supabase, PgBouncer).
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as Schema from './Schema';

const Client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(Client, { schema: Schema });
