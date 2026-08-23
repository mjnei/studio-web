import { getAccessToken, request } from "@/lib/api-client";
import type { ProjectResponse } from "./types";

export async function regenerateThumbnail(
  projectId: string,
  customPrompt?: string | null
): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}/thumbnail/regenerate`, {
    method: "POST",
    body: JSON.stringify({ custom_prompt: customPrompt }),
  });
}

export async function retryThumbnailGeneration(projectId: string): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}/thumbnail/retry-generation`, {
    method: "POST",
  });
}

export async function uploadCustomThumbnail(
  projectId: string,
  file: File
): Promise<{ custom_thumbnail_url: string; width?: number; height?: number; warning?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  // For file uploads, we need to use fetch directly to let browser set Content-Type
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";
  const res = await fetch(`${API_BASE}/projects/${projectId}/thumbnail/upload`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to upload thumbnail");
  }

  return res.json();
}

export async function finalizeThumbnail(
  projectId: string,
  data: {
    thumbnailText?: string | null;
    thumbnailTextPosition?: string;
    thumbnailTextFont?: string;
    thumbnailTextColor?: string;
    thumbnailTextSize?: number;
    thumbnailTextBackgroundBlur?: boolean;
    useCustom?: boolean;
  }
): Promise<ProjectResponse> {
  return request<ProjectResponse>(`/projects/${projectId}/thumbnail/export`, {
    method: "POST",
    body: JSON.stringify({
      overlay_text: data.thumbnailText,
      overlay_position: data.thumbnailTextPosition || "left",
      overlay_font: data.thumbnailTextFont || "bold",
      overlay_color: data.thumbnailTextColor || "#FFFFFF",
      overlay_size: data.thumbnailTextSize ?? 1.0,
      overlay_background_blur: data.thumbnailTextBackgroundBlur ?? true,
      use_custom: data.useCustom ?? false,
    }),
  });
}
