import { Film, Calendar, Star, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ExternalImage } from "@/components/ui/ExternalImage";
import { Heading } from "@/components/ui/heading";
import type { LayoutMode } from "@/components/ui/LayoutToggle";
import type { TMDBMovieSearchResult } from "@/lib/api/admin";
import { getTmdbImageUrl } from "../utils";

type TmdbMovieCardProps = {
  movie: TMDBMovieSearchResult;
  layoutMode: LayoutMode;
  isImported: boolean;
  isImporting: boolean;
  onImport: () => void;
};

export function TmdbMovieCard({
  movie,
  layoutMode,
  isImported,
  isImporting,
  onImport,
}: TmdbMovieCardProps) {
  const posterUrl = getTmdbImageUrl(movie.poster_path);

  if (layoutMode === "list") {
    return (
      <div className="group flex gap-4 overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-primary/50 hover:shadow-lg">
        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-raised">
          {posterUrl ? (
            <ExternalImage src={posterUrl} alt={movie.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Film className="h-8 w-8 text-text-muted opacity-50" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex-1">
              <Heading variant="subsection" as="h3" className="mb-1 text-text-primary">
                {movie.title}
              </Heading>
              {movie.original_title !== movie.title && (
                <p className="mb-1 text-body text-text-muted">{movie.original_title}</p>
              )}
              <div className="flex items-center gap-3 text-body text-text-muted">
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
                <span className="text-caption">TMDB ID: {movie.id}</span>
              </div>
            </div>
          </div>

          {movie.overview && (
            <p className="mb-3 line-clamp-2 text-body text-text-secondary">{movie.overview}</p>
          )}

          {isImported ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-body font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Already in Database
            </div>
          ) : (
            <Button
              size="sm"
              onClick={onImport}
              disabled={isImporting}
              leftIcon={
                isImporting ? <Spinner size="sm" /> : <Download className="h-4 w-4" />
              }
            >
              {isImporting ? "Importing..." : "Import to Database"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-panel transition-all hover:border-accent-primary/50 hover:shadow-lg">
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
        {movie.vote_average && movie.vote_average > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-caption font-semibold text-white">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <Heading variant="label" as="h3" className="mb-1 line-clamp-2 text-text-primary">
            {movie.title}
          </Heading>
          {movie.original_title !== movie.title && (
            <p className="mb-1 line-clamp-1 text-caption text-text-muted">{movie.original_title}</p>
          )}
          <div className="mb-2 flex flex-col gap-1">
            {movie.release_date && (
              <div className="flex items-center gap-1 text-caption text-text-muted">
                <Calendar className="h-3 w-3" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            )}
            <p className="text-caption text-text-muted">TMDB ID: {movie.id}</p>
          </div>
          {movie.overview && (
            <p className="mb-3 line-clamp-2 text-caption text-text-secondary">{movie.overview}</p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border-default">
          {isImported ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-body font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              in Database
            </div>
          ) : (
            <Button
              size="sm"
              fullWidth
              onClick={onImport}
              disabled={isImporting}
              leftIcon={
                isImporting ? <Spinner size="sm" /> : <Download className="h-4 w-4" />
              }
            >
              {isImporting ? "Importing..." : "Import"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
