"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Loader,
  Star,
  Calendar,
  Film,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import Image from "next/image";
import {
  searchTMDBMovies,
  importTMDBMovie,
  type TMDBMovieSearchResult,
} from "@/lib/api/admin";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

const SUPPORTED_LOCALES = ["en", "zh-CN", "zh-TW", "ja", "ko", "de", "fr", "es"];

export default function AdminTMDBPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovieSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());
  const [selectedLocales, setSelectedLocales] = useState<string[]>(SUPPORTED_LOCALES);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      showToast("error", "Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchTMDBMovies(searchQuery, page);
      setSearchResults(response.results);
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);

      if (response.results.length === 0) {
        showToast("info", "No movies found. Try a different search query.");
      }
    } catch (error: any) {
      showToast("error", error.message || "Failed to search movies");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(1);
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

  const getImageUrl = (path: string | null | undefined, size: "w500" | "w780" = "w500") => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
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
          <Database className="h-8 w-8 text-accent-primary" />
          <h1 className="text-3xl font-bold text-text-primary">TMDB Import</h1>
        </div>
        <p className="text-text-secondary">
          Search for movies on TMDB and import complete data including translations, genres, cast,
          and crew
        </p>
      </div>

      {/* Locale Selection */}
      <div className="mb-6 rounded-2xl border border-border-default bg-surface-panel p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">
            Translation Locales to Import
          </h2>
          <button
            onClick={toggleAllLocales}
            className="text-xs font-medium text-accent-primary hover:text-accent-primary/80"
          >
            {selectedLocales.length === SUPPORTED_LOCALES.length ? "Deselect All" : "Select All"}
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
          Selected locales ({selectedLocales.length}): Movie titles, overviews, genres, person
          names, and character names will be fetched in these languages
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 rounded-2xl border border-border-default bg-surface-panel p-6">
        <div className="flex gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-border-default bg-surface-base px-4 py-3">
            <Search className="h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search for a movie by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleSearch(1)}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-3 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? (
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
      {searchResults.length > 0 && (
        <>
          {/* Results Info */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Found {totalResults.toLocaleString()} results • Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            {searchResults.map((movie) => {
              const posterUrl = getImageUrl(movie.poster_path);
              const isImporting = importingIds.has(movie.id);

              return (
                <div
                  key={movie.id}
                  className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface-panel transition-all hover:border-accent-primary/50 hover:shadow-lg"
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

                  {/* Movie Info */}
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-text-primary">
                      {movie.title}
                    </h3>
                    {movie.original_title !== movie.title && (
                      <p className="mb-1 text-xs text-text-muted line-clamp-1">
                        {movie.original_title}
                      </p>
                    )}
                    {movie.release_date && (
                      <div className="mb-2 flex items-center gap-1 text-xs text-text-muted">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    )}
                    {movie.overview && (
                      <p className="mb-3 line-clamp-2 text-xs text-text-secondary">
                        {movie.overview}
                      </p>
                    )}

                    {/* Import Button */}
                    <button
                      onClick={() => handleImport(movie)}
                      disabled={isImporting}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-3 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isImporting ? (
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

                    {/* TMDB ID */}
                    <p className="mt-2 text-center text-xs text-text-muted">ID: {movie.id}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-8">
              <button
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage === 1 || isSearching}
                className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleSearch(pageNum)}
                      disabled={isSearching}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                        pageNum === currentPage
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
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage === totalPages || isSearching}
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
      {!isSearching && searchResults.length === 0 && searchQuery && (
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
      {!isSearching && searchResults.length === 0 && !searchQuery && (
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
    </div>
  );
}
