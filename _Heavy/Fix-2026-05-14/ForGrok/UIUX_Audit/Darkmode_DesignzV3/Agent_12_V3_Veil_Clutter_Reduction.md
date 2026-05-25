# Agent 12 — Performance & DOM Minimizer — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 12 — Performance & DOM Minimizer  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view (lots of DOM elements)  
**Target Reduction:** 70%+ visual + major DOM/performance improvement

---

## 1. Current Clutter Diagnosis

The dense view renders a huge number of DOM nodes (cards, lists, buttons, progress, etc.) even for tasks the user isn't currently working on. This hurts performance and increases cognitive load.

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer
By moving most content into the Veil (which is only rendered when needed), the default list view has far fewer DOM nodes.

### 2.2 Move to Hover Cards / Previews
Lightweight hover components (not heavy DOM until triggered).

### 2.3 Move to Modals
Only rendered when opened.

### 2.4 Remove or Collapse Entirely
Remove all the expanded sections and secondary cards from the default DOM.

### 2.5 React Component Opportunities
- Virtualized or lazy-loaded lists where appropriate
- Components that only mount heavy children when opened (VeilDrawer, modals, hover cards)

---

## 3. Impact on Default View

The default list becomes very lightweight in both visual and DOM terms. This directly supports the 70% reduction and makes the app feel much snappier.

---

## 4. Glassmorphism Application (Veil Glass Rules)

Glass effects (backdrop-blur, etc.) are only applied when the Veil or modal is open — not on the default list. This helps performance.

---

## 5. Risks & Trade-offs

- Risk: Over-optimization too early → Start with the highest-ROI components (Veil + minimal rows)
- Benefit: Much better performance on lower-end devices and large lists

---

## 6. Dependencies on Other Agents

- Agent 03: VeilDrawer must be performant
- Agent 06: Minimal list items must be lightweight

---

## 7. Measurement & Validation Approach

- DOM node count before/after on a typical list of 20 tasks
- Lighthouse / performance metrics on mobile

---

## 8. Phase 1.1 Exit Recommendation

Include performance targets (DOM count, render time) as part of the official Phase 1.1 success criteria.

---

**Agent 12 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*