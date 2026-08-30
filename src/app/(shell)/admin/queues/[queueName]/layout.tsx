import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Queue Details",
  "Inspect queue metrics, consumers, and messages."
);

export default function AdminQueueDetailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
