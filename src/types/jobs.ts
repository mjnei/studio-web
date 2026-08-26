import { VideoGenerationResponse } from "@/lib/credit-client";
import { ProjectResponse } from "@/lib/project-client";

export type JobStatusFilter = "all" | "active" | "completed" | "failed";
export type LayoutMode = "grid-sm" | "grid-md" | "list";

export interface VideoJob extends VideoGenerationResponse {
  projectName: string;
  projectId: string;
  movieTitle?: string | null;
}

export interface ProjectWithVideos {
  project: ProjectResponse;
  videos: VideoGenerationResponse[];
}

export interface JobFilters {
  status: JobStatusFilter;
  search: string;
  projects: string[];
  voices: string[];
  sortBy: "date" | "status" | "progress" | "cost";
  sortOrder: "asc" | "desc";
}

export interface JobsSummary {
  activeCount: number;
  completedCount: number;
  failedCount: number;
  totalCount: number;
}

export type JobActionType = "view" | "play" | "download" | "delete" | "retry" | "cancel";
