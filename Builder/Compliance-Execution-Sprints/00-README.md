# Compliance Execution Sprint System — README

> **Location:** `Builder/Compliance-Execution-Sprints/`
> **Owner:** Compliance Officer (program owner) + Administrator (executive sponsor)
> **Status:** Authoritative architecture — all execution work in the regulated home-health environment is organized through this system.

---

## 1. Purpose

The **Compliance Execution Sprint System (CES)** organizes all compliance work into structured **2-week execution cycles** so that:

- no compliance deadline is missed
- all work is executed in the proper sequence defined by the workflow engine
- every output is audit-ready and signature-complete
- every work item is explicitly assigned and tracked
- the agency can defend, in real time, that it is operating its mandated programs

This is **not Agile**, **not backlog-driven**, and **does not allow flexible prioritization of compliance work**.
It is a **calendar-driven, sequential, workflow-organized execution system**.

---

## 2. Non-Negotiable Model

| Principle | Statement |
|---|---|
| Source of work | The **regulatory calendar** is the only source of work. Nothing enters a sprint that is not anchored to a scheduled compliance event. |
| Organization | All work is grouped by **Workflow** (e.g., `QA-WF-01` QAPI Quarterly Review, `EN-WF-02` Annual Policy Review). Generic task lists are forbidden. |
| Sequence | Each workflow has a **fixed step order**: Preparation → Documentation → Review → Signature → Audit. The system enforces this order. |
| Assignment | Every execution unit has an **Owner**, a **Role**, an **Approver** (where required), and a **Signature owner** (where required). No unassigned work. |
| Closure | An item is **complete only when** evidence is filed, required signatures are captured, and compliance state transitions to `completed`. |
| Calendar primacy | The sprint adapts to the calendar — the calendar never adapts to the sprint. |

---

## 3. System Boundaries

The CES system **integrates with**, but does **not replace**:

| System | Role | Integration |
|---|---|---|
| Regulatory Calendar (`MANDATED_EVENTS_EXPANDED`, `MULTI_YEAR_EVENTS`) | Source of scheduled work | Drives sprint content (PHASE 8) |
| Workflow Engine (`workflows.generated.ts`) | Defines execution steps | Each work bundle = one workflow instance (PHASE 2) |
| eCIgn Signature Platform | Signature lifecycle | Signature columns and gates (PHASE 5) |
| Compliance Engine (`complianceEngine.ts`) | State transitions | Sprint board states map to compliance states (PHASE 5) |
| Audit Aggregate (`auditAggregate.ts`) | Evidence rollup | Audit-readiness metric (PHASE 10) |

CES is the **execution surface** that ties these together. There is no standalone task system.

---

## 4. Documentation Index

| # | File | Purpose |
|---|---|---|
| 00 | `00-README.md` | This document. |
| 01 | `01-Execution-Model.md` | Calendar-driven + sequential model definition. |
| 02 | `02-Sprint-Structure.md` | 2-week cadence, naming, fixed boundaries. |
| 03 | `03-Workflow-Based-Execution.md` | Event → Workflow → Execution Unit decomposition. |
| 04 | `04-Assignment-Model.md` | Owner / Role / Approver / Signature responsibility. |
| 05 | `05-Work-Bundling-Strategy.md` | Bundling for efficiency; QAPI worked example. |
| 06 | `06-Sprint-Board-and-States.md` | Columns, state mapping, audit readiness. |
| 07 | `07-Recurring-Execution.md` | Mandatory recurring items per sprint. |
| 08 | `08-Monthly-Retrospective.md` | Last-sprint-of-month retrospective rules. |
| 09 | `09-Calendar-Integration.md` | Calendar primacy and sprint adaptation. |
| 10 | `10-Enforcement-and-Rules.md` | Automation, blocking, late-flag, closure gates. |
| 11 | `11-Metrics-and-Reporting.md` | Compliance, on-time, blocked, audit-readiness metrics. |

---

## 5. How To Use

1. **Read in order.** Each file is operationally usable on its own but builds on the prior file's definitions.
2. **Treat as authoritative.** No execution variation may deviate from these rules without a written governance exception.
3. **Trace every change.** Any architectural change is reviewed against `08-Monthly-Retrospective.md` outputs and goes through `EN-LC-001` Policy Lifecycle.
