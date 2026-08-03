"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  Loader,
  AlertCircle,
  CheckCircle2,
  Film,
  User,
  Globe,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { adminGetMovieDetails, type MovieDetailsResponse } from "@/lib/api/admin";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [movieId, setMovieId] = useState<number | null>(null);

  const [movie, setMovie] = useState<MovieDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isTopCastExpanded, setIsTopCastExpanded] = useState(true);
  const [isCrewExpanded, setIsCrewExpanded] = useState(true);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setMovieId(parseInt(resolvedParams.id));
    })();
  }, [params]);

  const loadMovieDetails = useCallback(async () => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetMovieDetails(movieId, "en");
      setMovie(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movie details");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    loadMovieDetails();
  }, [loadMovieDetails]);

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleCreateProject = () => {
    if (!movie) return;

    // Store movie in sessionStorage (same pattern as /project/new/source)
    const movieData = {
      id: movie.id.toString(),
      title: movie.title || movie.original_title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      poster: posterUrl || "",
      rating: movie.vote_average || 0,
      genre: movie.genres?.map((g) => g.name).filter(Boolean) || [],
      duration: movie.runtime ? `${movie.runtime} min` : "",
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("newProjectMovie", JSON.stringify(movieData));
    }

    // Redirect to script creation (project will be created when script is saved)
    router.push("/project/new/script");
  };

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : null;
  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  // Extract cast and crew
  const directors = movie?.cast?.filter((c) => c.role === "director") || [];
  const producers = movie?.cast?.filter((c) => c.role === "producer") || [];
  const writers = movie?.cast?.filter((c) => c.role === "writer") || [];
  const actors =
    movie?.cast
      ?.filter((c) => c.role === "actor" || c.role === "actress")
      .sort((a, b) => (a.credit_order || 999) - (b.credit_order || 999))
      .slice(0, 12) || [];

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-green-500/50 bg-green-500/10 text-green-600"
                : "border-red-500/50 bg-red-500/10 text-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-panel/80 backdrop-blur-md border border-border-default/50 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-panel/90 transition-all shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Movies
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-accent-cyan" />
            <p className="text-sm text-text-muted">Loading movie details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-status-failed opacity-50 mb-3" />
            <p className="text-sm text-text-primary font-medium mb-2">Unable to load movie</p>
            <p className="text-sm text-text-muted mb-4">{error}</p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-white hover:bg-accent-cyan/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Movies
            </Link>
          </div>
        </div>
      ) : movie ? (
        <>
          {/* Backdrop */}
          {backdropUrl && (
            <div className="relative h-64 overflow-hidden bg-surface-raised sm:h-80">
              <img
                src={backdropUrl}
                alt={movie.title || movie.original_title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-base" />
            </div>
          )}

          {/* Content */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 -mt-20 sm:-mt-24 relative z-10">
            <div className="grid gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
              {/* Left Sidebar - Poster & Actions */}
              <div className="flex flex-col gap-4 md:sticky md:top-4 md:self-start">
                {/* Poster */}
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={movie.title || movie.original_title}
                    className="w-full rounded-2xl border border-border-default shadow-2xl"
                  />
                ) : (
                  <div className="aspect-[2/3] rounded-2xl border border-border-default bg-surface-panel flex items-center justify-center">
                    <Film className="h-20 w-20 text-text-muted opacity-30" />
                  </div>
                )}

                {/* Create Project Button */}
                <button
                  onClick={handleCreateProject}
                  disabled={movieId === null || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-cyan px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-cyan/20 hover:bg-accent-cyan/90 hover:shadow-xl hover:shadow-accent-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Create Project
                    </>
                  )}
                </button>

                {/* Stats Card */}
                <div className="space-y-3 rounded-xl border border-border-default bg-surface-panel p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Statistics
                  </h3>
                  {movie.vote_average && movie.vote_average > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-text-muted">Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-text-primary">
                          {movie.vote_average.toFixed(1)}
                        </span>
                        {movie.vote_count && (
                          <span className="text-xs text-text-muted">
                            ({movie.vote_count.toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {movie.popularity && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent-cyan" />
                        <span className="text-sm font-medium text-text-muted">Popularity</span>
                      </div>
                      <span className="text-lg font-bold text-text-primary">
                        {movie.popularity.toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* External IDs */}
                {(movie.imdb_id || movie.douban_id) && (
                  <div className="space-y-3 rounded-xl border border-border-default bg-surface-panel p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      External IDs
                    </h3>
                    {movie.imdb_id && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-text-muted">IMDb</p>
                        <p className="text-sm font-mono text-text-primary">{movie.imdb_id}</p>
                      </div>
                    )}
                    {movie.douban_id && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-text-muted">Douban</p>
                        <p className="text-sm font-mono text-text-primary">{movie.douban_id}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="space-y-8">
                {/* Title Section */}
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-text-primary sm:text-4xl">
                    {movie.title || movie.original_title}
                  </h1>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p className="mb-4 text-base text-text-muted italic">{movie.original_title}</p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                    {movie.release_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-accent-cyan" />
                        <span className="font-medium">
                          {new Date(movie.release_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {movie.runtime && (
                      <>
                        <span className="text-text-muted">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-accent-cyan" />
                          <span className="font-medium">{movie.runtime} minutes</span>
                        </div>
                      </>
                    )}
                    {movie.original_language && (
                      <>
                        <span className="text-text-muted">•</span>
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-accent-cyan" />
                          <span className="font-medium uppercase">{movie.original_language}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="rounded-lg bg-accent-cyan/10 px-3 py-1.5 text-xs font-semibold text-accent-cyan ring-1 ring-accent-cyan/20"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tagline */}
                {movie.tagline && (
                  <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5">
                    <p className="text-base italic text-text-primary leading-relaxed">
                      &quot;{movie.tagline}&quot;
                    </p>
                  </div>
                )}

                {/* Overview */}
                {movie.overview && (
                  <div className="rounded-xl border border-border-default bg-surface-panel p-6">
                    <h2 className="mb-3 text-lg font-bold text-text-primary">Overview</h2>
                    <p className="text-sm leading-loose text-text-secondary">{movie.overview}</p>
                  </div>
                )}

                {/* Cast & Crew */}
                {(directors.length > 0 || producers.length > 0 || writers.length > 0) && (
                  <div className="rounded-xl border border-border-default bg-surface-panel p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-text-primary">Crew</h2>
                      <button
                        onClick={() => setIsCrewExpanded(!isCrewExpanded)}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-raised transition-colors text-text-secondary hover:text-text-primary"
                        aria-label={isCrewExpanded ? "Collapse crew" : "Expand crew"}
                      >
                        {isCrewExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {isCrewExpanded && (
                      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                        {/* Directors */}
                        {directors.length > 0 && (
                          <div>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                              Director{directors.length > 1 ? "s" : ""}
                            </h3>
                            <div className="space-y-2">
                              {directors.map((director) => (
                                <div key={director.id} className="flex items-center gap-3">
                                  {director.person.profile_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w185${director.person.profile_path}`}
                                      alt={director.person.display_name}
                                      className="h-12 w-12 rounded-lg object-cover ring-2 ring-border-default"
                                    />
                                  ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised ring-2 ring-border-default">
                                      <User className="h-5 w-5 text-text-muted" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-text-primary">
                                      {director.person.display_name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Producers */}
                        {producers.length > 0 && (
                          <div>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                              Producer{producers.length > 1 ? "s" : ""}
                            </h3>
                            <div className="space-y-2">
                              {producers.slice(0, 3).map((producer) => (
                                <div key={producer.id} className="flex items-center gap-3">
                                  {producer.person.profile_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w185${producer.person.profile_path}`}
                                      alt={producer.person.display_name}
                                      className="h-12 w-12 rounded-lg object-cover ring-2 ring-border-default"
                                    />
                                  ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised ring-2 ring-border-default">
                                      <User className="h-5 w-5 text-text-muted" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-text-primary">
                                      {producer.person.display_name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Writers */}
                        {writers.length > 0 && (
                          <div>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                              Writer{writers.length > 1 ? "s" : ""}
                            </h3>
                            <div className="space-y-2">
                              {writers.slice(0, 3).map((writer) => (
                                <div key={writer.id} className="flex items-center gap-3">
                                  {writer.person.profile_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w185${writer.person.profile_path}`}
                                      alt={writer.person.display_name}
                                      className="h-12 w-12 rounded-lg object-cover ring-2 ring-border-default"
                                    />
                                  ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised ring-2 ring-border-default">
                                      <User className="h-5 w-5 text-text-muted" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-text-primary">
                                      {writer.person.display_name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Cast */}
                {actors.length > 0 && (
                  <div className="rounded-xl border border-border-default bg-surface-panel p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-text-primary">Top Cast</h2>
                      <button
                        onClick={() => setIsTopCastExpanded(!isTopCastExpanded)}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-raised transition-colors text-text-secondary hover:text-text-primary"
                        aria-label={isTopCastExpanded ? "Collapse cast" : "Expand cast"}
                      >
                        {isTopCastExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {isTopCastExpanded && (
                      <>
                        {/* Desktop: Grid Layout */}
                        <div className="hidden sm:grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {actors.map((actor) => (
                            <div
                              key={actor.id}
                              className="group overflow-hidden rounded-xl border border-border-default bg-surface-raised transition-all hover:border-accent-cyan/40 hover:shadow-lg"
                            >
                              <div className="relative aspect-square overflow-hidden bg-surface-base">
                                {actor.person.profile_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w342${actor.person.profile_path}`}
                                    alt={actor.person.display_name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <User className="h-16 w-16 text-text-muted opacity-30" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="mb-1 truncate text-sm font-bold text-text-primary">
                                  {actor.person.display_name}
                                </p>
                                {actor.character && (
                                  <p className="truncate text-xs text-text-muted">
                                    {actor.character}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Mobile: 2-Column Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:hidden">
                          {actors.map((actor) => (
                            <div
                              key={actor.id}
                              className="group overflow-hidden rounded-xl border border-border-default bg-surface-raised transition-all hover:border-accent-cyan/40"
                            >
                              <div className="relative aspect-square overflow-hidden bg-surface-base">
                                {actor.person.profile_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w342${actor.person.profile_path}`}
                                    alt={actor.person.display_name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <User className="h-12 w-12 text-text-muted opacity-30" />
                                  </div>
                                )}
                              </div>
                              <div className="p-2.5">
                                <p className="mb-1 truncate text-xs font-bold text-text-primary">
                                  {actor.person.display_name}
                                </p>
                                {actor.character && (
                                  <p className="truncate text-[10px] leading-tight text-text-muted">
                                    {actor.character}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
