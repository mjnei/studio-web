"use client";

import { useState } from "react";
import { Film } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import type { ViewMode } from "./types";
import { useAdminMoviesLayout } from "./hooks/use-admin-movies-layout";
import { useMovieLibrary } from "./hooks/use-movie-library";
import { useTmdbImport } from "./hooks/use-tmdb-import";
import { ViewModeTabs } from "./components/ViewModeTabs";
import { MovieLibraryView } from "./components/MovieLibraryView";
import { TmdbImportView } from "./components/TmdbImportView";

export default function AdminMoviesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("library");
  const { layoutMode, handleLayoutChange } = useAdminMoviesLayout();

  const library = useMovieLibrary({ enabled: viewMode === "library" });

  const tmdbImport = useTmdbImport({
    enabled: viewMode === "import",
    isLibraryActive: viewMode === "library",
    onLibraryRefresh: library.loadMovies,
  });

  return (
    <div className="mx-auto max-w-7xl">
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

      <ViewModeTabs
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        libraryTotal={library.total}
      />

      {viewMode === "library" && (
        <MovieLibraryView
          movies={library.movies}
          isLoading={library.isLoading}
          searchTerm={library.searchTerm}
          onSearchTermChange={library.setSearchTerm}
          onSearchKeyPress={library.handleSearchKeyPress}
          page={library.page}
          totalPages={library.totalPages}
          total={library.total}
          onPageChange={library.setPage}
          selectedLocale={library.selectedLocale}
          onLocaleChange={library.setSelectedLocale}
          layoutMode={layoutMode}
          onLayoutChange={handleLayoutChange}
          editingId={library.editingId}
          editingData={library.editingData}
          onEditingDataChange={library.setEditingData}
          onStartEditing={library.startEditing}
          onCancelEditing={library.cancelEditing}
          onSave={library.handleUpdateMovie}
          onDelete={library.handleDeleteMovie}
          onSwitchToImport={() => setViewMode("import")}
        />
      )}

      {viewMode === "import" && (
        <TmdbImportView
          searchInputRef={tmdbImport.searchInputRef}
          searchQuery={tmdbImport.searchQuery}
          onSearchQueryChange={tmdbImport.setSearchQuery}
          onSearchKeyPress={tmdbImport.handleSearchKeyPress}
          onSearch={tmdbImport.handleSearch}
          searchResults={tmdbImport.searchResults}
          isSearching={tmdbImport.isSearching}
          page={tmdbImport.page}
          totalPages={tmdbImport.totalPages}
          totalResults={tmdbImport.totalResults}
          importingIds={tmdbImport.importingIds}
          importedMovieIds={tmdbImport.importedMovieIds}
          onImport={tmdbImport.handleImport}
          selectedLocales={tmdbImport.selectedLocales}
          localesExpanded={tmdbImport.localesExpanded}
          onLocalesExpandedChange={tmdbImport.setLocalesExpanded}
          onToggleLocale={tmdbImport.toggleLocale}
          onToggleAllLocales={tmdbImport.toggleAllLocales}
          layoutMode={layoutMode}
          onLayoutChange={handleLayoutChange}
        />
      )}
    </div>
  );
}
