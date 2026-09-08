# Flow Jobs Admin Testing & Submission Interface

**Route**: `/admin/flow` (`src/app/(shell)/admin/flow/page.tsx`)  
**Package**: `studio-web`  
**Backend Endpoints**: `POST /api/v1/flow/upload-clips`, `POST /api/v1/flow`, `GET /api/v1/flow/{job_id}`, `POST /api/v1/flow/{job_id}/retry-render`, `GET /api/v1/flow`

---

## 1. Overview

The **Flow Jobs Admin Page** provides internal testing, submission, and monitoring for the `flow` job type. A Flow job takes:
1. **10 video clips** uploaded to S3.
2. **3-locale narration text** (`en`, `zh-CN`, `zh-TW`, ≈ 10 sentences each).
3. **Voice & video settings** (voice selection, speech speed ratio, video resolution, aspect ratio format).

The backend executes a 2-phase pipeline handled entirely by the **IndexTTS worker** (no Remotion worker):
- **Phase 1: TTS Synthesis**: Synthesizes 3 audio tracks (`en`, `zh-CN`, `zh-TW`) sequentially via the `tts_jobs` RabbitMQ queue.
- **Phase 2: FFmpeg Render**: Divides the audio into 10 time windows by character count (each ≈ 4 s), speed-adjusts the 10 video clips via ffmpeg (`setpts` and `atempo`) to match each window, concatenates them, overlays the speech audio, and outputs 3 final `.mp4` videos.

---

## 2. Key Features & Workflow

### 2.1 Video Clip Upload (`FlowClipsUploader`)
- **File Constraints**: Exactly 10 video files (`.mp4`, `.mov`, `.webm`, `.avi`, `.mkv`), up to 500 MB per clip.
- **Automatic Alphanumeric Sorting**: Selected files are automatically sorted from A to Z in natural alphanumeric order (`clip1.mp4`, `clip2.mp4`, ... `clip10.mp4`). No manual drag-and-drop reordering is required.
- **Upload Action**: Uploads the 10 files via multipart `FormData` (`clips`) to `POST /api/v1/flow/upload-clips`, returning 10 S3 keys (`flow-clips/{user_id}/{uuid}.mp4`).
- **Sample Preset Button**: A **"Use Sample S3 Keys"** button populates 10 mock S3 keys (`flow-clips/sample/clip_01.mp4` ... `clip_10.mp4`) for rapid developer testing without re-uploading large video files every time.

### 2.2 3-Locale Script Input (`FlowTextInput`)
- **Validation Rules**:
  - English (`text_en`) is **mandatory**.
  - At least one Chinese version (Simplified `zh-CN` or Traditional `zh-TW`) is **mandatory**.
  - If one Chinese version is left blank, the client automatically translates between Simplified and Traditional Chinese using `opencc-js` before submission or via the **"Sync zh-CN ↔ zh-TW"** button.
- **Sample Preset Button**: A **"Load Sample Scripts"** button pre-populates synchronized, realistic 10-sentence story paragraphs across all 3 languages.
- **Real-Time Character Counters**: Displays active character counts per locale.

### 2.3 Voice & Video Configuration (`FlowConfigForm`)
- **Voice Selector**: Loads available voices from `GET /api/v1/voices/available` with real-time text search.
- **Anonymous Voice Toggle**: Allows testing either private voices (`voice.voices_private`) or anonymous voices (`voice.voices_anon`).
- **Speech Speed Ratio**: Interactive slider from `0.5x` to `2.0x` (step `0.1x`, default `1.0x`).
- **Video Resolution**: Dropdown with `480p`, `720p` (default), `1080p`, and `1440p`.
- **Aspect Ratio Format**: Dropdown with `16:9` (landscape default), `9:16` (portrait / shorts), `1:1` (square), `4:3`, and `3:4`.
- **Idempotency Key**: Optional client-generated UUID to prevent duplicate job creation upon retries.

### 2.4 Live Phase Monitoring (`FlowJobMonitor`)
- **Real-Time Auto-Polling**: Automatically polls `GET /api/v1/flow/{job_id}` every 3 seconds while the job is in flight (`queued` or `processing`).
- **Step-by-Step Visualization**:
  - **Phase 1: Multi-Locale TTS**: Independent status badges for English (`tts_en_status`), Simplified Chinese (`tts_zh_cn_status`), and Traditional Chinese (`tts_zh_tw_status`).
  - **Phase 2: Video Render**: Displays `render_status` and retry counter (`retry_count / 3`).
- **Render Retry Button**: If the render phase fails while all 3 TTS audio files are complete and `retry_count < 3`, a **"Retry Failed Render"** button triggers `POST /api/v1/flow/{job_id}/retry-render`.
- **Error Banners**: Shows actionable error details if any phase fails.

### 2.5 Multi-Locale Media Preview (`FlowResultsPreview`)
- **Language Tabs**: Switch between English (`en`), 简体中文 (`zh-CN`), and 繁體中文 (`zh-TW`).
- **Synchronized Video Player**: HTML5 `<video controls>` element streaming the presigned S3 URL of the final rendered video (`video_en_url`, `video_zh_cn_url`, `video_zh_tw_url`).
- **Audio Player**: Audio playback for intermediate synthesized speech (`audio_en_url`, `audio_zh_cn_url`, `audio_zh_tw_url`).
- **S3 Keys & Downloads**: One-click S3 key copy buttons and direct download links for both audio and video files.

### 2.6 Job Lookup & History (`FlowJobHistory`)
- **Direct Job ID Lookup**: Input any numeric Job ID to inspect and navigate to `/admin/flow/{job_id}` immediately.
- **Recent Jobs List**: Fetches recent Flow jobs for the current user via `GET /api/v1/flow?limit=20`, displaying ID, status badge, phase, timestamp, and a **"View"** link that navigates directly to the dedicated detail page at `/admin/flow/{job_id}`.

---

## 3. Architecture & File Inventory

```
studio-web/
├── src/
│   ├── types/
│   │   └── flow.ts                              # Flow API request/response types
│   ├── lib/
│   │   ├── chinese-converter.ts                 # OpenCC zh-CN ↔ zh-TW translation helpers
│   │   ├── api/
│   │   │   └── flow-client.ts                   # Flow API client (upload, create, get, retry, list)
│   │   └── admin-nav.ts                         # Admin navigation registration (/admin/flow)
│   └── app/(shell)/admin/
│       └── flow/
│           ├── layout.tsx                       # Flow Admin layout metadata
│           ├── page.tsx                         # Main Flow Admin Page (creation & history)
│           ├── [id]/
│           │   ├── layout.tsx                   # Flow Job detail page metadata
│           │   └── page.tsx                     # Dedicated Flow Job detail & monitor page
│           └── components/
│               ├── FlowClipsUploader.tsx        # 10-clip uploader with a-z sorting & sample keys
│               ├── FlowTextInput.tsx            # 3-locale script inputs with auto-translation
│               ├── FlowConfigForm.tsx           # Voice, speed, resolution, ratio configuration
│               ├── FlowJobMonitor.tsx           # Real-time multi-phase status & retry button
│               ├── FlowResultsPreview.tsx       # Per-locale video & audio players with S3 keys
│               └── FlowJobHistory.tsx           # Recent jobs table & ID lookup
```

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/flow/upload-clips` | Uploads up to 10 video clips (`clips` field in multipart `FormData`), returns `clip_s3_keys` |
| `POST` | `/api/v1/flow` | Creates a Flow job, writes row to `processing.flow_jobs`, publishes 3 TTS jobs to `tts_jobs` queue |
| `GET` | `/api/v1/flow/{job_id}` | Polls job status, returns per-locale TTS statuses, render status, and presigned media URLs |
| `POST` | `/api/v1/flow/{job_id}/retry-render` | Retries failed render phase if all 3 TTS locales are done and `retry_count < 3` |
| `GET` | `/api/v1/flow?limit=20` | Lists recent Flow jobs for the current user |
