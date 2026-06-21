"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { VoiceRecordingCard } from "@/components/voices/voice-recording-card";
import { Button } from "@/components/ui/button";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";

export default function VoicesPage() {
  const [tab, setTab] = useState<"my" | "stock">("my");
  const [showRecorder, setShowRecorder] = useState(false);
  const { recordings, loading, error, deleteRecording } = useVoiceRecordings();

  const handleRecordingSaved = () => {
    setShowRecorder(false);
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRecorder(false)}
                >
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface-panel" />
          ))}
        </div>
      )}
    </div>
  );
}
