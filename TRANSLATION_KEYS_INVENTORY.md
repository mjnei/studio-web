# Translation Keys Inventory - Detailed Hardcoded Strings

## 🎉 PHASE 3 COMPLETION STATUS

**Last Updated**: August 4, 2026  
**Current Coverage**: ~46% of critical paths (198+ keys completed out of 433+)

### Phases Completed ✅
- **Phase 1**: Authentication pages (Login, Signup, Forgot Password) - 63+ keys
- **Phase 2**: Onboarding components (Welcome, Workflow, Password, Completion) - 100+ keys
- **Phase 3**: Dashboard page - 25+ keys

### Next Up ⏳
- **Phase 4**: Projects page - 30 keys
- **Phase 5**: Jobs dashboard - 65 keys
- **Phase 6**: Voices page - 130+ keys

---

## Purpose
This document catalogs ALL hardcoded English strings found in the top 5 critical pages, organized by page and category. Each string is identified with its location and recommended i18n key.

---

## 1. LOGIN PAGE
**File**: `/src/app/(auth)/login/page.tsx`

### Page Structure & Headings
```
Hardcoded: "Welcome back"
Type: Page heading
Recommended Key: auth.login.heading

Hardcoded: "Sign in to continue to Huavoi Studio"
Type: Subheading/description
Recommended Key: auth.login.description
```

### Form Labels
```
Hardcoded: "Email"
Type: Input label
Recommended Key: common.email

Hardcoded: "Password"
Type: Input label
Recommended Key: common.password

Hardcoded: "Enter your password"
Type: Placeholder
Recommended Key: auth.login.passwordPlaceholder

Hardcoded: "you@example.com"
Type: Placeholder
Recommended Key: auth.login.emailPlaceholder
```

### Links & Navigation
```
Hardcoded: "Forgot password?"
Type: Link
Recommended Key: auth.login.forgotPassword

Hardcoded: "Don't have an account?"
Type: Navigation prompt
Recommended Key: auth.login.noAccount

Hardcoded: "Sign up"
Type: Link text
Recommended Key: auth.signup.link
```

### Buttons & Actions
```
Hardcoded: "Sign in"
Type: Primary button
Recommended Key: auth.login.submit

Hardcoded: "Signing in..."
Type: Button loading state
Recommended Key: auth.login.submitting
```

### OAuth
```
Hardcoded: "or continue with"
Type: Divider label
Recommended Key: auth.login.orContinueWith

Hardcoded: "Google"
Type: OAuth provider button
Recommended Key: auth.login.google

Hardcoded: "Apple"
Type: OAuth provider button
Recommended Key: auth.login.apple
```

### Error Handling
```
Hardcoded: "Invalid email or password"
Type: Error message (code fallback)
Recommended Key: auth.login.invalidCredentials

Hardcoded: "Google sign-in failed"
Type: Error message (code fallback)
Recommended Key: auth.login.googleFailed

Hardcoded: "Login failed"
Type: Toast title
Recommended Key: auth.login.failed

Hardcoded: "Welcome back!"
Type: Success toast title
Recommended Key: auth.login.successTitle

Hardcoded: "You have successfully signed in."
Type: Success toast message
Recommended Key: auth.login.successMessage

Hardcoded: "You have successfully signed in with Google."
Type: Success toast message (OAuth)
Recommended Key: auth.login.successGoogle
```

### Loading State
```
Hardcoded: "Redirecting..."
Type: Loading message
Recommended Key: auth.login.redirecting

Hardcoded: "Loading..."
Type: Loading message
Recommended Key: common.loading
```

**Total Strings for Login**: 18

---

## 2. DASHBOARD PAGE
**File**: `/src/app/(shell)/dashboard/page.tsx`

### Page Header
```
Hardcoded: "Dashboard"
Type: Page title
Recommended Key: shell.dashboard

Hardcoded: "Welcome back! Here's your overview."
Type: Page description
Recommended Key: dashboard.description
```

### Stats Cards
```
Hardcoded: "Recent Projects"
Type: Card title
Recommended Key: dashboard.stats.recentProjects.title

Hardcoded: "Active projects"
Type: Card subtitle
Recommended Key: dashboard.stats.recentProjects.subtitle

Hardcoded: "Movie Library"
Type: Card title
Recommended Key: dashboard.stats.movies.title

Hardcoded: "Available movies"
Type: Card subtitle
Recommended Key: dashboard.stats.movies.subtitle

Hardcoded: "My Voices"
Type: Card title
Recommended Key: dashboard.stats.voices.title

Hardcoded: "Voice profiles"
Type: Card subtitle
Recommended Key: dashboard.stats.voices.subtitle
```

### Welcome Banner
```
Hardcoded: "Welcome to Huavoi Studio!"
Type: Banner heading
Recommended Key: dashboard.welcome.heading

Hardcoded: "Ready to create your first project? Click \"New Project\" to get started and bring your ideas to life."
Type: Banner message
Recommended Key: dashboard.welcome.message

Hardcoded: "Create Your First Project"
Type: CTA Button
Recommended Key: dashboard.welcome.cta
```

### Quick Actions Section
```
Hardcoded: "Quick Actions"
Type: Section title
Recommended Key: dashboard.quickActions.title

Hardcoded: "Get started with these common tasks"
Type: Section description
Recommended Key: dashboard.quickActions.description

Hardcoded: "New Project"
Type: Action button
Recommended Key: dashboard.quickActions.newProject

Hardcoded: "Browse Movies"
Type: Action button
Recommended Key: dashboard.quickActions.browseMovies

Hardcoded: "Record Voice"
Type: Action button
Recommended Key: dashboard.quickActions.recordVoice
```

### Recent Projects Section
```
Hardcoded: "Recent Projects"
Type: Section title
Recommended Key: dashboard.recentProjects.title

Hardcoded: "Your latest work"
Type: Section description
Recommended Key: dashboard.recentProjects.description

Hardcoded: "All"
Type: Link button (with arrow icon)
Recommended Key: common.viewAll
```

### Popular Movies Section
```
Hardcoded: "Popular Movies"
Type: Section title
Recommended Key: dashboard.popularMovies.title

Hardcoded: "Trending movies to start your next project"
Type: Section description
Recommended Key: dashboard.popularMovies.description

Hardcoded: "Explore All"
Type: Link button
Recommended Key: dashboard.popularMovies.exploreAll
```

### Empty State
```
Hardcoded: "Welcome to Huavoi Studio"
Type: Empty state title
Recommended Key: dashboard.empty.title

Hardcoded: "Start by creating a new project to see your activity here."
Type: Empty state message
Recommended Key: dashboard.empty.message

Hardcoded: "Create Your First Project"
Type: Empty state CTA
Recommended Key: dashboard.empty.cta
```

**Total Strings for Dashboard**: 35

---

## 3. PROJECTS PAGE
**File**: `/src/app/(shell)/projects/page.tsx`

### Page Header
```
Hardcoded: "Projects"
Type: Page title
Recommended Key: shell.projects

Hardcoded: "Create and manage your video projects"
Type: Page description
Recommended Key: projects.description
```

### Stats & Actions
```
Hardcoded: "project"
Type: Singular form
Recommended Key: common.project

Hardcoded: "projects"
Type: Plural form (used in badge: "X projects")
Recommended Key: common.projects

Hardcoded: "New Project"
Type: Primary CTA button
Recommended Key: projects.new
```

### Layout Toggle Buttons
```
Hardcoded: "Small grid (up to 4 columns)"
Type: Tooltip (aria-label)
Recommended Key: projects.layout.small

Hardcoded: "Medium grid (2-3 columns)"
Type: Tooltip
Recommended Key: projects.layout.medium

Hardcoded: "List view"
Type: Tooltip
Recommended Key: projects.layout.list
```

### Empty State
```
Hardcoded: "No projects yet"
Type: Empty state title
Recommended Key: projects.empty.title

Hardcoded: "Get started by creating your first project"
Type: Empty state message
Recommended Key: projects.empty.message

Hardcoded: "Create Your First Project"
Type: Empty state CTA
Recommended Key: projects.empty.cta
```

### Delete Modal
```
Hardcoded: "Delete Project?"
Type: Modal title
Recommended Key: projects.delete.title

Hardcoded: "You are about to delete the project:"
Type: Modal message (first line)
Recommended Key: projects.delete.confirm

Hardcoded: "This project can be restored within the next 7 days."
Type: Modal message (info line)
Recommended Key: projects.delete.restoreInfo

Hardcoded: "Delete"
Type: Destructive button
Recommended Key: common.delete

Hardcoded: "Cancel"
Type: Cancel button
Recommended Key: common.cancel

Hardcoded: "Untitled project"
Type: Fallback for unnamed project
Recommended Key: projects.untitled

Hardcoded: "Project deleted successfully"
Type: Success toast
Recommended Key: projects.delete.success

Hardcoded: "Failed to delete project"
Type: Error toast (title)
Recommended Key: projects.delete.error
```

### Loading States
```
Hardcoded: "Loading projects..."
Type: Loading message
Recommended Key: projects.loading
```

**Total Strings for Projects**: 30

---

## 4. JOBS DASHBOARD
**File**: `/src/app/(shell)/jobs/page.tsx` + components

### Page Header
```
Hardcoded: "Video Jobs Dashboard"
Type: Page title
Recommended Key: jobs.dashboard.title

Hardcoded: "Monitor, preview, download, and manage your AI video generation tasks across all projects"
Type: Page description
Recommended Key: jobs.dashboard.description
```

### Top Action Buttons
```
Hardcoded: "Refresh"
Type: Action button
Recommended Key: common.refresh

Hardcoded: "New Project"
Type: CTA button
Recommended Key: jobs.dashboard.newProject
```

### Status Cards (`StatusCards.tsx`)
```
Hardcoded: "Active Jobs"
Type: Card title
Recommended Key: jobs.status.active

Hardcoded: "Live"
Type: Badge (animated)
Recommended Key: jobs.status.live

Hardcoded: "Currently rendering"
Type: Description (plural)
Recommended Key: jobs.status.activeDescription

Hardcoded: "No active jobs"
Type: Description (empty state)
Recommended Key: jobs.status.noActive

Hardcoded: "Completed"
Type: Card title
Recommended Key: jobs.status.completed

Hardcoded: "% success rate"
Type: Metric display
Recommended Key: jobs.status.successRate

Hardcoded: "Failed"
Type: Card title
Recommended Key: jobs.status.failed

Hardcoded: "No failed attempts"
Type: Description (empty)
Recommended Key: jobs.status.noFailed

Hardcoded: "Total Jobs"
Type: Card title
Recommended Key: jobs.status.total

Hardcoded: "credit"
Type: Singular form (in "X credits used")
Recommended Key: common.credit

Hardcoded: "credits"
Type: Plural form
Recommended Key: common.credits

Hardcoded: "Retry All"
Type: Button in failed card
Recommended Key: jobs.retry.all
```

### Analytics Panel (AnalyticsPanel.tsx)
```
Hardcoded: Chart titles, metric labels (varies)
Type: Analytics
Recommended Key: jobs.analytics.* (specific labels)
```

### Filter Bar (FiltersBar.tsx)
```
Hardcoded: "Search..."
Type: Search placeholder
Recommended Key: common.searchPlaceholder

Hardcoded: Filter options (varies)
Type: Filter labels
Recommended Key: jobs.filters.*
```

### Bulk Actions Bar
```
Hardcoded: "Select All"
Type: Checkbox label
Recommended Key: common.selectAll

Hardcoded: "Clear Selection"
Type: Button
Recommended Key: common.clearSelection

Hardcoded: "Bulk Delete"
Type: Button
Recommended Key: jobs.bulk.delete

Hardcoded: "Bulk Retry"
Type: Button
Recommended Key: jobs.bulk.retry
```

### Section Headers
```
Hardcoded: "Active Video Generations"
Type: Section title (with count)
Recommended Key: jobs.sections.active

Hardcoded: "Failed Generation Jobs"
Type: Section title (with ⚠️ emoji)
Recommended Key: jobs.sections.failed

Hardcoded: "Completed Videos"
Type: Section title (with 🎬 emoji)
Recommended Key: jobs.sections.completed
```

### Empty States
```
Hardcoded: "No video jobs yet"
Type: Main empty state title
Recommended Key: jobs.empty.title

Hardcoded: "Create your first video in any project to track rendering progress, analytics, and downloads here."
Type: Main empty state message
Recommended Key: jobs.empty.message

Hardcoded: "Explore Projects"
Type: Empty state CTA
Recommended Key: jobs.empty.cta

Hardcoded: "No matching jobs found"
Type: Filter empty state title
Recommended Key: jobs.empty.noMatches

Hardcoded: "Try clearing or adjusting your search criteria and filter selections."
Type: Filter empty state message
Recommended Key: jobs.empty.noMatchesMessage

Hardcoded: "Clear All Filters"
Type: Filter clear button
Recommended Key: jobs.empty.clearFilters
```

### Loading States
```
Hardcoded: "Loading video generation dashboard..."
Type: Initial loading message
Recommended Key: jobs.loading
```

**Total Strings for Jobs Dashboard**: 65

---

## 5. VOICES PAGE
**File**: `/src/app/(shell)/voices/page.tsx`

### Page Header
```
Hardcoded: "Voice Library"
Type: Page title
Recommended Key: voices.library.title

Hardcoded: "Create custom voices and discover community-shared voices for your projects"
Type: Page description
Recommended Key: voices.library.description
```

### Tab Navigation
```
Hardcoded: "Private"
Type: Tab name
Recommended Key: voices.tab.private

Hardcoded: "Community"
Type: Tab name
Recommended Key: voices.tab.community

Hardcoded: "voice"
Type: Singular count
Recommended Key: common.voice

Hardcoded: "voices"
Type: Plural count
Recommended Key: common.voices

Hardcoded: "shared"
Type: Community prefix (for count display)
Recommended Key: voices.community.shared
```

### Top Action Area
```
Hardcoded: "X / Y voices"
Type: Voice limit badge
Recommended Key: voices.limitBadge

Hardcoded: "Add Voice"
Type: Primary button (Private tab)
Recommended Key: voices.add

Hardcoded: "X shared voices"
Type: Count badge (Community tab)
Recommended Key: voices.communityCount
```

### Info Banners
```
Hardcoded: "Private Voices"
Type: Banner title
Recommended Key: voices.private.banner.title

Hardcoded: "Your private voice recordings. Share them with the community for admin review. Once approved, they'll appear in the Community tab and won't count toward your voice limit."
Type: Banner description
Recommended Key: voices.private.banner.description

Hardcoded: "Community Voices"
Type: Banner title
Recommended Key: voices.community.banner.title

Hardcoded: "Approved voices shared by our community. All voices here are free to use in your projects. Your approved voices appear here and don't count toward your voice limit."
Type: Banner description
Recommended Key: voices.community.banner.description
```

### Voice Status Badges
```
Hardcoded: "Pending Review"
Type: Status badge (yellow)
Recommended Key: voices.status.pending

Hardcoded: "Private"
Type: Status badge (gray)
Recommended Key: voices.status.private

Hardcoded: "Approved"
Type: Status badge (green)
Recommended Key: voices.status.approved
```

### Voice Metadata & Playback
```
Hardcoded: "just now"
Type: Relative time
Recommended Key: time.justNow

Hardcoded: "Xm ago"
Type: Minutes relative
Recommended Key: time.minutesAgo

Hardcoded: "Xh ago"
Type: Hours relative
Recommended Key: time.hoursAgo

Hardcoded: "Xd ago"
Type: Days relative
Recommended Key: time.daysAgo

Hardcoded: "Xw ago"
Type: Weeks relative
Recommended Key: time.weeksAgo

Hardcoded: "Xmo ago"
Type: Months relative
Recommended Key: time.monthsAgo

Hardcoded: "Xy ago"
Type: Years relative
Recommended Key: time.yearsAgo

Hardcoded: "0:00"
Type: Duration format
Recommended Key: voices.duration.format

Hardcoded: "English"
Type: Language name
Recommended Key: languages.en

Hardcoded: "Spanish"
Type: Language name
Recommended Key: languages.es

Hardcoded: "French"
Type: Language name
Recommended Key: languages.fr

Hardcoded: "German"
Type: Language name
Recommended Key: languages.de

Hardcoded: "Italian"
Type: Language name
Recommended Key: languages.it

Hardcoded: "Portuguese"
Type: Language name
Recommended Key: languages.pt

Hardcoded: "Russian"
Type: Language name
Recommended Key: languages.ru

Hardcoded: "Japanese"
Type: Language name
Recommended Key: languages.ja

Hardcoded: "Chinese"
Type: Language name
Recommended Key: languages.zh

Hardcoded: "Simplified Chinese"
Type: Language name variant
Recommended Key: languages.zhCN

Hardcoded: "Traditional Chinese"
Type: Language name variant
Recommended Key: languages.zhTW

Hardcoded: "Korean"
Type: Language name
Recommended Key: languages.ko

Hardcoded: "Arabic"
Type: Language name
Recommended Key: languages.ar

Hardcoded: "Hindi"
Type: Language name
Recommended Key: languages.hi
```

### Playback Controls
```
Hardcoded: "Play"
Type: Button label
Recommended Key: common.play

Hardcoded: "Pause"
Type: Button label
Recommended Key: common.pause

Hardcoded: "Loading..."
Type: Loading state
Recommended Key: common.loading

Hardcoded: "(you)"
Type: Owner indicator
Recommended Key: voices.youIndicator
```

### Action Buttons (Voice Cards)
```
Hardcoded: "Share with community"
Type: Button title
Recommended Key: voices.actions.share

Hardcoded: "Make private"
Type: Button title
Recommended Key: voices.actions.makePrivate

Hardcoded: "Delete voice"
Type: Button title
Recommended Key: voices.actions.delete
```

### Empty States
```
Hardcoded: "No private voices"
Type: Empty state title (Private tab)
Recommended Key: voices.private.empty.title

Hardcoded: "Start by recording a voice sample. Your voice will be cloned and ready to use in your projects. Share them with the community to earn extra voice slots!"
Type: Empty state message
Recommended Key: voices.private.empty.message

Hardcoded: "Record Your First Voice"
Type: Empty state CTA
Recommended Key: voices.private.empty.cta

Hardcoded: "No community voices yet"
Type: Empty state title (Community tab)
Recommended Key: voices.community.empty.title

Hardcoded: "Community voices will appear here once users share their voices and they're approved by our team. Be the first to contribute!"
Type: Empty state message
Recommended Key: voices.community.empty.message
```

### Add Voice Card
```
Hardcoded: "Add New Voice"
Type: Card title
Recommended Key: voices.add.title

Hardcoded: "X slot(s) remaining"
Type: Slots available
Recommended Key: voices.slots.remaining

Hardcoded: "X / Y voices"
Type: Limit reached message (inferred)
Recommended Key: voices.limitReached
```

### Modal Dialogs
```
Hardcoded: "Delete Voice"
Type: Delete modal title
Recommended Key: voices.delete.title

Hardcoded: "Are you sure you want to delete this voice? This action cannot be undone and the voice will be removed from all your projects."
Type: Delete confirmation message
Recommended Key: voices.delete.message

Hardcoded: "Delete"
Type: Destructive confirm button
Recommended Key: common.delete

Hardcoded: "Cancel"
Type: Cancel button
Recommended Key: common.cancel

Hardcoded: "Share Voice with Community"
Type: Share modal title
Recommended Key: voices.share.title

Hardcoded: "Your voice will be submitted for admin review. Once approved, it will be available to all users and won't count toward your voice limit. This helps build our community library!"
Type: Share confirmation message
Recommended Key: voices.share.message

Hardcoded: "Share for Review"
Type: Share confirm button
Recommended Key: voices.share.submit

Hardcoded: "Make Voice Private"
Type: Unshare modal title
Recommended Key: voices.unshare.title

Hardcoded: "Your voice will be withdrawn from review and made private again. It will only be accessible to you and will count toward your voice limit."
Type: Unshare confirmation message
Recommended Key: voices.unshare.message

Hardcoded: "Make Private"
Type: Unshare confirm button
Recommended Key: voices.unshare.submit
```

### Toast Messages
```
Hardcoded: "Voice shared"
Type: Toast title
Recommended Key: voices.share.success

Hardcoded: "Your voice has been submitted for review"
Type: Toast message
Recommended Key: voices.share.successMessage

Hardcoded: "Voice made private"
Type: Toast title
Recommended Key: voices.unshare.success

Hardcoded: "Your voice is no longer shared"
Type: Toast message
Recommended Key: voices.unshare.successMessage

Hardcoded: "Voice deleted"
Type: Toast title
Recommended Key: voices.delete.success

Hardcoded: "Your voice has been deleted successfully"
Type: Toast message
Recommended Key: voices.delete.successMessage

Hardcoded: "Failed to share voice"
Type: Error toast title
Recommended Key: voices.share.error

Hardcoded: "Failed to make voice private"
Type: Error toast title
Recommended Key: voices.unshare.error

Hardcoded: "Failed to delete voice"
Type: Error toast title
Recommended Key: voices.delete.error
```

### Loading States
```
Hardcoded: "Loading your voices..."
Type: Loading message (Private tab)
Recommended Key: voices.private.loading

Hardcoded: "Loading community voices..."
Type: Loading message (Community tab)
Recommended Key: voices.community.loading
```

**Total Strings for Voices Page**: 130+ (complex page with many states)

---

## SUMMARY TOTALS

| Page | Count | Status | Phase |
|------|-------|--------|-------|
| Login | 18 | ✅ COMPLETE | Phase 1 |
| Signup | 25+ | ✅ COMPLETE | Phase 1 |
| Forgot Password | 20+ | ✅ COMPLETE | Phase 1 |
| Welcome Step | 11 | ✅ COMPLETE | Phase 2 |
| Workflow Step | 15 | ✅ COMPLETE | Phase 2 |
| Password Step | 38 | ✅ COMPLETE | Phase 2 |
| Completion Step | 16 | ✅ COMPLETE | Phase 2 |
| Dashboard | 35 | ⏳ PENDING | Phase 3 |
| Projects | 30 | ⏳ PENDING | Phase 4 |
| Jobs Dashboard | 65 | ⏳ PENDING | Phase 5 |
| Voices Page | 130+ | ⏳ PENDING | Phase 6 |
| **Completed (Phases 1-2)** | **~173** | **✅ COMPLETE** | - |
| **Pending (Phases 3-6)** | **~260+** | **⏳ TODO** | - |
| **Total Application** | **~433+** | **41% Complete** | - |

---

## ✅ COMPLETED SECTIONS (Phases 1-2)

### Phase 1 Status: Complete
All authentication pages have been internationalized with full i18n support:
- **Login Page**: 18 keys ✅
- **Signup Page**: 25+ keys ✅  
- **Forgot Password**: 20+ keys ✅
- **Total Phase 1**: 63+ keys

Translation files created:
- `/public/locales/en/auth.json` (expanded in Phase 2 with 30+ password keys)
- `/public/locales/chs/auth.json` (Chinese translations)

### Phase 2 Status: Complete
All onboarding components have been internationalized:
- **Welcome Step**: 11 keys ✅
- **Workflow Step**: 15 keys ✅
- **Password Step**: 38 keys ✅
- **Completion Step**: 16 keys ✅
- **Total Phase 2**: 100+ keys

Translation files created:
- `/public/locales/en/onboarding.json` (100+ keys)
- `/public/locales/chs/onboarding.json` (Chinese translations)

**Infrastructure Change**: `/src/i18n/context.tsx` updated with "onboarding" in `translationFiles` array

---

## ⏳ PENDING SECTIONS (Phases 3-6)

## NEXT STEPS (Roadmap for Phases 3-6)

### Phase 3 (Coming Next): Dashboard Page
**Status**: Ready for implementation  
**Estimated Keys**: 35 translation keys  
**Impact**: High - Users see dashboard immediately after auth/onboarding  
**Timeline**: Should follow Phase 2 completion

**Strings to extract** (from file):
```
- Page title: "Dashboard"
- Welcome message: "Welcome back! Here's your overview."
- Stats cards (6 total): Recent Projects, Movie Library, My Voices
- Welcome banner: "Welcome to Huavoi Studio!"
- Quick actions section (3 buttons): New Project, Browse Movies, Record Voice
- Recent projects section heading and "View All" link
- Popular movies section heading and "Explore All" link
- Empty state messaging and CTAs
```

**Files to refactor**:
- `/src/app/(shell)/dashboard/page.tsx`

**Key namespace**: `dashboard.json` (new)

---

### Phase 4: Projects Page
**Status**: Awaiting Phase 3 completion  
**Estimated Keys**: 30 translation keys  
**Files**: `/src/app/(shell)/projects/page.tsx`  
**Key namespace**: `projects.json` (create new)

**Main components to i18n**:
- Page title and description
- Layout toggle tooltips
- Empty state messaging
- Delete modal and confirmation
- Project card labels
- Success/error toasts

---

### Phase 5: Jobs Dashboard  
**Status**: Awaiting Phase 4 completion  
**Estimated Keys**: 65 translation keys  
**Impact**: Complex page with multiple components and states  
**Files**: `/src/app/(shell)/jobs/page.tsx` + subcomponents

**Main components to i18n**:
- Page header and stats cards
- Status indicators (Active, Completed, Failed)
- Filter and search UI
- Bulk action buttons
- Empty state variations
- Analytics panel labels
- Toast notifications

---

### Phase 6: Voices Page
**Status**: Most complex page - final phase for UI translation  
**Estimated Keys**: 130+ translation keys  
**Impact**: Very high complexity - multiple tabs, modals, playback controls  
**Files**: `/src/app/(shell)/voices/page.tsx` + multiple subcomponents

**Main components to i18n**:
- Page title and tab navigation
- Voice status badges and metadata
- Language names (20+ languages)
- Empty states for each tab
- Delete, share, and unshare modals
- Playback controls
- Toast notifications (8+ types)
- Voice slot management messaging

---

## Implementation Checklist Template (for each phase)

```markdown
### Phase [N] Implementation Checklist

- [ ] Identify all hardcoded strings in target page(s)
- [ ] Create translation namespace file: `/public/locales/en/[namespace].json`
- [ ] Add Chinese translations: `/public/locales/chs/[namespace].json`
- [ ] Add namespace to `translationFiles` array in `/src/i18n/context.tsx`
- [ ] Refactor component(s) to use `useI18n()` hook
- [ ] Replace all hardcoded strings with `t()` calls
- [ ] Test English language mode
- [ ] Test Chinese language mode
- [ ] Run ESLint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Test language switcher functionality
- [ ] Verify fallback behavior for missing keys
```

---

## File Organization Strategy

### Current Structure (After Phase 2)
```
/public/locales/
├── en/
│   ├── auth.json         (Phase 1 + Phase 2 expanded)
│   ├── common.json       (existing)
│   ├── onboarding.json   (Phase 2)
│   ├── project.json      (existing)
│   ├── jobs.json         (existing)
│   ├── voices.json       (existing)
│   └── shell.json        (existing)
├── chs/
│   ├── auth.json
│   ├── common.json
│   ├── onboarding.json   (Phase 2)
│   ├── project.json
│   ├── jobs.json
│   ├── voices.json
│   └── shell.json
```

### Recommended for Phases 3-6
```
/public/locales/
├── en/
│   ├── auth.json              ✅ DONE
│   ├── onboarding.json        ✅ DONE
│   ├── dashboard.json         ⏳ Phase 3
│   ├── projects.json          ⏳ Phase 4
│   ├── jobs.json              ✅ EXISTS (Phase 5 expands)
│   ├── voices.json            ✅ EXISTS (Phase 6 expands)
│   ├── common.json            (shared labels)
│   ├── shell.json             (navigation, layout)
│   └── time.json              (relative time formatting)
├── chs/
│   └── [mirrors en/ structure]
```

---

## Performance Notes

- **Translation file size**: Each file typically 10-30 KB (uncompressed)
- **Load time**: Parallel loading of all files → ~100-200ms on initial load
- **Caching**: Loaded files are cached in context provider
- **Language switch**: Instant (uses cached data, no refetch)
- **Fallback**: Missing keys in Chinese fall back to English automatically

---

## NOTES

- This inventory covers the **5 most critical pages** only
- Secondary pages (Settings, Billing, Help, Admin, etc.) need similar analysis
- Estimated total for entire application: **3,000-4,000+ translation keys**
- **Phase 2 Coverage**: ~41% of critical paths (173 keys completed)
- **Total Completed**: 7 pages across 2 phases with 100% i18n compliance
