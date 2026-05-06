# CES Event Instance Dataflow — Documentation Package

This folder contains **complete system documentation**, an **end-user manual**, and **knowledge base articles** for the Compliance Execution System (CES) **Event Instance Dataflow**: how regulatory events become executable instances with tasks, forms, evidence, approvals, audit trails, and CES-visible execution units.

## Audience

| Document | Primary audience |
|----------|------------------|
| [CES-EVENT-INSTANCE-SYSTEM-DOCUMENTATION.md](./CES-EVENT-INSTANCE-SYSTEM-DOCUMENTATION.md) | Engineers, architects, compliance/IT integrators |
| [CES-EVENT-INSTANCE-END-USER-MANUAL.md](./CES-EVENT-INSTANCE-END-USER-MANUAL.md) | DON, compliance officers, QAPI leads, clinicians, admins |
| [knowledge-base/KB-INDEX.md](./knowledge-base/KB-INDEX.md) | Anyone needing quick answers or deep dives by topic |

## Related material

- AWS production mapping (persistence, API, security): `Builder/Documentations/AWS-CES/`
- Event dataflow validation: `npm run validate:event-dataflow`
- AWS mapping validation: `npm run validate:aws-ces-mapping`
- **Performance & sprint/month scoping (Kanban, Gantt, CES board, My Tasks):** [PERFORMANCE-AND-SPRINT-SCOPING.md](./PERFORMANCE-AND-SPRINT-SCOPING.md)

## Quick glossary

- **RegulatoryEvent** — Canonical **parent/source** event from the regulatory calendar dataset (id, date, workflow, required forms, process flow, approvals, policy refs).
- **EventInstance** — The **occurrence** record for execution: stable `eventId`, schedule, status, lock/certification, folder path, optional certification snapshot.
- **EventTask** — Work item under an instance: stable `taskSourceId`, status, required flags, links to policies/forms/workflow, evidence rollups.
- **EventExecutionDataflow** — Single merged **read package** per source event for UI and CES (from `buildEventExecutionDataflow` / `useEventExecutionDataflow`).
- **CES** — Read/projection layer; execution units on the board trace back to event/task/evidence via the dataflow, not a separate business store.

## Document map

1. Read **KB-INDEX** for topic-based navigation.
2. Operators: **END-USER-MANUAL** + relevant KB articles.
3. Implementers: **SYSTEM-DOCUMENTATION** first, then source under `src/policy/compliance-execution/` and `src/policy/stores/regulatoryExecutionStore.ts`.
