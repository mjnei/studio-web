"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type RecorderState = "idle" | "recording" | "recorded";

export function VoiceRecorder({ onRecorded }: { onRecorded?: (blob: Blob) => void }) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    cleanup();
    chunksRef.current = [];
    audioBlobRef.current = null;
    setDuration(0);
    setPlaybackProgress(0);
    setIsPlaying(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        audioUrlRef.current = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        setState("recorded");
        onRecorded?.(blob);
      };

      mediaRecorder.start();
      setState("recording");

      const start = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } catch {
      setError("Microphone access denied. Please allow microphone permissions and try again.");
      setState("idle");
    }
  }, [cleanup, onRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playRecording = useCallback(() => {
    if (!audioUrlRef.current) return;
    cleanup();

    const audio = new Audio(audioUrlRef.current);
    audioRef.current = audio;
    setIsPlaying(true);

    const updateProgress = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setPlaybackProgress(audio.currentTime / audio.duration);
      }
      if (!audio.paused) {
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };

    audio.onplay = () => {
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    audio.play();
  }, [cleanup]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    }
  }, []);

  const discardRecording = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    audioBlobRef.current = null;
    setDuration(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
    setState("idle");
  }, [cleanup]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-4">
      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}

      {state === "idle" && (
        <div className="flex flex-col items-center gap-3 py-2">
          <button
            onClick={startRecording}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
            title="Start recording"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
          <p className="text-sm text-text-secondary">Click to record from your microphone</p>
          <p className="text-xs text-text-muted">30–60s recommended for best clone quality</p>
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
            </span>
            <span className="text-lg font-mono font-medium text-text-primary">{formatTime(duration)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised text-text-primary transition hover:bg-surface-hover"
            title="Stop recording"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
          <p className="text-sm text-text-secondary">Recording… click to stop</p>
        </div>
      )}

      {state === "recorded" && (
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-cyan text-white transition hover:opacity-90"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <div className="flex h-8 flex-1 items-center rounded bg-surface-raised px-1">
              <div
                className="h-5 rounded bg-accent-cyan/30 transition-all"
                style={{ width: `${Math.max(playbackProgress * 100, 2)}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-mono text-text-muted">{formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={discardRecording}
              className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary transition hover:bg-surface-hover"
            >
              Discard &amp; re-record
            </button>
            <button
              onClick={startRecording}
              className="rounded-md bg-accent-gradient-solid px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Save this voice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
