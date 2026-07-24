# Journey Mapping Pipeline — Audit Summary

Generated: GENERATED_AT_BUILD (schema v1.0.0, source branch `feature/governing-body-portal`)

This is a read-only summary of `app/journey/_generated/*`. It does not modify policy bodies, modules, or forms.

## Record counts

| Artifact | Count |
| --- | --- |
| Training modules (moduleCatalog) | 202 |
| Module player entries | 202 |
| Roles with assignment maps | 11 |
| Unique policies (policyCatalog) | 217 |
| Policy assignment records (incl. General inheritance) | 1381 |
| Course quiz bundles | 68 |
| EvidenceAppendix keys classified | 15 |
| Forms baked (appendixForms) | 9 |
| Annual/DRILL/COMP modules mapped | 33 |
| ACHC clinical audience size | 10 |
| Advanced portal modules | 4 |

## Module player availability

| playerType | count |
| --- | --- |
| CANONICAL_GENERIC_PLAYER | 113 |
| STANDALONE_PLAYER | 73 |
| UNAVAILABLE | 16 |

### REVIEW_REQUIRED — 16 module(s) with NO player wired in the main app

- `ANN-001` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-002` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-003` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-004` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-005` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-006` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-007` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-009` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-010` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-011` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-012` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-013` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-014` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-015` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-017` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).
- `ANN-018` — contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).

## Policy resolution

| policyRefStatus | count |
| --- | --- |
| verified | 208 |
| needs_review | 7 |
| invalid | 2 |

### REVIEW_REQUIRED — 9 policies not fully verified

| policyId | status |
| --- | --- |
| EN-CM-002 | needs_review |
| EN-LC-003 | needs_review |
| MISSING-COTA-JD | invalid |
| MISSING-PTA-JD | invalid |
| QA-VBP-101 | needs_review |
| RM-PS-001 | needs_review |
| RM-PS-002 | needs_review |
| RM-PS-003 | needs_review |
| RM-PS-005 | needs_review |

## Held / blocked policy assignments (must not be published)

145 assignment record(s) carry `blocked: true` (Assignment type = Hold, or Release status = Hold).

## Appendix -> form crosswalk

| appendixKey | classification | formIds |
| --- | --- | --- |
| F | COMPOSITE_PACKET | HR-FM-018, HR-FM-005, HR-FM-006, HR-FM-007 |
| A | EXACT_FORM | HR-FM-005 |
| B | EXACT_FORM | HR-FM-006 |
| HRTA005_A | EXACT_FORM | HR-FM-007 |
| HRTA005_B | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTA005_D | QUIZ_NOT_FORM | — |
| HRTA005_E | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTD003_A | EXACT_FORM | HR-FM-016 |
| HRTD003_C | EXACT_FORM | HR-FM-038 |
| HRTD003_D | EXACT_FORM | CL-FM-016 |
| HRTD003_E | EXACT_FORM | CL-FM-042 |
| HRER001_C | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTD001_B | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTD005_B | EXACT_FORM | RM-FM-005 |
| NONE | NO_FORM_REQUIRED | — |

### REVIEW_REQUIRED — 4 appendix key(s) with no exact form match

- `HRTA005_B` (HR-TA-005 Appendix B — Role-specific sign-off / clearance) — No exact role-specific clearance/sign-off form found in FORMS_DATASET. Do not force a mapping.
- `HRTA005_E` (HR-TA-005 Appendix E — Supervised Visit Form (new-hire clearance)) — CL-FM-042 ("Supervisory Visit Documentation (RN)") documents an RN supervising a PATIENT visit, not a supervisor evaluating a new-hire during onboarding supervised visits. Semantics do not match closely enough to force; flagged for review.
- `HRER001_C` (HR-ER-001 Appendix C — 90-day introductory evaluation) — HR-FM-008 ("Annual Performance Evaluation Form") is the ANNUAL review, wrong cadence for a 90-day introductory eval. No dedicated 90-day form exists in FORMS_DATASET; not forced.
- `HRTD001_B` (HR-TD-001 Appendix B — Annual training dashboard) — HR-FM-017 ("Training Attendance & Completion Roster") is a roster, not a dashboard/summary artifact. Not forced.

## Quiz bundles

1 bundle(s) DRAFT_REVIEW_REQUIRED (pilot sample only), 67 MISSING (no approved bank — UI must block completion).

## ACHC annual training audience

ACHC_CLINICAL_AUDIENCE = [DON, RN, LVN, HHA, PT, PTA, OT, COTA, SLP, MSW] applied uniformly to all 12 ACHC-ART modules (fixes the raw modules.ts M04/M07/M09 `roles:'ALL'` leak and the field-worker set that previously omitted DON).

## Advanced portal audience

| moduleId | canonical | ownerAdded | effective |
| --- | --- | --- | --- |
| cms-485 | RN,DON | PT,ADM | RN,DON,PT,ADM |
| qapi | RN,DON | PT,ADM | RN,DON,PT,ADM |
| oasis-e2-soc | RN,DON,PT,OT,SLP | ADM | RN,DON,PT,OT,SLP,ADM |
| documentation-matters | DON,RN,LVN,PT,PTA,OT,COTA,SLP,MSW,HHA | ADM | DON,RN,LVN,PT,PTA,OT,COTA,SLP,MSW,HHA,ADM |

## Unresolved / gaps carried in the manifest

```json
{
  "policiesNeedsReviewOrInvalid": [
    {
      "policyId": "EN-CM-002",
      "status": "needs_review"
    },
    {
      "policyId": "EN-LC-003",
      "status": "needs_review"
    },
    {
      "policyId": "MISSING-COTA-JD",
      "status": "invalid"
    },
    {
      "policyId": "MISSING-PTA-JD",
      "status": "invalid"
    },
    {
      "policyId": "QA-VBP-101",
      "status": "needs_review"
    },
    {
      "policyId": "RM-PS-001",
      "status": "needs_review"
    },
    {
      "policyId": "RM-PS-002",
      "status": "needs_review"
    },
    {
      "policyId": "RM-PS-003",
      "status": "needs_review"
    },
    {
      "policyId": "RM-PS-005",
      "status": "needs_review"
    }
  ],
  "appendixKeysNeedingReview": [
    "HRTA005_B",
    "HRTA005_E",
    "HRER001_C",
    "HRTD001_B"
  ],
  "modulesWithoutPlayer": [
    "ANN-001",
    "ANN-002",
    "ANN-003",
    "ANN-004",
    "ANN-005",
    "ANN-006",
    "ANN-007",
    "ANN-009",
    "ANN-010",
    "ANN-011",
    "ANN-012",
    "ANN-013",
    "ANN-014",
    "ANN-015",
    "ANN-017",
    "ANN-018"
  ],
  "heldPolicyAssignments": 145
}
```

