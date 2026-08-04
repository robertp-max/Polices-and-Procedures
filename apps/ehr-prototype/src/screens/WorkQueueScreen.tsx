import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './wq.css'

/** Synthetic first-pass pageview for My work queue (COR). Design prototype only. */
const ROWS = [["SOC OASIS review","Elena Martinez","Taylor Brooks, RN","Today 4:00 PM","High","In progress"],["Order countersignature","Walter Feld","Dr. Susan Cho","Today 5:30 PM","High","Waiting"],["Authorization unit check","Priya Desai","Billing desk","Tomorrow","Medium","Open"],["Aide supervision clock","James Okonkwo","Clinical manager","Wed","Medium","Open"],["Missed-visit follow-up","Rosa Alvarez","Taylor Brooks, RN","Overdue","Critical","Escalated"]] as const

export default function WorkQueueScreen() {
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
          <div className="card-kicker">Domain COR · first-pass prototype</div>
          <h1 className="screen-title">My work queue</h1>
          <div className="screen-sub">Closed-loop tasks, SLAs, and ownership — synthetic queue for design evaluation.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'My work queue'); setDrawerOpen(true) }}>
            Claim next item
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="wq-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="wq-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Open"
          value="18"
          sub="Across all owners"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due today"
          value="6"
          sub="Needs action before EOD"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Overdue"
          value="2"
          sub="Escalation candidates"
          accent="bad"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Completed today"
          value="9"
          sub="With completion evidence"
          accent="good"
        />
      </div>

      <section className="card" aria-label="My work queue list">
        <div className="wq-toolbar">
          <label className="wq-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search My work queue</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Filter queue</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="wq-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Work item</th><th>Patient</th><th>Owner</th><th>Due</th><th>Priority</th><th>State</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>SOC OASIS review</td><td>Elena Martinez</td><td>Taylor Brooks, RN</td><td>Today 4:00 PM</td><td>High</td><td><StatusChip tone="progress">In progress</StatusChip></td></tr>
                  <tr key={1}><td>Order countersignature</td><td>Walter Feld</td><td>Dr. Susan Cho</td><td>Today 5:30 PM</td><td>High</td><td><StatusChip tone="progress">Waiting</StatusChip></td></tr>
                  <tr key={2}><td>Authorization unit check</td><td>Priya Desai</td><td>Billing desk</td><td>Tomorrow</td><td>Medium</td><td><StatusChip tone="neutral">Open</StatusChip></td></tr>
                  <tr key={3}><td>Aide supervision clock</td><td>James Okonkwo</td><td>Clinical manager</td><td>Wed</td><td>Medium</td><td><StatusChip tone="neutral">Open</StatusChip></td></tr>
                  <tr key={4}><td>Missed-visit follow-up</td><td>Rosa Alvarez</td><td>Taylor Brooks, RN</td><td>Overdue</td><td>Critical</td><td><StatusChip tone="bad">Escalated</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'My work queue'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="wq-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> My work queue</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="wq-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
