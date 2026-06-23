# CES Phase 1 & 2 — Hardened Execution Spec

> **⚠ PROVENANCE — RECONSTRUCTED 2026-06-23.** The original of this file was an
> *untracked* file in this worktree and was destroyed (not on disk, not in git
> history) — consistent with a `git clean -fd`, the exact hazard Phase 0 below
> warns against. This is a faithful reconstruction from session context: the
> normative sections that were edited in-session (Phase 0, §5.1/§5.3 backbone,
> §7 validators, §8 git, §11 DoD, §12) are verbatim or near-verbatim; other
> sections are accurate summaries of intent. Treat the gate definitions and the
> Definition of Done as authoritative; see `CES_PHASE_2_REMEDIATION.md` for the
> as-built status.

## 1. Mission & hard rules

Bring the CES (Compliance Execution Sprint) slice from design-illustrative static
data to **seed-driven, type-checked, validated projections** across the 11 CES
views — in one disciplined pass — without destabilizing the V6 rebuild.

**Hard rules (non-negotiable):**

1. **No live Google / Drive / Evidence write calls** in CES prototype code
   (`drive.files.create/update/patch`, `permissions.create`, `googleEvidence.*`
   publish/upload/attach/write/create). String id fields like `googleCalendarEventId`
   are fine. Real writes stay in the server layer (untouched).
2. **No `@ts-nocheck`** in `src/policy/ces/**` (Phase 2: hard-fail).
3. **No `.js` under `src/`** (compiled shadows of `.ts`/`.tsx`).
4. **Do not edit eCIgn** code, and **do not import id types from eCIgn** — CES owns
   its own branded id vocabulary.
5. **Pure projections** — `build*` functions are synchronous, deterministic, no I/O,
   no side effects; every family has a `FALLBACK_*` for resilience.
6. **Fix type errors properly** — never disable a flag (`strict`,
   `verbatimModuleSyntax`, `erasableSyntaxOnly`) or rig a gate to pass. If a real
   issue surfaces, fix the code.
7. **Do not fix files outside `src/policy/ces/`** (plus the explicitly allowed root
   config + allowed v6 CES screens). Document out-of-mandate transitive errors;
   don't chase them.
8. **Stage explicit paths only** — never `git add -A` / `git add .`.
9. **All work stays on `phase13/ces-one-pass`.** Do not create another branch.
   No co-author trailer. Do not push without explicit authorization, and never to
   `v2/designless-baseline` or `main`.

## 2. Phase 0 — Safety checkpoint (DO THIS BEFORE ANYTHING ELSE)

- There are ~19 files already **STAGED but NOT COMMITTED** (the prior one-pass).
  This is the most fragile thing in the repo. A stray `git reset`, `git checkout`,
  or `git clean -fd` will destroy it.

> Commit the existing staged work so it cannot be lost, then **continue working on
> `phase13/ces-one-pass`** on top of that checkpoint commit. Do **not** create another
> branch — hard rule 9 keeps all work on `phase13/ces-one-pass`.
>
> ```bash
> cd "C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2_CES"
> git status                      # confirm staged files are CES + plan docs only
> git commit -m "chore(ces): checkpoint prior one-pass staged work before phase 1-2"
> git tag ces-pre-phase12-backup  # rescue point; never delete
> git rev-parse HEAD              # write this hash down — your rollback target
> ```
>
> Only after this commit exists do you proceed. From here, **never run `git clean -fd`
> while this spec file or any new untracked work is uncommitted** — stage/commit first.

## 3. Project conventions (non-obvious — these WILL bite you)

- The designless app build (`tsconfig.app.json`) **intentionally excludes
  `src/policy/**`** — only the neutral scaffold + `src/v6` are compiled/bundled.
  CES process-logic files live on disk but are only type-checked by the dedicated
  `tsconfig.ces.json` gate (or transitively where `src/v6` imports them).
- `tsconfig.app.json` carries `"types": ["vite/client"]`, `"@/*"` path aliases,
  `strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals/Parameters`.
  Any new CES code must honor all of these.
- `npm run build` runs `tsc -b && vite build`, so it **does** type-check everything
  reachable from `src/v6`.

## 5. Phase 0.5 — Backbone (type gate + scripts + hygiene) — run before feature code

### 5.1 `tsconfig.ces.json` (new, repo root)
Type-checks CES policy code that nothing else checks today.
```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "noEmit": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.ces.tsbuildinfo",
    "types": ["vite/client", "node"]
  },
  "include": ["src/policy/ces/**/*.ts", "src/policy/ces/**/*.tsx"]
}
```
Notes:
- It inherits `strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly` from the app
  config. If those surface a **real** issue in CES code (e.g. an `enum` under
  `erasableSyntaxOnly`), **fix it properly** (convert to a `const` union, add
  `import type`) — do not disable the flag.
- Keep `"types"` as `["vite/client", "node"]`. Dropping `vite/client` makes
  `import.meta.env` fail; adding `node` enables the test runner imports.
- This config may also flag type errors in **non-CES** policy files that CES imports
  transitively. **Do not fix files outside `src/policy/ces/`.** Document the
  pre-existing out-of-scope errors in your report. Your mandate is CES only.
- The `**/*.tsx` glob is a guard for any future `.tsx` under `src/policy/ces/`. The V6
  **screen** `.tsx` files you edit (under `src/v6/**`) are already type-checked by
  `npm run build` (`tsconfig.app.json` includes `src/v6`).

### 5.2 npm scripts (`package.json`)
```jsonc
"test:ces":        "tsx --tsconfig tsconfig.app.json --test \"src/policy/ces/**/*.test.ts\"",
"check:ces-types": "node scripts/check-ces-types.mjs",
"verify:ces":      "npm run test:ces && node scripts/check-ces-hygiene.mjs && npm run check:ces-types"
```
`check:ces-types` must be a **real** gate: it runs `tsc -p tsconfig.ces.json --noEmit`
and **fails (exit 1) only on errors inside `src/policy/ces`**, printing out-of-mandate
transitive errors as context. It must **not** be `tsc ... || exit 0` (a gate that can
never fail is not a gate).

### 5.3 `scripts/check-ces-hygiene.mjs` (new)
A Node script (ESM, no deps) that **exits non-zero** if any of these fail. Implement these checks:
1. **No `.js` under `src/`** (excluding anything already gitignored) → fail if found.
2. **No `@ts-nocheck` in `src/policy/ces/**`** (Phase 2 target; hard-fail, report count).
3. **No live Google/Drive/Evidence write calls in CES code** — scan `src/policy/ces/**`
   and the CES screen files and fail on **write-API patterns only**, e.g.
   `drive.files.create`, `drive.files.update`, `drive.files.patch`,
   `drive.permissions.create`, `permissions.create`, and
   `googleEvidence.*(publish|upload|attach|write|create)`. **Do NOT** match bare
   `.update(` / `.patch(` — those hit ordinary array/object/Zustand calls and cause
   false positives. String-field names like `googleCalendarEventId` are fine.
4. Print a one-line PASS/FAIL summary per check.

## 6. Phase 1 — Seed-driven projections + view wiring

Build pure projections in `src/policy/ces/cesViewProjections.ts` and wire the views to them:

| # | Task |
|---|---|
|1.1|Remove `@ts-nocheck` from CES seeds; fix the underlying type mismatches properly.|
|1.2|7 pure `build*` (board, events, tasks, calendar, evidence, audit, report) + `FALLBACK_*`.|
|1.3|Tests covering non-empty / shape / counts / fallback for all 7 families.|
|1.4|Wire board / events / tasks / calendar / reports screens to the projections.|
|1.6|`onCardClick` navigation (ces-board cards → evidence / swimlane).|
|1.7/1.8|Functional, stateful filters + nav in events-board and my-tasks.|
|1.9|"Generate packet" button → reports.|

## 7. Phase 2 — Type safety, validators, deep links

### 7.1 Branded IDs + validators

| # | Task | File | Acceptance |
|---|---|---|---|
|2.1|Branded CES IDs|new `src/policy/ces/ids.ts`|Local `Brand<T,B>` + `ControlId`, `EventId`, `WorkflowId`, `EvidenceRefId`, `TaskId` + `as*` helpers. **Do not import from eCIgn.**|`check:ces-types` green|
|2.2|Adopt branded IDs in CES types/projections|`types.ts`, `cesViewProjections.ts`, `cesMasterControlAudit.ts`|Relevant id fields use branded types; no `any`|`check:ces-types` green|
|2.3|View validators|new `src/policy/ces/cesValidators.ts`|`validateBoardLanes`, `validateEventLanes`, `validateTaskLanes`, `validateCalendarEvents`, `validateEvidenceRows`, `validateAuditRows`, `validateReportMetrics` — each returns `{ ok: boolean; errors: string[] }`, same style as `validateCesControlAuditView`|`check:ces-types` green|
|2.4|Validator tests|new `src/policy/ces/cesValidators.test.ts`|Happy + error path per validator|`npm run test:ces` green|
|2.5|Call validators from projections (defensive)|`cesViewProjections.ts`|Each `build*` validates its output (in dev) or exposes a `validate*` consumers can call|`test:ces` green|

> **"7 validators" vs "11 views":** the 7 validators above are the **projection families** that back the
> data-driven CES views; master-controls already has `validateCesControlAuditView` (8 total). Any CES
> view with no distinct projection (e.g. workflows, workflow-swimlane, mobile-incident) must still be
> covered by the nearest family validator **or** be explicitly listed as out of scope in the Phase 2
> report — no view may be silently left unvalidated.

### 7.2 Cross-view deep links (query-param filtered navigation)
Pure helpers (`getControlFromParams`, `getBucketFromParams`) + destination screens that
read the params and **visibly filter**. Cover the board → evidence, master-controls →
evidence, evidence → audit, reports → master/evidence, calendar → events flows.

## 8. Git workflow

Per task: stage **explicit paths only**, then commit. Example:
```bash
# 3. stage EXPLICIT paths only — never -A / never .
git add src/policy/ces/cesViewProjections.ts src/policy/ces/cesViewProjections.test.ts

# 4. commit with a conventional message describing the one task
git commit -m "feat(ces): seed-driven board/event/task projections with fallbacks"

# 5. confirm a clean, intentional tree
git status --porcelain
```
Commit message prefixes: `feat(ces):`, `fix(ces):`, `test(ces):`, `chore(ces):`, `docs(ces):`.
Do **not** add any co-author trailer. **Do not push** unless the user explicitly authorizes a push
after the final report — and never to `v2/designless-baseline` or `main` (hard rule 9).

## 11. Definition of Done

- Phase 0 checkpoint commit + `ces-pre-phase12-backup` tag exist; all work on `phase13/ces-one-pass`.
- Seeds free of `@ts-nocheck`; projections pure + seed-driven with `FALLBACK_*`.
- Branded IDs in use; `cesValidators.ts` covers all 7 projection families (board, events,
  tasks, calendar, evidence, audit, reports) with tests, and master-controls keeps its
  existing `validateCesControlAuditView`. No CES view is left static/unvalidated unless
  explicitly listed as out of scope in the report.
- Gates green: `npm run build`, `npm run test:ces`, `npm run check:ces-types` (honest —
  can fail), `node scripts/check-ces-hygiene.mjs`, `npm run verify:ces`.
- No live Google/Drive writes in CES; no eCIgn edits; no `.js` under `src/`.
- Not pushed; no co-author trailer; explicit-path commits only.
- Final report lists what landed and what is out of scope.

## 12. First three commands (start here)

```bash
cd "C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2_CES"
git status            # see the staged prior-pass work
git rev-parse --abbrev-ref HEAD   # must print: phase13/ces-one-pass
```
Then do **Phase 0** (Section 2) → **Phase 0.5 backbone** (Section 5) → **Phase 1** (Section 6) → **Phase 2** (Section 7).
