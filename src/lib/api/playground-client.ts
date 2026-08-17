import { request, getAccessToken } from "@/lib/api-client";
import type {
  PlaygroundTTSRequest,
  PlaygroundJob,
  PlaygroundVoice,
} from "@/types/admin";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

/**
 * Playground TTS Client
 * Allows admins to test TTS functionality without creating a full project.
 */

/**
 * Create a new playground TTS job.
 */
export async function createPlaygroundTTSJob(
  data: PlaygroundTTSRequest
): Promise<PlaygroundJob> {
  return request<PlaygroundJob>("/playground/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get the status and details of a playground TTS job.
 */
export async function getPlaygroundJob(jobId: string): Promise<PlaygroundJob> {
  return request<PlaygroundJob>(`/playground/${jobId}`);
}

/**
 * Stream playground job status updates via Server-Sent Events (SSE).
 * Returns a ReadableStream that can be consumed with the useSSE hook.
 */
export async function streamPlaygroundJobStatus(jobId: string): Promise<ReadableStream> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/playground/${jobId}/stream`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to stream job status: ${response.statusText}`);
  }

  return response.body!;
}

/**
 * Get the audio file for a completed playground TTS job.
 * Returns a Blob that can be used for audio playback or download.
 */
export async function getPlaygroundAudio(jobId: string): Promise<Blob> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/playground/${jobId}/audio`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Get voices recently used in playground (for quick re-selection).
 */
export async function getPlaygroundVoiceHistory(): Promise<PlaygroundVoice[]> {
  return request<PlaygroundVoice[]>("/playground/voices");
}

/**
 * Get playground job history (last N jobs).
 */
export async function getPlaygroundHistory(limit: number = 20): Promise<PlaygroundJob[]> {
  return request<PlaygroundJob[]>(`/playground/history?limit=${limit}`);
}

/**
 * Delete a playground job (if backend supports it).
 */
export async function deletePlaygroundJob(jobId: string): Promise<void> {
  return request<void>(`/playground/${jobId}`, {
    method: "DELETE",
  });
}

/**
 * Clear all playground history for the current user.
 */
export async function clearPlaygroundHistory(): Promise<void> {
  return request<void>("/playground/history", {
    method: "DELETE",
  });
}
