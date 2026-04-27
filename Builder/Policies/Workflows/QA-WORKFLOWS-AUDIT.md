# QA — QAPI SUPPORT AUDIT LAYER

> Hardened audit workflows that prepare and validate the data feeding
> QA-WF-03 (Quarterly QAPI Committee Review). These workflows ensure
> QAPI consumes verified evidence, not raw observations.

---

## QA-WF-13 — KPI DATA AGGREGATION

### 1. POLICY REFERENCES
- QA-PG-001 QAPI Program; EN-CM-001 Enterprise KPIs; 42 CFR § 484.65(b)

### 2. PROCESS OVERVIEW
Monthly aggregation workflow that collects every quality, financial, HR, IT, and risk KPI from source systems and produces the canonical Enterprise KPI Dataset that feeds QA-WF-02 (Monthly Quality Indicator Dashboard) and QA-WF-03. Source workflows: CL-WF-35 (outcome monitoring), CL-WF-34 (rehospitalization), CO-WF-29 (RCM exceptions), HR-WF-19 (training compliance), IT-WF-23 (PHI access), RM-WF-17 (incident trend).

### 3. TRIGGER(S)
- **Time-based:** Monthly, by 5th business day
- Conditional: any KPI source-system schema change → re-run

### 4. RESPONSIBLE ROLES
- **Primary:** QA Analyst
- **Supporting:** IT Data Owner, Domain KPI Owners
- **Approval:** QAPI Lead

### 5. INPUTS
- Source system extracts (EMR, billing, HR, IT, RM)
- Source workflows: CL-WF-34, CL-WF-35, CO-WF-29, HR-WF-19, IT-WF-23, RM-WF-17

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull source-system extracts | QA Analyst | EN-FM-034 | Day 1 |
| 2 | Validate schema and completeness; reconcile counts | QA Analyst | QA-FM-020 | Day 2 |
| 3 | Compute KPIs against canonical definitions | QA Analyst | QA-FM-020 | Day 3 |
| 4 | Produce Enterprise KPI Dataset (signed) | QA Analyst | EN-FM-034 | Day 4 |
| 5 | Feed dataset to QA-WF-02 dashboard production | QA Analyst | QA-FM-020 | Day 5 |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-020, EN-FM-034, EN-FM-022

### 8. APPROVALS
QAPI Lead attests dataset.

### 9. OUTPUTS
Enterprise KPI Dataset (immutable snapshot); reconciliation evidence; lineage manifest.

### 10. SLA / DEADLINES
Monthly by 5th business day; QA-WF-02 publication depends on it.

### 11. ESCALATION LOGIC
Source-system gap → IT-WF-14 change-mgmt request. Reconciliation failure → QA-WF-16 (data validation) hold. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed monthly run blocks QA-WF-02 and therefore QA-WF-03 closure. Unreconciled data → invalid QAPI conclusions; survey deficiency.

### 13. AUDIT REQUIREMENTS
Per-cycle log: extract hashes, reconciliation evidence, dataset hash, sign-off. Retention ≥6 years. Cross-referenced to QA-WF-02, QA-WF-03, QA-WF-16.

---

## QA-WF-14 — PERFORMANCE INDICATOR TRACKING

### 1. POLICY REFERENCES
- QA-PG-001; QA-PI-001; 42 CFR § 484.65(b)

### 2. PROCESS OVERVIEW
Monthly tracking workflow that monitors each declared QAPI Performance Indicator against threshold and target. Operates on the Enterprise KPI Dataset produced by QA-WF-13. Triggers QA-WF-04 (PIP) when an indicator regresses materially. Hardens QA-WF-02. Feeds QA-WF-03 and QA-WF-09 (Star Rating monitoring).

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any indicator regression > control threshold

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead
- **Supporting:** QA Analyst, Clinical Manager
- **Approval:** Administrator

### 5. INPUTS
- Enterprise KPI Dataset (QA-WF-13 output)
- Indicator thresholds; benchmark targets
- Source workflows: QA-WF-13, CL-WF-35, CL-WF-34

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Score each indicator vs. threshold and target | QAPI Lead | QA-FM-020 | Day 6 |
| 2 | Generate trend chart per indicator | QA Analyst | QA-FM-020 | Day 7 |
| 3 | Flag PIP candidates per QA-WF-04 | QAPI Lead | QA-FM-021 | Day 8 |
| 4 | Compile indicator scorecard; feed QA-WF-02 and QA-WF-03 | QAPI Lead | EN-FM-022 | Day 9 |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-020, QA-FM-021, EN-FM-022, EN-FM-034

### 8. APPROVALS
QAPI Lead signs scorecard. Administrator attests PIP triggers.

### 9. OUTPUTS
Indicator scorecard; trend charts; PIP candidate memo.

### 10. SLA / DEADLINES
Monthly by 9th business day.

### 11. ESCALATION LOGIC
Material regression → QA-WF-04 PIP. Star-rating impact → QA-WF-09. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure. Unflagged regression → QAPI program deficiency, Star rating decline.

### 13. AUDIT REQUIREMENTS
Per-cycle log: scorecard, trend charts, PIP triggers, sign-offs. Retention ≥6 years. Cross-referenced to QA-WF-13, QA-WF-04, QA-WF-09, QA-WF-03.

---

## QA-WF-15 — TREND ANALYSIS

### 1. POLICY REFERENCES
- QA-PG-001; 42 CFR § 484.65(b)

### 2. PROCESS OVERVIEW
Quarterly trend-analysis workflow producing structured pattern detection across clinical, financial, HR, IT, and risk indicators. Uses control-chart logic (XmR / EWMA) on the Enterprise KPI Dataset to identify special-cause variation. Aggregates QA-WF-13 + QA-WF-14 outputs. Feeds QA-WF-03 and QA-WF-04.

### 3. TRIGGER(S)
- **Time-based:** Quarterly (pre-QA-WF-03 packet)
- Conditional: any indicator with 3 consecutive months of regression

### 4. RESPONSIBLE ROLES
- **Primary:** QA Analyst
- **Supporting:** QAPI Lead
- **Approval:** QAPI Committee Chair

### 5. INPUTS
- Last 12 months of Enterprise KPI Datasets (QA-WF-13)
- Indicator scorecards (QA-WF-14)
- Source workflows: QA-WF-13, QA-WF-14

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Build 12-month indicator panel | QA Analyst | QA-FM-020 | Day 1 |
| 2 | Apply XmR/EWMA control chart per indicator | QA Analyst | QA-FM-020 | Day 2–3 |
| 3 | Identify special-cause vs. common-cause variation | QA Analyst | QA-FM-020 | Day 4 |
| 4 | Document pattern hypotheses and likely root causes | QA Analyst | QA-FM-021 | Day 5 |
| 5 | Compile Trend Analysis Memo for QA-WF-03 packet | QAPI Lead | EN-FM-022 | Day 6 |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-020, QA-FM-021, EN-FM-022, EN-FM-034

### 8. APPROVALS
QAPI Committee Chair signs.

### 9. OUTPUTS
Quarterly Trend Analysis Memo; control charts; pattern register.

### 10. SLA / DEADLINES
Quarterly, ≥5 business days before QA-WF-03 meeting.

### 11. ESCALATION LOGIC
Special-cause regression → QA-WF-04 PIP candidate. Cross-domain pattern → EN-WF-12 enterprise risk. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unidentified special-cause variation → undetected program deterioration.

### 13. AUDIT REQUIREMENTS
Per-cycle log: panel hash, charts, pattern register, sign-off. Retention ≥6 years. Cross-referenced to QA-WF-13, QA-WF-14, QA-WF-04, QA-WF-03, EN-WF-12.

---

## QA-WF-16 — QAPI DATA VALIDATION

### 1. POLICY REFERENCES
- QA-PG-001; 42 CFR § 484.65(b); CMS data integrity guidance

### 2. PROCESS OVERVIEW
Continuous data-quality validation workflow ensuring that data feeding QAPI is complete, consistent, and lineage-traceable. Validates QA-WF-13 outputs against source-system source-of-truth. Hard gates QA-WF-02 publication and QA-WF-03 closure. Aggregates evidence from CL-WF-27 (OASIS audit), CO-WF-23 (pre-bill), CO-WF-25 (recon).

### 3. TRIGGER(S)
- **Continuous:** Each KPI dataset publication
- **Time-based:** Quarterly aggregate validation report

### 4. RESPONSIBLE ROLES
- **Primary:** Data Steward (IT)
- **Supporting:** QA Analyst, Domain Owners
- **Approval:** QAPI Lead; IT Director for material data issues

### 5. INPUTS
- KPI dataset (QA-WF-13)
- Source-system samples for verification
- Source workflows: QA-WF-13, CL-WF-27, CO-WF-23, CO-WF-25

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Verify schema, row counts, distribution sanity | Data Steward | EN-FM-034 | Per dataset |
| 2 | Sample 1% of records; trace to source | Data Steward | CO-FM-021 | Per dataset |
| 3 | Reconcile against external benchmarks (CASPER/iQIES) | Data Steward | EN-FM-034 | Quarterly |
| 4 | Issue validation hold if any defect | Data Steward | CO-FM-021 | Per case |
| 5 | Compile quarterly validation report; feed QA-WF-03 | QAPI Lead | CO-FM-024 | Quarterly |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-024, EN-FM-034

### 8. APPROVALS
QAPI Lead attests; IT Director signs material defects.

### 9. OUTPUTS
Per-dataset validation log; quarterly QAPI Data Validation Report; defect register.

### 10. SLA / DEADLINES
Continuous; quarterly report ≥5 business days before QA-WF-03 meeting.

### 11. ESCALATION LOGIC
Validation hold blocks QA-WF-02 publication and QA-WF-03 closure until resolved. Source-system defect → IT-WF-14 change request. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Bypassing validation hold → invalid QAPI conclusions; survey citation. Missed quarterly report blocks QA-WF-03.

### 13. AUDIT REQUIREMENTS
Per-dataset log: schema check, sample trace evidence, reconciliation evidence, holds, sign-off. Retention ≥6 years. Cross-referenced to QA-WF-13, QA-WF-02, QA-WF-03, IT-WF-14.

---

## QA-WF-17 — PERFORMANCE IMPROVEMENT PLAN MONITORING

### 1. POLICY REFERENCES
- QA-PIP-001 PIP Lifecycle; 42 CFR § 484.65(c)

### 2. PROCESS OVERVIEW
Quarterly monitoring workflow that tracks every active PIP from QA-WF-04 through baseline → intervention → remeasurement → sustainment. Hardens QA-WF-04 monitoring. Validates statistical significance and intervention fidelity. Feeds QA-WF-03 and GV-WF-01.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: PIP remeasurement failure

### 4. RESPONSIBLE ROLES
- **Primary:** QAPI Lead
- **Supporting:** PIP Owner, QA Analyst
- **Approval:** QAPI Committee Chair; Governing Body for material PIPs

### 5. INPUTS
- Active PIP register (QA-WF-04)
- Remeasurement data (QA-WF-13)
- Source workflows: QA-WF-04, QA-WF-13, QA-WF-15

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull active PIP register and remeasurement data | QAPI Lead | QA-FM-021 | Day 1 |
| 2 | Score each PIP against intervention plan and remeasurement target | QAPI Lead | QA-FM-021 | Day 2 |
| 3 | Validate statistical significance of improvement | QA Analyst | QA-FM-020 | Day 3 |
| 4 | Audit intervention fidelity (was the planned intervention actually executed?) | QAPI Lead | CO-FM-021 | Day 4 |
| 5 | Decide: continue / revise / new PIP / sustain / close | QAPI Committee | QA-FM-021 | Day 5 |
| 6 | Compile PIP Monitoring Report; feed QA-WF-03 + GV-WF-01 | QAPI Lead | CO-FM-024 | Day 6 |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-020, QA-FM-021, CO-FM-021, CO-FM-024, GV-FM-023

### 8. APPROVALS
QAPI Committee Chair signs. Governing Body acknowledges material PIPs via GV-WF-01.

### 9. OUTPUTS
Quarterly PIP Monitoring Report; per-PIP scorecard; decision register.

### 10. SLA / DEADLINES
Quarterly, before QA-WF-03 meeting.

### 11. ESCALATION LOGIC
PIP remeasurement failure → revise intervention or escalate to mandatory new PIP. Sustained PIP failure → Governing Body escalation via GV-WF-01. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unmonitored PIP → CMS QAPI deficiency citation.

### 13. AUDIT REQUIREMENTS
Per-cycle log: PIP register, scorecards, decisions, remeasurement evidence, sign-off. Retention ≥6 years. Cross-referenced to QA-WF-04, QA-WF-13, QA-WF-15, GV-WF-01, QA-WF-03.

---

## QA-WF-18 — POLICY EFFECTIVENESS MONITORING

### 1. POLICY REFERENCES
- QA-PG-001; EN-CM-001; 42 CFR § 484.65

### 2. PROCESS OVERVIEW
Quarterly evaluation of whether the agency's policies (270 active) are producing the compliance outcomes they specify. Aggregates audit findings across all CL-WF-26..37, CO-WF-23..30, HR-WF-18..21, RM-WF-16..20, IT-WF-21..25 and maps deficiency patterns to the policies that govern them. Hardens QA-WF-11. Triggers EN-WF-01 (policy lifecycle update) when policy is the root cause. Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: same defect pattern detected in 3 consecutive audits

### 4. RESPONSIBLE ROLES
- **Primary:** Compliance Officer
- **Supporting:** Domain Policy Owners
- **Approval:** QAPI Committee; Governing Body for material policy revisions

### 5. INPUTS
- All audit reports for the quarter
- Active policy index (270 policies)
- Source workflows: ALL audit workflows; EN-WF-01

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Aggregate defect register across every audit cycle | Compliance Officer | CO-FM-024 | Day 1 |
| 2 | Map each defect to governing policy ID | Compliance Officer | EN-FM-022 | Day 2 |
| 3 | Identify policies with sustained ineffectiveness | Compliance Officer | EN-FM-019 | Day 3 |
| 4 | Issue policy revision tickets via EN-WF-01 | Compliance Officer | EN-FM-007 | Day 4 |
| 5 | Compile Policy Effectiveness Report; feed QA-WF-03 | Compliance Officer | CO-FM-024 | Day 6 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-024, EN-FM-007, EN-FM-019, EN-FM-022

### 8. APPROVALS
QAPI Committee + Compliance Officer sign. Governing Body acknowledges material policy revisions via GV-WF-01.

### 9. OUTPUTS
Quarterly Policy Effectiveness Report; policy-level defect map; revision queue.

### 10. SLA / DEADLINES
Quarterly, before QA-WF-03 meeting.

### 11. ESCALATION LOGIC
Sustained policy ineffectiveness → mandatory revision via EN-WF-01. Cross-domain policy gap → EN-WF-12 enterprise risk register. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unrevised ineffective policy → systemic non-compliance, survey citation.

### 13. AUDIT REQUIREMENTS
Per-cycle log: defect aggregate, policy map, revision tickets, sign-offs. Retention ≥6 years. Cross-referenced to ALL audit workflows, EN-WF-01, GV-WF-01, QA-WF-03.

---
