import { request } from "@/lib/api-client";
import type { TTSJobResponse, VideoJobResponse } from "./types";

export async function createTTSJob(data: {
  projectId: string;
  scriptId: string;
  voiceId: string;
  voiceName?: string;
  scriptText: string;
  language?: string;
  ratio?: number;
  autoActivate?: boolean;
}): Promise<TTSJobResponse> {
  const params = new URLSearchParams({
    auto_activate: String(data.autoActivate ?? true),
  });

  return request<TTSJobResponse>(`/tts?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify({
      project_id: data.projectId,
      script_id: data.scriptId,
      voice_id: data.voiceId,
      voice_name: data.voiceName,
      text: data.scriptText,
      language: data.language ?? "zh",
      ratio: data.ratio ?? 1.0,
    }),
  });
}

export async function getTTSJob(jobId: string): Promise<TTSJobResponse> {
  return request<TTSJobResponse>(`/tts/${jobId}`);
}

export async function createVideoJob(data: {
  projectId: string;
  ttsJobId?: string; // Made optional since we no longer require TTS
  autoActivate?: boolean;
}): Promise<VideoJobResponse> {
  const params = new URLSearchParams({
    project_id: data.projectId,
    auto_activate: String(data.autoActivate ?? true),
  });

  // Only include tts_job_id if provided
  if (data.ttsJobId) {
    params.set("tts_job_id", data.ttsJobId);
  }

  return request<VideoJobResponse>(`/video?${params.toString()}`, { method: "POST" });
}

export async function getVideoJob(jobId: string): Promise<VideoJobResponse> {
  return request<VideoJobResponse>(`/video/${jobId}`);
}
