# Architecture Plan — Zkawi (ذكاوي)

> **تاريخ الخطة:** 2026-05-15
> **النوع:** Feature-First Architecture — إعادة هيكلة كاملة
> **المرجع:** `docs/CLAUDE.md` + نتائج `audit-report.md`
> **القاعدة:** لا كود يُكتب قبل الموافقة على هذه الخطة

---

## 1. مبدأ الـ Feature Architecture

كل ميزة (Feature) في ذكاوي هي **وحدة مستقلة** تملك:

```
Controller  ← يتعامل مع HTTP فقط (parse + validate + call Service + return response)
Service     ← Business logic + DB queries (لا HTTP هنا)
Schema      ← Zod validation schemas (مشتركة بين Server و Client)
Types       ← TypeScript interfaces/types
```

قاعدة الاعتماد (Dependency Direction):
```
app/api/v1/.../route.ts
    → Features/X/X.Controller.ts
        → Features/X/X.Service.ts
            → Lib/Db/
            → Lib/Ai/
            → Lib/Encryption/
```

الـ Controller لا يعرف الـ DB. الـ Service لا يعرف HTTP. الـ route.ts لا يحتوي منطق.

---

## 2. هيكل المجلدات الكامل

```
src/
│
├── app/                                        # Next.js App Router (framework-mandated lowercase)
│   ├── [locale]/                               # i18n locale segment
│   │   │
│   │   ├── (auth)/                             # Auth route group (لا يظهر في URL)
│   │   │   ├── layout.tsx                      # Auth layout
│   │   │   ├── login/
│   │   │   │   ├── page.tsx                    # Server Component — metadata فقط
│   │   │   │   ├── PageContent.tsx             # Client Component — orchestration
│   │   │   │   ├── _hooks.ts                   # UseLoginForm hook
│   │   │   │   ├── _types.ts                   # TLoginFormState
│   │   │   │   └── Components/
│   │   │   │       └── LoginForm.tsx
│   │   │   └── register/
│   │   │       ├── page.tsx
│   │   │       ├── PageContent.tsx
│   │   │       ├── _hooks.ts
│   │   │       ├── _types.ts
│   │   │       └── Components/
│   │   │           └── RegisterForm.tsx
│   │   │
│   │   ├── (main)/                             # Main app route group
│   │   │   ├── layout.tsx                      # Main layout (header + mascot + footer)
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── PageContent.tsx
│   │   │   │   ├── _hooks.ts                   # UseUserStats, UseProgress
│   │   │   │   ├── _types.ts
│   │   │   │   └── Components/
│   │   │   │       ├── XpBar.tsx
│   │   │   │       ├── StreakCard.tsx
│   │   │   │       ├── LessonGrid.tsx
│   │   │   │       └── AchievementBadge.tsx
│   │   │   │
│   │   │   ├── agents/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── PageContent.tsx
│   │   │   │   ├── _hooks.ts
│   │   │   │   ├── Components/
│   │   │   │   │   └── AgentCard.tsx
│   │   │   │   └── [agentSlug]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── PageContent.tsx
│   │   │   │       ├── _hooks.ts
│   │   │   │       ├── Components/
│   │   │   │       │   └── LessonCard.tsx
│   │   │   │       └── lessons/
│   │   │   │           └── [lessonId]/
│   │   │   │               ├── page.tsx
│   │   │   │               ├── PageContent.tsx
│   │   │   │               ├── _hooks.ts          # UseLesson, UseQuiz
│   │   │   │               ├── _types.ts
│   │   │   │               └── Components/
│   │   │   │                   ├── LessonContent.tsx
│   │   │   │                   ├── QuizComponent.tsx
│   │   │   │                   └── QuizOption.tsx
│   │   │   │
│   │   │   ├── sandbox/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── PageContent.tsx
│   │   │   │   ├── _hooks.ts                   # UseSandboxChat
│   │   │   │   ├── _types.ts
│   │   │   │   └── Components/
│   │   │   │       ├── ChatInterface.tsx
│   │   │   │       ├── ChatMessage.tsx
│   │   │   │       └── ApiKeySetup.tsx
│   │   │   │
│   │   │   ├── leaderboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── PageContent.tsx
│   │   │   │   ├── _hooks.ts
│   │   │   │   └── Components/
│   │   │   │       ├── LeaderboardTable.tsx
│   │   │   │       └── LeaderboardRow.tsx
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   └── [userId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── PageContent.tsx
│   │   │   │       ├── _hooks.ts
│   │   │   │       └── Components/
│   │   │   │           ├── ProfileHeader.tsx
│   │   │   │           └── AchievementGrid.tsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── page.tsx
│   │   │       ├── PageContent.tsx
│   │   │       ├── _hooks.ts
│   │   │       └── Components/
│   │   │           └── LessonsTable.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   ├── page.tsx
│   │   │   ├── PageContent.tsx
│   │   │   ├── _hooks.ts                       # UseOnboarding
│   │   │   ├── _types.ts
│   │   │   └── Components/
│   │   │       ├── StepAgeGroup.tsx
│   │   │       ├── StepGoal.tsx
│   │   │       ├── StepExperience.tsx
│   │   │       └── StepLearningStyle.tsx
│   │   │
│   │   ├── layout.tsx                          # Root locale layout
│   │   ├── page.tsx                            # Home page
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   └── global-error.tsx
│   │
│   ├── api/                                    # API Routes — thin wrappers فقط
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts                    # → Auth.Config.ts handler
│   │   │
│   │   └── v1/                                 # Versioned API
│   │       ├── keys/
│   │       │   ├── route.ts                    # → Keys.Controller
│   │       │   └── hint/
│   │       │       └── route.ts                # → Keys.Controller
│   │       ├── lessons/
│   │       │   └── route.ts                    # → Lessons.Controller (claude lessons)
│   │       ├── mascot/
│   │       │   └── route.ts                    # → Mascot.Controller
│   │       ├── onboarding/
│   │       │   └── route.ts                    # → Onboarding.Controller
│   │       ├── progress/
│   │       │   ├── route.ts                    # → Progress.Controller (GET)
│   │       │   └── lesson/
│   │       │       └── [id]/
│   │       │           └── route.ts            # → Progress.Controller (PUT)
│   │       ├── profile/
│   │       │   └── [userId]/
│   │       │       └── route.ts                # → Profile.Controller
│   │       ├── sandbox/
│   │       │   └── route.ts                    # → Sandbox.Controller
│   │       ├── leaderboard/
│   │       │   └── route.ts                    # → Leaderboard.Controller
│   │       ├── user/
│   │       │   ├── learning-path/
│   │       │   │   └── route.ts                # → User.Controller
│   │       │   └── preferences/
│   │       │       └── route.ts                # → User.Controller
│   │       └── admin/
│   │           └── lessons/
│   │               └── route.ts                # → Admin.Controller
│   │
│   ├── og/
│   │   └── route.ts                            # OG image generation
│   ├── sitemap.ts
│   └── robots.ts
│
│
├── Features/                                   # Feature Modules — قلب الـ architecture
│   │
│   ├── Auth/
│   │   ├── Auth.Config.ts                      # Better Auth setup (requireEmailVerification: true)
│   │   ├── Auth.Client.ts                      # Client-side auth (createAuthClient)
│   │   ├── Auth.Controller.ts                  # getSession helper + session validation
│   │   ├── Auth.Admin.ts                       # IsAdminEmail()
│   │   ├── Auth.Schemas.ts                     # Zod: email, password validation
│   │   └── Auth.Types.ts                       # ISession, IUser
│   │
│   ├── Lessons/
│   │   ├── Lessons.Controller.ts               # GET /v1/lessons
│   │   ├── Lessons.Service.ts                  # GetAgents, GetLessonById, etc.
│   │   ├── Lessons.Schemas.ts                  # Zod: locale validation
│   │   └── Lessons.Types.ts                    # IAgentRow, ILessonRow, ILessonFull
│   │
│   ├── Progress/
│   │   ├── Progress.Controller.ts              # GET /v1/progress, PUT /v1/progress/lesson/:id
│   │   ├── Progress.Service.ts                 # XP computed here (not from client)
│   │   ├── Progress.Schemas.ts                 # Zod: score (0-100 only), no xpEarned from client
│   │   └── Progress.Types.ts                   # IProgressResponse, IAchievementInfo
│   │
│   ├── Sandbox/
│   │   ├── Sandbox.Controller.ts               # POST /v1/sandbox — SSE stream
│   │   ├── Sandbox.Service.ts                  # Decrypt key + call Anthropic
│   │   ├── Sandbox.Schemas.ts                  # Zod: messages array (max 50, max 10k chars)
│   │   └── Sandbox.Types.ts                    # ISandboxMessage
│   │
│   ├── Mascot/
│   │   ├── Mascot.Controller.ts                # POST /v1/mascot — SSE stream
│   │   ├── Mascot.Service.ts                   # BuildSystemPrompt()
│   │   ├── Mascot.Schemas.ts                   # Zod: messages, pathname, locale
│   │   └── Mascot.Types.ts                     # IMascotRequest
│   │
│   ├── Onboarding/
│   │   ├── Onboarding.Controller.ts            # POST /v1/onboarding
│   │   ├── Onboarding.Service.ts               # GenerateLearningPath (agentSlug param)
│   │   ├── Onboarding.Schemas.ts               # Zod enums: EAgeGroup, EGoal, EExperience
│   │   └── Onboarding.Types.ts                 # IOnboardingInput, EAgeGroup, EGoal, etc.
│   │
│   ├── Leaderboard/
│   │   ├── Leaderboard.Controller.ts           # GET /v1/leaderboard
│   │   ├── Leaderboard.Service.ts              # GetTopUsers() — paginated future
│   │   └── Leaderboard.Types.ts                # ILeaderboardEntry
│   │
│   ├── Profile/
│   │   ├── Profile.Controller.ts               # GET /v1/profile/:userId
│   │   ├── Profile.Service.ts                  # GetUserProfile() — JOIN optimization
│   │   └── Profile.Types.ts                    # IPublicProfile
│   │
│   ├── Keys/
│   │   ├── Keys.Controller.ts                  # POST/DELETE /v1/keys, GET /v1/keys/hint
│   │   ├── Keys.Service.ts                     # Encrypt/decrypt + upsert
│   │   ├── Keys.Schemas.ts                     # Zod: starts with sk-ant-, max length 120
│   │   └── Keys.Types.ts                       # IKeyHintResponse
│   │
│   ├── User/
│   │   ├── User.Controller.ts                  # GET /v1/user/learning-path, preferences
│   │   ├── User.Service.ts                     # GetActiveLearningPath, GetUserPreferences
│   │   └── User.Types.ts                       # ILearningPathResponse
│   │
│   └── Admin/
│       ├── Admin.Controller.ts                 # GET/POST /v1/admin/lessons
│       ├── Admin.Service.ts                    # CreateLesson, ListLessons with i18n
│       ├── Admin.Schemas.ts                    # Zod: agentId, titleAr, titleEn required
│       └── Admin.Types.ts                      # IAdminLesson
│
│
├── Shared/                                     # مشترك بين كل الـ Features
│   │
│   ├── Components/                             # UI Components مشتركة
│   │   ├── Ui/                                 # shadcn/ui components (button, input, card…)
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── Mascot/
│   │   │   ├── Mascot.tsx                      # NPC mascot (a11y fixed: role, aria, keyboard)
│   │   │   └── MascotChat.tsx
│   │   ├── Seo/
│   │   │   └── JsonLd.tsx
│   │   ├── Providers.tsx                       # Theme + Auth + Intl providers
│   │   ├── PwaRegister.tsx
│   │   ├── PwaInstallBanner.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── Hooks/                                  # Hooks مشتركة
│   │   ├── UseRefreshableData.ts
│   │   ├── UseDialogState.ts
│   │   └── UseListFilters.ts
│   │
│   ├── Middleware/                             # Server Middleware
│   │   ├── RateLimit.Middleware.ts             # Rate limiting (per user, sliding window)
│   │   ├── Auth.Middleware.ts                  # GetSessionOrUnauthorized()
│   │   └── Validation.Middleware.ts            # ParseBodyOrBadRequest()
│   │
│   └── Types/                                  # Shared TypeScript Types
│       ├── Api.Types.ts                        # TApiResponse<T>, TApiError
│       └── Common.Types.ts                     # TLocale, TSupportedLocale
│
│
├── Lib/                                        # Infrastructure — لا business logic هنا
│   │
│   ├── Ai/
│   │   └── Providers.ts                        # Multi-provider AI (no console.log)
│   │
│   ├── Db/
│   │   ├── Index.ts                            # DB connection (postgres + drizzle)
│   │   ├── Schema.ts                           # Full schema (PascalCase, uuidv7, indexes)
│   │   ├── Seed.ts                             # Seed data
│   │   ├── Reset.ts                            # Reset tables
│   │   └── Queries/
│   │       └── Content.Queries.ts              # FetchWithFallback, BuildTransMap (shared)
│   │
│   ├── Encryption/
│   │   └── Encryption.ts                       # AES-256-GCM (unchanged)
│   │
│   ├── I18n/
│   │   ├── Routing.ts                          # Supported locales: ['ar', 'en']
│   │   ├── Request.ts                          # getMessages()
│   │   ├── Navigation.ts                       # Link, useRouter (locale-aware)
│   │   └── Locale.Utils.ts                     # GetDir(), IsRTL(), SUPPORTED_LOCALES
│   │
│   └── Monitoring/
│       ├── Sentry.Client.ts                    # Client config (conditional sample rates)
│       └── Sentry.Server.ts                    # Server config
│
│
├── Messages/                                   # i18n Translation Files
│   ├── Ar.json                                 # عربي
│   └── En.json                                 # English
│
│
├── Styles/                                     # Global Styles
│   └── Globals.css                             # Tailwind v4 @import + CSS variables (Zkawi theme)
│
│
└── Proxy.ts                                    # next-intl middleware (re-exported by middleware.ts)

middleware.ts                                   # Framework-mandated at root — re-exports Proxy
```

---

## 3. قواعد التسمية — Naming Conventions

| المستوى | القاعدة | أمثلة |
|---------|---------|-------|
| **Folders (non-route)** | PascalCase | `Features/`, `Shared/Components/`, `Lib/Db/` |
| **Route folders (URL segments)** | lowercase/kebab | `app/[locale]/dashboard/`, `app/api/v1/learning-path/` |
| **Route groups** | lowercase+parens | `(auth)`, `(main)` |
| **Framework files** | lowercase | `page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts` |
| **App files** | PascalCase | `PageContent.tsx`, `_hooks.ts`, `_types.ts` |
| **Feature files** | `Name.Role.ts` | `Auth.Service.ts`, `Progress.Schemas.ts` |
| **Variables** | PascalCase | `const UserData = ...`, `const IsLoading = ...` |
| **Functions** | PascalCase | `function GetUserById()`, `async function ValidateSession()` |
| **Interfaces** | `I + PascalCase` | `interface IUserStats`, `interface IApiResponse` |
| **Types** | `T + PascalCase` | `type TLocale`, `type TApiResponse<T>` |
| **Enums** | `E + PascalCase` | `enum EAgeGroup`, `enum EGoal` |
| **Constants** | UPPER_SNAKE_CASE | `const MAX_MESSAGES = 50` |
| **Hooks** | `Use + PascalCase` | `UseLoginForm`, `UseSandboxChat` |
| **DB Tables** | PascalCase plural | `Users`, `Lessons`, `UserProgress` |
| **DB Columns** | PascalCase | `Id`, `CreatedAt`, `UserId`, `IsDeleted` |
| **API Routes** | kebab-case | `/api/v1/learning-path`, `/api/v1/user/preferences` |
| **Env Vars** | UPPER_SNAKE_CASE | `DATABASE_URL`, `ENCRYPTION_KEY` |

---

## 4. نمط الـ Feature Module — مثال: Progress

### `Features/Progress/Progress.Schemas.ts`
```typescript
/**
 * Progress.Schemas.ts
 * Zod validation schemas for the Progress feature.
 */
import { z } from 'zod';

export const LessonCompletionSchema = z.object({
  Score: z.number().int().min(0).max(100),
  // لا xpEarned هنا — يُحسب server-side من DB
});

export type TLessonCompletionInput = z.infer<typeof LessonCompletionSchema>;
```

### `Features/Progress/Progress.Types.ts`
```typescript
/**
 * Progress.Types.ts
 * TypeScript types for the Progress feature.
 */

export interface IAchievementInfo {
  Id: number;
  Emoji: string;
  NameAr: string;
  NameEn: string;
}

export interface ILessonCompletionResponse {
  Ok: boolean;
  NewStreak: number;
  NewAchievements: IAchievementInfo[];
}
```

### `Features/Progress/Progress.Service.ts`
```typescript
/**
 * Progress.Service.ts
 * Business logic for learning progress, XP, streaks, and achievements.
 * XP is always computed from DB — never trusted from client.
 */
import { db } from '@/Lib/Db';
import { lessons, userProgress, userStats, achievements, userAchievements, translations } from '@/Lib/Db/Schema';
import { eq, and, notInArray, inArray } from 'drizzle-orm';
import type { IAchievementInfo, ILessonCompletionResponse } from './Progress.Types';

/**
 * Calculates the current streak based on last activity date.
 * @param LastActivityDate - Timestamp of last completed lesson
 * @param CurrentStreak - Current streak count
 */
export function CalcStreak(LastActivityDate: Date | null, CurrentStreak: number): number {
  if (!LastActivityDate) return 1;
  const Today = new Date();
  const TodayMidnight = new Date(Today.getFullYear(), Today.getMonth(), Today.getDate());
  const Last = new Date(LastActivityDate.getFullYear(), LastActivityDate.getMonth(), LastActivityDate.getDate());
  const DiffDays = Math.round((TodayMidnight.getTime() - Last.getTime()) / 86_400_000);
  if (DiffDays === 0) return CurrentStreak;
  if (DiffDays === 1) return CurrentStreak + 1;
  return 1;
}

/**
 * Completes a lesson for a user: updates progress, awards XP (from DB), checks achievements.
 * XP is fetched from lessons.xpReward — never from the request body.
 */
export async function CompleteLessonService(
  UserId: string,
  LessonId: number,
  Score: number,
): Promise<ILessonCompletionResponse> {
  // 1. XP يُقرأ من DB — لا يُقبل من الـ client
  const [LessonRow] = await db
    .select({ XpReward: lessons.XpReward })
    .from(lessons)
    .where(eq(lessons.Id, LessonId))
    .limit(1);

  if (!LessonRow) throw new Error('LESSON_NOT_FOUND');

  const XpEarned = LessonRow.XpReward;

  // ... باقي المنطق
}
```

### `Features/Progress/Progress.Controller.ts`
```typescript
/**
 * Progress.Controller.ts
 * HTTP handlers for the Progress feature.
 * Parses requests, validates, calls Service, returns standard response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { WithRateLimit } from '@/Shared/Middleware/RateLimit.Middleware';
import { LessonCompletionSchema } from './Progress.Schemas';
import { CompleteLessonService } from './Progress.Service';

/**
 * PUT /api/v1/progress/lesson/:id
 * Marks a lesson as complete and awards XP.
 */
export async function PutLessonProgress(
  Req: NextRequest,
  LessonId: number,
): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, LessonCompletionSchema);
  if (Body instanceof NextResponse) return Body;

  const Result = await CompleteLessonService(Session.User.Id, LessonId, Body.Score);

  return NextResponse.json({ Success: true, Data: Result });
}
```

### `app/api/v1/progress/lesson/[id]/route.ts`
```typescript
// Thin wrapper — no logic here
import { PutLessonProgress } from '@/Features/Progress/Progress.Controller';

export async function PUT(
  Req: NextRequest,
  { Params }: { Params: Promise<{ Id: string }> },
) {
  const { Id } = await Params;
  const LessonId = parseInt(Id);
  if (isNaN(LessonId)) return NextResponse.json({ Success: false, Error: { Code: 'INVALID_ID', Message: 'Invalid lesson id' } }, { status: 400 });
  return PutLessonProgress(Req, LessonId);
}
```

---

## 5. Standard API Response Format

```typescript
// Shared/Types/Api.Types.ts

interface TApiSuccess<T> {
  Success: true;
  Data: T;
  Message?: string;
  Meta?: TApiMeta;
}

interface TApiError {
  Success: false;
  Error: {
    Code: string;
    Message: string;
    Details?: string[];
  };
}

interface TApiMeta {
  Page: number;
  Limit: number;
  Total: number;
}

type TApiResponse<T> = TApiSuccess<T> | TApiError;
```

**أمثلة:**
```json
// Success
{ "Success": true, "Data": { "NewStreak": 5, "NewAchievements": [] } }

// Error
{ "Success": false, "Error": { "Code": "UNAUTHORIZED", "Message": "يجب تسجيل الدخول" } }

// Rate Limited
{ "Success": false, "Error": { "Code": "RATE_LIMITED", "Message": "تجاوزت الحد المسموح" } }
```

---

## 6. قاعدة البيانات — DB Schema الجديد

### قواعد عامة:
- **PKs:** `uuidv7` لكل الجداول (time-sortable, better index performance)
- **Columns:** PascalCase — `Id`, `CreatedAt`, `UserId`, `IsDeleted`
- **SQL Column Names:** PascalCase (via Drizzle: `timestamp("CreatedAt")`)
- **Soft Delete:** `IsDeleted: boolean` على كل الجداول الأساسية
- **Base Columns** في كل جدول:

```typescript
// Lib/Db/Schema.ts — Base columns pattern
const BaseColumns = {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  CreatedAt: timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
  UpdatedAt: timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
  IsDeleted: boolean('IsDeleted').default(false).notNull(),
};
```

### Package مطلوب:
```bash
bun add uuid
# ثم: import { v7 as uuidv7 } from 'uuid';
```

### Indexes المطلوبة (SEV-004):
```typescript
// UserProgress — index على UserId + unique constraint على (UserId, LessonId)
export const UserProgress = pgTable('UserProgress', {
  ...
}, (T) => [
  index('Idx_UserProgress_UserId').on(T.UserId),
  unique('Uq_UserProgress_UserLesson').on(T.UserId, T.LessonId),   // SEV-011 fix
]);

// UserAchievements — index على UserId
export const UserAchievements = pgTable('UserAchievements', {
  ...
}, (T) => [
  index('Idx_UserAchievements_UserId').on(T.UserId),
  unique('Uq_UserAchievements_UserAchievement').on(T.UserId, T.AchievementId),
]);

// LearningPaths — compound index على (UserId, IsActive)
export const LearningPaths = pgTable('LearningPaths', {
  ...
}, (T) => [
  index('Idx_LearningPaths_UserActive').on(T.UserId, T.IsActive),
]);

// SandboxSessions — index على UserId
export const SandboxSessions = pgTable('SandboxSessions', {
  ...
}, (T) => [
  index('Idx_SandboxSessions_UserId').on(T.UserId),
]);
```

---

## 7. Shared Middleware

### `Shared/Middleware/RateLimit.Middleware.ts` — SEV-002
```typescript
/**
 * RateLimit.Middleware.ts
 * In-memory sliding window rate limiter per user.
 * For multi-instance deployments: replace Map with Redis (Upstash).
 */

interface IRateLimitConfig {
  MaxRequests: number;   // max requests in window
  WindowMs: number;      // window size in milliseconds
}

const AI_RATE_LIMIT: IRateLimitConfig = {
  MaxRequests: 20,
  WindowMs: 60_000,   // 20 requests per minute
};

export function WithRateLimit(UserId: string, Config: IRateLimitConfig = AI_RATE_LIMIT): boolean {
  // Returns false if rate limit exceeded
}
```

### `Shared/Middleware/Auth.Middleware.ts`
```typescript
/**
 * Auth.Middleware.ts
 * Session validation helper — returns ISession or 401 NextResponse.
 */

export async function GetSessionOrUnauthorized(
  Req: NextRequest,
): Promise<ISession | NextResponse> {
  const Session = await auth.api.getSession({ headers: Req.headers });
  if (!Session?.user?.id) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'UNAUTHORIZED', Message: 'يجب تسجيل الدخول' } },
      { status: 401 },
    );
  }
  return Session;
}
```

### `Shared/Middleware/Validation.Middleware.ts` — SEV-003
```typescript
/**
 * Validation.Middleware.ts
 * Zod body parsing helper — returns parsed data or 400 NextResponse.
 */
import { z } from 'zod';

export async function ParseBodyOrBadRequest<T>(
  Req: NextRequest,
  Schema: z.ZodSchema<T>,
): Promise<T | NextResponse> {
  const RawBody = await Req.json();
  const Parsed = Schema.safeParse(RawBody);
  if (!Parsed.success) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR', Message: 'بيانات غير صحيحة', Details: Parsed.error.flatten().fieldErrors } },
      { status: 400 },
    );
  }
  return Parsed.data;
}
```

---

## 8. Locale Validation — SEV-010

```typescript
// Lib/I18n/Locale.Utils.ts

export const SUPPORTED_LOCALES = ['ar', 'en'] as const;
export type TLocale = typeof SUPPORTED_LOCALES[number];

export function GetValidLocale(RawLocale: string | null | undefined): TLocale {
  if (SUPPORTED_LOCALES.includes(RawLocale as TLocale)) return RawLocale as TLocale;
  return 'ar'; // default
}

export function GetDir(Locale: TLocale): 'rtl' | 'ltr' {
  return IsRTL(Locale) ? 'rtl' : 'ltr';
}

export function IsRTL(Locale: TLocale): boolean {
  return Locale === 'ar';
}
```

---

## 9. Email Verification — SEV-006

```typescript
// Features/Auth/Auth.Config.ts

export const Auth = betterAuth({
  // ...
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,  // ENABLED — no bot accounts
  },
  emailVerification: {
    sendVerificationEmail: async ({ User, Url }) => {
      await SendVerificationEmail({ To: User.email, VerifyUrl: Url });
    },
  },
  // ...
});
```

**متغيرات بيئة مطلوبة إضافية:**
```bash
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@zkawi.com
```

---

## 10. Sentry Configuration — SEV-007

```typescript
// Lib/Monitoring/Sentry.Client.ts

const IsProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate:       IsProd ? 0.1 : 1.0,    // 10% in prod, 100% in dev
  profilesSampleRate:     IsProd ? 0.05 : 1.0,   // 5% in prod
  replaysOnErrorSampleRate: 1.0,                  // Always capture errors
  replaysSessionSampleRate: 0.1,
  debug: !IsProd,
  // ...
});
```

---

## 11. Security Headers — SEV-016

```typescript
// next.config.ts

const SecurityHeaders = [
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
];

const NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: SecurityHeaders }];
  },
};
```

---

## 12. Page Structure — مثال: Login Page

```
app/[locale]/(auth)/login/
├── page.tsx              ← Server Component — metadata + params فقط
├── PageContent.tsx       ← Client Component — orchestration (<= 300 سطر)
├── _hooks.ts             ← UseLoginForm() — كل الـ state + submit logic
├── _types.ts             ← TLoginFormState
└── Components/
    └── LoginForm.tsx     ← Form UI فقط
```

**`_hooks.ts` مثال:**
```typescript
/**
 * _hooks.ts
 * Login page hooks — form state + submission logic.
 */
import { useState } from 'react';
import { useRouter } from '@/Lib/I18n/Navigation';
import { LoginSchema } from '@/Features/Auth/Auth.Schemas';
import { signIn } from '@/Features/Auth/Auth.Client';

export function UseLoginForm() {
  const [Email, SetEmail]         = useState('');
  const [Password, SetPassword]   = useState('');
  const [IsLoading, SetIsLoading] = useState(false);
  const [ApiError, SetApiError]   = useState('');
  const Router = useRouter();

  const HandleSubmit = async (Ev: React.FormEvent) => {
    Ev.preventDefault();
    const Parsed = LoginSchema.safeParse({ Email, Password });
    if (!Parsed.success) { /* handle */ return; }
    SetIsLoading(true);
    // ...
  };

  return { Email, SetEmail, Password, SetPassword, IsLoading, ApiError, HandleSubmit };
}
```

---

## 13. Mascot Accessibility Fixes — SEV-017, SEV-018, SEV-019, SEV-020

### SEV-017: Keyboard + ARIA
```tsx
// Shared/Components/Mascot/Mascot.tsx
<motion.div
  role="button"
  tabIndex={0}
  aria-label={Locale === 'ar' ? 'فتح محادثة مع ذكي' : 'Open chat with Zaki'}
  aria-expanded={ChatOpen}
  onKeyDown={(E) => {
    if (E.key === 'Enter' || E.key === ' ') { E.preventDefault(); SetChatOpen(Prev => !Prev); }
  }}
  onClick={() => SetChatOpen(Prev => !Prev)}
>
```

### SEV-018: prefers-reduced-motion
```tsx
import { useReducedMotion } from 'framer-motion';

const PrefersReduced = useReducedMotion();

animate={PrefersReduced ? {} : (IsWalking ? { y: [0, -5, 0] } : { y: [0, -7, 0] })}
transition={PrefersReduced ? { duration: 0 } : { repeat: Infinity, duration: 2.6 }}
```

### SEV-019: RTL Speech Bubble
```tsx
import { IsRTL } from '@/Lib/I18n/Locale.Utils';

style={{
  bottom: '100%',
  [IsRTL(Locale) ? 'left' : 'right']: 0,
  marginBottom: 12,
  width: 200,
}}
```

### SEV-020: "Forgot Password" Dead UI
```tsx
// حذف الزر حتى تُبنى الميزة — لا dead UI
// عند البناء: يُضاف useState + modal + API route
```

---

## 14. SSE Error Handling — SEV-005

```typescript
// Pattern in Sandbox.Controller.ts and Mascot.Controller.ts

} catch (Err: unknown) {
  // Log full error server-side only
  console.error('[Sandbox] Stream error:', Err);
  // Send generic message to client — no internal details
  Controller.enqueue(Encoder.encode('\n\n[حدث خطأ. يرجى المحاولة مرة أخرى.]'));
  Controller.close();
}
```

---

## 15. Translation Deduplication — SEV-009

`FetchWithFallback` و `BuildTransMap` تُصدَّران من:

```typescript
// Lib/Db/Queries/Content.Queries.ts
export { FetchWithFallback, BuildTransMap };
```

وتُستخدم في كل Feature يحتاج translations — لا يعيد أحد كتابتها.

---

## 16. Learning Path Fix — SEV-008

```typescript
// Features/Onboarding/Onboarding.Service.ts

export async function GenerateLearningPath(
  Input: IOnboardingInput,
  AgentSlug: string = 'claude',  // قابل للتوسع — لا hardcoded
): Promise<number[]> {
  const AllLessons = await GetLessonsByAgent(AgentSlug, 'en');
  // ...
}
```

---

## 17. قائمة التحقق قبل إنهاء أي ملف

```
[ ] PascalCase في كل identifiers (vars, functions, types)
[ ] File header comment (JSDoc)
[ ] JSDoc على كل function/component
[ ] Inline comments على complex logic
[ ] لا any types — EVER
[ ] Max 600 سطر
[ ] Zod schema على كل API input
[ ] Standard response format { Success, Data/Error }
[ ] Loading + Error + Empty states في UI components
[ ] CSS logical properties (inset-inline-start, margin-inline-end)
[ ] لا hardcoded colors — CSS variables فقط
[ ] كل text عبر i18n keys — لا hardcoded strings
[ ] Server Component by default — "use client" عند الحاجة فقط
[ ] bun run tsc --noEmit يمر بدون أخطاء
```
