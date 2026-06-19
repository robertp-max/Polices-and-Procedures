import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, SlidersHorizontal, HelpCircle, MessageSquare, Search } from 'lucide-react';
import { useShellStore } from '@/policy/stores/uiStore';

import { CommandBar } from './components/CommandBar';
import { StructuredAnswer } from './components/StructuredAnswer';
import { RequirementsSnapshot } from './components/RequirementsSnapshot';
import { CitationChips } from './components/CitationChips';
import { ReferenceCards } from './components/ReferenceCards';
import { AvailableActions } from './components/AvailableActions';
import { StudioTabs, STUDIO_TABS, type StudioTabId } from './components/StudioTabs';
import { RightPanelPreview } from './components/RightPanelPreview';
import { NoAnswer } from './components/NoAnswer';
import { ScenarioResponse } from './components/ScenarioResponse';
import { ScenarioActionSections } from './components/ScenarioActionSections';
import { HealthStrip } from './components/HealthStrip';
import { OperationalGaps } from './components/OperationalGaps';
import { RegulatoryAlerts } from './components/RegulatoryAlerts';
import { BradHelpCenter } from './components/BradHelpCenter';
import { ChatThread } from './components/ChatThread';
import { ActiveCasePanel } from './components/ActiveCasePanel';
import { DemoCriticalEmergencyResponse } from './components/DemoCriticalEmergencyResponse';
import { DemoCriticalOrchestrationPanel } from './components/DemoCriticalOrchestrationPanel';
import { classifyScenario } from './lib/classifyScenario';
import { COMPLIANCE_ACTION_MAP, getComplianceActionDefinition, type ResolvedComplianceActionDefinition } from './lib/complianceActionMap';
import {
  acknowledgeDemoCriticalEmergency,
  createDemoCriticalEmergencyState,
  isDemoCriticalTrigger,
  selectDemoItem,
  type DemoCriticalEmergencyState,
} from './lib/demoCriticalEmergency';
import { useIaHealth, useIaQuery, useIaReference, useChatThread } from './lib/useIa';
import { iaClient } from './lib/iaClient';
import { consumePendingMissionQuery } from '@/policy/components/onboarding/missionHandoff';
import { useComplianceExecution } from '@/policy/compliance-execution/complianceExecutionStore';
import { openReferenceInNewTab } from './lib/referenceRouting';
import { resolveIaReference, warnUnresolvedIaReference } from './lib/referenceResolver';
import type { BradRuntimeSnapshot } from '@/services/bradAppContext';
import type { AvailableAction, IntentKind, StructuredResponse } from './lib/responseTypes';

/* ═══════════════════════════════════════════════════════════════
   iAdministrator page — Compliance Intelligence command center.

   Layout:
     top   : health strip (corpus + Ollama status)
     left  : command bar, studio tabs, structured response stack
     right : execution workspace (reference preview)

   NO chat history. Each command stands on its own. Switching a
   studio tab while a query is active re-runs the last input under
   the new intent.
   ═══════════════════════════════════════════════════════════════ */

const DEFAULT_SUGGESTIONS = [
  'Run pre-survey audit',
  'Identify compliance gaps in QAPI',
  'Show missing forms for governing body',
  'Open plan of care policy',
  'Create governing body brief for CMIA risk',
  'What is required before billing a Medicare claim?',
];

export function IAdministratorPage() {
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  const navigate = useNavigate();
  const execution = useComplianceExecution();

  const bradRuntimeSnapshot = useMemo<BradRuntimeSnapshot>(() => ({
    events: execution.events.map(event => ({
      id: event.id,
      title: event.title,
      anchorDate: event.anchorDate,
      domain: event.domain,
    })),
    executionUnits: execution.executionUnits.map(unit => ({
      id: unit.id,
      title: unit.title,
      dueDate: unit.dueDate,
      complianceState: unit.complianceState,
      parentEventId: unit.parentEventId,
      workflowId: unit.workflowId,
      sourcePolicyIds: unit.sourcePolicyIds,
      sourceFormIds: unit.sourceFormIds,
    })),
    workflows: execution.workflows.map(workflow => ({
      id: workflow.id,
      title: workflow.title,
      eventId: workflow.eventId,
    })),
    sprintMetrics: execution.sprintMetrics,
  }), [execution.events, execution.executionUnits, execution.workflows, execution.sprintMetrics]);

  const { health, loading: healthLoading, error: healthError, backendMode, refresh } = useIaHealth();
  const query = useIaQuery(backendMode, bradRuntimeSnapshot);
  const reference = useIaReference();
  const chat = useChatThread(bradRuntimeSnapshot);

  const [activeTab, setActiveTab] = useState<StudioTabId>('answer');
  const [rebuildState, setRebuildState] = useState<'idle' | 'running' | 'error'>('idle');
  const [rebuildError, setRebuildError] = useState<string | null>(null);
  const [runningActionId, setRunningActionId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [demoCriticalState, setDemoCriticalState] = useState<DemoCriticalEmergencyState | null>(null);
  const isMockDemoMode = backendMode === 'checking'
    || backendMode === 'static_deploy'
    || backendMode === 'not_found'
    || backendMode === 'unreachable'
    || backendMode === 'method_mismatch';

  const localScenarioClassification = useMemo(
    () => (query.lastInput ? classifyScenario(query.lastInput) : null),
    [query.lastInput],
  );
  const localScenarioActionDefinition = useMemo<ResolvedComplianceActionDefinition | null>(() => {
    if (!localScenarioClassification) return null;
    if (!Object.prototype.hasOwnProperty.call(COMPLIANCE_ACTION_MAP, localScenarioClassification.scenarioId)) {
      return null;
    }
    return getComplianceActionDefinition(localScenarioClassification.scenarioId);
  }, [localScenarioClassification]);

  /* ── Submit handler ─────────────────────────────────────────── */
  const submitCommand = useCallback((input: string, explicitIntent?: IntentKind) => {
    if (isDemoCriticalTrigger(input)) {
      query.reset();
      reference.clear();
      setActiveTab('answer');
      setDemoCriticalState(createDemoCriticalEmergencyState(input));
      return;
    }
    setDemoCriticalState(null);
    const intent = explicitIntent ?? tabToIntent(activeTab);
    query.submit({ input, intent });
  }, [query, activeTab, reference]);

  /* ── Pending mission handoff (returning-user mission prompt) ──
     Runs once on mount: if a query was stashed by MissionPromptOverlay,
     consume it and submit through the existing query infrastructure. */
  useEffect(() => {
    const pending = consumePendingMissionQuery();
    if (pending) submitCommand(pending);
    // Intentionally mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Tab change re-runs the last command under the new intent ── */
  const onTabChange = useCallback((tab: StudioTabId) => {
    setActiveTab(tab);
    if (demoCriticalState) return;
    if (query.lastInput && !query.loading) {
      query.submit({ input: query.lastInput, intent: tabToIntent(tab) });
    }
  }, [query, demoCriticalState]);

  const onAcknowledgeDemoCritical = useCallback(() => {
    setDemoCriticalState((prev) => (prev ? acknowledgeDemoCriticalEmergency(prev) : prev));
  }, []);

  const onOpenDemoForm = useCallback((id: string) => {
    setDemoCriticalState((prev) => {
      if (!prev || !prev.acknowledged) return prev;
      return selectDemoItem(prev, 'form', id);
    });
  }, []);

  const onOpenDemoPolicy = useCallback((id: string) => {
    setDemoCriticalState((prev) => {
      if (!prev || !prev.acknowledged) return prev;
      return selectDemoItem(prev, 'policy', id);
    });
  }, []);

  /* ── Action dispatch ────────────────────────────────────────── */
  const handleAction = useCallback(async (action: AvailableAction) => {
    setRunningActionId(action.id);
    try {
      if (action.type.startsWith('open_') && action.targetId) {
        openReferenceInNewTab(action.targetId);
        return;
      }
      if (action.type.startsWith('generate_') && action.studioOutputType) {
        const intent = studioTypeToIntent(action.studioOutputType);
        if (intent && query.lastInput) {
          const tabId = STUDIO_TABS.find(t => t.intent === intent)?.id;
          if (tabId) setActiveTab(tabId);
          await query.submit({ input: query.lastInput, intent });
        }
        return;
      }
      // print_form / download_pdf / attach_to_event / mark_complete:
      // staged for future workflow layer; show reference for now.
      if (action.targetId) openReferenceInNewTab(action.targetId);
    } finally {
      setRunningActionId(null);
    }
  }, [query]);

  const handleRebuild = useCallback(async () => {
    // Guard: never attempt rebuild when no backend is available
    if (backendMode !== 'available' && backendMode !== 'index_not_built') {
      setRebuildState('error');
      setRebuildError(
        backendMode === 'static_deploy'
          ? 'Rebuild is not available in this deployment. The corpus index must be built locally using `npm run ia:index`.'
          : 'Backend unavailable — cannot rebuild index.',
      );
      return;
    }
    setRebuildState('running');
    setRebuildError(null);
    try {
      await iaClient.rebuildIndex();
      refresh();
      setRebuildState('idle');
    } catch (err) {
      setRebuildState('error');
      const errMsg = (err as Error)?.message ?? 'Rebuild failed';
      // Translate technical error codes into user-friendly messages
      setRebuildError(
        errMsg.includes('static_deploy')
          ? 'Rebuild unavailable: static deployment has no backend runtime.'
          : errMsg.includes('405') || errMsg.includes('method_mismatch')
            ? 'Rebuild failed (405): API endpoint rejected the request method. Check server routing.'
            : errMsg,
      );
    }
  }, [refresh, backendMode]);

  /* ── Phase-1 SSE: pre-load right panel the moment retrieval completes ── */
  useEffect(() => {
    if (demoCriticalState) return;
    const topDocId = query.phase1TopDocId;
    if (!topDocId) return;
    // Only pre-load if the user hasn't opened something manually.
    if (reference.reference) return;
    void reference.load(topDocId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.phase1TopDocId, demoCriticalState, isMockDemoMode]);

  /* ── Auto-select reference from first linkedReference / citation ── */
  useEffect(() => {
    if (demoCriticalState) return;
    const r = query.response;
    if (!r || r.noAnswerFound) return;
    if (reference.reference) return; // don't override a user selection
    const autoCandidates = [
      localScenarioActionDefinition?.relatedPolicies[0]?.id ??
      localScenarioActionDefinition?.relatedForms[0]?.id ??
      localScenarioActionDefinition?.relatedWorkflows[0]?.id,
      r.linkedReferences[0]?.id,
      r.citations[0]?.policyId,
      r.availableActions.find(a => a.type.startsWith('open_'))?.targetId,
    ].filter((id): id is string => Boolean(id));
    const auto = autoCandidates.find((id) => {
      const resolved = resolveIaReference({ id, source: 'IAdministratorPage.autoSelectReference' });
      if (resolved.resolved) return true;
      warnUnresolvedIaReference(resolved);
      return false;
    });
    if (auto) void reference.load(auto);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.response?.id, localScenarioActionDefinition, demoCriticalState, isMockDemoMode]);

  const suggestions = useMemo(() =>
    (query.response || demoCriticalState) ? undefined : DEFAULT_SUGGESTIONS,
    [query.response, demoCriticalState],
  );

  /* ── Render ─────────────────────────────────────────────────── */
  const bgText = isLight ? '#1F1C1B' : '#E0E0E0';
  const titleColor = isLight ? '#00797D' : '#E0E0E0'; /* teal for Brad/iAdmin titles in light per spec */
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const subtle = isLight ? '#747474' : 'rgba(255,255,255,0.45)';

  return (
    <div className="w-full h-full flex flex-col" style={{ color: bgText }}>
      {/* ── Header + health strip ───────────────────────────────── */}
      <div className="w-full px-6 md:px-8 pt-4 md:pt-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h1
              className="text-[20px] md:text-[22px] font-semibold"
              style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif", color: titleColor }}
            >
              Brad iAdministrator
            </h1>
            <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: subtle, fontFamily: "'JetBrains Mono', monospace" }}>
              Compliance Intelligence · Brad Internal Corpus · Grounded Answers Only
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle: Query ↔ Chat */}
            <div
              className="flex items-center rounded-lg p-0.5"
              style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', border: `1px solid ${border}` }}
            >
              <button
                type="button"
                onClick={() => setChatMode(false)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-[0.15em] transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: !chatMode ? (isLight ? '#fff' : 'rgba(255,255,255,0.1)') : 'transparent',
                  color: !chatMode ? '#C8A96E' : subtle,
                  boxShadow: !chatMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                title="Single-query mode"
              >
                <Search size={11} strokeWidth={2} /> Query
              </button>
              <button
                type="button"
                onClick={() => setChatMode(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-[0.15em] transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: chatMode ? (isLight ? '#fff' : 'rgba(255,255,255,0.1)') : 'transparent',
                  color: chatMode ? '#C8A96E' : subtle,
                  boxShadow: chatMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                title="Chat mode — stateful case-based conversation"
              >
                <MessageSquare size={11} strokeWidth={2} /> Chat
                {chat.session?.lifeSafetyFlag && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#DC2626' }}
                  />
                )}
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.24em]" style={{ color: subtle, fontFamily: "'JetBrains Mono', monospace" }}>
              <SlidersHorizontal size={12} strokeWidth={2} />
              Policies · Forms · Appendices
            </div>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              title="Open Brad Help Center"
              aria-label="Open Brad Help Center"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: isLight ? '#C74601' : '#FFC107',
                background: isLight ? '#FFF7ED' : 'rgba(255,193,7,0.08)',
                border: `1px solid ${isLight ? '#FFD5BF' : 'rgba(255,193,7,0.25)'}`,
              }}
            >
              <HelpCircle size={13} strokeWidth={2} />
              Help
            </button>
          </div>
        </div>
        <HealthStrip
          health={health}
          loading={healthLoading}
          error={healthError}
          backendMode={backendMode}
          isLight={isLight}
          onRebuild={
            backendMode === 'available' || backendMode === 'index_not_built'
              ? rebuildState === 'running' ? undefined : handleRebuild
              : undefined   // disabled — no backend in this deployment
          }
        />
        {rebuildState === 'running' && (
          <div className="mt-2 text-[11px] flex items-center gap-2" style={{ color: subtle, fontFamily: "'JetBrains Mono', monospace" }}>
            <Loader2 size={12} className="animate-spin" /> Rebuilding index — this can take a few minutes on first run.
          </div>
        )}
        {rebuildError && (
          <div className="mt-2 text-[11px]" style={{ color: isLight ? '#B91C1C' : '#FCA5A5', fontFamily: "'JetBrains Mono', monospace" }}>
            Rebuild failed: {rebuildError}
          </div>
        )}
      </div>

      {/* ── Two-column workspace ─────────────────────────────────── */}
      <div className="flex-1 w-full px-6 md:px-8 py-4 md:py-6 overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)] gap-4 md:gap-6">

        {/* ── CHAT MODE ─────────────────────────────────────────── */}
        {chatMode ? (
          <>
            {/* LEFT: Chat thread */}
            <div className="flex flex-col min-h-0 overflow-hidden">
              <ChatThread
                messages={chat.messages}
                session={chat.session}
                loading={chat.loading}
                retrieving={chat.retrieving}
                phase1Mode={chat.phase1Mode}
                error={chat.error}
                isLight={isLight}
                onSubmit={chat.submit}
                onNewCase={chat.newThread}
                onOpenReference={openReferenceInNewTab}
                onAction={handleAction}
              />
            </div>

            {/* RIGHT: Active case panel or reference preview */}
            <div className="hidden lg:flex flex-col min-h-0 gap-3">
              {reference.reference ? (
                <RightPanelPreview
                  reference={reference.reference}
                  loading={reference.loading}
                  error={reference.error}
                  isLight={isLight}
                  onClose={reference.clear}
                  onOpenLinked={openReferenceInNewTab}
                />
              ) : (
                <ActiveCasePanel
                  session={chat.session}
                  isLight={isLight}
                  onNewCase={chat.newThread}
                  onOpenReference={openReferenceInNewTab}
                  onSessionUpdate={chat.updateSession}
                />
              )}
            </div>
          </>
        ) : (
          <>
            {/* ── QUERY MODE (existing behavior) ───────────────────── */}
            {/* LEFT column: command input + structured response */}
            <div className="flex flex-col min-h-0 gap-4 overflow-hidden">
              <CommandBar
                onSubmit={submitCommand}
                loading={query.loading}
                isLight={isLight}
                suggestions={suggestions}
              />

              <StudioTabs
                active={activeTab}
                onChange={onTabChange}
                isLight={isLight}
                disabled={query.loading && !query.response}
              />

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar -mr-2 pr-2 flex flex-col gap-4">
                {query.error && (
                  <div
                    className="rounded-xl px-3 py-2 text-[12px]"
                    style={{
                      color: isLight ? '#B91C1C' : '#FCA5A5',
                      background: isLight ? '#FEF2F2' : 'rgba(252,165,165,0.05)',
                      border: `1px solid ${isLight ? '#FECACA' : 'rgba(252,165,165,0.2)'}`,
                    }}
                  >
                    {query.error}
                  </div>
                )}

                {query.loading && !query.response && (
                  <PendingState
                    isLight={isLight}
                    intent={tabToIntent(activeTab)}
                    retrieving={query.retrieving}
                  />
                )}

                {query.response && (
                  <ResponseStack
                    response={query.response}
                    localScenarioClassification={localScenarioClassification}
                    localScenarioActionDefinition={localScenarioActionDefinition}
                    isLight={isLight}
                    activeReferenceId={reference.reference?.id ?? null}
                    runningActionId={runningActionId}
                    onOpenReference={openReferenceInNewTab}
                    onAction={handleAction}
                  />
                )}

                {demoCriticalState && (
                  <DemoCriticalEmergencyResponse
                    isLight={isLight}
                    acknowledged={demoCriticalState.acknowledged}
                    onAcknowledge={onAcknowledgeDemoCritical}
                  />
                )}

                {!query.loading && !query.response && !query.error && !demoCriticalState && (
                  <WelcomeState isLight={isLight} />
                )}
              </div>
            </div>

            {/* RIGHT column: execution workspace */}
            <div className="hidden lg:flex flex-col min-h-0">
              {demoCriticalState ? (
                <DemoCriticalOrchestrationPanel
                  state={demoCriticalState}
                  isLight={isLight}
                  onOpenForm={onOpenDemoForm}
                  onOpenPolicy={onOpenDemoPolicy}
                />
              ) : (
                <RightPanelPreview
                  reference={reference.reference}
                  loading={reference.loading}
                  error={reference.error}
                  isLight={isLight}
                  onClose={reference.clear}
                  onOpenLinked={openReferenceInNewTab}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Meta footer — timings + intent badge (only when we have a response). */}
      {query.response?.meta && (
        <div
          className="px-6 md:px-8 py-2 text-[10px] uppercase tracking-[0.24em] flex items-center gap-3"
          style={{
            color: subtle,
            borderTop: `1px solid ${border}`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span style={{ color: isLight ? '#C74601' : '#FFC107', fontWeight: 600 }}>Generated by Brad</span>
          <span>·</span>
          <span>intent: {query.response.meta.intent}</span>
          <span>·</span>
          <span>{query.response.meta.elapsedMs} ms</span>
          <span>·</span>
          <span>{query.response.meta.retrievedChunkIds.length} passages</span>
        </div>
      )}

      {/* Brad Help Center overlay */}
      <BradHelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Hidden executive proposal trigger — double-click bottom-left corner */}
      <button
        type="button"
        onDoubleClick={() => navigate('/brad-proposal')}
        aria-label="Hidden executive proposal"
        tabIndex={-1}
        className="fixed bottom-0 left-0 w-10 h-10 z-50 cursor-default"
        style={{ background: 'transparent', border: 'none', outline: 'none' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Response stack — orchestrates the order sub-components render in.
   ───────────────────────────────────────────────────────────── */
function ResponseStack({
  response,
  localScenarioClassification,
  localScenarioActionDefinition,
  isLight,
  activeReferenceId,
  runningActionId,
  onOpenReference,
  onAction,
}: {
  response: StructuredResponse;
  localScenarioClassification: ReturnType<typeof classifyScenario>;
  localScenarioActionDefinition: ResolvedComplianceActionDefinition | null;
  isLight: boolean;
  activeReferenceId: string | null;
  runningActionId: string | null;
  onOpenReference: (id: string) => void;
  onAction: (action: AvailableAction) => void;
}) {
  const hasScenario = Boolean(response.scenario && response.scenario.category !== 'GENERAL_QUERY');
  const hasLocalScenarioActionLayer = Boolean(localScenarioClassification && localScenarioActionDefinition);

  if (response.noAnswerFound) {
    return (
      <>
        {!hasLocalScenarioActionLayer && (
          <NoAnswer
            reason={response.noAnswerReason}
            isLight={isLight}
            hasScenarioMapping={hasScenario}
          />
        )}
        {hasScenario && response.scenario && (
          <ScenarioResponse scenario={response.scenario} isFallback isLight={isLight} />
        )}
        {hasLocalScenarioActionLayer && localScenarioClassification && localScenarioActionDefinition && (
          <ScenarioActionSections
            classification={localScenarioClassification}
            definition={localScenarioActionDefinition}
            isLight={isLight}
            onOpenReference={onOpenReference}
          />
        )}
        {response.linkedReferences.length > 0 && (
          <ReferenceCards
            references={response.linkedReferences}
            isLight={isLight}
            activeId={activeReferenceId}
            onOpenReference={onOpenReference}
          />
        )}
        {response.availableActions.length > 0 && (
          <AvailableActions
            actions={response.availableActions}
            isLight={isLight}
            runningActionId={runningActionId}
            onAction={onAction}
          />
        )}
        {/* Operational state still relevant even when corpus has no answer */}
        <OperationalGaps
          operationalGaps={response.operationalGaps}
          lifecycleAlerts={response.lifecycleAlerts}
          phaseStatus={response.phaseStatus}
          isLight={isLight}
        />
        <RegulatoryAlerts regulatoryAlerts={response.regulatoryAlerts} isLight={isLight} />
      </>
    );
  }
  return (
    <>
      {hasLocalScenarioActionLayer && localScenarioClassification && localScenarioActionDefinition && (
        <ScenarioActionSections
          classification={localScenarioClassification}
          definition={localScenarioActionDefinition}
          isLight={isLight}
          onOpenReference={onOpenReference}
        />
      )}
      {hasScenario && response.scenario && (
        <ScenarioResponse scenario={response.scenario} isLight={isLight} />
      )}
      <StructuredAnswer response={response} isLight={isLight} />
      {response.requirementsSnapshot.length > 0 && (
        <RequirementsSnapshot items={response.requirementsSnapshot} isLight={isLight} onOpenReference={onOpenReference} />
      )}
      {response.citations.length > 0 && (
        <CitationChips citations={response.citations} isLight={isLight} onOpenReference={onOpenReference} />
      )}
      {response.linkedReferences.length > 0 && (
        <ReferenceCards
          references={response.linkedReferences}
          isLight={isLight}
          activeId={activeReferenceId}
          onOpenReference={onOpenReference}
        />
      )}
      {response.availableActions.length > 0 && (
        <AvailableActions
          actions={response.availableActions}
          isLight={isLight}
          runningActionId={runningActionId}
          onAction={onAction}
        />
      )}
      {/* Phase 1-2: Operational gaps + lifecycle alerts + regulatory updates */}
      <OperationalGaps
        operationalGaps={response.operationalGaps}
        lifecycleAlerts={response.lifecycleAlerts}
        phaseStatus={response.phaseStatus}
        isLight={isLight}
      />
      <RegulatoryAlerts regulatoryAlerts={response.regulatoryAlerts} isLight={isLight} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Placeholder states.
   ───────────────────────────────────────────────────────────── */
function PendingState({ isLight, intent, retrieving }: { isLight: boolean; intent: IntentKind; retrieving: boolean }) {
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';
  const label = STUDIO_TABS.find(t => t.intent === intent)?.label ?? 'Compliance Answer';
  const stageMsg = retrieving
    ? 'Brad is retrieving corpus …'
    : `Brad is generating ${label.toLowerCase()} …`;
  return (
    <div
      className="rounded-2xl p-6 flex items-center gap-3"
      style={{ background: surface, border: `1px solid ${border}`, color: muted }}
    >
      <Loader2 size={16} className="animate-spin" />
      <span className="text-[12px] uppercase tracking-[0.24em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {stageMsg}
      </span>
    </div>
  );
}

function WelcomeState({ isLight }: { isLight: boolean }) {
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';
  const accent = isLight ? '#C74601' : '#FFC107';

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3"
        style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
      >
        Brad · Ready
      </div>
      <p className="text-[14px] leading-relaxed" style={{ color: text }}>
        Ask Brad a compliance question or issue a command. Brad retrieves only from the internal Home Health corpus — policies, procedures, forms, and appendices — and returns a structured, citation-backed answer with actionable references.
      </p>
      <p className="text-[12px] mt-2" style={{ color: muted }}>
        Tip · quote an ID like <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>HR-FM-020</span> or <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>CO-HP-001</span> to anchor Brad's answer.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Small mappers used across the page.
   ───────────────────────────────────────────────────────────── */
function tabToIntent(tab: StudioTabId): IntentKind {
  return STUDIO_TABS.find(t => t.id === tab)?.intent ?? 'question';
}

function studioTypeToIntent(st: NonNullable<StructuredResponse['studioOutputType']>): IntentKind | null {
  switch (st) {
    case 'audit_checklist':      return 'pre_survey_audit';
    case 'action_plan':          return 'action_plan';
    case 'governing_body_brief': return 'governing_body_brief';
    case 'qapi_digest':          return 'qapi_digest';
    case 'knowledge_article':    return 'knowledge_article';
    case 'summary':              return 'question';
    default:                     return null;
  }
}

export default IAdministratorPage;
