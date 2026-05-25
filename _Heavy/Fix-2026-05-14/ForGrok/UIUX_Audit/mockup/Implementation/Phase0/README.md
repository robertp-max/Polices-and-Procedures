# Phase 0 — Decisions & Instrumentation

**Window:** 2 weeks (start: 2026-05-17)
**Purpose:** Resolve political and instrumentation prerequisites so Phase 1 enforcement is not born compromised.

## Artifacts in this folder

| File | Purpose | Status |
|------|---------|--------|
| `OWNERSHIP_CHARTER.md` | Names the 5 leadership roles with merge-veto authority. | TEMPLATE — needs signatures |
| `CES_DECISION_BRIEF.md` | Forces the migrate-vs-bound decision. 2-week SLA. | OPEN — needs executive sign-off |
| `ENFORCEMENT_DESIGN.md` | Mechanical enforcement architecture (lint, runtime, VR). | DRAFT |
| `TOKENS_PIPELINE_DESIGN.md` | Style Dictionary + Tailwind + dark-mode duals + codemod plan. | DRAFT |
| `FEATURE_FLAG_ROLLBACK_PLAN.md` | Per-surface flag + rollback procedure + worked example. | DRAFT |
| `EXCEPTION_REGISTRY.md` | Logged, dated, owned visual-contract exceptions. | LIVE (CES = entry #1) |
| `ECIGN_CHARTER.md` | Compliance/legal sign-off gate for signature surfaces. | DRAFT |
| `ONBOARDING_ENGINE_CONTRACT.md` | Engine-protect contract before visual rebuild. | DRAFT |
| `PHASE0_BASELINE.md` | Machine-emitted legacy inventory numbers. | GENERATED |
| `../../../../../scripts/legacy-inventory.mjs` | Inventory script that emits `PHASE0_BASELINE.md`. | COMMITTED |

## Exit Gates

- [ ] All five leadership roles named in writing.
- [ ] CES decision recorded with signatory and date.
- [ ] `PHASE0_BASELINE.md` committed with numbers for every legacy family.
- [ ] Feature-flag infra demonstrated on one surface.
- [ ] Tokens Pipeline + Enforcement design docs approved.
- [ ] Onboarding engine contract tests green on `main`.
- [ ] Exception Registry live with CES as entry #1.

**No Phase 1 code ships until every box is checked.**
