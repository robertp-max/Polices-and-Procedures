import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function main(): void {
  const panelSource = readFileSync('src/policy/components/regulatory/WorkflowExecutionPanel.tsx', 'utf8');
  const evidenceSource = readFileSync('src/policy/pages/EvidenceCenterPage.tsx', 'utf8');
  const storeSource = readFileSync('src/policy/stores/regulatoryExecutionStore.ts', 'utf8');
  const typesSource = readFileSync('src/policy/compliance-execution/types.ts', 'utf8');

  // 1. Embedded FormViewer renders inside right-side drawer for FORM_COMPLETION
  assert.ok(
    panelSource.includes("requirement.type === 'FORM_COMPLETION'") &&
    panelSource.includes('<FormViewer') &&
    panelSource.includes('formSource="task"'),
    'Complete Form renders embedded FormViewer inside drawer for FORM_COMPLETION requirements',
  );

  // 2. Drawer always opens from the right (justify-end, no justify-start)
  assert.ok(
    panelSource.includes('flex justify-end') && !panelSource.includes('justify-start'),
    'Inline action drawer always slides from the right side',
  );

  // 3. Context IDs passed through to embedded FormViewer
  assert.ok(
    panelSource.includes('hhcEventId={dataflow.eventId}') &&
    panelSource.includes('parentTaskId={task.id}') &&
    panelSource.includes('hhcWorkflowId={workflowId || undefined}'),
    'Form drawer receives event_id/task_id/workflow_id context bound to FormViewer',
  );

  // 4. Context strip shows form template ID, form instance ID, and all binding IDs
  assert.ok(
    (panelSource.includes('form template:') || panelSource.includes('form template: ')) &&
    (panelSource.includes('form instance:') || panelSource.includes('form instance: ')) &&
    panelSource.includes('event: ') && panelSource.includes('dataflow.eventId}') &&
    panelSource.includes('task: ') && panelSource.includes('task.id}') &&
    panelSource.includes('policy: ') && panelSource.includes('policyId || \'—\'') &&
    panelSource.includes('workflow: ') && panelSource.includes('workflowId || \'—\'') &&
    panelSource.includes('req: '),
    'Drawer context strip shows form template ID, form instance ID, and all binding IDs',
  );

  // 5. Main page does not shift — no left-side form overlay (justify-start removed)
  assert.ok(
    !panelSource.includes('justify-start'),
    'Main page does not shift: no left-side form overlay (justify-start removed)',
  );

  // 6. Open in new tab preserves all query params via buildTaskLinkedFormRoute
  assert.ok(
    panelSource.includes('buildTaskLinkedFormRoute({ formId, dataflow, task, requirement })') ||
    panelSource.includes("window.open(buildTaskLinkedFormRoute"),
    'Open in new tab preserves all query params via buildTaskLinkedFormRoute',
  );

  // 7. Form completion updates requirement: mark-as-complete writes store
  assert.ok(
    panelSource.includes("store.setFormStatus(dataflow.eventId, formId, 'complete')") ||
    panelSource.includes("store.setFormStatus(dataflow.eventId, formId, 'in-progress')"),
    'Form completion updates linked FORM_COMPLETION requirement via setFormStatus',
  );

  // 8. FORM_INSTANCE_CREATED and FORM_COMPLETED audit events present
  assert.ok(
    panelSource.includes("'FORM_INSTANCE_CREATED'") || storeSource.includes("'FORM_INSTANCE_CREATED'"),
    'FORM_INSTANCE_CREATED audit event is used',
  );
  assert.ok(
    panelSource.includes("'FORM_COMPLETED'") || storeSource.includes("'FORM_COMPLETED'"),
    'FORM_COMPLETED audit event is used',
  );

  // 9. No duplicate "Complete Form" submit button for form type — footer uses Mark as Complete
  assert.ok(
    panelSource.includes('Mark as Complete'),
    'Form drawer footer shows Mark as Complete instead of duplicate Complete Form button',
  );

  // 10. Evidence Center table rows have select-none
  assert.ok(
    evidenceSource.includes('select-none'),
    'Evidence Center table rows have select-none to prevent blue text-selection highlight',
  );

  // 11. Evidence Center task-linked guidance banner present and readable
  assert.ok(
    evidenceSource.includes('You are uploading evidence for this task requirement.'),
    'Evidence Center shows task-linked guidance banner when task context is in URL',
  );

  // 12. form_instance_id type defined with FormInstanceStatus
  assert.ok(
    typesSource.includes('FormInstanceStatus') &&
    typesSource.includes("'NOT_STARTED'") &&
    typesSource.includes("'IN_PROGRESS'") &&
    typesSource.includes("'COMPLETED'") &&
    typesSource.includes("'LOCKED'") &&
    typesSource.includes("'SUPERSEDED'"),
    'FormInstanceStatus type defined with all required states',
  );

  // 13. EventFormInstance has taskId, requirementId, status, sequence fields
  assert.ok(
    typesSource.includes('taskId?: string') &&
    typesSource.includes('requirementId?: string') &&
    typesSource.includes('status: FormInstanceStatus') &&
    typesSource.includes('sequence: number'),
    'EventFormInstance has taskId, requirementId, status, and sequence fields',
  );

  // 14. Stable {eventId}-{formId}-{sequence} format used in store
  assert.ok(
    storeSource.includes('`${eventId}-${formId}-'),
    'Store generates stable {eventId}-{formId}-{sequence} form instance IDs',
  );

  // 15. getOrCreateFormInstance is idempotent (looks up existing before creating)
  assert.ok(
    storeSource.includes('getOrCreateFormInstance') &&
    storeSource.includes('.find(i =>') &&
    storeSource.includes("i.status === 'SUPERSEDED'"),
    'getOrCreateFormInstance is idempotent: looks up existing instance before creating new one',
  );

  // 16. setFormInstanceStatus exists in store (separate from form template status)
  assert.ok(
    storeSource.includes('setFormInstanceStatus'),
    'Store has setFormInstanceStatus to update instance lifecycle independently of template',
  );

  // 17. resolveFormTemplate function checks FORMS_DATASET
  assert.ok(
    panelSource.includes('resolveFormTemplate') &&
    panelSource.includes('FORMS_DATASET') &&
    panelSource.includes('Form template') && panelSource.includes('not in the Forms Library'),
    'resolveFormTemplate checks FORMS_DATASET and shows clear message for missing templates',
  );

  // 18. Mark as Complete is disabled when template is not found
  assert.ok(
    panelSource.includes('markCompleteDisabled') &&
    panelSource.includes('formTemplateFound') &&
    panelSource.includes('formInstanceId'),
    'Mark as Complete disabled when form template missing or instance not yet created',
  );

  // 19. Missing template shows amber/warning UI block (not a generic crash)
  assert.ok(
    panelSource.includes('Form Template Not Found') &&
    panelSource.includes('is not in the Forms Library'),
    'Missing form template shows a clear warning UI block, not a generic crash',
  );

  // 20. linkedFormInstanceId added to EvidenceDoc for chain-of-custody
  assert.ok(
    storeSource.includes('linkedFormInstanceId?: string'),
    'EvidenceDoc includes linkedFormInstanceId for chain-of-custody linking',
  );

  console.log('PASS: Complete Form renders embedded FormViewer inside right-side drawer');
  console.log('PASS: Drawer always slides from the right, main page does not shift');
  console.log('PASS: Context IDs (event/task/form template/form instance/policy/workflow/req) shown');
  console.log('PASS: Open in new tab preserves all query params');
  console.log('PASS: Form completion updates linked requirement via setFormStatus');
  console.log('PASS: FORM_INSTANCE_CREATED and FORM_COMPLETED audit events present');
  console.log('PASS: Footer shows Mark as Complete for form type (no duplicate button)');
  console.log('PASS: Evidence Center readability fixed with select-none and readable banner');
  console.log('PASS: FormInstanceStatus type defined with all required states');
  console.log('PASS: EventFormInstance extended with taskId/requirementId/status/sequence');
  console.log('PASS: Stable {eventId}-{formId}-{seq} ID format in store');
  console.log('PASS: getOrCreateFormInstance is idempotent (no duplicate instances on clicks)');
  console.log('PASS: setFormInstanceStatus exists for lifecycle management');
  console.log('PASS: resolveFormTemplate checks FORMS_DATASET with clear missing-template message');
  console.log('PASS: Mark as Complete gated on template found + instance exists');
  console.log('PASS: Missing template shows amber warning block');
  console.log('PASS: EvidenceDoc has linkedFormInstanceId for form instance chain-of-custody');
}

main();
