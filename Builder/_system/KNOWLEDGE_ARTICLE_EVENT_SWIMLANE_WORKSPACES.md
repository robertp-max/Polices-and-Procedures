# Knowledge Article: Event Swimlane Workspaces

## Summary
Generated event swimlane workspaces now surface real identity and requirement data instead of ambiguous placeholders.

## Form workspace behavior
- Event mode shows `Open Form Instance` when a real `formInstanceId` exists.
- Template mode shows `Open Form Template`.
- Missing event instances show `Form Instance Missing — Sync Required`.

The swimlane does not create form instances from the modal.

## Signature workspace behavior
The signature workspace now shows:
- signer order
- signer role
- reviewer role
- slot ID
- parent task ID
- form instance ID
- status

If no signature path exists, the workspace clearly says `Signature Path Not Required`.

## Supporting documentation behavior
Supporting documentation is separate from signatures.
- Signature-only forms do not generate extra support-document tasks.
- Tasks that genuinely require evidence packets still show support subtasks.

## Artifact workspace behavior
The artifact area reports readiness honestly.
If blocked, it lists the exact blockers, such as:
- missing form instances
- incomplete forms
- pending supporting documentation
- pending signature tasks
- final approval requirements

## Final lock behavior
The final evidence lock step always shows the checklist and blocked-item summary.
It should never appear complete while required signatures or support tasks remain unfinished.

## Empty-state behavior
If no route-backed data exists, the workspace must render a truthful empty state rather than a blank screen.

Always capture these identifiers when escalating:
- `eventId`
- `workflowId`
- `taskId`
- `nodeId`
- `formId`
- `formInstanceId`
