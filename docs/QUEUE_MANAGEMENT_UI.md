# Queue Management UI - Phase 3 Implementation

## Overview

Phase 3 of the Queue Management Framework adds a comprehensive admin UI for monitoring and managing all queues (TTS, Video, Agnes) from a single dashboard.

## Completed Features

### 1. Queue Management Hub (`/admin/queues`)

A centralized dashboard for monitoring all queues with:

- **Category Tabs**: Filter queues by type (All, TTS, Video, Agnes)
- **Summary Stats**: Total messages, active consumers, critical queue count
- **Real-time Updates**: Auto-refresh every 10 seconds (toggleable)
- **Queue Cards**: Individual cards showing:
  - Message count and consumer count
  - Health status (healthy, warning, critical)
  - Queue metadata (type, retention, DLQ)
  - Quick actions (View Details, Purge)
- **Responsive Design**: Mobile-friendly layout
- **Error Handling**: Graceful error states with retry capability

### 2. Queue Health Indicators

Automated health assessment based on:

- **Critical**: Job queue with messages but no consumers
- **Warning**: Queue has >1000 messages or approaching max capacity
- **Healthy**: Normal operation

Color-coded badges and icons for instant status recognition.

### 3. Purge Queue Dialog

Safe queue purging with:

- **Dry-run Preview**: Shows message count before deletion
- **Confirmation Dialog**: Requires explicit confirmation
- **Loading States**: Visual feedback during operation
- **Success/Error Toast**: Operation result notification

### 4. Admin Sidebar Navigation

Added "Queues" link to admin section with:

- Icon: Layers (stacked boxes)
- Route: `/admin/queues`
- Admin-only visibility

## File Structure

```
studio-web/
├── src/
│   ├── lib/
│   │   ├── types/
│   │   │   └── queue.ts                    # TypeScript types & helpers
│   │   ├── api/
│   │   │   └── queue-admin.ts              # API client
│   │   └── hooks/
│   │       └── use-toast.ts                # Toast hook wrapper
│   ├── components/
│   │   ├── ui/
│   │   │   ├── tabs.tsx                    # Tabs component
│   │   │   └── alert-dialog.tsx            # Alert dialog wrapper
│   │   ├── queue/
│   │   │   ├── QueueStatsCard.tsx          # Queue card component
│   │   │   ├── QueueCategoryTabs.tsx       # Category filter tabs
│   │   │   └── QueuePurgeDialog.tsx        # Purge confirmation
│   │   └── shell/
│   │       └── drawer-content.tsx          # Updated sidebar
│   └── app/
│       └── (shell)/
│           └── admin/
│               └── queues/
│                   └── page.tsx             # Hub page
└── docs/
    └── QUEUE_MANAGEMENT_UI.md              # This file
```

## Components

### QueueStatsCard

Displays queue statistics in a card format:

**Props:**
- `stats: QueueStats` - Queue data
- `onViewDetails?: () => void` - View details handler
- `onPurge?: () => void` - Purge handler

**Features:**
- Health badge (healthy/warning/critical)
- Message and consumer counts with icons
- Metadata display (type, DLQ, retention)
- Action buttons (View Details, Purge)

### QueueCategoryTabs

Category filter tabs with counts:

**Props:**
- `activeCategory: QueueCategory | "all"` - Active tab
- `onCategoryChange: (category) => void` - Tab change handler
- `counts?: Record<...>` - Queue counts per category

**Categories:**
- All Queues
- TTS
- Video
- Agnes AI

### QueuePurgeDialog

Confirmation dialog for purging queues:

**Props:**
- `queue: QueueStats` - Queue to purge
- `open: boolean` - Dialog visibility
- `onOpenChange: (open) => void` - Dialog state handler
- `onSuccess?: () => void` - Success callback

**Features:**
- Auto-loads preview on open
- Shows message count to be deleted
- Warning indicators
- Loading states during purge

## API Integration

### Endpoints Used

```typescript
// List all queues
GET /api/v1/queues
→ QueuesListResponse

// Get specific queue stats
GET /api/v1/queues/{queue_name}/stats
→ QueueStatsResponse

// Purge queue (dry-run or actual)
POST /api/v1/queues/{queue_name}/purge?dry_run={true|false}
→ QueuePurgeResponse
```

### Type Definitions

```typescript
interface QueueStats {
  queue_name: string;
  message_count: number;
  consumer_count: number;
  metadata?: QueueMetadata;
}

interface QueueMetadata {
  name: string;
  display_name: string;
  category: QueueCategory;
  description: string;
  is_job_queue: boolean;
  dlq_name: string | null;
  retention_hours: number | null;
  max_messages: number | null;
}
```

## Usage

### Accessing the Dashboard

1. Navigate to `/admin/queues` (admin role required)
2. View all queues or filter by category
3. Click "View Details" for deep dive (Phase 4)
4. Click "Purge Queue" to delete messages

### Purging a Queue

1. Click "Purge Queue" on any queue card
2. Review the preview (message count)
3. Confirm the action
4. Wait for success notification
5. Queue automatically refreshes

### Monitoring Queue Health

- **Green badge**: All systems operational
- **Yellow badge**: Warning (high message count)
- **Red badge**: Critical (no consumers processing jobs)

## Performance

- **Auto-refresh**: 10-second interval (configurable)
- **Silent refresh**: No loading spinner on auto-refresh
- **Optimistic updates**: Immediate UI feedback
- **Error recovery**: Graceful degradation on API failures

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Screen reader friendly
- Focus management in dialogs

## Mobile Support

- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Touch-friendly buttons
- Optimized spacing for small screens
- Collapsible sidebar

## Future Enhancements (Phase 4)

See `QUEUE_MANAGEMENT_ROADMAP.md` for:

- Individual queue detail pages
- Message activity charts
- DLQ message inspection
- Historical trends
- Advanced filtering

## Testing

### Manual Testing

1. **Access Control**:
   - Non-admin users cannot access `/admin/queues` (redirected)
   - Admin users see "Queues" in sidebar

2. **Queue Display**:
   - All queues load correctly
   - Stats update every 10 seconds
   - Category tabs filter correctly

3. **Purge Workflow**:
   - Preview shows correct message count
   - Confirmation required before purge
   - Success toast displays after purge
   - Queue stats refresh after purge

4. **Error Handling**:
   - Backend down: Error message displays
   - Invalid queue: 400 error handled
   - Network error: Retry available

5. **Responsive Design**:
   - Test on mobile (iPhone, Android)
   - Test on tablet (iPad)
   - Test on desktop (various resolutions)

### Backend Verification

Before testing UI, verify backend:

```bash
# Start backend
cd studio-backend
uv run uvicorn app.main:app --reload --port 8020

# Test endpoints
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:8020/api/v1/queues

# Should return JSON with all queues
```

### Frontend Testing

```bash
# Start frontend
cd studio-web
npm run dev

# Open browser
open http://localhost:3020/admin/queues
```

## Troubleshooting

### "Not authorized" error
- User needs admin role
- Check JWT token in browser DevTools
- Verify `role: "admin"` in token payload

### Queues not loading
- Check backend is running on port 8020
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors
- Verify RabbitMQ is accessible from backend

### Purge not working
- Check backend logs for errors
- Verify RabbitMQ permissions
- Test dry-run first
- Check network tab for 500 errors

### Auto-refresh not working
- Check browser console for errors
- Verify 10-second interval in useEffect
- Toggle auto-refresh off/on
- Check for JavaScript errors blocking updates

## Related Documentation

- Backend Implementation: `studio-backend/docs/QUEUE_MANAGEMENT_IMPLEMENTATION.md`
- Framework Design: `studio-backend/docs/QUEUE_MANAGEMENT_FRAMEWORK.md`
- Roadmap: `studio-backend/docs/QUEUE_MANAGEMENT_ROADMAP.md`
- API Reference: `studio-backend/docs/API_ENDPOINTS.md`

## Success Criteria ✅

- ✅ Hub page loads all queues
- ✅ Category filtering works
- ✅ Auto-refresh updates stats
- ✅ Purge workflow functional
- ✅ Health indicators accurate
- ✅ Error states handled
- ✅ Mobile responsive
- ✅ Admin-only access enforced
- ✅ Sidebar navigation added
- ✅ Toast notifications working
