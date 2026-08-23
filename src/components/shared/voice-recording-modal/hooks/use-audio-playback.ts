"use client";

import { useState, useRef, useCallback } from "react";

export interface UseAudioPlaybackResult {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  play: (url: string) => void;
  pause: () => void;
  stop: () => void;
  seek: (fraction: number) => void;
  reset: () => void;
}

export function useAudioPlayback(onPlaybackError?: () => void): UseAudioPlaybackResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const cancelRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    cancelRaf();
  }, [cancelRaf]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelRaf();
    }
  }, [cancelRaf]);

  const seek = useCallback((fraction: number) => {
    if (!audioRef.current?.duration || !isFinite(audioRef.current.duration)) return;
    audioRef.current.currentTime = fraction * audioRef.current.duration;
    setProgress(fraction);
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const play = useCallback(
    (url: string) => {
      if (!url) return;

      if (
        audioRef.current &&
        audioRef.current.paused &&
        audioRef.current.currentTime > 0 &&
        audioRef.current.currentTime < audioRef.current.duration
      ) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);

      const tick = () => {
        if (audio.duration && isFinite(audio.duration)) {
          setProgress(audio.currentTime / audio.duration);
          setCurrentTime(audio.currentTime);
        }
        if (!audio.paused && !audio.ended) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      audio.onplay = () => {
        rafRef.current = requestAnimationFrame(tick);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(1);
        setCurrentTime(audio.duration && isFinite(audio.duration) ? audio.duration : 0);
        cancelRaf();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        onPlaybackError?.();
        cancelRaf();
      };

      audio.play().catch(() => {
        setIsPlaying(false);
      });
    },
    [cancelRaf, onPlaybackError]
  );

  const reset = useCallback(() => {
    stop();
    audioRef.current = null;
  }, [stop]);

  return {
    isPlaying,
    progress,
    currentTime,
    play,
    pause,
    stop,
    seek,
    reset,
  };
}
