import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users - Admin",
  description: "List and manage user accounts across the platform",
};

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
