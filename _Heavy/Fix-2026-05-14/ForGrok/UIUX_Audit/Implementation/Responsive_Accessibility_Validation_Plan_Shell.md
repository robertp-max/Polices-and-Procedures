# Responsive & Accessibility Validation Plan — Phase 2 Shell

**Phase 2 — Core Shell and Command Center Rebuild**  
**Version:** 1.0  
**Date:** 2026-05-17  
**Traceability:** `RESPONSIVE_ACCEPTANCE_MATRIX.md` + `CANONICAL_UI_SYSTEM_SPEC.md` (Sections 4, 18, 21) + `Shell_Architecture_Reconstruction_Plan.md`

---

## 1. Purpose

Define the exact validation steps required to prove that the rebuilt shell satisfies responsive behavior and accessibility requirements **before** any Phase 3 surface work begins.

This plan applies **only to the shell** (`ShellFrame`, `ShellTopbar`, `ShellNavRail`, `ShellContentFrame`, `ShellMobileDrawer`).

---

## 2. Responsive Validation Matrix (Shell Only)

### Breakpoint Test Matrix

| Breakpoint | Width Range   | Required Shell Behavior                                                                 | Test Method                  | Pass Criteria |
|------------|---------------|------------------------------------------------------------------------------------------|------------------------------|---------------|
| **Mobile** | 0 – 767px     | Single-column nav in bottom sheet, 44px+ targets, no horizontal scroll, topbar collapses actions | Manual + Playwright          | No horizontal scroll. All interactive elements ≥44px. Navigation opens via bottom sheet. |
| **Tablet** | 768 – 1023px  | Max 2-column feel, drawer or rail allowed, touch-optimized nav                           | Manual + Playwright          | Touch targets ≥44px. Rail or drawer does not cause overflow. |
| **Laptop** | 1024 – 1439px | 4-sided inset visible, rail present but can be compact, multi-card compositions allowed inside frame | Visual regression + manual   | Clear 4-sided breathing room. Backdrop visible around glass edges. |
| **Desktop**| 1440px+       | Full constrained frame (clamp 16–28px), rail fully expanded, optimal glassmorphism       | Visual regression vs Top Picks mocks | Matches approved reference captures. Backdrop framing maximized. |

### Core Responsive Rules Enforcement

1. **4-Sided Breathing Room** (≥1024px)
   - `ShellContentFrame` must apply `--ci-glass-layer1-inset-desktop` on all four sides.
   - No page content may push glass edges to the shell boundary.
   - Verified by screenshot comparison against approved reference captures.

2. **No Horizontal Scroll**
   - At all breakpoints, the shell + primary content must never generate horizontal scroll on core routes.
   - Test with real content (not empty states).

3. **Touch Targets**
   - Every interactive element in `ShellTopbar` and `ShellNavRail` must be ≥44×44px below 1024px.
   - Verified via automated axe or manual measurement.

4. **Progressive Collapse**
   - Navigation must transform from rail (≥1024px) → bottom sheet / drawer (<1024px) without layout shift bugs.

---

## 3. Accessibility Validation Plan (Shell)

### 3.1 Automated Checks (Must Pass)

- **axe-core** (via Playwright or Vitest) on `ShellFrame` at all breakpoints.
- **Lighthouse** Accessibility score ≥ 95 on shell routes (desktop + mobile).
- Focus management:
  - Tab order must be logical through topbar → nav rail → content.
  - Focus must be trapped correctly inside `ShellMobileDrawer`.

### 3.2 Manual Accessibility Audit Checklist (Shell)

| Category                  | Requirement                                                                 | Test Steps | Pass / Fail |
|---------------------------|-----------------------------------------------------------------------------|------------|-------------|
| **Landmarks**             | `ShellFrame` provides `main` landmark. `ShellNavRail` uses `nav`. Topbar uses `banner` or `complementary`. | Inspect with screen reader or axe | |
| **Keyboard Navigation**   | All nav items, topbar actions, and drawer trigger reachable via Tab / Shift+Tab. Enter/Space activates. | Full keyboard walkthrough | |
| **Focus Visible**         | Focus ring uses `--ci-color-accent-teal` or `--ci-color-accent-orange` with sufficient contrast. | Tab through entire shell | |
| **ARIA**                  | `ShellNavRail` has `aria-label="Primary navigation"`. Active nav item has `aria-current="page"`. | Code review + screen reader | |
| **Reduced Motion**        | When `prefers-reduced-motion: reduce`, all non-essential transitions in `ShellFrame`, `ShellTopbar`, and `ShellNavRail` are disabled. | Toggle reduced motion in OS + test | |
| **Color Contrast**        | All text in topbar and nav meets WCAG AA (4.5:1 normal, 3:1 large). | axe + manual contrast checker | |
| **Screen Reader**         | Navigation groups announced clearly. State changes (active route, drawer open/close) announced via `AriaLiveRegion`. | VoiceOver / NVDA test | |
| **Mobile**                | Bottom sheet navigation is fully operable with screen reader and gestures. | iOS/Android real device test | |

### 3.3 Specific Shell Accessibility Requirements

- `ShellNavRail` must support arrow-key navigation between items (roving tabindex or similar).
- Opening/closing `ShellMobileDrawer` must move focus appropriately and return focus on close.
- Global search trigger in topbar must be keyboard reachable and labeled.

---

## 4. Visual Regression Requirements (Shell)

All validation must produce **before/after** evidence:

- Desktop (1440px+)
- Laptop (1200px)
- Tablet (900px)
- Mobile (375px)

**Reference Set Required:**
- Approved captures from `mocks/Top-Picks/` (especially desktop and mobile shell states)
- Current production shell screenshots (baseline before Phase 2 changes)

**Tools:**
- Playwright visual regression tests scoped to shell routes only
- Manual side-by-side comparison against Top Picks mocks for glassmorphism quality

---

## 5. Test Routes for Shell Validation

The following routes must be used to validate the shell (content can be minimal):

- `/dashboard` (Command Center)
- `/ces/dashboard`
- `/evidence`
- `/audit`
- `/journey`
- `/framework`

These routes exercise different command groups and content densities.

---

## 6. Sign-off Requirements

Shell reconstruction is **not complete** until:

- [ ] Responsive matrix passes at all four breakpoints with evidence
- [ ] Accessibility audit (automated + manual) passes with no high-severity issues
- [ ] Visual regression approved by Design Lead against Top Picks reference captures
- [ ] 4-sided constrained framing demonstrably improves glassmorphism (qualitative review)
- [ ] Reduced motion behavior verified

---

**End of Responsive & Accessibility Validation Plan (Shell)**

Next artifact will be produced immediately.