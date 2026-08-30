import { request, getAccessToken } from "../api-client";
import {
  VoiceResponse,
  VoiceUpdateRequest,
  VoiceShareRequest,
  AvailableVoicesResponse,
} from "../types/api";

/**
 * Upload a new voice recording
 * POST /api/v1/voices/upload
 *
 * @param file - Audio file blob
 * @param name - Voice name (NOT title)
 * @param language - BCP-47 language code (e.g. en, zh-CN, zh-TW, ja, ko, de, fr, es)
 * @param durationSeconds - Optional duration in seconds
 * @returns Promise<VoiceResponse>
 */
export async function uploadVoice(
  file: Blob,
  name: string,
  language: string,
  durationSeconds?: number
): Promise<VoiceResponse> {
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

  // Sanitize filename for filesystem safety: lowercase, replace non-alphanumeric with dash,
  // remove leading/trailing dashes
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `${sanitizedName || "voice"}${ext}`;

  // Create a new File object with the correct MIME type
  const audioFile = new File([file], filename, { type: mimeType });

  formData.append("file", audioFile);
  formData.append("name", name);
  formData.append("language", language);
  if (durationSeconds !== undefined) {
    formData.append("duration_seconds", durationSeconds.toString());
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";
  const token = getAccessToken();

  const response = await fetch(`${API_BASE}/voices/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to upload voice");
  }

  return response.json();
}

/**
 * List voices belonging to the current user
 * GET /api/v1/voices/?skip={skip}&limit={limit}
 *
 * @param skip - Number of voices to skip (default: 0)
 * @param limit - Max voices to return (default: 100)
 * @returns Promise<VoiceResponse[]>
 */
export async function listVoices(skip = 0, limit = 100): Promise<VoiceResponse[]> {
  return request<VoiceResponse[]>(`/voices/?skip=${skip}&limit=${limit}`);
}

/**
 * Get a single voice by ID
 * GET /api/v1/voices/{id}
 *
 * @param id - Voice ID
 * @returns Promise<VoiceResponse>
 */
export async function getVoice(id: number): Promise<VoiceResponse> {
  return request<VoiceResponse>(`/voices/${id}`);
}

/**
 * Update voice metadata
 * PATCH /api/v1/voices/{id}
 *
 * @param id - Voice ID
 * @param data - Update data (name, language)
 * @returns Promise<VoiceResponse>
 */
export async function updateVoice(id: number, data: VoiceUpdateRequest): Promise<VoiceResponse> {
  return request<VoiceResponse>(`/voices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a voice (soft delete)
 * DELETE /api/v1/voices/{id}
 *
 * @param id - Voice ID
 * @returns Promise<void>
 */
export async function deleteVoice(id: number): Promise<void> {
  return request<void>(`/voices/${id}`, {
    method: "DELETE",
  });
}

/**
 * Get the audio URL for a voice
 * GET /api/v1/voices/{id}/audio-url
 *
 * For S3 storage: Returns a presigned URL for direct access.
 * For local storage: Returns the backend streaming endpoint URL.
 *
 * @param id - Voice ID
 * @returns Promise with audio_url, expires_in, and storage_type
 */
export async function getVoiceAudioUrl(id: number): Promise<{
  audio_url: string;
  expires_in: number | null;
  storage_type: "s3" | "local";
}> {
  return request<{
    audio_url: string;
    expires_in: number | null;
    storage_type: "s3" | "local";
  }>(`/voices/${id}/audio-url`);
}

type VoiceWithOptionalAudio = {
  audio_url?: string;
  audio_storage_type?: "s3" | "local";
  audio_expires_in?: number | null;
};

export type { VoiceWithOptionalAudio };

/**
 * Fetch presigned audio URLs for a list of voices in parallel.
 * Must be called before user-initiated playback so the browser keeps the click gesture.
 * Individual failures are logged but do not fail the whole batch.
 */
export async function attachVoiceAudioUrls<T extends { id: number }>(
  voices: T[]
): Promise<(T & VoiceWithOptionalAudio)[]> {
  return Promise.all(
    voices.map(async (voice) => {
      try {
        const audioUrlData = await getVoiceAudioUrl(voice.id);
        return {
          ...voice,
          audio_url: audioUrlData.audio_url,
          audio_storage_type: audioUrlData.storage_type,
          audio_expires_in: audioUrlData.expires_in,
        };
      } catch (err) {
        console.error(`Failed to fetch audio URL for voice ${voice.id}:`, err);
        return voice;
      }
    })
  );
}

/**
 * Toggle voice sharing status
 * PATCH /api/v1/voices/{id}/share
 *
 * When is_shared is true, voice becomes available for admin approval.
 *
 * @param id - Voice ID
 * @param isShared - Sharing status
 * @returns Promise<VoiceResponse>
 */
export async function toggleVoiceSharing(id: number, isShared: boolean): Promise<VoiceResponse> {
  const data: VoiceShareRequest = { is_shared: isShared };
  return request<VoiceResponse>(`/voices/${id}/share`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Get all available voices for the user
 * GET /api/v1/voices/available
 *
 * Returns own voices + approved community voices.
 * Used for voice selection in project creation/editing.
 *
 * @returns Promise<AvailableVoicesResponse>
 */
export async function getAvailableVoices(): Promise<AvailableVoicesResponse> {
  return request<AvailableVoicesResponse>("/voices/available");
}
