import { useState } from 'react';
import { BadgeCheck, ClipboardCheck, KeyRound, LockKeyhole, ShieldCheck, Smartphone, UserCog } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

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

interface OverridePermission {
  desc: string;
  id: string;
  label: string;
}

type OverrideMode = 'default' | 'grant' | 'revoke';

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
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'groups', label: 'Groups' },
  { key: 'mfaStatus', label: 'MFA', status: true },
  { key: 'accessStatus', label: 'Access', status: true },
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

const userPanelTabs = [
  { id: 'security', label: 'Security' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'audit', label: 'Audit' },
] as const;

type UserPanelTabId = (typeof userPanelTabs)[number]['id'];

const overridePermissions: readonly OverridePermission[] = [
  { id: 'policy-writing', label: 'Policy writing', desc: 'Draft and submit policy revisions' },
  { id: 'evidence-upload', label: 'Evidence upload', desc: 'Upload documents and audit packets' },
  { id: 'ecign-signing', label: 'eCIgn signing', desc: 'Clinical preceptor and coordinator signoff' },
  { id: 'surveyor-viewer-access', label: 'Surveyor viewer access', desc: 'Read-only timeline view for surveyors' },
  { id: 'user-administration', label: 'User administration', desc: 'Manage user profiles and group roles' },
];

const overrideOptions: readonly { label: string; mode: OverrideMode; status: string }[] = [
  { label: 'Default', mode: 'default', status: 'ready' },
  { label: 'Force Grant', mode: 'grant', status: 'validated' },
  { label: 'Force Revoke', mode: 'revoke', status: 'review-required' },
];

const getDefaultOverrides = (): Record<string, OverrideMode> =>
  overridePermissions.reduce<Record<string, OverrideMode>>((overrides, permission) => {
    overrides[permission.id] = 'default';
    return overrides;
  }, {});

export function AdminUsersScreen() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>('u-compliance-tp');
  const [activePanel, setActivePanel] = useState<UserPanelTabId>('security');
  const [overrideModes, setOverrideModes] = useState<Record<string, OverrideMode>>(getDefaultOverrides);

  const selectedUser = userRows.find(r => r.userId === selectedUserId);

  const handleRowClick = (row: AdminUserRow) => {
    setSelectedUserId(row.userId === selectedUserId ? null : row.userId);
  };

  const handleOverrideChange = (permissionId: string, value: OverrideMode) => {
    setOverrideModes((current) => ({
      ...current,
      [permissionId]: value,
    }));
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

          {selectedUser && (
            <section className="mt-md rounded-lg border border-tone-orange-border bg-surface p-xl shadow-rest transition duration-normal">
              <div className="mb-lg flex flex-wrap items-start justify-between gap-lg border-b border-hairline pb-md">
                <div className="grid gap-xs">
                  <div className="flex flex-wrap items-center gap-sm">
                    <h3 className="text-h3 font-medium text-ink">Permission Override Matrix</h3>
                    <ToneBadge size="sm" status="review-required" />
                  </div>
                  <p className="text-sm text-secondary">
                    {selectedUser.name} / {selectedUser.role}
                  </p>
                  <p className="max-w-content text-xs text-muted">
                    Review access exceptions with clear inherited, grant, and revoke states before admin attestation.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="min-h-tap rounded-md px-md text-xs font-medium text-brand-teal transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
                  type="button"
                >
                  Close matrix
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-hairline bg-tone-slate-bg" aria-label="Permission override grid">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(360px,auto)] gap-md border-b border-hairline px-lg py-sm text-tag uppercase tracking-tag text-muted">
                  <span>Access area</span>
                  <span className="text-center">Override state</span>
                </div>
                <div className="divide-y divide-hairline bg-surface">
                  {overridePermissions.map((permission) => (
                    <div
                      className="grid gap-md px-lg py-md tablet-l:grid-cols-[minmax(0,1fr)_minmax(360px,auto)]"
                      key={permission.id}
                    >
                      <div className="grid gap-xs">
                        <p className="text-sm font-medium text-ink">{permission.label}</p>
                        <p className="text-xs text-secondary">{permission.desc}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-xs rounded-md border border-hairline bg-tone-slate-bg p-xs">
                        {overrideOptions.map((option) => {
                          const isSelected = overrideModes[permission.id] === option.mode;

                          return (
                            <button
                              aria-pressed={isSelected}
                              className={cx(
                                'min-h-tap rounded-md border px-sm text-xs font-medium transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                                isSelected
                                  ? 'border-brand-teal bg-brand-teal text-on-brand shadow-rest'
                                  : 'border-transparent bg-transparent text-secondary hover:bg-surface-hover hover:text-brand-teal',
                                isSelected && option.mode === 'grant' && 'border-tone-green-border bg-tone-green-bg text-tone-green-text',
                                isSelected && option.mode === 'revoke' && 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text',
                              )}
                              key={option.mode}
                              onClick={() => handleOverrideChange(permission.id, option.mode)}
                              type="button"
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-md flex flex-wrap justify-end gap-md">
                <Button size="sm" variant="secondary" onClick={() => setOverrideModes(getDefaultOverrides())}>
                  Restore Defaults
                </Button>
                <Button
                  className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95 font-light"
                  size="sm"
                  onClick={() => {
                    setSelectedUserId(null);
                  }}
                >
                  Save Override Draft
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

        <aside className="grid content-start gap-lg" aria-label="Admin users security panels">
          <nav aria-label="User admin tabs" className="flex gap-xs overflow-x-auto rounded-lg border border-card bg-surface/90 p-xs shadow-rest backdrop-blur-xl">
            {userPanelTabs.map((tab) => (
              <button
                aria-selected={activePanel === tab.id}
                className={cx(
                  'min-h-tap shrink-0 rounded-md px-md text-sm font-medium transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                  activePanel === tab.id
                    ? 'bg-brand-teal text-on-brand shadow-rest'
                    : 'text-secondary hover:bg-surface-hover hover:text-brand-teal',
                )}
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activePanel === 'security' && (
            <section className="grid gap-md" aria-label="User security summary" role="tabpanel">
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
                        Security checks summarize sign-in posture before account changes are approved.
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
            </section>
          )}

          {activePanel === 'assignments' && (
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="assignment-lanes-title" role="tabpanel">
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

              <div className="divide-y divide-hairline rounded-md border border-hairline bg-tone-slate-bg">
                {assignmentLanes.map((lane) => (
                  <div className="grid gap-sm p-md" key={lane.group}>
                    <div className="flex flex-wrap items-center justify-between gap-sm">
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
          )}

          {activePanel === 'audit' && (
            <SurfaceCard
              card={{
                body: 'Audit packets include group owner, MFA state, last review date, and role assignment changes for survey traceability.',
                icon: BadgeCheck,
                progress: 88,
                status: 'ready',
                title: 'Audit evidence package',
                tone: 'teal',
              }}
            >
              <div className="grid gap-sm border-t border-hairline pt-md">
                {[
                  ['Provisioning access', 'User administration', 'locked'],
                  ['Audit export', 'Audit packet export', 'validated'],
                  ['Role assignment', 'User role assignment', 'review-required'],
                  ['MFA enforcement', 'Security verification', 'certified'],
                ].map(([label, value, status]) => (
                  <div className="flex flex-wrap items-center justify-between gap-sm" key={value}>
                    <div className="flex min-w-0 items-center gap-sm">
                      <KeyRound aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0 text-brand-teal" />
                      <div className="min-w-0">
                        <p className="text-tag uppercase tracking-tag text-muted">{label}</p>
                        <p className="truncate text-xs font-medium text-secondary">{value}</p>
                      </div>
                    </div>
                    <ToneBadge size="sm" status={status} />
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}
        </aside>
      </section>
    </section>
  );
}

export default AdminUsersScreen;
