# حالة المشروع — ذكاوي (Zkawi)

> هذا الملف يُحدَّث يدوياً في نهاية كل جلسة تطوير.
> **الغرض:** تتبع ما تم الاتفاق عليه، وما اكتمل، والخطوة القادمة.

---

## آخر تحديث: 2026-05-14

---

## ما تم الاتفاق عليه (القرارات المصيرية)

| القرار | التفاصيل | السبب |
|--------|----------|-------|
| **Stack** | Next.js 15 + Bun + PostgreSQL + Drizzle | سرعة التطوير + ميزات App Router |
| **Auth** | better-auth (email/password فقط في البداية) | بسيط وآمن للـ MVP |
| **i18n** | Translation Table في DB + next-intl للـ UI | إضافة لغة = INSERT فقط، لا schema changes |
| **Dark Mode** | dark هو الـ default، light اختياري | طلب المستخدم صراحةً |
| **اللغة** | عربية عامية مصرية أولاً، ولا فصحى في الـ UI | الجمهور المستهدف |
| **Onboarding** | Wizard 5 خطوات قبل الدخول للـ Dashboard | تجربة شخصية للمستخدم |
| **Sandbox** | المستخدم يجلب مفتاحه الخاص (BYOK) | لتجنب تكاليف الـ API على المنصة |
| **Admin** | Web UI بسيط فقط (بدون Strapi/Contentful) | بسيط ومخصص |
| **Content API** | REST endpoints لـ AI agents (Claude Code) | يسمح لـ Claude Code بإضافة محتوى برمجياً |
| **اسئل دائماً** | يجب استخدام `AskUserQuestion` tool قبل أي خطوة | طلب المستخدم صراحةً |

---

## ما تم إنجازه (بالترتيب الزمني)

### الجلسة الأولى — البنية الأساسية
- [x] Next.js 15 App Router مع `[locale]` segment
- [x] Bun كـ package manager + runtime
- [x] Tailwind CSS v4 مع `@variant dark`
- [x] better-auth (email/password)
- [x] next-intl للـ i18n (ar + en)
- [x] Route Groups: `(auth)` و`(main)`

### الجلسة الثانية — المحتوى والـ DB
- [x] Branding: لوجو SVG robot mascot، OG image، favicon، manifest
- [x] `src/lib/brand.ts` + `<Logo>` component
- [x] Translation Table pattern في DB schema
- [x] db:reset + db:generate + db:migrate + db:seed (`bun run db:all`)
- [x] 5 دروس Claude + كويز + نظام XP (static content في `claude-lessons.ts`)
- [x] SEO كامل: sitemap.xml، robots.txt، JSON-LD، OG PNG ديناميكي
- [x] ARCHITECTURE.md + ROADMAP.md

### الجلسة الثالثة — Dark Mode + Onboarding
- [x] **Dark/Light Mode كامل** (CSS custom properties لكل المكونات)
  - `globals.css` مع semantic tokens
  - ThemeProvider (next-themes) + ThemeToggle component
  - تحديث كل UI components: Button، Card، Input، Badge، Progress
  - تحديث كل الصفحات والمكونات
- [x] **Onboarding Wizard** (`/onboarding`) — 5 خطوات متحركة
- [x] **Learning Tracks** — 5 مسارات في DB مع translations
- [x] **Schema جديد** — tracks، user_preferences، learning_paths، encrypted_keys، sandbox_sessions
- [x] **Learning Path Generator** (`src/lib/learning-path.ts`)
- [x] **APIs** — `POST /api/onboarding` + `GET /api/user/preferences`
- [x] Dashboard يتحقق من Onboarding ويُعيد التوجيه

---

## الخطوة القادمة (بالترتيب)

### 1. ربط التقدم بـ DB (أهم شيء الآن)
حالياً التقدم محفوظ في `localStorage` — يجب ربطه بقاعدة البيانات:
- `PUT /api/progress/lesson/:id` — إكمال درس
- `GET /api/progress` — جلب تقدم المستخدم
- `PUT /api/stats` — تحديث XP + streak

### 2. Sandbox (جاهز الـ Schema — ينقصه الـ UI والـ API)
- واجهة Chat بسيطة
- حفظ مفتاح API مشفر (`/api/keys`)
- استدعاء Claude API من server-side

### 3. Dashboard الشخصي
- عرض المسار المخصص من `learning_paths` بدلاً من الترتيب الثابت

### 4. Admin Panel
- `/admin` — CRUD بسيط للدروس والمحتوى

---

## ملاحظات تقنية مهمة

| الموضوع | الملاحظة |
|---------|----------|
| **Build** | `bun run build` يعمل ✅ (16 صفحة) |
| **TypeScript** | لا أخطاء TS |
| **Better Auth** | يحتاج `BETTER_AUTH_SECRET` في `.env.local` للـ production |
| **DB** | يحتاج `DATABASE_URL` في `.env.local` |
| **Branch** | `claude/multilingual-portfolio-arabic-y4s8P` |
| **Next.js docs** | اقرأ `node_modules/next/dist/docs/` قبل أي كود Next.js جديد |

---

## الملفات الرئيسية (مرجع سريع)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              ← الصفحة الرئيسية
│   │   ├── onboarding/page.tsx  ← Wizard (جديد)
│   │   ├── (auth)/login|register
│   │   └── (main)/dashboard|agents/...
│   ├── api/
│   │   ├── onboarding/route.ts  ← حفظ preferences (جديد)
│   │   ├── user/preferences/route.ts ← حالة onboarding (جديد)
│   │   └── og/route.tsx         ← OG image ديناميكي
│   └── globals.css              ← CSS tokens للـ themes
├── components/
│   ├── layout/header.tsx + footer.tsx
│   ├── ui/ (Button, Card, Input, Badge, Progress, Logo, ThemeToggle)
│   ├── home/ (Hero, Stats, Features, Agents, HowItWorks, CTA)
│   ├── agents/lesson-card.tsx
│   ├── quiz/quiz-component.tsx
│   └── dashboard/xp-bar.tsx
├── lib/
│   ├── db/schema.ts             ← Schema الكامل (18 جدول)
│   ├── db/seed.ts               ← Seed data
│   ├── db/reset.ts              ← Reset + migrate
│   ├── db/i18n.ts               ← Translation helpers
│   ├── learning-path.ts         ← Path generator (جديد)
│   └── content/claude-lessons.ts ← Static content
└── messages/
    ├── ar.json                  ← الترجمات العربية
    └── en.json                  ← الترجمات الإنجليزية
```
