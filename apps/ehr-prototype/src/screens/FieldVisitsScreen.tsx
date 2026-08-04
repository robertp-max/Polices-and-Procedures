import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  CloudOff,
  FlaskConical,
  MapPin,
  Search,
  Video,
} from 'lucide-react'
import { todayVisits, weekVisits } from '../data/clinical'
import { getPatient } from '../data/patients'
import type { VisitEvent } from '../data/types'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './fld.css'

type VisitStatus = VisitEvent['status']
type StatusFilter = 'all' | VisitStatus
type ScopeFilter = 'today' | 'week'

const STATUS_META: Record<VisitStatus, { tone: StatusTone; label: string }> = {
  scheduled: { tone: 'neutral', label: 'Scheduled' },
  'in-progress': { tone: 'progress', label: 'In progress' },
  completed: { tone: 'good', label: 'Completed' },
  missed: { tone: 'bad', label: 'Missed' },
  'documentation-due': { tone: 'warn', label: 'Documentation due' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'documentation-due', label: 'Documentation due' },
  { key: 'completed', label: 'Completed' },
  { key: 'missed', label: 'Missed' },
  { key: 'in-progress', label: 'In progress' },
]

function completeDisabledReason(visit: VisitEvent): string | null {
  if (visit.status === 'completed') return 'Visit already completed in this sample.'
  if (visit.status === 'missed') return 'Missed visits use exception path, not complete.'
  return null
}

export default function FieldVisitsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [scope, setScope] = useState<ScopeFilter>('week')
  const [selectedId, setSelectedId] = useState<string | null>(weekVisits[0]?.id ?? null)

  const source = scope === 'today' ? todayVisits : weekVisits

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return source.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false
      if (!q) return true
      const patient = getPatient(v.patientId)
      const hay = [
        v.id,
        v.discipline,
        v.type,
        v.clinician,
        v.date,
        v.time,
        v.location,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, source])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(v => v.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = weekVisits.find(v => v.id === selectedId) ?? null
  const todayCount = todayVisits.length
  const docDue = weekVisits.filter(v => v.status === 'documentation-due').length
  const missed = weekVisits.filter(v => v.status === 'missed').length
  const telehealth = weekVisits.filter(v => v.location === 'telehealth').length
  const completeBlock = selected ? completeDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain FLD · field visits & EVV</div>
          <h1 className="screen-title">Field visits & EVV</h1>
          <div className="screen-sub">
            Point-of-care visit packets, offline outbox, and applicability-driven EVV — synthetic field
            force sample.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/schedule')}>
            Schedule
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/work-queue')}>
            Work queue
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no visit packet is opened for write"
            onClick={() => {
              const next = todayVisits.find(v => v.status === 'scheduled' || v.status === 'documentation-due')
              if (next) {
                setScope('today')
                setSelectedId(next.id)
              }
            }}
          >
            <ClipboardList size={15} strokeWidth={2} aria-hidden />
            Open visit packet
          </button>
        </div>
      </div>

      <div className="fld-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · completing visits, syncing EVV, or filing notes does not write
          durable clinical or billing state. Production requires authorized FLD requirements and evidence gates.
        </span>
      </div>

      <RelatedNav route="/field-visits" />

      <div className="fld-stats">
        <StatCard
          icon={<CalendarDays size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Today's visits"
          value={todayCount}
          sub={`${weekVisits.length} in week sample`}
          accent="teal"
        />
        <StatCard
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Documentation due"
          value={docDue}
          sub="Notes not yet filed (sample)"
          accent={docDue === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<CloudOff size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Missed"
          value={missed}
          sub="Exception / reschedule path"
          accent={missed === 0 ? 'good' : 'bad'}
        />
        <StatCard
          icon={<Video size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Telehealth"
          value={telehealth}
          sub="In week sample set"
          accent="orange"
        />
      </div>

      <div className="fld-workspace">
        <section className="card fld-registry" aria-label="Field visit list">
          <div className="fld-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title fld-card-title">Visits</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="fld-toolbar">
            <label className="fld-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search field visits</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search patient, clinician, discipline, or type"
              />
            </label>

            <div className="fld-filter-block">
              <span className="fld-filter-label" id="fld-scope-filters">Scope</span>
              <div className="fld-filters" role="toolbar" aria-labelledby="fld-scope-filters">
                <button
                  type="button"
                  className={'fld-filter' + (scope === 'today' ? ' is-active' : '')}
                  aria-pressed={scope === 'today'}
                  onClick={() => setScope('today')}
                >
                  Today ({todayVisits.length})
                </button>
                <button
                  type="button"
                  className={'fld-filter' + (scope === 'week' ? ' is-active' : '')}
                  aria-pressed={scope === 'week'}
                  onClick={() => setScope('week')}
                >
                  Week ({weekVisits.length})
                </button>
              </div>
            </div>

            <div className="fld-filter-block">
              <span className="fld-filter-label" id="fld-status-filters">Status</span>
              <div className="fld-filters" role="toolbar" aria-labelledby="fld-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'fld-filter fld-filter-status' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<MapPin size={26} strokeWidth={1.5} />}
              title="No visits match"
              sub="Clear filters or switch scope. All visits are synthetic."
            />
          ) : (
            <div className="fld-list" role="listbox" aria-label="Visit list">
              {filtered.map(visit => {
                const patient = getPatient(visit.patientId)
                const meta = STATUS_META[visit.status]
                const isSelected = visit.id === selectedId
                return (
                  <button
                    key={visit.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'fld-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => setSelectedId(visit.id)}
                  >
                    <span
                      className={
                        'fld-row-icon' +
                        (visit.status === 'missed'
                          ? ' is-missed'
                          : visit.status === 'documentation-due'
                            ? ' is-due'
                            : visit.location === 'telehealth'
                              ? ' is-tele'
                              : '')
                      }
                      aria-hidden
                    >
                      {visit.location === 'telehealth' ? (
                        <Video size={16} strokeWidth={1.75} />
                      ) : (
                        <MapPin size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="fld-row-main">
                      <span className="fld-row-top">
                        <span className="fld-id">{visit.id}</span>
                        <span className="chip chip-neutral">{visit.discipline}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="fld-title">{visit.type}</span>
                      <span className="fld-matter">
                        {visit.date} · {visit.time} · {visit.durationMin} min
                      </span>
                      <span className="fld-meta">
                        {patient ? (
                          <span className="fld-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            <span className="fld-who-name">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </span>
                        ) : (
                          <span className="fld-who-soft">No patient</span>
                        )}
                        <span className="fld-dot" aria-hidden />
                        <span>{visit.clinician}</span>
                        <span className="fld-dot" aria-hidden />
                        <span>{visit.location === 'telehealth' ? 'Telehealth' : 'Home'}</span>
                      </span>
                    </span>
                    <ArrowRight className="fld-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="fld-inspector" aria-label="Visit inspector">
          {selected ? (
            <div className="card fld-inspector-card">
              <div className="fld-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title fld-card-title">{selected.id}</h2>
                  <p className="fld-inspector-title">{selected.type}</p>
                </div>
                <div className="fld-status-row">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <span className="chip chip-neutral">{selected.discipline}</span>
                  <span className="chip chip-neutral">
                    {selected.location === 'telehealth' ? 'Telehealth' : 'Home'}
                  </span>
                </div>
              </div>

              <div className="fld-inspector-body">
                {(() => {
                  const p = getPatient(selected.patientId)
                  if (!p) return null
                  return (
                    <button
                      type="button"
                      className="fld-patient"
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

                <p className="fld-copy">
                  Clinician {selected.clinician}. Window {selected.date} at {selected.time} (
                  {selected.durationMin} min). EVV applicability is payer- and state-driven in production;
                  this prototype shows visit state only.
                </p>

                <div className="fld-grid">
                  <div>
                    <span className="card-kicker">When</span>
                    <strong>
                      {selected.date} · {selected.time}
                    </strong>
                    <span>{selected.durationMin} minutes</span>
                  </div>
                  <div>
                    <span className="card-kicker">Clinician</span>
                    <strong>{selected.clinician}</strong>
                    <span>{selected.discipline}</span>
                  </div>
                  <div>
                    <span className="card-kicker">Location</span>
                    <strong>{selected.location === 'telehealth' ? 'Telehealth' : 'Patient home'}</strong>
                    <span>Sample placement</span>
                  </div>
                  <div>
                    <span className="card-kicker">Sync / EVV</span>
                    <strong>
                      {selected.status === 'missed'
                        ? 'Exception path'
                        : selected.status === 'documentation-due'
                          ? 'Synced · note due'
                          : 'Sample · not production EVV'}
                    </strong>
                    <span>Visual labels only</span>
                  </div>
                </div>

                <div className="fld-section">
                  <div className="card-kicker">Continue in</div>
                  <div className="fld-related-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/schedule')}
                    >
                      Schedule
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/work-queue')}
                    >
                      Work queue
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/aide-supervision')}
                    >
                      Aide supervision
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/patients/${selected.patientId}`)}
                    >
                      Patient chart
                    </button>
                  </div>
                </div>
              </div>

              <div className="fld-inspector-foot">
                <div className="fld-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no outbox sync is performed"
                  >
                    Outbox status
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!completeBlock}
                    title={completeBlock ?? 'Visual only · no visit is completed'}
                  >
                    Complete visit
                  </button>
                </div>
                <p className="fld-footnote">
                  {completeBlock
                    ? `Complete disabled · ${completeBlock} No durable write occurs in this prototype.`
                    : 'Complete / EVV / note file controls are visual only. Nothing is synced or billed.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card fld-inspector-empty">
              <EmptyState
                icon={<MapPin size={26} strokeWidth={1.5} />}
                title="Select a visit"
                sub="Inspect timing, clinician, location, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
