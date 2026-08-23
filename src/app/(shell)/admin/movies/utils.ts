import type { LayoutMode } from "@/components/ui/LayoutToggle";

export function getTmdbImageUrl(
  path: string | null | undefined,
  size: "w500" | "w780" = "w500"
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getGridClass(layoutMode: LayoutMode): string {
  switch (layoutMode) {
    case "grid-sm":
      return "grid gap-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    case "grid-md":
      return "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    case "list":
      return "space-y-4";
    default:
      return "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }
}
