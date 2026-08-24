"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Eye, RotateCcw, Trash2 } from "lucide-react";
import type { AdminProject } from "@/types/admin";

interface ProjectsTableProps {
  projects: AdminProject[];
  isLoading: boolean;
  onView: (project: AdminProject) => void;
  onDelete: (project: AdminProject) => void;
  onRestore: (project: AdminProject) => void;
}

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Just now";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function StatusBadge({ status, isDeleted }: { status: string; isDeleted: boolean }) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-caption font-semibold text-red-600">
        Deleted
      </span>
    );
  }
  const styles: Record<string, string> = {
    draft: "bg-surface-raised text-text-muted",
    "in-progress": "bg-orange-500/10 text-orange-600",
    completed: "bg-green-500/10 text-green-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}

export function ProjectsTable({
  projects,
  isLoading,
  onView,
  onDelete,
  onRestore,
}: ProjectsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-panel p-8 text-center text-text-muted">
        Loading projects…
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-panel p-8 text-center text-text-muted">
        No projects found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-panel">
      <div className="hidden grid-cols-12 gap-3 border-b border-border-default px-4 py-3 text-caption font-semibold uppercase tracking-wider text-text-muted md:grid">
        <div className="col-span-3">Project</div>
        <div className="col-span-3">Owner</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Step</div>
        <div className="col-span-1">Updated</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      <div className="divide-y divide-border-default">
        {projects.map((project) => (
          <div
            key={project.id}
            className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center"
          >
            <div className="md:col-span-3">
              <Heading variant="label" as="h3" className="text-text-primary">
                {project.project_name || `Untitled #${project.id}`}
              </Heading>
              <p className="mt-0.5 text-caption text-text-muted">
                ID {project.id}
                {project.movie?.title ? ` · ${project.movie.title}` : ""}
              </p>
            </div>

            <div className="md:col-span-3">
              <p className="text-body text-text-primary">{project.user_name || "—"}</p>
              <p className="text-caption text-text-muted">
                {project.user_email || `User #${project.user_id}`}
              </p>
            </div>

            <div className="md:col-span-2">
              <StatusBadge status={project.status} isDeleted={project.is_deleted} />
            </div>

            <div className="md:col-span-1">
              <span className="text-body text-text-secondary">{project.last_step}</span>
            </div>

            <div className="md:col-span-1">
              <span className="text-body text-text-muted">
                {formatRelativeTime(project.updated_at)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 md:col-span-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => onView(project)}
                title="View details"
                aria-label="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {project.is_deleted ? (
                <Button
                  type="button"
                  variant="success"
                  size="icon"
                  onClick={() => onRestore(project)}
                  title="Restore"
                  aria-label="Restore"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  size="icon"
                  onClick={() => onDelete(project)}
                  title="Soft delete"
                  aria-label="Soft delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
