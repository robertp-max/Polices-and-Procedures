# RN Advanced Training Defect Ledger

This ledger details all detected defects during the independent QA runtime recovery pass.

## P0 Defects (Critical / Blocker)
1. **Defect ID**: `RN-ADV-P0-01`
   - **Description**: Route `/journey/module/oasis-e2-soc` renders the "Unknown module" error page instead of loading the OASIS-E2 SOC training module.
   - **Impact**: Blockers to learning flow. Learners cannot complete the OASIS-E2 module.
   - **Root Cause**: Omission of `'oasis-e2-soc'` in `isAdvancedModule` within [advancedTrainingContract.ts](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/policy/journey/data/advancedTraining/advancedTrainingContract.ts#L50-L53).
   - **Verification Status**: FAIL (verified via browser screenshot).

2. **Defect ID**: `RN-ADV-P0-02`
   - **Description**: Route `/journey/module/documentation-matters` renders the "Unknown module" error page instead of loading the Documentation Matters training module.
   - **Impact**: Blockers to learning flow. Learners cannot complete the Documentation Matters module.
   - **Root Cause**: Omission of `'documentation-matters'` in `isAdvancedModule` within [advancedTrainingContract.ts](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/policy/journey/data/advancedTraining/advancedTrainingContract.ts#L50-L53).
   - **Verification Status**: FAIL (verified via browser screenshot).

---

## P1 Defects (Major / High Priority)
*None detected at runtime.*

---

## P2 Defects (Medium / Standard Priority)
1. **Defect ID**: `RN-ADV-P2-01`
   - **Description**: Type-checking clean-up required. The TypeScript build cache inside `.tmp/tsconfig.app.tsbuildinfo` got corrupted or became stale, which caused several compiler errors (e.g. `Cannot find name 'isAdvancedModule'`) during `npm run build` until `npx tsc -b --clean` was run.
   - **Impact**: Build system blockage until cleaned.
   - **Root Cause**: Stale incremental compilation cache.
   - **Verification Status**: PASS (resolved by clean build).

2. **Defect ID**: `RN-ADV-P2-02`
   - **Description**: Lint errors (970 errors, 92 warnings) during `npm run lint`.
   - **Impact**: Violates strict workspace rules, but does not block execution.
   - **Root Cause**: Pre-existing `any` usage and empty block statements in the codebase.
   - **Verification Status**: FAIL (pre-existing).

3. **Defect ID**: `RN-ADV-P2-03`
   - **Description**: 14 test suites fail during `npm test` with `No test suite found` error.
   - **Impact**: Test runner reports failure, but actual active tests pass (142 passed).
   - **Root Cause**: Headless/designless baseline files in `src/policy` are being searched by Vitest but are stubs/not fully implemented.
   - **Verification Status**: FAIL (pre-existing).

---

## P3 Defects (Minor / Low Priority)
*None detected.*
