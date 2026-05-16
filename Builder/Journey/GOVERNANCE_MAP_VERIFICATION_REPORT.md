# Training Governance Map — Verification Report

**Generated**: 2026-05-10
**Source**: `Builder/Journey/170_Required_Lessons_grouped_40_Modules.md`
**Output files**:
- `170_Lessons_Governance_Map.csv` — 171 lines (1 header + 170 lesson rows, 22 columns)
- `40_Modules_Governance_Map.csv` — 41 lines (1 header + 40 module rows, 21 columns)

---

## Verification Summary

| Pass | Scope | Result | Changes |
|------|-------|--------|---------|
| **Pass 1** (initial generation) | Parse markdown → CSV | Generated 170 lessons across 40 modules | Baseline — N/A |
| **Pass 2** (title + role audit) | Every lesson title and role_applicability checked cell-by-cell against source checkmarks | **ZERO DISCREPANCIES** | None |
| **Pass 3** (heuristic audit) | survey_criticality, risk_level, remediation_required verified for all 170 lessons | **ZERO MISCLASSIFICATIONS** | None |
| **Pass 4** (rollup audit) | Programmatic re-computation of module-level rollups from lesson data | **ALL 40 MODULE ROLLUPS MATCH** | None |

**Total changes across all verification passes: NONE.**

The CSV produced in Pass 1 was correct on first generation. No corrections were required.

---

## Integrity Metrics

| Metric | Value |
|--------|-------|
| Total modules | 40 |
| Total lessons | 170 |
| Sum of per-module lesson counts | 170 |
| Unique lesson_ids | 170 (no duplicates) |
| Lesson header column count | 22 |
| Module header column count | 21 |

## Survey Criticality Distribution

| Level | Lesson Count |
|-------|-------------|
| CRITICAL | 8 |
| HIGH | 49 |
| MODERATE | 93 |
| LOW | 20 |
| **Total** | **170** |

## CRITICAL Lessons (8)

| lesson_id | lesson_title |
|-----------|-------------|
| Module-M03-L04 | Abuse, neglect, exploitation, and mandatory reporting |
| Module-M04-L07 | Breach identification and reporting |
| Module-M13-L03 | OASIS accuracy |
| Module-M15-L06 | Patient safety events and adverse event reporting |
| Module-M22-L04 | Medication administration |
| Module-M23-L02 | Clinical escalation and emergency response |
| Module-M33-L02 | OASIS review and submission |
| Module-M40-L01 | Incident oversight and follow-up |

## Modules at CRITICAL Max Severity (8)

| module_id | module_title |
|-----------|-------------|
| Module-M03 | Ethics / Respectful Communication |
| Module-M04 | HIPAA / Privacy Basics |
| Module-M13 | CMS CoP / Assessment |
| Module-M15 | Care Coordination / Documentation / Discharge |
| Module-M22 | RN / LVN Scope and Supervision |
| Module-M23 | Skilled Nursing Procedures |
| Module-M33 | Chart / OASIS / Patient Data Review |
| Module-M40 | Incident / Vendor Oversight |

---

## Column Schema — Lesson-Level CSV (22 columns)

| # | Column | Type | Notes |
|---|--------|------|-------|
| 1 | module_id | ID | `Module-M01` through `Module-M40` |
| 2 | module_title | String | From source markdown module headings |
| 3 | lesson_id | ID | `Module-M##-L##` (zero-padded, per-module sequence) |
| 4 | lesson_title | String | Exact match to source markdown |
| 5 | role_applicability | Pipe-delimited | Derived from source ✔/✖ checkmarks for RN, LVN, CNA, HHA, Admin, DON, Comp, HR, IT |
| 6 | pp_codes | String | **Blank** — pending policy registry mapping |
| 7 | federal_regulation_references | String | **Blank** — no hallucinated 42 CFR citations |
| 8 | cms_cop_references | String | **Blank** — no hallucinated CMS CoP citations |
| 9 | california_title22_references | String | **Blank** — no hallucinated Title 22 citations |
| 10 | achc_hh_standards | String | **Blank** — no hallucinated ACHC standards |
| 11 | workflow_ids | String | **Blank** — pending workflow registry |
| 12 | form_ids | String | **Blank** — pending form registry |
| 13 | evidence_requirements | Semicolon-delimited | 7-item evidence architecture string |
| 14 | survey_criticality | Enum | LOW, MODERATE, HIGH, or CRITICAL (heuristic from title) |
| 15 | risk_level | Enum | LOW, MODERATE, HIGH, or CRITICAL (mirrors survey_criticality) |
| 16 | retraining_frequency | String | `MAPPING_REVIEW_REQUIRED` on all rows |
| 17 | remediation_required | Boolean | `false` for LOW only; `true` for MODERATE/HIGH/CRITICAL |
| 18 | competency_required | Boolean | `true` on all rows |
| 19 | evidence_generation_required | Boolean | `true` on all rows |
| 20 | achc_mapping_confidence | String | `MAPPING_REVIEW_REQUIRED` on all rows |
| 21 | regulation_mapping_confidence | String | `MAPPING_REVIEW_REQUIRED` on all rows |
| 22 | mapping_review_required | Boolean | `true` on all rows |

## Column Schema — Module-Level CSV (21 columns)

Same as lesson-level except:
- Column 3 is `lesson_count` (integer) instead of `lesson_id`
- Column 4 is `role_applicability_union` (sorted alphabetical union of all lesson roles)
- Column 13 is `evidence_requirements_union`
- Column 14 is `survey_criticality_max` (highest across module's lessons)
- Column 15 is `risk_level_max` (highest across module's lessons)
- Column 17 is `remediation_required_any` (OR of all lesson remediation_required values)

---

## Governance Rules Applied

1. **No hallucinated regulatory references**: `federal_regulation_references`, `cms_cop_references`, `california_title22_references`, `achc_hh_standards` are intentionally blank.
2. **Strict separation maintained**: Federal (42 CFR), CMS CoP, California Title 22, and ACHC HH are four separate columns — never merged.
3. **Fields awaiting governance review** are marked `MAPPING_REVIEW_REQUIRED` (string) or `mapping_review_required=true` (boolean).
4. **Evidence architecture** is applied at lesson level (not just module level).
5. **ID conventions**: `Module-M##` (zero-padded) and `Module-M##-L##` (per-module lesson sequence).
6. **CSV format**: RFC 4180 compliant (fields containing commas are double-quoted, UTF-8 encoding).
