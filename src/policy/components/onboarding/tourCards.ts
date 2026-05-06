/**
 * Guided tour cards — first-person Brad. Spec: 2026-04-29 update.
 *
 *  1–2  hero welcome (head-to-hips Brad portrait)
 *  3–13 basic tour, anchored to key execution areas
 *  14   decision card (Finish Basic / Continue Full / Skip)
 *  15–16 advanced (Help Center / Contextual Tips)
 *  17   final ("You're Ready") with Finish Tour + Ask Brad
 */

export type TourCardKind = 'hero' | 'standard' | 'decision' | 'final';

export interface TourCard {
  id: string;
  title: string;
  body: string;
  kind: TourCardKind;
  showBrad?: boolean;
  heroBrad?: boolean;
  /** Route to navigate to before showing this card. */
  route?: string;
  /** CSS selector(s); first match wins. If none resolve, card centers. */
  anchorSelector?: string | string[];
}

export const TOUR_CARDS: ReadonlyArray<TourCard> = [
  // ── 1–2 hero welcome ────────────────────────────────────────
  {
    id: 'brad-welcome',
    kind: 'hero',
    title: "Welcome. I'm Brad.",
    body:
      "I'm your compliance intelligence engine. I help you connect policies, workflows, audits, forms, and evidence so you can operate with confidence.",
    showBrad: true,
    heroBrad: true,
    route: '/dashboard',
  },
  {
    id: 'brad-what-i-do',
    kind: 'hero',
    title: "Here's how I help.",
    body:
      "I answer compliance questions, search your internal corpus, connect you to policies and forms, and help you understand what needs action.",
    showBrad: true,
    heroBrad: true,
    route: '/iadministrator',
  },

  // ── 3–13 basic tour ──────────────────────────────────────────
  {
    id: 'command-dashboard',
    kind: 'standard',
    title: "This is your command center.",
    body:
      "I use this area to show your compliance posture, urgent items, and operational health.",
    route: '/dashboard',
    anchorSelector: '[aria-label="Command Center"]',
  },
  {
    id: 'journey',
    kind: 'standard',
    title: "This is your onboarding journey.",
    body:
      "I help enforce training, screening, competency, and clearance before users move forward.",
    route: '/journey',
    anchorSelector: '[aria-label="Onboarding"]',
  },
  {
    id: 'policy-library',
    kind: 'standard',
    title: "These are your source-of-truth policies.",
    body:
      "I connect workflows, forms, and evidence back to approved policies so the system stays traceable.",
    route: '/library',
    anchorSelector: '[aria-label="Taxonomy"]',
  },
  {
    id: 'forms',
    kind: 'standard',
    title: "These are your operational forms.",
    body:
      "I help you find, complete, print, and connect forms to the right policy or workflow.",
    route: '/forms',
    anchorSelector: '[aria-label="Taxonomy"]',
  },
  {
    id: 'calendar',
    kind: 'standard',
    title: "This is your regulatory calendar.",
    body:
      "I help you see what is due, blocked, overdue, or ready for action.",
    route: '/calendar',
    anchorSelector: '[aria-label="Compliance Execution (CES)"]',
  },
  {
    id: 'workflows',
    kind: 'standard',
    title: "This is where work becomes structured.",
    body:
      "I organize steps, owners, required forms, approvals, and evidence so compliance is executed, not just documented.",
    route: '/workflows',
    anchorSelector: '[aria-label="Compliance Execution (CES)"]',
  },
  {
    id: 'event-detail',
    kind: 'standard',
    title: 'Open event details to continue workflow execution.',
    body:
      'Use Event Detail to review status, risk, SLA, owner, policies, required forms, and audit context before taking action.',
    route: '/calendar',
    anchorSelector: '[aria-label="Compliance Execution (CES)"]',
  },
  {
    id: 'tasks',
    kind: 'standard',
    title: 'Tasks track owner-level execution.',
    body:
      'Task detail screens show blockers, required forms, required evidence, and the exact next action for completion.',
    route: '/pm/my-tasks',
    anchorSelector: '[aria-label="Task List"]',
  },
  {
    id: 'evidence',
    kind: 'standard',
    title: 'Evidence is linked and traceable.',
    body:
      'Attach artifacts with traceability to event, workflow, task, form, and policy IDs so audit review is evidence-complete.',
    route: '/evidence',
    anchorSelector: '[aria-label="Evidence Center"]',
  },
  {
    id: 'approval',
    kind: 'standard',
    title: 'Approval closes the execution path.',
    body:
      'Approval review validates blockers are resolved before final sign-off, and records approver decisions for audit.',
    route: '/pm/approvals',
    anchorSelector: '[aria-label="Approvals"]',
  },
  {
    id: 'forms-library',
    kind: 'standard',
    title: 'Forms and policies remain linked to execution.',
    body:
      'Every workflow action can be traced back to approved forms and source-of-truth policy content.',
    route: '/forms',
    anchorSelector: '[aria-label="Form Library"]',
  },
  {
    id: 'audit',
    kind: 'standard',
    title: "This is your audit readiness area.",
    body:
      "I help you collect evidence, review findings, prepare packets, and see what still needs correction.",
    route: '/audit',
    anchorSelector: '[aria-label="Compliance Execution (CES)"]',
  },

  // ── 14 decision ─────────────────────────────────────────────
  {
    id: 'basics-decision',
    kind: 'decision',
    title: "We Covered the Basics",
    body:
      "We've gone through the core areas you need first. You can stop here and start using the system, or continue with me for the full walkthrough. You can also skip the tour at any time.",
    showBrad: true,
  },

  // ── 15–16 advanced ──────────────────────────────────────────
  {
    id: 'help-center',
    kind: 'standard',
    title: "This is your built-in help center.",
    body:
      "I keep guidance available so users can understand the system without guessing.",
    route: '/help',
    anchorSelector: '[aria-label="Help Center"]',
  },
  {
    id: 'contextual-tips',
    kind: 'standard',
    title: "Use contextual help anytime.",
    body:
      "When you see the light bulb, I can show the article that matches the page you are on.",
    route: '/help',
    anchorSelector: [
      '[aria-label="Contextual help"]',
      '[aria-label="Help Center"]',
    ],
  },

  // ── 17 final ────────────────────────────────────────────────
  {
    id: 'final',
    kind: 'final',
    title: "You're ready.",
    body:
      "I'll stay available whenever you need help understanding a policy, completing a workflow, finding a form, or preparing for an audit.",
    showBrad: true,
    heroBrad: true,
    route: '/dashboard',
  },
];

/** Index of the basics decision card. */
export const DECISION_INDEX = TOUR_CARDS.findIndex(c => c.kind === 'decision');
/** Index of the final card. */
export const FINAL_INDEX = TOUR_CARDS.findIndex(c => c.kind === 'final');

/**
 * localStorage keys. Per 2026-04-29 spec, completion flags are recorded
 * for telemetry but DO NOT suppress future "Start Guided Tour" offers.
 */
export const TOUR_STORAGE_KEYS = {
  completedBasic: 'tour_completed_basic',
  completedFull: 'tour_completed_full',
  completed: 'tour_completed',
  skipped: 'tour_skipped',
} as const;

/** Window event for restarting the guided tour from any UI affordance. */
export const TOUR_RESTART_EVENT = 'careindeed:tour:restart';
