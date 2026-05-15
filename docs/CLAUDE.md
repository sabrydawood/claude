# Zkawi

> **تحذير:** عند تحديث أي قاعدة من القواعد أدناه، يجب تعديلها مباشرة في هذا الملف.
> هذا الملف هو **المرجع الوحيد** لقواعد الـ المشروع — لا يُعتمد على أي ملف آخر كمصدر حقيقة.
> أي تغيير في الـ conventions أو الـ architecture يجب أن ينعكس هنا فوراً وبشكل صريح.
---

## Overview

- **Framework:** Next.js 16 (App Router)
- **Port:** 3000
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand (Cart + Client state)
- **Language:** TypeScript (strict)
- **Fonts:** Cairo (Arabic) + Poppins (English) via `next/font`
- **RTL:** Full support via CSS logical properties

## ⛔ القواعد الذهبية — لا استثناء

1. **لا تُعدِّل Business Logic أو سلوك الواجهة أو API contract** إلا بطلب صريح.
2. **لا تُنشئ component داخل ملف آخر** — كل component له ملف مستقل داخل `components/`.
3. **لا تكدِّس `useState`** — أي حالة مترابطة أو معقدة تذهب لـ custom hook في `_hooks.ts`.
4. **لا تعرِّف types أو interfaces inline** داخل الصفحات — توضع في `_types.ts` أو `types/`.
5. **لا تترك `console.log`** أو debug code.
6. **لا تستخدم `any`** إلا بضرورة قصوى مع تبرير مكتوب في تعليق.
7. **لا تُدخِل TODO أو FIXME** أو حلول مؤقتة.
8. **لا تُعدِّل ملفات خارج نطاق المهمة** إلا إذا كان التعديل ضرورياً لإتمامها.
9. **قبل إنهاء أي مهمة يجب تشغيل `bun run verify:push`** وإصلاح أي مشكلة حتى يمر الأمر بالكامل بدون أخطاء.
10. **Optimistic UI إلزامي** — كل mutation (create, update, delete, reorder, move) يجب أن تُحدِّث الـ UI فوراً قبل انتظار response السرفر. عند الفشل: rollback للحالة السابقة + عرض رسالة خطأ. لا يجوز إظهار loading state يمنع المستخدم من التفاعل أثناء انتظار الـ API.

---
---

## Dependencies (Latest Versions Only)

| Package | Purpose | Note |
|---------|---------|------|
| `next` | Framework | v16+ App Router |
| `react` + `react-dom` | UI Library | v19+ |
| `tailwindcss` | Styling | **v4** — CSS-first config |
| `@tailwindcss/postcss` | PostCSS plugin | Required for Tailwind v4 |
| `zustand` | State management | + persist middleware |
| `zod` | Client-side validation | |
| `@radix-ui/react-*` | Primitives (via shadcn/ui) | |

**ممنوع استخدام:**

- Tailwind v3 syntax (`tailwind.config.ts`, `@tailwind` directives) → استخدم Tailwind v4 CSS-first
- `axios` → استخدم native `fetch` via `Api.Client.ts`
- CSS Modules → استخدم Tailwind utility classes
- `styled-components` / `emotion` → استخدم Tailwind

---

## البنية القياسية للصفحات

كل صفحة جديدة أو معاد هيكلتها **يجب** أن تتبع هذا الشكل:

```tree
page-name/
├── page.tsx              ← Server Component فقط (metadata + routing)
├── PageContent.tsx       ← Client Component — orchestration فقط
├── _types.ts             ← الأنواع الخاصة بالصفحة
├── _constants.ts         ← الثوابت الخاصة بالصفحة
├── _hooks.ts             ← كل الحالة والمنطق
├── _utils.ts             ← دوال مساعدة خاصة
└── components/
    ├── SomeDialog.tsx    ← كل Dialog في ملف مستقل
    ├── SomeTable.tsx
    └── SomeCard.tsx
```

---

## مسؤوليات `PageContent.tsx`

**مسموح فقط:**

- استدعاء hooks
- تمرير props للـ components
- تنسيق بنية الصفحة العامة
- ربط الأحداث العالية المستوى

**ممنوع داخل PageContent:**

- تعريف components (حتى components صغيرة مساعدة)
- تعريف types أو interfaces
- تعريف helper functions كبيرة
- وضع business rules معقدة
- تكديس `useState` (أكثر من 3 states مترابطة → hook)

**الحد المستهدف:** `<= 300` سطر. إذا تجاوزت — افصل.

---

## إدارة الحالة

```
useState واحد أو اثنان → مقبول في PageContent
3 أو أكثر مترابطة    → custom hook في _hooks.ts
حالة معقدة أو مشتركة  → useReducer أو Zustand store
```

**الـ hooks العامة المتاحة:**

- `hooks/useRefreshableData.ts`
- `hooks/useDialogState.ts`
- `hooks/useListFilters.ts`

---

## Components

- **كل component له ملف مستقل** داخل `components/` في نفس مجلد الصفحة.
- **كل Dialog في ملف مستقل** — لا dialogs inline داخل PageContent.
- المكونات المشتركة بين صفحات → `components/shared/`.
- لا تخلط جداول + dialogs + forms في ملف واحد.

---

## الأنواع Types

```
أنواع خاصة بالصفحة   → _types.ts
أنواع مشتركة          → types/<domain>.ts
استيراد موحد          → @/types عبر barrel exports
```

---

## الـ Services

- مقسمة حسب الـ domain داخل `lib/services/`.
- لا تضخيم ملف service ليحتوي domains متعددة.
- الاستيراد دائماً عبر `@/lib/services/ServiceName.Service`.

---

## الترجمة i18n

- الترجمات مقسمة حسب الصفحة داخل `i18n/messages/<locale>/`.
- أي key جديد يُضاف **في كل اللغات الأربع:** `ar`, `en`.
- لا تكسر `useTranslations("SectionName")` الحالي.

---

## الاستيراد والتسمية

- `@/` هو النمط الأساسي — لا relative imports طويلة.
- الملفات الداخلية تستخدم `_prefix` (مثال: `_hooks.ts`, `_types.ts`).
- لا naming عشوائي — اتبع نمط المشروع الحالي.

---

## قائمة التحقق قبل إنهاء أي تعديل

```
[ ] لا component مُعرَّف داخل PageContent أو ملف آخر
[ ] لا تكديس useState — الحالة المعقدة في hook
[ ] لا types inline داخل الصفحات
[ ] لا console.log أو debug code
[ ] الترجمات مضافة في الـ 4 لغات
[ ] الملفات الجديدة في المكان الصحيح حسب البنية القياسية
[ ] لا imports غير مستخدمة
[ ] PageContent <= 300 سطر
[ ] تشغيل `bun run verify:push` وإصلاح أي أخطاء حتى ينجح بالكامل
```

---

## قاعدة القرار النهائي

| عند التعارض               | الأولوية               |
| ------------------------- | ---------------------- |
| السرعة vs سلامة البنية    | **سلامة البنية**       |
| تحسين تقني vs ثبات السلوك | **ثبات السلوك**        |
| عند الشك                  | **المسار الأقل خطراً** |

---

## Naming Conventions — MANDATORY

| What | Convention | Example |
|------|-----------|---------|
| Variables | PascalCase | `const UserData = ...` |
| Functions | PascalCase | `function GetUserById() {}` |
| Files | PascalCase | `TreeView.tsx`, `Cart.Store.ts` |
| Folders | PascalCase | `Components/Packs/`, `Stores/` |
| Interfaces | I + PascalCase | `interface IPackNode` |
| Types | T + PascalCase | `type TCartItem` |
| Enums | E + PascalCase | `enum ETheme` |
| Constants | UPPER_SNAKE_CASE | `const MAX_CART_ITEMS = 50` |
| Components | PascalCase | `<PackCard />`, `<TreeView />` |
| Hooks | Use + PascalCase | `UseCart`, `UseAuth` |
| CSS Classes | Tailwind v4 utility-first | `className="flex items-center..."` |

PascalCase is the default for all project-owned identifiers. Framework-mandated names are the exception and must stay exactly as required by the framework, runtime, browser, or external contract. Examples: React/JSX and DOM names such as `children`, `className`, `htmlFor`, `onClick`, `dangerouslySetInnerHTML`, Next.js file names such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts`, plus any contract-bound JSON or header names. Never force PascalCase when doing so would break framework behavior or a published contract.

---

## File Rules — MANDATORY

### Max 600 Lines Per File

- إذا تجاوز component أو ملف 600 سطر → **قسّم حسب المسؤولية**
- مثال: `TreeView.tsx` → `TreeView.tsx` (orchestration) + `TreeNode.tsx` + `TreeControls.tsx`
- **مستثنى:** Config files, Type definition files

### Comments — MANDATORY

```typescript
// كل ملف يبدأ بـ header comment
/**
 * TreeView.tsx
 * Displays the Pack's file/folder tree in a File Manager style.
 * Supports unlimited depth with recursive rendering.
 */

// كل component/function يحتاج JSDoc
/**
 * Renders a single node in the pack tree.
 * @param Node - The PackNode data
 * @param Depth - Current nesting level (for indentation)
 * @param OnSelect - Callback when node is clicked
 */
const TreeNode = ({ Node, Depth, OnSelect }: ITreeNodeProps) => { ... }

// Complex logic يحتاج inline comments
const CheckUpsell = (CartItems: TCartItem[]) => {
  // Calculate total of children from same parent
  const ChildrenTotal = CartItems.reduce(...);
  // Trigger upsell if children sum >= 80% of parent price
  if (ChildrenTotal >= ParentPrice * 0.8) { ... }
};
```

### No `any` Type — EVER

- **ممنوع** استخدام `any` مطلقاً
- استخدم `unknown` + type narrowing إذا النوع غير واضح
- كل API response يجب أن يكون typed بشكل صريح

---

## Theme System

### 3 Themes

| Theme | Description |
|-------|------------|
| **Dark Navy** | Default — dark background, navy tones |
| **Light** | Light background, professional |
| **Navy Branded** | Deep navy with gold accents |

### Color Tokens (Dark Navy — Default)

```css
/* Styles/Themes/DarkNavy.css */
[data-theme="dark-navy"] {
  --color-bg-primary: #08111F;
  --color-bg-secondary: #0D1B2E;
  --color-bg-tertiary: #132238;
  --color-bg-card: #0F1D30;
  --color-bg-hover: #1A2D45;
  --color-bg-input: #0D1B2E;

  --color-text-primary: #FFFFFF;
  --color-text-secondary: #8899AA;
  --color-text-muted: #5A6B7D;
  --color-text-inverse: #08111F;

  --color-accent-sky: #2176AE;
  --color-accent-sky-hover: #1A5F8E;
  --color-accent-gold: #F39C12;
  --color-accent-gold-hover: #D4860F;
  --color-accent-green: #27AE60;
  --color-accent-red: #E74C3C;

  --color-border-default: #1E3048;
  --color-border-focus: #2176AE;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
}
```

### Implementation

- CSS custom properties per theme file (DarkNavy.css, Light.css, NavyBranded.css)
- Theme via `data-theme` attribute on `<html>`: `dark-navy` | `light` | `navy-branded`
- Persisted in **localStorage** — key: `Theme`
- No flash on load: inline script in `<head>` reads localStorage before render
- shadcn/ui components consume CSS variables — no hardcoded colors
- Tailwind v4 `@theme {}` maps to CSS variables

---

## RTL Support — MANDATORY

- **CSS Logical Properties** فقط — لا `margin-left` أو `padding-right`
  - `margin-inline-start` بدل `margin-left`
  - `padding-inline-end` بدل `padding-right`
  - `inset-inline-start` بدل `left`
- Direction set on `<html dir="rtl|ltr">` based on language
- Tailwind RTL: use `rtl:` و `ltr:` variants when logical properties aren't enough
- كل component يجب اختباره RTL و LTR

---

## I18n (Multi-Language)

- **Default:** English (en)
- **Supported:** Arabic (ar)
- Route prefix: `/en/...` و `/ar/...`
- JSON translation files: `I18n/Locales/En.json`, `Ar.json`
- كل text ظاهر = i18n key — لا hardcoded strings
- Direction switches automatically with language

---

## SEO — MANDATORY for Public Pages

- **Meta tags:** title, description, keywords (Arabic + English)
- **Open Graph:** og:title, og:description, og:image
- **Schema.org:** Product, BreadcrumbList, Organization, FAQPage
- **Sitemap:** `App/sitemap.ts` — dynamic, auto-generated
- **Robots.txt:** `App/robots.ts` — disallow /admin/ and /api/
- **hreflang:** ar ↔ en alternates
- **Next.js Metadata API** for all pages

---

## Performance Rules

- **Images:** Next.js `<Image>` component — lazy load, WebP, srcSet
- **Fonts:** `next/font` — Cairo + Poppins — preloaded, self-hosted
- **Bundle:** dynamic imports for heavy components (TreeBuilder, Admin charts)
- **Target:** PageSpeed Mobile ≥ 85
- **Core Web Vitals:** LCP < 2.5s, CLS < 0.1, INP < 200ms

---

## Component Guidelines

- **Functional components** فقط — لا class components
- **Server Components** by default — `"use client"` فقط عند الحاجة
- كل component يتعامل مع 3 states: **Loading**, **Error**, **Empty**
- Accessibility: **WCAG AA** minimum
  - كل interactive element يحتاج `aria-label` أو visible label
  - Keyboard navigation يعمل
  - Color contrast ratio ≥ 4.5:1

---

## Code Quality Checklist

```
[ ] PascalCase naming for ALL identifiers
[ ] File header comment explaining purpose
[ ] Component/Function JSDoc comments
[ ] Inline comments for complex logic
[ ] No `any` types — EVER
[ ] Max 600 lines per file
[ ] All text via i18n keys (no hardcoded strings)
[ ] RTL tested with CSS logical properties
[ ] 3 states handled: Loading, Error, Empty
[ ] GraphQL: use ApolloCSRClient.query/mutate OR useLazyQuery/useMutation hooks
[ ] GraphQL: codegen types from Generated.ts — no manual type definitions for GQL responses
[ ] Theme tokens used (no hardcoded colors)
[ ] Responsive: Mobile First → Desktop
[ ] Accessible: WCAG AA
[ ] Server Component by default, "use client" only when needed
[ ] Images via Next.js <Image>
[ ] Fonts via next/font
[ ] Tailwind v4 syntax (@import "tailwindcss", @theme {})
[ ] No tailwind.config.ts (v4 CSS-first)
[ ] Optimistic UI for ALL mutations — immediate UI update, rollback on failure
```

---

## Agent Instructions

عند العمل على أي مهمة في الـ Client:

1. **اقرأ هذا الملف أولاً** — هذا هو المرجع الوحيد
2. اتبع **هيكل المجلدات** بالضبط كما هو معرّف أعلاه
3. **PascalCase** في كل شيء — variables, functions, files, folders, components
4. **لا تتجاوز 600 سطر** لأي ملف — قسّم حسب المسؤولية
5. اكتب **comments** على كل ملف وكل component/function
6. **Server Components** by default — `"use client"` فقط عند الحاجة الفعلية
7. **CSS Logical Properties** للـ RTL — لا `left`/`right`
8. **Theme tokens** (CSS variables) — لا ألوان hardcoded
9. كل component يتعامل مع **Loading + Error + Empty** states
10. **لا `any` types** — استخدم `unknown` + narrowing
11. **i18n keys** لكل نص — لا strings مباشرة
12. **Tailwind v4** — `@import "tailwindcss"` + `@theme {}` — لا `tailwind.config.ts`

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes â€” gives risk-scored analysis |
| `get_review_context` | Need source snippets for review â€” token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

## Stream D Client Conventions

- Cart drawer and checkout flow components live under `src/Components/Commerce/`: `CartDrawer.tsx`, `CheckoutWizard.tsx`, `CheckoutStep1Review.tsx`, `CheckoutStep2Payment.tsx`, and `CheckoutStep3Execute.tsx`.
- Admin CMS pages live under `src/Components/Admin/Pages/`: `AdminPagesContent.tsx` for the list and `components/PageEditorDialog.tsx` for create/edit.
- Use `src/Components/Common/VirtualizedTable.tsx` for large admin tables instead of repeating native table markup.
- Keep the table wrapper responsible for loading, error, and empty states; pass row/header renderers from the page component.
- The cart must sync on login through the client store/service flow so authenticated users do not depend on stale local-only cart state.
- The Tree Builder reorder flow stays optimistic: update the tree locally first, then reconcile with the server result and rollback on failure.
- Admin error boundaries should stay client-side, derive locale from the route, and use `localizedPath()` for recovery links.

---

## قواعد ال Backend 

## Naming & Coding Conventions

### CRITICAL RULES — Must Follow Everywhere

| Rule | Convention | Example |
|------|-----------|---------|
| **Variables** | PascalCase | `const UserData = ...` |
| **Functions** | PascalCase | `function GetUserById() {}` |
| **Files** | PascalCase with dots | `Auth.Controller.ts` |
| **Folders** | PascalCase | `Modules/Auth/Models/` |
| **Interfaces** | I + PascalCase | `interface IPropertyProvider` |
| **Types** | T + PascalCase | `type TApiResponse` |
| **Enums** | E + PascalCase | `enum EUserRole` |
| **Constants** | UPPER_SNAKE_CASE | `const MAX_RETRIES = 3` |
| **DB Tables** | PascalCase plural | `Users`, `ApiKeys` |
| **DB Columns** | PascalCase | `CreatedAt`, `UserId` |
| **API Routes** | kebab-case | `/api/v1/auth/sign-in` |
| **Env Variables** | UPPER_SNAKE_CASE | `DATABASE_URL` |
| **DB Identifiers** | PostgreSQL `63` char limit | FKs, unique constraints, indexes | 

### Response Format — Standardized

```typescript
// Success Response
{
  Success: true,
  Data: { ... },
  Message: "Operation completed successfully", // i18n key
  Meta: { Page: 1, Limit: 20, Total: 100 }     // pagination (if applicable)
}

// Error Response
{
  Success: false,
  Error: {
    Code: "AUTH_INVALID_CREDENTIALS",
    Message: "Invalid email or password",       // i18n translated
    Details: []                                  // validation errors (if any)
  }
}

// Streaming Response
// Uses SSE (Server-Sent Events) with chunked transfer
// Content-Type: text/event-stream
```

---

## Database Conventions

### Drizzle ORM Rules

```typescript
// Every table must have these base columns:
// IMPORTANT: Use uuidv7 for ALL primary keys (time-sortable, better index performance)
const BaseColumns = {
  Id: uuid("Id").primaryKey().$defaultFn(() => uuidv7()),  // uuidv7 — NOT random UUID
  CreatedAt: timestamp("CreatedAt", { withTimezone: true }).defaultNow(),  // UTC
  UpdatedAt: timestamp("UpdatedAt", { withTimezone: true }).defaultNow(),  // UTC
  IsDeleted: boolean("IsDeleted").default(false),  // Soft delete
};
```
