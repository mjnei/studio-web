"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, RefreshCw, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";

import { useJobs } from "@/lib/hooks/use-jobs";
import { StatusCards } from "@/components/jobs/StatusCards";
import { AnalyticsPanel } from "@/components/jobs/AnalyticsPanel";
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
    isRefreshing,
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
    refetch,
  } = useJobs();

  const [activeVideoModalJob, setActiveVideoModalJob] = useState<VideoJob | null>(null);

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

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        title={t("jobs.dashboard.title")}
        description={t("jobs.dashboard.description")}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />}
              onClick={() => refetch()}
              disabled={isRefreshing}
            >
              {t("jobs.dashboard.refresh")}
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="h-4 w-4" />}
              onClick={() => router.push("/projects")}
            >
              {t("jobs.dashboard.newProject")}
            </Button>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <StatusCards
        summary={summary}
        activeFilter={filters.status}
        onSelectFilter={(status) => setFilters((prev) => ({ ...prev, status }))}
        onRetryAllFailed={retryAllFailed}
      />

      {/* Analytics Insights */}
      <AnalyticsPanel summary={summary} />

      {/* Search & Filter Controls */}
      <FiltersBar
        filters={filters}
        onChangeFilters={setFilters}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        projectOptions={availableProjects}
        voiceOptions={availableVoices}
        totalResultsCount={filteredJobs.length}
      />

      {/* Sticky Bulk Operations Toolbar */}
      <BulkActionsBar
        selectedCount={selectedJobIds.size}
        totalFilteredCount={filteredJobs.length}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        onBulkDelete={bulkDelete}
        onBulkRetry={bulkRetry}
        isAllSelected={isAllSelected}
      />

      {/* Empty State: No jobs total */}
      {allJobs.length === 0 ? (
        <EmptyState
          icon={<Video className="h-16 w-16 text-accent-primary" />}
          title={t("jobs.empty.title")}
          description={t("jobs.empty.message")}
          action={
            <Button variant="primary" onClick={() => router.push("/projects")}>
              {t("jobs.empty.cta")}
            </Button>
          }
        />
      ) : filteredJobs.length === 0 ? (
        /* Empty State: No matching filter results */
        <EmptyState
          icon={<Video className="h-16 w-16 text-text-muted" />}
          title={t("jobs.empty.noMatches")}
          description={t("jobs.empty.noMatchesMessage")}
          action={
            <Button
              variant="secondary"
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
          {/* Active / Rendering Jobs Section */}
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

          {/* Failed Jobs Section */}
          {failedJobs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <Heading
                  variant="subsection"
                  as="h2"
                  className="text-status-failed flex items-center gap-2"
                >
                  ⚠️ {t("jobs.sections.failed")} ({failedJobs.length})
                </Heading>
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

          {/* Completed Jobs Section */}
          {completedJobs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <Heading
                  variant="subsection"
                  as="h2"
                  className="text-text-primary flex items-center gap-2"
                >
                  🎬 {t("jobs.sections.completed")} ({completedJobs.length})
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

      {/* Video Preview Modal */}
      <JobVideoModal job={activeVideoModalJob} onClose={() => setActiveVideoModalJob(null)} />
    </div>
  );
}
