import { Film, Trash2, Edit2, Calendar, Star, Save, X, Eye } from "lucide-react";
import Link from "next/link";
import { ExternalImage } from "@/components/ui/ExternalImage";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import type { LayoutMode } from "@/components/ui/LayoutToggle";
import type { AdminMovieResponse } from "@/lib/api/admin";
import type { EditingMovie } from "../types";
import { getTmdbImageUrl } from "../utils";

type LibraryMovieCardProps = {
  movie: AdminMovieResponse;
  layoutMode: LayoutMode;
  isEditing: boolean;
  editingData: EditingMovie | null;
  onEditingDataChange: (data: EditingMovie) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onDelete: () => void;
};

export function LibraryMovieCard({
  movie,
  layoutMode,
  isEditing,
  editingData,
  onEditingDataChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  onDelete,
}: LibraryMovieCardProps) {
  const posterUrl = getTmdbImageUrl(movie.poster_path);

  if (layoutMode === "list") {
    return (
      <div className="group flex gap-4 overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-primary/50 hover:shadow-lg">
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

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex-1">
              <Heading variant="subsection" as="h3" className="mb-1 text-text-primary">
                {movie.title || movie.original_title}
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
                <span className="text-caption">ID: {movie.id}</span>
                {movie.douban_id && <span className="text-caption">Douban: {movie.douban_id}</span>}
              </div>
            </div>

            {isEditing && editingData ? (
              <div className="flex gap-2">
                <button
                  onClick={onSave}
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-body font-medium text-white hover:bg-green-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </button>
                <button
                  onClick={onCancelEditing}
                  className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body font-medium text-text-secondary hover:bg-surface-hover"
                  aria-label="Cancel editing"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href={`/admin/movies/${movie.id}`}
                  className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
                <button
                  onClick={onStartEditing}
                  className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-body font-medium text-red-600 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {movie.overview && (
            <p className="mb-2 line-clamp-2 text-body text-text-secondary">{movie.overview}</p>
          )}

          {isEditing && editingData && (
            <div className="mt-2 rounded-lg border border-border-default bg-surface-base p-3">
              <Input
                label="Douban ID"
                labelTone="meta"
                type="text"
                value={editingData.douban_id || ""}
                onChange={(e) =>
                  onEditingDataChange({ ...editingData, douban_id: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
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
            alt={movie.title || movie.original_title}
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
            {movie.title || movie.original_title}
          </Heading>
          {movie.original_title !== movie.title && (
            <p className="mb-1 text-caption text-text-muted line-clamp-1">{movie.original_title}</p>
          )}
          <div className="mb-2 flex flex-col gap-1">
            {movie.release_date && (
              <div className="flex items-center gap-1 text-caption text-text-muted">
                <Calendar className="h-3 w-3" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-caption text-text-muted">
              <span>ID: {movie.id}</span>
              {movie.douban_id && <span>Douban: {movie.douban_id}</span>}
            </div>
          </div>
          {movie.overview && (
            <p className="mb-3 line-clamp-2 text-caption text-text-secondary">{movie.overview}</p>
          )}
        </div>

        {isEditing && editingData ? (
          <div className="mt-3 pt-3 border-t border-border-default space-y-2">
            <Input
              label="Douban ID"
              labelTone="meta"
              type="text"
              value={editingData.douban_id || ""}
              onChange={(e) => onEditingDataChange({ ...editingData, douban_id: e.target.value })}
              placeholder="Optional"
            />
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-1.5 text-caption font-medium text-white hover:bg-green-700"
              >
                <Save className="h-3 w-3" />
                Save
              </button>
              <button
                onClick={onCancelEditing}
                className="flex items-center justify-center gap-1 rounded-lg border border-border-default bg-surface-base px-2 py-1.5 text-caption font-medium text-text-secondary hover:bg-surface-hover"
                aria-label="Cancel editing"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-border-default flex gap-2">
            <Link
              href={`/admin/movies/${movie.id}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border-default bg-surface-base px-2 py-1.5 text-caption font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
            >
              <Eye className="h-3 w-3" />
              View
            </Link>
            <button
              onClick={onStartEditing}
              className="flex items-center justify-center gap-1 rounded-lg border border-border-default bg-surface-base px-2 py-1.5 text-caption font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-2 py-1.5 text-caption font-medium text-red-600 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
