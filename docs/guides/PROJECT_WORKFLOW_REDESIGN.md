# Project Workflow UX & UI Redesign Specification

**Version:** 1.0  
**Target Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) v2.4  
**Scope:** `studio-web/src/app/project/[projectId]/*` and `@/components/project/*`  
**Status:** Design Proposal & UX Specification (Draft)

---

## Table of Contents

1. [Executive Vision & User Experience Goals](#1-executive-vision--user-experience-goals)
2. [Workflow Philosophy: The Creator Mental Model](#2-workflow-philosophy-the-creator-mental-model)
3. [Global Shell & Stepper Navigation Re-design](#3-global-shell--stepper-navigation-re-design)
4. [Step 1: Source (Movie Discovery & Selection)](#4-step-1-source-movie-discovery--selection)
5. [Step 2: Script (AI Storyboard & Narration Editor)](#5-step-2-script-ai-storyboard--narration-editor)
6. [Step 3: Voice (Vocal Persona & Speech Dynamics)](#6-step-3-voice-vocal-persona--speech-dynamics)
7. [Step 4: Details (Project Identity & AI Title Engine)](#7-step-4-details-project-identity--ai-title-engine)
8. [Step 5: Preview (TTS Audio Synthesis & Verification)](#8-step-5-preview-tts-audio-synthesis--verification)
9. [Step 6: Compose (Thumbnail Studio & Visual Assets)](#9-step-6-compose-thumbnail-studio--visual-assets)
10. [Step 7: Export (Video Rendering, Formats & Publishing)](#10-step-7-export-video-rendering-formats--publishing)
11. [Design System Primitives & Token Audit](#11-design-system-primitives--token-audit)
12. [Implementation Roadmap & Migration Checklist](#12-implementation-roadmap--migration-checklist)

---

## 1. Executive Vision & User Experience Goals

Huavoi Studio turns movie trailers and catalogs into rich, AI-narrated short-form and long-form video content. To empower first-time creators while maintaining high efficiency for power users, the project creation workflow must feel like a **collaborative creative studio** rather than a multi-step database form.

### Core UX Objectives

1. **Clarity of Purpose at Every Step**: Every step answers three questions instantly:
   - *Where am I?* (Current phase & context)
   - *What do I need to decide?* (Single focused primary decision)
   - *Why does this matter for my final video?* (Direct preview of impact)
2. **Zero-Friction Starting Path**: Provide smart defaults and AI-assisted automation (Agnes AI) so a new user can progress from movie selection to final video in under 3 minutes.
3. **Continuous Visual & Audio Feedback**: Eliminate "black-box" loading states. Use lively waveforms, audio visualizers, live thumbnail compositing, and animated progress telemetry.
4. **Strict Design System Alignment**: Eliminate all ad-hoc styling, raw inputs, arbitrary hex codes, and non-token typography in favor of the role-based design system in `DESIGN_SYSTEM.md`.

---

## 2. Workflow Philosophy: The Creator Mental Model

The 7-step workflow maps to three creative phases:

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
| **3. Voice** | Pick the ideal vocal persona for the narration. | Instant audition of tone; calibrated speech rate. | **Background Agnes AI**: kicks off AI title suggestions & base thumbnail. |
| **4. Details** | Brand the project with a high-impact title. | Engaging title selected from AI options or typed. | Pre-fetches thumbnail generation status. |
| **5. Preview** | Listen to full script synthesized with voice. | Studio-quality audio review with zero video credit burn. | Smart cache matching (avoids duplicate TTS costs). |
| **6. Compose** | Design the thumbnail and headline overlay. | Eye-catching 16:9 cover image with text styling. | Pillow/PIL server-side graphic compositing. |
| **7. Export** | Render video, choose formats, and publish. | Multi-format download (1080p, 9:16 Shorts/TikTok) and social sharing. | RabbitMQ video rendering pipeline & webhook telemetry. |

---

## 3. Global Shell & Stepper Navigation Re-design

### Structural Layout

The studio workflow layout features a top persistent bar with project metadata, an uncluttered main creative viewport, and a glassmorphic floating dock navigation bar.

```
+-----------------------------------------------------------------------------------+
| [Drawer] [← Back to Projects]  Project: "Shadows of Dune" [Active: Step 3] Credits: 12 (Bell)|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                                                                                   |
|                           PRIMARY WORKSPACE CANVAS                                |
|                                                                                   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|    [← Prev Step]     ① Source ━ ② Script ━ ❸ Voice ━ ④ Details ━ ⑤ ━ ⑥ ━ ⑦     [Next: Details →]   |
+-----------------------------------------------------------------------------------+
```

### Floating Workflow Dock Specification

- **Container**: `fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-5xl w-[calc(100%-2rem)]`
- **Surface**: `bg-surface-panel/90 backdrop-blur-2xl border border-border-strong shadow-2xl rounded-2xl p-2 sm:px-6 sm:py-3`
- **Step Track**:
  - Completed: `bg-accent-cyan text-surface-base font-semibold` with `<Check className="h-3 w-3" strokeWidth={3} />`
  - Active: `bg-accent-primary text-white ring-4 ring-accent-primary/25 shadow-glow`
  - Upcoming: `bg-surface-raised border border-border-default text-text-muted`
- **Buttons**:
  - Back: `<Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>`
  - Next / Continue: `<Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>` (Prominent Indigo CTA)
- **Responsive Behavior**: Mobile shrinks labels and keeps step dots interactive with micro-haptic feedback.

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
|  Genre Filter Chips: [All] [Action] [Sci-Fi] [Drama] [Horror] [Animation]     |
+-------------------------------------------------------------------------------+
|  +----------------+  +----------------+  +----------------+  +----------------+  |
|  | [Poster] 2:3   |  | [Poster] 2:3   |  | [Poster] 2:3   |  | [Poster] 2:3   |  |
|  | ★ 8.4 • 2024   |  | ★ 7.9 • 2023   |  | ★ 9.0 • 2024   |  | ★ 8.1 • 2022   |  |
|  | Title          |  | Title          |  | Title (Selected|  | Title          |  |
|  | [Action][SciFi]|  | [Drama]        |  | [Glowing Ring] |  | [Thriller]     |  |
|  +----------------+  +----------------+  +----------------+  +----------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Curated & Popular Quick Start**: If user hasn't typed a query, show trending/popular movies with crisp TMDB posters instead of an empty search screen.
2. **Interactive Hover Preview**: Hovering a movie card expands a quick synopsis overlay with trailer duration and genres.
3. **Selected Movie Confirmation Hero**: Once selected, the page transitions into a clean confirmation card featuring a blurred ambient glow of the movie poster (`bg-cover filter blur-3xl opacity-15`) with full metadata breakdown.
4. **Seamless Switching**: One-click "Change Movie" button with confirmation safeguard so users never lose progress unintentionally.

---

## 5. Step 2: Script (AI Storyboard & Narration Editor)

### Cognitive Purpose
Empower creators to produce, refine, and time-estimate their video narration with AI assistance or manual craftsmanship.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Script & Narration"                                             |
|  Description: "Write or generate the spoken story for your video summary"      |
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  | Movie Context Pill: [Poster 32px] Dune: Part Two • 2h 46m • Action/Sci-Fi|  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | SCRIPT STUDIO                                                           |  |
|  | [ ✨ AI Generate ] [ ↻ Rephrase ] [ ⏱️ Add Pause ]    [ 🗎 Versions (3) ] |  |
|  | ----------------------------------------------------------------------- |  |
|  | In a universe of spice and sand, one prophet rises to challenge an       |  |
|  | empire. Paul Atreides unites with the Fremen to wage an all-out war...  |  |
|  |                                                                         |  |
|  | ----------------------------------------------------------------------- |  |
|  | 📊 Stats: 248 words  •  ⏱️ ~1m 38s speech  •  🟢 Ready for Narration    |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Script Studio Canvas**: Replace raw `<textarea>` with an editor container (`bg-surface-panel`) using `Geist Mono` or high-legibility body font with auto-expanding line height.
2. **Live Speech Time Meter**: Dynamic calculation (`words / 150 * 60`) displayed as a real-time progress gauge with standard video target length cues (e.g., *Ideal for 60s Shorts: 130–160 words*).
3. **One-Click Tone Switching**: Allow AI re-generation with presets:
   - *Dramatic & Cinematic* (Epic trailer voice)
   - *Fast-paced Recap* (TikTok / YouTube Shorts style)
   - *Analytical & Documentary* (Film essay style)
4. **Version History Drawer**: Visual sidebar to restore previous drafts with word-count and timestamp diffs.

---

## 6. Step 3: Voice (Vocal Persona & Speech Dynamics)

### Cognitive Purpose
Enable users to audition and select the exact voice persona that matches their script's mood, while automatically starting background AI asset creation.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Voice Persona"                                                  |
|  Description: "Audition and assign the voice actor for your project narration"|
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  Tabs: [ My Custom Voices (2) ]  [ Curated Voices (36) ]   [ + Record ] |  |
|  |  Filter: [All Genders] [Dramatic] [Deep] [Energetic] [Storyteller]      |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  VOICE AUDITION GRID (Pattern 2 - Responsive 1-2-3 cols)                |  |
|  |  +-------------------------------+  +-------------------------------+   |  |
|  |  | [▶ Play] Marcus - Deep Epic   |  | [❚❚ Pause] Evelyn - Cinematic |   |  |
|  |  | Male • Deep & Resonant        |  | Female • Warm Storyteller     |   |  |
|  |  | ( ılıı Waveform Playing... )   |  | ( Static Sample 0:08 )        |   |  |
|  |  | [ Selected Checkmark + Glow ] |  | [ Click to Select ]           |   |  |
|  |  +-------------------------------+  +-------------------------------+   |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  Pacing & Dynamic Control:                                              |  |
|  |  Speech Rate: [ 0.8x Slow ] [ 1.0x Normal (Recommended) ] [ 1.2x Fast ] |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Live Audio Audition Visualizer**: When playing a voice sample, display a mini animated CSS audio waveform (`accent-primary` / `accent-cyan`) directly inside the voice card.
2. **Persona Tags**: Categorize voices with rich badges: `Deep`, `Warm`, `Fast-Paced`, `British Accent`, `Epic Trailer`.
3. **Background Agnes AI Pipeline Trigger**: Explicit user notification toast / subtle status pill: *"Agnes AI is preparing title suggestions & thumbnail concepts in the background..."*
4. **Segmented Speed Controls**: Clean pill controls (`0.8x`, `1.0x`, `1.2x`, `1.5x`) paired with precision fine-tuning slider.

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
|  |  ✨ AI Suggestion auto-applied • Edit anytime                           |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  AGNES AI TITLE SUGGESTIONS                                             |  |
|  |  +-----------------------------+  +-----------------------------+       |  |
|  |  | ✨ "Dune: Sandstorm Legend" |  | ✨ "Prophecy of Arrakis"    |       |  |
|  |  | Tone: Epic & Mysterious     |  | Tone: High-energy action    |       |  |
|  |  | [Click to Apply]            |  | [Click to Apply]            |       |  |
|  |  +-----------------------------+  +-----------------------------+       |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  AI Base Thumbnail Status:  [ Image Ready ✨ ]  (Customizable in Step 6)|  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Hero Title Field**: High-visibility input box with character counter, instant validation badge, and quick-clear action.
2. **AI Suggestion Cards with Rationale**: Suggestions presented as interactive glass cards explaining *why* the title works (e.g. *Optimized for viral YouTube Shorts click-through*).
3. **Thumbnail Generation Progress Card**: Visual status indicating that the AI artwork is ready or rendering, creating anticipation for Step 6.

---

## 8. Step 5: Preview (TTS Audio Synthesis & Verification)

### Cognitive Purpose
Verify the full audio narration quality, pacing, and tone in a studio-grade playback deck before spending video credits.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Narration Audio Deck"                                           |
|  Description: "Listen to your complete AI voiceover narration before video render"|
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  STUDIO AUDIO PLAYER                                                    |  |
|  |                                                                         |  |
|  |         (((( ılı.lıllılı.ıllı. Audio Waveform Display .ılıllı.lı ))))    |  |
|  |                                                                         |  |
|  |       [ ⏪ 5s ]     [  ▶ / ❚❚  HERO PLAY (Indigo Glow)  ]     [ ⏩ 5s ]     |  |
|  |                                                                         |  |
|  |   01:14 ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 02:45        |  |
|  |   [ 🔊 Volume ]   [ Voice: Marcus (Deep) ]   [ Rate: 1.0x ]  [ ↻ Retry ] |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  Job Telemetry: #TTS-8921 • Cache Hit (No Credit Cost) • 192kbps MP3    |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +----------------------------------+  +----------------------------------+  |
|  | Project Details Pill             |  | Spoken Script Preview            |  |
|  | Title, Movie, Voice Model        |  | Synchronized text snippet        |  |
|  +----------------------------------+  +----------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Studio-Grade Deck**: High-contrast glassmorphic audio deck with ambient glowing play button (`from-accent-primary to-accent-secondary shadow-glow-hover`).
2. **Interactive Audio Scrubber**: Precision waveform scrub bar showing elapsed / remaining duration and volume slider.
3. **Smart Cache Transparency**: Clear badge informing user: *"Cached audio matched — 0 credits charged."*
4. **Immediate Revision Action**: If pacing or voice isn't perfect, a 1-click "Change Voice or Script" button jumps back with zero friction.

---

## 9. Step 6: Compose (Thumbnail Studio & Visual Assets)

### Cognitive Purpose
Design the video's hero cover image and headline text overlay with live WYSIWYG preview, keeping it separate from full video rendering.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Thumbnail Studio"                                               |
|  Description: "Customize your video cover art, text overlay, and visual typography"|
+-------------------------------------------------------------------------------+
|  +----------------------------------+  +----------------------------------+  |
|  |  LIVE 16:9 CANVAS PREVIEW        |  |  CUSTOMIZATION CONTROLS          |  |
|  |  +----------------------------+  |  |  Headline Text Overlay:          |  |
|  |  |  [ AI Image Backdrop ]     |  |  |  [ THE PROPHET RISES___________] |  |
|  |  |                            |  |  |                                  |  |
|  |  |  "THE PROPHET RISES"       |  |  |  Typography Style:               |  |
|  |  |  (Cinematic Gold Font)     |  |  |  [ Bold Impact ] [ Modern Sans ] |  |
|  |  +----------------------------+  |  |                                  |  |
|  |  Status: [ ✨ AI Generated ]      |  |  Text Alignment: [Left] [Right] |  |
|  |  [ ↻ Regenerate AI Backdrop ]    |  |  [ 🎨 Color Presets: Gold/White ]|  |
|  +----------------------------------+  +----------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Side-by-Side Visual Studio**: Live 16:9 canvas on the left updates in real time as the user types or adjusts controls on the right.
2. **Overlay Presets**: Quick one-click styles (*Cinematic Gold*, *Neon Cyberpunk*, *Minimalist Clean*, *Breaking News*).
3. **Explicit Scope Separation**: Clear banner stating: *"Thumbnail customization is free and unmetered. Video generation happens in Step 7."*
4. **Regeneration Safeguard**: `<ConfirmModal>` before AI image regeneration to prevent accidental loss of text settings.

---

## 10. Step 7: Export (Video Rendering, Formats & Publishing)

### Cognitive Purpose
Render the final video, monitor job queue status, download production assets, and publish to multiple channels.

```
+-------------------------------------------------------------------------------+
|  PageHeader: "Export & Video Mastering"                                       |
|  Description: "Render your final video, download MP4s, or publish directly"  |
|  Account Credits: 12 Available                                                |
+-------------------------------------------------------------------------------+
|  +-------------------------------------------------------------------------+  |
|  |  MASTER VIDEO SHOWCASE (When Render Complete)                           |  |
|  |  +-------------------------------------------------------------------+  |  |
|  |  |  [ Full 1080p Video Player with Custom Transport Controls ]       |  |  |
|  |  +-------------------------------------------------------------------+  |  |
|  |  Active Version: [ Version 2 (Latest) ]  [ Version 1 ]                  |  |
|  |  Actions: [ 📥 Download MP4 ]  [ 📱 Mobile Formats ]  [ ↗ Share ]       |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  RENDER QUEUE & RENDER CTA (When No Video or Rendering)                 |  |
|  |  Credit Cost: 1 Credit  •  Est. Time: ~45 seconds                       |  |
|  |  [  🎬 Start Video Generation (Primary CTA)  ]                           |  |
|  |  (Live Telemetry: Queued → Composing Audio & Video → Finalizing MP4)   |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |  Export Formats: [ 16:9 YouTube/Vimeo ]  [ 9:16 TikTok/Reels/Shorts ]   |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Key UX Enhancements
1. **Transparent Credit Confirmation**: Clear `<CreditUsageIndicator>` showing remaining credits and exact deduction before job submission.
2. **Granular Render Telemetry**: Show step-by-step progress (*Queue Position* → *Stitching Video Clips* → *Overlaying Audio & Subtitles* → *Encoding MP4*).
3. **Multi-Format Export Modal**: Provide aspect ratio and resolution presets (1080p 16:9 Landscape, 1080x1920 9:16 Portrait for Shorts/TikTok).
4. **One-Click Sharing Hub**: Native integration with `XIcon` and `WeChatIcon` with 1-click clipboard copy.

---

## 11. Design System Primitives & Token Audit

### Component Primitive Usage Map

```
┌─────────────────────────┬──────────────────────────────────┬────────────────────────┐
│ UI Primitive            │ File Path                        │ Workflow Utilization   │
├─────────────────────────┼──────────────────────────────────┼────────────────────────┤
│ PageHeader              │ @/components/ui/PageHeader       │ All 7 Step Headers     │
│ Button                  │ @/components/ui/button           │ CTAs, Actions, Nav     │
│ Card                    │ @/components/ui/card             │ Content Panels & Grids │
│ Badge                   │ @/components/ui/badge            │ Status, Tags, Genres   │
│ Heading / Text          │ @/components/ui/heading, text    │ All Typography Roles   │
│ Input / TextArea        │ @/components/ui/input            │ Title & Script Editors │
│ Select                  │ @/components/ui/select           │ Filter Dropdowns       │
│ Spinner / LoadingSpinner│ @/components/ui/spinner          │ Telemetry & Waits      │
│ EmptyState              │ @/components/ui/EmptyState       │ Empty Search / Voices  │
│ ConfirmModal            │ @/components/ui/modal            │ Action Confirmations   │
│ ExternalImage           │ @/components/ui/ExternalImage    │ Movie Posters & Covers │
└─────────────────────────┴──────────────────────────────────┴────────────────────────┘
```

### Token Reference Table

| Category | Token | Usage in Workflow |
| :--- | :--- | :--- |
| **Surface Base** | `--surface-base` (`#0a0e17`) | Main viewport background |
| **Surface Panel** | `--surface-panel` (`#0f1419`) | Editor canvases, audio player decks |
| **Surface Raised** | `--surface-raised` (`#161b22`) | Cards, dialogs, dropdowns |
| **Primary Accent** | `--accent-primary` (`#6366f1`) | Primary CTAs, active step highlights |
| **Cyan Accent** | `--accent-cyan` (`#06b6d4`) | Completed markers, step badges, tags |
| **Status Tokens** | `--status-success`, `--status-processing`, `--status-error` | Render telemetry, credit balance |
| **Typography** | `page` (20-22px), `section` (16px), `subsection` (14px), `body` (14px), `caption` (12px), `metric` (18px) | Role-based hierarchy across all steps |

---

## 12. Implementation Roadmap & Migration Checklist

### Phase 1: Global Chrome & Stepper Architecture
- [ ] Refactor `ProjectShell` to use role-based `<Heading variant="page">` and status `<Badge>`.
- [ ] Upgrade `FloatingWorkflowNavigation` to glassmorphic floating pill container with step tooltips.
- [ ] Ensure full responsive compliance across 320px, 640px, 768px, and 1024px breakpoints.

### Phase 2: Concept Phase (Steps 1 & 2)
- [ ] Refactor `SourcePage` & `MovieSelection` to use `<PageHeader>`, poster ambient backdrops, and genre filter chips.
- [ ] Re-engineer `ScriptPage` with `ScriptStudio` container, live speech duration ticker, and version drawer.

### Phase 3: Production Phase (Steps 3, 4 & 5)
- [ ] Standardize `VoicePage` with audio visualizer micro-animations, persona tags, and segmented speed controls.
- [ ] Modernize `ProjectDetailsPage` with hero title input, AI rationale cards, and Agnes background status.
- [ ] Rebuild `PreviewPage` with studio audio deck, waveform scrubber, and cache transparency indicators.

### Phase 4: Mastering Phase (Steps 6 & 7)
- [ ] Rebuild `ComposePage` into a split-screen live 16:9 Thumbnail Studio with typography presets.
- [ ] Overhaul `ExportPage` with video showcase deck, granular render telemetry, and format presets.
- [ ] Run `pnpm lint` and `pnpm format:check` to ensure full compliance.
