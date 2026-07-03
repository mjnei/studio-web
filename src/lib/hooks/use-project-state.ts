"use client";

import { useState, useEffect, useCallback } from "react";
import {
  activateScript,
  advanceProjectStep,
  createScript,
  getProject,
  listProjectScripts,
  updateProjectMovie,
  updateProjectName,
  tmdbImageUrl,
  type MovieResponse,
  type ProjectResponse,
  type ProjectScriptResponse,
  type TTSJobResponse,
  type VideoJobResponse,
} from "@/lib/project-client";

export interface ScriptVersion {
  id: string;
  content: string;
  createdAt: string;
  wordCount: number;
  duration: number;
  isActive: boolean;
}

export interface ProjectState {
  id: string;
  title?: string;
  projectName?: string;

  movieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  movieGenre?: string;
  movieRating?: number;
  movieDuration?: number;

  scriptSummary?: string;
  thumbnailUrl?: string;
  thumbnailStatus?: "pending" | "generating" | "completed" | "failed";
  thumbnailError?: string;
  customThumbnailUrl?: string;
  thumbnailText?: string;
  thumbnailTextPosition?: string;
  thumbnailTextFont?: string;
  thumbnailTextColor?: string;
  thumbnailTextSize?: number;
  thumbnailCustomPrompt?: string;
  finalThumbnailUrl?: string;
  thumbnailConfirmed?: boolean;
  thumbnailCompositionStatus?: "idle" | "processing" | "completed" | "failed";
  thumbnailCompositionError?: string;

  scripts: ScriptVersion[];
  activeScriptId?: string;

  voice?: {
    id: string;
    name: string;
  };
  voiceId?: string;
  voiceName?: string;
  audioUrl?: string;
  audioDuration?: number;
  ttsJobId?: string;
  activeTtsJobId?: string;
  ttsStatus?: "idle" | "queued" | "processing" | "completed" | "failed";
  ttsProgress?: number;

  videoUrl?: string;
  videoStatus?: "idle" | "queued" | "processing" | "completed" | "failed";
  videoProgress?: number;
  videoJobId?: string;
  videoSteps?: Array<{
    id: string;
    label: string;
    status: "pending" | "queued" | "processing" | "completed" | "failed";
    progress: number;
  }>;
  isRendering?: boolean;

  status: "draft" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
  lastStep: "source" | "script" | "details" | "voice" | "preview" | "compose";
}

function genreNames(movie?: MovieResponse | null): string | undefined {
  const names = movie?.genres
    ?.map((genre) => {
      const name = "name" in genre ? genre.name : undefined;
      return typeof name === "string" ? name : undefined;
    })
    .filter(Boolean);
  return names?.length ? names.join(", ") : undefined;
}

function mapScript(script: ProjectScriptResponse, activeScriptId?: string | null): ScriptVersion {
  return {
    id: script.id,
    content: script.content,
    createdAt: script.created_at,
    wordCount: script.word_count,
    duration: Math.round(script.estimated_duration_minutes * 60),
    isActive: script.id === activeScriptId,
  };
}

function mapTTS(job?: TTSJobResponse | null) {
  return {
    voiceId: job?.voice_id ?? undefined,
    voiceName: job?.voice_name ?? undefined,
    audioUrl: job?.audio_url ?? undefined,
    audioDuration: job?.audio_duration ?? undefined,
    ttsJobId: job?.id ?? undefined,
    ttsStatus: job?.status ?? undefined,
    ttsProgress: job?.progress ?? undefined,
  };
}

function mapVideo(job?: VideoJobResponse | null) {
  return {
    videoUrl: job?.video_url ?? undefined,
    videoStatus: job?.status ?? "idle",
    videoProgress: job?.progress ?? 0,
    videoJobId: job?.id ?? undefined,
    isRendering: job?.status === "queued" || job?.status === "processing",
    videoSteps: job?.steps?.map((step) => ({
      id: step.id,
      label: step.step_name,
      status: step.status,
      progress: step.progress,
    })),
  };
}

function mapProject(project: ProjectResponse, scripts: ProjectScriptResponse[] = []): ProjectState {
  const movie = project.movie;
  const mappedScripts = scripts.map((script) => mapScript(script, project.active_script_id));
  if (!mappedScripts.some((script) => script.isActive) && project.active_script) {
    mappedScripts.unshift(mapScript(project.active_script, project.active_script_id));
  }

  return {
    id: project.id,
    title: movie?.title,
    projectName: project.project_name ?? undefined,
    movieId: project.movie_id ? String(project.movie_id) : undefined,
    movieTitle: movie?.title,
    moviePoster: tmdbImageUrl(movie?.poster_path),
    movieGenre: genreNames(movie),
    movieRating: movie?.vote_average ?? undefined,
    movieDuration: movie?.runtime ?? undefined,
    scriptSummary: project.script_summary ?? undefined,
    thumbnailUrl: project.thumbnail?.base_image_url ?? undefined,
    thumbnailStatus: project.thumbnail?.base_image_status ?? undefined,
    thumbnailError: project.thumbnail?.base_image_error ?? undefined,
    customThumbnailUrl: project.thumbnail?.custom_image_url ?? undefined,
    thumbnailText: project.thumbnail?.overlay_text ?? undefined,
    thumbnailTextPosition: project.thumbnail?.overlay_position ?? undefined,
    thumbnailTextFont: project.thumbnail?.overlay_font ?? undefined,
    thumbnailTextColor: project.thumbnail?.overlay_color ?? undefined,
    thumbnailTextSize: project.thumbnail?.overlay_size ?? undefined,
    thumbnailCustomPrompt: project.thumbnail?.custom_prompt ?? undefined,
    finalThumbnailUrl: project.thumbnail?.final_url ?? undefined,
    thumbnailConfirmed: project.thumbnail?.confirmed ?? undefined,
    thumbnailCompositionStatus: project.thumbnail?.composition_status ?? undefined,
    thumbnailCompositionError: project.thumbnail?.composition_error ?? undefined,
    scripts: mappedScripts,
    activeScriptId: project.active_script_id ?? undefined,
    activeTtsJobId: project.active_tts_job_id ?? undefined,
    ...mapTTS(project.active_tts_job),
    ...mapVideo(project.active_video_job),
    status: project.status,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    lastStep: project.last_step,
  };
}

function scriptMetrics(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return {
    wordCount: words,
    estimatedDurationMinutes: Math.round((words / 150) * 100) / 100,
    paragraphCount: content.split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).length,
  };
}

export function useProjectState(projectId: string) {
  const [state, setState] = useState<ProjectState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [project, scripts] = await Promise.all([
        getProject(projectId),
        listProjectScripts(projectId).catch(() => []),
      ]);
      setState(mapProject(project, scripts));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load project";
      setError(message);
      setState(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Poll for thumbnail generation status
  useEffect(() => {
    if (state?.thumbnailStatus === "generating") {
      const pollInterval = setInterval(() => {
        void refresh();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    }
  }, [state?.thumbnailStatus, refresh]);

  // Poll for thumbnail composition status
  useEffect(() => {
    if (state?.thumbnailCompositionStatus === "processing") {
      const pollInterval = setInterval(() => {
        void refresh();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    }
  }, [state?.thumbnailCompositionStatus, refresh]);

  useEffect(() => {
    const handleProjectUpdate = (e: CustomEvent) => {
      if (e.detail?.projectId === projectId) {
        if (e.detail.projectName !== undefined) {
          setState((s) =>
            s ? { ...s, projectName: e.detail.projectName, title: e.detail.projectName } : s
          );
        } else {
          void refresh();
        }
      }
    };
    window.addEventListener("project-updated", handleProjectUpdate as EventListener);
    return () =>
      window.removeEventListener("project-updated", handleProjectUpdate as EventListener);
  }, [projectId, refresh]);

  const updateMovie = useCallback(
    async (movie: {
      id: string;
      title: string;
      poster?: string;
      genre?: string;
      rating?: number;
      duration?: number;
    }) => {
      const project = await updateProjectMovie(projectId, Number(movie.id));
      await advanceProjectStep(projectId, "source");
      setState((current) => ({
        ...(current ?? mapProject(project)),
        id: projectId,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        movieGenre: movie.genre,
        movieRating: movie.rating,
        movieDuration: movie.duration,
        title: movie.title,
        lastStep: "source",
        updatedAt: project.updated_at,
      }));
    },
    [projectId]
  );

  const addScript = useCallback(
    async (content: string) => {
      const metrics = scriptMetrics(content);
      const script = await createScript({
        projectId,
        content,
        ...metrics,
        autoActivate: true,
      });
      await advanceProjectStep(projectId, "script");
      setState((current) => {
        if (!current) return current;
        const inactiveScripts = current.scripts.map((item) => ({ ...item, isActive: false }));
        return {
          ...current,
          scripts: [mapScript(script, script.id), ...inactiveScripts],
          activeScriptId: script.id,
          lastStep: "script",
        };
      });
      return script;
    },
    [projectId]
  );

  const setActiveScript = useCallback(
    async (scriptId: string) => {
      await activateScript(projectId, scriptId);
      setState((current) =>
        current
          ? {
              ...current,
              scripts: current.scripts.map((script) => ({
                ...script,
                isActive: script.id === scriptId,
              })),
              activeScriptId: scriptId,
            }
          : current
      );
    },
    [projectId]
  );

  const deleteScript = useCallback((scriptId: string) => {
    setState((current) =>
      current
        ? {
            ...current,
            scripts: current.scripts.filter((script) => script.id !== scriptId),
          }
        : current
    );
  }, []);

  const updateVoice = useCallback(
    async (voice: {
      id: string;
      name: string;
      audioUrl?: string | null;
      duration?: number;
      jobId?: string;
      progress?: number;
    }) => {
      await advanceProjectStep(projectId, "voice");
      setState((current) =>
        current
          ? {
              ...current,
              voice: {
                id: voice.id,
                name: voice.name,
              },
              voiceId: voice.id,
              voiceName: voice.name,
              audioUrl: voice.audioUrl ?? current.audioUrl,
              audioDuration: voice.duration ?? current.audioDuration,
              ttsJobId: voice.jobId ?? current.ttsJobId,
              ttsStatus: voice.audioUrl ? "completed" : current.ttsStatus,
              ttsProgress: voice.progress ?? current.ttsProgress,
              lastStep: "voice",
            }
          : current
      );
    },
    [projectId]
  );

  const updateVideoStatus = useCallback(
    async (
      update: Partial<
        Pick<
          ProjectState,
          "videoUrl" | "videoStatus" | "videoProgress" | "videoJobId" | "videoSteps" | "isRendering"
        >
      >
    ) => {
      if (update.videoStatus || update.videoUrl) {
        await advanceProjectStep(projectId, "compose");
      }
      setState((current) =>
        current
          ? {
              ...current,
              ...update,
              lastStep: "compose",
              status: update.videoUrl ? "completed" : current.status,
            }
          : current
      );
    },
    [projectId]
  );

  const updateTitle = useCallback(
    async (newTitle: string) => {
      // Update project name in the backend
      await updateProjectName(projectId, newTitle);
      setState((current) =>
        current
          ? {
              ...current,
              projectName: newTitle,
            }
          : current
      );
    },
    [projectId]
  );

  const activeScript =
    state?.scripts.find((script) => script.isActive) || state?.scripts[state.scripts.length - 1];

  return {
    state,
    isLoading,
    error,
    activeScript,
    refresh,
    updateMovie,
    addScript,
    setActiveScript,
    deleteScript,
    updateVoice,
    updateVideoStatus,
    updateTitle,
  };
}

export async function getAllProjects(): Promise<ProjectState[]> {
  const projects = await import("@/lib/project-client").then((client) => client.listProjects(true));
  return projects.map((project) => mapProject(project));
}

export async function deleteProject(_projectId: string): Promise<void> {
  throw new Error("Project deletion is not wired to the backend yet.");
}
