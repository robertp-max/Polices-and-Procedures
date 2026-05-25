# V3 UI/UX Reconstruction — 32-Agent Deep Dive Execution Plan

**Purpose**: This document defines a 32-agent parallel deep-dive campaign to produce the most thorough, multi-dimensional understanding of the V3 Veil Glass + UI/UX Reconstruction program before major rollout.

**Goal of the 32-Agent Campaign**: Generate exhaustive, non-overlapping intelligence across architecture, integration, risk, defensibility, sequencing, and human factors so the Executive Summary becomes a complete "no stone unturned" onboarding artifact.

**Execution Model**: Agents work in tightly scoped mandates with explicit cross-agent contracts. All outputs feed directly into updates of:
- `V3_UIUX_RECONSTRUCTION_EXECUTIVE_SUMMARY_NEW_HIRE_ONBOARDING.md`
- This plan (as living tracker)
- DRIFT_REGISTER.md and related governance

---

## Agent Roster (32 Specialized Deep Dives)

### Cluster A: Architecture & Core Integration (Agents 01-06)

**Agent 01 — Architecture Alignment (Shell vs Core Platform)**
- Mandate: Map V3 constrained shell + primitives against compliance-execution module, stateMachine, taskIdentity, eventFolders, useEventExecutionDataflow, selectedTaskStore, and regulatoryExecutionStore.
- Output: Text architecture diagram, friction points with file:line, recommended composition pattern.

**Agent 02 — CES / Event / Task Integration Impact**
- Mandate: Analyze how V3 right panel + drawer changes affect canonical task identity, enforcement engine, obligation selectors, sprint context, and real-time state propagation. Special focus on MasterCalendar ↔ CesBoard ↔ GlobalTaskDrawer flows.

**Agent 03 — Onboarding UX Flow & Decision Execution**
- Mandate: Full audit of Onboarding V2 (current canonical per D-002) vs Journey V1 (deprecated). Map all routes, layouts, data models, role catalogs, and migration status. Identify V3 Veil + constrained frame adoption gaps in both.

**Agent 04 — Print, eCign & Signed Artifact Fidelity**
- Mandate: How V3 changes (or fails to change) impact `buildPrintablePacketHtml`, FormSigningWorkspace, GVGB prints, and legal evidence defensibility. Trace every signed artifact path.

**Agent 05 — Role-Based Workflow Clarity & Permission Matrix**
- Mandate: Map all roles (from security/identity + onboarding-v2/catalog/roles + cesRoles) against V3 surfaces. Identify where role context is lost or obscured in current vs target V3 glass treatment. Produce role-specific journey maps.

**Agent 06 — Cross-Store & Dataflow Consistency**
- Mandate: Audit zustand stores (complianceExecutionStore, pmViewSprintStore, selectedTaskStore, onboardingV2Store, enforcementStore, uiStore, navStore) for V3 readiness and drift.

### Cluster B: Design System & UI Consistency (Agents 07-12)

**Agent 07 — UI Consistency vs Current Design System Gap Analysis**
- Mandate: Brutal side-by-side of V3 Veil tokens/classes vs ci-ion production, CES navy sub-brand (ces/theme.ts), eCign navy/orange, regulatory components, and onboarding-v2. Quantify inconsistency hotspots.

**Agent 08 — Glass Layering & Constrained View Contract Adherence**
- Mandate: Audit every major surface for actual 4-sided breathing room + Layer 0/1/2 discipline. Compare against CANONICAL_UI_SYSTEM_SPEC §4 and Top Picks mocks.

**Agent 09 — Primitive Adoption & Component Redundancy**
- Mandate: Measure real usage of `ui/*` primitives vs local copies, ci-* families, and CES-specific components. Update LEGACY_DEPRECATION_MATRIX with current numbers.

**Agent 10 — Typography, Spacing & Density Drift**
- Mandate: Compare current surfaces against locked TYPOGRAPHY_SCALE, spacing tokens, and V3 density rules (especially dense CES boards and right panels).

**Agent 11 — Mobile & Responsive Behavior Matrix Execution**
- Mandate: How V3 Veil + constrained framing affects mobile experience. Audit BottomSheetDrawer, ShellMobileDrawer, and all hard-coded widths in drawers/panels.

**Agent 12 — Brand, Dark Mode & Sub-Brand Coexistence**
- Mandate: Care Indeed canonical vs CI-ION legacy vs CES navy exception vs eCign branding — current state and V3 harmonization path.

### Cluster C: Risk, Debt & Defensibility (Agents 13-19)

**Agent 13 — Audit Defensibility & Regulatory Risk Surface Map**
- Mandate: Identify every place where V3 changes could weaken (or strengthen) audit defensibility, evidence chain of custody, signature fidelity, and surveyor experience. Prioritize by regulatory exposure.

**Agent 14 — Scalability & Performance Risks (Glass/Animation/Blur)**
- Mandate: Profile the "expensive" V3 0.7s transitions, 32px blur, heavy backdrops, and GSAP usage at scale. Identify surfaces that will break first under real data volume.

**Agent 15 — Technical Debt & Parallel System Proliferation Risk**
- Mandate: Quantify the cost of maintaining CES navy sub-system + legacy right panels + multiple card families + raw values during V3 rollout. Produce debt burndown model.

**Agent 16 — Pre-Rollout Drift Injection Risks**
- Mandate: Map every way new V3 work could accidentally create fresh drift (new one-off components, bypassing primitives, violating 4-sided contract, etc.) before broad user exposure.

**Agent 17 — Security, Permission & Separation-of-Duties Surface Risks**
- Mandate: How V3 glass treatment and new drawer patterns interact with PermissionGate, RoleGate, PageAccessRouteGuard, and separationOfDuties logic.

**Agent 18 — Data Integrity & Evidence Capture Risks under V3**
- Mandate: PhotoEvidenceCapture, demoEvidenceRuntimeCache, eCign flows, and folder-based evidence structures when rendered inside new V3 veil drawers vs legacy rails.

**Agent 19 — Cross-Surface Consistency Failure Modes**
- Mandate: Predict where Dashboard V3, Evidence V3, CES V3, Calendar V3, and Onboarding V3 will visually or behaviorally diverge under real implementation pressure.

### Cluster D: Sequencing, Rollout & Human Factors (Agents 20-26)

**Agent 20 — Implementation Sequencing Strategist (Optimal Critical Path)**
- Mandate: Produce a recommended 4-6 phase rollout sequence that maximizes defensibility, minimizes drift, and delivers visible value early. Include dependency DAG and "no-go" gates.

**Agent 21 — Pre-Rollout to All Users Drift Prevention Playbook**
- Mandate: Concrete checklist, lint rules, PR templates, and visual regression protocol that must be active before any V3 surface reaches production users at scale.

**Agent 22 — Role-Specific Change Impact & Training Needs**
- Mandate: For each major role (Field Clinician, PM/Supervisor, Compliance Officer, Surveyor, Admin), define what changes in their daily workflow under V3 and what training/support is required.

**Agent 23 — Change Management & Adoption Risk**
- Mandate: Resistance points, power users of legacy dense views, and communication strategy for the shift from high-density "everything visible" to constrained premium glass.

**Agent 24 — Metrics & Success Definition for V3 Rollout**
- Mandate: Define leading and lagging indicators (defensibility score, task completion time, error rates, surveyor NPS, visual regression failure rate, primitive adoption %, etc.).

**Agent 25 — Onboarding New Engineers to the V3 Program**
- Mandate: Design the ideal 2-week ramp for a new developer joining the reconstruction effort (beyond this Executive Summary).

**Agent 26 — Documentation & Knowledge Debt During Reconstruction**
- Mandate: Audit all existing docs (including this one) for accuracy vs current code reality. Identify what must be frozen vs actively maintained.

### Cluster E: Specialized Stress Tests & Edge Cases (Agents 27-32)

**Agent 27 — High-Volume / High-Urgency CES Board Stress Test**
- Mandate: Simulate real-world overloaded sprint with many blocked/overdue units. How does V3 constrained + veil treatment hold up vs current dense implementation?

**Agent 28 — Multi-Signer + Concurrent Evidence Flows under V3**
- Mandate: Trace complex eCign + second signature + evidence upload scenarios through new drawer patterns.

**Agent 29 — Surveyor / External User Experience under V3**
- Mandate: Special focus on read-only, print-heavy, and audit-mode surfaces (AchcSurveyAlignmentPage, SurveyorPolicyViewerPage, etc.).

**Agent 30 — Mobile Field Worker Daily Workflow under V3**
- Mandate: One-handed, bottom-sheet-first experience for clinicians in the field. Identify where desktop-centric V3 thinking breaks mobile reality.

**Agent 31 — Accessibility & Reduced Motion Compliance in Veil Glass**
- Mandate: Full audit of V3 motion, contrast, focus management, and ARIA in the context of heavy glass and constrained frames.

**Agent 32 — Long-Term Governance & Design System Sustainability**
- Mandate: What organizational and technical structures are required to prevent this entire reconstruction effort from drifting again in 12-18 months?

---

## Execution Protocol

1. Each agent produces a structured report (max 1200 words) with:
   - Executive finding (3 sentences)
   - Key evidence (file:line + doc links)
   - Specific risks / opportunities
   - Concrete recommendations for the Executive Summary
   - Cross-agent dependencies flagged

2. All 32 reports are synthesized into the master Executive Summary v2.

3. High-severity findings are immediately promoted to DRIFT_REGISTER.md with owners.

**Current Status of Campaign**: Framework defined. First wave of agents (01-10) prioritized for immediate execution.

---

**Next Step**: Begin parallel execution of the 32 agents (starting with Cluster A + B).

*This document itself is an artifact of the reconstruction program and must be treated with the same anti-drift discipline as code.*