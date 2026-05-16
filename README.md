# ذكاوي — منصة تعليمية ذكية للأطفال العرب

> **Zkawi** — Adaptive Learning Platform for Arabic-speaking Children (Ages 4–16)

منصة تعليمية شاملة تعتمد على **ALI (Adaptive Learning Intelligence)** — نظام يتعلم من كل طفل ويتكيف معه، ويصبح أذكى وأرخص مع الوقت.

---

## لماذا ذكاوي؟

| المشكلة | ذكاوي |
|---------|-------|
| منصات عالمية (Khan، Duolingo) — محتوى إنجليزي بالأساس | محتوى عربي أصيل من اليوم الأول |
| منصات تكيفية — مجال واحد فقط (Prodigy: رياضيات) | برمجة + رياضيات + عربية + ذكاء اصطناعي + أكثر |
| المحتوى ثابت، الطالب يتكيف | **الطالب ثابت، المحتوى يتكيف** |
| التكلفة تزيد خطياً مع المستخدمين | **يصبح أرخص كلما زاد الاستخدام** |

---

## المجالات التعليمية

**النواة الأولى:**

- البرمجة وعلوم الحاسوب (Scratch-like → Python → AI)
- الرياضيات (التفكير المنطقي → جبر → إحصاء)
- اللغة العربية (قراءة → كتابة → تعبير)

**المستقبل:** الذكاء الاصطناعي · العلوم · الإنجليزية · المهارات المالية · ريادة الأعمال

---

## المميزات الرئيسية

### ALI — الذكاء التكيفي

```
Knowledge Graph  →  Student Mastery  →  Semantic Cache
      ↓                   ↓                   ↓
  مفاهيم مترابطة   مستوى إتقان حقيقي   كل سؤال يُجاب مرة واحدة
```

- **Multi-Signal Mastery:** quiz (20%) + Socratic (35%) + practical (30%) + peer teaching (15%)
- **Data Flywheel:** كل تفاعل يُحسّن النظام لجميع الأطفال
- **Semantic Cache:** يُخفّض تكلفة AI مع كل استخدام

### التنقل حسب العمر

| المرحلة | العمر | النمط |
|---------|-------|-------|
| Spark | 6–9 | Xbot يقود خطوة بخطوة |
| Explorer | 9–12 | Knowledge Islands |
| Builder | 12–16 | Skill Map كامل |

### Parent Portal

ملخص يومي + أسبوعي + شهري + لوحة بيانات كاملة — COPPA 2025 compliant.

### نظام XP + Credits

- **XP:** سمعة علنية، تُكسب بالإتقان، لا تُشترى
- **Credits:** تُكسب بالتعلم + تُشترى إضافية — تُنفق على شروح مخصصة وتحديات

---

## Tech Stack

```
Frontend    Next.js 16 · TypeScript · Tailwind v4 · Framer Motion · Three.js/R3F
Backend     Bun · Next.js API Routes
Database    PostgreSQL + pgvector · Drizzle ORM
AI          OpenAI · Semantic Cache · Knowledge Graph
Auth        better-auth
i18n        next-intl (AR + EN, RTL-first)
Monitoring  Sentry
```

---

## هيكل المشروع

```
src/
├── app/                    # Next.js pages + API routes
├── Features/               # Feature modules (Mascot, Mastery, Cache…)
├── Lib/
│   ├── Db/                 # Schema + Seed
│   ├── Graph/              # Knowledge Graph Service
│   └── Ai/                 # Cache Service
├── components/             # Shared UI components
├── Messages/               # AR.json + EN.json (i18n)
└── Shared/Types/           # Shared TypeScript types

docs/
├── DECISIONS.md            # كل القرارات المتفق عليها (D-001 → D-024)
├── AI_VISION.md            # فلسفة ALI الكاملة
├── ARCHITECTURE.md         # المعمارية التقنية
├── ROADMAP.md              # خارطة الطريق
├── PROGRESS.md             # تتبع Phase 1
└── RESEARCH/               # أبحاث أكاديمية وتنافسية
    ├── 1.md                # المجالات، الموهبة، Parent Portal، Onboarding
    ├── 2.md                # التسعير، Block editor، Portfolio، Offline، Voice
    └── 3.md                # التمارين التفاعلية، Prompt Gallery
```

---

## البدء السريع

```bash
# تثبيت الاعتماديات
bun install

# إعداد قاعدة البيانات
bun run db:all

# تشغيل المشروع
bun run dev

# فحص الأنواع
bun run typecheck
```

**المتطلبات:** Bun · PostgreSQL · `.env` بالمتغيرات المطلوبة

---

## الوضع الحالي

```
Phase 1 (ALI Foundation):  ██████████  100% ✅
  ✅ DB Schema (7 جداول جديدة)
  ✅ Knowledge Graph Service
  ✅ Semantic Cache Service
  ✅ Student Mastery API
  ✅ Typecheck 0 errors

Phase 2 (UI + Features):   ░░░░░░░░░░   0%  🔜
  🔜 Block-based Programming Editor
  🔜 Interactive Activities (Match + Fill + Fix)
  🔜 Age-Adaptive Navigation
  🔜 Parent Portal
  🔜 Offline / PWA
```

---

## الوثائق

| الملف | المحتوى |
|-------|---------|
| [CLAUDE.md](CLAUDE.md) | قواعد الكود والـ conventions — للمطورين والـ AI agents |
| [docs/DECISIONS.md](docs/DECISIONS.md) | كل القرارات المتفق عليها — المرجع الأول |
| [docs/AI_VISION.md](docs/AI_VISION.md) | فلسفة ALI والرؤية الكاملة |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | المعمارية التقنية |
| [docs/ROADMAP.md](docs/ROADMAP.md) | خارطة الطريق بالمراحل |

---

## الالتزامات

- **COPPA 2025** — حماية بيانات الأطفال كاملة من اليوم الأول
- **RTL-First** — العربية ليست ترجمة، هي اللغة الأساسية
- **Mobile-First** — 90%+ من أطفال MENA على الموبايل
- **Offline-Ready** — PWA + pre-generated content للمناطق ضعيفة الإنترنت

---

> **ذكاوي ليس منصة كورسات — هو نظام يتعلم من كل طفل، يُعلّم بأسلوبه، ويصبح أذكى يومياً.**
