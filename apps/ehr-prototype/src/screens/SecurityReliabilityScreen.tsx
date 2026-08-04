import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FlaskConical,
  Link2,
  Search,
  Shield,
  ShieldAlert,
  Siren,
} from 'lucide-react'
import { SEC_CONTROLS } from '../data/workspace'
import type { SecControl, SecControlStatus } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './sec.css'

type StatusFilter = 'all' | SecControlStatus
type DetailTab = 'overview' | 'proof' | 'gaps'

const STATUS_META: Record<SecControlStatus, { tone: StatusTone; label: string }> = {
  met: { tone: 'good', label: 'Met' },
  'at-risk': { tone: 'warn', label: 'At risk' },
  improving: { tone: 'progress', label: 'Improving' },
  gap: { tone: 'bad', label: 'Gap' },
  'not-tested': { tone: 'neutral', label: 'Not tested' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'met', label: 'Met' },
  { key: 'at-risk', label: 'At risk' },
  { key: 'improving', label: 'Improving' },
  { key: 'gap', label: 'Gap' },
  { key: 'not-tested', label: 'Not tested' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'proof', label: 'Proof' },
  { key: 'gaps', label: 'Gaps' },
]

export default function SecurityReliabilityScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(SEC_CONTROLS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SEC_CONTROLS.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (!q) return true
      const hay = [
        c.id,
        c.control,
        c.target,
        c.owner,
        c.gap,
        c.category,
        c.purpose,
        ...c.reqIds,
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
    if (!selectedId || !filtered.some(c => c.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = SEC_CONTROLS.find(c => c.id === selectedId) ?? null
  const met = SEC_CONTROLS.filter(c => c.status === 'met').length
  const atRisk = SEC_CONTROLS.filter(c => c.status === 'at-risk' || c.status === 'gap').length
  const notTested = SEC_CONTROLS.filter(c => c.status === 'not-tested').length

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain SEC · security & reliability</div>
          <h1 className="screen-title">Security & reliability</h1>
          <div className="screen-sub">
            Targets, observability, and incident posture — not a production SOC console.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/users-access')}>
            Users & access
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/legal-evidence')}>
            Legal holds
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no incident is opened"
          >
            <Siren size={15} strokeWidth={2} aria-hidden />
            Open incident drill
          </button>
        </div>
      </div>

      <div className="sec-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no vulnerability is remediated, no hold is applied, and no
          incident ticket is filed. Proposed SLOs are labels only.
        </span>
      </div>

      <RelatedNav route="/security" />

      <div className="sec-stats">
        <StatCard
          icon={<Shield size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Controls in sample"
          value={SEC_CONTROLS.length}
          sub={`${met} met · proposed baseline`}
          accent="teal"
        />
        <StatCard
          icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />}
          kicker="At risk / gap"
          value={atRisk}
          sub="Needs owner attention"
          accent={atRisk === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<Siren size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Not tested"
          value={notTested}
          sub="End-to-end proof pending"
          accent={notTested === 0 ? 'good' : 'orange'}
        />
        <StatCard
          icon={<Shield size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Incidents (30d)"
          value={0}
          sub="Synthetic env · none"
          accent="good"
        />
      </div>

      <div className="sec-workspace">
        <section className="card" aria-label="Security control register">
          <div className="sec-card-head">
            <div>
              <div className="card-kicker">Register</div>
              <h2 className="card-title sec-card-title">Controls</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="sec-toolbar">
            <label className="sec-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search controls</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search control, owner, category, or requirement"
              />
            </label>
            <div>
              <span className="sec-filter-label" id="sec-status-filters">Status</span>
              <div className="sec-filters" role="toolbar" aria-labelledby="sec-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'sec-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<Shield size={26} strokeWidth={1.5} />}
              title="No controls match"
              sub="Clear filters. Register is synthetic."
            />
          ) : (
            <div className="sec-list" role="listbox" aria-label="Control list">
              {filtered.map(c => {
                const meta = STATUS_META[c.status]
                const isSelected = c.id === selectedId
                const iconClass =
                  c.status === 'gap'
                    ? ' is-bad'
                    : c.status === 'at-risk' || c.status === 'not-tested'
                      ? ' is-warn'
                      : ''
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'sec-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(c.id)}
                  >
                    <span className={'sec-row-icon' + iconClass} aria-hidden>
                      <Shield size={16} strokeWidth={1.75} />
                    </span>
                    <span className="sec-row-main">
                      <span className="sec-row-top">
                        <span className="sec-id">{c.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{c.category}</span>
                      </span>
                      <span className="sec-title">{c.control}</span>
                      <span className="sec-meta">
                        Target {c.target} · {c.owner}
                      </span>
                      <span className="sec-meta">
                        Last proof {c.lastProof} · gap {c.gap}
                      </span>
                    </span>
                    <ArrowRight className="sec-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="sec-inspector" aria-label="Control inspector">
          {selected ? (
            <div className="card sec-inspector-card">
              <div className="sec-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title sec-card-title">{selected.id}</h2>
                  <p className="sec-inspector-title">{selected.control}</p>
                </div>
                <div className="sec-chips">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip tone="neutral">{selected.category}</StatusChip>
                </div>
              </div>

              <div className="sec-tabs" role="tablist" aria-label="Control detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'sec-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="sec-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="sec-panel">
                    <p className="sec-copy">{selected.purpose}</p>
                    {selected.status === 'gap' || selected.status === 'at-risk' ? (
                      <div
                        className={
                          'sec-callout' + (selected.status === 'gap' ? ' is-bad' : '')
                        }
                        role="status"
                      >
                        <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>
                            {selected.status === 'gap' ? 'Control gap' : 'At risk'}
                          </strong>
                          <span>{selected.gap}</span>
                        </div>
                      </div>
                    ) : null}
                    <div className="sec-grid">
                      <div>
                        <span className="card-kicker">Target</span>
                        <strong>{selected.target}</strong>
                        <span>Category · {selected.category}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Owner</span>
                        <strong>{selected.owner}</strong>
                        <span>Last proof {selected.lastProof}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Gap</span>
                        <strong>{selected.gap}</strong>
                        <span>Prototype assessment</span>
                      </div>
                      <div>
                        <span className="card-kicker">Status</span>
                        <strong>{STATUS_META[selected.status].label}</strong>
                        <span>Not production attestation</span>
                      </div>
                    </div>
                    <div className="sec-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="sec-related-actions">
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
                    <div className="sec-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="sec-req-link"
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

                {detailTab === 'proof' ? (
                  <div className="sec-panel">
                    <p className="sec-copy">
                      Proof artifacts are samples. Production attestation requires independent evidence.
                    </p>
                    <ul className="sec-bullet-list">
                      <li>
                        <strong>Last proof</strong>
                        <br />
                        {selected.lastProof}
                      </li>
                      <li>
                        <strong>Target</strong>
                        <br />
                        {selected.target}
                      </li>
                      <li>
                        <strong>Availability / RPO (proposed)</strong>
                        <br />
                        99.9% core · ≤15m RPO — labels only in this prototype.
                      </li>
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'gaps' ? (
                  <div className="sec-panel">
                    <p className="sec-copy">Gaps stay visible until closed with evidence — not checkbox theater.</p>
                    <div className="sec-grid">
                      <div>
                        <span className="card-kicker">Current gap</span>
                        <strong>{selected.gap}</strong>
                        <span>{STATUS_META[selected.status].label}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Owner</span>
                        <strong>{selected.owner}</strong>
                        <span>Remediation is visual only</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="sec-inspector-foot">
                <div className="sec-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no SLO dashboard opens live metrics"
                  >
                    SLO dashboard
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    title="Visual only · no incident is filed"
                  >
                    <Siren size={14} strokeWidth={2} aria-hidden />
                    Run drill
                  </button>
                </div>
                <p className="sec-footnote">
                  Drill / remediate controls are visual only. No security control state is mutated.
                </p>
              </div>
            </div>
          ) : (
            <div className="card sec-inspector-empty">
              <EmptyState
                icon={<Shield size={26} strokeWidth={1.5} />}
                title="Select a control"
                sub="Inspect targets, proof, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
