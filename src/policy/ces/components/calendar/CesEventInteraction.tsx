import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, ChevronRight, ExternalLink, History,
  ListChecks, Lock, ShieldCheck, X,
} from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { daysUntil, TODAY_ANCHOR } from '@/policy/data/regulatoryEvents';
import { getCesExecutionMode, CES_EXECUTION_MODE_LABEL } from '@/policy/ces/cesExecutionMode';
import { useEventExecutionDataflow } from '@/policy/compliance-execution';
import type { EventTask } from '@/policy/compliance-execution/types';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';
import {
  classifyInstance, STATE_COLOR, STATE_LABEL, type InstanceState,
  TEAL_PRIMARY,
} from '@/policy/components/regulatory/timelineState';
import { classifyAuditState, AUDIT_STATE_COLOR, AUDIT_STATE_LABEL } from '@/policy/audit/auditState';
import { getSwimlaneRegistryEntry } from '@/policy/workflows/swimlanes/swimlaneRegistry';

export const CES_CALENDAR_LAYOUT = {
  CANVAS_WIDTH: 1760,
  CANVAS_HEIGHT: 1040,
};

export type CesZoomLevel = 'overview' | 'calendar' | 'preview' | 'detail' | 'workflow' | 'audit';

export interface EventOverviewParticipant {
  id: string;
  label: string;
  roleType: string;
  responseStatus?: string;
  signerFlag?: string;
}

export function useCesInfiniteZoom() {
  const [level, setLevel] = useState<CesZoomLevel>('overview');
  const [event, setEvent] = useState<RegulatoryEvent | null>(null);

  return {
    zoomState: { level, event },
    openPreview: (nextEvent: RegulatoryEvent) => {
      setEvent(nextEvent);
      setLevel('preview');
    },
    openDetail: () => setLevel('detail'),
    openAudit: () => setLevel('audit'),
    backToPreview: () => setLevel('preview'),
    closeZoom: () => {
      setLevel('overview');
      setEvent(null);
    },
  };
}

export function useMousePanCanvas(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    let rafId: number | null = null;

    const handlePan = (e: MouseEvent) => {
      if (!enabled) return;
      if (!canvasRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!canvasRef.current) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const totalW = CES_CALENDAR_LAYOUT.CANVAS_WIDTH;
        const totalH = CES_CALENDAR_LAYOUT.CANVAS_HEIGHT;
        const maxPanX = Math.max(0, totalW - w);
        const maxPanY = Math.max(0, totalH - h);
        const pctX = e.clientX / w;
        const pctY = e.clientY / h;

        canvasRef.current.style.transform = `translate(${-pctX * maxPanX}px, ${-pctY * maxPanY}px)`;
      });
    };

    window.addEventListener('mousemove', handlePan);

    return () => {
      window.removeEventListener('mousemove', handlePan);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [canvasRef, enabled]);
}

export function CesInteractionStyles() {
  return (
    <style>{`
      .ces-card-spotlight {
        --mouse-x: 50%;
        --mouse-y: 50%;
        --spotlight-color: rgba(0, 121, 112, 0.16);
        position: relative;
        overflow: hidden;
        border-radius: 14px;
        background:
          radial-gradient(
            500px circle at var(--mouse-x) var(--mouse-y),
            var(--spotlight-color),
            transparent 42%
          ),
          rgba(15, 19, 26, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: border-color 180ms ease, background-color 180ms ease;
      }
      .ces-card-spotlight:focus-visible {
        outline: 2px solid rgba(94, 234, 212, 0.75);
        outline-offset: 1px;
      }
      .ces-card-spotlight::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(
            135deg,
            rgba(0, 121, 112, 0.08),
            transparent 40%,
            rgba(199, 70, 0, 0.05)
          );
        opacity: 0;
        transition: opacity 180ms ease;
        z-index: 1;
      }
      .ces-card-spotlight:hover::before,
      .ces-card-spotlight:focus-visible::before {
        opacity: 1;
      }
      .ces-card-spotlight-complete {
        box-shadow: inset 0 0 0 1px rgba(20,184,166,0.22);
      }
      .ces-card-spotlight-critical {
        box-shadow: inset 0 0 0 1px rgba(248,113,113,0.20);
      }
      .ces-zoom-backdrop {
        background:
          radial-gradient(900px circle at 50% 20%, rgba(20,184,166,0.16), transparent 46%),
          rgba(4, 8, 13, 0.72);
        backdrop-filter: blur(18px);
      }
      .ces-zoom-card {
        background:
          radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 20%), var(--spotlight-color, rgba(20,184,166,0.18)), transparent 45%),
          rgba(13, 18, 27, 0.96);
        border: 1px solid rgba(255,255,255,0.12);
      }
      .ces-audit-scrollbar-hidden {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .ces-audit-scrollbar-hidden::-webkit-scrollbar {
        display: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .ces-card-spotlight,
        .ces-card-spotlight::before,
        .ces-zoom-card {
          transition: none !important;
        }
      }
    `}</style>
  );
}

export function getCesEventSpotlightTone(state: InstanceState, certified: boolean) {
  if (certified || state === 'complete') return 'rgba(20, 184, 166, 0.22)';
  if (state === 'blocked' || state === 'overdue') return 'rgba(239, 68, 68, 0.20)';
  if (state === 'due-soon') return 'rgba(249, 115, 22, 0.18)';
  return 'rgba(20, 184, 166, 0.18)';
}

export function buildEventOverviewParticipants(event: RegulatoryEvent): EventOverviewParticipant[] {
  const participants: EventOverviewParticipant[] = [];
  const seen = new Set<string>();

  const addParticipant = (input: {
    key?: string;
    label?: string | null;
    roleType?: string | null;
    responseStatus?: string;
    signerFlag?: string;
  }) => {
    const label = input.label?.trim();
    const roleType = input.roleType?.trim() || label;
    if (!label || !roleType) return;
    const key = (input.key ?? `${label}::${roleType}`).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    participants.push({
      id: key.replace(/[^a-z0-9]+/g, '-'),
      label,
      roleType,
      responseStatus: input.responseStatus,
      signerFlag: input.signerFlag,
    });
  };

  addParticipant({
    key: `organizer::${event.owner}::${event.ownerRole}`,
    label: event.owner,
    roleType: event.ownerRole || 'Organizer',
    responseStatus: 'Organizer',
  });

  if (event.minutes?.assignee) {
    addParticipant({
      key: `minutes-assignee::${event.minutes.assignee}`,
      label: event.minutes.assignee,
      roleType: 'Minutes assignee',
      responseStatus: 'Pending',
    });
  }

  (event.minutes?.signOffRoles ?? []).forEach(role => {
    addParticipant({
      key: `signer::${role}`,
      label: role,
      roleType: role,
      responseStatus: 'Required signer',
      signerFlag: 'Signer',
    });
  });

  (event.approvals ?? []).forEach(approval => {
    addParticipant({
      key: `approval::${approval.approverRole}`,
      label: approval.approverRole,
      roleType: approval.approverRole,
      responseStatus: approval.required ? 'Pending' : 'Maybe',
      signerFlag: approval.targetKind === 'minutes' || approval.targetKind === 'report' || approval.targetKind === 'event' ? 'Reviewer' : undefined,
    });
  });

  (event.agenda?.standingTopics ?? []).forEach(topic => {
    addParticipant({
      key: `agenda-owner::${topic.owner}`,
      label: topic.owner,
      roleType: topic.owner,
      responseStatus: 'Agenda owner',
    });
  });

  return participants;
}

export function CesSpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(0, 121, 112, 0.18)',
  onClick,
  title,
  ariaLabel,
  toneClassName = '',
  style,
  ...buttonProps
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  ariaLabel?: string;
  toneClassName?: string;
  style?: React.CSSProperties;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur' | 'onKeyDown'>) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    buttonRef.current.style.setProperty('--mouse-x', `${x}px`);
    buttonRef.current.style.setProperty('--mouse-y', `${y}px`);
    buttonRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onMouseMove={handleMouseMove}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className={`ces-card-spotlight ${toneClassName} ${className}`}
      style={style}
      {...buttonProps}
    >
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </button>
  );
}

export function CesEventOverviewCard({
  event,
  today = TODAY_ANCHOR,
  onOpenSwimlane,
  actionLabel = 'Open Event Swimlane',
}: {
  event: RegulatoryEvent;
  today?: Date;
  onOpenSwimlane: () => void;
  actionLabel?: string;
}) {
  const store = useRegulatoryExecutionStore();
  const state = classifyInstance(event, today, store);
  const certified = store.isCertified(event.id);
  const auditState = classifyAuditState(event, today, store);
  const sla = computeCesSla(event, today);
  const mode = getCesExecutionMode(event.date);
  const participants = useMemo(() => buildEventOverviewParticipants(event), [event]);
  const validation = useMemo(() => store.validateEvent(event), [event, store]);
  const signerRoles = event.minutes?.signOffRoles ?? [];
  const agendaOwners = Array.from(new Set((event.agenda?.standingTopics ?? []).map(topic => topic.owner).filter(Boolean))) as string[];
  const auditReadinessScore = useMemo(() => {
    const stepRatio = validation.progress.stepsTotal > 0
      ? validation.progress.stepsComplete / validation.progress.stepsTotal
      : 1;
    const formRatio = validation.progress.formsTotal > 0
      ? validation.progress.formsComplete / validation.progress.formsTotal
      : 1;
    const minutesRatio = validation.progress.minutesRequired
      ? (validation.progress.minutesFinalized ? 1 : 0)
      : 1;
    const requiredApprovals = (event.approvals ?? []).filter(approval => approval.required);
    const approvedApprovals = requiredApprovals.filter(approval =>
      store.approvals.some(candidate =>
        candidate.eventId === event.id
        && candidate.targetKind === approval.targetKind
        && candidate.targetLabel === approval.targetLabel
        && candidate.status === 'approved',
      ),
    ).length;
    const approvalRatio = requiredApprovals.length > 0 ? approvedApprovals / requiredApprovals.length : 1;
    return Math.round(((stepRatio + formRatio + minutesRatio + approvalRatio) / 4) * 100);
  }, [event, store.approvals, validation]);

  return (
    <div className="rounded-[24px] border border-[#1C2433] bg-[linear-gradient(180deg,rgba(20,26,35,0.98),rgba(11,15,21,0.98))] p-5 text-[#E2E8F0] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]">
            <span style={{ color: STATE_COLOR[state] }}>{STATE_LABEL[state]}</span>
            <span className="rounded-full border border-[#1C2433] bg-[#141A23] px-2 py-0.5 text-[#8A94A6]">{event.id}</span>
            <span className="rounded-full border border-[#007970]/35 bg-[#004142]/18 px-2 py-0.5 text-[#8BE6DF]">{event.domain}</span>
            {mode !== 'production' && <Badge>{CES_EXECUTION_MODE_LABEL[mode]}</Badge>}
            {certified && <Badge><Lock size={10} /> Locked</Badge>}
          </div>
          <h2 className="mt-3 font-outfit text-[26px] font-light leading-tight text-white">{event.title}</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-[#A0ABC0]">
            {event.summary ?? event.regulatoryDriver ?? 'Compliance event ready for event-specific swimlane execution.'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-[11px] sm:grid-cols-3">
        <Metric value={`${event.processFlow.length}`} label="steps" />
        <Metric value={sla.label} label="SLA" tone={sla.tone} />
        <Metric value={state === 'blocked' || state === 'overdue' ? 'High' : state === 'due-soon' ? 'Medium' : 'Low'} label="risk" tone={state} />
        <Metric value={`${auditReadinessScore}%`} label="audit ready" />
        <Metric value={AUDIT_STATE_LABEL[auditState]} label="audit state" tone={auditState} />
        <Metric value={event.workflowId ?? 'No workflow'} label="workflow" />
      </div>

      <div className="mt-5 grid gap-x-6 gap-y-2 text-[12px] text-[#A0ABC0] sm:grid-cols-2">
        <Metadata label="Date" value={event.endDate ? `${event.date} - ${event.endDate}` : event.date} />
        <Metadata label="Time" value={event.allDay || !event.time ? 'All day' : `${event.time}${event.timeEnd ? ` - ${event.timeEnd}` : ''}`} />
        <Metadata label="Owner role" value={event.ownerRole || 'Unassigned'} />
        <Metadata label="Cadence" value={event.cadence} />
        <Metadata label="Workflow ID" value={event.workflowId ?? 'No workflow swimlane mapped'} />
        <Metadata label="Audit state" value={AUDIT_STATE_LABEL[auditState]} />
        <Metadata label="Regulatory driver" value={event.regulatoryDriver ?? 'No regulatory driver captured.'} />
        <Metadata label="Short description" value={event.summary ?? 'No summary captured for this event.'} />
        <Metadata label="Required signer roles" value={signerRoles.length ? signerRoles.join(', ') : 'No signer roles configured.'} />
        <Metadata label="Agenda owners" value={agendaOwners.length ? agendaOwners.join(', ') : 'No agenda owners configured.'} />
      </div>

      <section className="mt-5 border-t border-[#1C2433] pt-4">
        <div className="mb-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-[#8A94A6]">
          Attendees / Participants
        </div>
        {participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-[#E2E8F0]">{participant.label}</div>
                  <div className="text-[11px] text-[#8A94A6]">{participant.roleType}</div>
                </div>
                <div className="shrink-0 text-right">
                  {participant.responseStatus ? (
                    <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#8BE6DF]">{participant.responseStatus}</div>
                  ) : null}
                  {participant.signerFlag ? (
                    <div className="mt-1 text-[10px] text-[#FFB18D]">{participant.signerFlag}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[12px] text-[#8A94A6]">No attendees configured for this event.</div>
        )}
      </section>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#1C2433] pt-4">
        <span className="text-[11px] text-[#8A94A6]">Click to open event swimlane.</span>
        <button
          type="button"
          onClick={onOpenSwimlane}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#C74600]/42 bg-[#C74600]/12 px-4 py-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#C74600] hover:bg-[#C74600]/18"
        >
          {actionLabel}
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

export function CesEventPreviewModal({
  event,
  today = TODAY_ANCHOR,
  onClose,
  onOpenSwimlane,
}: {
  event: RegulatoryEvent;
  today?: Date;
  onClose: () => void;
  onOpenSwimlane: () => void;
}) {
  return (
    <CesEventZoomModal onClose={onClose} maxWidth="max-w-xl">
      <div className="p-5">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/45 hover:text-white"
            aria-label="Close event preview"
          >
            <X size={16} />
          </button>
        </div>
        <CesEventOverviewCard event={event} today={today} onOpenSwimlane={onOpenSwimlane} />
      </div>
    </CesEventZoomModal>
  );
}

export function CesEventDetailModal({
  event,
  today = TODAY_ANCHOR,
  initialTab = 'overview',
  onClose,
  onBack,
}: {
  event: RegulatoryEvent;
  today?: Date;
  initialTab?: 'overview' | 'tasks' | 'audit';
  onClose: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'overview' | 'tasks' | 'audit'>(initialTab);
  const store = useRegulatoryExecutionStore();
  const dataflow = useEventExecutionDataflow(event);
  const navigate = useNavigate();
  const state = classifyInstance(event, today, store);
  const certified = store.isCertified(event.id);
  const auditState = classifyAuditState(event, today, store);
  const sla = computeCesSla(event, today);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, event.id]);

  const openTask = (task: EventTask) => {
    const workflowId = task.workflowId ?? event.workflowId ?? '';
    const registryEntry = getSwimlaneRegistryEntry({
      workflowId,
      eventId: dataflow?.eventId ?? event.id,
      taskId: task.id,
    });
    navigate(registryEntry.route);
    onClose();
  };

  return (
    <CesEventZoomModal onClose={onClose} maxWidth="max-w-5xl">
      <div className="flex max-h-[82vh] min-h-[620px] flex-col overflow-hidden">
        <header className="border-b border-white/10 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]">
                <span style={{ color: STATE_COLOR[state] }}>{STATE_LABEL[state]}</span>
                <span className="text-white/35">{event.id}</span>
                {certified && <Badge><Lock size={10} /> Certified / Locked</Badge>}
                <Badge>{event.domain}</Badge>
              </div>
              <h2 className="mt-3 font-outfit text-3xl font-light leading-tight text-white">
                {event.title}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={onBack} className="rounded-md p-2 text-white/45 hover:text-white" aria-label="Back to event preview">
                <ArrowLeft size={16} />
              </button>
              <button type="button" onClick={onClose} className="rounded-md p-2 text-white/45 hover:text-white" aria-label="Close event detail">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-6 text-[11px] text-white/75">
            <Metric value={`${event.processFlow.length}`} label="steps" />
            <Metric value={sla.label} label="SLA" tone={sla.tone} />
            <Metric value={state === 'blocked' || state === 'overdue' ? 'High' : state === 'due-soon' ? 'Medium' : 'Low'} label="risk" tone={state} />
            <Metric value={`${dataflow?.auditReadinessScore ?? 0}%`} label="audit ready" />
            <Metric value={AUDIT_STATE_LABEL[auditState]} label="audit trail" tone={auditState} />
          </div>
        </header>

        <nav className="flex border-b border-white/10 bg-white/[0.025]">
          <ZoomTab active={tab === 'overview'} onClick={() => setTab('overview')} icon={<CalendarDays size={12} />} label="Overview" />
          <ZoomTab active={tab === 'tasks'} onClick={() => setTab('tasks')} icon={<ListChecks size={12} />} label="Tasks" />
          <ZoomTab active={tab === 'audit'} onClick={() => setTab('audit')} icon={<History size={12} />} label="Audit Trail" />
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto ces-audit-scrollbar-hidden px-6 py-5">
          {tab === 'overview' && (
            <OverviewTab event={event} state={state} />
          )}
          {tab === 'tasks' && (
            <TasksTab tasks={dataflow?.tasks.filter(task => !task.isDeleted) ?? []} onOpenTask={openTask} />
          )}
          {tab === 'audit' && dataflow && (
            <CesAuditTrailView dataflow={dataflow} />
          )}
        </div>
      </div>
    </CesEventZoomModal>
  );
}

export function CesAuditTrailView({
  dataflow,
}: {
  dataflow: NonNullable<ReturnType<typeof useEventExecutionDataflow>>;
}) {
  const evidenceById = useMemo(() => new Map(dataflow.evidence.map(doc => [doc.id, doc])), [dataflow.evidence]);
  const rows = dataflow.auditTrail;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-[12px] text-white/60">
        No audit trail entries exist for this event yet. No placeholder audit records have been generated.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {rows.map(row => {
        const artifact = row.entityType === 'evidence' ? evidenceById.get(row.entityId) : undefined;
        return (
          <article key={row.auditId} className="rounded-xl border border-white/10 bg-[#0B0F15]/85 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]">
                  <span className="text-[#14B8A6]">{row.action}</span>
                  <span className="text-white/35">{row.entityType}</span>
                  <span className="text-white/35">{row.auditId}</span>
                </div>
                <p className="mt-2 text-[12px] text-white/80">
                  {row.reason ?? `${row.entityId} changed by ${row.actorRole ?? row.actorId ?? 'system'}.`}
                </p>
              </div>
              <time className="shrink-0 text-[10px] text-white/40">
                {new Date(row.timestamp).toLocaleString()}
              </time>
            </div>
            <div className="mt-3 max-h-28 overflow-y-auto rounded-lg bg-black/25 p-3 font-mono text-[10px] leading-relaxed text-white/45 ces-audit-scrollbar-hidden">
              {JSON.stringify({ before: row.before ?? null, after: row.after ?? null, hash: row.currentHash ?? null }, null, 2)}
            </div>
            {artifact && (
              <button
                type="button"
                onClick={() => window.open(buildArtifactRoute(artifact.id, { eventId: dataflow.eventId, taskId: artifact.taskId, evidenceId: artifact.id, type: artifact.artifactType ?? 'evidence' }), '_blank', 'noopener,noreferrer')}
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#14B8A6] hover:text-white"
              >
                <ExternalLink size={11} />
                Open Artifact
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function CesEventZoomModal({
  children,
  onClose,
  maxWidth,
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    cardRef.current.style.setProperty('--spotlight-color', 'rgba(20, 184, 166, 0.20)');
  };

  return (
    <div className="ces-zoom-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-6" onMouseDown={onClose}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        onMouseMove={handleMouseMove}
        onMouseDown={e => e.stopPropagation()}
        className={`ces-zoom-card w-full ${maxWidth} overflow-hidden rounded-3xl`}
      >
        {children}
      </div>
    </div>
  );
}

function OverviewTab({ event, state }: { event: RegulatoryEvent; state: InstanceState }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <p className="text-[13px] leading-relaxed text-white/72">
          {event.summary ?? event.regulatoryDriver ?? 'This event is part of the CES calendar workflow surface.'}
        </p>
        {event.regulatoryDriver && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-white/45">
              <ShieldCheck size={12} />
              Regulatory Driver
            </div>
            <p className="text-[12px] leading-relaxed text-white/70">{event.regulatoryDriver}</p>
          </div>
        )}
      </section>
      <section className="space-y-3 text-[12px] text-white/70">
        <Metadata label="Date" value={event.endDate ? `${event.date} - ${event.endDate}` : event.date} />
        <Metadata label="Time" value={event.allDay || !event.time ? 'All day' : `${event.time}${event.timeEnd ? ` - ${event.timeEnd}` : ''}`} />
        <Metadata label="Owner" value={`${event.owner} · ${event.ownerRole}`} />
        <Metadata label="Cadence" value={event.cadence} />
        <Metadata label="Workflow" value={event.workflowId ?? 'No workflow swimlane mapped'} />
        <Metadata label="State" value={STATE_LABEL[state]} />
      </section>
    </div>
  );
}

function TasksTab({
  tasks,
  onOpenTask,
}: {
  tasks: EventTask[];
  onOpenTask: (task: EventTask) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-[12px] text-white/60">
        No executable tasks are available for this event.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tasks.map(task => (
        <button
          key={task.id}
          type="button"
          onClick={() => onOpenTask(task)}
          className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.055]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-white/40">
                <span>{task.id}</span>
                <span>{task.status.replace(/_/g, ' ')}</span>
                {task.workflowId && <span>{task.workflowId}</span>}
              </div>
              <h3 className="text-[13px] font-semibold text-white">{task.title}</h3>
              {task.description && <p className="mt-1 text-[11px] text-white/55">{task.description}</p>}
            </div>
            <ChevronRight size={15} className="shrink-0 text-white/35" />
          </div>
        </button>
      ))}
    </div>
  );
}

function ZoomTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 border-r border-white/10 px-4 py-3 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]"
      style={{ color: active ? TEAL_PRIMARY : 'rgba(255,255,255,0.48)', background: active ? 'rgba(20,184,166,0.10)' : 'transparent' }}
    >
      {icon}
      {label}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-white/55">
      {children}
    </span>
  );
}

function Metric({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone?: string;
}) {
  const color =
    tone === 'red' || tone === 'blocked' || tone === 'overdue' ? STATE_COLOR.overdue
    : tone === 'amber' || tone === 'due-soon' ? STATE_COLOR['due-soon']
    : tone && tone in AUDIT_STATE_COLOR ? AUDIT_STATE_COLOR[tone as keyof typeof AUDIT_STATE_COLOR]
    : TEAL_PRIMARY;

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-outfit text-[18px] text-white" style={{ color }}>{value}</span>
      <span className="font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</span>
    </span>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-white/40">{label}:</span>
      <span className="text-white/75">{value}</span>
    </div>
  );
}

function computeCesSla(
  event: RegulatoryEvent,
  today: Date,
): { label: string; tone: 'red' | 'amber' | 'teal' } {
  const n = daysUntil(event.date, today);
  if (n < 0) return { label: `${Math.abs(n)}d past`, tone: 'red' };
  if (n === 0) return { label: 'Today', tone: 'amber' };
  if (n <= 7) return { label: `${n}d left`, tone: 'amber' };
  return { label: `${n}d left`, tone: 'teal' };
}
