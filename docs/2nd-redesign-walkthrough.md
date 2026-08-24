# Walkthrough: Single-Purpose Focus Workflow & Pre-Flight Checklist

We have reviewed and improved the project workflow screens in `src/app/project/[projectId]/` following the **Single-Purpose Focus per Screen** principle, added the **Pre-Flight Sanity Checklist** in Step 7, and implemented **Session Resumption with Auto-Toast**.

---

## What Was Changed

### 1. Reusable Context Drawer Component
- [`src/components/ui/context-drawer.tsx`](file:///D:/runway/git/studio-web/src/components/ui/context-drawer.tsx):
  - Accessible, responsive slide-over drawer / sheet with backdrop blur, keyboard `Escape` closing, body scroll locking, and smooth spring animations.
  - Exported via [`src/components/ui/index.ts`](file:///D:/runway/git/studio-web/src/components/ui/index.ts).

### 2. Time Elapsed Utility
- [`src/lib/utils/time-format.ts`](file:///D:/runway/git/studio-web/src/lib/utils/time-format.ts):
  - Added `formatRelativeTimeAgo(date)` to produce clean human-readable relative time strings (`"just now"`, `"5 minutes"`, `"2 hours"`, `"yesterday"`, etc.).

### 3. Session Resumption with Auto-Toast
- [`src/app/project/[projectId]/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/page.tsx):
  - Landing page for `/project/[projectId]` that resolves the furthest completed step (or `last_step`), computes relative time from `project.updated_at`, and redirects with session parameters.
- [`src/components/project/project-shell.tsx`](file:///D:/runway/git/studio-web/src/components/project/project-shell.tsx):
  - Automatically fires the session resumption toast: **`"Restored your session from {time} ago"`** and cleans the URL query parameters cleanly using `window.history.replaceState`.

---

### 4. Single-Purpose Focus Across Workflow Steps

#### Step 1: Source ([`src/app/project/[projectId]/source/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/source/page.tsx))
- **Dominant Hero Interaction**: Confirmed Movie Showcase Canvas with 1080p stream badge, rating, genre tags, and primary action to proceed.
- **Contextual Drawer**: `"Source Footage & Specs"` drawer containing stream integrity specifications, TMDB ID, resolution, audio channel format, and synopsis overview.

#### Step 2: Script ([`src/app/project/[projectId]/script/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/script/page.tsx))
- Preserved without modification as requested.

#### Step 3: Voice ([`src/app/project/[projectId]/voice/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/voice/page.tsx))
- **Dominant Hero Interaction**: Voice Talent Selection Panel with instant audio audition playback, active card highlighting, and direct selection.
- **Contextual Drawer**: `"Voice Tuning & Script"` drawer isolating speech pacing slider (0.5x–2.0x), full script reference viewer, Agnes AI background status, and custom voice recording trigger with tier limit indicators.

#### Step 4: Details ([`src/app/project/[projectId]/details/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/details/page.tsx))
- **Dominant Hero Interaction**: Hero Project Title Crafting Deck with high-visibility input, character counter, and 1-click Agnes AI suggestion chips.
- **Contextual Drawer**: `"Project Context & Assets"` drawer displaying source film info, full script text, and AI thumbnail concept preview.

#### Step 5: Preview ([`src/app/project/[projectId]/preview/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/preview/page.tsx))
- **Dominant Hero Interaction**: Studio Audio Narration Deck with interactive waveform visualizer, big hero play/pause button, time scrubber, volume/mute toggles, and synthesization trigger.
- **Contextual Drawer**: `"Mastering Telemetry & Script"` drawer displaying RabbitMQ queue pipeline telemetry, full narration script, and re-synthesis options.

#### Step 6: Compose ([`src/app/project/[projectId]/compose/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/compose/page.tsx))
- **Dominant Hero Interaction**: Live 16:9 Master Cover Art Studio Canvas with 1080p live rendering, text overlay preview, and primary customize/regenerate actions.
- **Contextual Drawer**: `"Canvas Styling Studio"` drawer isolating typography style presets (Cinematic Gold, Neon Cyan, Minimalist Clean, Breaking Red), layout controls, and script text reference.

#### Step 7: Export ([`src/app/project/[projectId]/export/page.tsx`](file:///D:/runway/git/studio-web/src/app/project/[projectId]/export/page.tsx))
- **Dominant Hero Interaction**: Master Video Delivery & Rendering Engine.
- **Pre-Flight Sanity Checklist**: Displays the **4 automatic green checkmarks** before rendering:
  1. ✅ **Source Footage Linked** (`1080p source verified`)
  2. ✅ **Narrator Audio Ready** (`0 missing segments`)
  3. ✅ **Captions Formatted** (`No text overflow`)
  4. ✅ **Available User Credits** (`1 Credit required | {count} available`)
- **Contextual Drawer**: `"Pipeline Diagnostics & Logs"` drawer isolating failed attempt logs, delete actions, and target pipeline specifications (1080p FHD, 16:9, H.264, AAC 48kHz).
