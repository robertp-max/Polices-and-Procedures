import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function main(): void {
  const panelSource = readFileSync('src/policy/components/regulatory/WorkflowExecutionPanel.tsx', 'utf8');

  const hasLegacySummaryTabs = panelSource.includes('label="Forms Summary"')
    || panelSource.includes('label="Evidence Summary"')
    || panelSource.includes('label="Signatures Summary"');
  const hasTaskCentricTabs = panelSource.includes('label="Overview"')
    && panelSource.includes('label="Tasks"')
    && panelSource.includes('label="Audit Trail"')
    && panelSource.includes('label="Technical Details"');
  assert.ok(hasLegacySummaryTabs || hasTaskCentricTabs, 'tab labels remain task-first across summary or simplified workspace variants');

  assert.ok(
    panelSource.includes('This is a summary view. Complete forms, upload evidence, and request signatures from the linked task in the Tasks tab so the audit trail stays connected.'),
    'non-task summary tabs include task-first guidance copy',
  );

  assert.ok(panelSource.includes('Weighted completion:'), 'task rows expose weighted completion metric');
  assert.ok(panelSource.includes('Audit readiness:'), 'task rows expose audit readiness metric');
  assert.ok(panelSource.includes('Missing requirements:'), 'task rows expose missing requirements count');
  assert.ok(panelSource.includes('Pending signatures:'), 'task rows expose pending signatures count');
  assert.ok(panelSource.includes('Missing evidence:'), 'task rows expose missing evidence count');
  assert.ok(panelSource.includes('Story points:'), 'task rows expose story points');
  assert.ok(panelSource.includes('Status:') && panelSource.includes('Certified/Locked'), 'task rows expose certified/locked status');

  assert.ok(panelSource.includes("params.set('event_id', dataflow.eventId)"), 'evidence route includes event_id');
  assert.ok(panelSource.includes("params.set('task_id', task.id)"), 'evidence route includes task_id');
  assert.ok(panelSource.includes('buildTaskLinkedEvidenceRoute'), 'evidence upload route uses task-linked builder');

  assert.ok(panelSource.includes('setTab(\'tasks\')') || panelSource.includes('legacyTab === \'forms\''), 'deep-link actions switch to Tasks tab');
  assert.ok(panelSource.includes('setExpandedTaskIds(prev => ({ ...prev, [deepLinkTarget.taskId]: true }))'), 'deep-link expands linked task');

  assert.ok(panelSource.includes('Complete Form'), 'requirement action label: Complete Form');
  assert.ok(panelSource.includes('Upload Supporting Evidence'), 'requirement action label: Upload Supporting Evidence');
  assert.ok(panelSource.includes('Request Signature'), 'requirement action label: Request Signature');
  assert.ok(panelSource.includes('Review Package'), 'requirement action label: Review Package');
  assert.ok(panelSource.includes('Certify Package'), 'requirement action label: Certify Package');
  assert.ok(panelSource.includes('Lock Package'), 'requirement action label: Lock Package');
  assert.ok(panelSource.includes('View Audit Trail'), 'requirement action label: View Audit Trail');

  console.log('PASS: tab labels remain task-first/simplified');
  console.log('PASS: non-task tabs include task-first guidance copy');
  console.log('PASS: task rows expose completion/readiness/missing metrics');
  console.log('PASS: evidence upload routes include task-linked identifiers');
  console.log('PASS: linked actions route to task context');
  console.log('PASS: requirement action labels are user-facing');
}

main();
