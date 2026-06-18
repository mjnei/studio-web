import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="mb-8">
        <Link
          href="/projects"
          className="inline-block rounded-md bg-accent-gradient-solid px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          New Project
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-surface-panel p-5">
          <h2 className="mb-1 text-sm font-medium text-text-secondary">Recent Projects</h2>
          <p className="text-2xl font-bold text-text-primary">0</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-panel p-5">
          <h2 className="mb-1 text-sm font-medium text-text-secondary">Active Renders</h2>
          <p className="text-2xl font-bold text-text-primary">0</p>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-panel p-5">
          <h2 className="mb-1 text-sm font-medium text-text-secondary">My Voices</h2>
          <p className="text-2xl font-bold text-text-primary">0</p>
        </div>
      </div>
      <div className="mt-8 rounded-lg border border-border-default bg-surface-panel p-8 text-center">
        <p className="text-text-secondary">No recent activity yet. Start by creating a new project.</p>
      </div>
    </div>
  );
}
