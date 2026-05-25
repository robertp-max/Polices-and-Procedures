# Agent 11 — Mobile & Responsive Declutter — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 11 — Mobile & Responsive Declutter  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view (must translate to mobile)  
**Target Reduction:** 70%+ on both desktop and mobile

---

## 1. Current Clutter Diagnosis

On mobile, the current dense view is even worse — everything stacks vertically with almost no breathing room.

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer
On mobile, the Veil should become a **bottom sheet** (full or near-full screen) that feels native and easy to dismiss.

### 2.2 Move to Hover Cards / Previews
On mobile, replace hover with tap-to-preview (quick bottom sheet or popover).

### 2.3 Move to Modals
Use native-feeling modals or bottom sheets for focused actions.

### 2.4 Remove or Collapse Entirely
Same ruthless minimalism on the list view, but even more aggressive on mobile (smaller fonts, tighter spacing, fewer columns).

### 2.5 React Component Opportunities
- Responsive `VeilDrawer` that becomes a bottom sheet on mobile
- `TaskRowMinimal` that adapts gracefully
- Consistent touch targets (min 44px)

---

## 3. Impact on Default View

The same "clean list + contextual reveal" pattern must work beautifully on both desktop and mobile. The 70% reduction should feel even more dramatic on small screens.

---

## 4. Glassmorphism Application (Veil Glass Rules)

On mobile, the glass treatment on the bottom sheet should feel premium but not heavy on performance.

---

## 5. Risks & Trade-offs

- Risk: Bottom sheets can feel less "powerful" than desktop drawers → Make them very fast and well-animated
- Benefit: One consistent mental model across devices

---

## 6. Dependencies on Other Agents

- Agent 03: Veil must have excellent mobile behavior
- Agent 12: Performance on mobile is critical
- Agent 06: Minimal list must work on small screens

---

## 7. Measurement & Validation Approach

- Test the new pattern on real mobile devices
- Measure task completion time on mobile before/after

---

## 8. Phase 1.1 Exit Recommendation

Ensure the Veil + minimal list pattern is validated on both desktop and mobile before Phase 2.

---

**Agent 11 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*