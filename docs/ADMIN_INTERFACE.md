# Admin Interface Documentation

This document describes the admin interface for managing movies and voices in the Huavoi Studio platform.

## Overview

The admin interface is a dedicated section of the web application that allows users with the `admin` role to:
- Create, update, and delete movies
- Create, update, and delete voices
- Bulk import movies and voices from JSON data
- Toggle voice availability (soft enable/disable)

## Access Control

### Role-Based Access
- Only users with `role: "admin"` can access the admin interface
- The admin section is automatically hidden from the navigation for non-admin users
- Admin routes are protected and redirect non-admin users to the dashboard

### Authentication Flow
1. User logs in and JWT token is stored
2. User profile is fetched, including the `role` field
3. If `role === "admin"`, the Admin menu item appears in the left navigation
4. When accessing `/admin/*` routes, the `AdminLayout` verifies admin access
5. Non-admin users are redirected to `/dashboard`

## File Structure

```
src/
├── app/
│   └── (shell)/
│       └── admin/
│           ├── layout.tsx          # Admin route guard
│           ├── page.tsx             # Admin dashboard
│           ├── movies/
│           │   └── page.tsx         # Movies management
│           └── voices/
│               └── page.tsx         # Voices management
├── lib/
│   ├── api/
│   │   └── admin.ts                 # Admin API client functions
│   ├── hooks/
│   │   └── use-admin.ts             # Admin role hooks
│   └── types/
│       └── api.ts                   # TypeScript types (updated)
└── components/
    └── shell/
        └── drawer-content.tsx       # Navigation (updated)
```

## Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/admin` | Admin dashboard with links to movies and voices | Admin only |
| `/admin/movies` | Movies management interface | Admin only |
| `/admin/voices` | Voices management interface | Admin only |

## Features

### Movies Management (`/admin/movies`)

#### Create Single Movie
- Form to create a single movie
- Required fields:
  - TMDB ID (number)
  - Title (string)
- Optional fields:
  - Original Title
  - Overview
  - Release Date
  - Poster Path
  - Backdrop Path

#### Bulk Import Movies
- Import multiple movies from JSON array
- JSON format:
```json
[
  {
    "id": 550,
    "title": "Fight Club",
    "overview": "A ticking-time-bomb insomniac...",
    "release_date": "1999-10-15",
    "genres": [{"id": 18, "name": "Drama"}]
  }
]
```
- Shows success/failure counts
- Errors are logged to console

### Voices Management (`/admin/voices`)

#### Create Single Voice
- Form to create a single voice
- Required fields:
  - Voice ID (string)
  - Provider (string, e.g., "elevenlabs")
  - Name (string)
- Optional fields:
  - Description
  - Gender (male/female/neutral)
  - Accent
  - Language
  - Category
  - Preview URL

#### Bulk Import Voices
- Import multiple voices from JSON array
- JSON format:
```json
[
  {
    "id": "voice_123",
    "provider": "elevenlabs",
    "name": "Rachel",
    "gender": "female",
    "accent": "american",
    "language": "en",
    "category": "narration"
  }
]
```
- Shows success/failure counts
- Errors are logged to console

## API Integration

### Admin API Client (`src/lib/api/admin.ts`)

All admin API functions use the centralized `request()` function from `api-client.ts`, which:
- Automatically adds JWT token to Authorization header
- Handles 401 (unauthorized) and 403 (forbidden) errors
- Parses JSON responses
- Throws `ApiError` for failed requests

#### Movies Functions
```typescript
adminCreateMovie(data: MovieCreateRequest): Promise<MovieResponse>
adminUpdateMovie(movieId: number, data: MovieUpdateRequest): Promise<MovieResponse>
adminDeleteMovie(movieId: number): Promise<void>
adminBulkImportMovies(data: BulkImportRequest<MovieCreateRequest>): Promise<BulkImportResponse>
```

#### Voices Functions
```typescript
adminCreateVoice(data: VoiceCreateRequest): Promise<VoiceResponse>
adminUpdateVoice(voiceId: string, data: VoiceUpdateRequest): Promise<VoiceResponse>
adminToggleVoiceAvailability(voiceId: string, data: VoiceAvailabilityUpdate): Promise<VoiceResponse>
adminDeleteVoice(voiceId: string): Promise<void>
adminBulkImportVoices(data: BulkImportRequest<VoiceCreateRequest>): Promise<BulkImportResponse>
```

## User Experience

### Toast Notifications
- Success and error toasts appear in the bottom-right corner
- Green for success, red for error
- Auto-dismiss after 5 seconds

### Loading States
- Buttons show loading text while API requests are in progress
- Buttons are disabled during loading to prevent duplicate submissions

### Modals
- Create and bulk import forms are shown in modals
- Modals can be closed with Cancel button
- Dark overlay prevents interaction with background

### Responsive Design
- Works on desktop and mobile
- Form fields stack on smaller screens
- Modals are scrollable on small screens

## Security Considerations

1. **Frontend Guards**: Admin routes are protected at the component level
2. **Backend Validation**: All admin operations are validated on the backend
3. **Role Check**: User role is checked on every request via JWT token
4. **Audit Logging**: All admin operations are logged on the backend

## Error Handling

### 401 Unauthorized
- Token is invalid or expired
- User is redirected to login

### 403 Forbidden
- User is authenticated but not an admin
- User is redirected to dashboard
- Toast shows error message

### 404 Not Found
- Movie or voice doesn't exist
- Toast shows error message

### 422 Validation Error
- Invalid input data
- Toast shows error message

## Future Enhancements

### Phase 1 (Current)
- ✅ Create movies and voices
- ✅ Bulk import
- ✅ Basic error handling
- ✅ Toast notifications

### Phase 2 (Planned)
- [ ] List all movies with pagination
- [ ] List all voices with pagination
- [ ] Search and filter
- [ ] Edit existing movies and voices
- [ ] Delete confirmation dialogs
- [ ] Preview images and audio

### Phase 3 (Planned)
- [ ] Drag-and-drop CSV/JSON file upload
- [ ] Import from external APIs (TMDB, ElevenLabs)
- [ ] Batch operations (bulk delete, bulk update)
- [ ] Analytics and usage statistics

### Phase 4 (Planned)
- [ ] User management (list, promote, deactivate)
- [ ] Audit log viewer
- [ ] Role management
- [ ] Permission-based access control

## Development Guide

### Adding New Admin Features

1. **Create API function** in `src/lib/api/admin.ts`:
```typescript
export async function adminNewFeature(data: NewFeatureRequest): Promise<NewFeatureResponse> {
  return request<NewFeatureResponse>("/admin/new-feature", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

2. **Add TypeScript types** in `src/lib/types/api.ts`:
```typescript
export interface NewFeatureRequest {
  // fields
}

export interface NewFeatureResponse {
  // fields
}
```

3. **Create UI component** in `src/app/(shell)/admin/new-feature/page.tsx`

4. **Add navigation** (optional) in `src/components/shell/drawer-content.tsx`

### Testing Admin Features

1. **Backend Setup**: Ensure backend is running and admin role is configured
2. **Promote User**: Use the backend script to promote a user to admin
3. **Login**: Login with the admin user credentials
4. **Verify Access**: Check that "Admin" appears in navigation
5. **Test Operations**: Create, update, delete, bulk import
6. **Check Logs**: Verify audit logs in backend logs

## Troubleshooting

### "Admin" not showing in navigation
- Verify user has `role: "admin"` in the database
- Check browser console for user object
- Refresh the page to reload user data

### 403 Forbidden errors
- User is not an admin
- Use backend promotion script to grant admin role
- Logout and login again to refresh token

### Bulk import failures
- Check JSON format matches the schema
- Ensure required fields are present
- Check browser console for detailed error messages
- Review backend logs for validation errors

### Toast not appearing
- Check browser console for JavaScript errors
- Verify toast state is being updated
- Check z-index of toast container

## Related Documentation

- Backend Admin API: `/Users/aa/git/github_uncgra/huavoi/studio-backend/docs/ADMIN_API_GUIDE.md`
- Backend Implementation: `/Users/aa/git/github_uncgra/huavoi/studio-backend/docs/ADMIN_ROLE_IMPLEMENTATION.md`
- Backend Design: `/Users/aa/git/github_uncgra/huavoi/studio-backend/docs/ADMIN_ROLE_MANAGEMENT_DESIGN.md`
