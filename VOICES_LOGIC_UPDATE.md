# Voices Page Logic Update - Complete

**Date**: 2026-07-26  
**Status**: ✅ Complete  
**Files Modified**: 3 files

---

## Summary

Updated the Voices page logic to properly handle voice filtering and limits according to the new requirements. The key change is that **approved shared voices don't count toward user's voice limits** and appear in the **Community tab** instead of the Private tab.

---

## Requirements

### 1. **Private Tab Logic**
- Shows user's own voices EXCLUDING those that are both `is_shared=TRUE` AND `is_approved=TRUE`
- Shared voices that are pending approval (not yet approved) still appear in Private tab
- Users can manage all their private voices (delete, toggle sharing)

### 2. **Community Tab Logic**
- Shows ALL approved shared voices (`is_shared=TRUE` AND `is_approved=TRUE`) from ALL users
- Includes the current user's approved shared voices
- If a voice belongs to the current user, show a delete button instead of "Approved" badge
- Shows creator username with "(you)" indicator for user's own voices

### 3. **Voice Limit Logic**
- Voice limits count ONLY voices that are NOT (`is_shared=TRUE` AND `is_approved=TRUE`)
- Approved shared voices don't count toward limits (community contribution incentive)
- When a voice is approved by admin, it no longer counts toward the user's limit

---

## Files Modified

### 1. Frontend: `/src/app/(shell)/voices/page.tsx`

#### Changes:
```typescript
// Filter private voices: exclude shared AND approved
const privateVoices = voices.filter((voice) => !(voice.is_shared && voice.is_approved));

// Fetch ALL community voices (including user's own)
const data = await getAvailableVoices();
setCommunityVoices(data.community_voices);

// Check if voice belongs to current user
const isOwnVoice = user && voice.user_id === parseInt(user.id, 10);

// Show delete button for own voices, approved badge for others
{isOwnVoice ? (
  <button onClick={() => handleCommunityDeleteClick(voice.id)}>
    <Trash2 />
  </button>
) : (
  <span>Approved</span>
)}
```

#### New Features:
- Delete confirmation modal for community voices
- "(you)" indicator for user's own community voices
- Updated empty state message mentioning Community tab
- Proper type comparison (user.id is string, voice.user_id is number)

### 2. Frontend: `/src/lib/hooks/use-voice-limits.ts`

#### Changes:
```typescript
// Count only non-deleted voices, excluding approved shared voices
const currentCount = voicesData.filter(
  (v) => !v.is_deleted && !(v.is_shared && v.is_approved)
).length;
```

#### Effect:
- Voice limit badge now shows correct count (excluding approved shared voices)
- Users can add more voices after their voice gets approved by admin
- Incentivizes users to share quality voices

### 3. Backend: `/app/services/voice_service.py`

#### Changes:
```python
# Count non-deleted voices excluding approved shared voices
count_result = await db.execute(
    select(func.count())
    .select_from(Voice)
    .where(
        Voice.user_id == user.id,
        ~Voice.is_deleted,
        ~(Voice.is_shared & Voice.is_approved),  # Exclude approved shared
    )
)
```

#### Effect:
- Backend validation matches frontend logic
- Upload endpoint correctly allows more voices when some are approved
- Consistent voice limit enforcement across API

---

## Logic Flow

### Scenario 1: User Creates a Voice
1. User records a new voice
2. Voice is created with `is_shared=FALSE`, `is_approved=FALSE`
3. Voice appears in **Private tab**
4. Voice **counts toward limit**

### Scenario 2: User Shares a Voice
1. User clicks "Share" button on their voice
2. Voice updated: `is_shared=TRUE`, `is_approved=FALSE`
3. Voice still appears in **Private tab** (pending approval)
4. Voice **still counts toward limit**

### Scenario 3: Admin Approves a Shared Voice
1. Admin approves the voice
2. Voice updated: `is_shared=TRUE`, `is_approved=TRUE`
3. Voice moves to **Community tab** (removed from Private tab)
4. Voice **NO LONGER counts toward limit** ✨
5. User can now create additional voices

### Scenario 4: User Views Community Tab
1. Tab shows all approved shared voices from all users
2. User sees their own approved voices with "(you)" indicator
3. User can delete their own community voices
4. Other users' voices show "Approved" badge

### Scenario 5: User Deletes Community Voice (Own)
1. User clicks delete on their community voice
2. Voice is soft-deleted
3. Voice disappears from Community tab
4. Voice **still doesn't count toward limit** (was approved)

### Scenario 6: User Unshares a Voice (Before Approval)
1. User clicks "Make Private" on pending voice
2. Voice updated: `is_shared=FALSE`, `is_approved=FALSE`
3. Voice remains in **Private tab**
4. Voice **still counts toward limit**

---

## Voice Count Examples

### Example 1: Free Tier User (Limit: 2)
- **Private voices**: 2 (both private, not shared)
- **Community voices**: 0 (none approved)
- **Count toward limit**: 2
- **Can add more**: No (at limit)

### Example 2: Free Tier User (Limit: 2) - One Approved
- **Private voices**: 1 (private, not shared)
- **Community voices**: 1 (own voice, approved)
- **Count toward limit**: 1 (only the private one)
- **Can add more**: Yes! (1 slot remaining)

### Example 3: Free Tier User (Limit: 2) - Both Approved
- **Private voices**: 0 (none)
- **Community voices**: 2 (both own voices, approved)
- **Count toward limit**: 0 (neither counts)
- **Can add more**: Yes! (2 slots available)

### Example 4: Pro Tier User (Limit: 5)
- **Private voices**: 3 (2 private, 1 pending approval)
- **Community voices**: 2 (own voices, approved)
- **Count toward limit**: 3 (2 private + 1 pending)
- **Can add more**: Yes (2 slots remaining)

---

## Benefits of This Approach

1. **Incentivizes Sharing**: Users who share quality voices get more slots
2. **Community Building**: Approved voices benefit everyone
3. **Fair Limits**: Users aren't penalized for contributing to community
4. **Clear Separation**: Private vs Community tabs make sense
5. **User Control**: Users can still delete their community voices

---

## UI Improvements

### Private Tab
- Badge count shows only non-approved voices
- Empty state mentions Community tab
- Add voice card shows accurate remaining slots

### Community Tab
- Info banner explains community voices
- User's own voices show delete button
- Other users' voices show "Approved" badge
- Creator shown with "(you)" for own voices
- Delete confirmation modal for safety

### Voice Limit Badge
- Shows accurate count (X / Y voices)
- Updates when voice is approved
- Green styling for positive reinforcement

---

## Testing Scenarios

### ✅ Test 1: Create Voice
1. Create a new voice
2. Verify it appears in Private tab
3. Verify count increases in limit badge

### ✅ Test 2: Share Voice
1. Share a voice from Private tab
2. Verify it stays in Private tab (pending)
3. Verify it still counts toward limit

### ✅ Test 3: Admin Approval (Simulated)
1. Admin approves the voice (backend operation)
2. Refresh page
3. Verify voice moves to Community tab
4. Verify count decreases in limit badge
5. Verify can add more voices

### ✅ Test 4: Delete Community Voice (Own)
1. Go to Community tab
2. Find own voice (with delete button)
3. Click delete, confirm
4. Verify voice disappears
5. Verify limit badge unchanged (already didn't count)

### ✅ Test 5: View Other Users' Community Voices
1. Go to Community tab
2. Verify other users' voices show "Approved" badge
3. Verify no delete button for others' voices
4. Verify creator username displayed

---

## API Compatibility

### Backend Endpoints Used
- `GET /api/v1/voices/`: Lists user's own voices (all sharing statuses)
- `GET /api/v1/voices/available`: Returns own_voices + community_voices
- `POST /api/v1/voices/upload`: Checks voice limit before creation
- `DELETE /api/v1/voices/{id}`: Soft-deletes a voice
- `PATCH /api/v1/voices/{id}/share`: Toggles sharing status

### Backend Filtering (get_available_voices)
```python
# Own voices: all non-deleted, any sharing status
own_voices = WHERE user_id = current_user AND is_deleted = FALSE

# Community voices: approved shared from ALL users
community_voices = WHERE is_shared = TRUE 
                   AND is_approved = TRUE 
                   AND is_deleted = FALSE
```

Note: Community voices include current user's approved voices!

---

## Migration Notes

### No Database Changes Required
All logic changes are in application code only.

### Backward Compatible
- Existing voices work without changes
- Users see immediate benefit when voices are approved
- No breaking changes to API contracts

### Deployment Order
1. Deploy backend changes first (voice limit logic)
2. Deploy frontend changes second (UI updates)
3. No downtime required

---

## Future Enhancements

1. **Approval Notifications**: Notify users when voice is approved
2. **Automatic Re-count**: Real-time limit updates when approval happens
3. **Community Sorting**: Sort community voices by popularity/usage
4. **Preview Audio**: Allow preview of community voices directly
5. **Sharing Analytics**: Show how many times voice was used

---

## Constants Reference

From `/app/constants.py`:

```python
class MembershipTierLimits:
    FREE = 2
    PRO = 5
    PREMIUM = 10
    
    @classmethod
    def get_limit(cls, tier: str) -> int:
        return cls.LIMITS.get(tier.lower(), cls.FREE)
```

---

**Status**: ✅ All changes implemented and tested
**Linting**: ✅ No errors or warnings
**Type Safety**: ✅ All TypeScript types correct
**Logic Validated**: ✅ Matches requirements exactly

