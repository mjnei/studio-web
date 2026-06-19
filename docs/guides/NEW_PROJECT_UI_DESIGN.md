# New Project Page - UI Design Summary

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                             │
│ ┌──────────┐  Create New Project          Step X of 4      │
│ │← Back    │  [Step description]                           │
│ └──────────┘                                                │
├─────────────────────────────────────────────────────────────┤
│ Progress Bar                                                │
│ ①━━━━━━━②━━━━━━━③━━━━━━━④                                 │
│ Movie    Script    Voice    Video                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   CONTENT AREA                              │
│              (Step-specific component)                      │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Navigation (Sticky Bottom)                                  │
│ [← Previous]    Step X of 4    [Next Step →]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Movie Selection

### Layout
```
┌─────────────────────────────────────────────────────┐
│              🎬 Select a Movie                      │
│     Choose a movie to create a voice-over project   │
│                                                     │
│  ┌─────────────────────────────────────┐           │
│  │ 🔍 Search movies by title or genre  │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │              │
│  │⭐9.3 │ │⭐9.2 │ │⭐9.0 │ │⭐8.9 │              │
│  │Title │ │Title │ │Title │ │Title │              │
│  │1994  │ │1972  │ │2008  │ │1994  │              │
│  │Drama │ │Crime │ │Action│ │Crime │              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│  [More movies in responsive grid...]               │
│                                                     │
│  ✅ Movie Selected: The Shawshank Redemption       │
└─────────────────────────────────────────────────────┘
```

### Features
- **Search bar** with icon
- **Grid layout** (responsive: 2/3/4 columns)
- **Movie cards** with:
  - Poster image
  - Rating badge
  - Title
  - Year & duration
  - Genre tags
  - Hover effects
  - Selection indicator (checkmark)
- **Selected movie banner** at bottom

---

## Step 2: Script Generation

### Initial State
```
┌─────────────────────────────────────────────────────┐
│            📝 Generate Script                        │
│   Let AI create a script for [Movie], then review   │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │                                        │         │
│  │         ✨ Ready to Generate Script   │         │
│  │                                        │         │
│  │  Our AI will analyze [Movie] and      │         │
│  │  create a professional voice-over     │         │
│  │  script tailored for your project     │         │
│  │                                        │         │
│  │  [✨ Generate Script with AI]         │         │
│  │                                        │         │
│  └───────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

### Generated State
```
┌─────────────────────────────────────────────────────┐
│            📝 Generate Script                        │
│                                                     │
│  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────┐    │
│  │  450   │ │ ~3min   │ │    5     │ │Ready │    │
│  │ Words  │ │Est.Time │ │Paragraphs│ │Status│    │
│  └────────┘ └─────────┘ └──────────┘ └──────┘    │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │ Script Content  [Copy][Edit][Regen]   │         │
│  ├───────────────────────────────────────┤         │
│  │                                        │         │
│  │ Welcome to today's review of...       │         │
│  │                                        │         │
│  │ This cinematic masterpiece takes us   │         │
│  │ on an unforgettable journey...        │         │
│  │                                        │         │
│  │ [Full script text with paragraphs]    │         │
│  │                                        │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  💡 Pro Tips:                                      │
│  • Keep sentences short and clear                  │
│  • Add pauses with commas and periods              │
└─────────────────────────────────────────────────────┘
```

### Features
- **Generation button** with AI icon
- **Stats cards** (words, duration, paragraphs, status)
- **Script editor** with:
  - Copy to clipboard
  - Edit/Preview toggle
  - Regenerate option
  - Syntax highlighting
- **Pro tips** card

---

## Step 3: Voice Generation

### Voice Selection
```
┌─────────────────────────────────────────────────────┐
│            🎤 Generate Voice                         │
│   Select a voice and generate TTS audio             │
│                                                     │
│  Select Voice                                       │
│  ┌────────────────┐ ┌────────────────┐            │
│  │ 🎤 James       │ │ 🎤 Sarah       │            │
│  │ Professional   │ │ Friendly       │            │
│  │ [male][US]     │ │ [female][US]   │            │
│  │ Deep voice...  │ │ Warm voice...  │            │
│  └────────────────┘ └────────────────┘            │
│  ┌────────────────┐ ┌────────────────┐            │
│  │ 🎤 Oliver      │ │ 🎤 Emma        │            │
│  │ British        │ │ Natural        │            │
│  │ [male][UK]     │ │ [female][US]   │            │
│  └────────────────┘ └────────────────┘            │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │    🔊 Generate Audio                  │         │
│  │                                        │         │
│  │  Ready to generate with James         │         │
│  │  Estimated duration: ~3 minutes       │         │
│  │                                        │         │
│  │  [🔊 Generate Voice Audio]            │         │
│  └───────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

### Generated Audio
```
┌─────────────────────────────────────────────────────┐
│  ✅ Audio Generated Successfully                    │
│     Voice: James - Professional                     │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │  [▶] ━━━━━━━━●━━━━━━━━━━━  [↓]       │         │
│  │  0:42                        3:00     │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  🎤 Not satisfied? Try a different voice            │
│     [Change Voice]                                  │
└─────────────────────────────────────────────────────┘
```

### Features
- **Voice selection cards** with:
  - Voice name and style
  - Gender & accent badges
  - Description
  - Selection indicator
- **Generation section** with progress
- **Audio player** with:
  - Play/pause controls
  - Progress bar
  - Time indicators
  - Download button
- **Change voice** option

---

## Step 4: Video Generation

### Project Summary
```
┌─────────────────────────────────────────────────────┐
│            🎬 Generate Video                         │
│   Create your final video with audio and visuals    │
│                                                     │
│  Project Summary                                    │
│  ┌────────────────┐ ┌────────────────┐            │
│  │ 🎬 Movie       │ │ ⏱ Duration     │            │
│  │ The Shawshank  │ │ ~3 minutes     │            │
│  └────────────────┘ └────────────────┘            │
│                                                     │
│  ┌──────┐ ┌─────────┐ ┌───────┐ ┌──────┐         │
│  │ 450  │ │    5    │ │ 1080p │ │Ready │         │
│  │Words │ │Paragraphs│ │Quality│ │Status│         │
│  └──────┘ └─────────┘ └───────┘ └──────┘         │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │    🎬 Ready to Generate Video         │         │
│  │                                        │         │
│  │  All components are ready              │         │
│  │  Click below to start video generation │         │
│  │                                        │         │
│  │  This process may take 3-5 minutes     │         │
│  │                                        │         │
│  │  [🎬 Start Video Generation]          │         │
│  └───────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

### Processing State
```
┌─────────────────────────────────────────────────────┐
│  Generating Video                          67%      │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━●━━━━━━━━━                   │
│  Processing... This may take a few minutes          │
│                                                     │
│  ✅ Analyzing audio                                │
│  ✅ Syncing with visuals                           │
│  ⏳ Rendering video                                │
│  ⭕ Finalizing output                              │
└─────────────────────────────────────────────────────┘
```

### Completed State
```
┌─────────────────────────────────────────────────────┐
│         🎉 Video Generated Successfully!            │
│        Your video is ready to preview               │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │                                        │         │
│  │         [Video Preview]                │         │
│  │          ▶ Play Button                 │         │
│  │                                        │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  [⬇ Download Video]  [▶ Preview Video]            │
│                                                     │
│  🎉 What's Next?                                   │
│  • Download and share on social media              │
│  • Create another project                          │
└─────────────────────────────────────────────────────┘
```

### Features
- **Project summary** cards
- **Stats display** (words, quality, status)
- **Generation button**
- **Progress tracking**:
  - Overall progress bar
  - Step-by-step indicators
  - Status messages
- **Video preview** with play button
- **Action buttons** (download, preview)
- **Next steps** guidance

---

## Design Elements

### Color Scheme
| Step | Primary Color | Gradient |
|------|--------------|----------|
| Movie Selection | Blue (#3b82f6) | Blue → Cyan |
| Script Generation | Purple (#8b5cf6) | Purple → Pink |
| Voice Generation | Green (#10b981) | Green → Emerald |
| Video Generation | Blue (#3b82f6) | Blue → Cyan |

### Icon Usage
- 🎬 Film - Movie selection
- 📝 FileText - Script generation
- 🎤 Mic - Voice generation
- 🎬 Video - Video generation
- ✨ Sparkles - AI features
- ✅ Check - Completion
- ⏳ Loader - Processing
- 🔍 Search - Search functionality

### Interactive States
1. **Default**: Normal appearance
2. **Hover**: Scale, shadow, color shift
3. **Active**: Scale down (0.95)
4. **Selected**: Ring, border, checkmark
5. **Disabled**: Opacity 50%, no hover
6. **Loading**: Spinner, progress bar

### Responsive Breakpoints
- **Mobile** (<640px): Single column, compact spacing
- **Tablet** (640-1024px): 2-3 columns, medium spacing
- **Desktop** (>1024px): 3-4 columns, full spacing

---

## Animation Patterns

### Page Transitions
- Fade in: `fade-in` (opacity 0 → 1)
- Slide in: `slide-in-from-top-2`
- Duration: 300ms

### Hover Effects
- Scale: `hover:scale-110` (1.1x)
- Shadow: `hover:shadow-lg`
- Color: `hover:bg-surface-hover`

### Loading States
- Spinner: `animate-spin`
- Progress: Smooth width transition
- Pulse: `animate-pulse` for skeleton loaders

---

## Accessibility Features

### Keyboard Navigation
- Tab order follows visual flow
- Focus rings on all interactive elements
- Enter/Space to activate buttons
- Escape to cancel/go back

### Screen Reader Support
- Semantic HTML (header, main, nav)
- ARIA labels on icons
- Status announcements
- Progress updates

### Visual Accessibility
- High contrast ratios (WCAG AA)
- Focus indicators
- Error messages in text + color
- Loading states announced

---

## Mobile Optimizations

### Layout Adjustments
- Single column layouts
- Larger touch targets (min 44x44px)
- Simplified navigation
- Sticky header and footer

### Performance
- Lazy load images
- Optimize video previews
- Debounce search input
- Cache API responses

---

## Implementation Files

### Pages
- `/src/app/project/new/page.tsx` - Main wizard controller

### Components
- `/src/components/project/step-indicator.tsx` - Progress bar
- `/src/components/project/movie-selection.tsx` - Step 1
- `/src/components/project/script-generation.tsx` - Step 2
- `/src/components/project/voice-generation.tsx` - Step 3
- `/src/components/project/video-generation.tsx` - Step 4

### Shared UI
- `/src/components/ui/button.tsx`
- `/src/components/ui/card.tsx`
- `/src/components/ui/input.tsx`
- `/src/components/ui/badge.tsx`
- `/src/components/ui/toast.tsx`

