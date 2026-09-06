"use client";

import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Heading } from "@/components/ui/heading";
import { locales, voiceLanguageNames, type Locale } from "@/i18n";
import { adminUpdateVoice } from "@/lib/api/admin";
import type { VoiceWithCreator } from "@/lib/types/api";
import { useToast } from "@/components/ui/toast";

interface VoiceEditModalProps {
  open: boolean;
  voice: VoiceWithCreator;
  onClose: () => void;
  /** Called after a successful save. */
  onSaved: (updated: VoiceWithCreator) => void;
}

const LANGUAGE_OPTIONS = locales.map((code) => ({
  value: code,
  label: `${voiceLanguageNames[code]} (${code})`,
}));

function resolveLanguage(language: string): Locale {
  return (locales.includes(language as Locale) ? language : "en") as Locale;
}

export function VoiceEditModal({ open, voice, onClose, onSaved }: VoiceEditModalProps) {
  const toast = useToast();
  // Parent remounts via key={voice.id} when opening a different voice.
  const [name, setName] = useState(voice.name);
  const [language, setLanguage] = useState<Locale>(() => resolveLanguage(voice.language));
  const [isShared, setIsShared] = useState(voice.is_shared);
  const [isApproved, setIsApproved] = useState(voice.is_approved);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSave = async () => {
    if (isSaving) return;
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleSave();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isSaving}
      closeOnEscape={!isSaving}
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
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
          >
            Save
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          maxLength={255}
        />

        <Select
          label="Language"
          value={language}
          onChange={(value) => setLanguage(value as Locale)}
          options={LANGUAGE_OPTIONS}
          disabled={isSaving}
        />

        <Toggle
          checked={isShared}
          onChange={handleSharedChange}
          disabled={isSaving}
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
          disabled={isSaving || !isShared}
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
      </form>
    </Modal>
  );
}
