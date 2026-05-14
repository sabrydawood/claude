import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  serial,
  uuid,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Auth tables (better-auth compatible) ─────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
});

export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// ─── Translations table ────────────────────────────────────────────────────────
//
//  Single table for ALL translatable strings across the entire app.
//  Adding a new language = INSERT rows with new locale. Zero schema changes.
//
//  entity_type: 'agent' | 'lesson' | 'quiz_question' | 'quiz_option' | 'achievement'
//  field:       e.g. 'name' | 'description' | 'full_description' | 'content' | 'question' | 'text'
//  locale:      BCP-47 code e.g. 'ar' | 'en' | 'fr' | 'de' | 'ur' ...

export const translations = pgTable(
  'translations',
  {
    id: serial('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: integer('entity_id').notNull(),
    locale: text('locale').notNull(),
    field: text('field').notNull(),
    value: text('value').notNull(),
  },
  (t) => [
    // One value per (entity, locale, field) — no duplicates
    unique('uq_translations').on(t.entityType, t.entityId, t.locale, t.field),
    // Fast lookup by locale
    index('idx_translations_locale').on(t.locale),
    // Fast lookup by entity
    index('idx_translations_entity').on(t.entityType, t.entityId),
  ],
);

// ─── Agents ───────────────────────────────────────────────────────────────────
//  Non-translatable columns only. All text lives in translations.

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  color: text('color').notNull(),
  emoji: text('emoji').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  order: integer('order').default(0).notNull(),
  xpReward: integer('xp_reward').default(50).notNull(),
  estimatedMinutes: integer('estimated_minutes').default(5).notNull(),
});

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['multiple_choice', 'true_false'] }).notNull(),
  order: integer('order').default(0).notNull(),
});

export const quizOptions = pgTable('quiz_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .notNull()
    .references(() => quizQuestions.id, { onDelete: 'cascade' }),
  isCorrect: boolean('is_correct').default(false).notNull(),
  order: integer('order').default(0).notNull(),
});

// ─── Achievements ─────────────────────────────────────────────────────────────

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  emoji: text('emoji').notNull(),
  conditionType: text('condition_type').notNull(),
  conditionValue: integer('condition_value').notNull(),
});

// ─── User data ────────────────────────────────────────────────────────────────

export const userProgress = pgTable('user_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lessonId: integer('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  completed: boolean('completed').default(false).notNull(),
  score: integer('score').default(0).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userStats = pgTable('user_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  totalXp: integer('total_xp').default(0).notNull(),
  streakDays: integer('streak_days').default(0).notNull(),
  lastActivityDate: timestamp('last_activity_date'),
  lessonsCompleted: integer('lessons_completed').default(0).notNull(),
  quizzesCompleted: integer('quizzes_completed').default(0).notNull(),
});

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id')
    .notNull()
    .references(() => achievements.id, { onDelete: 'cascade' }),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
});

// ─── Relations (for Drizzle relational queries) ───────────────────────────────

export const agentsRelations = relations(agents, ({ many }) => ({
  lessons: many(lessons),
  translations: many(translations),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  agent: one(agents, { fields: [lessons.agentId], references: [agents.id] }),
  questions: many(quizQuestions),
  translations: many(translations),
  userProgress: many(userProgress),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  lesson: one(lessons, { fields: [quizQuestions.lessonId], references: [lessons.id] }),
  options: many(quizOptions),
  translations: many(translations),
}));

export const quizOptionsRelations = relations(quizOptions, ({ one, many }) => ({
  question: one(quizQuestions, { fields: [quizOptions.questionId], references: [quizQuestions.id] }),
  translations: many(translations),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  translations: many(translations),
  userAchievements: many(userAchievements),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  progress: many(userProgress),
  stats: one(userStats),
  achievements: many(userAchievements),
}));

// ─── TypeScript types ─────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizOption = typeof quizOptions.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Translation = typeof translations.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;

// Useful type for a row returned from translations
export type TranslationMap = Record<string, string>;
