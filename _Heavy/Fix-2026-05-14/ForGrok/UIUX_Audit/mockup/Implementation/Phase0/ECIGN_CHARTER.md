# eCign Workstream Charter

**Status:** DRAFT (Phase 0)
**Owner:** Program Owner + Compliance Lead (TBD)

## Why eCign needs its own charter

eCign is a regulated electronic signature surface. Visual changes touch signature capture, signature integrity display, and signed-document presentation — all of which have legal evidentiary weight. The original 16-agent synthesis treated eCign as one of 6 dialects and one of 14+ Phase 3 surfaces. That is insufficient.

## Scope

All files under `src/policy/**/ecign/**`, plus signature-rendering primitives used elsewhere (e.g., signed-document preview in Policy Detail).

## Gates Before Any Visual Change Ships

1. **Compliance sign-off** — named Compliance Lead reviews and signs each surface change.
2. **Legal sign-off** — confirmation that signature artifact, hash chain, and audit trail are unchanged.
3. **Forensic equivalence test** — automated test verifying that pre/post-change signature artifacts hash-match for an identical input.
4. **Visual regression** — same as other surfaces, with extra baseline for signature stroke rendering and "paper" treatment if retained.

## Decision Required in Phase 0

The current "paper palette" treatment is one of the 6 dialects. The Program Owner must record one of:

- **(P1) Retire paper palette** — eCign rebuilt on canonical glass. Compliance + legal sign-off required.
- **(P2) Sanction paper palette** — eCign documented as a bounded sub-product (similar to CES Option B) with its own visual rules and sunset date. Logged as Exception Registry entry #2.

Default recommendation: **P1**, but only after compliance/legal confirm that the signature artifact and audit trail are unaffected by visual changes.

## Schedule

- **Phase 0:** This charter; decision P1 vs. P2; Compliance Lead named.
- **Phase 2 or 3 (per decision):** Visual rebuild with all four gates.
- **Phase 4:** Sunset of paper palette if P2.
