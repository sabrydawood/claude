# Roadmap — ذكاوي (Zkawi)

> **الرؤية:** منصة عربية تعليمية تصبح المرجع الأول لتعلم الذكاء الاصطناعي للأطفال والكبار في العالم العربي.

---

## الوضع الحالي — v0.2 (جارٍ التطوير)

### ✅ مكتمل (v0.1 — MVP)

**البنية التقنية**
- Next.js 15 App Router + Bun + TypeScript + Tailwind CSS v4
- PostgreSQL + Drizzle ORM + Translation Table pattern (i18n قابل للتوسع بدون schema changes)
- better-auth (email/password)
- next-intl للـ UI translations
- Framer Motion للأنيميشن

**المحتوى**
- قسم Claude: 5 دروس تفاعلية + كويز متعدد الخيارات + نظام XP
- Prompt Engineering، Use Cases، Advanced Features

**UI/UX**
- Dark mode كـ Default + Light mode (CSS custom properties)
- Arabic-first مع دعم English + RTL/LTR تلقائي
- Header مع ThemeToggle + Language Switcher + User menu
- Footer، Logo SVG (Robot mascot)، Brand tokens

**الحسابات والتقدم**
- تسجيل دخول / إنشاء حساب
- Dashboard: XP bar، streak، إنجازات، lessons list
- حفظ التقدم (localStorage — جاهز للـ DB)

**SEO & Branding**
- Dynamic metadata (generateMetadata per route)
- OG images ديناميكية (Edge Runtime PNG) عبر `/api/og`
- JSON-LD Structured Data (WebSite, Organization, Course, LearningResource, Breadcrumb)
- robots.txt، sitemap.xml، hreflang، PWA manifest

**DB**
- Schema كامل: users, sessions, accounts, agents, lessons, quiz_questions, quiz_options, achievements, translations, user_progress, user_stats, user_achievements
- db:reset → db:generate → db:migrate → db:seed (`bun run db:all`)

---

### ✅ مكتمل (v0.2 — جديد)

**Dark/Light Mode (كامل)**
- CSS custom properties (`--bg`, `--surface`, `--text`, `--border`, `--zkawi-pink`, إلخ)
- تحديث جميع المكونات: Button، Card، Input، Badge، Progress
- تحديث جميع الصفحات: Home، Auth، Dashboard، Agent، Lesson، Quiz
- Wave SVG في Hero يتكيف مع dark/light
- `.lesson-content` CSS class للمحتوى المحوَّل من Markdown

**Onboarding Wizard**
- `/onboarding` — 5 خطوات متحركة مع AnimatePresence:
  1. العمر (child / teen / adult)
  2. الهدف (chat / work / creative / developer / educator)
  3. مستوى الخبرة (none / some / advanced)
  4. طريقة التعلم (visual / reading / practice / game)
  5. الوقت اليومي (5 / 15 / 30 / 60 دقيقة)
- بعد إتمامه: مسار تعلم مخصص يُولَّد ويُحفظ في DB
- Dashboard يتحقق تلقائياً ويُعيد التوجيه إن لم يُكتمل

**Learning Tracks (5 مسارات)**
- explorer 🚀 (المبتدئ الفضولي — default)
- creator 🎨 (المبدع والكاتب)
- engineer ⚙️ (محترف Prompt Engineering)
- developer 💻 (مطور API)
- educator 📚 (معلم/مدرب)

**Schema جديد (5 جداول)**
- `tracks` — مسارات التعلم
- `user_preferences` — إجابات Onboarding
- `learning_paths` — المسارات المخصصة (JSON lesson order)
- `encrypted_keys` — مفاتيح Anthropic API للـ Sandbox
- `sandbox_sessions` — تاريخ جلسات الـ Sandbox

**APIs**
- `POST /api/onboarding` — حفظ إجابات + توليد learning path
- `GET /api/user/preferences` — قراءة حالة onboarding
- Learning Path Generator (`src/lib/learning-path.ts`) — يُرتِّب الدروس بناءً على profile

---

## v0.3 — ربط DB والـ Sandbox (التالي)

### أولوية عالية
- [ ] **Sandbox** — محرر داخل المنصة يستخدم مفتاح Anthropic API الخاص بالمستخدم
  - واجهة chat بسيطة داخل الدرس
  - تشفير المفتاح (AES-256) قبل حفظه في `encrypted_keys`
  - استدعاء API من server-side فقط (المفتاح لا يُكشف للـ client أبداً)
- [ ] **ربط التقدم بـ DB** — استبدال localStorage بـ API calls إلى `user_progress` و`user_stats`
- [ ] **الـ Streak الحقيقي** — حساب يومي مرتبط بـ `lastActivityDate` في `user_stats`
- [ ] **Dashboard الشخصي** — عرض المسار المخصص من `learning_paths`

### أولوية متوسطة
- [ ] **Admin Panel** — `/admin` بسيط لإضافة دروس من الـ UI
- [ ] **Content API** — `POST /api/admin/lessons` لـ AI agents تُضيف محتوى برمجياً

---

## v0.4 — المحتوى المتقدم

- [ ] Prompt Engineering track: 8 دروس (Zero-shot, Few-shot, Chain of thought, etc.)
- [ ] Claude API track: 6 دروس (Auth, Messages, Streaming, Tool Use, Files, Caching)
- [ ] Developer track: 5 دروس (Build a chatbot, RAG, Agents with tools)
- [ ] أنواع أنشطة جديدة: Fill-in-the-blank, Drag-and-drop
- [ ] Kid Mode: خط أكبر، ألوان أكثر، مكافآت مبالغ فيها

---

## v0.5 — Social & Polish

- [ ] Leaderboard (top learners)
- [ ] مشاركة الإنجازات (OG card مخصص لكل إنجاز)
- [ ] ملفات شخصية عامة
- [ ] تعليقات على الدروس
- [ ] PWA كاملة (Offline mode)

---

## v1.0 — الكمال

- [ ] ChatGPT + Gemini tracks
- [ ] تعدد اللغات: فرنسي، أردي، تركي
- [ ] خطة Pro (شهادات، محتوى متقدم)
- [ ] خطة مدارس (لوحة تحكم معلمين)
- [ ] React Native app

---

## مبادئ التطوير (اتُّفق عليها)

1. **الطفل أولاً:** كل feature تُختبر على مستخدمين 8-12 سنة
2. **العربية أولاً — عامية مصرية:** لا فصحى في الـ UI أبداً
3. **اسئل دائماً قبل الكود:** لا يُكتب سطر كود قبل نقاش الخطة
4. **Translation Table:** إضافة لغة = INSERT rows فقط، لا schema changes
5. **Dark default:** الـ dark mode هو الافتراضي دائماً
6. **Privacy by design:** مفاتيح API مشفرة، بيانات الأطفال محمية
7. **المحتوى مجاني للأطفال:** دائماً وأبداً
