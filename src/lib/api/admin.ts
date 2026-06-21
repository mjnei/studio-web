import { request } from "@/lib/api-client";
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
  // Pass is_available=false to bypass the availability filter in the backend
  const response = await request<{ voices: VoiceResponse[]; total: number }>(
    "/voices/search?is_available=false"
  );
  return response.voices;
}

export async function adminCreateVoice(data: VoiceCreateRequest): Promise<VoiceResponse> {
  return request<VoiceResponse>("/admin/voices", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
