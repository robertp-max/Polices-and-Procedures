# Exec summary — Appendix F blank-signer fix (pre-2E)

**Date:** 2026-07-09  
**Scope:** Independent cross-cutting correctness fix (USER SETUP F6 / UST-071)  
**Commit message:** `fix: require explicit Appendix F signer name (no employee default)`

## Problem

In `AppendixFScreen.tsx`, HR Director sign-off used:

```ts
name: sigName.trim() || employee.name
```

Leaving the signer name blank silently defaulted to the **subject employee’s** name. An unattended/careless click could record a self-signed HR Director attestation for Appendix F pre-employment screening.

## Fix (smallest path)

| Area | Change |
|------|--------|
| Validation | Blank/whitespace `sigName` → hard error; no employee-name fallback |
| Role | Still requires `HRDirector` (unchanged intent) |
| Completeness | Still requires all items PASS/NA before sign |
| Store | `journeyStore.signAppendixF` **unchanged** |
| UI placeholder | Was `employee.name` (encouraged the bug); now `"HR Director full name (required)"` |

Extracted pure helper `prepareAppendixFSignature(sigName, sigRole, allCleared)` so the save path cannot rebuild the old default and so a unit regression can assert the contract without mounting the full screen.

## Tests

- Extended `src/policy/journey/journey-p0-reuat.test.ts` with **P0-004b**: blank / whitespace rejected; explicit name accepted and not equal to employee seed name; wrong role and incomplete checklist rejected.
- All 8 tests in that file pass.

## Typecheck

`npx tsc -p tsconfig.app.json --noEmit` still reports pre-existing errors in `helpArticles.ts` (`null` vs `string | undefined`). **None introduced by this fix.**

## Files changed

- `src/v6/screens/pageviews/AppendixFScreen.tsx`
- `src/policy/journey/journey-p0-reuat.test.ts`
- `UAT_Reports/USER_SETUP_PHASE1_SCOPE_2026-07-09_122306/exec-summary-appendix-f-fix.md` (this note)

## Not in scope

- Server-side / session-verified HRDirector identity (Phase 2A/2D)
- Audit-log wiring (Phase 2E) — this fix is the pre-2E prerequisite so audit does not faithfully log a known-bad self-signature
- Full Appendix F / certificate UI redesign
