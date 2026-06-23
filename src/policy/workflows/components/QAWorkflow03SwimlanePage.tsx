import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileBox,
  FileKey,
  FileSignature,
  FileText,
  Info,
  LockKeyhole,
  Maximize2,
  UploadCloud,
  X,
} from 'lucide-react';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import type { SwimlaneModel as RuntimeSwimlaneModel } from '@/policy/workflows/swimlanes/types';
import { useSwimlaneViewportPan } from '@/policy/workflows/swimlanes/useSwimlaneViewportPan';
import { SwimlaneWorkspaceOverlay } from '@/policy/workflows/swimlanes/SwimlaneWorkspaceOverlay';
import { useShellStore } from '@/policy/stores/uiStore';

type ZoomLevel = 'overview' | 'centering' | 'step' | 'form' | 'evidence' | 'signature';
type NodeStatus = 'complete' | 'ready' | 'in_progress' | 'blocked' | 'pending';

interface SwimlanePhase {
  id: string;
  title: string;
  gridCol: number;
}

interface SwimlaneRole {
  id: string;
  title: string;
}

interface SwimlaneNode {
  nodeId: string;
  taskId: string;
  workflowId: 'QA-WF-03';
  phaseId: string;
  laneId: string;
  title: string;
  shortDescription: string;
  ownerRole: string;
  status: NodeStatus;
  requiredForms: string[];
  requiredEvidence: string[];
  dependencies: string[];
  nextNodeIds: string[];
  auditPurpose: string;
  gridX: number;
  gridY: number;
  signerRole?: string;
}

interface SwimlaneEdge {
  from: string;
  to: string;
}

interface ZoomState {
  level: ZoomLevel;
  nodeId: string | null;
  actionId: string | null;
}

const TEAL = '#007970';
const TEAL_SOFT = '#004142';
const ORANGE = '#E07B2C'; // match design #4 v3 orange
const STEP_CANVAS_SCALE = 2.8;

const PHASES: SwimlanePhase[] = [
  { id: 'p0', title: 'Pre-Meeting Preparation', gridCol: 0 },
  { id: 'p1', title: 'Data Validation', gridCol: 1 },
  { id: 'p2', title: 'Committee Review', gridCol: 2 },
  { id: 'p3', title: 'Vote & Actions', gridCol: 3 },
  { id: 'p4', title: 'Minutes & Signatures', gridCol: 4 },
  { id: 'p5', title: 'Governing Body', gridCol: 5 },
  { id: 'p6', title: 'Locked Package', gridCol: 6 },
];

const ROLES: SwimlaneRole[] = [
  { id: 'r0', title: 'QAPI Lead / Chair' },
  { id: 'r1', title: 'Data Analyst / Quality Source' },
  { id: 'r2', title: 'Clinical Manager' },
  { id: 'r3', title: 'Compliance Officer' },
  { id: 'r4', title: 'Infection Preventionist' },
  { id: 'r5', title: 'Committee / Voting Members' },
  { id: 'r6', title: 'Scribe' },
  { id: 'r7', title: 'Governing Body' },
  { id: 'r8', title: 'Evidence / eCIgn System' },
];

const QA_WF_03_SWIMLANE_PROTOTYPE_DATA: {
  nodes: SwimlaneNode[];
  edges: SwimlaneEdge[];
} = {
  nodes: [
    {
      nodeId: 'n1',
      taskId: 'TASK-QA-101',
      workflowId: 'QA-WF-03',
      phaseId: 'p0',
      laneId: 'r0',
      title: 'Agenda and pre-read distributed',
      shortDescription: 'Confirms committee members received the agenda, prior actions, dashboards, RCAs, and PIP updates early enough to prepare.',
      ownerRole: 'QAPI Lead / Chair',
      status: 'complete',
      requiredForms: [],
      requiredEvidence: ['committee packet/pre-read'],
      dependencies: [],
      nextNodeIds: ['n2'],
      auditPurpose: 'Ensures defensible pre-meeting governance.',
      gridX: 0,
      gridY: 0,
    },
    {
      nodeId: 'n2',
      taskId: 'TASK-QA-102',
      workflowId: 'QA-WF-03',
      phaseId: 'p1',
      laneId: 'r1',
      title: 'Quarterly data package confirmed',
      shortDescription: 'Validates all quantitative data sources are compiled and statistically accurate before committee review.',
      ownerRole: 'Data Analyst / Quality Source',
      status: 'complete',
      requiredForms: ['QA-FM-003'],
      requiredEvidence: ['3 monthly quality dashboards'],
      dependencies: ['n1'],
      nextNodeIds: ['n3_trends', 'n3_events', 'n3_pips', 'n3_inf', 'n3_comp'],
      auditPurpose: 'Validates data integrity for QAPI decisions.',
      gridX: 1,
      gridY: 1,
    },
    {
      nodeId: 'n3_trends',
      taskId: 'TASK-QA-103',
      workflowId: 'QA-WF-03',
      phaseId: 'p2',
      laneId: 'r1',
      title: 'Aggregate quality trends reviewed',
      shortDescription: 'Reviews overarching clinical and operational metrics against benchmark targets.',
      ownerRole: 'Data Analyst / Quality Source',
      status: 'complete',
      requiredForms: [],
      requiredEvidence: [],
      dependencies: ['n2'],
      nextNodeIds: ['n4'],
      auditPurpose: 'Demonstrates active monitoring of agency performance.',
      gridX: 2,
      gridY: 1,
    },
    {
      nodeId: 'n3_events',
      taskId: 'TASK-QA-104',
      workflowId: 'QA-WF-03',
      phaseId: 'p2',
      laneId: 'r2',
      title: 'Adverse events and RCAs reviewed',
      shortDescription: 'Clinical Manager and QAPI Lead review adverse events, RCA findings, and severity trends.',
      ownerRole: 'Clinical Manager',
      status: 'complete',
      requiredForms: ['QA-FM-004'],
      requiredEvidence: ['adverse event RCA files'],
      dependencies: ['n2'],
      nextNodeIds: ['n4'],
      auditPurpose: 'Defensible proof of critical incident oversight.',
      gridX: 2,
      gridY: 2,
    },
    {
      nodeId: 'n3_pips',
      taskId: 'TASK-QA-105',
      workflowId: 'QA-WF-03',
      phaseId: 'p2',
      laneId: 'r0',
      title: 'Active PIPs reviewed',
      shortDescription: 'Evaluates progress of active Performance Improvement Projects and Corrective Action Plans.',
      ownerRole: 'QAPI Lead / Chair',
      status: 'complete',
      requiredForms: ['QA-FM-002', 'QA-FM-005'],
      requiredEvidence: ['PIP progress reports', 'CAP tracker exports'],
      dependencies: ['n2'],
      nextNodeIds: ['n4'],
      auditPurpose: 'Maintains continuous improvement momentum.',
      gridX: 2,
      gridY: 0,
    },
    {
      nodeId: 'n3_inf',
      taskId: 'TASK-QA-106',
      workflowId: 'QA-WF-03',
      phaseId: 'p2',
      laneId: 'r4',
      title: 'Infection surveillance reviewed',
      shortDescription: 'Reviews line lists, infection rates, and antibiotic stewardship indicators.',
      ownerRole: 'Infection Preventionist',
      status: 'complete',
      requiredForms: ['QA-FM-006'],
      requiredEvidence: ['infection surveillance line list'],
      dependencies: ['n2'],
      nextNodeIds: ['n4'],
      auditPurpose: 'Regulatory infection control compliance.',
      gridX: 2,
      gridY: 4,
    },
    {
      nodeId: 'n3_comp',
      taskId: 'TASK-QA-107',
      workflowId: 'QA-WF-03',
      phaseId: 'p2',
      laneId: 'r3',
      title: 'Compliance risk and complaint trends',
      shortDescription: 'Analyzes legal, compliance, and patient grievance trends for systemic risk.',
      ownerRole: 'Compliance Officer',
      status: 'complete',
      requiredForms: [],
      requiredEvidence: ['complaints/grievance summary'],
      dependencies: ['n2'],
      nextNodeIds: ['n4'],
      auditPurpose: 'Mitigates institutional risk vectors.',
      gridX: 2,
      gridY: 3,
    },
    {
      nodeId: 'n4',
      taskId: 'TASK-QA-108',
      workflowId: 'QA-WF-03',
      phaseId: 'p3',
      laneId: 'r5',
      title: 'Committee vote / action decisions completed',
      shortDescription: 'Formal vote on new PIP initiations, CAP closures, and policy approvals.',
      ownerRole: 'Committee / Voting Members',
      status: 'complete',
      requiredForms: [],
      requiredEvidence: [],
      dependencies: ['n3_trends', 'n3_events', 'n3_pips', 'n3_inf', 'n3_comp'],
      nextNodeIds: ['n5'],
      auditPurpose: 'Formalizes committee authority and actions.',
      gridX: 3,
      gridY: 5,
    },
    {
      nodeId: 'n5',
      taskId: 'TASK-QA-109',
      workflowId: 'QA-WF-03',
      phaseId: 'p4',
      laneId: 'r6',
      title: 'Minutes drafted in QA-FM-001',
      shortDescription: 'Scribe compiles formal minutes capturing discussions, data presented, and actions taken.',
      ownerRole: 'Scribe',
      status: 'complete',
      requiredForms: ['QA-FM-001'],
      requiredEvidence: [],
      dependencies: ['n4'],
      nextNodeIds: ['n6'],
      auditPurpose: 'Core regulatory artifact for QAPI.',
      gridX: 4,
      gridY: 6,
    },
    {
      nodeId: 'n6',
      taskId: 'TASK-QA-110',
      workflowId: 'QA-WF-03',
      phaseId: 'p4',
      laneId: 'r0',
      title: 'QAPI packet signed by Lead',
      shortDescription: 'Official electronic signature binding the minutes and evidence package.',
      ownerRole: 'QAPI Lead / Chair',
      status: 'complete',
      signerRole: 'QAPI Lead / Chair',
      requiredForms: [],
      requiredEvidence: ['signed QAPI minutes'],
      dependencies: ['n5'],
      nextNodeIds: ['n7'],
      auditPurpose: 'Ensures executive accountability.',
      gridX: 4,
      gridY: 0,
    },
    {
      nodeId: 'n7',
      taskId: 'TASK-QA-111',
      workflowId: 'QA-WF-03',
      phaseId: 'p5',
      laneId: 'r0',
      title: 'Governing Body report prepared',
      shortDescription: 'Translates detailed QAPI findings into executive summaries for Board oversight.',
      ownerRole: 'QAPI Lead / Chair',
      status: 'complete',
      requiredForms: ['GV-FM-023'],
      requiredEvidence: ['Governing Body report packet'],
      dependencies: ['n6'],
      nextNodeIds: ['n8'],
      auditPurpose: 'Bridges QAPI and Board of Directors.',
      gridX: 5,
      gridY: 0,
    },
    {
      nodeId: 'n8',
      taskId: 'TASK-QA-112',
      workflowId: 'QA-WF-03',
      phaseId: 'p5',
      laneId: 'r7',
      title: 'Governing Body review completed',
      shortDescription: 'Confirms the Board reviewed the QAPI package, accepted action plans, and provided oversight.',
      ownerRole: 'Governing Body',
      status: 'complete',
      signerRole: 'Board Chair',
      requiredForms: [],
      requiredEvidence: ['signed Governing Body report packet'],
      dependencies: ['n7'],
      nextNodeIds: ['n9'],
      auditPurpose: 'Fulfills ultimate CoP governance mandate.',
      gridX: 5,
      gridY: 7,
    },
    {
      nodeId: 'n9',
      taskId: 'TASK-QA-113',
      workflowId: 'QA-WF-03',
      phaseId: 'p6',
      laneId: 'r8',
      title: 'Evidence package locked',
      shortDescription: 'System hashes and locks all artifacts for survey defensibility.',
      ownerRole: 'Evidence / eCIgn System',
      status: 'complete',
      requiredForms: [],
      requiredEvidence: [],
      dependencies: ['n8'],
      nextNodeIds: [],
      auditPurpose: 'Survey-ready unalterable record.',
      gridX: 6,
      gridY: 8,
    },
  ],
  edges: [
    { from: 'n1', to: 'n2' },
    { from: 'n2', to: 'n3_trends' },
    { from: 'n2', to: 'n3_events' },
    { from: 'n2', to: 'n3_pips' },
    { from: 'n2', to: 'n3_inf' },
    { from: 'n2', to: 'n3_comp' },
    { from: 'n3_trends', to: 'n4' },
    { from: 'n3_events', to: 'n4' },
    { from: 'n3_pips', to: 'n4' },
    { from: 'n3_inf', to: 'n4' },
    { from: 'n3_comp', to: 'n4' },
    { from: 'n4', to: 'n5' },
    { from: 'n5', to: 'n6' },
    { from: 'n6', to: 'n7' },
    { from: 'n7', to: 'n8' },
    { from: 'n8', to: 'n9' },
  ],
};

const FORM_LABELS: Record<string, string> = {
  'QA-FM-001': 'QAPI Committee Meeting Minutes',
  'QA-FM-002': 'PIP Charter',
  'QA-FM-003': 'Quality Indicator Monthly Dashboard',
  'QA-FM-004': 'RCA Worksheet',
  'QA-FM-005': 'CAP Tracking Tool',
  'QA-FM-006': 'Infection Surveillance Log',
  'GV-FM-023': 'Governing Body Report',
};

const LAYOUT = {
  COL_WIDTH: 320,
  ROW_HEIGHT: 150,
  NODE_WIDTH: 260,
  NODE_HEIGHT: 110,
  HEADER_H: 50,
  LANE_W: 240,
} as const;

const initialZoomState: ZoomState = { level: 'overview', nodeId: null, actionId: null };

function resolveForm(formId: string) {
  return FORMS_DATASET.find((form) => form.id === formId) ?? null;
}

function canvasWidth() {
  return LAYOUT.LANE_W + PHASES.length * LAYOUT.COL_WIDTH;
}

function canvasHeight() {
  return LAYOUT.HEADER_H + ROLES.length * LAYOUT.ROW_HEIGHT;
}

function nodeCenter(node: SwimlaneNode) {
  return {
    x: LAYOUT.LANE_W + node.gridX * LAYOUT.COL_WIDTH + LAYOUT.COL_WIDTH / 2,
    y: LAYOUT.HEADER_H + node.gridY * LAYOUT.ROW_HEIGHT + LAYOUT.ROW_HEIGHT / 2,
  };
}

function nodeBounds(node: SwimlaneNode) {
  const center = nodeCenter(node);
  return {
    cx: center.x,
    cy: center.y,
    left: center.x - LAYOUT.NODE_WIDTH / 2,
    right: center.x + LAYOUT.NODE_WIDTH / 2,
    top: center.y - LAYOUT.NODE_HEIGHT / 2,
    bottom: center.y + LAYOUT.NODE_HEIGHT / 2,
  };
}

function computeOrthogonalPath(fromNode: SwimlaneNode, toNode: SwimlaneNode) {
  const from = nodeBounds(fromNode);
  const to = nodeBounds(toNode);

  if (Math.abs(from.cx - to.cx) < 10) {
    if (to.cy > from.cy) {
      return `M ${from.cx} ${from.bottom} L ${to.cx} ${to.top}`;
    }

    return `M ${from.cx} ${from.top} L ${to.cx} ${to.bottom}`;
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

interface QAWorkflow03SwimlanePageProps {
  model?: RuntimeSwimlaneModel;
  initialTaskId?: string;
}

export function QAWorkflow03SwimlanePage({ model, initialTaskId }: QAWorkflow03SwimlanePageProps = {}) {
  const [zoomState, setZoomState] = useState<ZoomState>(initialZoomState);
  const [lastNodeId, setLastNodeId] = useState<string | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const isEventExecution = model?.mode === 'event_execution';
  const headerBadge = isEventExecution ? 'Event Execution' : 'Workflow Template';
  const headerContextCopy = isEventExecution ? 'Event-owned Quarterly QAPI execution surface' : 'Workflow-owned visual execution surface';
  const headerTitle = isEventExecution ? model?.title ?? 'Quarterly QAPI Review' : 'QA-WF-03 - Quarterly QAPI Committee Review';
  const headerSubtitle = isEventExecution ? 'QA-WF-03 visual rendered in event-instance mode.' : null;
  const backRoute = isEventExecution ? '/calendar' : '/workflows/QA-WF-03';
  const backLabel = isEventExecution ? 'Back to Calendar' : 'Back to Workflow';

  const liveNodes = (model?.nodes as unknown as SwimlaneNode[]) ?? QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes;
  const nodeById = useMemo(
    () => new Map(liveNodes.map((node) => [node.nodeId ?? (node as { id?: string }).id ?? node.taskId, node])),
    [liveNodes],
  );
  const activeNode = zoomState.nodeId ? nodeById.get(zoomState.nodeId) ?? null : null;
  const isFullyZoomed = zoomState.level === 'step' || zoomState.level === 'form' || zoomState.level === 'evidence' || zoomState.level === 'signature';
  const linkedFormCount = useMemo(
    () => new Set((model?.nodes ?? QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes).flatMap((node) => node.requiredForms)).size,
    [model],
  );
  const evidenceCount = useMemo(
    () => new Set((model?.nodes ?? QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes).flatMap((node) => node.requiredEvidence)).size,
    [model],
  );
  const signerCount = useMemo(
    () => (model?.nodes ?? QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes)
      .filter((node) => node.signerRole || ('signatureTasks' in node && (node.signatureTasks?.length ?? 0) > 0)).length,
    [model],
  );
  const targetTransformNode = activeNode ?? (lastNodeId ? nodeById.get(lastNodeId) ?? null : null);
  const targetCenter = targetTransformNode ? nodeCenter(targetTransformNode) : null;

  const [viewportScroll, setViewportScroll] = useState({ scrollLeft: 0, scrollTop: 0, clientWidth: 1200, clientHeight: 800 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleMeasure = () => {
      setViewportScroll({
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        clientWidth: viewport.clientWidth,
        clientHeight: viewport.clientHeight,
      });
    };

    handleMeasure();

    viewport.addEventListener('scroll', handleMeasure);
    window.addEventListener('resize', handleMeasure);
    return () => {
      viewport.removeEventListener('scroll', handleMeasure);
      window.removeEventListener('resize', handleMeasure);
    };
  }, [targetCenter, zoomState.level]);

  const canvasTransform = (() => {
    if (targetCenter && zoomState.level !== 'overview') {
      const { scrollLeft, scrollTop, clientWidth, clientHeight } = viewportScroll;
      const translateX = scrollLeft + clientWidth / 2 - targetCenter.x;
      const translateY = scrollTop + clientHeight / 2 - targetCenter.y;
      const scale = isFullyZoomed ? STEP_CANVAS_SCALE : 1;
      return `translate3d(${translateX}px, ${translateY}px, 0px) scale(${scale})`;
    }

    return 'translate3d(0px, 0px, 0px) scale(1)';
  })();
  const canvasTransformOrigin = targetCenter && zoomState.level !== 'overview'
    ? `${targetCenter.x}px ${targetCenter.y}px`
    : '0 0';

  const centerViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = Math.max(0, (canvasWidth() - viewport.clientWidth) / 2);
    viewport.scrollTop = Math.max(0, (canvasHeight() - viewport.clientHeight) / 2);
  }, []);
  const reset = useCallback(() => {
    setZoomState(initialZoomState);
    setLastNodeId(null);
    window.requestAnimationFrame(centerViewport);
  }, [centerViewport]);
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
    setLastNodeId(nodeId);
    setZoomState({ level: 'centering', nodeId, actionId: null });
  };
  const openLevelTwo = (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId: string | null = null) => {
    if (!activeNode) return;
    setZoomState({ level, nodeId: activeNode.nodeId, actionId });
  };
  const back = () => {
    setZoomState((current) => {
      if (current.level === 'step' || current.level === 'centering') return initialZoomState;
      return { level: 'step', nodeId: current.nodeId, actionId: null };
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setZoomState((current) => {
        if (current.level === 'overview') return current;
        if (current.level === 'step' || current.level === 'centering') return initialZoomState;
        return { level: 'step', nodeId: current.nodeId, actionId: null };
      });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(centerViewport);
    const handleResize = () => centerViewport();
    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, [centerViewport]);

  useEffect(() => {
    if (zoomState.level !== 'centering') return undefined;

    const timer = window.setTimeout(() => {
      setZoomState((current) => (current.level === 'centering' ? { ...current, level: 'step' } : current));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [zoomState.level]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!initialTaskId) return;
    const matchedNode = QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes.find(node => node.taskId === initialTaskId);
    if (!matchedNode) return;
    setLastNodeId(matchedNode.nodeId);
  }, [initialTaskId]);

  const content = (
    <div
      className="qa-wf03-swimlane fixed inset-0 flex h-screen w-screen flex-col overflow-hidden bg-ci-bg text-ci-text-primary" data-workflow-execution
      style={{ zIndex: 2147483647 }}
    >
      <style>{SWIMLANE_CSS}</style>
      <header className="qa-swimlane-page-header shrink-0 border-b px-7 py-4">
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full border border-[var(--v3-teal,#007970)]/35 bg-[var(--v3-teal,#007970)]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--v3-teal-light,#00D1C1)]">
                {headerBadge}
              </span>
              <span className="text-[12px] font-semibold text-ci-text-muted">{headerContextCopy}</span>
            </div>
            <h1 className="truncate text-[25px] font-semibold tracking-[-0.01em] text-ci-text-primary">
              {headerTitle}
            </h1>
            {headerSubtitle ? (
              <p className="mt-2 text-[12px] font-semibold text-ci-text-subtle">{headerSubtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <HeaderMetric value={String(linkedFormCount)} label="linked forms" />
            <HeaderMetric value={String(evidenceCount)} label="evidence requirements" />
            <HeaderMetric value={String(signerCount)} label="signer/reviewer paths" />
            <Link
              to={backRoute}
              className="inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-[12px] font-bold text-[var(--v3-text-primary,#fff)]/82 transition-colors hover:border-[var(--v3-teal,#007970)]/70 hover:text-[var(--v3-text-primary,#fff)]"
            >
              <ArrowLeft size={14} />
              {backLabel}
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--v3-orange,#E07B2C)]/38 px-4 py-2 text-[12px] font-bold text-[var(--v3-orange-light,#FFA059)] transition-colors hover:border-[var(--v3-orange,#E07B2C)] hover:text-[var(--v3-text-primary,#fff)]"
            >
              Reset View
            </button>
          </div>
        </div>
      </header>

      <main
        ref={viewportRef}
        className={`qa-swimlane-main relative min-h-0 flex-1 select-none overflow-auto custom-scrollbar ${isFullyZoomed ? '' : isGrabDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleViewportClick}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={handleViewportPointerUp}
      >
        <div
          ref={canvasRef}
          className="qa-swimlane-canvas relative transition-[opacity,filter,transform] duration-[720ms]"
          style={{
            width: canvasWidth(),
            height: canvasHeight(),
            '--canvas-transform': canvasTransform,
            '--canvas-origin': canvasTransformOrigin,
            transitionDuration: zoomState.level === 'overview' ? '0ms' : '400ms',
            opacity: isFullyZoomed ? 0.2 : 1,
            filter: isFullyZoomed ? 'blur(5px)' : 'blur(0px)',
          } as CSSProperties}
        >
          <SwimlaneGrid />
          <SwimlaneEdges nodeById={nodeById} />
          <SwimlaneNodes
            selectedNodeId={zoomState.nodeId}
            onOpen={openNode}
          />
        </div>
      </main>

      {isFullyZoomed && activeNode ? (
        <ZoomOverlay
          node={activeNode}
          zoomState={zoomState}
          onClose={reset}
          onBack={back}
          onOpenLevelTwo={openLevelTwo}
        />
      ) : null}
    </div>
  );

  return createPortal(content, document.body);
}

function SwimlaneGrid() {
  return (
    <div className="qa-swimlane-grid absolute inset-0 pointer-events-none">
      {PHASES.map((phase) => (
        <div
          key={phase.id}
          className="qa-swimlane-phase-column absolute top-0 h-full border-r"
          style={{ left: LAYOUT.LANE_W + phase.gridCol * LAYOUT.COL_WIDTH, width: LAYOUT.COL_WIDTH }}
        >
          <div className="qa-swimlane-phase-header z-20 flex h-[50px] items-center border-b px-6">
            <span className="qa-swimlane-phase-title text-[11px] font-bold uppercase tracking-[0.18em]">{phase.title}</span>
          </div>
        </div>
      ))}

      {ROLES.map((role, index) => (
        <div
          key={role.id}
          className="qa-swimlane-role-row absolute left-0 w-full border-b"
          style={{ top: LAYOUT.HEADER_H + index * LAYOUT.ROW_HEIGHT, height: LAYOUT.ROW_HEIGHT }}
        >
          <div className="qa-swimlane-role-label z-20 flex h-full w-[240px] items-center border-r px-6">
            <span className="qa-swimlane-role-title text-[11px] font-bold uppercase leading-snug tracking-[0.14em]">{role.title}</span>
          </div>
        </div>
      ))}

      <div
        className="qa-swimlane-corner absolute left-0 top-0 z-30 flex items-center border-b border-r px-6"
        style={{ width: LAYOUT.LANE_W, height: LAYOUT.HEADER_H }}
      >
        <span className="qa-swimlane-corner-title text-[10px] font-bold uppercase tracking-[0.18em]">QA-WF-03 Roles</span>
      </div>
    </div>
  );
}

function SwimlaneEdges({ nodeById }: { nodeById: Map<string, SwimlaneNode> }) {
  return (
    <svg
      className="absolute left-0 top-0 z-10 h-full w-full pointer-events-none"
      width={canvasWidth()}
      height={canvasHeight()}
      viewBox={`0 0 ${canvasWidth()} ${canvasHeight()}`}
      aria-hidden="true"
    >
      <defs>
        <marker id="qa-wf03-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#64748B" />
        </marker>
        <marker id="qa-wf03-arrow-teal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={TEAL} />
        </marker>
        <marker id="qa-wf03-arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={ORANGE} />
        </marker>
      </defs>

      {QA_WF_03_SWIMLANE_PROTOTYPE_DATA.edges.map((edge) => {
        const fromNode = nodeById.get(edge.from);
        const toNode = nodeById.get(edge.to);
        if (!fromNode || !toNode) return null;
        const path = computeOrthogonalPath(fromNode, toNode);
        const completed = fromNode.status === 'complete' && toNode.status === 'complete';
        const finalEdge = toNode.nodeId === 'n9';
        const stroke = finalEdge ? ORANGE : completed ? TEAL : '#64748B';
        const marker = finalEdge ? 'url(#qa-wf03-arrow-orange)' : completed ? 'url(#qa-wf03-arrow-teal)' : 'url(#qa-wf03-arrow)';

        return (
          <g key={`${edge.from}-${edge.to}`}>
            {completed ? (
              <path
                d={path}
                stroke={stroke}
                strokeWidth="5"
                fill="none"
                className={finalEdge ? 'edge-radiate-orange' : 'edge-radiate-teal'}
                style={{ filter: 'blur(3px)' }}
              />
            ) : null}
            <path
              d={path}
              stroke={stroke}
              strokeWidth={completed ? 2 : 1.5}
              fill="none"
              markerEnd={marker}
            />
          </g>
        );
      })}
    </svg>
  );
}

function SwimlaneNodes({
  selectedNodeId,
  onOpen,
}: {
  selectedNodeId: string | null;
  onOpen: (nodeId: string, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="absolute inset-0 z-20">
      {QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes.map((node) => {
        const center = nodeCenter(node);
        const completed = node.status === 'complete';
        const finalNode = node.nodeId === 'n9';
        const selected = node.nodeId === selectedNodeId;
        const className = [
          'swimlane-card absolute flex flex-col p-4 text-left outline-none transition-transform duration-300',
          completed && !finalNode ? 'completed-node' : '',
          completed && finalNode ? 'orange-completed-node' : '',
          selected ? 'selected-node' : '',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={node.nodeId}
            type="button"
            className={className}
            style={{
              left: center.x,
              top: center.y,
              width: LAYOUT.NODE_WIDTH,
              height: LAYOUT.NODE_HEIGHT,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(event) => {
              event.stopPropagation();
              onOpen(node.nodeId, event);
            }}
          >
            <span className="mb-2 flex items-start justify-between gap-3">
              <span className="min-w-0 text-[10px] font-mono font-bold uppercase tracking-[0.08em] text-ci-text-subtle">
                {node.taskId}
              </span>
              <NodeStatusBadge node={node} />
            </span>
            <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-ci-text-primary">
              {node.title}
            </span>
            <span className="mt-auto truncate text-[11px] font-semibold text-ci-text-muted">{node.ownerRole}</span>
          </button>
        );
      })}
    </div>
  );
}

function NodeStatusBadge({ node }: { node: SwimlaneNode }) {
  if (node.status === 'complete') {
    return (
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--v3-teal-light,#00D1C1)]/52 bg-[var(--v3-teal,#007970)]/20 text-[var(--v3-teal-light,#00D1C1)]">
        <CheckCircle2 size={13} />
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ci-text-primary/72">
      {node.status === 'ready' ? 'Ready' : node.status === 'blocked' ? 'Blocked' : 'Req'}
    </span>
  );
}

function ModalStatusIndicator({ status }: { status: NodeStatus }) {
  return (
    <div className="inline-flex min-w-[160px] items-center gap-2 rounded border border-[var(--v3-teal,#007970)]/30 bg-[var(--v3-teal,#007970)]/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--v3-teal,#007970)]">
      <CheckCircle2 size={12} />
      {statusCopy(status)}
    </div>
  );
}

function HeaderMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2 whitespace-nowrap">
      <span className="text-[22px] font-semibold text-[var(--v3-teal-light,#00D1C1)]">{value}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ci-text-primary/54">{label}</span>
    </div>
  );
}

function ZoomOverlay({
  node,
  zoomState,
  onClose,
  onBack,
  onOpenLevelTwo,
}: {
  node: SwimlaneNode;
  zoomState: ZoomState;
  onClose: () => void;
  onBack: () => void;
  onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void;
}) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const stepLevel = zoomState.level === 'step';

  return (
    <SwimlaneWorkspaceOverlay
      id="qa-swimlane-modal-backdrop"
      workspaceRect={null}
      onBackdropClick={onBack}
    >
      {stepLevel ? (
        <ZoomCard
          node={node}
          onClose={onClose}
          onOpenLevelTwo={onOpenLevelTwo}
          isLight={isLight}
        />
      ) : (
        <LevelTwoCard
          node={node}
          zoomState={zoomState}
          onBack={onBack}
          onClose={onClose}
        />
      )}
    </SwimlaneWorkspaceOverlay>
  );
}

function ZoomCard({
  node,
  onClose,
  onOpenLevelTwo,
  isLight: _isLight = false,
}: {
  node: SwimlaneNode;
  onClose: () => void;
  onOpenLevelTwo: (level: Exclude<ZoomLevel, 'overview' | 'centering' | 'step'>, actionId?: string | null) => void;
  isLight?: boolean;
}) {
  const phase = PHASES.find((item) => item.id === node.phaseId)?.title ?? node.phaseId;
  const formsText = node.requiredForms.length ? node.requiredForms.join(', ') : 'No forms required';
  const evidenceText = node.requiredEvidence.length ? node.requiredEvidence.join(', ') : 'No evidence required';

  return (
    <SpotlightCard className="zoom-card-shell swimlane-zoom-modal w-full max-w-4xl shadow-2xl animate-zoomIn ring-1 ring-white/5 overflow-hidden isolate">
      <header className="shrink-0 border-b border-ci-border bg-ci-surface/90 px-8 py-6 backdrop-blur-md">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded bg-[var(--v3-surface-2,#141A23)] px-2 py-1 text-xs font-medium text-ci-text-subtle transition-colors hover:bg-[var(--v3-surface-muted,#11242A)] hover:text-ci-text-primary"
              >
                <ArrowLeft size={12} />
                Back to Swimlane
              </button>
              <span className="text-xs text-ci-text-subtle">/</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ci-link">
                <Maximize2 size={10} />
                Zoom Level 1: Step Focus
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-ci-text-primary">{node.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ci-text-muted">{node.shortDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg p-2 text-ci-text-subtle transition-colors hover:bg-[var(--v3-surface-2,#141A23)] hover:text-ci-text-primary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="swimlane-modal-scroll flex-1 bg-ci-bg p-8">
        <div className="swimlane-modal-content-grid">
          <div className="swimlane-modal-primary space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-ci-border bg-ci-surface p-4 shadow-lg shadow-black/20">
                <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-ci-text-subtle">Task Context</div>
                <div className="font-mono text-sm font-semibold text-ci-text-primary">{node.taskId}</div>
              </div>
              <div className="rounded-xl border border-ci-border bg-ci-surface p-4 shadow-lg shadow-black/20">
                <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-ci-text-subtle">Status</div>
                <ModalStatusIndicator status={node.status} />
              </div>
            </div>

            <div className="rounded-xl border border-ci-border bg-ci-surface p-5 shadow-lg shadow-black/20">
              <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-ci-text-subtle">Workflow Accountability</div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ci-border bg-[var(--v3-surface-2,#141A23)] text-sm font-bold text-ci-text-muted">
                  {node.ownerRole.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-ci-text-primary">{node.ownerRole}</div>
                  <div className="text-xs text-ci-text-subtle">Phase: {phase}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--v3-teal,#007970)]/20 bg-[var(--v3-teal,#007970)]/08 p-5">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ci-link">
                <Info size={14} />
                Compliance Audit Purpose
              </div>
              <p className="text-sm leading-7 text-teal-100/80">{node.auditPurpose}</p>
            </div>
          </div>

          <div className="swimlane-modal-aside space-y-4">
            <h3 className="mb-4 flex items-center gap-2 border-b border-ci-border pb-2 text-xs font-bold uppercase tracking-[0.16em] text-ci-text-subtle">
              <FileKey size={14} className="text-ci-link" />
              Execution Workspaces
            </h3>

            <div className="rounded-xl border border-ci-border bg-ci-surface p-4 shadow-lg shadow-black/20">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs font-medium text-ci-text-primary">Required Forms</div>
                  <div className="text-[10px] leading-5 text-ci-text-subtle">{formsText}</div>
                </div>
                <FileText size={16} className={node.requiredForms.length ? 'text-ci-link' : 'text-ci-text-subtle'} />
              </div>
              {node.requiredForms.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {node.requiredForms.map((formId) => (
                    <Link
                      key={formId}
                      to={`/forms/${encodeURIComponent(formId)}`}
                      className="rounded-md border border-[var(--v3-teal,#007970)]/30 bg-[var(--v3-teal,#007970)]/12 px-2 py-1 font-mono text-[10px] font-bold text-[var(--v3-teal-light,#00D1C1)] transition-colors hover:border-[var(--v3-teal,#007970)]"
                    >
                      {formId}
                    </Link>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => onOpenLevelTwo('form', node.requiredForms[0] ?? null)}
                disabled={node.requiredForms.length === 0}
                className="relative z-10 flex w-full items-center justify-center gap-2 rounded bg-[var(--v3-teal,#007970)] py-2 text-xs font-medium text-[var(--v3-text-primary,#fff)] transition-colors hover:bg-[var(--v3-teal-light,#00D1C1)] disabled:bg-[var(--v3-surface-2,#141A23)] disabled:text-ci-text-subtle"
              >
                <Maximize2 size={12} />
                Zoom to Form Workspace
              </button>
            </div>

            <div className="rounded-xl border border-ci-border bg-ci-surface p-4 shadow-lg shadow-black/20">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs font-medium text-ci-text-primary">Supporting Evidence</div>
                  <div className="line-clamp-1 text-[10px] leading-5 text-ci-text-subtle">{evidenceText}</div>
                </div>
                <FileBox size={16} className={node.requiredEvidence.length ? 'text-ci-link' : 'text-ci-text-subtle'} />
              </div>
              <button
                type="button"
                onClick={() => onOpenLevelTwo('evidence', 'evidence')}
                disabled={node.requiredEvidence.length === 0}
                className="relative z-10 flex w-full items-center justify-center gap-2 rounded border border-ci-border bg-[var(--v3-surface-2,#141A23)] py-2 text-xs font-medium text-ci-text-primary transition-colors hover:bg-[var(--v3-surface-muted,#11242A)] disabled:bg-transparent disabled:text-ci-text-subtle"
              >
                <UploadCloud size={12} />
                Open Evidence Workspace
              </button>
            </div>

            <div className="rounded-xl border border-ci-border bg-ci-surface p-4 shadow-lg shadow-black/20">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs font-medium text-ci-text-primary">eCIgn Ceremony</div>
                  <div className="text-[10px] leading-5 text-ci-text-subtle">{node.signerRole ? `Requires: ${node.signerRole}` : 'No signatures required'}</div>
                </div>
                <FileSignature size={16} className={node.signerRole ? 'text-ci-link' : 'text-ci-text-subtle'} />
              </div>
              <button
                type="button"
                onClick={() => onOpenLevelTwo('signature', 'sign')}
                disabled={!node.signerRole}
                className="relative z-10 flex w-full items-center justify-center gap-2 rounded bg-[var(--v3-teal,#007970)] py-2 text-xs font-medium text-[var(--v3-text-primary,#fff)] transition-colors hover:bg-[var(--v3-teal-light,#00D1C1)] disabled:bg-[var(--v3-surface-2,#141A23)] disabled:text-ci-text-subtle"
              >
                <FileSignature size={12} />
                Enter Signature Ceremony
              </button>
            </div>

            <div className="rounded-xl border border-ci-border bg-ci-surface p-4 shadow-lg shadow-black/20">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs font-medium text-ci-text-primary">Artifact Package</div>
                  <div className="text-[10px] leading-5 text-ci-text-subtle">Preview locked package state</div>
                </div>
                <LockKeyhole size={16} className="text-ci-link" />
              </div>
              <button
                type="button"
                onClick={() => onOpenLevelTwo('evidence', 'artifact')}
                className="relative z-10 flex w-full items-center justify-center gap-2 rounded border border-ci-border bg-[var(--v3-surface-2,#141A23)] py-2 text-xs font-medium text-ci-text-primary transition-colors hover:bg-[var(--v3-surface-muted,#11242A)]"
              >
                <Maximize2 size={12} />
                Open Artifact Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function LevelTwoCard({
  node,
  zoomState,
  onBack,
  onClose,
}: {
  node: SwimlaneNode;
  zoomState: ZoomState;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <SpotlightCard className="level-two-workspace swimlane-level-two-modal w-full max-w-[1200px] overflow-hidden animate-zoomInDeeper isolate">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ci-border bg-ci-surface/86 px-7 py-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[12px] text-ci-text-subtle">
            <button type="button" onClick={onClose} className="hover:text-ci-text-primary">QA-WF-03 Swimlane</button>
            <ChevronRight size={13} />
            <button type="button" onClick={onBack} className="truncate hover:text-ci-text-primary">{node.title}</button>
          </div>
          <h2 className="text-[25px] font-semibold text-ci-text-primary">{levelTwoTitle(zoomState)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-ci-border px-4 py-2 text-[12px] font-semibold text-ci-text-muted transition-colors hover:border-[var(--v3-teal,#007970)]/70 hover:text-ci-text-primary"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ci-border p-2 text-ci-text-subtle transition-colors hover:border-[var(--v3-orange,#E07B2C)]/70 hover:text-ci-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </header>
      <div className="swimlane-modal-scroll flex-1 bg-ci-bg p-8">
        {zoomState.level === 'form' ? (
          <FormWorkspace node={node} formId={zoomState.actionId} />
        ) : zoomState.level === 'signature' ? (
          <PlaceholderWorkspace
            icon={<FileSignature size={28} />}
            title="Signature Workspace"
            body={node.signerRole ? `Prepared for ${node.signerRole}.` : 'No signature path is assigned to this node.'}
            details={node.signerRole ? ['Template view only', 'No signer task is created'] : ['Template view only']}
          />
        ) : (
          <PlaceholderWorkspace
            icon={<UploadCloud size={28} />}
            title={zoomState.actionId === 'artifact' ? 'Artifact Workspace' : 'Evidence Workspace'}
            body="This visual map shows the required package shape without creating execution records."
            details={node.requiredEvidence.length > 0 ? node.requiredEvidence : ['No evidence requirement is assigned to this node.']}
          />
        )}
      </div>
    </SpotlightCard>
  );
}

function FormWorkspace({ node, formId }: { node: SwimlaneNode; formId: string | null }) {
  const form = formId ? resolveForm(formId) : null;

  if (!formId) {
    return (
      <PlaceholderWorkspace
        icon={<FileText size={28} />}
        title="Form Template"
        body="Select a form chip from the zoomed workflow card."
        details={[]}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[28px] border border-ci-border/60 bg-ci-overlay-soft p-7">
        <div className="mb-4 inline-flex rounded-2xl border border-ci-link/35 bg-ci-link/12 p-4 text-ci-link">
          <FileText size={28} />
        </div>
        <h3 className="text-[34px] font-semibold tracking-[-0.02em] text-ci-text-primary">{formId}</h3>
        <p className="mt-2 text-[18px] text-[var(--v3-teal-light,#00D1C1)]">{FORM_LABELS[formId] ?? form?.name ?? 'Forms Library template'}</p>
        <p className="mt-5 text-[14px] leading-7 text-ci-text-muted">
          Opens the Forms Library template only. This swimlane does not create a form instance.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/forms/${encodeURIComponent(formId)}`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--v3-teal,#007970)] px-5 py-3 text-[14px] font-bold text-[var(--v3-text-primary,#fff)] transition-colors hover:bg-[var(--v3-teal-light,#00D1C1)]"
          >
            Open Forms Library Template
            <ExternalLink size={16} />
          </Link>
          <button
            type="button"
            className="rounded-full border border-ci-border px-5 py-3 text-[14px] font-semibold text-ci-text-muted"
          >
            Source Step: {node.taskId}
          </button>
        </div>
      </div>

      {!form ? (
        <details className="rounded-[18px] border border-ci-border bg-ci-surface px-5 py-4 text-[13px] text-ci-text-muted">
          <summary className="cursor-pointer font-semibold text-ci-text-muted">Integration notes</summary>
          <p className="mt-3">This form ID did not resolve in the current Forms Library dataset.</p>
        </details>
      ) : null}
    </div>
  );
}

function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(0, 121, 112, 0.12)',
  style,
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    element.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    element.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className={`card-spotlight ${className}`}
      style={style}
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </section>
  );
}

function PlaceholderWorkspace({
  icon,
  title,
  body,
  details,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  details: string[];
}) {
  return (
    <div className="mx-auto flex min-h-[520px] max-w-xl flex-col items-center justify-center text-center">
      <div className="mb-5 rounded-[26px] border border-ci-link/32 bg-ci-overlay-soft p-6 text-ci-link">
        {icon}
      </div>
      <h3 className="text-[30px] font-semibold text-ci-text-primary">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-ci-text-muted">{body}</p>
      {details.length > 0 ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {details.map((detail) => (
            <span key={detail} className="rounded-full border border-ci-border bg-ci-surface px-3 py-1.5 text-[12px] text-ci-text-muted">
              {detail}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function statusCopy(status: NodeStatus) {
  if (status === 'complete') return 'Complete';
  if (status === 'ready') return 'Ready';
  if (status === 'in_progress') return 'In Progress';
  if (status === 'blocked') return 'Blocked';
  return 'Pending';
}

function levelTwoTitle(zoomState: ZoomState) {
  if (zoomState.level === 'form') return zoomState.actionId ? `Form Template ${zoomState.actionId}` : 'Form Template';
  if (zoomState.level === 'signature') return 'Signature Workspace';
  if (zoomState.actionId === 'artifact') return 'Artifact Workspace';
  return 'Evidence Workspace';
}

const SWIMLANE_CSS = `
.qa-wf03-swimlane {
  --qa-teal: ${TEAL};
  --qa-teal-soft: ${TEAL_SOFT};
  --qa-orange: ${ORANGE};
  /* Contained z to not interfere with 120+ swimlane workspace popups */
  z-index: 10;
  background: var(--ci-surface);
  color: var(--v3-text-primary);
}

.qa-wf03-swimlane .qa-swimlane-page-header {
  background: var(--ci-surface);
  border-bottom-color: var(--ci-border);
}

.qa-wf03-swimlane .qa-swimlane-main,
.qa-wf03-swimlane .qa-swimlane-canvas {
  background: var(--ci-surface);
}

.qa-wf03-swimlane .qa-swimlane-canvas {
  will-change: transform, opacity, filter;
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  transform: var(--canvas-transform) !important;
  transform-origin: var(--canvas-origin) !important;
}

.qa-wf03-swimlane .qa-swimlane-phase-column {
  background: rgba(15, 19, 26, 0.24);
  border-right-color: var(--v3-border-subtle, #26313d);
}

.qa-wf03-swimlane .qa-swimlane-phase-header {
  background: var(--ci-surface);
  border-bottom-color: #26313d;
}

.qa-wf03-swimlane .qa-swimlane-phase-title,
.qa-wf03-swimlane .qa-swimlane-role-title {
  color: var(--v3-text-secondary, #94A3B8);
}

.qa-wf03-swimlane .qa-swimlane-role-row {
  border-bottom-color: #26313d;
}

.qa-wf03-swimlane .qa-swimlane-role-label {
  background: var(--ci-surface);
  border-right-color: var(--ci-border);
}

.qa-wf03-swimlane .qa-swimlane-corner {
  background: var(--ci-surface);
  border-color: var(--ci-border);
}

.qa-wf03-swimlane .qa-swimlane-corner-title {
  color: var(--v3-text-tertiary, #64748B);
}

/* zoom-backdrop replaced by SwimlaneWorkspaceOverlay for clean no-bleed shared implementation matching swimlane detail */

.qa-wf03-swimlane .border {
  border-color: var(--v3-border-subtle, #26313d);
}

.qa-wf03-swimlane .border-b {
  border-bottom-color: var(--v3-border-subtle, #26313d);
}

.qa-wf03-swimlane .border-r {
  border-right-color: var(--v3-border-subtle, #26313d);
}

.qa-wf03-swimlane .custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.qa-wf03-swimlane .custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.qa-wf03-swimlane .custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--ci-surface-muted);
  border-radius: 999px;
}

.qa-wf03-swimlane .swimlane-zoom-modal,
.qa-wf03-swimlane .swimlane-level-two-modal {
  /* clean no-bleed popup for QAPI (image #2): match swimlane detail design, strict clip. High contained z 125+, isolation, token only, no bleed over nav/main. */
  position: relative;
  z-index: 125;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden !important;
  overflow-clip-margin: 0 !important;
  isolation: isolate;
  contain: layout paint size;
}

.qa-wf03-swimlane .swimlane-zoom-modal {
  width: min(896px, calc(100vw - 48px)) !important;
  max-width: min(896px, calc(100vw - 48px)) !important;
  height: min(85vh, calc(100vh - 48px)) !important;
  max-height: min(85vh, calc(100vh - 48px)) !important;
  border-radius: 16px !important;
  background: var(--ci-surface) !important;
}

.qa-wf03-swimlane .swimlane-level-two-modal {
  width: min(1200px, calc(100vw - 48px)) !important;
  max-width: min(1200px, calc(100vw - 48px)) !important;
  height: min(90vh, calc(100vh - 48px)) !important;
  max-height: min(90vh, calc(100vh - 48px)) !important;
  border-radius: 16px !important;
  background: var(--ci-surface) !important;
}

/* bare selectors for portaled shared overlay (QAPI popup now uses SwimlaneWorkspaceOverlay) */
.swimlane-zoom-modal {
  width: min(896px, calc(100vw - 48px)) !important;
  max-width: min(896px, calc(100vw - 48px)) !important;
  height: min(85vh, calc(100vh - 48px)) !important;
  max-height: min(85vh, calc(100vh - 48px)) !important;
  border-radius: 16px !important;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  overflow-clip-margin: 0 !important;
  background: var(--ci-surface) !important;
  position: relative;
  z-index: 125;
  isolation: isolate;
  contain: layout paint size;
}
.swimlane-level-two-modal {
  width: min(1200px, calc(100vw - 48px)) !important;
  max-width: min(1200px, calc(100vw - 48px)) !important;
  height: min(90vh, calc(100vh - 48px)) !important;
  max-height: min(90vh, calc(100vh - 48px)) !important;
  border-radius: 16px !important;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  overflow-clip-margin: 0 !important;
  background: var(--ci-surface) !important;
  position: relative;
  z-index: 125;
  isolation: isolate;
  contain: layout paint size;
}

.qa-wf03-swimlane :is(.swimlane-zoom-modal, .swimlane-level-two-modal) > .relative {
  min-height: 0;
}

.swimlane-modal-scroll {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
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
  .qa-wf03-swimlane .swimlane-zoom-modal,
  .qa-wf03-swimlane .swimlane-level-two-modal {
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
    height: calc(100vh - 24px);
    max-height: calc(100vh - 24px);
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
  border: 1px solid rgba(42, 52, 65, 0.94);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018)),
    rgba(20, 26, 35, 0.91);
  box-shadow: 0 16px 36px rgba(0,0,0,0.24);
  isolation: isolate;
}

.swimlane-card:hover {
  border-color: rgba(0, 121, 112, 0.64);
  transform: translate(-50%, -50%) scale(1.02) !important;
}

.completed-node {
  border-color: rgba(0, 121, 112, 0.72);
  background:
    linear-gradient(135deg, rgba(0,121,112,0.22), rgba(255,255,255,0.02)),
    rgba(0, 65, 66, 0.22);
  box-shadow: 0 0 0 1px rgba(0,121,112,0.25), 0 0 28px rgba(0,121,112,0.24);
}

.completed-node::after {
  content: "";
  position: absolute;
  inset: -7px;
  border-radius: inherit;
  border: 1px solid rgba(0,121,112,0.44);
  animation: qaTealRadiate 3000ms ease-out infinite;
  pointer-events: none;
  z-index: -1;
}

.orange-completed-node {
  border-color: rgba(199,70,0,0.7);
  background:
    linear-gradient(135deg, rgba(199,70,0,0.18), rgba(255,255,255,0.02)),
    rgba(20, 26, 35, 0.92);
  box-shadow: 0 0 0 1px rgba(199,70,0,0.25), 0 0 28px rgba(199,70,0,0.2);
}

.orange-completed-node::after {
  content: "";
  position: absolute;
  inset: -7px;
  border-radius: inherit;
  border: 1px solid rgba(199,70,0,0.44);
  animation: qaOrangeRadiate 3000ms ease-out infinite;
  pointer-events: none;
  z-index: -1;
}

.selected-node {
  transform: translate(-50%, -50%) scale(1.05) !important;
  outline: 2px solid rgba(139,230,223,0.58);
}

.edge-radiate-teal,
.edge-radiate-orange {
  stroke-dasharray: 20 30;
}

.edge-radiate-teal {
  animation: qaEdgeFlow 1500ms linear infinite, qaTealGlow 3000ms ease-in-out infinite;
}

.edge-radiate-orange {
  animation: qaEdgeFlow 1500ms linear infinite, qaOrangeGlow 3000ms ease-in-out infinite;
}

.card-spotlight {
  position: relative;
  border-radius: 28px;
  border: 1px solid var(--ci-border);
  background: var(--ci-surface);
  box-shadow: 0 36px 100px rgba(0,0,0,0.46);
  overflow: hidden;
  overflow-clip-margin: 0;
  --mouse-x: 50%;
  --mouse-y: 50%;
  --spotlight-color: rgba(0, 121, 112, 0.12);
}

.card-spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 78%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 400ms ease;
}

.card-spotlight:hover::before,
.card-spotlight:focus-within::before {
  opacity: 1;
}

.zoom-card-shell {
  display: flex;
  flex-direction: column;
  width: min(896px, calc(100vw - 48px));
  max-height: 85vh;
  border-radius: 28px;
}

.workspace-action-card {
  min-height: 128px;
}

.level-two-workspace {
  display: flex;
  flex-direction: column;
  width: min(1200px, calc(100vw - 48px));
  height: min(90vh, calc(100vh - 48px));
  border-radius: 28px;
}

.animate-fadeIn {
  animation: qaFadeIn 300ms ease-out both;
}

.animate-zoomIn {
  animation: qaZoomInModal 340ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

.animate-zoomInDeeper {
  animation: qaZoomInDeeper 340ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes qaFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes qaZoomInModal {
  0% { opacity: 0; transform: scale(0.8) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes qaZoomInDeeper {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes qaTealRadiate {
  0% { opacity: 0.56; transform: scale(0.98); }
  60% { opacity: 0; transform: scale(1.08); }
  100% { opacity: 0; transform: scale(1.08); }
}

@keyframes qaOrangeRadiate {
  0% { opacity: 0.48; transform: scale(0.98); }
  60% { opacity: 0; transform: scale(1.08); }
  100% { opacity: 0; transform: scale(1.08); }
}

@keyframes qaEdgeFlow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -50; }
}

@keyframes qaTealGlow {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.88; }
}

@keyframes qaOrangeGlow {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.78; }
}

@media (prefers-reduced-motion: reduce) {
  .completed-node::after,
  .orange-completed-node::after,
  .edge-radiate-teal,
  .edge-radiate-orange,
  .animate-fadeIn,
  .animate-zoomIn,
  .animate-zoomInDeeper {
    animation: none;
  }
}
`;
