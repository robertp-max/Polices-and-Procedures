# Responsive Behavior Matrix — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This matrix defines how every major component and screen behaves across Mobile (< 768px), Tablet (768–1024px), and Desktop (> 1024px). Mobile-first is non-negotiable.

---

## 2. Breakpoints

- **Mobile**: 0 – 767px (primary target)
- **Tablet**: 768 – 1023px
- **Desktop**: 1024px and up (enhanced experience)

---

## 3. Navigation

| Surface       | Mobile                          | Tablet                     | Desktop                          |
|---------------|---------------------------------|----------------------------|----------------------------------|
| Main Nav      | Bottom tab bar (max 5 items)    | Collapsible sidebar or top | Persistent left sidebar          |
| "More" menu   | Bottom sheet                    | Bottom sheet or drawer     | Expanded in sidebar              |
| Back / Close  | Top-left or gesture             | Top-left                   | Top-left + breadcrumb support    |

---

## 4. Major Components

### Cards & Lists
- **Mobile**: Single column, generous padding, large tap targets.
- **Tablet**: 1–2 column grid depending on content density.
- **Desktop**: 2–3+ column grids where appropriate (e.g., Evidence Center, CES reports).

### Modals vs Bottom Sheets
- **Mobile**: Almost everything that would be a modal on desktop becomes a **bottom sheet**.
- **Tablet**: Bottom sheet for most actions, full modal only for very complex flows.
- **Desktop**: Traditional modals and side drawers allowed.

### Drawers
- **Mobile**: Never use wide right drawers. Convert to bottom sheet or full-screen page.
- **Desktop**: Right drawers acceptable for detail panels (e.g., UnitDrawer on desktop only).

### Forms
- **Mobile**: Stacked fields, large inputs (min 48px height), helper text above or below.
- **Tablet/Desktop**: Can use two-column layouts for long forms when it improves scannability.

### Main App Surface Container (Desktop Glassmorphism Rule)

**Critical for premium glass effect on desktop:**

- The main Layer 1 working surface **must not** take up the full screen width.
- Apply a constrained container with `max-width` (recommended 1280px – 1600px) + visible horizontal margins (32px+ on each side on standard desktop, more on ultrawide).
- This exposes the rich **Layer 0 dark atmospheric background** around the main glass panel, dramatically increasing depth and the "expensive" glassmorphic feeling.

**Reference:** Current desktop implementations (e.g. the Policy Library view) show the main card area nicely contained with background visible on all sides.

- **Mobile & Tablet**: Closer to full-width is acceptable due to limited screen real estate.
- **Desktop only**: This breathing room rule is mandatory for visual quality.

---

## 5. CES Board

- **Mobile**: Vertical list (agenda style). No Kanban columns.
- **Tablet**: Can show limited columns if space allows.
- **Desktop**: Full Kanban or grouped board views supported.

---

## 6. Onboarding V2

- **Mobile**: Batch list → Batch detail page → Unit detail page. Bottom sheets for actions.
- **Tablet**: Can use split view (list + detail) in landscape.
- **Desktop**: List + wide detail drawer or side panel.

---

## 7. Calendar

- **Mobile**: Agenda/List view primary. Week view via swipe. Month view secondary.
- **Tablet**: Week or month grid + agenda.
- **Desktop**: Full month grid + sidebar agenda.

---

## 8. Evidence & Signature Capture

- **Mobile**: Full camera experience + large signature pad.
- **Tablet/Desktop**: Camera + file upload options + reasonably sized signature area.

---

## 9. General Rules

- **Never** hide critical actions behind hover on mobile.
- **Always** test thumb reach zones on real devices.
- Progressive disclosure increases on smaller screens.
- Touch targets minimum 44×44px everywhere (48px preferred for primary actions).

---

## 10. Testing Requirements

Every new screen or component must be reviewed in:
1. iPhone 14/15/16 Pro (or equivalent)
2. iPad (landscape + portrait)
3. Desktop browser at 1440px and 1920px

---

*If it doesn't feel excellent on a phone in one hand, it doesn't ship.*

---

**This matrix must be followed during all Phase 2 (Mobile Shell) and Phase 3 (High-Frequency Workflow) implementation.**