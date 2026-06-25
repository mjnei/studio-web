import { request } from "@/lib/api-client";

export interface NameSuggestion {
  name: string;
  reason?: string;
}

export interface NameSuggestionsResponse {
  suggestions: NameSuggestion[];
}

/**
 * Generate project name suggestions based on movie title and script content
 */
export async function generateProjectNameSuggestions(
  movieTitle: string,
  scriptContent?: string
): Promise<NameSuggestionsResponse> {
  return request<NameSuggestionsResponse>("/llm/project-name-suggestions", {
    method: "POST",
    body: JSON.stringify({
      movie_title: movieTitle,
      script_content: scriptContent,
    }),
  });
}
