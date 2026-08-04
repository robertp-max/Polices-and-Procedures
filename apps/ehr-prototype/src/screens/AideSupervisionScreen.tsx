import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FlaskConical,
  Search,
  Siren,
  UserCheck,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import type { RelatedLink } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './hha.css'

/* Synthetic aide-supervision clocks — design prototype only (HHA domain). */

type ClockKind = 'skilled-14' | 'non-skilled-60'
type ClockStatus = 'on-track' | 'due-soon' | 'overdue' | 'observed'

type SupervisionClock = {
  id: string
  patientId: string
  aide: string
  supervisor: string
  clockKind: ClockKind
  nextDue: string
  lastObservation: string
  status: ClockStatus
  daysRemaining: number
  related: RelatedLink[]
}

const CLOCK_META: Record<ClockKind, { label: string; short: string }> = {
  'skilled-14': { label: 'Skilled 14-day', short: '14-day' },
  'non-skilled-60': { label: 'Non-skilled 60-day', short: '60-day' },
}

const STATUS_META: Record<ClockStatus, { tone: StatusTone; label: string }> = {
  'on-track': { tone: 'good', label: 'On track' },
  'due-soon': { tone: 'warn', label: 'Due soon' },
  overdue: { tone: 'bad', label: 'Overdue' },
  observed: { tone: 'progress', label: 'Observed' },
}

type StatusFilter = 'all' | ClockStatus
type KindFilter = 'all' | ClockKind

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'on-track', label: 'On track' },
  { key: 'due-soon', label: 'Due soon' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'observed', label: 'Observed' },
]

const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All clocks' },
  { key: 'skilled-14', label: 'Skilled 14-day' },
  { key: 'non-skilled-60', label: 'Non-skilled 60-day' },
]

const SUPERVISION_CLOCKS: SupervisionClock[] = [
  {
    id: 'hha-1',
    patientId: 'pt-elena',
    aide: 'Priya Natarajan',
    supervisor: 'Taylor Brooks, RN',
    clockKind: 'skilled-14',
    nextDue: 'Wed',
    lastObservation: 'Aug 1',
    status: 'due-soon',
    daysRemaining: 3,
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/schedule', label: 'Schedule' },
      { to: '/competency', label: 'Competency' },
      { to: '/work-queue', label: 'Work queue' },
      { to: '/patients/pt-elena', label: 'Chart' },
    ],
  },
  {
    id: 'hha-2',
    patientId: 'pt-walter',
    aide: 'Sam Ortiz',
    supervisor: 'Dana Whitfield, RN',
    clockKind: 'skilled-14',
    nextDue: 'Fri',
    lastObservation: 'Jul 28',
    status: 'on-track',
    daysRemaining: 5,
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/schedule', label: 'Schedule' },
      { to: '/patients/pt-walter', label: 'Chart' },
    ],
  },
  {
    id: 'hha-3',
    patientId: 'pt-raymond',
    aide: 'Sam Ortiz',
    supervisor: 'Taylor Brooks, RN',
    clockKind: 'non-skilled-60',
    nextDue: 'Overdue',
    lastObservation: 'Jun 12',
    status: 'overdue',
    daysRemaining: -4,
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/work-queue', label: 'Work queue' },
      { to: '/qapi', label: 'QAPI' },
      { to: '/schedule', label: 'Reschedule' },
    ],
  },
  {
    id: 'hha-4',
    patientId: 'pt-margaret',
    aide: 'Priya Natarajan',
    supervisor: 'Iris Duan, RN',
    clockKind: 'skilled-14',
    nextDue: 'Aug 12',
    lastObservation: 'Aug 2',
    status: 'on-track',
    daysRemaining: 9,
    related: [
      { to: '/schedule', label: 'Schedule' },
      { to: '/competency', label: 'Competency' },
      { to: '/patients/pt-margaret', label: 'Chart' },
    ],
  },
  {
    id: 'hha-5',
    patientId: 'pt-june',
    aide: 'Priya Natarajan',
    supervisor: 'Dana Whitfield, RN',
    clockKind: 'non-skilled-60',
    nextDue: 'Aug 20',
    lastObservation: 'Aug 1 (aide present)',
    status: 'observed',
    daysRemaining: 17,
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/competency', label: 'Competency' },
      { to: '/patients/pt-june', label: 'Chart' },
    ],
  },
]

function scheduleDisabledReason(clock: SupervisionClock): string | null {
  if (clock.status === 'observed' && clock.daysRemaining > 7) {
    return 'Recent observation already recorded in this sample.'
  }
  return null
}

export default function AideSupervisionScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(SUPERVISION_CLOCKS[0]?.id ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SUPERVISION_CLOCKS.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (kindFilter !== 'all' && c.clockKind !== kindFilter) return false
      if (!q) return true
      const patient = getPatient(c.patientId)
      const hay = [
        c.id,
        c.aide,
        c.supervisor,
        c.nextDue,
        c.lastObservation,
        CLOCK_META[c.clockKind].label,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, kindFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(c => c.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = SUPERVISION_CLOCKS.find(c => c.id === selectedId) ?? null
  const activeCount = SUPERVISION_CLOCKS.length
  const dueSoon = SUPERVISION_CLOCKS.filter(c => c.status === 'due-soon' || c.daysRemaining <= 7).length
  const overdue = SUPERVISION_CLOCKS.filter(c => c.status === 'overdue').length
  const observed = SUPERVISION_CLOCKS.filter(c => c.status === 'observed').length
  const scheduleBlock = selected ? scheduleDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain HHA · aide supervision</div>
          <h1 className="screen-title">Aide supervision</h1>
          <div className="screen-sub">
            Plan-authorized services, effective-dated supervision clocks, and direct-observation
            requirements — synthetic sample for design evaluation.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/field-visits')}>
            Field visits
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/competency')}>
            Competency
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no supervision visit is scheduled"
            onClick={() => {
              const next = SUPERVISION_CLOCKS.find(c => c.status === 'overdue' || c.status === 'due-soon')
              if (next) setSelectedId(next.id)
            }}
          >
            <CalendarClock size={15} strokeWidth={2} aria-hidden />
            Schedule supervision
          </button>
        </div>
      </div>

      <div className="hha-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · scheduling or documenting supervision does not write durable
          clinical state. Production requires authorized HHA-002 / HHA-003 requirements and evidence gates.
        </span>
      </div>

      <RelatedNav route="/aide-supervision" />

      <div className="hha-stats">
        <StatCard
          icon={<UserCheck size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active clocks"
          value={activeCount}
          sub="Patients with HHA services (sample)"
          accent="teal"
        />
        <StatCard
          icon={<CalendarClock size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due ≤7 days"
          value={dueSoon}
          sub="Skilled + non-skilled clocks"
          accent={dueSoon === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<Siren size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Overdue"
          value={overdue}
          sub="Escalation candidates"
          accent={overdue === 0 ? 'good' : 'bad'}
        />
        <StatCard
          icon={<CheckCircle2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Recently observed"
          value={observed}
          sub="Aide-present observation in sample"
          accent="good"
        />
      </div>

      <div className="hha-workspace">
        <section className="card hha-registry" aria-label="Aide supervision clocks">
          <div className="hha-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title hha-card-title">Supervision clocks</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="hha-toolbar">
            <label className="hha-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search aide supervision</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search patient, aide, supervisor, or clock"
              />
            </label>

            <div className="hha-filter-block">
              <span className="hha-filter-label" id="hha-status-filters">Status</span>
              <div className="hha-filters" role="toolbar" aria-labelledby="hha-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'hha-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hha-filter-block">
              <span className="hha-filter-label" id="hha-kind-filters">Clock type</span>
              <div className="hha-filters" role="toolbar" aria-labelledby="hha-kind-filters">
                {KIND_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'hha-filter hha-filter-kind' + (kindFilter === f.key ? ' is-active' : '')}
                    aria-pressed={kindFilter === f.key}
                    onClick={() => setKindFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<UserCheck size={26} strokeWidth={1.5} />}
              title="No clocks match"
              sub="Clear filters or search. All supervision clocks are synthetic."
            />
          ) : (
            <div className="hha-list" role="listbox" aria-label="Supervision clock list">
              {filtered.map(clock => {
                const patient = getPatient(clock.patientId)
                const meta = STATUS_META[clock.status]
                const isSelected = clock.id === selectedId
                return (
                  <button
                    key={clock.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'hha-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => setSelectedId(clock.id)}
                  >
                    <span
                      className={
                        'hha-row-icon' +
                        (clock.status === 'overdue'
                          ? ' is-overdue'
                          : clock.status === 'due-soon'
                            ? ' is-due'
                            : '')
                      }
                      aria-hidden
                    >
                      {clock.status === 'overdue' ? (
                        <Siren size={16} strokeWidth={1.75} />
                      ) : (
                        <UserCheck size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="hha-row-main">
                      <span className="hha-row-top">
                        <span className="hha-id">{clock.id}</span>
                        <span className="chip chip-neutral">{CLOCK_META[clock.clockKind].short}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="hha-title">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient'}
                      </span>
                      <span className="hha-matter">
                        Aide · {clock.aide} · next due {clock.nextDue}
                      </span>
                      <span className="hha-meta">
                        {patient ? (
                          <span className="hha-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            <span className="hha-who-name">MRN {patient.mrn}</span>
                          </span>
                        ) : null}
                        <span className="hha-dot" aria-hidden />
                        <span>Last obs {clock.lastObservation}</span>
                        <span className="hha-dot" aria-hidden />
                        <span className={clock.daysRemaining < 0 ? 'hha-due-bad' : undefined}>
                          {clock.daysRemaining < 0
                            ? `${Math.abs(clock.daysRemaining)}d overdue`
                            : `${clock.daysRemaining}d remaining`}
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="hha-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="hha-inspector" aria-label="Supervision inspector">
          {selected ? (
            <div className="card hha-inspector-card">
              <div className="hha-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title hha-card-title">{selected.id}</h2>
                  <p className="hha-inspector-title">{CLOCK_META[selected.clockKind].label}</p>
                </div>
                <div className="hha-status-row">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <span className="chip chip-neutral">{CLOCK_META[selected.clockKind].short}</span>
                </div>
              </div>

              <div className="hha-inspector-body">
                {(() => {
                  const p = getPatient(selected.patientId)
                  if (!p) return null
                  return (
                    <button
                      type="button"
                      className="hha-patient"
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
                })()}

                {selected.status === 'overdue' ? (
                  <div className="hha-overdue-callout" role="status">
                    <Siren size={16} strokeWidth={2} aria-hidden />
                    <div>
                      <strong>Supervision overdue</strong>
                      <span>
                        Window closed {Math.abs(selected.daysRemaining)} day
                        {Math.abs(selected.daysRemaining) === 1 ? '' : 's'} ago. Escalate coverage and
                        document exception per policy — visual only here.
                      </span>
                    </div>
                  </div>
                ) : null}

                <p className="hha-copy">
                  Clocks are effective-dated from actual service and supervision facts in production.
                  Canceled or wrong-type encounters do not reset the clock. This sample is illustrative only.
                </p>

                <div className="hha-grid">
                  <div>
                    <span className="card-kicker">Aide</span>
                    <strong>{selected.aide}</strong>
                    <span>Assigned HHA</span>
                  </div>
                  <div>
                    <span className="card-kicker">Supervisor RN</span>
                    <strong>{selected.supervisor}</strong>
                    <span>Responsible oversight</span>
                  </div>
                  <div>
                    <span className="card-kicker">Next due</span>
                    <strong className={selected.status === 'overdue' ? 'hha-due-bad' : undefined}>
                      {selected.nextDue}
                    </strong>
                    <span>
                      {selected.daysRemaining < 0
                        ? `${Math.abs(selected.daysRemaining)}d overdue`
                        : `${selected.daysRemaining}d remaining`}
                    </span>
                  </div>
                  <div>
                    <span className="card-kicker">Last observation</span>
                    <strong>{selected.lastObservation}</strong>
                    <span>Direct observation sample</span>
                  </div>
                </div>

                <div className="hha-section">
                  <div className="card-kicker">Continue in</div>
                  <div className="hha-related-actions">
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

              <div className="hha-inspector-foot">
                <div className="hha-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no clock rule is changed"
                    onClick={() => navigate('/competency')}
                  >
                    Clock rules
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!scheduleBlock}
                    title={scheduleBlock ?? 'Visual only · no supervision visit is scheduled'}
                    onClick={() => navigate('/schedule')}
                  >
                    <CalendarClock size={14} strokeWidth={2} aria-hidden />
                    Schedule supervision
                  </button>
                </div>
                <p className="hha-footnote">
                  {scheduleBlock
                    ? `Schedule disabled · ${scheduleBlock} No durable write occurs in this prototype.`
                    : 'Schedule / observe / escalate controls are visual only. No supervisory visit is filed.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card hha-inspector-empty">
              <EmptyState
                icon={<UserCheck size={26} strokeWidth={1.5} />}
                title="Select a supervision clock"
                sub="Inspect due windows, aides, and related field workspaces."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
