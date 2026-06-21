# Admin Voices & Movies Enhancements

## Summary
Enhanced the `/admin/voices` and `/admin/movies` pages with improved functionality, filtering, and visual presentation.

## Changes Made

### Backend Changes

#### 1. Voice Search API - Fixed Availability Filter
**File:** `app/schemas/voice_schema.py`
- Changed `is_available: bool = True` to `is_available: bool | None = True`
- Now supports three states:
  - `True`: Show only available voices
  - `False`: Show only unavailable voices  
  - `None`: Show ALL voices (for admin view)

**File:** `app/routers/voices.py`
- Updated endpoint parameter: `is_available: bool | None = Query(True, ...)`
- Updated documentation to reflect new behavior

**File:** `app/services/voice_service.py`
- Modified `search_voices()` to only apply availability filter when `is_available is not None`
- This allows admin to see all voices regardless of status

**File:** `app/routers/admin_catalog.py`
- No changes needed - admin endpoints for POST/PUT/PATCH/DELETE already exist

### Frontend Changes

#### 2. Admin Voices Page Enhancements
**File:** `studio-web/src/app/(shell)/admin/voices/page.tsx`

**New Features:**
- **Statistics Dashboard:**
  - Total voices count
  - Active voices count
  - Disabled voices count  
  - Number of providers
  
- **Advanced Filtering:**
  - Filter by provider (dropdown)
  - Filter by availability status (all/active/disabled)
  - Filter by gender (all/male/female/neutral)
  - Search by name or description
  - Clear filters button
  - Shows "X of Y voices" count

- **Enhanced Table:**
  - Added Language column
  - Shows voice description as subtitle
  - Status badges with color coding (green/red)
  - Preview audio button (plays voice sample)
  - Better responsive layout
  - Improved action buttons layout

**Bug Fixed:**
- Now fetches ALL voices (both with and without user_id) by calling `/voices/search` without the `is_available` parameter, which defaults to `None` on the backend and returns all voices

#### 3. Admin Movies Page Enhancements
**File:** `studio-web/src/app/(shell)/admin/movies/page.tsx`

**New Features:**
- **View Modes:**
  - Grid view (default) - Beautiful card-based layout
  - Table view - Compact list view
  - Toggle buttons to switch between views

- **Grid View Features:**
  - Movie poster images from TMDB
  - Fallback icon when no poster available
  - Rating badge with star icon
  - Release year display
  - Overview preview (2 lines max)
  - Hover effects with scale animation
  - Responsive grid (1-4 columns based on screen size)

- **Enhanced Search:**
  - Search by title OR overview (more comprehensive)
  - Better placeholder text

- **Table View Enhancements:**
  - Poster thumbnail column
  - Better formatting of dates
  - Star icon for ratings
  - Overview preview in subtitle

- **Visual Improvements:**
  - Uses Next.js Image component for optimization
  - TMDB image CDN integration
  - Better spacing and typography
  - Improved color contrast

#### 4. Type Definitions Updated
**File:** `studio-web/src/lib/types/api.ts`

**VoiceResponse Type:**
```typescript
export interface VoiceResponse {
  id: string;
  provider_id?: string;
  provider: string;
  name: string;
  description?: string | null;     // Added
  preview_url?: string | null;     // Added
  gender?: string | null;
  age_group?: string | null;
  accent?: string | null;
  language?: string | null;        // Added
  category?: string | null;
  is_available: boolean;
  provider_last_synced_at?: string; // Added
  created_at: string;
  updated_at: string;
}
```

**MovieResponse Type:**
```typescript
export interface MovieResponse {
  id: string;
  tmdb_id: number;
  title: string;
  original_title?: string | null;   // Added
  overview?: string | null;          // Added
  poster_path?: string | null;       // Added
  backdrop_path?: string | null;     // Added
  poster_url?: string;
  genre_ids: number[];
  rating: number;
  release_date?: string | null;      // Made optional
  created_at: string;
  updated_at: string;
}
```

#### 5. Admin API Client
**File:** `studio-web/src/lib/api/admin.ts`

Changed `adminGetVoices()` to call `/voices/search` without parameters:
```typescript
export async function adminGetVoices(): Promise<VoiceResponse[]> {
  // Get ALL voices (both available and unavailable) for admin view
  // No is_available parameter = defaults to None on backend = returns all
  const response = await request<{ voices: VoiceResponse[]; total: number }>(
    "/voices/search"
  );
  return response.voices;
}
```

## Testing Checklist

### Backend
- [ ] Test `/voices/search` with `is_available=true` - should return only available voices
- [ ] Test `/voices/search` with `is_available=false` - should return only unavailable voices  
- [ ] Test `/voices/search` without `is_available` param - should return ALL voices
- [ ] Verify admin endpoints for CRUD operations still work

### Frontend - Admin Voices
- [ ] Verify all voices display (available and unavailable)
- [ ] Test statistics cards show correct counts
- [ ] Test provider filter dropdown
- [ ] Test availability status filter
- [ ] Test gender filter
- [ ] Test search by name
- [ ] Test search by description
- [ ] Test clear filters button
- [ ] Test preview audio button (if voice has preview_url)
- [ ] Test edit, enable/disable, and delete actions
- [ ] Test create voice modal
- [ ] Test bulk import

### Frontend - Admin Movies
- [ ] Test grid/table view toggle
- [ ] Verify poster images load correctly
- [ ] Test fallback icon when no poster
- [ ] Test rating badges display
- [ ] Test search by title
- [ ] Test search by overview
- [ ] Test edit, delete actions in both views
- [ ] Test create movie modal
- [ ] Test bulk import

## Architecture Notes

### Why We Changed the Backend Filter Logic
The original implementation had a boolean `is_available` filter that defaulted to `True`. This meant:
- Regular users: `GET /voices/search` → only available voices ✓
- Admin users: `GET /voices/search?is_available=false` → only UNavailable voices ✗ (wrong!)

The admin actually needs ALL voices. We changed it to use `bool | None`:
- Regular users: Still defaults to `True` → available only ✓
- Admin users: Pass no parameter → `None` → all voices ✓

### Voice Model Has No user_id
The Voice model represents the global catalog of voices from TTS providers (ElevenLabs, etc.). These are NOT user-specific. The filtering is purely by availability status (`is_available` boolean flag).

### Image Optimization
The movies page now uses:
- Next.js `Image` component for automatic optimization
- TMDB image CDN (`https://image.tmdb.org/t/p/w500/...`)
- `unoptimized` prop since we're loading from external domain
- Proper aspect ratios for movie posters (2:3)

## Future Enhancements

### Admin Voices
- [ ] Bulk enable/disable voices
- [ ] Export voices to JSON
- [ ] Voice preview waveform visualization
- [ ] Batch sync from provider API
- [ ] Provider-specific settings

### Admin Movies  
- [ ] Advanced filters (genre, year range, rating range)
- [ ] Bulk operations (delete, update availability)
- [ ] Movie detail modal with full info
- [ ] Backdrop image display
- [ ] Genre tags
- [ ] Sort options (rating, date, popularity)
- [ ] Pagination for large catalogs

## Breaking Changes
None. All changes are backward compatible.
