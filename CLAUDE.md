@AGENTS.md

## قواعد لازم تتبعها دايماً

### i18n — القاعدة الأساسية

**UI strings ثابتة** → `useTranslations()` / `getTranslations()` من next-intl. **أبداً** لا تكتب نص عربي أو إنجليزي مباشرة في الكود.

**محتوى ديناميكي** (دروس، agents، إنجازات) → DB queries من `src/lib/db/queries/content.ts`. النصوص مخزونة في جدول `translations`.

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
export default async function Page({ params }) {
  const { locale } = await params;   // params هو Promise في Next.js 16
  const data = await getAgents(locale);
  return <AgentPageClient agents={data} locale={locale} />;
}
```

### إضافة translation key جديد

1. أضف الـ key في `src/messages/en.json` تحت الـ namespace المناسب
2. أضف نفس الـ key في `src/messages/ar.json` بالترجمة العربية
3. استخدم `t('key')` في الكود

**Namespaces الموجودة:** `nav`, `home`, `auth`, `dashboard`, `agents`, `lessons`, `quiz`, `leaderboard`, `profile`, `sandbox`, `admin`, `metadata`, `og`, `achievements`, `common`, `onboarding`, `mascot`, `pwa`

### إضافة محتوى (درس / agent / إنجاز)

البيانات تضاف في `src/lib/db/seed.ts` — أضف records في الجدول الأساسي + translations في جدول `translations`:

```ts
// جدول translations
{ entity_type: 'lesson', entity_id: 6, locale: 'ar', field: 'title', value: 'عنوان الدرس' }
{ entity_type: 'lesson', entity_id: 6, locale: 'en', field: 'title', value: 'Lesson Title' }
```

### Next.js 16

اقرأ الدليل في `node_modules/next/dist/docs/` قبل ما تكتب أي كود. الـ APIs مختلفة:

- `params` هو `Promise` في server components — لازم `await params`
- `generateMetadata` تستخدم `getTranslations({ locale, namespace })` مع `await`
- الـ middleware اتغير لـ `proxy.ts`

### التحقق

شغّل `bun run tsc --noEmit` بعد أي تعديل. لازم يعدي بدون errors.
