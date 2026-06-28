/* ═══════════════════════════════════════════════════════════════════════════
   Brad Guided Assistance — shared types (single source of truth).
   Interactive, gated, UI-driven walkthroughs Brad generates and launches.
   ═══════════════════════════════════════════════════════════════════════════ */

export type GuidedDomain =
  | 'event_packet'
  | 'help_thread'
  | 'community'
  | 'evidence_upload'
  | 'survey_export'
  | 'form_signature'
  | 'policy_lookup'
  | 'onboarding'
  | 'audit_resolution'
  | 'general_navigation';

export type GuidedTourSlot = {
  id: string;
  label: string;
  required: boolean;
  type: 'event' | 'packet_type' | 'route' | 'role' | 'free_text' | 'choice';
  value?: unknown;
  options?: Array<{ label: string; value: string }>;
};

export type GuidedAllowedAction = {
  selector: string;
  action: 'click' | 'input' | 'select' | 'confirm';
};

export type GuidedStepCompletionCondition =
  | { type: 'click'; selector: string }
  | { type: 'route_change'; route: string }
  | { type: 'element_visible'; selector: string }
  | { type: 'form_value'; selector: string; expected: string | boolean | number }
  | { type: 'store_predicate'; predicateId: string; args: Record<string, unknown> }
  | { type: 'manual_confirm'; label: string; requiresReason?: boolean };

export type GuidedStorePredicateId =
  | 'event_selected'
  | 'packet_template_selected'
  | 'event_workspace_visible'
  | 'packet_builder_ready'
  | 'packet_generated'
  | 'packet_export_ready'
  | 'packet_download_available';

/** Who performs a step. 'brad' = auto-run by the assistant; 'human' = checkpoint. */
export type GuidedStepActor = 'brad' | 'human';

/** A deterministic action Brad can safely perform itself (co-pilot mode). */
export type GuidedAutoAction =
  | { kind: 'navigate'; route: string }
  | { kind: 'click'; selector: string }
  | { kind: 'set_select'; selector: string; valueFromSlot?: string };

export type GuidedTourStep = {
  id: string;
  order: number;
  title: string;
  instruction: string;
  route?: string;
  targetSelector: string;
  targetDescription: string;
  placement: 'top' | 'right' | 'bottom' | 'left' | 'center';
  allowedActions: GuidedAllowedAction[];
  waitFor: GuidedStepCompletionCondition;
  canSkip: false;
  showNextOnlyAfterComplete: true;
  highlightStyle: 'brad_rainbow_glow';
  /** Optional permission required to perform this step (UI gating only). */
  requiredPermission?: string;
  /** Navigation step — its target appears once the tour activates; rehearsal won't hard-block on it. */
  navStep?: boolean;
  /** Target lives inside an embedded iframe (not anchorable from the parent document). */
  frameScoped?: boolean;
  /** Conditions under which this step is already complete (auto-advanced before locking). */
  autoCompleteWhen?: { predicate?: GuidedStorePredicateId; route?: string };
  /** Co-pilot: who performs this step. Defaults to 'human'. */
  actor?: GuidedStepActor;
  /** Co-pilot: the action Brad performs when actor === 'brad'. */
  autoAction?: GuidedAutoAction;
};

/** Result of rehearsing a tour against the current screen, before any lock/launch. */
export type GuidedTourRehearsalResult = {
  okToLaunch: boolean;
  startStepId: string | null;
  resolvedSteps: Array<{
    stepId: string;
    targetSelector: string;
    resolvedElementFound: boolean;
    visible: boolean;
    clickable: boolean;
    alreadyComplete: boolean;
    routeReady: boolean;
    reason?: string;
  }>;
  blockers: Array<{
    stepId: string;
    type:
      | 'missing_target'
      | 'hidden_target'
      | 'not_clickable'
      | 'route_not_ready'
      | 'already_complete'
      | 'permission_blocked'
      | 'ambiguous_selector';
    message: string;
  }>;
};

export type GuidedTour = {
  id: string;
  title: string;
  description: string;
  intent: string;
  normalizedPrompt: string;
  tourKey: string;
  version: string;
  routeScope: string[];
  roleScope: string[];
  requiredSlots: GuidedTourSlot[];
  slotValues: Record<string, unknown>;
  steps: GuidedTourStep[];
  completionPolicy: 'strict_gated';
  /** 'copilot' = Brad auto-runs safe steps + hands off at human checkpoints (no lock).
      'coached' = legacy spotlight-and-wait gated tour. */
  mode?: 'coached' | 'copilot';
  reusable: boolean;
  createdBy: 'brad_generated' | 'admin_curated' | 'system_seeded';
  createdAt: string;
  updatedAt: string;
};

export type GuidedAssistanceIntent = {
  kind: 'guided_assistance';
  taskIntent: string;
  confidence: number;
  domain?: GuidedDomain;
  requiredSlots: GuidedTourSlot[];
  collectedSlots: Record<string, unknown>;
  missingSlots: GuidedTourSlot[];
  shouldAskFollowUp: boolean;
  shouldLaunchTour: boolean;
};

export type TourLockState = {
  active: boolean;
  tourId: string | null;
  currentStepId: string | null;
  allowedSelectors: string[];
  lockedReason: string;
};
