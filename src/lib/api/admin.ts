import { request, getAccessToken } from "@/lib/api-client";
import type {
  MovieResponse,
  VoiceCreateRequest,
  VoiceUpdateRequest,
  VoiceResponse,
  VoiceAvailabilityUpdate,
  BulkImportRequest,
  BulkImportResponse,
} from "@/lib/types/api";

// ============================================================================
// Admin Movie Management (Unified TMDB + CRUD)
// ============================================================================

export interface TMDBMovieSearchResult {
  id: number;
  title: string;
  original_title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
}

export interface TMDBSearchResponse {
  page: number;
  total_results: number;
  total_pages: number;
  results: TMDBMovieSearchResult[];
}

export interface TMDBImportRequest {
  movie_id: number;
  locales?: string[];
}

export interface TMDBImportResponse {
  success: boolean;
  movie_id: number;
  title: string;
  message: string;
  is_new: boolean;
}

export interface AdminMovieResponse {
  id: number;
  original_title: string;
  original_language?: string;
  release_date?: string;
  runtime?: number;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string;
  backdrop_path?: string;
  imdb_id?: string;
  douban_id?: string;
  title?: string;
  overview?: string;
  tagline?: string;
}

export interface AdminMovieListResponse {
  movies: AdminMovieResponse[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Search for movies on TMDB by title.
 */
export async function searchTMDBMovies(
  query: string,
  page: number = 1
): Promise<TMDBSearchResponse> {
  return request<TMDBSearchResponse>(
    `/admin/movies/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`
  );
}

/**
 * Import a complete movie from TMDB into the local database.
 */
export async function importTMDBMovie(data: TMDBImportRequest): Promise<TMDBImportResponse> {
  return request<TMDBImportResponse>("/admin/movies/tmdb/import", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get detailed information about a movie from TMDB (preview without importing).
 */
export async function getTMDBMoviePreview(movieId: number): Promise<any> {
  return request<any>(`/admin/movies/tmdb/preview/${movieId}`);
}

/**
 * List all movies in the database with optional search and pagination.
 */
export async function adminListMovies(params?: {
  query?: string;
  locale?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
}): Promise<AdminMovieListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.append("query", params.query);
  if (params?.locale) queryParams.append("locale", params.locale);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
  if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

  const queryString = queryParams.toString();
  return request<AdminMovieListResponse>(`/admin/movies${queryString ? `?${queryString}` : ""}`);
}

export async function adminGetMovies(): Promise<MovieResponse[]> {
  // Fetch all movies by paginating through the results (max page_size is 100)
  const allMovies: AdminMovieResponse[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await adminListMovies({ page, page_size: 100 });
    allMovies.push(...response.movies);

    // Check if there are more pages
    hasMore = allMovies.length < response.total;
    page++;
  }

  // Convert to MovieResponse format for backward compatibility
  return allMovies.map((m) => ({
    id: m.id.toString(),
    tmdb_id: m.id,
    title: m.title || m.original_title,
    original_title: m.original_title,
    overview: m.overview || null,
    poster_path: m.poster_path || null,
    backdrop_path: m.backdrop_path || null,
    release_date: m.release_date || null,
    rating: m.vote_average || 0,
    genre_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Get a single movie by ID.
 */
export async function adminGetMovie(
  movieId: number,
  locale: string = "en"
): Promise<AdminMovieResponse> {
  return request<AdminMovieResponse>(`/admin/movies/${movieId}?locale=${locale}`);
}

export interface GenreResponse {
  id: number;
  name: string;
}

export interface PersonResponse {
  id: number;
  canonical_name: string;
  display_name: string;
  gender: number | null;
  profile_path: string | null;
  popularity: number | null;
}

export interface CastResponse {
  id: number;
  person: PersonResponse;
  role: "actor" | "actress" | "director" | "producer" | "writer";
  character: string | null;
  credit_order: number | null;
}

export interface MovieDetailsResponse extends AdminMovieResponse {
  genres: GenreResponse[];
  cast: CastResponse[];
}

/**
 * Get detailed movie information including genres and cast.
 */
export async function adminGetMovieDetails(
  movieId: number,
  locale: string = "en"
): Promise<MovieDetailsResponse> {
  return request<MovieDetailsResponse>(`/admin/movies/${movieId}/details?locale=${locale}`);
}

/**
 * Update limited movie fields (mainly for Douban ID linkage).
 */
export async function adminUpdateMovie(
  movieId: number,
  data: { douban_id?: string; popularity?: number; vote_average?: number; vote_count?: number },
  locale: string = "en"
): Promise<AdminMovieResponse> {
  return request<AdminMovieResponse>(`/admin/movies/${movieId}?locale=${locale}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a movie from the database (cascade deletes all related data).
 */
export async function adminDeleteMovie(movieId: number): Promise<void> {
  return request<void>(`/admin/movies/${movieId}`, {
    method: "DELETE",
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
// Admin Voice Recording Management (User Voices)
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
 * Get the presigned audio URL for an admin voice recording.
 * Returns JSON with audio_url, expires_in, and mime_type.
 */
export async function getAdminRecordingAudioUrl(recordingId: string): Promise<{
  audio_url: string;
  expires_in: number | null;
  mime_type: string;
}> {
  return request<{
    audio_url: string;
    expires_in: number | null;
    mime_type: string;
  }>(`/admin/voice-recordings/${recordingId}/audio`);
}

/**
 * Get the presigned audio URL for a stock voice preview.
 * Returns JSON with audio_url and expires_in.
 */
export async function getAdminVoiceAudioUrl(voiceId: string): Promise<{
  audio_url: string;
  expires_in: number | null;
}> {
  return request<{
    audio_url: string;
    expires_in: number | null;
  }>(`/admin/voices/${voiceId}/audio`);
}

// ============================================================================
// Admin Voice Approval (Community Sharing)
// ============================================================================

import type { VoiceWithCreator } from "@/lib/types/api";

/**
 * Get voices shared by users awaiting admin approval.
 */
export async function adminGetPendingVoices(): Promise<VoiceWithCreator[]> {
  return request<VoiceWithCreator[]>("/voices/admin/pending");
}

/**
 * Get voices already approved by admin for public catalog.
 */
export async function adminGetApprovedVoices(): Promise<VoiceWithCreator[]> {
  return request<VoiceWithCreator[]>("/voices/admin/approved");
}

/**
 * Approve a shared voice for public catalog.
 */
export async function adminApproveVoice(voiceId: number): Promise<VoiceResponse> {
  return request<VoiceResponse>(`/voices/admin/${voiceId}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ is_approved: true }),
  });
}

/**
 * Get all shared voices (both pending and approved).
 */
export async function adminGetAllSharedVoices(): Promise<VoiceWithCreator[]> {
  return request<VoiceWithCreator[]>("/voices/admin/all-shared");
}

/**
 * Unapprove a voice (revoke public access).
 */
export async function adminUnapproveVoice(voiceId: number): Promise<VoiceResponse> {
  return request<VoiceResponse>(`/voices/admin/${voiceId}/unapprove`, {
    method: "PATCH",
    body: JSON.stringify({ is_approved: false }),
  });
}
