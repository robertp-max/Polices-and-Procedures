import { useMemo } from 'react';
import {
  answerWorkflowQuery,
  isWorkflowQuery,
  type RuntimeState,
  type WorkflowAnswer,
} from './workflowKnowledge';
import { answerReadinessQuery, type ReadinessAnswer } from './workflowSchedule';

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
): {
  isWorkflow: boolean;
  answer: WorkflowAnswer | null;
  isReadiness: boolean;
  readiness: ReadinessAnswer | null;
} {
  return useMemo(() => {
    if (!query.trim()) {
      return { isWorkflow: false, answer: null, isReadiness: false, readiness: null };
    }
    // Workflow-specific queries take precedence (they cite authored spec).
    if (isWorkflowQuery(query)) {
      const answer = answerWorkflowQuery(query, runtime);
      return { isWorkflow: answer !== null, answer, isReadiness: false, readiness: null };
    }
    // Readiness / schedule / audit-state questions — grounded in live stores.
    const readiness = answerReadinessQuery(query);
    if (readiness) {
      return { isWorkflow: false, answer: null, isReadiness: true, readiness };
    }
    return { isWorkflow: false, answer: null, isReadiness: false, readiness: null };
  }, [query, runtime?.instanceId, runtime?.currentStep, runtime?.overdue, runtime?.risk,
      runtime?.auditState, runtime?.isCertified, runtime?.readyForCertification,
      runtime?.missingForms?.join(','), runtime?.pendingApprovals?.join(',')]);
}
