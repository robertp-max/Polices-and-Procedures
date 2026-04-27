# 05 — Workflow and Form Mapping

## Purpose

Map every onboarding requirement to: a workflow, the forms it consumes/produces, the policy it discharges, the evidence it generates, and the signatures it requires.

No generic tasks. Every requirement is workflow-backed.

---

## 1. Mapping Schema

Each row below is a deployable spec:

```
RequirementID │ Role(s) │ Workflow │ Form(s) │ Policy(ies) │ Evidence │ Signature(s) │ Trigger Cadence
```

Workflow IDs use prefix `WF-`, forms `FRM-`, policies use existing IDs (EN-/CL-/CO-/FN-/RM-/HR-/IT-/QA-/OP-).

---

## 2. Universal Workforce Requirements

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| HIPAA workforce training | WF-HIPAA-WORKFORCE | FRM-HIPAA-ACK | IT-HIPAA-PRIVACY; IT-HIPAA-SECURITY | Training record (content hash, score) | Acknowledgment (eCIgn) | Initial + annual |
| Code of Conduct ack | WF-COC-ACK | FRM-COC-ACK | CO-CP-001 | Signed COC bound to version | eCIgn (workforce) | Initial + on republish + annual |
| Acceptable Use Policy | WF-AUP-ACK | FRM-AUP-ACK | IT-AUP | Signed AUP | eCIgn | Initial + on republish |
| Background check | WF-BACKGROUND-CHECK | FRM-BG-AUTH; FRM-BG-RESULT | HR-BG | Vendor result PDF + adjudication | Authorization (eCIgn); HR adjudication signature | Initial + per state cadence |
| OIG/SAM/State exclusion screen | WF-EXCLUSION-SCREEN | FRM-EXCL-RESULT | CO-CP-001 | Result record (source, hash, timestamp) | System attestation | Initial + monthly |
| Emergency Preparedness orientation | WF-EP-ORIENT | FRM-EP-ACK | RM-EP-001 | Training record | eCIgn | Initial + annual |
| Reporting obligations ack | WF-REPORTING-ACK | FRM-REPORT-ACK | CO-CP-001; HR | Signed ack | eCIgn | Initial + annual |

---

## 3. Clinical Workforce (RN / LVN / Therapist)

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| License Primary Source Verification | WF-LICENSE-PSV | FRM-LICENSE-PSV-RESULT | CO-RA-001; HR | PSV record (state board source, timestamp, hash) | System attestation; Compliance officer review (if discrepancy) | Initial + monthly verification + pre-expiry |
| BLS / CPR | WF-BLS-VERIFY | FRM-BLS-CARD | HR; CL | Card image + expiry | eCIgn ack | Initial + per card expiry |
| TB screening | WF-TB-SCREEN | FRM-TB-RESULT | RM-OS-001 (Infection Control) | Result + provider signature | Provider signature; employee ack | Initial + annual |
| Drug screen | WF-DRUG-SCREEN | FRM-DRUG-AUTH; FRM-DRUG-RESULT | HR | Lab result | Authorization ack | Initial + per HR cadence |
| Bloodborne pathogens training | WF-BBP-TRAIN | FRM-BBP-ACK | RM-OS-001 | Training record | eCIgn | Initial + annual |
| OASIS competency (RN) | WF-OASIS-COMPETENCY | FRM-OASIS-COMP | CL; CL-OA-006 | Scored competency artifact | RN signature; Clinical Manager signature | Initial + annual |
| Medication reconciliation competency | WF-MED-RECON-COMP | FRM-MED-RECON | CL | Scored artifact | Observer signature | Initial + annual |
| Wound care competency (if applicable) | WF-WOUND-COMP | FRM-WOUND-COMP | CL | Artifact | Observer signature | Initial + per scope |
| Documentation hierarchy training (CL-OA-006) | WF-DOC-HIERARCHY | FRM-DOC-HIER-ACK | CL-OA-006 | Training + ack | eCIgn | Initial + on republish |
| Field clearance gate | WF-FIELD-CLEARANCE | FRM-FIELD-CLEARANCE | CL; HR | Aggregate clearance record | Compliance Officer or delegate (eCIgn) | Pre-first-visit |

---

## 4. Home Health Aide (HHA)

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| HHA training program / competency exam (CoP §484.80) | WF-HHA-QUALIFY | FRM-HHA-TRAINING-CERT or FRM-HHA-COMPETENCY-EXAM | CL §484.80 | Certificate or exam packet | Trainer/RN signature | Initial |
| HHA 12-subject competency | WF-HHA-COMPETENCY-12 | FRM-HHA-COMP-12 | CL §484.80 | Competency packet covering 12 subject areas, observed in patient or simulated setting | RN observer signature; HHA signature | Initial + every 24 months |
| HHA 12-hour in-service per 12-month period | WF-HHA-INSERVICE-12HR | FRM-HHA-INSERVICE-LOG | CL §484.80 | In-service hours log per subject | RN signature | Recurring (rolling 12 months) |
| HHA supervisory visit cadence (RN) | WF-HHA-SUPERVISION | FRM-HHA-SUPERVISION-VISIT | CL §484.80 | Supervisory visit record | RN signature | Recurring per CoP |

---

## 5. Administrator / Governing Body / Officers

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| Administrator appointment | WF-ADMIN-APPOINTMENT | FRM-ADMIN-APPOINTMENT-LETTER | Governing Body; EN-CM-001 | Appointment letter | GB chair signature; Administrator acceptance (eCIgn) | T+0; on change |
| Governing Body appointment | WF-GB-APPOINTMENT | FRM-GB-APPOINTMENT; FRM-GB-COI | Governing Body | Appointment + COI | GB chair; Member (eCIgn) | T+0; annual COI |
| Compliance Officer appointment | WF-CO-APPOINTMENT | FRM-CO-APPOINTMENT; FRM-CO-CHARTER | CO-CP-001 | Appointment + charter | GB; CO (eCIgn) | T+0; annual workplan |
| Privacy Officer appointment | WF-PRIVACY-APPOINTMENT | FRM-PRIVACY-APPOINTMENT | IT-HIPAA-PRIVACY | Appointment | Administrator; Officer (eCIgn) | T+0; annual |
| Security Officer appointment | WF-SECURITY-APPOINTMENT | FRM-SECURITY-APPOINTMENT | IT-HIPAA-SECURITY | Appointment | Administrator; Officer (eCIgn) | T+0; annual |
| Medical Director appointment | WF-MD-APPOINTMENT | FRM-MD-APPOINTMENT; FRM-MD-AGREEMENT | Governing Body; CL | Appointment + agreement + license PSV | GB; MD (eCIgn) | T+0; annual |
| Delegation of Authority | WF-DELEGATION | FRM-DELEGATION-MATRIX | EN-CM-001 | Delegation matrix | Administrator (eCIgn) | T+30; on change |
| Annual Executive Attestation | WF-EXEC-ATTESTATION | FRM-EXEC-ATTESTATION | CO-CP-001 | Signed attestation | Officers (eCIgn) | Annual |

---

## 6. QAPI Participant

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| QAPI roster onboarding | WF-QAPI-ONBOARD | FRM-QAPI-MEMBER; FRM-QAPI-CONFIDENTIALITY | QA; QAPI charter | Roster entry + confidentiality | Member (eCIgn); QAPI chair | Pre-meeting; annual reaffirm |
| QAPI methodology training | WF-QAPI-METHOD | FRM-QAPI-METHOD-ACK | QA | Training record | eCIgn | Initial |

---

## 7. Office / Admin / Intake / Scheduling / Billing

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| Workforce confidentiality | WF-CONFIDENTIALITY | FRM-CONFIDENTIALITY | HR; IT-HIPAA | Signed confidentiality | eCIgn | Initial |
| Intake SOP | WF-INTAKE-SOP | FRM-INTAKE-SOP-ACK | OP-INTAKE | Training + ack | eCIgn | Initial; on revision |
| Scheduling SOP | WF-SCHED-SOP | FRM-SCHED-SOP-ACK | OP | Training + ack | eCIgn | Initial; on revision |
| Billing SOP (FN-BC-001) | WF-BILLING-SOP | FRM-BILLING-SOP-ACK | FN-BC-001 | Training + ack + competency sample | eCIgn; supervisor signature | Initial; annual |
| Coder credential | WF-CODER-CRED | FRM-CODER-CRED | FN-BC-001 | Credential PSV | System attestation | Initial; per credential expiry |
| Fraud, Waste & Abuse training | WF-FWA-TRAIN | FRM-FWA-ACK | CO-CP-001 | Training + ack | eCIgn | Initial; annual |
| Billing clearance gate | WF-BILLING-CLEARANCE | FRM-BILLING-CLEARANCE | FN-BC-001; CO-CP-001 | Aggregate clearance | Compliance Officer (eCIgn) | Pre-billing-access |

---

## 8. Vendor / Contractor

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| Vendor intake | WF-VENDOR-INTAKE | FRM-VENDOR-INTAKE | CO-CP-001; Vendor Mgmt | Intake record | Vendor (eCIgn) | Pre-engagement |
| BAA execution | WF-BAA-EXECUTE | FRM-BAA | IT-HIPAA-PRIVACY; IT-HIPAA-SECURITY | Signed BAA (version-bound) | Vendor + Privacy Officer (multi-sig eCIgn) | Pre-PHI-access; on republish |
| Insurance COI | WF-VENDOR-INSURANCE | FRM-INSURANCE-COI | Vendor Mgmt | COI PDF | System attestation; Compliance review | Pre-engagement; per COI expiry |
| OIG/SAM/State exclusion (vendor) | WF-VENDOR-EXCLUSION | FRM-EXCL-RESULT | CO-CP-001 | Result record | System attestation | Pre-engagement; monthly |
| Vendor HIPAA training (if PHI access) | WF-VENDOR-HIPAA | FRM-VENDOR-HIPAA-ACK | IT-HIPAA | Training record | eCIgn | Pre-engagement |

---

## 9. Volunteer / Student

| Requirement | Workflow | Forms | Policies | Evidence | Signatures | Cadence |
|-------------|----------|-------|----------|----------|------------|---------|
| Volunteer agreement | WF-VOLUNTEER-AGREEMENT | FRM-VOLUNTEER-AGREEMENT | HR | Signed agreement | eCIgn | Initial |
| Confidentiality / HIPAA workforce | WF-HIPAA-WORKFORCE | FRM-HIPAA-ACK | IT-HIPAA | Training + ack | eCIgn | Initial |
| Supervision plan | WF-SUPERVISION-PLAN | FRM-SUPERVISION-PLAN | CL; HR | Plan record | Supervisor (eCIgn) | Initial |

---

## 10. Form Authoring Conventions

All forms in the onboarding mapping must:

- Have a versioned form schema (`form_id`, `version`, `effective_from/to`).
- Bind to a specific policy version when used as an acknowledgment vehicle.
- Produce a structured evidence object (not just a PDF).
- Capture: subject, role, unit_id, batch_id, policy_version, content_hash.
- Render through the existing Forms library; no inline ad hoc forms.

---

## 11. Workflow Authoring Conventions

All workflows referenced here must:

- Be defined in the Workflows library with explicit steps, owners, SLAs.
- Emit lifecycle events that the onboarding engine consumes (Started, EvidenceCaptured, SignatureRequested, SignatureCompleted, Failed, Completed).
- Be replayable for audit reconstruction.
- Be versioned. A new workflow version starts a new template version that propagates via doc 03 §3.2.

---

## 12. Coverage Audit

A coverage audit script must verify, at build time, that:

- Every `RoleRequirement` in doc 02 has a row in this mapping.
- Every workflow referenced exists in the Workflows library.
- Every form referenced exists in the Forms library.
- Every policy referenced exists in the Policies library at a published version.
- No requirement is satisfied by "checkbox-only" — every row has at least one evidence object and (where required) at least one signature.

This script must run in CI and block deploys that break coverage.
