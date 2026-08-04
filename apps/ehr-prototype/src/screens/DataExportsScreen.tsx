import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Database,
  Download,
  FileStack,
  FlaskConical,
  GitBranch,
  Link2,
  Search,
  Timer,
} from 'lucide-react'
import { DATA_EXPORTS } from '../data/workspace'
import type { DataExportPhi, DataExportRecord, DataExportStatus } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './dex.css'

type StatusFilter = 'all' | DataExportStatus
type PhiFilter = 'all' | DataExportPhi
type DetailTab = 'overview' | 'lineage' | 'jobs'

const STATUS_META: Record<DataExportStatus, { tone: StatusTone; label: string }> = {
  current: { tone: 'good', label: 'Current' },
  stale: { tone: 'warn', label: 'Stale' },
  failed: { tone: 'bad', label: 'Failed' },
  running: { tone: 'progress', label: 'Running' },
}

const PHI_META: Record<DataExportPhi, string> = {
  'de-identified': 'De-identified',
  'limited-phi': 'Limited PHI',
  aggregate: 'Aggregate',
  'full-phi-gated': 'Full PHI · gated',
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'current', label: 'Current' },
  { key: 'stale', label: 'Stale' },
  { key: 'failed', label: 'Failed' },
  { key: 'running', label: 'Running' },
]

const PHI_FILTERS: { key: PhiFilter; label: string }[] = [
  { key: 'all', label: 'All PHI boundaries' },
  { key: 'de-identified', label: 'De-identified' },
  { key: 'limited-phi', label: 'Limited PHI' },
  { key: 'aggregate', label: 'Aggregate' },
  { key: 'full-phi-gated', label: 'Full PHI gated' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'lineage', label: 'Lineage' },
  { key: 'jobs', label: 'Export jobs' },
]

function exportBlocked(row: DataExportRecord): string | null {
  if (row.status === 'failed') return 'Failed refresh blocks new export until lineage is repaired.'
  if (row.status === 'stale') return 'Stale views require refresh acknowledgment before production export.'
  if (row.phiBoundary === 'full-phi-gated') return 'Full PHI export requires dual-control and legal evidence path.'
  return null
}

export default function DataExportsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [phiFilter, setPhiFilter] = useState<PhiFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(DATA_EXPORTS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DATA_EXPORTS.filter(row => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (phiFilter !== 'all' && row.phiBoundary !== phiFilter) return false
      if (!q) return true
      const hay = [
        row.id,
        row.dataset,
        row.consumer,
        row.lineage,
        row.owner,
        row.purpose,
        ...row.reqIds,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, phiFilter])

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

  const selected = DATA_EXPORTS.find(r => r.id === selectedId) ?? null
  const staleCount = DATA_EXPORTS.filter(r => r.status === 'stale').length
  const failedCount = DATA_EXPORTS.filter(r => r.status === 'failed').length
  const runningCount = DATA_EXPORTS.filter(r => r.status === 'running').length
  const currentCount = DATA_EXPORTS.filter(r => r.status === 'current').length
  const block = selected ? exportBlocked(selected) : null

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain DAT · data & exports</div>
          <h1 className="screen-title">Data, analytics & exports</h1>
          <div className="screen-sub">
            Derived views with lineage and PHI boundaries — not transactional clinical authority.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/reports')}>
            Reports
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/legal-evidence')}>
            Evidence export
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no export job is queued"
          >
            <Download size={15} strokeWidth={2} aria-hidden />
            Request export
          </button>
        </div>
      </div>

      <div className="dex-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no warehouse write, disclosure, or PHI export is performed.
          Production requires authorized DAT requirements, lineage proof, and dual-control for full PHI.
        </span>
      </div>

      <RelatedNav route="/data-exports" />

      <div className="dex-stats">
        <StatCard
          icon={<Database size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Datasets in register"
          value={DATA_EXPORTS.length}
          sub="Synthetic sample set for layout evaluation"
          accent="teal"
        />
        <StatCard
          icon={<Timer size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Stale views"
          value={staleCount}
          sub="Labeled · refresh before export"
          accent={staleCount === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<AlertTriangle size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Failed jobs"
          value={failedCount}
          sub={`${runningCount} running · ${currentCount} current`}
          accent={failedCount === 0 ? 'good' : 'bad'}
        />
        <StatCard
          icon={<FileStack size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Full PHI gated"
          value={DATA_EXPORTS.filter(r => r.phiBoundary === 'full-phi-gated').length}
          sub="Route through legal evidence path"
          accent="orange"
        />
      </div>

      <div className="dex-workspace">
        <section className="card" aria-label="Dataset registry">
          <div className="dex-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title dex-card-title">Datasets & extracts</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="dex-toolbar">
            <label className="dex-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search datasets</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search dataset, consumer, lineage, or requirement"
              />
            </label>
            <div>
              <span className="dex-filter-label" id="dex-status-filters">Status</span>
              <div className="dex-filters" role="toolbar" aria-labelledby="dex-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'dex-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="dex-filter-label" id="dex-phi-filters">PHI boundary</span>
              <div className="dex-filters" role="toolbar" aria-labelledby="dex-phi-filters">
                {PHI_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'dex-filter' + (phiFilter === f.key ? ' is-active' : '')}
                    aria-pressed={phiFilter === f.key}
                    onClick={() => setPhiFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Database size={26} strokeWidth={1.5} />}
              title="No datasets match"
              sub="Clear filters or search. All rows on this page are synthetic."
            />
          ) : (
            <div className="dex-list" role="listbox" aria-label="Dataset list">
              {filtered.map(row => {
                const meta = STATUS_META[row.status]
                const isSelected = row.id === selectedId
                const iconClass =
                  row.status === 'failed' ? ' is-failed' : row.status === 'stale' ? ' is-stale' : ''
                return (
                  <button
                    key={row.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'dex-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(row.id)}
                  >
                    <span className={'dex-row-icon' + iconClass} aria-hidden>
                      {row.status === 'failed' ? (
                        <AlertTriangle size={16} strokeWidth={1.75} />
                      ) : (
                        <Database size={16} strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="dex-row-main">
                      <span className="dex-row-top">
                        <span className="dex-id">{row.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{PHI_META[row.phiBoundary]}</span>
                      </span>
                      <span className="dex-title">{row.dataset}</span>
                      <span className="dex-meta">
                        {row.consumer} · {row.lastRefresh}
                      </span>
                      <span className="dex-meta">{row.lineage}</span>
                    </span>
                    <ArrowRight className="dex-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="dex-inspector" aria-label="Dataset inspector">
          {selected ? (
            <div className="card dex-inspector-card">
              <div className="dex-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title dex-card-title">{selected.id}</h2>
                  <p className="dex-inspector-title">{selected.dataset}</p>
                </div>
                <div className="dex-chips">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip tone={selected.phiBoundary === 'full-phi-gated' ? 'warn' : 'neutral'}>
                    {PHI_META[selected.phiBoundary]}
                  </StatusChip>
                </div>
              </div>

              <div className="dex-tabs" role="tablist" aria-label="Dataset detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'dex-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="dex-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="dex-panel">
                    <p className="dex-copy">{selected.purpose}</p>
                    {selected.status === 'stale' ? (
                      <div className="dex-callout" role="status">
                        <Timer size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Stale view</strong>
                          <span>
                            Last refresh {selected.lastRefresh}. Production design requires
                            acknowledgment before using this extract for decisions.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    {selected.status === 'failed' ? (
                      <div className="dex-callout is-bad" role="status">
                        <AlertTriangle size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Export job failed</strong>
                          <span>
                            Failure is labeled — no silent infinite retry. Owner {selected.owner}{' '}
                            must clear the lineage fault.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <div className="dex-grid">
                      <div>
                        <span className="card-kicker">Consumer</span>
                        <strong>{selected.consumer}</strong>
                        <span>{selected.owner}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Schedule</span>
                        <strong>{selected.schedule}</strong>
                        <span>{selected.lastRefresh}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Row count</span>
                        <strong>{selected.rowCount}</strong>
                        <span>Prototype labels only</span>
                      </div>
                      <div>
                        <span className="card-kicker">PHI boundary</span>
                        <strong>{PHI_META[selected.phiBoundary]}</strong>
                        <span>Not a live access control</span>
                      </div>
                    </div>
                    <div className="dex-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="dex-related-actions">
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
                    <div className="dex-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="dex-req-link"
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

                {detailTab === 'lineage' ? (
                  <div className="dex-panel">
                    <p className="dex-copy">
                      Lineage is declarative in this prototype. Production DAT requires machine-readable
                      provenance for every extract consumer.
                    </p>
                    <ul className="dex-lineage">
                      <li>
                        <GitBranch size={15} strokeWidth={2} aria-hidden />
                        <span>
                          <strong>Declared path</strong>
                          <br />
                          {selected.lineage}
                        </span>
                      </li>
                      <li>
                        <Database size={15} strokeWidth={2} aria-hidden />
                        <span>
                          <strong>Not transactional authority</strong>
                          <br />
                          Warehouse facts do not seal clinical notes or claims.
                        </span>
                      </li>
                      <li>
                        <FileStack size={15} strokeWidth={2} aria-hidden />
                        <span>
                          <strong>Evidence-grade export</strong>
                          <br />
                          Full PHI packets route through legal evidence dual-format export.
                        </span>
                      </li>
                    </ul>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/legal-evidence')}
                    >
                      Open legal evidence
                    </button>
                  </div>
                ) : null}

                {detailTab === 'jobs' ? (
                  <div className="dex-panel">
                    <p className="dex-copy">
                      Job history is a visual sample. Buttons below do not queue warehouse work.
                    </p>
                    <div className="dex-grid">
                      <div>
                        <span className="card-kicker">Last attempt</span>
                        <strong>{selected.lastRefresh}</strong>
                        <span>{STATUS_META[selected.status].label}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Cadence</span>
                        <strong>{selected.schedule}</strong>
                        <span>Owner · {selected.owner}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="dex-inspector-foot">
                <div className="dex-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no lineage report is generated"
                  >
                    Lineage report
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!block}
                    title={block ?? 'Visual only · no file is downloaded'}
                  >
                    <Download size={14} strokeWidth={2} aria-hidden />
                    Run export
                  </button>
                </div>
                <p className="dex-footnote">
                  {block
                    ? `Export disabled · ${block} No durable write occurs in this prototype.`
                    : 'Export / lineage controls are visual only. No dataset is materialized or disclosed.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card dex-inspector-empty">
              <EmptyState
                icon={<Database size={26} strokeWidth={1.5} />}
                title="Select a dataset"
                sub="Choose a row to inspect lineage, PHI boundary, and export readiness."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
