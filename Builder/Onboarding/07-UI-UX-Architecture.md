# 07 — UI / UX Architecture (Conceptual)

## Purpose

Define the conceptual UI architecture for onboarding. The detailed visual specification lives in doc 12. This document specifies **what surfaces exist, what they show, and how they relate**. UI must remain consistent with Command Center + CES.

---

## 1. Design Principles

1. **Single workspace**: Onboarding screens live inside the Command Center shell — same chrome, same nav, same auth, same theme.
2. **Workflow-first, not wizard-first**: No linear stepper. Surfaces show real work, real states, real evidence.
3. **Compliance-visible**: Every screen makes the compliance state explicit (gates, deadlines, evidence, signatures).
4. **Audit-defensible at first glance**: Anything a surveyor would ask is one click away.
5. **Premium enterprise**: White workspace, navy/orange accents, strong whitespace, no playful UI, no checklist UI.

---

## 2. Information Architecture

```
Command Center
├── Compliance Calendar
├── Sprint Board (CES)
├── Audit Mode
└── Onboarding
    ├── 1. Onboarding Dashboard
    ├── 2. Role-Based Activation Screen
    ├── 3. Onboarding Execution Batch View
    ├── 4. Evidence & Forms Panel        (modal/drawer over batch view)
    ├── 5. Competency Validation View    (modal/drawer or full screen)
    ├── 6. Signature / Acknowledgment View (eCIgn embedded)
    └── 7. Audit Readiness View           (per-subject dossier)
```

Each onboarding surface deep-links to/from CES Sprint Board, Compliance Calendar, and Audit Mode.

---

## 3. Surface 1 — Onboarding Dashboard

**Purpose**: Operational overview of all onboarding activity.

**Primary regions**:
- Header KPIs: Active Batches | Pending Activation | At Risk | Blocked | Awaiting Signature | Awaiting Evidence | Completed (this period)
- Readiness contribution: gauge showing onboarding's contribution to agency readiness score
- Live feed: recent state transitions (newest first)
- Lists (tabbed): New Hires | Role Changes | Reactivations | Revalidations | Vendors | Governance
- Filters: domain, role, owner, sprint, due window, risk

**Compliance signals visible**:
- Hard-gate violations counter (red)
- Override-active counter (amber)
- Overdue revalidations counter

---

## 4. Surface 2 — Role-Based Activation Screen

**Purpose**: Initiate onboarding for a subject by selecting role(s) and trigger.

**Primary regions**:
- Subject card (workforce member or vendor)
- Trigger selector (New Hire / Role Change / Reactivation / Vendor / Governance Appointment)
- Role selector (multi, with domain context)
- Effective date
- Scope (service line, branch, patient population)
- Template preview (read-only): the template that will be applied (version, requirement count, expected SLA)
- Reconciliation preview: which requirements will be suppressed due to existing valid evidence
- Activate button → emits trigger to engine; navigates to the resulting Batch View

This screen is **not** a wizard. It is a single-page activation form with explicit consequence preview.

---

## 5. Surface 3 — Onboarding Execution Batch View

**Purpose**: The single source of truth for one batch.

**Primary regions**:
- Batch header: subject, role(s), template version, trigger, status, owner, due date, readiness contribution
- Gate strip: pre-field / pre-billing / pre-system-access gate states with pass/fail/pending
- Unit list grouped by phase: Pre-Hire → Orientation → Training → Competency → Acknowledgments → Clearance → Post-Activation
  - Each row: unit name, workflow, due, status, evidence count, signature status, owner, last action
- Side panel: Audit timeline for the batch (append-only events)
- Actions: Open unit, Open evidence, Open signature, Override (gated), Withdraw (gated)

**Compliance signals**:
- Each unit shows policy linkage (hover → policy + version)
- Blocked units show the gate they fail
- Overrides are visually distinct and time-bounded

The batch view also surfaces in the **CES Sprint Board** as a bundle pill — clicking the pill opens this same view.

---

## 6. Surface 4 — Evidence & Forms Panel

**Purpose**: Capture, view, and validate evidence objects for a unit.

**Primary regions**:
- Required evidence list (schema-driven)
- Capture controls per evidence type (form embed, file upload, system-pulled record)
- Validation status per object (schema, content checks)
- History: prior versions, rejection reasons
- Linked policy version (immutable hash visible)

**Behavior**:
- Forms render via the Forms library (no inline form authoring).
- File uploads checked for size, type, OCR-ability where required.
- On valid capture, evidence binds to subject + unit + batch + policy version with content hash.

---

## 7. Surface 5 — Competency Validation View

**Purpose**: Execute and record competency validation for a clinical role.

**Primary regions**:
- Skill list (structured, per workflow)
- Per-skill: pass/fail/needs remediation, observer notes, attempt counter
- Observer identity (auto-resolved; signature captured via eCIgn)
- Subject identity (signature captured via eCIgn)
- Setting (patient / simulated)
- Result summary with pass criteria
- Remediation sub-batch link if Failed

**Behavior**:
- Cannot save partial completion as Completed.
- Failure auto-emits a remediation unit and keeps Field Clearance Blocked.
- Completion writes a structured evidence object plus dual signatures.

---

## 8. Surface 6 — Signature / Acknowledgment View

**Purpose**: Capture eCIgn signatures bound to policy versions or evidence objects.

**Primary regions**:
- Document viewer (the policy version or evidence artifact being signed)
- Signer identity strip (current signer + remaining signers in multi-sig)
- Acknowledgment language (per policy)
- Sign button → eCIgn flow per eCIgn doc 02 / 09
- Result: signed artifact preview with watermark + hash + timestamp

**Behavior**:
- Single-signer path for individual acknowledgments.
- Multi-signer path for BAA, appointments, overrides (per eCIgn doc 09).
- On completion, callback to onboarding engine moves the unit forward.

---

## 9. Surface 7 — Audit Readiness View (Per-Subject Dossier)

**Purpose**: One-click answer to surveyor questions about a specific person.

**Primary regions**:
- Subject card + roles + scope timeline (history of role assignments)
- Active credentials with expiry windows
- Policy acknowledgment ledger (policy, version, signed at, signer, link to artifact)
- Competency history (with attempts and observers)
- Training history (with content hash and duration)
- Evidence dossier (filterable by date, policy, requirement)
- Gates timeline: when field/billing/system-access clearance was granted/revoked, and by whom
- Overrides ledger (with reason, validity, signers)
- Export: signed PDF dossier (watermarked) for surveyor delivery

This view is reachable from:
- Onboarding Dashboard (subject row)
- Audit Mode (subject pivot)
- Sprint Board (clicking subject chip on a unit)

---

## 10. Cross-Surface Behaviors

- **Deep linking**: Every batch, unit, evidence object, signature, and audit event has a stable URL.
- **Permissions**: Surfaced actions respect CES role model (Compliance Officer, Administrator, Clinical Manager, Assignee, Read-only auditor).
- **Notifications**: All escalations surface in the Command Center notification center; never email-only.
- **Search**: Global search includes subjects, batches, units, evidence, policies, signatures.
- **No empty states without action**: Every empty list has a primary CTA aligned with compliance intent.

---

## 11. What This UI Does Not Do

- No multi-step wizard for onboarding.
- No "complete" buttons that bypass evidence/signature.
- No generic checklist UI.
- No standalone calendar (Compliance Calendar is the only calendar).
- No standalone task list (Sprint Board is the only task surface).
- No playful illustrations, mascots, or progress confetti.
