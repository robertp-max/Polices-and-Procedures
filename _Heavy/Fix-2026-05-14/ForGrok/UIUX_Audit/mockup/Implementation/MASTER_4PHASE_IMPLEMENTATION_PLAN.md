# Master Implementation Plan (5-Phase, revised)
**To Realize the Canonical UI System & Locked Visual Contract (Top Picks + v2 Mocks)**

**Source:** Synthesis of 16 Independent Specialized Subagent 4-Phase Plans (May 2026)
**Date:** 2026-05-18 (Original) — **Revised 2026-05-17 (Architect Review)**
**Guiding Principle:** Enforce the single perceptual contract (4-sided constrained glass + 3-layer model) and retire competing dialects. Progress is measured by side-by-side mock fidelity, not checklists.

> **Revision Note:** The original 4-phase plan has been restructured to 5 phases with the addition of **Phase 0 — Decisions & Instrumentation**. Phase 0 forces the CES decision, names owners, commits the legacy inventory baseline, and lands feature-flag + rollback infrastructure *before* enforcement code is written. Without Phase 0, all subsequent enforcement is built around unresolved exceptions and reproduces the diagnosed drift. Original phase content is preserved below the new Phase 0.

---

## Strategic Priorities (Consensus Across Agents)

1. **Enforce the Shell + 4-Sided Contract First** (Agents 02, 04, 01, 15, 05)
2. **Kill Parallel Visual Dialects** — especially CES Navy and Onboarding V2 rail (Agents 15, 06, 09)
3. **Early High-Leverage Surfaces** — Dashboard (reference) + Evidence + Policy Detail (Agents 05, 07, 08, 16)
4. **Mechanical Enforcement & Visual Language Police** (Agents 03, 14, 15, 16)
5. **Aggressive Legacy Deletion** (not just deprecation) (Agent 14)
6. **Dedicated A11y Hardening Wave** (not last) with glass-specific fixes (Agent 13)
7. **Image-Driven Gates** vs. exact Top Picks / v2 mock files (Agent 16)
8. **Mobile as First-Class Citizen** (Agent 12)

---

## Overall Phase Structure

### Phase 0: Decisions & Instrumentation (2 weeks) — NEW
**Goal:** Resolve the political and instrumentation prerequisites so that Phase 1 enforcement is not born compromised. **Nothing in Phase 1 ships until all Phase 0 exit gates pass.**

**Key Workstreams**
- **Named Ownership Charter** — Program Owner, Design Lead, Engineering Lead, A11y Lead, and **Visual Language Police Chair** (with merge-veto authority). Names, not roles.
- **CES Decision Gate (forced)** — Executive decision recorded: (a) full migration to canonical glass, or (b) formally bounded sub-product with strict visual rules and a sunset date. Hard SLA: 2 weeks. CES is logged as Exception Registry entry #1 regardless of outcome.
- **Legacy Inventory Baseline** — Commit `scripts/legacy-inventory.mjs` that emits a machine-readable count of: legacy component imports (`CesCard`, `SCard`, `PmTaskCard`, `GenericSectionPanel`, custom tabs, `StatusBadge`, `iAdministrator/*`, `.glass-*-lib`, `ci-premium-*`), raw color/spacing values, `bg-white`/`h-full`/`-mx-*` shell-frame violators, and `.old` files. Publish baseline numbers in `PHASE0_BASELINE.md`.
- **Feature-Flag + Rollback Infrastructure Spike** — Per-surface flag mechanism (with environment overrides), documented rollback procedure, and a worked example on one low-risk surface.
- **Tokens Pipeline Design Doc** — Style Dictionary vs. hand-rolled decision, Tailwind theme generation strategy, CSS variable emission contract, dark-mode duals, contrast-pair generation, codemod plan for raw values.
- **Enforcement Design Doc** — Named ESLint rules, `no-restricted-imports` boundary list, runtime dev-mode `ShellFrame` assertion specification, visual regression tool selection (Chromatic / Percy / Playwright) with baseline location and flake-triage owner.
- **Exception Registry** — Format, owner, re-justification cadence (quarterly), and storage location committed.
- **Onboarding Engine Contract Test Suite** — Lock the existing engine behavior before any visual rebuild touches Onboarding.
- **eCign Workstream Charter** — Compliance/legal sign-off gate defined for any signature-surface visual change.

**Exit Gates (Non-Negotiable)**
- All five leadership roles named in writing.
- CES decision recorded with signatory and date; logged in Exception Registry.
- `PHASE0_BASELINE.md` committed with numbers for every legacy family and violation class.
- Feature-flag infra demonstrated on one surface.
- Tokens Pipeline + Enforcement design docs reviewed and approved.
- Onboarding engine contract tests green on `main`.

**Reference Surfaces:** None (instrumentation phase).

---

### Phase 1: Foundation Lock & Enforcement (6–8 weeks — revised from 4–5)
**Goal:** Make it mechanically difficult or impossible to violate the core contract.

**Key Workstreams**
- Harden `ShellFrame` / `ShellContentFrame` + introduce `ConstrainedPageContent` + `GlassComposition` primitives with runtime + lint guards.
- Wire authoritative `tokens.json` pipeline into the running app (`src/styles/tokens.css` + Tailwind).
- Enforce 4-sided breathing room + 3-layer model via ESLint + visual regression on shell + Dashboard.
- TravelightBG: add proper `prefers-reduced-motion` static mode + blur opt-out.
- Focus ring hardening for glass states + glass contrast matrix.
- Stand up permanent **Visual Language Police** process (bi-weekly cross-surface screenshot gallery vs Top Picks, PR gates, exception registry).
- Immediate legacy cleanup: delete the 3 backup `.old` files + `TaxonomyPage.old.tsx`.

**Exit Gates (Non-Negotiable)**
- Zero new violations of 4-sided contract or inner glass nesting on any PR touching shell or Dashboard.
- All canonical tokens wired and used by shell + Dashboard.
- First Visual Language Police gallery published (Dashboard + Evidence + Policy).
- Reduced-motion support for TravelightBG passes manual test.

**Reference Surfaces:** Dashboard (make it the living reference).

---

### Phase 2: Reference Surfaces + Major Dialect Resolution (10–12 weeks — revised from 6–8)
**Goal:** Deliver visible, high-fidelity wins on the most important surfaces and resolve the two largest parallel systems.

**Standing Design Rule (Applies to Phase 2, 3, and 4):**
- Every surface must use **either one main glass frame or multiple individual glass cards**.
- Each glass card/frame **must appear to float** over the background with clearly visible borders on all four sides.
- No flush/edge-touching cards. The 4-sided breathing room principle must be respected at both the page level and the individual card level to preserve glassmorphism depth.

**Key Workstreams**
- **Dashboard** — Full structural and visual fidelity to `01_Dashboard_Desktop_v2.jpg` + mobile equivalents (remove nested frames, promote cards to `SurfaceCard`/`GlassPanel`, match spacing/urgency hierarchy). Ensure all cards visibly float with clear borders.
- **Evidence Center + Capture** — Replace tables with `DataGrid` + card/gallery view, modernize `PhotoEvidenceCapture` + PDF flow, rebuild `CesEvidenceHierarchyPanel` using canonical primitives (target: `02_EvidenceCenter_Desktop_v2.jpg` + `12_EvidenceCapture_Desktop_v2.jpg`). All elements must float with visible borders.
- **Policy Library / Detail / Search** — Eliminate solid white `bg-white` containers; enforce single `ShellContentFrame` + `PolicySectionCard` pattern so reading surfaces feel like calm premium glass (target: `03_PolicyDetail_Desktop_v2.jpg`, `06_PoliciesLibrary_Desktop_v2.jpg`). Cards must float with clear borders.
- **CES Decision Gate** — Executive decision: either (a) fully migrate CES to canonical glass language or (b) formally bound it as a documented sub-product with strict visual rules. No more uncontrolled parallel system. Floating glass cards with borders required in either path.
- **Onboarding V2** — Replace 260px white rail + flat cards with canonical glass treatment (target: `07_OnboardingDashboard_Desktop_v2.jpg`, `05_OnboardingBatchView_Desktop_v2.jpg`). All cards must float with visible borders.
- Begin aggressive legacy deletion on the above surfaces (delete `CesCard`, `SCard` definitions once ref count hits zero).

**Exit Gates**
- Dashboard, Evidence, and Policy Detail pass side-by-side visual regression against their primary v2 mocks in both light and dark modes.
- CES decision recorded and first migration or bounding work underway.
- Visual Language Police has approved the three reference surfaces.

---

### Phase 3: Full Surface Reconstruction + Consistency Enforcement (12–16 weeks — revised from 8–10)
**Goal:** Bring every operational surface into the single visual family.

**Standing Design Rule (Applies to Phase 2, 3, and 4):**
- Every surface must use **either one main glass frame or multiple individual glass cards**.
- Each glass card/frame **must appear to float** over the background with clearly visible borders on all four sides.
- No flush/edge-touching cards. The 4-sided breathing room principle must be respected at both the page level and the individual card level to preserve glassmorphism depth.

**Key Workstreams**
- Rebuild remaining high-traffic surfaces using the now-hardened primitives and contract: Calendar, MyTasks, Forms signing, Audit Mode, Master Control, Journey unification, eCign entry points, Staffing, Admin. All glass elements must float with visible borders.
- Universal mobile optimization (bottom sheets, vertical stacks, 44px targets, safe-area) to match Mobile/v2 mocks (Agent 12 plan).
- Dedicated **A11y Hardening Wave** (focus traps in all dialogs, full live region adoption, glass contrast remediation, reduced-motion everywhere, roving tab where appropriate).
- Complete legacy family sunsetting sprints (CesCard, PmTaskCard, regulatory primitives, custom tabs, iAdministrator subtree, etc.).
- Enforce Visual Language Police on every surface (screenshot gallery + lint + 4-sided verification).

**Exit Gates**
- All 14+ operational surfaces pass Visual Language Police review against Top Picks / v2 mocks.
- No active production use of deprecated legacy card/badge/tab families.
- Full accessibility regression (keyboard + SR + contrast + reduced-motion + glass) signed off on reference surfaces + CES + Evidence + Policy.

---

### Phase 4: Legacy Retirement, Permanent Guardrails & Final Sign-off (6–8 weeks — revised from 4–6)
**Goal:** Institutionalize the single contract and retire everything else.

**Key Workstreams**
- Final aggressive legacy deletion push (target: ≥35% reduction in legacy UI surface area measured by inventory script + git deletions).
- Permanent enforcement:
  - ESLint ERROR on raw values, legacy component imports, and 4-sided/3-layer violations across entire `src/policy/`.
  - Visual regression + axe + mock-fidelity gates in CI.
  - Quarterly Visual Language Police audits + annual exception re-justification.
  - All surfaces must continue to follow the floating glass card/frame rule (either single frame or multiple cards, each with visible borders floating over the background).
- Publish complete 360° visual regression gallery (all v2 + Top Picks mocks + 10 additional high-traffic views) with blind review and signed approval.
- Close all remaining DRIFT_REGISTER items related to visual language.
- Produce "Legacy Debt Retirement Certificate" and final program retrospective.

**Exit Gates (Highest Rigor)**
- Zero production legacy card/badge/tab families.
- Every surface has a signed `*_Accessibility_Validation_Report.md` + visual fidelity evidence bundle.
- Design Lead + Engineering Lead + Product Owner + Accessibility Lead sign the final 360° gallery.
- No new work is allowed until Phase 4 gates are passed.

---

## Governance & Process Requirements (Required by Multiple Agents)

- **Visual Language Police** (Agent 15) — permanent, resourced, with real gate power.
- **Image-Driven Progress** (Agent 16) — side-by-side comparisons to exact mock files are the primary success metric.
- **Floating Glass Rule Enforcement** (Phases 2–4): Every surface must use either a single main glass frame or multiple floating glass cards, each with clearly visible borders on all sides. This rule must be verified during Visual Language Police reviews and in all visual regression baselines.
- **Deletion Gates** (Agent 14) — Phase exit criteria must include measured physical removal of legacy code, not just new canonical code added.
- **A11y Not Last** (Agent 13) — dedicated Wave in Phase 3 with glass-specific fixes.
- **Mobile-First Discipline** (Agent 12) — every surface rebuilt in Phase 3 must pass mobile v2 mock parity before sign-off.

---

## Minimum Lovable Canonical Surface Set (MLCSS) — Agent 16 Recommendation

These surfaces must reach high visual fidelity before broader rollout is considered:

1. Shell + Command Center (enforcement)
2. Dashboard (reference surface)
3. Evidence Center + Capture
4. Policy Library / Detail / Search
5. CES Operational Core (Board + MyTasks + Calendar) — after decision gate

All other surfaces (Journey, Staffing, Admin, most iAdministrator, etc.) remain legacy/beta until the above pass image QA.

---

## Success Metrics (End of Phase 4)

- 100% of operational surfaces demonstrate visible 4-sided backdrop framing in both light and dark modes per Top Picks / v2 mocks.
- ≥35% reduction in legacy UI surface area (measured by inventory script + git deletions).
- Zero active production use of deprecated card, badge, or tab families.
- All 16+ surfaces pass Visual Language Police + full accessibility evidence bundle.
- Signed 360° visual regression gallery against the approved mock corpus.

---

*This plan is a synthesis of the strongest ideas from all 16 independent subagent plans. It prioritizes enforcement and perceptual contract integrity over feature work.*

**Recommended First Action (Revised):** Execute **Phase 0** immediately. Do not begin Phase 1 code work until all Phase 0 exit gates pass. The single highest-leverage act in the next 2 weeks is forcing the CES decision and naming the Visual Language Police Chair with merge-veto authority.

---

## Revised Honest Total

**Original plan total:** ~22–29 weeks (aspirational).
**Revised total:** ~36–46 weeks (≈9–11 months) including Phase 0.

The revision reflects the actual state: 12–18% primitive adoption, 6 active dialects, 2,000+ raw-value instances, and an entire `iAdministrator/` subtree to retire. Aspirational timelines are the #1 cause of "checkbox complete, visually unchanged" outcomes — the failure mode this program already experienced.

## Uniform Phase Exit Gate Template (applies to every phase)

Every phase exit must produce:
1. **Image fidelity evidence** — side-by-side screenshots vs. the named Top Picks / v2 mock.
2. **Legacy delta** — measured reduction from the Phase 0 baseline, per legacy family.
3. **A11y report** — keyboard, SR, contrast, reduced-motion, glass-specific.
4. **Flag/rollback state** — every shipped surface behind a flag with a documented rollback.
5. **Visual Language Police sign-off** — named signatory and date.
6. **Exception Registry update** — every accepted violation logged with owner and re-justification date.