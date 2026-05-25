# Agent 04 — Seed Injection into Live System

**Report Date**: 2026-05-21  
**Agent**: 04 — Seed Injection into Live System  
**Mission**: Investigate `useComplianceExecution`, `complianceExecutionStore.ts`, and related hooks. Determine the cleanest way to make `V3_CES_SeedData` (or a derived full seeded snapshot) injectable into the live CES system for both the UI-Staging harness and real components (under a dev/preview flag). Catalog existing dev mode / feature flag / override patterns. Deliver a concrete **Seeding Injection Architecture** proposal enabling a single switch to run the entire live CES (board, dashboard, drawers, My Tasks, calendar, workloads, reports, evidence panels, etc.) on the rich seeded data.

**Target Output**: `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/UI-Staging/Audit/Seeding-Live-Staging-Alignment-2026-05/Agent_04_Seed_Injection_Strategy.md`

---

## 1. Executive Summary of Investigation

The **single source of truth** for all live CES surfaces is the React hook:

```ts
export function useComplianceExecution(
  scope: ComplianceExecutionScope = DEFAULT_COMPLIANCE_SCOPE
): ComplianceExecutionSnapshot
```

Defined in `src/policy/compliance-execution/complianceExecutionStore.ts` (lines 246–394). Every real component (`SprintExecutionBoard`, `CesExecutiveDashboard`, `CesLayout`, `ComplianceCalendar`, `WorkloadDistribution`, `ExecutiveReports`, `AuditModePage`, `DashboardPage`, `MasterControlInventory`, `MyTasksPage` via `useObligations`, drawers, etc.) consumes this hook (or selectors derived from its snapshot).

**Data sources wired into the snapshot** (real path, inside `useMemo`):
- `REGULATORY_EVENTS` + `useAutogenStore` (generated/triggered) → `regEvents` + `buildEventExecutionDataflow` → `regulatoryEventTiles` + `eventPackages`
- `useRegulatoryExecutionStore()` (Zustand: formStates, approvals, completions, evidence, taskOverrides, etc.)
- `useOnboardingEngine()` (from journey store) → `engineUnits`, `batches`, `gateEvaluations`, synthetic `onboardingEventTiles`
- Internal pure `buildSprintWindow` (epoch-anchored 12-day Mon-Fri sprints, distinct from PM 14-day Sun-start model)
- `computeSprintMetrics`, `computeDomainRisks`, `computeOwnerAssignments`, `computeWorkflows`, `computeSprintTrends`
- Hardcoded **DEMO BOOST** (lines 301–345): forces every `MergedExecutionUnit.owner` + `ownership` to the DON demo user (`demo-user-careindeed` / "TJ Padilla (DON)")

The resulting `ComplianceExecutionSnapshot` (interface lines 47–73) contains:
- `activeSprint`, `sprintHistory`, `today`
- `events: MergedComplianceEvent[]`
- `executionUnits: MergedExecutionUnit[]` (canonical `ExecutionUnit` + `source`, `regulatoryRef`, etc.)
- `workflows`, `auditEvaluations`, `sprintMetrics`, `sprintTrends`, `domainRisks`, `ownerAssignments`
- passthrough `onboardingBatches`, `gateEvaluations`

**V3_CES_SeedData** (`src/policy/ces/data/V3_CES_SeedData.ts`):
- High-fidelity, production-shaped static data (5+ rich `ExecutionUnit[]` in `V3_ExecutionUnitsSeed` with full role assignments, `EvidenceStatus`, `RequiredSigner[]`, `obligationKind`, `sourceType`, `sprintId: '2026-10'`, etc.).
- `V3_SprintContextSeed` (custom 12-day sprints with `id: '2026-10'`, `year`).
- `V3_AchcSurveyorAlignmentSeed`, `V3_Personas`, view-mode filtering.
- Convenience: `getActiveSprintExecutionUnits()`, `useV3CESSeedContext()` (static shim, not React).
- **Correctly typed** against canonical `ces/types.ts` `ExecutionUnit` (re-exported as `Merged*` base). Matches live model far better than the toy models in `V3StagingApp.tsx`.

**Current harness usage** (V3StagingApp.tsx):
- Local `useV3Seeds` toggle (default `false`).
- Only powers **shadow** inline `CesDashboardPage` / `CesBoardPage` implementations (lossy `mapToLocalUnit` adapters to toy `CesExecutionUnit`/`CesBoardTask`, dead `seededByEvent` code, no real components).
- Real live components (`/ces/board` route etc.) **never** see the seed.

**Existing dev / override / flag patterns discovered** (excellent foundation):
- `src/policy/pm/featureFlags.ts`: `PmFeatureFlag` union + `localStorage` + `usePmFlag` + runtime `window.__pm = { getFlag, setFlag, getAllFlags }`. Defaults mostly `true` in dev. Used for phased rollouts + instant rollback.
- Vite `import.meta.env.DEV` + `import.meta.env.VITE_*` (e.g. `VITE_STAGING_M01`, `VITE_LOCAL_DEMO_AUTH_BYPASS`, `VITE_EVIDENCE_STORAGE_MODE`).
- `cesExecutionMode.ts`: `sandbox` (Jan–Jun 2026), `future_locked` (Jul+), `production`. Guards mutations/metrics.
- In-store DEMO BOOST + dev-only console warnings (regulatoryExecutionStore).
- `useV3CESSeedContext` + `get*ForSprint` already exported from seed module.
- No prior global snapshot override for CES (this is the gap Agent 04 fills).

**Alignment with prior agents (01/02/03)**:
- Agent 01: Data model on disk (seed + `ces/types`) is excellent; toy mappers in harness are the misalignment. Recommends exposing `useSimulatedComplianceExecutionSnapshot(seed)` + canonical adapters.
- Agent 02: Recommends wiring seed into `useComplianceExecution` / engine / store "demo paths" under staging/demo flag. Eliminates shadow duplication. Extract grouping utils.
- Agent 03: Calls for "seed mode override in the compliance store" or prop injection so real `<SprintExecutionBoard />` + `WorkflowDrawer` etc. can render inside harness when seeded.

**Conclusion of investigation**: The **cleanest, lowest-risk, highest-leverage injection point** is a **flag-gated early return** inside `useComplianceExecution` that returns a fully-constructed `ComplianceExecutionSnapshot` synthesized from `V3_CES_SeedData`. This makes **every** consumer (real routes + future harness "Live CES" previews) automatically rich-seeded with zero per-component changes.

---

## 2. Seeding Injection Architecture (Concrete Proposal)

**Name**: **CES Live Seed Injection (CLSI) v1** — "Flip one switch, entire live CES runs on V3 seed."

### Core Principles
1. **Single source override**: Only touch `useComplianceExecution` + one pure builder. Never mutate stores/engines for read views.
2. **Dev-only + explicit flag**: `import.meta.env.DEV && getFlag(...)`. Never leaks to prod.
3. **Full snapshot fidelity**: Seeded path must satisfy the exact `ComplianceExecutionSnapshot` contract (events + units + metrics + trends + roles) so selectors, drawers, enforcement (read paths), and all 15+ consumers work unchanged.
4. **Backward compatible + opt-in**: Default behavior unchanged. Seed path is additive.
5. **Harness empowerment**: Staging can flip the flag + render real components (or wrap them) to achieve "live + staging aligned" without maintaining parallel UIs.
6. **Extensible**: Seed data can evolve; builder is pure and testable.
7. **Safe mutations**: In seed mode, mutations via `regulatoryExecutionStore` / enforcement are no-ops or local-only (guarded by same flag + `isCesSandboxDate` spirit).

### 2.1 Layer 1 — Feature Flag (Extend Existing Pattern)
**File**: `src/policy/pm/featureFlags.ts`

Add to `PmFeatureFlag` union:
```ts
| 'ces_v3_seed_injection'   // When true (DEV only): useComplianceExecution returns V3-seeded snapshot instead of live regulatory+onboarding+store data. Powers designer previews, harness real-component tests, and demo scenarios.
```

Add to `DEFAULTS`:
```ts
ces_v3_seed_injection: false,   // Explicit opt-in; never auto-on
```

Update JSDoc with:
> `ces_v3_seed_injection` — Agent 04 CLSI. DEV-only. When ON, the entire live CES (board, My Tasks, dashboard, calendar, reports, drawers, workloads, evidence panels) renders using `V3_CES_SeedData` via a synthetic `ComplianceExecutionSnapshot`. Flip via `window.__pm.setFlag('ces_v3_seed_injection', true)` or staging toggle. Pairs with `VITE_CES_SEED_SPRINT=2026-10` (future).

Also expose on `window.__ces` (or augment `__pm`):
```ts
(window as any).__ces = {
  getFlag,
  setFlag,
  getAllFlags,
  toggleSeedInjection: () => setFlag('ces_v3_seed_injection', !getFlag('ces_v3_seed_injection')),
  getCurrentSnapshotSource: () => getFlag('ces_v3_seed_injection') ? 'V3_SEED' : 'LIVE',
};
```

**Benefits**: Consistent with PM flags, localStorage persistence across reloads, console-driven for designers, no new UI yet.

### 2.2 Layer 2 — Injection Point in the Hook
**File**: `src/policy/compliance-execution/complianceExecutionStore.ts`

At the very top of `useComplianceExecution` (before `const today = ...`):

```ts
import { getFlag } from '@/policy/pm/featureFlags';
import { buildV3SeededSnapshot } from './cesSeedSnapshot';  // new

export function useComplianceExecution(scope = DEFAULT...) {
  if (import.meta.env.DEV && getFlag('ces_v3_seed_injection')) {
    // Bypass all live sources (reg events, autogen, regulatory store, onboarding engine)
    // Snapshot is static + scope-aware for sprint filtering.
    return buildV3SeededSnapshot(scope);
  }

  const today = TODAY_ANCHOR;
  // ... existing real path unchanged
}
```

- The `useMemo` deps and subscriptions are skipped → zero performance cost in seed mode.
- `scope` (all / month / sprint) is honored by the builder (filters `V3_ExecutionUnitsSeed` by `sprintId` or date overlap using `V3_SprintContextSeed`).
- Memoization / stability: builder returns new object each time (acceptable for dev; or cache by scopeKey like live).

**Why here and not lower?**
- `useComplianceExecution` is documented as "the single React entry point".
- Avoids polluting journey/onboarding/reg stores (which have their own concerns).
- Enables future "hybrid" modes (seed units + live store state for evidence).

### 2.3 Layer 3 — Pure Seeded Snapshot Builder
**New file (recommended)**: `src/policy/compliance-execution/cesSeedSnapshot.ts` (or `src/policy/ces/data/cesV3SeedSnapshotBuilder.ts`)

Exports:
```ts
export function buildV3SeededSnapshot(
  scope: ComplianceExecutionScope = DEFAULT_COMPLIANCE_SCOPE
): ComplianceExecutionSnapshot {

  const sprintCtx = V3_SprintContextSeed;
  const activeSprintSeed = sprintCtx.activeSprint;  // adapt to live Sprint type (id, number, startDate, endDate, label)

  // 1. Units (source of truth from seed)
  let units = getActiveSprintExecutionUnits(); // or for requested scope
  if (scope.mode === 'sprint') {
    units = V3_ExecutionUnitsSeed.filter(u => u.sprintId === scope.window.id || isoDateInSprint(u.dueDate, scope.window));
  } else if (scope.mode === 'month') { ... }

  const executionUnits: MergedExecutionUnit[] = units.map(u => ({
    ...u,
    source: 'ces-seed' as const,
    // ensure all Merged fields; add synthetic regulatoryRef if parentEventId matches known
  }));

  // 2. Synthesize events (minimal but sufficient for grouping + selectors)
  const eventMap = new Map<string, MergedComplianceEvent>();
  for (const u of executionUnits) {
    if (!eventMap.has(u.parentEventId)) {
      eventMap.set(u.parentEventId, {
        id: u.parentEventId,
        title: u.title.split('—')[0].trim() || u.parentEventId, // or lookup in future V3_EventsSeed
        category: 'recurring',
        domain: u.domain,
        anchorDate: u.dueDate,
        source: 'ces-seed',
        // regulatoryRef?: undefined (or stub)
      });
    }
  }
  const events = Array.from(eventMap.values());

  // 3. Workflows (reuse or call computeWorkflows adapted)
  const workflows = computeWorkflowsFromUnits(executionUnits); // extract pure fn

  // 4. Metrics, risks, assignments, trends — reuse existing pure compute* fns
  //    (refactor compute* out of the store file into shared utils if not already)
  const sprintMetrics = computeSprintMetricsFromUnits(executionUnits, /*today*/);
  const domainRisks = computeDomainRisks(executionUnits);
  // ... similarly for ownerAssignments, sprintTrends, auditEvaluations (stub map)

  // 5. Sprint windows (prefer V3 seed context for fidelity; fall back to live builder)
  const activeSprint = { ...activeSprintSeed, label: sprintCtx.activeSprintLabel };
  const sprintHistory = [sprintCtx.previousSprint, activeSprintSeed, sprintCtx.nextSprint].map(...);

  return {
    activeSprint,
    sprintHistory,
    today: new Date(activeSprintSeed.startDate), // or fixed 2026-05-21
    events,
    executionUnits,
    workflows,
    auditEvaluations: new Map(),
    sprintMetrics,
    sprintTrends: computeSprintTrends(sprintMetrics, sprintHistory),
    domainRisks,
    ownerAssignments: computeOwnerAssignments(executionUnits),
    onboardingBatches: [],
    gateEvaluations: [],
  };
}
```

**Refactoring note**: Move the 4 `compute*` helpers (currently private in store) to `complianceExecutionSelectors.ts` or a new `snapshotUtils.ts` so both live and seed paths share logic. This is a high-value side benefit.

**Add to seed data (optional but recommended for completeness)**:
- Export `V3_EventsSeed: MergedComplianceEvent[]` (or minimal event metadata keyed by `parentEventId`).
- `V3_FullSeedSnapshot: ComplianceExecutionSnapshot` prebuilt constant for the active sprint (fast path, no runtime build).

### 2.4 Layer 4 — Harness & Real Component Enablement
**In `src/ui-staging/V3StagingApp.tsx`** (and V3_2 / UIStagingV32Page):

- Import `setFlag`, `getFlag` from featureFlags.
- Bind the existing `useV3Seeds` toggle (or new "Live CES Seed" switch) to also call:
  ```ts
  setFlag('ces_v3_seed_injection', nextValue);
  ```
- Add new nav / preview section:
  - "Live CES Components (Seeded)" 
  - When flag ON: render real `<CesLayout><SprintExecutionBoard /></CesLayout>`, `<CesExecutiveDashboard />`, `<MyTasksPage />` (wrapped in minimal providers: `PmViewSprintStore` initialized to V3 sprint, etc.).
  - This gives pixel-perfect, interaction-ready previews of the *actual* production components on the rich seed (including real `ExecutionUnitCard`, `WorkflowDrawer`, enforcement read paths, role badges, etc.).
- Provide a floating "Seed Status" badge: `Source: V3_SEED | LIVE` + button to toggle.

**For non-staging dev**:
- Designers open any real CES route (`/ces/board`, dashboard, `/my-tasks`, etc.) and run in console:
  ```js
  __pm.setFlag('ces_v3_seed_injection', true); location.reload();
  ```
- Or add a hidden dev toolbar (behind another flag) that exposes the toggle.

**My Tasks / Drawers / Enforcement**:
- `useObligations` → `useComplianceExecution` → seeded automatically.
- Selected task drawers (GlobalTaskDrawer, WorkflowDrawer) read from units + selectedTaskStore. Seed units already have rich fields → full fidelity.
- Read-only views (badges, lists, filters by state/role) work immediately. Write paths can be guarded:
  ```ts
  if (getFlag('ces_v3_seed_injection')) { toast('Seeded preview — mutations disabled'); return; }
  ```

### 2.5 Layer 5 — Future Enhancements (Phased)
- **Phase 2**: `VITE_CES_SEED_SPRINT` env + dynamic sprint selection in seed builder.
- **Phase 3**: Optional seed-driven `regulatoryExecutionStore` patcher (for interactive evidence upload simulation in harness).
- **Phase 4**: Snapshot diffing / golden-file tests: `buildV3SeededSnapshot() === expected`.
- **Context override alternative** (if flag feels global): A `CesDataProvider` that accepts `snapshotOverride` prop, consumed by a thin `useComplianceExecution` wrapper. Flag path remains the global "easy switch".
- Synchronize V3 sprint dates exactly with live `sprintWindowsForYear(2026)` + `buildSprintWindow` (or document the intentional demo divergence).

---

## 3. Files Changed / Created (Minimal Surface)

**Core (required for injection)**:
- `src/policy/pm/featureFlags.ts` — add flag + window.__ces
- `src/policy/compliance-execution/complianceExecutionStore.ts` — import + early return guard (3–5 lines)
- `src/policy/compliance-execution/cesSeedSnapshot.ts` (new) — builder + any extracted utils
- `src/policy/compliance-execution/index.ts` — re-export builder if public

**Seed fidelity (recommended)**:
- `src/policy/ces/data/V3_CES_SeedData.ts` — add `V3_EventsSeed`, `V3_SeededSnapshotForActiveSprint`, export more helpers, `satisfies` assertions

**Harness**:
- `src/ui-staging/V3StagingApp.tsx` (and siblings) — wire toggle, add Live Component previews, import real pages when seeded
- Optional: small wrapper providers for sprint store in previews

**Docs / alignment**:
- Update `CES_Evidence_and_Tasks_Right_Panel_V3_*.md` + any seeding blueprints
- Add comment in `complianceExecutionStore.ts` header referencing this architecture + Agent 04 report

**No changes** to:
- Individual CES pages/components (they just work)
- Onboarding engine / regulatory store (bypassed cleanly)
- Types (already aligned)

---

## 4. Example Usage (Designer / Developer Workflow)

1. Start dev server.
2. Navigate to `/ui-staging` (or `/ces/board` for direct).
3. Console:
   ```js
   __pm.setFlag('ces_v3_seed_injection', true)
   // or
   __ces.toggleSeedInjection()
   ```
4. Hard refresh (or React will pick up via external store).
5. **Result**: Board shows the 4–5 rich seeded units from V3 (governance packet awaiting sig, QAPI, IPC, EP after-action, prior HR audit). All columns, swimlanes (when events synthesized), metrics, owner assignments, ACHC readiness numbers, My Tasks filters, drawers with real signer lists / evidence bars — all driven by seed.
6. Toggle off → instant revert to live regulatory + onboarding data.
7. In staging harness: flip "Use V3 Seeds + Live Components" → real `SprintExecutionBoard` appears inside the V3 glass shell, fully interactive on seed data.

---

## 5. Risks, Mitigations & Edge Cases

| Risk | Mitigation |
|------|------------|
| Sprint model mismatch (V3 12-day vs PM 14-day, Mon vs Sun) | Builder normalizes to live `Sprint` shape; use seed `sprintId` for filtering; document in builder header. Future: unify sprint windows. |
| Missing events for swimlane grouping | Synthesize from `parentEventId` + title prefix; add `V3_EventsSeed` in next seed iteration. Board still renders (flat columns degrade gracefully). |
| Mutations / store writes in seed mode | Guard at enforcement + store action level with `if (getFlag('ces...')) return;` + user toast. Or treat as ephemeral sandbox. |
| Scope / sprintWindow from `usePmViewSprintStore` | Builder respects passed `scope`; staging previews should seed the PM sprint store to a V3-compatible window. |
| Performance / reactivity | Seed path is pure + cheap (no store subscriptions). |
| Prod leak | Hard `import.meta.env.DEV` guard + default `false`. Lint rule optional. |
| Stale seed vs evolving live model | Add runtime `satisfies` + unit test that seed units conform to `ExecutionUnit`. |
| Drawer / selectedTaskStore expectations | Seed units already rich; drawers read from passed unit + global selected store (populated on click). |

---

## 6. Testing & Validation Plan

- Unit test `buildV3SeededSnapshot()` → matches `ComplianceExecutionSnapshot` shape + contains expected unit ids.
- Manual: toggle on → verify `/ces/board`, `/ces/dashboard`, `/my-tasks`, calendar, reports all show seed content + correct counts.
- Harness: "Live CES (Seeded)" tab renders real components without crash; interactions (expand drawer, filter) work.
- Regression: toggle off → exact previous behavior (no behavior change).
- Cross-agent: After implementation, re-run Agent 01/02/03 checks — toy mappers become legacy-only; real components become the seeded truth.

---

## 7. Alignment with Overall Seeding-Live-Staging Epic

This architecture directly implements the "Next Steps" and "Recommendation" calls from Agents 01–03:
- Single hook injection (Agent 03)
- Eliminates shadow duplication (Agent 02)
- Exposes simulated snapshot + enables real components on seed (Agent 01)
- Preserves canonical model (no toy drift)

Once landed, designers can:
- Validate full role-based, provenance-aware, sprint-scoped CES surfaces on the exact high-fidelity data generated by the 30-agent V3 blueprint.
- Iterate seed data → instant visual + behavioral feedback in both isolated previews and the real app.

**Recommended immediate next action**: Implement Layers 1–3 (flag + guard + minimal builder that returns units + synthesized events + computed metrics). This unblocks all downstream real-component usage in the harness.

---

**End of Agent 04 Report**

**Key artifacts referenced** (absolute paths):
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\compliance-execution\complianceExecutionStore.ts`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\data\V3_CES_SeedData.ts`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pm\featureFlags.ts`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\V3StagingApp.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\board\SprintExecutionBoard.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\layouts\CesLayout.tsx`
- Prior agents: `Agent_01_Data_Model_Alignment.md`, `Agent_02_Grouping_Logic_Parity.md`, `Agent_03_CES_Board_Parity.md` (same directory)

The proposed CLSI architecture is minimal, safe, aligned with existing patterns, and delivers the "flip a switch — entire live CES on rich seed" capability requested.