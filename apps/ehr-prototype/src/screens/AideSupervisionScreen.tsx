import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './hha.css'

/** Synthetic first-pass pageview for Aide supervision (HHA). Design prototype only. */
const ROWS = [["James Okonkwo","Priya Natarajan","Skilled 14-day","Fri","Jul 28","On track"],["Rosa Alvarez","Sam Ortiz","Non-skilled 60-day","Overdue","Jun 12","Escalated"],["Elena Martinez","Priya Natarajan","Skilled 14-day","Aug 12","Aug 1","On track"]] as const

export default function AideSupervisionScreen() {
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
          <div className="card-kicker">Domain HHA · first-pass prototype</div>
          <h1 className="screen-title">Aide supervision</h1>
          <div className="screen-sub">Plan-authorized services, supervision clocks, and observation requirements.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Aide supervision'); setDrawerOpen(true) }}>
            Schedule supervision
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="hha-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="hha-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active aide patients"
          value="16"
          sub="With HHA services"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due ≤7 days"
          value="4"
          sub="Skilled + non-skilled clocks"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Overdue"
          value="1"
          sub="Escalation open"
          accent="bad"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Observations done"
          value="9"
          sub="This period"
          accent="good"
        />
      </div>

      <section className="card" aria-label="Aide supervision list">
        <div className="hha-toolbar">
          <label className="hha-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Aide supervision</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Clock rules</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="hha-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Aide</th><th>Clock type</th><th>Next due</th><th>Last observation</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>James Okonkwo</td><td>Priya Natarajan</td><td>Skilled 14-day</td><td>Fri</td><td>Jul 28</td><td><StatusChip tone="good">On track</StatusChip></td></tr>
                  <tr key={1}><td>Rosa Alvarez</td><td>Sam Ortiz</td><td>Non-skilled 60-day</td><td>Overdue</td><td>Jun 12</td><td><StatusChip tone="bad">Escalated</StatusChip></td></tr>
                  <tr key={2}><td>Elena Martinez</td><td>Priya Natarajan</td><td>Skilled 14-day</td><td>Aug 12</td><td>Aug 1</td><td><StatusChip tone="good">On track</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Aide supervision'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="hha-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Aide supervision</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="hha-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
