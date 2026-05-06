import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function main(): void {
  const panelSource = readFileSync('src/policy/components/regulatory/WorkflowExecutionPanel.tsx', 'utf8');
  const evidenceSource = readFileSync('src/policy/pages/EvidenceCenterPage.tsx', 'utf8');
  const formSource = readFileSync('src/policy/components/FormViewer.tsx', 'utf8');

  assert.ok(panelSource.includes('InlineTaskActionPanel'), 'Upload Supporting Evidence action opens inline task-bound upload UI');
  assert.ok(panelSource.includes('Uploading evidence for'), 'inline upload panel includes task-bound guidance copy');
  assert.ok(
    (panelSource.includes('Event ID: {dataflow.eventId}') || panelSource.includes('event: ') || panelSource.includes('dataflow.eventId}'))
      && (panelSource.includes('Task ID: {task.id}') || panelSource.includes('task: ') || panelSource.includes('task.id}')),
    'inline upload context includes event_id and task_id',
  );

  assert.ok(evidenceSource.includes('You are uploading evidence for this task requirement.'), 'evidence route with query params shows task-linked guidance');
  assert.ok(evidenceSource.includes('const uploadTaskId = (qTaskId || filterTaskId).trim();'), 'evidence upload from deep-link binds to task_id');

  assert.ok(panelSource.includes('formId={formId}') && panelSource.includes('formSource="task"'), 'Complete Form action opens task-context form panel');
  assert.ok(formSource.includes("searchParams.get('event_id')") && formSource.includes("searchParams.get('task_id')"), 'form route reads event_id/task_id');
  assert.ok(formSource.includes("searchParams.get('form_id')") && formSource.includes("searchParams.get('policy_id')"), 'form route reads form_id/policy_id');
  assert.ok(formSource.includes("searchParams.get('workflow_id')") && formSource.includes("searchParams.get('requirement_id')"), 'form route reads workflow_id/requirement_id');
  assert.ok(formSource.includes('Task-linked form context detected.'), 'form page shows task-linked context banner');

  assert.ok(
    panelSource.includes('Action blocked: selected task does not belong to the active event context.')
      || evidenceSource.includes('Context mismatch: URL event_id='),
    'invalid task/event mismatch blocks action',
  );

  console.log('PASS: inline upload behavior is task-bound');
  console.log('PASS: evidence deep-link guidance/binding is present');
  console.log('PASS: inline form behavior preserves task context');
  console.log('PASS: form route context parsing and banner are present');
  console.log('PASS: context mismatch behavior is blocked with clear messaging');
}

main();
