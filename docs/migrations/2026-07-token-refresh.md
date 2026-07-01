# Migration: Proactive Token Refresh (July 2026)

## Overview
Implemented automatic token refresh to prevent session expiration during long workflow sessions.

## Changes

### Frontend (`studio-web`)

#### `/src/lib/api-client.ts`
**Added**:
- `tokenExpiresAt`: Track when current token expires
- `refreshTimer`: Node.js timer for scheduled refresh
- `parseJwtExpiration()`: Extract expiration from JWT payload
- `scheduleTokenRefresh()`: Schedule auto-refresh 2 minutes before expiration

**Modified**:
- `setAccessToken()`: Now parses expiration and schedules refresh
- `request()`: Improved 401 handling with better retry logic

**Impact**: 
- Tokens now refresh automatically in background
- Users won't see 401 errors during long sessions
- No component changes needed

### Backend (`studio-backend`)

#### `/app/config.py`
**Modified**:
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 15 → 30 minutes

**Impact**:
- Longer-lived tokens reduce refresh frequency
- Better user experience for multi-step workflows
- Still secure (refreshed every 28 minutes)

## Compatibility

### Backward Compatible
✅ Old frontend + New backend: Works (no proactive refresh, but reactive refresh still works)
✅ New frontend + Old backend: Works (proactive refresh triggers more often due to 15min tokens)
✅ New frontend + New backend: Optimal (30min tokens, proactive refresh at 28min)

### Breaking Changes
❌ None

## Deployment

### Recommended Order
1. Deploy backend first (increases token lifetime)
2. Deploy frontend (adds proactive refresh)
3. No downtime required
4. No database migrations needed

### Environment Variables
No new environment variables required. Optionally override:

```env
# Backend .env (optional)
ACCESS_TOKEN_EXPIRE_MINUTES=30  # Default is now 30
```

## Testing Checklist

### Before Deployment
- [ ] Run backend tests: `cd studio-backend && uv run pytest`
- [ ] Run frontend build: `cd studio-web && npm run build`
- [ ] Manual login test
- [ ] Check browser console for JWT parsing errors

### After Deployment
- [ ] Verify login still works
- [ ] Start project workflow, wait 30+ minutes
- [ ] Confirm no 401 errors occur
- [ ] Check logs for any token refresh errors

### Validation Script
```bash
# In browser console after login:
setTimeout(() => {
  console.log('Testing API after 30 minutes...');
  fetch('/api/v1/projects', { 
    credentials: 'include',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).then(r => console.log('Status:', r.status));
}, 30 * 60 * 1000);
```

## Rollback Plan

### If Issues Occur

**Step 1: Check logs**
```bash
# Backend logs
cd studio-backend
tail -f logs/app.log | grep "token\|401\|refresh"

# Frontend console
# Open DevTools → Console → Filter: "refresh"
```

**Step 2: Quick fix - Increase token lifetime**
```python
# studio-backend/app/config.py
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Temporary workaround
```

**Step 3: Full rollback (if needed)**
```bash
# Backend
cd studio-backend
git revert <commit-hash>
uv run uvicorn app.main:app --reload

# Frontend  
cd studio-web
git revert <commit-hash>
npm run build
npm run start
```

## Monitoring

### Key Metrics
- **401 error rate**: Should drop significantly
- **Session refresh success rate**: Should be >99%
- **Average session duration**: May increase (users work longer)

### Log Patterns

**Success**:
```
INFO: Proactive token refresh successful
INFO: Token expires at 2026-07-01T10:30:00Z
```

**Warning**:
```
WARN: Proactive token refresh failed
ERROR: Failed to parse JWT expiration
```

### Alerts
Consider setting up alerts for:
- High 401 error rate (> 5% of requests)
- Failed refresh attempts (> 1% of refreshes)
- JWT parsing errors (> 0 per hour)

## Known Issues

### Issue 1: Timer not cleared on logout
**Symptom**: Console warning about refresh after logout
**Workaround**: Already handled - timer cleared in `setAccessToken(null)`
**Status**: Fixed

### Issue 2: Multiple tabs
**Symptom**: Multiple refresh timers for same user
**Impact**: Low - each tab independently refreshes its token
**Workaround**: Tokens are cheap, this is acceptable
**Status**: By design

### Issue 3: System sleep/wake
**Symptom**: Timer fires late after system wakes from sleep
**Impact**: Minimal - reactive refresh will handle it
**Status**: Acceptable (reactive refresh is fallback)

## FAQ

**Q: Why 2 minutes before expiration?**
A: Buffer for network delays and processing time. Token valid for 2 more minutes even if refresh fails initially.

**Q: What happens if refresh fails?**
A: Reactive refresh tries again on next API call. If that fails, user sees "Session expired" message.

**Q: Can users work for hours without re-login?**
A: Yes, as long as they're active. Refresh token valid for 7 days. After that, they must re-authenticate.

**Q: Does this affect API rate limits?**
A: Minimal - one extra API call every 28 minutes per active user.

**Q: What about mobile/offline users?**
A: Refresh fails gracefully when offline. On reconnect, reactive refresh handles it on first API call.

**Q: Should I increase token lifetime even more?**
A: 30 minutes is a good balance. Longer tokens = larger security window if compromised.

## References

- Implementation PR: [Link to PR]
- Related issues: [Link to issues]
- Documentation: `/docs/guides/TOKEN_MANAGEMENT.md`
- Security review: [Link to security review]

## Changelog

### 2026-07-01
- Initial implementation
- Backend: Increased `ACCESS_TOKEN_EXPIRE_MINUTES` to 30
- Frontend: Added proactive token refresh
- Documentation: Created TOKEN_MANAGEMENT.md
