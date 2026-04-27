# Compliance Execution Sprint System (CES)
## Documentation Index

This directory contains the canonical system documentation for CES — a
calendar-driven, sequentially-enforced compliance execution model used to run
every regulatory workflow inside the agency on fixed sprint cycles.

CES is **not** a project-management board. It is a **compliance execution
substrate**: every Execution Unit, every state transition, and every closure
event is treated as a regulatory commitment with audit-defensible evidence.

| # | Document | Purpose |
|---|----------|---------|
| 00 | [README](./00-README.md) | This file |
| 01 | [System Overview](./01-System-Overview.md) | What CES is, what it replaces, who operates it |
| 02 | [Architecture and Data Model](./02-Architecture-and-Data-Model.md) | Type system, entity relationships, data ownership |
| 03 | [Sprint Execution Model](./03-Sprint-Execution-Model.md) | 14-day sprint mechanics, anchoring, retrospective |
| 04 | [Workflow and Execution Units](./04-Workflow-and-Execution-Units.md) | Event → Workflow → Execution Unit hierarchy |
| 05 | [Enforcement and Compliance Rules](./05-Enforcement-and-Compliance-Rules.md) | State machine, non-skippable phases, deny matrix |
| 06 | [Calendar Integration](./06-Calendar-Integration.md) | How regulatory anchor dates drive scheduling |
| 07 | [Signature and eCIgn Integration](./07-Signature-and-eCIgn-Integration.md) | Signature roster, escalation, eCIgn handoff |
| 08 | [Audit and Evidence Model](./08-Audit-and-Evidence-Model.md) | Evidence completeness, audit index, surveyor trail |
| 09 | [Metrics and Reporting](./09-Metrics-and-Reporting.md) | KPIs, sprint trends, executive reporting |
| 10 | [Risk and Escalation Model](./10-Risk-and-Escalation-Model.md) | Domain risk, capacity risk, escalation policy |

## Reading Order

- **For executives**: 01 → 03 → 09 → 10
- **For compliance officers**: 01 → 04 → 05 → 07 → 08
- **For engineers**: 02 → 05 → 07 → 08
- **For surveyors / auditors**: 04 → 05 → 07 → 08

## Source-of-Truth Pointers

The implementation lives under [`src/policy/ces/`](../../../src/policy/ces).
When this documentation conflicts with code, **code wins** — file an issue and
update these documents.

| Concept | Implementation |
|---------|----------------|
| Type system | [`src/policy/ces/types.ts`](../../../src/policy/ces/types.ts) |
| Enforcement engine | [`src/policy/ces/hooks/useExecutionEnforcement.ts`](../../../src/policy/ces/hooks/useExecutionEnforcement.ts) |
| Evidence rules | [`src/policy/ces/hooks/useEvidenceTracker.ts`](../../../src/policy/ces/hooks/useEvidenceTracker.ts) |
| Mock dataset | [`src/policy/ces/data/mockSprint.ts`](../../../src/policy/ces/data/mockSprint.ts) |
| UI shell | [`src/policy/ces/layouts/CesLayout.tsx`](../../../src/policy/ces/layouts/CesLayout.tsx) |
