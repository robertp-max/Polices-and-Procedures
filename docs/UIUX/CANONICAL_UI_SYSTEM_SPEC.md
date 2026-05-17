# Canonical UI System Spec — Phase 1 Lock

**Status:** Phase 1 Governing Document (Single Source of Truth)  
**Version:** 1.0  
**Date:** 2026-05-XX  
**Owner:** UI/UX Reconstruction Program

---

## Purpose

This document **locks** the canonical visual language, component philosophy, token system, layer model, and behavioral contracts for the Care Indeed Home Health platform.

It is the **only authoritative reference** for all Phase 2 (Shell + Command Center) and Phase 3 (Operational Surface) reconstruction work.

Everything in this spec supersedes previous wave-based styling, ad-hoc classes, and local interpretations.

---

## 1. Canonical Product Identity

| Decision | Value |
|----------|-------|
| **Canonical production brand** | Care Indeed |
| **Legacy CI-ION visual identity** | Deprecated for production-facing surfaces. Permitted only in explicitly grandfathered internal/demo surfaces until migrated. |
| **Primary operational stance** | Calm authority, task-first, compliance-defensible, mobile-first |
| **Glassmorphism philosophy** | Glass is a functional elevation system, not decoration. Its effectiveness depends on visible backdrop framing (see Section 4). |

---

## 2. Core UI Philosophy

- **System over styling** — No route-specific visual invention. All surfaces are built from canonical primitives + tokens.
- **Task-first hierarchy** — Primary action and compliance state must be legible in the first 500ms scan.
- **Consistency over novelty** — Shared primitives and exact tokenized values across Dashboard, Evidence, Audit, Calendar, My Tasks, Onboarding, etc.
- **Mobile-first behavior** — 44px+ touch targets, bottom-sheet-first for details on mobile, one-handed workflows.
- **Restraint in motion** — Only functional, purposeful transitions. No decorative animation systems.
- **Glassmorphism is intentional** — The visual language deliberately uses constrained framing to magnify depth, blur, and translucency.

---

## 3. Canonical Layer Model (Strict)

**Maximum 3 layers in normal operation.**

| Layer | Name                        | Purpose                                      | Visual Treatment                                      | When Allowed |
|-------|-----------------------------|----------------------------------------------|-------------------------------------------------------|--------------|
| **0** | Atmospheric Backdrop        | Deepest context (TravelightBG or light gutter) | Rich texture / gradient                               | Always present |
| **1** | Main Shell / Page Surface   | Primary working area                         | Primary glass panel (single or multi-card composition) | Default for all operational pages |
| **2** | Elevated Actionable Surface | Cards, dialogs, drawers, sheets, focused panels | Stronger definition + shadow + opacity                | Cards, modals, bottom sheets, detail panels |
| **3** | Exception Only              | Critical functional necessity only           | Maximum elevation                                     | Requires explicit justification in spec or PR |

**Hard Rules**
- Layer 3 is **never** used for decoration or default composition.
- No decorative nesting of glass inside glass inside glass.
- On desktop, Layer 1 **must never** be full-bleed (see Section 4).

This model is derived directly from the original audit artifacts (`GLASS_LAYERING_CHEAT_SHEET.md` and `LIGHT_MODE_ELEVATION_SYSTEM.md`).

---

## 4. Constrained Page View Contract (Non-Negotiable) — Glassmorphism Magnification Rule

**Rule:**  
No operational page view may ever render its primary content (whether a **single main glass card** or a **composition of multiple card glasses**) as full-bleed against the viewport or the shell’s inner boundary.

Every page view **MUST** preserve a consistent, visible border/margin on **all four sides** between the outermost glass content and the containing frame.

### Why This Rule Exists (Design Intent)

This is not decorative padding. It is a **core mechanism to magnify the glassmorphism effect**.

When the glass composition is inset from the edges:

- The Layer 0 backdrop remains visible as a continuous frame around the entire glass surface(s).
- True translucency and backdrop blur become perceptible (glass is seen *against* something).
- Luminous edge highlights, inner glows, and depth shadows read correctly.
- Layer separation between backdrop → Layer 1 glass → Layer 2 cards becomes visually clear.
- The surface reads as a premium “floating” panel rather than a full-bleed slab.

**Full-bleed glass kills the intended effect.** Blur becomes invisible at the edges, borders lose contrast, and the expensive glass language collapses.

This rule applies equally to:
- Single-card page layouts (e.g. many detail views)
- Multi-card compositions (e.g. Dashboard KPI + boards + action panels)

### Implementation Requirements

- The outer `CommandCenterLayout` shell already provides the canonical desktop inset:
  ```css
  top/right/bottom/left: clamp(16px, 1.6vw, 28px)
  ```
  (with `rounded-3xl` on desktop, full-bleed only on mobile).
- All page-level root containers inside the shell **must compose within this frame** and preserve the breathing room on all four sides.
- Multi-card layouts must maintain outer margin around the *entire group* so the collection still reads as one elevated Layer 1 surface against the backdrop.
- Mobile must follow the same principle inside the device bezel / safe area (content never kisses the edges without the intended internal margin shown in the reference mocks).

### Reference Mocks (Visual Contract)

The canonical visual signature is defined by:
- `Top Picks/11_OnboardingActivation_Desktop_v2.jpg`
- `Top Picks/12_EvidenceCapture_Desktop_v2.jpg`
- Mobile counterparts in the same folder

### Exceptions

Only explicit full-canvas utility modes (dedicated print-preview, large signature canvas, full-screen media viewers) may break the 4-sided rule. These must be:
- Documented per route
- Visually treated as a different mode (not presented as normal operational glass)

**Violation of this contract is a Phase 3 sign-off blocker.**

---

## 5. Shell Architecture Contract

`CommandCenterLayout` is the single canonical shell root.

**Required zones (must exist on all operational routes):**
1. Identity + theme toggle zone
2. Primary navigation zone
3. Context / sub-navigation zone
4. Global command / action zone
5. Primary content surface zone (subject to Section 4 constraints)
6. Mobile bottom tab/command zone (5-slot maximum)

**Rules:**
- Zone rhythm and spacing must be consistent across Dashboard, Evidence Center, Audit Mode, Calendar, My Tasks, etc.
- Shell may never be redefined or forked per page.
- Responsive behavior is governed by the Responsive Behavior Matrix (see design-references).

---

## 6. Typography Contract (Locked)

**Canonical font families:**
- Headings & titles: **Montserrat**
- Body, UI, labels: **Inter** (preferred) or system UI sans-serif
- Monospace / technical: **JetBrains Mono**

**Canonical type scale:** See `design-references/TYPOGRAPHY_SCALE.md` (now frozen as canonical reference).

**Rules:**
- Only use tokens from the official scale (`text-title`, `text-body`, `text-label`, etc.).
- No ad-hoc `text-[17px]`, `text-xl`, or per-route font-size ladders.
- Letter-spacing, line-height, and weight are part of the token — never overridden locally.

---

## 7. Spacing + Density Contract

Spacing uses a single tokenized scale (4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 px base with responsive multipliers).

**Density profiles (per surface type):**
- Command / dashboard surfaces — comfortable
- List / table / board surfaces — compact
- Detail / form surfaces — balanced with generous tap targets
- Mobile surfaces — 44px+ minimum hit areas

No “ci-premium-*”, “ci-executive-*”, or wave-based utility classes may be used to tune density by feel.

---

## 8. Color + Mode + Glass Contract

**Brand decision:** Single canonical brand = Care Indeed. CI-ION maroon glass aesthetic is the dark mode expression of the same brand.

**Mode model (locked):**
- **Light mode** = Care Indeed paper aesthetic (solid surfaces + subtle shadows + hairlines). No heavy blur.
- **Dark mode** = CI-ION glass aesthetic (translucent maroon glass + strong backdrop blur + luminous edges).

The two orthogonal toggles currently in code (`theme` + `ciMode`) must be collapsed into a single canonical mode system during Phase 1.

**Glass tokens** must live in a governed token pipeline (see Section 12).

Semantic status colors (success/warning/error/info) are system-governed and must not be locally redefined.

WCAG 2.2 AA minimum contrast is non-negotiable on all text and interactive elements.

See `design-references/COLOR_TOKENS.md` and `LIGHT_MODE_ELEVATION_SYSTEM.md`.

---

## 9. Interaction + Motion Contract

- All interactive states are tokenized: `default | hover | focus | active | disabled | loading | error`
- Motion is governed by `design-references/MOTION_TOKEN_IMPLEMENTATION.md`
- Reduced-motion preference is respected globally.
- Hover-only affordances must never gate critical task completion.

---

## 10. Canonical Primitives & Component Ownership

**Primitive layer location:** `src/policy/components/ui/`

**Rules:**
- All new or reconstructed surfaces **must** use primitives from this layer.
- Local one-off components inside page folders are forbidden on target surfaces unless explicitly approved as a new primitive.
- `GlassPanel`, `SurfaceCard`, `ActionButton`, `SectionHeader`, `EmptyState`, `LoadingState`, etc. are the starting canonical set.
- A full Primitive Catalog with allowed props and usage rules will be produced as part of Phase 1 completion.

---

## 11. Canonical Surface Acceptance Criteria (Phase 3 Gate)

Every reconstructed operational surface must pass **all** of the following before Phase 3 sign-off:

1. Built primarily from canonical primitives (Section 10)
2. Passes **Constrained Page View Contract** (Section 4) — verified with screenshots against Top Picks mocks
3. Uses only governed tokens (no raw hex, px, or ad-hoc classes)
4. Passes responsive behavior matrix at desktop / laptop / tablet / mobile
5. Passes WCAG 2.2 AA accessibility audit
6. Passes visual regression baseline (Playwright)
7. No route-specific shell or layer hacks

---

## 12. Token Pipeline & Enforcement (Phase 1 Deliverable)

**Required outputs by end of Phase 1:**
- `tokens.json` (source of truth) + generated CSS custom properties + TypeScript types
- Strict separation: **primitive tokens** → **semantic tokens** → **component tokens**
- Lint rule: no raw color/spacing/typography values on any file under `src/policy/` (except legacy grandfathered surfaces)
- PR template checklist item: “Conforms to CANONICAL_UI_SYSTEM_SPEC.md”
- Design QA checklist tied to the sections above

Until the token pipeline is live, all new code must consume the existing `--ci-*` variables as an interim step, with a clear migration path documented.

---

## 13. Governance & Change Control

Any change to this spec (including the Constrained Page View Contract) requires:

1. Written design-system review
2. Engineering impact assessment
3. Visual regression + accessibility risk note
4. Explicit approval (recorded in this file or linked PR)

No route-level overrides, wave-specific class layers, or “temporary” full-bleed exceptions are permitted without updating this spec first.

---

## 14. Phase 1 Exit Criteria (Measurable)

Before any Phase 2 shell work or Phase 3 surface reconstruction may begin, the following must be true:

- [ ] Zero unresolved ambiguity on brand, mode, and layer policy
- [ ] Print & Legal Evidence Fidelity Contract (Section 15) approved with at least one reference renderer (eCign packet) demonstrated
- [ ] CES Parallel System Policy (Section 16) decided and documented (consolidation path or governed exception)
- [ ] Onboarding & Journey Fragmentation Resolution (Section 17) has a clear migration or exception decision
- [ ] Top 20 drift items from the May 2026 audit have owners and target phases recorded in `DRIFT_REGISTER.md`

---

## 15. Print & Legal Evidence Fidelity Contract (Critical — Compliance Platform)

Print and PDF outputs are **legal and regulatory artifacts**, not secondary outputs. They must be visually consistent, legally defensible, and clearly branded as single-brand Care Indeed.

**Mandatory Rules (directly from original audit):**
- Single source of truth renderer for all signed packets: `buildPrintablePacketHtml` in `FormSigningWorkspace.tsx`
- Every printed compliance document **must** include the `.ci-brand-header` and `.ecign-footer` on every page
- Brand header content (logo + "Care Indeed Home Health Care, Inc." + "Enterprise Forms Library · Signed Document Package" + form title + subtle teal bottom border)
- Color rules on print: near-white background, Navy primary text, Muted secondary, Teal accent
- Footer must show: Small logo, Certificate/Document ID (monospace), Signer name, Signed timestamp
- No visual drift allowed between on-screen and printed versions of the same document
- GVGB, FormPrintView, eCign packets, and appendix prints must converge on the same header/footer treatment

**Phase 1 Deliverable:** One reference implementation (eCign signed packet) passing the above rules + visual regression baseline against the Print Consistency Guidelines.

**Violation Impact:** Any surface that generates compliance artifacts (signed forms, audit exports, survey packets) cannot pass Phase 3 sign-off without demonstrating print fidelity.

---

## 16. CES Parallel System Policy (High-Risk Fragmentation)

The original audit documented a **full parallel design system** in CES (`ces/theme.ts`, `CesCard`, navy `#1F4A8A`/orange palette, independent primitives) that diverges from the canonical CI-ION / Care Indeed system.

**Policy Decision Required in Phase 1:**

One of the following must be chosen and recorded:

**Option A — Full Consolidation (Preferred for long-term coherence)**
- CES will migrate to the canonical token set + `ui/*` primitives over 2–3 releases.
- Temporary CES-specific semantic tokens allowed only under a governed "CES" namespace in `tokens.json`.
- Target: Complete migration by end of Phase 3.

**Option B — Governed Permanent Exception (Riskier)**
- CES is granted a permanent, documented exception.
- Must still use the Constrained Page View Contract (Section 4).
- Must adopt a minimal subset of canonical primitives (GlassPanel, SurfaceCard, ActionButton, EmptyState, LoadingState).
- All CES-specific colors must be registered as semantic tokens with clear justification.
- No new CES-only component families allowed without explicit approval.

**Current State:** No decision recorded. This is a Phase 1 blocker.

---

## 17. Onboarding & Journey Fragmentation Resolution

The original audit identified **two incompatible worlds**:
- Journey V1 + StagingM01: Cinematic dark glass, theatrical 5-slot absolute carousel, high visual polish.
- Onboarding V2: Light professional audit-grade activation engine, mobile-first, compliance-focused.

**Required Decision (Phase 1):**
- Declare the long-term canonical Onboarding experience (V2 is the stronger compliance surface).
- Define a clear migration or deprecation path for Journey V1 cinematic elements.
- Ensure Onboarding V2 fully adopts the Constrained Page View Contract and canonical primitives.
- Mobile pattern library from `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md` becomes the reference for all future onboarding surfaces.

No new cinematic Journey-style patterns may be introduced until this decision is locked.

---

## 18. Accessibility & Interaction Hardening (WCAG 2.2 AA)

All canonical primitives and reconstructed surfaces must pass the original `ACCESSIBILITY_COMPONENT_CHECKLIST.md` in addition to WCAG 2.2 AA.

Key non-negotiables pulled from the audit:
- 44×44 px minimum touch targets on mobile (enforced in primitives)
- Visible teal/gold focus ring on keyboard focus
- No color-alone meaning
- Logical tab order and no keyboard traps (especially in dynamic forms, signing, evidence hierarchy, CES boards)
- Proper ARIA roles on complex components (tabs, drawers, carousels, multi-signer flows)

Phase 1 must produce a gap list of current high-risk surfaces (FormViewer, CES Board, Evidence hierarchy, Journey carousel) with owners.

---

## 19. Drift Register & Living Anti-Drift Process

A living `DRIFT_REGISTER.md` (in this directory) must be created in Phase 1 and maintained.

It will track every known deviation identified in the May 2026 audit (`UIUX_DRIFT_AND_REDUNDANCY_REPORT.md`, `UIUX_DESIGN_SYSTEM_AUDIT.md`, `UIUX_SURFACE_INVENTORY.md`, etc.) with:
- Drift item
- Original source file
- Current owner
- Target phase for closure
- Status

No Phase 2 or 3 work may proceed on a surface until its related drift items are either closed or explicitly accepted in the register with a recorded exception.

---

## 20. Final Hardened Phase 1 Exit Criteria (Consolidated)

In addition to the items in Section 14, the following must be achieved before Phase 1 is considered complete:

- [ ] Sections 15–19 of this spec are approved
- [ ] `DRIFT_REGISTER.md` exists with at least the top 25 drift items from the original audit, each with owner + target phase
- [ ] At least one surface (Dashboard recommended) fully demonstrates the Constrained Page View Contract + canonical primitives + token usage
- [ ] Print fidelity reference implementation passes visual + content regression
- [ ] CES and Onboarding/Journey policy decisions are recorded with migration paths
- [ ] Accessibility gap list for high-risk surfaces is created and owners assigned
- [ ] 16-point alignment review has been updated with closure status showing average score ≥ 9.0 across all 16 perspectives

Only after these hardened criteria are met may the program advance.
- [ ] `CANONICAL_UI_SYSTEM_SPEC.md` v1.0 approved and frozen
- [ ] Token pipeline (`tokens.json` → CSS/TS) active and documented
- [ ] Primitive map published (`ui/*` ownership + usage rules)
- [ ] Constrained Page View Contract (Section 4) demonstrated in a reference implementation (CommandCenterLayout + at least one page)
- [ ] Lint + PR + design QA enforcement gates live
- [ ] All target surfaces have a reconstruction checklist derived from this spec

---

## References & Source Material

The following documents from the May 2026 UIUX_Audit were the primary sources used to produce this locked spec:

- `design-references/GLASS_LAYERING_CHEAT_SHEET.md`
- `design-references/LIGHT_MODE_ELEVATION_SYSTEM.md`
- `design-references/TYPOGRAPHY_SCALE.md`
- `design-references/COLOR_TOKENS.md`
- `design-references/MOTION_TOKEN_IMPLEMENTATION.md`
- `design-references/RESPONSIVE_BEHAVIOR_MATRIX.md`
- `design-references/DESIGN_SYSTEM_GOVERNANCE.md`
- `design-references/DESIGN_TOKEN_EXPORT_GUIDE.md`
- Top Picks mockup set (especially desktop views)

These live in `docs/UIUX/design-references/` and are the frozen reference set.

---

**This document is the law for the reconstruction program.**

All future implementation, review, and governance decisions must trace back to a specific section here.