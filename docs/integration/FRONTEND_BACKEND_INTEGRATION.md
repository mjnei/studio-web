# Frontend-Backend Integration Guide

**Last Updated**: June 21, 2026  
**Status**: 🟡 **IN PROGRESS** - API infrastructure complete, component cleanup done, page integration pending  
**Owner**: Frontend Team  
**Integration Progress**: ~40%

---

## 🎯 Quick Status

| Component | Status | Details |
|-----------|--------|---------|
| API Client | ✅ Complete | 33 functions, 48 endpoints, full type safety |
| Type Definitions | ✅ Complete | All backend response types defined |
| Components (Script, Voice, Video) | ✅ Complete | Mock data removed, props-based |
| useProjectState Hook | ⏳ Pending | Needs API integration |
| Workflow Pages (4) | ⏳ Pending | Steps 1-4 need API calls |
| Error Handling | ⏳ Pending | User-friendly error states |
| Data Seeding | ⏳ Pending | 50+ movies, 10+ voices needed |

**Overall Progress**: 40% complete

---

## 📋 What Is This Document?

This is the **single source of truth** for frontend-backend integration. It consolidates:
- Current integration status
- Architecture decisions
- Implementation roadmap
- Code examples
- File locations

**For developers**: Start here to understand the integration and pick up where the last developer left off.

---

## 🏗️ Architecture Overview

### Current Data Flow
```
User Action (e.g., Select Movie)
    ↓
Workflow Page Component
    ├─ Fetches data (movies, projects)
    ├─ Manages UI state (loading, error)
    ├─ Passes data to presentational components
    └─ Receives events from child components
    ↓
Presentational Component (Script, Voice, Video)
    ├─ Displays data from props
    ├─ Emits events on user actions
    └─ No business logic or API calls
    ↓
API Client (project-client.ts)
    ├─ Makes HTTP requests
    ├─ Handles authentication
    └─ Returns typed responses
    ↓
Backend REST API (/api/v1/...)
    ├─ Database operations
    ├─ Business logic
    └─ Provider integrations
    ↓
PostgreSQL Database
```

### 4-Step Workflow

```
Step 1: Movie Selection           Step 2: Script Generation
/project/[id]/source    ────→    /project/[id]/script
├─ Search movies        ────→    ├─ Create/edit scripts
├─ Select movie         ────→    ├─ Multiple versions
└─ Advance to Step 2    ────→    └─ Advance to Step 3
                              
                                ↓
Step 4: Video Composition        Step 3: Voice Generation
/project/[id]/compose   ←────    /project/[id]/voice
├─ Async job (4 steps) ←────    ├─ Async TTS job
├─ Poll for progress   ←────    ├─ Poll for progress
└─ Download video      ←────    └─ Advance to Step 4
```

---

## 📁 File Locations

### API Infrastructure (Ready)
```
src/lib/
├─ api-client.ts                      # Base client (auth, request handling)
├─ api/
│  └─ project-client.ts               # ✅ 33 API functions
└─ types/
   └─ api.ts                          # ✅ All response types
```

### Components (Ready - Mock data removed)
```
src/components/project/
├─ script-generation.tsx              # ✅ Cleaned
├─ voice-generation.tsx               # ✅ Cleaned  
└─ video-generation.tsx               # ✅ Cleaned
```

### Workflow Pages (Pending - Need API integration)
```
src/app/project/
├─ new/page.tsx                       # ⏳ Create project
└─ [projectId]/
   ├─ source/page.tsx                 # ⏳ Step 1 (movies)
   ├─ script/page.tsx                 # ⏳ Step 2 (scripts)
   ├─ voice/page.tsx                  # ⏳ Step 3 (TTS)
   └─ compose/page.tsx                # ⏳ Step 4 (video)
```

### State Management (Pending - Needs API calls)
```
src/lib/hooks/
└─ use-project-state.ts               # ⏳ localStorage → API
```

---

## ✅ Completed: API Infrastructure

### Type Definitions (`src/lib/types/api.ts`)

All backend response types are defined with full TypeScript coverage:

**Projects**: ProjectResponse, ProjectDetailResponse, ProjectUpdate, ProjectListResponse

**Movies**: MovieResponse, MovieListResponse

**Voices**: VoiceResponse, VoiceListResponse

**Scripts**: ProjectScriptResponse

**TTS**: TTSJobResponse

**Video**: VideoJobResponse, VideoGenerationStepResponse

### API Client Functions (`src/lib/api/project-client.ts`)

All 33 functions implement the backend endpoints:

**Projects** (6): createProject, getProject, getProjectList, updateProject, advanceProjectStep, deleteProject

**Movies** (4): searchMovies, getPopularMovies, getMovie, listMovies

**Voices** (3): searchVoices, listVoices, getVoice

**Scripts** (7): createScript, getScript, listProjectScripts, getActiveScript, activateScript, updateScript, deleteScript

**TTS** (6): createTTSJob, getTTSJob, getActiveTTSJob, getTTSJobList, retryTTSJob, cancelTTSJob

**Video** (7): createVideoJob, getVideoJob, getVideoStep, getActiveVideoJob, getVideoJobList, retryVideoJob, cancelVideoJob

---

## ✅ Completed: Component Cleanup

### ScriptGeneration Component
**Status**: ✅ Complete  
**File**: `src/components/project/script-generation.tsx`

**Removed**:
- Mock script generation with setTimeout
- Hardcoded script template

**Added Props**:
- `isGenerating: boolean` - Loading state
- `onGenerate: () => void` - Generate action
- `onRegenerate: () => void` - Regenerate action

### VoiceGeneration Component

**Status**: ✅ Complete  
**File**: `src/components/project/voice-generation.tsx`

**Removed**:
- `mockVoices` array (4 hardcoded voices)
- Mock audio URL generation
- Simulated progress with setTimeout

**Added Props**:
- `voices: Voice[]` - Voice data from parent
- `selectedVoiceId?: string` - Current selection
- `isGenerating: boolean` - Loading state
- `progress: number` - 0-100 progress
- `onVoiceSelect: (voiceId) => void` - Selection handler
- `onGenerate: (voiceId) => void` - Generate handler
- `onChangeVoice: () => void` - Change handler

### VideoGeneration Component

**Status**: ✅ Complete  
**File**: `src/components/project/video-generation.tsx`

**Removed**:
- Mock video generation loop
- Hardcoded 4-step processing
- Mock video URL generation

**Added Props**:
- `status: "idle" | "processing" | "completed" | "failed"` - Job status
- `progress: number` - 0-100 progress
- `steps: ProcessingStep[]` - Dynamic step array
- `videoUrl?: string` - Result URL
- `onStartGeneration: () => void` - Start handler

---

## 🚧 Next: Hook Integration (Week 1)

### File: `src/lib/hooks/use-project-state.ts`

Replace localStorage-only with backend API calls:

**Current Flow**:
```typescript
localStorage.setItem(`project_${id}`, JSON.stringify(state))
```

**Target Flow**:
```typescript
// Fetch from backend
const project = await getProject(projectId);

// Update state
setState(project);

// Cache locally (optional)
localStorage.setItem(`project_${id}`, JSON.stringify(project));
```

### Required Updates

1. **Import API client functions**
```typescript
import {
  getProject,
  createScript,
  listProjectScripts,
  createTTSJob,
  getTTSJob,
  createVideoJob,
  getVideoJob,
} from "@/lib/api/project-client";
```

2. **Replace all setState calls with API calls**
```typescript
// Script generation
addScript = async (content, wordCount, duration) => {
  const script = await createScript(this.state.id, content);
  setState(prev => ({ ...prev, activeScriptId: script.id }));
};
```

3. **Implement polling for async jobs**
```typescript
const pollTTSJob = (jobId) => {
  const interval = setInterval(async () => {
    const status = await getTTSJob(jobId);
    setState(prev => ({ ...prev, ttsProgress: status.progress }));
    if (status.status === "completed") {
      clearInterval(interval);
      setState(prev => ({ ...prev, audioUrl: status.audio_url }));
    }
  }, 2000);
};
```

---

## 🚧 Next: Page Integration (Week 1-2)

### Step 1: Movie Selection - `/project/[id]/source/page.tsx`

**Current**: Mock movie data, localStorage save  
**Target**: Backend movies, API update

```typescript
// 1. Fetch movies on load
const movies = await searchMovies(query);

// 2. On selection
await advanceProjectStep(projectId, "source");

// 3. Update local state
setState(prev => ({ ...prev, movieId, lastStep: "source" }));
```

### Step 2: Script Generation - `/project/[id]/script/page.tsx`

**Current**: Mock script, localStorage save  
**Target**: Backend scripts, multiple versions

```typescript
// 1. Fetch existing scripts on load
const scripts = await listProjectScripts(projectId);

// 2. On generate
const script = await createScript(projectId, content);

// 3. Switch versions
await activateScript(projectId, scriptId);
```

### Step 3: Voice/TTS - `/project/[id]/voice/page.tsx`

**Current**: Mock voices, mock progress  
**Target**: Backend voices, real TTS polling

```typescript
// 1. Fetch voices on load
const voices = await listVoices();

// 2. On generate
const job = await createTTSJob(projectId, scriptId, voiceId);

// 3. Poll for progress
setInterval(async () => {
  const status = await getTTSJob(job.id);
  setProgress(status.progress);
}, 2000);
```

### Step 4: Video - `/project/[id]/compose/page.tsx`

**Current**: Mock steps, mock progress  
**Target**: Backend video job, real step polling

```typescript
// 1. On generate
const job = await createVideoJob(projectId, ttsJobId);

// 2. Poll with steps
setInterval(async () => {
  const status = await getVideoJob(job.id, true); // load_steps
  setSteps(status.steps);
  setProgress(status.progress);
}, 3000);
```

---

## 📝 Checklist for Next Developer

### Before Starting
- [ ] Read this entire document
- [ ] Understand the 4-step workflow
- [ ] Review API client functions in `project-client.ts`
- [ ] Check existing component props in Script/Voice/Video components

### Hook Integration Task
- [ ] Update `use-project-state.ts` to use API client
- [ ] Add error handling for API calls
- [ ] Add loading states
- [ ] Test with real backend

### Page Integration Task
- [ ] Update `/project/new/page.tsx` - create project
- [ ] Update `/project/[id]/source/page.tsx` - movies
- [ ] Update `/project/[id]/script/page.tsx` - scripts
- [ ] Update `/project/[id]/voice/page.tsx` - TTS
- [ ] Update `/project/[id]/compose/page.tsx` - video

### Testing
- [ ] All 4 steps work end-to-end
- [ ] Error messages display properly
- [ ] Loading states visible
- [ ] Progress updates in real-time
- [ ] Data persists on refresh

### Bonus
- [ ] Implement retry logic for failed jobs
- [ ] Add error boundary component
- [ ] Implement real-time updates via webhooks
- [ ] Add analytics tracking

---

## 🔗 Related Documentation

**Backend Docs**:
- API endpoints and responses: `/studio-backend/API_ENDPOINTS.md`
- Database schema: `/studio-backend/DB_SCHEMA.md`
- Router implementation: `/studio-backend/ROUTERS_GUIDE.md`

**Frontend Docs**:
- Workflow guide: `/studio-web/docs/guides/WORKFLOW_GUIDE.md`
- Component examples: `/studio-web/docs/guides/COMPONENT_EXAMPLES.md`
- Type definitions: `/studio-web/src/lib/types/api.ts`
- API client: `/studio-web/src/lib/api/project-client.ts`

---

## ❓ FAQ

### Q: Why remove mock data instead of keeping it for testing?
**A**: Mock data in reusable components makes it impossible to use with real data. By making components data-agnostic (props-based), they can accept mock or real data as needed. Tests can pass mock data directly.

### Q: What if the API is slow?
**A**: The current approach supports:
- Optional localStorage caching
- Optimistic UI updates
- Retry logic for failed requests
- Debouncing for repeated calls

### Q: How do I test without running the backend?
**A**: Mock the API client functions in your tests:
```typescript
jest.mock("@/lib/api/project-client", () => ({
  getProject: jest.fn(() => ({ id: "123", ... })),
}));
```

### Q: What about error handling?
**A**: All API calls should:
1. Try/catch the API call
2. Display error toast/message
3. Keep UI in a recoverable state
4. Allow retry/cancel

---

## 🚀 Performance Considerations

### Polling Strategy
- TTS jobs: Poll every 2 seconds (stays responsive)
- Video jobs: Poll every 3 seconds (avoid server overload)
- Movie search: Debounce 300ms (reduce API calls)

### Caching Strategy
- Movies: Cache for session (rarely changes)
- Voices: Cache for session
- Projects: Fetch on demand, cache user's projects
- Scripts: Fetch with project, update on change

### Optimization
- Lazy load components per step
- Use React.memo for expensive renders
- Implement request deduplication
- Add loading skeletons

---

## 📊 Success Metrics

Integration is complete when:
- ✅ All 4 workflow steps call backend APIs
- ✅ No mock data in production paths
- ✅ TTS/video jobs poll correctly
- ✅ Error handling works end-to-end
- ✅ Loading states visible throughout
- ✅ Data persists to database
- ✅ End-to-end workflow functional

---

**Last Reviewed**: June 21, 2026  
**Last Updated**: June 21, 2026  
**Next Review**: After page integration complete
