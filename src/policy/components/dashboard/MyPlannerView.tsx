/**
 * MyPlannerView — user-scoped personal workspace embedded inside Command Center.
 * Replaces the shared Action Board when "My Planner" toggle is active.
 *
 * Reuses:
 *   - CES obligation model + selectMy* selectors (primaryOwnerUserId / assignedUserIds / owner.userId)
 *   - PM personal tasks (usePmPersonalStore)
 *   - Existing visual language (ci-operational-card, TaskCard shells, orange accents)
 *   - getCurrentUserId() as the single source of truth for "me"
 *
 * No new backend, zero data duplication, full audit trail preserved via stores.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, AlertTriangle, CheckCircle2, FileText, User,
  ArrowRight, X,
} from 'lucide-react';
import { TODAY_ANCHOR } from '@/policy/data/regulatoryEvents';
import { useObligations } from '@/policy/ces/obligations';
import { usePmPersonalStore } from '@/policy/pm/personalStore';
import { getCurrentUserId } from '@/policy/pm/currentUser';
import type { MergedExecutionUnit } from '@/policy/compliance-execution/complianceExecutionTypes';
import type { PersonalTask } from '@/policy/pm/types';
import { ActionButton, EmptyState, UtilityButton } from '@/policy/components/ui';

type PlannerFilter = 'all' | 'open' | 'overdue' | 'this-week' | 'evidence';

interface NewPersonalTaskForm {
  title: string;
  due_date: string;
  description: string;
  linked_event_id?: string;
}

export interface MyPlannerViewProps {
  showHeader?: boolean;
  embeddedTitle?: string;
}

export function MyPlannerView({ showHeader = true, embeddedTitle }: MyPlannerViewProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PlannerFilter>('all');
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTask, setNewTask] = useState<NewPersonalTaskForm>({
    title: '',
    due_date: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const currentUserId = getCurrentUserId();
  const obligationsApi = useObligations();
  const personalStore = usePmPersonalStore();
  const recentThreshold = useMemo(() => new Date(TODAY_ANCHOR.getTime() - 1000 * 86400 * 14), []);

  // === CES / Compliance tasks assigned to me ===
  const myCesTasks = useMemo(() => {
    const allMy = obligationsApi.getMyTasks({ userId: currentUserId });
    return allMy.filter(t => t.complianceState !== 'completed');
  }, [obligationsApi, currentUserId]);

  const myOverdue = useMemo(
    () => myCesTasks.filter(t => (t.escalationTimer ?? 0) < 0),
    [myCesTasks]
  );

  const myCritical = useMemo(
    () => myCesTasks.filter(t => t.auditReadiness === 'not_ready' || t.complianceState === 'blocked'),
    [myCesTasks]
  );

  const myEvidencePending = useMemo(
    () => myCesTasks.filter(t => hasPendingEvidence(t.evidenceStatus)),
    [myCesTasks]
  );

  // === Personal tasks (PM layer) owned by me ===
  const myPersonalTasks = useMemo(() => {
    return personalStore.list(currentUserId).filter(t => t.status !== 'done');
  }, [personalStore, currentUserId]);

  // Merge for "My Tasks" primary list (CES first, then personal)
  const combinedMyTasks = useMemo(() => {
    const cesAsCards = myCesTasks.map(toPlannerCard);
    const persAsCards = myPersonalTasks.map(p => toPersonalPlannerCard(p));
    let all = [...cesAsCards, ...persAsCards];

    if (search.trim()) {
      const q = search.toLowerCase();
      all = all.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle || '').toLowerCase().includes(q) ||
        (c.policyLink || '').toLowerCase().includes(q)
      );
    }

    // Apply filter
    switch (filter) {
      case 'overdue':
        all = all.filter(c => c.isOverdue);
        break;
      case 'this-week':
        all = all.filter(c => c.dueSoon);
        break;
      case 'evidence':
        all = all.filter(c => c.hasEvidencePending);
        break;
      default:
        break;
    }
    return all.slice(0, 24); // safety cap for dashboard embedding
  }, [myCesTasks, myPersonalTasks, search, filter]);

  // Sprint-scoped (simple heuristic: obligations that have sprintId or are recent)
  const mySprintItems = useMemo(() => {
    return myCesTasks
      .filter(t => t.sprintId || (t.dueDate && new Date(t.dueDate) > recentThreshold))
      .slice(0, 8);
  }, [myCesTasks, recentThreshold]);

  // Upcoming deadlines (next 7 days from combined)
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    return combinedMyTasks
      .filter(c => {
        if (!c.dueDate) return false;
        const d = new Date(c.dueDate);
        const diff = (d.getTime() - today.getTime()) / 86400000;
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [combinedMyTasks]);

  function handleQuickAdd() {
    if (!newTask.title.trim()) return;

    const created = personalStore.create({
      owner_user_id: currentUserId,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      due_date: newTask.due_date,
      linked_event_id: newTask.linked_event_id,
    }, currentUserId);

    setCreateSuccess(`Personal task “${created.title}” added.`);
    setTimeout(() => setCreateSuccess(null), 2200);

    // reset
    setNewTask({ title: '', due_date: new Date().toISOString().slice(0, 10), description: '' });
    setShowNewForm(false);
  }

  function goToTask(task: PlannerCard) {
    if (task.source === 'ces' && task.id) {
      navigate(`/calendar?event=${encodeURIComponent(task.id)}&workflow=1`);
    } else if (task.source === 'personal') {
      // Personal tasks currently surface in /pm/my-tasks or the global drawer
      navigate('/pm/my-tasks?tab=personal');
    }
  }

  const cardShell = 'bg-transparent border-[var(--v3-border-subtle)] hover:border-[rgba(0,209,193,0.24)]';

  return (
    <div className="space-y-5">
      {/* Planner Header + Quick Actions */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-[var(--v3-teal-light)]" />
              <h3 className="font-semibold ci-text-display-section text-[var(--v3-text-primary)]">
                {embeddedTitle || 'My Planner'}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--v3-text-secondary)]">
                {currentUserId.split('-').pop()}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[var(--v3-text-secondary)]">
              Your personal workload • CES obligations + private tasks • fully traceable
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <UtilityButton ariaLabel="Create personal task" onClick={() => setShowNewForm(s => !s)}>
              <Plus size={15} /> <span className="ml-1.5">New Personal Task</span>
            </UtilityButton>
            <UtilityButton ariaLabel="Open full My Tasks page" onClick={() => navigate('/pm/my-tasks')}>
              Open Full My Tasks <ArrowRight size={14} className="ml-1" />
            </UtilityButton>
          </div>
        </div>
      )}

      {/* Quick Add Form (collapsible) */}
      {showNewForm && (
        <div className="rounded-2xl border border-[var(--v3-border-subtle)] bg-transparent p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm text-[var(--v3-text-primary)]">Quick Add — Personal Task</div>
            <button
              type="button"
              title="Close quick add"
              aria-label="Close quick add"
              onClick={() => setShowNewForm(false)}
              className="text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <input
              type="text"
              title="Personal task title"
              aria-label="Personal task title"
              placeholder="Task title (e.g. Upload Q2 wound-care photos for Patient 4821)"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              className="md:col-span-5 rounded-xl border border-[var(--v3-border-subtle)] bg-transparent px-3 py-2 text-sm text-[var(--v3-text-primary)]"
            />
            <input
              type="date"
              title="Personal task due date"
              aria-label="Personal task due date"
              value={newTask.due_date}
              onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
              className="md:col-span-2 rounded-xl border border-[var(--v3-border-subtle)] bg-transparent px-3 py-2 text-sm text-[var(--v3-text-primary)]"
            />
            <input
              type="text"
              title="Linked policy or event"
              aria-label="Linked policy or event"
              placeholder="Linked policy/event (optional)"
              value={newTask.linked_event_id || ''}
              onChange={e => setNewTask({ ...newTask, linked_event_id: e.target.value || undefined })}
              className="md:col-span-3 rounded-xl border border-[var(--v3-border-subtle)] bg-transparent px-3 py-2 text-sm text-[var(--v3-text-primary)]"
            />
            <ActionButton onClick={handleQuickAdd} className="md:col-span-2">
              Add Task
            </ActionButton>
          </div>
          <input
            type="text"
            title="Personal task description"
            aria-label="Personal task description"
            placeholder="Description / notes (optional)"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            className="mt-2 w-full rounded-xl border border-[var(--v3-border-subtle)] bg-transparent px-3 py-2 text-sm text-[var(--v3-text-primary)]"
          />
          {createSuccess && (
            <div className="mt-2 text-emerald-500 text-sm flex items-center gap-1">
              <CheckCircle2 size={15} /> {createSuccess}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'open', 'overdue', 'this-week', 'evidence'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              filter === f
                ? 'border-[rgba(0,209,193,0.28)] bg-[rgba(0,209,193,0.10)] text-[var(--v3-text-primary)]'
                : 'border-[var(--v3-border-subtle)] bg-transparent text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)]'
            }`}
          >
            {f === 'all' && 'All My Work'}
            {f === 'open' && 'Open'}
            {f === 'overdue' && 'Overdue'}
            {f === 'this-week' && 'This Week'}
            {f === 'evidence' && 'Evidence Queue'}
          </button>
        ))}

        <div className="flex-1" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search my tasks..."
          className="w-48 rounded-full border border-[var(--v3-border-subtle)] bg-transparent px-3 py-1 text-sm text-[var(--v3-text-primary)] placeholder:text-[var(--v3-text-tertiary)]"
        />
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-[var(--v3-border-subtle)] py-3">
        <StatPill label="My Open CES" value={myCesTasks.length} tone="default" />
        <StatPill label="Overdue" value={myOverdue.length} tone="danger" />
        <StatPill label="Evidence Pending" value={myEvidencePending.length} tone="warning" />
        <StatPill label="Personal Tasks" value={myPersonalTasks.length} tone="default" />
      </div>

      {/* Primary My Tasks */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="font-semibold uppercase text-xs tracking-[0.5px] text-[var(--v3-text-tertiary)]">
            MY TASKS ({combinedMyTasks.length})
          </div>
          <button onClick={() => navigate('/my-tasks')} className="text-[var(--v3-teal-light)] text-xs flex items-center gap-1 hover:underline">
            View in My Tasks page <ArrowRight size={13} />
          </button>
        </div>

        {combinedMyTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {combinedMyTasks.map((card, idx) => (
              <PlannerCard key={`${card.source}-${card.id || idx}`} card={card} onClick={() => goToTask(card)} shellClass={cardShell} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircle2 size={26} className="text-emerald-500" />}
            title="All clear — nothing assigned to you right now"
            description="Create a personal task above or wait for new CES assignments."
          />
        )}
      </section>

      {/* Two-column critical + sprint + deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Critical & Overdue */}
        <section className="border-t border-[var(--v3-border-subtle)] px-1 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[var(--v3-teal-light)]" />
            <span className="font-semibold text-[var(--v3-text-primary)]">My Critical &amp; Overdue</span>
            <span className="ml-auto text-xs text-[var(--v3-text-secondary)]">{myOverdue.length + myCritical.length}</span>
          </div>
          {myOverdue.length + myCritical.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {[...myOverdue, ...myCritical].slice(0, 6).map((t, i) => (
                <li key={i} onClick={() => navigate(`/calendar?event=${encodeURIComponent(t.parentEventId || t.id)}&workflow=1`)} className="cursor-pointer flex justify-between border-b border-[var(--v3-border-subtle)] px-1 py-2">
                  <span className="truncate pr-3">{t.title}</span>
                  <span className="text-[var(--v3-text-secondary)] text-xs shrink-0">{t.dueDate?.slice(5)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--v3-text-secondary)]">No personal critical items.</div>
          )}
        </section>

        {/* Sprint + Deadlines */}
        <section className="border-t border-[var(--v3-border-subtle)] px-1 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-[var(--v3-teal-light)]" />
            <span className="font-semibold text-[var(--v3-text-primary)]">This Sprint &amp; Upcoming (7d)</span>
          </div>

          <div className="mb-3">
            <div className="uppercase text-[10px] mb-1 text-[var(--v3-text-tertiary)]">Sprint Assignments</div>
            {mySprintItems.length ? (
              mySprintItems.slice(0, 4).map((t, i) => (
                <div key={i} onClick={() => navigate(`/pm/my-tasks`)} className="text-sm cursor-pointer truncate py-1 text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)]">{t.title}</div>
              ))
            ) : <div className="text-xs text-[var(--v3-text-tertiary)]">No sprint items assigned yet.</div>}
          </div>

          <div>
            <div className="uppercase text-[10px] mb-1 text-[var(--v3-text-tertiary)]">Upcoming Deadlines</div>
            {upcomingDeadlines.length ? (
              upcomingDeadlines.slice(0, 4).map((c, i) => (
                <div key={i} onClick={() => goToTask(c)} className="text-sm cursor-pointer flex justify-between py-1">
                  <span className="truncate">{c.title}</span>
                  <span className="text-[var(--v3-text-secondary)] text-xs">{c.dueDate?.slice(5)}</span>
                </div>
              ))
            ) : <div className="text-xs text-[var(--v3-text-tertiary)]">Nothing due in the next 7 days.</div>}
          </div>
        </section>
      </div>

      {/* Evidence Queue highlight */}
      {myEvidencePending.length > 0 && (
        <div className="border-t border-[var(--v3-border-subtle)] px-1 py-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText size={15} className="text-[var(--v3-teal-light)]" />
            <span className="font-medium text-[var(--v3-text-primary)]">Evidence Queue — {myEvidencePending.length} items need your upload or approval</span>
            <ActionButton size="sm" variant="secondary" onClick={() => navigate('/evidence')} className="ml-auto">
              Open Evidence Center
            </ActionButton>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="text-[11px] px-1 text-[var(--v3-text-tertiary)]">
        All planner actions are fully audited. Personal tasks live only in your private lane (PM personalStore). CES items remain the agency source of truth.
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Small presentational helpers
──────────────────────────────────────────────────────────────── */

interface PlannerCard {
  id: string;
  source: 'ces' | 'personal';
  title: string;
  subtitle?: string;
  dueDate?: string;
  policyLink?: string;
  isOverdue?: boolean;
  dueSoon?: boolean;
  hasEvidencePending?: boolean;
  statusLabel?: string;
}

function toPlannerCard(u: MergedExecutionUnit): PlannerCard {
  const due = u.dueDate;
  const timer = u.escalationTimer ?? 0;
  return {
    id: u.id,
    source: 'ces',
    title: u.title,
    subtitle: u.domain,
    dueDate: due,
    policyLink: u.sourcePolicyIds?.[0],
    isOverdue: timer < 0,
    dueSoon: timer > 0 && timer < 48,
    hasEvidencePending: hasPendingEvidence(u.evidenceStatus),
    statusLabel: u.complianceState,
  };
}

function hasPendingEvidence(status: MergedExecutionUnit['evidenceStatus']): boolean {
  return (
    status.requiredFormsComplete < status.requiredFormsTotal ||
    status.signaturesComplete < status.signaturesRequired ||
    !status.auditIndexCreated
  );
}

function toPersonalPlannerCard(p: PersonalTask): PlannerCard {
  return {
    id: p.task_id,
    source: 'personal',
    title: p.title,
    subtitle: 'Personal',
    dueDate: p.due_date,
    isOverdue: p.due_date ? new Date(p.due_date) < new Date() : false,
    dueSoon: false,
    hasEvidencePending: false,
    statusLabel: p.status,
  };
}

function PlannerCard({ card, onClick, shellClass }: { card: PlannerCard; onClick: () => void; shellClass: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-3.5 transition group ${shellClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--v3-text-tertiary)]">
            {card.subtitle || card.source.toUpperCase()}
          </div>
          <div className="mt-0.5 font-semibold leading-tight line-clamp-2 text-[var(--v3-text-primary)]">
            {card.title}
          </div>
        </div>
        {card.isOverdue && <span className="shrink-0 text-[var(--v3-teal-light)] text-xs font-bold">OVERDUE</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="text-[var(--v3-text-secondary)]">
          {card.dueDate ? `Due ${new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'No due date'}
        </div>
        {card.policyLink && (
          <div className="font-mono text-[10px] px-1.5 py-px rounded bg-white/5 text-[var(--v3-text-secondary)]">{card.policyLink}</div>
        )}
      </div>
    </button>
  );
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: 'default' | 'danger' | 'warning' }) {
  const toneClass = tone === 'danger' || tone === 'warning'
    ? 'text-[var(--v3-teal-light)]'
    : 'text-[var(--v3-text-primary)]';
  return (
    <div className="flex items-baseline gap-2">
      <div className="text-2xl font-semibold tabular-nums mt-0.5 text-[var(--v3-text-primary)]">{value}</div>
      <div className={`text-xs uppercase tracking-widest ${toneClass}`}>{label}</div>
    </div>
  );
}
