import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Video Jobs Dashboard",
  "Track video generation jobs and queue status."
);

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
