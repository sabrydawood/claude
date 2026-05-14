# ذكاوي — Zkawi

> منصة تعليمية تفاعلية للذكاء الاصطناعي، موجهة للأطفال والكبار

**ذكاوي** هي منصة تعليمية عربية-أولاً تشرح الذكاء الاصطناعي بلغة بسيطة ومرحة. تبدأ بـ Claude وتتوسع لتشمل أدوات AI مختلفة مستقبلاً.

---

## الميزات الرئيسية

| الميزة | التفاصيل |
|---|---|
| 🌍 **ثنائي اللغة** | عربية (افتراضي، لهجة مصرية بسيطة) + إنجليزية، قابل للتوسع |
| 👧 **مناسب للأطفال** | تصميم ملوّن، شخصية كرتونية، نقاط XP، إنجازات |
| 📚 **محتوى تعليمي** | 5 دروس عن Claude مع شرح مبسط وأمثلة عملية |
| 🎮 **تفاعلي** | كويز بعد كل درس، confetti عند النجاح، شريط تقدم |
| 🔐 **حسابات المستخدمين** | تسجيل دخول، حفظ التقدم، متابعة الإنجازات |
| 🔥 **نظام Streak** | تتبع أيام المتابعة المتواصلة |

---

## التقنيات المستخدمة

```
Frontend:   Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
Animations: Framer Motion
Auth:       better-auth (email/password)
Database:   PostgreSQL + Drizzle ORM
i18n:       next-intl
Runtime:    Bun
```

---

## هيكل المشروع

```
src/
├── app/
│   ├── [locale]/                    # كل الصفحات تحت locale prefix
│   │   ├── page.tsx                 # الصفحة الرئيسية
│   │   ├── (auth)/login/            # تسجيل الدخول
│   │   ├── (auth)/register/         # إنشاء حساب
│   │   ├── (main)/dashboard/        # لوحة التحكم
│   │   └── (main)/agents/[agentSlug]/lessons/[lessonId]/
│   └── api/auth/[...all]/           # better-auth handler
├── components/
│   ├── ui/                          # Button, Card, Input, Badge, Progress, Avatar
│   ├── layout/                      # Header, Footer
│   ├── home/                        # Hero, Stats, HowItWorks, Agents, Features, CTA
│   ├── agents/                      # LessonCard
│   ├── dashboard/                   # XpBar
│   └── quiz/                        # QuizComponent, confetti-util
├── lib/
│   ├── db/schema.ts                 # Drizzle schema (كل الجداول)
│   ├── db/index.ts                  # اتصال PostgreSQL
│   ├── auth.ts                      # better-auth config
│   ├── auth-client.ts               # better-auth client
│   ├── utils.ts                     # cn, calculateLevel, getInitials
│   ├── content/claude-lessons.ts   # محتوى دروس Claude
│   └── i18n/                        # routing, navigation, request
└── messages/
    ├── ar.json                      # الترجمة العربية (الكاملة)
    └── en.json                      # الترجمة الإنجليزية
```

---

## إعداد المشروع

### المتطلبات
- Bun >= 1.0
- PostgreSQL >= 14
- Node.js >= 18

### خطوات التشغيل

```bash
# 1. نسخ متغيرات البيئة
cp .env.example .env.local

# 2. تعديل .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/zkawi
BETTER_AUTH_SECRET=اكتب-سر-عشوائي-طويل-هنا
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. تثبيت المكتبات
bun install

# 4. إنشاء جداول قاعدة البيانات
bun run db:push

# 5. تشغيل المشروع
bun dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

---

## أوامر قاعدة البيانات

```bash
bun run db:push      # تطبيق التغييرات على قاعدة البيانات مباشرة
bun run db:studio    # فتح Drizzle Studio (واجهة قاعدة البيانات)
bun run db:generate  # توليد migration files
```

---

## إضافة لغة جديدة

1. أضف كود اللغة في `src/lib/i18n/routing.ts`:
```ts
locales: ['ar', 'en', 'fr'],  // أضف 'fr' مثلاً
```

2. أنشئ ملف الترجمة `src/messages/fr.json` بنفس هيكل `ar.json`

3. انتهى! المشروع يتعامل مع الـ RTL/LTR تلقائياً حسب اللغة.

---

## إضافة AI Agent جديد

1. أضف السجل في جدول `agents` في قاعدة البيانات
2. أنشئ ملف محتوى `src/lib/content/[agent-name]-lessons.ts` على نمط `claude-lessons.ts`
3. أضف المعلومات للترجمة في `ar.json` و `en.json`

---

## مخطط قاعدة البيانات

```
users ──────┬── sessions
            ├── accounts (OAuth)
            ├── userStats (xp, streak, level)
            ├── userProgress (per lesson)
            └── userAchievements

agents ─────── lessons ─────┬── quizQuestions ── quizOptions
                             └── userProgress (ref)

achievements ── userAchievements (ref users)
```

---

## بيئة الإنتاج

```bash
bun run build    # بناء للإنتاج
bun run start    # تشغيل في الإنتاج
```

ينصح بالنشر على **Vercel** أو **Railway** مع **Supabase** أو **Neon** لقاعدة البيانات.

---

## هيكل المحتوى الحالي

### قسم Claude (5 دروس)
| # | العنوان | الوصف |
|---|---|---|
| 1 | مرحبا بـ Claude | مين هو Claude وليه هو مميز |
| 2 | إزاي تتكلم مع Claude؟ | طريقة التواصل الصح |
| 3 | Claude يعمل ايه؟ | قائمة كاملة بمهاراته |
| 4 | اكتب طلب صح | فن كتابة الـ prompt |
| 5 | Claude في المدرسة | كيف يساعد الطلاب |

---

## المساهمة

المشروع مفتوح للإضافات. أهم المناطق المرحب بالمساهمة فيها:
- إضافة دروس جديدة
- ترجمة لغات إضافية
- تصميم أنشطة تفاعلية جديدة (drag-and-drop، fill-in-the-blank)
- أقسام AI agents جديدة (GPT، Gemini، إلخ)
