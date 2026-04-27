/* ═══════════════════════════════════════════════════════════════
   SprintTaskPanel
   --------------------------------------------------------------
   Sprint-mode replacement for `WorkflowExecutionPanel`. Same
   right-rail slot, image-1 visual style. Replaces the EVENT /
   WORKFLOW / EVENT RECORD / AUDIT tabs with sprint task status
   sections (Ready · In Progress · Awaiting Signature · Blocked ·
   Completed) over the selected SPRINT_TASK obligation.

   When a TASK obligation has a form requirement and the user
   activates it, the actual form renders inline below the task
   list — no fake "Mark Complete" button.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';
import {
  X, FileText, PenLine, Upload, ShieldAlert, CheckCircle2, Circle,
  ListChecks, AlertCircle, Maximize2, Minimize2,
} from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { TEAL_PRIMARY } from '@/policy/components/regulatory/timelineState';
import { FormViewer } from '@/policy/components/FormViewer';
import { useObligations } from '@/policy/ces/obligations';
import type { ComplianceState } from '@/policy/ces/types';
import type { MergedExecutionUnit } from '@/policy/compliance-execution/complianceExecutionTypes';

export interface SprintTaskPanelProps {
  /** Selected sprint task (mandated event) — same selection model as
      WorkflowExecutionPanel so toggling modes keeps the active item. */
  event:    RegulatoryEvent | null;
  onClear?: () => void;
  today?:   Date;
}

const STATE_SECTIONS: ReadonlyArray<{ key: ComplianceState; label: string; tone: string; bg: string; border: string }> = [
  { key: 'ready',              label: 'Ready',              tone: '#1A3778', bg: 'rgba(26,55,120,0.08)',  border: 'rgba(26,55,120,0.25)' },
  { key: 'in_progress',        label: 'In Progress',        tone: '#1A3778', bg: 'rgba(26,55,120,0.08)',  border: 'rgba(26,55,120,0.25)' },
  { key: 'awaiting_signature', label: 'Awaiting Signature', tone: '#F04B22', bg: 'rgba(240,75,34,0.08)',  border: 'rgba(240,75,34,0.30)' },
  { key: 'blocked',            label: 'Blocked',            tone: '#C53030', bg: 'rgba(197,48,48,0.08)',  border: 'rgba(197,48,48,0.30)' },
  { key: 'completed',          label: 'Completed',          tone: '#2F855A', bg: 'rgba(47,133,90,0.08)',  border: 'rgba(47,133,90,0.25)' },
];

export function SprintTaskPanel({ event, onClear }: SprintTaskPanelProps) {
  const obligations = useObligations();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [renderFormId, setRenderFormId] = useState<string | null>(null);

  if (!event) {
    return (
      <div className="h-full w-full rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-center p-6">
        <div>
          <ListChecks size={28} className="mx-auto text-white/30 mb-3" />
          <div className="text-[12px] text-white/60 font-outfit">
            Select a sprint task on the calendar
          </div>
        </div>
      </div>
    );
  }

  return <SprintTaskPanelContent
    event={event}
    onClear={onClear}
    obligations={obligations}
    activeTaskId={activeTaskId}
    setActiveTaskId={setActiveTaskId}
    renderFormId={renderFormId}
    setRenderFormId={setRenderFormId}
  />;
}

function SprintTaskPanelContent({
  event, onClear, obligations,
  activeTaskId, setActiveTaskId, renderFormId, setRenderFormId,
}: {
  event:        RegulatoryEvent;
  onClear?:     () => void;
  obligations:  ReturnType<typeof useObligations>;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  renderFormId: string | null;
  setRenderFormId: (id: string | null) => void;
}) {
  const sprintTask = obligations.getSprintTaskById(event.id);
  const childTasks = useMemo(
    () => {
      // Per-employee onboarding tasks (subjectEmployeeId set) are NOT
      // shown individually here — they're rolled up under the parent
      // mandated event's collective evidence task. See user guidance:
      // "do not add individual appendix F task per employee."
      const all = obligations.getChildTasks(event.id);
      const filtered = all.filter(
        t => !(t as { subjectEmployeeId?: string }).subjectEmployeeId,
      );
      // Sort by dueDate ascending so the sprint board shows nearest
      // deadlines first per the user's deadline-ordering rule.
      return [...filtered].sort(
        (a, b) => +new Date(a.dueDate) - +new Date(b.dueDate),
      );
    },
    [obligations, event.id],
  );

  const grouped = useMemo(() => {
    const g: Record<ComplianceState, MergedExecutionUnit[]> = {
      upcoming: [], ready: [], in_progress: [],
      awaiting_signature: [], blocked: [], completed: [],
    };
    childTasks.forEach(t => g[t.complianceState].push(t));
    return g;
  }, [childTasks]);

  const totals = childTasks.length;
  const done   = childTasks.filter(t => t.complianceState === 'completed').length;
  const blocked = childTasks.filter(t => t.complianceState === 'blocked').length;
  const awaiting = childTasks.filter(t => t.complianceState === 'awaiting_signature').length;

  const activeTask = activeTaskId
    ? childTasks.find(t => t.id === activeTaskId) ?? null
    : null;
  /** Form modal state — Maximize the inline form to a centered modal
      while filling/signing. Esc / X to dismiss back to inline mode. */
  const [formMaximized, setFormMaximized] = useState(false);
  /** Pick a form requirement for the active task, if any. */
  const activeTaskFormId = useMemo(() => {
    if (!activeTask) return null;
    if (renderFormId) return renderFormId;
    if (activeTask.sourceFormIds && activeTask.sourceFormIds.length > 0) return activeTask.sourceFormIds[0];
    // Fallback — if the parent event step that owns this task lists forms, pick the first.
    const stepWithForms = event.processFlow.find(s => (s.requiredFormIds?.length ?? 0) > 0);
    return stepWithForms?.requiredFormIds?.[0] ?? null;
  }, [activeTask, renderFormId, event]);

  const canSignTask = (t: MergedExecutionUnit) =>
    t.requiredSigners?.length > 0 || t.complianceState === 'awaiting_signature';

  return (
    <aside className="h-full flex flex-col rounded-xl border border-white/10 bg-white overflow-hidden text-[#1F1C1B]">
      {/* Header */}
      <header className="px-5 py-4 flex items-start gap-3 border-b border-[#E5E4E3]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL_PRIMARY }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: TEAL_PRIMARY }}>
              Sprint Task · {(event.cadence ?? '').toString().toUpperCase()}
            </span>
          </div>
          <h2 className="text-[15px] font-bold leading-snug" style={{ color: '#1A3778' }}>
            {event.title}
          </h2>
          <div className="mt-1 text-[11px] text-[#747470]">
            Anchor {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            {event.owner && <> · Owner: <span className="font-semibold text-[#1F1C1B]">{event.owner}</span></>}
            {event.ownerRole && <> · {event.ownerRole}</>}
          </div>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md p-1.5 hover:bg-[#F0F2F5]"
            aria-label="Close sprint task"
          >
            <X size={16} className="text-[#747470]" />
          </button>
        )}
      </header>

      {/* Roll-up bar */}
      <div className="px-5 py-2.5 flex items-center gap-3 border-b border-[#E5E4E3] bg-[#FCFDFF] text-[11px]">
        <RollupChip label="Tasks" value={`${done}/${totals}`} />
        {awaiting > 0 && <RollupChip label="Awaiting Sig" value={awaiting} tone="#F04B22" />}
        {blocked > 0  && <RollupChip label="Blocked"      value={blocked}  tone="#C53030" />}
        {sprintTask && (
          <span
            className="ml-auto text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded"
            style={{ background: 'rgba(26,55,120,0.08)', color: '#1A3778' }}
          >
            {sprintTask.rolledState.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto">
        {totals === 0 ? (
          <div className="p-6 text-center text-[12px] text-[#747470]">
            No execution tasks scheduled for this sprint task yet.
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {STATE_SECTIONS.map(section => {
              const items = grouped[section.key];
              if (items.length === 0) return null;
              return (
                <section key={section.key}>
                  <div
                    className="flex items-center gap-2 mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: section.tone }}
                  >
                    {section.label}
                    <span className="font-normal normal-case tracking-normal text-[#747470]">({items.length})</span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map(t => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        sectionTone={section.tone}
                        sectionBg={section.bg}
                        sectionBorder={section.border}
                        active={t.id === activeTaskId}
                        onSelect={() => {
                          setActiveTaskId(t.id);
                          setRenderFormId(null);
                        }}
                        onCompleteForm={(formId) => {
                          setActiveTaskId(t.id);
                          setRenderFormId(formId);
                        }}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        {/* Inline form workspace — replaces "Mark Complete" for form tasks. */}
        {activeTask && activeTaskFormId && !formMaximized && (
          <section className="border-t border-[#E5E4E3] bg-[#FAFBF8]">
            <div className="px-5 py-2.5 flex items-center justify-between gap-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#1A3778]">
                Complete Form · <span className="font-mono normal-case tracking-normal">{activeTaskFormId}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFormMaximized(true)}
                  className="text-[#747470] hover:text-[#1A3778] p-1 rounded"
                  title="Maximize form"
                  aria-label="Maximize form"
                >
                  <Maximize2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setRenderFormId(null)}
                  className="text-[11px] text-[#747470] hover:text-[#1F1C1B] underline"
                >
                  Hide form
                </button>
              </div>
            </div>
            <div className="border-t border-[#E5E4E3]">
              <FormViewer formId={activeTaskFormId} formSource="task" parentTaskId={activeTask.id} enableEmbeddedSigning />
            </div>
          </section>
        )}
      </div>

      {/* Maximized form modal — centered overlay, Esc to dismiss. */}
      {activeTask && activeTaskFormId && formMaximized && (
        <FormMaximizedModal
          formId={activeTaskFormId}
          parentTaskId={activeTask.id}
          onMinimize={() => setFormMaximized(false)}
          onClose={() => { setFormMaximized(false); setRenderFormId(null); }}
        />
      )}

      {/* Action footer (only when a task is selected and not already showing form) */}
      {activeTask && !activeTaskFormId && (
        <footer className="px-5 py-3 border-t border-[#E5E4E3] flex items-center gap-2 bg-white">
          {canSignTask(activeTask) && (
            <button
              type="button"
              className="text-[11.5px] font-semibold px-3 py-1.5 rounded-md text-white"
              style={{ background: '#F04B22' }}
              onClick={() => {
                // Signature path — defer to existing eCIgn flow via the form renderer if available.
                if (activeTask.sourceFormIds?.[0]) setRenderFormId(activeTask.sourceFormIds[0]);
              }}
            >
              <PenLine size={12} className="inline mr-1" />
              Request Signature
            </button>
          )}
          <button
            type="button"
            className="text-[11.5px] font-semibold px-3 py-1.5 rounded-md border border-[#1A3778] text-[#1A3778]"
            onClick={() => {
              // Open form for upload/evidence path.
              const formId = activeTask.sourceFormIds?.[0]
                ?? event.processFlow.find(s => (s.requiredFormIds?.length ?? 0) > 0)?.requiredFormIds?.[0]
                ?? null;
              if (formId) setRenderFormId(formId);
            }}
          >
            <Upload size={12} className="inline mr-1" />
            Upload Evidence
          </button>
          {activeTask.complianceState !== 'blocked' && (
            <button
              type="button"
              className="ml-auto text-[11.5px] font-semibold px-3 py-1.5 rounded-md border border-[#C53030] text-[#C53030]"
            >
              <ShieldAlert size={12} className="inline mr-1" />
              Mark Blocked
            </button>
          )}
        </footer>
      )}
    </aside>
  );
}

/* ─── Atoms ─────────────────────────────────────────────────── */

function RollupChip({ label, value, tone = '#1A3778' }: { label: string; value: string | number; tone?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#747470]">{label}</span>
      <span className="text-[11.5px] font-semibold" style={{ color: tone }}>{value}</span>
    </span>
  );
}

function TaskRow({
  task, sectionBg, sectionBorder, active, onSelect, onCompleteForm,
}: {
  task:           MergedExecutionUnit;
  sectionTone?:   string;
  sectionBg:      string;
  sectionBorder:  string;
  active:         boolean;
  onSelect:       () => void;
  onCompleteForm: (formId: string) => void;
}) {
  const isDone   = task.complianceState === 'completed';
  const formId   = task.sourceFormIds?.[0] ?? null;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left rounded-md px-3 py-2 flex items-start gap-2.5 transition-colors"
        style={{
          background: active ? sectionBg     : '#FCFDFF',
          border:     `1px solid ${active ? sectionBorder : '#E5E4E3'}`,
        }}
      >
        {isDone
          ? <CheckCircle2 size={14} style={{ color: '#2F855A' }} className="mt-0.5 flex-shrink-0" />
          : task.complianceState === 'blocked'
            ? <AlertCircle size={14} style={{ color: '#C53030' }} className="mt-0.5 flex-shrink-0" />
            : <Circle size={12} style={{ color: '#747470' }} className="mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold leading-snug" style={{ color: '#1F1C1B' }}>
            {task.title}
          </div>
          <div className="text-[10.5px] text-[#747470] mt-0.5">
            Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {/* Role-only assignment per policy refs (e.g. Governing Body, Administrator). */}
            {task.owner?.role && <> · {task.owner.role}</>}
          </div>
        </div>
        {formId && !isDone && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onCompleteForm(formId); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onCompleteForm(formId); } }}
            className="text-[10.5px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded cursor-pointer hover:opacity-80"
            style={{ background: '#1A3778', color: 'white' }}
          >
            <FileText size={10} className="inline mr-1" />
            Complete Form
          </span>
        )}
      </button>
    </li>
  );
}

/* ----------------------------------------------------------------
   FormMaximizedModal — centered overlay rendering FormViewer at
   ~80vw / ~88vh while filling/signing. Backdrop click dismisses to
   inline mode; X closes the form workspace entirely.
   ---------------------------------------------------------------- */
function FormMaximizedModal({
  formId, parentTaskId, onMinimize, onClose,
}: {
  formId: string;
  parentTaskId: string;
  onMinimize: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Form workspace"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm"
      onClick={onMinimize}
      onKeyDown={(e) => { if (e.key === 'Escape') onMinimize(); }}
    >
      <div
        className="relative w-[80vw] max-w-[1200px] h-[88vh] bg-white rounded-xl shadow-2xl border border-[#E5E4E3] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-3 flex items-center justify-between gap-3 border-b border-[#E5E4E3] bg-[#FAFBF8]">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#1A3778]">
            Complete Form · <span className="font-mono normal-case tracking-normal">{formId}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMinimize}
              className="text-[#747470] hover:text-[#1A3778] p-1.5 rounded"
              title="Minimize"
              aria-label="Minimize"
            >
              <Minimize2 size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#747470] hover:text-[#1F1C1B] p-1.5 rounded"
              title="Close form"
              aria-label="Close form"
            >
              <X size={16} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-white">
          <FormViewer
            formId={formId}
            formSource="task"
            parentTaskId={parentTaskId}
            enableEmbeddedSigning
          />
        </div>
      </div>
    </div>
  );
}
