# Audit Fixes Mapping — Zkawi (ذكاوي)

> **تاريخ الخطة:** 2026-05-15
> **المصدر:** `audit-report.md` (SEV-001 → SEV-024)
> **المرجع:** `docs/Architecture.Plan.md` + `docs/Migration.Plan.md`

---

## جدول الـ Mapping الكامل

| SEV | الخطورة | الوصف | الحل | الملف في Architecture الجديدة | المرحلة |
|-----|---------|-------|------|-------------------------------|---------|
| SEV-001 | 🔴 حرج | التلاعب بالـ XP من الـ client | XP يُقرأ من `Lessons.XpReward` في DB — لا يُقبل من request body | `Features/Progress/Progress.Service.ts` → `CompleteLessonService()` | 3 |
| SEV-002 | 🔴 حرج | غياب Rate Limiting على AI endpoints | `WithRateLimit(UserId, AI_RATE_LIMIT)` في mascot + sandbox controllers | `Shared/Middleware/RateLimit.Middleware.ts` | 2+3 |
| SEV-003 | 🟠 عالي | غياب Schema Validation | Zod schema في كل Feature + `ParseBodyOrBadRequest()` | كل `Features/*/X.Schemas.ts` + `Shared/Middleware/Validation.Middleware.ts` | 2+3+4 |
| SEV-004 | 🟠 عالي | غياب DB Indexes | Indexes على UserProgress, UserAchievements, LearningPaths, SandboxSessions | `Lib/Db/Schema.ts` | 1 |
| SEV-005 | 🟠 عالي | تسريب error messages في SSE | `console.error` server-only، رسالة عامة للـ client | `Features/Sandbox/Sandbox.Controller.ts` + `Features/Mascot/Mascot.Controller.ts` | 3 |
| SEV-006 | 🟠 عالي | Email Verification معطّل | `requireEmailVerification: true` + SMTP config | `Features/Auth/Auth.Config.ts` | 1 |
| SEV-007 | 🟡 متوسط | Sentry sample rates 100% في production | `IsProd ? 0.1 : 1.0` للـ traces، `IsProd ? 0.05 : 1.0` للـ profiles | `Lib/Monitoring/Sentry.Client.ts` | 1 |
| SEV-008 | 🟡 متوسط | Learning path مربوط بـ 'claude' hardcoded | `GenerateLearningPath(Input, AgentSlug = 'claude')` — parameter لا hardcoded | `Features/Onboarding/Onboarding.Service.ts` | 3 |
| SEV-009 | 🟡 متوسط | تكرار منطق جلب الترجمات | `FetchWithFallback` + `BuildTransMap` exported مرة واحدة — يُستخدم في كل Features | `Lib/Db/Queries/Content.Queries.ts` | 2 |
| SEV-010 | 🟡 متوسط | locale غير موثّق في API routes | `GetValidLocale()` utility — يُعيد 'ar' كـ default لأي قيمة غير صحيحة | `Lib/I18n/Locale.Utils.ts` | 2 |
| SEV-011 | 🟡 متوسط | لا UNIQUE constraint على `UserProgress(UserId, LessonId)` | `unique('Uq_UserProgress_UserLesson').on(T.UserId, T.LessonId)` + `onConflictDoUpdate` | `Lib/Db/Schema.ts` | 1 |
| SEV-012 | 🟡 متوسط | N+1 في profile endpoint | JOIN واحد بدل 3 queries + `Map` بدل `find()` داخل `map()` | `Features/Profile/Profile.Service.ts` → `GetUserProfile()` | 3 |
| SEV-013 | 🟢 منخفض | غياب تام للـ Tests | Vitest + unit tests على pure functions أولاً | `Features/**/__tests__/*.test.ts` | 5 |
| SEV-014 | 🟢 منخفض | متغيرات بيئة حرجة غائبة عن `.env.example` | إضافة: `ENCRYPTION_KEY`, `ADMIN_EMAILS`, `ANTHROPIC_API_KEY`, `SMTP_*` | `.env.example` | 1 |
| SEV-015 | 🟢 منخفض | `console.log` في كود الإنتاج | Sentry breadcrumbs بدلاً من console.log | `Lib/Ai/Providers.ts` | 2 |
| SEV-016 | 🟢 منخفض | غياب Security Headers | `headers()` في next.config.ts: X-Frame-Options, X-Content-Type-Options, etc. | `next.config.ts` | 1 |
| SEV-017 | 🟢 منخفض | Mascot بدون keyboard support و aria | `role="button"`, `tabIndex={0}`, `aria-label`, `onKeyDown` | `Shared/Components/Mascot/Mascot.tsx` | 5 |
| SEV-018 | 🟢 منخفض | غياب `prefers-reduced-motion` | `useReducedMotion()` على كل `repeat: Infinity` | `Shared/Components/Mascot/Mascot.tsx` + login page | 5 |
| SEV-019 | 🟢 منخفض | Speech bubble RTL bias (`right: 0`) | `[IsRTL(Locale) ? 'left' : 'right']: 0` | `Shared/Components/Mascot/Mascot.tsx` | 5 |
| SEV-020 | 🟢 منخفض | "Forgot Password" dead UI | حذف الزر حتى تُبنى الميزة | `app/[locale]/(auth)/login/PageContent.tsx` | 4 |
| SEV-021 | ⚪ للعلم | Framer Motion bundle size | Lazy imports للـ pages التي لا تحتاج animation | مستقبلي — ليس في الخطة الحالية | — |
| SEV-022 | ⚪ للعلم | `typecheck` script غير موجود | `"typecheck": "tsc --noEmit"` | `package.json` | 1 |
| SEV-023 | ⚪ للعلم | Session token plaintext (تصميم Better Auth) | تشفير DB at rest على مستوى البنية التحتية | Infrastructure (Postgres disk encryption) — خارج نطاق الكود | — |
| SEV-024 | ⚪ للعلم | Translation queries بدون cache | In-memory cache بـ TTL = 1h | `Lib/Db/Queries/Content.Queries.ts` | 5 |

---

## الـ SEVs مجمّعة حسب المرحلة

### مرحلة 1 — DB + Config
- ✅ SEV-004 — DB indexes
- ✅ SEV-006 — Email verification ON
- ✅ SEV-007 — Sentry sample rates
- ✅ SEV-011 — UNIQUE constraint
- ✅ SEV-014 — .env.example
- ✅ SEV-016 — Security headers
- ✅ SEV-022 — typecheck script

### مرحلة 2 — Shared Infrastructure
- ✅ SEV-002 (pattern) — Rate limit middleware يُنشأ
- ✅ SEV-003 (pattern) — Validation middleware يُنشأ
- ✅ SEV-009 — Translation deduplication
- ✅ SEV-010 — Locale validation
- ✅ SEV-015 — console.log removed

### مرحلة 3 — Feature Modules
- ✅ SEV-001 — XP computed server-side
- ✅ SEV-002 — Rate limit applied to mascot + sandbox
- ✅ SEV-003 — Zod schemas في كل Feature
- ✅ SEV-005 — Error message sanitized in SSE
- ✅ SEV-008 — Learning path parameterized
- ✅ SEV-012 — Profile N+1 fixed with JOIN

### مرحلة 4 — Routes + Pages
- ✅ SEV-003 — Zod على الـ frontend (في _hooks.ts)
- ✅ SEV-020 — Forgot password dead UI removed

### مرحلة 5 — UI + Tests + Performance
- ✅ SEV-013 — Tests (Vitest)
- ✅ SEV-017 — Mascot keyboard + aria
- ✅ SEV-018 — prefers-reduced-motion
- ✅ SEV-019 — RTL bubble position
- ✅ SEV-024 — Translation cache

### خارج النطاق — لا كود يحلها
- ⚠️ SEV-021 — Framer Motion bundle: تحسين مستقبلي
- ⚠️ SEV-023 — Session token plaintext: تصميم Better Auth، حل على مستوى DB encryption

---

## الـ SEVs حسب الملف في Architecture الجديدة

| الملف | SEVs المحلولة |
|-------|--------------|
| `Lib/Db/Schema.ts` | SEV-004, SEV-011 |
| `Features/Auth/Auth.Config.ts` | SEV-006 |
| `Lib/Monitoring/Sentry.Client.ts` | SEV-007 |
| `next.config.ts` | SEV-016 |
| `.env.example` | SEV-014 |
| `package.json` | SEV-022 |
| `Shared/Middleware/RateLimit.Middleware.ts` | SEV-002 |
| `Shared/Middleware/Validation.Middleware.ts` | SEV-003 (pattern) |
| `Lib/I18n/Locale.Utils.ts` | SEV-010 |
| `Lib/Db/Queries/Content.Queries.ts` | SEV-009, SEV-024 |
| `Lib/Ai/Providers.ts` | SEV-015 |
| `Features/Progress/Progress.Service.ts` | SEV-001 |
| `Features/Progress/Progress.Schemas.ts` | SEV-003 (progress) |
| `Features/Sandbox/Sandbox.Controller.ts` | SEV-005 |
| `Features/Sandbox/Sandbox.Schemas.ts` | SEV-003 (sandbox) |
| `Features/Mascot/Mascot.Controller.ts` | SEV-002, SEV-005 |
| `Features/Mascot/Mascot.Schemas.ts` | SEV-003 (mascot) |
| `Features/Onboarding/Onboarding.Service.ts` | SEV-008 |
| `Features/Onboarding/Onboarding.Schemas.ts` | SEV-003 (onboarding) |
| `Features/Profile/Profile.Service.ts` | SEV-012 |
| `Features/Keys/Keys.Schemas.ts` | SEV-003 (keys) |
| `Shared/Components/Mascot/Mascot.tsx` | SEV-017, SEV-018, SEV-019 |
| `app/[locale]/(auth)/login/PageContent.tsx` | SEV-020 |
| `Features/**/__tests__/*.test.ts` | SEV-013 |

---

## مؤشرات النجاح بعد الانتهاء

| المؤشر | الهدف | الأداة |
|--------|-------|--------|
| TypeScript errors | 0 | `bun run typecheck` |
| Test coverage على business logic | ≥ 70% | Vitest |
| Production build | ينجح | `bun run build` |
| XP manipulation | مستحيل من client | Manual test |
| AI rate limit | 20 req/min per user | Manual test |
| Email verification | مطلوب عند التسجيل | Manual test |
| Mascot keyboard navigation | يعمل بـ Tab + Enter | Manual test |
| prefers-reduced-motion | يوقف الـ animation | Browser setting |
| Security headers | موجودة | securityheaders.com |
| console.log في production | 0 | ESLint no-console |
| Dead UI elements | 0 | Manual review |
| Files > 600 lines | 0 | ESLint max-lines |
