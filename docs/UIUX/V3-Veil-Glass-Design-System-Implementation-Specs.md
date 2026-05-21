# V3 Veil Glass Design System & Implementation Specs

**Authoritative Reference for Porting the Premium Matte Slate-Carbon Glass Experience Across the Entire CareIndeed Application**

**Date**: May 2026  
**Source of Truth**: 
- The complete self-contained `src/ui-staging/DashboardPage.tsx` (V3 Veil Glass Reskin with Runtime GSAP Masonry)
- All prior conversation iterations in this session (V1 → V2 Matte Slate-Carbon → final GSAP Masonry version)
- Production shell architecture (`CommandCenterLayout.tsx`, `ShellContentFrame.tsx`, `ShellFrame.tsx`, `index.css` glass tokens)
- Reference screenshots referenced throughout development (image_a18341.png, image_ac8959.jpg, image_acf9d0.jpg, Screenshot 2026-05-19 194337.png, etc.)
- High-end multipage transition patterns from https://dribbble.com/tags/page-transition (smooth layered glass-aware view changes, content cross-fades, micro-blur + scale easing while preserving the single-glass illusion)

---

## 1. Executive Overview & Design Philosophy

The **V3 Veil Glass** is not a simple theme or skin. It is a **radical, opinionated evolution** of the existing CI-ION "one-glass" philosophy already present in the production shell.

### Core Philosophy (distilled from the V3 implementation and all references)

- **Single Dominant Glass Surface** — Everything meaningful lives inside one primary translucent matte glass card. Non-interactive surfaces (KPI grids, readiness banners, most planner containers) are **completely invisible** (transparent background + no border by default).
- **Extreme Matte Slate-Navy Premium Aesthetic** — The background is no longer the old deep-maroon Travelight. It is a **premium matte slate-navy** (`#05060A` base with radial `#121724` glow at top) + a **custom 2×2 pixel square grid** overlay at very low opacity.
- **77.7% Framed Main Card** — The primary content container is deliberately constrained to ~77.7% width (with realistic right-side cast shadow) to create breathing room and focus. On mobile it becomes 100%.
- **Border Opacity Contract** — All internal hairlines and catch-lights are standardized at **33%** (`rgba(255,255,255,0.33)`). Hover states raise this to ~45%. This is a hard visual rule repeated across every iteration.
- **Teal Dominance + Extremely Limited Orange** — Brand teal (`#007970` / vibrant `#00D1C1`) is the only accent used for status, highlights, overdue labels, links, and active states. **Orange (`#E07B2C` / `#FFA059`)** is reserved exclusively for two "neon light-tube" glowing elements:
  1. The "Command Center" eyebrow tag
  2. The "My Personal Workspace" label + icon in My Planner
- **Invisible vs. Bordered Surfaces** — Only interactive/kanban/task cards retain visible borders. KPI cards, banners, planner stat pills, and most planner containers are borderless and backgroundless except for the global `.v3-invisible-glare` hover treatment.
- **Hidden-but-Functional Scrollbars** — Global `.no-scrollbar` rules are mandatory.
- **Runtime GSAP for Special Views** — Complex animated layouts (Masonry Evidence Archive) load GSAP dynamically from CDN to keep the component self-contained and "copy-paste friendly".
- **Q3 Watermark Discipline** — The `ci-angel.webp` is locked in the bottom-left quadrant at exactly **33% (0.33) opacity** and never moves.
- **Premium Page Transitions** — View changes (nav clicks, Agency ↔ My Planner toggle, section switches) should feel like high-end Dribbble page transitions: layered glass, subtle scale + blur, content cross-fade, 0.6–0.8s eased motion that never breaks the single-glass illusion.

The V3 version was deliberately built as a **standalone, zero-dependency preview** so the exact visual spec could be judged against the reference screenshots without any production shell interference.

---

## 2. The V3 Token System (Single Source of Truth)

All visual decisions originate from this object in the staging file (and must be mapped to CSS custom properties for production).

```ts
const V3 = {
  baseBg: '#05060A',
  bgGradient: 'radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)',

  glass1: 'transparent',                    // Default for non-bordered surfaces
  glass2: 'rgba(255, 255, 255, 0.04)',      // Hover sheen
  glass3: 'rgba(255, 255, 255, 0.015)',     // Subtle fills

  teal: '#007970',
  tealLight: '#00D1C1',                     // Primary vibrant accent
  orange: '#E07B2C',
  orangeLight: '#FFA059',                   // ONLY for neon Command Center + My Personal Workspace

  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',

  borderDefault: 'rgba(255, 255, 255, 0.33)',   // The sacred 33% rule
  borderHighlight: 'rgba(255, 255, 255, 0.33)',
  glowSubtle: 'none',
} as const;
```

**Production Recommendation**: Promote these into `src/index.css` under a new `[data-ci-mode="v3-veil"]` or `--ci-veil-*` namespace while keeping backward compatibility for the existing maroon glass.

---

## 3. Background Canvas Rules (Non-Negotiable)

1. **Base Layer**: `background: #05060A`
2. **Radial Glow**: `radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)`
3. **2×2 Pixel Grid** (the signature V3 addition):
   ```css
   background-image: 
     linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px),
     linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px),
     radial-gradient(...);
   background-size: 24px 24px, 24px 24px, 100% 100%;
   background-blend-mode: screen, screen, normal;
   ```
4. **Watermark** (Quadrant 3):
   ```css
   position: fixed; bottom: -8vh; left: -8vw; width: 55vmin; height: 55vmin;
   background-image: url('ci-angel.webp');
   opacity: 0.33; pointer-events: none; z-index: 1;
   ```

**Implementation Rule**: This entire background treatment must be applied at the root viewport level when any V3 Veil page is active. It should **not** be inside the glass card.

---

## 4. The 77.7% Main Glass Card Contract

This is the most distinctive V3 signature.

- Width: `77.7%` (min `980px` desktop) or `100%` on mobile
- Height: `92vh` desktop / `100vh` mobile
- Border: `none` (critical)
- Border-radius: `24px` (desktop)
- Background (the actual glass):
  ```css
  background: linear-gradient(
    135deg, 
    rgba(32, 41, 56, 0.88) 0%, 
    rgba(16, 20, 28, 0.45) 60%, 
    rgba(8, 10, 13, 0.98) 100%
  );
  backdrop-filter: blur(32px) saturate(140%);
  ```
- Box-shadow (right cast): `30px 10px 80px rgba(0,0,0,0.9)`
- Inner content padding: generous (`40px` horizontal on desktop)

All page content (except the fixed watermark and the optional transparent nav drawer) lives inside this single card.

---

## 5. Navigation System (Transparent Drawer + Collapsible Submenus)

The V3 nav is a major upgrade over the production rail.

### Key Rules

- **Default state**: Closed (or collapsed to 0 width)
- **Open state**: Slides in with `0.7s cubic-bezier(0.16, 1, 0.3, 1)` on width + opacity
- **Container**: `background: transparent`, `border: none`
- **Vertical Divider**: Single 1px line at `rgba(255,255,255,0.12)`, **interrupted** (does not touch top or bottom edges — `marginTop/Bottom: 24px`)
- **Submenus**: Beautiful nested left border (`1px solid rgba(255,255,255,0.06)`), chevron toggles, independent `expandedMenus` state
- **Active Item**: `rgba(0, 209, 193, 0.1)` teal wash + bold text

**Production Porting Path**:
- Extend the existing `ShellNavRail` + `CommandCenterLayout` nav data structure with the exact `navSections` array from V3 (PRIMARY OPERATIONS, COMPLIANCE EXECUTION, ADMINISTRATION & KNOWLEDGE + all submenus).
- Add `expandedMenus` React state + `toggleSubmenu` logic.
- Make the rail background transparent when V3 mode is active.

---

## 6. Color & Accent Strategy (The Strict Palette)

| Element                          | Allowed Color          | Notes |
|----------------------------------|------------------------|-------|
| All status, highlights, overdue badges, links, active nav | `#00D1C1` (tealLight) | Dominant |
| "Command Center" eyebrow         | `#FFA059` + multi-layer text-shadow neon | The ONLY place orange is allowed |
| "My Personal Workspace" label + icon | `#FFA059` + drop-shadow neon | Second (and final) orange neon use |
| Everything else (text, borders, icons) | White / slate grays + tealLight | Red is completely eliminated |

**Rule**: If a color decision is not teal or the two specific neon orange cases, it is wrong.

---

## 7. Typography & Hierarchy

- Font stack: `'Inter', system-ui, sans-serif` (staging) — production should align with existing Outfit/Montserrat but adopt the same weight/letter-spacing discipline.
- Hero titles: 28px, 600 weight, gradient text (`linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)` with `WebkitBackgroundClip`)
- Section titles: 14px, 600, uppercase tracking
- Eyebrows: 11px, 700, uppercase, letter-spacing 0.6–0.8px
- Body: 13–14px, 500
- All text uses `color: V3.textPrimary / Secondary / Tertiary`

---

## 8. Component Patterns (Invisible vs. Bordered)

### Invisible Surfaces (default for V3)
- KPI cards
- Agency Readiness Banner
- Most planner stat pills and containers
- Use `.v3-invisible-glare` class for the 0.33s hover treatment

### Bordered / Interactive Surfaces (the exceptions)
- Kanban `BoardColumn` + `TaskCard`
- Masonry items in Evidence Archive
- Any card that is directly clickable and represents a discrete action item

**Implementation**: Every new component should accept a `variant="invisible" | "bordered"` or simply follow the rule "if it is not a task/kanban/archive item, it should be transparent by default."

---

## 9. My Planner View — Full Interactive Implementation

The V3 My Planner is the reference for the production `MyPlannerView.tsx`.

Must include:
- 4 stat cards at top (MY OPEN CES, OVERDUE, EVIDENCE PENDING, PERSONAL TASKS)
- 5 subtabs: all / open / overdue / this-week / evidence
- Search input
- Task cards in 3-column grid (teal borders on overdue)
- Bottom split: "My Critical & Overdue" + "This Sprint & Upcoming"
- Evidence Queue sticky footer bar that opens a bottom drawer

The production `MyPlannerView` already has real data binding. The V3 version shows exactly how the visual treatment must look when the toggle is active.

---

## 10. Advanced: Runtime GSAP Masonry (Evidence Archive Pattern)

The `Masonry` component + `useMedia` / `useMeasure` / `preloadImages` + dynamic `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js">` injection is the approved pattern for any "beautiful grid of documents / artifacts" view.

**Why runtime CDN?** Keeps the component completely self-contained so it can be copied into Claude/Gemini contexts without build dependency issues.

**When to use**:
- Evidence Archive
- Policy Library visual browsers
- Training material galleries
- Any "large set of visual cards" that benefit from staggered entrance + hover physics

---

## 11. Motion & Multipage Transitions (Dribbble Inspiration)

From the Dribbble "page-transition" tag and the V3 nav implementation, the desired language is:

- **Nav drawer**: 0.7s cubic-bezier(0.16, 1, 0.3, 1) on width + opacity (already in V3)
- **Section changes** (Agency ↔ Planner, clicking any nav item): 0.6–0.8s `power3.out` or `cubic-bezier(0.16,1,0.3,1)` with:
  - Subtle scale (0.98 → 1)
  - Very light blur-to-focus (3px → 0) on outgoing content
  - Opacity cross-fade
  - Content should feel like it is "on the same glass sheet" sliding or dissolving
- **TaskCard / Kanban hover**: 0.2s ease
- **Glare hovers**: 0.33s cubic-bezier(0.16, 1, 0.3, 1)

**Never** use hard cuts or jarring movements that break the premium matte glass illusion.

---

## 12. Hidden Scrollbars (Global Contract)

The `.no-scrollbar` rules in the V3 `GlobalStylesheetInjector` must become a global utility in `index.css` or `ui-staging.css` and be applied to all major scroll containers when V3 mode is active.

---

## 13. Migration Strategy — How to Implement V3 Across the Real App

### Phase 1 — Foundation (1–2 days)
1. Add all `--ci-veil-*` tokens to `index.css` (backgrounds, glass gradients, 0.33 borders, teal palette).
2. Create a `VeilGlassProvider` or extend `useShellStore` with a `glassMode: 'v3-veil' | 'ci-ion' | 'classic'` flag.
3. Extract the `GlobalStylesheetInjector` (no-scrollbar + glare) into a reusable component.

### Phase 2 — Shell Evolution
1. Make `ShellNavRail` support the new `navSections` structure + collapsible submenus when `glassMode === 'v3-veil'`.
2. Add the transparent drawer + interrupted divider behavior (controlled by a `isVeilNavOpen` state).
3. Update `ShellContentFrame` to optionally render the 77.7% constrained card + right cast shadow when in V3 mode.

### Phase 3 — Dashboard Surface
1. Replace the current Dashboard hero/KPI/kanban rendering with the V3 `renderDashboardWorkspace` logic (or a cleaned production version of it).
2. Wire the existing `PlannerViewToggle` + `MyPlannerView` to match the V3 visual treatment exactly (use the same invisible stat cards, teal overdue states, neon "My Personal Workspace").
3. Add the Agency/My Planner pill inside the top header bar of the glass card (V3 style).

### Phase 4 — Reference Pages & Special Views
- Map every sidebar route to a proper V3-styled page.
- Implement the GSAP Masonry pattern for Evidence Archive / Policy visual browsers.
- Apply the same "invisible container" + glare rule to Evidence Center, Library, Taxonomy, etc.

### Phase 5 — Polish & Transitions
- Add the ci-angel watermark at 0.33 in the app shell (only when V3 mode active).
- Implement the premium cross-fade / scale transitions on route or section change.
- Audit every remaining orange/red and convert to teal (except the two neon exceptions).

---

## 14. Implementation Checklist (Copy This)

- [ ] Background = matte slate-navy + 2×2 grid + Q3 0.33 watermark
- [ ] Main card = 77.7% width, `border: none`, realistic right shadow
- [ ] All internal borders = `rgba(255,255,255,0.33)`
- [ ] Non-kanban containers = transparent + `.v3-invisible-glare`
- [ ] TealLight everywhere except two neon orange glows
- [ ] Full hierarchical collapsible nav with exact sections from V3
- [ ] Interrupted vertical divider (0.12 opacity)
- [ ] Hidden scrollbars globally
- [ ] My Planner matches the 5-subtab + search + evidence drawer spec
- [ ] Evidence Archive (and similar) uses runtime GSAP Masonry
- [ ] Page transitions feel like premium Dribbble glass layers
- [ ] Component is still self-contained enough for reference copies

---

## 15. Anti-Patterns (What Will Break the Aesthetic)

- Adding background or border to KPI cards or planner stat sections
- Using any red or non-approved orange outside the two neon cases
- Making the nav drawer opaque or giving it its own glass treatment
- Connecting the vertical divider to the very top or bottom
- Using build-time GSAP import instead of the runtime CDN pattern (breaks the "Claude can copy" requirement)
- Stacking multiple glass layers inside the main card
- Using default browser scrollbars
- Hard-cutting between Agency and My Planner views

---

## 16. Final Notes

The V3 Veil Glass Dashboard in `src/ui-staging/DashboardPage.tsx` is the **pixel-perfect living specification**. Any production implementation must be able to pass a side-by-side visual QA against the staging preview when both are set to the same data state.

The goal is not to make every page look exactly like the dashboard preview — it is to make every page **obey the same rules** so the entire application feels like one continuous, premium, matte slate-carbon glass experience.

This document, combined with the source code in `src/ui-staging/DashboardPage.tsx` and the reference screenshots, is now the complete contract for successful implementation.

---

**End of V3 Veil Glass Design System & Implementation Specs**