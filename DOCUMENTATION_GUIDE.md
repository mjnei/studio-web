# Documentation Guide

**Date**: June 21, 2026  
**Purpose**: Help you navigate all frontend-backend integration documentation  
**Status**: 🎉 Consolidated and organized

---

## 🎯 Start Here

### If You're New to the Project
1. Read: `INTEGRATION_README.md` (this folder)
2. Then: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`
3. Choose your task and start!

### If You're Frontend Developer
1. Read: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`
2. Find your task in "Next Steps"
3. Use code examples provided
4. Track progress in checklist

### If You're Backend Developer
1. Read: `../studio-backend/docs/FRONTEND_INTEGRATION.md`
2. Check: `../studio-backend/API_ENDPOINTS.md`
3. Reference: `../studio-backend/DB_SCHEMA.md`

### If You're Picking Up Earlier Work
1. Check status section at top of main guide
2. See what's completed
3. Find "Next Steps"
4. Continue from there

---

## 📁 Document Locations

### Frontend Documentation

**Quick Reference** (2 min read)
- `INTEGRATION_README.md` ← Start here

**Main Integration Guide** (15 min read)
- `docs/integration/FRONTEND_BACKEND_INTEGRATION.md` ← Most detailed

**Navigation Guide** (5 min read)
- `docs/integration/README.md` ← How to use docs

**Consolidation Info** (5 min read)
- `docs/integration/DOCUMENTATION_CONSOLIDATION.md` ← What changed

**Archived** (for reference only)
- `docs/archives/integration/INTEGRATION_STATUS.md` (old interim status)
- `docs/archives/integration/SESSION_PROGRESS_JUNE21.md` (old session notes)

### Backend Documentation

**Main Integration Guide**
- `../studio-backend/docs/FRONTEND_INTEGRATION.md`

**API Reference**
- `../studio-backend/API_ENDPOINTS.md` (all 48 endpoints)

**Database Schema**
- `../studio-backend/DB_SCHEMA.md` (table structures)

**Archived** (for reference only)
- `../studio-backend/docs/archives/FRONTEND_INTEGRATION_GUIDE.md` (old detailed guide)
- `../studio-backend/docs/archives/FRONTEND_BACKEND_ALIGNMENT_REVIEW.md` (old alignment)

---

## 📊 Documentation Map

```
                    START HERE
                        ↓
              INTEGRATION_README.md
                        ↓
           (Choose your path below)
                        ↓
    ┌─────────────────────────────────┐
    ↓                                 ↓
FRONTEND DEV              BACKEND DEV / PM
    ↓                                 ↓
docs/integration/        ../studio-backend/
FRONTEND_BACKEND_INTEGRATION.md  docs/FRONTEND_INTEGRATION.md
    ↓                                 ↓
Find your task           Check API endpoints
Use examples             Review data flows
Track progress           Troubleshoot issues
```

---

## 🗂️ What Each Document Does

### INTEGRATION_README.md
**Status Table**: Current progress at a glance  
**Quick Start**: Different paths for different roles  
**File Guide**: Where everything lives  
**Links**: All documentation hyperlinked  
**For**: Anyone joining the project

### FRONTEND_BACKEND_INTEGRATION.md
**Status**: 40% complete, what's done/pending  
**Architecture**: Data flow diagrams  
**Files**: Exact locations of code  
**Completed**: API client, components, types  
**Next**: Hook integration, page integration  
**Examples**: Code samples for each task  
**Checklist**: Track your progress  
**For**: Frontend developers implementing integration

### Backend FRONTEND_INTEGRATION.md
**Status**: Backend 100% ready  
**API Overview**: 7 routers, 48 endpoints  
**Flows**: Data flow examples (movies, TTS, video)  
**Integration Points**: What frontend calls what  
**Checklist**: What backend needs to verify  
**Issues**: Common problems and solutions  
**For**: Backend team and PM understanding frontend needs

### Integration Folder README.md
**Overview**: What's in this folder  
**Document Guide**: What each file contains  
**How to Use**: Tips for different situations  
**Phases**: 4 integration phases  
**Handoff**: How to hand off work to next dev  
**For**: Navigating integration documentation

---

## 🎯 Your Current Task

### Option 1: Hook Integration (This Week)
**File to Update**: `src/lib/hooks/use-project-state.ts`

**Steps**:
1. Read: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md` → "Next: Hook Integration" section
2. Review: Code examples in that section
3. Update: The hook to use API client
4. Test: With real backend
5. Update: Documentation with status

**Estimated Time**: 4-6 hours

### Option 2: Page Integration (This Week/Next)
**Files to Update**: 4 workflow pages
- `/src/app/project/new/page.tsx`
- `/src/app/project/[id]/source/page.tsx`
- `/src/app/project/[id]/script/page.tsx`
- `/src/app/project/[id]/voice/page.tsx`
- `/src/app/project/[id]/compose/page.tsx`

**Steps**:
1. Read: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md` → "Next: Page Integration" section
2. Review: Code examples for your specific step
3. Update: Each page to call API
4. Test: Each page individually
5. Test: Full 4-step workflow

**Estimated Time**: 2 weeks (all 4 pages)

### Option 3: Error Handling & Polish
**Focus**: User-friendly error states, loading indicators

**Steps**:
1. Read: Error handling section in main guide
2. Add: Error boundaries to pages
3. Add: Loading skeletons
4. Add: Toast notifications
5. Test: Error scenarios

**Estimated Time**: 1 week

---

## ✅ How to Use Documentation While Working

### When Starting a Task
1. Go to `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`
2. Find your task in "Next: [Task Name]" section
3. Read the description
4. Copy the code example
5. Adapt to your situation

### When Stuck
1. Check FAQ section of main doc
2. Review related code examples
3. Check actual code at listed file locations
4. Search documentation for related sections
5. Ask team for clarification

### When Done with Task
1. Update status in main doc
2. Update progress percentage
3. Add date completed
4. Document any issues encountered
5. Leave notes for next dev

---

## 📈 Tracking Progress

### Status Table (Top of Main Guide)
```
| Component | Status | Details |
|-----------|--------|---------|
| API Client | ✅ Complete | 33 functions, 48 endpoints |
| ... | ... | ... |
```

### Update It When:
- You complete a task
- You discover something new
- Status changes
- Blockers appear

### Keep It Current Because:
- Next dev depends on accurate status
- Shows project momentum
- Identifies where help is needed
- Enables smooth handoff

---

## 🔗 Quick Links

### For Frontend Developers
- Main Guide: `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`
- API Client Code: `src/lib/api/project-client.ts`
- Type Definitions: `src/lib/types/api.ts`
- Workflow Guide: `docs/guides/WORKFLOW_GUIDE.md`

### For Backend Developers  
- Integration Status: `../studio-backend/docs/FRONTEND_INTEGRATION.md`
- API Endpoints: `../studio-backend/API_ENDPOINTS.md`
- Database Schema: `../studio-backend/DB_SCHEMA.md`
- Router Guide: `../studio-backend/ROUTERS_GUIDE.md`

### API Documentation
- Swagger UI: `http://localhost:8000/docs` (when running)
- ReDoc: `http://localhost:8000/redoc`

---

## 💡 Tips for Reading Documentation

1. **Start with status table** - Know where you are
2. **Understand architecture** - Know how pieces fit together
3. **Find your file locations** - Know where to make changes
4. **Read relevant examples** - Copy working patterns
5. **Use checklist** - Track what you've done
6. **Update docs** - Leave notes for next dev

---

## 🎓 Key Concepts

### Data Flow
```
User Action → Page Component → API Client → Backend → Database
```

### Component Architecture
```
Stateful Page         ← Manages API calls
    ↓
Props-Based Component ← Just displays data
    ↓ (events)
Parent Handler        ← Decides what to do
```

### 4-Step Workflow
```
Movie → Script → Voice/TTS → Video
```

---

## ✉️ Documentation Maintenance

### When You Update Documentation
1. Update status percentages
2. Add current date
3. Link new sections
4. Keep consistency
5. Make future handoffs easy

### When You Hand Off Work
1. Update all status sections
2. Document blockers
3. Add recommendations
4. Verify build passes
5. Leave clear next steps

### When You Pick Up Work
1. Read status section
2. Find your task
3. Check checklist
4. Follow examples
5. Update when done

---

## 📞 Need Help?

**Question Type** → **Where to Look**

API format? → `../studio-backend/API_ENDPOINTS.md`  
Database? → `../studio-backend/DB_SCHEMA.md`  
Component prop? → Check component file itself  
Code example? → `docs/integration/FRONTEND_BACKEND_INTEGRATION.md`  
Workflow? → `docs/guides/WORKFLOW_GUIDE.md`  
General? → `INTEGRATION_README.md`  
Confused? → Ask on team Slack/Discord

---

## 🚀 Getting Started Checklist

- [ ] Read `INTEGRATION_README.md`
- [ ] Understand current status
- [ ] Know your role (frontend/backend)
- [ ] Read relevant main guide
- [ ] Check file locations
- [ ] Find your task
- [ ] Review code examples
- [ ] Start implementing
- [ ] Update documentation when done

---

**Last Updated**: June 21, 2026  
**Status**: ✅ Documentation organized and ready  
**Next**: Start with your assigned task!

See `INTEGRATION_README.md` to begin.
