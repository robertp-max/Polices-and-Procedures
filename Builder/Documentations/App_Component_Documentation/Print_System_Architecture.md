# Print System Architecture

## 1) Print Surfaces

## Policy print

- Route: `/print/:policyId`
- Component: `src/policy/pages/PrintPage.tsx`
- Data source: `getPolicyContent(policyId)` from `src/policy/data/policyContentMap.ts`
- Behavior:
  - policy render to print-friendly document shell
  - route-level standalone view (outside `CommandCenterLayout`)

## Form print

- Route: `/forms/:formId/print`
- Component: `src/policy/pages/FormPrintView.tsx`
- Data source:
  - `FORMS_DATASET`
  - `buildFormContent(record)`
  - shared renderer `FormBody`
- Behavior:
  - page-level print CSS with orientation-aware `@page`
  - auto print when standalone
  - suppress auto print when embedded in hidden iframe

## GV-GB custom print

- Route: `/print/GV-GB-001`
- Component: `src/policy/pages/GVGBPrintDocument.tsx`
- Purpose: dedicated full policy print format

## Appendix print

- Route: `/print/GV-GB-001/appendix/:appendixId`
- Component: `src/policy/pages/GVGBAppendixPrint.tsx`
- Purpose: dedicated appendix print output

---

## 2) Shared Print Logic

## `printForm(formId)` (`src/policy/utils/printForm.ts`)

- Creates hidden iframe with source `/forms/${formId}/print`.
- On iframe load:
  - waits a short settle delay
  - calls iframe `print()`
- Cleans up iframe:
  - via `afterprint` event
  - or 60-second timeout fallback

Reasons:
- avoids opening new browser tab
- centralizes print orchestration

---

## 3) CSS Enforcement

Global print and related classes are defined in:
- `src/index.css`
- plus page-local print styles in `FormPrintView.tsx`

Key enforcement mechanisms:
- hide interaction chrome (`.no-print`, `.ia-no-print`)
- print-only sections (`.policy-print-only`)
- table layout hardening to prevent right-edge truncation
- color rendering enforcement (`print-color-adjust`)
- page constraints (`@page Letter portrait/landscape`)

Special handling:
- iAdministrator print isolation class: `.ia-form-print-root` and associated `body:has(...)` behavior.

---

## 4) PDF Naming / Output Semantics

- Form output naming:
  - UI download in `FormViewer` exports `${formId}.html`.
  - Browser print dialog naming is browser-managed, but route and title include `${formId}`.
- Policy print naming:
  - document title/policy route influences browser-generated filename.
- Dedicated GV-GB print routes provide deterministic path-based output context.

`Needs confirmation`:
- A strict centralized PDF filename policy (beyond browser defaults) is not visibly enforced in current code path.

---

## 5) Appendix and Org Chart Handling

## Appendix handling

- Dedicated appendix print route and component for GV-GB policy appendices.
- Prevents generic print template conflicts.

## Org chart handling

- In `FormViewer`, `GV-FM-003` section 2 is replaced by dedicated `OrgChartSection` tree renderer.
- Ensures the org chart is render-safe for print with break controls.

---

## 6) Constraints and Rules

1. Specific routes are declared before generic print route to avoid route shadowing.
2. Standalone print views are outside `CommandCenterLayout`.
3. Embedded print prevents duplicate dialogs.
4. Table-heavy forms use fixed-layout print table rules.
5. Cleanup guards prevent hidden iframe accumulation.

---

## 7) Failure Modes / Risks

- Browser-specific print engines can still vary pagination.
- If static assets/fonts load slowly, first print may clip before settle delay (`Needs confirmation`: whether delay should be configurable).
- Policy content map coverage may not include all policy IDs for print.

