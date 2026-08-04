import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './med.css'

/** Synthetic first-pass pageview for Medications (CLN). Design prototype only. */
const ROWS = [["Metoprolol","25 mg PO BID","Discharge list","Active","Dose unconfirmed"],["Apixaban","5 mg PO BID","Bottle photo","Active","High-risk"],["Acetaminophen","650 mg PO PRN","Patient report","Proposed","Needs reconcile"],["Lisinopril","10 mg PO daily","PCP list","Active","—"]] as const

export default function MedicationsScreen() {
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
          <div className="card-kicker">Domain CLN · first-pass prototype</div>
          <h1 className="screen-title">Medications & allergies</h1>
          <div className="screen-sub">Sourced lists, discrepancies, and reconciliation proposals — never auto-filed.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Medications & allergies'); setDrawerOpen(true) }}>
            Start reconciliation
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="med-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="med-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active meds"
          value="11"
          sub="Elena sample chart"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Discrepancies"
          value="2"
          sub="Need clinician resolution"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="High-risk flags"
          value="1"
          sub="Anticoagulant"
          accent="bad"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Allergies"
          value="1"
          sub="Penicillin · rash"
          accent="teal"
        />
      </div>

      <section className="card" aria-label="Medications & allergies list">
        <div className="med-toolbar">
          <label className="med-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Medications & allergies</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Allergy list</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="med-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Drug</th><th>Dose / route / freq</th><th>Source</th><th>Status</th><th>Flag</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Metoprolol</td><td>25 mg PO BID</td><td>Discharge list</td><td>Active</td><td><StatusChip tone="neutral">Dose unconfirmed</StatusChip></td></tr>
                  <tr key={1}><td>Apixaban</td><td>5 mg PO BID</td><td>Bottle photo</td><td>Active</td><td><StatusChip tone="warn">High-risk</StatusChip></td></tr>
                  <tr key={2}><td>Acetaminophen</td><td>650 mg PO PRN</td><td>Patient report</td><td>Proposed</td><td><StatusChip tone="neutral">Needs reconcile</StatusChip></td></tr>
                  <tr key={3}><td>Lisinopril</td><td>10 mg PO daily</td><td>PCP list</td><td>Active</td><td><StatusChip tone="neutral">—</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Medications & allergies'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="med-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Medications</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="med-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
