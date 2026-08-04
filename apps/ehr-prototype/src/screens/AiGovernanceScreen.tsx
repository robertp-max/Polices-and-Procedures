import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  FlaskConical,
  Link2,
  Power,
  Search,
  ShieldBan,
  Sparkles,
} from 'lucide-react'
import { AI_CAPABILITIES } from '../data/workspace'
import type { AiCapability, AiCapabilityState } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './aig.css'

type StatusFilter = 'all' | AiCapabilityState
type DetailTab = 'overview' | 'eval' | 'controls'

const STATUS_META: Record<AiCapabilityState, { tone: StatusTone; label: string }> = {
  approved: { tone: 'good', label: 'Approved' },
  evaluation: { tone: 'progress', label: 'Evaluation' },
  prohibited: { tone: 'bad', label: 'Prohibited' },
  paused: { tone: 'warn', label: 'Paused' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All states' },
  { key: 'approved', label: 'Approved' },
  { key: 'evaluation', label: 'Evaluation' },
  { key: 'paused', label: 'Paused' },
  { key: 'prohibited', label: 'Prohibited' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'eval', label: 'Evaluation' },
  { key: 'controls', label: 'Controls' },
]

function promoteBlocked(c: AiCapability): string | null {
  if (c.state === 'prohibited') return 'Prohibited capabilities cannot be promoted.'
  if (c.state === 'approved') return 'Already approved in this sample.'
  if (c.killSwitch === 'tripped') return 'Kill switch tripped — re-arm after eval refresh first.'
  if (c.state === 'evaluation') return 'Evaluation must complete human gate review before promote.'
  return null
}

export default function AiGovernanceScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(AI_CAPABILITIES[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AI_CAPABILITIES.filter(c => {
      if (statusFilter !== 'all' && c.state !== statusFilter) return false
      if (!q) return true
      const hay = [
        c.id,
        c.name,
        c.intendedUse,
        c.humanGate,
        c.evalStatus,
        c.owner,
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

  const selected = AI_CAPABILITIES.find(c => c.id === selectedId) ?? null
  const approved = AI_CAPABILITIES.filter(c => c.state === 'approved').length
  const evaluation = AI_CAPABILITIES.filter(c => c.state === 'evaluation').length
  const prohibited = AI_CAPABILITIES.filter(c => c.state === 'prohibited').length
  const overrides = AI_CAPABILITIES.reduce((n, c) => n + c.overrides7d, 0)
  const promoteBlock = selected ? promoteBlocked(selected) : null

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain AIG · AI governance</div>
          <h1 className="screen-title">AI governance</h1>
          <div className="screen-sub">
            Approved intended uses, human control, evaluation, and kill switch — Brad remains assistive only.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clinical')}>
            Clinical
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/security')}>
            Security
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no proposal is advanced"
          >
            <Sparkles size={15} strokeWidth={2} aria-hidden />
            Review proposal
          </button>
        </div>
      </div>

      <div className="aig-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no model is promoted, no clinical note is auto-sealed, and kill
          switch drills do not affect production. Brad never acts without a human gate.
        </span>
      </div>

      <RelatedNav route="/ai-governance" />

      <div className="aig-stats">
        <StatCard
          icon={<Bot size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Approved uses"
          value={approved}
          sub={`${AI_CAPABILITIES.length} capabilities in sample`}
          accent="teal"
        />
        <StatCard
          icon={<Sparkles size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending eval"
          value={evaluation}
          sub="Shadow or live-monitor"
          accent="teal"
        />
        <StatCard
          icon={<ShieldBan size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Prohibited"
          value={prohibited}
          sub="Hard deny · auto-action blocked"
          accent={prohibited > 0 ? 'bad' : 'good'}
        />
        <StatCard
          icon={<Power size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Human overrides (7d)"
          value={overrides}
          sub="Edits prove human control"
          accent="orange"
        />
      </div>

      <div className="aig-workspace">
        <section className="card" aria-label="AI capability register">
          <div className="aig-card-head">
            <div>
              <div className="card-kicker">Register</div>
              <h2 className="card-title aig-card-title">Capabilities</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="aig-toolbar">
            <label className="aig-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search capabilities</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search capability, use, owner, or requirement"
              />
            </label>
            <div>
              <span className="aig-filter-label" id="aig-status-filters">State</span>
              <div className="aig-filters" role="toolbar" aria-labelledby="aig-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'aig-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<Bot size={26} strokeWidth={1.5} />}
              title="No capabilities match"
              sub="Clear filters. Register is synthetic."
            />
          ) : (
            <div className="aig-list" role="listbox" aria-label="Capability list">
              {filtered.map(c => {
                const meta = STATUS_META[c.state]
                const isSelected = c.id === selectedId
                const iconClass =
                  c.state === 'prohibited'
                    ? ' is-bad'
                    : c.state === 'paused' || c.killSwitch === 'tripped'
                      ? ' is-warn'
                      : ''
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'aig-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(c.id)}
                  >
                    <span className={'aig-row-icon' + iconClass} aria-hidden>
                      {c.state === 'prohibited' ? (
                        <ShieldBan size={16} strokeWidth={1.75} />
                      ) : (
                        <Bot size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="aig-row-main">
                      <span className="aig-row-top">
                        <span className="aig-id">{c.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">
                          Kill · {c.killSwitch}
                        </span>
                      </span>
                      <span className="aig-title">{c.name}</span>
                      <span className="aig-meta">{c.intendedUse}</span>
                      <span className="aig-meta">
                        {c.humanGate} · {c.overrides7d} overrides / 7d
                      </span>
                    </span>
                    <ArrowRight className="aig-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="aig-inspector" aria-label="Capability inspector">
          {selected ? (
            <div className="card aig-inspector-card">
              <div className="aig-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title aig-card-title">{selected.id}</h2>
                  <p className="aig-inspector-title">{selected.name}</p>
                </div>
                <div className="aig-chips">
                  <StatusChip tone={STATUS_META[selected.state].tone}>
                    {STATUS_META[selected.state].label}
                  </StatusChip>
                  <StatusChip
                    tone={
                      selected.killSwitch === 'armed'
                        ? 'good'
                        : selected.killSwitch === 'tripped'
                          ? 'bad'
                          : 'neutral'
                    }
                  >
                    Kill switch {selected.killSwitch}
                  </StatusChip>
                </div>
              </div>

              <div className="aig-tabs" role="tablist" aria-label="Capability detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'aig-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="aig-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="aig-panel">
                    <p className="aig-copy">{selected.purpose}</p>
                    {selected.state === 'prohibited' ? (
                      <div className="aig-callout is-bad" role="status">
                        <ShieldBan size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Hard deny</strong>
                          <span>
                            Auto-action and suggestion paths are blocked until AIG gates explicitly open.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    {selected.killSwitch === 'tripped' ? (
                      <div className="aig-callout is-bad" role="status">
                        <Power size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Kill switch tripped</strong>
                          <span>No generation until re-arm after evaluation refresh.</span>
                        </div>
                      </div>
                    ) : null}
                    <div className="aig-grid">
                      <div>
                        <span className="card-kicker">Intended use</span>
                        <strong>{selected.intendedUse}</strong>
                        <span>Owner · {selected.owner}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Human gate</span>
                        <strong>{selected.humanGate}</strong>
                        <span>Required before any durable write</span>
                      </div>
                      <div>
                        <span className="card-kicker">Eval status</span>
                        <strong>{selected.evalStatus}</strong>
                        <span>{selected.overrides7d} human overrides / 7d</span>
                      </div>
                      <div>
                        <span className="card-kicker">Kill switch</span>
                        <strong>{selected.killSwitch}</strong>
                        <span>Drill is visual only here</span>
                      </div>
                    </div>
                    <div className="aig-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="aig-related-actions">
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
                    <div className="aig-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="aig-req-link"
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

                {detailTab === 'eval' ? (
                  <div className="aig-panel">
                    <p className="aig-copy">
                      Evaluation evidence is sample-only. Shadow mode never writes chart authority.
                    </p>
                    <ul className="aig-bullet-list">
                      <li>
                        <strong>Status</strong>
                        <br />
                        {selected.evalStatus}
                      </li>
                      <li>
                        <strong>Human overrides (7d)</strong>
                        <br />
                        {selected.overrides7d} — overrides prove clinicians remain in control.
                      </li>
                      <li>
                        <strong>Clinical write path</strong>
                        <br />
                        Assistive draft only · seal / sign / submit remain human.
                      </li>
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'controls' ? (
                  <div className="aig-panel">
                    <p className="aig-copy">
                      Kill-switch drills are rehearsals. No model traffic is stopped from this prototype.
                    </p>
                    <div className="aig-grid">
                      <div>
                        <span className="card-kicker">Switch state</span>
                        <strong>{selected.killSwitch}</strong>
                        <span>{STATUS_META[selected.state].label}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Authority</span>
                        <strong>Human always final</strong>
                        <span>No silent clinical write</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="aig-inspector-foot">
                <div className="aig-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · kill switch not tripped"
                  >
                    <Power size={14} strokeWidth={2} aria-hidden />
                    Kill-switch drill
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!promoteBlock}
                    title={promoteBlock ?? 'Visual only · no capability is promoted'}
                  >
                    Promote capability
                  </button>
                </div>
                <p className="aig-footnote">
                  {promoteBlock
                    ? `Promote disabled · ${promoteBlock} No model policy is written.`
                    : 'Promote / kill-switch controls are visual only. No AI policy change is recorded.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card aig-inspector-empty">
              <EmptyState
                icon={<Bot size={26} strokeWidth={1.5} />}
                title="Select a capability"
                sub="Inspect intended use, human gate, and kill switch."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
