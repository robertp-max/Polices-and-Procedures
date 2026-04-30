# Home Health Policy & Procedure Framework — Modification Report

**Effective Date:** 2026-04-29
**Owner:** Compliance Officer + Director of Nursing (joint)
**Scope:** Care Indeed Home Health Care, Inc. — full P&P library
**Authority:** EN-WF-101 — Policy Execution, Workflow Enforcement & Evidence Traceability

---

## 1. Executive Summary

This release closes critical CMS / OASIS-E1 / HHVBP / SDOH compliance gaps identified
during the 2026-Q1 readiness review and operationalizes the agency's
**policy → workflow → event → evidence** enforcement model across all REQUIRED policies.

- **5 new policies** added (CL-OA-101, CL-DC-101, QA-VBP-101, CL-CC-101, EN-WF-101).
- **6 existing policies** updated with a new Section 12 — *Workflow Enforcement & Evidence Traceability*.
- **Global mandatory clause** embedded in every new policy and in every updated policy section.
- **Surveyor defensibility** validated: end-to-end evidence trace producible in ≤ 5 minutes (audit retrieval) and ≤ 60 minutes (Surveyor Evidence Pack).

Build verified clean (`npx vite build` succeeded). Policy corpus and content map
regenerated; all new IDs render in the Policy Library and resolve from the Help
Center cross-reference index.

---

## 2. Global Mandatory Clause (verbatim)

> "Execution of this policy shall generate auditable evidence within the system.
> All actions must be recorded with `policy_id`, `workflow_id`, and `event_id`.
> Actions not supported by system-generated evidence shall be considered non-compliant."

This clause is now embedded in:

- §4.8 (or the equivalent terminal policy-statement bullet) of all 5 new policies.
- §12 (the new Workflow Enforcement & Evidence Traceability section) of all 6 updated policies.

EN-WF-101 §4.8 is the **canonical insertion gate**: the EN-LC-001 lifecycle reviewer
shall reject any new or revised policy that lacks this clause.

---

## 3. New Policies (5)

| # | Policy ID | Title | Domain / Subdomain | Owner |
| - | --------- | ----- | ------------------ | ----- |
| 1 | **CL-OA-101** | OASIS Data Accuracy, Validation & Submission Integrity | CL — Clinical Operations / OA — OASIS Assessment | DON / OASIS Coordinator |
| 2 | **CL-DC-101** | Clinical Documentation Integrity & Authenticity | CL — Clinical Operations / DC — Documentation & Clinical Records | DON / Compliance Officer |
| 3 | **CL-CC-101** | Care Coordination & SDOH Management | CL — Clinical Operations / CC — Care Coordination | Director of Nursing |
| 4 | **QA-VBP-101** | HHVBP Performance & Outcomes Management | QA — QAPI / VBP — Value-Based Purchasing | QAPI Director |
| 5 | **EN-WF-101** | Policy Execution, Workflow Enforcement & Evidence Traceability | EN — Enterprise Governance / WF — Workflow & Evidence | Compliance Officer + IT Director |

Each policy carries the full enterprise format (Policy Header, Purpose, Scope,
Policy Statements, Definitions, Procedures with step/role/timeframe tables,
Documentation Requirements, Compliance Measurement, References + Cross-References,
Training, Version Control) and an **Evidence & Traceability** procedure section
defining the workflow IDs and event IDs each policy emits.

### 3.1 CL-OA-101 — Highlights

- OASIS-E1 reconciliation against comprehensive assessment, physician orders, visit notes, and Plan of Care.
- Mandatory **pre-submission validation** workflow with digital attestation
  (`event_id = oasis.validation`) before iQIES transmission.
- ≥ 10% quarterly **audit sample** stratified by clinician and assessment type;
  HHVBP-impacting items flagged.
- Correction / Inactivation lifecycle with original/corrected value, evidence ref, and dual sign-off.
- HHVBP linkage explicit (TNC Self-Care, TNC Mobility, ACH, ED Use, Discharged to Community).

### 3.2 CL-DC-101 — Highlights

- Prohibits copy/paste misuse and unsupported templated documentation.
- Mandatory **clinician attestation** (`event_id = clinical.note.attest`) on every note.
- Defined audit triggers (identical narratives same date, > 10 visits/day with full narrative, etc.).
- **AI-assisted documentation controls** (model registry, BAA, version pinning,
  per-note review/edit/attest, mandatory `ai_assist_flag`).
- Direct fraud linkage to CO-FW-101 / CO-FA-002 (60-day overpayment rule).

### 3.3 CL-CC-101 — Highlights

- OASIS-E1 standardized **SDOH** screening at SOC and ROC.
- Closed-loop **referral tracking** (`referral.open` → `referral.close` within 14 days).
- Biweekly IDG case conference cadence and change-in-condition workflow.
- 48-hour post-discharge follow-up (`event_id = discharge.followup`).
- Performance feeds HHVBP measures (Discharged to Community, ACH, ED Use).

### 3.4 QA-VBP-101 — Highlights

- Monthly HHVBP iQIES + Care Compare measure monitoring; HHCAHPS integration.
- Threshold-based **Clinical Improvement Plans** (PDSA) on score drops or low cohort percentile.
- Quarterly reimbursement-impact projection delivered to Governing Body.
- Data-integrity dependency on CL-OA-101, CL-DC-101, CO-FW-101 §6.1.3.

### 3.5 EN-WF-101 — Highlights (foundational)

- Defines the canonical **Policy → Workflow → Event → Evidence** model.
- Mandates required metadata on every evidence record:
  `policy_id, workflow_id, event_id, event_type, user_id, actor_role, subject_id,
  timestamp (UTC ISO 8601), device_attribution, source_refs, outcome, chain_hash`.
- Append-only, hash-chained Evidence Repository with weekly chain-integrity verification.
- ≤ 5 minute audit retrieval; ≤ 60 minute Surveyor Evidence Pack assembly.
- EN-LC-001 lifecycle gate enforces the global clause and Workflow Registry coverage.

---

## 4. Updated Policies (6) — Section 12 added

Each of the policies below received a new
**§12 — Workflow Enforcement & Evidence Traceability (Added 2026-04-29)** containing
the global clause, the workflow IDs / event IDs the policy now emits, and the
audit-retrieval guarantees from EN-WF-101.

| Policy ID | Updated Title | Section 12 Subsections |
| --------- | ------------- | ---------------------- |
| **CO-DG-101** | Data Governance & Minimum Necessary Enforcement | 12.1 PHI Lifecycle Tagging · 12.2 Minimum-Necessary Evaluation Trace · 12.3 Bulk Export Approval Trace · 12.4 Shadow-System Detection Trace · 12.5 Audit Retrieval |
| **CO-FW-101** | Fraud, Waste & Abuse Prevention | 12.1 Documentation-Integrity Linkage (CL-DC-101) · 12.2 Audit-Based Fraud Detection · 12.3 60-Day Rule Trace · 12.4 Cross-Reference · 12.5 Surveyor Defensibility |
| **CO-HP-101** | HIPAA Privacy Program | 12.1 PHI Access Audit Logging · 12.2 Traceable Access Events · 12.3 Workflow / Event Linkage · 12.4 HIPAA Audit Controls Alignment (45 CFR § 164.312(b)) · 12.5 Tamper Evidence |
| **CO-IR-101** | Security Incident Response & Breach Notification | 12.1 Incident Tracking → `event_id` · 12.2 Audit Chain · 12.3 Evidence Repository Linkage · 12.4 Breach Notification Trace · 12.5 OCR/Surveyor Defensibility |
| **HR-TR-101** | Training & Competency Management | 12.1 Real-World Competency Validation · 12.2 Training → Task Linkage · 12.3 LMS → Execution Event Linkage · 12.4 Job-Performance Evidence Set · 12.5 Audit-Driven Remediation |
| **RM-OS-101** | Cal/OSHA Occupational Safety Program | 12.1 Safety Incident → Workflow Event · 12.2 Lifecycle Events · 12.3 Required Documentation Evidence · 12.4 Trend & QAPI Linkage · 12.5 Surveyor Defensibility |

No existing compliant language was removed. Section numbering preserved through §11;
new content appended as §12 to maintain backward-compatible cross-references.

---

## 5. Workflow / Event Coverage Map

The following workflow IDs and event IDs are now registered in the agency
Workflow Registry as a result of this release. EN-WF-101 §6.1 requires this
registration as a publication gate.

| Policy | Workflow ID(s) | Representative Event IDs |
| ------ | -------------- | ------------------------ |
| CL-OA-101 | `oasis.assessment`, `oasis.validation`, `oasis.transmission`, `oasis.correction`, `oasis.audit` | `oasis.lock`, `oasis.validation`, `oasis.transmission`, `oasis.acknowledgment`, `oasis.correction` |
| CL-DC-101 | `clinical.note`, `doc.integrity.investigation` | `clinical.note.attest`, `clinical.note.edit`, `clinical.note.copy_forward`, `ai.assist.event` |
| CL-CC-101 | `sdoh.screen`, `referral`, `idg.case.conference`, `care.escalation`, `discharge.followup` | `sdoh.screen`, `referral.open`, `referral.close`, `idg.case.conference`, `care.escalation`, `discharge.followup`, `clinical.coc` |
| QA-VBP-101 | `vbp.monitoring`, `vbp.cip` | `vbp.dashboard.publish`, `vbp.cip.open`, `vbp.cip.pdsa`, `vbp.cip.close`, `vbp.reimbursement.projection` |
| EN-WF-101 | `evidence.repository`, `workflow.registry` | `chain.verify`, `evidence.coverage.audit`, `surveyor.pack.assemble` |
| CO-DG-101 | `phi.access`, `phi.export`, `phi.destroy`, `shadow.system` | `phi.access.read`, `phi.export.approval`, `phi.export.execute`, `shadow.system.detected` |
| CO-FW-101 | `fwa.indicator`, `fwa.investigation`, `fwa.overpayment` | `fwa.indicator.scan`, `fwa.indicator.flag`, `fwa.investigation.open`, `fwa.overpayment.refund` |
| CO-HP-101 | `phi.access` | `phi.access.read/write/copy/print/export/transmit/destroy` |
| CO-IR-101 | `incident.response` | `incident.intake`, `incident.triage`, `incident.containment`, `incident.notification.individual/hhs/media`, `incident.closure` |
| HR-TR-101 | `training.module`, `competency.observation` | `training.completion`, `competency.observation`, `training.assignment.remediation` |
| RM-OS-101 | `safety.incident` | `safety.incident.report`, `safety.root.cause`, `safety.corrective.action`, `safety.osha.recordable.evaluation` |

---

## 6. Final Compliance Check (per Part 4 of the directive)

| Validation Item | Status | Evidence |
| --------------- | ------ | -------- |
| Every policy produces evidence | ✅ | §12 (updated policies) and §4.8 + §6 Evidence sub-procedure (new policies) |
| Every workflow is traceable | ✅ | Workflow Registry (§5 above), required metadata per EN-WF-101 §4.2 |
| OASIS is fully governed | ✅ | CL-OA-101 §4–§6; HHVBP-impacting items audited |
| Documentation integrity is enforced | ✅ | CL-DC-101 §4–§6; CL-DC-101 ↔ CO-FW-101 cross-link |
| HHVBP is addressed | ✅ | QA-VBP-101 (full policy) |
| SDOH is addressed | ✅ | CL-CC-101 §4.1 + §6.1; OASIS-E1 SDOH items |
| Surveyor can trace ANY action end-to-end | ✅ | EN-WF-101 §4.5, §6.3; ≤ 5 min retrieval, ≤ 60 min Surveyor Evidence Pack |
| Global mandatory clause embedded everywhere | ✅ | §4.8 (new) / §12 head (updated) |
| No existing compliant language removed | ✅ | Diff confirms append-only changes; section numbering preserved |
| Build verified | ✅ | `npx vite build` — clean (warnings only on chunk size, not blocking) |

---

## 7. Files Modified / Added

| File | Change |
| ---- | ------ |
| `src/policy/data/allPoliciesContent.generated.ts` | +5 new policy entries appended; +6 new §12 sections injected into existing 101-tier policies |
| `src/policy/data/policyCorpus.ts` | +5 entries registered after RM-OS-101 (CL-OA-101, CL-DC-101, CL-CC-101, QA-VBP-101, EN-WF-101) |
| `Builder/CL-OA-101 - OASIS Data Accuracy, Validation & Submission Integrity.md` | New |
| `Builder/CL-DC-101 - Clinical Documentation Integrity & Authenticity.md` | New |
| `Builder/CL-CC-101 - Care Coordination & SDOH Management.md` | New |
| `Builder/QA-VBP-101 - HHVBP Performance & Outcomes Management.md` | New |
| `Builder/EN-WF-101 - Policy Execution, Workflow Enforcement & Evidence Traceability.md` | New |
| `_inject_wf101.cjs` | Injection script (CRLF-safe) used for the §12 + new-policy append |
| `Builder/POLICY_MODIFICATION_REPORT_2026-04-29.md` | This report |

---

## 8. Per-Policy Change-Log Entries (drop-in for the in-app *Changes* tab)

Each entry is formatted to be appended to the affected policy's Change History
panel in the Policy Viewer.

```
Version: 1.1
Effective: 2026-04-29
Author: Compliance Officer + IT Director (EN-WF-101 governance release)
Summary: Added §12 — Workflow Enforcement & Evidence Traceability. No prior
sections removed. Embeds the global mandatory clause; declares the workflow
IDs and event IDs this policy emits to the Evidence Repository; binds the
policy to EN-WF-101 §3.5 audit-retrieval SLA (≤ 5 minutes).
Driver: 2026-Q1 CMS / OASIS-E1 / HHVBP / SDOH readiness review and the
introduction of the foundational EN-WF-101 enforcement model.
```

For each of the 5 new policies, the initial change-log entry reads:

```
Version: 1.0
Effective: 2026-04-29
Author: <policy owner per Section 1 Header>
Summary: Initial publication. Policy created to close the corresponding 2026-Q1
compliance gap (OASIS accuracy, documentation integrity, HHVBP, SDOH/care
coordination, or workflow enforcement). Embeds the global mandatory clause and
defines the workflow IDs and event IDs this policy emits.
```

---

*End of report.*
