# POLICY QA-VBP-101 — HHVBP PERFORMANCE & OUTCOMES MANAGEMENT

| Field | Value |
| :---- | :---- |
| Policy ID | QA-VBP-101 |
| Policy Title | HHVBP Performance & Outcomes Management |
| Domain | QA — Quality Assurance & Performance Improvement |
| Subdomain | VBP — Value-Based Purchasing |
| Classification Tier | REQUIRED |
| Version | 1.0 |
| Effective Date | 2026-04-29 |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | QAPI Director |
| Approved By | Governing Body Chair |
| Regulatory Tags | HHVBP, HHQRP, 42 CFR § 484.65, 42 CFR § 484.245, 42 CFR § 484.345 |

---

## 1. PURPOSE

This policy operationalizes the agency's compliance with the expanded Home Health Value-Based Purchasing (HHVBP) Model under 42 CFR Part 484, Subpart F, integrating performance measurement, monitoring, corrective action, and reimbursement-impact governance with the QAPI program (QA-PG-001/002). It ensures that every measure component contributing to the agency's Total Performance Score (TPS) — OASIS-based, claims-based, and HHCAHPS — is monitored, defended with evidence, and actively improved.

---

## 2. SCOPE

Applies to all clinical, administrative, billing, and patient-experience operations contributing to HHVBP-impacting measures, including but not limited to: TNC Self-Care, TNC Mobility, Discharged to Community, Acute Care Hospitalization (ACH) within first 60 days, Emergency Department Use without Hospitalization (ED Use), HHCAHPS composite measures, and any future CMS-published HHVBP measure.

---

## 3. POLICY STATEMENTS

3.1 The agency shall maintain an HHVBP Performance Program that monitors all CMS-published HHVBP measures monthly using interim Care Compare and HHVBP iQIES Performance Reports.

3.2 Patient experience (HHCAHPS) shall be monitored using the contracted CAHPS vendor's monthly composite reports and integrated into QAPI per QA-PG-002.

3.3 Performance score thresholds shall trigger mandatory corrective action: (a) any measure dropping ≥ 10 percentile points quarter-over-quarter; (b) any measure below the cohort 25th percentile for two consecutive quarters; (c) projected TPS in the bottom payment-adjustment band.

3.4 HHVBP performance shall be a standing agenda item at QAPI Committee (monthly), Compliance Committee (quarterly), and Governing Body (quarterly) meetings.

3.5 Reimbursement-impact projections (estimated payment adjustment based on rolling TPS) shall be calculated quarterly by Finance in coordination with QAPI and reported to the Governing Body.

3.6 Clinical Improvement Plans (CIPs) for under-performing measures shall be developed using PDSA methodology, assigned an accountable owner, and tracked to closure with evidence.

3.7 Underlying data integrity (OASIS, claims, HHCAHPS) shall be governed by CL-OA-101, CL-DC-101, and the agency's billing accuracy program (CO-FW-101 §6.1.3).

3.8 **Workflow Enforcement & Evidence Clause (Mandatory).** Execution of this policy shall generate auditable evidence within the system. All actions must be recorded with `policy_id`, `workflow_id`, and `event_id`. Actions not supported by system-generated evidence shall be considered non-compliant.

---

## 4. DEFINITIONS

| Term | Definition |
| :---- | :---- |
| HHVBP | Home Health Value-Based Purchasing Model — CMS payment model adjusting Medicare fee-for-service payments based on quality performance. |
| TPS | Total Performance Score — composite weighted score across HHVBP measures driving the annual payment adjustment. |
| Achievement Threshold | The median of national performance during the baseline year for a measure. |
| Benchmark | The mean of the top decile of national performance during the baseline year. |
| HHCAHPS | Home Health Consumer Assessment of Healthcare Providers and Systems — patient experience survey. |
| Clinical Improvement Plan (CIP) | A QAPI-aligned, PDSA-structured plan to improve a specific measure. |

---

## 5. PROCEDURES

### 5.1 Measure Monitoring

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.1.1 | QAPI Director | Pull monthly HHVBP iQIES Performance Report and Care Compare measure refresh; reconcile with internal claims/OASIS extracts. | Monthly. |
| 5.1.2 | QAPI Director | Update HHVBP Dashboard (achievement / improvement / TPS projection) and post to QAPI Committee. (`event_id = vbp.dashboard.publish`). | Monthly. |
| 5.1.3 | CAHPS Vendor + QAPI | Receive HHCAHPS composite data; integrate into dashboard. | Monthly. |

### 5.2 Threshold Detection & Corrective Action

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.2.1 | QAPI Director | On threshold breach (§3.3), open a Clinical Improvement Plan (`workflow_id = vbp.cip.open`). | Within 7 calendar days. |
| 5.2.2 | CIP Owner | Conduct PDSA cycle; capture interventions, metrics, and outcome evidence. | Initial PDSA in 30 days. |
| 5.2.3 | QAPI Committee | Review CIP progress monthly until measure stabilizes ≥ achievement threshold. | Monthly. |

### 5.3 Reimbursement Impact

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.3.1 | CFO + QAPI Director | Calculate projected payment adjustment using current rolling TPS. | Quarterly. |
| 5.3.2 | CFO | Report projected impact to Governing Body. | Quarterly. |

### 5.4 Data Integrity Linkage

OASIS-based measures depend on CL-OA-101 audit results; claims-based measures depend on CO-FW-101 §6.1.3 billing audits; HHCAHPS depends on patient roster accuracy and survey vendor controls. Any data-integrity finding shall pause CIP closure until the root cause is corrected.

---

## 6. EVIDENCE & TRACEABILITY (per EN-WF-101)

All HHVBP monitoring, CIP, and reporting events persist to the Evidence Repository with `policy_id = QA-VBP-101`, `workflow_id`, `event_id`, `measure_id`, `period`, `score_value`, `cohort_percentile`, `tps_projection`, `user_id`, and `timestamp`.

---

## 7. DOCUMENTATION & RETENTION

| Record | Retention |
| :---- | :---- |
| Monthly HHVBP dashboards | 7 years |
| CIP records (charter, PDSA logs, closure) | 7 years |
| HHCAHPS vendor reports | 7 years |
| Governing Body minutes referencing TPS | Permanent (per GV-GB-001) |
| Reimbursement impact analyses | 7 years |

---

## 8. COMPLIANCE MEASUREMENT

| Indicator | Target |
| :---- | :---- |
| Monthly HHVBP dashboard published | 100% on time |
| CIPs opened within 7 days of breach | 100% |
| Measures meeting/exceeding achievement threshold | ≥ 70% |
| Projected TPS payment adjustment band | Neutral or positive |
| HHCAHPS response rate | ≥ national median |

---

## 9. REGULATORY REFERENCES

- 42 CFR Part 484, Subpart F — Expanded HHVBP Model
- 42 CFR § 484.65 — QAPI
- 42 CFR § 484.245 — Reporting and Public Reporting (HHQRP)
- CY 2024–2026 HH PPS Final Rules (HHVBP measure set updates)
- HHVBP Technical Specifications (current)
- HHCAHPS Protocols and Guidelines Manual

### Cross-Referenced Policies
QA-PG-001, QA-PG-002, QA-AE-003, QA-SM-004, CL-OA-101, CL-DC-101, CL-CC-101, CO-FW-101, EN-WF-101, GV-GB-001, FN-FP-007.

---

## 10. TRAINING

QAPI staff: HHVBP measure-specification training annually. Field clinicians: 60-minute HHVBP-impact orientation at hire and annually, emphasizing the patient-experience and outcome chain.

---

## 11. CHANGELOG

| Version | Date | Author | Summary |
| :---- | :---- | :---- | :---- |
| 1.0 | 2026-04-29 | QAPI Director | Initial release. Establishes HHVBP performance program, threshold-based CIP triggers, reimbursement-impact reporting, and full evidence traceability per EN-WF-101. |
