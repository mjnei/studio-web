# Admin Voices - Unified View for Stock Voices & User Recordings

## Problem
The admin voices page (`/admin/voices`) was only showing **Stock Voices** from TTS providers (ElevenLabs, etc.), but not **User Voice Recordings**. These are two separate data models:

1. **Stock Voices** (`voices` table) - Catalog of voices from TTS providers
   - No `user_id` field
   - Global catalog items
   - Managed by admin
   
2. **User Voice Recordings** (`voice_recordings` table) - User-uploaded audio samples
   - Has `user_id` field (FK to users table)
   - User-specific recordings
   - Used for voice cloning

The confusion arose because both are called "voices" but serve different purposes in the system.

## Solution
Enhanced the `/admin/voices` page to show **BOTH** stock voices and user recordings in a single unified interface with a view toggle.

## Changes Made

### Frontend - Admin Voices Page
**File:** `studio-web/src/app/(shell)/admin/voices/page.tsx`

#### New Features:

**1. View Type Toggle**
- **Stock Voices** button - Shows TTS provider catalog
- **User Recordings** button - Shows user-uploaded voice samples
- Badge counts on each button showing total items

**2. Dual State Management**
```typescript
const [voices, setVoices] = useState<VoiceResponse[]>([]);
const [recordings, setRecordings] = useState<VoiceRecordingResponse[]>([]);
const [viewType, setViewType] = useState<"stock" | "recordings">("stock");
```

**3. Separate Data Loading**
- `loadVoices()` - Fetches from `/api/v1/voices/search`
- `loadRecordings()` - Fetches from `/api/v1/voice-recordings`
- Auto-loads appropriate data when view type changes

**4. Stock Voices View** (Existing functionality preserved)
- All existing features maintained:
  - Search, filter by provider/availability/gender
  - Statistics dashboard
  - CRUD operations (Create, Edit, Enable/Disable, Delete)
  - Bulk import
  - Audio preview

**5. User Recordings View** (NEW)
- **Table Columns:**
  - Title + Description
  - User ID (truncated)
  - Duration (formatted as MM:SS)
  - Created date
  - Actions (Play, Delete)

- **Features:**
  - Search by title or description
  - Play audio inline
  - Delete recording (admin can remove any user's recording)
  - Shows total count

**6. Conditional UI**
- Create/Bulk Import buttons only show for Stock Voices view
- Filters only show for Stock Voices view (recordings have simpler search)
- Statistics cards adapt based on view type
- Page subtitle updated: "Manage stock voices from providers and user voice recordings"

#### API Integration:

**Stock Voices:**
- Endpoint: `GET /api/v1/voices/search` (without `is_available` param = returns ALL)
- Type: `VoiceResponse[]`

**User Recordings:**
- Endpoint: `GET /api/v1/voice-recordings`
- Type: `VoiceRecordingResponse[]`
- Requires authentication header

**Delete Recording:**
- Endpoint: `DELETE /api/v1/voice-recordings/{id}`
- Admin can delete any user's recording

### Backend
No backend changes required! The endpoints already exist:
- `/api/v1/voice-recordings` (GET, POST, DELETE)
- `/api/v1/voices/search` (GET with optional filters)

## Architecture

### Data Model Comparison

| Feature | Stock Voices | User Recordings |
|---------|-------------|-----------------|
| Table | `voices` | `voice_recordings` |
| Primary Key | `id` (string) | `id` (UUID) |
| User Association | None | `user_id` (FK) |
| Provider | ElevenLabs, Azure, etc. | N/A |
| Availability Toggle | Yes (`is_available`) | No |
| Preview URL | `preview_url` | `file_path` |
| Purpose | TTS provider catalog | Voice cloning samples |
| Admin Actions | Full CRUD + Bulk Import | View + Delete only |

### User Experience Flow

**Admin wants to manage stock voices:**
1. Opens `/admin/voices`
2. Defaults to "Stock Voices" view
3. Uses existing CRUD operations
4. Can filter, search, bulk import

**Admin wants to see user recordings:**
1. Opens `/admin/voices`
2. Clicks "User Recordings" tab
3. Sees all user-uploaded recordings
4. Can search, play, or delete

## Testing Checklist

### Stock Voices View (Existing Functionality)
- [ ] View loads with stock voices
- [ ] Search works
- [ ] All filters work (provider, availability, gender)
- [ ] Create voice modal works
- [ ] Edit voice works
- [ ] Toggle availability works
- [ ] Delete voice works
- [ ] Bulk import works
- [ ] Audio preview works
- [ ] Statistics cards show correct counts

### User Recordings View (New Functionality)
- [ ] Switch to "User Recordings" tab
- [ ] All recordings load
- [ ] Search by title/description works
- [ ] User ID displays (truncated)
- [ ] Duration formats correctly (MM:SS)
- [ ] Created date displays
- [ ] Play button plays audio
- [ ] Delete button removes recording
- [ ] Count badge updates after delete

### View Toggle
- [ ] Toggle between views works
- [ ] Data reloads when switching views
- [ ] Create/Bulk Import buttons hide in recordings view
- [ ] Filters hide in recordings view
- [ ] Statistics adapt to current view
- [ ] Badge counts are accurate

## Future Enhancements

### User Recordings View
- [ ] Add edit functionality (title, description)
- [ ] Add download button
- [ ] Show audio waveform visualization
- [ ] Filter by user
- [ ] Sort by date, duration, title
- [ ] Pagination for large datasets
- [ ] Bulk delete
- [ ] Export recordings data

### Stock Voices View
- [ ] Sync from provider API button
- [ ] Voice usage statistics
- [ ] Assign voices to specific users
- [ ] Voice quality ratings

## Notes

### Why Two Separate Views?
While both are "voices," they have fundamentally different purposes and data structures:
- **Stock Voices**: Managed catalog for production use
- **User Recordings**: User-generated content for voice cloning

Combining them into one table would be confusing and lead to inappropriate operations (e.g., trying to "enable/disable" a user recording).

### Admin Permissions
Admins can:
- ✅ View all stock voices (available and unavailable)
- ✅ Create/update/delete stock voices  
- ✅ View all user recordings (from any user)
- ✅ Delete any user recording
- ❌ Edit user recordings (title/description) - could be added if needed

### Data Flow
```
User visits /voices page
  → Records voice
  → Saved to voice_recordings table
  → Now visible in /admin/voices (User Recordings tab)

Admin visits /admin/voices page
  → Stock Voices tab (default)
    → Manages TTS provider catalog
  → User Recordings tab
    → Views/deletes user uploads
```
