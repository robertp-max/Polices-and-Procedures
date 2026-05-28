import { writeFileSync } from 'node:fs';
import { REGULATORY_EVENTS } from '../../src/policy/data/regulatoryEvents';
import { WORKFLOWS } from '../../src/policy/data/workflows.generated';
import { FORM_TITLES } from '../../src/policy/data/formTitles.generated';
import { getPolicyContent } from '../../src/policy/data/policyContentMap';
import { buildSwimlaneFromEvent } from '../../src/policy/workflows/swimlanes/buildSwimlaneFromEvent';
import { buildWorkflowSwimlaneRoute, buildEventSwimlaneRoute } from '../../src/policy/workflows/swimlanes/swimlaneRoutes';
import { hasCustomSwimlane } from '../../src/policy/workflows/swimlanes/swimlaneRegistry';

const actionableEvents = REGULATORY_EVENTS.filter(event => !event.isContext);
const models = actionableEvents.map(event => buildSwimlaneFromEvent(event));
const customEvents = actionableEvents.filter(event => hasCustomSwimlane(event.workflowId));
const generatedEvents = actionableEvents.filter(event => !hasCustomSwimlane(event.workflowId));
const missingWorkflow = actionableEvents.filter(event => !event.workflowId);
const missingProcessFlow = actionableEvents.filter(event => event.processFlow.length === 0);
const missingRequiredForms = actionableEvents.filter(event => event.requiredForms.length === 0);
const minimalFallback = models.filter(model => model.missingContext?.some(item => item.includes('minimal fallback')));

const unresolvedForms = new Map<string, string[]>();
for (const event of actionableEvents) {
  const formIds = Array.from(new Set(event.requiredForms.map(form => form.formId ?? form.id)));
  const missing = formIds.filter(formId => !FORM_TITLES[formId]);
  if (missing.length) unresolvedForms.set(event.id, missing);
}

const unresolvedPolicyRefs = new Map<string, string[]>();
for (const event of actionableEvents) {
  const missing = event.policyRefs.filter(policyId => !getPolicyContent(policyId));
  if (missing.length) unresolvedPolicyRefs.set(event.id, missing);
}

function table(rows: string[][]): string {
  return rows.map(row => `| ${row.join(' | ')} |`).join('\n');
}

function eventRows(events: typeof actionableEvents, limit = 40): string {
  if (!events.length) return '_None._';
  return table([
    ['Event ID', 'Title', 'Workflow', 'Route'],
    ['---', '---', '---', '---'],
    ...events.slice(0, limit).map(event => [
      event.id,
      event.title.replace(/\|/g, '/'),
      event.workflowId ?? 'missing',
      event.workflowId ? buildWorkflowSwimlaneRoute(event.workflowId, { eventId: event.id }) : buildEventSwimlaneRoute(event.id),
    ]),
  ]);
}

function unresolvedRows(items: Map<string, string[]>): string {
  if (!items.size) return '_None._';
  return table([
    ['Event ID', 'Unresolved IDs'],
    ['---', '---'],
    ...Array.from(items.entries()).map(([eventId, ids]) => [eventId, ids.join(', ')]),
  ]);
}

const report = `# Mandated Event Swimlane Generation Report

Generated: ${new Date().toISOString()}

## Coverage Summary

${table([
  ['Metric', 'Count'],
  ['---', '---:'],
  ['Total mandated/actionable events found', String(actionableEvents.length)],
  ['Events with custom swimlane', String(customEvents.length)],
  ['Events with generated swimlane', String(generatedEvents.length)],
  ['Events with missing workflowId', String(missingWorkflow.length)],
  ['Events with missing processFlow', String(missingProcessFlow.length)],
  ['Events with missing requiredForms', String(missingRequiredForms.length)],
  ['Total form IDs unresolved', String(Array.from(unresolvedForms.values()).reduce((sum, ids) => sum + ids.length, 0))],
  ['Total policy refs unresolved', String(Array.from(unresolvedPolicyRefs.values()).reduce((sum, ids) => sum + ids.length, 0))],
  ['Events where minimal fallback was used', String(minimalFallback.length)],
  ['Compiled workflow records available', String(Object.keys(WORKFLOWS).length)],
])}

## Routes Available

- Existing custom route retained: \`/workflows/QA-WF-03-swimlane\`
- Generic workflow route added: \`/workflows/:workflowId/swimlane?eventId={eventId}&taskId={taskId}\`
- Event-first route added: \`/events/:eventId/swimlane?workflowId={workflowId}&taskId={taskId}\`
- CES Calendar task clicks now resolve the swimlane registry and route to custom or generated swimlanes.

## Missing Workflow IDs

${eventRows(missingWorkflow)}

## Minimal Fallback Events

${eventRows(actionableEvents.filter(event => minimalFallback.some(model => model.eventId === event.id)))}

## Unresolved Form IDs

${unresolvedRows(unresolvedForms)}

## Unresolved Policy Refs

${unresolvedRows(unresolvedPolicyRefs)}

## Known Limitations

- QA-WF-03 keeps its existing high-fidelity custom route; the shared renderer is used for generic workflow and event-first swimlanes.
- Generated swimlanes infer phases and lanes from structured workflow/event fields. Low-data events are intentionally labeled with missing-context indicators.
- Template mode links open Forms Library templates only. Event execution links pass event/task/workflow context to the existing FormViewer idempotency path.
- This audit validates static coverage and ID resolution; browser verification and build results must be appended after execution.
`;

writeFileSync('Builder/_system/MANDATED_EVENT_SWIMLANE_GENERATION_REPORT.md', report);
console.log(`Mandated event swimlane report written for ${actionableEvents.length} events.`);
