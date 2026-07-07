# Implementation Plan: Voice API Migration to Unified Voices Schema

## Overview

This implementation plan migrates studio-web from the deprecated `/voice-recordings/` API to the unified `/voices/` API through a parallel migration strategy. The deprecated client remains in place while a new `voice-client.ts` is created and components migrate gradually. This approach minimizes breakage and allows verification at each step.

## Phase 0: Backend Endpoint Consolidation ✅ COMPLETE

### Unified Endpoints Added

The backend now provides a unified `/api/v1/voices/*` API pattern alongside the legacy endpoints:

| Operation | New Unified Endpoint | Old User-Scoped | Status |
|-----------|---------------------|------------------|--------|
| Upload | `POST /api/v1/voices/upload` | `/voice-recording/upload` | ✅ NEW |
| List User Voices | `GET /api/v1/voices/?skip&limit` | `/voices/user/my-voices` | ✅ NEW |
| Get Available | `GET /api/v1/voices/available` | `/voices/user/available` | ✅ NEW |
| Audio URL | `GET /api/v1/voices/{id}/audio-url` | `/voices/{id}/preview-url` | ✅ NEW |
| Share Toggle | `PATCH /api/v1/voices/{id}/share` | `/voices/user/{id}/share` | ✅ NEW |
| Get Voice | `GET /api/v1/voices/{id}` | Same | ✅ ALIGNED |
| Update Voice | `PATCH /api/v1/voices/{id}` | Same | ✅ ALIGNED |
| Delete Voice | `DELETE /api/v1/voices/{id}` | Same | ✅ ALIGNED |

### Backend Changes Made

- Added `/app/routers/voices.py` unified endpoints
- All new endpoints delegate to existing service logic (no breaking changes)
- Pagination support added to user voice list endpoint
- Frontend voice-client.ts already implemented correctly for unified endpoints

### Verification

- ✅ Backend imports successfully
- ✅ Linting passes (ruff)
- ✅ No breaking changes to existing endpoints
- ✅ Frontend voice-client.ts ready to use new endpoints

---

## Tasks

- [x] 1. Create new unified voice client (voice-client.ts)
  - [x] 1.1 Create `/src/lib/api/voice-client.ts` with unified endpoint functions
    - Implement `uploadVoice()` with form data (file, name, duration_seconds)
    - Implement `listVoices(skip?, limit?)` using `/voices/` endpoint
    - Implement `getVoice(id)` for single voice fetch
    - Implement `updateVoice(id, data)` accepting only name/language fields
    - Implement `deleteVoice(id)` for soft delete
    - Implement `getVoiceAudioUrl(id)` for presigned URLs
    - Implement `toggleVoiceSharing(id, isShared)` for community sharing
    - Implement `getAvailableVoices()` returning own + community voices
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_
    - ✅ COMPLETE - All functions implemented and ready

  - [x]* 1.2 Write unit tests for voice-client functions
    - Test upload with various MIME types and file extensions
    - Test list/get/update/delete endpoints
    - Test audio URL retrieval
    - Test voice sharing toggle
    - Test available voices structure
    - **Property 2: Voice Upload Round Trip**
    - **Validates: Requirements 1.2, 12.2, 12.3**

  - [x] 1.3 Test voice-client integration against backend
    - ✅ RESOLVED - Backend now has unified endpoints matching frontend expectations
    - ✅ All endpoint paths corrected
    - ✅ Pagination added to list endpoint
    - ✅ Audio URL endpoint unified
    - _Requirements: 9.1, 12.1_

- [x] 2. Create or update use-voices hook
  - [x] 2.1 Create `/src/lib/hooks/use-voices.ts` or update existing
    - Initialize state for voices, loading, error
    - Fetch voices on mount using new voice-client
    - Attach audio URLs to voices after loading
    - Implement `uploadVoice(file, name, duration?)` method
    - Implement `deleteVoice(id)` method
    - Implement `toggleSharing(id, isShared)` method
    - Implement `refetch()` for retry capability
    - Use `VoiceResponse` type (not deprecated type)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x]* 2.2 Write unit tests for use-voices hook
    - Test voice fetching on mount
    - Test upload/delete/sharing operations
    - Test error handling and retry
    - Test audio URL attachment
    - **Property 1: Audio URL Retrieval Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.6_**

  - [x] 2.3 Verify hook works with components
    - Ensure hook exports correct TypeScript types
    - Ensure error states are properly exposed
    - Test with voice-recording-card component
    - _Requirements: 2.1_

- [x] 3. Update voice-recording-card component
  - [x] 3.1 Update type imports and interfaces
    - Change from `VoiceRecordingResponse` to `VoiceResponse`
    - Update component props interface
    - Update all TypeScript errors from type mismatch
    - _Requirements: 3.1_

  - [x] 3.2 Update field references in JSX
    - Replace `recording.title` with `recording.name`
    - Remove `recording.description` rendering (field doesn't exist)
    - Update metadata display (duration, date, sharing status)
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 3.3 Update audio playback and sharing functionality
    - Verify `toggleVoiceSharing()` calls work with new client
    - Verify audio URL retrieval works with new endpoint
    - Ensure play/pause functionality still works
    - _Requirements: 3.5, 3.6_

  - [ ]* 3.4 Write component tests
    - Test rendering with new schema
    - Test audio playback with new URL endpoint
    - Test sharing toggle
    - Test delete confirmation
    - **Property 3: Schema Field Transformation**
    - **Validates: Requirements 3.2, 4.2, 5.1**

  - [x] 3.5 Verify component displays correctly
    - Check styling and layout unchanged
    - Check all interactive features work
    - Test error states
    - _Requirements: 3.1_

- [x] 4. Checkpoint: Voice card component works with new client
  - Ensure voice-recording-card renders correctly with new schema
  - Verify upload/delete/share buttons function properly
  - Confirm no TypeScript errors

- [ ] 5. Update voice-generation component
  - [x] 5.1 Update voice fetching to use new client
    - Replace `getAvailableVoices()` import to use new client
    - Update to handle new `AvailableVoicesResponse` structure
    - Fetch both `own_voices` and `community_voices` arrays
    - _Requirements: 4.1, 4.3_

  - [x] 5.2 Update voice selection and display logic
    - Display separate sections for own vs community voices
    - Show creator username for community voices (from `VoiceWithCreator`)
    - Include approval status for community voices if available
    - Handle new voice response schema
    - _Requirements: 4.2, 4.4, 4.5_

  - [ ] 5.3 Update type imports and interfaces
    - Import `VoiceResponse`, `VoiceWithCreator`, `AvailableVoicesResponse`
    - Remove any `VoiceRecordingResponse` imports
    - Update component state types
    - _Requirements: 4.2_

  - [ ]* 5.4 Write component tests
    - Test fetching available voices structure
    - Test rendering own voices and community voices separately
    - Test voice selection functionality
    - **Property 5: Available Voices List Structure**
    - **Validates: Requirements 4.1, 6.3**

  - [ ] 5.5 Verify component functionality
    - Test voice list loads correctly
    - Test voice selection during project workflow
    - Test community voice discovery and approval display
    - _Requirements: 4.3, 4.4, 6.3, 6.6_

- [ ] 6. Update any additional voice-related components
  - [ ] 6.1 Search for all imports of `VoiceRecordingResponse`
    - Find components still using deprecated type
    - List all files needing updates
    - _Requirements: 5.3_

  - [ ] 6.2 Update each component
    - Replace `VoiceRecordingResponse` with `VoiceResponse`
    - Update field references (title → name)
    - Update any voice client function calls
    - For each component: ~15 minutes per file
    - _Requirements: 4.1, 4.2_

  - [ ]* 6.3 Write tests for all updated components
    - Test each component with new schema
    - Test all voice-related functionality
    - **Property 3: Schema Field Transformation**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 7. Update and clean type definitions
  - [ ] 7.1 Review `/src/lib/types/api.ts`
    - Confirm `VoiceResponse` is primary schema
    - Confirm `VoiceWithCreator` is defined correctly
    - Confirm `AvailableVoicesResponse` matches backend
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.2 Mark `VoiceRecordingResponse` as deprecated
    - Add JSDoc `@deprecated` comment
    - Add migration note pointing to `VoiceResponse`
    - Keep interface in place temporarily
    - _Requirements: 5.4_

  - [ ] 7.3 Add request/response types if missing
    - Ensure `VoiceCreateRequest` is exported
    - Ensure `VoiceUpdateRequest` is exported
    - Ensure `VoiceShareRequest` is exported
    - _Requirements: 5.5_

- [ ] 8. Implement community voice features
  - [ ] 8.1 Update component to display voice sharing status
    - Show private/shared/community badges on voice cards
    - Use `is_shared` flag for badge styling
    - Use `is_approved` flag for approval indicator
    - Show `admin_approved_at` timestamp if available
    - _Requirements: 6.1, 6.4, 6.5_

  - [ ] 8.2 Support voice language display
    - Display `language` field if present
    - Handle null/undefined values gracefully
    - _Requirements: 7.3_

  - [ ] 8.3 Test community voice features
    - Test badges display correctly
    - Test approval status shows appropriately
    - Verify soft-deleted voices are filtered
    - _Requirements: 6.1, 6.5, 7.1_

- [ ] 9. Implement soft delete and data handling
  - [ ] 9.1 Update list views to exclude deleted voices
    - Filter voices with `is_deleted=true` from display
    - Ensure deleted voices don't appear in user lists
    - _Requirements: 7.1_

  - [ ] 9.2 Handle optional/null fields gracefully
    - Handle `language` being null/undefined
    - Handle `admin_approved_at` being null
    - Test rendering with missing optional fields
    - _Requirements: 7.4_

  - [ ]* 9.3 Write tests for soft delete and optional fields
    - **Property 6: Soft Delete Exclusion**
    - **Validates: Requirements 7.1**

- [ ] 10. Handle BigInt and numeric IDs
  - [ ] 10.1 Verify ID handling
    - Confirm IDs from backend use number type
    - Test with integer IDs in API calls
    - Update any string ID assumptions to numbers
    - _Requirements: 10.1, 10.2_

  - [ ] 10.2 Test with real backend responses
    - Load voices and verify numeric IDs work
    - Test deletion/update with numeric IDs
    - _Requirements: 10.2_

- [ ] 11. Error handling and edge cases
  - [ ] 11.1 Test upload error scenarios
    - Invalid file format → Error message
    - File too large → Size limit message
    - Network error → Retry option
    - _Requirements: 9.1, 9.4_

  - [ ] 11.2 Test list/get error scenarios
    - 401 Unauthorized → Redirect to login
    - 403 Forbidden → Access denied message
    - 404 Not found → Voice deleted message
    - _Requirements: 9.2_

  - [ ] 11.3 Test delete error scenarios
    - Already deleted → "Already deleted" message
    - Permission denied → Error message
    - _Requirements: 9.2_

  - [ ]* 11.4 Write error handling tests
    - Test all error scenarios
    - **Property 8: Error Recovery Idempotence**
    - **Validates: Requirements 9.2, 9.3**

- [ ] 12. Checkpoint: All components using new client
  - Ensure no component uses deprecated voice-recording-client
  - Verify all `VoiceRecordingResponse` imports are updated
  - Confirm all TypeScript compilation is clean
  - Test application functionality end-to-end

- [ ] 13. Remove deprecated code and files
  - [ ] 13.1 Delete voice-recording-client.ts
    - Confirm no imports of this file remain
    - Delete `/src/lib/api/voice-recording-client.ts`
    - _Requirements: 11.1_

  - [ ] 13.2 Remove VoiceRecordingResponse interface from types
    - Delete `VoiceRecordingResponse` from `/src/lib/types/api.ts`
    - Confirm no imports remain
    - _Requirements: 11.2_

  - [ ] 13.3 Remove use-voice-recordings hook (if applicable)
    - Check if old hook is still used
    - Delete if no references remain
    - _Requirements: 11.2_

  - [ ] 13.4 Clean up any remaining deprecated imports
    - Search for any remaining old client imports
    - Remove all deprecated schema references
    - _Requirements: 11.3, 11.4_

- [ ] 14. Final verification and testing
  - [ ] 14.1 Run TypeScript compiler
    - `npm run lint` - No errors or warnings
    - Check for any deprecated type usage
    - _Requirements: 12.1_

  - [ ] 14.2 Run application in development
    - `npm run dev` - No errors on startup
    - Navigate to voice management pages
    - Verify voices load correctly
    - _Requirements: 12.2, 12.3_

  - [ ] 14.3 Test all voice operations
    - Upload a new voice (verify form data and schema)
    - List voices (verify response structure)
    - Select voice during project creation (verify new schema)
    - Delete a voice (verify deletion works)
    - Toggle voice sharing (verify is_shared flag)
    - _Requirements: 12.2, 12.3, 12.4_

  - [ ] 14.4 Verify audio playback
    - Test audio URL retrieval endpoint
    - Test audio playback in voice card
    - Test with both S3 and local storage scenarios
    - _Requirements: 1.7, 3.6, 9.3_

  - [ ] 14.5 Test error scenarios
    - Test 401 response (token expired)
    - Test 404 response (voice not found)
    - Test network error (retry works)
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 14.6 Write integration tests
    - Test full voice lifecycle (upload → select → delete)
    - Test community voice discovery
    - **Property 4: Voice Sharing State Consistency**
    - **Property 7: Community Voice Approval Invariant**
    - **Validates: Requirements 6.1, 6.3, 6.6, 12.2, 12.3, 12.4**

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Ask the user if questions arise

## Notes

- All tasks marked with `*` are optional and can be skipped for faster MVP (though thorough testing is recommended)
- Each component test task references specific property validations from the design document
- The parallel migration strategy allows components to migrate incrementally without breaking the application
- Audio URL handling changes slightly: now fetched from dedicated endpoint instead of being included in response
- Community voice features (is_shared, is_approved) are new but non-blocking for basic functionality
- The old deprecation timeline: voice-recording-client.ts can be deleted once all components migrate, typically within 1-2 days
- All type changes are confined to the `api.ts` file; no changes needed to component prop interfaces beyond voice-related updates

