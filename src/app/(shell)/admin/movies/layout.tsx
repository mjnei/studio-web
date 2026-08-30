import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Movies",
  "Manage the movie library and metadata."
);

export default function AdminMoviesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
