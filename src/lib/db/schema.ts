/**
 * Schema.ts
 * Full Drizzle ORM schema for Zkawi platform.
 *
 * Conventions:
 * - Better Auth tables: snake_case SQL names + camelCase JS props (framework requirement)
 * - All other tables: PascalCase SQL names + PascalCase JS props
 * - All content/user PKs: uuidv7 (time-sortable, better index performance)
 * - Soft delete: IsDeleted boolean on all content tables
 * - Per-entity translation tables (no universal EAV translations table)
 */
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  unique,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// ─── Better Auth tables ───────────────────────────────────────────────────────
// camelCase JS props required by Better Auth's Drizzle adapter.

export const users = pgTable('users', {
  id:            uuid('id').defaultRandom().primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image:         text('image'),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id:        text('id').primaryKey(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:     text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id:           text('id').primaryKey(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId:    text('account_id').notNull(),
  providerId:   text('provider_id').notNull(),
  accessToken:  text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt:    timestamp('expires_at'),
  password:     text('password'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
});

// ─── Agents ───────────────────────────────────────────────────────────────────

export const Agents = pgTable('Agents', {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Slug:      text('Slug').notNull().unique(),
  Color:     text('Color').notNull(),
  Icon:      text('Icon').notNull(),
  IsActive:  boolean('IsActive').default(true).notNull(),
  Order:     integer('Order').default(0).notNull(),
  IsDeleted: boolean('IsDeleted').default(false).notNull(),
  CreatedAt: timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const AgentTranslations = pgTable(
  'AgentTranslations',
  {
    Id:              uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    AgentId:         uuid('AgentId').notNull().references(() => Agents.Id, { onDelete: 'cascade' }),
    Locale:          text('Locale').notNull(),
    Name:            text('Name').notNull(),
    Description:     text('Description').notNull().default(''),
    FullDescription: text('FullDescription').notNull().default(''),
  },
  (T) => [
    unique('Uq_AgentTranslations_AgentLocale').on(T.AgentId, T.Locale),
    index('Idx_AgentTranslations_Locale').on(T.Locale),
    index('Idx_AgentTranslations_AgentId').on(T.AgentId),
  ],
);

// ─── Subjects ────────────────────────────────────────────────────────────────

export const Subjects = pgTable('Subjects', {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Slug:      text('Slug').notNull().unique(),
  Icon:      text('Icon').notNull().default('BookOpen'),
  Color:     text('Color').notNull().default('#7C3AED'),
  Order:     integer('Order').default(0).notNull(),
  IsActive:  boolean('IsActive').default(true).notNull(),
  IsDeleted: boolean('IsDeleted').default(false).notNull(),
  CreatedAt: timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const SubjectTranslations = pgTable(
  'SubjectTranslations',
  {
    Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    SubjectId:   uuid('SubjectId').notNull().references(() => Subjects.Id, { onDelete: 'cascade' }),
    Locale:      text('Locale').notNull(),
    Name:        text('Name').notNull(),
    Description: text('Description').notNull().default(''),
  },
  (T) => [
    unique('Uq_SubjectTrans').on(T.SubjectId, T.Locale),
    index('Idx_SubjectTrans_SubjectId').on(T.SubjectId),
  ],
);

// ─── Courses ──────────────────────────────────────────────────────────────────

export const Courses = pgTable('Courses', {
  Id:             uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  SubjectId:      uuid('SubjectId').notNull().references(() => Subjects.Id, { onDelete: 'cascade' }),
  Order:          integer('Order').default(0).notNull(),
  Difficulty:     integer('Difficulty').default(1).notNull(),
  EstimatedHours: integer('EstimatedHours').default(1).notNull(),
  IsActive:       boolean('IsActive').default(true).notNull(),
  IsDeleted:      boolean('IsDeleted').default(false).notNull(),
  CreatedAt:      timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const CourseTranslations = pgTable(
  'CourseTranslations',
  {
    Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    CourseId:    uuid('CourseId').notNull().references(() => Courses.Id, { onDelete: 'cascade' }),
    Locale:      text('Locale').notNull(),
    Name:        text('Name').notNull(),
    Description: text('Description').notNull().default(''),
  },
  (T) => [
    unique('Uq_CourseTrans').on(T.CourseId, T.Locale),
    index('Idx_CourseTrans_CourseId').on(T.CourseId),
  ],
);

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const Lessons = pgTable('Lessons', {
  Id:               uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  AgentId:          uuid('AgentId').references(() => Agents.Id, { onDelete: 'set null' }),
  CourseId:         uuid('CourseId').references(() => Courses.Id),
  Order:            integer('Order').default(0).notNull(),
  XpReward:         integer('XpReward').default(50).notNull(),
  EstimatedMinutes: integer('EstimatedMinutes').default(5).notNull(),
  Difficulty:       integer('Difficulty').default(1),
  IsDeleted:        boolean('IsDeleted').default(false).notNull(),
});

export const LessonTranslations = pgTable(
  'LessonTranslations',
  {
    Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    LessonId:    uuid('LessonId').notNull().references(() => Lessons.Id, { onDelete: 'cascade' }),
    Locale:      text('Locale').notNull(),
    Title:       text('Title').notNull(),
    Description: text('Description').notNull().default(''),
    Content:     text('Content').notNull().default(''),
  },
  (T) => [
    unique('Uq_LessonTranslations_LessonLocale').on(T.LessonId, T.Locale),
    index('Idx_LessonTranslations_Locale').on(T.Locale),
    index('Idx_LessonTranslations_LessonId').on(T.LessonId),
  ],
);

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const QuizQuestions = pgTable('QuizQuestions', {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  LessonId:  uuid('LessonId').notNull().references(() => Lessons.Id, { onDelete: 'cascade' }),
  Type:      text('Type', { enum: ['multiple_choice', 'true_false'] }).notNull(),
  Order:     integer('Order').default(0).notNull(),
  IsDeleted: boolean('IsDeleted').default(false).notNull(),
});

export const QuizQuestionTranslations = pgTable(
  'QuizQuestionTranslations',
  {
    Id:         uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    QuestionId: uuid('QuestionId').notNull().references(() => QuizQuestions.Id, { onDelete: 'cascade' }),
    Locale:     text('Locale').notNull(),
    Question:   text('Question').notNull(),
  },
  (T) => [
    unique('Uq_QQTrans_QuestionLocale').on(T.QuestionId, T.Locale),
    index('Idx_QQTrans_QuestionId').on(T.QuestionId),
  ],
);

export const QuizOptions = pgTable('QuizOptions', {
  Id:         uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  QuestionId: uuid('QuestionId').notNull().references(() => QuizQuestions.Id, { onDelete: 'cascade' }),
  IsCorrect:  boolean('IsCorrect').default(false).notNull(),
  Order:      integer('Order').default(0).notNull(),
});

export const QuizOptionTranslations = pgTable(
  'QuizOptionTranslations',
  {
    Id:       uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    OptionId: uuid('OptionId').notNull().references(() => QuizOptions.Id, { onDelete: 'cascade' }),
    Locale:   text('Locale').notNull(),
    Text:     text('Text').notNull(),
  },
  (T) => [
    unique('Uq_QOTrans_OptionLocale').on(T.OptionId, T.Locale),
    index('Idx_QOTrans_OptionId').on(T.OptionId),
  ],
);

// ─── Learning Tracks ──────────────────────────────────────────────────────────

export const Tracks = pgTable('Tracks', {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Slug:      text('Slug').notNull().unique(),
  Icon:      text('Icon').notNull(),
  Order:     integer('Order').default(0).notNull(),
  IsDefault: boolean('IsDefault').default(false).notNull(),
  IsDeleted: boolean('IsDeleted').default(false).notNull(),
  CreatedAt: timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const TrackTranslations = pgTable(
  'TrackTranslations',
  {
    Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    TrackId:     uuid('TrackId').notNull().references(() => Tracks.Id, { onDelete: 'cascade' }),
    Locale:      text('Locale').notNull(),
    Name:        text('Name').notNull(),
    Description: text('Description').notNull().default(''),
  },
  (T) => [
    unique('Uq_TrackTranslations_TrackLocale').on(T.TrackId, T.Locale),
    index('Idx_TrackTranslations_TrackId').on(T.TrackId),
  ],
);

// ─── Achievements ─────────────────────────────────────────────────────────────

export const Achievements = pgTable('Achievements', {
  Id:             uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Icon:           text('Icon').notNull(),
  ConditionType:  text('ConditionType').notNull(),
  ConditionValue: integer('ConditionValue').notNull(),
  IsDeleted:      boolean('IsDeleted').default(false).notNull(),
});

export const AchievementTranslations = pgTable(
  'AchievementTranslations',
  {
    Id:            uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    AchievementId: uuid('AchievementId').notNull().references(() => Achievements.Id, { onDelete: 'cascade' }),
    Locale:        text('Locale').notNull(),
    Name:          text('Name').notNull(),
    Description:   text('Description').notNull().default(''),
  },
  (T) => [
    unique('Uq_AchTrans_AchLocale').on(T.AchievementId, T.Locale),
    index('Idx_AchTrans_AchievementId').on(T.AchievementId),
  ],
);

// ─── User Data ────────────────────────────────────────────────────────────────

export const UserPreferences = pgTable('UserPreferences', {
  Id:                  uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  UserId:              uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  AgeGroup:            text('AgeGroup', { enum: ['child', 'teen', 'adult'] }).notNull().default('adult'),
  Goal:                text('Goal', { enum: ['chat', 'work', 'creative', 'developer', 'educator'] }).notNull().default('chat'),
  Experience:          text('Experience', { enum: ['none', 'some', 'advanced'] }).notNull().default('none'),
  LearningStyle:       text('LearningStyle', { enum: ['visual', 'reading', 'practice', 'game'] }).notNull().default('practice'),
  DailyMinutes:        integer('DailyMinutes').default(15).notNull(),
  PreferredLocale:     text('PreferredLocale').default('ar').notNull(),
  OnboardingCompleted: boolean('OnboardingCompleted').default(false).notNull(),
  CreatedAt:           timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
  UpdatedAt:           timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const LearningPaths = pgTable(
  'LearningPaths',
  {
    Id:              uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    UserId:          uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    TrackId:         uuid('TrackId').notNull().references(() => Tracks.Id, { onDelete: 'cascade' }),
    LessonOrder:     jsonb('LessonOrder').notNull().default([]),
    CurrentLessonId: uuid('CurrentLessonId').references(() => Lessons.Id, { onDelete: 'set null' }),
    IsActive:        boolean('IsActive').default(true).notNull(),
    GeneratedAt:     timestamp('GeneratedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (T) => [
    // SEV-004: Compound index for active learning path lookups
    index('Idx_LearningPaths_UserActive').on(T.UserId, T.IsActive),
  ],
);

export const EncryptedKeys = pgTable('EncryptedKeys', {
  Id:           uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  UserId:       uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  EncryptedKey: text('EncryptedKey').notNull(),
  KeyHint:      text('KeyHint').notNull(),
  Provider:     text('Provider').notNull().default('anthropic'),
  CreatedAt:    timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
  UpdatedAt:    timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const SandboxSessions = pgTable(
  'SandboxSessions',
  {
    Id:            uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    UserId:        uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    Model:         text('Model').default('claude-haiku-4-5-20251001').notNull(),
    MessagesCount: integer('MessagesCount').default(0).notNull(),
    TokensUsed:    integer('TokensUsed').default(0).notNull(),
    CreatedAt:     timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (T) => [
    index('Idx_SandboxSessions_UserId').on(T.UserId),
  ],
);

export const UserProgress = pgTable(
  'UserProgress',
  {
    Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    UserId:      uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    LessonId:    uuid('LessonId').notNull().references(() => Lessons.Id, { onDelete: 'cascade' }),
    Completed:   boolean('Completed').default(false).notNull(),
    Score:       integer('Score').default(0).notNull(),
    CompletedAt: timestamp('CompletedAt', { withTimezone: true }),
    CreatedAt:   timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
    UpdatedAt:   timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (T) => [
    // SEV-004: Fast userId lookup
    index('Idx_UserProgress_UserId').on(T.UserId),
    // SEV-011: UNIQUE prevents race condition duplicate rows — enables safe UPSERT
    unique('Uq_UserProgress_UserLesson').on(T.UserId, T.LessonId),
  ],
);

export const UserStats = pgTable('UserStats', {
  Id:               uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  UserId:           uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  TotalXp:          integer('TotalXp').default(0).notNull(),
  StreakDays:       integer('StreakDays').default(0).notNull(),
  LastActivityDate: timestamp('LastActivityDate', { withTimezone: true }),
  LessonsCompleted: integer('LessonsCompleted').default(0).notNull(),
  QuizzesCompleted: integer('QuizzesCompleted').default(0).notNull(),
});

export const UserAchievements = pgTable(
  'UserAchievements',
  {
    Id:            uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    UserId:        uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    AchievementId: uuid('AchievementId').notNull().references(() => Achievements.Id, { onDelete: 'cascade' }),
    EarnedAt:      timestamp('EarnedAt', { withTimezone: true }).defaultNow().notNull(),
  },
  (T) => [
    // SEV-004: Fast achievement lookup per user
    index('Idx_UserAchievements_UserId').on(T.UserId),
    // Prevent duplicate achievements
    unique('Uq_UserAchievements_UserAch').on(T.UserId, T.AchievementId),
  ],
);

// ─── System Prompts ───────────────────────────────────────────────────────────

export const SystemPrompts = pgTable('SystemPrompts', {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Key:       text('Key').notNull().unique(),
  Content:   text('Content').notNull(),
  Locale:    text('Locale').notNull().default('ar'),
  IsActive:  boolean('IsActive').default(true).notNull(),
  UpdatedAt: timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
  UpdatedBy: text('UpdatedBy'),
});

// ─── User Course Progress ─────────────────────────────────────────────────────

export const UserCourseProgress = pgTable(
  'UserCourseProgress',
  {
    Id:               uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
    UserId:           uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    CourseId:         uuid('CourseId').notNull().references(() => Courses.Id, { onDelete: 'cascade' }),
    CompletedLessons: integer('CompletedLessons').default(0).notNull(),
    TotalXp:          integer('TotalXp').default(0).notNull(),
    StartedAt:        timestamp('StartedAt', { withTimezone: true }).defaultNow().notNull(),
    CompletedAt:      timestamp('CompletedAt', { withTimezone: true }),
  },
  (T) => [
    index('Idx_UCProgress_UserId').on(T.UserId),
    unique('Uq_UCProgress_UserCourse').on(T.UserId, T.CourseId),
  ],
);

// ─── Exercises ────────────────────────────────────────────────────────────────

export const Exercises = pgTable('Exercises', {
  Id:         uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  LessonId:   uuid('LessonId').references(() => Lessons.Id, { onDelete: 'cascade' }),
  CourseId:   uuid('CourseId').references(() => Courses.Id, { onDelete: 'cascade' }),
  Type:       text('Type', { enum: ['fill_blank', 'arrange_code', 'spot_error', 'build_it'] }).notNull(),
  Difficulty: integer('Difficulty').default(1).notNull(),
  Order:      integer('Order').default(0).notNull(),
  XpReward:   integer('XpReward').default(20).notNull(),
  IsDeleted:  boolean('IsDeleted').default(false).notNull(),
  CreatedAt:  timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const ExerciseTranslations = pgTable('ExerciseTranslations', {
  Id:           uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  ExerciseId:   uuid('ExerciseId').notNull().references(() => Exercises.Id, { onDelete: 'cascade' }),
  Locale:       text('Locale').notNull(),
  Title:        text('Title').notNull(),
  Instructions: text('Instructions').notNull(),
  HintText:     text('HintText').notNull().default(''),
  StarterCode:  text('StarterCode').notNull().default(''),
  SolutionCode: text('SolutionCode').notNull().default(''),
  TestCases:    jsonb('TestCases').$type<{ input: string; expected: string }[]>().notNull().default([]),
}, (T) => [
  unique('Uq_ExTrans_ExLocale').on(T.ExerciseId, T.Locale),
  index('Idx_ExTrans_ExerciseId').on(T.ExerciseId),
]);

export const ExerciseSubmissions = pgTable('ExerciseSubmissions', {
  Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  UserId:      uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ExerciseId:  uuid('ExerciseId').notNull().references(() => Exercises.Id, { onDelete: 'cascade' }),
  Code:        text('Code').notNull().default(''),
  Passed:      boolean('Passed').default(false).notNull(),
  Score:       integer('Score').default(0).notNull(),
  Attempts:    integer('Attempts').default(1).notNull(),
  SubmittedAt: timestamp('SubmittedAt', { withTimezone: true }).defaultNow().notNull(),
}, (T) => [
  index('Idx_ExSub_UserId').on(T.UserId),
  index('Idx_ExSub_ExerciseId').on(T.ExerciseId),
]);

// ─── Relations ────────────────────────────────────────────────────────────────

export const AgentsRelations = relations(Agents, ({ many }) => ({
  Lessons:      many(Lessons),
  Translations: many(AgentTranslations),
}));

export const AgentTranslationsRelations = relations(AgentTranslations, ({ one }) => ({
  Agent: one(Agents, { fields: [AgentTranslations.AgentId], references: [Agents.Id] }),
}));

export const LessonsRelations = relations(Lessons, ({ one, many }) => ({
  Agent:        one(Agents, { fields: [Lessons.AgentId], references: [Agents.Id] }),
  Questions:    many(QuizQuestions),
  Translations: many(LessonTranslations),
  UserProgress: many(UserProgress),
}));

export const LessonTranslationsRelations = relations(LessonTranslations, ({ one }) => ({
  Lesson: one(Lessons, { fields: [LessonTranslations.LessonId], references: [Lessons.Id] }),
}));

export const QuizQuestionsRelations = relations(QuizQuestions, ({ one, many }) => ({
  Lesson:       one(Lessons, { fields: [QuizQuestions.LessonId], references: [Lessons.Id] }),
  Options:      many(QuizOptions),
  Translations: many(QuizQuestionTranslations),
}));

export const QuizOptionsRelations = relations(QuizOptions, ({ one, many }) => ({
  Question:     one(QuizQuestions, { fields: [QuizOptions.QuestionId], references: [QuizQuestions.Id] }),
  Translations: many(QuizOptionTranslations),
}));

export const TracksRelations = relations(Tracks, ({ many }) => ({
  LearningPaths: many(LearningPaths),
  Translations:  many(TrackTranslations),
}));

export const AchievementsRelations = relations(Achievements, ({ many }) => ({
  Translations:     many(AchievementTranslations),
  UserAchievements: many(UserAchievements),
}));

export const UsersRelations = relations(users, ({ many, one }) => ({
  Sessions:        many(sessions),
  Accounts:        many(accounts),
  Progress:        many(UserProgress),
  Stats:           one(UserStats),
  Achievements:    many(UserAchievements),
  Preferences:     one(UserPreferences),
  LearningPaths:   many(LearningPaths),
  EncryptedKey:    one(EncryptedKeys),
  SandboxSessions: many(SandboxSessions),
}));

export const UserProgressRelations = relations(UserProgress, ({ one }) => ({
  User:   one(users, { fields: [UserProgress.UserId], references: [users.id] }),
  Lesson: one(Lessons, { fields: [UserProgress.LessonId], references: [Lessons.Id] }),
}));

export const LearningPathsRelations = relations(LearningPaths, ({ one }) => ({
  User:          one(users, { fields: [LearningPaths.UserId], references: [users.id] }),
  Track:         one(Tracks, { fields: [LearningPaths.TrackId], references: [Tracks.Id] }),
  CurrentLesson: one(Lessons, { fields: [LearningPaths.CurrentLessonId], references: [Lessons.Id] }),
}));

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export type TUser              = typeof users.$inferSelect;
export type TSession           = typeof sessions.$inferSelect;
export type TAgent             = typeof Agents.$inferSelect;
export type TAgentTranslation  = typeof AgentTranslations.$inferSelect;
export type TLesson            = typeof Lessons.$inferSelect;
export type TLessonTranslation = typeof LessonTranslations.$inferSelect;
export type TQuizQuestion      = typeof QuizQuestions.$inferSelect;
export type TQuizOption        = typeof QuizOptions.$inferSelect;
export type TAchievement       = typeof Achievements.$inferSelect;
export type TTrack             = typeof Tracks.$inferSelect;
export type TUserProgress      = typeof UserProgress.$inferSelect;
export type TUserStats         = typeof UserStats.$inferSelect;
export type TUserAchievement   = typeof UserAchievements.$inferSelect;
export type TUserPreferences   = typeof UserPreferences.$inferSelect;
export type TLearningPath      = typeof LearningPaths.$inferSelect;
export type TEncryptedKey      = typeof EncryptedKeys.$inferSelect;
export type TSandboxSession    = typeof SandboxSessions.$inferSelect;
export type TSubject            = typeof Subjects.$inferSelect;
export type TCourse             = typeof Courses.$inferSelect;
export type TSystemPrompt       = typeof SystemPrompts.$inferSelect;
export type TExercise           = typeof Exercises.$inferSelect;
export type TExerciseSubmission = typeof ExerciseSubmissions.$inferSelect;
