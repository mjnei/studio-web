# Frontend-Backend Integration Guide

**Project**: Huavoi Studio  
**Last Updated**: June 21, 2026  
**Status**: 🟡 **IN PROGRESS** (40% complete)

---

## 🎯 What is This?

This document provides a quick overview and links to detailed integration documentation. **Start here** if you're new to the project.

---

## 📊 Quick Status

```
Backend (Studio Backend)     Frontend (Studio Web)
✅ 100% Ready                🟡 40% Complete

- 48 endpoints              - API client ✅
- Database schema ✅        - Type definitions ✅
- Auth working ✅           - Components cleaned ✅
- All routers ✅            - Hooks pending ⏳
- Docs available ✅         - Pages pending ⏳
```

---

## 📁 Documentation Structure

### Backend Integration Docs
**Location**: `../studio-backend/docs/FRONTEND_INTEGRATION.md`

**Read this if you**:
- Work on backend
- Need to understand API design
- Want to see all 48 endpoints
- Need to know webhook format

### Frontend Integration Docs
**Location**: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`

**Read this if you**:
- Work on frontend
- Need to implement page integration
- Want to understand component architecture
- Need implementation examples

---

## 🚀 Quick Start

### For Frontend Developers

**What's Done**:
- ✅ API client ready (33 functions, 48 endpoints)
- ✅ Components cleaned (no mock data)
- ✅ Type definitions created (full TypeScript)

**What's Next**:
1. Update `use-project-state.ts` hook
2. Update 4 workflow pages
3. Add error handling
4. Test end-to-end

**→ Read**: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`

### For Backend Developers

**What's Done**:
- ✅ All 48 endpoints implemented
- ✅ Database schema complete
- ✅ Auth/validation in place

**What's Next**:
1. Implement provider integrations (TMDB, TTS, Video)
2. Seed test data (movies, voices)
3. Handle webhooks from providers

**→ Read**: `../studio-backend/docs/FRONTEND_INTEGRATION.md`

---

## 📁 File Guide

### Critical Frontend Files

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/api/project-client.ts` | ✅ | 33 API functions |
| `src/lib/types/api.ts` | ✅ | TypeScript types |
| `src/lib/hooks/use-project-state.ts` | ⏳ | State management |
| `src/app/project/new/page.tsx` | ⏳ | Create project |
| `src/app/project/[id]/source/page.tsx` | ⏳ | Step 1 (movies) |
| `src/app/project/[id]/script/page.tsx` | ⏳ | Step 2 (scripts) |
| `src/app/project/[id]/voice/page.tsx` | ⏳ | Step 3 (TTS) |
| `src/app/project/[id]/compose/page.tsx` | ⏳ | Step 4 (video) |
| `src/components/project/script-generation.tsx` | ✅ | Presentation |
| `src/components/project/voice-generation.tsx` | ✅ | Presentation |
| `src/components/project/video-generation.tsx` | ✅ | Presentation |

---

## 🎯 Current Work

### Completed This Session (June 21)
1. Created `src/lib/api/project-client.ts` with 33 functions
2. Created `src/lib/types/api.ts` with all response types
3. Removed mock data from 3 components
4. Created comprehensive integration documentation

### Next Work
1. Update `useProjectState` hook to use API client
2. Update 4 workflow pages to call backend
3. Implement polling for async jobs (TTS/video)
4. Add error handling and loading states

---

## ✅ Integration Checklist

### Frontend Development
- [x] Create API client
- [x] Define types
- [x] Clean components
- [ ] Integrate hook
- [ ] Integrate pages (4)
- [ ] Add error handling
- [ ] Test end-to-end

### Backend Development
- [x] Implement endpoints (48)
- [x] Database schema
- [x] Authentication
- [ ] Implement providers
- [ ] Seed test data
- [ ] Setup webhooks

---

## 🔗 Important Resources

**Documentation**:
- Frontend Integration: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`
- Backend Integration: `../studio-backend/docs/FRONTEND_INTEGRATION.md`
- Workflow Guide: `docs/guides/WORKFLOW_GUIDE.md`
- API Reference: `../studio-backend/API_ENDPOINTS.md`

**Code**:
- API Client: `src/lib/api/project-client.ts`
- Types: `src/lib/types/api.ts`
- State: `src/lib/hooks/use-project-state.ts`

**Running Services**:
- Backend API Docs: `http://localhost:8020/docs`
- Frontend Dev: `http://localhost:3020`

---

## 📊 Progress

```
Backend        40% ✅  100% ✅ (Awaiting frontend)
Frontend       40% 🟡  ~40% (In Progress)
Integration    40%     Overall Progress
```

Next milestone: Page integration (Week 1-2)

---

**Quick Start**: Read `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`
