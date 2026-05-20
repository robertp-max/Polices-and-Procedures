// V3EvidenceCenterPreview.tsx — V3 Veil Glass Evidence Center
// Visual layer only. Real shapes from EvidenceCenterPage + CesEvidenceHierarchyPanel.

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

type EvidenceStatus = 'verified' | 'pending-review' | 'missing' | 'expired';
type EvidenceMode = 'hierarchy' | 'timeline' | 'audit-ready';

interface EvidenceItem {
  id: string;
  name: string;
  policyId: string;
  policyTitle: string;
  eventId: string;
  eventTitle: string;
  type: 'signed-form' | 'uploaded-doc' | 'auto-generated' | 'photo-evidence';
  status: EvidenceStatus;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  mimeType: string;
  signatureCount: number;
  auditTrailHash: string | null;
}

const EVIDENCE: EvidenceItem[] = [
  { id: 'EV-001', name: 'QAPI Meeting Minutes — Q2 2026', policyId: 'QA-WP-11', policyTitle: 'QAPI Program', eventId: 'RE-001', eventTitle: 'QAPI Quarterly Meeting', type: 'signed-form', status: 'verified', uploadedBy: 'J. Smith', uploadedAt: '2026-05-18', fileSize: '2.4 MB', mimeType: 'application/pdf', signatureCount: 3, auditTrailHash: 'sha256:a7f3c2...' },
  { id: 'EV-002', name: 'Fire Drill Documentation — May 2026', policyId: 'SF-WP-01', policyTitle: 'Emergency Preparedness', eventId: 'RE-002', eventTitle: 'Fire Drill Log Upload', type: 'uploaded-doc', status: 'verified', uploadedBy: 'M. Doe', uploadedAt: '2026-05-16', fileSize: '1.1 MB', mimeType: 'application/pdf', signatureCount: 2, auditTrailHash: 'sha256:b9e4d1...' },
  { id: 'EV-003', name: 'Annual Policy Review Checklist', policyId: 'GV-WP-01', policyTitle: 'Governance', eventId: 'RE-003', eventTitle: 'Annual Policy Review', type: 'signed-form', status: 'pending-review', uploadedBy: 'Admin', uploadedAt: '2026-05-19', fileSize: '890 KB', mimeType: 'application/pdf', signatureCount: 1, auditTrailHash: null },
  { id: 'EV-004', name: 'Infection Control Training Sign-Off', policyId: 'CL-WP-30', policyTitle: 'Infection Control', eventId: 'RE-004', eventTitle: 'Infection Control Update', type: 'signed-form', status: 'verified', uploadedBy: 'E. Vance', uploadedAt: '2026-05-17', fileSize: '1.8 MB', mimeType: 'application/pdf', signatureCount: 12, auditTrailHash: 'sha256:c1f5a8...' },
  { id: 'EV-005', name: 'HIPAA Breach Response Drill Photo', policyId: 'HP-WP-05', policyTitle: 'HIPAA Privacy', eventId: 'RE-005', eventTitle: 'HIPAA Annual Training', type: 'photo-evidence', status: 'verified', uploadedBy: 'T. Lee', uploadedAt: '2026-05-14', fileSize: '4.2 MB', mimeType: 'image/jpeg', signatureCount: 0, auditTrailHash: 'sha256:d2a6b9...' },
  { id: 'EV-006', name: 'Emergency Evacuation Plan — Updated', policyId: 'SF-WP-03', policyTitle: 'Emergency Preparedness', eventId: 'RE-006', eventTitle: 'Emergency Plan Review', type: 'uploaded-doc', status: 'missing', uploadedBy: '—', uploadedAt: '—', fileSize: '—', mimeType: '—', signatureCount: 0, auditTrailHash: null },
  { id: 'EV-007', name: 'Competency Verification Batch — May', policyId: 'HR-WP-08', policyTitle: 'Staff Competency', eventId: 'RE-007', eventTitle: 'Annual Competency', type: 'auto-generated', status: 'pending-review', uploadedBy: 'System', uploadedAt: '2026-05-19', fileSize: '340 KB', mimeType: 'application/pdf', signatureCount: 0, auditTrailHash: null },
];

const statusStyle = (s: EvidenceStatus) => {
  const map = {
    'verified': { bg: 'rgba(0, 209, 193, 0.12)', color: V3.tealLight, label: 'VERIFIED' },
    'pending-review': { bg: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24', label: 'PENDING REVIEW' },
    'missing': { bg: 'rgba(248, 113, 113, 0.12)', color: '#F87171', label: 'MISSING' },
    'expired': { bg: 'rgba(100, 116, 139, 0.12)', color: V3.textTertiary, label: 'EXPIRED' },
  };
  return map[s];
};

export default function V3EvidenceCenterPreview() {
  const [viewMode, setViewMode] = useState<EvidenceMode>('hierarchy');

  const stats = {
    total: EVIDENCE.length,
    verified: EVIDENCE.filter(e => e.status === 'verified').length,
    pending: EVIDENCE.filter(e => e.status === 'pending-review').length,
    missing: EVIDENCE.filter(e => e.status === 'missing').length,
  };

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: 0 }}>Evidence Center</h1>
          <p style={{ color: V3.textSecondary, fontSize: 13, margin: '4px 0 0' }}>Triplet-enforced evidence: policy_id + workflow_id + event_id</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: V3.glass2, borderRadius: 8, padding: 3 }}>
          {(['hierarchy', 'timeline', 'audit-ready'] as EvidenceMode[]).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '6px 14px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: viewMode === m ? V3.teal : 'transparent',
              color: viewMode === m ? '#FFF' : V3.textTertiary,
              fontWeight: viewMode === m ? 600 : 400, textTransform: 'capitalize',
            }}>{m.replace('-', ' ')}</button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Evidence', value: stats.total, color: V3.textPrimary },
          { label: 'Verified', value: stats.verified, color: V3.tealLight },
          { label: 'Pending Review', value: stats.pending, color: '#FBBF24' },
          { label: 'Missing', value: stats.missing, color: '#F87171' },
        ].map((s, i) => (
          <div key={i} className="v3-invisible-glare" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Evidence list */}
      <div key={viewMode} className="v3-subview-animate" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 120px', gap: 8, padding: '8px 16px', color: V3.textTertiary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Evidence</span><span>Policy / Event</span><span>Type</span><span>Uploaded</span><span>Signatures</span><span>Status</span>
        </div>
        {EVIDENCE.map(ev => {
          const st = statusStyle(ev.status);
          return (
            <div key={ev.id} className="v3-invisible-glare" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 120px', gap: 8, padding: '14px 16px', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{ev.name}</div>
                <div style={{ color: V3.textTertiary, fontSize: 11, marginTop: 2 }}>{ev.id} · {ev.fileSize}</div>
              </div>
              <div>
                <div style={{ color: V3.textSecondary, fontSize: 12 }}>{ev.policyTitle}</div>
                <div style={{ color: V3.textTertiary, fontSize: 11 }}>{ev.eventTitle}</div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: V3.glass2, color: V3.textSecondary }}>{ev.type.replace('-', ' ')}</span>
              <div>
                <div style={{ color: V3.textSecondary, fontSize: 12 }}>{ev.uploadedAt}</div>
                <div style={{ color: V3.textTertiary, fontSize: 11 }}>{ev.uploadedBy}</div>
              </div>
              <span style={{ color: ev.signatureCount > 0 ? V3.tealLight : V3.textTertiary, fontSize: 13 }}>
                {ev.signatureCount > 0 ? `${ev.signatureCount} sig${ev.signatureCount > 1 ? 's' : ''}` : '—'}
              </span>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, fontWeight: 500, background: st.bg, color: st.color, textAlign: 'center' }}>{st.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real Evidence Center uses EvidenceCenterPage, CesEvidenceHierarchyPanel, triplet enforcement (policy_id + workflow_id + event_id), IndexedDB/AWS backend, and artifact linking.
      </div>
    </div>
  );
}
