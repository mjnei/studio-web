"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Folder, Trash2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { ExternalImage } from "@/components/ui/ExternalImage";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { tmdbImageUrl, type ProjectResponse } from "@/lib/project-client";
import { useI18n } from "@/i18n";

interface ProjectCardProps {
  project: ProjectResponse;
  showDelete?: boolean;
  onDelete?: (project: ProjectResponse) => void;
  layoutMode?: "grid-sm" | "grid-md" | "list";
  /** Eager-load cover image when above the fold (LCP). */
  priority?: boolean;
}

function formatProjectStatus(status: string, t: ReturnType<typeof useI18n>["t"]) {
  const statusMap: Record<string, string> = {
    completed: "project.status.completed",
    "in-progress": "project.status.inProgress",
    draft: "project.status.draft",
    processing: "project.status.processing",
    queued: "project.status.queued",
    failed: "project.status.failed",
    generating: "project.status.generating",
  };
  return statusMap[status] ? t(statusMap[status]) : status;
}

export function ProjectCard({
  project,
  showDelete = false,
  onDelete,
  layoutMode = "grid-md",
  priority = false,
}: ProjectCardProps) {
  const { t } = useI18n();

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

  const projectName =
    project.project_name || project.movie?.title || t("project.common.untitledProjectLower");
  const movieTitle = project.movie?.title;
  const statusLabel = formatProjectStatus(project.status, t);
  const createdDate = new Date(project.created_at).toLocaleDateString();
  const updatedDate = new Date(project.updated_at).toLocaleDateString();

  // Render list view
  if (layoutMode === "list") {
    return (
      <Link
        href={`/project/${project.id}`}
        className="group flex gap-4 overflow-hidden rounded-xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-cyan/50 hover:bg-surface-raised hover:shadow-lg hover:shadow-accent-cyan/5"
      >
        {/* Project Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div>
            <Heading
              variant="subsection"
              as="h3"
              className="mb-1.5 text-text-primary transition-colors group-hover:text-accent-cyan"
            >
              {projectName}
            </Heading>

            {/* Movie title if different from project name */}
            {movieTitle && projectName !== movieTitle && (
              <Text variant="body" className="mb-2 text-text-muted">
                {t("project.card.basedOn")}{" "}
                <span className="text-text-secondary">{movieTitle}</span>
              </Text>
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
                {project.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                {statusLabel}
              </Badge>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-caption text-text-muted">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{t("project.card.created", { date: createdDate })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("project.card.updated", { date: updatedDate })}</span>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        {showDelete && onDelete && (
          <Button
            variant="secondary"
            size="icon"
            onPointerDown={handleDeleteClick}
            className="flex-shrink-0 self-start bg-surface-elevated/90 text-text-secondary backdrop-blur-sm hover:border-status-error hover:bg-status-error/10 hover:text-status-error touch-none"
            aria-label={t("project.card.deleteProject")}
            title={t("project.card.deleteProject")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </Link>
    );
  }

  // Render grid view (grid-sm or grid-md)
  return (
    <div className="group relative overflow-hidden rounded-xl">
      <Link href={`/project/${project.id}`}>
        <Card variant="elevated" padding="none" interactive className="overflow-hidden">
          <div className="aspect-video bg-surface-raised relative">
            {/* Priority: 1. Final composed thumbnail, 2. Custom, 3. AI base, 4. TMDB backdrop, 5. TMDB poster, 6. Placeholder */}
            {project.thumbnail?.final_url ||
            project.thumbnail?.custom_image_url ||
            (project.thumbnail?.base_image_url &&
              project.thumbnail?.base_image_status === "completed") ? (
              <ExternalImage
                src={
                  project.thumbnail?.final_url ||
                  project.thumbnail?.custom_image_url ||
                  project.thumbnail?.base_image_url ||
                  ""
                }
                alt={
                  project.project_name || project.movie?.title || t("project.card.projectThumbnail")
                }
                className="h-full w-full object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                priority={priority}
                onError={() => {
                  // Fallback to TMDB image if thumbnail fails to load
                  // The ExternalImage component handles this, but onError is called
                  // Client-side image error handling is limited with Next.js Image component
                }}
              />
            ) : project.movie?.backdrop_path || project.movie?.poster_path ? (
              <ExternalImage
                src={
                  tmdbImageUrl(project.movie.backdrop_path ?? project.movie.poster_path, "w500") ||
                  ""
                }
                alt={project.movie?.title ?? t("project.card.projectMovie")}
                className="h-full w-full object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                priority={priority}
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
                  <Spinner size="md" />
                  <span className="text-caption font-medium">
                    {t("project.card.generatingThumbnail")}
                  </span>
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Heading variant="label" as="h2" className="text-text-primary truncate">
                  {project.project_name ||
                    project.movie?.title ||
                    t("project.common.untitledProjectLower")}
                </Heading>
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
                      {project.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                      {statusLabel}
                    </Badge>
                  </div>
                ) : (
                  <Text variant="caption" className="mt-1 text-text-muted">
                    {t("project.card.stepStatus", {
                      step: project.last_step,
                      status: statusLabel,
                    })}
                  </Text>
                )}
              </div>
              {showDelete && (
                <div className="flex items-center gap-1 text-caption text-text-muted flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {updatedDate}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Delete Button - always visible on mobile, appears on hover on desktop */}
      {showDelete && onDelete && (
        <Button
          variant="secondary"
          size="icon"
          onPointerDown={handleDeleteClick}
          className="absolute top-2 right-2 bg-surface-elevated/90 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-status-error/10 hover:border-status-error hover:text-status-error text-text-secondary touch-none"
          aria-label={t("project.card.deleteProject")}
          title={t("project.card.deleteProject")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
