# W2-QA13 — Build QA (Wave 2)

## Agent ID
W2-QA13 (Build QA)

## Role
Independent Wave 2 re-run of production build, unit/integration tests, lint, and zero shadowing compiled `.js` under `src/`. Compare material test failures to base commit `7b0b6ae6` where feasible. Do not emit JS into `src/` via ad-hoc `tsc`. Do not dismiss failures.

## Independence
Re-executed all gates in this worktree. Did **not** trust W1-A13 results alone; compared counts to W1-A13 after independent capture.

## Worktree
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03`

| Item | Value |
|------|--------|
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD | `5a24e94121f2e1872c454cac618e49c2884eb583` |
| HEAD subject | `chore(audit): complete wave-1 reports gate and remaining browser evidence` |
| Base (compare) | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` (`Update onboarding modules and DON visuals`) |
| Base is ancestor of HEAD | yes |

## Environment
| Item | Value |
|------|--------|
| Node | v24.13.0 |
| npm | 11.6.2 |
| `node_modules` | present |
| package name | `ci-policy-app@0.0.0` |
| Run timestamp (local) | 2026-08-03T13:41–13:44 (PDT) |

## package.json scripts (evidence)

| Script | Command |
|--------|---------|
| `prebuild` | `node scripts/cleanEmittedJs.mjs && node scripts/syncMasterControlInventory.mjs` |
| `build` | `tsc -b && vite build` |
| `test` | `vitest run` |
| `lint` | `eslint .` |

No ad-hoc `tsc <file>` / emit-into-`src/` was run. Build uses project-mode `tsc -b` only.

---

## 1. `npm run build`

| Field | Value |
|-------|--------|
| Command | `npm run build` |
| Exit code | **0** |
| Result | **PASS** |
| Log | `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.log` |
| Exit stamp | `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.exit` (`BUILD_EXIT_CODE=0`) |

### Notes
- `prebuild` ran `cleanEmittedJs.mjs` then `syncMasterControlInventory.mjs` (inventory JSON copied to public paths).
- `tsc -b` completed without reported type errors.
- `vite build` completed: `✓ 3239 modules transformed`, `✓ built in 16.02s` (vite v8.0.2).
- Non-fatal warnings only:
  - `[PLUGIN_TIMINGS] Warning: … plugin vite:asset`
  - Large chunk warning: `index-D5Nh0PvB.js` ~33.8 MB (gzip ~6.0 MB) exceeds 500 kB guidance.
- Output artifacts under `dist/` as expected.

### vs W1-A13
| Metric | W1-A13 | W2-QA13 |
|--------|--------|---------|
| Exit | 0 | 0 |
| Result | PASS | PASS |
| Vite build time | 11.84s | 16.02s |

---

## 2. `npm test` (`vitest run`)

| Field | Value |
|-------|--------|
| Command | `npm test` → `vitest run` |
| Exit code | **1** |
| Result | **FAIL** |
| Log | `audit/merge-2026-08-03/evidence/W2-QA13-npm-test.log` |
| Exit stamp | `audit/merge-2026-08-03/evidence/W2-QA13-npm-test.exit` (`TEST_EXIT_CODE=1`) |
| Vitest | v3.2.6 |
| Duration | 11.09s |

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
| Tests skipped | **0** (vitest did not report any skipped; none listed) |

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

### vs W1-A13
| Metric | W1-A13 | W2-QA13 |
|--------|--------|---------|
| Exit | 1 | 1 |
| Files | 16 failed / 56 passed (72) | **identical** |
| Tests | 3 failed / 646 passed (649) | **identical** |
| Failed names | nolan ×2 + qapi interim + 14 no-suite | **identical** |

---

## 3. `npm run lint` (`eslint .`)

| Field | Value |
|-------|--------|
| Command | `npm run lint` → `eslint .` |
| Exit code | **1** |
| Result | **FAIL** |
| Log | `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-lint.log` |
| Exit stamp | `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-lint.exit` (`LINT_EXIT_CODE=1`) |

### Exact summary (eslint final lines)

```text
✖ 871 problems (414 errors, 457 warnings)
  2 errors and 19 warnings potentially fixable with the `--fix` option.
```

| Metric | Count |
|--------|------:|
| Total problems | 871 |
| Errors | 414 |
| Warnings | 457 |
| Fixable (reported) | 2 errors + 19 warnings |

### Top error rules (approximate counts from log)

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

### vs W1-A13
| Metric | W1-A13 | W2-QA13 |
|--------|--------|---------|
| Exit | 1 | 1 |
| Problems | 871 (414 errors, 457 warnings) | **identical** |

---

## 4. Shadow `.js` under `src/` (sibling of `.ts` / `.tsx`)

| Field | Value |
|-------|--------|
| Check | Enumerate `src/**/*.js`; flag any file where same basename has `.ts`/`.tsx`/`.mts`/`.cts` sibling |
| Result | **PASS** |
| Log | `audit/merge-2026-08-03/evidence/W2-QA13-shadow-js-check.log` |

```text
JS_COUNT=0
SHADOW_COUNT=0
PASS: zero shadowing compiled .js under src/ with .ts/.tsx siblings
```

### Method note
- Did **not** run file-scoped `tsc` that would emit next to sources.
- `npm run build` uses `tsc -b` only; `prebuild` runs `scripts/cleanEmittedJs.mjs`.

---

## 5. Base commit comparison (`7b0b6ae6`) — pre-existing?

### Method
1. Confirmed `7b0b6ae6` is an ancestor of HEAD.
2. `git diff 7b0b6ae6 HEAD` for nolan + qapi implementation/test trees: **empty** (no content change since base).
3. Reception-related paths changed since base: primarily `src/v6/screens/pageviews/ReceptionScreen.tsx` (+ audit evidence/reports). **Zero overlap** with any of the 16 failing test file paths.
4. Targeted re-run on a temporary detached worktree at `7b0b6ae6` (junctioned `node_modules` from merge worktree):
   - Command: `npm test -- src/policy/journey/nolanTutorResponder.acceptance.test.ts src/policy/qapi/qapi.test.ts`
   - Exit: **1**
   - Result: **same 3 assertion failures** (identical expected/received paths and QAPI regex)

Evidence:
- `audit/merge-2026-08-03/evidence/W2-QA13-base-7b0b6ae6-failing-tests.log`
- `audit/merge-2026-08-03/evidence/W2-QA13-base-7b0b6ae6-failing-tests.exit` (`BASE_TARGETED_TEST_EXIT_CODE=1`)

### Base targeted summary

```text
Test Files  2 failed (2)
     Tests  3 failed | 46 passed (49)
```

Same three failures as merge HEAD:
| Test | Base received | Merge received |
|------|---------------|----------------|
| URGENT SAFETY FIRST… | `fallback` (want `urgent-passthrough`) | identical |
| precise intents… urgent safety | `lesson-clarify` (want `urgent-passthrough`) | identical |
| May-7 packet INTERIM title | no match `/Interim Q2 2026 QAPI/` | identical |

### Classification
| Failure class | Pre-existing on `7b0b6ae6`? | Related to reception merge files? |
|---------------|----------------------------|-----------------------------------|
| Nolan urgent-passthrough ×2 | **YES (proven by targeted re-run + empty diff)** | **NO** |
| QAPI interim title ×1 | **YES (proven by targeted re-run + empty diff)** | **NO** |
| 14× “No test suite found” | **Very likely pre-existing** (files exist at base; same suite shape under node:test vs vitest collect). Not fully re-proven with full `npm test` on base worktree to save time; not reception-related by path. | **NO** |
| Lint 414 errors | Not re-run full lint on base; counts match W1-A13 and are repo-wide (`.claude/`, `docs/`, `scripts/`, `server/`, `src/`, `tmp_*.ts`). Not reception-scoped. | **NO** (not reception-specific) |

Temp base worktree path was removed after evidence capture:
`…/Policies_and_Procedures_V2_worktrees/_tmp-w2-qa13-base-7b0b6ae6` (deleted via `git worktree remove --force`).

---

## Evidence files

| Path | Contents |
|------|----------|
| `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.log` | Full build stdout/stderr |
| `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.exit` | `BUILD_EXIT_CODE=0` |
| `audit/merge-2026-08-03/evidence/W2-QA13-npm-test.log` | Full vitest run |
| `audit/merge-2026-08-03/evidence/W2-QA13-npm-test.exit` | `TEST_EXIT_CODE=1` |
| `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-lint.log` | Full eslint run |
| `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-lint.exit` | `LINT_EXIT_CODE=1` |
| `audit/merge-2026-08-03/evidence/W2-QA13-shadow-js-check.log` | Shadow JS inventory |
| `audit/merge-2026-08-03/evidence/W2-QA13-base-7b0b6ae6-failing-tests.log` | Base targeted re-run of 3 failing assertions |
| `audit/merge-2026-08-03/evidence/W2-QA13-base-7b0b6ae6-failing-tests.exit` | `BASE_TARGETED_TEST_EXIT_CODE=1` |

---

## Results matrix

| Check | Exit / status | Result | BLOCKING? |
|-------|---------------|--------|-----------|
| `npm run build` | 0 | **PASS** | — |
| `npm test` | 1 — 3 failed / 646 passed / 0 skipped (649 total); 16/72 files failed | **FAIL** | **YES — BLOCKING** |
| `npm run lint` | 1 — 414 errors, 457 warnings (871 problems) | **FAIL** | **YES — BLOCKING** |
| Zero shadowing `.js` under `src/` | 0 shadows | **PASS** | — |
| No emit-into-`src/` `tsc` | Not run | **PASS** (compliance) | — |

### Pre-existing vs merge-introduced (blocking items)

| BLOCKING item | Pre-existing on base `7b0b6ae6`? |
|---------------|----------------------------------|
| 3 assertion test failures | **YES — proven** (base worktree targeted re-run) |
| 14 no-suite file failures | Likely yes (files present at base; not reception-related) |
| 414 ESLint errors | Treat as **repo-wide / pre-existing backlog** (not proven with full base lint re-run; not reception-file-scoped) |

None of the test failures are in reception merge paths. Reception app source change since base is limited to `src/v6/screens/pageviews/ReceptionScreen.tsx`.

---

## Overall Result: **FAIL**

### Why overall FAIL
Gate rule: **PASS only if build + test + lint all green.**

1. **Tests failed** (`npm test` exit 1): 3 assertion failures (Nolan urgent-safety routing, QAPI interim title) plus 14 files with no Vitest-collectable suite. **BLOCKING.**
2. **Lint failed** (`npm run lint` exit 1): 414 ESLint errors under configured `eslint .`. **BLOCKING — not dismissed.**

### What passed
- Production build (`tsc -b && vite build`) exit 0.
- No compiled `.js` shadows under `src/`.
- Build path did not introduce sibling emit into `src/`.

### Pre-existing note (does not change Overall Result)
The **3 assertion failures are proven pre-existing** on base `7b0b6ae6` and are **unrelated to reception merge files**. They still fail the gate (Overall = FAIL) because build QA does not waive red tests/lint.

### Consistency with W1-A13
Independent W2 re-run matches W1-A13 outcomes exactly for exit codes and exact test/lint counts. W2 adds base-commit proof for the 3 assertion failures.

### Suggested follow-ups (out of scope for this agent; informational only)
- Nolan tutor: restore/fix `urgent-passthrough` routing for danger phrases so it outranks fallback and lesson-clarify.
- QAPI renderer: ensure May-7 / mid-quarter packets emit “Interim Q2 2026 QAPI” (or update tests if product copy intentionally changed).
- Align “No test suite found” files with Vitest (`describe`/`it`) or exclude them from the default include if they intentionally use another runner (node:test).
- ESLint: large backlog of `no-explicit-any` / unused vars / parse errors in workflow JS stubs — either fix or narrow `eslint` ignores for non-app trees (`.claude/`, `docs/…/automation/`, `tmp_*.ts`) if that is intentional policy.
