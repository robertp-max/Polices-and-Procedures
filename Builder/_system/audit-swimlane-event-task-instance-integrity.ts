import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { REGULATORY_EVENTS } from '../../src/policy/data/regulatoryEvents';
import { buildSwimlaneFromEvent } from '../../src/policy/workflows/swimlanes/buildSwimlaneFromEvent';
import type { SwimlaneModel, SwimlaneNode } from '../../src/policy/workflows/swimlanes/types';

type Finding = {
  route: string;
  nodeId?: string;
  taskId?: string;
  message: string;
};

function normalize(value: string) {
  return value
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function taskRoute(model: SwimlaneModel) {
  return model.eventId
    ? `/events/${model.eventId}/swimlane${model.workflowId ? `?workflowId=${model.workflowId}` : ''}`
    : `/workflows/${model.workflowId ?? 'unknown'}/swimlane`;
}

function isSignatureOnly(node: SwimlaneNode) {
  return Boolean(node.signerRole)
    && !node.reviewerRole
    && /sign|signature|acknowledg|attest/i.test(`${node.title} ${node.requiredEvidence.join(' ')}`);
}

function expectedSupportDocs(node: SwimlaneNode) {
  if (!node.requiredForms.length || isSignatureOnly(node)) return false;
  return node.requiredEvidence.some(label => {
    const normalized = normalize(label);
    if (!normalized) return false;
    if (/signature|signed|approval-path|signature-path/.test(normalized)) return false;
    return !node.requiredForms.some(formId => normalized.includes(normalize(formId)));
  });
}

const findings: Finding[] = [];
const eventModels = REGULATORY_EVENTS
  .filter(event => !event.isContext)
  .map(event => buildSwimlaneFromEvent(event, { eventId: event.id, mode: 'event_execution' }));

for (const model of eventModels) {
  const seenTaskIds = new Set<string>();
  const seenNodeIds = new Set<string>();
  const route = taskRoute(model);

  for (const node of model.nodes) {
    if (!node.taskId.trim()) findings.push({ route, nodeId: node.nodeId, message: 'Node is missing taskId.' });
    if (!node.nodeId.trim()) findings.push({ route, taskId: node.taskId, message: 'Node is missing nodeId.' });
    if (seenTaskIds.has(node.taskId)) findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: 'Duplicate taskId found in model.' });
    if (seenNodeIds.has(node.nodeId)) findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: 'Duplicate nodeId found in model.' });
    seenTaskIds.add(node.taskId);
    seenNodeIds.add(node.nodeId);

    if (!node.instructions?.length) {
      findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: 'Task instructions are missing.' });
    }

    if (node.requiredForms.length > 0) {
      if (!node.formInstances?.length) {
        findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: 'Required forms exist but formInstances is empty.' });
      }

      const uniqueRequiredForms = new Set(node.requiredForms);
      const uniqueRenderedForms = new Set(node.formInstances?.map(item => item.formId) ?? []);
      if (uniqueRenderedForms.size !== uniqueRequiredForms.size) {
        findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: 'Multiple required forms are not rendered as separate rows.' });
      }

      for (const formId of uniqueRequiredForms) {
        const row = node.formInstances?.find(item => item.formId === formId);
        if (!row) {
          findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: `Missing form instance row for ${formId}.` });
          continue;
        }
        if (model.mode === 'event_execution' && !row.formInstanceId) {
          findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: `Event execution form row ${formId} is missing formInstanceId.` });
        }
        if (isSignatureOnly(node) && row.supportingDocumentation.length > 0) {
          findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: `Signature-only form ${formId} generated unnecessary support-document tasks.` });
        }
      }

      if (expectedSupportDocs(node) && node.supportingDocumentationTasks.length === 0) {
        findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: 'Supporting-documentation subtasks were expected but not generated.' });
      }
    }

    const seenSupportTaskIds = new Set<string>();
    for (const task of node.supportingDocumentationTasks) {
      if (seenSupportTaskIds.has(task.supportTaskId)) {
        findings.push({ route, nodeId: node.nodeId, taskId: node.taskId, message: `Duplicate supporting-documentation task id ${task.supportTaskId}.` });
      }
      seenSupportTaskIds.add(task.supportTaskId);
    }
  }
}

const renderer = readFileSync('src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx', 'utf8');
if (renderer.includes('Open / Create Form Instance')) {
  findings.push({ route: 'src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx', message: 'Banned label `Open / Create Form Instance` remains in renderer source.' });
}
if (renderer.includes("requiredForms.join(', ')")) {
  findings.push({ route: 'src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx', message: 'Required forms are still rendered as a comma-separated blob.' });
}
if (!renderer.includes('Task Instructions')) {
  findings.push({ route: 'src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx', message: 'Renderer is missing Task Instructions section.' });
}
if (!renderer.includes('Workspace Not Yet Available')) {
  findings.push({ route: 'src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx', message: 'Renderer is missing explicit nonblank workspace fallback copy.' });
}

const routePage = readFileSync('src/policy/workflows/swimlanes/SwimlaneRoutePage.tsx', 'utf8');
if (routePage.includes('return model ?') || routePage.includes(': null')) {
  findings.push({ route: 'src/policy/workflows/swimlanes/SwimlaneRoutePage.tsx', message: 'Route page still contains a null render path that can produce a blank screen.' });
}

const qaDiff = execSync('git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx', { encoding: 'utf8' }).trim();
if (qaDiff) {
  findings.push({ route: 'src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx', message: 'Forbidden QA-WF-03 custom swimlane file was modified.' });
}

const reportLines = [
  '# Swimlane Event Task Instance Integrity Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Event execution models checked: ${eventModels.length}`,
  `Findings: ${findings.length}`,
  '',
  findings.length
    ? findings.map(finding => `- ${finding.route}${finding.taskId ? ` / ${finding.taskId}` : ''}${finding.nodeId ? ` / ${finding.nodeId}` : ''}: ${finding.message}`).join('\n')
    : 'PASS: generated/event swimlane nodes have stable IDs, event form instance bindings, support-documentation subtasks where required, task instructions, nonblank workspace fallbacks, and no QA-WF-03 diff.',
  '',
].join('\n');

console.log(reportLines);

if (findings.length > 0) {
  process.exit(1);
}
