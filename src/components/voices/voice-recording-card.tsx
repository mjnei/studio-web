"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Play, Pause } from "lucide-react";
import { VoiceRecordingResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";

interface VoiceRecordingCardProps {
  recording: VoiceRecordingResponse;
  onDelete: (id: string) => void;
}

export function VoiceRecordingCard({ recording, onDelete }: VoiceRecordingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDelete = async () => {
    if (!confirm(`Delete "${recording.title}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(recording.id);
    } catch (error) {
      alert("Failed to delete recording");
      setIsDeleting(false);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      setIsLoading(true);
      
      // Get audio from backend (backend streams the file to avoid CORS issues)
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = (await import("@/lib/api-client")).getAccessToken();
      
      try {
        // Fetch the audio as a blob from the backend
        const response = await fetch(`${API_BASE}/recordings/${recording.id}/audio`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to load audio");
        }
        
        // Create blob URL for playback
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
          alert("Failed to play audio");
        };
        
        audio.oncanplay = () => {
          setIsLoading(false);
        };
        
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
        setIsLoading(false);
        alert("Failed to load audio");
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        // Revoke object URL if it's a blob URL
        if (audioRef.current.src?.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
    };
  }, []);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-4 hover:border-border-hover transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{recording.title}</h3>
          {recording.description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">{recording.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 p-1.5 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          title="Delete recording"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mb-3">
        <span>{formatDate(recording.created_at)}</span>
        <span>{formatDuration(recording.duration_seconds)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={togglePlayback}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading...
            </>
          ) : isPlaying ? (
            <>
              <Pause size={14} className="mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play size={14} className="mr-1" />
              Play
            </>
          )}
        </Button>
        <Button variant="primary" size="sm" className="flex-1">
          Use Voice
        </Button>
      </div>
    </div>
  );
}
