# SSE Debugging Guide

## Changes Made

### 1. Fixed AbortError handling
- Added `.catch()` to `reader.cancel()` to prevent unhandled rejection errors

### 2. Added Fallback Polling
- SSE is the primary mechanism for real-time updates
- If SSE fails to connect or times out, automatic polling kicks in every 2 seconds
- Polling stops when job completes or SSE reconnects

### 3. Enhanced Debug Logging
- Every step now logs to console with emoji prefixes
- Track SSE configuration, connection status, and message flow

### 4. Fixed API URL
- Changed default from `http://localhost:8000` to `http://localhost:8020/api/v1` to match backend

## Expected Console Output

### When page loads with queued/processing job:
```
🔧 SSE Configuration Check: {
  hasTtsJob: true,
  jobId: 123,
  status: "queued",
  sseUrl: "http://localhost:8020/api/v1/tts/123/stream",
  sseEnabled: true,
  shouldConnect: true
}
🔌 SSE enabled: true, URL: http://localhost:8020/api/v1/tts/123/stream
✅ Access token available, proceeding with SSE connection
🔌 Opening SSE connection to http://localhost:8020/api/v1/tts/123/stream
✅ SSE connection established successfully
📨 SSE message received: { jobId: 123, status: "processing", progress: 20, ... }
📨 SSE message received: { jobId: 123, status: "processing", progress: 50, ... }
📨 SSE message received: { jobId: 123, status: "completed", progress: 100, ... }
🔌 SSE shouldClose check: true (status: completed)
✅ SSE stream ended normally
```

### When page loads with completed job:
```
🔧 SSE Configuration Check: {
  hasTtsJob: true,
  jobId: 123,
  status: "completed",
  sseUrl: "http://localhost:8020/api/v1/tts/123/stream",
  sseEnabled: false,  // <-- SSE disabled for completed jobs
  shouldConnect: false
}
```

### When SSE fails (fallback to polling):
```
❌ SSE connection error: Error: SSE connection failed: 500 Internal Server Error
🔄 Starting fallback polling for job 123
🔄 Polling job status...
🔄 Poll result: { jobId: 123, status: "processing", progress: 50 }
🔄 Polling job status...
🔄 Poll result: { jobId: 123, status: "completed", progress: 100 }
✅ Job complete, stopping polling
```

## Testing Steps

### Test 1: Fresh TTS Job
1. Navigate to preview page with a project that has no TTS job
2. Watch console - should see job creation logs
3. Job should start in "queued" or "processing" status
4. SSE should connect automatically
5. Status should update in real-time to "completed"

### Test 2: Existing Incomplete Job
1. Start a TTS job and quickly navigate away
2. Come back to preview page
3. SSE should connect to existing job
4. Updates should appear in real-time

### Test 3: Completed Job
1. Navigate to preview page with completed job
2. SSE should NOT connect (sseEnabled: false)
3. Should show audio player immediately

### Test 4: Voice Change
1. Complete a TTS job
2. Go back to voice selection, change voice
3. Return to preview page
4. Should create new TTS job with new voice
5. SSE should connect to new job

## Troubleshooting

### No SSE logs at all?
**Possible causes:**
1. Job is already completed when page loads (sseEnabled: false)
2. No access token (check authentication)
3. ttsJob is null (job creation failed)

**Check:**
```javascript
// Look for this log
🔧 SSE Configuration Check: { ... sseEnabled: ?, shouldConnect: ? }
```

### SSE connection error?
**Possible causes:**
1. Backend not running on port 8020
2. Backend SSE endpoint has error
3. CORS issues
4. Authentication token expired

**Check:**
```bash
# Verify backend is running
curl http://localhost:8020/api/v1/health

# Test SSE endpoint (replace TOKEN and JOB_ID)
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8020/api/v1/tts/JOB_ID/stream
```

### Polling instead of SSE?
**This is expected behavior** if:
- SSE fails to connect (network issues, backend error)
- SSE connection times out or drops
- Job is processing but SSE hasn't connected yet

Polling is a **safety fallback** to ensure you get updates even if SSE fails.

### "AbortError: BodyStreamBuffer was aborted"?
**This is normal** when:
- Component unmounts (navigation away from page)
- SSE connection closes normally (job completed)
- Should now be caught silently

If you still see unhandled errors, it means the abort is happening before our catch handler.

## Manual SSE Test

Test the backend SSE endpoint directly:

```bash
# 1. Get auth token (from browser devtools → Application → Local Storage → access_token)
TOKEN="your-token-here"

# 2. Get job ID (from console logs or database)
JOB_ID=123

# 3. Test SSE connection
curl -N \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/event-stream" \
  http://localhost:8020/api/v1/tts/$JOB_ID/stream

# Should see output like:
# event: message
# data: {"id":123,"status":"processing","progress":20,...}
#
# event: message
# data: {"id":123,"status":"processing","progress":50,...}
```

If this works but frontend doesn't, the issue is in the frontend SSE hook.
If this fails, the issue is in the backend SSE endpoint.

## Next Steps

1. **Clear browser cache** and reload page
2. **Check browser console** for the debug logs
3. **Verify backend logs** to see if SSE endpoint is being called
4. If SSE still doesn't work, polling will handle updates (slower but reliable)
