# Component Usage Examples — CareIndeed Home Health (v2)

**Version:** 0.8 (Initial Draft)  
**Date:** May 2026

---

## Purpose

This document provides real-world usage examples for the core components in the CareIndeed v2 design system. It shows both correct and incorrect usage to help maintain consistency.

---

## 1. Button

### Correct Usage

**Primary Button (Orange)**
- Use for the main action on a screen (e.g., “Sign & Lock”, “Submit”, “Capture Evidence”).
- Only one primary button should be visible per screen in most cases.

**Secondary Button (Teal)**
- Use for supporting actions (e.g., “Review Document”, “Add Note”).

**Ghost Button**
- Use for tertiary actions or when you need a button that doesn’t compete visually.

### Incorrect Usage

- Multiple primary (orange) buttons on the same screen.
- Using orange for non-primary actions (e.g., “Cancel”, “Back”).
- Small buttons on mobile (< 44px height).

---

## 2. Card

### Correct Usage

**Elevated Card (Layer 2)**
- Use for actionable content (tasks, evidence items, policy cards, batches).
- Should feel clearly elevated from the background.

**Default Card (Layer 1)**
- Use for grouping information that is not directly actionable.

### Incorrect Usage

- Using the same elevation for every card (flat hierarchy).
- Stacking cards with no breathing room.
- Using dark borders on light mode cards.

---

## 3. Form Field

### Correct Usage

- Large, comfortable inputs (minimum 48px height on mobile).
- Clear labels above the field.
- Helpful helper text when needed.
- Clear error states with helpful messaging.

### Incorrect Usage

- Tiny input fields on mobile.
- Using placeholder text as the only label.
- Hiding error messages until the user submits the form.

---

## 4. Status Badge

### Correct Usage

- Use semantic colors consistently:
  - Teal = Compliant / Complete
  - Orange = Pending / Action Required
  - Red = Failed / Blocked / Overdue
- Always pair color with clear text.

### Incorrect Usage

- Using bright or neon versions of brand colors for status.
- Creating new status colors without adding them to the system.

---

## 5. Navigation

### Mobile Bottom Navigation

- Maximum 5 primary tabs.
- Use “More” sheet for secondary destinations.
- Prioritize the most frequent tasks.

### Desktop Sidebar

- Collapsible for power users.
- Clear active state with teal accent.
- Group related items logically.

---

## 6. Glass Layering Examples

**Good Example:**
- Page background (Layer 0)
- Main dashboard surface (Layer 1)
- Task card (Layer 2)
- Confirmation dialog (Layer 2 or 3 if needed)

**Bad Example:**
- Stacking 4+ translucent panels on top of each other.
- Using dark borders on light glass cards.

---

## 7. Status of This Document

This is an early draft. More components and visual/code examples will be added over time, including:

- Tabs
- Tables / DataGrid
- Empty States
- Loading States
- Modals & Bottom Sheets
- Signature Component
- Evidence Upload Component

---

**Next:** Expand this document with screenshots + code snippets for each component.

---

*Good usage examples help maintain consistency as the team scales.*