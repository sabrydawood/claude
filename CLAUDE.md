# CLAUDE.md — ذكاوي

@AGENTS.md
@docs/AI_VISION.md

---

> **قبل أي قرار معماري أو تصميمي:**
> 1. اقرأ `docs/DECISIONS.md` — سجل كل البحث والقرارات المتفق عليها
> 2. لا تنفّذ أي شيء إلا بعد توثيقه في DECISIONS.md وتأكيد موافقة Sabry عبر AskUserQuestion
> 3. لا تسأل بنص عادي — الأسئلة عبر AskUserQuestion حصراً

---

> **هذا الملف هو المرجع الوحيد لقواعد المشروع.**
> أي تغيير في الـ conventions أو الـ architecture يُعدَّل هنا فوراً.
> الرؤية الكاملة: `docs/AI_VISION.md` — اقرأه أولاً قبل أي بناء.

---

## وضع التفكير — ALI Builder Mode

عند البناء على هذه المنصة، الذكاء الاصطناعي يفكر كـ:

| الدور | السؤال الذي يطرحه |
|-------|------------------|
| **CTO** | هل هذا القرار يجعل النظام أذكى وأرخص مع الوقت؟ |
| **Business Analyst** | هل هذه الميزة تخدم هدفاً تعليمياً أو تجارياً محدداً؟ |
| **Product Owner** | هل هذا الأثر على الطفل يستحق التعقيد؟ |
| **SRE** | هل هذا موثوق وقابل للمراقبة عند 10,000 مستخدم؟ |

**السؤال الأهم قبل أي قرار:**
> هل هذا يجعل التكلفة تتناقص مع زيادة الاستخدام؟

---

## عن المنصة

**ذكاوي** منصة تعليمية ذكية — لا منصة كورسات تقليدية. القلب هو **ALI (Adaptive Learning Intelligence)**: نظام يتعلم من كل طفل ويصبح أذكى وأرخص مع الوقت.

**Stack:** Next.js 16 · TypeScript · Bun · PostgreSQL + pgvector · Drizzle ORM · next-intl · better-auth · Tailwind v4 · Framer Motion · Three.js/R3F · Sentry

---

## قواعد i18n — الأساسية

**UI strings ثابتة** → `useTranslations()` / `getTranslations()` من next-intl. **أبداً** لا تكتب نص عربي أو إنجليزي مباشرة في الكود.

**محتوى ديناميكي** → DB queries من `src/lib/db/queries/content.ts`.

```ts
// صح — UI string
const t = useTranslations('dashboard');
<p>{t('title')}</p>

// صح — محتوى ديناميكي
const lesson = await getLessonById(id, locale);
<p>{lesson.title}</p>

// خطأ تماماً — ممنوع
<p>{locale === 'ar' ? 'عنوان' : 'Title'}</p>
```

**RTL/LTR:** استخدم `getDir(locale)` أو `isRTL(locale)` من `src/lib/i18n/locale-utils.ts`. لا تكتب `locale === 'ar' ? 'rtl' : 'ltr'`.

**Namespaces الموجودة:** `nav`، `home`، `auth`، `dashboard`، `agents`، `lessons`، `quiz`، `leaderboard`، `profile`، `sandbox`، `admin`، `metadata`، `og`، `achievements`، `common`، `onboarding`، `mascot`، `pwa`، `apiErrors`

---

## قواعد HTTP Client — إلزامية

**ممنوع** كتابة `fetch()` مباشرة في أي component. كل اتصال HTTP يمر عبر:

| الأداة | المسار | متى |
|-------|--------|-----|
| `http` | `src/lib/api/http-client.ts` | كل الـ mutations وأي GET client-side |
| `streamClient.text()` | `src/lib/api/stream-client.ts` | Raw text streaming (Sandbox) |
| `streamClient.sse()` | `src/lib/api/stream-client.ts` | SSE line parsing (Mascot) |

كل اتصال HTTP يُغلَّف في service file داخل `src/lib/api/services/`.

---

## قواعد قاعدة البيانات

```typescript
// PK دائماً uuidv7
Id: uuid('Id').primaryKey().$defaultFn(() => uuidv7())

// Timestamps
CreatedAt: timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull()
UpdatedAt: timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull()

// Soft delete — على جداول المحتوى
IsDeleted: boolean('IsDeleted').default(false).notNull()

// لا VARCHAR — TEXT دائماً
// update() يتطلب .where() دائماً
// كل WHERE يشمل eq(Table.IsDeleted, false)
// UNIQUE(UserId, LessonId) على UserProgress
```

**DB Commands:**

```bash
bun run db:clear      # حذف كل شيء + migration files
bun run db:generate   # توليد migration SQL
bun run db:migrate    # تطبيق الـ migrations
bun run db:seed       # إضافة البيانات الأولية
bun run db:all        # clear → generate → migrate → seed
bun run db:studio     # Drizzle Studio على :4983
```

---

## قواعد الـ API

### Response Format موحّد

```typescript
// نجاح
{ Success: true, Data: result, Message?: 'optional', Meta?: { Page, Limit, Total } }

// خطأ
{ Success: false, Error: { Code: 'LESSON_NOT_FOUND', Details?: {...} } }
```

### قواعد إلزامية

1. **Zod validation** على كل route — لا استثناء
2. **Rate limiting** على كل AI endpoints — 20 req/min per user
3. **Auth check** أولاً قبل أي منطق
4. **Thin route file** — يفوّض للـ Feature Controller فوراً
5. **Error codes فقط** — لا رسائل داخلية في الـ stream (SEV-005)

```typescript
// route.ts — thin wrapper
import { PostMascotChat } from '@/Features/Mascot/Mascot.Controller';
export async function POST(Req: NextRequest) {
  return PostMascotChat(Req);
}
```

---

## قواعد Server vs Client Components

```typescript
// page.tsx — server component يجيب البيانات
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;   // params هو Promise في Next.js 16
  const data = await getAgents(locale);
  return <AgentPageClient agents={data} locale={locale} />;
}
```

**SSR أولاً** — لا تجلب data بـ useEffect إذا كان ممكناً من السيرفر.

---

## قواعد الأمان

| الرقم | القاعدة |
|-------|---------|
| SEV-001 | XP يُحسب server-side من DB فقط |
| SEV-002 | Rate limiting على كل AI endpoints |
| SEV-003 | Zod validation على كل API route |
| SEV-004 | DB indexes على كل hot query paths |
| SEV-005 | SSE streams: error codes فقط، لا رسائل داخلية |
| SEV-006 | Email verification إلزامي |
| SEV-011 | UNIQUE(UserId, LessonId) على UserProgress |
| SEV-016 | Security headers على كل routes |

---

## اتفاقيات التسمية

| السياق | القاعدة | مثال |
|--------|---------|------|
| كل شيء افتراضياً | PascalCase | `UserProgress`، `GetLessonById`، `IsDeleted` |
| ملفات Next.js | lowercase | `page.tsx`، `layout.tsx`، `route.ts` |
| مجلد `app/` | lowercase | `app/[locale]/dashboard/` |
| جداول DB | PascalCase | `Agents`، `Lessons`، `ConceptChunks` |
| أعمدة DB | PascalCase | `Id`، `CreatedAt`، `UserId` |
| API response | PascalCase | `{ Success, Data, Error }` |

**حد الملف الواحد:** 600 سطر كحد أقصى.

---

## تنظيم الملفات

| الملف | المسار |
|-------|--------|
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

---

## قواعد ALI — الجديدة (Phase 1+)

عند العمل على أي جزء من الـ AI system، اتبع هذه القواعد:

### قاعدة "الـ Cache أولاً"

```
قبل أي AI call → تحقق من SemanticCache
قبل inject محتوى كامل → ابحث في ConceptChunks (RAG)
قبل inject profile كامل → استخدم StudentInsights (مش المحادثات الكاملة)
```

### قاعدة "البيانات دائماً"

```
كل تفاعل ينتج signal → يُحفظ في LearningSignals
كل response → يُحفظ في SemanticCache
كل pattern → يُستخلص في StudentInsights
```

### قاعدة "Tools لا System Prompt ضخم"

```
بدل: inject 3000 حرف في system prompt
استخدم: system prompt صغير + tools يطلب AI منها ما يحتاجه
```

### قاعدة "يتناقص مع الاستخدام"

```
أي ميزة تزيد التكلفة خطياً مع المستخدمين → راجعها
أي ميزة تُنتج بيانات تُحسّن النظام → أعطها أولوية
```

---

## التحقق قبل الانتهاء

```bash
bun run typecheck    # يجب أن ينجح بدون أخطاء
bun run lint         # لا warnings حرجة
bun run verify       # typecheck + lint معاً
```

**لازم typecheck يعدي بدون errors قبل ما تعلن إن المهمة خلصت.**

---

## Next.js 16 — تغييرات مهمة

```typescript
// params هو Promise — لازم await
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
}

// generateMetadata — نفس الشيء
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
}
```

اقرأ `node_modules/next/dist/docs/` قبل كتابة أي كود Next.js.

---

## Framework Gotchas

**Drizzle + PostgreSQL:**
- لا `VARCHAR` — `TEXT` دائماً
- `update()` يتطلب `.where()` دائماً — بدونه يُحدّث **كل** الصفوف
- `.returning()` بعد `insert()` للحصول على `Id` و `CreatedAt`

**TypeScript Re-exports:**
- `export type { Foo }` = type فقط، لا تعمل للقيمة في runtime
- `export { Foo }` = القيمة والـ type — استخدم هذا في barrel files

**Bun:**
- `.env` يُقرأ تلقائياً — لا `import 'dotenv/config'`
- `jose` يعمل مع Web Crypto API native — لا polyfill

---

## مراجع

| الملف | المحتوى |
|-------|---------|
| `docs/AI_VISION.md` | الفلسفة الكاملة لـ ALI — اقرأه أولاً |
| `docs/ARCHITECTURE.md` | المعمارية التقنية الكاملة |
| `docs/ROADMAP.md` | خارطة الطريق بالمراحل |
