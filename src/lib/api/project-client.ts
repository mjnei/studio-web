// Project-related API Client Functions
import { request } from "../api-client";
import type {
  ProjectResponse,
  ProjectDetailResponse,
  ProjectUpdate,
  ProjectListResponse,
  MovieResponse,
  MovieListResponse,
  VoiceResponse,
  VoiceListResponse,
  ProjectScriptResponse,
  TTSJobResponse,
  VideoJobResponse,
  VideoGenerationStepResponse,
} from "../types/api";

// ============================================================================
// Project Operations
// ============================================================================

export async function createProject(movieId: string): Promise<ProjectResponse> {
  return request<ProjectResponse>("/projects", {
    method: "POST",
    body: JSON.stringify({ movie_id: movieId }),
  });
}

export async function getProject(projectId: string): Promise<ProjectDetailResponse> {
  return request<ProjectDetailResponse>(`/projects/${projectId}`);
}

export async function getProjectList(
  page: number = 1,
  pageSize: number = 20,
  status?: string,
  step?: string
): Promise<ProjectListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (status) params.append("status", status);
  if (step) params.append("step", step);
  return request(`/projects?${params.toString()}`);
}

export async function updateProject(
  projectId: string,
  data: Partial<ProjectUpdate>
): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function advanceProjectStep(
  projectId: string,
  step: "source" | "script" | "voice" | "compose"
): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}/advance?step=${step}`, {
    method: "POST",
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await request<void>(`/projects/${projectId}`, { method: "DELETE" });
}

// ============================================================================
// Movie Operations
// ============================================================================

export async function searchMovies(query: string, limit: number = 20): Promise<MovieListResponse> {
  const params = new URLSearchParams({ query, limit: limit.toString() });
  return request(`/movies/search?${params.toString()}`);
}

export async function getPopularMovies(limit: number = 20): Promise<MovieListResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  return request(`/movies/popular?${params.toString()}`);
}

export async function getMovie(movieId: string): Promise<MovieResponse> {
  return request(`/movies/${movieId}`);
}

export async function listMovies(
  page: number = 1,
  pageSize: number = 20,
  sortBy: string = "popularity"
): Promise<MovieListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    sort_by: sortBy,
  });
  return request(`/movies?${params.toString()}`);
}

// ============================================================================
// Voice Operations
// ============================================================================

export async function searchVoices(filters?: {
  provider?: string;
  gender?: string;
  age?: string;
  accent?: string;
  category?: string;
}): Promise<VoiceListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  return request(`/voices/search?${params.toString()}`);
}

export async function listVoices(
  page: number = 1,
  pageSize: number = 20
): Promise<VoiceListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  return request(`/voices?${params.toString()}`);
}

export async function getVoice(voiceId: string): Promise<VoiceResponse> {
  return request(`/voices/${voiceId}`);
}

// ============================================================================
// Script Operations
// ============================================================================

export async function createScript(
  projectId: string,
  content: string,
  autoActivate: boolean = false
): Promise<ProjectScriptResponse> {
  return request<ProjectScriptResponse>(`/scripts?auto_activate=${autoActivate}`, {
    method: "POST",
    body: JSON.stringify({
      project_id: projectId,
      content,
    }),
  });
}

export async function getScript(scriptId: string): Promise<ProjectScriptResponse> {
  return request(`/scripts/${scriptId}`);
}

export async function listProjectScripts(projectId: string): Promise<ProjectScriptResponse[]> {
  return request(`/scripts/project/${projectId}/list`);
}

export async function getActiveScript(projectId: string): Promise<ProjectScriptResponse> {
  return request(`/scripts/project/${projectId}/active`);
}

export async function activateScript(
  projectId: string,
  scriptId: string
): Promise<ProjectScriptResponse> {
  return request(`/scripts/project/${projectId}/activate/${scriptId}`, {
    method: "POST",
  });
}

export async function updateScript(
  scriptId: string,
  content: string
): Promise<ProjectScriptResponse> {
  return request<ProjectScriptResponse>(`/scripts/${scriptId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export async function deleteScript(scriptId: string): Promise<void> {
  await request<void>(`/scripts/${scriptId}`, { method: "DELETE" });
}

// ============================================================================
// TTS Operations
// ============================================================================

export async function createTTSJob(params: {
  projectId: string;
  scriptId: string;
  voiceId: string;
  voiceType: "stock" | "custom";
  voiceName?: string;
  autoActivate?: boolean;
}): Promise<TTSJobResponse> {
  const { projectId, scriptId, voiceId, voiceType, voiceName, autoActivate = false } = params;
  return request<TTSJobResponse>(`/tts?auto_activate=${autoActivate}`, {
    method: "POST",
    body: JSON.stringify({
      project_id: projectId,
      script_id: scriptId,
      voice_id: voiceId,
      voice_type: voiceType,
      voice_name: voiceName,
    }),
  });
}

export async function getTTSJob(jobId: string): Promise<TTSJobResponse> {
  return request(`/tts/${jobId}`);
}

export async function getActiveTTSJob(projectId: string): Promise<TTSJobResponse> {
  return request(`/tts/project/${projectId}/active`);
}

export async function getTTSJobList(projectId: string): Promise<TTSJobResponse[]> {
  return request(`/tts/project/${projectId}/list`);
}

export async function retryTTSJob(jobId: string): Promise<TTSJobResponse> {
  return request<TTSJobResponse>(`/tts/${jobId}/retry`, {
    method: "POST",
  });
}

export async function cancelTTSJob(jobId: string): Promise<TTSJobResponse> {
  return request<TTSJobResponse>(`/tts/${jobId}/cancel`, {
    method: "POST",
  });
}

// ============================================================================
// Video Operations
// ============================================================================

export async function createVideoJob(
  projectId: string,
  ttsJobId?: string, // Made optional since we no longer require TTS
  autoActivate: boolean = false
): Promise<VideoJobResponse> {
  const params = new URLSearchParams({
    project_id: projectId,
    auto_activate: String(autoActivate),
  });

  // Only include tts_job_id if provided
  if (ttsJobId) {
    params.set("tts_job_id", ttsJobId);
  }

  return request<VideoJobResponse>(`/video?${params.toString()}`, { method: "POST" });
}

export async function getVideoJob(
  jobId: string,
  loadSteps: boolean = true
): Promise<VideoJobResponse> {
  return request(`/video/${jobId}?load_steps=${loadSteps}`);
}

export async function getVideoStep(
  jobId: string,
  stepNumber: number
): Promise<VideoGenerationStepResponse> {
  return request(`/video/${jobId}/steps/${stepNumber}`);
}

export async function getActiveVideoJob(projectId: string): Promise<VideoJobResponse> {
  return request(`/video/project/${projectId}/active`);
}

export async function getVideoJobList(projectId: string): Promise<VideoJobResponse[]> {
  return request(`/video/project/${projectId}/list`);
}

export async function retryVideoJob(jobId: string): Promise<VideoJobResponse> {
  return request<VideoJobResponse>(`/video/${jobId}/retry`, {
    method: "POST",
  });
}

export async function cancelVideoJob(jobId: string): Promise<VideoJobResponse> {
  return request<VideoJobResponse>(`/video/${jobId}/cancel`, {
    method: "POST",
  });
}
