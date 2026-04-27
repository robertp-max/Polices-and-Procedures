/* ─────────────────────────────────────────────────────────────────
   verifyAlignment.ts — CES end-to-end alignment guard.

   Runs deterministic structural checks proving every recurring /
   mandated piece of work in the system resolves to the canonical
   chain:

     policy_id  →  workflow_id  →  event_id  →  artifact_ids[]

   Plus the hard scheduling rules:

     • No recurring/mandated event lands on Sat or Sun
       (override: event.isWeekendAllowed === true).
     • Every workflow declares a `workflowType`
       (audit | operational | enforcement | intake | aggregate).
     • Every event with a `policyRefs[]` entry references a real
       policy ID and a real workflow.

   Exits non-zero when any rule is violated so the script is safe to
   wire into CI / pre-commit. Prints a concise per-rule report.
   ──────────────────────────────────────────────────────────────── */

import { REGULATORY_EVENTS, isWeekend, type RegulatoryEvent } from
  '../src/policy/data/regulatoryEvents';
import { WORKFLOWS } from '../src/policy/data/workflows.generated';
import {
  buildWorkflowAlignedExecution,
  executionUnitId,
  isValidStoryPoints,
} from '../src/policy/data/eventWorkflowAlignment';

interface Finding {
  rule: string;
  id:   string;
  detail: string;
}

const findings: Finding[] = [];

const recurringCadences = new Set([
  'Monthly', 'Quarterly', 'Annual', 'Semiannual', 'Biennial',
  'Triennial', 'Weekly', 'Biweekly',
]);

function isRecurring(e: RegulatoryEvent): boolean {
  return recurringCadences.has(e.cadence);
}

/* ─── Rule 1: weekend guard on every recurring event ──────────── */
for (const e of REGULATORY_EVENTS) {
  if (!isRecurring(e)) continue;
  if (e.isWeekendAllowed) continue;
  if (isWeekend(e.date)) {
    findings.push({
      rule:   'WEEKEND_ON_RECURRING',
      id:     e.id,
      detail: `${e.title} (${e.cadence}) anchored on ${e.date} (weekend) without isWeekendAllowed override`,
    });
  }
}

/* ─── Rule 2: every event resolves to ≥1 policy reference ─────── */
for (const e of REGULATORY_EVENTS) {
  if (e.isContext) continue; // holidays / context markers excluded
  if (!e.policyRefs || e.policyRefs.length === 0) {
    findings.push({
      rule:   'EVENT_MISSING_POLICY_REF',
      id:     e.id,
      detail: `${e.title} declares no policyRefs[]`,
    });
  }
}

/* ─── Rule 3: every workflow declares workflowType ─────────────── */
for (const wf of Object.values(WORKFLOWS)) {
  if (!wf.workflowType) {
    findings.push({
      rule:   'WORKFLOW_MISSING_TYPE',
      id:     wf.id,
      detail: `${wf.title} (${wf.sourcePath}) has no workflowType classification`,
    });
  }
}

/* ─── Rule 4: every workflow references ≥1 policy ──────────────── */
for (const wf of Object.values(WORKFLOWS)) {
  if (!wf.policyRefs || wf.policyRefs.length === 0) {
    findings.push({
      rule:   'WORKFLOW_MISSING_POLICY_REF',
      id:     wf.id,
      detail: `${wf.title} resolves no policy IDs`,
    });
  }
}

/* ─── Rule 5: every workflow lists ≥1 required form (evidence) ── */
for (const wf of Object.values(WORKFLOWS)) {
  if (wf.workflowType === 'aggregate') continue; // QAPI consumes; may not produce
  if (!wf.requiredForms || wf.requiredForms.length === 0) {
    findings.push({
      rule:   'WORKFLOW_MISSING_EVIDENCE',
      id:     wf.id,
      detail: `${wf.title} declares no requiredForms[] (no evidence artifact)`,
    });
  }
}

/* ─── Rule 6: no executable drift without workflow or exception ── */
for (const e of REGULATORY_EVENTS) {
  const hasProcessFlow = e.processFlow.length > 0;
  const hasRequiredForms = e.requiredForms.length > 0;

  if (!e.workflowId && hasProcessFlow && !e.alignmentException) {
    findings.push({
      rule:   'EVENT_FLOW_WITHOUT_WORKFLOW',
      id:     e.id,
      detail: `${e.title} has processFlow but no workflowId and no alignmentException`,
    });
  }

  if (!e.workflowId && hasRequiredForms && !e.alignmentException) {
    findings.push({
      rule:   'EVENT_FORMS_WITHOUT_WORKFLOW',
      id:     e.id,
      detail: `${e.title} has requiredForms but no workflowId and no alignmentException`,
    });
  }

  if (e.alignmentException && !e.alignmentExceptionReason) {
    findings.push({
      rule:   'ALIGNMENT_EXCEPTION_MISSING_REASON',
      id:     e.id,
      detail: `${e.title} sets alignmentException=true but has no alignmentExceptionReason`,
    });
  }
}

/* ─── Rule 7: every execution step has id/storyPoints/sourceType ─ */
for (const e of REGULATORY_EVENTS) {
  for (let i = 0; i < e.processFlow.length; i++) {
    const step = e.processFlow[i]!;
    const expectedId = executionUnitId(e.id, i + 1);

    if (step.id !== expectedId) {
      findings.push({
        rule:   'EVENT_STEP_ID_FORMAT_MISMATCH',
        id:     e.id,
        detail: `step #${i + 1} id="${step.id}" expected "${expectedId}"`,
      });
    }

    if (!isValidStoryPoints(step.storyPoints)) {
      findings.push({
        rule:   'EVENT_STEP_STORY_POINTS_INVALID',
        id:     e.id,
        detail: `step #${i + 1} has invalid storyPoints="${String(step.storyPoints)}" (allowed: 1,2,3,5,8)`,
      });
    }

    if (step.sourceType !== 'workflow_derived' && step.sourceType !== 'event_authored_exception') {
      findings.push({
        rule:   'EVENT_STEP_SOURCE_MISSING',
        id:     e.id,
        detail: `step #${i + 1} is missing sourceType marker`,
      });
    }
  }
}

/* ─── Rule 8: workflow→event 1:1 step and forms alignment ─────── */
for (const e of REGULATORY_EVENTS) {
  if (!e.workflowId) continue;
  const wf = WORKFLOWS[e.workflowId];
  if (!wf) {
    findings.push({
      rule:   'EVENT_WORKFLOW_UNKNOWN',
      id:     e.id,
      detail: `${e.title} → workflowId="${e.workflowId}" not found in WORKFLOWS`,
    });
    continue;
  }
  const aligned = buildWorkflowAlignedExecution(e.id, e.workflowId);
  if (!aligned) continue;
  if (e.processFlow.length !== wf.steps.length) {
    findings.push({
      rule:   'EVENT_STEP_COUNT_MISMATCH',
      id:     e.id,
      detail: `${e.title} → ${e.workflowId}: event has ${e.processFlow.length} steps, workflow has ${wf.steps.length}`,
    });
  }

  if (e.requiredForms.length !== aligned.requiredForms.length) {
    findings.push({
      rule:   'EVENT_REQUIRED_FORMS_COUNT_MISMATCH',
      id:     e.id,
      detail: `${e.title} → ${e.workflowId}: event has ${e.requiredForms.length} requiredForms, derived has ${aligned.requiredForms.length}`,
    });
  }

  const eventFormIds = new Set(e.requiredForms.map((f) => f.formId || f.id));
  const alignedFormIds = new Set(aligned.requiredForms.map((f) => f.formId || f.id));
  for (const fid of alignedFormIds) {
    if (!eventFormIds.has(fid)) {
      findings.push({
        rule:   'EVENT_REQUIRED_FORM_MISMATCH',
        id:     e.id,
        detail: `${e.title} → ${e.workflowId}: missing derived form ${fid}`,
      });
      break;
    }
  }

  for (let i = 0; i < wf.steps.length; i++) {
    const expectedId = executionUnitId(e.id, wf.steps[i]!.order);
    if (e.processFlow[i]?.id !== expectedId) {
      findings.push({
        rule:   'EVENT_STEP_ID_MISMATCH',
        id:     e.id,
        detail: `step #${i + 1} id="${e.processFlow[i]?.id}" expected "${expectedId}"`,
      });
      break; // first mismatch is enough
    }
  }
}

/* ─── Report ──────────────────────────────────────────────────── */
const byRule = new Map<string, Finding[]>();
for (const f of findings) {
  const list = byRule.get(f.rule) ?? [];
  list.push(f);
  byRule.set(f.rule, list);
}

const eventCount = REGULATORY_EVENTS.length;
const wfCount    = Object.keys(WORKFLOWS).length;

console.log('═══════════════════════════════════════════════════════');
console.log(' CES ALIGNMENT VERIFIER');
console.log('═══════════════════════════════════════════════════════');
console.log(` Events  scanned: ${eventCount}`);
console.log(` Workflows scanned: ${wfCount}`);
console.log(` Findings: ${findings.length}`);
console.log('───────────────────────────────────────────────────────');

if (findings.length === 0) {
  console.log(' ✓ 100% alignment — no findings.');
  process.exit(0);
}

for (const [rule, items] of byRule) {
  console.log(`\n[${rule}] (${items.length})`);
  for (const f of items.slice(0, 25)) {
    console.log(`  • ${f.id} — ${f.detail}`);
  }
  if (items.length > 25) console.log(`  … and ${items.length - 25} more`);
}

console.log('\n✗ Alignment failed. Resolve findings above.');
process.exit(1);
