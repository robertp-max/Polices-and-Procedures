# Phase 2.1 Task-First Event Drawer UX + Route Consistency Report

## Files changed

- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `scripts/checkEvidencePhase21.ts`
- `scripts/checkEvidencePhase2.ts` (compatibility assertion update only)
- `package.json`

## UX changes

- Renamed summary tabs for clarity:
  - `Required Forms` → `Forms Summary`
  - `Evidence` → `Evidence Summary`
  - `Approvals` → `Signatures Summary`
- Added shared task-first banner guidance at the top of non-task summary tabs:
  - "This is a summary view. Complete forms, upload evidence, and request signatures from the linked task in the Tasks tab so the audit trail stays connected."
- Improved task row at-a-glance metadata:
  - story points
  - weighted completion %
  - audit readiness %
  - missing requirements count
  - pending signatures count
  - missing evidence count
  - certified/locked package state indicator
- Enhanced execution requirement row clarity:
  - explicit requirement type
  - required action text
  - status
  - weight %
  - completion %
  - linked artifact
  - user-facing primary action labels:
    - `Complete Form`
    - `Upload Supporting Evidence`
    - `Request Signature`
    - `Review Package`
    - `Certify Package`
    - `Lock Package`
    - `View Audit Trail`
- Added compact visual grouping of requirements under expanded tasks:
  - `Form`
  - `Supporting Evidence`
  - `Signatures`
  - `Review / Certification`
  - `Lock / Audit`

## Route consistency changes

- Added centralized task-linked route builders in `WorkflowExecutionPanel`:
  - `buildTaskLinkedEvidenceRoute(...)`
  - `buildTaskLinkedFormRoute(...)`
  - `buildTaskLinkedAuditRoute(...)`
- Ensured evidence upload route includes task context parameters:
  - `/evidence?event_id=...&task_id=...&form_id=...&policy_id=...&workflow_id=...&requirement_id=...`
- Task-linked form and audit links now preserve relevant execution context where available.

## Deep-link behavior

- Added in-panel deep-link target support from summary tabs into Tasks tab:
  - summary action sets target task + requirement type/id
  - panel switches to `Tasks`
  - linked task auto-expands
  - linked requirement row is focused/scrolled into view when available
- Summary tab action buttons now prioritize `Open Linked Task` for task-context execution continuity.

## Checks run

- `npm run check:evidence-phase21` — PASS
- `npm run check:evidence-phase2` — PASS
- `npm run check:evidence-phase01` — PASS
- `npm run check:evidence-phase15` — PASS

## Remaining gaps

- Requirement row focus is scroll + border highlight (not keyboard focus trap yet).
- Summary tabs still provide direct read-only links (e.g., open form), but primary mutating actions are task-routed.
- Additional end-to-end browser tests for tab-to-task deep-link interaction are not yet included.

## Recommended Phase 3

Proceed with Phase 3 execution hardening:

- add interaction-level integration tests (playwright) for summary-to-task deep-link workflows,
- persist per-requirement deep-link anchors in URL state for refresh-resilience,
- implement richer in-drawer artifact viewers (form/evidence/audit) while preserving task-first execution context,
- finalize backend handshake for package certification + immutable lock receipts.
