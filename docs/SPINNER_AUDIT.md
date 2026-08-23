# Spinner & Loading State Audit

Audit date: August 24, 2026 (Phase 2 border migration complete)  
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
- **SPIN-401:** Removed dead `src/components/project/video-generation.tsx` (no importers; export flow lives in `export/page.tsx`). Stale `docs/TYPOGRAPHY.md` reference removed.

**Direct `Loader2` imports (verified):** only `spinner.tsx` (implementation) and `ProjectStatsCard.tsx` (static icon).

### Remaining non-`Spinner` loading UI (intentional or deferred)

| Pattern | Files | Notes |
|---------|-------|-------|
| ~~CSS border `animate-spin` divs~~ | — | **Migrated (Phase 2)** — all 17 instances replaced with `Spinner` or `PageLoadingSkeleton` |
| `RefreshCw` + `animate-spin` | `jobs/page.tsx`, `admin/projects/page.tsx`, `admin/queues/page.tsx`, `admin/queues/[queueName]/page.tsx`, `admin/playground-tts-jobs/page.tsx`, `admin/studio-tts-jobs/page.tsx`, `QueueMessagePeeker.tsx`, `QueueStatsCard.tsx` (8 files, 10 sites) | Refresh action feedback — correct semantics |
| Pulse / `Skeleton` | `VoiceSelectionPanel`, `LoadingSkeleton` variants, `admin/queues/*` | Appropriate for list/grid loading |
| Static `Loader2` icon | `ProjectStatsCard` (“In Progress” stat) | Not a spinner — do not migrate |

---

## Border spinner inventory (historical — Phase 2 complete)

All 17 hand-rolled border spinners in 15 files were migrated to `Spinner` or `PageLoadingSkeleton`. Verification: `rg 'border.*animate-spin|animate-spin.*border' src` returns **0** matches.

<details>
<summary>Migrated files (SPIN-101–107)</summary>

| File | Migration |
|------|-----------|
| `(auth)/login/page.tsx`, `(auth)/signup/page.tsx` | `<Spinner size="lg" className="text-accent-primary mb-4" />` |
| `(shell)/notifications/page.tsx` | `<Spinner size="lg" … />` |
| `notifications/NotificationDropdown.tsx` | `<Spinner size="md" … />` |
| `notifications/NotificationPreferencesModal.tsx` | `<Spinner size="md" … />` |
| `admin/audit-logs/components/AuditLogsTable.tsx` | `<Spinner size="md" className="text-primary" />` |
| `project/new/page.tsx`, `project/new/script/page.tsx` | `<PageLoadingSkeleton />` |
| `project/voice-selection-card.tsx`, `voices/VoiceCard.tsx`, `voices/voice-recording-card.tsx` | Inline `<Spinner />` |
| `voice-recording-modal/…/requesting-access-view.tsx`, `voice-naming-form.tsx` | `<Spinner />` with accent/white colors |
| `onboarding/PasswordStep.tsx`, `onboarding/CompletionStep.tsx` | `<Spinner size="sm" />` / custom sizes |

</details>

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
| `project/new/*` | `PageLoadingSkeleton` on redirect / script boot | Correct — unified (SPIN-103) |

**Caveat — `export/page.tsx` player (SPIN-003) — Fixed:** Completed videos without `video_url` now show an unavailable empty state instead of a spinner. Initial page/video fetch still uses `PageLoadingSkeleton`; in-flight generation appears in the processing list.

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
| `TmdbImportView` | Full-page `LoadingSpinner` when searching | Correct |
| `ActiveJobCard` | Permanent overlay on thumbnail | Correct for active-job cards |
| `PlaygroundForm`, `VoiceBulkImportModal` | Submit / search spinners | Correct |

### Auth — OK

| Location | Usage | Verdict |
|----------|-------|---------|
| `invite/page.tsx` | `Spinner` for auth + validation | Correct |
| `login/page.tsx` | `Spinner` for auth redirect; `Button loading` for form submit | Correct |
| `signup/page.tsx` | `Spinner` for redirect + Suspense fallback | Correct |

### Notifications — OK

| Location | Usage | Verdict |
|----------|-------|---------|
| `notifications/page.tsx` | `Spinner size="lg"` on list fetch | Correct |
| `NotificationDropdown.tsx` | `Spinner size="md"` on fetch | Correct |
| `NotificationPreferencesModal.tsx` | `Spinner size="md"` while prefs load | Correct |

---

## Pages without `Spinner` / `LoadingSpinner`

These are not necessarily bugs — they use other patterns or minimal feedback.

| Page | Loading behavior | Gap severity |
|------|------------------|--------------|
| `dashboard` | Stats show `"..."`; sections hidden until data arrives | Low–medium — brief empty layout possible |
| `admin/` hub | Stats show `"-"` until fetch completes | Low |
| `admin/queues/*` | `Skeleton` components | None — appropriate |
| `settings/notifications` | `LoadingSpinner` while `preferencesLoading` | None — fixed (SPIN-001) |
| `profile` | `return null` when `!user` | Low — relies on auth shell |
| `help`, `pricing` | Static content | None |
| `project/new/source` | Relies on shell; no dedicated page spinner | Low |

---

## User Experience (UX) & Accessibility (a11y) Gaps

> **Task IDs:** SPIN-201 (live regions), SPIN-202 (reduced motion), SPIN-203 (FOLS delay), SPIN-204 (timeout/retry).

### 1. Screen Reader & Accessibility Gaps (WCAG 2.2 / 4.1.3 Status Messages)

- **Issue:** `Spinner` sets `aria-hidden={true}` by default. When rendered in standalone containers or full-page wrappers (`PageLoadingSkeleton`, `LoadingSpinner`), screen readers are not notified that content is actively loading unless wrapped in an accessible live region.
- **Guidance:**
  - Wrap standalone/page-level loading states in `role="status"` or `aria-live="polite"` with `aria-busy="true"` on the parent container.
  - Provide a localized `<span className="sr-only">{t("common.loading")}</span>` when `Spinner` is used without visible text.
  - Ensure disabled submit buttons with spinners convey state via `aria-disabled="true"` or `aria-busy="true"`.

### 2. Motion Sensitivity (`prefers-reduced-motion`)

- **Issue:** `animate-spin` continuously rotates at high speed, which can cause discomfort or vestibular disorientation for users with motion sensitivity.
- **Guidance:** Respect `motion-reduce:animate-none` or provide a gentle pulse / static indicator under `prefers-reduced-motion: reduce`.

### 3. Flash of Loading State (FOLS) on Fast Connections

- **Issue:** Micro-requests (<150ms–200ms) flash full-size spinners or skeletons momentarily, creating visual jitter and perceived slowness.
- **Guidance:** For rapid interactions or cached data, consider a short entrance delay (e.g. 150ms debounce) or CSS transition delay before mounting full-page/section spinners.

### 4. Stuck Spinner & Indefinite Loading Recovery

- **Issue:** Network failures or SSE disconnects may leave spinners running indefinitely without error fallback or retry mechanisms.
- **Guidance:** Pair critical async loaders (e.g., TTS preview, video export, auth checks) with timeouts (e.g., 15–30s) that swap the spinner for an explicit error message with a retry action button (`RotateCcw`).

---

## Known issues & recommendations

> **Task IDs:** Each item below maps to the [Task list](#task-list) (e.g. SPIN-001).

### 1. Redundant spinners — `TmdbImportView` (SPIN-002) — **Fixed**

When `isSearching` is true, both apply:

- ~~`<Spinner size="sm" />` in the search button~~
- `<LoadingSpinner size="lg" fullHeight message="Searching TMDB…" />`

**Resolution:** Full-page `LoadingSpinner` kept; button always shows `Search` icon; input disabled while searching.

### 2. Inconsistent spinner visuals — CSS border divs (SPIN-101–108) — **Fixed**

~~15 files still use hand-rolled border spinners~~ All migrated to shared `Spinner` / `PageLoadingSkeleton` in Phase 2.

### 3. Missing first-load UI — notification settings (SPIN-001) — **Fixed**

`settings/notifications/page.tsx` reads `preferencesLoading` from context but does not render a loading state.

**Resolution:** Renders `<LoadingSpinner fullHeight />` with `notificationSettings.loadingPreferences` while preferences load.

### 4. Dashboard progressive loading (SPIN-301)

Projects and popular movies sections simply do not render while loading (stats show `"..."`).

**Recommendation:** Optional section-level skeletons or a single centered spinner if empty-state flash is noticeable.

### 5. Accent color split (optional) (SPIN-303)

`LoadingSpinner` (`text-accent-primary`) vs project skeletons (`text-accent-cyan`) may look slightly different on the same screen. Unify only as part of a deliberate visual pass.

---

## Task list

Actionable backlog for Priority 3+ spinner work. Check off items as completed and note the PR that closed each task.

**Legend:** Effort — **S** (≤1 h), **M** (1–3 h), **L** (half day+). Priority — **P0** user-facing bug/ gap, **P1** consistency/cleanup, **P2** polish, **P3** optional / design pass.

### Phase 1 — UX gaps (P0)

| ID | Task | File(s) | What to do | Acceptance criteria | Effort | PR batch |
|----|------|---------|------------|---------------------|--------|----------|
| SPIN-001 | Notification settings first-load | `src/app/(shell)/settings/notifications/page.tsx` | When `preferencesLoading === true`, render `<LoadingSpinner size="md" message={…} fullHeight />` (or a form skeleton) instead of the preferences form. Use an existing i18n key or add one under `settings.notifications`. | Form does not flash empty/stale toggles on first visit; Save stays disabled while loading; no layout shift when prefs arrive. | S | `fix/notifications-settings-loading` | **Done** |
| SPIN-002 | TmdbImportView redundant spinners | `src/app/(shell)/admin/movies/components/TmdbImportView.tsx` | Remove either the search-button `<Spinner size="sm" />` **or** the full-page `<LoadingSpinner fullHeight />` when `isSearching`. Prefer keeping full-page spinner + disabled search input. | Only one loading indicator visible during TMDB search; search button/input clearly disabled. | S | `fix/tmdb-import-spinner` | **Done** |
| SPIN-003 | Export player loading vs empty | `src/app/project/[projectId]/export/page.tsx` | Introduce distinct UI for (a) video metadata/stream still fetching, (b) generation in progress, (c) no URL yet / failed. Do not show a bare large `Spinner` for all falsy `video_url` cases. | Player area shows spinner only while a known fetch/generation is in flight; empty/error states have copy + optional retry. | M | `fix/export-player-states` | **Done** |

### Phase 2 — Border spinner → `Spinner` migration (P1)

Replace hand-rolled `div` border spinners with `<Spinner />`. Match size and color from the surrounding context. See [Border spinner inventory](#border-spinner-inventory).

| ID | Task | File(s) | Replacement pattern | Acceptance criteria | Effort | PR batch |
|----|------|---------|---------------------|---------------------|--------|----------|
| SPIN-101 | Notifications cluster | … | … | … | S | `refactor/spinner-notifications` | **Done** |
| SPIN-102 | Auth redirect pages | … | … | … | S | `refactor/spinner-auth` | **Done** |
| SPIN-103 | New project boot | … | … | … | S | `refactor/spinner-new-project` | **Done** |
| SPIN-104 | Audit logs table overlay | … | … | … | S | `refactor/spinner-admin` | **Done** |
| SPIN-105 | Voice cards & preview | … | … | … | M | `refactor/spinner-voices` | **Done** |
| SPIN-106 | Voice recording modal | … | … | … | S | `refactor/spinner-voice-modal` | **Done** |
| SPIN-107 | Onboarding steps | … | … | … | S | `refactor/spinner-onboarding` | **Done** |
| SPIN-108 | Migration verification | — | … | `rg 'border.*animate-spin\|animate-spin.*border' src` → **0** matches | S | Included in Phase 2 PR | **Done** |

### Phase 3 — Shared primitive & a11y (P1)

| ID | Task | File(s) | What to do | Acceptance criteria | Effort | PR batch |
|----|------|---------|------------|---------------------|--------|----------|
| SPIN-201 | Live region on page loaders | `src/components/ui/LoadingSpinner.tsx`, `src/components/ui/loading-skeleton.tsx` | Add `role="status"`, `aria-live="polite"`, and `aria-busy="true"` on the outer wrapper. Include `<span className="sr-only">{message ?? t("common.loading")}</span>`. | Screen reader announces loading when `LoadingSpinner` / `PageLoadingSkeleton` mount; visible message unchanged. | M | `feat/spinner-a11y` |
| SPIN-202 | Reduced motion support | `src/components/ui/spinner.tsx` | Add `motion-reduce:animate-none` to `Loader2` classes; optionally swap to a static icon or subtle pulse under `@media (prefers-reduced-motion: reduce)` via Tailwind `motion-reduce:` utilities. | With OS “reduce motion” on, spinner does not rotate continuously. | S | `feat/spinner-a11y` |
| SPIN-203 | Optional FOLS delay helper | New hook e.g. `src/lib/hooks/use-delayed-loading.ts` + adopt on 1–2 full-page loaders | Expose `showLoading = isLoading && elapsed > 150ms` (configurable). Apply to `LoadingSpinner fullHeight` on list pages first. | Fast cached loads (<150ms) do not flash full-page spinner; slow loads still show spinner. | M | `feat/spinner-fols-delay` |
| SPIN-204 | Timeout + retry pattern (pilot) | Pick one critical flow: e.g. `export/page.tsx` generation or `preview/page.tsx` TTS | After 15–30s without resolution, replace spinner with error copy + retry button (`RotateCcw`). | Stuck async state surfaces error + retry; happy path unchanged. | L | `feat/spinner-timeout-retry` |

### Phase 4 — Optional polish (P2–P3)

| ID | Task | File(s) | What to do | Acceptance criteria | Effort | PR batch |
|----|------|---------|------------|---------------------|--------|----------|
| SPIN-301 | Dashboard section skeletons | `src/app/(shell)/dashboard/page.tsx` | While `loadingProjects` / `loadingMovies`, show `LoadingSkeleton variant="card"` or `variant="poster"` in section slots instead of hiding sections. | No empty gap under stats during fetch; stats still show `"..."`. | M | `polish/dashboard-loading` |
| SPIN-302 | Admin hub stats loading | `src/app/(shell)/admin/page.tsx` | Optional: skeleton cards or inline `Spinner size="sm"` beside stat labels while stats fetch. | Stats area does not jump from `"-"` to numbers without context (if pursued). | S | `polish/admin-hub-loading` |
| SPIN-303 | Accent color unification | `LoadingSpinner.tsx`, `loading-skeleton.tsx` | Pick one accent (`text-accent-primary` or `text-accent-cyan`) for all shared loaders; update both components together. | All page/section loaders share one accent token. | S | `polish/spinner-accent` |
| SPIN-304 | Admin projects table initial load | `src/app/(shell)/admin/projects/page.tsx` | Optional: show table `LoadingSpinner` or skeleton rows on first fetch (today only stats use `LoadingSpinner`). | First visit shows table loading state; refresh still uses `RefreshCw` spin. | M | `polish/admin-projects-table` |

### Phase 5 — Cleanup (P1)

| ID | Task | File(s) | What to do | Acceptance criteria | Effort | PR batch |
|----|------|---------|------------|---------------------|--------|----------|
| SPIN-401 | ~~Remove dead `video-generation.tsx`~~ **Done** | — | File deleted; `docs/TYPOGRAPHY.md` reference removed. Export flow remains in `export/page.tsx`. | No importers; typography doc updated. | S | `chore/remove-video-generation` |
| SPIN-402 | Update this audit doc | `docs/SPINNER_AUDIT.md` | After each phase, update migration status, border inventory counts, and check off task IDs. | Doc matches repo; verification command counts current. | S | Ongoing |

### Out of scope — do not implement

| ID | Item | Reason |
|----|------|--------|
| SPIN-X01 | Migrate `RefreshCw` + `animate-spin` (8 files, 10 sites) | Correct refresh semantics — see [What not to migrate](#what-not-to-migrate) |
| SPIN-X02 | Replace pulse skeletons with spinners | Worse UX for grids/lists |
| SPIN-X03 | Migrate `ProjectStatsCard` `Loader2` | Static metric icon, not a spinner |
| SPIN-X04 | Profile `return null` when `!user` | Relies on auth shell; low severity |

### Suggested PR sequence

1. **Quick wins:** SPIN-001, SPIN-002, SPIN-401 — **done**  
2. **Visual consistency:** SPIN-101 → SPIN-108 — **done**  
3. **Primitives:** SPIN-201 + SPIN-202 (single a11y PR)  
4. **Behavior:** SPIN-003, SPIN-203, SPIN-204 as needed from user feedback  
5. **Polish:** SPIN-301–304 only if empty-state flash is reported

### Task checklist (copy for PR descriptions)

```
Phase 1 — UX
- [x] SPIN-001 Notification settings first-load
- [x] SPIN-002 TmdbImportView redundant spinners
- [x] SPIN-003 Export player loading vs empty

Phase 2 — Border migration
- [x] SPIN-101 Notifications cluster
- [x] SPIN-102 Auth redirect pages
- [x] SPIN-103 New project boot
- [x] SPIN-104 Audit logs table
- [x] SPIN-105 Voice cards & preview
- [x] SPIN-106 Voice recording modal
- [x] SPIN-107 Onboarding steps
- [x] SPIN-108 Migration verification

Phase 3 — a11y & behavior
- [ ] SPIN-201 Live region on page loaders
- [ ] SPIN-202 Reduced motion support
- [ ] SPIN-203 FOLS delay helper
- [ ] SPIN-204 Timeout + retry (pilot)

Phase 4 — Polish
- [ ] SPIN-301 Dashboard section skeletons
- [ ] SPIN-302 Admin hub stats loading
- [ ] SPIN-303 Accent color unification
- [ ] SPIN-304 Admin projects table initial load

Phase 5 — Cleanup
- [x] SPIN-401 Remove video-generation.tsx
- [ ] SPIN-402 Update SPINNER_AUDIT.md
```

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

As of last verification: **2** direct `Loader2` files, **~40** files importing `Spinner`/`LoadingSpinner`, **0** border-spinner instances, **10** `RefreshCw` refresh-spin sites across **8** files.

---

## Related work (icon audit roadmap)

| Priority | Task | Status |
|----------|------|--------|
| 1 | Remove dead code; Lucide for duplicate inline SVGs | Done |
| 2 | `Icon` + `Spinner` primitives; migrate spinners | Done |
| 3 | Brand icons (`GoogleIcon`, `XIcon`, `WeChatIcon`) | Done |
| 4 | Icon conventions in `AGENTS.md` / `docs/ICONS.md` | Done |
| 5 | Accessibility pass on icon-only buttons | Partial — see [Audit status](ICONS.md#audit-status-aug-2026) in `docs/ICONS.md` |
| 6 | Empty-state hero tier (`EmptyState` pattern) | Done — see [Empty states](ICONS.md#empty-states--pattern) in `docs/ICONS.md` |

This document covers Priority 2 spinner scope. Icon wrapper adoption (`Icon` component) is documented in `docs/ICONS.md`; spinners remain separate from icons per that guide.
