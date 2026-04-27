# 14 — eCIgn End User Flow

## Purpose
Walk through the operator's experience from receiving a form-submission task to seeing it close out across all PM views.

## Persona: Coordinator (assignee)

### Step 1 — Find the task
- Open My Tasks (or any PM view): Today / This Sprint / Upcoming.
- The task card shows: title, event chip, due chip, packet status chip (e.g. `Not started`).
- Click the task → Right Panel opens.

### Step 2 — Open the form
- In Right Panel → eCIgn section → "Open Form" button.
- App routes to `/forms/:formId` (eCIgn workspace).
- If no packet exists yet, one is created at state `created` and stamped with `event_id`/`workflow_id`.

### Step 3 — Disclosure + identity
- Read disclosure → click "I agree." Consent recorded.
- If high-impact form, MFA prompt appears (token entered).

### Step 4 — Fill the form
- Edit fields; saves are auto-recorded (field edit log).
- "Save draft" persists current state.

### Step 5 — Review + sign
- Acknowledge review → state `reviewed`.
- Apply signature → state `attested`.
- If second signer required: send invitation (modal lists eligible users).

### Step 6 — Submit (lock)
- Click "Submit & Lock." State machine asserts all upstream steps; on success → state `signed_locked`.
- Compliance rule fires; evidence emitted to AWS; CES form status moves toward `complete`.

### Step 7 — Approval (if applicable)
- Approver receives a notification.
- Approver opens Right Panel → "Approve" or "Return for correction" (with reason) or "Reject" (with reason).
- On approve: receipt evidence recorded; CES step propagates to complete if all required forms complete.

### Step 8 — See it close
- Right Panel updates `packet_status: completed`, `evidence` becomes available.
- All PM views (Event View, My Tasks, Kanban, Sprint, Gantt) flip the task to `Done` simultaneously.
- Event completion check re-runs; if all forms + steps + approvals satisfied → event eligible for certification.

## Common scenarios

### "Save and continue later"
- Use "Save draft" button. Status remains `draft`. Task shows in My Tasks until completed.

### "Forgot to sign — got an overdue alert"
- Notification in-app + (if enabled) email digest reminder.
- Right Panel highlights `due_date` in red; "Open Form" jumps directly to next required step.

### "Wrong information after lock"
- Locked packets are immutable. Use "Issue corrected version" (admin) → new packet supersedes; original retained for audit.

### "Need to schedule on a Saturday"
- Set due date to Saturday → confirmation modal: "Compliance tasks should not be scheduled on weekends. Provide a reason."
- Reason recorded; PM audit row created; weekend override flag set on overlay.

### "Approver returned the form"
- Right Panel status: `Returned for correction` (PM lane: Blocked).
- Reason shown. Click "Open Form" → edit → resubmit → re-lock.

### "Evidence not appearing"
- Right Panel "Evidence pending" badge.
- Auto-refresh; manual "Retry sync" available if administrator.

## Persona: Approver
- Receives notification.
- Opens Right Panel → reviews form (read-only) + signers.
- Approves (with optional MFA) → CES form moves toward complete.
- OR Returns/Rejects with reason → packet status changes; assignee notified.

## Persona: Manager
- Reviews Sprint Board → sees burndown.
- Workload heatmap shows over-capacity assignees.
- Filters by overdue / blocked / returned for correction.
- Cannot mark CES tasks done; can reassign and reschedule (within weekend rule).

## Persona: Auditor
- Filters Reports by event/policy/period.
- Opens evidence rows → verifies SHA256.
- Exports survey packet (manifest + evidence pointers).

## Acceptance criteria
- Operator can complete an end-to-end submission without leaving Right Panel + eCIgn workspace.
- Notifications are clear, non-spammy.
- Errors (returned, declined, expired) explain next required action.

## Verification checklist
- [ ] Walk-through documented with screen labels.
- [ ] Each persona has explicit start/end points.
- [ ] Failure scenarios provide a clear next action.
