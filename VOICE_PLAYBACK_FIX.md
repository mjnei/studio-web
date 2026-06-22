# Voice Playback and Workflow Enhancement

## Summary
Fixed audio playback issues for voice recordings and added two new workflow steps to improve the user experience.

## Issues Fixed

### 1. Audio Playback for Voice Recordings
**Problem**: Voice recordings under "My Voice Recordings" couldn't be played because:
- The `VoiceRecordingResponse` didn't include an `audio_url` field
- Audio files are served via `/recordings/{recording_id}/audio` endpoint
- Connection errors due to missing authentication

**Solution**:
- Added `audio_url` computed field to `VoiceRecordingResponse` type
- Created `getVoiceRecordingAudioUrl()` helper function to generate proper audio URLs
- Updated `use-voice-recordings` hook to automatically add audio URLs to all recordings
- Modified `VoiceSelectionCard` to fetch audio as blob with proper credentials for authenticated playback
- Updated voice page to use recording audio URLs directly for preview

**Files Changed**:
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/lib/types/api.ts`
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/lib/api/voice-recording-client.ts`
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/lib/hooks/use-voice-recordings.ts`
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/components/project/voice-selection-card.tsx`
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/app/project/[projectId]/voice/page.tsx`

## New Workflow Steps

### 2. Project Details Step (between Script and Voice)
**Purpose**: Allow users to name their project before selecting a voice.

**Features**:
- Auto-generates default project name from movie title + timestamp
- Stores project name in localStorage (no backend changes required)
- Shows script summary for context
- Clean, simple UI with one input field

**File Created**:
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/app/project/[projectId]/details/page.tsx`

### 3. Voice Preview Step (between Voice and Compose)
**Purpose**: Show a TTS preview of the first sentence in the selected voice tone.

**Features**:
- Displays first sentence from project script
- Shows project name from previous step
- Plays full generated audio with custom play/pause controls
- Includes native audio player as fallback
- Auto-navigates to this page when voice generation completes

**File Created**:
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/app/project/[projectId]/preview/page.tsx`

## Workflow Navigation Updated

Updated workflow step order:
1. **Source** - Select movie
2. **Script** - Generate/edit script
3. **Details** - Name project (NEW)
4. **Voice** - Select and generate voice
5. **Preview** - Listen to voice preview (NEW)
6. **Compose** - Final video composition

**File Changed**:
- `/Users/aa/git/github_uncgra/huavoi/studio-web/src/components/project/floating-workflow-navigation.tsx`

## Technical Details

### Audio Playback Authentication
The audio playback now properly handles authentication by:
1. Using `credentials: 'include'` in fetch requests
2. Fetching audio as blob before creating Audio object
3. Creating object URL from blob for playback
4. Backend streams audio through `/recordings/{id}/audio` endpoint with session authentication

### Auto-navigation Flow
- After voice generation completes, user is automatically redirected to preview page
- Voice page no longer shows "Continue" button, as preview step handles that
- Preview page becomes the checkpoint before moving to compose

## Testing Checklist

- [ ] Voice recordings play when clicking play button
- [ ] Stock voices can generate and play previews
- [ ] After script step, user is taken to details page
- [ ] Project name is auto-populated with sensible default
- [ ] After voice generation, user is auto-navigated to preview page
- [ ] Preview page shows first sentence from script
- [ ] Audio playback works on preview page
- [ ] Can navigate back through all workflow steps
- [ ] Workflow navigation shows correct step numbers (1-6)

## Known Limitations

1. Project name is stored in localStorage, not in database
   - If user clears browser data, project name is lost
   - Consider adding project name field to backend in future

2. Audio preview uses full TTS audio
   - Not specifically generating just first sentence
   - Could optimize by adding preview-only TTS endpoint

## Future Enhancements

1. Add project name to backend database schema
2. Generate short audio previews for first sentence only
3. Add audio waveform visualization
4. Allow replaying with different voices from preview page
