# Project Creation Workflow

**Last Updated:** July 22, 2026 | **Status:** ✅ Production Ready

---

## Overview

A streamlined 7-step workflow for creating video projects from movie trailers. Each step can be revisited, and all progress is automatically saved to the database.

```
Source → Script → Voice → Details → Preview → Compose → Export
```

**Project Creation Entry Points:**

1. **From Dashboard/Projects**: Navigate to `/project/new/source` to browse and select a movie, then continue to script creation
2. **From Movie Details**: Click "Create Project" on any movie details page (`/movies/{id}`) to skip movie selection and go directly to script creation

Both entry points lead to `/project/new/script` where the project is created when the first script is saved.

**Navigation:** All pages use unified `FloatingWorkflowNavigation` component with:
- Back button (hidden on Step 1, visible on all other steps)
- Home button (always visible, returns to projects list)
- Next/Continue button (visible when step requirements are met)
- Step progress indicator showing all 7 steps
- Auto-hide on scroll down, show on scroll up
- Responsive sizing for mobile, tablet, and desktop

**Key Features:**
- ✅ Database-backed persistence
- ✅ Non-linear navigation (revisit any step)
- ✅ Step progress tracking via `last_step` field
- ✅ Background AI job scheduling (name suggestions, thumbnail generation)
- ✅ Voice sample playback (Step 3: pre-recorded audio samples)
- ✅ TTS audio generation (Step 5: full script with voice)
- ✅ Mobile responsive & accessible (unified navigation buttons)
- ✅ Exit and resume anytime
- ✅ Consistent UI patterns across all steps

---

## Project Creation Entry Points

### Entry Point 1: Browse Movies First
**Flow**: Dashboard → New Project → Browse Movies → Select Movie → Write Script → Create Project

1. User clicks "New Project" from dashboard or projects page
2. Navigates to `/project/new/source`
3. Browses and selects a movie
4. Movie data stored in sessionStorage
5. Continues to `/project/new/script`
6. Writes script and clicks "Save"
7. Project created with movie + script, redirects to `/project/{id}/voice`

### Entry Point 2: Start from Movie Details
**Flow**: Movie Details → Create Project → Write Script → Create Project

1. User browses movies at `/movies` or searches for a specific movie
2. Clicks on a movie to view details at `/movies/{id}`
3. Clicks "Create Project" button
4. Movie data stored in sessionStorage
5. Directly navigates to `/project/new/script` (skips movie selection)
6. Writes script and clicks "Save"
7. Project created with movie + script, redirects to `/project/{id}/voice`

**Key Implementation Detail**: Both entry points use sessionStorage to pass movie data to the script creation page, where the actual project is created via the `createScript()` API call with `movie_id` parameter.

---

## The 7 Steps

### Step 1: Source Selection
**Route:** `/project/[projectId]/source`

Select a movie from TMDB to base your project on.

**Actions:**
- Browse TMDB movies with search
- Click to select a movie
- Movie metadata saved to project

**Navigation:**
- Back button: Hidden (first step)
- Home button: Visible (returns to projects list)
- Next button: Visible when movie selected

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
- Save changes (auto-saved on Continue)

**Navigation:**
- Back button: Visible (returns to Source)
- Home button: Visible
- Next button: Visible when script exists

**Note:** Script changes auto-save in background when clicking Continue - no need to wait for save completion before navigation

**Completion:** Project has script content saved

**Advances to:** Voice selection

---

### Step 3: Voice Selection
**Route:** `/project/[projectId]/voice`

Choose a voice for your voiceover narration, listen to voice samples, and schedule Agnes AI jobs for name suggestions and thumbnail generation.

**Actions:**
- Browse stock voices from catalog
- Browse user-uploaded voice recordings
- Play voice samples (pre-recorded audio only)
- Record your own voice
- Select a voice for the project
- Schedule TTS job for audio generation (happens on Continue button)

**Navigation:**
- Back button: Visible (returns to Script)
- Home button: Visible
- Next button: Visible when voice selected, triggers TTS job scheduling

**Background Jobs:**
- Name suggestions and thumbnail generation start automatically
- Non-blocking - user can select voice while AI processes
- Results available in next steps if ready

**Display:**
- Full script available via expandable card

**Important:** This step plays existing voice samples only. TTS audio generation is scheduled when clicking Continue.

**Completion:** Project has `voice_id` set, TTS job scheduled

**Advances to:** Project details

---

### Step 4: Project Details
**Route:** `/project/[projectId]/details`

Name your project using AI-generated suggestions or custom input.

**Actions:**
- View AI-generated name suggestions (or local fallbacks if still generating)
- Select a suggested name or enter custom name
- Auto-save on input

**Navigation:**
- Back button: Visible (returns to Voice)
- Home button: Visible
- Next button: Visible when project name entered

**AI Name Suggestions:**
- Generated in background starting from Step 3
- Based on movie title and script content
- Displayed if available; local fallbacks always provided
- User can enter custom name anytime

**Thumbnail Preview:**
- AI-generated thumbnail shown if generation complete
- Displayed in smaller container on md+ screens
- Shows loading state if generation is processing
- Fully customizable later in Step 6 (Compose)

**Display:**
- Project name input field
- AI-generated or local fallback suggestions
- Thumbnail preview (if available)

**Completion:** Project has a name/title

**Advances to:** Preview

---

### Step 5: Preview
**Route:** `/project/[projectId]/preview`

Generate and preview TTS audio for your selected voice with the full script.

**Actions:**
- Listen to TTS audio generated from script + selected voice
- Real-time progress tracking (queued → processing → completed)
- Play and review audio quality before proceeding

**Navigation:**
- Back button: Visible (returns to Details)
- Home button: Visible
- Next button: Enabled when TTS generation complete

**Display Priority (Top to Bottom):**
1. **Audio Preview** (first viewport) - Audio player and controls
2. **Project Summary** - Name, selected voice
3. **Full Script** - Expandable card

**TTS Generation:**
- Job created automatically when advancing from Step 3 (Voice)
- Smart matching prevents duplicate generation:
  - Compares voice + first 2 sentences of script
  - Reuses existing audio if no changes to these
  - Handles later script edits efficiently
  - Regenerates only when voice or opening changes
- Processing details:
  - Published to RabbitMQ for async processing
  - 3rd party TTS service generates audio
  - Frontend uses SSE (Server-Sent Events) for real-time updates
  - Fallback to polling if SSE unavailable
  - Audio player appears when generation completes

**Technical Flow:**
1. Frontend: `POST /api/v1/tts` → Creates job with status "queued"
2. Backend: Publishes job to `tts_jobs` RabbitMQ queue
3. TTS Service: Picks up job, generates audio, updates progress
4. TTS Service: Publishes result to `tts_results` queue
5. Backend Consumer: Updates database with audio_url and status
6. Frontend: SSE connection receives real-time updates (fallback: 5s polling)
7. Frontend: Displays audio player when complete

**Completion:** TTS audio generated successfully (status = "completed")

**Advances to:** Compose (thumbnail customization)

---

### Step 6: Compose
**Route:** `/project/[projectId]/compose`

Customize and finalize your project thumbnail. **Video generation happens in the next step (Export).**

**Actions:**
- **Thumbnail Customization**:
  - View AI-generated thumbnail (generated in Step 3)
  - Edit overlay text (defaults to script_summary, customizable)
  - Choose text position (left or right half of image)
  - Select text color and font style
  - Preview thumbnail with text overlay in real-time
  - Finalize thumbnail (creates composite image with text and uploads to S3)
  - Re-customize thumbnail anytime if needed
  - Regenerate base thumbnail with new AI generation

**Navigation:**
- Back button: Visible (returns to Preview)
- Home button: Visible
- Next button: Always enabled (advances to Export)

**Display:**
- Thumbnail preview card (clickable icons for Regenerate and Edit actions)
- Script tagline card (shows default text overlay)
- Project summary (movie, voice, script stats)
- Full script preview (expandable)

**Thumbnail Workflow:**
1. Page loads - shows AI-generated base image preview
2. User clicks Edit icon to open thumbnail editor modal
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
6. User clicks Next → advances to Export step

**Regenerate Thumbnail:**
- User can click Regenerate icon at any time
- Creates new AI-generated base image
- Resets customizations
- Takes 10-30 seconds

**Important:** 
- This step is ONLY for thumbnail customization
- No video generation happens here
- No credit confirmation modals
- Next button is always enabled

**Completion:** Ready to proceed to Export

**Advances to:** Export (where video generation happens)

---

### Step 7: Export
**Route:** `/project/[projectId]/export`

Generate final video, manage versions, and export in different formats.

**Actions:**
- **Generate Video**: Schedule video generation job (submits to `video_jobs` RabbitMQ queue)
- **View Status**: Monitor video generation status (completed/processing/failed)
- **Version Management**: View all generated versions, switch between them
- **Download**: Download completed videos
- **Export Options**: Select format, resolution, FPS, quality (MP4 currently supported)
- **Share**: Share videos to X (Twitter) and WeChat (copies URL)
- **Delete**: Remove unwanted video versions from history

**Navigation:**
- Back button: Visible (returns to Compose)
- Home button: Visible
- Next button: Hidden (final step)

**Video Generation Flow:**
1. User clicks "Generate Video" button
2. Credit confirmation modal appears (shows cost, balance)
3. After confirmation, job submitted to `video_jobs` RabbitMQ queue
4. External video service processes job (internal processing steps not visible)
5. Service publishes result to `video_results` queue
6. Backend consumer updates database with video URL and overall progress
7. Frontend receives notification via SSE (or polls as fallback)
8. Completed video appears in the list

**Status Tracking:**
- Video jobs show simple status: `queued` → `processing` → `completed`/`failed`
- Overall progress percentage (0-100%) shown for processing jobs
- No granular step breakdown (processing happens internally)

**Display Sections (Top to Bottom):**

1. **Header with Status Overview**
   - Page title and description
   - Info tooltip with credits and quick tips
   - Status cards: Completed count, Processing count, Failed count

2. **Primary Video Display** (when video exists)
   - Version selector (if multiple versions)
   - Video player with controls
   - Video metadata (voice, cost, date, status)
   - Action buttons: Download, Export Format, Share

3. **Generate CTA** (when no videos exist)
   - Credit usage indicator
   - Generate button with credit confirmation
   - Centered, prominent call-to-action

4. **Processing Videos Section**
   - Shows videos currently being generated
   - Status badge (queued/processing)
   - Overall progress bar (0-100%)
   - Estimated time remaining (if available)

5. **Failed Videos Section**
   - Shows failed generation attempts
   - Error message display
   - Delete button

6. **All Versions History** (collapsible)
   - Expandable list of all video versions
   - Thumbnail preview for each
   - View, Download, Delete actions
   - Most recent first

7. **Return to Projects Button**

**Export Format Modal:**
- Format selection (MP4, WebM, MOV - only MP4 active)
- Resolution dropdown (4K, Full HD, HD, SD)
- Frame rate dropdown (60, 30, 24 FPS)
- Quality dropdown (High, Medium, Low)
- Export summary with selected options
- Note: Advanced options coming soon

**Share Modal:**
- X (Twitter) - Copies video URL
- WeChat - Copies video URL  
- More platforms coming soon

**Status Updates:**
- Real-time via SSE (Server-Sent Events) when available
- Fallback to 10-second polling when SSE unavailable
- Notifications show when videos complete
- Auto-refresh video list on completion

**Completion:** User downloads video or shares to platform

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
        last_step IN ('source', 'script', 'voice', 'details', 'preview', 'compose', 'finalize')
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

### Step 3: Voice Selection
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

### Step 4: Project Details
```
PATCH /api/v1/projects/{id}
Body: { "project_name": "My Awesome Project" }

# AI thumbnail generation happens automatically in background
# No explicit API call needed - triggered by Step 3 entry
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
POST /api/v1/projects/{id}/thumbnail/export
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
  "progress": 0
}

# Get video job status
GET /api/v1/video/{job_id}
Response: {
  "id": 123,
  "status": "processing",
  "progress": 45,  // Overall progress 0-100
  "video_url": null  // Available when status = "completed"
}

# List all video attempts for project
GET /api/v1/video/project/{project_id}/list
Response: [
  { "id": 123, "status": "completed", "video_url": "...", "progress": 100, ... },
  { "id": 122, "status": "completed", "video_url": "...", "progress": 100, ... },
  { "id": 121, "status": "failed", "error_message": "...", "progress": 35, ... }
]
```

**Video Job Statuses:**
- `queued` — Job waiting to be processed (progress: 0%)
- `processing` — Video being generated (progress: 1-99%)
- `completed` — Video ready (progress: 100%, video_url available)
- `failed` — Generation failed (error_message available, progress shows where it stopped)

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

# Get user credit status (displayed in header)
GET /api/v1/users/me/credits
Response: {
  "credits_remaining": 15,
  "credits_used": 5,
  ...
}

# Regenerate video (inline button in Video History header)
# Creates new attempt with same script, voice, and thumbnail
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
    voice/page.tsx           # Step 3 - Voice selection + Agnes scheduling
    details/page.tsx         # Step 4 - Project naming + AI suggestions
    preview/page.tsx         # Step 5 - Audio preview
    compose/page.tsx         # Step 6 - Thumbnail editor
    finalize/page.tsx        # Step 7 - Video generation & management

src/components/project/
  floating-workflow-navigation.tsx  # Unified navigation component (all steps use this)
  ThumbnailEditor.tsx        # Step 6 thumbnail customization component

src/lib/
  project-client.ts          # API client functions (includes thumbnail fields + scheduleAgnesJobs)
  hooks/
    use-project-state.ts     # Project state management hook (includes thumbnail fields)
    use-sse.ts               # Server-Sent Events hook for real-time updates
```

### Navigation Component

All step pages use the unified `FloatingWorkflowNavigation` component with consistent behavior:

```typescript
<FloatingWorkflowNavigation
  projectId={projectId}
  currentStep="voice"          // Current step key
  canGoNext={!!selectedVoiceId} // Enable/disable Next button
  nextLabel="Continue to Details" // Optional custom label (defaults to "Continue to [Step]")
  onNext={handleContinue}      // Optional custom handler (defaults to route navigation)
  canGoBack={true}             // Enable/disable Back button (false for Step 1)
  backLabel="Back"             // Optional custom label
  onBack={handleBack}          // Optional custom handler (defaults to route navigation)
  isProcessing={isAdvancing}   // Show loading state
/>
```

**Button Behavior:**
- **Back button:** Uses `leftIcon` prop with `ArrowLeft` icon - icon always visible
- **Home button:** Uses `leftIcon` prop with `Home` icon - icon always visible
- **Next button:** Uses `rightIcon` prop with `ArrowRight` icon - icon always visible

**Mobile Responsiveness:**
- Icons: 3.5w/3.5h on mobile, 4w/4h on sm+ screens
- Button text: Hidden on mobile (shows "Back"/"Next" only), full labels on sm+ screens
- Button sizes: sm on mobile, md on larger screens
- Touch targets: `touch-manipulation` class for better mobile interaction

### State Management Hook

```typescript
const {
  state,              // Current project data from API
  isLoading,          // Loading state
  error,              // Error state
  refetch,            // Refetch project data
  advanceStep,        // Move to next step (deprecated - use direct API call)
} = useProjectState(projectId);
```

### Navigation Patterns

**Default Navigation (No Custom Handler):**
```typescript
<FloatingWorkflowNavigation
  projectId={projectId}
  currentStep="source"
  canGoNext={!!state?.movieId}
  canGoBack={false}  // Hidden on Step 1
/>
// Next button automatically navigates to /project/{id}/script
// Back button hidden on Step 1
```

**Custom Navigation Handler:**
```typescript
const handleContinue = async () => {
  // Perform async operations (save data, schedule jobs, etc.)
  await updateProjectName(projectId, projectName);
  await advanceProjectStep(projectId, "details");
  
  // Navigate manually
  router.push(`/project/${projectId}/preview`);
};

<FloatingWorkflowNavigation
  projectId={projectId}
  currentStep="details"
  canGoNext={!!projectName.trim()}
  onNext={handleContinue}
  canGoBack={true}
  isProcessing={savingName}
/>
```

### Step Advancement

Each step page calls `advanceProjectStep()` when the user completes the step's requirements:

```typescript
// Example from voice page - schedule TTS job and advance
const handleContinue = async () => {
  if (!selectedVoiceId || !activeScript?.id) return;

  setIsAdvancing(true);
  try {
    // Schedule TTS job with selected voice
    await createTTSJob({
      projectId,
      scriptId: activeScript.id,
      voiceId: String(selectedVoiceId),
      voiceName: voice?.name,
      autoActivate: true,
    });

    // Advance to details step
    await advanceProjectStep(projectId, "voice");

    // Navigate to details page
    router.push(`/project/${projectId}/details`);
    toastSuccess("Voice selected", "Proceeding to project details");
  } catch (error) {
    console.error("Failed to schedule TTS job:", error);
    toastError("Failed to schedule audio generation", "Please try again");
  } finally {
    setIsAdvancing(false);
  }
};
```

This updates the `last_step` field in the database.

---

## Navigation Rules

### Step Access Control

| Step | Always Accessible | Requires Previous Steps | Back Button | Next Button |
|------|-------------------|-------------------------|-------------|-------------|
| Source | ✅ Yes | None | ❌ Hidden | ✅ Visible when movie selected |
| Script | ❌ No | Source completed | ✅ Visible | ✅ Visible when script exists |
| Voice | ❌ No | Script completed | ✅ Visible | ✅ Visible when voice selected |
| Details | ❌ No | Voice completed | ✅ Visible | ✅ Visible when name entered |
| Preview | ❌ No | Details completed | ✅ Visible | ✅ Visible when TTS complete |
| Compose | ❌ No | Preview completed | ✅ Visible | ✅ Always visible |
| Finalize | ❌ No | Compose completed | ✅ Visible | ❌ Hidden (final step) |

### Navigation Component Usage

The workflow navigation component (`FloatingWorkflowNavigation`) enforces these rules:
- Completed steps are clickable in the step indicator
- Current step is highlighted with ring effect
- Future steps are shown but not clickable
- Back button hidden only on Step 1 (Source)
- Next button visibility controlled by `canGoNext` prop
- Home button always visible (returns to projects list)
- Auto-hides on scroll down, shows on scroll up for better content viewing
- Responsive sizing and touch targets for mobile devices

---

## Voice Selection vs TTS Audio

### Step 3: Voice Selection
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
- [ ] Verify Back button hidden on Step 1
- [ ] Verify Back button visible on Steps 2-7
- [ ] Verify Home button always visible and functional
- [ ] Verify Next button shows correct labels for each step
- [ ] Test navigation on mobile, tablet, and desktop
- [ ] Verify icons display correctly on mobile (ArrowLeft, Home, ArrowRight)
- [ ] Test touch targets on mobile devices

### Voice Selection (Step 3)
- [ ] Browse stock voices
- [ ] Browse user recordings
- [ ] Click play on stock voice - audio sample plays
- [ ] Click play on user recording - audio sample plays
- [ ] No 401 errors when playing audio
- [ ] Agnes jobs scheduled in background (non-blocking)
- [ ] Select a voice and continue
- [ ] TTS job scheduled when clicking Continue

### Details Page (Step 4)
- [ ] AI name suggestions displayed if cached
- [ ] Shows loading state if names generating
- [ ] Polling fetches names when ready
- [ ] Timeout after 60 seconds with fallback
- [ ] Local fallback suggestions always available
- [ ] User can select AI suggestion or enter custom name
- [ ] Thumbnail preview shown if generation complete
- [ ] Continue button saves name and navigates to Preview

### Preview Step (Step 5)
- [ ] TTS job already scheduled from Step 3
- [ ] TTS progress shows correctly
- [ ] When TTS completes, audio player shows
- [ ] Can preview generated audio
- [ ] Next button enabled when TTS complete
- [ ] Back button disabled during TTS generation

### Compose Step (Step 6)
- [ ] Page checks thumbnail status on load
- [ ] Shows loading state if thumbnail generating
- [ ] Schedules thumbnail if not ready (fallback)
- [ ] Polls for thumbnail status every 8 seconds (reduced from 5s)
- [ ] AI-generated thumbnail displays when ready
- [ ] Regenerate thumbnail button works (opens confirmation modal)
- [ ] Edit thumbnail button works (opens editor modal)
- [ ] Text overlay input shows script tagline by default
- [ ] Can edit overlay text
- [ ] Preview shows thumbnail + text overlay in real-time
- [ ] Finalize thumbnail button creates composite image
- [ ] Composition status polling works (5s interval, fallback for SSE)
- [ ] Next button always enabled (no longer dependent on thumbnail confirmation)
- [ ] Successfully advances to Finalize step

### Export Step (Step 7)
- [ ] Displays proper UI based on video generation state (A/B/C)
- [ ] Generate Video button shows credit confirmation modal
- [ ] Credit confirmation modal shows correct balance calculations
- [ ] Video generation starts after modal confirmation
- [ ] Overall progress bar displays (0-100%)
- [ ] Progress updates every 5 seconds via SSE (fallback to polling)
- [ ] Can leave and return - progress persists
- [ ] Video player displays when generation complete
- [ ] Video uses finalized thumbnail as poster image
- [ ] Download button works
- [ ] Video History section displays all attempts
- [ ] Regenerate button in header shows credit confirmation
- [ ] Video metadata collapsible sections work
- [ ] Delete video button works
- [ ] Project Summary collapsible section works
- [ ] Back button returns to Compose step
- [ ] Home button returns to projects list
- [ ] Next button hidden (final step)

---

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
| Video won't generate | Missing TTS audio or thumbnail | Ensure Steps 5 & 6 completed successfully |
| Back button icon not showing on mobile | Using `icon` prop instead of `leftIcon` | Use `leftIcon` prop for left-aligned icons |
| Next button icon not showing on mobile | Using `icon` prop instead of `rightIcon` | Use `rightIcon` prop for right-aligned icons |
| Navigation buttons too small on mobile | Missing responsive sizing | Use sm size on mobile, md on larger screens |
| Polling too frequent causing performance issues | Polling every 2 seconds | Reduce to 5-8 seconds, use SSE for real-time updates |

---

## AI Background Job Scheduling

AI jobs (project name suggestions and thumbnail generation) are handled automatically in the background without blocking the user workflow.

### How It Works

1. **Step 3 - Voice Page**: When user selects a voice, background jobs are queued to generate:
   - AI name suggestions (using script + movie data)
   - AI-generated thumbnail image (base image without text overlay)

2. **Step 4 - Details Page**: 
   - AI suggestions are fetched if available, with local fallbacks if generation is still processing
   - User can select suggestions or enter custom name

3. **Step 6 - Compose Page**:
   - AI-generated thumbnail is available for customization
   - User adds text overlay and finalizes the thumbnail

### Resilience & Fallbacks

- **Automatic retries**: Failed jobs retry up to 3 times with exponential backoff
- **Local fallbacks**: If AI generation fails or times out, default suggestions and upload options are always available
- **No user blocking**: AI processing happens in background; users can proceed anytime

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

4. **Step 3 - Selects "Morgan Freeman" voice**
   - Plays voice audio samples
   - Selects voice: voice_id = uuid-morgan
   - **Agnes jobs scheduled in background:**
     - `generate_names` job queued
     - `generate_image` job auto-chains after names
   - Clicks Continue → TTS job scheduled
   - Advances to Step 4

5. **Step 4 - Names project "Inception Trailer"**
   - AI name suggestions displayed (generated in Step 3)
   - Selects "Inception Trailer" from AI suggestions
   - title = "Inception Trailer"
   - Advances to Step 5

6. **Step 5 - Preview page**
   - TTS job already scheduled from Step 3
   - Shows TTS generation progress (0-100%)
   - When complete, plays full audio
   - Next button enabled
   - Advances to Step 6

7. **Step 6 - Compose page**
   - Checks thumbnail status
   - Views AI-generated thumbnail (generated in Step 3)
   - Edits overlay text: "A mind-bending heist"
   - Finalizes thumbnail → Creates composite image
   - Receives TTS job ID from Step 5
   - Starts video generation
   - Polls progress (1/4, 2/4, 3/4, 4/4)
   - When complete, shows video preview

8. **Step 7 - Finalize page**
   - Reviews project summary
   - Views finalized thumbnail with text overlay
   - Plays final video (thumbnail as poster)
   - Downloads or publishes

9. **Complete**

**Total time saved:** Agnes jobs started in Step 3, results ready by Steps 4 & 6

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

**Version:** 4.0 (Updated navigation patterns, SSE integration, mobile improvements) | **Updated:** July 22, 2026
