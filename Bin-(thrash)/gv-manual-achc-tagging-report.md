# GV Manual ACHC Tagging Report (Locked Execution)

## Scope Processed
- Domain: `GV` only
- Policies reviewed manually: `20`
- Included policy families:
  - `GV-GB-001` through `GV-GB-005`
  - `GV-OG-001` through `GV-OG-005`
  - `GV-PM-001` through `GV-PM-005`
  - `GV-EA-001` through `GV-EA-005`

## Output Artifact
- Dataset: `gv-manual-achc-tag-dataset.json` (same folder as this report)

## Validation Totals
- Total GV policies reviewed: `20`
- Mapped GV policies (`DIRECT` or `PARTIAL`): `7`
- Unmapped GV policies (`NONE`): `13`
- Policies with print-source support (Corridor pages 7-31 row present): `11`
- Policies mapped manually from content (`mappingSource: MANUAL`): `0`
- Policies flagged due to Corridor/policy mismatch: `4`
  - `GV-GB-002`
  - `GV-OG-003`
  - `GV-OG-005`
  - `GV-EA-002`

## Layer Compliance Confirmation
- `surveyEvidenceMethods` are preserved from Corridor pages 7-31 evidence codes (`P/D/I/O/S`) for policies with print support.
- Page 756 crosswalk was **not** used to assign `surveyEvidenceMethods`.
- IBM policy content remained final authority for acceptance/rejection of print-tag applicability.
