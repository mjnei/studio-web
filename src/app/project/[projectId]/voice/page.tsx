"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { Button } from "@/components/ui/button";

export default function VoicePage() {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Voice Selection & Generation</h2>

      <section className="mb-8">
        <h3 className="mb-3 text-base font-medium text-text-secondary">1. Choose a Voice</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Voice A", "Voice B", "Voice C", "Voice D"].map((name, i) => (
            <div
              key={name}
              onClick={() => setSelectedVoice(name)}
              className={`cursor-pointer rounded-lg border bg-surface-panel p-4 transition hover:border-accent-cyan/40 ${
                selectedVoice === name ? "border-accent-cyan" : "border-border-default"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">{name}</p>
                <button className="rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary">
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
              <p className="text-xs text-text-muted">
                English &middot; {i % 2 === 0 ? "Female" : "Male"}
              </p>
              <div className="mt-2 h-6 rounded bg-surface-raised" />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-base font-medium text-text-secondary">2. Record Your Voice</h3>
        <p className="mb-3 text-sm text-text-muted">
          Record a sample from your microphone to create a custom voice clone. No file uploads —
          your voice stays in the browser.
        </p>
        <VoiceRecorder />
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-base font-medium text-text-secondary">3. Preview Voice</h3>
        <div className="rounded-lg border border-border-default bg-surface-panel p-4">
          <div className="flex items-center gap-4">
            <button className="shrink-0 rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary">
              <Play className="w-5 h-5 fill-current" />
            </button>
            <div className="h-8 flex-1 rounded bg-surface-raised" />
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Preview of the first few sentences in the selected voice.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" size="sm">
              Sounds good, continue
            </Button>
            <Button variant="secondary" size="sm">
              Try a different voice
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-medium text-text-secondary">
          4. Generate Full Voiceover
        </h3>
        <div className="rounded-lg border border-border-default bg-surface-panel p-4">
          <p className="text-sm text-text-muted">
            Record and preview your voice first, then generate the full voiceover here.
          </p>
        </div>
      </section>
    </div>
  );
}
