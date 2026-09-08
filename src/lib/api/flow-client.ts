import { request, getAccessToken } from "@/lib/api-client";
import type { FlowJobCreate, ClipUploadResponse, FlowJobResponse } from "@/types/flow";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

/**
 * Upload up to 10 video clips to S3.
 * Returns the S3 keys array to pass to createFlowJob.
 */
export async function uploadFlowClips(files: File[]): Promise<ClipUploadResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("clips", file);
  }

  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/flow/upload-clips`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    let errorDetail = "Failed to upload clips";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      const errorText = await response.text();
      if (errorText) errorDetail = errorText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Create a new Flow job (3-locale TTS + ffmpeg render).
 */
export async function createFlowJob(data: FlowJobCreate): Promise<FlowJobResponse> {
  return request<FlowJobResponse>("/flow", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Poll Flow job status and retrieve presigned media URLs.
 */
export async function getFlowJob(jobId: number): Promise<FlowJobResponse> {
  return request<FlowJobResponse>(`/flow/${jobId}`);
}

/**
 * Retry the ffmpeg render phase of a failed Flow job.
 */
export async function retryFlowRender(jobId: number): Promise<FlowJobResponse> {
  return request<FlowJobResponse>(`/flow/${jobId}/retry-render`, {
    method: "POST",
  });
}

/**
 * List recent Flow jobs for the current user.
 */
export async function listFlowJobs(limit: number = 20): Promise<FlowJobResponse[]> {
  return request<FlowJobResponse[]>(`/flow?limit=${limit}`);
}
