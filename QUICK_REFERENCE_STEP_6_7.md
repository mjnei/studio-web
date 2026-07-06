# Quick Reference: Step 6 & 7 Implementation

**For Developers:** Quick copy-paste reference for implementing video generation workflow

---

## 🚀 Step 6: Compose Page

### Key Imports
```typescript
import { VideoGenerationProgress } from "@/components/project/VideoGenerationProgress";
import { CreditConfirmationModal } from "@/components/credits/CreditConfirmationModal";
import { CreditUsageIndicator } from "@/components/credits/CreditUsageIndicator";
import { getCreditStatus } from "@/lib/credit-client";
import { createVideoJob, getVideoJob } from "@/lib/video-client"; // Need to create
```

### State Setup
```typescript
const [videoJob, setVideoJob] = useState<VideoJob | null>(null);
const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);
const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
```

### Generate Video Handler
```typescript
const handleGenerateVideo = async () => {
  if (!creditStatus || creditStatus.credits_remaining < 1) {
    toast.error("Insufficient credits");
    return;
  }
  if (!project?.thumbnail_confirmed) {
    toast.error("Confirm thumbnail first");
    return;
  }
  setShowConfirmModal(true);
};

const handleConfirmGeneration = async () => {
  setShowConfirmModal(false);
  setIsGenerating(true);
  
  try {
    const job = await createVideoJob(projectId, project.active_tts_job_id);
    setVideoJob(job);
    startPolling(job.id);
    toast.success("Video generation started!");
  } catch (error: any) {
    toast.error(error.message || "Failed to start generation");
  } finally {
    setIsGenerating(false);
  }
};
```

### Polling Logic
```typescript
const startPolling = (jobId: string) => {
  if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  
  pollVideoStatus(jobId);
  pollIntervalRef.current = setInterval(() => pollVideoStatus(jobId), 2000);
};

const pollVideoStatus = async (jobId: string) => {
  try {
    const updated = await getVideoJob(jobId);
    setVideoJob(updated);
    
    if (updated.status === "completed" || updated.status === "failed") {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      await loadCreditStatus();
      
      if (updated.status === "completed") {
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
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };
}, []);
```

### Render States
```typescript
{/* No video yet */}
{!videoJob && (
  <Card>
    <Button onClick={handleGenerateVideo}>Generate Video</Button>
  </Card>
)}

{/* Generating */}
{videoJob && (videoJob.status === "queued" || videoJob.status === "processing") && (
  <VideoGenerationProgress
    overallProgress={videoJob.progress}
    currentStep={videoJob.steps.find(s => s.status === "processing")?.step_number || 1}
    steps={videoJob.steps}
  />
)}

{/* Complete */}
{videoJob && videoJob.status === "completed" && (
  <Card className="bg-success-bg/10">
    <h3>Video Complete!</h3>
    <Button onClick={() => router.push(`/project/${projectId}/finalize`)}>
      View in Finalize
    </Button>
  </Card>
)}

{/* Failed */}
{videoJob && videoJob.status === "failed" && (
  <Card className="bg-error-bg/10">
    <h3>Generation Failed</h3>
    <p>{videoJob.error_message}</p>
    <Button onClick={() => setVideoJob(null)}>Try Again</Button>
  </Card>
)}

{/* Confirmation Modal */}
<CreditConfirmationModal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  onConfirm={handleConfirmGeneration}
  creditCost={1}
  creditsRemaining={creditStatus?.credits_remaining || 0}
  isProcessing={isGenerating}
/>
```

---

## 🎬 Step 7: Finalize Page

### Key Imports
```typescript
import { VideoGenerationProgress } from "@/components/project/VideoGenerationProgress";
import { CreditConfirmationModal } from "@/components/credits/CreditConfirmationModal";
import { getProjectVideos, regenerateVideo, deleteProjectVideo } from "@/lib/credit-client";
```

### State Setup
```typescript
const [videos, setVideos] = useState<VideoJob[]>([]);
const [latestCompletedVideo, setLatestCompletedVideo] = useState<VideoJob | null>(null);
const [processingVideo, setProcessingVideo] = useState<VideoJob | null>(null);
const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [isRegenerating, setIsRegenerating] = useState(false);
const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
```

### Load Videos
```typescript
const loadVideos = async () => {
  try {
    const response = await getProjectVideos(projectId);
    setVideos(response.videos);
    
    const completed = response.videos.find(v => v.status === "completed");
    const processing = response.videos.find(
      v => v.status === "queued" || v.status === "processing"
    );
    
    setLatestCompletedVideo(completed || null);
    setProcessingVideo(processing || null);
    
    if (processing) startPolling(processing.id);
  } catch (error) {
    console.error("Failed to load videos:", error);
    toast.error("Failed to load videos");
  }
};

useEffect(() => {
  loadVideos();
  loadCreditStatus();
}, [projectId]);
```

### Regenerate Handler
```typescript
const handleRegenerate = async () => {
  if (!creditStatus || creditStatus.credits_remaining < 1) {
    toast.error("Insufficient credits");
    return;
  }
  if (!project?.thumbnail_confirmed) {
    toast.error("Complete Step 6 first");
    return;
  }
  setShowConfirmModal(true);
};

const handleConfirmRegeneration = async () => {
  setShowConfirmModal(false);
  setIsRegenerating(true);
  
  try {
    await regenerateVideo(projectId);
    await loadVideos();
    await loadCreditStatus();
    toast.success("Video generation started!");
  } catch (error: any) {
    if (error.status === 402) {
      toast.error("Insufficient credits");
    } else {
      toast.error(error.message || "Failed to start regeneration");
    }
  } finally {
    setIsRegenerating(false);
  }
};
```

### Delete Handler
```typescript
const handleDeleteVideo = async (videoId: string) => {
  if (!confirm("Delete this video? Cannot be undone.")) return;
  
  try {
    await deleteProjectVideo(projectId, videoId);
    await loadVideos();
    toast.success("Video deleted");
  } catch (error) {
    toast.error("Failed to delete video");
  }
};
```

### Render Latest Video
```typescript
{latestCompletedVideo && (
  <Card>
    <h3>Your Latest Video</h3>
    <video
      src={latestCompletedVideo.video_url}
      controls
      poster={project?.final_thumbnail_url}
      className="w-full aspect-video"
    />
    <div className="flex gap-3 mt-4">
      <Button onClick={() => window.open(latestCompletedVideo.video_url, "_blank")}>
        Download
      </Button>
      <Button>Publish</Button>
    </div>
  </Card>
)}
```

### Render Processing Status
```typescript
{processingVideo && (
  <VideoGenerationProgress
    overallProgress={processingVideo.progress}
    currentStep={processingVideo.steps.find(s => s.status === "processing")?.step_number || 1}
    steps={processingVideo.steps}
  />
)}
```

### Render Video History
```typescript
<Card>
  <h3>Video History</h3>
  {videos.length === 0 ? (
    <p>No video history yet</p>
  ) : (
    <div className="space-y-3">
      {videos.map((video) => (
        <div key={video.id} className="flex gap-4 p-4 bg-surface-raised rounded-lg">
          <div className="w-32 aspect-video bg-surface-base rounded overflow-hidden">
            <img src={project?.final_thumbnail_url} alt="" />
          </div>
          <div className="flex-1">
            <h4>Video #{video.generation_attempt}</h4>
            <p className="text-xs text-text-muted">
              {new Date(video.created_at).toLocaleDateString()}
            </p>
            <span className={`badge ${video.status}`}>{video.status}</span>
            <div className="flex gap-2 mt-2">
              {video.status === "completed" && (
                <button onClick={() => window.open(video.video_url, "_blank")}>
                  Download
                </button>
              )}
              <button onClick={() => handleDeleteVideo(video.id)}>
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

### Render Regeneration Form
```typescript
<Card>
  <h3>Generate New Video</h3>
  <p>Create a new version with current settings.</p>
  
  {creditStatus && (
    <CreditUsageIndicator cost={1} remainingCredits={creditStatus.credits_remaining} />
  )}
  
  <Button
    onClick={handleRegenerate}
    disabled={isRegenerating || !project?.thumbnail_confirmed}
  >
    {isRegenerating ? "Generating..." : "Generate New Video"}
  </Button>
</Card>

<CreditConfirmationModal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  onConfirm={handleConfirmRegeneration}
  creditCost={1}
  creditsRemaining={creditStatus?.credits_remaining || 0}
  isProcessing={isRegenerating}
/>
```

---

## 📡 API Client Functions (Need to Create)

### File: `src/lib/video-client.ts`

```typescript
import { request } from "@/lib/api-client";

export interface VideoJob {
  id: string;
  project_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  video_url: string | null;
  error_message: string | null;
  credit_cost: number;
  generation_attempt: number;
  steps: VideoStep[];
  created_at: string;
}

export interface VideoStep {
  step_number: number;
  step_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
}

export async function createVideoJob(projectId: string, ttsJobId: string): Promise<VideoJob> {
  return request<VideoJob>(`/video?project_id=${projectId}&tts_job_id=${ttsJobId}`, {
    method: "POST",
  });
}

export async function getVideoJob(jobId: string): Promise<VideoJob> {
  return request<VideoJob>(`/video/${jobId}`);
}
```

---

## ⚡ Quick Setup Checklist

### Step 6
- [ ] Import components (VideoGenerationProgress, CreditConfirmationModal)
- [ ] Add state (videoJob, creditStatus, showConfirmModal, pollInterval)
- [ ] Implement handleGenerateVideo
- [ ] Implement handleConfirmGeneration
- [ ] Implement polling (startPolling, pollVideoStatus)
- [ ] Add cleanup (clear interval on unmount)
- [ ] Render 4 states (no video, generating, complete, failed)
- [ ] Add confirmation modal

### Step 7
- [ ] Import components (same as Step 6)
- [ ] Add state (videos, latestCompletedVideo, processingVideo, etc.)
- [ ] Implement loadVideos
- [ ] Implement handleRegenerate
- [ ] Implement handleDeleteVideo
- [ ] Implement polling (reuse from Step 6)
- [ ] Render latest video player
- [ ] Render processing status
- [ ] Render video history list
- [ ] Render regeneration form

---

## 🔧 Environment

Make sure these are running:
```bash
# Terminal 1: Backend
cd studio-backend && uv run uvicorn app.main:app --reload --port 8020

# Terminal 2: Background Worker
cd studio-backend && uv run python -m app.services.background_worker

# Terminal 3: Mock Video Processor
cd studio-backend && uv run python scripts/mock_video_processor.py

# Terminal 4: Frontend
cd studio-web && npm run dev
```

---

## 🐛 Common Issues

### Polling not working
- Check `pollIntervalRef.current` is set
- Verify cleanup in useEffect return
- Console.log in pollVideoStatus to debug

### Modal not showing
- Check `showConfirmModal` state
- Verify modal isOpen prop
- Check z-index of modal

### Credit status not loading
- Check `getCreditStatus()` API call
- Verify backend is running
- Check network tab for errors

### Video player not showing
- Verify `video_url` is not null
- Check video URL is accessible
- Use `poster` prop for thumbnail

---

**Status:** Ready for Copy-Paste Implementation  
**Last Updated:** July 6, 2026
