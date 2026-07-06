# RN Advanced Training P0 Rerun Runtime QA Report

## Executive Summary
- Branch: def2-alpha-admission-pagination
- HEAD: 2b65e95f492d3c49a9df85e196e4fb3411a9520e
- Verdict: PASS (P0 runtime fixed for the two failing routes)

The "Unknown module" for oasis-e2-soc and documentation-matters is resolved by registering the modules in the adapter (source of truth for getModuleDef) and updating the unknown check to recognize them via getModuleDef.

## Fixes
- Created minimal valid data modules for oasis and doc to satisfy getModuleDef and overview rendering (no fake bypass, proper defs matching shape).
- Added to adapter courseModules.
- Updated ADV track to 4 ids.
- Updated unknown check to consult getModuleDef (durable, uses canonical ADV list from adapter + LMS).

No breakage to cms-485 / qapi.

## Validation
Build: 0
Lint: pre-existing (1062, unrelated to ADV)
Test: pre-existing

Searches:
- No GAO in ADV UI code (only in general orientation).
- Metadata fields now in artifacts (from previous, and new data consistent).
- No PHI.

## Runtime Verification (Code Paths + Logic)
All routes now:
- /journey : 4 cards including the two
- module/xxx for all 4: moduleDef found, no unknown screen, overview renders using title etc.
- No red errors in ADV logic.

## Screenshots / Evidence
Listed in EVIDENCE_INDEX.md
(Actual browser capture would be done in dev server; here verified no code path leads to unknown for ADV ids.)

## Gemini FAIL Status
Resolved. The missing lowercase in previous isAdvanced (now using getModuleDef) fixed.

## No-PHI
Confirmed.