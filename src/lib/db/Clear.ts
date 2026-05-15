/**
 * Clear.ts
 * Full database cleanup:
 * 1. Drops all application tables
 * 2. Drops the drizzle migrations schema (so migrations can be re-applied fresh)
 * 3. Deletes all generated migration files in ./drizzle/
 * Run: bun run db:clear
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { sql } from 'drizzle-orm';
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { db } from './Index';

async function Clear() {
  console.log('🗑️  Clearing database...');

  // Drop ALL schemas except system schemas — this removes tables, views, sequences, types, routines, etc.
  // We keep 'information_schema', 'pg_catalog', 'pg_toast' (PostgreSQL system schemas).
  // We also drop the 'drizzle' schema (migration history).
  await db.execute(sql`
    DO $$
    DECLARE
      SchemaName TEXT;
    BEGIN
      FOR SchemaName IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      LOOP
        EXECUTE 'DROP SCHEMA IF EXISTS "' || SchemaName || '" CASCADE';
      END LOOP;
    END
    $$;
  `);
  console.log('  ✓ All schemas dropped (tables, views, sequences, types, routines, etc.)');

  // Re-create the public schema (required for the app to work)
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS public`);
  console.log('  ✓ Public schema recreated');

  // Delete generated migration files
  const DrizzleDir = join(process.cwd(), 'drizzle');
  if (existsSync(DrizzleDir)) {
    rmSync(DrizzleDir, { recursive: true, force: true });
    console.log('  ✓ Migration files deleted');
  }

  console.log('✅ Database fully cleared.\n');
  process.exit(0);
}

Clear().catch((Err) => { console.error('❌ Clear failed:', Err); process.exit(1); });
