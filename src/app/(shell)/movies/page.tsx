"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  Loader,
  Grid3x3,
  Grid2x2,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  User,
  Film,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getPopularMovies,
  searchMovies,
  tmdbImageUrl,
  type MovieResponse,
} from "@/lib/project-client";
import {
  adminGetMovieDetails,
  type MovieDetailsResponse,
  type CastResponse,
} from "@/lib/api/admin";

type LayoutMode = "grid-sm" | "grid-md" | "grid-lg" | "list";

interface EnrichedMovie extends MovieResponse {
  directors?: string[];
  topCast?: string[];
  genres?: string[];
}

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<EnrichedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-sm");
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadMovies = async () => {
      setLoading(true);
      setError(null);
      setEnrichmentProgress(0);
      try {
        const query = searchQuery.trim();
        const data = query ? (await searchMovies(query, 30)).movies : await getPopularMovies(30);

        if (controller.signal.aborted) return;

        // Set initial movies without enrichment
        setMovies(data);
        setLoading(false);

        // Enrich movies with cast/director info in the background
        const enrichedMovies: EnrichedMovie[] = [];
        for (let i = 0; i < data.length; i++) {
          if (controller.signal.aborted) break;

          try {
            const details = await adminGetMovieDetails(data[i].id);
            const directors = details.cast
              ?.filter((c) => c.role === "director")
              .map((c) => c.person.display_name)
              .slice(0, 2);

            const topCast = details.cast
              ?.filter((c) => c.role === "actor" || c.role === "actress")
              .sort((a, b) => (a.credit_order || 999) - (b.credit_order || 999))
              .map((c) => c.person.display_name)
              .slice(0, 3);

            const genres = details.genres?.map((g) => g.name).slice(0, 3);

            enrichedMovies.push({
              ...data[i],
              directors,
              topCast,
              genres,
            });

            setEnrichmentProgress(Math.round(((i + 1) / data.length) * 100));
            setMovies([...enrichedMovies, ...data.slice(i + 1)]);
          } catch (err) {
            // If enrichment fails, just use the basic movie data
            enrichedMovies.push(data[i]);
            setMovies([...enrichedMovies, ...data.slice(i + 1)]);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load movies");
          setMovies([]);
          setLoading(false);
        }
      }
    };

    const timeout = window.setTimeout(loadMovies, searchQuery.trim() ? 250 : 0);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  const getGridClass = () => {
    switch (layoutMode) {
      case "grid-sm":
        // Small cards: 2 cols (base), 3 cols (sm), 4 cols (md), 5 cols (lg), 6 cols (xl)
        return "grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "grid-md":
        // Medium cards: 1 col (base), 2 cols (sm), 3 cols (md), 4 cols (lg), 5 cols (xl)
        return "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case "grid-lg":
        // Large cards: 1 col (base), 2 cols (sm), 2 cols (md), 3 cols (lg), 4 cols (xl)
        return "grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case "list":
        return "space-y-3";
      default:
        return "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }
  };

  const LayoutToggle = () => (
    <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel p-1">
      <button
        onClick={() => setLayoutMode("grid-sm")}
        className={`rounded p-1.5 transition-all ${
          layoutMode === "grid-sm"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title="Small grid (up to 6 columns)"
      >
        <Grid3x3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => setLayoutMode("grid-md")}
        className={`rounded p-1.5 transition-all ${
          layoutMode === "grid-md"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title="Medium grid (4-6 columns)"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setLayoutMode("grid-lg")}
        className={`rounded p-1.5 transition-all ${
          layoutMode === "grid-lg"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title="Large grid (2-4 columns)"
      >
        <Grid2x2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => setLayoutMode("list")}
        className={`rounded p-1.5 transition-all ${
          layoutMode === "list"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-text-primary">Movie Library</h1>
          <p className="text-sm text-text-muted">
            Discover and explore movies to create your next project
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accent-cyan/10 px-3 py-1.5 text-xs font-medium text-accent-cyan">
            {movies.length} {movies.length === 1 ? "movie" : "movies"}
          </span>
          {enrichmentProgress > 0 && enrichmentProgress < 100 && (
            <span className="text-xs text-text-muted">
              Loading details... {enrichmentProgress}%
            </span>
          )}
        </div>
      </div>

      {/* Search and Layout Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="text"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <LayoutToggle />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-border-default bg-surface-panel">
          <div className="flex flex-col items-center gap-3">
            <Loader className="h-10 w-10 animate-spin text-accent-cyan" />
            <p className="text-sm font-medium text-text-primary">Loading movies...</p>
            <p className="text-xs text-text-muted">Please wait while we fetch the catalog</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-status-failed/30 bg-status-failed/5 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-failed/10">
            <Search className="h-6 w-6 text-status-failed" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-text-primary">Unable to load movies</h3>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-surface-panel p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised">
            <Film className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="mb-2 text-base font-semibold text-text-primary">No movies found</h3>
          <p className="text-sm text-text-muted">
            {searchQuery.trim()
              ? "Try adjusting your search terms"
              : "No movies available in the catalog"}
          </p>
        </div>
      ) : layoutMode === "list" ? (
        <div className="space-y-3">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group flex gap-4 overflow-hidden rounded-xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-cyan/50 hover:bg-surface-raised hover:shadow-lg hover:shadow-accent-cyan/5"
            >
              {/* Poster Thumbnail */}
              <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-raised shadow-md">
                {movie.poster_path ? (
                  <img
                    src={tmdbImageUrl(movie.poster_path, "w342")}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Film className="h-10 w-10 text-text-muted opacity-30" />
                  </div>
                )}
                {movie.vote_average && movie.vote_average > 0 && (
                  <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-1 backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-white">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Movie Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                {/* Top Section */}
                <div>
                  <h3 className="mb-1.5 text-base font-bold text-text-primary transition-colors group-hover:text-accent-cyan">
                    {movie.title}
                  </h3>

                  {/* Metadata Row */}
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                    {movie.release_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(movie.release_date).getUTCFullYear()}</span>
                      </div>
                    )}
                    {movie.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{movie.runtime} min</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-md bg-accent-cyan/10 px-2 py-0.5 text-xs font-medium text-accent-cyan"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  {movie.overview && (
                    <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {movie.overview}
                    </p>
                  )}
                </div>

                {/* Bottom Section - Cast & Crew */}
                <div className="space-y-1.5 text-xs">
                  {movie.directors && movie.directors.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-text-muted">Director:</span>
                      <span className="text-text-secondary">{movie.directors.join(", ")}</span>
                    </div>
                  )}
                  {movie.topCast && movie.topCast.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-text-muted">Cast:</span>
                      <span className="line-clamp-1 text-text-secondary">
                        {movie.topCast.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={getGridClass()}>
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group relative overflow-hidden rounded-xl border border-border-default bg-surface-panel transition-all duration-300 hover:border-accent-cyan/50 hover:shadow-xl hover:shadow-accent-cyan/10"
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden bg-surface-raised">
                {movie.poster_path ? (
                  <img
                    src={tmdbImageUrl(movie.poster_path, "w500")}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Film className="h-16 w-16 text-text-muted opacity-20" />
                  </div>
                )}

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Rating Badge */}
                {movie.vote_average && movie.vote_average > 0 && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/80 px-2 py-1 backdrop-blur-md">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-white">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Hover Content - Cast & Crew */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full space-y-2 p-3 transition-transform duration-300 group-hover:translate-y-0">
                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Director */}
                  {movie.directors && movie.directors.length > 0 && (
                    <div className="text-[11px] leading-tight text-white">
                      <span className="font-semibold">Director: </span>
                      <span className="text-gray-200">{movie.directors[0]}</span>
                    </div>
                  )}

                  {/* Top Cast */}
                  {movie.topCast && movie.topCast.length > 0 && (
                    <div className="text-[11px] leading-tight text-white">
                      <span className="font-semibold">Cast: </span>
                      <span className="line-clamp-2 text-gray-200">{movie.topCast.join(", ")}</span>
                    </div>
                  )}

                  {/* Overview fallback if no cast data yet */}
                  {!movie.directors && !movie.topCast && movie.overview && (
                    <p className="line-clamp-3 text-[11px] leading-relaxed text-gray-200">
                      {movie.overview}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3">
                <h3 className="mb-1 line-clamp-1 text-sm font-bold text-text-primary transition-colors group-hover:text-accent-cyan">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  {movie.release_date && (
                    <span>{new Date(movie.release_date).getUTCFullYear()}</span>
                  )}
                  {movie.runtime && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-text-muted" />
                      <span>{movie.runtime} min</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
