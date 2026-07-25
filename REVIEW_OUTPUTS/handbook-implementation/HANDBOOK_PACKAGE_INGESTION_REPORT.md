# Handbook Package Ingestion Report

## Package identity

| Field | Value |
|---|---|
| Package | `Care_Indeed_2026_Employee_Handbook_Counsel_Review_Package.zip` |
| Files in package | 9 |
| Doc id | CI-HR-HB-2026 |
| Draft version | 1.0 |
| Status | `COUNSEL_REVIEW_DRAFT_NOT_EFFECTIVE` |

## Manifest counts

| Metric | Count |
|---|---|
| Sections | 48 |
| Policy references | 104 |
| Form references | 52 |
| External sources cited | 25 |
| Policy corpus (total policies) | 272 |
| — of which past next-review date | 205 |
| — of which are cited by this handbook AND past next-review date | 73 |

## Integrity verification

All 8 package files checked against the manifest's declared SHA-256 hashes:

| Check | Result |
|---|---|
| Package files verified against manifest (8 of 8) | VERIFIED |
| Legacy 2022 PDF hash (`fc84d206ab66c71cd7f6487676fbbea0f0aa25eb7fa694ac7d453ccd7e879a8c`) vs. manifest | VERIFIED — match |
| Canonical logo asset hash vs. expected | VERIFIED |
| Repo-wide asset scanner | PASS — 103 files, 0 findings |

## Ingestion / projection pipeline

- **Script**: `scripts/generateHandbookProjection.ts` (run via `tsx`, `npm run handbook:projection:generate`)
- **Behavior**:
  1. Re-verifies all package/source hashes against the manifest before doing any work — the
     pipeline **fails closed** if any hash does not match.
  2. Parses the 48 `<article class="handbook-section">` blocks out of the source HTML.
  3. Joins each section against the crosswalk CSV (policy refs, form refs, external sources).
  4. Bakes generated output:
     - `generated/handbookSections.generated.ts`
     - `generated/handbookMeta.generated.ts`
     - `generated/ingestionIntegrity.generated.json`
- **Baked metadata flags**: `notEffective = true`, `acknowledgmentEnabled = false` — these are
  written directly into the generated meta so the reader surfaces cannot present the handbook as
  effective or collect acknowledgments regardless of any other app state.

## Result

All 48 sections parsed successfully and are reflected in the generated projection. No hash
mismatches were encountered. The pipeline's fail-closed integrity gate was exercised as a design
property, not as a live failure — no failure occurred during this ingestion.
