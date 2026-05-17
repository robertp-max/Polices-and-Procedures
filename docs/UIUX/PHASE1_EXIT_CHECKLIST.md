# Phase 1 Exit Checklist — Canonical UI System Lock (Hardened v2)

**Purpose:**  
This is the **formal, non-negotiable gate** before any Phase 2 or Phase 3 work. It has been hardened to target ≥9/10 alignment with the original May 2026 UIUX_Audit findings.

**Owner:** UI/UX Reconstruction Program  
**Location:** `docs/UIUX/PHASE1_EXIT_CHECKLIST.md`

**Rule:** No item may be checked until evidence (document, screenshot, PR link, or recorded decision) is attached or linked.

---

## 1. Canonical Specification (Hardened)

- [ ] `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md` v1.0+ is complete and includes Sections 15–19 (Print, CES Policy, Onboarding/Journey, Accessibility, Drift Register)
- [ ] All 20 sections have been explicitly reviewed and approved by Design + Engineering leads
- [ ] Section 4 (Constrained Page View + Glassmorphism Magnification) has been stress-tested against the original Top Picks mocks and `GLASS_LAYERING_CHEAT_SHEET.md`
- [ ] Section 15 (Print & Legal Evidence) has been reviewed against `PRINT_PDF_CONSISTENCY_GUIDELINES.md`
- [ ] Sections 16 & 17 (CES + Onboarding/Journey) have recorded decisions with migration paths
- [ ] The hardened spec + this checklist have been linked in the root README and all active project tracking

---

## 2. Token Foundation (Hardened)

- [ ] `docs/UIUX/tokens/tokens.json` contains at minimum the categories from the original `DESIGN_TOKEN_EXPORT_GUIDE.md` (color primitive/semantic/glass, spacing, typography, radius, shadow, motion, glass effects)
- [ ] First full audit of raw values completed (target: document all 2313+ inline styles + hardcoded hex from the original audit)
- [ ] Generation scripts (`generate-tokens-css` + `generate-tokens-ts`) exist, run cleanly, and output is committed
- [ ] Tokens are wired into `index.css`, Tailwind, and at least one primitive (`GlassPanel` or `SurfaceCard`)
- [ ] PR template contains "Uses only governed tokens (no raw values)" checkbox
- [ ] Manual "no raw values" rule is actively enforced on all new code until lint rule is live

---

## 3. Primitive System (Hardened)

- [ ] `docs/UIUX/primitives/CATALOG.md` has been expanded to include a "Legacy / To Be Deprecated" section that maps the 8+ card families, 6+ tabs families, and other redundancies identified in `UIUX_DRIFT_AND_REDUNDANCY_REPORT.md`
- [ ] All core primitives (`GlassPanel`, `SurfaceCard`, `ActionButton`, `EmptyState`, `LoadingState`, `CiStatusBadge`, `Tabs`) have been audited for compliance with the Constrained Page View Contract (Section 4)
- [ ] At least 3 high-traffic surfaces now import exclusively from `ui/index.ts` (no local copies)
- [ ] Decision recorded: which existing components will be promoted vs deprecated

---

## 4. Glassmorphism & Constrained Page View (Critical Gate — Hardened)

- [ ] `CommandCenterLayout` desktop 4-sided inset (`clamp(16px, 1.6vw, 28px)`) is stable and documented
- [ ] At least one operational page (Dashboard or Evidence Center) has been updated to fully demonstrate the 4-sided breathing room in **both** single-card and multi-card compositions
- [ ] Before/after screenshots captured and compared side-by-side against `Top Picks/11_OnboardingActivation_Desktop_v2.jpg` and `12_EvidenceCapture_Desktop_v2.jpg`
- [ ] Visual QA sign-off obtained that the glassmorphism effect (backdrop framing, blur, edge definition) is measurably improved
- [ ] PR template now contains explicit language: "All new surfaces must preserve 4-sided inset per CANONICAL_UI_SYSTEM_SPEC.md §4 — violation blocks Phase 3 sign-off"

---

## 5. Print & Legal Evidence Fidelity (New Hardened Section)

- [ ] Section 15 of the Canonical Spec approved
- [ ] `buildPrintablePacketHtml` (or designated single source renderer) demonstrated on at least one eCign signed packet
- [ ] Header + footer rules from `PRINT_PDF_CONSISTENCY_GUIDELINES.md` implemented and visually regressed
- [ ] No drift between on-screen and printed version confirmed via side-by-side comparison
- [ ] Decision: GVGB, FormPrintView, and eCign packet renderers will converge on the same header/footer treatment (owner + timeline recorded in Drift Register)

---

## 6. CES Parallel System Decision (New Hardened Section)

- [ ] Section 16 of the Canonical Spec has a recorded decision (Option A full consolidation or Option B governed exception)
- [ ] If Option B chosen: minimal canonical primitive adoption plan + CES token namespace defined in `tokens.json`
- [ ] Decision + rationale reviewed and signed off by Design + Engineering
- [ ] Entry added to `DRIFT_REGISTER.md` (D03) with clear target phase

---

## 7. Onboarding & Journey Fragmentation Resolution (New Hardened Section)

- [ ] Section 17 of the Canonical Spec has a recorded decision on canonical Onboarding experience
- [ ] Migration or deprecation path for Journey V1 cinematic patterns (absolute carousel, dark glass) is documented
- [ ] Onboarding V2 has adopted (or has plan to adopt) the Constrained Page View Contract and canonical primitives
- [ ] Mobile patterns from `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md` are referenced as the standard for future work
- [ ] Decision recorded in Drift Register (D07, D20)

---

## 8. Drift Register & Anti-Drift Process (New Hardened Section)

- [ ] `docs/UIUX/DRIFT_REGISTER.md` exists and contains at minimum the Top 25 items from the May 2026 audit
- [ ] Every item has an owner and target phase
- [ ] Top 10 critical items (D01–D10) have detailed closure plans or accepted exceptions with time boxes
- [ ] Process for adding new drift during reconstruction is documented and socialized
- [ ] 16-point alignment review has been re-run and average score across all 16 perspectives is ≥ 9.0

---

## 9. Accessibility Hardening (Hardened)

- [ ] All canonical primitives pass the original `ACCESSIBILITY_COMPONENT_CHECKLIST.md` (44px targets, focus rings, contrast, ARIA, reduced motion)
- [ ] High-risk surfaces identified in the original `UIUX_ACCESSIBILITY_AUDIT.md` and executive summary have been listed with owners (FormViewer, CES Board, Evidence hierarchy, Journey carousel, multi-signer flows)
- [ ] Keyboard navigation and contrast issues in dynamic forms and dense boards have documented remediation plans
- [ ] "No color alone" and focus management rules have been added to the design QA checklist

---

## 10. Surface Demonstration & Proof (Hardened)

- [ ] At least one full surface (Dashboard recommended as the primary narrative surface) has been reconstructed as a **reference implementation** demonstrating:
  - Constrained Page View (4-sided)
  - Only canonical primitives
  - Only governed tokens (or clear migration path)
  - Passes responsive matrix on desktop + mobile
  - Clean visual regression baseline
- [ ] Before/after comparison package created and stored in `docs/UIUX/`

---

## 11. Governance & Process Hardening

- [ ] PR template contains all required checkboxes from the hardened spec (tokens, 4-sided rule, primitives, drift register check)
- [ ] Design QA checklist has been expanded with items from Print, CES, Accessibility, and Glassmorphism sections
- [ ] Any change to Sections 4, 15, 16, or 17 of the Canonical Spec requires recorded Design + Engineering approval
- [ ] This checklist itself has been reviewed against the original `MASTER_IMPLEMENTATION_READINESS_CHECKLIST.md` and `DESIGN_SYSTEM_GOVERNANCE.md`

---

## 12. Final Sign-off (Hardened)

| Role                    | Name | Date | Evidence Link / Comment | Signature |
|-------------------------|------|------|-------------------------|---------|
| Design Lead             |      |      |                         |         |
| Engineering Lead        |      |      |                         |         |
| Product / Compliance    |      |      |                         |         |
| Program Owner           |      |      |                         |         |

**Only after every item above has evidence attached and all four sign-offs are obtained may the program advance to Phase 2.**

---

**This hardened checklist directly addresses the gaps identified in the 16-point alignment review and the original May 2026 UIUX_Audit.** Its goal is to move the overall alignment score from ~6.5/10 to ≥ 9/10 before any major implementation begins.

- [ ] `docs/UIUX/primitives/CATALOG.md` accurately reflects every component currently exported from `src/policy/components/ui/`
- [ ] All core primitives (`GlassPanel`, `SurfaceCard`, `ActionButton`, `EmptyState`, `LoadingState`, etc.) have been audited against the Constrained Page View Contract (Section 4 of the Spec)
- [ ] `ui/index.ts` is the single import barrel for all canonical primitives
- [ ] Decision recorded: which existing components will be promoted to primitives vs. which will be deprecated

---

## 4. Glassmorphism & Constrained Page View Contract (Critical Gate)

- [ ] `CommandCenterLayout` desktop inset (`clamp(16px, 1.6vw, 28px)` on all four sides) is documented and stable
- [ ] At least one operational page (Dashboard recommended) has been updated to demonstrate the 4-sided breathing room in both single-card and multi-card compositions
- [ ] Before/after screenshots captured and stored in `docs/UIUX/mocks/` or `tmp-ui-verify-screenshots/`
- [ ] Visual comparison against the reference Top Picks mocks (`11_OnboardingActivation_Desktop_v2.jpg` and `12_EvidenceCapture_Desktop_v2.jpg`) has been performed and approved
- [ ] Rule is written into the PR template: “All new surfaces must preserve 4-sided inset per CANONICAL_UI_SYSTEM_SPEC.md §4”

---

## 5. Mode & Brand Policy

- [ ] Single canonical mode model is defined (Light = Care Indeed paper, Dark = CI-ION glass)
- [ ] The two current orthogonal stores (`useShellStore.theme` + `useCiModeStore`) have a documented consolidation plan
- [ ] All production surfaces use the canonical mode path (no more dual-brand drift allowed)

---

## 6. Governance & Process

- [ ] PR template contains a “Conforms to CANONICAL_UI_SYSTEM_SPEC.md” checkbox
- [ ] Design QA checklist derived from the spec exists and is used in reviews
- [ ] Any change to the Canonical Spec requires recorded approval (link to decision record or PR)
- [ ] `docs/UIUX/` is declared the single source of truth in team onboarding / README

---

## 7. Documentation & References

- [ ] All high-signal source documents from the May 2026 audit are copied into `docs/UIUX/design-references/`
- [ ] Key mockups are available in `docs/UIUX/mocks/Top-Picks/`
- [ ] This checklist is linked from both `CANONICAL_UI_SYSTEM_SPEC.md` and the Master Plan

---

## 8. Sign-off

| Role              | Name          | Date       | Signature / Link |
|-------------------|---------------|------------|------------------|
| Design Lead       |               |            |                  |
| Engineering Lead  |               |            |                  |
| Product Owner     |               |            |                  |

**Only after all items above are checked and signed off may the team proceed to Phase 2.**

---

**Reference:**  
- `CANONICAL_UI_SYSTEM_SPEC.md` → Section 14 “Phase 1 Exit Criteria”  
- `UIUX_RECONSTRUCTION_MASTER_PLAN.md` → Sequencing Rules
