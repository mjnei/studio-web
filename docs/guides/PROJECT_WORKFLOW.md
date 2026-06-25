# Project Creation Workflow

**Last Updated:** June 25, 2026 | **Status:** ✅ Production Ready

---

## Overview

A streamlined 6-step workflow for creating video projects from movie trailers. Each step can be revisited, and all progress is automatically saved to the database.

```
Source → Script → Details → Voice → Preview → Compose
```

**Key Features:**
- ✅ Database-backed persistence
- ✅ Non-linear navigation (revisit any step)
- ✅ Step progress tracking via `last_step` field
- ✅ Voice preview playback (Step 4: pre-recorded samples)
- ✅ TTS audio generation (Step 5: full script with voice)
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

Choose a voice for your voiceover narration and listen to previews.

**Actions:**
- Browse stock voices from catalog
- Browse user-uploaded voice recordings
- Play voice preview audio (pre-recorded samples only)
- Select a voice for the project

**Important:** This step only plays existing voice preview audio. No TTS generation occurs here - only voice samples.

**Completion:** Project has `voice_id` set

**Advances to:** Preview

---

### Step 5: Preview
**Route:** `/project/[projectId]/preview`

Generate and preview TTS audio for your selected voice with the full script.

**Actions:**
- Automatically generate TTS audio job using selected voice and script
- Display project summary (name, selected voice, script)
- Show audio player with generated voice audio
- Play generated audio preview
- Review configuration before video composition

**Completion:** TTS audio generated successfully

**Advances to:** Video composition

---

### Step 6: Compose
**Route:** `/project/[projectId]/compose`

Generate the final video composition.

**Actions:**
- Start video generation job with TTS audio
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
- `last_step`: Tracks user's current position in workflow
- `movie_id`: TMDB movie ID selected in Step 1
- `script`: Generated/edited script content from Step 2
- `title`: Project name from Step 3
- `voice_id`: Selected voice ID from Step 4
- `audio_url`: Generated TTS audio URL from Step 5
- `video_url`: Final video URL from Step 6

---

## API Endpoints

### Step Navigation
```
POST /api/v1/projects/{id}/advance?step=preview
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

### Step 5: Preview - TTS Audio Generation
```
POST /api/v1/tts
Body: { 
  "project_id": "id", 
  "script_id": "id", 
  "voice_id": "id",
  "auto_activate": true 
}
Response: { "id": "job-id", "status": "queued" }

GET /api/v1/tts/{job_id}
Response: { 
  "status": "completed", 
  "progress": 100,
  "audio_url": "https://storage.../audio.mp3"
}
```

### Step 6: Compose
```
POST /api/v1/projects/{id}/compose
Body: { "tts_job_id": "job-id" }
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
  state,              // Current project data from API
  isLoading,          // Loading state
  error,              // Error state
  refetch,            // Refetch project data
  advanceStep,        // Move to next step
} = useProjectState(projectId);
```

### Step Advancement

Each step page calls `advanceStep()` when the user completes the step's requirements:

```typescript
// Example from preview page
const handleContinue = async () => {
  await advanceProjectStep(projectId, "compose");
  router.push(`/project/${projectId}/compose`);
};
```

This updates the `last_step` field in the database.

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

The workflow navigation component (`FloatingWorkflowNavigation`) enforces these rules:
- Completed steps are clickable
- Current step is highlighted
- Future steps are disabled
- Can always go back to any completed step

---

## Voice Selection vs TTS Audio

### Step 4: Voice Selection
- **Purpose**: Choose a voice actor for your project
- **Audio**: Plays pre-recorded voice samples (not script-based)
- **Action**: Select a voice to proceed
- **TTS**: None - only preview samples

### Step 5: Preview
- **Purpose**: Hear your full script in the selected voice
- **Audio**: Full TTS-generated audio (script + voice)
- **Action**: Review and confirm audio sounds good
- **TTS**: Auto-generated from script + selected voice

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
- [ ] TTS job starts automatically on page load
- [ ] TTS progress shows correctly
- [ ] When TTS completes, audio player shows
- [ ] Can preview generated audio
- [ ] Next button enabled when TTS complete
- [ ] Back button disabled during TTS generation

### Compose Step (Step 6)
- [ ] Receives TTS job ID from Step 5
- [ ] Can start video generation with TTS
- [ ] Video progress tracks correctly
- [ ] Can download/preview completed video

### Database Persistence
- [ ] last_step value saves correctly after each step
- [ ] Project data persists across sessions
- [ ] TTS job ID stored in project
- [ ] Can query projects and see correct last_step value

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 error playing voice preview | Missing auth token | Frontend includes Authorization header |
| Can't advance past step | Missing required field | Check completion conditions |
| Lost progress after reload | last_step not being saved | Each step calls advanceStep() on completion |
| TTS fails on Step 5 | Missing script or voice | Verify both are selected |
| Video won't generate | No TTS audio | Ensure Step 5 completed successfully |

---

## Complete Workflow Example

1. **User creates new project**
   - Redirected to Step 1 (source)

2. **Step 1 - Select "Inception" movie**
   - movie_id = 27205
   - Advances to Step 2

3. **Step 2 - AI generates script**
   - Script saved to project
   - Advances to Step 3

4. **Step 3 - Names project "Inception Trailer"**
   - title = "Inception Trailer"
   - Advances to Step 4

5. **Step 4 - Selects "Morgan Freeman" voice**
   - Plays voice preview samples
   - voice_id = uuid-morgan
   - Advances to Step 5

6. **Step 5 - Preview page**
   - TTS job auto-creates with script + Morgan Freeman voice
   - Shows TTS generation progress (0-100%)
   - When complete, plays full audio
   - Next button enabled

7. **Step 6 - Compose page**
   - Receives TTS job ID
   - Starts video generation
   - Polls progress (1/4, 2/4, 3/4, 4/4)
   - When complete, plays video

8. **Download or publish**

---

## Future Enhancements

- [ ] Multiple voice actors per project
- [ ] Background music selection
- [ ] Video template customization
- [ ] Batch project creation
- [ ] Collaborative editing
- [ ] Voice customization parameters

---

## Related Documentation

- **Backend API:** Backend docs/API_ENDPOINTS.md
- **Database Schema:** Backend docs/DB_SCHEMA.md
- **Design System:** `/docs/guides/DESIGN_SYSTEM.md`
- **Quick Reference:** `/docs/reference/WORKFLOW_QUICK_REFERENCE.md`

---

**Version:** 2.0 (6-step workflow with TTS in Step 5) | **Updated:** June 25, 2026
