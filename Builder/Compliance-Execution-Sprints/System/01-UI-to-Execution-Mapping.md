# 01 — UI to Execution Mapping

This document is the explicit mapping from `ExecutionUnit` fields to the
visible affordances rendered by each CES surface. When a card looks
wrong, work backward from this table to find the offending field.

## 1. Field-to-Surface Matrix

| `ExecutionUnit` field | Card | Drawer | Calendar | Workloads | Dashboard |
|----------------------|:----:|:------:|:--------:|:---------:|:---------:|
| `id` | key | key | — | — | — |
| `title` | top line | header | event pill text | — | risk panel item |
| `parentEventId` | (via swimlane) | header sub-line | event marker | — | upcoming list |
| `workflowId` | — | "Workflow" KV row | — | — | — |
| `workflowPhase` | `PhaseIndicator` chip | NonSkippable timeline cursor | — | — | progress flow bucket |
| `complianceState` | `ComplianceStateBadge` chip + top-bar color | header badge | (signature window if `awaiting_signature`) | (in-flight columns) | progress flow bucket |
| `auditReadiness` | `AuditReadinessTag` chip | header tag | — | — | — |
| `owner` | footer avatar + name | "Owner" KV row | — | row 1 | upcoming list |
| `signatureOwner` | (when awaiting) signer block | Signature Roster section | signature window avatars | — | — |
| `requiredSigners[]` | initials row when `awaiting_signature` | Signature Roster section | window avatars | (count column) | — |
| `blockedReason` | red reason chip on card | Blocked section | — | (counted in blocked column) | risk panel reason chip |
| `dueDate` | footer date (red if overdue) | "Due Date" KV row | (drives day placement) | — | upcoming list date |
| `escalationTimer` | `EscalationTimer` chip | header chip | — | — | risk panel timer chip |
| `evidenceStatus.requiredFormsTotal` | — | Evidence panel KV | — | — | — |
| `evidenceStatus.requiredFormsComplete` | — | Evidence panel KV | — | — | — |
| `evidenceStatus.missingFormIds[]` | — | Missing Forms chips | — | — | — |
| `evidenceStatus.signaturesRequired` | "x/y signed" text | Evidence panel KV | — | — | — |
| `evidenceStatus.signaturesComplete` | "x/y signed" text | Evidence panel KV | — | — | — |
| `evidenceStatus.auditIndexCreated` | "Evidence complete" footer (when completed) | Evidence panel KV | — | — | — |
| `domain` | (via swimlane domain pill) | (inherited from event) | event marker color | (per-owner aggregates) | heatmap tile |

## 2. The Card Anatomy

Defined in
[`ExecutionUnitCard.tsx`](../../../src/policy/ces/components/board/ExecutionUnitCard.tsx).

```
┌──────────────────────────────────────────┐ ◄ 3px top bar (state-tinted)
│ <title>                                  │
│ [phase] [state] [audit-readiness]        │
│ ⚠ <blocked reason>           (if blocked)│
│ ◍◍◍ 1/3 signed              (if awaiting)│
│  ⏱ Overdue 12h                           │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│ ◉ Owner Name              📅 Apr 22      │
└──────────────────────────────────────────┘
```

Top-bar color rule (single source of state at a glance):

| State | Color |
|-------|-------|
| `blocked` | red |
| `awaiting_signature` | orange |
| `completed` | green |
| any other | navy |

## 3. The Column Anatomy

Defined in
[`SprintExecutionBoard.tsx`](../../../src/policy/ces/components/board/SprintExecutionBoard.tsx).

```
┌──────────── Column Header ─────────────┐  ◄ background tinted by state
│  STATE LABEL              [count]      │
├──────────────────────────────────────────┤
│  ▸ Event A (domain)                    │  ◄ swimlane header
│   ┌────────────┐ ┌────────────┐         │
│   │ Unit card  │ │ Unit card  │         │
│   └────────────┘ └────────────┘         │
│                                          │
│  ▸ Event B (domain)                    │
│   ┌────────────┐                        │
│   │ Unit card  │                        │
│   └────────────┘                        │
└──────────────────────────────────────────┘
```

Column-level visual rules:

- `Awaiting Signature` column background: `#FFFAF7` (orange-soft tint)
- `Blocked` column background: `#FCF5F4` (red-soft tint)
- All other columns: standard canvas
- Drag-over state: column bg flips to `navySoft`, border to `navy`

## 4. Drawer Anatomy

Defined in
[`WorkflowDrawer.tsx`](../../../src/policy/ces/components/details/WorkflowDrawer.tsx).

```
┌── Header (sticky) ──────────────────────┐
│ EVENT CATEGORY · EVENT TITLE            │
│ Unit Title                               │
│ [state] [audit-readiness]                │
├──────────────────────────────────────────┤
│ Meta KV: Workflow / Owner / Due Date     │
│ Escalation timer (if any)                │
│                                          │
│ Workflow Phases (non-skippable timeline) │
│   ✓ preparation                          │
│   ✓ documentation                        │
│   ● review (current)                     │
│   🔒 signature                          │
│   🔒 audit                              │
│                                          │
│ Evidence Status panel                    │
│   Forms: 2/3 filed                       │
│   Signatures: 0/2                        │
│   Audit Index: pending                   │
│   [missing form chips]                   │
│                                          │
│ Required Signatures roster (if any)      │
│   ○ Signer A — Pending  18h left        │
│   ○ Signer B — Pending  +12h late       │
│                                          │
│ Blocked section (if blocked)             │
│                                          │
│ Compliance Actions (2x2 grid)            │
│   [Upload Evidence] [Request Signatures] │
│   [Mark Blocked]    [Close Unit]         │
└──────────────────────────────────────────┘
```

The action buttons are **enforcement-aware**: each is disabled when its
corresponding `useExecutionEnforcement` predicate denies, with the
`shortReason` rendered as the button's `title` tooltip.

## 5. Top Context Bar Mapping

Defined in [`CesLayout.tsx`](../../../src/policy/ces/layouts/CesLayout.tsx).

| Element | Source |
|---------|--------|
| "Active Sprint" pill + label + range | `ACTIVE_SPRINT` constant |
| Search input | (placeholder; future global search) |
| Urgent escalations counter | `EXECUTION_UNITS.filter(u => awaiting & overdue OR blocked & not-ready).length` |
| User profile | `OWNERS.vance` (current user — wired to auth in production) |

## 6. Sub-sidebar Mapping

| Item | Route | Page wrapper |
|------|-------|--------------|
| Dashboard | `/ces/dashboard` | `CesDashboardPage` |
| Sprint Execution | `/ces/board` | `CesBoardPage` |
| Compliance Calendar | `/ces/calendar` | `CesCalendarPage` |
| Workload Distribution | `/ces/workloads` | `CesWorkloadsPage` |
| Executive Reports | `/ces/reports` | `CesReportsPage` |

All five pages wrap their content component in `<CesLayout>`. The
top-level routing is in [`src/App.tsx`](../../../src/App.tsx) under
`/ces/*`. Top-level CES nav entry is in
[`src/policy/components/CommandCenterLayout.tsx`](../../../src/policy/components/CommandCenterLayout.tsx)
as `id: 'ces'`.
