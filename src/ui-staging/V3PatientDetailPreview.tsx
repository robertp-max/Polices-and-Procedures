import { useState } from 'react'
import { V3SubView } from './components/V3PageWrapper'
// V3PageWrapper (outer) + canvas removed to avoid nesting inside V3PagePreview's v3-main-card (77.7% veil + grid + watermark fidelity to PDF)

// ============================================================
// V3PatientDetailPreview — Upgraded to claudex3 quality + PDF fidelity
// Rich clinical production data shapes (diagnoses w/ ICD-10, meds w/ dosage, episodes, verified insurance, contacts)
// 5 tabs + V3SubView transitions + v3-* glass cards matching PDF patient detail pages
// (Overview with stats + allergies + primary dx, Diagnoses & Meds, Care Episodes, Insurance & Contacts, Documents)
// Now matches the best claudex3 implementation fidelity while using consistent V3 class system (v3-tab, v3-card, V3SubView)
// Visual layer only — mirrors real PatientProfile / CareEpisode / InsurancePlan models
// ============================================================

type TabId = 'overview' | 'diagnoses-meds' | 'care-episodes' | 'insurance-contacts' | 'documents';

// Real production-grade data shapes (claudex3 level richness)
interface Diagnosis { code: string; description: string; isPrimary: boolean; onset: string; }
interface Medication { name: string; dosage: string; frequency: string; prescriber: string; startDate: string; }
interface InsurancePlan { provider: string; policyNumber: string; groupNumber: string; type: 'Medicare' | 'Medicaid' | 'Private' | 'VA'; isPrimary: boolean; verified: boolean; verifiedDate: string; }
interface CareEpisode { id: string; type: string; startDate: string; endDate: string | null; status: 'active' | 'discharged' | 'on-hold'; assignedClinician: string; visitCount: number; }
interface EmergencyContact { name: string; relationship: string; phone: string; isPrimary: boolean; }

const PATIENT_DATA = {
  id: 'PT-2847',
  firstName: 'Margaret',
  lastName: 'Chen',
  dob: '1948-03-14',
  age: 78,
  gender: 'Female',
  mrn: 'MRN-0029847',
  phone: '(415) 555-0192',
  address: '482 Sunset Blvd, San Francisco, CA 94122',
  primaryLanguage: 'English',
  secondaryLanguage: 'Cantonese',
  advanceDirectives: true,
  dnrOnFile: true,
  status: 'Active',
  assignedClinician: 'Amara Okonkwo, RN',
  physician: 'Dr. R. Patel, MD',
  startOfCare: '2026-04-01',
  allergies: ['Penicillin', 'Sulfa drugs', 'Latex'],
  diagnoses: [
    { code: 'I50.9', description: 'Heart failure, unspecified', isPrimary: true, onset: '2024-08-12' },
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', isPrimary: false, onset: '2019-03-01' },
    { code: 'M17.11', description: 'Primary osteoarthritis, right knee', isPrimary: false, onset: '2022-06-15' },
  ] as Diagnosis[],
  medications: [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', prescriber: 'Dr. R. Patel', startDate: '2024-08-15' },
    { name: 'Metformin', dosage: '500mg', frequency: 'BID', prescriber: 'Dr. R. Patel', startDate: '2019-04-01' },
    { name: 'Furosemide', dosage: '40mg', frequency: 'Daily', prescriber: 'Dr. R. Patel', startDate: '2024-08-15' },
    { name: 'Acetaminophen', dosage: '500mg', frequency: 'PRN', prescriber: 'Dr. K. Nguyen', startDate: '2022-07-01' },
  ] as Medication[],
  insurance: [
    { provider: 'Medicare Part A', policyNumber: '1EG4-TE5-MK72', groupNumber: 'N/A', type: 'Medicare', isPrimary: true, verified: true, verifiedDate: '2026-05-01' },
    { provider: 'Blue Shield Medigap Plan F', policyNumber: 'BSC-449281', groupNumber: 'MG-2200', type: 'Private', isPrimary: false, verified: true, verifiedDate: '2026-04-28' },
  ] as InsurancePlan[],
  episodes: [
    { id: 'EP-1142', type: 'Skilled Nursing', startDate: '2026-04-01', endDate: null, status: 'active', assignedClinician: 'Dr. Evelyn Vance', visitCount: 12 },
    { id: 'EP-1098', type: 'Physical Therapy', startDate: '2026-03-15', endDate: null, status: 'active', assignedClinician: 'Sophia Caldwell, PT', visitCount: 8 },
    { id: 'EP-0987', type: 'Skilled Nursing', startDate: '2025-11-01', endDate: '2026-01-15', status: 'discharged', assignedClinician: 'Marcus Sterling, RN', visitCount: 22 },
  ] as CareEpisode[],
  emergencyContacts: [
    { name: 'David Chen', relationship: 'Son', phone: '(415) 555-0288', isPrimary: true },
    { name: 'Lisa Chen-Park', relationship: 'Daughter', phone: '(510) 555-0134', isPrimary: false },
  ] as EmergencyContact[],
  documents: [
    { name: 'CMS-485 Home Health Certification', type: 'Certification', date: '2026-04-01', status: 'Active' },
    { name: 'Plan of Care (POC) - Episode EP-1142', type: 'Care Plan', date: '2026-04-01', status: 'Active' },
    { name: 'OASIS-E Assessment (SOC)', type: 'Assessment', date: '2026-04-01', status: 'Completed' },
    { name: 'Advance Directive', type: 'Legal', date: '2025-06-20', status: 'On File' },
    { name: 'DNR Order', type: 'Legal', date: '2025-06-20', status: 'On File' },
    { name: 'Discharge Summary - EP-0987', type: 'Discharge', date: '2026-01-15', status: 'Finalized' },
  ] as Array<{name: string; type: string; date: string; status: string}>,
};

export function V3PatientDetailPreview() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const p = PATIENT_DATA;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'diagnoses-meds', label: 'Diagnoses & Medications' },
    { id: 'care-episodes', label: 'Care Episodes' },
    { id: 'insurance-contacts', label: 'Insurance & Contacts' },
    { id: 'documents', label: 'Documents' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="mt-5">
            {/* Patient header info card */}
            <div className="v3-invisible-glare v3-card p-5">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="text-2xl font-semibold">{p.firstName} {p.lastName}</div>
                  <div className="text-[13px] text-[var(--v3-text-secondary)] mt-1">
                    {p.mrn} · DOB {p.dob} · Age {p.age} · {p.gender}
                  </div>
                  <div className="text-[12px] text-[var(--v3-text-tertiary)] mt-0.5">{p.address}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {p.advanceDirectives && (
                    <span className="v3-badge" style={{ background: 'rgba(0, 209, 193, 0.12)', color: 'var(--v3-teal-light)' }}>AD on File</span>
                  )}
                  {p.dnrOnFile && (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.12)', color: '#F87171', fontWeight: 500, border: '1px solid rgba(239,68,68,0.2)' }}>DNR</span>
                  )}
                  <span className="px-2.5 py-0.5 rounded bg-[rgba(0,209,193,0.08)] text-[#00D1C1] font-semibold text-xs self-start">{p.status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Quick stats row — 4 KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Active Episodes', value: p.episodes.filter(e => e.status === 'active').length },
                { label: 'Total Visits (Active)', value: p.episodes.filter(e => e.status === 'active').reduce((s, e) => s + e.visitCount, 0) },
                { label: 'Diagnoses', value: p.diagnoses.length },
                { label: 'Medications', value: p.medications.length },
              ].map((stat, i) => (
                <div key={i} className="v3-invisible-glare v3-card p-4 text-center">
                  <div className="text-2xl font-semibold text-[var(--v3-text-primary)]">{stat.value}</div>
                  <div className="text-[10px] text-[var(--v3-text-tertiary)] mt-1 tracking-[0.5px] uppercase">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Allergies + Primary Dx + Languages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="v3-invisible-glare v3-card p-4 md:col-span-1">
                <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.5px] mb-2">⚠ ALLERGIES</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.allergies.map((a, i) => (
                    <span key={i} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'rgba(251, 146, 60, 0.12)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.25)' }}>{a}</span>
                  ))}
                </div>
              </div>
              <div className="v3-invisible-glare v3-card p-4 md:col-span-1">
                <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.5px] mb-1">PRIMARY DIAGNOSIS</div>
                <div className="text-[14px] font-medium">{p.diagnoses[0].description}</div>
                <div className="text-xs text-[var(--v3-text-tertiary)] mt-1">ICD-10: {p.diagnoses[0].code} · Onset {p.diagnoses[0].onset}</div>
              </div>
              <div className="v3-invisible-glare v3-card p-4 md:col-span-1">
                <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.5px] mb-1">LANGUAGES</div>
                <div className="text-[14px] font-medium">{p.primaryLanguage}</div>
                <div className="text-xs text-[var(--v3-text-secondary)]">Secondary: {p.secondaryLanguage}</div>
                <div className="text-xs text-[var(--v3-text-tertiary)] mt-1">Assigned: {p.assignedClinician}</div>
              </div>
            </div>
          </div>
        );

      case 'diagnoses-meds':
        return (
          <div className="mt-5 space-y-6">
            <div>
              <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.08em] mb-3 font-semibold">Active Diagnoses (ICD-10)</div>
              {p.diagnoses.map((d, i) => (
                <div key={i} className="v3-invisible-glare v3-card p-4 mb-2 flex justify-between items-center">
                  <div>
                    <div className="text-[14px] font-medium">{d.description}</div>
                    <div className="text-xs text-[var(--v3-text-tertiary)] mt-0.5">ICD-10: {d.code} · Onset {d.onset}</div>
                  </div>
                  {d.isPrimary && <span className="v3-badge" style={{ background: 'rgba(0,209,193,0.12)', color: 'var(--v3-teal-light)', fontSize: '10px' }}>PRIMARY</span>}
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.08em] mb-3 font-semibold">Current Medications</div>
              {p.medications.map((m, i) => (
                <div key={i} className="v3-invisible-glare v3-card p-4 mb-2">
                  <div className="flex justify-between text-sm">
                    <div className="font-medium">{m.name} {m.dosage}</div>
                    <div className="text-[var(--v3-text-tertiary)]">{m.frequency}</div>
                  </div>
                  <div className="text-xs text-[var(--v3-text-secondary)] mt-1">Prescribed by {m.prescriber} · Since {m.startDate}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'care-episodes':
        return (
          <div className="mt-5 space-y-3">
            <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.08em] mb-2 font-semibold">Care Episodes & Visit History</div>
            {p.episodes.map((ep) => (
              <div key={ep.id} className="v3-invisible-glare v3-card p-4" style={{ borderLeft: `3px solid ${ep.status === 'active' ? 'var(--v3-teal-light)' : 'var(--v3-text-tertiary)'}` }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-[15px]">{ep.type}</div>
                    <div className="text-xs text-[var(--v3-text-secondary)] mt-0.5">{ep.assignedClinician}</div>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 9px', borderRadius: 999, fontWeight: 600, letterSpacing: '0.5px',
                    background: ep.status === 'active' ? 'rgba(0,209,193,0.12)' : 'rgba(100,116,139,0.12)',
                    color: ep.status === 'active' ? 'var(--v3-teal-light)' : 'var(--v3-text-tertiary)',
                  }}>{ep.status.toUpperCase()}</span>
                </div>
                <div className="flex gap-x-5 text-xs text-[var(--v3-text-tertiary)] mt-3">
                  <span>{ep.id}</span>
                  <span>{ep.startDate} → {ep.endDate || 'Present'}</span>
                  <span>{ep.visitCount} visits</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'insurance-contacts':
        return (
          <div className="mt-5 space-y-6">
            <div>
              <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.08em] mb-3 font-semibold">Insurance Plans (Verified)</div>
              {p.insurance.map((ins, i) => (
                <div key={i} className="v3-invisible-glare v3-card p-4 mb-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-[14px]">{ins.provider}</div>
                    <div className="flex gap-1.5">
                      {ins.isPrimary && <span className="v3-badge" style={{ background: 'rgba(0,209,193,0.12)', color: 'var(--v3-teal-light)', fontSize: 10 }}>PRIMARY</span>}
                      {ins.verified && <span className="v3-badge" style={{ background: 'rgba(0,209,193,0.06)', color: 'var(--v3-teal-light)', fontSize: 10, borderColor: 'rgba(0,209,193,0.2)' }}>✓ VERIFIED {ins.verifiedDate}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--v3-text-tertiary)] mt-2 flex gap-x-4">
                    <span>Policy: {ins.policyNumber}</span>
                    <span>Group: {ins.groupNumber}</span>
                    <span>Type: {ins.type}</span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.08em] mb-3 font-semibold">Emergency Contacts</div>
              {p.emergencyContacts.map((ec, i) => (
                <div key={i} className="v3-invisible-glare v3-card p-4 mb-2 flex justify-between">
                  <div>
                    <div className="font-medium">{ec.name}</div>
                    <div className="text-xs text-[var(--v3-text-secondary)]">{ec.relationship} · {ec.phone}</div>
                  </div>
                  {ec.isPrimary && <span className="v3-badge" style={{ fontSize: 10 }}>PRIMARY</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="mt-5 space-y-2">
            <div className="text-[10px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.08em] mb-3 font-semibold">Patient Documents & Forms</div>
            {p.documents.map((doc, i) => (
              <div key={i} className="v3-invisible-glare v3-card p-3.5 flex justify-between items-center">
                <div>
                  <div className="font-medium text-[13px]">{doc.name}</div>
                  <div className="text-xs text-[var(--v3-text-tertiary)]">{doc.type} · {doc.date}</div>
                </div>
                <span className="v3-badge" style={{ fontSize: 10, background: 'rgba(0,209,193,0.08)', color: 'var(--v3-teal-light)' }}>{doc.status}</span>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="v3-no-scrollbar p-2 text-[var(--v3-text-primary)]" style={{ minHeight: '100%' }}>
        {/* Back navigation */}
        <div className="text-[13px] text-[var(--v3-text-secondary)] mb-2">← Back to Patient Profiles</div>

        {/* Header — rich clinical + HIPAA + key IDs (claudex3 + PDF fidelity) */}
        <div className="flex items-center gap-4 pb-4 border-b border-[var(--v3-border)]">
          <div className="w-14 h-14 rounded-full bg-[rgba(0,209,193,0.12)] flex items-center justify-center text-3xl">👤</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#00D1C1] text-[10px] font-bold tracking-[1px] uppercase">🔒 HIPAA PROTECTED</span>
            </div>
            <div className="text-2xl font-semibold">{p.firstName} {p.lastName}</div>
            <div className="flex gap-3 mt-1 text-sm flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-[rgba(0,209,193,0.08)] text-[#00D1C1] font-semibold">{p.status.toUpperCase()}</span>
              <span className="text-[var(--v3-text-tertiary)]">ID: {p.id}</span>
              <span className="text-[var(--v3-text-tertiary)]">MRN: {p.mrn}</span>
              <span className="text-[var(--v3-text-tertiary)]">DOB: {p.dob} (Age {p.age})</span>
            </div>
            <div className="text-xs text-[var(--v3-text-tertiary)] mt-0.5">{p.address} · {p.phone}</div>
          </div>
        </div>

        {/* Tabs with v3-tab + data-active (V3 reskin pattern, now 5 rich tabs) */}
        <div className="flex gap-1 border-b border-[var(--v3-border)] mt-4 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="v3-tab"
              data-active={activeTab === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content with V3SubView transition (0.5s CSS animation) */}
        <V3SubView viewKey={activeTab}>
          {renderTabContent()}
        </V3SubView>

        <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.06)] text-[10px] text-[var(--v3-text-tertiary)]">
          V3PatientDetailPreview • claudex3-enriched (real data shapes: Diagnosis[], Medication[], CareEpisode[], InsurancePlan[]) • Visual layer only — matches PDF patient detail + production PatientProfile fidelity.
        </div>
      </div>
  );
}
