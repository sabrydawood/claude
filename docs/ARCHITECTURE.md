# Architecture — ذكاوي (Zkawi)

> **المبدأ الحاكم:** كل قرار معماري يجب أن يجعل النظام أذكى وأرخص مع الوقت.
> راجع `docs/AI_VISION.md` للفلسفة الكاملة.

---

## نظرة عامة

ذكاوي منصة تعليمية تعتمد على **Adaptive Learning Intelligence (ALI)** — نظام يجمع بين Knowledge Graph وRAG وSemantic Cache لتقديم تجربة تعليمية مخصصة لكل طفل بتكلفة تتناقص مع الاستخدام.

البنية: **Next.js 16 App Router** + **PostgreSQL + pgvector** + **Multi-provider AI**.

---

## طبقات ALI — المعمارية الذكية

```
┌──────────────────────────────────────────────────┐
│                طلب المستخدم                       │
└─────────────────────┬────────────────────────────┘
                      │
            ┌─────────▼──────────┐
            │  Semantic Cache     │  ← hit → رجّع مجاناً
            │  (pgvector)         │  ← miss → الطبقة التالية
            └─────────┬──────────┘
                      │ miss
            ┌─────────▼──────────┐
            │  Knowledge Graph    │  ← حدّد المفاهيم المطلوبة
            │  + RAG Retrieval    │  ← جيب الـ chunks المرتبطة
            └─────────┬──────────┘
                      │
            ┌─────────▼──────────┐
            │  Student Profile    │  ← خصّص للطفل
            │  + Tools            │  ← AI يطلب ما يحتاجه فقط
            └─────────┬──────────┘
                      │
            ┌─────────▼──────────┐
            │  AI Provider        │  ← أصغر context = أرخص
            │  + Prompt Cache     │
            └─────────┬──────────┘
                      │
            ┌─────────▼──────────┐
            │  Signal Collection  │  ← يُحسّن كل الطبقات
            └─────────────────────┘
```

---

## هيكل المشروع

```
src/
├── app/                              # Next.js App Router
│   ├── [locale]/                     # ar (default) + en
│   │   ├── layout.tsx                # HTML lang/dir + Mascot + Providers
│   │   ├── page.tsx                  # الصفحة الرئيسية
│   │   ├── onboarding/               # استطلاع التخصيص
│   │   ├── (auth)/                   # login / register
│   │   └── (main)/                   # Protected routes
│   │       ├── dashboard/
│   │       ├── sandbox/              # AI chat + conversation sidebar
│   │       ├── agents/[slug]/
│   │       │   └── lessons/[id]/
│   │       ├── leaderboard/
│   │       ├── profile/[userId]/
│   │       └── admin/
│   └── api/v1/                       # Versioned API (thin wrappers)
│       ├── mascot/                   # SSE chat + cache check
│       ├── sandbox/                  # SSE chat + multi-provider
│       ├── conversations/            # Mascot + Sandbox history
│       ├── progress/                 # XP + achievements
│       ├── keys/                     # API key management
│       ├── onboarding/
│       ├── leaderboard/
│       └── admin/
│
├── Features/                         # Feature modules
│   ├── Mascot/                       # AI teacher — الجوهر
│   │   ├── Mascot.Controller.ts
│   │   ├── Mascot.Service.ts         # BuildMascotSystemPrompt
│   │   ├── Mascot.Cache.ts           # ← (Phase 1) Semantic Cache logic
│   │   └── Mascot.Tools.ts           # ← (Phase 1) Tool definitions
│   ├── Conversations/                # Chat history persistence
│   ├── Sandbox/                      # User's own AI chat
│   ├── Progress/                     # XP، streaks، achievements
│   ├── Keys/                         # Multi-provider key management
│   ├── Auth/
│   ├── Onboarding/
│   ├── Leaderboard/
│   ├── Profile/
│   └── Admin/
│
├── Shared/
│   ├── Middleware/                   # Auth، Validation، RateLimit
│   └── Types/                        # Api.Types.ts، Common.Types.ts
│
├── Lib/
│   ├── Db/
│   │   ├── Schema.ts                 # Drizzle schema (كل الجداول)
│   │   ├── Index.ts                  # PostgreSQL + pgvector connection
│   │   ├── Seed.ts                   # بيانات أولية
│   │   └── Clear.ts / Reset.ts
│   ├── Ai/
│   │   ├── Providers.ts              # Multi-provider fallback chain
│   │   └── Cache.ts                  # ← (Phase 1) Semantic Cache
│   ├── Graph/                        # ← (Phase 1) Knowledge Graph queries
│   │   ├── Graph.Service.ts
│   │   └── Graph.Types.ts
│   └── Encryption/                   # AES-256-GCM
│
└── components/
    ├── mascot.tsx                    # Mascot orchestrator + patrol
    ├── mascot-dialogue.tsx           # RPG dialogue box
    ├── mascot-gltf.tsx               # 3D Xbot (Three.js/R3F)
    ├── selection-tooltip.tsx         # "اشرح مع ذكي ✨"
    ├── layout/                       # Header + Footer
    ├── ui/                           # Button، Card، etc.
    └── home/                         # Hero، Features، etc.
```

---

## قاعدة البيانات — Schema الكامل

### جداول ALI (Phase 1+)

```typescript
// Knowledge Graph
Concepts           (Id, NameAr, NameEn, Difficulty, Type, IsDeleted)
ConceptRelations   (Id, FromConceptId, ToConceptId, RelationType)
ConceptChunks      (Id, ConceptId, Content, Embedding vector(1536), Locale)

// Student Intelligence
StudentMastery     (Id, UserId, ConceptId, Score, Attempts, LastTested)
LearningSignals    (Id, UserId, ConceptId, SignalType, Value, CreatedAt)
StudentInsights    (Id, UserId, InsightType, Value, UpdatedAt)

// Semantic Cache (دائم، لا TTL)
SemanticCache      (Id, QuestionEmbedding vector(1536), Answer, PageKey,
                    Locale, HitCount, CreatedAt)
```

### جداول Core (موجودة)

```
users                 (better-auth)
sessions / accounts   (better-auth)
Agents + AgentTranslations
Lessons + LessonTranslations
QuizQuestions + QuizQuestionTranslations
QuizOptions + QuizOptionTranslations
Achievements + AchievementTranslations
Tracks + TrackTranslations
UserProgress          (UNIQUE UserId+LessonId)
UserStats             (TotalXp, StreakDays, Level)
UserAchievements
UserPreferences       (onboarding data)
LearningPaths
EncryptedKeys         (AES-256-GCM + Provider)
SandboxSessions       (metadata فقط)
Conversations         (Mascot + Sandbox history)
ConversationMessages
SystemPrompts         (DB-stored prompts)
```

### اتفاقيات الـ Schema

```typescript
// كل جدول له:
Id: uuid('Id').primaryKey().$defaultFn(() => uuidv7())  // time-sortable
CreatedAt: timestamp({ withTimezone: true }).defaultNow()
UpdatedAt: timestamp({ withTimezone: true }).defaultNow()
IsDeleted: boolean().default(false)  // على جداول المحتوى

// لا VARCHAR — TEXT دائماً
// UNIQUE(UserId, LessonId) على UserProgress
// كل WHERE يشمل eq(Table.IsDeleted, false) في queries العادية
```

---

## معمارية الـ AI

### Multi-Provider Fallback Chain

```
OpenRouter (free tier)
    ↓ fail
Gemini 2.0 Flash Lite
    ↓ fail
OpenAI GPT-4o mini
    ↓ fail
Anthropic Claude Haiku
```

كل Provider يتبع نفس interface `IAIProvider` — إضافة provider جديد = إضافة entry واحدة في `PROVIDERS[]`.

### Mascot Request Flow (بعد Phase 1)

```
POST /api/v1/mascot
    ↓
1. Rate limit check (20 req/min users, 10 guests)
2. Validate with MascotChatSchema
3. Build context:
   a. Check SemanticCache (pgvector similarity)
      ├── hit (≥0.92): return cached → END
      └── miss: continue
   b. Fetch top-3 ConceptChunks (RAG)
   c. Load StudentInsights (100 chars max)
   d. Build minimal system prompt
4. Stream via StreamChat (provider fallback)
5. Save to SemanticCache (fire-and-forget)
6. Update StudentMastery signals
```

### Sandbox Request Flow

```
POST /api/v1/sandbox
    ↓
1. Auth required
2. Rate limit (10 req/min)
3. Check EncryptedKeys:
   ├── User has key → decrypt → use matching SDK
   │   ├── Auth fail → USER_KEY_FAILED (401)
   │   └── Success → stream
   └── No key → StreamChat (system providers)
4. Save to Conversations (messages + metadata)
5. Fire title generation (first message)
```

---

## معمارية الـ i18n

### قاعدة صارمة: نوعان من البيانات فقط

```typescript
// النوع 1: UI strings ثابتة → next-intl
const t = useTranslations('dashboard');
<h1>{t('title')}</h1>

// النوع 2: محتوى ديناميكي → DB queries
const lesson = await getLessonById(id, locale);
<h1>{lesson.title}</h1>

// ممنوع تماماً:
<h1>{locale === 'ar' ? 'عنوان' : 'Title'}</h1>
```

### RTL — الدالة لا الثنائية

```typescript
import { getDir, isRTL } from '@/lib/i18n/locale-utils';

getDir('ar')  // 'rtl'
isRTL('he')   // true — يدعم 10 لغات RTL
// ar, he, fa, ur, yi, ps, sd, ug, dv, ks
```

---

## معمارية الـ API

### Response Format موحّد

```typescript
// نجاح
{ Success: true, Data: {...}, Message?: string, Meta?: { Page, Limit, Total } }

// خطأ
{ Success: false, Error: { Code: 'LESSON_NOT_FOUND', Details?: {...} } }
```

### قواعد الـ Routes

1. **Thin wrapper** — route file يفوّض للـ Controller فوراً
2. **Zod validation** على كل route — لا استثناء
3. **Rate limiting** على كل AI endpoints
4. **Auth check** أولاً قبل أي منطق
5. **Error codes فقط** — لا رسائل داخلية للـ client (SEV-005)

---

## الأمان — Security Rules

| الرقم | القاعدة |
|-------|---------|
| SEV-001 | XP يُحسب server-side من DB فقط |
| SEV-002 | Rate limiting: 20 req/min (users) / 10 (guests) |
| SEV-003 | Zod validation على كل API route |
| SEV-004 | DB indexes على كل hot query paths |
| SEV-005 | SSE streams: error codes فقط، لا رسائل داخلية |
| SEV-006 | Email verification إلزامي |
| SEV-011 | UNIQUE(UserId, LessonId) على UserProgress |
| SEV-016 | Security headers على كل routes |

### Sandbox Security

```
مفتاح المستخدم → AES-256-GCM encrypt → DB
Client يرى فقط: sk-ant-...XXXX (آخر 4 أحرف)
Decrypt server-side فقط عند الحاجة
```

---

## قواعد الكود

### اتفاقيات التسمية

| السياق | القاعدة | مثال |
|--------|---------|------|
| كل شيء افتراضياً | PascalCase | `UserProgress`، `GetLessonById` |
| ملفات Next.js | lowercase | `page.tsx`، `layout.tsx`، `route.ts` |
| مجلد `app/` | lowercase | `app/[locale]/dashboard/` |
| جداول DB | PascalCase | `Lessons`، `ConceptChunks` |
| أعمدة DB | PascalCase | `Id`، `CreatedAt`، `IsDeleted` |
| API response | PascalCase | `{ Success, Data, Error }` |

### حدود الملفات

- **600 سطر** كحد أقصى لأي ملف
- Feature modules: Controller + Service + Schemas + Types منفصلة
- لا hardcoded strings — كل النصوص عبر i18n أو DB

---

## البنية التحتية

| الطبقة | التقنية | الملاحظة |
|--------|---------|---------|
| Frontend | Next.js 16 + Vercel | App Router، Server Components |
| Database | PostgreSQL + pgvector | Neon أو Supabase |
| ORM | Drizzle | Type-safe، migrations |
| Auth | better-auth | Email verification إلزامي |
| AI | Multi-provider chain | OpenRouter أولاً (مجاني) |
| Encryption | AES-256-GCM | Web Crypto API native |
| Error Tracking | Sentry | إلزامي في production |
| Real-time (Phase 3) | WebSocket (Bun) | Classrooms |
| TTS (Phase 4) | ElevenLabs / Murf | Arabic voices |
| Vector Search | pgvector | Semantic Cache + RAG |

---

> للتفاصيل الكاملة عن ALI والفلسفة: `docs/AI_VISION.md`
> لخارطة الطريق: `docs/ROADMAP.md`
