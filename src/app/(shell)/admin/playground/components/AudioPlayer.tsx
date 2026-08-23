"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw, X } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  jobId?: string;
  jobName?: string;
  onDismiss?: () => void;
}

export function AudioPlayer({ audioUrl, jobId, jobName, onDismiss }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play when component mounts
  useEffect(() => {
    if (audioRef.current) {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // Reset player when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.load();
      void audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Auto-dismiss when playback finishes
      if (onDismiss) {
        onDismiss();
      }
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error("Audio playback error for URL:", target.src);
      console.error("Error details:", target.error);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onDismiss]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${jobName || `job-${jobId || "audio"}`}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <audio ref={audioRef} src={audioUrl} className="hidden" />
      <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Heading variant="subsection" as="h3" className="text-text-primary">
            {jobName || `Job ${jobId || ""}`}
          </Heading>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              aria-label="Close player"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        {/* Waveform visualization (placeholder) */}
        <div className="mb-4 h-20 rounded-lg bg-surface-base border border-border-default flex items-center justify-center">
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-accent-primary rounded-t transition-all"
                style={{
                  height: `${Math.random() * 100}%`,
                  opacity: currentTime > (i / 40) * duration ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-raised accent-accent-primary"
          />
          <div className="mt-2 flex items-center justify-between text-caption text-text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-accent-primary to-purple-600 text-white hover:shadow-lg hover:shadow-accent-primary/30 transition-all"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Volume */}
          <div className="flex-1 flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center justify-center h-9 w-9 rounded-full border border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-surface-raised accent-accent-primary"
            />
          </div>
        </div>
      </div>
    </>
  );
}
