// V3TaxonomyPreview.tsx — V3 Veil Glass Taxonomy Browser
// Visual layer only. Real shapes from TaxonomyPage + frameworkSeed + REGULATORY_ITEMS.

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

interface TaxonomyDomain {
  id: string; name: string; code: string; policyCount: number; formCount: number;
  subdomains: { id: string; name: string; policyCount: number; }[];
}

const DOMAINS: TaxonomyDomain[] = [
  { id: 'D-01', name: 'Clinical Operations', code: 'CL', policyCount: 28, formCount: 45,
    subdomains: [
      { id: 'SD-01', name: 'Patient Assessment', policyCount: 8 },
      { id: 'SD-02', name: 'Care Planning', policyCount: 6 },
      { id: 'SD-03', name: 'Infection Control', policyCount: 5 },
      { id: 'SD-04', name: 'Medication Management', policyCount: 4 },
      { id: 'SD-05', name: 'Quality Improvement', policyCount: 5 },
    ]},
  { id: 'D-02', name: 'Governance & Administration', code: 'GV', policyCount: 12, formCount: 18,
    subdomains: [
      { id: 'SD-06', name: 'Corporate Governance', policyCount: 4 },
      { id: 'SD-07', name: 'Administrative Operations', policyCount: 5 },
      { id: 'SD-08', name: 'Strategic Planning', policyCount: 3 },
    ]},
  { id: 'D-03', name: 'Compliance & Ethics', code: 'CC', policyCount: 15, formCount: 22,
    subdomains: [
      { id: 'SD-09', name: 'Regulatory Compliance', policyCount: 6 },
      { id: 'SD-10', name: 'HIPAA / Privacy', policyCount: 5 },
      { id: 'SD-11', name: 'Fraud & Abuse Prevention', policyCount: 4 },
    ]},
  { id: 'D-04', name: 'Human Resources', code: 'HR', policyCount: 18, formCount: 32,
    subdomains: [
      { id: 'SD-12', name: 'Recruitment & Onboarding', policyCount: 5 },
      { id: 'SD-13', name: 'Competency & Training', policyCount: 6 },
      { id: 'SD-14', name: 'Employee Relations', policyCount: 4 },
      { id: 'SD-15', name: 'Safety & Workers Comp', policyCount: 3 },
    ]},
  { id: 'D-05', name: 'Safety & Emergency', code: 'SF', policyCount: 10, formCount: 16,
    subdomains: [
      { id: 'SD-16', name: 'Emergency Preparedness', policyCount: 4 },
      { id: 'SD-17', name: 'Fire Safety', policyCount: 3 },
      { id: 'SD-18', name: 'Environmental Safety', policyCount: 3 },
    ]},
  { id: 'D-06', name: 'Data & Information', code: 'DM', policyCount: 8, formCount: 10,
    subdomains: [
      { id: 'SD-19', name: 'Records Management', policyCount: 3 },
      { id: 'SD-20', name: 'IT Security', policyCount: 3 },
      { id: 'SD-21', name: 'Data Analytics', policyCount: 2 },
    ]},
];

export default function V3TaxonomyPreview() {
  const [expandedDomain, setExpandedDomain] = useState<string | null>('D-01');
  const [search, setSearch] = useState('');

  const totalPolicies = DOMAINS.reduce((s, d) => s + d.policyCount, 0);
  const totalForms = DOMAINS.reduce((s, d) => s + d.formCount, 0);

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>Regulatory Taxonomy</h1>
          <p style={{ color: V3.textSecondary, fontSize: 13, margin: '4px 0 0' }}>{DOMAINS.length} domains · {totalPolicies} policies · {totalForms} forms</p>
        </div>
        <input type="text" placeholder="Search domains..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 14px', fontSize: 13, background: V3.glass2, border: `1px solid ${V3.borderDefault}`, borderRadius: 8, color: V3.textPrimary, outline: 'none', width: 240 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DOMAINS.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase())).map(domain => (
          <div key={domain.id}>
            <div
              onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
              className="v3-invisible-glare"
              style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16, transform: expandedDomain === domain.id ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s ease', display: 'inline-block', color: V3.textTertiary }}>▸</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: V3.tealLight, fontWeight: 600 }}>{domain.code}</span>
                    <span style={{ color: V3.textPrimary, fontSize: 15, fontWeight: 500 }}>{domain.name}</span>
                  </div>
                  <div style={{ color: V3.textTertiary, fontSize: 12, marginTop: 2 }}>
                    {domain.subdomains.length} subdomains · {domain.policyCount} policies · {domain.formCount} forms
                  </div>
                </div>
              </div>
            </div>

            {expandedDomain === domain.id && (
              <div style={{ marginLeft: 44, display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8 }}>
                {domain.subdomains.map(sub => (
                  <div key={sub.id} className="v3-invisible-glare" style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: V3.textSecondary, fontSize: 13 }}>{sub.name}</span>
                    <span style={{ color: V3.textTertiary, fontSize: 12 }}>{sub.policyCount} policies</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real Taxonomy uses TaxonomyPage, frameworkSeed.generated, REGULATORY_ITEMS, and ACHC alignment mapping.
      </div>
    </div>
  );
}
