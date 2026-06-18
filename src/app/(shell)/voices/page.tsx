"use client";

import { useState } from "react";
import { VoiceRecorder } from "@/components/shared/voice-recorder";

export default function VoicesPage() {
  const [tab, setTab] = useState<"my" | "stock">("my");
  const [showRecorder, setShowRecorder] = useState(false);

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
        <div className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-8 text-center">
          {showRecorder ? (
            <VoiceRecorder />
          ) : (
            <>
              <p className="mb-2 text-text-secondary">You haven&apos;t saved any voices yet.</p>
              <p className="mb-4 text-sm text-text-muted">
                Record a sample from your microphone to clone your first voice.
              </p>
              <button
                onClick={() => setShowRecorder(true)}
                className="rounded-md bg-accent-gradient-solid px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Record your voice
              </button>
            </>
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
