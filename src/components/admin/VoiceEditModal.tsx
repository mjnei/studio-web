"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil, Trash2, User } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { locales, localeNames, type Locale } from "@/i18n";
import {
  adminDeleteVoiceAvatar,
  adminUpdateVoice,
  adminUploadVoiceAvatar,
} from "@/lib/api/admin";
import type { VoiceWithCreator } from "@/lib/types/api";
import { useToast } from "@/components/ui/toast";
import { AVATAR_MAX_SIZE_PX } from "@/lib/utils/compress-avatar";

interface VoiceEditModalProps {
  open: boolean;
  voice: VoiceWithCreator | null;
  onClose: () => void;
  /** Called after any successful mutation (save, avatar upload/remove). */
  onSaved: (updated: VoiceWithCreator) => void;
}

const LANGUAGE_OPTIONS = locales.map((code) => ({
  value: code,
  label: `${localeNames[code].name} (${code})`,
}));

const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

export function VoiceEditModal({ open, voice, onClose, onSaved }: VoiceEditModalProps) {
  const toast = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Locale>("en");
  const [isShared, setIsShared] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarBusy, setIsAvatarBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !voice) return;
    setName(voice.name);
    const lang = (locales.includes(voice.language as Locale) ? voice.language : "en") as Locale;
    setLanguage(lang || "en");
    setIsShared(voice.is_shared);
    setIsApproved(voice.is_approved);
    setAvatarUrl(voice.creator_avatar_url ?? null);
    setError(null);
  }, [open, voice]);

  const busy = isSaving || isAvatarBusy;

  const handleSharedChange = (shared: boolean) => {
    setIsShared(shared);
    if (!shared) {
      setIsApproved(false);
    }
  };

  const handleApprovedChange = (approved: boolean) => {
    if (approved && !isShared) {
      setIsShared(true);
    }
    setIsApproved(approved);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !voice || busy) return;

    setIsAvatarBusy(true);
    setError(null);
    try {
      const updated = await adminUploadVoiceAvatar(voice.id, file);
      setAvatarUrl(updated.creator_avatar_url ?? null);
      onSaved(updated);
      toast.success("Avatar updated", "Community voice avatar saved");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setIsAvatarBusy(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!voice || !avatarUrl || busy) return;

    setIsAvatarBusy(true);
    setError(null);
    try {
      const updated = await adminDeleteVoiceAvatar(voice.id);
      setAvatarUrl(updated.creator_avatar_url ?? null);
      onSaved(updated);
      toast.success("Avatar removed", `Cleared avatar for "${voice.name}"`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setIsAvatarBusy(false);
    }
  };

  const handleSave = async () => {
    if (!voice || busy) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updated = await adminUpdateVoice(voice.id, {
        name: trimmed,
        language,
        is_shared: isShared,
        is_approved: isApproved,
      });
      onSaved(updated);
      toast.success("Voice updated", `Saved changes for "${updated.name}"`);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update voice");
    } finally {
      setIsSaving(false);
    }
  };

  if (!voice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!busy}
      closeOnEscape={!busy}
      header={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/15">
            <Pencil className="h-5 w-5 text-accent-primary" />
          </div>
          <div>
            <Heading variant="section" as="h2" className="text-text-primary">
              Edit Voice
            </Heading>
            <p className="text-caption text-text-muted">@{voice.creator_username}</p>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} loading={isSaving} disabled={busy}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <Label>Avatar</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border-default bg-surface-raised">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <User className="h-7 w-7" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept={AVATAR_ACCEPT}
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => avatarInputRef.current?.click()}
                disabled={busy}
                leftIcon={<ImagePlus className="h-4 w-4" />}
              >
                {avatarUrl ? "Change" : "Upload"}
              </Button>
              {avatarUrl ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAvatarRemove}
                  disabled={busy}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-caption text-text-muted">
            JPEG, PNG, or WebP · max 5MB · auto-resized to {AVATAR_MAX_SIZE_PX}×{AVATAR_MAX_SIZE_PX}
          </p>
        </div>

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          maxLength={255}
        />

        <Select
          label="Language"
          value={language}
          onChange={(value) => setLanguage(value as Locale)}
          options={LANGUAGE_OPTIONS}
          disabled={busy}
        />

        <Toggle
          checked={isShared}
          onChange={handleSharedChange}
          disabled={busy}
          label="Shared with community"
          description={
            isShared
              ? "Eligible for approval and the public catalog"
              : "Private to the owner. Turning off also revokes approval."
          }
        />

        <Toggle
          checked={isApproved}
          onChange={handleApprovedChange}
          disabled={busy || !isShared}
          label="Approved for catalog"
          description={
            !isShared
              ? "Enable sharing first to approve this voice"
              : isApproved
                ? "Visible in the public community catalog"
                : "Shared but not yet in the public catalog"
          }
        />

        {error ? <p className="text-caption text-red-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
