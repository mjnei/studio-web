"use client";

import { useState } from "react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-accent-cyan" : "bg-surface-raised"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    renderCompletion: true,
    renderFailure: true,
    weeklySummary: false,
    emailNotifications: true,
  });

  const [defaults, setDefaults] = useState({
    voice: "none",
    resolution: "1080p",
    fps: "30",
    exportFormat: "mp4",
    scriptTone: "standard",
    scriptLength: "standard",
  });

  const [appearance, setAppearance] = useState({
    compactMode: false,
    autoPlayPreviews: true,
    waveformAnimation: true,
  });

  const [render, setRender] = useState({
    autoCompose: false,
    backgroundMusic: "none",
    defaultVolume: "80",
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <div className="space-y-6">
        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-secondary">In-app alerts</h3>
              <div className="space-y-3">
                <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-text-secondary">Render completion</span>
                  <Toggle
                    checked={notifications.renderCompletion}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, renderCompletion: !n.renderCompletion }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-text-secondary">Render failure</span>
                  <Toggle
                    checked={notifications.renderFailure}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, renderFailure: !n.renderFailure }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-text-secondary">New project shared with me</span>
                  <Toggle checked={true} onChange={() => {}} />
                </label>
              </div>
            </div>
            <div className="border-t border-border-default pt-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Email notifications</h3>
              <div className="space-y-3">
                <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-text-secondary">Email alerts for renders</span>
                  <Toggle
                    checked={notifications.emailNotifications}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, emailNotifications: !n.emailNotifications }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-text-secondary">Weekly usage summary</span>
                  <Toggle
                    checked={notifications.weeklySummary}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, weeklySummary: !n.weeklySummary }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-text-secondary">Product updates & changelog</span>
                  <Toggle checked={true} onChange={() => {}} />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-2 text-lg font-semibold">Project Defaults</h2>
          <p className="mb-4 text-sm text-text-muted">
            Pre-fill these values when you create a new project.
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default voice</label>
              <select
                value={defaults.voice}
                onChange={(e) => setDefaults((d) => ({ ...d, voice: e.target.value }))}
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none"
              >
                <option value="none">None</option>
                <option value="voice-a">Voice A</option>
                <option value="voice-b">Voice B</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default resolution</label>
              <select
                value={defaults.resolution}
                onChange={(e) => setDefaults((d) => ({ ...d, resolution: e.target.value }))}
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4k">4K</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default FPS</label>
              <select
                value={defaults.fps}
                onChange={(e) => setDefaults((d) => ({ ...d, fps: e.target.value }))}
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none"
              >
                <option value="24">24 fps</option>
                <option value="30">30 fps</option>
                <option value="60">60 fps</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Default export format
              </label>
              <select
                value={defaults.exportFormat}
                onChange={(e) => setDefaults((d) => ({ ...d, exportFormat: e.target.value }))}
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none"
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-2 text-lg font-semibold">Script Generation</h2>
          <p className="mb-4 text-sm text-text-muted">
            Default AI behavior when generating scripts.
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default tone</label>
              <select
                value={defaults.scriptTone}
                onChange={(e) => setDefaults((d) => ({ ...d, scriptTone: e.target.value }))}
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none"
              >
                <option value="standard">Standard</option>
                <option value="narrative">Narrative</option>
                <option value="promotional">Promotional</option>
                <option value="energetic">Energetic</option>
                <option value="dramatic">Dramatic</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default length</label>
              <select
                value={defaults.scriptLength}
                onChange={(e) => setDefaults((d) => ({ ...d, scriptLength: e.target.value }))}
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none"
              >
                <option value="short">Short</option>
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Render & Compose</h2>
          <div className="space-y-4">
            <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Auto-compose on export</p>
                <p className="text-xs text-text-muted">
                  Skip manual compose step and go straight to render queue.
                </p>
              </div>
              <Toggle
                checked={render.autoCompose}
                onChange={() => setRender((r) => ({ ...r, autoCompose: !r.autoCompose }))}
              />
            </label>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Default background music
              </label>
              <select
                value={render.backgroundMusic}
                onChange={(e) => setRender((r) => ({ ...r, backgroundMusic: e.target.value }))}
                className="w-full max-w-sm rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none"
              >
                <option value="none">None</option>
                <option value="ambient">Ambient</option>
                <option value="cinematic">Cinematic</option>
                <option value="upbeat">Upbeat</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Default voiceover volume
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={render.defaultVolume}
                onChange={(e) => setRender((r) => ({ ...r, defaultVolume: e.target.value }))}
                className="w-full max-w-sm accent-accent-cyan"
              />
              <p className="mt-0.5 text-xs text-text-muted">{render.defaultVolume}%</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
          <div className="space-y-3">
            <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Compact mode</p>
                <p className="text-xs text-text-muted">
                  Reduce spacing and use smaller thumbnails.
                </p>
              </div>
              <Toggle
                checked={appearance.compactMode}
                onChange={() => setAppearance((a) => ({ ...a, compactMode: !a.compactMode }))}
              />
            </label>
            <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Auto-play previews</p>
                <p className="text-xs text-text-muted">
                  Automatically play clip and voice previews when opened.
                </p>
              </div>
              <Toggle
                checked={appearance.autoPlayPreviews}
                onChange={() =>
                  setAppearance((a) => ({ ...a, autoPlayPreviews: !a.autoPlayPreviews }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Waveform animations</p>
                <p className="text-xs text-text-muted">
                  Animate audio waveforms when playing. Disable for reduced motion.
                </p>
              </div>
              <Toggle
                checked={appearance.waveformAnimation}
                onChange={() =>
                  setAppearance((a) => ({ ...a, waveformAnimation: !a.waveformAnimation }))
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Data & Privacy</h2>
          <div className="space-y-3">
            <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Allow usage analytics</p>
                <p className="text-xs text-text-muted">
                  Help us improve by sharing anonymized usage data.
                </p>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Export all my data</p>
                <p className="text-xs text-text-muted">
                  Download a zip of your projects, voices, and account info.
                </p>
              </div>
              <button className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover">
                Request export
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
