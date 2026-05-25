# Phase 1.1 — V3 Veil Clutter Reduction Strategy

**Program:** Darkmode_DesignzV3  
**Phase:** 1.1 (Aggressive Default View Decluttering)  
**Status:** Complete  
**Date:** 2026-05-18  
**Goal:** Reduce visual and cognitive clutter on default page views by **minimum 70%** using the V3 Veil Glass language.

---

## 1. Executive Summary

The current task/workflow execution surfaces are extremely dense. Multiple expanded sections (FORM, EVIDENCE, SIGNATURES, REVIEW, AUDIT, etc.) plus heavy secondary lists are shown by default, creating high visual noise and cognitive load.

**Phase 1.1 Solution:**  
Move to a **clean, minimal default list view** + a **contextual right-side Veil Drawer** (with supporting hover cards and modals) as the primary mechanism for revealing detail.

This approach delivers a **70%+ reduction** in clutter on the default view while preserving (and improving) access to information when needed.

The glassmorphism is now **contextual and restrained** — rich glass treatment lives primarily inside the Veil Drawer, not everywhere.

---

## 2. The Core Philosophy (V3 Veil Glass)

- **Dark + Minimal** is the dominant personality on default views.
- Glassmorphism is still used, but **only contextually** (mostly inside the Veil Drawer and modals).
- The default view should feel calm, scannable, and lightweight.
- Detail is revealed progressively through the **Veil Drawer** (the "veil" that appears when needed and completely disappears when closed).

---

## 3. What the Default View Should Look Like

From Agent 06 (Minimal Core) + supporting agents:

**Per task row in the default list, show only:**
- Checkbox (for bulk actions)
- Task title (1 line)
- Optional one-sentence context/description
- Status pill (clear visual)
- Due date (relative + color)
- Owner avatar (small)
- 1–2 primary quick actions maximum

**Everything else is removed from the default view.**

This single decision is responsible for the majority of the 70%+ reduction.

---

## 4. The Veil Drawer (Primary Mechanism)

The **Veil Drawer** (right-side panel) is the main container for almost all execution detail.

**Key characteristics (from Agent 03):**
- Slides in as an overlay from the right.
- Uses rich V3 Veil Glass treatment (frosted translucent dark glass with strong 4-sided luminous borders).
- When closed, it completely unmounts and disappears — zero visual footprint left behind.
- Background list gets a subtle scrim so the "veil" metaphor is felt.
- Content inside is organized into clean `VeilSection` components.

This replaces the old pattern of always-expanded sections or heavy persistent side panels.

---

## 5. Progressive Disclosure Rules

**What moves where:**

| Content Type                    | Recommended Container          | Reason |
|--------------------------------|--------------------------------|--------|
| Task title, status, due, owner | Default List (minimal row)    | Needed for scanning & triage |
| Form fields & editing          | Veil Drawer                   | Deep work |
| Evidence lists & uploads       | Veil Drawer (with hover previews) | High volume but not always needed |
| Signatures & certification     | Veil Drawer                   | Workflow depth |
| Audit / Lock history           | Veil Drawer                   | Reference only |
| Quick facts (counts, status changes, assignee) | Hover Cards / Previews | Fast answers without opening drawer |
| Deep focused actions (full artifact, bulk ops) | Modals | Temporary high-focus moments |

These rules were synthesized primarily from Agents 02, 06, 07, and 05.

---

## 6. React Component Recommendations (Maximize Reusability)

From Agent 08 + supporting agents, the following components are recommended for Phase 2:

**Core New Components:**
- `TaskRowMinimal` — The new atomic list item (used everywhere)
- `VeilDrawer` — The single, configurable right-side panel (becomes bottom sheet on mobile)
- `VeilSection` — Standard collapsible glass section inside the drawer
- `EvidenceCountChip` — Count + hover preview
- `StatusPillWithHistory` — Hover for timeline
- `QuickActionGroup` — Max 2–3 actions on list rows

These components should replace dozens of duplicated patterns across CES, Evidence, Calendar, Policy, PM, etc.

---

## 7. Consistency & Governance

The new pattern must be applied **universally** across all surfaces (Agent 14).

**Recommended governance:**
- Any new list view must use `TaskRowMinimal` + `VeilDrawer`.
- Exceptions require sign-off from Agents 14 + 16.
- A "V3 Veil Pattern Playbook" and "Veil vs Modal Decision Framework" will be maintained.

---

## 8. Measurement & Validation (How We Prove 70%+)

From Agent 16 + supporting agents:

**Primary Metrics:**
- DOM node count on default list view (target: ≥70% reduction)
- Visual element count per task row
- Information density score
- Time-to-first-action (scan + decide)
- User-reported cognitive load

**Validation Approach:**
- Before/after comparison using the reference cluttered screenshot.
- Cross-surface consistency audit.
- Real user testing on high-volume flows.

---

## 9. Risks & Trade-offs

| Risk | Mitigation |
|------|----------|
| Users feel information is "hidden" | Excellent hover previews + very fast Veil opening |
| Power users resist the change | Offer an advanced "Dense Mode" toggle (not default) |
| Mobile experience suffers | Veil becomes native-feeling bottom sheet |
| Teams want to keep old dense patterns | Strong governance + Agent 14/16 sign-off required for exceptions |

**Overall trade-off:** Slightly more clicks for deep detail, but dramatically better focus, speed, and mental clarity for the primary list view.

---

## 10. Recommended Next Steps (Into Phase 2)

1. **Lock the core definitions** (already done in Phase 1.1):
   - `TaskRowMinimal` spec
   - `VeilDrawer` primitive + glass tokens
   - Disclosure / Containment Matrix

2. **Build the foundation components** in Phase 2:
   - `TaskRowMinimal`
   - `VeilDrawer` + `VeilSection`
   - Supporting chips and hover components

3. **Pilot on one high-volume surface** (recommended: MyTasks or CES Board) before broader rollout.

4. **Update the master codegen prompt** with the new Veil pattern rules before generating more surfaces.

5. **Create the official V3 Veil Pattern Playbook** and Decision Frameworks for the broader team.

---

**Phase 1.1 is now complete.**

We have a clear, aggressive, and practical strategy to deliver a minimum **70% reduction** in default page view clutter while staying true to the V3 Veil Glass language.

This strategy is ready to guide implementation in Phase 2.

---

*Document synthesized from the full 16-agent Phase 1.1 output.*