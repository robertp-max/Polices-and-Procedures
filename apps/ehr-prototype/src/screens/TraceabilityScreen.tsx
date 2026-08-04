import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  FlaskConical,
  GitMerge,
  Link2,
  Search,
  Waypoints,
} from 'lucide-react'
import { TRACE_OBJECTS } from '../data/workspace'
import type { TraceObject, TraceObjectStatus } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, ProgressBar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './trc.css'

type StatusFilter = 'all' | TraceObjectStatus
type DetailTab = 'overview' | 'coverage' | 'gates'

const STATUS_META: Record<TraceObjectStatus, { tone: StatusTone; label: string }> = {
  baseline: { tone: 'good', label: 'Baseline' },
  'in-review': { tone: 'progress', label: 'In review' },
  'in-prototype': { tone: 'neutral', label: 'In prototype' },
  'gate-open': { tone: 'warn', label: 'Gate open' },
  blocked: { tone: 'bad', label: 'Blocked' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'baseline', label: 'Baseline' },
  { key: 'in-review', label: 'In review' },
  { key: 'in-prototype', label: 'In prototype' },
  { key: 'gate-open', label: 'Gate open' },
  { key: 'blocked', label: 'Blocked' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'coverage', label: 'Coverage' },
  { key: 'gates', label: 'Dev gates' },
]

function authorizeBlocked(t: TraceObject): string | null {
  if (t.status === 'blocked') return 'Object class blocked until contract tests and BAA gates clear.'
  if (t.status === 'in-review') return 'Disposition still in review — cannot authorize development.'
  if (t.coverage < 70) return 'Coverage below 70% sample threshold for authorize.'
  if (t.status === 'baseline' && t.objectType === 'Requirements') {
    return 'Requirements baseline is present; overall build authorization remains blocked at programme level.'
  }
  return 'Development is not authorized in this prototype programme state.'
}

export default function TraceabilityScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(TRACE_OBJECTS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TRACE_OBJECTS.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (!q) return true
      const hay = [
        t.id,
        t.objectType,
        t.count,
        t.owner,
        t.gaps,
        t.purpose,
        ...t.reqIds,
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
    if (!selectedId || !filtered.some(t => t.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = TRACE_OBJECTS.find(t => t.id === selectedId) ?? null
  const blocked = TRACE_OBJECTS.filter(t => t.status === 'blocked').length
  const inReview = TRACE_OBJECTS.filter(t => t.status === 'in-review' || t.status === 'gate-open').length
  const avgCoverage = Math.round(
    TRACE_OBJECTS.reduce((n, t) => n + t.coverage, 0) / Math.max(1, TRACE_OBJECTS.length),
  )
  const authorizeBlock = selected ? authorizeBlocked(selected) : null

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain TRC · semantic traceability</div>
          <h1 className="screen-title">Semantic traceability</h1>
          <div className="screen-sub">
            Canonical IDs, workflow disposition, and development authorization gates — synthetic register.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/ai-governance')}>
            AI governance
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · authority register is not mutated"
          >
            <BookOpenCheck size={15} strokeWidth={2} aria-hidden />
            Open authority register
          </button>
        </div>
      </div>

      <div className="trc-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · development is not build-authorized. Trace links do not grant
          production rights, seal packages, or unlock clinical writes.
        </span>
      </div>

      <RelatedNav route="/traceability" />

      <div className="trc-stats">
        <StatCard
          icon={<Waypoints size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Object classes"
          value={TRACE_OBJECTS.length}
          sub="Namespaces in sample register"
          accent="teal"
        />
        <StatCard
          icon={<GitMerge size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Avg coverage"
          value={`${avgCoverage}%`}
          sub="Prototype completeness meter"
          accent="teal"
        />
        <StatCard
          icon={<BookOpenCheck size={16} strokeWidth={1.75} aria-hidden />}
          kicker="In review / open"
          value={inReview}
          sub="Disposition still moving"
          accent={inReview === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<Link2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Dev authorization"
          value="Blocked"
          sub={`${blocked} object class(es) hard-blocked`}
          accent="bad"
        />
      </div>

      <div className="trc-workspace">
        <section className="card" aria-label="Traceability object register">
          <div className="trc-card-head">
            <div>
              <div className="card-kicker">Register</div>
              <h2 className="card-title trc-card-title">Trace objects</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="trc-toolbar">
            <label className="trc-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search trace objects</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search object type, owner, gap, or requirement"
              />
            </label>
            <div>
              <span className="trc-filter-label" id="trc-status-filters">Status</span>
              <div className="trc-filters" role="toolbar" aria-labelledby="trc-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'trc-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<Waypoints size={26} strokeWidth={1.5} />}
              title="No objects match"
              sub="Clear filters. Register is synthetic."
            />
          ) : (
            <div className="trc-list" role="listbox" aria-label="Trace object list">
              {filtered.map(t => {
                const meta = STATUS_META[t.status]
                const isSelected = t.id === selectedId
                const iconClass =
                  t.status === 'blocked' ? ' is-bad' : t.status === 'gate-open' ? ' is-warn' : ''
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'trc-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(t.id)}
                  >
                    <span className={'trc-row-icon' + iconClass} aria-hidden>
                      <Waypoints size={16} strokeWidth={1.75} />
                    </span>
                    <span className="trc-row-main">
                      <span className="trc-row-top">
                        <span className="trc-id">{t.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="trc-title">{t.objectType}</span>
                      <span className="trc-meta">
                        {t.count} · {t.owner}
                      </span>
                      <span className="trc-meta">
                        Versioned {t.versioned} · gaps {t.gaps}
                      </span>
                    </span>
                    <span className="trc-meter">
                      <span className="trc-meter-label">{t.coverage}%</span>
                      <ProgressBar
                        pct={t.coverage}
                        color={
                          t.status === 'blocked'
                            ? 'var(--status-bad)'
                            : t.coverage >= 80
                              ? 'var(--status-good)'
                              : 'var(--teal-400)'
                        }
                        label={`${t.id} coverage ${t.coverage} percent`}
                      />
                    </span>
                    <ArrowRight className="trc-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="trc-inspector" aria-label="Trace object inspector">
          {selected ? (
            <div className="card trc-inspector-card">
              <div className="trc-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title trc-card-title">{selected.id}</h2>
                  <p className="trc-inspector-title">{selected.objectType}</p>
                </div>
                <div className="trc-chips">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip tone="neutral">{selected.coverage}% coverage</StatusChip>
                </div>
              </div>

              <div className="trc-tabs" role="tablist" aria-label="Trace detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'trc-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="trc-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="trc-panel">
                    <p className="trc-copy">{selected.purpose}</p>
                    {selected.status === 'blocked' ? (
                      <div className="trc-callout is-bad" role="status">
                        <Link2 size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Development blocked for class</strong>
                          <span>{selected.gaps}</span>
                        </div>
                      </div>
                    ) : null}
                    <div className="trc-grid">
                      <div>
                        <span className="card-kicker">Count</span>
                        <strong>{selected.count}</strong>
                        <span>Owner · {selected.owner}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Versioned</span>
                        <strong>{selected.versioned}</strong>
                        <span>Gaps · {selected.gaps}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Coverage</span>
                        <strong>{selected.coverage}%</strong>
                        <span>Prototype meter</span>
                      </div>
                      <div>
                        <span className="card-kicker">Status</span>
                        <strong>{STATUS_META[selected.status].label}</strong>
                        <span>Not build authorization</span>
                      </div>
                    </div>
                    <div className="trc-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="trc-related-actions">
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
                    <div className="trc-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="trc-req-link"
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

                {detailTab === 'coverage' ? (
                  <div className="trc-panel">
                    <p className="trc-copy">
                      Coverage meters are layout samples. Unresolved collisions claim is a prototype claim only.
                    </p>
                    <ProgressBar
                      pct={selected.coverage}
                      color="var(--teal-400)"
                      label={`${selected.id} coverage`}
                    />
                    <ul className="trc-bullet-list">
                      <li>
                        <strong>Object count</strong>
                        <br />
                        {selected.count}
                      </li>
                      <li>
                        <strong>Known gaps</strong>
                        <br />
                        {selected.gaps}
                      </li>
                      <li>
                        <strong>Unresolved collisions</strong>
                        <br />
                        0* · prototype claim, not audited production proof.
                      </li>
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'gates' ? (
                  <div className="trc-panel">
                    <p className="trc-copy">
                      Development authorization is programme-level blocked. This control does not unlock builds.
                    </p>
                    <div className="trc-grid">
                      <div>
                        <span className="card-kicker">Dev authorization</span>
                        <strong>Blocked</strong>
                        <span>Not build authorized</span>
                      </div>
                      <div>
                        <span className="card-kicker">Class status</span>
                        <strong>{STATUS_META[selected.status].label}</strong>
                        <span>{selected.objectType}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/requirements')}
                    >
                      Open requirements register
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/legal-evidence')}
                    >
                      Open legal evidence
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="trc-inspector-foot">
                <div className="trc-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no gap report is generated"
                  >
                    Gap report
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled
                    title={authorizeBlock ?? 'Visual only · development remains unauthorized'}
                  >
                    Authorize development
                  </button>
                </div>
                <p className="trc-footnote">
                  {authorizeBlock
                    ? `Authorize disabled · ${authorizeBlock}`
                    : 'Authorize controls are visual only. No development grant is recorded.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card trc-inspector-empty">
              <EmptyState
                icon={<Waypoints size={26} strokeWidth={1.5} />}
                title="Select a trace object"
                sub="Inspect coverage, gaps, and development gates."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
