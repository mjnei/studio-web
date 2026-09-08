"use client";

import { useState } from "react";
import { Film, Music, Download, Copy, Check } from "lucide-react";
import type { FlowJobResponse } from "@/types/flow";

interface FlowResultsPreviewProps {
  job: FlowJobResponse;
}

type LocaleKey = "en" | "zh_cn" | "zh_tw";

export function FlowResultsPreview({ job }: FlowResultsPreviewProps) {
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("en");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getLocaleData = (locale: LocaleKey) => {
    switch (locale) {
      case "en":
        return {
          title: "English (en)",
          audioPath: job.audio_en_path,
          audioUrl: job.audio_en_url,
          videoPath: job.video_en_path,
          videoUrl: job.video_en_url,
          ttsStatus: job.tts_en_status,
        };
      case "zh_cn":
        return {
          title: "Simplified Chinese (zh-CN)",
          audioPath: job.audio_zh_cn_path,
          audioUrl: job.audio_zh_cn_url,
          videoPath: job.video_zh_cn_path,
          videoUrl: job.video_zh_cn_url,
          ttsStatus: job.tts_zh_cn_status,
        };
      case "zh_tw":
        return {
          title: "Traditional Chinese (zh-TW)",
          audioPath: job.audio_zh_tw_path,
          audioUrl: job.audio_zh_tw_url,
          videoPath: job.video_zh_tw_path,
          videoUrl: job.video_zh_tw_url,
          ttsStatus: job.tts_zh_tw_status,
        };
    }
  };

  const current = getLocaleData(activeLocale);

  const hasAnyResults =
    job.audio_en_path ||
    job.audio_zh_cn_path ||
    job.audio_zh_tw_path ||
    job.video_en_path ||
    job.video_zh_cn_path ||
    job.video_zh_tw_path;

  if (!hasAnyResults) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Film className="h-5 w-5 text-accent-primary" />
        <h3 className="text-body font-semibold text-text-primary">
          Media Outputs & Video Playback
        </h3>
      </div>

      {/* Locale Tabs */}
      <div className="flex rounded-lg bg-surface-panel p-1 border border-border-default">
        {(["en", "zh_cn", "zh_tw"] as LocaleKey[]).map((key) => {
          const data = getLocaleData(key);
          const hasMedia = data.videoPath || data.audioPath;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveLocale(key)}
              className={`flex-1 py-1.5 px-3 rounded-md text-caption font-medium transition-all ${
                activeLocale === key
                  ? "bg-surface-raised text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>{data.title}</span>
              {hasMedia && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Media Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rendered Video Player */}
        <div className="rounded-xl border border-border-default bg-surface-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-blue-400" />
              <h4 className="text-caption font-semibold text-text-primary">
                Final Rendered Video ({current.title})
              </h4>
            </div>
            {current.videoUrl && (
              <a
                href={current.videoUrl}
                download={`flow_${job.id}_${activeLocale}.mp4`}
                target="_blank"
                rel="noreferrer"
                className="text-micro text-accent-primary hover:underline flex items-center gap-1"
              >
                <Download className="h-3 w-3" /> Download
              </a>
            )}
          </div>

          {current.videoUrl || current.videoPath ? (
            <div className="space-y-2">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center border border-border-default">
                {current.videoUrl ? (
                  <video
                    key={current.videoUrl}
                    src={current.videoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-caption text-text-muted p-4 text-center">
                    Video rendered at: <code className="text-micro font-mono">{current.videoPath}</code>
                    <p className="text-micro mt-1 text-text-muted">Presigned URL unavailable</p>
                  </div>
                )}
              </div>
              {current.videoPath && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-base border border-border-default text-micro font-mono text-text-secondary">
                  <span className="truncate mr-2">{current.videoPath}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(current.videoPath!, "videoKey")}
                    className="text-accent-primary hover:text-accent-secondary p-1 shrink-0"
                    title="Copy S3 key"
                  >
                    {copiedKey === "videoKey" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video w-full rounded-lg border border-dashed border-border-default bg-surface-base/50 flex flex-col items-center justify-center p-6 text-center text-text-muted text-caption">
              <Film className="h-8 w-8 text-text-muted/40 mb-2" />
              <span>Video render not complete yet</span>
              <span className="text-micro mt-1">Status: {job.render_status}</span>
            </div>
          )}
        </div>

        {/* Synthesized TTS Audio */}
        <div className="rounded-xl border border-border-default bg-surface-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-purple-400" />
              <h4 className="text-caption font-semibold text-text-primary">
                TTS Synthesized Audio ({current.title})
              </h4>
            </div>
            {current.audioUrl && (
              <a
                href={current.audioUrl}
                download={`flow_${job.id}_${activeLocale}.mp3`}
                target="_blank"
                rel="noreferrer"
                className="text-micro text-accent-primary hover:underline flex items-center gap-1"
              >
                <Download className="h-3 w-3" /> Download
              </a>
            )}
          </div>

          {current.audioUrl || current.audioPath ? (
            <div className="space-y-3 pt-2">
              {current.audioUrl ? (
                <audio
                  key={current.audioUrl}
                  src={current.audioUrl}
                  controls
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <div className="p-3 rounded-lg bg-surface-base border border-border-default text-caption text-text-muted">
                  Audio file ready at: <code className="text-micro font-mono">{current.audioPath}</code>
                </div>
              )}
              {current.audioPath && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-base border border-border-default text-micro font-mono text-text-secondary">
                  <span className="truncate mr-2">{current.audioPath}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(current.audioPath!, "audioKey")}
                    className="text-accent-primary hover:text-accent-secondary p-1 shrink-0"
                    title="Copy S3 key"
                  >
                    {copiedKey === "audioKey" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-32 rounded-lg border border-dashed border-border-default bg-surface-base/50 flex flex-col items-center justify-center p-4 text-center text-text-muted text-caption">
              <Music className="h-6 w-6 text-text-muted/40 mb-1" />
              <span>TTS synthesis not ready yet</span>
              <span className="text-micro mt-1">Status: {current.ttsStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
