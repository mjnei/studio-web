"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Film,
  Trash2,
  Edit2,
  Search,
  Star,
  Calendar,
  Download,
  Database,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { ExternalImage } from "@/components/ui/ExternalImage";
import {
  adminListMovies,
  adminUpdateMovie,
  adminDeleteMovie,
  searchTMDBMovies,
  importTMDBMovie,
  type TMDBMovieSearchResult,
  type AdminMovieResponse,
} from "@/lib/api/admin";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";
import { useToast } from "@/components/ui/toast";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading } from "@/components/ui/heading";

type ViewMode = "library" | "import";

type EditingMovie = {
  id: number;
  douban_id?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
};

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "zh-CN", "zh-TW", "ja", "ko"];

export default function AdminMoviesPage() {
  const toast = useToast();

  // View mode: library (manage existing) or import (TMDB search)
  const [viewMode, setViewMode] = useState<ViewMode>("library");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-md");
  const [localesExpanded, setLocalesExpanded] = useState(false);

  // Refs for auto-focus
  const tmdbSearchInputRef = useRef<HTMLInputElement>(null);

  // Library state
  const [movies, setMovies] = useState<AdminMovieResponse[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [librarySearchTerm, setLibrarySearchTerm] = useState("");
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryTotalPages, setLibraryTotalPages] = useState(1);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingMovie | null>(null);

  // TMDB Import state
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState("");
  const [tmdbSearchResults, setTmdbSearchResults] = useState<TMDBMovieSearchResult[]>([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);
  const [tmdbPage, setTmdbPage] = useState(1);
  const [tmdbTotalPages, setTmdbTotalPages] = useState(0);
  const [tmdbTotalResults, setTmdbTotalResults] = useState(0);
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());
  const [selectedLocales, setSelectedLocales] = useState<string[]>(SUPPORTED_LOCALES);
  const [importedMovieIds, setImportedMovieIds] = useState<Set<number>>(new Set());

  // Load layout preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("layoutMode:admin-movies");
    if (saved && (saved === "grid-sm" || saved === "grid-md" || saved === "list")) {
      setLayoutMode(saved as LayoutMode);
    }
  }, []);

  // Save layout preference to localStorage when it changes
  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem("layoutMode:admin-movies", mode);
  };

  // Load movies - can be called manually from handlers
  const loadMovies = useCallback(async () => {
    setIsLoadingLibrary(true);
    try {
      const response = await adminListMovies({
        query: librarySearchTerm || undefined,
        locale: selectedLocale,
        page: libraryPage,
        page_size: 24,
        sort_by: "popularity",
        sort_order: "desc",
      });
      setMovies(response.movies);
      setLibraryTotal(response.total);
      setLibraryTotalPages(Math.ceil(response.total / response.page_size));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load movies";
      toast.error(message);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [librarySearchTerm, selectedLocale, libraryPage, toast]);

  // Trigger loads when dependencies change
  useEffect(() => {
    if (viewMode === "library") {
      let isMounted = true;

      const doLoad = async () => {
        setIsLoadingLibrary(true);
        try {
          const response = await adminListMovies({
            query: librarySearchTerm || undefined,
            locale: selectedLocale,
            page: libraryPage,
            page_size: 24,
            sort_by: "popularity",
            sort_order: "desc",
          });
          if (isMounted) {
            setMovies(response.movies);
            setLibraryTotal(response.total);
            setLibraryTotalPages(Math.ceil(response.total / response.page_size));
          }
        } catch (error: unknown) {
          if (isMounted) {
            const message = error instanceof Error ? error.message : "Failed to load movies";
            toast.error(message);
          }
        } finally {
          if (isMounted) {
            setIsLoadingLibrary(false);
          }
        }
      };

      doLoad();

      return () => {
        isMounted = false;
      };
    } else if (viewMode === "import") {
      setTimeout(() => {
        tmdbSearchInputRef.current?.focus();
      }, 100);
    }
  }, [viewMode, libraryPage, librarySearchTerm, selectedLocale, toast]);

  // TMDB Search handlers
  const handleTmdbSearch = async (page: number = 1) => {
    if (!tmdbSearchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    tmdbSearchInputRef.current?.blur();

    setIsSearchingTmdb(true);
    try {
      const response = await searchTMDBMovies(tmdbSearchQuery, page);
      setTmdbSearchResults(response.results);
      setTmdbPage(response.page);
      setTmdbTotalPages(response.total_pages);
      setTmdbTotalResults(response.total_results);

      if (response.results.length === 0) {
        toast.info("No movies found. Try a different search query.");
      } else {
        const allExistingIds = new Set<number>();
        let libraryPageNum = 1;
        let hasMore = true;

        while (hasMore && libraryPageNum <= 10) {
          try {
            const libraryResponse = await adminListMovies({
              page: libraryPageNum,
              page_size: 100,
            });
            libraryResponse.movies.forEach((m) => allExistingIds.add(m.id));
            hasMore = libraryResponse.movies.length === 100;
            libraryPageNum++;
          } catch (error) {
            console.error("Error fetching library for comparison:", error);
            break;
          }
        }

        const initialImported = new Set(importedMovieIds);
        response.results.forEach((movie) => {
          if (allExistingIds.has(movie.id)) {
            initialImported.add(movie.id);
          }
        });
        setImportedMovieIds(initialImported);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to search movies";
      toast.error(message);
      setTmdbSearchResults([]);
    } finally {
      setIsSearchingTmdb(false);
    }
  };

  const handleImport = async (movie: TMDBMovieSearchResult) => {
    setImportingIds((prev) => new Set(prev).add(movie.id));
    try {
      const response = await importTMDBMovie({
        movie_id: movie.id,
        locales: selectedLocales.length > 0 ? selectedLocales : undefined,
      });
      toast.success(response.message);

      setImportedMovieIds((prev) => new Set(prev).add(movie.id));

      if (viewMode === "library") {
        await loadMovies();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to import movie";
      toast.error(message);
    } finally {
      setImportingIds((prev) => {
        const next = new Set(prev);
        next.delete(movie.id);
        return next;
      });
    }
  };

  const handleTmdbKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTmdbSearch(1);
    }
  };

  const toggleLocale = (locale: string) => {
    setSelectedLocales((prev) =>
      prev.includes(locale) ? prev.filter((l) => l !== locale) : [...prev, locale]
    );
  };

  const toggleAllLocales = () => {
    setSelectedLocales((prev) =>
      prev.length === SUPPORTED_LOCALES.length ? [] : [...SUPPORTED_LOCALES]
    );
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (
      !confirm(
        "Delete this movie? This will cascade delete all related data (translations, cast, etc.). This action cannot be undone."
      )
    )
      return;
    try {
      await adminDeleteMovie(movieId);
      toast.success("Movie deleted successfully");
      await loadMovies();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete movie";
      toast.error(message);
    }
  };

  const handleUpdateMovie = async () => {
    if (!editingData) return;
    try {
      await adminUpdateMovie(
        editingData.id,
        {
          douban_id: editingData.douban_id,
          popularity: editingData.popularity,
          vote_average: editingData.vote_average,
          vote_count: editingData.vote_count,
        },
        selectedLocale
      );
      toast.success("Movie updated successfully");
      setEditingId(null);
      setEditingData(null);
      await loadMovies();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update movie";
      toast.error(message);
    }
  };

  const handleLibrarySearch = () => {
    setLibraryPage(1);
    loadMovies();
  };

  const handleLibraryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLibrarySearch();
    }
  };

  const getImageUrl = (path: string | null | undefined, size: "w500" | "w780" = "w500") => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getGridClass = () => {
    switch (layoutMode) {
      case "grid-sm":
        // Small cards: 3 cols (sm), 4 cols (md), 5 cols (lg), 6 cols (xl)
        return "grid gap-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "grid-md":
        // Medium cards: 2 cols (base), 3 cols (md), 4 cols (lg)
        return "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "list":
        return "space-y-4";
      default:
        return "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Film className="h-8 w-8 text-accent-primary" />
          <Heading variant="page" className="text-text-primary">
            TMDB Movies
          </Heading>
        </div>
        <p className="text-text-secondary">
          Import movies from TMDB or manage your existing movie library
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode("library")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            viewMode === "library"
              ? "bg-accent-primary text-white"
              : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
          }`}
        >
          <Database className="h-4 w-4" />
          Movie Library
          {libraryTotal > 0 && <span className="text-xs opacity-80">({libraryTotal})</span>}
        </button>
        <button
          onClick={() => setViewMode("import")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            viewMode === "import"
              ? "bg-accent-primary text-white"
              : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
          }`}
        >
          <Download className="h-4 w-4" />
          Import from TMDB
        </button>
      </div>

      {/* LIBRARY VIEW */}
      {viewMode === "library" && (
        <>
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
              <Search className="h-5 w-5 shrink-0 text-text-muted" />
              <input
                type="text"
                placeholder="Search movies by title..."
                value={librarySearchTerm}
                onChange={(e) => setLibrarySearchTerm(e.target.value)}
                onKeyPress={handleLibraryKeyPress}
                className="min-w-0 flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* Layout Mode Toggle */}
              <LayoutToggle layoutMode={layoutMode} onLayoutChange={handleLayoutChange} />
              <span className="text-sm text-text-muted">Locale:</span>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              >
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Movies Grid */}
          {isLoadingLibrary ? (
            <LoadingSpinner size="lg" message="Loading movies..." fullHeight />
          ) : movies.length === 0 ? (
            <EmptyState
              variant="default"
              size="md"
              icon={<Film className="h-12 w-12" />}
              title="No movies found"
              description={
                librarySearchTerm
                  ? "Try a different search query"
                  : "Import movies from TMDB to get started"
              }
              action={
                !librarySearchTerm && (
                  <button
                    onClick={() => setViewMode("import")}
                    className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Import from TMDB
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className={getGridClass() + " mb-6"}>
                {movies.map((movie) => {
                  const posterUrl = getImageUrl(movie.poster_path);
                  const isEditing = editingId === movie.id;

                  if (layoutMode === "list") {
                    // List view layout
                    return (
                      <div
                        key={movie.id}
                        className="group flex gap-4 overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-primary/50 hover:shadow-lg"
                      >
                        {/* Poster Thumbnail */}
                        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                          {posterUrl ? (
                            <ExternalImage
                              src={posterUrl}
                              alt={movie.title || movie.original_title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Film className="h-8 w-8 text-text-muted opacity-50" />
                            </div>
                          )}
                        </div>

                        {/* Movie Info */}
                        <div className="flex flex-1 flex-col">
                          <div className="mb-2 flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <Heading
                                variant="subsection"
                                as="h3"
                                className="mb-1 text-text-primary"
                              >
                                {movie.title || movie.original_title}
                              </Heading>
                              {movie.original_title !== movie.title && (
                                <p className="mb-1 text-sm text-text-muted">
                                  {movie.original_title}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-sm text-text-muted">
                                {movie.release_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                  </div>
                                )}
                                {movie.vote_average && movie.vote_average > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    <span>{movie.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                                <span className="text-xs">ID: {movie.id}</span>
                                {movie.douban_id && (
                                  <span className="text-xs">Douban: {movie.douban_id}</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            {isEditing && editingData ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdateMovie}
                                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingData(null);
                                  }}
                                  className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Link
                                  href={`/admin/movies/${movie.id}`}
                                  className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Link>
                                <button
                                  onClick={() => {
                                    setEditingId(movie.id);
                                    setEditingData({
                                      id: movie.id,
                                      douban_id: movie.douban_id || undefined,
                                      popularity: movie.popularity || undefined,
                                      vote_average: movie.vote_average || undefined,
                                      vote_count: movie.vote_count || undefined,
                                    });
                                  }}
                                  className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMovie(movie.id)}
                                  className="flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Overview */}
                          {movie.overview && (
                            <p className="mb-2 line-clamp-2 text-sm text-text-secondary">
                              {movie.overview}
                            </p>
                          )}

                          {/* Edit Form */}
                          {isEditing && editingData && (
                            <div className="mt-2 rounded-lg border border-border-default bg-surface-base p-3">
                              <div>
                                <label className="text-xs text-text-muted">Douban ID</label>
                                <input
                                  type="text"
                                  value={editingData.douban_id || ""}
                                  onChange={(e) =>
                                    setEditingData({ ...editingData, douban_id: e.target.value })
                                  }
                                  className="w-full rounded border border-border-default bg-surface-panel px-2 py-1 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                                  placeholder="Optional"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Grid view layout
                  return (
                    <div
                      key={movie.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-panel transition-all hover:border-accent-primary/50 hover:shadow-lg"
                    >
                      {/* Poster Image */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-raised">
                        {posterUrl ? (
                          <ExternalImage
                            src={posterUrl}
                            alt={movie.title || movie.original_title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Film className="h-16 w-16 text-text-muted opacity-50" />
                          </div>
                        )}
                        {/* Rating Badge */}
                        {movie.vote_average && movie.vote_average > 0 && (
                          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-white">
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Movie Info - Flex grow to push button to bottom */}
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex-1">
                          <Heading
                            variant="label"
                            as="h3"
                            className="mb-1 line-clamp-2 text-text-primary"
                          >
                            {movie.title || movie.original_title}
                          </Heading>
                          {movie.original_title !== movie.title && (
                            <p className="mb-1 text-xs text-text-muted line-clamp-1">
                              {movie.original_title}
                            </p>
                          )}
                          <div className="mb-2 flex flex-col gap-1">
                            {movie.release_date && (
                              <div className="flex items-center gap-1 text-xs text-text-muted">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <span>ID: {movie.id}</span>
                              {movie.douban_id && <span>Douban: {movie.douban_id}</span>}
                            </div>
                          </div>
                          {movie.overview && (
                            <p className="mb-3 line-clamp-2 text-xs text-text-secondary">
                              {movie.overview}
                            </p>
                          )}
                        </div>

                        {/* Edit Mode */}
                        {isEditing && editingData ? (
                          <div className="mt-3 pt-3 border-t border-border-default space-y-2">
                            <div>
                              <label className="text-xs text-text-muted">Douban ID</label>
                              <input
                                type="text"
                                value={editingData.douban_id || ""}
                                onChange={(e) =>
                                  setEditingData({ ...editingData, douban_id: e.target.value })
                                }
                                className="w-full rounded border border-border-default bg-surface-base px-2 py-1 text-xs text-text-primary focus:border-accent-primary focus:outline-none"
                                placeholder="Optional"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateMovie}
                                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                              >
                                <Save className="h-3 w-3" />
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingData(null);
                                }}
                                className="flex items-center justify-center gap-1 rounded-lg border border-border-default bg-surface-base px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Actions */
                          <div className="mt-3 pt-3 border-t border-border-default flex gap-2">
                            <Link
                              href={`/admin/movies/${movie.id}`}
                              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border-default bg-surface-base px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Link>
                            <button
                              onClick={() => {
                                setEditingId(movie.id);
                                setEditingData({
                                  id: movie.id,
                                  douban_id: movie.douban_id || undefined,
                                  popularity: movie.popularity || undefined,
                                  vote_average: movie.vote_average || undefined,
                                  vote_count: movie.vote_count || undefined,
                                });
                              }}
                              className="flex items-center justify-center gap-1 rounded-lg border border-border-default bg-surface-base px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="flex items-center justify-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={libraryPage}
                totalPages={libraryTotalPages}
                onPageChange={setLibraryPage}
                totalItems={libraryTotal}
              />
            </>
          )}
        </>
      )}

      {/* TMDB IMPORT VIEW */}
      {viewMode === "import" && (
        <>
          {/* Locale Selection */}
          <div className="mb-6 rounded-2xl border border-border-default bg-surface-panel">
            <button
              onClick={() => setLocalesExpanded(!localesExpanded)}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-surface-hover"
            >
              <div>
                <Heading variant="label" as="h2" className="text-text-primary">
                  Translation Locales to Import
                </Heading>
                <p className="mt-1 text-xs text-text-muted">
                  {selectedLocales.length} of {SUPPORTED_LOCALES.length} locales selected
                </p>
              </div>
              {localesExpanded ? (
                <ChevronUp className="h-5 w-5 text-text-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 text-text-muted" />
              )}
            </button>

            {localesExpanded && (
              <div className="border-t border-border-default p-6 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={toggleAllLocales}
                    className="text-xs font-medium text-accent-primary hover:text-accent-primary/80"
                  >
                    {selectedLocales.length === SUPPORTED_LOCALES.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_LOCALES.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => toggleLocale(locale)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        selectedLocales.includes(locale)
                          ? "bg-accent-primary text-white"
                          : "border border-border-default bg-surface-base text-text-secondary hover:bg-surface-hover"
                      }`}
                    >
                      {locale}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  Movie titles, overviews, genres, person names, and character names will be fetched
                  in selected languages
                </p>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6 rounded-2xl border border-border-default bg-surface-panel p-4 sm:p-6">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 py-3 sm:gap-3 sm:px-4">
                <Search className="h-5 w-5 shrink-0 text-text-muted" />
                <input
                  ref={tmdbSearchInputRef}
                  type="text"
                  placeholder="Search for a movie by title on TMDB..."
                  value={tmdbSearchQuery}
                  onChange={(e) => setTmdbSearchQuery(e.target.value)}
                  onKeyPress={handleTmdbKeyPress}
                  className="min-w-0 flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleTmdbSearch(1)}
                disabled={isSearchingTmdb || !tmdbSearchQuery.trim()}
                className="flex shrink-0 items-center justify-center rounded-lg bg-accent-primary px-4 py-3 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:px-6"
                aria-label="Search TMDB"
              >
                {isSearchingTmdb ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Search Results Loading */}
          {isSearchingTmdb && <LoadingSpinner size="lg" message="Searching TMDB..." fullHeight />}

          {/* Search Results */}
          {!isSearchingTmdb && tmdbSearchResults.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Found {tmdbTotalResults.toLocaleString()} results • Page {tmdbPage} of{" "}
                  {tmdbTotalPages}
                </p>
                <LayoutToggle layoutMode={layoutMode} onLayoutChange={handleLayoutChange} />
              </div>

              {/* Results Grid */}
              <div className={getGridClass() + " mb-6"}>
                {tmdbSearchResults.map((movie) => {
                  const posterUrl = getImageUrl(movie.poster_path);

                  if (layoutMode === "list") {
                    // List view layout for TMDB results
                    return (
                      <div
                        key={movie.id}
                        className="group flex gap-4 overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-primary/50 hover:shadow-lg"
                      >
                        {/* Poster Thumbnail */}
                        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                          {posterUrl ? (
                            <ExternalImage
                              src={posterUrl}
                              alt={movie.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Film className="h-8 w-8 text-text-muted opacity-50" />
                            </div>
                          )}
                        </div>

                        {/* Movie Info */}
                        <div className="flex flex-1 flex-col">
                          <div className="mb-2 flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <Heading
                                variant="subsection"
                                as="h3"
                                className="mb-1 text-text-primary"
                              >
                                {movie.title}
                              </Heading>
                              {movie.original_title !== movie.title && (
                                <p className="mb-1 text-sm text-text-muted">
                                  {movie.original_title}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-sm text-text-muted">
                                {movie.release_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                  </div>
                                )}
                                {movie.vote_average && movie.vote_average > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    <span>{movie.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                                <span className="text-xs">TMDB ID: {movie.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Overview */}
                          {movie.overview && (
                            <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
                              {movie.overview}
                            </p>
                          )}

                          {/* Import Button or Already Imported State */}
                          {importedMovieIds.has(movie.id) ? (
                            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Already in Database
                            </div>
                          ) : (
                            <button
                              onClick={() => handleImport(movie)}
                              disabled={importingIds.has(movie.id)}
                              className="flex items-center justify-center gap-2 rounded-lg bg-accent-primary px-3 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            >
                              {importingIds.has(movie.id) ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  Importing...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Import to Database
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Grid view layout for TMDB results
                  return (
                    <div
                      key={movie.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-panel transition-all hover:border-accent-primary/50 hover:shadow-lg"
                    >
                      {/* Poster Image */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-raised">
                        {posterUrl ? (
                          <ExternalImage
                            src={posterUrl}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Film className="h-16 w-16 text-text-muted opacity-50" />
                          </div>
                        )}
                        {/* Rating Badge */}
                        {movie.vote_average && movie.vote_average > 0 && (
                          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-white">
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Movie Info - Flex grow to push button to bottom */}
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex-1">
                          <Heading
                            variant="label"
                            as="h3"
                            className="mb-1 line-clamp-2 text-text-primary"
                          >
                            {movie.title}
                          </Heading>
                          {movie.original_title !== movie.title && (
                            <p className="mb-1 line-clamp-1 text-xs text-text-muted">
                              {movie.original_title}
                            </p>
                          )}
                          <div className="mb-2 flex flex-col gap-1">
                            {movie.release_date && (
                              <div className="flex items-center gap-1 text-xs text-text-muted">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                              </div>
                            )}
                            <p className="text-xs text-text-muted">TMDB ID: {movie.id}</p>
                          </div>
                          {movie.overview && (
                            <p className="mb-3 line-clamp-2 text-xs text-text-secondary">
                              {movie.overview}
                            </p>
                          )}
                        </div>

                        {/* Import Button or Already Imported State - Always at bottom */}
                        <div className="mt-3 pt-3 border-t border-border-default">
                          {importedMovieIds.has(movie.id) ? (
                            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              in Database
                            </div>
                          ) : (
                            <button
                              onClick={() => handleImport(movie)}
                              disabled={importingIds.has(movie.id)}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-3 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            >
                              {importingIds.has(movie.id) ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  Importing...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Import
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={tmdbPage}
                totalPages={tmdbTotalPages}
                onPageChange={(page) => handleTmdbSearch(page)}
                totalItems={tmdbTotalResults}
              />
            </>
          )}

          {/* Empty State */}
          {!isSearchingTmdb && tmdbSearchResults.length === 0 && tmdbSearchQuery && (
            <EmptyState
              variant="default"
              icon={<Film className="h-12 w-12" />}
              title="No movies found"
              description="Try a different search query."
            />
          )}

          {/* Initial State */}
          {!isSearchingTmdb && tmdbSearchResults.length === 0 && !tmdbSearchQuery && (
            <EmptyState
              variant="default"
              icon={<Database className="h-12 w-12" />}
              title="Search TMDB"
              description="Enter a movie title above to search The Movie Database"
            />
          )}
        </>
      )}
    </div>
  );
}
