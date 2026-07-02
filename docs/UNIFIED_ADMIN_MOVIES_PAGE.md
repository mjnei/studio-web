# Unified Admin Movies Page

## Overview

The admin movies page (`/admin/movies`) has been completely redesigned to provide a unified interface that combines:

1. **TMDB Import**: Search and import movies from The Movie Database
2. **Movie Library Management**: View, edit, and delete imported movies

This replaces the previous separate pages (`/admin/movies` for management and `/admin/tmdb` for import) with a single, cohesive interface.

## Features

### 🔄 Two-Mode Interface

The page has two primary modes accessible via tab navigation:

#### 1. Movie Library Mode
- View all imported movies in a paginated grid layout
- Search movies by title (searches both original titles and translations)
- Filter by locale to see movie data in different languages
- Edit limited fields (Douban ID, popularity, ratings)
- Delete movies (with cascade deletion of related data)
- Displays movie metadata including:
  - Poster images
  - Titles (translated + original)
  - Release dates
  - Ratings
  - Overviews
  - TMDB and Douban IDs

#### 2. TMDB Import Mode
- Search movies on TMDB by title
- Select which locales to import (8 supported languages)
- View search results with:
  - Poster images
  - Titles and overviews
  - Release dates
  - Ratings
  - TMDB IDs
- One-click import with progress indicators
- Comprehensive data import including:
  - Movie metadata
  - Translations in multiple locales
  - Genres with translations
  - Cast and crew details
  - Person information with locale-specific names

### 🎨 UI/UX Features

- **Toast Notifications**: Success, error, and info messages with auto-dismiss
- **Loading States**: Spinners and disabled states during async operations
- **Empty States**: Helpful messages and CTAs when no data is available
- **Responsive Grid**: Adapts to different screen sizes (4 cols → 3 → 2 → 1)
- **Pagination**: Navigate through both library and search results
- **Inline Editing**: Edit movie fields directly in the grid without modals
- **Confirmation Dialogs**: Prevent accidental deletions

### 🌐 Internationalization

**Supported Locales for Import:**
- English (en)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)
- Japanese (ja)
- Korean (ko)
- German (de)
- French (fr)
- Spanish (es)

**Library Locale Selection:**
- Toggle between locales to view translated titles and overviews
- Automatically falls back to original title if translation is unavailable

## Technical Implementation

### API Integration

The page uses the unified admin API endpoints from `/admin/movies`:

```typescript
// TMDB Search & Import
GET  /api/v1/admin/movies/tmdb/search?query={query}&page={page}
POST /api/v1/admin/movies/tmdb/import
GET  /api/v1/admin/movies/tmdb/preview/{movie_id}

// Movie Library CRUD
GET    /api/v1/admin/movies?query={query}&locale={locale}&page={page}&page_size={size}
GET    /api/v1/admin/movies/{movie_id}?locale={locale}
PATCH  /api/v1/admin/movies/{movie_id}?locale={locale}
DELETE /api/v1/admin/movies/{movie_id}
```

### State Management

The component maintains separate state for each mode:

**Library State:**
- `movies`: Current page of movies
- `libraryPage`: Current page number
- `librarySearchTerm`: Search query
- `selectedLocale`: Display locale
- `editingId` & `editingData`: Inline editing state

**Import State:**
- `tmdbSearchResults`: TMDB search results
- `tmdbPage`: Current search results page
- `tmdbSearchQuery`: TMDB search query
- `selectedLocales`: Locales to import
- `importingIds`: Set of movies currently being imported

### Key Functions

```typescript
// Library operations
loadMovies()              // Fetch paginated library with filters
handleDeleteMovie(id)     // Delete with confirmation
handleUpdateMovie()       // Save inline edits

// TMDB operations
handleTmdbSearch(page)    // Search TMDB
handleImport(movie)       // Import movie with selected locales
toggleLocale(locale)      // Toggle locale selection
```

## Data Flow

### Import Flow

1. User searches for a movie on TMDB (Import mode)
2. Selects which locales to import (default: all 8)
3. Clicks "Import to Database" on a search result
4. Backend fetches comprehensive data from TMDB API:
   - Movie details (15+ API calls for full data)
   - Translations for each selected locale
   - Genres with translations
   - Cast/crew (top 50 cast + key crew)
   - Person details with names in multiple locales
5. All data stored in `tmdb` PostgreSQL schema (10 tables)
6. Success toast confirms import
7. Movie appears in Library mode

### Edit Flow

1. User switches to Library mode
2. Clicks "Edit" on a movie card
3. Card expands to show editable fields (currently: Douban ID)
4. User modifies field and clicks "Save"
5. Backend updates only the specified fields
6. Admin action logged
7. Success toast confirms update
8. Library refreshes with new data

### Delete Flow

1. User clicks "Delete" (trash icon) on a movie
2. Confirmation dialog warns about cascade deletion
3. If confirmed, backend deletes movie from `tmdb.movies`
4. PostgreSQL cascade deletes all related records:
   - Translations
   - Genre associations
   - Cast records
   - Character names
5. Admin action logged
6. Success toast confirms deletion
7. Library refreshes

## Backend Schema

Movies are stored in the `tmdb` PostgreSQL schema:

```
tmdb.movies
├── tmdb.movie_translations (localized titles/overviews)
├── tmdb.movie_genre (many-to-many with genres)
├── tmdb.genres
│   └── tmdb.genre_translations
├── tmdb.cast (roles in movies)
│   ├── tmdb.persons (actor/director/etc details)
│   │   ├── tmdb.person_locale_names
│   │   └── tmdb.person_aliases
│   └── tmdb.cast_character_names (localized character names)
```

## Usage Examples

### Importing a Movie

1. Navigate to `/admin/movies`
2. Click "Import from TMDB" tab
3. (Optional) Deselect locales you don't need
4. Enter "Inception" in the search box
5. Click "Search" or press Enter
6. Find the desired movie in results
7. Click "Import to Database"
8. Wait 3-10 seconds for complete import
9. See success message

### Managing Movies

1. Navigate to `/admin/movies`
2. Click "Movie Library" tab (default)
3. Use search box to filter by title
4. Change locale dropdown to see translated content
5. Click "Edit" on a movie to modify Douban ID
6. Click "Save" to persist changes
7. Or click "X" to cancel editing

### Deleting a Movie

1. In Movie Library mode
2. Click trash icon on a movie card
3. Confirm the deletion warning
4. Movie and all related data removed

## Differences from Previous Implementation

### Removed Features
- ❌ Manual movie creation form (replaced by TMDB import)
- ❌ Bulk JSON import (use TMDB import instead)
- ❌ Table view (grid view only)
- ❌ Full movie metadata editing (limited to Douban ID now)

### New Features
- ✅ Unified interface (no more separate `/admin/tmdb` page)
- ✅ Locale selection for import
- ✅ Locale toggle for viewing library
- ✅ Better pagination (works on both modes)
- ✅ Inline editing (no modals)
- ✅ Admin action logging
- ✅ Improved error handling
- ✅ Better loading states

### Why These Changes?

**Reason for removing manual creation:** Movies should come from TMDB to ensure data quality and completeness. Manual entry was error-prone and incomplete.

**Reason for removing full editing:** Most movie data (title, overview, release date, etc.) comes from TMDB and should be updated by re-importing, not manual editing. Only integration fields like Douban ID should be editable.

**Reason for unified interface:** Reduces navigation complexity and makes the workflow clearer: Import → Manage.

## Migration Notes

If you were using the old `/admin/movies` or `/admin/tmdb` pages:

1. **Old manual movies**: These won't exist in the new schema. Re-import from TMDB.
2. **Old `/admin/tmdb` bookmarks**: Redirect to `/admin/movies` (Import tab)
3. **Old bulk import scripts**: Use TMDB import endpoint instead

## Configuration

Ensure these environment variables are set:

```bash
# Backend (.env)
TMDB_API_KEY=your_tmdb_api_key_here
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
```

Get a free TMDB API key from: https://www.themoviedb.org/settings/api

## Performance Considerations

- **Library pagination**: Default 24 movies per page (can be adjusted in code)
- **Import duration**: 3-10 seconds per movie depending on cast size
- **TMDB rate limit**: 40 requests per 10 seconds (free tier)
- **Search debouncing**: Not implemented (consider adding for production)

## Future Enhancements

Potential improvements:

1. **Advanced search**: Filter by genre, year, rating
2. **Bulk import**: Queue multiple movies for import
3. **Refresh data**: Re-import to update stale movie data
4. **Image storage**: Download and store images locally
5. **Douban integration**: Auto-fetch Douban IDs
6. **Preview mode**: View full movie details before import
7. **Search debouncing**: Prevent excessive API calls
8. **Keyboard shortcuts**: Navigate with arrow keys

## Troubleshooting

**No movies showing in library:**
- Check if any movies have been imported
- Try clearing search filter
- Check backend logs for database errors

**TMDB search returns no results:**
- Verify TMDB_API_KEY is configured
- Try different search terms
- Check TMDB API status

**Import fails:**
- Check backend logs for detailed error
- Verify TMDB API key is valid
- Ensure database has `tmdb` schema created
- Check network connectivity

**Locale switching not working:**
- Movie may not have translations in that locale
- Falls back to original title automatically

## Related Documentation

- [TMDB Import Guide](../../studio-backend/docs/TMDB_IMPORT_GUIDE.md)
- [TMDB Feature Summary](../../studio-backend/docs/TMDB_FEATURE_SUMMARY.md)
- [Admin API Guide](../../studio-backend/docs/ADMIN_API_GUIDE.md)

---

**Status**: ✅ Fully implemented and ready to use  
**Last Updated**: June 30, 2026
