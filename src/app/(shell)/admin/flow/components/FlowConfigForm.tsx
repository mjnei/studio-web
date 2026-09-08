"use client";

import { useState, useEffect } from "react";
import { Sliders, Mic, Search, ChevronDown, FastForward, Scissors, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAvailableVoices } from "@/lib/api/voice-client";
import type { VoiceResponse } from "@/lib/types/api";
import type { VideoResolution, VideoRatioFormat, ClipAlignmentStrategy } from "@/types/flow";

interface FlowConfigFormProps {
  voiceId: number | null;
  isAnon: boolean;
  speedRatio: number;
  resolution: VideoResolution;
  ratioFormat: VideoRatioFormat;
  clipAlignmentStrategy: ClipAlignmentStrategy;
  idempotencyKey: string;
  onChangeVoiceId: (id: number) => void;
  onChangeIsAnon: (isAnon: boolean) => void;
  onChangeSpeedRatio: (ratio: number) => void;
  onChangeResolution: (resolution: VideoResolution) => void;
  onChangeRatioFormat: (ratioFormat: VideoRatioFormat) => void;
  onChangeClipAlignmentStrategy: (strategy: ClipAlignmentStrategy) => void;
  onChangeIdempotencyKey: (key: string) => void;
  disabled?: boolean;
}

export function FlowConfigForm({
  voiceId,
  isAnon,
  speedRatio,
  resolution,
  ratioFormat,
  clipAlignmentStrategy,
  idempotencyKey,
  onChangeVoiceId,
  onChangeIsAnon,
  onChangeSpeedRatio,
  onChangeResolution,
  onChangeRatioFormat,
  onChangeClipAlignmentStrategy,
  onChangeIdempotencyKey,
  disabled = false,
}: FlowConfigFormProps) {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchVoices = async () => {
      try {
        const res = await getAvailableVoices();
        if (isMounted) {
          const combined = [...res.own_voices, ...res.community_voices];
          setVoices(combined);
          if (voiceId === null && combined.length > 0) {
            onChangeVoiceId(combined[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load voices:", err);
      } finally {
        if (isMounted) {
          setIsLoadingVoices(false);
        }
      }
    };
    void fetchVoices();
    return () => {
      isMounted = false;
    };
  }, [voiceId, onChangeVoiceId]);

  const selectedVoice = voices.find((v) => v.id === voiceId);
  const filteredVoices = voices.filter(
    (v) =>
      v.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      (v.language?.toLowerCase().includes(voiceSearch.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Sliders className="h-5 w-5 text-accent-primary" />
        <h3 className="text-body font-semibold text-text-primary">
          Voice & Video Generation Settings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voice Selector */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-caption font-medium text-text-primary mb-0">
              Multilingual Voice <span className="text-red-500">*</span>
            </Label>
            <label className="flex items-center gap-1.5 text-micro text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={isAnon}
                onChange={(e) => onChangeIsAnon(e.target.checked)}
                disabled={disabled}
                className="rounded border-border-default text-accent-primary focus:ring-accent-primary"
              />
              <span>Anonymous Voice</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => !disabled && setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
            disabled={disabled}
            className="w-full flex items-center justify-between gap-2.5 rounded-lg border border-border-default bg-surface-panel px-3.5 py-2.5 text-left hover:border-accent-primary/50 focus:border-accent-primary focus:outline-none transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/10 shrink-0">
                <Mic className="h-4 w-4 text-purple-400" />
              </div>
              {selectedVoice ? (
                <div className="min-w-0">
                  <p className="text-caption font-medium text-text-primary truncate">
                    {selectedVoice.name}
                  </p>
                  <p className="text-micro text-text-muted">{selectedVoice.language}</p>
                </div>
              ) : (
                <span className="text-caption text-text-muted">
                  {isLoadingVoices ? "Loading voices..." : "Select a voice"}
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-text-muted shrink-0 transition-transform ${
                isVoiceDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isVoiceDropdownOpen && (
            <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border-default bg-surface-base shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-border-default bg-surface-panel">
                <Input
                  type="search"
                  placeholder="Search voice name or language..."
                  value={voiceSearch}
                  onChange={(e) => setVoiceSearch(e.target.value)}
                  icon={<Search className="h-3.5 w-3.5" />}
                  className="h-8 text-caption"
                />
              </div>
              <div className="max-h-52 overflow-y-auto p-1">
                {filteredVoices.length === 0 ? (
                  <div className="p-3 text-center text-caption text-text-muted">
                    No voices found
                  </div>
                ) : (
                  filteredVoices.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onChangeVoiceId(v.id);
                        setIsVoiceDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-caption ${
                        v.id === voiceId
                          ? "bg-accent-muted text-accent-primary font-medium"
                          : "hover:bg-surface-hover text-text-primary"
                      }`}
                    >
                      <span className="truncate">{v.name}</span>
                      <span className="text-micro text-text-muted ml-2">{v.language}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Speed Ratio */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-caption font-medium text-text-primary mb-0">
              Speech Speed Ratio
            </Label>
            <span className="text-caption font-semibold text-accent-primary">
              {speedRatio.toFixed(1)}x
            </span>
          </div>
          <div className="pt-2">
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speedRatio}
              onChange={(e) => onChangeSpeedRatio(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-panel accent-accent-primary"
            />
            <div className="mt-1 flex items-center justify-between text-micro text-text-muted">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>
        </div>

        {/* Resolution */}
        <div>
          <Label className="text-caption font-medium text-text-primary mb-1.5">
            Render Resolution
          </Label>
          <select
            value={resolution}
            onChange={(e) => onChangeResolution(e.target.value as VideoResolution)}
            disabled={disabled}
            className="w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2.5 text-caption text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="480p">480p (Standard definition - Fast)</option>
            <option value="720p">720p (HD - Recommended)</option>
            <option value="1080p">1080p (Full HD)</option>
            <option value="1440p">1440p (2K Quad HD)</option>
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <Label className="text-caption font-medium text-text-primary mb-1.5">
            Aspect Ratio Format
          </Label>
          <select
            value={ratioFormat}
            onChange={(e) => onChangeRatioFormat(e.target.value as VideoRatioFormat)}
            disabled={disabled}
            className="w-full rounded-lg border border-border-default bg-surface-panel px-3 py-2.5 text-caption text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="16x9">16:9 (Landscape - YouTube/Desktop)</option>
            <option value="9x16">9:16 (Portrait - TikTok/Reels/Shorts)</option>
            <option value="1x1">1:1 (Square - Instagram/Social)</option>
            <option value="4x3">4:3 (Traditional TV/Monitor)</option>
            <option value="3x4">3:4 (Vertical Tablet)</option>
          </select>
        </div>
      </div>

      {/* Clip to Voice Alignment Strategy */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-caption font-medium text-text-primary mb-0">
            Video Clip to Voice Audio Alignment Strategy
          </Label>
          <span className="text-micro text-text-muted">Voice audio is never altered</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Option 2: Speed up long / slow down short (Default) */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChangeClipAlignmentStrategy("speed_long_slow_short")}
            className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all ${
              clipAlignmentStrategy === "speed_long_slow_short"
                ? "border-accent-primary bg-accent-primary/10 shadow-sm ring-1 ring-accent-primary/50"
                : "border-border-default bg-surface-panel hover:border-border-hover hover:bg-surface-hover/50"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                    clipAlignmentStrategy === "speed_long_slow_short"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "bg-surface-base text-text-muted"
                  }`}
                >
                  <FastForward className="h-4 w-4" />
                </div>
                <span className="text-caption font-semibold text-text-primary">
                  Speed Up Long / Slow Down Short
                </span>
              </div>
              <Badge className="bg-accent-primary/20 text-accent-primary border-accent-primary/30 text-micro">
                Default
              </Badge>
            </div>
            <p className="text-micro text-text-secondary leading-relaxed">
              <strong>Long clips</strong> are sped up to preserve all visual content. <strong>Short clips</strong> are slowed down to match voice window duration.
            </p>
          </button>

          {/* Option 1: Trim long / slow down short */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChangeClipAlignmentStrategy("trim_long_slow_short")}
            className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all ${
              clipAlignmentStrategy === "trim_long_slow_short"
                ? "border-accent-primary bg-accent-primary/10 shadow-sm ring-1 ring-accent-primary/50"
                : "border-border-default bg-surface-panel hover:border-border-hover hover:bg-surface-hover/50"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                    clipAlignmentStrategy === "trim_long_slow_short"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "bg-surface-base text-text-muted"
                  }`}
                >
                  <Scissors className="h-4 w-4" />
                </div>
                <span className="text-caption font-semibold text-text-primary">
                  Trim Long (Keep End) / Slow Down Short
                </span>
              </div>
              <span className="text-micro font-mono text-text-muted">Option 1</span>
            </div>
            <p className="text-micro text-text-secondary leading-relaxed">
              <strong>Long clips</strong> are trimmed from the front (retaining climax & ending action at 1.0x). <strong>Short clips</strong> are slowed down to match voice window.
            </p>
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-panel/80 border border-border-default text-micro text-text-muted">
          <Info className="h-3.5 w-3.5 text-accent-primary shrink-0" />
          <span>
            <strong>Audio Integrity Guarantee:</strong> In both strategies, speech narration audio speed is never altered, and audio is never trimmed.
          </span>
        </div>
      </div>

      {/* Idempotency Key */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-caption font-medium text-text-secondary mb-0">
            Idempotency Key (Optional)
          </Label>
          <button
            type="button"
            onClick={() => onChangeIdempotencyKey(crypto.randomUUID())}
            disabled={disabled}
            className="text-micro text-accent-primary hover:underline"
          >
            Generate UUID
          </button>
        </div>
        <Input
          value={idempotencyKey}
          onChange={(e) => onChangeIdempotencyKey(e.target.value)}
          placeholder="Client-generated key to prevent duplicate job creation..."
          disabled={disabled}
          className="text-caption font-mono"
        />
      </div>
    </div>
  );
}
