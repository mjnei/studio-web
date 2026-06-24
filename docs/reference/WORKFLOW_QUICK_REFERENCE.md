# Project Workflow Quick Reference

**Print-Friendly Cheat Sheet** | **Last Updated:** June 24, 2026

---

## The 6 Steps

```
1. Source    → Select movie from TMDB
2. Script    → Generate/edit voiceover script
3. Details   → Name the project
4. Voice     → Select voice and play preview samples
5. Preview   → Review project configuration
6. Compose   → Generate final video
```

---

## Routes

```
/project/[id]/source      → Step 1: Movie Selection
/project/[id]/script      → Step 2: Script Generation
/project/[id]/details     → Step 3: Project Details
/project/[id]/voice       → Step 4: Voice Selection
/project/[id]/preview     → Step 5: Project Preview
/project/[id]/compose     → Step 6: Video Composition
```

---

## Database Fields

```typescript
{
  id: UUID;
  title: string;                    // Step 3: Project name
  movie_id: number;                 // Step 1: TMDB movie
  script: string;                   // Step 2: Script content
  voice_id: UUID;                   // Step 4: Selected voice
  video_url: string;                // Step 6: Generated video
  last_step: 'source' | 'script' | 'details' | 'voice' | 'preview' | 'compose';
  status: 'draft' | 'in-progress' | 'completed';
  user_id: UUID;
  created_at: timestamp;
  updated_at: timestamp;
}
```

---

## Step Completion

| Step | Completion Check | Next Step |
|------|------------------|-----------|
| Source | `movie_id` is set | Script |
| Script | `script` has content | Details |
| Details | `title` is set | Voice |
| Voice | `voice_id` is set | Preview |
| Preview | User clicks Next | Compose |
| Compose | `video_url` is set | Done |

---

## API Endpoints

### Navigation
```http
PATCH /api/v1/projects/{id}/step
Body: { "step": "voice" }
```

### Step 1: Source
```http
GET /api/v1/tmdb/movies/popular
GET /api/v1/tmdb/movies/search?query={query}
PATCH /api/v1/projects/{id}
Body: { "movie_id": 123 }
```

### Step 2: Script
```http
POST /api/v1/projects/{id}/script/generate
PATCH /api/v1/projects/{id}
Body: { "script": "..." }
```

### Step 3: Details
```http
PATCH /api/v1/projects/{id}
Body: { "title": "My Project" }
```

### Step 4: Voice
```http
GET /api/v1/voices
GET /api/v1/voices/{id}/preview-url
GET /api/v1/recordings
PATCH /api/v1/projects/{id}
Body: { "voice_id": "uuid" }
```

### Step 5: Preview
No API calls - reads existing data

### Step 6: Compose
```http
POST /api/v1/projects/{id}/compose
GET /api/v1/jobs/{job_id}/status
```

---

## Frontend Hook

```typescript
const {
  project,       // Current project data
  isLoading,     // Loading state
  error,         // Error state
  refetch,       // Reload data
  advanceStep,   // Update last_step
} = useProjectState(projectId);
```

---

## Voice Playback

```typescript
// Stock voice (fetch presigned URL)
const { url } = await getVoicePreviewUrl(voiceId);
audio.src = url;
await audio.play();

// User recording (use existing URL)
audio.src = recording.audio_url;
await audio.play();
```

**Important:** Only plays pre-recorded samples. No TTS generation.

---

## Navigation Rules

- **Source:** Always accessible
- **Script → Compose:** Requires previous steps completed
- **Back navigation:** Always allowed to completed steps
- **Forward navigation:** Blocked until step completed

---

## File Locations

```
src/app/project/[projectId]/
  source/page.tsx          # Step 1
  script/page.tsx          # Step 2
  details/page.tsx         # Step 3
  voice/page.tsx           # Step 4
  preview/page.tsx         # Step 5
  compose/page.tsx         # Step 6

src/lib/
  project-client.ts        # API functions
  hooks/use-project-state.ts  # State hook
```

---

## Testing Checklist

- [ ] Navigate through all 6 steps
- [ ] Exit and return - resumes at `last_step`
- [ ] Voice preview plays without errors
- [ ] Step advancement saves to database
- [ ] Can go back to previous steps
- [ ] Cannot skip ahead to future steps

---

## Common Patterns

**Advance to next step:**
```typescript
await advanceStep("voice");
router.push(`/project/${projectId}/voice`);
```

**Play voice preview:**
```typescript
const playVoice = async (voiceId: string) => {
  const { url } = await getVoicePreviewUrl(voiceId);
  audioRef.current.src = url;
  await audioRef.current.play();
};
```

**Update project:**
```typescript
await updateProject(projectId, { title: "New Title" });
await refetch();
```

---

## Migration Reference

**e08bed7ae0d0:** Added 'details' and 'preview' to last_step CHECK constraint

---

**💾 Bookmark • 🖨️ Print • 🔄 Keep Handy**
