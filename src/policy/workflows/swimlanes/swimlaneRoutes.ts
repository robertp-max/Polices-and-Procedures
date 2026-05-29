import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

export function buildWorkflowSwimlaneRoute(workflowId: string, params: { eventId?: string; taskId?: string } = {}): string {
  const query = new URLSearchParams();
  if (params.eventId) query.set('eventId', params.eventId);
  if (params.taskId) query.set('taskId', params.taskId);
  const suffix = query.toString();
  const path = `/workflows/${encodeURIComponent(workflowId)}-swimlane`;
  return `${path}${suffix ? `?${suffix}` : ''}`;
}

export function buildEventSwimlaneRoute(eventId: string, params: { workflowId?: string; taskId?: string } = {}): string {
  const query = new URLSearchParams();
  if (params.workflowId) query.set('workflowId', params.workflowId);
  if (params.taskId) query.set('taskId', params.taskId);
  const suffix = query.toString();
  return `/events/${encodeURIComponent(eventId)}/swimlane${suffix ? `?${suffix}` : ''}`;
}

export function buildSwimlaneRouteForEvent(event: RegulatoryEvent, taskId?: string): string {
  return buildEventSwimlaneRoute(event.id, {
    workflowId: event.workflowId ?? undefined,
    taskId,
  });
}
