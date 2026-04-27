# 12 — eCIgn Integration with PM Tasks / My Tasks / Kanban / Sprint Board

## Purpose
Define how every PM view consumes the same canonical Task that wraps a CES execution unit + eCIgn packet, and the rules for what PM can and cannot do.

## Canonical Task shape (form-submission tasks)
```ts
Task {
  task_id:          string;        // "{event.id}-{NN}" — STABLE, never reissued
  source:           'ces';
  event_id:         string;
  workflow_id:      string;
  policy_id?:       string;
  step_id?:         string;
  form_id?:         string;        // when task wraps a required form
  ecign_packet_id?: string;        // FormInstance id, set on first open
  title:            string;
  description?:     string;
  status:           PmTaskStatus;  // derived via ecignStatusMap
  packet_status?:   EcignPacketStatus;   // UX-friendly packet status
  assigned_user_id?:string;        // PM overlay
  required_signers: SignerRef[];   // from packet
  approvers:        UserRef[];     // from approval rules
  due_date?:        string;
  sprint_id?:       string;        // PM overlay
  story_points?:    number;        // PM overlay
  dependencies:     string[];      // PM overlay
  evidence_id?:     string;        // populated when validated
  audit_log_refs:   string[];      // recent audit row IDs
  blocker_reason?:  'returned' | 'rejected' | 'dependency' | 'missing_signer' | 'expired';
}
```

Personal tasks (`source: 'personal'`) have a separate flow and never count toward compliance unless explicitly linked.

## Single projector
Module `src/policy/pm/taskProjection.ts` is the **only** place that constructs `Task` objects. It:
1. Walks active CES events.
2. For each required form, computes `task_id = "{event.id}-{NN}"`.
3. Snapshots packet status, signer aggregate, approval state, evidence presence.
4. Derives `Task.status` via `ecignStatusMap`.
5. Joins PM overlay (assignee, sprint, points, deps).
6. Returns deterministic, idempotent `Task[]`.

## Anti-duplication enforcement
- Projector is the only constructor; views import the selector, never instantiate.
- A guard helper `assertNoDuplicateTaskIds(tasks)` runs in dev mode and throws if duplicates appear.
- Lint rule (or convention) bans `new Task(` outside the projector.

## Right Panel (single component)
`src/policy/components/pm/TaskDetailRightPanel.tsx` is the **only** UI surface that shows task detail in PM views (Event View, My Tasks, Kanban, Gantt, Sprint Board).

Sections:
1. Overview (title, status chip, event/workflow/policy links)
2. Assignment (assignee, signers, approvers)
3. Timeline (due, sprint, dependencies)
4. eCIgn (packet status, signers progress, action buttons: Open Form, Sign, Approve, Return)
5. Evidence (status, link, timestamp, SHA256)
6. Audit (recent compliance + PM rows)
7. Actions (Open Form → eCIgn workspace; View event/workflow/policy/evidence)

Opening a task from any view opens this same component with the same `task_id`.

## What PM can do
- Read all task fields.
- Write **overlay only**: assignee, watchers, story points, sprint pin, labels, dependencies.
- Schedule with weekend rule enforced.

## What PM cannot do
- Write CES form/step/event status.
- Write eCIgn packet state.
- Mark a CES task `done`.
- Generate or modify evidence.
- Change approval decisions.

## Drag-rules summary (Kanban)
| From → To | CES task | Personal |
|---|---|---|
| Todo → In Progress | Allowed (writes hint; CES will confirm) | Allowed |
| Any → Blocked | Disallowed (blockers come from CES) | Allowed |
| In Progress → In Review | Disallowed | Allowed |
| Any → Done | Disallowed | Allowed |

Disallowed drops show: *"This status is managed by CES/eCIgn. Open the task and complete the required action."*

## Backend contract impact
- No CES/eCIgn schema change.
- Overlay storage is local (Zustand) for now; PM phase 1 adds `pm_overlay_task` server endpoints.

## UI behavior
- Status updates propagate via the projector; all views re-render simultaneously on packet changes.
- Right Panel works equivalently across views; entry point doesn't change behavior.
- Sprint pin honors weekend rule; override requires reason → PM audit row.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| P1 | View constructs its own task object | Lint + convention; assert no duplicates |
| P2 | Different statuses across views | All views go through projector; single status mapper |
| P3 | PM accidentally completes CES task | Right Panel disables action; Kanban drop disallowed; selector enforces |

## Acceptance criteria
- One projector, one Task type, one Right Panel.
- Same `task_id` across all PM views.
- PM cannot complete CES tasks anywhere.
- Weekend rule enforced uniformly.

## Verification checklist
- [ ] tsx script: project tasks for an event, assert each `task_id` unique and shaped per spec.
- [ ] tsx script: attempt to set CES form status from a PM helper → must throw / not exist.
- [ ] tsx script: weekend pin without override is rejected.
- [ ] Right Panel renders identical content given the same `task_id`.
