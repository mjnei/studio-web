# Spinner & Loading State Audit

Audit date: August 23, 2026 (last verified against implementation)  
Scope: `studio-web_0xMichaelRan` — shared `Spinner` / `LoadingSpinner` primitives, skeleton variants, and remaining inline loading patterns.

---

## Shared primitives

| Component | Path | Purpose |
|-----------|------|---------|
| `Spinner` | `src/components/ui/spinner.tsx` | Inline loading indicator (`Loader2` + `animate-spin`). Sizes: `sm` (h-4), `md` (h-8), `lg` (h-12), or custom via `className` (size prop optional). Default `aria-hidden={true}`. |
| `LoadingSpinner` | `src/components/ui/LoadingSpinner.tsx` | Centered block with optional `message`, `description`, `fullHeight`. Wraps `Spinner` with legacy size classes (`sm` h-5, `md` h-8, `lg` h-10) and `text-accent-primary`. |
| `Icon` | `src/components/ui/icon.tsx` | Lucide wrapper with size tokens (`xs`–`xl`). Not a spinner — see `docs/ICONS.md`. |
| `LoadingSkeleton` | `src/components/ui/loading-skeleton.tsx` | Pulse placeholders (`card`, `text`, `grid`, `list`, `poster` variants). No spinner. |
| `PageLoadingSkeleton` | `src/components/ui/loading-skeleton.tsx` | Full-page project loading (`Spinner size="md"` + message, `text-accent-cyan`). |
| `InlineLoadingSkeleton` | `src/components/ui/loading-skeleton.tsx` | Dashed-border inline loading (`Spinner` h-5 + message, `text-accent-cyan`). |

**Canonical spinner:** `Loader2` from Lucide, accessed only through `Spinner` (except `ProjectStatsCard`, which uses `Loader2` as a static stat icon — not a spinner).

Both `Spinner` and `LoadingSpinner` are exported from `src/components/ui/index.ts`. Skeleton helpers are imported directly from `@/components/ui/loading-skeleton`.

### Implementation notes

- **`Spinner` size is optional.** When omitted, only `animate-spin` and `className` apply — common for one-off sizes like `h-3 w-3` or `h-5 w-5`.
- **`LoadingSpinner` does not pass `size` to `Spinner`.** It applies `legacySizeClasses` via `className` to preserve pre-migration visuals.
- **`Button`** (`button.tsx`) shows `<Spinner size="sm" />` when `loading` or `isLoading` is true (both props are aliases).
- **Accent color split:** `LoadingSpinner` uses `text-accent-primary`; `PageLoadingSkeleton` / `InlineLoadingSkeleton` use `text-accent-cyan`. Intentional legacy split; unify only if doing a visual pass.

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
| List / grid placeholder | Pulse skeleton (`LoadingSkeleton` variants, `VoiceSelectionPanel` inline pulse, admin queue `Skeleton`) — not `Spinner` |
| Refresh button in-flight | `RefreshCw` + conditional `animate-spin` (not `Spinner`) |

Prefer `className="h-4 w-4"` over `w-4 h-4` for new code.

---

## Migration status (Priority 2)

### Completed

- All inline `Loader` and `Loader2` **spinner** usages migrated to `Spinner` or `LoadingSpinner`.
- `button.tsx`, `LoadingSpinner.tsx`, `ProjectCard.tsx`, and follow-up files (export, compose, details, admin TMDB, referral, etc.).
- `PageLoadingSkeleton` and `InlineLoadingSkeleton` use `Spinner` internally.

**Direct `Loader2` imports (verified):** only `spinner.tsx` (implementation) and `ProjectStatsCard.tsx` (static icon).

### Remaining non-`Spinner` loading UI (intentional or deferred)

| Pattern | Files | Notes |
|---------|-------|-------|
| CSS border `animate-spin` divs | See [Border spinner inventory](#border-spinner-inventory) below | Functional; not yet unified to `Spinner` |
| `RefreshCw` + `animate-spin` | `jobs/page.tsx`, `admin/projects/page.tsx`, `admin/queues/page.tsx`, `admin/queues/[queueName]/page.tsx`, `admin/playground-tts-jobs/page.tsx`, `admin/studio-tts-jobs/page.tsx`, `QueueMessagePeeker.tsx`, `QueueStatsCard.tsx` | Refresh action feedback — correct semantics |
| Pulse / `Skeleton` | `VoiceSelectionPanel`, `LoadingSkeleton` variants, `admin/queues/*` | Appropriate for list/grid loading |
| Static `Loader2` icon | `ProjectStatsCard` (“In Progress” stat) | Not a spinner — do not migrate |

### Possible dead code

- `src/components/project/video-generation.tsx` — contains `Spinner` but has **no importers** in the repo. Export flow lives in `export/page.tsx`.

---

## Border spinner inventory

Hand-rolled border spinners (17 instances in 16 files). Candidates for a small consistency PR.

| File | Context |
|------|---------|
| `(auth)/login/page.tsx` | Auth redirect |
| `(auth)/signup/page.tsx` | Auth redirect (2 instances) |
| `(shell)/notifications/page.tsx` | Initial notifications load |
| `notifications/NotificationDropdown.tsx` | Dropdown fetch |
| `notifications/NotificationPreferencesModal.tsx` | Preferences fetch |
| `admin/audit-logs/components/AuditLogsTable.tsx` | Table loading overlay |
| `project/new/page.tsx` | Redirect to `/project/new/source` |
| `project/new/script/page.tsx` | Script step loading |
| `project/voice-selection-card.tsx` | Inline voice preview |
| `voices/VoiceCard.tsx` | Voice action in-flight |
| `voices/voice-recording-card.tsx` | Recording actions (2 instances) |
| `shared/voice-recording-modal/components/requesting-access-view.tsx` | Mic permission wait |
| `shared/voice-recording-modal/components/voice-naming-form.tsx` | Submit in-flight |
| `onboarding/PasswordStep.tsx` | Submit in-flight |
| `onboarding/CompletionStep.tsx` | Completion wait + secondary loader |

Auth and new-project redirect pages use `border-b-2` or `border-4 border-r-transparent` styles; voice/onboarding/notifications use `border-t-transparent` rings.

---

## Usage review by area

### Shared UI — OK

| Location | Usage | Verdict |
|----------|-------|---------|
| `button.tsx` | `Spinner size="sm"` when `loading` / `isLoading` | Correct |
| `LoadingSpinner.tsx` | Delegates to `Spinner` with legacy size classes | Correct; preserves visual parity |
| `loading-skeleton.tsx` | `LoadingSkeleton`, `PageLoadingSkeleton`, `InlineLoadingSkeleton` | Correct |

### Project workflow — OK

| Location | Usage | Verdict |
|----------|-------|---------|
| `[projectId]/{compose,details,export,preview,script,source,voice}/page.tsx` | `PageLoadingSkeleton` on `useProjectState` load | Consistent (7 pages) |
| `ProjectCard` | Overlay when thumbnail `generating` | Correct |
| `compose`, `details` | Thumbnail / AI suggestion inline spinners | Correct |
| `details` | `InlineLoadingSkeleton` for AI suggestions | Correct |
| `export` | Generate button, player placeholder, processing list, version badges | Correct; see caveat below |
| `preview` | TTS processing hero icon | Correct |
| `ThumbnailEditorModal` | Regenerate / generate overlays | Correct |
| `VoiceSelectionPanel` | Pulse grid when `isLoadingVoices` | Correct — skeleton, not spinner |
| `project/new/*` | CSS border spinners on redirect / script load | Works; could unify to `PageLoadingSkeleton` |

**Caveat — `export/page.tsx` player:** A large `Spinner` shows when `displayVideo.video_url` is falsy. This may conflate “still loading” with “no stream yet”. Consider splitting empty vs loading states if users report a stuck spinner.

### Shell & admin — mostly OK

| Location | Usage | Verdict |
|----------|-------|---------|
| `projects`, `movies`, `voices` (my tab) | `LoadingSpinner` on list fetch | Correct |
| `voices` (community tab) | Separate `LoadingSpinner` when `communityLoading` | Correct |
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

### Notifications — border spinners

| Location | Usage | Verdict |
|----------|-------|---------|
| `notifications/page.tsx` | CSS border spinner | Works; could unify |
| `NotificationDropdown.tsx` | CSS border spinner | Same |
| `NotificationPreferencesModal.tsx` | CSS border spinner | Same |

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
| `project/new/source` | Relies on shell; no dedicated page spinner | Low |

---

## Known issues & recommendations

### 1. Redundant spinners — `TmdbImportView`

When `isSearching` is true, both apply:

- `<Spinner size="sm" />` in the search button
- `<LoadingSpinner size="lg" fullHeight message="Searching TMDB…" />`

**Recommendation:** Keep the full-page `LoadingSpinner` OR the button spinner, not both.

### 2. Inconsistent spinner visuals — CSS border divs

16 files still use hand-rolled border spinners (auth, notifications, audit logs, voice preview, onboarding, new-project redirects). They work but look different from `Loader2`-based `Spinner`.

**Recommendation:** Migrate in a small follow-up PR for visual consistency (not required for correctness). Start with notifications cluster (page + dropdown + modal) for highest visibility.

### 3. Missing first-load UI — notification settings

`settings/notifications/page.tsx` reads `preferencesLoading` from context but does not render a loading state.

**Recommendation:** Add `LoadingSpinner` or skeleton while `preferencesLoading === true`.

### 4. Dashboard progressive loading

Projects and popular movies sections simply do not render while loading (stats show `"..."`).

**Recommendation:** Optional section-level skeletons or a single centered spinner if empty-state flash is noticeable.

### 5. Dead code — `video-generation.tsx`

Unused component with spinner usage. Safe to delete or wire up if still planned.

### 6. Accent color split (optional)

`LoadingSpinner` (`text-accent-primary`) vs project skeletons (`text-accent-cyan`) may look slightly different on the same screen. Unify only as part of a deliberate visual pass.

---

## What not to migrate

| Case | Reason |
|------|--------|
| `RefreshCw` + `animate-spin` on refresh buttons | Indicates refresh action, not page loading |
| `ProjectStatsCard` `Loader2` icon | Static “In Progress” metric icon |
| `Loader2` inside `spinner.tsx` | Canonical implementation |
| Brand / chart inline SVGs | Covered by icon audit (`docs/ICONS.md`) |
| Pulse skeletons in grids/lists | Better UX than spinners for layout placeholders |

---

## Verification commands

```bash
# Direct Loader/Loader2 (expect spinner.tsx + ProjectStatsCard only)
rg 'Loader2|Loader[^a-zA-Z]' src --glob '*.{tsx,ts}'

# All animate-spin usages (Spinner, RefreshCw, and border divs)
rg 'animate-spin' src --glob '*.{tsx,ts}'

# Spinner / LoadingSpinner import sites
rg 'from "@/components/ui/spinner"|from "@/components/ui/LoadingSpinner"' src --glob '*.{tsx,ts}'

# Lint shared UI
pnpm eslint src/components/ui/spinner.tsx src/components/ui/LoadingSpinner.tsx
```

As of last verification: **2** direct `Loader2` files, **30** files importing `Spinner`/`LoadingSpinner`, **17** border-spinner instances, **10** `RefreshCw` refresh-spin sites.

---

## Related work (icon audit roadmap)

| Priority | Task | Status |
|----------|------|--------|
| 1 | Remove dead code; Lucide for duplicate inline SVGs | Done |
| 2 | `Icon` + `Spinner` primitives; migrate spinners | Done |
| 3 | Brand icons (`GoogleIcon`, `XIcon`, `WeChatIcon`) | Done |
| 4 | Icon conventions in `AGENTS.md` / `docs/ICONS.md` | Done |
| 5 | Accessibility pass on icon-only buttons | Partial (high-traffic surfaces) |

This document covers Priority 2 spinner scope. Icon wrapper adoption (`Icon` component) is documented in `docs/ICONS.md`; spinners remain separate from icons per that guide.
