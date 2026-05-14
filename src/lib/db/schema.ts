import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  serial,
  uuid,
} from 'drizzle-orm/pg-core';

// ---- Auth tables (better-auth compatible) ----

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

// ---- App tables ----

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionAr: text('description_ar').notNull(),
  descriptionEn: text('description_en').notNull(),
  color: text('color').notNull(),
  emoji: text('emoji').notNull(),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionAr: text('description_ar').notNull(),
  descriptionEn: text('description_en').notNull(),
  contentAr: text('content_ar').notNull(),
  contentEn: text('content_en').notNull(),
  order: integer('order').default(0),
  xpReward: integer('xp_reward').default(50),
  estimatedMinutes: integer('estimated_minutes').default(5),
});

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  questionAr: text('question_ar').notNull(),
  questionEn: text('question_en').notNull(),
  type: text('type', { enum: ['multiple_choice', 'true_false'] }).notNull(),
});

export const quizOptions = pgTable('quiz_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .notNull()
    .references(() => quizQuestions.id, { onDelete: 'cascade' }),
  textAr: text('text_ar').notNull(),
  textEn: text('text_en').notNull(),
  isCorrect: boolean('is_correct').default(false),
});

export const userProgress = pgTable('user_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lessonId: integer('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  completed: boolean('completed').default(false),
  score: integer('score').default(0),
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
  totalXp: integer('total_xp').default(0),
  streakDays: integer('streak_days').default(0),
  lastActivityDate: timestamp('last_activity_date'),
  lessonsCompleted: integer('lessons_completed').default(0),
  quizzesCompleted: integer('quizzes_completed').default(0),
});

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionAr: text('description_ar').notNull(),
  descriptionEn: text('description_en').notNull(),
  emoji: text('emoji').notNull(),
  conditionType: text('condition_type').notNull(),
  conditionValue: integer('condition_value').notNull(),
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

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizOption = typeof quizOptions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
