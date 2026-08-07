/**
 * Referral API Client
 * 
 * Handles all referral-related API calls including:
 * - Code validation
 * - User referral stats and history
 * - Leaderboard
 * - Admin analytics
 */

import { request } from "@/lib/api-client";

// ============================================================================
// Types
// ============================================================================

export interface ValidateReferralCodeResponse {
  valid: boolean;
  referrer_name: string | null;
}

export interface ReferralCodeResponse {
  referral_code: string;
  invite_link: string;
  total_referrals: number;
  total_rewards_earned: number;
}

export interface ReferralHistoryItem {
  id: number;
  referee_id: number;
  referee_name: string;
  referee_email: string;
  referral_level: number;
  rewards_earned: number;
  downstream_referral_count: number;
  created_at: string;
}

export interface ReferralHistoryResponse {
  referrals: ReferralHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface Achievement {
  type: string;
  name: string;
  description: string;
  icon_url: string | null;
  earned_at: string;
}

export interface ReferralStatsResponse {
  total_direct_referrals: number;
  total_all_levels_referrals: number;
  total_invite_rewards_earned: number;
  referrals_by_level: Record<string, number>;
  achievements: Achievement[];
}

export interface LeaderboardEntry {
  rank: number;
  user_name: string;
  avatar_url: string | null;
  total_direct_referrals: number;
  total_all_levels_referrals: number;
  total_invite_rewards_earned: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
  limit: number;
  offset: number;
  cache_updated_at: string | null;
}

export interface AdminAnalyticsResponse {
  total_active_referrers: number;
  total_referral_relationships: number;
  total_invite_rewards_distributed: number;
  average_referrals_per_user: number;
  fraud_alerts_count: number;
  referrals_by_level: Record<string, number>;
  date_range: {
    start: string | null;
    end: string | null;
  };
}

export interface ReferralConfigResponse {
  parameters: Record<string, number>;
}

// ============================================================================
// Public Endpoints (No Auth Required)
// ============================================================================

/**
 * Validate a referral code
 * Rate limited to 100 requests per minute per IP
 */
export async function validateReferralCode(
  code: string
): Promise<ValidateReferralCodeResponse> {
  return request<ValidateReferralCodeResponse>(`/referrals/validate/${code.toUpperCase()}`);
}

/**
 * Get public referral leaderboard (cached, 1 hour TTL)
 */
export async function getLeaderboard(
  limit: number = 100,
  offset: number = 0
): Promise<LeaderboardResponse> {
  return request<LeaderboardResponse>(
    `/referrals/leaderboard?limit=${limit}&offset=${offset}`
  );
}

// ============================================================================
// User Endpoints (Auth Required)
// ============================================================================

/**
 * Get current user's referral code and invite link
 */
export async function getMyReferralCode(): Promise<ReferralCodeResponse> {
  return request<ReferralCodeResponse>("/referrals/code");
}

/**
 * Get current user's referral history with pagination and sorting
 */
export async function getMyReferralHistory(params: {
  limit?: number;
  offset?: number;
  sort_by?: "date" | "level" | "rewards";
  order?: "asc" | "desc";
}): Promise<ReferralHistoryResponse> {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.offset) queryParams.append("offset", params.offset.toString());
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.order) queryParams.append("order", params.order);

  const query = queryParams.toString();
  return request<ReferralHistoryResponse>(`/referrals/history${query ? `?${query}` : ""}`);
}

/**
 * Get current user's referral statistics and achievements
 */
export async function getMyReferralStats(): Promise<ReferralStatsResponse> {
  return request<ReferralStatsResponse>("/referrals/stats");
}

// ============================================================================
// Admin Endpoints (Admin Role Required)
// ============================================================================

/**
 * Get referral program analytics (admin only)
 */
export async function getAdminAnalytics(params: {
  start_date?: string;
  end_date?: string;
}): Promise<AdminAnalyticsResponse> {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);

  const query = queryParams.toString();
  return request<AdminAnalyticsResponse>(
    `/admin/referrals/analytics${query ? `?${query}` : ""}`
  );
}

/**
 * Flag a referral for fraud review (admin only)
 */
export async function flagReferral(referralId: number, reason: string): Promise<void> {
  await request<void>(`/admin/referrals/flag/${referralId}`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

/**
 * Approve a flagged referral (admin only)
 */
export async function approveReferral(referralId: number): Promise<void> {
  await request<void>(`/admin/referrals/approve/${referralId}`, {
    method: "POST",
  });
}

/**
 * Get referral program configuration (admin only)
 */
export async function getAdminConfig(): Promise<ReferralConfigResponse> {
  return request<ReferralConfigResponse>("/admin/referrals/config");
}

/**
 * Update referral program configuration (admin only)
 */
export async function updateAdminConfig(
  parameter_name: string,
  parameter_value: number
): Promise<ReferralConfigResponse> {
  return request<ReferralConfigResponse>("/admin/referrals/config", {
    method: "PATCH",
    body: JSON.stringify({ parameter_name, parameter_value }),
  });
}
