export type ViewMode = "library" | "import";

export type EditingMovie = {
  id: number;
  douban_id?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
};
