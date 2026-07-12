import { useEffect, useMemo, useState } from 'react';
import { packetsApi } from '@/policy/packets/api/packetsApi';
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
import {
  WorkspaceShell,
  type WorkspaceTabDefinition,
} from './workspace/WorkspaceShell';

type LoadState = 'registry' | 'loading' | 'api' | 'fallback';
type StudioStep = 'template' | 'event' | 'readiness' | 'generate-open' | 'workspace';
type WorkspaceLaunchAction = 'generate' | 'open-existing' | 'continue-review';

const AGENCY_ID = 'care-indeed-home-health';
const AGENCY_LABEL = 'Care Indeed Home Health';

const STUDIO_STEPS: readonly { id: StudioStep; label: string }[] = [
  { id: 'template', label: 'Template' },
  { id: 'event', label: 'Event' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'generate-open', label: 'Generate/Open' },
  { id: 'workspace', label: 'Workspace' },
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

export default function PacketStudioScreen() {
  const [templates, setTemplates] = useState<readonly PacketTemplateDefinition[]>(PACKET_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PacketTemplateSelectionOutput | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventCardModel | null>(null);
  const [studioStep, setStudioStep] = useState<StudioStep>('template');
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
    setStudioStep('event');
  };

  const handleEventSelect = (event: EventCardModel) => {
    setSelectedEvent(event);
    setWorkspaceAction(null);
    setStudioStep('readiness');
    setReadinessOpen(true);
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
                  ? 'Packet draft generation is staged for this selected event.'
                  : 'Existing packet handoff is staged for this selected event.'}
              </p>
            </div>
            <button
              type="button"
              className="min-h-tap w-fit rounded-md border border-hairline bg-brand-teal px-md text-sm font-medium text-white hover:opacity-90"
              onClick={() => setStudioStep('workspace')}
            >
              Open workspace
            </button>
          </section>
        ) : null}

        {studioStep === 'workspace' && workspacePacket ? (
          <WorkspaceShell
            initialPacket={workspacePacket}
            initialSources={workspacePacket}
            initialValidationResult={EMPTY_VALIDATION_RESULT}
            initialHistory={workspaceHistory}
            tabs={PACKET_STUDIO_TABS}
            workspaceFooter={<TriggerRegisterPanel />}
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
    renderingProfileId: selectedTemplate.packet_archetype_id,
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

function knownString(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === 'unknown') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function knownNumber(value: number | 'unknown'): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
