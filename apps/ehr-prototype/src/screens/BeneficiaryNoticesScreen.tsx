import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './ben.css'

/** Synthetic first-pass pageview for Beneficiary notices (BEN). Design prototype only. */
const ROWS = [["Walter Feld","NOMNC","Service end proposed","Tomorrow 5 PM","Beneficiary","Draft"],["Rosa Alvarez","DENC","Expedited appeal","Today 3 PM","Representative","In delivery"],["James Okonkwo","NOMNC","Discharge planning","Thu","Beneficiary","Acknowledged"]] as const

export default function BeneficiaryNoticesScreen() {
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
          <div className="card-kicker">Domain BEN · first-pass prototype</div>
          <h1 className="screen-title">Beneficiary notices & appeals</h1>
          <div className="screen-sub">NOMNC, DENC, delivery clocks, and expedited review — synthetic drills only.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Beneficiary notices & appeals'); setDrawerOpen(true) }}>
            Start NOMNC packet
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="ben-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="ben-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Open notices"
          value="3"
          sub="Delivery required"
          accent="warn"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Appeals active"
          value="1"
          sub="BFCC-QIO path"
          accent="teal"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Due ≤48h"
          value="2"
          sub="Clock-sensitive"
          accent="bad"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Completed (30d)"
          value="11"
          sub="With acknowledgments"
          accent="good"
        />
      </div>

      <section className="card" aria-label="Beneficiary notices & appeals list">
        <div className="ben-toolbar">
          <label className="ben-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Beneficiary notices & appeals</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Appeal timeline</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="ben-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Notice</th><th>Trigger</th><th>Deliver by</th><th>Recipient</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Walter Feld</td><td>NOMNC</td><td>Service end proposed</td><td>Tomorrow 5 PM</td><td>Beneficiary</td><td><StatusChip tone="warn">Draft</StatusChip></td></tr>
                  <tr key={1}><td>Rosa Alvarez</td><td>DENC</td><td>Expedited appeal</td><td>Today 3 PM</td><td>Representative</td><td><StatusChip tone="neutral">In delivery</StatusChip></td></tr>
                  <tr key={2}><td>James Okonkwo</td><td>NOMNC</td><td>Discharge planning</td><td>Thu</td><td>Beneficiary</td><td><StatusChip tone="neutral">Acknowledged</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Beneficiary notices & appeals'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="ben-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Beneficiary notices</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="ben-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
