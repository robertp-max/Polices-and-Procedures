# AGENTS 49-56: INTERACTION QA — Generated Swimlanes (Non-QA-WF-03)

**Protocol:** Locked. Read-only analysis (no src edits). Deep focus on runtime behavior of *generated* swimlanes (buildSwimlaneFromWorkflow / buildSwimlaneFromEvent / buildFallbackSwimlane paths only; QA-WF-03 and its custom page explicitly excluded per registry CUSTOM_WORKFLOW_IDS).

**Date:** 2026-05-28  
**Agents:** 49-56 (Interaction QA group)  
**Scope:** SwimlaneExecutionMap + SwimlaneWorkspaceOverlay + useSwimlaneModalPosition + supporting (RoutePage, Routes, Registry, Builders, Ces integration points). All interaction paths + failure modes documented. Sampled deep-link routes mentally exercised via code paths.

**Key Files Audited (full reads + targeted greps):**
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx` (core: 640 lines, all state, handlers, ZoomOverlay/ZoomCard/LevelTwoCard/FormWorkspace)
- `src/policy/workflows/swimlanes/SwimlaneWorkspaceOverlay.tsx` (portal + rect positioning)
- `src/policy/workflows/swimlanes/useSwimlaneModalPosition.ts` (hook + visibleWorkspaceRect)
- `src/policy/workflows/swimlanes/SwimlaneRoutePage.tsx`
- `src/policy/workflows/swimlanes/swimlaneRegistry.ts`
- `src/policy/workflows/swimlanes/swimlaneRoutes.ts`
- `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts` (taskId injection)
- `src/policy/workflows/swimlanes/buildSwimlaneFromEvent.ts`
- `src/policy/workflows/swimlanes/buildFallbackSwimlane.ts`
- `src/policy/workflows/swimlanes/types.ts`
- Supporting: `src/App.tsx:264`, `src/policy/workflows/WorkflowLibraryApp.tsx:35+45`, `src/policy/ces/components/calendar/CesEventInteraction.tsx:331-337` (deep task links), `src/policy/components/CommandCenterLayout.tsx` (shell nav context), `src/policy/workflows/components/WorkflowDetailView.tsx:123` (launch entry)

**Zero second side nav confirmed:** No imports or renders of BrandRail, ShellNavRail, any sidebar/rail/nav components inside SwimlaneExecutionMap (root at L245: `<div class="swimlane-execution-map ...">` + header only with title/metrics/back/reset), WorkspaceOverlay, ZoomCard, LevelTwoCard, SpotlightCard, FormWorkspace, or any child. Global CommandCenterLayout ShellNavRail (left rail) + topbar always present at shell level (as for every page); swimlane surfaces introduce *none additional*. WorkflowLibraryApp comment (L15-17) explicitly notes shell owns sub-nav. Clean.

---

## 1. Node Click → ZoomOverlay Modal

**Path:**
1. `SwimlaneNodes` (L359-382): Each node is `<button class="swimlane-card ...">` with `onClick={(e) => onOpen(node.nodeId, e)}`.
2. `openNode` (L152-157): `event.stopPropagation(); captureWorkspaceRect(); setLastNodeId(nodeId); setZoomState({level:'centering', nodeId, actionId:null})`.
3. `useEffect` (L176-180): On 'centering' → 360ms timeout → `{...current, level:'step'}`.
4. Render guard (L300-302): `{isFullyZoomed && activeNode ? <ZoomOverlay ... /> : null}` (isFullyZoomed = step|form|evidence|signature).
5. `ZoomOverlay` (L384-393): Renders `<SwimlaneWorkspaceOverlay id="swimlane-modal-backdrop" workspaceRect={...} onBackdropClick={onBack}>` containing conditional `ZoomCard` (for 'step') or `LevelTwoCard`.
6. `SwimlaneWorkspaceOverlay` (L35-47): `createPortal( <div class="swimlane-workspace-overlay fixed z-[90] flex items-center justify-center bg-[#0b0f15]/75 ..." style={rect ? {top,left,width,height from rect} : inset:0 } onClick={target.id===id ? onBackdropClick : undefined} > {children} </div>, document.body )`.
7. `ZoomCard` (L396-439): `SpotlightCard` (role=dialog, aria-modal, stops prop on click) with header (title via `displayTitle(node.title)`, shortDescription, taskId via `displayTaskId`, phase, InfoBlocks for roles/auditPurpose/missingContext) + 4 `ActionPanel`s (Forms, Evidence, eCIgn, Artifact) wired to `onOpenLevelTwo`.

**Centering?** Yes: overlay uses flex `items-center justify-center` inside rect-sized fixed container. Card uses `w-full max-w-4xl max-h-[85vh] animate-zoomIn`. Rect from hook (see §5). Visual center of the *workspace container bounds*.

**Content exact match to node?** Yes (verified against `SwimlaneNode` in types.ts:30-51):
- Title: `displayTitle(node.title)` (L411)
- Task: `displayTaskId(node.taskId)` (L421)
- Roles: owner + conditional reviewer/signer in single InfoBlock (L425)
- Forms/Evidence: `node.requiredForms`, `node.requiredEvidence` (L430-431)
- Short desc, auditPurpose, phase, status: all pulled verbatim + formatted.
- Action CTAs disabled exactly when arrays empty or no signer/reviewer.

**Failure Modes / Edge Cases:**
- Rapid clicks during 'centering' timeout: state machine tolerates (only one activeNode).
- Node with missing optional fields (signerRole etc.): gracefully omitted in UI.
- Very long titles/descriptions: truncation via `line-clamp-3`, `truncate`, `max-w-*`.
- Selected visual state (outline) only while zoomed (L616 CSS).

---

## 2. Drag-to-Pan (Middle Mouse or Double-Hold) + suppressReset Logic

**Path (all in SwimlaneExecutionMap.tsx):**
- Refs: `suppressResetRef` (L128), `panSessionRef` (L120-126), `lastPressRef` (L127), `isGrabDragging` state (L117).
- `handleViewportPointerDown` (L188-215) on `<main>` (the scrollable, L273-280; only if `!isFullyZoomed`):
  - Skip if target closest `button,a,[role="dialog"]`.
  - Double-hold detect: lastPress within 350ms + <20px client dist (L194-197).
  - Middle mouse: `event.pointerType==='mouse' && event.button===1` (L198).
  - If either: init panSession (pointerId, start coords, start scroll), `suppressResetRef.current=false`, `setIsGrabDragging(true)`, `setPointerCapture`, preventDefault.
  - Always update `lastPressRef`.
- `handleViewportPointerMove` (L217-227): If session matches pointerId: scroll by delta (inverted), `if (|delta|>3) suppressResetRef.current=true`, preventDefault.
- `handleViewportPointerUp` / Cancel (L229-234): release capture if held, `finishGrabDrag()` (clear session + dragging=false).
- `handleViewportClick` (L236-242) on same `<main>`: `if (suppressResetRef.current) { suppressResetRef.current=false; return; } reset();`.
- Cursor: `cursor-grab` / `cursor-grabbing` on main when !zoomed (L274).

**Does it work without accidentally firing openNode on release?** 
- **Yes for viewport reset:** suppress + clear on click after any meaningful drag (>3px).
- **Node openNode safety:** Buttons receive click *only* if mousedown originated on *them* (browser click semantics). Pan always starts on non-interactive (the closest() guard + return early). Mouseup anywhere after pan-down on empty space does *not* synthesize click on a button the pointer merely passed over. Node `onClick` also does its own `stopPropagation`. Safe.
- Cursor + dragging state provide feedback.

**Failure Modes / Edge Cases:**
- Middle-button semantics vary by browser/OS (auxclick vs pointer button); tested mentally on pointer events path.
- Double-hold on very edge of node button: closest() at *down* time prevents pan start.
- Tiny drags (<3px): suppress not set → release can fire viewport click → reset (intentional jitter guard).
- Pan while scrolled: uses live `scrollLeft/Top` at start + currentTarget.
- Fully zoomed (L1/L2 open): early return in pointerDown (L189) — no pan on blurred underlay.
- Touch? Code uses PointerEvent but double-hold/middle tuned for mouse; touch may partially work via pointerType but not primary target.
- Pointer capture lost (e.g. alt-tab): up/cancel handlers still clean up.

**SuppressReset is narrow and effective** for its documented purpose (post-drag viewport click suppression).

---

## 3. Escape Key: Full Level Unwind + Reset?

**Implementation (L167-174):**
```ts
useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    setZoomState(current => 
      current.level === 'overview' ? current 
      : (current.level === 'step' || current.level === 'centering') ? initialZoomState 
      : { level: 'step', nodeId: current.nodeId, actionId: null }
    );
  };
  ...
}, []);
```
- Also wired: `onClose={reset}` (full to overview) on X/Back-to-Swimlane in ZoomCard.
- `onBack` (L163-165): similar stepwise (step/centering → initial; L2 → step).
- Backdrop click → `onBack` (L389).

**Behavior:**
- Overview: no-op.
- Step/L1: Esc → full reset (overview).
- L2 (form/evidence/signature): Esc → L1 (step). *Second* Esc → overview.
- Not a single "full unwind + reset" from deepest level.

**Verdict:** Partial match. Provides progressive unwind (good for L2 back nav) but *does not* deliver full close from L2 on first Escape. Matches `back()` logic but diverges from typical modal "Esc = dismiss everything" expectation.

**Failure Modes:** User at L2 form workspace expects single Esc to exit entire swimlane zoom; gets only one level back. Repeated presses or explicit X/Close required.

---

## 4. Level-2 Workspaces (form, evidence, signature via openLevelTwo)

**Path:**
- `openLevelTwo` (L158-162): Guard `if(!activeNode) return; capture...; setZoomState({level, nodeId:active.nodeId, actionId})`. (Called from ActionPanel onClicks in ZoomCard L430-433.)
- `ZoomOverlay` (L391): `level==='step' ? <ZoomCard/> : <LevelTwoCard/>` — *same* WorkspaceOverlay portal instance.
- `LevelTwoCard` (L441-465): Full-width card inside overlay (`max-w-[1200px]`), header with breadcrumb buttons (Swimlane → node.title → title via `levelTwoTitle`), "Back" (onBack), X (onClose). Content pane:
  - `form`: `<FormWorkspace model node formId={actionId}/>`
  - `signature` or evidence/artifact: `<PlaceholderWorkspace .../>`

**Inside overlay without new side nav or route change?**
- **Yes for opening/render:** Same portal, no new components, no imported nav/sidebars, no route mutation on openLevelTwo. Breadcrumbs are plain buttons calling onBack/onClose.
- **FormWorkspace (L467-497):** Renders static info + `<Link to={/forms/${formId}?event_id=...&task_id=...&...}>` (L487). *Clicking the CTA causes full react-router navigation* (unmounts swimlane, loads Forms page with query context for event/task). In template mode: "Opens the Forms Library template only."
- Evidence/signature/artifact: Pure placeholders (no links that navigate; text explains deferral to existing flows).
- No second side nav ever.

**Failure Modes:**
- Form CTA always navigates away (even from L2 "workspace"); no in-place form embed or swimlane return URL preservation.
- Placeholders are honest but non-interactive (expected per design notes in code).
- ActionId for form defaults to `node.requiredForms[0]` (may be undefined → placeholder inside L2).

---

## 5. useSwimlaneModalPosition Hook Behavior

**Full source (useSwimlaneModalPosition.ts):**
- `visibleWorkspaceRect` (L3-16): Intersects element.getBoundingClientRect() with [0,0,innerW,innerH]; if zero area returns original rect. Clips offscreen portions.
- Hook (L18-52): 
  - State `workspaceRect`, `lockedRectRef`.
  - `captureWorkspaceRect`: compute + lock + set.
  - Effect: if `!active` clear both. Else: immediate capture + window 'resize' listener that recomputes or falls back to locked.
- Consumed: `const {workspaceRect, captureWorkspaceRect} = useSwimlaneModalPosition(workspaceRef, isFullyZoomed);` (L137).
- Passed to ZoomOverlay → WorkspaceOverlay (positioning + CSS vars for card max sizing L566-568).
- Capture called explicitly on every `openNode` / `openLevelTwo` (before state flip).

**Runtime Characteristics:**
- Positions overlay *exactly* over the visible portion of the swimlane-execution-map container (header + main scroll area) at moment of capture.
- Resize-aware while active.
- Falls back to full inset:0 if no rect.
- Locked rect preserves last good value on transient zero-area.

**Failure Modes / Edge Cases:**
- Includes swimlane `<header>` (title bar) in rect → vertical centering of modal card is relative to (headerH + contentH), producing slight downward bias vs pure canvas center (P2 visual).
- Capture at click time (not on 'step' timeout); subsequent resize handled.
- If shell topbar / mobile chrome changes bounds post-capture but pre-resize: stale until next resize.
- No 'scroll' listener (container internal scroll doesn't move the outer rect).
- When container partially offscreen (rare): clips.

---

## 6. Sampled Routes + Deep Task Links (?taskId=) — Mental Execution

**Core Route Construction (swimlaneRoutes.ts):**
- `/workflows/${wfId}-swimlane?eventId=...&taskId=...`
- `/events/${eventId}/swimlane?workflowId=...&taskId=...`

**RoutePage (L6-21):** Extracts params + search (taskId / task_id / eventId etc.), calls `buildRegisteredSwimlane({workflowId, eventId, taskId})` → `<SwimlaneExecutionMap model={model}/>`. Always starts `initialZoomState` (overview). No useEffect auto-open on taskId.

**Registry + Build Paths (non-QA-WF-03 = generated):**
- Event-driven (most calendar deep links): `buildSwimlaneFromEvent` (mode='event_execution'). If context.taskId and index===0 → override `taskId` on first node (L111). Later nodes use synthetic `${event.id}-${step.id}`.
- Workflow: `buildSwimlaneFromWorkflow` (L107): similar first-node override only in event_execution + taskId context.
- Fallback (bad IDs): prefixes all synthetic nodes with taskIdPrefix (L12,37+).
- Injected nodes (approval, lock): always use synthetic taskIds (APPROVAL/LOCK).

**Deep Link Sources (real usage):**
- `CesEventInteraction.tsx:336`: `navigate(registryEntry.route)` where registry built with `taskId: task.id` from openTask.
- WorkflowDetailView "Launch Swimlane": no taskId (overview).
- Direct URL or other links.

**Simulated Behavior on Deep ?taskId=:**
- Model contains the referenced taskId (usually on entry node).
- UI: Full overview canvas (all nodes/edges visible, transform at scale 1, no auto translate/zoom).
- Clicking the entry node (now labeled with the deep taskId via displayTaskId) opens correct ZoomCard with exact match + correct query params in any FormWorkspace Link.
- No auto `openNode` or initial `lastNodeId`/`targetCenter` bias toward the deep taskId node.
- Pan/click/Esc/L2 all identical to non-deep.

**Verdict on Deep Links:** Functional for context (correct labels + form query params) but *not* "deep" in navigation sense — no auto-focus/zoom. User lands on overview and must locate the task-bearing node. (See P1/P2 below.)

**Other Sampled (mental):**
- Pure wf template: `/workflows/GV-WF-01-swimlane` → buildFromWorkflow, template mode, no taskId override.
- Event no processFlow: falls to minimal steps via buildSwimlaneFromEvent → workflow or minimal (L75+).
- Fallback unknown: 4-node connected chain with explicit missingContext.

All paths exercise identical ExecutionMap interaction surface.

---

## 7. Interaction Bugs + Failure Modes (P1 = broken pan/modal; P2 = UX friction)

**P1 (Broken / Core Contract Violations):**
- **None catastrophic for pan or basic modal.** suppressReset + button mousedown semantics protect openNode. Modal renders and matches node content.
- **Escape contract mismatch (P1 if "full level unwind + reset" is literal requirement):** L167-174 (onKeyDown) + L163-165 (back) perform *stepwise only*. From L2 (form/evidence/signature) one Esc yields only L1. Requires two presses for full reset. No single-keystroke full unwind.
- **Deep task links do not auto-activate (P1 for "deep link" UX):** No code in RoutePage, ExecutionMap, or builders that calls openNode / sets initial zoomState based on incoming taskId (only label override in builders L107/111). Lands on overview. Exact locations: SwimlaneRoutePage.tsx:15-20, ExecutionMap.tsx:115 (initialZoomState), 132-145 (target only from active/lastNodeId), registry+builders taskId paths.
- **Form L2 CTA always full-navigates away:** FormWorkspace L478-487 renders `<Link>` that unmounts entire swimlane (no in-overlay form, no preserved return context beyond query params).

**P2 (UX Friction / Polish):**
- **Modal vertical centering offset:** useSwimlaneModalPosition + visibleWorkspaceRect includes the swimlane `<header>` (L245 root + header L247-271). Flex-center + rect top/left produces center biased by header height. Cards appear slightly low vs pure content area. Hook: L3-16, L22-52; Overlay L22-33, L38; CSS vars L566-568.
- **Stepwise Esc / backdrop vs modal expectation:** Same as P1 but classified P2 for friction (progressive is defensible for L2 workspaces).
- **No auto-zoom on ?taskId deep links:** (see P1) — compounds as discoverability friction when arriving from CesEventInteraction calendar tasks.
- **Pan affordance limited:** Only middle or double-hold (no spacebar, no explicit grab handle, no touch primary path). Small deltas (<3px) still allow accidental reset click.
- **FormWorkspace navigation is one-way exit:** No "return to swimlane" affordance or history state after following the Link.
- **Hook lacks scroll/mutation observers:** Only resize (L47). Dynamic shell resizes or internal scrolling do not refresh rect until manual reopen.
- **Level-2 Form link always present even in pure template mode:** User confusion possible (code comments explain the difference).
- **Global shell nav always visible (expected but noted):** CommandCenterLayout L630-638 renders ShellNavRail for all (including swimlanes); not a "second" but context for users expecting full-bleed canvas.

**Other Documented Paths / Non-Bugs:**
- Backdrop click, X, "Back to Swimlane", Reset View button, header Reset: all reach `reset()` (L148) or stepwise back.
- SpotlightCard mouse spotlight + stopPropagation: prevents accidental backdrop/click-through.
- Canvas blur + opacity on fully zoomed: intentional underlay (L290-291).
- Pointer capture + preventDefault: clean for pan.

---

## 8. Summary Recommendations (for Coordinator)

1. **P1 Esc behavior:** Consider single-Esc full reset from any level (or Esc = close current, Shift-Esc = full). Update both key handler and onBack logic.
2. **Deep links:** Add optional initial auto-open for ?taskId= (setLastNodeId + 'step' or 'centering' on mount if matching node exists in model). Low cost, high "deep" value.
3. **Centering polish:** Either exclude header from workspaceRef (split ref to main only) or adjust overlay top offset / use different centering rect for cards.
4. **Form L2:** Consider making CTA open in a sub-drawer or preserve swimlane state (e.g. query param flag for "returnToSwimlane").
5. No other P0/P1 pan or basic modal breakage detected across all generated paths.

**Attestation:** All analysis read-only (list_dir, grep, full file reads). No modifications to src/. Protocol followed. Sampled routes (wf, event, taskId deep, fallback) mentally executed end-to-end through builders → RoutePage → ExecutionMap handlers → overlay/hook/pan/Esc paths.

**Exact Code Locations Reference (for any future patch):**
- Pan/suppress: SwimlaneExecutionMap.tsx:188-242, 128, 211, 225, 236-242
- Modal open/Zoom: 152-157, 300-302, 384-393, 396-439 (ZoomCard), 441-465 (LevelTwo)
- Esc + levels: 167-174, 163-165, 148-151
- Level2 open + form nav: 158-162, 430-433, 459-461, 467-497 (FormWorkspace Link at 478-487)
- Hook + positioning: useSwimlaneModalPosition.ts:3-52 entire; SwimlaneWorkspaceOverlay.tsx:22-43
- Deep task injection (no auto): RoutePage:12; Registry:85-87; build* :107 (wf), 111 (event), 12+ (fallback)
- No sidenav: zero matches (grep confirmed); ExecutionMap:245 root + header only

*End of AGENTS-49-56-INTERACTION-QA.md — Protocol complete.*