import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Movie Details",
  "View movie details and start a new project."
);

export default function MovieDetailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
