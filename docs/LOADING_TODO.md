# Loading state — critical TODOs

Last updated: August 24, 2026  
Scope: user-facing loading gaps that remain after the spinner migration (Phases 1–4).

Shared primitives are implemented and in use: `Spinner`, `LoadingSpinner`, `LoadingSkeleton`, `PageLoadingSkeleton`, and `InlineLoadingSkeleton` under `src/components/ui/`. FOLS delay hook: `src/lib/hooks/use-delayed-loading.ts`.

---

## SPIN-204 — Timeout + retry on stuck async flows

**Priority:** P0 — fix first  
**Effort:** L (half day+)  
**Status:** Open

### Problem

Network failures, SSE disconnects, or backend hangs can leave spinners running indefinitely with no error state and no recovery action.

### What to do

Pick one critical flow as a pilot (recommended: export generation in `src/app/project/[projectId]/export/page.tsx`, or TTS in `preview/page.tsx`).

After 15–30 seconds without resolution:

1. Replace the spinner with explicit error copy.
2. Show a retry action (`RotateCcw` button or equivalent).
3. Announce the failure for screen readers (`role="alert"` or live region).

### Acceptance criteria

- Happy path unchanged.
- Stuck async state surfaces error + retry.
- Retry re-enters the same flow without a full page reload (where possible).

### Impact if not fixed

| Area | Impact |
|------|--------|
| User recovery | Users can get **indefinitely stuck** with no way forward except refresh or leaving the page. |
| Perceived reliability | App feels broken on slow or unstable networks. |
| Accessibility | No status change announced after failure; screen reader users may wait on a silent spinner forever. |

---

## SPIN-301 — Dashboard section skeletons

**Priority:** P2 — visible UX gap, not a blocker  
**Effort:** M (1–3 h)  
**Status:** Open

### Problem

`src/app/(shell)/dashboard/page.tsx` hides Recent Projects and Popular Movies while fetching (`!loadingProjects && …`, `!loadingMovies && …`). Stats show `"..."` but the sections below are **completely absent**, which reads as an empty dashboard until data arrives.

### What to do

While `loadingProjects` / `loadingMovies`:

- Render section card shells with placeholders instead of hiding sections.
- Recent Projects: `LoadingSkeleton variant="grid" count={3}` inside the section card layout.
- Popular Movies: `LoadingSkeleton variant="poster" count={6}` (match the 6-column grid).
- Keep stats as `"..."` during load (unchanged).

### Acceptance criteria

- No empty gap under the stats grid during fetch.
- Sections do not pop in from nothing when data arrives.
- Empty state still shows only when both loads complete and both lists are empty.

### Impact if not fixed

| Area | Impact |
|------|--------|
| First impression | Brief blank area under stats; dashboard can look empty or broken on slow connections. |
| Layout stability | Sections appear suddenly when data loads (layout jump). |
| Functionality | **No functional bug** — data still loads correctly; empty state logic still works. |

---

## Out of scope (documented, not critical)

These were tracked in the former spinner audit but do not need urgent work:

| Item | Notes |
|------|-------|
| SPIN-304 admin projects table | Plain `"Loading projects…"` text is acceptable; skeleton rows are optional polish. |
| Button loading a11y | Add `aria-busy` / `aria-disabled` on `button.tsx` when showing spinner — incremental a11y. |
| Profile / `project/new/source` loaders | Low severity; auth shell covers most cases. |

---

## Suggested order

1. **SPIN-204** — one pilot flow (export or preview TTS).
2. **SPIN-301** — dashboard skeletons when dashboard load UX is a priority.
