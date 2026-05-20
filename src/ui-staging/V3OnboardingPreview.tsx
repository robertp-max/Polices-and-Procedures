// V3OnboardingPreview.tsx — V3 Veil Glass Onboarding V2 Dashboard
// Visual layer only. Real shapes from OnboardingV2 (KpiTile, StatusPill, GateTile, UnitDrawer, AuditTimeline).

import { useState } from 'react';

const V3 = {
  glass2: 'rgba(255, 255, 255, 0.04)',
  teal: '#007970',
  tealLight: '#00D1C1',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: 'rgba(255, 255, 255, 0.33)',
} as const;

type GateStatus = 'passed' | 'in-progress' | 'locked' | 'failed';
interface OnboardingUnit { id: string; name: string; role: string; startDate: string; gate: number; gateStatus: GateStatus; completionPct: number; formsCompleted: number; formsTotal: number; signaturesComplete: boolean; }
interface Gate { number: number; label: string; description: string; requiredForms: number; requiredSignatures: number; }

const GATES: Gate[] = [
  { number: 1, label: 'Pre-Employment', description: 'Background check, offer letter, employment eligibility', requiredForms: 5, requiredSignatures: 3 },
  { number: 2, label: 'Orientation', description: 'Company orientation, policy acknowledgments, safety training', requiredForms: 12, requiredSignatures: 8 },
  { number: 3, label: 'Competency Assessment', description: 'Skills checkoff, clinical competency, OSHA/HIPAA certification', requiredForms: 8, requiredSignatures: 6 },
  { number: 4, label: 'Field Ready', description: 'Supervised visit, final sign-off, system access activation', requiredForms: 4, requiredSignatures: 4 },
];

const UNITS: OnboardingUnit[] = [
  { id: 'OB-001', name: 'Angela Torres', role: 'Home Health Aide', startDate: '2026-05-13', gate: 3, gateStatus: 'in-progress', completionPct: 68, formsCompleted: 17, formsTotal: 29, signaturesComplete: false },
  { id: 'OB-002', name: 'Kevin Pham', role: 'Registered Nurse', startDate: '2026-05-06', gate: 4, gateStatus: 'in-progress', completionPct: 89, formsCompleted: 26, formsTotal: 29, signaturesComplete: false },
  { id: 'OB-003', name: 'Destiny Williams', role: 'Physical Therapist', startDate: '2026-05-13', gate: 2, gateStatus: 'in-progress', completionPct: 41, formsCompleted: 12, formsTotal: 29, signaturesComplete: false },
  { id: 'OB-004', name: 'Roberto Garcia', role: 'Home Health Aide', startDate: '2026-04-29', gate: 4, gateStatus: 'passed', completionPct: 100, formsCompleted: 29, formsTotal: 29, signaturesComplete: true },
  { id: 'OB-005', name: 'Sarah Kim', role: 'Licensed Vocational Nurse', startDate: '2026-05-20', gate: 1, gateStatus: 'in-progress', completionPct: 12, formsCompleted: 3, formsTotal: 29, signaturesComplete: false },
];

type ViewTab = 'dashboard' | 'activation' | 'audit-readiness';

const gateColor = (s: GateStatus) => {
  const m = { 'passed': '#4ADE80', 'in-progress': V3.tealLight, 'locked': V3.textTertiary, 'failed': '#F87171' };
  return m[s];
};

export default function V3OnboardingPreview() {
  const [activeView, setActiveView] = useState<ViewTab>('dashboard');

  const activeCount = UNITS.filter(u => u.completionPct < 100).length;
  const completedCount = UNITS.filter(u => u.completionPct === 100).length;
  const avgCompletion = Math.round(UNITS.reduce((s, u) => s + u.completionPct, 0) / UNITS.length);

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>Onboarding & Activation</h1>
          <p style={{ color: V3.textSecondary, fontSize: 13, margin: '4px 0 0' }}>{UNITS.length} employees in pipeline · Gate-based compliance activation</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: V3.glass2, borderRadius: 8, padding: 3 }}>
          {(['dashboard', 'activation', 'audit-readiness'] as ViewTab[]).map(v => (
            <button key={v} onClick={() => setActiveView(v)} style={{
              padding: '6px 14px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: activeView === v ? V3.teal : 'transparent',
              color: activeView === v ? '#FFF' : V3.textTertiary,
              fontWeight: activeView === v ? 600 : 400, textTransform: 'capitalize',
            }}>{v.replace('-', ' ')}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'In Pipeline', value: activeCount, color: V3.tealLight },
          { label: 'Completed', value: completedCount, color: '#4ADE80' },
          { label: 'Avg Completion', value: `${avgCompletion}%`, color: V3.textPrimary },
          { label: 'Signatures Pending', value: UNITS.filter(u => !u.signaturesComplete).length, color: '#FBBF24' },
        ].map((k, i) => (
          <div key={i} className="v3-invisible-glare" style={{ padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div key={activeView} className="v3-subview-animate">
        {/* Gate pipeline visualization */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {GATES.map(gate => {
            const unitsAtGate = UNITS.filter(u => u.gate === gate.number);
            return (
              <div key={gate.number} style={{ flex: 1, padding: 16, borderRadius: 12, background: V3.glass2, border: `1px solid ${V3.borderDefault}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: V3.tealLight, fontWeight: 600 }}>GATE {gate.number}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: V3.glass2, color: V3.textTertiary }}>{unitsAtGate.length}</span>
                </div>
                <div style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{gate.label}</div>
                <div style={{ color: V3.textTertiary, fontSize: 11, lineHeight: 1.4 }}>{gate.description}</div>
                <div style={{ color: V3.textTertiary, fontSize: 10, marginTop: 8 }}>{gate.requiredForms}F · {gate.requiredSignatures}S required</div>
              </div>
            );
          })}
        </div>

        {/* Employee list */}
        <h2 style={{ color: V3.textTertiary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Onboarding Units</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {UNITS.map(unit => (
            <div key={unit.id} className="v3-invisible-glare" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
              <div style={{ flex: 2 }}>
                <div style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500 }}>{unit.name}</div>
                <div style={{ color: V3.textTertiary, fontSize: 12, marginTop: 2 }}>{unit.role} · Started {unit.startDate}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 4, flex: 1, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${unit.completionPct}%`, background: unit.completionPct === 100 ? '#4ADE80' : V3.tealLight }} />
                </div>
                <span style={{ color: V3.textSecondary, fontSize: 12, fontWeight: 500, minWidth: 36, textAlign: 'right' }}>{unit.completionPct}%</span>
              </div>
              <div style={{ width: 80, textAlign: 'center' }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: `${gateColor(unit.gateStatus)}15`, color: gateColor(unit.gateStatus), fontWeight: 500 }}>
                  Gate {unit.gate}
                </span>
              </div>
              <div style={{ width: 100, textAlign: 'center', color: V3.textTertiary, fontSize: 12 }}>{unit.formsCompleted}/{unit.formsTotal} forms</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real Onboarding V2 uses OnboardingV2Layout, KpiTile, StatusPill, GateTile, UnitDrawer, AuditTimeline, reconciliation preview, and hash-chain verification.
      </div>
    </div>
  );
}
