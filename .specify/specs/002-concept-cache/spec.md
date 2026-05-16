# Feature Specification: Concept-level Semantic Cache

**Feature Branch**: `002-concept-cache`
**Created**: 2026-05-17
**Status**: Draft
**Decisions**: D-001 في `docs/DECISIONS.md`

---

## الهدف

تحويل الـ Cache من SHA-256 على نص السؤال (hit rate 1-5%) إلى Concept-centric Cache (hit rate 40-60%).
المبدأ: "أطفال يسألون بطرق لا نهائية عن نفس المفهوم" → نُخزّن الشرح بـ concept_id لا بنص السؤال.

---

## User Stories

### User Story 1 — Concept Cache في ToolHandlers (P1)

عند استدعاء `get_concept(conceptId)` → يُتحقق من Concept Cache أولاً → إذا موجود يُعاد مباشرة بدون AI.

**لماذا P1**: هذا هو جوهر D-001. كل سؤال عن Loop أو Variable أو أي مفهوم → يُجاب من Cache بعد أول مرة.

**Independent Test**: اطلب نفس المفهوم مرتين → المرة الثانية HitCount = 2 بكليد concept.

**Acceptance Scenarios**:
1. **Given** مفهوم "loops" تم شرحه مسبقاً، **When** يُطلب مرة ثانية، **Then** يُعاد من Cache (HitCount++)
2. **Given** مفهوم جديد، **When** يُطلب لأول مرة، **Then** يُجلب من ConceptChunks ويُحفظ في Cache
3. **Given** نفس المفهوم بـ detail_level مختلف، **When** يُطلب، **Then** cache key مختلف

### User Story 2 — Cache Stats تشمل Concept Cache (P2)

`GET /api/v1/cache/stats` يُعيد إحصاءات الـ Concept Cache منفصلة عن Question Cache.

**Acceptance Scenarios**:
1. **Given** 10 concept cache hits، **When** يُطلب stats، **Then** `{ ConceptCacheHits: 10, ConceptEntries: 5 }`

---

## Requirements

- **FR-001**: `BuildConceptCacheKey(conceptId, locale, detailLevel)` → `concept::${conceptId}::${locale}::${detailLevel}`
- **FR-002**: `CheckConceptCache(conceptId, locale, detailLevel)` → يُعيد ICacheEntry أو null
- **FR-003**: `SaveConceptCache(conceptId, locale, detailLevel, answer)` → يُخزَّن في SemanticCache بـ concept key
- **FR-004**: `HandleGetConcept` في ToolHandlers → يتحقق من Concept Cache أولاً
- **FR-005**: بعد جلب المحتوى من ConceptChunks → يُحفظ في Concept Cache للمرة القادمة
- **FR-006**: `GetCacheStats()` يُعيد: `{ QuestionCache, ConceptCache }` منفصلتان
- **FR-007**: Cache key يشمل locale لأن الشرح العربي يختلف عن الإنجليزي

## Success Criteria

- **SC-001**: hit rate الـ Concept Cache يرتفع لـ 40%+ بعد 100 جلسة
- **SC-002**: `bun run typecheck` ينجح بدون errors
- **SC-003**: لا DB tables جديدة — يُعاد استخدام SemanticCache مع concept key
