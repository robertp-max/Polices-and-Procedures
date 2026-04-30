# POLICY CL-DC-101 — CLINICAL DOCUMENTATION INTEGRITY & AUTHENTICITY

| Field | Value |
| :---- | :---- |
| Policy ID | CL-DC-101 |
| Policy Title | Clinical Documentation Integrity & Authenticity |
| Domain | CL — Clinical Operations |
| Subdomain | DC — Documentation & Clinical Records |
| Classification Tier | REQUIRED |
| Version | 1.0 |
| Effective Date | 2026-04-29 |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing / Compliance Officer |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Regulatory Tags | 42 CFR § 484.110, 42 CFR § 484.55, FCA, HIPAA, OIG HHA Guidance |

---

## 1. PURPOSE

This policy establishes the agency's mandatory standards for clinical documentation integrity, prohibiting copy/paste misuse, unsupported templated documentation, and any clinical entry not reflecting an actual patient encounter. It defines clinician attestation requirements, documentation audit triggers, AI-assisted documentation controls, and the linkage between documentation fraud and the agency's Fraud, Waste & Abuse program (CO-FW-101).

---

## 2. SCOPE

Applies to all clinical documentation in any modality (EHR, paper, voice-to-text, AI-assisted) created by RNs, LVNs, PT/PTA, OT/COTA, SLP, MSW, HHA, and any contracted clinician on behalf of Care Indeed Home Health Care, Inc.

---

## 3. POLICY STATEMENTS

3.1 All clinical documentation shall reflect care actually performed during a documented patient encounter. Documentation of services not rendered is prohibited and shall be treated as potential False Claims Act violation per CO-FW-101 and CO-FA-002.

3.2 **Copy/Paste Restrictions.** Copy-forward of prior visit notes, narratives, or assessments is prohibited except for objective, time-invariant elements (e.g., demographics, medical history, baseline allergies). All copy-forwarded content shall be (a) visually flagged in the EHR, (b) re-validated by the documenting clinician, and (c) updated to reflect the current encounter. Wholesale duplication of subjective assessment, vital signs, response to treatment, or skilled need narrative is expressly prohibited.

3.3 **Templated Documentation.** Templates and SmartText / structured-narrative shortcuts shall not be used without patient-specific validation. Each template-driven note shall be reviewed and edited to reflect the individual patient's status; clinical phrases that read identically across multiple patients on the same date are a per-se audit trigger.

3.4 **Clinician Attestation.** Every clinical note shall be electronically signed by the documenting clinician with a digital attestation: "I attest that this documentation reflects services I personally performed during a patient encounter on the date and time recorded." The attestation event shall be captured as `event_id = clinical.note.attest`.

3.5 **Late Entries & Amendments.** Late entries (>24 hours after the encounter) shall be expressly marked "Late Entry," include the date of service and the date of entry, and provide rationale. Amendments to signed notes shall be performed via the EHR amendment function, never by overwriting; both prior and current values shall be preserved.

3.6 **AI-Assisted Documentation.** Use of generative-AI scribing, summarization, or auto-population is permitted only where: (a) the AI tool has been approved by the AI Governance Committee per CO-AI-101; (b) the clinician personally reviews, edits, and attests to every AI-generated entry; (c) every AI-assisted note carries an `ai_assist_flag = true` and the model/version identifier in the audit log; (d) PHI handling complies with CO-HP-101 and the executed BAA. AI may never be used to fabricate clinical findings, ROM/strength values, vital signs, or skilled need narrative.

3.7 **Documentation Audit Triggers.** Mandatory documentation audit shall be initiated upon any of: (a) two or more notes on the same date with substantially identical narrative; (b) clinician productivity exceeding 10 visits/day with full narrative completion under 5 minutes/visit; (c) third-party billing pattern flag; (d) patient/caregiver complaint regarding visit occurrence; (e) OASIS audit finding of unsupported items; (f) HHVBP-impacting outcome anomaly.

3.8 **Sanctions.** Confirmed documentation fraud is a Class-1 sanctionable event subject to immediate disciplinary action up to and including termination, exclusion-list reporting, professional licensing-board referral, and law-enforcement referral as appropriate.

3.9 **Workflow Enforcement & Evidence Clause (Mandatory).** Execution of this policy shall generate auditable evidence within the system. All actions must be recorded with `policy_id`, `workflow_id`, and `event_id`. Actions not supported by system-generated evidence shall be considered non-compliant.

---

## 4. DEFINITIONS

| Term | Definition |
| :---- | :---- |
| Documentation Integrity | The accuracy, completeness, consistency, and authenticity of clinical entries in the medical record. |
| Copy-Forward / Copy-Paste | The replication of prior textual content into a current note. |
| Templated Documentation | Use of structured templates, SmartText, or pre-built phrases as the primary content of a note. |
| Clinician Attestation | The clinician's electronic signature affirming that the note accurately reflects the encounter. |
| AI-Assisted Documentation | Any clinical note in which a generative or summarization AI tool produced ≥ 10% of the textual content. |

---

## 5. PROCEDURES

### 5.1 Encounter Documentation

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.1.1 | Visit Clinician | Document the visit in the EHR contemporaneously, capturing GPS-stamped visit start/end (where supported), patient-specific assessment, skilled interventions, response, and care coordination. | At point of care; signed within 24 hours. |
| 5.1.2 | Visit Clinician | Apply electronic signature with attestation. (`event_id = clinical.note.attest`). | Within 24 hours. |

### 5.2 Copy-Forward Controls

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.2.1 | EHR Administrator | Configure EHR to (a) visually mark copy-forwarded text; (b) log the source note ID and percentage forwarded; (c) require explicit per-section confirmation. | Continuous. |
| 5.2.2 | QAPI Director | Run weekly copy-forward exception report; investigate notes with >40% copy-forward score. | Weekly. |

### 5.3 Audit & Investigation

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.3.1 | QAPI / Compliance | On any audit trigger (§3.7), open documentation integrity investigation; capture as `workflow_id = doc.integrity.investigation`. | Within 5 business days of trigger. |
| 5.3.2 | Compliance Officer | If fraud is substantiated, escalate to CO-FW-101 investigation; sanction per HR-ER-002; quantify overpayment per CO-FA-002 60-day rule. | Per CO-FW-101 timeframes. |

### 5.4 AI Governance Coordination

Per CO-AI-101: any AI-assisted documentation tool must be enrolled in the AI Tool Registry, BAA-covered, model-version-pinned, and reviewed quarterly for hallucination, bias, and PHI leakage. Clinicians may not bypass the registered tool list.

---

## 6. EVIDENCE & TRACEABILITY (per EN-WF-101)

Every clinical note creation, edit, attestation, copy-forward action, AI-assist event, late entry, and amendment shall persist to the Evidence Repository with: `policy_id = CL-DC-101`, `workflow_id`, `event_id`, `patient_id`, `episode_id`, `visit_id`, `user_id`, `clinician_role`, `timestamp`, `device/ip`, `ai_assist_flag`, `ai_model_id` (where applicable), `copy_forward_source_ids`, and `attestation_hash`. Evidence is immutable and surveyor-retrievable.

---

## 7. DOCUMENTATION & RETENTION

| Record | Retention |
| :---- | :---- |
| Clinical visit notes | 7 years post-discharge (42 CFR § 484.110, CA H&S § 123145) |
| Attestation hash log | 7 years |
| Copy-forward audit reports | 7 years |
| AI-assist audit logs | 7 years |
| Documentation integrity investigations | 10 years (CO-FW-101) |

---

## 8. COMPLIANCE MEASUREMENT

| Indicator | Target |
| :---- | :---- |
| Notes signed within 24 hours | ≥ 98% |
| Copy-forward exception investigations resolved | 100% |
| Audit-triggered investigations completed within 30 days | 100% |
| Substantiated documentation fraud per FTE | 0 |
| AI-assisted notes with attestation | 100% |

---

## 9. REGULATORY REFERENCES

- 42 CFR § 484.110 — Clinical Records
- 42 CFR § 484.55 — Comprehensive Assessment
- 42 CFR § 484.60(b) — Plan of Care signed
- 31 U.S.C. §§ 3729–3733 — False Claims Act
- 42 U.S.C. § 1320a-7k(d) — 60-day overpayment rule
- OIG Compliance Program Guidance for HHAs
- AHIMA Ethical Standards for Documentation Integrity

### Cross-Referenced Policies
CL-OA-101, CL-CC-101, CL-CA-001, CO-FW-101, CO-FA-002, CO-AI-101, CO-HP-101, EN-WF-101, HR-TR-101, HR-ER-002.

---

## 10. TRAINING

All clinical staff shall complete documentation-integrity training within 14 calendar days of hire and annually. AI-assisted documentation users shall complete an additional CO-AI-101 module before activation.

---

## 11. CHANGELOG

| Version | Date | Author | Summary |
| :---- | :---- | :---- | :---- |
| 1.0 | 2026-04-29 | Compliance Officer | Initial release. Establishes documentation-integrity controls (copy/paste, templates, AI-assist), attestation, audit triggers, and direct fraud-program linkage to CO-FW-101. |
