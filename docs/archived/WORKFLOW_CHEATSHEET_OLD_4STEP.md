# 4-Step Workflow Quick Reference

**Print-Friendly One-Page Reference** | **Last Updated:** June 20, 2026

---

## Routes

```
/project/new              → Create draft, redirect to Step 1
/project/[id]/source      → Step 1: Movie Selection
/project/[id]/script      → Step 2: Script Generation
/project/[id]/voice       → Step 3: Voice Generation
/project/[id]/compose     → Step 4: Video Composition
```

---

## State Structure (Simplified)

```typescript
{
  id: string;
  movieId?: string;                 // Step 1
  scripts: ScriptVersion[];         // Step 2
  activeScriptId?: string;          // Step 2
  voiceId?: string;                 // Step 3
  audioUrl?: string;                // Step 3
  videoUrl?: string;                // Step 4
  videoStatus?: "idle" | "processing" | "completed" | "failed";
  status: "draft" | "in-progress" | "completed";
}
```

**localStorage Key:** `huavoi_project_{projectId}`

---

## Step Completion Check

```typescript
source: !!state.movieId
script: state.scripts.length > 0
voice: !!state.audioUrl
compose: !!state.videoUrl
```

---

## useProjectState Hook

```typescript
const {
  state, isLoading, activeScript,
  updateMovie(id, title, poster, genre, rating),
  addScript(content, wordCount, duration),
  setActiveScript(scriptId),
  updateVoice(id, name, audioUrl, duration),
  updateVideoStatus(status, progress, jobId),
} = useProjectState(projectId)
```

---

## API Endpoints

| Step | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| 1 | GET | `/api/movies` | - | `Movie[]` |
| 1 | GET | `/api/movies/search?q={query}` | - | `Movie[]` |
| 2 | POST | `/api/scripts/generate` | `{movieId, tone?, length?}` | `{id, content, wordCount, duration}` |
| 3 | GET | `/api/voices` | - | `Voice[]` |
| 3 | POST | `/api/tts/generate` | `{script, voiceId}` | `{jobId, status}` |
| 3 | GET | `/api/tts/status/{jobId}` | - | `{status, progress, audioUrl?, duration?}` |
| 4 | POST | `/api/videos/generate` | `{movieId, audioUrl, scriptId}` | `{jobId, status}` |
| 4 | GET | `/api/videos/status/{jobId}` | - | `{status, progress, currentStep, steps[], videoUrl?}` |

---

## Component Files

```
src/app/project/
  new/page.tsx
  [projectId]/
    source/page.tsx          ← Step 1
    script/page.tsx          ← Step 2
    voice/page.tsx           ← Step 3
    compose/page.tsx         ← Step 4

src/lib/hooks/
  use-project-state.ts       ← State management
```

---

## Common Code Patterns

**Get state in a component:**
```typescript
const { state, activeScript } = useProjectState(projectId);
```

**Update movie:**
```typescript
updateMovie("movie-123", "Inception", "/poster.jpg", "Sci-Fi", 8.8);
```

**Create script version:**
```typescript
addScript("Script content...", 250, 5);  // 250 words, 5 min read
```

**Update video status:**
```typescript
updateVideoStatus("processing", 75, "job-456");
```

---

## Testing Checklist

- [ ] State persists after page refresh
- [ ] Script versions create/switch/delete correctly
- [ ] Can navigate back to any completed step
- [ ] TTS shows 0-100% progress
- [ ] Video shows multi-step progress
- [ ] Can exit/return during async operations
- [ ] Mobile responsive

---

## Colors

| Step | Gradient |
|------|----------|
| Movie (1) | Blue → Cyan |
| Script (2) | Purple → Pink |
| Voice (3) | Green → Emerald |
| Video (4) | Blue → Cyan |

---

## File Locations

| File | Purpose |
|------|---------|
| `WORKFLOW_GUIDE.md` | Complete reference |
| `NEW_PROJECT_UI_DESIGN.md` | UI layouts |
| `COMPONENT_EXAMPLES.md` | Component showcase |

---

**💾 Bookmark • 🖨️ Print • 🔄 Keep Handy**
