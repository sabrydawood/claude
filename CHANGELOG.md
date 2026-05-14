# Changelog — ذكاوي (Zkawi)

All notable changes to this project are documented here.  
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] — 2026-05-14

### Added
- **Prompt Engineering Track** — 8 lessons (ids 6-13)
  - What is a Prompt?, Zero-shot, Few-shot, Chain of Thought
  - Role Prompting, Output Formatting, System Prompt, Combining Techniques
- **Claude API Track** — 6 lessons (ids 14-19)
  - API Introduction, Messages API, Streaming, Tool Use, Prompt Caching, Best Practices
- **Developer Track** — 5 lessons (ids 20-24)
  - Build a Chatbot, Document Q&A, Content Moderation, Structured Data Extraction, AI Agent
- Total lessons: **24** (was 5)

---

## [0.3.0] — 2026-05-14

### Added
- **DB Progress Tracking** — replaced localStorage with real DB-backed progress
  - `GET /api/progress` — fetch full user progress (completed lessons, scores, XP, streak)
  - `PUT /api/progress/lesson/:id` — record lesson completion with streak calculation
  - Streak logic: same day = no change, yesterday = +1, older = reset to 1
  - Optimistic UI updates in lesson page before DB call completes
- **Personalized Dashboard** — lesson order from `learning_paths` table
  - `GET /api/user/learning-path` — returns custom lesson order per user
  - Dashboard fetches preferences + progress + learning-path in parallel
- **Sandbox** — in-platform Claude chat using the user's own API key
  - `src/lib/encryption.ts` — AES-256-GCM encryption via Web Crypto API
  - `POST /api/keys` — encrypt and store key in `encrypted_keys` table
  - `DELETE /api/keys` — remove stored key
  - `GET /api/keys/hint` — return hint (sk-ant-...XXXX) without the real key
  - `POST /api/sandbox/chat` — server-side decrypt + Claude streaming with prompt caching
  - Sandbox page with chat UI, key management, and streaming text display
- **Admin Panel** — content management for humans and AI agents
  - `src/lib/admin.ts` — `isAdminEmail()` guard using `ADMIN_EMAILS` env var
  - `GET /api/admin/lessons` — list all lessons with AR/EN translations
  - `POST /api/admin/lessons` — create lesson with translations (Content API)
  - `/admin` page with lessons table and create form
- `docs/AGENT_PROGRESS.md` — AI agent handoff file for session continuity
- `@anthropic-ai/sdk@0.96.0` dependency

### Changed
- Lesson page: removed `getStoredProgress()` / `saveProgress()` localStorage functions
- Dashboard page: removed localStorage, added `lessonOrder` state from DB

### Security
- API keys never leave the server — client only sees the hint
- Encryption IV is random 12-byte, stored as `ivHex:ciphertextHex`

---

## [0.2.0] — 2026-05-14

### Added
- **Onboarding Wizard** — 5-step animated flow at `/onboarding`
  - Steps: age group → goal → experience level → learning style → daily time
  - Generates a personalized learning path on completion
  - Dashboard auto-redirects if onboarding not completed
- **Learning Tracks** — 5 personas with custom lesson ordering
  - `explorer` 🚀, `creator` 🎨, `engineer` ⚙️, `developer` 💻, `educator` 📚
- `POST /api/onboarding` — save preferences + generate learning path
- `GET /api/user/preferences` — read onboarding status
- `src/lib/learning-path.ts` — path generator (sorts lessons by user profile)
- 5 new DB tables: `tracks`, `user_preferences`, `learning_paths`, `encrypted_keys`, `sandbox_sessions`

### Changed
- **Full dark/light mode** via CSS custom properties
  - Tokens: `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--zkawi-purple`, etc.
  - All components and pages updated to use CSS vars instead of hardcoded colors
  - Wave SVG in Hero adapts to theme
- `.lesson-content` CSS class added for Markdown-rendered lesson content
- Quiz: fixed `onComplete` firing immediately — results screen now shows before completion
- Quiz: `quizKey` remount pattern for correct retry behavior

---

## [0.1.0] — 2026-05-14

### Added
- **Platform foundation**
  - Next.js 16 App Router + Bun + TypeScript + Tailwind CSS v4
  - PostgreSQL + Drizzle ORM with Translation Table pattern (i18n without schema changes)
  - better-auth (email/password authentication)
  - next-intl — Arabic (`ar`) and English (`en`) with RTL/LTR auto-detection
  - Framer Motion animations
- **Content**
  - Agent: Claude — 5 interactive lessons with multiple-choice quiz and XP rewards
  - Topics: What is Claude, Prompt Engineering basics, Use Cases, Advanced Features, API intro
- **UI/UX**
  - Arabic-first, dark mode default
  - Header with ThemeToggle, Language Switcher, User menu
  - Footer, Robot mascot logo (SVG), brand color tokens
  - Lesson page with content + quiz + completion screen
  - Dashboard: XP bar, streak counter, achievements, lessons list
- **Authentication**
  - Sign up / Login pages
  - Session-aware header and protected routes
- **SEO & Branding**
  - Dynamic `generateMetadata` per route
  - OG images via Edge Runtime PNG (`/api/og`)
  - JSON-LD Structured Data (WebSite, Organization, Course, LearningResource, Breadcrumb)
  - `robots.txt`, `sitemap.xml`, hreflang tags, PWA manifest
- **Database**
  - Full schema: `users`, `sessions`, `accounts`, `agents`, `lessons`, `quiz_questions`, `quiz_options`, `achievements`, `translations`, `user_progress`, `user_stats`, `user_achievements`
  - `bun run db:all` — reset → generate → migrate → seed in one command
