export default function ProfilePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <div className="rounded-lg border border-border-default bg-surface-panel p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised text-xl font-bold text-text-muted">
            H
          </div>
          <div>
            <h2 className="text-lg font-semibold">Display Name</h2>
            <p className="text-sm text-text-muted">you@example.com</p>
          </div>
          <button className="ml-auto rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover">
            Edit profile
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md bg-surface-raised p-4">
            <p className="text-sm text-text-muted">Renders this month</p>
            <p className="mt-1 text-xl font-bold">0</p>
          </div>
          <div className="rounded-md bg-surface-raised p-4">
            <p className="text-sm text-text-muted">Storage used</p>
            <p className="mt-1 text-xl font-bold">0 MB</p>
          </div>
          <div className="rounded-md bg-surface-raised p-4">
            <p className="text-sm text-text-muted">Plan</p>
            <p className="mt-1 text-xl font-bold">Free</p>
          </div>
        </div>
      </div>
    </div>
  );
}
