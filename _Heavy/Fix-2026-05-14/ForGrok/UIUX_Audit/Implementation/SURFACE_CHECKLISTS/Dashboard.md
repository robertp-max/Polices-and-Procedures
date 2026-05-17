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
- [x] Dashboard uses only components from `ui/index.ts` (ShellContentFrame, ActionButton, UtilityButton, CiStatusBadge, EmptyState wired in 2026-05-16)
- [x] No local `SCard`, `Card`, or custom surface components (legacy `ToolbarButton` removed; KPI shells use `ci-operational-card` utility)
- [x] `GlassPanel` used for Layer 1 (via `ShellContentFrame`), Layer 2 surfaces use `ci-operational-card` / `EmptyState` / `CiStatusBadge` primitives — full `SurfaceCard` wrap deferred to P3-DA-01
- [x] All buttons use `ActionButton` or `UtilityButton` (banner CTA, Action Board toolbar, empty-state action, KPI tiles use canonical button affordances)

### 3. Token Usage (Section 12)
- [x] Zero raw hex colors in `DashboardPage.tsx` (removed `#C74601`, `#FFC107`, `rgba(15,23,42,…)` literals from KpiCard + TaskCard 2026-05-16)
- [x] Zero arbitrary Tailwind values for typography on canonical elements (`text-[Npx]`, `tracking-[NNNem]` removed from KpiCard, TaskCard, BoardColumn, AgencyReadinessBanner, HeroStat, DashboardHero)
- [x] All typography uses `--ci-font-size-*` + `--ci-letter-spacing-*` tokens (23 Phase 3 tokens + 4 dimension tokens in `src/index.css` 2026-05-16)
- [x] All viewport guards converted to token-backed utilities (`min-w-[88vw|680px|220px|28px]` → `ci-min-w-board-scroll` / `ci-min-w-hero-stat-sm` / `ci-min-w-count-badge` 2026-05-16 Pass 2)

### 3a. Phase 3 Pass 2 — Inline-Style Elimination (2026-05-16)
- [x] All 28 inline `style={{ fontSize / letterSpacing / minHeight / minWidth / boxShadow }}` blocks in `DashboardPage.tsx` eliminated
- [x] All 10 `var(--ci-…, fallback)` fallback references removed (single source of truth in token layer)
- [x] New `@layer utilities` block in `src/index.css` ships 19 token-backed classes: `ci-text-{eyebrow,eyebrow-md,eyebrow-sm,eyebrow-strong,meta,body-xs,body-sm,card-title,stat,kpi,display-hero,display-section}`, `ci-min-h-{kpi,empty}`, `ci-min-w-{count-badge,hero-stat-sm,board-scroll}`, `ci-shadow-elev-{md,interactive}`
- [x] `aria-hidden="true"` added to all decorative lucide icons inside TaskCard
- [x] Phase 2 Appendix B "inline-style ESLint warnings" gap CLOSED on Dashboard surface
- [x] tsc + vite build + Playwright `phase2-shell-visual` (9/9) all green after refactor

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