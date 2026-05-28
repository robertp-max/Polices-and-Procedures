import { useMemo, useState } from 'react';
import { FileText, Folder } from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventExecutionAuditEvent } from '@/policy/compliance-execution/types';
import type { Task } from '@/policy/pm/types';
import type { ApprovalRequest, EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import {
  buildCesEvidenceHierarchy,
  type ExecutionRequirementStatus,
  type HierarchyMetrics,
  type LeaderboardEntry,
  type YearHierarchyNode,
} from '@/policy/evidence/cesEvidenceHierarchy';

interface HierarchyFilters {
  year: string;
  quarter: string;
  month: string;
  eventStatus: string;
  taskStatus: string;
  requirementStatus: string;
  evidenceStatus: string;
  signatureStatus: string;
  assigned: string;
  missingEvidenceOnly: boolean;
  lockedEvidenceOnly: boolean;
  pendingSignatureOnly: boolean;
  blockedTasksOnly: boolean;
  orphanOnly: boolean;
}

type SelectedContext =
  | { kind: 'year'; label: string }
  | { kind: 'month'; label: string }
  | { kind: 'event'; label: string }
  | { kind: 'task'; label: string }
  | { kind: 'requirement'; label: string }
  | { kind: 'leaderboard'; label: string };

type ExplorerSelection =
  | { kind: 'root' }
  | { kind: 'year'; year: number }
  | { kind: 'month'; year: number; month: number }
  | { kind: 'event'; eventId: string }
  | { kind: 'task'; taskId: string };

type ExplorerItem =
  | { kind: 'folder'; id: string; name: string; subtitle: string; metrics: HierarchyMetrics; onOpen: () => void }
  | { kind: 'record'; id: string; name: string; subtitle: string; status: string; completion: number; audit: number; onOpen?: () => void };

export function CesEvidenceHierarchyPanel({
  events,
  tasks,
  evidenceByEvent,
  approvals,
  auditByEvent,
  onSelectEvent,
}: {
  events: RegulatoryEvent[];
  tasks: Task[];
  evidenceByEvent: Record<string, EvidenceDoc[]>;
  approvals: ApprovalRequest[];
  auditByEvent: Record<string, EventExecutionAuditEvent[]>;
  onSelectEvent?: (eventId: string) => void;
}) {
  const now = new Date();
  const [filters, setFilters] = useState<HierarchyFilters>({
    year: String(now.getFullYear()),
    quarter: '',
    month: '',
    eventStatus: '',
    taskStatus: '',
    requirementStatus: '',
    evidenceStatus: '',
    signatureStatus: '',
    assigned: '',
    missingEvidenceOnly: false,
    lockedEvidenceOnly: false,
    pendingSignatureOnly: false,
    blockedTasksOnly: false,
    orphanOnly: false,
  });
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({ [now.getFullYear()]: true });
  const [selectedContext, setSelectedContext] = useState<SelectedContext>({ kind: 'month', label: 'Monthly compliance execution' });
  const [explorerSelection, setExplorerSelection] = useState<ExplorerSelection>({ kind: 'year', year: now.getFullYear() });

  const hierarchy = useMemo(() => buildCesEvidenceHierarchy({
    events,
    tasks,
    evidenceByEvent,
    approvals,
    auditByEvent,
  }), [events, tasks, evidenceByEvent, approvals, auditByEvent]);

  const filteredYears = useMemo(() => applyFilters(hierarchy.years, filters), [hierarchy.years, filters]);
  const compactMetrics = useMemo(() => aggregateYearMetrics(filteredYears), [filteredYears]);
  const explorerView = useMemo(
    () => buildExplorerView(filteredYears, explorerSelection, setExplorerSelection, setSelectedContext, onSelectEvent),
    [filteredYears, explorerSelection, onSelectEvent, setSelectedContext],
  );

  return (
    <div className="grid grid-cols-12 gap-4 px-3 md:px-6 py-4">
      <section className="col-span-12 xl:col-span-9">
        <div className="border-t border-[var(--v3-border-subtle)] pt-4">
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--v3-text-primary)]">Evidence Folder Tree</h2>
            <p className="mt-1 text-xs text-[var(--v3-text-secondary)]">
              Drive-style hierarchy: Year → Month → Event → Task → Requirement → Artifact. Operational completion and audit readiness are calculated separately.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-6">
              <FilterSelect label="Year" value={filters.year} onChange={value => setFilters(prev => ({ ...prev, year: value }))} options={['', ...hierarchy.years.map(y => String(y.year))]} />
              <FilterSelect label="Month" value={filters.month} onChange={value => setFilters(prev => ({ ...prev, month: value }))} options={['', ...monthOptions(filteredYears)]} />
              <FilterSelect label="Task Status" value={filters.taskStatus} onChange={value => setFilters(prev => ({ ...prev, taskStatus: value }))} options={['', 'todo', 'in_progress', 'in_review', 'blocked', 'done']} />
              <FilterSelect label="Requirement Status" value={filters.requirementStatus} onChange={value => setFilters(prev => ({ ...prev, requirementStatus: value }))} options={['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']} />
              <FilterSelect label="Assigned" value={filters.assigned} onChange={value => setFilters(prev => ({ ...prev, assigned: value }))} options={['', ...assigneeOptions(filteredYears)]} />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--v3-text-secondary)]">
              <CheckToggle label="Missing evidence only" checked={filters.missingEvidenceOnly} onChange={checked => setFilters(prev => ({ ...prev, missingEvidenceOnly: checked }))} />
              <CheckToggle label="Locked evidence only" checked={filters.lockedEvidenceOnly} onChange={checked => setFilters(prev => ({ ...prev, lockedEvidenceOnly: checked }))} />
              <CheckToggle label="Pending signature only" checked={filters.pendingSignatureOnly} onChange={checked => setFilters(prev => ({ ...prev, pendingSignatureOnly: checked }))} />
              <CheckToggle label="Blocked tasks only" checked={filters.blockedTasksOnly} onChange={checked => setFilters(prev => ({ ...prev, blockedTasksOnly: checked }))} />
              <CheckToggle label="Orphan evidence only" checked={filters.orphanOnly} onChange={checked => setFilters(prev => ({ ...prev, orphanOnly: checked }))} />
            </div>
          </div>

          <div className="px-4 py-3">
            <MetricsSummary metrics={compactMetrics} />
            <div className="mt-4 grid grid-cols-12 gap-4">
              <aside className="col-span-12 lg:col-span-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Folders</div>
                <div className="mt-2 space-y-1" role="tree" aria-label="Evidence folder hierarchy">
                  {filteredYears.map(yearNode => {
                    const yearOpen = expandedYears[yearNode.year] ?? yearNode.year === now.getFullYear();
                    return (
                      <div key={yearNode.year} role="treeitem" aria-expanded="true">
                        <FolderTreeButton
                          label={`${yearNode.year}`}
                          active={isSelected(explorerSelection, { kind: 'year', year: yearNode.year })}
                          open={yearOpen}
                          onClick={() => {
                            setExpandedYears(prev => ({ ...prev, [yearNode.year]: !yearOpen }));
                            setExplorerSelection({ kind: 'year', year: yearNode.year });
                            setSelectedContext({ kind: 'year', label: `${yearNode.year} compliance readiness` });
                          }}
                        />
                        {yearOpen && (
                          <div className="ml-3 border-l border-[var(--v3-border-subtle)] pl-2" role="group">
                            {monthsForYear(yearNode).map(monthNode => (
                              <div key={`${yearNode.year}-${monthNode.month}`} role="treeitem">
                                <FolderTreeButton
                                  label={monthNode.label}
                                  active={isSelected(explorerSelection, { kind: 'month', year: yearNode.year, month: monthNode.month })}
                                  onClick={() => {
                                    setExplorerSelection({ kind: 'month', year: yearNode.year, month: monthNode.month });
                                    setSelectedContext({ kind: 'month', label: `${monthNode.label} compliance execution` });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <section className="col-span-12 lg:col-span-9 min-w-0">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--v3-border-subtle)] pb-3">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-[var(--v3-text-tertiary)]">{explorerView.breadcrumb.join(' / ')}</div>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--v3-text-primary)]">{explorerView.title}</h3>
                  </div>
                  <div className="flex shrink-0 gap-4 text-right text-[11px] text-[var(--v3-text-secondary)]">
                    <span><strong className="text-[var(--v3-text-primary)]">{explorerView.metrics.completionPercentage}%</strong> complete</span>
                    <span><strong className="text-[var(--v3-text-primary)]">{explorerView.metrics.auditReadinessPercentage}%</strong> audit ready</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-7 md:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Evidence folder contents">
                  {explorerView.items.map(item => (
                    <div key={`${item.kind}-${item.id}`} role="listitem">
                      <ExplorerRow item={item} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--v3-border-subtle)] pt-4 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--v3-text-primary)]">Performance Leaderboard</h3>
            <button
              type="button"
              onClick={() => setSelectedContext({ kind: 'leaderboard', label: 'Story points and audit-ready scoring' })}
              className="text-xs text-[var(--v3-teal-light)] underline"
            >
              Explain scoring
            </button>
          </div>
          <div className="mt-2 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-white/65">
                <tr>
                  <th className="text-left py-1">User / Role</th>
                  <th className="text-right py-1">SP Done</th>
                  <th className="text-right py-1">Certified</th>
                  <th className="text-right py-1">On-Time %</th>
                  <th className="text-right py-1">Overdue</th>
                  <th className="text-right py-1">Rejected</th>
                  <th className="text-right py-1">Audit Perfect</th>
                  <th className="text-right py-1">Score</th>
                </tr>
              </thead>
              <tbody>
                {hierarchy.leaderboard.map(row => (
                  <LeaderboardRow key={row.key} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside className="col-span-12 xl:col-span-3 border-t border-[var(--v3-border-subtle)] pt-4 px-4">
        <h3 className="text-sm font-semibold text-[var(--v3-text-primary)]">Contextual Help</h3>
        <p className="mt-2 text-xs text-[var(--v3-text-secondary)]">
          {contextualHelpText(selectedContext)}
        </p>
        <div className="mt-3 text-xs text-[var(--v3-text-secondary)]">
          Selection: <span className="text-[var(--v3-text-primary)]">{selectedContext.label}</span>
        </div>
        {hierarchy.orphanEvidenceGlobal.length > 0 && (
          <div className="mt-3 text-xs text-[var(--v3-teal-light)]">
            Orphan evidence detected: {hierarchy.orphanEvidenceGlobal.length}. These records are excluded from completion and leaderboard scoring.
          </div>
        )}
      </aside>
    </div>
  );
}

function contextualHelpText(context: SelectedContext): string {
  switch (context.kind) {
    case 'year': return 'Year selected: yearly compliance readiness across all events and weighted CES completion.';
    case 'month': return 'Month selected: monthly compliance execution, missing evidence, and pending signatures.';
    case 'event': return 'Event selected: event-level evidence requirements, package status, and audit readiness gates.';
    case 'task': return 'Task selected: story points, weighted requirement completion, and required actions.';
    case 'requirement': return 'Requirement selected: completion contribution, linked artifacts, and audit trace references.';
    case 'leaderboard': return 'Leaderboard selected: score favors certified, on-time, audit-ready completion over raw task count.';
    default: return 'Select a hierarchy node for contextual guidance.';
  }
}

function buildExplorerView(
  years: YearHierarchyNode[],
  selection: ExplorerSelection,
  setSelection: (selection: ExplorerSelection) => void,
  setSelectedContext: (context: SelectedContext) => void,
  onSelectEvent?: (eventId: string) => void,
): { title: string; breadcrumb: string[]; metrics: HierarchyMetrics; items: ExplorerItem[] } {
  const rootMetrics = aggregateEventMetrics(years.map(year => year.metrics));
  if (selection.kind === 'root') {
    return {
      title: 'Evidence',
      breadcrumb: ['Evidence'],
      metrics: rootMetrics,
      items: years.map(year => ({
        kind: 'folder',
        id: String(year.year),
        name: String(year.year),
        subtitle: `${year.metrics.totalEvents} events, ${year.metrics.totalTasks} tasks`,
        metrics: year.metrics,
        onOpen: () => {
          setSelection({ kind: 'year', year: year.year });
          setSelectedContext({ kind: 'year', label: `${year.year} compliance readiness` });
        },
      })),
    };
  }

  const selectedYear = selection.kind === 'year' || selection.kind === 'month'
    ? selection.year
    : years[0]?.year;
  const year = years.find(item => item.year === selectedYear) ?? years[0];
  if (!year) return { title: 'No evidence folders', breadcrumb: ['Evidence'], metrics: rootMetrics, items: [] };

  if (selection.kind === 'year') {
    const months = monthsForYear(year);
    return {
      title: `${year.year}`,
      breadcrumb: ['Evidence', String(year.year)],
      metrics: year.metrics,
      items: months.map(month => ({
        kind: 'folder',
        id: `${year.year}-${month.month}`,
        name: month.label,
        subtitle: `${month.metrics.totalEvents} events, ${month.metrics.totalTasks} tasks`,
        metrics: month.metrics,
        onOpen: () => {
          setSelection({ kind: 'month', year: year.year, month: month.month });
          setSelectedContext({ kind: 'month', label: `${month.label} compliance execution` });
        },
      })),
    };
  }

  const months = monthsForYear(year);
  const selectedMonth = selection.kind === 'month' ? selection.month : months[0]?.month;
  const month = months.find(item => item.month === selectedMonth) ?? months[0];
  if (!month) return { title: `${year.year}`, breadcrumb: ['Evidence', String(year.year)], metrics: year.metrics, items: [] };

  if (selection.kind === 'month') {
    return {
      title: month.label,
      breadcrumb: ['Evidence', String(year.year), month.label],
      metrics: month.metrics,
      items: month.events.map(eventNode => ({
        kind: 'folder',
        id: eventNode.eventId,
        name: eventNode.event?.title || eventNode.eventId,
        subtitle: `${eventNode.eventId} - ${eventNode.event?.date || eventNode.date.slice(0, 10)}`,
        metrics: eventNode.metrics,
        onOpen: () => {
          setSelection({ kind: 'event', eventId: eventNode.eventId });
          setSelectedContext({ kind: 'event', label: eventNode.event?.title || eventNode.eventId });
          onSelectEvent?.(eventNode.eventId);
        },
      })),
    };
  }

  const eventNode = selection.kind === 'event'
    ? years
      .flatMap(item => item.quarters)
      .flatMap(item => item.months)
      .flatMap(item => item.events)
      .find(item => item.eventId === selection.eventId)
    : null;

  if (selection.kind === 'event' && eventNode) {
    return {
      title: eventNode.event?.title || eventNode.eventId,
      breadcrumb: ['Evidence', String(eventNode.year), monthName(eventNode.month), eventNode.event?.title || eventNode.eventId],
      metrics: eventNode.metrics,
      items: eventNode.tasks.map(taskNode => ({
        kind: 'folder',
        id: taskNode.task.task_id,
        name: taskNode.task.title,
        subtitle: `${taskNode.task.task_id} - ${taskNode.status} - ${taskNode.storyPoints} story points`,
        metrics: metricsFromTask(taskNode),
        onOpen: () => {
          setSelection({ kind: 'task', taskId: taskNode.task.task_id });
          setSelectedContext({ kind: 'task', label: taskNode.task.title });
        },
      })),
    };
  }

  const taskNode = selection.kind === 'task'
    ? years
      .flatMap(item => item.quarters)
      .flatMap(item => item.months)
      .flatMap(item => item.events)
      .flatMap(item => item.tasks)
      .find(item => item.task.task_id === selection.taskId)
    : null;

  if (selection.kind === 'task' && taskNode) {
    const requirementRows: ExplorerItem[] = taskNode.requirements.map(requirement => ({
      kind: 'record',
      id: requirement.requirement_id,
      name: requirement.title,
      subtitle: `${requirement.type} - ${requirement.actionNeeded}`,
      status: requirement.status,
      completion: requirement.completionPercentage,
      audit: requirement.completionPercentage,
    }));
    const artifactRows: ExplorerItem[] = taskNode.linkedEvidence.map(doc => ({
      kind: 'record',
      id: doc.id,
      name: doc.name || doc.id,
      subtitle: doc.policyId || doc.eventId || 'Evidence artifact',
      status: doc.status,
      completion: doc.status === 'EVIDENCE_LOCKED' ? 100 : 0,
      audit: doc.status === 'EVIDENCE_LOCKED' ? 100 : 0,
    }));
    return {
      title: taskNode.task.title,
      breadcrumb: ['Evidence', taskNode.task.event_id || 'Event', taskNode.task.task_id],
      metrics: metricsFromTask(taskNode),
      items: [...requirementRows, ...artifactRows],
    };
  }

  return {
    title: String(year.year),
    breadcrumb: ['Evidence', String(year.year)],
    metrics: year.metrics,
    items: [],
  };
}

function ExplorerRow({ item }: { item: ExplorerItem }) {
  const completion = item.kind === 'folder' ? item.metrics.completionPercentage : item.completion;
  const audit = item.kind === 'folder' ? item.metrics.auditReadinessPercentage : item.audit;
  const evidenceLabel = item.kind === 'folder'
    ? `${item.metrics.certifiedEvidenceCount}/${Math.max(1, item.metrics.requiredEvidenceCount)}`
    : item.status;
  const content = (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className="relative h-16 w-20">
        <div className="absolute left-3 top-2 h-3 w-9 rounded-t-md bg-white/10" />
        <div className="absolute inset-x-1 top-4 h-11 rounded-lg border border-[var(--v3-border-subtle)] bg-white/[0.07]" />
        <div
          className="absolute right-0 top-1 flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-semibold text-[var(--v3-text-primary)]"
          style={{ background: `conic-gradient(var(--v3-teal-light) ${completion * 3.6}deg, rgba(255,255,255,0.14) 0deg)` }}
          aria-label={`${completion}% complete`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--v3-base-bg)]">
            {completion}%
          </span>
        </div>
        {item.kind === 'record' && <FileText size={16} className="absolute left-7 top-7 text-[var(--v3-text-tertiary)]" />}
      </div>
      <div className="mt-2 w-full truncate text-[12px] font-semibold text-[var(--v3-text-primary)]">{item.name}</div>
      <div className="mt-1 h-1 w-14 rounded-full bg-white/20" />
      <div className="mt-1 text-[10px] text-[var(--v3-text-tertiary)]">{audit}% audit · {evidenceLabel}</div>
    </div>
  );

  if (item.kind === 'folder') {
    return (
      <button type="button" onClick={item.onOpen} className="block w-full rounded-xl p-2 transition-colors hover:bg-white/[0.03]">
        {content}
      </button>
    );
  }
  return <div className="rounded-xl p-2">{content}</div>;
}

function FolderTreeButton({
  label,
  active,
  open,
  onClick,
}: {
  label: string;
  active: boolean;
  open?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
        active ? 'bg-[rgba(0,209,193,0.10)] text-[var(--v3-teal-light)]' : 'text-[var(--v3-text-secondary)] hover:bg-white/[0.03]'
      }`}
    >
      <Folder size={14} className="shrink-0" />
      <span className="min-w-3 text-[10px]">{open == null ? '' : open ? '-' : '+'}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function isSelected(current: ExplorerSelection, target: ExplorerSelection): boolean {
  return JSON.stringify(current) === JSON.stringify(target);
}

function metricsFromTask(taskNode: YearHierarchyNode['quarters'][number]['months'][number]['events'][number]['tasks'][number]): HierarchyMetrics {
  return {
    totalEvents: 0,
    totalTasks: 1,
    totalExecutionRequirements: taskNode.requirements.length,
    completedTasks: taskNode.weightedCompletionPercentage >= 100 ? 1 : 0,
    completedRequirements: taskNode.requirements.filter(req => req.completionPercentage >= 100).length,
    totalStoryPoints: taskNode.storyPoints,
    completedStoryPoints: Math.round((taskNode.weightedCompletionPercentage / 100) * taskNode.storyPoints),
    completionPercentage: taskNode.weightedCompletionPercentage,
    auditReadinessPercentage: taskNode.auditReadinessPercentage,
    requiredEvidenceCount: taskNode.requirements.filter(req => req.type === 'SUPPORTING_EVIDENCE_UPLOAD').length,
    certifiedEvidenceCount: taskNode.linkedEvidence.filter(doc => doc.status === 'EVIDENCE_LOCKED').length,
    missingEvidenceCount: taskNode.requirements.filter(req => req.type === 'SUPPORTING_EVIDENCE_UPLOAD' && req.completionPercentage < 100).length,
    lockedEvidenceCount: taskNode.linkedEvidence.filter(doc => doc.status === 'EVIDENCE_LOCKED').length,
    pendingSignatureCount: taskNode.pendingSignatures,
    blockedTaskCount: taskNode.isBlocked ? 1 : 0,
  };
}

function monthName(month: number): string {
  return new Date(2026, month, 1).toLocaleDateString('en-US', { month: 'long' });
}

function monthsForYear(year: YearHierarchyNode): YearHierarchyNode['quarters'][number]['months'] {
  return year.quarters
    .flatMap(quarter => quarter.months)
    .sort((a, b) => a.month - b.month);
}

function applyFilters(years: YearHierarchyNode[], filters: HierarchyFilters): YearHierarchyNode[] {
  const yearMatch = (year: number) => !filters.year || String(year) === filters.year;
  return years
    .filter(year => yearMatch(year.year))
    .map(year => ({
      ...year,
      quarters: year.quarters
        .filter(quarter => !filters.quarter || quarter.quarter === filters.quarter)
        .map(quarter => ({
          ...quarter,
          months: quarter.months
            .filter(month => !filters.month || month.label === filters.month)
            .map(month => ({
              ...month,
              events: month.events
                .map(event => ({
                  ...event,
                  tasks: event.tasks.filter(task => {
                    if (filters.taskStatus && task.status !== filters.taskStatus) return false;
                    if (filters.assigned) {
                      const assigned = task.task.assignee || task.task.owner || '';
                      if (!assigned.toLowerCase().includes(filters.assigned.toLowerCase())) return false;
                    }
                    if (filters.requirementStatus && !task.requirements.some(req => req.status === filters.requirementStatus as ExecutionRequirementStatus)) return false;
                    if (filters.evidenceStatus && !task.linkedEvidence.some(doc => doc.status === filters.evidenceStatus)) return false;
                    if (filters.signatureStatus === 'pending' && task.pendingSignatures <= 0) return false;
                    if (filters.signatureStatus === 'complete' && task.pendingSignatures > 0) return false;
                    if (filters.missingEvidenceOnly && !task.requirements.some(req => req.type === 'SUPPORTING_EVIDENCE_UPLOAD' && req.completionPercentage < 100)) return false;
                    if (filters.lockedEvidenceOnly && !task.linkedEvidence.some(doc => doc.status === 'EVIDENCE_LOCKED')) return false;
                    if (filters.pendingSignatureOnly && task.pendingSignatures === 0) return false;
                    if (filters.blockedTasksOnly && !task.isBlocked) return false;
                    if (filters.orphanOnly && event.orphanEvidence.length === 0) return false;
                    return true;
                  }),
                }))
                .filter(event => {
                  if (filters.eventStatus === 'complete' && event.metrics.completionPercentage < 100) return false;
                  if (filters.eventStatus === 'in_progress' && (event.metrics.completionPercentage === 0 || event.metrics.completionPercentage >= 100)) return false;
                  if (filters.eventStatus === 'blocked' && event.metrics.blockedTaskCount === 0) return false;
                  if (filters.orphanOnly && event.orphanEvidence.length === 0) return false;
                  return event.tasks.length > 0 || event.orphanEvidence.length > 0;
                }),
            }))
            .filter(month => month.events.length > 0),
        }))
        .filter(quarter => quarter.months.length > 0),
    }))
    .filter(year => year.quarters.length > 0)
    .map(recomputeMetrics);
}

function recomputeMetrics(yearNode: YearHierarchyNode): YearHierarchyNode {
  const withMonths = {
    ...yearNode,
    quarters: yearNode.quarters.map(quarter => ({
      ...quarter,
      months: quarter.months.map(month => {
        const metrics = aggregateEventMetrics(month.events.map(event => event.metrics));
        return { ...month, metrics };
      }),
    })),
  };
  const withQuarterMetrics = {
    ...withMonths,
    quarters: withMonths.quarters.map(quarter => ({
      ...quarter,
      metrics: aggregateEventMetrics(quarter.months.map(month => month.metrics)),
    })),
  };
  return {
    ...withQuarterMetrics,
    metrics: aggregateEventMetrics(withQuarterMetrics.quarters.map(quarter => quarter.metrics)),
  };
}

function aggregateEventMetrics(metricsList: HierarchyMetrics[]): HierarchyMetrics {
  const base: HierarchyMetrics = {
    totalEvents: 0,
    totalTasks: 0,
    totalExecutionRequirements: 0,
    completedTasks: 0,
    completedRequirements: 0,
    totalStoryPoints: 0,
    completedStoryPoints: 0,
    completionPercentage: 0,
    auditReadinessPercentage: 0,
    requiredEvidenceCount: 0,
    certifiedEvidenceCount: 0,
    missingEvidenceCount: 0,
    lockedEvidenceCount: 0,
    pendingSignatureCount: 0,
    blockedTaskCount: 0,
  };
  const total = metricsList.reduce((acc, m) => ({
    totalEvents: acc.totalEvents + m.totalEvents,
    totalTasks: acc.totalTasks + m.totalTasks,
    totalExecutionRequirements: acc.totalExecutionRequirements + m.totalExecutionRequirements,
    completedTasks: acc.completedTasks + m.completedTasks,
    completedRequirements: acc.completedRequirements + m.completedRequirements,
    totalStoryPoints: acc.totalStoryPoints + m.totalStoryPoints,
    completedStoryPoints: acc.completedStoryPoints + m.completedStoryPoints,
    completionPercentage: 0,
    auditReadinessPercentage: 0,
    requiredEvidenceCount: acc.requiredEvidenceCount + m.requiredEvidenceCount,
    certifiedEvidenceCount: acc.certifiedEvidenceCount + m.certifiedEvidenceCount,
    missingEvidenceCount: acc.missingEvidenceCount + m.missingEvidenceCount,
    lockedEvidenceCount: acc.lockedEvidenceCount + m.lockedEvidenceCount,
    pendingSignatureCount: acc.pendingSignatureCount + m.pendingSignatureCount,
    blockedTaskCount: acc.blockedTaskCount + m.blockedTaskCount,
  }), base);
  total.completionPercentage = total.totalStoryPoints > 0 ? Math.round((total.completedStoryPoints / total.totalStoryPoints) * 100) : 0;
  total.auditReadinessPercentage = total.totalExecutionRequirements > 0 ? Math.round((total.completedRequirements / total.totalExecutionRequirements) * 100) : 0;
  return total;
}

function aggregateYearMetrics(years: YearHierarchyNode[]): HierarchyMetrics {
  return aggregateEventMetrics(years.map(year => year.metrics));
}

function monthOptions(years: YearHierarchyNode[]): string[] {
  const labels = new Set<string>();
  years.forEach(year => year.quarters.forEach(quarter => quarter.months.forEach(month => labels.add(month.label))));
  return Array.from(labels);
}

function assigneeOptions(years: YearHierarchyNode[]): string[] {
  const labels = new Set<string>();
  years.forEach(year => year.quarters.forEach(quarter => quarter.months.forEach(month => month.events.forEach(event => event.tasks.forEach(task => {
    const value = task.task.assignee || task.task.owner;
    if (value) labels.add(value);
  })))));
  return Array.from(labels).sort((a, b) => a.localeCompare(b));
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11px] text-[var(--v3-text-secondary)]">
      <span className="mb-1 block uppercase tracking-wide text-[var(--v3-text-tertiary)]">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded border border-[var(--v3-border-subtle)] bg-transparent px-2 py-1 text-xs text-[var(--v3-text-primary)]"
      >
        {options.map(option => (
          <option key={option} value={option}>{option || 'All'}</option>
        ))}
      </select>
    </label>
  );
}

function CheckToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-1">
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function MetricsSummary({ metrics }: { metrics: HierarchyMetrics }) {
  const stat = (label: string, value: string | number) => (
    <div className="flex items-baseline gap-2">
      <div className="text-xs text-[var(--v3-text-primary)]">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--v3-text-tertiary)]">{label}</div>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {stat('Events', metrics.totalEvents)}
      {stat('Tasks', metrics.totalTasks)}
      {stat('Reqs', metrics.totalExecutionRequirements)}
      {stat('Completion', `${metrics.completionPercentage}%`)}
      {stat('Audit Ready', `${metrics.auditReadinessPercentage}%`)}
      {stat('Locked Evidence', metrics.lockedEvidenceCount)}
    </div>
  );
}

function LeaderboardRow({ row }: { row: LeaderboardEntry }) {
  return (
    <tr className="border-t border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)]">
      <td className="py-1">{row.userOrRole}</td>
      <td className="py-1 text-right">{row.storyPointsCompleted}</td>
      <td className="py-1 text-right">{row.evidencePackagesCertified}</td>
      <td className="py-1 text-right">{row.onTimeCompletionPercentage}%</td>
      <td className="py-1 text-right">{row.overdueItems}</td>
      <td className="py-1 text-right">{row.rejectedEvidenceCount}</td>
      <td className="py-1 text-right">{row.auditPerfectEvents}</td>
      <td className="py-1 text-right text-[var(--v3-teal-light)]">{row.performanceScore}</td>
    </tr>
  );
}
