import { request } from "@/lib/api-client";
import type {
  NameSuggestion,
  ProjectResponse,
  ScheduleAgnesResponse,
  SuggestedNamesResponse,
  WorkflowStep,
} from "./types";

export type { NameSuggestion, ScheduleAgnesResponse, SuggestedNamesResponse };

export async function createProject(movieId?: number | null): Promise<ProjectResponse> {
  return request<ProjectResponse>("/projects", {
    method: "POST",
    body: JSON.stringify({ movie_id: movieId ?? null }),
  });
}

export async function getProject(projectId: string): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}`);
}

export async function listProjects(loadRelations = true): Promise<ProjectResponse[]> {
  const params = new URLSearchParams({ load_relations: String(loadRelations) });
  return request<ProjectResponse[]>(`/projects?${params.toString()}`);
}

export async function updateProjectMovie(
  projectId: string,
  movieId: number
): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify({ movie_id: movieId, last_step: "source" }),
  });
}

export async function updateProjectName(
  projectId: string,
  projectName: string
): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify({ project_name: projectName }),
  });
}

export async function getSuggestedProjectNames(projectId: string): Promise<SuggestedNamesResponse> {
  return request<SuggestedNamesResponse>(`/projects/${projectId}/suggested-names`);
}

export async function scheduleAgnesJobs(
  projectId: string,
  scheduleNames = true,
  scheduleThumbnail = true
): Promise<ScheduleAgnesResponse> {
  const params = new URLSearchParams({
    schedule_names: String(scheduleNames),
    schedule_thumbnail: String(scheduleThumbnail),
  });
  return request<ScheduleAgnesResponse>(`/projects/${projectId}/schedule-agnes-jobs?${params}`, {
    method: "POST",
  });
}

export async function advanceProjectStep(
  projectId: string,
  step: WorkflowStep
): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}/advance?step=${step}`, {
    method: "POST",
  });
}

export async function deleteProject(projectId: string, permanent = false): Promise<void> {
  const params = new URLSearchParams({ permanent: String(permanent) });
  await request<void>(`/projects/${projectId}?${params.toString()}`, {
    method: "DELETE",
  });
}

export async function restoreProject(projectId: string): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}/restore`, {
    method: "POST",
  });
}
