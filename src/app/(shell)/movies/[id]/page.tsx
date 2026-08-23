"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  AlertCircle,
  Film,
  Globe,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ExternalImage } from "@/components/ui/ExternalImage";
import { Heading } from "@/components/ui/heading";
import { getMovie, type MovieResponse } from "@/lib/project-client";
import { useI18n } from "@/i18n";

type MovieGenre = { id?: number; name?: string };

function genreName(genre: MovieGenre | Record<string, unknown> | string): string | undefined {
  if (typeof genre === "string") return genre;
  if (genre && typeof genre === "object" && "name" in genre && typeof genre.name === "string") {
    return genre.name;
  }
  return undefined;
}

function genreKey(
  genre: MovieGenre | Record<string, unknown> | string,
  index: number
): string | number {
  if (typeof genre === "string") return genre;
  if (genre && typeof genre === "object" && "id" in genre && genre.id != null) {
    return genre.id as string | number;
  }
  return index;
}

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const router = useRouter();
  const [movieId, setMovieId] = useState<number | null>(null);

  const [movie, setMovie] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await getMovie(movieId, "en");
        if (isMounted) {
          setMovie(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : t("movies.detail.loadFailed"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t is stable enough for error fallback
  }, [movieId]);

  const handleCreateProject = () => {
    if (!movie) return;

    // Store movie in sessionStorage (same pattern as /project/new/source)
    const movieData = {
      id: movie.id.toString(),
      title: movie.title || movie.original_title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      poster: posterUrl || "",
      rating: movie.vote_average || 0,
      genre: (movie.genres ?? []).map(genreName).filter((name): name is string => Boolean(name)),
      duration: movie.runtime ? `${movie.runtime} ${t("movies.runtimeUnit")}` : "",
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

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Back Button */}
      <div className="sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-panel/80 backdrop-blur-md border border-border-default/50 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-panel/90 transition-all shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("movies.detail.back")}
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" className="text-accent-cyan" />
            <p className="text-sm text-text-muted">{t("movies.detail.loading")}</p>
          </div>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-status-failed opacity-50 mb-3" />
            <p className="text-sm text-text-primary font-medium mb-2">
              {t("movies.detail.errorTitle")}
            </p>
            <p className="text-sm text-text-muted mb-4">{error}</p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-white hover:bg-accent-cyan/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("movies.detail.return")}
            </Link>
          </div>
        </div>
      ) : movie ? (
        <>
          {/* Backdrop */}
          {backdropUrl && (
            <div className="relative h-64 w-full overflow-hidden bg-surface-raised sm:h-80">
              <ExternalImage
                src={backdropUrl}
                alt={movie.title || movie.original_title || "Backdrop"}
                className="h-full w-full object-cover"
                fill
                priority
                sizes="100vw"
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
                  <ExternalImage
                    src={posterUrl}
                    alt={movie.title || movie.original_title || "Poster"}
                    className="w-full rounded-2xl border border-border-default shadow-2xl"
                    width={280}
                    height={420}
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
                      <Spinner className="h-5 w-5" />
                      {t("movies.detail.buttonLoading")}
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      {t("movies.detail.createProject")}
                    </>
                  )}
                </button>

                {/* Stats Card */}
                <div className="space-y-3 rounded-xl border border-border-default bg-surface-panel p-4">
                  <Heading
                    variant="label"
                    as="h3"
                    className="uppercase tracking-wide text-text-muted"
                  >
                    {t("movies.detail.statistics")}
                  </Heading>
                  {movie.vote_average && movie.vote_average > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-text-muted">
                          {t("movies.detail.rating")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heading variant="metric" as="span" className="text-text-primary">
                          {movie.vote_average.toFixed(1)}
                        </Heading>
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
                        <span className="text-sm font-medium text-text-muted">
                          {t("movies.detail.popularity")}
                        </span>
                      </div>
                      <Heading variant="metric" as="span" className="text-text-primary">
                        {movie.popularity.toFixed(0)}
                      </Heading>
                    </div>
                  )}
                </div>

                {/* External IDs */}
                {(movie.imdb_id || movie.douban_id) && (
                  <div className="space-y-3 rounded-xl border border-border-default bg-surface-panel p-4">
                    <Heading
                      variant="label"
                      as="h3"
                      className="uppercase tracking-wide text-text-muted"
                    >
                      {t("movies.detail.externalIds")}
                    </Heading>
                    {movie.imdb_id && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-text-muted">
                          {t("movies.detail.imdb")}
                        </p>
                        <p className="text-sm font-mono text-text-primary">{movie.imdb_id}</p>
                      </div>
                    )}
                    {movie.douban_id && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-text-muted">
                          {t("movies.detail.douban")}
                        </p>
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
                  <Heading variant="page" className="mb-2 text-text-primary">
                    {movie.title || movie.original_title}
                  </Heading>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p className="mb-4 text-body text-text-muted italic">{movie.original_title}</p>
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
                          <span className="font-medium">
                            {t("movies.detail.runtimeMinutes", { runtime: movie.runtime })}
                          </span>
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
                      {movie.genres.map((genre, index) => {
                        const name = genreName(genre);
                        if (!name) return null;
                        return (
                          <span
                            key={genreKey(genre, index)}
                            className="rounded-lg bg-accent-cyan/10 px-3 py-1.5 text-xs font-semibold text-accent-cyan ring-1 ring-accent-cyan/20"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tagline */}
                {movie.tagline && (
                  <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5">
                    <p className="text-body italic text-text-primary leading-relaxed">
                      &quot;{movie.tagline}&quot;
                    </p>
                  </div>
                )}

                {/* Overview */}
                {movie.overview && (
                  <div className="rounded-xl border border-border-default bg-surface-panel p-6">
                    <Heading variant="subsection" as="h2" className="mb-3 text-text-primary">
                      {t("movies.detail.overview")}
                    </Heading>
                    <p className="text-sm leading-loose text-text-secondary">{movie.overview}</p>
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
