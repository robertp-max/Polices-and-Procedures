import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CalendarClock,
  FlaskConical,
  GitBranch,
  Link2,
  Search,
  Stamp,
} from 'lucide-react'
import { ORG_CONFIGS } from '../data/workspace'
import type { OrgConfigRecord, OrgConfigStatus } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './gov.css'

type StatusFilter = 'all' | OrgConfigStatus
type DetailTab = 'overview' | 'effective' | 'change'

const STATUS_META: Record<OrgConfigStatus, { tone: StatusTone; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  approved: { tone: 'good', label: 'Approved' },
  'in-review': { tone: 'progress', label: 'In review' },
  draft: { tone: 'warn', label: 'Draft' },
  scheduled: { tone: 'neutral', label: 'Scheduled' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'approved', label: 'Approved' },
  { key: 'in-review', label: 'In review' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'draft', label: 'Draft' },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'effective', label: 'Effective date' },
  { key: 'change', label: 'Change set' },
]

function approveBlocked(row: OrgConfigRecord): string | null {
  if (row.status === 'active' || row.status === 'approved') return 'Already approved/active in sample.'
  if (row.status === 'draft') return 'Draft must enter review before approval.'
  if (row.status === 'scheduled') return 'Scheduled sets activate on effective date only.'
  return null
}

export default function OrgMasterScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(ORG_CONFIGS[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ORG_CONFIGS.filter(row => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!q) return true
      const hay = [
        row.id,
        row.configSet,
        row.owner,
        row.change,
        row.version,
        row.summary,
        row.branch,
        ...row.reqIds,
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
    if (!selectedId || !filtered.some(r => r.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = ORG_CONFIGS.find(r => r.id === selectedId) ?? null
  const pending = ORG_CONFIGS.filter(r => r.status === 'in-review' || r.status === 'draft').length
  const scheduled = ORG_CONFIGS.filter(r => r.status === 'scheduled').length
  const active = ORG_CONFIGS.filter(r => r.status === 'active' || r.status === 'approved').length
  const approveBlock = selected ? approveBlocked(selected) : null

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain GOV · organization & master data</div>
          <h1 className="screen-title">Organization & master data</h1>
          <div className="screen-sub">
            Legal entity boundary, effective-dated configuration, and controlled change — synthetic register.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/users-access')}>
            Users & access
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/vendors')}>
            Vendors
          </button>
          <button
            type="button"
            className="btn btn-primary"
            title="Visual only · no config change is proposed"
          >
            <GitBranch size={15} strokeWidth={2} aria-hidden />
            Propose change
          </button>
        </div>
      </div>

      <div className="gov-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · no legal entity, payer, or service-area change is written.
          Production requires dual approval and effective dating before runtime config activates.
          This prototype does not demonstrate a maker/checker workflow — Approve is a single visual control only.
        </span>
      </div>

      <RelatedNav route="/org-master" />

      <div className="gov-stats">
        <StatCard
          icon={<Building2 size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Legal entity"
          value={1}
          sub="Care Indeed Home Health Care, Inc."
          accent="teal"
        />
        <StatCard
          icon={<GitBranch size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending changes"
          value={pending}
          sub="Draft or in review"
          accent={pending === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<CalendarClock size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Scheduled"
          value={scheduled}
          sub="Future effective dates"
          accent="teal"
        />
        <StatCard
          icon={<Stamp size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active / approved"
          value={active}
          sub={`${ORG_CONFIGS.length} config sets in sample`}
          accent="good"
        />
      </div>

      <div className="gov-workspace">
        <section className="card" aria-label="Configuration register">
          <div className="gov-card-head">
            <div>
              <div className="card-kicker">Register</div>
              <h2 className="card-title gov-card-title">Config sets</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="gov-toolbar">
            <label className="gov-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search config sets</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search config, owner, change, or requirement"
              />
            </label>
            <div>
              <span className="gov-filter-label" id="gov-status-filters">Status</span>
              <div className="gov-filters" role="toolbar" aria-labelledby="gov-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'gov-filter' + (statusFilter === f.key ? ' is-active' : '')}
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
              icon={<Building2 size={26} strokeWidth={1.5} />}
              title="No config sets match"
              sub="Clear filters. Register is synthetic."
            />
          ) : (
            <div className="gov-list" role="listbox" aria-label="Config set list">
              {filtered.map(row => {
                const meta = STATUS_META[row.status]
                const isSelected = row.id === selectedId
                return (
                  <button
                    key={row.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'gov-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectRow(row.id)}
                  >
                    <span
                      className={
                        'gov-row-icon' +
                        (row.status === 'draft' || row.status === 'in-review' ? ' is-warn' : '')
                      }
                      aria-hidden
                    >
                      <Building2 size={16} strokeWidth={1.75} />
                    </span>
                    <span className="gov-row-main">
                      <span className="gov-row-top">
                        <span className="gov-id">{row.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        <span className="chip chip-neutral">{row.version}</span>
                      </span>
                      <span className="gov-title">{row.configSet}</span>
                      <span className="gov-meta">
                        {row.change} · {row.owner}
                      </span>
                      <span className="gov-meta">Effective {row.effective}</span>
                    </span>
                    <ArrowRight className="gov-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="gov-inspector" aria-label="Config inspector">
          {selected ? (
            <div className="card gov-inspector-card">
              <div className="gov-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title gov-card-title">{selected.id}</h2>
                  <p className="gov-inspector-title">{selected.configSet}</p>
                </div>
                <div className="gov-chips">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  <StatusChip tone="neutral">{selected.version}</StatusChip>
                </div>
              </div>

              <div className="gov-tabs" role="tablist" aria-label="Config detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'gov-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="gov-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="gov-panel">
                    <p className="gov-copy">{selected.summary}</p>
                    {selected.status === 'in-review' ? (
                      <div className="gov-callout" role="status">
                        <Stamp size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Awaiting dual approval</strong>
                          <span>
                            Production design: finance / clinical dual path before runtime switch.
                            This prototype does not demonstrate a maker/checker workflow — the single
                            Approve button below is visual only and does not record a second approver.
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <div className="gov-grid">
                      <div>
                        <span className="card-kicker">Legal entity</span>
                        <strong>{selected.legalEntity}</strong>
                        <span>Single-entity boundary sample</span>
                      </div>
                      <div>
                        <span className="card-kicker">Branch</span>
                        <strong>{selected.branch}</strong>
                        <span>Owner · {selected.owner}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Version</span>
                        <strong>{selected.version}</strong>
                        <span>{selected.change}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Effective</span>
                        <strong>{selected.effective}</strong>
                        <span>Prototype labels only</span>
                      </div>
                    </div>
                    <div className="gov-related">
                      <span className="card-kicker">Continue in</span>
                      <div className="gov-related-actions">
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
                    <div className="gov-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button
                              type="button"
                              className="gov-req-link"
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

                {detailTab === 'effective' ? (
                  <div className="gov-panel">
                    <p className="gov-copy">
                      Effective dating prevents backdated operational config. Scheduled sets remain
                      inactive until the wall-clock effective instant.
                    </p>
                    <div className="gov-grid">
                      <div>
                        <span className="card-kicker">Declared effective</span>
                        <strong>{selected.effective}</strong>
                        <span>{STATUS_META[selected.status].label}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Calendar</span>
                        <strong>Effective-date calendar</strong>
                        <span>Visual only in this prototype</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'change' ? (
                  <div className="gov-panel">
                    <p className="gov-copy">
                      Change sets are append-only proposals. Approval does not silently rewrite history.
                    </p>
                    <div className="gov-grid">
                      <div>
                        <span className="card-kicker">Change summary</span>
                        <strong>{selected.change}</strong>
                        <span>{selected.summary}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Owner</span>
                        <strong>{selected.owner}</strong>
                        <span>Version {selected.version}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="gov-inspector-foot">
                <div className="gov-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    title="Visual only · no calendar is opened"
                  >
                    <CalendarClock size={14} strokeWidth={2} aria-hidden />
                    Effective calendar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!approveBlock}
                    title={approveBlock ?? 'Visual only · single-button approve is not maker/checker · nothing is approved'}
                  >
                    <Stamp size={14} strokeWidth={2} aria-hidden />
                    Approve change
                  </button>
                </div>
                <p className="gov-footnote">
                  {approveBlock
                    ? `Approve disabled · ${approveBlock} No master-data write occurs. Prototype does not demonstrate a maker/checker workflow.`
                    : 'Propose / approve look like single-person actions. Prototype does not demonstrate a maker/checker workflow — no second approver is captured and no configuration is activated.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card gov-inspector-empty">
              <EmptyState
                icon={<Building2 size={26} strokeWidth={1.5} />}
                title="Select a config set"
                sub="Inspect effective dating, change summary, and related workspaces."
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
