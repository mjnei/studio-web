# Huavoi Studio — Product & UI Design Specification

## 1. Product Overview

Huavoi Studio is an AI-assisted video production tool that turns a source movie clip into a finished, narrated video. The user picks a clip, the AI drafts a script for it, the user refines that script, picks or clones a voice, previews how that voice sounds reading the script, and then Huavoi composes the final video by syncing the clip, the AI-generated voiceover, and supporting audio into one rendered output. The product is built around a single linear pipeline — Source → Script → Voice → Compose — and the UI should make that pipeline visible at all times so the user never loses track of which stage they're in, and so they can step away during long renders without losing their place.

## 2. Core User Flow

The product has five stages. Each stage is a distinct workspace, but all five live inside one project shell so the user can jump back to an earlier stage without losing work.

**Stage 1 — Select a Movie.** The user browses or searches a library of source movies/clips, previews them, and picks the one the new video will be built from. A movie may already be split into scenes; if so, the user can select a full movie or narrow to a scene range.

**Stage 2 — AI Script Generation.** Once a clip is chosen, Huavoi generates several candidate scripts (e.g. tonal variants — narrative, promotional, dramatic) timed against the clip's duration. The user reviews them side by side before committing to one.

**Stage 3 — Script Iteration.** The chosen script becomes editable. The user rewrites lines manually, or asks the AI to regenerate a specific paragraph/segment ("make this punchier," "shorten this," "match a more casual tone"). Editing happens at the level of timestamped segments, with AI assistance scoped to one segment at a time rather than forcing a full rewrite.

**Stage 4 — Voice Selection, Preview & Generation.** The user picks a preset voice from a library, or uploads/records a short sample to clone. Before committing to a full render, Huavoi generates a short preview clip — TTS output of just the opening sentences of the script, read in the chosen voice — so the user can confirm the voice and style actually fit before spending the time to render the entire track. Once approved, Huavoi runs the TTS engine across the full script, scoped per segment so individual lines can be regenerated later without re-rendering the whole track.

**Stage 5 — Compose & Export.** The movie clip, voiceover, and any music/SFX layers are assembled on a multi-track timeline. Once the user finalizes the timeline, the job is submitted to a render queue (wait times can range from a few minutes to roughly a day depending on load), and the user can leave and return later to check progress or download the result.

## 3. Application Shell & Navigation

### 3.1 Top navigation bar (global, always visible)

- **Left:** logo/product name, which always returns to the Dashboard.
- **Center-left:** primary links — *Dashboard*, *Projects*, *Movie Library*, *My Voices*, *My Jobs*.
- **Right:** a global search field, a "New Project" primary button, a notifications bell (badges when a render completes or fails), and an account avatar that opens a dropdown with *Profile*, *Settings*, and *Sign out*.

### 3.2 Left rail (global, icon + label, collapsible to icon-only)

- Dashboard
- Projects
- Movie Library
- My Voices
- My Jobs
- — divider —
- Settings
- Help/Support

This rail is global and persistent; it is not repurposed inside a project. Pipeline progress within a project is instead shown as a horizontal stepper in the project header (see 3.3), which keeps "where am I in the app" (rail) and "where am I in this video" (stepper) visually distinct.

### 3.3 Project workspace header

When a project is open: the project name (editable inline), a status pill (Draft / Script Ready / Voice Ready / Composing / Rendering / Completed), a five-step horizontal stepper — *Source · Script · Voice · Compose* — with a checkmark on completed stages and a highlight on the current one, each step clickable to jump back, and stage-relevant controls on the far right (Resolution/FPS dropdowns and the Export button appear once the user reaches composition).

## 4. Authentication

Huavoi Studio requires an account. Keep these screens minimal and consistent with the rest of the dark theme:

- **Sign up:** email + password fields, optional "Continue with Google/Apple" buttons, a link to Log in instead.
- **Log in:** email + password, "Forgot password?" link, same social options as sign-up.
- **Forgot/reset password:** a single email-entry step, followed by a reset-link confirmation screen.
- **Email verification (optional but recommended):** a lightweight banner/state shown post-signup until the user confirms their email, rather than a blocking screen.

All auth screens use a centered card on the dark background, logo above the form, and a single primary button per screen — no multi-column layouts here.

## 5. Profile & Settings

**Profile page:** avatar (with upload/change action), display name, email, and a small usage summary (renders this month, storage used, plan tier if applicable). An "Edit profile" action opens inline editing for name/avatar.

**Settings page**, organized as tabs or stacked sections:
- *Account* — change email, change password, connected social logins.
- *Notifications* — toggles for email and in-app alerts on render completion, render failure, and weekly usage summaries.
- *Defaults* — default voice, default resolution/FPS for new projects, default export format.
- *Billing/Plan* (if applicable) — current plan, usage limits, upgrade action.
- *Danger zone* — delete account, with explicit confirmation.

## 6. Screen-by-Screen Specification

### 6.1 Movie Selection (Stage 1)

A filterable grid of movie thumbnails, each showing a poster frame, title, duration, and genre/tag chips, with a search bar and filter row (genre, duration, resolution, "recently used") above it. Selecting a card opens a side preview panel with a scrubbable player and a "Select this clip" action; if the movie has multiple scenes, a scene-range selector (start/end timecodes on a mini scrub bar) lets the user narrow to a portion of the movie before continuing.

Key states: empty library (prompt to upload or browse a stock catalog), thumbnail loading, and a "Continue" CTA that only activates once a clip is confirmed.

### 6.2 Script Generation (Stage 2)

Once a clip is selected, one pane keeps the chosen clip looping (muted) for context while the other shows several generated script options laid out as columns or a horizontal carousel. Each option has a label (e.g. "Narrative," "Promotional," "Energetic"), a scrollable preview broken into timestamped segments, and a "Use this script" action. A "Regenerate all" control and a tone/length selector (short, standard, detailed) sit above the set for re-rolling all options at once.

Key states: generating (skeleton cards with a progress shimmer), and a side-by-side comparison toggle for evaluating two variants before committing.

### 6.3 Script Editor (Stage 3)

A full-height editor panel with a formatting toolbar (font, size, bold/italic/underline, lists, link) along the top, and the script body broken into colored, timestamped segments. Each segment has a small overflow menu exposing AI-assisted actions ("Regenerate this segment," "Make it shorter," "Change tone") alongside standard text actions (Cut/Copy/Delete). A preview pane stays synced to whichever segment is being edited, so scrubbing the script auto-scrolls the video to the matching timestamp and vice versa.

Key states: an inline diff/highlight when the AI rewrites a segment, so the user can see what changed before accepting it, and a version-history dropdown listing prior script revisions.

### 6.4 Voice Selection, Preview & Generation (Stage 4)

This stage has three sub-steps within one workspace:

**a. Choose a voice.** A library grid of preset voices (name, language/accent tag, gender, a waveform thumbnail, play-to-preview button), plus a persistent "Upload or record your voice" card for cloning — drag-and-drop an audio file, or record in-browser with a target duration (e.g. 30–60 seconds) for usable cloning quality.

**b. Preview the voice.** Before any full render, Huavoi generates a short clip using the first one to three sentences of the script in the chosen voice. This appears as a compact player with "Sounds good, continue" and "Try a different voice" actions, so the user can confirm fit without waiting on a full render.

**c. Generate the full voiceover.** Once approved, the TTS engine renders the entire script, shown as per-segment progress (since each segment generates as its own audio chunk) rather than one opaque global spinner. If the user later edits a single line back in Stage 3, only that segment's audio needs to be regenerated here.

### 6.5 Compose & Export (Stage 5)

A Video Preview panel (16:9 player with scrubber, play/pause, volume, fullscreen) sits above a multi-track timeline: Movie Clip (video), Voiceover (waveform, from Stage 4), Background Music (waveform, optional library pick), and SFX (icon markers at specific timestamps). Tracks support zoom, drag-to-trim, and snap-to-segment so the voiceover naturally aligns with the script's timestamps. Resolution/FPS controls and the Export action live in the project header.

**Render queue.** Submitting the composed timeline moves the project into a render queue rather than rendering instantly, since wait times can range from a few minutes to about a day depending on load. This needs explicit, reassuring UI:
- A status card replacing the preview area: "Queued" / "Rendering" with an estimated wait window (e.g. "Usually ready in 2–6 hours") rather than a false precise countdown.
- A visible, dismissible note that it's safe to close the tab — the job keeps processing and the result will show up in *My Jobs* and trigger a notification.
- An in-app notification and (if enabled) an email when the render finishes or fails, with a direct link back into the finished project.
- A cancel action while still queued, and a "this is taking a while" link to support/FAQ if the wait exceeds the estimated window.

Once complete, the screen returns to the normal preview/timeline view with the rendered output ready to play and export/download.

## 7. My Voices

A personal library, separate from the page above only in scope (this lists what the user owns rather than the full catalog). Two tabs: *My Voices* (uploaded/cloned samples) and *Stock Voices* (presets available to everyone). Each "My Voices" card shows the voice name (editable), source ("Cloned from upload" / "Recorded in-app"), date added, a preview play button, and actions to rename, delete, or "Use in a project." Empty state prompts the user to upload or record their first sample.

## 8. My Jobs

A single place to track every render across every project. Filter tabs: *All / Pending / Processing / Failed / Completed*. Each row or card shows a thumbnail (poster frame once available, a placeholder while pending), the project name, submitted time, a color-coded status badge (queued = gray, processing = blue/animated, failed = red, completed = green), and an estimated or elapsed time for anything not yet finished. Contextual actions per status: *View/Download* for completed jobs, *Retry* for failed ones (with the error reason visible), *Cancel* for queued ones, and *View details* for anything processing. Clicking a row opens a detail view with full job metadata, an error log for failures, and a link back into the source project.

## 9. Reusable Cross-Cutting Components

A handful of components recur across stages and pages and are worth building once as shared primitives:

- **Segment card** — the timestamped, colored script block used in Stages 2 and 3, with an overflow menu for AI actions.
- **AI action menu** — the "regenerate / shorten / change tone" pattern, reused anywhere content (script text, a voice line, a timeline clip) can be AI-regenerated or manually edited.
- **Waveform track row** — used for Voiceover, Background Music, and any future audio layer; needs a label, mute/volume control, and a zoomable horizontal scrub area.
- **Generation progress indicator** — a consistent visual language (shimmer plus percentage or segment count) for any async AI step: script generation, voice preview, full TTS rendering, final composition.
- **Job/queue status badge** — the color-coded status chip (queued/processing/failed/completed) used in the Stage 5 render queue and throughout My Jobs.
- **Version/variant switcher** — a small dropdown pattern reused for script versions, regenerated voice takes, and render history.

## 10. Visual Design Direction

A dark, focused workspace theme suits a media-heavy tool like this:

- **Surface:** deep charcoal/navy backgrounds with panels one shade lighter, separated by thin low-opacity borders rather than heavy drop shadows.
- **Accent colors:** a cyan/teal accent for general interactive elements (timestamps, active states, waveforms), and a distinct gradient (e.g. violet-to-cyan) reserved specifically for AI-triggered actions and primary calls-to-action (Generate, Export), so that color becomes a learned signal for "this triggers AI work."
- **Typography:** a clean grotesque/sans family throughout; timestamps and metadata in a smaller, muted gray weight so they sit visually behind the actual content.
- **Iconography:** simple outline icons at 20–24px for the nav rail and toolbars, with one consistent stroke width.
- **States:** hover lightens a panel slightly; selected/active states use the accent color as a left border or low-opacity fill; disabled controls drop to roughly 40% opacity rather than shifting hue.

## 11. Responsive & Edge-Case Notes

The two-pane editor/preview layout is desktop-first; on tablet widths, stack the preview above the editor and collapse the left rail into a bottom tab bar. Design an explicit empty state for every library screen (no movies, no saved voices, no jobs yet) with a clear primary action, and an explicit failure state for every AI step (script generation failed, voice preview failed, TTS failed, render failed) with a retry action rather than a silent dead end. Because render wait times can stretch to nearly a day, treat "user closes the tab mid-render" as the expected case, not an edge case — progress and final results must live durably in My Jobs regardless of whether the originating tab is still open.

## 12. Notes for the Frontend Engineer

The five pipeline stages map to five route-level views inside one project shell, with project state (selected clip, script versions, chosen voice, preview/voiceover audio, timeline state) held centrally so any stage can be revisited without data loss. Treat script generation, voice preview, full TTS rendering, and final composition as long-running async jobs — poll or use a socket connection to push per-segment or per-job progress rather than blocking the UI on one request. The render queue in particular should be backed by a durable job record (status, queue position or ETA, result URL, error detail) that both the in-project Compose screen and the global My Jobs page read from, so progress is consistent no matter which screen the user is looking at when it updates. Auth should issue a standard session/JWT so the same identity gates Projects, My Voices, and My Jobs without separate per-feature checks.
