import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') as EvidenceStudioTab | null;
  const tab: EvidenceStudioTab = requestedTab && TABS.some((item) => item.id === requestedTab) ? requestedTab : initialTab;
  // Packet id rides in the URL so it survives the URL-driven tab switch (React
  // state would be lost when the query change re-renders the screen).
  const sigPacketId = searchParams.get('packet');

  const setTab = (nextTab: EvidenceStudioTab) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', nextTab);
      return next;
    });
  };

  // Studio → Signature Tracker hand-off (signing must be set up before
  // printing/downloading), and the return trip back to Studio to print.
  useEffect(() => {
    type PrintStash = Record<string, { title: string; html: string }>;
    const stash = (payload?: { packetId?: string; title?: string; html?: string }) => {
      if (!payload?.packetId || !payload.html) return;
      const w = window as unknown as { __ciPacketPrint?: PrintStash };
      w.__ciPacketPrint = { ...(w.__ciPacketPrint ?? {}), [payload.packetId]: { title: payload.title ?? 'Care Indeed Packet', html: payload.html } };
    };
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; packetId?: string; title?: string; html?: string } | undefined;
      // Studio stashes its rendered pages on every generate AND at hand-off, so
      // the tracker can always print the packet (the iframe re-renders/clears on
      // tab switch). Keyed by packet id.
      if (d?.type === 'ci-packet-content') { stash(d); return; }
      if (d?.type === 'ci-open-signature-tracker') {
        stash(d);
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.set('tab', 'signatures');
          if (d.packetId) next.set('packet', d.packetId);
          return next;
        });
      } else if (d?.type === 'ci-print-packet') {
        setSearchParams((current) => { const next = new URLSearchParams(current); next.set('tab', 'studio'); return next; });
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [setSearchParams]);

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
