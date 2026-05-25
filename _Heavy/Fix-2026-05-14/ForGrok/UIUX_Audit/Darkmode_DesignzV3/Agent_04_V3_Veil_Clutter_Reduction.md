# Agent 04 — Hover Card & Preview Strategist — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 04 — Hover Card & Preview Strategist  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view  
**Target Reduction:** Minimum 70% clutter reduction via smart hover previews

---

## 1. Current Clutter Diagnosis

A lot of the visual noise comes from users needing to see small pieces of information (evidence thumbnails, status history, who last touched it, etc.) but having to open heavy drawers or scroll through long lists just for that.

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer
Keep the Veil as the deep container, but reduce how often users need to open it for simple facts.

### 2.2 Move to Hover Cards / Previews (High Leverage)
- Evidence count → hover shows 3–4 thumbnail previews + total count
- Status → hover shows last 3 status changes with timestamps
- Owner/Assignee → hover shows role, contact, last active
- Due date → hover shows full timeline + escalation history
- Signature status → hover shows who has signed / pending

This removes the need to open the drawer for ~30–40% of common "just checking" moments.

### 2.3 Move to Modals
Only for actions that require focused attention (signing, detailed form editing, artifact review).

### 2.4 Remove or Collapse Entirely
- Remove persistent evidence lists and signature tables from the default view
- Collapse long history sections

### 2.5 React Component Opportunities
- `HoverPreviewCard` (configurable, glass-treated, fast)
- `EvidenceHoverPreview`
- `StatusHistoryHover`
- `PersonHoverCard`

These should be lightweight and appear in <150ms.

---

## 3. Impact on Default View

The default list becomes very clean because many "I just wanted to check..." moments are solved by hover instead of drawer or expanded content.

This is one of the highest-ROI ways to achieve the 70% feel without losing information.

---

## 4. Glassmorphism Application (Veil Glass Rules)

Hover cards should use light, fast glass (subtle blur + border) — not as heavy as the main Veil Drawer.

---

## 5. Risks & Trade-offs

- Risk: Hover fatigue on mobile (mitigate: tap to show on touch devices, hover on desktop)
- Benefit: Dramatically better desktop experience for power users who scan many tasks

---

## 6. Dependencies on Other Agents

- Agent 03: Veil Drawer remains the "deep" container
- Agent 06: Minimal list rows must have clear hover targets
- Agent 08: These hover components must be reusable and performant

---

## 7. Measurement & Validation Approach

- Track how often users open the Veil vs how often they use hover
- Measure reduction in "time to answer simple questions about a task"

---

## 8. Phase 1.1 Exit Recommendation

Publish a "Hover vs Veil Decision Matrix" so every team knows exactly when to use hover previews vs opening the drawer.

---

**Agent 04 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*