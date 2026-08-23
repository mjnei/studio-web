"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  Film,
  Users,
  Tag,
  Globe,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ExternalImage } from "@/components/ui/ExternalImage";
import { Heading } from "@/components/ui/heading";
import {
  adminGetMovieDetails,
  adminUpdateMovie,
  adminDeleteMovie,
  type MovieDetailsResponse,
} from "@/lib/api/admin";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

type EditingMovie = {
  id: number;
  douban_id?: string;
};

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "zh-CN", "zh-TW", "ja", "ko"];

export default function AdminMovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [movieId, setMovieId] = useState<number | null>(null);
  const [movie, setMovie] = useState<MovieDetailsResponse | null>(null);
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<EditingMovie | null>(null);

  const loadMovieDetails = useCallback(async () => {
    if (!movieId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await adminGetMovieDetails(movieId, selectedLocale);
      setMovie(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movie details");
    } finally {
      setLoading(false);
    }
  }, [movieId, selectedLocale]);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setMovieId(parseInt(resolvedParams.id));
    })();
  }, [params]);

  useEffect(() => {
    if (!movieId) return;

    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminGetMovieDetails(movieId, selectedLocale);
        if (isMounted) {
          setMovie(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load movie details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [movieId, selectedLocale]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleUpdate = async () => {
    if (!editingData || !movieId) return;
    try {
      await adminUpdateMovie(editingData.id, { douban_id: editingData.douban_id }, selectedLocale);
      showToast("success", "Movie updated successfully");
      setIsEditing(false);
      setEditingData(null);
      await loadMovieDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update movie";
      showToast("error", message);
    }
  };

  const handleDelete = async () => {
    if (!movieId) return;
    if (
      !confirm(
        "Delete this movie? This will cascade delete all related data (translations, genres, cast, etc.). This action cannot be undone."
      )
    )
      return;

    try {
      await adminDeleteMovie(movieId);
      showToast("success", "Movie deleted successfully. Redirecting...");
      setTimeout(() => {
        router.push("/admin/movies");
      }, 1500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete movie";
      showToast("error", message);
    }
  };

  const getImageUrl = (
    path: string | null | undefined,
    size: "w500" | "w780" | "h632" = "w780"
  ) => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const posterUrl = movie?.poster_path ? getImageUrl(movie.poster_path, "w780") : null;
  const backdropUrl = movie?.backdrop_path ? getImageUrl(movie.backdrop_path, "w780") : null;

  // Group cast by role
  const actors = movie?.cast.filter((c) => c.role === "actor" || c.role === "actress") || [];
  const directors = movie?.cast.filter((c) => c.role === "director") || [];
  const producers = movie?.cast.filter((c) => c.role === "producer") || [];
  const writers = movie?.cast.filter((c) => c.role === "writer") || [];

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
                : toast.type === "error"
                  ? "border-red-500/50 bg-red-500/10 text-red-600"
                  : "border-blue-500/50 bg-blue-500/10 text-blue-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-body font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border-default bg-surface-panel/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/movies"
              className="inline-flex items-center gap-2 text-body font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Movies
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-body text-text-muted">Locale:</span>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body text-text-primary focus:border-accent-primary focus:outline-none"
              >
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" className="text-accent-primary" />
            <p className="text-body text-text-muted">Loading movie details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-border-default bg-surface-panel p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 opacity-50 mb-3" />
            <p className="text-body text-text-primary font-medium mb-2">Unable to load movie</p>
            <p className="text-body text-text-muted mb-4">{error}</p>
            <Link
              href="/admin/movies"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-body font-medium text-white hover:bg-accent-primary/90 transition-colors"
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
              <ExternalImage
                src={backdropUrl}
                alt={movie.title || movie.original_title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-base" />
            </div>
          )}

          {/* Content */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 -mt-20 sm:-mt-24 relative z-10">
            <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
              {/* Left Column - Poster and Quick Actions */}
              <div className="flex flex-col gap-4">
                {/* Poster */}
                {posterUrl ? (
                  <ExternalImage
                    src={posterUrl}
                    alt={movie.title || movie.original_title}
                    width={300}
                    height={450}
                    className="w-full rounded-2xl border border-border-default shadow-xl"
                  />
                ) : (
                  <div className="aspect-[2/3] rounded-2xl border border-border-default bg-surface-panel flex items-center justify-center">
                    <Film className="h-16 w-16 text-text-muted opacity-50" />
                  </div>
                )}

                {/* Stats Card */}
                <div className="space-y-3 rounded-2xl border border-border-default bg-surface-panel p-4">
                  {movie.vote_average && movie.vote_average > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-body font-semibold text-text-primary">
                        {movie.vote_average.toFixed(1)}
                      </span>
                      {movie.vote_count && (
                        <span className="text-caption text-text-muted">
                          ({movie.vote_count.toLocaleString()} votes)
                        </span>
                      )}
                    </div>
                  )}
                  {movie.popularity && (
                    <div className="flex items-center justify-between">
                      <span className="text-caption font-medium text-text-muted">Popularity:</span>
                      <span className="text-body text-text-primary">
                        {movie.popularity.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isEditing && editingData ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-caption font-medium text-text-muted">
                        Douban ID
                      </label>
                      <input
                        type="text"
                        value={editingData.douban_id || ""}
                        onChange={(e) =>
                          setEditingData({ ...editingData, douban_id: e.target.value })
                        }
                        className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-body text-text-primary focus:border-accent-primary focus:outline-none"
                        placeholder="Optional Douban ID"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="md"
                        variant="success"
                        onClick={handleUpdate}
                        leftIcon={<Save className="h-4 w-4" />}
                        className="flex-1"
                      >
                        Save
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingData(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="md"
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(true);
                        setEditingData({
                          id: movie.id,
                          douban_id: movie.douban_id || undefined,
                        });
                      }}
                      leftIcon={<Edit2 className="h-4 w-4" />}
                    >
                      Edit Movie
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      onClick={handleDelete}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      className="border-red-500/50 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    >
                      Delete Movie
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column - Movie Info */}
              <div className="space-y-6">
                {/* Title & Metadata */}
                <div>
                  <Heading variant="page" className="mb-3 text-text-primary">
                    {movie.title || movie.original_title}
                  </Heading>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p className="mb-3 text-body text-text-muted">{movie.original_title}</p>
                  )}

                  <div className="flex flex-wrap gap-4 items-center text-body text-text-secondary mb-4">
                    {movie.release_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {movie.runtime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{movie.runtime} minutes</span>
                      </div>
                    )}
                    {movie.original_language && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        <span className="uppercase">{movie.original_language}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* External IDs */}
                <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
                  <Heading
                    variant="label"
                    as="h2"
                    className="text-text-primary mb-4 flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    External Links
                  </Heading>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-caption text-text-muted mb-1">TMDB ID</p>
                      <a
                        href={`https://www.themoviedb.org/movie/${movie.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body font-medium text-accent-primary hover:underline flex items-center gap-1"
                      >
                        {movie.id}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {movie.imdb_id && (
                      <div>
                        <p className="text-caption text-text-muted mb-1">IMDb</p>
                        <a
                          href={`https://www.imdb.com/title/${movie.imdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body font-medium text-accent-primary hover:underline flex items-center gap-1"
                        >
                          {movie.imdb_id}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {movie.douban_id && (
                      <div>
                        <p className="text-caption text-text-muted mb-1">Douban</p>
                        <a
                          href={`https://movie.douban.com/subject/${movie.douban_id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body font-medium text-accent-primary hover:underline flex items-center gap-1"
                        >
                          {movie.douban_id}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
                    <Heading
                      variant="label"
                      as="h2"
                      className="text-text-primary mb-3 flex items-center gap-2"
                    >
                      <Tag className="h-4 w-4" />
                      Genres
                    </Heading>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body font-medium text-text-primary"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tagline */}
                {movie.tagline && (
                  <div className="rounded-2xl border border-border-default bg-surface-panel p-6 italic text-text-secondary">
                    &quot;{movie.tagline}&quot;
                  </div>
                )}

                {/* Overview */}
                {movie.overview && (
                  <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
                    <Heading variant="label" as="h2" className="text-text-primary mb-3">
                      Overview
                    </Heading>
                    <p className="text-body leading-relaxed text-text-secondary">
                      {movie.overview}
                    </p>
                  </div>
                )}

                {/* Cast & Crew */}
                <div className="space-y-6">
                  {/* Directors */}
                  {directors.length > 0 && (
                    <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
                      <Heading
                        variant="label"
                        as="h2"
                        className="text-text-primary mb-4 flex items-center gap-2"
                      >
                        <Film className="h-4 w-4" />
                        Directors
                      </Heading>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {directors.map((credit) => (
                          <div
                            key={credit.id}
                            className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-surface-base p-3 text-center"
                          >
                            {credit.person.profile_path ? (
                              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                                <ExternalImage
                                  src={getImageUrl(credit.person.profile_path, "h632") || ""}
                                  alt={credit.person.display_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border-default bg-surface-raised">
                                <Users className="h-8 w-8 text-text-muted opacity-50" />
                              </div>
                            )}
                            <div className="w-full">
                              <p className="text-caption font-medium text-text-primary line-clamp-2">
                                {credit.person.display_name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cast */}
                  {actors.length > 0 && (
                    <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
                      <Heading
                        variant="label"
                        as="h2"
                        className="text-text-primary mb-4 flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Cast ({actors.length})
                      </Heading>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {actors.slice(0, 20).map((credit) => (
                          <div
                            key={credit.id}
                            className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-surface-base p-3 text-center"
                          >
                            {credit.person.profile_path ? (
                              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                                <ExternalImage
                                  src={getImageUrl(credit.person.profile_path, "h632") || ""}
                                  alt={credit.person.display_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border-default bg-surface-raised">
                                <Users className="h-8 w-8 text-text-muted opacity-50" />
                              </div>
                            )}
                            <div className="w-full">
                              <p className="text-caption font-medium text-text-primary line-clamp-2">
                                {credit.person.display_name}
                              </p>
                              {credit.character && (
                                <p className="text-caption text-text-muted line-clamp-2">
                                  {credit.character}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {actors.length > 20 && (
                        <p className="mt-3 text-caption text-text-muted text-center">
                          Showing top 20 of {actors.length} cast members
                        </p>
                      )}
                    </div>
                  )}

                  {/* Producers */}
                  {producers.length > 0 && (
                    <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
                      <Heading variant="label" as="h2" className="text-text-primary mb-4">
                        Producers
                      </Heading>
                      <div className="flex flex-wrap gap-2">
                        {producers.map((credit) => (
                          <span
                            key={credit.id}
                            className="rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body text-text-primary"
                          >
                            {credit.person.display_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Writers */}
                  {writers.length > 0 && (
                    <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
                      <Heading variant="label" as="h2" className="text-text-primary mb-4">
                        Writers
                      </Heading>
                      <div className="flex flex-wrap gap-2">
                        {writers.map((credit) => (
                          <span
                            key={credit.id}
                            className="rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body text-text-primary"
                          >
                            {credit.person.display_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
