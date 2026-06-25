# Project Workflow Quick Reference

**Print-Friendly Cheat Sheet** | **Last Updated:** June 24, 2026

---

## The 6 Steps

```
1. Source    → Select movie from TMDB
2. Script    → Generate/edit voiceover script
3. Details   → Name the project
4. Voice     → Select voice (plays pre-recorded preview samples)
5. Preview   → Generate and preview TTS audio with selected voice
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
| Preview | TTS audio generated & ready | Compose |
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
Generate and preview TTS audio for the selected voice with your script

```http
POST /api/v1/tts
Body: { "project_id": "id", "script_id": "id", "voice_id": "id" }

GET /api/v1/tts/{job_id}
Response: { "status": "completed", "audio_url": "..." }
```

### Step 6: Compose
```http
POST /api/v1/projects/{id}/compose
Body: { "tts_job_id": "job-id" }

GET /api/v1/jobs/{job_id}/status
Response: { "status": "processing", "progress": 45 }
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

## Voice Playback & TTS Generation

**Step 4: Voice Selection - Plays Pre-recorded Samples**
```typescript
// Stock voice (fetch presigned URL)
const { url } = await getVoicePreviewUrl(voiceId);
audio.src = url;
await audio.play();

// User recording (use existing URL)
audio.src = recording.audio_url;
await audio.play();
```

**Step 5: Preview - Generates & Plays TTS Audio**
```typescript
// Create TTS job with selected voice and script
const job = await createTTSJob({
  projectId,
  scriptId,
  voiceId,
  autoActivate: true
});

// Poll for completion
const job = await getTTSJob(job.id);
if (job.status === "completed") {
  audio.src = job.audio_url;
  await audio.play();
}
```

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
await advanceProjectStep(projectId, "voice");
router.push(`/project/${projectId}/voice`);
```

**Generate TTS audio (Step 5):**
```typescript
const job = await createTTSJob({
  projectId,
  scriptId: activeScript.id,
  voiceId: selectedVoiceId,
  autoActivate: true
});

// Poll for completion
const pollJob = async () => {
  const updated = await getTTSJob(job.id);
  if (updated.status === "completed") {
    // Ready for compose
  } else if (updated.status === "processing") {
    setTimeout(pollJob, 2000);
  }
};
```

**Create video job (Step 6):**
```typescript
const videoJob = await createVideoJob({
  projectId,
  ttsJobId: ttsJob.id,
  autoActivate: true
});
```

---

## Migration Reference

**e08bed7ae0d0:** Added 'details' and 'preview' to last_step CHECK constraint

---

**💾 Bookmark • 🖨️ Print • 🔄 Keep Handy**
