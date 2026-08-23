"use client";

import { useState, useRef, useEffect } from "react";
import {
  adminListMovies,
  searchTMDBMovies,
  importTMDBMovie,
  type TMDBMovieSearchResult,
} from "@/lib/api/admin";
import { useToast } from "@/components/ui/toast";
import { SUPPORTED_LOCALES } from "../constants";

type UseTmdbImportOptions = {
  enabled: boolean;
  isLibraryActive: boolean;
  onLibraryRefresh: () => Promise<void>;
};

export function useTmdbImport({ enabled, isLibraryActive, onLibraryRefresh }: UseTmdbImportOptions) {
  const toast = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovieSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());
  const [selectedLocales, setSelectedLocales] = useState<string[]>(SUPPORTED_LOCALES);
  const [importedMovieIds, setImportedMovieIds] = useState<Set<number>>(new Set());
  const [localesExpanded, setLocalesExpanded] = useState(false);

  useEffect(() => {
    if (enabled) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [enabled]);

  const handleSearch = async (searchPage: number = 1) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    searchInputRef.current?.blur();

    setIsSearching(true);
    try {
      const response = await searchTMDBMovies(searchQuery, searchPage);
      setSearchResults(response.results);
      setPage(response.page);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);

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
      toast.success(response.message);

      setImportedMovieIds((prev) => new Set(prev).add(movie.id));

      if (isLibraryActive) {
        await onLibraryRefresh();
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

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
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

  return {
    searchInputRef,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    page,
    totalPages,
    totalResults,
    importingIds,
    selectedLocales,
    importedMovieIds,
    localesExpanded,
    setLocalesExpanded,
    handleSearch,
    handleImport,
    handleSearchKeyPress,
    toggleLocale,
    toggleAllLocales,
  };
}
