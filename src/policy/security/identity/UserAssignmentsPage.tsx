import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import { Plus, Pencil, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { authorizeForAuthUser } from './authorize';
import { resolveUserIdFromAuth } from './demoUsers';
import {
  useUserAssignmentsStore,
  type AddUserPayload,
  type EditUserPayload,
} from './userAssignmentsStore';
import type { PermissionId } from './types';
import { USER_GROUPS, USER_GROUP_BY_ID } from './userGroups';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
    isActive
      ? 'bg-[#0f766e] text-white border-[#0f766e]'
      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
  }`;

const PREVIEW_PERMISSIONS: PermissionId[] = ['policy.approve', 'form.sign', 'ceu.complete'];

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  suspended: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const GROUP_SELECTABLES = USER_GROUPS.filter(g =>
  ['grp-super-admin', 'grp-admin', 'grp-rn', 'grp-lvn', 'grp-chha',
    'grp-compliance', 'grp-auditor', 'grp-onboarding', 'grp-billing',
    'grp-director', 'grp-executive', 'grp-system'].includes(g.id),
);

// ─── Empty form ───────────────────────────────────────────────────────────────

function emptyAddForm(): AddUserPayload {
  return { name: '', email: '', groupId: 'grp-admin', status: 'active', sendInvite: false };
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
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
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
            Send invite email <span className="text-xs text-slate-400">(unavailable in demo)</span>
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
    <Modal title="Remove User Assignment" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-700">Are you sure you want to remove this user assignment?</p>
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
          <button type="button" onClick={handleDelete} className="px-4 py-1.5 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700 font-semibold">Remove User</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; userId: string }
  | { type: 'delete'; userId: string }
  | null;

const PROTECTED = new Set(['demo-user-careindeed']);

export function UserAssignmentsPage() {
  const { user } = useAuth();
  const [previewPermission, setPreviewPermission] = useState<PermissionId>('policy.approve');
  const [previewResourceId, setPreviewResourceId] = useState('demo-resource');
  const [modal, setModal] = useState<ModalState>(null);

  const { users, assignments } = useUserAssignmentsStore(useShallow(s => ({ users: s.users, assignments: s.assignments })));

  const currentUserId = resolveUserIdFromAuth(user);
  const currentUser = users.find(u => u.id === currentUserId);

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

  return (
    <div className="h-full w-full overflow-y-auto bg-[#f8fafc] text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">

        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold">Phase A Identity Admin — User Assignments</h1>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/admin/user-groups" className={navClass}>User Groups</NavLink>
            <NavLink to="/admin/roles" className={navClass}>Roles</NavLink>
            <NavLink to="/admin/permissions" className={navClass}>Permissions</NavLink>
            <NavLink to="/admin/users" className={navClass}>User Assignments</NavLink>
          </div>
        </header>

        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <div className="font-semibold">Current session user</div>
          <div className="text-slate-600 mt-1 flex items-center gap-2">
            {currentUser?.name ?? 'Unknown'} ({currentUser?.email ?? 'n/a'})
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_BADGE[currentUser?.status ?? 'active']}`}>
              {currentUser?.status ?? 'unknown'}
            </span>
          </div>
        </div>

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
            {preview.allow ? '✅ ALLOW' : '🚫 DENY'} — {preview.reasonCode} — {preview.reason}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="text-sm font-semibold text-slate-700">Users ({rows.length})</div>
            <button
              type="button"
              onClick={() => setModal({ type: 'add' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0f766e] text-white hover:bg-[#0d6461] transition-colors"
            >
              <Plus size={13} /> Add User
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">User</th>
                <th className="text-left px-4 py-2.5 font-semibold">Group / Role</th>
                <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold">Scope</th>
                <th className="text-left px-4 py-2.5 font-semibold">Effective</th>
                <th className="text-left px-4 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ user: u, assignment, group }) => {
                const isProtected = PROTECTED.has(u.id);
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                      {u.source === 'manual-provisioned' && (
                        <span className="text-[10px] text-slate-400 font-mono">manual-provisioned</span>
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
                          disabled={isProtected}
                          title={isProtected ? 'Protected — cannot edit' : `Edit ${u.name}`}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${isProtected ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <Pencil size={11} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal({ type: 'delete', userId: u.id })}
                          disabled={isProtected || isSelf}
                          title={isProtected ? 'Protected — cannot remove' : isSelf ? 'Cannot remove your own account' : `Remove ${u.name}`}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${isProtected || isSelf ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No user assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.type === 'add' && <AddUserModal onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <EditUserModal userId={modal.userId} currentUserId={currentUserId} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && <DeleteUserModal userId={modal.userId} currentUserId={currentUserId} onClose={() => setModal(null)} />}
    </div>
  );
}

export default UserAssignmentsPage;
