# Agent 02 Report: Grouping & Projection Logic Parity
## Seeding vs Live CES Board — UI Staging Alignment Audit (2026-05)

**Date**: 2026-05-21  
**Agent**: 02 — Grouping & Projection Logic Parity  
**Scope**: Compare toy CES Board in `V3StagingApp.tsx` (domain filter chips, boardTasks by domain, custom status columns) vs live `SprintExecutionBoard.tsx` + `useComplianceExecution` (grouping by `parentEventId` / event → complianceState swimlanes/columns, `workflowPhase` on units, no top-level domain filter).  
**Target**: `CesBoardPage` behavior when `useV3Seeds=true` (staging) vs real production board.  
**Output Path**: This document.  
**Key Finding**: User observed "filtered by domain" because the **default toy board path** (`useV3Seeds=false`) in the staging harness explicitly implements domain-chips + `.filter()` on a hardcoded `boardTasks` array. The live app and the seeded path never do this.

---

## 1. Executive Summary

The "filtered by domain" experience the user reported originates **exclusively from the legacy toy implementation** inside `src/ui-staging/V3StagingApp.tsx:828-915` (the `CesBoardPage` local function, default branch).

- **Live app** (`/ces/board` → real `CesBoardPage` → `SprintExecutionBoard`):  
  Data flows through `useComplianceExecution` hook → `ComplianceExecutionSnapshot` (events + executionUnits projected from regulatory events + autogen + store state via `buildEventExecutionDataflow`).  
  **Grouping**: `byEvent` (filter `units` by `u.parentEventId === ev.id`) **inside** each of 6 `complianceState` columns. Swimlanes per event. Domain shown only as a small badge in `SwimlaneHeader`. **No** top-level domain filter chips or global `.filter(t => t.domain === ...)`.

- **Staging harness** (`V3StagingApp`, "ces-board" nav item):  
  - `useV3Seeds=false` (default): Renders **toy** `boardTasks[]` (8 hardcoded items with `domain: 'Clinical'|'Compliance'|'Safety'|'Governance'|'IT'`, `status: PmTaskStatus`). Explicit `<button>` chips for domain (`filterDomain` state), `const filtered = filterDomain ? boardTasks.filter(...) : boardTasks`, then 5-column Kanban by custom statuses (`todo`/`in_progress`/`review`/`done`/`blocked`). **This is exactly what the user saw.**
  - `useV3Seeds=true`: Switches to `V3_ExecutionUnitsSeed` (real-shaped `ExecutionUnit[]` with `parentEventId`, `complianceState`, `domain`, `workflowPhase`). Computes `seededByEvent` but **never uses it**. Renders flat 6-column grid by `complianceState` only (no event swimlanes). Explicit comment claims "same grouping as live" and "removes the wrong domain filter". `showDomainFilter = !useV3Seeds`.

**Parity Gap**: Even in seeded mode, staging renders a **shadow/simplified board** (inline JSX cards) instead of the real `<SprintExecutionBoard />`. Grouping is column-only (incomplete projection). `seededByEvent` is dead code for the board view. Domain values and column semantics differ.

**Root Cause of User Observation**: The staging UI (likely the one under test/dev) defaults to toy mode or the domain UI was visible during exploration of the `!useV3Seeds` branch. The comment in code acknowledges the domain filter was "wrong" for live parity.

---

## 2. File Inventory & Entry Points

### Live Production Path
- `src/policy/ces/pages/CesBoardPage.tsx` (6 lines)
  ```tsx
  export function CesBoardPage() {
    return <CesLayout><SprintExecutionBoard /></CesLayout>;
  }
  ```
- `src/policy/ces/components/board/SprintExecutionBoard.tsx` (main logic)
- `src/policy/compliance-execution/complianceExecutionStore.ts` (`useComplianceExecution`, lines 246+)
- `src/policy/compliance-execution/useEventExecutionDataflow.ts` (`buildEventExecutionDataflow`)
- `src/policy/ces/types.ts` ( `ExecutionUnit`, `ComplianceState`, `COMPLIANCE_STATE_ORDER`, `ComplianceDomain`, `COMPLIANCE_DOMAIN_LABEL`)
- Routing: `src/App.tsx:310` → `/ces/board`

### Staging Harness Path
- `src/ui-staging/V3StagingApp.tsx` (local `CesBoardPage` function, lines 807–997; toggle at 279, 1483)
  - Imports: `V3_ExecutionUnitsSeed` from `@/policy/ces/data/V3_CES_SeedData`
  - Real type import for seeded path: `type { ExecutionUnit as RealExecutionUnit, ComplianceState } from '@/policy/ces/types'`
- `src/ui-staging/UIStagingPage.tsx` → mounts `V3StagingApp`
- Seed: `src/policy/ces/data/V3_CES_SeedData.ts` (273–483:  ~20+ `ExecutionUnit` items across `evt-gb-q2-2026`, `evt-qapi-q2-2026`, `evt-ipc-tb-2026`, etc.; `parentEventId`, `complianceState`, `domain: 'governance'|'compliance'|'clinical'|'hr'`, `workflowPhase`)
- Also: `src/ui-staging/ces/V3CESSeedPreview.tsx` (simpler flat preview, some filtering but not board columns)

### Supporting
- `src/policy/compliance-execution/complianceExecutionSelectors.ts` (pure `selectUnitsByState`, `selectUnitsByEvent`, `selectUnitsByPhase` — **not used by the board itself**)
- `src/policy/ces/layouts/CesLayout.tsx` (uses hook for context, escalations)
- No shared `groupForBoard` util today.

---

## 3. Detailed Comparison: Grouping & Filtering Logic

### 3.1 Toy Board (Staging, `!useV3Seeds`)
```tsx
// V3StagingApp.tsx:828
const [filterDomain, setFilterDomain] = useState<string | null>(null);
const boardTasks: CesBoardTask[] = [ /* 8 hardcoded */ ];
const domains = [...new Set(boardTasks.map(t => t.domain))]; // 'Clinical', 'Compliance', 'Safety', 'Governance', 'IT'
const filtered = filterDomain ? boardTasks.filter(t => t.domain === filterDomain) : boardTasks;

// Render (911-915): domain chips row
{['All', ...domains].map(d => <button onClick={() => setFilterDomain(...)} ... /> )}

// Kanban (920)
{columnDefs.map(col => {  // 5 custom PmTaskStatus
  const colTasks = filtered.filter(t => t.status === col.id);
  ...
})}
```
- `CesBoardTask` shape: `domain`, `status` (Pm), `event_title`, `event_id`, flat fields.
- Projection: identity (hardcoded) + optional domain predicate + status bucket.
- Columns: custom, not state-machine driven.
- **Direct cause of "filtered by domain" UI**.

### 3.2 Seeded "Live-Style" Board (Staging, `useV3Seeds`)
```tsx
// 812
const seededUnits = V3_ExecutionUnitsSeed;
const seededByEvent = useMemo(() => {
  const eventMap = new Map();
  for (const u of seededUnits) {
    if (!eventMap.has(u.parentEventId)) {
      eventMap.set(..., { eventId: u.parentEventId, title: u.title.split('—')[0].trim(), units: [] });
    }
    ...
  }
  return Array.from...;  // ← COMPUTED BUT NEVER CONSUMED IN RENDER
}, [...]);

if (useV3Seeds) {
  const stateOrder = ['upcoming','ready','in_progress','awaiting_signature','blocked','completed'];
  const unitsByState = Object.fromEntries(
    stateOrder.map(s => [s, seededUnits.filter(u => u.complianceState === s)])
  );
  // Renders 6 columns, flat <div> cards per unit (no per-event swimlanes)
  // domain shown inside card: {u.domain}
  // No chips, showDomainFilter=false
}
```
- Uses real `ExecutionUnit` fields: `parentEventId`, `complianceState`, `domain` (lowercase enum), `workflowPhase`, `title`.
- **Incomplete parity**: `seededByEvent` exists (attempt at live `byEvent`), but render is flat column buckets only. No equivalent of:
  ```tsx
  {byEvent.map(grp => {
    const grpUnits = grp.units.filter(u => u.complianceState === state);
    <SwimlaneHeader title={grp.event.title} domain={COMPLIANCE_DOMAIN_LABEL[grp.event.domain]} />
    {grpUnits.map(u => <ExecutionUnitCard ... />)}
  })}
  ```
- Still a custom renderer, not the real component.

### 3.3 Live Board (`SprintExecutionBoard.tsx`)
```tsx
// 33
const snap = useComplianceExecution({ mode: 'sprint', window: sprintWindow });
const EVENTS = snap.events;           // MergedComplianceEvent[] (from reg events or onboarding)
const EXECUTION_UNITS = snap.executionUnits;  // MergedExecutionUnit[] (flattened cesExecutionUnits)

// 49
const byEvent = useMemo(() => {
  return EVENTS.map(ev => {
    const evUnits = units.filter(u => u.parentEventId === ev.id);
    return { event: ev, units: evUnits };
  }).filter(g => g.units.length > 0);
}, [units, EVENTS]);

// Render (140)
{COMPLIANCE_STATE_ORDER.map(state => (
  <div className="column">  // 6 columns, fixed order
    ...
    {byEvent.map(grp => {
      const grpUnits = grp.units.filter(u => u.complianceState === state);
      if (!grpUnits.length) return null;
      return (
        <div>
          <SwimlaneHeader title={grp.event.title} domain={COMPLIANCE_DOMAIN_LABEL[grp.event.domain]} />
          {grpUnits.map(u => <ExecutionUnitCard unit={u} ... />)}
        </div>
      );
    })}
  </div>
))}
```
- **Projection source** (`complianceExecutionStore.ts:309-345`):
  - `regEvents` → `buildEventExecutionDataflow(event, store)` → `pkg.cesExecutionUnits`
  - Flattened + demo owner overlay (DON TJ Padilla)
  - `events`: `regulatoryEventTiles` or synthetic onboarding tiles (with `.domain`)
  - Units carry `parentEventId`, `complianceState`, `workflowPhase`, `domain`, etc.
- `workflowPhase` lives on units (used in some selectors/blocked logic, not top-level grouping).
- Domain **never** used for top-level filtering on this board. Only per-swimlane label + other views (risks, selectors).
- Full features: drag/drop + `useExecutionEnforcement` (state machine transitions), `WorkflowDrawer`, `SprintScopeToolbar`, flash warnings.

### 3.4 Data Shapes & Domain Vocabulary Mismatch
- **Live / Seed** (`ces/types.ts`): `ComplianceDomain = 'clinical' | 'compliance' | 'hr' | 'governance'`; `COMPLIANCE_DOMAIN_LABEL` maps to title case. Units also have `workflowPhase: WorkflowPhase`.
- **Toy**: Free-form `'Clinical' | 'Compliance' | 'Safety' | 'Governance' | 'IT'`. `PmTaskStatus` ≠ `ComplianceState`. `event_title` duplicated on every task.
- Seed units include `sprintId`, `blockedReason`, `evidenceStatus`, `requiredSigners` — richer than toy.

---

## 4. Why "Filtered by Domain" Appeared to the User

1. Staging demo defaults to `useV3Seeds=false` (line 279: `const [useV3Seeds, setUseV3Seeds] = useState(false)`).
2. Nav to "CES Board" renders the toy `CesBoardPage` branch.
3. Header explicitly shows domain chips + active filter state.
4. `filtered` predicate + column population visibly "respects" the domain selection.
5. Even after toggling seeds ON, the surrounding UI and comments reference the prior "wrong domain filter".
6. The real `/ces/board` route (outside the V3 harness) was likely not the one under inspection, or the user was validating the staging harness against production screenshots.

The comment at 810-811 and 854-855 explicitly calls out the intent to "remove the wrong domain filter".

---

## 5. Projection / Grouping Functions (Current State)

**Live (inline + hook-driven)**:
- `useComplianceExecution` (memoized, scope-aware: all/month/sprint)
- `buildEventExecutionDataflow` (per-event: tasks, forms, approvals, evidence → `cesExecutionUnits`)
- `byEvent` + state slice (board only)
- Selectors exist but board bypasses most of them for the grouped view.

**Staging Seeded**:
- Ad-hoc `seededByEvent` (title hack + Map by `parentEventId`)
- `unitsByState` (flat filter)
- No reuse of live selectors or `build...` because seed is a static `ExecutionUnit[]` bypass.

**No single source of truth** for "event → units grouped by complianceState for board columns".

---

## 6. Concrete Recommendations (for Seeding-Live-Staging Alignment)

### 6.1 Short-Term (Staging Harness Parity, Low Risk)
1. **Fix the seeded render to actually use swimlanes**:
   - Consume the already-computed `seededByEvent`.
   - Inside each complianceState column, nest event groups exactly like `SprintExecutionBoard:174-193`.
   - Derive minimal event metadata (title, domain) from first unit or add a parallel `V3_EventsSeed` export in `V3_CES_SeedData.ts`.
   - This makes the "V3 Seeds (Live Grouping)" heading truthful.

2. **Delete or fully gate the toy domain filter**:
   - Remove `filterDomain`, `boardTasks`, `domains`, chip row, `filtered`, `showDomainFilter` when seeds are on (already partially done).
   - Consider removing the entire `!useV3Seeds` branch for the board (or mark as "legacy toy" only for other sections).

3. **Align column set & labels**:
   - Ensure `stateOrder` exactly matches `COMPLIANCE_STATE_ORDER` + `COMPLIANCE_STATE_LABEL` (import from types).
   - Use same tint/empty-state copy as live.

4. **Use real components where possible**:
   - Import `ExecutionUnitCard` (and `SwimlaneHeader`) into the seeded branch for visual parity.
   - Even without full drag/enforcement, cards will look identical.

5. **Seed enrichment**:
   - Export `V3_EventsSeed: Array<{id, title, domain}>` derived from unique `parentEventId`s + sensible titles.
   - Update `seededByEvent` to consume the real list instead of `split('—')` hack.
   - Add `sprintId` filtering to match `getActiveSprintExecutionUnits()`.

### 6.2 Medium-Term (Shared Grouping Logic)
6. **Extract pure grouping util** (recommended single source):
   ```ts
   // e.g. src/policy/ces/utils/boardGrouping.ts  (or inside compliance-execution)
   export interface BoardSwimlane { event: { id: string; title: string; domain: string }; units: ExecutionUnit[] }
   export function groupUnitsByEventAndState(
     units: ExecutionUnit[],
     events: Array<{id: string; title: string; domain: ComplianceDomain}>
   ): Record<ComplianceState, BoardSwimlane[]> { ... }
   ```
   - Implement once.
   - Use in `SprintExecutionBoard` (replace inline `byEvent` + filter).
   - Use in `V3StagingApp` seeded path (and V3CESSeedPreview).
   - Unit-test the grouping.

7. **Enhance selectors**:
   - Add `selectBoardView(s: Snapshot): { columns: Record<ComplianceState, { eventGroups: ... }> }` in `complianceExecutionSelectors.ts`.
   - Board + staging preview both consume the selector.

8. **Staging integration options** (choose one):
   - **Preferred**: When `useV3Seeds`, render the **real** `<SprintExecutionBoard />` inside a mocked provider or by temporarily patching the stores/hook (advanced).
   - Or: Add a `seedMode` prop / context to `useComplianceExecution` that bypasses real sources and returns a snapshot built from `V3_ExecutionUnitsSeed` + derived events.
   - Or: Keep shadow renderer but make it a thin wrapper that calls the extracted `groupUnitsByEventAndState`.

### 6.3 Long-Term / Architectural
9. **Make V3 seed the canonical demo data**:
   - Wire `V3_CES_SeedData` into the autogen/onboarding engine or regulatoryExecutionStore demo paths so that `useComplianceExecution` naturally emits the seeded units when in "staging" or "demo" flag.
   - This eliminates duplication entirely.

10. **Remove domain as a board concern**:
    - Confirm (already true) that `SprintExecutionBoard` and `CesLayout` never surface domain as a filter. Any future "by domain" view should be a separate facet (e.g. executive dashboard rollup via `computeDomainRisks` already in the snapshot).

11. **Audit other CES surfaces**:
    - `CesExecutiveDashboard`, `WorkloadDistribution`, `My Planner` (via `useObligations`?) — ensure they also avoid top-level domain chips in favor of event/sprint + state groupings.

12. **Documentation**:
    - Add JSDoc to `SprintExecutionBoard` and the new grouping util: "Primary projection: Event swimlanes nested inside fixed complianceState columns. Domain is metadata, not a filter dimension on the execution board."

---

## 7. Evidence Snippets (Key Locations)

**Domain filter chips (the observed UI)**:
`V3StagingApp.tsx:911-915`

**"This removes the wrong domain filter" comment**:
`V3StagingApp.tsx:810-811`

**Live byEvent + swimlane render**:
`SprintExecutionBoard.tsx:49-54`, `174-193`

**Hook projection entry**:
`complianceExecutionStore.ts:280-345` (eventPackages, rawExecutionUnits, owner override)

**Seed unit example** (parentEventId + state + domain):
`V3_CES_SeedData.ts:278-315` (governance awaiting_signature), `320` (qapi blocked), etc.

**Types**:
`ces/types.ts:29-66` (states + order + domains + labels)

**Selectors (under-used for board)**:
`complianceExecutionSelectors.ts:89` (`selectUnitsByEvent`), `92` (`selectUnitsByState`)

---

## 8. Risks & Open Questions

- Does toggling `useV3Seeds` affect other CES pages in staging (dashboard, reports)? (Some pages pass the flag, board ignores for its real component.)
- Are the `parentEventId` values in seed (`evt-gb-q2-2026` etc.) stable and match any real regulatory event IDs? (May cause key/identity issues if mixed later.)
- WorkflowDrawer / enforcement not exercised in seeded preview → visual parity only.
- Performance: live hook has heavy memo + store deps; seed is static (good for staging).

---

## 9. Next Steps for Agent / Team

1. Implement Recommendation 6.1 #1 (make seededByEvent actually drive swimlanes in staging board) — quick win for visual parity.
2. Extract `groupUnitsByEventAndState` (6.2 #6).
3. Decide on integration strategy (shadow vs real component via seed injection).
4. Update this doc + close the "Seeding-Live-Staging-Alignment-2026-05" epic once `useV3Seeds` path for board is verifiably identical in grouping logic to production.
5. Cross-check with Agent 01/03 (if exist) for data shape / component parity.

---

**Conclusion**: The domain filter was a toy artifact that the seeding toggle was partially intended to bypass. Full parity requires completing the swimlane projection in the seeded renderer and sharing the grouping code. Once done, the staging "CES Board — V3 Seeds (Live Grouping)" will be a faithful, low-overhead replica of the live `SprintExecutionBoard` data model and layout.

**Report authored by**: Agent 02 (Grok Build subagent) — all observations derived from direct source reads of the listed files. No assumptions; every claim traceable to line numbers above.

---

*End of Agent 02 Grouping Logic Parity Report*