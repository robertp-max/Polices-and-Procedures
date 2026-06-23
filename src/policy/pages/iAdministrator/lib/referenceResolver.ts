import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { MANDATED_EVENTS_EXPANDED } from '@/policy/data/mandatedEventsExpanded';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import { WORKFLOWS } from '@/policy/data/workflows.generated';

export type IaReferenceType = 'policy' | 'workflow' | 'form' | 'event' | 'appendix';

export interface ResolveIaReferenceInput {
  id: string;
  claimedType?: IaReferenceType | 'task' | 'viewer' | string | null;
  title?: string;
  source?: string;
}

export interface ResolvedIaReference {
  id: string;
  resolved: boolean;
  resolvedType: IaReferenceType;
  title: string;
  openRoute: string;
  source: string;
  claimedType?: string;
  reasonIfUnresolved?: string;
}

const policyById = new Map(POLICY_CORPUS.map(policy => [policy.id, policy]));
const formById = new Map(FORMS_DATASET.map(form => [form.id, form]));
const workflowIds = new Set([...Object.keys(WORKFLOWS), ...WORKFLOW_GRAPH.workflowIds]);
const eventById = new Map(
  [...REGULATORY_EVENTS, ...MANDATED_EVENTS_EXPANDED].map(event => [event.id.toUpperCase(), event]),
);

function normalizeReferenceId(id: string): string {
  return decodeURIComponent(id.trim()).toUpperCase();
}

function normalizeClaimedType(type: ResolveIaReferenceInput['claimedType']): IaReferenceType | null {
  if (!type) return null;
  const normalized = String(type).toLowerCase();
  if (normalized === 'policy') return 'policy';
  if (normalized === 'workflow') return 'workflow';
  if (normalized === 'form') return 'form';
  if (normalized === 'event') return 'event';
  if (normalized === 'appendix') return 'appendix';
  return null;
}

function unresolved(
  id: string,
  input: ResolveIaReferenceInput,
  reason: string,
): ResolvedIaReference {
  return {
    id,
    resolved: false,
    resolvedType: normalizeClaimedType(input.claimedType) ?? 'policy',
    title: input.title ?? id,
    openRoute: '',
    source: input.source ?? 'unknown',
    claimedType: input.claimedType ? String(input.claimedType) : undefined,
    reasonIfUnresolved: reason,
  };
}

function resolvePolicy(id: string, input: ResolveIaReferenceInput): ResolvedIaReference | null {
  const policy = policyById.get(id);
  const content = getPolicyContent(id);
  if (!policy || !content) return null;
  return {
    id,
    resolved: true,
    resolvedType: 'policy',
    title: input.title || policy.title,
    openRoute: `/policies/${encodeURIComponent(id)}`,
    source: input.source ?? 'policy-resolver',
    claimedType: input.claimedType ? String(input.claimedType) : undefined,
  };
}

function resolveWorkflow(id: string, input: ResolveIaReferenceInput): ResolvedIaReference | null {
  if (!workflowIds.has(id)) return null;
  const workflow = WORKFLOWS[id];
  if (!workflow) return null;
  return {
    id,
    resolved: true,
    resolvedType: 'workflow',
    title: input.title || workflow.title,
    openRoute: `/workflows/${encodeURIComponent(id)}`,
    source: input.source ?? 'workflow-resolver',
    claimedType: input.claimedType ? String(input.claimedType) : undefined,
  };
}

function resolveForm(id: string, input: ResolveIaReferenceInput): ResolvedIaReference | null {
  const form = formById.get(id);
  const generatedTitle = FORM_TITLES[id];
  if (!form && !generatedTitle) return null;
  return {
    id,
    resolved: true,
    resolvedType: 'form',
    title: input.title || form?.name || generatedTitle || id,
    openRoute: `/forms/${encodeURIComponent(id)}`,
    source: input.source ?? 'form-resolver',
    claimedType: input.claimedType ? String(input.claimedType) : undefined,
  };
}

function resolveEvent(id: string, input: ResolveIaReferenceInput): ResolvedIaReference | null {
  const event = eventById.get(id);
  if (!event) return null;
  return {
    id,
    resolved: true,
    resolvedType: 'event',
    title: input.title || event.title,
    openRoute: `/events/${encodeURIComponent(id)}`,
    source: input.source ?? 'event-resolver',
    claimedType: input.claimedType ? String(input.claimedType) : undefined,
  };
}

function orderedTypes(claimedType: IaReferenceType | null): IaReferenceType[] {
  const base: IaReferenceType[] = ['policy', 'workflow', 'form', 'event', 'appendix'];
  if (!claimedType) return base;
  return [claimedType, ...base.filter(type => type !== claimedType)];
}

export function resolveIaReference(input: ResolveIaReferenceInput): ResolvedIaReference {
  const id = normalizeReferenceId(input.id);
  if (!id) return unresolved(id, input, 'missing reference id');

  const claimedType = normalizeClaimedType(input.claimedType);
  for (const type of orderedTypes(claimedType)) {
    const resolved =
      type === 'policy' ? resolvePolicy(id, input) :
      type === 'workflow' ? resolveWorkflow(id, input) :
      type === 'form' ? resolveForm(id, input) :
      type === 'event' ? resolveEvent(id, input) :
      null;
    if (resolved) return resolved;
  }

  const reason = claimedType
    ? `not found in canonical ${claimedType} registry`
    : 'not found in canonical policy, workflow, form, or event registries';
  return unresolved(id, input, reason);
}

export function isIaReferenceResolved(
  id: string,
  claimedType?: ResolveIaReferenceInput['claimedType'],
): boolean {
  return resolveIaReference({ id, claimedType, source: 'isIaReferenceResolved' }).resolved;
}

export function warnUnresolvedIaReference(reference: ResolvedIaReference): void {
  const env = (import.meta as unknown as { env?: { DEV?: boolean } }).env;
  if (!env?.DEV || reference.resolved) return;
  console.warn('[iAdministrator] unresolved reference hidden', {
    source: reference.source,
    rawId: reference.id,
    claimedType: reference.claimedType,
    reason: reference.reasonIfUnresolved,
  });
}

export function uniqueResolvedReferenceIds(
  ids: string[],
  claimedType: ResolveIaReferenceInput['claimedType'],
  source: string,
): string[] {
  const seen = new Set<string>();
  const resolvedIds: string[] = [];
  for (const rawId of ids) {
    const resolved = resolveIaReference({ id: rawId, claimedType, source });
    if (!resolved.resolved) {
      warnUnresolvedIaReference(resolved);
      continue;
    }
    if (!seen.has(resolved.id)) {
      seen.add(resolved.id);
      resolvedIds.push(resolved.id);
    }
  }
  return resolvedIds;
}
