"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Play, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { FlowClipsUploader } from "./components/FlowClipsUploader";
import { FlowTextInput } from "./components/FlowTextInput";
import { FlowConfigForm } from "./components/FlowConfigForm";
import { FlowJobMonitor } from "./components/FlowJobMonitor";
import { FlowResultsPreview } from "./components/FlowResultsPreview";
import { FlowJobHistory } from "./components/FlowJobHistory";
import { createFlowJob } from "@/lib/api/flow-client";
import { convertCnToTw, convertTwToCn } from "@/lib/chinese-converter";
import type { FlowJobResponse, VideoResolution, VideoRatioFormat, ClipAlignmentStrategy } from "@/types/flow";

export default function FlowAdminPage() {
  const router = useRouter();
  const toast = useToast();

  // Form State
  const [clipS3Keys, setClipS3Keys] = useState<string[]>([]);
  const [textEn, setTextEn] = useState("");
  const [textZhCn, setTextZhCn] = useState("");
  const [textZhTw, setTextZhTw] = useState("");
  const [voiceId, setVoiceId] = useState<number | null>(null);
  const [isAnon, setIsAnon] = useState(false);
  const [speedRatio, setSpeedRatio] = useState(1.0);
  const [resolution, setResolution] = useState<VideoResolution>("720p");
  const [ratioFormat, setRatioFormat] = useState<VideoRatioFormat>("16x9");
  const [clipAlignmentStrategy, setClipAlignmentStrategy] = useState<ClipAlignmentStrategy>("speed_long_slow_short");
  const [skipFirstFrame, setSkipFirstFrame] = useState(true);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // Submission & Active Job State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<FlowJobResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validate Clips
    if (clipS3Keys.length !== 10) {
      setFormError("Exactly 10 video clip S3 keys are required. Please upload clips or load sample keys.");
      return;
    }

    // 2. Validate English Text
    if (!textEn.trim()) {
      setFormError("English narration text (text_en) is mandatory.");
      return;
    }

    // 3. Validate and Auto-Translate Chinese Texts
    let finalZhCn = textZhCn.trim();
    let finalZhTw = textZhTw.trim();

    if (!finalZhCn && !finalZhTw) {
      setFormError("At least one Chinese version (Simplified or Traditional) is mandatory.");
      return;
    }

    if (finalZhCn && !finalZhTw) {
      finalZhTw = convertCnToTw(finalZhCn);
      setTextZhTw(finalZhTw);
      toast.info("Auto-translated", "Generated Traditional Chinese from Simplified Chinese");
    } else if (finalZhTw && !finalZhCn) {
      finalZhCn = convertTwToCn(finalZhTw);
      setTextZhCn(finalZhCn);
      toast.info("Auto-translated", "Generated Simplified Chinese from Traditional Chinese");
    }

    // 4. Validate Voice
    if (voiceId === null) {
      setFormError("Please select a voice for narration.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createFlowJob({
        text_en: textEn.trim(),
        text_zh_cn: finalZhCn,
        text_zh_tw: finalZhTw,
        clip_s3_keys: clipS3Keys,
        voice_id: voiceId,
        is_anon: isAnon,
        speed_ratio: speedRatio,
        resolution,
        ratio_format: ratioFormat,
        clip_alignment_strategy: clipAlignmentStrategy,
        skip_first_frame: skipFirstFrame,
        idempotency_key: idempotencyKey.trim() || undefined,
      });

      setActiveJob(response);
      toast.success("Flow Job Created", `Job #${response.id} is now processing.`);
      router.push(`/admin/flow/${response.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create Flow job";
      setFormError(msg);
      toast.error("Creation Failed", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-caption text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Dashboard
        </Link>
      </div>

      <PageHeader
        title="Flow Video Jobs"
        description="Submit 3-locale narration text (en, zh-CN, zh-TW) and 10 video clips for multilingual TTS alignment and automated ffmpeg video composition."
      />

      {/* Active Job Monitoring & Results Section */}
      {activeJob && (
        <div className="space-y-6">
          <Card variant="glass" padding="lg" className="border-accent-primary/30">
            <CardContent>
              <FlowJobMonitor job={activeJob} onUpdateJob={setActiveJob} />
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardContent>
              <FlowResultsPreview job={activeJob} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submission Form */}
      <Card variant="glass" padding="lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-2 pb-4 border-b border-border-default">
              <Film className="h-5 w-5 text-accent-primary" />
              <h2 className="text-section font-semibold text-text-primary">
                Create & Submit Flow Job
              </h2>
            </div>

            {/* Section 1: Video Clips */}
            <FlowClipsUploader
              clipS3Keys={clipS3Keys}
              onChangeClipKeys={setClipS3Keys}
              disabled={isSubmitting}
            />

            <hr className="border-border-default" />

            {/* Section 2: 3-Locale Texts */}
            <FlowTextInput
              textEn={textEn}
              textZhCn={textZhCn}
              textZhTw={textZhTw}
              onChangeTextEn={setTextEn}
              onChangeTextZhCn={setTextZhCn}
              onChangeTextZhTw={setTextZhTw}
              disabled={isSubmitting}
            />

            <hr className="border-border-default" />

            {/* Section 3: Voice & Render Settings */}
            <FlowConfigForm
              voiceId={voiceId}
              isAnon={isAnon}
              speedRatio={speedRatio}
              resolution={resolution}
              ratioFormat={ratioFormat}
              clipAlignmentStrategy={clipAlignmentStrategy}
              skipFirstFrame={skipFirstFrame}
              idempotencyKey={idempotencyKey}
              onChangeVoiceId={setVoiceId}
              onChangeIsAnon={setIsAnon}
              onChangeSpeedRatio={setSpeedRatio}
              onChangeResolution={setResolution}
              onChangeRatioFormat={setRatioFormat}
              onChangeClipAlignmentStrategy={setClipAlignmentStrategy}
              onChangeSkipFirstFrame={setSkipFirstFrame}
              onChangeIdempotencyKey={setIdempotencyKey}
              disabled={isSubmitting}
            />

            {/* Error Notification */}
            {formError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-caption text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-caption text-text-muted">
                Synthesizes 3 audio tracks sequentially, then renders 3 synchronized videos with ffmpeg.
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Submitting Flow Job...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Submit Flow Job
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Job Lookup & History */}
      <Card variant="glass" padding="lg">
        <CardContent>
          <FlowJobHistory currentJobId={activeJob?.id} />
        </CardContent>
      </Card>
    </div>
  );
}
