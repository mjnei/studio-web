# Admin Sub-Pages Implementation Plan

**Based on**: FRONTEND_API_CLIENT_AUDIT.md - Part 4: Missing Frontend Clients  
**Date**: August 16, 2026  
**Priority**: Build missing admin monitoring and management interfaces

---

## Overview

The admin dashboard currently has a stats grid that routes to existing pages. However, **4 major backend endpoint groups are not exposed to the frontend**, preventing admins from:

1. ❌ Monitor TTS job health and diagnose failures
2. ❌ Test TTS functionality via playground
3. ❌ View audit logs for compliance
4. ❌ Manage notification preferences

This plan adds the missing client functions and corresponding UI pages.

---

## Part 1: API Client Functions to Add

### 1.1 Admin TTS Jobs Client

**File to Create**: `src/lib/api/admin-tts-client.ts`

```typescript
// Types
export interface StaleJob {
  id: number;
  job_id: string;
  status: "queued" | "processing";
  created_at: string;
  duration_seconds: number;
  voice_id: number;
  preview_text: string;
}

export interface TTSJobStats {
  total_jobs: number;
  completed: number;
  failed: number;
  stale: number;
  average_duration_seconds: number;
  success_rate: number;
}

export interface FailedJob {
  id: number;
  job_id: string;
  error_message: string;
  failed_at: string;
  attempts: number;
  voice_id: number;
}

// Functions
export async function getStaleTTSJobs(limit = 100): Promise<StaleJob[]>
export async function getFailedTTSJobs(limit = 100, offset = 0): Promise<FailedJob[]>
export async function getTTSJobStats(): Promise<TTSJobStats>
export async function getTTSJobDetails(jobId: number): Promise<TTSJob>
```

**Implementation Notes**:
- Use `request()` from `api-client.ts` (standard HTTP)
- Add to `src/lib/api/admin.ts` or separate file (see below)
- Include error handling and loading states in UI

---

### 1.2 Playground Client

**File to Create**: `src/lib/api/playground-client.ts`

```typescript
// Types
export interface PlaygroundTTSRequest {
  text: string;
  voice_id: number;
  speed_ratio?: number;
}

export interface PlaygroundJob {
  id: string;
  text: string;
  voice_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  error?: string;
  audio_url?: string;
}

// Functions
export async function createPlaygroundTTSJob(data: PlaygroundTTSRequest): Promise<PlaygroundJob>
export async function getPlaygroundJob(jobId: string): Promise<PlaygroundJob>
export async function streamPlaygroundJobStatus(jobId: string): Promise<ReadableStream>
export async function getPlaygroundAudio(jobId: string): Promise<Blob>
export async function getPlaygroundVoiceHistory(): Promise<Voice[]>
export async function getPlaygroundHistory(limit = 20): Promise<PlaygroundJob[]>
```

**Implementation Notes**:
- SSE for streaming: Use `use-sse.ts` hook pattern
- Audio download: Use `requestFormData()` approach for blob
- Voice history: Reuse existing `listVoices()` if applicable

---

### 1.3 Audit Client

**File to Create**: `src/lib/api/audit-client.ts`

```typescript
// Types
export interface AuditLog {
  id: number;
  action: string;
  user_id: number;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  created_at: string;
}

export interface AuditStats {
  total_logs: number;
  actions_by_type: Record<string, number>;
  users_active: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

// Functions
export async function getAuditLogs(limit = 50, offset = 0): Promise<AuditLogsResponse>
export async function getAuditStats(): Promise<AuditStats>
export async function filterAuditLogs(filter: {
  action?: string;
  user_id?: number;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}): Promise<AuditLogsResponse>
```

**Implementation Notes**:
- Pagination support for large audit logs
- Filter/search capabilities
- Date range filtering

---

### 1.4 Notification Preferences Client

**File to Create**: `src/lib/api/notification-client.ts`

```typescript
// Types
export interface NotificationPreference {
  id: number;
  user_id: number;
  notification_type: string; // "tts_complete", "video_ready", "system_alert", etc.
  enabled: boolean;
  email: boolean;
  in_app: boolean;
  push: boolean;
}

export interface PreferencesListResponse {
  items: NotificationPreference[];
}

// Functions
export async function getNotificationPreferences(): Promise<PreferencesListResponse>
export async function updateNotificationPreference(
  notificationType: string,
  enabled: boolean,
  channels: { email?: boolean; in_app?: boolean; push?: boolean }
): Promise<NotificationPreference>
export async function updateAllNotificationPreferences(
  updates: Partial<NotificationPreference>[]
): Promise<PreferencesListResponse>
```

---

## Part 2: New Admin Sub-Pages

### 2.1 TTS Job Monitoring Dashboard

**Path**: `/admin/tts-jobs`  
**Components**:
- Stale jobs alert (queued/processing > 5 min)
- Failed jobs table with error messages
- TTS stats widget (success rate, avg duration)
- Job detail modal/drawer

**File Structure**:
```
src/app/(shell)/admin/
├── tts-jobs/
│   ├── page.tsx              # Main TTS monitoring page
│   ├── layout.tsx            # With breadcrumbs
│   └── components/
│       ├── StaleJobsAlert.tsx
│       ├── FailedJobsTable.tsx
│       ├── TTSStatsWidget.tsx
│       └── JobDetailModal.tsx
```

**Features**:
- ✅ Auto-refresh every 5 seconds
- ✅ Retry failed jobs
- ✅ Cancel stale jobs
- ✅ Export job logs as CSV
- ✅ Filter by date range, voice, status

---

### 2.2 Playground / TTS Testing

**Path**: `/admin/playground`  
**Components**:
- Text input for TTS synthesis
- Voice selector
- Speed ratio slider
- Real-time playback
- Job history

**File Structure**:
```
src/app/(shell)/admin/
├── playground/
│   ├── page.tsx              # Playground interface
│   ├── layout.tsx
│   └── components/
│       ├── PlaygroundForm.tsx
│       ├── AudioPlayer.tsx
│       ├── JobHistory.tsx
│       └── VoiceSelector.tsx
```

**Features**:
- ✅ Quick TTS testing without creating project
- ✅ Audio playback with download
- ✅ Speed ratio variation testing
- ✅ Job history
- ✅ Voice filtering

---

### 2.3 Audit Logs Viewer

**Path**: `/admin/audit-logs`  
**Components**:
- Audit log table with pagination
- Audit stats summary
- Filters (action, user, resource type, date)
- Search functionality

**File Structure**:
```
src/app/(shell)/admin/
├── audit-logs/
│   ├── page.tsx              # Audit logs page
│   ├── layout.tsx
│   └── components/
│       ├── AuditLogsTable.tsx
│       ├── AuditStatsCard.tsx
│       ├── AuditFilters.tsx
│       └── ActionBadge.tsx
```

**Features**:
- ✅ Full audit log search with filters
- ✅ Pagination (50 items/page)
- ✅ Export to CSV
- ✅ Statistics dashboard (actions breakdown)
- ✅ User activity tracking

---

### 2.4 Notification Settings

**Path**: `/admin/notifications`  
**Components**:
- Notification type toggles
- Channel preferences (email, in-app, push)
- Preference management UI

**File Structure**:
```
src/app/(shell)/admin/
├── notifications/
│   ├── page.tsx              # Notification preferences
│   ├── layout.tsx
│   └── components/
│       ├── NotificationTypeCard.tsx
│       ├── ChannelToggleGroup.tsx
│       └── PreferenceSave.tsx
```

**Features**:
- ✅ Per-notification-type toggles
- ✅ Channel selection (email, in-app, push)
- ✅ Bulk enable/disable
- ✅ Save preferences

---

## Part 3: Navigation Integration

### 3.1 Admin Sidebar Navigation

Update or create admin navigation structure:

```typescript
// src/lib/navigation/admin-nav.ts
export const ADMIN_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "BarChart3",
  },
  {
    title: "Movies",
    href: "/admin/movies",
    icon: "Film",
  },
  {
    title: "Voices",
    href: "/admin/voices",
    icon: "Mic",
  },
  {
    title: "TTS Jobs",
    href: "/admin/tts-jobs",
    icon: "Zap",
  },
  {
    title: "Playground",
    href: "/admin/playground",
    icon: "Play",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: "ClipboardList",
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: "Bell",
  },
  {
    title: "Queue Admin",
    href: "/admin/queue",
    icon: "Package",
  },
];
```

### 3.2 Update Admin Page Stats Grid

**Current**: Stats grid routes to existing pages (movies, voices, users)
**Future**: Add optional secondary nav showing all admin pages

---

## Part 4: Implementation Sequence

### Phase 1: Foundation (Week 1)

1. **Create API clients** (3 hours)
   - [ ] `admin-tts-client.ts` (4 functions)
   - [ ] `playground-client.ts` (6 functions)
   - [ ] `audit-client.ts` (3 functions)
   - [ ] `notification-client.ts` (3 functions)

2. **Add types** (1 hour)
   - [ ] Create `src/types/admin.ts` with all response types
   - [ ] Export from API clients

3. **Update main admin page** (30 min)
   - [ ] Add links to new sub-pages in features section
   - [ ] OR create admin sidebar navigation

### Phase 2: TTS Jobs Monitoring (Week 2)

4. **Build TTS jobs page** (4 hours)
   - [ ] Create `/admin/tts-jobs` page
   - [ ] Build StaleJobsAlert component
   - [ ] Build FailedJobsTable component
   - [ ] Add auto-refresh logic
   - [ ] Add retry/cancel actions

### Phase 3: Playground (Week 2)

5. **Build playground page** (3 hours)
   - [ ] Create `/admin/playground` page
   - [ ] Build PlaygroundForm component
   - [ ] Build AudioPlayer component
   - [ ] Add job history

### Phase 4: Audit & Notifications (Week 3)

6. **Build audit logs page** (3 hours)
   - [ ] Create `/admin/audit-logs` page
   - [ ] Build AuditLogsTable component
   - [ ] Add filtering and search

7. **Build notification settings page** (2 hours)
   - [ ] Create `/admin/notifications` page
   - [ ] Build preference management UI

### Phase 5: Polish (Week 3)

8. **Integration & testing** (2 hours)
   - [ ] Test all new pages
   - [ ] Add loading states
   - [ ] Add error handling
   - [ ] Optimize performance

---

## Part 5: Feature Comparison

| Feature | Current | After | Priority |
|---------|---------|-------|----------|
| TTS Job Monitoring | ❌ | ✅ | HIGH |
| Playground Testing | ❌ | ✅ | MEDIUM |
| Audit Logs | ❌ | ✅ | MEDIUM |
| Notification Management | ❌ | ✅ | LOW |
| **Total Coverage** | ~60% | ~95% | - |

---

## Part 6: Implementation Checklist

### API Client Functions
- [ ] `getStaleTTSJobs()`
- [ ] `getFailedTTSJobs()`
- [ ] `getTTSJobStats()`
- [ ] `getTTSJobDetails()`
- [ ] `createPlaygroundTTSJob()`
- [ ] `getPlaygroundJob()`
- [ ] `streamPlaygroundJobStatus()`
- [ ] `getPlaygroundAudio()`
- [ ] `getPlaygroundVoiceHistory()`
- [ ] `getPlaygroundHistory()`
- [ ] `getAuditLogs()`
- [ ] `getAuditStats()`
- [ ] `filterAuditLogs()`
- [ ] `getNotificationPreferences()`
- [ ] `updateNotificationPreference()`

### UI Pages & Components
- [ ] `/admin/tts-jobs` page
- [ ] StaleJobsAlert component
- [ ] FailedJobsTable component
- [ ] TTSStatsWidget component
- [ ] JobDetailModal component
- [ ] `/admin/playground` page
- [ ] PlaygroundForm component
- [ ] AudioPlayer component
- [ ] JobHistory component
- [ ] `/admin/audit-logs` page
- [ ] AuditLogsTable component
- [ ] AuditStatsCard component
- [ ] AuditFilters component
- [ ] `/admin/notifications` page
- [ ] NotificationTypeCard component
- [ ] ChannelToggleGroup component

### Navigation & Layout
- [ ] Update admin sidebar navigation
- [ ] Add breadcrumbs to new pages
- [ ] Add new pages to admin nav structure
- [ ] Update main admin page links

---

## Part 7: Type Definitions Example

Create `src/types/admin.ts`:

```typescript
// TTS Jobs
export interface StaleJob {
  id: number;
  job_id: string;
  status: "queued" | "processing";
  created_at: string;
  duration_seconds: number;
  voice_id: number;
  preview_text: string;
}

export interface TTSJobStats {
  total_jobs: number;
  completed: number;
  failed: number;
  stale: number;
  average_duration_seconds: number;
  success_rate: number;
}

// Playground
export interface PlaygroundJob {
  id: string;
  text: string;
  voice_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  error?: string;
  audio_url?: string;
}

// Audit
export interface AuditLog {
  id: number;
  action: string;
  user_id: number;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  created_at: string;
}

// Notifications
export interface NotificationPreference {
  id: number;
  user_id: number;
  notification_type: string;
  enabled: boolean;
  email: boolean;
  in_app: boolean;
  push: boolean;
}
```

---

## Part 8: Estimated Effort

| Component | Effort | Est. Time |
|-----------|--------|-----------|
| API Clients | Small | 3 hours |
| Type Definitions | Small | 1 hour |
| TTS Jobs Page | Medium | 4 hours |
| Playground Page | Medium | 3 hours |
| Audit Logs Page | Medium | 3 hours |
| Notifications Page | Small | 2 hours |
| Navigation & Integration | Small | 1 hour |
| Testing & Refinement | Medium | 2 hours |
| **TOTAL** | - | **~19 hours** |

---

## Part 9: Success Criteria

- ✅ All 4 API client modules created with full function coverage
- ✅ All 4 admin sub-pages created and accessible
- ✅ TTS job monitoring works with auto-refresh
- ✅ Playground allows quick TTS testing
- ✅ Audit logs are searchable and filterable
- ✅ Notification preferences are manageable
- ✅ No TypeScript errors
- ✅ All pages are mobile-responsive
- ✅ Loading and error states handled
- ✅ Navigation is intuitive

---

## Part 10: Next Steps

1. **Priority 1**: Create API client functions (Part 1)
2. **Priority 2**: Build TTS Jobs page (most impactful for admins)
3. **Priority 3**: Build Playground page (useful for testing)
4. **Priority 4**: Build Audit & Notification pages (compliance + user management)

---

**Ready to start?** Begin with Part 1: Create the API client functions in `src/lib/api/` directory.
