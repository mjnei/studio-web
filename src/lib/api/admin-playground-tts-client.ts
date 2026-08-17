import { request } from "@/lib/api-client";
import type {
  PlaygroundStaleJob,
  PlaygroundFailedJob,
  PlaygroundRateLimitedJob,
  PlaygroundCompletedJob,
  PlaygroundTTSJobStats,
  PlaygroundTTSJob,
} from "@/types/admin";

/**
 * Admin Playground TTS Jobs Client
 * Provides functions for monitoring and managing playground TTS job health.
 * Tracks anonymous user activity, rate limiting, abuse patterns, and resource usage.
 */

/**
 * Get stale playground TTS jobs (queued or processing for too long).
 * Default threshold: 6 hours for queued, 1 hour for processing.
 */
export async function getPlaygroundStaleTTSJobs(
  limit: number = 100
): Promise<{ queued_jobs: PlaygroundStaleJob[]; processing_jobs: PlaygroundStaleJob[] }> {
  return request<{ queued_jobs: PlaygroundStaleJob[]; processing_jobs: PlaygroundStaleJob[] }>(
    `/admin/playground-tts-jobs/stale?limit=${limit}`
  );
}

/**
 * Get failed playground TTS jobs with pagination.
 */
export async function getPlaygroundFailedTTSJobs(
  limit: number = 100,
  offset: number = 0
): Promise<PlaygroundFailedJob[]> {
  return request<PlaygroundFailedJob[]>(
    `/admin/playground-tts-jobs/failed?limit=${limit}&offset=${offset}`
  );
}

/**
 * Get rate-limited playground TTS jobs with pagination.
 * Useful for tracking abuse patterns.
 */
export async function getPlaygroundRateLimitedJobs(
  limit: number = 100,
  offset: number = 0
): Promise<PlaygroundRateLimitedJob[]> {
  return request<PlaygroundRateLimitedJob[]>(
    `/admin/playground-tts-jobs/rate-limited?limit=${limit}&offset=${offset}`
  );
}

/**
 * Get completed playground TTS jobs with pagination.
 */
export async function getPlaygroundCompletedTTSJobs(
  limit: number = 100,
  offset: number = 0
): Promise<PlaygroundCompletedJob[]> {
  return request<PlaygroundCompletedJob[]>(
    `/admin/playground-tts-jobs/completed?limit=${limit}&offset=${offset}`
  );
}

/**
 * Get playground TTS job statistics (success rate, average duration, unique IPs, etc.).
 */
export async function getPlaygroundTTSJobStats(): Promise<PlaygroundTTSJobStats> {
  return request<PlaygroundTTSJobStats>("/admin/playground-tts-jobs/stats");
}

/**
 * Get detailed information about a specific playground TTS job.
 */
export async function getPlaygroundTTSJobDetails(jobId: number): Promise<PlaygroundTTSJob> {
  return request<PlaygroundTTSJob>(`/admin/playground-tts-jobs/${jobId}`);
}

/**
 * Retry a failed playground TTS job.
 * Can retry jobs with status: failed, rate_limited, or completed.
 */
export async function retryPlaygroundTTSJob(jobId: number): Promise<PlaygroundTTSJob> {
  return request<PlaygroundTTSJob>(`/admin/playground-tts-jobs/${jobId}/retry`, {
    method: "POST",
  });
}

/**
 * Cancel a stale playground TTS job.
 * Sets job status to 'failed' with cancellation message.
 */
export async function cancelPlaygroundTTSJob(jobId: number): Promise<void> {
  return request<void>(`/admin/playground-tts-jobs/${jobId}/cancel`, {
    method: "POST",
  });
}
