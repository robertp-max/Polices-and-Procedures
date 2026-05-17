# Dashboard Reconstruction Plan — Phase 3 Reference Surface

**Phase 3 — Operational Surface Reconstruction**  
**Surface:** Command Center / Dashboard  
**Version:** 1.0  
**Date:** 2026-05-17  
**Traceability:** `Phase3_Implementation_Spec.md` + `DASHBOARD_RECONSTRUCTION_KICKOFF.md` + `SURFACE_CHECKLISTS/Dashboard.md` + Phase 2 Shell artifacts

---

## 1. Purpose

Rebuild the Dashboard as the **first and reference surface** for the entire Phase 3 program. Success here validates the full canonical stack (Phase 1 tokens + Phase 2 shell + primitives) and creates reusable patterns for Evidence, Audit, Calendar, and My Tasks.

---

## 2. Current State Summary (from Phase 1 Baseline)

- File: `src/policy/pages/DashboardPage.tsx` (~902 lines)
- Significant raw values identified in Phase 1 inventory (6 raw colors, 35+ arbitrary Tailwind values)
- Heavy use of inline `div`s, custom shadows, arbitrary sizing, and local card patterns
- Partial adoption of some `ci-*` classes but inconsistent
- Does not yet fully respect the new `ShellContentFrame` + 4-sided constrained contract
- Mix of legacy card families and ad-hoc layouts

---

## 3. Target State

The rebuilt Dashboard must:

- Live entirely inside the new Phase 2 shell (`ShellFrame` → `ShellContentFrame`)
- Use **only** canonical primitives (`GlassPanel`, `SurfaceCard`, `KpiCard` (new), `BoardColumn` (new), `ActionButton`, `UtilityButton`, `CiStatusBadge`, `EmptyState`, `LoadingState`, etc.)
- Use **only** `--ci-*` tokens from the locked contract
- Demonstrate excellent glassmorphism through strict 4-sided breathing room
- Serve as the visual and structural template for all other operational surfaces

---

## 4. Reconstruction Phases for Dashboard

### Phase 3.1 — Shell Integration (Foundation)
- Wrap Dashboard content in `ShellContentFrame`
- Remove any full-bleed or near-full-bleed assumptions
- Ensure `GlassPanel` (data-layer="1") is the primary container
- Migrate top-level layout to respect new `ShellFrame` constraints

### Phase 3.2 — Hero / KPI Section
- Replace current KPI cards with new `KpiCard` primitive (to be promoted)
- Apply consistent elevation using `shadow.elevation` tokens
- Use `--ci-font-size-kpi-value`, `--ci-font-size-stat-value`, etc.

### Phase 3.3 — Command / Action Board
- Introduce `BoardColumn` and `KanbanCard` patterns (promote as needed)
- Normalize command groups using `ShellCommandGroup` semantics where appropriate
- Ensure responsive collapse (single column on mobile)

### Phase 3.4 — Empty States, Loading, and Edge Cases
- Replace all custom empty/loading states with `EmptyState` and `LoadingState`
- Apply consistent messaging and iconography

### Phase 3.5 — Cleanup & Deprecation
- Remove all legacy card families (`SCard`, custom `ci-operational-card`, inline shadows, etc.)
- Eliminate remaining raw values per Phase 1 inventory
- Update any remaining dual-brand references

---

## 5. New Primitives Likely Required (Dashboard-Driven)

These should be proposed and added to `primitives/CATALOG.md` during implementation:

- `KpiCard` / `MetricCard`
- `BoardColumn`
- `CommandCard` or enhanced `SurfaceCard` variants
- `FilterBar` / `SegmentedControl` (if not already present)

All must follow the rules in `Canonical_Primitive_Usage_Map.md` from Phase 2.

---

## 6. Responsive Requirements (Dashboard Specific)

- Desktop/Laptop (≥1024px): Full 4-sided inset + multi-card compositions
- Tablet: 2-column maximum
- Mobile: Single column, bottom sheets for details, 44px targets
- All boards and KPI grids must stack gracefully

See `Responsive_Accessibility_Validation_Plan_Shell.md` for shell-level rules + surface-specific additions.

---

## 7. Accessibility Focus Areas

- Proper heading hierarchy in KPI and board sections
- Keyboard navigation through action boards
- Status conveyed with more than color (`CiStatusBadge`)
- Live regions for dynamic updates (if any)
- Consistent focus management

---

## 8. Visual Regression & Evidence Requirements

- Before/after captures at all four breakpoints
- Comparison against approved Top Picks mocks (especially 01_Dashboard_Mobile_v2.jpg and desktop equivalents)
- Proof that glassmorphism has improved due to proper framing

---

## 9. Dependencies

- Phase 2 shell primitives must be stable and exported
- `KpiCard` and `BoardColumn` primitives promoted before full board work
- Token contract remains locked (minor additions only via governance)

---

## 10. Success Criteria for Dashboard

- Passes 100% of items in `SURFACE_CHECKLISTS/Dashboard.md`
- Zero raw visual values
- 100% canonical primitive usage
- 4-sided constrained framing verified and visually superior
- Serves as approved template for Phase 3 surfaces that follow

---

**End of Dashboard Reconstruction Plan**

Next artifact: `Dashboard_Canonical_Primitive_Usage.md` will be produced immediately.