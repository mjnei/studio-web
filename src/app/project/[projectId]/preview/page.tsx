"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { Volume2, Play, Pause, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading } = useProjectState(projectId);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get first sentence from script for preview
  const previewText = useMemo(() => {
    if (!activeScript?.content) return "This is a preview of your selected voice with the script.";

    const sentences = activeScript.content.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length === 0) {
      return activeScript.content.substring(0, 200);
    }

    return sentences[0].trim();
  }, [activeScript]);

  // Get project name from localStorage
  const projectName = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`project-${projectId}-name`) || state?.movieTitle || "Your Project";
    }
    return state?.movieTitle || "Your Project";
  }, [projectId, state?.movieTitle]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!state?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(state.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        console.error("Audio playback error:", audioRef.current?.error);
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.error("Failed to play audio:", err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleContinue = () => {
    router.push(`/project/${projectId}/compose`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
          <p className="text-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Voice Preview</h2>
            <p className="mt-1 text-sm text-text-muted">
              Listen to how your voice sounds with the script
            </p>
          </div>
        </div>

        {/* Project info */}
        <Card variant="bordered" padding="md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple-muted">
              <CheckCircle className="h-5 w-5 text-accent-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">{projectName}</h3>
              <p className="mt-1 text-sm text-text-muted">
                Voice: {state?.voiceName || "Selected Voice"}
              </p>
            </div>
          </div>
        </Card>

        {/* Preview text card */}
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-accent-cyan" />
            <h3 className="text-lg font-medium text-text-primary">Preview Text</h3>
          </div>
          
          <div className="rounded-lg bg-surface-panel p-4 border border-border-default">
            <p className="text-sm text-text-primary leading-relaxed">
              "{previewText}"
            </p>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            This is the first sentence from your script in the tone of your chosen voice.
          </p>
        </Card>

        {/* Audio player card */}
        {state?.audioUrl ? (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <div className="mb-6">
                <button
                  onClick={handlePlayPause}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan text-white transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 fill-current" />
                  ) : (
                    <Play className="h-8 w-8 fill-current ml-1" />
                  )}
                </button>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                {isPlaying ? "Playing Preview..." : "Ready to Listen"}
              </h3>
              <p className="text-sm text-text-muted">
                Voice: {state.voiceName}
                {state.audioDuration && ` • Duration: ${Math.floor(state.audioDuration / 60)}:${(Math.round(state.audioDuration) % 60).toString().padStart(2, "0")}`}
              </p>

              {/* Native audio player as fallback */}
              <div className="mt-6">
                <audio controls src={state.audioUrl} className="w-full" />
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-cyan" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Generating Audio Preview
              </h3>
              <p className="text-sm text-text-muted">
                Please wait while we generate your audio preview...
              </p>
            </div>
          </Card>
        )}
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="preview"
        canGoNext={!!state?.audioUrl}
        onNext={handleContinue}
        canGoBack={true}
        isProcessing={!state?.audioUrl}
      />
    </>
  );
}
