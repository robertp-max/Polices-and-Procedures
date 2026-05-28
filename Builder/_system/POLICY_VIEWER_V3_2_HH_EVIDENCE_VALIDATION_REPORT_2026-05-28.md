# POLICY_VIEWER_V3_2 HH EVIDENCE VALIDATION REPORT
**Generated:** 2026-05-28T09:53:00.577Z
**Scope:** Builder/_system/ (references only achcHhEvidenceMap.ts + allPoliciesContent.generated.ts + policy_hh_section_map.csv)
**Rules:** No generated edits. Surgical. Read-only data access.

## Executive Summary
- Total policies in generated: **269**
- Total sections across all policies: **4767**
- Unique policyIds in HH Evidence map (CSV): **162**
- Total HH Evidence mapping rows: **410**
- Policies referenced in map but MISSING from generated: **0**
- Unresolved section anchors (no id match + no normalized title match): **3**
- Policies with duplicate sectionIds (within same policy): **1**
- Global duplicate policyIds detected: **0**
- Suspicious near-empty body sections sampled: **8** (examples below)

**ALL hhEvidenceRows policyIds present in generated?** YES — 100% coverage.

## Detailed Metrics

### Policy & Section Counts
- Generated policies: 269 (target 269)
- Total sections: 4767 (avg ~17.7 per policy)

### Duplicate Detection
- Duplicate policyIds (global): 0 — PASS
- Policies with internal duplicate sectionIds: 1
  - IT-UP-004: [31-appendices]

### Suspicious Empty / Near-Empty Bodies (sample)
- CL-CA-001 :: 1-patient-assessment-comprehensive ("Patient Assessment — Comprehensive")
- CL-CA-001 :: 20-compliance-audit-considerations ("8\. Compliance & Audit Considerations")
- CL-CA-002 :: 1-oasis-data-collection-accuracy ("OASIS Data Collection & Accuracy")
- CL-CA-002 :: 20-compliance-audit-considerations ("8\. Compliance & Audit Considerations")
- CL-CA-003 :: 1-oasis-transmission-correction ("OASIS Transmission & Correction")
- CL-CA-003 :: 20-compliance-audit-considerations ("8\. Compliance & Audit Considerations")
- CL-CA-004 :: 1-recertification-assessment-process ("Recertification Assessment & Process")
- CL-CA-004 :: 20-compliance-audit-considerations ("8\. Compliance & Audit Considerations")

### HH Evidence Map Policy Coverage
- Unique policies referenced: 162
- Rows with policyId absent from generated: 0
None — all referenced policy IDs exist in generated corpus.

### Unresolved Section Anchors (Exact IDs)
These rows in policy_hh_section_map.csv have a policyId that exists, but neither exact `sectionId` match nor normalized `sectionTitle` match in the policy's sections array.
- Policy: GV-GB-001 | sectionId: "12-6-2-3-policy-and-compliance-oversight" | sectionTitle: "6.2.3 — Policy and Compliance Oversight"
- Policy: GV-GB-001 | sectionId: "12-6-2-3-policy-and-compliance-oversight" | sectionTitle: "6.2.3 — Policy and Compliance Oversight"
- Policy: GV-GB-001 | sectionId: "12-6-2-3-policy-and-compliance-oversight" | sectionTitle: "6.2.3 — Policy and Compliance Oversight"

## Validation Methodology (in this script)
1. Deep regex extraction of every policyId + its sections[] (id, title, body).
2. Per-policy duplicate sectionId scan + empty body detection.
3. CSV parse (first 5 columns; sufficient for policyId/sectionId/sectionTitle).
4. For every evidence row: policy existence check → sectionId exact OR normalizeTitle(title) match.
5. Aggregated counts + explicit lists (never hidden).

## Immediate Repair Guidance (if issues found)
- If unresolved >0: cross-check the exact policy section inventory in generated vs CSV row. Update CSV section_id or section_title (prefer id alignment).
- Empty bodies: expected for certain placeholder compliance/measurement sections (e.g. 20-*-considerations). No action unless content required.
- Duplicates: regeneration of allPoliciesContent.generated.ts required (do not hand-edit).
- Missing policies: source data reconciliation in Builder pipeline.

This report + the validator script (POLICY_VIEWER_V3_2_HH_EVIDENCE_VALIDATOR.cjs) provide ground truth for ACHC HH Evidence viewer integrity (Policy Viewer V3.2 / framework/achc-survey hh-evidence path).

---
*Validator created under locked Phase 5 scope. Re-run after any generated or CSV changes.*
