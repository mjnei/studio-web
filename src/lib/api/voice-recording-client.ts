import { request } from "../api-client";
import { VoiceRecordingResponse } from "../types/api";

export async function uploadVoiceRecording(
  file: Blob,
  title: string,
  description?: string,
  durationSeconds?: number
): Promise<VoiceRecordingResponse> {
  const formData = new FormData();
  formData.append("file", file, "recording.webm");
  formData.append("title", title);
  if (description) {
    formData.append("description", description);
  }
  if (durationSeconds !== undefined) {
    formData.append("duration_seconds", durationSeconds.toString());
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const token = (await import("../api-client")).getAccessToken();

  const response = await fetch(`${API_BASE}/recordings/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to upload voice recording");
  }

  return response.json();
}

export async function listVoiceRecordings(
  skip = 0,
  limit = 100
): Promise<VoiceRecordingResponse[]> {
  return request<VoiceRecordingResponse[]>(
    `/recordings/?skip=${skip}&limit=${limit}`
  );
}

export async function getVoiceRecording(id: string): Promise<VoiceRecordingResponse> {
  return request<VoiceRecordingResponse>(`/recordings/${id}`);
}

export async function updateVoiceRecording(
  id: string,
  data: { title?: string; description?: string }
): Promise<VoiceRecordingResponse> {
  return request<VoiceRecordingResponse>(`/recordings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteVoiceRecording(id: string): Promise<void> {
  return request<void>(`/recordings/${id}`, {
    method: "DELETE",
  });
}
