import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildRegisteredSwimlane } from '@/policy/workflows/swimlanes/swimlaneRegistry';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';

type RouteCase = {
  label: string;
  route: string;
  input: { workflowId?: string; eventId?: string; taskId?: string };
  expectFallback?: boolean;
  expectSignatureOnly?: boolean;
};

const ROUTES: RouteCase[] = [
  {
    label: 'OIG/SAM exclusion check',
    route: '/events/oig_sam_exclusion_check-20260505-01/swimlane?workflowId=CO-WF-15',
    input: { eventId: 'oig_sam_exclusion_check-20260505-01', workflowId: 'CO-WF-15' },
  },
  {
    label: 'QAPI meeting',
    route: '/events/qapi_meeting-20260507-08/swimlane',
    input: { eventId: 'qapi_meeting-20260507-08' },
  },
  {
    label: 'Cost report filing',
    route: '/events/cost_report_filing-20260531-01/swimlane',
    input: { eventId: 'cost_report_filing-20260531-01' },
  },
  {
    label: 'Plan of care audit workflow',
    route: '/workflows/CL-WF-26/swimlane?eventId=plan_of_care_audit-20260507-01&taskId=CL-WF-26-STEP-01',
    input: { workflowId: 'CL-WF-26', eventId: 'plan_of_care_audit-20260507-01', taskId: 'CL-WF-26-STEP-01' },
  },
  {
    label: 'Signature-only attestation event',
    route: '/events/bbp_training-20260527-01/swimlane',
    input: { eventId: 'bbp_training-20260527-01' },
    expectSignatureOnly: true,
  },
  {
    label: 'Fallback unresolved event',
    route: '/events/unresolved-demo-20260531-99/swimlane?workflowId=UNKNOWN-WF-99',
    input: { eventId: 'unresolved-demo-20260531-99', workflowId: 'UNKNOWN-WF-99' },
    expectFallback: true,
  },
];

function isDeterministicId(value: string | undefined, prefix: 'TASK' | 'NODE' | 'SIGN') {
  return Boolean(value && new RegExp(`^${prefix}-[A-Za-z0-9_-]+(?:-[A-Za-z0-9_-]+)+$`).test(value));
}

function isSignatureOnlyForm(formId: string) {
  const record = FORMS_DATASET.find(item => item.id === formId);
  const name = `${record?.name ?? ''}`.toLowerCase();
  const type = `${record?.type ?? ''}`.toLowerCase();
  return type === 'attestation' || /acknowledg|attestation|consent/.test(name);
}

function assert(condition: boolean, message: string, failures: string[]) {
  if (!condition) failures.push(message);
}

const failures: string[] = [];
const routeSummaries: string[] = [];

for (const routeCase of ROUTES) {
  const model = buildRegisteredSwimlane(routeCase.input);
  assert(Boolean(model), `Route ${routeCase.route} did not build a swimlane model.`, failures);
  if (!model) continue;

  if (routeCase.expectFallback) {
    assert(model.missingContext?.length ? true : false, `Fallback route ${routeCase.route} did not expose missing-context guidance.`, failures);
  }

  model.nodes.forEach(node => {
    assert(isDeterministicId(node.taskId, 'TASK'), `Non-deterministic taskId: ${node.taskId}`, failures);
    assert(isDeterministicId(node.nodeId, 'NODE'), `Non-deterministic nodeId: ${node.nodeId}`, failures);
    assert(node.instructions.length > 0, `Node ${node.taskId} is missing instructions.`, failures);

    if (model.mode === 'event_execution' && node.requiredForms.length > 0) {
      const allResolved = (node.formInstances ?? []).length === node.requiredForms.length
        && (node.formInstances ?? []).every(form => Boolean(form.formInstanceId));
      assert(allResolved, `Event execution node ${node.taskId} has form requirements without resolved formInstanceId(s).`, failures);
    }

    if ((node.signatureRequirements?.length ?? 0) > 0) {
      assert((node.signatureTasks?.length ?? 0) > 0, `Signature-required node ${node.taskId} has no signer tasks.`, failures);
    }

    const taskIds = new Set<string>();
    (node.signatureTasks ?? []).forEach(task => {
      assert(isDeterministicId(task.taskId, 'SIGN'), `Non-deterministic signer taskId: ${task.taskId}`, failures);
      assert(Boolean(task.parentTaskId), `Signer task ${task.taskId} is missing parentTaskId.`, failures);
      assert(Boolean(task.eventId), `Signer task ${task.taskId} is missing eventId.`, failures);
      assert(Boolean(task.signerRole), `Signer task ${task.taskId} is missing signerRole.`, failures);
      assert(!taskIds.has(task.taskId), `Duplicate signer taskId detected on ${node.taskId}: ${task.taskId}`, failures);
      taskIds.add(task.taskId);
    });

    (node.formInstances ?? []).forEach(form => {
      if (isSignatureOnlyForm(form.formId) && (node.signatureTasks?.length ?? 0) > 0) {
        assert(form.supportingDocumentation.length === 0, `Signature-only form ${form.formId} generated unnecessary support-doc tasks on ${node.taskId}.`, failures);
      }
      if (form.requiredAdditionalDocumentation) {
        assert(form.supportingDocumentation.length > 0, `Form ${form.formId} marked documentation-required without support tasks on ${node.taskId}.`, failures);
      }
    });

    const hasPendingChildren = (node.signatureTasks ?? []).some(task => task.required && task.status !== 'signed')
      || node.supportingDocumentationTasks.some(task => task.required && task.status !== 'complete' && task.status !== 'locked');
    if (hasPendingChildren) {
      assert(node.status !== 'complete' && node.status !== 'locked', `Node ${node.taskId} is complete/locked while signer or support tasks are incomplete.`, failures);
    }
  });

  routeSummaries.push(`${routeCase.label}: ${model.nodes.length} nodes, ${model.nodes.reduce((count, node) => count + (node.signatureTasks?.length ?? 0), 0)} signer tasks`);
}

const swimlaneFile = resolve(process.cwd(), 'src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx');
const swimlaneSource = readFileSync(swimlaneFile, 'utf8');
assert(!/Open \/ Create Form Instance|Create Form Instance/.test(swimlaneSource), 'Legacy "Open / Create Form Instance" text remains in the swimlane workspace.', failures);

let qaDiffOutput = '';
try {
  qaDiffOutput = execSync('git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx', { encoding: 'utf8' }).trim();
} catch (error) {
  failures.push(`Unable to inspect QA-WF-03 diff: ${String(error)}`);
}
assert(qaDiffOutput === '', 'QA-WF-03 custom page has a non-empty diff.', failures);

console.log('Signer Hierarchy / eCIgn Task Mapping Audit');
routeSummaries.forEach(line => console.log(`- ${line}`));
if (failures.length > 0) {
  console.error('\nFailures:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('\nAll signer hierarchy and eCIgn task mapping validations passed.');
