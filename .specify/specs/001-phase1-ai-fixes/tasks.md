# Tasks: Phase 1 AI Fixes

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-05-17

---

## Phase 1: Setup — قاعدة البيانات

**Purpose**: الجداول الجديدة يجب أن تكون جاهزة قبل أي كود

- [ ] T001 تعديل `src/Lib/Db/Schema.ts` — إضافة جداول `Providers`، `ProviderModels`، `RoutingRules` بالضبط كما في plan.md
- [ ] T002 إضافة `src/Lib/Ai/Crypto.ts` — دالتان: `EncryptApiKey(key)` و `DecryptApiKey(enc)` باستخدام AES-256-GCM + Web Crypto API
- [ ] T003 [P] تشغيل `bun run db:generate` ثم `bun run db:migrate`

---

## Phase 2: User Story 1 — Bug Fix: BumpCacheHit

**Goal**: HitCount يتراكم صحيحاً بدل أن يُعيَّن 1 دائماً

**Independent Test**: نفس السؤال مرتين → HitCount في DB = 2

- [ ] T004 تعديل `src/Lib/Ai/Cache.Service.ts` — السطر الوحيد في `BumpCacheHit`:
  ```typescript
  // من:
  .set({ HitCount: 1 })
  // إلى:
  .set({ HitCount: sql`${SemanticCache.HitCount} + 1` })
  ```
- [ ] T005 تشغيل `bun run typecheck` — يجب أن ينجح بدون errors

**Checkpoint**: HitCount يتراكم → US1 مكتملة ✅

---

## Phase 3: User Story 2 — Tool Calling Layer

**Goal**: Mascot يطلب ما يحتاجه فقط بدل حقن محتوى الدرس كاملاً

**Independent Test**: tokens/request ≤ 900 (مقارنة بـ ~3,500 قبلها)

### Phase 3a: تعريف الـ Tools

- [ ] T006 إنشاء `src/Lib/Ai/Tools.ts` — تعريف `MascotTools` array كما في plan.md (6 tools)
- [ ] T007 [P] إنشاء `src/Lib/Ai/ToolHandlers.ts` — تنفيذ كل tool:
  - `handle_get_concept(concept_id, detail_level)` ← يقرأ من ConceptChunks أولاً، fallback للـ getLessonById
  - `handle_get_prerequisites(concept_id)` ← يستخدم Graph.Service.GetPrerequisites
  - `handle_check_student_mastery(user_id, concept_id)` ← يقرأ من StudentMastery
  - `handle_get_student_profile(user_id)` ← يقرأ من StudentInsights
  - `handle_get_related_examples(concept_id, age_range)` ← يقرأ من ConceptChunks بفلتر age_range
  - `handle_record_signal(user_id, concept_id, signal_type, value)` ← يكتب في LearningSignals

### Phase 3b: تعديل Mascot

- [ ] T008 تعديل `src/Features/Mascot/Mascot.Service.ts`:
  - إزالة `${Lesson.content.slice(0, 3000)}` من system prompt
  - system prompt جديد ≤ 300 token (تعريف الشخصية + قواعد الأطفال فقط)
  - إضافة `BuildMascotSystemPromptCached()` المحدثة بدون lesson content
- [ ] T009 تعديل `src/Features/Mascot/Mascot.Controller.ts`:
  - إضافة `tools: MascotTools` في كل AI call
  - إضافة loop لمعالجة tool_use responses من Claude
  - تحديد `TaskType` بناءً على طبيعة السؤال (simple vs complex)
  - استدعاء `ToolHandlers` وإعادة نتيجتها للـ AI
- [ ] T010 تشغيل `bun run typecheck` → يجب أن ينجح

**Checkpoint**: Mascot يعمل بـ Tools → tokens/request ≤ 900 → US2 مكتملة ✅

---

## Phase 4: User Story 3 — Provider Management System

**Goal**: Admin يتحكم في أي Model يعالج أي مهمة من Dashboard

**Independent Test**: تغيير routing rule → خلال 60s يُطبَّق بدون restart

### Phase 4a: Provider Router

- [ ] T011 إنشاء `src/Lib/Ai/ProviderRouter.ts`:
  - `GetModelForTask(taskType: TaskType): Promise<ResolvedModel>`
  - In-memory cache لـ routing rules (TTL: 60 ثانية)
  - Fallback chain: Active providers بترتيب Priority → `.env` DEFAULT_MODEL
  - `DecryptApiKey()` من Crypto.ts قبل إعادة ApiKey
- [ ] T012 [P] تعديل `src/Features/Mascot/Mascot.Controller.ts`:
  - كل AI call يمر عبر `GetModelForTask(taskType)` بدل hard-coded model
  - استخدام `provider.BaseUrl` + `model.ModelName` + `apiKey` المُفكَّك

### Phase 4b: Admin API

- [ ] T013 [P] إنشاء `src/Features/Admin/Providers/Providers.Schemas.ts` — Zod schemas للـ CRUD
- [ ] T014 [P] إنشاء `src/Features/Admin/Providers/Providers.Service.ts`:
  - `CreateProvider(data)` ← يُشفّر ApiKey قبل الحفظ
  - `UpdateProvider(id, data)` ← يُشفّر ApiKey الجديد لو تغيَّر
  - `ListProviders()` ← يُعيد بدون ApiKey
  - `ToggleProvider(id, isActive)`
- [ ] T015 إنشاء `src/Features/Admin/Providers/Providers.Controller.ts`
- [ ] T016 [P] إنشاء `src/Features/Admin/RoutingRules/RoutingRules.Schemas.ts`
- [ ] T017 [P] إنشاء `src/Features/Admin/RoutingRules/RoutingRules.Service.ts`:
  - `UpsertRoutingRule(taskType, modelId, priority)`
  - `ListRoutingRules()`
  - `ToggleRule(id, isActive)`
  - عند أي تعديل → `InvalidateProviderCache()` في ProviderRouter
- [ ] T018 إنشاء `src/Features/Admin/RoutingRules/RoutingRules.Controller.ts`
- [ ] T019 [P] إنشاء API routes:
  - `src/app/api/v1/admin/providers/route.ts` (GET, POST)
  - `src/app/api/v1/admin/providers/[id]/route.ts` (PATCH, DELETE)
  - `src/app/api/v1/admin/routing-rules/route.ts` (GET, POST)
  - `src/app/api/v1/admin/routing-rules/[id]/route.ts` (PATCH)
  - كل route: Auth check (admin role) أولاً

### Phase 4c: Admin UI

- [ ] T020 إنشاء `src/app/[locale]/(admin)/providers/page.tsx`:
  - جدول Providers مع Toggle تفعيل/تعطيل
  - Modal إضافة Provider جديد (اسم، URL، ApiKey، models)
  - جدول Routing Rules مع Drag-to-reorder للـ Priority
  - عرض التكلفة/M token لكل نموذج
- [ ] T021 تشغيل `bun run typecheck` → يجب أن ينجح بدون errors

**Checkpoint**: Admin يُضيف Provider ويُعدّل routing → يُطبَّق ≤ 60s → US3 مكتملة ✅

---

## Phase 5: Polish & Validation

- [ ] T022 [P] إضافة Sentry error tracking على tool call failures
- [ ] T023 [P] Seed initial Providers في `src/Lib/Db/Seed.ts`:
  - Anthropic (Haiku → explanation، Sonnet → socratic/assessment/content_gen)
  - Google (Gemini Flash → simple_chat، translation)
  - OpenAI (GPT-4o-mini → fallback عام)
- [ ] T024 تشغيل `bun run verify` (typecheck + lint) — يجب أن ينجح
- [ ] T025 تحديث `docs/PROGRESS.md` — Phase 1 fixes ✅

---

## Dependencies & Execution Order

```
T001 → T002 → T003 (DB أولاً)
                ↓
T004 → T005 (US1 — مستقلة، أسرع)
T006 → T007 → T008 → T009 → T010 (US2 — بعد DB)
T011 → T012 (بعد T006-T009)
T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021 (US3)
T022 → T023 → T024 → T025 (Polish — بعد كل شيء)
```

### Parallel Opportunities

- T003، T006، T007: يمكن توازيها بعد T001+T002
- T013، T014، T016، T017، T019: يمكن توازيها بعد T011
- T022، T023: يمكن توازيها مع T024
