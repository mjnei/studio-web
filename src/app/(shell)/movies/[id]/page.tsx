"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { createProject, tmdbImageUrl, type MovieResponse } from "@/lib/project-client";
import { adminGetMovie, type AdminMovieResponse } from "@/lib/api/admin";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [movieId, setMovieId] = useState<number | null>(null);

  const [movie, setMovie] = useState<AdminMovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setMovieId(parseInt(resolvedParams.id));
    })();
  }, [params]);

  useEffect(() => {
    if (movieId) {
      loadMovieDetails();
    }
  }, [movieId]);

  const loadMovieDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetMovie(movieId, "en");
      setMovie(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      const project = await createProject(movieId);
      showToast("success", "Project created! Redirecting...");
      setTimeout(() => {
        router.push(`/dashboard`);
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create project";
      showToast("error", errorMsg);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : null;
  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

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
      <div className="sticky top-0 z-40 border-b border-border-default bg-surface-panel/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
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
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 -mt-20 sm:-mt-24 relative z-10">
            <div className="grid gap-6 sm:grid-cols-[300px_1fr]">
              {/* Poster */}
              <div className="flex flex-col gap-4">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={movie.title || movie.original_title}
                    className="w-full rounded-xl border border-border-default shadow-xl"
                  />
                ) : (
                  <div className="aspect-[2/3] rounded-xl border border-border-default bg-surface-panel flex items-center justify-center">
                    <span className="text-text-muted">No poster available</span>
                  </div>
                )}

                {/* Create Project Button */}
                <button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-cyan px-4 py-3 text-sm font-medium text-white hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreatingProject ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Create Project
                    </>
                  )}
                </button>

                {/* Stats */}
                <div className="space-y-2 rounded-lg border border-border-default bg-surface-panel p-4">
                  {movie.vote_average && movie.vote_average > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-text-primary">
                        {movie.vote_average.toFixed(1)}
                      </span>
                      {movie.vote_count && (
                        <span className="text-xs text-text-muted">
                          ({movie.vote_count.toLocaleString()} votes)
                        </span>
                      )}
                    </div>
                  )}
                  {movie.popularity && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-muted">Popularity:</span>
                      <span className="text-sm text-text-primary">
                        {movie.popularity.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Info */}
              <div className="space-y-6">
                {/* Title & Release */}
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {movie.title || movie.original_title}
                  </h1>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p className="text-sm text-text-muted mb-3">{movie.original_title}</p>
                  )}

                  <div className="flex flex-wrap gap-3 items-center text-sm text-text-secondary">
                    {movie.release_date && (
                      <>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-text-muted">•</span>
                      </>
                    )}
                    {movie.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{movie.runtime} minutes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {movie.imdb_id && (
                    <div className="rounded-lg border border-border-default bg-surface-panel p-3">
                      <p className="text-xs text-text-muted mb-1">IMDb ID</p>
                      <p className="text-sm font-medium text-text-primary break-all">
                        {movie.imdb_id}
                      </p>
                    </div>
                  )}
                  {movie.douban_id && (
                    <div className="rounded-lg border border-border-default bg-surface-panel p-3">
                      <p className="text-xs text-text-muted mb-1">Douban ID</p>
                      <p className="text-sm font-medium text-text-primary break-all">
                        {movie.douban_id}
                      </p>
                    </div>
                  )}
                  {movie.original_language && (
                    <div className="rounded-lg border border-border-default bg-surface-panel p-3">
                      <p className="text-xs text-text-muted mb-1">Language</p>
                      <p className="text-sm font-medium text-text-primary uppercase">
                        {movie.original_language}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tagline */}
                {movie.tagline && (
                  <div className="rounded-lg border border-border-default bg-surface-panel p-4 italic text-text-secondary">
                    "{movie.tagline}"
                  </div>
                )}

                {/* Overview */}
                {movie.overview && (
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary mb-3">Overview</h2>
                    <p className="text-sm leading-relaxed text-text-secondary">{movie.overview}</p>
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
