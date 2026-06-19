import { REGULATORY_EVENTS, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
// Live data source: canonical REGULATORY_EVENTS (post alignment from mandated/audit/multiYear) + store overlays.
// Never mock; events + swimlanes derive from this + autogenStore (generated/triggered live) + regulatoryExecutionStore for execution state.
import { getEventDisplayModel } from '@/policy/data/eventDisplayModel';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { buildSwimlaneFromEvent } from './buildSwimlaneFromEvent';
import { buildSwimlaneFromWorkflow } from './buildSwimlaneFromWorkflow';
import { buildFallbackSwimlane } from './buildFallbackSwimlane';
import { buildEventSwimlaneRoute, buildWorkflowSwimlaneRoute } from './swimlaneRoutes';
import type { SwimlaneBuildContext, SwimlaneModel } from './types';

export type SwimlaneRegistryState = 'generated' | 'disabled' | 'unavailable';

export interface SwimlaneRegistryEntry {
  workflowId?: string;
  eventId?: string;
  state: SwimlaneRegistryState;
  route: string;
  build: (context?: SwimlaneBuildContext) => SwimlaneModel | null;
}

export function getEventById(eventId?: string | null): RegulatoryEvent | undefined {
  if (!eventId) return undefined;
  let ev = REGULATORY_EVENTS.find(event => event.id === eventId);
  if (!ev) {
    try {
      const auto = useAutogenStore.getState();
      ev = [...(auto.generatedEvents || []), ...(auto.triggeredEvents || [])].find(e => e.id === eventId);
    } catch {
      // non-reactive getState safe; fallthrough to undefined
    }
  }
  return ev;
}

/** Design-matched display wrapper for live event content (used by calendar + swimlane surfaces). */
export function getLiveEventDisplay(eventId?: string | null) {
  const ev = getEventById(eventId);
  return ev ? getEventDisplayModel(ev) : null;
}

export function getSwimlaneRegistryEntry(input: { workflowId?: string | null; eventId?: string | null; taskId?: string | null }): SwimlaneRegistryEntry {
  const event = getEventById(input.eventId);
  const workflowId = input.workflowId ?? event?.workflowId;
  const workflow = workflowId ? WORKFLOWS[workflowId] : undefined;
  const eventId = event?.id ?? input.eventId ?? undefined;

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
        ? `Event ID ${input.eventId} did not resolve in live REGULATORY_EVENTS + autogen generated/triggered.`
        : `Workflow ID ${workflowId ?? 'unknown'} did not resolve in WORKFLOWS.`,
    }),
  };
}

export function buildRegisteredSwimlane(input: { workflowId?: string | null; eventId?: string | null; taskId?: string | null }): SwimlaneModel | null {
  return getSwimlaneRegistryEntry(input).build({ eventId: input.eventId ?? undefined, taskId: input.taskId ?? undefined });
}
