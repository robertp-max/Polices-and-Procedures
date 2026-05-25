# V3 Veil Glass + UI/UX Reconstruction Program
## Executive Summary & Complete New-Hire Onboarding Guide

**Document Purpose**: This is the single source of truth that a new engineer, designer, or PM can read in one sitting and immediately understand:
- What the program is trying to achieve
- What has actually been accomplished (vs what governance docs claim)
- What is still open and high-priority
- Exactly where to find every relevant document and piece of code
- How to start contributing productively on Day 1

**Last Updated**: 2026-05-25 (synthesized from live code audit + all governance artifacts)  
**Canonical Location**: `docs/UIUX/V3_UIUX_RECONSTRUCTION_EXECUTIVE_SUMMARY_NEW_HIRE_ONBOARDING.md`  
**Program Owner**: UI/UX Reconstruction Program (16-Agent Coordinated Model)

---

## 1. The Goal (North Star)

We are rebuilding the entire CareIndeed Home Health operational UI as a **single, governed, premium glassmorphism enterprise system** — not a series of visual polish waves.

### Core Vision (V3 "Veil Glass")
- One canonical brand language (Care Indeed calm authority, compliance-defensible, mobile-first)
- One shell architecture with strict **Constrained Page View Contract** (4-sided breathing room on every operational surface so the glass effect is actually visible)
- One primitive/component system (`src/policy/components/ui/`)
- One token system (no raw hex, no magic numbers)
- Maximum 3 glass layers. Layer 3 only by exception.
- The expensive "Veil Glass" dark matte slate-carbon aesthetic (V3) is the target visual language for premium surfaces, especially high-stakes CES (Compliance Execution) workflows.

**Why this matters**: The product sells compliance defensibility. The UI must look and feel like the single source of truth it claims to be.

**Primary Reference Implementation**: The self-contained V3 staging apps in `src/ui-staging/` (especially V3StagingApp.tsx + v3Tokens + the GSAP Masonry Evidence view).

**Sacred Visual Rules** (from V3 spec):
- 77.7% main glass card on desktop with realistic right cast shadow
- Sacred **0.33** border opacity (`rgba(255,255,255,0.33)`) — hover raises to ~0.45
- Teal (`#007970` / `#00D1C1`) for almost all accents. Orange (`#E07B2C` / `#FFA059`) **only** for Command Center eyebrow and "My Personal Workspace"
- Invisible non-interactive surfaces by default
- Single dominant glass surface philosophy

**Full authoritative V3 spec**: [docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md](V3-Veil-Glass-Design-System-Implementation-Specs.md)

---

## 2. Brutal Honesty — Current Overall Status (May 2026)

**Governance Layer**: Mature (many excellent documents, 16-agent coordination model, hardened specs, decision logs).

**Actual Production Implementation**: Early / mixed.

**The most important recent concrete V3 work** (the May 20, 2026 CES Evidence & Tasks Right Panel redesign) is still overwhelmingly in the **planning + partial primitive enablement** stage.

### Phase 1 "Completion" Reality Check

| Claimed in Sign-off Package | Actual State (Audited) | Verdict |
|-----------------------------|------------------------|---------|
| Phase 1 complete at 9.5/10 | Many Phase 1 Exit Checklist items still `[ ]` unchecked | Overstated |
| All 3 major strategic decisions recorded | True (CES parallel system as governed exception, Onboarding V2 canonical, Print renderer convergence) | Accurate |
| Drift Register operational with owners | Only ~8/25 items have owners. Most critical items (raw values, CES, Evidence, etc.) still open | Weak |
| Token pipeline + enforcement ready | Foundation exists in CSS + some generators; not integrated at scale. 2313+ raw values still in code | Early |
| Reference surface (Dashboard) ready | Checklists exist. No production surface has been fully rebuilt to the canonical contract yet | Planning complete |
| CES Right Panel V3 fully specified + ready | Excellent May 20 specs exist. **~5-15% executed** in code | Major open workstream |

**Key Sources of Truth for the Real State** (read these, not just the sign-off):
- [PHASE1_EXIT_CHECKLIST.md](PHASE1_EXIT_CHECKLIST.md) — many items still unchecked
- [PHASE1_READINESS_DASHBOARD.md](PHASE1_READINESS_DASHBOARD.md)
- [DRIFT_REGISTER.md](DRIFT_REGISTER.md) — the living heartbeat of the program
- [CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md](https://github.com/search?q=CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement) (and Removals + Decluttering Status Report, all dated 2026-05-20)

---

## 3. What Has Actually Been Done (Tangible Progress)

### Strong / Mature
- Full governance scaffolding (Canonical Spec, Master Plan, 16-agent model, Decision Log, Drift Register framework)
- Excellent V3 Veil Glass visual contract and token definitions (staging + CSS)
- `RightDrawer.tsx` and `BottomSheetDrawer.tsx` now support `glassVariant="v3-veil"` with proper 0.33 borders, 32px blur, 0.7s premium motion, and expensive transitions (see [src/policy/components/ui/RightDrawer.tsx](src/policy/components/ui/RightDrawer.tsx) lines 26-31, 87+ and matching CSS in index.css ~1350-1420)
- `src/ui-staging/` exists as a high-fidelity living reference (V3StagingApp, V3_2, V3CESSeedPreview, v3Tokens.ts)
- Shell primitives (`ShellFrame`, `ShellContentFrame`, `CommandCenterLayout`) already provide the base 4-sided constrained framing on desktop
- CES has a governed parallel sub-brand decision (navy retained as intentional identity per Lead 16 C14) — recorded in [ces/theme.ts](src/policy/ces/theme.ts)
- Multiple high-quality 16-point validation cycles showing clear improvement trajectory (6.3 → 7.9 → 9.3)

### Partial / Enablement Only
- Some cosmetic `v3-` classes and backdrop polish added to GlobalTaskDrawer and a few CES drawers (mostly visual sugar on top of legacy structure)
- V3 token variables defined in CSS and partially referenced
- Good staging demos (especially Evidence masonry and dashboard veil treatment)

### Not Yet Done (The Big Gaps)
- **Zero** activation of `glassVariant="v3-veil"` on any real CES Evidence/Tasks right panels in production
- No new integrated V3 EvidencePanel or V3 TaskDetailRightPanel created inside the shell
- No legacy right panel removals executed (the May 20 companion doc lists a long removal + migration list — 0% complete)
- No production surface has been fully ported to the canonical primitive + token + constrained view contract
- Token pipeline not enforcing "no raw values" at scale
- Most high-traffic CES surfaces (CesBoard, MasterCalendar, MyTasks, WorkflowExecutionPanel, EventWorkspace, SprintExecutionBoard) still running on CES_TOKENS + custom high-density layouts

**Detailed CES V3 Right Panel Status** (the highest-signal recent workstream):
See the exhaustive audit: [CES_V3_Right_Panel_Executive_Summary_from_Agent](https://github.com/search?q=CES_Evidence_and_Tasks_Right_Panel_V3) (or read the three May 20 docs + the agent report that audited every file).

---

## 4. Open Tasks — Prioritized for Impact (What Needs Doing Now)

### Tier 1 — Highest Leverage (Start Here)
1. **CES Evidence & Tasks Right Panel V3 Execution** (May 20 spec)
   - Activate `glassVariant="v3-veil"` on RightDrawer/BottomSheet everywhere
   - Build new integrated V3 content panels (Evidence + Task detail) that live inside the full shell
   - Migrate MasterCalendarPage, MyTasksPmPage, CesBoard/SprintExecutionBoard, etc. off legacy split views and bespoke fixed drawers
   - Execute the removals list (EvidencePanel, TaskDetailRightPanel, SprintTaskPanel, old WorkflowDrawer usages, ci-right-panel patterns, FolderOpen icon usage in rails, etc.)
   - Match the (external) APP_Screenshots.pdf visual contract exactly, including rich folder/evidence structure

2. **First Reference Surface Reconstruction** (Dashboard is the designated first)
   - Use the existing `DASHBOARD_RECONSTRUCTION_KICKOFF.md` + surface checklists
   - Prove the full stack (tokens + primitives + 4-sided contract + V3 veil where appropriate)

3. **Drift Register Ownership & Closure**
   - Assign owners to the remaining ~17 critical items (D01 raw values, D03 CES, D06 cards, D09 print, D10 mobile, etc.)
   - Drive the top 10 to resolution or time-boxed exception

### Tier 2 — Foundation
- Token pipeline integration + lint enforcement
- Full primitive catalog + deprecation matrix execution
- CES sub-brand scoping (decide how much of the navy system survives long-term vs scoped exceptions)
- Onboarding V2 + Journey V1 convergence (already decided — now execute)
- Print renderer convergence

### Tier 3 — Later
- Remaining 15 surfaces via the 16-agent 4-phase plans
- Full mobile/responsive matrix enforcement
- Accessibility hardening on high-risk surfaces (dense boards, forms, evidence hierarchy)

**Living Source**: [DRIFT_REGISTER.md](DRIFT_REGISTER.md) + the 16 individual Agent_XX_4Phase_Plan.md files in [16_Agent_Reports/](16_Agent_Reports/)

---

## 5. Complete Documentation & Folder Map (Leave No Stone Unturned)

### Must-Read First (Governance Core)
- `docs/UIUX/README.md` — How the docs are organized
- `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md` — The locked contract (read especially §4 Constrained Page View)
- `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md` — The phased roadmap
- `docs/UIUX/PHASE1_EXIT_CHECKLIST.md` — The actual gate (not the sign-off)
- `docs/UIUX/DRIFT_REGISTER.md` — The heartbeat
- `docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md` — Visual north star + tokens

### The 16-Agent Program (The Coordination Model)
- `docs/UIUX/16_AGENT_COORDINATED_FRONTEND_INTEGRATION_PLAN.md`
- `docs/UIUX/16_Agent_Reports/` — All 16 surface-specific 4-phase plans + analysis (Agent 01 Glass → Agent 16 Fidelity). These are gold.
- `docs/UIUX/16_AGENT_CLAUDE_BATCH1_AUDIT/` — Batch coordination artifacts
- `docs/UIUX/16_POINT_*` validation rounds (especially Round 6 and later)

### CES V3 Right Panel Specific (Current Hot Workstream)
- `docs/CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md`
- `docs/CES_Evidence_and_Tasks_Right_Panel_V3_Removals.md`
- `docs/CES_Right_Panel_Decluttering_Status_Report_2026-05-20.md`
- Related agent work: Agent_06_CES_*, Agent_07_Evidence_*, Audit/CES_Kanban_Board_Gap_Analysis.md

### Heavy Archive (Source Material — Treat as Read-Only History)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/` — Original May 2026 audit that started everything
  - `Darkmode_DesignzV3/` — Extremely rich V3 Veil material (agents, prototypes, specs)
  - `Implementation/` — Phase plans, tokens, primitives, surface checklists, mocks
  - `design/` — Comprehensive design system docs
  - `mockup/` (especially Top Picks and v3/)
- `_Heavy/Fix-2026-05-14/v3hf/` — Focused V3 Veil drawer + token specs + approved visual references

### Code — Where the Real Work Happens
- `src/ui-staging/` — The V3 reference implementations (start here for visual contract)
- `src/policy/components/ui/` — The canonical primitives (RightDrawer, Shell*, GlassPanel, VeilModal, etc.)
- `src/policy/ces/` — The most complex and highest-value surface (theme.ts, layouts/CesLayout, components/details/* drawers, pages/, data/V3_* seeds)
- `src/policy/components/CommandCenterLayout.tsx` + Shell* family
- `src/policy/components/pm/` and `regulatory/` — Many of the legacy right panels and panels that need migration
- `src/index.css` — V3 token + glass definitions (search for `--v3-` and `.v3-veil`)

### Other Critical Supporting Areas
- `docs/context-for-grok/cursor-forensics/` — Real production pain points discovered in the field
- `Builder/`, `Project_Intelligence/`, `Seeding-Live-Staging-Alignment-2026-05/` — Additional context

---

## 6. How to Start Contributing (Practical Day 1–7 Guide)

### Day 1
1. Read this entire document.
2. Read the V3 Veil spec + Canonical Spec §4 (Constrained Page View).
3. Skim the May 20 CES Right Panel three docs.
4. Run the app and open the V3 staging routes (`/ui-staging`, `/ui-staging-v32`, V3 CES preview).
5. Compare a real CES surface (CesBoardPage or MasterCalendar) side-by-side with the staging V3 version.

### Week 1 (Pick One)
- **Option A (Highest Impact)**: Pick one integration point from the CES V3 Right Panel doc (e.g., MasterCalendarPage right rail) and wire `glassVariant="v3-veil"` + move content into the shell-constrained drawer. This is real, visible progress.
- **Option B**: Take one Drift Register item (start with D01 raw values or D06 cards) and create the enforcement story + first 50 replacements.
- **Option C**: Fully reconstruct one small surface (or sub-component) to the canonical contract using the existing checklists as template.

### Contribution Rules (Non-Negotiable)
- Never add new raw hex/rgba or arbitrary Tailwind visual values on canonical surfaces.
- Every new drawer/panel must respect the 4-sided constrained framing contract.
- Before touching a surface, check the Drift Register for related items.
- If you are working on CES, read the governed sub-brand decision in ces/theme.ts first.
- All V3 work should be demonstrable in the ui-staging environment before (or alongside) production porting.

---

## 7. Key Risks & Anti-Drift Safeguards

- **Parallel system debt** (CES navy + legacy high-density right panels) will fight the V3 rollout if not actively managed.
- Optimistic governance language can mislead new people — always cross-check sign-off documents against the actual checklists and code.
- The "expensive" 0.7s V3 transitions + heavy blur can regress performance if not gated properly.
- Scope creep on "exact PDF match" for CES right panels without access to the reference screenshots/PDF will cause thrash.
- Mobile experience is still weak on many dense boards — the constrained view contract makes this harder if not designed for from the start.

**Safeguard**: The Drift Register + 16-point reviews + "no Phase 2/3 work on a surface until related drift is owned" rule exist for a reason. Use them.

---

## 8. Final Orientation

This program is one of the most sophisticated, well-documented UI reconstruction efforts you will ever work on. The documentation is genuinely excellent. The gap is between documentation quality and execution velocity on the actual surfaces.

The V3 Veil Glass vision is real and beautiful in staging. The primitives have been prepared. The hardest, highest-value work (CES Evidence & Tasks right panels + first full reference surface) is still ahead of us.

If you read this document + the 5-6 core governance files + spend time in the staging environment and the May 20 CES V3 docs, you will be more up-to-date than 90% of people who have worked on the project.

Welcome. The glass is waiting.

---

**End of Executive Summary**

*This document should be updated after every major validation round or significant code landing in the V3/CES right panel tracks.*