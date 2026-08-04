import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarRange,
  ClipboardList,
  FileStack,
  FlaskConical,
  Receipt,
  Search,
  Stethoscope,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import { EPISODES } from '../data/workspace'
import type { EpisodeRecord } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, PatientAvatar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './epi.css'

type EpisodeStatus = EpisodeRecord['status']
type StatusFilter = 'all' | EpisodeStatus

const STATUS_META: Record<EpisodeStatus, { tone: StatusTone; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  'pending-soc': { tone: 'progress', label: 'Pending SOC' },
  'recert-due': { tone: 'warn', label: 'Recert due' },
  'discharge-planned': { tone: 'neutral', label: 'Discharge planned' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'pending-soc', label: 'Pending SOC' },
  { key: 'recert-due', label: 'Recert due' },
  { key: 'discharge-planned', label: 'Discharge planned' },
]

export default function EpisodesScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(EPISODES[0]?.id ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EPISODES.filter(ep => {
      if (statusFilter !== 'all' && ep.status !== statusFilter) return false
      if (!q) return true
      const patient = getPatient(ep.patientId)
      const hay = [
        ep.id,
        ep.period,
        ep.socDate,
        ep.claimStatus,
        String(ep.certPeriod),
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
        STATUS_META[ep.status].label,
      ]
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
    if (!selectedId || !filtered.some(e => e.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = EPISODES.find(e => e.id === selectedId) ?? null
  const activeCount = EPISODES.filter(e => e.status === 'active').length
  const recertCount = EPISODES.filter(e => e.status === 'recert-due').length
  const pendingSoc = EPISODES.filter(e => e.status === 'pending-soc').length
  const ordersOpen = EPISODES.reduce((n, e) => n + e.ordersOpen, 0)

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain EPI · episodes & certification</div>
          <h1 className="screen-title">Episodes & certification</h1>
          <div className="screen-sub">
            Home-health payment periods, certification state, OASIS and claim readiness — synthetic
            cohort for layout evaluation.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/oasis')}>
            OASIS workspace
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/billing')}>
            Billing
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no certification period is opened"
            onClick={() => {
              if (EPISODES[0]) setSelectedId(EPISODES[0].id)
            }}
          >
            <CalendarRange size={15} strokeWidth={2} aria-hidden />
            Open episode
          </button>
        </div>
      </div>

      <div className="epi-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · opening a period, certifying, or transferring does not write
          clinical or billing state. Production requires authorized EPI requirements and evidence gates.
        </span>
      </div>

      <RelatedNav route="/episodes" />

      <div className="epi-stats">
        <StatCard
          icon={<FileStack size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active episodes"
          value={activeCount}
          sub={`${EPISODES.length} in sample registry`}
          accent="teal"
        />
        <StatCard
          icon={<CalendarRange size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Recert due"
          value={recertCount}
          sub="Physician signature windows"
          accent={recertCount === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<Stethoscope size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending SOC"
          value={pendingSoc}
          sub="New payment periods not started"
          accent="orange"
        />
        <StatCard
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Open orders"
          value={ordersOpen}
          sub="Across sample episodes"
          accent="teal"
        />
      </div>

      <div className="epi-workspace">
        <section className="card epi-registry" aria-label="Episode registry">
          <div className="epi-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title epi-card-title">Episodes</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="epi-toolbar">
            <label className="epi-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search episodes</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search patient, episode, claim, or SOC date"
              />
            </label>
            <div className="epi-filter-block">
              <span className="epi-filter-label" id="epi-status-filters">Status</span>
              <div className="epi-filters" role="toolbar" aria-labelledby="epi-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'epi-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<CalendarRange size={26} strokeWidth={1.5} />}
              title="No episodes match"
              sub="Clear filters or search. All episodes are synthetic."
            />
          ) : (
            <div className="epi-list" role="listbox" aria-label="Episode list">
              {filtered.map(ep => {
                const patient = getPatient(ep.patientId)
                const meta = STATUS_META[ep.status]
                const isSelected = ep.id === selectedId
                return (
                  <button
                    key={ep.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'epi-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => setSelectedId(ep.id)}
                  >
                    <span
                      className={
                        'epi-row-icon' +
                        (ep.status === 'recert-due'
                          ? ' is-warn'
                          : ep.status === 'pending-soc'
                            ? ' is-pending'
                            : '')
                      }
                      aria-hidden
                    >
                      <CalendarRange size={16} strokeWidth={1.75} />
                    </span>
                    <span className="epi-row-main">
                      <span className="epi-row-top">
                        <span className="epi-id">{ep.id}</span>
                        <span className="chip chip-neutral">Cert {ep.certPeriod}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="epi-title">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient'}
                      </span>
                      <span className="epi-matter">
                        {ep.period} · SOC {ep.socDate}
                      </span>
                      <span className="epi-meta">
                        {patient ? (
                          <span className="epi-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            <span className="epi-who-name">MRN {patient.mrn}</span>
                          </span>
                        ) : null}
                        <span className="epi-dot" aria-hidden />
                        <span>{ep.ordersOpen} open orders</span>
                        <span className="epi-dot" aria-hidden />
                        <span>{ep.claimStatus}</span>
                      </span>
                    </span>
                    <ArrowRight className="epi-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="epi-inspector" aria-label="Episode inspector">
          {selected ? (
            <div className="card epi-inspector-card">
              <div className="epi-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title epi-card-title">{selected.id}</h2>
                  <p className="epi-inspector-title">
                    {(() => {
                      const p = getPatient(selected.patientId)
                      return p ? `${p.firstName} ${p.lastName}` : 'Episode'
                    })()}
                  </p>
                </div>
                <div className="epi-status-row">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <span className="chip chip-neutral">Cert period {selected.certPeriod}</span>
                </div>
              </div>

              <div className="epi-inspector-body">
                {(() => {
                  const p = getPatient(selected.patientId)
                  if (!p) return null
                  return (
                    <button
                      type="button"
                      className="epi-patient"
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                      <span>
                        <strong>
                          {p.firstName} {p.lastName}
                        </strong>
                        <span>
                          MRN {p.mrn} · {p.primaryDx.code} · open chart
                        </span>
                      </span>
                      <ArrowRight size={14} strokeWidth={2} aria-hidden />
                    </button>
                  )
                })()}

                <p className="epi-copy">
                  Payment period {selected.period}. Claim path: {selected.claimStatus}. Open orders
                  on this episode: {selected.ordersOpen}. All figures are synthetic sample data.
                </p>

                <div className="epi-grid">
                  <div>
                    <span className="card-kicker">SOC date</span>
                    <strong>{selected.socDate}</strong>
                    <span>Start of care</span>
                  </div>
                  <div>
                    <span className="card-kicker">Period</span>
                    <strong>{selected.period}</strong>
                    <span>PDGM / episode window</span>
                  </div>
                  <div>
                    <span className="card-kicker">Open orders</span>
                    <strong>{selected.ordersOpen}</strong>
                    <span>Physician / plan path</span>
                  </div>
                  <div>
                    <span className="card-kicker">Claim status</span>
                    <strong>{selected.claimStatus}</strong>
                    <span>Revenue sample label</span>
                  </div>
                </div>

                <div className="epi-section">
                  <div className="card-kicker">Continue in</div>
                  <div className="epi-related-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(selected.oasisHref)}
                    >
                      <FileStack size={12} strokeWidth={2} aria-hidden />
                      OASIS
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/orders')}
                    >
                      Orders
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/billing')}
                    >
                      <Receipt size={12} strokeWidth={2} aria-hidden />
                      Billing
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

              <div className="epi-inspector-foot">
                <div className="epi-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no certification is requested"
                  >
                    Request cert signature
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={selected.status === 'pending-soc'}
                    title={
                      selected.status === 'pending-soc'
                        ? 'SOC not started — cannot open recert path'
                        : 'Visual only · no period is sealed'
                    }
                  >
                    Open cert period
                  </button>
                </div>
                <p className="epi-footnote">
                  Certification and period controls are visual only. No CMS-485 or claim is submitted.
                </p>
              </div>
            </div>
          ) : (
            <div className="card epi-inspector-empty">
              <EmptyState
                icon={<CalendarRange size={26} strokeWidth={1.5} />}
                title="Select an episode"
                sub="Inspect period, orders, claim holds, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
