import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EvidenceFolderExplorer from './EvidenceFolderExplorer';
import StudioLanding from './StudioLanding';
import EditPacketRemediation from './EditPacketRemediation';
import SignatureTracker from './SignatureTracker';

export type EvidenceStudioTab = 'library' | 'studio' | 'edit' | 'signatures';

const TABS: { id: EvidenceStudioTab; label: string }[] = [
  { id: 'studio', label: 'CREATE PACKET' },
  { id: 'edit', label: 'EDIT PACKET' },
  { id: 'signatures', label: 'SIGNATURE TRACKER' },
  { id: 'library', label: 'FOLDERS' },
];

export function EvidenceStudio({ initialTab = 'studio' }: { initialTab?: EvidenceStudioTab }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') as EvidenceStudioTab | null;
  const tab: EvidenceStudioTab = requestedTab && TABS.some((item) => item.id === requestedTab) ? requestedTab : initialTab;
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
      
      {/* Premium Segmented Navigation Tabs */}
      <div className="flex justify-start">
        <div className="bg-white/80 backdrop-blur-md rounded-full inline-flex p-1 shadow-md border border-transparent mb-2 overflow-x-auto max-w-full no-scrollbar">
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active ? 'true' : 'false'}
                type="button"
                onClick={() => setTab(id)}
                className={`px-6 py-3 text-xs font-medium tracking-[0.1em] uppercase whitespace-nowrap rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-[#007C7A] text-white shadow-md'
                    : 'text-[#007C7A] hover:bg-teal-50/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panes stay mounted; only the active one is visible. */}
      <div className={tab === 'library' ? '' : 'hidden'}><EvidenceFolderExplorer /></div>
      <div className={tab === 'studio' ? '' : 'hidden'}><StudioLanding /></div>
      <div className={tab === 'edit' ? '' : 'hidden'}><EditPacketRemediation /></div>
      <div className={tab === 'signatures' ? '' : 'hidden'}><SignatureTracker incomingPacketId={sigPacketId} /></div>
    </section>
  );
}

export default EvidenceStudio;
