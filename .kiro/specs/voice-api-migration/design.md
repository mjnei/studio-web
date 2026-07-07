# Design: Voice API Migration to Unified Voices Schema

## Architecture Overview

This design describes the migration strategy and architecture for updating the studio-web frontend from the deprecated `/voice-recordings/` API to the unified `/voices/` API. The migration uses a parallel approach: creating a new `voice-client.ts` alongside the deprecated `voice-recording-client.ts`, allowing gradual component updates.

### Migration Strategy

**Phases:**
1. Create new `voice-client.ts` with unified endpoints
2. Create or update `use-voices.ts` hook to use new client
3. Update `voice-recording-card.tsx` to use new schema
4. Update `voice-generation.tsx` to use new client
5. Update all other components using voice API
6. Remove deprecated code and types

### Architecture Layers

```
Components (voice-generation.tsx, voice-recording-card.tsx, etc.)
           ↓
Hooks (use-voices.ts)
           ↓
API Client (voice-client.ts) [NEW]
           ↓
Backend (/api/v1/voices/*)
```

## Data Models and Schema Changes

### VoiceResponse Schema (New)

```typescript
interface VoiceResponse {
  id: number;                    // BigInt from backend
  user_id: number;              // Voice owner
  name: string;                 // Changed from 'title'
  audio_path: string;           // Changed from 'file_path'
  mime_type: string;            // Audio format (audio/webm, audio/mp3, etc.)
  language?: string | null;     // NEW: voice language
  duration_seconds?: number | null;
  is_shared: boolean;           // NEW: marked for community
  is_approved: boolean;         // NEW: admin approved
  is_deleted: boolean;          // NEW: soft delete flag
  admin_approved_at?: string | null; // NEW: approval timestamp
  created_at: string;           // ISO 8601
  updated_at: string;           // ISO 8601
}
```

### VoiceWithCreator Schema (New - for Community Voices)

```typescript
interface VoiceWithCreator extends VoiceResponse {
  creator_username: string;     // Creator's username
}
```

### AvailableVoicesResponse (New)

```typescript
interface AvailableVoicesResponse {
  own_voices: VoiceResponse[];
  community_voices: VoiceWithCreator[];
}
```

### Field Mapping: Deprecated → New

| Deprecated Field | New Field | Type Change | Notes |
|-----------------|-----------|-------------|-------|
| `title` | `name` | string → string | 1:1 mapping |
| `file_path` | `audio_path` | string → string | 1:1 mapping |
| `description` | ❌ REMOVED | - | Not in new schema; remove from display |
| N/A | `language` | NEW | Optional language code |
| N/A | `is_shared` | NEW | Community sharing flag |
| N/A | `is_approved` | NEW | Admin approval flag |
| N/A | `is_deleted` | NEW | Soft delete flag |
| N/A | `admin_approved_at` | NEW | Approval timestamp |

### Request Schemas

```typescript
interface VoiceCreateRequest {
  name: string;
  duration_seconds?: number;
  mime_type?: string;
  language?: string | null;
}

interface VoiceUpdateRequest {
  name?: string;
  language?: string | null;
}

interface VoiceShareRequest {
  is_shared: boolean;
}
```

## Component Design

### VoiceClient (voice-client.ts)

**Location:** `/src/lib/api/voice-client.ts` (NEW)

**Responsibilities:**
- HTTP communication with `/api/v1/voices/*` endpoints
- File upload handling with MIME type detection
- Audio URL retrieval and presigned URL management
- Form data serialization

**Key Functions:**

```typescript
// Upload voice
async function uploadVoice(
  file: Blob,
  name: string,
  durationSeconds?: number
): Promise<VoiceResponse>

// List user's voices
async function listVoices(skip?: number, limit?: number): Promise<VoiceResponse[]>

// Get single voice
async function getVoice(id: number): Promise<VoiceResponse>

// Update voice metadata
async function updateVoice(
  id: number,
  data: VoiceUpdateRequest
): Promise<VoiceResponse>

// Delete voice (soft delete via backend)
async function deleteVoice(id: number): Promise<void>

// Get audio URL (S3 presigned or local streaming)
async function getVoiceAudioUrl(id: number): Promise<{
  audio_url: string;
  expires_in: number | null;
  storage_type: "s3" | "local";
}>

// Toggle voice sharing
async function toggleVoiceSharing(
  id: number,
  isShared: boolean
): Promise<VoiceResponse>

// Get available voices (own + approved community)
async function getAvailableVoices(): Promise<AvailableVoicesResponse>
```

**Implementation Details:**
- MIME type detection: Maps file types to audio extensions (.webm, .ogg, .wav, .mp3, .m4a)
- Filename sanitization: Converts voice name to filesystem-safe string
- File creation: Creates File object with correct MIME type and filename
- Authorization: Uses existing bearer token from `getAccessToken()`
- Error handling: Throws descriptive errors for 4xx/5xx responses

### useVoices Hook

**Location:** `/src/lib/hooks/use-voices.ts` (NEW or UPDATED)

**Responsibilities:**
- Manage voice state (loaded voices, loading/error states)
- Fetch voices on mount
- Handle voice upload, delete, and metadata operations
- Fetch audio URLs for all voices on load
- Provide refetch capability

**API:**

```typescript
interface UseVoicesReturn {
  voices: VoiceResponse[];
  loading: boolean;
  error: string | null;
  uploadVoice: (file: Blob, name: string, duration?: number) => Promise<VoiceResponse>;
  deleteVoice: (id: number) => Promise<void>;
  toggleSharing: (id: number, isShared: boolean) => Promise<VoiceResponse>;
  refetch: () => Promise<void>;
}

function useVoices(): UseVoicesReturn
```

**Implementation Details:**
- Fetch voices on component mount
- Fetch audio URLs in parallel for all voices
- Attach audio URLs to voice objects in state
- Handle errors gracefully with error boundary
- Support retry via `refetch()`
- Type-safe with `VoiceResponse[]` return

### VoiceRecordingCard Component

**Location:** `/src/components/voices/voice-recording-card.tsx` (UPDATED)

**Type Update:**

```typescript
// OLD
interface VoiceRecordingCardProps {
  recording: VoiceRecordingResponse;  // ← Deprecated type
}

// NEW
interface VoiceRecordingCardProps {
  recording: VoiceResponse;           // ← New unified type
}
```

**Field Updates:**

```typescript
// OLD
<h3>{recording.title}</h3>
{recording.description && <p>{recording.description}</p>}

// NEW
<h3>{recording.name}</h3>
{/* Description removed - not in new schema */}
```

**Features:**
- Display voice name (via `recording.name`)
- Display duration, creation date
- Show sharing status (private/shared badge)
- Toggle sharing functionality
- Play audio via audio URL
- Delete voice with confirmation
- Show approval status for community voices (if `is_approved=true`)

### VoiceGeneration Component

**Location:** `/src/components/project/voice-generation.tsx` (UPDATED)

**Responsibilities:**
- Fetch available voices (own + community)
- Display voice lists separately
- Select voice for TTS job
- Handle voice upload during project workflow

**Implementation Details:**
- Use `getAvailableVoices()` to fetch both own and community voices
- Render separate sections for own_voices and community_voices
- Include creator username in community voice cards
- Display approval status for community voices
- Handle voice selection for TTS job

## API Endpoint Mapping

### Upload Voice

**Endpoint:** `POST /api/v1/voices/upload`

**Request:**
```
Form Data:
  - file: Blob (audio file)
  - name: string (voice name, NOT title)
  - duration_seconds?: number (optional)

Headers:
  - Authorization: Bearer <token>
  - Content-Type: multipart/form-data
```

**Response:** `VoiceResponse`

**Client Function:** `uploadVoice(file, name, durationSeconds?)`

### List Voices

**Endpoint:** `GET /api/v1/voices/?skip={skip}&limit={limit}`

**Response:** `VoiceResponse[]`

**Client Function:** `listVoices(skip?, limit?)`

### Get Voice

**Endpoint:** `GET /api/v1/voices/{id}`

**Response:** `VoiceResponse`

**Client Function:** `getVoice(id)`

### Update Voice

**Endpoint:** `PATCH /api/v1/voices/{id}`

**Request Body:**
```json
{
  "name": "string (optional)",
  "language": "string (optional)"
}
```

**Response:** `VoiceResponse`

**Client Function:** `updateVoice(id, data)`

### Delete Voice

**Endpoint:** `DELETE /api/v1/voices/{id}`

**Response:** void (HTTP 204 or 200)

**Client Function:** `deleteVoice(id)`

### Get Audio URL

**Endpoint:** `GET /api/v1/voices/{id}/audio-url`

**Response:**
```json
{
  "audio_url": "string (presigned S3 URL or local streaming endpoint)",
  "expires_in": "number (seconds) or null",
  "storage_type": "s3 | local"
}
```

**Client Function:** `getVoiceAudioUrl(id)`

### Toggle Sharing

**Endpoint:** `PATCH /api/v1/voices/{id}/share`

**Request Body:**
```json
{
  "is_shared": boolean
}
```

**Response:** `VoiceResponse` (with updated `is_shared` flag)

**Client Function:** `toggleVoiceSharing(id, isShared)`

### Get Available Voices

**Endpoint:** `GET /api/v1/voices/available`

**Response:** `AvailableVoicesResponse`
```json
{
  "own_voices": [VoiceResponse, ...],
  "community_voices": [VoiceWithCreator, ...]
}
```

**Client Function:** `getAvailableVoices()`

## MIME Type and File Handling

### MIME Type Detection

```typescript
const mimeToExtension: Record<string, string> = {
  "audio/webm": ".webm",
  "audio/webm;codecs=opus": ".webm",
  "audio/ogg": ".ogg",
  "audio/ogg;codecs=opus": ".ogg",
  "audio/wav": ".wav",
  "audio/mp3": ".mp3",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".mp4",
  "audio/x-m4a": ".m4a",
};
```

### Filename Sanitization

```typescript
// Input: "My Voice! (2024) #test"
// Process:
//   1. Lowercase: "my voice! (2024) #test"
//   2. Replace non-alphanumeric with dash: "my-voice-2024-test"
//   3. Remove leading/trailing dashes: "my-voice-2024-test"
// Output: "my-voice-2024-test.webm"
```

## Error Handling Strategy

### Upload Errors
- **422 Unprocessable Entity:** Invalid file format, name too long, etc. → Show user-friendly error message
- **413 Payload Too Large:** File exceeds size limit → Show size limit message
- **500 Internal Server Error:** Server-side processing error → Suggest retry

### List/Get Errors
- **401 Unauthorized:** Token expired or invalid → Redirect to login
- **403 Forbidden:** Permission denied → Show "access denied" message
- **404 Not Found:** Voice deleted or ID invalid → Show "voice not found"
- **500 Internal Server Error:** Server-side error → Show "failed to load voices"

### Delete Errors
- **404 Not Found:** Already deleted → Show "voice already deleted"
- **500 Internal Server Error:** Server error → Show "failed to delete voice"

### Audio URL Errors
- **404 Not Found:** Audio file missing on storage → Show "audio file unavailable"
- **500 Internal Server Error:** Storage or presigned URL generation failed → Show "unable to load audio"

## Community Voice Features

### Sharing Workflow

```
User uploads voice
    ↓
Voice created with is_shared=false (private)
    ↓
User toggles sharing: is_shared=true
    ↓
Voice marked for admin review
    ↓
Admin approves: is_approved=true, admin_approved_at=<timestamp>
    ↓
Voice visible in community_voices list
    ↓
Other users can select for their projects
```

### Display Logic

**Voice Card Badge:**
```typescript
// Private voice (default)
if (!voice.is_shared) {
  show: "🔒 Private"
}

// Shared but pending approval
if (voice.is_shared && !voice.is_approved) {
  show: "⏳ Pending approval"
}

// Approved community voice
if (voice.is_shared && voice.is_approved) {
  show: "✅ Community" + (voice.admin_approved_at ? ` • Approved ${relativeDate}` : "")
}

// Deleted (should be filtered out)
if (voice.is_deleted) {
  // Don't display
}
```

### Selection Logic

**Available for Selection:**
- User's own voices (regardless of is_shared or is_approved status)
- Community voices where `is_shared=true && is_approved=true`

**Not Available:**
- Deleted voices (`is_deleted=true`)
- Other users' private voices
- Shared but not approved voices (unless admin)

## Type Definitions

### In `/src/lib/types/api.ts`

**Keep (Unified):**
- `VoiceResponse` - Primary schema
- `VoiceWithCreator` - Community voices with creator
- `AvailableVoicesResponse` - Available voices list
- `VoiceCreateRequest` - Upload request
- `VoiceUpdateRequest` - Update request
- `VoiceShareRequest` - Sharing toggle request

**Mark Deprecated (Temporary):**
- `VoiceRecordingResponse` - Add JSDoc `@deprecated` comment

**Remove (After All Components Migrated):**
- `VoiceRecordingResponse` - Delete interface
- Any legacy request/response types

## Implementation Order

1. **Create voice-client.ts** - New unified API client
2. **Create/Update use-voices.ts** - New hook using voice-client
3. **Update voice-recording-card.tsx** - Use new schema
4. **Update voice-generation.tsx** - Fetch and display available voices
5. **Update other components** - Any other voice-related components
6. **Update type definitions** - Keep new types, deprecate/remove old
7. **Test integration** - Verify all endpoints work
8. **Remove deprecated code** - Delete voice-recording-client.ts and old types

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Audio URL Retrieval Consistency

For any voice with a valid `id`, retrieving the audio URL should return a non-empty URL string and valid storage type.

**Validates: Requirements 1.7, 9.3**

### Property 2: Voice Upload Round Trip

For any voice uploaded with name, duration, and file, fetching that voice by ID should return the same name, duration, and audio accessible via URL.

**Validates: Requirements 1.2, 12.2, 12.3**

### Property 3: Schema Field Transformation

For any voice fetched from the new endpoint, field names should be consistent (name, audio_path, not title or file_path).

**Validates: Requirements 3.2, 4.2, 5.1**

### Property 4: Voice Sharing State Consistency

For any voice where sharing is toggled, the `is_shared` flag in the returned response should match the requested value.

**Validates: Requirements 1.8, 3.5**

### Property 5: Available Voices List Structure

For any call to `getAvailableVoices()`, the response should always contain both `own_voices` and `community_voices` arrays, with community voices having `creator_username`.

**Validates: Requirements 1.9, 4.1, 6.3**

### Property 6: Soft Delete Exclusion

For any voice marked with `is_deleted=true`, it should not appear in the list returned by `listVoices()` or in available voices.

**Validates: Requirements 7.1**

### Property 7: Community Voice Approval Invariant

For any voice appearing in the `community_voices` list from `getAvailableVoices()`, both `is_shared` and `is_approved` flags should be `true`.

**Validates: Requirements 6.3, 6.6**

### Property 8: Error Recovery Idempotence

For any failed operation, retrying the same operation with the same inputs should not corrupt state or create duplicates.

**Validates: Requirements 9.2, 9.3**

