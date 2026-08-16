"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n";
import { ProjectCard } from "@/components/project/ProjectCard";
import { listProjects, deleteProject, type ProjectResponse } from "@/lib/project-client";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";

export default function ProjectsPage() {
  const toast = useToast();
  const { t } = useI18n();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-md");

  // Load layout preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("layoutMode");
    if (saved && (saved === "grid-sm" || saved === "grid-md" || saved === "list")) {
      setLayoutMode(saved as LayoutMode);
    }
  }, []);

  // Save layout preference to localStorage when it changes
  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem("layoutMode", mode);
  };

  const loadProjects = useCallback(() => {
    setLoading(true);
    listProjects(true)
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => {
        toast.error(
          "Failed to load projects",
          err instanceof Error ? err.message : "Unable to load projects"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    listProjects(true)
      .then((data) => {
        if (isMounted) {
          setProjects(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          toast.error(
            "Failed to load projects",
            err instanceof Error ? err.message : "Unable to load projects"
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [toast]);

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
      toast.success(t("projects.delete.success"));
      // Reload projects list
      loadProjects();
    } catch (err) {
      toast.error(
        t("projects.delete.error"),
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setDeleting(false);
    }
  };

  const getGridClass = () => {
    switch (layoutMode) {
      case "grid-sm":
        // Small cards: 2 cols (base), 3 cols (md), 4 cols (lg)
        return "grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "grid-md":
        // Medium cards: 1 col (base), 2 cols (sm), 3 cols (lg)
        return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
      case "list":
        return "space-y-3";
      default:
        return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("projects.title")}
        description={t("projects.description")}
        action={
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-accent-cyan/10 px-3 py-1.5 text-xs font-medium text-accent-cyan whitespace-nowrap">
              {projects.length}{" "}
              {projects.length === 1 ? t("projects.badge.singular") : t("projects.badge.plural")}
            </span>
            <Link href="/project/new">
              <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />}>
                {t("projects.new")}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Layout Controls */}
      {!loading && projects.length > 0 && (
        <div className="mb-6 flex justify-end">
          <LayoutToggle
            layoutMode={layoutMode}
            onLayoutChange={handleLayoutChange}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner
          size="lg"
          message={t("projects.loading")}
          description="Please wait while we fetch your projects"
          fullHeight
        />
      ) : projects.length === 0 ? (
        <EmptyState
          variant="default"
          icon={<Folder className="h-12 w-12" />}
          title={t("projects.empty.title")}
          description={t("projects.empty.message")}
          action={
            <Link href="/project/new">
              <Button variant="primary" size="md">
                {t("projects.empty.cta")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className={getGridClass()}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              showDelete={true}
              onDelete={handleDeleteClick}
              layoutMode={layoutMode}
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
        title={t("projects.delete.title")}
        submitText={t("common.delete")}
        cancelText={t("common.cancel")}
        loading={deleting}
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            {t("projects.delete.confirm")}{" "}
            <span className="font-semibold text-text-primary">
              {(projectToDelete?.project_name || projectToDelete?.movie?.title) ??
                t("projects.untitled")}
            </span>
          </p>
          <p className="text-sm text-text-secondary">{t("projects.delete.restoreInfo")}</p>
        </div>
      </FormModal>
    </div>
  );
}
