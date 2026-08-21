import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Admin",
  description: "List and manage all user projects across the platform",
};

export default function AdminProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
