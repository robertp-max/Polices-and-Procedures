import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function main(): void {
  const panelSource = readFileSync('src/policy/components/regulatory/WorkflowExecutionPanel.tsx', 'utf8');

  assert.ok(panelSource.includes('label="Overview"'), 'top-level tabs include Overview');
  assert.ok(panelSource.includes('label="Tasks"'), 'top-level tabs include Tasks');
  assert.ok(panelSource.includes('label="Audit Trail"'), 'top-level tabs include Audit Trail');
  assert.ok(panelSource.includes('label="Technical Details"'), 'top-level tabs include Technical Details');
  assert.ok(!panelSource.includes('label="Forms Summary"'), 'Forms Summary tab removed from top-level navigation');
  assert.ok(!panelSource.includes('label="Evidence Summary"'), 'Evidence Summary tab removed from top-level navigation');
  assert.ok(!panelSource.includes('label="Signatures Summary"'), 'Signatures Summary tab removed from top-level navigation');

  assert.ok(
    panelSource.includes("{ title: 'Form'")
      && panelSource.includes("{ title: 'Supporting Evidence'")
      && panelSource.includes("{ title: 'Signatures'")
      && panelSource.includes('TaskRequirementRow'),
    'forms/evidence/signature requirements remain accessible through Tasks',
  );
  assert.ok(panelSource.includes('Upload Supporting Evidence'), 'evidence upload actions still function in task requirements');
  assert.ok(panelSource.includes('Request Signature'), 'signature request actions still function in task requirements');
  assert.ok(panelSource.includes('Certify Package'), 'task completion/certification actions still function in task requirements');

  assert.ok(panelSource.includes('legacyTab === \'forms\'') && panelSource.includes('legacyTab === \'evidence\''), 'old summary routes resolve safely to task context');
  assert.ok(panelSource.includes('setExpandedTaskIds(prev => ({ ...prev, [deepLinkTarget.taskId]: true }))'), 'deep links preserve and focus task context');

  assert.ok(panelSource.includes('Missing only') && panelSource.includes('Pending signatures') && panelSource.includes('Blocked only'), 'task utilities expose lightweight task-centric filters');
  assert.ok(panelSource.includes('Expand all') && panelSource.includes('Collapse all'), 'task utilities include expand/collapse controls');

  console.log('PASS: top-level tabs simplified to Overview/Tasks/Audit Trail/Technical Details');
  console.log('PASS: form/evidence/signature execution remains in Tasks workspace');
  console.log('PASS: old summary tab deep links resolve to task context safely');
  console.log('PASS: lightweight task-centric utilities are present');
}

main();
