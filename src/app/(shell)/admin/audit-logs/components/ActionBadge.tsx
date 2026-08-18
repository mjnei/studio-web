"use client";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Settings,
  AlertCircle,
} from "lucide-react";

interface ActionBadgeProps {
  action: string;
}

export default function ActionBadge({ action }: ActionBadgeProps) {
  const actionLower = action.toLowerCase();

  // Determine icon and color based on action type
  let Icon = Settings;
  let colorClasses = "bg-gray-500/10 text-gray-600 dark:text-gray-400";

  if (actionLower.includes("create") || actionLower.includes("add")) {
    Icon = Plus;
    colorClasses = "bg-green-500/10 text-green-600 dark:text-green-500";
  } else if (
    actionLower.includes("update") ||
    actionLower.includes("edit") ||
    actionLower.includes("modify")
  ) {
    Icon = Edit;
    colorClasses = "bg-blue-500/10 text-blue-600 dark:text-blue-500";
  } else if (actionLower.includes("delete") || actionLower.includes("remove")) {
    Icon = Trash2;
    colorClasses = "bg-red-500/10 text-red-600 dark:text-red-500";
  } else if (
    actionLower.includes("view") ||
    actionLower.includes("read") ||
    actionLower.includes("get")
  ) {
    Icon = Eye;
    colorClasses = "bg-purple-500/10 text-purple-600 dark:text-purple-500";
  } else if (actionLower.includes("login") || actionLower.includes("signin")) {
    Icon = LogIn;
    colorClasses = "bg-teal-500/10 text-teal-600 dark:text-teal-500";
  } else if (actionLower.includes("logout") || actionLower.includes("signout")) {
    Icon = LogOut;
    colorClasses = "bg-orange-500/10 text-orange-600 dark:text-orange-500";
  } else if (actionLower.includes("approve") || actionLower.includes("accept")) {
    Icon = CheckCircle;
    colorClasses = "bg-green-500/10 text-green-600 dark:text-green-500";
  } else if (
    actionLower.includes("reject") ||
    actionLower.includes("decline") ||
    actionLower.includes("cancel")
  ) {
    Icon = XCircle;
    colorClasses = "bg-red-500/10 text-red-600 dark:text-red-500";
  } else if (actionLower.includes("upload") || actionLower.includes("import")) {
    Icon = Upload;
    colorClasses = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-500";
  } else if (actionLower.includes("download") || actionLower.includes("export")) {
    Icon = Download;
    colorClasses = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-500";
  } else if (actionLower.includes("error") || actionLower.includes("fail")) {
    Icon = AlertCircle;
    colorClasses = "bg-red-500/10 text-red-600 dark:text-red-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${colorClasses}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {action}
    </span>
  );
}
