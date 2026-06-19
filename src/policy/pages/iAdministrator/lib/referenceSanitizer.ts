import type {
  ActionType,
  AvailableAction,
  Citation,
  DocumentType,
  LinkedReference,
  ReferencePreview,
  RequirementSnapshotItem,
  ScenarioMapping,
  StructuredResponse,
} from './responseTypes';
import type { SessionSummary } from './sessionTypes';
import {
  resolveIaReference,
  warnUnresolvedIaReference,
  type IaReferenceType,
} from './referenceResolver';

function asDocumentType(type: IaReferenceType): DocumentType | null {
  if (type === 'policy' || type === 'workflow' || type === 'form' || type === 'appendix') {
    return type;
  }
  return null;
}

function previewModeFor(type: DocumentType): LinkedReference['previewMode'] {
  if (type === 'form') return 'form';
  if (type === 'workflow') return 'workflow';
  return 'document';
}

function openActionFor(type: DocumentType): ActionType {
  if (type === 'form') return 'open_form';
  if (type === 'workflow') return 'open_workflow';
  if (type === 'appendix') return 'open_appendix';
  return 'open_policy';
}

function sourceLabel(base: string, id: string): string {
  return `${base}:${id}`;
}

export function sanitizeCitations(citations: Citation[], source: string): Citation[] {
  return citations.flatMap((citation) => {
    const resolved = resolveIaReference({
      id: citation.policyId,
      title: citation.title,
      source: sourceLabel(source, citation.policyId),
    });
    if (!resolved.resolved) {
      warnUnresolvedIaReference(resolved);
      return [];
    }
    return [{
      ...citation,
      policyId: resolved.id,
      title: citation.title || resolved.title,
    }];
  });
}

export function sanitizeLinkedReferences(
  references: LinkedReference[],
  source: string,
): LinkedReference[] {
  const seen = new Set<string>();
  return references.flatMap((reference) => {
    const resolved = resolveIaReference({
      id: reference.id,
      claimedType: reference.type,
      title: reference.title,
      source: sourceLabel(source, reference.id),
    });
    const documentType = resolved.resolved ? asDocumentType(resolved.resolvedType) : null;
    if (!resolved.resolved || !documentType) {
      warnUnresolvedIaReference(resolved);
      return [];
    }
    if (seen.has(resolved.id)) return [];
    seen.add(resolved.id);
    return [{
      ...reference,
      id: resolved.id,
      type: documentType,
      title: reference.title || resolved.title,
      policyId: resolved.id,
      previewMode: previewModeFor(documentType),
    }];
  });
}

function sanitizeRequiredArtifacts(ids: string[], source: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const resolved = resolveIaReference({ id, source: sourceLabel(source, id) });
    if (!resolved.resolved) {
      warnUnresolvedIaReference(resolved);
      continue;
    }
    if (!seen.has(resolved.id)) {
      seen.add(resolved.id);
      out.push(resolved.id);
    }
  }
  return out;
}

export function sanitizeRequirementSnapshot(
  items: RequirementSnapshotItem[],
  source: string,
): RequirementSnapshotItem[] {
  return items.map((item) => {
    if (!item.sourcePolicyId) return item;
    const resolved = resolveIaReference({
      id: item.sourcePolicyId,
      claimedType: 'policy',
      source: sourceLabel(source, item.sourcePolicyId),
    });
    if (!resolved.resolved || resolved.resolvedType !== 'policy') {
      warnUnresolvedIaReference(resolved);
      return { ...item, sourcePolicyId: '' };
    }
    return { ...item, sourcePolicyId: resolved.id };
  });
}

export function sanitizeAvailableActions(actions: AvailableAction[], source: string): AvailableAction[] {
  return actions.flatMap((action) => {
    if (!action.targetId) return [action];

    const resolved = resolveIaReference({
      id: action.targetId,
      claimedType: action.targetType,
      source: sourceLabel(source, action.targetId),
    });
    const documentType = resolved.resolved ? asDocumentType(resolved.resolvedType) : null;
    if (!resolved.resolved || !documentType) {
      warnUnresolvedIaReference(resolved);
      return [];
    }

    return [{
      ...action,
      type: action.type.startsWith('open_') ? openActionFor(documentType) : action.type,
      targetId: resolved.id,
      targetType: documentType,
      label: action.type.startsWith('open_') ? `Open ${resolved.id}` : action.label,
    }];
  });
}

function sanitizeScenarioMapping(scenario: ScenarioMapping | undefined): ScenarioMapping | undefined {
  if (!scenario) return undefined;
  const requiredWorkflows = scenario.requiredWorkflows.filter((workflow) => {
    const resolved = resolveIaReference({
      id: workflow.id,
      claimedType: 'workflow',
      title: workflow.label,
      source: `scenario.requiredWorkflows:${scenario.category}`,
    });
    if (resolved.resolved && resolved.resolvedType === 'workflow') return true;
    warnUnresolvedIaReference(resolved);
    return false;
  });
  const relatedPolicies = scenario.relatedPolicies.filter((policy) => {
    const resolved = resolveIaReference({
      id: policy.id,
      claimedType: 'policy',
      title: policy.name,
      source: `scenario.relatedPolicies:${scenario.category}`,
    });
    if (resolved.resolved && resolved.resolvedType === 'policy') return true;
    warnUnresolvedIaReference(resolved);
    return false;
  });
  return {
    ...scenario,
    requiredWorkflows,
    relatedPolicies,
  };
}

export function sanitizeStructuredResponseReferences(
  response: StructuredResponse,
  source = 'StructuredResponse',
): StructuredResponse {
  const governingPolicy = response.governingPolicyId
    ? resolveIaReference({
        id: response.governingPolicyId,
        claimedType: 'policy',
        source: `${source}.governingPolicyId`,
      })
    : null;

  if (governingPolicy && (!governingPolicy.resolved || governingPolicy.resolvedType !== 'policy')) {
    warnUnresolvedIaReference(governingPolicy);
  }

  return {
    ...response,
    requiredArtifacts: sanitizeRequiredArtifacts(response.requiredArtifacts, `${source}.requiredArtifacts`),
    governingPolicyId:
      governingPolicy?.resolved && governingPolicy.resolvedType === 'policy'
        ? governingPolicy.id
        : null,
    requirementsSnapshot: sanitizeRequirementSnapshot(response.requirementsSnapshot, `${source}.requirementsSnapshot`),
    citations: sanitizeCitations(response.citations, `${source}.citations`),
    linkedReferences: sanitizeLinkedReferences(response.linkedReferences, `${source}.linkedReferences`),
    availableActions: sanitizeAvailableActions(response.availableActions, `${source}.availableActions`),
    scenario: sanitizeScenarioMapping(response.scenario),
  };
}

export function sanitizeReferencePreview(
  preview: ReferencePreview,
  source = 'ReferencePreview',
): ReferencePreview | null {
  const resolved = resolveIaReference({
    id: preview.id,
    claimedType: preview.type,
    title: preview.title,
    source,
  });
  const documentType = resolved.resolved ? asDocumentType(resolved.resolvedType) : null;
  if (!resolved.resolved || !documentType) {
    warnUnresolvedIaReference(resolved);
    return null;
  }

  return {
    ...preview,
    id: resolved.id,
    type: documentType,
    title: preview.title || resolved.title,
    linkedIds: sanitizeRequiredArtifacts(preview.linkedIds, `${source}.linkedIds`),
  };
}

export function sanitizeSessionSummaryReferences(session: SessionSummary): SessionSummary {
  return {
    ...session,
    activePolicies: sanitizeRequiredArtifacts(session.activePolicies, 'SessionSummary.activePolicies'),
    activeForms: sanitizeRequiredArtifacts(session.activeForms, 'SessionSummary.activeForms'),
  };
}
