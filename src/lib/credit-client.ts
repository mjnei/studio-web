"use client";

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

export interface CreditBalance {
  user_id: number;
  credits_remaining: number;
}

/** Video generation credits — monthly allocation, consumption, refunds, etc. */
export const VIDEO_CREDIT_TRANSACTION_TYPES = [
  "allocation",
  "bonus",
  "consumption",
  "refund",
  "rollover",
  "adjustment",
] as const;

/** Referral program rewards — welcome bonus and invite earnings (separate balance). */
export const REFERRAL_REWARD_TRANSACTION_TYPES = ["welcome_bonus", "invite_reward_earned"] as const;

export type VideoCreditTransactionType = (typeof VIDEO_CREDIT_TRANSACTION_TYPES)[number];
export type ReferralRewardTransactionType = (typeof REFERRAL_REWARD_TRANSACTION_TYPES)[number];

export interface CreditTransaction {
  id: number;
  transaction_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  reason: string | null;
  video_job_id: number | null;
  project_id: number | null;
  created_at: string;
}

export interface CreditHistoryResponse {
  user_id: number;
  total_count: number;
  transactions: CreditTransaction[];
  limit: number;
  offset: number;
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

export async function getCreditBalance(): Promise<CreditBalance> {
  return request<CreditBalance>("/users/me/credits/balance");
}

export async function getCreditStatus(): Promise<CreditStatus> {
  return request<CreditStatus>("/users/me/credits");
}

export async function getCreditHistory(
  limit = 50,
  offset = 0,
  transactionType?: string
): Promise<CreditHistoryResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (transactionType) {
    params.set("transaction_type", transactionType);
  }
  return request<CreditHistoryResponse>(`/users/me/credits/history?${params.toString()}`);
}

/** Video-only history; backend `/users/me/credits/history` reads `video_credit_transactions`. */
export async function getVideoCreditHistory(limit = 50, offset = 0): Promise<CreditTransaction[]> {
  const history = await getCreditHistory(limit, offset);
  return history.transactions;
}

export async function getReferralRewardHistory(
  limit = 50,
  offset = 0
): Promise<CreditTransaction[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await request<{
    transactions: CreditTransaction[];
  }>(`/referrals/rewards/history?${params.toString()}`);
  return response.transactions;
}

export async function getProjectVideos(projectId: string): Promise<ProjectVideosResponse> {
  const jobs = await request<VideoGenerationResponse[]>(`/video/project/${projectId}/list`);
  return {
    videos: jobs,
    total: jobs.length,
  };
}

/** List all video jobs for the current user (avoids N+1 per-project fetches). */
export async function getMyVideoJobs(): Promise<VideoGenerationResponse[]> {
  return request<VideoGenerationResponse[]>("/video/jobs");
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
