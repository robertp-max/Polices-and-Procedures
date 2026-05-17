# Dashboard Reconstruction Checklist

**Surface:** Command Center / Dashboard  
**Priority:** Highest (Primary narrative surface)  
**Spec References:** CANONICAL_UI_SYSTEM_SPEC.md Sections 4, 10, 11, 12, 18  
**Drift Items Addressed:** D01, D04, D12, D13, D21, D22

**Goal:** Deliver the first full reference implementation that proves the hardened system works end-to-end.

---

## Pre-Work (Must be complete before reconstruction starts)

- [ ] CES Policy Decision (D-001) recorded in Decision Log
- [ ] Onboarding/Journey Decision (D-002) recorded
- [ ] Top 10 Drift Register items have owners
- [x] `tokens.json` (v0.2.0-phase1 locked) contains typography scales, letterSpacing, shadow.elevation, overlay, dimension + color/spacing/glass/radius/motion (Phase 1 gaps closed)
- [ ] Legacy Deprecation Matrix approved for Dashboard scope

---

## Phase 1 Acceptance Criteria (Must all be Green)

### 1. Constrained Page View Contract + Responsive Matrix (Section 4 + 21)
- [ ] Desktop 4-sided inset preserved
- [ ] Mobile/Tablet behavior passes the Responsive Acceptance Matrix (`RESPONSIVE_ACCEPTANCE_MATRIX.md`)
- [ ] No horizontal scroll on mobile/tablet for core flows
- [ ] Visual comparison completed against approved reference captures + mobile baseline captures
- [ ] Desktop 4-sided inset uses `clamp(16px, 1.6vw, 28px)` on canonical shell frame
- [ ] Both single-card and multi-card compositions demonstrate visible backdrop framing
- [ ] Visual comparison completed against approved reference captures (attach exact file paths in PR; do not sign off with unresolved placeholder paths)
- [ ] Glassmorphism effect (blur, edge definition, depth) measurably improved vs current state

### 2. Primitive Adoption (Section 10)
- [ ] Dashboard uses only components from `ui/index.ts`
- [ ] No local `SCard`, `Card`, or custom surface components
- [ ] `GlassPanel` used for Layer 1, `SurfaceCard` used for Layer 2 elements
- [ ] All buttons use `ActionButton` or `UtilityButton`

### 3. Token Usage (Section 12)
- [ ] Zero raw hex colors (`#1F1C1B`, `#E5E4E3`, `#007970`, etc.)
- [ ] Zero arbitrary Tailwind values for spacing/typography on canonical elements
- [ ] All typography uses tokens from `TYPOGRAPHY_SCALE.md`
- [ ] First 150–200 raw values removed from Dashboard files

### 4. Accessibility (Section 18)
- [ ] All interactive elements meet 44px minimum on mobile
- [ ] Visible focus rings (teal/gold) on all focusable elements
- [ ] Logical tab order verified
- [ ] No color-alone meaning in KPI cards or status

### 5. Visual Regression & Proof
- [ ] Before/after screenshot set captured
- [ ] Playwright visual regression baseline created for new Dashboard
- [ ] Side-by-side comparison approved by Design

---

## Phase 2–3 Stretch Goals (Not required for Phase 1 exit but tracked)

- [ ] Full mobile-first responsive behavior matrix pass
- [ ] All related drift items (D01, D12, D13, D21, D22) marked "Closed" in Drift Register
- [ ] Dashboard used as template for Evidence Center reconstruction

---

**Owner:** [To Be Assigned at Kickoff]  
**Target Start:** After Phase 1 decisions recorded  
**Target Phase 1 Sign-off:** End of Phase 1

---

**This checklist is the template.** Every subsequent surface (Evidence, Audit, Calendar, CES Board, etc.) must have a similar checklist created before reconstruction work begins.