// V3PolicyLibraryPreview.tsx — V3 Veil Glass Policy Library
// Visual layer only. Real shapes from LibraryPage + frameworkSeed + achcSurveyProjection.

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

interface Policy {
  id: string; title: string; domain: string; subdomain: string;
  status: 'active' | 'under-review' | 'draft' | 'expired';
  lastReviewed: string; nextReview: string; achcMapped: boolean;
  formCount: number; evidenceCount: number;
}

const POLICIES: Policy[] = [
  { id: 'QA-PG-001', title: 'Quality Assessment & Performance Improvement (QAPI)', domain: 'Clinical', subdomain: 'Quality', status: 'active', lastReviewed: '2026-03-01', nextReview: '2026-09-01', achcMapped: true, formCount: 4, evidenceCount: 12 },
  { id: 'GV-GB-001', title: 'Governing Body Organization & Administration', domain: 'Governance', subdomain: 'Corporate', status: 'active', lastReviewed: '2026-01-15', nextReview: '2027-01-15', achcMapped: true, formCount: 8, evidenceCount: 22 },
  { id: 'CL-WP-025', title: 'Comprehensive Patient Assessment', domain: 'Clinical', subdomain: 'Assessment', status: 'active', lastReviewed: '2026-04-10', nextReview: '2026-10-10', achcMapped: true, formCount: 3, evidenceCount: 8 },
  { id: 'HR-PG-003', title: 'Employee Health & Safety Program', domain: 'Human Resources', subdomain: 'Safety', status: 'under-review', lastReviewed: '2025-12-01', nextReview: '2026-06-01', achcMapped: false, formCount: 5, evidenceCount: 3 },
  { id: 'SF-WP-001', title: 'Emergency Preparedness Plan', domain: 'Safety', subdomain: 'Emergency', status: 'active', lastReviewed: '2026-02-20', nextReview: '2026-08-20', achcMapped: true, formCount: 6, evidenceCount: 15 },
  { id: 'CC-WP-022', title: 'Compliance & Ethics Program', domain: 'Compliance', subdomain: 'Ethics', status: 'active', lastReviewed: '2026-05-01', nextReview: '2026-11-01', achcMapped: true, formCount: 2, evidenceCount: 6 },
  { id: 'HP-PG-005', title: 'HIPAA Privacy & Security Policy', domain: 'Compliance', subdomain: 'Privacy', status: 'active', lastReviewed: '2026-03-15', nextReview: '2026-09-15', achcMapped: true, formCount: 3, evidenceCount: 9 },
  { id: 'IT-WP-021', title: 'Information Technology Security', domain: 'IT', subdomain: 'Security', status: 'draft', lastReviewed: '2025-11-01', nextReview: '2026-05-30', achcMapped: false, formCount: 1, evidenceCount: 0 },
  { id: 'DM-WP-018', title: 'Clinical Records Management', domain: 'Data', subdomain: 'Records', status: 'active', lastReviewed: '2026-04-01', nextReview: '2026-10-01', achcMapped: true, formCount: 2, evidenceCount: 5 },
];

type ViewType = 'grid' | 'list';

const statusStyle = (s: Policy['status']) => {
  const m = {
    'active': { bg: 'rgba(0, 209, 193, 0.12)', color: V3.tealLight },
    'under-review': { bg: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24' },
    'draft': { bg: 'rgba(100, 116, 139, 0.12)', color: V3.textTertiary },
    'expired': { bg: 'rgba(248, 113, 113, 0.12)', color: '#F87171' },
  };
  return m[s];
};

export default function V3PolicyLibraryPreview() {
  const [view, setView] = useState<ViewType>('grid');
  const [search, setSearch] = useState('');
  const [filterDomain, setFilterDomain] = useState<string | null>(null);

  const domains = Array.from(new Set(POLICIES.map(p => p.domain)));
  const filtered = POLICIES.filter(p =>
    (!filterDomain || p.domain === filterDomain) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>Policy Library</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text" placeholder="Search policies..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', fontSize: 13, background: V3.glass2, border: `1px solid ${V3.borderDefault}`, borderRadius: 8, color: V3.textPrimary, outline: 'none', width: 220 }}
          />
          <div style={{ display: 'flex', gap: 2, background: V3.glass2, borderRadius: 6, padding: 2 }}>
            {(['grid', 'list'] as ViewType[]).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '5px 10px', fontSize: 11, borderRadius: 4, border: 'none', cursor: 'pointer',
                background: view === v ? V3.teal : 'transparent', color: view === v ? '#FFF' : V3.textTertiary,
              }}>{v === 'grid' ? '▦' : '☰'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Domain filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterDomain(null)} style={{
          padding: '5px 14px', fontSize: 12, borderRadius: 20, border: 'none', cursor: 'pointer',
          background: !filterDomain ? V3.teal : V3.glass2, color: !filterDomain ? '#FFF' : V3.textTertiary,
        }}>All ({POLICIES.length})</button>
        {domains.map(d => (
          <button key={d} onClick={() => setFilterDomain(d)} style={{
            padding: '5px 14px', fontSize: 12, borderRadius: 20, border: 'none', cursor: 'pointer',
            background: filterDomain === d ? V3.teal : V3.glass2, color: filterDomain === d ? '#FFF' : V3.textTertiary,
          }}>{d} ({POLICIES.filter(p => p.domain === d).length})</button>
        ))}
      </div>

      {/* Policy cards */}
      <div key={view} className="v3-subview-animate" style={{
        display: view === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: view === 'grid' ? 'repeat(3, 1fr)' : undefined,
        flexDirection: view === 'list' ? 'column' : undefined,
        gap: view === 'grid' ? 14 : 6,
      }}>
        {filtered.map(policy => {
          const st = statusStyle(policy.status);
          return view === 'grid' ? (
            <div key={policy.id} style={{
              padding: 20, borderRadius: 12, cursor: 'pointer',
              background: V3.glass2, border: `1px solid ${V3.borderDefault}`,
              transition: 'all 0.33s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: V3.tealLight, fontWeight: 600 }}>{policy.id}</span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: st.bg, color: st.color }}>{policy.status.toUpperCase()}</span>
              </div>
              <h3 style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.4 }}>{policy.title}</h3>
              <div style={{ color: V3.textTertiary, fontSize: 11, marginBottom: 12 }}>{policy.domain} → {policy.subdomain}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: V3.textTertiary, fontSize: 11 }}>
                <span>{policy.formCount} forms · {policy.evidenceCount} evidence</span>
                {policy.achcMapped && <span style={{ color: V3.tealLight }}>ACHC ✓</span>}
              </div>
            </div>
          ) : (
            <div key={policy.id} className="v3-invisible-glare" style={{
              display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 100px',
              gap: 8, padding: '14px 16px', alignItems: 'center', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 12, color: V3.tealLight, fontWeight: 600 }}>{policy.id}</span>
              <div style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{policy.title}</div>
              <span style={{ color: V3.textSecondary, fontSize: 12 }}>{policy.domain}</span>
              <span style={{ color: V3.textTertiary, fontSize: 12 }}>Review: {policy.nextReview}</span>
              <span style={{ color: V3.textTertiary, fontSize: 12 }}>{policy.formCount}F · {policy.evidenceCount}E</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: st.bg, color: st.color, textAlign: 'center' }}>{policy.status.toUpperCase()}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real Library uses LibraryPage, frameworkSeed.generated, achcSurveyProjection.generated, and policyStore.
      </div>
    </div>
  );
}
