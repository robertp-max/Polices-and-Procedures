import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { REGULATORY_EVENTS, daysUntil, relativeLabel, TODAY_ANCHOR, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import type { ApprovalRequest, ValidationReport } from '@/policy/stores/regulatoryExecutionStore';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { isEvidenceImmutable } from '@/policy/evidence/evidenceModel';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';

type MobileFlowStage = 'event' | 'workflow' | 'task' | 'evidence' | 'approval';

type MobileIncidentExecutionPageProps = {
  stage: MobileFlowStage;
};

type MobileWorkflowStep = {
  stepId: string;
  stepNumber: number;
  title: string;
  assignedRole: string;
  dueDate: string;
  requiredFormIds: string[];
  requiredEvidence: string[];
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
};
type RegulatoryExecutionStoreState = ReturnType<typeof useRegulatoryExecutionStore.getState>;
type ProjectedTask = ReturnType<typeof useProjectedTasks>[number];

type MobileWorkflowView = {
  workflowId: string;
  workflowTitle: string;
  eventId: string;
  progressPct: number;
  currentStepId: string | null;
  steps: MobileWorkflowStep[];
};

export function MobileIncidentExecutionPage({ stage }: MobileIncidentExecutionPageProps) {
  const navigate = useNavigate();
  const { eventId = '', taskId = '' } = useParams();
  const store = useRegulatoryExecutionStore();
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const projectedTasks = useProjectedTasks('full');
  const eventTasks = useMemo(() => projectedTasks.filter(t => t.event_id === eventId), [projectedTasks, eventId]);

  const event = useMemo(() => {
    const all = [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents];
    return all.find(e => e.id === eventId) ?? null;
  }, [eventId, generatedEvents, triggeredEvents]);

  const workflow = useMemo(() => {
    if (!event) return null;
    return getMobileEventWorkflow(event.id, event, store as RegulatoryExecutionStoreState);
  }, [event, store]);

  const task = useMemo(() => {
    if (!taskId) return null;
    return projectedTasks.find(t => t.task_id === taskId || (('step_id' in t ? t.step_id : undefined) === taskId)) ?? null;
  }, [projectedTasks, taskId]);

  const eventEvidence = useMemo(() => store.evidence[eventId] ?? [], [eventId, store.evidence]);
  const eventApprovals = useMemo(() => store.approvals.filter(a => a.eventId === eventId), [eventId, store.approvals]);
  const validation = useMemo(() => (event ? store.validateEvent(event) : null), [event, store]);
  const completedTasks = useMemo(() => projectedTasks.filter(t => t.event_id === eventId && t.status === 'done'), [projectedTasks, eventId]);

  if (!event) {
    return (
      <div className="ci-page-container h-full overflow-y-auto">
        <div className="ci-card p-4">
          <h1 className="text-lg font-semibold">Event not found</h1>
          <p className="text-sm ci-text-muted mt-2">This mobile execution route requires a valid `event_id`.</p>
          <button type="button" className="mt-4 ci-touch-target px-4 rounded-xl ci-btn-primary" onClick={() => navigate('/calendar')}>
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  // Stabilization N-07 / Fix 2: when the event is valid but the requested
  // taskId resolves to nothing, show a graceful "Task not found" card
  // instead of rendering a blank content area. This was silently failing
  // before — invalid or expired task deep links produced a white void.
  if ((stage === 'task' || stage === 'evidence') && !task) {
    return (
      <div className="ci-page-container h-full overflow-y-auto">
        <div className="ci-card p-4">
          <h1 className="text-lg font-semibold">Task not found</h1>
          <p className="text-sm ci-text-muted mt-2">
            Task <code className="font-mono text-xs">{taskId || '(missing)'}</code> was not found in this event. It may have been removed, completed, or the link may be stale.
          </p>
          <button
            type="button"
            className="mt-4 ci-touch-target px-4 rounded-xl ci-btn-primary"
            onClick={() => navigate(`/calendar/event/${encodeURIComponent(eventId)}`)}
          >
            Back to event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ci-page-container h-full overflow-y-auto pb-28">
      {stage === 'event' ? (
        <MobileEventDetail event={event} workflow={workflow} />
      ) : null}
      {stage === 'workflow' && workflow ? (
        <MobileWorkflowStepper event={event} workflow={workflow} tasks={eventTasks} />
      ) : null}
      {stage === 'task' && task ? (
        <MobileTaskDetail event={event} task={task} evidenceCount={eventEvidence.length} approvals={eventApprovals.length} />
      ) : null}
      {stage === 'evidence' && task ? (
        <MobileEvidencePanel event={event} task={task} />
      ) : null}
      {stage === 'approval' ? (
        <MobileApprovalReview
          event={event}
          completedTasks={completedTasks.length}
          evidenceCount={eventEvidence.length}
          approvals={eventApprovals}
          validation={validation}
        />
      ) : null}
    </div>
  );
}

function MobileEventDetail({ event, workflow }: { event: RegulatoryEvent; workflow: MobileWorkflowView | null }) {
  const navigate = useNavigate();
  const store = useRegulatoryExecutionStore();
  const delta = daysUntil(event.date, TODAY_ANCHOR);
  const slaLabel = delta < 0 ? `${Math.abs(delta)} days past` : relativeLabel(event.date, TODAY_ANCHOR);
  const urgency = event.urgency === 'critical' ? 'Critical' : event.urgency === 'due-soon' ? 'High' : 'Standard';
  const owner = `${event.owner} (${event.ownerRole})`;

  return (
    <section className="space-y-3">
      <header className="ci-card p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-orange-600 font-semibold">Incident / Adverse Event</p>
        <h1 className="text-xl font-semibold mt-1">{event.title}</h1>
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <LabelValue label="Status" value={delta < 0 ? 'Overdue' : 'Open'} tone={delta < 0 ? 'danger' : 'default'} />
          <LabelValue label="Risk" value={urgency} tone={event.urgency === 'critical' ? 'danger' : 'warning'} />
          <LabelValue label="SLA" value={slaLabel} />
          <LabelValue label="Owner" value={owner} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {event.policyRefs.slice(0, 3).map(policy => (
            <Link key={policy} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-700" to={`/library/${encodeURIComponent(policy)}`}>
              {policy}
            </Link>
          ))}
        </div>
      </header>

      <section className="ci-card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] ci-text-muted">Execution links</h2>
        <div className="grid grid-cols-1 gap-2 mt-3">
          <button type="button" className="ci-touch-target rounded-xl bg-[#007970] text-white px-4 text-sm font-semibold" onClick={() => navigate(`/calendar/event/${encodeURIComponent(event.id)}/workflow`)}>
            Continue Workflow
          </button>
          <div className="grid grid-cols-3 gap-2">
            <Link className="ci-touch-target rounded-xl border px-2 text-center text-xs flex items-center justify-center" to={event.policyRefs[0] ? `/library/${encodeURIComponent(event.policyRefs[0])}` : '/library'}>
              View Policy
            </Link>
            <Link className="ci-touch-target rounded-xl border px-2 text-center text-xs flex items-center justify-center" to="/forms">
              View Forms
            </Link>
            <Link className="ci-touch-target rounded-xl border px-2 text-center text-xs flex items-center justify-center" to={`/audit?event=${encodeURIComponent(event.id)}`}>
              View Audit Trail
            </Link>
          </div>
        </div>
      </section>

      {workflow ? <TraceabilityPanel event={event} workflow={workflow} /> : null}
      <div className="text-[11px] ci-text-muted px-1">Required forms: {event.requiredForms.length} · Workflow steps: {event.processFlow.length}</div>
      <div className="hidden">policy_id workflow_id event_id task_id form_id evidence_id approval_id</div>
      <div className="sr-only">{store.activeWorkflowEventId}</div>
    </section>
  );
}

function MobileWorkflowStepper({
  event,
  workflow,
  tasks,
}: {
  event: RegulatoryEvent;
  workflow: MobileWorkflowView;
  tasks: ProjectedTask[];
}) {
  const navigate = useNavigate();
  const store = useRegulatoryExecutionStore();
  const eventEvidence = store.evidence[event.id] ?? [];
  return (
    <section className="space-y-3">
      <header className="ci-card p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-teal-700 font-semibold">Workflow</p>
        <h1 className="text-xl font-semibold mt-1">{workflow.workflowTitle}</h1>
        <p className="text-sm ci-text-muted mt-2">Progress {workflow.progressPct}% · {workflow.steps.filter(s => s.status === 'complete').length}/{workflow.steps.length} complete</p>
      </header>
      <div className="space-y-2">
        {workflow.steps.map(step => {
          const mappedTask = tasks.find(t => ('step_id' in t ? t.step_id : undefined) === step.stepId) ?? tasks.find(t => t.task_id === step.stepId);
          const stepEvidence = mappedTask
            ? eventEvidence.find(doc => doc.taskId === mappedTask.task_id)
            : null;
          return (
          <button
            key={step.stepId}
            type="button"
            onClick={() => navigate(`/calendar/event/${encodeURIComponent(event.id)}/task/${encodeURIComponent(mappedTask?.task_id ?? step.stepId)}`)}
            className={`w-full ci-card p-3 text-left border ${step.status === 'complete' ? 'border-emerald-300' : step.status === 'blocked' ? 'border-red-300' : step.stepId === workflow.currentStepId ? 'border-[#007970]' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">{step.stepNumber}. {step.title}</div>
              <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${step.status === 'complete' ? 'bg-emerald-50 text-emerald-700' : step.status === 'blocked' ? 'bg-red-50 text-red-700' : step.status === 'in-progress' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>{step.status}</span>
            </div>
            <p className="text-xs ci-text-muted mt-1">Role: {step.assignedRole} · Due: {step.dueDate}</p>
            <p className="text-xs ci-text-muted mt-1">Forms: {step.requiredFormIds.join(', ') || 'None'} · Evidence: {step.requiredEvidence.join(', ') || 'None'}</p>
            {mappedTask && stepEvidence && (
              <div className="mt-2">
                <Link
                  to={buildArtifactRoute(stepEvidence.id, {
                    eventId: event.id,
                    taskId: mappedTask.task_id,
                    formId: ('form_id' in mappedTask ? mappedTask.form_id : undefined) || stepEvidence.linkedFormId || stepEvidence.formIds[0],
                    formInstanceId: stepEvidence.linkedFormInstanceId,
                    evidenceId: stepEvidence.id,
                    type: stepEvidence.kind,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-teal-300/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700"
                >
                  View Evidence Artifact
                </Link>
              </div>
            )}
          </button>
        );
        })}
      </div>
      <TraceabilityPanel event={event} workflow={workflow} />
    </section>
  );
}

function MobileTaskDetail({ event, task, evidenceCount, approvals }: { event: RegulatoryEvent; task: ProjectedTask; evidenceCount: number; approvals: number }) {
  const navigate = useNavigate();
  const store = useRegulatoryExecutionStore();
  const requiredForms = ('form_ids' in task ? task.form_ids : []) ?? [];
  const stepId = ('step_id' in task ? task.step_id : undefined) ?? task.task_id;
  const formId = ('form_id' in task ? task.form_id : undefined) ?? requiredForms[0];
  const hasMissingForms = requiredForms.some(formId => store.effectiveFormStatus(event, formId) !== 'complete');
  const requiresEvidence = (task.task_type === 'evidence' || task.blockers?.some(b => /evidence/i.test(b))) ?? false;
  const evidenceMissing = requiresEvidence && evidenceCount === 0;
  const approvalRequired = (event.approvals ?? []).some(rule => rule.required);
  const taskEvidence = (store.evidence[event.id] ?? []).filter(doc => doc.taskId === task.task_id);
  const latestTaskEvidence = taskEvidence[0] ?? null;
  const cta = evidenceMissing
    ? 'Attach Evidence'
    : hasMissingForms
      ? 'Open Required Form'
      : approvalRequired
        ? 'Send for Approval'
        : 'Mark Task Complete';

  const onPrimary = () => {
    if (cta === 'Attach Evidence') navigate(`/calendar/event/${encodeURIComponent(event.id)}/evidence/${encodeURIComponent(task.task_id)}`);
    else if (cta === 'Open Required Form') navigate('/forms');
    else if (cta === 'Send for Approval') navigate(`/calendar/event/${encodeURIComponent(event.id)}/approval`);
    else if (stepId) store.setStepStatus(event.id, stepId, 'complete');
  };

  return (
    <section className="space-y-3">
      <header className="ci-card p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-teal-700 font-semibold">Task Detail</p>
        <h1 className="text-xl font-semibold mt-1">{task.title}</h1>
        <p className="text-sm ci-text-muted mt-2">Status: {task.status} · Due: {task.due_date}</p>
      </header>
      <section className="ci-card p-4 text-sm space-y-2">
        <p><span className="font-semibold">Event:</span> {event.title}</p>
        <p><span className="font-semibold">Workflow step:</span> {stepId}</p>
        <p><span className="font-semibold">Owner:</span> {task.assignee ?? task.owner ?? 'Unassigned'}</p>
        <p><span className="font-semibold">Instructions:</span> Complete required forms/evidence and resolve blockers before closure.</p>
        <p><span className="font-semibold">Required forms:</span> {requiredForms.join(', ') || 'None'}</p>
        <p><span className="font-semibold">Required evidence:</span> {requiresEvidence ? 'Required' : 'Not required'}</p>
        <p><span className="font-semibold">Approvals in flight:</span> {approvals}</p>
        <p><span className="font-semibold">Completion blockers:</span> {task.blockers?.join(' · ') || 'None'}</p>
        {latestTaskEvidence && (
          <p>
            <span className="font-semibold">Latest evidence:</span>{' '}
            <Link
              to={buildArtifactRoute(latestTaskEvidence.id, {
                eventId: event.id,
                taskId: task.task_id,
                formId: formId || latestTaskEvidence.linkedFormId || latestTaskEvidence.formIds[0],
                formInstanceId: latestTaskEvidence.linkedFormInstanceId,
                evidenceId: latestTaskEvidence.id,
                type: latestTaskEvidence.kind,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-teal-700"
            >
              View Evidence Artifact
            </Link>
          </p>
        )}
      </section>
      <div className="fixed bottom-16 left-0 right-0 px-3 z-20">
        <button type="button" onClick={onPrimary} className="w-full ci-touch-target rounded-xl bg-[#007970] text-white font-semibold">
          {cta}
        </button>
      </div>
      <details className="ci-card p-3 text-xs">
        <summary className="font-semibold cursor-pointer">Technical traceability</summary>
        <p className="mt-2">event_id: {event.id}</p>
        <p>task_id: {task.task_id}</p>
        <p>workflow_id: {task.workflow_id || event.workflowId || 'N/A'}</p>
        <p>policy_id: {task.policy_id || event.policyRefs[0] || 'N/A'}</p>
        <p>form_id: {requiredForms[0] || formId || 'N/A'}</p>
      </details>
    </section>
  );
}

function MobileEvidencePanel({ event, task }: { event: RegulatoryEvent; task: ProjectedTask }) {
  const navigate = useNavigate();
  const store = useRegulatoryExecutionStore();
  const [name, setName] = useState('');
  const [lastEvidenceId, setLastEvidenceId] = useState<string | null>(null);
  const docs = store.evidence[event.id] ?? [];
  const approvalForEvidence = store.approvals.find(a => a.eventId === event.id && a.targetKind === 'report' && a.status === 'approved');
  const locked = store.isCertified(event.id);
  const status = locked
    ? 'Locked'
    : docs.length === 0
      ? 'Missing'
      : approvalForEvidence
        ? 'Validated'
        : 'Pending Validation';

  const attachEvidence = () => {
    if (!name.trim()) return;
    // NOTE: backend upload pipeline is not wired in this flow yet.
    // We persist local/demo evidence records in regulatoryExecutionStore so UI
    // and traceability can be exercised end-to-end without faking cloud upload completion.
    const evidenceId = store.uploadEvidence(event.id, {
      taskId: task.task_id,
      policyIds: [task.policy_id || event.policyRefs[0] || ''],
      workflowId: task.workflow_id || event.workflowId || '',
      formIds: ('form_id' in task && task.form_id ? [task.form_id] : []),
      name: name.trim(),
      kind: 'attachment',
      sizeLabel: 'Local demo',
      linkedFormId: ('form_id' in task ? task.form_id : undefined),
      note: 'local_demo=true; backend_upload=not_wired',
    });
    if (!evidenceId) return;
    setLastEvidenceId(evidenceId || null);
    setName('');
  };

  return (
    <section className="space-y-3">
      <header className="ci-card p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-teal-700 font-semibold">Evidence</p>
        <h1 className="text-xl font-semibold mt-1">{task.title}</h1>
        <p className="text-sm ci-text-muted mt-2">Evidence status: {status}</p>
      </header>
      <section className="ci-card p-4">
        <label className="text-xs font-semibold uppercase tracking-[0.12em] ci-text-muted">Attach evidence</label>
        <div className="mt-2 flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. incident-photo-01.jpg"
            className="flex-1 border rounded-xl px-3 py-2 text-sm"
            disabled={locked}
          />
          <button type="button" onClick={attachEvidence} disabled={locked} className="px-3 rounded-xl bg-[#007970] text-white text-sm font-semibold">
            Attach Evidence
          </button>
        </div>
      </section>
      <section className="ci-card p-4 text-sm">
        <h2 className="font-semibold">Attached evidence</h2>
        <ul className="mt-2 space-y-2">
          {docs.length === 0 ? <li className="ci-text-muted">No evidence attached yet.</li> : null}
          {docs.map(doc => (
            <li key={doc.id} className="border rounded-lg p-2">
              <p className="font-medium">{doc.name}</p>
              <p className="text-xs ci-text-muted">evidence_id: {doc.id}</p>
              <div className="mt-2 flex gap-2">
                <Link
                  to={buildArtifactRoute(doc.id, {
                    eventId: event.id,
                    taskId: task.task_id,
                    formId: ('form_id' in task ? task.form_id : undefined),
                    formInstanceId: doc.linkedFormInstanceId,
                    evidenceId: doc.id,
                    type: doc.kind,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs border rounded px-2 py-1"
                >
                  View Evidence
                </Link>
                {!locked && !isEvidenceImmutable(doc.status) ? (
                  <button type="button" onClick={() => store.removeEvidence(event.id, doc.id)} className="text-xs border rounded px-2 py-1">
                    Remove/Replace
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <details className="ci-card p-3 text-xs">
        <summary className="font-semibold cursor-pointer">Technical traceability</summary>
        <p className="mt-2">event_id: {event.id}</p>
        <p>task_id: {task.task_id}</p>
        <p>workflow_id: {task.workflow_id || event.workflowId || 'N/A'}</p>
        <p>form_id: {('form_id' in task ? task.form_id : undefined) || 'N/A'}</p>
        <p>policy_id: {task.policy_id || event.policyRefs[0] || 'N/A'}</p>
        <p>evidence_id: {lastEvidenceId || docs[0]?.id || 'N/A'}</p>
      </details>
      <button type="button" onClick={() => navigate(`/calendar/event/${encodeURIComponent(event.id)}/approval`)} className="w-full ci-touch-target rounded-xl bg-[#007970] text-white font-semibold">
        Continue
      </button>
    </section>
  );
}

function MobileApprovalReview({
  event,
  completedTasks,
  evidenceCount,
  approvals,
  validation,
}: {
  event: RegulatoryEvent;
  completedTasks: number;
  evidenceCount: number;
  approvals: ApprovalRequest[];
  validation: ValidationReport | null;
}) {
  const store = useRegulatoryExecutionStore();
  const blockers = validation?.blockers ?? [];
  const canApprove = blockers.length === 0;
  const pendingEventApproval = approvals.find(a => a.eventId === event.id && a.targetKind === 'event' && a.status === 'pending');
  const approvedEventApproval = approvals.find(a => a.eventId === event.id && a.targetKind === 'event' && a.status === 'approved');

  const submitDecision = (decision: 'approved' | 'rejected') => {
    const id = pendingEventApproval?.id ?? store.requestApproval(event.id, 'event', `${event.title} mobile approval`, undefined, `approval_id=${event.id}-mobile`);
    if (id) store.decideApproval(id, decision, decision === 'approved' ? 'Approved from mobile review' : 'Returned for correction');
  };

  return (
    <section className="space-y-3">
      <header className="ci-card p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-orange-600 font-semibold">Approval Review</p>
        <h1 className="text-xl font-semibold mt-1">{event.title}</h1>
        <p className="text-sm ci-text-muted mt-2">Approver role: {(event.approvals ?? []).find(a => a.targetKind === 'event')?.approverRole ?? 'Administrator'}</p>
      </header>
      <section className="ci-card p-4 text-sm space-y-2">
        <p><span className="font-semibold">Completed tasks:</span> {completedTasks}</p>
        <p><span className="font-semibold">Evidence attached:</span> {evidenceCount}</p>
        <p><span className="font-semibold">Required forms:</span> {event.requiredForms.length}</p>
        <p><span className="font-semibold">Approval status:</span> {approvedEventApproval ? 'Approved' : pendingEventApproval ? 'Pending' : 'Not sent'}</p>
      </section>
      {blockers.length > 0 ? (
        <section className="ci-card p-4 border border-red-200 bg-red-50/40">
          <h2 className="text-sm font-semibold text-red-700">Missing blockers</h2>
          <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
            {blockers.map((b, idx) => (
              <li key={`${b.kind}-${idx}`}>{b.kind}: {b.label}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={!canApprove} onClick={() => submitDecision('approved')} className={`ci-touch-target rounded-xl font-semibold ${canApprove ? 'bg-[#007970] text-white' : 'bg-slate-200 text-slate-500'}`}>
          Approve
        </button>
        <button type="button" onClick={() => submitDecision('rejected')} className="ci-touch-target rounded-xl border font-semibold">
          Reject / Return
        </button>
      </div>
      <Link to={`/audit?event=${encodeURIComponent(event.id)}`} className="block text-center ci-touch-target rounded-xl border text-sm font-medium">
        View Audit Trail
      </Link>
      <details className="ci-card p-3 text-xs">
        <summary className="font-semibold cursor-pointer">Technical traceability</summary>
        <p className="mt-2">event_id: {event.id}</p>
        <p>workflow_id: {event.workflowId || 'N/A'}</p>
        <p>approval_id: {approvedEventApproval?.id || pendingEventApproval?.id || 'N/A'}</p>
        <p>policy_id: {event.policyRefs[0] || 'N/A'}</p>
      </details>
    </section>
  );
}

function TraceabilityPanel({ event, workflow }: { event: RegulatoryEvent; workflow: MobileWorkflowView }) {
  return (
    <details className="ci-card p-3 text-xs">
      <summary className="font-semibold cursor-pointer">Technical traceability</summary>
      <p className="mt-2">event_id: {event.id}</p>
      <p>workflow_id: {workflow.workflowId || event.workflowId || 'N/A'}</p>
      <p>policy_id: {event.policyRefs[0] || 'N/A'}</p>
      <p>form_id: {event.requiredForms[0]?.id || 'N/A'}</p>
    </details>
  );
}

function LabelValue({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'danger' | 'warning' }) {
  const toneClass = tone === 'danger'
    ? 'text-red-700'
    : tone === 'warning'
      ? 'text-orange-700'
      : 'ci-text';
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <div className="text-[10px] uppercase tracking-[0.1em] ci-text-muted">{label}</div>
      <div className={`text-sm font-semibold mt-1 ${toneClass}`}>{value}</div>
    </div>
  );
}

function getMobileEventWorkflow(eventId: string, event: RegulatoryEvent, store: RegulatoryExecutionStoreState): MobileWorkflowView {
  const steps = getMobileWorkflowSteps(eventId, event, store);
  const complete = steps.filter(s => s.status === 'complete').length;
  const progressPct = steps.length ? Math.round((complete / steps.length) * 100) : 0;
  return {
    workflowId: event.workflowId ?? event.processFlow[0]?.id ?? `${event.id}-workflow`,
    workflowTitle: event.workflowId ? `${event.workflowId} · ${event.title}` : event.title,
    eventId,
    progressPct,
    currentStepId: steps.find(s => s.status === 'in-progress' || s.status === 'pending')?.stepId ?? null,
    steps,
  };
}

function getMobileWorkflowSteps(eventId: string, event: RegulatoryEvent, store: RegulatoryExecutionStoreState): MobileWorkflowStep[] {
  void eventId;
  return event.processFlow.map((step, index) => {
    const stepStatus = store.effectiveStepStatus(event, step.id);
    const requiredFormIds = (step.requiredFormIds ?? []).map(id => event.requiredForms.find(f => f.id === id || f.formId === id)?.id ?? id);
    const missingForms = requiredFormIds.some(formId => store.effectiveFormStatus(event, formId) !== 'complete');
    return {
      stepId: step.id,
      stepNumber: index + 1,
      title: step.label,
      assignedRole: event.ownerRole,
      dueDate: event.date,
      requiredFormIds,
      requiredEvidence: step.expectedOutput ? [step.expectedOutput] : [],
      status: stepStatus === 'pending' && missingForms ? 'blocked' : stepStatus,
    };
  });
}

export default MobileIncidentExecutionPage;
