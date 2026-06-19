import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button variant="primary" size="md">
          <Link href="/project/new">New Project</Link>
        </Button>
      </div>
      <div className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-8 text-center">
        <p className="mb-4 text-text-secondary">You don&apos;t have any projects yet.</p>
        <Button variant="primary" size="md">
          <Link href="/project/new">Create your first project</Link>
        </Button>
      </div>
    </div>
  );
}
