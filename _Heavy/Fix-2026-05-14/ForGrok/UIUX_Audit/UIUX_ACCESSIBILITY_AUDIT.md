# UI/UX Accessibility Audit (WCAG 2.2 AA Focus)
**Date**: 2026-05-15  
**Primary Sources**: Prior QA_UAT_AUDIT/Full_App_Accessibility_Compliance_Audit.md + Accessibility_Compliance_Deep_Audit.md (FormViewer + FormSigningWorkspace deep dive) + this audit's agent findings + grep for aria-*/role=/tabIndex/label.

**Overall**: Partial compliance. Strong foundation (focus-visible gold/orange rings, reduced-motion, some ARIA in ui/ primitives and FormSigningWorkspace dialogs) but **high-risk gaps in regulated surfaces** (eCign signing, CES execution, evidence, policy detail, training). Prior 2026-05-14 deep audits flagged uncontrolled inputs, limited keyboard in dynamic forms, labeling, tab order.

---

## Color Contrast

- **Good**: Focus rings (gold/orange on dark/light), many --ci-text on proper backgrounds, teal #007970 on white often passes.
- **Risks**: Hardcoded GVGB/Shared light mode (#1F1C1B on white, gray-700 on gray-50, #524048 subtle) + mixed theme (shell dark glass vs light policy detail) can drop below 4.5:1 in some combinations. Legacy StatusBadge dark-assuming colors. eCign NAVY/ORANGE on paper sometimes low contrast. Small text (9px tracking in FormSigning tables, badges) fails at small sizes.
- **Recommendation**: Systematic contrast audit (axe + manual) in light + dark + mixed. Enforce in tokens. Fix GVGB/Shared hardcoded + small text.

---

## Keyboard Navigation + Tab Order + Focus Management

- **Good**: ui/Tabs (aria roles), some FormSigningWorkspace keyboard (added in GVGB refinement), CommandCenterLayout nav.
- **Gaps** (high risk):
  - FormViewer/FormSigningWorkspace: Dynamic/conditional sections, uncontrolled inputs, signing flow (signature pad canvas, multi-signer), dialog focus trap not always robust (prior deep audit).
  - CES boards/kanban + WorkflowExecutionPanel: Tab order through cards, drag (or alternative), status updates.
  - Evidence hierarchy (CesEvidenceHierarchyPanel): Tree navigation keyboard.
  - Dense tables (DataGrid partial, many raw tables in GVGB/Shared/Print/FormSigning): Column headers, row navigation.
  - Modals/Drawers (RightDrawer, FormSigningWorkspace as dialog, UnitDrawer, PM overlays): Focus trap, return focus.
  - Journey/StagingM01 carousel: Keyboard hints md+ only; complex absolute positioning breaks tab order.
  - iAdministrator custom tabs (StudioTabs), admin identity tables.
- **Recommendation**: Enforce arrow keys + roving tabIndex in all Tabs (ui/Tabs + consumers). Add focus trap to all drawers/modals. Keyboard testing on signing, CES board, evidence tree, carousel. Document tab order in complex flows.

---

## ARIA Roles, Labels, Live Regions

- **Good**: Some dialog roles in FormSigningWorkspace, tablist in ui/Tabs, status in CiStatusBadge.
- **Gaps**:
  - Icon-only buttons (many in nav, tables, signing, CES, iAdmin) missing aria-label or visible text.
  - Form inputs in FormViewer (dynamic sections) — labeling issues flagged in prior audit.
  - Status changes (signing complete, gate evaluated, task updated, evidence attached) lack aria-live or role=status in many places.
  - Evidence hierarchy tree (roles, expanded/selected states).
  - CES board cards, urgency/phase badges.
  - Error messaging (mostly inline rose/amber without role=alert).
- **Recommendation**: Audit all icon-only + dynamic forms. Add live regions for status. Proper tree ARIA for evidence. Role=alert on errors.

---

## Form Labels + Error Messaging + Validation

- **Gaps** (high in eCign signing): Uncontrolled inputs in FormViewer (prior audit), dynamic/conditional sections (OrgChart, signatures, multi-signer), labeling in FormSigningWorkspace.
- **Recommendation**: Controlled inputs where possible + explicit labels. Error messaging with role=alert + aria-describedby. Validation on submit + inline.

---

## Motion Sensitivity + Animations

- **Good**: Reduced-motion CSS in index.css; some transitions use --ease-*.
- **Gaps**: StagingM01 complex transforms + auto-play + video; many custom keyframes (gvgb-enter); loading spinners everywhere; hover lifts (some disabled by flat rule).
- **Recommendation**: Respect prefers-reduced-motion for all (carousel, transitions, spinners). Provide pause/stop for auto-play in StagingM01.

---

## Screen Reader Risks

- **High-risk surfaces**: FormViewer/FormSigningWorkspace (dynamic forms, signing, multi-signer review of static snapshot), CES board (status, drag), evidence hierarchy (tree), long policy content (GVGB/Shared headings), Journey module player + quizzes, Onboarding V2 gates/audit timeline.
- **Recommendation**: SR testing (VoiceOver + TalkBack) on signing flow, CES board, evidence, V2 batch/activation, policy detail. Add headings, labels, live regions, alt text for icons/images in packets.

---

## Icon-Only Buttons, Touch Targets, Other

- Many icon-only without labels (nav, tables, signing, CES, iAdmin).
- Touch targets <44px in tables, badges, small buttons (mobile + accessibility overlap).
- Some custom scrollbars, glass effects may affect SR.

---

## Prior Audit Alignment

This audit confirms and expands the 2026-05-14 QA_UAT Accessibility_Compliance_Deep_Audit (FormViewer + FormSigningWorkspace deep dive) and Full_App_Accessibility_Compliance_Audit findings:
- Uncontrolled inputs, limited keyboard in dynamic forms/signing, labeling gaps in multi-signer.
- Need for focus management in dialogs, ARIA on status, contrast in mixed themes.

---

## Recommendations (see Redesign Roadmap Phase 5)

1. Remediation sprint on FormViewer + FormSigningWorkspace (labels, keyboard, dialogs, multi-signer, uncontrolled inputs) — highest legal risk.
2. CES board/table keyboard + ARIA.
3. Evidence hierarchy tree.
4. Global: Enforce focus trap, live regions for status, aria-label on icon-only, role=alert on errors, contrast audit in all themes, reduced-motion for all animations.
5. Testing: axe + WAVE + manual keyboard + VoiceOver/TalkBack on priority flows; document + track to closure.
6. Integrate into CI (axe in Playwright tests).

**Target**: WCAG 2.2 AA pass on all audited surfaces (documented). Prior gaps closed. No new surfaces introduced without accessibility review.