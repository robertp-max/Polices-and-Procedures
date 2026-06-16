import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { getPolicyBody } from '@/policy/data/policyContentMap';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import { REGULATORY_EVENTS, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { MANDATED_EVENTS_EXPANDED } from '@/policy/data/mandatedEventsExpanded';
import { HELP_ARTICLES } from '@/policy/data/helpArticles';
import { ALL_TASKS } from '@/policy/data/hubstaffTasks';
import { loadMasterControlInventorySeed } from '@/policy/data/masterControlInventory';
import {
  resolveEventPolicyRefs,
  resolveWorkflowPolicyRefs,
} from '@/policy/workflows/utils/resolveWorkflowPolicyRefs';

export interface BradTaskLike {
  id: string;
  title: string;
  dueDate: string;
  complianceState?: string;
  parentEventId?: string;
  workflowId?: string;
  sourcePolicyIds?: readonly string[];
  sourceFormIds?: readonly string[];
}

export interface BradEventLike {
  id: string;
  title: string;
  date?: string;
  anchorDate?: string;
  urgency?: string;
  domain?: string;
  policyRefs?: readonly string[];
}

export interface BradWorkflowLike {
  id: string;
  title: string;
  eventId?: string;
}

export interface BradRuntimeSnapshot {
  events?: readonly BradEventLike[];
  executionUnits?: readonly BradTaskLike[];
  workflows?: readonly BradWorkflowLike[];
  sprintMetrics?: {
    completionRatePct: number;
    activeBlockerCount: number;
    upcomingDeadlines48hCount: number;
    auditReadinessScore: number;
    signatureSlasMissed: number;
  };
}

export interface BuildBradContextOptions {
  runtime?: BradRuntimeSnapshot;
  currentUserRole?: string | null;
  maxSearchHitsPerSource?: number;
}

export interface BradAppContext {
  query: string;
  normalizedQuery: string;
  policies: Array<{ id: string; title: string; body: string }>;
  forms: Array<{ id: string; name: string; usage: string; frequency: string; type: string }>;
  workflows: Array<{ id: string; title: string; overview: string; policyRefs: string[]; requiredForms: string[] }>;
  workflowGraph: { workflowCount: number; edgeCount: number };
  events: Array<{ id: string; title: string; date: string; urgency: string; policyRefs: string[] }>;
  tasks: Array<{ id: string; title: string; dueDate: string; status: string; parentEventId?: string; workflowId?: string }>;
  helpArticles: Array<{ id: string; title: string; overview: string; relatedPolicies: string[]; relatedEventIds: string[] }>;
  controls: Array<{ id: string; controlName: string; category: string; domain: string; status: string; riskLevel: string; policyIds: string[] }>;
  sprintMetrics?: BradRuntimeSnapshot['sprintMetrics'];
  currentUserRole: string;
}

function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
}

function uniqById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function toEventDate(event: RegulatoryEvent): string {
  return event.date;
}

export async function buildBradAppContext(query: string, options: BuildBradContextOptions = {}): Promise<BradAppContext> {
  const normalizedQuery = normalize(query);
  const runtime = options.runtime;

  const policies = POLICY_CORPUS.map(policy => ({
    id: policy.id,
    title: policy.title,
    body: getPolicyBody(policy.id) ?? '',
  }));

  const forms = FORMS_DATASET.map(form => ({
    id: form.id,
    name: form.name,
    usage: form.usage,
    frequency: form.frequency,
    type: form.type,
  }));

  const workflows = Object.values(WORKFLOWS).map(workflow => ({
    id: workflow.id,
    title: workflow.title,
    overview: workflow.processOverview ?? '',
    policyRefs: resolveWorkflowPolicyRefs(workflow).effectivePolicyRefs.map(ref => ref.policyId),
    requiredForms: workflow.requiredForms ?? [],
  }));

  const staticEvents = uniqById([
    ...REGULATORY_EVENTS,
    ...MANDATED_EVENTS_EXPANDED,
  ]).filter(event => !event.isContext).map(event => ({
    id: event.id,
    title: event.title,
    date: toEventDate(event),
    urgency: event.urgency,
    policyRefs: resolveEventPolicyRefs(event).effectivePolicyRefs.map(ref => ref.policyId),
  }));

  const runtimeEvents = (runtime?.events ?? []).map(event => ({
    id: event.id,
    title: event.title,
    date: event.date ?? event.anchorDate ?? '',
    urgency: event.urgency ?? 'on-track',
    policyRefs: resolveEventPolicyRefs({
      id: event.id,
      title: event.title,
      policyRefs: event.policyRefs ?? [],
    }).effectivePolicyRefs.map(ref => ref.policyId),
  }));

  const events = uniqById([...runtimeEvents, ...staticEvents]);

  const runtimeTasks = (runtime?.executionUnits ?? []).map(task => ({
    id: task.id,
    title: task.title,
    dueDate: task.dueDate,
    status: task.complianceState ?? 'pending',
    parentEventId: task.parentEventId,
    workflowId: task.workflowId,
  }));

  const catalogTasks = ALL_TASKS.map(task => ({
    id: task.id,
    title: task.title,
    dueDate: task.dueDate ?? '',
    status: 'scheduled',
    parentEventId: undefined,
    workflowId: undefined,
  }));

  const tasks = uniqById([...runtimeTasks, ...catalogTasks]);

  const helpArticles = Object.values(HELP_ARTICLES).map(article => ({
    id: article.id,
    title: article.title,
    overview: article.overview ?? article.purpose,
    relatedPolicies: article.relatedPolicies.map(policy => policy.id),
    relatedEventIds: [...article.relatedEventIds],
  }));

  const controlsSeed = await loadMasterControlInventorySeed();
  const controls = controlsSeed.map(control => ({
    id: String(control.id),
    controlName: control.controlName,
    category: control.category,
    domain: control.domain,
    status: control.status,
    riskLevel: control.riskLevel,
    policyIds: [...control.sourcePolicyIds],
  }));

  const edgeCount = Object.values(WORKFLOW_GRAPH.downstream).reduce((sum, next) => sum + next.length, 0);

  return {
    query,
    normalizedQuery,
    policies,
    forms,
    workflows,
    workflowGraph: {
      workflowCount: WORKFLOW_GRAPH.workflowIds.length,
      edgeCount,
    },
    events,
    tasks,
    helpArticles,
    controls,
    sprintMetrics: runtime?.sprintMetrics,
    currentUserRole: options.currentUserRole ?? 'iAdministrator',
  };
}
