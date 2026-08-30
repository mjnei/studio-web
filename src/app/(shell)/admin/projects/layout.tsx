import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Projects",
  "List and manage all user projects across the platform"
);

export default function AdminProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
