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
4. **voice** - Select voice and generate TTS
5. **preview** - Listen to audio preview
6. **compose** - Generate final video

---

## Testing Instructions

### Test Audio Playback
1. Go to `/project/{id}/voice`
2. Click "Play Preview" on any voice recording
3. ✅ Audio should play without 401 errors

### Test Step Persistence
1. Create a new project and progress to step 3 (details)
2. Navigate away to `/projects`
3. Click on the project card
4. ✅ Should open at step 3, not step 1

---

## Migration Status

✅ Migration `e08bed7ae0d0_add_details_and_preview_to_last_step` applied successfully.
