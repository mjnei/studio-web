"use client";

import { useState, useEffect } from "react";
import { Mic, Search, ChevronDown } from "lucide-react";
import { getAvailableVoices } from "@/lib/api/voice-client";
import type { VoiceResponse } from "@/lib/types/api";

interface VoiceSelectorProps {
  value: number | null;
  onChange: (voiceId: number) => void;
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await getAvailableVoices();
        setVoices([...response.own_voices, ...response.community_voices]);
      } catch (error) {
        console.error("Failed to load voices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadVoices();
  }, []);

  const selectedVoice = voices.find((v) => v.id === value);

  const filteredVoices = voices.filter((voice) =>
    voice.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-text-secondary mb-2">Voice</label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 rounded-lg border-2 border-border-default bg-surface-base px-4 py-3 text-left hover:border-accent-primary focus:border-accent-primary focus:outline-none transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 flex-shrink-0">
            <Mic className="h-4 w-4 text-purple-600" />
          </div>
          {selectedVoice ? (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{selectedVoice.name}</p>
              <p className="text-xs text-text-muted">{selectedVoice.language}</p>
            </div>
          ) : (
            <span className="text-sm text-text-muted">
              {isLoading ? "Loading voices..." : "Select a voice"}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-text-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-border-default bg-surface-base shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border-default bg-surface-panel">
            <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 py-2">
              <Search className="h-4 w-4 text-text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search voices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none"
              />
            </div>
          </div>

          {/* Voice List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredVoices.length === 0 ? (
              <div className="p-4 text-center text-sm text-text-muted">
                {isLoading ? "Loading..." : "No voices found"}
              </div>
            ) : (
              filteredVoices.map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => {
                    onChange(voice.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-raised transition-colors ${
                    voice.id === value ? "bg-accent-primary/10" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                      voice.id === value ? "bg-accent-primary/20" : "bg-purple-500/10"
                    }`}
                  >
                    <Mic
                      className={`h-4 w-4 ${voice.id === value ? "text-accent-primary" : "text-purple-600"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        voice.id === value ? "text-accent-primary" : "text-text-primary"
                      }`}
                    >
                      {voice.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {voice.language} • {voice.is_approved ? "Community" : "Own"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
}
