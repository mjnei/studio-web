export type FlowLifecycleStatus = "queued" | "processing" | "completed" | "failed";
export type FlowPhase = "tts" | "render" | "none";
export type FlowSubStatus = "queued" | "processing" | "completed" | "failed";

export type VideoResolution = "480p" | "720p" | "1080p" | "1440p";
export type VideoRatioFormat = "16x9" | "4x3" | "1x1" | "3x4" | "9x16";

export interface FlowJobCreate {
  text_en: string;
  text_zh_cn: string;
  text_zh_tw: string;
  clip_s3_keys: string[];
  voice_id: number;
  is_anon?: boolean;
  speed_ratio?: number;
  resolution?: VideoResolution;
  ratio_format?: VideoRatioFormat;
  idempotency_key?: string | null;
}

export interface ClipUploadResponse {
  clip_s3_keys: string[];
}

export interface FlowJobResponse {
  id: number;
  user_id: number | null;
  lifecycle_status: FlowLifecycleStatus;
  current_phase: FlowPhase;

  // Per-locale TTS statuses
  tts_en_status: FlowSubStatus;
  tts_zh_cn_status: FlowSubStatus;
  tts_zh_tw_status: FlowSubStatus;

  // Render phase
  render_status: FlowSubStatus;

  // TTS output paths
  audio_en_path: string | null;
  audio_zh_cn_path: string | null;
  audio_zh_tw_path: string | null;

  // Final video paths
  video_en_path: string | null;
  video_zh_cn_path: string | null;
  video_zh_tw_path: string | null;

  // Presigned media URLs
  audio_en_url?: string | null;
  audio_zh_cn_url?: string | null;
  audio_zh_tw_url?: string | null;
  video_en_url?: string | null;
  video_zh_cn_url?: string | null;
  video_zh_tw_url?: string | null;

  // Error / retry
  error_message: string | null;
  retry_count: number;

  // Timestamps
  created_at: string;
  completed_at: string | null;
  tts_started_at: string | null;
  tts_completed_at: string | null;
  render_started_at: string | null;
  render_completed_at: string | null;
}
