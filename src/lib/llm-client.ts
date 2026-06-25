import { request } from "@/lib/api-client";

export interface NameSuggestion {
  name: string;
  reason?: string;
}

export interface NameSuggestionsResponse {
  suggestions: NameSuggestion[];
}

/**
 * Generate AI-powered project name suggestions using Agnes AI.
 * Requires script content - fallback suggestions should be generated client-side.
 */
export async function generateProjectNameSuggestions(
  movieTitle: string,
  scriptContent: string
): Promise<NameSuggestionsResponse> {
  return request<NameSuggestionsResponse>("/llm/project-name-suggestions", {
    method: "POST",
    body: JSON.stringify({
      movie_title: movieTitle,
      script_content: scriptContent,
    }),
  });
}
