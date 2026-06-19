import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
// DARK MODE DEFECT FIXES (Agent): scanned swimlanes, hover cards (TaskHoverPreview), modals (ZoomCard/LevelTwo/GlobalModalShell), calendar (TimelineMonth + CesEventInteraction hover/cards).
// Fixed: bg bleed (solid darks -> color-mix glass), low contrast (grays/titles -> isLight branches + v3 primary), title text, overflow (existing clamps + auto).
// Preserved glassmorphism (translucent + blur). Used useIsLight + isLight props everywhere targeted. No broad changes.
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, Copy, ExternalLink, FileSignature, FileText, LockKeyhole, Maximize2, UploadCloud, X } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useIsLight } from '@/policy/stores/uiStore';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import type { SwimlaneFormInstance, SwimlaneModel, SwimlaneNode, SwimlaneStatus } from './types';
import { SwimlaneWorkspaceOverlay } from './SwimlaneWorkspaceOverlay';
import { useSwimlaneModalPosition } from './useSwimlaneModalPosition';
import { useSwimlaneViewportPan } from './useSwimlaneViewportPan';
import { ECIgnSignatureField } from '@/policy/ecign/ECIgnSignatureField';
import { GoogleEvidencePanel, type EvidenceTarget } from '@/policy/components/regulatory/GoogleEvidencePanel';
import { useEcignSignerIdentity } from '@/policy/ecign/signerIdentity';
import { permissionSatisfies, resolveUserPermissionRoles } from '@/policy/ecign/permissionRoles';
import type { ECIgnPermissionRole, SignerRole } from '@/policy/ecign/types';

type ZoomLevel = 'overview' | 'centering' | 'step' | 'form' | 'evidence' | 'signature';

interface ZoomState {
  level: ZoomLevel;
  nodeId: string | null;
  actionId: string | null;
}

const TEAL = '#007970';
const ORANGE = '#E07B2C'; // design #4 teal/orange for all calendar + swimlane
const SWIMLANE_FLOW_SCALE = 1;

const scaled = (value: number) => Math.round(value * SWIMLANE_FLOW_SCALE);
const LAYOUT = {
  COL_WIDTH: 320,
  ROW_HEIGHT: 150,
  NODE_WIDTH: 260,
  NODE_HEIGHT: 110,
  NODE_STACK_GAP: 18,
  HEADER_H: 50,
  LANE_W: 240,
  HEADER_PAD_X: 24,
  CARD_PAD: 16,
  PHASE_FONT: 11,
  ROLE_FONT: 11,
  CORNER_FONT: 10,
  TASK_FONT: 10,
  TITLE_FONT: 14,
  OWNER_FONT: 11,
  STATUS_ICON: 24,
  STATUS_ICON_INNER: 13,
  STATUS_FONT: 9,
  STATUS_PAD_X: 8,
  STATUS_PAD_Y: 4,
  EDGE_GLOW_STROKE: 4,
  EDGE_COMPLETE_STROKE: 2,
  EDGE_NORMAL_STROKE: 1.5,
  EDGE_GLOW_BLUR: 3,
  PREVIEW_WIDTH: 320,
  PREVIEW_MIN_HEIGHT: 180,
  PREVIEW_GAP: 14,
} as const;

const initialZoomState: ZoomState = { level: 'overview', nodeId: null, actionId: null };

function orderIndex(id: string, ids: string[]) {
  return Math.max(0, ids.indexOf(id));
}

function orderedPhases(model: SwimlaneModel) {
  return [...model.phases].sort((a, b) => a.order - b.order);
}

function orderedLanes(model: SwimlaneModel) {
  return [...model.lanes].sort((a, b) => a.order - b.order);
}

function nodeOrder(node: SwimlaneNode) {
  const source = [node.sourceStepId, node.processFlowStepId, node.taskId].filter(Boolean).join(' ');
  const workflowStep = source.match(/(?:workflow-step:|STEP-)(\d+)/i);
  const processStep = source.match(/(?:processFlow:)?(?:step-|ev|t)?(\d+)/i);
  const order = Number.parseInt(workflowStep?.[1] ?? processStep?.[1] ?? '', 10);
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
}

function compareNodes(a: SwimlaneNode, b: SwimlaneNode) {
  const orderDiff = nodeOrder(a) - nodeOrder(b);
  if (orderDiff !== 0) return orderDiff;
  return a.taskId.localeCompare(b.taskId);
}

function cellNodes(model: SwimlaneModel, laneId: string, phaseId: string) {
  return model.nodes
    .filter(node => node.laneId === laneId && node.phaseId === phaseId)
    .sort(compareNodes);
}

function laneStackCount(model: SwimlaneModel, laneId: string) {
  return orderedPhases(model).reduce((max, phase) => Math.max(max, cellNodes(model, laneId, phase.id).length), 1);
}

function laneHeight(model: SwimlaneModel, laneId: string) {
  const stackCount = laneStackCount(model, laneId);
  const stackedHeight = (stackCount * LAYOUT.NODE_HEIGHT)
    + Math.max(0, stackCount - 1) * LAYOUT.NODE_STACK_GAP
    + LAYOUT.NODE_STACK_GAP * 2;
  return Math.max(LAYOUT.ROW_HEIGHT, stackedHeight);
}

function laneTop(model: SwimlaneModel, laneId: string) {
  let top = LAYOUT.HEADER_H;
  for (const lane of orderedLanes(model)) {
    if (lane.id === laneId) return top;
    top += laneHeight(model, lane.id);
  }
  return top;
}

function canvasWidth(model: SwimlaneModel) {
  return LAYOUT.LANE_W + model.phases.length * LAYOUT.COL_WIDTH;
}

function canvasHeight(model: SwimlaneModel) {
  return LAYOUT.HEADER_H + orderedLanes(model).reduce((total, lane) => total + laneHeight(model, lane.id), 0);
}

function routeContextCopy(model: SwimlaneModel) {
  if (model.readOnly) return 'Read-only process visualization';
  return model.mode === 'event_execution'
    ? 'Event-owned visual execution surface'
    : 'Workflow-owned visual execution surface';
}

function backRoute(model: SwimlaneModel) {
  if (model.eventId) return '/calendar';
  if (model.workflowId) return `/workflows/${model.workflowId}`;
  return '/calendar';
}

function backCopy(model: SwimlaneModel) {
  return model.eventId ? 'Back to Calendar' : 'Back to Workflow';
}

function displayTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/\b\w/g, letter => letter.toUpperCase())
    .replace(/\bQapi\b/g, 'QAPI')
    .replace(/\bCms\b/g, 'CMS')
    .replace(/\bHipaa\b/g, 'HIPAA')
    .replace(/\bQa\b/g, 'QA');
}

function displayTaskId(taskId: string) {
  return taskId
    .replace(/-STEP-0*/i, ' · ')
    .replace(/-LOCK$/i, ' · LOCK')
    .replace(/-APPROVAL$/i, ' · APPROVAL')
    .replace(/_/g, '-');
}

function normalizeIdentity(value: string | undefined | null) {
  return String(value ?? '')
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase();
}

function taskAliases(node: SwimlaneNode) {
  const aliases = [node.taskId, node.sourceStepId, node.processFlowStepId].filter(Boolean) as string[];
  const stepMatch = node.taskId.match(/STEP-\d+/i);
  if (node.workflowId && stepMatch) aliases.push(`${node.workflowId}-${stepMatch[0].toUpperCase()}`);
  if (node.eventId && node.processFlowStepId) aliases.push(`${node.eventId}-${node.processFlowStepId}`);
  return aliases;
}

function copyText(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
  void navigator.clipboard.writeText(value);
}

function nodeSupportTasks(node: SwimlaneNode) {
  return node.supportingDocumentationTasks?.length
    ? node.supportingDocumentationTasks
    : node.formInstances?.flatMap(item => item.supportingDocumentation) ?? [];
}

function artifactPackageDetail(node: SwimlaneNode) {
  const hasBlockingRequirements = node.requiredForms.length > 0
    || node.requiredEvidence.length > 0
    || nodeSupportTasks(node).length > 0
    || Boolean((node.signatureTasks?.length ?? 0) > 0 || node.signerRole || node.reviewerRole);
  if (node.status === 'complete' || node.status === 'locked') return 'Artifact package is ready to review for this task.';
  if (node.artifactBlockedReasons?.length) return `Blocked: ${node.artifactBlockedReasons.slice(0, 2).join(' | ')}`;
  if (hasBlockingRequirements) return 'Artifact package will be available after all required forms, evidence, and signatures are complete.';
  return 'Artifact package will be available after all required forms, evidence, and signatures are complete.';
}

function nodeFormInstanceIds(node: SwimlaneNode) {
  const ids = Array.from(new Set((node.formInstances ?? []).map(item => item.formInstanceId).filter(Boolean))) as string[];
  return ids.length ? ids : ['Not assigned'];
}

function workflowAccountabilityCopy(node: SwimlaneNode) {
  const reviewers = node.reviewerRoles?.length ? node.reviewerRoles.join(', ') : node.reviewerRole;
  const signers = node.signatureTasks?.length ? Array.from(new Set(node.signatureTasks.map(task => task.signerRole))).join(', ') : node.signerRole;
  const finalApprovers = node.finalApproverRoles?.length ? node.finalApproverRoles.join(', ') : undefined;
  return [
    `Owner: ${node.ownerRole}`,
    reviewers ? `Reviewer path: ${reviewers}` : undefined,
    signers ? `Signer path: ${signers}` : undefined,
    finalApprovers ? `Final approval: ${finalApprovers}` : undefined,
  ].filter(Boolean).join(' | ');
}

function signatureWorkspaceDetails(node: SwimlaneNode) {
  if (node.signatureTasks?.length) {
    return node.signatureTasks.map(task =>
      `#${task.order} ${task.signerRole}${task.reviewerRole ? ` | reviewer ${task.reviewerRole}` : ''} | ${statusCopy(task.status as SwimlaneStatus)}`,
    );
  }
  return [
    `eventId: ${node.eventId ?? 'missing'}`,
    `taskId: ${node.taskId}`,
    `workflowId: ${node.workflowId ?? 'missing'}`,
  ];
}

function artifactWorkspaceDetails(model: SwimlaneModel, node: SwimlaneNode, mode: 'artifact' | 'evidence') {
  const checklist = node.artifactBlockedReasons?.length
    ? node.artifactBlockedReasons
    : mode === 'artifact'
      ? [artifactPackageDetail(node)]
      : node.requiredEvidence.length
        ? node.requiredEvidence
        : ['No evidence requirement is assigned to this node.'];
  return [
    `eventId: ${model.eventId ?? 'missing'}`,
    `taskId: ${node.taskId}`,
    `workflowId: ${model.workflowId ?? 'missing'}`,
    ...checklist,
  ];
}

function nodeCenter(model: SwimlaneModel, node: SwimlaneNode) {
  const phaseIds = orderedPhases(model).map(phase => phase.id);
  const laneH = laneHeight(model, node.laneId);
  const top = laneTop(model, node.laneId);
  const stack = cellNodes(model, node.laneId, node.phaseId);
  const stackIndex = Math.max(0, stack.findIndex(item => item.nodeId === node.nodeId));
  const totalStackHeight = stack.length * LAYOUT.NODE_HEIGHT + Math.max(0, stack.length - 1) * LAYOUT.NODE_STACK_GAP;
  const stackTop = top + Math.max(0, (laneH - totalStackHeight) / 2);
  return {
    x: LAYOUT.LANE_W + orderIndex(node.phaseId, phaseIds) * LAYOUT.COL_WIDTH + LAYOUT.COL_WIDTH / 2,
    y: stackTop + LAYOUT.NODE_HEIGHT / 2 + stackIndex * (LAYOUT.NODE_HEIGHT + LAYOUT.NODE_STACK_GAP),
  };
}

function nodeBounds(model: SwimlaneModel, node: SwimlaneNode) {
  const center = nodeCenter(model, node);
  return {
    cx: center.x,
    cy: center.y,
    left: center.x - LAYOUT.NODE_WIDTH / 2,
    right: center.x + LAYOUT.NODE_WIDTH / 2,
    top: center.y - LAYOUT.NODE_HEIGHT / 2,
    bottom: center.y + LAYOUT.NODE_HEIGHT / 2,
  };
}

function computeOrthogonalPath(model: SwimlaneModel, fromNode: SwimlaneNode, toNode: SwimlaneNode) {
  const from = nodeBounds(model, fromNode);
  const to = nodeBounds(model, toNode);

  // Pure vertical special case (same column) - match reference behavior for clean attachment
  if (Math.abs(from.cx - to.cx) < 1) {
    const startY = from.cy < to.cy ? from.bottom : from.top;
    const endY = from.cy < to.cy ? to.top : to.bottom;
    return `M ${from.cx} ${startY} L ${to.cx} ${endY}`;
  }

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

export function SwimlaneExecutionMap({ model, initialTaskId }: { model: SwimlaneModel; initialTaskId?: string }) {
  const isLight = useIsLight();
  const isReadOnly = model.readOnly === true;
  // Light defects (swimlanes): use isLight prop down to hover preview + modals + inner panels (titles, facts, forms, evidence, sig). Fixes white text titles (low contrast on light glass), no bg bleed, preserve clean glass. Overflow handled by max-h + auto on previews/modals.
  const [zoomState, setZoomState] = useState<ZoomState>(initialZoomState);
  const [lastNodeId, setLastNodeId] = useState<string | null>(null);
  const [routeFocusNodeId, setRouteFocusNodeId] = useState<string | null>(null);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodeById = useMemo(() => new Map(model.nodes.map(node => [node.nodeId, node])), [model.nodes]);
  const activeNode = zoomState.nodeId ? nodeById.get(zoomState.nodeId) ?? null : null;
  const previewNode = previewNodeId ? nodeById.get(previewNodeId) ?? null : null;
  const isFullyZoomed = zoomState.level === 'step' || zoomState.level === 'form' || zoomState.level === 'evidence' || zoomState.level === 'signature';
  const targetNode = activeNode ?? (lastNodeId ? nodeById.get(lastNodeId) ?? null : null);
  const targetCenter = targetNode ? nodeCenter(model, targetNode) : null;
  const previewScreenPos = (() => {
    if (!previewNode || !canvasRef.current) return null;
    const c = nodeCenter(model, previewNode);
    const parent = canvasRef.current.parentElement;
    const scrollL = parent?.scrollLeft ?? 0;
    const scrollT = parent?.scrollTop ?? 0;
    const cr = canvasRef.current.getBoundingClientRect();
    // node's center position in window viewport coords (accounts for scroll + canvas offset); enables true viewport flip
    return { x: cr.left + (c.x - scrollL), y: cr.top + (c.y - scrollT) };
  })();
  const formCount = new Set(model.nodes.flatMap(node => node.requiredForms)).size;
  const evidenceCount = new Set(model.nodes.flatMap(node => node.requiredEvidence)).size;
  const signerCount = model.nodes.reduce((count, node) => count + (node.signatureTasks?.length ?? (node.signerRole || node.reviewerRole ? 1 : 0)), 0);
  const { workspaceRect, captureWorkspaceRect } = useSwimlaneModalPosition(workspaceRef, isFullyZoomed);
  const canvasTransform = (() => {
    if (!targetCenter || zoomState.level === 'overview') return 'translate3d(0px, 0px, 0px) scale(1)';
    const viewport = canvasRef.current?.parentElement;
    const viewportW = viewport?.clientWidth ?? (typeof window === 'undefined' ? 1200 : window.innerWidth);
    const viewportH = viewport?.clientHeight ?? (typeof window === 'undefined' ? 800 : window.innerHeight);
    const translateX = (viewport?.scrollLeft ?? 0) + viewportW / 2 - targetCenter.x;
    const translateY = (viewport?.scrollTop ?? 0) + viewportH / 2 - targetCenter.y;
    return `translate3d(${translateX}px, ${translateY}px, 0px) scale(${isFullyZoomed ? 2.8 : 1})`;
  })();

  const reset = useCallback(() => {
    setZoomState(initialZoomState);
    setLastNodeId(null);
    setRouteFocusNodeId(null);
    setPreviewNodeId(null);
  }, []);
  const {
    isGrabDragging,
    handleViewportClick,
    handleViewportPointerDown,
    handleViewportPointerMove,
    handleViewportPointerUp,
  } = useSwimlaneViewportPan({
    disabled: isFullyZoomed,
    onBackgroundClick: reset,
  });
  const openNode = (nodeId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPreviewNodeId(null);
    setRouteFocusNodeId(null);
    captureWorkspaceRect();
    setLastNodeId(nodeId);
    setZoomState({ level: 'centering', nodeId, actionId: null });
  };
  const openLevelTwo = (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId: string | null = null) => {
    if (!activeNode) return;
    captureWorkspaceRect();
    setZoomState({ level, nodeId: activeNode.nodeId, actionId });
  };
  const back = () => {
    setZoomState(current => (current.level === 'step' || current.level === 'centering' ? initialZoomState : { level: 'step', nodeId: current.nodeId, actionId: null }));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Simpler rule per known QA P1 fix: Escape always fully closes zoom stack back to overview
      setZoomState(initialZoomState);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (zoomState.level !== 'centering') return undefined;
    const timer = window.setTimeout(() => setZoomState(current => (current.level === 'centering' ? { ...current, level: 'step' } : current)), 360);
    return () => window.clearTimeout(timer);
  }, [zoomState.level]);

  // Deep taskId focus only. The full task-detail modal opens from an explicit card click.
  useEffect(() => {
    if (!initialTaskId) {
      setRouteFocusNodeId(null);
      return;
    }
    const normalizedInitialTaskId = normalizeIdentity(initialTaskId);
    const matchingNode = model.nodes.find(node => taskAliases(node).some(alias => {
      const normalizedAlias = normalizeIdentity(alias);
      return normalizedAlias === normalizedInitialTaskId
        || normalizedAlias.includes(normalizedInitialTaskId)
        || normalizedInitialTaskId.includes(normalizedAlias);
    }));
    if (matchingNode) {
      setLastNodeId(matchingNode.nodeId);
      setRouteFocusNodeId(matchingNode.nodeId);
      setZoomState(initialZoomState);
      window.requestAnimationFrame(() => {
        const viewport = canvasRef.current?.parentElement;
        if (!viewport) return;
        const center = nodeCenter(model, matchingNode);
        viewport.scrollTo({
          left: Math.max(0, center.x - viewport.clientWidth / 2),
          top: Math.max(0, center.y - viewport.clientHeight / 2),
          behavior: 'auto',
        });
      });
    }
  }, [initialTaskId, model.nodes]); // run once model is stable

  return (
    <div ref={workspaceRef} data-workflow-execution data-live-data="regulatory-events" data-read-only={isReadOnly ? 'true' : 'false'} className="swimlane-execution-map relative flex h-full w-full flex-col overflow-hidden overflow-x-hidden contain-paint" style={{ border: 'none', background: 'transparent', padding: 0, isolation: 'isolate' }}>
      <style>{SWIMLANE_CSS}</style>
      {/* Header controls; per Agent 13 full bleed task (coord w/ Agent 5): main canvas below fills entire remaining screen area, no borders */}
      <header className="shrink-0 px-7 py-4 border-b overflow-hidden" style={{ background: 'transparent', border: 'none' }}>
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full border border-[var(--v3-teal)]/35 bg-[var(--v3-teal)]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--v3-teal-light)]">
                {isReadOnly ? 'Read-only process visualization' : model.mode === 'event_execution' ? 'Event Execution' : 'Workflow Template'}
              </span>
              {isReadOnly && model.completionPercent != null ? (
                <span className="rounded-full border border-[var(--v3-orange)]/35 bg-[var(--v3-orange)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--v3-orange-light)]">
                  {model.completionPercent}% complete
                </span>
              ) : null}
              <span className="text-[12px] font-semibold text-[var(--v3-text-secondary)]">{routeContextCopy(model)}</span>
            </div>
            <h1 className="truncate text-[25px] font-semibold tracking-[-0.01em] text-[var(--v3-text-primary)]">{displayTitle(model.title)}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            {model.completionPercent != null ? <HeaderMetric value={`${model.completionPercent}%`} label="completion" /> : null}
            <HeaderMetric value={String(formCount)} label="linked forms" />
            <HeaderMetric value={String(evidenceCount)} label="evidence requirements" />
            <HeaderMetric value={String(signerCount)} label="signer/reviewer paths" />
            <Link to={backRoute(model)} className="inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-[12px] font-bold text-[var(--v3-text-primary)]/82 transition-colors hover:border-[var(--v3-teal)]/70 hover:text-white">
              <ArrowLeft size={14} />
              {backCopy(model)}
            </Link>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-[var(--v3-orange)]/38 px-4 py-2 text-[12px] font-bold text-[var(--v3-orange-light)] transition-colors hover:border-[var(--v3-orange)] hover:text-white">
              Reset View
            </button>
          </div>
        </div>
      </header>

      <main
        className={`relative min-h-0 flex-1 select-none overflow-auto custom-scrollbar overflow-hidden ${isFullyZoomed ? '' : isGrabDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleViewportClick}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={handleViewportPointerUp}
        style={{ padding: 0, margin: 0, border: 'none', background: 'transparent', contain: 'layout style paint' }} /* full bleed canvas, clean light no dark bleed */
      >
        <div
          ref={canvasRef}
          className="swimlane-canvas relative transition-[opacity,filter,transform] duration-[720ms] overflow-hidden contain-paint"
          style={{
            width: canvasWidth(model),
            height: canvasHeight(model),
            background: 'transparent',
            '--canvas-transform': canvasTransform,
            '--canvas-origin': targetCenter && zoomState.level !== 'overview' ? `${targetCenter.x}px ${targetCenter.y}px` : '0 0',
            transitionDuration: zoomState.level === 'overview' ? '0ms' : '400ms',
            opacity: isFullyZoomed ? 0.2 : 1,
            filter: isFullyZoomed ? 'blur(5px)' : 'blur(0px)',
            border: 'none',
            isolation: 'isolate',
          } as CSSProperties}
        >
          <SwimlaneGrid model={model} isLight={isLight} />
          <SwimlaneEdges model={model} nodeById={nodeById} isLight={isLight} />
          <SwimlaneNodes
            model={model}
            selectedNodeId={zoomState.nodeId ?? routeFocusNodeId}
            onOpen={openNode}
            onPreview={setPreviewNodeId}
            onClearPreview={() => setPreviewNodeId(null)}
            isLight={isLight}
          />
          {!isFullyZoomed && previewNode ? <TaskHoverPreview model={model} node={previewNode} isLight={isLight} previewScreenPos={previewScreenPos} /> : null}
        </div>
      </main>

      {isFullyZoomed && activeNode ? (
        <ZoomOverlay model={model} node={activeNode} zoomState={zoomState} workspaceRect={workspaceRect} onClose={reset} onBack={back} onOpenLevelTwo={openLevelTwo} isLight={isLight} />
      ) : null}
    </div>
  );
}

function SwimlaneGrid({ model, isLight = false }: { model: SwimlaneModel; isLight?: boolean }) {
  const phases = orderedPhases(model);
  const lanes = orderedLanes(model);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {phases.map((phase, index) => (
        <div key={phase.id} className="absolute top-0 h-full border-r swimlane-phase-col overflow-hidden contain-paint" style={{ left: LAYOUT.LANE_W + index * LAYOUT.COL_WIDTH, width: LAYOUT.COL_WIDTH, borderColor: 'var(--v3-border-subtle)', background: 'transparent' }}>
          <div className="z-20 flex items-center border-b swimlane-phase-col overflow-hidden" style={{ height: LAYOUT.HEADER_H, paddingInline: LAYOUT.HEADER_PAD_X, borderColor: 'var(--v3-border-subtle)', background: 'transparent' }}>
            <span className="font-bold uppercase leading-tight tracking-[0.12em] text-[var(--v3-text-secondary)]" style={{ fontSize: LAYOUT.PHASE_FONT }}>{phase.title}</span>
          </div>
        </div>
      ))}
      {lanes.map(lane => (
        <div key={lane.id} className="absolute left-0 w-full border-b border-[var(--v3-border-subtle)] overflow-hidden" style={{ top: laneTop(model, lane.id), height: laneHeight(model, lane.id), background: 'transparent' }}>
          <div className="z-20 flex h-full items-center border-r swimlane-lane-header overflow-hidden contain-paint" style={{ width: LAYOUT.LANE_W, paddingInline: LAYOUT.HEADER_PAD_X, background: isLight ? 'var(--ci-surface, #fff)' : 'transparent' }}>
            <span className="font-bold uppercase leading-snug tracking-[0.1em] text-[var(--v3-text-secondary)]" style={{ fontSize: LAYOUT.ROLE_FONT }}>{lane.title}</span>
          </div>
        </div>
      ))}
      <div className="absolute left-0 top-0 z-30 flex items-center border-b border-r swimlane-corner overflow-hidden contain-paint" style={{ width: LAYOUT.LANE_W, height: LAYOUT.HEADER_H, paddingInline: LAYOUT.HEADER_PAD_X, borderColor: 'var(--v3-border-subtle)', background: isLight ? 'var(--ci-surface, #fff)' : 'transparent' }}>
        <span className="font-bold uppercase leading-tight tracking-[0.12em] text-[var(--v3-text-tertiary)]" style={{ fontSize: LAYOUT.CORNER_FONT }}>{model.workflowId ?? model.eventId ?? 'Swimlane'} Roles</span>
      </div>
    </div>
  );
}

function SwimlaneEdges({ model, nodeById, isLight = false }: { model: SwimlaneModel; nodeById: Map<string, SwimlaneNode>; isLight?: boolean }) {
  return (
    <svg className="absolute left-0 top-0 z-10 h-full w-full pointer-events-none" width={canvasWidth(model)} height={canvasHeight(model)} viewBox={`0 0 ${canvasWidth(model)} ${canvasHeight(model)}`} aria-hidden="true">
      <defs>
        <marker id="swimlane-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="var(--v3-text-tertiary)" /></marker>
        <marker id="swimlane-arrow-teal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={TEAL} /></marker>
        <marker id="swimlane-arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={ORANGE} /></marker>
      </defs>
      {model.edges.map(edge => {
        const fromNode = nodeById.get(edge.fromNodeId);
        const toNode = nodeById.get(edge.toNodeId);
        if (!fromNode || !toNode) return null;
        const completed = (fromNode.status === 'complete' || fromNode.status === 'locked') && (toNode.status === 'complete' || toNode.status === 'locked');
        const finalEdge = toNode.status === 'locked' || /lock|package/i.test(toNode.title);
        const stroke = finalEdge ? ORANGE : completed ? TEAL : (isLight ? '#64748B' : 'var(--v3-text-tertiary)');
        return (
          <g key={`${edge.fromNodeId}-${edge.toNodeId}`}>
            {completed ? <path d={computeOrthogonalPath(model, fromNode, toNode)} stroke={stroke} strokeWidth={LAYOUT.EDGE_GLOW_STROKE} fill="none" className={finalEdge ? 'edge-radiate-orange' : 'edge-radiate-teal'} style={{ filter: `blur(${LAYOUT.EDGE_GLOW_BLUR}px)` }} /> : null}
            <path d={computeOrthogonalPath(model, fromNode, toNode)} stroke={stroke} strokeOpacity={completed ? 0.95 : 0.62} strokeWidth={completed ? LAYOUT.EDGE_COMPLETE_STROKE : LAYOUT.EDGE_NORMAL_STROKE} fill="none" markerEnd={finalEdge ? 'url(#swimlane-arrow-orange)' : completed ? 'url(#swimlane-arrow-teal)' : 'url(#swimlane-arrow)'} />
          </g>
        );
      })}
    </svg>
  );
}

function SwimlaneNodes({
  model,
  selectedNodeId,
  onOpen,
  onPreview,
  onClearPreview,
  isLight = false,
}: {
  model: SwimlaneModel;
  selectedNodeId: string | null;
  onOpen: (nodeId: string, event: MouseEvent<HTMLButtonElement>) => void;
  onPreview: (nodeId: string) => void;
  onClearPreview: () => void;
  isLight?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-20">
      {model.nodes.map(node => {
        const center = nodeCenter(model, node);
        const completed = node.status === 'complete' || node.status === 'locked';
        const finalNode = node.status === 'locked' || /lock|package/i.test(node.title);
        const blocked = node.status === 'blocked';
        const unavailable = node.status === 'unavailable';
        const accented = !completed && !blocked && !unavailable;
        return (
          <button
            key={node.nodeId}
            type="button"
            aria-label={node.title}
            className={['swimlane-card swimlane-node-card absolute flex flex-col text-left outline-none transition-transform duration-300 overflow-hidden contain-paint isolate', accented ? 'accent-node' : '', blocked ? 'blocked-node' : '', unavailable ? 'unavailable-node' : '', completed && !finalNode ? 'completed-node' : '', completed && finalNode ? 'orange-completed-node' : '', node.nodeId === selectedNodeId ? 'selected-node' : ''].filter(Boolean).join(' ')}
            style={{ left: center.x, top: center.y, width: LAYOUT.NODE_WIDTH, height: LAYOUT.NODE_HEIGHT, padding: LAYOUT.CARD_PAD, transform: 'translate(-50%, -50%)', borderRadius: '8px', background: isLight ? 'var(--ci-surface, #F8FAF9)' : 'var(--v3-surface)' }}
            onMouseEnter={() => onPreview(node.nodeId)}
            onFocus={() => onPreview(node.nodeId)}
            onMouseLeave={onClearPreview}
            onBlur={onClearPreview}
            onClick={(event) => onOpen(node.nodeId, event)}
          >
            <span className="mb-1 flex items-start justify-between" style={{ gap: Math.max(6, scaled(12)) }}>
              <span className="min-w-0 truncate font-mono font-bold uppercase tracking-[0.06em] swimlane-node-meta" style={{ fontSize: LAYOUT.TASK_FONT }}>{displayTaskId(node.taskId)}</span>
              <NodeStatusBadge status={node.status} />
            </span>
            <span className="line-clamp-2 font-semibold leading-tight text-[var(--v3-text-primary)] truncate" style={{ fontSize: LAYOUT.TITLE_FONT }} aria-label={node.title}>{displayTitle(node.title)}</span>
            <span className="mt-auto truncate font-semibold swimlane-node-meta" style={{ fontSize: LAYOUT.OWNER_FONT }} aria-label={node.ownerRole}>{node.ownerRole}</span>
          </button>
        );
      })}
    </div>
  );
}

function TaskHoverPreview({ model, node, isLight = false, previewScreenPos = null }: { model: SwimlaneModel; node: SwimlaneNode; isLight?: boolean; previewScreenPos?: { x: number; y: number } | null }) {
  // DARK MODE FIX (hover card): isLight checks + color-mix glass bg (not solid) to prevent bg bleed,
  // preserve glass effect + backdrop blur, ensure title contrast + no low-contrast muted text.
  // Targeted for swimlane hover previews. Overflow prevented via line-clamp + auto scroll.
  const center = nodeCenter(model, node);
  const phase = model.phases.find(item => item.id === node.phaseId)?.title ?? node.phaseId;
  const formCount = node.formInstances?.length ?? node.requiredForms.length;
  const supportCount = nodeSupportTasks(node).length;
  const signatureCount = node.signatureTasks?.length ?? (node.signerRole || node.reviewerRole ? 1 : 0);
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1400;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const offset = 12;
  const previewW = LAYOUT.PREVIEW_WIDTH;
  const previewMinH = LAYOUT.PREVIEW_MIN_HEIGHT;
  // Use window viewport + screen position of node (from parent calc) for accurate placement even when scrolled.
  // Flip left/right then up/down based on available space.
  const nodeCx = previewScreenPos ? previewScreenPos.x : center.x;
  const nodeCy = previewScreenPos ? previewScreenPos.y : center.y;
  const nLeft = nodeCx - LAYOUT.NODE_WIDTH / 2;
  const nRight = nodeCx + LAYOUT.NODE_WIDTH / 2;
  const nTop = nodeCy - LAYOUT.NODE_HEIGHT / 2;
  // Prefer right of card
  let left = nRight + offset;
  let top = nTop;
  if (left + previewW > viewportW - 8) {
    // flip to left of card
    left = nLeft - offset - previewW;
  }
  if (left < 8) left = 8;
  if (left + previewW > viewportW - 8) left = Math.max(8, viewportW - previewW - 8);
  // vertical flip up/down
  if (top + previewMinH > viewportH - 8) {
    // try above the node
    const above = nTop - offset - previewMinH;
    if (above >= 8) {
      top = above;
    } else {
      top = Math.max(8, viewportH - previewMinH - 8);
    }
  }
  if (top < 8) top = 8;
  if (top + previewMinH > viewportH - 8) {
    top = Math.max(8, viewportH - previewMinH - 8);
  }

  return (
    <div
      role="tooltip"
      className={`swimlane-hover-preview pointer-events-none z-50 rounded-lg border border-[var(--v3-border-subtle)] p-4 text-left shadow-2xl shadow-black/35 ${isLight ? 'ring-1 ring-black/5' : 'ring-1 ring-white/5'} backdrop-blur-xl overflow-hidden contain-paint isolate`}
      style={{
        position: 'fixed',
        left,
        top,
        width: previewW,
        minHeight: previewMinH,
        maxHeight: Math.min(380, Math.max(220, viewportH - 32)),
        overflow: 'auto',
        background: isLight
          ? 'var(--ci-surface, #fff)'
          : 'color-mix(in srgb, var(--v3-base-bg) 78%, transparent)',
        borderRadius: '8px',
        borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)',
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--v3-teal-light)]">{displayTaskId(node.taskId)}</div>
          <div className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--v3-text-primary)]">{displayTitle(node.title)}</div>
        </div>
        <NodeStatusBadge status={node.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <PreviewFact label="Status" value={displayTitle(statusCopy(node.status))} isLight={isLight} />
        <PreviewFact label="Phase" value={phase} isLight={isLight} />
        <PreviewFact label="Owner" value={node.ownerRole} isLight={isLight} />
        <PreviewFact label="Forms" value={String(formCount)} isLight={isLight} />
        <PreviewFact label="Evidence" value={String(node.requiredEvidence.length + supportCount)} isLight={isLight} />
        <PreviewFact label="Signers" value={String(signatureCount)} isLight={isLight} />
      </div>
      <div
        className="mt-3 rounded-xl border p-3"
        style={{
          borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)',
          background: isLight ? 'var(--ci-surface-muted, #F4F4F2)' : 'rgba(255,255,255,0.03)',
        }}
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)' }}>Accountability</div>
        <p className="mt-1 line-clamp-3 text-[11px] leading-5" style={{ color: isLight ? 'var(--ci-text-muted-2, #52404B)' : 'var(--ci-text-muted-2)' }}>{workflowAccountabilityCopy(node)}</p>
      </div>
      <p className="mt-3 line-clamp-2 text-[11px] leading-5" style={{ color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)' }}>{node.shortDescription}</p>
    </div>
  );
}

function PreviewFact({ label, value, isLight = false }: { label: string; value: string; isLight?: boolean }) {
  return (
    <div
      className="min-w-0 rounded-lg border px-2.5 py-2"
      style={{
        borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)',
        background: isLight ? 'var(--ci-surface-muted, #F4F4F2)' : 'rgba(255,255,255,0.025)',
      }}
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)' }}>{label}</div>
      <div className="mt-1 truncate text-[11px] font-semibold" style={{ color: isLight ? 'var(--ci-text-muted-2, #52404B)' : 'var(--ci-text-muted-2)' }} aria-label={value}>{value}</div>
    </div>
  );
}

function ZoomOverlay({ model, node, zoomState, workspaceRect, onClose, onBack, onOpenLevelTwo, isLight = false }: { model: SwimlaneModel; node: SwimlaneNode; zoomState: ZoomState; workspaceRect: DOMRect | null; onClose: () => void; onBack: () => void; onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void; isLight?: boolean }) {
  return (
    <SwimlaneWorkspaceOverlay
      id="swimlane-modal-backdrop"
      workspaceRect={workspaceRect}
      onBackdropClick={onBack}
    >
      {zoomState.level === 'step' ? <ZoomCard model={model} node={node} onClose={onClose} onOpenLevelTwo={onOpenLevelTwo} isLight={isLight} /> : <LevelTwoCard model={model} node={node} zoomState={zoomState} onBack={onBack} onClose={onClose} isLight={isLight} />}
    </SwimlaneWorkspaceOverlay>
  );
}

function ZoomCard({ model, node, onClose, onOpenLevelTwo, isLight = false }: { model: SwimlaneModel; node: SwimlaneNode; onClose: () => void; onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void; isLight?: boolean }) {
  const phase = model.phases.find(item => item.id === node.phaseId)?.title ?? node.phaseId;
  const supportTasks = nodeSupportTasks(node);
  return (
    <SpotlightCard className="zoom-card-shell swimlane-zoom-modal w-full max-w-4xl animate-zoomIn overflow-hidden isolate" role="dialog" aria-modal="true">
      <header
        className="shrink-0 border-b px-8 py-6 backdrop-blur-md"
        style={{
          borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)',
          background: isLight ? 'color-mix(in srgb, var(--ci-surface) 95%, transparent)' : 'color-mix(in srgb, var(--v3-base-bg) 88%, transparent)',
        }}
      >
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors"
                style={{
                  background: isLight ? 'var(--ci-surface-muted, #F4F4F2)' : 'rgba(255,255,255,0.06)',
                  color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isLight ? 'var(--ci-border, #E5E4E3)' : 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isLight ? 'var(--ci-surface-muted, #F4F4F2)' : 'rgba(255,255,255,0.06)'; }}
              >
                <ArrowLeft size={12} />Back to Swimlane
              </button>
              <span className="text-xs" style={{ color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)' }}>/</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: isLight ? 'var(--ci-link, #007970)' : 'var(--v3-teal-light)' }}>
                <Maximize2 size={10} />
                Zoom Level 1: Step Focus
              </span>
            </div>
            <h2 className="text-2xl font-semibold leading-tight" style={{ color: 'var(--v3-text-primary)' }}>{displayTitle(node.title)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: isLight ? 'var(--ci-text-muted-2, #52404B)' : 'var(--ci-text-muted-2)' }}>{node.shortDescription}</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 rounded-lg p-2 transition-colors" style={{ color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)' }} aria-label="Close"><X size={20} /></button>
        </div>
      </header>
      <div className="swimlane-modal-scroll flex-1 p-8" style={{ background: isLight ? 'var(--ci-bg, #FAFBF8)' : 'transparent' }}>
        <div className="swimlane-modal-content-grid">
          <div className="swimlane-modal-primary space-y-5">
            <div className="flex flex-wrap gap-x-7 gap-y-2">
              <HeaderMetric value={displayTitle(statusCopy(node.status))} label="status" />
              <HeaderMetric value={phase} label="phase" />
            </div>
            <IdentityPanel model={model} node={node} />
            <InfoBlock title="Workflow Accountability" body={workflowAccountabilityCopy(node)} />
            <InfoBlock title="Compliance Audit Purpose" body={node.auditPurpose} accent />
            <InstructionPanel instructions={node.instructions} />
            {model.missingContext?.length ? <InfoBlock title="Missing Context Indicators" body={model.missingContext.join(' | ')} /> : null}
          </div>
          <div className="swimlane-modal-aside space-y-4">
            <FormInstancesPanel model={model} node={node} onOpenLevelTwo={onOpenLevelTwo} isLight={isLight} />
            <SupportingDocumentationPanel tasks={supportTasks} isLight={isLight} />
            <SupportingEvidencePanel evidence={node.requiredEvidence} isLight={isLight} />
            <ActionPanel icon={<UploadCloud size={16} />} title="Supporting Evidence" detail={node.requiredEvidence.length ? 'Review required evidence and linked documentation for this task.' : 'No supporting evidence required for this task.'} disabled={!node.requiredEvidence.length} onClick={() => onOpenLevelTwo('evidence', 'evidence')} cta={model.readOnly ? 'View Evidence Status' : 'Open Evidence Workspace'} />
            <ActionPanel icon={<FileSignature size={16} />} title="eCIgn Ceremony" detail={node.signatureTasks?.length ? `${node.signatureTasks.length} deterministic signer task${node.signatureTasks.length === 1 ? '' : 's'} resolved.` : node.signerRole ? `Requires: ${node.signerRole}` : node.reviewerRole ? `Reviewer: ${node.reviewerRole}` : 'No signature path assigned'} disabled={!(node.signatureTasks?.length || node.signerRole || node.reviewerRole || model.ecignStatus)} onClick={() => onOpenLevelTwo('signature', 'sign')} cta={model.readOnly ? 'View Signature Status' : 'Show Signature Path'} />
            <ActionPanel icon={<LockKeyhole size={16} />} title="Artifact Package" detail={artifactPackageDetail(node)} onClick={() => onOpenLevelTwo('evidence', 'artifact')} cta={model.readOnly ? 'View Artifact Status' : 'Open Artifact Workspace'} />
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function LevelTwoCard({ model, node, zoomState, onBack, onClose, isLight = false }: { model: SwimlaneModel; node: SwimlaneNode; zoomState: ZoomState; onBack: () => void; onClose: () => void; isLight?: boolean }) {
  return (
    <SpotlightCard className="level-two-workspace swimlane-level-two-modal w-full max-w-[1200px] overflow-hidden animate-zoomInDeeper isolate" role="dialog" aria-modal="true">
      <header
        className="flex shrink-0 items-center justify-between gap-4 border-b px-7 py-5 backdrop-blur-md"
        style={{
          borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)',
          background: isLight ? 'color-mix(in srgb, var(--ci-surface) 95%, transparent)' : 'color-mix(in srgb, var(--v3-base-bg) 88%, transparent)',
        }}
      >
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[12px]" style={{ color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)' }}>
            <button type="button" onClick={onClose} className="hover:opacity-80" style={{ color: isLight ? 'var(--ci-text-primary)' : 'var(--ci-text-primary)' }}>Swimlane</button>
            <ChevronRight size={13} />
            <button type="button" onClick={onBack} className="truncate hover:opacity-80" style={{ color: isLight ? 'var(--ci-text-primary)' : 'var(--ci-text-primary)' }}>{node.title}</button>
          </div>
          <h2 className="text-[25px] font-semibold" style={{ color: 'var(--v3-text-primary)' }}>{levelTwoTitle(zoomState)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors"
            style={{
              borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)',
              color: isLight ? 'var(--ci-text-muted-2, #52404B)' : 'var(--ci-text-muted-2)',
            }}
          >
            Back
          </button>
          <button type="button" onClick={onClose} className="rounded-full border p-2 transition-colors" style={{ borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)', color: isLight ? 'var(--ci-text-subtle, #747474)' : 'var(--ci-text-subtle)' }} aria-label="Close"><X size={18} /></button>
        </div>
      </header>
      <div className="swimlane-modal-scroll flex-1 p-8" style={{ background: isLight ? 'var(--ci-bg, #FAFBF8)' : 'transparent' }}>
        {zoomState.level === 'form' ? <FormWorkspace model={model} node={node} formId={zoomState.actionId} />
          : zoomState.level === 'signature' ? (
            <SignatureWorkspace model={model} node={node} isLight={isLight} />
          ) : (
            <EvidenceArtifactWorkspace model={model} node={node} mode={zoomState.actionId === 'artifact' ? 'artifact' : 'evidence'} zoomState={zoomState} />
          )}
      </div>
    </SpotlightCard>
  );
}

function EvidenceArtifactWorkspace({ model, node, mode, zoomState }: { model: SwimlaneModel; node: SwimlaneNode; mode: 'artifact' | 'evidence'; zoomState: ZoomState }) {
  const isEventExecution = model.mode === 'event_execution' && !!model.eventId;
  const targets: EvidenceTarget[] = [];

  if (model.readOnly) {
    return (
      <PlaceholderWorkspace
        icon={mode === 'artifact' ? <LockKeyhole size={28} /> : <UploadCloud size={28} />}
        title={mode === 'artifact' ? 'Read-only artifact status' : 'Read-only evidence status'}
        body="This full swimlane is a visualization only. Evidence uploads and artifact package actions are handled from the Event Execution Cockpit."
        details={[
          `eventId: ${model.eventId ?? 'missing'}`,
          `taskId: ${node.taskId}`,
          `completion: ${model.completionPercent ?? 0}%`,
          `evidence: ${model.evidenceAttachedCount ?? 0} / ${model.evidenceCount ?? node.requiredEvidence.length}`,
          `calendar: ${model.calendarAttachmentStatus ?? 'Unknown'}`,
          `drive: ${model.driveLinked ? 'Linked' : 'Not linked'}`,
          ...artifactWorkspaceDetails(model, node, mode),
        ]}
      />
    );
  }

  if (isEventExecution) {
    if (mode === 'evidence') {
      for (const support of node.supportingDocumentationTasks ?? []) {
        targets.push({
          key: support.supportTaskId,
          label: support.title,
          category: 'supporting_documentation',
          taskId: node.taskId,
          formId: support.formId || undefined,
          formInstanceId: support.formInstanceId,
          evidenceRequirementId: support.evidenceRequirementId,
          supportTaskId: support.supportTaskId,
          required: support.required,
        });
      }
      for (const fi of node.formInstances ?? []) {
        if (!fi.formInstanceId) continue;
        targets.push({
          key: `formreq-${fi.formInstanceId}`,
          label: `Form evidence — ${fi.formTitle}`,
          category: 'form_instance',
          taskId: node.taskId,
          formId: fi.formId,
          formInstanceId: fi.formInstanceId,
        });
      }
      targets.push({
        key: `overview-${node.taskId}`,
        label: 'General task evidence',
        category: 'overview',
        taskId: node.taskId,
      });
    } else {
      // Artifact mode: signed artifacts + eCIgn certificates.
      targets.push({
        key: `signed-${node.taskId}`,
        label: 'Signed form artifact (PDF)',
        category: 'signed_artifact',
        taskId: node.taskId,
      });
      targets.push({
        key: `cert-${node.taskId}`,
        label: 'eCIgn certificate (PDF)',
        category: 'ecign_certificate',
        taskId: node.taskId,
      });
      targets.push({
        key: `package-${node.taskId}`,
        label: 'Final evidence package',
        category: 'final_package',
        taskId: node.taskId,
      });
    }
  }

  return (
    <div className="space-y-6">
      <GoogleEvidencePanel
        eventId={isEventExecution ? model.eventId : undefined}
        workflowId={model.workflowId}
        targets={targets}
        title={mode === 'artifact' ? 'Signed Artifacts & Certificates' : 'Supporting Evidence'}
      />
      <PlaceholderWorkspace
        icon={mode === 'artifact' ? <LockKeyhole size={28} /> : <UploadCloud size={28} />}
        title={isEventExecution ? 'Evidence & Artifact Requirements' : levelTwoTitle(zoomState)}
        body={isEventExecution
          ? 'Upload evidence above. Files are stored in the event\u2019s Google Drive folder and attached to the matching Calendar event. The app remains the source of truth for task/form/evidence status.'
          : 'Template mode lists evidence and artifact requirements without creating execution workspaces.'}
        details={artifactWorkspaceDetails(model, node, mode)}
      />
    </div>
  );
}

function FormWorkspace({ model, node, formId, isLight = false }: { model: SwimlaneModel; node: SwimlaneNode; formId: string | null; isLight?: boolean }) {
  const form = formId ? FORMS_DATASET.find(item => item.id === formId) : null;
  if (!formId) return <PlaceholderWorkspace icon={<FileText size={28} />} title="Form Template" body="Select a form-bearing swimlane node." details={[]} />;
  const formInstance = node.formInstances?.find(item => item.formId === formId);
  if (model.readOnly) {
    return (
      <PlaceholderWorkspace
        icon={<FileText size={28} />}
        title="Read-only form status"
        body="This full swimlane does not open or create form instances. Use the Event Execution Cockpit for behavior actions."
        details={[
          `eventId: ${model.eventId ?? 'missing'}`,
          `taskId: ${node.taskId}`,
          `workflowId: ${model.workflowId ?? 'missing'}`,
          `formId: ${formId}`,
          `formInstanceId: ${formInstance?.formInstanceId ?? 'missing'}`,
          `status: ${formInstance?.status ?? 'pending'}`,
        ]}
      />
    );
  }
  const query = new URLSearchParams();
  if (model.mode === 'event_execution' && model.eventId) {
    query.set('event_id', model.eventId);
    query.set('task_id', node.taskId);
    query.set('form_id', formId);
    if (formInstance?.formInstanceId) query.set('form_instance_id', formInstance.formInstanceId);
    if (model.workflowId) query.set('workflow_id', model.workflowId);
    query.set('requirement_id', `${node.taskId}::FORM_COMPLETION::${formId}`);
  }
  const route = `/forms/${encodeURIComponent(formId)}${query.toString() ? `?${query.toString()}` : ''}`;
  if (model.mode === 'event_execution' && !formInstance?.formInstanceId) {
    return (
      <PlaceholderWorkspace
        icon={<FileText size={28} />}
        title="Form Instance Missing — Sync Required"
        body="The swimlane expected an event/task/form instance, but no stable formInstanceId is linked. This must be fixed in event task generation, not created from the modal."
        details={[
          `eventId: ${model.eventId ?? 'missing'}`,
          `taskId: ${node.taskId}`,
          `workflowId: ${model.workflowId ?? 'missing'}`,
          `formId: ${formId}`,
        ]}
      />
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[28px] border border-ci-border/60 bg-ci-overlay-soft p-7">
        <div className="mb-4 inline-flex rounded-2xl border border-[var(--v3-teal)]/35 bg-[var(--v3-teal)]/12 p-4 text-[var(--v3-teal-light)]"><FileText size={28} /></div>
        <h3 className="text-[34px] font-semibold tracking-[-0.02em]" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>{formId}</h3>
        <p className="mt-2 text-[18px] text-[var(--v3-teal-light)]">{FORM_TITLES[formId] ?? form?.name ?? 'Unresolved Forms Library ID'}</p>
        <p className="mt-5 text-[14px] leading-7 text-ci-text-muted">{model.mode === 'event_execution' ? 'Opens the existing form instance generated from the event task plan. The swimlane does not create form instances.' : 'Opens the Forms Library template only. No form instance, evidence record, or signer task is created.'}</p>
        {formInstance?.formInstanceId ? <p className="mt-2 font-mono text-[12px] text-[var(--v3-teal-light)]">Instance: {formInstance.formInstanceId}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={route} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition-colors" style={{ background: 'var(--v3-teal)', color: 'var(--v3-text-primary)' }}>
            {model.mode === 'event_execution' ? 'Open Form Instance' : 'Open Form Template'}
            <ExternalLink size={16} />
          </Link>
          <span className="rounded-full border border-ci-border px-5 py-3 text-[14px] font-semibold text-ci-text-muted">Source Step: {node.taskId}</span>
        </div>
        <p className="mt-4 text-[12px] text-ci-text-subtle">Return to this swimlane view using your browser back button or the preserved event/task/workflow IDs in the URL. No duplicate form instances or signer tasks are created from template mode.</p>
      </div>
      {!form ? <details className="rounded-[18px] border border-ci-border bg-ci-surface px-5 py-4 text-[13px] text-ci-text-muted"><summary className="cursor-pointer font-semibold text-ci-text-primary">Integration notes</summary><p className="mt-3">This form ID did not resolve in the current Forms Library dataset.</p></details> : null}
    </div>
  );
}

function HeaderMetric({ value, label }: { value: string; label: string }) {
  return <div className="flex items-baseline gap-2 whitespace-nowrap"><span className="max-w-[220px] truncate text-[22px] font-semibold" style={{color:'var(--v3-teal-light)'}}>{value}</span><span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color:'var(--v3-text-tertiary)'}}>{label}</span></div>;
}

function NodeStatusBadge({ status }: { status: SwimlaneStatus }) {
  if (status === 'complete' || status === 'locked') {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border text-[var(--v3-teal-light)]"
        style={{ width: LAYOUT.STATUS_ICON, height: LAYOUT.STATUS_ICON, borderColor: 'var(--v3-teal)/52', background: 'var(--v3-teal)/20' }}
      >
        <CheckCircle2 size={LAYOUT.STATUS_ICON_INNER} />
      </span>
    );
  }
  return (
    <span
      className="rounded-full border border-white/20 font-semibold uppercase tracking-[0.08em]"
      style={{ paddingInline: LAYOUT.STATUS_PAD_X, paddingBlock: LAYOUT.STATUS_PAD_Y, fontSize: LAYOUT.STATUS_FONT, color: 'var(--v3-text-primary)' }}
    >
      {compactStatusCopy(status)}
    </span>
  );
}

function InfoBlock({ title, body, accent = false }: { title: string; body: string; accent?: boolean }) {
  return <div className={accent ? "rounded-xl border border-ci-link/30 bg-ci-info-bg p-5" : "rounded-xl border border-ci-border bg-ci-surface p-5"}><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ci-text-subtle">{title}</div><p className="text-sm leading-7 text-ci-text-muted">{body}</p></div>;
}

function IdentityPanel({ model, node }: { model: SwimlaneModel; node: SwimlaneNode }) {
  const rows = [
    { label: 'Task ID', value: node.taskId, copyable: true },
    { label: 'Node ID', value: node.nodeId },
    { label: 'Event ID', value: model.eventId ?? 'Template mode' },
    { label: 'Workflow ID', value: model.workflowId ?? 'Not assigned' },
    { label: 'Form Instance ID(s)', value: nodeFormInstanceIds(node).join(' | ') },
    { label: 'Source Step', value: node.processFlowStepId ?? node.sourceStepId ?? 'Generated' },
  ];
  return (
    <div className="rounded-xl border border-ci-border bg-ci-surface p-5">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ci-text-subtle">Task Identity</div>
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
            <span className="shrink-0 text-ci-text-subtle">{row.label}:</span>
            <span className="min-w-0 break-all font-mono text-ci-text-muted">{row.value}</span>
            {row.copyable ? (
              <button type="button" aria-label={`Copy ${row.label}`} onClick={() => copyText(row.value)} className="shrink-0 rounded border border-ci-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--v3-teal-light)] transition-colors hover:border-[var(--v3-teal)]/70 hover:text-white">
                <Copy size={11} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function InstructionPanel({ instructions }: { instructions: string[] }) {
  return (
    <div className="rounded-xl border border-ci-border bg-ci-surface p-5">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ci-text-subtle">Task Instructions</div>
      <ul className="space-y-2 text-sm leading-7 text-ci-text-muted">
        {instructions.map((instruction, index) => (
          <li key={`${index + 1}-${instruction}`} className="flex gap-3">
            <span className="shrink-0 text-[var(--v3-teal-light)]">{index + 1}.</span>
            <span>{instruction}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormInstancesPanel({ model, node, onOpenLevelTwo, isLight = false }: { model: SwimlaneModel; node: SwimlaneNode; onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void; isLight?: boolean }) {
  const forms = node.formInstances?.length ? node.formInstances : node.requiredForms.map(formId => ({
    formId,
    formTitle: FORM_TITLES[formId] ?? 'Unresolved Forms Library ID',
    formInstanceId: undefined,
    status: 'pending' as SwimlaneStatus,
    missing: model.mode === 'event_execution',
    requiredAdditionalDocumentation: false,
    supportingDocumentation: [],
  }));
  const title = model.mode === 'event_execution' ? 'Form Instances' : 'Form Templates';

  return (
    <div className="rounded-xl border border-ci-border bg-ci-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-xs font-medium" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>{title}</div>
          {/* Light defect fix (hover/modals/swimlanes): use isLight for section title text to avoid white-on-white low contrast + preserve glass surface */}
          <div className="text-[10px] leading-5 text-ci-text-subtle">
            {model.mode === 'event_execution'
              ? 'Instances are generated from the event task plan.'
              : 'Template mode only. No instances, evidence records, or signer tasks are created.'}
          </div>
        </div>
        <span className={forms.length ? 'text-ci-link' : 'text-ci-text-subtle'}><FileText size={16} /></span>
      </div>

      {forms.length ? (
        <div className="space-y-3">
          {forms.map(form => (
            <FormInstanceRow
              key={`${form.formId}-${form.formInstanceId ?? 'template'}`}
              model={model}
              node={node}
              form={form}
              onOpenLevelTwo={onOpenLevelTwo}
              isLight={isLight}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-ci-border bg-ci-bg/70 px-3 py-2 text-[11px] text-ci-text-subtle">{model.mode === 'event_execution' ? 'No form instances required for this task.' : 'No form templates required for this task.'}</p>
      )}
    </div>
  );
}

function SupportingDocumentationPanel({ tasks, isLight = false }: { tasks: SwimlaneNode['supportingDocumentationTasks']; isLight?: boolean }) {
  return (
    <div className="rounded-xl border border-ci-border bg-ci-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-xs font-medium" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>Supporting Documentation</div>
          <div className="text-[10px] leading-5 text-ci-text-subtle">Additional documentation requirements tied to this task.</div>
        </div>
        <span className={tasks.length ? 'text-ci-link' : 'text-ci-text-subtle'}><UploadCloud size={16} /></span>
      </div>
      {tasks.length ? (
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.supportTaskId} className="rounded-lg border border-ci-border bg-ci-bg/70 p-3">
              <div className="text-[11px] font-semibold" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>{task.title}</div>
              <div className="mt-1 text-[10px] leading-5 text-ci-text-subtle">{task.description}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] text-ci-text-subtle">
                <span className="font-mono">{task.supportTaskId}</span>
                <span>Status: {displayTitle(statusCopy(task.status))}</span>
                <span>{task.artifactId ? `Artifact: ${task.artifactId}` : 'Artifact pending'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-ci-border bg-ci-bg/70 px-3 py-2 text-[11px] text-ci-text-subtle">No additional supporting documents required. Signature or artifact evidence satisfies this requirement.</p>
      )}
    </div>
  );
}

function SupportingEvidencePanel({ evidence, isLight = false }: { evidence: string[]; isLight?: boolean }) {
  return (
    <div className="rounded-xl border border-ci-border bg-ci-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-xs font-medium" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>Supporting Evidence</div>
          <div className="text-[10px] leading-5 text-ci-text-subtle">Required evidence outputs and expected artifacts for this task.</div>
        </div>
        <span className={evidence.length ? 'text-ci-link' : 'text-ci-text-subtle'}><FileText size={16} /></span>
      </div>
      {evidence.length ? (
        <div className="space-y-2">
          {evidence.map(item => (
            <div key={item} className="rounded-lg border border-ci-border bg-ci-bg/70 px-3 py-2 text-[11px] text-ci-text-muted">{item}</div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-ci-border bg-ci-bg/70 px-3 py-2 text-[11px] text-ci-text-subtle">No supporting evidence required for this task.</p>
      )}
    </div>
  );
}

function FormInstanceRow({ model, node, form, onOpenLevelTwo, isLight = false }: { model: SwimlaneModel; node: SwimlaneNode; form: SwimlaneFormInstance; onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void; isLight?: boolean }) {
  const actionLabel = model.mode === 'template'
    ? 'Open Form Template'
    : form.formInstanceId
      ? 'Open Form Instance'
      : 'Form Instance Missing — Sync Required';
  const query = new URLSearchParams();
  if (model.mode === 'event_execution' && model.eventId) {
    query.set('event_id', model.eventId);
    query.set('task_id', node.taskId);
    query.set('form_id', form.formId);
    if (form.formInstanceId) query.set('form_instance_id', form.formInstanceId);
    if (model.workflowId) query.set('workflow_id', model.workflowId);
    query.set('requirement_id', `${node.taskId}::FORM_COMPLETION::${form.formId}`);
  }
  const href = `/forms/${encodeURIComponent(form.formId)}${query.toString() ? `?${query.toString()}` : ''}`;
  const missingContext = [
    `eventId: ${model.eventId ?? 'missing'}`,
    `taskId: ${node.taskId}`,
    `workflowId: ${model.workflowId ?? 'missing'}`,
    `formId: ${form.formId}`,
  ];

  return (
    <div className="rounded-lg border border-ci-border bg-ci-bg/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--v3-teal-light)]">{form.formId}</div>
          <div className="mt-1 text-[12px] font-semibold leading-snug" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>{form.formTitle}</div>
          {model.mode === 'event_execution' ? (
            <div className="mt-1 truncate font-mono text-[10px] text-ci-text-subtle">Instance: {form.formInstanceId ?? 'missing'}</div>
          ) : null}
          <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ci-text-subtle">Status: {displayTitle(statusCopy(form.status))}</div>
        </div>
      </div>

      {form.missing ? (
        <div className="mt-3 rounded-lg border border-[var(--v3-orange)]/40 bg-[var(--v3-orange)]/10 p-2 text-[10px] leading-5 text-[var(--v3-orange-light)]">
          <div className="font-bold uppercase tracking-[0.12em]">Task-generation bug</div>
          {missingContext.map(item => <div key={item}>{item}</div>)}
        </div>
      ) : null}

      <p className="mt-3 text-[10px] leading-5 text-ci-text-subtle">
        {form.requiredAdditionalDocumentation
          ? `${form.supportingDocumentation.length} supporting documentation task${form.supportingDocumentation.length === 1 ? '' : 's'} linked.`
          : 'Signed form artifact satisfies evidence requirement. No additional supporting document required.'}
      </p>

      <div className="mt-3 flex gap-2">
        {model.readOnly ? (
          <button type="button" className="relative z-10 flex w-full items-center justify-center gap-2 rounded border border-ci-border bg-ci-surface-muted py-2 text-[11px] font-bold text-[var(--v3-text-primary)]" onClick={() => onOpenLevelTwo('form', form.formId)}>
            View Form Status
          </button>
        ) : form.missing ? (
          <button type="button" className="relative z-10 flex w-full items-center justify-center gap-2 rounded border border-[var(--v3-orange)]/45 bg-[var(--v3-orange)]/10 py-2 text-[11px] font-bold text-[var(--v3-orange-light)]" onClick={() => onOpenLevelTwo('form', form.formId)}>
            {actionLabel}
          </button>
        ) : (
          <Link to={href} className="relative z-10 flex w-full items-center justify-center gap-2 rounded border border-ci-border py-2 text-[11px] font-bold transition-colors hover:border-[var(--v3-teal)]/70" style={{ background: 'var(--v3-surface-muted)', color: 'var(--v3-text-primary)' }}>
            {actionLabel}
            <ExternalLink size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}

function ActionPanel({ icon, title, detail, cta, disabled = false, onClick }: { icon: ReactNode; title: string; detail: string; cta: string; disabled?: boolean; onClick: () => void }) {
  return <div className="rounded-xl border border-ci-border bg-ci-surface p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><div className="mb-1 text-xs font-medium text-ci-text-primary">{title}</div><div className="line-clamp-2 text-[10px] leading-5 text-ci-text-subtle">{detail}</div></div><span className={disabled ? 'text-ci-text-subtle' : 'text-ci-link'}>{icon}</span></div><button type="button" onClick={onClick} disabled={disabled} className="relative z-10 flex w-full items-center justify-center gap-2 rounded border border-ci-border bg-ci-surface-muted py-2 text-xs font-medium text-ci-text-primary transition-colors hover:border-ci-link/70 disabled:bg-transparent disabled:text-ci-text-subtle"><Maximize2 size={12} />{cta}</button></div>;
}

function SignatureWorkspace({ model, node, isLight = false }: { model: SwimlaneModel; node: SwimlaneNode; isLight?: boolean }) {
  const signer = useEcignSignerIdentity();
  const userPermissionRoles = useMemo(() => resolveUserPermissionRoles(signer.role), [signer.role]);

  if (model.readOnly) {
    return (
      <PlaceholderWorkspace
        icon={<FileSignature size={28} />}
        title="Read-only signature status"
        body="This full swimlane is a visualization only. eCIgn signing is available from the Event Execution Cockpit when the canonical form instance is ready."
        details={[
          `eventId: ${model.eventId ?? 'missing'}`,
          `taskId: ${node.taskId}`,
          `workflowId: ${model.workflowId ?? 'missing'}`,
          `eCign: ${model.ecignStatus ?? 'unknown'}`,
          `eCign detail: ${model.ecignDisplayStatus ?? 'unknown'}`,
          ...(model.blockerText ? [`blocker: ${model.blockerText}`] : []),
          ...signatureWorkspaceDetails(node),
        ]}
      />
    );
  }

  if (!node.signatureTasks?.length) {
    return (
      <PlaceholderWorkspace
        icon={<FileSignature size={28} />}
        title="Signature Path Not Required"
        body="This task does not have a required eCIgn signer path."
        details={signatureWorkspaceDetails(node)}
      />
    );
  }

  const isEventExecution = model.mode === 'event_execution';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="rounded-[24px] border border-ci-border bg-ci-surface p-6">
        <h3 className="text-[28px] font-semibold" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>eCIgn Ceremony / Signature Path</h3>
        <p className="mt-2 text-[14px] leading-7 text-ci-text-muted">
          Every signer task below is deterministic and tied to the parent task, workflow, event, form, and signature slot. A signer role grants workflow authority; the required eCIgn permission role authorizes the actual signature. No signer task or form instance is created from this modal.
        </p>
      </div>
      <div className="space-y-3">
        {node.signatureTasks.map(task => {
          const requiredPermissionRole = task.requiredPermissionRole as ECIgnPermissionRole;
          const userHasPermission = permissionSatisfies(userPermissionRoles, requiredPermissionRole);
          return (
            <div key={task.taskId} className="rounded-[20px] border border-ci-border bg-ci-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8be6df]">Order {task.order}</div>
                  <div className="mt-1 text-[18px] font-semibold" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>{task.signerRole}</div>
                  <div className="mt-1 text-[12px] text-ci-text-muted">{task.reviewerRole ? `Reviewer path: ${task.reviewerRole}` : 'No reviewer path required.'}</div>
                </div>
                <div className="text-right text-[12px] text-ci-text-muted">
                  <div>Status: {displayTitle(statusCopy(task.status as SwimlaneStatus))}</div>
                  <div className="mt-1">Slot: {task.signatureSlot}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full border border-ci-border bg-ci-surface px-2.5 py-1 text-ci-text-muted">Required permission: {requiredPermissionRole}</span>
                <span className={`rounded-full border px-2.5 py-1 ${userHasPermission ? 'border-[var(--v3-teal)]/60 bg-[var(--v3-teal)]/15 text-[var(--v3-teal-light)]' : 'border-[var(--ci-danger-fg)]/60 bg-[var(--ci-danger-bg)]/30 text-[var(--ci-danger-fg)]'}`}>
                  {userHasPermission ? 'Permission satisfied' : 'Missing eCIgn permission role'}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-[11px] text-ci-text-subtle">
                <div className="font-mono break-all text-ci-text-subtle">{task.taskId}</div>
                <div>Parent Task: {task.parentTaskId}</div>
                <div>Form Instance: {task.formInstanceId ?? 'Not assigned'}</div>
              </div>
              <div className="mt-4">
                {!isEventExecution ? (
                  <div className="rounded-lg border border-dashed border-ci-border px-3 py-2.5 text-[11px] text-ci-text-subtle">Template mode — signatures are preview-only. Open the event instance to sign.</div>
                ) : task.status === 'signed' || task.status === 'reviewed' ? (
                  <div className="rounded-lg border border-[var(--v3-teal)]/50 bg-[var(--v3-teal)]/10 px-3 py-2.5 text-[11px] text-[var(--v3-teal-light)]">Signature recorded for this requirement.</div>
                ) : task.status === 'blocked' || !task.formInstanceId ? (
                  <div className="rounded-lg border border-dashed border-ci-border px-3 py-2.5 text-[11px] text-ci-text-subtle">Action blocked until the required form instance exists.</div>
                ) : (
                  <div className="rounded-lg bg-ci-surface p-3">
                    <ECIgnSignatureField
                      taskId={task.taskId}
                      formId={task.formId ?? node.requiredForms[0] ?? 'NOFORM'}
                      formInstanceId={task.formInstanceId}
                      eventId={task.eventId ?? model.eventId}
                      workflowId={task.workflowId ?? model.workflowId}
                      signerRole={task.signerRole as SignerRole}
                      requiredPermissionRole={requiredPermissionRole}
                      signatureSlot={task.signatureSlot}
                      hasSignerTask
                      mode="event_execution"
                      variant="field"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {node.finalApproverRoles?.length ? (
        <div className="rounded-[20px] border border-ci-border bg-ci-surface p-5 text-[13px] text-ci-text-muted">
          Final approval path: {node.finalApproverRoles.join(', ')}
        </div>
      ) : null}
    </div>
  );
}

function PlaceholderWorkspace({ icon, title, body, details }: { icon: ReactNode; title: string; body: string; details: string[] }) {
  return <div className="mx-auto flex min-h-[520px] max-w-xl flex-col items-center justify-center text-center"><div className="mb-5 rounded-[26px] border border-ci-link/32 bg-ci-overlay-soft p-6 text-ci-link">{icon}</div><h3 className="text-[30px] font-semibold text-ci-text-primary">{title}</h3><p className="mt-3 text-[15px] leading-7 text-ci-text-muted">{body}</p>{details.length > 0 ? <div className="mt-6 flex flex-wrap justify-center gap-2">{details.map(detail => <span key={detail} className="rounded-full border border-ci-border bg-ci-surface px-3 py-1.5 text-[12px] text-ci-text-muted">{detail}</span>)}</div> : null}</div>;
}

function statusCopy(status: SwimlaneStatus) {
  return status.replace(/_/g, ' ');
}

function compactStatusCopy(status: SwimlaneStatus) {
  if (status === 'needs_evidence') return 'Req';
  if (status === 'needs_signature') return 'Sign';
  if (status === 'awaiting_reviewer') return 'Review';
  if (status === 'board_ready') return 'Board';
  if (status === 'in_progress') return 'In Progress';
  if (status === 'unavailable') return 'Unavailable';
  return statusCopy(status);
}

function levelTwoTitle(zoomState: ZoomState) {
  if (zoomState.level === 'form') return zoomState.actionId ? `Form ${zoomState.actionId}` : 'Form Template';
  if (zoomState.level === 'signature') return 'Signature Workspace';
  if (zoomState.actionId === 'artifact') return 'Artifact Workspace';
  return 'Evidence Workspace';
}

const SWIMLANE_CSS = `
.swimlane-execution-map {
  background: transparent !important;
  border: none !important;
}
.swimlane-execution-map .swimlane-canvas {
  background: transparent;
  will-change: transform, opacity, filter;
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  transform: var(--canvas-transform) !important;
  transform-origin: var(--canvas-origin) !important;
  border: none !important;
  overflow: hidden;
  contain: layout style paint;
  isolation: isolate;
}
.swimlane-execution-map .swimlane-phase-col {
  /* clean columns: no fill bleed, no grid lines per Image #4 */
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: none !important;
}
.swimlane-execution-map .swimlane-phase-header,
.swimlane-execution-map .swimlane-lane-header,
.swimlane-execution-map .swimlane-corner {
  /* clean surfaces, no dark bleed */
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: none !important;
}
.swimlane-execution-map .swimlane-phase-header span,
.swimlane-execution-map .swimlane-lane-header span {
  color: var(--v3-text-secondary);
}
.swimlane-execution-map .swimlane-corner span {
  color: var(--v3-text-tertiary);
}
.swimlane-execution-map .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.swimlane-execution-map .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.swimlane-execution-map .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ci-border, var(--v3-border-subtle)); border-radius: 999px; }
.swimlane-workspace-overlay {
  /* clean full-bleed overlay: prevent gray edge bleed, consistent dim to match calendar */
  overflow: hidden !important;
  /* use theme token + light override to prevent dark bleed in popups */
  background-color: color-mix(in srgb, var(--ci-bg) 88%, transparent) !important;
  backdrop-filter: blur(8px) !important;
}
.swimlane-workspace-overlay > div,
.swimlane-workspace-overlay .max-w-none {
  min-height: 0;
}
.swimlane-workspace-overlay .swimlane-zoom-modal,
.swimlane-workspace-overlay .swimlane-level-two-modal {
  /* clean popup: hairline border, no inner ring bleed, flat clean shell per Image #3; QAPI detail matches */
  position: relative;
  z-index: 125;
  border-radius: 16px !important;
  overflow: hidden !important;
  overflow-clip-margin: 0 !important;
  isolation: isolate;
  contain: layout paint size;
  box-shadow: 0 18px 50px rgba(0,0,0,0.28);
  border: 1px solid var(--ci-border) !important;
  ring: none !important;
}
.swimlane-workspace-overlay .swimlane-zoom-modal,
.swimlane-workspace-overlay .swimlane-level-two-modal {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden !important;
  border-radius: 16px;
  border-color: var(--ci-border) !important;
}
.swimlane-workspace-overlay .swimlane-zoom-modal {
  width: min(896px, calc(var(--swimlane-overlay-width, 100vw) - 48px));
  max-width: min(896px, calc(var(--swimlane-overlay-width, 100vw) - 48px));
  height: min(85vh, calc(var(--swimlane-overlay-height, 100vh) - 48px));
  max-height: min(85vh, calc(var(--swimlane-overlay-height, 100vh) - 48px));
  background: var(--ci-surface) !important;
}
.swimlane-workspace-overlay .swimlane-level-two-modal {
  width: min(1200px, calc(var(--swimlane-overlay-width, 100vw) - 48px));
  max-width: min(1200px, calc(var(--swimlane-overlay-width, 100vw) - 48px));
  height: min(90vh, calc(var(--swimlane-overlay-height, 100vh) - 48px));
  max-height: min(90vh, calc(var(--swimlane-overlay-height, 100vh) - 48px));
  background: var(--ci-surface) !important;
}
.swimlane-workspace-overlay :is(.swimlane-zoom-modal, .swimlane-level-two-modal) > .relative {
  min-height: 0;
}
.swimlane-modal-scroll {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overflow: hidden auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  contain: layout paint;
  background: var(--ci-bg) !important;
}
.swimlane-modal-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.swimlane-modal-content-grid {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  min-width: 0;
  overflow: hidden;
  background: transparent !important; /* no bleed from parent gray */
}
.swimlane-modal-primary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}
.swimlane-modal-aside {
  flex: 0 0 340px;
  width: 340px;
  min-width: 0;
  overflow: hidden;
}
@media (max-width: 980px) {
  .swimlane-workspace-overlay .swimlane-zoom-modal,
  .swimlane-workspace-overlay .swimlane-level-two-modal {
    width: calc(var(--swimlane-overlay-width, 100vw) - 24px);
    max-width: calc(var(--swimlane-overlay-width, 100vw) - 24px);
    height: calc(var(--swimlane-overlay-height, 100vh) - 24px);
    max-height: calc(var(--swimlane-overlay-height, 100vh) - 24px);
  }
  .swimlane-modal-content-grid {
    flex-direction: column;
    gap: 1.25rem;
  }
  .swimlane-modal-aside {
    flex-basis: auto;
    width: 100%;
  }
}
.swimlane-card {
  /* clean card: no gradient bleed, subtle hairline border only, flat glass to match calendar Image #4 aesthetic */
  border: 1px solid var(--v3-border-subtle);
  border-radius: 8px;
  background: var(--ci-surface);
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  isolation: isolate;
  overflow: hidden;
  contain: layout paint;
}
.swimlane-card:hover { border-color: var(--v3-teal); box-shadow: 0 6px 14px rgba(0,0,0,0.32); transform: translate(-50%, -50%) scale(1.015) !important; transform-origin: center; filter: brightness(1.04); }
.swimlane-card:focus-visible { outline: 2px solid rgba(139,230,223,0.72); outline-offset: 2px; }
.accent-node {
  border-color: rgba(0, 121, 112, 0.42);
  background: var(--ci-surface);
  box-shadow: 0 0 0 1px rgba(0,121,112,0.06), 0 4px 10px rgba(0,0,0,0.22);
  overflow: hidden;
  contain: paint;
}
.blocked-node {
  border-color: rgba(199,70,0,0.52);
  background: var(--ci-surface-muted, rgba(255,255,255,0.04));
  overflow: hidden;
  contain: paint;
}
.unavailable-node {
  border-color: rgba(94, 106, 127, 0.42);
  background: var(--ci-surface-muted, rgba(255,255,255,0.03));
  overflow: hidden;
  contain: paint;
}
.completed-node {
  border-color: rgba(0, 121, 112, 0.78);
  background: var(--v3-teal, rgba(0, 121, 112, 0.08));
  overflow: hidden;
  contain: paint;
}
.completed-node::after, .orange-completed-node::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
}
.completed-node::after { border: 1px solid rgba(0,121,112,0.44); animation: swimlaneTealRadiate 3000ms ease-out infinite; }
.orange-completed-node { border-color: rgba(199,70,0,0.7); background: var(--v3-orange, rgba(224,123,44,0.1)); overflow: hidden; contain: paint; }
.orange-completed-node::after { border: 1px solid rgba(199,70,0,0.44); animation: swimlaneOrangeRadiate 3000ms ease-out infinite; }
.selected-node { outline: 2px solid rgba(139,230,223,0.58); transform: translate(-50%, -50%) scale(1.05) !important; }
.edge-radiate-teal { animation: swimlaneEdgeFlow 1500ms linear infinite, swimlaneTealGlow 3000ms ease-in-out infinite; stroke-dasharray: 20 30; }
.edge-radiate-orange { animation: swimlaneEdgeFlow 1500ms linear infinite, swimlaneOrangeGlow 3000ms ease-in-out infinite; stroke-dasharray: 20 30; }
.swimlane-hover-preview {
  animation: swimlanePreviewIn 120ms ease-out;
  overflow: hidden;
  contain: layout paint;
  isolation: isolate;
  border-radius: 8px;
}
/* light mode bg fix to prevent color bleed / transparency issues in hover preview (use solid surface) */
html[data-theme="care-indeed-light"] .swimlane-hover-preview {
  background: var(--ci-surface, #F8FAF9) !important;
  border-color: var(--v3-border-subtle) !important;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12) !important;
}
.card-spotlight {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--ci-border);
  background: var(--ci-surface);
  contain: layout paint;
  isolation: isolate;
}
html[data-theme="care-indeed-light"] .card-spotlight {
  background: var(--ci-surface) !important;
  border-color: var(--ci-border) !important;
}
.card-spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color, rgba(0,121,112,0.12)), transparent 42%);
  opacity: 0.85;
  pointer-events: none;
  border-radius: inherit;
}
/* Fix bleeding in swimlane cards from gradient images; ensure pill/card shapes + text align with design #4 */
.swimlane-card, .swimlane-node-card {
  border-radius: 8px !important;
  overflow: hidden !important;
  contain: layout style paint;
  isolation: isolate;
}

/* Component-local surface fix for step-focus modal cards (Task Identity, Workflow Accountability,
   Form Instances, Supporting Documentation, Supporting Evidence) to prevent maroon/CI-ION bleed
   in portal context. Forces correct light (white) and V3 dark (slate) surfaces. Visual-only. */
html[data-theme="care-indeed-light"] .swimlane-zoom-modal,
html[data-theme="care-indeed-light"] .swimlane-level-two-modal {
  background: #FFFFFF !important;
}
html[data-theme="v3-veil"] .swimlane-zoom-modal,
html[data-theme="v3-veil"] .swimlane-level-two-modal {
  background: #15282A !important;
}
.swimlane-zoom-modal .bg-ci-surface,
.swimlane-level-two-modal .bg-ci-surface,
.swimlane-zoom-modal .swimlane-card,
.swimlane-level-two-modal .swimlane-card {
  background: var(--ci-surface) !important;
}
html[data-theme="care-indeed-light"] .swimlane-zoom-modal .bg-ci-surface,
html[data-theme="care-indeed-light"] .swimlane-level-two-modal .bg-ci-surface,
html[data-theme="care-indeed-light"] .swimlane-zoom-modal .swimlane-card,
html[data-theme="care-indeed-light"] .swimlane-level-two-modal .swimlane-card {
  background: #FFFFFF !important;
}
html[data-theme="v3-veil"] .swimlane-zoom-modal .bg-ci-surface,
html[data-theme="v3-veil"] .swimlane-level-two-modal .bg-ci-surface,
html[data-theme="v3-veil"] .swimlane-zoom-modal .swimlane-card,
html[data-theme="v3-veil"] .swimlane-level-two-modal .swimlane-card {
  background: #15282A !important;
}
html[data-theme="care-indeed-light"] .swimlane-modal-scroll {
  background: #FAFBF8 !important;
}
html[data-theme="v3-veil"] .swimlane-modal-scroll {
  background: #0E1B1C !important;
}
@keyframes swimlaneTealRadiate { 0% { opacity: 0.7; transform: scale(0.98); } 100% { opacity: 0; transform: scale(1.12); } }
@keyframes swimlaneOrangeRadiate { 0% { opacity: 0.65; transform: scale(0.98); } 100% { opacity: 0; transform: scale(1.12); } }
@keyframes swimlaneEdgeFlow { to { stroke-dashoffset: -50; } }
@keyframes swimlaneTealGlow { 0%,100% { opacity: 0.28; } 50% { opacity: 0.72; } }
@keyframes swimlaneOrangeGlow { 0%,100% { opacity: 0.24; } 50% { opacity: 0.65; } }
@keyframes swimlanePreviewIn { from { opacity: 0; transform: translateY(4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
`;
