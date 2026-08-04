import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FlaskConical,
  Link2,
  PackageOpen,
  RotateCcw,
  Search,
  Shield,
  Truck,
} from 'lucide-react'
import { MIGRATION_STREAMS } from '../data/workspace'
import type { MigRisk, MigStreamStatus, MigrationStream } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, ProgressBar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './mig.css'

type StatusFilter = 'all' | MigStreamStatus
type RiskFilter = 'all' | MigRisk
type DetailTab = 'overview' | 'evidence' | 'gates'

const STATUS_META: Record<MigStreamStatus, { tone: StatusTone; label: string }> = {
  open: { tone: 'neutral', label: 'Open' },
  draft: { tone: 'warn', label: 'Draft' },
  scheduled: { tone: 'progress', label: 'Scheduled' },
  blocked: { tone: 'bad', label: 'Blocked' },
  complete: { tone: 'good', label: 'Complete' },
}

const RISK_META: Record<MigRisk, { tone: StatusTone; label: string }> = {
  high: { tone: 'bad', label: 'High' },
  medium: { tone: 'warn', label: 'Medium' },
  low: { tone: 'good', label: 'Low' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'open', label: 'Open' },
  { key: 'draft', label: 'Draft' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'complete', label: 'Complete' },
]

const RISK_FILTERS: { key: RiskFilter; label: string }[] = [
  { key: 'all', label: 'All risks' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'gates', label: 'Gates' },
]

function advanceBlocked(s: MigrationStream): string | null {
  if (s.status === 'blocked') return 'Stream blocked until build authorization and contract gates clear.'
  if (s.status === 'complete') return 'Already complete in this sample.'
  if (s.risk === 'high' && s.progress < 50) return 'High-risk streams need ≥50% evidence readiness before advance.'
  return null
}

export default function MigrationScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(MIGRATION_STREAMS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MIGRATION_STREAMS.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (riskFilter !== 'all' && s.risk !== riskFilter) return false
      if (!q) return true
      const hay = [
        s.id,
        s.workstream,
        s.owner,
        s.evidence,
        s.nextGate,
        s.purpose,
        ...s.reqIds,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, riskFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(s => s.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = MIGRATION_STREAMS.find(s => s.id === selectedId) ?? null
  const blocked = MIGRATION_STREAMS.filter(s => s.status === 'blocked').length
  const highRisk = MIGRATION_STREAMS.filter(s => s.risk === 'high').length
  const scheduled = MIGRATION_STREAMS.filter(s => s.status === 'scheduled').length
  const advanceBlock = selected ? advanceBlocked(selected) : null

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain MIG · migration & adoption</div>
          <h1 className="screen-title">Migration & adoption</h1>
          <div className="screen-sub">
            WellSky export readiness, pilot cohorts, and rehearsed rollback — no live cutover authorized.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/vendors')}>
            Vendors
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/data-exports')}>
            Exports
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no inventory is opened as a durable job"
          >
            <PackageOpen size={15} strokeWidth={2} aria-hidden />
            Open export inventory
          </button>
        </div>
      </div>

      <div className="mig-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no patient is piloted, no chart is cut over, and rollback drills
          do not touch production. Build remains unauthorized until TRC gates clear.
        </span>
      </div>

      <RelatedNav route="/migration" />

      <div className="mig-stats">
        <StatCard
          icon={<Truck size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Workstreams"
          value={MIGRATION_STREAMS.length}
          sub="Sample migration board"
          accent="teal"
        />
        <StatCard
          icon={<PackageOpen size={16} strokeWidth={1.75} aria-hidden />}
          kicker="High risk"
          value={highRisk}
          sub="Contract + fidelity focus"
          accent={highRisk === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<RotateCcw size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Rollback drills"
          value={scheduled}
          sub="Tabletop / scheduled only"
          accent="teal"
        />
        <StatCard
          icon={<Shield size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Blocked"
          value={blocked}
          sub="Awaiting authorization"
          accent={blocked === 0 ? 'good' : 'bad'}
        />
      </div>

      <div className="mig-workspace">
        <section className="card" aria-label="Migration workstream board">
          <div className="mig-card-head">
            <div>
              <div className="card-kicker">Board</div>
              <h2 className="card-title mig-card-title">Workstreams</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="mig-toolbar">
            <label className="mig-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search workstreams</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search workstream, owner, gate, or requirement"
              />
            </label>
            <div>
              <span className="mig-filter-label" id="mig-status-filters">Status</span>
              <div className="mig-filters" role="toolbar" aria-labelledby="mig-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'mig-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mig-filter-label" id="mig-risk-filters">Risk</span>
              <div className="mig-filters" role="toolbar" aria-labelledby="mig-risk-filters">
                {RISK_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'mig-filter' + (riskFilter === f.key ? ' is-active' : '')}
                    aria-pressed={riskFilter === f.key}
                    onClick={() => setRiskFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Truck size={26} strokeWidth={1.5} />}
              title="No workstreams match"
              sub="Clear filters. Board is synthetic."
            />
          ) : (
            <div className="mig-list" role="listbox" aria-label="Workstream list">
              {filtered.map(s => {
                const meta = STATUS_META[s.status]
                const isSelected = s.id === selectedId
                const iconClass =
                  s.status === 'blocked' ? ' is-bad' : s.risk === 'high' ? ' is-warn' : ''
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'mig-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(s.id)}
                  >
                    <span className={'mig-row-icon' + iconClass} aria-hidden>
                      <Truck size={16} strokeWidth={1.75} />
                    </span>
                    <span className="mig-row-main">
                      <span className="mig-row-top">
                        <span className="mig-id">{s.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <StatusChip tone={RISK_META[s.risk].tone}>{RISK_META[s.risk].label} risk</StatusChip>
                      </span>
                      <span className="mig-title">{s.workstream}</span>
                      <span className="mig-meta">
                        {s.owner} · next gate {s.nextGate}
                      </span>
                      <span className="mig-meta">Evidence · {s.evidence}</span>
                    </span>
                    <span className="mig-meter">
                      <span className="mig-meter-label">{s.progress}%</span>
                      <ProgressBar
                        pct={s.progress}
                        color={
                          s.status === 'blocked'
                            ? 'var(--status-bad)'
                            : s.progress >= 60
                              ? 'var(--status-good)'
                              : 'var(--teal-400)'
                        }
                        label={`${s.id} readiness ${s.progress} percent`}
                      />
                    </span>
                    <ArrowRight className="mig-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="mig-inspector" aria-label="Workstream inspector">
          {selected ? (
            <div className="card mig-inspector-card">
              <div className="mig-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title mig-card-title">{selected.id}</h2>
                  <p className="mig-inspector-title">{selected.workstream}</p>
                </div>
                <div className="mig-chips">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip tone={RISK_META[selected.risk].tone}>
                    {RISK_META[selected.risk].label} risk
                  </StatusChip>
                </div>
              </div>

              <div className="mig-tabs" role="tablist" aria-label="Workstream detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'mig-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mig-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="mig-panel">
                    <p className="mig-copy">{selected.purpose}</p>
                    {selected.status === 'blocked' ? (
                      <div className="mig-callout is-bad" role="status">
                        <PackageOpen size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Cutover blocked</strong>
                          <span>
                            No live chart migration until requirements, prototypes, and evidence gates clear.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <div className="mig-grid">
                      <div>
                        <span className="card-kicker">Owner</span>
                        <strong>{selected.owner}</strong>
                        <span>Readiness {selected.progress}%</span>
                      </div>
                      <div>
                        <span className="card-kicker">Next gate</span>
                        <strong>{selected.nextGate}</strong>
                        <span>{STATUS_META[selected.status].label}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Evidence</span>
                        <strong>{selected.evidence}</strong>
                        <span>Sample artifacts only</span>
                      </div>
                      <div>
                        <span className="card-kicker">Risk</span>
                        <strong>{RISK_META[selected.risk].label}</strong>
                        <span>Prototype assessment</span>
                      </div>
                    </div>
                    <ProgressBar
                      pct={selected.progress}
                      color="var(--teal-400)"
                      label={`${selected.id} readiness`}
                    />
                    <div className="mig-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="mig-related-actions">
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
                    <div className="mig-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="mig-req-link"
                              onClick={() => navigate('/requirements')}
                            >
                              {id}
                            </button>
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'evidence' ? (
                  <div className="mig-panel">
                    <p className="mig-copy">
                      Export fidelity evidence stays partial until contract analysis completes.
                    </p>
                    <ul className="mig-bullet-list">
                      <li>
                        <strong>Current evidence</strong>
                        <br />
                        {selected.evidence}
                      </li>
                      <li>
                        <strong>Pilot patients</strong>
                        <br />
                        0 · not authorized in this prototype.
                      </li>
                      <li>
                        <strong>Rollback</strong>
                        <br />
                        Tabletop notes only · live drill not authorized.
                      </li>
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'gates' ? (
                  <div className="mig-panel">
                    <p className="mig-copy">
                      Gates are sequential. Advancing a workstream does not authorize production cutover.
                    </p>
                    <div className="mig-grid">
                      <div>
                        <span className="card-kicker">Next gate</span>
                        <strong>{selected.nextGate}</strong>
                        <span>{STATUS_META[selected.status].label}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Dev authorization</span>
                        <strong>Blocked</strong>
                        <span>See Traceability</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/traceability')}
                    >
                      Open traceability
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mig-inspector-foot">
                <div className="mig-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no rollback executes"
                  >
                    <RotateCcw size={14} strokeWidth={2} aria-hidden />
                    Rollback drill
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!advanceBlock}
                    title={advanceBlock ?? 'Visual only · no gate is advanced'}
                  >
                    Advance gate
                  </button>
                </div>
                <p className="mig-footnote">
                  {advanceBlock
                    ? `Advance disabled · ${advanceBlock} No migration state is written.`
                    : 'Advance / drill controls are visual only. No cutover or export job is started.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card mig-inspector-empty">
              <EmptyState
                icon={<Truck size={26} strokeWidth={1.5} />}
                title="Select a workstream"
                sub="Inspect evidence, gates, and related interfaces."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}


