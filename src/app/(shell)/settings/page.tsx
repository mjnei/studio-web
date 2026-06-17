export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <div className="space-y-6">
        <section className="rounded-lg border border-border-default bg-surface-panel p-6">
          <h2 className="mb-4 text-lg font-semibold">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Email</label>
              <input
                type="email"
                disabled
                className="w-full max-w-md rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-muted"
              />
            </div>
            <button className="text-sm text-accent-cyan hover:underline">Change password</button>
          </div>
        </section>
        <section className="rounded-lg border border-border-default bg-surface-panel p-6">
          <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
          <div className="space-y-3">
            {["Render completion", "Render failure", "Weekly usage summary"].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-border-default" />
                {item}
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border-default bg-surface-panel p-6">
          <h2 className="mb-4 text-lg font-semibold">Defaults</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default voice</label>
              <select className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary">
                <option>None</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default resolution</label>
              <select className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary">
                <option>1080p</option>
                <option>720p</option>
                <option>4K</option>
              </select>
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-status-failed/30 bg-surface-panel p-6">
          <h2 className="mb-2 text-lg font-semibold text-status-failed">Danger Zone</h2>
          <p className="mb-4 text-sm text-text-muted">Permanently delete your account and all data.</p>
          <button className="rounded-md border border-status-failed/50 px-4 py-2 text-sm text-status-failed hover:bg-status-failed/10">
            Delete account
          </button>
        </section>
      </div>
    </div>
  );
}
