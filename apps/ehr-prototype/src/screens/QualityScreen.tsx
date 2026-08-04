import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowRight, ClipboardCheck, Download,
  FileCheck2, ShieldCheck,
} from 'lucide-react'
import { patients } from '../data/patients'
import { claims, integrityChecks } from '../data/clinical'
import { Drawer, PatientAvatar, ProgressBar, Sparkline, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './qual.css'

// Short labels for hold reasons, used as compact chips next to each patient row.
const HOLD_SHORT: Record<string, string> = {
  'POC signature outstanding': 'POC signature',
  'OASIS not finalized': 'OASIS finalize',
  'Recert POC in draft': 'Recert POC draft',
}

const CHECK_TONE: Record<string, { tone: StatusTone; label: string }> = {
  passed: { tone: 'good', label: 'Passed' },
  attention: { tone: 'warn', label: 'Attention' },
  blocked: { tone: 'bad', label: 'Blocked' },
}

const QAPI_FOCUS = [
  {
    id: 'foc-1',
    title: 'Medication reconciliation timeliness',
    points: [88, 90, 86, 92, 95],
    label: '95%',
    owner: 'Dana Whitfield, RN',
    review: 'Aug 12',
  },
  {
    id: 'foc-2',
    title: 'OASIS accuracy',
    points: [91, 93, 94, 93, 96],
    label: '96%',
    owner: 'Taylor Brooks, RN',
    review: 'Aug 15',
  },
  {
    id: 'foc-3',
    title: 'Falls without injury',
    points: [2, 1, 2, 1, 1],
    label: '1 MTD',
    owner: 'QAPI committee',
    review: 'Aug 20',
  },
] as const

export default function QualityScreen() {
  const navigate = useNavigate()
  const [exportOpen, setExportOpen] = useState(false)

  const integrityRows = patients
    .map(p => {
      const claim = claims.find(c => c.patientId === p.id)
      const blockers = (claim?.holds ?? []).map(h => HOLD_SHORT[h] ?? h)
      const ratio = p.integrity.passed / p.integrity.total
      return { patient: p, blockers, ratio, pct: ratio * 100 }
    })
    // Worst-first: patients with open claim holds surface first (the true blockers to
    // survey/claim readiness), then remaining episodes ordered by integrity ratio.
    .sort((a, b) => b.blockers.length - a.blockers.length || a.ratio - b.ratio)

  const holdClaims = claims.filter(c => c.holds.length > 0)
  const openHoldCount = claims.reduce((n, c) => n + c.holds.length, 0)

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Quality &amp; compliance</h1>
          <div className="screen-sub">Survey-ready posture · August</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-secondary" onClick={() => setExportOpen(true)}>
            <Download size={15} strokeWidth={2} aria-hidden />
            Export QAPI packet
          </button>
        </div>
      </div>

      <div className="qual-stats">
        <StatCard
          icon={<ShieldCheck size={16} strokeWidth={1.75} />}
          kicker="Record integrity"
          value={<>94<small>%</small></>}
          sub="Agency average · 3 pts above last month"
          accent="good"
          meter={{ pct: 94 }}
        />
        <StatCard
          icon={<ClipboardCheck size={16} strokeWidth={1.75} />}
          kicker="OASIS submitted on time"
          value={<>96<small>%</small></>}
          sub="Rolling 12-month CMS timeliness window"
          accent="teal"
          meter={{ pct: 96 }}
        />
        <StatCard
          icon={<AlertTriangle size={16} strokeWidth={1.75} />}
          kicker="Open claim holds"
          value={openHoldCount}
          sub={`${holdClaims.length} episodes held from submission`}
          accent="warn"
        />
        <StatCard
          icon={<Activity size={16} strokeWidth={1.75} />}
          kicker="Infection events MTD"
          value={0}
          sub="August · no facility-acquired infections"
          accent="good"
        />
      </div>

      <div className="qual-columns">
        <section className="card qual-integrity" aria-label="Record integrity by patient">
          <div className="qual-card-head">
            <div>
              <div className="card-kicker">Claim &amp; survey readiness</div>
              <h2 className="card-title" style={{ fontSize: 17 }}>Record integrity — active episodes</h2>
            </div>
            <span className="chip chip-neutral">{integrityRows.length} episodes</span>
          </div>
          <div className="qual-integrity-list">
            {integrityRows.map(({ patient: p, blockers, pct }) => {
              const ok = p.integrity.passed === p.integrity.total
              return (
                <button
                  key={p.id}
                  className="qual-int-row"
                  onClick={() => navigate(`/patients/${p.id}`)}
                >
                  <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} size="sm" />
                  <span className="qual-int-body">
                    <span className="qual-int-name">{p.firstName} {p.lastName}</span>
                    {blockers.length > 0 ? (
                      <span className="qual-int-blockers">
                        {blockers.map(b => (
                          <span key={b} className="chip chip-warn">
                            <AlertTriangle size={10} strokeWidth={2.25} aria-hidden />
                            {b}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="qual-int-clean">No open blockers</span>
                    )}
                  </span>
                  <span className="qual-int-meter">
                    <span className="qual-int-frac">{p.integrity.passed}<span>/{p.integrity.total}</span></span>
                    <ProgressBar
                      pct={pct}
                      color={ok ? 'var(--status-good)' : 'var(--status-warn-icon)'}
                      label={`${p.firstName} ${p.lastName} record integrity ${p.integrity.passed} of ${p.integrity.total} checks passed`}
                    />
                  </span>
                  <StatusChip tone={ok ? 'good' : 'warn'}>{ok ? 'On track' : 'Attention'}</StatusChip>
                  <ArrowRight className="qual-int-go" size={14} strokeWidth={2} aria-hidden />
                </button>
              )
            })}
          </div>
        </section>

        <div className="qual-side">
          <section className="card qual-holds" aria-label="Claim holds">
            <div className="qual-card-head qual-card-head-tight">
              <div>
                <div className="card-kicker">Revenue cycle</div>
                <h2 className="card-title" style={{ fontSize: 16 }}>Claim holds</h2>
              </div>
            </div>
            <div className="qual-holds-list">
              {holdClaims.map(c => {
                const p = patients.find(pt => pt.id === c.patientId)
                if (!p) return null
                return (
                  <button
                    key={c.id}
                    className="qual-hold-row"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <span className="qual-hold-top">
                      <span className="qual-hold-who">
                        <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} size="sm" />
                        <span className="qual-hold-name">{p.firstName} {p.lastName}</span>
                      </span>
                      <span className="qual-hold-period">{c.period}</span>
                    </span>
                    <span className="qual-hold-chips">
                      {c.holds.map(h => (
                        <span key={h} className="chip chip-warn">
                          <AlertTriangle size={10} strokeWidth={2.25} aria-hidden />
                          {h}
                        </span>
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="card qual-focus" aria-label="QAPI focus areas">
            <div className="qual-card-head qual-card-head-tight">
              <div>
                <div className="card-kicker">QAPI dashboard</div>
                <h2 className="card-title" style={{ fontSize: 16 }}>QAPI focus areas</h2>
              </div>
            </div>
            <div className="qual-focus-list">
              {QAPI_FOCUS.map(f => (
                <div key={f.id} className="qual-focus-row">
                  <div className="qual-focus-head">
                    <span className="qual-focus-title">{f.title}</span>
                    <Sparkline points={[...f.points]} label={f.label} width={92} height={30} />
                  </div>
                  <div className="qual-focus-meta">Owner {f.owner} · Next review {f.review}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="card qual-checks" aria-label="Compliance checks">
        <div className="qual-card-head">
          <div>
            <div className="card-kicker">Survey readiness</div>
            <h2 className="card-title" style={{ fontSize: 17 }}>Compliance checks</h2>
          </div>
          <span className="chip chip-neutral">
            <FileCheck2 size={12} strokeWidth={2} aria-hidden />
            Episode CI-104289 · SOC audit sample
          </span>
        </div>
        <div className="qual-checks-grid">
          {integrityChecks.map(chk => {
            const style = CHECK_TONE[chk.status]
            return (
              <div key={chk.id} className="qual-check-row">
                <span className="qual-check-body">
                  <span className="qual-check-label">{chk.label}</span>
                  <span className="qual-check-detail">{chk.detail}</span>
                </span>
                <StatusChip tone={style.tone}>{style.label}</StatusChip>
              </div>
            )
          })}
        </div>
      </section>

      <Drawer
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export QAPI packet"
        sub="Preview only — nothing is transmitted in this prototype."
      >
        <div className="qual-export-list">
          <div className="qual-export-item">
            <FileCheck2 size={15} strokeWidth={1.75} aria-hidden />
            <div>
              <div className="qual-export-title">Record integrity summary</div>
              <div className="qual-export-detail">8 active episodes · worst-first, with named blockers</div>
            </div>
          </div>
          <div className="qual-export-item">
            <AlertTriangle size={15} strokeWidth={1.75} aria-hidden />
            <div>
              <div className="qual-export-title">Claim holds</div>
              <div className="qual-export-detail">{holdClaims.length} episodes · {openHoldCount} open hold reasons</div>
            </div>
          </div>
          <div className="qual-export-item">
            <Activity size={15} strokeWidth={1.75} aria-hidden />
            <div>
              <div className="qual-export-title">QAPI focus trends</div>
              <div className="qual-export-detail">Medication reconciliation, OASIS accuracy, falls without injury</div>
            </div>
          </div>
          <div className="qual-export-item">
            <ShieldCheck size={15} strokeWidth={1.75} aria-hidden />
            <div>
              <div className="qual-export-title">Compliance checklist</div>
              <div className="qual-export-detail">13-point SOC audit sample · Episode CI-104289</div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  )
}
