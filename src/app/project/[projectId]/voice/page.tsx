"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Play, Pause, Download, ArrowRight, ArrowLeft, Sparkles, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";

const mockVoices = [
  { id: "voice-1", name: "Emma", gender: "Female", accent: "US English", description: "Warm and friendly" },
  { id: "voice-2", name: "James", gender: "Male", accent: "UK English", description: "Professional and clear" },
  { id: "voice-3", name: "Sofia", gender: "Female", accent: "Spanish", description: "Energetic and expressive" },
  { id: "voice-4", name: "Liam", gender: "Male", accent: "Australian", description: "Casual and engaging" },
];

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading } = useProjectState(projectId);
  
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(state?.voiceId || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Redirect if no script
  useEffect(() => {
    if (!isLoading && !activeScript) {
      router.push(`/project/${projectId}/script`);
    }
  }, [isLoading, activeScript, router, projectId]);

  const handleGenerateVoice = async () => {
    if (!selectedVoiceId || !activeScript) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate async TTS generation with progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 4000));
    clearInterval(interval);
    setGenerationProgress(100);
    
    // Mock audio URL
    const selectedVoice = mockVoices.find(v => v.id === selectedVoiceId);
    const mockAudioUrl = "https://example.com/audio.mp3";
    
    updateVoice({
      id: selectedVoiceId,
      name: selectedVoice?.name || "Unknown",
      audioUrl: mockAudioUrl,
      duration: activeScript.duration,
    });
    
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const handleContinue = () => {
    if (state?.audioUrl) {
      router.push(`/project/${projectId}/compose`);
    }
  };

  const handleBack = () => {
    router.push(`/project/${projectId}/script`);
  };

  const togglePlayback = () => {
    // TODO: Implement actual audio playback
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
          <p className="text-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Generate Voice</h2>
          <p className="mt-1 text-sm text-text-muted">
            Convert your script to speech with AI-powered text-to-speech
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={handleBack}
          >
            Back
          </Button>
          {state?.audioUrl && (
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={handleContinue}
            >
              Continue to Compose
            </Button>
          )}
        </div>
      </div>

      {/* Script Summary */}
      {activeScript && (
        <Card variant="bordered" padding="md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
              <Volume2 className="h-5 w-5 text-accent-cyan" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">Your Script</h3>
              <p className="mt-1 text-sm text-text-muted">
                {activeScript.wordCount} words • Estimated duration: {Math.floor(activeScript.duration / 60)}:{(activeScript.duration % 60).toString().padStart(2, '0')}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                {activeScript.content}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Voice Selection */}
      {!state?.audioUrl && (
        <Card variant="elevated" padding="lg">
          <h3 className="mb-4 text-lg font-medium text-text-primary">1. Select a Voice</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mockVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoiceId(voice.id)}
                className={`rounded-lg border p-4 text-left transition ${
                  selectedVoiceId === voice.id
                    ? "border-accent-cyan bg-accent-cyan-muted/20"
                    : "border-border-default bg-surface-panel hover:border-accent-cyan/40"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-text-primary">{voice.name}</p>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      selectedVoiceId === voice.id
                        ? "border-accent-cyan bg-accent-cyan"
                        : "border-border-default"
                    }`}
                  >
                    {selectedVoiceId === voice.id && (
                      <div className="h-full w-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-muted">
                  {voice.gender} • {voice.accent}
                </p>
                <p className="mt-1 text-xs text-text-secondary">{voice.description}</p>
                {/* TODO: Add preview button */}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Generation or Preview */}
      {!state?.audioUrl && selectedVoiceId && !isGenerating && (
        <Card variant="elevated" padding="lg">
          <h3 className="mb-4 text-lg font-medium text-text-primary">2. Generate Audio</h3>
          <div className="text-center">
            <p className="mb-6 text-sm text-text-muted">
              Ready to generate your voiceover with {mockVoices.find(v => v.id === selectedVoiceId)?.name}
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles className="h-5 w-5" />}
              onClick={handleGenerateVoice}
            >
              Generate Voice
            </Button>
          </div>
        </Card>
      )}

      {isGenerating && (
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-cyan" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">Generating Audio...</h3>
            <p className="mb-4 text-sm text-text-muted">
              Converting your script to speech. This may take a minute.
            </p>
            <div className="mx-auto max-w-md">
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-accent-cyan transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-muted">{generationProgress}% complete</p>
            </div>
          </div>
        </Card>
      )}

      {/* Audio Preview */}
      {state?.audioUrl && (
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Generated Audio</h3>
              <p className="mt-1 text-sm text-text-muted">
                Voice: {state.voiceName} • Duration: {state.audioDuration ? `${Math.floor(state.audioDuration / 60)}:${(state.audioDuration % 60).toString().padStart(2, '0')}` : 'Unknown'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={() => {
                  updateVoice({
                    id: "",
                    name: "",
                    audioUrl: "",
                  });
                  setSelectedVoiceId(null);
                }}
              >
                Regenerate
              </Button>
            </div>
          </div>

          {/* Audio Player */}
          <div className="rounded-lg border border-border-default bg-surface-panel p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayback}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-cyan text-white transition hover:bg-accent-cyan/90"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                  <div className="h-full w-0 rounded-full bg-accent-cyan transition-all" />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>0:00</span>
                  <span>
                    {state.audioDuration 
                      ? `${Math.floor(state.audioDuration / 60)}:${(state.audioDuration % 60).toString().padStart(2, '0')}`
                      : '0:00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
