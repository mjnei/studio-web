"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingSpinner";
import { ProjectCard } from "@/components/project/ProjectCard";
import { listProjects, deleteProject, type ProjectResponse } from "@/lib/project-client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectResponse | null>(null);
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

  const handleDeleteClick = (project: ProjectResponse) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      // Always soft delete
      await deleteProject(projectToDelete.id, false);
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
            <ProjectCard
              key={project.id}
              project={project}
              showDelete={true}
              onDelete={handleDeleteClick}
            />
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
        submitText="Delete"
        cancelText="Cancel"
        loading={deleting}
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            You are about to delete the project:{" "}
            <span className="font-semibold text-text-primary">
              {(projectToDelete?.project_name || projectToDelete?.movie?.title) ??
                "Untitled project"}
            </span>
          </p>
          <p className="text-sm text-text-secondary">
            This project can be restored within the next 7 days.
          </p>
        </div>
      </FormModal>
    </div>
  );
}
