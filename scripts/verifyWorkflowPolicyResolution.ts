import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { WORKFLOW_LIST, WORKFLOWS } from '../src/policy/data/workflows.generated';
import {
  resolveWorkflowPolicyRefs,
  summarizeWorkflowPolicyResolutions,
} from '../src/policy/workflows/utils/resolveWorkflowPolicyRefs';

const formIds = new Set(FORMS_DATASET.map(form => form.id));
const resolutions = WORKFLOW_LIST.map(workflow => ({
  workflow,
  resolution: resolveWorkflowPolicyRefs(workflow),
}));
const summary = summarizeWorkflowPolicyResolutions(WORKFLOW_LIST);
const clWf26 = WORKFLOWS['CL-WF-26'];
const clWf26Resolution = clWf26 ? resolveWorkflowPolicyRefs(clWf26) : null;

const effectivePolicyRefs = resolutions.flatMap(({ workflow, resolution }) =>
  resolution.effectivePolicyRefs.map(ref => ({
    workflowId: workflow.id,
    policyId: ref.policyId,
  })),
);
const clPaEffectiveRefs = effectivePolicyRefs.filter(ref => ref.policyId.startsWith('CL-PA-'));
const formIdsInEffectiveRefs = effectivePolicyRefs.filter(ref => formIds.has(ref.policyId));
const workflowsWithValidDirectRefs = resolutions.filter(({ resolution }) =>
  resolution.resolvedDirectPolicyRefs.length > 0,
);
const hiddenLegacyRefs = resolutions.flatMap(({ workflow, resolution }) =>
  resolution.hiddenLegacyPolicyRefs.map(ref => ({
    workflowId: workflow.id,
    workflowTitle: workflow.title,
    policyId: ref.policyId,
    titleOrConcept: ref.titleOrConcept,
    reasonHidden: ref.reasonHidden,
    candidateReplacement: ref.candidateReplacement ?? null,
    needsSmeReview: ref.needsSmeReview,
  })),
);

const clWf26SourceForms = clWf26Resolution
  ? Array.from(new Set(clWf26Resolution.effectivePolicyRefs.flatMap(ref => ref.sourceForms))).sort()
  : [];
const clWf26HiddenPolicyIds = clWf26Resolution?.hiddenLegacyPolicyRefs.map(ref => ref.policyId) ?? [];
const clWf26EffectivePolicyIds = clWf26Resolution?.effectivePolicyRefs.map(ref => ref.policyId) ?? [];

const failures: string[] = [];
if (!clWf26 || !clWf26Resolution) {
  failures.push('CL-WF-26 was not found.');
} else {
  for (const expectedHidden of ['CL-PA-005', 'CL-PA-007']) {
    if (!clWf26HiddenPolicyIds.includes(expectedHidden)) {
      failures.push(`CL-WF-26 did not hide ${expectedHidden}.`);
    }
  }
  for (const stalePolicyId of ['CL-PA-005', 'CL-PA-007']) {
    if (clWf26EffectivePolicyIds.includes(stalePolicyId)) {
      failures.push(`CL-WF-26 still displays ${stalePolicyId}.`);
    }
  }
  if (clWf26EffectivePolicyIds.length === 0) {
    failures.push('CL-WF-26 has no effective policy refs.');
  }
}
if (clPaEffectiveRefs.length > 0) {
  failures.push(`Effective workflow policy refs still include CL-PA IDs: ${clPaEffectiveRefs.length}.`);
}
if (formIdsInEffectiveRefs.length > 0) {
  failures.push(`Effective workflow policy refs still include form IDs: ${formIdsInEffectiveRefs.length}.`);
}
if (workflowsWithValidDirectRefs.length === 0) {
  failures.push('No valid direct policy refs were preserved.');
}
if (hiddenLegacyRefs.length === 0) {
  failures.push('No hidden legacy refs were reported for diagnostics.');
}

const report = {
  summary,
  clWf26: clWf26Resolution
    ? {
        rawDirectPolicyRefs: clWf26.policyRefs,
        hiddenLegacyPolicyRefs: clWf26Resolution.hiddenLegacyPolicyRefs.map(ref => ({
          policyId: ref.policyId,
          titleOrConcept: ref.titleOrConcept,
          reasonHidden: ref.reasonHidden,
          candidateReplacement: ref.candidateReplacement ?? null,
          needsSmeReview: ref.needsSmeReview,
        })),
        displayedEffectivePolicyRefs: clWf26Resolution.effectivePolicyRefs.map(ref => ({
          policyId: ref.policyId,
          title: ref.title,
          source: ref.source,
          sourceForms: ref.sourceForms,
        })),
        sourceFormsUsed: clWf26SourceForms,
        unresolvedFormPolicyRefs: clWf26Resolution.unresolvedFormPolicyRefs,
      }
    : null,
  globalValidation: {
    clPaEffectiveRefs,
    formIdsInEffectiveRefs,
    workflowsWithValidDirectRefs: workflowsWithValidDirectRefs.length,
    hiddenLegacyRefsAvailable: hiddenLegacyRefs.length,
    unresolvedFormPolicyRefs: summary.unresolvedFormPolicyRefs,
  },
  hiddenLegacyDiagnosticsSample: hiddenLegacyRefs.slice(0, 25),
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
