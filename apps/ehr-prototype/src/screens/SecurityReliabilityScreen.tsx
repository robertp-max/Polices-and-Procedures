import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './sec.css'

/** Synthetic first-pass pageview for Security & reliability (SEC). Design prototype only. */
const ROWS = [["Backup restore drill","≤4h RTO","Jun tabletop","Platform","None","Met"],["Access review","Quarterly","Due soon","Security","5 users","At risk"],["WCAG 2.2 AA","AA","In progress","Product","Focus ring fixed","Improving"]] as const

export default function SecurityReliabilityScreen() {
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
          <div className="card-kicker">Domain SEC · first-pass prototype</div>
          <h1 className="screen-title">Security & reliability</h1>
          <div className="screen-sub">Targets, observability, and incident posture — not a production SOC console.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Security & reliability'); setDrawerOpen(true) }}>
            Open incident drill
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="sec-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="sec-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Core availability target"
          value="99.9%"
          sub="Proposed baseline"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Open vulns (high)"
          value="0"
          sub="Prototype scan"
          accent="good"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="RPO target"
          value="≤15m"
          sub="Proposed"
          accent="teal"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Incidents (30d)"
          value="0"
          sub="Synthetic env"
          accent="good"
        />
      </div>

      <section className="card" aria-label="Security & reliability list">
        <div className="sec-toolbar">
          <label className="sec-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Security & reliability</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">SLO dashboard</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="sec-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Control</th><th>Target</th><th>Last proof</th><th>Owner</th><th>Gap</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Backup restore drill</td><td>≤4h RTO</td><td>Jun tabletop</td><td>Platform</td><td>None</td><td><StatusChip tone="good">Met</StatusChip></td></tr>
                  <tr key={1}><td>Access review</td><td>Quarterly</td><td>Due soon</td><td>Security</td><td>5 users</td><td><StatusChip tone="warn">At risk</StatusChip></td></tr>
                  <tr key={2}><td>WCAG 2.2 AA</td><td>AA</td><td>In progress</td><td>Product</td><td>Focus ring fixed</td><td><StatusChip tone="progress">Improving</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Security & reliability'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="sec-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Security & reliability</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="sec-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
