# QA Domain — Manual ACHC Tagging Report
## Pass: Corridor Print Crosswalk Pages 7–31 | Surveyor: ACHC Home Health Surveyor Mode

---

## Scope

- **Domain:** QA (Quality Assurance / Performance Improvement)
- **Primary Source:** Corridor print crosswalk pages 7–31 (PDF read directly)
- **Secondary Source (validation only):** ACHC Items Needed for Survey — HH 05.2025 (page 756)
- **Final Authority:** Policy content — if content did not match Corridor row, no tag was applied
- **Page 756 Used for Tagging?** NO

---

## Validation Totals

| Metric | Count |
|--------|-------|
| Total QA policies reviewed | 19 |
| Mapped — DIRECT | 8 |
| Mapped — PARTIAL | 11 |
| Total mapped (DIRECT + PARTIAL) | 19 |
| Unmapped (NONE) | 0 |
| Modern operational overlay flags | 1 (QA-PI-006) |
| Semantic gravity well note | 5-001 used in 12/19 — structurally appropriate for QA domain |

---

## Corridor Section 5 — Quality Outcomes/Performance Improvement (Complete Row Index)

| Row | Policy/Procedure | Evidence | ACHC Standards | CoP |
|-----|-----------------|----------|----------------|-----|
| 5-001 | Improving Organizational Performance | P, D, I | HH6-1A, HH6-1B.01, HH6-1C, HH6-1D.01, HH6-3A.01, HH6-4A.01, HH6-5A | 484.65, 484.70(b), 484.75(b)(8) |
| 5-002 | Patient Focused Performance Improvement | — | — | 484.65 |
| 5-003 | Measuring Performance of Environmental Safety Program | D | — | HH6-4A.02 | 484.65 |
| 5-004 | Annual Organization Evaluation | P, D, I | HH6-4A.04, HH6-4A.05 | 484.65, 484.105(i) |
| 5-005 | Incident Reporting | P, D, I | HH2-4A, HH6-6A, HH7-7A.01 | 484.65 |
| 5-006 | Serious Adverse Events | P, D, I | HH6-6A | 484.65 |
| 5-007 | Root Cause Analysis/Action Plan | D, I | HH6-6A | 484.65 |
| 5-008 | Aggregation of Data/Information | I | HH6-4A, HH7-9A.01 | 484.65 |
| 5-009 | External Databases | I | HH6-3A.01 | — |
| 5-010 | Patient and Family/Caregiver Experience of Care Survey | I | HH6-4A.05 | 484.65 |

**Section 6 rows also used (for QA-SM-002 — Infection Surveillance):**
- 6-014: Evaluating and Maintaining Records of Infections Among Patients (HH7-1D.01, HH7-2A.01, HH7-2B.01)
- 6-015: Evaluating and Maintaining Records of Infections Among Personnel (HH7-1D, HH7-2A.01, HH7-2B.01)

---

## Gravity Well Acknowledgment

`5-001` (Improving Organizational Performance) is the parent row for the entire QAPI program. It appears as primary or secondary source in 12 of 19 QA policies. This is structurally appropriate — the QA domain IS the QAPI program — not a mapping error. Every use of 5-001 was evaluated against whether a more specific Section 5 row existed:

| Row Used | More Specific? | If Yes, Used Instead |
|----------|---------------|----------------------|
| 5-005/5-006 for adverse events | Yes — more specific than 5-001 | Used for QA-AE-001 |
| 5-007 for RCA | Yes — more specific | Used for QA-AE-002 and QA-AE-003 |
| 5-002 for UR/UM | Yes — patient-focused PI | Used for QA-SM-001 |
| 5-009 for benchmarking | Yes — external databases | Used for QA-PI-003 |
| 5-010 for HHCAHPS | Yes — exact match | Used for QA-SM-003 |
| 5-001 remainder | No more specific row | Used only where no narrower row exists |

---

## QA Policies by Subdomain

### AE — Adverse Events (4 policies)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| QA-AE-001 | Adverse Event Identification & Reporting | 5-005 Incident Reporting; 5-006 Serious Adverse Events | DIRECT |
| QA-AE-002 | Root Cause Analysis Process | 5-007 Root Cause Analysis/Action Plan | DIRECT |
| QA-AE-003 | Corrective Action Plan Development & Tracking | 5-007 Root Cause Analysis/Action Plan | PARTIAL |
| QA-AE-004 | Patient Safety Program | 5-001 Improving Organizational Performance; 5-006 | PARTIAL |

**QA-AE-003 rationale:** 5-007 covers action plans. QA-AE-003 adds structured CAP tracking with measurable timelines, accountability cycles, and effectiveness validation — an operational layer beyond the Corridor's requirement that an action plan exist.

**QA-AE-004 rationale:** Patient Safety as a formal, dedicated integrated program with hazard identification infrastructure and safety reporting workflows exceeds the Corridor's general QAPI framework and adverse events rows.

### PG — Program Governance (3 policies)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| QA-PG-001 | QAPI Program Establishment & Governance | 5-001 Improving Organizational Performance | DIRECT |
| QA-PG-002 | QAPI Plan Development & Annual Review | 5-001; 5-004 Annual Organization Evaluation | DIRECT |
| QA-PG-003 | QAPI Committee Structure & Meeting Requirements | 5-001 Improving Organizational Performance | PARTIAL |

**QA-PG-003 rationale:** Committee composition, meeting frequency, quorum, and escalation protocols are operational governance details not specified by 5-001's general QAPI framework requirement.

### PI — Performance Improvement (7 policies)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| QA-PI-001 | Performance Improvement Project Management | 5-001; 5-002 Patient Focused PI | DIRECT |
| QA-PI-002 | Quality Indicator Monitoring & Reporting | 5-008 Aggregation of Data; 5-001 | PARTIAL |
| QA-PI-003 | Clinical Outcome Benchmarking | 5-009 External Databases | DIRECT |
| QA-PI-004 | Data-Driven Decision Making | 5-008 Aggregation of Data/Information | PARTIAL |
| QA-PI-005 | Staff Competency Integration with QAPI | 5-001 Improving Organizational Performance | PARTIAL |
| QA-PI-006 | Visit Utilization & LUPA Risk Management Program | 5-001; 5-008 | PARTIAL |
| QA-PI-007 | Staff Competency Impact on Patient Outcomes | 5-001 Improving Organizational Performance | PARTIAL |

**QA-PI-006 note:** MODERN_OPERATIONAL_OVERLAY flag applied. LUPA risk management is a post-PDGM (2020) reimbursement-management concept. Confidence rated MEDIUM — structural parent (QAPI framework) is valid; LUPA-specific content substantially exceeds print scope.

### SM — Surveillance & Monitoring (5 policies)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| QA-SM-001 | Utilization Review & Management | 5-002 Patient Focused Performance Improvement | PARTIAL |
| QA-SM-002 | Infection Surveillance & Trending | 6-014; 6-015 Evaluating and Maintaining Infection Records | DIRECT |
| QA-SM-003 | Patient Satisfaction Survey & Analysis | 5-010 Patient and Family/Caregiver Experience Survey | DIRECT |
| QA-SM-004 | Home Health Compare & Star Rating Monitoring | 5-009 External Databases; 5-004 Annual Organization Evaluation | PARTIAL |
| QA-SM-005 | Policy Effectiveness Monitoring and Outcome Validation | 5-001; 5-008 | PARTIAL |

**QA-SM-002 note:** Maps to Section 6 (Infection Control), not Section 5, because infection surveillance as a QA function has its dedicated Corridor home in Section 6 rows 6-014 and 6-015.

**QA-SM-004 rationale:** Home Health Compare and Star Ratings fit within 5-009 (External Databases) structurally, but the specific Star Rating response framework — monitoring public CMS rankings with formal response plans — is a modern public accountability overlay beyond the generic external database row.

---

## Cross-Domain Contradiction Check: QA vs. CL vs. CO

| Potential Overlap | QA Policy | CL/CO Policy | Verdict |
|------------------|-----------|-------------|---------|
| Infection surveillance | QA-SM-002 | CL-SD-016 (Infection Prevention & Control) | No contradiction. CL-SD-016 governs clinical infection prevention procedures; QA-SM-002 governs surveillance data collection and trending analysis. Different operational layers. |
| Adverse event reporting | QA-AE-001 | CO-IR-101 (Incident Reporting & RCA) | No contradiction. CO-IR-101 is compliance/regulatory incident reporting (abuse/neglect focus). QA-AE-001 is clinical adverse event management within QAPI. Different regulatory grounding. |
| QAPI governance | QA-PG-001/002/003 | GV domain (Governing Body oversight) | No contradiction. GV governs the Governing Body's authority; QA-PG governs the QAPI program itself. GV is the principal; QA is the program. |
| RCA/CAP | QA-AE-002/003 | CO-CP-004 (Compliance Investigations & Corrective Action) | Potential semantic overlap. CO-CP-004 addresses compliance corrective actions (regulatory investigations); QA-AE-002/003 address clinical adverse event RCA/CAP. Different triggers, different governance structures. No contradiction but cross-domain linkage noted. |

---

## NONE Policies

None. All 19 QA policies have at least a structural parent in Section 5 or Section 6 of the Corridor crosswalk. The QA domain is the operational embodiment of what Corridor Section 5 specifies — complete structural coverage was expected.

---

## Page 756 Non-Use Confirmation

**CONFIRMED:** Page 756 (ACHC Items Needed for Survey — Attachment Crosswalk) was NOT used for any tagging decision. All mappings were derived from direct review of the PDF pages 7–31 crosswalk (Sections 1–6) with policy content as final authority.

---

## All Policy IDs Processed

QA-AE-001, QA-AE-002, QA-AE-003, QA-AE-004, QA-PG-001, QA-PG-002, QA-PG-003, QA-PI-001, QA-PI-002, QA-PI-003, QA-PI-004, QA-PI-005, QA-PI-006, QA-PI-007, QA-SM-001, QA-SM-002, QA-SM-003, QA-SM-004, QA-SM-005
