# Phase 2.1 — Exact Build Order & Deliverables

**Use this as your implementation checklist when working with Claude.**

---

## Phase 2.1.1 — Token System

**Deliverables:**
- `tokens/v3-tokens.json` (or equivalent in theme system)
- All `--v3-*` CSS custom properties implemented exactly as defined in `V3_Veil_Glass_Theme_Tokens_Spec.md` v1.1
- Tailwind config extension
- Dark + Light theme support wired globally
- Updated `index.css` with new Veil glass values (especially 22px blur)

**Success Gate:** Tokens can be used in any component without hard-coded values.

---

## Phase 2.1.2 — Veil Drawer System (Most Important)

**Must Build:**
1. `VeilDrawer.tsx`
   - Props as defined in `Phase2_Core_Primitives_Spec.md`
   - Layer 1 → Layer 2 sequential transition (close first, then open)
   - Stronger glass using v1.1 token values
2. `VeilSection.tsx` (collapsible inner blocks with enhanced inner glass)
3. `useVeil` hook / store (single source of truth for open state + context)

**Success Gate:** You can open Layer 1, click a task, see Layer 1 fully exit, then Layer 2 enter — with beautiful strong glass.

---

## Phase 2.1.3 — Core Minimal Components

**Must Build:**
- `TaskRowMinimal.tsx`
- `EvidenceFolderRow.tsx` (with % badge on folder)
- `StatusPillV3.tsx`

**Success Gate:** Default lists using these components feel extremely calm and scannable.

---

## Phase 2.1.4 — Global Shell (Merged Nav + Broken Lines)

**Must Build:**
- Main container component
- Left nav that merges visually
- Broken/interrupted line separators (vertical primary, horizontal secondary)
- Header elements: Hamburger, Logo, Search with preview, bottom nav icons

**Success Gate:** The shell feels integrated and premium. No hard sidebar borders.

---

## Phase 2.1.5 — Supporting Primitives

- `MinimalHoverCard`
- `SearchWithPreview`
- `ComplianceHeaderStrip`

---

## Final Phase 2.1 Milestone

After all primitives exist:
- Build a **small pilot surface** (e.g. Calendar + Task list) using only the new foundation.
- Verify it passes visual fidelity against the approved references.
- Confirm 70%+ clutter reduction on the default view.

---

**Print this checklist and use it to track progress with Claude.**