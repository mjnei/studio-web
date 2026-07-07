# Voice Types Guide - Updated for Unified Voices System

This guide explains the updated TypeScript interfaces for the voice management system in studio-web.

## Core Interfaces

### VoiceResponse
The main interface for all voice data. Represents a user-owned voice with optional community sharing.

**Properties**:
- `id`: BigInt (number in TypeScript) - unique voice identifier
- `user_id`: number - the user who owns this voice
- `name`: string - voice name/title (max 255 chars)
- `audio_path`: string - path to stored audio file (max 512 chars)
- `mime_type`: string - audio MIME type (e.g., "audio/webm")
- `language`: string | null - optional ISO language code
- `duration_seconds`: number | null - optional audio duration
- `is_shared`: boolean - user has opted into community sharing
- `is_approved`: boolean - admin has approved for public catalog
- `is_deleted`: boolean - soft delete flag (false = active)
- `admin_approved_at`: string | null - when admin approved (ISO timestamp)
- `created_at`: string - creation timestamp
- `updated_at`: string - last update timestamp

**Usage**:
```typescript
import { VoiceResponse } from "@/lib/types/api";

const myVoice: VoiceResponse = {
  id: 42,
  user_id: 1,
  name: "My Professional Voice",
  audio_path: "/uploads/voices/abc123.webm",
  mime_type: "audio/webm",
  duration_seconds: 5.2,
  is_shared: false,
  is_approved: false,
  is_deleted: false,
  language: "en",
  admin_approved_at: null,
  created_at: "2026-07-07T10:00:00Z",
  updated_at: "2026-07-07T10:00:00Z",
};
```

### VoiceWithCreator
Extended voice interface for community voices, includes creator information.

**Properties** (extends VoiceResponse):
- All VoiceResponse properties plus:
- `creator_username`: string - username of voice creator

**Usage**:
```typescript
import { VoiceWithCreator } from "@/lib/types/api";

const communityVoice: VoiceWithCreator = {
  // ... all VoiceResponse properties
  creator_username: "john_doe",
};

// Display in UI
<p>by @{communityVoice.creator_username}</p>
```

### AvailableVoicesResponse
Response from GET `/api/v1/voices/available` endpoint. Contains all voices the user can use for projects.

**Properties**:
- `own_voices`: VoiceResponse[] - all voices owned by the user (regardless of sharing status)
- `community_voices`: VoiceWithCreator[] - approved public community voices (excluding user's own)

**Usage**:
```typescript
import { AvailableVoicesResponse } from "@/lib/types/api";

async function loadVoices() {
  const response: AvailableVoicesResponse = await getAvailableVoices();
  
  // Show user's own voices
  response.own_voices.forEach(voice => {
    console.log(`My voice: ${voice.name}`);
  });
  
  // Show community voices
  response.community_voices.forEach(voice => {
    console.log(`Community: ${voice.name} by @${voice.creator_username}`);
  });
}
```

## Request Types

### VoiceShareRequest
Body for PATCH `/api/v1/voices/{id}/share` endpoint.

```typescript
import { VoiceShareRequest } from "@/lib/types/api";

const shareVoice: VoiceShareRequest = { is_shared: true };
const unshareVoice: VoiceShareRequest = { is_shared: false };
```

### VoiceApprovalRequest
Body for PATCH `/admin/voices/{id}/approve` or `/unapprove` endpoints.

```typescript
import { VoiceApprovalRequest } from "@/lib/types/api";

const approveVoice: VoiceApprovalRequest = { is_approved: true };
const unapproveVoice: VoiceApprovalRequest = { is_approved: false };
```

### VoiceCreateRequest
Body for POST `/api/v1/voice-recordings` endpoint.

```typescript
import { VoiceCreateRequest } from "@/lib/types/api";

const createVoice: VoiceCreateRequest = {
  name: "My New Voice",
  audio_path: "/uploads/voices/new-abc123.webm",
  mime_type: "audio/webm",
  language: "en",
  duration_seconds: 5.2,
};
```

## Sharing Status Display

### For Users (Non-Admin UI)
Show ONLY the `is_shared` status to users:

```typescript
function getVoiceStatusForUser(voice: VoiceResponse): string {
  return voice.is_shared ? "Shared" : "Private";
}

// ❌ NEVER display these to users:
// - is_approved (admin-only concept)
// - admin_approved_at (admin workflow)
// - Pending Approval badges
// - Approved badges
```

### For Admins (Admin UI)
Show full approval workflow:

```typescript
function getVoiceStatusForAdmin(voice: VoiceResponse): string {
  if (!voice.is_shared) return "Private";
  if (voice.is_shared && !voice.is_approved) return "Pending Approval";
  if (voice.is_shared && voice.is_approved) return "Approved";
  return "Unknown";
}
```

## Community Voice Display

When displaying community voices to users, format as:

```typescript
function formatCommunityVoiceCredit(voice: VoiceWithCreator): string {
  // Example output: "by @john_doe • approved 3 days ago"
  const createdBy = `by @${voice.creator_username}`;
  
  if (voice.admin_approved_at) {
    const approvedAgo = formatRelativeTime(new Date(voice.admin_approved_at));
    return `${createdBy} • approved ${approvedAgo}`;
  }
  
  return createdBy;
}
```

## Migration from Old Types

### Old Voice Interface (Removed)
```typescript
// ❌ No longer exists - was stock voice only
interface VoiceResponse {
  id: string;
  provider: string;
  name: string;
  // ... stock voice fields
}
```

### New Unified Interface
```typescript
// ✅ Now handles all voices (stock removed, user-owned only)
interface VoiceResponse {
  id: number;
  user_id: number;
  name: string;
  audio_path: string;
  is_shared: boolean;
  is_approved: boolean;
  // ... new sharing fields
}
```

### VoiceRecordingResponse (Deprecated)
The old `VoiceRecordingResponse` is maintained for backwards compatibility but maps to the new unified schema:

```typescript
// Legacy interface (still works)
interface VoiceRecordingResponse {
  id: number;
  user_id: number;
  title: string;           // → maps to Voice.name
  file_path: string;       // → maps to Voice.audio_path
  // ...
}
```

## Common Patterns

### Check if voice is public
```typescript
const isPublic = (voice: VoiceResponse): boolean => {
  return voice.is_shared && voice.is_approved && !voice.is_deleted;
};
```

### Check if voice is owned by current user
```typescript
const isOwnedByMe = (voice: VoiceResponse, myId: number): boolean => {
  return voice.user_id === myId && !voice.is_deleted;
};
```

### Check if voice is pending approval
```typescript
const isPendingApproval = (voice: VoiceResponse): boolean => {
  return voice.is_shared && !voice.is_approved && !voice.is_deleted;
};
```

### Separate voices by ownership
```typescript
function separateVoices(voices: VoiceResponse[], myId: number) {
  const own = voices.filter(v => v.user_id === myId);
  const community = voices.filter(v => v.user_id !== myId);
  return { own, community };
}
```

## API Endpoints Reference

### User Voice Endpoints
- `GET /api/v1/voices` → VoiceResponse[]
- `GET /api/v1/voices/available` → AvailableVoicesResponse
- `PATCH /api/v1/voices/{id}/share` (body: VoiceShareRequest) → VoiceResponse
- `POST /api/v1/voice-recordings` (body: VoiceCreateRequest) → VoiceResponse
- `DELETE /api/v1/voice-recordings/{id}` → 204 No Content

### Admin Voice Endpoints
- `GET /admin/voices/pending` → VoiceResponse[]
- `GET /admin/voices/approved` → VoiceResponse[]
- `PATCH /admin/voices/{id}/approve` (body: VoiceApprovalRequest) → VoiceResponse
- `PATCH /admin/voices/{id}/unapprove` (body: VoiceApprovalRequest) → VoiceResponse

## Key Points

✅ **All voices are user-owned** - Every voice has a `user_id`  
✅ **No more stock voices** - Only user-created voices now  
✅ **Soft delete support** - `is_deleted` flag preserves referential integrity  
✅ **Community sharing model** - Two-step: user shares (`is_shared=true`), admin approves (`is_approved=true`)  
✅ **Two-tier approval** - Users NEVER see admin approval status in their UI  

---

**Version**: 1.0  
**Updated**: July 7, 2026  
**For**: Unified Voices System (Task 18+)
