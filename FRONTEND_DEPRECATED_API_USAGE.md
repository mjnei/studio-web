# Frontend - Deprecated API Usage Report

**Date:** July 7, 2026  
**Status:** ⚠️ DEPRECATED API STILL IN USE - Needs Migration  
**Affected Files:** 3 main files + 1 component

## Summary

The frontend (`studio-web`) is still using the **deprecated `/voice-recordings/` endpoint** and old `VoiceRecordingResponse` schema. This needs to be migrated to use the new `/voices/` endpoints and `VoiceResponse` schema.

## Files Using Deprecated API

### 1. **API Client** - `/src/lib/api/voice-recording-client.ts` ⚠️

**Status:** Uses deprecated endpoints and old schema  
**Functions affected:**
- `uploadVoiceRecording()` - Uses `/voice-recordings/upload` endpoint
- `listVoiceRecordings()` - Uses `/voice-recordings/` endpoint  
- `getVoiceRecording()` - Uses `/voice-recordings/{id}` endpoint
- `updateVoiceRecording()` - Uses `/voice-recordings/{id}` with PATCH
- `deleteVoiceRecording()` - Uses `/voice-recordings/{id}` DELETE
- `getVoiceRecordingAudioUrl()` - Uses `/voice-recordings/{id}/audio-url`
- `toggleVoiceSharing()` - Uses `/voice-recordings/{id}/share` (NEW - not in old backend)
- `getAvailableVoices()` - Uses `/voices/available` (CORRECT - already new endpoint)

**Request/Response Schema:**
```typescript
// OLD Schema (currently used)
uploadVoiceRecording(file, title, description?, duration?)
// Form data fields: file, title, description, duration_seconds

// NEW Schema (should use)
uploadVoiceRecording(file, name, duration?)
// Form data fields: file, name, duration_seconds
```

### 2. **Hook** - `/src/lib/hooks/use-voice-recordings.ts` ⚠️

**Status:** Uses deprecated client functions  
**What it does:**
- Manages voice recording state
- Fetches list of recordings
- Uploads new recordings
- Deletes recordings
- Fetches audio URLs

**Used By:** Unknown (search shows no direct usage in components)

### 3. **Type Definitions** - `/src/lib/types/api.ts` ⚠️

**Status:** Both old and new schemas defined
- `VoiceRecordingResponse` - DEPRECATED (old schema with `title`, `file_path`, `description`)
- `VoiceResponse` - NEW (correct schema with `name`, `audio_path`, `mime_type`)

**Note:** Old interface marked as `@deprecated` but still widely used

### 4. **Component** - `/src/components/voices/voice-recording-card.tsx` ⚠️

**Status:** Uses deprecated schema and functions  
**Usage:**
- Imports `VoiceRecordingResponse` type
- Calls `toggleVoiceSharing()` from deprecated client
- Displays recording with `recording.title` (old field name)
- Displays recording with `recording.description` (not in new schema)

**Fields used from VoiceRecordingResponse:**
- `recording.id` - ✅ Present in new schema
- `recording.title` - ❌ DEPRECATED (use `name`)
- `recording.description` - ❌ DEPRECATED (not in new schema)
- `recording.duration_seconds` - ✅ Present in new schema
- `recording.created_at` - ✅ Present in new schema
- `(recording as any).audio_url` - ✅ Still available (computed)
- `(recording as any).is_shared` - ✅ Present in new schema

## Migration Path

### Step 1: Create New Voice Client
**File:** `/src/lib/api/voice-client.ts` (NEW)

```typescript
// Replace voice-recording-client.ts with new implementation
// Use /voices/ endpoints instead of /voice-recordings/

export async function uploadVoice(
  file: Blob,
  name: string,           // Changed from 'title'
  durationSeconds?: number
): Promise<VoiceResponse> {
  // POST /api/v1/voices/upload
  // Form data: file, name, duration_seconds, mime_type
}

export async function listVoices(skip = 0, limit = 100): Promise<VoiceResponse[]> {
  // GET /api/v1/voices/?skip={skip}&limit={limit}
}

export async function getVoice(id: number): Promise<VoiceResponse> {
  // GET /api/v1/voices/{id}
}

export async function updateVoice(
  id: number,
  data: { name?: string }  // Only 'name', no 'description'
): Promise<VoiceResponse> {
  // PATCH /api/v1/voices/{id}
}

export async function deleteVoice(id: number): Promise<void> {
  // DELETE /api/v1/voices/{id}
}
```

### Step 2: Update Hook
**File:** `/src/lib/hooks/use-voice-recordings.ts` → update or create `use-voices.ts`

```typescript
// Update to use new VoiceResponse schema
// Change field names: title → name

// Old hook returned: VoiceRecordingResponse[]
// New hook should return: VoiceResponse[]
```

### Step 3: Update Component
**File:** `/src/components/voices/voice-recording-card.tsx`

**Changes needed:**
1. Update type import: `VoiceRecordingResponse` → `VoiceResponse`
2. Update field access: `recording.title` → `recording.name`
3. Remove description display (not in new schema)
4. Verify audio URL handling still works
5. Update `toggleVoiceSharing` endpoint if needed

**Before:**
```typescript
import { VoiceRecordingResponse } from "@/lib/types/api";

interface VoiceRecordingCardProps {
  recording: VoiceRecordingResponse;
  // ...
}

// In JSX:
<h3>{recording.title}</h3>
{recording.description && <p>{recording.description}</p>}
```

**After:**
```typescript
import { VoiceResponse } from "@/lib/types/api";

interface VoiceRecordingCardProps {
  recording: VoiceResponse;
  // ...
}

// In JSX:
<h3>{recording.name}</h3>
{/* Remove description - not available in new schema */}
```

### Step 4: Update Type Definitions
**File:** `/src/lib/types/api.ts`

- Keep `VoiceResponse` (PRIMARY)
- Keep `VoiceWithCreator` (PRIMARY)
- Keep `AvailableVoicesResponse` (PRIMARY)
- DELETE or REMOVE: `VoiceRecordingResponse` (deprecated)

## API Endpoint Mapping

### Upload Voice

**OLD (Deprecated):**
```
POST /api/v1/voice-recordings/upload
Headers: Authorization: Bearer <token>
Form Data:
  - file: Blob
  - title: string
  - description?: string
  - duration_seconds?: number

Response: VoiceRecordingResponse
```

**NEW (Correct):**
```
POST /api/v1/voices/upload
Headers: Authorization: Bearer <token>
Form Data:
  - file: Blob
  - name: string
  - duration_seconds?: number

Response: VoiceResponse
```

### List Voices

**OLD (Deprecated):**
```
GET /api/v1/voice-recordings/?skip={skip}&limit={limit}
Response: VoiceRecordingResponse[]
```

**NEW (Correct):**
```
GET /api/v1/voices/?skip={skip}&limit={limit}
Response: VoiceResponse[]
```

### Get Voice

**OLD (Deprecated):**
```
GET /api/v1/voice-recordings/{id}
Response: VoiceRecordingResponse
```

**NEW (Correct):**
```
GET /api/v1/voices/{id}
Response: VoiceResponse
```

### Update Voice

**OLD (Deprecated):**
```
PATCH /api/v1/voice-recordings/{id}
Body: { title?: string, description?: string }
Response: VoiceRecordingResponse
```

**NEW (Correct):**
```
PATCH /api/v1/voices/{id}
Body: { name?: string }
Response: VoiceResponse
```

### Delete Voice

**OLD (Deprecated):**
```
DELETE /api/v1/voice-recordings/{id}
```

**NEW (Correct):**
```
DELETE /api/v1/voices/{id}
```

## Schema Field Mapping

### VoiceRecordingResponse → VoiceResponse

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `id` | `id` | ✅ Same |
| `user_id` | `user_id` | ✅ Same |
| `title` | `name` | ⚠️ RENAMED |
| `description` | ❌ REMOVED | Not in new schema |
| `file_path` | `audio_path` | ⚠️ RENAMED |
| `duration_seconds` | `duration_seconds` | ✅ Same |
| `mime_type` | `mime_type` | ✅ Same |
| `created_at` | `created_at` | ✅ Same |
| `updated_at` | `updated_at` | ✅ Same |
| ❌ NONE | `language` | ✨ NEW (optional) |
| ❌ NONE | `is_shared` | ✨ NEW (community feature) |
| ❌ NONE | `is_approved` | ✨ NEW (admin approval) |
| ❌ NONE | `is_deleted` | ✨ NEW (soft delete) |
| ❌ NONE | `admin_approved_at` | ✨ NEW (approval timestamp) |

## Component Impact

### Direct Usage:
- ✅ `/src/components/voices/voice-recording-card.tsx` - Component displaying voice recordings
- ⚠️ `/src/components/project/voice-generation.tsx` - May import deprecated types/functions

### Indirect Usage (via hooks):
- Unknown components using `useVoiceRecordings()` hook

## Testing Checklist

After migration, verify:

- [ ] Voice upload works (filename mapping with new field name)
- [ ] Voice list loads correctly
- [ ] Voice details display properly (name instead of title)
- [ ] Voice deletion works
- [ ] Audio URL generation works
- [ ] Voice sharing toggle works
- [ ] No 404/422 errors from backend
- [ ] TypeScript types compile without errors
- [ ] No console warnings about deprecated API

## Implementation Priority

🔴 **HIGH**: This needs migration before the backend removes the old endpoints

### Timeline:
1. Create new voice client file
2. Update hook to use new client
3. Update component type imports and field references
4. Update type definitions
5. Test thoroughly
6. Remove old voice-recording-client.ts file
7. Remove old VoiceRecordingResponse interface

## Backend Status

✅ Backend already supports BOTH:
- Old endpoints: `/api/v1/voice-recordings/` (DEPRECATED)
- New endpoints: `/api/v1/voices/` (ACTIVE)

⚠️ **Note:** Backend old endpoints will be removed in future cleanup

## Quick Reference

**Files to Create/Modify:**
- `src/lib/api/voice-client.ts` - NEW file (replaces voice-recording-client.ts)
- `src/lib/hooks/use-voices.ts` - NEW file (or update use-voice-recordings.ts)
- `src/components/voices/voice-recording-card.tsx` - UPDATE
- `src/components/project/voice-generation.tsx` - VERIFY/UPDATE if needed
- `src/lib/types/api.ts` - REMOVE old interface

**Old Files to Delete:**
- `src/lib/api/voice-recording-client.ts` - DELETE after migration

---

**Status:** ⚠️ MIGRATION NEEDED  
**Urgency:** HIGH  
**Affected Pages:** Voice management, Project voice selection
