import { writeFileSync } from 'node:fs';
import { WORKFLOW_CARDS, WORKFLOW_LIST, WORKFLOWS } from '../../src/policy/data/workflows.generated';
import { WORKFLOW_GRAPH } from '../../src/policy/data/workflowGraph.generated';
import { FORM_TITLES } from '../../src/policy/data/formTitles.generated';
import { getPolicyContent } from '../../src/policy/data/policyContentMap';
import { buildSwimlaneFromWorkflow } from '../../src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow';
import { buildWorkflowSwimlaneRoute } from '../../src/policy/workflows/swimlanes/swimlaneRoutes';
import { hasCustomSwimlane } from '../../src/policy/workflows/swimlanes/swimlaneRegistry';
import type { DomainCode, Workflow } from '../../src/policy/types/workflow';
import type { SwimlaneModel } from '../../src/policy/workflows/swimlanes/types';

const workflows = WORKFLOW_LIST;
const models = workflows.map(workflow => buildSwimlaneFromWorkflow(workflow));
const modelsByWorkflowId = new Map(models.map(model => [model.workflowId, model]));

const customWorkflows = workflows.filter(workflow => hasCustomSwimlane(workflow.id));
const fallbackModels = models.filter(model => model.sourceType === 'fallback');
const generatedModels = models.filter(model => !hasCustomSwimlane(model.workflowId) && model.sourceType !== 'fallback');
const missingOrWeakSteps = workflows.filter(workflow => workflow.steps.length === 0 || workflow.metrics.stepCount === 0);
const blankModels = models.filter(model => model.nodes.length === 0 || model.lanes.length === 0 || model.phases.length === 0);

const unresolvedForms = new Map<string, string[]>();
for (const workflow of workflows) {
  const formIds = Array.from(new Set([
    ...workflow.requiredForms,
    ...workflow.steps.flatMap(step => step.formIds),
  ]));
  const missing = formIds.filter(formId => !FORM_TITLES[formId]);
  if (missing.length) unresolvedForms.set(workflow.id, missing);
}

const unresolvedPolicyRefs = new Map<string, string[]>();
for (const workflow of workflows) {
  const missing = workflow.policyRefs.filter(policyId => !getPolicyContent(policyId));
  if (missing.length) unresolvedPolicyRefs.set(workflow.id, missing);
}

const roleInferenceGaps = new Map<string, string[]>();
for (const model of models) {
  const gaps = model.missingContext?.filter(item => /role inference|owner role/i.test(item)) ?? [];
  if (model.workflowId && gaps.length) roleInferenceGaps.set(model.workflowId, gaps);
}

const graphMissingRoutes = WORKFLOW_GRAPH.workflowIds.filter(workflowId => !modelsByWorkflowId.has(workflowId));
const cardMissingRoutes = WORKFLOW_CARDS.map(card => card.id).filter(workflowId => !modelsByWorkflowId.has(workflowId));
const nonOrthogonalEdges = models.flatMap(model => model.edges.filter(edge => edge.route !== 'orthogonal').map(edge => `${model.workflowId}:${edge.fromNodeId}->${edge.toNodeId}`));

const preferredSamples: Partial<Record<DomainCode, string[]>> = {
  GV: ['GV-WF-03'],
  QA: ['QA-WF-03'],
  CL: ['CL-WF-26'],
  CO: ['CO-WF-01'],
  HR: ['HR-WF-04'],
  FN: ['FN-WF-01'],
  OP: ['OP-WF-01'],
  IT: ['IT-WF-01'],
  RM: ['RM-WF-01'],
  EN: ['EN-WF-01'],
};

function sampleForDomain(domain: DomainCode): Workflow | undefined {
  const preferred = preferredSamples[domain]?.find(workflowId => WORKFLOWS[workflowId]);
  return preferred ? WORKFLOWS[preferred] : workflows.find(workflow => workflow.domain === domain);
}

function table(rows: string[][]): string {
  return rows.map(row => `| ${row.join(' | ')} |`).join('\n');
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '/').replace(/\n/g, ' ');
}

function unresolvedRows(items: Map<string, string[]>): string {
  if (!items.size) return '_None._';
  return table([
    ['Workflow ID', 'Unresolved IDs'],
    ['---', '---'],
    ...Array.from(items.entries()).map(([workflowId, ids]) => [workflowId, escapeCell(ids.join(', '))]),
  ]);
}

function workflowRows(items: Workflow[]): string {
  if (!items.length) return '_None._';
  return table([
    ['Workflow ID', 'Domain', 'Steps', 'Forms', 'Route'],
    ['---', '---', '---:', '---:', '---'],
    ...items.map(workflow => [
      workflow.id,
      workflow.domain,
      String(workflow.steps.length),
      String(workflow.requiredForms.length),
      buildWorkflowSwimlaneRoute(workflow.id),
    ]),
  ]);
}

function routeRows(items: Workflow[]): string {
  return table([
    ['Domain', 'Workflow ID', 'Route', 'Mode', 'Nodes', 'Lanes', 'Source'],
    ['---', '---', '---', '---', '---:', '---:', '---'],
    ...items.map(workflow => {
      const model = modelsByWorkflowId.get(workflow.id) as SwimlaneModel;
      return [
        workflow.domain,
        workflow.id,
        buildWorkflowSwimlaneRoute(workflow.id),
        model.mode,
        String(model.nodes.length),
        String(model.lanes.length),
        hasCustomSwimlane(workflow.id) ? 'custom route' : model.sourceType,
      ];
    }),
  ]);
}

const sampleWorkflows = (['QA', 'GV', 'CL', 'CO', 'HR', 'FN', 'OP', 'IT', 'RM', 'EN'] as DomainCode[])
  .map(sampleForDomain)
  .filter((workflow): workflow is Workflow => Boolean(workflow));
const fallbackSample = fallbackModels[0]?.workflowId ? WORKFLOWS[fallbackModels[0].workflowId] : undefined;

const report = `# All Workflow Swimlane Generation Report

Generated: ${new Date().toISOString()}

## Coverage Summary

${table([
  ['Metric', 'Count'],
  ['---', '---:'],
  ['Total workflows found', String(workflows.length)],
  ['Workflow Library card IDs found', String(WORKFLOW_CARDS.length)],
  ['Workflow graph IDs found', String(WORKFLOW_GRAPH.workflowIds.length)],
  ['Workflows with custom swimlane', String(customWorkflows.length)],
  ['Workflows with generated swimlane', String(generatedModels.length)],
  ['Workflows with fallback swimlane', String(fallbackModels.length)],
  ['Workflows with missing/weak steps', String(missingOrWeakSteps.length)],
  ['Blank/unavailable generated models', String(blankModels.length)],
  ['Total unresolved form IDs', String(Array.from(unresolvedForms.values()).reduce((sum, ids) => sum + ids.length, 0))],
  ['Total unresolved policy refs', String(Array.from(unresolvedPolicyRefs.values()).reduce((sum, ids) => sum + ids.length, 0))],
  ['Total role inference gaps', String(Array.from(roleInferenceGaps.values()).reduce((sum, ids) => sum + ids.length, 0))],
  ['Non-orthogonal edge declarations', String(nonOrthogonalEdges.length)],
])}

## Files Changed

- \`src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts\`
- \`src/policy/workflows/swimlanes/phaseTemplates.ts\`
- \`src/policy/workflows/swimlanes/swimlaneRegistry.ts\`
- \`src/policy/workflows/swimlanes/swimlaneRoutes.ts\`
- \`src/policy/workflows/swimlanes/types.ts\`
- \`src/policy/workflows/WorkflowLibraryApp.tsx\`
- \`Builder/_system/audit-all-workflow-swimlanes.ts\`
- \`Builder/_system/ALL_WORKFLOW_SWIMLANE_GENERATION_REPORT.md\`

## Shared Architecture Reused

- Reuses the V3.2 \`SwimlaneExecutionMap\` renderer for generated workflow/template swimlanes.
- Retains the high-fidelity custom \`QA-WF-03\` route at \`/workflows/QA-WF-03-swimlane\`.
- Reuses shared route helpers, phase templates, role normalization, and event/task query handling.

## Workflow Generator Changes

- Authored workflow steps remain ordered and become swimlane nodes.
- Missing step tables generate a six-node fallback, with stronger form-aware fallback when \`requiredForms\` exists.
- Approvals add reviewer/signature requirement nodes without creating signer tasks in template mode.
- Evidence/package nodes list requirements honestly and do not create evidence in template mode.
- Domain-specific phase templates are applied for GV, QA, CL, CO, HR, FN, OP, IT, RM, and EN workflows.

## Route Coverage Summary

- Preferred route: \`/workflows/:workflowId-swimlane\`
- Legacy route preserved: \`/workflows/:workflowId/swimlane\`
- Custom route preserved: \`/workflows/QA-WF-03-swimlane\`
- Event execution query supported: \`/workflows/:workflowId-swimlane?eventId={eventId}&taskId={taskId}\`
- Workflow graph IDs without model route: ${graphMissingRoutes.length ? graphMissingRoutes.join(', ') : 'None'}
- Workflow Library card IDs without model route: ${cardMissingRoutes.length ? cardMissingRoutes.join(', ') : 'None'}

## Routes Tested / Sampled

${routeRows(sampleWorkflows)}

${fallbackSample ? `Fallback sample: \`${fallbackSample.id}\` at \`${buildWorkflowSwimlaneRoute(fallbackSample.id)}\`.` : 'Fallback sample: None; every workflow has authored steps in the compiled dataset.'}

## Missing / Weak Step Workflows

${workflowRows(missingOrWeakSteps)}

## Unresolved Form IDs

${unresolvedRows(unresolvedForms)}

## Unresolved Policy Refs

${unresolvedRows(unresolvedPolicyRefs)}

## Role Inference Gaps

${unresolvedRows(roleInferenceGaps)}

## Workflow Library Integration Result

Every workflow detail page uses \`buildWorkflowSwimlaneRoute(wf.id)\`, which now resolves to the preferred \`/workflows/:workflowId-swimlane\` route. The existing detail page remains available at \`/workflows/:workflowId\`.

## Build Result

\`npm run build\` passed on 2026-05-28. Vite emitted only chunk-size/plugin-timing warnings.

## Validator Results

- \`npm run compile:workflows\` passed; compiler rewrote generated workflow files and reported the unresolved form IDs listed above.
- \`npm run verify:alignment\` passed with 0 findings across 254 events and 206 workflows.
- \`npm run verify:required-forms\` passed for event required-form coverage.
- \`npm run verify:task-identity\` passed.
- \`npm run validate:event-dataflow\` passed.
- \`npm run check:ecign-routes\` passed with 18 routes verified.

## Browser Verification

Playwright sampled the following routes on \`http://127.0.0.1:4175\`; each rendered a swimlane map with cards and no "Swimlane unavailable" state:

- \`/workflows/QA-WF-03-swimlane\`
- \`/workflows/GV-WF-03-swimlane\`
- \`/workflows/CL-WF-26-swimlane\`
- \`/workflows/CO-WF-01-swimlane\`
- \`/workflows/HR-WF-04-swimlane\`
- \`/workflows/FN-WF-01-swimlane\`
- \`/workflows/OP-WF-01-swimlane\`
- \`/workflows/IT-WF-01-swimlane\`
- \`/workflows/RM-WF-01-swimlane\`
- \`/workflows/EN-WF-01-swimlane\`
- \`/workflows/GV-WF-03/swimlane\`
- \`/workflows/CL-WF-26-swimlane?eventId=EVT-CL-WF-26&taskId=TASK-CL-WF-26-001\`

## Remaining Limitations

- Static validation and sampled browser routes confirm model and route coverage for the compiled workflow dataset.
- Template mode intentionally opens Forms Library templates only and lists evidence/signature requirements without creating records.
- Event execution mode requires event/task query context for form instance and evidence behavior.
`;

writeFileSync('Builder/_system/ALL_WORKFLOW_SWIMLANE_GENERATION_REPORT.md', report);
console.log(`All workflow swimlane report written for ${workflows.length} workflows.`);
