"use client";

import { useState, useEffect, useCallback } from "react";

export interface ScriptVersion {
  id: string;
  content: string;
  createdAt: string;
  wordCount: number;
  duration: number; // in seconds
  isActive: boolean;
}

export interface ProjectState {
  id: string;
  title?: string;
  
  // Step 1: Source/Movie Selection
  movieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  movieGenre?: string;
  movieRating?: number;
  movieDuration?: number;
  
  // Step 2: Script Generation (supports multiple versions)
  scripts: ScriptVersion[];
  activeScriptId?: string;
  
  // Step 3: Voice Generation
  voiceId?: string;
  voiceName?: string;
  audioUrl?: string;
  audioDuration?: number;
  
  // Step 4: Video Composition
  videoUrl?: string;
  videoStatus?: "idle" | "queued" | "processing" | "completed" | "failed";
  videoProgress?: number;
  videoJobId?: string;
  isRendering?: boolean;
  
  // Metadata
  status: "draft" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
  lastStep: "source" | "script" | "voice" | "compose";
}

const STORAGE_KEY_PREFIX = "huavoi_project_";

/**
 * Custom hook to manage project state with persistent storage.
 * Stores project data in localStorage and provides methods to update it.
 */
export function useProjectState(projectId: string) {
  const [state, setState] = useState<ProjectState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load project state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const key = `${STORAGE_KEY_PREFIX}${projectId}`;
        const stored = localStorage.getItem(key);
        
        if (stored) {
          const parsed = JSON.parse(stored) as ProjectState;
          setState(parsed);
        } else {
          // Initialize new project
          const newState: ProjectState = {
            id: projectId,
            scripts: [],
            status: "draft",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastStep: "source",
          };
          setState(newState);
          localStorage.setItem(key, JSON.stringify(newState));
        }
      } catch (error) {
        console.error("Error loading project state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [projectId]);

  // Save state to localStorage whenever it changes
  const saveState = useCallback(
    (newState: ProjectState) => {
      try {
        const key = `${STORAGE_KEY_PREFIX}${projectId}`;
        const updatedState = {
          ...newState,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(key, JSON.stringify(updatedState));
        setState(updatedState);
      } catch (error) {
        console.error("Error saving project state:", error);
      }
    },
    [projectId]
  );

  // Update movie selection (Step 1)
  const updateMovie = useCallback(
    (movie: {
      id: string;
      title: string;
      poster?: string;
      genre?: string;
      rating?: number;
      duration?: number;
    }) => {
      if (!state) return;
      saveState({
        ...state,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        movieGenre: movie.genre,
        movieRating: movie.rating,
        movieDuration: movie.duration,
        title: movie.title,
        lastStep: "source",
      });
    },
    [state, saveState]
  );

  // Add a new script version (Step 2)
  const addScript = useCallback(
    (content: string, wordCount: number, duration: number) => {
      if (!state) return;
      
      const newScript: ScriptVersion = {
        id: `script-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        wordCount,
        duration,
        isActive: true,
      };

      // Deactivate previous active script
      const updatedScripts = state.scripts.map(s => ({ ...s, isActive: false }));
      updatedScripts.push(newScript);

      saveState({
        ...state,
        scripts: updatedScripts,
        activeScriptId: newScript.id,
        lastStep: "script",
      });
    },
    [state, saveState]
  );

  // Set active script version
  const setActiveScript = useCallback(
    (scriptId: string) => {
      if (!state) return;
      
      const updatedScripts = state.scripts.map(s => ({
        ...s,
        isActive: s.id === scriptId,
      }));

      saveState({
        ...state,
        scripts: updatedScripts,
        activeScriptId: scriptId,
      });
    },
    [state, saveState]
  );

  // Update voice generation (Step 3)
  const updateVoice = useCallback(
    (voice: {
      id: string;
      name: string;
      audioUrl: string;
      duration?: number;
    }) => {
      if (!state) return;
      saveState({
        ...state,
        voiceId: voice.id,
        voiceName: voice.name,
        audioUrl: voice.audioUrl,
        audioDuration: voice.duration,
        lastStep: "voice",
      });
    },
    [state, saveState]
  );

  // Update video generation status (Step 4)
  const updateVideoStatus = useCallback(
    (update: {
      videoUrl?: string;
      videoStatus?: ProjectState["videoStatus"];
      videoProgress?: number;
      videoJobId?: string;
      isRendering?: boolean;
    }) => {
      if (!state) return;
      saveState({
        ...state,
        ...update,
        lastStep: "compose",
        status: update.videoUrl ? "completed" : state.status,
      });
    },
    [state, saveState]
  );

  // Get the active script
  const activeScript = state?.scripts.find(s => s.isActive) || state?.scripts[state.scripts.length - 1];

  // Delete a script version
  const deleteScript = useCallback(
    (scriptId: string) => {
      if (!state) return;
      
      const updatedScripts = state.scripts.filter(s => s.id !== scriptId);
      
      // If deleted script was active, make the most recent one active
      if (state.activeScriptId === scriptId && updatedScripts.length > 0) {
        updatedScripts[updatedScripts.length - 1].isActive = true;
        saveState({
          ...state,
          scripts: updatedScripts,
          activeScriptId: updatedScripts[updatedScripts.length - 1].id,
        });
      } else {
        saveState({
          ...state,
          scripts: updatedScripts,
        });
      }
    },
    [state, saveState]
  );

  // Update project title
  const updateTitle = useCallback(
    (title: string) => {
      if (!state) return;
      saveState({
        ...state,
        title,
      });
    },
    [state, saveState]
  );

  return {
    state,
    isLoading,
    activeScript,
    updateMovie,
    addScript,
    setActiveScript,
    deleteScript,
    updateVoice,
    updateVideoStatus,
    updateTitle,
  };
}

/**
 * Get all projects from localStorage
 */
export function getAllProjects(): ProjectState[] {
  try {
    const projects: ProjectState[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          projects.push(JSON.parse(stored));
        }
      }
    }
    return projects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error("Error loading projects:", error);
    return [];
  }
}

/**
 * Delete a project from localStorage
 */
export function deleteProject(projectId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${projectId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}
