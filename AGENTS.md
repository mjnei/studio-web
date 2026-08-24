# Agent Instructions

## Project

Next.js 16.2.9 App Router + React 19 + TypeScript + Tailwind CSS 4 + Firebase auth + i18n (next-intl).

## Commands

```bash
pnpm dev          # Dev server on port 3020, bound to 0.0.0.0 (network accessible)
pnpm build        # Production build (uses webpack, not Turbopack)
pnpm lint         # ESLint
pnpm format       # Prettier (write)
pnpm format:check # Prettier (check)
```

## Architecture

**Route groups**: `(shell)`, `(auth)`, `project`

**Path alias**: `@/*` → `./src/*`

**Layout hierarchy**:

- `/app/project/layout.tsx` provides `SidebarProvider` context
- `/app/project/[projectId]/layout.tsx` wraps `ProjectShell`
- `/app/project/new/layout.tsx` wraps `NewProjectShell`
- All project pages must use `useSidebar()` hook and calculate sidebar offset for floating navigation

**Auth**: Client-side only via `AuthProvider`. Middleware does NOT check auth tokens (refresh token is scoped to backend `/api/v1`).

## Environment

Copy `.env.example` to `.env.local`. Requires:

- `NEXT_PUBLIC_API_URL` (backend API)
- Firebase config (6 variables)

All `.env*` files are gitignored.

## Code Style

Prettier: semi: true, singleQuote: false, tabWidth: 2, trailingComma: es5, printWidth: 100

## Gotchas

- Dev server port is 3020 (not 3000)
- Build explicitly uses webpack (`--webpack` flag)
- Next.js config sets COOP header `same-origin-allow-popups` for popup support
- `public/*.mp3` files are gitignored
- `allowScripts` field in package.json controls allowed postinstall scripts

## Typography

Role-based type scale (not bare `h1`–`h4` CSS). See `docs/TYPOGRAPHY.md`. Prefer `PageHeader` / `Heading` / `CardTitle`; change sizes in shared tokens, not per page.

## Server-Sent Events (SSE)

Do not document SSE behavior in this repo. Canonical status for notifications SSE, playground stream, and job polling: **`../studio-backend/docs/SSE (Server-Sent Events).md`**.

## Internationalization (i18n)

**Supported languages**: English (en), Simplified Chinese (chs)

**Implementation**: Custom i18n provider using client-side context and translation files in `public/locales/`

**Translation principles** (for translators and new locales): **`docs/TRANSLATION_GUIDE.md`** — product UI phrasing over literal translation; locked glossary (onboarding, voices, credits, etc.).

**Usage**:

```tsx
import { useI18n } from "@/i18n";

function Component() {
  const { t, locale, setLocale } = useI18n();
  return <button>{t("common.save")}</button>;
}
```

**Translation files**: Organized by namespace (common, auth, project, jobs, voices, shell) in each language directory

**Language switcher**: `<LanguageSwitcher />` component available in `@/components/shared/LanguageSwitcher`

**Persistence**: Selected language is stored in localStorage

## Icons

Lucide React for UI icons; brand SVGs in `@/components/icons`. Use the shared `Icon` wrapper (`@/components/ui/icon`) for nav and repeated dense-UI patterns; use `EmptyState` for page/list empty blocks (hero-tier sizing). Conventions (size tokens, semantic glossary, accessibility): **`docs/guides/DESIGN_SYSTEM.md`** § Icons. Loading primitives: `Spinner` / `LoadingSpinner` in `@/components/ui`; critical pending work: **`docs/LOADING_TODO.md`**.
