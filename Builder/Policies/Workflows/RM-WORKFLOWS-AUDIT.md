# RM — RISK & SAFETY AUDIT LAYER

> Hardened audit workflows covering incident analysis, environmental & safety
> monitoring, emergency-preparedness readiness, and incident-response compliance.
> Aggregate evidence from operational RM-WF-01..15. Findings feed QA-WF-03 and
> EN-WF-12 (cross-domain risk consolidation).

---

## RM-WF-16 — INCIDENT TREND ANALYSIS

### 1. POLICY REFERENCES
- RM-RM-001 Risk Management; QA-AE-001 Adverse Event; 42 CFR § 484.65(b)

### 2. PROCESS OVERVIEW
Monthly aggregation and trend analysis of all incidents (clinical adverse events, falls, medication errors, complaints, near misses, workplace injuries, exposures, security events). Hardens QA-WF-05 (Adverse Event Reporting/RCA). Aggregates evidence from QA-WF-05, RM-WF-10 (workplace injury), HR-WF-13 (workers comp), CO-WF-03 (hotline), IT-WF-25 (security incident audit). Feeds QA-WF-03 and EN-WF-12.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any sentinel event; cluster (≥3 same-type within 30 days)

### 4. RESPONSIBLE ROLES
- **Primary:** Risk Manager
- **Supporting:** QAPI Lead, IP, HR, Compliance Officer
- **Approval:** Administrator; Governing Body for sentinel patterns

### 5. INPUTS
- Incident management log
- Workers comp register
- Hotline log
- Source workflows: QA-WF-05, RM-WF-10, HR-WF-13, CO-WF-03, IT-WF-25

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull incident dataset across all source systems | Risk Manager | QA-FM-026 | Day 1 |
| 2 | Categorize by type / severity / location / role | Risk Manager | QA-FM-026 | Day 2 |
| 3 | Compute rate per 100 patient/employee episodes | Risk Manager | EN-FM-034 | Day 3 |
| 4 | Identify clusters and patterns; trigger RCA via QA-WF-05 | Risk Manager | QA-FM-005 | Day 4 |
| 5 | Compile Incident Trend Report; feed QA-WF-03, EN-WF-12 | Risk Manager | CO-FM-024 | Day 6 |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-005, QA-FM-026, EN-FM-034, CO-FM-024

### 8. APPROVALS
Administrator signs. Governing Body acknowledges sentinel patterns via GV-WF-01.

### 9. OUTPUTS
Monthly Incident Trend Report; cluster register; rate trend; RCA queue.

### 10. SLA / DEADLINES
Monthly. Sentinel event RCA initiated within 24h.

### 11. ESCALATION LOGIC
Sentinel / cluster → QA-WF-05 RCA + EN-WF-12 enterprise risk register update. Repeat cluster → QA-WF-04 PIP. Findings feed QA-WF-03 and CO-WF-22.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unanalyzed sentinel pattern → preventable harm; survey citation; potential CMS termination risk.

### 13. AUDIT REQUIREMENTS
Append-only incident log retained ≥6 years. Per-cycle: dataset hash, categorization, rate calc, RCA queue, sign-off. Cross-referenced to QA-WF-05, RM-WF-10, HR-WF-13, CO-WF-03, IT-WF-25, EN-WF-12, QA-WF-03.

---

## RM-WF-17 — SAFETY MONITORING

### 1. POLICY REFERENCES
- RM-OS-001 Occupational Safety; HR-WM-004 Employee Health; Cal/OSHA IIPP; 29 CFR § 1910

### 2. PROCESS OVERVIEW
Monthly safety monitoring workflow that audits PPE availability and use, sharps disposal, vehicle safety, lone-worker check-in, and ergonomic compliance. Aggregates evidence from RM-WF-08 (Cal/OSHA IIPP), RM-WF-09 (workplace violence prevention), CL-WF-14 (point-of-care IC), and OP-WF-09 (vehicle management). Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any safety incident; OSHA inspection signal

### 4. RESPONSIBLE ROLES
- **Primary:** Safety Officer
- **Supporting:** Risk Manager, IP, Operations Manager
- **Approval:** Administrator

### 5. INPUTS
- Safety inspection results
- PPE issuance/use observations
- Vehicle inspection logs
- Source workflows: RM-WF-08, RM-WF-09, CL-WF-14, OP-WF-09, OP-WF-02

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull safety inspection + observation data | Safety Officer | CO-FM-022 | Day 1 |
| 2 | Audit PPE availability/use (≥20 observations) | Safety Officer | CL-FM-021 | Day 2–3 |
| 3 | Verify vehicle inspection compliance per OP-WF-09 | Safety Officer | OP-FM-018 | Day 4 |
| 4 | Verify lone-worker check-in compliance | Safety Officer | RM-FM-012 | Day 4 |
| 5 | Issue CAPs; cluster events → RM-WF-16 trend analysis | Safety Officer | QA-FM-005 | Day 5 |
| 6 | Compile report; feed QA-WF-03 | Safety Officer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-021, OP-FM-018, RM-FM-012, CO-FM-022, CO-FM-024, QA-FM-005

### 8. APPROVALS
Administrator signs.

### 9. OUTPUTS
Monthly Safety Audit Report; observation scorecard; CAP register.

### 10. SLA / DEADLINES
Monthly. CAPs ≤5 business days.

### 11. ESCALATION LOGIC
Cluster events → RM-WF-16. Cal/OSHA exposure → RM-WF-08 update. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unaddressed safety risk → Cal/OSHA citation, employee injury, workers comp exposure.

### 13. AUDIT REQUIREMENTS
Per-cycle log: inspection data, observation scoring, CAPs, sign-off. Retention ≥5 years (Cal/OSHA). Cross-referenced to RM-WF-08, RM-WF-09, CL-WF-14, OP-WF-09, RM-WF-16, QA-WF-03.

---

## RM-WF-18 — ENVIRONMENTAL RISK REVIEW

### 1. POLICY REFERENCES
- RM-EP-001 Emergency Preparedness; RM-RM-001 Risk Management; 42 CFR § 484.102

### 2. PROCESS OVERVIEW
Quarterly environmental and operational risk review covering office facility, branch sites, hazardous-material handling, equipment, and patient-environment risks. Hardens RM-WF-02 (Annual HVA) and aggregates branch-inspection findings from OP-WF-02. Feeds RM-WF-01 (enterprise risk register) and QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: hazard event; equipment recall (RM-WF-12); branch lease change

### 4. RESPONSIBLE ROLES
- **Primary:** Risk Manager
- **Supporting:** Safety Officer, Operations Manager
- **Approval:** Administrator

### 5. INPUTS
- Branch inspection results (OP-WF-02)
- Hazmat register (RM-WF-11)
- Equipment recall log (RM-WF-12)
- Source workflows: OP-WF-02, RM-WF-02, RM-WF-11, RM-WF-12

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull branch inspection + hazmat + recall datasets | Risk Manager | CO-FM-022 | Day 1 |
| 2 | Reassess each environmental risk vs. HVA baseline | Risk Manager | RM-FM-012 | Day 2–3 |
| 3 | Update enterprise risk register per RM-WF-01 | Risk Manager | RM-FM-012 | Day 4 |
| 4 | Issue mitigation CAPs | Risk Manager | QA-FM-005 | Day 5 |
| 5 | Compile review; feed QA-WF-03 + EN-WF-12 | Risk Manager | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
RM-FM-012, CO-FM-022, CO-FM-024, QA-FM-005

### 8. APPROVALS
Administrator signs.

### 9. OUTPUTS
Quarterly Environmental Risk Review; updated risk register entries; mitigation CAPs.

### 10. SLA / DEADLINES
Quarterly. Mitigations within risk-tier SLA.

### 11. ESCALATION LOGIC
High-tier risk → RM-WF-01 + EN-WF-12 enterprise risk consolidation; Governing Body via GV-WF-01. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unmanaged environmental risk → injury, regulatory citation, business interruption.

### 13. AUDIT REQUIREMENTS
Per-cycle log: dataset hashes, risk reassessment, CAPs, sign-off. Retention ≥6 years. Cross-referenced to RM-WF-01, RM-WF-02, OP-WF-02, EN-WF-12, QA-WF-03.

---

## RM-WF-19 — EMERGENCY PREPAREDNESS READINESS AUDIT

### 1. POLICY REFERENCES
- RM-EP-001 Emergency Preparedness; 42 CFR § 484.102

### 2. PROCESS OVERVIEW
Quarterly readiness audit confirming the agency can execute its emergency-preparedness program at any time. Hardens RM-WF-03 (biennial program review), RM-WF-04 (biennial training), RM-WF-05 (annual exercise). Validates patient priority classification (RM-WF-07), staff readiness, communication-tree currency, supply caches, and surge plan (RM-WF-06). Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: actual emergency activation; CMS EP rule update; HVA refresh

### 4. RESPONSIBLE ROLES
- **Primary:** Emergency Preparedness Coordinator
- **Supporting:** Clinical Manager, Safety Officer, Risk Manager
- **Approval:** Administrator; Governing Body informed via GV-WF-01

### 5. INPUTS
- EP program documentation
- Patient priority registry (RM-WF-07)
- Communication tree
- Source workflows: RM-WF-03, RM-WF-04, RM-WF-05, RM-WF-06, RM-WF-07

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Verify EP plan currency per RM-WF-03 | EP Coord | RM-FM-012 | Day 1 |
| 2 | Verify staff training currency per RM-WF-04 | EP Coord | HR-FM-017 | Day 2 |
| 3 | Verify last annual exercise occurred per RM-WF-05 | EP Coord | RM-FM-012 | Day 2 |
| 4 | Spot-test patient priority registry per RM-WF-07 | EP Coord | RM-FM-012 | Day 3 |
| 5 | Spot-test communication tree (live drill) | EP Coord | RM-FM-012 | Day 3 |
| 6 | Audit supply cache | EP Coord | RM-FM-012 | Day 4 |
| 7 | Compile readiness report; feed QA-WF-03 + GV-WF-01 | EP Coord | CO-FM-024 | Day 5 |

### 7. REQUIRED FORMS & DOCUMENTS
RM-FM-012, HR-FM-017, CO-FM-024, GV-FM-023

### 8. APPROVALS
Administrator signs. Governing Body acknowledges via GV-WF-01.

### 9. OUTPUTS
Quarterly EP Readiness Report; gap register; readiness scorecard; drill evidence.

### 10. SLA / DEADLINES
Quarterly. Gap closure within next quarter or sooner if material.

### 11. ESCALATION LOGIC
Readiness gap → CAP and EN-WF-12 update. Material gap → Governing Body via GV-WF-01. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unprepared agency at activation → patient harm, EP CoP citation (42 CFR § 484.102), reportable.

### 13. AUDIT REQUIREMENTS
Per-cycle log: verification evidence, drill results, gap register, sign-off. Retention ≥6 years. Cross-referenced to RM-WF-03, RM-WF-04, RM-WF-05, RM-WF-06, RM-WF-07, EN-WF-12, GV-WF-01, QA-WF-03.

---

## RM-WF-20 — INCIDENT RESPONSE COMPLIANCE AUDIT

### 1. POLICY REFERENCES
- QA-AE-001 Adverse Event; RM-RM-002 Incident Response; 42 CFR § 484.65(b); CMIA reporting

### 2. PROCESS OVERVIEW
Quarterly audit of incident-response process compliance: time-to-report, time-to-RCA, CAP closure rates, mandatory external reporting completion (state DHCS, CDPH, OSHA, OCR-HIPAA). Aggregates evidence from QA-WF-05 (RCA), CL-WF-22 (abuse/neglect), CL-WF-23 (complaints), CO-WF-10 (HIPAA breach), HR-WF-13 (workers comp), IT-WF-09 (IT security incident). Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: external regulator inquiry on incident handling

### 4. RESPONSIBLE ROLES
- **Primary:** Risk Manager
- **Supporting:** Compliance Officer, Clinical Manager, IT Security Officer
- **Approval:** Compliance Officer; Governing Body for material gaps

### 5. INPUTS
- Incident register
- RCA register (QA-WF-05)
- Mandatory-report log
- Source workflows: QA-WF-05, CL-WF-22, CL-WF-23, CO-WF-10, HR-WF-13, IT-WF-09

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull incident register + RCA + report log | Risk Manager | CO-FM-022 | Day 1 |
| 2 | Score time-to-report, time-to-RCA, CAP closure | Risk Manager | QA-FM-026 | Day 2–3 |
| 3 | Verify mandatory external reports filed (DHCS, CDPH, OSHA, OCR) | Compliance Officer | CO-FM-024 | Day 4 |
| 4 | Issue CAPs for any miss → CO-WF-30 | Compliance Officer | QA-FM-005 | Day 5 |
| 5 | Compile audit report; feed QA-WF-03 | Risk Manager | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-022, CO-FM-024, QA-FM-005, QA-FM-026

### 8. APPROVALS
Compliance Officer signs. Governing Body acknowledges material misses via GV-WF-01.

### 9. OUTPUTS
Quarterly Incident Response Audit Report; per-incident scorecard; mandatory-report compliance register; CAP queue.

### 10. SLA / DEADLINES
Quarterly. Missed external report → escalate same day; remediate within 5 business days.

### 11. ESCALATION LOGIC
Missed mandatory report → immediate filing + CO-WF-16 self-disclosure consideration. Pattern → CAP via CO-WF-04. Findings feed QA-WF-03 and CO-WF-22.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Missed mandatory external reports → CMP, licensure action, OCR penalties.

### 13. AUDIT REQUIREMENTS
Per-cycle log: incident roster, scoring, mandatory-report evidence, CAPs, sign-off. Retention ≥10 years. Cross-referenced to QA-WF-05, CL-WF-22, CL-WF-23, CO-WF-10, HR-WF-13, IT-WF-09, CO-WF-16, CO-WF-30, QA-WF-03.

---
