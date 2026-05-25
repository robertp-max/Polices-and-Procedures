# V3 Veil Glass Design System Specification

**Version**: V4 — Authoritative Design System Reference  
**Theme**: Seamless Matte Slate-Carbon  
**Goal**: Every page view change in the application must feel like part of one polished, cohesive multipage transition experience.

---

## 1. Design Philosophy

The V3 Veil Glass system creates a **single-glass illusion** across the entire application. The user should perceive the whole product as one continuous, premium matte glass surface floating over a deep slate-navy canvas.

Core principles:
- **Calm Premium** — High-end but restrained. Never flashy.
- **Absolute Consistency** — The same visual and motion language must be felt on every screen.
- **Multipage Transition Application** — Every navigation action, view change, and section switch must use smooth, polished, clean, cohesive, and consistent transitions.
- **Invisible Surfaces** — Most containers are transparent. Only meaningful interactive elements receive borders.

---

## 2. Visual Tokens (Immutable)

### Base Canvas
- `baseBg`: `#05060A`
- `bgGradient`: `radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)`
- **2×2 Pixel Grid**: Subtle architectural texture using `rgba(255,255,255,0.012)` lines at 24px spacing with `screen` blend mode.

### Glass Treatment
- Main glass card uses a deep specular gradient with heavy `backdrop-filter: blur(32px) saturate(140%)`.
- Most non-interactive surfaces are fully transparent (`glass1: transparent`).
- Hover states use very light sheens (`glass2: rgba(255,255,255,0.04)`).

### Borders (The 33% Rule)
- All internal borders and catch-lights: `rgba(255, 255, 255, 0.33)`
- This is a hard rule. Deviating from 33% breaks the system.

### Color Palette (Strict)
- **Primary Accent**: Teal `#007970` and vibrant `#00D1C1`
- **Limited Orange** (Neon Glow only): `#E07B2C` / `#FFA059` — used exclusively for the glowing “Command Center” eyebrow and “My Personal Workspace” label.
- All status, active states, overdue indicators, and highlights must use teal.

---

## 3. The 77.7% Main Glass Card

- Desktop: 77.7% width (min 980px), 92vh height, centered.
- No outer border on the main card.
- Realistic right-side cast shadow: `30px 10px 80px rgba(0,0,0,0.9)`.
- This card is the primary content vessel for Dashboard, Evidence, Policy, Calendar, etc.

---

## 4. Navigation System

- Transparent sidebar (no glass treatment on the drawer itself).
- Collapsible hierarchical submenus with elegant nested left borders.
- Single interrupted vertical divider (`rgba(255,255,255,0.12)`) that does not touch top or bottom edges.
- Smooth 0.7s cubic-bezier transition when opening/closing.

---

## 5. Multipage Transition System (Critical)

This is a first-class part of the design system.

**Requirement**: The entire application must behave as a **true multipage transition app**. Every view change must use the same polished motion language.

### Approved Transition Characteristics
- **Duration**: 0.6s – 0.8s
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` or `power3.out` equivalents
- **Layering**: Content moves as if it lives on the same glass surface
- **Effects** (used subtly):
  - Very light scale (0.98 → 1.0)
  - Micro blur-to-focus (2–3px → 0)
  - Smooth opacity cross-fade
  - Coordinated movement between elements

### Where Transitions Must Be Applied
- Sidebar navigation clicks (section changes)
- Agency View ↔ My Planner toggle
- Any internal tab or sub-view change
- Opening/closing drawers and evidence queues
- Full route/page navigations
- Content loading states inside major views

### Consistency Rules
- The same transition language must be felt on **Dashboard, Evidence Center, Policy Lifecycle, Master Calendar, Taxonomy, Library, Onboarding, Admin, and every other major screen**.
- Transitions must feel calm, elegant, and intentional — never busy or gimmicky.
- The motion must reinforce the single-glass illusion (content should feel like it is sliding or dissolving within the same glass pane).

---

## 6. Component Philosophy

| Surface Type       | Border                  | Background     | Use Case                          |
|--------------------|-------------------------|----------------|-----------------------------------|
| Invisible (Default)| None or 0.33 on hover  | Transparent    | KPIs, banners, most planner cards |
| Bordered           | `rgba(255,255,255,0.33)` | Light glass    | Task cards, Kanban, Masonry items |
| Interactive Glass  | 0.33 → 0.45 on hover   | Subtle sheen   | Buttons, active states            |

---

## 7. Typography & Hierarchy

- Clean high-contrast white for primary text
- Refined slate grays for secondary and tertiary
- Generous letter-spacing on eyebrows and uppercase labels
- Hero titles use subtle gradient text treatment

---

## 8. Polish & Restraint

- Hidden scrollbars (functional scrolling only)
- No legacy drop shadows or artificial 3D effects
- Q3 watermark (`ci-angel.webp`) locked at 0.33 opacity
- All motion and visual decisions must pass the test: “Does this feel calm, premium, and consistent with the rest of the app?”

---

**This document, combined with the V3 Dashboard Reference code and the 36 reference screenshots, defines the complete visual and motion language of the V3 Veil Glass system.**