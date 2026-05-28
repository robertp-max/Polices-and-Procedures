import {
  buildBradAppContext,
  type BuildBradContextOptions,
  type BradAppContext,
} from '@/services/bradAppContext';
import {
  classifyScenario,
  type ScenarioClassification,
} from '@/policy/pages/iAdministrator/lib/classifyScenario';
import { getComplianceActionDefinition } from '@/policy/pages/iAdministrator/lib/complianceActionMap';

export interface BradCitation {
  policyId: string;
  title: string;
  section: string;
  excerpt: string;
}

export interface BradQapiDigest {
  requirement: string;
  scope: string;
  keyComponents: string[];
}

export interface BradActionPlan {
  actions: string[];
}

export interface BradGoverningBody {
  summary: string;
  oversightItems: string[];
}

export interface BradResponse {
  answer: string;
  qapi?: BradQapiDigest;
  actionPlan?: BradActionPlan;
  governingBody?: BradGoverningBody;
  citations?: BradCitation[];
}

type QueryClass = 'policy' | 'form' | 'workflow' | 'event' | 'task' | 'audit' | 'dashboard' | 'help' | 'mixed';

const NO_MATCH_MESSAGE = 'No direct match was found in the current application data. Please rephrase with a policy, form, workflow, event, task, or compliance topic.';

function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ');
}

function includesAny(text: string, words: string[]): boolean {
  return words.some(word => text.includes(word));
}

function classifyQuery(normalized: string): QueryClass {
  const hasPolicy = includesAny(normalized, ['policy', 'cop', 'regulation']) || /\b[A-Z]{2}-[A-Z]{2}-\d{3}\b/i.test(normalized);
  const hasForm = includesAny(normalized, ['form', 'template', 'checklist']) || /\b[A-Z]{2}-FM-\d{3}\b/i.test(normalized);
  const hasWorkflow = includesAny(normalized, ['workflow', 'process', 'steps']) || /\b[A-Z]{2}-WF-\d{2,3}\b/i.test(normalized);
  const hasEvent = includesAny(normalized, ['event', 'calendar', 'meeting', 'deadline', 'due']) || normalized.includes('evt-');
  const hasTask = includesAny(normalized, ['task', 'todo', 'overdue', 'complete', 'status']) || normalized.includes('tsk-') || normalized.includes('task-');
  const hasAudit = includesAny(normalized, ['audit', 'survey', 'citation gap', 'readiness']);
  const hasDash = includesAny(normalized, ['dashboard', 'analytics', 'metrics', 'score']);
  const hasHelp = includesAny(normalized, ['help', 'how do i', 'how to', 'guide', 'what is']);

  const flags = [hasPolicy, hasForm, hasWorkflow, hasEvent, hasTask, hasAudit, hasDash, hasHelp].filter(Boolean).length;
  if (flags > 1) return 'mixed';
  if (hasAudit) return 'audit';
  if (hasDash) return 'dashboard';
  if (hasTask) return 'task';
  if (hasEvent) return 'event';
  if (hasWorkflow) return 'workflow';
  if (hasForm) return 'form';
  if (hasPolicy) return 'policy';
  return 'help';
}

function scoreTextMatch(query: string, ...parts: string[]): number {
  const tokens = query.split(' ').filter(token => token.length > 1);
  const haystack = parts.join(' ').toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
  }
  return score;
}

function topMatches<T>(items: T[], score: (item: T) => number, limit = 5): T[] {
  return items
    .map(item => ({ item, score: score(item) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.item);
}

function toCitation(id: string, title: string, section: string, excerpt: string): BradCitation {
  return { policyId: id, title, section, excerpt };
}

function referenceSections(citations: BradCitation[]): string {
  const buckets: Record<'Policies' | 'Workflows' | 'Forms' | 'Events' | 'Tasks', BradCitation[]> = {
    Policies: [],
    Workflows: [],
    Forms: [],
    Events: [],
    Tasks: [],
  };

  for (const c of citations) {
    const id = c.policyId.toUpperCase();
    if (id.includes('-WF-')) buckets.Workflows.push(c);
    else if (id.includes('-FM-') || id.includes('-FRM-')) buckets.Forms.push(c);
    else if (id.startsWith('EVT-') || id.includes('-EVT-') || id.includes('-EVENT-')) buckets.Events.push(c);
    else if (id.startsWith('TSK-') || id.startsWith('TASK-')) buckets.Tasks.push(c);
    else buckets.Policies.push(c);
  }

  const lines: string[] = ['Related References:'];
  for (const [label, entries] of Object.entries(buckets)) {
    if (entries.length === 0) continue;
    lines.push(`${label}:`);
    for (const entry of entries.slice(0, 4)) lines.push(`- ${entry.policyId}`);
  }
  return lines.join('\n');
}

function taskAnalytics(context: BradAppContext): {
  total: number;
  open: number;
  completed: number;
  overdue: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  const completedStates = new Set(['complete', 'completed', 'done']);
  const openStates = new Set(['pending', 'blocked', 'in_progress', 'in-progress', 'awaiting_signature', 'scheduled']);

  let open = 0;
  let completed = 0;
  let overdue = 0;

  for (const task of context.tasks) {
    const status = task.status.toLowerCase();
    const isCompleted = completedStates.has(status);
    if (isCompleted) completed += 1;
    else if (openStates.has(status)) open += 1;

    if (!isCompleted && task.dueDate && task.dueDate < today) overdue += 1;
  }

  return {
    total: context.tasks.length,
    open,
    completed,
    overdue,
  };
}

function buildPolicyResponse(context: BradAppContext): BradResponse {
  const matches = topMatches(
    context.policies,
    policy => scoreTextMatch(context.normalizedQuery, policy.id.toLowerCase(), policy.title.toLowerCase(), policy.body.toLowerCase()),
  );

  if (matches.length === 0) return buildNoMatchResponse();

  const citations = matches.map(policy =>
    toCitation(policy.id, policy.title, 'Policy Content', policy.body.slice(0, 220) || 'Policy content loaded from corpus.'),
  );

  return {
    answer: [
      `Direct Answer: Found ${matches.length} policy result(s) in the application corpus.`,
      '',
      ...matches.slice(0, 3).map(policy => `- ${policy.id}: ${policy.title}`),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildFormResponse(context: BradAppContext): BradResponse {
  const matches = topMatches(
    context.forms,
    form => scoreTextMatch(context.normalizedQuery, form.id.toLowerCase(), form.name.toLowerCase(), form.type.toLowerCase()),
  );
  if (matches.length === 0) return buildNoMatchResponse();

  const citations = matches.map(form =>
    toCitation(form.id, form.name, 'Forms Library', `${form.type} | ${form.usage} | ${form.frequency}`),
  );

  return {
    answer: [
      'Direct Answer: Matching forms were found in the live Forms Library dataset.',
      '',
      ...matches.slice(0, 4).map(form => `- ${form.id}: ${form.name} (${form.frequency})`),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildWorkflowResponse(context: BradAppContext): BradResponse {
  const matches = topMatches(
    context.workflows,
    workflow => scoreTextMatch(context.normalizedQuery, workflow.id.toLowerCase(), workflow.title.toLowerCase(), workflow.overview.toLowerCase(), workflow.policyRefs.join(' ').toLowerCase()),
  );
  if (matches.length === 0) return buildNoMatchResponse();

  const citations = matches.map(workflow =>
    toCitation(workflow.id, workflow.title, 'Workflow Definition', workflow.overview.slice(0, 220) || 'Workflow metadata loaded.'),
  );

  return {
    answer: [
      `Direct Answer: Located ${matches.length} workflow match(es) from the compiled workflow graph (${context.workflowGraph.workflowCount} total workflows).`,
      '',
      ...matches.slice(0, 3).map(workflow => `- ${workflow.id}: ${workflow.title}`),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildEventResponse(context: BradAppContext): BradResponse {
  const matches = topMatches(
    context.events,
    event => scoreTextMatch(context.normalizedQuery, event.id.toLowerCase(), event.title.toLowerCase(), event.urgency.toLowerCase(), event.policyRefs.join(' ').toLowerCase()),
  );
  if (matches.length === 0) return buildNoMatchResponse();

  const citations = matches.map(event =>
    toCitation(event.id, event.title, 'Regulatory Events', `${event.date || 'No date'} | urgency: ${event.urgency}`),
  );

  return {
    answer: [
      'Direct Answer: Event matches were found using the regulatory execution data sources.',
      '',
      ...matches.slice(0, 4).map(event => `- ${event.id}: ${event.title} (${event.date || 'date pending'})`),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildTaskResponse(context: BradAppContext): BradResponse {
  const metrics = taskAnalytics(context);
  const matches = topMatches(
    context.tasks,
    task => scoreTextMatch(context.normalizedQuery, task.id.toLowerCase(), task.title.toLowerCase(), task.status.toLowerCase(), (task.workflowId ?? '').toLowerCase()),
    8,
  );

  const baseCitations = matches.map(task =>
    toCitation(task.id.startsWith('TSK-') || task.id.startsWith('TASK-') ? task.id : `TASK-${task.id}`, task.title, 'Task Status', `${task.status} | due ${task.dueDate || 'unscheduled'}`),
  );

  const sprint = context.sprintMetrics
    ? `Sprint completion ${context.sprintMetrics.completionRatePct}% | audit readiness ${context.sprintMetrics.auditReadinessScore}% | blockers ${context.sprintMetrics.activeBlockerCount}`
    : 'Sprint metrics are unavailable for this session.';

  return {
    answer: [
      `Direct Answer: Tasks total ${metrics.total}, open ${metrics.open}, completed ${metrics.completed}, overdue ${metrics.overdue}.`,
      '',
      sprint,
      '',
      ...(matches.length > 0
        ? ['Top matching tasks:', ...matches.slice(0, 5).map(task => `- ${task.id}: ${task.title} (${task.status})`), '']
        : ['No direct task text match for this prompt, but status analytics are available.', '']),
      referenceSections(baseCitations),
    ].join('\n'),
    citations: baseCitations,
    actionPlan: {
      actions: [
        'Prioritize overdue obligations first and assign owner confirmation.',
        'Resolve blocked items before opening new tasks in the same workflow chain.',
        'Review sprint blocker and signature SLA trends in the dashboard before closure decisions.',
      ],
    },
  };
}

function buildAuditResponse(context: BradAppContext): BradResponse {
  const controlsAtRisk = context.controls.filter(control => control.status !== 'active').slice(0, 4);
  const task = buildTaskResponse(context);
  const citations = [
    ...task.citations ?? [],
    ...controlsAtRisk.map(control => toCitation(control.id, control.controlName, 'Master Control Inventory', `${control.category} | ${control.status} | risk ${control.riskLevel}`)),
  ].slice(0, 8);

  return {
    answer: [
      'Direct Answer: Audit readiness was computed from execution status, control inventory, and compliance workflow sources.',
      '',
      task.answer,
      '',
      ...(controlsAtRisk.length > 0
        ? ['Controls requiring attention:', ...controlsAtRisk.map(control => `- ${control.id}: ${control.controlName} (${control.status})`), '']
        : ['No at-risk controls were returned from the control inventory snapshot.', '']),
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildDashboardResponse(context: BradAppContext): BradResponse {
  const metrics = taskAnalytics(context);
  const citations: BradCitation[] = [];

  if (context.sprintMetrics) {
    citations.push(
      toCitation('TSK-SPRINT-METRICS', 'Sprint Metrics', 'Compliance Execution Snapshot', `Completion ${context.sprintMetrics.completionRatePct}% | Blockers ${context.sprintMetrics.activeBlockerCount}`),
    );
  }

  return {
    answer: [
      'Direct Answer: Dashboard analytics are sourced from live execution units and task catalogs.',
      '',
      `Task totals: ${metrics.total} total, ${metrics.open} open, ${metrics.completed} completed, ${metrics.overdue} overdue.`,
      context.sprintMetrics
        ? `Sprint: completion ${context.sprintMetrics.completionRatePct}%, audit readiness ${context.sprintMetrics.auditReadinessScore}%, upcoming deadlines <=48h ${context.sprintMetrics.upcomingDeadlines48hCount}.`
        : 'Sprint metrics unavailable in this query context.',
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildHelpResponse(context: BradAppContext): BradResponse {
  const matches = topMatches(
    context.helpArticles,
    article => scoreTextMatch(context.normalizedQuery, article.id.toLowerCase(), article.title.toLowerCase(), article.overview.toLowerCase(), article.relatedPolicies.join(' ').toLowerCase()),
  );

  if (matches.length === 0) return buildNoMatchResponse();

  const citations = matches.map(article =>
    toCitation(article.id, article.title, 'Help Center', article.overview.slice(0, 220)),
  );

  return {
    answer: [
      'Direct Answer: Found guidance in Help Center content linked to operational events and policies.',
      '',
      ...matches.slice(0, 4).map(article => `- ${article.id}: ${article.title}`),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildSearchResponse(context: BradAppContext): BradResponse {
  const policy = topMatches(context.policies, item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase()), 2);
  const forms = topMatches(context.forms, item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.name.toLowerCase()), 2);
  const workflows = topMatches(context.workflows, item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase()), 2);
  const events = topMatches(context.events, item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase()), 2);
  const tasks = topMatches(context.tasks, item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase()), 2);

  const citations: BradCitation[] = [
    ...policy.map(item => toCitation(item.id, item.title, 'Policy', 'Policy corpus search hit.')),
    ...forms.map(item => toCitation(item.id, item.name, 'Form', 'Forms library search hit.')),
    ...workflows.map(item => toCitation(item.id, item.title, 'Workflow', 'Workflow library search hit.')),
    ...events.map(item => toCitation(item.id, item.title, 'Event', 'Regulatory event search hit.')),
    ...tasks.map(item => toCitation(item.id.startsWith('TSK-') || item.id.startsWith('TASK-') ? item.id : `TASK-${item.id}`, item.title, 'Task', `Task status ${item.status}.`)),
  ];

  if (citations.length === 0) return buildNoMatchResponse();

  return {
    answer: [
      'Direct Answer: App-wide search ran across policies, forms, workflows, events, tasks, help articles, and control inventory.',
      '',
      ...citations.slice(0, 10).map(c => `- ${c.policyId}: ${c.title}`),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildAppDataSearchResponse(context: BradAppContext): BradResponse {
  const workflows = topMatches(
    context.workflows,
    item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase(), item.overview.toLowerCase()),
    3,
  );
  const events = topMatches(
    context.events,
    item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase(), item.urgency.toLowerCase()),
    3,
  );
  const tasks = topMatches(
    context.tasks,
    item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase(), item.status.toLowerCase()),
    3,
  );

  const citations: BradCitation[] = [
    ...workflows.map(item => toCitation(item.id, item.title, 'Workflow', item.overview.slice(0, 220) || 'Workflow match.')),
    ...events.map(item => toCitation(item.id, item.title, 'Event', `${item.date || 'No date'} | urgency: ${item.urgency}`)),
    ...tasks.map(item => toCitation(item.id.startsWith('TSK-') || item.id.startsWith('TASK-') ? item.id : `TASK-${item.id}`, item.title, 'Task', `Task status ${item.status}.`)),
  ];

  if (citations.length === 0) return buildNoMatchResponse();

  return {
    answer: [
      'Direct Answer: App data matches were found in live tasks, events, and workflows.',
      '',
      ...workflows.map(item => `- Workflow ${item.id}: ${item.title}`),
      ...events.map(item => `- Event ${item.id}: ${item.title}`),
      ...tasks.map(item => `- Task ${item.id}: ${item.title} (${item.status})`),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
  };
}

function buildScenarioAppDataContext(context: BradAppContext): string[] {
  const workflows = topMatches(
    context.workflows,
    item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase(), item.overview.toLowerCase()),
    2,
  );
  const events = topMatches(
    context.events,
    item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase(), item.urgency.toLowerCase()),
    2,
  );
  const tasks = topMatches(
    context.tasks,
    item => scoreTextMatch(context.normalizedQuery, item.id.toLowerCase(), item.title.toLowerCase(), item.status.toLowerCase()),
    2,
  );

  if (workflows.length === 0 && events.length === 0 && tasks.length === 0) {
    return ['- No direct task/event/workflow text match; follow the incident protocol immediately.'];
  }

  return [
    ...workflows.map(item => `- Workflow ${item.id}: ${item.title}`),
    ...events.map(item => `- Event ${item.id}: ${item.title}`),
    ...tasks.map(item => `- Task ${item.id}: ${item.title} (${item.status})`),
  ];
}

function buildScenarioPrimaryResponse(classification: ScenarioClassification, context: BradAppContext): BradResponse {
  const definition = getComplianceActionDefinition(classification.scenarioId);
  const fallMode = definition.id === 'fall_event';

  const requiredActions = fallMode
    ? [
        'Assess patient immediately.',
        'Check for injury, bleeding, and level of consciousness.',
        'Do not move patient if injury is suspected.',
        'Call 911 if unstable or high risk.',
        'Notify supervisor/DON immediately.',
      ]
    : definition.requiredActions.slice(0, 6).map(action => action.text);

  const citations: BradCitation[] = [
    ...definition.relatedPolicies.map(item => toCitation(item.id, item.title, 'Scenario Policy', 'Scenario-guided policy link.')),
    ...definition.relatedForms.map(item => toCitation(item.id, item.title, 'Scenario Form', 'Scenario-guided form requirement.')),
    ...definition.relatedWorkflows.map(item => toCitation(item.id, item.title, 'Scenario Workflow', 'Scenario-guided workflow requirement.')),
  ];

  const documentationLine = fallMode
    ? 'Required Documentation: Same-day incident documentation, post-fall assessment findings, notification timeline, and follow-up actions.'
    : `Required Documentation: ${definition.evidenceToCapture.slice(0, 3).join('; ')}.`;

  const relatedForms = [...definition.relatedForms, ...definition.needsMapping.filter(item => item.type === 'form')]
    .map(item => item.id)
    .slice(0, 4);
  const relatedWorkflows = [...definition.relatedWorkflows, ...definition.needsMapping.filter(item => item.type === 'workflow')]
    .map(item => item.id)
    .slice(0, 4);

  const relatedLine = [
    `Related Forms: ${relatedForms.length > 0 ? relatedForms.join(', ') : 'None mapped'}`,
    `Related Workflows: ${relatedWorkflows.length > 0 ? relatedWorkflows.join(', ') : 'None mapped'}`,
  ];

  return {
    answer: [
      definition.label,
      '',
      'Required Actions:',
      ...requiredActions.map(action => `- ${action}`),
      '',
      `Escalation Level: ${definition.escalationLevel.toUpperCase()}`,
      documentationLine,
      ...relatedLine,
      '',
      'App Data Context:',
      ...buildScenarioAppDataContext(context),
      '',
      referenceSections(citations),
    ].join('\n'),
    citations,
    actionPlan: {
      actions: requiredActions,
    },
  };
}

function buildNoMatchResponse(): BradResponse {
  return {
    answer: NO_MATCH_MESSAGE,
    citations: [],
  };
}

function routeByClass(queryClass: QueryClass, context: BradAppContext): BradResponse {
  if (queryClass === 'policy') return buildPolicyResponse(context);
  if (queryClass === 'form') return buildFormResponse(context);
  if (queryClass === 'workflow') return buildWorkflowResponse(context);
  if (queryClass === 'event') return buildEventResponse(context);
  if (queryClass === 'task') return buildTaskResponse(context);
  if (queryClass === 'audit') return buildAuditResponse(context);
  if (queryClass === 'dashboard') return buildDashboardResponse(context);
  if (queryClass === 'help') return buildHelpResponse(context);
  return buildSearchResponse(context);
}

export type RunBradQueryOptions = BuildBradContextOptions;

export async function runBradQuery(query: string, options: RunBradQueryOptions = {}): Promise<BradResponse> {
  const context = await buildBradAppContext(query, options);
  const normalized = normalize(query);
  const scenario = classifyScenario(query);

  if (scenario) {
    return buildScenarioPrimaryResponse(scenario, context);
  }

  if (normalized.startsWith('search ') || normalized.includes('app wide') || normalized.includes('across app')) {
    return buildSearchResponse(context);
  }

  const queryClass = classifyQuery(normalized);

  // Stage 2: app data first (tasks/events/workflows + operational views).
  const appDataRouted = (queryClass === 'task' || queryClass === 'event' || queryClass === 'workflow' || queryClass === 'audit' || queryClass === 'dashboard')
    ? routeByClass(queryClass, context)
    : buildAppDataSearchResponse(context);
  if (appDataRouted.citations && appDataRouted.citations.length > 0) return appDataRouted;

  // Stage 3: policy/compliance routing.
  const policyComplianceRouted = (queryClass === 'policy' || queryClass === 'form' || queryClass === 'help' || queryClass === 'mixed')
    ? routeByClass(queryClass, context)
    : buildSearchResponse(context);
  if (policyComplianceRouted.citations && policyComplianceRouted.citations.length > 0) return policyComplianceRouted;

  // Stage 4: fallback is last and only when no scenario/data/policy matched.
  return buildNoMatchResponse();
}
