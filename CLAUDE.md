# CLAUDE.md — ذكاوي

@AGENTS.md

---

## عن المنصة

**ذكاوي** هي منصة تعليمية عربية أولاً لتعليم البرمجة والذكاء الاصطناعي للأطفال والناشئين. المحتوى مخزون في قاعدة البيانات ومترجم لكل locale — لا نصوص مكتوبة في الكود أبداً.

**الـ Stack:** Next.js 16 · TypeScript · Bun · PostgreSQL · Drizzle ORM · next-intl · better-auth · Tailwind v4 · Framer Motion · Sentry

---

## قواعد لازم تتبعها دايماً

### i18n — القاعدة الأساسية

**UI strings ثابتة** → `useTranslations()` / `getTranslations()` من next-intl. **أبداً** لا تكتب نص عربي أو إنجليزي مباشرة في الكود.

**محتوى ديناميكي** (دروس، agents، إنجازات) → DB queries من `src/lib/db/queries/content.ts`. النصوص مخزونة في جداول Translation منفصلة لكل entity.

```ts
// صح — UI string
const t = useTranslations('dashboard');
<p>{t('title')}</p>

// صح — محتوى ديناميكي من DB
const lesson = await getLessonById(id, locale);
<p>{lesson.title}</p>

// غلط تماماً — ممنوع
<p>{locale === 'ar' ? 'عنوان' : 'Title'}</p>
const isAr = locale === 'ar';
```

### RTL/LTR

استخدم `getDir(locale)` أو `isRTL(locale)` من `src/lib/i18n/locale-utils.ts`. لا تكتب `locale === 'ar' ? 'rtl' : 'ltr'` أو أي ثنائية ar/en.

```ts
import { getDir, isRTL } from '@/lib/i18n/locale-utils';

const dir = getDir(locale);   // 'rtl' | 'ltr' — يشمل 10 لغات RTL
isRTL(locale)                 // boolean
// RTL: ar، he، fa، ur، yi، ps، sd، ug، dv، ks
```

### DB Queries للمحتوى

كل queries المحتوى جاهزة في `src/lib/db/queries/content.ts`:

- `getAgents(locale)` — كل الـ agents مع ترجمتها
- `getAgentBySlug(slug, locale)` — agent واحد
- `getLessonsByAgent(agentSlug, locale)` — دروس agent معين
- `getLessonById(id, locale)` — درس كامل مع الكويز

الـ fallback تلقائي: لو مفيش ترجمة للـ locale → يرجع `en`.

### Server vs Client Components

صفحات الـ routes هي server components تجيب البيانات وتمررها لـ client components:

```ts
// page.tsx — server component
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;   // params هو Promise في Next.js 16
  const data = await getAgents(locale);
  return <AgentPageClient agents={data} locale={locale} />;
}
```

### إضافة translation key جديد

1. أضف الـ key في `src/Messages/En.json` تحت الـ namespace المناسب
2. أضف نفس الـ key في `src/Messages/Ar.json` بالترجمة العربية
3. استخدم `t('key')` في الكود

**Namespaces الموجودة:** `nav`، `home`، `auth`، `dashboard`، `agents`، `lessons`، `quiz`، `leaderboard`، `profile`، `sandbox`، `admin`، `metadata`، `og`، `achievements`، `common`، `onboarding`، `mascot`، `pwa`، `apiErrors`

### إضافة محتوى (درس / agent / إنجاز)

البيانات تضاف في `src/Lib/Db/Seed.ts` — الجدول الأساسي + جداول Translation منفصلة:

```ts
// الجدول الأساسي
await db.insert(Lessons).values({
  Id: uuidv7(),
  AgentId: agentId,
  Order: 6,
  XpReward: 100,
  IsDeleted: false,
});

// جدول الترجمة المنفصل
await db.insert(LessonTranslations).values([
  { LessonId: lessonId, Locale: 'ar', Title: 'عنوان الدرس', Content: '...' },
  { LessonId: lessonId, Locale: 'en', Title: 'Lesson Title', Content: '...' },
]);
```

### Next.js 16

اقرأ الدليل في `node_modules/next/dist/docs/` قبل ما تكتب أي كود. الـ APIs مختلفة:

- `params` هو `Promise` في server components — لازم `await params`
- `generateMetadata` تستخدم `getTranslations({ locale, namespace })` مع `await`
- الـ middleware متغير — راجع `proxy.ts` في جذر المشروع

### التحقق

شغّل `bun run typecheck` بعد أي تعديل. لازم يعدي بدون errors.

---

## قواعد HTTP Client — إلزامية لكل AI Agent

### القاعدة الأساسية

**ممنوع** كتابة `fetch()` مباشرة في أي component. كل اتصال HTTP يمر عبر واحد من ثلاثة أدوات موحدة فقط:

| الأداة | المسار | متى تستخدمها |
| --- | --- | --- |
| `http` | `src/lib/api/http-client.ts` | كل الـ mutations وأي GET يبقى client-side |
| `streamClient.text()` | `src/lib/api/stream-client.ts` | Raw text streaming — e.g. Sandbox chat |
| `streamClient.sse()` | `src/lib/api/stream-client.ts` | SSE line parsing — e.g. Mascot AI chat |

### Services — لكل feature ملف خاص

كل اتصال HTTP يُغلَّف في service file داخل `src/lib/api/services/`:

```ts
// مثال — progress.service.ts
import { http } from '@/lib/api/http-client';
export const ProgressService = {
  completeLesson: (lessonId: string, score: number) =>
    http.post<LessonCompletionData>(`/api/v1/progress/lesson/${lessonId}`, { Score: score }),
};
```

**Services الموجودة:**

- `progress.service.ts` — `ProgressService.completeLesson()`
- `keys.service.ts` — `KeysService.saveKey()` / `deleteKey()`
- `onboarding.service.ts` — `OnboardingService.submit()`
- `admin.service.ts` — `AdminService.getLessons()` / `createLesson()`

### SSR أولاً — لا تجلب data بـ useEffect إذا كان ممكناً من السيرفر

كل page-load read يُحوَّل لـ Server Component يجيب البيانات من DB مباشرة:

```ts
// page.tsx — server component
import { getServerSession } from '@/lib/auth/server-session';
import { db } from '@/lib/db/Index';

export default async function MyPage({ params }) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const data = await db.select()...;
  return <MyPageClient data={data} />;
}
```

**Helper للـ session على السيرفر:** `src/lib/auth/server-session.ts` → `getServerSession()`

### ما يبقى client-side دائماً

- Streaming responses (sandbox, mascot) — استخدم `streamClient`
- Mutations بعد تفاعل المستخدم (submit, save, delete) — استخدم `http` عبر service

### نموذج استخدام streamClient

```ts
// Raw text stream (sandbox)
await streamClient.text('/api/v1/sandbox', { messages }, {
  onChunk: (accumulated) => setContent(accumulated),
  signal: controller.signal,
});

// SSE stream (mascot)
await streamClient.sse<{ text?: string }>('/api/v1/mascot', body, {
  onEvent: (event) => { if (event.text) appendText(event.text); },
  onDone: () => markDone(),
  signal: controller.signal,
});
```

---

## معمارية المشروع (Feature-first)

```text
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # ar (افتراضي) + en
│   │   ├── (auth)/         # login، register
│   │   └── (main)/         # dashboard، agents، sandbox، leaderboard، profile، admin
│   └── api/v1/             # API routes — thin wrappers فقط، تفوض للـ Features
├── Features/               # Feature modules (Controller + Service + Schemas + Types)
│   ├── Auth/               # better-auth config + isAdminEmail()
│   ├── Progress/           # XP (computed server-side)، streaks، achievements
│   ├── Sandbox/            # AI chat (مفتاح المستخدم، AES-256-GCM)
│   ├── Mascot/             # AI mascot (multi-provider، rate limited)
│   ├── Keys/               # مفاتيح API مشفرة
│   ├── Onboarding/         # مسار التعلم الشخصي
│   ├── Leaderboard/        # أفضل 50 مستخدم
│   ├── Profile/            # الملف الشخصي العام
│   └── Admin/              # CRUD الدروس
├── Shared/                 # مشترك بين الـ features
│   ├── Middleware/         # Auth، Validation (Zod)، RateLimit
│   └── Types/              # Api.Types.ts، Common.Types.ts
├── Lib/                    # Infrastructure
│   ├── Db/                 # Schema.ts، Index.ts، Seed.ts، Clear.ts، Reset.ts
│   ├── Ai/                 # Multi-provider (OpenRouter → Gemini → OpenAI → Anthropic)
│   ├── Encryption/         # AES-256-GCM
│   └── I18n/               # Api.Errors.ts، Locale.Utils.ts
├── Messages/               # i18n: Ar.json، En.json
└── Styles/                 # Tailwind v4 + CSS variables
```

---

## اتفاقيات التسمية — صارمة

| السياق | القاعدة | مثال |
| ------- | ------- | ---- |
| كل شيء افتراضياً | PascalCase | `UserProgress`، `GetLessonById`، `IsDeleted` |
| ملفات Next.js | lowercase | `page.tsx`، `layout.tsx`، `route.ts`، `not-found.tsx` |
| مجلد `app/` | lowercase | `app/[locale]/dashboard/` |
| URL route folders | lowercase | `/api/v1/progress/lesson/[id]/` |
| Better Auth tables | snake_case | `users`، `sessions`، `accounts` |
| جداول المحتوى | PascalCase | `Agents`، `Lessons`، `UserProgress` |
| أعمدة DB | PascalCase | `Id`، `CreatedAt`، `UserId`، `IsDeleted` |
| PKs | uuidv7() | `Id: uuid('Id').$defaultFn(() => uuidv7())` |
| API response | PascalCase | `{ Success, Data, Error, Meta }` |

**حد الملف الواحد:** 600 سطر كحد أقصى.

---

## قواعد قاعدة البيانات

### جداول Translation — ليست EAV موحّد

كل entity له جدول translation منفصل. هذا قرار معماري — لا ترجع للـ EAV القديم.

```text
AgentTranslations        (AgentId, Locale, Name, Description, FullDescription)
LessonTranslations       (LessonId, Locale, Title, Description, Content)
QuizQuestionTranslations (QuestionId, Locale, Question)
QuizOptionTranslations   (OptionId, Locale, Text)
AchievementTranslations  (AchievementId, Locale, Name, Description)
TrackTranslations        (TrackId, Locale, Name, Description)
```

### قواعد الـ Schema

```ts
// PK دائماً uuidv7
Id: uuid('Id').primaryKey().$defaultFn(() => uuidv7())

// Timestamps — مع timezone
CreatedAt: timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull()
UpdatedAt: timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull()

// Soft delete — على كل جداول المحتوى
IsDeleted: boolean('IsDeleted').default(false).notNull()
```

### DB Commands

```bash
bun run db:clear      # حذف كل شيء (tables، views، types، sequences) + migration files
bun run db:generate   # توليد migration SQL من Schema.ts
bun run db:migrate    # تطبيق الـ migrations
bun run db:seed       # إضافة البيانات الأولية
bun run db:all        # clear → generate → migrate → seed (إعادة بناء كاملة)
bun run db:studio     # Drizzle Studio على :4983
```

---

## قواعد الـ API

### Response Format — موحّد على كل الـ endpoints

```ts
// نجاح
const response: TApiSuccess<T> = {
  Success: true,
  Data: result,
  Message: 'optional',
  Meta: { Page: 1, Limit: 50, Total: 100 },  // للـ paginated responses
};

// خطأ
const response: TApiError = {
  Success: false,
  Error: {
    Code: 'LESSON_NOT_FOUND',   // error code فقط — لا رسائل داخلية
    Details: { field: ['validation error'] },
  },
};
```

### API Routes — قواعد إلزامية

1. **Zod validation** على كل route — لا استثناء
2. **Rate limiting** على كل AI endpoints — 20 req/min per user، sliding window
3. **Auth check** أولاً قبل أي منطق
4. **الـ route file نفسه thin** — يفوض للـ Feature Controller فوراً
5. **رسائل الخطأ** مترجمة بناءً على `X-Locale` أو `Accept-Language` header

```ts
// route.ts — thin wrapper
import { NextRequest } from 'next/server';
import { MascotController } from '@/Features/Mascot/Mascot.Controller';

export async function POST(req: NextRequest) {
  return MascotController.handleChat(req);
}
```

### AI Endpoints

- **Rate limit**: 20 req/min per user (sliding window)
- **SSE streams**: أرسل error codes فقط — لا internal messages في الـ stream
- **Mascot**: multi-provider fallback (OpenRouter → Gemini → OpenAI → Anthropic)
- **Sandbox**: مفتاح المستخدم فقط — decrypt server-side، لا يصل للـ client أبداً

---

## قواعد الأمان

### لا تنتهك هذه القواعد أبداً

| القاعدة | التفصيل |
| ------- | ------- |
| **SEV-001** | XP يُحسب server-side من DB فقط — لا تثق بأي قيمة من الـ client |
| **SEV-002** | Rate limiting على كل AI endpoints — 20 req/min per user |
| **SEV-003** | Zod validation على كل API route — بدون استثناء |
| **SEV-004** | DB indexes على كل hot query paths |
| **SEV-005** | SSE streams تُرسل error codes فقط — لا internal messages |
| **SEV-006** | Email verification إلزامي عند التسجيل |
| **SEV-011** | UNIQUE(UserId, LessonId) على جدول UserProgress — منع race conditions |
| **SEV-016** | Security headers على كل routes |

### Sandbox Security

```ts
// مفتاح المستخدم مشفر AES-256-GCM قبل الحفظ في DB
// لا يخرج المفتاح الحقيقي للـ client أبداً — الـ client يرى hint فقط
// sk-ant-api03-...XXXX (آخر 4 أحرف فقط)
```

---

## File Organization — أين يذهب كل شيء

| الملف | المسار |
| ----- | ------ |
| Feature logic | `src/Features/[Feature]/[Feature].Controller.ts` |
| Feature service | `src/Features/[Feature]/[Feature].Service.ts` |
| Zod schemas | `src/Features/[Feature]/[Feature].Schemas.ts` |
| Feature types | `src/Features/[Feature]/[Feature].Types.ts` |
| API route | `src/app/api/v1/[route]/route.ts` |
| DB Schema | `src/Lib/Db/Schema.ts` |
| DB queries | `src/lib/db/queries/content.ts` |
| Shared types | `src/Shared/Types/Api.Types.ts` |
| i18n strings | `src/Messages/Ar.json` + `src/Messages/En.json` |
| Seed data | `src/Lib/Db/Seed.ts` |
| Components | `src/components/[category]/ComponentName.tsx` |

---

## متغيرات البيئة المطلوبة

```bash
DATABASE_URL          # إلزامي — PostgreSQL connection string
BETTER_AUTH_SECRET    # إلزامي — 64 char hex
BETTER_AUTH_URL       # إلزامي — URL المشروع
NEXT_PUBLIC_APP_URL   # إلزامي — public URL
ENCRYPTION_KEY        # إلزامي — AES-256 key (openssl rand -hex 32)
ADMIN_EMAILS          # إلزامي — comma-separated admin emails
SMTP_HOST             # إلزامي — email verification
SMTP_PORT             # إلزامي
SMTP_USER             # إلزامي
SMTP_PASS             # إلزامي
SMTP_FROM             # إلزامي
# AI providers — واحد على الأقل إلزامي للـ Mascot
OPENROUTER_API_KEY    # مجاني — موصى به
GEMINI_API_KEY        # مجاني (generous)
OPENAI_API_KEY        # مدفوع
ANTHROPIC_API_KEY     # مطلوب لمميزة Sandbox
# Sentry — اختياري في dev، إلزامي في production
NEXT_PUBLIC_SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
SENTRY_AUTH_TOKEN
```

---

## التحقق قبل الانتهاء

```bash
bun run typecheck    # يجب أن ينجح بدون أخطاء
bun run lint         # لا warnings حرجة
bun run verify       # typecheck + lint معاً
```

**لازم typecheck يعدي بدون errors قبل ما تعلن إن المهمة خلصت.**
