"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { listProjects, deleteProject, tmdbImageUrl, type ProjectResponse } from "@/lib/project-client";

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
      <div className="mb-8 flex items-start justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Projects</h1>
          <p className="text-text-secondary">Create and manage your projects</p>
        </div>
        <Link href="/project/new">
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardContent>
            <div className="py-12 text-center text-text-secondary">Loading projects...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardContent>
            <div className="py-12 text-center text-status-failed">{error}</div>
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
                  <div className="aspect-video bg-surface-raised">
                    {project.movie?.backdrop_path || project.movie?.poster_path ? (
                      <img
                        src={tmdbImageUrl(
                          project.movie.backdrop_path ?? project.movie.poster_path,
                          "w780"
                        )}
                        alt={project.movie?.title ?? "Project movie"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Folder className="h-10 w-10 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-text-primary">
                          {project.movie?.title ?? "Untitled project"}
                        </h2>
                        <p className="mt-1 text-xs text-text-muted">
                          Step: {project.last_step} • Status: {project.status}
                        </p>
                      </div>
                      <span className="rounded-full bg-surface-raised px-2 py-1 text-xs text-text-secondary">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
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
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Project?"
        variant="danger"
        confirmText={deleteMode === "hard" ? "Delete Permanently" : "Delete"}
        cancelText="Cancel"
        loading={deleting}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            You are about to delete the project:{" "}
            <span className="font-semibold text-text-primary">
              {projectToDelete?.movie?.title ?? "Untitled project"}
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
      </ConfirmModal>
    </div>
  );
}
