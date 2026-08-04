import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardCheck,
  FileLock2,
  FlaskConical,
  Lock,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import { OASIS_RECORDS } from '../data/workspace'
import type { OasisRecord } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, ProgressBar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './oas.css'

type OasisStatus = OasisRecord['status']
type StatusFilter = 'all' | OasisStatus
type TypeFilter = 'all' | OasisRecord['type']

const STATUS_META: Record<OasisStatus, { tone: StatusTone; label: string }> = {
  'in-progress': { tone: 'progress', label: 'In progress' },
  locked: { tone: 'good', label: 'Locked' },
  'due-soon': { tone: 'warn', label: 'Due soon' },
  exported: { tone: 'good', label: 'Exported' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'due-soon', label: 'Due soon' },
  { key: 'locked', label: 'Locked' },
  { key: 'exported', label: 'Exported' },
]

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All types' },
  { key: 'SOC', label: 'SOC' },
  { key: 'ROC', label: 'ROC' },
  { key: 'Recert', label: 'Recert' },
  { key: 'Discharge', label: 'Discharge' },
]

function lockDisabledReason(rec: OasisRecord): string | null {
  if (rec.status === 'locked' || rec.status === 'exported') return 'Already locked or exported in this sample.'
  if (rec.completion < 100) return 'Completeness must reach 100% before lock.'
  if (rec.blocking.length > 0) return 'Blocking items must clear before lock.'
  return null
}

export default function OasisAssessmentsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(OASIS_RECORDS[0]?.id ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return OASIS_RECORDS.filter(rec => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false
      if (typeFilter !== 'all' && rec.type !== typeFilter) return false
      if (!q) return true
      const patient = getPatient(rec.patientId)
      const hay = [
        rec.id,
        rec.type,
        rec.window,
        ...rec.blocking,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
        STATUS_META[rec.status].label,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, typeFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(r => r.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = OASIS_RECORDS.find(r => r.id === selectedId) ?? null
  const inProgress = OASIS_RECORDS.filter(r => r.status === 'in-progress').length
  const dueSoon = OASIS_RECORDS.filter(r => r.status === 'due-soon').length
  const exported = OASIS_RECORDS.filter(r => r.status === 'exported' || r.status === 'locked').length
  const blocked = OASIS_RECORDS.filter(r => r.blocking.length > 0).length
  const lockBlock = selected ? lockDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain EPI · OASIS assessments</div>
          <h1 className="screen-title">OASIS assessments</h1>
          <div className="screen-sub">
            Time-point packages, completeness, blocking items, lock, and CMS file readiness — synthetic
            design prototype.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/episodes')}>
            Episodes
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/cms-quality')}>
            CMS quality
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no assessment is opened for edit"
            onClick={() => {
              const next = OASIS_RECORDS.find(r => r.status === 'in-progress' || r.status === 'due-soon')
              if (next) setSelectedId(next.id)
            }}
          >
            <ClipboardCheck size={15} strokeWidth={2} aria-hidden />
            Continue assessment
          </button>
        </div>
      </div>

      <div className="oas-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · lock, export, and CMS submission do not write durable state.
          Production requires authorized OASIS requirements, validation, and evidence gates.
        </span>
      </div>

      <RelatedNav route="/oasis" />

      <div className="oas-stats">
        <StatCard
          icon={<ClipboardCheck size={16} strokeWidth={1.75} aria-hidden />}
          kicker="In progress"
          value={inProgress}
          sub="Field + QA review"
          accent="teal"
        />
        <StatCard
          icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due soon"
          value={dueSoon}
          sub="Window closing"
          accent={dueSoon === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<FileLock2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="With blockers"
          value={blocked}
          sub="Incomplete or validation holds"
          accent={blocked === 0 ? 'good' : 'bad'}
        />
        <StatCard
          icon={<Lock size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Locked / exported"
          value={exported}
          sub="Sample sealed packages"
          accent="good"
        />
      </div>

      <div className="oas-workspace">
        <section className="card oas-registry" aria-label="OASIS registry">
          <div className="oas-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title oas-card-title">Assessments</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="oas-toolbar">
            <label className="oas-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search OASIS assessments</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search patient, time point, or blocking item"
              />
            </label>

            <div className="oas-filter-block">
              <span className="oas-filter-label" id="oas-status-filters">Status</span>
              <div className="oas-filters" role="toolbar" aria-labelledby="oas-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'oas-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="oas-filter-block">
              <span className="oas-filter-label" id="oas-type-filters">Time point</span>
              <div className="oas-filters" role="toolbar" aria-labelledby="oas-type-filters">
                {TYPE_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'oas-filter oas-filter-type' + (typeFilter === f.key ? ' is-active' : '')}
                    aria-pressed={typeFilter === f.key}
                    onClick={() => setTypeFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={26} strokeWidth={1.5} />}
              title="No assessments match"
              sub="Clear filters or search. All OASIS records are synthetic."
            />
          ) : (
            <div className="oas-list" role="listbox" aria-label="OASIS list">
              {filtered.map(rec => {
                const patient = getPatient(rec.patientId)
                const meta = STATUS_META[rec.status]
                const isSelected = rec.id === selectedId
                return (
                  <button
                    key={rec.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'oas-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => setSelectedId(rec.id)}
                  >
                    <span
                      className={
                        'oas-row-icon' +
                        (rec.blocking.length > 0
                          ? ' is-block'
                          : rec.status === 'due-soon'
                            ? ' is-due'
                            : '')
                      }
                      aria-hidden
                    >
                      {rec.blocking.length > 0 ? (
                        <ShieldAlert size={16} strokeWidth={1.75} />
                      ) : (
                        <ClipboardCheck size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="oas-row-main">
                      <span className="oas-row-top">
                        <span className="oas-id">{rec.id}</span>
                        <span className="chip chip-neutral">{rec.type}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="oas-title">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient'}
                      </span>
                      <span className="oas-matter">Window · {rec.window}</span>
                      <span className="oas-meta">
                        {patient ? (
                          <span className="oas-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            <span className="oas-who-name">MRN {patient.mrn}</span>
                          </span>
                        ) : null}
                        <span className="oas-dot" aria-hidden />
                        <span>
                          {rec.blocking.length > 0
                            ? `${rec.blocking.length} blocker${rec.blocking.length === 1 ? '' : 's'}`
                            : 'No blockers'}
                        </span>
                      </span>
                    </span>
                    <span className="oas-row-meter">
                      <span className="oas-meter-label">{rec.completion}%</span>
                      <ProgressBar
                        pct={rec.completion}
                        color={
                          rec.blocking.length > 0
                            ? 'var(--status-warn)'
                            : rec.completion === 100
                              ? 'var(--status-good)'
                              : 'var(--teal-400)'
                        }
                        label={`${rec.id} completeness ${rec.completion} percent`}
                      />
                    </span>
                    <ArrowRight className="oas-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="oas-inspector" aria-label="OASIS inspector">
          {selected ? (
            <div className="card oas-inspector-card">
              <div className="oas-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title oas-card-title">{selected.id}</h2>
                  <p className="oas-inspector-title">
                    OASIS-E2 · {selected.type}
                  </p>
                </div>
                <div className="oas-status-row">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <span className="chip chip-neutral">{selected.completion}% complete</span>
                </div>
              </div>

              <div className="oas-inspector-body">
                {(() => {
                  const p = getPatient(selected.patientId)
                  if (!p) return null
                  return (
                    <button
                      type="button"
                      className="oas-patient"
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

                <div className="oas-completeness">
                  <div className="oas-completeness-top">
                    <span className="card-kicker">Completeness</span>
                    <strong>{selected.completion}%</strong>
                  </div>
                  <ProgressBar
                    pct={selected.completion}
                    color={selected.completion === 100 ? 'var(--status-good)' : 'var(--teal-400)'}
                    label={`Completeness ${selected.completion} percent`}
                  />
                </div>

                {selected.blocking.length > 0 ? (
                  <div className="oas-block-callout" role="status">
                    <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                    <div>
                      <strong>Blocking items</strong>
                      <ul className="oas-block-list">
                        {selected.blocking.map(b => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="oas-copy">No blocking items on this sample package.</p>
                )}

                <div className="oas-grid">
                  <div>
                    <span className="card-kicker">Time point</span>
                    <strong>{selected.type}</strong>
                    <span>OASIS-E2 package</span>
                  </div>
                  <div>
                    <span className="card-kicker">Window</span>
                    <strong>{selected.window}</strong>
                    <span>Regulatory timing</span>
                  </div>
                </div>

                <div className="oas-section">
                  <div className="card-kicker">Continue in</div>
                  <div className="oas-related-actions">
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

              <div className="oas-inspector-foot">
                <div className="oas-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no validation report is generated"
                    onClick={() => navigate('/cms-quality')}
                  >
                    Validation report
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!lockBlock}
                    title={lockBlock ?? 'Visual only · nothing is locked'}
                  >
                    <Lock size={14} strokeWidth={2} aria-hidden />
                    Lock package
                  </button>
                </div>
                <p className="oas-footnote">
                  {lockBlock
                    ? `Lock disabled · ${lockBlock} No durable write occurs in this prototype.`
                    : 'Lock / export controls are visual only. No OASIS file is submitted to CMS.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card oas-inspector-empty">
              <EmptyState
                icon={<ClipboardCheck size={26} strokeWidth={1.5} />}
                title="Select an assessment"
                sub="Inspect completeness, blockers, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
