import { useEffect, useMemo, useState } from 'react';
import { packetsApi } from '@/policy/packets/api/packetsApi';
import { getArchetype, hasArchetype } from '@/policy/packets/registries/archetypeRegistry';
import type { PacketModel } from '@/policy/packets/contracts';
import {
  segmentQapiSourceByQuarter,
  selectQuarterSegment,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import { generateQapiPacketModelFromText } from './generateQapiFromSource';
import {
  PACKET_TEMPLATES,
  type PacketTemplateDefinition,
  type PacketTemplateSelectionOutput,
} from '@/policy/packets/registries/templateRegistry';
import TemplateSelector from './TemplateSelector';
import EventSelectorCalendar from './eventSelector/EventSelectorCalendar';
import type { EventCardModel } from './eventSelector/eventCardModel';
import { ReadinessDrawer } from './ReadinessDrawer';
import type { ReadinessDrawerInput, ReadinessDrawerModel } from './readinessModel';
import TriggerRegisterPanel from './workspace/TriggerRegisterPanel';
import PacketSignoffPanel from './signing/PacketSignoffPanel';
import {
  WorkspaceShell,
  type WorkspaceTabDefinition,
} from './workspace/WorkspaceShell';

type LoadState = 'registry' | 'loading' | 'api' | 'fallback';
type StudioStep = 'template' | 'event' | 'readiness' | 'generate-open' | 'workspace' | 'signoff';
type WorkspaceLaunchAction = 'generate' | 'open-existing' | 'continue-review';
type BradLogic = 'claude' | 'gpt' | 'qapi-master-claude' | 'qapi-raw-claude';

const AGENCY_ID = 'care-indeed-home-health';
const AGENCY_LABEL = 'Care Indeed Home Health Care, Inc.';
const QAPI_QUARTERLY_TEMPLATE_ID = 'qapi-quarterly';

const STUDIO_STEPS: readonly { id: StudioStep; label: string }[] = [
  { id: 'template', label: 'Template' },
  { id: 'event', label: 'Event' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'generate-open', label: 'Generate/Open' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'signoff', label: 'Sign-off' },
];

const PACKET_STUDIO_TABS = [
  { id: 'edit', label: 'Edit' },
  { id: 'add-information', label: 'Add Information' },
  { id: 'ask-brad', label: 'Ask Brad' },
  { id: 'sources', label: 'Sources' },
  { id: 'validation', label: 'Validation' },
  { id: 'history', label: 'History' },
] as const satisfies readonly WorkspaceTabDefinition[];

const EMPTY_VALIDATION_RESULT = {
  status: 'draft',
  counts: {
    errors: 0,
    warnings: 0,
    info: 0,
    total: 0,
  },
  issues: [],
} as const;

interface BradSourceExtractionResponse {
  readonly extraction?: {
    readonly engine?: string;
    readonly passes?: number;
    readonly fields?: readonly BradSourceField[];
    readonly missing?: readonly string[];
    readonly conflicts?: readonly unknown[];
    readonly validationSummary?: string;
  };
  readonly metadata?: {
    readonly sourceId?: string;
    readonly fileName?: string;
    readonly charCount?: number;
  };
}

export interface BradSourceField {
  readonly key: string;
  readonly value?: string | null;
  readonly confidence?: number;
  readonly sourceSnippet?: string;
  readonly agreement?: number;
  readonly needsReview?: boolean;
  readonly group?: string;
  readonly label?: string;
}

export default function PacketStudioScreen() {
  const [templates, setTemplates] = useState<readonly PacketTemplateDefinition[]>(PACKET_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PacketTemplateSelectionOutput | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventCardModel | null>(null);
  const [studioStep, setStudioStep] = useState<StudioStep>('template');
  const [sourceText, setSourceText] = useState('');
  const [sourceFileName, setSourceFileName] = useState('qapi-source.txt');
  const [generatedModel, setGeneratedModel] = useState<PacketModel | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<string | null>(null);
  const [bradLogic, setBradLogic] = useState<BradLogic>('gpt');
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [workspaceAction, setWorkspaceAction] = useState<WorkspaceLaunchAction | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    packetsApi.listPacketTemplates()
      .then((response) => {
        if (cancelled) return;
        setTemplates(response.templates);
        setLoadState('api');
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setTemplates(PACKET_TEMPLATES);
        setLoadState('fallback');
        setLoadError(error instanceof Error ? error.message : 'Packet template API unavailable.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTemplateDefinition = useMemo(
    () => templates.find((template) => template.packet_template_id === selectedTemplate?.packet_template_id) ?? null,
    [selectedTemplate, templates],
  );

  const readinessInput = useMemo(
    () => selectedTemplate && selectedEvent
      ? buildReadinessInput(selectedTemplate, selectedEvent)
      : null,
    [selectedEvent, selectedTemplate],
  );

  const workspacePacket = useMemo(
    () => selectedTemplate && selectedEvent
      ? buildWorkspacePacket(
        selectedTemplate,
        selectedEvent,
        selectedTemplateDefinition,
        workspaceAction ?? 'generate',
      )
      : null,
    [selectedEvent, selectedTemplate, selectedTemplateDefinition, workspaceAction],
  );

  const workspaceHistory = useMemo(
    () => [
      {
        id: 'packet-studio-opened',
        timestamp: new Date().toISOString(),
        actor: 'Packet Studio',
        fieldPath: 'workspace',
        summary: workspaceAction === 'generate'
          ? 'Workspace opened for generated packet draft.'
          : workspaceAction === 'continue-review'
            ? 'Workspace opened for packet review.'
            : 'Workspace opened for existing packet.',
      },
    ],
    [workspaceAction],
  );

  const templateStats = useMemo(() => {
    const available = templates.filter((template) => template.availability === 'Available').length;
    const categories = new Set(templates.map((template) => template.category)).size;
    return { available, categories };
  }, [templates]);

  const handleTemplateSelect = (selectionOutput: PacketTemplateSelectionOutput) => {
    setSelectedTemplate(selectionOutput);
    setSelectedEvent(null);
    setWorkspaceAction(null);
    setReadinessOpen(false);
    setGeneratedModel(null);
    setGenerateError(null);
    setGenerateStatus(null);
    setBradLogic(defaultBradLogicForTemplate(selectionOutput.packet_template_id));
    setStudioStep('event');
  };

  const handleEventSelect = (event: EventCardModel) => {
    setSelectedEvent(event);
    setWorkspaceAction(null);
    setGeneratedModel(null);
    setGenerateError(null);
    setGenerateStatus(null);
    setStudioStep('readiness');
    setReadinessOpen(true);
  };

  const handleSourceFile = (file: File) => {
    if (isGenerating) return;
    setGenerateError(null);
    setGenerateStatus(null);
    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setSourceText(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setGenerateError('Could not read the selected file.');
    reader.readAsText(file);
  };

  const handleGenerateFromSource = async () => {
    if (isGenerating) return;
    if (!selectedTemplate || !selectedEvent) return;
    if (!sourceText.trim()) {
      setGenerateError('Paste or upload QAPI source data first — no operational packet is generated from an empty source.');
      return;
    }
    const selectedSource = resolveQapiSourceTextForEvent(sourceText, selectedEvent);
    if (selectedSource.error) {
      setGenerateError(selectedSource.error);
      setGenerateStatus(null);
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    const activeBradLogic = bradLogicForTemplate(selectedTemplate.packet_template_id, bradLogic);
    const sourceForBrad = isQapiPromptOnlyLogic(activeBradLogic) ? sourceText : selectedSource.text;
    const sourceForPacketBuild = isQapiPromptOnlyLogic(activeBradLogic) ? sourceText : selectedSource.text;
    setGenerateStatus([
      selectedSource.note,
      `Selected event: ${selectedEvent.eventTitle} (${selectedEvent.eventInstanceId}) on ${selectedEvent.eventDate}.`,
      `Brad is reading the source with ${bradLogicLabel(activeBradLogic)}. Packet generation will wait for this review.`,
    ].filter(Boolean).join(' '));
    try {
      let bradReview: BradSourceExtractionResponse | null = null;
      try {
        bradReview = await requireBradSourceReview({
          text: sourceForBrad,
          fileName: sourceFileName,
          template: 'qapi',
          packetTemplateId: selectedTemplate.packet_template_id,
          packetTemplateTitle: selectedTemplateDefinition?.title ?? selectedTemplate.packet_template_id,
          selectedEvent,
          logic: activeBradLogic,
        });
      } catch {
        bradReview = null;
      }
      const bradReady = !isQapiPromptOnlyLogic(activeBradLogic)
        && bradReview?.extraction?.engine === 'brad'
        && Boolean(bradReview.extraction.passes);
      setGenerateStatus([
        selectedSource.note,
        `Selected event: ${selectedEvent.eventTitle} (${selectedEvent.eventInstanceId}) on ${selectedEvent.eventDate}.`,
        isQapiPromptOnlyLogic(activeBradLogic) && bradReview?.extraction?.engine === 'brad'
          ? (bradReview.extraction.validationSummary || `Brad ${bradLogicLabel(activeBradLogic)} received the QAPI prompt.`)
          : bradReady
          ? (bradReview?.extraction?.validationSummary || `Brad completed ${bradReview?.extraction?.passes ?? 0} source read pass(es).`)
          : 'Source review did not return a verified reading; using the local parser fallback without invented values.',
        bradReview?.metadata?.sourceId ? `Source ${bradReview.metadata.sourceId} captured for audit review.` : '',
      ].filter(Boolean).join(' '));
      const model = generateQapiPacketModelFromText({
        text: sourceForPacketBuild,
        fileName: sourceFileName,
        event: selectedEvent,
        templateId: selectedTemplate.packet_template_id,
        generatedAtISO: new Date().toISOString(),
        bradExtraction: bradReady ? bradReview?.extraction : undefined,
      });
      setGeneratedModel(model);
      setGenerateError(null);
      setWorkspaceAction('generate');
      setStudioStep('workspace');
    } catch (error) {
      setGenerateStatus(null);
      setGenerateError(error instanceof Error ? error.message : 'Packet generation failed for the provided source.');
    } finally {
      setIsGenerating(false);
    }
  };

  const prepareWorkspace = (action: WorkspaceLaunchAction) => {
    setWorkspaceAction(action);
    setReadinessOpen(false);
    setStudioStep('generate-open');
  };

  const openExistingWorkspace = (_model: ReadinessDrawerModel) => {
    prepareWorkspace('open-existing');
  };

  return (
    <div className="min-h-full bg-surface text-ink">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-xl px-lg py-xl">
        <header className="flex flex-col gap-md border-b border-hairline pb-lg lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              Packet Studio
            </p>
            <h1 className="mt-xs text-3xl font-semibold tracking-normal text-ink">
              Mandated Event Packet Studio
            </h1>
            <p className="mt-sm text-sm leading-6 text-muted">
              Template, event, readiness, generation/opening, and packet workspace.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-sm text-sm">
            <div className="border-l border-hairline pl-md">
              <div className="text-2xl font-semibold text-ink">{templates.length}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Templates</div>
            </div>
            <div className="border-l border-hairline pl-md">
              <div className="text-2xl font-semibold text-ink">{templateStats.available}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Available</div>
            </div>
            <div className="border-l border-hairline pl-md">
              <div className="text-2xl font-semibold text-ink">{templateStats.categories}</div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Categories</div>
            </div>
          </div>
        </header>

        <StudioStepper activeStep={studioStep} />

        {loadState === 'fallback' && loadError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-md py-sm text-sm text-amber-900">
            Using bundled packet templates. API response: {loadError}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-sm text-xs text-muted">
          <span className="rounded-lg border border-hairline bg-surface-glass px-md py-xs">
            Source: {loadState === 'api' ? 'packet API' : loadState === 'loading' ? 'loading API' : 'template registry'}
          </span>
          {selectedTemplate ? (
            <span className="rounded-lg border border-hairline bg-surface-glass px-md py-xs">
              Template: {selectedTemplate.packet_template_id}
            </span>
          ) : null}
          {selectedEvent ? (
            <span className="rounded-lg border border-hairline bg-surface-glass px-md py-xs">
              Event: {selectedEvent.eventTitle}
            </span>
          ) : null}
        </div>

        {studioStep === 'template' ? (
          <>
            {!selectedTemplate ? (
              <p className="text-sm text-muted">No packet template selected.</p>
            ) : null}
            <TemplateSelector
              templates={templates}
              className="min-w-0"
              onSelect={handleTemplateSelect}
            />
          </>
        ) : null}

        {studioStep === 'event' && selectedTemplate ? (
          <section className="min-w-0">
            <div className="mb-md flex flex-col gap-sm border-b border-hairline pb-md lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Event</h2>
                <p className="mt-xs text-sm text-muted">
                  Filtered by {selectedTemplate.packet_template_id}
                  {selectedTemplateDefinition ? ` - ${selectedTemplateDefinition.title}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="min-h-tap rounded-md border border-hairline px-md text-sm font-medium text-brand-teal hover:bg-surface-hover"
                onClick={() => setStudioStep('template')}
              >
                Change template
              </button>
            </div>
            <EventSelectorCalendar
              selectedTemplate={selectedTemplate}
              onSelectEvent={handleEventSelect}
              agencyLabel={AGENCY_LABEL}
            />
          </section>
        ) : null}

        {studioStep === 'readiness' && selectedTemplate && selectedEvent ? (
          <section className="grid gap-md rounded-md border border-hairline bg-surface-glass px-lg py-lg">
            <div>
              <h2 className="text-lg font-semibold text-ink">Readiness</h2>
              <p className="mt-xs text-sm text-muted">
                {selectedEvent.eventTitle} on {selectedEvent.eventDate}
              </p>
            </div>
            <div className="flex flex-wrap gap-sm">
              <button
                type="button"
                className="min-h-tap rounded-md border border-hairline bg-surface px-md text-sm font-medium text-brand-teal hover:bg-surface-hover"
                onClick={() => setReadinessOpen(true)}
              >
                Review readiness
              </button>
              <button
                type="button"
                className="min-h-tap rounded-md border border-hairline px-md text-sm font-medium text-muted hover:bg-surface-hover"
                onClick={() => setStudioStep('event')}
              >
                Change event
              </button>
            </div>
          </section>
        ) : null}

        {studioStep === 'generate-open' && selectedTemplate && selectedEvent ? (
          <section className="grid gap-md rounded-md border border-hairline bg-surface-glass px-lg py-lg">
            <div>
              <h2 className="text-lg font-semibold text-ink">Generate/Open</h2>
              <p className="mt-xs text-sm text-muted">
                {workspaceAction === 'generate'
                  ? 'Upload or paste the QAPI source dataset for this event, then generate the analytical packet.'
                  : 'Existing packet handoff is staged for this selected event.'}
              </p>
            </div>

            {workspaceAction === 'generate' ? (
              <div className="grid gap-sm">
                <label className="grid gap-xs text-sm">
                  <span className="font-medium text-ink">Source data file (.txt, .json, .csv, .md)</span>
                  <input
                    type="file"
                    accept=".txt,.json,.csv,.tsv,.md,text/plain,application/json"
                    className="text-sm"
                    disabled={isGenerating}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSourceFile(file);
                    }}
                  />
                </label>
                <label className="grid gap-xs text-sm">
                  <span className="font-medium text-ink">…or paste the source dataset</span>
                  <textarea
                    className="min-h-[160px] w-full rounded-md border border-hairline bg-surface px-sm py-xs font-mono text-xs"
                    placeholder="Paste QAPI source text (dataset markers, KPIs, findings, PIP triggers…)"
                    value={sourceText}
                    disabled={isGenerating}
                    onChange={(e) => {
                      setSourceText(e.target.value);
                      setGenerateStatus(null);
                      setGenerateError(null);
                    }}
                  />
                </label>
                <p className="text-xs text-muted">
                  {sourceFileName !== 'qapi-source.txt' ? `Loaded: ${sourceFileName} · ` : ''}
                  {sourceText.length.toLocaleString()} characters · segmentation resolves the quarter by the
                  event date and fails closed on ambiguity; missing values render UNKNOWN, never zero.
                </p>
                {generateStatus ? (
                  <div className="rounded-md border border-brand-teal/30 bg-brand-teal/10 px-md py-sm text-sm text-brand-teal" role="status">
                    {generateStatus}
                  </div>
                ) : null}
                {generateError ? (
                  <div className="rounded-md border border-amber-300 bg-amber-50 px-md py-sm text-sm text-amber-900" role="alert">
                    {generateError}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-sm">
                  <div className="flex flex-wrap gap-sm">
                    <button
                      type="button"
                      className="min-h-tap w-fit rounded-md border border-hairline bg-brand-teal px-md text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      onClick={handleGenerateFromSource}
                      disabled={!sourceText.trim() || isGenerating}
                    >
                      {isGenerating ? 'Brad is reading source…' : 'Generate packet from source'}
                    </button>
                    <button
                      type="button"
                      className="min-h-tap w-fit rounded-md border border-hairline px-md text-sm font-medium text-brand-teal hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isGenerating}
                      onClick={() => { setGeneratedModel(null); setStudioStep('workspace'); }}
                    >
                      Open empty workspace instead
                    </button>
                  </div>
                  <BradLogicSwitch
                    packetTemplateId={selectedTemplate.packet_template_id}
                    value={bradLogicForTemplate(selectedTemplate.packet_template_id, bradLogic)}
                    disabled={isGenerating}
                    onChange={setBradLogic}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="min-h-tap w-fit rounded-md border border-hairline bg-brand-teal px-md text-sm font-medium text-white hover:opacity-90"
                onClick={() => setStudioStep('workspace')}
              >
                Open workspace
              </button>
            )}
          </section>
        ) : null}

        {studioStep === 'workspace' && workspacePacket ? (
          <WorkspaceShell
            initialPacket={generatedModel ?? workspacePacket}
            initialSources={generatedModel ?? workspacePacket}
            initialValidationResult={EMPTY_VALIDATION_RESULT}
            initialHistory={workspaceHistory}
            tabs={PACKET_STUDIO_TABS}
            workspaceFooter={
              <div className="grid gap-md">
                <TriggerRegisterPanel />
                <div className="flex flex-wrap items-center justify-between gap-sm border-t border-hairline pt-md">
                  <span className="text-sm text-muted">
                    Packet ready to route to signers? Continue to eCIgn sign-off.
                  </span>
                  <button
                    type="button"
                    className="min-h-tap w-fit rounded-md border border-hairline bg-brand-teal px-md py-sm text-sm font-semibold text-white hover:opacity-90"
                    onClick={() => setStudioStep('signoff')}
                  >
                    Continue to sign-off →
                  </button>
                </div>
              </div>
            }
          />
        ) : null}

        {studioStep === 'signoff' && selectedTemplate && selectedEvent ? (
          <PacketSignoffPanel
            packetTitle={workspacePacket?.title ?? selectedEvent.eventTitle}
            packetTemplateId={selectedTemplate.packet_template_id}
            packetInstanceId={buildPacketInstanceId(
              selectedTemplate.packet_template_id,
              selectedEvent.eventInstanceId,
            )}
            workflowInstanceId={
              knownString(selectedEvent.workflowInstanceId) ??
              (knownString(selectedEvent.workflowId)
                ? `${selectedEvent.workflowId}:${selectedEvent.eventInstanceId}`
                : selectedEvent.eventInstanceId)
            }
            eventInstanceId={selectedEvent.eventInstanceId}
            signerCapacities={preferSignerRoles(
              selectedTemplate.required_signers,
              selectedEvent.requiredSigners,
            )}
            onBack={() => setStudioStep('workspace')}
          />
        ) : null}
      </div>

      <ReadinessDrawer
        open={readinessOpen && studioStep === 'readiness'}
        readiness={readinessInput}
        onClose={() => setReadinessOpen(false)}
        onGenerateNewPacket={() => prepareWorkspace('generate')}
        onOpenExistingDraft={openExistingWorkspace}
        onContinueReview={() => prepareWorkspace('continue-review')}
        onTrackSignatures={openExistingWorkspace}
        onViewSignedPacket={openExistingWorkspace}
        onOpenInGoogleDrive={openExistingWorkspace}
        onCreateAmendment={openExistingWorkspace}
        onCreateSupersedingVersion={openExistingWorkspace}
      />
    </div>
  );
}

function StudioStepper({ activeStep }: { activeStep: StudioStep }) {
  const activeIndex = STUDIO_STEPS.findIndex((step) => step.id === activeStep);
  return (
    <nav aria-label="Packet Studio progress" className="grid gap-xs md:grid-cols-5">
      {STUDIO_STEPS.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <div
            key={step.id}
            className={[
              'rounded-md border px-md py-sm text-sm font-semibold',
              isActive
                ? 'border-brand-teal bg-surface text-brand-teal'
                : isComplete
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-hairline bg-surface-glass text-muted',
            ].join(' ')}
          >
            {step.label}
          </div>
        );
      })}
    </nav>
  );
}

async function requireBradSourceReview(input: {
  readonly text: string;
  readonly fileName: string;
  readonly template: 'qapi' | 'admission' | 'event' | 'generic';
  readonly packetTemplateId: string;
  readonly packetTemplateTitle: string;
  readonly selectedEvent?: EventCardModel;
  readonly logic: BradLogic;
}): Promise<BradSourceExtractionResponse> {
  const eventContext = input.selectedEvent
    ? buildSelectedGenerationContext({
      event: input.selectedEvent,
      packetTemplateId: input.packetTemplateId,
      packetTemplateTitle: input.packetTemplateTitle,
      sourceFileName: input.fileName,
      logic: input.logic,
    })
    : '';
  const reviewText = eventContext ? `${eventContext}\n\n${input.text}` : input.text;
  const response = await fetch('/api/calendar/intake/extract-source', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: input.fileName,
      mimeType: guessClientMimeType(input.fileName),
      fileBase64: textToBase64(reviewText),
      template: input.template,
      packetTemplateId: input.packetTemplateId,
      requireBrad: false,
      bradLogic: input.logic,
    }),
  });
  const payload = await response.json().catch(() => null) as
    | BradSourceExtractionResponse
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    const message = payload && 'error' in payload && payload.error?.message
      ? payload.error.message
      : 'Source review did not complete.';
    throw new Error(message);
  }
  return (payload ?? {}) as BradSourceExtractionResponse;
}

function BradLogicSwitch({
  packetTemplateId,
  value,
  disabled,
  onChange,
}: {
  readonly packetTemplateId: string;
  readonly value: BradLogic;
  readonly disabled: boolean;
  readonly onChange: (value: BradLogic) => void;
}) {
  const options = bradLogicOptions(packetTemplateId);
  return (
    <div className="ml-auto grid gap-xs justify-self-end text-right">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Brad logic</span>
      <div
        className="inline-flex rounded-md border border-hairline bg-surface p-xxs shadow-sm"
        role="radiogroup"
        aria-label="Brad logic"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              className={[
                'min-h-tap rounded px-md py-xs text-left transition disabled:cursor-not-allowed disabled:opacity-50',
                selected
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-muted hover:bg-surface-hover',
              ].join(' ')}
              onClick={() => onChange(option.value)}
            >
              <span className="block text-xs font-semibold">{option.label}</span>
              {option.detail ? <span className="block text-[11px] opacity-80">{option.detail}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function bradLogicLabel(value: BradLogic): string {
  if (value === 'qapi-master-claude') return 'Logic A';
  if (value === 'qapi-raw-claude') return 'Logic B';
  return value === 'claude' ? 'Logic A' : 'Logic B';
}

function defaultBradLogicForTemplate(packetTemplateId: string): BradLogic {
  return packetTemplateId === QAPI_QUARTERLY_TEMPLATE_ID ? 'qapi-master-claude' : 'gpt';
}

function bradLogicForTemplate(packetTemplateId: string, value: BradLogic): BradLogic {
  if (packetTemplateId === QAPI_QUARTERLY_TEMPLATE_ID) {
    if (value === 'claude' || value === 'qapi-raw-claude') return 'qapi-master-claude';
    return value;
  }
  return isQapiPromptOnlyLogic(value) ? 'gpt' : value;
}

function bradLogicOptions(packetTemplateId: string): Array<{ value: BradLogic; label: string; detail?: string }> {
  if (packetTemplateId === QAPI_QUARTERLY_TEMPLATE_ID) {
    return [
      { value: 'qapi-master-claude', label: 'Logic A' },
      { value: 'gpt', label: 'Logic B' },
    ];
  }
  const base: Array<{ value: BradLogic; label: string; detail?: string }> = [
    { value: 'claude', label: 'Logic A' },
    { value: 'gpt', label: 'Logic B' },
  ];
  return base;
}

function isQapiPromptOnlyLogic(value: BradLogic): boolean {
  return value === 'qapi-master-claude' || value === 'qapi-raw-claude';
}

interface SelectedQapiSourceText {
  readonly text: string;
  readonly note: string | null;
  readonly error: string | null;
}

function resolveQapiSourceTextForEvent(source: string, event: EventCardModel): SelectedQapiSourceText {
  const segments = segmentQapiSourceByQuarter(source);
  if (segments.length === 0) return { text: source, note: null, error: null };

  const targetQuarter = selectedEventQuarter(event);
  const selection = selectQuarterSegment(segments, {
    eventDateISO: event.eventDate,
    targetQuarter: targetQuarter ?? undefined,
  });

  if (!selection.segment) {
    return {
      text: source,
      note: null,
      error: `Source contains multiple QAPI quarters but Packet Studio could not match it to ${event.eventTitle} (${event.eventDate}). ${selection.reason}`,
    };
  }

  return {
    text: selection.segment.text,
    note: `Selected ${selection.segment.quarterLabel ?? selection.segment.quarter ?? 'matching quarter'} from the uploaded multi-quarter source for ${event.eventTitle}.`,
    error: null,
  };
}

function quarterKeyFromISODate(value: string): string | null {
  const match = /^(20\d{2})-(\d{2})-\d{2}/.exec(value);
  if (!match) return null;
  const month = Number(match[2]);
  if (!Number.isFinite(month) || month < 1 || month > 12) return null;
  return `${match[1]}-Q${Math.floor((month - 1) / 3) + 1}`;
}

function selectedEventQuarter(event: EventCardModel): string | null {
  const fromReportingPeriod = event.reportingPeriodStart ? quarterKeyFromISODate(event.reportingPeriodStart) : null;
  if (fromReportingPeriod) return fromReportingPeriod;

  const titleMatch = /\bQ([1-4])\b.*\b(20\d{2})\b/i.exec(event.eventTitle)
    ?? /\b(20\d{2})\b.*\bQ([1-4])\b/i.exec(event.eventTitle);
  if (titleMatch) {
    return titleMatch[1]?.startsWith('20')
      ? `${titleMatch[1]}-Q${titleMatch[2]}`
      : `${titleMatch[2]}-Q${titleMatch[1]}`;
  }

  const bareQuarter = /\bQ([1-4])\b/i.exec(event.eventTitle);
  const eventYear = eventYearForQuarter(event.eventDate, bareQuarter?.[1]);
  if (bareQuarter && eventYear) return `${eventYear}-Q${bareQuarter[1]}`;

  return null;
}

function eventYearForQuarter(eventDate: string, quarter: string | undefined): string | null {
  const match = /^(20\d{2})-(\d{2})-\d{2}/.exec(eventDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (quarter === '4' && month === 1) return String(year - 1);
  return String(year);
}

function buildSelectedGenerationContext(input: {
  readonly event: EventCardModel;
  readonly packetTemplateId: string;
  readonly packetTemplateTitle: string;
  readonly sourceFileName: string;
  readonly logic: BradLogic;
}): string {
  const { event } = input;
  const selectedQuarter = selectedEventQuarter(event);
  return [
    'PACKET STUDIO AUTHORITATIVE UI SELECTION — MUST BE USED BEFORE READING SOURCE.',
    'The user selected these items in Packet Studio. These values control scope. Do not override them with the first quarter, first record, filename, prompt text, cheat sheet, or source-internal instruction.',
    `Selected packet template ID: ${input.packetTemplateId}`,
    `Selected packet template title: ${input.packetTemplateTitle}`,
    `Selected Brad logic: ${bradLogicLabel(input.logic)}`,
    `Selected source file name: ${input.sourceFileName}`,
    `Selected event title: ${event.eventTitle}`,
    `Selected event instance ID: ${event.eventInstanceId}`,
    event.eventFamilyId ? `Selected event family ID: ${event.eventFamilyId}` : '',
    `Selected event date: ${event.eventDate}`,
    event.workflowId ? `Selected workflow ID: ${event.workflowId}` : '',
    event.workflowInstanceId && event.workflowInstanceId !== 'unknown'
      ? `Selected workflow instance ID: ${event.workflowInstanceId}`
      : '',
    event.cadence ? `Selected event cadence: ${event.cadence}` : '',
    event.regulatoryDriver ? `Selected regulatory driver: ${event.regulatoryDriver}` : '',
    event.reportingPeriodStart && event.reportingPeriodEnd
      ? `Selected reporting period: ${event.reportingPeriodStart} through ${event.reportingPeriodEnd}`
      : '',
    selectedQuarter ? `Selected reporting quarter: ${selectedQuarter}` : '',
    'For QAPI Quarterly, isolate the source slice matching the selected reporting quarter/event above before using any source facts.',
    'If source facts conflict with this selected event context, mark the conflict; do not silently switch events or quarters.',
    'SOURCE BUNDLE FOR THE SELECTED EVENT:',
  ].filter(Boolean).join('\n');
}

function guessClientMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.csv')) return 'text/csv';
  if (lower.endsWith('.tsv')) return 'text/tab-separated-values';
  if (lower.endsWith('.md')) return 'text/markdown';
  return 'text/plain';
}

function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function buildReadinessInput(
  selectedTemplate: PacketTemplateSelectionOutput,
  selectedEvent: EventCardModel,
): ReadinessDrawerInput {
  const packetInstanceId = buildPacketInstanceId(selectedTemplate.packet_template_id, selectedEvent.eventInstanceId);
  const workflowInstanceId = knownString(selectedEvent.workflowInstanceId);
  const packetStatusKnown = selectedEvent.packetStatus !== 'unknown';

  return {
    agencyId: AGENCY_ID,
    agencyLabel: AGENCY_LABEL,
    eventTitle: selectedEvent.eventTitle,
    eventDate: selectedEvent.eventDate,
    eventFamilyId: selectedEvent.eventFamilyId,
    eventInstanceId: selectedEvent.eventInstanceId,
    workflowId: selectedEvent.workflowId,
    workflowInstanceId,
    owner: selectedEvent.owner,
    eventStatus: selectedEvent.eventStatus,
    cadence: selectedEvent.cadence,
    regulatoryDriver: selectedEvent.regulatoryDriver,
    reportingPeriodStart: selectedEvent.reportingPeriodStart,
    reportingPeriodEnd: selectedEvent.reportingPeriodEnd,
    packetTemplateId: selectedTemplate.packet_template_id,
    selectedPacketTemplateId: selectedTemplate.packet_template_id,
    templateCompatible: true,
    packetTemplateCompatible: true,
    requiredForms: selectedTemplate.required_forms,
    requiredEvidence: selectedTemplate.required_analyses,
    requiredApprovals: preferTemplateRoles(selectedTemplate.required_approvers, selectedEvent.requiredApprovals),
    requiredSigners: preferTemplateRoles(selectedTemplate.required_signers, selectedEvent.requiredSigners),
    requiredFormCompletion: knownNumber(selectedEvent.requiredFormCompletion),
    evidenceCompleteness: knownNumber(selectedEvent.evidenceCompleteness),
    approvalStatus: selectedEvent.approvalStatus,
    signatureStatus: selectedEvent.signatureStatus,
    blockerCount: knownNumber(selectedEvent.blockerCount),
    driveDestination: selectedTemplate.Drive_destination_pattern,
    existingPacket: packetStatusKnown
      ? {
        exists: true,
        packetInstanceId,
        packetId: packetInstanceId,
        packetVersion: 1,
        revision: 1,
        status: selectedEvent.packetStatus,
        driveFolderUrl: selectedTemplate.Drive_destination_pattern,
      }
      : null,
  };
}

function buildWorkspacePacket(
  selectedTemplate: PacketTemplateSelectionOutput,
  selectedEvent: EventCardModel,
  templateDefinition: PacketTemplateDefinition | null,
  workspaceAction: WorkspaceLaunchAction,
) {
  const packetInstanceId = buildPacketInstanceId(selectedTemplate.packet_template_id, selectedEvent.eventInstanceId);
  const workflowId = knownString(selectedEvent.workflowId);
  const workflowInstanceId =
    knownString(selectedEvent.workflowInstanceId) ??
    (workflowId ? `${workflowId}:${selectedEvent.eventInstanceId}` : selectedEvent.eventInstanceId);
  const packetStatus = workspaceAction === 'generate' || selectedEvent.packetStatus === 'unknown'
    ? 'DRAFT_GENERATED'
    : selectedEvent.packetStatus;

  return {
    title: `${templateDefinition?.title ?? selectedTemplate.packet_template_id} - ${selectedEvent.eventTitle}`,
    revision: 1,
    identity: {
      packetInstanceId,
      packetId: packetInstanceId,
      packetVersion: 1,
      contentHash: null,
      agencyId: AGENCY_ID,
      eventFamilyId: selectedEvent.eventFamilyId,
      eventInstanceId: selectedEvent.eventInstanceId,
      workflowId,
      workflowInstanceId,
      packetTemplateId: selectedTemplate.packet_template_id,
      archetypeId: selectedTemplate.packet_archetype_id,
      subtype: workspaceAction === 'generate' ? 'generated-draft' : 'existing-packet',
      reportingPeriodStart: selectedEvent.reportingPeriodStart,
      reportingPeriodEnd: selectedEvent.reportingPeriodEnd,
      dataThroughDate: selectedEvent.eventDate,
      status: packetStatus,
    },
    renderingProfileId: hasArchetype(selectedTemplate.packet_archetype_id)
      ? getArchetype(selectedTemplate.packet_archetype_id).renderingProfileId
      : 'care-indeed-letter',
    classification: selectedTemplate.confidentiality_rule,
    handlingNotice: selectedTemplate.retention_rule,
    modules: selectedTemplate.required_modules.map((moduleId, index) => ({
      moduleInstanceId: `${packetInstanceId}:${moduleId}`,
      moduleId,
      title: moduleId,
      order: index + 1,
      status: 'in_progress',
      payload: {
        eventTitle: selectedEvent.eventTitle,
        eventDate: selectedEvent.eventDate,
        packetTemplateId: selectedTemplate.packet_template_id,
      },
      contentHash: null,
    })),
    pagePlan: null,
    kpis: [],
    findings: [],
    workflows: workflowId ? [{ id: workflowId, status: selectedEvent.workflowStatus }] : [],
    decisions: [],
    forms: selectedTemplate.required_forms.map((formId) => ({ id: formId, status: 'pending' })),
    attachments: [],
    confidentialAddendums: [],
    signatures: selectedTemplate.required_signers.map((role) => ({ id: role, status: 'required' })),
    validationStatus: 'draft',
  };
}

function buildPacketInstanceId(packetTemplateId: string, eventInstanceId: string): string {
  return `${packetTemplateId}-${eventInstanceId}`.replace(/[^A-Za-z0-9_-]+/g, '-');
}

function preferTemplateRoles(
  templateRoles: readonly string[],
  eventRoles: readonly string[] | 'unknown',
): readonly string[] | 'unknown' {
  return templateRoles.length > 0 ? templateRoles : eventRoles;
}

/** Resolve ordered signer capacities, always as a concrete list (template first). */
function preferSignerRoles(
  templateRoles: readonly string[],
  eventRoles: readonly string[] | 'unknown',
): readonly string[] {
  if (templateRoles.length > 0) return templateRoles;
  return eventRoles === 'unknown' ? [] : eventRoles;
}

function knownString(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === 'unknown') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function knownNumber(value: number | 'unknown'): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
