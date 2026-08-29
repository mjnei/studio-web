"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, RefreshCw, Video } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";

import { useJobs } from "@/lib/hooks/use-jobs";
import { StatusCards } from "@/components/jobs/StatusCards";
import { FiltersBar } from "@/components/jobs/FiltersBar";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { ActiveJobCard } from "@/components/jobs/ActiveJobCard";
import { CompletedJobCard } from "@/components/jobs/CompletedJobCard";
import { FailedJobCard } from "@/components/jobs/FailedJobCard";
import { JobVideoModal } from "@/components/jobs/JobVideoModal";
import { VideoJob } from "@/types/jobs";

export default function JobsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    allJobs,
    filteredJobs,
    summary,
    isLoading,
    filters,
    setFilters,
    selectedJobIds,
    toggleSelectJob,
    toggleSelectAll,
    clearSelection,
    layoutMode,
    setLayoutMode,
    availableProjects,
    availableVoices,
    actionLoadingId,
    deleteVideo,
    retryVideo,
    bulkDelete,
    bulkRetry,
    retryAllFailed,
  } = useJobs();

  const [activeVideoModalJob, setActiveVideoModalJob] = useState<VideoJob | null>(null);
  const [defaultFilterApplied, setDefaultFilterApplied] = useState(false);

  // Once jobs load, default to "active" if any active jobs exist, otherwise "completed".
  // Adjust during render (not in an effect) so the default is applied without cascading.
  if (!isLoading && !defaultFilterApplied && filters.status === "all") {
    setDefaultFilterApplied(true);
    setFilters((prev) => ({
      ...prev,
      status: summary.activeCount > 0 ? "active" : "completed",
    }));
  }

  if (isLoading) {
    return <PageLoadingSkeleton message={t("jobs.loading")} />;
  }

  // Partition filtered jobs into Active, Completed, Failed
  const activeJobs = filteredJobs.filter((j) => j.status === "processing" || j.status === "queued");
  const completedJobs = filteredJobs.filter((j) => j.status === "completed");
  const failedJobs = filteredJobs.filter((j) => j.status === "failed");

  // Grid layout mode selector
  const getGridClass = () => {
    switch (layoutMode) {
      case "grid-sm":
        return "grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case "grid-md":
        return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
      case "list":
        return "space-y-3";
      default:
        return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  const isAllSelected = filteredJobs.length > 0 && selectedJobIds.size === filteredJobs.length;
  const totalJobsMeta = `${summary.totalCount} ${t("jobs.status.total").toLowerCase()}`;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <PageHeader
        title={t("jobs.dashboard.title")}
        description={t("jobs.dashboard.description")}
        meta={totalJobsMeta}
      />

      <StatusCards
        summary={summary}
        activeFilter={filters.status}
        onSelectFilter={(status) => setFilters((prev) => ({ ...prev, status }))}
      />

      <FiltersBar
        filters={filters}
        onChangeFilters={setFilters}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        projectOptions={availableProjects}
        voiceOptions={availableVoices}
        totalResultsCount={filteredJobs.length}
      />

      <BulkActionsBar
        selectedCount={selectedJobIds.size}
        totalFilteredCount={filteredJobs.length}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        onBulkDelete={bulkDelete}
        onBulkRetry={bulkRetry}
        isAllSelected={isAllSelected}
      />

      {allJobs.length === 0 ? (
        <EmptyState
          size="lg"
          icon={<Video className="text-accent-primary" aria-hidden />}
          title={t("jobs.empty.title")}
          description={t("jobs.empty.message")}
          action={
            <Button variant="primary" size="md" onClick={() => router.push("/projects")}>
              {t("jobs.empty.cta")}
            </Button>
          }
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          size="lg"
          icon={<Video aria-hidden />}
          title={t("jobs.empty.noMatches")}
          description={t("jobs.empty.noMatchesMessage")}
          action={
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                setFilters({
                  status: "all",
                  search: "",
                  projects: [],
                  voices: [],
                  sortBy: "date",
                  sortOrder: "desc",
                })
              }
            >
              {t("jobs.empty.clearFilters")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {activeJobs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <Heading
                  variant="subsection"
                  as="h2"
                  className="text-text-primary flex items-center gap-2"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-ping" />
                  {t("jobs.sections.active")} ({activeJobs.length})
                </Heading>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activeJobs.map((job) => (
                  <ActiveJobCard
                    key={job.id}
                    job={job}
                    onDelete={deleteVideo}
                    isDeleting={actionLoadingId === job.id}
                  />
                ))}
              </div>
            </section>
          )}

          {failedJobs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <Heading
                  variant="subsection"
                  as="h2"
                  className="text-status-failed flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  {t("jobs.sections.failed")} ({failedJobs.length})
                </Heading>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={retryAllFailed}
                >
                  {t("jobs.status.retryAll")}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {failedJobs.map((job) => (
                  <FailedJobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJobIds.has(job.id)}
                    onToggleSelect={toggleSelectJob}
                    onRetry={retryVideo}
                    onDelete={deleteVideo}
                    isActionLoading={actionLoadingId === job.id}
                  />
                ))}
              </div>
            </section>
          )}

          {completedJobs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <Heading
                  variant="subsection"
                  as="h2"
                  className="text-text-primary flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-status-success" aria-hidden />
                  {t("jobs.sections.completed")} ({completedJobs.length})
                </Heading>
              </div>
              <div className={getGridClass()}>
                {completedJobs.map((job) => (
                  <CompletedJobCard
                    key={job.id}
                    job={job}
                    layoutMode={layoutMode}
                    isSelected={selectedJobIds.has(job.id)}
                    onToggleSelect={toggleSelectJob}
                    onPlay={setActiveVideoModalJob}
                    onDelete={deleteVideo}
                    isDeleting={actionLoadingId === job.id}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <JobVideoModal job={activeVideoModalJob} onClose={() => setActiveVideoModalJob(null)} />
    </div>
  );
}
