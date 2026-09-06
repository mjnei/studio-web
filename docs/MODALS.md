# Modals

Feature-level dialogs in studio-web. All modals below are built on the shared primitive in `src/components/ui/modal.tsx` (`Modal`, `ConfirmModal`, `FormModal`, `AlertModal`).

For recording-specific flow and phases, see [VOICE_RECORDING_MODAL.md](./VOICE_RECORDING_MODAL.md).

## Shared primitive

**File:** `src/components/ui/modal.tsx`

| Prop | Default | Purpose |
|------|---------|---------|
| `closeOnOverlayClick` | `true` | Click backdrop to dismiss |
| `closeOnEscape` | `true` | Press Escape to dismiss |
| `closeButtonDisabled` | `false` | Disable the header ✕ button |
| `scrollable` | `false` | `max-h-[90vh]` panel with scrollable body |
| `header` | — | Custom header content (replaces `title` / `description`) |

**Dismiss policy**

- **Read-only / informational** — overlay click and Escape allowed.
- **Forms, confirmations, in-progress work** — overlay click disabled; Escape may be disabled while a blocking action runs.

`ConfirmModal` and `FormModal` always set `closeOnOverlayClick={false}`.

---

## Feature modals (8)

| Component | Admin page? | Route(s) | File |
|-----------|-------------|----------|------|
| `UserDetailModal` | **Yes** | `/admin/users` | `src/app/(shell)/admin/users/components/UserDetailModal.tsx` |
| `ProjectDetailModal` | **Yes** | `/admin/projects` | `src/app/(shell)/admin/projects/components/ProjectDetailModal.tsx` |
| `JobDetailModal` | **Yes** | `/admin/studio-tts-jobs` | `src/app/(shell)/admin/studio-tts-jobs/components/JobDetailModal.tsx` |
| `PlaygroundJobDetailModal` | **Yes** | `/admin/playground-tts-jobs` | `src/app/(shell)/admin/playground-tts-jobs/components/PlaygroundJobDetailModal.tsx` |
| `VoiceBulkImportModal` | **Yes** | `/admin/voices` | `src/components/admin/VoiceBulkImportModal.tsx` |
| `NotificationPreferencesModal` | No | `/notifications` | `src/components/notifications/NotificationPreferencesModal.tsx` |
| `VoiceRecordingModal` | No | `/voices`, `/project/[projectId]/voice` | `src/components/shared/voice-recording-modal/` |
| `VoiceLimitDialog` | No | `/voices`, `/project/[projectId]/voice` | `src/components/voices/voice-limit-dialog.tsx` |

**Admin:** 5 modals — all under `/admin/*`, require admin role via shell routing.

**Consumer:** 3 modals — voices workflow, notifications settings.

---

### Admin modals

#### `UserDetailModal`

- **Purpose:** View and manage a user (role, password, status, picture, hard delete).
- **Size:** `lg`, scrollable.
- **Dismiss:** Overlay **no** · Escape **yes** · ✕ **yes**
- **Notes:** Custom header with avatar and email actions.

#### `ProjectDetailModal`

- **Purpose:** Inspect a project; override status; soft-delete or restore.
- **Size:** `lg`, scrollable.
- **Dismiss:** Overlay **no** · Escape **yes** · ✕ **yes**
- **Notes:** Footer has destructive/restore actions plus Close.

#### `JobDetailModal`

- **Purpose:** Read-only studio TTS job details (status, timestamps, text, audio URL).
- **Size:** `2xl`, scrollable.
- **Dismiss:** Overlay **yes** · Escape **yes** · ✕ **yes**

#### `PlaygroundJobDetailModal`

- **Purpose:** Read-only playground TTS job details (rate limits, client metadata, synthesis stats).
- **Size:** `2xl`, scrollable.
- **Dismiss:** Overlay **yes** · Escape **yes** · ✕ **yes**

#### `VoiceBulkImportModal`

- **Purpose:** Bulk-upload voice audio files for a selected user.
- **Size:** `3xl`, scrollable.
- **Dismiss:** Overlay **no** while importing · Escape **no** while importing · custom header close disabled while importing.
- **Notes:** Gradient custom header; `showCloseButton={false}` with inline close control.

---

### Consumer modals

#### `NotificationPreferencesModal`

- **Purpose:** Toggle in-app notification types; save to server.
- **Size:** `2xl`, scrollable.
- **Dismiss:** Overlay **no** · Escape **yes** · ✕ **yes**
- **Notes:** `overlayClassName="z-[100]"` so it stacks above the notification shell.

#### `VoiceRecordingModal`

- **Purpose:** Record, review, name, and save a custom voice clip.
- **Size:** `md`.
- **Dismiss:** Overlay **no** · Escape **no** while recording or saving · ✕ disabled while recording or saving.
- **Notes:** See [VOICE_RECORDING_MODAL.md](./VOICE_RECORDING_MODAL.md) for the five-phase flow.

#### `VoiceLimitDialog`

- **Purpose:** Shown when the user hits their voice-creation tier limit; optional upgrade CTA.
- **Size:** `sm`.
- **Dismiss:** Overlay **yes** · Escape **yes** · no header ✕ (`showCloseButton={false}`); Close button in footer.
- **Notes:** Parent conditionally mounts this component (no `open` prop); `Modal` is always `open` when rendered.

---

## Other `Modal` usages

These use the shared primitive directly (not the eight feature wrappers above):

| Usage | Admin? | File / page |
|-------|--------|-------------|
| `ConfirmModal` / `AlertModal` | Mixed | Voices, profile, admin voices, playground, queue purge, etc. |
| `FormModal` | No | `/projects` (create project) |
| `ExportFormatModal` | No | Project export step |
| `ThumbnailEditorModal` | No | Project compose step |
| `CreditConfirmationModal` / `InsufficientCreditsModal` | No | Project export step |
| `JobVideoModal` | No | `/jobs` |
| Inline `Modal` | Mixed | Billing, export share, compose actions |

When adding a new modal, prefer `src/components/ui/modal.tsx` over a hand-rolled `fixed inset-0` overlay.
