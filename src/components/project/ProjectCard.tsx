import Link from "next/link";
import { Folder, Trash2, Clock, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tmdbImageUrl, type ProjectResponse } from "@/lib/project-client";

interface ProjectCardProps {
  project: ProjectResponse;
  showDelete?: boolean;
  onDelete?: (project: ProjectResponse) => void;
  layoutMode?: "grid-sm" | "grid-md" | "list";
}

export function ProjectCard({
  project,
  showDelete = false,
  onDelete,
  layoutMode = "grid-md",
}: ProjectCardProps) {
  const handleDeleteClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Release any pointer capture before triggering state change
    if ("pointerId" in e && e.currentTarget instanceof Element) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture wasn't active
      }
    }

    onDelete?.(project);
  };

  const projectName = project.project_name || project.movie?.title || "Untitled project";
  const movieTitle = project.movie?.title;

  // Render list view
  if (layoutMode === "list") {
    return (
      <Link
        href={`/project/${project.id}/${project.last_step}`}
        className="group flex gap-4 overflow-hidden rounded-xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-cyan/50 hover:bg-surface-raised hover:shadow-lg hover:shadow-accent-cyan/5"
      >
        {/* Project Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div>
            <h3 className="mb-1.5 text-base font-bold text-text-primary transition-colors group-hover:text-accent-cyan">
              {projectName}
            </h3>

            {/* Movie title if different from project name */}
            {movieTitle && projectName !== movieTitle && (
              <p className="mb-2 text-sm text-text-muted">
                Based on: <span className="text-text-secondary">{movieTitle}</span>
              </p>
            )}

            {/* Status Badge - only 1 tag */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  project.status === "completed"
                    ? "success"
                    : project.status === "in-progress"
                      ? "info"
                      : "default"
                }
                size="sm"
              >
                {project.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                {project.status}
              </Badge>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        {showDelete && onDelete && (
          <button
            onPointerDown={handleDeleteClick}
            className="flex-shrink-0 self-start rounded-lg border border-border-default bg-surface-elevated/90 p-2 text-text-secondary backdrop-blur-sm transition-all duration-200 hover:border-status-error hover:bg-status-error/10 hover:text-status-error focus-ring touch-none"
            aria-label="Delete project"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </Link>
    );
  }

  // Render grid view (grid-sm or grid-md)
  return (
    <div className="group relative overflow-hidden rounded-xl">
      <Link href={`/project/${project.id}/${project.last_step}`}>
        <Card variant="elevated" padding="none" interactive className="overflow-hidden">
          <div className="aspect-video bg-surface-raised relative">
            {/* Priority: 1. Final composed thumbnail, 2. Custom, 3. AI base, 4. TMDB backdrop, 5. TMDB poster, 6. Placeholder */}
            {project.thumbnail?.final_url ||
            project.thumbnail?.custom_image_url ||
            (project.thumbnail?.base_image_url &&
              project.thumbnail?.base_image_status === "completed") ? (
              <img
                src={
                  project.thumbnail?.final_url ||
                  project.thumbnail?.custom_image_url ||
                  project.thumbnail?.base_image_url ||
                  ""
                }
                alt={project.project_name || project.movie?.title || "Project thumbnail"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback to TMDB image if thumbnail fails to load
                  const img = e.target as HTMLImageElement;
                  const backdropOrPoster =
                    project.movie?.backdrop_path ?? project.movie?.poster_path;
                  if (backdropOrPoster) {
                    const fallbackUrl = tmdbImageUrl(backdropOrPoster, "w780");
                    if (fallbackUrl) {
                      img.src = fallbackUrl;
                    } else {
                      img.style.display = "none";
                    }
                  } else {
                    // Hide image on error, will show placeholder
                    img.style.display = "none";
                  }
                }}
              />
            ) : project.movie?.backdrop_path || project.movie?.poster_path ? (
              <img
                src={
                  tmdbImageUrl(project.movie.backdrop_path ?? project.movie.poster_path, "w780") ||
                  ""
                }
                alt={project.movie?.title ?? "Project movie"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Hide image on error, will show placeholder
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Folder className="h-10 w-10 text-text-muted" />
              </div>
            )}
            {/* Show generating indicator if thumbnail is in progress */}
            {project.thumbnail?.base_image_status === "generating" && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white">
                  <svg
                    className="h-8 w-8 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-xs font-medium">Generating thumbnail...</span>
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-text-primary truncate">
                  {project.project_name || project.movie?.title || "Untitled project"}
                </h2>
                {showDelete ? (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      variant={
                        project.status === "completed"
                          ? "success"
                          : project.status === "in-progress"
                            ? "info"
                            : "default"
                      }
                      size="sm"
                    >
                      {project.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                      {project.status}
                    </Badge>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-text-muted">
                    Step: {project.last_step} • {project.status}
                  </p>
                )}
              </div>
              {showDelete && (
                <div className="flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Delete Button - always visible on mobile, appears on hover on desktop */}
      {showDelete && onDelete && (
        <button
          onPointerDown={handleDeleteClick}
          className="absolute top-2 right-2 p-2 rounded-lg bg-surface-elevated/90 backdrop-blur-sm border border-border-default opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-status-error/10 hover:border-status-error hover:text-status-error text-text-secondary transition-all duration-200 focus-ring touch-none"
          aria-label="Delete project"
          title="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
