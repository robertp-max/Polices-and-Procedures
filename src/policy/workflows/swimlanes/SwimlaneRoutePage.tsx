import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { buildRegisteredSwimlane, getEventById, hasCustomSwimlane } from './swimlaneRegistry';
import { buildFallbackSwimlane } from './buildFallbackSwimlane';
import { SwimlaneExecutionMap } from './SwimlaneExecutionMap';
import { QAWorkflow03SwimlanePage } from '../components/QAWorkflow03SwimlanePage';

export function SwimlaneRoutePage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const rawWorkflowRouteId = params.workflowIdWithSuffix ?? params.workflowId;
  const workflowId = rawWorkflowRouteId?.replace(/-swimlane$/, '');
  const eventId = params.eventId ?? searchParams.get('eventId') ?? searchParams.get('event_id');
  const taskId = params.taskId ?? searchParams.get('taskId') ?? searchParams.get('task_id');
  const queryWorkflowId = searchParams.get('workflowId') ?? searchParams.get('workflow_id');
  const eventWorkflowId = getEventById(eventId)?.workflowId;
  const effectiveWorkflowId = workflowId ?? queryWorkflowId ?? eventWorkflowId;

  const model = useMemo(
    () => buildRegisteredSwimlane({ workflowId: effectiveWorkflowId, eventId, taskId }) ?? buildFallbackSwimlane({
      workflowId: effectiveWorkflowId ?? undefined,
      eventId: eventId ?? undefined,
      taskId: taskId ?? undefined,
      reason: 'Swimlane route did not resolve to a registered event or workflow. Fallback model rendered to prevent a blank page.',
    }),
    [effectiveWorkflowId, eventId, taskId],
  );
  const renderCustomQaWorkflow =
    hasCustomSwimlane(effectiveWorkflowId)
    && effectiveWorkflowId === 'QA-WF-03';

  if (renderCustomQaWorkflow) {
    return <QAWorkflow03SwimlanePage model={model} initialTaskId={taskId ?? undefined} />;
  }
  return <SwimlaneExecutionMap model={model} initialTaskId={taskId ?? undefined} />;
}
