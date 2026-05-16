# Figma to Code Component Mapping — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document provides a clear mapping between Figma components/variants and the actual React/React Native components in the `ui/` folder. This reduces interpretation errors during implementation.

---

## 2. Core Principle

**One Figma component = One canonical `ui/` component** (with variants handled via props).

---

## 3. Component Mapping Table

| Figma Component          | Code Component              | Key Props / Variants                          | Notes |
|--------------------------|-----------------------------|-----------------------------------------------|-------|
| **Button**               | `ui/Button`                 | `variant`: primary, secondary, ghost, danger<br>`size`: sm, md, lg<br>`loading`, `disabled` | Primary uses restrained orange |
| **Card**                 | `ui/Card`                   | `layer`: 1 \| 2<br>`padding`: sm, md, lg<br>`clickable` | Use for most elevated surfaces |
| **GlassPanel**           | `ui/GlassPanel`             | `padding`: none, sm, md, lg                   | Lower-level primitive |
| **Input / Text Field**   | `ui/Input`                  | `label`, `error`, `helperText`, `size`        | Always include label |
| **Select**               | `ui/Select`                 | `options`, `error`                            | - |
| **Badge / Status**       | `ui/Badge`                  | `variant`: success, warning, error, neutral, info | Never rely on color alone |
| **Tabs**                 | `ui/Tabs`                   | `tabs[]`, `activeTab`, `onChange`             | Supports keyboard navigation |
| **Empty State**          | `ui/EmptyState`             | `icon`, `title`, `description`, `action`      | Use the approved patterns |
| **Loading**              | `ui/Loading`                | `type`: skeleton, spinner, inline             | Prefer skeleton for lists |
| **Bottom Sheet**         | `ui/BottomSheet`            | `isOpen`, `onClose`, `title`, `size`          | Default for mobile modals |
| **Modal**                | `ui/Modal`                  | `isOpen`, `onClose`, `size`                   | Desktop preferred |
| **Drawer**               | `ui/Drawer`                 | `side`: left \| right, `width`                | Desktop only. Use BottomSheet on mobile |
| **Avatar**               | `ui/Avatar`                 | `src`, `name`, `size`                         | - |

---

## 4. Layout & Shell Components

| Figma Element                    | Code Component                     | Usage |
|----------------------------------|------------------------------------|-------|
| Main App Shell                   | `CommandCenterLayout`              | Primary layout wrapper |
| Bottom Navigation (Mobile)       | `ui/BottomNav`                     | Max 5 items |
| Sidebar (Desktop)                | `ui/Sidebar`                       | Collapsible supported |
| Top Bar / Header                 | `ui/TopBar`                        | Contains title + actions |

---

## 5. Specialized Components

| Area                    | Figma Component              | Code Owner                              | Notes |
|-------------------------|------------------------------|-----------------------------------------|-------|
| CES Board               | `CesTaskCard`                | Should be refactored to `ui/Card` + `ui/Badge` | Avoid creating new card variants |
| eCign Signature         | `SignaturePad`               | `ui/SignatureCapture` (to be created)  | See `SIGNATURE_CAPTURE_BEST_PRACTICES.md` |
| Evidence Upload         | `EvidenceCapture`            | Custom component (reuses `ui/Button`)  | Follow `EVIDENCE_CAPTURE_SPECIFICATION.md` |
| Onboarding V2 Gates     | `GateCard` / `UnitCard`      | Use `ui/Card` + status badges          | See `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md` |

---

## 6. How to Use This Mapping

1. Designer hands off Figma file with component names clearly labeled.
2. Engineer opens this document and maps each Figma component to the corresponding `ui/` component.
3. If a component does not exist in the mapping, **stop and ask Design Systems** before building a custom version.

---

## 7. Variant Handling

Most variants are handled via **props**, not by creating separate components.

Example:
- Figma has "Button/Primary", "Button/Secondary", "Button/Ghost" → All map to `<Button variant="primary" />`, `<Button variant="secondary" />`, etc.

---

## 8. Future Updates

This document must be updated every time:
- A new canonical component is added to the `ui/` folder
- A Figma component is renamed or restructured

---

*This mapping is the bridge between design and code. Keep it up to date.*

---

**Related Documents:**
- `COMPONENT_GUIDELINES.md`
- `FIGMA_KIT_SPEC.md`
- `ENGINEERING_HANDOFF_GUIDE.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`