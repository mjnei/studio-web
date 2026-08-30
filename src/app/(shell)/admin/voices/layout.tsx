import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Voices",
  "Manage voice profiles across the platform."
);

export default function AdminVoicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
