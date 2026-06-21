// API Response Types for Backend Integration

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectResponse {
  id: string;
  status: "draft" | "in-progress" | "completed";
  last_step: "source" | "script" | "voice" | "compose";
  movie_id: string | null;
  active_script_id: string | null;
  active_tts_job_id: string | null;
  active_video_job_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface ProjectDetailResponse extends ProjectResponse {
  movie?: MovieResponse;
  active_script?: ProjectScriptResponse;
  active_tts_job?: TTSJobResponse;
  active_video_job?: VideoJobResponse;
}

export interface ProjectUpdate {
  status?: "draft" | "in-progress" | "completed";
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
  page: number;
}

// ============================================================================
// Movie Types
// ============================================================================

export interface MovieResponse {
  id: string;
  tmdb_id: number;
  title: string;
  poster_url: string;
  genre_ids: number[];
  rating: number;
  release_date: string;
  created_at: string;
  updated_at: string;
}

export interface MovieListResponse {
  movies: MovieResponse[];
  total: number;
}

// ============================================================================
// Voice Types
// ============================================================================

export interface VoiceResponse {
  id: string;
  provider_id: string;
  provider: string;
  name: string;
  gender?: string;
  age_group?: string;
  accent?: string;
  category?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoiceListResponse {
  voices: VoiceResponse[];
  total: number;
}

export interface VoiceRecordingResponse {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_path: string;
  duration_seconds: number | null;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Script Types
// ============================================================================

export interface ProjectScriptResponse {
  id: string;
  project_id: string;
  content: string;
  version_number: number;
  word_count: number;
  paragraph_count: number;
  estimated_duration_seconds: number;
  generation_params?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TTS Types
// ============================================================================

export interface TTSJobResponse {
  id: string;
  project_id: string;
  script_id: string;
  voice_id: string;
  voice_name: string;
  external_job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  audio_url?: string;
  audio_duration_seconds?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Video Types
// ============================================================================

export interface VideoGenerationStepResponse {
  id: string;
  video_job_id: string;
  step_number: number;
  step_name: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoJobResponse {
  id: string;
  project_id: string;
  tts_job_id: string;
  external_job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  video_url?: string;
  video_duration_seconds?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  steps?: VideoGenerationStepResponse[];
}
