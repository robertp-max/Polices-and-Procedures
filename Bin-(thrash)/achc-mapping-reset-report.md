# ACHC / Corridor Mapping Reset Report

Generated: 2026-05-05T21:57:41.672Z

## Scope

Cleanup-only reset. No new mappings were created, no replacements were
inferred, no policies were retagged. Policy content, IDs, domains,
titles, ACTIVE/DRAFT status, and policy text were all left untouched.

Targets:

- `src/policy/data/corridorAlignment.generated.ts`
- `src/policy/data/achcSurveyTags.generated.ts`

## Headline Counts

| Metric | Count |
| --- | ---: |
| Total corridorAlignment records reviewed | 269 |
| Preserved verified mappings | 9 |
| Reset to UNMAPPED_MANUAL_REVIEW_PENDING | 260 |
| Removed: "Subdomain-default crosswalk applied" | 201 |
| Removed: requiresReview=true | 59 |
| Removed: corridorRef=null + crosswalk values | 0 |
| Removed: other automated batch inference | 0 |
| Survey tag overlay entries cleared | 46 → 0 |
| Ambiguous records flagged for human review | 0 |

## Preserved Verified Mappings

These records were retained because they meet **all** preservation criteria:
explicit `corridorRef`, specific (non-default) summary tied to a named
Corridor crosswalk row, `requiresReview: false`, and a non-generic source.

| Policy ID | Corridor Ref | Summary |
| --- | --- | --- |
| `CO-CA-001` | 1-014 Corporate Compliance Program | Compliance Officer, code of conduct, hotline, audits. |
| `EN-CM-001` | 1-001/1-013 Master Control Inventory | Cross-domain master control catalog. |
| `EN-LC-001` | 1-013 Lifecycle Control | Cross-domain lifecycle (draft→review→approve→publish→archive). |
| `EN-TG-001` | 0 Taxonomy Governance | Domain/subdomain taxonomy governance. |
| `RM-EP-001` | 6-037 Emergency Management Plan | All-hazards EP: HVA, communication plan, training, ≥2 exercises/yr, AAR. |
| `RM-OS-001` | 6-018/6-020 Environmental Safety & Fire Safety — Office | Environment of Care; office fire safety; extinguisher inspection cycle. |
| `RM-OS-002` | 6-002 Incident Reporting & RCA | Incident intake → RCA → QAPI loop; sentinel-event escalation. |
| `RM-OS-003` | 6-034/6-035 Personnel Safety / Unsafe Home Visits | Personnel safety in field; unsafe home visit protocol. |
| `RM-OS-004` | 6-022/6-026 Equipment Management | Agency-owned + DME equipment management; calibration. |

All preserved records have:

- `mappingStatus: "VERIFIED_MANUAL"`
- `mappingSource: "CORRIDOR_AUTHORED"`

## Removed Mappings (Now UNMAPPED_MANUAL_REVIEW_PENDING)

Each of the following policies has been reset. The `policyId`, `summary`
(emptied), and metadata shell remain so the framework validator stays
green; all ACHC / CoP / Title 22 values, evidence codes, addendums, and
related-policy references have been cleared.

### By removal reason

#### Subdomain-default crosswalk applied (201)

- `CL-CA-003`
- `CL-CA-004`
- `CL-CA-006`
- `CL-CA-007`
- `CL-CC-101`
- `CL-CD-002`
- `CL-CD-003`
- `CL-CD-004`
- `CL-CP-004`
- `CL-CP-005`
- `CL-CP-006`
- `CL-CP-007`
- `CL-CP-008`
- `CL-CP-009`
- `CL-DC-101`
- `CL-OA-002`
- `CL-OA-003`
- `CL-OA-004`
- `CL-OA-005`
- `CL-OA-007`
- `CL-OA-008`
- `CL-OA-009`
- `CL-OA-010`
- `CL-OA-011`
- `CL-OA-012`
- `CL-OA-013`
- `CL-OA-014`
- `CL-OA-015`
- `CL-OA-016`
- `CL-OA-017`
- `CL-OA-018`
- `CL-OA-019`
- `CL-OA-101`
- `CL-SD-001`
- `CL-SD-002`
- `CL-SD-003`
- `CL-SD-004`
- `CL-SD-005`
- `CL-SD-006`
- `CL-SD-007`
- `CL-SD-008`
- `CL-SD-009`
- `CL-SD-010`
- `CL-SD-011`
- `CL-SD-012`
- `CL-SD-013`
- `CL-SD-014`
- `CL-SD-015`
- `CL-SD-016`
- `CL-SD-017`
- `CL-SD-018`
- `CL-SD-019`
- `CL-SD-020`
- `CL-SD-021`
- `CL-SD-022`
- `CL-SD-023`
- `CL-SD-024`
- `CL-SD-025`
- `CO-AI-101`
- `CO-BA-101`
- `CO-CP-002`
- `CO-CP-003`
- `CO-CP-004`
- `CO-CP-005`
- `CO-CP-006`
- `CO-CP-007`
- `CO-CP-008`
- `CO-DC-002`
- `CO-DC-003`
- `CO-DC-004`
- `CO-DG-101`
- `CO-FA-002`
- `CO-FA-003`
- `CO-FW-101`
- `CO-HP-002`
- `CO-HP-003`
- `CO-HP-005`
- `CO-HP-006`
- `CO-HP-007`
- `CO-HP-101`
- `CO-IR-101`
- `CO-RA-002`
- `CO-RA-003`
- `CO-RA-004`
- `CO-RA-005`
- `CO-RA-006`
- `CO-RA-007`
- `EN-WF-101`
- `FN-BC-005`
- `FN-BC-006`
- `FN-BC-007`
- `FN-CM-001`
- `FN-CM-002`
- `FN-CM-003`
- `FN-CM-004`
- `FN-CM-005`
- `FN-FP-001`
- `FN-FP-002`
- `FN-FP-003`
- `FN-FP-004`
- `FN-FP-005`
- `FN-FP-006`
- `FN-FP-007`
- `GV-EA-003`
- `GV-EA-004`
- `GV-EA-005`
- `GV-GB-004`
- `GV-GB-005`
- `GV-PM-002`
- `GV-PM-003`
- `GV-PM-004`
- `GV-PM-005`
- `HR-EH-101`
- `HR-ER-002`
- `HR-ER-003`
- `HR-ER-004`
- `HR-ER-005`
- `HR-ER-006`
- `HR-ER-007`
- `HR-ER-008`
- `HR-ER-009`
- `HR-JD-000`
- `HR-JD-001`
- `HR-JD-002`
- `HR-JD-003`
- `HR-JD-004`
- `HR-JD-005`
- `HR-JD-006`
- `HR-JD-007`
- `HR-JD-008`
- `HR-JD-009`
- `HR-JD-010`
- `HR-JD-011`
- `HR-TA-003`
- `HR-TA-004`
- `HR-TA-005`
- `HR-TA-006`
- `HR-TD-002`
- `HR-TD-003`
- `HR-TD-004`
- `HR-TD-005`
- `HR-TR-101`
- `HR-WM-001`
- `HR-WM-002`
- `HR-WM-003`
- `HR-WM-004`
- `HR-WM-005`
- `HR-WM-006`
- `HR-WM-007`
- `IT-DR-002`
- `IT-DR-003`
- `IT-DR-004`
- `IT-DR-005`
- `IT-SA-001`
- `IT-SA-002`
- `IT-SA-003`
- `IT-SA-004`
- `IT-SA-005`
- `IT-SC-002`
- `IT-SC-003`
- `IT-SC-004`
- `IT-SC-005`
- `IT-SC-006`
- `IT-UP-002`
- `IT-UP-003`
- `IT-UP-004`
- `OP-FM-002`
- `OP-FM-003`
- `OP-FM-004`
- `OP-FM-005`
- `OP-IM-003`
- `OP-PA-002`
- `OP-PA-003`
- `OP-PA-004`
- `OP-PA-005`
- `OP-SL-002`
- `OP-SL-003`
- `OP-SL-004`
- `OP-SL-005`
- `OP-SL-006`
- `OP-SL-007`
- `QA-AE-002`
- `QA-AE-003`
- `QA-AE-004`
- `QA-PG-002`
- `QA-PG-003`
- `QA-PI-002`
- `QA-PI-003`
- `QA-PI-004`
- `QA-PI-005`
- `QA-PI-006`
- `QA-PI-007`
- `QA-SM-001`
- `QA-SM-002`
- `QA-SM-003`
- `QA-SM-004`
- `QA-SM-005`
- `RM-EP-002`
- `RM-EP-003`
- `RM-OS-101`
- `RM-SS-003`

#### requiresReview=true (59)

- `CL-CA-001`
- `CL-CA-002`
- `CL-CA-005`
- `CL-CD-001`
- `CL-CP-001`
- `CL-CP-002`
- `CL-CP-003`
- `CL-OA-001`
- `CL-OA-006`
- `CL-PR-001`
- `CL-PR-002`
- `CL-PR-003`
- `CL-PR-004`
- `CL-PR-005`
- `CL-PR-006`
- `CO-CP-001`
- `CO-DC-001`
- `CO-FA-001`
- `CO-HP-001`
- `CO-HP-004`
- `CO-RA-001`
- `FN-BC-001`
- `FN-BC-002`
- `FN-BC-003`
- `FN-BC-004`
- `GV-EA-001`
- `GV-EA-002`
- `GV-GB-001`
- `GV-GB-002`
- `GV-GB-003`
- `GV-OG-001`
- `GV-OG-002`
- `GV-OG-003`
- `GV-OG-004`
- `GV-OG-005`
- `GV-PM-001`
- `HR-ER-001`
- `HR-TA-001`
- `HR-TA-002`
- `HR-TD-001`
- `IT-DR-001`
- `IT-SC-001`
- `IT-UP-001`
- `OP-FM-001`
- `OP-IM-001`
- `OP-IM-002`
- `OP-PA-001`
- `OP-SL-001`
- `QA-AE-001`
- `QA-PG-001`
- `QA-PI-001`
- `RM-ER-001`
- `RM-ER-002`
- `RM-ER-003`
- `RM-ER-004`
- `RM-ER-005`
- `RM-ER-006`
- `RM-SS-001`
- `RM-SS-002`

#### corridorRef=null but crosswalk had values (0)

_(none)_

#### Other automated batch inference (0)

_(none)_

## Ambiguous Records Requiring Human Decision

_None — every record was deterministically classified as either
VERIFIED_MANUAL or UNMAPPED_MANUAL_REVIEW_PENDING._

## Hard-Rule Validation

| Rule | Status |
| --- | --- |
| No policy retains ACHC/CoP/Title22 mapping unless manually verified | PASS |
| No "Subdomain-default crosswalk applied" remains | PASS |
| No `requiresReview: true` remains as a substitute for mapping | PASS |
| No inherited / default evidence tags remain | PASS |
| No new mappings added during reset | PASS |

## Definition of Done

System now contains **only verified mappings + clean unmapped records**
ready for manual one-by-one tagging.

## Manually Verified Source Set

- `CO-CA-001`
- `EN-CM-001`
- `EN-LC-001`
- `EN-TG-001`
- `RM-EP-001`
- `RM-OS-001`
- `RM-OS-002`
- `RM-OS-003`
- `RM-OS-004`
