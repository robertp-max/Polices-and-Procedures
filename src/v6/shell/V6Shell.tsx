import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PersonalOpsPanel } from './PersonalOpsPanel';
import { usePersonalOpsStore } from '../../policy/stores/personalOpsStore';


export function V6Shell() {
  const { isPersonalOpsOpen, togglePersonalOps } = usePersonalOpsStore();

  return (
    <div className="flex min-h-screen bg-canvas font-light text-ink">
      <Sidebar isPersonalOpsOpen={isPersonalOpsOpen} onPersonalOpsToggle={togglePersonalOps} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 flex-row min-w-0 h-full">
          <main className="flex-1 overflow-y-auto px-3xl py-3xl" id="main-content">
            <Outlet />
          </main>
          {isPersonalOpsOpen && (
            <div className="h-full pt-2xl">
              <PersonalOpsPanel onClose={togglePersonalOps} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
