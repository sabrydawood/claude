# خطة التطوير الشاملة — منصة ذكاوي للتعليم البرمجي

> **تاريخ الخطة:** 2026-05-15
> **الهدف:** تحويل ذكاوي من منصة تعليم AI إلى منصة تعليم برمجة شاملة للأطفال
> **المرجع:** `docs/Architecture.Plan.md` + نتائج الـ audit

---

## ملخص المشاكل المكتشفة

| المشكلة | الخطورة | الموقع | الحالة |
|---------|---------|--------|--------|
| رسائل الـ Mascot hardcoded (19 زوج) | متوسط | `mascot.tsx:22-67` | يحتاج إصلاح |
| Unit labels hardcoded (دقيقة، أسئلة) | منخفض | `lesson-card.tsx:74,81` | يحتاج إصلاح |
| System prompt الـ Mascot hardcoded | متوسط | `Mascot.Service.ts` | يحتاج إصلاح |
| System prompt الـ Sandbox hardcoded | عالي | `Sandbox.Controller.ts` | يحتاج إصلاح |
| `claude-lessons.ts` static | ✅ مقبول | seed only | صح — بس مؤقت |
| DB schema بسيط جداً للمنصة الكاملة | عالي | `Schema.ts` | يحتاج توسيع |

**ملاحظة مهمة:** محتوى الدروس في `claude-lessons.ts` صح — يُستخدم seed فقط، المستخدم يجيب البيانات من DB. لكن مع توسع المنصة، لازم إدارة المحتوى تكون من admin panel مش من كود.

---

## المراحل التنفيذية

```
Phase 1 (أيام 1-3):    إصلاح i18n + رسائل الأطفال
Phase 2 (أيام 4-14):   توسيع DB Schema
Phase 3 (أيام 15-28):  Subjects + Courses Structure
Phase 4 (مستمر):        إضافة محتوى جديد
```

---

## Phase 1 — إصلاح i18n والرسائل (أيام 1-3)

### 1.1 — رسائل الـ Mascot → i18n

**المشكلة:** 19 زوج رسائل hardcoded في `mascot.tsx`
**الحل:** نقل كل الرسائل لـ `ar.json` و `en.json` تحت namespace `mascot`

```json
// ar.json — إضافة namespace mascot.patrol
{
  "mascot": {
    "patrol": {
      "login": {
        "msg1": "سجّل دخولك وكمّل مغامرتك! 🚀",
        "msg2": "هنا تكتب بياناتك 👇"
      },
      "register": {
        "msg1": "انضم مجاناً وابدأ رحلتك! ✨",
        "msg2": "امسح بياناتك هنا 📝"
      },
      "dashboard": {
        "msg1": "جاهز تكسب نقاط النهارده؟ 💪",
        "msg2": "شوف تقدمك فوق! 🌟",
        "msg3": "هتبدأ بأي درس؟ 🤔"
      },
      "lesson": {
        "msg1": "اقرأ الدرس كويس كده! 📚",
        "msg2": "جاهز للكويز؟ 🎯"
      },
      "agents": {
        "msg1": "اختار الدرس اللي يناسبك! 📖"
      },
      "leaderboard": {
        "msg1": "مين المتصدر؟ ممكن تكون أنت! 🏆",
        "msg2": "كسب نقاط أكتر وتصدر! 💡"
      },
      "sandbox": {
        "msg1": "جرّب تتكلم مع المساعد! 🤖",
        "msg2": "اكتب سؤالك وشوف الإجابة 💬"
      },
      "profile": {
        "msg1": "شوف إنجازاتك وشاركها! 🌟"
      },
      "default": {
        "msg1": "مرحباً! أنا ذكي مساعدك 🌟",
        "msg2": "اكتشف منصة ذكاوي! ✨"
      },
      "mobile": "أهلاً! اضغط عليّ 🌟"
    }
  }
}
```

**كيف `mascot.tsx` يستخدمها:**
```tsx
// mascot.tsx
const T = useTranslations('mascot.patrol');
const PATROLS = {
  login:  [{ msg: T('login.msg1') }, { msg: T('login.msg2') }],
  dashboard: [{ msg: T('dashboard.msg1') }, ...],
  // ...
};
```

### 1.2 — Unit Labels → i18n

**المشكلة:** `{locale === 'ar' ? 'دقيقة' : 'min'}` في `lesson-card.tsx`
**الحل:** إضافة namespace `units` في ملفات الترجمة

```json
// ar.json
{
  "units": {
    "minute": "دقيقة",
    "minutes": "دقائق",
    "question": "سؤال",
    "questions": "أسئلة",
    "xp": "نقطة XP",
    "lesson": "درس",
    "course": "كورس"
  }
}
```

### 1.3 — System Prompts → DB Config

**المشكلة:** System prompts hardcoded في Code
**الحل:** جدول `SystemPrompts` في DB — الـ Admin يعدّلها من panel

```
جدول SystemPrompts:
- Key: 'mascot_base' | 'sandbox_base' | 'mascot_lesson_context'
- Locale: 'ar' | 'en'
- Content: text (النص الكامل)
- LastUpdatedAt
- UpdatedBy (UserId)
```

**فايدة إضافية:** تقدر تُعدّل شخصية الـ Mascot من غير deploy جديد.

### 1.4 — رسائل child-friendly في `apiErrors`

```json
// ar.json — namespace apiErrors بلغة أطفال
{
  "apiErrors": {
    "UNAUTHORIZED": "لازم تسجّل دخولك الأول! 😊",
    "FORBIDDEN": "مش مسموح بده، اتكلم مع الـ Admin! 🙏",
    "RATE_LIMITED": "خد نفس شوية، حاول تاني بعد دقيقة! 😄",
    "VALIDATION_ERROR": "في حاجة غلط في البيانات، جرّب تاني! 🤔",
    "NOT_FOUND": "مش لاقيناش! ممكن اتشال أو الرابط غلط 😅",
    "LESSON_NOT_FOUND": "الدرس دا مش موجود! ارجع للقائمة 📚",
    "STREAM_ERROR": "في مشكلة صغيرة، جرّب تاني! 🔄",
    "AI_UNAVAILABLE": "المساعد بياخد استراحة صغيرة، ارجع بعد شوية! 😴"
  }
}
```

---

## Phase 2 — توسيع DB Schema (أيام 4-14)

### 2.1 — البنية الجديدة للمحتوى

```
Subjects (مجالات رئيسية)
  └── Courses (كورسات)
       └── Lessons (دروس — الموجودة حالياً)
            ├── QuizQuestions (موجودة)
            ├── Exercises (تمارين برمجية — جديدة)
            └── Resources (موارد — جديدة)
```

**الفرق عن الحالي:**
- `Agents` (Claude, ChatGPT) = الـ AI Tutors — بيساعدوا في أي مجال
- `Subjects` (جديدة) = المجالات التعليمية الفعلية (البرمجة، قواعد البيانات، إلخ)
- `Courses` (جديدة) = الكورسات داخل كل مجال

### 2.2 — الجداول الجديدة

```typescript
// ─── Subjects ────────────────────────────────────────────────────────────────

export const Subjects = pgTable('Subjects', {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Slug:      text('Slug').notNull().unique(),
  Emoji:     text('Emoji').notNull(),
  Color:     text('Color').notNull(),
  Order:     integer('Order').default(0).notNull(),
  IsActive:  boolean('IsActive').default(true).notNull(),
  IsDeleted: boolean('IsDeleted').default(false).notNull(),
  CreatedAt: timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const SubjectTranslations = pgTable('SubjectTranslations', {
  Id:              uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  SubjectId:       uuid('SubjectId').notNull().references(() => Subjects.Id, { onDelete: 'cascade' }),
  Locale:          text('Locale').notNull(),
  Name:            text('Name').notNull(),
  Description:     text('Description').notNull().default(''),
  FullDescription: text('FullDescription').notNull().default(''),
}, (T) => [
  unique('Uq_SubjectTrans_SubjectLocale').on(T.SubjectId, T.Locale),
  index('Idx_SubjectTrans_SubjectId').on(T.SubjectId),
]);

// ─── Courses ──────────────────────────────────────────────────────────────────

export const Courses = pgTable('Courses', {
  Id:               uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  SubjectId:        uuid('SubjectId').notNull().references(() => Subjects.Id, { onDelete: 'cascade' }),
  Order:            integer('Order').default(0).notNull(),
  Difficulty:       integer('Difficulty').default(1).notNull(), // 1-5: 1=مبتدئ جداً, 5=متقدم
  MinAgeGroup:      text('MinAgeGroup', { enum: ['child', 'teen', 'adult'] }).default('child').notNull(),
  EstimatedHours:   integer('EstimatedHours').default(1).notNull(),
  IsActive:         boolean('IsActive').default(true).notNull(),
  IsDeleted:        boolean('IsDeleted').default(false).notNull(),
  CreatedAt:        timestamp('CreatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const CourseTranslations = pgTable('CourseTranslations', {
  Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  CourseId:    uuid('CourseId').notNull().references(() => Courses.Id, { onDelete: 'cascade' }),
  Locale:      text('Locale').notNull(),
  Name:        text('Name').notNull(),
  Description: text('Description').notNull().default(''),
  WhatYouWillLearn: text('WhatYouWillLearn').notNull().default(''),
}, (T) => [
  unique('Uq_CourseTrans_CourseLocale').on(T.CourseId, T.Locale),
  index('Idx_CourseTrans_CourseId').on(T.CourseId),
]);

// ─── ربط الدروس بالكورسات ─────────────────────────────────────────────────────

// Lessons تبقى موجودة كما هي، لكن نضيف رابط اختياري للـ Course
// نعدّل جدول Lessons يضيف عمود CourseId اختياري (nullable)
// ALTER Lessons ADD COLUMN CourseId uuid REFERENCES Courses(Id)

// ─── Exercises (تمارين برمجية) ────────────────────────────────────────────────

export const Exercises = pgTable('Exercises', {
  Id:         uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  LessonId:   uuid('LessonId').references(() => Lessons.Id, { onDelete: 'cascade' }),
  CourseId:   uuid('CourseId').references(() => Courses.Id, { onDelete: 'cascade' }),
  Type:       text('Type', { enum: ['fill_blank', 'arrange_code', 'spot_error', 'build_it'] }).notNull(),
  Difficulty: integer('Difficulty').default(1).notNull(), // 1-5
  Order:      integer('Order').default(0).notNull(),
  IsDeleted:  boolean('IsDeleted').default(false).notNull(),
});

export const ExerciseTranslations = pgTable('ExerciseTranslations', {
  Id:           uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  ExerciseId:   uuid('ExerciseId').notNull().references(() => Exercises.Id, { onDelete: 'cascade' }),
  Locale:       text('Locale').notNull(),
  Title:        text('Title').notNull(),
  Instructions: text('Instructions').notNull(),
  HintText:     text('HintText').notNull().default(''),
  StarterCode:  text('StarterCode').notNull().default(''),
  SolutionCode: text('SolutionCode').notNull().default(''),
  TestCases:    jsonb('TestCases').notNull().default([]),
}, (T) => [
  unique('Uq_ExTrans_ExLocale').on(T.ExerciseId, T.Locale),
]);

export const ExerciseSubmissions = pgTable('ExerciseSubmissions', {
  Id:          uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  UserId:      uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ExerciseId:  uuid('ExerciseId').notNull().references(() => Exercises.Id, { onDelete: 'cascade' }),
  Code:        text('Code').notNull().default(''),
  Passed:      boolean('Passed').default(false).notNull(),
  Score:       integer('Score').default(0).notNull(),
  Attempts:    integer('Attempts').default(1).notNull(),
  SubmittedAt: timestamp('SubmittedAt', { withTimezone: true }).defaultNow().notNull(),
}, (T) => [
  index('Idx_ExSub_UserId').on(T.UserId),
  index('Idx_ExSub_ExerciseId').on(T.ExerciseId),
]);

// ─── System Prompts (إدارة من Admin) ─────────────────────────────────────────

export const SystemPrompts = pgTable('SystemPrompts', {
  Id:        uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  Key:       text('Key').notNull().unique(), // 'mascot_base', 'sandbox_base', etc.
  Content:   text('Content').notNull(),
  Locale:    text('Locale').notNull().default('ar'),
  IsActive:  boolean('IsActive').default(true).notNull(),
  UpdatedAt: timestamp('UpdatedAt', { withTimezone: true }).defaultNow().notNull(),
});

// ─── User Course Progress ──────────────────────────────────────────────────────

export const UserCourseProgress = pgTable('UserCourseProgress', {
  Id:               uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  UserId:           uuid('UserId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  CourseId:         uuid('CourseId').notNull().references(() => Courses.Id, { onDelete: 'cascade' }),
  CompletedLessons: integer('CompletedLessons').default(0).notNull(),
  TotalXp:          integer('TotalXp').default(0).notNull(),
  CompletedAt:      timestamp('CompletedAt', { withTimezone: true }),
  StartedAt:        timestamp('StartedAt', { withTimezone: true }).defaultNow().notNull(),
}, (T) => [
  index('Idx_UCProgress_UserId').on(T.UserId),
  unique('Uq_UCProgress_UserCourse').on(T.UserId, T.CourseId),
]);
```

---

## Phase 3 — محتوى المنصة الشامل (أيام 15-28)

### 3.1 — المجالات (Subjects) المخططة

```
┌─────────────────────────────────────────────────────────────────┐
│                    منصة ذكاوي للتعليم                          │
├──────────┬──────────┬──────────┬──────────┬──────────┬─────────┤
│  الذكاء  │ البرمجة  │  قواعد   │  تصميم   │  التفكير │  بناء  │
│الاصطناعي │ للأطفال  │ البيانات │  البرامج │ المنطقي  │المشاريع│
└──────────┴──────────┴──────────┴──────────┴──────────┴─────────┘
```

| الـ Subject Slug | الاسم العربي | الاسم الإنجليزي | الإيموجي |
|-----------------|-------------|----------------|---------|
| `ai` | الذكاء الاصطناعي | Artificial Intelligence | 🤖 |
| `programming` | البرمجة للأطفال | Kids Programming | 💻 |
| `databases` | قواعد البيانات | Databases | 🗄️ |
| `design-patterns` | بناء البرامج | Software Design | 🏗️ |
| `problem-solving` | التفكير المنطقي | Problem Solving | 🧩 |
| `project-building` | بناء المشاريع | Build Projects | 🚀 |
| `prompt-engineering` | Prompt Engineering | Prompt Engineering | ✨ |
| `web-design` | تصميم الويب | Web Design | 🎨 |

### 3.2 — الكورسات (Courses) الأولية لكل Subject

#### 🤖 الذكاء الاصطناعي (موجود، يُنظَّم كـ Courses)
```
Course: "تعلم Claude"      → الدروس الحالية (موجودة)
Course: "تعلم ChatGPT"    → مستقبلاً
Course: "تعلم Gemini"     → مستقبلاً
Course: "Prompt Engineering المتقدم" → مستقبلاً
```

#### 💻 البرمجة للأطفال
```
Course: "مقدمة للبرمجة" (Scratch thinking)
  ├── درس: ما هي البرمجة؟
  ├── درس: كيف يفكر الحاسوب؟
  └── درس: أول برنامج

Course: "JavaScript للأطفال"
  ├── درس: المتغيرات
  ├── درس: الجمل الشرطية
  ├── درس: الحلقات
  └── درس: الدوال

Course: "Python للأطفال"
  ├── درس: مقدمة لـ Python
  ├── درس: القوائم (Lists)
  └── درس: القواميس (Dictionaries)
```

#### 🗄️ قواعد البيانات
```
Course: "مقدمة لقواعد البيانات"
  ├── درس: ما هي قاعدة البيانات؟
  ├── درس: الجداول والأعمدة
  └── درس: كيف يبحث الحاسوب؟

Course: "SQL للأطفال"
  ├── درس: أول استعلام SELECT
  ├── درس: تصفية البيانات WHERE
  └── درس: ترتيب النتائج ORDER BY
```

#### 🧩 التفكير المنطقي
```
Course: "كيف تحل المشاكل؟"
  ├── درس: فهم المشكلة أولاً
  ├── درس: تقسيم المشكلة
  └── درس: الأنماط المتكررة

Course: "خوارزميات للأطفال"
  ├── درس: ما هي الخوارزمية؟
  ├── درس: البحث البسيط
  └── درس: الترتيب الأساسي
```

#### 🚀 بناء المشاريع
```
Course: "أول موقع ويب"
  ├── درس: ما هو HTML؟
  ├── درس: تنسيق الصفحة CSS
  └── المشروع: صفحتي الشخصية

Course: "تطبيق بسيط"
  ├── درس: التخطيط للمشروع
  ├── درس: الكود + التصميم
  └── المشروع: آلة حاسبة
```

#### 🏗️ بناء البرامج (Design Patterns)
```
Course: "أساسيات تصميم الكود"
  ├── درس: الكود النظيف
  ├── درس: لا تكرر نفسك (DRY)
  └── درس: الوحدات والأجزاء

Course: "أنماط التصميم للأطفال"
  ├── درس: ما هو الـ Pattern؟
  ├── درس: الـ Singleton (شيء واحد)
  └── درس: الـ Observer (المراقب)
```

#### ✨ Prompt Engineering
```
Course: "أساسيات الـ Prompts"
  ├── درس: ما هو الـ Prompt؟
  ├── درس: كيف تطلب بشكل صح؟
  └── درس: الـ Context المهم

Course: "Prompts المتقدمة"
  ├── درس: Few-shot Learning
  ├── درس: Chain of Thought
  └── درس: Prompt للكود
```

### 3.3 — هيكل الـ Seed الجديد

```typescript
// src/Lib/Db/Seed.ts — الترتيب:

1. SystemPrompts (mascot + sandbox prompts)
2. Subjects (8 مجالات)
3. SubjectTranslations (ar + en لكل مجال)
4. Courses (لكل Subject)
5. CourseTranslations (ar + en)
6. Achievements (موجودة)
7. Tracks (موجودة)
8. Agents (موجودة — Claude, ChatGPT, Gemini)
9. AgentTranslations (موجودة)
10. Lessons (مع CourseId)
11. LessonTranslations (موجودة)
12. QuizQuestions + QuizOptions (موجودة)
```

---

## Phase 4 — تفاصيل التنفيذ

### 4.1 — تعديل `Lessons` Schema

```typescript
// إضافة حقول جديدة لجدول Lessons:

export const Lessons = pgTable('Lessons', {
  Id:               uuid('Id').primaryKey().$defaultFn(() => uuidv7()),
  AgentId:          uuid('AgentId').references(() => Agents.Id),       // اختياري الآن
  CourseId:         uuid('CourseId').references(() => Courses.Id),      // جديد — يحدد الكورس
  Order:            integer('Order').default(0).notNull(),
  Difficulty:       integer('Difficulty').default(1).notNull(),         // جديد: 1-5
  XpReward:         integer('XpReward').default(50).notNull(),
  EstimatedMinutes: integer('EstimatedMinutes').default(5).notNull(),
  IsActive:         boolean('IsActive').default(true).notNull(),
  IsDeleted:        boolean('IsDeleted').default(false).notNull(),
}, (T) => [
  index('Idx_Lessons_CourseId').on(T.CourseId),
  index('Idx_Lessons_AgentId').on(T.AgentId),
]);
```

### 4.2 — DB Queries الجديدة

```
lib/db/queries/
├── content.ts          ← موجود (agents, lessons)
├── subjects.ts         ← جديد (getSubjects, getCoursesBySubject)
├── courses.ts          ← جديد (getCourseById, getLessonsByCourse)
├── exercises.ts        ← جديد (getExercisesByLesson)
└── system-prompts.ts   ← جديد (getSystemPrompt by key)
```

### 4.3 — API Routes الجديدة

```
/api/v1/subjects/           GET  — كل المجالات
/api/v1/subjects/[slug]     GET  — مجال واحد مع كورساته
/api/v1/courses/[id]        GET  — كورس واحد مع دروسه
/api/v1/courses/[id]/progress GET — تقدم المستخدم في كورس
/api/v1/exercises/[id]      GET  — تمرين واحد
/api/v1/exercises/[id]/submit PUT — تقديم إجابة
/api/v1/system-prompts/[key] GET  — system prompt by key (admin only for write)
```

### 4.4 — Pages الجديدة

```
app/[locale]/(main)/
├── subjects/               ← قائمة كل المجالات
├── subjects/[subjectSlug]/ ← المجال مع كورساته
├── courses/[courseId]/     ← الكورس مع دروسه
└── (main)/admin/
    ├── subjects/           ← إدارة المجالات
    ├── courses/            ← إدارة الكورسات
    └── system-prompts/     ← إدارة الـ Prompts
```

---

## معايير الرسائل child-friendly

### القواعد الذهبية للرسائل:

```
1. استخدم ضمير المخاطب "أنت" — ابتعد عن "المستخدم"
2. اللغة = عربي مصري مبسط + إيموجي طبيعي
3. الخطأ = فرصة مش فشل — "جرّب تاني" مش "خطأ"
4. الإنجاز = احتفال كبير — مش مجرد "تم"
5. التشجيع قبل الشرح دايماً
6. الجمل قصيرة — مش أكتر من 10 كلمات
7. ممنوع المصطلحات التقنية الصعبة في رسائل الأطفال
```

### أمثلة:

| الرسالة التقنية | الرسالة المناسبة للأطفال |
|----------------|--------------------------|
| "Authentication failed" | "الباسوورد مش صح، جرّب تاني! 🔑" |
| "Session expired" | "الجلسة انتهت، ادخل تاني من فضلك 😊" |
| "Rate limit exceeded" | "خد نفس شوية! حاول بعد دقيقة 😄" |
| "Validation error" | "في حاجة غلط، جرّبها تاني! 🤔" |
| "Lesson completed" | "عمل رائع! كملت الدرس 🎉 +50 XP" |
| "Streak updated" | "3 أيام متتالية! أنت بطل! 🔥" |
| "Achievement unlocked" | "تهانينا! فتحت إنجاز جديد! 🏆✨" |

---

## الجدول الزمني التفصيلي

### الأسبوع الأول (أيام 1-7)
```
يوم 1-2: Phase 1 — i18n fixes (mascot messages + unit labels)
يوم 3:   Phase 1 — System prompts → DB table
يوم 4-5: Phase 1 — Child-friendly apiErrors messages  
يوم 6-7: Phase 2 — إضافة Subjects + SubjectTranslations tables
```

### الأسبوع الثاني (أيام 8-14)
```
يوم 8-9:   Phase 2 — إضافة Courses + CourseTranslations tables
يوم 10:    Phase 2 — تعديل Lessons (إضافة CourseId + Difficulty)
يوم 11-12: Phase 2 — إضافة Exercises + ExerciseSubmissions tables
يوم 13-14: Phase 2 — UserCourseProgress table + DB migration
```

### الأسبوع الثالث (أيام 15-21)
```
يوم 15-16: Phase 3 — DB Queries للـ Subjects + Courses
يوم 17-18: Phase 3 — API Routes الجديدة
يوم 19-21: Phase 3 — Seed data للـ 8 Subjects + كورساتهم
```

### الأسبوع الرابع (أيام 22-28)
```
يوم 22-24: Phase 3 — صفحات Subjects + Courses
يوم 25-26: Phase 3 — Admin pages للـ Subjects + Courses
يوم 27-28: Phase 3 — اختبار + تحقق من typecheck
```

---

## قائمة التحقق لكل Task

```
[ ] كل نص ظاهر = i18n key (مفيش hardcoded text)
[ ] كل بيانات = من DB (مفيش static arrays في الكود)
[ ] كل رسالة = بلغة أطفال (تشجيع، بسيطة، إيموجي)
[ ] كل table جديدة = PascalCase + uuidv7 + IsDeleted + translations
[ ] كل API route = /api/v1/ + Zod validation + i18n errors
[ ] كل migration = بعد db:clear تمر بدون أخطاء
[ ] bun run typecheck = 0 errors
```

---

## ملاحظات مهمة

### ما يُحتفظ به كما هو:
- `claude-lessons.ts` = seed data only ✅ (صح)
- Per-entity translation tables ✅ (صح)
- `Agents` table ✅ (AI tutors — تبقى للـ sandbox وكمرشدين)
- `Tracks` table ✅ (learning personas — تبقى للـ onboarding)

### ما يتغير:
- `Lessons.AgentId` = nullable (درس ممكن يكون بدون agent)
- `Lessons.CourseId` = إضافة (ربط بالكورس)
- `LearningPaths.LessonOrder` = ممكن تحتوي على courses مش دروس فردية

### التوسع المستقبلي (خارج النطاق الحالي):
- نظام تقديم الكود (Code Playground)
- تعليقات ومناقشات بين الطلاب
- مشاريع جماعية
- شهادات إتمام
- تكامل مع GitHub للمشاريع
