import type { EventInstance, EventTaskStatus } from './types';

const EVENT_TRANSITIONS: Record<EventInstance['status'], EventInstance['status'][]> = {
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['certified'],
  certified: [],
  cancelled: [],
};

const TASK_TRANSITIONS: Record<EventTaskStatus, EventTaskStatus[]> = {
  not_started: ['in_progress', 'cancelled'],
  in_progress: ['blocked', 'awaiting_signature', 'completed', 'cancelled'],
  blocked: ['in_progress'],
  awaiting_signature: ['completed'],
  completed: [],
  cancelled: [],
};

export function canTransitionEventInstance(
  from: EventInstance['status'],
  to: EventInstance['status'],
): boolean {
  return EVENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionTaskStatus(
  from: EventTaskStatus,
  to: EventTaskStatus,
): boolean {
  return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}
