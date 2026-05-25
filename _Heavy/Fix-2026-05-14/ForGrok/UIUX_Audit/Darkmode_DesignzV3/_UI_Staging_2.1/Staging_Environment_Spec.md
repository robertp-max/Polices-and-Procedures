# UI Staging Environment Specification (Phase 2.1)

**Purpose:** Create a safe, isolated area inside the application for developing and testing the new V3 Veil Glass components.

## Goals of the Staging Environment

- Allow rapid iteration on primitives without touching production code.
- Provide a single place to visually validate components against the V3 specs.
- Make it easy to demo progress to stakeholders.
- Support both dark and light modes from day one.
- Serve as a living documentation + component library during Phase 2.

## Required Features

1. **Dedicated Route**
   - `/ui-staging` (preferred) or `/dev/ui-staging`

2. **Main Staging Dashboard**
   - Clean header: "V3 Veil Glass Foundation — UI Staging"
   - Sidebar or top tabs for navigation between primitives
   - Live interactive previews

3. **Primitive Sections (to be added incrementally)**
   - Tokens Overview
   - VeilDrawer (Layer 1 + Layer 2 demos + transition)
   - TaskRowMinimal variations
   - EvidenceFolderRow
   - Global Shell demo (with merged nav + broken lines)
   - Supporting atoms

4. **Quality of Life Tools**
   - Dark / Light mode toggle
   - "Show Fidelity Rules" toggle per section
   - Token value inspector (optional but highly recommended)
   - Code snippet copy buttons

5. **Technical Requirements**
   - Uses the new V3 token system exclusively
   - Every component demo includes the V3 Fidelity comment block
   - Isolated from existing production pages

## Recommended Folder Structure

```
src/ui-staging/
├── UIStagingPage.tsx
├── components/
│   ├── PrimitiveCard.tsx
│   └── FidelityPanel.tsx
├── sections/
│   ├── TokensSection.tsx
│   ├── VeilSection.tsx
│   ├── MinimalRowsSection.tsx
│   └── ShellSection.tsx
└── utils/
    └── v3Helpers.ts
```

This structure keeps staging clean and separate from the main component library we will eventually promote to production.

## Success Criteria for Staging

- Developer can run the app and immediately navigate to `/ui-staging`
- All current V3 primitives can be previewed and interacted with
- Visual differences between dark and light mode are easy to check
- Adding a new primitive takes less than 10 minutes of setup work

The staging environment is the **single source of truth** for visual validation during Phase 2.1.