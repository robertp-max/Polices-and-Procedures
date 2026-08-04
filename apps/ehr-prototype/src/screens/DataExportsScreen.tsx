import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './dex.css'

/** Synthetic first-pass pageview for Data & exports (DAT). Design prototype only. */
const ROWS = [["Visit productivity","Ops dashboard","06:10 today","FHIR → warehouse","De-identified","Current"],["Claim readiness","Revenue desk","Stale 18h","Domain services","Limited PHI","Stale"],["Quality measures","QAPI","Yesterday","OASIS + claims","Aggregate","Current"]] as const

export default function DataExportsScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ROWS
    return ROWS.filter(row => row.some(cell => cell.toLowerCase().includes(q)))
  }, [query])

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain DAT · first-pass prototype</div>
          <h1 className="screen-title">Data, analytics & exports</h1>
          <div className="screen-sub">Derived views with lineage — not transactional clinical authority.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Data, analytics & exports'); setDrawerOpen(true) }}>
            Request export
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="dex-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="dex-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Scheduled extracts"
          value="9"
          sub="Nightly + weekly"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Stale views"
          value="1"
          sub="Labeled in UI"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Export jobs today"
          value="4"
          sub="Completed with counts"
          accent="good"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Failed jobs"
          value="0"
          sub="Last 24h"
          accent="good"
        />
      </div>

      <section className="card" aria-label="Data, analytics & exports list">
        <div className="dex-toolbar">
          <label className="dex-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Data, analytics & exports</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Lineage report</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="dex-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Dataset</th><th>Consumer</th><th>Last refresh</th><th>Lineage</th><th>PHI boundary</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Visit productivity</td><td>Ops dashboard</td><td>06:10 today</td><td>FHIR → warehouse</td><td>De-identified</td><td><StatusChip tone="good">Current</StatusChip></td></tr>
                  <tr key={1}><td>Claim readiness</td><td>Revenue desk</td><td>Stale 18h</td><td>Domain services</td><td>Limited PHI</td><td><StatusChip tone="warn">Stale</StatusChip></td></tr>
                  <tr key={2}><td>Quality measures</td><td>QAPI</td><td>Yesterday</td><td>OASIS + claims</td><td>Aggregate</td><td><StatusChip tone="good">Current</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Data, analytics & exports'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="dex-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Data & exports</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="dex-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
