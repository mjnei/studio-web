import { request } from "@/lib/api-client";

export interface CreditStatus {
  user_id: string;
  membership_tier: "free" | "pro" | "premium";
  monthly_allocation: number;
  bonus_credits: number;
  credits_used: number;
  credits_remaining: number;
  max_rollover: number | null;
  cycle_start_date: string;
  cycle_end_date: string;
  last_reset_date: string | null;
}

export interface CreditTransaction {
  id: number;
  user_id: string;
  transaction_type: "allocation" | "usage" | "refund" | "bonus" | "rollover" | "adjustment";
  amount: number;
  balance_after: number;
  description: string | null;
  video_job_id: string | null;
  created_at: string;
}

export interface CreditHistoryResponse {
  transactions: CreditTransaction[];
  total: number;
  page: number;
  page_size: number;
}

export interface VideoGenerationResponse {
  id: string;
  project_id: string;
  user_id: string;
  status: "idle" | "queued" | "processing" | "completed" | "failed";
  progress: number;
  video_url: string | null;
  thumbnail_url: string | null;
  credit_cost: number;
  generation_attempt: number;
  is_published: boolean;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  script_id: string | null;
  voice_id: string | null;
  voice_name: string | null;
  thumbnail_id: number | null;
  tts_job_id: string | null;
}

export interface ProjectVideosResponse {
  videos: VideoGenerationResponse[];
  total: number;
}

export async function getCreditStatus(): Promise<CreditStatus> {
  return request<CreditStatus>("/users/me/credits");
}

export async function getCreditHistory(page = 1, pageSize = 20): Promise<CreditHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return request<CreditHistoryResponse>(`/users/me/credits/history?${params.toString()}`);
}

export async function getProjectVideos(projectId: string): Promise<ProjectVideosResponse> {
  return request<ProjectVideosResponse>(`/projects/${projectId}/videos`);
}

export async function regenerateVideo(projectId: string): Promise<VideoGenerationResponse> {
  return request<VideoGenerationResponse>(`/projects/${projectId}/regenerate-video`, {
    method: "POST",
  });
}

export async function deleteProjectVideo(projectId: string, videoId: string): Promise<void> {
  await request<void>(`/projects/${projectId}/videos/${videoId}`, {
    method: "DELETE",
  });
}
