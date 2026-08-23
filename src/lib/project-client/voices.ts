import { request } from "@/lib/api-client";
import type { VoiceListResponse, VoiceResponse } from "./types";

export async function listVoices(): Promise<VoiceResponse[]> {
  return request<VoiceResponse[]>("/voices");
}

export async function searchVoices(query?: string): Promise<VoiceListResponse> {
  const params = new URLSearchParams();
  if (query?.trim()) params.set("query", query.trim());
  return request<VoiceListResponse>(`/voices/search?${params.toString()}`);
}
