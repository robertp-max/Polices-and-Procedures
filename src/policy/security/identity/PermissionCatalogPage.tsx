import { NavLink } from 'react-router-dom';
import { PERMISSION_CATALOG } from './permissionCatalog';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-xs font-semibold border ${isActive ? 'bg-[#0f766e] text-white border-[#0f766e]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`;

export function PermissionCatalogPage() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#f8fafc] text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold">Phase A Identity Admin - Permission Catalog</h1>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/admin/user-groups" className={navClass}>User Groups</NavLink>
            <NavLink to="/admin/roles" className={navClass}>Roles</NavLink>
            <NavLink to="/admin/permissions" className={navClass}>Permissions</NavLink>
            <NavLink to="/admin/users" className={navClass}>User Assignments</NavLink>
          </div>
        </header>

        <p className="text-sm text-slate-600">
          Catalog is constrained to Phase A foundation permissions and is intentionally separate from HIPAA-only controls.
        </p>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Permission</th>
                <th className="text-left px-3 py-2">Resource</th>
                <th className="text-left px-3 py-2">Action</th>
                <th className="text-left px-3 py-2">PHI</th>
                <th className="text-left px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_CATALOG.map(permission => (
                <tr key={permission.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{permission.id}</td>
                  <td className="px-3 py-2">{permission.resource}</td>
                  <td className="px-3 py-2">{permission.action}</td>
                  <td className="px-3 py-2">{permission.phi ? 'yes' : 'no'}</td>
                  <td className="px-3 py-2 text-slate-600">{permission.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PermissionCatalogPage;
