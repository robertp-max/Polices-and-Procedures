# Knowledge Base — CES Event Instance Dataflow

Use this index to jump to focused articles. Articles are **descriptive** of the current application design; production behavior may vary if your tenant enables remote APIs or custom roles.

| ID | Title | Summary |
|----|-------|---------|
| [KB-001](./KB-001-Introduction-and-Glossary.md) | Introduction and glossary | Core terms: RegulatoryEvent, EventInstance, Task, Dataflow, CES. |
| [KB-002](./KB-002-Regulatory-Event-vs-Event-Instance.md) | Regulatory event vs event instance | Why two ids exist and how they relate. |
| [KB-003](./KB-003-Event-IDs-and-Folder-Paths.md) | Event IDs and folder paths | EVT format and logical `/events/...` layout. |
| [KB-004](./KB-004-Tasks-Derivation-and-Stable-Identity.md) | Task derivation and stable identity | processFlow, form, approval, minutes sources; taskSourceId. |
| [KB-005](./KB-005-Required-Tasks-and-Certification-Gates.md) | Required tasks and certification gates | isRequired, cancellation reasons, certification blocking. |
| [KB-006](./KB-006-Evidence-Upload-and-Integrity.md) | Evidence upload and integrity | eventId + taskId binding, checksum, object paths. |
| [KB-007](./KB-007-Forms-and-Form-Instances.md) | Forms and form instances | Required forms tab, generation, satisfaction rollups. |
| [KB-008](./KB-008-Audit-Trail-and-Hash-Chain.md) | Audit trail and hash chain | Entity-level audit events, prev/current hash fields. |
| [KB-009](./KB-009-Audit-Readiness-Score.md) | Audit readiness score | 0–100 composite; where it appears in UI. |
| [KB-010](./KB-010-CES-Board-and-Execution-Units.md) | CES board and execution units | Strict projection from dataflow; traceability fields. |
| [KB-011](./KB-011-State-Machine-and-Auto-Progression.md) | State machine and auto progression | Allowed transitions; evaluateEventState. |
| [KB-012](./KB-012-Troubleshooting-and-FAQ.md) | Troubleshooting and FAQ | Common issues and answers. |

**Parent manuals**

- [End user manual](../CES-EVENT-INSTANCE-END-USER-MANUAL.md)
- [System documentation](../CES-EVENT-INSTANCE-SYSTEM-DOCUMENTATION.md)
