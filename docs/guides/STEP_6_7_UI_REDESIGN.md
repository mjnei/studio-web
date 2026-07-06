# Step 6 & 7 UI Redesign - Video Generation Workflow

**Last Updated:** July 6, 2026 | **Status:** 🎨 Design Complete

---

## Overview

Complete redesign of Steps 6 (Compose) and 7 (Finalize) to properly integrate with the video generation system, including RabbitMQ job queue, 4-step video processing, and credit management.

---

## Step 6: Compose - Video Generation

**Route:** `/project/[projectId]/compose`

### UI Layout (Top to Bottom)

#### 1. Page Header
```
Compose Video
Review your settings and generate your video. This will cost 1 credit.
```

#### 2. Project Summary Card
```
┌─────────────────────────────────────────┐
│ 📋 Project Summary                      │
├─────────────────────────────────────────┤
│ Title: [Project Name]                   │
│ Movie: [Movie Title]                    │
│ Voice: [Voice Name]                     │
│ Script: [XXX words • XX:XX duration]    │
│ Audio: ✓ Ready                          │
└─────────────────────────────────────────┘
```

#### 3. Thumbnail Preview Card
```
┌─────────────────────────────────────────┐
│ 🖼️  Thumbnail                           │
├─────────────────────────────────────────┤
│ [16:9 Thumbnail Image Preview]          │
│                                         │
│ Status: ✓ Confirmed                     │
│                                         │
│ [Edit Thumbnail] button                 │
│ (Takes to thumbnail editor)             │
└─────────────────────────────────────────┘
```

**Note:** Thumbnail MUST be confirmed before video generation. If not confirmed, show warning message and disable generation button.

#### 4. Video Generation Section

**State A: No Video Generated Yet**
```
┌─────────────────────────────────────────┐
│ 🎬 Video Generation                     │
├─────────────────────────────────────────┤
│ Ready to generate your video?           │
│                                         │
│ Credit Cost: 1 credit                   │
│ Remaining: [X credits]                  │
│                                         │
│ [Generate Video] (Primary, large)       │
└─────────────────────────────────────────┘
```

**State B: Video Generation In Progress**
```
┌─────────────────────────────────────────┐
│ 🎬 Video Generation In Progress         │
├─────────────────────────────────────────┤
│ Your video is being generated...        │
│                                         │
│ Overall Progress: [████░░░░░] 45%       │
│                                         │
│ Current Step: 2/4 - Syncing with visuals│
│ Step Progress: [████████░░] 75%         │
│                                         │
│ • Step 1: Analyzing audio ✓             │
│ • Step 2: Syncing with visuals (75%)    │
│ • Step 3: Rendering video               │
│ • Step 4: Finalizing output             │
│                                         │
│ Estimated time: ~5 minutes remaining    │
└─────────────────────────────────────────┘
```

**State C: Video Complete**
```
┌─────────────────────────────────────────┐
│ ✅ Video Generation Complete!           │
├─────────────────────────────────────────┤
│ Your video is ready!                    │
│                                         │
│ [▶️ Preview Video]                      │
│ [View in Finalize Step] (Primary)       │
└─────────────────────────────────────────┘
```

**State D: Video Generation Failed**
```
┌─────────────────────────────────────────┐
│ ❌ Video Generation Failed              │
├─────────────────────────────────────────┤
│ Error: [Error message]                  │
│                                         │
│ [Retry Generation] (costs 1 credit)     │
│ [Contact Support]                       │
└─────────────────────────────────────────┘
```

#### 5. Navigation
- **Back:** Returns to Preview (Step 5)
- **Next:** Enabled only when video status = "completed"
- **Skip to Finalize:** Available if at least one completed video exists

---

## Step 7: Finalize - Video Management

**Route:** `/project/[projectId]/finalize`

### UI Layout (Top to Bottom)

#### 1. Page Header
```
Finalize Project
View your completed videos and generate new variations.
```

#### 2. Latest Video Hero Section

**If completed video exists:**
```
┌─────────────────────────────────────────┐
│ ✅ Video Complete!                      │
│ Your video is ready for download.       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [Video Player with Controls]            │
│ Uses finalized thumbnail as poster      │
│                                         │
│ Generated: Jul 6, 2026 at 10:30 AM      │
│ Credit Cost: 1 credit                   │
│ Attempt: #1                             │
│                                         │
│ [Download Video] [Share] (coming soon)  │
└─────────────────────────────────────────┘
```

**If no completed video:**
```
┌─────────────────────────────────────────┐
│ 🎬 No videos generated yet              │
│ Use the form below to create your       │
│ first video.                            │
└─────────────────────────────────────────┘
```

**If video processing:**
```
┌─────────────────────────────────────────┐
│ ⏳ Video Generation In Progress         │
│ Your video is being generated...        │
│                                         │
│ Status: Processing                      │
│ Progress: [████░░░░░] 45%               │
│                                         │
│ You can leave this page and return      │
│ later.                                  │
└─────────────────────────────────────────┘
```

#### 3. Video Generation History
```
┌─────────────────────────────────────────┐
│ 📜 Video History                        │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [Thumbnail] Video #2                │ │
│ │ Status: ✓ Completed                 │ │
│ │ Jul 6, 2026 at 2:30 PM              │ │
│ │ Cost: 1 credit                      │ │
│ │                                     │ │
│ │ [Download] [Delete]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Thumbnail] Video #1                │ │
│ │ Status: ✓ Completed                 │ │
│ │ Jul 6, 2026 at 10:30 AM             │ │
│ │ Cost: 1 credit                      │ │
│ │                                     │ │
│ │ [Download] [Delete]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Empty state if no history:              │
│ "No video history yet"                  │
└─────────────────────────────────────────┘
```

#### 4. Generate New Video Form
```
┌─────────────────────────────────────────┐
│ 🎬 Generate New Video                   │
├─────────────────────────────────────────┤
│ Create a new version with current       │
│ settings.                               │
│                                         │
│ Current Settings:                       │
│ • Script: XXX words                     │
│ • Voice: [Voice Name]                   │
│ • Thumbnail: ✓ Confirmed                │
│                                         │
│ Credit Usage:                           │
│ Cost: 1 credit                          │
│ Remaining: [X credits]                  │
│                                         │
│ [Generate New Video] (Primary, large)   │
│                                         │
│ ⚠️ If thumbnail not confirmed:          │
│ "Complete Step 6 first"                 │
└─────────────────────────────────────────┘
```

#### 5. Project Details (Expandable)
```
┌─────────────────────────────────────────┐
│ 📋 Project Summary    [Expand ▼]        │
├─────────────────────────────────────────┤
│ When expanded:                          │
│ Title, Movie, Voice, Script details     │
│ Full script in expandable modal         │
└─────────────────────────────────────────┘
```

#### 6. Actions
```
[Return to Projects] (Secondary)
```

---

## State Management

### Step 6 States

```typescript
type ComposeState = {
  project: Project;
  ttsJob: TTSJob | null;
  activeVideoJob: VideoJob | null;
  creditStatus: CreditStatus;
  
  // Video generation state
  isGenerating: boolean;
  generationError: string | null;
  
  // Polling
  pollInterval: NodeJS.Timeout | null;
};

type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

type VideoJob = {
  id: string;
  status: VideoJobStatus;
  progress: number; // 0-100
  video_url: string | null;
  error_message: string | null;
  steps: VideoStep[];
  created_at: string;
  credit_cost: number;
};

type VideoStep = {
  step_number: 1 | 2 | 3 | 4;
  step_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0-100
};
```

### Step 7 States

```typescript
type FinalizeState = {
  project: Project;
  videos: VideoJob[]; // All videos for project
  latestCompletedVideo: VideoJob | null;
  processingVideo: VideoJob | null;
  creditStatus: CreditStatus;
  
  // Regeneration
  isRegenerating: boolean;
  regenerationError: string | null;
  
  // UI
  showInsufficientCreditsModal: boolean;
};
```

---

## API Integration

### Step 6: Video Generation

```typescript
// 1. Check credit status
const credits = await getCreditStatus();
if (credits.credits_remaining < 1) {
  showInsufficientCreditsModal();
  return;
}

// 2. Show confirmation modal
const confirmed = await showConfirmationModal({
  title: "Generate Video?",
  message: "This will cost 1 credit. Continue?",
  cost: 1,
  remaining: credits.credits_remaining,
});

if (!confirmed) return;

// 3. Create video job
const videoJob = await createVideoJob(projectId, ttsJobId);

// 4. Start polling for progress
const pollInterval = setInterval(async () => {
  const job = await getVideoJob(videoJob.id);
  
  updateProgress(job);
  
  if (job.status === "completed") {
    clearInterval(pollInterval);
    showSuccessMessage();
    enableNextButton();
  }
  
  if (job.status === "failed") {
    clearInterval(pollInterval);
    showErrorMessage(job.error_message);
  }
}, 2000); // Poll every 2 seconds
```

### Step 7: Video History

```typescript
// 1. Load all videos on mount
useEffect(() => {
  loadVideos();
  loadCreditStatus();
}, [projectId]);

const loadVideos = async () => {
  const response = await getProjectVideos(projectId);
  setVideos(response.videos);
  
  // Identify latest completed and any processing videos
  const completed = response.videos.find(v => v.status === "completed");
  const processing = response.videos.find(
    v => v.status === "queued" || v.status === "processing"
  );
  
  setLatestCompletedVideo(completed);
  setProcessingVideo(processing);
  
  // If video is processing, start polling
  if (processing) {
    startPolling(processing.id);
  }
};

// 2. Regenerate video
const handleRegenerate = async () => {
  // Check credits
  if (creditStatus.credits_remaining < 1) {
    setShowInsufficientCreditsModal(true);
    return;
  }
  
  // Show confirmation
  const confirmed = await showConfirmationModal({
    title: "Generate New Video?",
    message: "This will cost 1 credit and create a new video.",
    cost: 1,
    remaining: creditStatus.credits_remaining,
  });
  
  if (!confirmed) return;
  
  // Create new video job (backend handles this)
  const newJob = await regenerateVideo(projectId);
  
  // Reload videos and start polling
  await loadVideos();
};

// 3. Delete video
const handleDelete = async (videoId: string) => {
  const confirmed = confirm("Delete this video? Cannot be undone.");
  if (!confirmed) return;
  
  await deleteProjectVideo(projectId, videoId);
  await loadVideos();
  
  toast.success("Video deleted");
};
```

---

## Components to Create/Update

### New Components

1. **`VideoGenerationCard.tsx`** (Step 6)
   - Handles all video generation states
   - Shows progress with 4 steps
   - Displays current step with progress bar

2. **`VideoGenerationProgress.tsx`**
   - Detailed progress display
   - Step-by-step breakdown
   - Overall and step-specific progress bars

3. **`VideoHistoryList.tsx`** (Step 7)
   - Lists all videos for project
   - Individual video cards with actions
   - Empty state

4. **`VideoPlayerCard.tsx`** (Step 7)
   - Video player with controls
   - Metadata display
   - Download/share actions

5. **`CreditConfirmationModal.tsx`**
   - Confirms video generation (costs 1 credit)
   - Shows credit cost and remaining balance
   - Confirm/Cancel buttons

6. **`VideoGenerationModal.tsx`** (Optional)
   - Full-screen modal during generation
   - Real-time progress updates
   - Cannot be dismissed until complete

### Updated Components

1. **`FloatingWorkflowNavigation.tsx`**
   - Update logic for Step 6 → 7 transition
   - Enable "Next" only when video complete

2. **`CreditUsageIndicator.tsx`** (already exists)
   - Use in confirmation modals
   - Show cost + remaining

---

## User Flows

### Flow 1: First Time Video Generation (Step 6)

1. User completes Step 5 (TTS audio ready)
2. User advances to Step 6 (Compose)
3. Page loads, shows project summary and thumbnail
4. **If thumbnail not confirmed:** Show warning, disable button
5. **If thumbnail confirmed:** Show "Generate Video" button
6. User clicks "Generate Video"
7. **Credit confirmation modal appears:**
   - "Generate Video? This will cost 1 credit."
   - Shows cost (1) and remaining (e.g., 4)
   - User clicks "Confirm"
8. **Video job created:**
   - Button changes to loading state
   - API call: `POST /api/v1/video?project_id=X&tts_job_id=Y`
   - Returns job with `status=queued`
9. **Progress section appears:**
   - Shows "Video Generation In Progress"
   - Overall progress: 0%
   - Step 1/4: Analyzing audio (pending)
10. **Polling starts (every 2s):**
    - Fetches job status: `GET /api/v1/video/{jobId}`
    - Updates progress bars
    - Updates step statuses
11. **Progress updates:**
    - Step 1 starts: 0-25% overall
    - Step 2 starts: 25-50% overall
    - Step 3 starts: 50-75% overall
    - Step 4 starts: 75-100% overall
12. **Video completes (status=completed):**
    - Success message appears
    - Shows "View in Finalize Step" button
    - Navigation "Next" button enabled
13. User clicks "Next" → Goes to Step 7

**Duration:** ~10 seconds (mock processor)

### Flow 2: View Completed Video (Step 7)

1. User lands on Step 7 (Finalize)
2. Page loads all videos: `GET /api/v1/projects/{id}/videos`
3. **Latest completed video shown:**
   - Video player with finalized thumbnail as poster
   - Download button enabled
4. **Video history shown below:**
   - All videos listed (newest first)
   - Each with status, date, cost
5. User clicks play → Video plays
6. User clicks download → Opens video in new tab

### Flow 3: Regenerate Video (Step 7)

1. User on Step 7 with existing completed video
2. User scrolls to "Generate New Video" section
3. Shows current settings and credit cost
4. User clicks "Generate New Video"
5. **Credit confirmation modal:**
   - Same as Flow 1
6. **If confirmed:**
   - Creates new video job
   - Page automatically scrolls to "processing" section
   - Shows new video in history as "Processing"
7. **Polling starts:**
   - Updates processing video status
   - When complete, refreshes video list
8. **Both videos now appear in history:**
   - Video #2 (newest)
   - Video #1 (previous)

### Flow 4: Insufficient Credits

1. User tries to generate video
2. Credit check fails (0 remaining)
3. **Insufficient Credits Modal appears:**
   - "You need 1 credit to generate a video"
   - "You have 0 credits remaining"
   - "Upgrade your plan to get more credits"
   - [View Plans] [Cancel] buttons
4. If user clicks "View Plans" → Navigate to `/pricing`

---

## Polling Strategy

### Why Polling?

- Video generation takes 5-15 minutes in production
- Real-time updates needed for UX
- Simple to implement, no WebSocket needed

### Polling Rules

1. **Start polling when:**
   - Video job created with `status=queued` or `status=processing`
   - Page loads with existing processing video

2. **Poll frequency:** Every 2 seconds

3. **Stop polling when:**
   - Video `status=completed`
   - Video `status=failed`
   - User navigates away from page
   - Component unmounts

4. **Cleanup:** Always clear interval on unmount

```typescript
useEffect(() => {
  let interval: NodeJS.Timeout | null = null;
  
  if (videoJob && (videoJob.status === "queued" || videoJob.status === "processing")) {
    interval = setInterval(async () => {
      const updated = await getVideoJob(videoJob.id);
      setVideoJob(updated);
      
      if (updated.status === "completed" || updated.status === "failed") {
        clearInterval(interval!);
      }
    }, 2000);
  }
  
  return () => {
    if (interval) clearInterval(interval);
  };
}, [videoJob?.id, videoJob?.status]);
```

---

## Error Handling

### Video Generation Fails

1. Mock processor publishes error to `video_results` queue
2. Background worker updates DB: `status=failed`, `error_message="..."`
3. Frontend polls, detects `status=failed`
4. Shows error message with retry option
5. **Retry:** Creates new video job (costs 1 credit)

### No Credits Available

1. User clicks "Generate Video"
2. Credit check fails before API call
3. Show modal: "Insufficient credits. Upgrade?"
4. User can view pricing or cancel

### Network Error During Polling

1. Poll request fails (network issue)
2. Retry poll after 5 seconds (exponential backoff)
3. If 3 consecutive failures, show error banner
4. User can manually refresh

---

## Performance Considerations

### Polling Optimization

- Only poll when video is `queued` or `processing`
- Stop polling immediately when terminal state reached
- Use `AbortController` to cancel in-flight requests on unmount

### Video List Optimization

- Limit history to 50 most recent videos
- Lazy load older videos if needed
- Cache video list to reduce API calls

### Video Player

- Use native HTML5 `<video>` element
- Lazy load video (don't autoplay)
- Thumbnail as poster for fast initial render

---

## Accessibility

- **Progress bars:** ARIA labels with percentage
- **Step status:** Screen reader announcements when step completes
- **Video player:** Native controls for keyboard navigation
- **Modals:** Focus trap, ESC to close
- **Loading states:** Proper loading indicators with labels

---

## Testing Checklist

### Step 6

- [ ] Generate video with sufficient credits
- [ ] Try to generate without credits (show modal)
- [ ] Cancel generation confirmation
- [ ] Watch progress update in real-time
- [ ] Video completes successfully
- [ ] Video fails (simulate error)
- [ ] Navigate away during generation (stops polling)
- [ ] Return to page with processing video (resumes polling)
- [ ] Try to generate without confirmed thumbnail

### Step 7

- [ ] View completed video
- [ ] Play video in player
- [ ] Download video
- [ ] Regenerate new video
- [ ] View video history (multiple videos)
- [ ] Delete video from history
- [ ] Insufficient credits scenario
- [ ] Processing video shown correctly
- [ ] Empty state (no videos)

---

## Summary

**Step 6 (Compose):**
- Focus on generating THE video for this project
- Show real-time progress with 4 steps
- Credit confirmation before generation
- Seamless transition to Step 7 when complete

**Step 7 (Finalize):**
- Focus on managing ALL videos for this project
- Latest video featured prominently
- Full history with regeneration capability
- Credit-aware regeneration flow

**Key Improvements:**
1. ✅ Real-time progress updates (every 2s)
2. ✅ Credit confirmation before spending
3. ✅ Clear 4-step video generation flow
4. ✅ Video history management
5. ✅ Proper error handling
6. ✅ Optimized polling strategy

---

**Status:** 🎨 Design Complete | **Next:** Implementation  
**Last Updated:** July 6, 2026
