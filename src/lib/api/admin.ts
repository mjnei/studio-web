import { request, getAccessToken } from "@/lib/api-client";
import type { MovieResponse } from "@/lib/types/api";

// ============================================================================
// Admin TMDB Movies (Unified TMDB + CRUD)
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
export async function getTMDBMoviePreview(movieId: number): Promise<TMDBMovieSearchResult> {
  return request<TMDBMovieSearchResult>(`/admin/movies/tmdb/preview/${movieId}`);
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
// Admin Voice Recording Management (User Voices)
// Note: All voices are user-owned. No catalog/stock voices.
// Voice approval/unapproval endpoints are in the "Admin Voice Approval" section below.
// ============================================================================

export async function adminGetVoiceRecordings(): Promise<Record<string, unknown>[]> {
  // Get all voice recordings from all users
  return request<Record<string, unknown>[]>("/admin/voice-recordings");
}

export async function adminDeleteVoiceRecording(recordingId: string): Promise<void> {
  return request<void>(`/admin/voice-recordings/${recordingId}`, {
    method: "DELETE",
  });
}

/**
 * Get the presigned audio URL for a user voice recording (admin access).
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

type AdminVoiceWithOptionalAudio = {
  audio_url?: string;
  audio_expires_in?: number | null;
};

/**
 * Fetch presigned audio URLs for admin voice lists in parallel.
 * Must be called before user-initiated playback so the browser keeps the click gesture.
 */
export async function attachAdminVoiceAudioUrls<T extends { id: number }>(
  voices: T[]
): Promise<(T & AdminVoiceWithOptionalAudio)[]> {
  return Promise.all(
    voices.map(async (voice) => {
      try {
        const audioUrlData = await getAdminRecordingAudioUrl(String(voice.id));
        return {
          ...voice,
          audio_url: audioUrlData.audio_url,
          audio_expires_in: audioUrlData.expires_in,
        };
      } catch (err) {
        console.error(`Failed to fetch admin audio URL for voice ${voice.id}:`, err);
        return voice;
      }
    })
  );
}

// ============================================================================
// Admin Voice Bulk Import
// All imported voices must be assigned to a specific user.
// ============================================================================

import type { VoiceBulkImportRequest, VoiceBulkImportResponse } from "@/lib/types/api";

/**
 * Bulk import voices and assign them to a specific user.
 * Useful for importing pre-recorded voice samples or migrating voices.
 */
export async function adminBulkImportVoices(
  data: VoiceBulkImportRequest
): Promise<VoiceBulkImportResponse> {
  return request<VoiceBulkImportResponse>("/admin/voices/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Bulk upload voice files for a specific user.
 * Accepts multiple audio files and uploads them for the target user.
 * All voices default to English language.
 */
export async function adminBulkUploadVoices(
  targetUserId: number,
  files: File[]
): Promise<VoiceBulkImportResponse> {
  const formData = new FormData();
  formData.append("target_user_id", targetUserId.toString());

  files.forEach((file) => {
    formData.append("files", file);
  });

  const token = getAccessToken();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

  const response = await fetch(`${API_BASE}/admin/voices/bulk-upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to bulk upload voices");
  }

  return response.json();
}

// ============================================================================
// Admin Voice Approval (Community Sharing)
// All voices are user-owned. Admins can only approve/unapprove for public catalog.
// ============================================================================

import type { VoiceWithCreator, VoiceResponse } from "@/lib/types/api";

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
 * Get ALL voices from all users (shared and non-shared, regardless of approval status).
 */
export async function adminGetAllVoices(): Promise<VoiceWithCreator[]> {
  return request<VoiceWithCreator[]>("/voices/admin/all");
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

// ============================================================================
// Admin User Search
// ============================================================================

export interface UserSearchResult {
  id: number;
  email: string;
  name: string;
  picture_url: string | null;
  created_at: string | null;
}

/**
 * Search users by name or email (admin only).
 */
export async function adminSearchUsers(
  query: string = "",
  limit: number = 20
): Promise<UserSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (limit) params.append("limit", limit.toString());

  return request<UserSearchResult[]>(`/users/admin/search?${params.toString()}`);
}

// ============================================================================
// Admin Dashboard Statistics
// ============================================================================

export interface AdminStatsResponse {
  total_movies: number;
  active_voices: number;
  total_users: number;
  projects_created: number;
}

/**
 * Get admin dashboard statistics.
 */
export async function getAdminStats(): Promise<AdminStatsResponse> {
  return request<AdminStatsResponse>("/admin/stats");
}
