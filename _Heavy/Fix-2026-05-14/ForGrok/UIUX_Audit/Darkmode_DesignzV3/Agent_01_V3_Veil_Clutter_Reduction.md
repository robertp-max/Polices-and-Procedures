# Agent 01 — Information Density Auditor — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 01 — Information Density Auditor  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view (multiple expanded sections: FORM, SUPPORTING EVIDENCE, SIGNATURES, REVIEW/CERTIFICATION, LOCK/AUDIT + persistent task list below with heavy cards)  
**Target Reduction:** Minimum 70% clutter reduction on default view

---

## 1. Current Clutter Diagnosis

The current default view for task execution is extremely dense. It displays:

- Heavy task header with 8+ tags, multiple action buttons, and technical ID strips
- Large "TASK EXECUTION REQUIREMENTS" container with 5 major expanded sections (FORM, SUPPORTING EVIDENCE, SIGNATURES, REVIEW/CERTIFICATION, LOCK/AUDIT), each containing multiple cards, lists, progress indicators, and buttons
- Persistent secondary task list with 4+ dense cards below, each showing full meta, status, and actions
- Multiple teal banners, checklists, and "keep visible" affordances

**Estimated current clutter level:** 85–90% (far too much competing visual and cognitive information on first load).

**Main clutter sources identified:**
- Always-expanded multi-section requirement blocks
- Redundant technical chrome and ID strips
- Full evidence and signature lists visible by default
- Overlapping task list + execution context on the same screen
- High number of interactive elements (buttons, links, progress bars) per task

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer (Primary)
- Entire FORM content and fields
- Full SUPPORTING EVIDENCE lists and previews (keep only count + quick view chip)
- SIGNATURES roster and signing flows
- REVIEW / CERTIFICATION history and checklist
- LOCK / AUDIT trail and requirements

### 2.2 Move to Hover Cards / Previews
- Evidence item quick previews on hover over count
- Status change timeline on hover
- Assignee / owner details

### 2.3 Move to Modals
- "View Artifact" deep flows
- Bulk actions or advanced filters

### 2.4 Remove or Collapse Entirely
- Remove the giant "TASK EXECUTION REQUIREMENTS" header box from the list view
- Collapse secondary task cards to title + one-line description + status only
- Remove persistent technical ID strips and redundant progress from default list
- Eliminate duplicated action buttons

### 2.5 React Component Opportunities
- `TaskRowMinimal` (title + brief + status + due + quick actions only)
- `EvidenceCountChip` (with hover preview)
- `StatusBadgeWithHistory`
- `VeilDrawer` (reusable, glass-treated, configurable sections)

---

## 3. Impact on Default View

After changes, the default view becomes a clean, scannable list of tasks showing only:
- Checkbox
- Task title + one-sentence description
- Status pill
- Due date
- Owner avatar
- Quick actions (at most 2–3)

**Expected visual reduction:** 78–82% (exceeds 70% minimum).

The screen transforms from "everything visible and competing" to "calm list + summon details when needed."

---

## 4. Glassmorphism Application (Veil Glass Rules)

Glassmorphism should be **restrained and contextual**:
- Used primarily inside the Veil Drawer (frosted translucent dark glass with luminous 4-sided borders)
- Subtle scrim on the background list when the drawer is open (not full glass on the list itself)
- No decorative glass on the default task list — keep it pure minimal dark

This supports the "Veil" metaphor: the glass appears only when the drawer (veil) is summoned.

---

## 5. Risks & Trade-offs

- Risk: Users may initially feel information is "hidden" (mitigate with excellent empty states, onboarding, and hover previews)
- Risk: Power users who liked having everything visible may resist (provide keyboard shortcuts and "keep drawer pinned" option as escape hatch)
- Trade-off: Slightly more clicks to see details, but massive gain in focus and scanning speed for the primary list view

---

## 6. Dependencies on Other Agents

- Strong dependency on Agent 03 (Veil Drawer must be excellent and feel native)
- Agent 02 (Progressive Disclosure rules must be consistent across surfaces)
- Agent 06 (Minimal Core definition is the foundation of the 70% claim)
- Agent 08 (new minimal components must be built to support the clean list)
- Agent 14 (consistency of the new pattern across all pages)

---

## 7. Measurement & Validation Approach

**Proposed metrics (owned by Agent 16):**
- DOM node count on default task list view (target: ≥70% reduction)
- Visual element count (cards, buttons, text blocks, icons)
- Information density score (visible data fields per task on first load)
- Time-to-first-action (how fast a user can scan and decide)
- User-reported cognitive load (quick in-product survey)

Before/after comparison using the provided screenshot as baseline.

---

## 8. Phase 1.1 Exit Recommendation

Before moving to implementation:
- Agent 06 must publish the final "Minimal Task Row" definition
- Agent 03 must deliver the Veil Drawer primitive spec + tokens
- Agent 16 must publish a signed "70% Reduction Validation Plan" with the metrics above

This phase must produce a clear, measurable definition of what "70% less cluttered" looks like in the V3 Veil Glass language.

---

**Agent 01 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*