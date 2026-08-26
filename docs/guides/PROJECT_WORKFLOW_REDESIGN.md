# Project Workflow UX & UI Redesign Specification

**Version:** 2.1  
**Target Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) v2.5
**Scope:** `studio-web/src/app/project/[projectId]/*` and `@/components/project/*`  
**Status:** Canonical Workflow & UI Specification (implemented)

---

## Table of Contents

1. [Executive Vision & User Experience Goals](#1-executive-vision--user-experience-goals)
2. [Workflow Philosophy: The Creator Mental Model](#2-workflow-philosophy-the-creator-mental-model)
3. [Global Shell & Floating Stepper Navigation](#3-global-shell--floating-stepper-navigation)
4. [Step 1: Source (Movie Discovery & Selection)](#4-step-1-source-movie-discovery--selection)
5. [Step 2: Script (Retained Storyboard & Narration Editor)](#5-step-2-script-retained-storyboard--narration-editor)
6. [Step 3: Voice (Vocal Persona & Speech Dynamics)](#6-step-3-voice-vocal-persona--speech-dynamics)
7. [Step 4: Details (Project Identity & AI Title Engine)](#7-step-4-details-project-identity--ai-title-engine)
8. [Step 5: Preview (TTS Audio Synthesis & Verification)](#8-step-5-preview-tts-audio-synthesis--verification)
9. [Step 6: Compose (Thumbnail Studio & Visual Assets)](#9-step-6-compose-thumbnail-studio--visual-assets)
10. [Step 7: Export (Video Rendering, Formats & Publishing)](#10-step-7-export-video-rendering-formats--publishing)
11. [Cross-Step Micro-Animations & Ambient Visuals](#11-cross-step-micro-animations--ambient-visuals)
12. [State Matrix Appendix](#12-state-matrix-appendix)
13. [Design System Primitives & Token Audit](#13-design-system-primitives--token-audit)
14. [Implementation Status & Checklist](#14-implementation-status--checklist)
15. [Single-Purpose Focus Delivery Notes](#15-single-purpose-focus-delivery-notes)

---

## 1. Executive Vision & User Experience Goals

Huavoi Studio turns movie trailers and catalogs into rich, AI-narrated short-form and long-form video content. To empower first-time creators while maintaining high efficiency for power users, the project creation workflow feels like a **collaborative creative studio** rather than a multi-step database form.

### Core UX Objectives

1. **Clarity of Purpose at Every Step**: Every step immediately answers:
   - *Where am I?* (Current phase & step position in the creative pipeline)
   - *What do I need to decide?* (Single focused primary decision)
   - *Why does this matter for my final video?* (Contextual tips and instant visual/audio previews)
2. **Zero-Friction Starting Path**: Provide smart defaults and background AI automation (Agnes AI) so any user can progress from movie selection to final export smoothly.
3. **Continuous Visual & Audio Feedback**: Eliminate "black-box" loading states. Use lively waveforms, audio visualizers, live thumbnail compositing, and animated progress telemetry.
4. **Fluid Responsiveness**: Flawless scaling from 320px mobile screens to 4K ultra-wide monitors, preserving dense desktop controls while ensuring comfortable touch targets on mobile.
5. **Strict Design System Alignment**: Zero ad-hoc styling, raw inputs, or arbitrary hex codes. Everything uses the tokens and primitives defined in `DESIGN_SYSTEM.md`.

---

## 2. Workflow Philosophy: The Creator Mental Model

The canonical 7-step workflow maps to three creative phases, strictly aligned between frontend and backend:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CREATIVE PHASES                                 │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│  PHASE A: CONCEPT     │  PHASE B: PRODUCTION        │  PHASE C: MASTERING   │
│  Steps 1 & 2          │  Steps 3, 4 & 5             │  Steps 6 & 7          │
│                       │                             │                       │
│  1. Source (Movie)    │  3. Voice (Persona & Pace)  │  6. Compose (Cover)   │
│  2. Script (Story)    │  4. Details (Branding)      │  7. Export (Render)   │
│                       │  5. Preview (Narration Deck)│                       │
└───────────────────────┴─────────────────────────────┴───────────────────────┘
```

### Purpose & Value Matrix

| Step | User Goal | What Success Looks Like | Background Automation |
| :--- | :--- | :--- | :--- |
| **1. Source** | Choose the movie or trailer to summarize. | Selected movie metadata and high-res poster loaded. | TMDB enrichment & catalog sync. |
| **2. Script** | Create or customize the voiceover narration. | Compelling script with verified duration and tone. | Script length & timing estimation. |
| **3. Voice** | Pick the ideal vocal persona for narration. | Instant audition of tone; calibrated speech rate. | **Background Agnes AI**: kicks off AI title suggestions & base thumbnail. |
| **4. Details** | Brand the project with a high-impact title. | Engaging title selected from AI options or typed. | Pre-fetches thumbnail generation status. |
| **5. Preview** | Listen to full script synthesized with voice. | Studio-quality audio review with zero video credit burn. | Smart cache matching (avoids duplicate TTS costs). |
| **6. Compose** | Design the thumbnail and headline overlay. | Eye-catching 16:9 cover image with text styling. | Pillow/PIL server-side graphic compositing. |
| **7. Export** | Render video, choose formats, and publish. | Multi-format download (1080p, 9:16 Shorts/TikTok) and social sharing. | RabbitMQ video rendering pipeline & webhook telemetry. |

---

## 3. Global Shell & Floating Stepper Navigation

### Structural Layout

The studio workflow layout features a top persistent bar with project metadata, an uncluttered main creative viewport with an ambient poster glow, and a glassmorphic floating dock navigation bar.

```
+-----------------------------------------------------------------------------------+
| [Drawer] [← Back to Projects]  Project: "Shadows of Dune" [Phase B] Credits: 12 (Bell)|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Ambient Poster Glow Backdrop: bg-cover blur-3xl opacity-5 fixed inset-0 ]      |
|                                                                                   |
|                           PRIMARY WORKSPACE CANVAS                                |
|                                                                                   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|   [← Prev]    ① Source ━ ② Script ━ ❸ Voice ━ ④ Details ━ ⑤ ━ ⑥ ━ ⑦    [Next: Details →]  |
+-----------------------------------------------------------------------------------+
```

### Floating Workflow Dock Specification

The floating dock remains fixed at the bottom of the viewport across all screen sizes, adapting its internal density gracefully:

- **Container**: `fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-5xl w-[calc(100%-2rem)]`
- **Surface**: `bg-surface-panel/90 backdrop-blur-2xl border border-border-strong shadow-2xl rounded-2xl p-2 sm:px-5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4`
- **Phase & Step Track**:
  - **Phase Indicator**: Micro pill displaying current phase (e.g., `Phase B: Production`) with color accent (`accent-primary` / `accent-secondary` / `accent-cyan`).
  - **Completed Step**: `bg-accent-cyan text-surface-base font-semibold` with `<Check className="h-3 w-3" strokeWidth={3} />`.
  - **Active Step**: `bg-accent-primary text-white ring-4 ring-accent-primary/25 shadow-glow scale-105`.
  - **Upcoming Step**: `bg-surface-raised border border-border-default text-text-muted`.
- **Responsive Behavior**:
  - **Desktop (`lg+`)**: Step numbers + titles displayed on hover tooltips, spacious step track, labeled Prev/Next buttons.
  - **Tablet (`sm`–`md`)**: Step dots only (no text labels in track), tooltips on hover/touch, compact Prev/Next buttons.
  - **Mobile (`< sm` / 320px–640px)**: Compact floating pill containing `<Button size="sm" variant="secondary">` (Prev icon), compact interactive step dots (`h-6 w-6` with 36px touch hit area), and `<Button size="sm" variant="primary">` (Next icon/label).
- **Revisit Summary Banner**: When a user returns to a completed step, an inline summary banner at the top confirms previous selection (e.g., `✅ Current Voice: Marcus (Deep Epic) • 1.0x Rate — [Keep & Continue]`).

---

## 4. Step 1: Source (Movie Discovery & Selection)

### Cognitive Purpose
Help users select the creative foundation of their video with zero ambiguity regarding TMDB catalog availability and imported assets.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Select Source Movie"                                            |
|  Description: "Choose the movie or trailer your video narration will be based on" |
+-------------------------------------------------------------------------------+
|  [ 🔍 Search TMDB catalog by movie title, director, or keyword...           ]  |
|  Genre Filter Chips (Horizontal scrollable on mobile):                         |
|  [All] [Action] [Sci-Fi] [Drama] [Horror] [Animation] [Thriller]              |
+-------------------------------------------------------------------------------+
|  POPULAR & TRENDING PICKS (Pattern 1 Grid: 2-3-4-5-6 Columns)                 |
|  +----------------+  +----------------+  +----------------+  +----------------+  |
|  | [Poster] 2:3   |  | [Poster] 2:3   |  | [Poster] 2:3   |  | [Poster] 2:3   |  |
|  | ★ 8.4 • 2024   |  | ★ 7.9 • 2023   |  | ★ 9.0 • 2024   |  | ★ 8.1 • 2022   |  |
|  | Dune: Part Two |  | Oppenheimer    |  | Interstellar   |  | Blade Runner   |  |
|  | [Action][SciFi]|  | [Drama][Hist]  |  | [Selected Ring]|  | [Sci-Fi]       |  |
|  +----------------+  +----------------+  +----------------+  +----------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Curated Quick Start**: Display trending/popular movies immediately with TMDB posters instead of an empty search screen.
2. **Horizontal Scrollable Genre Chips**: On mobile, genre filter chips use `flex overflow-x-auto no-scrollbar gap-2` so they never break into multiple awkward wrapping lines.
3. **Responsive Grid**: Uses Design System **Pattern 1** (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3`), ensuring 2 readable columns on 320px mobile up to 6 columns on large monitors.
4. **Selected Movie Confirmation Card**: Once chosen, displays a rich hero card with poster backdrop glow (`bg-cover filter blur-3xl opacity-15`), cast/crew highlights, duration, and a one-click "Change Movie" safeguard modal.

---

## 5. Step 2: Script (Retained Storyboard & Narration Editor)

### Status & Architecture
> [!NOTE]
> **Step 2 redesign is explicitly skipped.** The existing `ScriptPage` and `ScriptStudio` implementation in `studio-web` is already stable and functional. It is retained as-is without breaking changes.

### Cognitive Purpose
Empower creators to produce, refine, and time-estimate their video narration with AI assistance or manual editing.

- **Editor Surface**: Retained `bg-surface-panel` script canvas.
- **Timing Estimator**: Live calculation (`words / 150 * 60`) giving creators immediate target pacing feedback.
- **Workflow State**: Once a script is saved or verified, the project advances to Step 3 (Voice).

---

## 6. Step 3: Voice (Vocal Persona & Speech Dynamics)

### Cognitive Purpose
Enable users to audition and select the exact voice persona that matches their script's mood, while automatically starting background AI asset creation (Agnes AI).

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Voice Persona"                                                  |
|  Description: "Audition and assign the voice actor for your project narration"|
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  Tabs: [ Curated Voices (36) ]  [ My Custom Clones (2) ]                |  |
|  |  Filter Chips: [All] [Dramatic] [Deep] [Energetic] [Warm Storyteller]    |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  VOICE AUDITION GRID (1 col mobile, 2 col sm, 3 col lg)                |  |
|  |  +-------------------------------+  +-------------------------------+   |  |
|  |  | [▶ Play] Marcus - Deep Epic   |  | [❚❚ Pause] Evelyn - Cinematic |   |  |
|  |  | Male • Deep & Resonant        |  | Female • Warm Storyteller     |   |  |
|  |  | ( ılıı Animated Waveform... ) |  | ( 0:08 Audition Sample )      |   |  |
|  |  | [ Selected Checkmark + Glow ] |  | [ Click to Select ]           |   |  |
|  |  +-------------------------------+  +-------------------------------+   |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  Pacing Control: [ 0.8x Slow ] [ 1.0x Normal (Recommended) ] [ 1.2x Fast ] |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Live Audio Audition Visualizer**: Playing a voice sample triggers dynamic animated CSS waveform bars directly within the active voice card.
2. **Responsive Card Grid**: 1 column on mobile (`< 640px`), 2 columns on tablet (`sm:`), and 3 columns on desktop (`lg:`), preventing waveform clipping on small screens.
3. **Empty Filter State**: When search or filters match zero voices, renders `<EmptyState variant="bordered" size="sm">` with a "Reset Filters" action.
4. **Agnes AI Background Status**: A non-intrusive status pill confirms: *"✨ Agnes AI is preparing title suggestions & thumbnail concepts in the background..."*

---

## 7. Step 4: Details (Project Identity & AI Title Engine)

### Cognitive Purpose
Give the video a compelling, SEO-optimized title and thumbnail concept before synthesizing full audio.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Project Branding & Title"                                       |
|  Description: "Name your video project and review AI-crafted title suggestions"|
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  HERO TITLE INPUT                                                       |  |
|  |  Project Title (Required)                                               |  |
|  |  [ Dune: Prophecy of the Sand Riders__________________________ ] [ 36 ] |  |
|  |  💡 Helper: This title will appear on YouTube, TikTok, and social exports|  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  AGNES AI TITLE SUGGESTIONS (Stacked mobile, 2-col desktop)             |  |
|  |  +-----------------------------+  +-----------------------------+       |  |
|  |  | ✨ "Dune: Sandstorm Legend" |  | ✨ "Prophecy of Arrakis"    |       |  |
|  |  | Tone: Epic & Mysterious     |  | Tone: High-energy action    |       |  |
|  |  | Why: High CTR for Sci-Fi    |  | Why: Catchy short hook      |       |  |
|  |  | [ Use This Title ]          |  | [ Use This Title ]          |       |  |
|  |  +-----------------------------+  +-----------------------------+       |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Hero Title Field**: High-visibility `Input` primitive with live character count, quick-clear button, and contextual subtitle explaining where the title appears.
2. **AI Rationale Cards**: Suggestion cards explain *why* each title works (e.g. *Optimized for viral YouTube Shorts click-through*), with 1-click apply.
3. **Mobile Layout**: Suggestion cards stack vertically (`flex-col sm:grid sm:grid-cols-2`) so tags and rationale text never wrap into unreadable fragments.

---

## 8. Step 5: Preview (TTS Audio Synthesis & Verification)

### Cognitive Purpose
Verify the full audio narration quality, pacing, and tone in a studio-grade playback deck before spending video credits.

### 3-State Operational Architecture

```
State 1: IDLE (No audio synthesized yet)
+-------------------------------------------------------------------------------+
|  PageHeader: "Narration Audio Synthesis"                                      |
|  Description: "Generate and review your full voiceover audio narration"       |
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  READY TO SYNTHESIZE NARRATION                                          |  |
|  |  Voice: Marcus (Deep Epic) • 1.0x Rate • 248 words (~1m 38s)            |  |
|  |  [  🎙️ Generate Full Audio Preview (0 Video Credits Charged)  ]          |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+

State 2: PROCESSING (Queue & Synthesis in progress)
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  <LoadingSpinner message="Synthesizing narration audio..." />           |  |
|  |  Pulsating Waveform Skeleton Placeholder...                             |  |
|  |  Telemetry: Queued via RabbitMQ → Generating Audio Samples...           |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+

State 3: READY (Studio Audio Deck)
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  STUDIO AUDIO DECK                                                      |  |
|  |         (((( ılı.lıllılı.ıllı. Interactive Audio Waveform .ılıllı.lı ))))|  |
|  |                                                                         |  |
|  |       [ ⏪ 5s ]     [  ▶ / ❚❚  HERO PLAY (Indigo Glow)  ]     [ ⏩ 5s ]     |  |
|  |                                                                         |  |
|  |   01:14 ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 02:45        |  |
|  |   [ 🔊 Volume ]   [ Voice: Marcus ]   [ 1.0x ]   [ ↻ Re-synthesize ]    |  |
|  +-------------------------------------------------------------------------+  |
|  |  Cache Transparency: "✨ Audio reused from cache — 0 credits used"      |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Explicit State Handling**: Guarantees zero blank or broken player states by rendering clear `Idle`, `Processing`, and `Ready` views.
2. **Studio Audio Scrubber**: Precision waveform scrub bar showing elapsed/remaining duration, volume toggle, and skip controls.
3. **Smart Cache Transparency**: Visual badge informing the user when audio was matched from the content cache, saving cost and time.
4. **1-Click Step Jump**: Quick action to jump back to Voice or Script if pacing needs adjustment.

---

## 9. Step 6: Compose (Thumbnail Studio & Visual Assets)

### Cognitive Purpose
Design the video's hero cover image and headline text overlay with live WYSIWYG preview, keeping it separate from full video rendering.

```
Desktop Layout: Side-by-Side Live Studio (lg+)
+-------------------------------------------------------------------------------+
|  PageHeader: "Thumbnail Studio"                                               |
|  Description: "Customize your video cover art, text overlay, and typography"  |
+-------------------------------------------------------------------------------+
|  +----------------------------------+  +----------------------------------+  |
|  |  LIVE 16:9 CANVAS PREVIEW        |  |  CUSTOMIZATION CONTROLS          |  |
|  |  +----------------------------+  |  |  Headline Text Overlay:          |  |
|  |  |  [ AI Image Backdrop ]     |  |  |  [ THE PROPHET RISES___________] |  |
|  |  |                            |  |  |                                  |  |
|  |  |  "THE PROPHET RISES"       |  |  |  Typography Style:               |  |
|  |  |  (Cinematic Gold Font)     |  |  |  [ Bold Impact ] [ Modern Sans ] |  |
|  |  +----------------------------+  |  |                                  |  |
|  |  Aspect Ratio: 16:9 Landscape    |  |  Text Alignment: [Left] [Right] |  |
|  |  [ ↻ Regenerate AI Backdrop ]    |  |  [ 🎨 Color Presets: Gold/White ]|  |
|  +----------------------------------+  +----------------------------------+  |
+-------------------------------------------------------------------------------+

Mobile Layout: Stacked Preview & Controls (< lg)
+-------------------------------------------------------------------------------+
|  [ Full-Width 16:9 Canvas Preview: aspect-video w-full rounded-xl ]           |
|  +-------------------------------------------------------------------------+  |
|  |  Headline Text: [ THE PROPHET RISES___________________________ ]        |  |
|  |  Font Style Presets: [ Cinematic Gold ] [ Neon Cyan ] [ Minimal Clean ] |  |
|  |  [ ↻ Regenerate Backdrop ]                                              |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Responsive Split / Stack Canvas**: Side-by-side on desktop (`lg:grid lg:grid-cols-2 gap-6`) and stacked canvas-above-controls on mobile (`flex flex-col gap-4`), maintaining 16:9 `aspect-video` ratio without distortion.
2. **One-Click Typography Presets**: Quick styles (*Cinematic Gold*, *Neon Cyan*, *Minimalist Clean*, *Breaking News*).
3. **Regeneration Safeguard**: `<ConfirmModal>` before AI image regeneration to prevent accidental loss of customized text settings.

---

## 10. Step 7: Export (Video Rendering, Formats & Publishing)

### Cognitive Purpose
Render the final video, monitor job queue status, download production assets, and publish to multiple channels.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Export & Video Mastering"                                       |
|  Description: "Render your final video, download MP4s, or publish directly"  |
|  Account Balance: 12 Video Credits Available                                  |
+-------------------------------------------------------------------------------+
|  PRE-FLIGHT READINESS CHECKLIST                                               |
|  [ ✅ Source Movie: Dune ] [ ✅ Script: 248w ] [ ✅ Voice: Marcus ] [ ✅ Cover ]|
+-------------------------------------------------------------------------------+
|                                                                               |
|  RENDER STATE / CTA                                                           |
|  +-------------------------------------------------------------------------+  |
|  |  Credit Cost: 1 Credit  •  Est. Render Time: ~45 seconds                |  |
|  |  [  🎬 Start Video Generation (1 Credit) — Primary CTA  ]                |  |
|  |  (When Rendering: Progress Bar + Telemetry: Stitching → Encoding MP4)  |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  MASTER VIDEO SHOWCASE (When Render Complete)                                 |
|  +-------------------------------------------------------------------------+  |
|  |  [ 1080p Video Player with Fullscreen & Scrubbing Controls ]            |  |
|  |  Download: [ 📥 16:9 YouTube (1080p) ]  [ 📱 9:16 TikTok/Shorts (1080p) ] |  |
|  |  Share: [ <XIcon /> Share to X ]  [ <WeChatIcon /> Share to WeChat ]     |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Pre-flight Checklist**: Visual verification row confirming that script, voice, audio, and cover art are all ready before spending credits.
2. **Inline Credit Badge on CTA**: Prominent Indigo button clearly marked with `(1 Credit)` to prevent surprise charges.
3. **Granular Render Telemetry**: Live telemetry states (*In Queue* → *Stitching Video Clips* → *Overlaying Audio & Subtitles* → *Encoding MP4*).
4. **Mobile Responsive Download Stack**: Download buttons stack vertically as `w-full sm:w-auto` on mobile devices for easy single-tap downloading.

---

## 11. Cross-Step Micro-Animations & Ambient Visuals

| Interaction | Micro-Animation / Motion | Timing Token |
| :--- | :--- | :--- |
| **Active Step Change** | Scale `1.05` + glowing ring expand + background transition | `200ms ease-smooth` |
| **Voice Card Audition** | CSS keyframe animated equalizer bars (`bg-accent-primary`) | Looping (`1.2s`) |
| **Agnes AI Status** | Gentle opacity pulsation on status dot | Looping (`1.5s`) |
| **Poster Card Hover** | Border glow brighten + subtle `scale-[1.02]` elevation | `150ms transition-fast` |
| **Render Telemetry** | Smooth progress bar width interpolation | Realtime stream |
| **Revisit Summary Pill** | Slide down fade-in from top of canvas | `300ms ease-smooth` |

---

## 12. State Matrix Appendix

| Step | Idle State | Loading / Processing State | Ready / Success State | Error State |
| :--- | :--- | :--- | :--- | :--- |
| **1. Source** | Trending movies grid | Catalog skeleton shimmer | Selected movie hero card | `<EmptyState>` with search retry |
| **2. Script** | Script editor ready | Agnes script generator spinning | Script saved & validated | Validation error banner |
| **3. Voice** | Curated voices grid | Voice sample buffering spinner | Active voice with audio deck | Audio playback failed toast |
| **4. Details** | Title input ready | AI title suggestions loading | Selected title confirmed | Title required validation |
| **5. Preview** | "Generate Narration" CTA | Audio synthesis queue spinner | Studio audio player deck | TTS failed with retry button |
| **6. Compose** | Live canvas ready | AI backdrop regeneration | 16:9 cover preview with text | Regeneration failed alert |
| **7. Export** | Pre-flight checklist & CTA | Live rendering progress telemetry | Master video player & downloads | Render failed with refund notice |

---

## 13. Design System Primitives & Token Audit

### Primitive Usage Map

```
┌─────────────────────────┬──────────────────────────────────┬────────────────────────┐
│ UI Primitive            │ File Path                        │ Workflow Utilization   │
├─────────────────────────┼──────────────────────────────────┼────────────────────────┤
│ PageHeader              │ @/components/ui/PageHeader       │ All 7 Step Headers     │
│ Button                  │ @/components/ui/button           │ CTAs, Actions, Nav     │
│ Card                    │ @/components/ui/card             │ Content Panels & Grids │
│ Badge                   │ @/components/ui/badge            │ Status, Tags, Genres   │
│ Heading / Text          │ @/components/ui/heading, text    │ All Typography Roles   │
│ Input / TextArea        │ @/components/ui/input            │ Title & Search Inputs  │
│ Select                  │ @/components/ui/select           │ Filter Dropdowns       │
│ Spinner / LoadingSpinner│ @/components/ui/spinner          │ Telemetry & Waits      │
│ EmptyState              │ @/components/ui/EmptyState       │ Empty Search / Voices  │
│ ConfirmModal            │ @/components/ui/modal            │ Action Confirmations   │
│ ExternalImage           │ @/components/ui/ExternalImage    │ Movie Posters & Covers │
│ ContextDrawer           │ @/components/ui/context-drawer   │ Secondary step context │
│ Tooltip                 │ @/components/ui/tooltip          │ Stepper hover tooltips │
│ StepRevisitBanner       │ @/components/project/step-revisit-banner │ Completed-step resume │
└─────────────────────────┴──────────────────────────────────┴────────────────────────┘
```

---

## 14. Implementation Status & Checklist

### Phase 1: Global Shell & Floating Stepper
- [x] Update `ProjectShell` to integrate persistent ambient poster glow backdrop.
- [x] Refine `FloatingWorkflowNavigation` to support mobile touch density, phase indicators, and tooltips.
- [x] Add revisit summary pill for completed steps (`StepRevisitBanner`).

### Phase 2: Step 1 (Source) & Step 3 (Voice)
- [x] Modernize `SourcePage` with Pattern 1 poster grid (2-3-4-5-6 cols) and horizontal scrollable genre chips.
- [x] Upgrade `VoicePage` with responsive 1-2-3 col grid, animated waveform audition visualizers, and persona filter chips.

### Phase 3: Step 4 (Details) & Step 5 (Preview)
- [x] Upgrade `ProjectDetailsPage` with hero title field and stacked mobile AI suggestion cards.
- [x] Implement 3-state architecture in `PreviewPage` (Idle CTA → Processing Queue Telemetry → Studio Audio Deck).

### Phase 4: Step 6 (Compose) & Step 7 (Export)
- [x] Rebuild `ComposePage` with responsive split / stacked 16:9 thumbnail canvas and typography presets.
- [x] Upgrade `ExportPage` with pre-flight checklist, inline credit badge, live render telemetry, and responsive download buttons.
- [x] Validate with `pnpm format:check` and `pnpm build` (lint cleanup remains repo-wide).

### Known follow-ups
- Pre-flight checklist items 1–3 are informational UI today; only credits (#4) gates rendering.
- Session resume redirects via `last_step` (not a computed “furthest completed” walk).
- Step 2 Script remains intentionally unchanged.
- Voice persona filter chips match against voice name substrings (not structured persona metadata).

---

## 15. Single-Purpose Focus Delivery Notes

Second-pass redesign delivered **single-purpose focus per screen**, **session resumption with auto-toast**, and the **Export pre-flight checklist**. Canonical paths use relative repo links.

### Shared building blocks

| Piece | Path | Notes |
| :--- | :--- | :--- |
| Context drawer | `src/components/ui/context-drawer.tsx` | Slide-over sheet with backdrop blur, Escape close, body scroll lock, CSS enter animation. Import from `@/components/ui/context-drawer`. |
| Relative time | `src/lib/utils/time-format.ts` | `formatRelativeTimeAgo`, `formatSessionResumeMessage` (i18n-aware toast body). |
| Session resume landing | `src/app/project/[projectId]/page.tsx` | Loads project, shows session-restored toast, then `router.replace` to `last_step`. Project cards link here (`/project/{id}`), not directly to a step. |
| Session toast | `src/app/project/[projectId]/page.tsx` (+ shell fallback) | Toast fires on resume landing before redirect. Shell still honours `?resumed=true` deep links. |

### Per-step hero + contextual drawer

| Step | Hero (dominant decision) | Contextual drawer |
| :--- | :--- | :--- |
| **1. Source** | Confirmed movie showcase (1080p badge, rating, genres, continue). | Source Footage & Specs — stream integrity, TMDB ID, resolution, audio, synopsis. |
| **2. Script** | Unchanged (explicitly retained). | — |
| **3. Voice** | Voice talent selection with audition + selection highlight. | Voice Tuning & Script — pacing (0.5x–2.0x), script reference, Agnes status, custom voice limits. |
| **4. Details** | Hero title deck with counter + Agnes suggestion chips. | Project Context & Assets — film info, script, thumbnail concept. |
| **5. Preview** | Studio audio deck (waveform, play/pause, scrubber, mute, synthesize). | Mastering Telemetry & Script — queue telemetry, script, re-synthesis. |
| **6. Compose** | Live 16:9 cover canvas with overlay + regenerate/regenerate. | Canvas Styling Studio — typography presets (Cinematic Gold, Neon Cyan, Minimalist Clean, Breaking Red), layout, script. |
| **7. Export** | Master video delivery / render engine + **Pre-Flight Sanity Checklist**. | Pipeline Diagnostics & Logs — failed attempts, delete, target specs (1080p FHD, 16:9, H.264, AAC 48kHz). |

### Export pre-flight checklist (UI)

1. Source Footage Linked (`1080p source verified`)
2. Narrator Audio Ready (`0 missing segments`)
3. Captions Formatted (`No text overflow`)
4. Available User Credits (`1 Credit required | {count} available`) — **real gate** when balance is insufficient

Copy for drawers, heroes, session toast, and pre-flight labels lives under `public/locales/{en,chs}/project.json`.
