# Master Calendar — Troubleshooting

**Article:** 04-Troubleshooting  
**Page:** Master Calendar (`/calendar`)

---

## Common Issues

### Event is not appearing on the calendar

**Possible causes:**
1. The event filter is hiding it — clear all filters and check again
2. The event is in a future month — navigate forward
3. The event was not auto-generated — check `autogenStore` settings

**Resolution:**
- Clear all filters first
- If the event should exist but doesn't, contact your system administrator to verify the auto-generation schedule

---

### Event is stuck in "blocked" state

**Cause:** A dependency is unresolved. Common blockers:
- A prior quarter's event has not been certified
- A required form has not been signed
- A required policy has not been published

**Resolution:**
1. Open the Event Workspace
2. Open the **Blocker Panel**
3. Read the blocker description carefully
4. Resolve the dependency (complete the prior event, sign the form, publish the policy)
5. The blocked event will automatically unblock once the dependency is resolved

---

### "Push to Google Calendar" is showing an error

**Cause:** Google Calendar sync requires an active connection. Errors occur when:
- The integration token has expired
- The target calendar ID is incorrect
- The event is in `certified_locked` state (sync is disabled for locked events)

**Resolution:**
- Contact your system administrator to refresh the Google Calendar integration
- Locked events can be viewed in Google Calendar but cannot be re-pushed

---

### Evidence was uploaded but the event is still showing as incomplete

**Cause:** Evidence must be **accepted** (reviewed and approved by a manager) before it counts toward event completion. Uploaded evidence that is only in "staged" or "submitted" state does not satisfy the requirement.

**Resolution:**
1. Ask your manager to review the pending evidence
2. Once accepted, the event completion status will update

---

### I certified an event and it's still showing as "overdue"

**Cause:** The event was overdue at the time of certification. Certification does not retroactively change the overdue status — it changes the state to `certified_locked`, but the Dashboard will reflect that the event was completed late.

**Resolution:** This is expected behavior. Late completions are logged with their certification timestamp. Document the reason for the delay in your quality improvement records.

---

### Calendar is not loading

**Cause:**
- Browser cache issue
- Store data corruption in localStorage

**Resolution:**
1. Hard refresh the page (Ctrl+Shift+R)
2. If issue persists, clear localStorage for the application domain and reload
3. **Warning:** Clearing localStorage will remove all unsynchronized local state — ensure critical work has been submitted to the server first
