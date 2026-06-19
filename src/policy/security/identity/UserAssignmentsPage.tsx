import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import { Plus, Pencil, Trash2, X, AlertCircle, CheckCircle, ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { AuthApi, AuthApiError } from '@/auth/api';
import { authorizeForAuthUser } from './authorize';
import { resolveUserIdFromAuth } from './demoUsers';
import {
  getIdentityRegistrySnapshot,
  hydrateIdentityRegistry,
  useUserAssignmentsStore,
  type AddUserPayload,
  type EditUserPayload,
} from './userAssignmentsStore';
import { DEFAULT_AUTHENTICATED_GROUP_ID } from './identityNormalization';
import type { PermissionId } from './types';
import { USER_GROUPS, USER_GROUP_BY_ID } from './userGroups';
import { PageAccessMatrix } from './PageAccessMatrix';
import { canManagePageAccess, canWritePage } from './pageAccess';
import { PageHeader, SurfaceCard, DataGrid } from '@/policy/components/ui';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
    isActive
      ? 'bg-[var(--brand-primary,#00797D)] text-white border-[var(--brand-primary,#00797D)]'
      : 'border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)]'
  }`;

const PREVIEW_PERMISSIONS: PermissionId[] = ['policy.approve', 'form.sign', 'ceu.complete'];

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  suspended: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const GROUP_SELECTABLES = USER_GROUPS;

// ─── Empty form ───────────────────────────────────────────────────────────────

function emptyAddForm(): AddUserPayload {
  return { name: '', email: '', groupId: DEFAULT_AUTHENTICATED_GROUP_ID, status: 'pending', sendInvite: false };
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 focus:border-[#0f766e]"
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      title="Select option"
      className="border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 focus:border-[#0f766e]"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Add User Modal ───────────────────────────────────────────────────────────

function AddUserModal({ onClose }: { onClose: () => void }) {
  const addUser = useUserAssignmentsStore(s => s.addUser);
  const [form, setForm] = useState<AddUserPayload>(emptyAddForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function setField<K extends keyof AddUserPayload>(key: K, value: AddUserPayload[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = addUser(form);
    if (!result.ok) { setError(result.error ?? 'Unknown error.'); return; }
    setSuccess(true);
    setTimeout(onClose, 800);
  }

  return (
    <Modal title="Add User" onClose={onClose}>
      {success ? (
        <div className="flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle size={16} /> User added successfully.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput value={form.name} onChange={v => setField('name', v)} placeholder="Jane Smith" />
          </Field>
          <Field label="Email" required>
            <TextInput value={form.email} onChange={v => setField('email', v)} placeholder="jane@careindeed.com" type="email" />
          </Field>
          <Field label="User Group" required>
            <SelectInput
              value={form.groupId}
              onChange={v => setField('groupId', v)}
              options={GROUP_SELECTABLES.map(g => ({ value: g.id, label: g.name }))}
            />
          </Field>
          <Field label="Status">
            <SelectInput
              value={form.status}
              onChange={v => setField('status', v as AddUserPayload['status'])}
              options={[{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended' }]}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.sendInvite ?? false}
              onChange={e => setField('sendInvite', e.target.checked)}
              className="rounded border-slate-300 text-[#0f766e]"
            />
            Send invite email <span className="text-xs text-slate-400">(unavailable)</span>
          </label>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-1.5 text-sm rounded-md bg-[#0f766e] text-white hover:bg-[#0d6461] font-semibold">Add User</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({ userId, onClose, currentUserId }: { userId: string; onClose: () => void; currentUserId: string }) {
  const { users, assignments, editUser } = useUserAssignmentsStore(useShallow(s => ({
    users: s.users, assignments: s.assignments, editUser: s.editUser,
  })));

  const user = users.find(u => u.id === userId);
  const currentAssignment = assignments.find(a => a.userId === userId && !a.revokedAt);

  const [form, setForm] = useState<EditUserPayload>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    groupId: currentAssignment?.groupId ?? 'grp-admin',
    status: (user?.status as EditUserPayload['status']) ?? 'active',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  function setField<K extends keyof EditUserPayload>(key: K, value: EditUserPayload[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = editUser(userId, currentUserId, form);
    if (!result.ok) { setError(result.error ?? 'Unknown error.'); return; }
    setSuccess(true);
    setTimeout(onClose, 600);
  }

  return (
    <Modal title={`Edit User — ${user.name}`} onClose={onClose}>
      {success ? (
        <div className="flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle size={16} /> Changes saved.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput value={form.name ?? ''} onChange={v => setField('name', v)} />
          </Field>
          <Field label="Email" required>
            <TextInput value={form.email ?? ''} onChange={v => setField('email', v)} type="email" />
          </Field>
          <Field label="User Group" required>
            <SelectInput
              value={form.groupId ?? 'grp-admin'}
              onChange={v => setField('groupId', v)}
              options={GROUP_SELECTABLES.map(g => ({ value: g.id, label: g.name }))}
            />
          </Field>
          <Field label="Status">
            <SelectInput
              value={form.status ?? 'active'}
              onChange={v => setField('status', v as EditUserPayload['status'])}
              options={[{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended' }]}
            />
          </Field>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-1.5 text-sm rounded-md bg-[#0f766e] text-white hover:bg-[#0d6461] font-semibold">Save Changes</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteUserModal({ userId, onClose, currentUserId }: { userId: string; onClose: () => void; currentUserId: string }) {
  const { users, deleteUser } = useUserAssignmentsStore(useShallow(s => ({ users: s.users, deleteUser: s.deleteUser })));
  const user = users.find(u => u.id === userId);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  function handleDelete() {
    const result = deleteUser(userId, currentUserId);
    if (!result.ok) { setError(result.error ?? 'Unknown error.'); return; }
    onClose();
  }

  return (
    <Modal title="Deactivate User Assignment" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-700">Are you sure you want to deactivate this user and revoke active assignments?</p>
        <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-3">
          <div className="font-semibold text-sm text-slate-800">{user.name}</div>
          <div className="text-slate-500 text-xs mt-0.5">{user.email}</div>
        </div>
        {error && (
          <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
            <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleDelete} className="px-4 py-1.5 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700 font-semibold">Deactivate</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Manual Password Modal ───────────────────────────────────────────────────

function ManualPasswordModal({ userId, onClose, currentUserId }: { userId: string; onClose: () => void; currentUserId: string }) {
  const users = useUserAssignmentsStore(s => s.users);
  const { getAccessToken } = useAuth();
  const targetUser = users.find(u => u.id === userId);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!targetUser) return null;

  const isSelf = targetUser.id === currentUserId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isSelf) {
      setError('Use the standard account reset flow for your own password.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setError('Your admin session is not available. Please sign in again.');
      return;
    }

    setSaving(true);
    try {
      await AuthApi.adminManualPasswordReset(accessToken, targetUser!.email, newPassword);
      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError('Unable to update password right now. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Manual Password Change — ${targetUser.name}`} onClose={onClose}>
      {success ? (
        <div className="flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle size={16} /> Password updated successfully.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
            Target: <span className="font-semibold text-slate-800">{targetUser.email}</span>
          </div>

          <Field label="New Password" required>
            <TextInput value={newPassword} onChange={setNewPassword} type="password" placeholder="At least 8 characters" />
          </Field>

          <Field label="Confirm Password" required>
            <TextInput value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Re-enter password" />
          </Field>

          <div className="text-xs text-slate-500">
            Manual reset updates the user password immediately. Share it via a secure channel.
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-1.5 text-sm rounded-md text-white font-semibold ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0f766e] hover:bg-[#0d6461]'}`}
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function GrantAccessModal({ userId, onClose, currentUserId }: { userId: string; onClose: () => void; currentUserId: string }) {
  const users = useUserAssignmentsStore(s => s.users);
  const editUser = useUserAssignmentsStore(s => s.editUser);
  const { getAccessToken } = useAuth();
  const targetUser = users.find(u => u.id === userId);

  const [newPassword, setNewPassword] = useState('Caregiver2012!');
  const [confirmPassword, setConfirmPassword] = useState('Caregiver2012!');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!targetUser) return null;

  const isSelf = targetUser.id === currentUserId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isSelf) {
      setError('Use the standard account reset flow for your own account.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setError('Your admin session is not available. Please sign in again.');
      return;
    }

    setSaving(true);
    try {
      await AuthApi.adminGrantAccess(accessToken, targetUser!.email, newPassword);
      if (targetUser!.status !== 'active') {
        editUser(targetUser!.id, currentUserId, { status: 'active' });
      }
      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError('Unable to grant access right now. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Grant Staging Access — ${targetUser.name}`} onClose={onClose}>
      {success ? (
        <div className="flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle size={16} /> Access granted and password set successfully.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
            Target: <span className="font-semibold text-slate-800">{targetUser.email}</span>
          </div>

          <Field label="Temporary / Shared Password" required>
            <TextInput value={newPassword} onChange={setNewPassword} type="password" placeholder="At least 8 characters" />
          </Field>

          <Field label="Confirm Password" required>
            <TextInput value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Re-enter password" />
          </Field>

          <div className="text-xs text-slate-500">
            Grant Access creates or re-enables the staging account, marks the registration active, and sets the password immediately.
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-1.5 text-sm rounded-md text-white font-semibold ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {saving ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; userId: string }
  | { type: 'delete'; userId: string }
  | { type: 'grant-access'; userId: string }
  | { type: 'password'; userId: string }
  | null;

type TabId = 'assignments' | 'page-access';

const PROTECTED = new Set(['demo-user-careindeed']);

export function UserAssignmentsPage() {
  const { user, getAccessToken } = useAuth();
  const [previewPermission, setPreviewPermission] = useState<PermissionId>('policy.approve');
  const [previewResourceId, setPreviewResourceId] = useState('demo-resource');
  const [modal, setModal] = useState<ModalState>(null);
  const [tab, setTab] = useState<TabId>('assignments');
  const [search, setSearch] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const registryHydratedRef = useRef(false);
  const skipFirstPersistRef = useRef(true);

  const { users, assignments } = useUserAssignmentsStore(useShallow(s => ({ users: s.users, assignments: s.assignments })));

  const currentUserId = resolveUserIdFromAuth(user);
  const currentUser = users.find(u => u.id === currentUserId);

  // Page View Access write permission gates User Management mutations.
  // Robert + Marites always pass (canWritePage short-circuits via
  // canManagePageAccess for the seeded manager identities). Other
  // users without explicit `write` on `page.user-assignments` see
  // disabled buttons with a tooltip explaining how to request access.
  const canWriteUserManagement = canWritePage(user, 'page.user-assignments');
  const canManageAccess = canManagePageAccess(user);
  const writeDisabledTitle = 'You do not have Read + Write access for User Management. Request it from robertp@careindeed.com or maritesa@careindeed.com.';

  useEffect(() => {
    if (!canManageAccess) {
      registryHydratedRef.current = true;
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken || cancelled) {
          registryHydratedRef.current = true;
          return;
        }
        const registry = await AuthApi.getIdentityRegistry(accessToken);
        if (cancelled) return;
        hydrateIdentityRegistry({
          users: registry.users,
          assignments: registry.assignments,
        });
        setSyncStatus('Identity registry loaded.');
      } catch {
        if (!cancelled) setSyncError('Using local identity cache; server registry is unavailable.');
      } finally {
        if (!cancelled) registryHydratedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canManageAccess, getAccessToken]);

  useEffect(() => {
    if (!canManageAccess || !registryHydratedRef.current) return;
    if (skipFirstPersistRef.current) {
      skipFirstPersistRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const accessToken = await getAccessToken();
          if (!accessToken) return;
          await AuthApi.saveIdentityRegistry(accessToken, {
            ...getIdentityRegistrySnapshot(),
          });
          setSyncStatus('Identity changes saved.');
          setSyncError(null);
        } catch {
          setSyncError('Identity changes are saved locally but could not sync to the server.');
        }
      })();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [assignments, canManageAccess, getAccessToken, users]);

  async function handleSyncAuthenticatedUsers() {
    setSyncStatus(null);
    setSyncError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setSyncError('Your admin session is not available. Please sign in again.');
        return;
      }
      const registry = await AuthApi.syncAuthenticatedUsers(accessToken);
      hydrateIdentityRegistry({
        users: registry.users,
        assignments: registry.assignments,
      });
      setSyncStatus(`Authenticated user sync complete${typeof registry.syncedCount === 'number' ? ` (${registry.syncedCount} active registrations scanned)` : ''}.`);
    } catch (err) {
      setSyncError(err instanceof AuthApiError ? err.message : 'Unable to sync authenticated users right now.');
    }
  }

  const preview = useMemo(() => authorizeForAuthUser(user, previewPermission, {
    kind: previewPermission.startsWith('policy.') ? 'policy' : previewPermission.startsWith('form.') ? 'form' : 'ceu',
    id: previewResourceId,
    scope: { organizationId: 'careindeed-demo' },
    meta: {
      isApprovedVersion: true,
      draftAuthorUserId: 'usr-admin',
      assignedByUserId: 'usr-admin',
      requiresReviewer: false,
      executedByUserId: 'usr-admin',
    },
  }), [previewPermission, previewResourceId, user]);

  const rows = useMemo(() =>
    users.map(u => {
      const assignment = assignments.find(a => a.userId === u.id && !a.revokedAt);
      const group = assignment ? USER_GROUP_BY_ID[assignment.groupId] : undefined;
      return { user: u, assignment, group };
    }),
    [users, assignments],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ user: rowUser }) =>
      rowUser.name.toLowerCase().includes(q)
      || rowUser.email.toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="h-full w-full overflow-y-auto p-6" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <PageHeader
          eyebrow="ADMIN / IDENTITY"
          title="User Management"
          description="Manage user accounts, role group assignments, and fine-grained page view access."
        />

        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/admin/user-groups" className={navClass}>User Groups</NavLink>
          <NavLink to="/admin/roles" className={navClass}>Roles</NavLink>
          <NavLink to="/admin/permissions" className={navClass}>Permissions</NavLink>
          <NavLink to="/admin/users" className={navClass}>User Assignments</NavLink>
        </div>

        <SurfaceCard padding="md">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div>
              <div className="font-semibold tracking-tight">Current session user</div>
              <div className="text-[var(--v3-text-secondary)] mt-0.5">
                {currentUser?.name ?? 'Unknown'} ({currentUser?.email ?? 'n/a'})
              </div>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[currentUser?.status ?? 'active']}`}>
              {currentUser?.status ?? 'unknown'}
            </span>
            {canWriteUserManagement
              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><ShieldCheck size={10}/> UM write</span>
              : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)] border border-[var(--v3-border-subtle)]"><Lock size={10}/> UM read-only</span>}
            {canManageAccess && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30"><ShieldCheck size={10}/> page-access manager</span>
            )}
          </div>
        </SurfaceCard>

        {/* Tab navigation: User Assignments | Page View Access — corporate pills */}
        <div role="tablist" className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'assignments'}
            onClick={() => setTab('assignments')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'assignments'
                ? 'text-[#0f766e] border-[#0f766e]'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            User Assignments
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'page-access'}
            onClick={() => setTab('page-access')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'page-access'
                ? 'text-[#0f766e] border-[#0f766e]'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Page View Access
          </button>
        </div>

        {tab === 'assignments' && (
          <>
            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
              <div className="font-semibold text-sm">Authorization preview</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <label className="flex flex-col gap-1">
                  Permission
                  <select
                    value={previewPermission}
                    onChange={event => setPreviewPermission(event.target.value as PermissionId)}
                    className="border border-slate-300 rounded px-2 py-1.5"
                  >
                    {PREVIEW_PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  Resource Id
                  <input
                    value={previewResourceId}
                    onChange={event => setPreviewResourceId(event.target.value)}
                    className="border border-slate-300 rounded px-2 py-1.5"
                    placeholder="demo-policy-001"
                  />
                </label>
              </div>
              <div className={`rounded-md border px-3 py-2 text-sm ${preview.allow ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {preview.allow ? 'ALLOW' : 'DENY'} — {preview.reasonCode} — {preview.reason}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="text-sm font-semibold text-slate-700">
                  Users ({filteredRows.length}{filteredRows.length !== rows.length ? ` of ${rows.length}` : ''})
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search name or email"
                    aria-label="Search users by name or email"
                    className="w-full border border-[var(--v3-border-subtle)] rounded-md px-3 py-1.5 text-xs bg-transparent text-[var(--v3-text-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSyncAuthenticatedUsers}
                    disabled={!canWriteUserManagement}
                    title={canWriteUserManagement ? 'Sync authenticated users from active registrations' : writeDisabledTitle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      canWriteUserManagement
                        ? 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <RefreshCw size={13} /> Sync authenticated users
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'add' })}
                    disabled={!canWriteUserManagement}
                    title={canWriteUserManagement ? 'Add a new user' : writeDisabledTitle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      canWriteUserManagement
                        ? 'bg-[#0f766e] text-white hover:bg-[#0d6461]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <Plus size={13} /> Add User
                  </button>
                </div>
              </div>
              {(syncStatus || syncError) && (
                <div className={`px-4 py-2 text-xs border-b ${syncError ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                  {syncError ?? syncStatus}
                </div>
              )}
              <DataGrid>
                <DataGrid.Head>
                  <DataGrid.HeaderRow>
                    <DataGrid.HeaderCell>User</DataGrid.HeaderCell>
                    <DataGrid.HeaderCell>Group / Role</DataGrid.HeaderCell>
                    <DataGrid.HeaderCell>Status</DataGrid.HeaderCell>
                    <DataGrid.HeaderCell>Scope</DataGrid.HeaderCell>
                    <DataGrid.HeaderCell>Effective</DataGrid.HeaderCell>
                    <DataGrid.HeaderCell>Actions</DataGrid.HeaderCell>
                  </DataGrid.HeaderRow>
                </DataGrid.Head>
                <DataGrid.Body>
                  {filteredRows.map(({ user: u, assignment, group }) => {
                    const isProtected = PROTECTED.has(u.id);
                    const isSelf = u.id === currentUserId;
                    const editDisabled = isProtected || !canWriteUserManagement;
                    const deleteDisabled = isProtected || isSelf || !canWriteUserManagement;
                    const grantAccessDisabled = isSelf || !canWriteUserManagement;
                    const passwordDisabled = isSelf || !canWriteUserManagement;
                    return (
                      <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                          {u.source === 'manual-provisioned' && (
                            <span className="text-[10px] text-slate-400 font-mono">manual-provisioned</span>
                          )}
                          {u.source === 'authenticated' && (
                            <span className="text-[10px] text-slate-400 font-mono">authenticated</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{group?.name ?? '—'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[u.status] ?? STATUS_BADGE.active}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono text-slate-500">
                          {assignment
                            ? `org:${assignment.scope.organizationId}${assignment.scope.branchId ? ` branch:${assignment.scope.branchId}` : ''}`
                            : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">
                          {assignment?.effectiveFrom ? assignment.effectiveFrom.slice(0, 10) : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModal({ type: 'edit', userId: u.id })}
                              disabled={editDisabled}
                              title={
                                isProtected
                                  ? 'Protected — cannot edit'
                                  : !canWriteUserManagement
                                    ? writeDisabledTitle
                                    : `Edit ${u.name}`
                              }
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${editDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: 'delete', userId: u.id })}
                              disabled={deleteDisabled}
                              title={
                                isProtected
                                  ? 'Protected — cannot remove'
                                  : isSelf
                                    ? 'Cannot remove your own account'
                                    : !canWriteUserManagement
                                      ? writeDisabledTitle
                                      : `Remove ${u.name}`
                              }
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${deleteDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: 'grant-access', userId: u.id })}
                              disabled={grantAccessDisabled}
                              title={
                                isSelf
                                  ? 'Use self-service reset for your own account'
                                  : !canWriteUserManagement
                                    ? writeDisabledTitle
                                    : `Grant staging access to ${u.name}`
                              }
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${grantAccessDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                            >
                              Access
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: 'password', userId: u.id })}
                              disabled={passwordDisabled}
                              title={
                                isSelf
                                  ? 'Use self-service reset for your own account'
                                  : !canWriteUserManagement
                                    ? writeDisabledTitle
                                    : `Manual password change for ${u.name}`
                              }
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${passwordDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
                            >
                              Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <DataGrid.Row>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm">
                        <span className="text-[var(--v3-text-tertiary)]">No user assignments found.</span>
                      </td>
                    </DataGrid.Row>
                  )}
                </DataGrid.Body>
              </DataGrid>
            </div>
          </>
        )}

        {tab === 'page-access' && (
          <div className="space-y-3">
            <SurfaceCard padding="md">
              <div className="text-sm font-semibold tracking-tight">Page View Access</div>
              <p className="text-xs text-[var(--v3-text-secondary)] mt-1">
                Salesforce-style access matrix. Toggle component visibility and pick a per-page
                access level for each user. <strong>Read + Write</strong> implies <strong>Read</strong>.
                Role-based action permissions still apply on top.
              </p>
            </SurfaceCard>
            <PageAccessMatrix initialTargetUserId={currentUserId} />
          </div>
        )}
      </div>

      {modal?.type === 'add' && canWriteUserManagement && <AddUserModal onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && canWriteUserManagement && <EditUserModal userId={modal.userId} currentUserId={currentUserId} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && canWriteUserManagement && <DeleteUserModal userId={modal.userId} currentUserId={currentUserId} onClose={() => setModal(null)} />}
      {modal?.type === 'grant-access' && canWriteUserManagement && <GrantAccessModal userId={modal.userId} currentUserId={currentUserId} onClose={() => setModal(null)} />}
      {modal?.type === 'password' && canWriteUserManagement && <ManualPasswordModal userId={modal.userId} currentUserId={currentUserId} onClose={() => setModal(null)} />}
    </div>
  );
}

export default UserAssignmentsPage;
