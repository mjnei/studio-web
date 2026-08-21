"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic,
  X,
  Play,
  Pause,
  Circle,
  Square,
  RotateCcw,
  Check,
  Sparkles,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useI18n } from "@/i18n";
import type { VoiceResponse } from "@/lib/types/api";

type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "naming";

const MAX_DURATION_S = 60;

const LANGUAGES = [
  { code: "en" },
  { code: "es" },
  { code: "fr" },
  { code: "de" },
  { code: "ja" },
  { code: "ko" },
  { code: "zh" },
  { code: "pt" },
  { code: "it" },
  { code: "ru" },
];

function getSupportedMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function generateRandomName(): string {
  const adjectives = [
    "amber",
    "azure",
    "bronze",
    "coral",
    "crimson",
    "cyan",
    "emerald",
    "golden",
    "indigo",
    "jade",
    "lavender",
    "magenta",
    "navy",
    "olive",
    "pearl",
    "ruby",
    "sapphire",
    "silver",
    "topaz",
    "violet",
  ];
  const nouns = [
    "dolphin",
    "eagle",
    "falcon",
    "hawk",
    "lion",
    "owl",
    "panther",
    "phoenix",
    "raven",
    "tiger",
    "wolf",
    "bear",
    "fox",
    "lynx",
    "otter",
    "seal",
    "whale",
    "cobra",
    "dragon",
    "gryphon",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);

  return `${noun}-${adj}-${num}`;
}

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (recording: VoiceResponse) => void;
}

export function VoiceRecordingModal({ isOpen, onClose, onSaved }: VoiceRecordingModalProps) {
  const { t } = useI18n();
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [maxReached, setMaxReached] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [language, setLanguage] = useState("en");
  const [nameError, setNameError] = useState(false);
  const [languageError, setLanguageError] = useState(false);

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

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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

  const playRecording = useCallback(() => {
    const url = audioUrlRef.current;
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
      setError(t("voices.recording.errors.playbackFailed"));
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [t]);

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

  // Reset state when modal opens

  useEffect(() => {
    if (!isOpen) {
      // Clean up when closing
      stopPlayback();
      revokeUrl();
      clearTimer();
      releaseStream();
      return;
    }

    // Reset state when opening - use functional updates where possible
    setState("idle");
    setDuration(0);
    setIsPlaying(false);
    setPlaybackProgress(0);
    setPlaybackTime(0);
    setError(null);
    setMaxReached(false);
    setIsSaving(false);
    setVoiceName("");
    setLanguage("en");
    setNameError(false);
    setLanguageError(false);
  }, [isOpen, stopPlayback, revokeUrl, clearTimer, releaseStream]);

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
      setError(t("voices.recording.errors.browserUnsupported"));
      setState("idle");
      return;
    }
    mimeRef.current = mime;

    try {
      // Request microphone access with fallback constraints
      let stream: MediaStream | null = null;

      try {
        // Try with optimal constraints first
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        });
      } catch (err) {
        // If optimal constraints fail, try with minimal constraints
        console.warn("Optimal audio constraints failed, trying minimal constraints:", err);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onerror = () => {
        setError(t("voices.recording.errors.recordingFailed"));
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

        // Auto-play the recording
        setTimeout(() => {
          playRecording();
        }, 300);
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
      let msg = t("voices.recording.errors.startFailed");

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          msg = t("voices.recording.errors.permissionDenied");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          msg = t("voices.recording.errors.notFound");
        } else if (err.name === "NotReadableError") {
          msg = t("voices.recording.errors.inUse");
        } else if (err.name === "SecurityError") {
          msg = t("voices.recording.errors.securityBlocked");
        }
      }

      console.error("[VoiceRecording] Failed to start recording:", err);
      setError(msg);
      setState("idle");
    }
  }, [stopPlayback, revokeUrl, clearTimer, releaseStream, playRecording, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearTimer();
  }, [clearTimer]);

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
    if (!audioRef.current || !audioRef.current.duration || !isFinite(audioRef.current.duration))
      return;
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
    setIsSaving(false);
    setVoiceName("");
    setLanguage("en");
    setNameError(false);
    setLanguageError(false);
    setState("idle");
  }, [stopPlayback, revokeUrl, clearTimer, releaseStream]);

  const proceedToNaming = useCallback(() => {
    setState("naming");
    setVoiceName("");
    setNameError(false);
    setLanguageError(false);
    stopPlayback();
  }, [stopPlayback]);

  const generateName = useCallback(() => {
    setVoiceName(generateRandomName());
    setNameError(false);
  }, []);

  const saveRecording = useCallback(async () => {
    const blob = audioBlobRef.current;
    if (!blob) return;

    const title = voiceName.trim();

    // Validate name and language
    if (!title) {
      setNameError(true);
      return;
    }

    if (!language) {
      setLanguageError(true);
      return;
    }

    setIsSaving(true);
    setError(null);
    setNameError(false);
    setLanguageError(false);

    try {
      const { uploadVoice } = await import("@/lib/api/voice-client");
      const { convertWebmToAudio } = await import("@/lib/utils/audio-converter");

      // Convert WebM to pure audio format if needed
      let audioBlob = blob;
      const mimeType = mimeRef.current || blob.type || "audio/webm";

      if (mimeType.includes("webm")) {
        try {
          audioBlob = await convertWebmToAudio(blob, title);
        } catch (conversionErr) {
          // If conversion fails, proceed with original blob
          console.warn("Audio conversion failed, using original format:", conversionErr);
          audioBlob = new Blob([blob], { type: mimeType });
        }
      } else {
        audioBlob = new Blob([blob], { type: mimeType });
      }

      const newRecording = await uploadVoice(audioBlob, title, language, duration);
      onSaved?.(newRecording);
      discardRecording();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("voices.recording.errors.saveFailed"));
      setIsSaving(false);
    }
  }, [duration, voiceName, language, onSaved, discardRecording, onClose, t]);

  const formatTime = (s: number) => {
    const clamped = Math.max(0, Math.floor(s));
    const m = Math.floor(clamped / 60);
    const sec = clamped % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const maxDurationLabel = formatTime(MAX_DURATION_S);
  const showHttpsTip = error === t("voices.recording.errors.securityBlocked");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-auto max-w-md w-full m-4 rounded-2xl border border-border-default bg-gradient-to-b from-surface-panel to-surface-raised p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <Heading variant="subsection" as="h2" className="text-text-primary">
            {t("voices.recording.title")}
          </Heading>
          <button
            onClick={onClose}
            disabled={isSaving || state === "recording"}
            className="p-2 rounded-lg hover:bg-surface-raised transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 px-4 py-3 border border-red-500/20">
            <X size={18} className="mt-0.5 shrink-0 text-red-400" />
            <div className="text-sm text-red-300">
              <p>{error}</p>
              {showHttpsTip && (
                <p className="mt-1 text-xs text-red-400">{t("voices.recording.httpsTip")}</p>
              )}
            </div>
          </div>
        )}

        {state === "requesting" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-accent-cyan/30 border-t-accent-cyan" />
              <Mic
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-cyan"
                size={28}
              />
            </div>
            <p className="text-sm text-text-secondary">{t("voices.recording.requestingAccess")}</p>
          </div>
        )}

        {state === "idle" && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-surface-raised p-6 shadow-inner">
                <Mic size={48} className="text-text-muted" />
              </div>
              <div className="text-center">
                <Heading variant="subsection" as="h3" className="text-text-primary mb-1">
                  {t("voices.recording.readyTitle")}
                </Heading>
                <p className="text-sm text-text-muted">{t("voices.recording.readyHint")}</p>
              </div>
            </div>
            <button
              onClick={startRecording}
              className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-400/50 active:scale-95"
              title={t("voices.recording.startRecording")}
            >
              <div className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <Circle size={32} className="fill-white text-white" />
            </button>
            <p className="text-xs text-center text-text-muted">
              {t("voices.recording.maxDuration", { time: maxDurationLabel })}
            </p>
          </div>
        )}

        {state === "recording" && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
                <div className="relative rounded-full bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-lg">
                  <Mic size={40} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  <Heading variant="metric" as="span" className="font-mono text-text-primary">
                    {formatTime(duration)}
                  </Heading>
                </div>
                <p className="text-xs text-text-muted">
                  {t("voices.recording.ofMax", { time: maxDurationLabel })}
                </p>
              </div>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-2 rounded-full bg-surface-base overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all shadow-sm"
                  style={{ width: `${Math.min((duration / MAX_DURATION_S) * 100, 100)}%` }}
                />
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-raised shadow-xl transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-text-muted/30 active:scale-95"
              title={t("voices.recording.stopRecording")}
            >
              <Square size={36} className="fill-red-500 text-red-500" />
            </button>
            <p className="text-sm text-text-secondary animate-pulse">
              {t("voices.recording.recordingTap")}
            </p>
          </div>
        )}

        {state === "recorded" && (
          <div className="flex flex-col gap-5 py-4">
            {maxReached && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <p className="text-xs text-amber-300">{t("voices.recording.maxReached")}</p>
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-4">
                <Check size={32} className="text-green-400" />
              </div>
              <div className="text-center">
                <Heading variant="subsection" as="h3" className="text-text-primary mb-1">
                  {t("voices.recording.completeTitle")}
                </Heading>
                <p className="text-sm text-text-muted">
                  {t("voices.recording.completeHint", { time: formatTime(duration) })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-surface-base p-3 shadow-inner">
              <button
                onClick={isPlaying ? pausePlayback : playRecording}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan to-blue-500 text-white shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface-base active:scale-95"
                title={isPlaying ? t("voices.recording.pause") : t("voices.recording.play")}
              >
                {isPlaying ? (
                  <Pause size={20} className="fill-current" />
                ) : (
                  <Play size={20} className="ml-0.5 fill-current" />
                )}
              </button>
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  seekPlayback(x / rect.width);
                }}
                className="relative flex h-10 flex-1 cursor-pointer items-center rounded-full bg-surface-raised px-2 overflow-hidden"
                title={t("voices.recording.seek")}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-accent-cyan to-blue-500 transition-all"
                  style={{ width: `${Math.max(playbackProgress * 100, 0)}%` }}
                />
                <div className="relative flex items-center justify-end w-full pr-2">
                  <span className="text-xs font-mono text-text-muted tabular-nums">
                    {formatTime(isPlaying || playbackProgress > 0 ? playbackTime : duration)}
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={discardRecording}
                disabled={isSaving}
                className="flex-1"
              >
                <RotateCcw size={16} className="mr-2" />
                {t("voices.recording.reRecord")}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={proceedToNaming}
                disabled={isSaving}
                className="flex-1"
              >
                {t("voices.recording.continue")}
              </Button>
            </div>
          </div>
        )}

        {state === "naming" && (
          <div className="flex flex-col gap-5 py-4">
            <div className="text-center">
              <Heading variant="subsection" as="h3" className="text-text-primary mb-1">
                {t("voices.recording.nameTitle")}
              </Heading>
              <p className="text-sm text-text-muted">{t("voices.recording.nameSubtitle")}</p>
            </div>

            <div>
              <label
                htmlFor="voice-name"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                {t("voices.recording.voiceName")}
              </label>
              <div className="relative">
                <input
                  id="voice-name"
                  type="text"
                  value={voiceName}
                  onChange={(e) => {
                    setVoiceName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  placeholder={t("voices.recording.namePlaceholder")}
                  className={`w-full rounded-xl border ${
                    nameError
                      ? "border-red-500 bg-red-500/5"
                      : "border-border-default bg-surface-raised"
                  } px-4 py-3 text-text-primary placeholder-text-muted transition-colors focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSaving) {
                      saveRecording();
                    }
                  }}
                  disabled={isSaving}
                />
                {nameError && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <X size={12} />
                    {t("voices.recording.nameRequired")}
                  </p>
                )}
              </div>

              <button
                onClick={generateName}
                disabled={isSaving}
                className="mt-3 flex items-center gap-2 text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} />
                {t("voices.recording.generateRandom")}
              </button>
            </div>

            <div>
              <label
                htmlFor="voice-language"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                {t("voices.recording.language")}
              </label>
              <div className="relative">
                <Globe
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <select
                  id="voice-language"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    if (languageError) setLanguageError(false);
                  }}
                  className={`w-full rounded-xl border ${
                    languageError
                      ? "border-red-500 bg-red-500/5"
                      : "border-border-default bg-surface-raised"
                  } pl-10 pr-4 py-3 text-text-primary transition-colors focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 disabled:opacity-50`}
                  disabled={isSaving}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {t(`voices.languages.${lang.code}`)}
                    </option>
                  ))}
                </select>
                {languageError && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <X size={12} />
                    {t("voices.recording.languageRequired")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setState("recorded")}
                disabled={isSaving}
                className="flex-1"
              >
                {t("voices.recording.back")}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={saveRecording}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("voices.recording.saving")}
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    {t("voices.recording.saveVoice")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
