# Architecture — ذكاوي (Zkawi)

## نظرة عامة

ذكاوي منصة تعليمية متعددة اللغات تعتمد على **Next.js App Router** مع قاعدة بيانات **PostgreSQL** وبنية **server-first** لضمان أداء جيد وـSEO قوي.

---

## القرارات التقنية الجوهرية

### 1. Translation Table بدلاً من Column-per-Language

**المشكلة:** الطريقة الشائعة (`nameAr`, `nameEn`) تتطلب `ALTER TABLE` لكل لغة جديدة.

**الحل المختار:**
```
translations (entity_type, entity_id, locale, field, value)
UNIQUE (entity_type, entity_id, locale, field)
```

**النتيجة:**
- إضافة لغة جديدة = INSERT rows فقط، صفر تغييرات في الـ schema
- الجداول الأصلية تحتوي فقط على البيانات غير القابلة للترجمة

**من يحتاج translations ومن لا:**
| الجدول | يحتاج translations؟ | السبب |
|---|---|---|
| `agents` | ✅ نعم | name, description = محتوى معروض |
| `lessons` | ✅ نعم | title, content = محتوى تعليمي |
| `quiz_questions` | ✅ نعم | نص السؤال |
| `quiz_options` | ✅ نعم | نص الخيار |
| `achievements` | ✅ نعم | name, description معروضة |
| `users` | ❌ لا | بيانات شخصية، مش content |
| `sessions` | ❌ لا | tokens وبيانات auth |
| `userProgress` | ❌ لا | أرقام وتواريخ |
| `userStats` | ❌ لا | أرقام فقط |
| `userAchievements` | ❌ لا | علاقة ربط فقط |

---

### 2. Static Content + DB Hybrid

المحتوى موجود في **ملفين** بالتوازي:

| المكان | الاستخدام |
|---|---|
| `src/lib/content/claude-lessons.ts` | الـ UI يقرأ منه مباشرة (سريع، بدون DB) |
| DB (`lessons` + `translations`) | تتبع التقدم، الـ API، الإضافات المستقبلية |

هذا النهج يسمح بـ:
- تشغيل الـ UI بدون DB (مفيد للـ development)
- حفظ التقدم والبيانات الديناميكية في DB
- المرونة في الانتقال التدريجي نحو DB-driven content

---

### 3. Next.js App Router مع `[locale]` Segment

```
app/
  [locale]/          ← كل الصفحات تحت locale prefix
    (auth)/          ← Route Group — مش ليها layout مشترك
    (main)/          ← Route Group — ليها layout مع Header/Footer
```

**لماذا Route Groups؟** لأن صفحات Auth (login/register) ليها تصميم مختلف تماماً عن صفحات التطبيق.

**لماذا Server Components للـ layout؟** لإضافة `generateMetadata` لكل صفحة لأن الـ page نفسها `'use client'`.

---

### 4. Dynamic SEO Architecture

```
layout.tsx (server)  ← generateMetadata() + JSON-LD injection
  └── page.tsx (client) ← التفاعل والـ animations
```

كل route segment ليها layout server component مخصوص يعمل:
- `generateMetadata()` بـ locale-aware titles/descriptions
- JSON-LD Structured Data (WebSite, Course, LearningResource, BreadcrumbList)
- hreflang alternates (ar ↔ en ↔ x-default)
- Canonical URLs

الـ OG image ديناميكي عبر `/api/og?title=&agent=&locale=` (Edge Runtime → PNG).

---

### 5. Authentication مع better-auth

**لماذا better-auth بدلاً من NextAuth؟**
- TypeScript-first بالكامل
- تكامل سلس مع Drizzle ORM
- Edge Runtime compatible
- Schema يتولد تلقائياً من الـ config

---

## هيكل قاعدة البيانات

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTH DOMAIN                            │
│  users ─┬─ sessions                                        │
│         ├─ accounts (OAuth future)                          │
│         ├─ user_stats (xp, streak, level)                   │
│         ├─ user_progress (per lesson)                       │
│         └─ user_achievements                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CONTENT DOMAIN                           │
│  agents ──── lessons ──── quiz_questions ── quiz_options    │
│                                                             │
│  achievements                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      I18N LAYER                             │
│  translations (entity_type, entity_id, locale, field, val)  │
│                                                             │
│  ← كل المحتوى النصي للـ Content Domain يُخزَّن هنا          │
└─────────────────────────────────────────────────────────────┘
```

---

## مجلدات المشروع

```
src/
├── app/
│   ├── [locale]/              # كل الصفحات
│   │   ├── layout.tsx         # Server: generateMetadata + fonts + dir
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   ├── (auth)/            # Login + Register (no shared layout)
│   │   └── (main)/            # Dashboard + Agents + Lessons
│   │       └── agents/[agentSlug]/
│   │           ├── layout.tsx # Server: CourseSchema + generateMetadata
│   │           └── lessons/[lessonId]/
│   │               └── layout.tsx # Server: LessonSchema + generateMetadata
│   ├── api/
│   │   ├── auth/[...all]/     # better-auth handler
│   │   └── og/                # Dynamic OG image (Edge Runtime)
│   ├── robots.ts              # /robots.txt
│   └── sitemap.ts             # /sitemap.xml (dynamic, all locales)
│
├── components/
│   ├── ui/                    # Base: Button, Card, Input, Badge, Progress, Avatar, Logo
│   ├── layout/                # Header, Footer
│   ├── home/                  # Hero, Stats, HowItWorks, Agents, Features, CTA
│   ├── agents/                # LessonCard
│   ├── dashboard/             # XpBar
│   ├── quiz/                  # QuizComponent, confetti-util
│   └── seo/                   # JSON-LD schema components
│
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema (single source of truth)
│   │   ├── index.ts           # DB connection
│   │   ├── i18n.ts            # Translation helpers (get/upsert/batch/delete)
│   │   ├── seed.ts            # Seed script
│   │   └── reset.ts           # Reset script
│   ├── content/
│   │   └── claude-lessons.ts  # Static content (AR+EN) for UI
│   ├── auth.ts                # better-auth server config
│   ├── auth-client.ts         # better-auth client hooks
│   ├── brand.ts               # Brand constants (colors, name, tagline)
│   └── utils.ts               # cn(), calculateLevel(), getInitials()
│
├── messages/
│   ├── ar.json                # UI strings (Arabic)
│   └── en.json                # UI strings (English)
│
└── middleware.ts              # next-intl locale detection + routing
```

---

## تدفق البيانات

```
Request → middleware.ts
  → locale detection (Accept-Language / cookie / path)
  → redirect to /{locale}/...

Page render:
  layout.tsx (server)
    → generateMetadata() → HTML <head>
    → JSON-LD injection → <script type="application/ld+json">
    → page.tsx (client)
        → useTranslations() (next-intl → messages/ar.json)
        → static content from claude-lessons.ts
        → localStorage for progress (ready to swap to DB API)
```

---

## أداء وـSEO

| المعيار | النهج المستخدم |
|---|---|
| LCP | Server Components + next/font (no FOUT) |
| CLS | Framer Motion مع `layout` prop |
| TTFB | Edge Runtime للـ OG image |
| Crawlability | robots.txt + sitemap.xml ديناميكيين |
| Structured Data | 5 أنواع JSON-LD per page |
| i18n SEO | hreflang على كل صفحة + x-default |
