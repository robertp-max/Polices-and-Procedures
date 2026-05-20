// V3PolicyDetailPreview.tsx — V3 Veil Glass Policy Detail View
// Visual layer only. Based on SharedPolicyDetailView + QA-PG-001 normalization.

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

const POLICY = {
  id: 'QA-PG-001',
  title: 'Quality Assessment & Performance Improvement (QAPI)',
  domain: 'Clinical',
  subdomain: 'Quality Assurance',
  status: 'Active',
  version: '3.2',
  effectiveDate: '2026-03-01',
  nextReview: '2026-09-01',
  approvedBy: 'Dr. R. Patel, Medical Director',
  achcStandards: ['ACHC-QI-1', 'ACHC-QI-2', 'ACHC-QI-3'],
  cmsConditions: ['CoP §484.65'],
  overview: 'Care Indeed maintains a comprehensive Quality Assessment and Performance Improvement (QAPI) program that is agency-wide, data-driven, and ongoing. The program integrates all quality and performance improvement activities across all services. The Governing Body ensures QAPI program oversight, resource allocation, and corrective action implementation.',
  statements: [
    'The agency shall maintain a QAPI program that measures, analyzes, and tracks quality indicators.',
    'The program shall include objectives for improving patient safety and reducing medical errors.',
    'Data collection shall address all conditions of participation and ACHC standards.',
    'Performance improvement projects shall be proportional to the scope and complexity of services.',
  ],
  procedures: [
    { code: 'QA-WP-11', title: 'Quarterly QAPI Meeting Preparation', owner: 'Quality Director' },
    { code: 'QA-WP-12', title: 'OAPS-Layer KPI Analysis', owner: 'Quality Analyst' },
    { code: 'QA-WP-14', title: 'Quality Indicator Tracking', owner: 'Quality Director' },
    { code: 'QA-WP-15', title: 'Trend Analysis & Benchmarking', owner: 'Quality Analyst' },
    { code: 'QA-WP-04', title: 'Plan-for-Improvement (PIP) Execution', owner: 'Clinical Lead' },
  ],
  appendices: [
    { id: 'A', title: 'QAPI Committee Charter', type: 'form' },
    { id: 'B', title: 'Quality Indicator Dashboard Template', type: 'template' },
    { id: 'C', title: 'PIP Tracking Worksheet', type: 'form' },
    { id: 'D', title: 'ACHC Standard Crosswalk', type: 'reference' },
  ],
};

const TABS = ['Overview', 'Policy Statements', 'Procedures', 'Appendices'] as const;
type Tab = typeof TABS[number];

export default function V3PolicyDetailPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      {/* Breadcrumb */}
      <div style={{ color: V3.textTertiary, fontSize: 12, marginBottom: 16 }}>
        <span style={{ cursor: 'pointer' }}>Library</span> <span style={{ margin: '0 6px' }}>→</span>
        <span style={{ cursor: 'pointer' }}>{POLICY.domain}</span> <span style={{ margin: '0 6px' }}>→</span>
        <span style={{ color: V3.textSecondary }}>{POLICY.id}</span>
      </div>

      {/* Policy header */}
      <div className="v3-invisible-glare" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: V3.tealLight, fontWeight: 600 }}>{POLICY.id}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(0, 209, 193, 0.12)', color: V3.tealLight }}>{POLICY.status}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: V3.glass2, color: V3.textTertiary }}>v{POLICY.version}</span>
            </div>
            <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>{POLICY.title}</h1>
            <p style={{ color: V3.textTertiary, fontSize: 12, margin: '6px 0 0' }}>
              {POLICY.domain} → {POLICY.subdomain} · Approved by {POLICY.approvedBy}
            </p>
          </div>
        </div>
        {/* Metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20, paddingTop: 16, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
          <div>
            <div style={{ fontSize: 11, color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Effective</div>
            <div style={{ fontSize: 14, color: V3.textPrimary, marginTop: 4 }}>{POLICY.effectiveDate}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next Review</div>
            <div style={{ fontSize: 14, color: V3.textPrimary, marginTop: 4 }}>{POLICY.nextReview}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ACHC Standards</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {POLICY.achcStandards.map(s => (
                <span key={s} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: V3.glass2, color: V3.tealLight }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CMS CoP</div>
            <div style={{ fontSize: 14, color: V3.textPrimary, marginTop: 4 }}>{POLICY.cmsConditions.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: `1px solid ${V3.borderDefault}` }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? V3.tealLight : V3.textTertiary,
            background: 'transparent', border: 'none',
            borderBottom: activeTab === tab ? `2px solid ${V3.tealLight}` : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>{tab}</button>
        ))}
      </div>

      <div key={activeTab} className="v3-subview-animate">
        {activeTab === 'Overview' && (
          <div className="v3-invisible-glare" style={{ padding: 24 }}>
            <h3 style={{ color: V3.textTertiary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Policy Overview</h3>
            <p style={{ color: V3.textSecondary, fontSize: 14, lineHeight: 1.7 }}>{POLICY.overview}</p>
          </div>
        )}
        {activeTab === 'Policy Statements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {POLICY.statements.map((s, i) => (
              <div key={i} className="v3-invisible-glare" style={{ padding: 16, borderLeft: `3px solid ${V3.tealLight}` }}>
                <span style={{ color: V3.textTertiary, fontSize: 11, fontWeight: 600, marginRight: 8 }}>§{i + 1}</span>
                <span style={{ color: V3.textSecondary, fontSize: 14 }}>{s}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Procedures' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {POLICY.procedures.map(proc => (
              <div key={proc.code} className="v3-invisible-glare" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontSize: 12, color: V3.tealLight, fontWeight: 600, marginRight: 10 }}>{proc.code}</span>
                  <span style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500 }}>{proc.title}</span>
                </div>
                <span style={{ color: V3.textTertiary, fontSize: 12 }}>{proc.owner}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Appendices' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {POLICY.appendices.map(app => (
              <div key={app.id} style={{
                padding: 18, borderRadius: 12, background: V3.glass2, border: `1px solid ${V3.borderDefault}`, cursor: 'pointer',
                transition: 'all 0.33s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: V3.tealLight, fontWeight: 600 }}>Appendix {app.id}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: V3.glass2, color: V3.textTertiary }}>{app.type}</span>
                </div>
                <div style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500 }}>{app.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real policy detail uses PolicyDetailPage → SharedPolicyDetailView (normalized QA-PG-001), policyStore, and PolicyLibraryDocumentView.
      </div>
    </div>
  );
}
