import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Movie Library",
  "Browse and preview movies for your next project."
);

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
