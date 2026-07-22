import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  ClipboardCheck,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  UserCog,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import type { JourneyRole } from '@/policy/journey/types/journey';
import type { User } from '@/policy/security/identity/types';
import { USER_GROUPS, USER_GROUP_BY_ID } from '@/policy/security/identity/userGroups';
import { useUserAssignmentsStore } from '@/policy/security/identity/userAssignmentsStore';
import { AccountProvisioningCard } from '@/auth/AccountProvisioningCard';
import { ServerUserAccessPanel } from '@/auth/ServerUserAccessPanel';
import {
  buildOnboardingTrackForRole,
  type UserSetupFieldsPayload,
} from '@/policy/security/identity/userSetupAssignments';
import { USER_SETUP_AUDIT_DEMO_LABEL } from '@/policy/security/identity/userSetupAudit';
import { DEMO_IMPERSONATION_LABEL } from '@/policy/journey/components/DemoImpersonationBar';
import {
  DataTable,
  MetricGrid,
  SurfaceCard,
  ToneTag,
  type DataTableColumn,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { Button, FormField, Input, Select, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { useManageUsersCapability } from '@/auth/useAdminCapabilities';
import { cx } from '../../utils/classNames';
import { workspaceCompactTabClass, workspaceTabActiveClass, workspaceTabInactiveClass } from './workspaceTabChrome';

/**
 * Demo actor for edit/delete authorization checks in the identity store.
 * Phase 2B/2E is localStorage-only — no real auth session is required here.
 * `demo-user-careindeed` is the protected Super Admin seed (cannot self-delete /
 * is the stable demo operator id used in Phase 2A unit tests).
 *
 * Actor context below is labeled: **Demo impersonation — not a real session**.
 */
const DEMO_ACTOR_USER_ID = 'demo-user-careindeed';

const PROTECTED_USER_IDS = new Set(['demo-user-careindeed']);

/**
 * Real Care Indeed people (canonical accounts). Everyone else in the seeded
 * identity directory is prototype/demo data and is grouped separately in the
 * People area so canonical accounts are never confused with demo personas.
 */
const CANONICAL_ACCOUNT_IDS = new Set([
  'demo-user-careindeed', // TJ Padilla (robertp@careindeed.com)
  'usr-marites',          // Marites Arzaga
  'usr-deeb-admin',       // Deeb Admin
  'usr-dagny',            // Dagny Yenko
  'usr-janine',           // Janine Catanghal
  'usr-monserat',         // Monserat Zapanta
  'usr-reden',            // Reden Valerio
]);

const PRIVILEGED_GROUP_IDS = new Set([
  'grp-super-admin',
  'grp-admin',
  'grp-system',
  'grp-user-access-admin',
]);

const JOURNEY_ROLES: readonly JourneyRole[] = [
  'ADM',
  'DON',
  'RN',
  'LVN',
  'PT',
  'PTA',
  'OT',
  'COTA',
  'SLP',
  'MSW',
  'HHA',
];

const JOURNEY_ROLE_LABELS: Record<JourneyRole, string> = {
  ADM: 'Administrator (ADM)',
  DON: 'Director of Nursing (DON)',
  RN: 'Registered Nurse (RN)',
  LVN: 'Licensed Vocational Nurse (LVN)',
  PT: 'Physical Therapist (PT)',
  PTA: 'Physical Therapist Assistant (PTA)',
  OT: 'Occupational Therapist (OT)',
  COTA: 'Certified OT Assistant (COTA)',
  SLP: 'Speech-Language Pathologist (SLP)',
  MSW: 'Medical Social Worker (MSW)',
  HHA: 'Home Health Aide (HHA)',
};

interface AdminUserRow extends Record<string, string> {
  accessStatus: string;
  discipline: string;
  email: string;
  firstDay: string;
  groupId: string;
  groups: string;
  name: string;
  onboarding: string;
  role: string;
  status: string;
  supervisor: string;
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

interface EditFormState {
  discipline: string;
  email: string;
  firstDay: string;
  groupId: string;
  hireDate: string;
  name: string;
  onboardingTrack: 'none' | 'role';
  role: string;
  status: 'active' | 'pending' | 'suspended';
  supervisorId: string;
}

interface CreateFormState {
  discipline: string;
  email: string;
  firstDay: string;
  groupId: string;
  hireDate: string;
  name: string;
  onboardingTrack: 'none' | 'role';
  role: string;
  status: 'active' | 'pending' | 'suspended';
  supervisorId: string;
}

const emptyCreateForm = (): CreateFormState => ({
  name: '',
  email: '',
  groupId: 'grp-pending-user',
  status: 'pending',
  role: '',
  discipline: '',
  supervisorId: '',
  firstDay: '',
  hireDate: '',
  onboardingTrack: 'none',
});

function statusToAccessStatus(status: User['status']): string {
  if (status === 'suspended') return 'locked';
  if (status === 'pending') return 'pending';
  return 'active';
}

function formatDateLabel(iso?: string | null): string {
  if (!iso) return '—';
  const day = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return iso;
  try {
    return new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return day;
  }
}

function activeGroupId(
  assignments: { userId: string; groupId: string; revokedAt?: string }[],
  userId: string,
): string {
  const active = assignments.find(a => a.userId === userId && !a.revokedAt);
  return active?.groupId ?? 'grp-pending-user';
}

function groupLabel(groupId: string): string {
  return USER_GROUP_BY_ID[groupId]?.name ?? groupId;
}

function buildEditForm(
  user: User,
  groupId: string,
  setup: {
    role?: JourneyRole | null;
    discipline?: string;
    supervisorId?: string | null;
    firstDay?: string;
    hireDate?: string;
    onboarding?: { trackId: string } | null;
  } | undefined,
): EditFormState {
  return {
    name: user.name,
    email: user.email,
    groupId,
    status: user.status,
    role: setup?.role ?? '',
    discipline: setup?.discipline ?? '',
    supervisorId: setup?.supervisorId ?? '',
    firstDay: setup?.firstDay?.slice(0, 10) ?? '',
    hireDate: setup?.hireDate?.slice(0, 10) ?? '',
    onboardingTrack: setup?.onboarding ? 'role' : 'none',
  };
}

function setupPayloadFromForm(form: {
  role: string;
  discipline: string;
  supervisorId: string;
  firstDay: string;
  hireDate: string;
  onboardingTrack: 'none' | 'role';
  status?: string;
}): UserSetupFieldsPayload {
  const role = (form.role || null) as JourneyRole | null;
  const payload: UserSetupFieldsPayload = {
    role,
    discipline: form.discipline.trim() || undefined,
    supervisorId: form.supervisorId || null,
    firstDay: form.firstDay || undefined,
    hireDate: form.hireDate || undefined,
  };

  if (form.onboardingTrack === 'none') {
    payload.onboarding = null;
  } else if (role) {
    payload.onboarding = buildOnboardingTrackForRole(role, {
      firstDay: form.firstDay || undefined,
    });
  }

  return payload;
}

const userPanelTabs = [
  { id: 'security', label: 'Security' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'audit', label: 'Audit' },
] as const;

type UserPanelTabId = (typeof userPanelTabs)[number]['id'];

const peopleWorkspaceTabs = [
  { id: 'directory', label: 'Account directory', description: 'Real login status and canonical users' },
  { id: 'provisioning', label: 'Invite & provision', description: 'Create or restore account access' },
  { id: 'prototype', label: 'Prototype setup', description: 'Local onboarding and role mock data' },
] as const;

type PeopleWorkspaceTabId = (typeof peopleWorkspaceTabs)[number]['id'];

export function AdminUsersScreen() {
  const { user: authUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state: capabilityState, manageUsers, refetch: refetchCapability } = useManageUsersCapability();
  const users = useUserAssignmentsStore(s => s.users);
  const assignments = useUserAssignmentsStore(s => s.assignments);
  const setupAssignments = useUserAssignmentsStore(s => s.setupAssignments);
  const auditLog = useUserAssignmentsStore(s => s.auditLog);
  const getRecentAudit = useUserAssignmentsStore(s => s.getRecentAudit);
  const addUser = useUserAssignmentsStore(s => s.addUser);
  const editUser = useUserAssignmentsStore(s => s.editUser);
  const deleteUser = useUserAssignmentsStore(s => s.deleteUser);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<UserPanelTabId>('assignments');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const requestedWorkspace = searchParams.get('mode');
  const activeWorkspace: PeopleWorkspaceTabId = peopleWorkspaceTabs.some((tab) => tab.id === requestedWorkspace)
    ? requestedWorkspace as PeopleWorkspaceTabId
    : 'directory';

  const setActiveWorkspace = (nextWorkspace: PeopleWorkspaceTabId) => {
    const next = new URLSearchParams(searchParams);
    if (nextWorkspace === 'directory') next.delete('mode');
    else next.set('mode', nextWorkspace);
    setSearchParams(next, { replace: true });
  };

  const recentAudit = getRecentAudit(40);

  const userById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  const rows: AdminUserRow[] = useMemo(() => {
    return [...users]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((user) => {
        const groupId = activeGroupId(assignments, user.id);
        const setup = setupAssignments[user.id];
        const supervisorName = setup?.supervisorId
          ? (userById.get(setup.supervisorId)?.name ?? setup.supervisorId)
          : '—';
        const roleLabel = setup?.role
          ? (JOURNEY_ROLE_LABELS[setup.role] ?? setup.role)
          : (setup?.discipline || '—');
        const onboardingLabel = setup?.onboarding
          ? `${setup.onboarding.trackId} (${setup.onboarding.status})`
          : 'Unassigned';

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: roleLabel,
          groups: groupLabel(groupId),
          groupId,
          status: user.status,
          accessStatus: statusToAccessStatus(user.status),
          supervisor: supervisorName,
          firstDay: formatDateLabel(setup?.firstDay),
          discipline: setup?.discipline ?? '—',
          onboarding: onboardingLabel,
        };
      });
  }, [users, assignments, setupAssignments, userById]);

  const canonicalRows = useMemo(() => rows.filter(r => CANONICAL_ACCOUNT_IDS.has(r.userId)), [rows]);
  const demoRows = useMemo(() => rows.filter(r => !CANONICAL_ACCOUNT_IDS.has(r.userId)), [rows]);

  const userColumns: readonly DataTableColumn<AdminUserRow>[] = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role / discipline' },
    { key: 'groups', label: 'Group' },
    { key: 'accessStatus', label: 'Access', status: true },
    { key: 'supervisor', label: 'Supervisor' },
    { key: 'firstDay', label: 'First day' },
    { key: 'onboarding', label: 'Onboarding' },
  ];

  const metrics = useMemo((): MetricTileData[] => {
    const activeCount = users.filter(u => u.status === 'active').length;
    const suspendedCount = users.filter(u => u.status === 'suspended').length;
    const pendingCount = users.filter(u => u.status === 'pending').length;
    const privilegedUserIds = new Set(
      assignments
        .filter(a => !a.revokedAt && PRIVILEGED_GROUP_IDS.has(a.groupId))
        .map(a => a.userId),
    );
    const withSupervisor = Object.values(setupAssignments).filter(
      s => s.active && s.supervisorId,
    ).length;
    const withOnboarding = Object.values(setupAssignments).filter(
      s => s.active && s.onboarding,
    ).length;

    return [
      {
        label: 'Active users',
        value: String(activeCount),
        helper: `${users.length} total in demo directory`,
        tone: 'teal',
      },
      {
        label: 'Suspended',
        value: String(suspendedCount),
        helper: pendingCount ? `${pendingCount} pending` : 'Soft-deactivated accounts',
        tone: 'orange',
      },
      {
        label: 'Privileged',
        value: String(privilegedUserIds.size),
        helper: 'Super Admin / Admin / access admin',
        tone: 'amber',
      },
      {
        label: 'Supervised',
        value: String(withSupervisor),
        helper: `${withOnboarding} with onboarding track`,
        tone: 'green',
      },
    ];
  }, [users, assignments, setupAssignments]);

  const securitySummaries = useMemo((): SecuritySummary[] => {
    const privileged = new Set(
      assignments
        .filter(a => !a.revokedAt && PRIVILEGED_GROUP_IDS.has(a.groupId))
        .map(a => a.userId),
    ).size;
    const clinicalRoles = new Set(['RN', 'LVN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'DON']);
    const clinical = Object.values(setupAssignments).filter(
      s => s.active && s.role && clinicalRoles.has(s.role),
    ).length;
    const pending = users.filter(u => u.status === 'pending').length;
    const withSetupRole = Object.values(setupAssignments).filter(s => s.active && s.role).length;

    return [
      {
        label: 'Privileged lane',
        value: `${privileged} users`,
        detail: 'Users with Super Admin, Admin, System, or User Access Admin group assignment.',
        status: privileged > 0 ? 'locked' : 'ready',
        tone: 'slate',
      },
      {
        label: 'Journey roles assigned',
        value: `${withSetupRole} users`,
        detail: 'Active setup rows with a CMS/ops journey role (RN, DON, ADM, …).',
        status: 'validated',
        tone: 'teal',
      },
      {
        label: 'Clinical access',
        value: `${clinical} users`,
        detail: 'Active users whose setup role is a clinical discipline.',
        status: 'ready',
        tone: 'green',
      },
      {
        label: 'Pending activation',
        value: `${pending} users`,
        detail: 'Accounts in pending status awaiting activation or group confirmation.',
        status: pending > 0 ? 'attention' : 'ready',
        tone: 'orange',
      },
    ];
  }, [users, assignments, setupAssignments]);

  const assignmentLanes = useMemo((): AssignmentLane[] => {
    const counts = new Map<string, number>();
    for (const a of assignments) {
      if (a.revokedAt) continue;
      counts.set(a.groupId, (counts.get(a.groupId) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1] || groupLabel(a[0]).localeCompare(groupLabel(b[0])))
      .slice(0, 12)
      .map(([groupId, n]) => {
        const group = USER_GROUP_BY_ID[groupId];
        const isPrivileged = PRIVILEGED_GROUP_IDS.has(groupId);
        return {
          group: group?.name ?? groupId,
          owner: group?.description?.slice(0, 72) ?? 'Group membership',
          status: isPrivileged ? 'locked' : n > 0 ? 'ready' : 'pending',
          users: String(n),
        };
      });
  }, [assignments]);

  const securityCards = useMemo((): SurfaceCardData[] => {
    const privileged = new Set(
      assignments
        .filter(a => !a.revokedAt && PRIVILEGED_GROUP_IDS.has(a.groupId))
        .map(a => a.userId),
    ).size;
    const active = users.filter(u => u.status === 'active').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const total = Math.max(users.length, 1);
    const activePct = Math.round((active / total) * 100);
    const setupComplete = Object.values(setupAssignments).filter(
      s => s.active && (s.role || s.supervisorId || s.firstDay),
    ).length;
    const setupPct = Math.round((setupComplete / total) * 100);

    return [
      {
        body: `${privileged} privileged group members. Demo directory only — dual-control and MFA are not enforced against a real IdP in this phase.`,
        icon: LockKeyhole,
        progress: Math.min(100, privileged * 12),
        status: 'locked',
        title: 'Privileged access (demo)',
        tone: 'slate',
      },
      {
        body: `${setupComplete} of ${users.length} users have role, supervisor, or first-day setup data from the identity registry.`,
        icon: ShieldCheck,
        progress: setupPct,
        status: 'validated',
        title: 'Setup coverage',
        tone: 'teal',
      },
      {
        body: `${suspended} suspended (soft-deactivated). Active rate ${activePct}% of the local demo directory.`,
        icon: ClipboardCheck,
        progress: activePct,
        status: suspended > 0 ? 'review-required' : 'ready',
        title: 'Directory hygiene',
        tone: 'orange',
      },
    ];
  }, [users, assignments, setupAssignments]);

  const groupOptions = useMemo(
    () =>
      USER_GROUPS.map(g => ({
        value: g.id,
        label: g.name,
      })),
    [],
  );

  const roleOptions = useMemo(
    () => [
      { value: '', label: '— No journey role —' },
      ...JOURNEY_ROLES.map(r => ({ value: r, label: JOURNEY_ROLE_LABELS[r] })),
    ],
    [],
  );

  const supervisorOptions = useMemo(() => {
    const exclude = selectedUserId;
    return [
      { value: '', label: '— No supervisor —' },
      ...users
        .filter(u => u.id !== exclude && u.status !== 'suspended')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(u => ({ value: u.id, label: `${u.name} (${u.email})` })),
    ];
  }, [users, selectedUserId]);

  const selectedUser = selectedUserId ? userById.get(selectedUserId) : undefined;
  const selectedSetup = selectedUserId ? setupAssignments[selectedUserId] : undefined;
  const isProtected = selectedUserId ? PROTECTED_USER_IDS.has(selectedUserId) : false;

  const navigate = useNavigate();

  const openEdit = (userId: string) => {
    const user = userById.get(userId);
    if (!user) return;
    const groupId = activeGroupId(assignments, userId);
    const setup = setupAssignments[userId];
    setSelectedUserId(userId);
    setEditForm(buildEditForm(user, groupId, setup));
    setFormError(null);
    setFormSuccess(null);
    setShowCreate(false);
  };

  // ADR-0002 Phase 6: a directory row opens the server-authoritative control-plane
  // detail surface (/admin/users/:userId). Inline create still uses openEdit().
  const handleRowClick = (row: AdminUserRow) => {
    navigate(`/admin/users/${row.userId}`);
  };

  const handleSaveEdit = () => {
    if (!selectedUserId || !editForm) return;
    if (PROTECTED_USER_IDS.has(selectedUserId)) {
      setFormError('This user record is protected and cannot be edited here.');
      return;
    }

    const result = editUser(selectedUserId, DEMO_ACTOR_USER_ID, {
      name: editForm.name,
      email: editForm.email,
      groupId: editForm.groupId,
      status: editForm.status,
      setup: setupPayloadFromForm(editForm),
    });

    if (!result.ok) {
      setFormError(result.error ?? 'Save failed.');
      setFormSuccess(null);
      return;
    }

    setFormError(null);
    setFormSuccess('Saved to local demo directory (localStorage).');
    // Refresh form from store after merge
    const user = useUserAssignmentsStore.getState().getUserById(selectedUserId);
    const setup = useUserAssignmentsStore.getState().getSetupAssignment(selectedUserId);
    const groupId = activeGroupId(useUserAssignmentsStore.getState().assignments, selectedUserId);
    if (user) setEditForm(buildEditForm(user, groupId, setup));
  };

  const handleDeactivate = () => {
    if (!selectedUserId) return;
    if (PROTECTED_USER_IDS.has(selectedUserId)) {
      setFormError('This user is protected and cannot be removed.');
      return;
    }
    const result = deleteUser(selectedUserId, DEMO_ACTOR_USER_ID);
    if (!result.ok) {
      setFormError(result.error ?? 'Deactivate failed.');
      setFormSuccess(null);
      return;
    }
    setFormError(null);
    setFormSuccess('Demo directory only — marked deactivated in localStorage. This does NOT suspend a real login; use “User status (server-authoritative)” on the Security tab to suspend access.');
    const user = useUserAssignmentsStore.getState().getUserById(selectedUserId);
    const setup = useUserAssignmentsStore.getState().getSetupAssignment(selectedUserId);
    const groupId = activeGroupId(useUserAssignmentsStore.getState().assignments, selectedUserId);
    if (user) setEditForm(buildEditForm(user, groupId, setup));
  };

  const handleCreate = () => {
    const emailForLookup = createForm.email.trim().toLowerCase();
    const setup = setupPayloadFromForm(createForm);
    const result = addUser({
      name: createForm.name,
      email: createForm.email,
      groupId: createForm.groupId,
      status: createForm.status,
      setup,
    });
    if (!result.ok) {
      setFormError(result.error ?? 'Create failed.');
      setFormSuccess(null);
      return;
    }
    setFormError(null);
    setFormSuccess('User created in local demo directory.');
    setCreateForm(emptyCreateForm());
    setShowCreate(false);
    // Select the newly created user (match by email captured before reset)
    const created = useUserAssignmentsStore
      .getState()
      .users.find(u => u.email.toLowerCase() === emailForLookup);
    if (created) openEdit(created.id);
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const onboardingOptions = [
    { value: 'none', label: 'No onboarding track' },
    { value: 'role', label: 'Assign role track (modulesForRole)' },
  ];

  const fieldClass = 'grid gap-md tablet-l:grid-cols-2';

  // Server-authoritative capability gate (COG). `manageUsers` is derived from
  // the SAME server authority as the protected admin endpoints (never a
  // client-side role string), so an authenticated Cognito administrator is
  // correctly allowed while ordinary users are denied. Enforcement still happens
  // server-side on every mutation; this only decides what to render. Placed
  // after all hooks to satisfy rules-of-hooks.
  const gateShell = (children: ReactNode) => (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-users"
      data-route="/admin/users"
      data-template="matrix"
    >
      <div className="rounded-2xl border border-hairline bg-white p-8 text-center">{children}</div>
    </section>
  );

  if (capabilityState === 'idle' || capabilityState === 'loading') {
    return gateShell(
      <>
        <h2 className="text-xl font-medium text-ink mb-2">Checking access…</h2>
        <p className="text-sm text-muted">Verifying your administrator permissions.</p>
      </>,
    );
  }

  if (capabilityState === 'error') {
    return gateShell(
      <>
        <h2 className="text-xl font-medium text-ink mb-2">Couldn’t verify access</h2>
        <p className="text-sm text-muted mb-4">
          We couldn’t confirm your administrator permissions. This is not a grant of access — please retry.
        </p>
        <button
          type="button"
          className="inline-flex min-h-tap items-center rounded-2xl border border-tone-teal-border bg-tone-teal-bg px-lg text-xs font-medium uppercase tracking-tag text-ink hover:bg-surface-hover"
          onClick={refetchCapability}
        >
          Retry
        </button>
      </>,
    );
  }

  if (!manageUsers) {
    return gateShell(
      <>
        <h2 className="text-xl font-medium text-ink mb-2">Access denied</h2>
        <p className="text-sm text-muted">You need administrator permissions to manage users.</p>
      </>,
    );
  }

  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-users"
      data-route="/admin/users"
      data-template="matrix"
    >
      <nav aria-label="People and account workspaces" className="flex max-w-full gap-sm overflow-x-auto rounded-[24px] bg-white p-sm shadow-[0_12px_34px_rgba(0,47,48,0.06)] tablet-l:grid tablet-l:grid-cols-3">
        {peopleWorkspaceTabs.map((workspace) => (
          <button
            aria-pressed={activeWorkspace === workspace.id}
            className={cx(
              'min-w-[230px] rounded-[18px] px-lg py-md text-left transition-colors focus-visible:outline-none focus-visible:shadow-focus tablet-l:min-w-0',
              activeWorkspace === workspace.id
                ? 'bg-tone-teal-bg text-brand-teal-deep'
                : 'text-secondary hover:bg-surface-hover hover:text-brand-teal-deep',
            )}
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.id)}
            type="button"
          >
            <span className="block text-sm font-medium">{workspace.label}</span>
            <span className="mt-xs block text-[11px] font-light text-muted">{workspace.description}</span>
          </button>
        ))}
      </nav>

      {activeWorkspace === 'directory' && (
        <div className="grid gap-lg" aria-label="Account directory">
          <div className="flex flex-wrap items-start justify-between gap-md rounded-2xl bg-white px-lg py-md shadow-[0_10px_30px_rgba(0,47,48,0.05)]">
            <div>
              <p className="text-sm font-medium text-brand-teal-deep">Canonical account directory</p>
              <p className="mt-xs max-w-[760px] text-xs font-light leading-relaxed text-muted">
                This is the authoritative account-status view. Open a user record for effective access, page visibility, and signature authority; suspend or reactivate only through the audited lifecycle controls.
              </p>
            </div>
            <ToneTag tone="teal">Server projection</ToneTag>
          </div>

          {/* Real Care Indeed accounts (canonical). Passwords are never shown or
              stored here — account access is managed under Invite & provision. */}
          <div className="grid gap-sm rounded-2xl bg-white p-lg shadow-[0_10px_30px_rgba(0,47,48,0.05)]">
            <div className="flex flex-wrap items-center gap-sm">
              <h3 className="text-sm font-medium text-brand-teal-deep">Canonical accounts</h3>
              <span className="rounded-full border border-tone-teal-border bg-tone-teal-bg px-sm py-[2px] text-[10px] font-medium uppercase tracking-wider text-tone-teal-text">
                {canonicalRows.length} real
              </span>
            </div>
            <p className="text-xs text-muted">
              Real Care Indeed people. No passwords are displayed or stored on this record; sign-in credentials
              are provisioned only under Invite &amp; provision and are never returned to the UI.
            </p>
            <div className="grid gap-sm tablet-l:grid-cols-2">
              {canonicalRows.map((r) => (
                <div key={r.userId} className="flex items-center justify-between gap-md rounded-lg border border-hairline bg-surface-glass p-md">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-teal-deep">{r.name}</p>
                    <p className="truncate text-xs text-muted">{r.email} · {r.role}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-xs">
                    <button
                      type="button"
                      onClick={() => navigate(`/community/users/${r.userId}`)}
                      className="rounded-full border border-tone-teal-border bg-white px-md py-xs text-[11px] font-medium text-brand-teal transition-colors hover:bg-tone-teal-bg focus-visible:outline-none focus-visible:shadow-focus"
                      title={`Open ${r.name}'s community profile`}
                    >
                      Community profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRowClick(r)}
                      className="rounded-full border border-hairline bg-white px-md py-xs text-[11px] font-medium text-muted transition-colors hover:text-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus"
                      title={`Open ${r.name}'s control-plane record`}
                    >
                      Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ServerUserAccessPanel />
        </div>
      )}

      {activeWorkspace === 'provisioning' && (
        <div className="grid gap-lg" aria-label="Invite and provision account access">
          <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/45 px-lg py-md text-xs font-light leading-relaxed text-tone-orange-text" role="note">
            Provisioning creates or restores login access. It does not independently assign permissions, page access, or signature authority.
          </div>
          <AccountProvisioningCard />
        </div>
      )}

      {activeWorkspace === 'prototype' && (
        <>

      <div
        className="rounded-lg border border-tone-amber-border bg-tone-amber-bg/40 px-lg py-md text-sm text-ink"
        role="status"
      >
        <strong className="font-medium">Demo / localStorage only — not a production directory.</strong>
        {' '}
        Roster, roles, supervisors, and onboarding tracks persist in{' '}
        <code className="text-xs">ci.identityRegistry.v1</code> until Phase 2F (real IdP).
      </div>

      <div
        className="rounded-lg border border-amber-300/70 bg-amber-50/90 px-lg py-md text-xs text-amber-950"
        role="region"
        aria-label={DEMO_IMPERSONATION_LABEL}
      >
        <div className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
          {DEMO_IMPERSONATION_LABEL}
        </div>
        <p className="mt-1 text-[11px] text-amber-900/90">
          Actor context for edit/delete:{' '}
          <code className="text-[11px]">{DEMO_ACTOR_USER_ID}</code>
          {authUser?.role ? (
            <span>
              {' '}
              · auth role <strong>{authUser.role}</strong>
            </span>
          ) : null}
          . Mutations also write to the demo audit log ({USER_SETUP_AUDIT_DEMO_LABEL.toLowerCase()}).
        </p>
      </div>

      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-1">
        <section className="grid content-start gap-lg" aria-label="Admin users role and access assignment matrix">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <p className="text-sm text-secondary">
              {demoRows.length} prototype/demo users · {canonicalRows.length} canonical accounts moved to Account directory · click a row to edit setup
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowCreate(v => !v);
                setSelectedUserId(null);
                setEditForm(null);
                setFormError(null);
                setFormSuccess(null);
              }}
            >
              <span className="inline-flex items-center gap-xs">
                <UserPlus className="h-icon-sm w-icon-sm" aria-hidden="true" />
                {showCreate ? 'Cancel create' : 'Add user'}
              </span>
            </Button>
          </div>

          {formError && (
            <div className="rounded-md border border-tone-orange-border bg-tone-orange-bg px-md py-sm text-sm text-tone-orange-text" role="alert">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="rounded-md border border-tone-green-border bg-tone-green-bg px-md py-sm text-sm text-tone-green-text" role="status">
              {formSuccess}
            </div>
          )}

          {showCreate && (
            <section className="rounded-lg border border-tone-teal-border bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
              <h3 className="mb-lg text-h3 font-medium text-ink">Create user</h3>
              <div className={fieldClass}>
                <FormField label="Full name" required>
                  {(props) => (
                    <Input
                      {...props}
                      value={createForm.name}
                      onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    />
                  )}
                </FormField>
                <FormField label="Email (@careindeed.com)" required>
                  {(props) => (
                    <Input
                      {...props}
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="name@careindeed.com"
                    />
                  )}
                </FormField>
                <FormField label="User group" required>
                  {(props) => (
                    <Select
                      {...props}
                      options={groupOptions}
                      value={createForm.groupId}
                      onChange={(e) => setCreateForm(f => ({ ...f, groupId: e.target.value }))}
                    />
                  )}
                </FormField>
                <FormField label="Status">
                  {(props) => (
                    <Select
                      {...props}
                      options={statusOptions}
                      value={createForm.status}
                      onChange={(e) =>
                        setCreateForm(f => ({
                          ...f,
                          status: e.target.value as CreateFormState['status'],
                        }))
                      }
                    />
                  )}
                </FormField>
                <FormField label="Journey role">
                  {(props) => (
                    <Select
                      {...props}
                      options={roleOptions}
                      value={createForm.role}
                      onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value }))}
                    />
                  )}
                </FormField>
                <FormField label="Discipline">
                  {(props) => (
                    <Input
                      {...props}
                      value={createForm.discipline}
                      onChange={(e) => setCreateForm(f => ({ ...f, discipline: e.target.value }))}
                    />
                  )}
                </FormField>
                <FormField label="Supervisor">
                  {(props) => (
                    <Select
                      {...props}
                      options={[
                        { value: '', label: '— No supervisor —' },
                        ...users
                          .filter(u => u.status !== 'suspended')
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(u => ({ value: u.id, label: `${u.name} (${u.email})` })),
                      ]}
                      value={createForm.supervisorId}
                      onChange={(e) => setCreateForm(f => ({ ...f, supervisorId: e.target.value }))}
                    />
                  )}
                </FormField>
                <FormField label="Onboarding track">
                  {(props) => (
                    <Select
                      {...props}
                      options={onboardingOptions}
                      value={createForm.onboardingTrack}
                      onChange={(e) =>
                        setCreateForm(f => ({
                          ...f,
                          onboardingTrack: e.target.value as 'none' | 'role',
                        }))
                      }
                    />
                  )}
                </FormField>
                <FormField label="First day">
                  {(props) => (
                    <Input
                      {...props}
                      type="date"
                      value={createForm.firstDay}
                      onChange={(e) => setCreateForm(f => ({ ...f, firstDay: e.target.value }))}
                    />
                  )}
                </FormField>
                <FormField label="Hire date">
                  {(props) => (
                    <Input
                      {...props}
                      type="date"
                      value={createForm.hireDate}
                      onChange={(e) => setCreateForm(f => ({ ...f, hireDate: e.target.value }))}
                    />
                  )}
                </FormField>
              </div>
              <div className="mt-lg flex flex-wrap justify-end gap-md">
                <Button size="sm" variant="secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button
                  className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95 font-light"
                  size="sm"
                  onClick={handleCreate}
                >
                  Create user
                </Button>
              </div>
            </section>
          )}

          {/* Prototype / demo directory — seeded personas only. Real Care Indeed
              accounts live under the Account directory tab. */}
          <div className="grid gap-sm">
            <div className="flex flex-wrap items-center gap-sm">
              <h3 className="text-sm font-medium text-ink">Prototype / demo users</h3>
              <span className="rounded-full border border-tone-orange-border bg-tone-orange-bg px-sm py-[2px] text-[10px] font-medium uppercase tracking-wider text-tone-orange-text">
                {demoRows.length} demo
              </span>
            </div>
            <p className="text-xs text-muted">
              Seeded demo personas — not real Care Indeed staff. Canonical accounts are moved to the Account directory tab.
            </p>
            <DataTable
              columns={userColumns}
              label="Prototype / demo users"
              rows={demoRows}
              onRowClick={handleRowClick}
            />
          </div>

          {selectedUser && editForm && (
            <section className="mt-md rounded-lg border border-tone-orange-border bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest transition duration-normal">
              <div className="mb-lg flex flex-wrap items-start justify-between gap-lg border-b border-hairline pb-md">
                <div className="grid gap-xs">
                  <div className="flex flex-wrap items-center gap-sm">
                    <h3 className="text-h3 font-medium text-ink">User setup</h3>
                    <ToneBadge size="sm" status={statusToAccessStatus(selectedUser.status)} />
                    {isProtected && <ToneBadge size="sm" status="locked" />}
                  </div>
                  <p className="text-sm text-secondary">
                    {selectedUser.name} · {selectedUser.email} · <code className="text-xs">{selectedUser.id}</code>
                  </p>
                  <p className="max-w-content text-xs text-muted">
                    Edit identity fields, group assignment, journey role, supervisor, first day, and onboarding track.
                    Changes persist to the local identity registry only.
                  </p>
                  {selectedSetup?.journeyEmployeeSeedRef && (
                    <p className="text-xs text-muted">
                      Journey seed ref: <code>{selectedSetup.journeyEmployeeSeedRef}</code>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedUserId(null);
                    setEditForm(null);
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  className="min-h-tap rounded-md px-md text-xs font-medium text-brand-teal transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
                  type="button"
                >
                  Close
                </button>
              </div>

              <div className={fieldClass}>
                <FormField label="Full name" required>
                  {(props) => (
                    <Input
                      {...props}
                      disabled={isProtected}
                      value={editForm.name}
                      onChange={(e) => setEditForm(f => (f ? { ...f, name: e.target.value } : f))}
                    />
                  )}
                </FormField>
                <FormField label="Email (@careindeed.com)" required>
                  {(props) => (
                    <Input
                      {...props}
                      type="email"
                      disabled={isProtected}
                      value={editForm.email}
                      onChange={(e) => setEditForm(f => (f ? { ...f, email: e.target.value } : f))}
                    />
                  )}
                </FormField>
                <FormField label="User group">
                  {(props) => (
                    <Select
                      {...props}
                      disabled={isProtected}
                      options={groupOptions}
                      value={editForm.groupId}
                      onChange={(e) => setEditForm(f => (f ? { ...f, groupId: e.target.value } : f))}
                    />
                  )}
                </FormField>
                <FormField label="Status">
                  {(props) => (
                    <Select
                      {...props}
                      disabled={isProtected}
                      options={statusOptions}
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm(f =>
                          f
                            ? { ...f, status: e.target.value as EditFormState['status'] }
                            : f,
                        )
                      }
                    />
                  )}
                </FormField>
                <FormField label="Journey role">
                  {(props) => (
                    <Select
                      {...props}
                      disabled={isProtected}
                      options={roleOptions}
                      value={editForm.role}
                      onChange={(e) => setEditForm(f => (f ? { ...f, role: e.target.value } : f))}
                    />
                  )}
                </FormField>
                <FormField label="Discipline">
                  {(props) => (
                    <Input
                      {...props}
                      disabled={isProtected}
                      value={editForm.discipline}
                      onChange={(e) =>
                        setEditForm(f => (f ? { ...f, discipline: e.target.value } : f))
                      }
                    />
                  )}
                </FormField>
                <FormField label="Supervisor">
                  {(props) => (
                    <Select
                      {...props}
                      disabled={isProtected}
                      options={supervisorOptions}
                      value={editForm.supervisorId}
                      onChange={(e) =>
                        setEditForm(f => (f ? { ...f, supervisorId: e.target.value } : f))
                      }
                    />
                  )}
                </FormField>
                <FormField label="Onboarding track">
                  {(props) => (
                    <Select
                      {...props}
                      disabled={isProtected}
                      options={onboardingOptions}
                      value={editForm.onboardingTrack}
                      onChange={(e) =>
                        setEditForm(f =>
                          f
                            ? { ...f, onboardingTrack: e.target.value as 'none' | 'role' }
                            : f,
                        )
                      }
                    />
                  )}
                </FormField>
                <FormField label="First day">
                  {(props) => (
                    <Input
                      {...props}
                      type="date"
                      disabled={isProtected}
                      value={editForm.firstDay}
                      onChange={(e) =>
                        setEditForm(f => (f ? { ...f, firstDay: e.target.value } : f))
                      }
                    />
                  )}
                </FormField>
                <FormField label="Hire date">
                  {(props) => (
                    <Input
                      {...props}
                      type="date"
                      disabled={isProtected}
                      value={editForm.hireDate}
                      onChange={(e) =>
                        setEditForm(f => (f ? { ...f, hireDate: e.target.value } : f))
                      }
                    />
                  )}
                </FormField>
              </div>

              {selectedSetup?.onboarding && (
                <div className="mt-md rounded-md border border-hairline bg-surface-glass p-md text-xs text-secondary">
                  <p className="font-medium text-ink">Current track: {selectedSetup.onboarding.trackId}</p>
                  <p className="mt-xs">
                    Status: {selectedSetup.onboarding.status} · Modules:{' '}
                    {selectedSetup.onboarding.moduleIds.length}
                    {selectedSetup.onboarding.dueDate
                      ? ` · Due ${formatDateLabel(selectedSetup.onboarding.dueDate)}`
                      : ''}
                  </p>
                </div>
              )}

              <div className="mt-md flex flex-wrap justify-end gap-md">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isProtected || selectedUser.status === 'suspended'}
                  onClick={handleDeactivate}
                  title="Demo directory only — does not suspend a real login."
                >
                  Deactivate (demo)
                </Button>
                <Button
                  className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95 font-light"
                  size="sm"
                  disabled={isProtected}
                  onClick={handleSaveEdit}
                >
                  Save changes
                </Button>
              </div>
            </section>
          )}

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Admin user security summary">
            {securitySummaries.map((summary) => (
              <article
                className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden shadow-rest"
                key={summary.label}
              >
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
          <nav aria-label="User admin tabs" className="flex max-w-full items-stretch overflow-x-auto font-montserrat">
            {userPanelTabs.map((tab) => (
              <button
                aria-selected={activePanel === tab.id}
                className={cx(
                  workspaceCompactTabClass,
                  activePanel === tab.id ? workspaceTabActiveClass : workspaceTabInactiveClass,
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

              <section
                className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest"
                aria-labelledby="mfa-readiness-title"
              >
                <div className="mb-lg flex items-start justify-between gap-md">
                  <div className="grid gap-sm">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-tone-green-bg text-tone-green-text">
                      <Smartphone aria-hidden="true" className="h-icon-md w-icon-md" />
                    </span>
                    <div>
                      <h2 className="text-h2 font-medium text-ink" id="mfa-readiness-title">
                        Directory readiness (demo)
                      </h2>
                      <p className="mt-xs text-sm text-muted">
                        Counts from the local identity registry — MFA is not enforced against a production IdP.
                      </p>
                    </div>
                  </div>
                  <ToneBadge size="sm" status="ready" />
                </div>

                <div className="grid gap-sm">
                  {(
                    [
                      ['Active accounts', `${users.filter(u => u.status === 'active').length} users`, 'ready'],
                      ['Pending enrollment', `${users.filter(u => u.status === 'pending').length} users`, 'pending'],
                      [
                        'Privileged lane',
                        `${new Set(assignments.filter(a => !a.revokedAt && PRIVILEGED_GROUP_IDS.has(a.groupId)).map(a => a.userId)).size} users`,
                        'locked',
                      ],
                      [
                        'With supervisor',
                        `${Object.values(setupAssignments).filter(s => s.active && s.supervisorId).length} users`,
                        'validated',
                      ],
                    ] as const
                  ).map(([label, value, status]) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-md rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md"
                      key={label}
                    >
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
            <section
              className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest"
              aria-labelledby="assignment-lanes-title"
              role="tabpanel"
            >
              <div className="mb-lg flex items-start gap-md">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-tone-teal-bg text-tone-teal-text">
                  <UserCog aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink" id="assignment-lanes-title">
                    Role and group lanes
                  </h2>
                  <p className="mt-xs text-sm text-muted">
                    Live membership counts from active role assignments in the identity store.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-hairline rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset">
                {assignmentLanes.length === 0 && (
                  <p className="p-md text-sm text-muted">No active group assignments.</p>
                )}
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
                      <span className="text-xs text-secondary">Active assignment count</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activePanel === 'audit' && (
            <SurfaceCard
              card={{
                // Demo audit trail — not tamper-evident (client localStorage only).
                body: `${USER_SETUP_AUDIT_DEMO_LABEL}. Mutations append to ci.identitySetupAudit.v1. Production IdP-bound chain is Phase 2F.`,
                icon: BadgeCheck,
                progress: Math.min(100, recentAudit.length * 5),
                status: recentAudit.length ? 'ready' : 'pending',
                title: 'Audit evidence (demo)',
                tone: 'teal',
              }}
            >
              <div className="grid gap-sm border-t border-hairline pt-md">
                <div className="rounded-md border border-amber-300/60 bg-amber-50/80 px-sm py-xs text-[11px] text-amber-950">
                  <strong>{USER_SETUP_AUDIT_DEMO_LABEL}</strong>
                  {' — '}
                  editable via browser storage; not a compliance system of record.
                </div>
                {(
                  [
                    ['Registry key', 'ci.identityRegistry.v1', 'locked'],
                    ['Audit key', 'ci.identitySetupAudit.v1', 'ready'],
                    ['Users persisted', `${users.length} records`, 'validated'],
                    ['Audit entries', `${auditLog.length} total`, recentAudit.length ? 'certified' : 'pending'],
                    ['Actor (demo)', DEMO_ACTOR_USER_ID, 'certified'],
                  ] as const
                ).map(([label, value, status]) => (
                  <div className="flex flex-wrap items-center justify-between gap-sm" key={`${label}-${value}`}>
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

                <div className="mt-sm border-t border-hairline pt-md">
                  <p className="mb-sm text-tag uppercase tracking-tag text-muted">
                    Recent entries (newest first)
                  </p>
                  {recentAudit.length === 0 && (
                    <p className="text-xs text-muted">
                      No audit events yet. Create, edit, or deactivate a user to populate this list.
                    </p>
                  )}
                  <ul className="grid max-h-80 gap-sm overflow-y-auto">
                    {recentAudit.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-md border border-hairline bg-surface-glass px-sm py-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-xs">
                          <span className="text-xs font-medium text-ink">{entry.action}</span>
                          <time className="text-[10px] text-muted" dateTime={entry.createdAt}>
                            {entry.createdAt}
                          </time>
                        </div>
                        <p className="mt-xs text-[11px] text-secondary">
                          actor <code className="text-[10px]">{entry.actorUserId}</code>
                          {entry.targetUserId ? (
                            <>
                              {' → '}
                              <code className="text-[10px]">{entry.targetUserId}</code>
                            </>
                          ) : null}
                        </p>
                        {entry.detail ? (
                          <p className="mt-xs text-[11px] text-muted">{entry.detail}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SurfaceCard>
          )}
        </aside>
      </section>
        </>
      )}
    </section>
  );
}

export default AdminUsersScreen;
