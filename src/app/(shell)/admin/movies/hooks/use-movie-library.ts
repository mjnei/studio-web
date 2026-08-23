"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminListMovies,
  adminUpdateMovie,
  adminDeleteMovie,
  type AdminMovieResponse,
} from "@/lib/api/admin";
import { useToast } from "@/components/ui/toast";
import { LIBRARY_PAGE_SIZE } from "../constants";
import type { EditingMovie } from "../types";

type UseMovieLibraryOptions = {
  enabled: boolean;
};

export function useMovieLibrary({ enabled }: UseMovieLibraryOptions) {
  const toast = useToast();

  const [movies, setMovies] = useState<AdminMovieResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingMovie | null>(null);

  const loadMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminListMovies({
        query: searchTerm || undefined,
        locale: selectedLocale,
        page,
        page_size: LIBRARY_PAGE_SIZE,
        sort_by: "popularity",
        sort_order: "desc",
      });
      setMovies(response.movies);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / response.page_size));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load movies";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedLocale, page, toast]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const doLoad = async () => {
      setIsLoading(true);
      try {
        const response = await adminListMovies({
          query: searchTerm || undefined,
          locale: selectedLocale,
          page,
          page_size: LIBRARY_PAGE_SIZE,
          sort_by: "popularity",
          sort_order: "desc",
        });
        if (isMounted) {
          setMovies(response.movies);
          setTotal(response.total);
          setTotalPages(Math.ceil(response.total / response.page_size));
        }
      } catch (error: unknown) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Failed to load movies";
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    doLoad();

    return () => {
      isMounted = false;
    };
  }, [enabled, page, searchTerm, selectedLocale, toast]);

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

  const handleSearch = () => {
    setPage(1);
    loadMovies();
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const startEditing = (movie: AdminMovieResponse) => {
    setEditingId(movie.id);
    setEditingData({
      id: movie.id,
      douban_id: movie.douban_id || undefined,
      popularity: movie.popularity || undefined,
      vote_average: movie.vote_average || undefined,
      vote_count: movie.vote_count || undefined,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData(null);
  };

  return {
    movies,
    isLoading,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    total,
    selectedLocale,
    setSelectedLocale,
    editingId,
    editingData,
    setEditingData,
    loadMovies,
    handleDeleteMovie,
    handleUpdateMovie,
    handleSearch,
    handleSearchKeyPress,
    startEditing,
    cancelEditing,
  };
}
