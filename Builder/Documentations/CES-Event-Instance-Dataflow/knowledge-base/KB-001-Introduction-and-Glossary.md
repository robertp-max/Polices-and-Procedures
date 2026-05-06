# KB-001 — Introduction and glossary (CES Event Instance Dataflow)

## Summary

The **Event Instance Dataflow** is the path from a **regulatory calendar obligation** to **executable work** (tasks, forms, evidence, approvals) and finally to **certified** closure, while exposing the same truth to the **CES** execution board as read-only projection.

## Glossary

| Term | Definition |
|------|------------|
| **RegulatoryEvent** | Canonical **source** record: what the organization must do, when, under which policies/workflows, including `processFlow`, `requiredForms`, `approvals`, `policyRefs`, `workflowId`. |
| **EventInstance** | **Occurrence-level** execution record: stable `eventId`, `sourceEventId`, schedule, `status`, `lockState`, optional `certificationSnapshot`. |
| **EventTask** | A unit of work under an `eventId`, with stable `taskSourceId`, compliance flags (`isRequired`, `requirementSource`), and links to policies/forms/workflow. |
| **EventExecutionDataflow** | The **merged read model** returned for one regulatory event: tasks + evidence + forms + approvals + CES units + audit trail + readiness score. |
| **CES** | Compliance Execution System **read layer**: sprint-style **execution units** derived from the dataflow when regulatory events exist. |
| **regulatoryExecutionStore** | Zustand store holding **operational** state: overrides, evidence, audits, instances, generated forms. |
| **Soft delete** | Task flag `isDeleted` + `deletedAt`; hidden by default but recoverable; preserves audit narrative. |
| **Certification snapshot** | Immutable capture at certify time of tasks, form statuses, and evidence fingerprints for defensibility. |
| **taskSourceId** | Stable string key for merging derived tasks with store overrides (e.g. `form:ABC-123`). |

## Why this design matters

- **One operational store** avoids conflicting “event execution” copies.
- **Stable ids** keep URLs, exports, and audit references consistent across reloads.
- **Projection-only CES** prevents the board from inventing tasks that the compliance record does not support.

## See also

- [KB-002](./KB-002-Regulatory-Event-vs-Event-Instance.md)
- [KB-010](./KB-010-CES-Board-and-Execution-Units.md)
