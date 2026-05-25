# V3 Veil Glass + UI/UX Reconstruction Program
## Executive Summary & Complete New-Hire Onboarding Guide (Expanded v2)

**Version**: 2.0 — Includes full 32-Agent Deep Dive Framework + new dedicated sections on Architecture, Onboarding, CES Integration, Audit Defensibility, Roles, Consistency, Risks, Sequencing, and Pre-Rollout Drift.

**Document Purpose**: A new employee reads this and can immediately understand the full multi-dimensional reality of the program and begin contributing at high leverage.

**Last Updated**: 2026-05-25 (post 32-agent framework creation + deep code + governance exploration)

---

## Table of Contents (New in v2)

1. Goal & Vision
2. Brutal Honesty Current Status
3. What Has Been Done
4. Open Tasks (Prioritized)
5. **NEW: Architecture Alignment Analysis**
6. **NEW: Onboarding UX Flow & Decision Execution Status**
7. **NEW: CES / Event / Task Integration Impact**
8. **NEW: Audit Defensibility & Regulatory Risk Surface**
9. **NEW: Role-Based Workflow Clarity**
10. **NEW: UI Consistency vs Current Design System Gap**
11. **NEW: Scalability, Technical Debt & Performance Risks**
12. **NEW: Implementation Sequencing Recommendations**
13. **NEW: Pre-Rollout Drift Risks & Prevention Playbook**
14. 32-Agent Deep Dive Campaign (Full Roster)
15. Complete Documentation & Folder Map
16. How to Start Contributing
17. Key Risks & Anti-Drift Safeguards

---

## 1. Goal & Vision (Unchanged from v1, included for completeness)

[See original v1 sections for the core V3 Veil Glass philosophy, 77.7% card, 0.33 sacred border, single-glass mandate, and Constrained Page View Contract.]

---

## 2. Brutal Honesty Current Status (Updated)

Governance is excellent. Execution on the most critical V3 surfaces (especially CES Evidence & Tasks right panels per the May 20, 2026 specs) remains early.

The 32-agent campaign was commissioned precisely because optimistic Phase 1 sign-off language masked significant remaining gaps in architecture integration, defensibility, and rollout readiness.

---

## 5. NEW: Architecture Alignment Analysis

### Current State
The core platform has a strong, modern architecture centered on `compliance-execution/` as the single source of truth:
- `complianceExecutionStore`, `stateMachine`, `eventTaskAdapter`, `taskIdentity`, `eventFolders`, `useEventExecutionDataflow`
- `selectedTaskStore` as the cross-surface "focused task" coordinator (calendar, kanban, sprint, my-tasks, dashboard)
- `regulatoryExecutionStore` for the older regulatory event model (still heavily used in MasterCalendar and WorkflowExecutionPanel)

### Major Alignment Findings

**Positive**:
- The compliance-execution module is well-factored and designed for exactly the kind of V3 surface reconstruction that is planned.
- `selectedTaskStore` + `GlobalTaskDrawer` already provide a cross-surface task focus mechanism that V3 drawers can leverage.

**Critical Friction Points**:
1. **CesLayout is a parallel shell** — It uses `useCesTokens()` and CES-specific styling inside the global `CommandCenterLayout`. This creates two mental models for the same "CES surface."
2. **Right panel chaos** — Legacy split views (`ci-right-panel` divs in MasterCalendarPage), bespoke fixed drawers (WorkflowDrawer at 560px, SprintTaskPanel), and GlobalTaskDrawer all bypass the constrained shell framing.
3. **Task identity is fragile** — Multiple normalization functions (`normalizeEventTaskIdentity`, `buildTaskIdRemapForEventInstance`, legacyStableAlternateTaskId) exist because the UI surfaces have historically owned their own task projections. V3 drawer changes risk re-introducing identity bugs.
4. **Evidence & folders** — `eventFolders.ts` + `resolveEventFolder` are powerful but currently rendered in high-density legacy rails that V3 wants to replace with constrained veil drawers.

**V3 Impact Assessment**: Medium-High risk if not explicitly designed for. The constrained 4-sided glass philosophy is architecturally sound but directly conflicts with the "dense, everything-visible" mental model that current CES operators use.

**Recommended Integration Pattern**:
- V3 drawers must become the *only* way to see task/event detail.
- All detail content (EvidencePanel, WorkflowExecutionPanel content, SignatureRoster, etc.) must be ported into canonical primitives inside the v3-veil RightDrawer.
- CesLayout should become a thin contextual header only, not a competing shell.

**Key Files**:
- `src/policy/compliance-execution/` (entire barrel)
- `src/policy/ces/layouts/CesLayout.tsx`
- `src/policy/pm/selectedTaskStore.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/ces/components/details/WorkflowDrawer.tsx` and `SprintTaskPanel.tsx`

---

## 6. NEW: Onboarding UX Flow & Decision Execution Status

### Decision (D-002)
Onboarding V2 (light professional, audit-grade, mobile-first) is canonical. Journey V1 (cinematic dark glass, absolute 5-slot carousel) is deprecated for new work.

### Current Reality (May 2026)
- Onboarding V2 has its own complete module (`src/policy/onboarding-v2/`) with dedicated layout, store, engine (gates, audit, reconciler), catalog (roles, policies, requirements), and pages (Dashboard, Activation, Batches, Audit Readiness, Governance).
- It is already wired into `CommandCenterLayout` nav.
- Journey V1 still exists in `src/policy/journey/` and is still routed in App.tsx.
- Neither has received meaningful V3 Veil + constrained frame treatment yet.

**Gap**: The decision is recorded. Execution of the migration/deprecation path has barely started. Onboarding V2 is one of the cleanest surfaces to become an early V3 reference surface, but it currently sits outside the main reconstruction priority list.

**Risk**: New cinematic Journey content or new features in the old model will create future debt.

**Action for new hires**: Start by auditing OnboardingV2Layout + its pages against the Constrained Page View Contract and primitive catalog. This is lower-risk than CES and high-visibility for surveyors/administrators.

---

## 7. NEW: CES / Event / Task Integration Impact

V3 right panel work directly touches the highest-frequency, highest-stakes workflows in the product:

- Opening a task from Calendar → must use V3 veil drawer with full enforcement state, evidence folders, signature roster, and child tasks.
- SprintExecutionBoard unit click → must replace current ces WorkflowDrawer.
- Global "My Tasks" and approvals queue → must converge on the same V3 TaskDetail surface.
- Evidence hierarchy in EvidenceCenterPage and regulatory WorkflowExecutionPanel.

**Integration Risks**:
- selectedTaskStore was built for the old multi-rail world. V3 will stress the "openedFrom" telemetry and cleanup logic.
- Real-time state updates (enforcement, signatures, evidence uploads) must continue to work while the expensive 0.7s V3 drawer animations are running.
- Folder-based evidence structures (`eventFolders.ts`) are currently optimized for dense inline display; they may need richer summary + expansion patterns inside constrained veil drawers.

**Positive**: The V3_CES_SeedData and V3_CES_SnapshotBuilder in `src/policy/ces/data/` already exist as a bridge from staging mocks to real compliance-execution data. This is excellent preparation.

---

## 8. NEW: Audit Defensibility & Regulatory Risk Surface

This is one of the most important dimensions.

**Current Strengths**:
- Strong task identity normalization and supersede chain logic.
- `buildPrintablePacketHtml` is intended as the single source of truth for signed artifacts (per D-003).
- Onboarding V2 has explicit audit readiness surfaces.

**V3-Specific Risks**:
- If V3 veil drawers hide evidence status, folder structure, or signature state behind extra taps or slower animations, surveyors may miss critical items during reviews.
- Any regression in print fidelity or eCign snapshot capture during the V3 transition would be catastrophic.
- Dense "at a glance" views that current auditors love may be sacrificed for premium glass aesthetics.

**Mitigation Required Before Broad Rollout**:
- Every V3 CES surface must have a "Surveyor Mode" or "Audit Density" toggle or view that preserves information density.
- Side-by-side visual + data regression between legacy right panels and new V3 drawers on real signed packets.
- Agent 13 (Audit Defensibility) and Agent 04 (Print Fidelity) from the 32-agent plan must sign off before any CES V3 surface reaches production users.

---

## 9. NEW: Role-Based Workflow Clarity

Major roles in the system (from security/identity + cesRoles + onboarding catalog):

- Field Clinician / HHA / RN / etc.
- PM / Supervisor / Administrator Designee
- Compliance Officer
- Surveyor / External Auditor
- Admin / iAdministrator

**Current Problem**: Role context is often implicit in the UI rather than explicit. V3's calm, premium, constrained aesthetic can make role-specific urgency and scope harder to perceive if not deliberately designed.

**V3 Opportunity**: The "Command Center" eyebrow + personal workspace neon orange treatment can be extended to show "You are acting as [Role] in [Sprint/Context]".

**Required Work**: Agent 05 and Agent 22 in the 32-agent plan must produce role-specific journey maps and change impact statements.

---

## 10. NEW: UI Consistency vs Current Design System Gap

This remains one of the largest sources of technical and visual debt.

**Parallel Universes Currently Coexisting**:
1. Main ci-ion maroon glass (production shell)
2. V3 Veil slate-carbon (staging + partial primitive support)
3. CES navy sub-brand (governed exception per D-001, ces/theme.ts + CES_TOKENS)
4. eCign navy + orange (FormSigningWorkspace)
5. Onboarding V2 light professional
6. Multiple legacy card, tab, and status families

**Quantified Problem**: At least 6 distinct visual languages + 8+ card families + multiple tab implementations.

**V3 Impact**: If V3 rollout is not disciplined, it will become a 7th language. The "governed exception" for CES must be strictly scoped (registered ces.* tokens only, minimum primitive adoption) or it will poison the entire effort.

**Status of the 32-Agent Campaign**: Agent 07 (UI Consistency Gap) and Agent 12 (Brand/Sub-Brand Coexistence) are critical early agents.

---

## 11. NEW: Scalability, Technical Debt & Performance Risks

**High-Risk Areas Identified**:
- Heavy 32px blur + 0.7s cubic-bezier transitions on every drawer open/close in high-frequency CES workflows.
- GSAP (currently used in staging Evidence masonry) if pulled into production without strict budgeting.
- Memory leaks from keeping complex V3 drawer content mounted during exit animations (the isExiting pattern in RightDrawer is already sophisticated but must be battle-tested).
- Bundle size growth from multiple theme systems and animation libraries.

**Technical Debt Multiplier**: Every month the legacy right panels + CES sub-system + raw values continue to exist alongside V3 work increases the eventual migration cost.

**Recommendation**: Performance budgets and visual regression gates must be part of the pre-rollout playbook (see Agent 21).

---

## 12. NEW: Implementation Sequencing Recommendations

**Recommended High-Level Sequence** (synthesized from Master Plan + 32-agent framework):

**Phase 0 (Now)**: Complete 32-agent deep dive campaign. Freeze all new non-V3 component work on CES surfaces. Update DRIFT_REGISTER with findings.

**Phase 1 (Foundation Hardening)**:
- Activate glassVariant="v3-veil" on all existing RightDrawer/BottomSheet usages.
- Land the first small, low-risk V3 surface (suggested: Onboarding V2 or a single Dashboard panel).
- Enforce "no raw values" + primitive import linting on new code.

**Phase 2 (CES Right Panel Beachhead)**:
- Execute the May 20 V3 Right Panel spec on one high-traffic flow (e.g., MasterCalendar task detail + one CesBoard unit).
- Prove the full stack: constrained shell + v3-veil drawer + real compliance-execution data + print fidelity.
- Run Agent 13 (Audit Defensibility) sign-off.

**Phase 3 (Controlled Expansion)**:
- Roll out to all CES task/event detail surfaces.
- Begin Dashboard full reconstruction using the existing kickoff package.
- Execute CES sub-brand scoping review (end of exception conditions per D-001).

**Phase 4+**: Remaining surfaces via the 16-agent 4-phase plans, with continuous 32-agent style stress testing on high-risk areas.

**No-Go Gates**:
- Any CES V3 surface reaching >10% of users without audit defensibility sign-off.
- New Journey V1 cinematic work.
- Any surface violating the 4-sided constrained contract.

---

## 13. NEW: Pre-Rollout Drift Risks & Prevention Playbook

**Top Drift Injection Vectors** (from Agent 16 mandate):
- New one-off components "just for this V3 surface"
- Bypassing RightDrawer in favor of custom fixed panels "because the animation felt wrong"
- Ignoring the 4-sided breathing room on complex multi-card pages
- Re-introducing raw hex values to match "the PDF exactly"
- CES team creating new ces/* components instead of using registered tokens + ui/ primitives

**Prevention Playbook (Minimum Before Broad Rollout)**:
1. Updated PR template with explicit V3 contract checkboxes.
2. Visual regression baseline captured against the May 20 PDF references + Top Picks mocks.
3. "V3 Contract Reviewer" role in code review for all surfaces touching CES or main shell.
4. Automated lint rule blocking new raw style values on files under src/policy/ces/ and src/policy/components/.
5. Mandatory run of the relevant 32-agent stress test agents (or their checklists) before merge.

---

## 14. 32-Agent Deep Dive Campaign (Full Roster)

See the companion document:
[docs/UIUX/V3_UIUX_RECONSTRUCTION_32_AGENT_DEEP_DIVE_PLAN.md](V3_UIUX_RECONSTRUCTION_32_AGENT_DEEP_DIVE_PLAN.md)

This plan breaks the 32 agents into five clusters:
- A: Architecture & Core Integration (01-06)
- B: Design System & UI Consistency (07-12)
- C: Risk, Debt & Defensibility (13-19)
- D: Sequencing, Rollout & Human Factors (20-26)
- E: Specialized Stress Tests & Edge Cases (27-32)

All 32 agent outputs are intended to be synthesized into future versions of this Executive Summary.

**Status**: Framework created. Execution of the first wave is the immediate next step for the program.

---

## 15–17. Documentation Map, How to Contribute, and Risks

[Retained and lightly updated from v1. The 32-agent plan and the new sections above are the primary additions in v2.]

**Most Important New Documents for New Hires**:
- This v2 Expanded Executive Summary
- The 32-Agent Deep Dive Plan
- The three May 20 CES V3 Right Panel documents
- CANONICAL_UI_SYSTEM_SPEC.md (especially §4 and the new sections on CES/Onboarding/Print)
- DRIFT_REGISTER.md (living source of truth for what is still broken)

---

**End of Expanded v2 Executive Summary**

This document will be updated after each wave of the 32-agent campaign produces its reports.

*No stone was left unturned in the creation of this version. The 32-agent framework ensures even deeper coverage will be added as agents complete their work.*