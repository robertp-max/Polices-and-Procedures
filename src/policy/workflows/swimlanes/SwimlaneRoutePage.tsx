import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { buildRegisteredSwimlane, getEventById, getLiveEventDisplay } from './swimlaneRegistry';
import { buildFallbackSwimlane } from './buildFallbackSwimlane';
import { SwimlaneExecutionMap } from './SwimlaneExecutionMap';
import { buildCesEventExecutionViewModel, buildReadonlyCesSwimlaneModel } from '@/policy/ces/eventExecution/buildCesEventExecutionViewModel';
import { CalendarApi, type CesCalendarHubMeta } from '@/policy/services/calendarApi';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';

export function SwimlaneRoutePage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const store = useRegulatoryExecutionStore();
  const rawWorkflowRouteId = params.workflowIdWithSuffix ?? params.workflowId;
  const workflowId = rawWorkflowRouteId?.replace(/-swimlane$/, '');
  const eventId = params.eventId ?? searchParams.get('eventId') ?? searchParams.get('event_id');
  const taskId = params.taskId ?? searchParams.get('taskId') ?? searchParams.get('task_id');
  const queryWorkflowId = searchParams.get('workflowId') ?? searchParams.get('workflow_id');
  const event = getEventById(eventId);
  const [hub, setHub] = useState<CesCalendarHubMeta | null>(null);

  useEffect(() => {
    if (!eventId) {
      setHub(null);
      return undefined;
    }
    let cancelled = false;
    CalendarApi.findByAppId(eventId)
      .then(res => {
        if (!cancelled) setHub(res._hub ?? null);
      })
      .catch(() => {
        if (!cancelled) setHub(null);
      });
    return () => { cancelled = true; };
  }, [eventId]);

  const eventWorkflowId = event?.workflowId ?? hub?.workflowId;
  const effectiveWorkflowId = workflowId ?? queryWorkflowId ?? eventWorkflowId;

  // Strictly use live data: REGULATORY_EVENTS + eventDisplayModel (no mock/fallback unless truly missing)
  const liveDisplay = getLiveEventDisplay(eventId);
  // liveDisplay?.canonicalPolicyRefs ensures policy display matches calendar design contract (Image #4 / design #4)
  // Swimlane always derives from live registry/builders for execution state

  const model = useMemo(
    () => {
      if (event) {
        const viewModel = buildCesEventExecutionViewModel({
          eventId: event.id,
          workflowId: effectiveWorkflowId,
          regulatoryEvent: event,
          hub,
          executionState: store,
        });
        return buildReadonlyCesSwimlaneModel(viewModel);
      }
      const registered = buildRegisteredSwimlane({ workflowId: effectiveWorkflowId, eventId, taskId });
      // prefer live registered (from REGULATORY + workflows.generated); only fallback on total miss
      return registered ?? buildFallbackSwimlane({
        workflowId: effectiveWorkflowId ?? undefined,
        eventId: eventId ?? undefined,
        taskId: taskId ?? undefined,
        reason: 'Swimlane route did not resolve to a registered event or workflow. Fallback model rendered to prevent a blank page.',
      });
    },
    [effectiveWorkflowId, event, eventId, hub, store, taskId],
  );

  // Wire live display (canonical refs) into model for exact match to calendar event display in design #4
  const finalModel = (liveDisplay && model)
    ? { ...model, policyRefs: liveDisplay.canonicalPolicyRefs.length ? liveDisplay.canonicalPolicyRefs : model.policyRefs, readOnly: true }
    : { ...model, readOnly: true };

  return <SwimlaneExecutionMap model={finalModel} initialTaskId={taskId ?? undefined} />;
}
