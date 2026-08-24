import { Film, Search, Download } from "lucide-react";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminMovieResponse } from "@/lib/api/admin";
import { SUPPORTED_LOCALES } from "../constants";
import type { EditingMovie } from "../types";
import { getGridClass } from "../utils";
import { LibraryMovieCard } from "./LibraryMovieCard";

type MovieLibraryViewProps = {
  movies: AdminMovieResponse[];
  isLoading: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearchKeyPress: (e: React.KeyboardEvent) => void;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  selectedLocale: string;
  onLocaleChange: (locale: string) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  editingId: number | null;
  editingData: EditingMovie | null;
  onEditingDataChange: (data: EditingMovie) => void;
  onStartEditing: (movie: AdminMovieResponse) => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onDelete: (movieId: number) => void;
  onSwitchToImport: () => void;
};

export function MovieLibraryView({
  movies,
  isLoading,
  searchTerm,
  onSearchTermChange,
  onSearchKeyPress,
  page,
  totalPages,
  total,
  onPageChange,
  selectedLocale,
  onLocaleChange,
  layoutMode,
  onLayoutChange,
  editingId,
  editingData,
  onEditingDataChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  onDelete,
  onSwitchToImport,
}: MovieLibraryViewProps) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search movies by title..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyPress={onSearchKeyPress}
          icon={<Search className="h-4 w-4" />}
          wrapperClassName="min-w-0 flex-1"
        />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <LayoutToggle layoutMode={layoutMode} onLayoutChange={onLayoutChange} />
          <span className="text-body text-text-muted">Locale:</span>
          <Select
            size="sm"
            value={selectedLocale}
            onChange={onLocaleChange}
            options={SUPPORTED_LOCALES.map((locale) => ({ value: locale, label: locale }))}
            className="w-[8.5rem]"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" message="Loading movies..." fullHeight />
      ) : movies.length === 0 ? (
        <EmptyState
          variant="default"
          icon={<Film aria-hidden />}
          title="No movies found"
          description={
            searchTerm ? "Try a different search query" : "Import movies from TMDB to get started"
          }
          action={
            !searchTerm && (
              <Button
                variant="primary"
                size="md"
                onClick={onSwitchToImport}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Import from TMDB
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className={getGridClass(layoutMode) + " mb-6"}>
            {movies.map((movie) => (
              <LibraryMovieCard
                key={movie.id}
                movie={movie}
                layoutMode={layoutMode}
                isEditing={editingId === movie.id}
                editingData={editingId === movie.id ? editingData : null}
                onEditingDataChange={onEditingDataChange}
                onStartEditing={() => onStartEditing(movie)}
                onCancelEditing={onCancelEditing}
                onSave={onSave}
                onDelete={() => onDelete(movie.id)}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={total}
          />
        </>
      )}
    </>
  );
}
