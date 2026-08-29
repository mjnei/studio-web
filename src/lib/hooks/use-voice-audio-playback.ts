"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoicePlaybackErrorType = "unavailable" | "play_failed" | "load_failed";

export interface UseVoiceAudioPlaybackOptions {
  onError?: (error: VoicePlaybackErrorType) => void;
}

function stopAudioElement(audioRef: React.RefObject<HTMLAudioElement | null>) {
  if (!audioRef.current) return;

  audioRef.current.pause();
  audioRef.current.currentTime = 0;
  audioRef.current = null;
}

/**
 * Shared voice sample playback hook.
 * Requires presigned audio_url to be attached before user interaction
 * (see attachVoiceAudioUrls / attachAdminVoiceAudioUrls).
 */
export function useVoiceAudioPlayback(options: UseVoiceAudioPlaybackOptions = {}) {
  const { onError } = options;
  const onErrorRef = useRef(onError);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingVoiceIdRef = useRef<number | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<number | null>(null);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    playingVoiceIdRef.current = playingVoiceId;
  }, [playingVoiceId]);

  useEffect(() => {
    return () => {
      stopAudioElement(audioRef);
    };
  }, []);

  const stopPlayback = useCallback(() => {
    stopAudioElement(audioRef);
    playingVoiceIdRef.current = null;
    setPlayingVoiceId(null);
    setLoadingVoiceId(null);
  }, []);

  const togglePlayback = useCallback(
    async (voiceId: number, audioUrl?: string | null) => {
      if (playingVoiceIdRef.current === voiceId) {
        stopPlayback();
        return;
      }

      stopAudioElement(audioRef);
      playingVoiceIdRef.current = null;
      setPlayingVoiceId(null);

      if (!audioUrl) {
        onErrorRef.current?.("unavailable");
        return;
      }

      setLoadingVoiceId(voiceId);

      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          playingVoiceIdRef.current = null;
          setPlayingVoiceId(null);
          setLoadingVoiceId(null);
        };

        audio.onerror = () => {
          console.error("Audio playback error:", audio.error);
          playingVoiceIdRef.current = null;
          setPlayingVoiceId(null);
          setLoadingVoiceId(null);
          onErrorRef.current?.("play_failed");
        };

        audio.oncanplay = () => {
          setLoadingVoiceId(null);
        };

        await audio.play();
        playingVoiceIdRef.current = voiceId;
        setPlayingVoiceId(voiceId);
        setLoadingVoiceId(null);
      } catch (err) {
        console.error("Failed to load/play audio:", err);
        playingVoiceIdRef.current = null;
        setPlayingVoiceId(null);
        setLoadingVoiceId(null);
        onErrorRef.current?.("load_failed");
      }
    },
    [stopPlayback]
  );

  const isPlaying = useCallback((voiceId: number) => playingVoiceId === voiceId, [playingVoiceId]);

  const isLoading = useCallback((voiceId: number) => loadingVoiceId === voiceId, [loadingVoiceId]);

  return {
    playingVoiceId,
    loadingVoiceId,
    togglePlayback,
    stopPlayback,
    isPlaying,
    isLoading,
  };
}
