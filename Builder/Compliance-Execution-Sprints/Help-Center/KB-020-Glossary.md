# KB-020 — Glossary

| Term | Definition |
|---|---|
| **Audit Mode** | The `/audit` page used for survey-readiness review and certification. |
| **Audit Readiness Score** | 0–100 composite score of evidence completeness, signature SLA, and certification status. Target ≥ 85. |
| **Audit Trail** | Tamper-evident, append-only log of every system action on an event or unit. |
| **Audit Workflow** | One of the 32 `workflow_type = 'audit'` workflows that evaluates compliance and feeds QAPI. |
| **Blocked Reason** | One of: `missing_signature`, `missing_form`, `dependency_incomplete`, `awaiting_external_input`. |
| **CAPA** | Corrective Action Plan. Auto-generated remediation workflow triggered by a failed audit. |
| **CES** | Compliance Execution Sprint System. The application you are using. |
| **Compliance State** | Sprint board column: `upcoming`, `ready`, `in_progress`, `awaiting_signature`, `blocked`, `completed`. |
| **Dependency** | An upstream event that must complete before another can start (`dependsOn`) or that this event feeds into (`feeds`). |
| **eCIgn** | The signature platform integrated into CES. |
| **Event ID** | Canonical identifier in format `{eventSubType}-{YYYYMMDD}-{NN}`. |
| **Event Template** | A `TPL-*` definition expanded by the cadence engine into one or more `RegulatoryEvent` instances. |
| **Evidence Center** | The `/evidence` page where all evidence files live. |
| **Execution Unit** | An atomic, owned, dated unit of work. The thing on the board card. |
| **Follow-Up** | A workflow auto-triggered by another event's outcome (typically a CAPA). |
| **Master Controls** | The CTRL-NNN inventory at `/compliance/master-controls`. |
| **R1–R8** | Eight system-generated recurring units that appear in every sprint. |
| **RegulatoryEvent** | A scheduled compliance anchor in `MANDATED_EVENTS_EXPANDED`. |
| **Signature SLA** | The time window in which a signer must sign before escalation. |
| **Sprint** | A 14-day execution window. |
| **Survey Packet** | An exportable, single-event documentation bundle for surveyors. |
| **Workflow** | A defined process with required steps, forms, and signers. |
| **Workflow Phase** | One of: `preparation`, `documentation`, `review`, `signature`, `audit`. Cannot be skipped. |
| **Workflow Type** | Classification: `audit`, `operational`, `enforcement`, `intake`, or `aggregate`. |
