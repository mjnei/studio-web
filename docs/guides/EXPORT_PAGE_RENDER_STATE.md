# Export Page — Video Render State & UI Plan

**Status:** Proposed (not yet implemented in `export/page.tsx`)  
**Scope:** `src/app/project/[projectId]/export/page.tsx`  
**Last updated:** 2026-08-30

---

## Problem Statement

When video generation has been started and the job is waiting in `queued` or `processing`, the Export page still shows the primary CTA:

> **Start Video Generation (1 Credit)**

This is confusing because:

1. The user has already committed a credit and initiated a render.
2. A separate **Live Video Pipeline Telemetry** card appears below the pre-flight hero, so the page shows both “start” and “in progress” at the same time.
3. The transient `isGeneratingVideo` flag only covers the HTTP request window (a few seconds). Once `regenerateVideo` returns, the button becomes clickable again until the next poll refreshes `videos`.

The bottom `FloatingWorkflowNavigation` already treats processing correctly (`processingVideos.length > 0 || isGeneratingVideo`), but the main content area does not use the same derived state.

---

## Current Architecture

### Data sources

| Source | Purpose |
|--------|---------|
| `videos` (local state) | List of `VideoGenerationResponse` from `getProjectVideos` |
| `isGeneratingVideo` | True only while `regenerateVideo` HTTP call is in flight |
| `creditStatus` | Remaining credits for gating and display |
| SSE / notifications | `video_job_completed` triggers a video list refresh |
| HTTP polling | Every 10s while any video is `queued` or `processing` |

### Derived lists (already present)

```ts
completedVideos  // status === "completed"
processingVideos // status === "processing" | "queued"
failedVideos     // status === "failed"
```

### UI branching (problem)

```
displayVideo = first completed video (by selection or default)

if (displayVideo)
  → Master Video Showcase (+ "New Version" button)
else
  → Pre-Flight Render Studio (+ Start Generation CTA)

if (processingVideos.length > 0)
  → Live Telemetry card (secondary, below hero)
```

The hero is driven only by **completed** videos. Processing jobs do not change the hero; they only add a secondary card.

---

## Goals

1. **Never show the Start CTA while a render is active** (`queued`, `processing`, or submit in flight).
2. **Single coherent hero** per page phase — no duplicate “start” + “in progress” messaging.
3. **Consistent state** between main content and `FloatingWorkflowNavigation`.
4. **Minimal regression risk** — reuse existing telemetry UI and i18n keys where possible.

### Non-goals

- Changing backend video job APIs or polling interval.
- Redesigning the Master Showcase or Diagnostics drawer.
- Adding new locales beyond any short copy needed for a rendering hero title (optional).

---

## Proposed State Model

Introduce a small set of **derived booleans** immediately after the video list filters. All UI and dock logic should read from these — not from raw flags in isolation.

```ts
/** True while POST /regenerate-video is in flight */
const isSubmittingGeneration = isGeneratingVideo;

/** True when user should not be able to start another render */
const isAwaitingRender =
  isSubmittingGeneration || processingVideos.length > 0;

const hasCompletedVideo = completedVideos.length > 0;
const hasOnlyFailed =
  failedVideos.length > 0 && !hasCompletedVideo && !isAwaitingRender;

const canStartGeneration = !isAwaitingRender && hasCredits;
```

### Page phases (primary hero)

| Phase | Condition | Hero content |
|-------|-----------|--------------|
| **Complete** | `hasCompletedVideo` | Master Video Showcase (unchanged) |
| **Rendering** | `isAwaitingRender && !hasCompletedVideo` | Waiting / progress hero — **no Start CTA** |
| **Preflight** | `!hasCompletedVideo && !isAwaitingRender` | Checklist + Start CTA |
| **Failed-only** | `hasOnlyFailed` | Same as Preflight but emphasize retry; failed details stay in drawer |

When `hasCompletedVideo && isAwaitingRender` (regenerating a new version), keep the showcase for the current master and show a **secondary inline banner** instead of enabling “New Version”.

---

## UI Changes

### 1. Rendering hero (first-time generation)

**Replace** the pre-flight Start CTA block with a dedicated waiting state when `isAwaitingRender && !hasCompletedVideo`.

**Show:**

- Spinner + heading (reuse or add i18n, e.g. `project.export.renderingHeading`)
- Existing step progress UI from Live Telemetry (`stepQueue`, `stepStitch`, `stepEncode`)
- Per-job status (`queuedStatus`, `stitchingStatus`, `versionOption`)

**Hide:**

- `CreditUsageIndicator` in the CTA area
- Start Generation button
- Insufficient-credits message under the button (credit was already consumed or reserved)

**Optional (lower priority):** Collapse the pre-flight checklist to a compact “4/4 verified” strip so the page still communicates readiness without competing with the progress UI.

### 2. Remove duplicate telemetry card

When the rendering hero is the primary content (`isAwaitingRender && !hasCompletedVideo`), **do not render** the separate Live Telemetry card below — its content lives inside the hero.

When `hasCompletedVideo && isAwaitingRender`, keep a **compact telemetry strip or banner** under the showcase (new version in progress).

### 3. Master Showcase — “New Version” button

```tsx
// Before
disabled={isGeneratingVideo}

// After
disabled={isAwaitingRender}
```

Label: show “Generating…” while `isAwaitingRender`, not only during HTTP submit.

### 4. FloatingWorkflowNavigation

Refactor dock block to use shared `isAwaitingRender` instead of re-deriving `isProcessingVideo` inline. Behavior stays the same:

- `isAwaitingRender` → label “Generating…”, `isProcessing={true}`, `onNext={undefined}`
- `hasCompletedVideo` → “Complete project”
- `hasOnlyFailed` → retry action
- else → “Generate video”

### 5. Processing timeout (follow-up)

Translation keys already exist: `processingTimedOut`, `processingTimedOutDesc`, `refreshStatus`.

Apply `useStuckAsync(isAwaitingRender)` and show a refresh/retry affordance if a job appears stuck (same pattern as page load timeout).

---

## State Management Improvements

### A. Optimistic job insert (recommended)

After successful `regenerateVideo`, before `loadVideos` resolves, insert a placeholder:

```ts
setVideos((prev) => [
  {
    id: `optimistic-${Date.now()}`,
    status: "queued",
    generation_attempt: prev.length + 1,
    // …minimal fields required by UI
  },
  ...prev,
]);
```

`loadVideos` replaces optimistic rows with server data. This closes the gap where the Start button flashes enabled between API return and first poll.

### B. Consolidate video list updates

Three code paths currently duplicate `setVideos` + `setSelectedVideoId` logic:

1. Initial `useEffect`
2. Notification `useEffect`
3. `loadVideos` / `applyVideosResponse`

**Action:** Route all updates through `applyVideosResponse` only.

### C. Rename for clarity

| Current | Proposed |
|---------|----------|
| `isGeneratingVideo` | `isSubmittingGeneration` |

Keeps mental model clear: “generating” on screen = server job state; “submitting” = client HTTP.

---

## i18n

### Reuse (no new keys required for MVP)

- `project.export.generating`
- `project.export.liveTelemetry`
- `project.export.queuedStatus` / `stitchingStatus`
- `project.export.stepQueue` / `stepStitch` / `stepEncode`
- `project.export.versionOption`

### Optional new keys

| Key | EN example |
|-----|------------|
| `project.export.renderingHeading` | Video generation in progress |
| `project.export.renderingIntro` | Your video is being composed. This usually takes a few minutes. |
| `project.export.newVersionInProgress` | Version {n} is rendering… |

Add to all 8 locales if new copy is introduced (`en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `de`, `fr`, `es`).

---

## Implementation Plan

### Phase 1 — Minimum viable fix (1 PR)

**Effort:** ~1–2 hours  
**Risk:** Low

1. Add derived state: `isAwaitingRender`, `canStartGeneration`, `hasCompletedVideo`.
2. Wrap Start CTA + `CreditUsageIndicator` in `{!isAwaitingRender && (…)}`.
3. When `isAwaitingRender && !hasCompletedVideo`, promote existing telemetry markup into the pre-flight card (or swap hero via ternary).
4. Suppress standalone Live Telemetry card when telemetry is already in the hero.
5. Disable “New Version” with `isAwaitingRender`.
6. Align `FloatingWorkflowNavigation` with shared `isAwaitingRender`.

**Acceptance criteria:**

- [ ] After confirming credit modal, Start button does not reappear until job completes or fails.
- [ ] Refreshing the page while job is `queued`/`processing` shows waiting UI, not Start CTA.
- [ ] With a completed master + new job running, “New Version” is disabled and progress is visible.
- [ ] Dock shows processing state for entire wait, not just during HTTP.

### Phase 2 — Robustness (optional follow-up)

**Effort:** ~2–3 hours  
**Risk:** Low–medium

1. Optimistic job row after `regenerateVideo`.
2. Consolidate all video list updates through `applyVideosResponse`.
3. Rename `isGeneratingVideo` → `isSubmittingGeneration`.
4. `useStuckAsync` for long-running renders + refresh button.

### Phase 3 — Polish (optional)

1. Extract `VideoRenderTelemetry` presentational component (hero + banner reuse).
2. Compact checklist variant during rendering phase.
3. Failed-only hero variant with inline retry.

---

## Testing Checklist

### Manual

| Scenario | Expected |
|----------|----------|
| First visit, no videos | Pre-flight + Start CTA |
| Click Start → confirm | Waiting hero; no Start CTA |
| Reload during `queued` | Waiting hero; no Start CTA |
| Job completes | Master Showcase; download/share actions |
| Completed + New Version | Showcase stays; new job shows banner; New Version disabled |
| Job fails (no completed) | Retry available; errors in diagnostics drawer |
| Insufficient credits (pre-start) | Start disabled; modal on attempt |

### Regression

- Credit confirmation and insufficient-credits modals still work.
- Notification-driven refresh still selects first completed video.
- 10s polling stops when no `queued`/`processing` jobs remain.
- Project-not-found path unchanged.

---

## File Touch List

| File | Changes |
|------|---------|
| `src/app/project/[projectId]/export/page.tsx` | State derivation, hero branching, telemetry placement, dock |
| `public/locales/*/project.json` | Only if new copy keys added (Phase 1 can ship without) |

---

## Open Questions

1. **Checklist during rendering:** Hide entirely, collapse to one line, or keep full checklist?  
   *Recommendation:* Collapse or hide for MVP; progress is the focus.

2. **Failed + processing concurrently:** Rare; treat `isAwaitingRender` as higher priority than failed-only hero.

3. **Component extraction:** Defer to Phase 3 unless PR size grows beyond ~150 lines changed.

---

## Summary

The fix is primarily a **state derivation and layout priority** change, not a new data layer. Treat `videos[].status` as the source of truth for “waiting,” use `isSubmittingGeneration` only for the submit gap, and drive the hero from a three-phase model (Preflight → Rendering → Complete) so the Start CTA never appears while a job is active.
