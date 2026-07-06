"use client";

import { useState } from "react";
import {
  Bell,
  Palette,
  FileText,
  Video,
  Shield,
  Download,
  Settings as SettingsIcon,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 ${
        checked
          ? "bg-gradient-to-r from-accent-primary to-accent-cyan shadow-glow"
          : "bg-surface-elevated border border-border-default"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

interface SettingRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
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

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Settings"
        description="Customize your experience and manage preferences"
        action={
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg font-medium transition-all shadow-glow hover:shadow-glow-hover"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <SettingsIcon className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        }
      />

      <div className="space-y-6">
        {/* Notifications Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive alerts and updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">In-app Alerts</h3>
              <div className="space-y-1">
                <SettingRow
                  title="Render completion"
                  description="Get notified when your video is ready"
                >
                  <Toggle
                    checked={notifications.renderCompletion}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, renderCompletion: !n.renderCompletion }))
                    }
                  />
                </SettingRow>
                <SettingRow title="Render failure" description="Alert me if a render fails">
                  <Toggle
                    checked={notifications.renderFailure}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, renderFailure: !n.renderFailure }))
                    }
                  />
                </SettingRow>
                <SettingRow
                  title="Project sharing"
                  description="When someone shares a project with me"
                >
                  <Toggle checked={true} onChange={() => {}} />
                </SettingRow>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">
                Email Notifications
              </h3>
              <div className="space-y-1">
                <SettingRow
                  title="Email alerts"
                  description="Receive email updates about render status"
                >
                  <Toggle
                    checked={notifications.emailNotifications}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, emailNotifications: !n.emailNotifications }))
                    }
                  />
                </SettingRow>
                <SettingRow
                  title="Weekly summary"
                  description="Get a weekly digest of your activity"
                >
                  <Toggle
                    checked={notifications.weeklySummary}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, weeklySummary: !n.weeklySummary }))
                    }
                  />
                </SettingRow>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Defaults Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Project Defaults</CardTitle>
                <CardDescription>Pre-fill these values for new projects</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Default Voice
                </label>
                <select
                  value={defaults.voice}
                  onChange={(e) => setDefaults((d) => ({ ...d, voice: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="none">None</option>
                  <option value="voice-a">Voice A</option>
                  <option value="voice-b">Voice B</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Resolution
                </label>
                <select
                  value={defaults.resolution}
                  onChange={(e) => setDefaults((d) => ({ ...d, resolution: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p (Recommended)</option>
                  <option value="4k">4K</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Frame Rate
                </label>
                <select
                  value={defaults.fps}
                  onChange={(e) => setDefaults((d) => ({ ...d, fps: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="24">24 fps (Cinematic)</option>
                  <option value="30">30 fps (Standard)</option>
                  <option value="60">60 fps (Smooth)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Export Format
                </label>
                <select
                  value={defaults.exportFormat}
                  onChange={(e) => setDefaults((d) => ({ ...d, exportFormat: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="mp4">MP4 (Recommended)</option>
                  <option value="webm">WebM</option>
                  <option value="mov">MOV</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the interface to your preference</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              title="Compact mode"
              description="Reduce spacing and use smaller thumbnails"
            >
              <Toggle
                checked={appearance.compactMode}
                onChange={() => setAppearance((a) => ({ ...a, compactMode: !a.compactMode }))}
              />
            </SettingRow>
            <SettingRow
              title="Auto-play previews"
              description="Automatically play clip and voice previews"
            >
              <Toggle
                checked={appearance.autoPlayPreviews}
                onChange={() =>
                  setAppearance((a) => ({ ...a, autoPlayPreviews: !a.autoPlayPreviews }))
                }
              />
            </SettingRow>
            <SettingRow
              title="Waveform animations"
              description="Animate audio waveforms when playing"
            >
              <Toggle
                checked={appearance.waveformAnimation}
                onChange={() =>
                  setAppearance((a) => ({ ...a, waveformAnimation: !a.waveformAnimation }))
                }
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Data & Privacy Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Manage your data and privacy preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              title="Usage analytics"
              description="Help us improve by sharing anonymized data"
            >
              <Toggle checked={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow
              title="Export my data"
              description="Download all your projects and account info"
            >
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-surface-raised text-sm font-medium text-text-primary hover:bg-surface-hover transition-all">
                <Download className="w-4 h-4" />
                Request Export
              </button>
            </SettingRow>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
