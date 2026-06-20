# 4-Step Workflow Cheat Sheet

**Quick Reference** | **Last Updated:** June 20, 2026

> 📋 **Print this!** One-page reference for the entire workflow

---

## Routes Quick Reference

```
/project/new              → Creates draft, redirects to Step 1
/project/[id]/source      → Step 1: Movie Selection
/project/[id]/script      → Step 2: Script Generation
/project/[id]/voice       → Step 3: Voice Generation
/project/[id]/compose     → Step 4: Video Composition
```

---

## State at a Glance

### localStorage Key
```typescript
localStorage.getItem('huavoi_project_{projectId}')
```

### ProjectState Interface (Simplified)
```typescript
{
  id: string
  movieId?: string              // Step 1
  scripts: ScriptVersion[]      // Step 2
  activeScriptId?: string       // Step 2
  voiceId?: string              // Step 3
  audioUrl?: string             // Step 3
  videoUrl?: string             // Step 4
  videoStatus?: VideoStatus     // Step 4
  status: "draft" | "in-progress" | "completed"
  lastStep: "source" | "script" | "voice" | "compose"
}
```

### useProjectState Hook
```typescript
const {
  state,              // Current state
  activeScript,       // Active script version
  updateMovie,        // (id, title, poster, genre, rating)
  addScript,          // (content, wordCount, duration)
  setActiveScript,    // (scriptId)
  updateVoice,        // (id, name, audioUrl, duration)
  updateVideoStatus,  // (status, progress, jobId)
} = useProjectState(projectId)
```

---

## Step Completion Rules

```typescript
const isStepComplete = {
  source: !!state.movieId,
  script: state.scripts.length > 0,
  voice: !!state.audioUrl,
  compose: !!state.videoUrl,
}
```

---

## API Endpoints

### Step 1: Movies
```
GET  /api/movies                    // All movies
GET  /api/movies/search?q={query}   // Search
```

### Step 2: Scripts
```
POST /api/scripts/generate
Body: { movieId, tone?, length? }
Response: { id, content, wordCount, duration }
```

### Step 3: Voice (Async)
```
GET  /api/voices                    // All voices
POST /api/tts/generate
Body: { script, voiceId }
Response: { jobId, status }

GET  /api/tts/status/{jobId}
Response: { status, progress, audioUrl?, duration? }
```

### Step 4: Video (Async)
```
POST /api/videos/generate
Body: { movieId, audioUrl, scriptId }
Response: { jobId, status }

GET  /api/videos/status/{jobId}
Response: {
  status, progress, currentStep,
  steps: [{ name, status, progress }],
  videoUrl?
}
```

---

## Component Quick Reference

### Step 1 Components
- Movie grid (2/3/4 columns responsive)
- Search input with debounce
- Movie cards with hover effects
- Selection indicator

### Step 2 Components
- AI generation button
- Stats cards (words, duration, paragraphs)
- Script editor with syntax highlighting
- Version switcher/manager
- Copy/Edit/Regenerate buttons

### Step 3 Components
- Voice selection grid
- TTS generation button
- Progress bar (0-100%)
- Audio player with controls
- Download button

### Step 4 Components
- Project summary cards
- Multi-step progress indicator
- Overall progress bar
- Video player/preview
- Download button

---

## Common Patterns

### Loading States
```typescript
// Short operation
{isLoading && <Spinner />}

// Long operation (TTS/Video)
<ProgressBar value={progress} max={100} />
<StatusText>Step {currentStep}/4: {stepName}</StatusText>
```

### Error Handling
```typescript
{error && (
  <Alert variant="destructive">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
    <Button onClick={retry}>Retry</Button>
  </Alert>
)}
```

### Navigation
```typescript
// Disable if previous step incomplete
<Button
  disabled={!isStepComplete.source}
  onClick={() => router.push(`/project/${id}/script`)}
>
  Continue to Script
</Button>
```

---

## Testing Checklist (One-Liner)

- [ ] State persists on refresh
- [ ] Can create/switch/delete script versions
- [ ] Can navigate back to any completed step
- [ ] TTS shows progress, can exit/return
- [ ] Video shows multi-step progress, can exit/return
- [ ] Works on mobile

---

## File Locations

```
Pages:
src/app/project/new/page.tsx
src/app/project/[projectId]/source/page.tsx
src/app/project/[projectId]/script/page.tsx
src/app/project/[projectId]/voice/page.tsx
src/app/project/[projectId]/compose/page.tsx

State Hook:
src/lib/hooks/use-project-state.ts

Components:
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/input.tsx
src/components/ui/badge.tsx
src/components/ui/progress.tsx
```

---

## Color Quick Reference

| Step | Primary | Gradient | Usage |
|------|---------|----------|-------|
| Movie | `#3b82f6` | Blue → Cyan | Selection phase |
| Script | `#8b5cf6` | Purple → Pink | Creation phase |
| Voice | `#10b981` | Green → Emerald | Audio phase |
| Video | `#3b82f6` | Blue → Cyan | Final phase |

---

## Need More Details?

| Topic | Document |
|-------|----------|
| Complete workflow | [WORKFLOW_GUIDE.md](../guides/WORKFLOW_GUIDE.md) |
| UI layouts | [NEW_PROJECT_UI_DESIGN.md](../guides/NEW_PROJECT_UI_DESIGN.md) |
| Component code | [COMPONENT_EXAMPLES.md](../guides/COMPONENT_EXAMPLES.md) |
| All CSS/colors | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Main hub | [INDEX.md](../INDEX.md) |

---

**🖨️ Print-Friendly** • **💾 Bookmark This** • **🔄 Keep Handy**
