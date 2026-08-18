import { Database, Cloud } from "lucide-react";

interface SourceBadgeProps {
  source?: "postgres" | "axiom";
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  if (!source) return null;

  if (source === "postgres") {
    return (
      <div className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 border border-blue-500/20">
        <Database className="h-3 w-3" />
        PostgreSQL
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-500 border border-purple-500/20">
      <Cloud className="h-3 w-3" />
      Axiom
    </div>
  );
}
