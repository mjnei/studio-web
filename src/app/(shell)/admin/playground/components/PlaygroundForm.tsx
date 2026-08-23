"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { VoiceSelector } from "./VoiceSelector";
import type { PlaygroundTTSRequest } from "@/types/admin";

interface PlaygroundFormProps {
  onSubmit: (data: PlaygroundTTSRequest) => Promise<void>;
  isLoading: boolean;
}

export function PlaygroundForm({ onSubmit, isLoading }: PlaygroundFormProps) {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState<number | null>(null);
  const [speedRatio, setSpeedRatio] = useState(1.0);

  const maxChars = 2000;
  const charCount = text.length;
  const isOverLimit = charCount > maxChars;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !voiceId || isOverLimit) return;

    await onSubmit({
      text: text.trim(),
      voice_id: voiceId,
      speed_ratio: speedRatio,
    });
  };

  const isValid = text.trim().length > 0 && voiceId !== null && !isOverLimit;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text Input */}
      <div>
        <label className="block text-body font-medium text-text-secondary mb-2">
          Text to Synthesize
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to convert to speech..."
          rows={6}
          maxLength={2000}
          className="w-full rounded-lg border-2 border-border-default bg-surface-base px-4 py-3 text-body text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none transition-colors resize-y"
          disabled={isLoading}
        />
        <div className="mt-2 flex items-center justify-between">
          <p
            className={`text-caption ${isOverLimit ? "text-red-600 font-semibold" : "text-text-muted"}`}
          >
            {charCount}/{maxChars} character{charCount !== 1 ? "s" : ""}
          </p>
          {isOverLimit ? (
            <p className="text-caption text-red-600 font-semibold">
              ⚠️ Text exceeds maximum length
            </p>
          ) : (
            charCount > 1600 && (
              <p className="text-caption text-orange-600">
                ⚠️ Long text may take more time to process
              </p>
            )
          )}
        </div>
      </div>

      {/* Voice Selector */}
      <VoiceSelector value={voiceId} onChange={setVoiceId} />

      {/* Speed Ratio Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-body font-medium text-text-secondary">Speech Speed</label>
          <span className="text-body font-bold text-accent-primary">{speedRatio.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={speedRatio}
          onChange={(e) => setSpeedRatio(parseFloat(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-raised accent-accent-primary"
          style={{
            background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${((speedRatio - 0.5) / 1.5) * 100}%, rgb(51, 51, 51) ${((speedRatio - 0.5) / 1.5) * 100}%, rgb(51, 51, 51) 100%)`,
          }}
        />
        <div className="mt-2 flex items-center justify-between text-caption text-text-muted">
          <span>0.5x (Slower)</span>
          <span>1.0x (Normal)</span>
          <span>2.0x (Faster)</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-purple-600 px-6 py-3 text-body font-semibold text-white hover:shadow-lg hover:shadow-accent-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Spinner className="h-5 w-5" />
            Generating Audio...
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            Generate TTS Audio
          </>
        )}
      </button>
    </form>
  );
}
