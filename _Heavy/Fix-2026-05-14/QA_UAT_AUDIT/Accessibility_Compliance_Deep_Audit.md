# Accessibility Compliance Deep Audit (Evidence Center + Workflow Execution Surfaces)

**Date:** 2026-05-14  
**Scope:** Focused deep audit on the two highest-risk complex surfaces for a compliance system:  
- EvidenceCenterPage + CesEvidenceHierarchyPanel  
- WorkflowExecutionPanel (the main CES requirement/task drawer)

**Overall Rating:** Partial / Inconsistent Implementation  
**Risk Level:** Medium-High (especially for a regulated Home Health + evidence system)

---

## 1. Evidence Center & Hierarchy Panel (EvidenceCenterPage.tsx + CesEvidenceHierarchyPanel.tsx)

**Positive Findings:**
- Many filter inputs have `aria-label` (Event ID, Form ID, Policy ID, Workflow ID, Task ID, Evidence ID).
- Some close/dismiss buttons have `aria-label`.
- Basic `onKeyDown` for Enter-to-submit on filters.
- Some focus styles (`focus:border-cyan-300/75`).

**Critical Gaps:**

- **Hierarchy is not exposed as an accessible tree or grid.** The complex nested evidence/requirement structure in `CesEvidenceHierarchyPanel` uses custom divs and classes with almost no `role="tree"`, `role="treeitem"`, `aria-expanded`, `aria-level`, or proper keyboard navigation (arrow keys for tree traversal).
- **No live regions** for dynamic updates (new evidence appearing, status changes, filter results). Screen reader users will miss important changes.
- **Drawer/panel focus management is weak.** When opening the right-side evidence detail panel, focus is not programmatically moved into it, and there is no clear escape/return behavior documented in code.
- **Color contrast risk in dense views.** Combined with the known PM layer design token issue (slate pinning), many evidence rows, status badges, and metadata use subtle gray/slate distinctions that are likely to fail WCAG AA in real usage.
- **Filter experience is linear but not grouped.** While labels exist, there is no clear landmark or heading structure grouping the many filter fields, making it tedious for keyboard + screen reader users to navigate the filter bar efficiently.
- **No skip links or quick navigation** within the long evidence lists or hierarchy.

**Impact:** A user relying on a screen reader or keyboard-only navigation will struggle significantly with the Evidence Center — the very place where compliance evidence is reviewed and audited.

---

## 2. WorkflowExecutionPanel (The Core CES Drawer)

**Positive Findings:**
- One `onKeyDown` for Enter-to-submit notes.
- A few `aria-label` on close buttons and clear selection.

**Critical Gaps (this surface is particularly weak):**

- The main drawer itself (`right-side drawer` at line 1757) has almost no dialog semantics (`role="dialog"`, `aria-modal`, `aria-labelledby`).
- No evidence of focus trapping when the drawer opens (very important for complex requirement/task workflows).
- Requirement rows, task lists, and the inline FormViewer are rendered with heavy custom div structures and very little ARIA for list/grid semantics or state (expanded/collapsed requirements, selected task, etc.).
- When switching between "Complete Form", "Upload Evidence", "Request Signature", etc., there are dynamic content changes with no live region announcements.
- The FormViewer rendered inside the drawer inherits the general FormViewer accessibility gaps (uncontrolled inputs in many places, limited keyboard support for complex dynamic forms).
- Focus return after closing the drawer or completing a requirement is not robust.

**Impact:** This is one of the primary working surfaces for compliance staff. Poor accessibility here directly affects the ability to complete regulatory work for users with disabilities and creates operational and legal risk.

---

## 3. Cross-Cutting Accessibility Issues Observed

- **Inconsistent use of design system components** for accessible patterns (the slate palette warning in PM views is a symptom of this broader issue).
- Limited use of `aria-live` regions for dynamic status updates (task completion, evidence upload, signature status).
- Keyboard navigation in dense lists (tasks, evidence, audit events) is mostly absent beyond basic tabbing.
- Color contrast and visual affordances in high-density areas (especially Evidence and PM views) are at risk.
- Form-related surfaces (FormViewer + SigningWorkspace) have some labeling but suffer from the uncontrolled input pattern and complex dynamic sections, making reliable navigation harder.

---

## 4. Risk Summary for a Home Health Compliance System

- Evidence review and audit workflows are core compliance activities. Inaccessible surfaces here create both operational friction and potential regulatory/compliance risk.
- The combination of high task cardinality (bloated object count) + weak accessibility makes the system particularly difficult for keyboard + screen reader users.
- Many of the "too many objects / messy" complaints from users will be significantly amplified for assistive technology users.

---

**Recommendation (Accessibility):** Treat accessibility as a first-class architectural concern for the next phase of work on Evidence Center, WorkflowExecutionPanel, and the PM task surfaces. Prioritize proper ARIA patterns, focus management, live regions, and keyboard navigation on these two high-traffic complex areas.

This audit can be expanded to other surfaces (FormViewer deep dive, AuditModePage, Calendar views, etc.) if requested.