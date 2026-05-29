# End-User Manual: Event Swimlane Signatures and Evidence

## Purpose
This manual explains how generated event and workflow swimlanes now handle:
- task ownership
- form instances
- supporting documentation
- eCIgn signer paths
- reviewer paths
- final approval
- final evidence package lock

## What changed
Every generated swimlane task now carries a canonical identity and a canonical signature path. The system resolves:
- who owns the task
- which form instance belongs to the task
- whether supporting documentation is required
- which reviewer path applies
- which signer path applies
- whether governing-body or final approval is required

No signer task is created from a button click. No form instance is created from the swimlane modal.

## Reading the task modal

### 1. Task Identity
Each task modal shows:
- `taskId`
- `nodeId`
- `eventId`
- `workflowId`
- `formInstanceId` values when forms are attached

Use the copy button on `taskId` when you need to report or audit a specific task.

### 2. Task Instructions
Every task shows explicit instructions.
- If the task is a normal execution task, the instructions explain the step.
- If the task is the final lock step, the instructions become a checklist.

### 3. Form Instances
Each required form is shown on its own row with:
- `formId`
- title
- `formInstanceId`
- status
- action label

Action labels mean:
- `Open Form Instance`: the event execution record already exists and is safe to open
- `Open Form Template`: you are in template mode, so no execution record exists
- `Form Instance Missing — Sync Required`: the event task expected a form instance, but generation did not resolve one; this is a sync bug, not a user action

### 4. Supporting Documentation
Supporting documentation is listed separately from signatures.
- If extra documentation is required, each item appears as its own subtask row.
- If the signed form itself satisfies evidence, no extra documentation rows are shown.

### 5. eCIgn Ceremony / Signature Path
The signature workspace shows deterministic signer tasks with:
- order
- signer role
- reviewer role, when required
- signature slot
- status
- parent task linkage
- form instance linkage

If no signature path is required, the workspace clearly says so.

### 6. Artifact Package
The artifact section explains whether the task package is ready or blocked.
If blocked, it lists missing items such as:
- missing form instances
- incomplete forms
- pending support documentation
- pending signatures
- final approval requirements

## Completing a task
A parent task is not truly ready until all required children are satisfied:
- required form instances exist
- required forms are completed
- required signatures are signed
- required supporting documentation is present
- final approver path is satisfied when applicable
- artifact lock is no longer blocked

If signatures or supporting documentation are still pending, the task will stay in a non-terminal state.

## Final Evidence Package Locked step
The final lock step now displays a checklist:
1. Verify all required form instances exist.
2. Verify required forms are completed.
3. Verify required signatures and reviewer paths are complete.
4. Verify required supporting documentation is uploaded or validated.
5. Verify artifact links resolve.
6. Lock only when all required items are complete.
7. If blocked, list the missing items before closing the task.

## Honest empty states
No swimlane action should open a blank or black screen.
When content is unavailable, the workspace shows an honest state instead:
- `Workspace Not Yet Available`
- `Form Instance Missing — Sync Required`
- `Signature Path Not Required`

Diagnostic identifiers remain visible so the issue can be traced quickly.

## Common operator guidance

### When you see `Form Instance Missing — Sync Required`
- Do not try to create the form from the swimlane.
- Record the `eventId`, `workflowId`, `taskId`, and `formId`.
- Escalate it as task-generation or sync remediation.

### When the signature workspace shows `blocked`
- The required form instance is not yet linked.
- Resolve the missing form instance first.
- Reopen the task after the event dataflow is corrected.

### When the artifact package is blocked
- Review the blocked-items list.
- Complete the listed form, signature, and support requirements in order.
- Return to the lock step only after the blockers are cleared.

## Audit best practice
When reporting an issue, always include:
- `eventId`
- `workflowId`
- `taskId`
- `nodeId`
- `formId`
- `formInstanceId`, if present
- the blocked signer role or support item

This makes remediation deterministic and prevents duplicate or orphaned fixes.
