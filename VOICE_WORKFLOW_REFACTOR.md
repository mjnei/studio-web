# Voice Selection Workflow Refactor

## Overview

Refactored the voice selection workflow to properly separate voice preview playback (Step 4) from TTS generation (Step 5).

## Problem

Previously, the voice selection page (Step 4) was generating TTS audio using `generateTTSPreview()` to create previews of voices speaking the first sentence of the script. This was:
- Confusing for users (unclear if this was the final audio)
- Inefficient (generating TTS just for preview)
- Inconsistent with the workflow design

## Solution

### Step 4: Voice Selection (Browse & Select)
- **Purpose**: Allow users to browse and select voices
- **Audio**: Play pre-recorded voice preview samples only
- **No TTS generation**: Does not create any audio with the script

### Step 5: Preview (Generate Full Audio)
- **Purpose**: Generate complete TTS audio with selected voice
- **Audio**: Creates full narration using the entire script
- **TTS generation**: Happens here using the selected voice from Step 4

## Changes Made

### 1. Voice Selection Page (`src/app/project/[projectId]/voice/page.tsx`)

#### Removed:
- `generateTTSPreview` import and function calls
- `TTSPreviewResponse` type
- `previewCache` state (cached generated TTS previews)
- `previewLoading` state
- `previewText` computed value (first sentence extraction)
- `handlePreview()` function (generated TTS for preview)
- Complex fallback logic in `playAudio()`

#### Simplified:
- `playAudio()` function now only plays voice preview audio:
  - **Stock voices**: Fetches presigned URL via `getVoicePreviewUrl()`
  - **User recordings**: Uses `audio_url` from recording object
  - Both convert to blob URLs for reliable playback
  - Clear error handling with alerts

#### Updated:
- Page description: "Choose a voice and listen to its preview. Audio will be generated in the next step."
- Removed `onPreview` and `isPreviewLoading` props from `VoiceSelectionCard` (still optional in component)

### 2. Preview Page (`src/app/project/[projectId]/preview/page.tsx`)

#### Updated:
- Page description: "Generating full audio with your selected voice and script"
- No functional changes (already had TTS generation logic)

### 3. Documentation (`WORKFLOW_FIXES.md`)

#### Added:
- Issue #3: Voice Selection Workflow Separation
- Complete workflow steps with clarified purposes
- Summary of voice selection vs preview differences

## Audio Playback Flow

### Stock Voices
```
User clicks voice → playAudio() called
  ↓
Get presigned URL: getVoicePreviewUrl(voiceId)
  ↓
Fetch audio as blob from presigned URL
  ↓
Create blob URL and play with Audio()
  ↓
Clean up blob URL on ended/error
```

### User Recordings
```
User clicks recording → playAudio() called
  ↓
Use audio_url from recording object (presigned URL)
  ↓
Fetch audio as blob from presigned URL
  ↓
Create blob URL and play with Audio()
  ↓
Clean up blob URL on ended/error
```

## Benefits

✅ **Clearer workflow** - Users understand each step's purpose  
✅ **Better performance** - No unnecessary TTS generation in voice selection  
✅ **Simpler code** - Removed caching and preview generation logic  
✅ **Consistent UX** - Stock voices and recordings work the same way  
✅ **Proper separation** - Voice browsing vs audio generation are distinct  

## Testing Checklist

### Voice Selection (Step 4)
- [ ] Browse stock voices
- [ ] Click on stock voice → plays its preview audio
- [ ] Browse user recordings
- [ ] Click on recording → plays its audio
- [ ] Select a voice → "Selected: [Voice Name]" appears
- [ ] Navigate to next step with selected voice

### Preview (Step 5)
- [ ] Enters from voice selection with voice selected
- [ ] Automatically starts TTS generation
- [ ] Shows progress bar during generation
- [ ] Shows "Generating Full Audio" message
- [ ] Audio becomes playable when completed
- [ ] Can play/pause full script narration
- [ ] Can navigate to compose step when ready

## Files Modified

### Frontend
- `src/app/project/[projectId]/voice/page.tsx` - Removed TTS preview generation
- `src/app/project/[projectId]/preview/page.tsx` - Updated description
- `WORKFLOW_FIXES.md` - Documented changes
- `VOICE_WORKFLOW_REFACTOR.md` - This document

### Backend
- No changes required (endpoints already support this flow)

## API Endpoints Used

### Voice Selection
- `GET /api/v1/voices` - List stock voices
- `GET /api/v1/voices/{id}/preview-url` - Get presigned URL for stock voice preview
- `GET /api/v1/recordings` - List user voice recordings (with audio_url)

### Preview
- `POST /api/v1/tts` - Create TTS job with voice and script
- `GET /api/v1/tts/{id}` - Poll TTS job status
- `GET /api/v1/tts/{id}/audio` - Get generated TTS audio

---

**Status**: ✅ Complete  
**Date**: June 24, 2026
