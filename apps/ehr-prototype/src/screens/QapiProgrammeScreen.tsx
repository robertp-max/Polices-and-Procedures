import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './qapi.css'

/** Synthetic first-pass pageview for QAPI programme (QAP). Design prototype only. */
const ROWS = [["Hospitalization · HF cohort","QAPI lead","22.4%","After-hours pathway","Sep 15","Active"],["Fall events · SOC week","DON","6 events","Home safety kit","Aug 30","Effectiveness due"],["Missed-visit communication","Ops director","4.1%","Call-tree drill","Closed","Sustained"]] as const

export default function QapiProgrammeScreen() {
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
          <div className="card-kicker">Domain QAP · first-pass prototype</div>
          <h1 className="screen-title">QAPI programme</h1>
          <div className="screen-sub">PIPs, RCA, CAP, and effectiveness — no closure on task completion alone.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'QAPI programme'); setDrawerOpen(true) }}>
            Open active PIP
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="qapi-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="qapi-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active PIPs"
          value="2"
          sub="Agency control"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="CAPs open"
          value="5"
          sub="With owners"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due effectiveness"
          value="1"
          sub="Return evidence needed"
          accent="orange"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Closed w/ proof"
          value="4"
          sub="Last 2 quarters"
          accent="good"
        />
      </div>

      <section className="card" aria-label="QAPI programme list">
        <div className="qapi-toolbar">
          <label className="qapi-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search QAPI programme</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Effectiveness board</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="qapi-table-wrap">
            <table className="table">
              <thead>
                <tr><th>PIP / CAP</th><th>Owner</th><th>Baseline</th><th>Countermeasure</th><th>Return</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Hospitalization · HF cohort</td><td>QAPI lead</td><td>22.4%</td><td>After-hours pathway</td><td>Sep 15</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
                  <tr key={1}><td>Fall events · SOC week</td><td>DON</td><td>6 events</td><td>Home safety kit</td><td>Aug 30</td><td><StatusChip tone="warn">Effectiveness due</StatusChip></td></tr>
                  <tr key={2}><td>Missed-visit communication</td><td>Ops director</td><td>4.1%</td><td>Call-tree drill</td><td>Closed</td><td><StatusChip tone="good">Sustained</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'QAPI programme'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="qapi-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> QAPI programme</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="qapi-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
