# QA — QUALITY ASSESSMENT & PERFORMANCE IMPROVEMENT (QAPI) — WORKFLOWS

**Domain Code:** QA
**Regulatory Anchors:** 42 CFR § 484.65 (QAPI Condition of Participation); CMS State Operations Manual Appendix B; 42 CFR § 484.245 (HH QRP); OASIS-E1; HHCAHPS; 42 CFR § 484.75 (Coordination of Care)
**Primary Subdomains:** PG (Program Governance), SM (Star Monitoring), AE (Adverse Events), PI (Performance Improvement Projects)
**Form Prefix:** QA-FM-xxx (13 forms)

---

## DOMAIN OVERVIEW

QAPI workflows operationalize the § 484.65 requirement that the agency develop, implement, evaluate, and maintain an effective, ongoing, agency-wide, data-driven QAPI program, including at least one Performance Improvement Project (PIP) each year. Every workflow must produce data-linked, board-reviewed, sustained evidence of improvement.

---

## WORKFLOWS IN THIS DOMAIN

1. QA-WF-01 — QAPI Program Charter & Annual Review
2. QA-WF-02 — Monthly Quality Indicator Dashboard Production
3. QA-WF-03 — Quarterly QAPI Committee Review
4. QA-WF-04 — Annual Performance Improvement Project (PIP) Lifecycle
5. QA-WF-05 — Adverse Event Reporting, RCA & Corrective Action
6. QA-WF-06 — Infection Control Surveillance (QAPI-Integrated)
7. QA-WF-07 — LUPA Prevention & Visit Utilization Monitoring
8. QA-WF-08 — HHCAHPS Monitoring & Response
9. QA-WF-09 — Star Rating & Public Report Monitoring
10. QA-WF-10 — QAPI Self-Assessment (Annual)
11. QA-WF-11 — Policy Effectiveness Monitoring
12. QA-WF-12 — Patient Safety Event Communication

---

## QA-WF-01 — QAPI PROGRAM CHARTER & ANNUAL REVIEW

### 1. POLICY REFERENCES
- QA-PG-001 QAPI Program Establishment & Governance
- QA-PG-002 QAPI Committee Structure
- GV-GB-001; CO-CP-001
- 42 CFR § 484.65(a)–(e)

### 2. PROCESS OVERVIEW
Establishes and annually reaffirms the QAPI Program Charter: scope, governance, measures, data sources, accountability, and Governing Body oversight per § 484.65.

### 3. TRIGGER(S)
- **Time-based:** Annual review (within 30 days of FY start).
- **Event-based:** Material organizational change, CoP change, survey finding.

### 4. RESPONSIBLE ROLES
- **Primary owner:** QAPI Lead / Clinical Manager
- **Supporting:** Compliance Officer, Administrator, Infection Preventionist, Data Analyst
- **Approval:** Governing Body

### 5. INPUTS
- Prior year charter
- Prior year PIP outcomes
- Annual self-assessment results (QA-WF-10)
- Regulatory updates

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | System Action | Form | Deadline |
|---|--------|------|---------------|------|----------|
| 1 | Review prior charter against § 484.65 requirements | QAPI Lead | Gap analysis | — | 60 days pre-FY |
| 2 | Update priorities, measures, data sources | QAPI Lead | Charter draft | — | 45 days pre-FY |
| 3 | Compliance review | Compliance Officer | Redline | — | 30 days pre-FY |
| 4 | QAPI Committee review | Committee | Minutes | QA-FM-001 QAPI Committee Meeting Minutes Template | Committee meeting |
| 5 | Governing Body approval | Chair | Vote | GV-FM-005 | Annual meeting |
| 6 | Publish and disseminate | QAPI Lead | Intranet | — | ≤ 14 days post-approval |
| 7 | Train committee & leadership | QAPI Lead | HR-FM-017 | ≤ 30 days |

### 7. REQUIRED FORMS & DOCUMENTS
- QA-FM-001 QAPI Committee Meeting Minutes
- QA-FM-010 QAPI Self-Assessment Annual Checklist
- GV-FM-005 Governing Body Meeting Minutes
- HR-FM-017 Training Attendance Roster
- EN-FM-007 Policy Development & Revision Template (if charter is a policy)
- EN-FM-008 Policy Approval Routing Form

### 8. APPROVALS
Governing Body approves annually. Committee approves in-year amendments; Governing Body ratifies material changes.

### 9. OUTPUTS
Approved QAPI charter (versioned), Committee minutes, Board minutes, training records.

### 10. SLA / DEADLINES
Annual approval within 30 days of FY start.

### 11. ESCALATION LOGIC
Approval delay >30 days: interim charter continues under prior version + temporary amendment; Administrator + Chair notified.

### 12. FAILURE CONDITIONS
No documented QAPI program = CoP § 484.65 deficiency → Condition-Level finding, potential Medicare termination.

### 13. AUDIT REQUIREMENTS
Charter (current version), Board approval, committee training, measure list traceable to data sources.

---

## QA-WF-02 — MONTHLY QUALITY INDICATOR DASHBOARD PRODUCTION

### 1. POLICY REFERENCES
- QA-PG-001; QA-SM-001 Quality Indicators; CL-OA-001 OASIS
- 42 CFR § 484.65(b); § 484.245 (HH QRP)

### 2. PROCESS OVERVIEW
Monthly compilation of quality indicators from OASIS, claims, HHCAHPS (if available), incident/adverse event log, and infection surveillance to drive QAPI decisions.

### 3. TRIGGER(S)
- Monthly (calendar month close)
- Ad-hoc upon signal (spike in event category)

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Data Analyst / QAPI Lead
- **Supporting:** Clinical Manager, Finance, IT
- **Approval:** QAPI Lead

### 5. INPUTS
- OASIS transmission records (CL-FM-045)
- Claims data
- HHCAHPS vendor reports (if non-exempt)
- Incident log (QA-FM-004), Infection log (QA-FM-006)
- Visit utilization (QA-FM-007)

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Extract source data | Data Analyst | Data queries | Day 5 of month |
| 2 | Validate data quality (completeness, accuracy) | Data Analyst | Validation notes | Day 7 |
| 3 | Populate dashboard metrics | Data Analyst | QA-FM-003 Quality Indicator Monthly Dashboard | Day 10 |
| 4 | Identify variances (from baseline/target) | QAPI Lead | Variance commentary | Day 10 |
| 5 | Flag events for RCA | QAPI Lead | QA-FM-004 RCA Worksheet queue | Day 12 |
| 6 | Distribute dashboard to Committee, Clinical Manager, Administrator | QAPI Lead | Email/portal | Day 15 |
| 7 | Archive with supporting data | QAPI Lead | Records | Day 15 |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-003, QA-FM-004, QA-FM-006, QA-FM-007, CL-FM-045 OASIS Transmission Confirmation Log.

### 8. APPROVALS
QAPI Lead signs monthly dashboard; Committee reviews quarterly (QA-WF-03).

### 9. OUTPUTS
Monthly dashboard archived, variance commentary, RCA queue.

### 10. SLA / DEADLINES
Dashboard released by day 15 of each month.

### 11. ESCALATION LOGIC
Data integrity issue → IT + Clinical Manager within 48h; substantial spike in adverse indicator → ad-hoc Committee call within 7 days.

### 12. FAILURE CONDITIONS
No data-driven evidence of monitoring = § 484.65 deficiency.

### 13. AUDIT REQUIREMENTS
12 months of dashboards available; data lineage traceable; source system reconciliations.

---

## QA-WF-03 — QUARTERLY QAPI COMMITTEE REVIEW

### 1. POLICY REFERENCES
- QA-PG-001; QA-PG-002; GV-GB-001
- 42 CFR § 484.65(b)(3), (e)

### 2. PROCESS OVERVIEW
Quarterly committee review of dashboard trends, adverse events, PIP status, infection surveillance, and coordination with Governing Body quarterly meeting.

### 3. TRIGGER(S)
- Quarterly schedule (aligned with Governing Body cadence)

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead (Chair)
- **Supporting:** Clinical Manager, Compliance Officer, Infection Preventionist, HR, Administrator
- **Approval:** Committee; reported to Governing Body

### 5. INPUTS
QAPI is a STRICT ORCHESTRATION workflow. The committee MAY NOT convene unless ALL of the following upstream audit workflows have produced their cycle-period evidence pack and signed report. Pre-input completion is verified by the QAPI Lead against the workflow inventory.

- **Clinical Quality audit layer (12 audits):** CL-WF-26, CL-WF-27, CL-WF-28, CL-WF-29, CL-WF-30, CL-WF-31, CL-WF-32, CL-WF-33, CL-WF-34, CL-WF-35, CL-WF-36, CL-WF-37
- **Compliance & Billing audit layer (8 audits):** CO-WF-23, CO-WF-24, CO-WF-25, CO-WF-26, CO-WF-27, CO-WF-28, CO-WF-29, CO-WF-30
- **QAPI Support audit layer (6 audits):** QA-WF-13, QA-WF-14, QA-WF-15, QA-WF-16, QA-WF-17, QA-WF-18
- **HR & Training audit layer (4 audits):** HR-WF-18, HR-WF-19, HR-WF-20, HR-WF-21
- **Risk & Safety audit layer (5 audits):** RM-WF-16, RM-WF-17, RM-WF-18, RM-WF-19, RM-WF-20
- **IT & Security audit layer (5 audits):** IT-WF-21, IT-WF-22, IT-WF-23, IT-WF-24, IT-WF-25
- 3 months of dashboards (QA-WF-02 supported by QA-WF-13)
- Adverse event RCAs (QA-WF-05)
- Active PIPs status (QA-WF-04 supported by QA-WF-17)
- Infection line list (CL-WF-15)
- Patient complaints summary (CL-WF-23)
- Board readiness packet (GV-WF-01 inputs)

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Verify pre-input completeness across all 40 audit workflows; log any gap | QAPI Lead | QA-FM-021 | ≥ 5 business days pre-meeting |
| 2 | Distribute agenda & pre-read packet | QAPI Lead | Packet | ≥ 3 business days pre-meeting |
| 3 | Review aggregate quality trends from CL-WF-26..37 | QAPI Lead | QA-FM-003 | At meeting |
| 4 | Review compliance/billing audit results from CO-WF-23..30 | Compliance Officer | CO-FM-024 | At meeting |
| 5 | Review HR audit results from HR-WF-18..21 | HR Manager | EN-FM-022 | At meeting |
| 6 | Review risk/safety audit results from RM-WF-16..20 | Risk Manager | CO-FM-024 | At meeting |
| 7 | Review IT/security audit results from IT-WF-21..25 | IT Security Officer | CO-FM-024 | At meeting |
| 8 | Review QAPI-layer results: KPI (QA-WF-13), indicators (QA-WF-14), trends (QA-WF-15), validation (QA-WF-16), PIPs (QA-WF-17), policy effectiveness (QA-WF-18) | QAPI Lead | QA-FM-021 | At meeting |
| 9 | Review adverse events & RCAs | QAPI Lead | QA-FM-004 | At meeting |
| 10 | Review PIP status (QA-WF-04 + QA-WF-17 monitoring) | PIP Owners | QA-FM-002; QA-FM-005 | At meeting |
| 11 | Review infection surveillance | Infection Preventionist | QA-FM-006 | At meeting |
| 12 | Decide on priority actions / new PIPs / CAPs | Committee | Minutes | At meeting |
| 13 | Document minutes | Scribe | QA-FM-001 | ≤ 14 days |
| 14 | Package report for Governing Body (GV-WF-01) | QAPI Lead | GV-FM-023 | ≥ 7 days pre-Governing Body meeting |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-001, QA-FM-002, QA-FM-003, QA-FM-004, QA-FM-005, QA-FM-006, GV-FM-023.

### 8. APPROVALS
Committee majority; Governing Body reviews at next quarterly meeting (GV-WF-01).

### 9. OUTPUTS
Minutes, action log, quarterly report for Governing Body.

### 10. SLA / DEADLINES
Quarterly (every 90 days max); minutes ≤14 days.

### 11. ESCALATION LOGIC
Sentinel event or Immediate Jeopardy signal → emergency Committee + Administrator + Governing Body Chair within 24–72 hours. Any pre-input audit not complete → meeting deferred or partial-scope meeting with documented gap and CAP. Material findings escalate to GV-WF-01 and EN-WF-12. Cross-domain pattern triggers QA-WF-04 PIP via QA-WF-17 monitoring. Aggregated audit results: CL-WF-26..37, CO-WF-23..30, QA-WF-13..18, HR-WF-18..21, RM-WF-16..20, IT-WF-21..25.

### 12. FAILURE CONDITIONS
No evidence of Governing-Body-reviewed QAPI activity = CoP deficiency. Convening QAPI without complete pre-input audit evidence (CL-WF-26..37, CO-WF-23..30, QA-WF-13..18, HR-WF-18..21, RM-WF-16..20, IT-WF-21..25) = invalid QAPI cycle and survey-citable. Skipping any audit-layer workflow blocks QA-WF-03 closure for the cycle.

### 13. AUDIT REQUIREMENTS
4 quarters of minutes; Board-review evidence; action closure traceable. Each cycle packet must include the pre-input completeness log proving every required audit (CL-WF-26..37, CO-WF-23..30, QA-WF-13..18, HR-WF-18..21, RM-WF-16..20, IT-WF-21..25) was complete and signed before the meeting. Cross-referenced to GV-WF-01, EN-WF-12, QA-WF-04, QA-WF-17.

---

## QA-WF-04 — ANNUAL PERFORMANCE IMPROVEMENT PROJECT (PIP) LIFECYCLE

### 1. POLICY REFERENCES
- QA-PI-001 PIP Lifecycle; QA-PG-001
- 42 CFR § 484.65(d)

### 2. PROCESS OVERVIEW
Operates at least one PIP per calendar year with clearly defined problem, baseline, target, intervention, remeasurement, and sustainment, supported by documentary evidence.

### 3. TRIGGER(S)
- Annual calendar (at least one active PIP always)
- Data-driven (high-risk, high-volume, problem-prone area)
- Adverse event cluster / survey finding

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead; PIP Owner
- **Supporting:** Clinical, Operations, HR, IT
- **Approval:** QAPI Committee; Governing Body

### 5. INPUTS
- Data priorities (OASIS, claims, HHCAHPS, incidents, infection)
- Prior PIPs; sustained results
- Literature / best practices

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Identify priority area (high-risk/high-volume/problem-prone) from data | QAPI Lead | Decision memo | Annual kickoff (Q1) |
| 2 | Draft PIP Charter (problem, baseline, target, team, plan) | PIP Owner | QA-FM-002 Performance Improvement Project Charter | ≤ 30 days of kickoff |
| 3 | QAPI Committee approves charter | Committee | QA-FM-001 | At next meeting |
| 4 | Governing Body informed | QAPI Lead | GV-FM-023 | Next Board meeting |
| 5 | Root cause analysis | PIP Team | QA-FM-004 RCA Worksheet | ≤ 30 days of approval |
| 6 | Design interventions with owners/dates | PIP Owner | QA-FM-002 + action plan | ≤ 30 days of RCA |
| 7 | Implement interventions | Assigned owners | Evidence of deployment | Per plan |
| 8 | Remeasure at 30/60/90 days | Data Analyst | QA-FM-003 | 30/60/90 day marks |
| 9 | Target met? If no, revise & continue; if yes, declare success | PIP Owner + Committee | QA-FM-005 | Per measurement |
| 10 | Sustainment plan (ongoing monitoring) | PIP Owner | Sustainment memo | At closure |
| 11 | Board sign-off of closure | Chair | GV-FM-005 | Quarterly Board meeting |
| 12 | Archive PIP packet (charter, RCA, measures, sustainment) | QAPI Lead | Records | At closure |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-002, QA-FM-004, QA-FM-005, QA-FM-001, QA-FM-003, GV-FM-023, GV-FM-005.

### 8. APPROVALS
Committee approves charter and closure; Governing Body signs off on closure and sustainment.

### 9. OUTPUTS
PIP charter, RCA, intervention plan, 30/60/90 day measurements, closure/sustainment packet, Board minutes.

### 10. SLA / DEADLINES
- At least one PIP active each calendar year (CoP).
- Charter ≤30 days of kickoff; intervention ≤30 days of RCA; remeasurement per plan.

### 11. ESCALATION LOGIC
No target progress after two measurement cycles → Committee revises strategy; re-scope if needed. Sustainment failure post-closure → reopen PIP.

### 12. FAILURE CONDITIONS
No annual PIP = § 484.65(d) Condition-Level deficiency. Charter without baseline/target = audit deficiency.

### 13. AUDIT REQUIREMENTS
Data-linked charter, RCA, interventions with named owners, measurement data, Board review, sustainment evidence all retained ≥7 years.

---

## QA-WF-05 — ADVERSE EVENT REPORTING, RCA & CORRECTIVE ACTION

### 1. POLICY REFERENCES
- QA-AE-001 Adverse Events; QA-AE-003 Corrective Action
- 42 CFR § 484.65(b)(1)(ii), (c), (d); Appendix B §484.65

### 2. PROCESS OVERVIEW
Mechanism to report adverse patient events (actual & near-miss), perform RCA, implement CAP, and evaluate effectiveness.

### 3. TRIGGER(S)
- Any actual or near-miss adverse patient event (falls with injury, medication errors, pressure injuries, preventable hospitalizations, safety events)
- Patient complaint alleging harm

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead
- **Supporting:** Clinical Manager, Risk Manager, discipline-specific clinicians
- **Approval:** QAPI Committee; Governing Body for sentinel

### 5. INPUTS
- Incident report, medical record, witness statements

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Clinician reports event | Clinician | CL-FM-030 Abuse/Neglect Incident Report (if applicable); Incident report form | Within 24 hours of discovery |
| 2 | Log into adverse event log | QAPI Lead | Adverse Event Log | Within 24h |
| 3 | Immediate patient safety actions | Clinical Manager | Clinical note | Same day |
| 4 | Mandatory reporting check (abuse, sentinel) — route to RM-WF / state reporting | Risk Manager / Compliance | Reporting log | Per statute (often ≤24h) |
| 5 | Perform RCA | QAPI Lead | QA-FM-004 RCA Worksheet | ≤ 30 days (sentinel: ≤ 45 days per best practice) |
| 6 | Develop CAP | QAPI Lead | QA-FM-005 CAP Tracking Tool | ≤ 14 days of RCA |
| 7 | Committee review | Committee | QA-FM-001 | Next meeting |
| 8 | Implement CAP; track to closure | Owners | QA-FM-005 | Per CAP dates |
| 9 | Effectiveness check | QAPI Lead | QA-FM-012 Policy Effectiveness Monitoring Worksheet | ≥ 90 days post-implementation |
| 10 | Patient safety event communication | QAPI Lead | QA-FM-013 Patient Safety Event Communication Log | Per event |
| 11 | Board review for serious events | Chair | GV-FM-005 | Next meeting |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-004, QA-FM-005, QA-FM-012, QA-FM-013, QA-FM-001, CL-FM-030, CL-FM-049 Patient Complaint/Grievance Documentation, GV-FM-005.

### 8. APPROVALS
Committee approves RCA and CAP; Governing Body reviews sentinel events.

### 9. OUTPUTS
Incident file, RCA, CAP, effectiveness measurement, communication log, Board minutes.

### 10. SLA / DEADLINES
Initial report 24h; RCA ≤30 days; effectiveness check ≥90 days.

### 11. ESCALATION LOGIC
Sentinel event: emergency QAPI + executive session + mandatory reporting assessment (state, accreditor, CMS) within 24h. Pattern of events: new PIP.

### 12. FAILURE CONDITIONS
Failure to RCA/correct events = § 484.65(b)(1)(ii) and (d) deficiency; malpractice aggravation.

### 13. AUDIT REQUIREMENTS
Per-event file with all steps; retention 10 years (or statute of limitations, whichever longer).

---

## QA-WF-06 — INFECTION CONTROL SURVEILLANCE (QAPI-INTEGRATED)

### 1. POLICY REFERENCES
- CL-IC-001 Infection Prevention Program; QA-PG-001
- 42 CFR § 484.70 (Infection prevention/control)

### 2. PROCESS OVERVIEW
Surveillance, trending, reporting, and CAPA for healthcare-associated infections and exposure events in home health.

### 3. TRIGGER(S)
- Patient infection event
- Staff exposure event
- Outbreak / cluster signal
- Monthly surveillance cycle

### 4. RESPONSIBLE ROLES
- **Primary:** Infection Preventionist (IP) / Clinical Manager
- **Supporting:** QAPI Lead, HR, Compliance
- **Approval:** QAPI Committee

### 5. INPUTS
- Visit documentation; infection surveillance definitions; line list; PPE/supply data

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Maintain infection line list | IP | QA-FM-006 Infection Control Line List & Surveillance Log | Continuous |
| 2 | Use standardized precautions & track | Clinicians | CL-FM-021 Infection Control Precautions Checklist | Every visit |
| 3 | Investigate suspected infections | IP | Investigation notes | Within 48h of signal |
| 4 | Report reportable diseases to public health | IP/Compliance | State reporting | Per statute (often 24–72h) |
| 5 | Trend analysis | IP | QA-FM-003 (infection panel) | Monthly |
| 6 | Outbreak protocol activation | IP + Administrator | Pandemic/Outbreak plan | Upon cluster ≥ threshold |
| 7 | PIP if trend unfavorable | QAPI Lead | QA-FM-002 | Per data |
| 8 | Report to QAPI Committee & Board | IP/QAPI Lead | QA-FM-001; GV-FM-023 | Quarterly |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-006, QA-FM-003, CL-FM-021, CL-FM-047 High-Risk Patient Monitoring Protocol, RM-FM-006 Pandemic Plan Readiness Checklist, QA-FM-002, QA-FM-001, GV-FM-023.

### 8. APPROVALS
IP leads; Committee reviews trends and PIP decisions.

### 9. OUTPUTS
Line list, surveillance trend, investigation notes, reportable disease evidence, PIP (if triggered).

### 10. SLA / DEADLINES
Continuous surveillance; public health reporting per statute; trend review monthly; outbreak protocol activation immediate.

### 11. ESCALATION LOGIC
Outbreak → Administrator + Governing Body Chair + Public Health + Compliance Officer within 24h.

### 12. FAILURE CONDITIONS
Missed reportable disease notification = state penalty; § 484.70 deficiency. Unmitigated cluster = patient harm, potential wrongful death exposure.

### 13. AUDIT REQUIREMENTS
Line list current; investigation evidence; reportable disease confirmations; trends reported to Board.

---

## QA-WF-07 — LUPA PREVENTION & VISIT UTILIZATION MONITORING

### 1. POLICY REFERENCES
- QA-PG-001; FN-BC-001 Medicare Billing; CL-SD-001 Service Delivery
- 42 CFR § 484.215 (PDGM); LUPA thresholds (CMS)

### 2. PROCESS OVERVIEW
Monitors visit frequency vs plan of care vs LUPA thresholds; prevents underutilization (LUPA payment loss) and overutilization (FWA signal).

### 3. TRIGGER(S)
- Weekly episode utilization review
- Missed visit reports
- PDGM case-mix changes

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead + Clinical Manager
- **Supporting:** Finance, Schedulers, Case Managers
- **Approval:** Committee

### 5. INPUTS
- Visit schedule vs actuals; LUPA thresholds; case-mix category; missed visit log

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Weekly LUPA risk report | Data Analyst | QA-FM-007 LUPA Prevention & Visit Utilization Log | Weekly |
| 2 | Case manager review of at-risk episodes | Case Mgr | Case review notes | Weekly |
| 3 | Adjust schedule / clinical intervention (if clinically appropriate) | Scheduler + Clinical | Updated schedule | Before LUPA threshold breach |
| 4 | Missed visit documentation (if clinically necessary & medically appropriate) | Clinician | CL-FM-011 Missed Visit Documentation Form | Same day |
| 5 | Monthly utilization trend review | QAPI Lead | QA-FM-003 | Monthly |
| 6 | Any upcoding/overutilization flagged → investigation (CO-WF-03) | Compliance Officer | CO-FM-004 | As triggered |
| 7 | LUPA financial impact review | Finance | FN-FM-010 PDGM LUPA Mitigation Tracker | Monthly |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-007, QA-FM-003, CL-FM-011, CL-FM-012 Visit Frequency Compliance Tracking Log, FN-FM-010, FN-FM-009 Episode Financial Performance Analysis.

### 8. APPROVALS
Clinical Manager for clinical frequency changes; Finance for financial impact sign-off.

### 9. OUTPUTS
Weekly reports, monthly trend, financial impact summary, missed visit documentation.

### 10. SLA / DEADLINES
Weekly reporting; daily missed visit documentation.

### 11. ESCALATION LOGIC
Systematic underutilization → QAPI PIP; overutilization pattern → compliance investigation.

### 12. FAILURE CONDITIONS
Unjustified visits → False Claims Act exposure; under-visiting → quality/safety risk + revenue loss.

### 13. AUDIT REQUIREMENTS
Weekly reports, missed visit logs, financial impact evidence, investigation links.

---

## QA-WF-08 — HHCAHPS MONITORING & RESPONSE

### 1. POLICY REFERENCES
- QA-SM-002 Patient Experience; 42 CFR § 484.245(b)(1)(iii); HH QRP Quick Reference Guide

### 2. PROCESS OVERVIEW
Annual decision point (exemption vs vendor) and ongoing monitoring of HHCAHPS results with improvement actions.

### 3. TRIGGER(S)
- Annual decision (March 31 PER or vendor submission)
- Monthly vendor submission (if non-exempt)
- Preview report release

### 4. RESPONSIBLE ROLES
- **Primary:** HHCAHPS Coordinator
- **Supporting:** QAPI Lead, Compliance Officer, Administrator
- **Approval:** Administrator; Governing Body (exemption decision)

### 5. INPUTS
- Prior Apr–Mar eligible unique patient count
- Vendor contract & monthly submission status
- Preview reports
- Patient comments

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Count eligible unique patients (Apr–Mar window) | HHCAHPS Coord / Data | Counting worksheet | By March |
| 2 | Decide exemption vs participation | Admin + QAPI Lead | Decision memo | By March 15 |
| 3 | If ≤59: file Participation Exemption Request (PER) with CMS | HHCAHPS Coord | CMS PER submission | By March 31 |
| 4 | If ≥60: verify vendor contract & monthly submissions | HHCAHPS Coord | Vendor status log | Monthly |
| 5 | Review preview reports; address data issues | HHCAHPS Coord | Preview response | Per CMS schedule |
| 6 | Use HHCAHPS data in QAPI dashboard | QAPI Lead | QA-FM-003 | Monthly |
| 7 | Use proxy survey if vendor gap | HHCAHPS Coord | QA-FM-008 Patient Satisfaction Survey (HHCAHPS) Proxy | As needed |
| 8 | PIP if communication/care composite below target | QAPI Lead | QA-FM-002 | Annual planning |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-008, QA-FM-003, QA-FM-002, GV-FM-005, CMS PER confirmation.

### 8. APPROVALS
Administrator approves exemption decision; Governing Body informed.

### 9. OUTPUTS
PER confirmation (if exempt), vendor records (if participating), monthly submission evidence, PIP (if triggered).

### 10. SLA / DEADLINES
PER by March 31; vendor monthly submissions; preview response per CMS.

### 11. ESCALATION LOGIC
Missed PER deadline → HH QRP APU reduction → escalate to Administrator + Governing Body; documented as compliance deficiency.

### 12. FAILURE CONDITIONS
Missed HHCAHPS / PER = 2% APU Market Basket Update reduction (Annual Payment Update penalty under § 484.245).

### 13. AUDIT REQUIREMENTS
PER confirmation or vendor submission evidence for each reporting period; CMS correspondence.

---

## QA-WF-09 — STAR RATING & PUBLIC REPORT MONITORING

### 1. POLICY REFERENCES
- QA-SM-004 Star Ratings & Public Reporting; 42 CFR § 484.245

### 2. PROCESS OVERVIEW
Monitor Care Compare Star Rating components (Quality of Patient Care, Patient Survey), take action on low performers, and plan improvement.

### 3. TRIGGER(S)
- Preview star file release (quarterly)
- Refresh of Care Compare (quarterly)
- Rating drop

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead; HHCAHPS Coord
- **Supporting:** Clinical Manager, Data Analyst
- **Approval:** QAPI Committee; Governing Body briefed

### 5. INPUTS
- CMS preview star report; Care Compare public data; internal OASIS & HHCAHPS data

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Download preview star report | QAPI Lead | Local archive | Day of release |
| 2 | Validate data; submit corrections (data correction window) | QAPI Lead | CMS correction form | Per CMS window |
| 3 | Benchmark vs national / state | Data Analyst | QA-FM-011 Outcome Benchmarking Comparison Report | ≤ 14 days |
| 4 | Develop/update improvement plan | QAPI Lead | QA-FM-009 Star Rating Improvement Action Plan | ≤ 30 days |
| 5 | Committee & Board brief | QAPI Lead | QA-FM-001; GV-FM-023 | Next meetings |
| 6 | PIP if material drop | QAPI Lead | QA-FM-002 | Per plan |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-009, QA-FM-011, QA-FM-002, QA-FM-001, GV-FM-023.

### 8. APPROVALS
QAPI Committee approves action plan; Governing Body briefed.

### 9. OUTPUTS
Preview archive, corrections submitted, benchmarking report, improvement plan, PIP (if applicable).

### 10. SLA / DEADLINES
Corrections within CMS data correction window; action plan within 30 days of preview release.

### 11. ESCALATION LOGIC
Rating drop of ≥ ½ star → priority action; Governing Body briefed at next meeting.

### 12. FAILURE CONDITIONS
No improvement plan for low stars = QAPI weakness; marketplace reputational and referral risk.

### 13. AUDIT REQUIREMENTS
Archived preview reports; data correction submissions; action plans; minutes.

---

## QA-WF-10 — QAPI SELF-ASSESSMENT (ANNUAL)

### 1. POLICY REFERENCES
- QA-PG-001; CO-CP-001; 42 CFR § 484.65(e)

### 2. PROCESS OVERVIEW
Annual structured self-assessment of QAPI program effectiveness against § 484.65 elements.

### 3. TRIGGER(S)
- Annual (aligned with QAPI charter review)

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead
- **Supporting:** Compliance Officer, Clinical Manager, Administrator
- **Approval:** QAPI Committee; Governing Body

### 5. INPUTS
- Prior assessment
- Dashboards (12 months), PIPs, adverse events, HHCAHPS, audits

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Complete self-assessment checklist | QAPI Lead | QA-FM-010 QAPI Self-Assessment Annual Checklist | Annual |
| 2 | Identify gaps & improvement actions | QAPI Lead | Gap log | Annual |
| 3 | Committee review | Committee | QA-FM-001 | Annual |
| 4 | Board acceptance | Chair | GV-FM-005; GV-FM-023 | Annual |
| 5 | Update charter & plan as needed | QAPI Lead | EN-FM-007 | ≤ 30 days post-review |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-010, QA-FM-001, GV-FM-005, GV-FM-023, EN-FM-007.

### 8. APPROVALS
Committee and Governing Body annually.

### 9. OUTPUTS
Completed checklist, gap log, updated charter.

### 10. SLA / DEADLINES
Annual.

### 11. ESCALATION LOGIC
Material gaps → CAP within 30 days; Board-level issues escalated.

### 12. FAILURE CONDITIONS
No self-assessment = indicator of ineffectiveness per Appendix B.

### 13. AUDIT REQUIREMENTS
Completed checklist, evidence of Committee and Board review.

---

## QA-WF-11 — POLICY EFFECTIVENESS MONITORING

### 1. POLICY REFERENCES
- QA-PG-001; EN-LC-001 Policy Lifecycle

### 2. PROCESS OVERVIEW
Assesses whether implemented policies/CAPs achieved the intended outcome (sustained change, not just paper change).

### 3. TRIGGER(S)
- Post-CAP implementation (≥90 days)
- Post-PIP closure
- Post-policy revision

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead
- **Supporting:** Policy Owners, Department Heads
- **Approval:** QAPI Committee

### 5. INPUTS
- Baseline data, target, post-implementation data

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Define metric & measurement window for each implemented change | QAPI Lead | QA-FM-012 Policy Effectiveness Monitoring Worksheet | At CAP/PIP closure |
| 2 | Collect post-implementation data | Data Analyst | Reports | 30/60/90/180 days |
| 3 | Compare to target | QAPI Lead | QA-FM-012 | Per window |
| 4 | Decide: sustain, revise, re-open | Committee | QA-FM-001 | Per result |
| 5 | Document outcome | QAPI Lead | QA-FM-012 | At closure |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-012, QA-FM-001, QA-FM-005.

### 8. APPROVALS
Committee approves closure or reopening.

### 9. OUTPUTS
Effectiveness worksheets, decisions log.

### 10. SLA / DEADLINES
30/60/90 day measurement windows.

### 11. ESCALATION LOGIC
Non-sustained improvement → reopen PIP.

### 12. FAILURE CONDITIONS
Missing effectiveness evidence = Appendix B weakness — surveyors flag "paper compliance."

### 13. AUDIT REQUIREMENTS
Worksheets per closed CAP/PIP; decisions recorded.

---

## QA-WF-12 — PATIENT SAFETY EVENT COMMUNICATION

### 1. POLICY REFERENCES
- QA-AE-001; CL-PA-004 Patient Rights Communication
- 42 CFR § 484.50 (Patient rights); § 484.65 (QAPI)

### 2. PROCESS OVERVIEW
Structured communication with patient/family following a patient safety event (disclosure practice), plus internal communication to staff and Board.

### 3. TRIGGER(S)
- Any adverse event reaching the patient
- Sentinel event

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead + Clinical Manager
- **Supporting:** Risk Manager, Administrator, Legal
- **Approval:** Administrator; Legal concurrence

### 5. INPUTS
- Event details, RCA, CAP

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Determine disclosure requirement (patient harm) | Clinical Mgr + Legal | Decision memo | Within 24h |
| 2 | Patient/family disclosure meeting | Clinical Mgr + Admin | Meeting notes; CL-FM-053 Multi-Disciplinary Care Conference Notes | Within 72h of determination |
| 3 | Log communication | QAPI Lead | QA-FM-013 Patient Safety Event Communication Log | At communication |
| 4 | Internal staff communication (root-cause lesson learned) | QAPI Lead | Memo | Within 14 days |
| 5 | Board notification for sentinel events | Administrator | GV-FM-005 | Next Board meeting (or emergency) |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-013, CL-FM-053, GV-FM-005, CL-FM-049 Patient Complaint/Grievance Documentation.

### 8. APPROVALS
Administrator + Legal before disclosure; Board informed.

### 9. OUTPUTS
Disclosure notes, communication log, internal memo, Board minutes.

### 10. SLA / DEADLINES
Disclosure within 72h of determination; Board notification at next meeting (emergency if sentinel).

### 11. ESCALATION LOGIC
Allegations of negligence/harm → Legal engaged immediately; Risk Manager coordinates with insurance carrier.

### 12. FAILURE CONDITIONS
Failure to disclose to patient when required = patient rights violation (§ 484.50), trust damage, litigation risk.

### 13. AUDIT REQUIREMENTS
Per-event communication log with dates, attendees, content; Board minute evidence for sentinel.

---

## MEETING MINUTES MATRIX (QA DOMAIN)

The QAPI Committee is the core QAPI deliberative body per 42 CFR § 484.65. Every QAPI workflow produces committee minutes, and Governing Body ownership of QAPI must be visible in Board minutes.

| Workflow | Body Convened | Minutes Artifact | Retention |
|----------|---------------|------------------|-----------|
| QA-WF-01 QAPI Program Governance | QAPI Committee → Governing Body (annual approval) | **QA-FM-001 QAPI Committee Meeting Minutes Template** + **GV-FM-005 Governing Body Meeting Minutes** | 6 yrs |
| QA-WF-02 Monthly QAPI Committee Cycle | QAPI Committee | **QA-FM-001** | 6 yrs |
| QA-WF-03 PIP Charter → Execution → Closeout | QAPI Committee (approval + monitoring) | **QA-FM-001** | 6 yrs |
| QA-WF-04 Adverse Event RCA | QAPI Committee + (if material) Compliance Committee + Governing Body | **QA-FM-001** + **CO-FM-024** + **GV-FM-005** | 7 yrs / 10 yrs (FCA) |
| QA-WF-05 Infection Control / Surveillance | QAPI Committee → Governing Body (quarterly) | **QA-FM-001** + **GV-FM-005** | 6 yrs |
| QA-WF-06 LUPA Prevention | QAPI Committee | **QA-FM-001** | 6 yrs |
| QA-WF-07 HHCAHPS / Satisfaction | QAPI Committee → Governing Body (quarterly) | **QA-FM-001** + **GV-FM-005** | 6 yrs |
| QA-WF-08 Star Rating Improvement | QAPI Committee + Governing Body | **QA-FM-001** + **GV-FM-005** | 6 yrs |
| QA-WF-09 Annual QAPI Self-Assessment | QAPI Committee + Governing Body | **QA-FM-001** + **GV-FM-005** | 6 yrs |
| QA-WF-10 Outcome Benchmarking | QAPI Committee | **QA-FM-001** | 6 yrs |
| QA-WF-11 Policy Effectiveness Monitoring | QAPI Committee | **QA-FM-001** | 6 yrs |
| QA-WF-12 Patient Safety Event Communication | QAPI Committee + Compliance (if breach) | **QA-FM-001** + **CO-FM-024** | 7 yrs |

> QAPI Committee minutes (QA-FM-001) are the **single most-tested artifact** in a § 484.65 survey. Surveyors verify: monthly/quarterly cadence, documented PIPs, governing body oversight. Gaps trigger Condition-Level QAPI deficiency.

---

## DOMAIN-LEVEL VALIDATION CHECK

- [x] All QA policies (PG, SM, AE, PI) mapped to ≥1 workflow.
- [x] All 13 QA-FM forms (QA-FM-001..013) referenced.
- [x] Cross-domain forms (GV-FM-005, GV-FM-023, CL-FM-011, CL-FM-012, CL-FM-021, CL-FM-030, CL-FM-045, CL-FM-047, CL-FM-049, CL-FM-053, CO-FM-004, EN-FM-007, EN-FM-008, FN-FM-009, FN-FM-010, HR-FM-017, RM-FM-006) mapped.
- [x] Every workflow includes: forms, deadlines, approvals, escalation, failure conditions, audit requirements.
- [x] 42 CFR § 484.65 cited; HH QRP references included.
