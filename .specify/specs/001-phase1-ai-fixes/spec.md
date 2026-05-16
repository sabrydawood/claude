# Feature Specification: Phase 1 AI Fixes

**Feature Branch**: `001-phase1-ai-fixes`
**Created**: 2026-05-17
**Status**: Draft
**Decisions**: D-032, D-033, D-034 في `docs/DECISIONS.md`

---

## الهدف

ثلاثة تحسينات متكاملة تُعالج:
1. **Bug**: إحصاءات Cache خاطئة
2. **Architecture**: Tool Calling بدل System Prompt الضخم (77% توفير tokens)
3. **Infrastructure**: نظام إدارة AI Providers كامل مع Admin Dashboard

---

## User Stories

### User Story 1 — Cache Stats موثوقة (P1)

المشرف يفتح Admin Dashboard ويرى إحصاءات Cache حقيقية: كم مرة أُجيب سؤال من الـ Cache بدل AI.

**لماذا P1**: Bug حقيقي في الكود — `HitCount` يُعيَّن `1` دائماً بدل increment. كل قرار مبني على إحصاءات Cache الآن غير موثوق.

**Independent Test**: افتح نفس السؤال مرتين → `HitCount` في DB يكون `2`.

**Acceptance Scenarios**:

1. **Given** سؤال مُخزَّن في SemanticCache بـ HitCount=5، **When** يُجاب من الـ Cache مرة أخرى، **Then** HitCount يصبح 6 في DB.
2. **Given** Admin Dashboard يعرض Cache Stats، **When** يفتح المشرف الصفحة، **Then** يرى hit count حقيقياً تراكمياً.

---

### User Story 2 — Mascot يطلب ما يحتاجه فقط (P2)

عندما يسأل الطفل "ما هي الـ loops؟" — الـ Mascot لا يُحقن 750 token من محتوى الدرس كاملاً. بدلاً من ذلك، يطلب شرح مفهوم الـ loops تحديداً من الـ Knowledge Graph.

**لماذا P2**: الأعلى أثراً على التكلفة. 77% توفير في input tokens = أساس كل التوسع المستقبلي.

**Independent Test**: سجّل tokens per request قبل وبعد → يجب أن ينخفض من ~3,500 إلى ~800.

**Acceptance Scenarios**:

1. **Given** طالب يسأل عن مفهوم موجود في Graph، **When** يُعالَج السؤال، **Then** الـ AI يستدعي `get_concept()` tool بدل استلام الدرس كاملاً في system prompt.
2. **Given** طالب يسأل سؤالاً عاماً ("كيف حالك؟")، **When** يُعالَج، **Then** لا tool calls — الـ AI يجيب مباشرة.
3. **Given** طالب يحتاج شرح مفهوم + مستوى إتقانه، **When** يُعالَج، **Then** يستدعي `get_concept()` و `check_student_mastery()` بشكل parallel.
4. **Given** الـ AI يُريد تسجيل signal، **When** ينتهي من التقييم، **Then** يستدعي `record_signal()` وتُحفظ في LearningSignals.
5. **Given** ConceptChunks موجود لمفهوم في DB، **When** يُسأل عنه، **Then** يُستخدم ConceptChunks بدل محتوى الدرس الكامل.

---

### User Story 3 — Admin يتحكم في أي Model يُعالج أي مهمة (P3)

المشرف يفتح Admin Panel → يرى Providers (Anthropic، Google، OpenAI، OpenRouter) → يُعدّل أي model يعالج `simple_chat` و`socratic` و`content_gen` → التغيير يُطبَّق خلال 60 ثانية بدون restart.

**لماذا P3**: 600x فرق في السعر بين أرخص وأغلى نموذج. التحكم الديناميكي يُتيح التجريب والتوفير الفوري.

**Independent Test**: غيّر `simple_chat` من Claude Haiku إلى Gemini Flash من الـ Dashboard → أرسل رسالة عامة → تحقق من logs أنها ذهبت لـ Gemini Flash.

**Acceptance Scenarios**:

1. **Given** Admin Dashboard مفتوح، **When** يضيف Provider جديد (اسم + BaseUrl + ApiKey + models)، **Then** يظهر فوراً في قائمة Providers ويمكن تفعيله.
2. **Given** Provider مفعّل، **When** يُعدّل routing rule لـ `simple_chat` إلى نموذج أرخص، **Then** خلال 60 ثانية كل `simple_chat` requests تذهب للنموذج الجديد.
3. **Given** Provider مُعطَّل، **When** يأتي request لنموذجه، **Then** Router ينتقل للـ Priority التالي تلقائياً (Fallback).
4. **Given** request وارد، **When** يحدد Router الـ TaskType، **Then** يختار أول Provider IsActive بأعلى Priority لهذا TaskType.
5. **Given** ApiKey غير صحيح، **When** يُحفظ Provider، **Then** تظهر رسالة خطأ واضحة.

---

### Edge Cases

- ماذا لو كل Providers لـ TaskType معين مُعطَّلة؟ → Fallback لـ default model مُشفَّر في `.env`
- ماذا لو فشل Tool Call؟ → الـ AI يجيب بدون context (graceful degradation)
- ماذا لو ConceptChunks فارغ لمفهوم معين؟ → يُعاد لـ getLessonById كـ fallback
- Cache HitCount عند concurrent requests؟ → SQL-level atomic increment يتجنب race condition
- ApiKey تُشفَّر في DB؟ → نعم، لا تُخزَّن plain text

---

## Requirements

### Functional Requirements

- **FR-001**: `BumpCacheHit` يجب أن يستخدم SQL atomic increment (`sql\`${SemanticCache.HitCount} + 1\``)
- **FR-002**: Mascot system prompt يجب ألا يتجاوز 300 token (بدون lesson content injection)
- **FR-003**: كل AI call يمر عبر `ProviderRouter` الذي يقرأ routing rules من DB
- **FR-004**: Provider config يُكَشَّف من DB بـ cache 60 ثانية في memory
- **FR-005**: Tools: `get_concept`, `get_prerequisites`, `check_student_mastery`, `get_student_profile`, `get_related_examples`, `record_signal`
- **FR-006**: `get_concept` يستخدم ConceptChunks أولاً، fallback للدرس الكامل
- **FR-007**: Tool calls parallel حيثما لا توجد dependencies
- **FR-008**: Admin Dashboard: إضافة/تعديل/تفعيل/تعطيل Providers والنماذج وRouting Rules
- **FR-009**: ApiKey يُشفَّر عند الحفظ ويُفكَّك عند الاستخدام فقط
- **FR-010**: Fallback chain: إذا فشل Provider → التالي في Priority → `.env` default

### Key Entities

- **Provider**: `{Id, Name, Description, BaseUrl, ApiKey (encrypted), IsActive}`
- **ProviderModel**: `{Id, ProviderId, ModelName, InputCostPerM, OutputCostPerM, MaxTokens, IsActive}`
- **RoutingRule**: `{Id, TaskType, ModelId, Priority, IsActive}`
- **TaskType** (enum): `simple_chat | explanation | socratic | assessment | content_gen | translation`

---

## Success Criteria

- **SC-001**: HitCount في SemanticCache يتراكم صحيحاً (لا يبقى 1)
- **SC-002**: متوسط tokens per Mascot request ينخفض من ~3,500 إلى ≤ 900
- **SC-003**: تغيير routing rule يُطبَّق ≤ 60 ثانية بدون restart
- **SC-004**: `bun run typecheck` ينجح بدون errors بعد التنفيذ
- **SC-005**: Fallback يعمل تلقائياً عند تعطيل Provider

---

## Assumptions

- pgvector وDrizzle موجودان ومُهيَّآن (Phase 1 ✅)
- ConceptChunks table موجود في Schema (Phase 1 ✅) لكن فارغ — يُملأ لاحقاً
- Admin Dashboard موجود في المشروع (يُضاف section جديد فقط)
- better-auth يُؤمّن Admin routes بـ role-based access
- ApiKey encryption: AES-256-GCM عبر Web Crypto API (متاح في Bun)
