import type { SwimlaneModel } from './types';

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
        nodeId: `${id}-fallback-opened`,
        taskId: `${taskIdPrefix}-OPEN`,
        workflowId,
        eventId,
        phaseId: 'phase-1',
        laneId: 'lane-owner',
        title: 'Route opened',
        shortDescription: reason,
        ownerRole: 'Assigned Owner',
        status: 'unavailable',
        requiredForms: [],
        requiredEvidence: [],
        dependencies: [],
        nextNodeIds: [`${id}-fallback-review`],
        auditPurpose: 'Documents that the route resolved to a defensible fallback instead of a blank page.',
        sourceType: 'generated',
      },
      {
        nodeId: `${id}-fallback-review`,
        taskId: `${taskIdPrefix}-REVIEW`,
        workflowId,
        eventId,
        phaseId: 'phase-2',
        laneId: 'lane-owner',
        title: 'Responsible owner reviews missing context',
        shortDescription: 'Confirm whether the event ID, workflow ID, and task ID exist in the mandated event dataset.',
        ownerRole: 'Assigned Owner',
        status: 'blocked',
        requiredForms: [],
        requiredEvidence: ['Missing source record must be resolved before execution artifacts are created.'],
        dependencies: [`${id}-fallback-opened`],
        nextNodeIds: [`${id}-fallback-evidence`],
        auditPurpose: 'Prevents the UI from implying completion or creating fake evidence.',
        sourceType: 'generated',
      },
      {
        nodeId: `${id}-fallback-evidence`,
        taskId: `${taskIdPrefix}-EVIDENCE`,
        workflowId,
        eventId,
        phaseId: 'phase-3',
        laneId: 'lane-system',
        title: 'Evidence requirements unavailable',
        shortDescription: 'No forms, signatures, or evidence records are created from fallback mode.',
        ownerRole: 'Evidence / eCIgn System',
        status: 'unavailable',
        requiredForms: [],
        requiredEvidence: ['No source evidence requirements resolved.'],
        dependencies: [`${id}-fallback-review`],
        nextNodeIds: [`${id}-fallback-lock`],
        auditPurpose: 'Shows missing-context state honestly without fabricating operational data.',
        sourceType: 'generated',
      },
      {
        nodeId: `${id}-fallback-lock`,
        taskId: `${taskIdPrefix}-LOCK`,
        workflowId,
        eventId,
        phaseId: 'phase-5',
        laneId: 'lane-system',
        title: 'Lock unavailable',
        shortDescription: 'Package lock is blocked until the source event or workflow is restored.',
        ownerRole: 'Evidence / eCIgn System',
        status: 'blocked',
        requiredForms: [],
        requiredEvidence: [],
        dependencies: [`${id}-fallback-evidence`],
        nextNodeIds: [],
        auditPurpose: 'Ensures fallback route never appears complete or survey-ready.',
        sourceType: 'generated',
      },
    ],
    edges: [
      { fromNodeId: `${id}-fallback-opened`, toNodeId: `${id}-fallback-review`, route: 'orthogonal' },
      { fromNodeId: `${id}-fallback-review`, toNodeId: `${id}-fallback-evidence`, route: 'orthogonal' },
      { fromNodeId: `${id}-fallback-evidence`, toNodeId: `${id}-fallback-lock`, route: 'orthogonal' },
    ],
    requiredForms: [],
    policyRefs: [],
    evidenceRequirements: ['No source evidence requirements resolved.'],
    missingContext: [reason, 'Minimal fallback used. No records, form instances, signatures, or evidence were created.'],
  };
}
