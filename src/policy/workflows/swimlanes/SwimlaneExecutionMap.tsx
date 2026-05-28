import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, ExternalLink, FileSignature, FileText, LockKeyhole, Maximize2, UploadCloud, X } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import type { SwimlaneModel, SwimlaneNode, SwimlaneStatus } from './types';
import { SwimlaneWorkspaceOverlay } from './SwimlaneWorkspaceOverlay';
import { useSwimlaneModalPosition } from './useSwimlaneModalPosition';

type ZoomLevel = 'overview' | 'centering' | 'step' | 'form' | 'evidence' | 'signature';

interface ZoomState {
  level: ZoomLevel;
  nodeId: string | null;
  actionId: string | null;
}

const TEAL = '#007970';
const ORANGE = '#C74600';
const LAYOUT = {
  COL_WIDTH: 320,
  ROW_HEIGHT: 150,
  NODE_WIDTH: 260,
  NODE_HEIGHT: 110,
  HEADER_H: 50,
  LANE_W: 240,
} as const;

const initialZoomState: ZoomState = { level: 'overview', nodeId: null, actionId: null };

function orderIndex(id: string, ids: string[]) {
  return Math.max(0, ids.indexOf(id));
}

function canvasWidth(model: SwimlaneModel) {
  return LAYOUT.LANE_W + model.phases.length * LAYOUT.COL_WIDTH;
}

function canvasHeight(model: SwimlaneModel) {
  return LAYOUT.HEADER_H + model.lanes.length * LAYOUT.ROW_HEIGHT;
}

function routeContextCopy(model: SwimlaneModel) {
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

function nodeCenter(model: SwimlaneModel, node: SwimlaneNode) {
  const phaseIds = model.phases.sort((a, b) => a.order - b.order).map(phase => phase.id);
  const laneIds = model.lanes.sort((a, b) => a.order - b.order).map(lane => lane.id);
  return {
    x: LAYOUT.LANE_W + orderIndex(node.phaseId, phaseIds) * LAYOUT.COL_WIDTH + LAYOUT.COL_WIDTH / 2,
    y: LAYOUT.HEADER_H + orderIndex(node.laneId, laneIds) * LAYOUT.ROW_HEIGHT + LAYOUT.ROW_HEIGHT / 2,
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
  const [zoomState, setZoomState] = useState<ZoomState>(initialZoomState);
  const [lastNodeId, setLastNodeId] = useState<string | null>(null);
  const [isGrabDragging, setIsGrabDragging] = useState(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const panSessionRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);
  const lastPressRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const suppressResetRef = useRef(false);
  const nodeById = useMemo(() => new Map(model.nodes.map(node => [node.nodeId, node])), [model.nodes]);
  const activeNode = zoomState.nodeId ? nodeById.get(zoomState.nodeId) ?? null : null;
  const isFullyZoomed = zoomState.level === 'step' || zoomState.level === 'form' || zoomState.level === 'evidence' || zoomState.level === 'signature';
  const targetNode = activeNode ?? (lastNodeId ? nodeById.get(lastNodeId) ?? null : null);
  const targetCenter = targetNode ? nodeCenter(model, targetNode) : null;
  const formCount = new Set(model.nodes.flatMap(node => node.requiredForms)).size;
  const evidenceCount = new Set(model.nodes.flatMap(node => node.requiredEvidence)).size;
  const signerCount = model.nodes.filter(node => node.signerRole || node.reviewerRole).length;
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

  const reset = () => {
    setZoomState(initialZoomState);
    setLastNodeId(null);
  };
  const openNode = (nodeId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
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

  // Deep taskId auto-open/select (P1 fix from QA)
  useEffect(() => {
    if (!initialTaskId) return;
    const matchingNode = model.nodes.find(n =>
      n.taskId === initialTaskId ||
      n.taskId?.includes(initialTaskId) ||
      initialTaskId.includes(n.taskId || '')
    );
    if (matchingNode) {
      setLastNodeId(matchingNode.nodeId);
      setZoomState({ level: 'step', nodeId: matchingNode.nodeId, actionId: null });
    } else {
      // Unresolved task context - still show overview but could surface a toast/note in future
      // For now, leave in overview with lastNodeId cleared
    }
  }, [initialTaskId, model.nodes]); // run once model is stable

  const finishGrabDrag = () => {
    if (!panSessionRef.current) return;
    panSessionRef.current = null;
    setIsGrabDragging(false);
  };

  const handleViewportPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (isFullyZoomed) return;
    if ((event.target as HTMLElement).closest('button, a, [role="dialog"]')) return;

    const now = performance.now();
    const lastPress = lastPressRef.current;
    const isDoubleHold = lastPress
      && now - lastPress.time < 350
      && Math.abs(lastPress.x - event.clientX) < 20
      && Math.abs(lastPress.y - event.clientY) < 20;
    const isDirectMouseGrab = event.pointerType === 'mouse' && event.button === 1;

    lastPressRef.current = { time: now, x: event.clientX, y: event.clientY };

    if (!isDoubleHold && !isDirectMouseGrab) return;

    panSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
      startScrollTop: event.currentTarget.scrollTop,
    };
    suppressResetRef.current = false;
    setIsGrabDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleViewportPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const session = panSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;
    event.currentTarget.scrollLeft = session.startScrollLeft - deltaX;
    event.currentTarget.scrollTop = session.startScrollTop - deltaY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) suppressResetRef.current = true;
    event.preventDefault();
  };

  const handleViewportPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (panSessionRef.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishGrabDrag();
  };

  const handleViewportClick = () => {
    if (suppressResetRef.current) {
      suppressResetRef.current = false;
      return;
    }
    reset();
  };

  return (
    <div ref={workspaceRef} className="swimlane-execution-map relative flex h-full w-full flex-col overflow-hidden bg-[#0b0f15] text-[#e2e8f0]">
      <style>{SWIMLANE_CSS}</style>
      <header className="shrink-0 border-b border-[#1c2433] bg-[#0b0f15] px-7 py-4">
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full border border-[#007970]/35 bg-[#004142]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#92f4ed]">
                {model.mode === 'event_execution' ? 'Event Execution' : 'Workflow Template'}
              </span>
              <span className="text-[12px] font-semibold text-[#a0abc0]">{routeContextCopy(model)}</span>
            </div>
            <h1 className="truncate text-[25px] font-semibold tracking-[-0.01em] text-white">{displayTitle(model.title)}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <HeaderMetric value={String(formCount)} label="linked forms" />
            <HeaderMetric value={String(evidenceCount)} label="evidence requirements" />
            <HeaderMetric value={String(signerCount)} label="signer/reviewer paths" />
            <Link to={backRoute(model)} className="inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-[12px] font-bold text-white/82 transition-colors hover:border-[#007970]/70 hover:text-white">
              <ArrowLeft size={14} />
              {backCopy(model)}
            </Link>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-[#C74600]/38 px-4 py-2 text-[12px] font-bold text-[#ffb18d] transition-colors hover:border-[#C74600] hover:text-white">
              Reset View
            </button>
          </div>
        </div>
      </header>

      <main
        className={`relative min-h-0 flex-1 select-none overflow-auto custom-scrollbar ${isFullyZoomed ? '' : isGrabDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleViewportClick}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={handleViewportPointerUp}
      >
        <div
          ref={canvasRef}
          className="swimlane-canvas relative transition-[opacity,filter,transform] duration-[720ms]"
          style={{
            width: canvasWidth(model),
            height: canvasHeight(model),
            '--canvas-transform': canvasTransform,
            '--canvas-origin': targetCenter && zoomState.level !== 'overview' ? `${targetCenter.x}px ${targetCenter.y}px` : '0 0',
            transitionDuration: zoomState.level === 'overview' ? '0ms' : '400ms',
            opacity: isFullyZoomed ? 0.2 : 1,
            filter: isFullyZoomed ? 'blur(5px)' : 'blur(0px)',
          } as CSSProperties}
        >
          <SwimlaneGrid model={model} />
          <SwimlaneEdges model={model} nodeById={nodeById} />
          <SwimlaneNodes model={model} selectedNodeId={zoomState.nodeId} onOpen={openNode} />
        </div>
      </main>

      {isFullyZoomed && activeNode ? (
        <ZoomOverlay model={model} node={activeNode} zoomState={zoomState} workspaceRect={workspaceRect} onClose={reset} onBack={back} onOpenLevelTwo={openLevelTwo} />
      ) : null}
    </div>
  );
}

function SwimlaneGrid({ model }: { model: SwimlaneModel }) {
  const phases = [...model.phases].sort((a, b) => a.order - b.order);
  const lanes = [...model.lanes].sort((a, b) => a.order - b.order);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {phases.map((phase, index) => (
        <div key={phase.id} className="absolute top-0 h-full border-r border-[#26313d] bg-[#0f131a]/25" style={{ left: LAYOUT.LANE_W + index * LAYOUT.COL_WIDTH, width: LAYOUT.COL_WIDTH }}>
          <div className="z-20 flex h-[50px] items-center border-b border-[#26313d] bg-[#0b0f15] px-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a0abc0]">{phase.title}</span>
          </div>
        </div>
      ))}
      {lanes.map((lane, index) => (
        <div key={lane.id} className="absolute left-0 w-full border-b border-[#26313d]" style={{ top: LAYOUT.HEADER_H + index * LAYOUT.ROW_HEIGHT, height: LAYOUT.ROW_HEIGHT }}>
          <div className="z-20 flex h-full w-[240px] items-center border-r border-[#26313d] bg-[#0b0f15] px-6">
            <span className="text-[11px] font-bold uppercase leading-snug tracking-[0.14em] text-[#a0abc0]">{lane.title}</span>
          </div>
        </div>
      ))}
      <div className="absolute left-0 top-0 z-30 flex items-center border-b border-r border-[#26313d] bg-[#0b0f15] px-6" style={{ width: LAYOUT.LANE_W, height: LAYOUT.HEADER_H }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5e6a7f]">{model.workflowId ?? model.eventId ?? 'Swimlane'} Roles</span>
      </div>
    </div>
  );
}

function SwimlaneEdges({ model, nodeById }: { model: SwimlaneModel; nodeById: Map<string, SwimlaneNode> }) {
  return (
    <svg className="absolute left-0 top-0 z-10 h-full w-full pointer-events-none" width={canvasWidth(model)} height={canvasHeight(model)} viewBox={`0 0 ${canvasWidth(model)} ${canvasHeight(model)}`} aria-hidden="true">
      <defs>
        <marker id="swimlane-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="#4a5568" /></marker>
        <marker id="swimlane-arrow-teal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={TEAL} /></marker>
        <marker id="swimlane-arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill={ORANGE} /></marker>
      </defs>
      {model.edges.map(edge => {
        const fromNode = nodeById.get(edge.fromNodeId);
        const toNode = nodeById.get(edge.toNodeId);
        if (!fromNode || !toNode) return null;
        const completed = (fromNode.status === 'complete' || fromNode.status === 'locked') && (toNode.status === 'complete' || toNode.status === 'locked');
        const finalEdge = toNode.status === 'locked' || /lock|package/i.test(toNode.title);
        const stroke = finalEdge ? ORANGE : completed ? TEAL : '#4a5568';
        return (
          <g key={`${edge.fromNodeId}-${edge.toNodeId}`}>
            {completed ? <path d={computeOrthogonalPath(model, fromNode, toNode)} stroke={stroke} strokeWidth="4" fill="none" className={finalEdge ? 'edge-radiate-orange' : 'edge-radiate-teal'} style={{ filter: 'blur(3px)' }} /> : null}
            <path d={computeOrthogonalPath(model, fromNode, toNode)} stroke={stroke} strokeOpacity={completed ? 0.95 : 0.62} strokeWidth={completed ? 2 : 1.5} fill="none" markerEnd={finalEdge ? 'url(#swimlane-arrow-orange)' : completed ? 'url(#swimlane-arrow-teal)' : 'url(#swimlane-arrow)'} />
          </g>
        );
      })}
    </svg>
  );
}

function SwimlaneNodes({ model, selectedNodeId, onOpen }: { model: SwimlaneModel; selectedNodeId: string | null; onOpen: (nodeId: string, event: MouseEvent<HTMLButtonElement>) => void }) {
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
          <button key={node.nodeId} type="button" className={['swimlane-card absolute flex flex-col p-4 text-left outline-none transition-transform duration-300', accented ? 'accent-node' : '', blocked ? 'blocked-node' : '', unavailable ? 'unavailable-node' : '', completed && !finalNode ? 'completed-node' : '', completed && finalNode ? 'orange-completed-node' : '', node.nodeId === selectedNodeId ? 'selected-node' : ''].filter(Boolean).join(' ')} style={{ left: center.x, top: center.y, width: LAYOUT.NODE_WIDTH, height: LAYOUT.NODE_HEIGHT, transform: 'translate(-50%, -50%)' }} onClick={(event) => onOpen(node.nodeId, event)}>
            <span className="mb-2 flex items-start justify-between gap-3">
              <span className="min-w-0 truncate font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a94a6]">{displayTaskId(node.taskId)}</span>
              <NodeStatusBadge status={node.status} />
            </span>
            <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-white">{displayTitle(node.title)}</span>
            <span className="mt-auto truncate text-[11px] font-semibold text-[#a0abc0]">{node.ownerRole}</span>
          </button>
        );
      })}
    </div>
  );
}

function ZoomOverlay({ model, node, zoomState, workspaceRect, onClose, onBack, onOpenLevelTwo }: { model: SwimlaneModel; node: SwimlaneNode; zoomState: ZoomState; workspaceRect: DOMRect | null; onClose: () => void; onBack: () => void; onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void }) {
  return (
    <SwimlaneWorkspaceOverlay
      id="swimlane-modal-backdrop"
      workspaceRect={workspaceRect}
      onBackdropClick={onBack}
    >
      {zoomState.level === 'step' ? <ZoomCard model={model} node={node} onClose={onClose} onOpenLevelTwo={onOpenLevelTwo} /> : <LevelTwoCard model={model} node={node} zoomState={zoomState} onBack={onBack} onClose={onClose} />}
    </SwimlaneWorkspaceOverlay>
  );
}

function ZoomCard({ model, node, onClose, onOpenLevelTwo }: { model: SwimlaneModel; node: SwimlaneNode; onClose: () => void; onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void }) {
  const phase = model.phases.find(item => item.id === node.phaseId)?.title ?? node.phaseId;
  return (
    <SpotlightCard className="zoom-card-shell w-full max-w-4xl max-h-[85vh] animate-zoomIn ring-1 ring-white/5" role="dialog" aria-modal="true">
      <header className="border-b border-[#1c2433] bg-[#141a23]/90 px-8 py-6 backdrop-blur-md">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded bg-[#1c2433] px-2 py-1 text-xs font-medium text-[#5e6a7f] transition-colors hover:bg-[#2a3441] hover:text-white"><ArrowLeft size={12} />Back to Swimlane</button>
              <span className="text-xs text-[#5e6a7f]">/</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#007970]">
                <Maximize2 size={10} />
                Zoom Level 1: Step Focus
              </span>
            </div>
            <h2 className="text-2xl font-semibold leading-tight text-white">{displayTitle(node.title)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a0abc0]">{node.shortDescription}</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 rounded-lg p-2 text-[#5e6a7f] transition-colors hover:bg-[#1c2433] hover:text-white" aria-label="Close"><X size={20} /></button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto bg-[#0b0f15] p-8 custom-scrollbar">
        <div className="flex gap-8">
          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap gap-x-7 gap-y-2">
              <HeaderMetric value={displayTaskId(node.taskId)} label="task" />
              <HeaderMetric value={displayTitle(statusCopy(node.status))} label="status" />
              <HeaderMetric value={phase} label="phase" />
            </div>
            <InfoBlock title="Workflow Accountability" body={`${node.ownerRole}${node.reviewerRole ? `; reviewer: ${node.reviewerRole}` : ''}${node.signerRole ? `; signer: ${node.signerRole}` : ''}`} />
            <InfoBlock title="Compliance Audit Purpose" body={node.auditPurpose} accent />
            {model.missingContext?.length ? <InfoBlock title="Missing Context Indicators" body={model.missingContext.join(' | ')} /> : null}
          </div>
          <div className="w-[340px] shrink-0 space-y-4">
            <ActionPanel icon={<FileText size={16} />} title="Required Forms" detail={node.requiredForms.length ? node.requiredForms.join(', ') : 'No forms required'} disabled={!node.requiredForms.length} onClick={() => onOpenLevelTwo('form', node.requiredForms[0] ?? null)} cta={model.mode === 'event_execution' ? 'Open / Create Form Instance' : 'Open Template Requirement'} />
            <ActionPanel icon={<UploadCloud size={16} />} title="Supporting Evidence" detail={node.requiredEvidence.length ? node.requiredEvidence.join(', ') : 'No evidence required'} disabled={!node.requiredEvidence.length} onClick={() => onOpenLevelTwo('evidence', 'evidence')} cta="Open Evidence Workspace" />
            <ActionPanel icon={<FileSignature size={16} />} title="eCIgn Ceremony" detail={node.signerRole ? `Requires: ${node.signerRole}` : node.reviewerRole ? `Reviewer: ${node.reviewerRole}` : 'No signature path assigned'} disabled={!node.signerRole && !node.reviewerRole} onClick={() => onOpenLevelTwo('signature', 'sign')} cta="Show Signature Path" />
            <ActionPanel icon={<LockKeyhole size={16} />} title="Artifact Package" detail="Preview locked package state" onClick={() => onOpenLevelTwo('evidence', 'artifact')} cta="Open Artifact Workspace" />
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function LevelTwoCard({ model, node, zoomState, onBack, onClose }: { model: SwimlaneModel; node: SwimlaneNode; zoomState: ZoomState; onBack: () => void; onClose: () => void }) {
  return (
    <SpotlightCard className="level-two-workspace h-full w-full max-w-[1200px] max-h-[90vh] overflow-hidden animate-zoomInDeeper" role="dialog" aria-modal="true">
      <header className="flex items-center justify-between gap-4 border-b border-[#1c2433] bg-[#141a23]/86 px-7 py-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[12px] text-[#8a94a6]">
            <button type="button" onClick={onClose} className="hover:text-white">Swimlane</button>
            <ChevronRight size={13} />
            <button type="button" onClick={onBack} className="truncate hover:text-white">{node.title}</button>
          </div>
          <h2 className="text-[25px] font-semibold text-white">{levelTwoTitle(zoomState)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="rounded-full border border-[#2a3441] px-4 py-2 text-[12px] font-semibold text-[#cbd5e1] transition-colors hover:border-[#007970]/70 hover:text-white">Back</button>
          <button type="button" onClick={onClose} className="rounded-full border border-[#2a3441] p-2 text-[#8a94a6] transition-colors hover:border-[#C74600]/70 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
      </header>
      <div className="h-[calc(100%-86px)] overflow-auto custom-scrollbar p-8">
        {zoomState.level === 'form' ? <FormWorkspace model={model} node={node} formId={zoomState.actionId} />
          : zoomState.level === 'signature' ? <PlaceholderWorkspace icon={<FileSignature size={28} />} title="Signature Workspace" body={model.mode === 'event_execution' ? 'Signature requirements route through event execution context; signer tasks are created by the form/eCIgn workflow, not by this visual map.' : 'Template mode shows signer path only and creates no signer tasks.'} details={[node.signerRole ?? node.reviewerRole ?? 'No signer/reviewer role assigned']} />
          : <PlaceholderWorkspace icon={<UploadCloud size={28} />} title={zoomState.actionId === 'artifact' ? 'Artifact Workspace' : 'Evidence Workspace'} body={model.mode === 'event_execution' ? 'Evidence uploads require event, task, workflow, and form context.' : 'Template mode lists evidence requirements without creating records.'} details={node.requiredEvidence.length ? node.requiredEvidence : ['No evidence requirement is assigned to this node.']} />}
      </div>
    </SpotlightCard>
  );
}

function FormWorkspace({ model, node, formId }: { model: SwimlaneModel; node: SwimlaneNode; formId: string | null }) {
  const form = formId ? FORMS_DATASET.find(item => item.id === formId) : null;
  if (!formId) return <PlaceholderWorkspace icon={<FileText size={28} />} title="Form Template" body="Select a form-bearing swimlane node." details={[]} />;
  const query = new URLSearchParams();
  if (model.mode === 'event_execution' && model.eventId) {
    query.set('event_id', model.eventId);
    query.set('task_id', node.taskId);
    query.set('form_id', formId);
    if (model.workflowId) query.set('workflow_id', model.workflowId);
    query.set('requirement_id', `${node.taskId}::FORM_COMPLETION::${formId}`);
  }
  const route = `/forms/${encodeURIComponent(formId)}${query.toString() ? `?${query.toString()}` : ''}`;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[28px] border border-[#007970]/32 bg-[#004142]/18 p-7">
        <div className="mb-4 inline-flex rounded-2xl border border-[#007970]/35 bg-[#007970]/12 p-4 text-[#8be6df]"><FileText size={28} /></div>
        <h3 className="text-[34px] font-semibold tracking-[-0.02em] text-white">{formId}</h3>
        <p className="mt-2 text-[18px] text-[#d7fffb]">{FORM_TITLES[formId] ?? form?.name ?? 'Unresolved Forms Library ID'}</p>
        <p className="mt-5 text-[14px] leading-7 text-[#a0abc0]">{model.mode === 'event_execution' ? 'Opens a stable event/task/form instance through the existing FormViewer idempotency guard.' : 'Opens the Forms Library template only. No form instance, evidence record, or signer task is created.'}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={route} className="inline-flex items-center gap-2 rounded-full bg-[#007970] px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#00877d]">
            {model.mode === 'event_execution' ? 'Open Event Form Instance' : 'Open Forms Library Template'}
            <ExternalLink size={16} />
          </Link>
          <span className="rounded-full border border-[#2a3441] px-5 py-3 text-[14px] font-semibold text-[#cbd5e1]">Source Step: {node.taskId}</span>
        </div>
        <p className="mt-4 text-[12px] text-[#8a94a6]">Return to this swimlane view using your browser back button or the preserved event/task/workflow IDs in the URL. No duplicate form instances or signer tasks are created from template mode.</p>
      </div>
      {!form ? <details className="rounded-[18px] border border-[#2a3441] bg-[#111923] px-5 py-4 text-[13px] text-[#a0abc0]"><summary className="cursor-pointer font-semibold text-[#cbd5e1]">Integration notes</summary><p className="mt-3">This form ID did not resolve in the current Forms Library dataset.</p></details> : null}
    </div>
  );
}

function HeaderMetric({ value, label }: { value: string; label: string }) {
  return <div className="flex items-baseline gap-2 whitespace-nowrap"><span className="max-w-[220px] truncate text-[22px] font-semibold text-[#8be6df]">{value}</span><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/54">{label}</span></div>;
}

function NodeStatusBadge({ status }: { status: SwimlaneStatus }) {
  if (status === 'complete' || status === 'locked') return <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#8be6df]/52 bg-[#007970]/20 text-[#8be6df]"><CheckCircle2 size={13} /></span>;
  return <span className="rounded-full border border-white/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/72">{compactStatusCopy(status)}</span>;
}

function InfoBlock({ title, body, accent = false }: { title: string; body: string; accent?: boolean }) {
  return <div className={accent ? 'rounded-xl border border-[#007970]/20 bg-[#004142]/10 p-5' : 'rounded-xl border border-[#1c2433] bg-[#141a23] p-5'}><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a94a6]">{title}</div><p className="text-sm leading-7 text-[#cbd5e1]">{body}</p></div>;
}

function ActionPanel({ icon, title, detail, cta, disabled = false, onClick }: { icon: ReactNode; title: string; detail: string; cta: string; disabled?: boolean; onClick: () => void }) {
  return <div className="rounded-xl border border-[#1c2433] bg-[#141a23] p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><div className="mb-1 text-xs font-medium text-white">{title}</div><div className="line-clamp-2 text-[10px] leading-5 text-[#8a94a6]">{detail}</div></div><span className={disabled ? 'text-[#5e6a7f]' : 'text-[#007970]'}>{icon}</span></div><button type="button" onClick={onClick} disabled={disabled} className="relative z-10 flex w-full items-center justify-center gap-2 rounded border border-[#2a3441] bg-[#1c2433] py-2 text-xs font-medium text-white transition-colors hover:border-[#007970]/70 disabled:bg-transparent disabled:text-[#5e6a7f]"><Maximize2 size={12} />{cta}</button></div>;
}

function PlaceholderWorkspace({ icon, title, body, details }: { icon: ReactNode; title: string; body: string; details: string[] }) {
  return <div className="mx-auto flex min-h-[520px] max-w-xl flex-col items-center justify-center text-center"><div className="mb-5 rounded-[26px] border border-[#007970]/32 bg-[#004142]/18 p-6 text-[#8be6df]">{icon}</div><h3 className="text-[30px] font-semibold text-white">{title}</h3><p className="mt-3 text-[15px] leading-7 text-[#a0abc0]">{body}</p>{details.length > 0 ? <div className="mt-6 flex flex-wrap justify-center gap-2">{details.map(detail => <span key={detail} className="rounded-full border border-[#2a3441] bg-[#141a23] px-3 py-1.5 text-[12px] text-[#cbd5e1]">{detail}</span>)}</div> : null}</div>;
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
.swimlane-execution-map .swimlane-canvas {
  will-change: transform, opacity, filter;
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  transform: var(--canvas-transform) !important;
  transform-origin: var(--canvas-origin) !important;
}
.swimlane-execution-map .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.swimlane-execution-map .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.swimlane-execution-map .custom-scrollbar::-webkit-scrollbar-thumb { background: #1c2433; border-radius: 999px; }
.swimlane-workspace-overlay .zoom-card-shell,
.swimlane-workspace-overlay .level-two-workspace {
  max-width: min(1200px, calc(var(--swimlane-overlay-width, 100vw) - 48px));
  max-height: min(85vh, calc(var(--swimlane-overlay-height, 100vh) - 48px));
}
.swimlane-card {
  border: 1px solid rgba(42, 52, 65, 0.94);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018)),
    linear-gradient(180deg, rgba(0,121,112,0.08), rgba(0,121,112,0.01) 48%),
    rgba(20, 26, 35, 0.91);
  box-shadow: 0 14px 32px rgba(0,0,0,0.18);
  isolation: isolate;
}
.swimlane-card:hover { border-color: rgba(0, 121, 112, 0.64); box-shadow: 0 16px 36px rgba(0,0,0,0.24); transform: translate(-50%, -50%) scale(1.02) !important; }
.accent-node {
  border-color: rgba(0, 121, 112, 0.38);
  background:
    linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018)),
    linear-gradient(180deg, rgba(0,121,112,0.16), rgba(0,121,112,0.03) 54%),
    rgba(20, 26, 35, 0.92);
  box-shadow: 0 0 0 1px rgba(0,121,112,0.08), 0 16px 36px rgba(0,0,0,0.2);
}
.blocked-node {
  border-color: rgba(199,70,0,0.46);
  background:
    linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015)),
    linear-gradient(180deg, rgba(199,70,0,0.14), rgba(199,70,0,0.03) 54%),
    rgba(20, 26, 35, 0.92);
}
.unavailable-node {
  border-color: rgba(94, 106, 127, 0.38);
  background:
    linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.012)),
    rgba(20, 26, 35, 0.88);
}
.completed-node {
  border-color: rgba(0, 121, 112, 0.72);
  background: linear-gradient(135deg, rgba(0,121,112,0.22), rgba(255,255,255,0.02)), rgba(0, 65, 66, 0.22);
}
.completed-node::after, .orange-completed-node::after {
  content: "";
  position: absolute;
  inset: -7px;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
}
.completed-node::after { border: 1px solid rgba(0,121,112,0.44); animation: swimlaneTealRadiate 3000ms ease-out infinite; }
.orange-completed-node { border-color: rgba(199,70,0,0.7); background: linear-gradient(135deg, rgba(199,70,0,0.18), rgba(255,255,255,0.02)), rgba(20, 26, 35, 0.92); }
.orange-completed-node::after { border: 1px solid rgba(199,70,0,0.44); animation: swimlaneOrangeRadiate 3000ms ease-out infinite; }
.selected-node { outline: 2px solid rgba(139,230,223,0.58); transform: translate(-50%, -50%) scale(1.05) !important; }
.edge-radiate-teal { animation: swimlaneEdgeFlow 1500ms linear infinite, swimlaneTealGlow 3000ms ease-in-out infinite; stroke-dasharray: 20 30; }
.edge-radiate-orange { animation: swimlaneEdgeFlow 1500ms linear infinite, swimlaneOrangeGlow 3000ms ease-in-out infinite; stroke-dasharray: 20 30; }
.card-spotlight {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid #1c2433;
  background: #0f131a;
}
.card-spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color, rgba(0,121,112,0.12)), transparent 42%);
  opacity: 0.85;
  pointer-events: none;
}
@keyframes swimlaneTealRadiate { 0% { opacity: 0.7; transform: scale(0.98); } 100% { opacity: 0; transform: scale(1.12); } }
@keyframes swimlaneOrangeRadiate { 0% { opacity: 0.65; transform: scale(0.98); } 100% { opacity: 0; transform: scale(1.12); } }
@keyframes swimlaneEdgeFlow { to { stroke-dashoffset: -50; } }
@keyframes swimlaneTealGlow { 0%,100% { opacity: 0.28; } 50% { opacity: 0.72; } }
@keyframes swimlaneOrangeGlow { 0%,100% { opacity: 0.24; } 50% { opacity: 0.65; } }
`;
