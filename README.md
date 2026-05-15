# ذكاوي — Zkawi

> منصة تعليمية تفاعلية للذكاء الاصطناعي، عربية أولاً وقابلة للتوسع لأي لغة

**ذكاوي** تشرح الذكاء الاصطناعي بلغة بسيطة ومرحة. تبدأ بـ Claude وتتوسع لتشمل أدوات AI مختلفة. المحتوى كله في قاعدة البيانات وقابل للترجمة لأي عدد من اللغات بدون تغيير في الكود.

---

## التقنيات

| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| Animations | Framer Motion |
| Auth | better-auth v1.6.11 (email/password) |
| Database | PostgreSQL + Drizzle ORM |
| i18n | next-intl v4 |
| Runtime | Bun |
| AI | Anthropic SDK (mascot chat + sandbox) |

---

## إعداد المشروع

### المتطلبات
- Bun >= 1.0
- PostgreSQL >= 14

### خطوات التشغيل

```bash
# 1. نسخ متغيرات البيئة
cp .env.example .env.local

# 2. تعديل .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/zkawi
BETTER_AUTH_SECRET=<سر-عشوائي-طويل>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=<مفتاح-anthropic-اختياري-للـ-mascot>

# 3. تثبيت المكتبات
bun install

# 4. بناء قاعدة البيانات + seed كامل
bun run db:all

# 5. تشغيل المشروع
bun dev
```

---

## أوامر قاعدة البيانات

| الأمر | الوظيفة |
|-------|---------|
| `bun run db:generate` | يولّد migration SQL من الـ schema |
| `bun run db:migrate` | يشغّل الـ migrations |
| `bun run db:push` | يطبّق الـ schema مباشرة (للـ dev السريع) |
| `bun run db:seed` | يضيف البيانات الأساسية (agents, lessons, quiz, achievements) |
| `bun run db:reset` | يحذف كل الجداول + migration files |
| `bun run db:all` | **reset → generate → migrate → seed** (إعادة بناء كاملة) |
| `bun run db:studio` | يفتح Drizzle Studio على http://localhost:4983 |

---

## هيكل المشروع

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                        # HTML lang/dir، metadata من next-intl
│   │   ├── page.tsx                          # الصفحة الرئيسية (server component)
│   │   ├── onboarding/page.tsx               # استطلاع التخصيص
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (main)/
│   │       ├── dashboard/page.tsx
│   │       ├── leaderboard/page.tsx
│   │       ├── profile/[userId]/page.tsx
│   │       ├── sandbox/page.tsx              # chat مع Claude بمفتاح المستخدم
│   │       ├── admin/page.tsx
│   │       └── agents/[agentSlug]/
│   │           ├── layout.tsx                # metadata الـ agent
│   │           ├── page.tsx                  # قائمة الدروس (server component)
│   │           └── lessons/[lessonId]/
│   │               ├── layout.tsx            # metadata الدرس + JSON-LD
│   │               └── page.tsx              # server → LessonPageClient
│   └── api/
│       ├── auth/[...all]/                    # better-auth handler
│       ├── admin/lessons/                    # CRUD للدروس (admin only)
│       ├── keys/                             # Anthropic API key (sandbox)
│       ├── leaderboard/                      # top 50 users
│       ├── lessons/claude/                   # قائمة دروس claude
│       ├── mascot/chat/                      # mascot AI chat (SSE stream)
│       ├── og/                               # OG image generation (edge runtime)
│       ├── onboarding/                       # حفظ بيانات التخصيص
│       ├── profile/[userId]/                 # بيانات الملف الشخصي (locale-aware)
│       ├── progress/lesson/[id]/             # حفظ تقدم الدرس + XP + achievements
│       ├── sandbox/chat/                     # sandbox AI chat (SSE stream)
│       └── user/                             # بيانات المستخدم الحالي
├── components/
│   ├── ui/                                   # Button, Card, Input, Badge, Progress, Logo
│   ├── layout/                               # Header, Footer
│   ├── home/                                 # Hero, Stats, Features, HowItWorks, Agents, CTA
│   ├── agents/                               # LessonCard, AgentPageClient
│   ├── dashboard/                            # XpBar
│   ├── quiz/                                 # QuizComponent, confetti-util
│   ├── seo/                                  # JsonLd (OrganizationSchema, CourseSchema, ...)
│   ├── mascot.tsx                            # floating mascot مع waypoints
│   ├── mascot-chat.tsx                       # mascot chat drawer
│   └── pwa-install-banner.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                         # Drizzle schema (كل الجداول)
│   │   ├── index.ts                          # PostgreSQL connection
│   │   ├── queries/content.ts                # getAgents, getLessonById, ... (locale-aware)
│   │   └── seed.ts / reset.ts
│   ├── auth.ts / auth-client.ts              # better-auth config
│   ├── i18n/
│   │   ├── locale-utils.ts                   # getDir(locale), isRTL(locale)
│   │   ├── routing.ts                        # supported locales
│   │   ├── navigation.ts                     # Link, useRouter (locale-aware)
│   │   └── request.ts                        # getRequestConfig
│   └── learning-path.ts                      # حساب تقدم المستخدم
└── messages/
    ├── ar.json                               # UI strings (عربي)
    └── en.json                               # UI strings (English)
```

---

## معمارية الـ i18n

المشروع يفصل بوضوح بين نوعين من البيانات:

### ١. UI Strings الثابتة ← next-intl

كل نصوص الواجهة تمر عبر `useTranslations()` أو `getTranslations()`. لا يوجد نص مكتوب مباشرة في الكود.

```ts
// client component
const t = useTranslations('dashboard');
return <h1>{t('title')}</h1>;

// server component / generateMetadata
const t = await getTranslations({ locale, namespace: 'metadata' });
```

**Namespaces:** `nav`, `home`, `auth`, `dashboard`, `agents`, `lessons`, `quiz`, `leaderboard`, `profile`, `sandbox`, `admin`, `metadata`, `og`, `achievements`, `common`, `onboarding`, `mascot`, `pwa`

### ٢. المحتوى الديناميكي ← قاعدة البيانات

كل محتوى الدروس والـ agents والإنجازات مخزون في جدول `translations` الموحّد:

```
translations (entity_type, entity_id, locale, field, value)
```

| entity_type | fields المخزونة |
|-------------|----------------|
| `agent` | `name`, `description`, `full_description` |
| `lesson` | `title`, `description`, `content` |
| `quiz_question` | `question` |
| `quiz_option` | `text` |
| `achievement` | `name`, `description` |

استخدام DB queries من `src/lib/db/queries/content.ts`:

```ts
const agents  = await getAgents(locale);               // fallback to 'en' automatically
const lesson  = await getLessonById(id, locale);
const lessons = await getLessonsByAgent('claude', locale);
```

### ٣. RTL/LTR

الاتجاه يُحدَّد من Set — لا ثنائية ar/en:

```ts
import { getDir, isRTL } from '@/lib/i18n/locale-utils';

getDir('ar')  // 'rtl'
getDir('fr')  // 'ltr'
isRTL('he')   // true  — Hebrew
isRTL('fr')   // false — French
```

مجموعة الـ RTL الحالية: `ar, he, fa, ur, yi, ps, sd, ug, dv, ks`

---

## إضافة لغة جديدة

```ts
// 1. src/lib/i18n/routing.ts
locales: ['ar', 'en', 'fr'],   // أضف 'fr'
```

```bash
# 2. أنشئ ملف UI strings
cp src/messages/en.json src/messages/fr.json
# ترجم القيم في fr.json
```

```sql
-- 3. أضف translations للمحتوى في DB
INSERT INTO translations (entity_type, entity_id, locale, field, value)
VALUES ('lesson', 1, 'fr', 'title', 'Introduction à Claude');
-- الـ fallback يرجع لـ 'en' تلقائياً لو مفيش ترجمة
```

لا تغيير في الكود.

---

## مخطط قاعدة البيانات

```
users ──────┬── sessions
            ├── accounts
            ├── userStats          (totalXp, streakDays, level, lessonsCompleted, quizzesCompleted)
            ├── userProgress       (lessonId, completed, score, completedAt)
            └── userAchievements   (achievementId, earnedAt)

agents ─────── lessons ────┬── quizQuestions ── quizOptions
                           └── userProgress (ref)

achievements ── userAchievements (ref users)
translations   ← جدول موحّد لكل النصوص القابلة للترجمة
```

---

## الصفحات

| الصفحة | الوصف |
|--------|-------|
| `/` | الصفحة الرئيسية |
| `/dashboard` | لوحة التحكم: XP bar، تقدم الدروس، الإنجازات |
| `/agents/[slug]` | قائمة دروس الـ agent |
| `/agents/[slug]/lessons/[id]` | محتوى الدرس + كويز |
| `/leaderboard` | أكتر 50 متعلم في المنصة |
| `/profile/[userId]` | الملف الشخصي العام |
| `/sandbox` | chat مع Claude بمفتاح API المستخدم الخاص |
| `/onboarding` | استطلاع التخصيص عند أول دخول |
| `/admin` | إدارة الدروس (admin فقط) |

---

## بيئة الإنتاج

```bash
bun run build
bun run start
```

ينصح بـ **Vercel** للـ frontend مع **Supabase** أو **Neon** لقاعدة البيانات.
