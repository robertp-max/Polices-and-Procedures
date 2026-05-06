# FINAL_ACHC_SURVEYOR_ALIGNMENT_MASTER

Locked consolidation index for surveyor-facing ACHC alignment artifacts.

## Phase A: ACHC Policy Tagging Matrix

Authoritative matrix artifact (preserved, not replaced):

- `Builder/Documentations/MigratedRepoRoot/docs/FINAL_Tagging_Matrix_Validated.md`

Implementation source used by app projection:

- Manual domain datasets under `Builder/Documentations/MigratedRepoRoot/docs/*-manual-achc-tag-dataset.json`
- Generated app projection `src/policy/data/achcSurveyProjection.generated.ts`

## Phase B: ACHC Crosswalk

Authoritative crosswalk artifact (preserved, not replaced):

- `Builder/Documentations/MigratedRepoRoot/docs/FINAL_ACHC_Crosswalk.md`

App behavior lock:

- Crosswalk table in surveyor UI is derived from Phase A policy-level tags.
- `SME_REVIEW` and `NONE` rows are excluded from crosswalk projection.
- No new crosswalk mappings are generated outside Phase A tagged policy rows.

## Remaining SME Review Holds

Primary hold artifacts:

- `Builder/Documentations/MigratedRepoRoot/docs/FINAL_Unsupported_Mappings.md`
- `Builder/Documentations/MigratedRepoRoot/docs/FINAL_Missing_Policies.md`
- `Builder/Documentations/MigratedRepoRoot/docs/UPDATED_GAP_ANALYSIS.md`

Current hold themes:

- FN Section 3 row-title normalization set.
- HR scope normalization (`HR-TD-003`).
- OP language/cultural/on-call row certainty (`OP-PA-003`, `OP-PA-004`, `OP-SL-002` lineage).

## Final Implemented Mapping Rules

1. IBM and ACHC metadata are stored and rendered as separate groups.
2. Mapping states in app: `DIRECT | PARTIAL | NONE | SME_REVIEW`.
3. Survey matrix includes all mapping states (including `SME_REVIEW` and `NONE`).
4. Crosswalk includes only policy rows with validated ACHC-standard-bearing mappings (`DIRECT` and `PARTIAL`).
5. Deprecated inferred/default corridor mappings are not used as authoritative inputs.
6. Surveyor policy links open read-only viewer route (`/surveyor/policy/:policyId`) with only Print, Download, and Close actions.

## Do Not Use / Deprecated Automation Notes

Deprecated/non-authoritative sources for final survey lock:

- `src/policy/data/corridorAlignment.generated.ts` (reset/default map state; non-authoritative for final manual lock)
- `src/policy/data/achcSurveyTags.generated.ts` (reset overlay placeholder)
- Any previous inferred/default subdomain bulk mapping outputs

Do not overwrite or collapse these active final artifacts:

1. `FINAL_Tagging_Matrix_Validated.md`
2. `FINAL_ACHC_Crosswalk.md`
3. `FINAL_Gap_Analysis.md`
4. `FINAL_Unsupported_Mappings.md`
5. `FINAL_Missing_Policies.md`

## Related Consolidation and Fix Notes

- `Builder/Documentations/MigratedRepoRoot/docs/MISSING_POLICY_FIX_DECISIONS.md`
- `Builder/Documentations/MigratedRepoRoot/docs/POLICY_UPDATES_APPLIED.md`
- `Builder/Documentations/MigratedRepoRoot/docs/UPDATED_TAGGING_RECOMMENDATIONS.md`
- `Builder/Documentations/MigratedRepoRoot/docs/UPDATED_CROSSWALK_RECOMMENDATIONS.md`
