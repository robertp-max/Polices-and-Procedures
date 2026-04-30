# POLICY CL-OA-101 — OASIS DATA ACCURACY, VALIDATION & SUBMISSION INTEGRITY

| Field | Value |
| :---- | :---- |
| Policy ID | CL-OA-101 |
| Policy Title | OASIS Data Accuracy, Validation & Submission Integrity |
| Domain | CL — Clinical Operations |
| Subdomain | OA — OASIS Assessment |
| Classification Tier | REQUIRED |
| Version | 1.0 |
| Effective Date | 2026-04-29 |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing / OASIS Coordinator |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2026-04-29 |
| Next Review Date | 2027-04-29 |
| Supersedes | N/A (Initial Version) |
| Regulatory Tags | 42 CFR § 484.45, 42 CFR § 484.55, OASIS-E1, HHVBP, HHQRP, HH PPS |

---

## 1. PURPOSE

This policy establishes mandatory controls governing the collection, reconciliation, validation, correction, and submission of all Outcome and Assessment Information Set (OASIS) data elements for Care Indeed Home Health Care, Inc. The policy ensures that every OASIS-E1 item submitted to CMS through iQIES is (a) supported by contemporaneous, attributable clinical evidence in the patient record; (b) reconciled against the comprehensive assessment, physician orders, and visit documentation; and (c) backed by a system-generated, auditable evidence chain that maps `policy_id → workflow_id → event_id → user_id → timestamp` for every assessment, edit, lock, transmission, correction, and resubmission event. Inaccurate, unsupported, or fabricated OASIS responses materially distort case-mix, payment, HHQRP public reporting, HHVBP scoring, and outcome measurement, and constitute False Claims Act exposure (CO-FW-101).

---

## 2. SCOPE

Applies to:
- All Registered Nurses, Physical Therapists, Occupational Therapists, and Speech-Language Pathologists qualified and authorized to complete OASIS assessments per 42 CFR § 484.55(a)(2).
- The OASIS Coordinator / QAPI Director responsible for pre-submission validation.
- All assessment time points: Start of Care (SOC), Resumption of Care (ROC), Recertification (RECERT), Other Follow-up (OFU), Transfer (TRN), Discharge (DC), and Death at Home.
- All OASIS-E and OASIS-E1 items, including SDOH items, transfer of health information items, and HHVBP-impacting outcome items.

---

## 3. POLICY STATEMENTS

3.1 Every OASIS data element shall be supported by source evidence in the comprehensive assessment, visit notes, physician orders, medication profile, or directly observed patient encounter. Unsupported answers are prohibited and constitute documentation fraud (cross-reference CO-FW-101 and CL-DC-101).

3.2 OASIS items shall be completed by the qualified clinician who performed the in-person assessment, within the regulatory timeframes (SOC: 5 calendar days from SOC date; ROC: within 2 calendar days; RECERT: last 5 days of certification period; DC: within 2 calendar days of knowledge of discharge).

3.3 OASIS responses shall be reconciled against the patient-specific care plan (Plan of Care, CMS-485) and physician orders. Any divergence (e.g., medication reconciliation, functional status, falls risk, depression screen, SDOH) shall be resolved through clinical review prior to assessment lock.

3.4 No OASIS may be transmitted to iQIES until pre-submission validation has been completed and digitally attested by the OASIS Coordinator (or designated reviewer). The validation event shall be recorded with `event_id`, `user_id`, `policy_id = CL-OA-101`, and `workflow_id = oasis.validation`.

3.5 The agency shall conduct a minimum 10% audit sample of all submitted OASIS assessments per quarter, stratified by clinician and assessment type, evaluating: (a) inter-rater reliability; (b) documentation support; (c) HHVBP-impacting items (M1800-series ADLs, M1860 ambulation, M1033 hospitalization risk, M2102 caregiver, GG-items). Sample selection, results, clinician feedback, and corrective actions shall be system-recorded.

3.6 OASIS corrections (modify, inactivate) shall be permitted only in accordance with the CMS OASIS Submissions User Guide and the Correction Policy in Chapter 5 of the OASIS Guidance Manual. Every correction shall capture: original value, corrected value, rationale, supporting evidence reference, requesting clinician, approving reviewer, and timestamp.

3.7 OASIS data shall feed and align with: (a) the comprehensive assessment (CL-CA-001); (b) the Plan of Care; (c) outcome measures reported under HHQRP and HHVBP (QA-VBP-101); (d) discharge planning and transfer of health information; (e) QAPI performance dashboards.

3.8 **Workflow Enforcement & Evidence Clause (Mandatory).** Execution of this policy shall generate auditable evidence within the system. All actions must be recorded with `policy_id`, `workflow_id`, and `event_id`. Actions not supported by system-generated evidence shall be considered non-compliant.

---

## 4. DEFINITIONS

| Term | Definition |
| :---- | :---- |
| OASIS-E1 | The CMS Outcome and Assessment Information Set, version E1, effective January 1, 2025, including SDOH and Transfer of Health Information items. |
| Pre-Submission Validation | The mandatory clinical and technical review of a locked OASIS prior to iQIES transmission. |
| HHVBP-Impacting Item | An OASIS item that contributes to the HHVBP Total Performance Score (TPS) or its underlying claims-based, OASIS-based, or HHCAHPS measures. |
| Inter-Rater Reliability (IRR) | The degree to which two qualified clinicians independently assigned the same response to the same item under the same conditions. |
| Audit Sample | A statistically defensible subset of OASIS records selected for retrospective accuracy review. |

---

## 5. PROCEDURES

### 5.1 Assessment Capture

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.1.1 | Assessing Clinician | Complete OASIS at the patient's residence based on direct observation and patient/caregiver interview. Do not pre-populate from prior episodes. | At the assessment time point. |
| 5.1.2 | Assessing Clinician | Lock the OASIS within the EHR after completion, asserting digital attestation that responses reflect the actual encounter. The system shall record `event_id = oasis.lock`. | Within 24 hours of in-person visit. |
| 5.1.3 | Assessing Clinician | Resolve any system-flagged warnings (skip pattern, logical inconsistency, missing supporting documentation) prior to lock. | Before lock. |

### 5.2 Reconciliation

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.2.1 | Assessing Clinician | Reconcile OASIS responses against: medication reconciliation list, comprehensive assessment, physician orders, hospital discharge summary, and admission packet. | Before lock. |
| 5.2.2 | Clinical Manager | Review SOC/ROC OASIS for clinical congruence with Plan of Care and physician orders. | Within 24 hours of lock. |

### 5.3 Pre-Submission Validation

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.3.1 | OASIS Coordinator | Complete pre-submission validation checklist: ICD-10 sequencing, M-item evidence support, HHVBP-impacting item review, SDOH item completeness, cross-item logic. | Before transmission; within 7 calendar days of OASIS completion. |
| 5.3.2 | OASIS Coordinator | Digitally attest validation (`event_id = oasis.validation`). Return assessments to clinician for correction where evidence is insufficient. | Same business day. |
| 5.3.3 | EDI / iQIES Submitter | Transmit validated OASIS to iQIES; capture submission acknowledgment and Final Validation Report. (`event_id = oasis.transmission`, `event_id = oasis.acknowledgment`). | Within 30 calendar days of M0090 (per 42 CFR § 484.45). |

### 5.4 Audit Sampling

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.4.1 | OASIS Coordinator | Select ≥10% sample per quarter, stratified by clinician and assessment type. | Quarterly. |
| 5.4.2 | OASIS Coordinator | Complete documentation-support audit using the CMS-aligned OASIS Audit Tool. Score each item as Supported, Unsupported, or Cannot Determine. | Within 30 days of quarter close. |
| 5.4.3 | QAPI Director | Trend results; clinician scores below 90% support rate trigger mandatory remediation per HR-TR-101. | Quarterly. |

### 5.5 Correction & Resubmission

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.5.1 | Assessing Clinician / OASIS Coordinator | Identify error; determine eligibility for Modification or Inactivation per CMS OASIS Submissions User Guide. | Upon identification. |
| 5.5.2 | OASIS Coordinator | Document original value, corrected value, source evidence, and rationale; obtain clinician sign-off; submit corrected record. (`event_id = oasis.correction`). | Within 30 calendar days of error identification. |

---

## 6. EVIDENCE & TRACEABILITY (per EN-WF-101)

Every event in the OASIS lifecycle shall be persisted to the Evidence Repository with the following minimum metadata: `policy_id`, `workflow_id` (`oasis.assessment`, `oasis.lock`, `oasis.validation`, `oasis.transmission`, `oasis.correction`, `oasis.audit`), `event_id`, `patient_id`, `episode_id`, `user_id`, `clinician_role`, `timestamp` (UTC, ISO 8601), `ip/device_attribution`, and `source_doc_refs`. Evidence shall be immutable, tamper-evident (hash-chained), and retrievable for a CMS surveyor on demand.

---

## 7. DOCUMENTATION & RETENTION

| Record | Retention | Source |
| :---- | :---- | :---- |
| OASIS submission file (XML) | 7 years (per 42 CFR § 484.110) | iQIES / EHR |
| Final Validation Report | 7 years | iQIES |
| Pre-submission validation attestation | 7 years | Evidence Repository |
| Audit sample worksheets and trend reports | 7 years | QAPI |
| Correction/Inactivation records | 7 years | Evidence Repository |
| Clinician remediation evidence | 7 years (per HR-TR-101) | LMS |

---

## 8. COMPLIANCE MEASUREMENT

| Indicator | Target |
| :---- | :---- |
| OASIS submitted within 30 days of M0090 | ≥ 99% |
| Pre-submission validation completed before transmission | 100% |
| Quarterly audit sample completed (≥10%) | 100% |
| Audit documentation-support rate | ≥ 95% |
| Clinician IRR (kappa) on HHVBP-impacting items | ≥ 0.75 |
| Corrections submitted within 30 days of identification | 100% |

---

## 9. REGULATORY REFERENCES

- 42 CFR § 484.45 — Reporting OASIS Information
- 42 CFR § 484.55 — Comprehensive Assessment of Patients
- 42 CFR § 484.60 — Care Planning, Coordination of Services, and Quality of Care
- CMS OASIS-E1 Guidance Manual (effective 2025-01-01)
- CMS OASIS Submissions User Guide (current version)
- HHQRP Specifications Manual (current)
- HHVBP Final Rule and Technical Specifications

### Cross-Referenced Policies
CL-CA-001, CL-DC-101, CL-CC-101, QA-VBP-101, EN-WF-101, CO-FW-101, HR-TR-101, EN-LC-001.

---

## 10. TRAINING REQUIREMENTS

All OASIS-qualified clinicians shall complete: (a) OASIS-E1 baseline competency within 14 calendar days of assignment; (b) annual OASIS refresher; (c) targeted remediation tied to documented audit deficiencies. Training events shall be tied to LMS evidence per HR-TR-101 and recorded with policy_id/workflow_id/event_id.

---

## 11. VERSION CONTROL & CHANGELOG

| Version | Date | Author | Summary |
| :---- | :---- | :---- | :---- |
| 1.0 | 2026-04-29 | OASIS Coordinator | Initial release. Full enterprise OASIS-E1 governance with workflow enforcement and evidence traceability per EN-WF-101. Establishes pre-submission validation, audit sampling, correction workflow, and HHVBP linkage. |
