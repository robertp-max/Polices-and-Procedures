# CES Kanban / SprintExecutionBoard Deep Dive Gap Analysis
**CES Page View Coverage Deep Audit — Agent 02 (SprintExecutionBoard / Kanban Specialist)**

**Date**: 2026-05-20  
**Auditor**: Agent 02 — CES Page View Coverage Deep Audit team  
**Baseline**: Agent 01's *V3 Page View Coverage & Fidelity Report* (expanded matrix in `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/UI-Staging/Audit/CES-PageView-Coverage-Audit-2026-05-20/V3_Page_View_Coverage_and_Fidelity_Report.md`) confirming **zero full-V3 representation** for all CES execution surfaces (CesBoardPage, SprintExecutionBoard, etc.).  
**Companion Prompt**: `00_Claude_Prompt_Missing_CES_V3_PageViews.md` (explicitly lists the 6-column Kanban + WorkflowDrawer as priority #1 missing surface).  
**Scope**: Line-by-line, component-by-component audit of production CES board/Kanban logic vs. V3 Veil Glass spec (`V3-Veil-Glass-Design-System-Implementation-Specs.md`, `src/ui-staging/v3Tokens.ts`, `ui-staging.css` :root) + staging reference surfaces (PolicyLibrary grid, Dashboard/MyPlanner cards, Evidence tree) + referenced PDF mocks (`APP_Screenshots.pdf`, Top Picks).

**Deliverable Location**: This file (`docs/UIUX/Audit/CES_Kanban_Board_Gap_Analysis.md`).

---

## 1. Executive Summary

**Finding**: The CES Kanban / Sprint Execution Board has **0% full V3 Veil Glass fidelity**. It is a fully functional, enforcement-aware 6-column swimlane board (production-grade drag/drop + state machine) rendered entirely inside the legacy `CommandCenterLayout` + `CesLayout` + `ShellContentFrame` using the **CES sub-brand navy palette** (`CES_TOKENS` / `--ces-*` namespace). 

- **Visual/Shell Gap**: No 77.7% floating matte slate glass card (`#05060A` radial + 24px grid + `linear-gradient(135deg, rgba(32,41,56,0.88)...)` + 32px blur + 0.33 borders + ci-angel 0.33 watermark). Instead: light canvas/white cards, navy sub-brand, full-width constrained inside legacy glass shell.
- **Styling**: Heavy use of `useCesTokens()` (navy #1F4A8A dominant, white cards, soft tints per column). Partial v3- class leakage (`v3-subview-animate`, `v3-drawer-panel`, `v3-backdrop`) but cosmetic only — no token adoption or shell.
- **Data**: Rich `ExecutionUnit[]` (from `compliance-execution` snapshot + `ces/types.ts`) with swimlane grouping by `parentEventId`, `evidenceStatus` (counts only), enforcement state. **No rendered folder trees** (only path strings in `eventFolders.ts`).
- **Interactions**: Real HTML5 drag/drop + `useExecutionEnforcement` state-machine enforcement (snap-back + flash warnings). Card click → `WorkflowDrawer`. Full 6-col horizontal scroll.
- **Density vs V3**: High (dense 6-col grid, minWidth 1700px, many small badges, white card chrome). V3 spec demands calm, low-density, "expensive" feel with invisible-glare surfaces.
- **Staging Comparison**: PolicyLibrary uses beautiful V3 grid cards (lifecycle/ACHC badges, hover glare, teal). MyPlanner has 3-col Kanban (overdue/in-flight/queued) with V3 tokens. Evidence has simple tree + list. CES board has none of this treatment.
- **Impact**: Directly contradicts the "70% declutter + calm authority" CES initiative and the Claude prompt's mandate for V3-veiled Kanban as the #1 missing surface.

**Verdict**: Functional production surface (high engineering quality) but visually and architecturally **alien** to the V3 Veil Glass system. Requires complete reskin + folder tree enrichment in drawer + new V3 `CesBoardPage` surface in staging.

---

## 2. File Inventory & Component Map (Audited)

**Primary Production Files (all inside `src/policy/ces/`)**:
- `pages/CesBoardPage.tsx` (7 LOC) — trivial `<CesLayout><SprintExecutionBoard /></CesLayout>`
- `layouts/CesLayout.tsx` (144 LOC) — CES-specific top context bar (Active Sprint dropdown, search, escalations bell, profile) + navy canvas header. **No V3 shell**.
- `components/board/SprintExecutionBoard.tsx` (245 LOC) — The core 6-column Kanban + swimlanes + drag logic + drawer mount.
- `components/board/ExecutionUnitCard.tsx` (131 LOC) — The draggable card renderer.
- `components/details/WorkflowDrawer.tsx` (358+ LOC) — Slide-out detail (timeline, evidence summary, signatures, child tasks). Uses `CES_TOKENS` directly + some v3- classes.
- `components/primitives.tsx` (178 LOC) — Badges (`ComplianceStateBadge`, `PhaseIndicator`, `AuditReadinessTag`, `UserAvatar`, `EscalationTimer`).
- `theme.ts` (181 LOC) — `CES_TOKENS` / `useCesTokens()` (navy sub-brand contract per Lead 16 C14).
- `types.ts` (280+ LOC) — `ExecutionUnit`, `ComplianceState` (6 values), `EvidenceStatus`, etc.
- Supporting: `hooks/useExecutionEnforcement.ts`, `hooks/useEvidenceTracker.ts`, `components/details/SprintTaskPanel.tsx`, `obli gations/`, `compliance-execution/` (store + `eventFolders.ts`).

**Related Non-CES but CES-adjacent**:
- `src/policy/compliance-execution/` (types, store, `eventFolders.ts`, adapters).
- `src/policy/components/pm/SprintScopeToolbar.tsx`, `GlobalTaskDrawer.tsx`, `RightDrawer.tsx`.
- Legacy right panels referenced in declutter docs.

**Staging V3 References (no CES equivalent)**:
- `src/ui-staging/V3StagingApp.tsx` (PolicyLibraryPage ~172 LOC grid, EvidencePage tree+list, MyPlanner 3-col board, Dashboard cards).
- `src/ui-staging/v3Tokens.ts` + `ui-staging.css` (`:root` V3 vars, `.v3-main-content`, `.v3-invisible-glare`, `.v3-subview-animate` etc.).

---

## 3. Current Styling Audit (CES_TOKENS vs V3 Leakage / Spec)

### 3.1 CES Token System (theme.ts + index.css)
- **Hard sub-brand contract** (Lead 16 C14 amendment 2026-05-16): Navy (`#1F4A8A` light / `#7ADEDF` dark) is **CES identity**. Teal available only as limited accent. Explicit "remap contract" comments.
- Light tokens: `navy`, `navySoft: '#EAF1FF'`, `orange: '#C74601'`, `canvas: '#F8FAFC'`, `white: '#FFFFFF'`, semantic green/amber/red softs.
- Usage: Every file calls `const t = useCesTokens();` then `style={{ color: t.navy, background: t.white, border: `1px solid ${t.border}` }}`.
- CSS mirror: `--ces-navy`, `--ces-canvas`, `.ci-bg-ces-white`, etc. (lines ~1173+ in index.css).
- **Result**: All cards/columns/headers are light, high-chrome, navy-tinted. Column tints in board (line 56-63): `upcoming: canvas`, `awaiting_signature: orangeSoft`, `blocked: redSoft`.

**Code excerpt — Column tinting (SprintExecutionBoard.tsx:56-63)**:
```tsx
const columnTint: Record<ComplianceState, { hd: string; ... }> = useMemo(() => ({
  upcoming:           { hd: t.canvas,     hdfg: t.muted,  bg: t.canvas,     bd: t.border },
  ready:              { hd: t.navySoft,   hdfg: t.navy,   bg: t.canvas,     bd: t.border },
  ...
  awaiting_signature: { hd: t.orangeSoft, hdfg: t.orange, bg: t.orangeSoft, bd: t.orange + '55' },
  blocked:            { hd: t.redSoft,    hdfg: t.red,    bg: t.redSoft,    bd: t.red + '55' },
  completed:          { hd: t.greenSoft,  hdfg: t.green,  bg: t.canvas,     bd: t.border },
}), [t]);
```

### 3.2 V3 Leakage (cosmetic, non-functional)
- `v3-subview-animate` on the 6-col grid (SprintExecutionBoard:139)
- `v3-backdrop`, `v3-drawer-panel`, `v3-micro`, `v3-stagger` in WorkflowDrawer (lines 60,66,89,97,188)
- `v3-backdrop` + `v3-modal-panel` in SprintTaskPanel.tsx
- These resolve to global CSS (index.css ~1356+ for veil panels, ~2904 for subview) but **do not bring 77.7% shell, dark base, or token remapping**.

### 3.3 V3 Spec Requirements (from V3-Veil...Specs.md + v3Tokens.ts)
- Base: `#05060A` + radial `#121724` + 2×2 grid overlay at 0.012 opacity.
- Main card: `width: '77.7%'`, `min 980px`, `borderRadius: 24px`, glass gradient `rgba(32,41,56,0.88)...`, `backdrop-filter: blur(32px) saturate(140%)`, `box-shadow: 30px 10px 80px rgba(0,0,0,0.9)`.
- Borders: sacred `rgba(255,255,255,0.33)` (hover 0.45). "Invisible" surfaces default transparent (`.v3-invisible-glare`).
- Accents: Teal `#00D1C1` dominant; orange `#FFA059` **only** for "Command Center" eyebrow + "My Personal Workspace".
- No sub-brand navy. All CES surfaces must adopt the single veil language.
- HeaderBlock pattern + low-density cards.

**Gap**: 100% mismatch. CES is the anti-pattern of the V3 contract.

---

## 4. Data Shapes & Folder/Evidence Usage Audit

### 4.1 Core Data Shape (`ces/types.ts:206+` + `compliance-execution/types.ts`)
`ExecutionUnit` (used by board + drawer):
```ts
export interface ExecutionUnit {
  id: string; title: string; parentEventId: string; workflowId: string;
  workflowPhase: WorkflowPhase; complianceState: ComplianceState;  // 6 states
  auditReadiness: AuditReadiness; owner: Owner; requiredSigners: RequiredSigner[];
  blockedReason?: BlockedReason; dueDate: string; escalationTimer?: number;
  evidenceStatus: EvidenceStatus;  // { requiredFormsTotal, signaturesComplete, missingFormIds[], auditIndexCreated }
  domain: ComplianceDomain;
  // + obligation extensions, role fields (assignedRole, etc.), sprintId
}
```
- **Swimlane grouping**: By `parentEventId` → `EVENTS` from `useComplianceExecution()` snapshot (line 49-54 in board).
- **Evidence**: Shallow counts only (`evidenceStatus.signaturesComplete / signaturesRequired`). No per-item objects or tree.
- **Enrichment**: `MergedExecutionUnit` in compliance-execution adds `regulatoryRef`, `sourceEvidenceIds`.

**Code excerpt — Board grouping (SprintExecutionBoard.tsx:49-54)**:
```tsx
const byEvent = useMemo(() => {
  return EVENTS.map(ev => {
    const evUnits = units.filter(u => u.parentEventId === ev.id);
    return { event: ev, units: evUnits };
  }).filter(g => g.units.length > 0);
}, [units, EVENTS]);
```

### 4.2 Folder / Evidence System (`compliance-execution/eventFolders.ts`)
Defines canonical S3-style paths:
```ts
export interface EventFolderPaths {
  root: string; evidenceDir: string; formsRequiredDir: string; approvalsDir: string; ...
}
export function resolveEventFolder(eventId: string): EventFolderMetadata { ... }
```
- Used in adapters, storage, but **never rendered as interactive folder tree** in `ExecutionUnitCard`, `WorkflowDrawer`, or `CesBoardPage`.
- Drawer shows only `EvidenceStatusPanel` (KV labels + missingForms chips) and `ChildTasksPanel` (flat siblings).
- Contrast: Staging `EvidencePage` has a flat "Evidence Tree" list of domains. Production EvidenceCenterPage uses `FolderOpen` icons but no nested tree UI matching PDF expectation.
- **Gap per Claude prompt & declutter docs**: "Include **folders** (evidence folders, task folders) as nested trees with FolderOpen icons, status, counts, drag-to-link".

**No folder tree implementation exists in the audited Kanban surface.**

### 4.3 Store / Snapshot Flow
- `useComplianceExecution({ mode: 'sprint', window })` → `complianceExecutionStore` + selectors/adapters.
- Local `units` state in board (resynced via useEffect).
- Real enforcement via `canTransitionState` from hook.

---

## 5. Interaction Patterns Audit

### 5.1 Drag & Drop (HTML5 native, enforced)
- `handleDragStart/End/Over/Drop` on `ExecutionUnitCard` + column containers (board:70-100).
- `canTransitionState(unit, targetState)` from `useExecutionEnforcement` (strict adjacency map: upcoming→ready/in_progress only, etc.; no skipping phases).
- On deny: `flashWarn` + red bar + `AriaLiveRegion`; no state mutation (snap-back).
- Cards: `draggable={state !== 'completed'}`; top border color by state; hover shadow.

**Code excerpt — Drop enforcement (SprintExecutionBoard.tsx:86-100)**:
```tsx
const handleDrop = useCallback((target: ComplianceState) => {
  if (!drag) return;
  const verdict = canTransitionState(drag.unit, target);
  if (!verdict.allowed) {
    flashWarn(verdict.reason);
    ...
    return;
  }
  setUnits(curr => curr.map(u => ... { complianceState: target } ...));
}, [...]);
```

### 5.2 Selection & Drawer
- Card `onClick` → `setOpenUnit(u)` → `<WorkflowDrawer unit={...} onUpdate=... />` (modal-like fixed aside with backdrop).
- Drawer: Esc key, phase timeline (NonSkippable), evidence KV, signatures, blocked section, `ChildTasksPanel`, `ComplianceActionPanel`.
- No multi-select, no bulk, no inline editing on board.

### 5.3 Other
- `SprintScopeToolbar` + sprint window from `pmViewSprintStore`.
- Column count badges, escalation bell in CesLayout (computed from units).
- No search/filter/sort on the board itself (search bar in CesLayout is non-functional input).

**Staging contrast**: MyPlanner columns are filter-derived (static), no real drag. PolicyLibrary cards have real `onClick` navigate.

---

## 6. Exact Visual & Density Gaps vs V3 Spec + PDF / Staging Surfaces

| Aspect                  | Production CES Board (Current)                          | V3 Spec + Staging Examples (PolicyLibrary, MyPlanner, Evidence) | Gap Severity |
|-------------------------|---------------------------------------------------------|------------------------------------------------------------------|--------------|
| **Shell / Canvas**     | Legacy `CesLayout` + `ShellContentFrame` (ci-glass tokens, full width inside rail) | 77.7% `.v3-main-content` floating card, `#05060A` + grid + ci-angel@0.33 fixed watermark | Critical |
| **Background / Density** | Light `#F8FAFC` canvas, white cards with 1px borders, 6-col min 1700px horizontal scroll, tight padding | Dark matte slate, invisible-glare (transparent default), generous 40px padding, calm low-density | Critical |
| **Color Palette**      | Navy sub-brand (#1F4A8A headers, soft tints), orange/red for states | Teal #00D1C1 dominant; orange only for micro labels; 0.33 white borders | Critical (sub-brand violation) |
| **Cards**              | `ExecutionUnitCard`: white bg, 3px top border by state, dense badges (Phase + State + Audit + signers + escalation + owner + due), dashed footer | `.v3-invisible-glare` + 0.33 border, teal overdue emphasis, low-chrome, hover physics | High |
| **Columns / Swimlanes**| 6 fixed (`COMPLIANCE_STATE_ORDER`), event swimlane headers inside each (navySoft pills), dense stacking | 3-col example in MyPlanner (calm), bordered interactive only | High |
| **Typography**         | 12.5px titles, 9.5-11px badges, uppercase tracking heavy | 28px hero gradient, 14px section, 13-14px body; Inter discipline | Medium-High |
| **Evidence/Folders**   | Shallow counts + missing chips in drawer only. No tree | EvidencePage: domain tree (left) + artifact list; PDF expects rich nested folders | High |
| **Drawer**             | 560px fixed aside, CES_TOKENS white, v3- classes cosmetic, timeline + flat lists | V3 veil panel (glassVariant), rich content, transitions 0.7s cubic-bezier | High |
| **Motion**             | Basic hover shadows, flash timeout | `cubic-bezier(0.16,1,0.3,1)` 0.55-0.7s, butter-shift, stagger, View Transitions | Medium |
| **Header**             | Navy "Active Sprint" pill + search (dead) + escalations in CesLayout | V3 `HeaderBlock` (orange micro + gradient title) inside glass card | High |

**PDF / Mock Fidelity**: Board matches functional intent of execution screenshots (swimlanes, cards with status, drawer) but **zero visual language** (no dark premium veil, high density vs calm authority).

**Staging Fidelity Examples**:
- PolicyLibrary grid: Excellent (97%) — search/filter bars (glass3), rich cards with badges, hover, teal.
- Evidence tree: Simple but V3-framed, two-column glare panels.
- Dashboard/MyPlanner: Invisible KPIs + bordered task cards with overdue orange.

CES has none.

---

## 7. Precise Recommendations for Missing V3-Veiled Kanban Page View

The V3-veiled CES Kanban must be a **first-class SectionId surface** (`ces-board`, `ces-execution`) added to `V3StagingApp.tsx` (and later ported to production `CesBoardPage`).

**Must Contain**:

### 7.1 Shell & Layout
- Full V3 shell inheritance (77.7% card, dark base + grid + watermark 0.33, HeaderBlock with "COMPLIANCE EXECUTION" orange micro + "Sprint Execution Board" gradient title).
- Top bar inside card: Sprint selector (from pm store), domain filters, search (functional), readiness %, "Add Task" (teal).
- 6 columns: `Upcoming | Ready | In Progress | Awaiting Signature | Blocked | Completed` (exact `COMPLIANCE_STATE_ORDER`).
- Horizontal scroll or responsive masonry if needed, but prefer contained calm width.
- Swimlanes: Grouped by Event (use `parentEventId` + event title + domain pill). Use subtle left accent or nested cards, not heavy chrome. V3 "invisible" treatment for groups.

### 7.2 Cards (`ExecutionUnitCard` V3 variant)
- Use `variant="bordered"` only (interactive) or `.v3-invisible-glare`.
- Fields (preserve all current + enrich):
  - Title (primary)
  - Phase badge (teal navy mapping)
  - ComplianceStateBadge (teal positive / orange attention)
  - AuditReadinessTag (dot + label)
  - Blocked reason (explicit, red soft)
  - Awaiting: Signer avatars (teal rings) + "X/Y signed" + EscalationTimer
  - Evidence: Small folder icon + count (e.g. "3 evidence / 2 forms") — clickable to open folder tree in drawer
  - Owner avatar + due (teal mono)
  - Progress or phase dots if space
- Drag affordance: Subtle grip or whole-card draggable with V3 hover scale 1.01.
- Density: Reduce chrome; use 0.33 borders, generous internal padding, low font sizes consistent with V3 body 13px.

### 7.3 Drawer Behavior (WorkflowDrawer V3)
- Mount as V3 veil glass panel (`.v3-veil-glass-panel` or equivalent inside shell, or large inline right card).
- Rich **folder trees** (per Claude prompt + declutter docs + `eventFolders.ts`):
  - Expandable tree: /events/{id}/evidence/, /forms/required/, /forms/completed/, /approvals/, /tasks/
  - Icons: FolderOpen/closed + FileText + status dots (teal/green/orange/red)
  - Counts, last-modified, drag-to-link affordance (visual only in staging)
  - Evidence items: Link to artifact viewer, checksum, signer status
- Sections: Non-skippable timeline (V3 dots), EvidenceStatusPanel (enhanced with tree), SignatureRoster (avatars), Child/Sibling tasks (nested list), Blocked panel, Action buttons (teal primary).
- Transitions: 0.7s cubic-bezier matching V3.
- OnUpdate syncs back to board state.

### 7.4 Interactions (Staging-realistic)
- Real local `useState` for filters (domain, phase, search, sprint), selection, simulated drag (or full with mock enforcement).
- Column drop zones with V3 over-state (subtle teal wash).
- Card click opens drawer (or side panel inside the main glass card).
- Enforcement warnings: V3 red soft bar with icon + live region.
- Add "Evidence Queue" sticky footer or button opening bottom drawer (per MyPlanner pattern).

### 7.5 Data
- Seed realistic arrays mirroring production: 4-6 events, 15-25 units across states, full `evidenceStatus`, signers, blocked reasons, due dates.
- Reference `complianceExecutionTypes`, `taskProjection`, `eventFolders`, `REGULATORY_EVENTS`.
- Include folder metadata in mocks.

### 7.6 Other Requirements
- Toggle or tab to Gantt view stub.
- Match low-density calm aesthetic of PolicyLibrary / DomainLibrary cards.
- Accessibility, no-scrollbar, motion discipline.
- Later: Full production port replacing CesLayout + tokens (or scoped V3 mode for CES).

**Priority Order per Prompt**: 1. CES Sprint Execution Board/Kanban, 2. Gantt, 3. Full CesBoardPage wrapper.

---

## 8. What Claude Must Generate (Exact Deliverable for Next Agent / Implementation)

Claude (or next 16-agent) **must** generate the following **inside `src/ui-staging/V3StagingApp.tsx`** (or as self-contained drop-in sections) to close the gap:

1. **New SectionId** values: `'ces-board' | 'ces-execution' | 'ces-gantt' | 'ces-my-tasks'`.
2. **NAV_GROUPS** update: New "CES EXECUTION" group containing the above (after COMPLIANCE or as sibling to "FORMS & EVIDENCE").
3. **New page functions** (exact style match to `PolicyLibraryPage`, `EvidencePage`, `MyPlanner`):
   - `CesBoardPageV3()` — full V3 shell + HeaderBlock + functional Sprint selector + filters + the 6-col Kanban rendered with V3 tokens / classes.
   - `CesExecutionWorkspace()` or inline drawer content.
4. **Mock data**: `CES_EXECUTION_UNITS`, `CES_EVENTS` arrays at top of file (or new `src/ui-staging/data/cesSeed.ts`) using shapes from `ces/types.ts` + folders.
5. **V3 Kanban components** (or styled inline):
   - `V3ExecutionUnitCard` (props + V3 styling, draggable with local handlers).
   - Column renderer with swimlane groups.
   - Simulated `canTransition` (or simple allow + visual enforcement).
6. **V3 WorkflowDrawer / EvidenceFolderTree**:
   - Rich nested `<details>` or custom tree using Folder icons, status, counts.
   - Evidence items with fake links.
7. **Integration**: Wire card `onClick` to open a veiled detail panel (use existing V3 modal patterns or right column inside glass card).
8. **PageContent switch** case + navigation from Quick Jump / sidebar.
9. **Optional**: Gantt stub + MyTasks CES variant.

**Output expectation**: Drop-in code that, when `/ui-staging` is loaded and "CES Board" selected, shows a pixel-perfect match in spirit to the existing 22 surfaces (98% visual fidelity to V3 spec + PDF) while preserving all production interaction semantics (drag enforcement, real fields, folders).

Also generate companion: Updated `V3_CES_SeedData.ts` and any VeilDrawer helper if needed.

**Files to touch / create in staging**:
- V3StagingApp.tsx (primary)
- (New) `src/ui-staging/data/cesExecutionSeed.ts`
- Possibly updates to `v3Tokens.ts` / CSS if new primitives required.

This completes the "all page views needed" per Agent 01 baseline.

---

## 9. Line-by-Line / Component-by-Component Highlights (Selected Excerpts)

**CesBoardPage.tsx:4-6** (wrapper only):
```tsx
export function CesBoardPage() {
  return <CesLayout><SprintExecutionBoard /></CesLayout>;
}
```

**SprintExecutionBoard.tsx:137-208** (the 6-col board JSX — core visual):
- `gridTemplateColumns: 'repeat(6, minmax(280px, 1fr))'`
- Per-column `onDragOver` / `onDrop`
- SwimlaneHeader + ExecutionUnitCard map inside each state.

**ExecutionUnitCard.tsx:43-58** (card root — chrome heavy):
```tsx
<article ... style={{ background: t.white, border: `1px solid ${...}`, borderTop: `3px solid ${topBar}` }}>
```

**WorkflowDrawer.tsx:57-67** (drawer shell — partial V3):
```tsx
<aside className="w-[560px] ... v3-drawer-panel" style={{ background: CES_TOKENS.white, ... }}>
```

**Primitives badges** — all navy/orange/red soft tints, no V3 teal mapping.

**No use of V3 const or `--v3-*` vars anywhere in ces/ except cosmetic classes.**

---

## 10. Recommendations & Next Steps

1. **Immediate (Agent 02 / CES swarm)**: Use this + Agent 01 report + 00_Claude_Prompt as input to generate the V3 CesBoardPage surface in staging.
2. **Design/Visual Agents**: Side-by-side diff of current board screenshot vs V3 Dashboard/MyPlanner + PDF board pages. Enforce 0.33 border + invisible default.
3. **Data Agents**: Centralize CES seed + folder trees.
4. **Production Port**: After staging validation, replace CesLayout + theme usage with V3 shell (or add `glassMode="v3-veil"` flag). Preserve enforcement + stores 100%.
5. **Folder Trees**: Implement `EventFolderTree` component (nested, status-aware) for drawer + evidence surfaces (ties to declutter removals).
6. **Audit Maintenance**: Add annotated screenshots of current board vs target V3 to this Audit/ subdir.
7. **Token Unification**: Long-term: Decide if CES navy survives inside V3 or is remapped (per theme.ts contract comments).

**References Locked**:
- Baseline: `.../CES-PageView-Coverage-Audit-2026-05-20/V3_Page_View_Coverage_and_Fidelity_Report.md`
- Prompt: `00_Claude_Prompt_Missing_CES_V3_PageViews.md`
- Spec: `docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md`
- Code: All paths under `src/policy/ces/`, `src/ui-staging/V3StagingApp.tsx:1027+` (library/evidence), `src/policy/compliance-execution/eventFolders.ts`

**End of Agent 02 Report**  
*This document + the two Claude prompt files + staging source form the complete handoff for generating the missing V3-veiled CES Kanban.*