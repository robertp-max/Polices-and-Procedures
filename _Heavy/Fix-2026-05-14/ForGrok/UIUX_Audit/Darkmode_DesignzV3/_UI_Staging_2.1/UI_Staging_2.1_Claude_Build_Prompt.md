# Phase 2.1 — UI Staging Environment & Foundation Build Prompt

**Project:** Care Indeed Home Health Policies & Procedures  
**Phase:** 2.1 Foundation + UI Staging Setup  
**Status:** Ready to Build

You are an expert React + TypeScript + Tailwind engineer responsible for building the V3 Veil Glass design system foundation.

---

## 1. Primary Objective

Your first and most important task is to **create a dedicated, safe "UI Staging Environment"** inside the existing application where the new V3 components can be developed, previewed, and iterated on without affecting any production pages.

As part of the early work (once basic tokens and shell primitives are available), you will also build a **cohesive Login Page** that matches the V3 Veil Glass design language.

After the staging environment is in place, begin implementing the actual foundation primitives following the strict V3 specifications.

---

## 2. Mandatory References & Full Context Review (Critical)

You **must** do the following before writing any code:

1. Deeply review the **entire** folder located at:  
   `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Darkmode_DesignzV3`

   This includes:
   - All Phase 1 and Phase 1.1 agent outputs
   - The full history of design decisions
   - Locked behavior rules (especially the Veil non-stacking + merged nav with broken lines)
   - Visual references and approved prototypes

2. Read the following key documents in this current folder:
   - `V3_Veil_Glass_Theme_Tokens_Spec.md` (v1.1)
   - `V3_Veil_Drawer_Behavior_Spec.md` (v1.1)
   - `Phase2_Core_Primitives_Spec.md`
   - `Phase2_V3_Foundation_Implementation_Plan.md`
   - `Staging_Environment_Spec.md`
   - `Improvements_and_Constraints.md`

---

## 3. First Task: Create the UI Staging Environment

Before writing any production components, do the following:

### 3.1 Create a Staging Area

- Create a new route/page: `/ui-staging` (or `/dev/ui-staging` if you prefer protection).
- This page should feel like a clean component playground / design system workbench.
- It must be easily accessible during development but not linked from the main navigation yet.

### 3.2 Recommended Staging Structure (You May Improve)

Create the following inside the project:

```
src/
  ui-staging/
    UIStagingPage.tsx                 ← Main staging dashboard
    components/
      PrimitiveCard.tsx               ← Reusable wrapper for each demo
    sections/
      TokensSection.tsx
      VeilDrawerSection.tsx
      TaskRowMinimalSection.tsx
      ShellSection.tsx
      EvidenceFolderSection.tsx
    utils/
      V3FidelityCheck.ts              ← Helper for visual notes
```

The `UIStagingPage` should have:
- Clean dark header with "V3 Veil Glass — UI Staging" title
- Tabs or sidebar navigation for different primitives
- Live, interactive previews of each component
- Easy dark/light toggle
- A "Fidelity Notes" panel that shows the relevant spec excerpt

### 3.3 Staging Environment Requirements

- The staging area must use the **new V3 tokens** from the very beginning.
- Every demo component must include this comment block at the top:

```tsx
// V3 Fidelity — Phase 2.1
// References: V3_Veil_Glass_Theme_Tokens_Spec.md v1.1 + V3_Veil_Drawer_Behavior_Spec.md v1.1
// Status: [In Progress / Ready for Review]
```

- Make it easy to add new primitives as we build them.
- The staging page itself should demonstrate the **merged nav + broken line** treatment when possible.

---

## 4. Build Order & Early Deliverables (After Staging is Live)

Once the UI Staging environment exists and is working, proceed with the following:

### Early High-Visibility Deliverable
**Create a cohesive Login Page** as one of the first real surfaces built.

- The Login Page must feel fully part of the V3 Veil Glass system (merged container feel, broken line elements if applicable, premium dark aesthetic, stronger glass where it makes sense).
- It should use the new V3 tokens and shell primitives.
- Keep it minimal, calm, and expensive — matching the overall "less is more" direction.
- Include fields for login (username/email + password), and any relevant branding.
- Make sure it works well with the future Global Shell once implemented.

This Login Page will serve as an important early validation of the design language.

### Main Build Order
After the Login Page is in the staging environment, follow this order:

1. **Token System** (V3 Veil Glass v1.1 values)
2. **VeilDrawer + VeilSection** (with stronger glass + two-layer non-stacking)
3. **TaskRowMinimal**
4. **EvidenceFolderRow** (with % on folder)
5. **Global Shell** (merged nav + broken line separation)
6. **Supporting atoms** (StatusPillV3, HoverCard, SearchWithPreview)

Deliver one primitive at a time into the staging environment before moving to the next.

---

## 5. Additional Constraints & Improvements (Mandatory)

You must follow these rules:

- **Dark mode first.** Light mode must be supported but secondary.
- **No hard-coded colors or blur values** — everything must come from the new V3 token system.
- **Stronger glassmorphism** on the Veil (use the v1.1 values: 22px blur, richer frost).
- **Broken line separation** for the left nav inside the staging shell (no solid borders).
- Every new file must be placed in a logical V3 structure (suggest `/src/components/v3/` or `/src/ui/v3/`).
- Keep the staging environment **isolated** — do not modify existing production pages (Calendar, CES, Evidence, etc.) until the primitives are stable.
- Make the staging page **responsive** enough to test mobile bottom-sheet behavior for the Veil.
- Add a simple way to simulate Layer 1 vs Layer 2 of the Veil in the staging demo.

---

## 6. Suggested Improvements I Recommend Adding

As you build, please also implement these quality-of-life improvements:

1. **Visual Fidelity Panel** — On each primitive demo, show a collapsible panel with the key rules from the spec.
2. **Token Inspector** — A small panel that shows the actual CSS custom properties being used.
3. **State Persistence** — Remember the last open Veil state and layer when refreshing the staging page.
4. **Component API Documentation** — Simple prop table next to each demo.
5. **Easy Copy** — Buttons to copy the usage code for each component.
6. **Dark/Light Quick Toggle** with visual diff view if possible.

---

## 7. Output Expectations

For every major deliverable, provide:

- The actual code files created or modified.
- Clear instructions on how to run/view the staging environment locally.
- Confirmation that it follows the v1.1 specs.
- A short summary of what was built and any decisions or trade-offs made.

---

## 8. Starting Instruction

**Begin now.**

**Important Context:**
- The user has not yet had any conversation with you about this project.
- They previously attempted image generation for main pageviews (this has been deprioritized for now).
- We are moving directly into implementation, starting with the UI Staging environment + a cohesive Login Page.

First action:
1. Confirm you have reviewed the **entire** `Darkmode_DesignzV3` folder as instructed.
2. Analyze the current project structure (ask for the `src` folder tree if needed).
3. Propose how you will create the **UI Staging Environment** (`/ui-staging`).

After I approve the staging approach, you may begin implementation.

Once the staging environment is functional, we will next work on the **Login Page** as an early high-visibility deliverable.

You have full permission to ask clarifying questions about the current codebase structure before writing any code.

---

**Start by confirming full folder review and proposing the UI Staging Environment.**