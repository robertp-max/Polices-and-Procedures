import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Link2,
  Search,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './cmp.css'

/* ──────────────────────────────────────────────────────────────────────────
 * Competency & in-service (QAP) — role education, observation, assignment gates.
 * Synthetic design prototype.
 * ────────────────────────────────────────────────────────────────────────── */

type Gate = 'clear' | 'assignment' | 'blocked'
type Status = 'on-track' | 'due-soon' | 'overdue' | 'remediation' | 'complete'
type StatusFilter = 'all' | Status
type DetailTab = 'overview' | 'evidence' | 'gate' | 'related'

type CompetencyRow = {
  id: string
  staff: string
  role: string
  requirement: string
  due: string
  evidence: string
  gate: Gate
  status: Status
  detail: string
  modules: string[]
}

const ROWS: CompetencyRow[] = [
  {
    id: 'cmp-1',
    staff: 'Priya Natarajan',
    role: 'HHA',
    requirement: 'Annual competency · observation',
    due: 'Aug 10',
    evidence: 'Observation form pending',
    gate: 'assignment',
    status: 'due-soon',
    detail: 'Role-required annual competency. Assignment may continue until due date; field gates tighten when overdue.',
    modules: ['Personal care skills', 'Infection control', 'Emergency response'],
  },
  {
    id: 'cmp-2',
    staff: 'Sam Ortiz',
    role: 'HHA',
    requirement: 'In-service · infection prevention',
    due: 'Overdue',
    evidence: 'Missing',
    gate: 'blocked',
    status: 'overdue',
    detail: 'Overdue in-service blocks new field assignment until evidence is captured and supervisor clears gate.',
    modules: ['Hand hygiene', 'PPE sequence', 'Bloodborne pathogens'],
  },
  {
    id: 'cmp-3',
    staff: 'Taylor Brooks',
    role: 'RN',
    requirement: 'OASIS competency',
    due: 'Sep 1',
    evidence: 'Quiz + observation',
    gate: 'clear',
    status: 'on-track',
    detail: 'OASIS competency pathway with quiz and observed assessment. Clear gate for OASIS-owning visits.',
    modules: ['OASIS-E2 structure', 'GG items', 'Lock and export'],
  },
  {
    id: 'cmp-4',
    staff: 'Marcus Webb',
    role: 'PT',
    requirement: 'Annual competency · therapy',
    due: 'Aug 5',
    evidence: 'Observation failed · remediation',
    gate: 'assignment',
    status: 'remediation',
    detail: 'Failed observation opens remediation plan. Assignments continue under supervision rules until clear.',
    modules: ['Transfer safety', 'Home exercise instruction', 'Documentation'],
  },
  {
    id: 'cmp-5',
    staff: 'Dana Whitfield',
    role: 'RN · CM',
    requirement: 'Emergency preparedness drill',
    due: 'Completed Jul 12',
    evidence: 'Drill attendance + quiz',
    gate: 'clear',
    status: 'complete',
    detail: 'Completed agency emergency drill with after-action acknowledgment on file (synthetic).',
    modules: ['Command structure', 'Patient priority lists', 'Downtime comms'],
  },
]

const STATUS_META: Record<Status, { tone: StatusTone; label: string }> = {
  'on-track': { tone: 'good', label: 'On track' },
  'due-soon': { tone: 'warn', label: 'Due soon' },
  overdue: { tone: 'bad', label: 'Overdue' },
  remediation: { tone: 'warn', label: 'Remediation' },
  complete: { tone: 'good', label: 'Complete' },
}

const GATE_META: Record<Gate, { tone: StatusTone; label: string }> = {
  clear: { tone: 'good', label: 'Clear' },
  assignment: { tone: 'progress', label: 'Assignment watch' },
  blocked: { tone: 'bad', label: 'Blocked' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'due-soon', label: 'Due soon' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'remediation', label: 'Remediation' },
  { key: 'on-track', label: 'On track' },
  { key: 'complete', label: 'Complete' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'gate', label: 'Assignment gate' },
  { key: 'related', label: 'Related' },
]

function assignDisabledReason(row: CompetencyRow): string | null {
  if (row.gate === 'blocked') return 'Gate blocked until overdue competency evidence is captured.'
  if (row.status === 'complete') return 'Already complete in this sample.'
  return null
}

export default function CompetencyScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(ROWS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [assignOpen, setAssignOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ROWS.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      const hay = [r.id, r.staff, r.role, r.requirement, r.evidence, r.due, r.status, ...r.modules]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(r => r.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = ROWS.find(r => r.id === selectedId) ?? null
  const dueSoon = ROWS.filter(r => r.status === 'due-soon').length
  const overdue = ROWS.filter(r => r.status === 'overdue').length
  const complete = ROWS.filter(r => r.status === 'complete').length
  const remediation = ROWS.filter(r => r.status === 'remediation').length

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  const assignBlock = selected ? assignDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain QAP · competency & in-service</div>
          <h1 className="screen-title">Competency & in-service</h1>
          <div className="screen-sub">
            Role-required education, observation, remediation, and assignment gates — synthetic roster.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/aide-supervision')}>
            Aide supervision
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/qapi')}>
            QAPI programme
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setAssignOpen(true)}>
            <GraduationCap size={15} strokeWidth={2} aria-hidden />
            Assign training
          </button>
        </div>
      </div>

      <div className="cmp-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no training is assigned, observed, or used to block field work.
          Production requires authorized competency policies and evidence retention.
        </span>
      </div>

      <RelatedNav route="/competency" />

      <div className="cmp-stats">
        <StatCard
          icon={<GraduationCap size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due ≤14d"
          value={dueSoon}
          sub="Staff assignments approaching"
          accent="warn"
        />
        <StatCard
          icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Overdue"
          value={overdue}
          sub="Blocks field assignment (design)"
          accent={overdue > 0 ? 'bad' : 'good'}
        />
        <StatCard
          icon={<CheckCircle2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Complete (sample)"
          value={complete}
          sub="With evidence labels"
          accent="good"
        />
        <StatCard
          icon={<UserCheck size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Remediation open"
          value={remediation}
          sub="Observation failed path"
          accent="orange"
        />
      </div>

      <div className="cmp-workspace">
        <section className="card cmp-registry" aria-label="Competency registry">
          <div className="cmp-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title cmp-card-title">Staff requirements</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="cmp-toolbar">
            <label className="cmp-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search competency</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search staff, role, or requirement"
              />
            </label>
            <div className="cmp-filter-block">
              <span className="cmp-filter-label" id="cmp-status-filters">Status</span>
              <div className="cmp-filters" role="toolbar" aria-labelledby="cmp-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'cmp-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<GraduationCap size={26} strokeWidth={1.5} />}
              title="No rows match"
              sub="Clear filters or search. All rows are synthetic."
            />
          ) : (
            <div className="cmp-list" role="listbox" aria-label="Competency list">
              {filtered.map(r => {
                const meta = STATUS_META[r.status]
                const isSelected = r.id === selectedId
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'cmp-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(r.id)}
                  >
                    <span
                      className={
                        'cmp-row-icon' +
                        (r.status === 'overdue' || r.gate === 'blocked'
                          ? ' is-bad'
                          : r.status === 'due-soon' || r.status === 'remediation'
                            ? ' is-warn'
                            : '')
                      }
                      aria-hidden
                    >
                      <GraduationCap size={16} strokeWidth={1.75} />
                    </span>
                    <span className="cmp-row-main">
                      <span className="cmp-row-top">
                        <span className="cmp-id">{r.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <StatusChip tone={GATE_META[r.gate].tone}>{GATE_META[r.gate].label}</StatusChip>
                      </span>
                      <span className="cmp-title">
                        {r.staff}, {r.role}
                      </span>
                      <span className="cmp-req">{r.requirement}</span>
                      <span className="cmp-meta">
                        <span>Due · {r.due}</span>
                        <span className="cmp-dot" aria-hidden />
                        <span>{r.evidence}</span>
                      </span>
                    </span>
                    <ArrowRight className="cmp-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="cmp-inspector" aria-label="Competency inspector">
          {selected ? (
            <div className="card cmp-inspector-card">
              <div className="cmp-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title cmp-card-title">{selected.id}</h2>
                  <p className="cmp-inspector-title">
                    {selected.staff} · {selected.role}
                  </p>
                </div>
                <div className="cmp-drawer-status">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip tone={GATE_META[selected.gate].tone}>
                    {GATE_META[selected.gate].label}
                  </StatusChip>
                </div>
              </div>

              <div className="cmp-tabs" role="tablist" aria-label="Competency detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'cmp-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="cmp-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="cmp-panel">
                    {selected.gate === 'blocked' ? (
                      <div className="cmp-callout is-bad" role="status">
                        <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Assignment blocked</strong>
                          <span>
                            Overdue competency evidence is missing. Production scheduling gates prevent new
                            field assignment until cleared.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <p className="cmp-drawer-copy">{selected.detail}</p>
                    <div className="cmp-drawer-grid">
                      <div>
                        <span className="card-kicker">Requirement</span>
                        <strong>{selected.requirement}</strong>
                        <span>Role pathway</span>
                      </div>
                      <div>
                        <span className="card-kicker">Due</span>
                        <strong>{selected.due}</strong>
                        <span>Sample clock only</span>
                      </div>
                      <div>
                        <span className="card-kicker">Evidence</span>
                        <strong>{selected.evidence}</strong>
                        <span>Observation / quiz / drill</span>
                      </div>
                      <div>
                        <span className="card-kicker">Gate</span>
                        <strong>{GATE_META[selected.gate].label}</strong>
                        <span>Field assignment impact</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'evidence' ? (
                  <div className="cmp-panel">
                    <p className="cmp-drawer-copy">
                      Evidence pins exact form versions and observer identity in production. Labels below are
                      visual only.
                    </p>
                    <ul className="cmp-module-list">
                      {selected.modules.map(m => (
                        <li key={m}>
                          <BookOpenCheck size={14} strokeWidth={2} aria-hidden />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'gate' ? (
                  <div className="cmp-panel">
                    <p className="cmp-drawer-copy">
                      Gates separate education completion from schedule eligibility. This prototype does not
                      mutate schedule or field visit eligibility.
                    </p>
                    <ul className="cmp-check-list">
                      <li>
                        <CheckCircle2 size={15} strokeWidth={2} aria-hidden />
                        <span>Gate state · {GATE_META[selected.gate].label}</span>
                      </li>
                      <li>
                        <CheckCircle2 size={15} strokeWidth={2} aria-hidden />
                        <span>Links to aide supervision for HHA observation clocks</span>
                      </li>
                      <li>
                        <CheckCircle2 size={15} strokeWidth={2} aria-hidden />
                        <span>Emergency prep drills may contribute required modules</span>
                      </li>
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'related' ? (
                  <div className="cmp-panel">
                    <div className="cmp-related-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/aide-supervision')}
                      >
                        <Link2 size={13} strokeWidth={2} aria-hidden />
                        Aide supervision
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/qapi')}>
                        QAPI
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/emergency')}
                      >
                        Emergency prep
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="cmp-inspector-foot">
                <div className="cmp-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/aide-supervision')}
                    title="Navigate only"
                  >
                    Supervision clocks
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!assignBlock}
                    title={assignBlock ?? 'Visual only · no training is assigned'}
                    onClick={() => setAssignOpen(true)}
                  >
                    Record evidence
                  </button>
                </div>
                <p className="cmp-drawer-footnote">
                  {assignBlock
                    ? `Action disabled · ${assignBlock}`
                    : 'Assign / record / clear-gate controls are visual only. No competency write occurs.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card cmp-inspector-empty">
              <EmptyState
                icon={<GraduationCap size={26} strokeWidth={1.5} />}
                title="Select a requirement"
                sub="Inspect evidence modules, gates, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>

      <Drawer
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign training"
        sub="Review-only · nothing is assigned or signed"
      >
        <div className="cmp-panel">
          <p className="cmp-drawer-copy">
            Production assignment selects role pathway, due date, evidence form, and gate rules. This drawer
            does not create LMS enrollments or observation tasks.
          </p>
          <div className="cmp-drawer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAssignOpen(false)}>
              Close
            </button>
            <button type="button" className="btn btn-primary" disabled title="Visual only · no training is assigned">
              Confirm assignment
            </button>
          </div>
          <p className="cmp-drawer-footnote">Confirm is disabled. No durable write occurs in this prototype.</p>
        </div>
      </Drawer>
    </div>
  )
}
