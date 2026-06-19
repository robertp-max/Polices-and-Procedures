import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
// DARK MODE DEFECT FIXES (calendar/hover/modals): isLight checks in CesEventOverviewCard, Metadata, participant lists etc.
// Prevented bg bleed/low contrast on glass in dark hover cards + detail modals; titles use primary tokens; glass preserved via mix.

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
import { useShellStore, useIsLight } from '@/policy/stores/uiStore';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';
import {
  classifyInstance, STATE_COLOR, STATE_LABEL, type InstanceState,
  TEAL_PRIMARY,
} from '@/policy/components/regulatory/timelineState';
import { classifyAuditState, AUDIT_STATE_COLOR, AUDIT_STATE_LABEL } from '@/policy/audit/auditState';
import { getSwimlaneRegistryEntry } from '@/policy/workflows/swimlanes/swimlaneRegistry';
import { CalendarApi, type CesCalendarHubMeta } from '@/policy/services/calendarApi';
import { buildCesEventExecutionViewModel } from '@/policy/ces/eventExecution/buildCesEventExecutionViewModel';

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
        border-radius: 6px;
        background:
          radial-gradient(
            500px circle at var(--mouse-x) var(--mouse-y),
            var(--spotlight-color),
            transparent 42%
          ),
          var(--ci-surface);
        border: 1px solid var(--ci-border, rgba(255, 255, 255, 0.08));
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
        border-radius: inherit;
      }
      .ces-card-spotlight:hover::before,
      .ces-card-spotlight:focus-visible::before {
        opacity: 1;
      }
      .ces-card-spotlight:hover {
        filter: brightness(1.08);
        border-color: rgba(255, 255, 255, 0.22);
      }
      .ces-card-spotlight-complete {
        box-shadow: inset 0 0 0 1px rgba(0,121,112,0.22);
      }
      .ces-card-spotlight-critical {
        box-shadow: inset 0 0 0 1px rgba(215,1,1,0.18);
      }
      /* Fix gradient/image bleed out of rounded event pills (design #4 match) */
      .ces-card-spotlight.ces-event-pill,
      .ces-zoom-card .ces-event-pill,
      .ces-hover-card .ces-event-pill {
        border-radius: 999px !important;
        background: transparent !important;
        border: none !important;
        overflow: hidden !important;
      }
      .ces-zoom-backdrop {
        /* dark glass default (v3 veil-like) to preserve dark/light aesthetic; light override below */
        background: rgba(5, 6, 10, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .ces-zoom-card {
        background: isLight ? '#FFFFFF' : '#15282A';
        border: 1px solid var(--ci-border, rgba(255,255,255,0.10));
        box-shadow: 0 24px 60px rgba(0,0,0,0.25);
        isolation: isolate;
        overflow: hidden;
        overflow-x: hidden;
        border-radius: 24px;
        /* reinforced max-h/overflow to prevent viewport bleed when content grows */
        max-height: 90vh;
      }
      .ces-hover-card {
        isolation: isolate !important;
        overflow: hidden !important;
        border-radius: 24px !important;
        box-shadow: 0 16px 48px rgba(0,0,0,0.18) !important;
        background: var(--ci-surface) !important;
        border: 1px solid var(--ci-border, rgba(255,255,255,0.10)) !important;
        color: var(--ci-text-primary) !important;
        contain: layout paint style !important;
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
      /* Light mode: clean corporate no dark bleed for popups/preview/hover (Image #4). Use token bgs, no hard dark hexes in light paths. */
      html[data-theme="care-indeed-light"] .ces-zoom-backdrop {
        background: isLight ? 'rgba(250,251,248,0.92)' : 'rgba(14,27,28,0.92)' !important;
      }
      html[data-theme="care-indeed-light"] .ces-zoom-card,
      html[data-theme="care-indeed-light"] .ces-hover-card {
        background: var(--ci-surface) !important;
        border-color: var(--ci-border, #E5E4E3) !important;
        color: var(--ci-text-primary) !important;
        box-shadow: 0 18px 48px rgba(31,28,27,0.1) !important;
        contain: layout paint style !important;
      }
      html[data-theme="care-indeed-light"] .ces-card-spotlight {
        background: var(--ci-surface) !important;
        border-color: rgba(0,0,0,0.06) !important;
      }
      html[data-theme="care-indeed-light"] .ces-zoom-card .ces-card-spotlight,
      html[data-theme="care-indeed-light"] .ces-hover-card .ces-card-spotlight {
        background: inherit !important;
      }
      /* Prevent text/color/gradient bleed inside hover cards for dark/light; force containment */
      .ces-hover-card,
      .ces-hover-card *,
      .ces-hover-card .ces-overview-card,
      .ces-hover-card h2,
      .ces-hover-card p,
      .ces-hover-card span,
      .ces-hover-card div[style] {
        color: inherit !important;
      }
      .ces-hover-card {
        overflow: auto !important;
      }
      /* Prevent gradient/spotlight bleed out of popups + hover cards; contain paints; clean edges/z for #4 */
      .ces-zoom-card,
      .ces-hover-card,
      .ces-zoom-card .ces-card-spotlight,
      .ces-hover-card .ces-card-spotlight {
        overflow: hidden !important;
        isolation: isolate;
        border-radius: 24px;
      }
      .ces-zoom-card { z-index: 1; }
    `}</style>
  );
}

export function getCesEventSpotlightTone(state: InstanceState, certified: boolean) {
  if (certified || state === 'complete') return 'rgba(0, 121, 112, 0.16)'; // v3 teal
  if (state === 'blocked' || state === 'overdue') return 'rgba(215, 1, 1, 0.18)';
  if (state === 'due-soon') return 'rgba(224, 123, 44, 0.16)'; // v3 orange
  return 'rgba(0, 121, 112, 0.12)'; // v3 teal
}

/* Improved viewport-aware hover card positioning (used by Timeline hover + CES cards)
   - Left flip: prefer right of anchor; if no room, flip to left of anchor
   - Top adjust: clamp to keep within viewport padding (using est height to decide)
   - max-height + overflow for tall content without bleed offscreen
   Before: hardcoded 520px est, local duplicate logic in TimelineMonth
   After: centralized, reusable, safer est (420), consistent maxH/overflow, bleed guards
*/
export function getCesHoverCardPosition(anchorRect: DOMRect, cardWidth = 460) {
  const viewportPadding = 12;
  const offset = 8;
  const preferredLeft = anchorRect.right + offset;
  let left = preferredLeft + cardWidth <= (typeof window !== 'undefined' ? window.innerWidth : 1200) - viewportPadding
    ? preferredLeft
    : Math.max(viewportPadding, anchorRect.left - cardWidth - offset);
  const maxH = Math.max(200, (typeof window !== 'undefined' ? window.innerHeight : 800) - viewportPadding * 2);
  // top adjust using improved estimate (avoids over-shifting vs prior 520px fixed)
  const estH = Math.min(420, maxH);
  let top = anchorRect.top;
  if (top + estH > ((typeof window !== 'undefined' ? window.innerHeight : 800) - viewportPadding)) {
    top = Math.max(viewportPadding, (typeof window !== 'undefined' ? window.innerHeight : 800) - estH - viewportPadding);
  }
  if (top < viewportPadding) top = viewportPadding;
  return { left, top, width: cardWidth, maxHeight: maxH };
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
  ariaLabel,
  toneClassName = '',
  style,
  ...buttonProps
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
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
      aria-label={ariaLabel}
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

function useCesEventHub(eventId: string) {
  const [hub, setHub] = useState<CesCalendarHubMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    CalendarApi.findByAppId(eventId)
      .then(res => {
        if (cancelled) return;
        setHub(res._hub ?? null);
      })
      .catch((e: { message?: string }) => {
        if (cancelled) return;
        setHub(null);
        setError(e?.message ?? 'Hub metadata unavailable');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [eventId]);

  return { hub, loading, error };
}

function HubLinkButton({
  label,
  path,
  external,
}: {
  label: string;
  path?: string;
  external?: string;
}) {
  if (external) {
    return (
      <a
        href={external}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#14B8A6]"
        style={{ borderColor: 'var(--ci-border, rgba(255,255,255,0.12))' }}
      >
        {label}
        <ExternalLink size={11} />
      </a>
    );
  }
  if (path) {
    return (
      <Link
        to={path}
        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#14B8A6]"
        style={{ borderColor: 'var(--ci-border, rgba(255,255,255,0.12))' }}
      >
        {label}
        <ChevronRight size={11} />
      </Link>
    );
  }
  return (
    <span className="text-[10px] text-[var(--ci-text-tertiary,#8A94A6)]">
      {label}: route missing
    </span>
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
  const isLight = useIsLight();
  const { hub, loading: hubLoading, error: hubError } = useCesEventHub(event.id);
  const state = classifyInstance(event, today, store);
  const certified = store.isCertified(event.id);
  const auditState = classifyAuditState(event, today, store);
  const sla = computeCesSla(event, today);
  const mode = getCesExecutionMode(event.date);
  const participants = useMemo(() => buildEventOverviewParticipants(event), [event]);
  const executionVm = useMemo(() => buildCesEventExecutionViewModel({
    eventId: event.id,
    workflowId: event.workflowId ?? hub?.workflowId,
    regulatoryEvent: event,
    hub,
    executionState: store,
  }), [event, hub, store]);
  const signerRoles = event.minutes?.signOffRoles ?? [];
  const agendaOwners = Array.from(new Set((event.agenda?.standingTopics ?? []).map(topic => topic.owner).filter(Boolean))) as string[];

  const cardBg = isLight ? 'var(--ci-surface, #FFFFFF)' : 'color-mix(in srgb, var(--v3-base-bg) 82%, transparent)';
  const cardBorder = isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)';
  const titleColor = 'var(--v3-text-primary)';
  const bodyText = isLight ? 'var(--ci-text-secondary, #5F5855)' : 'var(--ci-text-secondary, #94A3B8)';
  // DARK MODE FIX (hover + modal card): added isLight + glass color-mix for hover cards/modals in calendar.
  // Fixes bg bleed (solid darks), low contrast (grays/text on glass), title text (v3 primary), preserve glass blur.
  // Overflow handled by existing truncate + portal positioning.
  return (
    <div className="rounded-[24px] border p-5 shadow-sm ces-overview-card overflow-hidden" style={{borderColor: cardBorder, background: cardBg, color: 'var(--ci-text-primary)'}}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]">
            <span style={{ color: STATE_COLOR[state] }}>{STATE_LABEL[state]}</span>
            <span className="ces-filter-pill ces-preview-pill rounded-full border px-2 py-0.5" style={{borderColor: cardBorder, background: isLight ? 'var(--ci-surface-muted, #F4F4F2)' : 'rgba(0,121,112,0.06)', color: isLight ? 'var(--ci-accent, #007970)' : 'var(--v3-teal-light)'}}>{event.id}</span>
            <span className="ces-filter-pill ces-preview-pill rounded-full border px-2 py-0.5" style={{borderColor: cardBorder, background: isLight ? 'var(--ci-surface-muted, #F4F4F2)' : 'rgba(0,121,112,0.06)', color: isLight ? 'var(--ci-accent, #007970)' : 'var(--v3-teal-light)'}}>{event.domain}</span>
            {mode !== 'production' && <Badge>{CES_EXECUTION_MODE_LABEL[mode]}</Badge>}
            {certified && <Badge><Lock size={10} /> Locked</Badge>}
          </div>
          <h2 className="mt-3 font-outfit text-[26px] font-light leading-tight" style={{ color: titleColor }}>{event.title}</h2>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: bodyText }}>
            {event.summary ?? event.regulatoryDriver ?? 'Compliance event ready for event-specific swimlane execution.'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-[11px] sm:grid-cols-3">
        <Metric value={hub || !hubLoading ? `${executionVm.completionPercent}%` : '…'} label="completion" isLight={isLight} />
        <Metric value={`${executionVm.attachedDriveEvidenceCount} / ${executionVm.evidenceCount}`} label="evidence" isLight={isLight} />
        <Metric value={hub || !hubLoading ? executionVm.ecignStatus : '…'} label="eCign" isLight={isLight} />
        <Metric value={`${executionVm.tasks.length}`} label="steps" isLight={isLight} />
        <Metric value={sla.label} label="SLA" tone={sla.tone} isLight={isLight} />
        <Metric value={executionVm.workflowId ?? 'No workflow'} label="workflow" isLight={isLight} />
        <Metric value={`${executionVm.auditReadinessPercent}%`} label="audit ready" isLight={isLight} />
        <Metric value={AUDIT_STATE_LABEL[auditState]} label="audit state" tone={auditState} isLight={isLight} />
        <Metric value={executionVm.statusLabel ?? STATE_LABEL[state]} label="status" isLight={isLight} />
      </div>

      {(hub || executionVm) && (
        <section className="mt-5 border-t pt-4" style={{ borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)' }}>
          <div className="mb-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{ color: isLight ? '#52404B' : '#8A94A6' }}>
            Execution Hub
          </div>
          <div className="grid gap-2 text-[12px] sm:grid-cols-2">
            <Metadata label="Calendar" value={executionVm.calendarAttachmentStatus} />
            <Metadata label="Drive" value={executionVm.driveLinked ? 'Linked' : 'Not linked'} />
            <Metadata label="Workflow" value={executionVm.workflowId ?? '—'} />
            <Metadata label="Evidence attached" value={`${executionVm.attachedDriveEvidenceCount} / ${executionVm.evidenceCount}`} />
          </div>
          {executionVm.requiredForms.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: isLight ? '#747474' : '#8A94A6' }}>Required Forms</div>
              <ul className="list-disc pl-5 text-[11px]" style={{ color: isLight ? '#52404B' : '#A0ABC0' }}>
                {executionVm.requiredForms.map(form => <li key={form.id}>{form.title}</li>)}
              </ul>
            </div>
          )}
          {executionVm.requiredSignerRoles.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: isLight ? '#747474' : '#8A94A6' }}>Signer Roles</div>
              <p className="text-[11px]" style={{ color: isLight ? '#52404B' : '#A0ABC0' }}>
                {executionVm.requiredSignerRoles.join(', ')}
              </p>
            </div>
          )}
          {executionVm.blockerText && (
            <div className="mt-3 rounded-xl border px-3 py-2 text-[11px]" style={{ borderColor: 'rgba(199,70,0,0.35)', background: 'rgba(199,70,0,0.08)', color: isLight ? '#9A3412' : '#FFB18D' }}>
              {executionVm.blockerText}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <HubLinkButton label="Full Swimlane" path={executionVm.routes.fullSwimlane} />
            <HubLinkButton label="Workspace" path={executionVm.routes.eventWorkspace} />
            <HubLinkButton label="Evidence" path={executionVm.routes.evidenceCenter} />
            <HubLinkButton label="Audit" path={executionVm.routes.auditMode} />
            <HubLinkButton label="eCign" path={executionVm.routes.ecignSigning} />
            <HubLinkButton label="Packet Preview" path={executionVm.routes.packetPreview} />
            {executionVm.routes.driveFolder && <HubLinkButton label="Drive Folder" external={executionVm.routes.driveFolder} />}
          </div>
          {executionVm.policyRefs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {executionVm.policyRefs.map(policyId => (
                <Link
                  key={policyId}
                  to={`/library/${encodeURIComponent(policyId.trim())}`}
                  className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#14B8A6]"
                >
                  {policyId.trim()}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
      {hubError && !hub && (
        <p className="mt-3 text-[11px]" style={{ color: isLight ? '#747474' : '#8A94A6' }}>
          Hub metadata: {hubError}
        </p>
      )}

      <div className="mt-5 grid gap-x-6 gap-y-2 text-[12px] sm:grid-cols-2" style={{ color: isLight ? '#52404B' : '#A0ABC0' }}>
        <Metadata label="Date" value={event.endDate ? `${event.date} - ${event.endDate}` : event.date} />
        <Metadata label="Time" value={event.allDay || !event.time ? 'All day' : `${event.time}${event.timeEnd ? ` - ${event.timeEnd}` : ''}`} />
        <Metadata label="Owner role" value={event.ownerRole || 'Unassigned'} />
        <Metadata label="Cadence" value={event.cadence} />
        <Metadata label="Canonical policy refs" value={executionVm.policyRefs.length ? executionVm.policyRefs.join(', ') : '—'} />
        <Metadata label="Workflow ID" value={executionVm.workflowId ?? 'No workflow swimlane mapped'} />
        <Metadata label="Audit state" value={AUDIT_STATE_LABEL[auditState]} />
        <Metadata label="Regulatory driver" value={event.regulatoryDriver ?? 'No regulatory driver captured.'} />
        <Metadata label="Short description" value={event.summary ?? 'No summary captured for this event.'} />
        <Metadata label="Required signer roles" value={executionVm.requiredSignerRoles.length ? executionVm.requiredSignerRoles.join(', ') : signerRoles.length ? signerRoles.join(', ') : 'No signer roles configured.'} />
        <Metadata label="Agenda owners" value={agendaOwners.length ? agendaOwners.join(', ') : 'No agenda owners configured.'} />
      </div>

      <section className="mt-5 border-t pt-4" style={{borderColor: isLight ? 'var(--ci-border, #E5E4E3)' : 'var(--v3-border-subtle)'}}>
        <div className="mb-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{ color: isLight ? '#52404B' : '#8A94A6' }}>
          Attendees / Participants
        </div>
        {participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold" style={{color: isLight ? 'var(--ci-text-primary, #1F1C1B)' : 'var(--ci-text-primary, #E2E8F0)'}}>{participant.label}</div>
                  <div className="text-[11px]" style={{color: isLight ? '#52404B' : 'var(--ci-text-secondary, #8A94A6)'}}>{participant.roleType}</div>
                </div>
                <div className="shrink-0 text-right">
                  {participant.responseStatus ? (
                    <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{color: 'var(--ci-secondary-500, #8BE6DF)'}}>{participant.responseStatus}</div>
                  ) : null}
                  {participant.signerFlag ? (
                    <div className="mt-1 text-[10px]" style={{color: 'var(--ci-text-tertiary, #FFB18D)'}}>{participant.signerFlag}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[12px] text-[#8A94A6]">No attendees configured for this event.</div>
        )}
      </section>

      <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4" style={{borderColor:'var(--ci-border, #E5E4E3)'}}>
        <span className="text-[11px]" style={{color: 'var(--ci-text-secondary, #8A94A6)'}}>Open the read-only process visualization.</span>
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
  actionLabel = 'Open Event Swimlane',
}: {
  event: RegulatoryEvent;
  today?: Date;
  onClose: () => void;
  onOpenSwimlane: () => void;
  actionLabel?: string;
}) {
  return (
    <CesEventZoomModal onClose={onClose} maxWidth="max-w-xl">
      <div className="p-5" style={{background: 'transparent'}}>
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5"
            style={{color: 'var(--ci-text-tertiary, rgba(255,255,255,0.45))'}}
            aria-label="Close event preview"
          >
            <X size={16} />
          </button>
        </div>
        <CesEventOverviewCard event={event} today={today} onOpenSwimlane={onOpenSwimlane} actionLabel={actionLabel} />
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
  const isLight = useShellStore(s => s.theme === 'care-indeed-light'); // or useIsLight()
  // Light mode defect fixes: explicit isLight for title text contrast (h2, task titles, metrics) + muted audit text to prevent white bleed/low contrast on glass surfaces. Use of isLight + surface vars preserves clean glass in modals/hover/cards/calendar.

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
      <div className="flex max-h-[82vh] min-h-[620px] flex-col overflow-hidden overflow-x-hidden" style={{background: isLight ? 'var(--ci-surface, #FFFFFF)' : 'var(--ci-surface, var(--v3-base-bg, #0f131a))'}}>
        <header className="border-b border-white/10 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]">
                <span style={{ color: STATE_COLOR[state] }}>{STATE_LABEL[state]}</span>
                <span style={{color: 'var(--ci-text-tertiary, rgba(255,255,255,0.35))'}}>{event.id}</span>
                {certified && <Badge><Lock size={10} /> Certified / Locked</Badge>}
                <Badge>{event.domain}</Badge>
              </div>
              <h2 className="mt-3 font-outfit text-3xl font-light leading-tight" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>
                {event.title}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={onBack} className="rounded-md p-2" style={{color: 'var(--ci-text-tertiary, rgba(255,255,255,0.45))'}} aria-label="Back to event preview">
                <ArrowLeft size={16} />
              </button>
              <button type="button" onClick={onClose} className="rounded-md p-2" style={{color: 'var(--ci-text-tertiary, rgba(255,255,255,0.45))'}} aria-label="Close event detail">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-6 text-[11px]" style={{color: 'var(--ci-text-secondary, rgba(255,255,255,0.75))'}}>
            <Metric value={`${event.processFlow.length}`} label="steps" isLight={isLight} />
            <Metric value={sla.label} label="SLA" tone={sla.tone} isLight={isLight} />
            <Metric value={state === 'blocked' || state === 'overdue' ? 'High' : state === 'due-soon' ? 'Medium' : 'Low'} label="risk" tone={state} isLight={isLight} />
            <Metric value={`${dataflow?.auditReadinessScore ?? 0}%`} label="audit ready" isLight={isLight} />
            <Metric value={AUDIT_STATE_LABEL[auditState]} label="audit trail" tone={auditState} isLight={isLight} />
          </div>
        </header>

        <nav className="flex border-b border-white/10" style={{background: 'color-mix(in srgb, var(--ci-surface) 97%, transparent)'}}>
          <ZoomTab active={tab === 'overview'} onClick={() => setTab('overview')} icon={<CalendarDays size={12} />} label="Overview" />
          <ZoomTab active={tab === 'tasks'} onClick={() => setTab('tasks')} icon={<ListChecks size={12} />} label="Tasks" />
          <ZoomTab active={tab === 'audit'} onClick={() => setTab('audit')} icon={<History size={12} />} label="Audit Trail" />
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto ces-audit-scrollbar-hidden px-6 py-5">
          {tab === 'overview' && (
            <OverviewTab event={event} state={state} isLight={isLight} />
          )}
          {tab === 'tasks' && (
            <TasksTab tasks={dataflow?.tasks.filter(task => !task.isDeleted) ?? []} onOpenTask={openTask} isLight={isLight} />
          )}
          {tab === 'audit' && dataflow && (
            <CesAuditTrailView dataflow={dataflow} isLight={isLight} />
          )}
        </div>
      </div>
    </CesEventZoomModal>
  );
}

export function CesAuditTrailView({
  dataflow,
  isLight = false,
}: {
  dataflow: NonNullable<ReturnType<typeof useEventExecutionDataflow>>;
  isLight?: boolean;
}) {
  const evidenceById = useMemo(() => new Map(dataflow.evidence.map(doc => [doc.id, doc])), [dataflow.evidence]);
  const rows = dataflow.auditTrail;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border p-5 text-[12px]" style={{borderColor:'var(--ci-border, rgba(255,255,255,0.10))', background: isLight ? '#F8FAFC' : 'var(--ci-surface)', color: isLight ? '#1F1C1B' : 'var(--ci-text-muted, rgba(255,255,255,0.6))'}}>
        No audit trail entries exist for this event yet. No placeholder audit records have been generated.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {rows.map(row => {
        const artifact = row.entityType === 'evidence' ? evidenceById.get(row.entityId) : undefined;
        return (
          <article key={row.auditId} className="rounded-xl border p-4" style={{borderColor:'var(--ci-border, rgba(255,255,255,0.10))', background:'var(--ci-surface)'}}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]">
                  <span className="text-[#14B8A6]">{row.action}</span>
                  <span style={{ color: isLight ? '#9CA3AF' : 'rgba(255,255,255,0.35)' }}>{row.entityType}</span>
                  <span style={{ color: isLight ? '#9CA3AF' : 'rgba(255,255,255,0.35)' }}>{row.auditId}</span>
                </div>
                <p className="mt-2 text-[12px]" style={{ color: isLight ? '#52404B' : 'rgba(255,255,255,0.80)' }}>
                  {row.reason ?? `${row.entityId} changed by ${row.actorRole ?? row.actorId ?? 'system'}.`}
                </p>
              </div>
              <time className="shrink-0 text-[10px]" style={{ color: isLight ? '#747474' : 'rgba(255,255,255,0.40)' }}>
                {new Date(row.timestamp).toLocaleString()}
              </time>
            </div>
            <div className="mt-3 max-h-28 overflow-y-auto rounded-lg p-3 font-mono text-[10px] leading-relaxed ces-audit-scrollbar-hidden" style={{background: 'var(--ci-surface-muted, var(--ci-surface))', color:'var(--ci-text-tertiary, rgba(255,255,255,0.45))'}}>
              {JSON.stringify({ before: row.before ?? null, after: row.after ?? null, hash: row.currentHash ?? null }, null, 2)}
            </div>
            {artifact && (
              <button
                type="button"
                onClick={() => window.open(buildArtifactRoute(artifact.id, { eventId: dataflow.eventId, taskId: artifact.taskId, evidenceId: artifact.id, type: artifact.artifactType ?? 'evidence' }), '_blank', 'noopener,noreferrer')}
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] text-[#14B8A6]"
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
    <div className="ces-zoom-backdrop fixed inset-0 z-[200] flex items-center justify-center px-4 py-6" onMouseDown={onClose}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        onMouseMove={handleMouseMove}
        onMouseDown={e => e.stopPropagation()}
        className={`ces-zoom-card w-full ${maxWidth} max-h-[calc(100vh-3rem)] overflow-hidden overflow-x-hidden rounded-3xl`}
      >
        {children}
      </div>
    </div>
  );
}

function OverviewTab({ event, state, isLight = false }: { event: RegulatoryEvent; state: InstanceState; isLight?: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <p className="text-[13px] leading-relaxed" style={{color: 'var(--ci-text-secondary, rgba(255,255,255,0.72))'}}>
          {event.summary ?? event.regulatoryDriver ?? 'This event is part of the CES calendar workflow surface.'}
        </p>
        {event.regulatoryDriver && (
          <div className="rounded-xl border border-white/10 p-4" style={{background: isLight ? '#F8FAFC' : 'var(--ci-surface-elevated, var(--ci-surface))', borderColor: 'var(--ci-border, rgba(255,255,255,0.10))'}}>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{color: 'var(--ci-text-tertiary, rgba(255,255,255,0.45))'}}>
              <ShieldCheck size={12} />
              Regulatory Driver
            </div>
            <p className="text-[12px] leading-relaxed" style={{color: 'var(--ci-text-secondary, rgba(255,255,255,0.70))'}}>{event.regulatoryDriver}</p>
          </div>
        )}
      </section>
      <section className="space-y-3 text-[12px]" style={{color: 'var(--ci-text-secondary, rgba(255,255,255,0.70))'}}>
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
  isLight = false,
}: {
  tasks: EventTask[];
  onOpenTask: (task: EventTask) => void;
  isLight?: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border p-5 text-[12px]" style={{borderColor:'var(--ci-border, rgba(255,255,255,0.10))', background: isLight ? '#F8FAFC' : 'var(--ci-surface)', color: isLight ? '#1F1C1B' : 'var(--ci-text-muted, rgba(255,255,255,0.6))'}}>
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
          className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/[0.055]" style={{background: 'var(--ci-surface-elevated, var(--ci-surface))', borderColor: 'var(--ci-border, rgba(255,255,255,0.10))'}}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{ color: isLight ? '#747474' : 'rgba(255,255,255,0.40)' }}>
                <span>{task.id}</span>
                <span>{task.status.replace(/_/g, ' ')}</span>
                {task.workflowId && <span>{task.workflowId}</span>}
              </div>
              <h3 className="text-[13px] font-semibold" style={{ color: isLight ? '#1F1C1B' : '#fff' }}>{task.title}</h3>
              {task.description && <p className="mt-1 text-[11px]" style={{ color: isLight ? '#52404B' : 'rgba(255,255,255,0.55)' }}>{task.description}</p>}
            </div>
            <ChevronRight size={15} style={{ color: isLight ? '#9CA3AF' : 'rgba(255,255,255,0.35)' }} />
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
      style={{ color: active ? TEAL_PRIMARY : 'var(--ci-text-tertiary, rgba(255,255,255,0.48))', background: active ? 'rgba(20,184,166,0.10)' : 'transparent' }}
    >
      {icon}
      {label}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5" style={{background: 'color-mix(in srgb, var(--ci-surface-elevated, white) 96%, transparent)', color: 'var(--ci-text-tertiary, rgba(255,255,255,0.55))', borderColor: 'var(--ci-border, rgba(255,255,255,0.10))'}}>
      {children}
    </span>
  );
}

function Metric({
  value,
  label,
  tone,
  isLight = false,
}: {
  value: string;
  label: string;
  tone?: string;
  isLight?: boolean;
}) {
  const color =
    tone === 'red' || tone === 'blocked' || tone === 'overdue' ? STATE_COLOR.overdue
    : tone === 'amber' || tone === 'due-soon' ? STATE_COLOR['due-soon']
    : tone && tone in AUDIT_STATE_COLOR ? AUDIT_STATE_COLOR[tone as keyof typeof AUDIT_STATE_COLOR]
    : TEAL_PRIMARY;

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-outfit text-[18px]" style={{ color }}>{value}</span>
      <span className="font-montserrat text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: isLight ? '#52404B' : 'rgba(255,255,255,0.40)' }}>{label}</span>
    </span>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  const isLight = useIsLight();
  return (
    <div className="flex gap-2">
      <span className="shrink-0" style={{color: isLight ? 'var(--ci-text-tertiary, #74706F)' : 'var(--ci-text-tertiary, rgba(255,255,255,0.40))'}}>{label}:</span>
      <span style={{color: isLight ? 'var(--ci-text-secondary, #5F5855)' : 'var(--ci-text-secondary, rgba(255,255,255,0.75))'}}>{value}</span>
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
