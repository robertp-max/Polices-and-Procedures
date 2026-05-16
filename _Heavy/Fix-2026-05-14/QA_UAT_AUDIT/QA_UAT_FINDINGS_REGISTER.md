# QA/UAT Findings Register (Updated – Accessibility & Declutter)

**Last Updated:** 2026-05-14 (Full Auto-Pilot – Continuing)

---

## New Findings – Accessibility Compliance

### Finding: Evidence Center & Workflow Execution Surfaces Have Significant Accessibility Gaps

**Severity:** P1 High

**Area:** Accessibility / Evidence Center / CES Workflow

**Details:**
- EvidenceCenterPage and CesEvidenceHierarchyPanel have basic `aria-label` coverage on filters but lack proper tree/grid roles, live regions, and robust keyboard navigation for the complex hierarchy.
- WorkflowExecutionPanel (the primary CES requirement/task drawer) has very weak dialog semantics, focus management, and ARIA structure despite being one of the most critical interactive surfaces.
- FormViewer and FormSigningWorkspace have some labeling but suffer from uncontrolled inputs and limited keyboard support for dynamic forms.
- Color contrast risks exist in dense views (consistent with the minor PM design token warning found in `verifyUiDesignSystem.ts`).
- No strong focus trapping or live region support for dynamic status changes (task completion, evidence upload, signing status).

**Evidence:**
- Created dedicated deep audit: `Accessibility_Compliance_Deep_Audit.md`
- Limited `aria-*`, `role`, and keyboard handler usage in the two highest-traffic complex components.
- UI Design System verification (0 FAILs, 1 minor WARN in PM views) confirms the design tokens are mostly good, but adoption in dense panels is inconsistent.

**Status:** OPEN — DEEP CODE INSPECTION COMPLETE

**Recommendation:** Prioritize ARIA roles, focus management, live regions, and keyboard navigation on EvidenceCenterPage, CesEvidenceHierarchyPanel, and WorkflowExecutionPanel. This will also help declutter the experience for all users.

---

## New Findings – Declutter & Task Model Simplification

### Finding: Task Generation Strategy Creates Structural Bloat and Visual Mess

**Severity:** P1 High

**Area:** Task Model / PM Experience / CES

**Details:**
- `deriveDefaultEventTasks` + `signerTaskFactory` produce high cardinality through layering: processFlow tasks + requiredForm tasks (partial dedup) + per-signer `SIGN-` tasks + approvals + minutes.
- A typical regulatory event easily generates 25–40+ projected tasks.
- Signer tasks are additive (not collapsed), leading to many small "Signature required – DON" items that only become actionable after the parent form.
- This directly contributes to the "too many objects all over the place and messy" feedback.
- Multiple overlapping "work to do" surfaces (WorkflowExecutionPanel, CES My Tasks, PM My Tasks, Evidence requirements, Audit Mode) amplify the clutter.
- The UI layer does a reasonable job mitigating the pain (clean design system result + Phase 23 passing), but cannot hide the underlying generation volume.

**Evidence:**
- Created focused proposal: `Declutter_Task_Model_Simplification_Proposal.md`
- Task identity verification passed cleanly (dedup logic works), but volume remains high by design.
- UI Design System verification passed (0 FAILs), confirming the problem is more in the data model than component quality.

**Status:** OPEN

**Recommendation:** Introduce composite "Form + Signers" requirement grouping in projectors and UI (keep fine-grained backend tasks for enforcement). Apply aggressive progressive disclosure and consolidate overlapping surfaces. This will significantly reduce perceived mess and improve both usability and accessibility.

---

## Updated Overall Picture

- Most automated verifications continue to pass (Task Identity OK, UI Design System clean, Evidence phases strong, Alignment 100%, BRAD PASS, eCIgn routes OK).
- The two newest high-impact areas (Accessibility gaps + Task model bloat / mess) are now documented with deep code analysis.
- These directly support and amplify the earlier P0/P1 findings on multi-signer eCIgn evidence defensibility and task redundancy.

All new documents have been added to the QA_UAT_AUDIT package and will be integrated into the Final Report.

Autopilot continues. I am ready to expand the accessibility audit to FormViewer/FormSigningWorkspace or produce the integrated final report when you want to move to closure. 

Just say the word.