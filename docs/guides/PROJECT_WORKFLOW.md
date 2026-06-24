# Project Creation Workflow

**Last Updated:** June 24, 2026 | **Status:** ✅ Production Ready

---

## Overview

A streamlined 6-step workflow for creating video projects from movie trailers. Each step can be revisited, and all progress is automatically saved to the database.

```
Source → Script → Details → Voice → Preview → Compose
```

**Key Features:**
- ✅ Database-backed persistence (no localStorage)
- ✅ Non-linear navigation (revisit any step)
- ✅ Step progress tracking via `last_step` field
- ✅ Voice preview playback (pre-recorded samples)
- ✅ Mobile responsive & accessible
- ✅ Exit and resume anytime

---

## The 6 Steps

### Step 1: Source Selection
**Route:** `/project/[projectId]/source`

Select a movie from TMDB to base your project on.

**Actions:**
- Browse TMDB movies with search
- Click to select a movie
- Movie metadata saved to project

**Completion:** Project has `movie_id` set

**Advances to:** Script generation

---

### Step 2: Script Generation
**Route:** `/project/[projectId]/script`

Generate and edit the voiceover script for your video.

**Actions:**
- Generate AI-powered script based on movie
- Edit script content
- View word count and estimated duration
- Save changes

**Completion:** Project has script content saved

**Advances to:** Project details

---

### Step 3: Project Details
**Route:** `/project/[projectId]/details`

Name your project and configure basic settings.

**Actions:**
- Enter project name/title
- Auto-save on input

**Completion:** Project has a name/title

**Advances to:** Voice selection

---

### Step 4: Voice Selection
**Route:** `/project/[projectId]/voice`

Choose a voice for your voiceover narration.

**Actions:**
- Browse stock voices from catalog
- Browse user-uploaded voice recordings
- Play voice preview audio (pre-recorded samples)
- Select a voice for the project

**Important:** This step only plays existing voice preview audio. No TTS generation occurs here.

**Completion:** Project has `voice_id` set

**Advances to:** Preview

---

### Step 5: Preview
**Route:** `/project/[projectId]/preview`

Review your project configuration before final composition.

**Actions:**
- Display project summary (name, selected voice, script preview)
- Show selected movie information
- Review configuration

**Note:** This is a confirmation/review step. TTS audio generation has been deferred to a future update. The "Next" button is enabled immediately.

**Completion:** User reviews and confirms

**Advances to:** Video composition

---

### Step 6: Compose
**Route:** `/project/[projectId]/compose`

Generate the final video composition.

**Actions:**
- Start video generation job
- Track async video processing progress
- Preview completed video
- Download or publish

**Completion:** Video file generated and available

---

## Database Schema

### Projects Table

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    movie_id INTEGER,
    script TEXT,
    voice_id UUID,
    audio_url VARCHAR(512),
    video_url VARCHAR(512),
    last_step VARCHAR(50) CHECK (
        last_step IN ('source', 'script', 'details', 'voice', 'preview', 'compose')
    ),
    status VARCHAR(50),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Key Fields:**
- `last_step`: Tracks user's current position in workflow (source, script, details, voice, preview, compose)
- `movie_id`: TMDB movie ID selected in Step 1
- `script`: Generated/edited script content from Step 2
- `title`: Project name from Step 3
- `voice_id`: Selected voice ID from Step 4
- `video_url`: Final video URL from Step 6

---

## API Endpoints

### Step Navigation
```
PATCH /api/v1/projects/{id}/step
Body: { "step": "source" | "script" | "details" | "voice" | "preview" | "compose" }
```

### Step 1: Source Selection
```
GET /api/v1/tmdb/movies/popular
GET /api/v1/tmdb/movies/search?query={query}
PATCH /api/v1/projects/{id}
Body: { "movie_id": 123 }
```

### Step 2: Script Generation
```
POST /api/v1/projects/{id}/script/generate
Body: { "movie_id": 123, "tone": "dramatic" }

PATCH /api/v1/projects/{id}
Body: { "script": "Updated script content..." }
```

### Step 3: Project Details
```
PATCH /api/v1/projects/{id}
Body: { "title": "My Awesome Project" }
```

### Step 4: Voice Selection
```
GET /api/v1/voices
GET /api/v1/recordings

GET /api/v1/voices/{id}/preview-url
Response: { "url": "https://storage.../preview.mp3" }

GET /api/v1/recordings/{id}
Response: { "audio_url": "https://storage.../audio.mp3", ... }

PATCH /api/v1/projects/{id}
Body: { "voice_id": "voice-uuid" }
```

### Step 5: Preview
No specific API calls - reads existing project data

### Step 6: Compose
```
POST /api/v1/projects/{id}/compose
Body: { "settings": {...} }
Response: { "job_id": "job-123", "status": "queued" }

GET /api/v1/jobs/{job_id}/status
Response: { "status": "processing", "progress": 45 }
```

---

## Frontend Implementation

### File Structure

```
src/app/project/
  [projectId]/
    source/page.tsx          # Step 1
    script/page.tsx          # Step 2
    details/page.tsx         # Step 3
    voice/page.tsx           # Step 4
    preview/page.tsx         # Step 5
    compose/page.tsx         # Step 6

src/lib/
  project-client.ts          # API client functions
  hooks/
    use-project-state.ts     # Project state management hook
```

### State Management Hook

```typescript
const {
  project,              // Current project data from API
  isLoading,           // Loading state
  error,               // Error state
  refetch,             // Refetch project data
  advanceStep,         // Move to next step
} = useProjectState(projectId);
```

### Step Advancement

Each step page calls `advanceStep()` when the user completes the step's requirements:

```typescript
// Example from details page
const handleContinue = async () => {
  await advanceStep("voice"); // Advance to voice selection
  router.push(`/project/${projectId}/voice`);
};
```

This updates the `last_step` field in the database, allowing the user to resume at the correct step if they navigate away.

---

## Navigation Rules

### Step Access Control

| Step | Always Accessible | Requires Previous Steps |
|------|-------------------|-------------------------|
| Source | ✅ Yes | None |
| Script | ❌ No | Source completed |
| Details | ❌ No | Script completed |
| Voice | ❌ No | Details completed |
| Preview | ❌ No | Voice completed |
| Compose | ❌ No | Preview completed |

### Navigation Component

The workflow navigation component (`WorkflowNavigation`) enforces these rules:
- Completed steps are clickable
- Current step is highlighted
- Future steps are disabled
- Can always go back to any completed step

---

## Voice Preview Playback

### Implementation

Voice selection page plays pre-recorded voice preview audio:

```typescript
const playAudio = async (voice: Voice | Recording) => {
  if ('preview_audio_url' in voice) {
    // Stock voice - fetch presigned URL
    const { url } = await getVoicePreviewUrl(voice.id);
    audioRef.current.src = url;
  } else {
    // User recording - use existing presigned URL
    audioRef.current.src = voice.audio_url;
  }
  await audioRef.current.play();
};
```

**Important:** No TTS generation occurs during voice selection. Only pre-existing audio samples are played.

---

## Migration History

### Adding Details and Preview Steps

**Migration:** `e08bed7ae0d0_add_details_and_preview_to_last_step.py`

Updated the `projects.last_step` CHECK constraint to allow all 6 steps:

```python
op.drop_constraint('projects_last_step_check', 'projects')
op.create_check_constraint(
    'projects_last_step_check',
    'projects',
    "last_step IN ('source', 'script', 'details', 'voice', 'preview', 'compose')"
)
```

---

## Testing Checklist

### Navigation Flow
- [ ] Create new project
- [ ] Complete each step in order
- [ ] Verify step advancement after each completion
- [ ] Navigate away and return - should resume at last_step
- [ ] Try to access future steps - should redirect back
- [ ] Go back to previous steps - should work

### Voice Selection (Step 4)
- [ ] Browse stock voices
- [ ] Browse user recordings
- [ ] Click play on stock voice - preview audio plays
- [ ] Click play on user recording - preview audio plays
- [ ] No 401 errors when playing audio
- [ ] Select a voice and continue

### Preview Step (Step 5)
- [ ] Project summary displays correctly
- [ ] Selected voice shows up
- [ ] Script preview is visible
- [ ] Next button is enabled immediately
- [ ] No API calls for TTS generation

### Database Persistence
- [ ] last_step value saves correctly after each step
- [ ] Project data persists across sessions
- [ ] Can query projects and see correct last_step value

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 error playing voice | Missing auth token | Fixed: Audio requests now include Authorization header |
| Can't advance past details | Missing step in CHECK constraint | Fixed: Migration adds 'details' and 'preview' to allowed values |
| Lost progress after reload | last_step not being saved | Fixed: Each step calls advanceStep() on completion |
| Preview step shows loading | Trying to generate TTS | Fixed: Removed TTS generation, simplified to review page |

---

## Future Enhancements

- [ ] TTS audio generation integration (Step 5)
- [ ] Multiple voice actors per project
- [ ] Background music selection
- [ ] Video template customization
- [ ] Batch project creation
- [ ] Collaborative editing

---

## Related Documentation

- **Backend API:** `/Users/aa/git/github_uncgra/huavoi/studio-backend/docs/API_ENDPOINTS.md`
- **Database Schema:** `/Users/aa/git/github_uncgra/huavoi/studio-backend/docs/DB_SCHEMA.md`
- **Design System:** `/docs/guides/DESIGN_SYSTEM.md`
- **Quick Reference:** `/docs/reference/WORKFLOW_QUICK_REFERENCE.md`

---

**Version:** 2.0 (6-step workflow) | **Updated:** June 24, 2026
