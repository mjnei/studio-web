# Requirements: Voice API Migration to Unified Voices Schema

## Introduction

This document specifies requirements for migrating the studio-web frontend from the deprecated `/voice-recordings/` API to the unified `/voices/` API provided by the backend. The backend has already completed its consolidation (Tasks 1-23 complete). This migration updates the frontend to use the new schema, implements new community voice features, and removes all deprecated code.

## Glossary

- **VoiceClient**: The API client module that handles all voice-related HTTP requests to backend endpoints
- **VoiceRecording**: Legacy interface mapping to old schema (deprecated)
- **Voice**: Unified voice interface using new schema with `name`, `audio_path`, and community features
- **Community Voice**: A voice marked as `is_shared=true` that has been approved by admin (`is_approved=true`)
- **Soft Delete**: Marking a voice as `is_deleted=true` rather than removing database record
- **Field Mapping**: Transformation of deprecated field names to new names (e.g., `title` → `name`)

## Requirements

### Requirement 1: Create Unified Voice Client

**User Story:** As a frontend developer, I want a new voice API client that uses the unified `/voices/` endpoints, so that the application uses the current backend schema.

#### Acceptance Criteria

1. WHEN the voice-client module is loaded, THE VoiceClient SHALL provide functions for all CRUD operations using the `/api/v1/voices/` base endpoint.

2. WHEN uploading a voice with `uploadVoice(file, name, durationSeconds)`, THE VoiceClient SHALL POST the file to `/api/v1/voices/upload` using form data with fields: `file`, `name`, `duration_seconds` (NOT `title` or `description`).

3. WHEN listing voices with `listVoices(skip, limit)`, THE VoiceClient SHALL return a Promise of `VoiceResponse[]` from `GET /api/v1/voices/?skip={skip}&limit={limit}`.

4. WHEN fetching a voice with `getVoice(id)`, THE VoiceClient SHALL return a single `VoiceResponse` object from `GET /api/v1/voices/{id}`.

5. WHEN updating a voice with `updateVoice(id, data)`, THE VoiceClient SHALL accept only `name` field (no description) and PATCH to `/api/v1/voices/{id}`.

6. WHEN deleting a voice with `deleteVoice(id)`, THE VoiceClient SHALL DELETE to `/api/v1/voices/{id}` and return void.

7. WHEN requesting audio URL with `getVoiceAudioUrl(id)`, THE VoiceClient SHALL return presigned URL information (audio_url, expires_in, storage_type) from `GET /api/v1/voices/{id}/audio-url`.

8. WHEN toggling voice sharing with `toggleVoiceSharing(id, isShared)`, THE VoiceClient SHALL PATCH to `/api/v1/voices/{id}/share` with `{ is_shared: boolean }`.

9. WHEN fetching available voices with `getAvailableVoices()`, THE VoiceClient SHALL return `AvailableVoicesResponse` (own_voices array + community_voices array) from `GET /api/v1/voices/available`.

10. WHERE voice uploading is performed, THE VoiceClient SHALL handle MIME type detection and file extension mapping for common audio formats (webm, ogg, wav, mp3, m4a).

### Requirement 2: Update Voice Hook to Use New Client

**User Story:** As a developer using the voice hook, I want the hook to consume the new unified voice client, so that voice state management works with the new schema.

#### Acceptance Criteria

1. WHEN the `useVoices()` hook is initialized, THE Hook SHALL call `listVoices()` from the new VoiceClient and return voices as `VoiceResponse[]`.

2. WHEN voices are loaded, THE Hook SHALL automatically fetch audio URLs for all voices and attach them to the response.

3. WHEN uploading a voice with `uploadVoice(file, name, duration)`, THE Hook SHALL accept the new parameter names (NOT description).

4. WHEN deleting a voice with `deleteVoice(id)`, THE Hook SHALL properly filter the voice from local state.

5. WHEN fetching recordings fails, THE Hook SHALL store error state and allow retry via `refetch()` method.

6. WHERE voices are stored in state, THE Hook SHALL use `VoiceResponse` type (not `VoiceRecordingResponse`).

### Requirement 3: Update Voice Recording Card Component

**User Story:** As a voice user, I want the voice card to display my voices using the new schema, so that voices render correctly without deprecated fields.

#### Acceptance Criteria

1. WHEN rendering a voice card, THE Component SHALL accept `VoiceResponse` type (not `VoiceRecordingResponse`).

2. WHEN displaying voice title, THE Component SHALL use `voice.name` field (NOT `voice.title`).

3. WHEN displaying voice metadata, THE Component SHALL show duration, creation date, and sharing status.

4. WHEN a voice has description in the legacy schema, THE Component SHALL remove description rendering (field does not exist in new schema).

5. WHEN toggling sharing, THE Component SHALL call `toggleVoiceSharing(id, isShared)` and update display state immediately.

6. WHEN playing voice audio, THE Component SHALL retrieve audio URL from the new audio URL endpoint and handle playback correctly.

7. WHEN deleting a voice, THE Component SHALL trigger delete confirmation and call the delete handler.

### Requirement 4: Update Voice-Related Components for New Schema

**User Story:** As a developer, I want all voice-related components to work with the new schema, so that the application doesn't mix legacy and new API responses.

#### Acceptance Criteria

1. WHEN the voice-generation component loads, THE Component SHALL fetch available voices using the new client (own_voices + community_voices).

2. WHEN selecting a voice during project creation, THE Component SHALL work with `VoiceResponse` type from the unified API.

3. WHEN rendering voice lists (community or owned), THE Component SHALL handle the new response structure with separate own_voices and community_voices arrays.

4. WHEN displaying community voice details, THE Component SHALL include creator username from `VoiceWithCreator` schema.

5. IF admin approval features are present, THE Component SHALL display approval status and approval date where applicable.

### Requirement 5: Update Type Definitions

**User Story:** As a TypeScript developer, I want clean type definitions that reflect the current unified schema, so that the codebase has a single source of truth.

#### Acceptance Criteria

1. THE Type Definitions Module SHALL keep `VoiceResponse` as the primary schema.

2. THE Type Definitions Module SHALL keep `VoiceWithCreator` for community voices with creator information.

3. THE Type Definitions Module SHALL keep `AvailableVoicesResponse` for the available voices endpoint response.

4. THE Type Definitions Module SHALL mark `VoiceRecordingResponse` as deprecated but keep it until all components are migrated.

5. THE Type Definitions Module SHALL provide request types: `VoiceCreateRequest`, `VoiceUpdateRequest`, `VoiceShareRequest`.

### Requirement 6: Implement Community Voice Features

**User Story:** As a platform user, I want to share my voices with the community and discover approved community voices, so that I can use high-quality voices from other users.

#### Acceptance Criteria

1. WHEN a voice is marked as `is_shared=true`, THE System SHALL make it eligible for admin approval.

2. WHEN displaying a voice with `is_approved=true`, THE System SHALL indicate it's a community-approved voice.

3. WHEN fetching available voices, THE System SHALL separate community voices from user-owned voices.

4. WHERE voice cards display community status, THE Component SHALL show sharing/locked badge based on `is_shared` flag.

5. WHERE voice cards display approval status, THE Component SHALL show approval indicator if `is_approved=true` and `admin_approved_at` is present.

6. WHEN a user selects a community voice during project creation, THE System SHALL work correctly with any voice marked `is_shared=true` and `is_approved=true`.

### Requirement 7: Support Soft Delete and New Voice Properties

**User Story:** As a user managing voices, I want soft-deleted voices to be handled correctly, so that the system respects the deletion state from the backend.

#### Acceptance Criteria

1. WHEN loading voices from the backend, THE System SHALL exclude voices with `is_deleted=true` from user-facing lists.

2. WHERE voice properties are stored, THE System SHALL preserve all fields from `VoiceResponse`: `is_shared`, `is_approved`, `is_deleted`, `admin_approved_at`, `language`, `user_id`.

3. WHEN rendering voice language information, THE Component SHALL display it if available (`language` field).

4. WHERE voice data is displayed, THE System SHALL handle null/undefined values for optional fields gracefully.

### Requirement 8: Ensure Backward Compatibility During Migration

**User Story:** As a migration executor, I want the old and new clients to coexist temporarily, so that I can migrate components gradually without breaking the application.

#### Acceptance Criteria

1. WHEN the voice-client module is created, THE Old voice-recording-client SHALL remain in place (not deleted).

2. WHERE components use the old client, THE Application SHALL continue to function until the component is explicitly migrated.

3. WHEN both clients are imported in the same file, THE TypeScript types SHALL not cause conflicts.

4. WHERE old and new clients are used in different parts of the application, THE Application SHALL work correctly without server errors.

### Requirement 9: Verify API Integration and Error Handling

**User Story:** As a developer, I want the voice client to handle errors properly, so that users see helpful messages when operations fail.

#### Acceptance Criteria

1. WHEN a voice upload fails, THE VoiceClient SHALL throw an Error with descriptive message.

2. WHEN fetching voices fails (401, 403, 404, 500), THE Hook SHALL capture error and expose it via error state.

3. WHEN an audio URL fetch fails, THE Component SHALL handle gracefully and not block other operations.

4. WHEN user lacks permissions for an operation, THE Application SHALL show appropriate error without crashing.

### Requirement 10: Support Voice Limits and Enforcement

**User Story:** As a platform operator, I want voice limits to be enforced on the frontend for better UX, so that users get immediate feedback before uploading.

#### Acceptance Criteria

1. WHERE the backend enforces voice limits (voice_id as BigInt), THE Frontend SHALL properly handle integer IDs (number type in TypeScript).

2. WHEN displaying voice count or UI elements, THE Application SHALL work with the integer ID type from backend (not string).

3. WHERE voice metadata is used for decision-making (e.g., community discovery), THE Application SHALL use the unified schema consistently.

### Requirement 11: Remove Deprecated Code After Migration

**User Story:** As a codebase maintainer, I want deprecated code and types removed after migration, so that the codebase is clean and maintainable.

#### Acceptance Criteria

1. WHEN all components have been migrated to the new client, THE voice-recording-client.ts file SHALL be deleted.

2. WHEN all components use `VoiceResponse`, THE VoiceRecordingResponse interface SHALL be removed from type definitions.

3. WHEN the old client is removed, THE Import statements in components SHALL use the new client exclusively.

4. AFTER migration completion, THE Application SHALL contain no references to deprecated endpoints or schemas.

### Requirement 12: Test API Integration

**User Story:** As a QA engineer, I want to verify that the new voice client endpoints work correctly, so that the application is production-ready.

#### Acceptance Criteria

1. THE VoiceClient Functions SHALL all make requests to the correct endpoints (`/api/v1/voices/*`).

2. THE VoiceClient Functions SHALL properly serialize form data for file uploads.

3. THE Hook Functions SHALL fetch, upload, and delete voices without errors against the backend.

4. THE Component Functions SHALL render correctly with data from the new schema.

5. WHEN tests run, THE Application SHALL make successful requests and handle responses correctly.

