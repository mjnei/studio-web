# Project Creation Workflow

**Last Updated:** August 26, 2026 | **Status:** Production Ready  
**UI tokens / primitives:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## Overview

A 7-step workflow for creating narrated videos from movie trailers. Progress is persisted in the database (`last_step`); users can leave and resume anytime.

```
Source → Script → Voice → Details → Preview → Compose → Export
```

### Creative phases

| Phase | Steps | Focus |
| :--- | :--- | :--- |
| **A — Concept** | 1 Source, 2 Script | Pick the film and write narration |
| **B — Production** | 3 Voice, 4 Details, 5 Preview | Persona, title, full TTS audio |
| **C — Mastering** | 6 Compose, 7 Export | Thumbnail cover + final render |

Phase badges appear in `ProjectShell` (header) and `FloatingWorkflowNavigation` (dock).

**Entry points:**

1. **Dashboard / Projects** → `/project/new` (redirects to `/project/new/source`) → select movie → `/project/new/script` (project created on first script save)
2. **Movie details** (`/movies/{id}`) → “Create Project” → `/project/new/script` (movie in `sessionStorage`)

Both paths land on `/project/new/script`; saving the script creates the project and continues at `/project/{id}/voice`.

**Resume:** Project cards link to `/project/{id}`. That landing page shows a session-restored toast and `router.replace`s to `last_step` (not a computed “furthest completed” walk). Deep links may still use `?resumed=true` (handled in `ProjectShell`).

---

## Shell & navigation

### ProjectShell

- Top chrome: back to projects, project title, phase/status badge, credits, notifications
- Ambient poster glow when `moviePoster` is set (`blur-3xl`, low opacity)
- Sidebar via `SidebarProvider` (narrow screens use a drawer)

### FloatingWorkflowNavigation

Used on every step (including `/project/new/*`).

- Fixed bottom dock with glass panel; offsets for sidebar width on desktop
- Phase pill (Concept / Production / Mastering)
- Step track: completed (cyan check), current (primary + ring), upcoming (muted)
- Prev / Home / Next; auto-hides on scroll down
- Completed steps are clickable; future steps are not
- Tooltips on step dots; responsive labels (icons-first on mobile)

### Shared UX building blocks

| Piece | Path | Role |
| :--- | :--- | :--- |
| `StepRevisitBanner` | `src/components/project/step-revisit-banner.tsx` | Summary + continue when revisiting a completed step |
| `ContextDrawer` + `ContextDrawerTrigger` | `src/components/ui/context-drawer*.tsx` | Secondary controls / diagnostics (Escape, body scroll lock) |
| Session resume helpers | `src/lib/utils/time-format.ts` | `formatRelativeTimeAgo`, `formatSessionResumeMessage` |
| Resume landing | `src/app/project/[projectId]/page.tsx` | Toast + redirect to `last_step` |

**Per-step layout pattern:** `PageHeader` with optional drawer trigger → optional `StepRevisitBanner` (Source, Script, Voice, Details, Compose only) → **hero** (one primary decision) → drawer for secondary context. Preview and Export omit the revisit banner. Script has no ContextDrawer.

| Step | Hero | Contextual drawer |
| :--- | :--- | :--- |
| 1 Source | Confirmed movie showcase / catalog grid | Source footage & specs |
| 2 Script | Script studio (unchanged; no drawer) | — |
| 3 Voice | Voice selection + audition | Pacing, script reference, Agnes status, voice limits |
| 4 Details | Title input + AI suggestion chips | Film / script / thumbnail context |
| 5 Preview | Studio audio deck (idle / processing / ready) | Telemetry, script, re-synthesize |
| 6 Compose | Live 16:9 cover canvas | Style presets → editor, script reference |
| 7 Export | Master video **or** pre-flight + render CTA | Pipeline diagnostics & failed attempts |

Copy lives under `public/locales/{locale}/project.json`.

---

## The 7 steps

### Step 1: Source

**Routes:** `/project/new/source`, `/project/[projectId]/source`

Select the TMDB movie foundation.

**UI:** Search + horizontal genre chips; Pattern 1 poster grid (`grid-cols-2` → `xl:grid-cols-6`); selected movie confirmation / hero with change-movie flow; `StepRevisitBanner` when already selected.

**Completion:** `movie_id` set → advance to Script.

---

### Step 2: Script

**Routes:** `/project/new/script`, `/project/[projectId]/script`

Generate/edit voiceover narration in an inline editor (textarea + metrics). Word count and duration estimate (~150 wpm).

- **New project** (`/project/new/script`): `POST /scripts?movie_id=…` via `createScript` creates the project + first script, then redirects to `/project/{id}/voice`.
- **Existing project** (`/project/[projectId]/script`): edit/activate versions via `addScript` / `setActiveScript`. Continue may navigate to Voice immediately while a dirty save continues in the background.

**Note:** This step was intentionally left stable during the UX redesign — no ContextDrawer. `StepRevisitBanner` is still shown when revisiting a completed script.

**Completion:** Active script saved → Voice.

---

### Step 3: Voice

**Route:** `/project/[projectId]/voice`

Choose narrator persona; audition samples (not full-script TTS).

**UI:** Community / My Voices tabs (`GET /voices/available`); search + persona filter chips (match against voice **name** substrings); responsive audition cards with waveform while playing; record custom voice (limits via `useVoiceLimits`).

**Drawer:** Speech rate presets via `SpeechRateControl` (`0.5` / `1.0` / `1.25` / `1.6` / `2.0`), script reference, Agnes status.

**Background:** On page load (when script content exists), `scheduleAgnesJobs(projectId)` queues **names + thumbnail** (defaults `schedule_names=true`, `schedule_thumbnail=true`). Non-blocking; failures are swallowed so Voice is never blocked.

**On continue:** `createTTSJob` (selected voice + speech `ratio`) → `advanceProjectStep(…, "voice")` → Details. There is no separate “set voice_id” PATCH; the active TTS job carries the voice.

**Completion:** Voice selected + TTS job scheduled → Details.

---

### Step 4: Details

**Route:** `/project/[projectId]/details`

Brand the project with a title.

**UI:** Hero title field (char counter, clear); Agnes AI suggestion chips (or local fallbacks from movie title while generating / if empty); optional thumbnail preview if ready.

**Agnes names:** `GET /projects/{id}/suggested-names` first. If empty → `scheduleAgnesJobs(…, names only)` then poll suggested-names (first try ~3s, then every ~5s, max 15 attempts).

**On continue:** Save name via `PATCH /projects/{id}` when changed → `advanceProjectStep(…, "details")` → Preview.

**Drawer:** Film info, script snippet, thumbnail concept status.

**Completion:** Non-empty `project_name` → Preview.

---

### Step 5: Preview

**Route:** `/project/[projectId]/preview`

Verify full-script TTS audio before spending video credits.

On load, the page either resumes `active_tts_job_id` (`GET /tts/{job_id}`) or auto-creates a TTS job when voice/script changed or no active job exists. Manual generate / re-synthesize CTAs remain available.

**States:**

1. **Idle** — Brief / edge case before a job exists; generate CTA (voice + word estimate)
2. **Processing** — Queue/progress (`TTSQueueStatus`), HTTP poll ~3s
3. **Ready** — Studio deck: play/pause, scrub, mute, re-synthesize
4. **Error** — Message + retry

Smart cache: backend reuses audio when voice + preview text (first 2 sentences) match. Job progress is **HTTP polling**, not SSE — see backend `docs/SSE (Server-Sent Events).md`.

**Navigation:** Next enabled when `status === "completed"` and `audio_url` is set. Dock Next uses default routing to Compose (does **not** call `advanceProjectStep`).

**Completion:** TTS job `completed` with `audio_url` → Compose (`canGoNext`).

---

### Step 6: Compose

**Route:** `/project/[projectId]/compose`

Thumbnail / cover studio only — **no video generation**.

**UI:** Live 16:9 canvas; edit overlay via `ThumbnailEditorModal`; regenerate base image with confirm. Drawer “typography presets” (Cinematic Gold, Neon Cyan, Minimalist Clean, Breaking Red) open the editor modal (they are entry points, not one-click applied canvas styles). Compose also falls back to `scheduleAgnesJobs(..., thumbnail only)` if the base image is missing.

**Backend:** Pillow composite → S3 via `POST /projects/{id}/thumbnail/export`; sets `final_thumbnail_url` / `thumbnail_confirmed`.

**On continue:** `advanceProjectStep(…, "export")` → Export. Next is always enabled.

---

### Step 7: Export

**Route:** `/project/[projectId]/export`

Render final video, manage versions, download/share.

**When no completed video:** Pre-flight checklist + Start Generation CTA (credit badge). Checklist items 1–3 are **informational UI**; item 4 (credits) is the real gate when balance &lt; 1. Confirm modal, then `regenerateVideo(projectId)`.

**When completed:** Master player, version switcher, download / export-format modal / share (X intent URL; WeChat shows a copied-URL toast).

**Processing:** Live telemetry is shown in the page hero while a job is `queued`/`processing` (or submit is in flight). First-time generation replaces the pre-flight Start CTA with a waiting state; regenerating a new version shows a compact telemetry banner under the master showcase. Poll videos ~10s while any job is active; may refresh on `video_job_completed` notification.

**Navigation:** Back → Compose. **Bottom Dock Action** adapts dynamically to video state:
- **No completed video:** "Generate Video" (or "Retry Generation" if previous attempt failed) → opens generation flow.
- **Queued / Stitching / Encoding:** "Generating..." (spinner, disabled).
- **≥1 completed video:** "Complete Project" (with checkmark) → routes to `/projects`. Home always available.

---

## AI background jobs (Agnes)

Client: `scheduleAgnesJobs(projectId, scheduleNames?, scheduleThumbnail?)` →  
`POST /projects/{id}/schedule-agnes-jobs?schedule_names=&schedule_thumbnail=`

| When | Call | Purpose |
| :--- | :--- | :--- |
| **Voice page load** (script content present) | `scheduleAgnesJobs(projectId)` — both flags default `true` | Queue name suggestions + base thumbnail early |
| **Details** (names empty) | `scheduleAgnesJobs(projectId, true, false)` then poll `GET …/suggested-names` | Names only; local movie-title fallbacks while waiting |
| **Compose** (base image missing / not generating) | `scheduleAgnesJobs(projectId, false, true)` | Thumbnail-only catch-up |

Non-blocking; Voice/Compose mark the schedule attempt done even on failure so the user is never stuck waiting on AI.

---

## Database (projects — workflow-relevant)

Key fields (see backend models / Alembic for full schema):

| Field | Role |
| :--- | :--- |
| `status` | `draft` \| `in-progress` \| `completed` |
| `last_step` | `source` \| `script` \| `voice` \| `details` \| `preview` \| `compose` \| `export` |
| `movie_id` | Step 1 |
| `active_script_id` | Step 2 pointer |
| `project_name` / `suggested_names` | Step 4 |
| `script_summary` | Tagline / default overlay |
| `thumbnail_*` / `final_thumbnail_url` / `thumbnail_confirmed` | Steps 3→6 |
| `active_tts_job_id` | Steps 3–5 |
| `active_video_job_id` | Step 7 |
| `is_deleted` | Soft delete |

Advance via `POST /api/v1/projects/{id}/advance?step=...` (or client helpers that update `last_step`).

---

## API (quick reference)

Base: `/api/v1` with `Authorization: Bearer <token>`.

| Area | Endpoints (client paths under `/api/v1`) |
| :--- | :--- |
| Movies | `GET /movies/popular`, `GET /movies/search`, `GET /movies/{id}?locale=`, `PATCH /projects/{id}` `{ movie_id, last_step }` |
| Script | `POST /scripts?auto_activate=&movie_id=` (create project + script when `movie_id` set), `GET /scripts/project/{id}/list`, `POST /scripts/project/{id}/activate/{scriptId}` |
| Voices | `GET /voices/available`, `POST /voices/upload`, `GET /voices/{id}/audio-url` (`src/lib/api/voice-client.ts`) |
| Project | `GET/PATCH /projects/{id}`, `POST /projects/{id}/advance?step=`, `POST /projects/{id}/schedule-agnes-jobs`, `GET /projects/{id}/suggested-names` |
| TTS | `POST /tts?auto_activate=`, `GET /tts/{job_id}` — statuses: queued → processing → completed \| failed |
| Thumbnail | `POST /projects/{id}/thumbnail/export`, `…/regenerate`, `…/retry-generation`, `…/upload` |
| Video | `GET /video/project/{id}/list`, `POST /projects/{id}/regenerate-video`, `DELETE /projects/{id}/videos/{videoId}` (`src/lib/credit-client.ts` for regenerate/list/delete) |
| Credits | `GET /users/me/credits` |

TTS pipeline: Frontend → `POST /tts` → RabbitMQ `tts_jobs` → TTS worker → `tts_results` → consumer → DB; frontend polls until terminal.

Video pipeline: Export CTA → credit confirm → `video_jobs` / results consumer → poll + optional notification SSE for completion alerts.

---

## Frontend map

```
src/app/project/
  [projectId]/
    page.tsx                 # Session resume → last_step
    layout.tsx               # ProjectShell
    source|script|voice|details|preview|compose|export/page.tsx
  new/
    source|script/page.tsx   # Pre-create flow
    layout.tsx               # NewProjectShell

src/components/project/
  project-shell.tsx
  floating-workflow-navigation.tsx
  step-revisit-banner.tsx
  movie-selection.tsx
  voice-selection-panel.tsx / voice-selection-card.tsx
  speech-rate-control.tsx
  tts-queue-status.tsx
  ThumbnailEditorModal.tsx
  ExportFormatModal.tsx
  ProjectCard.tsx            # Links to /project/{id}

src/components/ui/
  context-drawer.tsx
  context-drawer-trigger.tsx
```

State: `useProjectState` (`src/lib/hooks/use-project-state.ts`) + `src/lib/project-client/*`.  
Also: `src/lib/api/voice-client.ts` (available voices / upload / audio-url), `src/lib/credit-client.ts` (credits + video regenerate/list/delete).

---

## Navigation rules

| Step | Back | Next when | Notes |
| :--- | :--- | :--- | :--- |
| Source | Hidden | Movie selected | New: sessionStorage → `/project/new/script`. Existing: movie PATCH + advance `source`; Next routes to Script |
| Script | → Source | Script content / active script | New: `POST /scripts` + redirect Voice. Existing: save via `addScript` (background OK) then route Voice |
| Voice | → Script | Voice selected | Continue: TTS + advance `voice`. Agnes already on load |
| Details | → Voice | Name entered | Continue: PATCH name + advance `details` |
| Preview | → Details | TTS completed + `audio_url` | Next routes Compose **without** advance |
| Compose | → Preview | Always | Continue: advance `export` |
| Export | → Compose | Always (dynamic dock action) | Pre-flight: "Generate Video" / "Retry Generation" → generation modal; Rendering: "Generating..." (disabled); Completed: "Complete Project" → `/projects` |

Access: completed steps revisitable via stepper; future steps not clickable from the dock. Resume uses stored `last_step` (so Preview/Compose visits that skip `advance` may resume earlier).

---

## Voice samples vs TTS

| | Step 3 Voice | Step 5 Preview |
| :--- | :--- | :--- |
| Audio | Catalog/sample clips | Full script synthesis |
| Purpose | Pick persona + pace | QA narration before render |
| Cost focus | Audition only | Content-cache aware TTS |

---

## Known limitations

- Export pre-flight checks 1–3 are informational; only credits (#4) gates the CTA.
- Session resume follows `last_step`, not a recomputed furthest-completed path (Preview Next does not advance `last_step`).
- Voice filter chips (`All`, `Dramatic`, `Deep`, `Energetic`, `Warm Storyteller`) match name substrings, not structured persona metadata.
- Compose drawer style presets open the thumbnail editor; they do not apply named styles by themselves.
- Step 2 Script UI is retained intentionally without the hero/drawer redesign.

---

## Testing checklist (smoke)

- [ ] New project via `/project/new` (→ source) and via movie details “Create Project”
- [ ] Complete steps 1→7; `last_step` advances where Continue handlers call advance; card opens `/project/{id}` and lands on last step with toast
- [ ] Stepper: revisit completed steps; future steps not clickable; Back hidden on Source
- [ ] Voice: Agnes schedules on load; play sample, select voice, Continue schedules TTS
- [ ] Preview: idle → processing → ready player; re-synthesize works; Next does not require advance
- [ ] Compose: edit/finalize thumbnail; regenerate confirms; Next → Export
- [ ] Export: pre-flight + credit gate; generate; poll; download/share; Complete enabled after video exists
- [ ] Mobile: dock density, genre chips scroll, voice grid, export download stack

---

## Common issues

| Issue | Likely cause | Check |
| :--- | :--- | :--- |
| Lost resume position | `last_step` not advanced (e.g. left from Preview) | Continue handlers that call `advanceProjectStep`; Preview Next does not |
| TTS stuck on Preview | Missing script/voice or poll failure | Job status + RabbitMQ/worker |
| Video won’t start | Insufficient credits or API 402 | Credits modal / balance |
| Blank Export checklist gate | Credits &lt; 1 | Top-up or regenerate after credits |
| Voice preview 401 | Auth header missing on media URL | Voice preview client / signed URL |

---

## Example walkthrough

1. Create project → Source: pick a movie → Script: save narration  
2. Voice: page load queues Agnes (names + thumbnail); audition → select → Continue schedules TTS → Details  
3. Details: pick AI title (or local fallback) or type custom name → Preview  
4. Preview: resume / auto-create TTS → listen → Continue → Compose  
5. Compose: finalize cover (thumbnail catch-up if needed) → Export  
6. Export: confirm credits → `regenerateVideo` → poll → download or share  

Video generation happens only on **Export**, not on Compose.
