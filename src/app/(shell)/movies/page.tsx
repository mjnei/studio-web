"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Search, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getPopularMovies,
  searchMovies,
  tmdbImageUrl,
  type MovieResponse,
} from "@/lib/project-client";

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = searchQuery.trim();
        const data = query ? (await searchMovies(query, 30)).movies : await getPopularMovies(30);
        if (!controller.signal.aborted) setMovies(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load movies");
          setMovies([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const timeout = window.setTimeout(loadMovies, searchQuery.trim() ? 250 : 0);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">Movie Library</h1>
          <p className="text-sm text-text-muted">Discover and explore movies to create projects</p>
        </div>
        <span className="rounded-full bg-accent-cyan-muted px-3 py-1 text-xs font-medium text-accent-cyan">
          {movies.length} movies
        </span>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-border-default bg-surface-panel">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-accent-cyan" />
            <p className="text-sm text-text-muted">Loading movies...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center text-status-failed">
          {error}
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center text-text-secondary">
          No movies found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group overflow-hidden rounded-xl border border-border-default bg-surface-panel transition hover:border-accent-cyan/40 hover:shadow-lg hover:shadow-accent-cyan/5"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-surface-raised">
                {movie.poster_path ? (
                  <img
                    src={tmdbImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                {movie.overview && (
                  <div className="absolute bottom-2 left-2 right-2 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="line-clamp-3 text-[11px] leading-relaxed text-gray-200">
                      {movie.overview}
                    </p>
                  </div>
                )}
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] font-semibold text-white">
                    {(movie.vote_average ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-text-primary group-hover:text-accent-cyan">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    {movie.release_date ? new Date(movie.release_date).getUTCFullYear() : "Unknown"}
                  </span>
                  {movie.runtime ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-text-muted" />
                      <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                        {movie.runtime} min
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
