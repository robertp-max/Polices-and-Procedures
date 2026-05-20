import { useState } from 'react'
import { V3PageWrapper } from './components/V3PageWrapper'
import { Search, ChevronRight, Lock } from 'lucide-react'

// V3PatientListPreview — Fixed to exactly match reference screenshot in APP_Screenshots.pdf (Claude spec FILE 11 / Pageview #8)
// Full 6-patient rich clinical dataset, 7-column layout (PATIENT / DIAGNOSIS / CLINICIAN / START OF CARE / EPISODE / STATUS + chevron)
// V3 Veil Glass styling via v3-* classes + CSS tokens, lucide icons, HIPAA header, hover rows, search filter
// Preserves realistic data fidelity per ClaudeX2 + Agent05 audit corrections. No emoji fallbacks.

interface Patient {
  id: string
  name: string
  status: string
  primaryDiagnosis: string
  assignedClinician: string
  startOfCare: string
  episodeStatus: string
}

const PATIENTS: Patient[] = [
  { id: 'PT-001', name: 'Margaret Henderson', status: 'Active', primaryDiagnosis: 'CHF Management', assignedClinician: 'Amara Okonkwo, RN', startOfCare: '2026-04-01', episodeStatus: 'In Progress' },
  { id: 'PT-002', name: 'Robert Chen', status: 'Active', primaryDiagnosis: 'Post-Surgical Rehab', assignedClinician: 'Erik Johansson, PT', startOfCare: '2026-03-15', episodeStatus: 'In Progress' },
  { id: 'PT-003', name: 'Dorothy Williams', status: 'Active', primaryDiagnosis: 'Diabetes Management', assignedClinician: 'Valentina Ramirez-Cruz, LVN', startOfCare: '2026-02-20', episodeStatus: 'In Progress' },
  { id: 'PT-004', name: 'James Foster', status: 'Discharged', primaryDiagnosis: 'Wound Care', assignedClinician: 'Amara Okonkwo, RN', startOfCare: '2025-12-10', episodeStatus: 'Closed' },
  { id: 'PT-005', name: 'Eleanor Vasquez', status: 'Active', primaryDiagnosis: 'OT Evaluation', assignedClinician: 'Fatima Adekoya, OT', startOfCare: '2026-05-01', episodeStatus: 'Admission' },
  { id: 'PT-006', name: 'William Park', status: 'Hold', primaryDiagnosis: 'Fall Prevention', assignedClinician: 'Marcus Vasquez, HHA', startOfCare: '2026-04-15', episodeStatus: 'Paused' },
]

export function V3PatientListPreview() {
  const [search, setSearch] = useState('')

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.primaryDiagnosis.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor = (s: string) => {
    if (s === 'Active') return '#00D1C1' // --v3-teal-light
    if (s === 'Discharged') return 'var(--v3-text-tertiary)'
    return 'var(--v3-text-secondary)' // Hold etc.
  }

  return (
    <V3PageWrapper transitionKey="patient-list">
      <div className="v3-no-scrollbar p-2 text-[var(--v3-text-primary)]" style={{ minHeight: '100%' }}>
        {/* Header — exact match to Claude spec + PDF screenshot reference */}
        <div className="pb-4 border-b border-[var(--v3-border)]">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={14} className="text-[#00D1C1]" />
            <span className="text-[#00D1C1] text-[10px] font-bold tracking-[1px] uppercase">HIPAA PROTECTED</span>
          </div>
          <h1 className="text-2xl font-semibold">Patient Profiles</h1>
          <p className="text-[13px] text-[var(--v3-text-secondary)]">
            Clinical registers for assigned home health treatment programs. All pipelines fully encrypted.
          </p>
        </div>

        {/* Search — v3-input-wrapper + lucide (exact visual per reference) */}
        <div className="v3-input-wrapper mt-5">
          <Search size={16} className="text-[var(--v3-text-tertiary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients or diagnoses..."
            className="v3-search w-full bg-transparent border-none outline-none text-sm"
          />
        </div>

        {/* Table — 7 columns + chevron, full 6-row rich dataset. Explicit cell padding/fonts for exact PDF screenshot layout fidelity (overrides generic .v3-table for this preview only) */}
        <div className="mt-5 rounded-2xl border border-[var(--v3-border)] overflow-hidden v3-card" style={{ background: 'rgba(255,255,255,0.018)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--v3-border)' }}>
                {['PATIENT', 'DIAGNOSIS', 'CLINICIAN', 'START OF CARE', 'EPISODE', 'STATUS', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: 'var(--v3-text-tertiary)',
                    background: 'var(--v3-glass3)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => alert(`(Preview) Would navigate to Patient Detail for ${p.name} (ID: ${p.id})`)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--v3-border)' : 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--v3-glass2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--v3-text-secondary)' }}>{p.primaryDiagnosis}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--v3-text-secondary)' }}>{p.assignedClinician}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--v3-text-tertiary)' }}>{p.startOfCare}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--v3-text-secondary)' }}>{p.episodeStatus}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor(p.status) }}>{p.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <ChevronRight size={16} className="text-[var(--v3-text-tertiary)]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </V3PageWrapper>
  );
}
