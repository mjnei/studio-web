# Admin Interface Setup Guide

Quick guide to set up and use the admin interface in Huavoi Studio.

## Prerequisites

1. **Backend is running** with admin role support
2. **Database migration** has been applied (adds `role` column to `users` table)
3. **User account** exists that can be promoted to admin

## Step 1: Backend Setup

### Apply Database Migration

```bash
cd studio-backend
alembic upgrade head
```

Verify the migration:
```bash
# Check that role column exists
psql -d your_database -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role';"
```

### Promote User to Admin

Option A - Using Python script:
```bash
cd studio-backend
python scripts/promote_user_to_admin.py admin@example.com
```

Option B - Using SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Step 2: Frontend Setup

### Install Dependencies (if needed)

```bash
cd studio-web
npm install
```

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3020`

## Step 3: Test Admin Access

### Login as Admin User

1. Navigate to `http://localhost:3020/login`
2. Login with the email you promoted to admin
3. After login, you should see "Admin" in the left navigation

### Verify Admin Dashboard

1. Click "Admin" in the navigation
2. You should see the Admin Dashboard with:
   - Movies management card
   - Voices management card
   - Admin features list

### Test Movies Management

1. Click "Movies" card or navigate to `/admin/movies`
2. Click "Create Movie" button
3. Fill in the form:
   - TMDB ID: `550`
   - Title: `Fight Club`
   - Release Date: `1999-10-15`
4. Click "Create"
5. You should see a success toast

### Test Voices Management

1. Navigate to `/admin/voices`
2. Click "Create Voice" button
3. Fill in the form:
   - Voice ID: `test_voice_123`
   - Provider: `elevenlabs`
   - Name: `Test Voice`
   - Gender: Select "Female"
4. Click "Create"
5. You should see a success toast

### Test Bulk Import

#### Movies Bulk Import

1. Navigate to `/admin/movies`
2. Click "Bulk Import" button
3. Paste this JSON:
```json
[
  {
    "id": 551,
    "title": "The Matrix",
    "overview": "A computer hacker learns about the true nature of his reality.",
    "release_date": "1999-03-31"
  },
  {
    "id": 552,
    "title": "Inception",
    "overview": "A thief who steals corporate secrets through dream-sharing technology.",
    "release_date": "2010-07-16"
  }
]
```
4. Click "Import"
5. You should see "Bulk import completed: 2 succeeded, 0 failed"

#### Voices Bulk Import

1. Navigate to `/admin/voices`
2. Click "Bulk Import" button
3. Paste this JSON:
```json
[
  {
    "id": "voice_rachel",
    "provider": "elevenlabs",
    "name": "Rachel",
    "gender": "female",
    "accent": "american",
    "language": "en",
    "category": "narration"
  },
  {
    "id": "voice_josh",
    "provider": "elevenlabs",
    "name": "Josh",
    "gender": "male",
    "accent": "american",
    "language": "en",
    "category": "conversational"
  }
]
```
4. Click "Import"
5. You should see "Bulk import completed: 2 succeeded, 0 failed"

## Step 4: Verify Non-Admin Access

### Login as Regular User

1. Logout from admin account
2. Login with a regular user account (non-admin)
3. Verify that "Admin" does NOT appear in the navigation
4. Try to access `/admin` directly
5. You should be redirected to `/dashboard`

## Troubleshooting

### Admin Not Showing in Navigation

**Problem**: Logged in as admin but "Admin" menu item doesn't appear

**Solutions**:
1. Check user role in database:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'admin@example.com';
   ```
2. Verify role is exactly `'admin'` (lowercase)
3. Clear browser cache and cookies
4. Logout and login again
5. Check browser console for errors

### 403 Forbidden Error

**Problem**: Getting 403 errors when accessing admin endpoints

**Solutions**:
1. Verify backend admin role implementation is deployed
2. Check JWT token includes user role
3. Verify user is promoted to admin in database
4. Check backend logs for authorization errors
5. Logout and login to get a fresh token

### Bulk Import Fails

**Problem**: Bulk import shows failures

**Solutions**:
1. Validate JSON format (use JSONLint.com)
2. Check required fields are present
3. Review browser console for error details
4. Check backend logs for validation errors
5. Try importing one item at a time to isolate the issue

### Backend Not Running

**Problem**: API calls fail with connection errors

**Solutions**:
1. Start backend server: `cd studio-backend && uvicorn app.main:app --reload --port 8020`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches backend URL
3. Check backend is accessible: `curl http://localhost:8020/api/v1/health`

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8020/api/v1
```

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key-here
```

## API Endpoints Reference

All endpoints require `Authorization: Bearer <token>` header with admin user token.

### Movies
- `POST /api/v1/admin/movies` - Create movie
- `PUT /api/v1/admin/movies/{movie_id}` - Update movie
- `DELETE /api/v1/admin/movies/{movie_id}` - Delete movie
- `POST /api/v1/admin/movies/bulk` - Bulk import movies

### Voices
- `POST /api/v1/admin/voices` - Create voice
- `PUT /api/v1/admin/voices/{voice_id}` - Update voice
- `PATCH /api/v1/admin/voices/{voice_id}/availability` - Toggle availability
- `DELETE /api/v1/admin/voices/{voice_id}` - Delete voice
- `POST /api/v1/admin/voices/bulk` - Bulk import voices

## Next Steps

1. **Customize Styling**: Update colors, spacing, and layouts to match your design system
2. **Add Pagination**: Implement list views with pagination for movies and voices
3. **Add Search**: Add search and filter functionality
4. **Add Validation**: Client-side form validation before API calls
5. **Add Confirmations**: Delete confirmation dialogs
6. **Add Images**: Show poster/backdrop previews for movies
7. **Add Audio**: Show audio preview players for voices

## Related Documentation

- [Admin Interface Documentation](./ADMIN_INTERFACE.md)
- [Backend Admin API Guide](../../studio-backend/docs/ADMIN_API_GUIDE.md)
- [Backend Implementation Summary](../../studio-backend/docs/ADMIN_ROLE_IMPLEMENTATION.md)

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review browser console for errors
3. Check backend logs for API errors
4. Verify database state with SQL queries
5. Review the implementation documentation
