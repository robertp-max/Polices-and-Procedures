# Onboarding Engine Contract

**Status:** DRAFT (Phase 0)
**Owner:** Engineering Lead + Onboarding Domain Lead (TBD)

## Why this exists

Agent 09 flagged that Onboarding has a **strong engine and weak visuals**. The plan treats Onboarding V2 as a visual rebuild only. Without a contract test suite locking the engine's current behavior, the rail/card replacement is likely to cause a silent engine regression mid-flight — historically a program-derailment event.

## Contract Test Suite — Required Coverage

The following engine behaviors must be locked by automated tests **before** any visual code changes ship in `src/policy/**/onboarding/**`:

1. **Step state machine** — every valid transition and every guarded invalid transition.
2. **Document validation rules** — required documents per step, file-type and size validation, retry behavior.
3. **Activation code lifecycle** — issuance, redemption, expiry, single-use enforcement.
4. **Batch progression** — order independence within a batch; cross-batch isolation.
5. **Persistence** — resume-after-reload restores exact step + form state.
6. **Audit trail** — every state change emits the expected audit event with stable schema.
7. **Permissions** — role-based step access (admin vs. employee vs. supervisor).
8. **Error recovery** — network failure mid-step does not corrupt persisted state.

## Test Location

`tests/contract/onboarding/*.spec.ts` — separate from UI tests; run on every PR; ownership: Onboarding Domain Lead.

## Definition of "Green on `main`"

- ≥ 95% coverage of the engine module by branch.
- All 8 coverage areas above have at least one explicit test.
- CI gate is required for any PR touching `src/policy/**/onboarding/**`.

## Phase 0 Exit Criterion

Engine contract suite green on `main`. **Until this is true, the Onboarding visual rebuild is blocked from starting in Phase 2.**

## Visual Rebuild Sequencing (for reference)

1. Phase 0 (this doc): contract suite green.
2. Phase 2: visuals rebuilt behind `onboarding.v2-canonical` flag; contract suite continues to gate every PR.
3. Phase 2 exit: visual fidelity vs. `07_OnboardingDashboard_Desktop_v2.jpg` + `05_OnboardingBatchView_Desktop_v2.jpg`; contract suite still green.
