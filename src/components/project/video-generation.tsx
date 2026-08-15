"use client";

import Image from "next/image";
import { Video, Play, Download, Loader2, CheckCircle2, Film, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface VideoGenerationProps {
  movieTitle: string;
  moviePoster?: string;
  script: string;
  audioUrl: string;
  voiceName?: string;
  videoUrl?: string;
  status?: "idle" | "processing" | "completed" | "failed";
  progress?: number;
  steps?: ProcessingStep[];
  onStartGeneration: () => void;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
}

export function VideoGeneration({
  movieTitle,
  moviePoster,
  script,
  videoUrl,
  status = "idle",
  progress = 0,
  steps = [],
  onStartGeneration,
}: VideoGenerationProps) {
  const toast = useToast();

  const downloadVideo = () => {
    if (videoUrl) {
      // Implement download logic
      toast.success("Downloaded", "Video file saved to your device");
    }
  };

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil(wordCount / 150);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
            <Video className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Generate Video</h2>
        <p className="text-text-secondary">
          Create your final video with synchronized audio and visuals
        </p>
      </div>

      {/* Project Summary */}
      <Card variant="elevated" padding="lg">
        <CardHeader className="pb-4">
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-secondary to-accent-tertiary flex-shrink-0">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Movie</p>
                <p className="text-sm text-text-secondary">{movieTitle}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Duration</p>
                <p className="text-sm text-text-secondary">~{estimatedDuration} minutes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-surface-raised rounded-lg">
              <p className="text-lg font-bold text-accent-primary">{wordCount}</p>
              <p className="text-xs text-text-muted">Words</p>
            </div>
            <div className="text-center p-3 bg-surface-raised rounded-lg">
              <p className="text-lg font-bold text-accent-secondary">
                {script.split("\n\n").length}
              </p>
              <p className="text-xs text-text-muted">Paragraphs</p>
            </div>
            <div className="text-center p-3 bg-surface-raised rounded-lg">
              <p className="text-lg font-bold text-accent-tertiary">1080p</p>
              <p className="text-xs text-text-muted">Quality</p>
            </div>
            <div className="text-center p-3 bg-surface-raised rounded-lg">
              <p className="text-lg font-bold text-green-500">Ready</p>
              <p className="text-xs text-text-muted">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Status */}
      {status === "idle" && (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
                <Video className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Ready to Generate Video</h3>
            <p className="text-text-secondary mb-2">
              All components are ready. Click below to start video generation.
            </p>
            <p className="text-sm text-text-muted mb-8">
              This process may take 3-5 minutes depending on video length
            </p>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Video className="w-5 h-5" />}
              onClick={onStartGeneration}
            >
              Start Video Generation
            </Button>
          </div>
        </Card>
      )}

      {status === "processing" && (
        <Card variant="elevated" padding="lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Generating Video</CardTitle>
              <Badge variant="info">{Math.round(progress)}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="h-3 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-secondary via-accent-primary to-accent-tertiary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-text-secondary mt-2 text-center">
                Processing... This may take a few minutes
              </p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg transition-all
                    ${
                      step.status === "processing"
                        ? "bg-accent-primary/10 border border-accent-primary/30"
                        : step.status === "completed"
                          ? "bg-status-completed/10 border border-status-completed/30"
                          : "bg-surface-raised border border-border-default"
                    }
                  `}
                >
                  <div className="flex-shrink-0">
                    {step.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-status-completed" />
                    ) : step.status === "processing" ? (
                      <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border-default" />
                    )}
                  </div>
                  <p
                    className={`
                      text-sm font-medium
                      ${
                        step.status === "processing"
                          ? "text-accent-primary"
                          : step.status === "completed"
                            ? "text-status-completed"
                            : "text-text-muted"
                      }
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {status === "completed" && (
        <div className="space-y-4">
          {/* Success Card */}
          <Card variant="elevated" padding="lg" className="border-status-completed/30">
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-status-completed/20 border-2 border-status-completed">
                  <CheckCircle2 className="w-10 h-10 text-status-completed" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                Video Generated Successfully!
              </h3>
              <p className="text-text-secondary mb-8">
                Your video is ready to preview and download
              </p>

              {/* Video Preview */}
              <div className="max-w-3xl mx-auto mb-6">
                <div className="aspect-video bg-surface-raised rounded-xl overflow-hidden border border-border-default relative group">
                  {moviePoster ? (
                    <Image
                      src={moviePoster}
                      alt={movieTitle}
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 1024px) 100vw, 600px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-16 h-16 text-text-muted" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="primary" size="lg" leftIcon={<Play className="w-8 h-8" />} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Download className="w-5 h-5" />}
                  onClick={downloadVideo}
                >
                  Download Video
                </Button>
                <Button variant="secondary" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                  Preview Video
                </Button>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card variant="elevated" padding="md" className="border-border-subtle">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">🎉 What's Next?</p>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• Download your video and share it on social media</li>
                  <li>• Create another project with a different movie</li>
                  <li>• Explore advanced editing options in your project dashboard</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
