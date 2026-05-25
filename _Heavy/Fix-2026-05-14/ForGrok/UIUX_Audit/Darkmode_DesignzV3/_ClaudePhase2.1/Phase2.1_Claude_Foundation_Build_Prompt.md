# Phase 2.1 — Claude Foundation Build Prompt (V3 Veil Glass)

**Project:** Care Indeed Home Health — Policies & Procedures Application  
**Phase:** 2.1 — Foundation Implementation  
**Goal:** Build the complete, production-ready V3 Veil Glass primitive layer that will be used for all future surfaces.

**You are an elite senior frontend engineer + design system architect.** Your job is to implement the foundation components exactly as specified in the attached documents, with zero deviation on visual language, behavior, and architecture.

---

## 1. Core References (Read These First)

You must treat the following documents as **non-negotiable source of truth**:

1. `V3_Veil_Glass_Theme_Tokens_Spec.md` (v1.1) — Full visual language, colors, stronger glassmorphism values, broken line nav separation, merged shell treatment.
2. `V3_Veil_Drawer_Behavior_Spec.md` (v1.1) — Exact two-layer Veil behavior, non-stacking rule, global shell rules with merged nav + broken lines.
3. `Phase2_Core_Primitives_Spec.md` — Detailed component contracts.
4. `Phase2_V3_Foundation_Implementation_Plan.md` — Recommended build order and exit criteria.

All other files in this folder are supporting context.

---

## 2. Design Language Summary (Critical)

- **Dark-first, premium, expensive, calm** aesthetic.
- **Stronger glassmorphism** on the Veil Drawer (22px blur, richer frost, enhanced teal glow).
- **Single main container** that holds everything.
- **Left navigation merges** with the main content. Use **broken/interrupted vertical and horizontal lines** (segmented, gapped strokes) for separation — never solid continuous borders.
- Default views must be **extremely minimal** (70%+ clutter reduction).
- The Veil Drawer is the **one and only** place for rich detail.
- Only two accent colors: Brand Teal `#007970` and Warm Orange `#E07B2C`.

You must implement the **exact token values** defined in the Theme Tokens spec.

---

## 3. Build Order (Strict — Do Not Deviate)

Implement in this exact sequence:

### Phase 2.1.1 — Tokens & Foundation
1. Create / extend the V3 token system (`tokens/v3-tokens.json` or equivalent in `src/policy/ces/theme.ts` + `index.css`).
2. Define all `--v3-*` variables exactly as specified (especially the strengthened Veil glass tokens).
3. Wire tokens into Tailwind config and global CSS.
4. Create dark + light pairings.

### Phase 2.1.2 — Veil System (Highest Priority)
1. Build `VeilDrawer` component with:
   - Full support for `layer={1 | 2}`
   - Sequential non-stacking transition (Layer 1 must fully exit right before Layer 2 enters)
   - Stronger glass treatment (use the v1.1 token values)
   - Proper focus management, ESC, backdrop click
2. Build `VeilSection` (collapsible inner glass blocks with enhanced inner glass)
3. Create `useVeil()` hook or store that enforces the global single-Veil contract.

### Phase 2.1.3 — Minimal List Primitives
1. `TaskRowMinimal` — ultra-clean row used everywhere on default views.
2. `EvidenceFolderRow` — Google Drive/Windows style with large % completion badge directly on folder.

### Phase 2.1.4 — Global Shell (Merged Nav)
1. Implement the main container + merged navigation system.
2. Use **broken/interrupted lines** for nav separation (vertical + occasional horizontal).
3. Hamburger (top-left inside container), logo, search with preview, collapsed nav, bottom icons (notification + profile).
4. Ensure the shell feels integrated and premium.

### Phase 2.1.5 — Supporting Atoms
- `StatusPillV3`
- `MinimalHoverCard`
- `SearchWithPreview`
- `ComplianceHeaderStrip` (STEP / SLA / RISK / AUDIT READINESS row)

---

## 4. Non-Negotiable Rules

- **Never** put glass on default list rows or static cards.
- **Never** create surface-specific drawer variants — there is only one `VeilDrawer`.
- **Never** use solid continuous borders between nav and content — only broken lines.
- When moving from Veil Layer 1 to Layer 2, the first drawer **must fully close** before the second opens.
- All new components must include a comment block like:

```tsx
// V3 Fidelity — Phase 2.1
// References: V3_Veil_Glass_Theme_Tokens_Spec.md v1.1 + V3_Veil_Drawer_Behavior_Spec.md v1.1
```

- Dark mode is primary. Light mode must look equally premium.

---

## 5. Output Requirements

For every component you create, provide:

1. The full `.tsx` file with proper typing.
2. Any required CSS / token additions.
3. A short usage example.
4. Storybook or visual test story (if applicable).
5. Confirmation that it matches the latest theme tokens and behavior spec.

---

## 6. Phase 2.1 Exit Criteria (You Must Hit These)

Before declaring foundation complete:

- Tokens are implemented and easy to use.
- `VeilDrawer` + `VeilSection` fully support the two-layer non-stacking behavior with stronger glass.
- `TaskRowMinimal` and `EvidenceFolderRow` are extremely clean.
- Global shell uses merged nav + broken line separation.
- A pilot surface (CES Calendar or My Tasks view) can be built quickly using only these primitives.
- Both dark and light modes look correct against the approved references.

---

## 7. Files You Must Reference Constantly

All files are located in this `_ClaudePhase2.1` folder:

- `V3_Veil_Glass_Theme_Tokens_Spec.md`
- `V3_Veil_Drawer_Behavior_Spec.md`
- `Phase2_Core_Primitives_Spec.md`
- `Phase2_V3_Foundation_Implementation_Plan.md`
- `Phase2_Entry_Checklist.md`

---

**Begin by reading all the reference documents in this folder.**

Then start with the token system.

When you are ready, tell me the first file you want to generate or ask any clarifying questions.

You have full permission to ask for clarification on anything that is ambiguous before writing code.

Now begin Phase 2.1 foundation implementation.