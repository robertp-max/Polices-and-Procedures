# RM Domain — Manual ACHC Tagging Report
## Pass: Corridor Print Crosswalk Pages 7–31 | Surveyor: ACHC Home Health Surveyor Mode

---

## Scope

- **Domain:** RM (Risk Management)
- **Primary Source:** Corridor print crosswalk pages 7–31 (PDF read directly — primarily Section 5 and Section 6)
- **Secondary Source (validation only):** ACHC Items Needed for Survey — HH 05.2025 (page 756)
- **Final Authority:** Policy content — if content did not match Corridor row, no tag was applied
- **Page 756 Used for Tagging?** NO
- **Architectural Split Applied:** YES — see below

---

## Architectural Layer Split

Per the feedback framework, RM policies were evaluated against two distinct layers before mapping:

### A. Legacy Regulatory Crosswalk Layer (surveyable against Corridor rows)
ACHC/CoP/Title 22 requirements that appear in Corridor Section 5 or Section 6. These can receive DIRECT or PARTIAL mappings.

### B. Modern Operational Governance Layer (no Corridor equivalent)
Enterprise risk governance, modern California regulatory requirements post-dating the Corridor, legal/litigation management. These receive NONE + appropriate flags — not forced into legacy rows.

| RM-ER-001 | Enterprise Risk Management Program | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |
| RM-ER-003 | Risk Assessment & Prioritization | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |
| RM-ER-004 | Liability & Insurance Management | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |
| RM-ER-006 | Claims Management & Litigation Support | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |
| RM-OS-004 | Heat Illness Prevention Program | NONE | MODERN_REGULATORY_REQUIREMENT, CA_SPECIFIC_POST_CORRIDOR |

---

## Validation Totals

| Metric | Count |
|--------|-------|
| Total RM policies reviewed | 17 |
| Mapped — DIRECT | 4 |
| Mapped — PARTIAL | 8 |
| Unmapped — NONE | 5 |
| Modern Operational Governance Layer (NONE) | 4 |
| Modern CA Regulatory Requirement (NONE) | 2 (OS-004, SS-002 partial) |
| Duplicate semantic family flags | 1 (RM-OS-001 / RM-OS-101) |
| Cross-domain overlap flags | 2 (RM-ER-002 / QA-AE-001; RM-ER-005 / QA-PI-002) |

---

## Section 6 Rows Used for RM Domain

| Corridor Row | Policy/Procedure | Evidence | ACHC Standards | CoP |
|-------------|-----------------|----------|----------------|-----|
| 6-001 | Management of Exposures in Personnel | P, D, I, O, S | HH1-1A.01, HH7-1A, HH7-7A.01 | 484.70, 1910.134, 1910.1030 |
| 6-002 | Record Keeping | P, D, I, S | HH1-1A.01, HH7-1A | 484.70, 1904 series, 1910.1030 |
| 6-003 | Occupational Exposure Information and Training | P, D | HH1-1A.01, HH7-1A | 484.70, 1910.1030 |
| 6-017 | Communication of Hazards to Personnel | P, D, O | HH1-1A.01, HH7-1A, HH7-6A.01, HH7-6B.01 | 484.70 |
| 6-018 | Environmental Safety Program | P, D, I, O | HH7-2A.01, HH7-2B.01, HH7-6A.01, HH7-6B.01, HH7-7A.01, HH7-9A.01 | — |
| 6-028 | Tuberculosis Exposure Control Plan | P, D, I, O | HH7-2A.01, HH7-2B.01, HH7-9A.01 | 484.70 |
| 6-029 | Bloodborne Pathogens and HBV Exposure Control Plan | P, D, I, S | HH7-2A.01, HH7-2B.01 | 484.70, 1910.1030 |
| 6-034 | Organization Personnel Safety—Personal Safety | P, D, I, O | HH7-2A.01, HH7-2B.01, HH7-7A.01 | — |
| 6-035 | Organization Personnel Safety—Unsafe Home Visits | P, D, I, O | HH7-2A.01, HH7-2B.01, HH7-3A–3E | — |
| 6-036 | Vehicle Accident Reporting | D, I | HH7-2A.01, HH7-2B.01, HH7-7A.01 | — |
| 6-037 | Emergency Management Plan | P, D, I | HH7-2A.01, HH7-2B.01, HH7-3A–3E | 484.102 |

**Section 5 rows also used:**
- 5-005: Incident Reporting (HH2-4A, HH6-6A, HH7-7A.01 | CoP 484.65)
- 5-006: Serious Adverse Events (HH6-6A | CoP 484.65)
- 5-008: Aggregation of Data/Information (HH6-4A, HH7-9A.01 | CoP 484.65)

---

## RM Policies by Subdomain

### EP — Emergency Preparedness (3 policies)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| RM-EP-001 | Emergency Preparedness Program — Governing Policy | 6-037 Emergency Management Plan | DIRECT |
| RM-EP-002 | Emergency Preparedness Training & Testing Program | 6-037 Emergency Management Plan | PARTIAL |
| RM-EP-003 | Patient Emergency Communication Plan | 6-037 Emergency Management Plan | PARTIAL |

**EP gravity well note:** All three EP policies map to 6-037 — the sole Corridor EP row. This is structurally appropriate: the Emergency Preparedness subdomain maps entirely to the one Corridor row that governs EP programs. RM-EP-001 is DIRECT (the governing policy is the Corridor row); RM-EP-002 and RM-EP-003 are PARTIAL (training/testing program and patient communication plan are operational layers within the EP plan framework).

### ER — Enterprise Risk (6 policies)

| Policy ID | Title | Corridor Row(s) | Type | Flags |
|-----------|-------|----------------|------|-------|
| RM-ER-001 | Enterprise Risk Management Program | — | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |
| RM-ER-002 | Incident Reporting & Investigation | 5-005; 5-006 | DIRECT | CROSS_DOMAIN_OVERLAP_QA-AE-001 |
| RM-ER-003 | Risk Assessment & Prioritization | — | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |
| RM-ER-004 | Liability & Insurance Management | — | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |
| RM-ER-005 | Risk Trending & Pattern Analysis | 5-008 | PARTIAL | CROSS_DOMAIN_OVERLAP_QA-PI-002 |
| RM-ER-006 | Claims Management & Litigation Support | — | NONE | MODERN_OPERATIONAL_GOVERNANCE_LAYER |

**ER-domain analysis:** The RM-ER subdomain splits cleanly along the architectural layer boundary. RM-ER-001, 003, 004, and 006 are all enterprise risk governance concepts (ERM program, cross-domain risk scoring, liability/insurance, litigation support) that have no Corridor equivalent. RM-ER-002 and RM-ER-005 are operationally grounded in QAPI-adjacent Corridor rows (incident reporting, data aggregation) and can be legitimately mapped.

### OS — Occupational Safety (4 policies)

| Policy ID | Title | Corridor Row(s) | Type | Flags |
|-----------|-------|----------------|------|-------|
| RM-OS-001 | Cal/OSHA Injury & Illness Prevention Program (IIPP) | 6-018; 6-001; 6-002; 6-003; 6-017 | PARTIAL | — |
| RM-OS-002 | Airborne Transmissible Disease (ATD) Exposure Control Plan | 6-028 | PARTIAL | — |
| RM-OS-003 | Bloodborne Pathogen (BBP) Exposure Control Plan | 6-029 | DIRECT | — |
| RM-OS-004 | Heat Illness Prevention Program | — | NONE | MODERN_REGULATORY_REQUIREMENT, CA_SPECIFIC_POST_CORRIDOR |
| RM-OS-101 | Cal/OSHA Occupational Safety Program (IIPP) | 6-018; 6-017; 6-001 | PARTIAL | DUPLICATE_SEMANTIC_FAMILY_RM-OS-001 |

**RM-OS-003 note:** Only DIRECT in the OS subdomain. BBP Exposure Control Plan per 8 CCR §5193 / 29 CFR 1910.1030 maps exactly to Corridor row 6-029 — same regulatory citation, same program requirements.

**RM-OS-002 note:** ATD plan is PARTIAL to TB row (6-028) because TB is covered exactly; the full ATD scope (all airborne diseases, NIOSH respiratory protection program) substantially exceeds the TB-specific row.

**RM-OS-004 note:** Heat illness (8 CCR §5141.1 indoor standard, effective January 2025) is newer than the Corridor's general safety framework. No Corridor row exists. Not forced into Section 6 environmental safety rows — that would misrepresent this policy's California-specific regulatory obligation.

**Duplicate semantic family:** RM-OS-001 and RM-OS-101 appear to govern the same Cal/OSHA IIPP obligation at different layers (parent program vs. executive summary). This is a framework governance issue: consider parent/child relationship or supersession logic between these two policies.

### SS — Staff Safety (3 policies)

| Policy ID | Title | Corridor Row(s) | Type | Flags |
|-----------|-------|----------------|------|-------|
| RM-SS-001 | Staff Safety & Personal Security | 6-034; 6-035 | DIRECT | — |
| RM-SS-002 | Workplace Violence Prevention | 6-034; 6-035 | PARTIAL | MODERN_REGULATORY_REQUIREMENT, CA_SPECIFIC_POST_CORRIDOR |
| RM-SS-003 | Motor Vehicle Safety & Accident Reporting | 6-036 | PARTIAL | — |

**RM-SS-002 note:** California SB 553 (effective July 2024) mandates a formal Workplace Violence Prevention Plan, violent incident log, and annual training — requirements that substantially exceed the Corridor's unsafe home visit rows. The field-visit threat component aligns (6-034/6-035); the formal WVP plan infrastructure does not map to any Corridor row.

---

## NONE Policies — Consolidated Rationale

| Policy ID | Title | Category | Reason |
|-----------|-------|----------|--------|
| RM-ER-001 | Enterprise Risk Management Program | Modern Operational Governance | No ERM program row exists in Corridor. ERM as governance discipline post-dates crosswalk scope. |
| RM-ER-003 | Risk Assessment & Prioritization | Modern Operational Governance | No cross-domain risk scoring row exists. Corridor addresses risk per category, not enterprise-wide. |
| RM-ER-004 | Liability & Insurance Management | Modern Operational Governance | Insurance requirements are outside ACHC crosswalk scope entirely. |
| RM-ER-006 | Claims Management & Litigation Support | Modern Operational Governance | Legal/litigation functions have no Corridor equivalent. |
| RM-OS-004 | Heat Illness Prevention Program | Modern CA Regulatory Requirement | 8 CCR §5141.1 (indoor heat, effective Jan 2025) post-dates and exceeds Corridor scope. |

---

## Cross-Domain Overlap Documentation

| RM Policy | Overlapping Policy | Corridor Rows | Verdict |
|-----------|------------------|--------------|---------|
| RM-ER-002 | QA-AE-001 | 5-005, 5-006 | No contradiction. RM-ER-002 = risk domain incident management; QA-AE-001 = QAPI-integrated clinical adverse events. Same regulatory grounding, different operational triggers and governance structures. |
| RM-ER-005 | QA-PI-002 | 5-008 | No contradiction. RM-ER-005 = risk data trending; QA-PI-002 = quality indicator monitoring. Same analytical method (data aggregation), different governance application. |

---

## Page 756 Non-Use Confirmation

**CONFIRMED:** Page 756 (ACHC Items Needed for Survey — Attachment Crosswalk) was NOT used for any tagging decision. All mappings derived from direct review of PDF pages 7–31 with policy content as final authority.

---

## All Policy IDs Processed

RM-EP-001, RM-EP-002, RM-EP-003, RM-ER-001, RM-ER-002, RM-ER-003, RM-ER-004, RM-ER-005, RM-ER-006, RM-OS-001, RM-OS-002, RM-OS-003, RM-OS-004, RM-OS-101, RM-SS-001, RM-SS-002, RM-SS-003
