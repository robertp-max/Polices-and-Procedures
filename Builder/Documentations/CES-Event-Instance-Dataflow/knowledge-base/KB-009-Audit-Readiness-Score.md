# KB-009 — Audit readiness score

## Summary

**`auditReadinessScore`** is a **0–100** numeric indicator computed in `buildEventExecutionDataflow` from weighted factors: **required task completion**, **required form completion**, **evidence presence** across tasks, and **required approvals**. It appears in the **event drawer header** and on **CES execution unit cards** (as a shared/event-level projection on units).

## Intuition

| Factor (conceptual) | What it rewards |
|---------------------|-----------------|
| Required tasks | Closing mandatory workflow/policy items. |
| Required forms | Documentation completeness. |
| Evidence | Provable artifacts attached to tasks. |
| Approvals | Governance sign-offs satisfied. |

## What the score is not

- It is **not** a legal determination of compliance.
- It is **not** a replacement for clinical judgment or QAPI committee conclusions.
- It may **lag** briefly behind rapid edits until state is saved and dataflow recomputes.

## Using the score operationally

- **Below 100% with certification due:** Use Tasks + Forms + Evidence + Approvals tabs to drive the remainder; read per-task **completion blocked** messages for precision.
- **Board-level triage:** Compare cards within a sprint; investigate blocked units first.

## See also

- [KB-005](./KB-005-Required-Tasks-and-Certification-Gates.md)
- [KB-010](./KB-010-CES-Board-and-Execution-Units.md)
