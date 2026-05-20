// V3ReportsPreview.tsx — V3 Veil Glass CES Reports & Analytics
// Visual layer only. Based on CesReports + ExecutiveReports components.

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

type ReportType = 'sprint' | 'compliance' | 'evidence' | 'audit-trail';

const SPRINT_HISTORY = [
  { label: 'Sprint 9', period: 'May 12–26', tasks: 48, completed: 35, pct: 72, blockers: 2, status: 'active' },
  { label: 'Sprint 8', period: 'Apr 28–May 11', tasks: 42, completed: 40, pct: 95, blockers: 0, status: 'closed' },
  { label: 'Sprint 7', period: 'Apr 14–27', tasks: 38, completed: 38, pct: 100, blockers: 0, status: 'closed' },
  { label: 'Sprint 6', period: 'Mar 31–Apr 13', tasks: 45, completed: 41, pct: 91, blockers: 1, status: 'closed' },
  { label: 'Sprint 5', period: 'Mar 17–30', tasks: 36, completed: 34, pct: 94, blockers: 0, status: 'closed' },
];

export default function V3ReportsPreview() {
  const [reportType, setReportType] = useState<ReportType>('sprint');

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>Reports & Analytics</h1>
        <button style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8, background: V3.teal, color: '#FFF', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Export PDF</button>
      </div>

      <div style={{ display: 'flex', gap: 4, background: V3.glass2, borderRadius: 8, padding: 3, marginBottom: 24, width: 'fit-content' }}>
        {(['sprint', 'compliance', 'evidence', 'audit-trail'] as ReportType[]).map(r => (
          <button key={r} onClick={() => setReportType(r)} style={{
            padding: '6px 14px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
            background: reportType === r ? V3.teal : 'transparent',
            color: reportType === r ? '#FFF' : V3.textTertiary,
            fontWeight: reportType === r ? 600 : 400, textTransform: 'capitalize',
          }}>{r.replace('-', ' ')}</button>
        ))}
      </div>

      <div key={reportType} className="v3-subview-animate">
        {/* Sprint trend chart placeholder */}
        <div className="v3-invisible-glare" style={{ padding: 24, marginBottom: 20, minHeight: 180, display: 'flex', alignItems: 'flex-end', gap: 12, justifyContent: 'center' }}>
          {SPRINT_HISTORY.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ color: V3.textTertiary, fontSize: 10 }}>{s.pct}%</span>
              <div style={{
                width: 40, height: `${s.pct * 1.2}px`, borderRadius: '6px 6px 0 0',
                background: s.status === 'active'
                  ? `linear-gradient(180deg, ${V3.tealLight}, ${V3.teal})`
                  : 'rgba(255,255,255,0.06)',
                transition: 'height 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
              <span style={{ color: V3.textTertiary, fontSize: 10 }}>{s.label.replace('Sprint ', 'S')}</span>
            </div>
          ))}
        </div>

        {/* Sprint table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 80px 80px 80px 80px 80px', gap: 8, padding: '8px 16px', color: V3.textTertiary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Sprint</span><span>Period</span><span>Tasks</span><span>Done</span><span>Rate</span><span>Blockers</span><span>Status</span>
          </div>
          {SPRINT_HISTORY.map((s, i) => (
            <div key={i} className="v3-invisible-glare" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 80px 80px 80px 80px 80px', gap: 8, padding: '14px 16px', alignItems: 'center' }}>
              <span style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: V3.textSecondary, fontSize: 12 }}>{s.period}</span>
              <span style={{ color: V3.textSecondary, fontSize: 13 }}>{s.tasks}</span>
              <span style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{s.completed}</span>
              <span style={{ color: s.pct >= 90 ? V3.tealLight : '#FBBF24', fontSize: 13, fontWeight: 600 }}>{s.pct}%</span>
              <span style={{ color: s.blockers > 0 ? '#F87171' : V3.textTertiary, fontSize: 13 }}>{s.blockers}</span>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4, textAlign: 'center',
                background: s.status === 'active' ? 'rgba(0, 209, 193, 0.12)' : 'rgba(100, 116, 139, 0.08)',
                color: s.status === 'active' ? V3.tealLight : V3.textTertiary,
              }}>{s.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real reports use CesReports, ExecutiveReports, sprint metrics from pmViewSprintStore, and evidence analytics.
      </div>
    </div>
  );
}
