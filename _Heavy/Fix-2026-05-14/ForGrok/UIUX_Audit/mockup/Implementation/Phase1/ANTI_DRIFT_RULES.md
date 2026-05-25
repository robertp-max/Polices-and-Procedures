# Visual Language Anti-Drift Rules

**Phase 1 deliverable — constraint only.**
**Derived from:** Master Consolidated Issues & Gaps Analysis §1.2 (Multiple Parallel Visual Dialects) + §4 (Root Cause: parallel-universe drift).
**Purpose:** Make it structurally impossible for a 7th dialect to appear after Phase 1 closes.

> The platform currently ships six visual dialects. The root cause is not insufficient primitives but **permission to invent**. These rules withdraw that permission.

---

## 1. Hard Prohibitions (No Exceptions)

> **Rule AD-1.** **No new sub-brand canvas.** No domain, surface, or team may introduce a parallel token palette, background, or shell treatment that competes with the canonical one. CES Navy is the last sanctioned dialect; its disposition is governed by the [`CES_DECISION_BRIEF`](../Phase0/CES_DECISION_BRIEF.md). No further sub-brand carve-outs will be granted.

> **Rule AD-2.** **No new shell rail or sidebar.** The shell's primary navigation and context zones (§5 of Canonical Spec) are the only sanctioned navigation chrome. Per-page rails (e.g., the Onboarding V2 260 px white rail) are prohibited. New navigation needs **MUST** be expressed within the shell's existing zones or via the canonical drawer/sheet primitives.

> **Rule AD-3.** **No new card system.** Local card components (`CesCard`, `SCard`, `KpiTile`, `GateTile`, `PmTaskCard`, custom `StatusBadge`, etc.) **MUST NOT** be created. All card-like surfaces use `SurfaceCard`. Missing capabilities are addressed by extending `SurfaceCard` via approved props, not by forking.

> **Rule AD-4.** **No new glass utility classes.** Legacy class families (`glass-interactive-lib`, `glass-panel-lib`, `ci-premium-*`, `ci-executive-*`, `wave-*`) are retired and **MUST NOT** be referenced by new code. Glass behaviour is reached only through canonical primitives.

> **Rule AD-5.** **No theatrical layout systems.** Hero carousels, cinematic absolute-positioned reveals, full-bleed gradient washes, and "journey" animation sequences are prohibited on operational surfaces. Marketing/demo surfaces are out of scope for Phase 1.

> **Rule AD-6.** **No per-mode DOM branching.** Light vs. dark mode is a token swap (Rule GL-9). Conditional rendering of different component trees, layouts, or copy per mode is prohibited.

> **Rule AD-7.** **No layout escape hatch via inline style.** `style={{ … }}` for visual properties on canonical primitives is prohibited. Layout-only properties (e.g., dynamic grid template generated from data) are allowed when the spacing/color values still reference tokens.

> **Rule AD-8.** **No "demo" code in production paths.** Demo surfaces (CI-ION legacy demos, marketing snippets) are isolated to `src/policy/**/demo/**` and **MUST NOT** be imported from any production route under `src/policy/pages/**`.

---

## 2. Sanctioned-Exception Discipline

Sanctioned exceptions exist (see [`EXCEPTION_REGISTRY.md`](../Phase0/EXCEPTION_REGISTRY.md)). They are **not** licenses to invent.

> **Rule AD-9.** Any sanctioned exception **MUST** still:
> - Preserve the 4-sided contract (SF-1) **inside** the bounded tree, unless the exception explicitly names `full-canvas` mode.
> - Use the strict 3-layer model (GL-1) inside the bounded tree.
> - Respect reduced-motion (MA-1) and contrast (MA-13–18) rules globally — accessibility exceptions are **never** granted.
> - Be ESLint-allow-listed with a glob no broader than the bounded tree.
> - Carry a sunset date.

> **Rule AD-10.** Exception scope **MUST** be bounded by file path globs, not by component names. "Permit `CesCard` everywhere CES needs it" is prohibited; "Permit `CesCard` in `src/policy/**/ces/**`" is the only acceptable form.

> **Rule AD-11.** Each quarter, the VLP Chair runs an exception review. Any exception past its sunset date auto-promotes to the Program Owner's escalation queue and **blocks** new feature work in the affected tree until resolved.

---

## 3. Drift-Prevention for New Surfaces ("Intake Gate")

A new surface (route, domain, sub-product) **MUST** pass the following gate before any UI code is merged:

> **Rule AD-12 (Intake Gate).**
> 1. The surface is composed entirely from canonical primitives (no new local components).
> 2. The surface declares its layer assignment for every visible element (`data-glass-layer` audit on the first PR).
> 3. The surface passes the Shell & Frame review (SF-checklist) and the Layering review (GL-checklist).
> 4. The surface has an approved Top Picks / v2 mock to compare against. **No mock = no merge.** If no mock exists, the surface goes through design first; UI implementation is blocked.
> 5. The surface is gated behind a feature flag per [`FEATURE_FLAG_ROLLBACK_PLAN.md`](../Phase0/FEATURE_FLAG_ROLLBACK_PLAN.md).
> 6. The VLP Chair signs the first PR.

> **Rule AD-13.** "We will canonicalize later" is an explicitly **rejected** justification. Any new surface that cannot pass AD-12 at first merge is held until it can.

---

## 4. Dialect Detection (Standing Audit)

The legacy inventory script ([`scripts/legacy-inventory.mjs`](../../../../../../scripts/legacy-inventory.mjs)) is the standing detector. The following signals trigger a VLP review:

| Signal | Threshold | Action |
|--------|-----------|--------|
| New file containing a hex literal under `src/policy/**` outside `styles/tokens/**` | any | PR blocked. |
| New `import` of a legacy component (CesCard, SCard, …) outside its bounded tree | any | PR blocked. |
| New string match of a legacy CSS class (`glass-*-lib`, `ci-premium-*`) outside its bounded tree | any | PR blocked. |
| New `bg-white` / `h-full w-full` / `-mx-{3,4,6}` on a page root | any | PR blocked. |
| `legacy-inventory --assert` regression vs. baseline | > 0 | CI fails. |

> **Rule AD-14.** Threshold = "any" means a single instance blocks merge. The deletion-only ratchet is non-negotiable.

---

## 5. Anti-Pattern Catalog (Drift-Specific)

| ID | Anti-pattern | Why it produces drift |
|----|--------------|-----------------------|
| AD-A1 | "Just for this domain, we'll use a different navy" | Creates a new sub-brand. |
| AD-A2 | "Our cards need slightly different padding; we'll fork `SurfaceCard`" | Creates a new card system. |
| AD-A3 | "Our nav is conceptually different; we'll add a per-page rail" | Creates a new shell. |
| AD-A4 | "This page is mostly tables, so we'll opt out of glass" | Creates a parallel surface treatment. |
| AD-A5 | "It's just a marketing module; rules don't apply" | Demo code leaks into production paths. |
| AD-A6 | "We'll canonicalize later; ship now" | Re-introduces parallel-universe drift. |

Every one of these has occurred in the history of this codebase. Each is now prohibited.

---

## 6. Verification Checklist (Design Review)

- [ ] No new tokens, primitives, or shell variations introduced.
- [ ] No new local card / badge / panel / tab components.
- [ ] No per-page rail or sidebar.
- [ ] Light/dark differ only by token values; DOM tree is identical.
- [ ] Any sanctioned exception is logged with bounded glob and sunset date.
- [ ] New surfaces pass the Intake Gate (AD-12) before first merge.
- [ ] Legacy inventory script reports no regression.

---

## 7. Out of Scope for Phase 1

- Migration of existing legacy code (Phase 2/3 deletion sprints). `[OUT-OF-SCOPE-P1 → Phase 2/3]`
- CES retire/bound execution (decision-only in Phase 0; execution in Phase 2/3). `[OUT-OF-SCOPE-P1]`
- Marketing / demo surface design. `[OUT-OF-SCOPE-P1]`
