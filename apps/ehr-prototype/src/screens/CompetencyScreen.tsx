import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './cmp.css'

/** Synthetic first-pass pageview for Competency & in-service (QAP). Design prototype only. */
const ROWS = [["Priya Natarajan, HHA","Annual competency","Aug 10","Observation form","Assignment","Due soon"],["Sam Ortiz, HHA","In-service · infection","Overdue","Missing","Blocked","Overdue"],["Taylor Brooks, RN","OASIS competency","Sep 1","Quiz + observation","Clear","On track"]] as const

export default function CompetencyScreen() {
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
          <h1 className="screen-title">Competency & in-service</h1>
          <div className="screen-sub">Role-required education, observation, remediation, and assignment gates.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Competency & in-service'); setDrawerOpen(true) }}>
            Assign training
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="cmp-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="cmp-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due ≤14d"
          value="8"
          sub="Staff assignments"
          accent="warn"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Overdue"
          value="2"
          sub="Blocks field assignment"
          accent="bad"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Completed (30d)"
          value="37"
          sub="With evidence"
          accent="good"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Remediation open"
          value="3"
          sub="Observation failed"
          accent="orange"
        />
      </div>

      <section className="card" aria-label="Competency & in-service list">
        <div className="cmp-toolbar">
          <label className="cmp-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Competency & in-service</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Due roster</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="cmp-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Staff</th><th>Requirement</th><th>Due</th><th>Evidence</th><th>Gate</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Priya Natarajan, HHA</td><td>Annual competency</td><td>Aug 10</td><td>Observation form</td><td>Assignment</td><td><StatusChip tone="warn">Due soon</StatusChip></td></tr>
                  <tr key={1}><td>Sam Ortiz, HHA</td><td>In-service · infection</td><td>Overdue</td><td>Missing</td><td>Blocked</td><td><StatusChip tone="bad">Overdue</StatusChip></td></tr>
                  <tr key={2}><td>Taylor Brooks, RN</td><td>OASIS competency</td><td>Sep 1</td><td>Quiz + observation</td><td>Clear</td><td><StatusChip tone="good">On track</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Competency & in-service'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="cmp-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Competency & in-service</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="cmp-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
