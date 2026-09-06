"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Heading } from "@/components/ui/heading";
import { voiceLanguages, voiceLanguageNames, type VoiceLanguage } from "@/i18n";
import { adminUpdateVoice } from "@/lib/api/admin";
import type { VoiceWithCreator } from "@/lib/types/api";
import { useToast } from "@/components/ui/toast";

interface VoiceEditModalProps {
  open: boolean;
  voice: VoiceWithCreator | null;
  onClose: () => void;
  /** Called after a successful save. */
  onSaved: (updated: VoiceWithCreator) => void;
}

const LANGUAGE_OPTIONS = voiceLanguages.map((code) => ({
  value: code,
  label: `${voiceLanguageNames[code]} (${code})`,
}));

export function VoiceEditModal({ open, voice, onClose, onSaved }: VoiceEditModalProps) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<VoiceLanguage>("en");
  const [isShared, setIsShared] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !voice) return;
    setName(voice.name);
    const lang = (
      voiceLanguages.includes(voice.language as VoiceLanguage) ? voice.language : "en"
    ) as VoiceLanguage;
    setLanguage(lang || "en");
    setIsShared(voice.is_shared);
    setIsApproved(voice.is_approved);
    setError(null);
  }, [open, voice]);

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
    if (!voice || isSaving) return;
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

  if (!voice) return null;

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
          onChange={(value) => setLanguage(value as VoiceLanguage)}
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
