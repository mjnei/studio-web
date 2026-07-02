"use client";

import { useState, useEffect, useRef } from "react";
import {
  Film,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Search,
  Loader,
  Star,
  Calendar,
  Download,
  Database,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Grid3x3,
  Grid2x2,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  adminListMovies,
  adminUpdateMovie,
  adminDeleteMovie,
  searchTMDBMovies,
  importTMDBMovie,
  type TMDBMovieSearchResult,
  type AdminMovieResponse,
} from "@/lib/api/admin";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

type ViewMode = "library" | "import";

type LayoutMode = "grid-sm" | "grid-md" | "grid-lg" | "list";

type EditingMovie = {
  id: number;
  douban_id?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
};

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "zh-CN", "zh-TW", "ja", "ko"];

export default function AdminMoviesPage() {
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
  const [importedMovieIds, setImportedMovieIds] = useState<Set<number>>(new Set()); // Track newly imported movies

  // Common state
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (viewMode === "library") {
      loadMovies();
    } else if (viewMode === "import") {
      // Auto-focus on search input when switching to import tab
      setTimeout(() => {
        tmdbSearchInputRef.current?.focus();
      }, 100);
    }
  }, [viewMode, libraryPage, librarySearchTerm, selectedLocale]);

  const loadMovies = async () => {
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
    } catch (error: any) {
      showToast("error", error.message || "Failed to load movies");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // TMDB Search handlers
  const handleTmdbSearch = async (page: number = 1) => {
    if (!tmdbSearchQuery.trim()) {
      showToast("error", "Please enter a search query");
      return;
    }

    // Blur the input after search
    tmdbSearchInputRef.current?.blur();

    setIsSearchingTmdb(true);
    try {
      const response = await searchTMDBMovies(tmdbSearchQuery, page);
      setTmdbSearchResults(response.results);
      setTmdbPage(response.page);
      setTmdbTotalPages(response.total_pages);
      setTmdbTotalResults(response.total_results);

      if (response.results.length === 0) {
        showToast("info", "No movies found. Try a different search query.");
      } else {
        // Check which of the search results are already in the database
        // We'll fetch all library movies in batches (max 100 per request)
        const allExistingIds = new Set<number>();
        let libraryPage = 1;
        let hasMore = true;

        while (hasMore && libraryPage <= 10) {
          // Limit to 1000 movies max for performance
          try {
            const libraryResponse = await adminListMovies({
              page: libraryPage,
              page_size: 100,
            });
            libraryResponse.movies.forEach((m) => allExistingIds.add(m.id));
            hasMore = libraryResponse.movies.length === 100;
            libraryPage++;
          } catch (error) {
            console.error("Error fetching library for comparison:", error);
            break;
          }
        }

        // Initialize imported set with existing movies from search results
        const initialImported = new Set(importedMovieIds);
        response.results.forEach((movie) => {
          if (allExistingIds.has(movie.id)) {
            initialImported.add(movie.id);
          }
        });
        setImportedMovieIds(initialImported);
      }
    } catch (error: any) {
      showToast("error", error.message || "Failed to search movies");
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
      showToast("success", response.message);

      // Track this movie as imported (whether new or existing)
      setImportedMovieIds((prev) => new Set(prev).add(movie.id));

      // Reload library if in library mode
      if (viewMode === "library") {
        loadMovies();
      }
    } catch (error: any) {
      showToast("error", error.message || "Failed to import movie");
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

  // Library handlers
  const handleDeleteMovie = async (movieId: number) => {
    if (
      !confirm(
        "Delete this movie? This will cascade delete all related data (translations, cast, etc.). This action cannot be undone."
      )
    )
      return;
    try {
      await adminDeleteMovie(movieId);
      showToast("success", "Movie deleted successfully");
      await loadMovies();
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete movie");
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
      showToast("success", "Movie updated successfully");
      setEditingId(null);
      setEditingData(null);
      await loadMovies();
    } catch (error: any) {
      showToast("error", error.message || "Failed to update movie");
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

  // Layout toggle component (reused in both library and TMDB sections)
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
        title="Medium grid (4 columns)"
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
        title="Large grid (3 columns)"
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

  const getGridClass = () => {
    switch (layoutMode) {
      case "grid-sm":
        // Small cards: 3 cols (sm), 4 cols (md), 5 cols (lg), 6 cols (xl)
        return "grid gap-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "grid-md":
        // Medium cards: 2 cols (base), 3 cols (md), 4 cols (lg)
        return "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "grid-lg":
        // Large cards: 2 cols (base), 2 cols (md), 3 cols (lg)
        return "grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
      case "list":
        return "space-y-4";
      default:
        return "grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
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
              <CheckCircle2 className="h-5 w-5" />
            ) : toast.type === "error" ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Film className="h-8 w-8 text-accent-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Movie Management</h1>
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
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
              <Search className="h-5 w-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search movies by title..."
                value={librarySearchTerm}
                onChange={(e) => setLibrarySearchTerm(e.target.value)}
                onKeyPress={handleLibraryKeyPress}
                className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Layout Mode Toggle */}
              <LayoutToggle />
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
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader className="h-8 w-8 animate-spin text-accent-primary" />
                <p className="text-sm text-text-muted">Loading movies...</p>
              </div>
            </div>
          ) : movies.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
              <div className="text-center">
                <Film className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-3" />
                <p className="text-sm text-text-primary font-medium mb-1">No movies found</p>
                <p className="text-sm text-text-muted mb-3">
                  {librarySearchTerm
                    ? "Try a different search query"
                    : "Import movies from TMDB to get started"}
                </p>
                {!librarySearchTerm && (
                  <button
                    onClick={() => setViewMode("import")}
                    className="mx-auto flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Import from TMDB
                  </button>
                )}
              </div>
            </div>
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
                            <Image
                              src={posterUrl}
                              alt={movie.title || movie.original_title}
                              fill
                              className="object-cover"
                              unoptimized
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
                              <h3 className="mb-1 text-base font-semibold text-text-primary">
                                {movie.title || movie.original_title}
                              </h3>
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
                          <Image
                            src={posterUrl}
                            alt={movie.title || movie.original_title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            unoptimized
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
                          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-text-primary">
                            {movie.title || movie.original_title}
                          </h3>
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
              {libraryTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-8">
                  <button
                    onClick={() => setLibraryPage((p) => Math.max(1, p - 1))}
                    disabled={libraryPage === 1}
                    className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, libraryTotalPages) }, (_, i) => {
                      let pageNum;
                      if (libraryTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (libraryPage <= 3) {
                        pageNum = i + 1;
                      } else if (libraryPage >= libraryTotalPages - 2) {
                        pageNum = libraryTotalPages - 4 + i;
                      } else {
                        pageNum = libraryPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setLibraryPage(pageNum)}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                            pageNum === libraryPage
                              ? "bg-accent-primary text-white"
                              : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setLibraryPage((p) => Math.min(libraryTotalPages, p + 1))}
                    disabled={libraryPage === libraryTotalPages}
                    className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
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
                <h2 className="text-sm font-semibold text-text-primary">
                  Translation Locales to Import
                </h2>
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
          <div className="mb-6 rounded-2xl border border-border-default bg-surface-panel p-6">
            <div className="flex gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-border-default bg-surface-base px-4 py-3">
                <Search className="h-5 w-5 text-text-muted" />
                <input
                  ref={tmdbSearchInputRef}
                  type="text"
                  placeholder="Search for a movie by title on TMDB..."
                  value={tmdbSearchQuery}
                  onChange={(e) => setTmdbSearchQuery(e.target.value)}
                  onKeyPress={handleTmdbKeyPress}
                  className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleTmdbSearch(1)}
                disabled={isSearchingTmdb || !tmdbSearchQuery.trim()}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-3 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSearchingTmdb ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {tmdbSearchResults.length > 0 && (
            <>
              {/* Results Info and Layout Toggle */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Found {tmdbTotalResults.toLocaleString()} results • Page {tmdbPage} of{" "}
                  {tmdbTotalPages}
                </p>
                <LayoutToggle />
              </div>

              {/* Results Grid */}
              <div className={getGridClass() + " mb-6"}>
                {tmdbSearchResults.map((movie) => {
                  const posterUrl = getImageUrl(movie.poster_path);
                  const isImporting = importingIds.has(movie.id);

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
                            <Image
                              src={posterUrl}
                              alt={movie.title}
                              fill
                              className="object-cover"
                              unoptimized
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
                              <h3 className="mb-1 text-base font-semibold text-text-primary">
                                {movie.title}
                              </h3>
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
                          <Image
                            src={posterUrl}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            unoptimized
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
                          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-text-primary">
                            {movie.title}
                          </h3>
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
              {tmdbTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-8">
                  <button
                    onClick={() => handleTmdbSearch(tmdbPage - 1)}
                    disabled={tmdbPage === 1 || isSearchingTmdb}
                    className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, tmdbTotalPages) }, (_, i) => {
                      let pageNum;
                      if (tmdbTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (tmdbPage <= 3) {
                        pageNum = i + 1;
                      } else if (tmdbPage >= tmdbTotalPages - 2) {
                        pageNum = tmdbTotalPages - 4 + i;
                      } else {
                        pageNum = tmdbPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleTmdbSearch(pageNum)}
                          disabled={isSearchingTmdb}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                            pageNum === tmdbPage
                              ? "bg-accent-primary text-white"
                              : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleTmdbSearch(tmdbPage + 1)}
                    disabled={tmdbPage === tmdbTotalPages || isSearchingTmdb}
                    className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isSearchingTmdb && tmdbSearchResults.length === 0 && tmdbSearchQuery && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
              <div className="text-center">
                <Film className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-3" />
                <p className="text-sm text-text-muted">
                  No movies found. Try a different search query.
                </p>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!isSearchingTmdb && tmdbSearchResults.length === 0 && !tmdbSearchQuery && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
              <div className="text-center">
                <Database className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-3" />
                <p className="text-sm text-text-primary font-medium mb-1">Search TMDB</p>
                <p className="text-sm text-text-muted">
                  Enter a movie title above to search The Movie Database
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
