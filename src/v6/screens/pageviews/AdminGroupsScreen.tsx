import { ClipboardCheck, FileCheck2, LockKeyhole, ShieldCheck, UserCog } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';

interface AdminGroupRow extends Record<string, string> {
  accessScope: string;
  groupId: string;
  groupName: string;
  members: string;
  permissionPosture: string;
  roleLinks: string;
}

interface ScopeTile {
  helper: string;
  label: string;
  status: string;
  tone: Tone;
  value: string;
}

interface PermissionPreview {
  groups: string;
  permission: string;
  posture: string;
}

const groupMetrics: readonly MetricTileData[] = [
  { label: 'Groups', value: '7', helper: 'Governed RBAC cohorts', tone: 'teal' },
  { label: 'Members', value: '92', helper: 'Assigned active users', tone: 'green' },
  { label: 'Limited', value: '2', helper: 'Scopes under review', tone: 'orange' },
  { label: 'Dual control', value: '5', helper: 'Privileged changes gated', tone: 'amber' },
];

const groupRows: readonly AdminGroupRow[] = [
  {
    accessScope: 'Full platform, provisioning, audit export',
    groupId: 'grp-super-admin',
    groupName: 'Super Admin',
    members: '8',
    permissionPosture: 'locked',
    roleLinks: 'Platform Owner, Security Admin',
  },
  {
    accessScope: 'Policies, CES, evidence, governance reports',
    groupId: 'grp-compliance',
    groupName: 'Compliance Council',
    members: '12',
    permissionPosture: 'active',
    roleLinks: 'Compliance Officer, QAPI Lead',
  },
  {
    accessScope: 'Patients, clinical tasks, care-plan evidence',
    groupId: 'grp-clinical-rn',
    groupName: 'Clinical RN',
    members: '34',
    permissionPosture: 'ready',
    roleLinks: 'Clinical Manager, Field RN',
  },
  {
    accessScope: 'Journey setup, batches, clearance gates',
    groupId: 'grp-onboarding',
    groupName: 'Onboarding Operations',
    members: '18',
    permissionPosture: 'review-required',
    roleLinks: 'Onboarding Admin, HR Credentialing',
  },
  {
    accessScope: 'QAPI packets, corrective actions, report export',
    groupId: 'grp-qapi',
    groupName: 'QAPI Review',
    members: '6',
    permissionPosture: 'validated',
    roleLinks: 'QAPI Lead, Governing Body Reviewer',
  },
  {
    accessScope: 'Read-only survey packet and policy viewer',
    groupId: 'grp-surveyor-readonly',
    groupName: 'Surveyor Read-only',
    members: '3',
    permissionPosture: 'approved',
    roleLinks: 'External Surveyor, Audit Observer',
  },
  {
    accessScope: 'Payroll exports, visit logs, billing reports',
    groupId: 'grp-business-office',
    groupName: 'Business Office',
    members: '11',
    permissionPosture: 'pending',
    roleLinks: 'Billing Ops, Hubstaff Reviewer',
  },
];

const groupColumns: readonly DataTableColumn<AdminGroupRow>[] = [
  { key: 'groupId', label: 'Group ID' },
  { key: 'groupName', label: 'Group' },
  { key: 'members', label: 'Members' },
  { key: 'accessScope', label: 'Access scope' },
  { key: 'roleLinks', label: 'Role links' },
  { key: 'permissionPosture', label: 'Permission posture', status: true },
];

const governanceCards: readonly SurfaceCardData[] = [
  {
    body: 'Super Admin and provisioning cohorts stay locked behind administrator plus compliance confirmation before membership changes apply.',
    icon: LockKeyhole,
    progress: 91,
    status: 'locked',
    title: 'Privileged access guardrail',
    tone: 'slate',
  },
  {
    body: 'Clinical, onboarding, and business office groups retain scoped access so PHI, HR clearance, and export permissions do not bleed across roles.',
    icon: ShieldCheck,
    progress: 84,
    status: 'validated',
    title: 'Least-privilege posture',
    tone: 'teal',
  },
  {
    body: 'Two group scopes need owner review before the next survey packet release because linked roles changed this week.',
    icon: ClipboardCheck,
    progress: 68,
    status: 'review-required',
    title: 'Quarterly access review',
    tone: 'orange',
  },
];

const scopeTiles: readonly ScopeTile[] = [
  {
    helper: 'Full administrative path, user provisioning, policy lifecycle transitions, and audit export.',
    label: 'Platform control',
    status: 'locked',
    tone: 'slate',
    value: '8 users',
  },
  {
    helper: 'Evidence, CES, QAPI, and governance access remain grouped for survey-readiness work.',
    label: 'Compliance scope',
    status: 'active',
    tone: 'teal',
    value: '18 users',
  },
  {
    helper: 'Field care and journey permissions are segmented away from administrator-only actions.',
    label: 'Clinical boundary',
    status: 'ready',
    tone: 'green',
    value: '52 users',
  },
  {
    helper: 'External surveyor and business-office groups remain read-mostly until review closes.',
    label: 'Restricted lanes',
    status: 'pending',
    tone: 'amber',
    value: '14 users',
  },
];

const permissionPreview: readonly PermissionPreview[] = [
  { groups: 'Super Admin', permission: 'user.provision', posture: 'locked' },
  { groups: 'Compliance Council, QAPI Review', permission: 'audit.export', posture: 'active' },
  { groups: 'Clinical RN', permission: 'patients.read', posture: 'ready' },
  { groups: 'Onboarding Operations', permission: 'journey.admin', posture: 'review-required' },
  { groups: 'Surveyor Read-only', permission: 'policy.surveyorRead', posture: 'approved' },
];

export function AdminGroupsScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-groups"
      data-route="/admin/user-groups"
      data-template="matrix"
    >
      <MetricGrid metrics={groupMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="grid content-start gap-lg" aria-label="Admin user groups permission matrix">
          <DataTable columns={groupColumns} label="Admin user groups permission matrix" rows={groupRows} />

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Admin scope summary">
            {scopeTiles.map((tile) => (
              <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={tile.label}>
                <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                  <div>
                    <p className="text-tag uppercase tracking-tag text-muted">{tile.label}</p>
                    <div className="mt-xs">
                      <ToneTag tone={tile.tone}>{tile.value}</ToneTag>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={tile.status} />
                </div>
                <p className="text-sm text-secondary">{tile.helper}</p>
              </article>
            ))}
          </section>
        </section>

        <aside className="grid content-start gap-lg" aria-label="Admin group governance cards">
          {governanceCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex items-start justify-between gap-md">
              <div className="grid gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <UserCog aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink">Permission matrix preview</h2>
                  <p className="mt-xs text-sm text-muted">
                    Representative permission keys show which groups can hold sensitive access.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status="ready" />
            </div>

            <div className="grid gap-sm">
              {permissionPreview.map((item) => (
                <div className="rounded-md border border-hairline bg-tone-slate-bg p-md" key={item.permission}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <span className="font-mono text-xs text-brand-teal">{item.permission}</span>
                    <ToneBadge size="sm" status={item.posture} />
                  </div>
                  <p className="text-sm text-secondary">{item.groups}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-green-bg text-tone-green-text">
                <FileCheck2 aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div>
                <h2 className="text-h2 font-medium text-ink">Governance evidence</h2>
                <p className="mt-xs text-sm text-muted">
                  Membership changes require owner reason, reviewer initials, timestamp, and audit packet trace.
                </p>
              </div>
            </div>
            <div className="grid gap-sm">
              {[
                ['Last review', 'Jun 18, 2026', 'validated'],
                ['Next review', 'Jul 1, 2026', 'upcoming'],
                ['Open exceptions', '2 limited scopes', 'review-required'],
                ['Audit export', 'Ready for packet', 'ready'],
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
        </aside>
      </section>
    </section>
  );
}

export default AdminGroupsScreen;
