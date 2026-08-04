# R09 — Quality Gates (Recon 2026-08-03)

## Agent ID
R09 (Quality Gates)

## Role
Independent re-verification of production build, unit/integration tests, lint, and zero shadowing compiled `.js` under `src/` after commit **`f05cca59`** (*fix: close merge quality gates*) and all subsequent commits on this branch. Compare to Wave-1 / Wave-2 gate failures. **Do not dismiss failures.**

## Review mode
**Review only** — no product code changes. Evidence logs written under `audit/recon-2026-08-03/agents/`.

## Worktree
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03`

| Item | Value |
|------|--------|
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD (committed) | `dae8e24bf661b5f66ac612eb36da4e824883b5bb` |
| HEAD subject | `feat(compliance): Vendor + Contractor management UI under Registry & Contracts (UI only)` |
| Gate-close commit | **`f05cca5998c8e002734b665376da9a103553dd79`** (`fix: close merge quality gates`, 2026-08-03 14:14 PDT) |
| `f05cca59` is ancestor of HEAD | **yes** |
| Prior Wave-2 audit tip | `13051d6e` (NO-GO: tests + lint) |
| Base (historical compare) | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` |
| Working tree | **dirty** — 6 uncommitted product files (reception/a11y/advanced-training polish) present during runs; gates re-run on this dirty tree as-is |

## Environment
| Item | Value |
|------|--------|
| Node | v24.13.0 |
| npm | 11.6.2 |
| `node_modules` | present |
| package name | `ci-policy-app@0.0.0` |
| Vitest | v3.2.6 |
| Vite | v8.0.2 |
| Run timestamp (local) | 2026-08-03T19:26–19:30 (PDT) |

## package.json scripts (evidence)

| Script | Command |
|--------|---------|
| `prebuild` | `node scripts/cleanEmittedJs.mjs && node scripts/syncMasterControlInventory.mjs` |
| `build` | `tsc -b && vite build` |
| `test` | `vitest run` |
| `lint` | `eslint .` |

No ad-hoc `tsc <file>` / emit-into-`src/` was run. Build uses project-mode `tsc -b` only.

---

## Commit under inspection: `f05cca59`

**Subject:** `fix: close merge quality gates`
**Full hash:** `f05cca5998c8e002734b665376da9a103553dd79`
**AuthorDate:** 2026-08-03 14:14:56 -0700
**Scope:** 56 files, +321 / −261

### What the commit claimed / did

| Area | Change |
|------|--------|
| ESLint config | Ignore `.claude/workflows/**` and `docs/Workflows/**/automation/*.js`; demote `@typescript-eslint/no-explicit-any` to **warn**; allow empty catch via `no-empty` option |
| Vitest collect | 14 formerly “No test suite found” files: `import { describe, it } from 'node:test'` → `from 'vitest'` (CES / eCign / ACHC calc / corpus integrity, etc.) |
| Lint-touched product/scripts | Various TS/TSX cleanups (journey modules, v6 screens, scripts, server) |
| Escalation test | Drop unused `deadline` local in `escalation.test.ts` |
| Nolan / QAPI test files | **Not modified** in this commit (paths absent from commit file list) |

**Note:** Commit message implies gates closed. This re-run evaluates **HEAD** (which includes `f05cca59` + 15 later commits), not a detached checkout of `f05cca59` alone.

---

## 1. `npm run build`

| Field | Value |
|-------|--------|
| Command | `npm run build` |
| Exit code | **0** |
| Result | **PASS** |
| Log | `audit/recon-2026-08-03/agents/R09-npm-run-build.log` |
| Exit stamp | `audit/recon-2026-08-03/agents/R09-npm-run-build.exit` (`BUILD_EXIT_CODE=0`) |

### Notes
- `prebuild` ran `cleanEmittedJs.mjs` then `syncMasterControlInventory.mjs` (inventory JSON copied to public paths).
- `tsc -b` completed without reported type errors.
- `vite build` completed: **3357 modules transformed**, **✓ built in 12.03s**.
- Non-fatal warnings only:
  - `[PLUGIN_TIMINGS] Warning: … plugin vite:asset`
  - Large chunk warning: `index-C0iycQw6.js` ~40.1 MB (gzip ~7.4 MB) exceeds 500 kB guidance.
- Output artifacts under `dist/` as expected.

### vs prior Wave QA
| Metric | W1-A13 | W2-QA13 | R09 (this run) |
|--------|--------|---------|----------------|
| Exit | **0** | **0** | **0** |
| Result | PASS | PASS | **PASS** |

---

## 2. `npm test` (`vitest run --run`)

| Field | Value |
|-------|--------|
| Command | `npm test -- --run` → `vitest run --run` |
| Exit code | **1** |
| Result | **FAIL** |
| Log | `audit/recon-2026-08-03/agents/R09-npm-test.log` |
| Exit stamp | `audit/recon-2026-08-03/agents/R09-npm-test.exit` (`TEST_EXIT_CODE=1`) |
| Duration | 11.16s |

### Exact counts (from vitest summary)

```text
Test Files  1 failed | 92 passed (93)
     Tests  2 failed | 1042 passed (1044)
```

| Metric | Count |
|--------|------:|
| Test files total | 93 |
| Test files passed | 92 |
| Test files failed | **1** |
| Tests total | 1044 |
| Tests passed | 1042 |
| Tests failed | **2** |
| Tests skipped | 0 (not reported) |

### Failed assertion tests (2) — **current HEAD**

Both in `src/policy/packets/architecture/architecture.test.ts`:

1. **`architecture rules against current worktree > R1 no-new-page-renderers: passes (legacy allowlisted)`**
   - Error: `[no-new-page-renderers] New bespoke packet page renderer(s) detected outside src/policy/packets/render/ and LEGACY_ALLOWLIST (PRD §25.6 / §9.1)`
   - Offender: `server/assets/governance-references/patient-admission-packet-letter-form.html`

2. **`architecture rules against current worktree > runAllArchitectureRules: zero failures on current tree`**
   - Same R1 failure (aggregated rule runner).

### Origin of architecture offender

| Check | Result |
|-------|--------|
| Present at Wave-2 tip `13051d6e`? | **No** |
| Present at `f05cca59`? | **No** |
| Introduced by | **`4cbc8d50`** `feat(governance): merge latest V3 portal` (after `f05cca59`) |

**Classification:** Post–gate-close **regression** relative to the “gates closed” claim of `f05cca59`. **Not dismissed.** Related to governance V3 portal merge, not reception surface merge of Wave 1.

### “No test suite found” files (prior 14)

All 14 files that failed collect under W1/W2 now **collect and pass** under Vitest (imports switched to `vitest` in `f05cca59`). Examples observed green in this run:
- `src/policy/ces/cesMasterControlAudit.test.ts` (5 tests)
- `src/policy/ces/cesViewProjections.test.ts` (21 tests)
- `src/policy/ecign/pathB/contracts.test.ts` (30 tests)
- `src/policy/data/policyCorpusSeedIntegrity.test.ts` (4 tests)
- `src/policy/journey/utils/achcTrainingCalculations.test.ts` (10 tests)
- (and remaining eCign pathB / roleKey / resolveCanonical suite files)

### Other stderr noise (did not alone set exit code)
- Repeated `[env] Google service-account JSON not found at: …\__fixtures__\does-not-exist.json` from drive-lock tests (tests themselves passed).
- `TypeError: Failed to parse URL from /data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json` (and sibling public paths) during CES audit tests — invalid absolute-path `fetch` under node test env; suite still passed.

---

## 3. Prior three failed tests (W1-A13 / W2-QA13) — re-check

### Historical failures (Wave 2 evidence)

| # | File / test | W2-QA13 result |
|---|-------------|----------------|
| 1 | `nolanTutorResponder.acceptance.test.ts` — URGENT SAFETY FIRST… | Expected `urgent-passthrough`, got `fallback` |
| 2 | `nolanTutorResponder.acceptance.test.ts` — precise intents… urgent safety | Expected `urgent-passthrough`, got `lesson-clarify` |
| 3 | `qapi.test.ts` — May-7 packet titled INTERIM… | Expected match `/Interim Q2 2026 QAPI/` |

W2 counts: **3 failed / 646 passed (649)**; **16/72 files failed**.

### Targeted re-run at HEAD

| Field | Value |
|-------|--------|
| Command | `npm test -- --run src/policy/journey/nolanTutorResponder.acceptance.test.ts src/policy/qapi/qapi.test.ts` |
| Exit code | **0** |
| Result | **PASS** |
| Log | `audit/recon-2026-08-03/agents/R09-prior3-tests.log` |
| Exit stamp | `audit/recon-2026-08-03/agents/R09-prior3-tests.exit` (`PRIOR3_EXIT_CODE=0`) |

```text
Test Files  2 passed (2)
     Tests  49 passed (49)
```

Also confirmed in full suite: both files green (`nolan` 22 tests; `qapi` 27 tests).

### Comparison table (prior 3)

| Prior failure | W1/W2 | R09 HEAD | Still blocking? |
|---------------|-------|----------|-----------------|
| Nolan urgent-passthrough ×2 | FAIL | **PASS** | No |
| QAPI Interim title ×1 | FAIL | **PASS** | No |
| 14× no-suite files | FAIL | **PASS** (collect + run) | No |

**Do not dismiss:** clearing the prior three does **not** make the suite green; architecture R1 ×2 remains red.

### Attribution note
- `f05cca59` clearly fixed the **14 no-suite** collect failures (import rewrite).
- Nolan/QAPI **source/test paths** were not listed in `f05cca59` file list; full-suite and targeted runs now pass those assertions on this tree. Mechanism of the flip relative to W2 is not fully re-proven by git path history alone (implementation may have moved under other paths, or environment/suite shape changed). **Recorded as observed PASS at HEAD**, without claiming a single-line product fix inside `f05cca59`.

---

## 4. `npm run lint` (`eslint .`)

| Field | Value |
|-------|--------|
| Command | `npm run lint` → `eslint .` |
| Exit code | **1** |
| Result | **FAIL** |
| Log | `audit/recon-2026-08-03/agents/R09-npm-run-lint.log` |
| Exit stamp | `audit/recon-2026-08-03/agents/R09-npm-run-lint.exit` (`LINT_EXIT_CODE=1`) |
| Duration | ~70s |

### Exact summary (eslint final lines)

```text
✖ 727 problems (3 errors, 724 warnings)
  0 errors and 20 warnings potentially fixable with the `--fix` option.
```

| Metric | Count |
|--------|------:|
| Total problems | 727 |
| Errors | **3** |
| Warnings | 724 |

### The 3 errors (blocking)

All in:

`src/v6/screens/governance/v33/navigation/useGovernanceRouter.ts`

| Location | Rule / class |
|----------|--------------|
| 88:3 | `error` — Cannot access refs during render (`react-hooks` / refs-during-render) |
| 257:65 | `error` — Cannot access refs during render |
| 257:65 | `error` — Cannot access refs during render (second report at same site) |

**Do not dismiss:** lint exit code is **1** with **3 errors**. This is a real FAIL for the configured `eslint .` gate.

### vs W1-A13 / W2-QA13 lint

| Metric | W1/W2 | R09 |
|--------|-------|-----|
| Exit | **1** | **1** |
| Errors | **414** | **3** |
| Warnings | 457 | 724 |
| Problems | 871 | 727 |

Error volume dropped sharply after `f05cca59` ESLint policy changes (notably `no-explicit-any` → warn + workflow ignores). **Gate still fails** because any error keeps exit code 1. Many former errors are now warnings (visible debt, non-zero problem count).

Likely association of remaining errors: governance V3 navigation (`4cbc8d50` / later governance commits), not reception Wave-1 files.

---

## 5. Shadow `.js` under `src/` (sibling of `.ts` / `.tsx`)

| Field | Value |
|-------|--------|
| Check | Enumerate `src/**/*.js`; flag any file where same basename has `.ts`/`.tsx`/`.mts`/`.cts` sibling |
| Result | **PASS** |
| Log | `audit/recon-2026-08-03/agents/R09-shadow-js-check.log` |

```text
JS_COUNT=0
SHADOW_COUNT=0
PASS: zero shadowing compiled .js under src/ with .ts/.tsx siblings
```

### Method note
- Did **not** run file-scoped `tsc` that would emit next to sources.
- `npm run build` uses `tsc -b` only; `prebuild` runs `scripts/cleanEmittedJs.mjs`.

---

## Evidence files

| Path | Contents |
|------|----------|
| `audit/recon-2026-08-03/agents/R09-npm-run-build.log` | Full build stdout/stderr |
| `audit/recon-2026-08-03/agents/R09-npm-run-build.exit` | `BUILD_EXIT_CODE=0` |
| `audit/recon-2026-08-03/agents/R09-npm-test.log` | Full vitest run |
| `audit/recon-2026-08-03/agents/R09-npm-test.exit` | `TEST_EXIT_CODE=1` |
| `audit/recon-2026-08-03/agents/R09-prior3-tests.log` | Targeted prior-3 re-run |
| `audit/recon-2026-08-03/agents/R09-prior3-tests.exit` | `PRIOR3_EXIT_CODE=0` |
| `audit/recon-2026-08-03/agents/R09-npm-run-lint.log` | Full eslint run |
| `audit/recon-2026-08-03/agents/R09-npm-run-lint.exit` | `LINT_EXIT_CODE=1` |
| `audit/recon-2026-08-03/agents/R09-shadow-js-check.log` | Shadow JS inventory |

---

## Results matrix

| Check | Exit / status | Result | BLOCKING? |
|-------|---------------|--------|-----------|
| `npm run build` | **0** | **PASS** | — |
| `npm test -- --run` | **1** — 2 failed / 1042 passed (1044); 1/93 files failed | **FAIL** | **YES — BLOCKING** |
| Prior 3 (nolan×2 + qapi) targeted | **0** — 49/49 passed | **PASS** | — (resolved vs W2) |
| `npm run lint` | **1** — 3 errors, 724 warnings (727 problems) | **FAIL** | **YES — BLOCKING** |
| Zero shadowing `.js` under `src/` | 0 shadows | **PASS** | — |
| No emit-into-`src/` `tsc` | Not run | **PASS** (compliance) | — |

### Delta vs Wave-2 quality gates

| Item | W2-QA13 | R09 HEAD | Delta |
|------|---------|----------|-------|
| Build | PASS (0) | PASS (0) | unchanged |
| Tests | FAIL — 3 assert + 14 no-suite | FAIL — **2 architecture only** | prior 3 + 14 suite issues cleared; **new** R1 offender |
| Test file count | 72 | 93 | more suites now collected |
| Tests passed | 646 | 1042 | expanded suite + fixed collects |
| Lint | FAIL — 414 errors | FAIL — **3 errors** | large reduction; still red |
| Shadow JS | PASS | PASS | unchanged |

### Pre-existing vs post-`f05cca59` (blocking items)

| BLOCKING item | Pre-existing on W2 tip / `f05cca59`? |
|---------------|--------------------------------------|
| Architecture R1 ×2 (`patient-admission-packet-letter-form.html`) | **No** — introduced by `4cbc8d50` (after `f05cca59`) |
| Lint 3× refs-during-render in `useGovernanceRouter.ts` | **Post-gate-close / governance-era** (not the W2 414-error backlog shape) |
| Prior Nolan + QAPI 3 asserts | **Cleared at HEAD** (were pre-existing on base `7b0b6ae6` per W2-QA13) |
| 14 no-suite files | **Cleared by `f05cca59`** |

---

## Overall Result: **FAIL**

### Why overall FAIL
Gate rule (same as W2-QA13): **PASS only if build + test + lint all green.**

1. **Tests failed** (`npm test -- --run` exit **1**): 2 assertion failures in architecture R1 due to
   `server/assets/governance-references/patient-admission-packet-letter-form.html`
   (introduced by governance V3 portal merge `4cbc8d50`, **after** the claimed gate-close commit). **BLOCKING — not dismissed.**

2. **Lint failed** (`npm run lint` exit **1**): **3 errors** in
   `src/v6/screens/governance/v33/navigation/useGovernanceRouter.ts`
   (refs accessed during render). **BLOCKING — not dismissed.**

### What passed
- Production build (`tsc -b && vite build`) exit **0**.
- Prior Wave 1/2 **three** failing assertions (Nolan ×2 + QAPI interim) now **PASS** (targeted exit **0**; full suite green on those files).
- Prior **14** Vitest “No test suite found” files now collect and run (import fix in `f05cca59`).
- No compiled `.js` shadows under `src/`.
- Build path did not introduce sibling emit into `src/`.

### Claim check: does `f05cca59` “close merge quality gates”?
**Not at current HEAD.**
`f05cca59` materially improved gates (suite collect + lint error mass), but:

- Subsequent commits (notably governance V3) re-broke **tests** (architecture R1) and left **lint** red (3 errors).
- Exact exit codes at this recon: **build=0, test=1, lint=1**.

### Working-tree caveat
Runs executed with **uncommitted** reception/a11y/advanced-training polish present. Architecture failure path and lint error path are **not** among those dirty files; residual risk that dirty tree affects other tests is low for the named failures, but a clean-tree re-run would remove residual ambiguity.

### Consistency with recon report
Aligns with `RECONCILIATION_REPORT.md` note that full-green status was **UNKNOWN** until re-audit of `f05cca59`+later — this R09 supplies that re-audit: **still not full-green**.
