# Agent 01 — Data Model Alignment for Seeding
## Seeding-Live-Staging-Alignment Audit (2026-05)

**Date**: 2026-05-21  
**Agent**: 01 — Data Model Alignment for Seeding  
**Mission**: Exhaustive comparison of toy CES models in `src/ui-staging/V3StagingApp.tsx` vs canonical live models in `src/policy/ces/types.ts`, `src/policy/compliance-execution/*`, seed data, adapters, and runtime snapshots. Identify all mismatches, enum diffs, missing relationships, and how the current seeding mapper papers over gaps. Provide concrete examples, roadblocks, and recommended canonical adapter path.

**Files Analyzed (exhaustive read + cross-grep)**:
- `src/ui-staging/V3StagingApp.tsx` (primary toy surface, ~2000+ LOC; full Ces* interfaces + mapper + hardcoded mocks + seeded render paths)
- `src/policy/ces/types.ts` (canonical ExecutionUnit / Obligation, ComplianceState, ComplianceDomain, WorkflowPhase, EvidenceStatus, RequiredSigner, Owner, ObligationSourceType, ObligationOwnership, BlockedReason, all role assignment fields, signer task fields)
- `src/policy/ces/data/V3_CES_SeedData.ts` (V3_ExecutionUnitsSeed: 5 rich canonical ExecutionUnit[] with full extensions)
- `src/policy/compliance-execution/complianceExecutionStore.ts` (ComplianceExecutionSnapshot + MergedExecutionUnit)
- `src/policy/compliance-execution/complianceExecutionTypes.ts` (Merged* wrappers)
- `src/policy/compliance-execution/types.ts` (EventTask, EventInstance, lower-level models with eventId/taskSourceType)
- `src/policy/compliance-execution/complianceExecutionAdapters.ts` (deriveExecutionUnit, auditStateTo* mappers, DOMAIN_MAP, projectEvidence/projectSigners)
- `src/policy/compliance-execution/eventTaskAdapter.ts` (deriveDefaultEventTasks + role population)
- `src/policy/onboarding/onboardingExecutionEngine.ts` (OnboardingExecutionUnit extends ExecutionUnit + onboarding fields)
- `src/policy/ces/cesRoles.ts` (CES_ROLES, CesTaskRoleAssignment, buildCesRoleAssignment, resolveCesRole)
- `src/policy/ces/components/board/SprintExecutionBoard.tsx` (live consumer of ExecutionUnit[] + parentEventId grouping + ComplianceState columns)
- `src/policy/ces/pages/MyTasksPage.tsx` (backfillRoles, MergedExecutionUnit usage)
- Supporting: `src/policy/ces/cesExecutionMode.ts`, sprintWindows, regulatoryEvents, etc. (via targeted greps)

---

## 1. Executive Summary of Misalignments

The V3 UI-Staging harness (`V3StagingApp.tsx`) was built with **pre-canonical toy models** (`CesExecutionUnit`, `CesBoardTask`, local `complianceState`, ad-hoc `domain` strings, `PmTaskStatus`, `certificationStatus`). 

The canonical live model (`ExecutionUnit` in `ces/types.ts`, re-exported everywhere, extended by `MergedExecutionUnit` / `OnboardingExecutionUnit`) evolved with:
- Structured `parentEventId` (not `eventId`/`event_id`)
- `workflowPhase` (5-phase)
- Rich `EvidenceStatus`, `RequiredSigner[]`, multi-Owner (owner/approver/signatureOwner)
- `BlockedReason`
- **Obligation extensions**: `obligationKind`, `parentObligationId`, `sourceType`, `source*Ids[]`, `ownership`, `sprintId`
- **Full CES role assignments** (8+ fields: `assignedRole`, `accountableRole`, `reviewerRole`, `approverRole`, `can*Roles[]`, `escalationRole`)
- **Signer task fields** (`isSignerTask`, `signerRole`, `parentFormTaskId`, `blocksOnSignerTasks`)
- `sprintId` + `ObligationOwnership` for filtering/assignment

**V3_ExecutionUnitsSeed** (in `V3_CES_SeedData.ts`) is **correctly typed against the canonical model** and populates nearly all fields (including extensions and roles).

However, the **seeding path in V3StagingApp.tsx** is **lossy and divergent**:
- `useV3Seeds` toggle feeds real `ExecutionUnit[]` into a **one-way adapter** (`mapToLocalUnit`) for the CES Dashboard.
- CES Board has a partial "live grouping" path (using `ComplianceState` columns + direct `RealExecutionUnit`) but still hardcodes toy `CesBoardTask[]` and `PmTaskStatus` for the non-seed path.
- Hardcoded toy mocks invent domains ("Safety"), states ("non-compliant", "grace-eligible"), and use legacy flat strings / different keys.

**Result**: Seeding is "aligned on the seed data side" but **staging UI surfaces remain misaligned**. This blocks true "live and staging aligned" seeding, role-based testing, sprint filtering, provenance tracing, and TASK vs SPRINT_TASK differentiation.

---

## 2. Exact Type Diffs — CesExecutionUnit (Toy) vs ExecutionUnit (Canonical)

### 2.1 Toy Interface (V3StagingApp.tsx:112-118)

```ts
interface CesExecutionUnit {
  id: string;
  eventId: string;              // ← legacy; maps to parentEventId in live
  eventTitle: string;           // ← derived/truncated from title
  domain: string;               // ← title-cased string; allows "Safety"
  owner: string;                // ← flattened "INITIALS · Role"
  complianceState: 'compliant' | 'at-risk' | 'non-compliant' | 'in-progress';
  tasksTotal: number;
  tasksDone: number;
  evidenceCount: number;
  signaturesPending: number;
  certificationStatus: 'certified' | 'grace-eligible' | 'not-ready' | 'audit-ready';
  dueDate: string;
  isOverdue: boolean;
}
```

### 2.2 Canonical Interface (src/policy/ces/types.ts:206-271) — ExecutionUnit (aliased as Obligation)

```ts
export interface ExecutionUnit {
  id: string;
  title: string;
  parentEventId: string;        // ← canonical relationship key (NOT eventId)
  workflowId: string;
  workflowPhase: WorkflowPhase; // 'preparation' | 'documentation' | 'review' | 'signature' | 'audit'
  complianceState: ComplianceState; // 'upcoming' | 'ready' | 'in_progress' | 'awaiting_signature' | 'blocked' | 'completed'
  auditReadiness: AuditReadiness;   // 'not_ready' | 'partial' | 'ready'
  owner: Owner;                 // structured {userId, name, initials, role}
  approver: Owner;
  signatureOwner: Owner;
  requiredSigners: RequiredSigner[];
  blockedReason?: BlockedReason;
  dueDate: string;
  escalationTimer?: number;
  evidenceStatus: EvidenceStatus; // full {requiredFormsTotal/Complete, missingFormIds[], signatures*, auditIndexCreated}
  domain: ComplianceDomain;     // 'clinical' | 'compliance' | 'hr' | 'governance' (lowercase)

  // Obligation extensions (optional for back-compat but required for live alignment)
  obligationKind?: 'SPRINT_TASK' | 'TASK';
  parentObligationId?: string;  // for TASK subtype
  sourceType?: ObligationSourceType; // 'ONBOARDING' | 'REGULATORY_EVENT' | 'WORKFLOW' | 'POLICY_LIFECYCLE' | 'COMMITTEE' | 'SECURITY' | 'AUDIT' | 'ECIGN'
  sourcePolicyIds?: readonly string[];
  sourceWorkflowIds?: readonly string[];
  sourceFormIds?: readonly string[];
  ownership?: ObligationOwnership; // primary/secondary/assignedUserIds/RoleIds/GroupIds/committeeOwnerId/...
  sprintId?: string;

  // CES Canonical Role Assignment (8 fields — "must have" per comments)
  assignedRole?: string;
  accountableRole?: string;
  reviewerRole?: string;
  approverRole?: string;
  canCompleteRoles?: readonly string[];
  canReviewRoles?: readonly string[];
  canApproveRoles?: readonly string[];
  escalationRole?: string;

  // Signer task fields
  isSignerTask?: boolean;
  signerRole?: string;
  parentFormTaskId?: string;
  blocksOnSignerTasks?: boolean;
}
```

**Missing from toy entirely**:
- `workflowId`, `workflowPhase`, `auditReadiness` (separate from complianceState)
- Structured `owner`/`approver`/`signatureOwner` + `requiredSigners[]` (only flattened owner + signaturesPending count)
- `blockedReason` (object with kind/label/resourceId)
- Full `evidenceStatus` (only aggregates; loses `missingFormIds`, `auditIndexCreated`)
- **All obligation provenance**: `obligationKind`, `parentObligationId`, `sourceType`, `source*Ids[]`, `ownership`, `sprintId`
- **All role assignment fields** (critical for DON/GB/Administrator routing, enforcement, My Tasks filtering)
- **Signer task metadata**
- `escalationTimer` (only boolean isOverdue derived)

### 2.3 CesBoardTask (Toy) vs Live Usage

```ts
// V3StagingApp.tsx:121-126
type PmTaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
interface CesBoardTask {
  task_id: string; code: string; title: string; event_title: string; event_id: string;
  assigned_user_id: string; assignee_name: string; domain: string; due_date: string;
  status: PmTaskStatus; is_overdue: boolean; evidence_count: number; signatures_pending: number;
  has_form: boolean; completion_percentage: number; card_layer: 1 | 2 | 3;
}
```

**Live equivalent**:
- No `CesBoardTask`. Live `SprintExecutionBoard` + seeded board path in staging directly consume `ExecutionUnit[]` (or `MergedExecutionUnit[]` from `useComplianceExecution` snapshot).
- Uses `parentEventId` for event swimlanes, `complianceState` for the 6 canonical columns (`upcoming`/`ready`/`in_progress`/`awaiting_signature`/`blocked`/`completed`).
- Individual tasks are `EventTask` (compliance-execution/types.ts:36+) with `eventId` (note singular), `taskSourceId`/`taskSourceType`, `status: EventTaskStatus`, plus the same role assignment fields.
- Lower-level `EventTask` has `policyIds`, `formIds[]`, `evidenceIds[]`, `ownerRole`/`ownerUserId`, `folderPath`, etc.

**Key naming/relationship mismatches**:
- Toy: `event_id` / `eventId` (on both Ces* types)
- Live / Seed / Snapshot: `parentEventId` (on ExecutionUnit), `eventId` (on EventTask / ComplianceEvent / Merged*)
- Toy board uses `task_id`; live uses `id` (for units) or `taskSourceId` + deterministic `buildDeterministicTaskId`

---

## 3. Enum Differences

### 3.1 ComplianceState

**Canonical** (`ces/types.ts:29-35` + `COMPLIANCE_STATE_ORDER`):
```ts
'upcoming' | 'ready' | 'in_progress' | 'awaiting_signature' | 'blocked' | 'completed'
```
Labels: Upcoming, Ready, In Progress, Awaiting Signature, Blocked, Completed.

**Toy** (`V3StagingApp.tsx:114`):
```ts
'compliant' | 'at-risk' | 'non-compliant' | 'in-progress'
```

**Mapper logic** (611-627):
```ts
complianceState: (['in-progress', 'awaiting_signature'].includes(u.complianceState) ? 'in-progress' :
                 u.complianceState === 'blocked' ? 'at-risk' :
                 u.complianceState === 'completed' ? 'compliant' : 'at-risk')
```
- Loses distinction between `upcoming`/`ready`/`in_progress`/`awaiting_signature` (all collapse).
- `non-compliant` appears **only in hardcoded toy mocks** (EU-006); canonical has no exact equivalent (closest: `blocked`).
- Seeded board path (when `useV3Seeds`) **correctly** uses canonical `ComplianceState[]` for columns — inconsistent with dashboard.

**Adapters** (`complianceExecutionAdapters.ts:62-74`): `auditStateToComplianceState` produces canonical values from AuditState.

### 3.2 ComplianceDomain

**Canonical** (`ces/types.ts:63`):
```ts
'clinical' | 'compliance' | 'hr' | 'governance'
```
(Plus `COMPLIANCE_DOMAIN_LABEL` and `DOMAIN_MAP` in adapters for RegulatoryDomain → canonical.)

**Toy**:
- Hardcoded mocks: `'Clinical'`, `'Safety'`, `'Compliance'`
- Mapper: `u.domain.charAt(0).toUpperCase() + u.domain.slice(1)` → "Governance", "Clinical", "Compliance", "Hr"
- "Safety" **does not exist** in canonical or seed data. Invented for toy.

**Seed data** (V3_CES_SeedData): Correctly uses `'governance'`, `'compliance'`, `'clinical'`, `'hr'`.

### 3.3 Other Enums / Statuses

- **Toy certificationStatus**: `'certified' | 'grace-eligible' | 'not-ready' | 'audit-ready'` (derived in mapper from complianceState + auditReadiness). **Not present** in canonical.
- **PmTaskStatus** (toy board only): `'todo' | 'in_progress' | 'review' | 'done' | 'blocked'` — overlaps partially with ComplianceState but different vocabulary and 5 vs 6 states.
- **Canonical WorkflowPhase**: `'preparation' | 'documentation' | 'review' | 'signature' | 'audit'` (with `WORKFLOW_PHASE_ORDER`). Completely absent from toy models. Seed populates it correctly (`'signature'`, `'review'`, `'documentation'`, `'audit'`).
- **EventTaskStatus** (lower live): `'not_started' | 'in_progress' | 'blocked' | 'awaiting_signature' | 'completed' | 'cancelled'`.
- **ObligationSourceType** (live/seed only): 8 values including `'REGULATORY_EVENT' | 'WORKFLOW' | 'ONBOARDING' | 'COMMITTEE' | ...`
- **SignerStatus**: `'signed' | 'pending' | 'overdue'`

---

## 4. Concrete Examples from V3_ExecutionUnitsSeed vs Toy Expectations

**Seed unit 1** (V3_CES_SeedData.ts:277-315) — canonical shape:
```ts
{
  id: 'ceu-gb-2026-10-001',
  title: 'Prepare & distribute Q2 Governing Body pre-read packet',
  parentEventId: 'evt-gb-q2-2026',
  workflowId: 'wf-gb-packet-2026-10',
  workflowPhase: 'signature',
  complianceState: 'awaiting_signature',
  auditReadiness: 'partial',
  owner: { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON' },
  approver: { ... 'u-gb-01', 'Governing Body' },
  signatureOwner: { ... },
  requiredSigners: [ {userId:'u-gb-01', ..., status:'pending', hoursToEscalation:31}, {..., status:'signed', signedAt:...} ],
  dueDate: '2026-05-21',
  escalationTimer: 31,
  evidenceStatus: { requiredFormsTotal:2, requiredFormsComplete:2, missingFormIds:[], signaturesRequired:2, signaturesComplete:1, auditIndexCreated:false },
  domain: 'governance',
  obligationKind: 'SPRINT_TASK',
  sourceType: 'REGULATORY_EVENT',
  sourcePolicyIds: ['GV-GB-001'],
  sprintId: '2026-10',
  assignedRole: 'DON',
  accountableRole: 'Governing Body',
  reviewerRole: 'Administrator',
  approverRole: 'Governing Body',
  canCompleteRoles: ['DON', 'Administrator'],
  canReviewRoles: ['Administrator', 'DON'],
  canApproveRoles: ['Governing Body'],
  escalationRole: 'Governing Body',
  // ... (no ownership populated in this seed but type allows it)
}
```

**After mapToLocalUnit** (for dashboard when `useV3Seeds`):
```ts
{
  id: 'ceu-gb-2026-10-001',
  eventId: 'evt-gb-q2-2026',           // parentEventId flattened
  eventTitle: 'Prepare & distribute Q2 Governing Body pre-read packet'.slice(0,35)+'...',
  domain: 'Governance',
  owner: 'MG · DON',
  complianceState: 'in-progress',      // awaiting_signature → in-progress (lossy)
  tasksTotal: 4,                       // 2 forms + 2 sigs
  tasksDone: 3,
  evidenceCount: 2,
  signaturesPending: 1,
  certificationStatus: 'not-ready',    // because complianceState !== completed && auditReadiness !== 'ready'
  dueDate: '05-21',
  isOverdue: false
}
```
**Lost**: workflowPhase='signature', blockedReason (n/a here), full signers/details, all role fields, obligationKind, sourceType, sprintId, sourcePolicyIds, structured owners, missingFormIds=[], auditIndexCreated, escalationTimer value, etc.

**Hardcoded toy example** (V3StagingApp:634):
```ts
{ id: 'EU-003', eventId: 'RE-003', eventTitle: 'Annual Policy Review', domain: 'Compliance',
  owner: 'Admin', complianceState: 'at-risk', ... certificationStatus: 'not-ready', dueDate: 'May 20', isOverdue: true }
```
- Uses legacy `eventId: 'RE-003'` (not parentEventId style)
- Domain "Compliance" (ok after cased) but "Safety" variants elsewhere
- `non-compliant` state only here

**In seeded board path** (812-825, 858+): Uses `seededUnits` (real ExecutionUnit) + `u.parentEventId` for grouping + `u.complianceState` (canonical) for columns. **Better alignment here**, but still renders minimal cards and the non-seed path remains fully toy (`CesBoardTask` with `task_id`, `event_id`, `status: PmTaskStatus`, `card_layer`, `has_form`, `completion_percentage`).

**Snapshot from complianceExecutionStore** (`ComplianceExecutionSnapshot`):
- `executionUnits: readonly MergedExecutionUnit[]` where `MergedExecutionUnit extends ExecutionUnit` + `{ source: ExecutionSource, regulatoryRef?, sourceEventId?, taskSourceId?, sourceEvidenceIds?, folderPath?, auditReadinessScore? }`
- Also carries `events`, `workflows`, `sprintMetrics`, `domainRisks`, `ownerAssignments`, onboardingBatches/gates.
- Onboarding path adds `OnboardingExecutionUnit` with `kind`, `subjectEmployeeId`, `subjectName/Role`, `sourceId`, `gateResults`, `policyRefs`.

V3 seed does **not** yet carry the `Merged*` extras or onboarding fields, but is closer to pure ExecutionUnit.

---

## 5. Missing Relationships & Fields (parentEventId vs event_id, etc.)

- **Relationship keys**: Toy consistently uses `eventId`/`event_id` on dashboard + board task. Live/seed/adapters use `parentEventId` on ExecutionUnit/Obligation (reflecting that a unit belongs to a ComplianceEvent). EventTask uses `eventId`. Seeded grouping code in staging manually handles `parentEventId` — fragile.
- **workflowPhase**: Fully populated in seed (and adapters derive it from AuditState). Toy mapper and CesExecutionUnit ignore it entirely. Live board/WorkflowDrawer rely on it for phase-aware UI.
- **sourceType + provenance**: Seed populates (`'REGULATORY_EVENT'`, `'WORKFLOW'`, `'COMMITTEE'`, `'ONBOARDING'`). Toy has zero concept. Critical for "where did this obligation come from?" tracing, autogen vs regulatory vs ecign.
- **sprintId + ownership**: Seed has `sprintId: '2026-10'`. Live sprint windows + pmViewSprintStore + getExecutionUnitsForSprint filter on it. Toy Ces* have no sprint concept. `ObligationOwnership` (primary/secondary owners, assignedRoleIds, committeeOwnerId, visibilityScope, escalationPath) is in type + seed comment but under-populated; toy has none.
- **Role assignments**: 8 fields + `CesTaskRoleAssignment` interface in cesRoles.ts. Populated in V3 seed and in eventTaskAdapter (via `buildCesRoleAssignment`). Backfilled in MyTasksPage. **Completely absent from toy models and mapper**. Blocks any role-view differentiation or enforcement testing in staging.
- **TASK subtype relationships**: `obligationKind: 'TASK'`, `parentObligationId`. One seed example uses it. Toy cannot represent sub-tasks vs container sprint tasks.
- **Signer task relationships**: `isSignerTask`, `parentFormTaskId`, `blocksOnSignerTasks`. Present in ExecutionUnit type, EventTask type, and signerTaskFactory. Ignored in toy.
- **Evidence & blocked details**: Toy reduces to counts + pending. Live preserves `missingFormIds[]`, `blockedReason.kind` (missing_signature / missing_form / dependency_incomplete / awaiting_external_input), `auditIndexCreated`.
- **Lower-level EventTask vs rolled-up ExecutionUnit**: Different ID schemes, status enums, and granularity. Adapters derive units from events + evaluations; no toy equivalent.

---

## 6. How the Current Seeding Mapper Papers Over the Gaps

**Location**: `V3StagingApp.tsx:611-627` (`mapToLocalUnit`) + `629-638` (localExecutionUnits ternary) + board logic `839` (empty when seeded) + `858-893` (special if(useV3Seeds) render using canonical states but minimal UI).

- **Dashboard always lossy** when seeds ON: rich ExecutionUnit → CesExecutionUnit (flattening + enum collapse + invented certificationStatus).
- **Hardcoded fallbacks** remain even with seeds (old EU-00x with "Safety", "non-compliant", "grace-eligible").
- **Board**: `boardTasks: CesBoardTask[] = useV3Seeds ? [] : [ ...8 toy items... ]` — seeded path bypasses but doesn't populate equivalent rich task cards.
- **Grouping in seeded board**: Re-implements eventMap using `parentEventId` (good) but title derivation is crude (`split('—')[0]`).
- **No round-trip**: Mapper is one-way; no inverse. Cannot edit in staging and push back.
- **useV3Seeds** affects only CES sections; other parts of the massive V3StagingApp remain toy.
- **V3CESSeedPreview.tsx** (separate file) does the right thing: imports and renders raw `ExecutionUnit` directly. Inconsistency within ui-staging.

The mapper "works" for visual demo of the 4-column (Critical/At Risk/In Progress/Compliant) dashboard but **hides every canonical extension** the seeding effort was meant to validate.

---

## 7. Roadblocks This Creates for "Live and Staging Aligned" Seeding

1. **Inconsistent fidelity**: `useV3Seeds=true` gives beautiful seed data on disk but degraded, non-canonical views in the primary staging harness. Developers see "it works" but cannot exercise real fields (roles, sprintId, sourceType, workflowPhase, ownership, TASK subtypes, signer blocking).
2. **Drift risk**: As live model adds fields (e.g., recent `ownership`, `ObligationSourceType` expansions, signer task support), the toy mapper and Ces* interfaces will silently ignore them. Seeding validation becomes theater.
3. **Testing gaps**: Cannot validate:
   - Role-based My Tasks / enforcement (backfillRoles, CES_ROLES, canCompleteRoles, etc.)
   - Sprint window filtering + sprintId
   - Provenance (sourceType + source* arrays)
   - Phase progression (workflowPhase)
   - Sub-obligation relationships
   - Full EvidenceStatus + BlockedReason detail in drawers
   - Snapshot Merged* extras or onboarding extensions
4. **Event/relationship confusion**: `eventId` vs `parentEventId` causes copy-paste bugs when porting staging patterns to live components.
5. **Domain pollution**: "Safety" and invented states leak into mental models.
6. **CES Board divergence**: Two completely different render paths (toy Kanban with card_layer/PmTaskStatus vs live 6-col ComplianceState + event swimlanes). Seeded board is a band-aid.
7. **No unified view model**: Staging cannot serve as a true "live data preview" harness for the 30-agent V3 blueprint.
8. **ComplianceExecutionSnapshot misalignment**: Store provides rich Merged data with regulatoryRef, gateEvaluations, domainRisks, ownerAssignments. Staging mapper throws most of it away.

---

## 8. Recommended Canonical Adapter or Migration Path

**Primary Recommendation**: Introduce a **canonical view-model layer + bidirectional adapter** under `src/policy/ces/` (or `src/policy/compliance-execution/adapters/`).

### Proposed Structure

1. **Canonical Types (already exist)**: Keep `ExecutionUnit` / `Obligation` + `MergedExecutionUnit` + `EventTask` as source of truth. Deprecate/remove toy types after migration.

2. **New Adapter File**: `src/policy/ces/adapters/stagingViewAdapter.ts` (or `cesViewModels.ts`)
   ```ts
   // Pure functions
   export interface CesDashboardUnit { /* minimal stable projection for dashboard cards */ }
   export interface CesBoardTaskView { /* stable for kanban if still needed */ }

   export function toCesDashboardUnit(u: ExecutionUnit | MergedExecutionUnit): CesDashboardUnit;
   export function toCesBoardTask(u: ExecutionUnit, ctx?: ...): CesBoardTaskView; // or prefer direct ExecutionUnitCard

   // Optional: fromViewModel back to ExecutionUnit patch (for demo editing)
   export function applyDashboardPatch(original: ExecutionUnit, patch: Partial<CesDashboardUnit>): ExecutionUnit;
   ```

   Inside `toCesDashboardUnit`:
   - Preserve **as much as possible** (workflowPhase, sprintId, assignedRole, blockedReason.label, sourceType, auditReadiness, full evidence counts + missing ids for tooltip, etc.)
   - Provide **canonical-derived** fields only where truly needed for visuals (e.g., isOverdue = (escalationTimer ?? 0) < 0)
   - Never collapse states/domains; let the UI component decide presentation.

3. **Migrate V3StagingApp.tsx**:
   - Remove or deprecate `CesExecutionUnit`, `CesBoardTask`, `PmTaskStatus`, local complianceState enum, `certificationStatus`.
   - When `useV3Seeds`, directly consume `V3_ExecutionUnitsSeed` (or `useComplianceExecution` snapshot) + render using shared components (`ExecutionUnitCard` from live ces/components/board, or new `CesDashboardCard` that accepts `ExecutionUnit`).
   - For the 4-col "Critical/At Risk/..." grouping currently in dashboard, derive it from canonical states (e.g., blocked + overdue → Critical; awaiting_signature + in_progress → In Progress; etc.) without inventing a parallel enum.
   - Hardcoded toy arrays → only for `!useV3Seeds` (explicit "legacy toy mode" banner).

4. **Update Consumers**:
   - Make `SprintExecutionBoard`, `MyTasksPage`, drawers, etc. the reference renderers.
   - Port the V3 dashboard/board visuals to reuse `ExecutionUnitCard` + `useCesTokens` + state machine logic.
   - In `V3CESSeedPreview.tsx` — already good; make it the model for other previews.

5. **Seed Data Evolution**:
   - Keep `V3_ExecutionUnitsSeed` as `ExecutionUnit[]`.
   - Add more units exercising `obligationKind: 'TASK'`, `ownership`, full `source*`, signer tasks, multiple sprints.
   - Add helper `toMergedExecutionUnit(seedUnit)` for snapshot parity testing.
   - Wire `getExecutionUnitsForSprint` + sprint context into the store snapshot simulation inside staging.

6. **Migration Steps (Phased)**:
   - Phase 1: Add the adapter + make dashboard render rich fields (add tooltips for workflowPhase, roles, sourceType, sprintId).
   - Phase 2: Unify board render path; remove `CesBoardTask` usage.
   - Phase 3: Delete toy interfaces + mapper (or keep behind `import.meta.env.DEV && forceToy` flag).
   - Phase 4: Update docs (CES_Evidence... md files, seeding blueprints) to reference canonical `ExecutionUnit` exclusively.
   - Add runtime assertion / type test: `V3_ExecutionUnitsSeed satisfies readonly ExecutionUnit[]` + lint rule against importing toy types outside ui-staging legacy.

7. **Additional Wins**:
   - Expose `useV3CESSeedContext` + a `useSimulatedComplianceExecutionSnapshot(seed)` hook so staging can feed the real `useComplianceExecution` consumers.
   - Align `V3_SprintContextSeed` with `buildSprintWindow` + `Sprint` type from ces/types.
   - Once aligned, the entire V3 harness becomes a high-fidelity live data preview + regression harness for the canonical model.

**Alternative (lighter)**: If full unification is deferred, at minimum make `mapToLocalUnit` **preserve** hidden rich data via an extra `raw: ExecutionUnit` property on CesExecutionUnit so drill-downs / future components can access canonical fields even in "toy" visual mode.

---

## 9. Supporting Evidence (Key Code Locations)

- Toy definitions + mapper: `src/ui-staging/V3StagingApp.tsx:112-126, 610-627, 629-638, 839, 858-893, 815-825`
- Canonical core: `src/policy/ces/types.ts:206-271` (ExecutionUnit), 29-70 (states/domains/phases), 173-271 (obligation + role + signer extensions)
- Seed (correct usage): `src/policy/ces/data/V3_CES_SeedData.ts:273-483` (5 units with full fields), 519-525 (get*ForSprint)
- Live snapshot: `src/policy/compliance-execution/complianceExecutionStore.ts:47-73` (ComplianceExecutionSnapshot), 57 (executionUnits: Merged...)
- Adapters deriving canonical: `src/policy/compliance-execution/complianceExecutionAdapters.ts:174-214` (deriveExecutionUnit + parentEventId), 62-90 (state/phase mappers), 19-33 (DOMAIN_MAP)
- EventTask (granular): `src/policy/compliance-execution/types.ts:36-96`
- Role system: `src/policy/ces/cesRoles.ts:8-18` (CES_ROLES), 41-58 (CesTaskRoleAssignment), 167-194 (build...)
- Onboarding extension: `src/policy/onboarding/onboardingExecutionEngine.ts:90-101`
- Live board consumer: `src/policy/ces/components/board/SprintExecutionBoard.tsx:49-53` (parentEventId grouping), 56 (ComplianceState columns)
- Role backfill: `src/policy/ces/pages/MyTasksPage.tsx:53-66`

---

## 10. Conclusion

The **data model on disk (V3_CES_SeedData + ces/types)** is excellent and production-shaped. The **staging presentation layer (V3StagingApp.tsx toy models + mapper)** is the primary source of misalignment.

Fixing the adapter + deprecating the parallel toy vocabulary is the critical path to "live and staging aligned" seeding. Once complete, the V3 harness can confidently validate the full canonical surface (roles, ownership, provenance, phases, sub-obligation relationships, snapshot extras) and serve as a trustworthy development and demo environment.

**Next Agents**: Agent 02 (seeding mapper implementation), Agent 03 (CES Board unification), Agent 07 (sprint context), etc., should consume this audit as the definitive diff source.

---

*Report generated by exhaustive file reads, targeted greps across src/policy/ces + compliance-execution + ui-staging, and cross-reference of runtime vs seed shapes. All claims are backed by direct source excerpts.*