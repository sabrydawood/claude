# ذكاوي — Zkawi

> **طفرة نوعية في المفهوم التعليمي** — منصة تعلّم تتكيف مع كل طفل، لا العكس

---

## الرؤية

المنصات التعليمية التقليدية — حتى تلك التي تستخدم الذكاء الاصطناعي — تفكر بنفس الطريقة:

> "كيف نعلّم الطالب؟"

**ذكاوي تفكر بطريقة مختلفة جذرياً:**

> "كيف يتعلم هذا الطفل بالذات، وكيف نصمّم التجربة له تحديداً؟"

ذكاوي ليست منصة كورسات بها دردشة ذكاء اصطناعي. هي **نظام تعليمي ذكي ذاتي التطور** — يتذكر، يتكيف، يُدرس، يقيس الفهم الحقيقي، ويصبح أرخص وأذكى مع كل استخدام.

---

## ماذا يعني هذا عملياً؟

### المعلم الذكي (AI Teacher)
الذكاء الاصطناعي ليس مساعداً — هو المعلم الأساسي. يشرح بأسلوب الطفل، ولهجته، ومستواه. يعرف متى يتوقف، ومتى يُعيد الشرح بطريقة مختلفة.

### قياس الفهم الحقيقي (Multi-Signal Mastery)
لا يكفي أن يجيب الطفل على سؤال اختياري. الفهم الحقيقي يُقاس بأربعة مستويات:
1. **كويز موقوت** — اختبار المعرفة السريعة
2. **Socratic Dialogue** — AI يسأله بأسلوبه ويحكم على عمق الفهم
3. **التطبيق العملي** — بناء حاجة حقيقية (كود، مشروع)
4. **تعليم الزميل** — الطفل الذي يشرح لغيره يفهم أعمق

### فصول ذكية (AI Classrooms)
أطفال متعددون، في نفس الوقت، مع معلم ذكاء اصطناعي يدير الفصل بالكامل — يطرح أسئلة جماعية، يُدير النقاش، يكتشف من يحتاج مساعدة فردية، يُشجع الأقوى على مساعدة الأضعف.

### الشرح المرئي الحي (Living Explanation)
لا فيديو مسجل ثابت. بدلاً منه:
- صوت AI يشرح بلغة الطفل ومستواه
- رسوم متحركة تُنشأ في الوقت الفعلي
- كود يُنفَّذ live خطوة بخطوة
- Mascot (ذكي) يعلّق ويشجع

### اقتصاد المعرفة (Credits + XP)
نظام مزدوج يجعل التعلم تحدياً حقيقياً:
- **XP** — سمعة علنية، تتراكم مع الإتقان
- **Credits** — عملة داخلية، تُكسب بالإجابات الصحيحة وتُنفق على الخدمات المتقدمة
- أسئلة موقوتة، إجابة واحدة لكل سؤال، لا تكرار للكريديت

---

## مبدأ "يصبح أرخص مع الاستخدام"

هذا ما يميّز النظام جذرياً:

```
المنصات التقليدية:    تكلفة AI = عدد المستخدمين × سعر الطلب
                      1000 مستخدم = $200/يوم, 10,000 = $2000/يوم ← تكلفة خطية

ذكاوي (ALI):          أول من يسأل عن مفهوم يدفع التكلفة
                      كل من بعده يحصل على الإجابة من الذاكرة
                      1000 مستخدم ≈ $15/يوم, 10,000 ≈ $20/يوم ← تكلفة شبه ثابتة
```

المنظومة: **Adaptive Learning Intelligence (ALI)** — معمارية ذكية تجمع بين الـ Knowledge Graph والـ RAG والـ Semantic Cache لتحقيق هذا.

---

## المحتوى (8 مسارات تعليمية)

| # | المسار | الوصف |
|---|--------|-------|
| 1 | الذكاء الاصطناعي | كيف يعمل، كيف تستخدمه، كيف تبنيه |
| 2 | البرمجة | JavaScript، Python — بأسلوب لعبة تفاعلية |
| 3 | قواعد البيانات | SQL وNoSQL — كيف تُخزّن وتسترجع المعرفة |
| 4 | التفكير الخوارزمي | حل المشكلات، المنطق، الخوارزميات |
| 5 | بناء المشاريع | من الفكرة للمنتج — رحلة كاملة |
| 6 | هندسة الـ Prompts | التواصل الفعّال مع الذكاء الاصطناعي |
| 7 | تصميم الويب | HTML، CSS، واجهات المستخدم |
| 8 | ريادة الأعمال التقنية | كيف تبني منتجاً رقمياً من الصفر |

---

## التقنيات

| الطبقة | التقنية |
|--------|---------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Runtime | Bun |
| Styling | Tailwind CSS v4 + CSS Variables |
| Animations | Framer Motion |
| 3D Mascot | React Three Fiber + Three.js (Xbot/Mixamo) |
| Auth | better-auth v1.6.11 |
| Database | PostgreSQL + Drizzle ORM + pgvector (قريباً) |
| i18n | next-intl v4 (ar default + en) |
| AI — Mascot | Multi-provider: OpenRouter → Gemini → OpenAI → Anthropic |
| AI — Sandbox | Multi-provider + User's own key (AES-256-GCM encrypted) |
| Real-time | WebSocket (Classroom — قريباً) |
| TTS | ElevenLabs / Murf Arabic (قريباً) |
| Error Tracking | Sentry |
| PWA | Service Worker + Install Banner |
| Deployment | Vercel + Neon/Supabase |

---

## البدء السريع

### المتطلبات
- **Bun** >= 1.0 — [تثبيت Bun](https://bun.sh)
- **PostgreSQL** >= 14

### خطوات التشغيل

```bash
# 1. استنساخ المشروع
git clone https://github.com/sabrydawood/claude zkawi
cd zkawi

# 2. تثبيت المكتبات
bun install

# 3. متغيرات البيئة
cp .env.example .env.local
# عدّل .env.local

# 4. بناء قاعدة البيانات
bun run db:all

# 5. تشغيل
bun dev
# → http://localhost:3000
```

---

## متغيرات البيئة

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/zkawi
BETTER_AUTH_SECRET=                    # openssl rand -hex 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=                        # openssl rand -hex 32
ADMIN_EMAILS=admin@example.com

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=
SMTP_FROM=noreply@zkawi.com

# AI Providers — واحد على الأقل
OPENROUTER_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

---

## أوامر قاعدة البيانات

| الأمر | الوظيفة |
|-------|---------|
| `bun run db:clear` | حذف كامل للـ DB |
| `bun run db:generate` | توليد migrations من Schema.ts |
| `bun run db:migrate` | تطبيق الـ migrations |
| `bun run db:seed` | إضافة البيانات الأساسية |
| `bun run db:all` | clear → generate → migrate → seed |
| `bun run db:studio` | Drizzle Studio على :4983 |

---

## سير عمل التطوير

```bash
bun dev              # تشغيل في وضع التطوير
bun run typecheck    # التحقق من الـ types (إلزامي قبل كل commit)
bun run lint         # lint
bun run verify       # typecheck + lint
bun run db:all       # إعادة بناء DB من الصفر
```

---

## الوثائق الكاملة

| الملف | المحتوى |
|-------|---------|
| `docs/AI_VISION.md` | كيف يفكر الذكاء الاصطناعي في هذه المنصة |
| `docs/ARCHITECTURE.md` | معمارية ALI الكاملة |
| `docs/ROADMAP.md` | خارطة الطريق بالمراحل + جدول تطوير Phase 0 |
| `docs/DECISIONS.md` | **سجل البحث الخارجي وكل القرارات المتفق عليها** |
| `CLAUDE.md` | قواعد الكود + وضع التفكير للـ AI |

---

> **هذه المنصة تُبنى من المستقبل للحاضر — لا العكس.**
