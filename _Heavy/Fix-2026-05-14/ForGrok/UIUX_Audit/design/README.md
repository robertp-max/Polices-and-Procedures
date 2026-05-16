# CareIndeed Home Health — Design System Documentation (v2)

**Location:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/`

**Status:** Comprehensive — Production Ready  
**Last Updated:** May 2026

---

## Overview

This folder contains the **complete v2 design system documentation** for the CareIndeed Home Health Compliance Platform.

**Non-negotiable rules:**
- **Care Indeed is the ONLY active canonical brand** (CI-ION maroon/gold is retired for production).
- **Strict 3-Layer Glass System** (Layer 0 atmospheric background, Layer 1 main surface, Layer 2 elevated card/dialog). Layer 3 only when functionally required.
- **Dark mode** is primary for operational work. Light mode uses soft glass treatment (hairline borders + layered shadows, never hard black borders).
- **Mobile-first operational philosophy** — clinician / DON / surveyor one-handed use, interruption-tolerant, 44px targets.

---

## Complete Document Index

### Core Foundations

| Document | Purpose |
|----------|---------|
| `DESIGN_SPEC.md` | Master vision, principles, layout rules, component philosophy |
| `LIGHT_MODE_ELEVATION_SYSTEM.md` | Light mode contrast, soft glass elevation, hairline borders + shadows |
| `GLASS_LAYERING_CHEAT_SHEET.md` | One-page quick reference (Layer 0/1/2/3 rules) |
| `COLOR_TOKENS.md` | Official Care Indeed palette (Navy / Teal / Restrained Orange) with usage |
| `TYPOGRAPHY_SCALE.md` | Heading + body scale for mobile and desktop |
| `MOTION_ANIMATION_PRINCIPLES.md` | Timing, easing, micro-interactions, reduced-motion rules |
| `DESIGN_TOKEN_EXPORT_GUIDE.md` | Token structure and export formats for engineering |

### Guidelines & Standards

| Document | Purpose |
|----------|---------|
| `DOS_AND_DONTS.md` | High-level visual, motion, and component rules |
| `COMPONENT_GUIDELINES.md` | Detailed specs (Button, Card, Form, Navigation, Status, Modal, Tabs, etc.) |
| `COMPONENT_USAGE_EXAMPLES.md` | Correct vs incorrect real-world usage examples |
| `ICONOGRAPHY_GUIDELINES.md` | Icon style, sizing, color usage, and library recommendations |
| `ICON_LIBRARY_EXPORT_GUIDE.md` | How to build and export the official icon set |
| `DARK_VS_LIGHT_MODE_GUIDE.md` | When to use each mode and how the treatments differ |
| `ACCESSIBILITY_GUIDELINES.md` | WCAG 2.2 AA requirements tailored to this platform |
| `ACCESSIBILITY_COMPONENT_CHECKLIST.md` | Per-component accessibility checklist |
| `CONTENT_MICROCOPY_GUIDELINES.md` | Voice, tone, terminology, error messages, and empty states |

### Implementation & Handoff

| Document | Purpose |
|----------|---------|
| `MOTION_TOKEN_IMPLEMENTATION.md` | How to implement motion tokens in code (React / React Native) |
| `FIGMA_KIT_SPEC.md` | Structure and governance for the official Figma design kit |
| `ENGINEERING_HANDOFF_GUIDE.md` | How design hands off to engineering (tokens, primitives, review process) |
| `PRINT_PDF_CONSISTENCY_GUIDELINES.md` | eCign packet, CES reports, and audit export print rules (legal artifacts) |

### Specialized Workflow Specs

| Document | Purpose |
|----------|---------|
| `CES_BOARD_VISUAL_LANGUAGE.md` | Exact card hierarchy, urgency system, and mobile patterns for CES |
| `EMPTY_STATE_PATTERNS.md` | Three types of empty states + approved treatments |
| `LOADING_STATE_GUIDELINES.md` | Skeleton, inline, and full-screen loading rules |
| `V2_MOCKUP_GENERATION_BRIEF.md` | Precise prompt for Gemini / AI image generation (cohesive v2 style) |
| `V2_DESIGN_DIRECTION_SUMMARY.md` | One-page executive summary of the entire v2 direction |

---

## Current Design Direction (Summary)

- **Single Brand:** Care Indeed only (Navy `#0F172A`, Teal `#007970`, Restrained Orange `#E07B2C`)
- **Glass System:** Maximum 3 layers. Layer 3 is rare and functional only.
- **Light Mode:** Soft, expensive glass — subtle hairline borders + layered shadows (no hard black borders)
- **Motion:** Calm, purposeful, premium. Never flashy or bouncy.
- **Typography:** Montserrat for headings, Inter for body text.
- **Primary Use Case:** Field clinicians, DONs, and surveyors doing real compliance work on phones and tablets.

---

## Status & Next Steps

**Completed (as of this update):**
- Full foundations (color, typography, motion, tokens, glass system)
- All major guidelines (components, icons, accessibility, content, dark/light)
- Implementation handoff documents (Figma kit, engineering, print/PDF)
- Specialized operational specs (CES Board, Empty States, Loading)

**Remaining High-Value Documents (being added in this session):**
- Signature Capture Best Practices
- Evidence Capture Specification
- Onboarding V2 Mobile Pattern Library
- Calendar Visual Patterns
- Task Urgency Hierarchy Spec
- Responsive Behavior Matrix
- Form Validation Patterns
- Error Handling Guidelines
- Hover/Focus/Active States
- Gesture Interaction Guidelines
- Voice/Brad Integration Hooks
- And additional workflow-specific pattern libraries

All documents enforce the single Care Indeed brand, 3-layer glass limit, soft light mode treatment, and mobile-first operational philosophy.

---

**This package is ready for:**
- Engineering implementation (5-phase reconstruction plan)
- Building the official Figma v2 kit
- Sharing `V2_MOCKUP_GENERATION_BRIEF.md` with Gemini for cohesive light-mode v2 mockups (CES Calendar, Journey/LMS, etc.)
- Team onboarding and design system governance

---

*Built for calm, trustworthy, and operationally excellent home health compliance.*