import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Debug SSE",
  "Development page for server-sent events debugging."
);

export default function DebugSseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
