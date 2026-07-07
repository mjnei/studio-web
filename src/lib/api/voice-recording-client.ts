import { request } from "../api-client";
import { VoiceRecordingResponse } from "../types/api";

export async function uploadVoiceRecording(
  file: Blob,
  title: string,
  description?: string,
  durationSeconds?: number
): Promise<VoiceRecordingResponse> {
  const formData = new FormData();

  // Determine the file extension based on MIME type
  const mimeType = file.type || "audio/webm";
  const extMap: Record<string, string> = {
    "audio/webm": ".webm",
    "audio/webm;codecs=opus": ".webm",
    "audio/ogg": ".ogg",
    "audio/ogg;codecs=opus": ".ogg",
    "audio/wav": ".wav",
    "audio/mp3": ".mp3",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".mp4",
    "audio/x-m4a": ".m4a",
  };

  const ext = extMap[mimeType] || extMap[mimeType.split(";")[0]] || ".webm";
  // Use the voice title as filename, sanitized for filesystem safety
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `${sanitizedTitle || "recording"}${ext}`;

  // Create a new File object with the correct MIME type
  const audioFile = new File([file], filename, { type: mimeType });

  formData.append("file", audioFile);
  formData.append("title", title);
  if (description) {
    formData.append("description", description);
  }
  if (durationSeconds !== undefined) {
    formData.append("duration_seconds", durationSeconds.toString());
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";
  const token = (await import("../api-client")).getAccessToken();

  const response = await fetch(`${API_BASE}/voice-recordings/upload`, {
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
  return request<VoiceRecordingResponse[]>(`/voice-recordings/?skip=${skip}&limit=${limit}`);
}

export async function getVoiceRecording(id: string): Promise<VoiceRecordingResponse> {
  return request<VoiceRecordingResponse>(`/voice-recordings/${id}`);
}

export async function updateVoiceRecording(
  id: string,
  data: { title?: string; description?: string }
): Promise<VoiceRecordingResponse> {
  return request<VoiceRecordingResponse>(`/voice-recordings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteVoiceRecording(id: string): Promise<void> {
  return request<void>(`/voice-recordings/${id}`, {
    method: "DELETE",
  });
}

/**
 * Get the audio URL for a voice recording.
 * For S3 storage: Returns a presigned URL for direct access.
 * For local storage: Returns the backend streaming endpoint URL.
 */
export async function getVoiceRecordingAudioUrl(id: number): Promise<{
  audio_url: string;
  expires_in: number | null;
  storage_type: "s3" | "local";
}> {
  return request<{
    audio_url: string;
    expires_in: number | null;
    storage_type: "s3" | "local";
  }>(`/voice-recordings/${id}/audio-url`);
}

/**
 * Toggle voice sharing status (user-controlled).
 * When is_shared is true, voice becomes available for admin approval.
 */
export async function toggleVoiceSharing(
  id: number,
  isShared: boolean
): Promise<VoiceRecordingResponse> {
  return request<VoiceRecordingResponse>(`/voice-recordings/${id}/share`, {
    method: "PATCH",
    body: JSON.stringify({ is_shared: isShared }),
  });
}

/**
 * Get all available voices for the user (own voices + approved community voices).
 * Separates voices into own_voices and community_voices lists.
 * Used for voice selection in project creation/editing.
 */
export async function getAvailableVoices(): Promise<{
  own_voices: VoiceRecordingResponse[];
  community_voices: Array<VoiceRecordingResponse & { creator_username: string }>;
}> {
  const { AvailableVoicesResponse } = await import("../types/api");
  return request<{
    own_voices: VoiceRecordingResponse[];
    community_voices: Array<VoiceRecordingResponse & { creator_username: string }>;
  }>("/voices/available");
}
