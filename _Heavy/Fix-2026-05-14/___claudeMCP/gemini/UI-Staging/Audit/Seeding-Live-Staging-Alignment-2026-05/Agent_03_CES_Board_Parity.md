# Agent 03 — CES Board Component Parity & Rendering Audit
**CES Board Parity & Rendering — Seeding-Live-Staging-Alignment**

**Agent**: Agent 03 - CES Board Component Parity & Rendering  
**Date**: 2026-05-21  
**Mission**: Compare the entire toy `CesBoardPage` implementation (columns, cards, selection, veil drawers, drag logic) in `V3StagingApp.tsx` against the real production `SprintExecutionBoard.tsx` + `ExecutionUnitCard.tsx` + `WorkflowDrawer.tsx`. When seeds are enabled, the preview must feel like the real board. Identify all structural, interaction, and data-binding differences that would be roadblocks for designers testing with realistic seeded data. Report on what needs to be copied or refactored so staging CES Board can optionally render using (or closely mimic) the live components + seeded data.

**Output Location**: `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/UI-Staging/Audit/Seeding-Live-Staging-Alignment-2026-05/Agent_03_CES_Board_Parity.md`

**Key Files Audited** (absolute paths):
- Toy staging: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\V3StagingApp.tsx` (CesBoardPage function, lines ~807–997)
- Real board: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\board\SprintExecutionBoard.tsx`
- Real card: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\board\ExecutionUnitCard.tsx`
- Real drawer: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\details\WorkflowDrawer.tsx`
- Real types: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\types.ts`
- Seed data: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\data\V3_CES_SeedData.ts` (V3_ExecutionUnitsSeed: ExecutionUnit[])
- Real primitives: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\primitives.tsx`
- Real hooks: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\hooks\useExecutionEnforcement.ts`
- Real layout: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\layouts\CesLayout.tsx`
- Real dataflow: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\compliance-execution\complianceExecutionStore.ts` (useComplianceExecution, MergedExecutionUnit)
- Staging CES preview (toy card): `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\ces\V3CESSeedPreview.tsx`
- CES theme: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\theme.ts` + `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\v3Tokens.ts`
- Real CesBoardPage wrapper: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\pages\CesBoardPage.tsx`
- Staging V3 tokens/CSS: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\ui-staging.css`, `v3Tokens.ts`

**Companion Context**: Builds on prior audits (e.g., CES_Kanban_Board_Gap_Analysis.md in CES-PageView-Coverage-Audit-2026-05-20/). Production board is functional + enforcement-aware but uses CES navy sub-brand (not V3 Veil Glass). Staging toy is the only place designers currently toggle `useV3Seeds` for "realistic" preview.

---

## 1. Executive Summary

**Verdict**: The seeded path (`useV3Seeds === true`) in `CesBoardPage` is a **non-functional placeholder** that fails to deliver realistic board fidelity. It renders 6 columns of ultra-minimal inline `<div>` cards using only a tiny subset of `ExecutionUnit` fields from `V3_ExecutionUnitsSeed`. 

- **Zero reuse** of live components (`SprintExecutionBoard`, `ExecutionUnitCard`, `WorkflowDrawer`, primitives).
- **Missing critical interactions**: No drag/drop, no enforcement, no swimlanes, no click-to-drawer, no state mutations via actions.
- **Data underutilized**: Rich seed (events via parentEventId, workflowPhase, auditReadiness, requiredSigners[], evidenceStatus, blockedReason, escalationTimer, domain, obligationKind, etc.) is almost entirely ignored.
- **Styling mismatch**: Hardcoded V3 glass tokens vs. production `useCesTokens()` (navy CES sub-brand) + `v3-*` classes.
- **Roadblock for designers**: With seeds ON, the "CES Board" tab looks nothing like production and provides no way to exercise realistic seeded data for visual/interaction testing (e.g., blocked cards, awaiting_signature signers, escalation timers, full WorkflowDrawer evidence/signature/action panels, drag snap-backs).

**Impact**: Designers cannot validate V3 Veil Glass treatment on *real* CES board surfaces with seeded data. The `if (useV3Seeds)` branch (lines 858–893) is effectively dead code for parity testing.

**Primary Recommendation**: Refactor `CesBoardPage` (and/or introduce `StagingCESBoard.tsx` in `src/ui-staging/ces/`) to **optionally mount the live components** (or a thin V3-styled wrapper) when seeds enabled, wiring the static `V3_ExecutionUnitsSeed` as the data source and providing minimal mock stores/hooks for demo isolation. Alternatively, extract a presentational `CESBoardRenderer` that both prod and staging consume.

---

## 2. Column Structure & State Model Differences

### Production (`SprintExecutionBoard.tsx`)
- **Exactly 6 columns**, driven by canonical `COMPLIANCE_STATE_ORDER` from `types.ts`:
  ```ts
  ['upcoming', 'ready', 'in_progress', 'awaiting_signature', 'blocked', 'completed']
  ```
- Labels via `COMPLIANCE_STATE_LABEL` (e.g., "Awaiting Signature", "In Progress").
- Column tints via `columnTint` memo (navySoft for ready/in_progress, orangeSoft for awaiting, redSoft for blocked, greenSoft for completed, etc.).
- Horizontal scroll grid: `gridTemplateColumns: 'repeat(6, minmax(280px, 1fr))'`, minWidth 1700px.
- Per-column count badges, dynamic background on `overCol` drag hover.
- Header bar shows open/closed counts from live `units` state.

**Code snippet (prod columns)**:
```tsx
// SprintExecutionBoard.tsx:140
{COMPLIANCE_STATE_ORDER.map(state => {
  const tint = columnTint[state];
  const colUnits = units.filter(u => u.complianceState === state);
  return <div key={state} onDragOver=... onDrop=... style={{background: isOver ? t.navySoft : tint.bg, ...}}>
    <div className="px-3 py-2.5 ...">{COMPLIANCE_STATE_LABEL[state]} <span>{colUnits.length}</span></div>
    ...
  </div>
})}
```

### Staging Toy (`V3StagingApp.tsx` CesBoardPage)
- **Non-seed mode** (`!useV3Seeds`): **5 columns** using legacy `PmTaskStatus`:
  ```ts
  ['todo', 'in_progress', 'review', 'done', 'blocked']
  ```
  Labels: "To Do", "In Progress", "In Review", "Done", "Blocked". Different semantics (no "upcoming"/"ready"/"awaiting_signature").
- **Seed mode** (`useV3Seeds`): Hardcodes 6 states but **renders toy flat divs**:
  ```tsx
  // V3StagingApp.tsx:859
  const stateOrder: ComplianceState[] = ['upcoming', 'ready', 'in_progress', 'awaiting_signature', 'blocked', 'completed']
  const unitsByState = Object.fromEntries(stateOrder.map(s => [s, seededUnits.filter(u => u.complianceState === s)]))
  // Then inline style grid + minimal cards (no real component)
  ```
- No tints, no dynamic hover, no open/closed summary, no `SprintScopeToolbar`.
- Grid uses plain `repeat(6, 1fr)` with V3.glass3 backgrounds.
- Domain filter present only in non-seed (old toy data).

**Roadblock**: State model mismatch means seeded data (with real `complianceState` values) only "works" in the hardcoded seed branch, but the visual treatment and column headers are toy. Designers see different column vocabulary/labels than production.

---

## 3. Swimlane / Event Grouping Differences

### Production
- **True swimlanes**: Groups by `EVENTS` (from `snap.events` via `useComplianceExecution`):
  ```tsx
  // SprintExecutionBoard.tsx:49
  const byEvent = useMemo(() => EVENTS.map(ev => ({
    event: ev,
    units: units.filter(u => u.parentEventId === ev.id)
  })).filter(g => g.units.length > 0), [units, EVENTS])
  ```
- Inside each column: For each grp, render `<SwimlaneHeader title={grp.event.title} domain={COMPLIANCE_DOMAIN_LABEL[...]} />` then the units for that event+state.
- Real event titles + domain pills (e.g., "Governance").

### Staging Seed Mode
- **Computes but discards** `seededByEvent`:
  ```tsx
  // V3StagingApp.tsx:815
  const seededByEvent = useMemo(() => {
    ... crude eventMap using u.title.split('—')[0].trim() ...
  }, ...)
  // NEVER USED in the if(useV3Seeds) return block!
  ```
- Renders **flat per-state** lists. No `<SwimlaneHeader>`, no event grouping visible. Seed data's `parentEventId` (e.g., 'evt-gb-q2-2026') and rich events from `V3_CES_SeedData` are wasted.
- Non-seed: Cards show `event_title` inline but no visual swimlanes.

**Roadblock**: Seeded data is heavily event-oriented (Governing Body packet, QAPI, Fire Drill, etc.). Without swimlanes, designers cannot evaluate grouping, density, or "Event → Workflow → Execution Unit" hierarchy that production advertises ("Event → Workflow → Execution Unit. Drag enforces...").

---

## 4. Card Rendering (ExecutionUnitCard Parity)

### Production `ExecutionUnitCard.tsx`
- Full-featured, reusable:
  - `draggable`, `onClick`, `onDragStart`/`onDragEnd` props.
  - Top accent bar color by state (red for blocked, orange awaiting, green completed, navy else).
  - `<PhaseIndicator phase={unit.workflowPhase} />`
  - `<ComplianceStateBadge state=... compact />`
  - `<AuditReadinessTag readiness={unit.auditReadiness} />`
  - Blocked reason banner (explicit icon + `unit.blockedReason.label`)
  - For awaiting_signature: UserAvatar[] for `requiredSigners`, signature count, `<EscalationTimer hours={...} />`
  - Completed: evidence complete message
  - Optional `auditReadinessScore`
  - Footer: UserAvatar + owner name + due date (Calendar icon, short fmt)
- Uses `useCesTokens()`, data-testid, data-* attrs for testing.
- Rich hover, borderTop accent, shadow.

**Relevant snippet**:
```tsx
// ExecutionUnitCard.tsx:66
<div className="flex flex-wrap gap-1.5 items-center">
  <PhaseIndicator phase={unit.workflowPhase} />
  <ComplianceStateBadge state={unit.complianceState} compact />
  <AuditReadinessTag readiness={unit.auditReadiness} />
</div>
{isBlocked && unit.blockedReason && <div ...>{unit.blockedReason.label}</div>}
{isAwaiting && unit.requiredSigners.map(s => <UserAvatar ... /> ... )}
```

### Staging
- **Non-seed**: Custom `<div>` per task (lines 931–948): code badge, title, event_title, progress bar (completion_percentage), assignee, FORM/SIGNATURES pills, layer-based left border/gradient for "veil".
- **Seed mode** (lines 877–883): Extremely minimal:
  ```tsx
  <div style={{background: V3.glass2, border:..., borderRadius:8, padding:8}}>
    <div style={{fontWeight:600}}>{u.title}</div>
    <div style={{color:..., fontSize:11}}>{u.owner.initials} · {u.domain}</div>
    <div style={{fontSize:10}}>Due {u.dueDate}</div>
  </div>
  ```
  **No phase, no badges, no avatars, no timers, no blocked banner, no evidence/signatures details, no progress from evidenceStatus.**

**Also**: Standalone toy card in `V3CESSeedPreview.tsx:49` (similar minimal, adds fake % from evidence but still no primitives, no drag/click wiring).

**Roadblock**: Designers testing seeds see **none of the visual elements** that make real cards informative (e.g., signers roster for awaiting_signature units in seed, blocked reasons, phase pills, audit tags, escalation timers). The seed data is rich but visually impoverished in staging.

---

## 5. Selection, Veil Drawers & WorkflowDrawer Parity

### Production
- Card `onClick={() => setOpenUnit(u)}`
- Renders `<WorkflowDrawer unit={openUnit} allUnits={units} onClose=... onUpdate=... />`
- **Full "veil" drawer** (fixed inset-0 z-50, backdrop `bg-black/30 backdrop-blur-sm v3-backdrop`, 560px aside with `v3-drawer-panel`):
  - Header: category/event + unit.title + badges
  - Meta: Workflow, Owner, Due, EscalationTimer
  - `<NonSkippableTimeline>` (5 phases with check/lock/current indicators)
  - `<EvidenceStatusPanel>` (forms/signatures/auditIndex + missingForms pills)
  - `<SignatureRoster>` (full list with UserAvatar + status tones + hoursToEscalation)
  - Blocked section (if present)
  - `<ComplianceActionPanel>`: 4 buttons (Upload Evidence, Request Signatures, Mark Blocked, Close Unit) — wired to enforcement checks + onUpdate (mutates local state + re-opens drawer)
  - `<ChildTasksPanel>`: siblings under same parentObligationId
  - Esc key close, backdrop click close.
- Uses `useAutogenStore`, `REGULATORY_EVENTS`, `WORKFLOWS`, `summarizeEvidence`, `useExecutionEnforcement`.

**Drawer code highlights** (WorkflowDrawer.tsx:211+ for actions, 108+ for panels, 361+ for ComplianceActionPanel).

### Staging `CesBoardPage`
- **Non-seed only**: `onClick` toggles `selectedTaskId`. Renders a **custom fixed 360px right panel** (z-999, backdrop div z-998, glass blur) — called "Task detail panel" (not a true drawer/veil in the CES sense).
  - Static fields (Event, Assignee, Domain, Due, Status, Progress bar)
  - Three mini cards: FORM / SIGNATURES / EVIDENCE (no real data binding or actions)
- **Seed mode**: `selectedTaskId` / `selectedTask` logic exists but:
  - The minimal card divs have **no onClick** at all.
  - `selectedTask = boardTasks.find(...)` (boardTasks is empty in seed).
  - No drawer/panel ever appears for seeded units.
- No `WorkflowDrawer` import or usage anywhere in V3StagingApp.
- "Veil" concept exists only in `CesDashboardPage` (layer1/layer2 state for events/tasks, openVeilLayer1/2) — completely separate from board.

**Roadblock**: With seeds enabled, **designers cannot open any detail view** on realistic units. Cannot inspect or interact with the full evidence/signature/timeline/action surface that is the "veil drawer" experience. The toy panel is not parity for WorkflowDrawer.

---

## 6. Drag Logic & Enforcement Differences

### Production
- Full HTML5 drag/drop on non-completed cards.
- `DragState`, `overCol`, `flash` state.
- `handleDragStart/End/Over/Drop` + `canTransitionState` from `useExecutionEnforcement()`.
- On invalid: `flashWarn` shows red `<AlertOctagon>` bar + `AriaLiveRegion`, **snap-back** (no mutation).
- Valid drop: local `setUnits` update to new `complianceState`.
- Resyncs on `EXECUTION_UNITS` from engine via `useEffect`.
- Column `onDragOver`/`onDrop` + visual highlight.
- Enforcement rules (from hook): adjacency matrix, evidence/signatures/auditIndex gates for 'completed', blocker resolution, phase-aware, etc.

**Enforcement example** (useExecutionEnforcement.ts:50):
```ts
if (target === 'completed') {
  if (ev.requiredFormsComplete < ev.requiredFormsTotal) return deny(...);
  ...
}
```

### Staging
- **Zero drag/drop code** in `CesBoardPage` (confirmed via grep: no `drag|draggable|onDrag|DragEvent` in the file for board).
- Cards in both modes are plain `<div onClick=...>` (non-seed) or static divs (seed). No `draggable` prop.
- No enforcement, no snap-back, no warnings.
- Non-seed status model doesn't even match real states.

**Roadblock**: The signature feature of the real CES board ("Drag enforces state-machine rules; invalid moves snap back.") is **completely untestable** in staging with seeds. Designers cannot demo or visually QA drag interactions, flash warnings, or enforcement UX on rich seeded units (e.g., trying to complete a unit missing signatures).

---

## 7. Data-Binding, Reactivity & Seeding Differences

- **Prod**: 
  - `const snap = useComplianceExecution({ mode: 'sprint', window: sprintWindow })`
  - `units` local state + `useEffect` resync from `snap.executionUnits` (MergedExecutionUnit[] extending ExecutionUnit).
  - Updates via drawer `onUpdate` mutate local + re-render.
  - Pulls from regulatoryEvents + autogen + complianceExecutionStore + pmViewSprintStore.
  - `V3_ExecutionUnitsSeed` is **not** the primary source in prod board (used for seeding adapters elsewhere).

- **Staging CesBoardPage seed**:
  - Direct static import: `const seededUnits = useV3Seeds ? V3_ExecutionUnitsSeed : []`
  - `unitsByState` derived every render (no local mutable state).
  - No `onUpdate`, no mutation possible.
  - Crude event title extraction.
  - `seededByEvent` computed but dead.
  - In dashboard (separate): `mapToLocalUnit` adapter that loses fidelity (coerces states, truncates titles).

- **Seed data richness** (V3_CES_SeedData.ts): Includes full `requiredSigners`, `evidenceStatus`, `blockedReason`, `escalationTimer`, `workflowPhase`, `domain`, `obligationKind`, `parentObligationId`, `sprintId`, role fields, etc. Only `title`/`owner`/`dueDate`/`complianceState`/`domain` surface in staging cards.

**Roadblock**: Seeded data is "realistic" only in prod context. In staging board, it is treated as a dumb list. No live updates, no full data binding to drawer primitives or enforcement.

---

## 8. Theming, Layout, Polish & Misc Differences

- **Theming**:
  - Prod: `useCesTokens()` (CES navy sub-brand per theme.ts — deliberate separate `--ces-*` namespace; white cards, soft tints). Some `v3-*` classes leaked for animation/backdrop.
  - Staging: Local `const V3 = { glass2, tealLight, ... }` + inline styles. Matches broader V3 Veil Glass (`v3Tokens.ts`, ui-staging.css) but clashes with CES navy identity.
- **Layout**: Prod wrapped in `<CesLayout>` (top context bar with sprint, search, escalations bell, profile; uses snap for counts). Staging: embedded in V3StagingApp's custom nav/shell.
- **Polish**: Prod has `SprintScopeToolbar`, flash warning + aria, key={units.length} for re-render, minHeight 600 on cols, empty states per column.
- **No equivalents** in staging seed branch.
- **Veil terminology**: Staging dashboard uses "veil" for its custom layers; prod drawer uses backdrop + "v3-drawer-panel". Not unified.

---

## 9. Specific Code Locations Highlighting the Gaps (Toy Seeded Branch)

In `V3StagingApp.tsx:858`:
```tsx
if (useV3Seeds) {
  ... compute unitsByState ...
  return (
    <div style={{padding:24}}>
      <h2>CES Board — V3 Seeds (Live Grouping)</h2>
      <button>Switch to Toy Mocks</button>
      <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)'}}>
        {stateOrder.map(state => <div key={state} style={{background:V3.glass3,...}}>
          <div>{state} ({count})</div>
          {unitsByState[state].map(u => <div style={minimal}>{u.title}...</div>)}
        </div>)}
      </div>
      <div>Grouping copied from live SprintExecutionBoard... (but not actually rendered)</div>
    </div>
  )
}
```
- No imports of real components inside the branch.
- `seededByEvent`, `selectedTaskId` (for seeds), drag handlers — all absent or unused.

The non-seed toy (5-col, custom cards, 360px panel) is the "real" preview surface for V3StagingApp designers.

---

## 10. Recommendations: What Needs to Be Copied or Refactored

**Goal**: When `useV3Seeds` (or a new `useLiveCESBoard` flag) is true in staging, the CES Board tab should render **(or very closely mimic)** the live `SprintExecutionBoard` + cards + drawer, populated by `V3_ExecutionUnitsSeed` (or a filtered sprint slice), using V3 Veil Glass tokens where possible while respecting CES sub-brand guidance.

### Short-Term (Minimal Change, High Impact)
1. **Import and conditionally render live components** in `CesBoardPage` (V3StagingApp.tsx):
   ```tsx
   import { SprintExecutionBoard } from '@/policy/ces/components/board/SprintExecutionBoard';
   // ...
   if (useV3Seeds) {
     return (
       <div className="v3-ces-staging-shell"> {/* wrapper for V3 bg + padding */}
         {/* Optionally provide mock providers if stores conflict */}
         <SprintExecutionBoard /> {/* but will pull live snap — need seeding hook override? */}
       </div>
     );
   }
   ```
   **Problem**: `SprintExecutionBoard` internally calls `useComplianceExecution` + `usePmViewSprintStore` + `useExecutionEnforcement`. These may pull real/autogen data or require context. Staging may need a "seed mode" override in the compliance store or a prop-injected variant.

2. **Make a seeded data override**:
   - Add to `complianceExecutionStore.ts` or a new `useSeededComplianceExecution` hook that, when in staging/demo mode, returns snapshot with `executionUnits: V3_ExecutionUnitsSeed` (mapped to Merged) + synthetic events.
   - Or expose `units` prop to `SprintExecutionBoard` for controlled mode (preferred refactor).

3. **Extract presentational core**:
   - Refactor `SprintExecutionBoard` to accept optional `units`, `onUnitUpdate`, `onUnitClick` etc. props (or use context).
   - Create `StagingSprintExecutionBoard.tsx` (in ui-staging/ces/) that imports the real card/drawer but supplies V3-styled tokens or CSS overrides + static seed data + mock enforcement (for demo drag that always "allows" or logs verdicts).

4. **Wire selection for seeds immediately** (quick win):
   - In seed branch, attach `onClick={() => setSelectedTaskIdForSeed(u.id)}` to minimal cards.
   - Render a **real** `<WorkflowDrawer unit={selectedSeededUnit} ... onUpdate={...} />` (import it) inside the seed return, even if cards stay toy temporarily. This alone lets designers see the full drawer on realistic data.

5. **Fix the dead code**:
   - Use `seededByEvent` to render proper swimlanes inside the 6-col grid (copy `<SwimlaneHeader>` or import it).
   - Or better: delete the toy seed renderer and delegate to live.

### Medium-Term (Recommended Architecture)
- **Create `src/ui-staging/ces/StagingCESBoard.tsx`** (or enhance `V3CESSeedPreview.tsx`):
  - Accepts `useLiveComponents: boolean`.
  - When true: dynamically import/render `SprintExecutionBoard` (or a V3-wrapped version) + seed injection.
  - Provide V3 glass shell + override CSS vars for `--ces-*` to blend with V3 tokens for design review.
  - Include drag demo mode (mock enforcement that surfaces verdicts in V3 toast style).
  - Use the same `V3_ExecutionUnitsSeed` + add event seed data for full swimlanes.

- **Unify primitives under V3**:
  - Make `ComplianceStateBadge`, `PhaseIndicator`, etc. accept optional `theme="ces" | "v3"` or consume from a unified token system.
  - Or duplicate a V3-styled set in ui-staging for pure preview (but prefer sharing).

- **Data contract for staging**:
  - Export a `getSeededExecutionSnapshot()` from `V3_CES_SeedData.ts` that returns full `{ events, executionUnits: MergedExecutionUnit[] }` shape expected by board.
  - Update `V3StagingApp` seed toggle to also feed other CES surfaces (dashboard veils, etc.).

- **Drag parity in staging**:
  - Copy the drag handlers + flash + `canTransitionState` logic into the staging board wrapper (or call through to live).
  - For pure V3 preview, allow "demo drag" that updates a local copy of seed units.

- **Layout parity**:
  - When seeds + live board: optionally render inside a minimal `CesLayout` stub or V3-equivalent top bar (sprint context, escalations) so the full surface matches what designers will ship.

### Files to Modify / Create
- **Edit**: `src/ui-staging/V3StagingApp.tsx` (CesBoardPage + seeded branch + add imports for real components + map seed to full units)
- **Edit/Create**: `src/ui-staging/ces/StagingCESBoard.tsx` (new dedicated parity surface)
- **Edit**: `src/policy/ces/components/board/SprintExecutionBoard.tsx` (add optional `seedUnits?: ExecutionUnit[]`, `controlledUnits`, `onUpdateUnit` props for staging isolation)
- **Edit**: `src/policy/ces/components/board/ExecutionUnitCard.tsx` + `WorkflowDrawer.tsx` (ensure they are pure enough; expose V3 className overrides)
- **Edit (support)**: `src/policy/compliance-execution/complianceExecutionStore.ts` or add `src/policy/ces/data/seededComplianceSnapshot.ts` for demo wiring.
- **New report companion**: Update `CES_Kanban_Board_Gap_Analysis.md` or create cross-link in the Seeding alignment folder.
- **CSS**: Add V3 CES overrides in `src/ui-staging/ui-staging.css` or `v3Tokens.ts` for `--ces-navy` etc. when in staging context.

### Prioritization for Designers
1. Make seeded cards use real `ExecutionUnitCard` (even without full drag).
2. Wire real `WorkflowDrawer` on click for seeded units (biggest visual/interaction win).
3. Restore swimlanes using seed event data.
4. Enable basic drag (local state updates on seed copy) with enforcement toasts.
5. Theme the live board surface with V3 glass + CES accents for "preview mode".

---

## 11. Conclusion

The current `useV3Seeds` implementation in `CesBoardPage` (V3StagingApp.tsx) provides **no meaningful parity** with production. It was an early "live grouping" sketch that was never completed to the point of using the actual components it references in comments.

**All major surfaces** (6-col swimlane structure, rich `ExecutionUnitCard` visuals + data, full `WorkflowDrawer` "veil" with actions/timeline/evidence/signatures/child tasks, HTML5 drag + `useExecutionEnforcement` snap-back + warnings, live data reactivity) are absent or stubbed when seeds are enabled.

**To unblock designers**: The staging CES Board must be refactored to **consume or closely replicate** `SprintExecutionBoard`/`ExecutionUnitCard`/`WorkflowDrawer` + `V3_ExecutionUnitsSeed` (augmented with events). This may require controlled props on the live components + a staging-specific data provider.

Once done, toggling seeds in the CES Board tab will deliver the "real board" experience inside the V3 Veil Glass shell — exactly what the seeding initiative and this 16-agent alignment effort intend.

**Absolute paths referenced throughout this report are canonical within the workspace `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\`**.

---

*End of Agent 03 CES Board Component Parity & Rendering Audit. Ready for integration into master seeding alignment plan.*
