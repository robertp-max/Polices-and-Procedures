import { Link, NavLink } from 'react-router-dom';
import { USER_GROUPS } from './userGroups';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-xs font-semibold border ${isActive ? 'bg-[#0f766e] text-white border-[#0f766e]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`;

export function UserGroupsPage() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#f8fafc] text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold">Phase A Identity Admin - User Groups</h1>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/admin/user-groups" className={navClass}>User Groups</NavLink>
            <NavLink to="/admin/roles" className={navClass}>Roles</NavLink>
            <NavLink to="/admin/permissions" className={navClass}>Permissions</NavLink>
            <NavLink to="/admin/users" className={navClass}>User Assignments</NavLink>
          </div>
        </header>

        <p className="text-sm text-slate-600">
          Deterministic Identity and Access seeds for non-HIPAA demo mode. Preview permissions by selecting catalog and assignment pages.
        </p>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Group</th>
                <th className="text-left px-3 py-2">Description</th>
                <th className="text-left px-3 py-2">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {USER_GROUPS.map(group => (
                <tr key={group.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 font-semibold">{group.name}</td>
                  <td className="px-3 py-2 text-slate-600">{group.description}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {group.permissions.map(permission => (
                        <span key={`${group.id}-${permission}`} className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-mono">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-slate-500">
          Need quick action preview? Go to <Link to="/admin/users" className="underline">User Assignments</Link>.
        </div>
      </div>
    </div>
  );
}

export default UserGroupsPage;
