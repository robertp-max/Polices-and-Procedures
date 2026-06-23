import {
  FileText, ClipboardList, Boxes, Workflow,
  ListChecks, ClipboardCheck, Landmark, Gauge, GraduationCap,
  Sparkles, Printer, Download, CalendarCheck, CheckCircle2, ArrowUpRight,
} from 'lucide-react';
import type { ActionType, AvailableAction } from '../lib/responseTypes';
import { sanitizeAvailableActions } from '../lib/referenceSanitizer';

/* ═══════════════════════════════════════════════════════════════
   AvailableActions — compact button strip that triggers either:
     - a reference open in the right panel, OR
     - a studio re-generation (e.g., generate_action_plan)

   The actual trigger semantics are delegated to the parent so the
   page can re-query the backend or swap the right-panel preview.
   ═══════════════════════════════════════════════════════════════ */

export interface AvailableActionsProps {
  actions: AvailableAction[];
  isLight: boolean;
  onAction: (action: AvailableAction) => void;
  runningActionId?: string | null;
}

export function AvailableActions({ actions, isLight, onAction, runningActionId }: AvailableActionsProps) {
  const resolvedActions = sanitizeAvailableActions(actions, 'AvailableActions');
  if (resolvedActions.length === 0) return null;

  const primary = resolvedActions.filter(a => a.priority === 'primary');
  const secondary = resolvedActions.filter(a => a.priority === 'secondary');

  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';
  const accent = isLight ? '#C74601' : '#FFC107';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';

  return (
    <section
      className="rounded-2xl p-4"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} strokeWidth={1.75} style={{ color: accent }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
        >
          Available Actions
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
        >
          · {resolvedActions.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {primary.map(a => (
          <ActionButton
            key={a.id}
            action={a}
            isLight={isLight}
            running={runningActionId === a.id}
            onClick={() => onAction(a)}
            prominent
          />
        ))}
        {secondary.map(a => (
          <ActionButton
            key={a.id}
            action={a}
            isLight={isLight}
            running={runningActionId === a.id}
            onClick={() => onAction(a)}
          />
        ))}
      </div>
    </section>
  );
}

function ActionButton({
  action,
  isLight,
  running,
  prominent = false,
  onClick,
}: {
  action: AvailableAction;
  isLight: boolean;
  running: boolean;
  prominent?: boolean;
  onClick: () => void;
}) {
  const Icon = iconForAction(action.type);
  const accent = isLight ? '#C74601' : '#FFC107';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const muted = isLight ? '#52404B' : 'rgba(255,255,255,0.75)';

  const color = prominent
    ? (isLight ? '#FFFFFF' : '#0A0202')
    : muted;
  const bg = prominent
    ? (isLight ? '#C74601' : 'linear-gradient(to bottom,#FFC107,#D9A406)')
    : (isLight ? '#FFFFFF' : 'rgba(255,255,255,0.035)');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={running}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-[0.12em] transition-transform"
      style={{
        color,
        background: bg,
        border: `1px solid ${prominent ? 'transparent' : border}`,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: running ? 'wait' : 'pointer',
        opacity: running ? 0.65 : 1,
      }}
      onMouseEnter={e => {
        if (!prominent && !running) {
          e.currentTarget.style.borderColor = accent;
          e.currentTarget.style.color = accent;
        } else if (!running) {
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        if (!prominent && !running) {
          e.currentTarget.style.borderColor = border;
          e.currentTarget.style.color = muted;
        } else {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <Icon size={13} strokeWidth={2} />
      {action.label}
      {prominent && <ArrowUpRight size={11} strokeWidth={2} />}
    </button>
  );
}

function iconForAction(type: ActionType) {
  switch (type) {
    case 'open_form':                    return ClipboardList;
    case 'open_appendix':                return Boxes;
    case 'open_workflow':                return Workflow;
    case 'open_policy':                  return FileText;
    case 'open_reference':               return FileText;
    case 'generate_summary':             return Sparkles;
    case 'generate_action_plan':         return ListChecks;
    case 'generate_audit_checklist':     return ClipboardCheck;
    case 'generate_governing_body_brief':return Landmark;
    case 'generate_qapi_digest':         return Gauge;
    case 'generate_knowledge_article':   return GraduationCap;
    case 'print_form':                   return Printer;
    case 'download_pdf':                 return Download;
    case 'attach_to_event':              return CalendarCheck;
    case 'mark_complete':                return CheckCircle2;
    default:                             return Sparkles;
  }
}
