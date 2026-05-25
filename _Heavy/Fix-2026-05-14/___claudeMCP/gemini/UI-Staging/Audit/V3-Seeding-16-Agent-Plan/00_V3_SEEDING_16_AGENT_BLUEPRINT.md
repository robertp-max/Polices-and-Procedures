# 16-Agent V3 Seeding Swarm Plan — High-Fidelity Data for UI-Staging + Veil CES Implementation

**Prepared by**: Grok 4.3  
**Date**: 2026-05-20  
**Context**: While Claude completes the remaining V3 page views, ahead of the IMPLEMENTATION_PLAN_2026-05-20.md execution, and before the Veil-Declutter-Function-Audit work.  
**Target Output Root**: `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/UI-Staging/Audit/V3-Seeding-16-Agent-Plan/`  
**Trigger**: User request — "plan the seeding with 16 4.3 agents"

---

## 1. Executive Mandate

The V3 Veil Glass visual system is reaching visual maturity. The next critical bottleneck is **data fidelity and richness**.

Current state:
- UI-Staging harness has beautiful glass but ~70-80% of controls are non-functional and data is thin/hardcoded/stale.
- The upcoming Veil CES declutter (right panels, drawers, folders, modals) has no rich production-shaped data yet — the "seed V3" action plan (01_DATA_PULL_AND_V3_SEED_ACTION_PLAN.md) exists but has not been executed.
- The IMPLEMENTATION_PLAN_2026-05-20.md will expose these gaps the moment real search/filter/interactivity/a11y work begins.

**Goal of this swarm**: Produce a complete, production-faithful, safely-integrated V3 seed data layer that powers both:
1. The UI-Staging harness (so the IMPLEMENTATION_PLAN fixes land on realistic, filterable, folder-rich data).
2. The real production Veil drawers/folders/modals (so the declutter work delivers "calm PDF-like rich content" from day one).

This is a **bridge deliverable** — highest leverage work that can run in parallel while Claude finishes the missing pages.

---

## 2. Scope

**In Scope**
- Evidence folder hierarchies (Year/Quarter/Month/Event/Task/Evidence with triplet enforcement)
- Task detail, timelines, audit logs, linked evidence
- Workflow units, execution steps, EvidenceStatusPanel data
- Multi-signer signature rosters + chains
- Policy / regulatory event linking
- Clinician, patient, staffing context for realism
- Calendar / sprint / obligation projections
- Forms, eCIgn artifacts, signed snapshots
- Seed architecture (file location, hooks, feature flags, `glassVariant="v3-veil"` integration)
- Safe dual-path usage (`isV3 ? seed : realStore`)
- Performance, bundle, and maintainability considerations
- Demo/UAT scenario coverage for the 22 UI-Staging surfaces + key CES flows

**Out of Scope**
- Actual wiring of seeds into production components (that's for the later Veil implementation)
- Visual V3 token fixes (already covered by prior audits)
- Full production data migration

---

## 3. Primary References (Every Agent Must Read First)

1. `01_DATA_PULL_AND_V3_SEED_ACTION_PLAN.md` (the approved "pull data and seed v3" plan)
2. `02_RECOMMENDED_IMPLEMENTATION_SEQUENCE.md` ("seed V3 → fix → switch")
3. `IMPLEMENTATION_PLAN_2026-05-20.md` (especially S1 interactivity, data fidelity items, and later architecture sprints)
4. `src/policy/stores/regulatoryExecutionStore.ts`
5. `src/policy/compliance-execution/types.ts`
6. `src/policy/evidence/cesEvidenceHierarchy.ts` + `cesEvidenceHierarchy.ts`
7. `src/policy/pm/taskProjection.ts` + `obligationSelectors.ts`
8. `src/policy/components/regulatory/WorkflowDrawer.tsx`, `EvidencePanel.tsx`, `GlobalTaskDrawer.tsx`
9. Existing seed patterns in `src/policy/data/`, `src/policy/journey/data/`
10. `docs/CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md`
11. `src/ui-staging/V3StagingApp.tsx` (current mock data usage)
12. `v3Tokens.ts` and the Veil Glass spec

---

## 4. 16 Specialized Agent Charters (Deploy in Parallel)

Each agent receives this full blueprint + the two exploration baselines + the references above.  
**Mandatory first action for every agent**: Read the two 00_* baseline files in this folder (once created) + the three Veil seed docs + run the Phase 0 greps from the seed action plan.  
Each agent must output a structured report using the standard template and `write` it before concluding.

### Agent 01 — Evidence Folder Hierarchy & Triplet Enforcement
**Focus**: Design the canonical nested folder tree shape (`V3_EvidenceFolderTree`) that satisfies "Form FIRST then supporting evidence", Google-Drive-style nesting, completion %, and the policyId/workflowId/eventId triplet on every leaf. Map against real `eventFolders`, `regulatoryExecutionStore`, and `cesEvidenceHierarchy`. Deliver: Complete TypeScript interface + 4-6 realistic seed folders (QAPI, Fire Drill, Policy Review, Incident, HR, IT) with full paths and 2-3 evidence items each.

### Agent 02 — Task Detail Richness & Timeline Fidelity
**Focus**: `V3_TaskDetailSeed` — full Assignment, Timeline events, linked evidence folders, audit log entries, status transitions. Must support the right-panel content in `TaskDetailRightPanel` and `SprintTaskPanel`. Pull real shapes from `taskProjection`, `auditState`, `timelineState`. Deliver: Typed seed + 3 varied task examples (one overdue, one multi-signer, one evidence-heavy).

### Agent 03 — Workflow Unit & Execution Data
**Focus**: `V3_WorkflowUnitSeed` for `WorkflowDrawer` and `WorkflowExecutionPanel`. Steps, EvidenceStatusPanel data, child tasks, folder trees inside workflows, signature requirements. Cross-reference `complianceExecutionStore` and `eventTaskAdapter`. Deliver: 2-3 workflow seeds (one simple, one with parallel branches, one with evidence gates).

### Agent 04 — Signature Roster & Multi-Signer Chain
**Focus**: `V3_SignatureRosterSeed` + chain history for the "multi-signer PDF" requirement. Status (pending/signed), dates, role, credential state. Must work for both single and multi-signer flows. Deliver: Roster seed + example signed snapshot metadata.

### Agent 05 — Policy / Regulatory Event / Obligation Linking
**Focus**: Ensure every seed item carries correct `policyId`, `workflowId`, `eventId`, `obligationId` references that resolve in the real stores. Validate against `obligationSelectors`, `canonicalEventTaskFilter`, and policy lifecycle data. Deliver: Triplet validation matrix + examples that will actually work when wired.

### Agent 06 — Clinician, Patient & Staffing Context Seeds
**Focus**: Realistic people data (names, roles, credentials, assignments) for task assignments, signature rosters, uploadedBy, etc. Pull from staffing types and real Clinician/Patient pages. Avoid fantasy names. Deliver: Reusable `V3_PersonnelSeed` + 8-10 named individuals with credential state.

### Agent 07 — Calendar, Sprint & Event Projection Seeds
**Focus**: Seeds that power Calendar views, SprintExecutionBoard, CesDashboard, MyTasks. Must align with `taskProjectionCore`, Google Calendar sync expectations, and the 4-view consistency problem flagged in forensics. Deliver: Event + obligation seeds for Q2 2026 that demonstrate cross-view parity.

### Agent 08 — Forms, eCIgn & Artifact Snapshot Seeds
**Focus**: Signed form artifacts, `captureSignedFormSnapshot`, `artifactToFormInstance`, evidence of type `signed_form`. Support the post-sign "download real PDF not template" requirement. Deliver: 3-4 artifact seeds (different form types) with realistic metadata + hash.

### Agent 09 — Seed File Architecture & Public API Design
**Focus**: The actual `V3_CES_SeedData.ts` (or `cesV3Seeds.ts`) file structure, exports, `useV3CESSeed()` hook, tree-shaking, dev-only vs prod stripping. Decide on single file vs domain-split. Define the exact contract the later implementation agents will consume. Deliver: Full file skeleton + JSDoc + usage examples for both ui-staging and production drawers.

### Agent 10 — Feature Flag, isV3 & glassVariant Integration Patterns
**Focus**: Safe rollout mechanics (`pm/featureFlags.ts`, local `USE_V3_SEED`, `glassVariant` prop on RightDrawer/BottomSheet/GlobalTaskDrawer/WorkflowDrawer/VeilModal). Zero-risk dual path. How to flip one surface at a time. Deliver: Recommended flag + component prop contract + migration checklist.

### Agent 11 — Mock Data Fidelity Gap Analysis (UI-Staging vs Production)
**Focus**: Complete audit of every hardcoded array currently in `V3StagingApp.tsx` vs real production types. Which fields are missing (FEHA, ShiftNeed, acuity, verifiedAt, etc.)? Which seeds will close the biggest "feels fake" gaps for the IMPLEMENTATION_PLAN demo? Deliver: Gap matrix + priority order for seed population.

### Agent 12 — Performance, Bundle Size & Runtime Cost
**Focus**: Rich nested folders + timelines + signatures will increase bundle and render cost. Measure (or estimate) impact on ui-staging load + drawer open time. Recommend lazy loading, memoization, or trimming strategies. Deliver: Size budget + rendering guidelines for the seed consumers.

### Agent 13 — Maintainability & Versioning Strategy
**Focus**: How do we keep seeds from rotting? (Real data changes, policy updates, new event types.) Versioning scheme, regeneration process, snapshot tests, "seed freshness" dashboard. Deliver: Long-term ownership model + tooling recommendations.

### Agent 14 — UAT & Demo Scenario Coverage
**Focus**: Define the exact user journeys that the seeds must make work beautifully (e.g., "open overdue task from CesBoard → see rich folders in veiled drawer → sign with 3 people → evidence appears in hierarchy"). Map to the 22 UI-Staging pages + key CES flows in the Veil plan. Deliver: Scenario matrix (minimum 12 flows) with required seed coverage.

### Agent 15 — Cross-Surface Consistency (Staging ↔ Real App)
**Focus**: Ensure the same seed shapes will work when the V3 veil is eventually applied to production Calendar, MyTasks, EvidenceCenter, Policy Library, Onboarding, etc. Flag any shape conflicts between ui-staging mocks and real stores. Deliver: Consistency report + unified seed layer proposal.

### Agent 16 — Master Synthesis, Risk Register & Prioritized Seeding Roadmap
**Focus**: Consume all 15 agent reports. Produce the consolidated `Master/00_V3_SEEDING_MASTER_REPORT.md` containing:
- Executive scorecard (fidelity, safety, performance, coverage)
- Final recommended seed file(s) structure
- Phased seeding roadmap aligned to the IMPLEMENTATION_PLAN sprints and Veil declutter sequence
- Top 10 risks + mitigations
- Exact "ready to hand to Claude" next prompt / task list

---

## 5. Execution Protocol (Strict)

1. All agents start only after the two baseline exploration reports for this swarm are written (Agent 00 prep or Grok will provide).
2. Every agent **must** run the Phase 0 greps from the seed action plan on the real source files.
3. Reports use the standard template (Executive Summary, Scope, Findings by Severity, Evidence with exact file:line, Recommendations with effort, Deliverable).
4. All output written to `V3-Seeding-16-Agent-Plan/Agent_Reports/Agent_0N_*.md` using the `write` tool.
5. Agent 16 runs last (or after all others finish) and produces the Master report.
6. No agent may edit production code — only propose and generate the seed file draft in the plan folder for later review.

---

## 6. Success Criteria

- Every major CES data shape (folders, tasks, workflows, signatures, artifacts) has at least one high-fidelity, PDF-faithful seed example.
- The seed file + hook can be dropped into ui-staging and one production drawer with < 20 lines of change and zero breakage on the legacy path.
- IMPLEMENTATION_PLAN S1 search/filter work becomes dramatically more impressive because the data is rich and filterable.
- The later Veil declutter agents will inherit "rich content" instead of having to invent it.

---

## 7. Recommended Immediate Next Steps (While Claude Builds Pages)

1. Deploy the 16 agents (or a focused subset of 8 if token/time constrained) using this blueprint.
2. Agents 01–08 (data domains) + 09 (architecture) + 11 (fidelity) + 14 (scenarios) are the highest priority.
3. Once Agent 09 delivers the file skeleton, generate the actual `02_V3_CES_SEED_DATA_DRAFT.ts` in this folder for human review.
4. When Claude finishes the missing pages, hand the seeded state + this master report to the IMPLEMENTATION_PLAN execution team.

---

**Status**: Blueprint frozen and ready for swarm deployment.

Ready when you are — say the word and we spawn the agents (or I can generate the first-draft seeds directly if you want to move faster on the critical paths).

This seeding swarm will make every subsequent step (IMPLEMENTATION_PLAN fixes + Veil declutter) at least 3× more effective.