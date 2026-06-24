# Workflow Fixes Summary

## Issues Fixed

### 1. Audio Playback 401 Unauthorized Error ✅

**Problem**: When trying to play voice recordings in the voice selection page (step 4), the audio endpoint returned 401 Unauthorized error.

**Root Cause**: The `/api/v1/recordings/{id}/audio` endpoint requires authentication via Bearer token in the Authorization header. The frontend was only sending cookies via `credentials: 'include'`, but the backend's `get_current_user` dependency requires an HTTP Bearer token.

**Solution**: Updated `VoiceSelectionCard` component to include the Authorization header with the access token when fetching audio.

**Files Modified**:
- `src/components/project/voice-selection-card.tsx`

---

### 2. Project Workflow Step Persistence ✅

**Problem**: The project workflow has 6 steps (source, script, details, voice, preview, compose), but the backend only tracked 4 steps. The "details" and "preview" steps weren't being persisted, so users would lose progress when navigating away.

**Root Cause**: Database CHECK constraint on the `projects.last_step` column only allowed 4 values, missing "details" and "preview".

**Solution**:

#### Backend Changes:
1. Created Alembic migration to update the CHECK constraint for all 6 steps
2. Updated Project model in `app/models/project.py`
3. Updated `advance_project_step` endpoint in `app/routers/projects.py`
4. Updated `update_project_step` service in `app/services/project.py`

#### Frontend Changes:
1. Updated `WorkflowStep` type in `lib/project-client.ts`
2. Updated hook type in `lib/hooks/use-project-state.ts`
3. Added step advancement to `details` and `preview` pages

**Files Modified**:
- Backend: `alembic/versions/e08bed7ae0d0_*.py` (new), `app/models/project.py`, `app/routers/projects.py`, `app/services/project.py`
- Frontend: `src/lib/project-client.ts`, `src/lib/hooks/use-project-state.ts`, `src/app/project/[projectId]/details/page.tsx`, `src/app/project/[projectId]/preview/page.tsx`

---

## Complete Workflow Steps

1. **source** - Select movie from TMDB
2. **script** - Generate/edit script
3. **details** - Name the project
4. **voice** - Select voice and listen to voice preview (no TTS generation)
5. **preview** - Review project summary and configuration (placeholder - no audio generation)
6. **compose** - Generate final video

---

## Voice Selection vs Preview

### Step 4: Voice Selection
- **Purpose**: Browse and select voices (stock or user recordings)
- **Actions**:
  - Display stock voices from the catalog
  - Display user voice recordings
  - Play voice preview audio (pre-recorded samples)
  - Select a voice for the project
- **No TTS generation** - Only plays existing voice previews

### Step 5: Preview
- **Purpose**: Review project configuration before video composition
- **Actions**:
  - Display project summary (name, voice, script)
  - Show script preview
  - Placeholder: Audio generation will be added in future update
  - Proceed to video composition when ready

**Note**: TTS audio generation has been removed. This step now serves as a review/confirmation step before proceeding to video composition.

---

## Testing Instructions

### Test Audio Playback (Step 4)
1. Go to `/project/{id}/voice`
2. Click "Play Preview" on any voice recording
3. ✅ Audio should play without 401 errors

### Test Step Persistence
1. Create a new project and progress to step 3 (details)
2. Navigate away to `/projects`
3. Click on the project card
4. ✅ Should open at step 3, not step 1

### Test Preview Step (Step 5)
1. Complete steps 1-4 to reach the preview page at `/project/{id}/preview`
2. ✅ Should see project summary with selected voice and script
3. ✅ Should show placeholder notice about audio generation
4. ✅ "Next" button should be enabled immediately
5. ✅ Can proceed to compose step

---

## Migration Status

✅ Migration `e08bed7ae0d0_add_details_and_preview_to_last_step` applied successfully.

---

### 3. Voice Selection Workflow Separation ✅

**Problem**: Step 4 (Voice Selection) was generating TTS preview audio for the first sentence using `generateTTSPreview()`, which was confusing and unnecessary.

**Root Cause**: The voice selection page had complex logic to generate TTS previews on-demand, cache them, and play them back. This was meant for testing voices with script content, but it should just play the voice's own preview audio.

**Solution**: 

#### Frontend Changes:
1. Removed TTS preview generation from voice selection page
2. Removed `generateTTSPreview` import and related state (`previewCache`, `previewLoading`)
3. Simplified `playAudio()` function to only play voice preview audio:
   - For stock voices: Fetch presigned URL from `/voices/{id}/preview-url`
   - For user recordings: Use presigned URL from `audio_url` field
4. Updated voice selection card to not show TTS loading states

**Files Modified**:
- `src/app/project/[projectId]/voice/page.tsx` - Removed TTS preview generation
- `src/app/project/[projectId]/preview/page.tsx` - Simplified to placeholder
- `src/lib/project-client.ts` - Removed TTS API client functions
- Backend: Removed `app/routers/tts.py`, `app/services/tts.py`, `app/services/tts_provider.py`

---

### 4. Step 5 Simplified to Placeholder ✅

**Change**: Removed all TTS audio generation from Step 5 (Preview). This step now serves as a simple review/confirmation page.

**Reason**: TTS API integration deferred to future update. Step 5 is now a lightweight placeholder.

**Current Implementation**:
- Shows project summary (name, voice, script preview)
- Displays placeholder notice about future audio generation
- "Next" button enabled immediately
- No API calls or processing

**Files Modified**:
- Frontend: `src/app/project/[projectId]/preview/page.tsx` - Removed TTS generation logic
- Frontend: `src/lib/project-client.ts` - Removed `createTTSJob`, `getTTSJob`, `generateTTSPreview`
- Backend: Removed TTS router from `app/main.py`
- Backend: Deleted `app/routers/tts.py`
- Backend: Deleted `app/services/tts.py`
- Backend: Deleted `app/services/tts_provider.py`
- Backend: Reverted `app/storage.py` to original (removed async optimizations)

---

## Summary of Current Workflow

### Complete 6-Step Workflow:

1. **Step 1 - Source**: Select movie from TMDB
2. **Step 2 - Script**: Generate/edit script
3. **Step 3 - Details**: Name the project
4. **Step 4 - Voice**: Select voice and play preview samples
5. **Step 5 - Preview**: Review project summary (placeholder - no audio generation)
6. **Step 6 - Compose**: Generate final video

### Key Points:
- No TTS generation in any step
- Voice preview audio only plays pre-recorded samples
- Step 5 is a simple confirmation/review page
- All steps properly persist to database
- Workflow navigation works correctly
