# QA/UAT Recommendations (Updated – Accessibility & Declutter)

**Last Updated:** 2026-05-14

---

## New Approved Recommendations

### Accessibility Hardening (High Priority)

1. **Evidence Center & Hierarchy Panel Accessibility**
   - Add proper `role="tree"` / `role="treeitem"` or `role="grid"` structure with `aria-expanded`, `aria-level`, and keyboard arrow navigation to CesEvidenceHierarchyPanel.
   - Add `aria-live` regions for dynamic evidence/status updates.
   - Improve focus management when opening right-side detail panels (move focus in, trap if modal-like, return focus on close).

2. **WorkflowExecutionPanel (Main CES Drawer) Accessibility**
   - Add `role="dialog"`, `aria-modal`, and proper `aria-labelledby` to the right-side drawer.
   - Implement focus trapping and robust focus return.
   - Add list/grid semantics and state announcements for requirement rows, task lists, and inline FormViewer.

3. **Form-Related Surfaces**
   - Improve keyboard support and labeling in FormViewer and FormSigningWorkspace (especially for dynamic/conditional sections and uncontrolled inputs).
   - Ensure consistent live region announcements for form status changes and signature progress.

4. **Design Token Adoption**
   - Fix the `pm.slate-pin` warning in `PmViews.tsx` (migrate to `<GlassPanel>` + `--ci-*` tokens).
   - Run a full contrast audit on dense Evidence, Audit, and PM cards.

These directly improve both accessibility compliance and the "messy / too many objects" perception for all users (especially keyboard + screen reader users).

### Declutter & Task Model Simplification (High Priority)

1. **Composite "Form + Signers" Requirement Grouping (Core Recommendation)**
   - In task projectors (`taskProjectionCore.ts` and related), introduce optional composite grouping for "Form + its required Signers".
   - Show as single card by default: "Form Complete + X/Y Signatures".
   - Allow expansion for individual signer tasks when needed.
   - Apply this grouping first in My Tasks (CES + PM), Sprint/Kanban, Gantt, Evidence Center, and WorkflowExecutionPanel.

2. **Reduce Visible Task Cardinality**
   - Target reduction from ~25–40+ tasks per complex event down to ~10–15 top-level items through grouping and progressive disclosure.
   - Keep all fine-grained deterministic tasks in the backend for enforcement and audit.

3. **Consolidate Overlapping "Work to Do" Surfaces**
   - Reduce duplication between WorkflowExecutionPanel, CES My Tasks, PM My Tasks, Evidence requirements, and Audit Mode.
   - Aim for one authoritative "Requirements & Progress" view per event with strong filtering and grouping.

4. **Stronger Progressive Disclosure**
   - Evidence Center, Audit Mode, and right-side panels: Summary first, details on demand.
   - This will significantly reduce visual noise and "too many objects" feeling.

5. **Signer Task Presentation**
   - In most PM and list views, present signer tasks as sub-items, status badges, or expandable sections under the parent form rather than as peer tasks.

---

## Integration With Previous Recommendations

These new items directly support and amplify the earlier surgical fixes for:
- P0-01 (Multi-signer artifact identity) — cleaner evidence surfaces will make the single canonical artifact more visible and usable.
- Task bloat / redundancy — the composite grouping proposal is the practical UI-level solution to the generation volume problem.
- eCIgn legal defensibility — better accessibility and less clutter in Evidence/Audit directly improves the defensibility and usability of signed evidence for all staff.

All recommendations remain pre-approved for future work under the QA/UAT charter.

---

**Next:** I will integrate the new accessibility and declutter findings into the Final Report and continue the audit (including deeper FormViewer accessibility if desired) until we have high confidence with no remaining high-value recommendations.

Autopilot remains fully active.