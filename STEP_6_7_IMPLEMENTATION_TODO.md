# Step 6 & 7 Implementation TODO

**Last Updated:** July 6, 2026 | **Status:** ✅ Implementation Complete

---

## Overview

This document outlines the implementation tasks for Steps 6 (Compose) and 7 (Finalize) based on the new video generation system.

**Status: All core functionality has been implemented and tested.**

---

## ✅ Completed Components

### 1. CreditConfirmationModal
**File:** `src/components/credits/CreditConfirmationModal.tsx`

**Features:**
- Shows credit cost and remaining balance
- Calculates balance after generation
- Warning when low credits (≤2 remaining)
- Error state for insufficient credits
- "View Plans" button when insufficient
- Confirm/Cancel actions

**Usage:**
```typescript
<CreditConfirmationModal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  onConfirm={handleGenerateVideo}
  creditCost={1}
  creditsRemaining={creditStatus.credits_remaining}
  isProcessing={isGenerating}
/>
```

### 2. VideoGenerationProgress
**File:** `src/components/project/VideoGenerationProgress.tsx`

**Features:**
- Overall progress bar (0-100%)
- Current step highlight with progress
- 4-step breakdown with icons
- Estimated time remaining
- Step statuses (pending/processing/completed/failed)
- Real-time updates via polling

**Usage:**
```typescript
<VideoGenerationProgress
  overallProgress={videoJob.progress}
  currentStep={2}
  steps={videoJob.steps}
  estimatedTimeRemaining={120} // seconds
/>
```

---

## 📋 TODO: Step 6 (Compose Page)

### File: `src/app/project/[projectId]/compose/page.tsx`

### Tasks

#### 1. State Management
```typescript
const [project, setProject] = useState<Project | null>(null);
const [ttsJob, setTtsJob] = useState<TTSJob | null>(null);
const [videoJob, setVideoJob] = useState<VideoJob | null>(null);
const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);

const [isGenerating, setIsGenerating] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [generationError, setGenerationError] = useState<string | null>(null);

// Polling
const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
```

#### 2. Data Loading (useEffect)
```typescript
useEffect(() => {
  loadProjectData();
  loadCreditStatus();
  checkExistingVideoJob();
}, [projectId]);
```

**Functions to implement:**
- `loadProjectData()` — GET `/api/v1/projects/{id}` with thumbnail
- `loadCreditStatus()` — GET `/api/v1/users/me/credits`
- `checkExistingVideoJob()` — Check if video already exists for project

#### 3. Video Generation Flow
```typescript
const handleGenerateVideo = async () => {
  // 1. Check credits
  if (!creditStatus || creditStatus.credits_remaining < 1) {
    setShowInsufficientCreditsModal(true);
    return;
  }

  // 2. Check thumbnail confirmed
  if (!project.thumbnail_confirmed) {
    toast.error("Please confirm your thumbnail first");
    return;
  }

  // 3. Show confirmation modal
  setShowConfirmModal(true);
};

const handleConfirmGeneration = async () => {
  setShowConfirmModal(false);
  setIsGenerating(true);
  setGenerationError(null);

  try {
    // 4. Create video job
    const job = await createVideoJob(projectId, project.active_tts_job_id);
    setVideoJob(job);

    // 5. Start polling
    startPolling(job.id);

    toast.success("Video generation started!");
  } catch (error: any) {
    setGenerationError(error.message || "Failed to start video generation");
    toast.error("Failed to start generation");
  } finally {
    setIsGenerating(false);
  }
};
```

#### 4. Polling Logic
```typescript
const startPolling = (jobId: string) => {
  // Clear existing interval
  if (pollIntervalRef.current) {
    clearInterval(pollIntervalRef.current);
  }

  // Poll immediately
  pollVideoStatus(jobId);

  // Then poll every 2 seconds
  pollIntervalRef.current = setInterval(() => {
    pollVideoStatus(jobId);
  }, 2000);
};

const pollVideoStatus = async (jobId: string) => {
  try {
    const updatedJob = await getVideoJob(jobId);
    setVideoJob(updatedJob);

    // Stop polling if terminal state
    if (updatedJob.status === "completed" || updatedJob.status === "failed") {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Reload credit status
      await loadCreditStatus();

      if (updatedJob.status === "completed") {
        toast.success("Video generation complete!");
      } else {
        setGenerationError(updatedJob.error_message || "Generation failed");
        toast.error("Video generation failed");
      }
    }
  } catch (error) {
    console.error("Polling error:", error);
  }
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };
}, []);
```

#### 5. UI Sections

**A. Project Summary Card**
```typescript
<Card variant="elevated" padding="md">
  <h3 className="text-sm font-medium text-text-primary mb-4">Project Summary</h3>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div>
      <p className="text-xs text-text-muted">Title</p>
      <p className="text-sm font-medium text-text-primary mt-1">{project.project_name}</p>
    </div>
    <div>
      <p className="text-xs text-text-muted">Movie</p>
      <p className="text-sm font-medium text-text-primary mt-1">{project.movie?.title}</p>
    </div>
    <div>
      <p className="text-xs text-text-muted">Voice</p>
      <p className="text-sm font-medium text-text-primary mt-1">{ttsJob?.voice_name}</p>
    </div>
    <div>
      <p className="text-xs text-text-muted">Script</p>
      <p className="text-sm font-medium text-text-primary mt-1">{scriptWordCount} words</p>
    </div>
  </div>
</Card>
```

**B. Thumbnail Preview**
```typescript
<Card variant="elevated" padding="md">
  <h3 className="text-sm font-medium text-text-primary mb-4">Thumbnail</h3>
  {project.final_thumbnail_url ? (
    <>
      <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default mb-4">
        <img
          src={project.final_thumbnail_url}
          alt="Project thumbnail"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-success-text">
        <CheckCircle className="h-4 w-4" />
        <span>Confirmed</span>
      </div>
    </>
  ) : (
    <div className="text-sm text-warning-text">
      <AlertTriangle className="h-4 w-4 inline mr-2" />
      Thumbnail not confirmed. Complete thumbnail step first.
    </div>
  )}
</Card>
```

**C. Video Generation Section**

**State: No video yet**
```typescript
{!videoJob && (
  <Card variant="elevated" padding="md">
    <h3 className="text-sm font-medium text-text-primary mb-2">Generate Video</h3>
    <p className="text-sm text-text-muted mb-4">
      Ready to generate your video? This will use 1 credit.
    </p>

    {creditStatus && (
      <div className="mb-4">
        <CreditUsageIndicator
          cost={1}
          remainingCredits={creditStatus.credits_remaining}
        />
      </div>
    )}

    <Button
      variant="primary"
      size="lg"
      onClick={handleGenerateVideo}
      disabled={!project?.thumbnail_confirmed || isGenerating}
      className="w-full"
    >
      {isGenerating ? "Starting..." : "Generate Video"}
    </Button>

    {!project?.thumbnail_confirmed && (
      <p className="text-xs text-warning-text text-center mt-2">
        Please confirm your thumbnail before generating video
      </p>
    )}
  </Card>
)}
```

**State: Video generating**
```typescript
{videoJob && (videoJob.status === "queued" || videoJob.status === "processing") && (
  <VideoGenerationProgress
    overallProgress={videoJob.progress}
    currentStep={videoJob.steps.find(s => s.status === "processing")?.step_number || 1}
    steps={videoJob.steps}
    estimatedTimeRemaining={calculateEstimatedTime(videoJob)}
  />
)}
```

**State: Video complete**
```typescript
{videoJob && videoJob.status === "completed" && (
  <Card variant="elevated" padding="md" className="bg-success-bg/10 border-success-border">
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg flex-shrink-0">
        <CheckCircle className="h-5 w-5 text-success-text" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-success-text">Video Complete!</h3>
        <p className="mt-1 text-sm text-text-muted">
          Your video has been generated successfully.
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => window.open(videoJob.video_url, "_blank")}
          >
            Preview Video
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push(`/project/${projectId}/finalize`)}
          >
            View in Finalize Step
          </Button>
        </div>
      </div>
    </div>
  </Card>
)}
```

**State: Video failed**
```typescript
{videoJob && videoJob.status === "failed" && (
  <Card variant="elevated" padding="md" className="bg-error-bg/10 border-error-border">
    <div className="flex items-start gap-4">
      <AlertTriangle className="h-10 w-10 text-error-text flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-medium text-error-text">Generation Failed</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {videoJob.error_message || "An error occurred during generation."}
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setVideoJob(null);
              setGenerationError(null);
            }}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open("/support", "_blank")}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  </Card>
)}
```

#### 6. Navigation
```typescript
<FloatingWorkflowNavigation
  projectId={projectId}
  currentStep="compose"
  canGoNext={videoJob?.status === "completed"}
  canGoBack={true}
  isProcessing={videoJob?.status === "processing" || videoJob?.status === "queued"}
/>
```

---

## 📋 TODO: Step 7 (Finalize Page)

### File: `src/app/project/[projectId]/finalize/page.tsx`

### Tasks

#### 1. State Management
```typescript
const [project, setProject] = useState<Project | null>(null);
const [videos, setVideos] = useState<VideoJob[]>([]);
const [latestCompletedVideo, setLatestCompletedVideo] = useState<VideoJob | null>(null);
const [processingVideo, setProcessingVideo] = useState<VideoJob | null>(null);
const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);

const [isRegenerating, setIsRegenerating] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
```

#### 2. Data Loading
```typescript
useEffect(() => {
  loadProject();
  loadVideos();
  loadCreditStatus();
}, [projectId]);

const loadVideos = async () => {
  try {
    const response = await getProjectVideos(projectId);
    setVideos(response.videos);

    // Identify latest completed and processing videos
    const completed = response.videos.find(v => v.status === "completed");
    const processing = response.videos.find(
      v => v.status === "queued" || v.status === "processing"
    );

    setLatestCompletedVideo(completed || null);
    setProcessingVideo(processing || null);

    // Start polling if video is processing
    if (processing) {
      startPolling(processing.id);
    }
  } catch (error) {
    console.error("Failed to load videos:", error);
    toast.error("Failed to load videos");
  }
};
```

#### 3. Regeneration Flow
```typescript
const handleRegenerate = async () => {
  // Check credits
  if (!creditStatus || creditStatus.credits_remaining < 1) {
    setShowInsufficientCreditsModal(true);
    return;
  }

  // Check thumbnail
  if (!project?.thumbnail_confirmed) {
    toast.error("Complete Step 6 first");
    return;
  }

  // Show confirmation
  setShowConfirmModal(true);
};

const handleConfirmRegeneration = async () => {
  setShowConfirmModal(false);
  setIsRegenerating(true);

  try {
    const newJob = await regenerateVideo(projectId);
    await loadVideos();
    await loadCreditStatus();

    toast.success("Video generation started!");
  } catch (error: any) {
    if (error.status === 402) {
      setShowInsufficientCreditsModal(true);
    } else {
      toast.error(error.message || "Failed to start regeneration");
    }
  } finally {
    setIsRegenerating(false);
  }
};
```

#### 4. Video Deletion
```typescript
const handleDeleteVideo = async (videoId: string) => {
  const confirmed = confirm(
    "Are you sure you want to delete this video? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    await deleteProjectVideo(projectId, videoId);
    await loadVideos();
    toast.success("Video deleted");
  } catch (error) {
    console.error("Failed to delete video:", error);
    toast.error("Failed to delete video");
  }
};
```

#### 5. Polling Logic (Same as Step 6)
```typescript
const startPolling = (jobId: string) => {
  if (pollIntervalRef.current) {
    clearInterval(pollIntervalRef.current);
  }

  pollVideoStatus(jobId);

  pollIntervalRef.current = setInterval(() => {
    pollVideoStatus(jobId);
  }, 2000);
};

const pollVideoStatus = async (jobId: string) => {
  try {
    const updatedJob = await getVideoJob(jobId);

    // Update videos list
    setVideos(prev => 
      prev.map(v => v.id === jobId ? updatedJob : v)
    );

    // Update processing video
    if (updatedJob.status === "completed" || updatedJob.status === "failed") {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Reload full list
      await loadVideos();
      await loadCreditStatus();

      if (updatedJob.status === "completed") {
        toast.success("Video generation complete!");
      } else {
        toast.error("Video generation failed");
      }
    }
  } catch (error) {
    console.error("Polling error:", error);
  }
};

useEffect(() => {
  return () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };
}, []);
```

#### 6. UI Sections

**A. Latest Video Player** (if completed video exists)
```typescript
{latestCompletedVideo && (
  <>
    <Card variant="elevated" padding="md" className="bg-success-bg/10 border-success-border">
      <div className="flex items-start gap-4">
        <CheckCircle className="h-10 w-10 text-success-text flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-success-text">Video Complete!</h3>
          <p className="mt-1 text-sm text-text-muted">
            Your video has been successfully generated and is ready.
          </p>
        </div>
      </div>
    </Card>

    <Card variant="elevated" padding="md">
      <h3 className="text-sm font-medium text-text-primary mb-4">Your Latest Video</h3>
      <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
        <video
          src={latestCompletedVideo.video_url}
          controls
          className="w-full h-full object-contain"
          poster={project?.final_thumbnail_url || undefined}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-text-muted">
        <div>
          <span className="font-medium text-text-secondary">Generated:</span>{" "}
          {new Date(latestCompletedVideo.created_at).toLocaleDateString()}
        </div>
        <div>
          <span className="font-medium text-text-secondary">Cost:</span>{" "}
          {latestCompletedVideo.credit_cost} credit(s)
        </div>
        <div>
          <span className="font-medium text-text-secondary">Attempt:</span>{" "}
          #{latestCompletedVideo.generation_attempt}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          icon={<Download className="h-4 w-4" />}
          onClick={() => window.open(latestCompletedVideo.video_url, "_blank")}
          className="w-full"
        >
          Download Video
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon={<Share2 className="h-4 w-4" />}
          onClick={() => toast.info("Coming soon", "Publishing feature coming soon")}
          className="w-full"
        >
          Publish
        </Button>
      </div>
    </Card>
  </>
)}
```

**B. Processing Status** (if video generating)
```typescript
{processingVideo && (
  <VideoGenerationProgress
    overallProgress={processingVideo.progress}
    currentStep={processingVideo.steps.find(s => s.status === "processing")?.step_number || 1}
    steps={processingVideo.steps}
    estimatedTimeRemaining={calculateEstimatedTime(processingVideo)}
  />
)}
```

**C. Video History**
```typescript
<Card variant="elevated" padding="md">
  <h3 className="text-sm font-medium text-text-primary mb-4">Video History</h3>
  {videos.length === 0 ? (
    <div className="py-8 text-center text-sm text-text-muted">
      <Clock className="h-10 w-10 mx-auto mb-3 text-text-muted opacity-50" />
      <p>No video history yet</p>
    </div>
  ) : (
    <div className="space-y-3">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="flex items-start gap-4 p-4 rounded-lg bg-surface-raised border border-border-default"
        >
          {/* Thumbnail */}
          <div className="w-32 aspect-video rounded overflow-hidden bg-surface-base flex-shrink-0">
            {project?.final_thumbnail_url ? (
              <img
                src={project.final_thumbnail_url}
                alt={`Video ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-6 w-6 text-text-muted" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h4 className="text-sm font-medium text-text-primary">
                  Video #{video.generation_attempt}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(video.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                  video.status === "completed"
                    ? "bg-success-bg text-success-text"
                    : video.status === "failed"
                      ? "bg-error-bg text-error-text"
                      : "bg-accent-cyan/10 text-accent-cyan"
                }`}
              >
                {video.status}
              </span>
            </div>

            <div className="text-xs text-text-muted space-y-1">
              <p>Credit cost: {video.credit_cost}</p>
              {video.status === "processing" && (
                <p>Progress: {video.progress}%</p>
              )}
            </div>

            {video.error_message && (
              <p className="mt-2 text-xs text-error-text">{video.error_message}</p>
            )}

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              {video.status === "completed" && video.video_url && (
                <button
                  onClick={() => window.open(video.video_url!, "_blank")}
                  className="text-xs text-accent-cyan hover:text-accent-cyan-hover underline"
                >
                  Download
                </button>
              )}
              <button
                onClick={() => handleDeleteVideo(video.id)}
                className="text-xs text-error-text hover:text-error-text-hover underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</Card>
```

**D. Regeneration Form**
```typescript
<Card variant="elevated" padding="md">
  <h3 className="text-sm font-medium text-text-primary mb-4">Generate New Video</h3>
  <p className="text-sm text-text-muted mb-4">
    Create a new version of your video with the current project settings.
  </p>

  {/* Credit Cost */}
  {creditStatus && (
    <div className="mb-4 flex justify-start">
      <CreditUsageIndicator cost={1} remainingCredits={creditStatus.credits_remaining} />
    </div>
  )}

  {/* Current Settings Preview */}
  <div className="mb-4 p-4 rounded-lg bg-surface-raised border border-border-default space-y-2 text-xs">
    <h4 className="font-medium text-text-secondary mb-2">Current Settings:</h4>
    <p className="text-text-muted">
      Script: <span className="font-medium text-text-primary">{scriptWordCount} words</span>
    </p>
    <p className="text-text-muted">
      Voice: <span className="font-medium text-text-primary">{voiceName}</span>
    </p>
    <p className="text-text-muted">
      Thumbnail:{" "}
      <span className="font-medium text-text-primary">
        {project?.thumbnail_confirmed ? "✓ Confirmed" : "Not confirmed"}
      </span>
    </p>
  </div>

  <Button
    variant="primary"
    size="lg"
    icon={isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
    onClick={handleRegenerate}
    disabled={
      isRegenerating ||
      !project?.thumbnail_confirmed ||
      (creditStatus && creditStatus.credits_remaining < 1)
    }
    className="w-full"
  >
    {isRegenerating ? "Generating..." : "Generate New Video"}
  </Button>

  {!project?.thumbnail_confirmed && (
    <p className="mt-2 text-xs text-warning-text text-center">
      Please complete the compose step before generating videos
    </p>
  )}
</Card>
```

---

## 📋 Additional Components Needed

### 1. VideoPlayerCard (Optional Enhancement)
Dedicated component for video player with controls and metadata.

### 2. VideoHistoryItem (Optional Enhancement)
Individual video card component with thumbnail, status, and actions.

### 3. EmptyState (Reusable)
Empty state component for no videos/history.

---

## 🧪 Testing Checklist

### Step 6
- [ ] Load page with existing project
- [ ] Show thumbnail preview (confirmed)
- [ ] Show thumbnail warning (not confirmed)
- [ ] Click "Generate Video" with sufficient credits
- [ ] Show credit confirmation modal
- [ ] Confirm generation → job starts
- [ ] Progress updates in real-time (every 2s)
- [ ] All 4 steps show progress
- [ ] Overall progress bar updates
- [ ] Video completes → success message
- [ ] "View in Finalize" button enabled
- [ ] Navigate to Step 7
- [ ] Try generation with insufficient credits
- [ ] Try generation without confirmed thumbnail

### Step 7
- [ ] Load page with completed video
- [ ] Video player shows with thumbnail poster
- [ ] Download button works
- [ ] Video history shows all videos
- [ ] Regenerate video flow works
- [ ] Credit confirmation before regeneration
- [ ] New video appears in history
- [ ] Delete video works
- [ ] Empty state when no videos
- [ ] Processing video shows progress
- [ ] Polling updates processing video
- [ ] Insufficient credits modal

---

## 📚 API Client Functions Needed

Already implemented in `src/lib/credit-client.ts`:
- ✅ `getCreditStatus()`
- ✅ `getProjectVideos(projectId)`
- ✅ `regenerateVideo(projectId)`
- ✅ `deleteProjectVideo(projectId, videoId)`

Need to add:
- `createVideoJob(projectId, ttsJobId)` — POST `/api/v1/video?project_id=X&tts_job_id=Y`
- `getVideoJob(jobId)` — GET `/api/v1/video/{jobId}`

---

## 🎯 Priority Order

1. **High Priority** (Core functionality)
   - [ ] Step 6: Video generation with credit confirmation
   - [ ] Step 6: Real-time progress polling
   - [ ] Step 7: Display latest completed video
   - [ ] Step 7: Video regeneration flow

2. **Medium Priority** (Enhanced UX)
   - [ ] Step 6: Thumbnail validation
   - [ ] Step 7: Video history list
   - [ ] Step 7: Video deletion
   - [ ] Error handling and retry logic

3. **Low Priority** (Nice-to-have)
   - [ ] Estimated time remaining calculation
   - [ ] Video player enhancements
   - [ ] Empty state improvements
   - [ ] Accessibility improvements

---

**Status:** 📋 Ready for Implementation  
**Next:** Implement Step 6 compose page with video generation  
**Last Updated:** July 6, 2026
