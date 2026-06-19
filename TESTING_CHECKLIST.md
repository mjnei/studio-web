# 4-Step Workflow - Testing Checklist

## Quick Start Testing

```bash
npm run dev
# Open http://localhost:3000
```

## Core Functionality Tests

### ✓ New Project Creation
- [ ] Click "New Project" from projects page
- [ ] Redirected to `/project/draft-[id]/source`
- [ ] Left rail visible and functional
- [ ] Top nav shows "Untitled Project [Draft]"
- [ ] Step indicators show: Source (active), Script/Voice/Compose (disabled)

### ✓ Step 1: Movie Selection
- [ ] Movie grid displays (2-4 columns based on screen size)
- [ ] Can search movies by title
- [ ] Click movie → becomes selected (highlighted)
- [ ] "Continue to Script" button appears
- [ ] Click movie again → deselects
- [ ] Refresh page → selection persists ✓
- [ ] Click "Continue to Script" → goes to script page

### ✓ Step 2: Script Generation
- [ ] Back button works → returns to Source
- [ ] Movie info card displays at top
- [ ] Can't access this step without movie selected
- [ ] "Generate Script with AI" button visible
- [ ] Click generate → shows loading spinner
- [ ] After 2s → script appears
- [ ] Word count and duration shown
- [ ] Refresh page → script still there ✓

### ✓ Step 2: Script Editing
- [ ] Click "Edit" → textarea becomes editable
- [ ] Make changes to script
- [ ] Click "Save as New Version" → creates version 2
- [ ] Versions section shows 2 versions
- [ ] Active version has checkmark
- [ ] Can switch between versions
- [ ] Each version shows metadata (words, duration, date)
- [ ] Can delete version (but not the last one)
- [ ] Refresh page → all versions still there ✓

### ✓ Step 2: Script Regeneration
- [ ] Click "Regenerate" → shows loading
- [ ] After 2s → new version created
- [ ] Old versions preserved
- [ ] New version becomes active
- [ ] Versions section updates
- [ ] Can have 3+ versions
- [ ] Refresh page → all versions persist ✓

### ✓ Step 3: Voice Generation
- [ ] Back button works → returns to Script
- [ ] Can't access this step without script
- [ ] Script summary card displays at top
- [ ] 4 voice options shown
- [ ] Can select a voice (radio button style)
- [ ] "Generate Voice" button appears
- [ ] Click generate → shows progress (0-100%)
- [ ] Progress bar animates
- [ ] After 4s → audio player appears
- [ ] Refresh during generation → continues ✓
- [ ] Refresh after complete → audio still there ✓

### ✓ Step 3: Voice Regeneration
- [ ] Click "Regenerate" button
- [ ] Select different voice
- [ ] Click generate again
- [ ] Shows progress again
- [ ] New audio replaces old (updates state)
- [ ] Refresh page → new audio persists ✓

### ✓ Step 4: Video Composition
- [ ] Back button works → returns to Voice
- [ ] Can't access this step without audio
- [ ] Project summary displays (movie, voice, script stats)
- [ ] "Start Video Generation" button visible
- [ ] Click start → shows 4-step progress
- [ ] Step 1: Analyzing audio → completes
- [ ] Step 2: Syncing visuals → completes
- [ ] Step 3: Rendering video → completes
- [ ] Step 4: Finalizing → completes
- [ ] Overall progress bar 0-100%
- [ ] Refresh during rendering → shows current step ✓
- [ ] After complete → video player appears
- [ ] "Download" and "Go to Projects" buttons appear

## Navigation Tests

### ✓ Step Indicators
- [ ] Source always clickable (first step)
- [ ] Script disabled until movie selected
- [ ] Voice disabled until script generated
- [ ] Compose disabled until voice generated
- [ ] Completed steps show checkmarks
- [ ] Can click any completed step to revisit
- [ ] Current step highlighted in cyan
- [ ] Disabled steps have gray text and cursor-not-allowed

### ✓ Back/Continue Buttons
- [ ] Each step has Back button (except Source)
- [ ] Each step has Continue button when complete
- [ ] Back button disabled during async operations
- [ ] Continue button only enabled when step complete
- [ ] Back/Continue navigate correctly

### ✓ Left Rail Navigation
- [ ] Left rail visible on all steps
- [ ] Can navigate to Dashboard, Projects, etc.
- [ ] Project remains in draft state
- [ ] Can return to project from any page
- [ ] State persists across navigation ✓

## State Persistence Tests

### ✓ Browser Refresh
- [ ] At Source step → refresh → movie selection persists
- [ ] At Script step → refresh → script and versions persist
- [ ] During script generation → refresh → starts over (acceptable)
- [ ] At Voice step → refresh → audio URL persists
- [ ] During TTS → refresh → checks if complete
- [ ] At Compose step → refresh → video status persists
- [ ] During rendering → refresh → shows progress

### ✓ Browser Close & Reopen
- [ ] Close browser completely
- [ ] Reopen and navigate to project URL
- [ ] All state restored correctly
- [ ] Active script version correct
- [ ] Completion status correct
- [ ] Can continue from where left off

### ✓ Navigation Away & Back
- [ ] From Source → go to Dashboard → return → state intact
- [ ] From Script → go to Movies → return → state intact
- [ ] From Voice → go to Profile → return → state intact
- [ ] From Compose → go to Settings → return → state intact

## Error Handling Tests

### ✓ Direct URL Access
- [ ] Navigate to `/project/[id]/script` without movie → redirects to Source
- [ ] Navigate to `/project/[id]/voice` without script → redirects to Script
- [ ] Navigate to `/project/[id]/compose` without audio → redirects to Voice
- [ ] Invalid project ID → creates new project

### ✓ Edge Cases
- [ ] Try to delete last script version → prevented
- [ ] Try regenerate without selection → button disabled
- [ ] Empty search query → shows all movies
- [ ] Very long script → scrollable, no UI break
- [ ] Rapid clicks on generate → single request

## UI/UX Tests

### ✓ Responsive Design
- [ ] Desktop (>1024px): 4-column movie grid, full nav
- [ ] Tablet (768-1024px): 3-column grid, full nav
- [ ] Mobile (<768px): 2-column grid, drawer nav
- [ ] Touch targets >44px on mobile
- [ ] Text readable on all sizes
- [ ] No horizontal scroll

### ✓ Loading States
- [ ] Movie grid shows skeleton loaders initially
- [ ] Script generation shows spinner with message
- [ ] TTS shows progress bar and percentage
- [ ] Video shows step-by-step progress
- [ ] All loading states are informative

### ✓ Success States
- [ ] Movie selected → highlight and checkmark
- [ ] Script generated → success message
- [ ] Audio generated → player appears
- [ ] Video complete → completion message
- [ ] Checkmarks on completed steps

### ✓ Visual Consistency
- [ ] Colors match design system
- [ ] Spacing consistent across steps
- [ ] Button styles consistent
- [ ] Card styles match other pages
- [ ] Typography consistent

## Accessibility Tests

### ✓ Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals (if any)
- [ ] No keyboard traps

### ✓ Screen Reader
- [ ] Step indicators announced
- [ ] Button purposes clear
- [ ] Loading states announced
- [ ] Error messages announced
- [ ] Status changes announced

## Performance Tests

### ✓ Load Times
- [ ] Initial page load <2s
- [ ] Movie grid loads quickly
- [ ] State restoration immediate
- [ ] No lag on input
- [ ] Smooth animations

### ✓ Memory
- [ ] No memory leaks on navigation
- [ ] LocalStorage size reasonable
- [ ] Multiple versions don't break localStorage
- [ ] Audio/video URLs not stored (only references)

## Integration Tests (When API Ready)

### ✓ Movie API
- [ ] Fetches real movie data
- [ ] Handles API errors gracefully
- [ ] Shows loading state
- [ ] Caches results

### ✓ Script Generation API
- [ ] Calls AI generation endpoint
- [ ] Handles timeouts
- [ ] Shows appropriate errors
- [ ] Streaming support (if available)

### ✓ TTS API
- [ ] Initiates TTS job
- [ ] Polls for status
- [ ] Handles job failures
- [ ] Provides audio URL on completion

### ✓ Video API
- [ ] Initiates video job
- [ ] Polls for progress
- [ ] Updates step status
- [ ] Handles failures gracefully
- [ ] Provides video URL on completion

## Known Limitations (To Be Implemented)

- [ ] Mock data for movies (not real API)
- [ ] Simulated script generation (not real AI)
- [ ] Simulated TTS progress (not real service)
- [ ] Simulated video rendering (not real service)
- [ ] Audio player non-functional (placeholder)
- [ ] Video player non-functional (placeholder)
- [ ] No actual file downloads (placeholder)

## Success Criteria

✅ **Must Have:**
- [x] All 4 steps functional
- [x] State persists across refreshes
- [x] Navigation works correctly
- [x] UI consistent with other pages
- [x] Multiple script versions work
- [x] Async operations have progress tracking
- [x] Can exit and return at any step
- [x] Build succeeds with no errors

✅ **Should Have:**
- [ ] Real API integration (when ready)
- [ ] Actual audio playback
- [ ] Actual video playback
- [ ] File downloads work
- [ ] Error retry mechanisms
- [ ] Toast notifications for feedback

✅ **Nice to Have:**
- [ ] Keyboard shortcuts
- [ ] Undo/redo for script edits
- [ ] Script diff between versions
- [ ] Export script as PDF
- [ ] Share project link
- [ ] Duplicate project

---

## Quick Test Script

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
open http://localhost:3000

# 3. Create new project
# - Navigate to Projects page
# - Click "New Project"
# - Should redirect to source page

# 4. Complete workflow
# - Select a movie
# - Generate script
# - Edit and create version 2
# - Regenerate to create version 3
# - Generate voice
# - Generate video

# 5. Test persistence
# - Refresh page at each step
# - Close and reopen browser
# - Navigate away and back

# 6. Test navigation
# - Click step indicators
# - Use back/continue buttons
# - Try to skip steps (should prevent)

# 7. Verify completion
# - All steps have checkmarks
# - Project status shows "Completed"
# - Can download video
```

---

**Status:** ✅ Ready for Testing
**Build:** ✅ Passing
**Documentation:** ✅ Complete
