"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, X, Play, Pause, Circle, Square, Volume2, VolumeX, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type RecorderState = "idle" | "requesting" | "recording" | "recorded";

const MAX_DURATION_S = 15;

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function VoiceRecorder({ onRecorded }: { onRecorded?: (blob: Blob) => void }) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [maxReached, setMaxReached] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const mimeRef = useRef<string>("");

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
    setPlaybackTime(0);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const revokeUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      stopPlayback();
      releaseStream();
      revokeUrl();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setMaxReached(false);
    stopPlayback();
    revokeUrl();
    clearTimer();
    chunksRef.current = [];
    audioBlobRef.current = null;
    audioRef.current = null;
    setDuration(0);
    setPlaybackProgress(0);
    setPlaybackTime(0);
    setIsPlaying(false);
    setState("requesting");

    const mime = getSupportedMimeType();
    if (!mime) {
      setError("Your browser does not support audio recording.");
      setState("idle");
      return;
    }
    mimeRef.current = mime;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onerror = () => {
        setError("Recording failed. Please try again.");
        releaseStream();
        clearTimer();
        setState("idle");
      };

      recorder.onstop = () => {
        releaseStream();
        clearTimer();

        const blob = new Blob(chunksRef.current, { type: mime });
        audioBlobRef.current = blob;
        audioUrlRef.current = URL.createObjectURL(blob);
        setState("recorded");
        onRecorded?.(blob);
      };

      recorder.start();
      setState("recording");

      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= MAX_DURATION_S) {
          setMaxReached(true);
          recorder.stop();
        }
      }, 200);
    } catch (err) {
      const msg = err instanceof DOMException && err.name === "NotAllowedError"
        ? "Microphone access denied. Please allow microphone permissions and try again."
        : "Could not start recording. Please check your microphone and try again.";
      setError(msg);
      setState("idle");
    }
  }, [stopPlayback, revokeUrl, clearTimer, releaseStream, onRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearTimer();
  }, [clearTimer]);

  const playRecording = useCallback(() => {
    const url = audioUrlRef.current;
    if (!url) return;

    if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0 && audioRef.current.currentTime < audioRef.current.duration) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    setPlaybackProgress(0);
    setPlaybackTime(0);

    const tick = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setPlaybackProgress(audio.currentTime / audio.duration);
        setPlaybackTime(audio.currentTime);
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
      setPlaybackProgress(1);
      setPlaybackTime(audio.duration && isFinite(audio.duration) ? audio.duration : 0);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setError("Playback failed. Please re-record your sample.");
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, []);

  const pausePlayback = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    }
  }, []);

  const seekPlayback = useCallback((fraction: number) => {
    if (!audioRef.current || !audioRef.current.duration || !isFinite(audioRef.current.duration)) return;
    audioRef.current.currentTime = fraction * audioRef.current.duration;
    setPlaybackProgress(fraction);
    setPlaybackTime(audioRef.current.currentTime);
  }, []);

  const discardRecording = useCallback(() => {
    stopPlayback();
    revokeUrl();
    clearTimer();
    releaseStream();
    chunksRef.current = [];
    audioBlobRef.current = null;
    audioRef.current = null;
    setDuration(0);
    setPlaybackProgress(0);
    setPlaybackTime(0);
    setIsPlaying(false);
    setMaxReached(false);
    setState("idle");
  }, [stopPlayback, revokeUrl, clearTimer, releaseStream]);

  const formatTime = (s: number) => {
    const clamped = Math.max(0, Math.floor(s));
    const m = Math.floor(clamped / 60);
    const sec = clamped % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-4">
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-red-500/10 px-3 py-2">
          <X size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {state === "requesting" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
          <p className="text-sm text-text-secondary">Requesting microphone access…</p>
        </div>
      )}

      {state === "idle" && (
        <div className="flex flex-col items-center gap-3 py-2">
          <button
            onClick={startRecording}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-surface-panel"
            title="Start recording"
          >
            <Circle size={24} className="fill-current" />
          </button>
          <p className="text-sm text-text-secondary">Click to record from your microphone</p>
          <p className="text-xs text-text-muted">30–60s recommended · max {formatTime(MAX_DURATION_S)}</p>
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <span className="text-xl font-mono font-medium text-text-primary">{formatTime(duration)}</span>
            <span className="text-xs text-text-muted">/ {formatTime(MAX_DURATION_S)}</span>
          </div>
          <div className="w-full max-w-sm">
            <div className="h-1.5 rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-red-500 transition-all"
                style={{ width: `${Math.min((duration / MAX_DURATION_S) * 100, 100)}%` }}
              />
            </div>
          </div>
          <button
            onClick={stopRecording}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised text-text-primary transition hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-text-muted focus:ring-offset-2 focus:ring-offset-surface-panel"
            title="Stop recording"
          >
            <Square size={24} className="fill-current" />
          </button>
          <p className="text-sm text-text-secondary">Recording… click to stop</p>
        </div>
      )}

      {state === "recorded" && (
        <div className="flex flex-col gap-4 py-2">
          {maxReached && (
            <p className="text-xs text-text-muted">Maximum duration reached. Recording stopped automatically.</p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-cyan text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface-panel"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                seekPlayback(x / rect.width);
              }}
              className="flex h-8 flex-1 cursor-pointer items-center rounded bg-surface-raised px-1"
              title="Seek"
            >
              <div
                className="h-5 rounded bg-accent-cyan/30 transition-all"
                style={{ width: `${Math.max(playbackProgress * 100, 2)}%` }}
              />
            </button>
            <span className="shrink-0 text-sm font-mono text-text-muted">
              {formatTime(isPlaying || playbackProgress > 0 ? playbackTime : duration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={discardRecording}
            >
              Discard &amp; re-record
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={startRecording}
            >
              Save this voice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
