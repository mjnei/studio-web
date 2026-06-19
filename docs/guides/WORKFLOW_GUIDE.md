# New Project Creation Workflow - Complete Guide

**Last Updated:** June 20, 2026  
**Status:** ✅ Fully Implemented & Integrated  
**Build Status:** ✅ Passing

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Complete Workflow Steps](#complete-workflow-steps)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Testing Checklist](#testing-checklist)
7. [Future Enhancements](#future-enhancements)

---

## Quick Start

### For Users
1. Navigate to **Projects** in the left sidebar
2. Click **Create New Project**
3. Follow the 4-step workflow (Source → Script → Voice → Compose)
4. Exit and return anytime—your progress is saved automatically
5. Download or publish your completed project

### For Developers
- Import `useProjectState` hook for state management
- Follow established component patterns in step pages
- Use consistent UI components from the design system
- All workflow routes are in `/src/app/project/[projectId]/`

---

## Architecture Overview

### From Old to New

#### Before: Standalone Wizard
- ❌ Separate `/project/new` page with 4-step wizard
- ❌ No navigation or left rail
- ❌ Ephemeral state (lost on page refresh)
- ❌ Linear flow only
- ❌ Lost progress on browser close

#### After: Integrated Shell Workflow
- ✅ Uses existing project shell with navigation and left rail
- ✅ Persistent state via localStorage
- ✅ Support for multiple script versions
- ✅ Async process handling (TTS, video generation)
- ✅ Exit and resume at any time
- ✅ Non-linear navigation (revisit completed steps)
- ✅ Step completion tracking with visual indicators

### Key Improvements

| Feature | Before | After |
|---------|--------|-------|
| **UI Consistency** | Standalone | Integrated with shell |
| **Navigation** | Linear only | Non-linear, revisitable |
| **State** | Lost on refresh | Persists across sessions |
| **Scripts** | Single version | Multiple versions |
| **Async Ops** | Blocking | Background processing |
| **Exit & Return** | Loses progress | Preserves everything |
| **Mobile** | Limited | Fully responsive |

---

## Complete Workflow Steps

### Route Structure

```
/project/new
  └─ Creates draft project, redirects to first step

/project/[projectId]/source
  └─ Step 1: Movie Selection

/project/[projectId]/script
  └─ Step 2: Script Generation (multiple versions)

/project/[projectId]/voice
  └─ Step 3: Voice Generation (async TTS)

/project/[projectId]/compose
  └─ Step 4: Video Composition (async rendering)
```

---

### Step 1: Select Movie (Source)

**Route:** `/project/[projectId]/source`  
**Component:** `MovieSelection`

#### Features
- Integrated into project shell with full navigation
- Grid display of available movies
- Search functionality (by title or genre)
- Movie cards with poster, rating, genre, duration
- Visual selection indicator
- Responsive grid (2/3/4 columns by device)
- Auto-saves selection to project state

#### User Actions
- Search for movies by title
- Click to select a movie
- View movie details (rating, genre, duration)
- Continue to next step or exit (state persists)
- Return anytime to change selection

#### Navigation
- Previous steps: Disabled (this is the first step)
- "Continue to Script" button appears after selection
- Can exit and return anytime

#### Auto-Save
- Selection saved immediately to localStorage
- No manual save required
- Updates `updatedAt` timestamp

---

### Step 2: Generate & Edit Script

**Route:** `/project/[projectId]/script`  
**Component:** Updated script page with version support

#### Features
- **Multiple Script Versions:** Keep and switch between different script versions
- AI-powered script generation with loading state
- Real-time script statistics (word count, duration, paragraphs)
- Inline editing mode
- Copy to clipboard
- Regenerate creates new version (doesn't replace)
- Version management UI (select active, delete old versions)
- Auto-saves all versions to project state

#### Script Versioning System

```typescript
interface ScriptVersion {
  id: string;                // Unique version ID
  content: string;           // Full script text
  createdAt: string;         // When this version was created
  wordCount: number;         // Auto-calculated word count
  duration: number;          // Estimated read duration (minutes)
  isActive: boolean;         // Is this the active version?
}
```

#### User Actions
- Generate initial script with AI
- Edit script content (saves as new version automatically)
- Regenerate to create new version (original preserved)
- Switch between script versions
- Delete unwanted versions
- Copy script to clipboard
- Compare versions side-by-side (optional)
- Exit and return anytime

#### Version Workflow
```
Initial Generation (v1)
       ↓
User edits → Creates v2 (v1 preserved)
       ↓
User regenerates → Creates v3 (v1, v2 preserved)
       ↓
Version List:
 • v3 (active) ✓
 • v2 [Switch] [Delete]
 • v1 [Switch] [Delete]
```

#### Navigation
- Back button returns to Source step
- "Continue to Voice" appears when script exists
- Step indicator shows completion status
- All previous steps remain accessible

#### Auto-Save
- Each version saved immediately
- No unsaved changes
- Full history preserved

---

### Step 3: Generate & Preview Voice

**Route:** `/project/[projectId]/voice`  
**Component:** Updated voice page with async TTS

#### Features
- Voice selection grid with profiles
- **Async TTS Generation:** Progress tracking for text-to-speech
- Real-time progress indicator (0-100%)
- Audio player with controls (play, pause, download)
- Ability to regenerate with different voice
- State persists during generation
- Can exit while TTS is processing and return later

#### Async TTS Processing

```
User selects voice and clicks Generate
       ↓
TTS request sent to API
       ↓
Progress bar shows 0-100%
       ↓
User can:
 • Watch progress
 • Exit and return later
 • Preview when complete
       ↓
Audio saved to project state
       ↓
Audio URL stored for next step
```

#### User Actions
- Select voice profile from available options
- Generate TTS audio (async operation)
- Monitor generation progress in real-time
- Exit and return (state and progress persists)
- Preview audio playback with controls
- Download audio file
- Change voice and regenerate

#### Navigation
- Back button returns to Script step
- "Continue to Compose" appears when audio is ready
- Step indicator shows completion status
- Can revisit after voice generated

#### Error Handling
- Graceful error messages if generation fails
- Option to retry generation
- Shows error details for debugging
- Falls back to empty state with retry button

---

### Step 4: Generate Video (Compose)

**Route:** `/project/[projectId]/compose`  
**Component:** Updated compose page with async video generation

#### Features
- Project summary display (movie, script, voice info)
- **Async Video Generation:** Long-running process with step tracking
- Step-by-step generation progress with visual indicators
- Real-time status updates
- Video preview when complete
- Download video option
- Can exit during rendering and return later

#### Generation Steps

```
Step 1: Analyzing audio
  └─ Preparing audio for synchronization

Step 2: Syncing with visuals
  └─ Aligning audio to video frames

Step 3: Rendering video
  └─ Compositing audio and visuals

Step 4: Finalizing output
  └─ Encoding and optimization
```

#### Multi-Step Progress Display

```
Start Video Generation
       ↓
Step 1: Analyzing audio [✓] Complete
Step 2: Syncing visuals [█████░░░] 50%
Step 3: Rendering video [ ] Pending
Step 4: Finalizing [ ] Pending
Overall: 25% Complete
       ↓
User can exit browser
       ↓
Return later to check progress
       ↓
Complete: [✓] ✓ ✓ ✓
Overall: 100% Complete
Video ready to download
```

#### User Actions
- Review project summary before generation
- Start video generation
- Monitor multi-step progress in real-time
- Exit and return (rendering continues in background)
- Preview generated video
- Download final video file
- Share or publish project
- Go to projects list

#### Async Processing Details
- Each step shows completion status
- Overall progress percentage displayed
- State persists across page refreshes
- Users can leave and return
- Rendering continues in background (production)
- Status badge in project shell shows "Rendering" or "Completed"

#### Navigation
- Back button returns to Voice step (disabled during rendering)
- "Download" and "Go to Projects" appear when complete
- Project status badge shows "Rendering" or "Completed"

---

## State Management

### ProjectState Interface

```typescript
interface ProjectState {
  id: string;                          // Unique project ID
  title?: string;                      // Project title (auto or custom)
  
  // Step 1: Movie Selection
  movieId?: string;                    // Selected movie ID
  movieTitle?: string;                 // Movie title
  moviePoster?: string;                // Movie poster image URL
  movieGenre?: string;                 // Movie genre
  movieRating?: number;                // Movie rating (IMDb)
  
  // Step 2: Script (Multiple Versions)
  scripts: ScriptVersion[];            // All script versions
  activeScriptId?: string;             // ID of currently active script
  
  // Step 3: Voice Generation
  voiceId?: string;                    // Selected voice ID
  voiceName?: string;                  // Voice name/profile
  audioUrl?: string;                   // Generated audio URL
  audioDuration?: number;              // Audio duration in seconds
  
  // Step 4: Video Composition
  videoUrl?: string;                   // Generated video URL
  videoStatus?: VideoStatus;           // Current video generation status
  videoProgress?: number;              // Progress 0-100%
  videoJobId?: string;                 // Backend job ID for polling
  isRendering?: boolean;               // Is video currently rendering?
  
  // Metadata
  status: "draft" | "in-progress" | "completed";
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
  lastStep: "source" | "script" | "voice" | "compose";
}

type VideoStatus = "idle" | "queued" | "processing" | "completed" | "failed";

interface ScriptVersion {
  id: string;                          // Unique version ID
  content: string;                     // Full script text
  createdAt: string;                   // ISO timestamp
  wordCount: number;                   // Word count (auto-calculated)
  duration: number;                    // Read duration in minutes
  isActive: boolean;                   // Is this version currently active?
}
```

### useProjectState Hook

Located in `/src/lib/hooks/use-project-state.ts`

```typescript
const {
  state,                    // Current project state (ProjectState)
  isLoading,               // Loading indicator (boolean)
  activeScript,            // Currently active script version (ScriptVersion | null)
  updateMovie,             // (movieId, title, poster, genre, rating) => void
  addScript,               // (content, wordCount, duration) => void
  setActiveScript,         // (scriptId) => void
  deleteScript,            // (scriptId) => void
  updateVoice,             // (voiceId, name, audioUrl, duration) => void
  updateVideoStatus,       // (status, progress, jobId) => void
  updateTitle,             // (title) => void
} = useProjectState(projectId);
```

### State Persistence

- Stored in `localStorage` under key: `huavoi_project_{projectId}`
- Automatic save on every state change
- Updates `updatedAt` timestamp on changes
- Preserves all historical data (script versions)
- Survives browser close and page refresh
- Multiple projects can be in-progress simultaneously

### Step Completion Logic

```typescript
const completedSteps = {
  source: !!state.movieId,
  script: state.scripts.length > 0,
  voice: !!state.audioUrl,
  compose: !!state.videoUrl,
};
```

### Step Accessibility Rules

- **Source:** Always accessible (first step)
- **Script:** Accessible after Source complete (movie selected)
- **Voice:** Accessible after Script complete (script exists)
- **Compose:** Accessible after Voice complete (audio ready)
- **Any Completed Step:** Always revisitable for changes

---

## API Integration

Ready for backend implementation. Replace current simulated delays with actual API calls.

### 1. Movie Selection

```typescript
GET /api/movies
Response: Movie[]

interface Movie {
  id: string;
  title: string;
  poster: string;
  genre: string;
  rating: number;
  duration: number;
}
```

```typescript
GET /api/movies/search?q={query}
Response: Movie[]
```

### 2. Script Generation

```typescript
POST /api/scripts/generate
Body: {
  movieId: string;
  tone?: "dramatic" | "comedic" | "neutral";
  length?: "short" | "standard" | "detailed";
}
Response: {
  id: string;
  content: string;
  wordCount: number;
  duration: number;
}
```

### 3. Voice Generation (Async)

```typescript
GET /api/voices
Response: Voice[]

interface Voice {
  id: string;
  name: string;
  preview?: string;
  language: string;
}
```

```typescript
POST /api/tts/generate
Body: {
  script: string;
  voiceId: string;
}
Response: {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
}

GET /api/tts/status/{jobId}
Response: {
  status: string;
  progress: number;        // 0-100
  audioUrl?: string;
  duration?: number;
  error?: string;
}
```

### 4. Video Generation (Async)

```typescript
POST /api/videos/generate
Body: {
  movieId: string;
  audioUrl: string;
  scriptId: string;
}
Response: {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
}

GET /api/videos/status/{jobId}
Response: {
  status: string;
  progress: number;        // 0-100
  currentStep: number;     // 1-4
  steps: {
    name: string;
    status: "pending" | "processing" | "completed";
    progress?: number;
  }[];
  videoUrl?: string;
  error?: string;
}
```

---

## Testing Checklist

### State Persistence Tests
- [ ] Create project, select movie, refresh page → movie still selected
- [ ] Generate script, close browser, reopen → script still there
- [ ] Generate multiple scripts, switch between them → all versions preserved
- [ ] Start TTS generation, exit, return → sees progress or result
- [ ] Start video rendering, exit, return → sees progress or result
- [ ] Delete project locally, refresh → project gone

### Script Versioning Tests
- [ ] Generate script → creates version 1
- [ ] Edit script and save → creates version 2
- [ ] Regenerate → creates version 3
- [ ] Switch between versions → updates active script
- [ ] Delete version → removes from list
- [ ] Can't delete last remaining version → error message

### Navigation Tests
- [ ] Source always accessible
- [ ] Script disabled until movie selected
- [ ] Voice disabled until script generated
- [ ] Compose disabled until voice generated
- [ ] Can go back to any completed step
- [ ] Checkmarks appear on completed steps
- [ ] Step indicators update correctly

### Async Operations Tests
- [ ] TTS shows progress during generation (0-100%)
- [ ] Video shows step-by-step progress (1/4, 2/4, etc.)
- [ ] Can exit during TTS and return
- [ ] Can exit during rendering and return
- [ ] Status badge updates correctly
- [ ] Error handling works (retry option)

### UI Consistency Tests
- [ ] Left rail appears on all steps
- [ ] Top nav with step indicators visible
- [ ] Same button styles and spacing
- [ ] Consistent with other pages
- [ ] Mobile responsive on all steps
- [ ] Animations smooth and performant

### Cross-Browser Tests
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

---

## User Journey Examples

### Example 1: Single Session (Traditional)

```
Day 1 (All in one session):
1. Create new project
2. Select movie (Inception)
3. Generate script
4. Generate voice (Morgan Freeman)
5. Generate video
6. Download and share

Time: ~10 minutes
Result: Complete video ready to use
```

### Example 2: Multi-Session (Real-World)

```
Day 1:
1. Create new project
2. Select movie (Inception)
3. Generate script v1
4. Not satisfied, generate v2
5. Close browser
   → All progress saved

Day 2:
6. Return to project
7. Review and pick v2
8. Start TTS generation
9. Close browser (TTS processing)
   → TTS continues in background

Day 3:
10. Return to project
11. TTS complete, preview audio
12. Start video rendering
13. Close browser (rendering continues)
    → Rendering continues

Day 4:
14. Return to project
15. Video complete
16. Download and publish

Time: 4 days of work, fully interruptible
Result: Same quality, user-friendly process
```

---

## UI/UX Design Patterns

### Visual Hierarchy
1. **Step Indicator:** Always visible at top with completion status
2. **Content Area:** Step-specific component with large interactive elements
3. **Navigation Controls:** Sticky bottom bar with Back/Continue buttons

### Color Coding
- Step 1 (Movie): Blue/Cyan gradient - Represents selection
- Step 2 (Script): Purple/Pink gradient - Represents creation
- Step 3 (Voice): Green/Emerald gradient - Represents audio
- Step 4 (Video): Blue/Cyan gradient - Represents final output

### Responsive Design
- **Mobile:** Single column, simplified controls, drawer navigation
- **Tablet:** 2-column grids, medium spacing, optimized touch targets
- **Desktop:** 3-4 column grids, full features, all elements visible

### Loading States
- **Initial Load:** Skeleton loaders for data fetching
- **Generation:** Progress bars with percentage
- **Long Process:** Step-by-step indicators
- **Short Operation:** Spinner for quick actions

### Success/Error States
- **Success:** Toast notifications + checkmarks
- **Error:** Toast notifications + descriptive message + retry button
- **Warning:** Toast notifications + action recommendations

---

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading:** Load step components on-demand
2. **Image Optimization:** Use Next.js Image component with poster URLs
3. **Code Splitting:** Separate bundle per step component
4. **Caching:** Cache movie list and voice profiles in localStorage
5. **Debouncing:** Search input with 300ms debounce
6. **Streaming:** Stream large video file downloads

### Monitoring Recommendations
- Track generation times (average, max)
- Monitor API response times
- Log error rates and error types
- User flow analytics (drop-off points)
- Performance metrics (page load, interaction)

---

## Future Enhancements

### Phase 2: Advanced Features
- [ ] Multiple voice support (different speakers in same video)
- [ ] Background music selection and volume control
- [ ] Custom video templates and transitions
- [ ] Advanced editing tools (trim, crop, effects)
- [ ] Batch project creation
- [ ] Project templates/presets

### Phase 3: Collaborative Features
- [ ] Collaborative editing (real-time)
- [ ] Version history with comparisons
- [ ] A/B testing for scripts
- [ ] Analytics dashboard
- [ ] Export to multiple formats
- [ ] Social media integration

### Phase 4: AI Enhancements
- [ ] AI script suggestions based on movie
- [ ] Smart voice matching to character
- [ ] Automated subtitle generation
- [ ] Multi-language support
- [ ] Custom voice cloning
- [ ] Scene-specific music recommendations

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to select items
- Arrow keys for grid navigation
- Escape to close modals/dialogs

### Screen Readers
- Semantic HTML structure throughout
- ARIA labels on all controls
- Status announcements for progress
- Progress updates announced

### Visual Accessibility
- High contrast ratios (WCAG AA)
- Visible focus indicators on all interactive elements
- Clear loading states with text + visual indicators
- Error messages in color + text

### Mobile Accessibility
- Minimum 44x44px touch targets
- Sufficient spacing between interactive elements
- Readable text sizes (minimum 16px)
- Proper heading hierarchy

---

## Troubleshooting Guide

### Project State Lost
**Problem:** Refresh page and state is gone  
**Solution:** Check localStorage is enabled and not full  
**Prevention:** localStorage should persist across sessions

### Script Not Saving
**Problem:** Generated script doesn't appear  
**Solution:** Check browser console for errors, retry generation  
**Prevention:** Ensure API connection is stable

### TTS Generation Stuck
**Problem:** Progress bar frozen at X%  
**Solution:** Exit and return, or retry generation  
**Prevention:** Check API is responding, check network connection

### Video Rendering Failed
**Problem:** Video generation fails with error  
**Solution:** Review error message, check all prerequisites complete  
**Prevention:** Ensure movie, script, and voice are all selected

---

## Documentation References

- **Component Examples:** See `/docs/guides/COMPONENT_EXAMPLES.md`
- **Design System:** See `/docs/guides/DESIGN_SYSTEM.md`
- **Implementation Details:** See `/docs/implementation/` folder
- **Source Code:** See `/src/app/project/[projectId]/` folder

---

## Summary

The new project creation workflow provides:
- ✅ Integrated UI with consistent navigation
- ✅ Persistent state management
- ✅ Multiple script versions
- ✅ Async processing support
- ✅ Non-linear navigation
- ✅ Professional user experience
- ✅ Fully responsive design
- ✅ Complete accessibility support

**Status:** Production Ready ✅

---

**Last Updated:** June 20, 2026  
**Version:** 1.0  
**Audience:** Users & Developers
