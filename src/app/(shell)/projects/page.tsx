"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/LoadingSpinner";
import {
  listProjects,
  deleteProject,
  tmdbImageUrl,
  type ProjectResponse,
} from "@/lib/project-client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectResponse | null>(null);
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard">("soft");
  const [deleting, setDeleting] = useState(false);

  const loadProjects = () => {
    setLoading(true);
    listProjects(true)
      .then((data) => {
        setProjects(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load projects");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, project: ProjectResponse) => {
    e.preventDefault(); // Prevent navigation to project
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteMode("soft");
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      await deleteProject(projectToDelete.id, deleteMode === "hard");
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      // Reload projects list
      loadProjects();
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Projects"
        description="Create and manage your video projects"
        action={
          <Link href="/project/new">
            <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />}>
              New Project
            </Button>
          </Link>
        }
      />

      {loading ? (
        <LoadingState
          title="Loading projects..."
          description="Please wait while we fetch your projects"
        />
      ) : error ? (
        <Card variant="elevated" padding="lg" className="fade-in border-status-error/30">
          <CardContent>
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-status-error/10 flex items-center justify-center">
                <Folder className="w-8 h-8 text-status-error" />
              </div>
              <p className="text-status-error font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
                <Folder className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">No projects yet</h2>
              <p className="text-text-secondary mb-8 max-w-md">
                Get started by creating your first project.
              </p>
              <Link href="/project/new">
                <Button variant="primary" size="lg">
                  Create Your First Project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="group relative">
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
                          tmdbImageUrl(
                            project.movie.backdrop_path ?? project.movie.poster_path,
                            "w780"
                          ) || ""
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
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="info" size="sm">
                            {project.last_step}
                          </Badge>
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
                      <div className="flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Delete Button - appears on hover */}
              <button
                onClick={(e) => handleDeleteClick(e, project)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-surface-elevated/90 backdrop-blur-sm border border-border-default opacity-0 group-hover:opacity-100 hover:bg-status-error/10 hover:border-status-error hover:text-status-error text-text-secondary transition-all duration-200 focus-ring"
                aria-label="Delete project"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <FormModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onSubmit={handleDeleteConfirm}
        title="Delete Project?"
        submitText={deleteMode === "hard" ? "Delete Permanently" : "Delete"}
        cancelText="Cancel"
        loading={deleting}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            You are about to delete the project:{" "}
            <span className="font-semibold text-text-primary">
              {(projectToDelete?.project_name || projectToDelete?.movie?.title) ??
                "Untitled project"}
            </span>
          </p>

          {/* Delete mode selection */}
          <div className="space-y-3 rounded-lg border border-border-default bg-surface-base p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="deleteMode"
                value="soft"
                checked={deleteMode === "soft"}
                onChange={() => setDeleteMode("soft")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-text-primary">Soft Delete (Recommended)</div>
                <div className="text-xs text-text-secondary mt-1">
                  Project will be hidden but can be restored later
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="deleteMode"
                value="hard"
                checked={deleteMode === "hard"}
                onChange={() => setDeleteMode("hard")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-text-primary">Permanent Delete</div>
                <div className="text-xs text-text-secondary mt-1">
                  Completely remove project and all associated data
                </div>
              </div>
            </label>
          </div>

          {deleteMode === "hard" && (
            <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-3">
              <div className="flex gap-2">
                <span className="text-status-error font-bold text-lg">⚠️</span>
                <div className="text-xs text-status-error">
                  <strong>Warning:</strong> This will permanently delete the project, all scripts,
                  TTS jobs, video jobs, and associated data. This action cannot be undone!
                </div>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}
