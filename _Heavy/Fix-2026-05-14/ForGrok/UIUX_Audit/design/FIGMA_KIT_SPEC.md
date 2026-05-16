# Figma Kit Specification — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Audience:** Design Systems + Product Design Team

---

## 1. Purpose

This document defines the structure and content of the official **CareIndeed v2 Figma Kit** that will be the single source of truth for all product and marketing design work.

---

## 2. Kit Structure (Recommended Organization)

```
CareIndeed v2 Design System
├── Foundations
│   ├── Color Tokens (Light + Dark)
│   ├── Typography Scale
│   ├── Spacing & Radius
│   ├── Elevation & Glass Layers (0/1/2/3)
│   └── Motion Tokens
├── Primitives
│   ├── Button (Primary, Secondary, Ghost, Danger)
│   ├── Input / Textarea / Select
│   ├── Card (Layer 1 & Layer 2)
│   ├── Badge / Status
│   ├── Icon (24px line set)
│   └── Divider
├── Components
│   ├── Navigation (Bottom Nav, Sidebar, Top Bar)
│   ├── Tabs
│   ├── Modal / Bottom Sheet
│   ├── Drawer
│   ├── Empty State
│   ├── Loading States (Skeleton + Spinner)
│   ├── Form Field + Validation
│   ├── Signature Capture
│   └── Evidence Upload
├── Patterns
│   ├── CES Board Cards
│   ├── Policy Detail
│   ├── Onboarding V2 Batch / Unit
│   ├── Evidence Center
│   ├── Calendar
│   └── Task List
├── Templates (Full Screens)
│   ├── Mobile (iPhone 14/15/16 Pro)
│   ├── Desktop (1440px + 1920px)
│   └── Tablet (iPad)
└── Documentation
    ├── Glass Layering Cheat Sheet
    ├── Light Mode Elevation Rules
    └── Do’s and Don’ts
```

---

## 3. Component Requirements

Every component in the kit must have:

- **Variants** for all major states (default, hover, active, disabled, error, success)
- **Light + Dark** versions
- **Responsive** behavior notes (mobile vs desktop)
- **Usage guidelines** in the component description
- **Auto Layout** properly configured
- **Constraints** set for resizing

---

## 4. Glass Layering in Figma

Because Figma does not have real backdrop blur in all cases, the kit must simulate the 3-layer system using:

- Layer 0: Dark atmospheric background (subtle noise or gradient)
- Layer 1: Main surface (soft translucent fill + subtle border)
- Layer 2: Elevated card (stronger shadow + slightly more opaque)
- Layer 3: Only when functionally required (rare)

Provide clear variant naming:
- `Glass / Layer 1 / Dark`
- `Glass / Layer 2 / Light`
- etc.

---

## 5. Icon Library

- One master icon component set (60–80 icons max)
- Consistent 24×24 base
- 1.5–2px stroke, 2–4px corner radius
- Variants for size (16 / 20 / 24 / 32)
- Color inheritance via `currentColor`

---

## 6. Maintenance Process

1. Designer updates a component in the master kit.
2. Updates the corresponding documentation in the `design/` folder.
3. Notifies engineering (via Slack + PR) when tokens or components change.
4. Engineering updates the `ui/` primitive library to match.

**Rule:** The Figma kit is the source of truth. Code must follow the kit.

---

## 7. Versioning

- Major version bumps only when breaking visual or structural changes occur.
- Minor versions for new components or significant refinements.
- All changes must be documented in a "Changelog" page inside the Figma file.

---

## 8. Access & Governance

- Only Design Systems team members may edit the master kit.
- Product designers work from a duplicated "working copy".
- Quarterly audit of the kit vs. production code to catch drift.

---

*This kit will become the foundation for all future design and handoff work.*

---

**Next Step:** Build the initial v2 Figma kit based on the strongest approved mockups (`09_CES_Board_Dark.jpg` + `07_EvidenceCenter_Dark.jpg` as base) + all documentation in this folder.