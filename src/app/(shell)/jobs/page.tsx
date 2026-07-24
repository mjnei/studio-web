"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, Loader2, Video, Download, Eye, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { listProjects, type ProjectResponse } from "@/lib/project-client";
import {
  getProjectVideos,
  deleteProjectVideo,
  type VideoGenerationResponse,
} from "@/lib/credit-client";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";

type FilterTab = "all" | "pending" | "completed" | "failed";

interface ProjectWithVideos {
  project: ProjectResponse;
  videos: VideoGenerationResponse[];
}

export default function JobsPage() {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [projectsWithVideos, setProjectsWithVideos] = useState<ProjectWithVideos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const filterOptions = [
    { value: "all" as const, label: "All Jobs" },
    { value: "pending" as const, label: "In Progress" },
    { value: "completed" as const, label: "Completed" },
    { value: "failed" as const, label: "Failed" },
  ];

  useEffect(() => {
    let isMounted = true;

    const performLoad = async () => {
      try {
        // Load all projects
        const projects = await listProjects(true);

        // Load videos for each project
        const projectsWithVideoData = await Promise.all(
          projects.map(async (project) => {
            try {
              const { videos } = await getProjectVideos(project.id);
              return { project, videos };
            } catch (error) {
              console.error(`Failed to load videos for project ${project.id}:`, error);
              return { project, videos: [] };
            }
          })
        );

        // Filter out projects with no videos
        const filtered = projectsWithVideoData.filter((pwv) => pwv.videos.length > 0);

        if (isMounted) {
          setProjectsWithVideos(filtered);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load jobs:", error);
        if (isMounted) {
          toast.error("Failed to load jobs", "Could not retrieve video generation history");
          setIsLoading(false);
        }
      }
    };

    performLoad();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Poll for updates if there are any pending jobs
  useEffect(() => {
    let isMounted = true;

    const hasProcessingJobs = projectsWithVideos.some((pwv) =>
      pwv.videos.some((v) => v.status === "processing" || v.status === "queued")
    );

    if (!hasProcessingJobs) return;

    const pollInterval = setInterval(async () => {
      try {
        const projects = await listProjects(true);
        const projectsWithVideoData = await Promise.all(
          projects.map(async (project) => {
            try {
              const { videos } = await getProjectVideos(project.id);
              return { project, videos };
            } catch (error) {
              return { project, videos: [] };
            }
          })
        );
        const filtered = projectsWithVideoData.filter((pwv) => pwv.videos.length > 0);
        if (isMounted) {
          setProjectsWithVideos(filtered);
        }
      } catch {
        console.error("Failed to poll jobs:");
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [projectsWithVideos]);

  const handleDeleteVideo = async (projectId: string, videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    setDeletingVideoId(videoId);
    try {
      await deleteProjectVideo(projectId, videoId);
      toast.success("Video deleted", "The video has been removed");
      
      // Reload videos for the affected project
      const { videos } = await getProjectVideos(projectId);
      setProjectsWithVideos((prev) =>
        prev.map((pwv) => (pwv.project.id === projectId ? { ...pwv, videos } : pwv))
      );
    } catch (error) {
      console.error("Failed to delete video:", error);
      toast.error("Delete failed", "Failed to delete the video");
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/project/${projectId}/finalize`);
  };

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading video jobs..." />;
  }

  // Flatten all videos with project context
  const allVideos = projectsWithVideos.flatMap((pwv) =>
    pwv.videos.map((video) => ({
      ...video,
      projectName: pwv.project.project_name || "Untitled Project",
      projectId: pwv.project.id,
      movieTitle: pwv.project.movie?.title,
    }))
  );

  // Apply filter
  const filteredVideos = allVideos.filter((video) => {
    if (filter === "all") return true;
    if (filter === "pending") return video.status === "processing" || video.status === "queued";
    if (filter === "completed") return video.status === "completed";
    if (filter === "failed") return video.status === "failed";
    return true;
  });

  // Sort by created_at descending (newest first)
  filteredVideos.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getStatusBadgeVariant = (status: string) => {
    if (status === "completed") return "success";
    if (status === "failed") return "error";
    return "info";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-3 h-3" />;
    if (status === "failed") return <XCircle className="w-3 h-3" />;
    if (status === "processing") return <Loader2 className="w-3 h-3 animate-spin" />;
    return <Clock className="w-3 h-3" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Video Jobs"
        description="Track all your video generation jobs and download completed videos"
        action={
          <div className="w-full sm:w-48">
            <Select
              value={filter}
              onChange={(value) => setFilter(value as FilterTab)}
              options={filterOptions}
              placeholder="Filter jobs"
            />
          </div>
        }
      />

      {filteredVideos.length === 0 ? (
        <EmptyState
          icon={<Video className="h-16 w-16" />}
          title={filter === "all" ? "No video jobs yet" : `No ${filter} jobs`}
          description={
            filter === "all"
              ? "When you generate a video in a project, it will appear here so you can track progress and download your videos."
              : `You don't have any ${filter} video jobs at the moment.`
          }
          action={
            <Button variant="primary" onClick={() => router.push("/projects")}>
              Go to Projects
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              variant="elevated"
              padding="md"
              className="hover:border-accent-cyan/40 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-full md:w-40 aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.projectName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-text-muted" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary truncate">
                        {video.projectName}
                      </h3>
                      {video.movieTitle && (
                        <p className="text-sm text-text-muted truncate">{video.movieTitle}</p>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(video.status)}>
                      {getStatusIcon(video.status)}
                      {video.status}
                    </Badge>
                  </div>

                  {/* Progress bar for processing videos */}
                  {(video.status === "processing" || video.status === "queued") && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                        <span>Progress</span>
                        <span>{video.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-cyan transition-all duration-300"
                          style={{ width: `${video.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-text-muted mb-3">
                    <div>
                      <span className="font-medium text-text-secondary">Attempt:</span> #
                      {video.generation_attempt}
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary">Cost:</span>{" "}
                      {video.credit_cost} credit{video.credit_cost !== 1 ? "s" : ""}
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary">Voice:</span>{" "}
                      {video.voice_name || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary">Created:</span>{" "}
                      {new Date(video.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Error message */}
                  {video.error_message && (
                    <div className="mb-3 p-2 rounded bg-error-bg/10 border border-error-border">
                      <p className="text-xs text-error-text">{video.error_message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => handleViewProject(video.projectId)}
                    >
                      View Project
                    </Button>

                    {video.status === "completed" && video.video_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                        onClick={() => window.open(video.video_url!, "_blank")}
                      >
                        Download
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => handleDeleteVideo(video.projectId, video.id)}
                      disabled={deletingVideoId === video.id}
                      className="text-error-text hover:text-error-text-hover"
                    >
                      {deletingVideoId === video.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
