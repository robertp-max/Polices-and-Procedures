# Hover, Focus & Active States — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Consistent and purposeful hover, focus, and active states are essential for building trust, accessibility, and a premium feel. In a compliance platform, users must always understand what is interactive and where they currently are.

---

## 2. Core Principles

- **Subtle but clear** — States should feel refined, never flashy or cartoonish.
- **Accessible** — Focus states must be highly visible (minimum 2px teal ring or equivalent).
- **Glass-aware** — States must work on both Layer 1 and Layer 2 surfaces without breaking the glass aesthetic.
- **Mobile-first** — Hover is secondary on touch devices. Focus and active states remain critical.

---

## 3. State Definitions

| State   | Trigger                  | Visual Treatment                                                                 | Usage |
|---------|--------------------------|----------------------------------------------------------------------------------|-------|
| **Hover**   | Mouse enter              | Subtle lift (1–2px), slight increase in glass opacity, or soft shadow enhancement | Desktop only (cards, buttons, links) |
| **Focus**   | Keyboard focus           | Clear 2px teal ring (`--color-brand-teal`) around the element + slight background lift | All interactive elements (mandatory) |
| **Active**  | Mouse down / tap         | Brief scale (0.98) or color shift on primary action color (restrained orange for buttons) | Buttons, links, selectable cards |
| **Selected**| Toggled / chosen state   | Teal left border or subtle teal background tint on Layer 1/2                     | Tabs, list items, radio-style cards |

---

## 4. Component-Specific Rules

### Buttons
- **Primary (Orange)**: Hover → slightly darker orange + lift. Active → scale + stronger orange.
- **Secondary (Teal)**: Same treatment with teal.
- **Ghost**: Hover → very subtle background tint + lift. Focus ring must be clearly visible.

### Cards (Layer 1 & Layer 2)
- Hover (desktop): Gentle lift + slightly stronger glass highlight.
- Active: Quick press feedback (scale or border flash).
- Do **not** overdo hover on every card — only apply when the entire card is clickable.

### Form Fields
- Focus: Strong teal ring + background lift.
- Error state overrides focus color with semantic red ring.

### Navigation & Tabs
- Active tab: Teal underline or left accent + slightly bolder text.
- Hover on inactive tabs: Subtle text color change + underline preview.

### Links
- Hover: Underline appears + color shifts to teal.
- Focus: Teal ring (never rely on underline alone).

---

## 5. Desktop vs Mobile

- **Desktop**: Full hover + focus + active states.
- **Mobile**: Focus and active states only. Hover effects are ignored (no cursor).
- Touch devices should still show clear press feedback (active state).

---

## 6. Accessibility Requirements

- Focus indicator must always be visible and at least 2px thick.
- Do not remove focus outlines without providing a strong alternative.
- All states must pass WCAG contrast when combined with text.

---

## 7. Do’s and Don’ts

**✅ Do**
- Use the teal focus ring consistently across the system.
- Make hover states feel like a natural extension of the glass treatment.
- Keep active/pressed feedback quick and satisfying.

**❌ Don’t**
- Use bright or neon hover colors.
- Make hover effects too strong (they should feel elegant, not dramatic).
- Forget focus states on custom components.
- Apply hover effects on non-interactive elements.

---

## 8. Token Recommendations

- Focus ring: `--color-brand-teal` at 100% opacity, 2px width
- Hover lift: `--shadow-elevation-2` with slight increase
- Active scale: `transform: scale(0.985)`

---

*Good states make the interface feel alive and trustworthy without being distracting.*

---

**Related Documents:**
- `COMPONENT_GUIDELINES.md`
- `GESTURE_INTERACTION_GUIDELINES.md` (next)