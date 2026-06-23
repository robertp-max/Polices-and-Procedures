# CES Phase 2 — QA Remediation (2026-06-23)

Independent QA of the Phase 1 + 2 one-pass found **Phase 1 solid** but **Phase 2
substantially incomplete with gate-integrity problems**. This document records the
remediation. Branch: `phase13/ces-one-pass` (unchanged — no new branch, not pushed).

## What QA found

1. **`check:ces-types` was rigged.** `tsc ... || (echo "[CES NOTE] ..." && exit 0)`
   always exited 0, swallowing 11 tsc errors. Because `tsconfig.app.json` deliberately
   excludes `src/policy/**`, this script was the **only** thing type-checking CES code —
   so the rig meant CES code was effectively un-type-checked while reporting "PASS".
2. **`tsconfig.ces.json` mis-configured.** `types: ["node"]` dropped `vite/client`, which
   *caused* the `import.meta.env` errors that were then swallowed; `include` was narrowed
   to a hand-picked list that excluded `cesValidators.ts`.
3. **`cesValidators.ts` was a stub.** 6 of 7 validators were `return { ok: true, errors: [] }`
   (validated nothing); all typed `any`; not imported or called anywhere (Task 2.5 unmet).
4. **`cesValidators.test.ts`** tested only 1 of 7 validators.
5. **Branded IDs (`ids.ts`, Tasks 2.1/2.2) were never created.**

## What was fixed

- **`src/policy/ces/ids.ts`** (new): erasable branded id types — `ControlId`, `EventId`,
  `WorkflowId`, `EvidenceRefId`, `TaskId` — with `as*` constructors and a guard. Defined
  locally (not imported from eCIgn, per hard rule). Erasable → compatible with `erasableSyntaxOnly`.
- **`cesValidators.ts`**: real invariant checks for all 7 projection families (non-empty
  arrays, required fields present, numeric ranges `progress 0-100` / `day 1-31`, exact
  4-tuple shape for evidence/audit rows, tone present). Inputs typed `unknown` + runtime
  narrowing — **no `any`**.
- **Task 2.5 wiring**: each `build*` validates its output in dev via `finalize()` — warn-only,
  never throws, no-op under the node test runner / production. Validators are also exported
  for consumers.
- **`cesValidators.test.ts`**: happy path (validates real `build*` output) **and** error path
  for **all 7** validators. Suite total: **33 tests**.
- **Branded IDs adopted (Task 2.2)**: `ControlInventoryRow.controlId: ControlId`
  (`cesMasterControlAudit.ts`) and `CesCalendarEvent.workflowId: WorkflowId`
  (`cesViewProjections.ts`), constructed via the `as*` helpers. Adoption is contained to
  **CES-owned view-model types** so it does not cascade into the v6 screens (verified by the
  full `tsc -b` build).
- **`tsconfig.ces.json`**: `types: ["vite/client", "node"]`; `include` restored to the glob
  `src/policy/ces/**/*.{ts,tsx}` (so `cesValidators.ts` and every CES file is gated).
- **`scripts/check-ces-types.mjs`** (new) + `package.json`: an **honest** gate — runs tsc and
  **fails (exit 1) only on errors inside `src/policy/ces`**, while printing (not swallowing)
  any out-of-mandate transitive errors. Unlike the previous version, it **can fail**.

## Gate status (verified 2026-06-23, in the worktree)

| Gate | Result |
|---|---|
| `npm run check:ces-types` | **PASS** — CES files clean; 6 documented non-CES transitive errors |
| `npm run test:ces` | **PASS** — 33 / 33 |
| `node scripts/check-ces-hygiene.mjs` | **PASS** — 3 / 3 |
| `npm run build` (`tsc -b && vite build`) | **PASS** — type-checks reachable CES graph incl. branded IDs |
| `npm run verify:ces` (composite) | **PASS** |

## Intentionally out of scope (documented, not done)

- **6 transitive type errors in non-CES files** — `policy/audit/auditState.ts`,
  `policy/compliance-execution/{complianceExecutionStore,index}.ts`,
  `policy/data/formsLibraryContent.ts`, `policy/ecign/signerIdentity.ts`,
  `policy/stores/regulatoryExecutionStore.ts`. These are pre-existing missing-module / type
  issues **outside `src/policy/ces`** and are not part of the CES mandate (SPEC §5.1; hard
  rule: do not fix files outside `src/policy/ces`). The honest gate reports them as context.
- **Branded IDs were intentionally NOT applied to `ExecutionUnit.*`** — those ids flow into
  seed data and the v6 screens, so branding them would cascade widely. Adoption was limited
  to CES-owned view-model types to demonstrate "branded IDs in use" without destabilizing the
  build.

## Note on the lost spec file

`CES_PHASE_1_2_HARDENED_EXECUTION_SPEC.md` was an **untracked** file in this worktree and was
destroyed (no longer on disk, not in git history) — consistent with a `git clean -fd`, the
exact hazard the spec's own Phase 0 warned against. A faithful reconstruction has been
restored from session context (see the file header for provenance).
