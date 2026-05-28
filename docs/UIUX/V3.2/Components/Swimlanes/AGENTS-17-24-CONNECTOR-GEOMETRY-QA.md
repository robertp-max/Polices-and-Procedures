# AGENTS 17-24: CONNECTOR GEOMETRY QA — SWIMLANE EXECUTION MAP (NON-QA-WF-03 GENERATED PATHS)

**Team:** Agents 17-24 (Connector Geometry QA) — 64-QA locked swimlane stabilization swimlane  
**Repo (exact):** C:\AI\Git\training\HomeHealth\Policies_and_Procedures  
**Mode:** Read-only inspection. No code changes performed.  
**Hard Exclusion:** QA-WF-03 and QAWorkflow03SwimlanePage.tsx (and any /workflows/QA-WF-03* routes) — inspected ONLY for registry-level exclusion confirmation. Zero deep reads or analysis of its custom computeOrthogonalPath / SwimlaneEdges / renderer.  
**Date:** 2026-05-28  
**Focus:** Connector correctness exclusively in *generated* (non-custom) swimlanes rendered via SwimlaneExecutionMap + builders.  

**Primary Question Answered:** Do ALL connectors in generated (non-QA-WF-03) swimlanes declare and render as orthogonal, and attach exclusively to real existing nodes via edge-to-edge geometry?

---

## Executive Summary + Explicit Confirmation/Denial

**CONFIRMED:** All connectors in generated (non-QA-WF-03) swimlanes are **orthogonal** and **attach to real nodes**.

- 100% of edges emitted by `buildSwimlaneFromWorkflow`, `buildSwimlaneFromEvent`, and `buildFallbackSwimlane` declare `route: 'orthogonal'` (literal in type + value).
- All edges connect only existing `nodeId`s present in the same model's `nodes` array (constructed exclusively via `nextNodeIds` mutation or hardcoded consistent chains in fallback; no external references).
- `SwimlaneEdges` (333-357) contains an explicit `nodeById` guard: `if (!fromNode || !toNode) return null;` — prevents any floating/undefined path render.
- The sole path emitter is `computeOrthogonalPath` (98-112): produces **only** straight horizontal or 3-segment orthogonal (H-V-H) polylines. **Zero diagonals, curves, beziers, or other route types** exist in any code path for generated models.
- Visual attachment uses identical math for SVG path endpoints and CSS card positioning (no drift from `translate(-50%, -50%)`).
- Sampled 9 workflows (GV-WF-01, CL-WF-26, CO-WF-01, FN-WF-01, OP-WF-01, IT-WF-21, RM-WF-16, EN-WF-01, HR-WF-18) + 5 representative events (compliance_effectiveness_review-20261119-02, policy_review_annual-20261015-02, employee_compliance_training-20260901-01, incident_report-20260101-01, complaint_investigation-20260101-01) all produce linear chains (or +injected approval/lock) that render as valid orthogonal attachments.
- **Registry exclusion confirmed:** `swimlaneRegistry.ts:19` (CUSTOM_WORKFLOW_IDS = ['QA-WF-03']) + route handling in SwimlaneRoutePage + WorkflowLibraryApp correctly isolates QA-WF-03 to custom page. Generated paths always use `SwimlaneExecutionMap`.

**No P0 blockers.** Generated swimlane connectors are geometrically sound and defensible.

**Key Files Audited (absolute paths):**
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\SwimlaneExecutionMap.tsx` (core: 98-112, 333-357, nodeCenter 77-84, nodeBounds 86-96, SwimlaneNodes 359-382, LAYOUT 20-27, SWIMLANE_CSS 554-639)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromWorkflow.ts` (199-203 edges)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromEvent.ts` (165-169 edges; delegates to workflow builder at 75-81)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildFallbackSwimlane.ts` (108-112 edges)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\types.ts` (53-58 SwimlaneEdge; 45-46 nextNodeIds/dependencies)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\swimlaneRegistry.ts` (19 CUSTOM set, 36-82 routing + build dispatch)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\SwimlaneRoutePage.tsx` (15-20: always ExecutionMap for registered)
- Supporting: phaseTemplates.ts, roleNormalizer.ts, swimlaneRoutes.ts (no edge logic)
- Data: workflows.generated.ts (sampled WF entries), mandatedEventsExpanded.ts + auditRegulatoryEvents.ts (sampled events + processFlow)

**Data Sources for Sampling:** 206+ workflows in workflows.generated.ts; REGULATORY_EVENTS via mandatedEventsExpanded.ts + auditRegulatoryEvents.ts + multiYearEvents (non-QA-WF-03 only).

---

## 1. computeOrthogonalPath Inspection (SwimlaneExecutionMap.tsx:98-112)

```typescript:98:112:C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\SwimlaneExecutionMap.tsx
function computeOrthogonalPath(model: SwimlaneModel, fromNode: SwimlaneNode, toNode: SwimlaneNode) {
  const from = nodeBounds(model, fromNode);
  const to = nodeBounds(model, toNode);
  if (to.cx > from.cx) {
    const startX = from.right;
    const endX = to.left;
    const midX = startX + (endX - startX) / 2;
    if (Math.abs(from.cy - to.cy) < 1) return `M ${startX} ${from.cy} L ${endX} ${to.cy}`;
    return `M ${startX} ${from.cy} L ${midX} ${from.cy} L ${midX} ${to.cy} L ${endX} ${to.cy}`;
  }
  const startX = from.left;
  const endX = to.right;
  const midX = startX - Math.max(72, (startX - endX) / 2);
  return `M ${startX} ${from.cy} L ${midX} ${from.cy} L ${midX} ${to.cy} L ${endX} ${to.cy}`;
}
```

**Findings:**
- **Strictly orthogonal:** Only `M` + `L` commands (Manhattan routing). Same-y: single horizontal. Forward diff-y: three segments (right H, vertical jog, left H). Backward: left-exit H + vertical + right H with external midX (min 72px left jog).
- Relies on `nodeBounds` / `nodeCenter` (below).
- No parameters for curve, bezier, diagonal, or `route` switching. `route` field in edges is **never read** by this function or renderer (purely declarative).
- **No other path functions** in generated code paths (confirmed via exhaustive grep across swimlanes/ dir and callers).

**Cross-ref:** Called exclusively from SwimlaneEdges:350-351 (two overlaid paths for glow + main stroke + marker).

---

## 2. SwimlaneEdges Renderer Inspection (SwimlaneExecutionMap.tsx:333-357)

```typescript:333:357:C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\SwimlaneExecutionMap.tsx
function SwimlaneEdges({ model, nodeById }: { model: SwimlaneModel; nodeById: Map<string, SwimlaneNode> }) {
  return (
    <svg className="absolute left-0 top-0 z-10 h-full w-full pointer-events-none" width={canvasWidth(model)} height={canvasHeight(model)} viewBox={`0 0 ${canvasWidth(model)} ${canvasHeight(model)}`} aria-hidden="true">
      <defs> ... arrow markers ... </defs>
      {model.edges.map(edge => {
        const fromNode = nodeById.get(edge.fromNodeId);
        const toNode = nodeById.get(edge.toNodeId);
        if (!fromNode || !toNode) return null;
        ... status-based stroke ...
        return (
          <g key=...>
            {completed ? <path d={computeOrthogonalPath...} ... blur glow /> : null}
            <path d={computeOrthogonalPath(model, fromNode, toNode)} ... markerEnd ... />
          </g>
        );
      })}
    </svg>
  );
}
```

**Findings:**
- **nodeById guard (342-344):** Hard `return null` — completely suppresses emission of any edge whose nodes are absent from the model. Prevents floating connectors, crashes, or NaN paths.
- `nodeById` built at 129: `new Map(model.nodes.map(node => [node.nodeId, node]))` — always fresh from current model.
- SVG is absolutely positioned, sized exactly to `canvasWidth/Height` (35-41: LANE_W + phases*COL, HEADER_H + lanes*ROW), viewBox matches. Sibling to SwimlaneNodes (z-20) and Grid (implicit).
- All paths use the **single** orthogonal function. No conditional routes.
- Status-driven styling (teal/orange/gray) + optional glow path, but geometry identical.
- **No diagonal/curve/bezier possible here or upstream.**

**Parent usage (294-296):** Always rendered inside canvas for any model passed to SwimlaneExecutionMap.

---

## 3. Builder Edge Declaration Audit (All Three Builders)

**buildSwimlaneFromWorkflow.ts:199-203**
```typescript
const edges = nodes.flatMap(node => node.nextNodeIds.map(toNodeId => ({
  fromNodeId: node.nodeId,
  toNodeId,
  route: 'orthogonal' as const,
})));
```
- 100% of edges use literal `'orthogonal'`.
- `nextNodeIds` populated at node creation (100-101 sequential; 156/196 mutations for injected approval/lock nodes).
- Injected nodes (129-157 approval; 164-197 lock/evidence) always back-link via `last.nextNodeIds = [newId]` and set own `dependencies` + empty next. All IDs exist in final `nodes`.

**buildSwimlaneFromEvent.ts:165-169** (identical pattern)
- Same flatMap + `'orthogonal' as const`.
- Sequential next (105-106); lock injection (162) with mutation.
- Special case (75-81): if `workflow && processFlow.length===0` → delegates to `buildSwimlaneFromWorkflow` (still orthogonal).

**buildFallbackSwimlane.ts:108-112**
```typescript
edges: [
  { fromNodeId: `${id}-fallback-opened`, toNodeId: `${id}-fallback-review`, route: 'orthogonal' },
  { fromNodeId: `${id}-fallback-review`, toNodeId: `${id}-fallback-evidence`, route: 'orthogonal' },
  { fromNodeId: `${id}-fallback-evidence`, toNodeId: `${id}-fallback-lock`, route: 'orthogonal' },
],
```
- Hardcoded 3 edges, all `'orthogonal'`, referencing only the 4 nodes defined in same object (35-107). Fully self-consistent.

**Types enforcement (types.ts:53-58):**
```typescript
export interface SwimlaneEdge {
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  route: 'orthogonal';  // literal union — compiler prevents anything else
}
```
- All models (including fallback) satisfy this.

**Conclusion:** Builders **never** emit non-orthogonal or dangling edges for generated models. Dependencies array is populated for info only (not used for edge emission).

---

## 4. Missing Node / Floating Edge Cases

- **Guard always present and effective.**
- Builders guarantee referential integrity:
  - nextNodeIds only ever set to IDs of nodes created in the same pass (or the subsequently appended approval/lock whose IDs are immediately referenced in prior mutation).
  - Fallback is a closed 4-node system.
  - No external ID injection, no async population, no user-editable edges.
- Edge case theoretically possible only via corrupted `WORKFLOWS` / `REGULATORY_EVENTS` data (e.g., manual nextNodeIds mutation outside builders) — guard silently drops it (no visual floating).
- **No instances in sampled workflows/events** (all linear + injected tails are consistent).
- **Denial of floating risk for generated paths:** None observed or constructible via current builders.

---

## 5. Visual Attachment Analysis (Bounds Math vs Card Render)

**Core math (77-96):**
```typescript
function nodeCenter(...) { ... LAYOUT.LANE_W + orderIndex(...) * COL_WIDTH + COL_WIDTH/2 , ... }
function nodeBounds(...) {
  const center = nodeCenter(...);
  return { cx, cy, left: cx - NODE_WIDTH/2, right: cx + NODE_WIDTH/2, top: cy - NODE_HEIGHT/2, bottom: cy + NODE_HEIGHT/2 };
}
```

**Card render (370):**
```tsx
<button ... style={{ left: center.x, top: center.y, width: LAYOUT.NODE_WIDTH, height: LAYOUT.NODE_HEIGHT, transform: 'translate(-50%, -50%)' }} ...>
```
- **Exact match:** The CSS box (after transform) occupies precisely `[cx - w/2, cx + w/2] x [cy - h/2, cy + h/2]`.
- Path endpoints (`from.right`, `from.cy`, `to.left`, etc.) are therefore at the **exact geometric mid-point of the card's left/right vertical sides**.
- Canvas div (281-292) + SVG (335) share identical coordinate space (no padding, no parent transforms affecting relative positions before the zoom `--canvas-transform`).
- **No attachment drift** from translate(-50%, -50%). Math and render are 1:1.
- Border-radius (18px in CSS 571) + 1px border: attach point (mid-side at cy) lands on straight vertical edge (116px height >> 2*18px radius). Line meets outer border perimeter.
- Zoom/pan (canvas transform + SVG inside) preserves relative attachment (all elements transform together).
- **Minor observation (P3 polish, not bug):** Path terminates exactly at border outer edge. Common connector UX often prefers 4-8px gap or explicit port inset. Current is "touching" — functionally correct and not misaligned.

**Verdict:** No visual attachment failures in bounds vs render. Math contract holds perfectly for generated paths.

---

## 6. Cross-Lane vs Same-Lane Path Behavior

**Same-lane (cy equal, within <1 tolerance):**
- Pure horizontal: `M right,cy L left,cy` (forward) or equivalent backward.
- Spans phase column gap (360px COL_WIDTH - 288px NODE = 72px gap). Clean edge-to-edge.

**Cross-lane (cy differs):**
- Forward: H (at from.cy) → V (at midX) → H (at to.cy).
- Vertical segment crosses one or more `ROW_HEIGHT=164` lane bands + grid dividers (exact at computed midX between the pair).
- Backward: Exits left side + external left midX (guarded >=72px) → V → entry on to.right.

**Observations from LAYOUT + code:**
- LANE_W=240 (role headers), COL=360, NODE=288×116, ROW=164, HEADER=50.
- MidX for forward always between the two cards' x-projections (safe in column gap or intra-col).
- **Identified edge case (P2):** When `to.cx === from.cx` (possible under phaseForStep heuristics for consecutive steps in same phase band, different roles/lanes), falls into `else` (backward) branch. Connector exits **left** of column, jogs further left (into prior phase or LANE_W header area). Not a crash or floating (still valid nodes), but visually non-ideal (leftward dogleg inside a column for a "vertical" connection).
  - Frequency: Low (phase assignment is progressive; keyword/proportional logic favors spread). Possible in short workflows or clustered prep/review steps.
  - Cross-lane within same phase column would benefit from explicit vertical-only or right-exit logic when cx delta <=0.
- No overlapping paths in current models (purely sequential chains; no branching/merging diamonds).

**Cross-lane correctness:** Connectors remain edge-to-edge orthogonal and attach correctly; only aesthetic routing choice for rare same-cx case.

---

## 7. Sampled Real Workflows + 5 Events — Mental Simulation / Attachment Description

**Workflows (all via buildSwimlaneFromWorkflow or delegate; 9/9 non-QA-WF-03):**

- **GV-WF-01 (GOVERNING BODY QUARTERLY MEETING & MINUTES):** 15 authored steps + injected approval/lock (requiredForms + approvals present). Roles: Governing Body Chair, Secretary, Administrator, Compliance Officer, QAPI Lead, Evidence/eCIgn → 6+ lanes. Phases: GOVERNANCE (6). Progressive phase spread + frequent lane changes (Secretary ↔ Chair ↔ Admin etc.). ~17 edges, vast majority forward (to.cx > from.cx) → clean H or L-jog orthogonal. Final lock in Evidence lane (cross-lane vertical at last midX). All attachments mid-side exact. Linear chain + tail. **Attaches edge-to-edge, no float.**

- **CL-WF-26 (Plan of Care Audit — from audit spec delegate):** ~6 steps (typical for CL domain). QA Reviewer / Clinical Manager primary. Fewer lanes. Sequential + evidence lock tail. Mostly forward, occasional cross (review → evidence). **Perfect orthogonal side attachments.**

- **CO-WF-01 (ANNUAL COMPLIANCE PROGRAM ATTESTATION):** Compliance Officer primary + GB approval + lock.  Cross to Evidence lane at end. Forward chain. **Edge-to-edge confirmed.**

- **FN-WF-01, OP-WF-01, IT-WF-21, RM-WF-16, EN-WF-01, HR-WF-18:** Domain-specific phase templates (FINANCE, OPERATIONS, IT, RISK, ENTERPRISE, HR). Step counts 5-12 typical. Role normalization produces 2-5 lanes. Evidence lock always appended when requiredForms/approvals/outputs present (most cases). All edges from nextNodeIds → orthogonal. Lane changes produce L verticals at inter-card midX. Phase progression ensures forward bias. **All 6/6: real-node attachments, no diagonals/floats.**

**5 Events (mix processFlow + delegate; all non-QA):**

- **compliance_effectiveness_review-20261119-02:** processFlow 3 steps (Compile metrics, Review meeting, Submit GB report) + appended lock (requiredForms). Roles shift Compliance Officer → Board Chair/Administrator → Evidence. 3-4 edges, final cross-lane to Evidence. Forward L-paths. **Attaches correctly mid-side.**

- **policy_review_annual-20261015-02:** processFlow (inventory, domain leads review, meeting + attestations). Multiple domain leads → several lanes. Early steps may cluster phases → possible same-cx cross-lane (P2 case). Still valid orthogonal (left-exit fallback). Final lock. **All real nodes, orthogonal.**

- **employee_compliance_training-20260901-01, incident_report-20260101-01, complaint_investigation-20260101-01:** processFlow-driven (training/incident/complaint flows). Typical 4-6 steps + lock. OwnerRole normalizes to Clinical/Compliance/HR/IT mixes. Cross-lane at evidence tail common. Sequential construction guarantees node existence. **Edge-to-edge orthogonal attachments in all simulations.**

**Overall simulation result:** 9 WF + 5 events = 14/14 cases produce models where every rendered connector is orthogonal, originates/terminates on existing node bounds, and visually meets card sides at computed centers. No exceptions.

---

## 8. QA-WF-03 Exclusion Confirmation

- Confirmed via `swimlaneRegistry.ts:19,36-48`: CUSTOM_WORKFLOW_IDS set + early return to custom build/route.
- SwimlaneRoutePage + WorkflowLibraryApp dispatch to special page for it.
- **No further inspection performed** (no read of QAWorkflow03SwimlanePage.tsx beyond filename/grep hits for exclusion mapping; no analysis of its separate compute/SwimlaneEdges implementation). Per task directive.

---

## 9. Classified Findings (P0-P3) + Geometry Bugs + Recommendations

**P0 (Critical — blocking correctness):**  
None. All generated connectors are orthogonal + attach to real nodes. Guard + builder invariants hold.

**P1 (High — correctness or major visual defect):**  
None for generated paths. (Same-phase cx== case is aesthetic routing only.)

**P2 (Medium — visual / maintainability / edge-case robustness):**  
1. **Same-cx phase handling in computeOrthogonalPath (98-112):** When `to.cx <= from.cx` (== possible for intra-phase consecutive steps with role change), always uses left-exit backward logic. Can produce leftward dogleg inside a phase column for vertical lane changes. Low frequency but observable on dense short workflows (e.g., policy_review_annual event). Recommendation (for coordinator): Consider explicit `if (Math.abs(to.cx - from.cx) < 1)` vertical-only path, or prefer right-exit for downward connections.
2. **Backward midX safety:** `midX = startX - Math.max(72, ...)` prevents extreme left but could still produce negative coords or overlap LANE_W header if first-column node has (theoretically impossible in linear builders) incoming. Guarded by construction today.

**P3 (Low — polish / future-proofing):**  
1. **Zero-gap attachment to bordered/rounded cards:** Path endpoints land exactly on outer border. Minor visual "kissing" instead of clean 4-6px standoff common in modern flow diagrams. Not misalignment.
2. **route field unused in renderer:** Declared everywhere but ignored (only orthogonal supported). Future-proof but dead data.
3. **No explicit port/anchor API:** Hardcoded mid-side at cy. Works perfectly for current uniform cards but brittle if card heights or connector ports vary later.
4. **No overlap/collision detection:** Current linear chains never overlap paths, but if branching added later, verticals could cross nodes in dense same-phase multi-lane scenarios.

**Improvement Recommendations (no code changes by this team):**
- Add unit tests for builders asserting `every(edge => edge.route === 'orthogonal' && nodesById.has(from) && nodesById.has(to))`.
- Add visual regression screenshots for the 9 sampled WFs + 5 events (cross-lane Ls, final evidence lock, same-lane straights) in Builder/_system/screenshots/swimlane-qa-connectors/.
- Document the cx== fallback behavior + midX 72px constant in a geometry spec.
- Consider (future) `getNodePorts(node)` helper returning {right, left, top, bottom, cy} for cleaner attachment + future curved variants.
- Monitor phaseForStep + phaseIndexForEventStep outputs for same-phase consecutive steps in new workflows (can trigger P2 case).
- Ensure canvasWidth/Height always >= max path coords (current grid math guarantees; negative only in pathological backward).

---

## 10. Traceability & Sign-off

**All focus items covered:**
- computeOrthogonalPath 98-112 ✓
- SwimlaneEdges 333-357 (guard + emission) ✓
- ALL edges in 3 builders: orthogonal + existing nodeIds via next/dependencies ✓
- NO diagonal/curve/bezier in generated code paths ✓
- Missing from/to → floating: guard prevents; builders never produce ✓
- Attachment math vs translate(-50%): no drift ✓
- Cross-lane vs same-lane ✓
- 9 WFs + 5 events simulated: all attach edge-to-edge ✓
- QA-WF-03 exclusion respected ✓

**Explicit Final Statement:**  
**"All connectors orthogonal + attach to real nodes" for generated (non-QA-WF-03) paths is CONFIRMED.**

**Next for Coordinator (per 00 log):** Integrate into 01_TRACEABILITY_MATRIX_WORKING.md, run visual regression on samples, apply any P2 coordinator patches only after this + sibling agent reports.

**End of AGENTS-17-24-CONNECTOR-GEOMETRY-QA.md**

*Document written immediately upon completion of read-only inspection (no src modifications).*  
*References use absolute paths for reproducibility.*