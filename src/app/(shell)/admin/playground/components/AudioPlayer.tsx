"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  jobId: string;
}

export function AudioPlayer({ audioUrl, jobId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener("error", () => {
      console.error("Audio playback error");
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.remove();
    };
  }, [audioUrl]);

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
      a.download = `playground-${jobId}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Audio Player</h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
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
        <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-accent-primary to-purple-600 text-white hover:shadow-lg hover:shadow-accent-primary/30 transition-all"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Volume */}
        <div className="flex-1 flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
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
  );
}
