# Quick Start Guide: Steps 6 & 7

A quick reference for working with the Compose and Finalize pages.

---

## Step 6: Compose Page

**Route:** `/project/[projectId]/compose`

### User Flow
1. User reviews project summary (movie, voice, script)
2. User customizes thumbnail (click to edit)
3. User confirms thumbnail
4. User clicks "Generate Video"
5. Credit confirmation modal appears
6. User confirms → video generation starts
7. Real-time progress displays (4 steps)
8. On completion → navigate to Finalize

### Key Components

```typescript
// Credit Confirmation
<CreditConfirmationModal
  isOpen={showModal}
  onClose={handleClose}
  onConfirm={handleConfirm}
  creditCost={1}
  creditsRemaining={credits}
  isProcessing={isGenerating}
/>

// Video Progress
<VideoGenerationProgress
  overallProgress={job.progress}
  currentStep={currentStepNumber}
  steps={job.steps}
/>
```

### API Calls

```typescript
// Start video generation
const job = await createVideoJob({
  projectId: "123",
  ttsJobId: "456", // optional
  autoActivate: true
});

// Poll for updates
const updatedJob = await getVideoJob(job.id);
```

---

## Step 7: Finalize Page

**Route:** `/project/[projectId]/finalize`

### User Flow
1. User views completed video with player
2. User can download video
3. User can view video history
4. User can regenerate video (uses 1 credit)
5. User can delete old videos

### Key Sections

**A. Video Player**
```typescript
<video
  src={video.video_url}
  controls
  poster={video.thumbnail_url}
  className="w-full h-full object-contain"
/>
```

**B. Video History**
- Shows all generation attempts
- Status: completed | failed | processing | queued
- Actions: Download, Delete

**C. Regeneration**
```typescript
const newVideo = await regenerateVideo(projectId);
// Uses 1 credit, creates new video generation
```

### API Calls

```typescript
// Get all project videos
const { videos } = await getProjectVideos(projectId);

// Regenerate video
const newVideo = await regenerateVideo(projectId);

// Delete video
await deleteProjectVideo(projectId, videoId);

// Get video with steps (for progress)
const job = await getVideoJob(videoId);
```

---

## Common Patterns

### Credit Validation

```typescript
// Check credits before action
if (!creditStatus || creditStatus.credits_remaining < 1) {
  setShowInsufficientCreditsModal(true);
  return;
}
```

### Video Generation Polling

```typescript
const startPolling = (jobId: string) => {
  const interval = setInterval(async () => {
    const job = await getVideoJob(jobId);
    setVideoJob(job);
    
    if (job.status === "completed" || job.status === "failed") {
      clearInterval(interval);
      // Handle completion
    }
  }, 3000);
  
  return () => clearInterval(interval);
};
```

### Error Handling

```typescript
try {
  await createVideoJob({ projectId, ttsJobId });
} catch (error: any) {
  if (error.status === 402) {
    // Insufficient credits
    setShowInsufficientCreditsModal(true);
  } else {
    toast.error("Failed", error.message);
  }
}
```

---

## Video Generation States

```typescript
type VideoJobStatus = 
  | "idle"      // Just created
  | "queued"    // Waiting to process
  | "processing"// Actively generating
  | "completed" // Success
  | "failed";   // Error occurred
```

### Step-by-Step Progress

Each video job has 4 steps:
1. **Audio Processing** - Process TTS audio
2. **Scene Generation** - Generate video scenes
3. **Video Composition** - Combine scenes with audio
4. **Finalization** - Export and upload

Each step tracks:
- `step_number` (1-4)
- `step_name` (string)
- `status` (pending/queued/processing/completed/failed)
- `progress` (0-100)

---

## Testing Scenarios

### Happy Path
1. Create project → Select movie
2. Generate script → Confirm script
3. Enter project name → Continue
4. Select voice → Continue
5. Preview audio → Continue
6. **Compose:** Finalize thumbnail → Generate video → Wait for completion
7. **Finalize:** View video → Download → Done

### Error Scenarios
1. **Insufficient Credits:** Generate without credits → See modal
2. **Thumbnail Not Confirmed:** Try to generate → See error
3. **Generation Failure:** API error → See retry option
4. **Network Failure:** Polling fails → Graceful degradation

---

## Key Files

```
src/
├── app/project/[projectId]/
│   ├── compose/page.tsx      # Step 6
│   └── finalize/page.tsx     # Step 7
├── components/
│   ├── project/
│   │   └── VideoGenerationProgress.tsx
│   └── credits/
│       ├── CreditConfirmationModal.tsx
│       ├── CreditUsageIndicator.tsx
│       └── InsufficientCreditsModal.tsx
└── lib/
    ├── project-client.ts     # Video API
    └── credit-client.ts      # Credit & Video list API
```

---

## Environment Variables

Required for video generation:

```env
NEXT_PUBLIC_API_URL=http://localhost:8020/api/v1
```

Backend handles:
- Video generation processing
- Credit deduction
- Video storage (S3 or local)
- TTS integration

---

## Debugging Tips

### Video not generating?
1. Check credit balance: `GET /api/v1/users/me/credits`
2. Check thumbnail confirmed: `project.thumbnail?.confirmed === true`
3. Check API logs for errors
4. Verify TTS job completed: `project.active_tts_job?.status === "completed"`

### Progress not updating?
1. Check polling interval (3s for compose, 5s for finalize)
2. Verify `getVideoJob(id)` returns steps
3. Check browser network tab for API calls
4. Console log `videoJob` state

### Video player not working?
1. Check video URL is accessible
2. Verify video format (MP4)
3. Check CORS headers (if S3)
4. Try opening video URL directly

---

## Performance Notes

- **Polling overhead:** ~2 API calls per video job per interval
- **Recommended:** Replace with SSE for production
- **Memory:** Cleanup intervals on unmount
- **Network:** Use stale-while-revalidate for video list

---

**Need Help?** Check the full implementation in:
- `STEP_6_7_IMPLEMENTATION_TODO.md` (requirements)
- `STEP_6_7_COMPLETION_SUMMARY.md` (what was built)
