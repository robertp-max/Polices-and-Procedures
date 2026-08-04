import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FlaskConical, Handshake, Search, ShieldAlert } from 'lucide-react'
import { VENDOR_BAAS } from '../data/workspace'
import type { VendorBaa } from '../data/workspace'
import { RelatedNav } from '../components/RelatedNav'
import { EmptyState, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './vnd.css'

type StatusFilter = 'all' | VendorBaa['baaStatus']

const STATUS_META: Record<VendorBaa['baaStatus'], { tone: StatusTone; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  expiring: { tone: 'warn', label: 'Expiring' },
  expired: { tone: 'bad', label: 'Expired' },
  missing: { tone: 'bad', label: 'Missing BAA' },
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring', label: 'Expiring' },
  { key: 'missing', label: 'Missing' },
  { key: 'expired', label: 'Expired' },
]

export default function VendorsBaaScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState(VENDOR_BAAS[0]?.id ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return VENDOR_BAAS.filter(v => {
      if (filter !== 'all' && v.baaStatus !== filter) return false
      if (!q) return true
      return [v.vendor, v.service, v.phiScope, v.owner].join(' ').toLowerCase().includes(q)
    })
  }, [query, filter])

  const selected = VENDOR_BAAS.find(v => v.id === selectedId) ?? null
  const blocked = VENDOR_BAAS.filter(v => v.baaStatus === 'missing' || v.baaStatus === 'expired').length
  const expiring = VENDOR_BAAS.filter(v => v.baaStatus === 'expiring').length

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain TPR · vendors & BAAs</div>
          <h1 className="screen-title">Vendors & BAAs</h1>
          <div className="screen-sub">
            PHI access gated on BAA lifecycle — in-app control plane, not Master Controls rail.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/interoperability')}>
            Interoperability
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/security')}>
            Security
          </button>
          <button type="button" className="btn btn-primary" title="Visual only · no vendor record is created">
            <Handshake size={15} strokeWidth={2} aria-hidden />
            Register vendor
          </button>
        </div>
      </div>

      <div className="vnd-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · BAA status does not gate real PHI. Production requires
          executed agreements before credentials or interfaces go live.
        </span>
      </div>

      <RelatedNav route="/vendors" />

      <div className="vnd-stats">
        <StatCard icon={<Handshake size={16} strokeWidth={1.75} aria-hidden />} kicker="Vendors" value={VENDOR_BAAS.length} sub="Sample register" accent="teal" />
        <StatCard icon={<ShieldAlert size={16} strokeWidth={1.75} aria-hidden />} kicker="PHI blocked" value={blocked} sub="Missing or expired BAA" accent="bad" />
        <StatCard icon={<Handshake size={16} strokeWidth={1.75} aria-hidden />} kicker="Expiring" value={expiring} sub="Renewal window open" accent="warn" />
        <StatCard icon={<Handshake size={16} strokeWidth={1.75} aria-hidden />} kicker="Active" value={VENDOR_BAAS.filter(v => v.baaStatus === 'active').length} sub="Eligible for PHI" accent="good" />
      </div>

      <div className="vnd-workspace">
        <section className="card" aria-label="Vendor BAA register">
          <div className="vnd-toolbar">
            <label className="vnd-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search vendors</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search vendor, service, or PHI scope" />
            </label>
            <div className="vnd-filters" role="toolbar" aria-label="Filter by BAA status">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  className={'vnd-filter' + (filter === f.key ? ' is-active' : '')}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Handshake size={26} strokeWidth={1.5} />} title="No vendors match" sub="Clear filters. Register is synthetic." />
          ) : (
            <div className="vnd-list">
              {filtered.map(v => {
                const meta = STATUS_META[v.baaStatus]
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={'vnd-row' + (v.id === selectedId ? ' is-selected' : '')}
                    onClick={() => setSelectedId(v.id)}
                  >
                    <span className="vnd-row-main">
                      <span className="vnd-row-top">
                        <span className="vnd-id">{v.id}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </span>
                      <span className="vnd-title">{v.vendor}</span>
                      <span className="vnd-meta">{v.service} · {v.phiScope}</span>
                      <span className="vnd-meta">Owner {v.owner} · renewal {v.renewal}</span>
                    </span>
                    <ArrowRight size={14} className="vnd-go" strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="card vnd-inspector" aria-label="Vendor inspector">
          {selected ? (
            <div className="vnd-detail">
              <div className="card-kicker">Vendor</div>
              <h2 className="card-title vnd-detail-title">{selected.vendor}</h2>
              <StatusChip tone={STATUS_META[selected.baaStatus].tone}>
                {STATUS_META[selected.baaStatus].label}
              </StatusChip>
              {(selected.baaStatus === 'missing' || selected.baaStatus === 'expired') ? (
                <div className="vnd-callout" role="status">
                  <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                  <div>
                    <strong>PHI access blocked</strong>
                    <span>Production design gates credentials and interfaces until BAA is active.</span>
                  </div>
                </div>
              ) : null}
              <div className="vnd-grid">
                <div>
                  <span className="card-kicker">Service</span>
                  <strong>{selected.service}</strong>
                </div>
                <div>
                  <span className="card-kicker">PHI scope</span>
                  <strong>{selected.phiScope}</strong>
                </div>
                <div>
                  <span className="card-kicker">Owner</span>
                  <strong>{selected.owner}</strong>
                </div>
                <div>
                  <span className="card-kicker">Renewal</span>
                  <strong>{selected.renewal}</strong>
                </div>
              </div>
              <div className="vnd-related">
                <span className="card-kicker">Continue in</span>
                <div className="vnd-related-actions">
                  {selected.related.map(r => (
                    <button key={r.to + r.label} type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(r.to)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="vnd-footnote">Register / renew actions are visual only. No contract record is written.</p>
            </div>
          ) : (
            <EmptyState icon={<Handshake size={26} strokeWidth={1.5} />} title="Select a vendor" sub="Inspect BAA status and related interfaces." />
          )}
        </aside>
      </div>
    </div>
  )
}
