/**
 * Reset.ts
 * Drops all custom tables (preserves Better Auth tables for dev convenience).
 * Run: bun run db:reset
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { sql } from 'drizzle-orm';
import { db } from './Index';

async function Reset() {
  console.log('🗑️  Dropping all tables...');
  await db.execute(sql`
    DROP TABLE IF EXISTS
      "UserAchievements", "UserStats", "UserProgress", "SandboxSessions",
      "EncryptedKeys", "LearningPaths", "UserPreferences",
      "AchievementTranslations", "Achievements",
      "TrackTranslations", "Tracks",
      "QuizOptionTranslations", "QuizOptions",
      "QuizQuestionTranslations", "QuizQuestions",
      "LessonTranslations", "Lessons",
      "AgentTranslations", "Agents",
      verification_tokens, accounts, sessions, users
    CASCADE
  `);
  console.log('✅ All tables dropped.');
  process.exit(0);
}

Reset().catch((Err) => { console.error(Err); process.exit(1); });
