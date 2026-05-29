import { REGULATORY_EVENTS, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { buildSwimlaneFromEvent } from './buildSwimlaneFromEvent';
import { buildSwimlaneFromWorkflow } from './buildSwimlaneFromWorkflow';
import { buildFallbackSwimlane } from './buildFallbackSwimlane';
import { buildEventSwimlaneRoute, buildWorkflowSwimlaneRoute } from './swimlaneRoutes';
import type { SwimlaneBuildContext, SwimlaneModel } from './types';

export type SwimlaneRegistryState = 'custom' | 'generated' | 'disabled' | 'unavailable';

export interface SwimlaneRegistryEntry {
  workflowId?: string;
  eventId?: string;
  state: SwimlaneRegistryState;
  route: string;
  build: (context?: SwimlaneBuildContext) => SwimlaneModel | null;
}

const CUSTOM_WORKFLOW_IDS = new Set(['QA-WF-03']);

export function hasCustomSwimlane(workflowId?: string | null): boolean {
  return Boolean(workflowId && CUSTOM_WORKFLOW_IDS.has(workflowId));
}

export function getEventById(eventId?: string | null): RegulatoryEvent | undefined {
  if (!eventId) return undefined;
  return REGULATORY_EVENTS.find(event => event.id === eventId);
}

export function getSwimlaneRegistryEntry(input: { workflowId?: string | null; eventId?: string | null; taskId?: string | null }): SwimlaneRegistryEntry {
  const event = getEventById(input.eventId);
  const workflowId = input.workflowId ?? event?.workflowId;
  const workflow = workflowId ? WORKFLOWS[workflowId] : undefined;
  const eventId = event?.id ?? input.eventId ?? undefined;

  if (workflowId && hasCustomSwimlane(workflowId)) {
    return {
      workflowId,
      eventId,
      state: 'custom',
      route: event
        ? buildEventSwimlaneRoute(event.id, { workflowId, taskId: input.taskId ?? undefined })
        : buildWorkflowSwimlaneRoute(workflowId, { eventId, taskId: input.taskId ?? undefined }),
      build: context => event
        ? buildSwimlaneFromEvent(event, { eventId: event.id, taskId: context?.taskId ?? input.taskId ?? undefined })
        : workflow
          ? buildSwimlaneFromWorkflow(workflow, { eventId, taskId: context?.taskId ?? input.taskId ?? undefined })
          : null,
    };
  }

  if (event) {
    return {
      workflowId,
      eventId: event.id,
      state: 'generated',
      route: buildEventSwimlaneRoute(event.id, { workflowId: workflowId ?? undefined, taskId: input.taskId ?? undefined }),
      build: context => buildSwimlaneFromEvent(event, { eventId: event.id, taskId: context?.taskId ?? input.taskId ?? undefined }),
    };
  }

  if (workflow) {
    return {
      workflowId,
      state: 'generated',
      route: buildWorkflowSwimlaneRoute(workflowId!, { eventId, taskId: input.taskId ?? undefined }),
      build: context => buildSwimlaneFromWorkflow(workflow, { eventId, taskId: context?.taskId ?? input.taskId ?? undefined }),
    };
  }

  return {
    workflowId: workflowId ?? undefined,
    eventId: input.eventId ?? undefined,
    state: 'generated',
    route: input.eventId ? buildEventSwimlaneRoute(input.eventId) : buildWorkflowSwimlaneRoute(workflowId ?? 'unknown'),
    build: () => buildFallbackSwimlane({
      workflowId: workflowId ?? undefined,
      eventId: input.eventId ?? undefined,
      taskId: input.taskId ?? undefined,
      reason: input.eventId
        ? `Event ID ${input.eventId} did not resolve in REGULATORY_EVENTS.`
        : `Workflow ID ${workflowId ?? 'unknown'} did not resolve in WORKFLOWS.`,
    }),
  };
}

export function buildRegisteredSwimlane(input: { workflowId?: string | null; eventId?: string | null; taskId?: string | null }): SwimlaneModel | null {
  return getSwimlaneRegistryEntry(input).build({ eventId: input.eventId ?? undefined, taskId: input.taskId ?? undefined });
}
