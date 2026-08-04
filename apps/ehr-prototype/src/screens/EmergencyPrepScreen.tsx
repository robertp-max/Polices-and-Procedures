import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './emp.css'

/** Synthetic first-pass pageview for Emergency preparedness (EMP). Design prototype only. */
const ROWS = [["Elena Martinez","High","Walker · lives alone","Caregiver neighbor","SOC day 1","Current"],["Walter Feld","Critical","O2 concentrator","Daughter on file","Jul 20","Needs refresh"],["James Okonkwo","Medium","None documented","Self","Missing","Incomplete"]] as const

export default function EmergencyPrepScreen() {
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
          <div className="card-kicker">Domain EMP · first-pass prototype</div>
          <h1 className="screen-title">Emergency preparedness</h1>
          <div className="screen-sub">Patient-specific profiles, command posture, and exercise evidence.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Emergency preparedness'); setDrawerOpen(true) }}>
            Open patient profile
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="emp-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="emp-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Profiles current"
          value="94%"
          sub="Active patients"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Power-dependent"
          value="6"
          sub="Device / oxygen"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Exercises YTD"
          value="2"
          sub="With after-action"
          accent="good"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Missing profiles"
          value="3"
          sub="SOC this week"
          accent="bad"
        />
      </div>

      <section className="card" aria-label="Emergency preparedness list">
        <div className="emp-toolbar">
          <label className="emp-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Emergency preparedness</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Exercise calendar</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="emp-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Priority</th><th>Dependencies</th><th>Evacuation</th><th>Last review</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Elena Martinez</td><td>High</td><td>Walker · lives alone</td><td>Caregiver neighbor</td><td>SOC day 1</td><td><StatusChip tone="good">Current</StatusChip></td></tr>
                  <tr key={1}><td>Walter Feld</td><td>Critical</td><td>O2 concentrator</td><td>Daughter on file</td><td>Jul 20</td><td><StatusChip tone="neutral">Needs refresh</StatusChip></td></tr>
                  <tr key={2}><td>James Okonkwo</td><td>Medium</td><td>None documented</td><td>Self</td><td>Missing</td><td><StatusChip tone="neutral">Incomplete</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Emergency preparedness'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="emp-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Emergency preparedness</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="emp-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
