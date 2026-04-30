import { useMemo, useState } from 'react';
import {
  Workflow, AlertTriangle, Clock, CheckCircle2, X,
  FolderOpen, ShieldCheck, MessageSquare, FileText,
  Upload, History, ListChecks, Lock, Unlock, Check,
  UserCheck, Stamp, FileCheck, Users, AlertCircle,
  GitBranch, Download, RotateCcw, MapPin, ArrowRight,
  Activity, ExternalLink, User, Calendar as CalIcon,
  Send, Loader2,
} from 'lucide-react';
import {
  daysUntil, TODAY_ANCHOR, type RegulatoryEvent,
  DOMAIN_PALETTE,
} from '@/policy/data/regulatoryEvents';
import { getEventDisplayModel } from '@/policy/data/eventDisplayModel';
import {
  useRegulatoryExecutionStore,
  useEventEvidence, useEventNotes, useEventCertification,
} from '@/policy/stores/regulatoryExecutionStore';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { WorkflowBody } from './WorkflowDrawer';
import { EvidencePanel } from './EvidencePanel';
import { useToastStore } from './Toast';
import {
  classifyInstance, STATE_COLOR, STATE_LABEL, ACTION_COLOR, TEAL_PRIMARY,
  type InstanceState,
} from './timelineState';
import {
  buildCompletionChecklist, classifyAuditState,
  AUDIT_STATE_COLOR, AUDIT_STATE_LABEL,
} from '@/policy/audit/auditState';
import {
  useWorkflowInstance, isFormComplete, isApprovalSatisfied, isStepComplete,
  type InstanceFormSlot, type InstanceApprovalSlot,
} from '@/policy/audit/workflowInstance';
import {
  buildSurveyPacket, packetToSurveyMarkdown, packetToSurveyHtml,
} from '@/policy/audit/surveyPacket';
import { downloadBlob } from '@/policy/audit/exportReport';
import { CalendarApi, toPlannerPayload } from '@/policy/services/calendarApi';
import { EventTaskList } from '@/policy/components/pm/EventTaskList';
import { useShellStore } from '@/policy/stores/uiStore';

/* ═══════════════════════════════════════════════════════════════
   WorkflowExecutionPanel
   --------------------------------------------------------------
   Inline, persistent right-rail execution surface for the
   Execution Timeline. A workflow instance is a storage container
   — this panel exposes that container through four tabs:

     EVENT          ← calendar-first event details (default)
     WORKFLOW       ← execute the steps, forms, minutes
     EVENT RECORD   ← files, notes, audit trail (the folder)
     AUDIT VIEW     ← completion checklist + certify gate

   Footer action is CERTIFY EVENT COMPLETE, locked behind the
   completion checklist. When certified, the record is immutable
   and the panel shows the certification receipt.
   ═══════════════════════════════════════════════════════════════ */

export interface WorkflowExecutionPanelProps {
  event: RegulatoryEvent | null;
  onClear?: () => void;
  today?: Date;
  onSelectTask?: (taskId: string) => void;
}

type PanelTab = 'event' | 'workflow' | 'related_tasks' | 'record' | 'audit';
type CalendarSideTab = 'guests' | 'resources';

interface CalendarGuest {
  id: string;
  name: string;
  detail: string;
  response: 'Organizer' | 'Yes' | 'Maybe';
}

interface CalendarResource {
  id: string;
  label: string;
  detail: string;
}

export function WorkflowExecutionPanel({
  event,
  onClear,
  today = TODAY_ANCHOR,
  onSelectTask,
}: WorkflowExecutionPanelProps) {
  const store = useRegulatoryExecutionStore();

  if (!event) {
    return <EmptyPanel />;
  }

  return <ActivePanel event={event} onClear={onClear} today={today} store={store} onSelectTask={onSelectTask} />;
}

/* ─── Active ─────────────────────────────────────────── */
function ActivePanel({
  event, onClear, today, store, onSelectTask,
}: {
  event: RegulatoryEvent;
  onClear?: () => void;
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  onSelectTask?: (taskId: string) => void;
}) {
  const [tab, setTab] = useState<PanelTab>('event');
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');

  const state: InstanceState = classifyInstance(event, today, store);
  const auditState = classifyAuditState(event, today, store);
  const stateColor = STATE_COLOR[state];
  const auditStateColor = AUDIT_STATE_COLOR[auditState];
  const certified = store.isCertified(event.id);
  const cert = useEventCertification(event.id);
  const evidence = useEventEvidence(event.id);
  const notes = useEventNotes(event.id);

  const currentStep = useMemo(
    () => event.processFlow.find(s => store.effectiveStepStatus(event, s.id) !== 'complete'),
    [event, store],
  );
  const currentStepIndex = currentStep
    ? event.processFlow.findIndex(s => s.id === currentStep.id) + 1
    : event.processFlow.length;
  const stepsTotal = event.processFlow.length;

  const sla = useMemo(() => computeSla(event, today), [event, today]);

  return (
    <aside
      className="h-full w-full flex flex-col min-h-0 rounded-xl border overflow-hidden"
      style={{
        borderColor: `${stateColor}55`,
        background: isLight ? 'var(--ci-surface-2)' : 'rgba(255,255,255,0.015)',
      }}
    >
      {/* ── Header: instance projection ── */}
      <header
        className="px-4 py-3 flex flex-col gap-2 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <Workflow size={14} style={{ color: stateColor }} />
            <span
              className="font-montserrat font-bold uppercase tracking-[0.18em] text-[10px]"
              style={{ color: stateColor }}
            >
              {STATE_LABEL[state]}
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[9px] font-montserrat font-bold uppercase tracking-[0.14em] border flex items-center gap-1"
              style={{
                color: auditStateColor,
                background: `${auditStateColor}18`,
                borderColor: `${auditStateColor}55`,
              }}
            >
              {certified && <Lock size={9} />}
              {AUDIT_STATE_LABEL[auditState]}
            </span>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              aria-label="Clear selection"
              className="w-6 h-6 rounded-md flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.05]"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h2
            className="font-outfit font-light text-white leading-tight truncate"
            style={{ fontSize: 17, letterSpacing: '-0.01em' }}
          >
            {event.title}
          </h2>
        </div>
        <div className="grid grid-cols-3 items-end gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]">
          <ProjectionCell label="Step" value={stepsTotal > 0 ? `${currentStepIndex}/${stepsTotal}` : '—'} />
          <ProjectionCell
            label="SLA"
            value={sla.label}
            color={sla.tone === 'red' ? STATE_COLOR.overdue : sla.tone === 'amber' ? STATE_COLOR['due-soon'] : STATE_COLOR['on-track']}
            icon={sla.tone === 'red' ? <AlertTriangle size={10} /> : sla.tone === 'amber' ? <Clock size={10} /> : <CheckCircle2 size={10} />}
          />
          <ProjectionCell
            label="Risk"
            value={state === 'blocked' || state === 'overdue' ? 'High' : state === 'due-soon' ? 'Medium' : 'Low'}
            color={stateColor}
          />
        </div>
      </header>

      {/* ── Tab bar ── */}
      <nav
        className="grid grid-cols-5 items-stretch border-b"
        style={{
          borderColor: 'var(--ci-border)',
          background: isLight ? 'var(--ci-surface-muted)' : 'rgba(248,250,252,0.9)',
        }}
      >
        <TabButton
          active={tab === 'event'}
          onClick={() => setTab('event')}
          icon={<CalIcon size={11} />}
          label="Event"
          accent={TEAL_PRIMARY}
        />
        <TabButton
          active={tab === 'workflow'}
          onClick={() => setTab('workflow')}
          icon={<Workflow size={11} />}
          label="Workflow"
          accent={TEAL_PRIMARY}
        />
        <TabButton
          active={tab === 'related_tasks'}
          onClick={() => setTab('related_tasks')}
          icon={<ListChecks size={11} />}
          label="Related Tasks"
          accent={TEAL_PRIMARY}
        />
        <TabButton
          active={tab === 'record'}
          onClick={() => setTab('record')}
          icon={<FolderOpen size={11} />}
          label="Event Record"
          count={evidence.length + notes.length}
          accent={TEAL_PRIMARY}
        />
        <TabButton
          active={tab === 'audit'}
          onClick={() => setTab('audit')}
          icon={<ShieldCheck size={11} />}
          label="Audit View"
          accent={AUDIT_STATE_COLOR['audit-ready']}
        />
      </nav>

      {/* ── Body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {tab === 'event' && <CalendarEventView event={event} today={today} state={state} sla={sla} />}
        {tab === 'workflow' && <WorkflowBody event={event} />}
        {tab === 'related_tasks' && (
          <div className="p-3">
            <EventTaskList eventId={event.id} onSelectTask={onSelectTask} />
          </div>
        )}
        {tab === 'record' && <EventRecordPanel event={event} />}
        {tab === 'audit' && <AuditViewPanel event={event} today={today} />}
      </div>

      {/* ── Footer: Certify / Locked receipt ── */}
      <footer
        className="px-4 py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {certified && cert ? (
          <CertifiedReceipt cert={cert} onRevoke={() => {
            const reason = window.prompt('Revocation reason (required):') ?? '';
            if (!reason.trim()) return;
            const res = store.revokeCertification(event.id, reason.trim());
            useToastStore.getState().push(res.ok ? 'success' : 'error', res.ok ? 'Certification revoked' : 'Unable to revoke', res.message);
          }} />
        ) : (
          <CertifyActionBar event={event} today={today} />
        )}
      </footer>
    </aside>
  );
}

/* ─── Tab button ────────────────────────────────────── */
function TabButton({
  active, onClick, icon, label, count, accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  accent: string;
}) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center justify-center gap-1 px-1.5 py-2 text-[9px] sm:text-[10px] font-montserrat font-bold uppercase tracking-[0.1em] transition border-r last:border-r-0"
      style={{
        borderRightColor: 'var(--ci-border)',
        color: active ? accent : (isLight ? 'var(--ci-text-muted-2)' : '#475569'),
        background: active ? `${accent}1a` : (isLight ? 'var(--ci-surface-muted)' : 'rgba(248,250,252,0.75)'),
        borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span
          className="ml-0.5 rounded-full px-1.5 py-[1px] text-[9px]"
          style={{
            background: active ? `${accent}22` : 'rgba(148,163,184,0.20)',
            color: active ? accent : '#475569',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVENT RECORD — files, notes, audit trail (the "folder")
   ═══════════════════════════════════════════════════════════ */
function EventRecordPanel({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const notes = useEventNotes(event.id);
  const auditLog = useEnforcementStore(s => s.auditLog);
  const push = useToastStore(s => s.push);
  const certified = store.isCertified(event.id);
  const [draft, setDraft] = useState('');

  const eventTrail = useMemo(
    () => auditLog.filter(l => l.eventId === event.id).slice(0, 80),
    [auditLog, event.id],
  );

  const submitNote = () => {
    const id = store.addNote(event.id, draft);
    if (id) {
      setDraft('');
      push('success', 'Note added', 'Attached to event record.');
    } else if (certified) {
      push('error', 'Cannot add note', 'Event is certified and locked.');
    }
  };

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Record header */}
      <div className="rounded-lg border p-3 bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-1">
          <FolderOpen size={12} style={{ color: TEAL_PRIMARY }} />
          <span
            className="text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]"
            style={{ color: TEAL_PRIMARY }}
          >
            Event Record
          </span>
        </div>
        <p className="text-[10.5px] font-roboto text-white/60 leading-snug">
          This workflow instance is its own audit folder — every document, note, approval, and state change is captured here and preserved on certification.
        </p>
      </div>

      {/* ── Files ── */}
      <section>
        <SectionHeader
          icon={<FileText size={12} />}
          label="Files"
          action={certified ? undefined : {
            icon: <Upload size={11} />,
            label: 'Upload',
            onClick: () => {
              // Trigger EvidencePanel's upload dialog by re-rendering its button UX.
              // Users can also upload from the panel below.
              document.getElementById(`evidence-upload-${event.id}`)?.click();
            },
          }}
        />
        <div id={`evidence-upload-${event.id}`}>
          <EvidencePanel event={event} compact />
        </div>
      </section>

      {/* ── Notes ── */}
      <section>
        <SectionHeader icon={<MessageSquare size={12} />} label={`Notes (${notes.length})`} />
        {!certified && (
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitNote(); }}
              placeholder="Add a note for the audit record…"
              className="flex-1 rounded-md border bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-roboto text-white placeholder-white/35 focus:outline-none focus:border-white/30"
              style={{ borderColor: 'rgba(255,255,255,0.10)' }}
            />
            <button
              type="button"
              onClick={submitNote}
              disabled={!draft.trim()}
              className="rounded-md px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] disabled:opacity-40"
              style={{ background: `${ACTION_COLOR}22`, color: ACTION_COLOR, border: `1px solid ${ACTION_COLOR}66` }}
            >
              Add
            </button>
          </div>
        )}
        {notes.length === 0 ? (
          <EmptyHint label="No notes yet. Add context for reviewers." />
        ) : (
          <ul className="space-y-1.5">
            {notes.map(n => (
              <li
                key={n.id}
                className="rounded-md border p-2.5"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center justify-between text-[9.5px] text-white/50 mb-1">
                  <span className="flex items-center gap-1.5">
                    <UserCheck size={9} />
                    <span className="font-montserrat font-bold">{n.author}</span>
                    {n.authorRole && <span>· {n.authorRole}</span>}
                  </span>
                  <span>{new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] font-roboto text-white/85 leading-snug whitespace-pre-wrap">{n.body}</p>
                {!certified && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => store.removeNote(event.id, n.id)}
                      className="text-[9px] font-montserrat font-bold text-white/40 hover:text-white/75 uppercase tracking-[0.14em]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Audit trail ── */}
      <section>
        <SectionHeader icon={<History size={12} />} label={`Audit Trail (${eventTrail.length})`} />
        {eventTrail.length === 0 ? (
          <EmptyHint label="No activity logged yet for this instance." />
        ) : (
          <ul className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
            {eventTrail.map(a => (
              <li key={a.id} className="grid grid-cols-[88px_1fr] gap-2 text-[10px] font-roboto">
                <span className="text-white/45 font-mono-jb">
                  {new Date(a.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="min-w-0">
                  <div className="text-white/85">
                    <span className="font-semibold">{a.action}</span>
                    {a.targetKind && <span className="text-white/50"> · {a.targetKind}{a.targetId ? `:${a.targetId}` : ''}</span>}
                  </div>
                  <div className="text-white/45">
                    {a.actor}{a.actorRole ? ` (${a.actorRole})` : ''}
                    {a.reason && <span className="text-white/65"> · {a.reason}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUDIT VIEW — grouped checklists + certify gate preview

   The Audit View is the surveyor lens on one workflow instance.
   It renders four distinct sections driven by useWorkflowInstance:

     CERTIFICATION STATUS  ← banner + receipt
     MISSING ITEMS         ← steps, minutes, SLA, generic blockers
     EVIDENCE              ← required forms + linked uploads
     APPROVAL              ← declared rules + runtime requests

   Every row surfaces pass/fail from live state — if the checklist
   is fully green, certification is unlocked.
   ═══════════════════════════════════════════════════════════ */
function AuditViewPanel({ event, today }: { event: RegulatoryEvent; today: Date }) {
  const instance = useWorkflowInstance(event, today);
  if (!instance) return null;

  const {
    completionChecklist: cl,
    steps, forms, approvals, documents,
    certificationRecord, auditState, isCertified, slaDaysPastDue,
    dependencies: deps,
  } = instance;

  /* Summary banner color + label. */
  const bannerColor = cl.allPassed || isCertified ? TEAL_PRIMARY : '#F87171';
  const bannerLabel = isCertified
    ? 'Certified & Locked'
    : cl.allPassed
      ? 'Ready to Certify'
      : AUDIT_STATE_LABEL[auditState];

  /* Missing-items section — steps, minutes, SLA, blocker summary. */
  const stepItems = steps.map<GroupChecklistItem>(s => ({
    id: `step-${s.id}`,
    label: `Step: ${s.label}`,
    passed: isStepComplete(s),
    detail:
      s.status === 'complete' ? 'Complete'
      : s.status === 'in-progress' ? 'In progress'
      : 'Pending',
  }));
  const minutesItem: GroupChecklistItem | null = event.minutes ? {
    id: 'minutes',
    label: 'Meeting minutes finalized',
    passed: cl.items.find(i => i.id === 'minutes')?.passed ?? false,
    detail: cl.items.find(i => i.id === 'minutes')?.detail,
  } : null;
  const slaItem: GroupChecklistItem = {
    id: 'sla',
    label: 'Closure within SLA window',
    passed: slaDaysPastDue === 0,
    detail: slaDaysPastDue === 0 ? 'On time' : `${slaDaysPastDue}d past due`,
  };
  const blockerItem: GroupChecklistItem = {
    id: 'blockers',
    label: 'No unresolved blockers',
    passed: cl.items.find(i => i.id === 'blockers')?.passed ?? true,
    detail: cl.items.find(i => i.id === 'blockers')?.detail,
  };
  const missingItems: GroupChecklistItem[] = [
    ...stepItems,
    ...(minutesItem ? [minutesItem] : []),
    slaItem,
    blockerItem,
  ];

  /* Evidence section — one row per required form, plus a summary row. */
  const evidenceItems: GroupChecklistItem[] = forms.length === 0
    ? [{
        id: 'no-forms',
        label: 'No required forms',
        passed: true,
        detail: documents.length > 0
          ? `${documents.length} supporting artifact${documents.length === 1 ? '' : 's'} on file`
          : 'No evidence required for this event',
      }]
    : forms.map<GroupChecklistItem>(f => {
        const complete = isFormComplete(f);
        const docCount = f.documents.length;
        return {
          id: `form-${f.id}`,
          label: `Form: ${f.label}`,
          // Use backend evidence (uploaded docs) if available; fall back to the
          // local status flag. Both signals mean the same thing — the form is
          // satisfied. They must agree with what FormExecutionRow shows.
          passed: complete || docCount > 0,
          detail: formEvidenceDetail(f),
          meta: f.formRef,
        };
      });

  /* Approval section — one row per declared rule, plus any ad-hoc requests. */
  const approvalItems: GroupChecklistItem[] = approvals.length === 0
    ? [{
        id: 'no-approvals',
        label: 'No approvals required',
        passed: true,
        detail: 'This event has no declared approval rules',
      }]
    : approvals.map<GroupChecklistItem>(a => ({
        id: `ap-${a.ruleId ?? a.requestId ?? a.targetLabel}`,
        label: a.targetLabel,
        passed: isApprovalSatisfied(a),
        detail: approvalDetail(a),
        meta: a.approverRole,
      }));

  /* Export handlers — survey-ready packet (Markdown + printable HTML). */
  const onExportMarkdown = () => {
    const packet = buildSurveyPacket(instance);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob(
      `audit-packet-${event.id}-${stamp}.md`,
      packetToSurveyMarkdown(packet),
      'text/markdown',
    );
    useToastStore.getState().push('success', 'Survey packet exported', `${event.id} · Markdown`);
  };
  const onExportPrintable = () => {
    const packet = buildSurveyPacket(instance);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob(
      `audit-packet-${event.id}-${stamp}.html`,
      packetToSurveyHtml(packet),
      'text/html;charset=utf-8',
    );
    useToastStore.getState().push('success', 'Survey packet exported', `${event.id} · Printable HTML`);
  };

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* ── EXPORT ACTIONS (survey-ready packet) ── */}
      <div
        className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="min-w-0">
          <div className="text-[9.5px] font-montserrat font-bold text-white/55 uppercase tracking-[0.16em]">
            Survey Packet
          </div>
          <p className="text-[10.5px] font-roboto text-white/55 mt-0.5">
            Standardized regulator-facing audit artifact for this instance.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onExportPrintable}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] border transition"
            style={{ background: `${ACTION_COLOR}18`, color: ACTION_COLOR, borderColor: `${ACTION_COLOR}66` }}
            title="Download printable HTML (Save as PDF from browser)"
          >
            <Download size={11} /> Print / PDF
          </button>
          <button
            type="button"
            onClick={onExportMarkdown}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-montserrat font-bold text-white/80 hover:bg-white/[0.06] uppercase tracking-[0.14em]"
            title="Download regulator-friendly Markdown"
          >
            <FileText size={11} /> Markdown
          </button>
        </div>
      </div>

      {/* ── CERTIFICATION STATUS ── */}
      <section>
        <SectionHeader icon={<Stamp size={12} />} label="Certification Status" />
        <div
          className="rounded-lg border p-3 flex items-center justify-between gap-3"
          style={{
            borderColor: `${bannerColor}55`,
            background: `${bannerColor}0E`,
          }}
        >
          <div className="min-w-0">
            <div
              className="text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] flex items-center gap-1.5"
              style={{ color: bannerColor }}
            >
              {isCertified && <Lock size={10} />}
              {bannerLabel}
            </div>
            <p className="text-[11px] font-roboto text-white/75 mt-0.5">
              {cl.passedCount} of {cl.totalCount} validation items passed
              {slaDaysPastDue > 0 && ` · ${slaDaysPastDue}d past due`}
            </p>
            {isCertified && certificationRecord && (
              <p className="text-[10px] font-roboto text-white/55 mt-1.5 truncate">
                {certificationRecord.certifiedBy}
                {certificationRecord.certifierRole ? ` (${certificationRecord.certifierRole})` : ''}
                {' · '}
                {new Date(certificationRecord.certifiedAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <div
            className="font-outfit font-light text-[28px] leading-none shrink-0"
            style={{ color: bannerColor }}
          >
            {cl.passedCount}/{cl.totalCount}
          </div>
        </div>
      </section>

      {/* ── MISSING ITEMS ── */}
      <GroupChecklist
        title="Missing Items"
        icon={<ListChecks size={12} />}
        items={missingItems}
      />

      {/* ── EVIDENCE ── */}
      <GroupChecklist
        title="Evidence"
        icon={<FileCheck size={12} />}
        items={evidenceItems}
        tailMeta={`${documents.length} document${documents.length === 1 ? '' : 's'} on file`}
      />

      {/* ── APPROVAL ── */}
      <GroupChecklist
        title="Approval"
        icon={<Users size={12} />}
        items={approvalItems}
      />

      {/* ── DEPENDENCIES (cross-workflow) ── */}
      <DependenciesSection deps={deps} />

      {/* ── CERTIFIED & LOCKED receipt (explicit, hard-lock visualization) ── */}
      {isCertified && certificationRecord && (
        <CertifiedLockBanner record={certificationRecord} />
      )}
    </div>
  );
}

/* ─── DependenciesSection ───────────────────────────────────
   Renders upstream and downstream references for the instance.
   Each upstream row shows its audit state; required upstream
   that is not yet complete hard-blocks certification.
   ────────────────────────────────────────────────────────── */
function DependenciesSection({
  deps,
}: {
  deps: import('@/policy/audit/workflowInstance').WorkflowInstance['dependencies'];
}) {
  if (deps.upstream.length === 0 && deps.downstream.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span style={{ color: TEAL_PRIMARY }}><GitBranch size={12} /></span>
            <h4 className="font-montserrat font-bold text-white text-[11px] uppercase tracking-[0.16em]">
              Dependencies
            </h4>
          </div>
          <span className="text-[9.5px] font-roboto text-white/45">No cross-workflow dependencies</span>
        </div>
      </section>
    );
  }

  const postureColor =
    deps.posture === 'hard-block' ? '#F87171'
    : deps.posture === 'soft-gap' ? '#F59E0B'
    : TEAL_PRIMARY;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ color: TEAL_PRIMARY }}><GitBranch size={12} /></span>
          <h4 className="font-montserrat font-bold text-white text-[11px] uppercase tracking-[0.16em]">
            Dependencies
          </h4>
          <span
            className="ml-1 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em]"
            style={{ color: postureColor }}
          >
            {deps.posture === 'hard-block' ? 'Blocked upstream'
              : deps.posture === 'soft-gap' ? 'Upstream not certified'
              : 'Clear'}
          </span>
        </div>
        <span className="text-[9.5px] font-roboto text-white/45 truncate">{deps.summary}</span>
      </div>

      {deps.upstream.length > 0 && (
        <div className="mb-2">
          <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.14em] mb-1">
            Upstream ({deps.upstream.length})
          </div>
          <ul className="space-y-1.5">
            {deps.upstream.map(u => {
              const ok = u.isComplete;
              const certified = u.isCertified;
              const color = !ok ? '#F87171' : certified ? TEAL_PRIMARY : '#F59E0B';
              return (
                <li
                  key={u.eventId}
                  className="flex items-start gap-2 rounded-md border p-2.5"
                  style={{
                    borderColor: `${color}55`,
                    background:  `${color}0C`,
                  }}
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: `${color}1F`, color }}
                  >
                    {certified ? <Lock size={10} /> : ok ? <Check size={11} /> : <AlertCircle size={10} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[11px] font-montserrat font-bold text-white/90 truncate">
                        {u.title}
                      </p>
                      <span className="text-[9.5px] font-mono-jb text-white/45 shrink-0">
                        {u.eventId.replace(/^EVT-/, '')}
                      </span>
                    </div>
                    <p className="text-[10px] font-roboto text-white/55 mt-0.5 truncate">
                      {u.reason ?? AUDIT_STATE_LABEL[u.auditState as keyof typeof AUDIT_STATE_LABEL] ?? 'Certified & locked'}
                      {' · '}<span className="text-white/40">{u.date}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {deps.downstream.length > 0 && (
        <div>
          <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.14em] mb-1">
            Downstream impact ({deps.downstream.length})
          </div>
          <ul className="space-y-1">
            {deps.downstream.map(d => (
              <li
                key={`${d.eventId}-${d.relation}`}
                className="flex items-baseline justify-between gap-2 px-2.5 py-1.5 rounded-md border"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  background:  'rgba(255,255,255,0.02)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-montserrat font-bold text-white/80 truncate">
                    {d.title}
                  </p>
                  <p className="text-[9.5px] font-roboto text-white/45">
                    {d.eventId.replace(/^EVT-/, '')} · {d.date}
                  </p>
                </div>
                <span
                  className="text-[9px] font-montserrat font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-sm"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {d.relation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ─── CertifiedLockBanner ───────────────────────────────────
   "No ambiguity" — show the user in plain language that this
   instance is locked, with certifier identity and timestamp.
   ────────────────────────────────────────────────────────── */
function CertifiedLockBanner({
  record,
}: {
  record: import('@/policy/stores/regulatoryExecutionStore').CertificationRecord;
}) {
  const lockColor = AUDIT_STATE_COLOR['certified-locked'];
  return (
    <section>
      <div
        className="rounded-lg border p-3 flex items-start gap-3"
        style={{
          borderColor: `${lockColor}55`,
          background:  `${lockColor}10`,
        }}
      >
        <span
          className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: `${lockColor}24`, color: lockColor }}
        >
          <Lock size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="text-[10px] font-montserrat font-bold uppercase tracking-[0.18em]"
            style={{ color: lockColor }}
          >
            Certified & Locked
          </div>
          <p className="text-[11px] font-roboto text-white/85 mt-0.5 truncate">
            Certified by{' '}
            <span className="font-semibold text-white">
              {record.certifiedBy}
            </span>
            {record.certifierRole ? ` (${record.certifierRole})` : ''}
          </p>
          <p className="text-[10.5px] font-roboto text-white/55 mt-0.5">
            {new Date(record.certifiedAt).toLocaleString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {record.auditPacketRef && (
            <p className="text-[9.5px] font-mono-jb text-white/40 mt-1 truncate">
              {record.auditPacketRef}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── GroupChecklist (Missing / Evidence / Approval) ─── */
interface GroupChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
  /** Small secondary text shown at the right of the row (e.g. form ref, role). */
  meta?: string;
}

function GroupChecklist({
  title, icon, items, tailMeta,
}: {
  title: string;
  icon: React.ReactNode;
  items: GroupChecklistItem[];
  tailMeta?: string;
}) {
  const passedCount = items.filter(i => i.passed).length;
  const allPassed   = passedCount === items.length;
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ color: TEAL_PRIMARY }}>{icon}</span>
          <h4 className="font-montserrat font-bold text-white text-[11px] uppercase tracking-[0.16em]">
            {title}
          </h4>
          <span
            className="ml-1 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em]"
            style={{ color: allPassed ? TEAL_PRIMARY : '#F87171' }}
          >
            {passedCount}/{items.length}
          </span>
        </div>
        {tailMeta && (
          <span className="text-[9.5px] font-roboto text-white/45">{tailMeta}</span>
        )}
      </div>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li
            key={item.id}
            className="flex items-start gap-2 rounded-md border p-2.5"
            style={{
              borderColor: item.passed ? 'rgba(20,184,166,0.30)' : 'rgba(239,68,68,0.30)',
              background:  item.passed ? 'rgba(20,184,166,0.05)' : 'rgba(239,68,68,0.05)',
            }}
          >
            <span
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
              style={{
                background: item.passed ? 'rgba(20,184,166,0.18)' : 'rgba(239,68,68,0.18)',
                color:      item.passed ? TEAL_PRIMARY : '#F87171',
              }}
            >
              {item.passed ? <Check size={11} /> : <AlertCircle size={10} />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className="text-[11px] font-montserrat font-bold truncate"
                  style={{ color: item.passed ? 'rgba(255,255,255,0.92)' : '#FCA5A5' }}
                >
                  {item.label}
                </p>
                {item.meta && (
                  <span className="text-[9.5px] font-mono-jb text-white/45 shrink-0">
                    {item.meta}
                  </span>
                )}
              </div>
              {item.detail && (
                <p className="text-[10px] font-roboto text-white/55 mt-0.5">{item.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formEvidenceDetail(f: InstanceFormSlot): string {
  const docs = f.documents.length;
  const statusLabel =
    f.status === 'complete'        ? 'Complete'
    : f.status === 'requires-review' ? 'Requires review'
    : f.status === 'in-progress'   ? 'In progress'
    : f.status === 'pending'       ? 'Pending'
    : 'Missing';
  if (!f.formRef) return statusLabel;
  if (docs === 0) return `${statusLabel} · no document uploaded`;
  return `${statusLabel} · ${docs} document${docs === 1 ? '' : 's'} linked`;
}

function approvalDetail(a: InstanceApprovalSlot): string {
  const role = a.approverRole ? ` · ${a.approverRole}` : '';
  switch (a.status) {
    case 'approved':
      return `Approved${a.approver ? ` by ${a.approver}` : ''}${
        a.decidedAt ? ` · ${new Date(a.decidedAt).toLocaleDateString()}` : ''
      }`;
    case 'pending':
      return `Pending${role}`;
    case 'rejected':
      return `Rejected${a.approver ? ` by ${a.approver}` : ''}${
        a.decidedAt ? ` · ${new Date(a.decidedAt).toLocaleDateString()}` : ''
      }`;
    case 'missing':
    default:
      return a.required
        ? `Required approval not yet requested${role}`
        : `Approval not initiated${role}`;
  }
}

/* ═══════════════════════════════════════════════════════════
   CERTIFY ACTION BAR
   ═══════════════════════════════════════════════════════════ */
function CertifyActionBar({ event, today }: { event: RegulatoryEvent; today: Date }) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const instance = useWorkflowInstance(event, today);
  const checklist = instance?.completionChecklist
    ?? buildCompletionChecklist(event, today, store);
  const depCheck  = instance?.dependencies;

  const onCertify = () => {
    if (!checklist.allPassed) {
      push('error', 'Cannot certify', `${checklist.totalCount - checklist.passedCount} checklist item(s) still failing.`);
      return;
    }
    if (depCheck && depCheck.posture === 'hard-block') {
      push(
        'error',
        'Upstream not complete',
        depCheck.blockers[0] ?? 'A required upstream workflow must be complete before certification.',
      );
      return;
    }
    const note = window.prompt('Certifier note (optional):') ?? '';
    const res = store.certifyEventComplete(event, undefined, undefined, note || undefined);
    push(
      res.ok ? 'success' : 'error',
      res.ok ? 'Event certified complete' : 'Cannot certify',
      res.message,
    );
  };

  const depBlocked = depCheck?.posture === 'hard-block';
  const canCertify = checklist.allPassed && !depBlocked;

  const hint = depBlocked
    ? `Upstream blocker: ${depCheck?.summary}`
    : canCertify
      ? 'All checks passed. Certification will lock the instance and write an audit record.'
      : `${checklist.totalCount - checklist.passedCount} blocker${checklist.totalCount - checklist.passedCount === 1 ? '' : 's'} must be cleared before certification.`;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[9.5px] font-montserrat font-bold text-white/50 uppercase tracking-[0.16em]">
          Finalization
        </div>
        <div className="text-[10.5px] font-roboto text-white/70 leading-snug mt-0.5">
          {hint}
        </div>
      </div>
      <button
        type="button"
        onClick={onCertify}
        disabled={!canCertify}
        className="shrink-0 rounded-md px-3 py-2 text-[10.5px] font-montserrat font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 disabled:opacity-35 disabled:cursor-not-allowed transition"
        style={{
          background: canCertify ? ACTION_COLOR : 'rgba(255,255,255,0.05)',
          color: canCertify ? '#0A0202' : 'rgba(255,255,255,0.55)',
          border: canCertify ? `1px solid ${ACTION_COLOR}` : '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <Lock size={11} />
        Certify Event Complete
      </button>
    </div>
  );
}

/* ─── Certified receipt ──────────────────────────────── */
function CertifiedReceipt({
  cert, onRevoke,
}: {
  cert: NonNullable<ReturnType<typeof useEventCertification>>;
  onRevoke: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div
          className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.16em] flex items-center gap-1.5"
          style={{ color: AUDIT_STATE_COLOR['certified-locked'] }}
        >
          <Lock size={10} />
          Certified · Locked
        </div>
        <div className="text-[10.5px] font-roboto text-white/75 mt-0.5 truncate">
          {cert.certifiedBy}{cert.certifierRole ? ` (${cert.certifierRole})` : ''} · {new Date(cert.certifiedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
        {cert.auditPacketRef && (
          <div className="text-[9.5px] font-mono-jb text-white/40 truncate mt-0.5">{cert.auditPacketRef}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onRevoke}
        className="shrink-0 rounded-md px-2.5 py-1.5 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center gap-1 border border-white/15 text-white/70 hover:text-white hover:bg-white/[0.05]"
      >
        <Unlock size={10} />
        Revoke
      </button>
    </div>
  );
}

/* ─── Small helpers ──────────────────────────────────── */
function SectionHeader({
  icon, label, action,
}: {
  icon: React.ReactNode;
  label: string;
  action?: { icon: React.ReactNode; label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <span style={{ color: TEAL_PRIMARY }}>{icon}</span>
        <h4 className="font-montserrat font-bold text-white text-[11px] uppercase tracking-[0.16em]">
          {label}
        </h4>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] font-montserrat font-bold text-white/75 hover:text-white hover:bg-white/[0.05] uppercase tracking-[0.12em]"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <div
      className="rounded-md border p-3 text-center text-[10.5px] font-roboto text-white/50"
      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' }}
    >
      {label}
    </div>
  );
}

function ProjectionCell({
  label, value, color, icon,
}: { label: string; value: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-white/45">{label}</span>
      <span
        className="flex items-center gap-1 text-[11px] font-outfit font-light truncate"
        style={{ color: color || 'rgba(255,255,255,0.9)', letterSpacing: '-0.005em' }}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

/* ─── Empty ──────────────────────────────────────────── */
function EmptyPanel() {
  return (
    <aside
      className="h-full w-full flex flex-col items-center justify-center rounded-xl border text-center p-6"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <Workflow size={22} className="text-white/35 mb-2" />
      <p className="font-montserrat font-bold text-white/70 text-[11.5px] uppercase tracking-[0.18em]">
        Select a workflow instance
      </p>
      <p className="text-[10.5px] font-roboto text-white/45 mt-1.5 max-w-[240px] leading-snug">
        Click any item on the timeline to open its execution panel — workflow body, event record (files · notes · audit trail), and audit checklist.
      </p>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CALENDAR EVENT VIEW
   --------------------------------------------------------------
   Event-first calendar detail surface. Mirrors the scheduling UI:
   event summary on the left, guest/resource rail on the right,
   with workflow access as a secondary action.
   ═══════════════════════════════════════════════════════════════ */
function CalendarEventView({
  event,
  today,
  state,
  sla,
}: {
  event: RegulatoryEvent;
  today: Date;
  state: InstanceState;
  sla: { label: string; tone: 'red' | 'amber' | 'teal' };
}) {
  void today;
  const store = useRegulatoryExecutionStore();
  const [sideTab, setSideTab] = useState<CalendarSideTab>('guests');
  const [techOpen, setTechOpen] = useState(false);
  const effectiveUrgency = store.effectiveUrgency(event);
  const validation = store.validateEvent(event);
  const { canonicalPolicyRefs, technicalDetails } = getEventDisplayModel(event);

  const currentStep = event.processFlow.find(
    s => store.effectiveStepStatus(event, s.id) !== 'complete',
  );
  const currentStepIdx = currentStep
    ? event.processFlow.findIndex(s => s.id === currentStep.id) + 1
    : event.processFlow.length;
  const progressPct = Math.round(
    (validation.progress.stepsComplete / Math.max(1, validation.progress.stepsTotal)) * 100,
  );

  const domPalette = DOMAIN_PALETTE[event.domain] ?? DOMAIN_PALETTE['Compliance'];
  const guests = useMemo(() => buildCalendarGuests(event), [event]);
  const resources = useMemo(() => buildCalendarResources(event), [event]);

  const slaColor = sla.tone === 'red' ? '#DC2626' : sla.tone === 'amber' ? '#D97706' : '#059669';
  const stateColor = STATE_COLOR[state];
  const riskLabel = (() => {
    const risk = event.complianceFlags?.auditRisk;
    if (risk === 'critical') return 'Critical';
    if (risk === 'high') return 'High';
    if (risk === 'medium') return 'Medium';
    return 'Low';
  })();
  const riskColor =
    riskLabel === 'Critical' || riskLabel === 'High' ? '#DC2626'
    : riskLabel === 'Medium' ? '#D97706'
    : '#059669';
  const guestCounts = guests.reduce((acc, guest) => {
    if (guest.response === 'Yes' || guest.response === 'Organizer') acc.yes += 1;
    if (guest.response === 'Maybe') acc.maybe += 1;
    return acc;
  }, { yes: 0, maybe: 0 });

  const dateStr = (() => {
    const d = new Date(event.date + 'T00:00:00');
    const base = d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    if (event.allDay || !event.time) return base;
    const time = event.timeEnd ? `${event.time} – ${event.timeEnd}` : event.time;
    return `${base} · ${time}`;
  })();

  const instructionLines = (currentStep?.instructions ?? '')
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean) as string[];
  const requiredFormIds = currentStep?.requiredFormIds ?? [];
  const expectedOutput = currentStep?.expectedOutput;
  const onCompleteText = currentStep?.onCompleteText;
  const currentStepDue = currentStep ? formatOffsetDate(event.date, currentStep.dueOffsetDays) : null;
  const createdBy = event.sourceOfTruth === 'google'
    ? 'Google Calendar'
    : event.sourceOfTruth === 'both'
      ? 'CareIndeed + Google Calendar'
      : 'System Automation';
  const lastUpdated = event.updatedAt
    ? new Date(event.updatedAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    : new Date(event.date + 'T09:00:00').toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      });

  return (
    <div className="min-h-full bg-white text-gray-900">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-3.5 w-3.5 shrink-0 rounded-[4px]"
            style={{ background: domPalette.color }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[16px] font-semibold leading-tight text-gray-900">{event.title}</h2>
              <CalendarBadge color={stateColor} label={STATE_LABEL[state]} />
              <CalendarBadge color={riskColor} label={`${riskLabel} Risk`} />
              {(sla.tone !== 'teal' || effectiveUrgency === 'overdue') && (
                <CalendarBadge color={slaColor} label={sla.label} />
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <CalIcon size={12} className="text-gray-400" />
                {dateStr}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw size={12} className="text-gray-400" />
                {event.cadence}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} className="text-gray-400" />
                {event.location || 'CareIndeed - Regulatory Events'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="border-b border-gray-200 px-5 py-4 lg:border-b-0 lg:border-r">
          <div className="space-y-4">
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="grid gap-0 border-b border-gray-200 md:grid-cols-3">
                <CalendarSummaryMetric
                  icon={<AlertTriangle size={12} />}
                  label="Status"
                  value={STATE_LABEL[state]}
                  color={stateColor}
                />
                <CalendarSummaryMetric
                  icon={<AlertCircle size={12} />}
                  label="Priority"
                  value={riskLabel}
                  color={riskColor}
                />
                <CalendarSummaryMetric
                  icon={<User size={12} />}
                  label="Owner"
                  value={`${event.owner} / ${event.ownerRole}`}
                />
                <CalendarSummaryMetric
                  icon={<Clock size={12} />}
                  label="SLA"
                  value={sla.label}
                  color={slaColor}
                />
                {canonicalPolicyRefs.length > 0 && (
                  <CalendarSummaryMetric
                    icon={<FileText size={12} />}
                    label="Policies"
                    value={canonicalPolicyRefs.join(', ')}
                  />
                )}
                <CalendarSummaryMetric
                  icon={<FolderOpen size={12} />}
                  label="Type"
                  value={event.category ? prettifyCalendarLabel(event.category) : 'Regulatory Event'}
                />
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_210px]">
                <div>
                  <CalEvtSectionHeading icon={<ArrowRight size={11} />} label="Current Step" />
                  {currentStep ? (
                    <div className="mt-1.5">
                      <p className="text-[12px] font-semibold text-gray-900">
                        {currentStepIdx}. {currentStep.label}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-gray-500">
                        Due {currentStepDue}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-gray-500">
                      All {event.processFlow.length} workflow steps are complete.
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <CalEvtSectionHeading icon={<Activity size={11} />} label="Workflow Progress" />
                    <span className="text-[10.5px] font-semibold text-gray-700">{progressPct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        background: progressPct === 100 ? '#059669' : '#0D9488',
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {event.summary && (
              <section>
                <CalEvtSectionHeading icon={<FileText size={11} />} label="Event Summary" />
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-gray-700">{event.summary}</p>
              </section>
            )}

            {instructionLines.length > 0 && (
              <section>
                <CalEvtSectionHeading icon={<ListChecks size={11} />} label="What To Do" />
                <ol className="mt-2 space-y-1.5">
                  {instructionLines.slice(0, 7).map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[8.5px] font-bold"
                        style={{ background: '#CCFBF1', color: '#0F766E', borderColor: '#99F6E4' }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-snug">{line.replace(/^\d+\.\s*/, '')}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {requiredFormIds.length > 0 && (
              <section>
                <CalEvtSectionHeading icon={<FileCheck size={11} />} label="Required Form" />
                <div className="mt-2 space-y-1.5">
                  {requiredFormIds.map(formId => {
                    const evForm = event.requiredForms.find(
                      f => f.formId === formId || f.id === formId,
                    );
                    return (
                      <div
                        key={formId}
                        className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2"
                      >
                        <FileText size={11} className="shrink-0 text-teal-700" />
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-[10px] font-bold text-teal-800">{formId}</span>
                          {evForm && (
                            <span className="ml-1.5 text-[10.5px] text-teal-700">
                              {evForm.label}
                            </span>
                          )}
                        </div>
                        <ExternalLink size={9} className="text-teal-500" />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {expectedOutput && (
              <section>
                <CalEvtSectionHeading icon={<CheckCircle2 size={11} />} label="Expected Output" />
                <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-gray-700">
                  {expectedOutput}
                </div>
              </section>
            )}

            {onCompleteText && (
              <section>
                <CalEvtSectionHeading icon={<Stamp size={11} />} label="On Complete" />
                <p className="mt-1.5 text-[11px] italic leading-snug text-gray-600">
                  {onCompleteText}
                </p>
              </section>
            )}

            {event.regulatoryDriver && (
              <section className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                  Regulatory Driver
                </div>
                <p className="mt-0.5 text-[10.5px] leading-snug text-amber-900">
                  {event.regulatoryDriver}
                </p>
              </section>
            )}
          </div>
        </div>

        <aside className="bg-gray-50/80 px-4 py-4">
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-4">
              <CalendarSideTabButton
                active={sideTab === 'guests'}
                label="Guests"
                onClick={() => setSideTab('guests')}
              />
              <CalendarSideTabButton
                active={sideTab === 'resources'}
                label="Resources"
                onClick={() => setSideTab('resources')}
              />
            </div>
          </div>

          {sideTab === 'guests' ? (
            <div className="pt-3">
              <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-400">
                Add guests
              </div>
              <div className="mt-3 flex items-start justify-between gap-2 text-[11px]">
                <div>
                  <p className="font-medium text-gray-900">{guests.length} guests</p>
                  <p className="text-gray-500">{guestCounts.yes} yes, {guestCounts.maybe} maybe</p>
                </div>
                <Users size={14} className="mt-1 text-gray-500" />
              </div>
              <ul className="mt-3 space-y-3">
                {guests.map(guest => (
                  <li key={guest.id} className="flex items-start gap-2">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: guest.response === 'Maybe' ? '#D97706' : '#0D9488' }}
                    >
                      {guestInitials(guest.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium leading-tight text-gray-900">{guest.name}</p>
                      <p className="mt-0.5 text-[10px] text-gray-500">{guest.detail}</p>
                      <p className="mt-0.5 text-[10px] text-gray-600">{guest.response}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="pt-3">
              <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-500">
                {resources.length} linked resource{resources.length === 1 ? '' : 's'}
              </div>
              <ul className="mt-3 space-y-2.5">
                {resources.map(resource => (
                  <li key={resource.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                    <p className="text-[11px] font-medium leading-tight text-gray-900">{resource.label}</p>
                    <p className="mt-1 text-[10px] leading-snug text-gray-500">{resource.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 border-t border-gray-200 pt-4">
            <h4 className="text-[11px] font-semibold text-gray-900">Event details</h4>
            <div className="mt-3 space-y-3">
              <CalendarDetailRow icon={<FolderOpen size={12} />} value="Regulatory Event" />
              <CalendarDetailRow icon={<Workflow size={12} />} value={domPalette.label} />
              <CalendarDetailRow icon={<AlertTriangle size={12} />} value={`${riskLabel} Priority`} tone={riskColor} />
              <CalendarDetailRow icon={<Clock size={12} />} value={sla.label} tone={slaColor} />
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setTechOpen(v => !v)}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 font-medium"
              >
                <ArrowRight size={9} className={`transition-transform ${techOpen ? 'rotate-90' : ''}`} />
                Technical details
              </button>
              {techOpen && (
                <div className="mt-2 rounded border border-gray-100 bg-gray-50 px-2.5 py-2 space-y-1.5">
                  <TechDetailRow label="Instance ID" value={technicalDetails.event_instance_id} />
                  <TechDetailRow label="Source" value={technicalDetails.sourceOfTruth} />
                </div>
              )}
            </div>
            <div className="mt-4">
              <PushToGoogleCalendarButton event={event} />
            </div>
            <div className="mt-4 space-y-1 text-[10px] text-gray-500">
              <p>Created by: {createdBy}</p>
              <p>Last updated: {lastUpdated}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CalendarBadge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
      style={{ color, background: `${color}12`, borderColor: `${color}30` }}
    >
      {label.toUpperCase()}
    </span>
  );
}

function CalendarSummaryMetric({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="border-b border-gray-200 px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-[11px] font-medium leading-snug" style={{ color: color || '#111827' }}>
        {value}
      </p>
    </div>
  );
}

function CalendarSideTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-b-2 px-1 pb-2 text-[11px] font-medium transition-colors"
      style={{
        borderBottomColor: active ? '#0D9488' : 'transparent',
        color: active ? '#0F766E' : '#6B7280',
      }}
    >
      {label}
    </button>
  );
}

function CalendarDetailRow({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-gray-700">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span style={{ color: tone || '#374151' }}>{value}</span>
    </div>
  );
}

function TechDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-[10px]">
      <span className="shrink-0 font-medium text-gray-500 w-16">{label}</span>
      <span className="font-mono text-gray-700 break-all">{value}</span>
    </div>
  );
}

function buildCalendarGuests(event: RegulatoryEvent): CalendarGuest[] {
  const guests: CalendarGuest[] = [{
    id: 'owner',
    name: event.owner,
    detail: `${event.ownerRole}`,
    response: 'Organizer',
  }];

  const seen = new Set([event.owner.toLowerCase(), event.ownerRole.toLowerCase()]);
  const addGuest = (name: string | undefined, detail: string, response: 'Yes' | 'Maybe') => {
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    guests.push({
      id: `${detail}-${name}`,
      name,
      detail,
      response,
    });
  };

  (event.minutes?.signOffRoles ?? []).forEach(role => addGuest(role, 'Required signer', 'Yes'));
  (event.approvals ?? []).forEach(approval => addGuest(approval.approverRole, 'Approval required', 'Maybe'));
  (event.agenda?.standingTopics ?? []).forEach(topic => addGuest(topic.owner, 'Agenda owner', 'Maybe'));

  return guests.slice(0, 5);
}

function buildCalendarResources(event: RegulatoryEvent): CalendarResource[] {
  const agendaInputs = (event.agenda?.dataInputs ?? []).map((input, index) => ({
    id: `agenda-${index}-${input.formId ?? input.label}`,
    label: input.label,
    detail: [input.formId, input.owner].filter(Boolean).join(' · ') || 'Agenda input',
  }));

  if (agendaInputs.length > 0) return agendaInputs.slice(0, 6);

  const formResources = event.requiredForms.map(form => ({
    id: form.id,
    label: form.label,
    detail: [form.formId, form.status.replace(/-/g, ' ')].filter(Boolean).join(' · '),
  }));

  return formResources.slice(0, 6);
}

function guestInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'EV';
}

function formatOffsetDate(baseDate: string, offsetDays: number): string {
  const d = new Date(`${baseDate}T00:00:00`);
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function prettifyCalendarLabel(label: string): string {
  return label
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function CalEvtSectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0" style={{ color: '#0D9488' }}>{icon}</span>
      <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</span>
    </div>
  );
}

/* ─── SLA computation ────────────────────────────────── */
function computeSla(
  event: RegulatoryEvent,
  today: Date,
): { label: string; tone: 'red' | 'amber' | 'teal' } {
  const n = daysUntil(event.date, today);
  if (n < 0) return { label: `${Math.abs(n)}d past`, tone: 'red' };
  if (n === 0) return { label: 'Today', tone: 'amber' };
  if (n <= 7) return { label: `${n}d left`, tone: 'amber' };
  return { label: `${n}d left`, tone: 'teal' };
}

/* ─── Push to Google Calendar ────────────────────────── */
/**
 * Pushes the current event (full metadata) to the integrated Google
 * Calendar via /api/calendar/sync. Idempotent — the backend matches
 * by appEventId and updates instead of duplicating.
 */
function PushToGoogleCalendarButton({ event }: { event: RegulatoryEvent }) {
  const push = useToastStore(s => s.push);
  const [state, setState] = useState<'idle' | 'pushing' | 'pushed' | 'error'>('idle');

  const onPush = async () => {
    setState('pushing');
    try {
      const payload = toPlannerPayload(event);
      const res = await CalendarApi.sync([payload]);
      if (res.failed > 0) {
        setState('error');
        push('error', 'Google Calendar sync failed', res.results[0]?.error ?? 'Unknown error');
        return;
      }
      setState('pushed');
      const action = res.created > 0 ? 'Created' : (res.updated > 0 ? 'Updated' : 'Skipped');
      push('success', `${action} on Google Calendar`, event.title);
    } catch (e) {
      setState('error');
      const msg = (e as { message?: string })?.message ?? 'Network error';
      push('error', 'Google Calendar push failed', msg);
    }
  };

  const label =
    state === 'pushing' ? 'Syncing…'
    : state === 'pushed' ? 'Synced to Google Calendar'
    : state === 'error'  ? 'Retry Sync to Google Calendar'
    : 'Sync to Google Calendar';

  const Icon =
    state === 'pushing' ? Loader2
    : state === 'pushed' ? Check
    : Send;

  return (
    <button
      type="button"
      onClick={onPush}
      disabled={state === 'pushing'}
      className="w-full flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[11px] font-semibold transition-colors disabled:opacity-60"
      style={{
        background: state === 'pushed' ? '#ECFDF5' : '#F0FDFA',
        color:      state === 'pushed' ? '#047857' : '#0F766E',
        borderColor: state === 'pushed' ? '#A7F3D0' : '#99F6E4',
      }}
    >
      <Icon size={13} className={state === 'pushing' ? 'animate-spin' : ''} />
      {label}
    </button>
  );
}

