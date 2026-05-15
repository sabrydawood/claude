# Migration Plan — Zkawi (ذكاوي)

> **تاريخ الخطة:** 2026-05-15
> **النهج:** DB Reset كامل + إعادة هيكلة تدريجية (5 مراحل)
> **المرجع:** `docs/Architecture.Plan.md` + `audit-report.md`
> **الأولوية:** الحرج أولاً → العالي → المتوسط → المنخفض

---

## نظرة عامة على المراحل

| المرحلة | الوصف | يحل |
|---------|-------|-----|
| **1** | DB Foundation | SEV-004, SEV-011, SEV-006, SEV-007, SEV-016 |
| **2** | Core Lib & Shared Middleware | SEV-002, SEV-003 pattern, SEV-009, SEV-010 |
| **3** | Feature Modules (Backend) | SEV-001, SEV-005, SEV-008, SEV-012, SEV-015 |
| **4** | API Routes + Frontend Pages | SEV-003 (all routes), SEV-013 (partial), SEV-014 |
| **5** | UI/A11y + Tests + Performance | SEV-017–020, SEV-013, SEV-024 |

**ترتيب التنفيذ:** كل مرحلة مستقلة قابلة للـ PR. لا تبدأ مرحلة حتى تنجح `bun run tsc --noEmit` للمرحلة السابقة.

---

## المرحلة 1 — DB Foundation

**الهدف:** DB جديدة بـ schema صحيح من الصفر.

### خطوات

**1.1 إضافة package الـ uuidv7**
```bash
bun add uuid
bun add -d @types/uuid
```

**1.2 إعادة كتابة `Lib/Db/Schema.ts`** — التغييرات:

| قبل | بعد |
|-----|-----|
| `snake_case` columns | `PascalCase` columns |
| `serial()` PKs للـ content | `uuid().uuidv7()` PKs |
| لا `IsDeleted` | `IsDeleted: boolean` على كل جدول |
| لا indexes على `UserProgress` | `Idx_UserProgress_UserId` + `Uq_UserProgress_UserLesson` |
| لا indexes على `UserAchievements` | `Idx_UserAchievements_UserId` |
| لا compound index على `LearningPaths` | `Idx_LearningPaths_UserActive` |
| لا index على `SandboxSessions` | `Idx_SandboxSessions_UserId` |

**جداول DB الجديدة (PascalCase):**
```
Users, Sessions, Accounts, VerificationTokens
Agents, Lessons, QuizQuestions, QuizOptions
Translations, Tracks, Achievements
UserPreferences, LearningPaths, EncryptedKeys
SandboxSessions, UserProgress, UserStats, UserAchievements
```

**1.3 تحديث `Lib/Db/Seed.ts`** — استخدام IDs جديدة بـ uuidv7

**1.4 تحديث `.env.example`** — إضافة: (SEV-014)
```bash
ENCRYPTION_KEY=        # 64-char hex: openssl rand -hex 32
ADMIN_EMAILS=          # comma-separated: admin@example.com
ANTHROPIC_API_KEY=     # required for sandbox feature
SMTP_HOST=             # required for email verification
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@zkawi.com
```

**1.5 تشغيل DB Reset**
```bash
bun run db:reset
bun run db:generate
bun run db:migrate
bun run db:seed
```

**1.6 تحديث `Features/Auth/Auth.Config.ts`** — تفعيل Email Verification (SEV-006):
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
},
```

**1.7 تحديث `Lib/Monitoring/Sentry.Client.ts`** — (SEV-007):
```typescript
tracesSampleRate: IsProd ? 0.1 : 1.0,
profilesSampleRate: IsProd ? 0.05 : 1.0,
```

**1.8 إضافة Security Headers في `next.config.ts`** — (SEV-016)

**1.9 إضافة `typecheck` script في `package.json`**:
```json
"typecheck": "tsc --noEmit"
```

**✅ تحقق من النجاح:**
```bash
bun run typecheck          # لا أخطاء TypeScript
bun run db:all             # DB تعمل بالكامل
```

---

## المرحلة 2 — Core Lib & Shared Middleware

**الهدف:** بناء طبقة الـ infrastructure المشتركة.

### خطوات

**2.1 إنشاء `Shared/Types/Api.Types.ts`**
```typescript
// TApiResponse<T>, TApiError, TApiMeta
```

**2.2 إنشاء `Shared/Types/Common.Types.ts`**
```typescript
// TLocale, TSupportedLocale
```

**2.3 تحديث `Lib/I18n/Locale.Utils.ts`** — (SEV-010):
- إضافة `SUPPORTED_LOCALES`, `GetValidLocale()`
- تحويل الأسماء لـ PascalCase: `GetDir()`, `IsRTL()`

**2.4 إنشاء `Shared/Middleware/Auth.Middleware.ts`**
```typescript
// GetSessionOrUnauthorized(Req) → ISession | NextResponse
```

**2.5 إنشاء `Shared/Middleware/Validation.Middleware.ts`** — (SEV-003 pattern):
```typescript
// ParseBodyOrBadRequest(Req, Schema) → T | NextResponse
```

**2.6 إنشاء `Shared/Middleware/RateLimit.Middleware.ts`** — (SEV-002):
```typescript
// WithRateLimit(UserId, Config) → boolean
// AI endpoints: 20 requests/minute per user
```

**2.7 تحديث `Lib/Db/Queries/Content.Queries.ts`** — (SEV-009):
- rename `fetchWithFallback` → `FetchWithFallback`
- rename `buildTransMap` → `BuildTransMap`
- export both for use across all Features

**2.8 إزالة `console.log` من `Lib/Ai/Providers.ts`** — (SEV-015):
```typescript
// قبل
console.log(`[AI] Using ${Provider.Name}`);
// بعد
// Sentry breadcrumb بدلاً من console.log
```

**✅ تحقق من النجاح:**
```bash
bun run typecheck
# لا console.log في Providers.ts
```

---

## المرحلة 3 — Feature Modules (Backend Logic)

**الهدف:** نقل كل business logic من `app/api/` إلى `Features/`.

### ترتيب البناء (حسب الأولوية):

#### 3.1 Feature: Progress — SEV-001 الأهم

```
Features/Progress/
├── Progress.Types.ts      # ILessonCompletionResponse, IAchievementInfo
├── Progress.Schemas.ts    # LessonCompletionSchema (Score only, 0-100)
├── Progress.Service.ts    # CompleteLessonService — XP من DB لا من client
└── Progress.Controller.ts # PutLessonProgress, GetUserProgress
```

**نقطة المراقبة:** تأكد أن `Progress.Schemas.ts` لا يقبل `XpEarned` أبداً. XP يُقرأ من `Lessons.XpReward` في DB.

#### 3.2 Feature: Sandbox — SEV-005

```
Features/Sandbox/
├── Sandbox.Types.ts
├── Sandbox.Schemas.ts     # Messages array: max 50, max 10k chars each
├── Sandbox.Service.ts     # DecryptKey + Anthropic call
└── Sandbox.Controller.ts  # SSE stream + error handling (no err.message to client)
```

#### 3.3 Feature: Mascot — SEV-002

```
Features/Mascot/
├── Mascot.Types.ts
├── Mascot.Schemas.ts      # ChatMessage, pathname, locale (validated)
├── Mascot.Service.ts      # BuildSystemPrompt()
└── Mascot.Controller.ts   # Rate limited: WithRateLimit(UserId, AI_RATE_LIMIT)
```

#### 3.4 Feature: Onboarding — SEV-008, SEV-003

```
Features/Onboarding/
├── Onboarding.Types.ts    # IOnboardingInput, EAgeGroup, EGoal, EExperience, ELearningStyle
├── Onboarding.Schemas.ts  # Enum validation (ageGroup, goal, experience, learningStyle)
├── Onboarding.Service.ts  # GenerateLearningPath(Input, AgentSlug = 'claude')
└── Onboarding.Controller.ts
```

#### 3.5 Feature: Profile — SEV-012

```
Features/Profile/
├── Profile.Types.ts       # IPublicProfile
├── Profile.Service.ts     # GetUserProfile() — JOIN query بدل N+1
└── Profile.Controller.ts  # GetProfile(UserId, Locale)
```

**Join بدل N+1:**
```typescript
// بدلاً من 3 queries + O(n²) find()
const AchievementData = await db
  .select({ Id: achievements.Id, Emoji: achievements.Emoji, EarnedAt: userAchievements.EarnedAt })
  .from(userAchievements)
  .innerJoin(achievements, eq(userAchievements.AchievementId, achievements.Id))
  .where(eq(userAchievements.UserId, UserId));
```

#### 3.6 باقي الـ Features (بترتيب الأولوية):

```
Features/Auth/         ← Auth.Config.ts (email verification ON)
Features/Lessons/      ← نقل Content Queries
Features/Keys/         ← API key management + schema validation
Features/User/         ← learning-path + preferences
Features/Leaderboard/  ← بسيط — نقل فقط
Features/Admin/        ← Admin lessons CRUD
```

**✅ تحقق من النجاح:**
```bash
bun run typecheck
# كل API routes تستدعي Features — لا logic في route.ts
# WithRateLimit موجود في mascot + sandbox
```

---

## المرحلة 4 — API Routes + Frontend Pages

**الهدف:** تحويل route.ts لـ thin wrappers + إعادة هيكلة صفحات الـ frontend.

### 4.1 API Routes — Thin Wrappers

كل `route.ts` يصبح:
```typescript
// app/api/v1/progress/lesson/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PutLessonProgress } from '@/Features/Progress/Progress.Controller';

export async function PUT(
  Req: NextRequest,
  { Params }: { Params: Promise<{ Id: string }> },
) {
  const { Id } = await Params;
  const LessonId = parseInt(Id);
  if (isNaN(LessonId)) {
    return NextResponse.json({ Success: false, Error: { Code: 'INVALID_ID', Message: 'Invalid lesson id' } }, { status: 400 });
  }
  return PutLessonProgress(Req, LessonId);
}
```

**API Versioning:** كل routes تنتقل من `/api/...` إلى `/api/v1/...`

**ملاحظة:** Better Auth route يبقى `/api/auth/[...all]` بدون `/v1/` لأنه external contract.

### 4.2 Frontend Pages — Page Structure

لكل صفحة، البنية تصبح:
```
app/[locale]/(main)/dashboard/
├── page.tsx           # Server Component — await params, metadata, getTranslations
├── PageContent.tsx    # Client Component — يستدعي hooks، يمرر props
├── _hooks.ts          # UseUserStats, UseProgress
├── _types.ts          # TDashboardState
└── Components/
    ├── XpBar.tsx
    ├── StreakCard.tsx
    ├── LessonGrid.tsx
    └── AchievementBadge.tsx
```

**ترتيب الصفحات للتحويل:**
1. `login` + `register` — بسيطة، جيدة للبداية
2. `dashboard` — الأكثر استخداماً
3. `agents/[agentSlug]` + `lessons/[lessonId]`
4. `sandbox`
5. `leaderboard` + `profile/[userId]`
6. `onboarding`
7. `admin`

### 4.3 إضافة Zod على الـ Frontend (SEV-003)

في كل `_hooks.ts`:
```typescript
// UseLoginForm._hooks.ts
import { LoginSchema } from '@/Features/Auth/Auth.Schemas';

const HandleSubmit = async (Ev: React.FormEvent) => {
  const Parsed = LoginSchema.safeParse({ Email, Password });
  if (!Parsed.success) {
    SetErrors(Parsed.error.flatten().fieldErrors);
    return;
  }
  // ...
};
```

**✅ تحقق من النجاح:**
```bash
bun run typecheck
bun run build          # Production build يجب أن ينجح
# كل route.ts <= 30 سطر
# كل PageContent.tsx <= 300 سطر
```

---

## المرحلة 5 — UI/A11y + Tests + Performance

**الهدف:** إصلاح الـ UI issues + بناء test foundation.

### 5.1 Mascot Fixes — SEV-017, SEV-018, SEV-019

```typescript
// Shared/Components/Mascot/Mascot.tsx

// role + keyboard
<motion.div
  role="button"
  tabIndex={0}
  aria-label={Locale === 'ar' ? 'فتح محادثة مع ذكي' : 'Open chat with Zaki'}
  aria-expanded={ChatOpen}
  onKeyDown={(E) => {
    if (E.key === 'Enter' || E.key === ' ') { E.preventDefault(); SetChatOpen(P => !P); }
  }}
>

// prefers-reduced-motion
const PrefersReduced = useReducedMotion();
animate={PrefersReduced ? {} : { y: [0, -7, 0] }}
transition={PrefersReduced ? {} : { repeat: Infinity, duration: 2.6 }}

// RTL bubble
style={{ bottom: '100%', [IsRTL(Locale) ? 'left' : 'right']: 0 }}

// X button aria-label
<button aria-label={Locale === 'ar' ? 'إغلاق الرسالة' : 'Close message'}>
```

### 5.2 Login Page — SEV-020

```typescript
// حذف "Forgot Password" button حتى يتم بناء الميزة
// لا dead UI
```

### 5.3 بناء Tests Foundation — SEV-013

**إضافة Vitest:**
```bash
bun add -d vitest @vitejs/plugin-react
```

**أولى الـ tests (pure functions — لا DB):**
```
Features/Progress/__tests__/Progress.Service.test.ts
  → CalcStreak (null, today, consecutive, gap)
  → AchievementCondition checks

Features/Onboarding/__tests__/Onboarding.Service.test.ts
  → ResolveTrack (developer, educator, creative, advanced, default)
  → ScoreLesson (beginner, advanced, game learner)

Lib/I18n/__tests__/Locale.Utils.test.ts
  → GetValidLocale ('ar', 'en', 'invalid', null)
  → GetDir, IsRTL
```

**Target initial:** 70%+ coverage على business logic functions.

### 5.4 Translation Caching — SEV-024

```typescript
// Lib/Db/Queries/Content.Queries.ts
// إضافة in-memory cache (بسيط، TTL = 1 ساعة)

const TranslationCache = new Map<string, { Data: unknown; ExpiresAt: number }>();
const CACHE_TTL_MS = 3_600_000; // 1 hour

export async function FetchWithFallback(
  EntityType: string,
  EntityIds: number[],
  Locale: TLocale,
) {
  const CacheKey = `${EntityType}:${EntityIds.join(',')}:${Locale}`;
  const Cached = TranslationCache.get(CacheKey);
  if (Cached && Cached.ExpiresAt > Date.now()) return Cached.Data;

  const Result = await FetchFromDb(EntityType, EntityIds, Locale);
  TranslationCache.set(CacheKey, { Data: Result, ExpiresAt: Date.now() + CACHE_TTL_MS });
  return Result;
}
```

**ملاحظة:** هذا in-memory cache — يُفقد عند إعادة تشغيل الـ server. للـ production المتوسع: Redis (Upstash). لكن يحل المشكلة الأساسية في مرحلة مبكرة.

**✅ تحقق من النجاح:**
```bash
bun run typecheck
bun run test           # كل tests تمر
bun run build          # production build ينجح
# Mascot: Tab navigation يعمل
# prefers-reduced-motion: motion تتوقف
# RTL: bubble في الموضع الصحيح
```

---

## ترتيب الملفات المتأثرة في كل مرحلة

### مرحلة 1 (DB + Config)
```
Lib/Db/Schema.ts              ← إعادة كتابة كاملة
Lib/Db/Seed.ts                ← تحديث للـ PascalCase
Lib/Monitoring/Sentry.Client.ts  ← جديد (من sentry.client.config.ts)
Lib/Monitoring/Sentry.Server.ts  ← جديد (من sentry.server.config.ts)
Features/Auth/Auth.Config.ts  ← جديد (من lib/auth.ts)
next.config.ts                ← إضافة security headers
package.json                  ← إضافة typecheck script
.env.example                  ← إضافة المتغيرات الناقصة
```

### مرحلة 2 (Shared Infrastructure)
```
Shared/Types/Api.Types.ts         ← جديد
Shared/Types/Common.Types.ts      ← جديد
Shared/Middleware/Auth.Middleware.ts       ← جديد
Shared/Middleware/Validation.Middleware.ts ← جديد
Shared/Middleware/RateLimit.Middleware.ts  ← جديد
Lib/I18n/Locale.Utils.ts          ← تحديث (PascalCase + GetValidLocale)
Lib/Db/Queries/Content.Queries.ts ← تحديث (PascalCase exports)
Lib/Ai/Providers.ts               ← تحديث (إزالة console.log)
```

### مرحلة 3 (Features Backend)
```
Features/Progress/*    ← جديد (4 ملفات)
Features/Sandbox/*     ← جديد (4 ملفات)
Features/Mascot/*      ← جديد (4 ملفات)
Features/Onboarding/*  ← جديد (4 ملفات)
Features/Profile/*     ← جديد (3 ملفات)
Features/Auth/*        ← جديد (6 ملفات)
Features/Lessons/*     ← جديد (4 ملفات)
Features/Keys/*        ← جديد (4 ملفات)
Features/User/*        ← جديد (3 ملفات)
Features/Leaderboard/* ← جديد (3 ملفات)
Features/Admin/*       ← جديد (4 ملفات)
```

### مرحلة 4 (Routes + Pages)
```
app/api/v1/**/*.ts        ← كل routes تصبح thin wrappers
app/[locale]/**/*.tsx     ← إعادة هيكلة الصفحات
```

### مرحلة 5 (UI + Tests)
```
Shared/Components/Mascot/Mascot.tsx  ← a11y fixes
app/[locale]/(auth)/login/page.tsx   ← إزالة dead UI
Features/**/__tests__/*.test.ts      ← tests جديدة
Lib/Db/Queries/Content.Queries.ts    ← إضافة cache
```

---

## قائمة تحقق pre-PR لكل مرحلة

```
[ ] bun run typecheck → لا أخطاء
[ ] bun run build → ينجح
[ ] bun run test → كل tests تمر (من مرحلة 5 فصاحاً)
[ ] لا console.log في كود الإنتاج
[ ] لا any types
[ ] كل ملف <= 600 سطر
[ ] كل function لها JSDoc
[ ] كل ملف له header comment
[ ] PascalCase في كل identifiers
[ ] Standard response format في كل API endpoints
[ ] Rate limiting مُطبَّق على AI endpoints
[ ] Zod validation على كل API inputs
```
