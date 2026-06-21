"use client";

import { useState } from "react";
import { Mic, Play, Pause, Volume2, Download, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export interface Voice {
  id: string;
  name: string;
  gender?: string;
  accent?: string;
  category?: string;
  provider?: string;
}

interface VoiceGenerationProps {
  script: string;
  voices: Voice[];
  selectedVoiceId?: string;
  audioUrl?: string;
  isGenerating?: boolean;
  progress?: number;
  onVoiceSelect: (voiceId: string) => void;
  onGenerate: (voiceId: string) => void;
  onChangeVoice: () => void;
}

export function VoiceGeneration({
  script,
  voices,
  selectedVoiceId,
  audioUrl,
  isGenerating = false,
  progress = 0,
  onVoiceSelect,
  onGenerate,
  onChangeVoice,
}: VoiceGenerationProps) {
  const [playing, setPlaying] = useState(false);
  const toast = useToast();

  const handleGenerate = () => {
    if (!selectedVoiceId) {
      toast.warning("Select Voice", "Please select a voice before generating");
      return;
    }
    onGenerate(selectedVoiceId);
  };

  const togglePlayback = () => {
    setPlaying(!playing);
    // Implement actual audio playback logic
  };

  const downloadAudio = () => {
    if (audioUrl) {
      // Implement download logic
      toast.success("Downloaded", "Audio file saved to your device");
    }
  };

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil(wordCount / 150);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
            <Mic className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Generate Voice</h2>
        <p className="text-text-secondary">
          Select a voice and generate TTS audio from your script
        </p>
      </div>

      {/* Voice Selection */}
      <Card variant="elevated" padding="lg">
        <CardHeader className="pb-4">
          <CardTitle>Select Voice</CardTitle>
          <p className="text-sm text-text-secondary mt-1">
            Choose the voice that best fits your project
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {voices.map((voice) => (
              <Card
                key={voice.id}
                variant="bordered"
                padding="md"
                interactive
                className={`
                  cursor-pointer transition-all
                  ${
                    selectedVoiceId === voice.id
                      ? "ring-2 ring-accent-primary border-accent-primary"
                      : ""
                  }
                `}
                onClick={() => onVoiceSelect(voice.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-secondary to-accent-tertiary">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{voice.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {voice.gender && (
                          <Badge variant="default" size="sm">
                            {voice.gender}
                          </Badge>
                        )}
                        {voice.accent && (
                          <Badge variant="default" size="sm">
                            {voice.accent}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedVoiceId === voice.id && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                {voice.category && <p className="text-xs text-text-secondary">{voice.category}</p>}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Section */}
      {!audioUrl ? (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Generate Audio</h3>
            <p className="text-text-secondary mb-2">
              {selectedVoiceId && selectedVoice
                ? `Ready to generate with ${selectedVoice.name}`
                : "Select a voice to continue"}
            </p>
            <p className="text-sm text-text-muted mb-6">
              Estimated duration: ~{estimatedDuration} minutes ({wordCount} words)
            </p>

            {isGenerating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                  <span className="text-text-secondary">Generating audio... {progress}%</span>
                </div>
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={<Volume2 className="w-5 h-5" />}
                onClick={handleGenerate}
                disabled={!selectedVoiceId}
              >
                Generate Voice Audio
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Audio Player */
        <div className="space-y-4">
          <Card variant="elevated" padding="lg" className="border-accent-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-completed/20">
                <Check className="w-5 h-5 text-status-completed" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Audio Generated Successfully</p>
                <p className="text-sm text-text-secondary">
                  Voice: {selectedVoice?.name || "Unknown"}
                </p>
              </div>
            </div>

            {/* Audio Player Controls */}
            <div className="bg-surface-raised rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  iconOnly
                  icon={playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  onClick={togglePlayback}
                />
                <div className="flex-1">
                  <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary"
                      style={{ width: "35%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-text-muted">0:42</span>
                    <span className="text-xs text-text-muted">{estimatedDuration}:00</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Download className="w-5 h-5" />}
                  onClick={downloadAudio}
                >
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Regenerate Option */}
          <Card variant="glass" padding="md" className="border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 flex-shrink-0">
                  <Mic className="w-4 h-4 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Not satisfied with the result?
                  </p>
                  <p className="text-xs text-text-secondary">Try a different voice or regenerate</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={onChangeVoice}>
                Change Voice
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
