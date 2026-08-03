import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Activity, ArrowRight, BarChart3, ClipboardCheck, Clock3,
  GitBranch, HeartPulse, Mail, PillBottle,
} from 'lucide-react'
import { Drawer, Sparkline } from '../ui'
import './rep.css'

// All figures on this screen are synthetic — design prototype only.

interface Kpi {
  id: string
  kicker: string
  value: string
  unit: string
  sub: string
  points: number[]
  color: string
  label: string
}

interface ReportDef {
  id: string
  title: string
  description: string
  icon: ReactNode
  brand?: boolean
  points: number[]
  color: string
  label: string
  stats: { label: string; value: string }[]
}

const KPIS: Kpi[] = [
  {
    id: 'kpi-census',
    kicker: 'Active census',
    value: '8',
    unit: 'patients',
    sub: 'Steady over the last 7 days',
    points: [6, 7, 7, 8, 7, 8, 8],
    color: 'var(--viz-1)',
    label: '8 today',
  },
  {
    id: 'kpi-soc',
    kicker: 'Referral → SOC median',
    value: '26',
    unit: 'hrs',
    sub: 'Down from 34h three weeks ago',
    points: [34, 31, 29, 28, 27, 26, 26],
    color: 'var(--viz-2)',
    label: '26h median',
  },
  {
    id: 'kpi-oasis',
    kicker: 'OASIS on-time',
    value: '96',
    unit: '%',
    sub: 'Above the 90% target',
    points: [91, 92, 94, 95, 95, 96, 96],
    color: 'var(--viz-1)',
    label: '96% on-time',
  },
  {
    id: 'kpi-claim',
    kicker: 'Claim-ready rate',
    value: '67',
    unit: '%',
    sub: 'Trending up, POC signature the top blocker',
    points: [58, 60, 61, 64, 65, 66, 67],
    color: 'var(--viz-2)',
    label: '67% ready',
  },
]

const REPORTS: ReportDef[] = [
  {
    id: 'rep-timeliness',
    title: 'Episode timeliness',
    description: 'SOC, recertification, and discharge timing against the plan of care across all active episodes.',
    icon: <Clock3 size={17} strokeWidth={1.75} />,
    points: [88, 90, 91, 93, 92, 94, 94],
    color: 'var(--viz-1)',
    label: '94% on-time',
    stats: [
      { label: 'SOC within 48h', value: '96%' },
      { label: 'Recert on-time', value: '91%' },
    ],
  },
  {
    id: 'rep-oasis',
    title: 'OASIS accuracy',
    description: 'Item-level consistency and completeness scoring across submitted OASIS-E2 assessments.',
    icon: <ClipboardCheck size={17} strokeWidth={1.75} />,
    brand: true,
    points: [94.1, 95.0, 95.6, 96.4, 96.8, 97.0, 97.2],
    color: 'var(--viz-2)',
    label: '97.2 avg score',
    stats: [
      { label: 'Assessments reviewed', value: '41' },
      { label: 'Flagged for correction', value: '3' },
    ],
  },
  {
    id: 'rep-utilization',
    title: 'Visit utilization by discipline',
    description: 'Scheduled versus completed visit volume by discipline for the current month.',
    icon: <Activity size={17} strokeWidth={1.75} />,
    points: [82, 84, 86, 85, 87, 88, 89],
    color: 'var(--viz-1)',
    label: '89% utilization',
    stats: [
      { label: 'SN utilization', value: '93%' },
      { label: 'PT utilization', value: '85%' },
    ],
  },
  {
    id: 'rep-referral',
    title: 'Referral conversion',
    description: 'Referral-to-admission conversion rate and average time-to-decision by source.',
    icon: <GitBranch size={17} strokeWidth={1.75} />,
    brand: true,
    points: [64, 66, 65, 68, 69, 70, 71],
    color: 'var(--viz-2)',
    label: '71% conversion',
    stats: [
      { label: 'Avg. time-to-decision', value: '5.2 hrs' },
      { label: 'Non-admit rate', value: '12%' },
    ],
  },
  {
    id: 'rep-hospitalization',
    title: 'Hospitalization & ED use',
    description: 'Acute care and emergency department utilization among active patients this quarter.',
    icon: <HeartPulse size={17} strokeWidth={1.75} />,
    points: [12.8, 11.9, 11.2, 10.4, 9.9, 9.6, 9.4],
    color: 'var(--viz-1)',
    label: '9.4% rate',
    stats: [
      { label: 'Unplanned hospitalizations', value: '5' },
      { label: 'ED visits, no admit', value: '3' },
    ],
  },
  {
    id: 'rep-medrecon',
    title: 'Med reconciliation aging',
    description: 'Time-to-resolution for flagged medication discrepancies across the caseload.',
    icon: <PillBottle size={17} strokeWidth={1.75} />,
    brand: true,
    points: [3.4, 3.0, 2.6, 2.3, 2.1, 1.9, 1.8],
    color: 'var(--viz-2)',
    label: '1.8 days avg',
    stats: [
      { label: 'Open discrepancies', value: '2' },
      { label: 'Resolved this week', value: '6' },
    ],
  },
]

export default function ReportsScreen() {
  const [openReport, setOpenReport] = useState<ReportDef | null>(null)
  const [scorecardOpen, setScorecardOpen] = useState(false)

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Reports</h1>
          <div className="screen-sub">Operational and clinical intelligence</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-secondary">
            <Mail size={15} strokeWidth={2} aria-hidden />
            Schedule email digest
          </button>
        </div>
      </div>

      <section className="card rep-hero" aria-label="Agency scorecard">
        <div className="rep-hero-head">
          <div className="rep-hero-lead">
            <span className="rep-hero-mark"><BarChart3 size={18} strokeWidth={1.75} aria-hidden /></span>
            <div>
              <div className="card-kicker">Agency scorecard</div>
              <h2 className="card-title rep-hero-title">August</h2>
              <div className="rep-hero-sub">The four numbers leadership checks every morning</div>
            </div>
          </div>
          <button className="btn btn-teal" onClick={() => setScorecardOpen(true)}>
            Open scorecard
            <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
          </button>
        </div>

        <div className="rep-kpis">
          {KPIS.map(k => (
            <div key={k.id} className="rep-kpi">
              <span className="card-kicker rep-kpi-kicker">{k.kicker}</span>
              <span className="rep-kpi-value">
                {k.value}
                <small style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-soft)' }}>
                  {k.unit === '%' ? k.unit : ` ${k.unit}`}
                </small>
              </span>
              <div className="rep-kpi-foot">
                <Sparkline points={k.points} width={92} height={30} color={k.color} label={k.label} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rep-grid">
        {REPORTS.map(r => (
          <section key={r.id} className="card rep-card" aria-label={r.title}>
            <div className="rep-card-head">
              <span className={'rep-card-icon' + (r.brand ? ' is-brand' : '')}>{r.icon}</span>
              <div>
                <div className="card-title rep-card-title">{r.title}</div>
                <p className="rep-card-desc">{r.description}</p>
              </div>
            </div>
            <div className="rep-card-chart">
              <Sparkline points={r.points} width={140} height={34} color={r.color} label={r.label} />
            </div>
            <div className="rep-card-foot">
              <span className="rep-card-meta">Updated 6:00 AM · daily</span>
              <button className="btn-inline" onClick={() => setOpenReport(r)}>
                Open report <ArrowRight size={13} strokeWidth={2.25} aria-hidden />
              </button>
            </div>
          </section>
        ))}
      </div>

      <div className="rep-footer">
        <span className="chip chip-neutral">All figures synthetic — design prototype</span>
      </div>

      <Drawer
        open={!!openReport}
        onClose={() => setOpenReport(null)}
        title={openReport?.title ?? ''}
        sub="Updated 6:00 AM · daily · synthetic data"
      >
        {openReport ? (
          <>
            <div className="rep-drawer-chart">
              <Sparkline points={openReport.points} width={260} height={64} color={openReport.color} label={openReport.label} />
            </div>
            <div className="rep-drawer-section">
              <span className="rep-drawer-label">About this report</span>
              <p className="rep-drawer-text">{openReport.description}</p>
            </div>
            <div className="rep-drawer-stats">
              {openReport.stats.map(s => (
                <div key={s.label} className="rep-drawer-stat">
                  <div className="rep-drawer-stat-label">{s.label}</div>
                  <div className="rep-drawer-stat-value">{s.value}</div>
                </div>
              ))}
            </div>
            <span className="chip chip-neutral">All figures synthetic — design prototype</span>
          </>
        ) : null}
      </Drawer>

      <Drawer
        open={scorecardOpen}
        onClose={() => setScorecardOpen(false)}
        title="Agency scorecard — August"
        sub="Updated 6:00 AM · daily · synthetic data"
      >
        {KPIS.map(k => (
          <div key={k.id} className="rep-drawer-section">
            <span className="rep-drawer-label">{k.kicker}</span>
            <div className="rep-drawer-chart" style={{ padding: '16px 10px' }}>
              <Sparkline points={k.points} width={220} height={48} color={k.color} label={k.label} />
            </div>
            <p className="rep-drawer-text">{k.sub}</p>
          </div>
        ))}
        <span className="chip chip-neutral">All figures synthetic — design prototype</span>
      </Drawer>
    </div>
  )
}
