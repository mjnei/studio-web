# 4-Step Project Creation Workflow

**Last Updated:** June 20, 2026 | **Status:** ✅ Production Ready | **Build Status:** ✅ Passing

---

## Overview

A 4-step integrated workflow for creating video projects. Each step can be revisited, and all progress is saved automatically.

```
Step 1: Movie Selection → Step 2: Script Generation → Step 3: Voice Generation → Step 4: Video Composition
```

**Key Features:**
- ✅ Persistent state (survives browser close)
- ✅ Non-linear navigation (revisit any step)
- ✅ Multiple script versions
- ✅ Async operations (TTS & video generation)
- ✅ Mobile responsive & accessible
- ✅ Exit and resume anytime

---

## Quick Reference

| Route | Step | Purpose | Completion Check |
|-------|------|---------|-------------------|
| `/project/[id]/source` | 1 | Select movie | `movieId` set |
| `/project/[id]/script` | 2 | Generate/edit script (multiple versions) | `scripts.length > 0` |
| `/project/[id]/voice` | 3 | Generate voice audio (async TTS) | `audioUrl` set |
| `/project/[id]/compose` | 4 | Generate video (multi-step async) | `videoUrl` set |

---

## State Management

### ProjectState Interface

```typescript
interface ProjectState {
  id: string;
  title?: string;
  status: "draft" | "in-progress" | "completed";
  lastStep: "source" | "script" | "voice" | "compose";
  
  // Step 1: Movie
  movieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  movieGenre?: string;
  movieRating?: number;
  
  // Step 2: Multiple Script Versions
  scripts: ScriptVersion[];
  activeScriptId?: string;
  
  // Step 3: Voice
  voiceId?: string;
  voiceName?: string;
  audioUrl?: string;
  audioDuration?: number;
  
  // Step 4: Video
  videoUrl?: string;
  videoStatus?: "idle" | "queued" | "processing" | "completed" | "failed";
  videoProgress?: number;
  videoJobId?: string;
  isRendering?: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface ScriptVersion {
  id: string;
  content: string;
  createdAt: string;
  wordCount: number;
  duration: number;
  isActive: boolean;
}
```

### Using useProjectState Hook

```typescript
const {
  state,                    // Current project state
  isLoading,               // Loading indicator
  activeScript,            // Currently active script
  updateMovie,             // (movieId, title, poster, genre, rating)
  addScript,               // (content, wordCount, duration)
  setActiveScript,         // (scriptId)
  deleteScript,            // (scriptId)
  updateVoice,             // (voiceId, name, audioUrl, duration)
  updateVideoStatus,       // (status, progress, jobId)
} = useProjectState(projectId);
```

### Step Completion Logic

```typescript
const isStepComplete = {
  source: !!state.movieId,
  script: state.scripts.length > 0,
  voice: !!state.audioUrl,
  compose: !!state.videoUrl,
};
```

---

## Workflow Details

### Step 1: Movie Selection

**Route:** `/project/[projectId]/source`

- Grid display of movies with search
- Click to select, auto-saves
- Visual selection indicator
- "Continue to Script" appears after selection
- Can exit and return anytime

### Step 2: Script Generation

**Route:** `/project/[projectId]/script`

- AI-powered generation
- Edit mode (creates new version automatically)
- Regenerate (creates new version, preserves originals)
- Switch between versions with version switcher
- Delete unwanted versions
- Stats: word count, estimated duration

**Version Workflow:**
```
Generate → v1 (active)
Edit → v2 (v1 preserved)
Regenerate → v3 (v1, v2 preserved)
Switch versions → Activate different version
```

### Step 3: Voice Generation

**Route:** `/project/[projectId]/voice`

- Voice profile selection grid
- Async TTS generation with progress bar (0-100%)
- Audio player with play/pause/download
- Can exit during processing and return later
- Progress and result persist
- Regenerate with different voice

### Step 4: Video Composition

**Route:** `/project/[projectId]/compose`

- Project summary (movie, script, voice info)
- Multi-step async video generation (4 steps)
- Real-time progress tracking with step indicators
- Can exit during rendering
- Video preview when complete
- Download & publish options

**Generation Steps:**
1. Analyzing audio (preprocessing)
2. Syncing with visuals (alignment)
3. Rendering video (compositing)
4. Finalizing output (encoding)

---

## API Integration

### Step 1: Movies
```
GET /api/movies
GET /api/movies/search?q={query}
```

### Step 2: Script Generation
```
POST /api/scripts/generate
Body: { movieId, tone?, length? }
Response: { id, content, wordCount, duration }
```

### Step 3: Voice (Async)
```
GET /api/voices
POST /api/tts/generate
Body: { script, voiceId }
Response: { jobId, status }

GET /api/tts/status/{jobId}
Response: { status, progress, audioUrl?, duration? }
```

### Step 4: Video (Async)
```
POST /api/videos/generate
Body: { movieId, audioUrl, scriptId }
Response: { jobId, status }

GET /api/videos/status/{jobId}
Response: {
  status, progress, currentStep,
  steps: [{ name, status, progress }],
  videoUrl?
}
```

---

## Implementation Guide

### For New Developers

1. **Understanding State:** Read the `useProjectState` hook in `/src/lib/hooks/use-project-state.ts`
2. **Building a Step:** Follow the pattern in existing step pages (`/src/app/project/[projectId]/*/page.tsx`)
3. **Connecting APIs:** Replace mock delays in hooks with real API calls
4. **Testing State:** Use browser DevTools to inspect `localStorage['huavoi_project_{projectId}']`

### File Structure
```
/src/
  app/project/
    new/page.tsx                    # Redirect to first step
    [projectId]/
      source/page.tsx              # Step 1
      script/page.tsx              # Step 2
      voice/page.tsx               # Step 3
      compose/page.tsx             # Step 4
  lib/hooks/
    use-project-state.ts           # State management
  components/project/
    project-shell.tsx              # Wrapper with nav
    workflow-navigation.tsx        # Reusable nav component
```

---

## Testing Checklist

### State Persistence
- [ ] Create project, select movie, refresh → movie still selected
- [ ] Generate multiple scripts, switch between → all versions preserved
- [ ] Exit during TTS/video, return → progress/result maintained

### Script Versioning
- [ ] Generate script → v1 created
- [ ] Edit and save → v2 created
- [ ] Regenerate → v3 created
- [ ] Switch between versions → active script updates
- [ ] Delete version → removed from list

### Navigation
- [ ] Step 1 always accessible
- [ ] Step 2 disabled until movie selected
- [ ] Step 3 disabled until script generated
- [ ] Step 4 disabled until voice generated
- [ ] Can revisit completed steps
- [ ] Back/Next buttons work correctly

### Async Operations
- [ ] TTS shows progress (0-100%)
- [ ] Video shows step-by-step progress (1/4, 2/4, etc.)
- [ ] Can exit during generation
- [ ] Status persists across page refresh

### Mobile & Accessibility
- [ ] Works on mobile (responsive layout)
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] Touch targets ≥ 44x44px

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| State lost on refresh | localStorage disabled/full | Enable localStorage, check quota |
| Script not saving | API timeout | Retry generation, check network |
| TTS stuck at X% | API not responding | Exit and return, or restart |
| Video generation fails | Missing prerequisites | Ensure all steps complete |

---

## User Journey Examples

### Single Session (Quick)
```
1. Create project
2. Select movie (Inception)
3. Generate script
4. Generate voice (Morgan Freeman)
5. Generate video
6. Download
Time: ~10 minutes
```

### Multi-Session (Real-World)
```
Day 1: Select movie, generate script v1 & v2, exit
Day 2: Return, review scripts, start TTS
Day 3: Return, TTS complete, start video rendering
Day 4: Return, video complete, download

Time: 4 days, fully interruptible
```

---

## Performance & Optimization

- **Lazy Loading:** Step components loaded on demand
- **Image Optimization:** Next.js Image component for posters
- **Caching:** Movie list & voice profiles cached locally
- **Debouncing:** Search input with 300ms debounce
- **Code Splitting:** Separate bundle per step

---

## Accessibility (WCAG AA)

- Semantic HTML with proper heading hierarchy
- Keyboard navigation throughout (Tab, Enter, Arrow keys)
- ARIA labels on controls and progress indicators
- High contrast ratios (4.5:1 min)
- Focus indicators on all interactive elements
- Status announcements for async operations
- Minimum 44x44px touch targets
- Readable text (≥16px)

---

## Future Enhancements

- Multiple voice actors in same video
- Background music selection
- Custom video templates
- Advanced editing (trim, crop, effects)
- Batch project creation
- Collaborative editing
- A/B testing for scripts

---

## Related Documentation

- **UI Design:** See `/docs/guides/NEW_PROJECT_UI_DESIGN.md`
- **Quick Reference:** See `/docs/reference/WORKFLOW_QUICK_REFERENCE.md`
- **Component Examples:** See `/docs/guides/COMPONENT_EXAMPLES.md`
- **Implementation Details:** See `/docs/implementation/WORKFLOW_INTEGRATION_CURRENT.md`

---

**Version:** 1.0 | **Audience:** Users & Developers
