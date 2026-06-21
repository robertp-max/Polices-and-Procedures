import { useState } from 'react';
import { BadgeCheck, ClipboardCheck, KeyRound, LockKeyhole, ShieldCheck, Smartphone, UserCog } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';

interface AdminUserRow extends Record<string, string> {
  accessStatus: string;
  auditStatus: string;
  groups: string;
  lastReview: string;
  mfaStatus: string;
  name: string;
  readinessStatus: string;
  role: string;
  userId: string;
}

interface SecuritySummary {
  detail: string;
  label: string;
  status: string;
  tone: Tone;
  value: string;
}

interface AssignmentLane {
  group: string;
  owner: string;
  status: string;
  users: string;
}

const userMetrics: readonly MetricTileData[] = [
  { label: 'Users', value: '96', helper: 'Active directory accounts', tone: 'teal' },
  { label: 'MFA', value: '94%', helper: 'Protected sign-ins', tone: 'green' },
  { label: 'Privileged', value: '11', helper: 'Dual-control accounts', tone: 'amber' },
  { label: 'Reviews', value: '4', helper: 'Access items due soon', tone: 'orange' },
];

const userRows: readonly AdminUserRow[] = [
  {
    accessStatus: 'locked',
    auditStatus: 'validated',
    groups: 'Super Admin, Security Admin',
    lastReview: 'Jun 18, 2026',
    mfaStatus: 'certified',
    name: 'Brad Administrator',
    readinessStatus: 'ready',
    role: 'Platform Owner',
    userId: 'u-admin-brad',
  },
  {
    accessStatus: 'active',
    auditStatus: 'complete',
    groups: 'Compliance Council, QAPI Review',
    lastReview: 'Jun 17, 2026',
    mfaStatus: 'certified',
    name: 'Tina Patel',
    readinessStatus: 'validated',
    role: 'Compliance Officer',
    userId: 'u-compliance-tp',
  },
  {
    accessStatus: 'active',
    auditStatus: 'uploaded',
    groups: 'Clinical RN, Policy Authors',
    lastReview: 'Jun 14, 2026',
    mfaStatus: 'ready',
    name: 'Maria Gonzalez',
    readinessStatus: 'ready',
    role: 'DON',
    userId: 'u-don-01',
  },
  {
    accessStatus: 'pending',
    auditStatus: 'review-required',
    groups: 'Onboarding Operations',
    lastReview: 'Jun 10, 2026',
    mfaStatus: 'pending',
    name: 'Jon Rivera',
    readinessStatus: 'attention',
    role: 'Credentialing Coordinator',
    userId: 'u-onboarding-jr',
  },
  {
    accessStatus: 'active',
    auditStatus: 'validated',
    groups: 'Business Office, Payroll Export',
    lastReview: 'Jun 12, 2026',
    mfaStatus: 'certified',
    name: 'Ops Lead',
    readinessStatus: 'ready',
    role: 'Primary Ops',
    userId: 'demo-user-careindeed',
  },
  {
    accessStatus: 'locked',
    auditStatus: 'approved',
    groups: 'Surveyor Read-only',
    lastReview: 'Jun 19, 2026',
    mfaStatus: 'certified',
    name: 'External Surveyor',
    readinessStatus: 'approved',
    role: 'Audit Observer',
    userId: 'u-surveyor-ro',
  },
];

const userColumns: readonly DataTableColumn<AdminUserRow>[] = [
  { key: 'userId', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'groups', label: 'Groups' },
  { key: 'mfaStatus', label: 'MFA', status: true },
  { key: 'accessStatus', label: 'Access', status: true },
  { key: 'auditStatus', label: 'Audit', status: true },
  { key: 'readinessStatus', label: 'Readiness', status: true },
  { key: 'lastReview', label: 'Last review' },
];

const securityCards: readonly SurfaceCardData[] = [
  {
    body: 'Privileged users remain locked behind MFA, administrator review, and a second approver before provisioning changes apply.',
    icon: LockKeyhole,
    progress: 91,
    status: 'locked',
    title: 'Privileged access guardrail',
    tone: 'slate',
  },
  {
    body: 'Clinical, compliance, onboarding, and business-office assignments stay segmented by group so PHI and export permissions remain bounded.',
    icon: ShieldCheck,
    progress: 86,
    status: 'validated',
    title: 'Least-privilege coverage',
    tone: 'teal',
  },
  {
    body: 'Four user assignments are due for owner attestation before the next survey packet is locked for read-only review.',
    icon: ClipboardCheck,
    progress: 72,
    status: 'review-required',
    title: 'Access review queue',
    tone: 'orange',
  },
];

const securitySummaries: readonly SecuritySummary[] = [
  {
    detail: 'Administrator and provisioning lanes require MFA plus dual approval.',
    label: 'Privileged lane',
    status: 'locked',
    tone: 'slate',
    value: '11 users',
  },
  {
    detail: 'Compliance and QAPI users can export evidence only after packet retention checks pass.',
    label: 'Evidence export',
    status: 'validated',
    tone: 'teal',
    value: '18 users',
  },
  {
    detail: 'Clinical user access stays active for care, policy, and task workflows.',
    label: 'Clinical access',
    status: 'ready',
    tone: 'green',
    value: '41 users',
  },
  {
    detail: 'Pending onboarding assignments need supervisor confirmation before activation.',
    label: 'Pending changes',
    status: 'attention',
    tone: 'orange',
    value: '4 reviews',
  },
];

const assignmentLanes: readonly AssignmentLane[] = [
  { group: 'Super Admin', owner: 'Security Admin', status: 'locked', users: '8' },
  { group: 'Compliance Council', owner: 'Compliance Officer', status: 'validated', users: '12' },
  { group: 'Clinical RN', owner: 'DON', status: 'ready', users: '34' },
  { group: 'Onboarding Operations', owner: 'Credentialing Lead', status: 'review-required', users: '18' },
  { group: 'Surveyor Read-only', owner: 'QAPI Lead', status: 'approved', users: '3' },
];

export function AdminUsersScreen() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>('u-compliance-tp');

  const selectedUser = userRows.find(r => r.userId === selectedUserId);

  const handleRowClick = (row: AdminUserRow) => {
    setSelectedUserId(row.userId === selectedUserId ? null : row.userId);
  };

  const handleOverrideChange = (permissionKey: string, value: string) => {
    // UI feedback only for prototype
    console.log(`Setting override: ${permissionKey} = ${value}`);
  };

  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-users"
      data-route="/admin/users"
      data-template="matrix"
    >
      <MetricGrid metrics={userMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="grid content-start gap-lg" aria-label="Admin users role and access assignment matrix">
          <DataTable 
            columns={userColumns} 
            label="Admin users role and access assignment matrix" 
            rows={userRows} 
            onRowClick={handleRowClick}
          />

          {/* User Permission Override Matrix */}
          {selectedUser && (
            <section className="rounded-lg border border-brand-orange/30 bg-surface p-xl shadow-rest transition duration-normal mt-md">
              <div className="mb-lg border-b border-hairline pb-sm flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-sm">
                    <h3 className="text-h3 font-medium text-ink">Permission Override Matrix</h3>
                    <span className="text-xs text-muted font-mono">{selectedUser.name} ({selectedUser.userId})</span>
                  </div>
                  <p className="text-xs text-secondary mt-xs">Configure granular access exceptions and dual-signature authorizations.</p>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="text-xs font-medium text-brand-teal hover:underline"
                  type="button"
                >
                  Collapse Override Matrix
                </button>
              </div>

              <div className="rounded-lg border border-hairline bg-transparent overflow-hidden">
                <table className="min-w-full border-collapse text-left text-xs" aria-label="Permission Override Grid">
                  <thead className="bg-tone-slate-bg text-tag uppercase tracking-tag text-muted">
                    <tr>
                      <th className="border-b border-card px-lg py-md font-light" scope="col">Scope / Permission</th>
                      <th className="border-b border-card px-lg py-md font-light text-center" scope="col">Default (Inherited)</th>
                      <th className="border-b border-card px-lg py-md font-light text-center" scope="col">Force Grant</th>
                      <th className="border-b border-card px-lg py-md font-light text-center" scope="col">Force Revoke</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'policy.write', label: 'Policy writing', desc: 'Draft and submit policy revisions' },
                      { key: 'evidence.upload', label: 'Evidence upload', desc: 'Upload documents and audit packets' },
                      { key: 'ecign.sign', label: 'eCIgn signing', desc: 'Clinical preceptor and coordinator signoff' },
                      { key: 'surveyor.view', label: 'Surveyor viewer access', desc: 'Read-only timeline view for surveyors' },
                      { key: 'admin.users', label: 'User administration', desc: 'Manage user profiles and group roles' }
                    ].map((row) => (
                      <tr key={row.key} className="border-b border-hairline hover:bg-surface-hover transition duration-fast">
                        <td className="px-lg py-md leading-body text-secondary">
                          <div className="font-medium text-ink">{row.label}</div>
                          <div className="text-[10px] text-muted font-mono mt-xs">{row.key}</div>
                        </td>
                        <td className="px-lg py-md text-center">
                          <input
                            type="radio"
                            name={`override-${row.key}`}
                            value="default"
                            defaultChecked
                            onChange={() => handleOverrideChange(row.key, 'default')}
                          />
                        </td>
                        <td className="px-lg py-md text-center">
                          <input
                            type="radio"
                            name={`override-${row.key}`}
                            value="grant"
                            onChange={() => handleOverrideChange(row.key, 'grant')}
                          />
                        </td>
                        <td className="px-lg py-md text-center">
                          <input
                            type="radio"
                            name={`override-${row.key}`}
                            value="revoke"
                            onChange={() => handleOverrideChange(row.key, 'revoke')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-md flex justify-end gap-md">
                <Button size="sm" variant="secondary" onClick={() => setSelectedUserId(null)}>
                  Discard Changes
                </Button>
                <Button
                  className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95 font-light"
                  size="sm"
                  onClick={() => {
                    alert('Override matrix updated. Event audit log updated.');
                    setSelectedUserId(null);
                  }}
                >
                  Apply & Log Exception
                </Button>
              </div>
            </section>
          )}

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Admin user security summary">
            {securitySummaries.map((summary) => (
              <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={summary.label}>
                <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                  <div>
                    <p className="text-tag uppercase tracking-tag text-muted">{summary.label}</p>
                    <div className="mt-xs">
                      <ToneTag tone={summary.tone}>{summary.value}</ToneTag>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={summary.status} />
                </div>
                <p className="text-sm text-secondary">{summary.detail}</p>
              </article>
            ))}
          </section>
        </section>

        <aside className="grid content-start gap-lg" aria-label="Admin users security cards">
          {securityCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="mfa-readiness-title">
            <div className="mb-lg flex items-start justify-between gap-md">
              <div className="grid gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-green-bg text-tone-green-text">
                  <Smartphone aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink" id="mfa-readiness-title">
                    MFA and access readiness
                  </h2>
                  <p className="mt-xs text-sm text-muted">
                    Right-side security checks summarize sign-in posture before account changes are approved.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status="certified" />
            </div>

            <div className="grid gap-sm">
              {[
                ['Certified MFA', '90 users', 'certified'],
                ['Pending enrollment', '4 users', 'pending'],
                ['Locked privileged lane', '11 users', 'locked'],
                ['Access review ready', '92 accounts', 'ready'],
              ].map(([label, value, status]) => (
                <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md" key={label}>
                  <div>
                    <p className="text-tag uppercase tracking-tag text-muted">{label}</p>
                    <p className="mt-xs text-sm text-ink">{value}</p>
                  </div>
                  <ToneBadge size="sm" status={status} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="assignment-lanes-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                <UserCog aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div>
                <h2 className="text-h2 font-medium text-ink" id="assignment-lanes-title">
                  Role and group lanes
                </h2>
                <p className="mt-xs text-sm text-muted">
                  Group owners retain accountability for membership, role scope, and audit-ready user evidence.
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {assignmentLanes.map((lane) => (
                <div className="rounded-md border border-hairline bg-tone-slate-bg p-md" key={lane.group}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <div>
                      <p className="text-sm text-ink">{lane.group}</p>
                      <p className="mt-xs text-xs text-muted">{lane.owner}</p>
                    </div>
                    <ToneBadge size="sm" status={lane.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-sm">
                    <ToneTag tone="slate">{lane.users} users</ToneTag>
                    <span className="text-xs text-secondary">Role and permission assignment owner</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <SurfaceCard
            card={{
              body: 'Audit packets include user ID, group owner, MFA state, last review date, and role assignment changes for survey traceability.',
              icon: BadgeCheck,
              progress: 88,
              status: 'ready',
              title: 'Audit evidence package',
              tone: 'teal',
            }}
          >
            <div className="grid gap-sm border-t border-hairline pt-md">
              {[
                ['Provisioning key', 'user.provision', 'locked'],
                ['Audit export', 'audit.export', 'validated'],
                ['Role assignment', 'admin.users.assign', 'review-required'],
                ['MFA enforcement', 'security.mfa.enforce', 'certified'],
              ].map(([label, value, status]) => (
                <div className="flex flex-wrap items-center justify-between gap-sm" key={value}>
                  <div className="flex min-w-0 items-center gap-sm">
                    <KeyRound aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0 text-brand-teal" />
                    <div className="min-w-0">
                      <p className="text-tag uppercase tracking-tag text-muted">{label}</p>
                      <p className="truncate font-mono text-xs text-secondary">{value}</p>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={status} />
                </div>
              ))}
            </div>
          </SurfaceCard>
        </aside>
      </section>
    </section>
  );
}

export default AdminUsersScreen;
