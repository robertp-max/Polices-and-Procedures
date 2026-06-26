import { useState } from 'react';
import { FolderOpen, Upload, FileStack, ExternalLink } from 'lucide-react';
import EvidenceFolderExplorer from './EvidenceFolderExplorer';
import BradEvidenceIntake from './BradEvidenceIntake';
import EvidencePacketStudio from '@/policy/evidence/packetStudio/EvidencePacketStudio';

/* ════════════════════════════════════════════════════════════════
   Evidence Studio — one cohesive surface for the whole evidence
   lifecycle: browse the library, intake + review new evidence, and
   assemble/export packets. Replaces the three separate Evidence
   Center / Brad Evidence Intake / Evidence Packet Studio pages.
   All three panes stay mounted so in-progress work survives tab
   switches. Light glass theme (inherits time-of-day tokens).
   ════════════════════════════════════════════════════════════════ */

export type EvidenceStudioTab = 'library' | 'intake' | 'packet';

const TABS: { id: EvidenceStudioTab; label: string; sub: string; Icon: typeof FolderOpen }[] = [
  { id: 'library', label: 'Library', sub: 'Browse filed evidence', Icon: FolderOpen },
  { id: 'intake', label: 'Intake', sub: 'Upload · resolve · review · file', Icon: Upload },
  { id: 'packet', label: 'Packet Studio', sub: 'Assemble · sign · export', Icon: FileStack },
];

export function EvidenceStudio({ initialTab = 'library' }: { initialTab?: EvidenceStudioTab }) {
  const [tab, setTab] = useState<EvidenceStudioTab>(initialTab);

  return (
    <section className="grid gap-lg" data-hash-id="evidence-center" data-route="/evidence" data-template="evidence">
      {/* Cohesive header + segmented control */}
      <header className="rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
        <h1 className="text-2xl font-medium text-ink">Evidence Studio</h1>
        <p className="mt-xs text-sm font-light text-secondary">
          One place for the full evidence lifecycle — browse the library, intake and review new evidence, and assemble survey-ready packets.
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
      <div className={tab === 'intake' ? '' : 'hidden'}><BradEvidenceIntake /></div>
      <div className={tab === 'packet' ? '' : 'hidden'}>
        <div className="mb-lg flex flex-wrap items-center justify-between gap-md rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
          <div>
            <h2 className="text-h3 font-medium text-ink">Branded Packet Studio</h2>
            <p className="mt-xs text-sm font-light text-secondary">Full survey-defensible PDF generator — QAPI monthly / quarterly / annual, Governing Body, Clinical Record Review, and more, with the branded cover, sections, signature blocks, and print/export.</p>
          </div>
          <button
            type="button"
            onClick={() => window.open('/care_indeed_pdf_studio.html', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-lg py-sm text-sm font-medium text-white hover:bg-brand-teal-deep"
          >
            <ExternalLink className="h-icon-sm w-icon-sm" /> Launch Packet Studio
          </button>
        </div>
        <EvidencePacketStudio />
      </div>
    </section>
  );
}

export default EvidenceStudio;
