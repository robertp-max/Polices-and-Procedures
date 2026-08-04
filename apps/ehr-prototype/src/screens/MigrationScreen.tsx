import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './mig.css'

/** Synthetic first-pass pageview for Migration & adoption (MIG). Design prototype only. */
const ROWS = [["WellSky export inventory","Migration lead","Partial sample","High","Contract analysis","Open"],["Identity mapping","IAM","Draft map","Medium","Pilot criteria","Draft"],["Rollback drill","Platform","Tabletop notes","Medium","Live drill","Scheduled"]] as const

export default function MigrationScreen() {
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
          <div className="card-kicker">Domain MIG · first-pass prototype</div>
          <h1 className="screen-title">Migration & adoption</h1>
          <div className="screen-sub">WellSky export readiness, pilot cohorts, and rehearsed rollback.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Migration & adoption'); setDrawerOpen(true) }}>
            Open export inventory
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="mig-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="mig-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Export domains"
          value="14"
          sub="Inventoried"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pilot patients"
          value="0"
          sub="Not authorized"
          accent="teal"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Rollback drills"
          value="1"
          sub="Tabletop only"
          accent="teal"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Blockers"
          value="2"
          sub="Contract + export fidelity"
          accent="warn"
        />
      </div>

      <section className="card" aria-label="Migration & adoption list">
        <div className="mig-toolbar">
          <label className="mig-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Migration & adoption</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Rollback drill</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="mig-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Workstream</th><th>Owner</th><th>Evidence</th><th>Risk</th><th>Next gate</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>WellSky export inventory</td><td>Migration lead</td><td>Partial sample</td><td>High</td><td>Contract analysis</td><td><StatusChip tone="neutral">Open</StatusChip></td></tr>
                  <tr key={1}><td>Identity mapping</td><td>IAM</td><td>Draft map</td><td>Medium</td><td>Pilot criteria</td><td><StatusChip tone="warn">Draft</StatusChip></td></tr>
                  <tr key={2}><td>Rollback drill</td><td>Platform</td><td>Tabletop notes</td><td>Medium</td><td>Live drill</td><td><StatusChip tone="progress">Scheduled</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Migration & adoption'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="mig-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Migration & adoption</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="mig-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
