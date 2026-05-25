# Agent 07 — Detail Containment Rules Enforcer — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 07 — Detail Containment Rules Enforcer  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Dense task execution view with FORM, EVIDENCE, SIGNATURES, REVIEW, AUDIT all expanded  
**Target Reduction:** Minimum 70% clutter reduction on default view

---

## 1. Current Clutter Diagnosis

The biggest problem is **lack of containment rules**. Almost every piece of task-related information is currently treated as "must be visible on the default view." This leads to the massive stacked sections we see.

**Main issue:** No clear boundary between "list-level information" and "detail-level information."

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer (Default for most content)
**Rule:** Anything that is not required for scanning the list or deciding the next immediate action goes in the Veil Drawer.

Content that **must** live in the Veil Drawer:
- Full form fields and editing
- Supporting evidence lists and previews
- Signature rosters and signing flows
- Certification checklists and history
- Audit / lock requirements and trails
- Comments / activity log (unless very recent and critical)

### 2.2 Move to Hover Cards / Previews
- Evidence count + quick visual (thumbnails on hover)
- Status history on hover
- Owner / assignee details

### 2.3 Move to Modals
- "View full artifact" deep inspection
- Bulk operations

### 2.4 Remove or Collapse Entirely
- All technical ID strips from the default list view
- Redundant progress bars that duplicate status
- "Keep checklist visible" persistent UI (move into Veil)

### 2.5 React Component Opportunities
- `DetailSection` (standard collapsible glass section used inside VeilDrawer)
- `EvidenceChip` (count + hover)
- `ContainmentRule` documentation component (for future developers)

---

## 3. Impact on Default View

The default view becomes a true **list**, not a partial execution screen.

Only these elements remain visible per task:
- Selection checkbox
- Title + one-line description
- Status
- Due date
- Owner
- 2–3 primary actions max

Everything else is behind the Veil or hover.

**Expected reduction contribution:** ~35–40% of the total 70%+ target comes from strict containment rules alone.

---

## 4. Glassmorphism Application (Veil Glass Rules)

The Veil Drawer is the **main place** where V3 glassmorphism lives in this new minimal system.

- Use frosted translucent dark glass with strong 4-sided borders (per Agent 03 spec)
- Internal sections use lighter `DetailSection` (subtle glass on glass)
- Background list gets a soft scrim when the drawer is open, not full glass treatment

---

## 5. Risks & Trade-offs

- Risk: Over-containment (users can't find things) → Mitigate with excellent search inside the Veil and consistent section ordering
- Risk: Power users who want "everything at a glance" → Offer "Pin to side" mode as an advanced option (not default)
- Trade-off: More intentional clicks, but dramatically better focus and speed for the majority of users

---

## 6. Dependencies on Other Agents

- Agent 03: The Veil Drawer must be the single, excellent container (no competing right panels)
- Agent 06: Minimal list definition must align with these containment rules
- Agent 14: These rules must be applied consistently across every surface (CES, Evidence, Calendar, Policy, etc.)
- Agent 02: Progressive disclosure logic must reference this containment matrix

---

## 7. Measurement & Validation Approach

- Create a "Containment Matrix" table (what lives where) that Agent 16 can use for validation
- Count how many current visible elements move behind the Veil vs stay on list
- Target: At least 65–70% of current on-screen elements per task move out of the default view

---

## 8. Phase 1.1 Exit Recommendation

Before Phase 2:
- Publish the official "V3 Veil Containment Matrix" (one source of truth)
- Get sign-off from Agents 02, 03, 06, 14, and 16
- Use the matrix to drive the component and token work in Phase 2

This matrix will become one of the most important documents for keeping the V3 Veil system consistent long-term.

---

**Agent 07 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*