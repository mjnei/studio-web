import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { listProjects } from "@/lib/project-client";
import {
  getMyVideoJobs,
  deleteProjectVideo,
  regenerateVideo,
  VideoGenerationResponse,
} from "@/lib/credit-client";
import { useToast } from "@/components/ui/toast";
import { VideoJob, JobFilters, JobsSummary, LayoutMode, ProjectWithVideos } from "@/types/jobs";

const INITIAL_FILTERS: JobFilters = {
  status: "all",
  search: "",
  projects: [],
  voices: [],
  sortBy: "date",
  sortOrder: "desc",
};

function groupProjectsWithVideos(
  projects: Awaited<ReturnType<typeof listProjects>>,
  videos: VideoGenerationResponse[]
): ProjectWithVideos[] {
  const videosByProject = new Map<string, VideoGenerationResponse[]>();
  for (const video of videos) {
    const key = String(video.project_id);
    const list = videosByProject.get(key);
    if (list) {
      list.push(video);
    } else {
      videosByProject.set(key, [video]);
    }
  }

  return projects
    .map((project) => ({
      project,
      videos: videosByProject.get(String(project.id)) ?? [],
    }))
    .filter((pwv) => pwv.videos.length > 0);
}

export function useJobs() {
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [projectsWithVideos, setProjectsWithVideos] = useState<ProjectWithVideos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>(INITIAL_FILTERS);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-md");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadJobsData = useCallback(async () => {
    try {
      // 2 requests total — not 1 + N per project
      const [projects, videos] = await Promise.all([listProjects(true), getMyVideoJobs()]);
      setProjectsWithVideos(groupProjectsWithVideos(projects, videos));
    } catch (error) {
      console.error("[useJobs] Error fetching jobs:", error);
      toastRef.current.error("Failed to load jobs", "Could not fetch video generation data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const [projects, videos] = await Promise.all([listProjects(true), getMyVideoJobs()]);
        if (isMounted) {
          setProjectsWithVideos(groupProjectsWithVideos(projects, videos));
        }
      } catch (error) {
        console.error("[useJobs] Error fetching jobs:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  // Poll only while there are active jobs — still 2 requests, not N+1
  useEffect(() => {
    const hasActiveJobs = projectsWithVideos.some((pwv) =>
      pwv.videos.some((v) => v.status === "processing" || v.status === "queued")
    );

    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      void loadJobsData();
    }, 5000);

    return () => clearInterval(interval);
  }, [projectsWithVideos, loadJobsData]);

  // Flatten videos into VideoJob array
  const allJobs = useMemo<VideoJob[]>(() => {
    return projectsWithVideos.flatMap((pwv) =>
      pwv.videos.map((video) => ({
        ...video,
        projectName: pwv.project.project_name || "Untitled Project",
        projectId: String(pwv.project.id),
        movieTitle: pwv.project.movie?.title,
      }))
    );
  }, [projectsWithVideos]);

  // Compute available project options and voice options for filtering
  const availableProjects = useMemo(() => {
    const map = new Map<string, string>();
    allJobs.forEach((job) => {
      map.set(job.projectId, job.projectName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [allJobs]);

  const availableVoices = useMemo(() => {
    const set = new Set<string>();
    allJobs.forEach((job) => {
      if (job.voice_name) set.add(job.voice_name);
    });
    return Array.from(set).map((v) => ({ value: v, label: v }));
  }, [allJobs]);

  // Summary Metrics
  const summary = useMemo<JobsSummary>(() => {
    const totalCount = allJobs.length;
    let activeCount = 0;
    let completedCount = 0;
    let failedCount = 0;

    allJobs.forEach((job) => {
      if (job.status === "processing" || job.status === "queued") activeCount++;
      if (job.status === "completed") completedCount++;
      if (job.status === "failed") failedCount++;
    });

    return {
      activeCount,
      completedCount,
      failedCount,
      totalCount,
    };
  }, [allJobs]);

  // Apply filters and sorting
  const filteredJobs = useMemo(() => {
    return allJobs
      .filter((job) => {
        // Status filter
        if (filters.status === "active") {
          if (job.status !== "processing" && job.status !== "queued") return false;
        } else if (filters.status === "completed") {
          if (job.status !== "completed") return false;
        } else if (filters.status === "failed") {
          if (job.status !== "failed") return false;
        }

        // Search filter
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchProject = job.projectName.toLowerCase().includes(q);
          const matchMovie = job.movieTitle?.toLowerCase().includes(q) ?? false;
          const matchVoice = job.voice_name?.toLowerCase().includes(q) ?? false;
          if (!matchProject && !matchMovie && !matchVoice) return false;
        }

        // Project filter
        if (filters.projects.length > 0 && !filters.projects.includes(job.projectId)) {
          return false;
        }

        // Voice filter
        if (
          filters.voices.length > 0 &&
          (!job.voice_name || !filters.voices.includes(job.voice_name))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const modifier = filters.sortOrder === "asc" ? 1 : -1;
        if (filters.sortBy === "date") {
          return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * modifier;
        }
        if (filters.sortBy === "progress") {
          return (b.progress - a.progress) * modifier;
        }
        if (filters.sortBy === "cost") {
          return (b.credit_cost - a.credit_cost) * modifier;
        }
        if (filters.sortBy === "status") {
          return a.status.localeCompare(b.status) * modifier;
        }
        return 0;
      });
  }, [allJobs, filters]);

  // Selection handlers
  const toggleSelectJob = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedJobIds((prev) => {
      if (prev.size === filteredJobs.length && filteredJobs.length > 0) {
        return new Set();
      }
      return new Set(filteredJobs.map((j) => j.id));
    });
  }, [filteredJobs]);

  const clearSelection = useCallback(() => {
    setSelectedJobIds(new Set());
  }, []);

  // Single job actions
  const handleDeleteVideo = useCallback(
    async (projectId: string, videoId: string) => {
      setActionLoadingId(videoId);
      try {
        await deleteProjectVideo(projectId, videoId);
        toast.success("Job deleted", "The video job has been removed");
        setSelectedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(videoId);
          return next;
        });
        await loadJobsData();
      } catch (error) {
        console.error("[useJobs] Delete error:", error);
        toast.error("Delete failed", "Could not remove the video job");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadJobsData, toast]
  );

  const handleRetryVideo = useCallback(
    async (projectId: string, videoId: string) => {
      setActionLoadingId(videoId);
      try {
        await regenerateVideo(projectId);
        toast.success("Generation restarted", "New video generation job created");
        await loadJobsData();
      } catch (error) {
        console.error("[useJobs] Retry error:", error);
        toast.error("Retry failed", "Could not restart video generation");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadJobsData, toast]
  );

  // Bulk actions
  const bulkDelete = useCallback(async () => {
    if (selectedJobIds.size === 0) return;
    const selectedList = allJobs.filter((j) => selectedJobIds.has(j.id));
    let successCount = 0;

    for (const job of selectedList) {
      try {
        await deleteProjectVideo(job.projectId, job.id);
        successCount++;
      } catch (err) {
        console.error("[useJobs] Bulk delete item error:", err);
      }
    }

    toast.success("Bulk delete complete", `Deleted ${successCount} job(s)`);
    setSelectedJobIds(new Set());
    await loadJobsData();
  }, [allJobs, selectedJobIds, loadJobsData, toast]);

  const bulkRetry = useCallback(async () => {
    const selectedList = allJobs.filter((j) => selectedJobIds.has(j.id) && j.status === "failed");
    if (selectedList.length === 0) return;

    let successCount = 0;

    for (const job of selectedList) {
      try {
        await regenerateVideo(job.projectId);
        successCount++;
      } catch (err) {
        console.error("[useJobs] Bulk retry item error:", err);
      }
    }

    toast.success("Bulk retry triggered", `Re-queued ${successCount} failed job(s)`);
    setSelectedJobIds(new Set());
    await loadJobsData();
  }, [allJobs, selectedJobIds, loadJobsData, toast]);

  const retryAllFailed = useCallback(async () => {
    const failedList = allJobs.filter((j) => j.status === "failed");
    if (failedList.length === 0) return;

    let successCount = 0;

    for (const job of failedList) {
      try {
        await regenerateVideo(job.projectId);
        successCount++;
      } catch (err) {
        console.error("[useJobs] Retry all item error:", err);
      }
    }

    toast.success("Retrying all failed jobs", `Re-queued ${successCount} job(s)`);
    await loadJobsData();
  }, [allJobs, loadJobsData, toast]);

  return {
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
    deleteVideo: handleDeleteVideo,
    retryVideo: handleRetryVideo,
    bulkDelete,
    bulkRetry,
    retryAllFailed,
  };
}
