import { useEffect, useState } from 'react';
import { FolderOpen, FileStack, PencilLine, FileSignature } from 'lucide-react';
import EvidenceFolderExplorer from './EvidenceFolderExplorer';
import StudioLanding from './StudioLanding';
import EditPacketRemediation from './EditPacketRemediation';
import SignatureTracker from './SignatureTracker';

/* ════════════════════════════════════════════════════════════════
   Evidence Studio — two cohesive surfaces:
     • Evidence Drive  — Windows-style folder library of filed evidence
     • Studio          — branded packet generation (launch + intake-to-library)
   The standalone Intake and in-app Packet-builder panes were folded in:
   ingestion lives in the Studio's "Add source documents", generation
   launches the full branded Packet Studio. No metric tiles. Light glass.
   ════════════════════════════════════════════════════════════════ */

export type EvidenceStudioTab = 'library' | 'studio' | 'edit' | 'signatures';

const TABS: { id: EvidenceStudioTab; label: string; sub: string; Icon: typeof FolderOpen }[] = [
  { id: 'studio', label: 'Studio', sub: 'Generate branded packets', Icon: FileStack },
  { id: 'edit', label: 'Edit Packet', sub: 'Remediate by packet ID', Icon: PencilLine },
  { id: 'signatures', label: 'Signature Tracker', sub: 'Schedule & track signing', Icon: FileSignature },
  { id: 'library', label: 'Evidence Drive', sub: 'Browse filed evidence', Icon: FolderOpen },
];

export function EvidenceStudio({ initialTab = 'studio' }: { initialTab?: EvidenceStudioTab }) {
  const [tab, setTab] = useState<EvidenceStudioTab>(initialTab);
  const [sigPacketId, setSigPacketId] = useState<string | null>(null);

  // Studio → Signature Tracker hand-off (signing must be set up before
  // printing/downloading), and the return trip back to Studio to print.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; packetId?: string } | undefined;
      if (d?.type === 'ci-open-signature-tracker') { setSigPacketId(d.packetId ?? null); setTab('signatures'); }
      else if (d?.type === 'ci-print-packet') { setTab('studio'); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <section className="grid gap-lg" data-hash-id="evidence-center" data-route="/evidence" data-template="evidence">
      <header className="rounded-lg border border-hairline bg-surface-glass p-md shadow-rest">
        <div className="flex flex-wrap gap-sm" role="tablist" aria-label="Evidence Studio sections">
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
      <div className={tab === 'edit' ? '' : 'hidden'}><EditPacketRemediation /></div>
      <div className={tab === 'signatures' ? '' : 'hidden'}><SignatureTracker incomingPacketId={sigPacketId} /></div>
    </section>
  );
}

export default EvidenceStudio;
