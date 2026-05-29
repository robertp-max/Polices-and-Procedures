import type { SwimlaneModel } from './types';
import { buildCanonicalEventSwimlaneNodeId, buildCanonicalEventSwimlaneTaskId } from './eventSwimlaneIdentity';
import { buildSwimlaneInstructions } from './swimlaneInstructions';

export function buildFallbackSwimlane(input: {
  eventId?: string;
  workflowId?: string;
  taskId?: string;
  reason?: string;
}): SwimlaneModel {
  const id = input.eventId ?? input.workflowId ?? 'unknown-swimlane';
  const workflowId = input.workflowId;
  const eventId = input.eventId;
  const taskIdPrefix = input.taskId ?? id;
  const reason = input.reason ?? 'No source event or workflow record resolved for this route.';
  const routeTaskId = (sourceStepId: string, stepOrder: number, taskPurpose?: string) => input.eventId
    ? buildCanonicalEventSwimlaneTaskId({
      eventId: input.eventId,
      workflowId,
      sourceStepId,
      stepOrder,
      taskPurpose,
    })
    : `${taskIdPrefix}-${sourceStepId.toUpperCase()}`;
  const routeNodeId = (sourceStepId: string, stepOrder: number, taskPurpose?: string) => input.eventId
    ? buildCanonicalEventSwimlaneNodeId({
      eventId: input.eventId,
      workflowId,
      sourceStepId,
      stepOrder,
      taskPurpose,
    })
    : `${id}-${sourceStepId}`;

  return {
    id: `${id}-fallback-swimlane`,
    workflowId,
    eventId,
    title: eventId ? `Unresolved Event Swimlane: ${eventId}` : `Unresolved Workflow Swimlane: ${workflowId ?? 'unknown'}`,
    description: 'Minimal fallback swimlane with explicit missing-context indicators.',
    sourceType: 'generated',
    mode: eventId ? 'event_execution' : 'template',
    phases: [
      { id: 'phase-1', title: 'Requirement Identified', order: 1 },
      { id: 'phase-2', title: 'Owner Review', order: 2 },
      { id: 'phase-3', title: 'Evidence Collection', order: 3 },
      { id: 'phase-4', title: 'Review / Approval', order: 4 },
      { id: 'phase-5', title: 'Lock / Complete', order: 5 },
    ],
    lanes: [
      { id: 'lane-owner', title: 'Assigned Owner', roleKey: 'assigned-owner', order: 1 },
      { id: 'lane-system', title: 'Evidence / eCIgn System', roleKey: 'evidence-ecign-system', order: 2 },
    ],
    nodes: [
      {
        nodeId: routeNodeId('fallback-opened', 1, 'regulatory_trigger'),
        taskId: routeTaskId('fallback-opened', 1, 'regulatory_trigger'),
        workflowId,
        eventId,
        sourceStepId: 'fallback:opened',
        phaseId: 'phase-1',
        laneId: 'lane-owner',
        title: 'Route opened',
        shortDescription: reason,
        ownerRole: 'Assigned Owner',
        status: 'unavailable',
        requiredForms: [],
        formInstances: [],
        requiredEvidence: [],
        supportingDocumentationTasks: [],
        instructions: buildSwimlaneInstructions({
          title: 'Route opened',
          description: reason,
          taskPurpose: 'regulatory_trigger',
        }),
        dependencies: [],
        nextNodeIds: [routeNodeId('fallback-review', 2, 'document_review')],
        auditPurpose: 'Documents that the route resolved to a defensible fallback instead of a blank page.',
        sourceType: 'generated',
      },
      {
        nodeId: routeNodeId('fallback-review', 2, 'document_review'),
        taskId: routeTaskId('fallback-review', 2, 'document_review'),
        workflowId,
        eventId,
        sourceStepId: 'fallback:review',
        phaseId: 'phase-2',
        laneId: 'lane-owner',
        title: 'Responsible owner reviews missing context',
        shortDescription: 'Confirm whether the event ID, workflow ID, and task ID exist in the mandated event dataset.',
        ownerRole: 'Assigned Owner',
        status: 'blocked',
        requiredForms: [],
        formInstances: [],
        requiredEvidence: ['Missing source record must be resolved before execution artifacts are created.'],
        supportingDocumentationTasks: [],
        instructions: buildSwimlaneInstructions({
          title: 'Responsible owner reviews missing context',
          description: 'Confirm whether the event ID, workflow ID, and task ID exist in the mandated event dataset.',
          evidenceDescriptions: ['Missing source record must be resolved before execution artifacts are created.'],
          taskPurpose: 'document_review',
        }),
        dependencies: [routeNodeId('fallback-opened', 1, 'regulatory_trigger')],
        nextNodeIds: [routeNodeId('fallback-evidence', 3, 'supporting_evidence')],
        auditPurpose: 'Prevents the UI from implying completion or creating fake evidence.',
        sourceType: 'generated',
      },
      {
        nodeId: routeNodeId('fallback-evidence', 3, 'supporting_evidence'),
        taskId: routeTaskId('fallback-evidence', 3, 'supporting_evidence'),
        workflowId,
        eventId,
        sourceStepId: 'fallback:evidence',
        phaseId: 'phase-3',
        laneId: 'lane-system',
        title: 'Evidence requirements unavailable',
        shortDescription: 'No forms, signatures, or evidence records are created from fallback mode.',
        ownerRole: 'Evidence / eCIgn System',
        status: 'unavailable',
        requiredForms: [],
        formInstances: [],
        requiredEvidence: ['No source evidence requirements resolved.'],
        supportingDocumentationTasks: [],
        instructions: buildSwimlaneInstructions({
          title: 'Evidence requirements unavailable',
          description: 'No forms, signatures, or evidence records are created from fallback mode.',
          evidenceDescriptions: ['No source evidence requirements resolved.'],
          taskPurpose: 'supporting_evidence',
        }),
        dependencies: [routeNodeId('fallback-review', 2, 'document_review')],
        nextNodeIds: [routeNodeId('fallback-lock', 4, 'evidence_lock')],
        auditPurpose: 'Shows missing-context state honestly without fabricating operational data.',
        sourceType: 'generated',
      },
      {
        nodeId: routeNodeId('fallback-lock', 4, 'evidence_lock'),
        taskId: routeTaskId('fallback-lock', 4, 'evidence_lock'),
        workflowId,
        eventId,
        sourceStepId: 'fallback:lock',
        phaseId: 'phase-5',
        laneId: 'lane-system',
        title: 'Lock unavailable',
        shortDescription: 'Package lock is blocked until the source event or workflow is restored.',
        ownerRole: 'Evidence / eCIgn System',
        status: 'blocked',
        requiredForms: [],
        formInstances: [],
        requiredEvidence: [],
        supportingDocumentationTasks: [],
        instructions: buildSwimlaneInstructions({
          title: 'Lock unavailable',
          description: 'Package lock is blocked until the source event or workflow is restored.',
          taskPurpose: 'evidence_lock',
          finalEvidenceLock: true,
        }),
        dependencies: [routeNodeId('fallback-evidence', 3, 'supporting_evidence')],
        nextNodeIds: [],
        auditPurpose: 'Ensures fallback route never appears complete or survey-ready.',
        sourceType: 'generated',
      },
    ],
    edges: [
      { fromNodeId: routeNodeId('fallback-opened', 1, 'regulatory_trigger'), toNodeId: routeNodeId('fallback-review', 2, 'document_review'), route: 'orthogonal' },
      { fromNodeId: routeNodeId('fallback-review', 2, 'document_review'), toNodeId: routeNodeId('fallback-evidence', 3, 'supporting_evidence'), route: 'orthogonal' },
      { fromNodeId: routeNodeId('fallback-evidence', 3, 'supporting_evidence'), toNodeId: routeNodeId('fallback-lock', 4, 'evidence_lock'), route: 'orthogonal' },
    ],
    requiredForms: [],
    policyRefs: [],
    evidenceRequirements: ['No source evidence requirements resolved.'],
    missingContext: [reason, 'Minimal fallback used. No records, form instances, signatures, or evidence were created.'],
  };
}
