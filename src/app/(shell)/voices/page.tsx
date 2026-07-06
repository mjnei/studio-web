"use client";

import { useState, useRef } from "react";
import { Plus, Play, Pause, Volume2, Mic, Sparkles, Search, X, Globe, User } from "lucide-react";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { VoiceRecordingCard } from "@/components/voices/voice-recording-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Grid } from "@/components/ui/Grid";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";
import { useStockVoices, getVoicePreviewUrl } from "@/lib/hooks/use-stock-voices";
import { VoiceRecordingResponse, VoiceResponse } from "@/lib/types/api";

export default function VoicesPage() {
  const [tab, setTab] = useState<"my" | "stock">("my");
  const [showRecorder, setShowRecorder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { recordings, loading, error, deleteRecording, addRecording } = useVoiceRecordings();
  const { voices: stockVoices, loading: stockLoading, error: stockError } = useStockVoices();

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleRecordingSaved = (newRecording: VoiceRecordingResponse) => {
    addRecording(newRecording);
    setShowRecorder(false);
  };

  const playStockVoiceAudio = async (voiceId: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setPlayingVoiceId(voiceId);

      const audioUrl = await getVoicePreviewUrl(voiceId);
      if (!audioUrl) {
        setPlayingVoiceId(null);
        alert("Failed to load voice preview. Please try again.");
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onerror = () => {
        setPlayingVoiceId(null);
        alert("Failed to play audio. The preview file may be unavailable.");
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      setPlayingVoiceId(null);
      alert("Failed to play audio. Please try again.");
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  const filteredStockVoices = stockVoices.filter((voice) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      voice.name.toLowerCase().includes(query) ||
      voice.description?.toLowerCase().includes(query) ||
      voice.gender?.toLowerCase().includes(query) ||
      voice.accent?.toLowerCase().includes(query) ||
      voice.language?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Voice Library"
        description="Create custom voices or choose from our curated collection"
        action={
          tab === "my" && !showRecorder ? (
            <Button 
              variant="primary" 
              size="md"
              onClick={() => setShowRecorder(true)}
              className="w-full sm:w-auto shadow-lg shadow-accent-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Record New Voice
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-xl bg-surface-panel p-1.5 shadow-sm border border-border-default">
          <button
            onClick={() => {
              setTab("my");
              setSearchQuery("");
            }}
            className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === "my"
                ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>My Voices</span>
            {recordings.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  tab === "my" ? "bg-white/20" : "bg-surface-raised"
                }`}
              >
                {recordings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setTab("stock");
              setSearchQuery("");
            }}
            className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === "stock"
                ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Stock Voices</span>
            {stockVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  tab === "stock" ? "bg-white/20" : "bg-surface-raised"
                }`}
              >
                {stockVoices.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar (Stock Voices Only) */}
      {tab === "stock" && stockVoices.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search voices by name, gender, accent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-surface-panel pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-text-muted">
              Found {filteredStockVoices.length} voice{filteredStockVoices.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Content Area */}
      {tab === "my" ? (
        <div>
          {/* Voice Recorder */}
          {showRecorder && (
            <div className="mb-8 rounded-xl border border-border-default bg-surface-panel p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Record New Voice</h2>
                <Button variant="secondary" size="sm" onClick={() => setShowRecorder(false)}>
                  Cancel
                </Button>
              </div>
              <VoiceRecorder onSaved={handleRecordingSaved} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-surface-panel" />
              ))}
            </div>
          ) : recordings.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border-2 border-dashed border-border-default bg-surface-panel/50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10">
                <Mic className="h-8 w-8 text-accent-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">No voices yet</h3>
              <p className="mb-4 text-sm text-text-muted max-w-md mx-auto">
                Start by recording a voice sample from your microphone. Your voice will be cloned
                and ready to use in your projects.
              </p>
              {!showRecorder && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowRecorder(true)}
                  className="shadow-lg shadow-accent-primary/20"
                >
                  <Plus size={18} className="mr-2" />
                  Record Your First Voice
                </Button>
              )}
            </div>
          ) : (
            /* Voice Recordings Grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          {/* Error Message */}
          {stockError && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{stockError}</p>
            </div>
          )}

          {/* Loading State */}
          {stockLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-xl bg-surface-panel" />
              ))}
            </div>
          ) : filteredStockVoices.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border-2 border-dashed border-border-default bg-surface-panel/50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                {searchQuery ? "No voices found" : "No stock voices available"}
              </h3>
              <p className="text-sm text-text-muted">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Stock voices will appear here once they're added"}
              </p>
              {searchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            /* Stock Voices Grid */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStockVoices.map((voice) => (
                <div
                  key={voice.id}
                  className="group relative rounded-xl border border-border-default bg-surface-panel p-5 shadow-sm hover:shadow-lg hover:border-accent-primary/40 transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Voice Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-text-primary text-lg mb-2 truncate group-hover:text-accent-primary transition-colors">
                      {voice.name}
                    </h3>
                    {voice.description && (
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {voice.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {voice.gender && (
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 border border-blue-500/20 capitalize">
                        {voice.gender}
                      </span>
                    )}
                    {voice.language && (
                      <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-600 border border-purple-500/20 uppercase">
                        {voice.language}
                      </span>
                    )}
                    {voice.accent && (
                      <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-600 border border-orange-500/20 capitalize">
                        {voice.accent}
                      </span>
                    )}
                  </div>

                  {/* Preview Button */}
                  {voice.preview_path ? (
                    <button
                      onClick={() => {
                        if (playingVoiceId === voice.id) {
                          stopAudio();
                        } else {
                          playStockVoiceAudio(voice.id);
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        playingVoiceId === voice.id
                          ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30 scale-[1.02]"
                          : "border border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 hover:shadow-md"
                      }`}
                      title={playingVoiceId === voice.id ? "Stop preview" : "Play preview"}
                    >
                      {playingVoiceId === voice.id ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Playing</span>
                          <Volume2 className="h-4 w-4 animate-pulse" />
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Preview Voice</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center px-4 py-2.5 text-xs text-text-muted italic border border-border-default rounded-lg bg-surface-base/50">
                      No preview available
                    </div>
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
