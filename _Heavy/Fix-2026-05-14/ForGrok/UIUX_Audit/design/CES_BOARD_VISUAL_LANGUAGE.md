# CES Board Visual Language — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

The CES Board is one of the most frequently used and operationally critical surfaces in the entire platform. This document defines its exact visual language so every sprint, task card, and status feels consistent, scannable, and trustworthy.

---

## 2. Core Principles for the CES Board

- **Task-first** — The clinician/DON should immediately understand what needs to be done today.
- **Urgency hierarchy** — Overdue and high-risk items must stand out without screaming.
- **Calm glass aesthetic** — Even when there is a lot of work, the interface should not feel chaotic.
- **One-handed friendly** on mobile (large tap targets, clear swipe actions).

---

## 3. Card Hierarchy (Layer System)

| Layer | Use Case                              | Treatment |
|-------|---------------------------------------|---------|
| Layer 1 | Standard task card                    | Soft glass, subtle shadow |
| Layer 2 | Selected / focused / "My Task"        | Slightly stronger elevation + teal accent border on left |
| Layer 3 | Critical overdue or blocked (rare)    | Stronger shadow + restrained orange left border |

**Rule:** Do not overuse Layer 3. Most overdue items should live in Layer 2 with clear "Overdue" badge.

---

## 4. Status & Urgency System

**Approved semantic colors (Care Indeed only):**

- **Teal** — Completed / On Track / Compliant
- **Restrained Orange** — Due today, Action required, In progress
- **Red** — Overdue, Blocked, Failed (use sparingly)

**Badge treatments:**
- Small, rounded, high-contrast text
- Never rely on color alone — always pair with clear text ("Overdue 3d", "Due Today", "Completed")

---

## 5. Information Density Rules

Each CES card should show (in order of importance):

1. Task title (bold, primary text)
2. Patient / Unit name (if applicable)
3. Due date or "Overdue X days" (clear, not tiny)
4. Status badge
5. Assignee avatar (when relevant)
6. Quick actions (Start, Complete, View Evidence) — only the most important 1–2

**Mobile:** Collapse less critical information behind a "More" or swipe gesture.

---

## 6. Board Layout

### Desktop
- Kanban-style columns (To Do / In Progress / Review / Done) or grouped by clinician
- Cards should feel generous but not wasteful
- Drag-and-drop supported (with clear affordance)

### Mobile
- Vertical list (not Kanban)
- Pull-to-refresh
- FAB for "Quick Capture Evidence" or "Log Task"
- Bottom sheet for task detail (never a wide drawer on mobile)

---

## 7. Do’s and Don’ts

**✅ Do**
- Make "My Tasks" the default filtered view for most users
- Use progressive disclosure (show more detail on tap/click)
- Show clear "Why this task matters" context when possible
- Maintain excellent contrast even in bright sunlight (field use)

**❌ Don’t**
- Create 8+ different card variants
- Use tiny text for due dates
- Mix CI-ION maroon/gold into any CES element
- Make the board feel like a spreadsheet

---

## 8. Interaction Patterns

- Tap card → Opens task detail (bottom sheet on mobile, side panel on desktop)
- Long press / right-click → Quick actions menu
- Swipe left on mobile → Mark complete or Capture Evidence (contextual)

---

## 9. Future Enhancements (Phase 4+)

- Smart grouping (by patient, by regulatory domain, by risk level)
- Voice/Brad integration ("Read me the three most urgent tasks")
- Offline-first support with clear sync status

---

*CES is the daily operating system for compliance execution. It must feel fast, clear, and calm — even on the busiest days.*

---

**Next:** Align the actual `CesBoardPage` and `CesCard` implementations with this spec during Phase 3 High-Frequency Workflow work.