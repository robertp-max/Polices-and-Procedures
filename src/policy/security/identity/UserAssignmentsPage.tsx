import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { authorizeForAuthUser } from './authorize';
import { DEMO_USERS, getDemoUserById, resolveUserIdFromAuth } from './demoUsers';
import { ROLE_ASSIGNMENTS } from './roleAssignments';
import type { PermissionId } from './types';
import { USER_GROUP_BY_ID } from './userGroups';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-xs font-semibold border ${isActive ? 'bg-[#0f766e] text-white border-[#0f766e]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`;

const PREVIEW_PERMISSIONS: PermissionId[] = ['policy.approve', 'form.sign', 'ceu.complete'];

export function UserAssignmentsPage() {
  const { user } = useAuth();
  const [previewPermission, setPreviewPermission] = useState<PermissionId>('policy.approve');
  const [previewResourceId, setPreviewResourceId] = useState('demo-resource');

  const currentUserId = resolveUserIdFromAuth(user);
  const currentUser = getDemoUserById(currentUserId);

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

  return (
    <div className="h-full w-full overflow-y-auto bg-[#f8fafc] text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold">Phase A Identity Admin - User Assignments</h1>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/admin/user-groups" className={navClass}>User Groups</NavLink>
            <NavLink to="/admin/roles" className={navClass}>Roles</NavLink>
            <NavLink to="/admin/permissions" className={navClass}>Permissions</NavLink>
            <NavLink to="/admin/users" className={navClass}>User Assignments</NavLink>
          </div>
        </header>

        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <div className="font-semibold">Current session user</div>
          <div className="text-slate-600 mt-1">{currentUser?.name ?? 'Unknown'} ({currentUser?.email ?? 'n/a'}) - {currentUser?.status ?? 'unknown'}</div>
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
                {PREVIEW_PERMISSIONS.map(permission => (
                  <option key={permission} value={permission}>{permission}</option>
                ))}
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
            {preview.allow ? 'ALLOW' : 'DENY'} - {preview.reasonCode} - {preview.reason}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">User</th>
                <th className="text-left px-3 py-2">Group</th>
                <th className="text-left px-3 py-2">Scope</th>
                <th className="text-left px-3 py-2">Effective</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_ASSIGNMENTS.map(assignment => {
                const userRow = DEMO_USERS.find(entry => entry.id === assignment.userId);
                const group = USER_GROUP_BY_ID[assignment.groupId];
                return (
                  <tr key={assignment.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{userRow?.name ?? assignment.userId}</td>
                    <td className="px-3 py-2">{group?.name ?? assignment.groupId}</td>
                    <td className="px-3 py-2 text-xs font-mono">
                      org:{assignment.scope.organizationId}
                      {assignment.scope.branchId ? ` branch:${assignment.scope.branchId}` : ''}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{assignment.effectiveFrom}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserAssignmentsPage;
