# Reduced Motion & Accessibility Constraints on Glass

**Phase 1 deliverable — constraint only.**
**Derived from:** Canonical UI System Spec §9 (Interaction & Motion), §8 (Color/Mode/Glass) WCAG clause.
**Visual source of truth:** dark-mode mocks (full TravelightBG) and light-mode mocks (paper) in `mockup/Top Picks/` and `mockup/Desktop/v2/`.

> Glass amplifies a11y risks: blur softens text, animated streaks create time-varying contrast, focus rings smear over translucent edges, and `prefers-reduced-motion` is frequently ignored. These constraints exist to make the glass language safe to use.

---

## 1. Reduced-Motion Contract (Global)

> **Rule MA-1.** `prefers-reduced-motion: reduce` **MUST** be respected globally. There is no per-surface opt-out.

> **Rule MA-2.** The reduced-motion mode is selected by a single source of truth: the CSS variable `--motion-mode` resolved at the shell root from the OS media query plus an explicit user override (where present). All motion-bearing primitives **MUST** read from this variable. Direct `@media (prefers-reduced-motion)` queries inside individual primitives are prohibited — there must be one resolver.

### `TravelightBG` and animated backgrounds

> **Rule MA-3.** `TravelightBG` (and any animated decorative canvas/SVG) **MUST** provide a static fallback rendered when `--motion-mode = reduce`. The static fallback **MUST**:
> - Render the same color field as the animated version (so depth perception is preserved).
> - Drop all moving light streaks, particles, and gradient sweeps.
> - Preserve a sufficient luminance gradient to maintain visible Layer 0 framing for the glass.

> **Rule MA-4.** Animated backgrounds **MUST** also expose a blur-opt-out: when `--motion-mode = reduce`, backdrop blur on Layer 1 surfaces drops by one step (e.g., `blur.glass-1 → blur.glass-1-static`) to reduce GPU cost and visual instability for motion-sensitive users.

> **Rule MA-5.** Decorative motion that does not serve a functional purpose is prohibited under any mode. Permitted motion is limited to: state transitions (hover/focus/active), entrance/exit of dialogs/sheets/toasts, and skeleton shimmer at the canonical `motion.skeleton` duration.

> **Rule MA-6.** Parallax, scroll-jacking, hero-cinematic carousels, and theatrical absolute-positioned reveals are **prohibited** on operational surfaces.

### Motion duration and easing

> **Rule MA-7.** All animated transitions **MUST** use `motion.default.{duration,easing}` tokens in motion-on mode and `motion.reduced.{duration,easing}` in motion-off mode. Token `motion.reduced.duration` ≤ `120 ms`; `motion.reduced.easing` = `linear`.

---

## 2. Focus Treatment Over Glass

> **Rule MA-8.** Every interactive element **MUST** display a visible `focus-visible` indicator that meets WCAG 2.2 §2.4.11 (Focus Not Obscured) and §2.4.13 (Focus Appearance). The canonical ring is `2px solid var(--color-focus)` with `2px` offset, drawn **outside** the blur stack so it remains crisp.

> **Rule MA-9.** Focus rings **MUST NOT** rely on color alone. The ring is a solid stroke (not a glow or shadow) so it is detectable in high-contrast mode and over animated backdrops.

> **Rule MA-10.** Focus rings **MUST** clear ≥ 3:1 contrast against both:
> - The Layer 0 backdrop in its brightest animated state (worst case of `TravelightBG`).
> - The Layer 1 glass surface they appear over.
> The shared `--color-focus` token is calibrated for both; do not substitute per-surface focus colors.

> **Rule MA-11.** Focus order **MUST** follow the visual reading order. Dialogs, drawers, and bottom sheets **MUST** trap focus while open and restore focus to the invoking element on close. Missing focus trap is a Phase 1 reject.

> **Rule MA-12.** Skip-links and shell-level landmarks are required on every route: `<a href="#main">Skip to main content</a>` is mounted in `ShellFrame`; `<main id="main">` is rendered by `ConstrainedPageContent`.

---

## 3. Contrast and Readability Over Glass

> **Rule MA-13.** Body text on Layer 1 **MUST** clear **4.5:1** against the *effective* surface color (i.e., the surface tint *as composited over the brightest state of the backdrop*). The tokens pipeline emits the composited pair; consumers use the result.

> **Rule MA-14.** Large text (≥ 18.66 px / 14 pt bold) on Layer 1 **MUST** clear **3:1** by the same composited-pair rule.

> **Rule MA-15.** Non-text UI (icons, control borders, focus rings, charts strokes) **MUST** clear **3:1** against both the surface they sit on and the Layer 0 backdrop they can be seen against.

> **Rule MA-16.** Text **MUST NOT** be placed directly on Layer 0 (no text floats over `TravelightBG`). Text lives only on Layer 1 or Layer 2.

> **Rule MA-17.** Micro-text below 12 px on any glass surface is prohibited (mirrors TP-15). Phase 1 explicitly enforces this on tokens; surface-level cleanup is Phase 2.

> **Rule MA-18.** Animated luminance changes in `TravelightBG` **MUST NOT** cause any (text, surface) pair to drop below the AA threshold during the cycle. The pipeline samples worst-case frames; primitives consume the worst-case pair.

---

## 4. Keyboard & Assistive Tech

> **Rule MA-19.** Every interactive element reachable by mouse **MUST** be reachable and operable by keyboard. Hover-only affordances on critical actions are prohibited (mirrors GL-8).

> **Rule MA-20.** Roving tab-index is required for: tab strips, segmented controls, menu lists, calendar grids, kanban columns. Single-tab traversal across a long list is prohibited.

> **Rule MA-21.** Live regions are required for: toast notifications (`role="status"` polite), error summaries on forms (`role="alert"` assertive), background sync state (`aria-live="polite"`).

> **Rule MA-22.** Every icon-only button **MUST** carry `aria-label`. Every decorative SVG **MUST** carry `aria-hidden="true"` and `focusable="false"`.

> **Rule MA-23.** Dialogs / drawers / bottom sheets **MUST** carry `role="dialog"` (or `alertdialog`), an accessible name, focus trap, `Escape`-to-close, and return-focus on dismissal.

---

## 5. Color Independence

> **Rule MA-24.** Status and category **MUST NOT** be communicated by color alone. Every status badge carries an icon + text; every chart series carries a label or pattern in addition to color; every form error pairs color with text and an icon.

---

## 6. Verification Checklist (Design Review)

- [ ] `prefers-reduced-motion: reduce` resolves to static `TravelightBG` and reduced blur without any per-surface code.
- [ ] No decorative animation in modified files.
- [ ] Focus ring visible, crisp, and ≥ 3:1 against both Layer 0 (worst frame) and Layer 1.
- [ ] All dialogs/drawers/sheets trap focus, restore focus, and close on `Escape`.
- [ ] Skip-link present and functional from the shell.
- [ ] AA pair check passes against the composited surface, not the raw token.
- [ ] No text on Layer 0; no micro-text < 12 px on glass.
- [ ] Roving tab-index implemented on every list/strip/grid.
- [ ] Live regions present for toasts, errors, and background sync state.
- [ ] No color-only state cues.

---

## 7. Out of Scope for Phase 1

- Per-surface a11y remediation (the dedicated A11y Wave runs in Phase 3). `[OUT-OF-SCOPE-P1 → Phase 3]`
- Screen-reader text rewrites and label copy review. `[OUT-OF-SCOPE-P1 → Phase 3]`
- Internationalization / RTL motion mirroring. `[OUT-OF-SCOPE-P1 → future]`
