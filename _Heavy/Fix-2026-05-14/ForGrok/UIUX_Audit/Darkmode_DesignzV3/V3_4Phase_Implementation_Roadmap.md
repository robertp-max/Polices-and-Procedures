# V3_4Phase_Implementation_Roadmap.md

**Darkmode_DesignzV3 Program**  
**Unorthodox 4-Phase Requirement Gathering + Implementation Process**  
**Status:** Phase 1 + Phase 1.1 Complete — Phase 2 Ready  
**Date:** 2026-05-18  
**Location:** `Darkmode_DesignzV3/` folder

---

## Executive Summary

This document defines the **unorthodox but highly effective 4-phase process** we are using to redesign the Care Indeed Home Health operational UI to the new V3 premium glassmorphic dark-mode-first language.

The process deliberately inverts the traditional "design → handoff → implement" flow. Instead, we use a **coordinated team of 16 specialized agents** to perform extremely deep, cross-referenced requirement gathering and design application specification work *before* any code is written. The output is so complete and consistent that a single high-capability model (Claude / Grok) can generate large portions of production-grade code with minimal clarification.

**Core Philosophy**
- Phase 1 is deliberately heavy on analysis and specification.
- **Phase 1.1** is an additional focused "declutter surgery" pass (also using the 16-agent method) to guarantee the new V3 Veil Glass language actually delivers on being dramatically cleaner.
- Later phases become dramatically faster and higher quality because ambiguity and visual noise have been removed.
- The 16 agents do not disappear after Phase 1/1.1 — they transition into reviewers, gatekeepers, and domain experts during implementation.

---

## The 4 Phases at a Glance

| Phase | Name | Status | Primary Output | Key Owners | Exit Gate |
|-------|------|--------|----------------|------------|-----------|
| **1** | Unorthodox Requirement Gathering (16-Agent Design Application Specs) | **Complete** | 16 detailed specs + unified foundation contracts + master codegen prompt | All 16 Agents + Orchestrator | 16/16 specs + Second Pass Audit + Agent 16 countersign |
| **1.1** | V3 Veil Clutter Reduction (16-Agent Progressive Disclosure Strategy) | **Complete** | Behavior contract + extensive theme spec + two-layer Veil model + folder hierarchy + global shell rules | All 16 Agents | `V3_Veil_Drawer_Behavior_Spec.md` + `V3_Veil_Glass_Theme_Tokens_Spec.md` locked + four approved visual references |
| **2** | V3 Veil Glass Foundation Realization | **Ready** | Token system, VeilDrawer (two-layer non-stacking), TaskRowMinimal, Evidence folders with %, single bordered global shell, pilot surface | Agents 03, 02, 15, 04, 06, 07, 16 | All primitives + pilot surface pass Agent 16 fidelity gate against locked theme + behavior specs |
| **3** | Coordinated Surface Generation & Implementation | Future | All remaining surfaces implemented using the master codegen prompt + per-surface specs | Domain Agents (06–14) + 16 as reviewer | Every surface passes its own Agent 16 fidelity gate + cross-surface visual regression |
| **4** | Migration, Hardening & Production Rollout | Future | Legacy removal, full a11y + performance + mobile parity, production deployment | Agents 14, 13, 12, 16 + Platform/DevOps | Zero critical V3 fidelity defects in production + successful dark/light parity + migration complete |

---

## Phase 1 — Unorthodox Requirement Gathering (Complete)

**Goal:** Remove 90%+ of ambiguity before any pixel is coded.

**How it was executed (the unorthodox part):**
- 16 specialized agents worked as a **tightly coupled system** (not independent silos).
- Each agent was assigned specific surfaces + cross-cutting concerns.
- Every agent produced a structured **Design Application Specification** using a rigid 11-section schema.
- Critical unification happened at three points:
  - **Agent 03** — New V3 dark floating glass token families (first-class dark, precise light pairing)
  - **Agent 15** — Single-source `FloatingGlassCard` primitive + 7 official V3 pattern variants (mandatory for everyone)
  - **Agent 16** — Visual fidelity checklist + harness + 10-criteria Phase 1 Exit Gate + codegen quality rules
- A second pass audit was performed to catch coordination gaps, weak endpoint sections, and inconsistent references to the new foundation.

**Artifacts Delivered (all in this folder):**
- 16 individual `Agent_XX_V3_*_Phase1_DesignSpec.md` files (now complete)
- `V3_Phase1_Second_Pass_Audit_Report.md`
- `V3_Phase1_Master_Combined_Spec.md`
- `V3_Phase1_Claude_Codegen_Prompt.md` (the single prompt that will drive most of Phase 3)

**Exit Criteria Met:**
- [x] All 16 specs written and reviewed in second pass
- [x] Unified foundation contracts defined (tokens + `FloatingGlassCard` + fidelity rules)
- [x] Master codegen prompt exists and contains the 10 Agent 16 quality gates + "use only the official library" rules
- [x] Second Pass Audit completed with documented gaps and fixes

**Phase 1 is officially closed.**

---

## Phase 1.1 — V3 Veil Clutter Reduction (Complete)

**Goal:** Take the V3 direction defined in Phase 1 and apply aggressive, ruthless decluttering to the default page view.

After the initial Phase 1 work, it became clear that even with the new direction, the default views were still too dense. The user explicitly requested a **minimum 70% reduction** in clutter on the default page view.

### How Phase 1.1 Will Be Executed

- Redeploy the 16-agent team with a new, narrower mandate focused purely on **progressive disclosure and decluttering**.
- The agents will analyze the current cluttered state (reference screenshot provided) and produce concrete strategies for:
  - Moving the vast majority of content into a right-side "Veil" drawer
  - Using hover cards and micro-previews intelligently
  - Strategic use of modals
  - Maximizing React component reusability
  - Keeping glassmorphism but making it contextual and minimal
- The output of this phase will directly feed the implementation work in Phase 2.

### Official Prompt

The complete prompt and agent specializations for this phase live here:  
`Phase1.1_V3_Veil_Clutter_Reduction_Prompt.md`

This is the document that will be used to launch the 16 agents for the clutter reduction strategy session.

### Exit Criteria for Phase 1.1

- All 16 agents have delivered their recommendations
- A consolidated "70% Clutter Reduction Strategy" document is created
- Clear rules exist for what belongs in the default list vs the Veil Drawer vs hover vs modal
- Measurement approach for proving 70%+ reduction is defined (Agent 16)
- The strategy is approved before Phase 2 foundation work begins

**Phase 1.1 is officially complete.**

All required behavioral contracts, disclosure rules, and the two-layer Veil model have been locked in `V3_Veil_Drawer_Behavior_Spec.md`. Visual language is locked in `V3_Veil_Glass_Theme_Tokens_Spec.md`. The four approved prototype references are the visual north stars.

---

## Phase 2 — V3 Veil Glass Foundation Realization

**Goal:** Build the production-grade primitives that enforce the new "minimal default + powerful contextual Veil" experience. The Veil Drawer is now the hero component.

### 2.1 Core Deliverables (Updated for Veil Era)

1. **V3 Veil Glass Token System** (see `V3_Veil_Glass_Theme_Tokens_Spec.md`)
   - Full dark carbon + smoke grey palette + restricted teal/orange accents
   - Rich Veil glass treatment (frosted blur, luminous borders, specific glow)
   - Light mode premium pairing
   - All spacing, typography, elevation, and motion tokens

2. **Veil Drawer System** (Highest priority)
   - `VeilDrawer` primitive with full two-layer sequential non-stacking support
   - `VeilSection` internal collapsible glass blocks
   - `useVeil()` state management enforcing the behavior contract
   - Exit-right → enter-left transition when moving from yellow Layer 1 to red Layer 2

3. **Minimal List Primitives**
   - `TaskRowMinimal` — the only row component allowed on default views
   - `EvidenceFolderRow` — strict folder hierarchy with % completion on every folder icon

4. **Global Shell**
   - Single bordered main card that contains the entire application
   - Hamburger (top-left), logo + search with preview, collapsed nav, bottom nav icons

5. **Supporting Atoms**
   - Status pills, hover cards, compliance header strip, search preview

6. **Pilot Surface**
   - First full implementation (recommended: CES Calendar + Task List) to validate the entire system

### 2.2 Process & Tooling

- All work must strictly follow:
  - `V3_Veil_Drawer_Behavior_Spec.md`
  - `V3_Veil_Glass_Theme_Tokens_Spec.md`
- Visual regression against the four locked approved prototypes
- Every new component carries a V3 fidelity comment block

### 2.3 Exit Gate (Strict)

- All core primitives exist and are the **only** allowed way to build V3 UI
- Veil two-layer non-stacking behavior works perfectly in the pilot surface
- Default view achieves measured ≥70% clutter reduction
- Both dark and light modes pass visual fidelity review against the four approved references
- Agent 16 + Design Lead sign-off

**Phase 2 is the critical bridge.** Once these primitives are solid, Phase 3 surface generation can proceed at high speed with almost zero visual or behavioral drift.

---

## Phase 3 — Coordinated Surface Generation & Implementation

**Goal:** Use the Phase 1 master prompt + the 16 detailed specs to generate the rest of the product at high speed and extremely high visual fidelity.

### 3.1 The Magic

The `V3_Phase1_Claude_Codegen_Prompt.md` (strengthened during second pass) now contains:
- All 16 agent specs concatenated
- The two V3 reference images as non-negotiable visual truth
- Explicit instruction: "You must compose exclusively from `FloatingGlassCard` + the 7 patterns defined by Agent 15"
- The 10 Agent 16 quality gates
- "Dashboard is the oracle" rule

### 3.2 Execution Model (Still Unorthodox)

- The same 16 agents do **not** write the code.
- They become **reviewers and gatekeepers**.
- For each major surface, the codegen model produces a first draft.
- The responsible domain agent (e.g., Agent 07 for Evidence) + Agent 16 run the fidelity harness + visual review.
- Only after passing the gate does the code go into the main branch.

### 3.3 Recommended Generation Order

1. Dashboard (already done in Phase 2 — becomes the template)
2. Evidence Center (high volume + regulatory showcase)
3. CES surfaces (Board, MyTasks, Workloads)
4. Calendar + Staffing Calendar
5. Policy Library + Detail + Lifecycle
6. Onboarding V2 (convergence)
7. Audit, iAdministrator, PM views, etc.
8. All drawers, modals, bottom sheets, print views
9. Mobile parity pass across everything

### 3.4 Exit Gate

- Every surface has passed its own instance of the Agent 16 V3 Fidelity Gate.
- Cross-surface visual regression matrix (Agent 15 + 16) shows perceptual consistency for all shared patterns.
- Full light/dark + mobile + reduced-motion coverage proven.
- No new ad-hoc card families or token violations introduced.

---

## Phase 4 — Migration, Hardening & Production Rollout

**Goal:** Safely replace the old visual system with V3 across the entire product and ship it.

### 4.1 Workstreams

- **Legacy Removal (Agent 14 lead)**
  - Systematic strangler migration of all old card families, `.glass-*-lib`, `CesCard`, local inventions, etc.
  - PR template that blocks merges without Agent 14/15/16 countersign.

- **Hardening**
  - Full a11y audit against the new glass surfaces (Agent 13)
  - Performance & motion tuning on real devices
  - Dark/light theme stability + theme switching UX

- **Production Deployment**
  - Feature flag or parallel theme rollout (recommended: `data-v3-mode="on"` or similar)
  - Canary surfaces first (Dashboard + Evidence)
  - Full rollout with monitoring of visual regression alerts

- **Post-Launch**
  - Real user feedback loop
  - Minor visual refinements
  - Documentation handoff to design systems team

### 4.2 Final Exit Criteria (Program Complete)

- Zero open V3 fidelity defects in production (Agent 16 gate)
- All legacy visual dialects removed or explicitly marked "migration only"
- Design Lead + Accessibility Lead + Engineering Lead sign-off
- The 16-agent team produces a retrospective + updated playbook for future redesigns

---

## How the 16 Agents Evolve Across Phases

| Phase | Role of the 16 Agents |
|-------|-----------------------|
| 1 | Primary authors of requirements and contracts |
| 2 | Implementers (for their foundation area) + reviewers of Dashboard |
| 3 | Reviewers + gatekeepers (domain agent + Agent 16 must both approve) |
| 4 | Migration approvers + final fidelity police |

This continuity is one of the reasons the process is so effective — institutional knowledge is never lost.

---

## Tooling & Artifacts That Span All Phases

- Visual Regression Harness (defined by Agent 16)
- `V3_Phase1_Claude_Codegen_Prompt.md` (the weapon for Phase 3)
- `primitives/CATALOG.md` + `ui/patterns/` (single source of truth)
- Per-surface `SURFACE_CHECKLISTS/` updated to V3
- This 4-phase roadmap document (living)

---

## Why This Unorthodox Approach Is Worth It

Traditional flow:
Design mocks → 6 weeks of questions → 4 months of implementation → "why doesn't it look like the mock?"

This flow:
16 agents spend intense time removing ambiguity → 1–2 weeks of foundation → 4–6 weeks of high-fidelity generation + review → product that actually matches the approved V3 language on first release.

The investment in Phase 1 pays for itself many times over in reduced rework and dramatically higher visual quality.

---

**Document Owner:** Orchestrator (Grok) + Agent 16 (Fidelity Gatekeeper)  
**Next Action:** Begin Phase 2 execution (start with Agent 03 token implementation + Agent 15 `FloatingGlassCard`).

---

*This is the authoritative 4-phase program plan for the Darkmode_DesignzV3 effort. All future work should reference this document.*