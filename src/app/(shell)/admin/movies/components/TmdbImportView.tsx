import { Film, Search, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import type { TMDBMovieSearchResult } from "@/lib/api/admin";
import { getGridClass } from "../utils";
import { LocaleImportSelector } from "./LocaleImportSelector";
import { TmdbMovieCard } from "./TmdbMovieCard";

type TmdbImportViewProps = {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchKeyPress: (e: React.KeyboardEvent) => void;
  onSearch: (page?: number) => void;
  searchResults: TMDBMovieSearchResult[];
  isSearching: boolean;
  page: number;
  totalPages: number;
  totalResults: number;
  importingIds: Set<number>;
  importedMovieIds: Set<number>;
  onImport: (movie: TMDBMovieSearchResult) => void;
  selectedLocales: string[];
  localesExpanded: boolean;
  onLocalesExpandedChange: (expanded: boolean) => void;
  onToggleLocale: (locale: string) => void;
  onToggleAllLocales: () => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
};

export function TmdbImportView({
  searchInputRef,
  searchQuery,
  onSearchQueryChange,
  onSearchKeyPress,
  onSearch,
  searchResults,
  isSearching,
  page,
  totalPages,
  totalResults,
  importingIds,
  importedMovieIds,
  onImport,
  selectedLocales,
  localesExpanded,
  onLocalesExpandedChange,
  onToggleLocale,
  onToggleAllLocales,
  layoutMode,
  onLayoutChange,
}: TmdbImportViewProps) {
  return (
    <>
      <LocaleImportSelector
        selectedLocales={selectedLocales}
        expanded={localesExpanded}
        onExpandedChange={onLocalesExpandedChange}
        onToggleLocale={onToggleLocale}
        onToggleAll={onToggleAllLocales}
      />

      <div className="mb-6 rounded-2xl border border-border-default bg-surface-panel p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 py-3 sm:gap-3 sm:px-4">
            <Search className="h-4 w-4 shrink-0 text-text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a movie by title on TMDB..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={onSearchKeyPress}
              disabled={isSearching}
              className="min-w-0 flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none disabled:opacity-50"
            />
          </div>
          <Button
            size="icon"
            onClick={() => onSearch(1)}
            disabled={isSearching || !searchQuery.trim()}
            aria-label="Search TMDB"
            className="shrink-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isSearching && <LoadingSpinner size="lg" message="Searching TMDB..." fullHeight />}

      {!isSearching && searchResults.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-body text-text-secondary">
              Found {totalResults.toLocaleString()} results • Page {page} of {totalPages}
            </p>
            <LayoutToggle layoutMode={layoutMode} onLayoutChange={onLayoutChange} />
          </div>

          <div className={getGridClass(layoutMode) + " mb-6"}>
            {searchResults.map((movie) => (
              <TmdbMovieCard
                key={movie.id}
                movie={movie}
                layoutMode={layoutMode}
                isImported={importedMovieIds.has(movie.id)}
                isImporting={importingIds.has(movie.id)}
                onImport={() => onImport(movie)}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => onSearch(p)}
            totalItems={totalResults}
          />
        </>
      )}

      {!isSearching && searchResults.length === 0 && searchQuery && (
        <EmptyState
          variant="default"
          icon={<Film aria-hidden />}
          title="No movies found"
          description="Try a different search query."
        />
      )}

      {!isSearching && searchResults.length === 0 && !searchQuery && (
        <EmptyState
          variant="default"
          icon={<Database aria-hidden />}
          title="Search TMDB"
          description="Enter a movie title above to search The Movie Database"
        />
      )}
    </>
  );
}
