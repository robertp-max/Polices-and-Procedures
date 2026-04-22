import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BrandRail } from './components/BrandRail';
import { LandingView } from './components/LandingView';
import { WorkflowDetailView } from './components/WorkflowDetailView';
import type { DomainCode } from '@/policy/types/workflow';

/* ══════════════════════════════════════════════════════════════════════
   WorkflowLibraryApp — mounted at `/workflows/*` inside the main
   CommandCenterLayout. The outer shell (hamburger, centered Care
   Indeed logo, search, help, user avatar, surrounding one-card frame)
   is provided by CommandCenterLayout, identical to every other page.

   This component only renders the *inside* of the shell: the brand
   rail (left) and the workspace (right). No borders, no shadows, no
   logo, no actor chip — those live in the shell chrome above.
   ══════════════════════════════════════════════════════════════════════ */

export function WorkflowLibraryApp() {
  const [selectedDomain, setSelectedDomain] = useState<DomainCode | 'ALL'>('ALL');
  const [savedView, setSavedView] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.innerWidth < 1200);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      className="w-full h-full flex overflow-hidden"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <BrandRail
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        savedView={savedView}
        onSelectSavedView={setSavedView}
        compact={compact}
      />
      <main className="flex-1 min-w-0 overflow-hidden">
        <Routes>
          <Route
            index
            element={<LandingView selectedDomain={selectedDomain} savedView={savedView} />}
          />
          <Route path=":workflowId" element={<WorkflowDetailView />} />
        </Routes>
      </main>
    </div>
  );
}
