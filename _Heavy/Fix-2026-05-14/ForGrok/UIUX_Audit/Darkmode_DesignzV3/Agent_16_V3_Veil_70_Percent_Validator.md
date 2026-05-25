# Agent 16 — 70% Reduction Validator & Metrics Lead — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 16 — 70% Reduction Validator & Metrics Lead  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Dense Task Execution view (multiple visible sections: FORM, SUPPORTING EVIDENCE, SIGNATURES, REVIEW/CERTIFICATION, LOCK/AUDIT + task list below)  
**Target Reduction:** Minimum 70% clutter reduction on default view

---

## 1. Current Clutter Diagnosis

The current default view for task execution is extremely dense. It displays:
- Full task header with many tags and actions
- Large "TASK EXECUTION REQUIREMENTS" container
- 5+ major sections (FORM, SUPPORTING EVIDENCE, SIGNATURES, REVIEW / CERTIFICATION, LOCK / AUDIT) all expanded with cards, lists, progress, and buttons
- A secondary task list below with multiple dense cards

**Estimated current clutter level:** ~85-90% (far too much information competing for attention on first load).

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer (Primary Mechanism)
- FORM content (the actual form fields)
- Full SUPPORTING EVIDENCE lists and previews (keep only count + "View Evidence" chip in list)
- SIGNATURES roster and status
- REVIEW / CERTIFICATION details and history
- LOCK / AUDIT trail and requirements

### 2.2 Move to Hover Cards / Previews
- Quick evidence thumbnails on hover over evidence count
- Status change history on hover over status badge
- Assignee details on hover

### 2.3 Move to Modals
- Full "View Artifact" flows (when user explicitly clicks)
- Bulk actions or advanced filters

### 2.4 Remove or Collapse Entirely
- Remove the giant "TASK EXECUTION REQUIREMENTS" header box on the list view
- Collapse all secondary task cards to title + one-line description + status only
- Remove redundant progress bars and duplicated buttons from the default list

### 2.5 React Component Opportunities
- `VeilDrawer` (configurable, with glass treatment)
- `TaskListItemMinimal` (title + brief + status + quick actions)
- `EvidenceCountChip` (with hover preview)
- `StatusBadgeWithHistory` (hover for timeline)

---

## 3. Impact on Default View

After implementation, the default view should show:
- Clean list of tasks (title + one-sentence description + status + due + quick actions)
- No expanded sections
- No long lists of evidence or signatures
- Visual density reduced dramatically

**Expected visual reduction:** 75-80% (exceeds the 70% minimum target)

**Before vs After:** Current view has 5+ expanded requirement sections + dense secondary list. After: pure scannable task list + one contextual Veil Drawer for any selected task.

---

## 4. Glassmorphism Application (Veil Glass Rules)

- The Veil Drawer should use subtle frosted glass with strong visible borders (matching the V3 dark floating card language from the reference images).
- Background task list should dim slightly (not fully opaque) when the drawer is open.
- Glass effect only appears when the drawer is active — otherwise the UI stays minimal and dark.

---

## 5. Risks & Trade-offs

- Risk: Users may feel "hidden" information is less discoverable (mitigate with good empty states and onboarding).
- Risk: Mobile experience of the Veil Drawer could feel cramped (Agent 11 must validate).
- Trade-off: Slightly more clicks/taps to see details, but massive gain in focus and speed for the primary list view.

---

## 6. Dependencies on Other Agents

- Strong dependency on Agent 03 (Veil Drawer design must be excellent)
- Agent 02 (Progressive Disclosure rules must be clear and consistent)
- Agent 06 (Minimal Core definition is the foundation of the 70% claim)
- Agent 08 (new components must be built to support the minimal list items)

---

## 7. Measurement & Validation Approach

**Proposed metrics for proving 70%+ reduction:**

1. **DOM Node Count** on default task list view (target: reduce by ≥70%)
2. **Visual Element Count** (cards, buttons, text blocks, icons) — manual count on screenshot vs new design
3. **Information Density Score** (number of visible data fields per task on default load)
4. **Time-to-First-Action** (how quickly a user can scan the list and decide what to do)
5. **User-reported Cognitive Load** (quick survey after using both versions)

Agent 16 will own running the before/after comparison using the reference screenshot + the new proposed list view mock.

---

## 8. Phase 1.1 Exit Recommendation

Before moving to implementation:
- All agents must align on the final "What stays in the list vs Veil Drawer" matrix
- Agent 03 must deliver a clickable prototype or high-fidelity mock of the Veil Drawer
- Agent 16 must publish a signed "70% Reduction Validation Report" with the metrics above

This phase must not end until we have a measurable, agreed-upon definition of what "70% less cluttered" actually looks like in the V3 Veil Glass language.

---

**Agent 16 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*