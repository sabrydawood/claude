# ذكاوي — Spec-Kit Constitution

## Core Principles

### I. ALI-First — النظام يُعلّم ويتعلم

كل feature يجب أن تجيب على: **"هل يجعل هذا التكلفة تتناقص مع زيادة الاستخدام؟"**

- كل تفاعل → يُنتج signal → يُحفظ في LearningSignals
- قبل أي AI call → تحقق من SemanticCache + ConceptChunks
- بدل System Prompt ضخم → استخدم Tools تطلب ما تحتاجه فقط
- بيانات كل طفل تُحسّن التجربة للجميع (Data Flywheel)

### II. COPPA-First — حماية الأطفال غير قابلة للتفاوض

قواعد صارمة لا استثناء (SEV-020 → SEV-025):

- الوالد ينشئ حساب الطفل < 13 — لا تسجيل مستقل
- لا نشر محتوى عام (اسم، صورة) للأطفال < 13 بدون VPC
- لا مشاركة بيانات مع أطراف ثالثة أو تدريب AI خارجي
- تسجيل الصوت يُحذف فوراً — لا احتفاظ بدون موافقة والدين
- Prompt Gallery: < 13 بموافقة والدين، 13+ مباشرة

### III. Arabic-First — لغة أصيلة لا ترجمة

- RTL من اليوم الأول في كل component
- UI strings → `useTranslations()` فقط — لا نص مُشفَّر مباشرة
- المحتوى التعليمي عربي أصيل — لا ترجمة من إنجليزية
- Validation العربية: تجريد التشكيل قبل المقارنة
- اختبار dnd-kit على جهاز عربي RTL فعلي قبل الإطلاق

### IV. Mobile-First — 90%+ من الأطفال على الجوال

- Touch targets: 48×48px للـ 4-7 سنوات، 44×44px للـ 8+
- PWA + Offline: محتوى الجلسة يُحمَّل مسبقاً (5-25 MB/درس)
- Background Sync عند عودة الإنترنت
- Framer Motion: `useReducedMotion()` إلزامي — WCAG 2.1

### V. Provider-Agnostic — تحكم كامل في نماذج AI

- كل AI call يمر عبر Provider Router (لا hard-coded model)
- Tiered strategy إلزامي:
  - `simple_chat` → Gemini Flash
  - `explanation` → Claude Haiku
  - `socratic` / `assessment` → Claude Sonnet
  - `content_gen` → Claude Sonnet
- تغيير Provider بدون Deploy (Hot-swap من Admin Dashboard)
- Prompt Caching (Anthropic) على كل system prompt + tools

---

## Technical Constraints

### Stack (غير قابل للتغيير بدون قرار في DECISIONS.md)

```
Frontend:   Next.js 16 · TypeScript · Tailwind v4 · Framer Motion · Three.js/R3F
Backend:    Bun · Next.js API Routes
Database:   PostgreSQL + pgvector · Drizzle ORM
AI:         Tool Calling + GraphRAG + Semantic Cache
Auth:       better-auth
i18n:       next-intl (AR + EN)
Monitoring: Sentry
```

### Database Rules (إلزامية)

```typescript
Id:        uuid().primaryKey().$defaultFn(() => uuidv7())
CreatedAt: timestamp({ withTimezone: true }).defaultNow().notNull()
UpdatedAt: timestamp({ withTimezone: true }).defaultNow().notNull()
IsDeleted: boolean().default(false).notNull()  // على جداول المحتوى

// ممنوع VARCHAR — TEXT دائماً
// update() يتطلب .where() دائماً
// كل WHERE يشمل eq(Table.IsDeleted, false)
// .returning() بعد insert()
// BumpCacheHit: sql`${Table.HitCount} + 1` — لا .set({ HitCount: 1 })
```

### Naming Conventions

| السياق | القاعدة |
|--------|---------|
| كل شيء افتراضياً | PascalCase |
| ملفات Next.js | lowercase |
| مجلد app/ | lowercase |
| API response | `{ Success, Data, Error }` |

**حد الملف الواحد:** 600 سطر.

### HTTP Rules

- ممنوع `fetch()` مباشرة — كل HTTP عبر `src/lib/api/http-client.ts`
- كل route: Zod validation إلزامي
- AI endpoints: Rate limiting 20 req/min per user
- Thin route files — يُفوَّض للـ Feature Controller فوراً

### File Organization

```
src/Features/[Feature]/[Feature].Controller.ts
src/Features/[Feature]/[Feature].Service.ts
src/Features/[Feature]/[Feature].Schemas.ts
src/Features/[Feature]/[Feature].Types.ts
src/app/api/v1/[route]/route.ts
src/Lib/Db/Schema.ts
src/Lib/Graph/Graph.Service.ts
src/Lib/Ai/Cache.Service.ts
```

---

## Development Workflow

### قبل أي قرار معماري

1. اقرأ `docs/DECISIONS.md` — سجل كل القرارات المتفق عليها
2. لا تُنفَّذ أي شيء إلا بعد توثيقه في DECISIONS.md
3. لا تسأل بنص عادي — الأسئلة عبر AskUserQuestion

### قبل الإعلان عن انتهاء أي مهمة TypeScript

```bash
bun run typecheck    # يجب أن ينجح بدون أخطاء
bun run verify       # typecheck + lint معاً
```

### Spec-Kit Workflow (لكل Feature)

```
DECISIONS.md (القرار) → spec.md → plan.md → tasks.md → implement → typecheck → done
```

### Security Gates (لازم قبل merge)

- [ ] COPPA rules (SEV-020 → SEV-025) محترمة
- [ ] لا بيانات طفل < 13 عامة بدون VPC
- [ ] XP يُحسب server-side فقط (SEV-001)
- [ ] Rate limiting على كل AI endpoint (SEV-002)
- [ ] Zod validation على كل route (SEV-003)

---

## Governance

- هذا الملف + `CLAUDE.md` + `docs/AI_VISION.md` = المرجع الأعلى
- أي تعارض: DECISIONS.md يحسم
- تعديل هذا الملف يتطلب قرار في DECISIONS.md أولاً
- كل specs في `.specify/specs/[###-feature-name]/`

**المراجع:**

| الملف | المحتوى |
|-------|---------|
| `docs/DECISIONS.md` | D-001 → D-036 — كل القرارات |
| `docs/AI_VISION.md` | فلسفة ALI |
| `docs/RESEARCH/` | 4 تقارير بحثية |
| `CLAUDE.md` | Conventions للمطورين والـ AI agents |

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
