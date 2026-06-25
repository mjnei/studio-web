import { request } from "@/lib/api-client";

export interface NameSuggestion {
  name: string;
  reason?: string;
}

export interface NameSuggestionsResponse {
  suggestions: NameSuggestion[];
}

/**
 * Generate project name suggestions based on movie metadata
 */
export async function generateProjectNameSuggestions(
  movieTitle: string,
  movieOverview?: string,
  movieGenres?: string[]
): Promise<NameSuggestionsResponse> {
  return request<NameSuggestionsResponse>("/llm/project-name-suggestions", {
    method: "POST",
    body: JSON.stringify({
      movie_title: movieTitle,
      movie_overview: movieOverview,
      movie_genres: movieGenres,
    }),
  });
}
