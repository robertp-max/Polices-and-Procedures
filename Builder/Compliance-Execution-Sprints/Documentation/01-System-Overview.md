# 01 — System Overview

## 1. Purpose

The Compliance Execution Sprint System (CES) operationalizes regulatory
compliance as **finite, calendar-anchored execution units** processed in fixed
14-day sprints. Every required activity — QAPI committee minutes, governing
body actions, EP drills, HIPAA risk analyses, credential recerts, incident
investigations, retrospective remediations — is materialized as an
**Execution Unit** that flows through a non-skippable workflow toward an
auditable Closed/Completed state.

CES exists because spreadsheet-based compliance calendars and ad-hoc
ticket trackers cannot answer the surveyor question:

> *"Show me the evidence that this control was executed on the date it was
> due, who was responsible, who signed it, and where the artifact lives."*

CES answers that question by construction.

## 2. What CES Replaces

| Replaces | Why it failed |
|----------|--------------|
| Compliance calendars in Excel | No state, no evidence, no enforcement |
| Generic project management (Jira/Asana/Trello) | Allows skipping phases, no signature semantics, no audit index |
| Email-based signature collection | No SLA, no escalation, no roster of record |
| Manual audit binder assembly | Reactive; evidence assembled at survey time, not at execution time |

## 3. Core Vocabulary

CES uses a **deliberately constrained** vocabulary. Project-management
language (task, ticket, card, story, epic) is forbidden in CES surfaces and
documentation.

| Term | Definition |
|------|-----------|
| **Compliance Event** | A regulatory anchor (e.g., "Governing Body Quarterly Meeting"). Has a category and an anchor date. |
| **Workflow** | A required process to satisfy a Compliance Event (e.g., "Governing Body Minutes"). |
| **Execution Unit** | An atomic, owned, dated unit of work executing one slice of a Workflow. The operational object. |
| **Workflow Phase** | The non-skippable sequence: `preparation → documentation → review → signature → audit`. |
| **Compliance State** | The board-level state: `upcoming → ready → in_progress → awaiting_signature → blocked → completed`. |
| **Evidence** | Forms filed, signatures captured, and audit-index entry created. |
| **Audit Readiness** | A per-unit attestation: `not_ready` / `partial` / `ready`. |
| **Sprint** | A 14-day execution window with a defined start, end, and retrospective day. |

## 4. Operating Cadence

```
        Day 1                                        Day 14
        │ Sprint kickoff               Retrospective │
        │   ▼                                  ▼     │
        ├──────────────────────────────────────┼─────┤
                  Execution Window              Retro
```

Every sprint:

1. **Kickoff (Day 1)**: New Execution Units enter `ready`. Carry-over units
   from prior sprint retain state.
2. **Execution (Days 1–13)**: Units traverse the state machine subject to
   enforcement rules.
3. **Retrospective (Day 14)**: Sprint metrics are computed; carry-overs are
   tagged; remediation Execution Units are auto-generated for unmet SLAs.

## 5. Roles

| Role | Responsibility |
|------|---------------|
| **Owner** | Operational responsibility for an Execution Unit. Performs documentation work. |
| **Approver** | Reviews evidence in the `review` phase before signature routing. |
| **Signature Owner** | Holds accountability for collecting required signatures. |
| **Required Signer** | A named individual whose signature is mandated for closure. |
| **Compliance Officer** | Resolves blockers, manages escalations, owns the audit index. |
| **Administrator / Sprint Lead** | Conducts retrospectives; approves carry-over remediation units. |

## 6. System Properties

CES is built around five non-negotiable properties:

1. **Calendar-driven** — every Execution Unit has a regulatory due date,
   anchored to a real Compliance Event date.
2. **Sequential** — Workflow Phases cannot be skipped or rewound.
3. **Evidence-gated** — closure requires forms + signatures + audit index.
4. **Audit-defensible** — every transition is timestamped; every closure
   produces a surveyor-reproducible artifact trail.
5. **Operationally honest** — blocked is blocked, with a reason of record.
   The system refuses to fake completion.

## 7. Out of Scope (Today)

CES does **not** currently:

- Manage policy authoring (handled by Policy Library).
- Manage onboarding/competency (handled by Journey).
- Replace the Forms Library — it consumes it.
- Replace the eCIgn signature service — it integrates with it.
- Generate regulatory submissions — it produces the evidence package
  consumed by submission processes.
