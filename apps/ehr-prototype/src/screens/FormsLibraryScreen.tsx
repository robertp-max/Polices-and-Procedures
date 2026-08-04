import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileStack, FlaskConical, Search } from 'lucide-react'
import { FORM_CATALOG } from '../data/workspace'
import type { FormCatalogItem } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './forms.css'

type StatusFilter = 'all' | FormCatalogItem['status']

const STATUS_META: Record<FormCatalogItem['status'], { tone: StatusTone; label: string }> = {
  current: { tone: 'good', label: 'Current' },
  draft: { tone: 'warn', label: 'Draft' },
  retired: { tone: 'neutral', label: 'Retired' },
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'current', label: 'Current' },
  { key: 'draft', label: 'Draft' },
  { key: 'retired', label: 'Retired' },
]

export default function FormsLibraryScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState(FORM_CATALOG[0]?.id ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FORM_CATALOG.filter(f => {
      if (filter !== 'all' && f.status !== filter) return false
      if (!q) return true
      return [f.title, f.semanticId, f.owner, f.use, f.version].join(' ').toLowerCase().includes(q)
    })
  }, [query, filter])

  const selected = FORM_CATALOG.find(f => f.id === selectedId) ?? null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain FRM · forms library</div>
          <h1 className="screen-title">Forms library</h1>
          <div className="screen-sub">
            Controlled form catalog with semantic IDs and version pins — in-app, not Policy Suite rail.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/documents')}>
            Documents
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            FRM register
          </button>
          <button type="button" className="btn btn-primary" title="Visual only · no form instance is created">
            <FileStack size={15} strokeWidth={2} aria-hidden />
            Start form instance
          </button>
        </div>
      </div>

      <div className="forms-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · catalog is illustrative of the 349-form programme, not the
          full reconciled index. No form instance is filed.
        </span>
      </div>

      <RelatedNav route="/forms" />

      <div className="forms-stats">
        <StatCard icon={<FileStack size={16} strokeWidth={1.75} aria-hidden />} kicker="Catalog sample" value={FORM_CATALOG.length} sub="Not 349/349 yet" accent="teal" />
        <StatCard icon={<FileStack size={16} strokeWidth={1.75} aria-hidden />} kicker="Current" value={FORM_CATALOG.filter(f => f.status === 'current').length} sub="Effective versions" accent="good" />
        <StatCard icon={<FileStack size={16} strokeWidth={1.75} aria-hidden />} kicker="Draft" value={FORM_CATALOG.filter(f => f.status === 'draft').length} sub="Not authorized for use" accent="warn" />
        <StatCard icon={<FileStack size={16} strokeWidth={1.75} aria-hidden />} kicker="Linked surfaces" value="Docs · notices · evidence" sub="Cross-nav ready" accent="orange" />
      </div>

      <div className="forms-workspace">
        <section className="card" aria-label="Forms catalog">
          <div className="forms-toolbar">
            <label className="forms-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search forms</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, semantic ID, or owner" />
            </label>
            <div className="forms-filters" role="toolbar" aria-label="Filter by status">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  className={'forms-filter' + (filter === f.key ? ' is-active' : '')}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<FileStack size={26} strokeWidth={1.5} />} title="No forms match" sub="Clear filters. Catalog is synthetic." />
          ) : (
            <div className="forms-list">
              {filtered.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={'forms-row' + (f.id === selectedId ? ' is-selected' : '')}
                  onClick={() => setSelectedId(f.id)}
                >
                  <span className="forms-row-main">
                    <span className="forms-row-top">
                      <span className="forms-sid">{f.semanticId}</span>
                      <StatusChip tone={STATUS_META[f.status].tone}>{STATUS_META[f.status].label}</StatusChip>
                      <span className="chip chip-neutral">{f.version}</span>
                    </span>
                    <span className="forms-title">{f.title}</span>
                    <span className="forms-meta">{f.owner} · {f.use}</span>
                  </span>
                  <ArrowRight size={14} className="forms-go" strokeWidth={2} aria-hidden />
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="card forms-inspector" aria-label="Form inspector">
          {selected ? (
            <div className="forms-detail">
              <div className="card-kicker">Form definition</div>
              <h2 className="card-title forms-detail-title">{selected.title}</h2>
              <StatusChip tone={STATUS_META[selected.status].tone}>{STATUS_META[selected.status].label}</StatusChip>
              <div className="forms-grid">
                <div>
                  <span className="card-kicker">Semantic ID</span>
                  <strong className="forms-mono">{selected.semanticId}</strong>
                </div>
                <div>
                  <span className="card-kicker">Version</span>
                  <strong>{selected.version}</strong>
                </div>
                <div>
                  <span className="card-kicker">Owner</span>
                  <strong>{selected.owner}</strong>
                </div>
                <div>
                  <span className="card-kicker">Use</span>
                  <strong>{selected.use}</strong>
                </div>
              </div>
              <div className="forms-related">
                <span className="card-kicker">Continue in</span>
                <div className="forms-related-actions">
                  {selected.related.map(r => (
                    <button key={r.to + r.label} type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(r.to)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="forms-footnote">
                Starting an instance is visual only. Production requires FRM reconciliation of all 349 sources.
              </p>
            </div>
          ) : (
            <EmptyState icon={<FileStack size={26} strokeWidth={1.5} />} title="Select a form" sub="Inspect version pins and related workflows." />
          )}
        </aside>
      </div>
    </div>
  )
}
