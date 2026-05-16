# Phase 1 Progress — ALI Foundation

> هذا الملف يتتبع تقدم كل مهمة في Phase 1.
> يُحدَّث بعد كل عملية — لا نبدأ من الصفر في أي session جديد.

**بدأ:** 2026-05-16
**الهدف:** بناء الطبقات الأساسية لـ ALI (Knowledge Graph + Semantic Cache + Student Mastery)

---

## الحالة العامة

```
Phase 1 (ALI Foundation):  ██████████  100% ✅
Phase 1 Fixes (AI Arch):   ██████████  100% ✅
Phase 2 (Features):        ░░░░░░░░░░    0% — مخطط
```

### ✅ Phase 1 Fixes — مكتملة (2026-05-17)

| المهمة | الوصف | الحالة |
|-------|-------|--------|
| Bug Fix BumpCacheHit | HitCount يتراكم صحيحاً الآن | ✅ |
| Tool Calling Layer | Mascot يطلب ما يحتاجه فقط (77% توفير tokens) | ✅ |
| Provider Management | Admin Dashboard كامل + Hot-swap بدون restart | ✅ |
| DB Migration | Providers + ProviderModels + RoutingRules | ✅ |
| Seed Data | Anthropic (Haiku/Sonnet) + Google (Flash) + 6 routing rules | ✅ |
| Typecheck | 0 errors | ✅ |

---

## المهام التفصيلية

| ID | المهمة | المنفذ | الحالة | Commit | ملاحظات |
|----|--------|--------|--------|--------|---------|
| P1-PREV | Dev Preview Page | Claude (main) | 🔄 In Progress | - | World Map 3D + Phase 1 preview |
| P1-S | DB Schema — كل جداول Phase 1 | Schema-Agent | ✅ Done | 020265c | 7 tables + migration |
| P1-G | Knowledge Graph Service | Graph-Agent | ✅ Done | f4d9b10 | import fix: @/Lib/ → @/lib/ |
| P1-C | Semantic Cache Service + Mascot update | Cache-Agent | ✅ Done | f4d9b10 | Cache.Service + LRU + Controller |
| P1-M | Student Mastery Service + API | Mastery-Agent | ✅ Done | 0a90f98 | Mastery feature + 2 API routes |
| P1-R | Review + Typecheck + Merge | Claude (main) | ✅ Done | f4d9b10 | 0 TypeScript errors |

---

## تفاصيل كل مهمة

### P1-S — DB Schema (Schema-Agent)

**الهدف:** إضافة 7 جداول جديدة لـ Phase 1 في `src/Lib/Db/Schema.ts`

الجداول:
- `Concepts` — المفاهيم التعليمية (nodes في الـ Graph)
- `ConceptRelations` — العلاقات بين المفاهيم (edges)
- `ConceptChunks` — مقاطع المحتوى لكل مفهوم (للـ RAG)
- `StudentMastery` — مستوى إتقان كل طفل لكل مفهوم
- `LearningSignals` — signals تعليمية من كل تفاعل
- `StudentInsights` — حقائق مستخلصة عن الطالب
- `SemanticCache` — cache دائمة للأسئلة والإجابات

ثم: `bun run db:generate && bun run db:migrate`

**الملفات المستهدفة:**
- تعديل: `src/Lib/Db/Schema.ts`
- يولّد: `drizzle/[migration].sql`

---

### P1-G — Knowledge Graph Service (Graph-Agent)

**الهدف:** إنشاء service layer للتعامل مع الـ Knowledge Graph

**الملفات الجديدة:**
- `src/Lib/Graph/Graph.Service.ts`
- `src/Lib/Graph/Graph.Types.ts`

الدوال المطلوبة:
- `GetConceptById(id)` — جلب مفهوم بالـ ID
- `GetConceptRelations(conceptId)` — كل علاقات مفهوم
- `GetPrerequisites(conceptId)` — ما يجب معرفته قبل هذا المفهوم
- `GetLearningPath(fromId, toId)` — مسار تعلم بين مفهومين
- `SearchConcepts(query, locale)` — بحث نصي في المفاهيم
- `GetStudentGraphState(userId)` — خريطة المفاهيم للطالب مع مستوى الإتقان

---

### P1-C — Semantic Cache (Cache-Agent)

**الهدف:** Cache دائم للأسئلة — يُخفض تكلفة AI بشكل كبير

**الملفات الجديدة:**
- `src/Lib/Ai/Cache.Service.ts`

**تعديل:**
- `src/Features/Mascot/Mascot.Controller.ts` — إضافة cache check قبل AI call
- `src/Features/Mascot/Mascot.Service.ts` — LRU cache للـ system prompt

الدوال:
- `CheckExactCache(questionHash, pageKey, locale)` — SHA256 exact match
- `SaveToCache(question, answer, pageKey, locale)` — حفظ في الـ Cache
- `GetCacheStats()` — hit rate + count للـ dashboard

---

### P1-M — Student Mastery (Mastery-Agent)

**الهدف:** تتبع مستوى إتقان كل طالب لكل مفهوم

**الملفات الجديدة:**
- `src/Features/Mastery/Mastery.Service.ts`
- `src/Features/Mastery/Mastery.Controller.ts`
- `src/Features/Mastery/Mastery.Schemas.ts`
- `src/Features/Mastery/Mastery.Types.ts`
- `src/app/api/v1/mastery/route.ts`
- `src/app/api/v1/mastery/[conceptId]/route.ts`

الدوال:
- `UpdateMastery(userId, conceptId, signal)` — تحديث الـ score
- `GetStudentMastery(userId)` — كل مستويات الإتقان
- `RecordSignal(userId, conceptId, signalType, value)` — تسجيل signal

---

## سجل الـ Commits

| التاريخ | Commit Hash | الوصف |
|---------|-------------|-------|
| 2026-05-16 | 9cb4ea1 | cleanup: dev pages + unused models |
| 2026-05-16 | 722bde2 | docs: DECISIONS.md + references |
| 2026-05-16 | c38852b | docs: D-008 UI decisions confirmed |

---

## كيفية الاستئناف في session جديد

1. اقرأ هذا الملف أولاً
2. تحقق من آخر commit في الـ Git
3. كمّل من الـ Status الأخير في الجدول أعلاه
4. لا تُعيد ما تم — تابع من حيث توقف

---

> **تحديث هذا الملف:** بعد كل مهمة يُكتمل → حدّث الجدول + الـ commit hash
