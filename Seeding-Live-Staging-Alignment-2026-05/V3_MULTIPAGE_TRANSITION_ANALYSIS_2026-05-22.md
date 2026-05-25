# V3 Multipage Transition Analysis (2026-05-22)

## Scope

This analysis compares the previous V3 staging transition behavior against the reference MPA transition demo:

- Reference: https://rdeprey.github.io/view-transition-next-app/mpa
- Supporting pages:
  - https://rdeprey.github.io/view-transition-next-app/mpa/about
  - https://rdeprey.github.io/view-transition-next-app/mpa/features

Goal: use the reference behavior as source-of-truth and implement a premium multipage transition effect for V3 staging that feels expensive, clean, and non-thrashy.

---

## What the reference MPA does (observed behavior)

The reference demonstrates cross-document View Transitions with these core qualities:

1. **Single transition system**
   - One animation pipeline runs per navigation.
   - No duplicate animation layers competing with each other.

2. **Shell stability**
   - Visual frame/chrome appears stable while content changes.
   - The transition feels intentional rather than noisy.

3. **Directional coherence**
   - Enter/exit motion has clear route intent.
   - The eye can track where content is going.

4. **Low-amplitude motion**
   - Motion distance is subtle.
   - No dramatic blur/zoom spikes.

5. **Snapshot-first timing**
   - Browser captures old/new snapshots, then animates between them.
   - This avoids component-level stutter when done correctly.

6. **Shared element capability**
   - Matching `view-transition-name` values can morph layout positions.
   - This creates premium continuity when used selectively.

7. **Clean fallback model**
   - If unsupported or reduced-motion is enabled, behavior remains readable and calm.

---

## Why the previous V3 implementation felt cheap/thrashy

The prior implementation had the opposite profile:

1. **Redundant animation stacks**
   - CSS class-based keyframe animations (`.v3-page-animate`, `.v3-subview-animate`, stagger fades) were active alongside View Transition pseudo-element animations.
   - Result: double movement and visual interference.

2. **Competing motion languages**
   - Per-component enter animations and route transitions ran at different durations/easings.
   - Result: incoherent choreography and “lifeless + busy” feel simultaneously.

3. **Unclear directional semantics**
   - Section changes were not direction-aware.
   - Result: no spatial logic during navigation.

4. **Overprocessed effects**
   - Extra blur/scale/stacked animation layers made transitions feel synthetic.
   - Result: reduced legibility and perceived polish.

5. **Implementation mismatch**
   - CSS had transition definitions, but earlier navigation paths did not consistently invoke `document.startViewTransition`.
   - Result: requirement looked “implemented” in code but not reliably in behavior.

---

## Tooling/packages evaluation

### Native View Transitions API (chosen)

Pros:
- Best fit for route-like snapshot transitions.
- No dependency overhead.
- Direct control over pseudo-elements and shell persistence.
- Matches MPA reference model.

Cons:
- Browser support is strongest on Chromium.
- Requires fallback strategy for non-supporting browsers.

### Candidate libraries reviewed

1. `next-view-transitions`
- Good for Next.js App Router, not needed for this Vite React staging shell.

2. Generic React animation libs (Framer Motion / Motion One / React Transition Group)
- Excellent for component choreography.
- Not ideal as primary engine for MPA-like snapshot transitions.
- Risk of reintroducing dual animation stacks.

Decision:
- **No additional package required** for this pass.
- Keep a single, native View Transition pipeline to preserve clarity and performance.

---

## Source-of-truth rules adopted for V3

1. One transition engine only (View Transition API).
2. Lock app chrome (sidebar/header/watermark), animate content region.
3. Direction-aware transitions (`forward`, `back`, `none`).
4. Small-motion premium timing (calm fade + subtle drift + slight scale).
5. Reduced-motion path uses short opacity crossfade only.
6. No extra class-based page enter/stagger animations during route transitions.

---

## Implementation applied in this pass

### 1) Transition orchestration moved to navigation

In `V3StagingApp.tsx`:

- Navigation now invokes:
  - `document.startViewTransition(...)` when supported
  - `flushSync` inside transition callback for deterministic snapshot timing
- Direction is computed from section order:
  - `data-v3-vt-direction="forward" | "back" | "none"`
- Active transition state is tracked with:
  - `data-v3-vt-active="true"`

### 2) Removed redundant class-driven page animations

In `ui-staging.css`:

- Disabled legacy class animation stack:
  - `.v3-page-animate`
  - `.v3-subview-animate`
  - `.v3-stagger > *`

This prevents double-animation and motion conflicts.

### 3) Rebuilt premium multipage View Transition CSS

In `ui-staging.css`:

- Preserved `@view-transition { navigation: auto; }`.
- Kept shell persistence:
  - `app-sidebar`, `app-header`, `app-watermark` do not animate.
- Implemented directional keyframes for `main-content`:
  - forward enter/exit
  - back enter/exit
- Tuned timing/easing:
  - smooth premium curve
  - restrained motion amplitude

### 4) Reduced-motion safety

- Reduced-motion media query now forces short opacity-only transition.

---

## Validation checklist

Completed:

- Type-check: `npx tsc --noEmit --skipLibCheck`
- Build: `npm run build`
- Both pass after transition refactor.

---

## Next optional refinement (not required to meet current spec)

If we want closer parity to high-end shared-element demos:

1. Add selective shared-element names for:
   - page heading title
   - section micro-label
   - primary CTA chip
2. Keep usage sparse to avoid clutter.
3. Never reintroduce separate component entry keyframes on section swap.

This would be an additive “premium continuity” layer on top of the now-clean base.

