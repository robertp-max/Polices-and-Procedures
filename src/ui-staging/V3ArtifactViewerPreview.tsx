// V3ArtifactViewerPreview.tsx — V3 Veil Glass Artifact / Signed Packet Viewer
// Visual layer only. Based on ArtifactViewerPage + signed packet HTML preview.

const V3 = {
  glass2: 'rgba(255, 255, 255, 0.04)',
  teal: '#007970',
  tealLight: '#00D1C1',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: 'rgba(255, 255, 255, 0.33)',
} as const;

const ARTIFACT = {
  id: 'ART-20260518-001',
  formTitle: 'QAPI Meeting Minutes — Q2 2026',
  formId: 'QA-WP-11',
  policyId: 'QA-PG-001',
  type: 'Signed Document Package',
  createdAt: '2026-05-18 14:32:00 UTC',
  fileSize: '2.4 MB',
  mimeType: 'application/pdf',
  signatureChain: [
    { signer: 'J. Smith, Quality Director', role: 'Primary Signer', timestamp: '2026-05-18 14:30:12 UTC', hash: 'sha256:a7f3c2e9...d41f', method: 'eCign v2', ipAddress: '10.0.1.42' },
    { signer: 'Dr. R. Patel, Medical Director', role: 'Co-Signer', timestamp: '2026-05-18 14:31:48 UTC', hash: 'sha256:b9e4d1f0...8a2c', method: 'eCign v2', ipAddress: '10.0.1.15' },
    { signer: 'Dr. Evelyn Vance, Clinical Lead', role: 'Approver', timestamp: '2026-05-18 14:32:00 UTC', hash: 'sha256:c1f5a8b3...6e9d', method: 'eCign v2', ipAddress: '10.0.1.28' },
  ],
  auditTrail: [
    { action: 'Form created', actor: 'System (auto-generated)', timestamp: '2026-05-18 10:00:00 UTC' },
    { action: 'Form opened for editing', actor: 'J. Smith', timestamp: '2026-05-18 13:15:22 UTC' },
    { action: 'Form completed and submitted', actor: 'J. Smith', timestamp: '2026-05-18 14:28:45 UTC' },
    { action: 'Signature applied (primary)', actor: 'J. Smith', timestamp: '2026-05-18 14:30:12 UTC' },
    { action: 'Routed to co-signer', actor: 'System', timestamp: '2026-05-18 14:30:13 UTC' },
    { action: 'Signature applied (co-signer)', actor: 'Dr. R. Patel', timestamp: '2026-05-18 14:31:48 UTC' },
    { action: 'Routed to approver', actor: 'System', timestamp: '2026-05-18 14:31:49 UTC' },
    { action: 'Signature applied (approver) — package sealed', actor: 'Dr. Evelyn Vance', timestamp: '2026-05-18 14:32:00 UTC' },
    { action: 'Evidence record created in Evidence Center', actor: 'System', timestamp: '2026-05-18 14:32:01 UTC' },
  ],
};

export default function V3ArtifactViewerPreview() {
  return (
    <div className="v3-page-animate" style={{ padding: 24, display: 'flex', gap: 20 }}>
      {/* Main preview area */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: V3.textTertiary, fontSize: 12, marginBottom: 12 }}>
          Evidence Center → Artifacts → <span style={{ color: V3.textSecondary }}>{ARTIFACT.id}</span>
        </div>

        {/* Document preview placeholder */}
        <div style={{
          flex: 1, borderRadius: 12, background: V3.glass2, border: `1px solid ${V3.borderDefault}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400,
          flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: 48, opacity: 0.3 }}>📄</div>
          <div style={{ color: V3.textSecondary, fontSize: 14 }}>Signed Document Preview</div>
          <div style={{ color: V3.textTertiary, fontSize: 12 }}>{ARTIFACT.formTitle}</div>
          <div style={{ color: V3.textTertiary, fontSize: 11 }}>{ARTIFACT.fileSize} · {ARTIFACT.mimeType}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={{ padding: '6px 16px', fontSize: 12, borderRadius: 6, background: V3.teal, color: '#FFF', border: 'none', cursor: 'pointer' }}>Download</button>
            <button style={{ padding: '6px 16px', fontSize: 12, borderRadius: 6, background: V3.glass2, color: V3.textSecondary, border: `1px solid ${V3.borderDefault}`, cursor: 'pointer' }}>Print</button>
          </div>
        </div>
      </div>

      {/* Metadata sidebar */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Artifact info */}
        <div className="v3-invisible-glare" style={{ padding: 20 }}>
          <h3 style={{ color: V3.textTertiary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Artifact Details</h3>
          {[
            { l: 'ID', v: ARTIFACT.id },
            { l: 'Form', v: `${ARTIFACT.formId} — ${ARTIFACT.formTitle}` },
            { l: 'Policy', v: ARTIFACT.policyId },
            { l: 'Type', v: ARTIFACT.type },
            { l: 'Sealed', v: ARTIFACT.createdAt },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <span style={{ color: V3.textTertiary, fontSize: 12 }}>{item.l}</span>
              <span style={{ color: V3.textSecondary, fontSize: 12, textAlign: 'right', maxWidth: 180 }}>{item.v}</span>
            </div>
          ))}
        </div>

        {/* Signature chain */}
        <div className="v3-invisible-glare" style={{ padding: 20 }}>
          <h3 style={{ color: V3.textTertiary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Signature Chain ({ARTIFACT.signatureChain.length})</h3>
          {ARTIFACT.signatureChain.map((sig, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < ARTIFACT.signatureChain.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{sig.signer}</div>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(0, 209, 193, 0.12)', color: V3.tealLight }}>✓</span>
              </div>
              <div style={{ color: V3.textTertiary, fontSize: 11, marginTop: 2 }}>{sig.role}</div>
              <div style={{ color: V3.textTertiary, fontSize: 10, marginTop: 2, fontFamily: 'monospace' }}>{sig.hash}</div>
              <div style={{ color: V3.textTertiary, fontSize: 10 }}>{sig.timestamp}</div>
            </div>
          ))}
        </div>

        {/* Audit trail */}
        <div className="v3-invisible-glare v3-no-scrollbar" style={{ padding: 20, maxHeight: 300, overflowY: 'auto' }}>
          <h3 style={{ color: V3.textTertiary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Audit Trail</h3>
          {ARTIFACT.auditTrail.map((entry, i) => (
            <div key={i} style={{ padding: '8px 0 8px 14px', borderLeft: `2px solid ${i === ARTIFACT.auditTrail.length - 1 ? V3.tealLight : 'rgba(255,255,255,0.08)'}`, marginLeft: 4 }}>
              <div style={{ color: V3.textSecondary, fontSize: 12 }}>{entry.action}</div>
              <div style={{ color: V3.textTertiary, fontSize: 10, marginTop: 2 }}>{entry.actor} · {entry.timestamp}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real viewer uses ArtifactViewerPage, iframe HTML packet rendering, buildArtifactRoute, and eCign hash-chain verification.
      </div>
    </div>
  );
}
