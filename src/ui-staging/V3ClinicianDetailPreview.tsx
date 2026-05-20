import { useState } from 'react'
import { V3SubView } from './components/V3PageWrapper'
// outer V3PageWrapper + v3-canvas stripped (nested canvas broke 77.7% main-card veil treatment + grid bg in V3PagePreview)
import { MOCK_CLINICIANS, MOCK_CONNECTIONS } from '../policy/staffing/data/mockClinicians'
import { MOCK_PATIENTS } from '../policy/staffing/data/mockPatients'

// ============================================================
// V3ClinicianDetailPreview — Rich production fidelity (ClaudeX2 + S15)
// Pulls full Clinician + Credential[] + all FEHA types (ReligiousRestriction, AdaAccommodation, FmlaLeave, Pregnancy)
// + joined ClinicianPatientConnection with patient names, notes, rationale
// Matches PDF screenshots: full credential expiry, multiple FEHA accommodations, rich assignment history
// ============================================================

type TabId = 'overview' | 'credentials' | 'assignments' | 'availability' | 'history';

// Use rich real data from mocks (Amara has religious FEHA; switchable to Fatima for ADA, Lena for FMLA)
const baseClinician = MOCK_CLINICIANS[0]; // Amara Okonkwo
const clinConnections = MOCK_CONNECTIONS.filter(c => c.clinicianId === baseClinician.id);

export function V3ClinicianDetailPreview() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const c = baseClinician; // rich real clinician from mocks (full fields + FEHA variants)

  const tabs: { id: TabId; label: string; phase2?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'credentials', label: 'Credentials & Competencies' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'availability', label: 'Availability', phase2: true },
    { id: 'history', label: 'History', phase2: true },
  ];

  return (
    <div className="v3-no-scrollbar p-2 text-[var(--v3-text-primary)]" style={{ minHeight: '100%' }}>
        {/* Header */}
        <div>
          <div className="text-[13px] text-[var(--v3-text-secondary)] mb-2">← Back to Clinician Profiles</div>
          <div className="flex items-center gap-4 pb-4 border-b border-[var(--v3-border)]">
            <div className="w-14 h-14 rounded-full bg-[rgba(0,209,193,0.12)] flex items-center justify-center text-3xl">👤</div>
            <div>
              <div className="text-2xl font-semibold">{c.firstName} {c.lastName}</div>
              <div className="flex gap-3 mt-1 text-sm">
                <span className="px-2.5 py-0.5 rounded bg-[rgba(0,209,193,0.08)] text-[#00D1C1]">{c.primaryDiscipline}</span>
                <span className="text-[#00D1C1] font-semibold">{c.status.toUpperCase()}</span>
                <span className="text-[var(--v3-text-tertiary)]">ID: {c.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with V3 styling + V3SubView for transitions */}
        <div className="flex gap-1 border-b border-[var(--v3-border)] mt-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => !t.phase2 && setActiveTab(t.id)}
              className="v3-tab"
              data-active={activeTab === t.id}
              disabled={!!t.phase2}
              style={t.phase2 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {t.label}{t.phase2 ? ' (Phase 2)' : ''}
            </button>
          ))}
        </div>

        <V3SubView viewKey={activeTab}>
          {/* Overview — matches PDF screenshot layout: grouped Personal + Disciplines cards + rich FEHA section (production structure, V3 reskin) */}
          {activeTab === 'overview' && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information card (matches production screenshot) */}
              <div className="v3-card p-4">
                <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase mb-2">Personal Information</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex"><span className="w-28 text-[var(--v3-text-tertiary)]">Email</span><span>{c.email ?? '—'}</span></div>
                  <div className="flex"><span className="w-28 text-[var(--v3-text-tertiary)]">Phone</span><span>{c.phone ?? '—'}</span></div>
                  <div className="flex"><span className="w-28 text-[var(--v3-text-tertiary)]">Employment</span><span>{c.employmentType}</span></div>
                  <div className="flex"><span className="w-28 text-[var(--v3-text-tertiary)]">Hire Date</span><span>{c.hireDate ?? '—'}</span></div>
                  <div className="flex"><span className="w-28 text-[var(--v3-text-tertiary)]">Role</span><span>{(c as any).orgRole?.replace(/_/g, ' ') ?? '—'}</span></div>
                </div>
              </div>

              {/* Disciplines & Areas card (matches production screenshot) */}
              <div className="v3-card p-4">
                <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase mb-2">Disciplines & Areas</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="v3-badge">{c.primaryDiscipline}</span>
                </div>
                {(c as any).serviceAreas && (c as any).serviceAreas.length > 0 && (
                  <>
                    <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase mt-2 mb-1">SERVICE AREAS</div>
                    <div className="flex flex-wrap gap-1">
                      {(c as any).serviceAreas.map((a: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs border border-[var(--v3-border-subtle)]" style={{ background: 'var(--v3-glass2)' }}>{a}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Competencies full width */}
              <div className="md:col-span-2 v3-card p-4">
                <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase mb-2">COMPETENCIES</div>
                <div className="flex flex-wrap gap-2">
                  {c.competencies.map((comp: any, i: number) => (
                    <span key={i} className="v3-badge">{comp.name} ({comp.level})</span>
                  ))}
                </div>
              </div>

              {/* FEHA Compliance section — exact rich production shape matching PDF screenshot (Religious + potential ADA/FMLA/Pregnancy) */}
              {((c as any).religiousRestrictions?.length > 0 || (c as any).adaAccommodations?.length > 0 || (c as any).fmlaLeave?.active || (c as any).pregnancyAccommodation?.active) && (
                <div className="md:col-span-2 v3-card p-4">
                  <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase mb-2">FEHA COMPLIANCE — ACCOMMODATION DATA</div>
                  <div className="space-y-3">
                    {(c as any).religiousRestrictions?.map((r: any, i: number) => (
                      <div key={i} className="p-3 rounded text-sm" style={{ background: 'var(--v3-glass2)', border: '1px solid var(--v3-border-subtle)' }}>
                        <div className="text-xs font-semibold mb-0.5 text-[var(--v3-text-tertiary)]">Religious Restriction</div>
                        <div className="font-medium">{r.day}{r.timeRange ? ` (${r.timeRange})` : ''}</div>
                        {r.description && <div className="text-xs mt-0.5 text-[var(--v3-text-secondary)]">{r.description}</div>}
                        {r.recurring && <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-[var(--v3-glass3)]">Recurring</span>}
                      </div>
                    ))}
                    {(c as any).adaAccommodations?.map((a: any, i: number) => (
                      <div key={i} className="p-3 rounded text-sm" style={{ background: 'var(--v3-glass2)', border: '1px solid var(--v3-border-subtle)' }}>
                        <div className="text-xs font-semibold mb-0.5 text-[var(--v3-text-tertiary)]">ADA Accommodation — {a.type}</div>
                        <div>{a.description}</div>
                        <div className="text-xs mt-0.5 text-[var(--v3-text-secondary)]">Effective: {a.effectiveDate}{a.reviewDate ? ` · Review: ${a.reviewDate}` : ''}</div>
                      </div>
                    ))}
                    {(c as any).fmlaLeave?.active && (
                      <div className="p-3 rounded text-sm" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(234,179,8,0.3)' }}>
                        <div className="text-xs font-semibold mb-0.5" style={{ color: '#a16207' }}>FMLA Leave — Active</div>
                        <div>{(c as any).fmlaLeave.leaveType ?? 'FMLA'} {(c as any).fmlaLeave.intermittent ? ' (Intermittent)' : ''}</div>
                        {((c as any).fmlaLeave.startDate || (c as any).fmlaLeave.endDate) && <div className="text-xs mt-0.5 text-[var(--v3-text-secondary)]">{(c as any).fmlaLeave.startDate} – {(c as any).fmlaLeave.endDate ?? 'TBD'}</div>}
                      </div>
                    )}
                    {(c as any).pregnancyAccommodation?.active && (
                      <div className="p-3 rounded text-sm" style={{ background: 'var(--v3-glass2)', border: '1px solid var(--v3-border-subtle)' }}>
                        <div className="text-xs font-semibold mb-0.5 text-[var(--v3-text-tertiary)]">Pregnancy Accommodation — Active</div>
                        {(c as any).pregnancyAccommodation.details && <div>{(c as any).pregnancyAccommodation.details}</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Credentials & Competencies — real Credential[] shape */}
          {activeTab === 'credentials' && (
            <div className="mt-5 space-y-3">
              {c.credentials.map((cred, i) => (
                <div key={i} className="v3-card p-4 flex justify-between items-start">
                  <div>
                    <div className="font-medium">{cred.credentialName}</div>
                    {cred.issuingBody && <div className="text-sm text-[var(--v3-text-secondary)]">{cred.issuingBody}</div>}
                    {cred.licenseNumber && <div className="text-xs text-[var(--v3-text-tertiary)]">License: {cred.licenseNumber} ({cred.state})</div>}
                  </div>
                  <div className="text-right text-sm">
                    {cred.expiresAt && <div>Expires: {cred.expiresAt}</div>}
                    {cred.daysUntilExpiry !== undefined && (
                      <div className={cred.daysUntilExpiry < 90 ? 'text-[#E07B2C]' : 'text-[#00D1C1]'}>
                        {cred.daysUntilExpiry} days
                      </div>
                    )}
                    <span className="v3-badge mt-1">{cred.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assignments — rich joined real ClinicianPatientConnection data */}
          {activeTab === 'assignments' && (
            <div className="mt-5 v3-card p-4">
              {clinConnections.length > 0 ? (
                clinConnections.map((conn, i) => {
                  const pat = MOCK_PATIENTS.find(p => p.id === conn.patientId);
                  return (
                    <div key={i} className="mb-4 last:mb-0 border-b border-[var(--v3-border)] pb-3 last:border-0">
                      <div className="font-medium">{pat ? `${pat.firstName} ${pat.lastName}` : conn.patientId} — {conn.discipline}</div>
                      <div className="text-sm text-[var(--v3-text-secondary)]">
                        Role: {conn.assignmentRole} • Status: {conn.connectionStatus} • Source: {conn.source.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-[var(--v3-text-tertiary)] mt-0.5">
                        Started {conn.startDate} • Assigned by: {conn.assignedBy}
                        {conn.notes && <div className="mt-0.5">“{conn.notes}”</div>}
                        {conn.approvalRationale && <div className="mt-0.5">Rationale: {conn.approvalRationale}</div>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-[var(--v3-text-tertiary)]">No active assignments</div>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="mt-5 text-[var(--v3-text-secondary)] text-sm">
              Phase 2 — Availability calendar and scheduling limitations will be shown here (real FEHA + credential constraints + max hours).
            </div>
          )}

          {activeTab === 'history' && (
            <div className="mt-5 text-[var(--v3-text-secondary)] text-sm">
              Phase 2 — Assignment and credential history timeline with prior continuity flags.
            </div>
          )}
        </V3SubView>

      </div>
  );
}
