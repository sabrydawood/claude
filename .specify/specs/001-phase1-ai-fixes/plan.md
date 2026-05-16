# Implementation Plan: Phase 1 AI Fixes

**Branch**: `001-phase1-ai-fixes` | **Date**: 2026-05-17 | **Spec**: [spec.md](spec.md)

---

## Summary

ثلاثة تحسينات متسلسلة: bug fix فوري (سطر واحد) → Tool Calling Layer (تغيير معماري في Mascot) → Provider Management System (DB schema جديد + Admin UI).

---

## Technical Context

**Language/Version**: TypeScript · Next.js 16 · Bun  
**Primary Dependencies**: Drizzle ORM · better-auth · OpenAI SDK · Anthropic SDK  
**Storage**: PostgreSQL + pgvector (موجود)  
**Testing**: `bun run typecheck` + `bun run verify`  
**Target Platform**: Next.js API Routes (server-side)  
**Performance Goals**: tokens/request ≤ 900 · Provider config cache ≤ 60s TTL  
**Constraints**: COPPA compliant · RTL-safe · 600 سطر/ملف max

---

## Constitution Check

- [x] ALI-First: Tool Calling يُقلل التكلفة ويُحسّن Data Flywheel
- [x] COPPA-First: لا تغيير في بيانات الأطفال
- [x] Arabic-First: لا تأثير على RTL
- [x] Mobile-First: تقليل tokens = أسرع على الجوال
- [x] Provider-Agnostic: هذا هو جوهر US3

---

## Project Structure

```
src/
├── Lib/
│   ├── Ai/
│   │   ├── Cache.Service.ts          ← تعديل: BumpCacheHit fix
│   │   ├── Tools.ts                  ← جديد: تعريفات الـ Tools
│   │   ├── ProviderRouter.ts         ← جديد: اختيار النموذج حسب TaskType
│   │   └── Crypto.ts                 ← جديد: تشفير ApiKey
│   └── Db/
│       └── Schema.ts                 ← تعديل: Providers + ProviderModels + RoutingRules
├── Features/
│   ├── Mascot/
│   │   ├── Mascot.Service.ts         ← تعديل: إزالة lesson injection + إضافة Tools
│   │   └── Mascot.Controller.ts      ← تعديل: TaskType routing
│   └── Admin/
│       ├── Providers/
│       │   ├── Providers.Controller.ts  ← جديد
│       │   ├── Providers.Service.ts     ← جديد
│       │   └── Providers.Schemas.ts     ← جديد
│       └── RoutingRules/
│           ├── RoutingRules.Controller.ts ← جديد
│           ├── RoutingRules.Service.ts    ← جديد
│           └── RoutingRules.Schemas.ts    ← جديد
└── app/
    ├── api/v1/
    │   └── admin/
    │       ├── providers/route.ts        ← جديد
    │       ├── providers/[id]/route.ts   ← جديد
    │       ├── routing-rules/route.ts    ← جديد
    │       └── routing-rules/[id]/route.ts ← جديد
    └── [locale]/(admin)/
        └── providers/
            └── page.tsx                  ← جديد: Admin UI
```

---

## Data Model

### الجداول الجديدة

```typescript
// Providers
export const Providers = pgTable('Providers', {
  Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Name:        text('Name').notNull(),                    // "Anthropic", "Google"
  Description: text('Description'),
  BaseUrl:     text('BaseUrl').notNull(),                 // "https://api.anthropic.com"
  ApiKeyEnc:   text('ApiKeyEnc').notNull(),               // AES-256-GCM encrypted
  IsActive:    boolean('IsActive').default(true).notNull(),
  CreatedAt:   timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
  UpdatedAt:   timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
});

// ProviderModels
export const ProviderModels = pgTable('ProviderModels', {
  Id:              uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  ProviderId:      uuid('ProviderId').references(() => Providers.Id).notNull(),
  ModelName:       text('ModelName').notNull(),            // "claude-haiku-4-5"
  InputCostPerM:   numeric('InputCostPerM', { precision: 10, scale: 6 }).notNull(),
  OutputCostPerM:  numeric('OutputCostPerM', { precision: 10, scale: 6 }).notNull(),
  MaxTokens:       integer('MaxTokens').default(8192).notNull(),
  IsActive:        boolean('IsActive').default(true).notNull(),
  CreatedAt:       timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

// RoutingRules
export const RoutingRules = pgTable('RoutingRules', {
  Id:       uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  TaskType: text('TaskType').notNull(),  // 'simple_chat' | 'explanation' | 'socratic' | ...
  ModelId:  uuid('ModelId').references(() => ProviderModels.Id).notNull(),
  Priority: integer('Priority').default(1).notNull(),  // 1 = أعلى أولوية
  IsActive: boolean('IsActive').default(true).notNull(),
  UpdatedAt: timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
});
```

---

## API Contracts

### Providers API

```
GET    /api/v1/admin/providers          → { Success, Data: Provider[] }
POST   /api/v1/admin/providers          → { Success, Data: Provider }
PATCH  /api/v1/admin/providers/:id      → { Success, Data: Provider }
DELETE /api/v1/admin/providers/:id      → { Success }

GET    /api/v1/admin/routing-rules      → { Success, Data: RoutingRule[] }
POST   /api/v1/admin/routing-rules      → { Success, Data: RoutingRule }
PATCH  /api/v1/admin/routing-rules/:id  → { Success, Data: RoutingRule }
```

### ProviderRouter Interface

```typescript
type TaskType =
  | 'simple_chat'   // تحيات، أسئلة عامة
  | 'explanation'   // شرح مفاهيم
  | 'socratic'      // حوار سقراطي
  | 'assessment'    // تقييم إجابات
  | 'content_gen'   // توليد محتوى مناهج
  | 'translation';  // ترجمة

interface ResolvedModel {
  provider: Provider;
  model: ProviderModel;
  apiKey: string;  // مُفكَّك من التشفير
}

async function GetModelForTask(taskType: TaskType): Promise<ResolvedModel>
// يقرأ من cache 60s → DB → يختار أول IsActive بأعلى Priority → Fallback لـ .env
```

### Mascot Tools

```typescript
const MascotTools = [
  {
    name: 'get_concept',
    description: 'جلب شرح مفهوم محدد من Knowledge Graph',
    input_schema: {
      concept_id: { type: 'string' },
      detail_level: { type: 'string', enum: ['brief', 'full'] }
    }
  },
  {
    name: 'get_prerequisites',
    description: 'المفاهيم اللازمة قبل هذا المفهوم',
    input_schema: { concept_id: { type: 'string' } }
  },
  {
    name: 'check_student_mastery',
    description: 'مستوى إتقان الطالب لمفهوم (0-100)',
    input_schema: { user_id: { type: 'string' }, concept_id: { type: 'string' } }
  },
  {
    name: 'get_student_profile',
    description: 'ملخص أسلوب تعلم الطالب ونقاط ضعفه',
    input_schema: { user_id: { type: 'string' } }
  },
  {
    name: 'get_related_examples',
    description: 'أمثلة من الحياة لمفهوم حسب الفئة العمرية',
    input_schema: {
      concept_id: { type: 'string' },
      age_range: { type: 'string', enum: ['4-8', '9-12', '13-16'] }
    }
  },
  {
    name: 'record_signal',
    description: 'تسجيل signal تعلم في LearningSignals',
    input_schema: {
      user_id: { type: 'string' },
      concept_id: { type: 'string' },
      signal_type: { type: 'string' },
      value: { type: 'number' }
    }
  }
]
```
