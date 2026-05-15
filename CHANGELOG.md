# Changelog — ذكاوي (Zkawi)

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planning

- توسعة المنصة من مسار واحد (AI) إلى 8 مسارات تعليمية
  - البرمجة للأطفال (JavaScript، Python)
  - قواعد البيانات
  - أنماط التصميم البرمجي
  - حل المشكلات والتفكير الخوارزمي
  - بناء المشاريع
  - هندسة الـ Prompts
  - تصميم الويب
- إصلاحات i18n المرحلة الأولى
  - ترجمة رسائل المسكوت (Mascot) لكل الـ locales
  - ترجمة تسميات الوحدات والـ units
  - توطين system prompts لكل مزود AI
- دعم لغات إضافية بجانب AR + EN

---

## [0.2.0] — 2026-05-15

إعادة هيكلة شاملة للمعمارية + إصلاح ثغرات أمنية + تحديث كامل لـ schema قاعدة البيانات.

### Architecture

- **Feature-first structure**: `Features/`، `Lib/`، `Shared/` — كل feature له Controller + Service + Schemas + Types منفصلة
- **API versioning**: كل routes انتقلت لـ `/api/v1/` — thin wrappers تفوض للـ Feature modules
- **Standard response format**: `{ Success: boolean, Data/Error, Meta }` على كل الـ endpoints
- **Shared types**: `src/Shared/Types/Api.Types.ts` — `TApiSuccess`، `TApiError`، `TApiResponse<T>`

### Database

- **Schema overhaul**: إعادة تسمية كاملة — PascalCase لكل الجداول والأعمدة
- **Per-entity translation tables**: حذف جدول `translations` العالمي (EAV) وتعويضه بجداول منفصلة لكل entity
  - `AgentTranslations`، `LessonTranslations`، `QuizQuestionTranslations`
  - `QuizOptionTranslations`، `AchievementTranslations`، `TrackTranslations`
- **uuidv7 PKs**: على كل جداول المحتوى والمستخدمين (time-sortable، أداء index أفضل)
- **DB indexes**: على كل hot query paths — `UserProgress`، `UserAchievements`، `LearningPaths`، `SandboxSessions`
- **UNIQUE constraint**: `UserProgress(UserId, LessonId)` — يمنع race condition عند إكمال الدرس
- **أمر جديد** `db:clear`: يحذف كل شيء (tables، views، types، sequences، schemas) + migration files — بداية نظيفة كاملة

### Security Fixes

- **SEV-001**: XP يُحسب الآن server-side من DB فقط — لا تثق بأي قيمة من الـ client
- **SEV-002**: Rate limiting على كل AI endpoints — 20 req/min per user، sliding window
- **SEV-003**: Zod validation على كل API routes بدون استثناء
- **SEV-004**: DB indexes على hot query paths لمنع full table scans
- **SEV-005**: SSE streams ترسل error codes فقط — لا تسرب internal messages
- **SEV-006**: Email verification إلزامي عند التسجيل — لا يمكن تخطيها
- **SEV-007**: Sentry sample rates مشروطة بالبيئة — 10% traces في production فقط
- **SEV-011**: UNIQUE على `UserProgress(UserId, LessonId)` — يمنع الصفوف المكررة
- **SEV-016**: Security headers على كل routes

### i18n

- إضافة namespace جديد `apiErrors` — 17 error code بترجمة عربية وإنجليزية
- رسائل خطأ الـ API مترجمة بناءً على `X-Locale` أو `Accept-Language` header
- ثابت `SUPPORTED_LOCALES` للـ locale validation في كل مكان

### Other

- Soft delete (`IsDeleted: boolean`) على كل جداول المحتوى
- حزمة `uuidv7` لتوليد UUIDs زمنية قابلة للفرز

---

## [0.1.0] — 2026-04-15

الإصدار التأسيسي — منصة تعليمية لـ AI (Claude أولاً).

### Added

- **البنية الأساسية**
  - Next.js 16 App Router + Bun + TypeScript + Tailwind CSS v4
  - PostgreSQL + Drizzle ORM
  - better-auth (email/password authentication)
  - next-intl — عربي (`ar`) وإنجليزي (`en`) مع RTL/LTR تلقائي
  - Framer Motion للـ animations
- **المحتوى**
  - Agent: Claude — 5 دروس تفاعلية مع كويز متعدد الخيارات ومكافآت XP
  - مواضيع: ما هو Claude، Prompt Engineering، حالات الاستخدام، المميزات المتقدمة، API intro
- **UI/UX**
  - عربي أولاً، dark mode افتراضي
  - Header مع ThemeToggle وLanguage Switcher وUser menu
  - Footer، شعار مسكوت روبوت (SVG)، brand color tokens
  - صفحة الدرس: محتوى + كويز + شاشة إكمال
  - Dashboard: XP bar، streak counter، إنجازات، قائمة دروس
- **المصادقة**
  - صفحات Sign up / Login
  - Header مدرك للجلسة + protected routes
- **التقدم والإنجازات**
  - نظام XP ومستويات
  - نظام Streaks (consecutive days)
  - Achievements قابلة للكسب
  - Leaderboard — أفضل 50 مستخدم
- **Sandbox**
  - Chat مع Claude بمفتاح Anthropic الخاص بالمستخدم
  - تشفير AES-256-GCM للمفتاح قبل التخزين
- **مسكوت ذكاوي (Zaki)**
  - AI mascot chat — يساعد المتعلمين أثناء الدروس
  - Multi-provider: OpenRouter → Gemini → OpenAI → Anthropic
- **SEO والـ PWA**
  - Dynamic `generateMetadata` لكل route
  - OG images عبر Edge Runtime (`/api/og`)
  - JSON-LD Structured Data (WebSite، Organization، Course، LearningResource، Breadcrumb)
  - `robots.txt`، `sitemap.xml`، hreflang tags
  - PWA manifest + Service Worker + Install Banner
- **Sentry** — error tracking وperformance monitoring
- **Admin Panel**
  - CRUD الدروس للمدراء
  - `isAdminEmail()` guard من `ADMIN_EMAILS` env var
- **Onboarding**
  - wizard بـ 5 خطوات عند أول دخول
  - توليد مسار تعليمي مخصص بناءً على العمر والهدف والمستوى
- **Database**
  - schema كامل: Better Auth tables + content tables + user tables
  - `bun run db:all` — reset → generate → migrate → seed في أمر واحد

---

[Unreleased]: https://github.com/sabrydawood/claude/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/sabrydawood/claude/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/sabrydawood/claude/releases/tag/v0.1.0
