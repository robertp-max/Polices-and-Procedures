# CARE_INDEED_LIGHT_ORANGE_THEME_SPEC.md

**Theme:** Care Indeed Light Orange (Gemini Theme Work)
**Branch:** gemini-light-orange-theme
**Primary Visual Baselines:**
- OASIS-E2 Start of Care Assessment screenshot
- Policy Viewer / Annual Governance Self-Assessment screenshot

**Status:** Design Specification and Recommended Improvements accepted. Plan and component contracts updated prior to any implementation.

---

## 1. Design Philosophy

The "Care Indeed Light Orange" theme balances clinical professionalism with a warm, modern, and highly legible interface. It moves away from heavy, floating dashboards toward grounded, airy containers. The visual hierarchy relies heavily on strong color contrast (Deep Teal vs. Canvas Off-White) and subtle borders rather than heavy drop shadows, reducing cognitive load for reading-heavy tasks.

**Do not create a generic orange theme. Extract the exact visual system from the screenshots.**

---

## 2. Color Palette (Approximated Tokens)

### Brand Colors

- **Deep Teal (`~#0A4D44`)**: Primary headings (H1, H2), active tab underlines, card titles, and active text. Conveys clinical authority.
- **Muted Teal (`~#2B7A71`)**: Eyebrow text, secondary labels (e.g., "Domain & Subdomain"), badge text.
- **Mint Tint (`~#EEF5F4`)**: Subtle backgrounds (e.g., "Estimated time" card), badge backgrounds, highlight panels.
- **Orange (`~#F26E36`)**: Used exclusively for high-emphasis primary actions (Start, Next, active states). Also for secondary outline buttons.

### Neutrals & Surfaces

- **Canvas Background (`~#F8FAFC`)**: Off-white/Light Gray. The main page background that allows the pure white cards to pop.
- **Surface (Card) (`#FFFFFF`)**: Pure white for primary content containers and grid cards.
- **Surface (Subtle Block) (`~#F9FAFB` or `~#F0F4F4`)**: Background of inner metadata blocks.
- **Text (Body Primary) (`~#374151`)**: Dark Slate. Highly readable body text.
- **Text (Muted) (`~#6B7280`)**: Medium Gray. Standard descriptions, pagination text, inactive tabs.
- **Border Subdued (`~#E5E7EB`)**: Thin borders on feature grid cards and outline buttons.

---

## 3. Typography

- **Font Family:** Clean, modern Sans-Serif (e.g., Inter, Roboto).
- **H1 (Page Titles):** ~32px–36px, Semi-bold/Bold, Deep Teal.
- **H3 (Card Titles):** ~16px–18px, Medium weight, Deep Teal.
- **Body Text:** ~15px, Regular weight, Dark Slate, high line-height (`1.5` - `1.6`) for reading legibility.
- **Eyebrow / Kickers:** ~12px, UPPERCASE, Bold/Semi-bold, heavy letter-spacing (`tracking-wider`), Muted Teal / accent.
- **Button Text:** ~14px, UPPERCASE, Semi-bold, medium letter-spacing.

---

## 4. UI Geometry & Component Breakdown

- **Main Page Containers (Policy Viewer style):** Pure white background, massive border radius (`rounded-[24px]` or `rounded-3xl`), soft/diffuse drop shadow, **no border**, generous inner padding (`p-8` or `p-10`).
- **Grid Cards (OASIS feature grid style):** White background, medium radius (`rounded-xl` / ~12px), 1px solid subdued border, **flat (no shadow)**, standard padding (`p-5` or `p-6`).
- **Tinted Cards ("Estimated time" style):** Light Mint background, medium radius, no border, flat.
- **Tabs (Policy Viewer style):** Underline style. Sits directly on the canvas background. 
  - Active: Deep Teal text + thick Deep Teal bottom border.
  - Inactive: Muted Gray text.
  - Transparent background, text-based, no heavy container styling.
- **Buttons:**
  - Primary: Solid Orange background, white text.
  - Secondary Outline: White background, thin Orange border, Orange text + Icon.
- **Badges:** Pill-shaped (`rounded-full`), Light Mint background, thin Teal outline, Teal (Muted) text.

---

## 5. Required Component Contracts (Updated)

### CareIndeedTabs
- Use **underline tabs**, not pill tabs.
- Support:
  - transparent background
  - text-based tabs
  - active tab with deep teal text
  - active tab with thick deep teal bottom border
  - inactive tabs with muted gray text
  - no heavy container styling

### CareIndeedCard
- Do **not** make every card the same.
- Must support variants:

  - `variant="container"`
    - huge radius / rounded-3xl
    - pure white surface
    - soft diffuse shadow
    - no visible border
    - generous padding
    - used for policy viewer document shell / major panels

  - `variant="grid-outline"`
    - medium radius / rounded-xl
    - white background
    - 1px subdued border
    - flat / no shadow
    - used for OASIS feature grid cards

  - `variant="grid-tinted"`
    - medium radius
    - pale mint / teal-tint background
    - flat / no border
    - used for estimated time / highlight cards

### CareIndeedButton
- Add shape variants.
- Support:
  - `variant="primary"` → orange filled, white text
  - `variant="outline"` → white bg, orange border, orange text
  - `shape="rounded"` → rounded-lg / normal CTA rectangle
  - `shape="pill"` → rounded-full / policy viewer next button

### CareIndeedDataBlock (NEW)
- Reusable metadata block component.
- Support:
  - small accent-teal label
  - darker value text below
  - subtle light gray/mint background
  - rounded corners
  - used for policy metadata blocks like Domain & Subdomain, Status & Version, etc.

### CareIndeedEyebrow (NEW)
- Reusable typography primitive.
- Support / style:
  - uppercase
  - small text
  - semi-bold
  - wide letter spacing
  - teal/accent text
  - used above page titles, section labels, and badges

### CareIndeedBadge (existing reference)
- Small uppercase letter-spaced eyebrow label and tag badges (mint tint).

---

## 6. Token Family Updates (Approximate)

Define in tokens (Tailwind + CSS vars) before hardcoding:

- **Deep Teal**: primary headings, active tabs, card titles
- **Muted Teal**: eyebrow text, metadata labels, badge text
- **Mint Tint**: subtle card backgrounds, badges, highlight panels
- **Orange**: primary CTAs only, secondary outline buttons, next/start actions
- **Off-white canvas**: app/page background
- **White**: major content panels and cards
- **Subdued border**: grid card borders, outline button borders, soft separators

**Guardrail:** Do not hardcode these styles repeatedly. Update reusable tokens/components first, then apply them to pilot pages.

---

## 7. Implementation Guardrails & Process

- Primary baselines: OASIS-E2 SOC screenshot + Policy Viewer screenshot.
- Do not create generic orange theme — match exact visual system.
- Update reusable tokens/components first.
- Pilot order (strict):
  1. Theme tokens + docs
  2. Shared components (CareIndeedTabs, CareIndeedCard variants, CareIndeedButton + shapes, CareIndeedDataBlock, CareIndeedEyebrow)
  3. Policy Viewer pilot
  4. OASIS / Advanced Training landing pilot
  5. Journey card grid **only if low risk**

### Commit Discipline (Incremental, mandatory pre-commit checks)

Keep incremental commits:

- `feat(theme): add Care Indeed light orange tokens`
- `feat(theme): add reusable light theme components`
- `feat(theme): apply light orange theme to policy viewer`
- `feat(theme): apply light orange theme to advanced training landing`
- `feat(theme): apply light orange theme to journey cards`

**Before every commit:**
- `git diff --name-only`
- verify only theme/UI files changed
- run `npx tsc -b`
- capture screenshot
- confirm no console red errors

**Absolute:**
- Do not push.
- Do not deploy.
- Do not open PR.
- Do not hardcode repeatedly in pilots; use the components/tokens.

---

## 8. Recommended Improvements to Original Plan (Incorporated)

```diff
  2. Reusable Visual Components
- [NEW] CareIndeedCard.tsx (rounded-2xl with soft shadow)
+ [NEW] CareIndeedCard.tsx (Variants: 'container' with massive radius/shadow, 'grid-outline' flat/bordered, 'grid-tinted' mint bg)
- [NEW] CareIndeedButton.tsx (orange primary, orange outline)
+ [NEW] CareIndeedButton.tsx (orange primary, orange outline; shape variants: 'rounded' and 'pill')
- [NEW] CareIndeedTabs.tsx (Horizontal category tabs/pills)
+ [NEW] CareIndeedTabs.tsx (Underline style tabs with thick Dark Teal active border)
  [NEW] CareIndeedBadge.tsx (Small uppercase letter-spaced eyebrow label and tag badges)
+ [NEW] CareIndeedEyebrow.tsx (Reusable typography primitive for uppercase, tracked-out kicker text)
+ [NEW] CareIndeedDataBlock.tsx (2-line metadata display with accent-teal label, dark value, and subtle rounded background)
```

---

## 9. Source of Truth & Cross-References

- This document is the controlling spec for the Gemini light orange theme.
- Existing app tokens (V6_TOKEN_REGISTRY.md, tailwind.config.js, src/index.css) will be extended or selectively overridden for this theme work.
- Component implementations will live under `src/v6/primitives/` and/or dedicated theme-aware components (CareIndeed*).
- All work must respect AGENTS.md rules (no .js emission in src, no destructive git on this branch).

**Next after plan update:** Proceed to implementation following pilot order and commit discipline.

---

*Document created/updated on branch `gemini-light-orange-theme` from accepted Design Specification + corrections.*
