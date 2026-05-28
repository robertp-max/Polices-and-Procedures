import type { DomainCode } from '@/policy/types/workflow';
import { DOMAIN_META } from './brand';

export type WorkflowSavedViewId = 'gb' | 'highrisk' | 'recurring' | 'triggered';

export const WORKFLOW_SAVED_VIEWS: Array<{ id: WorkflowSavedViewId; label: string; hint: string }> = [
  { id: 'gb', label: 'Governing Body', hint: 'Approvals pending' },
  { id: 'highrisk', label: 'High-risk', hint: 'Declared risk >= high' },
  { id: 'recurring', label: 'Recurring', hint: 'Time-based cadence' },
  { id: 'triggered', label: 'Trigger-based', hint: 'Event-based cadence' },
];

export const WORKFLOW_DOMAIN_ORDER: DomainCode[] = ['GV', 'CL', 'QA', 'HR', 'CO', 'FN', 'OP', 'EN', 'IT', 'RM'];

const DOMAIN_SET = new Set<string>(WORKFLOW_DOMAIN_ORDER);
const SAVED_VIEW_SET = new Set<string>(WORKFLOW_SAVED_VIEWS.map(view => view.id));

export interface WorkflowFilterState {
  selectedDomain: DomainCode | 'ALL';
  savedView: WorkflowSavedViewId | null;
}

export interface WorkflowSubNavItem {
  id: string;
  label: string;
  to: string;
  active: boolean;
}

export function getWorkflowFilterState(search: string): WorkflowFilterState {
  const params = new URLSearchParams(search);
  const rawDomain = params.get('domain');
  const rawSavedView = params.get('view');

  const selectedDomain = rawDomain && DOMAIN_SET.has(rawDomain)
    ? rawDomain as DomainCode
    : 'ALL';
  const savedView = rawSavedView && SAVED_VIEW_SET.has(rawSavedView)
    ? rawSavedView as WorkflowSavedViewId
    : null;

  return { selectedDomain, savedView };
}

export function buildWorkflowUrl({ selectedDomain, savedView }: WorkflowFilterState): string {
  const params = new URLSearchParams();
  if (selectedDomain !== 'ALL') params.set('domain', selectedDomain);
  if (savedView) params.set('view', savedView);
  const query = params.toString();
  return query ? `/workflows?${query}` : '/workflows';
}

export function getWorkflowSubNavItems(search: string): WorkflowSubNavItem[] {
  const { selectedDomain, savedView } = getWorkflowFilterState(search);

  return [
    {
      id: 'all',
      label: 'All workflows',
      to: buildWorkflowUrl({ selectedDomain: 'ALL', savedView: null }),
      active: selectedDomain === 'ALL' && !savedView,
    },
    ...WORKFLOW_DOMAIN_ORDER.map(domain => ({
      id: `domain-${domain}`,
      label: DOMAIN_META[domain].name,
      to: buildWorkflowUrl({ selectedDomain: domain, savedView: null }),
      active: selectedDomain === domain && !savedView,
    })),
    ...WORKFLOW_SAVED_VIEWS.map(view => ({
      id: `view-${view.id}`,
      label: view.label,
      to: buildWorkflowUrl({
        selectedDomain,
        savedView: savedView === view.id ? null : view.id,
      }),
      active: savedView === view.id,
    })),
  ];
}
