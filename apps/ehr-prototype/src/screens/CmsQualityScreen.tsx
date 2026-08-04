import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './hqr.css'

/** Synthetic first-pass pageview for CMS quality reporting (HQR). Design prototype only. */
const ROWS = [["OASIS completeness","Eligible episodes","Month-end","OASIS coordinator","—","On track"],["Quality file batch","July","Submitted","Quality desk","Accepted","Closed"],["Rejection repair","1 assessment","48h","Clinical QA","Rejected","Open"]] as const

export default function CmsQualityScreen() {
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
          <div className="card-kicker">Domain HQR · first-pass prototype</div>
          <h1 className="screen-title">CMS quality reporting</h1>
          <div className="screen-sub">HHQRP completeness, HHVBP monitoring, and conditional HHCAHPS posture.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'CMS quality reporting'); setDrawerOpen(true) }}>
            Run completeness
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="hqr-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="hqr-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Assessment completeness"
          value="96.2%"
          sub="Threshold watch"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Rejected files"
          value="1"
          sub="Repair queue"
          accent="bad"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="HHVBP measures"
          value="12"
          sub="Monitored"
          accent="teal"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="HHCAHPS"
          value="Exempt*"
          sub="Volume determination on file"
          accent="teal"
        />
      </div>

      <section className="card" aria-label="CMS quality reporting list">
        <div className="hqr-toolbar">
          <label className="hqr-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search CMS quality reporting</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Public reporting snapshot</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="hqr-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Measure / file</th><th>Cohort</th><th>Deadline</th><th>Owner</th><th>CMS response</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>OASIS completeness</td><td>Eligible episodes</td><td>Month-end</td><td>OASIS coordinator</td><td>—</td><td><StatusChip tone="good">On track</StatusChip></td></tr>
                  <tr key={1}><td>Quality file batch</td><td>July</td><td>Submitted</td><td>Quality desk</td><td>Accepted</td><td><StatusChip tone="good">Closed</StatusChip></td></tr>
                  <tr key={2}><td>Rejection repair</td><td>1 assessment</td><td>48h</td><td>Clinical QA</td><td>Rejected</td><td><StatusChip tone="neutral">Open</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'CMS quality reporting'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="hqr-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> CMS quality reporting</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="hqr-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
