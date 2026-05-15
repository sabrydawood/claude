CREATE TABLE "AchievementTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"AchievementId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Name" text NOT NULL,
	"Description" text DEFAULT '' NOT NULL,
	CONSTRAINT "Uq_AchTrans_AchLocale" UNIQUE("AchievementId","Locale")
);
--> statement-breakpoint
CREATE TABLE "Achievements" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"Icon" text NOT NULL,
	"ConditionType" text NOT NULL,
	"ConditionValue" integer NOT NULL,
	"IsDeleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AgentTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"AgentId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Name" text NOT NULL,
	"Description" text DEFAULT '' NOT NULL,
	"FullDescription" text DEFAULT '' NOT NULL,
	CONSTRAINT "Uq_AgentTranslations_AgentLocale" UNIQUE("AgentId","Locale")
);
--> statement-breakpoint
CREATE TABLE "Agents" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"Slug" text NOT NULL,
	"Color" text NOT NULL,
	"Icon" text NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"Order" integer DEFAULT 0 NOT NULL,
	"IsDeleted" boolean DEFAULT false NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Agents_Slug_unique" UNIQUE("Slug")
);
--> statement-breakpoint
CREATE TABLE "CourseTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"CourseId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Name" text NOT NULL,
	"Description" text DEFAULT '' NOT NULL,
	CONSTRAINT "Uq_CourseTrans" UNIQUE("CourseId","Locale")
);
--> statement-breakpoint
CREATE TABLE "Courses" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"SubjectId" uuid NOT NULL,
	"Order" integer DEFAULT 0 NOT NULL,
	"Difficulty" integer DEFAULT 1 NOT NULL,
	"EstimatedHours" integer DEFAULT 1 NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"IsDeleted" boolean DEFAULT false NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EncryptedKeys" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"EncryptedKey" text NOT NULL,
	"KeyHint" text NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "EncryptedKeys_UserId_unique" UNIQUE("UserId")
);
--> statement-breakpoint
CREATE TABLE "LearningPaths" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"TrackId" uuid NOT NULL,
	"LessonOrder" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"CurrentLessonId" uuid,
	"IsActive" boolean DEFAULT true NOT NULL,
	"GeneratedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LessonTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"LessonId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Title" text NOT NULL,
	"Description" text DEFAULT '' NOT NULL,
	"Content" text DEFAULT '' NOT NULL,
	CONSTRAINT "Uq_LessonTranslations_LessonLocale" UNIQUE("LessonId","Locale")
);
--> statement-breakpoint
CREATE TABLE "Lessons" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"AgentId" uuid NOT NULL,
	"CourseId" uuid,
	"Order" integer DEFAULT 0 NOT NULL,
	"XpReward" integer DEFAULT 50 NOT NULL,
	"EstimatedMinutes" integer DEFAULT 5 NOT NULL,
	"Difficulty" integer DEFAULT 1,
	"IsDeleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "QuizOptionTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"OptionId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Text" text NOT NULL,
	CONSTRAINT "Uq_QOTrans_OptionLocale" UNIQUE("OptionId","Locale")
);
--> statement-breakpoint
CREATE TABLE "QuizOptions" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"QuestionId" uuid NOT NULL,
	"IsCorrect" boolean DEFAULT false NOT NULL,
	"Order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "QuizQuestionTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"QuestionId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Question" text NOT NULL,
	CONSTRAINT "Uq_QQTrans_QuestionLocale" UNIQUE("QuestionId","Locale")
);
--> statement-breakpoint
CREATE TABLE "QuizQuestions" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"LessonId" uuid NOT NULL,
	"Type" text NOT NULL,
	"Order" integer DEFAULT 0 NOT NULL,
	"IsDeleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SandboxSessions" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"Model" text DEFAULT 'claude-haiku-4-5-20251001' NOT NULL,
	"MessagesCount" integer DEFAULT 0 NOT NULL,
	"TokensUsed" integer DEFAULT 0 NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SubjectTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"SubjectId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Name" text NOT NULL,
	"Description" text DEFAULT '' NOT NULL,
	CONSTRAINT "Uq_SubjectTrans" UNIQUE("SubjectId","Locale")
);
--> statement-breakpoint
CREATE TABLE "Subjects" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"Slug" text NOT NULL,
	"Icon" text DEFAULT 'BookOpen' NOT NULL,
	"Color" text DEFAULT '#7C3AED' NOT NULL,
	"Order" integer DEFAULT 0 NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"IsDeleted" boolean DEFAULT false NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Subjects_Slug_unique" UNIQUE("Slug")
);
--> statement-breakpoint
CREATE TABLE "SystemPrompts" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"Key" text NOT NULL,
	"Content" text NOT NULL,
	"Locale" text DEFAULT 'ar' NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedBy" text,
	CONSTRAINT "SystemPrompts_Key_unique" UNIQUE("Key")
);
--> statement-breakpoint
CREATE TABLE "TrackTranslations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"TrackId" uuid NOT NULL,
	"Locale" text NOT NULL,
	"Name" text NOT NULL,
	"Description" text DEFAULT '' NOT NULL,
	CONSTRAINT "Uq_TrackTranslations_TrackLocale" UNIQUE("TrackId","Locale")
);
--> statement-breakpoint
CREATE TABLE "Tracks" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"Slug" text NOT NULL,
	"Icon" text NOT NULL,
	"Order" integer DEFAULT 0 NOT NULL,
	"IsDefault" boolean DEFAULT false NOT NULL,
	"IsDeleted" boolean DEFAULT false NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Tracks_Slug_unique" UNIQUE("Slug")
);
--> statement-breakpoint
CREATE TABLE "UserAchievements" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"AchievementId" uuid NOT NULL,
	"EarnedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Uq_UserAchievements_UserAch" UNIQUE("UserId","AchievementId")
);
--> statement-breakpoint
CREATE TABLE "UserCourseProgress" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"CourseId" uuid NOT NULL,
	"CompletedLessons" integer DEFAULT 0 NOT NULL,
	"TotalXp" integer DEFAULT 0 NOT NULL,
	"StartedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"CompletedAt" timestamp with time zone,
	CONSTRAINT "Uq_UCProgress_UserCourse" UNIQUE("UserId","CourseId")
);
--> statement-breakpoint
CREATE TABLE "UserPreferences" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"AgeGroup" text DEFAULT 'adult' NOT NULL,
	"Goal" text DEFAULT 'chat' NOT NULL,
	"Experience" text DEFAULT 'none' NOT NULL,
	"LearningStyle" text DEFAULT 'practice' NOT NULL,
	"DailyMinutes" integer DEFAULT 15 NOT NULL,
	"PreferredLocale" text DEFAULT 'ar' NOT NULL,
	"OnboardingCompleted" boolean DEFAULT false NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "UserPreferences_UserId_unique" UNIQUE("UserId")
);
--> statement-breakpoint
CREATE TABLE "UserProgress" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"LessonId" uuid NOT NULL,
	"Completed" boolean DEFAULT false NOT NULL,
	"Score" integer DEFAULT 0 NOT NULL,
	"CompletedAt" timestamp with time zone,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Uq_UserProgress_UserLesson" UNIQUE("UserId","LessonId")
);
--> statement-breakpoint
CREATE TABLE "UserStats" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"TotalXp" integer DEFAULT 0 NOT NULL,
	"StreakDays" integer DEFAULT 0 NOT NULL,
	"LastActivityDate" timestamp with time zone,
	"LessonsCompleted" integer DEFAULT 0 NOT NULL,
	"QuizzesCompleted" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "UserStats_UserId_unique" UNIQUE("UserId")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "AchievementTranslations" ADD CONSTRAINT "AchievementTranslations_AchievementId_Achievements_Id_fk" FOREIGN KEY ("AchievementId") REFERENCES "public"."Achievements"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AgentTranslations" ADD CONSTRAINT "AgentTranslations_AgentId_Agents_Id_fk" FOREIGN KEY ("AgentId") REFERENCES "public"."Agents"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CourseTranslations" ADD CONSTRAINT "CourseTranslations_CourseId_Courses_Id_fk" FOREIGN KEY ("CourseId") REFERENCES "public"."Courses"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_SubjectId_Subjects_Id_fk" FOREIGN KEY ("SubjectId") REFERENCES "public"."Subjects"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EncryptedKeys" ADD CONSTRAINT "EncryptedKeys_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LearningPaths" ADD CONSTRAINT "LearningPaths_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LearningPaths" ADD CONSTRAINT "LearningPaths_TrackId_Tracks_Id_fk" FOREIGN KEY ("TrackId") REFERENCES "public"."Tracks"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LearningPaths" ADD CONSTRAINT "LearningPaths_CurrentLessonId_Lessons_Id_fk" FOREIGN KEY ("CurrentLessonId") REFERENCES "public"."Lessons"("Id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonTranslations" ADD CONSTRAINT "LessonTranslations_LessonId_Lessons_Id_fk" FOREIGN KEY ("LessonId") REFERENCES "public"."Lessons"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_AgentId_Agents_Id_fk" FOREIGN KEY ("AgentId") REFERENCES "public"."Agents"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_CourseId_Courses_Id_fk" FOREIGN KEY ("CourseId") REFERENCES "public"."Courses"("Id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuizOptionTranslations" ADD CONSTRAINT "QuizOptionTranslations_OptionId_QuizOptions_Id_fk" FOREIGN KEY ("OptionId") REFERENCES "public"."QuizOptions"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuizOptions" ADD CONSTRAINT "QuizOptions_QuestionId_QuizQuestions_Id_fk" FOREIGN KEY ("QuestionId") REFERENCES "public"."QuizQuestions"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuizQuestionTranslations" ADD CONSTRAINT "QuizQuestionTranslations_QuestionId_QuizQuestions_Id_fk" FOREIGN KEY ("QuestionId") REFERENCES "public"."QuizQuestions"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuizQuestions" ADD CONSTRAINT "QuizQuestions_LessonId_Lessons_Id_fk" FOREIGN KEY ("LessonId") REFERENCES "public"."Lessons"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SandboxSessions" ADD CONSTRAINT "SandboxSessions_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SubjectTranslations" ADD CONSTRAINT "SubjectTranslations_SubjectId_Subjects_Id_fk" FOREIGN KEY ("SubjectId") REFERENCES "public"."Subjects"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TrackTranslations" ADD CONSTRAINT "TrackTranslations_TrackId_Tracks_Id_fk" FOREIGN KEY ("TrackId") REFERENCES "public"."Tracks"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserAchievements" ADD CONSTRAINT "UserAchievements_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserAchievements" ADD CONSTRAINT "UserAchievements_AchievementId_Achievements_Id_fk" FOREIGN KEY ("AchievementId") REFERENCES "public"."Achievements"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCourseProgress" ADD CONSTRAINT "UserCourseProgress_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserCourseProgress" ADD CONSTRAINT "UserCourseProgress_CourseId_Courses_Id_fk" FOREIGN KEY ("CourseId") REFERENCES "public"."Courses"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_LessonId_Lessons_Id_fk" FOREIGN KEY ("LessonId") REFERENCES "public"."Lessons"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Idx_AchTrans_AchievementId" ON "AchievementTranslations" USING btree ("AchievementId");--> statement-breakpoint
CREATE INDEX "Idx_AgentTranslations_Locale" ON "AgentTranslations" USING btree ("Locale");--> statement-breakpoint
CREATE INDEX "Idx_AgentTranslations_AgentId" ON "AgentTranslations" USING btree ("AgentId");--> statement-breakpoint
CREATE INDEX "Idx_CourseTrans_CourseId" ON "CourseTranslations" USING btree ("CourseId");--> statement-breakpoint
CREATE INDEX "Idx_LearningPaths_UserActive" ON "LearningPaths" USING btree ("UserId","IsActive");--> statement-breakpoint
CREATE INDEX "Idx_LessonTranslations_Locale" ON "LessonTranslations" USING btree ("Locale");--> statement-breakpoint
CREATE INDEX "Idx_LessonTranslations_LessonId" ON "LessonTranslations" USING btree ("LessonId");--> statement-breakpoint
CREATE INDEX "Idx_QOTrans_OptionId" ON "QuizOptionTranslations" USING btree ("OptionId");--> statement-breakpoint
CREATE INDEX "Idx_QQTrans_QuestionId" ON "QuizQuestionTranslations" USING btree ("QuestionId");--> statement-breakpoint
CREATE INDEX "Idx_SandboxSessions_UserId" ON "SandboxSessions" USING btree ("UserId");--> statement-breakpoint
CREATE INDEX "Idx_SubjectTrans_SubjectId" ON "SubjectTranslations" USING btree ("SubjectId");--> statement-breakpoint
CREATE INDEX "Idx_TrackTranslations_TrackId" ON "TrackTranslations" USING btree ("TrackId");--> statement-breakpoint
CREATE INDEX "Idx_UserAchievements_UserId" ON "UserAchievements" USING btree ("UserId");--> statement-breakpoint
CREATE INDEX "Idx_UCProgress_UserId" ON "UserCourseProgress" USING btree ("UserId");--> statement-breakpoint
CREATE INDEX "Idx_UserProgress_UserId" ON "UserProgress" USING btree ("UserId");