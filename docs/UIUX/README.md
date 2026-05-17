# UI/UX Reconstruction — Canonical Documentation

This directory contains the **core governance documents** for the UI/UX reconstruction program.

**Implementation and execution documents** (surface checklists, kickoff packages, tokens, matrices, mocks, design references, etc.) have been moved to:
`_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/`

## Core Governance Documents

| File | Purpose |
|------|---------|
| **[CANONICAL_UI_SYSTEM_SPEC.md](./CANONICAL_UI_SYSTEM_SPEC.md)** | Phase 1 lock. The only authoritative contract. All code, reviews, and decisions must trace back to this document. |
| **[UIUX_RECONSTRUCTION_MASTER_PLAN.md](./UIUX_RECONSTRUCTION_MASTER_PLAN.md)** | Phased roadmap, sequencing rules, and non-negotiables. |
| **[PHASE1_EXIT_CHECKLIST.md](./PHASE1_EXIT_CHECKLIST.md)** | Formal gate checklist. Nothing proceeds to Phase 2/3 until every item is signed off. |
| **[16_POINT_ALIGNMENT_REVIEW.md](./16_POINT_ALIGNMENT_REVIEW.md)** | Original 16-perspective baseline review. |
| **[16_POINT_FOLLOWUP_REVIEW.md](./16_POINT_FOLLOWUP_REVIEW.md)** | Second 16-point analysis measuring improvement after hardening (moved from 6.3 → 7.9 average). |
| **[DRIFT_REGISTER.md](./DRIFT_REGISTER.md)** | Living register of all known deviations from the original audit. Every item has owner + target phase. |

## Supporting Structure

- **`design-references/`** — Frozen high-signal source material from the original May 2026 UIUX_Audit (glass layering, typography scale, color tokens, motion, etc.). These informed the Canonical Spec but are **not** the locked version.
- **`mocks/Top-Picks/`** — Reference visual contract (especially the two desktop mockups that define the 4-sided glassmorphism framing rule).
- **`tokens/`** — Home of `tokens.json` (source of truth) + generation pipeline docs and stubs.
- **`primitives/`** — Living catalog of the canonical `ui/*` component layer (`GlassPanel`, `SurfaceCard`, etc.) with ownership and extension rules.
- **`SURFACE_CHECKLISTS/`** — Per-surface reconstruction checklists (Dashboard is the first reference template).
- **`DECISION_LOG.md`** — Home for all forced Phase 1 strategic decisions (CES, Onboarding/Journey, Print).
- **`LEGACY_DEPRECATION_MATRIX.md`** — Maps every legacy component family to its canonical replacement.
- **`PHASE1_READINESS_DASHBOARD.md`** — Single source of truth status page for Phase 1 progress.
- **`PHASE1_COMPLETION_SIGNOFF_PACKAGE.md`** — Executive sign-off document (final 9.5 score + all artifacts).
- **`DASHBOARD_RECONSTRUCTION_KICKOFF.md`** — Ready-to-use starter package for the first reference surface.

## Usage Rules

1. **All implementation** on operational surfaces must follow `CANONICAL_UI_SYSTEM_SPEC.md`.
2. The **Constrained Page View Contract (Section 4)** — whose explicit purpose is to magnify the glassmorphism effect — is a hard blocker for any Phase 3 surface delivery.
3. Any change to locked contracts requires a recorded decision against this spec.
4. No Phase 2 or Phase 3 work is permitted until the Phase 1 Exit Checklist is fully signed off.

---

**Canonical Location:** `docs/UIUX/`  
**Archival Source Material:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/` (do not edit — treat as read-only history)

Maintained by the UI/UX Reconstruction program.
