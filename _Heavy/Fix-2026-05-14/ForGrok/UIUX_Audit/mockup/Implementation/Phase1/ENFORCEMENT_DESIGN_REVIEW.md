# Enforcement Mechanisms — Design Side

**Phase 1 deliverable — constraint only.**
**Companion engineering doc:** [`../Phase0/ENFORCEMENT_DESIGN.md`](../Phase0/ENFORCEMENT_DESIGN.md) (the mechanical/lint/CI side).
**Audience:** Design Lead, Visual Language Police Chair, surface owners.

> This document defines the **design-side** enforcement model. The engineering doc defines the lint rules, runtime assertions, and CI gates that mechanically enforce these rules. The two are co-dependent and must be read together.

---

## 1. Design Review Checklists (Mandatory)

Every PR that touches `src/policy/components/ui/**`, `src/policy/styles/**`, or any route under `src/policy/pages/**` **MUST** include the following checklist completed by the author, then verified by the VLP Chair before merge.

### 1.1 Shell & Frame
- See [`SHELL_AND_FRAME_CONSTRAINTS.md`](SHELL_AND_FRAME_CONSTRAINTS.md) §5.

### 1.2 Layering
- See [`GLASS_LAYERING_CONSTRAINTS.md`](GLASS_LAYERING_CONSTRAINTS.md) §8.

### 1.3 Tokens & Primitives
- See [`TOKEN_AND_PRIMITIVE_CONSTRAINTS.md`](TOKEN_AND_PRIMITIVE_CONSTRAINTS.md) §8.

### 1.4 Motion & A11y
- See [`MOTION_AND_A11Y_CONSTRAINTS.md`](MOTION_AND_A11Y_CONSTRAINTS.md) §6.

### 1.5 Anti-Drift
- See [`ANTI_DRIFT_RULES.md`](ANTI_DRIFT_RULES.md) §6.

> **Rule EN-1.** PRs missing any checklist section are returned without review. The author re-submits with the checklist completed.

---

## 2. Visual Regression Requirements (vs. Top Picks / v2 mocks)

> **Rule EN-2.** Every surface listed in the [Minimum Lovable Canonical Surface Set](../MASTER_4PHASE_IMPLEMENTATION_PLAN.md#minimum-lovable-canonical-surface-set-mlcss--agent-16-recommendation) **MUST** have a committed visual regression baseline at `tests/visual/__screenshots__/<surface>.<theme>.<viewport>.png`, captured against the named v2 mock.

### Required matrices

Each MLCSS surface **MUST** be baselined at the following matrix:

| Axis | Values |
|------|--------|
| Theme | `light`, `dark` |
| Viewport | `1440x900` (desktop), `1024x768` (laptop), `768x1024` (tablet), `390x844` (mobile) |
| Motion | `motion-on`, `motion-reduced` (one baseline each per theme/viewport) |
| Flag | v2 surface flag ON (per [`FEATURE_FLAG_ROLLBACK_PLAN.md`](../Phase0/FEATURE_FLAG_ROLLBACK_PLAN.md)) |

> **Rule EN-3.** The pixel-diff tolerance per cell is **≤ 0.5 %** of pixels changed. Larger diffs require explicit VLP Chair approval and a logged justification.

### Named first baselines (Phase 1 deliverable, not Phase 2)

The following baselines **MUST** exist by Phase 1 exit, even if the underlying surface is still on v1:

1. Shell + Command Center (chrome only).
2. Dashboard (v1 baseline so Phase 2 v2 diff is meaningful).
3. Policy Detail (v1 baseline).
4. Evidence Center (v1 baseline).

This gives Phase 2 a measurable starting point for the "before/after" image evidence the VLP requires.

### Mock comparison gallery (bi-weekly)

> **Rule EN-4.** The VLP Chair **MUST** publish a bi-weekly cross-surface gallery placing the current build's screenshot next to the named v2 mock for each MLCSS surface. The gallery is reviewed live with the Design Lead. Discrepancies are filed as issues with explicit owners.

---

## 3. Rules Promoted to Lint / PR Gates (from design view)

The following design rules are mechanically enforced by the engineering doc. Design owns the *rule*; engineering owns the *implementation*.

| Rule ID | Constraint | Mechanical mechanism (engineering) |
|---------|------------|------------------------------------|
| SF-1, SF-3 | 4-sided contract, no shell-inset override | Runtime `data-shell-frame` assertion + ESLint `policy/no-shell-frame-override`. |
| SF-A1 / A2 / A3 / A4 / A6 | Listed shell-frame anti-patterns | ESLint `no-restricted-syntax` + custom rule. |
| GL-1, GL-2, GL-3 | 3-layer model | Runtime `data-glass-layer` boundary check; primitives are the only path to a layer. |
| GL-A2 | No decorative inner blur | ESLint `no-restricted-syntax` on `backdrop-blur-*` outside primitives. |
| GL-5 | No inline `backdropFilter` / `boxShadow` / `border` on canonical primitives | ESLint custom rule on prop set of canonical primitives. |
| TP-1 → TP-3 | Token mandates | ESLint hex/arbitrary-value rule (warn in Phase 1, error in Phase 2). |
| TP-3 (legacy imports) | No legacy component imports outside bounded tree | `no-restricted-imports` with allow-list. |
| TP-15 / MA-17 | No micro-text < 12 px on glass | ESLint rule on `text-[*]` ; primitive scale tokens enforce floor. |
| MA-1 → MA-7 | Reduced-motion contract | Runtime resolver from `--motion-mode`; ESLint forbids per-surface `@media (prefers-reduced-motion)`. |
| MA-8, MA-9, MA-10 | Focus visible & crisp | axe-core CI gate + visual regression on focus-state baselines. |
| MA-11 | Dialog focus trap | axe-core CI gate + unit test on every dialog primitive. |
| AD-1 → AD-8 | Anti-drift prohibitions | `no-restricted-imports`, `no-restricted-syntax`, file-path-bounded allow-lists. |
| AD-14 | Deletion-only ratchet | `legacy-inventory --assert` CI step. |

> **Rule EN-5.** A rule is not considered "enforced" until both (a) the engineering mechanism is live in CI and (b) the design review checklist references it. If either is missing, the rule is documentation only and must not be cited as a merge blocker.

---

## 4. VLP Chair Operating Model

| Function | Cadence | Notes |
|----------|---------|-------|
| PR review with merge-veto | On every PR matching CODEOWNERS rule | SLA: 1 business day. |
| Bi-weekly mock comparison gallery | Every other Friday | Live with Design Lead. |
| Quarterly exception re-justification | Q-end | Drives [`EXCEPTION_REGISTRY.md`](../Phase0/EXCEPTION_REGISTRY.md). |
| Intake Gate (AD-12) review for new surfaces | On demand | No SLA — held until ready. |
| Standing tools audit (legacy inventory) | Weekly | Reports trend; flags regressions. |

> **Rule EN-6.** VLP veto may be overridden only by Program Owner + Design Lead jointly, logged in the Exception Registry with date and rationale.

---

## 5. Definition of "Visible Done" (Per Surface)

A surface is considered visibly done when all six conditions hold:

1. Side-by-side screenshot against the named v2 mock is reviewable and passes EN-3 tolerance at every cell in the matrix (EN-2).
2. Full accessibility report present and passing (keyboard, SR, contrast composited, reduced-motion, glass-specific).
3. Surface is behind a feature flag with a documented rollback path.
4. Legacy import count for this surface = 0 (verified by inventory script scoped to the surface tree).
5. VLP Chair sign-off recorded.
6. Exception Registry updated (or unchanged with explicit note).

> **Rule EN-7.** All six are necessary; none is sufficient alone. "Visible Done" is the only gate that promotes a surface from `default-off` to `default-on-prod` in the flag lifecycle.

---

## 6. Verification Checklist (Meta — Phase 1 Exit)

Phase 1 exits when all of the following are true:

- [ ] All six Phase 1 constraint docs ([`README`](README.md) lists them) are signed by Design Lead + VLP Chair + Engineering Lead.
- [ ] Engineering's [`ENFORCEMENT_DESIGN.md`](../Phase0/ENFORCEMENT_DESIGN.md) is implemented and live in CI.
- [ ] Visual regression infrastructure is live; the four named v1 baselines (EN-3) are committed.
- [ ] First bi-weekly mock comparison gallery has been published.
- [ ] Legacy inventory `--assert` gate is live in CI; baseline is published in [`PHASE0_BASELINE.md`](../Phase0/PHASE0_BASELINE.md).
- [ ] At least one worked feature-flag rollback example is committed (per Phase 0 plan).
- [ ] No new constraint violations introduced since Phase 0 baseline (ratchet holds).

---

## 7. Out of Scope for Phase 1

- Surface-level content rebuild against the v2 mocks (Phase 2). `[OUT-OF-SCOPE-P1 → Phase 2]`
- Codemod execution against the 7,749 raw-value baseline (tool ready in Phase 1; runs in Phase 2). `[OUT-OF-SCOPE-P1 → Phase 2]`
- Final A11y Wave (Phase 3). `[OUT-OF-SCOPE-P1 → Phase 3]`
