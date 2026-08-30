// ============================================================================
// Admin TTS Jobs Types
// ============================================================================

export interface StaleJob {
  id: number;
  job_id: string;
  status: "queued" | "processing";
  created_at: string;
  duration_seconds: number;
  voice_id: number;
  text?: string;
}

export interface FailedJob {
  id: number;
  job_id: string;
  status: "failed";
  created_at: string;
  completed_at?: string;
  error_message?: string;
  voice_id: number;
  text?: string;
  project_id?: number;
}

export interface CompletedJob {
  id: number;
  job_id: string;
  status: "completed";
  created_at: string;
  started_at?: string;
  completed_at?: string;
  voice_id: number;
  text?: string;
  project_id?: number;
  audio_path?: string;
  audio_duration?: number;
  synthesis_duration_seconds?: number;
}

export interface TTSJobStats {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  queued_jobs: number;
  processing_jobs: number;
  success_rate: number;
  average_duration_seconds: number;
  stale_jobs_count: number;
}

export interface TTSJob {
  id: number;
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  voice_id: number;
  text?: string;
  project_id?: number;
  audio_url?: string;
  duration_seconds?: number;
}

// ============================================================================
// Playground TTS Admin Types
// ============================================================================

export interface PlaygroundStaleJob {
  id: number;
  job_id: string;
  status: "queued" | "processing";
  created_at: string;
  started_at?: string;
  duration_seconds: number;
  voice_id?: number;
  anonymous_voice_id?: number;
  text: string;
  client_ip_address: string;
}

export interface PlaygroundFailedJob {
  id: number;
  job_id: string;
  status: "failed";
  created_at: string;
  completed_at?: string;
  error_message?: string;
  voice_id?: number;
  anonymous_voice_id?: number;
  text: string;
  client_ip_address: string;
  retry_count: number;
}

export interface PlaygroundRateLimitedJob {
  id: number;
  job_id: string;
  status: "rate_limited";
  created_at: string;
  completed_at?: string;
  client_ip_address: string;
  text: string;
  voice_id?: number;
  anonymous_voice_id?: number;
}

export interface PlaygroundCompletedJob {
  id: number;
  job_id: string;
  status: "completed";
  created_at: string;
  started_at?: string;
  completed_at?: string;
  voice_id?: number;
  anonymous_voice_id?: number;
  text: string;
  audio_path?: string;
  audio_duration?: number;
  synthesis_duration_seconds?: number;
  client_ip_address: string;
}

export interface PlaygroundTTSJobStats {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  queued_jobs: number;
  processing_jobs: number;
  rate_limited_count: number;
  success_rate: number;
  average_duration_seconds: number;
  stale_jobs_count: number;
  unique_ip_count: number;
}

export interface PlaygroundTTSJob {
  id: number;
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed" | "rate_limited";
  created_at: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  error_message?: string;
  voice_id?: number;
  anonymous_voice_id?: number;
  text: string;
  language: string;
  ratio: number;
  retry_count: number;
  audio_path?: string;
  audio_duration?: number;
  synthesis_duration_seconds?: number;
  correlation_id: string;
  client_ip_address: string;
  user_agent?: string;
}

// ============================================================================
// Playground Types
// ============================================================================

export interface PlaygroundTTSRequest {
  text: string;
  voice_id: number;
  speed_ratio?: number;
}

export interface PlaygroundJob {
  id: string;
  text: string;
  voice_id: number;
  speed_ratio: number;
  status: "pending" | "queued" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  error?: string;
  audio_url?: string;
  duration_seconds?: number;
}

export interface PlaygroundVoice {
  id: number;
  name: string;
  language: string;
  user_id: number;
  is_public: boolean;
}

// ============================================================================
// Audit Logs Types
// ============================================================================

export interface AuditLog {
  id: number;
  action: string;
  user_id: number | null;
  user_email?: string;
  user_name?: string;
  resource_type: string | null;
  resource_id: string | null;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string;
  created_at: string;
  source?: "postgres" | "axiom"; // Track data source
}

/** Raw audit event shape returned by backend Axiom/Postgres audit endpoints. */
export interface AuditEventPayload {
  timestamp: string;
  user_id: number | null;
  action: string;
  detail: Record<string, unknown> | null;
  ip_address: string | null;
  environment?: string;
  service?: string;
}

export interface AuditStats {
  total_logs: number;
  actions_by_type: Record<string, number>;
  unique_users: number;
  resources_by_type: Record<string, number>;
  date_range: {
    start: string;
    end: string;
  };
}

export interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditFilter {
  action?: string;
  user_id?: number;
  resource_type?: string;
  resource_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationPreference {
  id: number;
  user_id: number;
  notification_type: string;
  enabled: boolean;
  email: boolean;
  in_app: boolean;
  push: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreferencesListResponse {
  items: NotificationPreference[];
}

export interface Channels {
  email?: boolean;
  in_app?: boolean;
  push?: boolean;
}

export interface UpdatePreferenceRequest {
  notification_type: string;
  enabled: boolean;
  email?: boolean;
  in_app?: boolean;
  push?: boolean;
}

export interface BulkUpdatePreferencesRequest {
  preferences: Partial<NotificationPreference>[];
}

// ============================================================================
// Admin Projects Types
// ============================================================================

export type AdminProjectStatus = "draft" | "in-progress" | "completed";
export type AdminProjectStep =
  "source" | "script" | "details" | "voice" | "preview" | "compose" | "export";

export interface AdminProject {
  id: number;
  user_id: number;
  user_email?: string | null;
  user_name?: string | null;
  project_name?: string | null;
  status: AdminProjectStatus;
  last_step: AdminProjectStep;
  movie_id?: number | null;
  active_script_id?: number | null;
  active_tts_job_id?: number | null;
  script_summary?: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  movie?: {
    id: number;
    title: string;
    original_title?: string | null;
    poster_path?: string | null;
  } | null;
  active_tts_job?: {
    id: number;
    status: string;
    error_message?: string | null;
  } | null;
}

export interface AdminProjectListResponse {
  projects: AdminProject[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminProjectStats {
  total: number;
  active: number;
  deleted: number;
  draft: number;
  in_progress: number;
  completed: number;
}

export interface AdminProjectFilter {
  status?: AdminProjectStatus;
  step?: AdminProjectStep;
  user_id?: number;
  q?: string;
  include_deleted?: boolean;
  deleted_only?: boolean;
}

export interface AdminProjectUpdate {
  project_name?: string | null;
  status?: AdminProjectStatus;
  last_step?: AdminProjectStep;
  movie_id?: number | null;
}

// ============================================================================
// Admin Users Types
// ============================================================================

export type AdminUserRole = "user" | "admin";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  picture_url?: string | null;
  role: AdminUserRole;
  is_active: boolean;
  is_deleted: boolean;
  provider: string;
  locale?: string | null;
  membership_tier: string;
  subscription_status: string;
  onboarding_completed: boolean;
  referral_code: string;
  firebase_uid?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  credits_remaining?: number | null;
  project_count: number;
  referral_balance?: number;
  referrer_id?: number | null;
  referrer_name?: string | null;
  referrer_email?: string | null;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminUserStats {
  total: number;
  active: number;
  suspended: number;
  admins: number;
  deleted: number;
}

export interface AdminUserFilter {
  q?: string;
  role?: AdminUserRole;
  is_active?: boolean;
  include_deleted?: boolean;
  deleted_only?: boolean;
}

export interface AdminPasswordResetResponse {
  message: string;
  reset_link?: string | null;
}

export interface AdminUserDeleteResponse {
  message: string;
  projects_deleted: number;
  voices_deleted: number;
}
