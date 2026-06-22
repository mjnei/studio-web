# Admin Voices Page - Bug Fixes

## Issues Fixed

### 1. ❌ "Not authenticated" Error When Creating Stock Voice

**Problem:**
When creating a new stock voice, users got "Not authenticated" error even though they were logged in as admin.

**Root Cause:**
The `adminCreateVoice` function was using `localStorage.getItem("access_token")` to get the authentication token. However, the app stores tokens in memory using the `getAccessToken()` function from `api-client.ts`, not in localStorage.

**Fix:**
```typescript
// BEFORE (❌ Wrong)
const accessToken = localStorage.getItem("access_token");

// AFTER (✅ Correct)
import { getAccessToken } from "@/lib/api-client";
const token = getAccessToken();
```

**Files Changed:**
- `/src/lib/api/admin.ts`
  - Added `getAccessToken` import
  - Changed token retrieval method
  - Added `credentials: "include"` for cookie-based auth fallback

**Code Location:** Lines 1, 84-88

---

### 2. ❌ Unavailable Voices Not Displayed When Filter is "All Status"

**Problem:**
When a voice was set to `is_available: false`, it disappeared from the admin panel even when the filter was set to "All Status". Only available voices were shown.

**Root Cause:**
The frontend was using `/voices/search` endpoint which defaults to `is_available=true`. There was no way to pass `null` to the boolean query parameter without getting a 422 validation error.

**Fix:**
Created a dedicated admin endpoint that returns all voices regardless of availability:

**Backend - New Endpoint:**
```python
@router.get("/admin/voices", response_model=list[VoiceResponse])
async def admin_list_all_voices(
    skip: int = 0,
    limit: int = 1000,
    admin: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """Returns all voices regardless of availability status."""
    stmt = select(Voice).offset(skip).limit(limit)
    result = await db.execute(stmt)
    voices = result.scalars().all()
    return voices
```

**Frontend - Updated Call:**
```typescript
// BEFORE (❌ Used public endpoint with default filter)
const response = await request<{ voices: VoiceResponse[]; total: number }>(
  "/voices/search"
);
return response.voices;

// AFTER (✅ Uses admin endpoint that returns all)
return request<VoiceResponse[]>("/admin/voices");
```

**Why a New Endpoint?**
- Public `/voices/search` is designed for end users (should default to available voices)
- Admin needs to see all voices including disabled ones
- FastAPI can't accept `null` for boolean query params (empty string = 422 error)
- Cleaner separation of concerns

**Files Changed:**
- `/app/routers/admin_catalog.py` - Added `GET /admin/voices` endpoint
- `/src/lib/api/admin.ts` - Updated `adminGetVoices()` to use new endpoint

**Code Locations:**
- Backend: Lines 136-159
- Frontend: Lines 73-76

---

## Backend Endpoint Parameters

### Public Endpoint: `/voices/search`
For end users - defaults to showing only available voices:

```python
@router.get("/search", response_model=VoiceListResponse)
async def search_voices_endpoint(
    query: str | None = Query(None),
    provider: str | None = Query(None),
    gender: str | None = Query(None),
    age: str | None = Query(None),
    accent: str | None = Query(None),
    category: str | None = Query(None),
    is_available: bool | None = Query(True, ...),  # ⚠️ Default is True!
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
```

**Important:** `is_available` defaults to `True`, and you cannot pass `null` via query string (causes 422 error).

### Admin Endpoint: `GET /admin/voices`
For admins - returns ALL voices regardless of availability:

```python
@router.get("/admin/voices", response_model=list[VoiceResponse])
async def admin_list_all_voices(
    skip: int = 0,
    limit: int = 1000,
    admin: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
```

**Benefits:**
- ✅ No filtering by default
- ✅ Admin-only (requires admin role)
- ✅ Simple interface (no complex query params)
- ✅ Returns list directly (not wrapped in response object)

---

## Testing Checklist

### Authentication Fix:
- [x] Admin can create stock voice without "Not authenticated" error
- [x] Token is retrieved from memory store, not localStorage
- [x] Request includes credentials for cookie-based auth

### Availability Filter Fix:
- [x] "All Status" filter shows both available and unavailable voices
- [x] "Active Only" filter shows only `is_available=true` voices
- [x] "Disabled Only" filter shows only `is_available=false` voices
- [x] Stats cards reflect correct counts (total, active, disabled)
- [x] Disabled voices appear with red "Disabled" badge

---

## Related Code

**Frontend:**
- `/src/lib/api/admin.ts` - Admin API functions
- `/src/lib/api-client.ts` - Token management utilities
- `/src/app/(shell)/admin/voices/page.tsx` - Admin voices page

**Backend:**
- `/app/routers/admin_catalog.py` - Admin voice endpoints (including new `GET /admin/voices`)
- `/app/routers/voices.py` - Public voice search endpoint

---

## Token Management in the App

The app uses **in-memory token storage**, not localStorage:

```typescript
// api-client.ts
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}
```

**Why?**
- More secure (tokens not persisted to disk)
- Prevents XSS attacks from stealing tokens
- Session expires when tab/window closes

**Fallback:**
- Refresh tokens are stored in httpOnly cookies
- If access token is missing, it's refreshed via `/auth/refresh`
- Uses `credentials: "include"` to send cookies

---

## Authentication Flow

1. User logs in → Backend returns access token + sets refresh token cookie
2. Frontend stores access token in memory via `setAccessToken()`
3. All API requests use `getAccessToken()` to add Authorization header
4. If 401 error → Automatically refresh using cookie → Retry request
5. If refresh fails → Redirect to login

**For FormData requests:**
- Can't use the standard `request()` function (doesn't support FormData)
- Must manually:
  1. Get token via `getAccessToken()`
  2. Add Authorization header
  3. Include `credentials: "include"`
  4. Handle errors manually

---

## Summary

Both issues were related to incorrect API usage:

1. **Authentication:** Used wrong method to get token (localStorage vs in-memory)
2. **Filtering:** Public endpoint had default filter that couldn't be overridden → Created dedicated admin endpoint

**Solution Approach:**
- Instead of trying to work around the public endpoint's boolean validation
- Created a proper admin-only endpoint that returns all voices by design
- Cleaner, more maintainable, and follows REST principles

**Status:** ✅ Both issues resolved with proper architecture
