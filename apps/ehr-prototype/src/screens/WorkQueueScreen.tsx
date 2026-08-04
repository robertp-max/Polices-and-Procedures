import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FlaskConical,
  ListTodo,
  Search,
  Siren,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import {
  PRIORITY_META,
  WORK_QUEUE,
  WORK_STATUS_META,
} from '../data/workspace'
import type { WorkItemPriority, WorkItemStatus, WorkQueueItem } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import './wq.css'

/** Demo session owner — must match WORK_QUEUE.owner strings for Taylor. */
const DEMO_OWNER = 'Taylor Brooks, RN'

type StatusFilter = 'all' | WorkItemStatus
type PriorityFilter = 'all' | WorkItemPriority
type OwnerFilter = 'all' | 'mine'

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'open', label: 'Open' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'done', label: 'Done' },
]

const PRIORITY_FILTERS: { key: PriorityFilter; label: string }[] = [
  { key: 'all', label: 'All priorities' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

const OWNER_FILTERS: { key: OwnerFilter; label: string }[] = [
  { key: 'all', label: 'All owners' },
  { key: 'mine', label: 'Assigned to me' },
]

function isOverdue(due: string): boolean {
  return due.toLowerCase().includes('overdue')
}

function claimDisabledReason(item: WorkQueueItem): string | null {
  if (item.status === 'done') return 'Item already marked done in this sample.'
  if (item.status === 'waiting') return 'Waiting on external actor — claim is visual only.'
  return null
}

export default function WorkQueueScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(WORK_QUEUE[0]?.id ?? null)

  const mineItems = useMemo(
    () => WORK_QUEUE.filter(item => item.owner === DEMO_OWNER),
    [],
  )
  const mineCount = mineItems.length
  const mineOpenCount = mineItems.filter(i => i.status !== 'done').length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return WORK_QUEUE.filter(item => {
      if (ownerFilter === 'mine' && item.owner !== DEMO_OWNER) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false
      if (!q) return true
      const patient = item.patientId ? getPatient(item.patientId) : undefined
      const hay = [
        item.id,
        item.title,
        item.detail,
        item.owner,
        item.due,
        item.domain,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
        ...item.related.map(r => r.label),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, priorityFilter, ownerFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(i => i.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = WORK_QUEUE.find(i => i.id === selectedId) ?? null

  // Stats reflect the active owner scope so "Mine" is honest.
  const scoped = ownerFilter === 'mine' ? mineItems : WORK_QUEUE
  const openCount = scoped.filter(i => i.status !== 'done').length
  const dueToday = scoped.filter(i => i.due.toLowerCase().includes('today')).length
  const overdueCount = scoped.filter(i => isOverdue(i.due) || i.status === 'escalated').length
  const criticalCount = scoped.filter(i => i.priority === 'critical' || i.priority === 'high').length
  const claimBlock = selected ? claimDisabledReason(selected) : null

  const subtitle =
    ownerFilter === 'mine'
      ? `${mineOpenCount} open of ${mineCount} assigned to ${DEMO_OWNER} · ${WORK_QUEUE.length} agency items total (synthetic).`
      : `${openCount} open of ${WORK_QUEUE.length} agency items · ${mineCount} assigned to me (${DEMO_OWNER}).`

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">
            Domain COR · work queue
            {ownerFilter === 'mine' ? ' · mine' : ' · all owners'}
          </div>
          <h1 className="screen-title">My work queue</h1>
          <div className="screen-sub">{subtitle}</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/today')}>
            Today desk
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no claim is recorded"
            onClick={() => {
              const pool = ownerFilter === 'mine' ? mineItems : WORK_QUEUE
              const next = pool.find(i => i.status === 'open' || i.status === 'escalated')
              if (next) setSelectedId(next.id)
            }}
          >
            <ListTodo size={15} strokeWidth={2} aria-hidden />
            Claim next item
          </button>
        </div>
      </div>

      <div className="wq-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · claiming, completing, or escalating work does not write durable
          state. Production requires authorized COR requirements and evidence gates.
        </span>
      </div>

      <RelatedNav route="/work-queue" />

      <div className="wq-stats">
        <StatCard
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker={ownerFilter === 'mine' ? 'Open · mine' : 'Open in sample'}
          value={openCount}
          sub={
            ownerFilter === 'mine'
              ? `${mineCount} assigned to me · ${WORK_QUEUE.length} agency total`
              : `${WORK_QUEUE.length} total · ${mineCount} mine`
          }
          accent="teal"
        />
        <StatCard
          icon={<Clock3 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due today"
          value={dueToday}
          sub="Needs action before EOD (sample)"
          accent="warn"
        />
        <StatCard
          icon={<Siren size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Overdue / escalated"
          value={overdueCount}
          sub="Missed windows and escalations"
          accent={overdueCount === 0 ? 'good' : 'bad'}
        />
        <StatCard
          icon={<AlertTriangle size={16} strokeWidth={1.75} aria-hidden />}
          kicker="High + critical"
          value={criticalCount}
          sub="Priority band for triage"
          accent="orange"
        />
      </div>

      <div className="wq-workspace">
        <section className="card wq-registry" aria-label="Work queue list">
          <div className="wq-card-head">
            <div>
              <div className="card-kicker">Queue</div>
              <h2 className="card-title wq-card-title">Work items</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="wq-toolbar">
            <label className="wq-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search work queue</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search task, patient, owner, or domain"
              />
            </label>

            <div className="wq-filter-block">
              <span className="wq-filter-label" id="wq-owner-filters">Owner</span>
              <div className="wq-filters" role="toolbar" aria-labelledby="wq-owner-filters">
                {OWNER_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={
                      'wq-filter wq-filter-owner' + (ownerFilter === f.key ? ' is-active' : '')
                    }
                    aria-pressed={ownerFilter === f.key}
                    onClick={() => setOwnerFilter(f.key)}
                  >
                    {f.label}
                    {f.key === 'mine' ? (
                      <span className="wq-filter-count" aria-hidden>
                        {mineCount}
                      </span>
                    ) : (
                      <span className="wq-filter-count" aria-hidden>
                        {WORK_QUEUE.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="wq-filter-block">
              <span className="wq-filter-label" id="wq-status-filters">Status</span>
              <div className="wq-filters" role="toolbar" aria-labelledby="wq-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'wq-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="wq-filter-block">
              <span className="wq-filter-label" id="wq-priority-filters">Priority</span>
              <div className="wq-filters" role="toolbar" aria-labelledby="wq-priority-filters">
                {PRIORITY_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'wq-filter wq-filter-priority' + (priorityFilter === f.key ? ' is-active' : '')}
                    aria-pressed={priorityFilter === f.key}
                    onClick={() => setPriorityFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={26} strokeWidth={1.5} />}
              title="No work items match"
              sub="Clear filters or search. All queue items are synthetic."
            />
          ) : (
            <div className="wq-list" role="listbox" aria-label="Work item list">
              {filtered.map(item => {
                const patient = item.patientId ? getPatient(item.patientId) : undefined
                const prio = PRIORITY_META[item.priority]
                const status = WORK_STATUS_META[item.status]
                const isSelected = item.id === selectedId
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'wq-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span
                      className={
                        'wq-row-icon' +
                        (item.status === 'escalated' || item.priority === 'critical'
                          ? ' is-critical'
                          : item.priority === 'high'
                            ? ' is-high'
                            : '')
                      }
                      aria-hidden
                    >
                      {item.status === 'escalated' || item.priority === 'critical' ? (
                        <Siren size={16} strokeWidth={1.75} />
                      ) : (
                        <ListTodo size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="wq-row-main">
                      <span className="wq-row-top">
                        <span className="wq-id">{item.id}</span>
                        <span className="chip chip-neutral">{item.domain}</span>
                        <StatusChip tone={prio.tone}>{prio.label}</StatusChip>
                        <StatusChip tone={status.tone}>{status.label}</StatusChip>
                      </span>
                      <span className="wq-title">{item.title}</span>
                      <span className="wq-detail">{item.detail}</span>
                      <span className="wq-meta">
                        {patient ? (
                          <span className="wq-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            <span className="wq-who-name">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </span>
                        ) : (
                          <span className="wq-who-name wq-who-soft">No patient link</span>
                        )}
                        <span className="wq-dot" aria-hidden />
                        <span className={item.owner === DEMO_OWNER ? 'wq-owner-mine' : undefined}>
                          {item.owner}
                        </span>
                        <span className="wq-dot" aria-hidden />
                        <span className={isOverdue(item.due) ? 'wq-due-bad' : undefined}>{item.due}</span>
                      </span>
                    </span>
                    <ArrowRight className="wq-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="wq-inspector" aria-label="Work item inspector">
          {selected ? (
            <div className="card wq-inspector-card">
              <div className="wq-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title wq-card-title">{selected.id}</h2>
                  <p className="wq-inspector-title">{selected.title}</p>
                </div>
                <div className="wq-status-row">
                  <StatusChip tone={PRIORITY_META[selected.priority].tone}>
                    {PRIORITY_META[selected.priority].label}
                  </StatusChip>
                  <StatusChip tone={WORK_STATUS_META[selected.status].tone}>
                    {WORK_STATUS_META[selected.status].label}
                  </StatusChip>
                  <span className="chip chip-neutral">{selected.domain}</span>
                </div>
              </div>

              <div className="wq-inspector-body">
                {selected.patientId ? (() => {
                  const p = getPatient(selected.patientId!)
                  if (!p) return null
                  return (
                    <button
                      type="button"
                      className="wq-patient"
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                      <span>
                        <strong>
                          {p.firstName} {p.lastName}
                        </strong>
                        <span>
                          MRN {p.mrn} · open chart
                        </span>
                      </span>
                      <ArrowRight size={14} strokeWidth={2} aria-hidden />
                    </button>
                  )
                })() : (
                  <p className="wq-copy">This item is not linked to a single patient chart.</p>
                )}

                <p className="wq-copy">{selected.detail}</p>

                <div className="wq-grid">
                  <div>
                    <span className="card-kicker">Owner</span>
                    <strong className={selected.owner === DEMO_OWNER ? 'wq-owner-mine' : undefined}>
                      {selected.owner}
                    </strong>
                    <span>
                      {selected.owner === DEMO_OWNER
                        ? 'Assigned to demo session owner'
                        : 'Assignment is sample-only'}
                    </span>
                  </div>
                  <div>
                    <span className="card-kicker">Due</span>
                    <strong className={isOverdue(selected.due) ? 'wq-due-bad' : undefined}>{selected.due}</strong>
                    <span>SLA labels are synthetic</span>
                  </div>
                  <div>
                    <span className="card-kicker">Primary surface</span>
                    <strong>{selected.href}</strong>
                    <span>Deep link destination</span>
                  </div>
                  <div>
                    <span className="card-kicker">Domain</span>
                    <strong>{selected.domain}</strong>
                    <span>Requirement family</span>
                  </div>
                </div>

                <div className="wq-section">
                  <div className="card-kicker">Continue in</div>
                  <div className="wq-related-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(selected.href)}
                    >
                      Open primary · {selected.href}
                      <ArrowRight size={12} strokeWidth={2} aria-hidden />
                    </button>
                    {selected.related.map(r => (
                      <button
                        key={r.to + r.label}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(r.to)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="wq-inspector-foot">
                <div className="wq-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no escalation is recorded"
                  >
                    Escalate
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!claimBlock}
                    title={claimBlock ?? 'Visual only · no claim is written'}
                  >
                    <CheckCircle2 size={14} strokeWidth={2} aria-hidden />
                    Claim item
                  </button>
                </div>
                <p className="wq-footnote">
                  {claimBlock
                    ? `Claim disabled · ${claimBlock} No durable write occurs in this prototype.`
                    : 'Claim / complete / escalate controls are visual only. No work-queue state is persisted.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card wq-inspector-empty">
              <EmptyState
                icon={<ListTodo size={26} strokeWidth={1.5} />}
                title="Select a work item"
                sub="Choose a row to inspect ownership, due timing, and deep links."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
