import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  FlaskConical,
  Link2,
  Network,
  Plug,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { INTERFACE_ADAPTERS } from '../data/workspace'
import type { AdapterHealth, InterfaceAdapter } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './fhr.css'

type StatusFilter = 'all' | AdapterHealth
type DetailTab = 'overview' | 'contract' | 'ops'

const STATUS_META: Record<AdapterHealth, { tone: StatusTone; label: string }> = {
  healthy: { tone: 'good', label: 'Healthy' },
  attention: { tone: 'warn', label: 'Attention' },
  down: { tone: 'bad', label: 'Down' },
  shadow: { tone: 'neutral', label: 'Shadow' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'attention', label: 'Attention' },
  { key: 'down', label: 'Down' },
  { key: 'shadow', label: 'Shadow' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'contract', label: 'Contract' },
  { key: 'ops', label: 'Ops' },
]

function replayBlocked(a: InterfaceAdapter): string | null {
  if (a.status === 'shadow') return 'Shadow adapters do not accept production replay.'
  if (a.status === 'down') return 'Adapter down — restore connectivity before replay.'
  if (a.testResult === 'fail') return 'Failing contract tests block replay in production design.'
  return null
}

export default function InteroperabilityScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(INTERFACE_ADAPTERS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return INTERFACE_ADAPTERS.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (!q) return true
      const hay = [
        a.id,
        a.name,
        a.transport,
        a.owner,
        a.direction,
        a.vendor ?? '',
        a.contract,
        a.purpose,
        ...a.reqIds,
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
    if (!selectedId || !filtered.some(a => a.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = INTERFACE_ADAPTERS.find(a => a.id === selectedId) ?? null
  const failing = INTERFACE_ADAPTERS.filter(a => a.testResult === 'fail').length
  const attention = INTERFACE_ADAPTERS.filter(a => a.status === 'attention' || a.status === 'down').length
  const shadow = INTERFACE_ADAPTERS.filter(a => a.status === 'shadow').length
  const healthy = INTERFACE_ADAPTERS.filter(a => a.status === 'healthy').length
  const replayBlock = selected ? replayBlocked(selected) : null

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain FHR · interoperability</div>
          <h1 className="screen-title">Interoperability</h1>
          <div className="screen-sub">
            FHIR adapters, partner rails, and contract tests — design prototype, not a live ESB console.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/vendors')}>
            Vendors & BAAs
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/migration')}>
            Migration
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no adapter is opened"
          >
            <Plug size={15} strokeWidth={2} aria-hidden />
            View adapter
          </button>
        </div>
      </div>

      <div className="fhr-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no partner message is sent, replayed, or acknowledged.
          Production requires BAA-active vendors, contract tests, and SEC gates.
        </span>
      </div>

      <RelatedNav route="/interoperability" />

      <div className="fhr-stats">
        <StatCard
          icon={<Network size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Adapters"
          value={INTERFACE_ADAPTERS.length}
          sub="Declared interfaces in sample"
          accent="teal"
        />
        <StatCard
          icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Failing tests"
          value={failing}
          sub={`${attention} need owner attention`}
          accent={failing === 0 ? 'good' : 'bad'}
        />
        <StatCard
          icon={<Activity size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Healthy"
          value={healthy}
          sub={`${shadow} in shadow mode`}
          accent="good"
        />
        <StatCard
          icon={<RefreshCw size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Replay queue"
          value={INTERFACE_ADAPTERS.filter(a => a.status === 'attention').length}
          sub="Visible failures · no silent drop"
          accent={attention === 0 ? 'good' : 'warn'}
        />
      </div>

      <div className="fhr-workspace">
        <section className="card" aria-label="Adapter registry">
          <div className="fhr-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title fhr-card-title">Adapters</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="fhr-toolbar">
            <label className="fhr-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search adapters</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search adapter, transport, vendor, or requirement"
              />
            </label>
            <div>
              <span className="fhr-filter-label" id="fhr-status-filters">Health</span>
              <div className="fhr-filters" role="toolbar" aria-labelledby="fhr-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'fhr-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<Network size={26} strokeWidth={1.5} />}
              title="No adapters match"
              sub="Clear filters. Registry is synthetic."
            />
          ) : (
            <div className="fhr-list" role="listbox" aria-label="Adapter list">
              {filtered.map(a => {
                const meta = STATUS_META[a.status]
                const isSelected = a.id === selectedId
                const iconClass =
                  a.status === 'down' ? ' is-bad' : a.status === 'attention' ? ' is-warn' : ''
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'fhr-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(a.id)}
                  >
                    <span className={'fhr-row-icon' + iconClass} aria-hidden>
                      <Plug size={16} strokeWidth={1.75} />
                    </span>
                    <span className="fhr-row-main">
                      <span className="fhr-row-top">
                        <span className="fhr-id">{a.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{a.direction}</span>
                      </span>
                      <span className="fhr-title">{a.name}</span>
                      <span className="fhr-meta">
                        {a.transport} · {a.owner}
                      </span>
                      <span className="fhr-meta">
                        Last test {a.lastTest} · {a.events24h} events / 24h
                      </span>
                    </span>
                    <ArrowRight className="fhr-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="fhr-inspector" aria-label="Adapter inspector">
          {selected ? (
            <div className="card fhr-inspector-card">
              <div className="fhr-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title fhr-card-title">{selected.id}</h2>
                  <p className="fhr-inspector-title">{selected.name}</p>
                </div>
                <div className="fhr-chips">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip
                    tone={
                      selected.testResult === 'pass'
                        ? 'good'
                        : selected.testResult === 'fail'
                          ? 'bad'
                          : 'neutral'
                    }
                  >
                    Test {selected.testResult}
                  </StatusChip>
                </div>
              </div>

              <div className="fhr-tabs" role="tablist" aria-label="Adapter detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'fhr-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="fhr-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="fhr-panel">
                    <p className="fhr-copy">{selected.purpose}</p>
                    {selected.status === 'attention' || selected.status === 'down' ? (
                      <div
                        className={'fhr-callout' + (selected.status === 'down' ? ' is-bad' : '')}
                        role="status"
                      >
                        <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>
                            {selected.status === 'down' ? 'Adapter down' : 'Needs owner attention'}
                          </strong>
                          <span>
                            Failures stay visible. No silent drop of partner traffic in production design.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <div className="fhr-grid">
                      <div>
                        <span className="card-kicker">Transport</span>
                        <strong>{selected.transport}</strong>
                        <span>{selected.direction}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Owner</span>
                        <strong>{selected.owner}</strong>
                        <span>{selected.vendor ?? 'Internal'}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Events (24h)</span>
                        <strong>{selected.events24h}</strong>
                        <span>Synthetic volume</span>
                      </div>
                      <div>
                        <span className="card-kicker">Last contract test</span>
                        <strong>{selected.lastTest}</strong>
                        <span>Result · {selected.testResult}</span>
                      </div>
                    </div>
                    <div className="fhr-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="fhr-related-actions">
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
                    <div className="fhr-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="fhr-req-link"
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

                {detailTab === 'contract' ? (
                  <div className="fhr-panel">
                    <p className="fhr-copy">
                      Contract tests gate go-live. Sample only — no partner assertion is executed.
                    </p>
                    <ul className="fhr-bullet-list">
                      <li>
                        <strong>Contract</strong>
                        <br />
                        {selected.contract}
                      </li>
                      <li>
                        <strong>BAA dependency</strong>
                        <br />
                        Production credentials stay dark until vendor BAA is active.
                      </li>
                    </ul>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/vendors')}
                    >
                      Open vendors & BAAs
                    </button>
                  </div>
                ) : null}

                {detailTab === 'ops' ? (
                  <div className="fhr-panel">
                    <p className="fhr-copy">
                      Replay is dual-controlled and never invents clinical facts. Buttons are visual only.
                    </p>
                    <div className="fhr-grid">
                      <div>
                        <span className="card-kicker">Queue posture</span>
                        <strong>
                          {selected.status === 'attention' ? 'Replay candidates' : 'Clear'}
                        </strong>
                        <span>{selected.events24h} last 24h</span>
                      </div>
                      <div>
                        <span className="card-kicker">Clinical authority</span>
                        <strong>Never auto-created</strong>
                        <span>ADT does not auto-SOC</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="fhr-inspector-foot">
                <div className="fhr-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no contract suite runs"
                  >
                    Contract tests
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!replayBlock}
                    title={replayBlock ?? 'Visual only · no message is replayed'}
                  >
                    <RefreshCw size={14} strokeWidth={2} aria-hidden />
                    Replay queue
                  </button>
                </div>
                <p className="fhr-footnote">
                  {replayBlock
                    ? `Replay disabled · ${replayBlock} No partner traffic is sent.`
                    : 'Adapter / replay controls are visual only. No interface write occurs.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card fhr-inspector-empty">
              <EmptyState
                icon={<Network size={26} strokeWidth={1.5} />}
                title="Select an adapter"
                sub="Inspect contract, health, and related vendors."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
