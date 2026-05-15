# ذكاوي — Zkawi

> منصة تعليمية تفاعلية عربية أولاً لتعليم البرمجة والذكاء الاصطناعي للأطفال

---

## ما هو ذكاوي؟

**ذكاوي** هي منصة تعليمية موجهة للأطفال والناشئين تهدف إلى تعليم البرمجة والذكاء الاصطناعي بلغة عربية بسيطة ومرحة. المنصة عربية أولاً بطبيعتها وتدعم توسعة لغوية كاملة دون تغيير في الكود.

### الرؤية

بناء المنصة التعليمية التقنية الأشمل باللغة العربية — تبدأ بالذكاء الاصطناعي وتتوسع لتشمل كل المهارات الرقمية التي يحتاجها طفل في القرن الحادي والعشرين.

### المواضيع المخططة (8 مسارات)

| # | المسار | الوصف |
| --- | ------ | ----- |
| 1 | الذكاء الاصطناعي | Claude، ChatGPT، Gemini — كيف تعمل وكيف تستخدمها |
| 2 | البرمجة للأطفال | JavaScript، Python — الأساسيات بأسلوب لعبة |
| 3 | قواعد البيانات | SQL وNoSQL — كيف تخزن المعلومات |
| 4 | أنماط التصميم البرمجي | Design Patterns بأمثلة حقيقية |
| 5 | حل المشكلات | التفكير الخوارزمي والمنطق |
| 6 | بناء المشاريع | من الفكرة للمنتج — خطوة بخطوة |
| 7 | هندسة الـ Prompts | كيف تتحدث مع الذكاء الاصطناعي بكفاءة |
| 8 | تصميم الويب | HTML، CSS، تصميم الواجهات |

---

## التقنيات

| الطبقة | التقنية |
|--------|---------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Runtime | Bun |
| Styling | Tailwind CSS v4 + CSS Variables |
| Animations | Framer Motion |
| Auth | better-auth v1.6.11 (email/password + email verification) |
| Database | PostgreSQL + Drizzle ORM |
| i18n | next-intl v4 (ar default + en) |
| AI — Mascot | Multi-provider: OpenRouter → Gemini → OpenAI → Anthropic |
| AI — Sandbox | Anthropic SDK (user's own key, AES-256-GCM encrypted) |
| Error Tracking | Sentry |
| PWA | Service Worker + Install Banner |
| Deployment | Vercel (recommended) + Neon/Supabase |

---

## البدء السريع

### المتطلبات

- **Bun** >= 1.0 — [تثبيت Bun](https://bun.sh)
- **PostgreSQL** >= 14

### خطوات التشغيل

```bash
# 1. استنساخ المشروع
git clone https://github.com/sabrydawood/claude zkawi
cd zkawi

# 2. تثبيت المكتبات
bun install

# 3. نسخ متغيرات البيئة
cp .env.example .env.local
# عدّل .env.local بقيمك الحقيقية (انظر قسم متغيرات البيئة أدناه)

# 4. بناء قاعدة البيانات + seed كامل
bun run db:all

# 5. تشغيل المشروع
bun dev
# المشروع يعمل على http://localhost:3000
```

---

## متغيرات البيئة

راجع `.env.example` للقائمة الكاملة مع التعليقات. القيم الإلزامية:

```bash
# ─── قاعدة البيانات ───────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/zkawi

# ─── المصادقة ─────────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=your-64-char-secret-here    # openssl rand -hex 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── التشفير (Sandbox) ────────────────────────────────────────────────────────
ENCRYPTION_KEY=your-64-char-hex-string-here    # openssl rand -hex 32

# ─── المدراء ──────────────────────────────────────────────────────────────────
ADMIN_EMAILS=admin@example.com

# ─── البريد الإلكتروني (التحقق إلزامي) ─────────────────────────────────────
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@zkawi.com

# ─── مزودو الذكاء الاصطناعي (المسكوت) ─────────────────────────────────────
# ترتيب الـ fallback: OpenRouter → Gemini → OpenAI → Anthropic
# يكفي واحد على الأقل
OPENROUTER_API_KEY=your-openrouter-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key      # مطلوب لمميزة Sandbox

# ─── Sentry ───────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

---

## أوامر قاعدة البيانات

| الأمر | الوظيفة |
|-------|---------|
| `bun run db:clear` | يحذف كل شيء (جداول، views، types، sequences، migration files) — بداية نظيفة تماماً |
| `bun run db:generate` | يولّد migration SQL من schema.ts |
| `bun run db:migrate` | يشغّل الـ migrations المعلقة |
| `bun run db:seed` | يضيف البيانات الأساسية (agents, lessons, quiz, achievements, tracks) |
| `bun run db:all` | **clear → generate → migrate → seed** في أمر واحد (إعادة بناء كاملة) |
| `bun run db:studio` | يفتح Drizzle Studio على http://localhost:4983 |
| `bun run db:reset` | يحذف الجداول + migration files فقط (بدون clear لـ DB objects الأخرى) |

> **تحذير:** `db:clear` و`db:all` يحذفان كل البيانات دون رجوع.

---

## هيكل المشروع

```
src/
├── app/                                      # Next.js App Router
│   ├── [locale]/                             # ar (افتراضي) + en
│   │   ├── layout.tsx                        # HTML lang/dir، metadata
│   │   ├── page.tsx                          # الصفحة الرئيسية (server component)
│   │   ├── onboarding/page.tsx               # استطلاع التخصيص (5 خطوات)
│   │   ├── error.tsx / global-error.tsx      # Error boundaries + Sentry
│   │   ├── not-found.tsx                     # 404 locale-aware
│   │   ├── (auth)/                           # Route group — لا تؤثر على الـ URL
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (main)/                           # Protected routes
│   │       ├── dashboard/page.tsx
│   │       ├── leaderboard/page.tsx
│   │       ├── profile/[userId]/page.tsx
│   │       ├── sandbox/page.tsx              # Claude chat بمفتاح المستخدم
│   │       ├── admin/page.tsx                # CRUD الدروس (admin فقط)
│   │       └── agents/[agentSlug]/
│   │           ├── page.tsx                  # قائمة دروس الـ agent
│   │           └── lessons/[lessonId]/
│   │               └── page.tsx              # الدرس + الكويز
│   ├── api/
│   │   ├── auth/[...all]/route.ts            # better-auth handler
│   │   └── og/route.tsx                      # OG image (edge runtime)
│   └── api/v1/                               # Versioned API routes (thin wrappers)
│       ├── admin/lessons/route.ts            # CRUD الدروس (admin)
│       ├── keys/route.ts                     # إدارة API key (sandbox)
│       ├── keys/hint/route.ts                # عرض الـ hint فقط
│       ├── leaderboard/route.ts              # أفضل 50 مستخدم
│       ├── mascot/route.ts                   # SSE chat — مسكوت ذكاوي
│       ├── onboarding/route.ts               # حفظ بيانات التخصيص
│       ├── profile/[userId]/route.ts         # الملف الشخصي العام
│       ├── progress/route.ts                 # بيانات التقدم الكاملة
│       ├── progress/lesson/[id]/route.ts     # تسجيل إكمال درس
│       └── sandbox/route.ts                  # SSE chat — sandbox
│
├── Features/                                 # Feature modules (الجوهر)
│   ├── Auth/                                 # better-auth config + admin check
│   │   ├── Auth.Config.ts
│   │   ├── Auth.Admin.ts                     # isAdminEmail()
│   │   ├── Auth.Client.ts
│   │   └── Auth.Types.ts
│   ├── Progress/                             # XP (server-side only)، streaks، achievements
│   │   ├── Progress.Controller.ts
│   │   ├── Progress.Service.ts
│   │   ├── Progress.Schemas.ts               # Zod schemas
│   │   └── Progress.Types.ts
│   ├── Sandbox/                              # AI chat بمفتاح المستخدم
│   │   ├── Sandbox.Controller.ts
│   │   ├── Sandbox.Schemas.ts
│   │   └── Sandbox.Types.ts
│   ├── Mascot/                               # AI mascot (multi-provider، rate limited)
│   │   ├── Mascot.Controller.ts
│   │   ├── Mascot.Service.ts
│   │   ├── Mascot.Schemas.ts
│   │   └── Mascot.Types.ts
│   ├── Keys/                                 # إدارة مفاتيح API المشفرة
│   │   ├── Keys.Controller.ts
│   │   ├── Keys.Schemas.ts
│   │   └── Keys.Types.ts
│   ├── Onboarding/                           # مسار التعلم الشخصي
│   │   ├── Onboarding.Controller.ts
│   │   ├── Onboarding.Service.ts
│   │   ├── Onboarding.Schemas.ts
│   │   └── Onboarding.Types.ts
│   ├── Leaderboard/                          # أفضل 50 مستخدم
│   │   ├── Leaderboard.Controller.ts
│   │   └── Leaderboard.Types.ts
│   ├── Profile/                              # الملف الشخصي العام
│   │   ├── Profile.Controller.ts
│   │   └── Profile.Types.ts
│   ├── Admin/                                # CRUD الدروس (admin)
│   │   ├── Admin.Controller.ts
│   │   ├── Admin.Schemas.ts
│   │   └── Admin.Types.ts
│   └── Middleware/                           # Auth، Validation (Zod)، RateLimit
│       └── Types/                            # Api.Types.ts، Common.Types.ts
│
├── Shared/                                   # مشترك بين الـ features
│   ├── Middleware/                           # Middleware مشترك
│   └── Types/
│       ├── Api.Types.ts                      # TApiSuccess، TApiError، TApiResponse
│       └── Common.Types.ts
│
├── Lib/                                      # Infrastructure
│   ├── Db/
│   │   ├── Schema.ts                         # Drizzle schema (كل الجداول)
│   │   ├── Index.ts                          # PostgreSQL connection
│   │   ├── Seed.ts                           # بيانات أولية
│   │   ├── Clear.ts                          # حذف كامل للـ DB
│   │   └── Reset.ts
│   ├── Ai/                                   # Multi-provider AI
│   ├── Encryption/                           # AES-256-GCM
│   └── I18n/
│       ├── Api.Errors.ts                     # رسائل خطأ الـ API (ar + en)
│       └── Locale.Utils.ts                   # getDir()، isRTL()
│
├── components/                               # React components
│   ├── ui/                                   # Button، Card، Input، Badge، Progress، Logo
│   ├── layout/                               # Header، Footer
│   ├── home/                                 # Hero، Stats، Features، Agents، CTA
│   ├── agents/                               # LessonCard، AgentPageClient
│   ├── dashboard/                            # XpBar
│   ├── quiz/                                 # QuizComponent
│   └── seo/                                  # JsonLd schemas
│
├── lib/                                      # Legacy + Next.js integrations
│   ├── db/                                   # Drizzle queries (content.ts)
│   ├── auth.ts / auth-client.ts
│   ├── i18n/                                 # locale-utils، routing، navigation
│   └── encryption.ts
│
└── Messages/                                 # i18n strings
    ├── Ar.json                               # نصوص الواجهة (عربي)
    └── En.json                               # UI strings (English)
```

---

## معمارية الـ i18n

### القاعدة الأساسية — نوعان من البيانات

**نوع 1: UI Strings الثابتة** — تمر دائماً عبر next-intl

```ts
// client component
const t = useTranslations('dashboard');
return <h1>{t('title')}</h1>;

// server component / generateMetadata
const t = await getTranslations({ locale, namespace: 'metadata' });
```

**نوع 2: محتوى ديناميكي** — من قاعدة البيانات

```ts
// Content queries من src/lib/db/queries/content.ts
const agents  = await getAgents(locale);           // fallback to 'en' تلقائياً
const lesson  = await getLessonById(id, locale);
const lessons = await getLessonsByAgent('claude', locale);
```

**ممنوع تماماً:**

```ts
// لا تكتب هذا أبداً
<p>{locale === 'ar' ? 'عنوان' : 'Title'}</p>
const isAr = locale === 'ar';
```

### RTL/LTR — استخدم الدالة لا الثنائية

```ts
import { getDir, isRTL } from '@/lib/i18n/locale-utils';

getDir('ar')  // 'rtl'
getDir('fr')  // 'ltr'
isRTL('he')   // true  — Hebrew
isRTL('fr')   // false
// يدعم 10 لغات RTL: ar، he، fa، ur، yi، ps، sd، ug، dv، ks
```

### إضافة translation key جديد

1. أضف الـ key في `src/Messages/En.json` تحت الـ namespace المناسب
2. أضف نفس الـ key في `src/Messages/Ar.json` بالترجمة العربية
3. استخدم `t('key')` في الكود

**Namespaces الموجودة:**
`nav`، `home`، `auth`، `dashboard`، `agents`، `lessons`، `quiz`، `leaderboard`، `profile`، `sandbox`، `admin`، `metadata`، `og`، `achievements`، `common`، `onboarding`، `mascot`، `pwa`، `apiErrors`

---

## معمارية قاعدة البيانات

### قواعد التسمية

- **Better Auth tables**: snake_case (متطلب الـ framework) — `users`، `sessions`، `accounts`
- **جداول المحتوى**: PascalCase — `Agents`، `Lessons`، `UserProgress`
- **الأعمدة**: PascalCase — `Id`، `CreatedAt`، `UserId`، `IsDeleted`
- **المفاتيح الأساسية**: `uuidv7()` من حزمة `uuidv7` (time-sortable)
- **Soft delete**: `IsDeleted: boolean` على كل جداول المحتوى
- **Translation**: جدول translation منفصل لكل entity (ليس EAV موحّد)

### جداول Translation المنفصلة

```
AgentTranslations       (AgentId, Locale, Name, Description, FullDescription)
LessonTranslations      (LessonId, Locale, Title, Description, Content)
QuizQuestionTranslations (QuestionId, Locale, Question)
QuizOptionTranslations   (OptionId, Locale, Text)
AchievementTranslations  (AchievementId, Locale, Name, Description)
TrackTranslations        (TrackId, Locale, Name, Description)
```

### مخطط العلاقات

```
users ──────┬── sessions
            ├── accounts
            ├── UserStats          (TotalXp، StreakDays، Level، LessonsCompleted)
            ├── UserProgress       (LessonId، Completed، Score، CompletedAt)
            │    └── UNIQUE(UserId, LessonId)
            ├── UserAchievements   (AchievementId، EarnedAt)
            ├── UserPreferences    (AgeGroup، Goal، ExperienceLevel، LearningStyle)
            ├── LearningPaths      (LessonId، Order)
            └── SandboxSessions    (Messages، CreatedAt)

Agents ─────┬── AgentTranslations
            └── Lessons ──┬── LessonTranslations
                          ├── QuizQuestions ── QuizOptions
                          └── UserProgress (ref)

Achievements ─── AchievementTranslations
Tracks ────────── TrackTranslations
EncryptedKeys  ← مفاتيح API المشفرة (AES-256-GCM)
```

### إضافة محتوى جديد (درس / agent / إنجاز)

البيانات تضاف في `src/Lib/Db/Seed.ts` — الجدول الأساسي + جداول الترجمة:

```ts
// في Seed.ts
await db.insert(Lessons).values({
  Id: uuidv7(),
  AgentId: claudeAgent.Id,
  Order: 6,
  XpReward: 100,
  IsDeleted: false,
});

await db.insert(LessonTranslations).values([
  { LessonId: lessonId, Locale: 'ar', Title: 'عنوان الدرس', Content: '...' },
  { LessonId: lessonId, Locale: 'en', Title: 'Lesson Title', Content: '...' },
]);
```

---

## مسارات الـ API

جميع نقاط الـ API تحت `/api/v1/` مع response موحّد:

```ts
// نجاح
{ "Success": true, "Data": {...}, "Message": "...", "Meta": { "Page": 1, "Total": 50 } }

// خطأ
{ "Success": false, "Error": { "Code": "LESSON_NOT_FOUND", "Details": {...} } }
```

| الـ Endpoint | الطريقة | الوصف |
| ----------- | ------- | ----- |
| `/api/v1/progress` | GET | بيانات التقدم الكاملة للمستخدم |
| `/api/v1/progress/lesson/:id` | PUT | تسجيل إكمال درس (XP + streak + achievements) |
| `/api/v1/mascot` | POST | SSE chat مع مسكوت ذكاوي |
| `/api/v1/sandbox` | POST | SSE chat (مفتاح API المستخدم) |
| `/api/v1/keys` | POST / DELETE | حفظ / حذف مفتاح API |
| `/api/v1/keys/hint` | GET | عرض الـ hint فقط (بدون المفتاح الحقيقي) |
| `/api/v1/onboarding` | POST | حفظ تفضيلات التعلم + توليد المسار |
| `/api/v1/leaderboard` | GET | أفضل 50 مستخدم بالـ XP |
| `/api/v1/profile/:userId` | GET | بيانات الملف الشخصي العام |
| `/api/v1/admin/lessons` | GET / POST | CRUD الدروس (admin فقط) |
| `/api/auth/[...all]` | ALL | better-auth handler |
| `/api/og` | GET | OG image generation (edge runtime) |

---

## الصفحات

| الصفحة | الوصف |
|--------|-------|
| `/` | الصفحة الرئيسية |
| `/dashboard` | لوحة التحكم: XP bar، streak، إنجازات، دروس |
| `/agents/[slug]` | قائمة دروس الـ agent |
| `/agents/[slug]/lessons/[id]` | محتوى الدرس + كويز تفاعلي |
| `/leaderboard` | أفضل 50 متعلم في المنصة |
| `/profile/[userId]` | الملف الشخصي العام (قابل للمشاركة) |
| `/sandbox` | AI chat بمفتاح Anthropic الخاص بالمستخدم |
| `/onboarding` | استطلاع التخصيص (5 خطوات) عند أول دخول |
| `/admin` | إدارة الدروس والمحتوى (admin فقط) |

---

## قواعد للمطورين والـ AI Agents

### Next.js 16 — تغييرات مهمة

```ts
// params هو Promise في Next.js 16 — لازم await
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // ...
}

// generateMetadata — نفس الشيء
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  // ...
}
```

### Server Components أولاً

صفحات الـ routes هي server components دائماً — تجيب البيانات وتمررها لـ client components:

```ts
// page.tsx (server component) ✓
export default async function Page({ params }) {
  const { locale } = await params;
  const data = await getAgents(locale);
  return <AgentPageClient agents={data} locale={locale} />;
}
```

### اتفاقيات الكود

- **PascalCase** لكل شيء: متغيرات، دوال، ملفات، مجلدات، أعمدة DB
- **استثناءات**: ملفات Next.js (page.tsx، layout.tsx، route.ts، middleware.ts، not-found.tsx)، مجلد `app/`، URL route folders
- **الـ PKs**: `uuidv7()` من حزمة `uuidv7` — دائماً
- **لا hardcoded strings** — كل النصوص عبر i18n أو قاعدة البيانات
- **Zod** على كل API route
- **Rate limiting** على كل AI endpoints (20 req/min per user)
- **XP** يُحسب server-side من DB فقط — لا تثق بأي قيمة من الـ client
- **الحد الأقصى** للملف الواحد: 600 سطر

---

## سير عمل التطوير

```bash
# تشغيل في وضع التطوير
bun dev

# التحقق من الـ types — إلزامي قبل أي commit
bun run typecheck

# lint
bun run lint

# التحقق الكامل (types + lint)
bun run verify

# إعادة بناء DB من الصفر
bun run db:all
```

> **قاعدة:** `bun run typecheck` يجب أن ينجح بدون أخطاء قبل أي commit.

---

## الإنتاج

```bash
bun run build
bun run start
```

**البنية التحتية الموصى بها:**

- **Frontend**: Vercel
- **Database**: Neon أو Supabase (PostgreSQL managed)
- **Email**: Resend أو Postmark
- **Error Tracking**: Sentry (مضبوط بالفعل)
