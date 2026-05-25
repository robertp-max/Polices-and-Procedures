# Agent 08 — React Component Extraction Lead — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 08 — React Component Extraction Lead  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view  
**Target Reduction:** Minimum 70% clutter reduction + maximum React component reusability

---

## 1. Current Clutter Diagnosis

A large part of the current visual and code-level clutter comes from duplicated, page-specific implementations of cards, lists, buttons, and sections. Every surface reinvents similar patterns.

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer
- Most complex UI (forms, evidence grids, signatures, certification flows) → handled inside reusable `VeilDrawer` + `VeilSection` components

### 2.2 Move to Hover Cards / Previews
- `HoverPreviewCard` component (used for evidence, status, owner)

### 2.3 Move to Modals
- `ActionModal` / `ConfirmModal` family

### 2.4 Remove or Collapse Entirely
- Many ad-hoc buttons and cards on the list view can be removed by using standardized `TaskRowMinimal` + `QuickActionGroup`

### 2.5 React Component Opportunities (High Impact)

**New / Promoted Components to build in Phase 2:**
- `TaskRowMinimal` — the new atomic list item (title + description + status + due + owner)
- `VeilDrawer` — the primary container (glass-treated, animated, configurable sections)
- `VeilSection` — standard glass section used inside the drawer (collapsible, consistent)
- `EvidenceChip` — count + hover preview
- `StatusPillWithHistory`
- `QuickActionBar` (max 3 actions)
- `ContainmentMatrix` (documentation component for devs)

These 7–8 components can replace dozens of duplicated patterns across the app.

---

## 3. Impact on Default View

By extracting to these components:
- Default list becomes extremely consistent and lightweight
- All complex UI is routed through the same `VeilDrawer` + `VeilSection` system
- Massive reduction in custom code per page

**Expected contribution to 70% goal:** High (both visual and code-level declutter)

---

## 4. Glassmorphism Application (Veil Glass Rules)

All new components must respect V3 Veil Glass rules:
- `VeilDrawer` and `VeilSection` are the **only** places where prominent glassmorphism appears
- `TaskRowMinimal` and list components stay minimal dark with no decorative glass

---

## 5. Risks & Trade-offs

- Risk: Over-abstraction too early → Mitigate by starting with the highest-ROI components first (VeilDrawer + TaskRowMinimal)
- Trade-off: Initial investment in components, but long-term massive reduction in maintenance and visual drift

---

## 6. Dependencies on Other Agents

- Agent 03: VeilDrawer spec must be finalized first
- Agent 07: Containment rules define what goes into which component
- Agent 14: Components must be used consistently everywhere
- Agent 06: TaskRowMinimal definition must be locked

---

## 7. Measurement & Validation Approach

- Track "number of unique card/list implementations" before and after
- Code coverage of new shared components
- Visual regression using the new minimal list items across surfaces

---

## 8. Phase 1.1 Exit Recommendation

Publish a **"V3 Veil Component Map"** showing:
- Which components exist
- Where they are used
- What they replace

This map becomes the blueprint for Phase 2 implementation.

---

**Agent 08 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*