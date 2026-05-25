# Phase 2.1 — Additional Improvements & Constraints

This document contains extra guidance and improvements recommended for the build.

## Core Constraints (Non-Negotiable)

- Follow **V3 Veil Glass Theme Tokens Spec v1.1** exactly (especially stronger glass values and broken line nav).
- Follow **V3 Veil Drawer Behavior Spec v1.1** exactly (two-layer sequential behavior, merged shell).
- All new code must use the new V3 token system — **zero hard-coded colors or blur values**.
- Dark mode is the primary experience. Light mode must look premium but is secondary.
- The UI Staging environment must remain isolated from production pages until primitives are approved.

## Recommended Improvements (Please Implement Where Practical)

1. **Strong Component Organization**
   - Create a dedicated folder: `src/components/v3/` or `src/ui/v3/`
   - Keep staging code completely separate (`src/ui-staging/`)

2. **Fidelity Guardrails**
   - Every component file must start with the V3 Fidelity comment block.
   - Add a simple `V3FidelityNotes` component that can be reused in the staging page.

3. **Developer Experience**
   - Make the staging page the fastest way to see changes during development.
   - Consider adding hot-reload friendly structure.
   - Add a "Reset to Default" button on complex demos (especially Veil state).

4. **Visual Testing Readiness**
   - Use consistent `data-v3-*` attributes on key elements so visual regression tools can target them later.
   - Keep class names stable.

5. **Incremental Delivery Philosophy**
   - Deliver one primitive fully working in staging before moving to the next.
   - After each primitive, pause and get feedback before continuing.

6. **Staging Shell Quality**
   - The staging page itself should demonstrate the merged nav + broken line treatment as early as possible.
   - This helps validate the shell rules in a real context.

## Suggested Staging Page Sections Order

1. Welcome / Overview
2. Design Tokens
3. VeilDrawer (most important — do this early)
4. TaskRowMinimal + EvidenceFolderRow
5. Global Shell Demo
6. Supporting Atoms
7. Current Status & Next Steps

## Questions Claude Should Ask

Before starting implementation, Claude should ask about:
- Current routing setup (React Router? Next.js? Custom?)
- Existing component library location
- Preferred folder structure for new V3 components
- Whether Storybook is already in use or if we should rely only on the custom `/ui-staging` page

---

Use this document together with the main build prompt.