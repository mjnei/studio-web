import {
  Activity,
  BarChart3,
  Film,
  Layers,
  Mic,
  Play,
  ShieldCheck,
  Users,
  Zap,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";
import type { AdminStatsResponse } from "@/lib/api/admin";

export type AdminStatKey = keyof AdminStatsResponse;

export type AdminNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  showInDrawer?: boolean;
  showOnDashboard?: boolean;
  dashboardTitle?: string;
  dashboardDescription?: string;
  stat?: {
    key: AdminStatKey;
    label: string;
    gradient: string;
  };
};

/** Single source of truth for admin navigation (shell drawer + admin dashboard). */
export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin",
    labelKey: "shell.admin",
    icon: ShieldCheck,
    showInDrawer: true,
  },
  {
    href: "/admin/users",
    labelKey: "shell.adminUsers",
    icon: Users,
    showInDrawer: true,
    stat: {
      key: "total_users",
      label: "Total Users",
      gradient: "from-purple-500 to-pink-500",
    },
  },
  {
    href: "/admin/movies",
    labelKey: "shell.movies",
    icon: Film,
    showInDrawer: true,
    stat: {
      key: "total_movies",
      label: "Total Movies",
      gradient: "from-blue-500 to-cyan-500",
    },
  },
  {
    href: "/admin/voices",
    labelKey: "shell.voices",
    icon: Mic,
    showInDrawer: true,
    stat: {
      key: "active_voices",
      label: "Active Voices",
      gradient: "from-green-500 to-emerald-500",
    },
  },
  {
    href: "/admin/projects",
    labelKey: "shell.adminProjects",
    icon: BarChart3,
    showInDrawer: true,
    stat: {
      key: "projects_created",
      label: "Projects Created",
      gradient: "from-orange-500 to-red-500",
    },
  },
  {
    href: "/admin/queues",
    labelKey: "shell.queues",
    icon: Layers,
    showInDrawer: true,
    showOnDashboard: true,
    dashboardTitle: "Queue Management",
    dashboardDescription: "Monitor background job queues and inspect queue health",
  },
  {
    href: "/admin/playground-tts-jobs",
    labelKey: "shell.playgroundTTSJobs",
    icon: Gamepad2,
    showInDrawer: true,
    showOnDashboard: true,
    dashboardTitle: "Playground TTS Jobs",
    dashboardDescription: "Monitor anonymous playground TTS usage, rate limits, and failures",
  },
  {
    href: "/admin/studio-tts-jobs",
    labelKey: "shell.studioTTSJobs",
    icon: Zap,
    showInDrawer: true,
    showOnDashboard: true,
    dashboardTitle: "Studio TTS Jobs",
    dashboardDescription: "Track stale and failed studio TTS jobs with retry and cancel actions",
  },
  {
    href: "/admin/playground",
    labelKey: "shell.playgroundTTS",
    icon: Play,
    showInDrawer: true,
    showOnDashboard: true,
    dashboardTitle: "Playground",
    dashboardDescription: "Test voices and TTS settings without creating a full project",
  },
  {
    href: "/admin/audit-logs",
    labelKey: "shell.auditLogs",
    icon: Activity,
    showInDrawer: true,
    showOnDashboard: true,
    dashboardTitle: "Audit Logs",
    dashboardDescription: "Search compliance logs with filters, stats, and CSV export",
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminDrawerNavItems(): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => item.showInDrawer !== false);
}

export function getAdminStatNavItems(): AdminNavItem[] {
  return ADMIN_NAV.filter(
    (item): item is AdminNavItem & { stat: NonNullable<AdminNavItem["stat"]> } => Boolean(item.stat)
  );
}

export function getAdminFeatureNavItems(): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => item.showOnDashboard);
}
