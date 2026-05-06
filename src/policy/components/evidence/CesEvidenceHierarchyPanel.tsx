import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventExecutionAuditEvent } from '@/policy/compliance-execution/types';
import type { Task } from '@/policy/pm/types';
import type { ApprovalRequest, EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import {
  buildCesEvidenceHierarchy,
  type CesExecutionRequirement,
  type EventHierarchyNode,
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
  | { kind: 'quarter'; label: string }
  | { kind: 'month'; label: string }
  | { kind: 'event'; label: string }
  | { kind: 'task'; label: string }
  | { kind: 'requirement'; label: string }
  | { kind: 'leaderboard'; label: string };

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
  const defaultQuarter = `Q${Math.floor(now.getMonth() / 3) + 1}`;
  const [filters, setFilters] = useState<HierarchyFilters>({
    year: String(now.getFullYear()),
    quarter: defaultQuarter,
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
  const [expandedQuarters, setExpandedQuarters] = useState<Record<string, boolean>>({ [`${now.getFullYear()}-${defaultQuarter}`]: true });
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [selectedContext, setSelectedContext] = useState<SelectedContext>({ kind: 'month', label: 'Monthly compliance execution' });

  const hierarchy = useMemo(() => buildCesEvidenceHierarchy({
    events,
    tasks,
    evidenceByEvent,
    approvals,
    auditByEvent,
  }), [events, tasks, evidenceByEvent, approvals, auditByEvent]);

  const filteredYears = useMemo(() => applyFilters(hierarchy.years, filters), [hierarchy.years, filters]);
  const compactMetrics = useMemo(() => aggregateYearMetrics(filteredYears), [filteredYears]);

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4">
      <section className="col-span-12 xl:col-span-9">
        <div className="rounded border border-white/15 bg-[#0a1626]">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">CES Evidence Hierarchy</h2>
            <p className="mt-1 text-xs text-white/70">
              Year → Quarter → Month → Event → Task → Execution Requirements. Operational completion and audit readiness are calculated separately.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-6">
              <FilterSelect label="Year" value={filters.year} onChange={value => setFilters(prev => ({ ...prev, year: value }))} options={['', ...hierarchy.years.map(y => String(y.year))]} />
              <FilterSelect label="Quarter" value={filters.quarter} onChange={value => setFilters(prev => ({ ...prev, quarter: value }))} options={['', 'Q1', 'Q2', 'Q3', 'Q4']} />
              <FilterSelect label="Month" value={filters.month} onChange={value => setFilters(prev => ({ ...prev, month: value }))} options={['', ...monthOptions(filteredYears)]} />
              <FilterSelect label="Task Status" value={filters.taskStatus} onChange={value => setFilters(prev => ({ ...prev, taskStatus: value }))} options={['', 'todo', 'in_progress', 'in_review', 'blocked', 'done']} />
              <FilterSelect label="Requirement Status" value={filters.requirementStatus} onChange={value => setFilters(prev => ({ ...prev, requirementStatus: value }))} options={['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']} />
              <FilterSelect label="Assigned" value={filters.assigned} onChange={value => setFilters(prev => ({ ...prev, assigned: value }))} options={['', ...assigneeOptions(filteredYears)]} />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/75">
              <CheckToggle label="Missing evidence only" checked={filters.missingEvidenceOnly} onChange={checked => setFilters(prev => ({ ...prev, missingEvidenceOnly: checked }))} />
              <CheckToggle label="Locked evidence only" checked={filters.lockedEvidenceOnly} onChange={checked => setFilters(prev => ({ ...prev, lockedEvidenceOnly: checked }))} />
              <CheckToggle label="Pending signature only" checked={filters.pendingSignatureOnly} onChange={checked => setFilters(prev => ({ ...prev, pendingSignatureOnly: checked }))} />
              <CheckToggle label="Blocked tasks only" checked={filters.blockedTasksOnly} onChange={checked => setFilters(prev => ({ ...prev, blockedTasksOnly: checked }))} />
              <CheckToggle label="Orphan evidence only" checked={filters.orphanOnly} onChange={checked => setFilters(prev => ({ ...prev, orphanOnly: checked }))} />
            </div>
          </div>

          <div className="px-4 py-3">
            <MetricsSummary metrics={compactMetrics} />
            <div className="mt-3 space-y-2">
              {filteredYears.map(yearNode => {
                const yearOpen = expandedYears[yearNode.year] ?? yearNode.year === now.getFullYear();
                return (
                  <div key={yearNode.year} className="rounded border border-white/10">
                    <RowButton
                      label={`${yearNode.year}`}
                      metrics={yearNode.metrics}
                      open={yearOpen}
                      onClick={() => {
                        setExpandedYears(prev => ({ ...prev, [yearNode.year]: !yearOpen }));
                        setSelectedContext({ kind: 'year', label: `${yearNode.year} compliance readiness` });
                      }}
                    />
                    {yearOpen && (
                      <div className="space-y-2 border-t border-white/10 p-2">
                        {yearNode.quarters.map(quarterNode => {
                          const quarterKey = `${yearNode.year}-${quarterNode.quarter}`;
                          const quarterOpen = expandedQuarters[quarterKey] ?? quarterNode.quarter === defaultQuarter;
                          return (
                            <div key={quarterKey} className="rounded border border-white/10">
                              <RowButton
                                label={`${quarterNode.quarter}`}
                                metrics={quarterNode.metrics}
                                open={quarterOpen}
                                indent
                                onClick={() => {
                                  setExpandedQuarters(prev => ({ ...prev, [quarterKey]: !quarterOpen }));
                                  setSelectedContext({ kind: 'quarter', label: `${quarterNode.quarter} readiness` });
                                }}
                              />
                              {quarterOpen && (
                                <div className="space-y-2 border-t border-white/10 p-2">
                                  {quarterNode.months.map(monthNode => {
                                    const monthKey = `${yearNode.year}-${quarterNode.quarter}-${monthNode.month}`;
                                    const monthOpen = expandedMonths[monthKey] ?? monthNode.month === now.getMonth();
                                    return (
                                      <div key={monthKey} className="rounded border border-white/10">
                                        <RowButton
                                          label={monthNode.label}
                                          metrics={monthNode.metrics}
                                          open={monthOpen}
                                          indent
                                          onClick={() => {
                                            setExpandedMonths(prev => ({ ...prev, [monthKey]: !monthOpen }));
                                            setSelectedContext({ kind: 'month', label: `${monthNode.label} compliance execution` });
                                          }}
                                        />
                                        {monthOpen && (
                                          <div className="space-y-2 border-t border-white/10 p-2">
                                            {monthNode.events.map(eventNode => {
                                              const eventOpen = expandedEvents[eventNode.eventId] ?? false;
                                              return (
                                                <div key={eventNode.eventId} className="rounded border border-white/10 bg-black/10">
                                                  <EventRow
                                                    eventNode={eventNode}
                                                    open={eventOpen}
                                                    onToggle={() => {
                                                      setExpandedEvents(prev => ({ ...prev, [eventNode.eventId]: !eventOpen }));
                                                      setSelectedContext({ kind: 'event', label: eventNode.event?.title || eventNode.eventId });
                                                      onSelectEvent?.(eventNode.eventId);
                                                    }}
                                                  />
                                                  {eventOpen && (
                                                    <div className="space-y-2 border-t border-white/10 p-2">
                                                      {eventNode.tasks.map(taskNode => {
                                                        const taskOpen = expandedTasks[taskNode.task.task_id] ?? false;
                                                        return (
                                                          <div key={taskNode.task.task_id} className="rounded border border-white/10">
                                                            <TaskRow
                                                              taskNode={taskNode}
                                                              open={taskOpen}
                                                              onToggle={() => {
                                                                setExpandedTasks(prev => ({ ...prev, [taskNode.task.task_id]: !taskOpen }));
                                                                setSelectedContext({ kind: 'task', label: taskNode.task.title });
                                                              }}
                                                            />
                                                            {taskOpen && (
                                                              <div className="space-y-1 border-t border-white/10 p-2">
                                                                {taskNode.requirements.map(req => (
                                                                  <RequirementRow
                                                                    key={req.requirement_id}
                                                                    requirement={req}
                                                                    onSelect={() => setSelectedContext({ kind: 'requirement', label: req.title })}
                                                                  />
                                                                ))}
                                                              </div>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                      {eventNode.orphanEvidence.length > 0 && (
                                                        <div className="rounded border border-orange-500/40 bg-orange-500/10 p-2 text-xs text-orange-200">
                                                          Needs Review / Orphan Evidence: {eventNode.orphanEvidence.length}
                                                          {' '}items (excluded from completion and audit readiness).
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded border border-white/15 bg-[#0a1626] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Performance Leaderboard</h3>
            <button
              type="button"
              onClick={() => setSelectedContext({ kind: 'leaderboard', label: 'Story points and audit-ready scoring' })}
              className="text-xs text-teal-200 underline"
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

      <aside className="col-span-12 xl:col-span-3 rounded border border-white/15 bg-[#0a1626] p-4">
        <h3 className="text-sm font-semibold text-white">Contextual Help</h3>
        <p className="mt-2 text-xs text-white/70">
          {contextualHelpText(selectedContext)}
        </p>
        <div className="mt-3 rounded border border-white/10 bg-black/10 p-2 text-xs text-white/70">
          Selection: <span className="text-white">{selectedContext.label}</span>
        </div>
        {hierarchy.orphanEvidenceGlobal.length > 0 && (
          <div className="mt-3 rounded border border-orange-500/40 bg-orange-500/10 p-2 text-xs text-orange-200">
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
    case 'quarter': return 'Quarter selected: quarterly readiness and blocked execution hotspots.';
    case 'month': return 'Month selected: monthly compliance execution, missing evidence, and pending signatures.';
    case 'event': return 'Event selected: event-level evidence requirements, package status, and audit readiness gates.';
    case 'task': return 'Task selected: story points, weighted requirement completion, and required actions.';
    case 'requirement': return 'Requirement selected: completion contribution, linked artifacts, and audit trace references.';
    case 'leaderboard': return 'Leaderboard selected: score favors certified, on-time, audit-ready completion over raw task count.';
    default: return 'Select a hierarchy node for contextual guidance.';
  }
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
    <label className="text-[11px] text-white/70">
      <span className="mb-1 block uppercase tracking-wide text-white/60">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded border border-white/20 bg-black/20 px-2 py-1 text-xs text-white"
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
    <div className="rounded border border-white/10 bg-black/10 px-2 py-1">
      <div className="text-[10px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="text-xs text-white">{value}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
      {stat('Events', metrics.totalEvents)}
      {stat('Tasks', metrics.totalTasks)}
      {stat('Reqs', metrics.totalExecutionRequirements)}
      {stat('Completion', `${metrics.completionPercentage}%`)}
      {stat('Audit Ready', `${metrics.auditReadinessPercentage}%`)}
      {stat('Locked Evidence', metrics.lockedEvidenceCount)}
    </div>
  );
}

function RowButton({
  label,
  metrics,
  open,
  indent = false,
  onClick,
}: {
  label: string;
  metrics: HierarchyMetrics;
  open: boolean;
  indent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-white/5 ${indent ? 'pl-5' : ''}`}
    >
      <span className="text-white">{open ? '▾' : '▸'} {label}</span>
      <span className="flex items-center gap-2 text-white/70">
        <span>{metrics.totalEvents} events</span>
        <span>{metrics.totalTasks} tasks</span>
        <span className="text-teal-200">{metrics.completionPercentage}% complete</span>
        <span className="text-orange-200">{metrics.auditReadinessPercentage}% audit ready</span>
      </span>
    </button>
  );
}

function EventRow({
  eventNode,
  open,
  onToggle,
}: {
  eventNode: EventHierarchyNode;
  open: boolean;
  onToggle: () => void;
}) {
  const event = eventNode.event;
  const policyText = event?.policyRefs?.join(', ') || 'Needs confirmation';
  const workflow = event?.workflowId || 'Needs confirmation';
  return (
    <button type="button" onClick={onToggle} className="w-full px-3 py-2 text-left text-xs hover:bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white">{open ? '▾' : '▸'} {event?.title || eventNode.eventId}</div>
          <div className="mt-1 text-white/65">ID: {eventNode.eventId} · Date: {event?.date || eventNode.date.slice(0, 10)}</div>
          <div className="text-white/65">Policy: {policyText}</div>
          <div className="text-white/65">Workflow: {workflow} · Required forms: {event?.requiredForms?.length ?? 0}</div>
        </div>
        <div className="text-right text-white/70">
          <div className="text-teal-200">{eventNode.metrics.completionPercentage}% Complete</div>
          <div className="text-orange-200">{eventNode.metrics.auditReadinessPercentage}% Audit Ready</div>
          <div>{eventNode.metrics.certifiedEvidenceCount}/{Math.max(1, eventNode.metrics.requiredEvidenceCount)} Evidence Certified</div>
          <div>{eventNode.metrics.pendingSignatureCount} Pending Signature</div>
          <div>{eventNode.metrics.missingEvidenceCount} Missing Uploads</div>
        </div>
      </div>
    </button>
  );
}

function TaskRow({
  taskNode,
  open,
  onToggle,
}: {
  taskNode: EventHierarchyNode['tasks'][number];
  open: boolean;
  onToggle: () => void;
}) {
  const task = taskNode.task;
  const mainForm = 'form_id' in task ? task.form_id : '';
  const mainEvidence = taskNode.linkedEvidence[0]?.id || 'Missing';
  return (
    <button type="button" onClick={onToggle} className="w-full px-3 py-2 text-left text-xs hover:bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white">{open ? '▾' : '▸'} {task.title}</div>
          <div className="text-white/65">Task ID: {task.task_id} · Story points: {taskNode.storyPoints} · Status: {task.status}</div>
          <div className="text-white/65">Required form: {mainForm || '—'} · Evidence: {mainEvidence}</div>
          <div className="text-white/65">Assigned: {task.assignee || task.owner || 'Unassigned'} · Due: {task.due_date || 'Needs confirmation'}</div>
          <div className="mt-1 flex flex-wrap gap-2 text-teal-200">
            <Link to={`/tasks/${encodeURIComponent(task.task_id)}`} target="_blank" rel="noopener noreferrer" className="underline">open task</Link>
            {mainForm ? <Link to={`/forms/${encodeURIComponent(mainForm)}`} target="_blank" rel="noopener noreferrer" className="underline">open form</Link> : null}
            <Link to={`/evidence?event_id=${encodeURIComponent(task.event_id ?? '')}&task_id=${encodeURIComponent(task.task_id ?? '')}`} target="_blank" rel="noopener noreferrer" className="underline">upload supporting evidence</Link>
            <Link to={`/evidence?event_id=${encodeURIComponent(task.event_id ?? '')}&task_id=${encodeURIComponent(task.task_id ?? '')}`} target="_blank" rel="noopener noreferrer" className="underline">view evidence package</Link>
            <Link to={`/calendar/event/${encodeURIComponent(task.event_id ?? '')}/approval`} target="_blank" rel="noopener noreferrer" className="underline">request signature</Link>
            <Link to={`/audit?event=${encodeURIComponent(task.event_id ?? '')}`} target="_blank" rel="noopener noreferrer" className="underline">view audit log</Link>
          </div>
        </div>
        <div className="text-right text-white/70">
          <div className="text-teal-200">{taskNode.weightedCompletionPercentage}% Weighted Completion</div>
          <div className="text-orange-200">{taskNode.auditReadinessPercentage}% Audit Readiness</div>
          <div>Package: {taskNode.packageState}</div>
          <div>{taskNode.pendingSignatures} Pending Signature</div>
        </div>
      </div>
    </button>
  );
}

function RequirementRow({
  requirement,
  onSelect,
}: {
  requirement: CesExecutionRequirement;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="w-full rounded border border-white/10 bg-black/10 px-2 py-1 text-left text-xs hover:bg-white/5">
      <div className="flex items-center justify-between">
        <div className="text-white">{requirement.title}</div>
        <div className="text-right text-white/70">
          <div>{requirement.type} · {requirement.weightPercentage}%</div>
          <div>{requirement.status} · {requirement.completionPercentage}%</div>
        </div>
      </div>
      <div className="mt-1 text-white/65">
        Linked form: {requirement.form_id || '—'} · Linked evidence: {requirement.evidence_id || '—'} · Action: {requirement.actionNeeded}
      </div>
      <div className="text-white/50">Audit refs: {requirement.auditTrailReferences.join(', ') || '—'}</div>
    </button>
  );
}

function LeaderboardRow({ row }: { row: LeaderboardEntry }) {
  return (
    <tr className="border-t border-white/10 text-white/80">
      <td className="py-1">{row.userOrRole}</td>
      <td className="py-1 text-right">{row.storyPointsCompleted}</td>
      <td className="py-1 text-right">{row.evidencePackagesCertified}</td>
      <td className="py-1 text-right">{row.onTimeCompletionPercentage}%</td>
      <td className="py-1 text-right">{row.overdueItems}</td>
      <td className="py-1 text-right">{row.rejectedEvidenceCount}</td>
      <td className="py-1 text-right">{row.auditPerfectEvents}</td>
      <td className="py-1 text-right text-teal-200">{row.performanceScore}</td>
    </tr>
  );
}
