# 00 — README: eCIgn-Centered Form Submission

This folder formalizes the **eCIgn-centered form submission model** for the Home Health Compliance Execution System (CES).

## Why this folder exists
The existing folder [Builder/eCIgn/](../eCIgn/) describes the eCIgn signature engine in detail (state machine, signature workflow, multi-signature flow, audit & compliance model, data models, API, UI, failure prevention, outputs/watermarks). Those documents remain authoritative for **how eCIgn works internally**.

This folder **adds the system-level rule** that **every form submission task in CES must flow through eCIgn**. It defines:

- Submission architecture (CES → form → eCIgn packet → evidence → completion).
- Status models that unify CES form status, eCIgn packet status, signature status, and PM task status.
- Integration contracts with CES events, workflows, evidence storage, and the PM layer.
- Failure modes, end-user flow, and developer notes.

## Hard rules
1. **No parallel form submission system.** Every form-related task routes through eCIgn.
2. **CES is the source of truth for compliance completion.** PM/My Tasks/Kanban/Gantt/Sprint Board are projections only.
3. **PM cannot mark CES tasks done.** Only `eCIgn packet completed + valid evidence + CES validation` can.
4. **Weekend rule.** Compliance/event tasks cannot be scheduled on Sat/Sun without explicit override + reason + audit entry.
5. **Single canonical task ID.** Form submission tasks use the same ID across Event View / My Tasks / Kanban / Gantt / Sprint.

## Index

| # | Document |
|---|---|
| 01 | [eCIgn Form Submission Architecture](01-eCIgn-Form-Submission-Architecture.md) |
| 02 | [eCIgn Data Flow](02-eCIgn-Data-Flow.md) |
| 03 | [eCIgn Evidence Lifecycle](03-eCIgn-Evidence-Lifecycle.md) |
| 04 | [eCIgn Role / Permission Model](04-eCIgn-Role-Permission-Model.md) |
| 05 | [eCIgn Form Status Model](05-eCIgn-Form-Status-Model.md) |
| 06 | [eCIgn Signature Status Model](06-eCIgn-Signature-Status-Model.md) |
| 07 | [eCIgn Audit Trail Model](07-eCIgn-Audit-Trail-Model.md) |
| 08 | [eCIgn Integration with CES](08-eCIgn-Integration-with-CES.md) |
| 09 | [eCIgn Integration with Workflows](09-eCIgn-Integration-with-Workflows.md) |
| 10 | [eCIgn Integration with Events](10-eCIgn-Integration-with-Events.md) |
| 11 | [eCIgn Integration with Evidence Storage](11-eCIgn-Integration-with-Evidence-Storage.md) |
| 12 | [eCIgn Integration with PM Tasks / My Tasks / Kanban / Sprint Board](12-eCIgn-Integration-with-PM-Tasks.md) |
| 13 | [eCIgn Failure Modes and Controls](13-eCIgn-Failure-Modes-and-Controls.md) |
| 14 | [eCIgn End User Flow](14-eCIgn-End-User-Flow.md) |
| 15 | [eCIgn Developer Implementation Notes](15-eCIgn-Developer-Implementation-Notes.md) |

## Cross-references
- Existing eCIgn engine docs: [Builder/eCIgn/](../eCIgn/)
- CES execution docs: [Builder/Compliance-Execution-Sprints/](../Compliance-Execution-Sprints/)
- PM layer docs (architecture-only): [Builder/Compliance-Execution-Sprints/PM-*.md](../Compliance-Execution-Sprints/)
- AWS evidence storage: [Builder/AWS-Architecture/](../AWS-Architecture/)
