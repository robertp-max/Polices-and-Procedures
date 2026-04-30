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
import { X, ExternalLink, FileText, ClipboardCheck, Users, Calendar, ShieldCheck, History, Eye, EyeOff } from 'lucide-react';
import {
  ECIGN_PACKET_STATUS_LABEL,
  PM_TASK_STATUS_LABEL,
} from '@/policy/pm/ecignStatusMap';
import { useProjectedTaskById } from '@/policy/pm/taskProjection';
import { usePmOverlayStore } from '@/policy/pm/pmOverlayStore';
import { getCurrentUserId } from '@/policy/pm/currentUser';
import {
  isEcignSubmissionTask,
  isPersonalTask,
  type EcignSubmissionTask,
  type PmTaskStatus,
  type Task,
} from '@/policy/pm/types';
import { useFormInstances } from '@/policy/pm/formInstances';
import { EntityLink } from './EntityLink';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { getCorpusPolicy } from '@/policy/data/policyCorpus';
import { RightDrawer, CiStatusBadge } from '@/policy/components/ui';

const STATUS_TONE: Record<PmTaskStatus, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  todo: 'neutral',
  in_progress: 'info',
  in_review: 'warning',
  blocked: 'danger',
  done: 'success',
};

type PanelTokens = {
  panelBackground: string;
  panelBorder: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  labelText: string;
  linkText: string;
  divider: string;
  badgeBackground: string;
};

function getPanelTokens(): PanelTokens {
  return {
    panelBackground: 'ci-glass-panel',
    panelBorder: 'ci-border',
    primaryText: 'ci-text',
    secondaryText: 'ci-text-muted',
    mutedText: 'ci-text-subtle',
    labelText: 'ci-link',
    linkText: 'ci-link',
    divider: 'ci-border',
    badgeBackground: 'ci-surface-muted',
  };
}

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
  const tokens = getPanelTokens();
  const task = useProjectedTaskById(taskId);
  const overlay = usePmOverlayStore(s =>
    task ? s.overlays[task.task_id] : undefined,
  );
  const currentUserId = getCurrentUserId();
  const isWatching = usePmOverlayStore(s =>
    task ? s.isWatching(task.task_id, currentUserId) : false,
  );
  const watchTask   = usePmOverlayStore(s => s.watchTask);
  const unwatchTask = usePmOverlayStore(s => s.unwatchTask);

  if (!task) {
    return (
      <RightDrawer inline open onClose={() => onClose?.()}>
        <PanelHeader
          eyebrow={taskId}
          title="Task not found"
          status={null}
          onClose={onClose}
          tokens={tokens}
        />
        <div className={`flex-1 flex items-center justify-center text-[12px] font-outfit px-4 text-center ${tokens.secondaryText}`}>
          The task <code className={`ml-1 ${tokens.primaryText}`}>{taskId}</code> does not exist
          in the current projection.
        </div>
      </RightDrawer>
    );
  }

  const statusKey = task.status;
  const statusLabel = PM_TASK_STATUS_LABEL[statusKey];
  const openTask = useSelectedTaskStore(s => s.openTask);

  return (
    <RightDrawer inline open onClose={() => onClose?.()}>
      <div data-task-id={task.task_id}>
      <PanelHeader
        eyebrow={task.task_id}
        title={task.title}
        status={{ label: statusLabel, key: statusKey }}
        onClose={onClose}
        tokens={tokens}
        isWatching={isWatching}
        onToggleWatch={() => {
          if (isWatching) {
            unwatchTask(task.task_id, currentUserId);
          } else {
            watchTask(task.task_id, currentUserId);
          }
        }}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <SectionOverview task={task} onOpenTask={(id) => openTask(id, 'kanban')} tokens={tokens} />
        <SectionAssignment task={task} tokens={tokens} />
        <SectionTimeline task={task} onOpenTask={(id) => openTask(id, 'gantt')} tokens={tokens} />
        {isEcignSubmissionTask(task) && (
          <SectionEcign task={task} onOpenForm={onOpenForm} tokens={tokens} />
        )}
        {isEcignSubmissionTask(task) && <SectionEvidence task={task} tokens={tokens} />}
        <SectionAudit taskId={task.task_id} tokens={tokens} />

        {overlay?.weekend_override && (
          <div className="mx-4 mb-4 rounded-md border px-3 py-2 text-[11px] font-outfit"
            style={{ borderColor: 'var(--ci-warning-bdr)', background: 'var(--ci-warning-bg)', color: 'var(--ci-warning-fg)' }}>
            Weekend schedule override applied
            {overlay.weekend_override_reason
              ? `: ${overlay.weekend_override_reason}`
              : '.'}
          </div>
        )}
      </div>
      </div>
    </RightDrawer>
  );
}

/* ─── Header ───────────────────────────────────────────────────────── */
function PanelHeader({
  eyebrow,
  title,
  status,
  onClose,
  tokens,
  isWatching,
  onToggleWatch,
}: {
  eyebrow: string;
  title: string;
  status: { label: string; key: PmTaskStatus } | null;
  onClose?: () => void;
  tokens: PanelTokens;
  isWatching?: boolean;
  onToggleWatch?: () => void;
}): ReactElement {
  return (
    <header className="px-4 py-3 border-b flex items-start justify-between gap-3 ci-border">
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-mono truncate ${tokens.mutedText}`}>{eyebrow}</p>
        <h2 className={`font-outfit font-light text-[16px] leading-snug mt-0.5 ${tokens.primaryText}`}>
          {title}
        </h2>
        {status && (
          <span className="inline-flex mt-2">
            <CiStatusBadge tone={STATUS_TONE[status.key]}>{status.label}</CiStatusBadge>
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onToggleWatch && (
          <button
            type="button"
            onClick={onToggleWatch}
            aria-label={isWatching ? 'Unwatch task' : 'Watch task'}
            title={isWatching ? 'Unwatch' : 'Watch'}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors bg-transparent ${
              isWatching ? 'ci-link' : `${tokens.mutedText} hover:text-white`
            }`}
          >
            {isWatching ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors bg-transparent ${tokens.mutedText}`}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
}

/* ─── Section primitives ───────────────────────────────────────────── */
function Section({
  icon,
  title,
  children,
  tokens,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  tokens: PanelTokens;
}): ReactElement {
  return (
    <section className="px-4 py-3 border-b ci-border">
      <h3 className={`flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] mb-2 ${tokens.labelText}`}>
        <span className={tokens.labelText}>{icon}</span>
        {title}
      </h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  tokens,
}: {
  label: string;
  children: ReactNode;
  tokens: PanelTokens;
}): ReactElement {
  return (
    <div className="grid grid-cols-[110px_1fr] items-baseline gap-2">
      <span className={`text-[10px] font-mono uppercase tracking-wider ${tokens.mutedText}`}>
        {label}
      </span>
      <span className={`text-[12px] font-outfit break-words ${tokens.secondaryText}`}>
        {children}
      </span>
    </div>
  );
}

/* ─── Sections ─────────────────────────────────────────────────────── */
function SectionOverview({
  task,
  onOpenTask,
  tokens,
}: {
  task: Task;
  onOpenTask: (taskId: string) => void;
  tokens: PanelTokens;
}): ReactElement {
  const policyIds = task.policy_refs ?? task.policyRefs ?? (task.policy_id ? [task.policy_id] : []);
  return (
    <Section icon={<ClipboardCheck size={11} />} title="Overview" tokens={tokens}>
      {!isPersonalTask(task) && (
        <>
          <Field label="Event" tokens={tokens}>
            <EntityLink
              kind="event"
              id={task.event_id}
              label={task.event_title ?? task.event_id}
              subLabel={task.event_title ? `(${task.event_id})` : undefined}
            />
          </Field>
          <Field label="Workflow" tokens={tokens}>
            {task.workflow_id ? (
              <EntityLink
                kind="workflow"
                id={task.workflow_id}
                label={task.workflow_title ?? task.workflow_id}
                subLabel={task.workflow_title ? `(${task.workflow_id})` : undefined}
              />
            ) : '—'}
          </Field>
          {policyIds.length > 0 && (
            <Field label="Policy" tokens={tokens}>
              <span className="flex flex-wrap gap-1.5">
                {policyIds.map(pid => {
                  const policy = getCorpusPolicy(pid.toUpperCase());
                  return (
                    <EntityLink
                      key={pid}
                      kind="policy"
                      id={pid}
                      label={policy?.title ?? pid}
                      subLabel={policy?.title ? `(${pid})` : undefined}
                    />
                  );
                })}
              </span>
            </Field>
          )}
          <Field label="Task" tokens={tokens}>
            <EntityLink
              kind="task"
              id={task.task_id}
              label={task.title}
              subLabel={`(${task.task_id})`}
              onSelectTask={onOpenTask}
            />
          </Field>
          <Field label="Source" tokens={tokens}>
            <span className={tokens.linkText}>CES</span>
          </Field>
        </>
      )}
      {isPersonalTask(task) && (
        <Field label="Source" tokens={tokens}><span className={tokens.labelText}>Personal</span></Field>
      )}
      {task.description && (
        <Field label="Description" tokens={tokens}>
          <span className={tokens.secondaryText}>{task.description}</span>
        </Field>
      )}
    </Section>
  );
}

function SectionAssignment({ task, tokens }: { task: Task; tokens: PanelTokens }): ReactElement {
  const assigned =
    task.source === 'personal'
      ? task.owner_user_id
      : task.assigned_user_id ?? 'Unassigned';
  const signers = isEcignSubmissionTask(task) ? task.required_signers : [];
  const approvers = isEcignSubmissionTask(task) ? task.approvers : [];
  const watcherIds = usePmOverlayStore(s => s.overlays[task.task_id]?.watcher_user_ids ?? []);
  return (
    <Section icon={<Users size={11} />} title="Assignment" tokens={tokens}>
      <Field label="Assigned to" tokens={tokens}>
        <span className={tokens.secondaryText}>{assigned}</span>
      </Field>
      {watcherIds.length > 0 && (
        <Field label="Watchers" tokens={tokens}>
          <span className={tokens.secondaryText}>
            {watcherIds.length} watcher{watcherIds.length !== 1 ? 's' : ''}
          </span>
        </Field>
      )}
      {signers.length > 0 && (
        <Field label="Signers" tokens={tokens}>
          <ul className="flex flex-col gap-0.5">
            {signers.map(s => (
              <li key={s.signer_id} className="text-[11px]">
                {s.display_name}
                <span className={tokens.mutedText}> · {s.role} · {s.status}</span>
              </li>
            ))}
          </ul>
        </Field>
      )}
      {approvers.length > 0 && (
        <Field label="Approvers" tokens={tokens}>
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

function SectionTimeline({
  task,
  onOpenTask,
  tokens,
}: {
  task: Task;
  onOpenTask: (taskId: string) => void;
  tokens: PanelTokens;
}): ReactElement {
  const depends = task.depends_on ?? task.dependencies ?? [];
  return (
    <Section icon={<Calendar size={11} />} title="Timeline" tokens={tokens}>
      <Field label="Start date" tokens={tokens}>
        <span className={tokens.secondaryText}>{task.start_date}</span>
      </Field>
      <Field label="Due date" tokens={tokens}>
        <span className={tokens.secondaryText}>{task.due_date}</span>
      </Field>
      <Field label="Sprint" tokens={tokens}>
        <span className={tokens.secondaryText}>{task.sprint_id}</span>
      </Field>
      <Field label="Story pts" tokens={tokens}>
        <span className={tokens.secondaryText}>{task.story_points ?? '—'}</span>
      </Field>
      <Field label="Depends on" tokens={tokens}>
        {depends.length === 0 ? (
          <span className={`text-[11px] font-mono ${tokens.mutedText}`}>None</span>
        ) : (
          <span className="flex flex-wrap gap-1.5">
            {depends.map(dep => (
              <EntityLink key={dep} kind="task" id={dep} onSelectTask={onOpenTask} />
            ))}
          </span>
        )}
      </Field>
    </Section>
  );
}

function SectionEcign({
  task,
  onOpenForm,
  tokens,
}: {
  task: EcignSubmissionTask;
  onOpenForm?: (formId: string) => void;
  tokens: PanelTokens;
}): ReactElement {
  const instances = useFormInstances();
  const packets = task.packets && task.packets.length > 0
    ? task.packets
    : task.packet
      ? [task.packet]
      : [];
  const formIds = task.form_refs ?? task.form_ids ?? (task.form_id ? [task.form_id] : []);
  const generatedInstanceIds = task.generated_form_instance_ids ?? [];
  const primaryStatusLabel = ECIGN_PACKET_STATUS_LABEL[task.packet_status];

  const handleOpen = (fid: string) => {
    if (onOpenForm) { onOpenForm(fid); return; }
    if (typeof window !== 'undefined') {
      window.location.assign(`/forms/${encodeURIComponent(fid)}`);
    }
  };

  return (
    <Section icon={<FileText size={11} />} title="eCIgn" tokens={tokens}>
      <Field label="Packet" tokens={tokens}>
        <span className={tokens.secondaryText}>{primaryStatusLabel}</span>
      </Field>
      {task.step_id && (
        <Field label="Step ID" tokens={tokens}>
          <code className={`text-[11px] ${tokens.mutedText}`}>{task.step_id}</code>
        </Field>
      )}
      <Field label="Forms" tokens={tokens}>
        {formIds.length === 0 ? (
          <span className={tokens.mutedText}>—</span>
        ) : (
          <ul className="flex flex-col gap-1">
            {formIds.map((fid, i) => {
              const pkt = packets[i];
              const label = pkt ? ECIGN_PACKET_STATUS_LABEL[pkt.packet_status] : '—';
              return (
                <li key={fid} className="flex items-center gap-2">
                  <EntityLink kind="form" id={fid} />
                  <button type="button" onClick={() => handleOpen(fid)} className={`hover:opacity-85 ${tokens.mutedText}`} title="Open form">
                    <ExternalLink size={10} />
                  </button>
                  <span className={`text-[10px] ${tokens.mutedText}`}>· {label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Field>
      <Field label="Instances" tokens={tokens}>
        {generatedInstanceIds.length === 0 ? (
          <span className={tokens.mutedText}>—</span>
        ) : (
          <ul className="flex flex-col gap-1">
            {generatedInstanceIds.map(iid => {
              const instance = instances[iid];
              const sourceFormId = instance?.source_form_id ?? iid.split('--').slice(1).join('--');
              return (
                <li key={iid} className="flex items-center gap-2">
                  <EntityLink
                    kind="form_instance"
                    id={iid}
                    label={sourceFormId || iid}
                    subLabel={`(${iid})`}
                    formContext={{
                      eventId: task.event_id,
                      workflowId: task.workflow_id,
                      instanceId: iid,
                      sourceFormId,
                    }}
                  />
                  <span className={`text-[10px] ${tokens.mutedText}`}>· {instance?.status ?? 'not_started'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Field>
      {task.blocker_reason && (
        <Field label="Blocker" tokens={tokens}>
          <span className="text-pink-300/85">{task.blocker_reason}</span>
        </Field>
      )}
    </Section>
  );
}

function SectionEvidence({ task, tokens }: { task: EcignSubmissionTask; tokens: PanelTokens }): ReactElement {
  const evidence = task.packet?.evidence;
  const instances = useFormInstances();
  const generatedInstanceIds = task.generated_form_instance_ids ?? [];
  const fallbackReady = generatedInstanceIds
    .map(iid => instances[iid])
    .filter(Boolean)
    .some(inst => {
      const s = String(inst?.status ?? '').toLowerCase();
      return s === 'complete' || s === 'completed' || s === 'submitted' || s === 'signed';
    });
  return (
    <Section icon={<ShieldCheck size={11} />} title="Evidence" tokens={tokens}>
      {!evidence ? (
        <>
          <p className={`text-[11px] ${tokens.mutedText}`}>
            {fallbackReady
              ? 'Evidence is pending persistence. Form completion is captured and will materialize as packet evidence in the event record.'
              : 'No evidence generated yet.'}
          </p>
          {fallbackReady && (
            <div className="text-[11px]" style={{ color: 'var(--ci-info-fg)' }}>
              Linked form instances are complete; audit linkage is visible in the Event Record tab.
            </div>
          )}
        </>
      ) : (
        <>
          <Field label="Status" tokens={tokens}>
            <span className={tokens.secondaryText}>{evidence.status}</span>
          </Field>
          <Field label="Evidence ID" tokens={tokens}>
            <code className={`text-[11px] ${tokens.mutedText}`}>{evidence.evidence_id}</code>
          </Field>
          {evidence.s3_key && (
            <Field label="Location" tokens={tokens}>
              <code className={`text-[11px] ${tokens.mutedText}`}>
                {evidence.s3_bucket}/{evidence.s3_key}
              </code>
            </Field>
          )}
          {evidence.sha256 && (
            <Field label="SHA-256" tokens={tokens}>
              <code className={`text-[11px] ${tokens.mutedText}`}>
                {evidence.sha256.slice(0, 16)}…
              </code>
            </Field>
          )}
          <Field label="Created" tokens={tokens}>
            <span className={`text-[11px] ${tokens.mutedText}`}>{evidence.created_at}</span>
          </Field>
        </>
      )}
    </Section>
  );
}

function SectionAudit({ taskId, tokens }: { taskId: string; tokens: PanelTokens }): ReactElement {
  const audit = usePmOverlayStore(s => s.audit);
  const rows = useMemo(
    () => audit.filter(a => a.task_id === taskId).slice(-25).reverse(),
    [audit, taskId],
  );
  return (
    <Section icon={<History size={11} />} title="Audit trail" tokens={tokens}>
      {rows.length === 0 ? (
        <p className={`text-[11px] ${tokens.mutedText}`}>No PM overlay actions recorded.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map(r => (
            <li key={r.id} className={`text-[11px] ${tokens.secondaryText}`}>
              <span className={`font-mono ${tokens.mutedText}`}>{r.ts}</span>{' '}
              <span className={tokens.primaryText}>{r.action}</span>
              <span className={tokens.mutedText}> · {r.actor_user_id}</span>
              {r.reason ? <span className={tokens.mutedText}> — {r.reason}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export default TaskDetailRightPanel;
