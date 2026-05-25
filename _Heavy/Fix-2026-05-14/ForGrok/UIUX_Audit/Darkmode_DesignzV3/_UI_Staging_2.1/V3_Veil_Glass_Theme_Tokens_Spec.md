# V3 Veil Glass — Theme & Visual Language Specification

**Version:** 1.1 (Refined — Stronger Glass + Merged Nav with Broken Lines)  
**Date:** 2026-05-18  
**Status:** Authoritative Source of Truth for all visual decisions  
**Owner:** Orchestrator + Agent 03 (Tokens) + Agent 16 (Fidelity)

---

## 1. Design Philosophy

**"Dark, Minimal, Expensive, Calm — Less is More, but what remains feels premium."**

V3 Veil Glass is a **dark-first, ruthlessly minimal** design system that uses glassmorphism **only** as a contextual, high-value overlay (the Veil Drawer). The default surface is deliberately sparse and scannable. All richness, depth, and complexity lives inside the Veil.

**Core Tenets**
- Maximum 70%+ declutter on every default view
- One single main content card contains the entire experience (nav + logo merge into it)
- Glassmorphism is used with **stronger presence** on the Veil Drawer and key surfaces for a premium frosted effect (inspired by high-end executive dashboards)
- Separation between navigation and content uses **broken/interrupted lines** (vertical and horizontal) rather than solid continuous borders — creating a more fluid, merged feel
- Strong, elegant borders remain important but are applied with restraint
- Only two accent colors are allowed: Brand Teal and Warm Orange
- Typography and spacing are generous but never decorative
- Light mode must feel equally premium (not an afterthought)

---

## 2. Color Palette — Dark Mode (Primary)

### Base Surfaces

| Token                        | Value                          | Usage |
|-----------------------------|--------------------------------|-------|
| `--v3-base-bg`              | `#0F1116`                      | Deepest background behind the main card |
| `--v3-main-card-bg`         | `#161A22`                      | The single bordered container that holds everything |
| `--v3-main-card-border`     | `#2A2F3A`                      | Strong elegant border around the entire app content |
| `--v3-surface-1`            | `#1C2029`                      | Default card / panel surface (minimal) |
| `--v3-surface-2`            | `#222831`                      | Slightly elevated surfaces inside cards |
| `--v3-surface-3`            | `#282E38`                      | Highest elevation inside default view (rare) |

### Veil Glass (Hero Treatment) — Stronger Premium Glassmorphism

The Veil uses **enhanced glassmorphism** for a richer, more expensive frosted effect while remaining elegant and readable.

| Token                              | Value                                      | Usage |
|------------------------------------|--------------------------------------------|-------|
| `--v3-veil-bg`                     | `rgba(18, 22, 30, 0.86)`                   | Primary Veil background — slightly deeper and more translucent |
| `--v3-veil-bg-strong`              | `rgba(16, 20, 28, 0.92)`                   | For dense forms or high information density |
| `--v3-veil-border`                 | `rgba(255, 255, 255, 0.11)`                | More visible elegant border |
| `--v3-veil-border-luminous`        | `rgba(255, 255, 255, 0.18)`                | Stronger inner luminous edge |
| `--v3-veil-blur`                   | `22px`                                     | **Stronger** backdrop filter blur for premium frosted glass |
| `--v3-veil-saturate`               | `1.18`                                     | Increased saturation for richer glass depth |
| `--v3-veil-glow-teal`              | `0 0 0 1px rgba(0, 121, 112, 0.18), 0 0 56px -10px rgba(0, 121, 112, 0.28)` | Enhanced teal-tinted outer glow |
| `--v3-veil-shadow`                 | `0 32px 90px -18px rgba(0,0,0,0.72), -14px 0 44px -14px rgba(0,0,0,0.48)` | Strong left-edge emphasis for drawer presence |

**Veil Internal Sections (VeilSection)**
- Use rich inner glass: `blur(10-12px)` + stronger border so they feel like elevated content islands floating inside the Veil
- This creates beautiful layered depth without violating the single-Veil rule.

### Accent Colors (Strictly Limited)

| Accent           | Hex        | Token                     | Usage |
|------------------|------------|---------------------------|-------|
| **Brand Teal**   | `#007970`  | `--v3-accent-teal`        | Primary action, focus states, status success, links, subtle highlights |
| **Warm Orange**  | `#E07B2C`  | `--v3-accent-orange`      | Attention / warning / generate actions, important CTAs, risk indicators |
| Teal Subtle      | `#00A99D`  | `--v3-accent-teal-light`  | Hover states, micro-accents |
| Orange Subtle    | `#F4A261`  | `--v3-accent-orange-light`| Soft warning highlights |

**Rule:** Never introduce new colors. These two accents + the carbon/smoke grey palette are the entire system.

### Text & Semantic

| Token                    | Dark Value              | Usage |
|--------------------------|-------------------------|-------|
| `--v3-text-primary`      | `#F1F3F7`               | Main readable text |
| `--v3-text-secondary`    | `#A8B0C0`               | Supporting text, metadata |
| `--v3-text-tertiary`     | `#6C7588`               | Disabled / subtle labels |
| `--v3-text-yellow`       | `#F4D35E` (soft)        | Layer 1 brief descriptions inside first Veil |
| `--v3-text-red`          | `#E76F51` (warm)        | Layer 2 critical/compliance highlights inside second Veil |

---

## 3. Borders & Elevation System

V3 relies on **strong, visible borders** more than heavy shadows.

### Border Hierarchy + Broken Line Separation

- Main container: `1.5px solid #2A2F3A` (subtle overall border)
- Default cards / surfaces: `1px solid #2A2F3A`
- Veil Drawer: `1px solid rgba(255,255,255,0.11)` + luminous inner edge (stronger per updated glass rules)
- **Nav separation**: Uses **broken/interrupted vertical lines** (segmented strokes, 60-70% opacity, with intentional gaps) instead of a continuous solid border. Horizontal broken lines may appear in the header area.
- Interactive elements: Use teal or orange for focus rings (`2px solid #007970`)

### Elevation (Minimal by Design)

- Default view: Almost flat. Separation comes from borders + very subtle background shifts.
- Inside Veil only: Controlled glass elevation using the VeilSection primitive.
- Hover states on minimal rows: Tiny lift (`translateY(-1px)`) + border color shift.

---

## 4. Typography

**Font Stack (Recommended)**
- Primary: Inter / SF Pro / system-ui (clean, highly legible)
- Monospace (IDs, codes — rarely shown to end users): JetBrains Mono / Fira Code

**Scale**

| Level          | Size     | Weight   | Line Height | Usage |
|----------------|----------|----------|-------------|-------|
| Display        | 28–32px  | 600      | 1.1         | Page titles (inside main card) |
| H1             | 22px     | 600      | 1.2         | Veil Drawer titles |
| H2             | 18px     | 600      | 1.25        | Section headers inside Veil |
| Body           | 14–15px  | 400/500  | 1.45        | Primary content |
| Small          | 12–13px  | 400      | 1.4         | Metadata, labels |
| Micro          | 11px     | 500      | 1.35        | Badges, pills, folder % |

**Highlight Rules**
- Yellow briefs (Layer 1): Slightly increased weight or soft glow
- Red critical text (Layer 2): Warm red color + subtle underline or background tint

---

## 5. Spacing & Rhythm

V3 is generous with whitespace.

- Base unit: `4px`
- Recommended: `8px`, `12px`, `16px`, `24px`, `32px`, `48px`
- Default list row height: 52–60px (comfortable scanning)
- Veil padding: `24px` on sides, `20px` top/bottom
- Gap between main card content and edges: Minimum `32px` breathing room inside the bordered card

---

## 6. The Single Main Container + Merged Navigation (Global Shell)

The entire application lives inside **one primary content container**. Navigation and logo are **integrated** into this container rather than treated as a separate sidebar.

### Key Shell Rules

- **Everything** (nav, header, content, Veil Drawer) lives inside one elegant main container.
- The container has generous breathing room from the viewport edges.
- **Left navigation merges with the main surface**:
  - Logo is placed at the top of the nav area, inside the main container.
  - Hamburger toggle sits top-left inside the container.
  - The vertical separation between nav and main content is created with **broken/interrupted lines** only (segmented, dashed, or partial vertical strokes). No continuous solid border.
  - Horizontal broken lines may be used sparingly in the header or section dividers for subtle distinction.
- Left nav is collapsed by default on login (icons only).
- Notification bell + Profile avatar live at the **bottom** of the collapsed nav.
- Search (with live preview dropdown) sits in the top area inside the main container, aligned with the logo.

This creates a fluid, merged experience where the navigation feels like part of the same glass/card surface instead of a hard sidebar. The broken lines provide just enough visual separation without breaking the premium calm.

**Inspiration note**: This merged treatment draws from high-end executive dashboard references that favor integrated navigation with subtle, non-solid line separation for a more cohesive and expensive feel.

---

## 7. Glassmorphism Usage Rules (Stronger on Veil, Restrained Elsewhere)

We now use **stronger glassmorphism** on the Veil and selected surfaces for a richer premium feel, while maintaining ruthless minimalism on default views.

**Allowed Glass Locations:**
- The main `VeilDrawer` panel (now with enhanced blur and depth — see Veil Glass tokens)
- `VeilSection` internal blocks inside the Veil (rich layered glass)
- Subtle glass on the live search preview dropdown
- Very light glass treatment allowed on the **main container surface** itself when it helps the merged nav feel cohesive (use with restraint)

**Forbidden Glass Locations (Non-Negotiable):**
- Default task/folder rows and list items
- Calendar day cells and event chips (on default view)
- Static cards on any list/calendar/overview view
- Hover cards (use subtle elevation + broken line borders instead)
- Persistent headers or footers outside the Veil

**Philosophy:**
- The Veil is allowed to be visually "louder" and more glass-forward (stronger frost, deeper blur, better glow).
- The default view must stay extremely calm and flat — this is how we achieve "the more we can hide the Veil, the better."
- Broken lines + integrated nav help the overall shell feel more fluid without needing heavy glass everywhere.

---

## 8. Light Mode Pairing (Must Feel Equally Premium)

Light mode is **not** a desaturated copy of dark.

| Element                    | Light Value                          |
|---------------------------|--------------------------------------|
| Main card background      | `#F8F7F4` (warm off-white)           |
| Base bg behind card       | `#EDEAE4`                            |
| Veil background           | `rgba(255,255,255,0.88)` + blur(16px)|
| Borders                   | Stronger and more defined            |
| Accents                   | Same teal + orange (they pop beautifully) |
| Text primary              | `#1F242E`                            |

The light mode should feel "expensive stationery" rather than "bright software."

---

## 9. Component-Level Visual Contracts (Summary)

| Component            | Visual Treatment in V3 |
|----------------------|------------------------|
| `TaskRowMinimal`     | Flat, border only, generous padding, yellow on hover for the title |
| `VeilDrawer`         | Rich frosted glass, strong left-edge shadow, rounded left corners only |
| `VeilSection`        | Inner glass card with reduced blur, collapsible, count badge |
| Folder rows (Evidence)| Google Drive / Windows style icons + large % badge overlaid on folder |
| Status pills         | Very compact, high contrast, teal/orange only |
| Search preview       | Dark glass dropdown with subtle blur, 4–6 results max |

---

## 10. Animation & Motion Language

- Veil open: Smooth slide from right, 280–320ms, `cubic-bezier(0.32, 0.72, 0, 1)`
- Layer transition (Layer 1 → Layer 2): First drawer exits fully right, then second enters. No overlap.
- Row hover: Subtle lift + border color change (120ms)
- Focus: Clean 2px teal ring, no heavy glow

---

## 11. Implementation Notes for Phase 2

- All values above should be turned into a proper token system (`tokens/v3-tokens.json` or extension of existing `ces/theme.ts`).
- The existing `.ci-glass-panel` class should be evolved or a new `.v3-veil` family created.
- `VeilDrawer` must be the first primitive built after tokens.
- Every new component must include a comment block referencing this spec.

---

## 12. Visual North Star References (Locked)

**Primary locked visual references** (must pass regression against these):

- `Approved_Drawer_Style_04.jpg` → Veil glass treatment & depth
- `Approved_Evidence_Icon_View_07.jpg` → Folder treatment + % badges
- `Approved_Policy_Viewer_08.jpg` → Premium dark expensive aesthetic
- `Approved_Global_Shell_13.jpg` → Single main container + header/nav placement

**Additional inspiration reference** (for merged nav, stronger glassmorphism, and broken line treatment):

- Executive Dashboard screenshots (2026-05-18 series in user Pictures/Screenshots) — used for:
  - Stronger frosted glass depth
  - Integrated nav + logo that merges with the main container
  - Broken/interrupted line separation instead of solid borders
  - Overall cinematic dark premium calm

The four approved prototypes remain the strict visual contracts. The executive dashboard references guide specific refinements in glass strength and shell integration only.

---

**This document is now the mandatory visual contract for all Phase 2 and Phase 3 work.**

Next: Use this as the foundation for the Phase 2 primitives and component specs.