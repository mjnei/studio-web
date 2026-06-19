# New Project Workflow Design

## Overview

The new project page (`/project/new`) implements a 4-step wizard workflow for creating video projects with AI-generated scripts and voice-overs.

## Workflow Steps

### Step 1: Select Movie
**Component:** `MovieSelection`
**Route:** `/project/new` (step 1)

**Features:**
- Grid display of available movies
- Search functionality (by title or genre)
- Movie cards with poster, rating, genre, duration
- Visual selection indicator
- Responsive grid (2/3/4 columns)

**User Actions:**
- Search for movies
- Click to select a movie
- View movie details

**Validation:**
- User must select a movie to proceed

---

### Step 2: Generate & Edit Script
**Component:** `ScriptGeneration`
**Route:** `/project/new` (step 2)

**Features:**
- AI-powered script generation
- Real-time script statistics (word count, duration, paragraphs)
- Inline editing mode
- Copy to clipboard
- Regenerate script option
- Preview/Edit toggle

**User Actions:**
- Generate initial script with AI
- Edit script content
- Regenerate if needed
- Copy script to clipboard

**Validation:**
- Script must be generated and have content

**Technical Details:**
- Word count: Real-time calculation
- Estimated duration: ~150 words per minute
- Auto-save draft (to be implemented)

---

### Step 3: Generate & Preview Voice
**Component:** `VoiceGeneration`
**Route:** `/project/new` (step 3)

**Features:**
- Voice selection grid
- Voice previews with metadata (gender, accent, description)
- TTS generation with progress indicator
- Audio player with controls
- Download audio option
- Regenerate with different voice

**User Actions:**
- Select voice profile
- Generate TTS audio
- Preview audio playback
- Download audio file
- Change voice and regenerate

**Validation:**
- Audio must be successfully generated

**Technical Details:**
- Async generation (webhook/polling pattern)
- Progress tracking (0-100%)
- Audio format: MP3 recommended
- Sample rate: 44.1kHz standard

---

### Step 4: Generate Video
**Component:** `VideoGeneration`
**Route:** `/project/new` (step 4)

**Features:**
- Project summary display
- Step-by-step generation progress
- Real-time status updates
- Video preview
- Download video option
- Next steps guidance

**Generation Steps:**
1. Analyzing audio (synchronization prep)
2. Syncing with visuals (audio-visual alignment)
3. Rendering video (compositing)
4. Finalizing output (encoding)

**User Actions:**
- Start video generation
- Monitor progress
- Preview generated video
- Download final video
- Complete project

**Validation:**
- Video must be successfully generated

**Technical Details:**
- Async generation (long-running process)
- Step-by-step progress tracking
- Video format: MP4 (H.264 + AAC)
- Quality: 1080p default
- Estimated time: 3-5 minutes

---

## Component Architecture

```
/project/new/page.tsx (Main Wizard Controller)
├── StepIndicator (Progress visualization)
├── MovieSelection (Step 1)
├── ScriptGeneration (Step 2)
├── VoiceGeneration (Step 3)
└── VideoGeneration (Step 4)
```

### State Management

**Project Data Structure:**
```typescript
interface ProjectData {
  movieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  script?: string;
  voiceId?: string;
  voiceName?: string;
  audioUrl?: string;
  videoUrl?: string;
}
```

**Navigation Rules:**
- Users can go back to previous steps
- Forward navigation requires step completion
- Data persists when navigating between steps
- Final step leads to project detail page

---

## UI/UX Design Patterns

### Visual Hierarchy
1. **Step Indicator:** Always visible at top
2. **Content Area:** Step-specific component
3. **Navigation Controls:** Sticky bottom bar

### Responsive Design
- Mobile: Single column, simplified controls
- Tablet: 2-column grids, medium spacing
- Desktop: 3-4 column grids, full features

### Loading States
- Skeleton loaders for initial data
- Progress bars for generation
- Step-by-step status indicators
- Spinner for short operations

### Success/Error States
- Toast notifications for feedback
- Inline error messages
- Success badges and checkmarks
- Descriptive error recovery

### Color Coding
- Step 1 (Movie): Blue/Cyan gradient
- Step 2 (Script): Purple/Pink gradient
- Step 3 (Voice): Green/Emerald gradient
- Step 4 (Video): Blue/Cyan gradient

---

## API Integration Points

### 1. Movie Selection
```typescript
GET /api/movies
GET /api/movies/search?q={query}
```

### 2. Script Generation
```typescript
POST /api/scripts/generate
{
  movieId: string,
  tone?: string,
  length?: number
}

Response: { script: string }
```

### 3. Voice Generation
```typescript
GET /api/voices (list available voices)

POST /api/tts/generate
{
  script: string,
  voiceId: string
}

Response: { audioUrl: string, duration: number }
```

### 4. Video Generation
```typescript
POST /api/videos/generate
{
  movieId: string,
  audioUrl: string,
  script: string
}

Response: { 
  jobId: string,
  status: 'queued' | 'processing' | 'completed' | 'failed'
}

GET /api/videos/status/{jobId}
Response: {
  status: string,
  progress: number,
  videoUrl?: string,
  steps: Step[]
}
```

---

## Future Enhancements

### Phase 2 Features
- [ ] Multiple voice support (different speakers)
- [ ] Background music selection
- [ ] Custom video templates
- [ ] Advanced editing tools
- [ ] Batch project creation
- [ ] Project templates/presets

### Phase 3 Features
- [ ] Collaborative editing
- [ ] Version history
- [ ] A/B testing for scripts
- [ ] Analytics dashboard
- [ ] Export to multiple formats
- [ ] Social media integration

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to select items
- Arrow keys for grid navigation
- Escape to close modals

### Screen Readers
- Semantic HTML structure
- ARIA labels on all controls
- Status announcements
- Progress updates

### Visual Accessibility
- High contrast ratios
- Focus indicators
- Loading states
- Error messages

---

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading:** Load step components on-demand
2. **Image Optimization:** Use Next.js Image component
3. **Code Splitting:** Separate bundle per step
4. **Caching:** Cache movie list and voice profiles
5. **Debouncing:** Search input debouncing
6. **Streaming:** Stream large file downloads

### Monitoring
- Track generation times
- Monitor API response times
- Log error rates
- User flow analytics

---

## Testing Checklist

### Unit Tests
- [ ] Step navigation logic
- [ ] Validation rules
- [ ] Data persistence
- [ ] Button states

### Integration Tests
- [ ] Complete workflow
- [ ] API interactions
- [ ] Error handling
- [ ] State management

### E2E Tests
- [ ] Full project creation
- [ ] Navigation flow
- [ ] Form submissions
- [ ] File downloads

### Manual Testing
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Loading states
- [ ] Error scenarios
- [ ] Accessibility

---

## Deployment Notes

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.huavoi.com
TMDB_API_KEY=your_tmdb_key
TTS_API_KEY=your_tts_key
VIDEO_API_KEY=your_video_key
```

### Feature Flags
- `ENABLE_SCRIPT_GENERATION`: Toggle AI generation
- `ENABLE_VOICE_PREVIEW`: Toggle voice previews
- `ENABLE_VIDEO_GENERATION`: Toggle video creation
- `MAX_VIDEO_DURATION`: Limit video length

---

## Support & Documentation

For questions about implementation:
- Check component files in `/src/components/project/`
- Review design system in `/docs/guides/DESIGN_SYSTEM.md`
- See component examples in `/docs/guides/COMPONENT_EXAMPLES.md`

