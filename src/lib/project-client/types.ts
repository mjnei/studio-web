export type WorkflowStep =
  | "source" // Step 1
  | "script" // Step 2
  | "voice" // Step 3 (was Step 4) - MOVED UP
  | "details" // Step 4 (was Step 3) - MOVED DOWN
  | "preview" // Step 5
  | "compose" // Step 6
  | "export"; // Step 7
export type ProjectStatus = "draft" | "in-progress" | "completed";
export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface MovieResponse {
  id: number;
  title: string;
  original_title?: string | null;
  original_language?: string | null;
  overview?: string | null;
  tagline?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: Array<{ id?: number; name?: string } | Record<string, unknown>> | null;
  release_date?: string | null;
  runtime?: number | null;
  popularity?: number | null;
  vote_average?: number | null;
  vote_count?: number | null;
  // External identifiers exposed to authenticated users
  imdb_id?: string | null;
  douban_id?: string | null;
}

export interface VoiceResponse {
  id: string;
  name: string;
  provider: string;
  description?: string | null;
  preview_path?: string | null;
  gender?: string | null;
  accent?: string | null;
  language?: string | null;
  category?: string | null;
  is_available: boolean;
}

export interface ProjectScriptResponse {
  id: string;
  project_id: string;
  content: string;
  word_count: number;
  estimated_duration_minutes: number;
  paragraph_count?: number | null;
  version_number: number;
  created_at: string;
  updated_at: string;
}

export interface TTSJobResponse {
  id: string;
  project_id: string;
  script_id: string;
  voice_id?: number | null;
  voice_name: string;
  external_job_id: string;
  status: JobStatus;
  progress: number;
  audio_url?: string;
  audio_duration_seconds?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;

  // Queue visibility fields (only present when status === 'queued')
  queue_position?: number | null;
  jobs_ahead?: number | null;
  queue_depth?: number | null;
  estimated_wait_seconds?: number | null;
}

export interface VideoJobResponse {
  id: string;
  project_id: string;
  tts_job_id?: string | null;
  status: JobStatus;
  progress: number;
  video_url?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface ProjectThumbnail {
  id: number;
  project_id: number;
  base_image_url?: string | null;
  base_image_status: "pending" | "generating" | "completed" | "failed";
  base_image_error?: string | null;
  custom_image_url?: string | null;
  custom_prompt?: string | null;
  overlay_text?: string | null;
  overlay_position: "left" | "right";
  overlay_font: "bold" | "elegant" | "modern";
  overlay_color: string;
  overlay_size: number;
  overlay_background_blur: boolean;
  final_url?: string | null;
  confirmed: boolean;
  composition_status: "idle" | "processing" | "completed" | "failed";
  composition_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectResponse {
  id: string;
  user_id: string;
  project_name?: string | null;
  movie_id?: number | null;
  active_script_id?: string | null;
  active_tts_job_id?: string | null;
  active_video_job_id?: string | null;
  status: ProjectStatus;
  last_step: WorkflowStep;
  suggested_names?: Array<{ name: string; reason?: string }> | null;
  script_summary?: string | null;
  thumbnail?: ProjectThumbnail | null;
  created_at: string;
  updated_at: string;
  movie?: MovieResponse | null;
  active_script?: ProjectScriptResponse | null;
  active_tts_job?: TTSJobResponse | null;
  active_video_job?: VideoJobResponse | null;
}

export interface MovieListResponse {
  movies: MovieResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface VoiceListResponse {
  voices: VoiceResponse[];
  total: number;
}

export interface NameSuggestion {
  name: string;
  reason?: string | null;
}

export interface SuggestedNamesResponse {
  suggestions: NameSuggestion[];
  cached: boolean;
}

export interface ScheduleAgnesResponse {
  status: string;
  scheduled: string[];
}
