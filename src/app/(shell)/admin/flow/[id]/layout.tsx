import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Flow Job Details",
  "Monitor and preview multilingual Flow video job generation."
);

export default function FlowJobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
