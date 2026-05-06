# KB-012 — Troubleshooting and FAQ

## Frequently asked questions

### Why do I see two different ids for the same calendar event?

The **RegulatoryEvent id** identifies the seeded calendar obligation. The **Event instance id (`EVT-...`)** identifies the execution container (folder, tasks, audit). Use **EVT** when aligning to execution exports; use the **source id** when aligning to calendar imports.

### I completed a task but it still says blocked on completion

Read **`completionBlockedReason`**. Most cases are **missing required forms** or **missing required evidence** for that task’s policy pattern. Complete the form or attach evidence to the correct **task**, then refresh status.

### Why can’t I upload evidence?

Common causes:

1. **Event is certified / locked** — mutations are blocked pending admin override policy.
2. **No task selected** — evidence must bind to **`taskId`**.
3. **Wrong event context** — ensure you opened the instance that matches your work.

### What does soft delete do?

It marks the task **`isDeleted`** so default views hide it, but **audit** and **restore** remain possible. It is not an erasure for compliance purposes.

### Does the CES board ever disagree with the drawer?

They read the same **dataflow** when regulatory events drive CES. If you observe divergence, capture **screenshots**, **timestamps**, **sourceEventId**, **EVT id**, and **task id** from Technical Details and report — that indicates a bug or a stale UI state.

### I changed the sprint filter and a task “disappeared” from My Tasks / Kanban

Tasks are projected for **regulatory events that overlap the selected PM sprint window** (and personal tasks with a due date in that window). Pick **Current** on the sprint toolbar or choose the sprint that contains the task’s due week. Deep links can call `alignSprintScopeToTaskDueDate(due)` from `SprintScopeToolbar.tsx` if the app should auto-align scope.

### How do I verify audit integrity?

Today: use **Audit Trail** + Technical Details. Future/remote: `verifyAuditHashChain` API (see `complianceExecutionApi.ts` stub) should validate per-event hash linkage.

## Troubleshooting table

| Symptom | Check | Resolution |
|---------|-------|------------|
| Certification button fails | Audit readiness, blockers | Finish required tasks/forms/evidence/approvals. |
| Task stuck in `awaiting_signature` | Approvals tab | Complete signature workflow per policy. |
| Forms show pending forever | Form status vs instance | Generate form instance or complete in form viewer. |
| Evidence under wrong task | Evidence tab grouping | Remove/supersede per policy; re-upload to correct task. |
| Performance slow with large audit | Pagination (future) | Filter by date range in future releases; avoid bulk test spam in demo. |

## Escalation data to attach for IT

1. **User id / role**
2. **`sourceEventId`** and **`eventId` (`EVT...`)**
3. **Task id** and **`taskSourceId`**
4. **Approximate time** of failure
5. **Screenshot** of error or blocked message

## See also

- [End user manual](../CES-EVENT-INSTANCE-END-USER-MANUAL.md)
- [System documentation](../CES-EVENT-INSTANCE-SYSTEM-DOCUMENTATION.md)
