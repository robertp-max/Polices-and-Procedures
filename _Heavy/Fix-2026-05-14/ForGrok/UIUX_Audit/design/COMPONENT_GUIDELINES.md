# Component Guidelines — CareIndeed Home Health (v2)

**Version:** 1.1  
**Date:** May 2026

---

## Overview

This document provides detailed guidelines for the core components in the CareIndeed v2 design system.

All components must follow:
- Premium glassmorphic aesthetic (light + dark)
- Strict 3-layer glass system
- Care Indeed color palette only
- Mobile-first responsive behavior
- High accessibility standards (WCAG 2.2 AA)

---

## 1. Button

### Variants
- **Primary** (Orange) — Main actions
- **Secondary** (Teal) — Supporting actions
- **Ghost** — Tertiary actions
- **Danger** — Destructive actions

### States
- Default, Hover, Active, Disabled, Loading

### Rules
- Minimum height: 44px on mobile
- Use Montserrat or Inter 600 for labels
- Icons (if used) should be 16–20px

**Do:** Keep labels short and action-oriented (“Sign & Lock”, “Capture Evidence”)

**Don’t:** Use multiple primary buttons on one screen.

---

## 2. Card

### Variants
- **Default Card** (Layer 1)
- **Elevated Card** (Layer 2) — for actionable content
- **Glass Card** — when visual lightness is needed

### Rules
- Consistent internal padding (16px–24px)
- Clear visual separation via shadow or soft border
- Never mix hard borders with glass in light mode

**Do:** Use Layer 2 elevation for anything the user needs to act on.

**Don’t:** Stack cards with no breathing room.

---

## 3. Form Field

### Anatomy
- Label (above field)
- Input / Textarea / Select / Signature
- Helper text or error message
- Optional icon

### States
- Default, Focused, Filled, Error, Disabled

**Do:**
- Make fields large and comfortable (min 48px height on mobile)
- Show validation inline
- Use clear, left-aligned labels

**Don’t:**
- Use placeholder as the only label
- Hide error messages until form submission

---

## 4. Navigation

### Mobile
- Bottom navigation (max 5 tabs)
- “More” sheet for secondary items

### Desktop
- Left sidebar (collapsible)
- Clear active state with teal accent

**Do:** Prioritize the most frequent tasks in primary navigation.

**Don’t:** Change navigation patterns between similar screens.

---

## 5. Status & Badges

### Semantic Colors
- Teal = Compliant / Stable
- Orange = Pending / Action Required
- Red = Failed / Blocked / Overdue
- Grey = Neutral / In Progress

**Do:** Always pair color with clear text.

**Don’t:** Create new status colors without system approval.

---

## 6. Status of This Document

This is a living document. More components will be added:

- Tabs & Navigation patterns
- Tables / DataGrid
- Empty States
- Loading States
- Modals & Bottom Sheets
- Signature Component
- Evidence Upload Component

---

**Next:** Expand each component with full anatomy, spacing, and code examples.

---

*Good components disappear — the user just gets their work done.*