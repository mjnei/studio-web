"use client";

import { useEffect, useState } from "react";
import { Search, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { MovieCard } from "@/components/movie";
import { getPopularMovies, searchMovies } from "@/lib/project-client";
import { adminGetMovieDetails } from "@/lib/api/admin";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";

interface EnrichedMovie {
  id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
  imdb_id?: string | null;
  douban_id?: string | null;
  genres?: Array<{ id?: number; name?: string } | Record<string, unknown>> | string[] | null;
  directors?: string[];
  topCast?: string[];
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
          } catch {
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
      case "list":
        return "space-y-3";
      default:
        return "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Movie Library"
        description="Discover and explore movies to create your next project"
        action={
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-accent-cyan/10 px-3 py-1.5 text-xs font-medium text-accent-cyan whitespace-nowrap">
              {movies.length} {movies.length === 1 ? "movie" : "movies"}
            </span>
            {enrichmentProgress > 0 && enrichmentProgress < 100 && (
              <span className="text-xs text-text-muted whitespace-nowrap">
                Loading details... {enrichmentProgress}%
              </span>
            )}
          </div>
        }
      />

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
        <LayoutToggle
          layoutMode={layoutMode}
          onLayoutChange={setLayoutMode}
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner
          size="lg"
          message="Loading movies..."
          description="Please wait while we fetch the catalog"
          className="rounded-2xl border border-border-default bg-surface-panel"
          fullHeight
        />
      ) : error ? (
        <EmptyState
          variant="elevated"
          icon={<Search className="h-12 w-12 text-status-failed" />}
          title="Unable to load movies"
          description={error}
          className="border-status-failed/30 bg-status-failed/5"
        />
      ) : movies.length === 0 ? (
        <EmptyState
          variant="default"
          icon={<Film className="h-16 w-16" />}
          title="No movies found"
          description={
            searchQuery.trim()
              ? "Try adjusting your search terms"
              : "No movies available in the catalog"
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
