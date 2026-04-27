# 01 — Execution Model

## 1. Model Statement

The Compliance Execution Sprint System operates a **Calendar-Driven + Sequential Execution Model**.

> **Calendar-Driven** — work cannot enter a sprint unless it is anchored to a scheduled compliance event in the regulatory calendar (`MANDATED_EVENTS_EXPANDED`, `MULTI_YEAR_EVENTS`, `REGULATORY_EVENTS`).
>
> **Sequential** — within each workflow, steps must be completed in the prescribed order: Preparation → Documentation → Review → Signature → Audit. Skipping or reordering is an enforcement violation.
>
> **Aligned** — every event resolves to `policy_id → workflow_id → event_id → artifact_ids[]` and every recurring event lands on a weekday. Enforced by `npm run verify:alignment`. See [12-Alignment-and-Verification.md](./12-Alignment-and-Verification.md).

This model is explicitly **not**:

- backlog-driven (no prioritization games)
- velocity-driven (capacity does not lower a regulatory bar)
- pull-based for compliance items (work is assigned, not chosen)

Discretion exists only **within** an execution unit (how to do the work), never **about** the work.

---

## 2. Work Origination

| Source | Trigger | Lands In |
|---|---|---|
| Scheduled compliance event | Date enters the active sprint window | Sprint **Upcoming** column |
| Trigger-based event (e.g., complaint, survey activation) | Event activated | Sprint **In Progress** (immediate) |
| Recurring sprint work (PHASE 6) | Sprint open | Sprint **Ready** column |
| Retrospective remediation (PHASE 7) | Prior month retrospective | Next sprint **Upcoming** with explicit owner |
| Multi-year event (Biennial / Triennial) | Date enters sprint window | Same as scheduled event, but flagged with `category: 'multi-year-governance'` or `'triennial-governance'` |

There are **no other** legitimate sources of sprint work.

---

## 3. Execution Sequence (Per Workflow)

Every workflow is decomposed into the same five mandatory phases:

```
1. Preparation       Pull data, compile inputs, prepare forms.
2. Documentation     Produce the required artifact(s) (minutes, report, log).
3. Review            Domain or compliance review of the artifact.
4. Signature         eCIgn signatures captured on all required artifacts.
5. Audit             Evidence filed in audit-ready location with index entry.
```

Sprint board columns (PHASE 5) map 1:1 to these phases plus closing states.

A step cannot transition unless the prior step is `complete`. Enforcement is automated (see `10-Enforcement-and-Rules.md`).

---

## 4. Sequence vs. Parallelism

| Allowed Parallelism | Forbidden Parallelism |
|---|---|
| Multiple workflows running concurrently within a sprint | Skipping a workflow phase |
| Multiple execution units in different workflows | Closing a workflow before signatures captured |
| Two assignees collaborating on a single execution unit | Marking `Audit` complete with missing evidence |

---

## 5. Compliance State Mapping

The execution model maps directly to compliance state transitions in `complianceEngine.ts`:

| Execution Phase | Compliance State |
|---|---|
| Preparation | `pending` |
| Documentation | `in-progress` |
| Review | `in-progress` (review subtype) |
| Signature | `awaiting-signature` |
| Audit | `complete` (only after evidence filed) |
| Any failure to advance within SLA | `blocked` or `overdue` |

The sprint board surfaces these states (see `06-Sprint-Board-and-States.md`).

---

## 6. Authority Model

| Role | Authority |
|---|---|
| Compliance Officer | Owns the CES system. Approves sprint plans. Enforces sequence. |
| Administrator | Executive sponsor. Owns blocked-item escalation. Signs sprint closure. |
| Workflow Owners (per `workflows.generated.ts`) | Own the per-workflow execution. Cannot reorder or skip steps. |
| QAPI Lead | Owns workflows in the QA domain inside each sprint. |
| Assignees | Execute the work assigned. Cannot self-assign or reassign without owner approval. |

---

## 7. Why This Model

- Regulatory deadlines (CMS CoPs, HIPAA, OSHA, state, OIG) are **dates** — they are intrinsically calendar-driven.
- Surveyor evidence requires **fixed sequence** (e.g., dashboard before review, review before signature, signature before audit filing). Any out-of-sequence artifact is an immediate finding.
- Compliance work cannot be deprioritized for "team velocity." A backlog model would allow exactly that.

The CES model exists to **eliminate the discretion that creates compliance failures**.
