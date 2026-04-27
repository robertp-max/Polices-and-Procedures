/* ═══════════════════════════════════════════════════════════════
   Policy Lifecycle — canonical 5-state model
   States:  DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED
   No additional retired-state vocabulary exists by design.
   See Builder/Policies/Lifecycle/03-Policy-Lifecycle-Architecture.md
   ═══════════════════════════════════════════════════════════════ */

/** Canonical 5-state lifecycle. */
export type LifecycleState =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

/** All transition intents callable on the state machine. */
export type LifecycleIntent =
  | 'submitForReview'    // DRAFT → REVIEW
  | 'requestRevision'    // REVIEW → DRAFT
  | 'approve'            // REVIEW → APPROVED
  | 'reject'             // REVIEW → DRAFT (with rationale)
  | 'publish'            // APPROVED → PUBLISHED
  | 'archive'            // PUBLISHED → ARCHIVED  (or DRAFT/REVIEW/APPROVED → ARCHIVED with justification)
  | 'reopenForRevision'; // PUBLISHED → DRAFT (creates a new working draft; current published copy stays enforceable until republish)

/** Identity of the actor performing a transition. */
export interface LifecycleActor {
  userId:   string;
  name:     string;
  email:    string;
  role:     string;
}

/** A single, hash-chained event in the lifecycle history. */
export interface LifecycleHistoryEntry {
  id:           string;
  policyId:     string;
  fromState:    LifecycleState | null;
  toState:      LifecycleState;
  intent:       LifecycleIntent | 'created';
  actor:        LifecycleActor;
  rationale:    string;
  /** ISO-8601 timestamp. */
  timestamp:    string;
  /** SHA-style chain hash (mock for client-side; real chain lives in ecign.audit_events). */
  chainHash:    string;
  /** Optional eCIgn signature reference, populated when transition required signing. */
  signatureRef?: string | null;
}

/** Per-policy lifecycle envelope kept alongside the existing Policy record. */
export interface PolicyLifecycleEnvelope {
  policyId:        string;
  state:           LifecycleState;
  /** Author / originator of the policy (immutable). */
  createdBy:       LifecycleActor;
  createdAt:       string;
  /** Last actor to mutate state. */
  lastTransition?: LifecycleHistoryEntry;
  /** Full ordered history (newest last). */
  history:         LifecycleHistoryEntry[];
}

/** Outcome of a state-machine transition attempt. */
export type LifecycleTransitionResult =
  | { ok: true;  next: PolicyLifecycleEnvelope; event: LifecycleHistoryEntry }
  | { ok: false; code: LifecycleRejectionCode; message: string };

export type LifecycleRejectionCode =
  | 'INVALID_TRANSITION'
  | 'MISSING_RATIONALE'
  | 'SELF_APPROVAL_FORBIDDEN'
  | 'NOT_FOUND'
  | 'ALREADY_TERMINAL'
  | 'AUDITOR_MODE_BLOCK';

/** Tabbed workspace modes (mode-aware right rail). */
export type WorkspaceMode = 'edit' | 'review' | 'approve' | 'publish' | 'view';

/** Static map: which modes are valid for which lifecycle state. */
export const MODES_BY_STATE: Record<LifecycleState, readonly WorkspaceMode[]> = {
  DRAFT:     ['edit', 'view'],
  REVIEW:    ['review', 'view'],
  APPROVED:  ['approve', 'publish', 'view'],
  PUBLISHED: ['publish', 'view'],
  ARCHIVED:  ['view'],
};

/** Stable ordering for queue grouping. */
export const STATE_ORDER: readonly LifecycleState[] = [
  'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED',
];

/** Display labels — ALL CAPS to match the design language. */
export const STATE_LABEL: Record<LifecycleState, string> = {
  DRAFT:     'DRAFT',
  REVIEW:    'REVIEW',
  APPROVED:  'APPROVED',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED:  'ARCHIVED',
};

/** Theme colors per state (CSS custom-property friendly). */
export const STATE_COLOR: Record<LifecycleState, { fg: string; bg: string; border: string }> = {
  DRAFT:     { fg: '#7A4F00', bg: '#FFF4D6', border: '#FFC107' },
  REVIEW:    { fg: '#0B3D62', bg: '#E1EEF7', border: '#4097D8' },
  APPROVED:  { fg: '#15604F', bg: '#DCF1EA', border: '#27AE91' },
  PUBLISHED: { fg: '#0B5394', bg: '#D4E6F8', border: '#1F77C4' },
  ARCHIVED:  { fg: '#4A4A4A', bg: '#ECECEC', border: '#9C9C9C' },
};
