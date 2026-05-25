# Agent 15 — User Scanning & Action Path Designer — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 15 — User Scanning & Action Path Designer  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view  
**Target Reduction:** Minimum 70% clutter reduction while optimizing the most common user journeys

---

## 1. Current Clutter Diagnosis

The current view forces users to scan through a wall of information even when they just want to know "what needs my attention and what should I do next?"

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer
- All deep detail (forms, evidence, signatures, certification) → Veil Drawer
- This removes the majority of scanning noise from the primary list view.

### 2.2 Move to Hover Cards / Previews
- Quick facts on hover so users don't need to open the drawer for simple questions.

### 2.3 Move to Modals
- Rare deep inspection flows.

### 2.4 Remove or Collapse Entirely
- Remove everything that is not part of the primary scanning + decision loop.

### 2.5 React Component Opportunities
- `TaskRowMinimal` optimized for fast visual scanning (strong status, clear due date, minimal text)
- `QuickActionGroup` (max 3 most common actions)
- `VeilDrawer` with smart default section open based on task state

---

## 3. Impact on Default View

The new default view is optimized for the most common paths:
- "Scan my tasks" → clean minimal list
- "See what needs attention" → status + due date stand out
- "Take the next action" → quick actions visible without opening anything
- "Get more details" → one click opens the Veil Drawer

This design directly supports the 70% reduction while making the primary user journeys faster.

---

## 4. Glassmorphism Application (Veil Glass Rules)

The Veil Drawer appears only when the user actively chooses to see more. This respects the "minimal by default" philosophy while still providing beautiful glass when needed.

---

## 5. Risks & Trade-offs

- Risk: Over-optimizing for average users and hurting edge cases → Mitigate by making the Veil powerful and fast
- Benefit: The majority of users will experience a dramatically calmer and faster interface

---

## 6. Dependencies on Other Agents

- Agent 06: Minimal row must support fast scanning
- Agent 03: Veil must feel fast and delightful to open
- Agent 07: Containment rules must protect the scanning path

---

## 7. Measurement & Validation Approach

- Measure "time to decide next action" on the new minimal list vs old dense view
- Track how often users open the Veil vs how often they used to scroll through dense content

---

## 8. Phase 1.1 Exit Recommendation

Publish a short "Primary User Paths" document showing the three most common journeys and how the new minimal + Veil pattern supports them better than the old dense view.

---

**Agent 15 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*