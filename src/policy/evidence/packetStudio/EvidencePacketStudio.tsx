import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, CheckCircle2, ClipboardCheck, Download, FileText, FolderOpen, Printer, Save, Search, ShieldCheck, Upload, XCircle } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { Button, ToneBadge } from '@/v6/primitives';
import { MetricGrid, ToneTag, type MetricTileData } from '@/v6/components';
import { EVIDENCE_PACKET_TYPES, EVIDENCE_PACKET_TYPES_BY_ID, type EvidencePacketFrequency, type EvidencePacketMappingStatus } from './evidencePacketTypes';
import { buildEvidencePacketDraft, findPacketEvent, resolvePacketTypesForEvent, type EvidencePacketDraft } from './packetStudioResolvers';

const frequencyLabel: Record<EvidencePacketFrequency, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
  event_based: 'Event based',
  custom: 'Custom',
};

const mappingTone: Record<EvidencePacketMappingStatus, 'teal' | 'orange' | 'slate'> = {
  ready: 'teal',
  partial: 'orange',
  needs_mapping: 'slate',
};

const sourceOptions = [
  'Start from CES Event',
  'Start from Evidence Set',
  'Start from Signed Forms',
  'Start from Brad Draft',
  'Upload Manual Source Files',
  'Custom Packet',
];

function packetFamily(packetTypeId: string): string {
  if (/qapi/i.test(packetTypeId)) return 'QAPI';
  if (/governing|board/i.test(packetTypeId)) return 'Governing Body';
  if (/clinical|poc|oasis|medication|wound/i.test(packetTypeId)) return 'Clinical';
  if (/infection/i.test(packetTypeId)) return 'Infection Control';
  if (/training|competency|hipaa|personnel|tb/i.test(packetTypeId)) return 'HR / Training';
  if (/audit|survey/i.test(packetTypeId)) return 'Audit / Survey';
  if (/emergency/i.test(packetTypeId)) return 'Emergency Preparedness';
  return 'Custom';
}

export function EvidencePacketStudio() {
  const [searchParams] = useSearchParams();
  const evidenceByEvent = useRegulatoryExecutionStore((s) => s.evidence);
  const uploadEvidence = useRegulatoryExecutionStore((s) => s.uploadEvidence);

  const initialEvent = searchParams.get('eventId') ?? searchParams.get('event') ?? undefined;
  const [sourceMode, setSourceMode] = useState(sourceOptions[0]);
  const [eventId, setEventId] = useState(initialEvent ?? REGULATORY_EVENTS.find((event) => /qapi/i.test(event.title))?.id ?? REGULATORY_EVENTS[0]?.id);
  const selectedEvent = findPacketEvent(eventId);
  const eventPacketOptions = useMemo(() => resolvePacketTypesForEvent(selectedEvent), [selectedEvent]);
  const [packetTypeId, setPacketTypeId] = useState(eventPacketOptions[0]?.packetTypeId ?? EVIDENCE_PACKET_TYPES[0].packetTypeId);
  const packet = EVIDENCE_PACKET_TYPES_BY_ID.get(packetTypeId) ?? EVIDENCE_PACKET_TYPES[0];
  const draft = useMemo(() => buildEvidencePacketDraft(eventId, packet.packetTypeId, evidenceByEvent), [eventId, evidenceByEvent, packet.packetTypeId]);
  const [savedDraft, setSavedDraft] = useState<EvidencePacketDraft | null>(null);
  const [selectedStep, setSelectedStep] = useState(0);

  const metrics: MetricTileData[] = [
    { label: 'Packet types', value: String(EVIDENCE_PACKET_TYPES.length), helper: 'Registry-backed', tone: 'teal' },
    { label: 'Monthly', value: String(EVIDENCE_PACKET_TYPES.filter((item) => item.frequency === 'monthly').length), helper: 'Cadence supported', tone: 'green' },
    { label: 'Annual', value: String(EVIDENCE_PACKET_TYPES.filter((item) => item.frequency === 'annual').length), helper: 'Cadence supported', tone: 'amber' },
    { label: 'Needs mapping', value: String(EVIDENCE_PACKET_TYPES.filter((item) => item.mappingStatus === 'needs_mapping').length), helper: 'Shown, not hidden', tone: 'orange' },
  ];

  function saveDraftToEvidenceCenter() {
    const currentDraft = buildEvidencePacketDraft(eventId, packet.packetTypeId, evidenceByEvent);
    const eventKey = currentDraft.eventId ?? 'manual-packet-studio';
    const evidenceId = uploadEvidence(eventKey, {
      taskId: 'evidence-packet-studio',
      policyIds: currentDraft.policyIds,
      workflowId: currentDraft.workflowId,
      formIds: currentDraft.formIds,
      name: `${packet.label} - draft`,
      kind: 'report',
      sizeLabel: `${Math.max(1, currentDraft.sections.length)} sections`,
      artifactType: 'evidence',
      artifactVersion: 'packet-studio-v1',
      artifactId: currentDraft.packetId,
      note: JSON.stringify({
        packetId: currentDraft.packetId,
        packetTypeId: currentDraft.packetTypeId,
        eventId: currentDraft.eventId,
        workflowId: currentDraft.workflowId,
        policyIds: currentDraft.policyIds,
        formIds: currentDraft.formIds,
        evidenceIds: currentDraft.evidenceIds,
        generatedBy: currentDraft.generatedBy,
        createdAt: currentDraft.createdAt,
        exportStatus: currentDraft.exportStatus,
        signatureStatus: currentDraft.signatureStatus,
        packetStatus: currentDraft.packetStatus,
      }),
    }, 'Brad');
    setSavedDraft({ ...currentDraft, evidenceIds: [...currentDraft.evidenceIds, evidenceId] });
  }

  const steps = ['Source', 'Packet Type', 'Map Sources', 'Preview', 'Review & Save'];

  return (
    <section className="grid gap-xl" data-hash-id="evidence-packet-studio" data-route="/evidence/packet-studio" data-template="evidence">
      <MetricGrid metrics={metrics} />

      <section className="rounded-lg border border-hairline bg-surface-glass p-xl shadow-rest">
        <div className="flex flex-col gap-lg desktop:flex-row desktop:items-start desktop:justify-between">
          <div className="max-w-3xl">
            <ToneTag tone="teal">Evidence Packet Studio</ToneTag>
            <h1 className="mt-md text-3xl font-medium text-ink">Build an evidence-backed event packet</h1>
            <p className="mt-sm text-sm font-light leading-relaxed text-secondary">
              Use Brad-generated artifacts, uploaded evidence, signed forms, event data, and workflow records to assemble a survey-ready packet.
              Brad can draft and explain; a human reviewer must approve before export or lock.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-sm rounded-lg border border-card bg-tone-slate-bg p-lg text-xs text-secondary">
            <div className="flex items-center justify-between"><span>Selected event</span><strong className="text-ink">{selectedEvent?.id ?? 'Manual'}</strong></div>
            <div className="flex items-center justify-between"><span>Packet status</span><ToneBadge status={draft.packetStatus === 'ready_to_export' ? 'validated' : 'review-required'} /></div>
            <div className="flex items-center justify-between"><span>Frequency</span><ToneTag tone="orange">{frequencyLabel[packet.frequency ?? 'custom']}</ToneTag></div>
          </div>
        </div>
      </section>

      <div className="flex overflow-hidden rounded-lg border border-hairline bg-surface-glass shadow-rest" role="tablist" aria-label="Evidence Packet Studio steps">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            role="tab"
            aria-selected={selectedStep === index}
            onClick={() => setSelectedStep(index)}
            className={`min-w-0 flex-1 border-r border-hairline px-md py-sm text-left transition last:border-r-0 ${selectedStep === index ? 'bg-tone-teal-bg text-brand-teal-deep shadow-[inset_0_-3px_0_var(--brand-teal)]' : 'text-secondary hover:bg-surface-hover'}`}
          >
            <span className="block text-[10px] font-medium uppercase tracking-tag text-muted">Step {index + 1}</span>
            <span className="mt-0.5 block truncate text-sm font-medium">{step}</span>
          </button>
        ))}
      </div>

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div className="grid gap-lg">
          {selectedStep === 0 && <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
            <h2 className="text-h2 font-medium text-ink">1. Choose Packet Source</h2>
            <div className="mt-lg grid gap-sm tablet-p:grid-cols-2 desktop:grid-cols-3">
              {sourceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSourceMode(option)}
                  className={`rounded-lg border p-md text-left text-sm transition ${sourceMode === option ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep' : 'border-card bg-tone-slate-bg text-secondary hover:bg-surface-hover'}`}
                >
                  <FolderOpen className="mb-sm h-icon-sm w-icon-sm text-brand-teal" />
                  {option}
                </button>
              ))}
            </div>
            <label className="mt-lg grid gap-xs text-xs font-medium uppercase tracking-tag text-muted">
              CES event
              <select
                value={eventId ?? ''}
                onChange={(event) => {
                  const nextEventId = event.target.value;
                  setEventId(nextEventId);
                  const nextPacket = resolvePacketTypesForEvent(findPacketEvent(nextEventId))[0];
                  if (nextPacket) setPacketTypeId(nextPacket.packetTypeId);
                }}
                className="rounded-lg border border-hairline bg-surface px-md py-sm text-sm normal-case tracking-normal text-ink"
              >
                {REGULATORY_EVENTS.filter((event) => !event.isContext).slice(0, 80).map((event) => (
                  <option key={event.id} value={event.id}>{event.title} ({event.id})</option>
                ))}
              </select>
            </label>
          </section>}

          {selectedStep === 1 && <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
            <h2 className="text-h2 font-medium text-ink">2. Choose Packet Type</h2>
            <div className="mt-lg grid gap-md tablet-p:grid-cols-2">
              {EVIDENCE_PACKET_TYPES.map((item) => {
                const recommended = eventPacketOptions.some((candidate) => candidate.packetTypeId === item.packetTypeId);
                return (
                  <button
                    key={item.packetTypeId}
                    type="button"
                    onClick={() => setPacketTypeId(item.packetTypeId)}
                    className={`rounded-lg border p-lg text-left transition ${packet.packetTypeId === item.packetTypeId ? 'border-brand-teal bg-tone-teal-bg/70 shadow-rest' : 'border-card bg-tone-slate-bg hover:bg-surface-hover'}`}
                  >
                    <div className="flex flex-wrap items-center gap-sm">
                      <ToneTag tone={mappingTone[item.mappingStatus]}>{item.mappingStatus.replace('_', ' ')}</ToneTag>
                      <ToneTag tone="teal">{frequencyLabel[item.frequency ?? 'custom']}</ToneTag>
                      {recommended && <ToneTag tone="orange">Brad match</ToneTag>}
                    </div>
                    <h3 className="mt-md text-body font-medium text-ink">{item.label}</h3>
                    <p className="mt-xs text-xs font-light leading-relaxed text-secondary">{item.description}</p>
                    <div className="mt-md grid grid-cols-3 gap-sm text-[10px] uppercase tracking-tag text-muted">
                      <span>{item.requiredFormIds.length} forms</span>
                      <span>{item.requiredEvidenceTypes.length} evidence</span>
                      <span>{packetFamily(item.packetTypeId)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>}

          {selectedStep === 2 && <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
            <h2 className="text-h2 font-medium text-ink">3. Map Sources</h2>
            <div className="mt-lg grid gap-sm">
              {draft.sources.map((source) => (
                <div key={source.sourceId} className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-card bg-tone-slate-bg p-md">
                  <div>
                    <p className="text-sm font-medium text-ink">{source.label}</p>
                    <p className="mt-xs text-[10px] uppercase tracking-tag text-muted">{source.sourceType.replace(/_/g, ' ')}{source.ref ? ` / ${source.ref}` : ''}</p>
                  </div>
                  <ToneTag tone={source.status === 'available' ? 'teal' : source.status === 'manual' ? 'slate' : 'orange'}>
                    {source.status}
                  </ToneTag>
                </div>
              ))}
            </div>
          </section>}

          {selectedStep === 3 && <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
            <h2 className="text-h2 font-medium text-ink">4. Preview Packet</h2>
            <div className="mt-lg grid gap-lg desktop:grid-cols-[140px_minmax(0,1fr)]">
              <div className="grid content-start gap-sm">
                {draft.sections.map((section, index) => (
                  <button key={section.sectionId} type="button" className="aspect-[8.5/11] rounded-md border border-card bg-white/80 p-sm text-left text-[10px] text-muted shadow-sm">
                    <span className="font-medium text-brand-teal">Page {index + 1}</span>
                    <span className="mt-xs block">{section.title}</span>
                  </button>
                ))}
              </div>
              <div className="min-h-[620px] rounded-lg border border-card bg-white p-xl text-[#1f1c1b] shadow-rest">
                <div className="border-b-4 border-[#00797D] pb-lg">
                  <img src="/ci-logo-gray.png" alt="Care Indeed" className="h-10 w-auto" />
                  <h3 className="mt-xl text-3xl font-medium">Evidence Packet Generator</h3>
                  <p className="mt-sm text-sm font-light">{packet.label}</p>
                </div>
                <div className="mt-xl grid gap-md text-sm">
                  <p><strong>Event:</strong> {selectedEvent?.title ?? 'Manual packet'}</p>
                  <p><strong>Generated by:</strong> Brad draft, pending human review</p>
                  <p><strong>Readiness:</strong> {draft.sources.length - draft.missingSources.length} of {draft.sources.length} sources available</p>
                  <p><strong>Human review gate:</strong> Administrator review required before export lock.</p>
                </div>
                <div className="mt-xl grid gap-sm">
                  {draft.sections.slice(0, 8).map((section) => (
                    <div key={section.sectionId} className="flex items-center gap-sm border-b border-[#e5e4e3] py-sm text-xs">
                      {draft.missingSources.some((source) => source.sourceId === section.sectionId) ? <XCircle className="h-4 w-4 text-[#c74601]" /> : <CheckCircle2 className="h-4 w-4 text-[#00797D]" />}
                      <span>{section.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>}

          {selectedStep === 4 && <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
            <h2 className="text-h2 font-medium text-ink">5. Review & Save</h2>
            <div className="mt-lg grid gap-md tablet-p:grid-cols-2">
              <div className="rounded-lg border border-card bg-tone-slate-bg p-lg">
                <h3 className="text-body font-medium text-ink">Readiness</h3>
                <p className="mt-sm text-sm font-light text-secondary">
                  {draft.sources.length - draft.missingSources.length} of {draft.sources.length} packet sources are available. Human review is required before final export or lock.
                </p>
              </div>
              <div className="rounded-lg border border-card bg-tone-slate-bg p-lg">
                <h3 className="text-body font-medium text-ink">Selected packet</h3>
                <p className="mt-sm text-sm font-light text-secondary">{packet.label}</p>
                <div className="mt-md flex flex-wrap gap-sm">
                  <ToneTag tone={mappingTone[packet.mappingStatus]}>{packet.mappingStatus.replace('_', ' ')}</ToneTag>
                  <ToneTag tone="teal">{frequencyLabel[packet.frequency ?? 'custom']}</ToneTag>
                </div>
              </div>
            </div>
            <div className="mt-lg flex flex-wrap gap-sm">
              <Button variant="secondary" onClick={saveDraftToEvidenceCenter}><Save className="h-4 w-4" /> Save draft to Evidence Center</Button>
              <Button variant="tertiary" disabled title="Wire to approved export service before enabling"><Printer className="h-4 w-4" /> Print preview</Button>
              <Button variant="tertiary" disabled title="Export is disabled until human review is complete"><Download className="h-4 w-4" /> Download PDF</Button>
            </div>
            {savedDraft && (
              <div className="mt-md rounded-lg border border-tone-teal-border bg-tone-teal-bg p-md text-sm text-brand-teal-deep">
                Draft saved as Evidence Center artifact: {savedDraft.packetId}
              </div>
            )}
          </section>}
        </div>

        <aside className="grid content-start gap-lg">
          <section className="rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
            <div className="flex items-center gap-sm">
              <Bot className="h-icon-sm w-icon-sm text-brand-teal" />
              <h2 className="text-h3 font-medium text-ink">Brad assist</h2>
            </div>
            <p className="mt-md text-sm font-light leading-relaxed text-secondary">{draft.bradSummary}</p>
            <div className="mt-lg grid gap-sm">
              {[
                ['Ask Brad to summarize packet', true, Search],
                ['Ask Brad to find missing evidence', true, ClipboardCheck],
                ['Ask Brad to draft minutes', packet.packetTypeId.includes('qapi') || packet.packetTypeId.includes('governing'), FileText],
                ['Ask Brad to generate executive summary', true, Bot],
                ['Ask Brad to create packet appendix', false, Upload],
                ['Ask Brad to prepare export checklist', true, ShieldCheck],
              ].map(([label, enabled, Icon]) => {
                const IconComponent = Icon as typeof Bot;
                return (
                  <button
                    key={String(label)}
                    type="button"
                    disabled={!enabled}
                    title={enabled ? 'Brad action pattern placeholder' : 'Requires export appendix handler'}
                    className="flex items-center gap-sm rounded-lg border border-card bg-tone-slate-bg p-md text-left text-xs text-secondary enabled:hover:bg-surface-hover disabled:opacity-45"
                  >
                    <IconComponent className="h-4 w-4 text-brand-teal" />
                    {String(label)}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-hairline bg-surface p-lg shadow-rest">
            <h2 className="text-h3 font-medium text-ink">Missing / review queue</h2>
            <div className="mt-md grid gap-sm">
              {draft.missingSources.length > 0 ? draft.missingSources.map((source) => (
                <div key={source.sourceId} className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-xs text-tone-orange-text">
                  {source.label}
                </div>
              )) : (
                <div className="rounded-md border border-tone-teal-border bg-tone-teal-bg p-md text-xs text-brand-teal-deep">No required source gaps detected. Human approval is still required before final lock.</div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

export default EvidencePacketStudio;
