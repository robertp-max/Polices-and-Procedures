# Agent 05 — Modal vs Drawer Decision Maker — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 05 — Modal vs Drawer Decision Maker  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view  
**Target Reduction:** 70%+ via smart use of Veil Drawer vs Modals

---

## 1. Current Clutter Diagnosis

Currently, almost everything is either inline (causing density) or in heavy right panels that don't disappear cleanly. There is no clear "when to use a temporary focused modal" vs "when to use the persistent Veil Drawer".

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer (Primary for workflow)
- All task-related deep work (form filling, evidence management, signing, certification, audit review) → Veil Drawer
- The Veil feels like "continuing the task in context" without leaving the list.

### 2.2 Move to Hover Cards / Previews
- Quick facts and status (as defined by Agent 04)

### 2.3 Move to Modals (Strategic and sparing)
Use modals only for:
- Focused, one-time actions that require full attention and should not feel like "part of the ongoing task" (e.g., full artifact zoom, bulk confirmations, legal-style signature review in certain cases, delete confirmations with consequences).
- Anything that needs to feel "separate" from the current workflow.

### 2.4 Remove or Collapse Entirely
- Many current inline expanded sections can become either Veil content or quick modals instead of always-visible.

### 2.5 React Component Opportunities
- `VeilDrawer` (persistent workflow context)
- `FocusModal` family (temporary high-focus overlays)
- Clear decision helper component or documentation for developers

---

## 3. Impact on Default View

By having two clear containers (Veil for workflow depth + Modals for focused interruptions), we avoid the current problem of everything fighting for space on the main screen.

This directly supports the clean list + contextual reveal model.

---

## 4. Glassmorphism Application (Veil Glass Rules)

- Veil Drawer: rich, contextual glass (the "veil")
- Modals: even more elevated glass treatment (stronger blur + borders) to signal "this is a focused moment"

---

## 5. Risks & Trade-offs

- Risk: Modal overuse (which can feel jarring) → Strict guidelines + review by Agent 05 + 14 before adding new modals
- Benefit: Much better mental model for users ("this is ongoing work" vs "this is a focused action")

---

## 6. Dependencies on Other Agents

- Agent 03: Veil must be excellent first
- Agent 04: Hover cards reduce the need for both drawers and modals
- Agent 07: Clear containment rules feed directly into this decision

---

## 7. Measurement & Validation Approach

- Track "how often users open the Veil vs open a modal" per surface
- Ensure no surface is using modals as a crutch for poor Veil design

---

## 8. Phase 1.1 Exit Recommendation

Publish the official **"Veil vs Modal Decision Framework"** (simple decision tree + examples) so the team has a shared language.

---

**Agent 05 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*