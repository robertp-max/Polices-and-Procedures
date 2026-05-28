import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileCheck, ShieldAlert, CheckCircle2, AlertCircle, 
  Clock, PlayCircle, UploadCloud, FileSignature, Lock, 
  X, Info, FileText, FileBox, ShieldCheck, FileKey, Snail,
  ChevronRight, ArrowLeft, Maximize2
} from 'lucide-react';

// ============================================================================
// COMPONENT: SpotlightCard (Integrated from React Bits)
// ============================================================================
/**
 * SpotlightCard
 * * Variant: JavaScript + CSS
 * Description: Adds a radial gradient spotlight effect that follows the user's
 * mouse pointer on hover. Used to enhance the modal and workspace layers.
 * * Props:
 * - spotlightColor (string): Controls the color of the radial gradient (default: rgba(255, 255, 255, 0.25))
 * - className (string): Additional CSS classes for styling
 * - children (ReactNode): Content to be rendered inside the card
 */
const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {/* Ensure inner content rests strictly above the spotlight gradient 
        and captures interactions natively 
      */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};


// ============================================================================
// TYPED DATA STRUCTURES 
// ============================================================================

const PHASES = [
  { id: 'p0', title: 'Pre-Meeting Preparation', gridCol: 0 },
  { id: 'p1', title: 'Data Validation', gridCol: 1 },
  { id: 'p2', title: 'Committee Review', gridCol: 2 },
  { id: 'p3', title: 'Vote & Actions', gridCol: 3 },
  { id: 'p4', title: 'Minutes & Signatures', gridCol: 4 },
  { id: 'p5', title: 'Governing Body', gridCol: 5 },
  { id: 'p6', title: 'Locked Package', gridCol: 6 }
];

const ROLES = [
  { id: 'r0', title: 'QAPI Lead / Chair' },
  { id: 'r1', title: 'Data Analyst / Quality Source' },
  { id: 'r2', title: 'Clinical Manager' },
  { id: 'r3', title: 'Compliance Officer' },
  { id: 'r4', title: 'Infection Preventionist' },
  { id: 'r5', title: 'Committee / Voting Members' },
  { id: 'r6', title: 'Scribe' },
  { id: 'r7', title: 'Governing Body' },
  { id: 'r8', title: 'Evidence / eCIgn System' }
];

const QA_WF_03_SWIMLANE_PROTOTYPE_DATA = {
  nodes: [
    {
      nodeId: 'n1', taskId: 'TASK-QA-101', workflowId: 'QA-WF-03', phaseId: 'p0', laneId: 'r0',
      title: 'Agenda and pre-read distributed',
      shortDescription: 'Confirms committee members received the agenda, prior actions, dashboards, RCAs, and PIP updates early enough to prepare.',
      ownerRole: 'QAPI Lead / Chair', status: 'complete',
      requiredForms: [], requiredEvidence: ['committee packet/pre-read'],
      dependencies: [], nextNodeIds: ['n2'], auditPurpose: 'Ensures defensible pre-meeting governance.',
      gridX: 0, gridY: 0
    },
    {
      nodeId: 'n2', taskId: 'TASK-QA-102', workflowId: 'QA-WF-03', phaseId: 'p1', laneId: 'r1',
      title: 'Quarterly data package confirmed',
      shortDescription: 'Validates all quantitative data sources are compiled and statistically accurate before committee review.',
      ownerRole: 'Data Analyst / Quality Source', status: 'complete',
      requiredForms: ['QA-FM-003'], requiredEvidence: ['3 monthly quality dashboards'],
      dependencies: ['n1'], nextNodeIds: ['n3_trends', 'n3_events', 'n3_pips', 'n3_inf', 'n3_comp'], auditPurpose: 'Validates data integrity for QAPI decisions.',
      gridX: 1, gridY: 1
    },
    {
      nodeId: 'n3_trends', taskId: 'TASK-QA-103', workflowId: 'QA-WF-03', phaseId: 'p2', laneId: 'r1',
      title: 'Aggregate quality trends reviewed',
      shortDescription: 'Reviews overarching clinical and operational metrics against benchmark targets.',
      ownerRole: 'Data Analyst / Quality Source', status: 'complete',
      requiredForms: [], requiredEvidence: [],
      dependencies: ['n2'], nextNodeIds: ['n4'], auditPurpose: 'Demonstrates active monitoring of agency performance.',
      gridX: 2, gridY: 1
    },
    {
      nodeId: 'n3_events', taskId: 'TASK-QA-104', workflowId: 'QA-WF-03', phaseId: 'p2', laneId: 'r2',
      title: 'Adverse events and RCAs reviewed',
      shortDescription: 'Clinical Manager and QAPI Lead review adverse events, RCA findings, and severity trends.',
      ownerRole: 'Clinical Manager', status: 'complete',
      requiredForms: ['QA-FM-004'], requiredEvidence: ['adverse event RCA files'],
      dependencies: ['n2'], nextNodeIds: ['n4'], auditPurpose: 'Defensible proof of critical incident oversight.',
      gridX: 2, gridY: 2
    },
    {
      nodeId: 'n3_pips', taskId: 'TASK-QA-105', workflowId: 'QA-WF-03', phaseId: 'p2', laneId: 'r0',
      title: 'Active PIPs reviewed',
      shortDescription: 'Evaluates progress of active Performance Improvement Projects and Corrective Action Plans.',
      ownerRole: 'QAPI Lead / Chair', status: 'complete',
      requiredForms: ['QA-FM-002', 'QA-FM-005'], requiredEvidence: ['PIP progress reports', 'CAP tracker exports'],
      dependencies: ['n2'], nextNodeIds: ['n4'], auditPurpose: 'Maintains continuous improvement momentum.',
      gridX: 2, gridY: 0
    },
    {
      nodeId: 'n3_inf', taskId: 'TASK-QA-106', workflowId: 'QA-WF-03', phaseId: 'p2', laneId: 'r4',
      title: 'Infection surveillance reviewed',
      shortDescription: 'Reviews line lists, infection rates, and antibiotic stewardship indicators.',
      ownerRole: 'Infection Preventionist', status: 'complete',
      requiredForms: ['QA-FM-006'], requiredEvidence: ['infection surveillance line list'],
      dependencies: ['n2'], nextNodeIds: ['n4'], auditPurpose: 'Regulatory infection control compliance.',
      gridX: 2, gridY: 4
    },
    {
      nodeId: 'n3_comp', taskId: 'TASK-QA-107', workflowId: 'QA-WF-03', phaseId: 'p2', laneId: 'r3',
      title: 'Compliance risk and complaint trends',
      shortDescription: 'Analyzes legal, compliance, and patient grievance trends for systemic risk.',
      ownerRole: 'Compliance Officer', status: 'complete',
      requiredForms: [], requiredEvidence: ['complaints/grievance summary'],
      dependencies: ['n2'], nextNodeIds: ['n4'], auditPurpose: 'Mitigates institutional risk vectors.',
      gridX: 2, gridY: 3
    },
    {
      nodeId: 'n4', taskId: 'TASK-QA-108', workflowId: 'QA-WF-03', phaseId: 'p3', laneId: 'r5',
      title: 'Committee vote / action decisions',
      shortDescription: 'Formal vote on new PIP initiations, CAP closures, and policy approvals.',
      ownerRole: 'Committee / Voting Members', status: 'complete',
      requiredForms: [], requiredEvidence: [],
      dependencies: ['n3_trends', 'n3_events', 'n3_pips', 'n3_inf', 'n3_comp'], nextNodeIds: ['n5'], auditPurpose: 'Formalizes committee authority and actions.',
      gridX: 3, gridY: 5
    },
    {
      nodeId: 'n5', taskId: 'TASK-QA-109', workflowId: 'QA-WF-03', phaseId: 'p4', laneId: 'r6',
      title: 'Minutes drafted in QA-FM-001',
      shortDescription: 'Scribe compiles formal minutes capturing discussions, data presented, and actions taken.',
      ownerRole: 'Scribe', status: 'complete',
      requiredForms: ['QA-FM-001'], requiredEvidence: [],
      dependencies: ['n4'], nextNodeIds: ['n6'], auditPurpose: 'Core regulatory artifact for QAPI.',
      gridX: 4, gridY: 6
    },
    {
      nodeId: 'n6', taskId: 'TASK-QA-110', workflowId: 'QA-WF-03', phaseId: 'p4', laneId: 'r0',
      title: 'QAPI packet signed by Lead',
      shortDescription: 'Official electronic signature binding the minutes and evidence package.',
      ownerRole: 'QAPI Lead / Chair', status: 'complete', signerRole: 'QAPI Lead / Chair',
      requiredForms: [], requiredEvidence: ['signed QAPI minutes'],
      dependencies: ['n5'], nextNodeIds: ['n7'], auditPurpose: 'Ensures executive accountability.',
      gridX: 4, gridY: 0
    },
    {
      nodeId: 'n7', taskId: 'TASK-QA-111', workflowId: 'QA-WF-03', phaseId: 'p5', laneId: 'r0',
      title: 'Governing Body report prepared',
      shortDescription: 'Translates detailed QAPI findings into executive summaries for Board oversight.',
      ownerRole: 'QAPI Lead / Chair', status: 'complete',
      requiredForms: ['GV-FM-023'], requiredEvidence: ['Governing Body report packet'],
      dependencies: ['n6'], nextNodeIds: ['n8'], auditPurpose: 'Bridges QAPI and Board of Directors.',
      gridX: 5, gridY: 0
    },
    {
      nodeId: 'n8', taskId: 'TASK-QA-112', workflowId: 'QA-WF-03', phaseId: 'p5', laneId: 'r7',
      title: 'Governing Body review completed',
      shortDescription: 'Confirms the Board reviewed the QAPI package, accepted action plans, and provided oversight.',
      ownerRole: 'Governing Body', status: 'complete', signerRole: 'Board Chair',
      requiredForms: [], requiredEvidence: ['signed Governing Body report packet'],
      dependencies: ['n7'], nextNodeIds: ['n9'], auditPurpose: 'Fulfills ultimate CoP governance mandate.',
      gridX: 5, gridY: 7
    },
    {
      nodeId: 'n9', taskId: 'TASK-QA-113', workflowId: 'QA-WF-03', phaseId: 'p6', laneId: 'r8',
      title: 'Evidence package locked',
      shortDescription: 'System cryptographically hashes and locks all artifacts for survey defensibility.',
      ownerRole: 'Evidence / eCIgn System', status: 'complete',
      requiredForms: [], requiredEvidence: [],
      dependencies: ['n8'], nextNodeIds: [], auditPurpose: 'Survey-ready unalterable record.',
      gridX: 6, gridY: 8
    }
  ],
  edges: [
    { from: 'n1', to: 'n2' },
    { from: 'n2', to: 'n3_trends' }, { from: 'n2', to: 'n3_events' }, { from: 'n2', to: 'n3_pips' }, { from: 'n2', to: 'n3_inf' }, { from: 'n2', to: 'n3_comp' },
    { from: 'n3_trends', to: 'n4' }, { from: 'n3_events', to: 'n4' }, { from: 'n3_pips', to: 'n4' }, { from: 'n3_inf', to: 'n4' }, { from: 'n3_comp', to: 'n4' },
    { from: 'n4', to: 'n5' },
    { from: 'n5', to: 'n6' },
    { from: 'n6', to: 'n7' },
    { from: 'n7', to: 'n8' },
    { from: 'n8', to: 'n9' }
  ]
};

// ============================================================================
// CONFIG & MATH HELPERS
// ============================================================================

const LAYOUT = {
  COL_WIDTH: 320,
  ROW_HEIGHT: 150,
  NODE_WIDTH: 260,
  NODE_HEIGHT: 110,
  HEADER_H: 50,
  LANE_W: 240
};

const computeOrthogonalPath = (startCenter, endCenter) => {
  // Fix: If nodes are in the exact same column (e.g. n7 to n8), route vertically top-down
  // This explicitly prevents the 'arrow overlapping from the left side' glitch
  if (Math.abs(startCenter.x - endCenter.x) < 10) {
    const startX = startCenter.x;
    const startY = startCenter.y + (LAYOUT.NODE_HEIGHT / 2);
    const endX = endCenter.x;
    const endY = endCenter.y - (LAYOUT.NODE_HEIGHT / 2) - 8; // 8px for arrowhead clearance
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  // Standard left-to-right orthogonal routing
  const startX = startCenter.x + (LAYOUT.NODE_WIDTH / 2);
  const startY = startCenter.y;
  const endX = endCenter.x - (LAYOUT.NODE_WIDTH / 2) - 8;
  const endY = endCenter.y;
  const midX = startX + ((endX - startX) / 2);

  if (startY === endY) return `M ${startX} ${startY} L ${endX} ${endY}`;
  return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const StatusIndicator = ({ status }) => {
  const map = {
    complete: { bg: 'bg-[#007970]/10', text: 'text-[#007970]', border: 'border-[#007970]/30', icon: CheckCircle2, label: 'COMPLETE' },
    ready: { bg: 'bg-[#004142]/40', text: 'text-teal-400', border: 'border-teal-500/30', icon: PlayCircle, label: 'READY' },
    in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: Clock, label: 'IN PROGRESS' },
    blocked: { bg: 'bg-[#C74600]/10', text: 'text-[#C74600]', border: 'border-[#C74600]/30', icon: ShieldAlert, label: 'BLOCKED' },
    pending: { bg: 'bg-transparent', text: 'text-[#5E6A7F]', border: 'border-[#2A3441]', icon: Clock, label: 'PENDING' }
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={10} />
      {cfg.label}
    </div>
  );
};

export default function SwimlaneWorkflowApp() {
  const [zoomState, setZoomState] = useState({
    level: 'overview', // 'overview' | 'step' | 'form' | 'evidence' | 'signature'
    nodeId: null,
    actionId: null
  });
  
  // Hotkeys & Esc stack popping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setZoomState(prev => {
          if (prev.level !== 'overview' && prev.level !== 'step') return { ...prev, level: 'step', actionId: null };
          return { level: 'overview', nodeId: null, actionId: null };
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    setZoomState({ level: 'step', nodeId, actionId: null });
  };

  const popToStep = () => setZoomState(prev => ({ ...prev, level: 'step', actionId: null }));
  const popToOverview = () => setZoomState({ level: 'overview', nodeId: null, actionId: null });

  const handleBackdropClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      if (zoomState.level === 'step') popToOverview();
      else popToStep();
    }
  };

  const activeNode = useMemo(() => 
    QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes.find(n => n.nodeId === zoomState.nodeId)
  , [zoomState.nodeId]);

  const isFullyZoomed = ['step', 'form', 'evidence', 'signature'].includes(zoomState.level);

  return (
    <div className="flex h-screen w-full bg-[#0B0F15] text-slate-200 font-sans relative selection:bg-[#007970]/30 selection:text-white">
      
      {/* =======================================================================
        LEVEL 0: SWIMLANE CANVAS (Base Layer) 
        Now locks scroll completely when zoomed to preserve unified layout position
        =======================================================================
      */}
      <div 
        id="swimlane-canvas"
        className={`flex-1 relative custom-scrollbar select-none ${isFullyZoomed ? 'overflow-hidden' : 'overflow-auto'}`}
        onClick={popToOverview}
      >
        <div 
          className="relative transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
          style={{ 
            width: LAYOUT.LANE_W + (PHASES.length * LAYOUT.COL_WIDTH), 
            height: LAYOUT.HEADER_H + (ROLES.length * LAYOUT.ROW_HEIGHT),
            opacity: isFullyZoomed ? 0.3 : 1,
            filter: isFullyZoomed ? 'blur(5px)' : 'blur(0px)'
          }}
        >
          {/* Phase Columns */}
          {PHASES.map((phase) => (
            <div key={phase.id} className="absolute top-0 bottom-0 border-r border-[#1C2433] bg-[#0F131A]/30 pointer-events-none"
              style={{ left: LAYOUT.LANE_W + (phase.gridCol * LAYOUT.COL_WIDTH), width: LAYOUT.COL_WIDTH }}>
              <div className="h-[50px] border-b border-[#1C2433] bg-[#0B0F15]/95 backdrop-blur sticky top-0 z-20 flex items-center px-6">
                <span className="text-[11px] font-bold text-[#8A94A6] uppercase tracking-widest">{phase.title}</span>
              </div>
            </div>
          ))}

          {/* Role Rows */}
          {ROLES.map((role, idx) => (
            <div key={role.id} className="absolute left-0 right-0 border-b border-[#1C2433] pointer-events-none"
              style={{ top: LAYOUT.HEADER_H + (idx * LAYOUT.ROW_HEIGHT), height: LAYOUT.ROW_HEIGHT }}>
              <div className="w-[240px] h-full border-r border-[#1C2433] bg-[#0B0F15]/95 backdrop-blur sticky left-0 z-20 flex items-center px-6">
                <span className="text-[11px] font-medium text-[#E2E8F0] leading-snug">{role.title}</span>
              </div>
            </div>
          ))}

          {/* Corner Block */}
          <div className="absolute top-0 left-0 border-b border-r border-[#1C2433] bg-[#0B0F15] z-30 flex items-center px-6"
            style={{ width: LAYOUT.LANE_W, height: LAYOUT.HEADER_H }}>
            <span className="text-[10px] font-bold text-[#5E6A7F] uppercase tracking-wider">QA-WF-03 Roles</span>
          </div>

          {/* SVG Edges */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#4A5568" />
              </marker>
              <marker id="arrowhead-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#007970" />
              </marker>
              <marker id="arrowhead-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#C74600" />
              </marker>
            </defs>

            {QA_WF_03_SWIMLANE_PROTOTYPE_DATA.edges.map((edge, idx) => {
              const fromNode = QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes.find(n => n.nodeId === edge.from);
              const toNode = QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes.find(n => n.nodeId === edge.to);
              if (!fromNode || !toNode) return null;

              const startCenter = {
                x: LAYOUT.LANE_W + (fromNode.gridX * LAYOUT.COL_WIDTH) + (LAYOUT.COL_WIDTH / 2),
                y: LAYOUT.HEADER_H + (fromNode.gridY * LAYOUT.ROW_HEIGHT) + (LAYOUT.ROW_HEIGHT / 2)
              };
              const endCenter = {
                x: LAYOUT.LANE_W + (toNode.gridX * LAYOUT.COL_WIDTH) + (LAYOUT.COL_WIDTH / 2),
                y: LAYOUT.HEADER_H + (toNode.gridY * LAYOUT.ROW_HEIGHT) + (LAYOUT.ROW_HEIGHT / 2)
              };

              const pathString = computeOrthogonalPath(startCenter, endCenter);
              const isCompletedEdge = fromNode.status === 'complete' && toNode.status === 'complete';
              const isFinalEdge = toNode.nodeId === 'n9'; // Routing into the final package lock
              
              const strokeColor = isFinalEdge ? "#C74600" : (isCompletedEdge ? "#007970" : "#2A3441");
              const marker = isFinalEdge ? "url(#arrowhead-orange)" : (isCompletedEdge ? "url(#arrowhead-active)" : "url(#arrowhead)");

              return (
                <g key={idx}>
                  {isCompletedEdge && (
                    <path 
                      d={pathString} 
                      stroke={isFinalEdge ? "#C74600" : "#007970"} 
                      strokeWidth="5" 
                      fill="none" 
                      className={isFinalEdge ? "edge-radiate-orange" : "edge-radiate-teal"}
                      style={{ filter: 'blur(3px)' }}
                    />
                  )}
                  <path 
                    d={pathString} 
                    stroke={strokeColor} 
                    strokeWidth={isCompletedEdge ? "2" : "1.5"} 
                    fill="none" 
                    markerEnd={marker} 
                    className="transition-colors duration-300"
                  />
                </g>
              );
            })}
          </svg>

          {/* Render Nodes */}
          {QA_WF_03_SWIMLANE_PROTOTYPE_DATA.nodes.map(node => {
            const centerX = LAYOUT.LANE_W + (node.gridX * LAYOUT.COL_WIDTH) + (LAYOUT.COL_WIDTH / 2);
            const centerY = LAYOUT.HEADER_H + (node.gridY * LAYOUT.ROW_HEIGHT) + (LAYOUT.ROW_HEIGHT / 2);
            
            const isSelected = zoomState.nodeId === node.nodeId;
            const isCompleted = node.status === 'complete';
            const isFinalNode = node.nodeId === 'n9'; // Final package lock

            // Compute dynamic classes for standard teal or final orange
            let nodeClasses = 'bg-[#141A23] border-[#2A3441] hover:border-[#4A5568] hover:scale-[1.02]';
            
            if (isCompleted && !isFinalNode) {
              nodeClasses = 'completed-node bg-[#004142]/20 border-[#007970]';
            } else if (isCompleted && isFinalNode) {
              nodeClasses = 'orange-completed-node bg-[#C74600]/10 border-[#C74600]';
            }

            if (isSelected) {
              nodeClasses += isFinalNode ? ' ring-2 ring-[#C74600] scale-105' : ' ring-2 ring-[#007970] scale-105';
            }

            return (
              <div 
                key={node.nodeId} onClick={(e) => handleNodeClick(e, node.nodeId)}
                tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleNodeClick(e, node.nodeId); }}
                className={`absolute z-20 flex flex-col p-4 rounded-xl border cursor-pointer transition-all duration-300 outline-none group ${nodeClasses}`}
                style={{ 
                  left: `${centerX}px`, top: `${centerY}px`, width: `${LAYOUT.NODE_WIDTH}px`, height: `${LAYOUT.NODE_HEIGHT}px`,
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-[#5E6A7F]">{node.taskId}</span>
                  <StatusIndicator status={node.status} />
                </div>
                
                <h4 className="text-[13px] font-medium mb-1.5 leading-snug line-clamp-2 text-[#E2E8F0] group-hover:text-white transition-colors">
                  {node.title}
                </h4>
                
                {/* Micro Gates */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-[#1C2433]">
                  {node.requiredForms.length > 0 && <div className="flex items-center gap-1 text-[9px] font-mono text-[#007970]"><FileText size={10} /> Form</div>}
                  {node.requiredEvidence.length > 0 && <div className="flex items-center gap-1 text-[9px] font-mono text-[#A0ABC0]"><FileBox size={10} /> Evid</div>}
                  {node.signerRole && <div className="flex items-center gap-1 text-[9px] font-mono text-[#A0ABC0]"><FileSignature size={10} /> Sign</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
        LEVEL 1 & 2: ZOOM OVERLAY LAYER
        =======================================================================
      */}
      {isFullyZoomed && (
        <div 
          id="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0B0F15]/70 animate-fadeIn"
          onClick={handleBackdropClick}
        >
          
          {/* === LEVEL 1: STEP FOCUS MODAL (Wrapped in SpotlightCard) === */}
          {zoomState.level === 'step' && activeNode && (
            <SpotlightCard 
              className="w-full max-w-4xl max-h-[85vh] animate-zoomIn ring-1 ring-white/5" 
              spotlightColor="rgba(0, 121, 112, 0.12)"
            >
              {/* Focus Header */}
              <div className="px-8 py-6 border-b border-[#1C2433] bg-[#141A23]/80 backdrop-blur-sm flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={popToOverview} className="text-[#5E6A7F] hover:text-white text-xs font-medium flex items-center gap-1 bg-[#1C2433] hover:bg-[#2A3441] px-2 py-1 rounded transition-colors relative z-20">
                      <ArrowLeft size={12} /> Back to Swimlane
                    </button>
                    <span className="text-[#5E6A7F] text-xs">/</span>
                    <span className="text-[10px] font-mono text-[#007970] tracking-wider uppercase flex items-center gap-1">
                      <Maximize2 size={10} /> Zoom Level 1: Step Focus
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white leading-tight mt-2">
                    {activeNode.title}
                  </h2>
                  <p className="text-[#A0ABC0] text-sm mt-2 max-w-2xl">
                    {activeNode.shortDescription}
                  </p>
                </div>
                <button onClick={popToOverview} className="p-2 text-[#5E6A7F] hover:text-white rounded-lg hover:bg-[#1C2433] transition-colors relative z-20" aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              {/* Focus Body */}
              <div className="flex-1 overflow-y-auto p-8 flex gap-8 custom-scrollbar bg-transparent">
                
                {/* Left Column: Context & Audit */}
                <div className="flex-1 space-y-6 relative z-20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#141A23] p-4 rounded-xl border border-[#1C2433] shadow-lg shadow-black/20">
                      <div className="text-[10px] text-[#5E6A7F] uppercase tracking-wider mb-1">Task Context</div>
                      <div className="font-mono text-sm text-white">{activeNode.taskId}</div>
                    </div>
                    <div className="bg-[#141A23] p-4 rounded-xl border border-[#1C2433] shadow-lg shadow-black/20">
                      <div className="text-[10px] text-[#5E6A7F] uppercase tracking-wider mb-1">Status</div>
                      <StatusIndicator status={activeNode.status} />
                    </div>
                  </div>

                  <div className="bg-[#141A23] p-5 rounded-xl border border-[#1C2433] shadow-lg shadow-black/20">
                    <div className="text-[10px] text-[#5E6A7F] uppercase tracking-wider mb-3">Workflow Accountability</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1C2433] border border-[#2A3441] flex items-center justify-center text-[#A0ABC0] font-bold text-sm">
                        {activeNode.ownerRole.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{activeNode.ownerRole}</div>
                        <div className="text-xs text-[#5E6A7F]">Phase: {PHASES.find(p => p.id === activeNode.phaseId)?.title}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-[#004142]/10 border border-[#007970]/20 rounded-xl">
                    <div className="flex items-center gap-2 text-[#007970] text-[10px] font-bold uppercase tracking-wider mb-2">
                      <Info size={14} /> Compliance Audit Purpose
                    </div>
                    <p className="text-sm text-teal-100/80 leading-relaxed">
                      {activeNode.auditPurpose}
                    </p>
                  </div>
                </div>

                {/* Right Column: Execution Gates & Actions */}
                <div className="w-[340px] flex-shrink-0 space-y-4 relative z-20">
                  <h3 className="text-xs font-bold text-[#5E6A7F] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1C2433] pb-2">
                    <FileKey size={14} className="text-[#007970]"/> 
                    Execution Workspaces
                  </h3>

                  {/* Forms Action Gate */}
                  <div className="p-4 rounded-xl border border-[#1C2433] bg-[#141A23] shadow-lg shadow-black/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs font-medium text-white mb-1">Required Forms</div>
                        <div className="text-[10px] text-[#8A94A6]">
                          {activeNode.requiredForms.length ? activeNode.requiredForms.join(', ') : 'No forms required'}
                        </div>
                      </div>
                      <FileText size={16} className={activeNode.requiredForms.length ? "text-[#007970]" : "text-[#5E6A7F]"} />
                    </div>
                    <button 
                      onClick={() => setZoomState({ level: 'form', nodeId: activeNode.nodeId, actionId: activeNode.requiredForms[0] })}
                      disabled={activeNode.requiredForms.length === 0}
                      className="w-full py-2 bg-[#007970] hover:bg-[#009085] disabled:bg-[#1C2433] disabled:text-[#5E6A7F] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <Maximize2 size={12} /> Zoom to Form Workspace
                    </button>
                  </div>

                  {/* Evidence Action Gate */}
                  <div className="p-4 rounded-xl border border-[#1C2433] bg-[#141A23] shadow-lg shadow-black/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs font-medium text-white mb-1">Supporting Evidence</div>
                        <div className="text-[10px] text-[#8A94A6] line-clamp-1">
                          {activeNode.requiredEvidence.length ? activeNode.requiredEvidence.join(', ') : 'No evidence required'}
                        </div>
                      </div>
                      <FileBox size={16} className={activeNode.requiredEvidence.length ? "text-[#007970]" : "text-[#5E6A7F]"} />
                    </div>
                    <button 
                      onClick={() => setZoomState({ level: 'evidence', nodeId: activeNode.nodeId, actionId: 'evidence' })}
                      disabled={activeNode.requiredEvidence.length === 0}
                      className="w-full py-2 bg-[#1C2433] hover:bg-[#2A3441] disabled:bg-transparent disabled:border-[#1C2433] disabled:text-[#5E6A7F] border border-[#2A3441] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <UploadCloud size={12} /> Open Evidence Workspace
                    </button>
                  </div>

                  {/* Signature Action Gate */}
                  <div className="p-4 rounded-xl border border-[#1C2433] bg-[#141A23] shadow-lg shadow-black/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs font-medium text-white mb-1">eCIgn Ceremony</div>
                        <div className="text-[10px] text-[#8A94A6]">
                          {activeNode.signerRole ? `Requires: ${activeNode.signerRole}` : 'No signatures required'}
                        </div>
                      </div>
                      <FileSignature size={16} className={activeNode.signerRole ? "text-[#007970]" : "text-[#5E6A7F]"} />
                    </div>
                    <button 
                      onClick={() => setZoomState({ level: 'signature', nodeId: activeNode.nodeId, actionId: 'sign' })}
                      disabled={!activeNode.signerRole}
                      className="w-full py-2 bg-[#007970] hover:bg-[#009085] disabled:bg-[#1C2433] disabled:text-[#5E6A7F] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <FileSignature size={12} /> Enter Signature Ceremony
                    </button>
                  </div>

                </div>
              </div>
            </SpotlightCard>
          )}


          {/* === LEVEL 2: DEEP WORKSPACES (Wrapped in SpotlightCard) === */}
          {['form', 'evidence', 'signature'].includes(zoomState.level) && activeNode && (
            <SpotlightCard 
              className="w-full h-full max-w-[1200px] max-h-[90vh] animate-zoomInDeeper"
              spotlightColor="rgba(0, 121, 112, 0.12)"
            >
              <div className="px-6 py-4 border-b border-[#1C2433] bg-[#141A23]/80 backdrop-blur-sm flex items-center justify-between relative z-20">
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={popToOverview} className="text-[#5E6A7F] hover:text-white transition-colors">QA-WF-03 Swimlane</button>
                  <ChevronRight size={12} className="text-[#5E6A7F]" />
                  <button onClick={popToStep} className="text-[#A0ABC0] hover:text-white transition-colors">{activeNode.title}</button>
                  <ChevronRight size={12} className="text-[#5E6A7F]" />
                  <span className="text-[#007970] font-mono font-bold">
                    {zoomState.level === 'form' ? `FORM: ${zoomState.actionId}` : zoomState.level.toUpperCase() + ' WORKSPACE'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={popToStep} className="px-3 py-1.5 bg-[#1C2433] hover:bg-[#2A3441] text-xs font-medium rounded-lg text-white transition-colors">
                    Back to Step
                  </button>
                  <button onClick={popToOverview} className="px-3 py-1.5 hover:bg-[#1C2433] text-xs font-medium rounded-lg text-[#5E6A7F] hover:text-white transition-colors">
                    Close
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-transparent p-8 flex items-center justify-center relative z-20">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1C2433] border border-[#2A3441] flex items-center justify-center shadow-xl shadow-black/20">
                    {zoomState.level === 'form' && <FileText size={24} className="text-[#007970]" />}
                    {zoomState.level === 'evidence' && <UploadCloud size={24} className="text-[#007970]" />}
                    {zoomState.level === 'signature' && <FileSignature size={24} className="text-[#007970]" />}
                  </div>
                  <h3 className="text-xl font-medium text-white capitalize">
                    {zoomState.level} Execution Workspace
                  </h3>
                  <p className="text-sm text-[#8A94A6]">
                    This is Level 2 of the progressive zoom stack. Actual form rendering, artifact uploading, or signature ceremony orchestration occurs here, preserving stable instance IDs for <span className="font-mono text-white">{activeNode.taskId}</span>.
                  </p>
                </div>
              </div>
            </SpotlightCard>
          )}

        </div>
      )}

      {/* Global CSS for completed node animation, zoom transitions, and Spotlight */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1C2433; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A3441; }
        
        /* SpotlightCard Styles (from React Bits) */
        .card-spotlight {
          position: relative;
          border-radius: 1rem;
          border: 1px solid #1C2433;
          background-color: #0F131A;
          overflow: hidden;
          --mouse-x: 50%;
          --mouse-y: 50%;
          --spotlight-color: rgba(255, 255, 255, 0.05);
        }
        .card-spotlight::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
          z-index: 1; /* Render strictly under the z-20 content */
        }
        .card-spotlight:hover::before,
        .card-spotlight:focus-within::before {
          opacity: 1;
        }

        /* Radiating Teal Effect for Standard Completed Nodes */
        .completed-node {
          position: absolute;
          box-shadow: 0 0 0 1px rgba(0, 121, 112, 0.35), 0 0 24px rgba(0, 121, 112, 0.22);
        }
        .completed-node::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: inherit;
          border: 1px solid rgba(0, 121, 112, 0.45);
          animation: tealRadiate 3s ease-out infinite;
          pointer-events: none;
        }
        @keyframes tealRadiate {
          0% { opacity: 0.5; transform: scale(0.98); }
          60% { opacity: 0; transform: scale(1.08); }
          100% { opacity: 0; transform: scale(1.08); }
        }

        /* Radiating Orange Effect for Final Locked Node */
        .orange-completed-node {
          position: absolute;
          box-shadow: 0 0 0 1px rgba(199, 70, 0, 0.35), 0 0 24px rgba(199, 70, 0, 0.22);
        }
        .orange-completed-node::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: inherit;
          border: 1px solid rgba(199, 70, 0, 0.45);
          animation: orangeRadiate 3s ease-out infinite;
          pointer-events: none;
        }
        @keyframes orangeRadiate {
          0% { opacity: 0.5; transform: scale(0.98); }
          60% { opacity: 0; transform: scale(1.08); }
          100% { opacity: 0; transform: scale(1.08); }
        }

        /* Marching Ants / Radiating Edge Glow with Directional Flow */
        .edge-radiate-teal {
          stroke-dasharray: 20 30;
          animation: edgeFlow 1.5s linear infinite, edgeGlowTeal 3s ease-in-out infinite;
        }
        .edge-radiate-orange {
          stroke-dasharray: 20 30;
          animation: edgeFlow 1.5s linear infinite, edgeGlowOrange 3s ease-in-out infinite;
        }

        @keyframes edgeFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -50; } 
        }
        @keyframes edgeGlowTeal {
          0% { opacity: 0.2; }
          50% { opacity: 0.9; }
          100% { opacity: 0.2; }
        }
        @keyframes edgeGlowOrange {
          0% { opacity: 0.2; }
          50% { opacity: 0.9; }
          100% { opacity: 0.2; }
        }

        @media (prefers-reduced-motion: reduce) {
          .completed-node::after, .orange-completed-node::after { animation: none; }
          .edge-radiate-teal, .edge-radiate-orange { animation: none; opacity: 0.4; stroke-dasharray: none; }
        }

        /* Clean Zoom Entry Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes zoomInModal {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-zoomIn {
          animation: zoomInModal 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        @keyframes zoomInDeeper {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-zoomInDeeper {
          animation: zoomInDeeper 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
      `}} />
    </div>
  );
}