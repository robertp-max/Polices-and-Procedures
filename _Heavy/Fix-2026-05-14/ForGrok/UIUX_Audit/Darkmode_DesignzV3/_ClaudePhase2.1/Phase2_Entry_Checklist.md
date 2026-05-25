# Phase 2 Entry Checklist & Kickoff Guide

**Date:** 2026-05-18  
**Goal:** Ensure everything is in place before starting foundation coding

---

## Pre-Phase 2 Checklist (Must Be Complete)

### Documentation (All Locked)
- [x] `V3_Veil_Drawer_Behavior_Spec.md` — Exact interaction rules
- [x] `V3_Veil_Glass_Theme_Tokens_Spec.md` — Full visual language + tokens
- [x] `Phase2_V3_Foundation_Implementation_Plan.md`
- [x] `Phase2_Core_Primitives_Spec.md`
- [x] `V3_4Phase_Implementation_Roadmap.md` (updated)
- [x] Four approved visual references in `_prototypes/_approved/`

### Existing Code Understanding
- Current glass implementation (`GlassPanel.tsx`, `.ci-glass-panel`)
- Existing drawer components (`RightDrawer.tsx`, `GlobalTaskDrawer.tsx`)
- Current token/theme system (`src/index.css`, `ces/theme.ts`)
- Form + Evidence upload workflow

### Decision Log (Captured)
- Non-stacking drawer rule
- Form must be uploaded before evidence
- Evidence is strictly folder-based with % on every folder
- Single main bordered card shell
- Yellow (Layer 1) → Red (Layer 2) content highlighting
- Only two accent colors allowed

---

## Recommended First 3 Weeks of Phase 2

**Week 1**
- Implement full V3 token system (dark + light)
- Build `VeilDrawer` + `VeilSection` + `useVeil` store
- Basic animation + non-stacking transition working

**Week 2**
- `TaskRowMinimal`
- Global shell primitives (`MainBorderedCard`, header, collapsed nav)
- `EvidenceFolderRow`

**Week 3**
- Supporting atoms + search preview
- Pilot surface (CES Calendar or Task List)
- Internal fidelity review
- Agent 16 gate

---

## Key Questions to Answer Before Heavy Coding Starts

1. Will we evolve the existing `.ci-glass-panel` system or create a parallel `v3-veil-*` token family?
2. What state management solution will own the Veil (local + global)?
3. How will we handle form state persistence when the Veil closes and re-opens?
4. Do we want a "Dense Mode" escape hatch for power users? (recommended to decide early)

---

**When all items above are reviewed and the team is aligned, Phase 2 can begin with maximum clarity and minimum rework.**