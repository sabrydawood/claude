# AGENT_PROGRESS — ذكاوي (Zkawi)
> **للـ AI Agent القادم:** هذا الملف يُحدَّث تلقائياً أثناء التطوير.  
> ابدأ من هنا لتعرف بالضبط أين وقف العمل وما الخطوة التالية.

---

## آخر تحديث: 2026-05-15 — الجلسة السادسة (مكتملة ✅)

---

## البيئة والأدوات

| الأداة | التفاصيل |
|--------|----------|
| **Branch** | `claude/multilingual-portfolio-arabic-y4s8P` |
| **Runtime** | Bun (ليس npm/yarn) — `bun run dev`, `bun run build`, `bun run db:all` |
| **DB** | PostgreSQL + Drizzle ORM — `src/lib/db/schema.ts` |
| **Auth** | better-auth — `src/lib/auth.ts` — `auth.api.getSession({ headers: req.headers })` |
| **i18n** | next-intl — locales: `ar`, `en` — messages في `src/messages/` |
| **Build check** | `bun run build` يجب أن ينجح قبل كل commit |
| **Anthropic SDK** | `@anthropic-ai/sdk@0.96.0` (مضاف في الجلسة 5) |

---

## ما تم بناؤه (الجلسات 1-6) — **كل شيء مكتمل ✅**

### ✅ البنية الأساسية (جلسة 1)
- Next.js 16 App Router + Bun + Tailwind v4 + better-auth + next-intl

### ✅ المحتوى والـ DB (جلسة 2)
- Schema كامل (18 جدول)، Seed data، 5 دروس Claude + Quiz + XP

### ✅ Dark Mode + Onboarding (جلسة 3)
- CSS custom properties كـ semantic tokens (--bg, --surface, --text, --zkawi-purple, إلخ)
- Onboarding Wizard 5 خطوات + Learning Tracks

### ✅ ربط التقدم بـ DB (جلسة 4)
- `GET /api/progress` — جلب progress كامل
- `PUT /api/progress/lesson/[id]` — تسجيل إكمال + Streak logic
- `GET /api/user/learning-path` — الدروس بالترتيب المخصص
- lesson page + dashboard page يستخدمان DB بدلاً من localStorage

### ✅ Sandbox (جلسة 5)
- `src/lib/encryption.ts` — AES-256-GCM عبر Web Crypto API
- `POST /api/keys` — تشفير + حفظ في `encrypted_keys`
- `DELETE /api/keys` — حذف المفتاح
- `GET /api/keys/hint` — hint بدون الـ key الحقيقي
- `POST /api/sandbox/chat` — streaming Claude API مع Prompt Caching
- `src/app/[locale]/(main)/sandbox/page.tsx` — Chat UI كامل

### ✅ Admin Panel (جلسة 5)
- `src/lib/admin.ts` — `isAdminEmail()` helper يستخدم `ADMIN_EMAILS` env var
- `GET /api/admin/lessons` — قائمة الدروس مع translations
- `POST /api/admin/lessons` — إنشاء درس جديد (للـ AI agents)
- `src/app/[locale]/(main)/admin/page.tsx` — واجهة ويب للمدراء

### ✅ Leaderboard + Public Profiles + PWA (الجلسة السادسة — v0.5.0)
- `GET /api/leaderboard` — top 50 by XP with medals
- `GET /api/profile/[userId]` — public stats + achievements with translations
- `/leaderboard` page — rank table with 🥇🥈🥉 medals, links to profiles
- `/profile/[userId]` page — stats cards + achievement grid + share button
- `public/sw.js` — service worker (cache-first assets, network-first HTML/API)
- `src/components/pwa-register.tsx` — registers SW on mount
- `src/components/pwa-install-banner.tsx` — beforeinstallprompt bottom sheet
- `src/app/api/og/route.tsx` — achievement OG image type added
- Header updated — Leaderboard + Sandbox nav links for logged-in users
- Achievement auto-grant in `PUT /api/progress/lesson/[id]` with `checkAndGrantAchievements()`
- **Achievement celebration toast** — spring-animated modal when new achievements earned

---

## الحالة: **v0.5.0 مكتملة بالكامل ✅**

```
✅ 1. ربط التقدم بـ DB
✅ 2. Dashboard الشخصي
✅ 3. Sandbox (Chat + API Keys)
✅ 4. Admin Panel
✅ 5. Leaderboard + Public Profiles
✅ 6. PWA (Service Worker + Install Banner)
✅ 7. Achievement OG Images
✅ 8. Achievement celebration toast
```

---

## هيكل الملفات الكامل (نهاية الجلسة 5)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                          ✅
│   │   ├── onboarding/page.tsx               ✅
│   │   ├── (auth)/login|register/page.tsx    ✅
│   │   └── (main)/
│   │       ├── dashboard/page.tsx            ✅ DB + personalized order
│   │       ├── sandbox/page.tsx              ✅ Chat UI + key management
│   │       ├── admin/page.tsx                ✅ Admin Panel
│   │       └── agents/[agentSlug]/lessons/[lessonId]/page.tsx ✅ DB progress
│   ├── api/
│   │   ├── auth/[...all]/route.ts            ✅
│   │   ├── onboarding/route.ts               ✅
│   │   ├── user/preferences/route.ts         ✅
│   │   ├── user/learning-path/route.ts       ✅
│   │   ├── progress/route.ts                 ✅ GET
│   │   ├── progress/lesson/[id]/route.ts     ✅ PUT + achievement grant
│   │   ├── keys/route.ts                     ✅ POST/DELETE
│   │   ├── keys/hint/route.ts                ✅ GET
│   │   ├── sandbox/chat/route.ts             ✅ POST streaming
│   │   ├── admin/lessons/route.ts            ✅ GET/POST
│   │   ├── og/route.tsx                      ✅ + achievement type
│   │   ├── leaderboard/route.ts              ✅ GET top 50
│   │   └── profile/[userId]/route.ts         ✅ GET public profile
│   └── (main)/
│       ├── leaderboard/page.tsx              ✅
│       └── profile/[userId]/page.tsx         ✅
├── components/
│   ├── pwa-register.tsx                      ✅
│   └── pwa-install-banner.tsx                ✅
├── lib/
│   ├── auth.ts                               ✅
│   ├── admin.ts                              ✅ isAdminEmail()
│   ├── encryption.ts                         ✅ AES-256-GCM
│   ├── db/schema.ts                          ✅ 18 جدول
│   └── content/claude-lessons.ts            ✅
```

---

## متغيرات البيئة المطلوبة

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...              # required in production
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=...                  # 64-char hex (32 bytes) — للـ Sandbox
ADMIN_EMAILS=admin@example.com,...  # comma-separated — للـ Admin Panel
```

---

## ملاحظات تقنية مهمة

### Sandbox Security
- مفتاح API **لا يغادر الـ server أبداً**
- Client يرى `hint` فقط: `sk-ant-...XXXX`
- IV عشوائي 12-byte مدمج مع الـ ciphertext: `"ivHex:ciphertextHex"`

### Admin Auth
- لا يوجد `role` column في `users` table
- الحماية عبر `ADMIN_EMAILS` env var (comma-separated list)
- الـ `isAdminEmail()` في `src/lib/admin.ts` يتحقق من الـ email

### Streaming في Sandbox
- النموذج: `claude-haiku-4-5-20251001`
- Prompt Caching على system prompt (ephemeral)
- `ReadableStream` مباشرة إلى الـ client بدون JSON wrapping
- Session record يُسجَّل بعد انتهاء الـ stream (fire-and-forget)

---

## قواعد المشروع الثابتة

1. **عامية مصرية بسيطة** — لا فصحى في الـ UI
2. **Dark mode هو الافتراضي** دائماً
3. **Translation Table pattern** — كل النصوص في `translations`
4. **CSS vars** — `--bg`, `--text`, `--zkawi-purple` إلخ
5. **بعد كل تغيير:** `bun run build` ثم commit + push
6. **Branch:** `claude/multilingual-portfolio-arabic-y4s8P` فقط

---

## أوامر مفيدة

```bash
bun run dev          # تشغيل محلي
bun run build        # التحقق من الـ build
bun run db:all       # reset + generate + migrate + seed
```
