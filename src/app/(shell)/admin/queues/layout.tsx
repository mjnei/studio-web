import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Queues",
  "Monitor queue health, throughput, and backlog."
);

export default function AdminQueuesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
