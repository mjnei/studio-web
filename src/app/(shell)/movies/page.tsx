"use client";

import { useEffect, useState } from "react";
import { Search, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { MovieCard } from "@/components/movie";
import { getPopularMovies, searchMovies, type MovieResponse } from "@/lib/project-client";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";
import { useI18n } from "@/i18n";

export default function MoviesPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") return "grid-sm";
    const saved = localStorage.getItem("layoutMode:movies");
    if (saved && (saved === "grid-sm" || saved === "grid-md" || saved === "list")) {
      return saved as LayoutMode;
    }
    return "grid-sm";
  });

  // Save layout preference to localStorage when it changes
  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem("layoutMode:movies", mode);
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = searchQuery.trim();
        const data = query ? (await searchMovies(query, 30)).movies : await getPopularMovies(30);

        if (controller.signal.aborted) return;

        setMovies(data);
        setLoading(false);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : t("movies.error.unableToLoad"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t is stable enough for error fallback
  }, [searchQuery]);

  const getGridClass = () => {
    switch (layoutMode) {
      case "grid-sm":
        // Small cards: 2 cols (base), 3 cols (sm), 4 cols (md), 5 cols (lg), 6 cols (xl)
        return "grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "grid-md":
        // Medium cards: 1 col (base), 2 cols (sm), 3 cols (md), 4 cols (lg), 5 cols (xl)
        return "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case "list":
        return "space-y-3";
      default:
        return "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("movies.title")}
        description={t("movies.description")}
        action={
          <span className="rounded-full bg-accent-cyan/10 px-3 py-1.5 text-xs font-medium text-accent-cyan whitespace-nowrap">
            {movies.length === 1
              ? t("movies.countSingular", { count: movies.length })
              : t("movies.count", { count: movies.length })}
          </span>
        }
      />

      {/* Search and Layout Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="text"
            placeholder={t("movies.searchPlaceholder")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <LayoutToggle layoutMode={layoutMode} onLayoutChange={handleLayoutChange} />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner
          size="lg"
          message={t("movies.loading")}
          description={t("movies.loadingDescription")}
          className="rounded-2xl border border-border-default bg-surface-panel"
          fullHeight
        />
      ) : error ? (
        <EmptyState
          variant="elevated"
          icon={<Search className="h-12 w-12 text-status-failed" />}
          title={t("movies.error.title")}
          description={error}
          className="border-status-failed/30 bg-status-failed/5"
        />
      ) : movies.length === 0 ? (
        <EmptyState
          variant="default"
          icon={<Film className="h-16 w-16" />}
          title={t("movies.empty.title")}
          description={
            searchQuery.trim() ? t("movies.empty.searchHint") : t("movies.empty.catalogEmpty")
          }
        />
      ) : (
        <div className={getGridClass()}>
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              layout={layoutMode}
              href={`/movies/${movie.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
