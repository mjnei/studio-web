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

Name your project and configure basic settings. AI-generated thumbnails are generated at this step but displayed later in the workflow.

**Actions:**
- Enter project name/title
- Auto-save on input

**Script Summary Generation (Internal):**
- Automatically generated using Agnes AI when entering Step 3
- Short, punchy tagline (max 60 characters) captures script essence
- Used internally as prompt for thumbnail generation
- Displayed to users at Step 6 for thumbnail customization
- Examples: "Enter the dream", "Reality is malleable", "Time runs out"

**Thumbnail Generation (Background):**
- Automatically triggered when entering Step 3 (details)
- Generated using movie title + script summary/tagline
- **NO TEXT IN IMAGES**: AI instructed to create purely visual thumbnails
- Generation happens in background while user continues workflow
- Displayed and customizable at Step 6 (Compose)

**Display:**
- Project name input field (prominent)
- AI-generated thumbnail in smaller container (md+ screens, below the fold)
- Generation status indicator if still in progress

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

**Display:**
- Full script available via expandable card

**Important:** This step only plays existing voice samples. No TTS generation occurs here - only voice samples.

**Completion:** Project has `voice_id` set

**Advances to:** Preview

---

### Step 5: Preview
**Route:** `/project/[projectId]/preview`

Generate and preview TTS audio for your selected voice with the full script.

**Actions:**
- Automatically generate TTS audio job using selected voice and script (if needed)
- Real-time progress tracking (queued → processing → completed)
- Play generated audio preview
- Review audio quality before proceeding

**Display Priority (Top to Bottom):**
1. **Audio Preview** (first viewport) - Audio player and controls
2. **Project Summary** - Name, selected voice
3. **Full Script** - Expandable card

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

Customize and finalize your project thumbnail. **Video generation happens in the next step (Finalize).**

**Actions:**
- **Thumbnail Customization**:
  - View AI-generated thumbnail (generated in Step 3)
  - Edit overlay text (defaults to script_summary, customizable)
  - Choose text position (left or right half of image)
  - Select text color and font style
  - Preview thumbnail with text overlay in real-time
  - Finalize thumbnail (creates composite image with text and uploads to S3)
  - Re-customize thumbnail anytime if needed

**Display:**
- If thumbnail **NOT confirmed**:
  - Thumbnail preview card (clickable to open editor)
  - Script tagline card
  - Project summary
  - Full script preview (expandable)
  - **Next button**: Disabled until thumbnail confirmed
  
- If thumbnail **confirmed**:
  - Success card showing:
    - "Your thumbnail is ready for video generation"
    - Final confirmed thumbnail image (small preview)
    - Text overlay and base image info
    - "Re-customize thumbnail" link
  - Script tagline card
  - Project summary
  - Full script preview (expandable)
  - **Next button**: Enabled - takes user to Finalize step

**Thumbnail Workflow:**
1. Page loads - shows AI-generated base image preview
2. User clicks to open thumbnail editor modal
3. User edits:
   - Text content (max 200 chars, defaults to script_summary)
   - Position (left or right half)
   - Font (from predefined options)
   - Color (with presets)
4. Real-time preview shows final composite
5. User clicks "Finalize Thumbnail":
   - Backend composites base image + text overlay using PIL/Pillow
   - Uploads final composite image to S3
   - Sets `final_thumbnail_url` and `thumbnail_confirmed = true`
6. User clicks Next → advances to Finalize step

**Important:** 
- This step is ONLY for thumbnail customization
- No video generation happens here
- No credit confirmation modals
- Next button becomes clickable once thumbnail is confirmed

**Completion:** Thumbnail finalized (`thumbnail_confirmed = true`)

**Advances to:** Finalize (where video generation happens)

---

### Step 7: Finalize
**Route:** `/project/[projectId]/finalize`

Generate video (if not yet generated), review completed videos, browse generation history, and manage your project.

**Primary Actions:**

**A. If NO videos generated yet:**
- Prominent "Generate Video" card with:
  - Credit cost indicator (1 credit)
  - Large "Generate Video" button
  - Credit confirmation modal when clicked
  - Starts video generation and shows progress

**B. If video is PROCESSING:**
- Video generation progress component showing:
  - Overall progress (0-100%)
  - Current step being processed (1-4)
  - All 4 generation steps with individual status
- User can leave and return - progress continues
- Auto-refreshes every 3 seconds
- Success toast when complete

**C. If video COMPLETED:**
- Success banner ("Video Complete!")
- Large video player with:
  - Final video playback
  - Finalized thumbnail as poster image
  - Download button
  - Publish button (coming soon)
- Video metadata: date, cost, attempt #

**Video Generation Steps:**
When user clicks "Generate Video", 4 automatic steps are created:
1. **Analyzing audio** — Parse TTS audio file
2. **Syncing with visuals** — Sync audio to video clips
3. **Rendering video** — Encode final video file
4. **Finalizing output** — Upload to storage

Each step tracks progress (0-100%) and status (queued → processing → completed/failed).

**Display Sections (Top to Bottom):**

1. **Primary Action Area** (changes based on state)
   - See A, B, or C above

2. **Video Generation History** (always shown)
   - List of all videos (completed, processing, failed)
   - For each video:
     - Thumbnail preview (16:9 aspect)
     - Video # and generation date/time
     - Status badge (completed/processing/failed)
     - Cost in credits and attempt number
     - Error message (if failed)
     - Download button (if completed)
     - Delete button (all statuses)
   - Most recent first
   - Empty state if no history

3. **Generate Additional Videos** (only if at least one video exists)
   - Credit usage indicator (1 credit required)
   - Current settings preview: script length, voice, thumbnail confirmation
   - "Generate New Video" button (disabled if insufficient credits or thumbnail not confirmed)
   - Regenerates with same script, voice, and thumbnail
   - Creates new VideoJob with incremented attempt number

4. **Project Summary Card**
   - Grid showing: Title, Movie, Voice, Script (word count)
   - Quick reference for project details

5. **Full Script Preview Card** (expandable)
   - Expandable card showing full script
   - Click to open modal with complete script text
   - Shows word count and estimated duration

6. **Return to Projects Button**
   - Navigate back to projects dashboard

**Video History Data:**
Each video in history shows:
- `id` — Unique video job ID
- `status` — "completed", "processing", "queued", or "failed"
- `progress` — 0-100 (overall progress across all 4 steps)
- `video_url` — S3 URL to downloadable MP4 file (if completed)
- `thumbnail_url` — Video thumbnail (if available)
- `credit_cost` — Credits spent to generate this video
- `generation_attempt` — Sequential attempt # (1, 2, 3, etc.)
- `is_published` — Whether video was published to platform
- `error_message` — If failed, reason why
- `created_at` — When video job was created
- `updated_at` — Last status update

**API Endpoints Used:**

```
# Get all videos for project (ordered by creation date, newest first)
GET /api/v1/projects/{projectId}/videos
Response: {
  "videos": [
    {
      "id": "job-789",
      "project_id": 123,
      "status": "completed",
      "progress": 100,
      "video_url": "https://storage.../video.mp4",
      "thumbnail_url": "https://storage.../thumbnail.jpg",
      "credit_cost": 1,
      "generation_attempt": 1,
      "is_published": false,
      "voice_name": "Morgan Freeman",
      "tts_job_id": 456,
      "error_message": null,
      "created_at": "2026-07-06T10:30:00Z",
      "updated_at": "2026-07-06T10:35:00Z",
      ...
    }
  ],
  "total": 3
}

# Get credit status (to show remaining credits)
GET /api/v1/users/me/credits
Response: {
  "credits_remaining": 15,
  ...
}

# Create new video (reuses same script, voice, thumbnail)
POST /api/v1/video?project_id=123&tts_job_id=456
Response: {
  "id": "job-790",
  "status": "queued",
  "progress": 0,
  "generation_attempt": 2,
  ...
}

# Delete a video from history
DELETE /api/v1/projects/{projectId}/videos/{videoId}
Response: 200 OK
```

**Completion:** User views and manages project

**Note:** This is the final step. Project status remains "completed".

---

## Database Schema

### Projects Table

```sql
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed')),
    last_step VARCHAR(50) DEFAULT 'source' CHECK (
        last_step IN ('source', 'script', 'details', 'voice', 'preview', 'compose', 'finalize')
    ),
    
    -- AI-generated suggestions (cached)
    suggested_names JSON,
    script_summary VARCHAR(500),
    
    -- AI-generated thumbnail (base image, no text)
    thumbnail_url VARCHAR(512),
    thumbnail_status VARCHAR(50) DEFAULT 'pending' CHECK (
        thumbnail_status IN ('pending', 'generating', 'completed', 'failed')
    ),
    thumbnail_error VARCHAR(1000),
    
    -- Custom/uploaded thumbnail (optional)
    custom_thumbnail_url VARCHAR(512),
    
    -- Thumbnail text overlay
    thumbnail_text VARCHAR(200),  -- Defaults to script_summary, customizable in Step 6
    
    -- Final thumbnail (used in video metadata)
    final_thumbnail_url VARCHAR(512),  -- Base image + text overlay composite
    thumbnail_confirmed BOOLEAN DEFAULT FALSE,  -- Set to true when user confirms in Step 6
    
    -- Step 1: Movie selection
    movie_id INTEGER REFERENCES tmdb.movies(id) ON DELETE SET NULL,
    
    -- Step 2: Script (active version pointer)
    active_script_id BIGINT REFERENCES project_scripts(id) ON DELETE SET NULL,
    
    -- Step 4-5: Voice/TTS (active job pointer)
    active_tts_job_id BIGINT REFERENCES tts_jobs(id) ON DELETE SET NULL,
    
    -- Step 6: Video (active job pointer)
    active_video_job_id BIGINT REFERENCES video_jobs(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_movie_id ON projects(movie_id);
```

**Key Fields:**
- `last_step`: Tracks user's current position in workflow (7 steps)
- `movie_id`: TMDB movie ID selected in Step 1
- `active_script_id`: Pointer to active script version (Step 2)
- `project_name`: Custom project name from Step 3
- `suggested_names`: Cached AI name suggestions
- `script_summary`: AI-generated tagline for thumbnail prompts and default overlay text
- `thumbnail_url`: AI-generated base thumbnail URL (no text, generated in Step 3)
- `thumbnail_status`: Thumbnail generation status
- `custom_thumbnail_url`: User-uploaded thumbnail (optional, Step 6)
- `thumbnail_text`: Overlay text for thumbnail (defaults to script_summary, customizable in Step 6)
- `final_thumbnail_url`: Composite thumbnail (base + text overlay, created in Step 6)
- `thumbnail_confirmed`: Whether user confirmed thumbnail in Step 6
- `active_tts_job_id`: Pointer to active TTS job (Steps 4-5)
- `active_video_job_id`: Pointer to active video job (Step 6)
- `is_deleted`: Soft delete flag

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
Body: { "project_name": "My Awesome Project" }

# AI thumbnail generation happens automatically in background
# No explicit API call needed - triggered by Step 3 entry
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
# Thumbnail Finalization
POST /api/v1/projects/{id}/thumbnail/finalize
Body: { 
  "thumbnail_text": "Custom overlay text",  // Max 200 chars
  "base_image_url": "https://...",  // AI-generated thumbnail from Step 3
  "text_position": "left" | "right",  // Optional, defaults to center
  "font_style": "bold" | "elegant" | "modern",  // Optional
  "text_color": "#FFFFFF"  // Optional, defaults to white
}
Response: { 
  "final_thumbnail_url": "https://...",  // Composite image (base + text)
  "thumbnail_confirmed": true 
}

# Video Generation (requires confirmed thumbnail)
POST /api/v1/video?project_id={id}&tts_job_id={tts_id}
Response: { 
  "id": 123,
  "project_id": 456,
  "status": "queued",
  "progress": 0,
  "steps": [
    { "step_number": 1, "step_name": "Analyzing audio", "status": "queued", "progress": 0 },
    { "step_number": 2, "step_name": "Syncing with visuals", "status": "queued", "progress": 0 },
    { "step_number": 3, "step_name": "Rendering video", "status": "queued", "progress": 0 },
    { "step_number": 4, "step_name": "Finalizing output", "status": "queued", "progress": 0 }
  ]
}

# Get video job status
GET /api/v1/video/{job_id}
Response: {
  "id": 123,
  "status": "processing",
  "progress": 45,  // Overall progress 0-100
  "video_url": null,  // Available when status = "completed"
  "steps": [ ... ]  // 4 generation steps with individual progress
}

# List all video attempts for project
GET /api/v1/video/project/{project_id}/list
Response: [
  { "id": 123, "status": "completed", "video_url": "...", ... },
  { "id": 122, "status": "completed", "video_url": "...", ... },
  { "id": 121, "status": "failed", "error_message": "...", ... }
]
```

**Video Job Statuses:**
- `queued` — Job waiting to be processed
- `processing` — Video being generated (steps 1-4 in progress)
- `completed` — Video ready (video_url available)
- `failed` — Generation failed (error_message available)

### Step 7: Finalize
```
# Get all videos for project (for Finalize page)
GET /api/v1/projects/{project_id}/videos
Response: {
  "videos": [
    {
      "id": "job-789",
      "status": "completed",
      "progress": 100,
      "video_url": "https://storage.../video.mp4",
      "thumbnail_url": "https://storage.../thumbnail.jpg",
      "credit_cost": 1,
      "generation_attempt": 1,
      "is_published": false,
      "voice_name": "Morgan Freeman",
      "created_at": "2026-07-06T10:35:00Z",
      ...
    }
  ],
  "total": 3
}

# Get user credit status
GET /api/v1/users/me/credits
Response: {
  "credits_remaining": 15,
  "credits_used": 5,
  ...
}

# Regenerate video (creates new attempt)
POST /api/v1/projects/{project_id}/regenerate-video
Response: {
  "id": "job-790",
  "status": "queued",
  "generation_attempt": 2,
  ...
}

# Delete video from history
DELETE /api/v1/projects/{project_id}/videos/{video_id}
Response: 200 OK
```

---

## Frontend Implementation

### File Structure

```
src/app/project/
  [projectId]/
    source/page.tsx          # Step 1
    script/page.tsx          # Step 2
    details/page.tsx         # Step 3 - Shows small AI thumbnail preview (md+ screens)
    voice/page.tsx           # Step 4
    preview/page.tsx         # Step 5 - Audio preview (no thumbnail)
    compose/page.tsx         # Step 6 - Thumbnail editor + video generation
    finalize/page.tsx        # Step 7 - Shows final thumbnail as video poster

src/components/project/
  ThumbnailEditor.tsx        # Step 6 thumbnail customization component

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
// Example from compose page - only advance after thumbnail is confirmed
const handleStartVideoGeneration = async () => {
  if (!project.thumbnail_confirmed) {
    toast.error("Please finalize your thumbnail first");
    return;
  }
  
  await createVideoJob(projectId, ttsJobId);
  // Wait for video completion...
  await advanceProjectStep(projectId, "finalize");
  router.push(`/project/${projectId}/finalize`);
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
- [ ] AI-generated thumbnail displays correctly
- [ ] Re-generate thumbnail button works
- [ ] Upload custom thumbnail works
- [ ] Text overlay input shows script tagline by default
- [ ] Can edit overlay text
- [ ] Preview shows thumbnail + text overlay in real-time
- [ ] Finalize thumbnail button creates composite image
- [ ] Video generation button disabled until thumbnail confirmed
- [ ] Receives TTS job ID from Step 5
- [ ] Can start video generation with confirmed thumbnail
- [ ] Video progress tracks correctly
- [ ] Next button enabled when video complete

### Finalize Step (Step 7)
- [ ] Displays finalized thumbnail (with text overlay)
- [ ] Thumbnail is read-only (no edit buttons)
- [ ] Shows final video player
- [ ] Video uses finalized thumbnail as poster
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
   - Views AI-generated thumbnail (from Step 3)
   - Edits overlay text: "A mind-bending heist"
   - Finalizes thumbnail → Creates composite image
   - Receives TTS job ID
   - Starts video generation
   - Polls progress (1/4, 2/4, 3/4, 4/4)
   - When complete, shows video preview

8. **Step 7 - Finalize page**
   - Reviews project summary
   - Views finalized thumbnail with text overlay
   - Plays final video (thumbnail as poster)
   - Downloads or publishes

9. **Complete**

---

## Future Enhancements

- [ ] Advanced thumbnail text styling (font, color, position, shadow)
- [ ] Thumbnail templates library
- [ ] Multiple thumbnail variants A/B testing
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
