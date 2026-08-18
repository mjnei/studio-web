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
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string;
  created_at: string;
  source?: "postgres" | "axiom"; // Track data source
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
