# V3 Veil Glass Implementation Guide

This document provides practical guidance for rolling out the V3 Veil Glass Design System across the existing application while maintaining visual and motion consistency.

## 1. Migration Phases

### Phase 1: Foundation
- Add V3 tokens to the global CSS as CSS custom properties (`--ci-veil-*`)
- Create a `glassMode` flag in the shell store (`'v3-veil' | 'current'`)
- Implement global `.no-scrollbar` and `.v3-invisible-glare` utilities

### Phase 2: Shell Evolution
- Update `ShellNavRail` and `CommandCenterLayout` to support the new hierarchical navigation with collapsible submenus when in V3 mode
- Make the sidebar transparent and add the interrupted vertical divider behavior
- Modify `ShellContentFrame` to optionally render the 77.7% constrained glass card

### Phase 3: Core Surfaces
- Convert the Dashboard to use the V3 visual treatment (hero, KPIs as invisible surfaces, Kanban as the bordered exception, My Planner toggle)
- Apply the same invisible vs bordered philosophy to Evidence Center, Policy pages, Calendar, etc.

### Phase 4: Motion Layer
- Implement the global multipage transition system
- Ensure every view change (navigation, toggles, drawer open/close, route changes) uses the approved transition characteristics
- The transition language must feel identical across all major sections of the app

### Phase 5: Polish & Audit
- Lock the Q3 watermark at 0.33 opacity
- Remove any remaining non-teal accents (except the two allowed neon orange glows)
- Conduct a full consistency audit using the reference screenshots

## 2. Key Technical Patterns

- Use the exact token values from the Design Specs.
- For special grids (Evidence Archive, document browsers), prefer the runtime GSAP Masonry pattern from the reference code.
- Keep the main content inside the 77.7% glass card contract wherever possible.

## 3. Consistency Mandate

The single most important success factor is **motion and visual consistency**. The user must feel the same polished, calm, cohesive experience when moving from Dashboard → Evidence → Policy → Calendar as they feel inside the reference Dashboard.

Do not create page-specific transition styles. The multipage transition system is part of the design system and must be applied uniformly.

## 4. Testing Criteria

A page is considered “V3 complete” when:
- It respects the 77.7% glass card or equivalent invisible surface treatment
- All borders are at 33% opacity
- It uses only approved teal and limited orange
- View changes feel smooth, clean, and consistent with the rest of the app
- It matches the spirit of the 36 reference screenshots

---

Use the Design System Specs and the Visual Reference code as the source of truth during implementation.