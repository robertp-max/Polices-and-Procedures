import { readFileSync, writeFileSync } from 'node:fs';
import { REGULATORY_EVENTS } from '../../src/policy/data/regulatoryEvents';
import { deriveDefaultEventTasks } from '../../src/policy/compliance-execution/eventTaskAdapter';
import { buildSwimlaneFromEvent } from '../../src/policy/workflows/swimlanes/buildSwimlaneFromEvent';

type Finding = {
  route: string;
  nodeId?: string;
  taskId?: string;
  formId?: string;
  message: string;
};

const findings: Finding[] = [];
const eventModels = REGULATORY_EVENTS
  .filter(event => !event.isContext)
  .map(event => ({ event, model: buildSwimlaneFromEvent(event, { eventId: event.id, mode: 'event_execution' }) }));

for (const { event, model } of eventModels) {
  const canonicalTasks = deriveDefaultEventTasks(event, event.id);
  for (const task of canonicalTasks) {
    if (!task.formIds.length) continue;
    if (!task.generated_form_instance_ids?.length || task.generated_form_instance_ids.length !== task.formIds.length) {
      findings.push({
        route: `/events/${event.id}/swimlane`,
        taskId: task.id,
        message: 'Canonical event task generation did not attach stable generated_form_instance_ids for every required form.',
      });
    }
  }

  const seen = new Map<string, string>();
  for (const node of model.nodes) {
    if (!node.requiredForms.length) continue;
    if (!node.formInstances?.length) {
      findings.push({
        route: `/events/${event.id}/swimlane`,
        nodeId: node.nodeId,
        taskId: node.taskId,
        message: 'Task has requiredForms but no formInstances metadata.',
      });
      continue;
    }

    for (const formId of node.requiredForms) {
      const row = node.formInstances.find(item => item.formId === formId);
      if (!row) {
        findings.push({
          route: `/events/${event.id}/swimlane`,
          nodeId: node.nodeId,
          taskId: node.taskId,
          formId,
          message: 'Required form is missing an individual form instance row.',
        });
        continue;
      }

      if (!row.formInstanceId) {
        findings.push({
          route: `/events/${event.id}/swimlane`,
          nodeId: node.nodeId,
          taskId: node.taskId,
          formId,
          message: 'Event execution form row is missing stable formInstanceId.',
        });
      }

      const duplicateKey = `${model.eventId}::${node.taskId}::${formId}`;
      if (row.formInstanceId) {
        const existing = seen.get(duplicateKey);
        if (existing && existing !== row.formInstanceId) {
          findings.push({
            route: `/events/${event.id}/swimlane`,
            nodeId: node.nodeId,
            taskId: node.taskId,
            formId,
            message: `Duplicate formInstanceIds for same event/task/form: ${existing} and ${row.formInstanceId}.`,
          });
        }
        seen.set(duplicateKey, row.formInstanceId);
      }

      const signatureOnly = Boolean(node.signerRole)
        && !node.reviewerRole
        && /sign|signature|acknowledg|attest/i.test(`${node.title} ${node.requiredEvidence.join(' ')}`);
      if (signatureOnly && row.supportingDocumentation.length > 0) {
        findings.push({
          route: `/events/${event.id}/swimlane`,
          nodeId: node.nodeId,
          taskId: node.taskId,
          formId,
          message: 'Signature-only form generated supporting documentation tasks.',
        });
      }
    }
  }
}

const generatedRenderer = readFileSync('src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx', 'utf8');
const bannedText = [
  ['Open /', ' Create Form ', 'Instance'].join(''),
  ['Create', ' Form ', 'Instance'].join(''),
  ['Open/Create', ' For', 'm'].join(''),
];

for (const label of bannedText) {
  if (generatedRenderer.includes(label)) {
    findings.push({
      route: 'generated renderer source',
      message: `Banned label remains: ${label}`,
    });
  }
}

if (generatedRenderer.includes("requiredForms.join(', ')")) {
  findings.push({
    route: 'generated renderer source',
    message: 'Generated swimlane renderer still renders requiredForms as a comma-separated blob.',
  });
}

const report = [
  '# Swimlane Form Instance Validation Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Event execution models checked: ${eventModels.length}`,
  `Findings: ${findings.length}`,
  '',
  findings.length
    ? findings.map(finding => `- ${finding.route}${finding.taskId ? ` / ${finding.taskId}` : ''}${finding.formId ? ` / ${finding.formId}` : ''}: ${finding.message}`).join('\n')
    : 'PASS: generated/event swimlanes have stable form instance rows, no duplicate event/task/form instance mappings, no banned create labels, and no generated renderer comma-separated requiredForms display.',
  '',
].join('\n');

writeFileSync('Builder/_system/SWIMLANE_FORM_INSTANCE_VALIDATION_REPORT.md', report);

if (findings.length) {
  console.error(report);
  process.exit(1);
}

console.log(report);
