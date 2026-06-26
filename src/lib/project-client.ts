import { request } from "@/lib/api-client";

export type WorkflowStep = "source" | "script" | "details" | "voice" | "preview" | "compose";
export type ProjectStatus = "draft" | "in-progress" | "completed";
export type JobStatus = "idle" | "queued" | "processing" | "completed" | "failed";

export interface MovieResponse {
  id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: Array<{ id?: number; name?: string } | Record<string, unknown>> | null;
  release_date?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
}

export interface VoiceResponse {
  id: string;
  name: string;
  provider: string;
  description?: string | null;
  preview_path?: string | null;
  gender?: string | null;
  accent?: string | null;
  language?: string | null;
  category?: string | null;
  is_available: boolean;
}

export interface ProjectScriptResponse {
  id: string;
  project_id: string;
  content: string;
  word_count: number;
  estimated_duration_minutes: number;
  paragraph_count?: number | null;
  version_number: number;
  created_at: string;
  updated_at: string;
}

export interface TTSJobResponse {
  id: string;
  project_id: string;
  script_id?: string | null;
  voice_id?: string | null;
  voice_name?: string | null;
  status: JobStatus;
  progress: number;
  audio_url?: string | null;
  audio_duration?: number | null;
  error_message?: string | null;
  created_at: string;
}

export interface VideoGenerationStepResponse {
  id: string;
  step_number: number;
  step_name: string;
  status: "pending" | "queued" | "processing" | "completed" | "failed";
  progress: number;
  error_message?: string | null;
}

export interface VideoJobResponse {
  id: string;
  project_id: string;
  tts_job_id?: string | null;
  status: JobStatus;
  progress: number;
  video_url?: string | null;
  error_message?: string | null;
  created_at: string;
  steps: VideoGenerationStepResponse[];
}

export interface ProjectResponse {
  id: string;
  user_id: string;
  project_name?: string | null;
  movie_id?: number | null;
  active_script_id?: string | null;
  active_tts_job_id?: string | null;
  active_video_job_id?: string | null;
  status: ProjectStatus;
  last_step: WorkflowStep;
  created_at: string;
  updated_at: string;
  movie?: MovieResponse | null;
  active_script?: ProjectScriptResponse | null;
  active_tts_job?: TTSJobResponse | null;
  active_video_job?: VideoJobResponse | null;
}

export interface MovieListResponse {
  movies: MovieResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface VoiceListResponse {
  voices: VoiceResponse[];
  total: number;
}

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

export interface NameSuggestion {
  name: string;
  reason?: string | null;
}

export interface SuggestedNamesResponse {
  suggestions: NameSuggestion[];
  cached: boolean;
}

export async function getSuggestedProjectNames(
  projectId: string,
  regenerate = false
): Promise<SuggestedNamesResponse> {
  const params = new URLSearchParams({ regenerate: String(regenerate) });
  return request<SuggestedNamesResponse>(
    `/projects/${projectId}/suggested-names?${params.toString()}`
  );
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

export async function searchMovies(query: string, pageSize = 20): Promise<MovieListResponse> {
  const params = new URLSearchParams({
    page_size: String(pageSize),
    sort_by: query.trim() ? "title" : "popularity",
  });
  if (query.trim()) params.set("query", query.trim());
  return request<MovieListResponse>(`/movies/search?${params.toString()}`);
}

export async function getPopularMovies(limit = 20): Promise<MovieResponse[]> {
  return request<MovieResponse[]>(`/movies/popular?limit=${limit}`);
}

export async function listVoices(): Promise<VoiceResponse[]> {
  return request<VoiceResponse[]>("/voices");
}

export async function searchVoices(query?: string): Promise<VoiceListResponse> {
  const params = new URLSearchParams();
  if (query?.trim()) params.set("query", query.trim());
  return request<VoiceListResponse>(`/voices/search?${params.toString()}`);
}

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

export async function createTTSJob(data: {
  projectId: string;
  scriptId: string;
  voiceId: string;
  autoActivate?: boolean;
}): Promise<TTSJobResponse> {
  const params = new URLSearchParams({
    auto_activate: String(data.autoActivate ?? true),
  });

  return request<TTSJobResponse>(`/tts?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify({
      project_id: data.projectId,
      script_id: data.scriptId,
      voice_id: data.voiceId,
    }),
  });
}

export async function getTTSJob(jobId: string): Promise<TTSJobResponse> {
  return request<TTSJobResponse>(`/tts/${jobId}`);
}

export async function createVideoJob(data: {
  projectId: string;
  ttsJobId?: string; // Made optional since we no longer require TTS
  autoActivate?: boolean;
}): Promise<VideoJobResponse> {
  const params = new URLSearchParams({
    project_id: data.projectId,
    auto_activate: String(data.autoActivate ?? true),
  });

  // Only include tts_job_id if provided
  if (data.ttsJobId) {
    params.set("tts_job_id", data.ttsJobId);
  }

  return request<VideoJobResponse>(`/video?${params.toString()}`, { method: "POST" });
}

export async function getVideoJob(jobId: string): Promise<VideoJobResponse> {
  return request<VideoJobResponse>(`/video/${jobId}?load_steps=true`);
}

export function tmdbImageUrl(path?: string | null, size = "w500"): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
