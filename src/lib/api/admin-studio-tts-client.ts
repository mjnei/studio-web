import { request } from "@/lib/api-client";
import type {
  StaleJob,
  FailedJob,
  CompletedJob,
  TTSJobStats,
  TTSJob,
} from "@/types/admin";

/**
 * Admin Studio TTS Jobs Client
 * Provides functions for monitoring and managing studio TTS job health.
 */

/**
 * Get stale TTS jobs (queued or processing for too long).
 * Default threshold: 5 minutes.
 */
export async function getStaleTTSJobs(limit: number = 100): Promise<StaleJob[]> {
  return request<StaleJob[]>(`/admin/studio-tts-jobs/stale?limit=${limit}`);
}

/**
 * Get failed TTS jobs with pagination.
 */
export async function getFailedTTSJobs(
  limit: number = 100,
  offset: number = 0
): Promise<FailedJob[]> {
  return request<FailedJob[]>(`/admin/studio-tts-jobs/failed?limit=${limit}&offset=${offset}`);
}

/**
 * Get completed TTS jobs with pagination.
 */
export async function getCompletedTTSJobs(
  limit: number = 100,
  offset: number = 0
): Promise<CompletedJob[]> {
  return request<CompletedJob[]>(`/admin/studio-tts-jobs/completed?limit=${limit}&offset=${offset}`);
}

/**
 * Get TTS job statistics (success rate, average duration, etc.).
 */
export async function getTTSJobStats(): Promise<TTSJobStats> {
  return request<TTSJobStats>("/admin/studio-tts-jobs/stats");
}

/**
 * Get detailed information about a specific TTS job.
 */
export async function getTTSJobDetails(jobId: number): Promise<TTSJob> {
  return request<TTSJob>(`/admin/studio-tts-jobs/${jobId}`);
}

/**
 * Retry a failed TTS job (if backend supports it).
 * Note: This endpoint may not exist yet in backend.
 */
export async function retryTTSJob(jobId: number): Promise<TTSJob> {
  return request<TTSJob>(`/admin/studio-tts-jobs/${jobId}/retry`, {
    method: "POST",
  });
}

/**
 * Cancel a stale TTS job.
 * Note: This endpoint may not exist yet in backend.
 */
export async function cancelTTSJob(jobId: number): Promise<void> {
  return request<void>(`/admin/studio-tts-jobs/${jobId}/cancel`, {
    method: "POST",
  });
}
