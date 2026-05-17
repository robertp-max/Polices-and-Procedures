# Responsive & Mobile Acceptance Matrix

**Spec Reference:** CANONICAL_UI_SYSTEM_SPEC.md Section 21

**Purpose:** Define the minimum acceptable responsive and mobile behavior for all reconstructed surfaces.

---

## Breakpoint Rules

| Breakpoint     | Min Width | Max Width | Behavior Requirements |
|----------------|-----------|-----------|-----------------------|
| Mobile         | 0         | 767px     | Single column, bottom sheets preferred, 44px+ targets, no horizontal scroll |
| Tablet         | 768px     | 1023px    | Max 2 columns, drawers allowed, touch-optimized |
| Laptop         | 1024px    | 1439px    | 3-column max, constrained container (4-sided inset) |
| Desktop        | 1440px+   | —         | Full constrained frame (clamp 16–28px inset), multi-card compositions allowed |

---

## Core Rules (Non-Negotiable)

1. **4-Sided Breathing Room** — On ≥1024px, the primary glass content must maintain visible margins on all 4 sides (enforced by Section 4).
2. **No Horizontal Scroll** on mobile or tablet for core operational flows.
3. **Touch Targets** — Minimum 44×44px on all interactive elements below 1024px.
4. **Progressive Disclosure** — Complex data (tables, boards, hierarchies) must collapse or use bottom sheets on mobile.
5. **Reduced Motion** — All surfaces must respect `prefers-reduced-motion`.

---

## Dashboard Specific Acceptance Criteria (Reference)

- [ ] KPI cards stack to single column below 768px
- [ ] Action Board uses full-width cards on mobile (no side-by-side)
- [ ] No 760px+ drawers on mobile (must use bottom sheet)
- [ ] All filters and actions remain thumb-reachable on mobile
- [ ] 4-sided inset respected on desktop/laptop (verified against approved reference captures attached to the PR)

---

## Enforcement

- Every surface checklist must include this matrix.
- Mobile visual regression is required for Phase 3 sign-off on any surface used by field users.
- The Dashboard Reconstruction Checklist is the template for all future surfaces.