import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { buildRegisteredSwimlane } from './swimlaneRegistry';
import { SwimlaneExecutionMap } from './SwimlaneExecutionMap';

export function SwimlaneRoutePage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const rawWorkflowRouteId = params.workflowIdWithSuffix ?? params.workflowId;
  const workflowId = rawWorkflowRouteId?.replace(/-swimlane$/, '');
  const eventId = params.eventId ?? searchParams.get('eventId') ?? searchParams.get('event_id');
  const taskId = params.taskId ?? searchParams.get('taskId') ?? searchParams.get('task_id');
  const queryWorkflowId = searchParams.get('workflowId') ?? searchParams.get('workflow_id');

  const model = useMemo(
    () => buildRegisteredSwimlane({ workflowId: workflowId ?? queryWorkflowId, eventId, taskId }),
    [eventId, queryWorkflowId, taskId, workflowId],
  );

  return model ? <SwimlaneExecutionMap model={model} initialTaskId={taskId ?? undefined} /> : null;
}
