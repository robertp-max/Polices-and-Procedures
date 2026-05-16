# Calendar / Sprint / Kanban / Gantt — View Sync Drift

**Component**: Calendar, Sprint, Kanban, Gantt views  
**Severity**: P1 — compliance officers see different task sets depending on which view they use; Google Calendar push produced no events  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Symptoms Reported by User

Transcript source: `ca487a81-19ff-46b6-baa2-17e8fb4e2e9e` (Google Calendar integration session)

> *"can u double check i dont see any events created push all events for now and new ones manually"*

- A task visible in kanban is not visible in gantt, or vice versa
- Calendar shows different task counts than sprint board for the same date range
- Marking a task complete in one view does not update the other views until manual refresh
- Q2 2026 date ranges render inconsistently across views
- **Google Calendar push was implemented but produced zero events** — user confirmed no events visible in Google Calendar after push
- Sprint header shows "Sprint 9 Apr 26 – May 7, 2026" while the scope shows Sprint 10 (May 10–23) — sprint header inconsistency confirmed by Playwright UAT (DEFECT-Q2-002 screenshots, transcript `3cf17f83`)

---

## 2. Prior Attempted Fixes

1. Calendar component was rebuilt or refactored in at least one prior pass
2. Google Calendar sync layer implemented — user reported zero events on push
3. Regulatory Planner pre-activation audit performed (`ca487a81`) — events validated, structure confirmed
4. Google Calendar push feature added — claimed complete without confirming events appeared in Google Calendar

All fixes with user-visible verification: **CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION**

---

## 3. Why Prior Fixes Likely Failed

Each view (calendar, sprint, kanban, gantt) likely derives its task list from a different selector or projection of the underlying store. If each view maintains its own derived state without subscribing to a shared reactive projection, updates in one view do not propagate to others.

**Specific divergence vectors:**

1. **Different store subscriptions**: Calendar may read from `regulatoryExecutionStore` directly, while kanban reads from `taskProjection`. If `taskProjection` is stale, kanban and calendar disagree.

2. **Filter differences**: Each view may apply different date range, status, or priority filters. A task excluded by one view's filter but included by another's creates apparent inconsistency.

3. **Mutation path differences**: If a task completion action updates `complianceExecutionStore` but the calendar subscribes to `regulatoryExecutionStore`, the calendar does not react.

4. **Q2 boundary sensitivity**: All four views are susceptible to the same off-by-one Q2 date range issue (see CES_TASK_IDENTITY_AND_Q2_FAILURES.md), implemented independently in each view.

5. **Google Calendar push**: The push was implemented with a "manual, controlled" sync model per transcript `ca487a81` instructions, but the push action itself produced no visible events. Root cause unknown — possible OAuth scope issue, possible event structure mismatch, possible missing calendar ID.

---

## 4. Google Calendar Sync Architecture Context

From transcript `ca487a81-19ff-46b6-baa2-17e8fb4e2e9e`:

The Google Calendar sync was designed to be:
- **Manual, controlled** — not auto-sync on UI changes
- **Push-only** — user explicitly triggers sync for selected events
- **Audit-ready** — events must align with QAPI, Governing Body, and Risk Management workflows

The implementation was declared complete, but when the user attempted to view events in Google Calendar, none were present. This indicates either:
1. The OAuth token obtained did not have the required `calendar.events` write scope
2. The calendar ID used for the push was incorrect or the default calendar was not targeted
3. The push API call succeeded (no error thrown) but wrote to an inaccessible calendar
4. The push was never actually executed against the Google Calendar API (UI simulation only)

---

## 5. Exact Files and Components Involved

| File | Role |
|------|------|
| Calendar component | Renders tasks by date; likely reads from regulatory or compliance store directly |
| Sprint board component | Renders tasks grouped by sprint; may use `taskProjection` |
| Kanban component | Renders tasks by status column; may use `taskProjection` or store slice |
| Gantt component | Renders tasks as timeline bars; likely uses date range from task metadata |
| `taskProjection` | Shared derived view; may not be subscribed to by all four views |
| `obligationSelectors` | Date range and status filters; Q2 boundary may be duplicated with inconsistent logic |
| Google Calendar push handler | Sends events to Google Calendar API; produced zero events on first push |

---

## 6. Validation That Was Claimed

- Individual view layouts were confirmed to render correctly in isolation
- Sprint board was demonstrated with tasks present
- Google Calendar sync was declared implemented
- Regulatory Planner pre-activation audit confirmed event structure

---

## 7. Validation That Was Missing

- No cross-view consistency test: same task confirmed visible and with consistent status in all four views simultaneously
- No test of a task state change propagating to all views without manual refresh
- No test specifically scoped to Q2 2026 date range in all four views
- **No confirmation that Google Calendar shows pushed events** — user explicitly reported "no events created"
- No OAuth scope verification confirming `calendar.events` write permission was granted
- No network tab check confirming the push API call returned a 200 status with an event ID

---

## 8. Acceptance Criteria for Future Fix

**Cross-View Sync:**
- [ ] A single compliance task is located by canonical ID in all four views (calendar, sprint, kanban, gantt) without requiring page refresh
- [ ] Marking a task complete in kanban view updates its status in calendar and gantt within the same session, without refresh
- [ ] Q2 2026 tasks (April 1 – June 30, 2026) appear in all four views with consistent counts
- [ ] Date range boundaries are handled consistently: no view excludes April 1 or June 30 while another includes them
- [ ] If a task is in sprint view, it appears on the calendar on its scheduled date

**Google Calendar:**
- [ ] User authenticates with Google OAuth including `calendar.events` write scope
- [ ] Clicking "Push to Google Calendar" sends events to Google Calendar API
- [ ] Events appear in the user's Google Calendar within 30 seconds of push
- [ ] Push returns the event ID from the Google Calendar API response (not just "no error")
- [ ] A second push of the same events does not create duplicates (idempotent)

**All tests performed in-browser, not inferred from code inspection.**

---

## 9. Priority

**P1** — Calendar and sprint views are the primary interface for compliance officers managing Q2 2026 obligations. View sync drift means officers cannot trust any single view as the source of truth.
