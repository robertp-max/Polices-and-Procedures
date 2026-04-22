import { useMemo } from 'react';
import {
  answerWorkflowQuery,
  isWorkflowQuery,
  type RuntimeState,
  type WorkflowAnswer,
} from './workflowKnowledge';

/**
 * useBradWorkflow — subscribes a React component to the deterministic
 * workflow answerer. If the query is a workflow question, `answer` is
 * populated with grounded content; otherwise it is `null` and Brad's
 * usual server retrieval path should proceed.
 *
 * Pattern for Brad's chat UI:
 *
 *   const { answer } = useBradWorkflow(lastUserMessage, runtimeState);
 *   if (answer) {
 *     // show deterministic answer immediately; skip server round-trip.
 *   } else {
 *     // fall through to iaClient.chatStream(...) as before.
 *   }
 */
export function useBradWorkflow(
  query: string,
  runtime?: RuntimeState,
): { isWorkflow: boolean; answer: WorkflowAnswer | null } {
  return useMemo(() => {
    if (!query.trim()) return { isWorkflow: false, answer: null };
    if (!isWorkflowQuery(query)) return { isWorkflow: false, answer: null };
    const answer = answerWorkflowQuery(query, runtime);
    return { isWorkflow: answer !== null, answer };
  }, [query, runtime?.instanceId, runtime?.currentStep, runtime?.overdue, runtime?.risk,
      runtime?.missingForms?.join(','), runtime?.pendingApprovals?.join(',')]);
}
