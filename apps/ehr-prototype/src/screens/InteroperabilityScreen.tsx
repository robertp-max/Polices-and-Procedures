import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './fhr.css'

/** Synthetic first-pass pageview for Interoperability (FHR). Design prototype only. */
const ROWS = [["Hospital ADT","Inbound","HL7 v2","Integration","Pass","Healthy"],["Lab results","Inbound","FHIR R4","Integration","Pass","Healthy"],["EVV aggregator","Outbound","Alternate EVV","Ops","Fail","Attention"],["Accounting export","Outbound","SFTP","Finance","Pass","Healthy"]] as const

export default function InteroperabilityScreen() {
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
          <div className="card-kicker">Domain FHR · first-pass prototype</div>
          <h1 className="screen-title">Interoperability</h1>
          <div className="screen-sub">FHIR adapters, partner rails, and contract tests — design prototype.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Interoperability'); setDrawerOpen(true) }}>
            View adapter
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="fhr-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="fhr-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Adapters"
          value="11"
          sub="Declared interfaces"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Failing tests"
          value="1"
          sub="Needs owner"
          accent="bad"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Events (24h)"
          value="1.2k"
          sub="Synthetic volume"
          accent="teal"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Replay queue"
          value="0"
          sub="Clear"
          accent="good"
        />
      </div>

      <section className="card" aria-label="Interoperability list">
        <div className="fhr-toolbar">
          <label className="fhr-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Interoperability</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Contract tests</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="fhr-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Adapter</th><th>Direction</th><th>Transport</th><th>Owner</th><th>Last test</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Hospital ADT</td><td>Inbound</td><td>HL7 v2</td><td>Integration</td><td>Pass</td><td><StatusChip tone="good">Healthy</StatusChip></td></tr>
                  <tr key={1}><td>Lab results</td><td>Inbound</td><td>FHIR R4</td><td>Integration</td><td>Pass</td><td><StatusChip tone="good">Healthy</StatusChip></td></tr>
                  <tr key={2}><td>EVV aggregator</td><td>Outbound</td><td>Alternate EVV</td><td>Ops</td><td>Fail</td><td><StatusChip tone="warn">Attention</StatusChip></td></tr>
                  <tr key={3}><td>Accounting export</td><td>Outbound</td><td>SFTP</td><td>Finance</td><td>Pass</td><td><StatusChip tone="good">Healthy</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Interoperability'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="fhr-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Interoperability</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="fhr-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
