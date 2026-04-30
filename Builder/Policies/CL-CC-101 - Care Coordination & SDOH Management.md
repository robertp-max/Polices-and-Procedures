# POLICY CL-CC-101 — CARE COORDINATION & SDOH MANAGEMENT

| Field | Value |
| :---- | :---- |
| Policy ID | CL-CC-101 |
| Policy Title | Care Coordination & Social Determinants of Health (SDOH) Management |
| Domain | CL — Clinical Operations |
| Subdomain | CC — Care Coordination |
| Classification Tier | REQUIRED |
| Version | 1.0 |
| Effective Date | 2026-04-29 |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing |
| Approved By | Governing Body Chair |
| Regulatory Tags | 42 CFR § 484.60, OASIS-E1 (SDOH items), 42 CFR § 484.50, HHVBP |

---

## 1. PURPOSE

This policy establishes the agency's program for interdisciplinary care coordination, social determinants of health (SDOH) screening and documentation per OASIS-E1 standardized SDOH items, referral tracking, escalation of unmet health-related social needs, and follow-up. The policy operationalizes 42 CFR § 484.60 care coordination requirements and aligns with HHVBP outcome objectives (QA-VBP-101).

---

## 2. SCOPE

Applies to all patients admitted to home health services and to all clinicians (RN, PT, OT, SLP, MSW, HHA) and care coordination personnel involved in interdisciplinary planning, communication, transitions, and post-discharge follow-up.

---

## 3. POLICY STATEMENTS

3.1 Every patient shall be screened at SOC for SDOH using the OASIS-E1 standardized SDOH items, including: ethnicity (A1005), race (A1010), preferred language (A1110A), need for interpreter (A1110B), transportation (A1250), social isolation (D0700), and health literacy (B1300). Responses shall be recorded in the OASIS and reconciled with the comprehensive assessment per CL-OA-101.

3.2 Identified unmet social needs (e.g., food insecurity, housing instability, transportation, caregiver absence, financial barriers) shall be documented in the Plan of Care and trigger structured referral to community resources, MSW consultation, or care management escalation.

3.3 The agency shall maintain a Community Resource Directory updated semi-annually, with attribution and currency verification recorded as evidence.

3.4 Interdisciplinary communication shall occur at minimum: (a) at SOC and ROC; (b) at each case conference (no less than every 2 weeks for active episodes); (c) on any change in condition; (d) at recertification; (e) at discharge. All communications shall be documented in the EHR with participants, clinical content, and decisions.

3.5 Escalation workflows shall be activated when (a) a referral is unfilled within 14 calendar days; (b) the patient declines a needed service; (c) caregiver capacity is compromised; (d) hospital readmission risk score (M1033) ≥ 4; (e) any safety risk is identified. Escalations are routed to the Clinical Manager and (where indicated) MSW, and tracked to closure.

3.6 Post-discharge follow-up shall include: (a) 48-hour post-discharge phone call to confirm successful transition, medication reconciliation, and follow-up appointment; (b) coordination with receiving providers per the Transfer of Health Information OASIS items; (c) documented closure of open referrals.

3.7 Care-coordination performance shall feed HHVBP-impacting measures (Discharged to Community, ACH, ED Use) and shall be monitored through QA-VBP-101.

3.8 **Workflow Enforcement & Evidence Clause (Mandatory).** Execution of this policy shall generate auditable evidence within the system. All actions must be recorded with `policy_id`, `workflow_id`, and `event_id`. Actions not supported by system-generated evidence shall be considered non-compliant.

---

## 4. DEFINITIONS

| Term | Definition |
| :---- | :---- |
| SDOH | Social Determinants of Health — non-medical factors influencing health outcomes (economic stability, education access, healthcare access, neighborhood, social/community context). |
| Health-Related Social Needs (HRSNs) | Individual-level adverse social conditions (e.g., food insecurity, housing instability) negatively affecting health. |
| Care Coordination | The deliberate organization of patient care activities and information sharing across all participants concerned with a patient's care. |
| Interdisciplinary Group (IDG) | The team of clinicians, MSW, HHA, and care coordinators jointly responsible for a patient's plan of care. |
| Closed-Loop Referral | A referral whose receipt, scheduling, and outcome have been confirmed and documented. |

---

## 5. PROCEDURES

### 5.1 SDOH Screening & Documentation

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.1.1 | SOC Clinician | Complete OASIS-E1 SDOH items at SOC and ROC; reconcile with patient/caregiver interview. (`event_id = sdoh.screen`). | At SOC / ROC. |
| 5.1.2 | SOC Clinician | For any positive screen, document the HRSN in the comprehensive assessment and Plan of Care; create referral record. | Within 24 hours. |

### 5.2 Referral Tracking

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.2.1 | Care Coordinator / MSW | Issue referral via EHR; capture referral metadata (resource, date, contact). (`event_id = referral.open`). | Same day as identification. |
| 5.2.2 | Care Coordinator | Confirm receipt by referral target within 7 calendar days; close loop with outcome (engaged / declined / unable to contact). (`event_id = referral.close`). | Within 14 calendar days. |

### 5.3 Interdisciplinary Communication

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.3.1 | Case Manager | Convene biweekly case conference; record participants, patient cases reviewed, decisions, and follow-up assignments. (`event_id = idg.case.conference`). | Every 2 weeks. |
| 5.3.2 | Visit Clinician | Communicate change-in-condition to physician within 24 hours; document order changes. (`event_id = clinical.coc`). | Within 24 hours. |

### 5.4 Escalation

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.4.1 | Care Coordinator | On escalation trigger (§3.5), notify Clinical Manager and (if applicable) MSW within 1 business day. (`event_id = care.escalation`). | 1 business day. |
| 5.4.2 | Clinical Manager | Document resolution and update Plan of Care. | Within 5 business days. |

### 5.5 Discharge Follow-Up

| Step | Responsible Party | Action | Timeframe |
| :---- | :---- | :---- | :---- |
| 5.5.1 | Care Coordinator | 48-hour post-discharge phone call; document outcome. (`event_id = discharge.followup`). | 48 hours post-DC. |
| 5.5.2 | Discharging Clinician | Complete OASIS Transfer of Health Information items; transmit to receiving provider per the patient's transition. | At DC. |

---

## 6. EVIDENCE & TRACEABILITY (per EN-WF-101)

All SDOH screens, referrals, IDG conferences, escalations, and follow-up calls persist to the Evidence Repository with full metadata: `policy_id = CL-CC-101`, `workflow_id`, `event_id`, `patient_id`, `episode_id`, `screen_results`, `referral_id`, `closure_status`, `user_id`, `timestamp`.

---

## 7. DOCUMENTATION & RETENTION

| Record | Retention |
| :---- | :---- |
| SDOH screening results | 7 years (with clinical record) |
| Referral records (open + closed) | 7 years |
| Case conference minutes | 7 years |
| 48-hour follow-up call logs | 7 years |
| Community Resource Directory (versioned) | 7 years |

---

## 8. COMPLIANCE MEASUREMENT

| Indicator | Target |
| :---- | :---- |
| SDOH screened at SOC | 100% |
| Closed-loop referrals within 14 days | ≥ 90% |
| Biweekly case conferences held | 100% per active episode |
| 48-hour post-discharge call completed | ≥ 95% |
| Escalations resolved within 5 business days | ≥ 90% |

---

## 9. REGULATORY REFERENCES

- 42 CFR § 484.60 — Care Planning, Coordination of Services, and Quality of Care
- 42 CFR § 484.50 — Patient Rights (notice; care planning involvement)
- 42 CFR § 484.55 — Comprehensive Assessment
- OASIS-E1 SDOH Standardized Items (CMS Guidance Manual, current)
- CMS Framework for Health Equity 2022–2032

### Cross-Referenced Policies
CL-OA-101, CL-DC-101, CL-CA-001, QA-VBP-101, EN-WF-101, CO-HP-101.

---

## 10. TRAINING

All field clinicians shall complete SDOH screening and trauma-informed care training within 14 calendar days of hire and annually. Care Coordinators / MSWs shall complete advanced HRSN-resource navigation training annually.

---

## 11. CHANGELOG

| Version | Date | Author | Summary |
| :---- | :---- | :---- | :---- |
| 1.0 | 2026-04-29 | DON | Initial release. Establishes OASIS-E1 SDOH governance, closed-loop referral tracking, IDG communication, escalation, and 48-hour discharge follow-up with full evidence traceability. |
