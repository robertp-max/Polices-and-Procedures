import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck } from 'lucide-react';
import { useProjectedTaskById } from '@/policy/pm/taskProjection';
import { PM_TASK_STATUS_LABEL } from '@/policy/pm/ecignStatusMap';
import type { Task } from '@/policy/pm/types';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';
import { CiStatusBadge, EmptyState } from '@/policy/components/ui';

export interface V3TaskDetailPanelProps {
  taskId: string;
  onClose?: () => void;
}

const statusTone = {
  todo: 'neutral',
  in_progress: 'info',
  in_review: 'warning',
  blocked: 'danger',
  done: 'success',
} as const;

export function V3TaskDetailPanel({ taskId }: V3TaskDetailPanelProps): ReactElement {
  const task = useProjectedTaskById(taskId);

  if (!task) {
    return (
      <div className="h-full min-h-0 p-4">
        <EmptyState title="Task not found" description={`No projected task exists for ${taskId}.`} />
      </div>
    );
  }

  const status = task.status;
  const metadata = [
    ['Task', task.task_id],
    ['Event', task.event_title ?? task.event_id ?? '—'],
    ['Workflow', task.workflow_title ?? task.workflow_id ?? 'Unassigned'],
    ['Due', task.due_date ?? 'Unscheduled'],
    ['Owner', task.owner || task.assignee || getTaskAssignedUserId(task) || 'Unassigned'],
  ];

  return (
    <div data-task-id={task.task_id} className="h-full min-h-0 overflow-y-auto p-4 text-[var(--v3-text-primary)]">
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--v3-text-tertiary)]">{task.task_type}</p>
        <h2 className="mt-1 text-[20px] font-semibold leading-tight">{task.title}</h2>
        <div className="mt-3">
          <CiStatusBadge tone={statusTone[status]}>{PM_TASK_STATUS_LABEL[status]}</CiStatusBadge>
        </div>
      </div>

      <div className="space-y-5">
        <section className="space-y-2 text-[13px]">
          {metadata.map(([label, value]) => (
            <MetadataField key={label} label={label} value={value} />
          ))}
        </section>

        {task.description && (
          <section>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--v3-text-secondary)]">Instructions</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--v3-text-secondary)]">{task.description}</p>
          </section>
        )}

        <V3EvidencePanel task={task} />
      </div>
    </div>
  );
}

function getTaskAssignedUserId(task: Task): string | undefined {
  return 'assigned_user_id' in task ? task.assigned_user_id : undefined;
}

function getTaskEvidenceId(task: Task): string | undefined {
  return 'evidence_id' in task ? task.evidence_id : undefined;
}

function V3EvidencePanel({ task }: { task: Task }): ReactElement {
  const formRefs = task.form_refs ?? [];
  const evidenceId = getTaskEvidenceId(task);
  const hasEvidence = Boolean(evidenceId);

  return (
    <section>
      <div className="flex items-center gap-2">
        <ShieldCheck size={15} className="text-[var(--v3-teal-light)]" />
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--v3-text-secondary)]">Evidence</h3>
      </div>
      <div className="mt-3 space-y-2 text-[13px] text-[var(--v3-text-secondary)]">
        <MetadataField
          label="Forms"
          value={formRefs.length ? formRefs.join(', ') : 'No required form refs on this task.'}
        />
        {hasEvidence ? (
          <MetadataField
            label="Artifact"
            value={(
              <Link
                to={buildArtifactRoute(evidenceId!, {
                  eventId: task.event_id,
                  taskId: task.task_id,
                  formId: task.source_form_id,
                  type: 'evidence',
                })}
                className="inline-flex items-center gap-2 text-[var(--v3-teal-light)]"
              >
                <FileText size={14} /> Open evidence artifact
              </Link>
            )}
          />
        ) : (
          <MetadataField
            label="Artifact"
            value="No locked artifact is attached yet. Complete signing or upload evidence from the originating workflow."
          />
        )}
      </div>
    </section>
  );
}

function MetadataField({ label, value }: { label: string; value: ReactElement | string }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3">
      <span className="text-[var(--v3-text-tertiary)]">{label}:</span>
      <div className="break-words text-[var(--v3-text-primary)]">{value}</div>
    </div>
  );
}
