"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, User } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  adminDeleteVoiceAvatar,
  adminUploadVoiceAvatar,
} from "@/lib/api/admin";
import type { VoiceWithCreator } from "@/lib/types/api";
import { useToast } from "@/components/ui/toast";
import { AVATAR_MAX_SIZE_PX } from "@/lib/utils/compress-avatar";

interface VoiceAvatarModalProps {
  open: boolean;
  voice: VoiceWithCreator | null;
  onClose: () => void;
  /** Called after a successful avatar upload or remove. */
  onSaved: (updated: VoiceWithCreator) => void;
}

const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

export function VoiceAvatarModal({ open, voice, onClose, onSaved }: VoiceAvatarModalProps) {
  const toast = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !voice) return;
    setAvatarUrl(voice.creator_avatar_url ?? null);
    setError(null);
  }, [open, voice]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !voice || isBusy) return;

    setIsBusy(true);
    setError(null);
    try {
      const updated = await adminUploadVoiceAvatar(voice.id, file);
      setAvatarUrl(updated.creator_avatar_url ?? null);
      onSaved(updated);
      toast.success("Avatar updated", "Community voice avatar saved");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setIsBusy(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!voice || !avatarUrl || isBusy) return;

    setIsBusy(true);
    setError(null);
    try {
      const updated = await adminDeleteVoiceAvatar(voice.id);
      setAvatarUrl(updated.creator_avatar_url ?? null);
      onSaved(updated);
      toast.success("Avatar removed", `Cleared avatar for "${voice.name}"`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setIsBusy(false);
    }
  };

  if (!voice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!isBusy}
      closeOnEscape={!isBusy}
      header={
        <div>
          <Heading variant="section" as="h2" className="text-text-primary">
            Voice Avatar
          </Heading>
          <p className="text-caption text-text-muted">{voice.name}</p>
        </div>
      }
      footer={
        <Button variant="secondary" size="md" onClick={onClose} disabled={isBusy}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-border-default bg-surface-raised">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted">
                <User className="h-14 w-14" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
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
              disabled={isBusy}
              leftIcon={<ImagePlus className="h-4 w-4" />}
            >
              {avatarUrl ? "Change" : "Upload"}
            </Button>
            {avatarUrl ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAvatarRemove}
                disabled={isBusy}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        <p className="text-center text-caption text-text-muted">
          JPEG, PNG, or WebP · max 5MB · auto-resized to {AVATAR_MAX_SIZE_PX}×{AVATAR_MAX_SIZE_PX}
        </p>

        {error ? <p className="text-center text-caption text-red-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
