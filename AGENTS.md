# Agent Instructions

## Project

Next.js 16.2.9 App Router + React 19 + TypeScript + Tailwind CSS 4 + Firebase auth.

## Commands

```bash
npm run dev          # Dev server on port 3020, bound to 0.0.0.0 (network accessible)
npm run build        # Production build (uses webpack, not Turbopack)
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check)
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
