import { request, getAccessToken } from "@/lib/api-client";
import type {
  MovieCreateRequest,
  MovieUpdateRequest,
  MovieResponse,
  VoiceCreateRequest,
  VoiceUpdateRequest,
  VoiceResponse,
  VoiceAvailabilityUpdate,
  BulkImportRequest,
  BulkImportResponse,
} from "@/lib/types/api";

// ============================================================================
// Admin Movie Management
// ============================================================================

export async function adminGetMovies(): Promise<MovieResponse[]> {
  // Fetch all movies by paginating through the results (max page_size is 100)
  const allMovies: MovieResponse[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await request<{ movies: MovieResponse[]; total: number }>(
      `/movies/search?page=${page}&page_size=100`
    );
    allMovies.push(...response.movies);
    
    // Check if there are more pages
    hasMore = allMovies.length < response.total;
    page++;
  }
  
  return allMovies;
}

export async function adminCreateMovie(data: MovieCreateRequest): Promise<MovieResponse> {
  return request<MovieResponse>("/admin/movies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateMovie(
  movieId: number,
  data: MovieUpdateRequest
): Promise<MovieResponse> {
  return request<MovieResponse>(`/admin/movies/${movieId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteMovie(movieId: number): Promise<void> {
  return request<void>(`/admin/movies/${movieId}`, {
    method: "DELETE",
  });
}

export async function adminBulkImportMovies(
  data: BulkImportRequest<MovieCreateRequest>
): Promise<BulkImportResponse> {
  return request<BulkImportResponse>("/admin/movies/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Admin Voice Management
// ============================================================================

export async function adminGetVoices(): Promise<VoiceResponse[]> {
  // Get ALL voices (both available and unavailable) for admin view
  // Use dedicated admin endpoint that returns all voices
  return request<VoiceResponse[]>("/admin/voices");
}

export async function adminCreateVoice(formData: FormData): Promise<VoiceResponse> {
  // Get the access token from the in-memory store
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";
  const response = await fetch(`${apiBase}/admin/voices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to create voice" }));
    throw new Error(error.detail || "Failed to create voice");
  }

  return response.json();
}

export async function adminUpdateVoice(
  voiceId: string,
  data: VoiceUpdateRequest
): Promise<VoiceResponse> {
  return request<VoiceResponse>(`/admin/voices/${voiceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminToggleVoiceAvailability(
  voiceId: string,
  data: VoiceAvailabilityUpdate
): Promise<VoiceResponse> {
  return request<VoiceResponse>(`/admin/voices/${voiceId}/availability`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteVoice(voiceId: string): Promise<void> {
  return request<void>(`/admin/voices/${voiceId}`, {
    method: "DELETE",
  });
}

export async function adminBulkImportVoices(
  data: BulkImportRequest<VoiceCreateRequest>
): Promise<BulkImportResponse> {
  return request<BulkImportResponse>("/admin/voices/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Admin Voice Recording Management
// ============================================================================

export async function adminGetVoiceRecordings(): Promise<any[]> {
  // Get all voice recordings from all users
  return request<any[]>("/admin/voice-recordings");
}

export async function adminDeleteVoiceRecording(recordingId: string): Promise<void> {
  return request<void>(`/admin/voice-recordings/${recordingId}`, {
    method: "DELETE",
  });
}

/**
 * Get the audio stream URL for an admin voice recording.
 * Note: This returns a URL that requires authentication.
 * For playback, fetch the audio as a blob and create an object URL.
 */
export function getAdminRecordingAudioUrl(recordingId: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";
  return `${apiBase}/admin/voice-recordings/${recordingId}/audio`;
}
