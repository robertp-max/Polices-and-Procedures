# V3 Veil Drawer — Exact Behavior Specification

**Status:** Locked Source of Truth (v1.1 — Merged Nav + Broken Lines refinement)  
**Phase:** 1.1 (Clutter Reduction)  
**Date:** 2026-05-18  
**Purpose:** Single authoritative contract for all Veil Drawer interactions across the entire application. This document replaces all previous drawer/panel behavior descriptions.

---

## 1. Core Principle

**"Less is more on the default surface. Everything else lives in the Veil."**

- The **Veil Drawer** is the **one and only** contextual detail container in the app.
- When closed, it must disappear completely (unmount) — zero layout residue, zero visual trace.
- All surfaces (Calendar, Gantt, Kanban, Evidence, Policy Viewer, CES tasks, Audit Mode, etc.) share **the exact same Veil Drawer instance**.
- **Non-stacking rule is non-negotiable**: Only one Veil Drawer may be open at any time. Opening a new context must first close the previous drawer.

---

## 2. Default State (The 70%+ Reduction Lever)

When the user lands on any list or calendar surface:

- The main view is **extremely minimal**.
- Only `TaskRowMinimal` (or equivalent folder rows) are visible.
- No right panels, no split views, no persistent metadata strips, no tabs, no footers with lists.
- The entire surface feels calm and scannable.

Clicking any row or calendar event **opens the Veil** from the right.

---

## 3. Veil Drawer — Two-Layer Progressive Disclosure Model

The Veil uses a strict **two-layer sequential pattern** (never simultaneous).

### Layer 1 — Brief Task List (Yellow Highlights)
- Triggered when user clicks a calendar event, gantt bar, kanban card, or folder.
- Shows a clean vertical list of **tasks only**.
- Each task row contains:
  - Very short one-line description (primary text)
  - **Soft glowing yellow** highlight on the brief description
  - Minimal status indicator
- Goal: Fast triage. User scans the list and clicks the specific task they want.

### Layer 2 — Detailed Content (Red Highlights)
- Triggered when user clicks a task inside Layer 1.
- **First drawer closes completely** (slides out to the right with exit animation).
- **Second drawer enters** from the right (enter-left animation).
- Contains the full rich content for that task:
  - Form (when applicable)
  - Evidence section (upload + list)
  - Signatures
  - Certification / review actions
  - Detailed instructions
- **Key sentences, requirements, and compliance-critical text** are highlighted in a distinct **warm red**.
- This is the "meat" layer — the only place heavy content is allowed.

**Transition Rule (Mandatory):**
- Close previous drawer fully first.
- Use consistent exit-right → enter-left motion.
- Never have two glass layers visually stacked ("white on white" or glass-on-glass).

---

## 4. Trigger Rules by Surface

| Surface              | Layer 1 Trigger                  | Layer 2 Trigger                     | Notes |
|----------------------|----------------------------------|-------------------------------------|-------|
| Calendar             | Click calendar event             | Click task in yellow list           | Shared Veil |
| Gantt                | Click task bar                   | Click task in yellow list           | Shared Veil |
| Kanban               | Click card                       | Click task in yellow list           | Shared Veil |
| Evidence Center      | Double-click folder              | N/A (or direct to content)          | Strict folder hierarchy |
| Policy Viewer        | Click policy / section           | N/A                                 | Usually opens directly to Layer 2 |
| CES Task List        | Click row                        | Click task in yellow list           | Primary home of form-first workflow |
| Audit Mode           | Click audit item in Evidence     | Opens nested inside Evidence Veil   | 2+ sequential layers allowed |

---

## 5. Global Shell Rules (Applies Everywhere)

Everything lives **inside one single main container**. Navigation is merged with the content area.

### Merged Nav + Logo + Broken Line Separation
- Logo + Hamburger sit at the top-left, integrated inside the main container.
- Search (with live preview dropdown) lives in the top area inside the same container.
- Left navigation is collapsed by default. It merges visually with the main surface.
- **Separation** between the left nav and main content is achieved using **broken/interrupted vertical lines** (segmented, gapped strokes with intentional breathing) and occasional subtle horizontal broken lines. No solid continuous borders.
- Notification bell + Profile avatar live at the bottom of the collapsed nav.
- The entire experience (including the Veil when open) feels contained within one cohesive surface.

This merged approach + broken line technique creates a fluid, expensive feel while still clearly defining zones. It supports the goal of hiding the Veil as much as possible — the default view stays extremely calm and integrated.

---

## 6. Evidence & Forms Workflow (Strict)

- **Evidence is folder-only** (Google Drive / Windows Explorer style).
- Every folder at every level shows **completion percentage** directly on the folder icon.
- No loose evidence items outside folders.
- **Form must be uploaded first** before any supporting evidence can be attached.
- Evidence file naming convention: `<forminstanceid>-ABCD...Z`
- Upload controls for evidence appear **only inside the CES task Veil Drawer** (never in the global Evidence section).
- Some forms (e.g. meeting minutes) do not require supporting evidence — this is optional per form type.

---

## 7. Content Rules Inside the Veil

- Layer 1: Ruthlessly minimal. Yellow highlights only on the short descriptions.
- Layer 2: Rich but still disciplined. Red highlights reserved for the most important compliance text.
- Technical IDs, debug data, and heavy metadata are **never visible** to end users (dev-only affordance at most).
- All heavy sections (Evidence, Signatures, Certification, Audit Trail) live as collapsible `VeilSection` components inside Layer 2.

---

## 8. Close / Dismiss Behavior

The Veil can be closed by:
- X button in header
- ESC key
- Click on backdrop (outside the drawer)
- Left-edge drag (optional future enhancement)

On close:
- Drawer slides out completely and unmounts.
- Focus returns to the element that opened it.
- Default view regains full width and calm state instantly.

---

## 9. Mobile Adaptation

- Desktop right-side Veil → becomes a **bottom sheet** on mobile.
- Same two-layer sequential logic applies.
- Bottom sheet should feel native, fast, and easy to dismiss (swipe down or tap backdrop).
- `TaskRowMinimal` must remain highly scannable on small screens.

---

## 10. Do / Don't (Non-Negotiable)

**Do**
- Use the Veil for 95%+ of all detail work.
- Enforce the two-layer yellow → red pattern.
- Always close previous drawer before opening the next.
- Keep default lists extremely minimal.
- Put the completion % directly on folder icons.
- Respect the single bordered main card shell.

**Don't**
- Stack multiple glass drawers.
- Leave persistent right panels on any list/calendar view.
- Show long text or heavy metadata on default surfaces.
- Put evidence upload controls outside CES task context.
- Allow loose evidence items outside folders.
- Create surface-specific drawer variants (one Veil to rule them all).

---

## 11. React Component Implications (For Phase 2)

This behavior spec implies the following primitives must be built:

- `VeilDrawer` (single shared component with `open`, `onClose`, `layer`, `children`)
- `TaskRowMinimal`
- `VeilSection` (collapsible internal blocks)
- Strong animation primitives for the exit-right / enter-left transition
- `useVeil()` or centralized store for open/closed + current context state

---

## 12. Sign-Off

This document is the **locked behavioral contract** for the V3 Veil system.

Any future implementation, component work, or Claude codegen prompt must treat this spec as non-negotiable.

---

**Next Phase Readiness:** Once this behavior is folded into the master Claude codegen prompt, the team can move to Phase 2 (actual foundation primitives).