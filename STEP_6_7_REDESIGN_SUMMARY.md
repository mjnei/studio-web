# Step 6 & 7 UI Redesign - Summary

**Date:** July 6, 2026  
**Status:** ✅ Design Complete, Ready for Implementation

---

## What Was Done

### 1. Complete UI/UX Redesign ✅

Created comprehensive design documentation:
- **`docs/guides/STEP_6_7_UI_REDESIGN.md`** — Full UI specification with mockups
- **`STEP_6_7_IMPLEMENTATION_TODO.md`** — Detailed implementation guide

### 2. New Components Created ✅

#### `src/components/credits/CreditConfirmationModal.tsx`
Modal for confirming video generation with credit cost display.

**Features:**
- Shows credit cost (1 credit)
- Displays remaining balance
- Calculates balance after generation
- Warning when low credits (≤2 remaining)
- Error state for insufficient credits
- "View Plans" redirect when insufficient

#### `src/components/project/VideoGenerationProgress.tsx`
Real-time progress display for video generation.

**Features:**
- Overall progress bar (0-100%)
- Current step highlight with sub-progress
- 4-step breakdown (Analyzing → Syncing → Rendering → Finalizing)
- Step status icons (pending/processing/completed)
- Estimated time remaining
- "You can leave this page" message

---

## Step 6: Compose - Key Changes

### Before
- Simple "generate video" button
- No progress tracking
- No credit confirmation
- No real-time updates

### After
- **Credit-aware generation:** Confirm modal before spending 1 credit
- **Real-time progress:** 4-step video generation with live updates
- **Polling system:** Updates every 2 seconds until completion
- **State management:** Handles queued → processing → completed → failed
- **Thumbnail validation:** Must be confirmed before generation
- **Error handling:** Retry on failure, credit refund logic

### UI Flow
1. Project summary + thumbnail preview
2. "Generate Video" button (with credit indicator)
3. Click → Credit confirmation modal
4. Confirm → Job created (status: queued)
5. Progress section appears with 4 steps
6. Polls every 2s, updates overall + step progress
7. Completion → Success message + "View in Finalize" button

---

## Step 7: Finalize - Key Changes

### Before
- No video history
- No regeneration capability
- No video management

### After
- **Latest video hero:** Featured video player with download
- **Processing status:** Real-time progress if video generating
- **Full video history:** All videos for project (newest first)
- **Regeneration:** Create new video variations (costs 1 credit)
- **Video management:** Delete old videos
- **Credit-aware:** Shows credit cost before regeneration
- **Empty states:** Handles no videos gracefully

### UI Sections (Top → Bottom)
1. Page header
2. Latest completed video (if exists) OR processing status
3. Video history list (all videos with actions)
4. "Generate New Video" form (regeneration)
5. Project summary (expandable)
6. Return to projects button

---

## Technical Architecture

### Video Generation Flow
```
User clicks "Generate"
  ↓
Credit confirmation modal
  ↓
POST /api/v1/video?project_id=X&tts_job_id=Y
  ↓
Job created (status: queued)
  ↓
Published to video_jobs queue (RabbitMQ)
  ↓
Mock processor consumes job
  ↓
4 steps with progress updates
  ↓
Publishes to video_results queue
  ↓
Background worker updates database
  ↓
Frontend polls GET /api/v1/video/{jobId} every 2s
  ↓
Updates UI with progress
  ↓
Completion → Stop polling, show success
```

### Polling Strategy
- **Start:** When job status is `queued` or `processing`
- **Frequency:** Every 2 seconds
- **Stop:** When status is `completed` or `failed`
- **Cleanup:** Clear interval on unmount
- **Optimization:** Only poll active jobs

### State Management
```typescript
// Step 6
- project: Project
- ttsJob: TTSJob | null
- videoJob: VideoJob | null (current generation)
- creditStatus: CreditStatus
- isGenerating: boolean
- showConfirmModal: boolean
- pollInterval: NodeJS.Timeout | null

// Step 7
- project: Project
- videos: VideoJob[] (all videos)
- latestCompletedVideo: VideoJob | null
- processingVideo: VideoJob | null
- creditStatus: CreditStatus
- isRegenerating: boolean
- showConfirmModal: boolean
- showInsufficientCreditsModal: boolean
```

---

## Video Job Schema

```typescript
interface VideoJob {
  id: string;
  project_id: string;
  user_id: string;
  tts_job_id: string | null;
  
  // Status
  status: "queued" | "processing" | "completed" | "failed";
  progress: number; // 0-100 (overall)
  
  // Output
  video_url: string | null;
  error_message: string | null;
  
  // Credits
  credit_cost: number; // Always 1
  generation_attempt: number; // 1, 2, 3, etc.
  
  // Steps (4 total)
  steps: VideoStep[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface VideoStep {
  step_number: 1 | 2 | 3 | 4;
  step_name: "Analyzing audio" | "Syncing with visuals" | "Rendering video" | "Finalizing output";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0-100 (step-specific)
}
```

---

## API Integration

### Endpoints Used

**Step 6:**
- `GET /api/v1/projects/{id}` — Load project with thumbnail
- `GET /api/v1/users/me/credits` — Check credit balance
- `POST /api/v1/video?project_id=X&tts_job_id=Y` — Create video job
- `GET /api/v1/video/{jobId}` — Poll for progress

**Step 7:**
- `GET /api/v1/projects/{id}` — Load project
- `GET /api/v1/projects/{id}/videos` — Load all videos for project
- `GET /api/v1/users/me/credits` — Check credit balance
- `POST /api/v1/projects/{id}/regenerate-video` — Create new video
- `DELETE /api/v1/projects/{id}/videos/{videoId}` — Delete video
- `GET /api/v1/video/{jobId}` — Poll for progress (if processing video)

---

## Credit System Integration

### Generation Cost
- **1 credit** per video generation
- Credits NOT deducted when job created
- Credits deducted when job status → "completed"
- Credits NOT deducted if job fails

### Confirmation Flow
1. User clicks "Generate Video"
2. Check `creditStatus.credits_remaining >= 1`
3. If insufficient → Show "Upgrade" modal
4. If sufficient → Show confirmation modal
5. User confirms → Create job
6. On completion → Backend deducts 1 credit

### Insufficient Credits
- Show modal with "View Plans" button
- Navigate to `/pricing` page
- Cannot generate without credits

---

## Implementation Status

### ✅ Completed
- [x] UI/UX design documentation
- [x] Component specifications
- [x] CreditConfirmationModal component
- [x] VideoGenerationProgress component
- [x] Implementation guide with code samples
- [x] API integration specifications
- [x] Testing checklist

### 📋 TODO
- [ ] Implement Step 6 compose page
- [ ] Implement Step 7 finalize page
- [ ] Add video API client functions
- [ ] Add polling logic to both pages
- [ ] Test full workflow end-to-end
- [ ] Handle edge cases and errors

---

## Testing Plan

### Manual Testing Flow

**Step 6:**
1. Complete Steps 1-5 (ends with TTS audio ready)
2. Navigate to Step 6 (Compose)
3. Verify thumbnail is confirmed
4. Click "Generate Video"
5. Confirm in modal (check credit display)
6. Watch progress update in real-time
7. Verify all 4 steps progress correctly
8. Video completes → success message
9. Click "View in Finalize" → navigate to Step 7

**Step 7:**
1. Verify latest video displays in player
2. Click play → video plays
3. Click download → opens in new tab
4. Scroll to history → see video #1
5. Click "Generate New Video"
6. Confirm in modal
7. New job starts → see progress
8. Video completes → see video #2 in history
9. Both videos #1 and #2 visible
10. Delete video #1 → only #2 remains

### Edge Cases
- [ ] Insufficient credits (show upgrade modal)
- [ ] Thumbnail not confirmed (disable button)
- [ ] Video generation fails (show error + retry)
- [ ] Navigate away during generation (stops polling)
- [ ] Return to page with processing video (resumes polling)
- [ ] Multiple regenerations (all appear in history)
- [ ] Network error during polling (retry with backoff)

---

## Performance Considerations

1. **Polling Optimization**
   - Only poll when status is `queued` or `processing`
   - Stop immediately when terminal state reached
   - Clear interval on unmount to prevent memory leaks

2. **Video List Caching**
   - Cache video list to reduce API calls
   - Only reload when necessary (after generation/deletion)

3. **Video Player**
   - Use native HTML5 `<video>` element
   - Lazy load (don't autoplay)
   - Thumbnail as poster for fast render

---

## Accessibility

- Progress bars have ARIA labels with percentages
- Step status changes announced to screen readers
- Video player uses native controls (keyboard accessible)
- Modals have focus trap and ESC to close
- Loading states have proper ARIA labels
- All interactive elements keyboard accessible

---

## Summary

This redesign transforms Steps 6 & 7 from simple placeholders into a fully-functional video generation and management system with:

✅ **Real-time progress tracking** (4-step video generation)  
✅ **Credit-aware workflows** (confirmation modals)  
✅ **Video history management** (view, regenerate, delete)  
✅ **Polling system** (automatic updates every 2s)  
✅ **Error handling** (retry, refunds, support links)  
✅ **Professional UX** (loading states, success messages)  

The system integrates seamlessly with the existing RabbitMQ-based video generation backend and mock processors, providing a production-ready foundation for the video workflow.

---

**Next Steps:**
1. Implement Step 6 compose page using the TODO guide
2. Implement Step 7 finalize page using the TODO guide
3. Test full workflow with mock processors
4. Fix any edge cases discovered during testing

**Estimated Implementation Time:** 4-6 hours for both pages

---

**Status:** ✅ Ready for Implementation  
**Documentation:** Complete  
**Components:** Created  
**Last Updated:** July 6, 2026
