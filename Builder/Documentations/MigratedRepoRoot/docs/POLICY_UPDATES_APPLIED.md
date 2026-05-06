# POLICY_UPDATES_APPLIED

This run applied support-strengthening updates to existing policy records only.

## Files Updated

- Builder/Documentations/MigratedRepoRoot/docs/fn-manual-achc-tag-dataset.json
- Builder/Documentations/MigratedRepoRoot/docs/hr-manual-achc-tag-dataset.json
- Builder/Documentations/MigratedRepoRoot/docs/op-manual-achc-tag-dataset.json

## Exact Policy Updates

### 1) FN-FP-005 (Annual Budget & Financial Planning)
- Changed: mappingType from NONE to DIRECT support for budget standards.
- Section fields updated:
  - corridorPolicyNo -> 3-001
  - corridorPolicyTitle -> Annual Operating Budget
  - achcStandards -> HH3-1A, HH3-1C
  - cop -> 42 CFR §484.105(h)
  - surveyEvidenceMethods -> P,D,I
  - realEvidenceArtifacts strengthened with budget package, board minutes, variance reports, finance committee minutes.
- Evidence/workflow linkage added in justification: FN-FM-001, GV-FM-005.

### 2) HR-JD-007 (Home Health Aide)
- Changed: citation normalization for HHA orientation/POC support.
- Section fields updated: achcStandards, cop, title22, surveyEvidenceMethods, justification.
- Goal: align HHA support to Section 4 4-006/4-007 evidence model.

### 3) HR-TA-005 (Employee Orientation & Onboarding)
- Changed: narrowed support to HHA-specific orientation component.
- Section fields updated: achcStandards, cop, title22, surveyEvidenceMethods, justification.
- Decision: retain PARTIAL (all-staff onboarding remains broader than HHA row).

### 4) HR-TD-003 (Clinical Staff Competency Evaluation)
- Changed: tightened to HHA competency support only plus explicit hold.
- Section fields updated: achcStandards, cop, title22, surveyEvidenceMethods, confidence, justification, flags.
- New flag: REQUIRES_SME_REVIEW.

### 5) OP-SL-002 (After-Hours & On-Call Services)
- Changed: row normalization from generic 1-014 to specific on-call row.
- Section fields updated:
  - corridorPolicyNo -> 4-015
  - corridorPolicyTitle -> On-Call/Weekend Staffing
  - achcStandards -> HH2-11A.01, HH2-12A.01
  - surveyEvidenceMethods -> D,I
  - confidence -> HIGH

### 6) OP-PA-003 / OP-PA-004
- Changed: governance hold added to avoid forced mapping.
- Section fields updated: flags includes REQUIRES_SME_REVIEW.
- Reason: support exists, but final Corridor primary-row certainty remains unresolved.

## New Policies Created

- None (per locked rule: do not create duplicates where support already exists).
