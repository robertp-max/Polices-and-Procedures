import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { USER_GROUPS } from './userGroups';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-xs font-semibold border ${isActive ? 'bg-[#0f766e] text-white border-[#0f766e]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`;

export function AdminRolesPage() {
  const [roleFilter, setRoleFilter] = useState('');

  const filteredRoles = useMemo(() => {
    const q = roleFilter.trim().toLowerCase();
    if (!q) return USER_GROUPS;
    return USER_GROUPS.filter(group => group.name.toLowerCase().includes(q) || group.description.toLowerCase().includes(q));
  }, [roleFilter]);

  return (
    <div className="h-full w-full overflow-y-auto bg-[#f8fafc] text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold">Admin - Roles</h1>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/admin/user-groups" className={navClass}>User Groups</NavLink>
            <NavLink to="/admin/roles" className={navClass}>Roles</NavLink>
            <NavLink to="/admin/permissions" className={navClass}>Permissions</NavLink>
            <NavLink to="/admin/users" className={navClass}>User Assignments</NavLink>
          </div>
        </header>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <label className="text-sm text-slate-700">Filter roles</label>
          <input
            value={roleFilter}
            onChange={event => setRoleFilter(event.target.value)}
            placeholder="Search role name or description"
            className="mt-1 w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Role</th>
                <th className="text-left px-3 py-2">Description</th>
                <th className="text-left px-3 py-2">Permission Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(group => (
                <tr key={group.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-semibold">{group.name}</td>
                  <td className="px-3 py-2 text-slate-600">{group.description}</td>
                  <td className="px-3 py-2">{group.permissions.length}</td>
                </tr>
              ))}
              {filteredRoles.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-3 text-slate-500" colSpan={3}>No roles match your filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminRolesPage;
