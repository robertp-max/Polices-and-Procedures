# Agent 06 — Task List Minimal Core Defender — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 06 — Task List Minimal Core Defender  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view (the one with many expanded sections)  
**Target Reduction:** Minimum 70% clutter reduction on default view

---

## 1. Current Clutter Diagnosis

The current default view is trying to be both a **list** and a **detail/execution surface** at the same time. This is the root cause of the extreme density.

Users are forced to scan through forms, evidence lists, signatures, certification checklists, and audit trails just to decide which task to work on.

---

## 2. 70% Reduction Strategy

### 2.4 Remove or Collapse Entirely (Core Decision)

**The absolute minimum that should remain visible in the default task list view:**

For each task row, show **only**:
- Checkbox (for bulk actions)
- Task title (1 line, max 2 if very necessary)
- One very short description / context line (optional, but strongly recommended)
- Status (clear visual pill)
- Due date (relative + color coding)
- Owner / assignee avatar (small)
- 1–2 primary quick actions max (e.g., "Execute" or "Open")

**Everything else must be removed from the default list view.**

### 2.1 Move to Right-Side Veil Drawer (Primary home for detail)
- All form fields and execution content
- Supporting evidence (lists + uploads)
- Signatures
- Review / Certification
- Audit / Lock history
- Child tasks / dependencies
- Full comments / activity

### 2.2 Move to Hover Cards / Previews
- Quick facts: evidence count + thumbnails, status history, assignee details

### 2.3 Move to Modals
- Deep focused actions (full artifact viewer, bulk operations, etc.)

### 2.5 React Component Opportunities

**New core components needed:**
- `TaskRowMinimal` (the new atomic list item)
- `VeilDrawer` (the single place for all execution detail)
- `EvidenceCountChip` (with hover)
- `StatusPill` (with optional hover history)
- `QuickActionGroup` (max 2–3 actions)

---

## 3. Impact on Default View

This is the single biggest lever for the 70%+ reduction.

The default view transforms from a heavy, overwhelming execution dashboard into a clean, scannable task queue.

Users can now triage 20–30 tasks in the time it used to take to understand 3–4.

---

## 4. Glassmorphism Application (Veil Glass Rules)

The default list must stay **minimal and flat**. No decorative glass, heavy borders, or visual noise.

All rich glass treatment lives exclusively inside the `VeilDrawer` and modals.

---

## 5. Risks & Trade-offs

- Risk: Some users will initially feel "information is missing" → Mitigate with excellent hover previews and very fast Veil opening.
- Risk: Power users who liked having everything visible → Offer an advanced "Dense Mode" toggle (not default).
- Benefit: The vast majority of users (especially those managing high volume) will experience dramatically lower cognitive load and faster decision making.

---

## 6. Dependencies on Other Agents

- Agent 02 (Progressive Disclosure) — must align on the exact boundary
- Agent 03 (Veil Drawer) — the Veil must be excellent and fast
- Agent 07 (Containment Rules) — these rules feed directly into the minimal row definition
- Agent 08 (Components) — `TaskRowMinimal` is one of the highest-ROI components
- Agent 14 (Consistency) — this minimal row pattern must be used everywhere

---

## 7. Measurement & Validation Approach

- Count of visible elements per task row (before vs after)
- User testing: "How quickly can you find a task that needs attention?"
- Agent 16 validation against the 70% target

---

## 8. Phase 1.1 Exit Recommendation

Lock the final definition of `TaskRowMinimal` (including exact fields, spacing, and visual treatment) and get multi-agent sign-off before any implementation begins.

This component will become the foundation of the entire V3 Veil system.

---

**Agent 06 Signature:** Phase 1.1 Execution — 2026-05-18

*This is one of the most important single decisions in the entire Phase 1.1 effort. The minimal task row definition will drive the majority of the 70%+ clutter reduction.*