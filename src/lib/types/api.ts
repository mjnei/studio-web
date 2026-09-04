// API Response Types for Backend Integration

import type { WorkflowStep } from "@/lib/project-client/types";

// ============================================================================
// User Types
// ============================================================================

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  picture_url: string | null;
  locale: string | null;
  provider: string;
  has_password: boolean;
  is_active: boolean;
  role: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectResponse {
  id: string;
  status: "draft" | "in-progress" | "completed";
  last_step: WorkflowStep;
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
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  poster_url?: string;
  genre_ids: number[];
  rating: number;
  release_date?: string | null;
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

/**
 * Unified voice response - user-owned voice with community sharing support
 */
export interface VoiceResponse {
  id: number;
  user_id: number;
  name: string;
  audio_path: string;
  mime_type: string;
  language?: string | null;
  duration_seconds?: number | null;
  is_shared: boolean;
  is_approved: boolean;
  is_deleted: boolean;
  admin_approved_at?: string | null;
  created_at: string;
  updated_at: string;
  // Dynamically attached by useVoices hook when fetching audio URLs
  audio_url?: string;
  audio_storage_type?: "s3" | "local";
  audio_expires_in?: number | null;
}

/**
 * Voice with creator information for community voices
 */
export interface VoiceWithCreator extends VoiceResponse {
  creator_username: string;
  /** Admin-configured community voice avatar URL; empty/null when not set */
  creator_avatar_url?: string | null;
  admin_approved_at?: string | null; // "Approved 3 days ago" format
}

/**
 * Available voices for user (own + public community)
 */
export interface AvailableVoicesResponse {
  own_voices: VoiceResponse[];
  community_voices: VoiceWithCreator[];
}

export interface VoiceListResponse {
  voices: VoiceResponse[];
  total: number;
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
  voice_id?: number | null; // Now references unified voices table
  voice_name: string;
  external_job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  audio_url?: string;
  audio_duration_seconds?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;

  // Queue visibility fields (only present when status === 'queued')
  queue_position?: number | null; // 1-indexed (1 = next in line)
  jobs_ahead?: number | null; // How many jobs before this one
  queue_depth?: number | null; // Total queued jobs
  estimated_wait_seconds?: number | null; // Estimated wait time
}

// ============================================================================
// Video Types
// ============================================================================

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
}

// ============================================================================
// Admin Types
// ============================================================================

export interface GenreInput {
  id: number;
  name: string;
}

export interface MovieCreateRequest {
  id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  tagline?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: GenreInput[];
  original_language?: string | null;
  release_date?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
  vote_count?: number | null;
  popularity?: number | null;
}

export interface MovieUpdateRequest {
  title?: string;
  original_title?: string | null;
  overview?: string | null;
  tagline?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: GenreInput[];
  original_language?: string | null;
  release_date?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
  vote_count?: number | null;
  popularity?: number | null;
}

// ============================================================================
// Voice Types
// Note: All voices are user-owned. No catalog/stock voice types.
// ============================================================================

export interface VoiceUpdateRequest {
  name?: string;
  language?: string | null;
}

export interface VoiceShareRequest {
  is_shared: boolean;
}

export interface VoiceApprovalRequest {
  is_approved: boolean;
}

export interface VoiceBulkImportRequest {
  target_user_id: number;
  voices: Array<{
    name: string;
    audio_path: string;
    mime_type: string;
    language?: string | null;
    duration_seconds?: number | null;
  }>;
}

export interface VoiceBulkImportResponse {
  success_count: number;
  failure_count: number;
  errors: string[];
  target_user_id: number;
  target_username: string;
}
