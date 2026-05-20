// V3AdminPreview.tsx — V3 Veil Glass Admin / Settings
// Visual layer only. Covers user management, roles, permissions.

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

type AdminTab = 'users' | 'roles' | 'permissions' | 'system';

const USERS = [
  { id: 'U-001', name: 'Dr. R. Patel', email: 'rpatel@careindeed.com', role: 'Administrator', status: 'active', lastLogin: '2026-05-19 14:22' },
  { id: 'U-002', name: 'J. Smith', email: 'jsmith@careindeed.com', role: 'Compliance Officer', status: 'active', lastLogin: '2026-05-19 09:15' },
  { id: 'U-003', name: 'Dr. Evelyn Vance', email: 'evance@careindeed.com', role: 'Clinical Lead', status: 'active', lastLogin: '2026-05-18 16:44' },
  { id: 'U-004', name: 'Marcus Sterling', email: 'msterling@careindeed.com', role: 'Clinician', status: 'active', lastLogin: '2026-05-19 11:30' },
  { id: 'U-005', name: 'T. Lee', email: 'tlee@careindeed.com', role: 'IT Administrator', status: 'active', lastLogin: '2026-05-19 08:05' },
  { id: 'U-006', name: 'M. Doe', email: 'mdoe@careindeed.com', role: 'Safety Officer', status: 'inactive', lastLogin: '2026-05-10 12:00' },
];

const ROLES = [
  { name: 'Administrator', users: 2, permissions: 'Full access', canSign: true, canApprove: true },
  { name: 'Compliance Officer', users: 3, permissions: 'CES + Evidence + Audit', canSign: true, canApprove: true },
  { name: 'Clinical Lead', users: 4, permissions: 'Clinical + Staffing + CES', canSign: true, canApprove: true },
  { name: 'Clinician', users: 18, permissions: 'Dashboard + Calendar + Forms + My Tasks', canSign: true, canApprove: false },
  { name: 'IT Administrator', users: 2, permissions: 'System + Users + Workflows', canSign: false, canApprove: false },
  { name: 'Read Only', users: 1, permissions: 'View only — no write/sign', canSign: false, canApprove: false },
];

export default function V3AdminPreview() {
  const [tab, setTab] = useState<AdminTab>('users');

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <h1 style={{ color: V3.textPrimary, fontSize: 20, fontWeight: 600, margin: '0 0 20px' }}>Administration</h1>

      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: `1px solid ${V3.borderDefault}` }}>
        {(['users', 'roles', 'permissions', 'system'] as AdminTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 600 : 400,
            color: tab === t ? V3.tealLight : V3.textTertiary,
            background: 'transparent', border: 'none',
            borderBottom: tab === t ? `2px solid ${V3.tealLight}` : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1, textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      <div key={tab} className="v3-subview-animate">
        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 80px 1.5fr', gap: 8, padding: '8px 16px', color: V3.textTertiary, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Last Login</span>
            </div>
            {USERS.map(u => (
              <div key={u.id} className="v3-invisible-glare" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 80px 1.5fr', gap: 8, padding: '14px 16px', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{u.name}</span>
                <span style={{ color: V3.textSecondary, fontSize: 12 }}>{u.email}</span>
                <span style={{ color: V3.textSecondary, fontSize: 12 }}>{u.role}</span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: u.status === 'active' ? 'rgba(0, 209, 193, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                  color: u.status === 'active' ? V3.tealLight : V3.textTertiary,
                }}>{u.status.toUpperCase()}</span>
                <span style={{ color: V3.textTertiary, fontSize: 12 }}>{u.lastLogin}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'roles' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {ROLES.map(r => (
              <div key={r.name} style={{ padding: 20, borderRadius: 12, background: V3.glass2, border: `1px solid ${V3.borderDefault}`, cursor: 'pointer' }}>
                <div style={{ color: V3.textPrimary, fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{r.name}</div>
                <div style={{ color: V3.textTertiary, fontSize: 12, marginBottom: 10 }}>{r.permissions}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: V3.textSecondary, fontSize: 12 }}>{r.users} users</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {r.canSign && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight }}>Sign</span>}
                    {r.canApprove && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight }}>Approve</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'permissions' && (
          <div className="v3-invisible-glare" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ color: V3.textTertiary, fontSize: 14 }}>Permission matrix — role × resource grid</div>
            <div style={{ color: V3.textSecondary, fontSize: 12, marginTop: 8 }}>Real implementation uses AdminRouteGuard + RBAC middleware</div>
          </div>
        )}
        {tab === 'system' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Allowlist Mode', value: 'Enabled (fail-closed)', desc: 'Registration restricted to approved CSV list' },
              { label: 'Evidence Backend', value: 'AWS (presigned URLs)', desc: 'VITE_EVIDENCE_MODE=BACKEND_LIVE' },
              { label: 'eCign Hash Chain', value: 'SHA-256 active', desc: 'Non-repudiation audit trail enabled' },
              { label: 'Build Version', value: '2026.05.19-phase3', desc: 'Last deployment: 2026-05-19 08:00 UTC' },
            ].map((item, i) => (
              <div key={i} className="v3-invisible-glare" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ color: V3.textTertiary, fontSize: 12, marginTop: 2 }}>{item.desc}</div>
                </div>
                <span style={{ color: V3.tealLight, fontSize: 13, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', color: V3.textTertiary, fontSize: 11 }}>
        Visual preview only — real Admin uses AdminRouteGuard, RBAC, allowlist CSV validation, and user identity stores.
      </div>
    </div>
  );
}
