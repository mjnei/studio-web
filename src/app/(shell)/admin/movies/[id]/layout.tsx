import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Movie Details",
  "View and edit movie details."
);

export default function AdminMovieDetailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
