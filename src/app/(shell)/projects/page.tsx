"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Plus, Grid3x3, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n";
import { ProjectCard } from "@/components/project/ProjectCard";
import { listProjects, deleteProject, type ProjectResponse } from "@/lib/project-client";

type LayoutMode = "grid-sm" | "grid-md" | "list";

export default function ProjectsPage() {
  const toast = useToast();
  const { t } = useI18n();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-md");

  const loadProjects = () => {
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

  const LayoutToggle = () => (
    <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel p-1">
      <button
        onClick={() => setLayoutMode("grid-sm")}
        className={`rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
          layoutMode === "grid-sm"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title={t("projects.layout.small")}
        aria-label={t("projects.layout.small")}
      >
        <Grid3x3 className="h-5 w-5" />
      </button>
      <button
        onClick={() => setLayoutMode("grid-md")}
        className={`rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
          layoutMode === "grid-md"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title={t("projects.layout.medium")}
        aria-label={t("projects.layout.medium")}
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      <button
        onClick={() => setLayoutMode("list")}
        className={`rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
          layoutMode === "list"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title={t("projects.layout.list")}
        aria-label={t("projects.layout.list")}
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );

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
          <LayoutToggle />
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
