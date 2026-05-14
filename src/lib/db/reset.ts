/**
 * db:reset — drops all tables and clears migration files.
 * Run before db:generate + db:migrate + db:seed to get a clean slate.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { sql } from 'drizzle-orm';
import { db } from './index';
import fs from 'fs';
import path from 'path';

const TABLES_IN_DROP_ORDER = [
  'user_achievements',
  'user_stats',
  'user_progress',
  'quiz_options',
  'quiz_questions',
  'lessons',
  'agents',
  'achievements',
  'verification_tokens',
  'accounts',
  'sessions',
  'users',
];

async function reset() {
  console.log('🗑️  Dropping all tables...');

  for (const table of TABLES_IN_DROP_ORDER) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE;`));
    console.log(`   ✓ dropped ${table}`);
  }

  // Drop Drizzle's internal migration tracking table
  await db.execute(sql.raw(`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;`));

  console.log('\n🗑️  Clearing migration files...');
  const migrationsDir = path.join(process.cwd(), 'drizzle');

  if (fs.existsSync(migrationsDir)) {
    const entries = fs.readdirSync(migrationsDir);
    for (const entry of entries) {
      const fullPath = path.join(migrationsDir, entry);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`   ✓ removed drizzle/${entry}`);
    }
  } else {
    console.log('   (no drizzle/ directory found, skipping)');
  }

  console.log('\n✅ Reset complete — DB is clean.\n');
  process.exit(0);
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
