// V3CesDashboardPreview.tsx — V3 Veil Glass CES Dashboard
// Visual layer only. Replaces CES parallel navy/orange theme with V3 teal system.
// Real data shapes from CesDashboardPage + useComplianceExecution.

import { useState } from 'react';

const V3 = {
  glass1: 'transparent',
  glass2: 'rgba(255, 255, 255, 0.04)',
  teal: '#007970',
  tealLight: '#00D1C1',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: 'rgba(255, 255, 255, 0.33)',
} as const;

type SprintMetrics = {
  label: string;
  startDate: string;
  endDate: string;
  completionPct: number;
  totalTasks: number;
  completedTasks: number;
  blockers: number;
  overdueCount: number;
  auditReadiness: number;
};

type ExecutionUnit = {
  id: string;
  eventTitle: string;
  domain: string;
  tasksTotal: number;
  tasksDone: number;
  evidenceCount: number;
  signaturesPending: number;
  status: 'on-track' | 'at-risk' | 'blocked' | 'completed';
};

const SPRINT: SprintMetrics = {
  label: 'Sprint 9 — Q2 Regulatory',
  startDate: '2026-05-12',
  endDate: '2026-05-26',
  completionPct: 72,
  totalTasks: 48,
  completedTasks: 35,
  blockers: 2,
  overdueCount: 3,
  auditReadiness: 88,
};

const EXECUTION_UNITS: ExecutionUnit[] = [
  { id: 'EU-1', eventTitle: 'QAPI Quarterly Meeting', domain: 'Clinical', tasksTotal: 12, tasksDone: 9, evidenceCount: 7, signaturesPending: 2, status: 'on-track' },
  { id: 'EU-2', eventTitle: 'Fire Drill Log Upload', domain: 'Safety', tasksTotal: 6, tasksDone: 6, evidenceCount: 6, signaturesPending: 0, status: 'completed' },
  { id: 'EU-3', eventTitle: 'Annual Policy Review', domain: 'Compliance', tasksTotal: 18, tasksDone: 10, evidenceCount: 5, signaturesPending: 4, status: 'at-risk' },
  { id: 'EU-4', eventTitle: 'Infection Control Update', domain: 'Clinical', tasksTotal: 8, tasksDone: 6, evidenceCount: 4, signaturesPending: 1, status: 'on-track' },
  { id: 'EU-5', eventTitle: 'HIPAA Annual Training', domain: 'Compliance', tasksTotal: 4, tasksDone: 4, evidenceCount: 4, signaturesPending: 0, status: 'completed' },
  { id: 'EU-6', eventTitle: 'Emergency Plan Review', domain: 'Safety', tasksTotal: 10, tasksDone: 3, evidenceCount: 1, signaturesPending: 3, status: 'blocked' },
];

const statusColor = (s: ExecutionUnit['status']) => {
  switch (s) {
    case 'on-track': return V3.tealLight;
    case 'completed': return '#4ADE80';
    case 'at-risk': return '#FBBF24';
    case 'blocked': return '#F87171';
  }
};

type RoleView = 'compliance-officer' | 'don' | 'administrator';

export default function V3CesDashboardPreview() {
  const [role, setRole] = useState<RoleView>('compliance-officer');

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>Compliance Execution System</h1>
          <p style={{ color: V3.textSecondary, fontSize: 13, margin: '4px 0 0' }}>{SPRINT.label} · {SPRINT.startDate} → {SPRINT.endDate}</p>
        </div>
        {/* Role Switcher */}
        <div style={{ display: 'flex', gap: 4, background: V3.glass2, borderRadius: 8, padding: 3 }}>
          {(['compliance-officer', 'don', 'administrator'] as RoleView[]).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: '6px 14px', fontSize: 12, fontWeight: role === r ? 600 : 400, borderRadius: 6,
              background: role === r ? V3.teal : 'transparent',
              color: role === r ? '#FFFFFF' : V3.textTertiary,
              border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', textTransform: 'capitalize',
            }}>{r.replace('-', ' ')}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Sprint Progress', value: `${SPRINT.completionPct}%`, sub: `${SPRINT.completedTasks}/${SPRINT.totalTasks} tasks` },
          { label: 'Audit Readiness', value: `${SPRINT.auditReadiness}%`, sub: 'Composite score' },
          { label: 'Blockers', value: SPRINT.blockers, sub: 'Requires attention' },
          { label: 'Overdue', value: SPRINT.overdueCount, sub: 'Past deadline' },
          { label: 'Active Units', value: EXECUTION_UNITS.filter(u => u.status !== 'completed').length, sub: 'In execution' },
        ].map((kpi, i) => (
          <div key={i} className="v3-invisible-glare" style={{ padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: V3.textPrimary }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
            <div style={{ fontSize: 11, color: V3.textSecondary, marginTop: 2 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Sprint progress bar */}
      <div className="v3-invisible-glare" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: V3.textSecondary, fontSize: 12 }}>Sprint Completion</span>
          <span style={{ color: V3.tealLight, fontSize: 13, fontWeight: 600 }}>{SPRINT.completionPct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', borderRadius: 3, width: `${SPRINT.completionPct}%`, background: `linear-gradient(90deg, ${V3.teal}, ${V3.tealLight})`, transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        </div>
      </div>

      {/* Execution Units table */}
      <div>
        <h2 style={{ color: V3.textTertiary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Execution Units</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: 8, padding: '8px 16px', color: V3.textTertiary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Event</span><span>Domain</span><span>Progress</span><span>Evidence</span><span>Signatures</span><span>Status</span>
          </div>
          {EXECUTION_UNITS.map(unit => (
            <div key={unit.id} className="v3-invisible-glare" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: 8, padding: '14px 16px', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{unit.eventTitle}</div>
                <div style={{ color: V3.textTertiary, fontSize: 11 }}>{unit.id}</div>
              </div>
              <span style={{ color: V3.textSecondary, fontSize: 12 }}>{unit.domain}</span>
              <div>
                <div style={{ fontSize: 13, color: V3.textPrimary, fontWeight: 500 }}>{unit.tasksDone}/{unit.tasksTotal}</div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginTop: 4, width: 60 }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${(unit.tasksDone / unit.tasksTotal) * 100}%`, background: V3.tealLight }} />
                </div>
              </div>
              <span style={{ color: V3.textSecondary, fontSize: 13 }}>{unit.evidenceCount} files</span>
              <span style={{ color: unit.signaturesPending > 0 ? '#FBBF24' : V3.tealLight, fontSize: 13 }}>
                {unit.signaturesPending > 0 ? `${unit.signaturesPending} pending` : '✓ Complete'}
              </span>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 500, textAlign: 'center',
                background: `${statusColor(unit.status)}15`,
                color: statusColor(unit.status),
              }}>{unit.status.replace('-', ' ').toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real CES uses useComplianceExecution, regulatoryExecutionStore, CesRoleReviewSwitcher, WorkflowExecutionPanel, and SprintTaskPanel.
      </div>
    </div>
  );
}
