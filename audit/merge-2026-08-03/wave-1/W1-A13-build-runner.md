# W1-A13 — Build Runner

## Agent ID
W1-A13

## Role
Build Runner (Wave 1) — run production build, unit/integration test script, lint, and verify zero shadowing compiled `.js` under `src/`. Do not emit JS into `src/` via ad-hoc `tsc`.

## Worktree
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03`

## Environment
| Item | Value |
|------|--------|
| Node | v24.13.0 |
| npm | 11.6.2 |
| `node_modules` | present |
| package name | `ci-policy-app@0.0.0` |

## package.json scripts (evidence)

From root `package.json`:

| Script | Command |
|--------|---------|
| `prebuild` | `node scripts/cleanEmittedJs.mjs && node scripts/syncMasterControlInventory.mjs` |
| `build` | `tsc -b && vite build` |
| `test` | `vitest run` |
| `lint` | `eslint .` |

No ad-hoc `tsc <file>` / emit-into-`src/` was run. Build uses project-mode `tsc -b` only (output goes to TS build info / project outDirs, not sibling `.js` next to `.tsx` under `src/`).

---

## 1. `npm run build`

| Field | Value |
|-------|--------|
| Command | `npm run build` |
| Exit code | **0** |
| Result | **PASS** |
| Log | `audit/merge-2026-08-03/evidence/W1-A13-npm-run-build.log` |
| Exit stamp | `audit/merge-2026-08-03/evidence/W1-A13-npm-run-build.exit` (`BUILD_EXIT_CODE=0`) |

### Notes
- `prebuild` ran `cleanEmittedJs.mjs` then `syncMasterControlInventory.mjs` (inventory JSON copied to public paths).
- `tsc -b` completed without reported type errors.
- `vite build` completed: `✓ built in 11.84s` (vite v8.0.2).
- Non-fatal warnings only:
  - `[PLUGIN_TIMINGS] Warning: … plugin vite:asset`
  - Large chunk warning: `index-D5Nh0PvB.js` ~33.8 MB (gzip ~6.0 MB) exceeds 500 kB guidance.
- Output artifacts under `dist/` as expected.

---

## 2. `npm test` (`vitest run`)

| Field | Value |
|-------|--------|
| Command | `npm test` → `vitest run` |
| Exit code | **1** |
| Result | **FAIL** |
| Log | `audit/merge-2026-08-03/evidence/W1-A13-npm-test.log` |
| Exit stamp | `audit/merge-2026-08-03/evidence/W1-A13-npm-test.exit` (`TEST_EXIT_CODE=1`) |
| Vitest | v3.2.6 |
| Duration | 12.78s |

### Exact counts (from vitest summary)

```text
Test Files  16 failed | 56 passed (72)
     Tests  3 failed | 646 passed (649)
```

| Metric | Count |
|--------|------:|
| Test files total | 72 |
| Test files passed | 56 |
| Test files failed | 16 |
| Tests total | 649 |
| Tests passed | 646 |
| Tests failed | 3 |
| Tests skipped | **0** (not reported by vitest; none skipped) |

### Failed assertion tests (3)

1. **`src/policy/journey/nolanTutorResponder.acceptance.test.ts`**
   - `composeNolanTutorAnswer — routing > URGENT SAFETY FIRST: danger typed into the tutor gets safety guidance, never catalog search`
   - Expected path `urgent-passthrough`, received `fallback`
   - Input: `'help my client got shot'`

2. **`src/policy/journey/nolanTutorResponder.acceptance.test.ts`**
   - `composeNolanTutorAnswer — lesson context & personalization > precise intents still outrank lesson retrieval (module id, urgent safety)`
   - Expected path `urgent-passthrough`, received `lesson-clarify`

3. **`src/policy/qapi/qapi.test.ts`**
   - `Phase 5 — rendered QAPI packet output > May-7 packet is titled INTERIM and states the data-through date`
   - Expected HTML to match `/Interim Q2 2026 QAPI/`; rendered title/content does not include that interim branding for data-through `2026-05-07`

### Failed suites with no collected tests (14 files)

Vitest reported `Error: No test suite found in file …` for:

- `src/policy/data/policyCorpusSeedIntegrity.test.ts`
- `src/policy/ecign/resolveCanonicalSignedPackage.test.ts`
- `src/policy/ecign/roleKey.test.ts`
- `src/policy/ces/cesMasterControlAudit.test.ts`
- `src/policy/ces/cesViewProjections.test.ts`
- `src/policy/ecign/pathB/contracts.test.ts`
- `src/policy/ecign/pathB/retentionLifecycle.test.ts`
- `src/policy/ecign/pathB/runtimeReference.test.ts`
- `src/policy/ecign/pathB/runtimeSpecs.todo.test.ts`
- `src/policy/journey/utils/achcTrainingCalculations.test.ts`
- `src/policy/ecign/pathB/live/adapterConfigFlag.test.ts`
- `src/policy/ecign/pathB/live/driveSandboxPublisher.test.ts`
- `src/policy/ecign/pathB/replicas/parityAndLock.test.ts`
- `src/policy/ecign/pathB/storage/storageAndFreeze.test.ts`

These contribute to the 16 failed files alongside the two files that had assertion failures (`nolanTutorResponder.acceptance.test.ts`, `qapi.test.ts`).

### Other stderr noise (did not alone set exit code)
- Repeated `[env] Google service-account JSON not found at: …\__fixtures__\does-not-exist.json` from drive-lock tests (tests themselves mostly passed).
- `TypeError: Failed to parse URL from /data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json` (and sibling public paths) during some loads — invalid absolute-path `fetch` under node test env.

---

## 3. `npm run lint` (`eslint .`)

| Field | Value |
|-------|--------|
| Command | `npm run lint` → `eslint .` |
| Exit code | **1** |
| Result | **FAIL** |
| Log | `audit/merge-2026-08-03/evidence/W1-A13-npm-run-lint.log` |
| Exit stamp | `audit/merge-2026-08-03/evidence/W1-A13-npm-run-lint.exit` (`LINT_EXIT_CODE=1`) |

### Exact summary (eslint final line)

```text
✖ 871 problems (414 errors, 457 warnings)
  2 errors and 19 warnings potentially fixable with the `--fix` option.
```

| Metric | Count |
|--------|------:|
| Total problems | 871 |
| Errors | 414 |
| Warnings | 457 |
| Fixable (approx.) | 2 errors + 19 warnings |

### Top error rules (approximate counts from log lines)

| Count | Rule / class |
|------:|--------------|
| 287 | `@typescript-eslint/no-explicit-any` |
| 42 | `no-empty` |
| 42 | `@typescript-eslint/no-unused-vars` |
| 13 | `@typescript-eslint/triple-slash-reference` |
| 12 | `react-hooks/rules-of-hooks` |
| 6 | `no-useless-escape` |
| 4 | parsing (`return` outside of function) |
| 2 | `prefer-const` |
| 1 | `no-irregular-whitespace` |
| 1 | `@typescript-eslint/no-unused-expressions` |

### Representative files with errors (sample, not exhaustive)

- `.claude/workflows/story-module-architecture.js` / `story-module-build.js` — Parsing error: `'return' outside of function`
- `docs/Workflows/STORY-MODULE-TEMPLATE/automation/*.workflow.js` — same parse errors
- `scripts/manifest_selftest.ts`, `scripts/validateNarrationSync.ts`, `scripts/verifyEcignFivePolicies.ts`
- `server/manifestCore.ts`, `server/routes/calendar.ts`, `server/sourcePipeline.ts`
- `src/policy/ces/cesViewProjections.ts`, `src/policy/ces/cesMasterControlAudit.test.ts` (heavy `no-explicit-any`)
- Multiple `src/policy/journey/components/*`, `src/v6/screens/pageviews/*`, `src/v6/utils/*`
- `tmp_classify.ts`

Babel notes (not counted as failures by themselves): several large generated files deoptimized (`achcSurveyProjection.generated.ts`, `workflows.generated.ts`, `allPoliciesContent.generated.ts`, etc.).

**Do not dismiss:** lint exit code is **1** with **414 errors**. This is a real FAIL for the configured `eslint .` gate.

---

## 4. Shadow `.js` under `src/` (sibling of `.ts` / `.tsx`)

| Field | Value |
|-------|--------|
| Check | Enumerate `src/**/*.js`; flag any file where same basename has `.ts` or `.tsx` sibling |
| Result | **PASS** |
| Log | `audit/merge-2026-08-03/evidence/W1-A13-shadow-js-check.log` |

```text
total_js_under_src=0
shadowing_js_count=0
No .js files under src/ that shadow .ts/.tsx siblings.
```

### Method note
- Did **not** run file-scoped `tsc` that would emit next to sources.
- `npm run build` uses `tsc -b` only; `prebuild` runs `scripts/cleanEmittedJs.mjs`.

---

## Evidence files

| Path | Contents |
|------|----------|
| `audit/merge-2026-08-03/evidence/W1-A13-npm-run-build.log` | Full build stdout/stderr |
| `audit/merge-2026-08-03/evidence/W1-A13-npm-run-build.exit` | `BUILD_EXIT_CODE=0` |
| `audit/merge-2026-08-03/evidence/W1-A13-npm-test.log` | Full vitest run |
| `audit/merge-2026-08-03/evidence/W1-A13-npm-test.exit` | `TEST_EXIT_CODE=1` |
| `audit/merge-2026-08-03/evidence/W1-A13-npm-run-lint.log` | Full eslint run |
| `audit/merge-2026-08-03/evidence/W1-A13-npm-run-lint.exit` | `LINT_EXIT_CODE=1` |
| `audit/merge-2026-08-03/evidence/W1-A13-shadow-js-check.log` | Shadow JS inventory |

---

## Results matrix

| Check | Exit / status | Result |
|-------|---------------|--------|
| `npm run build` | 0 | **PASS** |
| `npm test` | 1 — 3 failed / 646 passed / 0 skipped (649 total); 16/72 files failed | **FAIL** |
| `npm run lint` | 1 — 414 errors, 457 warnings (871 problems) | **FAIL** |
| Zero shadowing `.js` under `src/` | 0 shadows | **PASS** |
| No emit-into-`src/` `tsc` | Not run | **PASS** (compliance) |

---

## Overall Result: **FAIL**

### Why overall FAIL
1. **Tests failed** (`npm test` exit 1): 3 assertion failures (Nolan urgent-safety routing, QAPI interim title) plus 14 files with no Vitest-collectable suite.
2. **Lint failed** (`npm run lint` exit 1): 414 ESLint errors under configured `eslint .` (not dismissed).

### What passed
- Production build (`tsc -b && vite build`) exit 0.
- No compiled `.js` shadows under `src/`.
- Build path did not introduce sibling emit into `src/`.

### Suggested follow-ups (out of scope for this agent; informational only)
- Nolan tutor: restore/fix `urgent-passthrough` routing for danger phrases so it outranks fallback and lesson-clarify.
- QAPI renderer: ensure May-7 / mid-quarter packets emit “Interim Q2 2026 QAPI” (or update tests if product copy intentionally changed).
- Align “No test suite found” files with Vitest (`describe`/`it`) or exclude them from the default include if they intentionally use another runner.
- ESLint: large backlog of `no-explicit-any` / unused vars / parse errors in workflow JS stubs — either fix or narrow `eslint` ignores for non-app trees (`.claude/`, `docs/…/automation/`, `tmp_*.ts`) if that is intentional policy.
