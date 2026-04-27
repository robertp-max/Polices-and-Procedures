# 04 — Assignment Model

## 1. Assignment Mandate

> **No execution unit may exist without an explicitly named Owner, Role, and (where required) Approver and Signature owner.**

A sprint cannot open if any execution unit is unassigned. This is enforced at sprint-open in `10-Enforcement-and-Rules.md`.

---

## 2. The Four Assignment Slots

Every execution unit carries four explicit assignment slots:

| Slot | Required | Definition |
|---|---|---|
| **Owner** | Always | The single named individual accountable for the unit completing on time and to standard. One person, never a group. |
| **Role** | Always | The functional role the work is being performed under (e.g., `QAPI Lead`, `Clinical Manager`, `Compliance Officer`, `Administrator`). Pulled from the workflow's `roles.primary`. |
| **Approver** | When applicable | The individual who reviews/approves the artifact before it leaves Review phase. Must be a different person than the Owner. |
| **Signature owner** | When the workflow requires a signature | The individual whose eCIgn signature is required to advance from Signature phase to Audit phase. May coincide with Approver but must be explicitly recorded. |

Each slot is recorded as **named individual + role**, never role-only.

---

## 3. Source of Assignments

Assignments are derived from:

| Source | Slot |
|---|---|
| `workflow.roles.primary[0]` | Default Owner Role |
| `workflow.roles.approval[0]` | Default Approver Role |
| `event.approvals[].approverRole` | Signature owner Role |
| Agency Operating Roster | Resolves Role → named individual |

The named individual is resolved at sprint-open via the Agency Operating Roster (kept current under `HR-FM-007` New Hire Onboarding & Orientation Checklist + ongoing roster maintenance). If the roster has no current incumbent for a required role, the unit is **blocked** and escalates immediately to the Administrator.

---

## 4. Assignment Rules

| # | Rule |
|---|---|
| R1 | An execution unit has **exactly one** Owner. |
| R2 | An Owner cannot also be the Approver of the same unit. |
| R3 | A Signature owner may also be the Approver, but must be explicitly recorded as the Signature owner. |
| R4 | An Owner cannot be assigned more execution units than their published per-sprint capacity (see `11-Metrics-and-Reporting.md`). Capacity overruns require Compliance Officer reassignment. |
| R5 | Owners may not reassign themselves. Reassignment requires the workflow Owner (per `workflows.generated.ts`) plus the Compliance Officer. |
| R6 | When an Owner is unavailable (PTO, leave), their backup is a pre-named role on the Operating Roster. Backups inherit the unit at sprint-open if availability flags indicate so. |

---

## 5. Signature Responsibility — Explicit Mapping

Signature responsibility is recorded **per artifact**:

| Artifact | Required Signers (per current event model) |
|---|---|
| QAPI Quarterly Minutes (`QA-FM-024`) | Administrator, Clinical Manager, QAPI Committee Chair |
| QAPI Annual Report (`QA-FM-029`) | Administrator, Board Chair |
| Annual Compliance Report (`CO-FM-012`) | Administrator, Board Chair |
| P&P Library Approval (`CO-FM-PP-004`) | Board Chair |
| Biennial Risk Reassessment | Administrator, Board Chair |
| Biennial Policy Framework Re-Baseline | Administrator, Board Chair, All Domain Leads |
| Biennial Workforce Competency Validation | Administrator, Clinical Manager, HR Lead, Compliance Officer |
| Biennial Compliance Effectiveness | Administrator, Board Chair |
| Annual OIG Work Plan Review | Administrator |
| Triennial Comprehensive Evaluation | Administrator, Board Chair |
| Triennial External Independent Review | Administrator, Board Chair |
| Triennial Strategic Effectiveness | Administrator, Board Chair |

Each signer is named, not role-only, when the unit is loaded into a sprint.

---

## 6. Roles Recognized By The System

| Role | Source | Typical Domains |
|---|---|---|
| Administrator | GV-GB-001 | All |
| Compliance Officer | CO-CP-001 | Compliance, Risk, Governance |
| Clinical Manager | 42 CFR § 484.105(d) | Clinical, QAPI, Aide oversight |
| QAPI Lead | QA-PG-001 | QAPI |
| Infection Control Nurse | CL-IC-001 | Infection Control |
| HR Lead | HR-TA-* policies | Workforce |
| IT/Security Lead | IT-* policies | IT/Security |
| Billing Lead | FN-* policies | Finance |
| Board Chair | GV-GB-001 | Board-level signatures |
| QAPI Committee Chair | QA-PG-001 | QAPI minutes signature |
| Domain Lead | per domain | Policy attestations |

Any role appearing in workflow `roles.primary`, `roles.supporting`, `roles.approval`, or in event `approvals[].approverRole` must resolve to a named individual on the Operating Roster before the unit can advance from Preparation.

---

## 7. Forbidden Assignment Patterns

| Pattern | Why Forbidden |
|---|---|
| Group assignment ("Clinical Team") | No individual accountability. |
| "TBD" or "Unassigned" at sprint open | Violates R1 + sprint-open gate. |
| Self-assignment | Violates R5. |
| Same person Owner + Approver | Violates R2. |
| Approver signing without prior Owner completion | Breaks sequence; surveyors look for the Owner-then-Approver evidence chain. |
