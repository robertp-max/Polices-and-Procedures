/**
 * TaskDetailRightPanel — UNIFIED right-side detail panel for ALL PM views.
 *
 * Reads via the canonical projector (taskProjection.useProjectedTaskById)
 * and renders identical content regardless of entry view (Event View,
 * My Tasks, Kanban, Gantt, Sprint Board).
 *
 * Action buttons route to the existing eCIgn workspace; this component
 * NEVER mutates compliance state directly.
 *
 * Visual contract: must match the dark glassmorphic look of
 * WorkflowExecutionPanel / SprintTaskPanel — no raw browser-default
 * <dl> rendering.
 */

import { useMemo, type ReactElement, type ReactNode } from 'react';
import { X, ExternalLink, FileText, ClipboardCheck, Users, Calendar, ShieldCheck, History } from 'lucide-react';
import {
  ECIGN_PACKET_STATUS_LABEL,
  PM_TASK_STATUS_LABEL,
} from '@/policy/pm/ecignStatusMap';
import { useProjectedTaskById } from '@/policy/pm/taskProjection';
import { usePmOverlayStore } from '@/policy/pm/pmOverlayStore';
import {
  isEcignSubmissionTask,
  isPersonalTask,
  type EcignSubmissionTask,
  type PmTaskStatus,
  type Task,
} from '@/policy/pm/types';

const STATUS_PILL: Record<PmTaskStatus, { bg: string; fg: string; bd: string }> = {
  todo:        { bg: 'rgba(148,163,184,0.18)', fg: '#cbd5e1', bd: 'rgba(148,163,184,0.45)' },
  in_progress: { bg: 'rgba(56,189,248,0.18)',  fg: '#7dd3fc', bd: 'rgba(56,189,248,0.45)'  },
  in_review:   { bg: 'rgba(251,191,36,0.18)',  fg: '#fcd34d', bd: 'rgba(251,191,36,0.45)'  },
  blocked:     { bg: 'rgba(244,114,182,0.20)', fg: '#f9a8d4', bd: 'rgba(244,114,182,0.50)' },
  done:        { bg: 'rgba(45,212,191,0.20)',  fg: '#5eead4', bd: 'rgba(45,212,191,0.50)'  },
};

export interface TaskDetailRightPanelProps {
  taskId: string;
  /** Optional: navigate handler for "Open form" button. Defaults to `window.location.assign`. */
  onOpenForm?: (formId: string) => void;
  onClose?: () => void;
}

export function TaskDetailRightPanel({
  taskId,
  onOpenForm,
  onClose,
}: TaskDetailRightPanelProps): ReactElement {
  const task = useProjectedTaskById(taskId);
  const overlay = usePmOverlayStore(s =>
    task ? s.overlays[task.task_id] : undefined,
  );

  if (!task) {
    return (
      <aside className="h-full w-full flex flex-col rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
        <PanelHeader
          eyebrow={taskId}
          title="Task not found"
          status={null}
          onClose={onClose}
        />
        <div className="flex-1 flex items-center justify-center text-[12px] font-outfit text-white/55 px-4 text-center">
          The task <code className="ml-1 text-white/75">{taskId}</code> does not exist
          in the current projection.
        </div>
      </aside>
    );
  }

  const statusKey = task.status;
  const statusLabel = PM_TASK_STATUS_LABEL[statusKey];

  return (
    <aside
      className="h-full w-full flex flex-col rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden"
      data-task-id={task.task_id}
    >
      <PanelHeader
        eyebrow={task.task_id}
        title={task.title}
        status={{ label: statusLabel, key: statusKey }}
        onClose={onClose}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <SectionOverview task={task} />
        <SectionAssignment task={task} />
        <SectionTimeline task={task} />
        {isEcignSubmissionTask(task) && (
          <SectionEcign task={task} onOpenForm={onOpenForm} />
        )}
        {isEcignSubmissionTask(task) && <SectionEvidence task={task} />}
        <SectionAudit taskId={task.task_id} />

        {overlay?.weekend_override && (
          <div className="mx-4 mb-4 rounded-md border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-[11px] font-outfit text-amber-100">
            Weekend schedule override applied
            {overlay.weekend_override_reason
              ? `: ${overlay.weekend_override_reason}`
              : '.'}
          </div>
        )}
      </div>
    </aside>
  );
}

/* ─── Header ───────────────────────────────────────────────────────── */
function PanelHeader({
  eyebrow,
  title,
  status,
  onClose,
}: {
  eyebrow: string;
  title: string;
  status: { label: string; key: PmTaskStatus } | null;
  onClose?: () => void;
}): ReactElement {
  return (
    <header className="px-4 py-3 border-b border-white/10 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono text-white/45 truncate">{eyebrow}</p>
        <h2 className="font-outfit font-light text-white text-[16px] leading-snug mt-0.5">
          {title}
        </h2>
        {status && (
          <span
            className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-montserrat font-bold uppercase tracking-[0.18em] border"
            style={{
              background:  STATUS_PILL[status.key].bg,
              color:       STATUS_PILL[status.key].fg,
              borderColor: STATUS_PILL[status.key].bd,
            }}
          >
            {status.label}
          </span>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="w-7 h-7 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </header>
  );
}

/* ─── Section primitives ───────────────────────────────────────────── */
function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="px-4 py-3 border-b border-white/[0.06]">
      <h3 className="flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/55 mb-2">
        <span className="text-white/55">{icon}</span>
        {title}
      </h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="grid grid-cols-[110px_1fr] items-baseline gap-2">
      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
        {label}
      </span>
      <span className="text-[12px] font-outfit text-white/85 break-words">
        {children}
      </span>
    </div>
  );
}

/* ─── Sections ─────────────────────────────────────────────────────── */
function SectionOverview({ task }: { task: Task }): ReactElement {
  return (
    <Section icon={<ClipboardCheck size={11} />} title="Overview">
      {!isPersonalTask(task) && (
        <>
          <Field label="Event">
            <code className="text-white/85">{task.event_id}</code>
          </Field>
          <Field label="Workflow">
            <code className="text-white/85">{task.workflow_id || '—'}</code>
          </Field>
          {task.policy_id && (
            <Field label="Policy">
              <code className="text-white/85">{task.policy_id}</code>
            </Field>
          )}
          <Field label="Source">
            <span className="text-cyan-300/85">CES</span>
          </Field>
        </>
      )}
      {isPersonalTask(task) && (
        <Field label="Source"><span className="text-violet-300/85">Personal</span></Field>
      )}
      {task.description && (
        <Field label="Description">
          <span className="text-white/75">{task.description}</span>
        </Field>
      )}
    </Section>
  );
}

function SectionAssignment({ task }: { task: Task }): ReactElement {
  const assigned =
    task.source === 'personal'
      ? task.owner_user_id
      : task.assigned_user_id ?? 'Unassigned';
  const signers = isEcignSubmissionTask(task) ? task.required_signers : [];
  const approvers = isEcignSubmissionTask(task) ? task.approvers : [];
  return (
    <Section icon={<Users size={11} />} title="Assignment">
      <Field label="Assigned to">
        <span className="text-white/85">{assigned}</span>
      </Field>
      {signers.length > 0 && (
        <Field label="Signers">
          <ul className="flex flex-col gap-0.5">
            {signers.map(s => (
              <li key={s.signer_id} className="text-[11px]">
                {s.display_name}
                <span className="text-white/45"> · {s.role} · {s.status}</span>
              </li>
            ))}
          </ul>
        </Field>
      )}
      {approvers.length > 0 && (
        <Field label="Approvers">
          <ul className="flex flex-col gap-0.5">
            {approvers.map(a => (
              <li key={a.user_id} className="text-[11px]">{a.display_name}</li>
            ))}
          </ul>
        </Field>
      )}
    </Section>
  );
}

function SectionTimeline({ task }: { task: Task }): ReactElement {
  return (
    <Section icon={<Calendar size={11} />} title="Timeline">
      <Field label="Due date">
        <span className="text-white/85">{task.due_date ?? '—'}</span>
      </Field>
      <Field label="Sprint">
        <span className="text-white/85">{task.sprint_id ?? '—'}</span>
      </Field>
      <Field label="Story pts">
        <span className="text-white/85">{task.story_points ?? '—'}</span>
      </Field>
      <Field label="Depends on">
        <span className="text-white/75 text-[11px] font-mono">
          {task.dependencies.length === 0 ? 'None' : task.dependencies.join(', ')}
        </span>
      </Field>
    </Section>
  );
}

function SectionEcign({
  task,
  onOpenForm,
}: {
  task: EcignSubmissionTask;
  onOpenForm?: (formId: string) => void;
}): ReactElement {
  const packets = task.packets && task.packets.length > 0
    ? task.packets
    : task.packet
      ? [task.packet]
      : [];
  const formIds = task.form_ids ?? (task.form_id ? [task.form_id] : []);
  const primaryStatusLabel = ECIGN_PACKET_STATUS_LABEL[task.packet_status];

  const handleOpen = (fid: string) => {
    if (onOpenForm) { onOpenForm(fid); return; }
    if (typeof window !== 'undefined') {
      window.location.assign(`/forms/${encodeURIComponent(fid)}`);
    }
  };

  return (
    <Section icon={<FileText size={11} />} title="eCIgn">
      <Field label="Packet">
        <span className="text-white/85">{primaryStatusLabel}</span>
      </Field>
      {task.step_id && (
        <Field label="Step ID">
          <code className="text-[11px] text-white/75">{task.step_id}</code>
        </Field>
      )}
      <Field label="Forms">
        {formIds.length === 0 ? (
          <span className="text-white/45">—</span>
        ) : (
          <ul className="flex flex-col gap-1">
            {formIds.map((fid, i) => {
              const pkt = packets[i];
              const label = pkt ? ECIGN_PACKET_STATUS_LABEL[pkt.packet_status] : '—';
              return (
                <li key={fid} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpen(fid)}
                    className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                  >
                    {fid}
                    <ExternalLink size={10} />
                  </button>
                  <span className="text-[10px] text-white/55">· {label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Field>
      {task.blocker_reason && (
        <Field label="Blocker">
          <span className="text-pink-300/85">{task.blocker_reason}</span>
        </Field>
      )}
    </Section>
  );
}

function SectionEvidence({ task }: { task: EcignSubmissionTask }): ReactElement {
  const evidence = task.packet?.evidence;
  return (
    <Section icon={<ShieldCheck size={11} />} title="Evidence">
      {!evidence ? (
        <p className="text-[11px] text-white/55">No evidence generated yet.</p>
      ) : (
        <>
          <Field label="Status">
            <span className="text-white/85">{evidence.status}</span>
          </Field>
          <Field label="Evidence ID">
            <code className="text-[11px] text-white/75">{evidence.evidence_id}</code>
          </Field>
          {evidence.s3_key && (
            <Field label="Location">
              <code className="text-[11px] text-white/75">
                {evidence.s3_bucket}/{evidence.s3_key}
              </code>
            </Field>
          )}
          {evidence.sha256 && (
            <Field label="SHA-256">
              <code className="text-[11px] text-white/75">
                {evidence.sha256.slice(0, 16)}…
              </code>
            </Field>
          )}
          <Field label="Created">
            <span className="text-white/75 text-[11px]">{evidence.created_at}</span>
          </Field>
        </>
      )}
    </Section>
  );
}

function SectionAudit({ taskId }: { taskId: string }): ReactElement {
  const audit = usePmOverlayStore(s => s.audit);
  const rows = useMemo(
    () => audit.filter(a => a.task_id === taskId).slice(-25).reverse(),
    [audit, taskId],
  );
  return (
    <Section icon={<History size={11} />} title="Audit trail">
      {rows.length === 0 ? (
        <p className="text-[11px] text-white/55">No PM overlay actions recorded.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map(r => (
            <li key={r.id} className="text-[11px] text-white/75">
              <span className="text-white/45 font-mono">{r.ts}</span>{' '}
              <span className="text-white">{r.action}</span>
              <span className="text-white/55"> · {r.actor_user_id}</span>
              {r.reason ? <span className="text-white/55"> — {r.reason}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export default TaskDetailRightPanel;
