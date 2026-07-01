# Project Creation Workflow

**Last Updated:** June 25, 2026 | **Status:** ✅ Production Ready

---

## Overview

A streamlined 7-step workflow for creating video projects from movie trailers. Each step can be revisited, and all progress is automatically saved to the database.

```
Source → Script → Details → Voice → Preview → Compose → Finalize
```

**Key Features:**
- ✅ Database-backed persistence
- ✅ Non-linear navigation (revisit any step)
- ✅ Step progress tracking via `last_step` field
- ✅ Voice sample playback (Step 4: pre-recorded audio samples)
- ✅ TTS audio generation (Step 5: full script with voice)
- ✅ Mobile responsive & accessible
- ✅ Exit and resume anytime

---

## The 7 Steps

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

Name your project and configure basic settings. AI-generated thumbnails become available at this step.

**Actions:**
- Enter project name/title
- Auto-save on input
- View AI-generated thumbnail (if completed)
- See thumbnail generation status

**Thumbnail Generation:**
- Automatically triggered when entering Step 3 (details)
- Generated using project name + script summary
- Displayed once status = "completed"
- Shows "Generating..." indicator while in progress

**Completion:** Project has a name/title

**Advances to:** Voice selection

---

### Step 4: Voice Selection
**Route:** `/project/[projectId]/voice`

Choose a voice for your voiceover narration and listen to voice samples.

**Actions:**
- Browse stock voices from catalog
- Browse user-uploaded voice recordings
- Play voice samples (pre-recorded audio only)
- Record your own voice
- Select a voice for the project

**Important:** This step only plays existing voice samples. No TTS generation occurs here - only voice samples.

**Completion:** Project has `voice_id` set

**Advances to:** Preview

---

### Step 5: Preview
**Route:** `/project/[projectId]/preview`

Generate and preview TTS audio for your selected voice with the full script. View project thumbnail.

**Actions:**
- Automatically generate TTS audio job using selected voice and script (if needed)
- Display project summary (name, selected voice, script)
- View AI-generated project thumbnail
- Real-time progress tracking (queued → processing → completed)
- Show audio player with generated voice audio when complete
- Play generated audio preview
- Review configuration before video composition

**TTS Generation:**
- Job auto-created when page loads (if needed)
- **Advanced Smart Job Management:**
  - ✅ **Content-based matching**: Compares voice_id + first 2 sentences of script
  - ✅ **Reuses existing audio**: If same voice + same first 2 sentences, no new job needed
  - ✅ **Handles script edits**: Edits to later parts of script don't trigger new TTS generation
  - ✅ **Voice switching intelligence**: Changing voice back to a previous choice reuses old audio
  - ✅ **Script updates**: Automatically updates job's script_id reference when reusing
  - ✅ **Prevents duplicates**: No redundant jobs for same voice + preview text combination
  
**Example Scenarios:**
1. Edit middle of script → Reuses audio ✅
2. Change first sentence → Creates new job ✅
3. Change voice to A, then back to B → Reuses B's audio ✅
- Published to RabbitMQ queue for async processing
- 3rd party TTS service generates audio
- Results sent back via RabbitMQ
- Frontend polls for status updates every 2 seconds
- Audio player appears when status = "completed"

**Technical Flow:**
1. Frontend: `POST /api/v1/tts` → Creates job with status "queued"
2. Backend: Publishes job to `tts_jobs` RabbitMQ queue
3. TTS Service: Picks up job, generates audio, updates progress
4. TTS Service: Publishes result to `tts_results` queue
5. Backend Consumer: Updates database with audio_url and status
6. Frontend: Polls `GET /api/v1/tts/{job_id}` every 2s
7. Frontend: Displays audio player when complete

**Completion:** TTS audio generated successfully (status = "completed")

**Advances to:** Video composition

---

### Step 6: Compose
**Route:** `/project/[projectId]/compose`

Generate the final video composition. View project thumbnail.

**Actions:**
- View AI-generated project thumbnail
- Start video generation job with TTS audio
- Track async video processing progress
- Preview composed video

**Completion:** Video file generated and available

**Advances to:** Finalize

---

### Step 7: Finalize
**Route:** `/project/[projectId]/finalize`

Review, publish, or download your completed project. Thumbnail is used as video poster.

**Actions:**
- View AI-generated project thumbnail
- Review project summary and final video
- Download video file
- Publish to platform (YouTube, social media, etc.)
- Return to projects list

**Video Player:**
- Uses AI-generated thumbnail as video poster image
- Provides professional preview before playback

**Completion:** Project published or downloaded

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
    thumbnail_url VARCHAR(512),
    thumbnail_status VARCHAR(50) CHECK (
        thumbnail_status IN ('pending', 'generating', 'completed', 'failed')
    ),
    last_step VARCHAR(50) CHECK (
        last_step IN ('source', 'script', 'details', 'voice', 'preview', 'compose', 'finalize')
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
- `thumbnail_url`: AI-generated thumbnail URL (available from Step 3+)
- `thumbnail_status`: Thumbnail generation status (pending, generating, completed, failed)
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
  "project_id": 123, 
  "script_id": 456, 
  "voice_id": "voice-uuid"
}
Response: { 
  "id": 789,
  "status": "queued",
  "progress": 0,
  ...
}

GET /api/v1/tts/{job_id}
Response: { 
  "id": 789,
  "status": "completed", 
  "progress": 100,
  "audio_url": "https://storage.../audio.mp3",
  "audio_duration": 180.5
}
```

**TTS Job Statuses:**
- `queued` - Job waiting in RabbitMQ queue
- `processing` - Audio being generated (progress 0-100)
- `completed` - Audio ready (audio_url available)
- `failed` - Generation failed (error_message available)

### Step 6: Compose
```
POST /api/v1/projects/{id}/compose
Body: { "tts_job_id": "job-id" }
Response: { "job_id": "job-123", "status": "queued" }

GET /api/v1/jobs/{job_id}/status
Response: { "status": "processing", "progress": 45 }
```

### Step 7: Finalize
```
GET /api/v1/projects/{id}
Response: { 
  "id": 123,
  "title": "My Project",
  "video_url": "https://storage.../video.mp4",
  "thumbnail_url": "https://storage.../thumbnail.jpg",
  ...
}

POST /api/v1/projects/{id}/publish
Body: { "platform": "youtube", "metadata": {...} }
Response: { "published": true, "url": "https://youtube.com/..." }
```

---

## Frontend Implementation

### File Structure

```
src/app/project/
  [projectId]/
    source/page.tsx          # Step 1
    script/page.tsx          # Step 2
    details/page.tsx         # Step 3 - Shows AI thumbnail
    voice/page.tsx           # Step 4
    preview/page.tsx         # Step 5 - Shows AI thumbnail
    compose/page.tsx         # Step 6 - Shows AI thumbnail
    finalize/page.tsx        # Step 7 - Shows AI thumbnail + uses as video poster

src/lib/
  project-client.ts          # API client functions (includes thumbnail fields)
  hooks/
    use-project-state.ts     # Project state management hook (includes thumbnail fields)
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
| Finalize | ❌ No | Compose completed |

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
- **Audio**: Plays voice samples (not script-based)
- **Action**: Select a voice to proceed
- **TTS**: None - only voice samples

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
- [ ] Click play on stock voice - audio sample plays
- [ ] Click play on user recording - audio sample plays
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
- [ ] Next button enabled when video complete

### Finalize Step (Step 7)
- [ ] Displays project summary correctly
- [ ] Shows final video player
- [ ] Download button works
- [ ] Publish button works
- [ ] Can return to projects list

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
   - Plays voice audio samples
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
   - When complete, shows video preview

8. **Step 7 - Finalize page**
   - Reviews project summary
   - Plays final video
   - Downloads or publishes

9. **Complete**

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
- **Quick Reference:** `/docs/reference/WORKFLOW_QUICK_REFERENCE.md`

---

**Version:** 3.0 (7-step workflow with Finalize step) | **Updated:** July 1, 2026
