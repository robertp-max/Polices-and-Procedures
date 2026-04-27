# 02 — Architecture and Data Model

## 1. Layering

CES is a vertically-sliced module under `src/policy/ces/`. It owns its types,
data, hooks, layout, components, and pages. It depends on the host
Policy/Forms/eCIgn substrate but does not bleed UI into it.

```
src/policy/ces/
├── types.ts                       ── canonical type system (single source of truth)
├── theme.ts                       ── CES_TOKENS (brand + semantic colors)
├── data/mockSprint.ts             ── reference dataset & lookups
├── hooks/
│   ├── useExecutionEnforcement.ts ── pure rules engine (state machine + gating)
│   └── useEvidenceTracker.ts      ── evidence summarization
├── layouts/CesLayout.tsx          ── sub-sidebar + top context bar
├── components/
│   ├── primitives.tsx             ── Card, Badge, AuditTag, Avatar, Timer
│   ├── dashboard/                 ── Executive dashboard composition
│   ├── board/                     ── 6-column execution board + cards
│   ├── details/WorkflowDrawer.tsx ── Detail surface with action panel
│   ├── calendar/                  ── 14-day compliance calendar
│   ├── workloads/                 ── Owner accountability table
│   └── reports/                   ── Sprint trend reports
└── pages/                         ── 5 thin route wrappers
```

## 2. Entity Relationships

```
Sprint  1 ── n  ExecutionUnit
Compliance Event  1 ── n  Workflow  1 ── n  ExecutionUnit
Workflow      ── n  required form ids (string[])
ExecutionUnit ── 1  Owner / 1 Approver / 1 SignatureOwner
ExecutionUnit ── n  RequiredSigner
ExecutionUnit ── 1  EvidenceStatus
ExecutionUnit ── 0..1 BlockedReason
```

## 3. Type System

Defined in [`types.ts`](../../../src/policy/ces/types.ts).

### 3.1 Workflow Phases (sequential, non-skippable)

```ts
type WorkflowPhase =
  | 'preparation'
  | 'documentation'
  | 'review'
  | 'signature'
  | 'audit';
```

`WORKFLOW_PHASE_ORDER` defines the only legal advancement order. The
enforcement engine rejects any move that skips, rewinds, or jumps.

### 3.2 Compliance States (board columns)

```ts
type ComplianceState =
  | 'upcoming' | 'ready' | 'in_progress'
  | 'awaiting_signature' | 'blocked' | 'completed';
```

Six columns. **Fixed**. Adding a column requires updating
`COMPLIANCE_STATE_ORDER`, the enforcement adjacency map, and the board layout
together — they are coupled by design.

### 3.3 Audit Readiness

```ts
type AuditReadiness = 'not_ready' | 'partial' | 'ready';
```

This is not a state — it is an **attestation** about whether the unit's
evidence package would survive surveyor review *right now*. The Completed
column only displays units whose readiness is `ready`.

### 3.4 Evidence Status

```ts
interface EvidenceStatus {
  requiredFormsTotal:    number;
  requiredFormsComplete: number;
  missingFormIds:        string[];
  signaturesRequired:    number;
  signaturesComplete:    number;
  auditIndexCreated:     boolean;
}
```

A unit is **closure-eligible** iff:

```
requiredFormsComplete === requiredFormsTotal
&& signaturesComplete === signaturesRequired
&& auditIndexCreated === true
```

This is enforced in `useExecutionEnforcement.canTransitionState(_, 'completed')`.

### 3.5 BlockedReason

```ts
type BlockedReasonKind =
  | 'missing_signature'
  | 'missing_form'
  | 'dependency_incomplete'
  | 'awaiting_external_input';
```

Blocking is a first-class state with a typed reason of record. The board
refuses to display blocked units without a reason.

## 4. Data Ownership

| Entity | Owner | Mutated by |
|--------|-------|-----------|
| Compliance Event | Compliance calendar source | Imported / synced |
| Workflow | Compliance Officer | Sprint planning |
| Execution Unit | Owner (operational) | Drag/drop + drawer actions |
| Evidence Status | System (derived from form/signature events) | Forms Library + eCIgn |
| Audit Index entry | System | Closure transition |
| Sprint Metrics | System | Sprint retrospective job |

## 5. Mock Dataset

The reference dataset in [`data/mockSprint.ts`](../../../src/policy/ces/data/mockSprint.ts)
encodes Sprint 14 (2026-04-15 → 2026-04-28) with:

- 7 Compliance Events spanning all four domains
- 9 Workflows
- 13 Execution Units distributed across all 6 states (with deliberate
  carry-over, blocked, and overdue cases)
- 7 Owners with capacity-risk distribution
- 6 historic sprint trend points

The dataset is shaped to validate every enforcement rule (e.g., `eu-008` is
a carry-over with overdue signatures; `eu-009` is blocked on a missing form;
`eu-011` is blocked on external input). Tests that exercise enforcement
should consume this dataset directly.

## 6. State Boundaries

CES holds local React state per route during the demo build. Production
deployment must externalize:

| State | Production Location |
|-------|---------------------|
| Execution Unit transitions | Backend service of record (audit log table) |
| Evidence updates | Forms Library event stream |
| Signature events | eCIgn webhook |
| Sprint definition | Compliance calendar service |

The UI layer remains the same — only the data hooks change.
