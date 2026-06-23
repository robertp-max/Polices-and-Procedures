# Mock 5 Lessons Learned

This document summarizes the results, specifications, and key takeaways from the Mock 5 First-Half (H1) Brad Training Mock Compliance generation and hydration.

## Mock 5 Specifications

- **Branch**: `mock/mock5-h1-brad-training`
- **Hydration Commit**: `c606a11`
- **Evidence Count**: `840` documents
- **Evidence Center Path**:
  `2026 / Mock 5 H1 / Brad Training Mock Test`

## Confirmed Validation Results

- **TypeScript Compilation**: PASS (`npx tsc -p tsconfig.app.json --noEmit` exits with 0 errors).
- **Vite Production Build**: PASS (`npm run build` exits successfully).
- **Git Format Validation**: PASS (`git diff --check` passes cleanly).
- **Metadata Compliance**:
  - 100% of Mock 5 evidence contains correct `MOCK5-H1` identification.
  - 100% of Mock 5 evidence contains `Brad Training Mock Test` labels.
  - All records map to the exact provided patient Medical Number (MRN) and Primary Diagnoses (e.g. `post_surgical_total_hip_replacement`).
  - All records maintain the source Care Indeed form and event/workflow relationships.

## Core Lessons Learned

1. **Active Indexing Over Dry-Run Files**: Compliance documents must be fully indexed as Evidence Center records in the metadata snapshots, not just saved as files in the repository. Un-indexed files remain invisible to the app's Evidence Center.
2. **Store Hydration Dependency**: The Evidence Center UI relies directly on the Zustand-based `useRegulatoryExecutionStore` state. Hydration from backend snapshots must be merged into this store.
3. **Snapshot Verification**: The generated `.cache/ces-metadata/snapshots/full.json` must be correctly formatted and fully served by the backend API snapshot endpoint.
4. **Data Accuracy**: Medical Numbers and primary diagnoses must be read and mapped exactly from the provided mock source data. Do not invent or assume values.
5. **Care Indeed Form Mandatory Use**: Use only actual forms originating from Care Indeed's templates. Do not invent missing forms/workflows. If a record is unresolved or cannot be mapped, mark or skip it rather than using dummy/invented forms.
6. **Zero TypeScript Bypasses**: Do not use broad `any` casts or `// @ts-nocheck` directives to silence compilation issues. Legacy/pre-existing errors should be fixed cleanly or documented as unrelated.
7. **Clean Git Staging**: Avoid using bulk staging commands (e.g., `git add .` or `git add -A`) because the repository contains a large number of untracked files, logs, and screenshots. Stage files explicitly.
