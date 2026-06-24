import type { ComponentType } from 'react';
import {
  Info, Wrench, Globe, Stethoscope, ClipboardList, FileText, CalendarDays,
  RefreshCw, TrendingUp, ShieldCheck, FileSpreadsheet, NotebookPen, GraduationCap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad quick actions — single source of truth for the landing grid + tests.
   ----------------------------------------------------------------------------
   Order is contractual (see acceptance tests):
   • "How Brad works" is ALWAYS first.
   • "Builder" is ONLY present for Super Admin users, ALWAYS at position 2.
   • "Trusted Public Research", "Complete OASIS-E2", "Generate Form 485" follow.

   Each action has a real behavior `kind`:
   • panel    → opens the "How Brad works" interactive panel
   • research → public-research flow (prefill composer + show public research card)
   • navigate → SPA navigation to a real registered route (`to`)
   • action   → invokes a real backend Brad action (`action` key)
   • prefill  → prefills the composer with a scoped request (`prompt`)
   • scoped   → opens an honest "scoped / not-yet-wired" dialog (`scope`) with a
                synthetic-draft prefill — never fabricates completion
   ═══════════════════════════════════════════════════════════════════════════ */

export type QuickActionKind = 'panel' | 'research' | 'navigate' | 'action' | 'prefill' | 'scoped';

export interface QuickAction {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  kind: QuickActionKind;
  /** navigate */ to?: string;
  /** action */ action?: 'report' | 'event-packet' | 'qapi-minutes';
  /** prefill */ prompt?: string;
  /** scoped */ scope?: ScopedActionId;
  superAdminOnly?: boolean;
}

export type ScopedActionId = 'oasis-e2' | 'form-485' | 'pip';

const HOW_BRAD_WORKS: QuickAction = { id: 'how-brad-works', label: 'How Brad works', Icon: Info, kind: 'panel' };

const BUILDER: QuickAction = {
  id: 'builder', label: 'Builder', Icon: Wrench, kind: 'navigate', to: '/brad/builder', superAdminOnly: true,
};

/** The 11 actions that follow "How Brad works" (Builder is injected separately). */
const COMMON_TAIL: QuickAction[] = [
  { id: 'public-research', label: 'Trusted Public Research', Icon: Globe, kind: 'research' },
  { id: 'oasis-e2', label: 'Complete OASIS-E2', Icon: Stethoscope, kind: 'scoped', scope: 'oasis-e2' },
  { id: 'form-485', label: 'Generate Form 485', Icon: ClipboardList, kind: 'scoped', scope: 'form-485' },
  { id: 'report', label: 'Generate report', Icon: FileText, kind: 'action', action: 'report' },
  { id: 'event-packet', label: 'Generate event packet and meeting agenda', Icon: CalendarDays, kind: 'action', action: 'event-packet' },
  { id: 'policy-updates', label: 'Check for policy and procedure updates', Icon: RefreshCw, kind: 'prefill',
    prompt: 'Check for policy and procedure updates: request cited public-source context (CMS, ACHC, federal/state guidance) and validate against our current Care Indeed policies. Do not modify any canonical policy.' },
  { id: 'pip', label: 'Generate PIP', Icon: TrendingUp, kind: 'scoped', scope: 'pip' },
  { id: 'achc-standards', label: 'ACHC Standards', Icon: ShieldCheck, kind: 'navigate', to: '/framework/achc-survey' },
  { id: 'crosswalk', label: 'Cross-Walk Defensibility Report', Icon: FileSpreadsheet, kind: 'navigate', to: '/framework/achc-survey/crosswalk' },
  { id: 'qapi-minutes', label: 'Draft QAPI meeting minutes', Icon: NotebookPen, kind: 'action', action: 'qapi-minutes' },
  { id: 'training-gaps', label: 'Analyze staff training gaps', Icon: GraduationCap, kind: 'prefill',
    prompt: 'Analyze staff training gaps using existing training and onboarding evidence. Do not invent completion data — only use recorded evidence.' },
];

/**
 * Returns the quick actions in their contractual order. Super Admins get
 * "Builder" injected at position 2 (index 1); regular users do not see it.
 */
export function getQuickActions(isSuperAdmin: boolean): QuickAction[] {
  return isSuperAdmin
    ? [HOW_BRAD_WORKS, BUILDER, ...COMMON_TAIL]
    : [HOW_BRAD_WORKS, ...COMMON_TAIL];
}

/** Copy shown by the honest "scoped / not-yet-wired" dialog for MVP-limited actions. */
export const SCOPED_ACTION_COPY: Record<ScopedActionId, { title: string; body: string; draftPrompt: string }> = {
  'oasis-e2': {
    title: 'Complete OASIS-E2',
    body: 'MVP permits SYNTHETIC / TEST DATA ONLY. A full OASIS-E2 assessment workflow is not yet wired to Brad, so Brad cannot mark an assessment complete, locked, signed, or transmitted. You can draft against synthetic data below for review.',
    draftPrompt: 'Draft an OASIS-E2 working response using SYNTHETIC TEST DATA ONLY (no real PHI). Clearly label all output as synthetic and not a completed, signed, or transmitted assessment: ',
  },
  'form-485': {
    title: 'Generate Form 485',
    body: 'MVP uses SYNTHETIC / TEST DATA ONLY and produces a DRAFT. The canonical CMS-485 generator is not yet wired to Brad. Brad will not mark output signed, final, or physician-approved, and will never overwrite an existing signed form.',
    draftPrompt: 'Generate a DRAFT CMS-485 Plan of Care using SYNTHETIC TEST DATA ONLY. Label it: DRAFT — BRAD GENERATED — REQUIRES HUMAN REVIEW AND SIGNATURE. Context: ',
  },
  'pip': {
    title: 'Generate PIP',
    body: 'Brad creates a DRAFT performance improvement plan recommendation only. Activation requires the existing review controls. Brad will not activate or finalize a PIP.',
    draftPrompt: 'Draft a Performance Improvement Plan (PIP) recommendation only (not activated, requires review). Context: ',
  },
};
