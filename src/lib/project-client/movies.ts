import { request } from "@/lib/api-client";
import type { MovieListResponse, MovieResponse } from "./types";

export async function searchMovies(query: string, pageSize = 20): Promise<MovieListResponse> {
  const params = new URLSearchParams({
    page_size: String(pageSize),
    sort_by: query.trim() ? "title" : "popularity",
  });
  if (query.trim()) params.set("query", query.trim());
  return request<MovieListResponse>(`/movies/search?${params.toString()}`);
}

export async function getPopularMovies(limit = 20): Promise<MovieResponse[]> {
  return request<MovieResponse[]>(`/movies/popular?limit=${limit}`);
}

/**
 * Get a single movie by TMDB ID (authenticated users; not admin-only).
 */
export async function getMovie(movieId: number, locale: string = "en"): Promise<MovieResponse> {
  return request<MovieResponse>(`/movies/${movieId}?locale=${encodeURIComponent(locale)}`);
}

export function tmdbImageUrl(path?: string | null, size = "w500"): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
