import type { EventInstance, EventTask } from './types';

export interface EventStateEvaluationInput {
  eventId: string;
  eventInstance: EventInstance;
  tasks: EventTask[];
  requiredFormsComplete: boolean;
  hasApprovals: boolean;
}

export interface EventStateEvaluationResult {
  nextStatus: EventInstance['status'];
  canCertify: boolean;
  blockers: string[];
}

export function evaluateEventState(input: EventStateEvaluationInput): EventStateEvaluationResult {
  const requiredTasks = input.tasks.filter(task => task.isRequired && !task.isDeleted);
  const incompleteRequired = requiredTasks.filter(task => task.status !== 'completed');
  const blockers: string[] = [];
  if (incompleteRequired.length > 0) {
    blockers.push(`Required tasks incomplete (${incompleteRequired.length})`);
  }
  if (!input.requiredFormsComplete) blockers.push('Required forms incomplete');
  if (!input.hasApprovals) blockers.push('Required approvals incomplete');

  let nextStatus = input.eventInstance.status;
  if (input.eventInstance.status === 'scheduled' && input.tasks.some(task => task.status !== 'not_started')) {
    nextStatus = 'in_progress';
  }
  if (input.eventInstance.status === 'in_progress' && blockers.length === 0) {
    nextStatus = 'completed';
  }

  return {
    nextStatus,
    canCertify: blockers.length === 0 && nextStatus === 'completed',
    blockers,
  };
}
