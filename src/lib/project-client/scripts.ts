import { request } from "@/lib/api-client";
import type { ProjectScriptResponse } from "./types";

export async function createScript(data: {
  projectId?: string;
  movieId?: number;
  content: string;
  wordCount: number;
  estimatedDurationMinutes: number;
  paragraphCount: number;
  autoActivate?: boolean;
}): Promise<ProjectScriptResponse> {
  const params = new URLSearchParams({ auto_activate: String(data.autoActivate ?? true) });

  // Add movie_id if creating a new project with first script
  if (data.movieId) {
    params.set("movie_id", String(data.movieId));
  }

  return request<ProjectScriptResponse>(`/scripts?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify({
      project_id: data.projectId ? Number(data.projectId) : null,
      content: data.content,
      word_count: data.wordCount,
      estimated_duration_minutes: data.estimatedDurationMinutes,
      paragraph_count: data.paragraphCount,
    }),
  });
}

export async function listProjectScripts(projectId: string): Promise<ProjectScriptResponse[]> {
  return request<ProjectScriptResponse[]>(`/scripts/project/${projectId}/list`);
}

export async function activateScript(
  projectId: string,
  scriptId: string
): Promise<ProjectScriptResponse> {
  return request<ProjectScriptResponse>(`/scripts/project/${projectId}/activate/${scriptId}`, {
    method: "POST",
  });
}
