import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/project/new"
          className="rounded-md bg-accent-gradient-solid px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          New Project
        </Link>
      </div>
      <div className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-8 text-center">
        <p className="mb-4 text-text-secondary">You don&apos;t have any projects yet.</p>
        <Link
          href="/project/new"
          className="inline-block rounded-md bg-accent-gradient-solid px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Create your first project
        </Link>
      </div>
    </div>
  );
}
