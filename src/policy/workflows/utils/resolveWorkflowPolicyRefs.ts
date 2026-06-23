import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { getCorpusPolicy, POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import type { Workflow, WorkflowStep } from '@/policy/types/workflow';

export type EffectivePolicyRefSource = 'direct' | 'derived_from_form' | 'both';

export interface EffectivePolicyRef {
  policyId: string;
  title: string;
  source: EffectivePolicyRefSource;
  sourceForms: string[];
  sourceSteps: string[];
  isResolved: true;
}

export interface HiddenLegacyPolicyRef {
  policyId: string;
  titleOrConcept: string;
  reasonHidden: 'not_found_in_canonical_policy_corpus' | 'policy_id_matches_form_id' | 'not_policy_id';
  sourceWorkflowId: string;
  sourceWorkflowTitle: string;
  sourceFileOrGeneratedSource: string;
  candidateReplacement?: string;
  needsSmeReview: boolean;
  sourceSteps: string[];
}

export interface WorkflowPolicyResolution {
  effectivePolicyRefs: EffectivePolicyRef[];
  resolvedDirectPolicyRefs: EffectivePolicyRef[];
  derivedPolicyRefsFromForms: EffectivePolicyRef[];
  hiddenLegacyPolicyRefs: HiddenLegacyPolicyRef[];
  unresolvedFormPolicyRefs: string[];
}

export interface ResolveWorkflowPolicyRefsOptions {
  additionalDirectPolicyRefs?: readonly string[];
  additionalFormIds?: readonly string[];
  sourceFileOrGeneratedSource?: string;
}

export interface WorkflowPolicyResolutionSummary {
  workflowsScanned: number;
  rawPolicyRefs: number;
  hiddenUnresolvedRefs: number;
  formDerivedRefs: number;
  finalEffectiveRefs: number;
  unresolvedFormPolicyRefs: number;
  workflowsWithHiddenRefs: number;
}

type WorkflowPolicyStepLike = Partial<WorkflowStep> & {
  id?: string;
  policyRefs?: readonly string[];
  policyReferences?: readonly string[];
};

type WorkflowPolicySource = Pick<
  Workflow,
  'id' | 'title' | 'sourcePath' | 'policyRefs' | 'policyReferences' | 'requiredForms' | 'steps'
>;

type EventPolicySource = {
  id: string;
  title: string;
  workflowId?: string;
  policyRefs?: readonly string[];
  requiredForms?: ReadonlyArray<string | { id?: string; formId?: string }>;
  processFlow?: ReadonlyArray<{ id?: string; requiredFormIds?: readonly string[] }>;
};

const POLICY_ID_RE = /^[A-Z]{2,3}-[A-Z0-9]{2,4}-\d{3}$/;
const POLICY_IDS = new Set(POLICY_CORPUS.map(policy => policy.id));
const FORMS_BY_ID = new Map(FORMS_DATASET.map(form => [form.id, form]));
const FORM_IDS = new Set(FORMS_DATASET.map(form => form.id));

function normalizeRef(value: string | undefined | null): string {
  return String(value ?? '').trim().toUpperCase();
}

function isPolicyLikeId(policyId: string): boolean {
  return POLICY_ID_RE.test(policyId);
}

function displayValidationFailure(policyId: string): HiddenLegacyPolicyRef['reasonHidden'] | null {
  if (!isPolicyLikeId(policyId)) return 'not_policy_id';
  if (!POLICY_IDS.has(policyId)) return 'not_found_in_canonical_policy_corpus';
  if (FORM_IDS.has(policyId)) return 'policy_id_matches_form_id';
  return null;
}

function sourceLabelForStep(step: WorkflowPolicyStepLike): string {
  if (typeof step.order === 'number') return `step ${step.order}`;
  if (typeof step.id === 'string' && step.id.trim()) return step.id.trim();
  return 'step';
}

function extractPolicyIdsFromText(value: string): string[] {
  return Array.from(value.matchAll(/[A-Z]{2,3}-[A-Z0-9]{2,4}-\d{3}/g)).map(match => match[0]);
}

function addToSetMap(map: Map<string, Set<string>>, key: string, value: string): void {
  const existing = map.get(key);
  if (existing) {
    existing.add(value);
    return;
  }
  map.set(key, new Set([value]));
}

function sorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function titleOrConcept(policyId: string, policyReferences: readonly string[]): string {
  const upperPolicyId = policyId.toUpperCase();
  for (const line of policyReferences) {
    const index = line.toUpperCase().indexOf(upperPolicyId);
    if (index < 0) continue;
    const after = line
      .slice(index + policyId.length)
      .replace(/^[\s:;,\-()]+/, '')
      .split(/[;,|]/)[0]
      .trim();
    return after || policyId;
  }
  return policyId;
}

function collectAssociatedFormIds(
  workflow: WorkflowPolicySource,
  additionalFormIds: readonly string[] = [],
): { formIds: string[]; sourceStepsByForm: Map<string, Set<string>> } {
  const formIds = new Set<string>();
  const sourceStepsByForm = new Map<string, Set<string>>();

  for (const formId of workflow.requiredForms ?? []) {
    const normalized = normalizeRef(formId);
    if (normalized) formIds.add(normalized);
  }

  for (const step of workflow.steps ?? []) {
    const sourceStep = sourceLabelForStep(step as WorkflowPolicyStepLike);
    for (const formId of step.formIds ?? []) {
      const normalized = normalizeRef(formId);
      if (!normalized) continue;
      formIds.add(normalized);
      addToSetMap(sourceStepsByForm, normalized, sourceStep);
    }
  }

  for (const formId of additionalFormIds) {
    const normalized = normalizeRef(formId);
    if (normalized) formIds.add(normalized);
  }

  return { formIds: sorted(formIds), sourceStepsByForm };
}

function collectDirectRefs(
  workflow: WorkflowPolicySource,
  additionalDirectPolicyRefs: readonly string[] = [],
): { refs: string[]; sourceStepsByPolicy: Map<string, Set<string>> } {
  const refs = new Set<string>();
  const sourceStepsByPolicy = new Map<string, Set<string>>();

  for (const ref of workflow.policyRefs ?? []) {
    const normalized = normalizeRef(ref);
    if (normalized) refs.add(normalized);
  }

  for (const step of workflow.steps ?? []) {
    const stepLike = step as WorkflowPolicyStepLike;
    const sourceStep = sourceLabelForStep(stepLike);
    for (const ref of stepLike.policyRefs ?? []) {
      const normalized = normalizeRef(ref);
      if (!normalized) continue;
      refs.add(normalized);
      addToSetMap(sourceStepsByPolicy, normalized, sourceStep);
    }
    for (const rawLine of stepLike.policyReferences ?? []) {
      for (const ref of extractPolicyIdsFromText(rawLine)) {
        const normalized = normalizeRef(ref);
        if (!normalized) continue;
        refs.add(normalized);
        addToSetMap(sourceStepsByPolicy, normalized, sourceStep);
      }
    }
  }

  for (const ref of additionalDirectPolicyRefs) {
    const normalized = normalizeRef(ref);
    if (normalized) refs.add(normalized);
  }

  return { refs: sorted(refs), sourceStepsByPolicy };
}

function toEffectiveRef(
  policyId: string,
  source: EffectivePolicyRefSource,
  sourceForms: Iterable<string>,
  sourceSteps: Iterable<string>,
): EffectivePolicyRef {
  const policy = getCorpusPolicy(policyId);
  return {
    policyId,
    title: policy?.title ?? policyId,
    source,
    sourceForms: sorted(sourceForms),
    sourceSteps: sorted(sourceSteps),
    isResolved: true,
  };
}

function mergeEffectiveRef(
  refsById: Map<string, EffectivePolicyRef>,
  policyId: string,
  source: 'direct' | 'derived_from_form',
  sourceForms: Iterable<string>,
  sourceSteps: Iterable<string>,
): void {
  const current = refsById.get(policyId);
  if (!current) {
    refsById.set(policyId, toEffectiveRef(policyId, source, sourceForms, sourceSteps));
    return;
  }
  refsById.set(policyId, {
    ...current,
    source: current.source === source ? source : 'both',
    sourceForms: sorted([...current.sourceForms, ...sourceForms]),
    sourceSteps: sorted([...current.sourceSteps, ...sourceSteps]),
  });
}

function resolveWorkflowPolicySource(
  workflow: WorkflowPolicySource,
  options: ResolveWorkflowPolicyRefsOptions = {},
): WorkflowPolicyResolution {
  const sourceFileOrGeneratedSource =
    options.sourceFileOrGeneratedSource ??
    workflow.sourcePath ??
    'generated workflow data';
  const policyReferences = workflow.policyReferences ?? [];

  const direct = collectDirectRefs(workflow, options.additionalDirectPolicyRefs);
  const forms = collectAssociatedFormIds(workflow, options.additionalFormIds);
  const effectiveRefsById = new Map<string, EffectivePolicyRef>();
  const hiddenLegacyPolicyRefs: HiddenLegacyPolicyRef[] = [];
  const unresolvedFormPolicyRefs = new Set<string>();
  const directResolvedIds = new Set<string>();
  const formDerivedResolvedIds = new Set<string>();

  for (const policyId of direct.refs) {
    const failure = displayValidationFailure(policyId);
    if (failure) {
      hiddenLegacyPolicyRefs.push({
        policyId,
        titleOrConcept: titleOrConcept(policyId, policyReferences),
        reasonHidden: failure,
        sourceWorkflowId: workflow.id,
        sourceWorkflowTitle: workflow.title,
        sourceFileOrGeneratedSource,
        needsSmeReview: true,
        sourceSteps: sorted(direct.sourceStepsByPolicy.get(policyId) ?? []),
      });
      continue;
    }

    directResolvedIds.add(policyId);
    mergeEffectiveRef(
      effectiveRefsById,
      policyId,
      'direct',
      [],
      direct.sourceStepsByPolicy.get(policyId) ?? [],
    );
  }

  for (const formId of forms.formIds) {
    const form = FORMS_BY_ID.get(formId);
    if (!form) continue;

    for (const rawPolicyId of form.policies) {
      const policyId = normalizeRef(rawPolicyId);
      if (!policyId) continue;

      const failure = displayValidationFailure(policyId);
      if (failure) {
        unresolvedFormPolicyRefs.add(policyId);
        continue;
      }

      formDerivedResolvedIds.add(policyId);
      mergeEffectiveRef(
        effectiveRefsById,
        policyId,
        'derived_from_form',
        [formId],
        forms.sourceStepsByForm.get(formId) ?? [],
      );
    }
  }

  const effectivePolicyRefs = Array.from(effectiveRefsById.values())
    .sort((a, b) => a.policyId.localeCompare(b.policyId));

  return {
    effectivePolicyRefs,
    resolvedDirectPolicyRefs: effectivePolicyRefs.filter(ref => directResolvedIds.has(ref.policyId)),
    derivedPolicyRefsFromForms: effectivePolicyRefs.filter(ref => formDerivedResolvedIds.has(ref.policyId)),
    hiddenLegacyPolicyRefs: hiddenLegacyPolicyRefs.sort((a, b) => a.policyId.localeCompare(b.policyId)),
    unresolvedFormPolicyRefs: sorted(unresolvedFormPolicyRefs),
  };
}

export function resolveWorkflowPolicyRefs(
  workflow: Workflow,
  options: ResolveWorkflowPolicyRefsOptions = {},
): WorkflowPolicyResolution {
  return resolveWorkflowPolicySource(workflow, options);
}

export function resolveEventPolicyRefs(event: EventPolicySource): WorkflowPolicyResolution {
  const workflow = event.workflowId ? WORKFLOWS[event.workflowId] : undefined;
  const eventFormIds = new Set<string>();

  for (const form of event.requiredForms ?? []) {
    const formId = typeof form === 'string' ? form : form.formId ?? form.id;
    const normalized = normalizeRef(formId);
    if (normalized) eventFormIds.add(normalized);
  }

  for (const step of event.processFlow ?? []) {
    for (const formId of step.requiredFormIds ?? []) {
      const normalized = normalizeRef(formId);
      if (normalized) eventFormIds.add(normalized);
    }
  }

  if (workflow) {
    return resolveWorkflowPolicySource(workflow, {
      additionalDirectPolicyRefs: event.policyRefs ?? [],
      additionalFormIds: sorted(eventFormIds),
      sourceFileOrGeneratedSource: `${workflow.sourcePath} + event:${event.id}`,
    });
  }

  return resolveWorkflowPolicySource({
    id: event.id,
    title: event.title,
    sourcePath: `event:${event.id}`,
    policyRefs: [...(event.policyRefs ?? [])],
    policyReferences: [...(event.policyRefs ?? [])],
    requiredForms: sorted(eventFormIds),
    steps: [],
  });
}

export function workflowsByEffectivePolicy(policyId: string): string[] {
  const normalized = normalizeRef(policyId);
  if (!normalized) return [];
  return Object.values(WORKFLOWS)
    .filter(workflow => resolveWorkflowPolicyRefs(workflow).effectivePolicyRefs.some(ref => ref.policyId === normalized))
    .map(workflow => workflow.id)
    .sort((a, b) => a.localeCompare(b));
}

export function summarizeWorkflowPolicyResolutions(
  workflows: readonly Workflow[],
): WorkflowPolicyResolutionSummary {
  const summary: WorkflowPolicyResolutionSummary = {
    workflowsScanned: workflows.length,
    rawPolicyRefs: 0,
    hiddenUnresolvedRefs: 0,
    formDerivedRefs: 0,
    finalEffectiveRefs: 0,
    unresolvedFormPolicyRefs: 0,
    workflowsWithHiddenRefs: 0,
  };

  for (const workflow of workflows) {
    const resolution = resolveWorkflowPolicyRefs(workflow);
    summary.rawPolicyRefs += collectDirectRefs(workflow).refs.length;
    summary.hiddenUnresolvedRefs += resolution.hiddenLegacyPolicyRefs.length;
    summary.formDerivedRefs += resolution.derivedPolicyRefsFromForms.length;
    summary.finalEffectiveRefs += resolution.effectivePolicyRefs.length;
    summary.unresolvedFormPolicyRefs += resolution.unresolvedFormPolicyRefs.length;
    if (resolution.hiddenLegacyPolicyRefs.length > 0) summary.workflowsWithHiddenRefs += 1;
  }

  return summary;
}
