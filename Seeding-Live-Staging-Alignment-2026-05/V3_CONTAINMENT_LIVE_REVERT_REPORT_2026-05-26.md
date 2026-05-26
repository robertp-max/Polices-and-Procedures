# V3 Containment Live Revert Report - 2026-05-26

## Commit audited

`142098056498a89161b4e47da3c49a63eee2bfd6`

Commit message: `Stabilize V3 staging routes and add parity docs`

## Initial audit classification

### A. V3 staging files

- `src/ui-staging/V3StagingApp.tsx`
- `src/ui-staging/V3_2StagingApp.tsx`
- `src/ui-staging/ces/V3CESSeedPreview.tsx`
- `Seeding-Live-Staging-Alignment-2026-05/GPT5.5/V3_CLICK_PATH_AUDIT.md`
- `Seeding-Live-Staging-Alignment-2026-05/GPT5.5/V3_PRODUCTION_PARITY_GAPS.md`
- `Seeding-Live-Staging-Alignment-2026-05/GPT5.5/V3_SEEDING_TRUTH_MATRIX.md`
- `Seeding-Live-Staging-Alignment-2026-05/V3_PHASE_2_ROUTE_STABILIZATION_REPORT.md`
- `Seeding-Live-Staging-Alignment-2026-05/V3_PHASE_3_FULL_CONTENT_RENDERER_PARITY_REPORT.md`

### B. V3 seed preview files

- `src/policy/ces/data/V3_AppSeedPrimitives.ts`
- `src/policy/ces/data/V3_CES_SeedData.ts`
- `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`
- `src/policy/compliance-execution/seededMode.tsx`

### C. Live/active production files

- None found in `HEAD~1..HEAD`.

No live app routes, live shell/layout/nav, global styles, production policy/form/training renderers, production CES/calendar/task files, or non-staging design components were changed by the audited commit.

### D. Docs only

- `Builder/Documentations/Tooling/OPENAI_CODEX_CLI_SYSTEM_SETUP.md`
- V3 reports listed above under staging docs/reports.

## Files changed by this containment patch

- `src/ui-staging/V3_2StagingApp.tsx`
- `Seeding-Live-Staging-Alignment-2026-05/V3_CONTAINMENT_LIVE_REVERT_REPORT_2026-05-26.md`

## Files intentionally reverted

- None.

No classification C live/active production file was changed by the audited commit, so there was no live design drift to revert.

## Files intentionally preserved

- Phase 3 policy renderer parity in `src/ui-staging/V3_2StagingApp.tsx`
  - `renderer seeded`
  - Still uses `policyContentMap`, `getPolicyContent`, `getPolicyBody`, and `PolicyLibraryDocumentView`.
- Phase 3 forms renderer parity in `src/ui-staging/V3_2StagingApp.tsx`
  - `renderer seeded`
  - Still uses `FORMS_DATASET`, `buildFormContent`, `FormBody`, and `printForm`.
- Training/journey content parity in `src/ui-staging/V3_2StagingApp.tsx`
  - `content seeded`
  - Remains level 2 content seeded.
  - Still reads `ALL_MODULES` in-shell and keeps live journey routes as secondary explicit handoffs.
- CES seed preview files under `src/policy/ces/data/V3_*.ts`
  - `V3_SYNTHETIC_FALLBACK`
  - Preserved as seed preview data only.

## V3 navigation containment result

- `/ui-staging` remains the canonical V3 staging entry through `V3StagingApp`.
- `/ui-staging/v32` remains the canonical V3.2 staging shell.
- Primary sidebar/menu clicks now select an internal V3 staging surface by `activeSection`.
- Primary V3 navigation no longer calls `navigate(...)` into live app routes.
- Live routes are exposed only through explicit secondary controls labeled `Open live route`.
- Live-route handoffs open separately with `window.open(...)`, preserving the current V3 staging shell context.
- Surfaces not fully V3-rendered show in-shell status panels with seeding levels such as `registry seeded` or `V3_SYNTHETIC_FALLBACK`, plus the missing work.

## Remaining known gaps

- CES workflow interiors are still not Phase 4 complete.
- Event/task detail workflow intelligence is not complete.
- Evidence mutation is not implemented.
- Signature mutation is not implemented.
- Approval mutation is not implemented.
- Audit-history mutation is not implemented.
- CES board/task preview surfaces remain `V3_SYNTHETIC_FALLBACK`.
- Registry-only live-route surfaces remain `registry seeded`.
- No V3 surface is marked complete by this patch.

## Validation commands and results

### Typecheck

Command:

```powershell
npx tsc --noEmit --skipLibCheck
```

Result: Passed.

### Build

Command:

```powershell
npm run build
```

Result: Passed.

Notes:

- The repo prebuild step ran `scripts/syncMasterControlInventory.mjs`.
- The build completed with existing chunk-size/plugin timing warnings.
- No tracked generated files remained modified after the build.

### Grep audit

Command:

```powershell
rg -n 'window\.location|location\.href|location\.assign|navigate\(''/|navigate\("/|href="/' src/ui-staging
```

Result: No matches.

Additional split audit:

```powershell
rg -n 'window\.location|location\.href|location\.assign|navigate\(' src/ui-staging
rg -n 'href=' src/ui-staging
```

Result: No matches.

## Manual route expectations by code inspection

- `/ui-staging` renders the V3 staging shell.
- `/ui-staging/v32` renders the V3.2 staging shell.
- V3 sidebar/menu primary clicks stay in the staging shell.
- Live route access is secondary and explicit through `Open live route`.
- Policy/forms renderer parity remains available through adapters.
- Training/journey content parity remains level 2 `content seeded` with secondary live route handoffs.
- CES task interiors are not marked complete and remain blocked for Phase 4.
