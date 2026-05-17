# Accessibility Gap List – High-Risk Surfaces

**Source:** Original `UIUX_ACCESSIBILITY_AUDIT.md` + `ACCESSIBILITY_COMPONENT_CHECKLIST.md`

**Purpose:** Track specific accessibility risks that must be addressed during reconstruction.

---

## Top Priority Surfaces (Must be resolved by end of Phase 2)

| Surface                  | Key Risks Identified in Original Audit                          | Severity | Owner | Target Phase | Status |
|--------------------------|------------------------------------------------------------------|----------|-------|--------------|--------|
| FormViewer + Signing     | Keyboard traps, missing ARIA in multi-signer flows, contrast issues in dark mode | High     | A11y Lead + Signing Surface Owner | Phase 1-2 | Open |
| CES Board / Kanban       | Dense tables with poor focus management, color-only status, touch target issues | High     | A11y Lead + CES Surface Owner | Phase 2 | Open |
| Evidence Hierarchy       | Complex nested lists, poor screen reader support for attachments | Medium-High | A11y Lead + Evidence Surface Owner | Phase 2 | Open |
| Journey V1 Carousel      | Absolute positioning, fragile keyboard navigation, motion without reduced-motion support | High     | A11y Lead + Journey Surface Owner | Phase 1 decision | Open |
| Dashboard KPI Cards      | Color-only status, insufficient contrast in light mode on some cards | Medium   | A11y Lead + Dashboard Surface Owner | Phase 2 | Open |

---

## Notes

- This list must be updated after every surface reconstruction.
- Any surface going through Phase 3 reconstruction must close its related gaps before sign-off.
- The Accessibility Component Checklist must be passed by all canonical primitives.
- Named individuals for each owner role are assigned in `PHASE_1_READINESS_GATE.md` at kickoff.