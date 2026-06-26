import { useState } from 'react';
import { FolderOpen, FileStack } from 'lucide-react';
import EvidenceFolderExplorer from './EvidenceFolderExplorer';
import StudioLanding from './StudioLanding';

/* ════════════════════════════════════════════════════════════════
   Evidence Studio — two cohesive surfaces:
     • Evidence Drive  — Windows-style folder library of filed evidence
     • Studio          — branded packet generation (launch + intake-to-library)
   The standalone Intake and in-app Packet-builder panes were folded in:
   ingestion lives in the Studio's "Add source documents", generation
   launches the full branded Packet Studio. No metric tiles. Light glass.
   ════════════════════════════════════════════════════════════════ */

export type EvidenceStudioTab = 'library' | 'studio';

const TABS: { id: EvidenceStudioTab; label: string; sub: string; Icon: typeof FolderOpen }[] = [
  { id: 'library', label: 'Evidence Drive', sub: 'Browse filed evidence', Icon: FolderOpen },
  { id: 'studio', label: 'Studio', sub: 'Generate branded packets', Icon: FileStack },
];

export function EvidenceStudio({ initialTab = 'library' }: { initialTab?: EvidenceStudioTab }) {
  const [tab, setTab] = useState<EvidenceStudioTab>(initialTab);

  return (
    <section className="grid gap-lg" data-hash-id="evidence-center" data-route="/evidence" data-template="evidence">
      <header className="rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
        <h1 className="text-2xl font-medium text-ink">Evidence Studio</h1>
        <p className="mt-xs text-sm font-light text-secondary">
          Browse the evidence drive and generate branded, survey-defensible packets.
        </p>
        <div className="mt-lg flex flex-wrap gap-sm" role="tablist" aria-label="Evidence Studio sections">
          {TABS.map(({ id, label, sub, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active ? 'true' : 'false'}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-sm rounded-lg border px-lg py-sm text-left transition ${
                  active
                    ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep shadow-rest'
                    : 'border-card bg-tone-slate-bg text-secondary hover:bg-surface-hover'
                }`}
              >
                <Icon className={`h-icon-sm w-icon-sm ${active ? 'text-brand-teal' : 'text-muted'}`} />
                <span className="grid">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-[10px] uppercase tracking-tag text-muted">{sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Panes stay mounted; only the active one is visible. */}
      <div className={tab === 'library' ? '' : 'hidden'}><EvidenceFolderExplorer /></div>
      <div className={tab === 'studio' ? '' : 'hidden'}><StudioLanding /></div>
    </section>
  );
}

export default EvidenceStudio;
