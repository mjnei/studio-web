"use client";

import { useState } from "react";
import { Plus, Play, Pause, Volume2 } from "lucide-react";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { VoiceRecordingCard } from "@/components/voices/voice-recording-card";
import { Button } from "@/components/ui/button";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";
import { useStockVoices } from "@/lib/hooks/use-stock-voices";
import { VoiceRecordingResponse, VoiceResponse } from "@/lib/types/api";
import { useRef } from "react";

export default function VoicesPage() {
  const [tab, setTab] = useState<"my" | "stock">("my");
  const [showRecorder, setShowRecorder] = useState(false);
  const { recordings, loading, error, deleteRecording, addRecording } = useVoiceRecordings();
  const { voices: stockVoices, loading: stockLoading, error: stockError } = useStockVoices();
  
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);

  const handleRecordingSaved = (newRecording: VoiceRecordingResponse) => {
    addRecording(newRecording);
    setShowRecorder(false);
  };

  const playStockVoiceAudio = async (voiceId: string, previewUrl: string | null | undefined) => {
    try {
      // Stop currently playing audio if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (!previewUrl) {
        return;
      }
      
      setPlayingVoiceId(voiceId);
      
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      
      audio.onerror = () => {
        setPlayingVoiceId(null);
      };
      
      audio.onended = () => {
        setPlayingVoiceId(null);
      };
      
      await audio.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      setPlayingVoiceId(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Voices</h1>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-surface-panel p-1">
        <button
          onClick={() => setTab("my")}
          className={`shrink-0 rounded-md px-4 py-1.5 text-sm font-medium ${
            tab === "my"
              ? "bg-surface-raised text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          My Voices
        </button>
        <button
          onClick={() => setTab("stock")}
          className={`shrink-0 rounded-md px-4 py-1.5 text-sm font-medium ${
            tab === "stock"
              ? "bg-surface-raised text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Stock Voices
        </button>
      </div>
      {tab === "my" ? (
        <div>
          {showRecorder ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium">Record New Voice</h2>
                <Button variant="secondary" size="sm" onClick={() => setShowRecorder(false)}>
                  Cancel
                </Button>
              </div>
              <VoiceRecorder onSaved={handleRecordingSaved} />
            </div>
          ) : (
            <div className="mb-6">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowRecorder(true)}
                className="w-full sm:w-auto"
              >
                <Plus size={18} className="mr-2" />
                Record your voice
              </Button>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-surface-panel" />
              ))}
            </div>
          ) : recordings.length === 0 ? (
            <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center">
              <p className="mb-2 text-text-secondary">You haven&apos;t saved any voices yet.</p>
              <p className="text-sm text-text-muted">
                Record a sample from your microphone to clone your first voice.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recordings.map((recording) => (
                <VoiceRecordingCard
                  key={recording.id}
                  recording={recording}
                  onDelete={deleteRecording}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {stockError && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{stockError}</p>
            </div>
          )}

          {stockLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface-panel" />
              ))}
            </div>
          ) : stockVoices.length === 0 ? (
            <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center">
              <p className="text-text-secondary">No stock voices available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {stockVoices.map((voice) => (
                <div
                  key={voice.id}
                  className="rounded-lg border border-border-default bg-surface-panel p-4 hover:border-accent-primary/60 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">{voice.name}</h3>
                      {voice.description && (
                        <p className="text-xs text-text-muted line-clamp-2 mt-1">{voice.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {voice.gender && (
                      <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-600 capitalize">
                        {voice.gender}
                      </span>
                    )}
                    {voice.language && (
                      <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs text-purple-600 uppercase">
                        {voice.language}
                      </span>
                    )}
                    {voice.accent && (
                      <span className="inline-flex items-center rounded-md bg-orange-500/10 px-2 py-1 text-xs text-orange-600 capitalize">
                        {voice.accent}
                      </span>
                    )}
                  </div>
                  
                  {voice.preview_url ? (
                    <button
                      onClick={() => {
                        if (playingVoiceId === voice.id) {
                          stopAudio();
                        } else {
                          playStockVoiceAudio(voice.id, voice.preview_url);
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all shadow-sm ${
                        playingVoiceId === voice.id
                          ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-accent-primary/30"
                          : "border border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5"
                      }`}
                      title={playingVoiceId === voice.id ? "Stop preview" : "Play preview"}
                    >
                      {playingVoiceId === voice.id ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Stop</span>
                          <Volume2 className="h-4 w-4 animate-pulse" />
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Preview</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="w-full block px-3 py-2 text-xs text-text-muted italic text-center">No preview</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
