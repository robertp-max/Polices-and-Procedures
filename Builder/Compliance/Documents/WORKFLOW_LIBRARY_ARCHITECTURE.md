# Workflow Library — Strategic Architecture & Integration Blueprint

**Document owner:** Compliance / Platform Architecture
**Status:** v2.0 — reviewed & updated 2026-04-22
**Audience:** Engineering, Compliance Officer, Clinical Manager, QAPI Lead, Auditors
**Scope:** How the Workflow Library is designed, how it is built, and how it connects every other subsystem already live in the app.

---

## 0. TL;DR — What We Are Building and Why

### What Already Exists (do not re-build)

The app is **not** a skeleton. Before designing anything, account for what is already running:

| Layer | Subsystem | Key files |
|---|---|---|
| **Policy Library** | 269 policies, 10 domains, versioned | `LibraryPage.tsx`, `policyStore.ts` |
| **Forms Library** | 349 forms, `FORMS_CATALOG` metadata | `FormsPage.tsx`, `FormViewer.tsx`, `formsCatalog.ts` |
| **Compliance Engine** | `RegulatoryEvent → ComplianceObject`, `surveyReadinessScore`, `missingItems`, `policyViolations` | `complianceEngine.ts`, `evaluateEvent.ts` |
| **Regulatory Execution Store** | Per-event: step states, form states, minutes, evidence docs, approval requests, completion — persisted to localStorage | `regulatoryExecutionStore.ts` |
| **Enforcement Engine** | Blockers, warnings, timeline issues, approval gaps, lock/unlock, 0–100 risk score, `immediate-jeopardy` band | `enforcementEngine.ts`, `escalationEngine.ts`, `roleHierarchy.ts`, `audit/riskScoring.ts` |
| **Audit Export** | `buildAuditBundle` → JSON + markdown packet + download | `audit/exportReport.ts` |
| **Autogen System** | Generates `RegulatoryEvent[]` from templates by year/range; materializes trigger-based events from `TriggerSignal` | `autogen/annualGenerator.ts`, `autogen/triggerEngine.ts`, `autogen/templateRegistry.ts`, `autogenStore.ts` |
| **Next Due Date + Dependency Engine** | Cadence-based recurrence; upstream dependency block detection | `utils/nextDueDateEngine.ts`, `utils/reminderEngine.ts` |
| **Master Calendar** | Month grid + agenda + swimlane, `EventWorkspace`, `WorkflowDrawer` (already in calendar UI) | `MasterCalendarPage.tsx`, `components/regulatory/EventWorkspace.tsx`, `components/regulatory/WorkflowDrawer.tsx` |
| **Audit Mode** | Surveyor view — risk band, blockers, evidence gap, export packet | `AuditModePage.tsx` |
| **Journey / SCORM** | Role-based learning paths, module assignment, employee records | `journey/`, `journey/data/modules.ts` |

### What Is Actually Missing

Three things — not eight — are genuinely absent:

1. **The Workflow data model and compiler.** The 166 workflows in `Builder/Policies/Workflows/*.md` are typed prose. Nothing reads them programmatically. Every cross-reference (342 form refs, policy refs, role refs) is validated only by the manual `AUDIT_REPORT.md`. The moment a markdown file changes, the guarantee is gone.

2. **The Workflow Library UI.** There is a `WorkflowDrawer.tsx` inside the calendar, but no standalone library page (`/workflows`), no filter/search surface, no domain nav for workflows, and no detail-page tab shell.

3. **Workflow-to-template projection.** `autogen/templateRegistry.ts` stores hand-authored templates. Workflows are the canonical source of truth for those templates but no pipeline connects them. The same data is maintained twice.

Fixing these three things connects everything. The rest of the infrastructure is already built and waiting.

---

## 1. Guiding Principles

1. **Single Source of Truth, Many Views.** Workflows are authored in Markdown (Git-diffable, human-readable), compiled into typed TS once, and rendered as cards, tables, swimlanes, checklists, calendar events, and audit bundles. One file, one workflow, unlimited views.
2. **No parallel data models.** A workflow references `policyId` and `formId` — it does not re-declare that metadata. The Workflow Library is a graph node, not a silo.
3. **Workflows project into events, not alongside them.** Time-based workflows become entries in `templateRegistry.ts`. Trigger-based workflows respond to `TriggerSignal` via the existing `triggerEngine.ts`. No new calendar system.
4. **Operational ≠ Documentary.** A workflow has a live status, an owner on call, a readiness score, and an escalation state. It is not a PDF.
5. **Audience-specific views.** Clinicians need an execution checklist. Managers need an SLA/deadline view. Surveyors need an audit/evidence view. Same data, three layout presets.
6. **Every workflow is traceable.** The chain `regulation → policy → workflow → step → form → evidence → approval → audit trail` must have zero orphan nodes. The compiler enforces this; no manual audit sweeps.
7. **Brand tokens, not colors.** Teal `#007970` is the primary role token (active state, selected filter, link, ok status). Orange `#C74600` is reserved for action and overdue (CTAs, required-field, overdue chips). Montserrat + Roboto. Never fill a card with brand color. WCAG 4.5:1 minimum on all text. See §7 for the full system.

---

## 2. Full System Map

```
                 ┌──────────────────────────────────────────────────────┐
                 │                 REGULATORY SOURCES                   │
                 │  42 CFR §484 · CMS SOM · HIPAA · OSHA · FCA ·        │
                 │  CA Title 22 · SB 553 · CCPA · CMIA                  │
                 └──────────────────────────┬───────────────────────────┘
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       POLICY LIBRARY  (the rule)                      │
│  269 policies · Domain → Subdomain → Policy · versioned               │
│  LibraryPage.tsx · policyStore.ts · SharedPolicyDetailView.tsx        │
└──────────┬──────────────────────────────────────────────┬────────────┘
           │ policyId[]                                   │ version change
           ▼                                              │ → Review Flag
┌──────────────────────────────────┐                      │
│     WORKFLOW LIBRARY  (NEW)      │◄─────────────────────┘
│  166 workflows · 13-section schema                      │
│  /workflows route tree                                  │
│  WorkflowDetailPage.tsx                                 │
└───────┬─────────────────┬────────┘
        │ formId[]        │ compiles into ↓
        ▼                 ▼
┌──────────────┐  ┌───────────────────────────────────────────────────┐
│    FORMS     │  │            AUTOGEN SYSTEM  (existing)             │
│   LIBRARY   │  │  templateRegistry.ts ← workflows.generated.ts     │
│  349 forms   │  │  annualGenerator.ts  → generatedEvents[]          │
│  formsCatalog│  │  triggerEngine.ts    → triggeredEvents[]          │
│  FormViewer  │  │  autogenStore.ts     (Zustand, persisted)         │
└──────┬───────┘  └──────────────────────────┬──────────────────────┘
       │                                     │ RegulatoryEvent[]
       │                                     ▼
       │          ┌───────────────────────────────────────────────────┐
       │          │      COMPLIANCE + ENFORCEMENT  (existing)         │
       │          │  complianceEngine.ts  → ComplianceObject          │
       │          │  enforcementEngine.ts → EnforcementReport         │
       │          │  escalationEngine.ts  → Escalation[]              │
       │          │  riskScoring.ts       → RiskScore (0-100 / band)  │
       │          │  regulatoryExecutionStore.ts  (runtime state)     │
       │          │  nextDueDateEngine.ts · reminderEngine.ts         │
       └──────────┴────────────────────────┬──────────────────────────┘
                                           │
                         ┌─────────────────┼──────────────────────┐
                         ▼                 ▼                      ▼
              ┌─────────────────┐  ┌───────────────┐  ┌──────────────────┐
              │  MASTER CALENDAR│  │  AUDIT MODE   │  │ JOURNEY / SCORM  │
              │  MasterCalendar │  │  AuditModePage│  │ modules.ts       │
              │  EventWorkspace │  │  exportReport │  │ employees.ts     │
              │  WorkflowDrawer │  │  riskScoring  │  │ appendices.ts    │
              └────────┬────────┘  └───────┬───────┘  └──────────────────┘
                       │                   │
                       └─────────┬─────────┘
                                 ▼
                    ┌────────────────────────┐
                    │       DASHBOARD        │
                    │   DashboardPage.tsx    │
                    │   useComplianceKpis()  │
                    │   KpiTile.tsx          │
                    └────────────────────────┘
```

---

## 3. Canonical Data Model

File: `src/policy/types/workflow.ts` — new file, freezes the contract.

```typescript
// ── Domain codes align with the Policy Library DOMAINS[] in LibraryPage.tsx
export type DomainCode =
  | 'GV' | 'CL' | 'QA' | 'HR' | 'CO'
  | 'FN' | 'OP' | 'IT' | 'RM' | 'EN';

// ── Maps to regulatoryEvents.ts EventCadence (superset — Trigger-based added)
export type WorkflowCadence =
  | 'Monthly' | 'Quarterly' | 'Semiannual' | 'Annual' | 'Biennial'
  | 'Weekly' | 'Biweekly' | 'Ad-hoc' | 'Trigger-based';

export type TriggerKind =
  | 'time-based'      // drives autogen templateRegistry entry
  | 'event-based'     // drives triggerEngine.ts TriggerSignal (referral, incident, hire...)
  | 'condition-based' // threshold breach, audit signal, dashboard flag
  | 'cascade';        // triggered by another workflow's completion

export type RiskImpact =
  | 'PATIENT_SAFETY' | 'BILLING' | 'SURVEY'
  | 'HIPAA' | 'OSHA' | 'FCA' | 'OPERATIONAL';

// ── Step shape is a superset of EventProcessStep in regulatoryEvents.ts
export interface WorkflowStep {
  order: number;
  action: string;
  role: string;
  systemAction?: string;          // e.g. "EMR eligibility check"
  formIds: string[];              // every ID must resolve in FORMS_CATALOG
  deadline: string;               // natural language, e.g. "Within 4 business hours"
  dueOffsetHours?: number;        // normalized; maps to dueOffsetDays on projection
  onFailure?: string;
  // projected fields (set by compiler, not authored):
  id?: string;                    // `${workflowId}-step-${order}` — used by enforcementEngine
  requiredFormIds?: string[];     // alias of formIds for EventProcessStep compatibility
  onCompleteText?: string;        // derived from action + outputs
}

export interface WorkflowApproval {
  role: string;
  scope: string;
  minutesFormId?: string;         // e.g. "GV-FM-005" — enforced by compiler for GB approvals
  // projected fields for escalationEngine.ts ApprovalRule compatibility:
  id?: string;
  targetKind?: 'event' | 'form' | 'report' | 'minutes';
  targetLabel?: string;
  required?: boolean;
  escalationDays?: number;
  escalateToRole?: string;
}

export interface WorkflowDependency {
  workflowId: string;
  relation: 'upstream' | 'downstream' | 'parallel';
  note?: string;
}

export interface Workflow {
  id: string;                     // e.g. "CL-WF-05"
  domain: DomainCode;
  subdomain?: string;             // e.g. "OA" (OASIS)
  title: string;
  version: string;
  lastUpdated: string;            // ISO YYYY-MM-DD

  policyRefs: string[];           // → policyStore (Policy.id)
  regulatoryAnchors: string[];    // e.g. "42 CFR §484.45"
  processOverview: string;

  triggers: {
    kind: TriggerKind;
    description: string;
    cadence?: WorkflowCadence;
    triggerSignalType?: string;   // for event-based, matches triggerEngine.ts signal types
  }[];

  roles: {
    primary: string[];
    supporting: string[];
    approval: string[];
  };

  inputs: string[];
  steps: WorkflowStep[];
  requiredForms: string[];        // deduped union of steps[].formIds — compiler-generated
  approvals: WorkflowApproval[];
  outputs: string[];

  sla: {
    summary: string;
    maxDurationHours?: number;
    criticalPath?: string[];      // step IDs on critical path
  };

  escalation: {
    trigger: string;
    path: string[];
    notifyFormId?: string;
  }[];

  failureConditions: {
    description: string;
    impact: RiskImpact[];
    citation?: string;
  }[];

  auditRequirements: {
    evidenceArtifacts: string[];  // form IDs
    retentionYears: number;
    surveyorFocus: string;
  };

  dependencies: WorkflowDependency[];

  // Derived — computed by compiler, never authored:
  derived: {
    riskLevel: 'low' | 'medium' | 'high';
    isBillingCritical: boolean;
    isPatientSafetyCritical: boolean;
    isSurveyCritical: boolean;
    governingBodyInvolved: boolean;
    mandatedByRegulation: boolean;
    // regulatoryEvents.ts domain normalization:
    regulatoryDomain: import('@/policy/data/regulatoryEvents').RegulatoryDomain;
  };
}

// ── The graph — what the runtime consumes, not the UI
export interface WorkflowGraph {
  byId:         Record<string, Workflow>;
  byDomain:     Record<DomainCode, string[]>;
  byPolicy:     Record<string, string[]>;   // policyId → workflowId[]
  byForm:       Record<string, string[]>;   // formId   → workflowId[]
  byRegulation: Record<string, string[]>;   // anchor   → workflowId[]
  byRole:       Record<string, string[]>;   // role     → workflowId[]
  downstream:   Record<string, string[]>;   // workflowId → downstream IDs
  upstream:     Record<string, string[]>;   // workflowId → upstream IDs
}
```

**Domain code normalization (critical detail):** `LibraryPage.tsx` and the workflow markdown files use 2-letter codes (`GV`, `CL`, etc.). `regulatoryEvents.ts` uses full strings (`'Governance'`, `'Clinical'`). The compiler must translate: `GV → 'Governance'`, `CL → 'Clinical'`, `QA → 'QAPI'`, etc. The `derived.regulatoryDomain` field carries the translated value so projections into `RegulatoryEvent` work without any runtime string matching.

---

## 4. Ingestion Pipeline — Markdown → Typed Data → Templates

Markdown stays the authoring surface. The compiler is the invariant layer.

```
Builder/Policies/Workflows/*.md  (10 domain files, 166 workflows)
        │
        ▼
scripts/compileWorkflows.ts
  • Parses 13-section grammar (regex on H2/H3 headers + tables)
  • Validates every formId against FORMS_CATALOG keys (hard fail)
  • Validates every policyRef against Policy taxonomy (warn in CI, block at publish)
  • Validates regulatoryAnchors against REGULATORY_ITEMS in LibraryPage.tsx
  • Computes derived fields (riskLevel, isBillingCritical, etc.)
  • Translates DomainCode → RegulatoryDomain for event projection
  • Emits id fields on steps and approvals (for enforcementEngine compatibility)
        │
        ├── src/policy/data/workflows.generated.ts     Workflow[]
        ├── src/policy/data/workflowGraph.generated.ts WorkflowGraph
        └── src/policy/autogen/workflowTemplates.generated.ts
              (time-based workflows only — fed into templateRegistry.ts)
        │
        ▼
scripts/generateCalendarFromWorkflows.ts  (run once per year or on demand)
  • Reads workflowTemplates.generated.ts
  • Calls annualGenerator.ts generateEvents() with new templates merged
  • Updates autogenStore generatedEvents[]
        │
        ▼
Runtime: stores + UI read from generated files
```

**Compiler hard rules (non-negotiable):**

1. Every `formId` in any `WorkflowStep.formIds` must be a key in `FORMS_CATALOG`. Unknown ID → build fails. This is the build-time replacement for the manual `AUDIT_REPORT.md` validation pass.
2. Every `policyRef` must resolve to a `Policy.id` in the framework seed. Unknown → CI warning, publish-gate blocker.
3. Any `approvals[].role` containing "Governing Body" must have `minutesFormId: "GV-FM-005"` in `auditRequirements.evidenceArtifacts`. Compiler enforces the 199-point GV-FM-005 coverage.
4. Any time-based workflow must declare exactly one trigger with a `cadence` value that maps to `EventCadence` in `regulatoryEvents.ts`.
5. `derivedFields` computed from `failureConditions[].impact` — if no impact tags, defaults to `OPERATIONAL` and writes a compiler warning to the domain owner's report.

**What this replaces:** The 342 cross-references validated by hand in `AUDIT_REPORT.md` become a build-time invariant. The "3 consecutive zero-issue passes" stop condition is now enforced continuously by CI.

---

## 5. Strategic Integrations — Workflow × Every Existing Subsystem

### 5.1 Workflow × Policy Library

**Direction:** bidirectional.
**Files:** `SharedPolicyDetailView.tsx`, `policyStore.ts`, `workflowGraph.generated.ts`

- Policy detail page (`SharedPolicyDetailView.tsx`) gets a `<LinkedWorkflows policyId={id} />` panel reading `workflowGraph.byPolicy[id]`.
- Workflow detail page shows *"Governed by"* with policy version + `LifecycleStatus` badge pulled from `policyStore`.
- When a `PolicyVersion.effectiveDate` changes, every workflow in `workflowGraph.byPolicy[id]` receives an automatic **Review Flag** surfaced in the Workflow Library filter bar (*"14 workflows reference policies updated in the last 30 days"*). This eliminates downstream drift from policy amendments.

### 5.2 Workflow × Forms Library

**Direction:** bidirectional.
**Files:** `FormsPage.tsx`, `FormViewer.tsx`, `formsCatalog.ts`, `workflowGraph.generated.ts`

- `FormsPage.tsx` gets a **Used In** column: how many workflows require each form, with a click-to-drawer showing those workflows and their SLAs.
- `FormViewer.tsx` gets a sticky context strip at the top when accessed from a workflow instance: *"CL-WF-05 · Step 3 of 9 · SLA: transmit within 30 days of M0090."* No more decontextualized form-filling.
- `FORMS_CATALOG` already contains `whenRequired` and `whoCompletes` — these render inside the Workflow detail Forms tab without any new data.

### 5.3 Workflow × Autogen System

**Direction:** Workflow → Template → Event. This is the most important integration.
**Files:** `autogen/templateRegistry.ts`, `autogen/annualGenerator.ts`, `autogen/triggerEngine.ts`, `autogenStore.ts`

Today `templateRegistry.ts` stores hand-authored event templates. Workflows are the canonical source of truth for exactly that data. The pipeline:

```
Time-based workflow (e.g. QA-WF-01, Annual QAPI PIP)
  → compiler outputs workflowTemplates.generated.ts
  → merged into templateRegistry.ts at build time
  → annualGenerator.ts generateEvents() produces RegulatoryEvent[]
  → autogenStore.generatedEvents[] (Zustand, persisted)
  → MasterCalendarPage + DashboardPage consume via useMergedEvents()

Event-based workflow (e.g. CL-WF-01, Intake & Referral Qualification)
  → compiler emits TriggerSignal type mapping
  → when referral is logged, intake module calls autogenStore.fireTrigger(signal)
  → triggerEngine.ts materializes a RegulatoryEvent from the workflow template
  → autogenStore.triggeredEvents[]
```

The `processFlow` on each generated event is derived directly from `workflow.steps[]`, mapping:
- `WorkflowStep.action` → `EventProcessStep.label`
- `WorkflowStep.dueOffsetHours / 24` → `EventProcessStep.dueOffsetDays`
- `WorkflowStep.formIds` → `EventProcessStep.requiredFormIds`
- `WorkflowStep.onFailure` → escalation logic

**Effect:** one workflow authored once becomes a library page, a template, a calendar entry, a runtime checklist, a compliance object with `surveyReadinessScore`, and an escalation trigger if the SLA is breached. Zero duplicated authoring.

**What this does NOT do:** it does not replace `mandatedEventsExpanded.ts`. The Q2/Q3/Q4 QAPI events in that file are gold-standard at the detailed `agenda`/`minutes`/`complianceFlags` level — richer than what the workflow markdown can author. Those events stay. The workflow projection fills cadence/structure; domain experts can enrich generated events with the `agenda` template layer on top.

### 5.4 Workflow × Regulatory Execution Store

**Direction:** extend `regulatoryExecutionStore.ts` with WorkflowInstance shape.
**Files:** `regulatoryExecutionStore.ts`, `evaluateEvent.ts`, `complianceEngine.ts`

The store already manages `FormState`, `StepState`, `MinutesState`, `EvidenceDoc[]`, `ApprovalRequest[]`, `CompletionState` keyed by `eventId`. A `WorkflowInstance` is just a `RegulatoryEvent` in that store with a richer key namespace:

```typescript
// Extend the existing store — do NOT create a parallel store
interface WorkflowInstance {
  instanceId: string;           // UUID, becomes the eventId key in store
  workflowId: string;           // e.g. "CL-WF-05"
  triggeredBy: 'time-based' | 'trigger-signal' | 'manual' | 'cascade';
  triggeredAt: string;          // ISO
  patientRef?: string;          // clinical workflows
  episodeRef?: string;          // billing-critical workflows
  assignedRoles: Record<string, string>;  // role → userId
  dueDate: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'escalated';
}
```

`evaluateEvent.ts` already computes `isOverdue`, `missingItems`, `surveyReadinessScore` from an event + store state. Feeding it a `WorkflowInstance` (which is a `RegulatoryEvent` projection) requires zero changes to the evaluation logic.

### 5.5 Workflow × Enforcement Engine

**Direction:** SLA breach + approval gap → escalation chain.
**Files:** `enforcement/enforcementEngine.ts`, `enforcement/escalationEngine.ts`, `enforcement/roleHierarchy.ts`, `stores/enforcementStore.ts`

The enforcement engine already handles:
- Blockers (missing forms, incomplete steps, blocked minutes)
- Warning thresholds (approaching SLA)
- Approval gaps → `escalationEngine.computeEscalations()` → `enforcementStore.raiseEscalation()`
- Lock/unlock per event
- Append-only audit log in `enforcementStore.auditLog`

Workflow instances feed directly into this engine as `RegulatoryEvent` projections. No new enforcement logic is needed. The only addition: when a workflow SLA is breached, the escalation `toRole` is read from `workflow.escalation[].path[0]` rather than a hard-coded role, giving each workflow domain-specific escalation routing instead of a global default.

The `minutesFormId` on `WorkflowApproval` (`GV-FM-005` / `CO-FM-024` / `QA-FM-001`) translates directly to the `approvals[].targetId` used by `enforcementEngine.ts` to detect approval gaps. No new logic — just correct data.

### 5.6 Workflow × Audit Mode + Risk Scoring + Export

**Direction:** workflow instances provide the evidence axis AuditMode already needs.
**Files:** `AuditModePage.tsx`, `audit/riskScoring.ts`, `audit/exportReport.ts`

`AuditModePage.tsx` currently shows the agency-level risk view. With workflows it gains two new drill-down axes:

**By workflow:** pick `CL-WF-05` → see every instance from the last 12 months with:
- `EnforcementReport` (blockers, approval gaps, timeline issues) from `enforcementEngine.ts`
- `RiskScore` (0–100 + band) from `riskScoring.computeRiskScore()` — the `declared` audit risk is set from `workflow.failureConditions[].impact`
- Every form's status from the execution store
- Full `auditLog` from `enforcementStore.queryByEvent(instanceId)`
- **Export:** `buildAuditBundle()` → `bundleToMarkdown()` → `downloadBlob()` — all three already in `exportReport.ts`

**By regulation:** pick `42 CFR §484.80` → `workflowGraph.byRegulation["42 CFR §484.80"]` returns `["CL-WF-10", "CL-WF-11", "CL-WF-25"]` → aggregate pass/fail.

**Survey Simulation:** pick a patient reference → `autogenStore.triggeredEvents` filtered by `patientRef` → reconstruct every workflow instance that touched that patient in the last 12 months with full evidence. This is the difference between a document library and a survey-defensible system.

The `riskScoring.ts` `CRITICAL_DOMAINS` set (`Governance`, `QAPI`, `Compliance`) matches the domains most represented in the workflow failure conditions. The `immediateJeopardy` band fires when score ≥ 80. For billing-critical workflows (FN, CL-OASIS chain) the `declared` risk ceiling in the projected event is set to `'critical'` by the compiler, which immediately puts those events in the upper scoring tier.

### 5.7 Workflow × Autogen Scheduler + Conflict Resolver

**Direction:** Workflow cadence data → scheduler + conflict resolver inputs.
**Files:** `autogen/scheduler.ts`, `autogen/conflictResolver.ts`, `autogen/dependencyResolver.ts`

These three already exist:
- `scheduler.ts` slots events into calendar weeks while respecting capacity limits.
- `conflictResolver.ts` detects scheduling conflicts between events that share resources.
- `dependencyResolver.ts` orders events that have upstream dependencies.

Workflow dependencies (`WorkflowDependency.relation = 'upstream'`) feed directly into `dependencyResolver.ts`. The billing-critical chain (CL-WF-04 → CL-WF-05 → CL-WF-06 → FN billing) is already the kind of dependency sequence the resolver handles — it just needs the workflow graph as input instead of manually authored event `dependsOn` arrays.

### 5.8 Workflow × Journey / SCORM

**Direction:** workflow publication → training chunk → role acknowledgment.
**Files:** `journey/data/modules.ts`, `journey/data/employees.ts`, `enforcementStore.ts`

On workflow version publish:
1. Compiler emits a SCORM-compatible JSON chunk from `workflow.processOverview + steps[] + requiredForms[]`.
2. `modules.ts` receives the chunk as a new module keyed by `workflowId + version`.
3. Every `userId` whose role matches `workflow.roles.primary | supporting` gets an assignment in `employees.ts`.
4. `enforcementStore.log()` records the assignment so surveyors see *"Staff acknowledged current version of CL-WF-05 within 30 days of effective date."*

New file: `src/policy/journey/utils/scormFromWorkflow.ts`.

### 5.9 Workflow × Dashboard

**Direction:** `workflowGraph` + `WorkflowInstance[]` → KPIs.
**Files:** `DashboardPage.tsx`, `components/regulatory/KpiTile.tsx`, `compliance/index.ts`

KPIs available immediately without new backend logic:

| KPI | Source |
|---|---|
| Workflows overdue (by domain) | `WorkflowInstance[status='active'] + isOverdue` |
| Workflows at-risk (within SLA window) | `daysUntil < sla.maxDurationHours/24` |
| GB approvals pending | `instances where governingBodyInvolved && approvalStatus='pending'` |
| Billing-critical exposure | `instances where isBillingCritical && completionStatus != 'complete'` |
| Avg SLA attainment (30/90 day) | `completed instances: dueDate vs completedAt` |
| Top 5 failing steps | `stepStates where status='blocked' aggregated by step.action` — reveals training and UX gaps |
| Workflows needing re-acknowledgment | `version changed && Journey assignment not completed` |

The "top 5 failing steps" KPI is the one most agencies miss. If CL-WF-05 step 4 (OASIS transmission) fails repeatedly, you have a training problem, not a compliance problem. The data to surface this exists the moment instances are being recorded.

---

## 6. Information Architecture — The Library UI

### 6.1 Route tree

```
/workflows                             ← Library landing (cards + table toggle)
/workflows/domain/:code                ← filtered to domain
/workflows/role/:role                  ← filtered to primary role
/workflows/regulation/:anchor          ← filtered to reg anchor
/workflows/:workflowId                 ← Workflow detail (tabbed shell)
/workflows/:workflowId/instance/:id    ← Runtime execution / checklist
/workflows/:workflowId/audit           ← Audit-view shell
/workflows/calendar                    ← Cadence view (feeds MasterCalendarPage)
/workflows/graph                       ← Dependency graph
```

### 6.2 Landing Page layout

The landing page is rendered inside the one app card described in §7.1. There is **no top nav bar and no top strip** — navigation lives in the brand rail on the left. See §7.11 for the visual mock.

**Brand rail (left, inside the card — 240px / collapses to 64px):**
- CI logo at top.
- `WORKFLOWS` section label → All (166), Domains list with counts, pinned subviews.
- `SAVED VIEWS` section below → *Due this quarter*, *Billing-critical*, *Survey-critical*, *GB pending*.
- Hairline `1px #E5E4E3` separating rail from workspace — not a border on a floating sidebar.
- Actor chip anchored at the bottom of the rail.

**Workspace (right, inside the card):**
- Title row: "Workflows" (Montserrat 28–32px / 600) + subtitle "166 operational workflows · 10 domains" (Roboto 14px / `#524D4B`).
- Breadcrumb strip (Roboto 12px / `#747470`).
- Command line: `⌘K search` input + inline filter chips (`Overdue`, `Mandated`, `Survey-critical`, `Due this quarter`) + view toggle (Cards / Table / Calendar / Graph) — all on one line, no sticky chrome.
- KPI band (4 tiles using `KpiTile.tsx`): Total workflows (166) · Mandated / recurring · High-risk open instances · GB approvals pending.
- Card grid: 3 columns × 3 rows (9 cards per page on ≥1440px). Cards are `bg-white border border-[#E5E4E3] rounded-[8px] hover:border-[#007970]/40` — flat, no shadow, no lift. See §7.7.
- Inline pager at the bottom of the visible region. **Never a scrollbar** at 100% zoom — see §7.2.

### 6.3 Workflow Detail page — tabbed shell

**Starting point:** `WorkflowDrawer.tsx` already exists in the calendar and has the execution/process-flow pattern. Extract its anatomy, adapt for the detail surface inside the one app card, and extend with the additional tabs.

**Header (inside the workspace, not a sticky chrome bar):** ID · title · domain badge · subdomain tag · regulatory anchor chips · owner · version · last updated · risk badge (from `derived.riskLevel`).

**Action row (inline, not sticky):** `Start workflow` · `Open as checklist` · `View required forms` · `View policies` · `Audit view` · `Print / Presentation`. Primary action uses the orange CTA pattern (§7.3); the rest are ghost buttons (teal text on white).

**Why-this-matters banner (always visible):** Pulls `failureConditions[].impact` flags and renders the applicable exposure icons: Patient Safety / Billing / Survey / HIPAA / OSHA / FCA. Never buried at the bottom.

**Tabs:**

| # | Tab | What it shows |
|---|---|---|
| 1 | Overview | Process overview · policy refs (version + status) · trigger type · regulatory anchors · why-this-matters banner |
| 2 | Execution | Step table AND swimlane by role. Each step: action, role, form chips (→ Forms Library), SLA pill, "On failure" hover. Uses `EventWorkspace.tsx` step rendering as the base. |
| 3 | Forms & Documents | Required / Conditional / Supporting groups. Each form from `FORMS_CATALOG`: `whenRequired`, `whoCompletes`, instance status badge. |
| 4 | Roles & Approvals | RACI (primary / supporting / approval). Approval chain with minutes-form chips. Escalation path. |
| 5 | SLAs & Deadlines | Timeline visual: trigger → each step deadline → final artifact. Red line for SLA breach. |
| 6 | Failure & Audit | Failure conditions with citations · audit requirements · surveyor focus · retention years · evidence artifacts. |
| 7 | Related Workflows | Upstream / downstream / parallel from `dependencies[]`. Graph chip links. Dependency block status from `nextDueDateEngine.computeDependencyBlockStatus()`. |
| 8 | History | Past instances · average SLA attainment · escalation history · last audit bundle. |

### 6.4 Audience view modes

Same data, three layout presets — switch via segmented control in the header:

| Mode | Audience | Emphasis |
|---|---|---|
| **Executive** | Administrator, Governing Body | Why-it-matters · compliance exposure · key steps only · GB approval status |
| **Operational** | Clinician, Coordinator, Aide | Step sequence with role column · which forms to open · due times · escalation contacts |
| **Audit** | Compliance Officer, Surveyor | Evidence artifacts · completion history · failed controls · CAP status · traceability chain |

---

## 7. UI/UX Design System — The One-Card Canvas

**Design priorities, in order:**
**① Expensive → ② Modern → ③ Clean → ④ Professional.**

Every decision below ladders up to that ranking. When two choices tie on clean/professional, we pick the one that reads more expensive and more modern. "Expensive" in this context means restraint, precision, deep whitespace, and premium material — not ornament.

**Reference sources:** `Builder/Policies/CI Design System.pdf` (brand), `CI Brand.md` (implementation), `PolicyViewerDesignLight.html` and `FormsViewerLightDesign.html` (live baselines).

### 7.1 Core Spatial Principle — The One-Card Canvas

The entire Workflow Library lives **inside a single rounded card** that fills the viewport. That is it. No top nav bar. No floating toolbars. No side panels that look separate from the app. One surface. Everything else is a region *inside* that surface.

```
┌─────────────────────────────────────────────────────────────────┐
│  [soft neutral viewport background: #F2F2F0]                    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ╭─ App card · bg:#FFFFFF · radius:20px · border:        │   │
│   │ │  1px solid #E5E4E3 · shadow:none (flat)               │   │
│   │ │                                                       │   │
│   │ │  ┌─ Brand rail ─┐  ┌─ Workspace ──────────────────┐   │   │
│   │ │  │ logo         │  │                              │   │   │
│   │ │  │ domain nav   │  │   Main content region        │   │   │
│   │ │  │ counts       │  │   (tabs, grids, detail)      │   │   │
│   │ │  │              │  │                              │   │   │
│   │ │  │ actor chip   │  └──────────────────────────────┘   │   │
│   │ │  └──────────────┘                                     │   │
│   │ ╰───────────────────────────────────────────────────────╯   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Hard rules:**

1. **One card, no nested cards.** Inside the app card, regions are separated by **1px hairline dividers** (`#E5E4E3`) or by **whitespace**, never by a second shadowed card on top of the first. Depth = spacing, not stacking.
2. **No drop shadows on interior elements.** Elevation is communicated by whitespace, hairline borders, and color tone shifts. The outermost app card itself uses a single, almost-invisible `0 1px 2px rgba(0,0,0,0.04)` — never more.
3. **No gradients, no 3D, no glass.** Flat fills only. Gradient backgrounds on the body are acceptable only if extremely subtle and only outside the app card (in the viewport margin).
4. **Hover is material, not decoration.** Hover changes border color from `#E5E4E3` → `#007970` at 40% opacity. No lift, no scale, no shadow-grow animation.
5. **Icons are monochrome by default.** Domain icons from `LibraryPage.tsx → DOMAINS[]` render in `#524D4B` at rest; they only become colored (teal or orange) when the item is active or selected. Icons have uniform 1.5px stroke, 20px size in navigation, 16px inline.

### 7.2 Viewport Fit — No Scrolling By Default

The app is designed to **fit the viewport without scrolling at 100% zoom**. Scrolling appears only when the browser zoom is increased past 100% (which is native browser behavior, not an app layout).

| Layout dimension | Value |
|---|---|
| Viewport | `100dvh × 100dvw` |
| App card margin from viewport edge | `24px` on all sides at ≥ 1280px, `16px` at ≤ 1024px |
| App card dimensions | `calc(100dvw − 48px) × calc(100dvh − 48px)` |
| Brand rail width | `240px` (collapses to `64px` icon-only rail at < 1280px) |
| Workspace region | remaining width, internal `32px` padding |
| Internal overflow | **Pagination and tabs, not scrolling.** Long lists use pager controls or virtualized rows clipped to the visible region. |

**Content strategies that replace scrolling:**

- **Pagination** — card grids paginate at exactly the number of rows that fit (typically 9 or 12 per page on a 16:9 display).
- **Tabbed drill-in** — the Detail page uses its 8 tabs to split content so no single tab exceeds the visible area.
- **Step-through** — the checklist mode presents one step at a time, not a vertical scroll of all steps.
- **Condensed density toggle** — a Density control (Comfortable / Compact) changes row height (`56px` ↔ `40px`) so users on smaller displays can see more without scrolling.
- **Virtualized tables** — when row count > fit, the table virtualizes rows and shows a pager at the bottom of the visible region. The `overflow-y` on the table body is `hidden` for non-zoomed states and becomes `auto` only when the browser zoom is > 100%.

**Breakpoints (all inside the single card, no responsive chrome changes):**

| Width | Behavior |
|---|---|
| ≥ 1440px | Full 240px brand rail, 3-column workspace on landing |
| 1280–1439px | 240px brand rail, 2-column workspace on landing |
| 1024–1279px | 64px icon-only rail, 2-column workspace |
| < 1024px | 64px icon-only rail, 1-column workspace, 40px row density |

### 7.3 Color System — CI Brand (Authoritative)

The CI kit is **Teal + Orange**, not maroon. Every prior mention of maroon in this document is corrected by this section.

| Role token | Hex | Purpose | Do not use for |
|---|---|---|---|
| `--bg-viewport` | `#F2F2F0` | Outside the app card only | App card interior |
| `--surface` | `#FFFFFF` | The app card interior, all inner regions | Hover tint |
| `--surface-soft` | `#FAFBF8` | Subtle zebra rows, subdued panels | Active state |
| `--surface-info` | `#F7FEFF` / `#E5FEFF` | Informational panels paired with teal accents | Alerts |
| `--surface-warn` | `#FFFAF7` | Warning/attention panels paired with orange | Success |
| `--border` | `#E5E4E3` | Hairline dividers, card borders at rest | Text |
| `--border-strong` | `#C8C6C5` | Input underlines, emphasis borders | Card borders |
| `--text-primary` | `#1F1C1B` | Titles, values | Captions |
| `--text-secondary` | `#524D4B` / `#52404B` | Body, labels | Meta |
| `--text-meta` | `#747470` | Meta, IDs, helper text | Never lighter — WCAG 4.5:1 minimum |
| `--brand-teal` | `#007970` | Primary brand — active state, selected filter, section divider, link, teal CTA, brand accent | Card fill on light surfaces |
| `--brand-teal-deep` | `#004142` | Emphasis teal — Clinical Manager chip, dark teal card backgrounds | Text on white |
| `--brand-teal-tint` | `#E5FEFF` | Teal pill backgrounds, tag fills paired with teal text | Page backgrounds |
| `--brand-orange` | `#C74600` (or `#C74601` per live baseline) | Action — primary CTAs, required-field asterisk, strong call-to-action, critical accent | Body text, nav labels |
| `--brand-orange-deep` | `#A83B00` | Orange hover | Default state |
| `--brand-orange-warm-border` | `#421700` | Deep warm border on orange cards only | Text |
| `--status-overdue` | `#C74600` (same as brand orange — overdue *is* the call to action) | Overdue / immediate jeopardy | Decorative |
| `--status-risk` | `#D97706` | At-risk / warning (distinct amber so overdue ≠ warning) | Primary CTA |
| `--status-ok` | `#007970` (teal) | Complete / compliant (brand teal doubles as OK — intentional) | Warning |
| `--status-info` | `#524D4B` | Neutral / informational (stays monochrome — expensive feel) | Active state |

**Two-color rule (the expensive-feel discipline):**
On any given view, only **one accent color is dominant**. Teal leads navigation and state indicators. Orange is reserved for moments of action (primary CTA, required asterisk, overdue chip). A page that tries to use teal, orange, yellow, red, and green simultaneously will feel cheap. Pick one for the page's primary story, demote the rest to monochrome tokens.

### 7.4 Typography — Montserrat + Roboto (CI Kit)

Per `Builder/Policies/CI Design System.pdf` and the implementation in `CI Brand.md`:

- **Display / headers / uppercase section labels:** `Montserrat` — weights `500` / `600` / `700`.
- **Body / inputs / data:** `Roboto` — weights `400` / `500`.

No other typefaces. No serif display fonts. No variable-width decorative faces.

| Role | Font | Size | Weight | Tracking | Case | Color |
|---|---|---|---|---|---|---|
| Display title (page H1) | Montserrat | 28–32px | 600 | `-0.005em` | Sentence | `#1F1C1B` |
| Section label (uppercase) | Montserrat | 11px | 600 | `0.22em` | UPPERCASE | `#1F1C1B` |
| Category/eyebrow | Montserrat | 10–11px | 600 | `0.16em` | UPPERCASE | `#007970` or `#747470` |
| Card title | Montserrat | 13–14px | 600 | `0` | Sentence | `#1F1C1B` |
| Metric / KPI value | Montserrat | 32–40px | 700 | `-0.01em` | Numeric | `#1F1C1B` |
| Body paragraph | Roboto | 14px | 400 | `0` | Sentence | `#524D4B` |
| Table cell value | Roboto | 14px | 400 or 500 | `0` | Sentence | `#1F1C1B` |
| Input value | Roboto | 14px | 400 | `0` | Sentence | `#1F1C1B` |
| Meta / caption | Roboto | 11–12px | 400 | `0` | Sentence | `#747470` |
| Pill / tag label | Roboto | 12px | 500 | `0.02em` | Sentence | context |

**Expensive-typography rule:** uppercase Montserrat labels carry all the weight of hierarchy. Body text in Roboto stays mid-weight, mid-gray — never pushed to full black, never bolded unless it's a metric value. Tracking `0.22em` on section labels is the signature CI move and must be preserved.

### 7.5 Shape & Radius System

| Radius | Usage |
|---|---|
| `20px` | **The one app card** (outermost). Only place this radius appears. |
| `12px` | Interior grouped panels (rare — prefer hairlines over panels) |
| `8px` | Inputs, buttons, pills, tags, small controls |
| `4px` | Tiny chips, inline status dots |
| `full` (9999px) | Avatar, round icon badges only |

**No other radii.** A radius outside this scale is a bug.

**Borders:** `1px solid #E5E4E3` at rest for any divider. Hover/active shifts the border color to `#007970` — no thickness change, no glow, no halo.

### 7.6 Elevation = Whitespace

Since there are no nested shadows, hierarchy is communicated by spacing on a **4px base grid**:

| Gap | Purpose |
|---|---|
| `4px` | Inside a pill, between icon and label |
| `8px` | Between related controls |
| `16px` | Between cards in a grid, between form fields |
| `24px` | Between distinct sections inside the workspace |
| `32px` | Internal workspace padding |
| `48px` | Between the page title and the content band |

Any vertical rhythm that does not snap to the 4px grid is a bug.

### 7.7 Cards & Rows — Flat Rules

**The interior card** (a workflow card on the landing grid):

```
bg-[#FFFFFF]
border border-[#E5E4E3]
rounded-[8px]
p-[16px]
hover:border-[#007970]/40
transition-colors duration-150
```

Notes:
- **No shadow, no lift, no scale on hover.** Border color is the only state change.
- **No internal second card.** All content sits on the same white surface.
- Hairline `1px bg-[#E5E4E3]` separates sections inside the card when needed — not another rounded container.
- Icon + title + meta line + pill row + action chip. Maximum four vertical zones; if a fifth is needed, split into a detail tab.

**Row in a table:**
- Row height: `56px` (comfortable) or `40px` (compact).
- Zebra: `#FAFBF8` for every other row (optional, off by default for the most expensive look).
- Divider: `1px #E5E4E3` bottom border on each row except last.
- Hover: background `#F7FEFF` (subtle teal tint). No color on the text.

### 7.8 Pills, Badges, Chips

Small visual statuses are the only place tinted backgrounds appear:

| Purpose | Fill | Text | Border |
|---|---|---|---|
| Teal info pill | `#E5FEFF` | `#007970` | none |
| Orange alert pill | `#FFFAF7` | `#C74600` | none |
| Neutral tag | transparent | `#524D4B` | `1px #E5E4E3` |
| Risk — Overdue | `#FFFAF7` | `#C74600` | `1px #C74600` |
| Risk — At-risk | transparent | `#D97706` | `1px #D97706` |
| Risk — Complete | transparent | `#007970` | `1px #007970` |

Pills are `rounded-[4px]` or `rounded-full` for domain badges. Typography: Roboto 12px / 500, no uppercase — reserve uppercase + tracking for Montserrat section labels only.

### 7.9 Motion

Motion is minimal and near-invisible. Expensive products do not animate celebrations.

| Action | Transition |
|---|---|
| Hover border | `120ms ease-out` |
| Tab switch | `150ms ease-out` cross-fade on content only, no slide |
| Pager advance | `200ms ease-out` content swap, no slide |
| Modal / drawer open | `200ms ease-out` fade + `4px` rise |
| Checkbox, toggle | instant (`0ms`) |

No spring physics. No parallax. No Lottie. No confetti — ever, under any circumstances. A completed workflow shows a teal pill, not an animation.

### 7.10 No Nav Bar — Where Navigation Lives

Replacing the top nav bar:

- **Brand rail (left, inside the card).** This is where global navigation lives: CI logo at top, workflow domains with counts in the middle, actor chip at the bottom. It is **part of the app card** separated by a single `1px #E5E4E3` vertical hairline from the workspace. It is not a sidebar on top of the page.
- **In-workspace tabs.** Detail pages use horizontal tabs with a `2px #007970` bottom indicator on the active tab. Tabs live inside the workspace region, not on a chrome bar.
- **Breadcrumb strip.** Above the workspace title, a single line in Roboto 12px `#747470`: `Workflows  /  Clinical  /  CL-WF-05`. Each segment is clickable. Never exceeds one line.
- **Command palette (⌘K).** All navigation is also reachable from a flat command palette. This replaces the need for a global search bar in a nav chrome.
- **Actor chip, not profile menu.** Bottom of the brand rail. Initials circle + role + status dot. Click opens a flat overlay inside the workspace, not a dropdown attached to a chrome bar.

### 7.11 Landing Page — Final Layout

Inside the one app card:

```
┌─ brand rail 240px ────┐ ┌─ workspace ────────────────────────────┐
│  [CI logo]            │ │  Workflows                             │
│                       │ │  166 operational workflows · 10 domains│
│  WORKFLOWS            │ │  ──────────────────────────────────────│
│  · All          166   │ │  [⌘K search]  [Overdue] [Mandated]     │
│                       │ │  [Survey-critical] [Due this quarter]  │
│  DOMAINS              │ │                                        │
│  · GV Governance  22  │ │  ┌ KPI · 166 ┐ ┌ KPI · 47 ┐ ┌ ... ┐   │
│  · CL Clinical    25  │ │  │ Total     │ │ Mandated │ │     │   │
│  · QA QAPI        16  │ │  └───────────┘ └──────────┘ └─────┘   │
│  · HR Human Res.  18  │ │  ─────────────────────────────────────│
│  · CO Compliance  22  │ │                                        │
│  · FN Finance     14  │ │  ┌ workflow card ┐ ┌ workflow card ┐  │
│  · OP Operations  12  │ │  │ CL-WF-05      │ │ GV-WF-03      │  │
│  · IT IT/Sec.     18  │ │  │ OASIS  ●OK    │ │ Admin  ●Risk  │  │
│  · RM Risk         6  │ │  │ Annual · 9 fm │ │ Annual · 4 fm │  │
│  · EN Enterprise  13  │ │  └───────────────┘ └───────────────┘  │
│                       │ │  … 9 cards per page · [page 1 of 19]  │
│  SAVED VIEWS          │ │                                        │
│  · Due this quarter   │ │                                        │
│  · Billing-critical   │ │                                        │
│                       │ │                                        │
│  ─────────────        │ │                                        │
│  ◎ Current User       │ │                                        │
│  Clinical Manager · ● │ │                                        │
└───────────────────────┘ └────────────────────────────────────────┘
```

No scrollbars. 9 cards per page on a 1440 × 900 display. The pager at the bottom is inline, monochrome, Roboto 12px.

### 7.12 Design Acceptance Checklist (gate for every screen)

Before any Workflow Library screen ships, it must pass all of the following. If any item fails, the design is rejected.

- [ ] One app card, 20px radius, no nested cards.
- [ ] Zero drop shadows on interior elements.
- [ ] No top nav bar. Brand rail exists as part of the card.
- [ ] No scrollbars at 100% browser zoom on a 1440 × 900 viewport.
- [ ] Two-color discipline — teal leads, orange is reserved for action. No third accent hue visible on the page.
- [ ] Montserrat used only for display / section labels / metrics. Roboto for all body.
- [ ] Section label pattern: Montserrat 11px, 600 weight, 0.22em tracking, UPPERCASE, `#1F1C1B` or `#007970`.
- [ ] All radii from {4, 8, 12, 20}. No other values.
- [ ] All spacing on the 4px grid.
- [ ] All borders `#E5E4E3` at rest, `#007970` at active/selected.
- [ ] Meta text no lighter than `#747470`. WCAG 4.5:1 verified.
- [ ] No gradient, no glass, no 3D, no bevel.
- [ ] No motion longer than 200ms. No celebratory animation.
- [ ] Icon stroke 1.5px, 20px in nav / 16px inline, monochrome at rest.
- [ ] Hover = border color shift only. No lift, no scale, no shadow grow.

---

## 8. Build Order — 4 Phases, 6 Weeks

Phase 3 is shorter than originally estimated because the enforcement, escalation, risk scoring, audit export, and autogen layers are already built. We are integrating, not constructing.

### Phase 1 — Data Contract (Week 1)

- [ ] `src/policy/types/workflow.ts` — canonical `Workflow`, `WorkflowGraph`, `WorkflowStep`, `WorkflowApproval`, `WorkflowDependency` interfaces + domain code map.
- [ ] Zod schema for compile-time validation.
- [ ] `scripts/compileWorkflows.ts` — parses 13-section markdown grammar, validates all cross-references.
- [ ] Emit `workflows.generated.ts` + `workflowGraph.generated.ts`.
- [ ] Emit `workflowTemplates.generated.ts` (time-based workflows only → feed into `templateRegistry.ts`).
- [ ] CI rule: broken `formId` / `policyId` / `GV-FM-005` coverage gaps fail the build.
- [ ] Reconciliation report: diff compiler output vs `AUDIT_REPORT.md` — should be zero. This is the Phase 1 go/no-go gate.

### Phase 2 — Library UI (Week 2–3)

- [ ] `/workflows` landing: card grid + table + filters. Mirror `LibraryPage.tsx` three-column layout. Import `DOMAINS[]` icons/colors directly.
- [ ] `/workflows/:id` detail with the 8 tabs. Use `EventWorkspace.tsx` and `WorkflowDrawer.tsx` rendering patterns for the Execution tab step/swimlane.
- [ ] `<LinkedWorkflows policyId />` panel → extend `SharedPolicyDetailView.tsx`.
- [ ] `<UsedInWorkflows formId />` panel → extend `FormsPage.tsx`.
- [ ] `FormViewer.tsx` context strip when opened from a workflow instance.
- [ ] Dashboard KPIs section using `KpiTile.tsx` + `workflowGraph` selectors.

### Phase 3 — Runtime (Week 4)

- [ ] `WorkflowInstance` type added to `regulatoryExecutionStore.ts` (extend, do not fork).
- [ ] `templateRegistry.ts` receives `workflowTemplates.generated.ts` entries — hand-authored templates remain, generated templates fill gaps.
- [ ] Event-based workflows → `TriggerSignal` type definitions added to `autogen/triggerEngine.ts`.
- [ ] Checklist mode (`/workflows/:id/instance/:id`) — reuse existing `EventWorkspace.tsx` step + form + approval panels.
- [ ] Enforcement escalation reads `workflow.escalation[].path[0]` as the `escalateToRole` instead of hard-coded default.

### Phase 4 — Audit + Training (Week 5–6)

- [ ] Audit Mode new axes: by-workflow and by-regulation views in `AuditModePage.tsx`.
- [ ] Survey Simulation: patient-timeline reconstruction from `autogenStore.triggeredEvents`.
- [ ] `scormFromWorkflow.ts` wired into `journey/data/modules.ts` + role assignment.
- [ ] Dependency graph view (`/workflows/graph`) using `workflowGraph.upstream` + `workflowGraph.downstream`.
- [ ] Print template extension: adapt `PolicyViewerPrintDownloadDesignLight.html` for workflow detail.

---

## 9. Cross-Cutting Invariants (non-negotiable)

1. **No broken references — ever.** 342 form refs, 0 broken is the baseline set by `AUDIT_REPORT.md`. The compiler locks it permanently. A PR that breaks a formId will fail CI.
2. **One domain code system.** All internal Workflow code uses 2-letter `DomainCode`. The `derived.regulatoryDomain` field carries the translated `RegulatoryDomain` string for event projection. No string matching at runtime.
3. **GB approval is explicit and enforced.** Any workflow with a Governing Body approval must have `GV-FM-005` in `auditRequirements.evidenceArtifacts`. Compiler enforces. No workflow can be survey-ready without it.
4. **Billing-critical workflows gate on evidence.** A `WorkflowInstance` where `derived.isBillingCritical === true` cannot transition to `completed` in the store until all `requiredForms` have `FormState.status === 'complete'`. The store's `ValidationReport.canComplete` already implements this pattern for events.
5. **Versioned and immutable on close.** When a workflow version increments, in-flight instances stay on their version. Closed instances are locked (`enforcementStore.lock(instanceId)`). Audit log is append-only — no clear-entry API in production.
6. **Never duplicate the event store.** There is one Zustand store for runtime execution state: `regulatoryExecutionStore.ts`. Workflow instances are rows in that store, not a separate parallel store. If state needs to be shared between the Calendar and the Workflow Library (e.g., a form completed in the calendar workspace should reflect in the workflow checklist), it does so through the single store.
7. **Fallback to static rendering.** If the compiler or generator is offline, the library renders from the last-emitted `workflows.generated.ts`. Clinicians are never blocked because of a build pipeline issue.

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Authoring drift (markdown changes, generated files lag) | Broken refs, stale compliance state | Git pre-commit hook runs compiler on changed `*.md` workflow files; CI blocks merge on failures |
| Over-engineering the data model before UI validates assumptions | Rework | Ship Phase 1 stub with 5 workflows before compiling all 166 — validate structure against `EventWorkspace.tsx` rendering |
| Template registry conflicts (hand-authored vs generated events same ID) | Duplicate calendar entries | `conflictResolver.ts` already deduplicates by event ID; generated IDs use `WF-` prefix to avoid collision |
| Brand color misapplication (teal/orange saturation) | UI looks cheap, WCAG fails | CSS token file enforced; orange reserved for action-only; teal reserved for brand/active/ok; §7.12 Design Acceptance Checklist gates every screen |
| Nested cards / shadow layering sneaking back in | Cheap, generic SaaS look | Single app-card invariant in §7.1; reviewers reject any PR that introduces a shadowed interior container |
| Scrollbars appearing at 100% zoom | Breaks the one-card experience | Landing + detail tested on 1440×900 and 1280×800 before merge; virtualized tables + pagers, not overflow-y |
| Domain code mismatch at runtime | Projection failures to event store | Single translation map in `workflow.ts`; enforced at compile time; zero runtime string matching |
| Surveyor evidence gap | Deficiency finding | Phase 4 Survey Simulation validated against every scenario in `AUDIT_REPORT.md` §4 high-risk gaps before GA |
| Journey module assignment storms (all-users reassignment on version bump) | Notification overload | Assignment only fires for roles where `workflow.roles.primary | supporting` intersect with active employees; grace period of 30 days before enforcement |
| `WorkflowInstance` state lost on browser clear | Compliance evidence gap | All critical instances must produce evidence documents (uploaded or generated); `EvidenceDoc` objects are the durable record, not store state |

---

## 11. Immediate Next Actions (this week)

1. **Freeze the contract.** Cut `src/policy/types/workflow.ts` with the full model above. This is the gate for everything else — authoring, compiler, UI, and runtime can proceed in parallel once the types are locked.
2. **Dry-run the compiler on 2 domain files** (suggest `CL-WORKFLOWS.md` and `GV-WORKFLOWS.md` — highest form-ref density). Publish the output at `Builder/Compliance/Documents/WORKFLOW_COMPILE_DRY_RUN.md`. Zero discrepancies vs `AUDIT_REPORT.md` = go.
3. **Stub `/workflows` route.** A landing page that reads `workflows.generated.ts` and renders a card per workflow (id + title + domain icon + risk badge). No detail pages yet. This unblocks cross-linking from the Policy Library detail pages.
4. **Add `<LinkedWorkflows />` to `SharedPolicyDetailView.tsx`.** Even reading from the stub generated data, this immediately surfaces the bidirectional relationship to every policy viewer. Low effort, high visibility.
5. **Map the template gap.** Run `diff templateRegistry.ts workflowTemplates.generated.ts` — find which of the 166 workflows have no corresponding template entry today. That gap is the unplanned compliance exposure list and the prioritization input for Phase 3.

---

## 12. Reference Index

### Workflow Source & Compilation

| Artifact | Path |
|---|---|
| Workflow source markdown | `Builder/Policies/Workflows/CL-WORKFLOWS.md` (and 9 others) |
| Cross-reference audit (current manual state) | `Builder/Policies/Workflows/AUDIT_REPORT.md` |
| P&P amendment register | `Builder/Policies/Workflows/PP_AMENDMENT_REGISTER.md` |
| Mandated events strategy | `Builder/Compliance/ChatGPTmandatedEvents.md` |
| **Compiler (to build)** | `scripts/compileWorkflows.ts` |
| **Generated workflow data (to build)** | `src/policy/data/workflows.generated.ts` |
| **Generated workflow graph (to build)** | `src/policy/data/workflowGraph.generated.ts` |
| **Generated templates (to build)** | `src/policy/autogen/workflowTemplates.generated.ts` |
| **Workflow types (to build)** | `src/policy/types/workflow.ts` |

### Runtime — Existing (do not re-build)

| Artifact | Path |
|---|---|
| Compliance engine | `src/policy/compliance/complianceEngine.ts` |
| Event evaluator | `src/policy/compliance/evaluateEvent.ts` |
| Compliance KPIs hook | `src/policy/compliance/useComplianceMap.ts` |
| Regulatory execution store | `src/policy/stores/regulatoryExecutionStore.ts` |
| Enforcement store (audit log, locks, escalations) | `src/policy/stores/enforcementStore.ts` |
| Enforcement engine | `src/policy/enforcement/enforcementEngine.ts` |
| Escalation engine | `src/policy/enforcement/escalationEngine.ts` |
| Role hierarchy | `src/policy/enforcement/roleHierarchy.ts` |
| Autogen store | `src/policy/stores/autogenStore.ts` |
| Annual generator | `src/policy/autogen/annualGenerator.ts` |
| Trigger engine | `src/policy/autogen/triggerEngine.ts` |
| Template registry | `src/policy/autogen/templateRegistry.ts` |
| Conflict resolver | `src/policy/autogen/conflictResolver.ts` |
| Dependency resolver | `src/policy/autogen/dependencyResolver.ts` |
| Scheduler | `src/policy/autogen/scheduler.ts` |
| Next due date engine | `src/policy/utils/nextDueDateEngine.ts` |
| Reminder engine | `src/policy/utils/reminderEngine.ts` |
| Risk scoring | `src/policy/audit/riskScoring.ts` |
| Audit export | `src/policy/audit/exportReport.ts` |
| Regulatory events data | `src/policy/data/regulatoryEvents.ts` |
| Mandated events expanded | `src/policy/data/mandatedEventsExpanded.ts` |
| Forms catalog | `src/policy/data/formsCatalog.ts` |

### UI — Existing (extend, do not re-build)

| Artifact | Path |
|---|---|
| Policy library landing | `src/policy/pages/LibraryPage.tsx` |
| Shared policy detail | `src/policy/components/SharedPolicyDetailView.tsx` |
| Forms page | `src/policy/pages/FormsPage.tsx` |
| Form viewer | `src/policy/components/FormViewer.tsx` |
| Master calendar | `src/policy/pages/MasterCalendarPage.tsx` |
| Dashboard | `src/policy/pages/DashboardPage.tsx` |
| Audit mode | `src/policy/pages/AuditModePage.tsx` |
| **Workflow drawer** (already in calendar) | `src/policy/components/regulatory/WorkflowDrawer.tsx` |
| Event workspace | `src/policy/components/regulatory/EventWorkspace.tsx` |
| Approval flow | `src/policy/components/regulatory/ApprovalFlow.tsx` |
| Blocker panel | `src/policy/components/regulatory/BlockerPanel.tsx` |
| Evidence panel | `src/policy/components/regulatory/EvidencePanel.tsx` |
| KPI tile | `src/policy/components/regulatory/KpiTile.tsx` |
| Primitives (DomainBadge, UrgencyChip, PolicyRef, Panel) | `src/policy/components/regulatory/Primitives.tsx` |

### Design Baselines

| Artifact | Path |
|---|---|
| Policy viewer design (light) | `Builder/Policies/PolicyViewerDesignLight.html` |
| Print / download design (light) | `Builder/Policies/PolicyViewerPrintDownloadDesignLight.html` |
| Forms viewer design (light) | `Builder/Policies/FormsViewerLightDesign.html` |
| Modal nav | `Builder/Policies/ModalNav.html` |

---

## 13. Bottom Line

**The infrastructure is 80% built.** The Compliance Engine, Enforcement Engine, Autogen System, Risk Scoring, Audit Export, Dependency Resolver, Next Due Date Engine, Escalation Engine, Event Workspace, and Workflow Drawer are all live. The domain taxonomy, form catalog, and policy library are all live. 166 audit-validated workflows exist in structured markdown.

What is missing is exactly three things:
1. A **compiler** that makes the 342 cross-references a build invariant instead of a manual sweep.
2. A **library shell** (`/workflows`) that gives the workflows their own browseable surface.
3. A **projection pipeline** that connects compiled workflow templates into the autogen system so one workflow author yields a library entry + a calendar event + a checklist + an escalation chain + a survey evidence bundle — automatically.

Three weeks of focused work closes the gap. Everything else is already there.
