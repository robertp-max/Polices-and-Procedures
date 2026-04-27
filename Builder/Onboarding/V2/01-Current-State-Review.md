# 01 — Current State Review

## Purpose

Document the current onboarding posture and identify the gaps that prevent it from functioning as a compliance enforcement system.

---

## 1. Current Onboarding Structure (As Observed)

The current onboarding flow is effectively a **linear paperwork checklist** centered on HR intake. Typical sequence:

1. HR intake packet (W-4, I-9, direct deposit, EEO).
2. Credential collection (license, CPR, TB, drug screen, BLS).
3. Generic "policy acknowledgment" packet (one bulk signature).
4. Role-agnostic orientation slide deck.
5. Manager-led "shadow days" with no structured competency capture.
6. First field assignment authorized informally by scheduling/intake.
7. Annual "renewal" tracked in spreadsheets and email reminders.

Outputs are stored as scanned PDFs in HR folders, with no link to:

- the originating policy
- the workflow that consumed it
- the audit event it satisfies
- the role-specific obligation it discharges

---

## 2. Structural Gaps

| # | Gap | Compliance Impact |
|---|-----|-------------------|
| G1 | No role-driven requirement generation | Same packet for RN, HHA, Admin — over- and under-coverage |
| G2 | Bulk policy acknowledgment | Cannot prove the user read or understood any specific policy (CL-OA-006 evidence hierarchy fails) |
| G3 | Competency captured as narrative, not validated | No defensible evidence of skill validation per CL/QA policies |
| G4 | No deadline engine | Renewals (license, TB, CPR, in-service hours) drift; tracked in side spreadsheets |
| G5 | No escalation path | Overdue items have no owner, no SLA, no blocker state |
| G6 | No link between onboarding and CES | Onboarding work invisible to Sprint Board, Calendar, Audit Mode |
| G7 | Signatures collected on paper or generic e-sign | Not bound to policy version, role, or evidence object — eCIgn not used |
| G8 | No audit trail per requirement | Cannot answer surveyor question "show me how this employee was qualified to perform this visit on this date" |
| G9 | No reactivation/role-change trigger | LOA returns and role changes re-use stale credentials |
| G10 | No QAPI participation onboarding | QAPI committee members onboarded ad hoc, not tied to QA policies |
| G11 | Vendors/contractors onboarded outside system | BAA, insurance, OIG/SAM exclusion checks inconsistent |
| G12 | Governing Body / Administrator onboarding undocumented | Conflicts with Governing Body Authority & Responsibilities policy |

---

## 3. Duplicated / Redundant Steps

- Identity verification captured 3× (HR packet, credential file, badge issuance).
- Policy acknowledgment captured at hire and again at orientation with no version tracking.
- Competency check items repeated between HR orientation and clinical preceptor.
- TB/health screen recorded in HR file and clinical file separately.

---

## 4. Missing Compliance Controls

- **Pre-field gate**: nothing prevents a clinician from being scheduled before competency is validated.
- **Pre-billing gate**: no enforcement that documentation training (FN-BC-001) is complete before clinician's notes feed billing.
- **Policy version binding**: acknowledgment is not tied to the policy version in force at signing.
- **Exclusion screening**: OIG/SAM/state Medicaid checks not enforced at hire and monthly thereafter.
- **License primary source verification**: relies on copy of license, not state board API/PSV.
- **Orientation evidence**: attendance not cryptographically tied to orientation content version.

---

## 5. Missing Evidence Points

| Required Evidence | Today's State |
|-------------------|---------------|
| Signed, version-bound policy acknowledgment per policy | Missing — bulk only |
| Competency checklist with observer signature + date + skill version | Missing — narrative only |
| Primary source license verification record | Missing — copy of card only |
| Exclusion screening result with timestamp + source | Inconsistent |
| Orientation completion with content hash + duration | Missing |
| Role activation event (who authorized field work, when, on what basis) | Missing |
| Annual revalidation evidence bundle | Missing |

---

## 6. Weak Audit Points

- Cannot produce a per-employee "compliance dossier" on demand.
- Cannot answer "what was this employee qualified to do on date X."
- Cannot show enforcement (i.e., that a non-compliant employee was *prevented* from working).
- Cannot show governing body / administrator qualifications history.
- Cannot link a deficiency in a chart back to a missing onboarding requirement.

---

## 7. Where Onboarding Behaves Like a Checklist (Should Be a Workflow)

| Today (Checklist) | Should Be (Workflow) |
|-------------------|----------------------|
| "Sign policy packet" — single checkbox | Per-policy acknowledgment workflow with version binding, evidence object, eCIgn signature |
| "Complete orientation" — attendance sheet | Orientation execution unit with content version, duration, knowledge check, evidence bundle |
| "Validate skills" — preceptor narrative | Competency workflow with skill list, observer role, signature, retry logic |
| "Renew license annually" — calendar reminder | Recurring CES execution unit with PSV evidence and pre-expiry escalation |
| "Vendor signed BAA" — file in folder | Vendor onboarding workflow with BAA artifact, exclusion check, insurance expiry, recurring revalidation |

---

## 8. Summary of Required Shift

| From | To |
|------|----|
| HR-owned paperwork process | Compliance-owned activation engine |
| Static checklist | Workflow-driven execution units in CES |
| Bulk signatures | Policy-version-bound eCIgn signatures |
| Spreadsheet renewals | Compliance Calendar + recurring CES |
| Manager-judgment competency | Validated, evidenced competency workflows |
| Invisible to surveyors | Per-employee audit-ready dossier on demand |
