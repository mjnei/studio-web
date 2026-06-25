# Huavoi Studio Web - Documentation

**Last Updated:** June 25, 2026

---

## 🎬 6-Step Project Workflow

This is the complete documentation for the 6-step project creation workflow.

### Quick Start

1. **[PROJECT_WORKFLOW.md](./guides/PROJECT_WORKFLOW.md)** - Complete workflow guide with all steps, API endpoints, and implementation details
2. **[WORKFLOW_QUICK_REFERENCE.md](./reference/WORKFLOW_QUICK_REFERENCE.md)** - One-page quick reference (print-friendly)

### The 6 Steps

```
1. Source    → Select movie from TMDB
2. Script    → Generate/edit voiceover script
3. Details   → Name the project
4. Voice     → Select voice (plays pre-recorded preview samples)
5. Preview   → Generate and preview TTS audio with selected voice
6. Compose   → Generate final video
```

---

## 📚 Documentation Files

### Guides
| File | Purpose |
|------|---------|
| [PROJECT_WORKFLOW.md](./guides/PROJECT_WORKFLOW.md) | Complete workflow documentation with implementation details |

### Reference
| File | Purpose |
|------|---------|
| [WORKFLOW_QUICK_REFERENCE.md](./reference/WORKFLOW_QUICK_REFERENCE.md) | One-page quick reference guide (print-friendly) |

---

## 🔑 Key Concepts

### Voice Selection (Step 4) vs TTS Audio (Step 5)

**Step 4: Voice Selection**
- Purpose: Choose a voice actor
- Audio: Pre-recorded voice samples only
- No TTS generation

**Step 5: Preview**
- Purpose: Hear your full script in the selected voice
- Audio: Full TTS-generated audio from script + voice
- Automatically generates when page loads

---

## ✅ Implementation Status

- ✅ Step 1: Source selection (movie picker)
- ✅ Step 2: Script generation (AI-powered)
- ✅ Step 3: Details (project naming)
- ✅ Step 4: Voice selection (pre-recorded previews)
- ✅ Step 5: Preview (TTS audio generation & playback)
- ✅ Step 6: Compose (video generation)
- ✅ Step persistence (last_step tracking)
- ✅ Navigation controls
- ✅ Mobile responsive
- ✅ WCAG AA accessible

---

## 🚀 For Developers

### Quick Navigation

**I need to understand the workflow:**
→ Read [PROJECT_WORKFLOW.md](./guides/PROJECT_WORKFLOW.md)

**I need implementation details:**
→ Check the "Frontend Implementation" section in [PROJECT_WORKFLOW.md](./guides/PROJECT_WORKFLOW.md)

**I need a quick reference:**
→ Use [WORKFLOW_QUICK_REFERENCE.md](./reference/WORKFLOW_QUICK_REFERENCE.md)

**I need to debug a specific step:**
→ Jump to the step in [PROJECT_WORKFLOW.md](./guides/PROJECT_WORKFLOW.md)

---

## 📝 API Integration

All API endpoints are documented in [PROJECT_WORKFLOW.md](./guides/PROJECT_WORKFLOW.md) under "API Endpoints" section.

Key endpoints:
- **Step 4:** `/api/v1/voices`, `/api/v1/recordings`
- **Step 5:** `/api/v1/tts` (TTS audio generation)
- **Step 6:** `/api/v1/projects/{id}/compose` (video generation)

---

## 🔄 Common Workflows

### Create a Project End-to-End
1. Create project (redirects to Step 1)
2. Select movie
3. Generate script
4. Name project
5. Select voice
6. Wait for TTS audio
7. Review and continue
8. Video generation begins

### Check Project Status
```typescript
// Get current project
const project = await getProject(projectId);

// Check last_step
console.log(project.last_step); // e.g., "preview"
```

### Generate TTS Audio (Step 5)
```typescript
const job = await createTTSJob({
  projectId,
  scriptId: activeScript.id,
  voiceId: selectedVoiceId,
  autoActivate: true
});

// Poll for completion
const updated = await getTTSJob(job.id);
console.log(updated.status); // "completed", "processing", etc.
```

---

## 📖 See Also

- **Backend Documentation:** See studio-backend docs
- **API Reference:** See API_ENDPOINTS.md in backend docs
- **Database Schema:** See DB_SCHEMA.md in backend docs

---

## 💡 Tips

- **Bookmark:** Save [WORKFLOW_QUICK_REFERENCE.md](./reference/WORKFLOW_QUICK_REFERENCE.md) for quick lookups
- **Print:** WORKFLOW_QUICK_REFERENCE is print-friendly
- **Search:** Use Ctrl+F / Cmd+F within documents
- **Deep Dive:** Read complete guide for full context

---

**Status:** ✅ Current and Production Ready
