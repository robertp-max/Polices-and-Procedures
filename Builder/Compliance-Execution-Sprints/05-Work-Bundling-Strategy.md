# 05 — Work Bundling Strategy

## 1. Bundling Goal

Bundle execution units to:

- minimize **context switching** for owners
- complete **whole workflows within a single sprint** wherever the calendar allows
- consolidate **shared signatures** (e.g., Administrator approvals routed in a single eCIgn batch)
- exploit **dependency chains** so prerequisite work is grouped with downstream work

Bundling **never** reorders or skips workflow phases. It only groups units that share an event, a workflow, an owner, an approver, or a dependency.

---

## 2. Bundling Dimensions (in priority order)

| Priority | Dimension | Example |
|---|---|---|
| 1 | **Event** | All units for `EVT-QAPI-2026-Q3` are co-located on the board. |
| 2 | **Workflow** | Within an event, units of `QA-WF-01` are grouped. |
| 3 | **Dependency chain** | Units in `dependsOn` graph are scheduled adjacent (predecessor before successor). |
| 4 | **Shared approver/signer** | Units routed to the same Administrator signature are batched into one eCIgn envelope per day. |
| 5 | **Owner** | Same Owner's units across events are clustered to limit context switches. |

Higher-priority bundling overrides lower priority. Dimension 4 (signature batching) is implemented as a **daily eCIgn batch window** during the Signature phase (Days 9–11 of the sprint).

---

## 3. Worked Example — QAPI Quarterly Bundle

For `EVT-QAPI-2026-Q3` landing in `CES-2026-08-S1`:

```
Bundle: QAPI Q3 Review
├── Preparation (Days 2–4)
│   ├── Compile Q3 dashboard (QA-FM-020)        [Owner: QAPI Lead]
│   ├── Q3 chart audits (QA-FM-025)             [Owner: Clinical Manager]
│   ├── Q3 incident summary (QA-FM-026)         [Owner: Clinical Manager]
│   ├── IC Q3 log (QA-FM-027)                   [Owner: IC Nurse]
│   └── PIP Q3 remeasurement (QA-FM-021)        [Owner: QAPI Lead]
│
├── Documentation (Day 8 — meeting)
│   └── Q3 QAPI review session                  [Owner: Clinical Manager]
│       Output: Minutes draft (QA-FM-024), Action log (QA-FM-022)
│
├── Review (Days 9–10)
│   ├── Minutes redline                          [Owner: QAPI Lead, Approver: Clinical Manager]
│   ├── Action log review                        [Owner: QAPI Lead, Approver: Administrator]
│   └── PIP sustainment decision review          [Owner: Clinical Manager, Approver: QAPI Committee Chair]
│
├── Signature (Day 11 — single eCIgn batch)
│   ├── QA-FM-024 minutes                       [Signers: Administrator, Clinical Manager, QAPI Committee Chair]
│   ├── QA-FM-021 PIP form                      [Signer: Clinical Manager]
│   ├── QA-FM-022 action plan                   [Signer: Administrator]
│   └── QA-FM-023 GB report                     [Signer: Administrator → Board Chair routing]
│
└── Audit (Day 12)
    └── File Q3 evidence pack in audit repo    [Owner: QAPI Lead]
```

The Administrator's three signatures (minutes, action plan, GB report) ride one eCIgn envelope. The QAPI Committee Chair signs minutes once. The Clinical Manager signs minutes + PIP in the same batch.

---

## 4. Multi-Year Event Bundling

Multi-year events trigger **larger** bundles because they involve cross-functional review:

```
Bundle: Biennial Workforce Competency Validation (EVT-HR-2026-COMPETENCY-BIENNIAL)
├── Preparation (Days 2–7 — long prep window: -14 dueOffset)
│   ├── Active workforce roster + role-competency matrix     [Owner: HR Lead]
│   ├── 24-month OIG/SAM evidence pack (HR-FM-005)           [Owner: HR Lead]
│   ├── License PSV evidence pack (HR-FM-006)                [Owner: HR Lead]
│   ├── Annual evaluation pack (HR-FM-008)                   [Owner: HR Lead]
│   └── Personnel file content audit (HR-FM-015)             [Owner: HR Lead, Approver: Clinical Manager]
│
├── Documentation (Day 8)
│   └── Joint Clinical / HR / Compliance review session
│
├── Review (Days 9–10)
│   └── Gap triage approval                                  [Approver: Compliance Officer]
│
├── Signature (Day 11)
│   └── Validation report + remediation plan                  [Signers: Administrator, Clinical Manager, HR Lead, Compliance Officer]
│
└── Audit (Day 12)
    └── File biennial validation evidence in audit repo
```

Subsequent **closure work** (60-day critical-gap closure) carries forward into following sprints as `followUps[]` units bundled under the same parent event.

---

## 5. Sprint-Aware Bundling Rules

| Rule | Statement |
|---|---|
| B1 | A workflow that **starts** in a sprint should **finish** in the same sprint when calendar allows. |
| B2 | A workflow that **cannot** finish in-sprint must declare its remaining phases as units in the next sprint, with explicit dependency links. |
| B3 | Signature bundling must not delay an individual signature past its `escalationDays`. Batching is convenience, not justification for delay. |
| B4 | Approvers receive **one consolidated review packet per workflow** in the Review phase, not piecemeal. |
| B5 | Each Owner sees a **single daily standup view** of their units across all bundles, ordered by phase. |

---

## 6. Anti-Patterns

| Pattern | Why Forbidden |
|---|---|
| Bundling units across **unrelated events** to "use capacity" | Re-introduces backlog/velocity logic — forbidden by Phase 1 model. |
| Splitting a single workflow phase across two sprints when it could finish in one | Increases incomplete-workflow risk. |
| Holding signatures to "fill" a future eCIgn batch | Violates B3. |
| Compressing Review into Signature day | Removes the independent review checkpoint. |

---

## 7. Bundle Identifier

Each bundle in the sprint board carries:

```
<Sprint ID> :: <Event ID> :: <Workflow ID>
```

Example: `CES-2026-08-S1 :: EVT-QAPI-2026-Q3 :: QA-WF-01`

This identifier is recorded on every artifact produced in the bundle and is the audit-trail key linking sprint output to the originating event and workflow.
