import { useMemo, useState } from 'react';
import {
  Workflow, CheckCircle2, Circle, Play, ChevronRight, ChevronDown,
  ShieldCheck, AlertTriangle, FileCheck2, FileWarning, User,
  Clock, Upload, ArrowRight, Unlock, FileOutput, BookOpen, ListChecks,
} from 'lucide-react';
import {
  DOMAIN_PALETTE, formatEventDate, type RegulatoryEvent, type EventProcessStep,
} from '@/policy/data/regulatoryEvents';
import { getFormMeta } from '@/policy/data/formsCatalog';
import {
  useRegulatoryExecutionStore, type FormStatus, type StepStatus,
} from '@/policy/stores/regulatoryExecutionStore';
import { useToastStore } from './Toast';
import { DrawerShell } from './ModalShell';
import { DomainBadge, PolicyRef, UrgencyChip, EvidenceDot } from './Primitives';

/* ═══════════════════════════════════════════════════════════════
   WorkflowDrawer
   --------------------------------------------------------------
   The right-side operational drawer that lets users EXECUTE the
   event workflow: advance steps, complete forms, validate
   completion, and finalize the event.

   Opened from:
     - Dashboard Quick Actions ("Start Workflow")
     - Calendar Event chip (double-click)
     - Event Workspace ("Start Workflow" button)
   ═══════════════════════════════════════════════════════════════ */

export interface WorkflowDrawerProps {
  event: RegulatoryEvent | null;
}

export function WorkflowDrawer({ event }: WorkflowDrawerProps) {
  const activeId = useRegulatoryExecutionStore(s => s.activeWorkflowEventId);
  const closeWorkflow = useRegulatoryExecutionStore(s => s.closeWorkflow);
  const open = !!activeId && !!event && activeId === event.id;

  if (!event) return <DrawerShell open={false} onClose={closeWorkflow} />;

  const dom = DOMAIN_PALETTE[event.domain];

  return (
    <DrawerShell
      open={open}
      onClose={closeWorkflow}
      accent={dom.color}
      width={560}
      icon={<Workflow size={16} />}
      title="Workflow Execution"
      subtitle={event.title}
      footer={<WorkflowFooter event={event} onClose={closeWorkflow} />}
    >
      <WorkflowBody event={event} />
    </DrawerShell>
  );
}

/* ─── Body ────────────────────────────────────────────── */
export function WorkflowBody({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const validation = useMemo(() => store.validateEvent(event), [event, store]);

  const currentStep = event.processFlow.find(
    s => store.effectiveStepStatus(event, s.id) !== 'complete',
  );

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* ── Header summary ── */}
      <EventHeadline event={event} />

      {/* ── Progress ── */}
      <ProgressBar
        label="Workflow progress"
        current={validation.progress.stepsComplete}
        total={Math.max(1, validation.progress.stepsTotal)}
      />

      {/* ── Steps ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-montserrat font-bold text-white text-[11.5px] uppercase tracking-[0.16em]">
            Step-by-Step Workflow
          </h4>
          {currentStep && (
            <span className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.14em]">
              Current · {currentStep.label}
            </span>
          )}
        </div>
        <p className="text-[10.5px] font-roboto text-white/55 leading-snug mb-2">
          Follow each step in order. Expand a step for instructions, the forms to fill out, and the deliverable produced. Mark complete when the step output is on file.
        </p>
        <ol className="space-y-2">
          {event.processFlow.map((step, idx) => (
            <StepRow
              key={step.id}
              event={event}
              idx={idx + 1}
              step={step}
              isCurrent={currentStep?.id === step.id}
            />
          ))}
          {event.processFlow.length === 0 && (
            <li className="text-[11px] font-roboto text-white/55 p-3 border border-white/10 rounded-md bg-white/[0.02]">
              No step-by-step guide is configured for this event type yet. Use the forms and evidence tabs to complete the workflow.
            </li>
          )}
        </ol>
      </section>

      {/* ── Forms ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-montserrat font-bold text-white text-[11.5px] uppercase tracking-[0.16em]">
            Required Forms & Documents
          </h4>
          <span className="text-[10px] font-montserrat font-bold text-white/50 uppercase tracking-[0.14em]">
            {validation.progress.formsComplete} / {validation.progress.formsTotal} complete
          </span>
        </div>
        <p className="text-[10.5px] font-roboto text-white/55 leading-snug mb-2">
          Open, upload, or finalize each required artifact. Every form shown here is audit evidence — missing items block event closure.
        </p>
        <ul className="space-y-1.5">
          {event.requiredForms.map(f => (
            <FormExecutionRow key={f.id} event={event} formId={f.id} label={f.label} formRefId={f.formId} />
          ))}
          {event.requiredForms.length === 0 && (
            <li className="text-[11px] font-roboto text-white/55 p-3 border border-white/10 rounded-md bg-white/[0.02]">
              This event has no required forms defined. Upload supporting evidence on the Evidence tab if needed.
            </li>
          )}
        </ul>
      </section>

      {/* ── Minutes ── */}
      {event.minutes && <MinutesExecution event={event} />}

      {/* ── Validation ── */}
      <ValidationPanel event={event} />
    </div>
  );
}

/* ─── Headline ────────────────────────────────────────── */
function EventHeadline({ event }: { event: RegulatoryEvent }) {
  const dom = DOMAIN_PALETTE[event.domain];
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <DomainBadge domain={event.domain} />
        <UrgencyChip urgency={event.urgency} compact />
        {event.policyRefs.slice(0, 2).map(p => <PolicyRef key={p} id={p} />)}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
        <div className="min-w-0">
          <h3 className="font-montserrat font-bold text-white text-[13px] leading-tight truncate">{event.title}</h3>
          <p className="text-[10.5px] font-roboto text-white/55 mt-0.5 truncate flex items-center gap-1.5">
            <User size={10} /> {event.owner} · {event.ownerRole}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] font-montserrat font-bold" style={{ color: dom.color }}>
            {formatEventDate(event.date)}
          </div>
          <div className="text-[9.5px] font-roboto text-white/50 flex items-center gap-1 justify-end">
            <Clock size={9} /> {event.allDay || !event.time ? 'All Day' : event.timeEnd ? `${event.time}–${event.timeEnd}` : event.time}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step row (interactive) ──────────────────────────── */
function StepRow({
  event, idx, step, isCurrent,
}: {
  event: RegulatoryEvent;
  idx: number;
  step: EventProcessStep;
  isCurrent?: boolean;
}) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const status = store.effectiveStepStatus(event, step.id);

  const palette = stepPalette(status);
  const dueDate = new Date(new Date(event.date + 'T00:00:00').getTime() + step.dueOffsetDays * 86_400_000);
  const dueLabel = step.dueOffsetDays === 0
    ? `Due ${formatEventDate(event.date)}`
    : `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Current or in-progress steps expand by default so the operator sees the "how"
  const defaultExpanded = !!isCurrent || status === 'in-progress';
  const [expanded, setExpanded] = useState(defaultExpanded);

  const hasGuidance = !!(step.instructions || step.expectedOutput || (step.requiredFormIds && step.requiredFormIds.length) || step.onCompleteText);
  const locked = store.isEventComplete(event.id);

  const cycle = () => {
    if (locked) return;
    const next: StepStatus =
      status === 'complete' ? 'in-progress' :
      status === 'in-progress' ? 'complete' :
      'in-progress';
    store.setStepStatus(event.id, step.id, next);
    push('success', next === 'complete' ? 'Step completed' : next === 'in-progress' ? 'Step started' : 'Step reopened', step.label);
  };

  return (
    <li
      className="flex gap-3 p-2.5 rounded-lg border transition-colors"
      style={{
        borderColor: isCurrent ? 'rgba(var(--ci-accent-rgb),0.35)' : 'rgba(255,255,255,0.10)',
        background: isCurrent ? 'rgba(var(--ci-accent-rgb),0.06)' : 'rgba(255,255,255,0.02)',
      }}
    >
      <button
        onClick={cycle}
        aria-label={status === 'complete' ? 'Reopen step' : 'Complete step'}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-montserrat font-bold transition-transform hover:scale-105"
        style={{
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          color: palette.fg,
          fontSize: 11,
        }}
      >
        {status === 'complete' ? <CheckCircle2 size={13} /> : status === 'in-progress' ? <Play size={11} /> : idx}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-montserrat font-bold text-white text-[12px] leading-tight mb-0.5">{step.label}</p>
            <p className="font-roboto text-white/65 text-[10.5px] leading-snug">{step.description}</p>
          </div>
          <span className="text-[9.5px] font-roboto text-white/45 whitespace-nowrap">{dueLabel}</span>
        </div>

        {/* Rich guidance (instructions, forms, expected output, on-complete) */}
        {hasGuidance && expanded && (
          <StepGuidance step={step} event={event} />
        )}

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: palette.fg }}>
              {status === 'complete' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Pending'}
            </span>
            {hasGuidance && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-[9.5px] font-montserrat font-bold text-white/50 hover:text-white/80 uppercase tracking-[0.14em] flex items-center gap-1"
              >
                {expanded ? <><ChevronDown size={9} /> Collapse</> : <><ChevronRight size={9} /> How to do this</>}
              </button>
            )}
          </div>
          {status !== 'complete' && !locked && (
            <button
              onClick={() => { store.setStepStatus(event.id, step.id, 'complete'); push('success', 'Step completed', step.label); }}
              className="text-[9.5px] font-montserrat font-bold text-[#FFC107] hover:text-white uppercase tracking-[0.14em] flex items-center gap-1"
            >
              Mark complete <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/* ─── Step guidance panel (instructions, linked forms, output) ── */
function StepGuidance({ step, event }: { step: EventProcessStep; event: RegulatoryEvent }) {
  const stepForms = (step.requiredFormIds || [])
    .map(refId => {
      const eventForm = event.requiredForms.find(f => f.formId === refId || f.id === refId);
      const meta = getFormMeta(refId);
      return { refId, eventForm, meta };
    })
    .filter(x => x.eventForm || x.meta);

  return (
    <div className="mt-2 rounded-md border border-white/10 bg-white/[0.025] p-2.5 space-y-2">
      {step.instructions && (
        <div>
          <GuidanceHeading icon={<BookOpen size={9} />} label="What to do" />
          <p className="text-[10.5px] font-roboto text-white/75 leading-snug whitespace-pre-line">{step.instructions}</p>
        </div>
      )}

      {stepForms.length > 0 && (
        <div>
          <GuidanceHeading icon={<ListChecks size={9} />} label="Forms / documents for this step" />
          <ul className="space-y-1 mt-0.5">
            {stepForms.map(({ refId, eventForm, meta }) => (
              <li key={refId} className="flex items-start gap-1.5 text-[10.5px] font-roboto text-white/75">
                <span className="font-mono-jb text-[#FFC107]/85 text-[9.5px] shrink-0 mt-0.5">{refId}</span>
                <span className="min-w-0">
                  <span className="font-montserrat font-bold text-white/90">{eventForm?.label || meta?.title}</span>
                  {meta?.purpose && <span className="text-white/55"> — {meta.purpose}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.expectedOutput && (
        <div>
          <GuidanceHeading icon={<FileOutput size={9} />} label="Expected output" />
          <p className="text-[10.5px] font-roboto text-white/75 leading-snug">{step.expectedOutput}</p>
        </div>
      )}

      {step.onCompleteText && (
        <div className="rounded bg-[#10B981]/08 border border-[#10B981]/25 px-2 py-1.5">
          <p className="text-[10px] font-roboto text-[#10B981]/90 leading-snug">
            <span className="font-montserrat font-bold uppercase tracking-[0.14em] text-[9px] text-[#10B981] mr-1">On complete:</span>
            {step.onCompleteText}
          </p>
        </div>
      )}
    </div>
  );
}

function GuidanceHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-0.5 text-[#FFC107]">
      {icon}
      <span className="font-montserrat font-bold uppercase tracking-[0.14em] text-[8.5px]">{label}</span>
    </div>
  );
}

/* ─── Form execution row ──────────────────────────────── */
export function FormExecutionRow({
  event, formId, label, formRefId, showRefId = true,
}: {
  event: RegulatoryEvent;
  formId: string;
  label: string;
  formRefId?: string;
  showRefId?: boolean;
}) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const status = store.effectiveFormStatus(event, formId);
  const stored = store.formStates[`${event.id}::${formId}`];
  const palette = formPalette(status);
  const locked = store.isEventComplete(event.id);

  const [menuOpen, setMenuOpen] = useState(false);

  const set = (s: FormStatus, toast?: string) => {
    if (locked) return;
    store.setFormStatus(event.id, formId, s);
    push('success', toast || 'Form updated', label);
    setMenuOpen(false);
  };

  const uploadAction = () => {
    if (locked) return;
    const mockName = `${(formRefId || formId)}_${Date.now()}.pdf`;
    store.uploadEvidence(event.id, {
      name: mockName,
      kind: 'form',
      sizeLabel: '312 KB',
      linkedFormId: formId,
    });
    push('success', 'Document uploaded', `${label} — linked to form ${formRefId || formId}`);
    setMenuOpen(false);
  };

  return (
    <li
      className="flex items-center gap-2 p-2 rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <EvidenceDot status={status === 'complete' ? 'complete' : status === 'in-progress' ? 'in-progress' : status === 'missing' ? 'missing' : 'pending'} />
      <div className="flex-1 min-w-0">
        <p className="font-montserrat font-bold text-white text-[11.5px] truncate">{label}</p>
        <p className="font-mono-jb text-white/45 text-[9.5px] flex items-center gap-2">
          {showRefId && (formRefId || '—')}
          {stored?.completedAt && (
            <span className="text-white/35 font-roboto">
              · by {stored.completedBy || 'User'} · {new Date(stored.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </p>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 font-montserrat font-bold uppercase tracking-[0.14em]"
        style={{ fontSize: 9, background: `${palette.color}1f`, color: palette.color, border: `1px solid ${palette.color}55` }}
      >
        {palette.label}
      </span>

      {!locked && (
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-montserrat font-bold text-white/70 hover:text-white hover:bg-white/[0.05] uppercase tracking-[0.12em] flex items-center gap-1"
          >
            Actions <ChevronRight size={10} className={menuOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-10 rounded-md overflow-hidden min-w-[180px] bg-white border border-[#E5E4E3]"
              style={{ boxShadow: '0 18px 40px -16px rgba(31,28,27,0.28), 0 2px 6px rgba(31,28,27,0.08)' }}
            >
              <FormMenuItem icon={<FileCheck2 size={11} />} label="Open Form" onClick={() => set('in-progress', 'Form opened')} />
              <FormMenuItem icon={<Upload size={11} />}     label="Upload Existing" onClick={uploadAction} />
              <FormMenuItem icon={<CheckCircle2 size={11} />} label="Mark Complete" onClick={() => set('complete', 'Form marked complete')} />
              <FormMenuItem icon={<ShieldCheck size={11} />} label="Send for Review" onClick={() => set('requires-review', 'Sent for review')} />
              <FormMenuItem icon={<FileWarning size={11} />} label="Flag as Missing" onClick={() => set('missing', 'Form flagged as missing')} danger />
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function FormMenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-2 text-left text-[10.5px] font-montserrat font-bold uppercase tracking-[0.12em] border-b border-[#E5E4E3] last:border-b-0 transition-colors ${
        danger
          ? 'text-[#B42318] hover:bg-[#FEE4E2]'
          : 'text-[#1F1C1B] hover:bg-[#FAFBF8]'
      }`}
    >
      <span className={danger ? 'text-[#B42318]' : 'text-[#524048]'}>{icon}</span>{label}
    </button>
  );
}

/* ─── Minutes execution ──────────────────────────────── */
function MinutesExecution({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const status = store.effectiveMinutesStatus(event);
  const locked = store.isEventComplete(event.id);
  if (!status) return null;

  const palette =
    status === 'finalized' ? { color: '#10B981', label: 'Finalized' } :
    status === 'draft'     ? { color: '#FBBF24', label: 'Draft' } :
                             { color: '#EF4444', label: 'Missing' };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-montserrat font-bold text-white text-[11.5px] uppercase tracking-[0.16em]">
          Meeting Minutes
        </h4>
        <span
          className="rounded-full px-2 py-0.5 font-montserrat font-bold uppercase tracking-[0.14em]"
          style={{ fontSize: 9, background: `${palette.color}1f`, color: palette.color, border: `1px solid ${palette.color}55` }}
        >
          {palette.label}
        </span>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-2">
        <p className="text-[10.5px] font-roboto text-white/65 leading-snug">
          Minutes must be drafted within {event.minutes?.dueOffsetDays || 7} calendar days of the meeting. Missing minutes create a survey gap.
        </p>
        {!locked && (
          <div className="flex gap-1.5 flex-wrap">
            <MinuteBtn active={status === 'draft'}     color="#FBBF24" onClick={() => { store.setMinutesStatus(event.id, 'draft'); push('success', 'Minutes draft started'); }}>
              Start Draft
            </MinuteBtn>
            <MinuteBtn active={status === 'finalized'} color="#10B981" onClick={() => { store.setMinutesStatus(event.id, 'finalized'); push('success', 'Minutes finalized'); }}>
              Finalize
            </MinuteBtn>
            <MinuteBtn active={status === 'missing'} color="#EF4444" onClick={() => { store.setMinutesStatus(event.id, 'missing'); push('warn', 'Minutes flagged missing'); }}>
              Flag Missing
            </MinuteBtn>
          </div>
        )}
      </div>
    </section>
  );
}

function MinuteBtn({ children, color, active, onClick }: { children: React.ReactNode; color: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-[0.12em] border transition-colors"
      style={{
        color: active ? color : 'rgba(255,255,255,0.75)',
        borderColor: active ? `${color}99` : 'rgba(255,255,255,0.12)',
        background: active ? `${color}18` : 'transparent',
      }}
    >
      {children}
    </button>
  );
}

/* ─── Validation panel ──────────────────────────────── */
function ValidationPanel({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const report = store.validateEvent(event);
  const complete = store.isEventComplete(event.id);
  const push = useToastStore(s => s.push);

  return (
    <section
      className="rounded-lg border p-3"
      style={{
        borderColor: complete ? 'rgba(16,185,129,0.45)' : report.canComplete ? 'rgba(var(--ci-accent-rgb),0.45)' : 'rgba(239,68,68,0.35)',
        background: complete ? 'rgba(16,185,129,0.05)' : report.canComplete ? 'rgba(var(--ci-accent-rgb),0.05)' : 'rgba(239,68,68,0.04)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={12} className={complete ? 'text-[#10B981]' : report.canComplete ? 'text-[#FFC107]' : 'text-[#EF4444]'} />
        <h4 className="font-montserrat font-bold text-white text-[11.5px] uppercase tracking-[0.16em]">
          Completion Validation
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[10.5px] font-roboto text-white/70 mb-3">
        <CheckRow ok={report.progress.stepsComplete === report.progress.stepsTotal && report.progress.stepsTotal > 0} label={`${report.progress.stepsComplete}/${report.progress.stepsTotal} execution steps complete`} />
        <CheckRow ok={report.progress.formsComplete === report.progress.formsTotal} label={`${report.progress.formsComplete}/${report.progress.formsTotal} required forms complete`} />
        <CheckRow ok={!report.progress.minutesRequired || report.progress.minutesFinalized} label={report.progress.minutesRequired ? 'Meeting minutes finalized' : 'Minutes not required'} />
        <CheckRow ok={!report.blockers.some(b => b.kind === 'approval')} label="No pending approvals" />
      </div>

      {report.blockers.length > 0 && !complete && (
        <div className="mb-3 rounded-md border border-[#EF4444]/30 bg-[#EF4444]/05 p-2">
          <div className="flex items-center gap-1.5 mb-1 text-[#EF4444]">
            <AlertTriangle size={11} />
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]">
              {summarizeBlockers(report.blockers)}
            </span>
          </div>
          <ul className="space-y-0.5">
            {report.blockers.slice(0, 5).map((b, i) => (
              <li key={i} className="text-[10.5px] font-roboto text-white/70 flex items-start gap-1.5">
                <Circle size={8} className="text-[#EF4444] shrink-0 mt-1" />
                <span>
                  <span className="text-[#FFC107] uppercase tracking-[0.12em] font-montserrat font-bold text-[9px] mr-1">{b.kind}</span>
                  {b.label}
                </span>
              </li>
            ))}
            {report.blockers.length > 5 && (
              <li className="text-[10px] font-roboto text-white/45">+ {report.blockers.length - 5} more items to resolve…</li>
            )}
          </ul>
        </div>
      )}

      {report.canComplete && !complete && (
        <p className="text-[10.5px] font-roboto text-[#10B981]/90 leading-snug mb-3">
          All required workflow steps, forms, and evidence are in place. You can mark this event complete and file it as audit-ready.
        </p>
      )}

      {complete ? (
        <button
          onClick={() => { store.reopenEvent(event.id); push('warn', 'Event reopened', event.title); }}
          className="w-full rounded-md border border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24] hover:bg-[#FBBF24]/15 py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5"
        >
          <Unlock size={12} /> Reopen Event
        </button>
      ) : (
        <button
          disabled={!report.canComplete}
          onClick={() => {
            const r = store.markEventComplete(event);
            r.ok ? push('success', 'Event completed', event.title) : push('error', 'Cannot complete', r.message);
          }}
          className="w-full rounded-md border py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-colors disabled:cursor-not-allowed"
          style={{
            borderColor: report.canComplete ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.10)',
            background: report.canComplete ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
            color: report.canComplete ? '#10B981' : 'rgba(255,255,255,0.35)',
          }}
        >
          <CheckCircle2 size={12} />
          {report.canComplete ? 'Mark Event Complete' : 'Blocked by validation'}
        </button>
      )}
    </section>
  );
}

function summarizeBlockers(blockers: { kind: string; label: string }[]): string {
  const counts = blockers.reduce((acc, b) => {
    acc[b.kind] = (acc[b.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const parts: string[] = [];
  if (counts.form)     parts.push(`${counts.form} form${counts.form > 1 ? 's' : ''} outstanding`);
  if (counts.step)     parts.push(`${counts.step} step${counts.step > 1 ? 's' : ''} open`);
  if (counts.minutes)  parts.push('minutes missing');
  if (counts.approval) parts.push(`${counts.approval} approval${counts.approval > 1 ? 's' : ''} pending`);
  if (counts.evidence) parts.push('evidence missing');
  return parts.length ? `Cannot close yet — ${parts.join(' · ')}` : `${blockers.length} blocker${blockers.length > 1 ? 's' : ''} remaining`;
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok
        ? <CheckCircle2 size={11} className="text-[#10B981] shrink-0" />
        : <Circle size={11} className="text-[#EF4444] shrink-0" />}
      <span className={ok ? 'text-white/85' : 'text-white/55'}>{label}</span>
    </div>
  );
}

/* ─── Footer ─────────────────────────────────────────── */
function WorkflowFooter({ event, onClose }: { event: RegulatoryEvent; onClose: () => void }) {
  const store = useRegulatoryExecutionStore();
  const validation = store.validateEvent(event);
  return (
    <>
      <div className="flex items-center gap-2 text-[10.5px] font-roboto text-white/55">
        <Workflow size={11} className="text-[#FFC107]" />
        Progress · <span className="text-white/80 font-montserrat font-bold">{validation.progress.stepsComplete} / {Math.max(1, validation.progress.stepsTotal)} steps</span>
      </div>
      <button
        onClick={onClose}
        className="rounded-md border border-white/10 px-3 py-1.5 text-[10.5px] font-montserrat font-bold text-white/80 hover:text-white hover:bg-white/[0.05] uppercase tracking-[0.14em]"
      >
        Close
      </button>
    </>
  );
}

/* ─── Progress bar ───────────────────────────────────── */
function ProgressBar({ label, current, total }: { label: string; current: number; total: number }) {
  const pct = Math.round((current / Math.max(1, total)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-montserrat font-bold text-white/60 uppercase tracking-[0.14em]">{label}</span>
        <span className="text-[10.5px] font-outfit text-white/80">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, rgba(var(--ci-accent-rgb), 1), rgba(var(--ci-accent-rgb), 0.55))' }}
        />
      </div>
    </div>
  );
}

/* ─── Palette helpers ────────────────────────────────── */
function stepPalette(s: StepStatus) {
  switch (s) {
    case 'complete':    return { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.45)', fg: '#10B981' };
    case 'in-progress': return { bg: 'rgba(251,191,36,0.18)', border: 'rgba(251,191,36,0.45)', fg: '#FBBF24' };
    default:            return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.14)', fg: 'rgba(255,255,255,0.55)' };
  }
}
function formPalette(s: FormStatus) {
  switch (s) {
    case 'complete':         return { color: '#10B981', label: 'Completed' };
    case 'in-progress':      return { color: '#FBBF24', label: 'In Progress' };
    case 'requires-review':  return { color: '#A78BFA', label: 'In Review' };
    case 'missing':          return { color: '#EF4444', label: 'Missing' };
    default:                 return { color: 'rgba(255,255,255,0.45)', label: 'Pending' };
  }
}
