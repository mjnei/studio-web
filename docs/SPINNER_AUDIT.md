# Spinner & Loading State Audit

Audit date: August 2026  
Scope: `studio-web_0xMichaelRan` after Priority 2 (shared `Spinner` / `LoadingSpinner` primitives) and follow-up migration of inline `Loader` / `Loader2` usages.

---

## Shared primitives

| Component | Path | Purpose |
|-----------|------|---------|
| `Spinner` | `src/components/ui/spinner.tsx` | Inline loading indicator (`Loader2` + `animate-spin`). Sizes: `sm` (h-4), `md` (h-8), `lg` (h-12), or custom via `className`. Default `aria-hidden={true}`. |
| `LoadingSpinner` | `src/components/ui/LoadingSpinner.tsx` | Centered block with optional `message`, `description`, `fullHeight`. Wraps `Spinner` internally. |
| `Icon` | `src/components/ui/icon.tsx` | Lucide wrapper with size tokens (`xs`–`xl`). Not yet adopted broadly. |
| `PageLoadingSkeleton` | `src/components/ui/loading-skeleton.tsx` | Full-page project loading (spinner + message). Used by project workflow pages. |
| `InlineLoadingSkeleton` | `src/components/ui/loading-skeleton.tsx` | Dashed-border inline loading (spinner + message). |

**Canonical spinner:** `Loader2` from Lucide, accessed only through `Spinner` (except `ProjectStatsCard`, which uses `Loader2` as a static stat icon — not a spinner).

Both `Spinner` and `LoadingSpinner` are exported from `src/components/ui/index.ts`.

---

## Loading pattern guide

Choose the primitive by context:

| Scenario | Use |
|----------|-----|
| Button / icon slot / badge / row inline | `<Spinner size="sm" />` or `className="h-N w-N …"` |
| Card overlay, modal, status row | `<Spinner size="md" />` or custom `className` |
| Large hero / player placeholder | `<Spinner size="lg" className="…" />` |
| Section or page initial fetch (with copy) | `<LoadingSpinner size="lg" message="…" fullHeight />` |
| Project workflow boot (`useProjectState`) | `<PageLoadingSkeleton message={…} />` |
| List / grid placeholder | Pulse skeleton or `LoadingSkeleton` variants (not `Spinner`) |
| Refresh button in-flight | `RefreshCw` + conditional `animate-spin` (not `Spinner`) |

Prefer `className="h-4 w-4"` over `w-4 h-4` for new code.

---

## Migration status (Priority 2)

### Completed

- All inline `Loader` and `Loader2` **spinner** usages migrated to `Spinner` or `LoadingSpinner`.
- `button.tsx`, `LoadingSpinner.tsx`, `ProjectCard.tsx`, and follow-up files (export, compose, details, admin TMDB, referral, etc.).
- `PageLoadingSkeleton` and `InlineLoadingSkeleton` now use `Spinner` internally.

### Remaining non-`Spinner` loading UI (intentional or deferred)

| Pattern | Examples | Notes |
|---------|----------|-------|
| CSS border `animate-spin` divs | `login/page.tsx`, `signup/page.tsx`, `notifications/page.tsx`, `audit-logs/AuditLogsTable.tsx`, voice cards | Functional; not yet unified to `Spinner` |
| `RefreshCw` + `animate-spin` | `jobs/page.tsx`, admin queues, playground TTS jobs | Refresh action feedback — correct semantics |
| Pulse / `Skeleton` | `VoiceSelectionPanel`, `admin/queues/*` | Appropriate for list/grid loading |
| Static `Loader2` icon | `ProjectStatsCard` (“In Progress” stat) | Not a spinner — do not migrate |

### Possible dead code

- `src/components/project/video-generation.tsx` — contains `Spinner` but has **no importers** in the repo. Export flow lives in `export/page.tsx`.

---

## Usage review by area

### Shared UI — OK

| Location | Usage | Verdict |
|----------|-------|---------|
| `button.tsx` | `Spinner size="sm"` when `loading` / `isLoading` | Correct |
| `LoadingSpinner.tsx` | Delegates to `Spinner` with legacy size classes (sm h-5, md h-8, lg h-10) | Correct; preserves visual parity |
| `loading-skeleton.tsx` | `PageLoadingSkeleton`, `InlineLoadingSkeleton` | Correct |

### Project workflow — OK

| Location | Usage | Verdict |
|----------|-------|---------|
| All `[projectId]/*` pages | `PageLoadingSkeleton` on `useProjectState` load | Consistent |
| `ProjectCard` | Overlay when thumbnail `generating` | Correct |
| `compose`, `details` | Thumbnail / AI suggestion inline spinners | Correct |
| `export` | Generate button, player placeholder, processing list, version badges | Correct; see caveat below |
| `preview` | TTS processing hero icon | Correct |
| `ThumbnailEditorModal` | Regenerate / generate overlays | Correct |

**Caveat — `export/page.tsx` player:** A large `Spinner` shows when no video URL is available. This may conflate “still loading” with “no stream yet”. Consider splitting empty vs loading states if users report a stuck spinner.

### Shell & admin — mostly OK

| Location | Usage | Verdict |
|----------|-------|---------|
| `projects`, `movies`, `voices` | `LoadingSpinner` on list fetch | Correct |
| `referral`, `leaderboard` | `Spinner` on initial load | Correct |
| `jobs`, `billing` | `PageLoadingSkeleton` | Correct |
| `movies/[id]`, `admin/movies/[id]` | Page + action button spinners | Correct |
| `admin/voices`, `studio-tts-jobs`, `playground-tts-jobs` | `LoadingSpinner` | Correct |
| `admin/playground` | `LoadingSpinner` for job + history | Correct |
| `admin/projects` | `LoadingSpinner` only while **stats** load; table uses refresh icon spin | Partial — acceptable but asymmetric |
| `admin/tmdb` | Decorative spinner on redirect page | Correct for redirect UX |
| `TmdbMovieCard` | Import button spinner | Correct |
| `TmdbImportView` | Button spinner **and** full-page `LoadingSpinner` when searching | **Redundant** — pick one |
| `ActiveJobCard` | Permanent overlay on thumbnail | Correct for active-job cards |
| `PlaygroundForm`, `VoiceBulkImportModal` | Submit / search spinners | Correct |

### Auth — partial unification

| Location | Usage | Verdict |
|----------|-------|---------|
| `invite/page.tsx` | `Spinner` for auth + validation | Correct |
| `login/page.tsx` | CSS border spinner for auth redirect; `Button loading` uses `Spinner` for form submit | Works; border spinner could be unified |
| `signup/page.tsx` | CSS border spinners | Same as login |

---

## Pages without `Spinner` / `LoadingSpinner`

These are not necessarily bugs — they use other patterns or minimal feedback.

| Page | Loading behavior | Gap severity |
|------|------------------|--------------|
| `dashboard` | Stats show `"..."`; sections hidden until data arrives | Low–medium — brief empty layout possible |
| `admin/` hub | Stats show `"-"` until fetch completes | Low |
| `admin/queues/*` | `Skeleton` components | None — appropriate |
| `settings/notifications` | `preferencesLoading` disables Save only; no visible first-load indicator | **Medium** — form may flash before prefs load |
| `profile` | `return null` when `!user` | Low — relies on auth shell |
| `help`, `pricing` | Static content | None |
| `voice` page (voice list) | Pulse skeletons in `VoiceSelectionPanel` | None — appropriate |

---

## Known issues & recommendations

### 1. Redundant spinners — `TmdbImportView`

When `isSearching` is true, both apply:

- `<Spinner size="sm" />` in the search button
- `<LoadingSpinner size="lg" fullHeight message="Searching TMDB…" />`

**Recommendation:** Keep the full-page `LoadingSpinner` OR the button spinner, not both.

### 2. Inconsistent spinner visuals — CSS border divs

~15 files still use hand-rolled border spinners (auth, notifications, audit logs, voice preview, onboarding). They work but look different from `Loader2`-based `Spinner`.

**Recommendation:** Migrate in a small follow-up PR for visual consistency (not required for correctness).

### 3. Missing first-load UI — notification settings

`settings/notifications/page.tsx` reads `preferencesLoading` from context but does not render a loading state.

**Recommendation:** Add `LoadingSpinner` or skeleton while `preferencesLoading === true`.

### 4. Dashboard progressive loading

Projects and popular movies sections simply do not render while loading (stats show `"..."`).

**Recommendation:** Optional section-level skeletons or a single centered spinner if empty-state flash is noticeable.

### 5. Dead code — `video-generation.tsx`

Unused component with spinner usage. Safe to delete or wire up if still planned.

---

## What not to migrate

| Case | Reason |
|------|--------|
| `RefreshCw` + `animate-spin` on refresh buttons | Indicates refresh action, not page loading |
| `ProjectStatsCard` `Loader2` icon | Static “In Progress” metric icon |
| `Loader2` inside `spinner.tsx` | Canonical implementation |
| Brand / chart inline SVGs | Covered by Priority 3+ icon audit |

---

## Verification commands

```bash
# Find remaining direct Loader/Loader2 (should only be spinner.tsx + ProjectStatsCard)
rg 'Loader2|Loader[^a-zA-Z]' src --glob '*.{tsx,ts}'

# Find non-unified CSS border spinners
rg 'animate-spin' src --glob '*.{tsx,ts}'

# Lint changed UI files
pnpm eslint src/components/ui/spinner.tsx src/components/ui/LoadingSpinner.tsx
```

---

## Related work (icon audit roadmap)

| Priority | Task | Status |
|----------|------|--------|
| 1 | Remove dead code; Lucide for duplicate inline SVGs | Done |
| 2 | `Icon` + `Spinner` primitives; migrate spinners | Done |
| 3 | Brand icons (`GoogleIcon`, `XIcon`, `WeChatIcon`) | Pending |
| 4 | Icon conventions in `AGENTS.md` or `docs/ICONS.md` | Pending |
| 5 | Accessibility pass on icon-only buttons | Pending |

This document covers Priority 2 spinner scope only. Icon wrapper adoption (`Icon` component) is deferred to a later pass.
