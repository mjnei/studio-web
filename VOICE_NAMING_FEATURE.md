# Voice Naming Feature Implementation

## Overview
Enhanced the voice recording feature to prompt users for a custom name after recording, and automatically update the list without requiring a page refresh.

## Changes Made

### 1. VoiceRecorder Component (`src/components/shared/voice-recorder.tsx`)

#### New State
- Added `"naming"` to `RecorderState` type
- Added `voiceName` state to store user input

#### New Flow
1. User records audio → `"recorded"` state
2. User clicks "Continue" → `"naming"` state (new)
3. User enters name → clicks "Save voice"
4. Recording uploaded with custom name
5. Returns to idle and calls `onSaved` with the new recording

#### New UI - Naming Screen
```tsx
{state === "naming" && (
  <div>
    <label>Name your voice</label>
    <input
      type="text"
      value={voiceName}
      onChange={(e) => setVoiceName(e.target.value)}
      placeholder="e.g., My Voice, Professional Narrator, etc."
      autoFocus
    />
    <Button onClick={() => setState("recorded")}>Back</Button>
    <Button onClick={saveRecording}>Save voice</Button>
  </div>
)}
```

#### Features
- ✅ Auto-focus on name input
- ✅ Enter key to submit
- ✅ Back button to return to preview
- ✅ Default name if user leaves it empty: "My Voice Recording"
- ✅ Input disabled during upload
- ✅ Helper text for guidance

#### Updated Callbacks
- `proceedToNaming()`: Transitions from recorded → naming state
- `saveRecording()`: Now uses `voiceName` state for the title
- `discardRecording()`: Resets `voiceName` to empty string
- `onSaved`: Updated signature to pass `VoiceRecordingResponse` object

### 2. useVoiceRecordings Hook (`src/lib/hooks/use-voice-recordings.ts`)

#### New Function
```typescript
const addRecording = useCallback((recording: VoiceRecordingResponse) => {
  setRecordings((prev) => [recording, ...prev]);
}, []);
```

#### Updated Return
```typescript
return {
  recordings,
  loading,
  error,
  addRecording,      // NEW: Add recording to list without refetch
  uploadRecording,
  deleteRecording,
  refetch: fetchRecordings,
};
```

### 3. Voices Page (`src/app/(shell)/voices/page.tsx`)

#### Updated Handler
```typescript
const handleRecordingSaved = (newRecording: VoiceRecordingResponse) => {
  addRecording(newRecording);  // Add to list immediately
  setShowRecorder(false);      // Hide recorder
};
```

#### Added Import
```typescript
import { VoiceRecordingResponse } from "@/lib/types/api";
```

## User Flow

### Before
1. Record audio
2. Click "Save this voice" → saves with default name
3. **Manual page refresh needed to see new recording**

### After
1. Record audio
2. Click "Continue"
3. **Enter custom name** (new step)
4. Click "Save voice"
5. **Recording appears immediately in list** (no refresh needed)

## UI Flow Diagram

```
┌─────────────┐
│    Idle     │
│  (Record    │
│   Button)   │
└──────┬──────┘
       │ Click Record
       ↓
┌─────────────┐
│ Requesting  │
│ Microphone  │
└──────┬──────┘
       │ Permission Granted
       ↓
┌─────────────┐
│  Recording  │
│   (Timer)   │
└──────┬──────┘
       │ Stop Recording
       ↓
┌─────────────┐
│  Recorded   │
│  (Preview)  │
│ [Continue]  │
└──────┬──────┘
       │ Click Continue
       ↓
┌─────────────┐  NEW STATE
│   Naming    │  ⭐
│ Enter Name  │
│ [Back][Save]│
└──────┬──────┘
       │ Click Save
       ↓
┌─────────────┐
│   Saving    │
│  (Upload)   │
└──────┬──────┘
       │ Success
       ↓
    [Idle]
  + Recording appears in list
```

## Technical Details

### State Management
- **Component State**: VoiceRecorder manages recording flow
- **Hook State**: useVoiceRecordings manages recordings list
- **Optimistic Update**: New recording added to list immediately after upload

### Type Safety
- All components properly typed with `VoiceRecordingResponse`
- No `any` types used
- Props interfaces clearly defined

### UX Improvements
1. **Smooth Flow**: Natural progression from recording → naming → saving
2. **Instant Feedback**: Recording appears immediately after save
3. **Flexible Naming**: Users can provide custom names or use default
4. **Easy Navigation**: Back button allows reviewing recording before naming
5. **Keyboard Support**: Enter key submits the form

## Testing Checklist

- [ ] Record a voice with a custom name
- [ ] Record a voice leaving name empty (should use default)
- [ ] Click Back button from naming screen
- [ ] Press Enter key to submit name
- [ ] Verify recording appears in grid immediately
- [ ] Verify no page refresh needed
- [ ] Test with long name (should display properly)
- [ ] Test canceling from recorder

## Future Enhancements

1. **Name Validation**
   - Check for duplicate names
   - Limit character count
   - Prevent empty/whitespace-only names

2. **Better Defaults**
   - Auto-generate names (e.g., "Voice Recording #1")
   - Timestamp-based names

3. **Inline Editing**
   - Edit name after saving
   - Rename from voice card

4. **Description Field**
   - Optional description input
   - Save notes about the voice

## Files Modified

```
studio-web/
├── src/
│   ├── app/(shell)/voices/
│   │   └── page.tsx                    ✏️ Updated
│   ├── components/shared/
│   │   └── voice-recorder.tsx          ✏️ Enhanced
│   └── lib/hooks/
│       └── use-voice-recordings.ts     ✏️ Added addRecording
```

## Dependencies

No new dependencies added. Uses existing:
- React hooks (useState, useCallback)
- Existing UI components (Button, input)
- Existing API client functions
