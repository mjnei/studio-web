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
