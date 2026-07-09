import type { RetiredArticleEntry } from '../types';

const LEGACY = 'src/policy/data/helpArticles.ts';
const VISUAL = 'src/policy/data/visualHelpArticles.ts';

// Retirement register for the pre-command-center Help Center content.
// Files stay on disk: HELP_ARTICLES still feeds Brad app context
// (bradAppContext.ts / bradReferenceResolver.ts — Brad code untouched) and the
// Event Workspace help tab. The Help Center simply stops rendering these as
// active articles; requests for a retired slug/id resolve to the replacement.
export const RETIRED_ARTICLES: RetiredArticleEntry[] = [
  // --- Legacy HELP_ARTICLES ------------------------------------------------
  { oldArticleId: 'BRAD-HOW-BRAD-WORKS', oldPath: LEGACY, reasonRetired: 'Superseded by canonical Brad manuals', replacedByArticleId: 'HC-BRAD-OVERVIEW', replacementCategory: 'brad-ai' },
  { oldArticleId: 'KB-QAPI-001', oldPath: LEGACY, reasonRetired: 'Meeting operating guide folded into QAPI overview + Studio packet manuals', replacedByArticleId: 'HC-QAPI-OVERVIEW', replacementCategory: 'qapi-reports' },
  { oldArticleId: 'KB-GV-001', oldPath: LEGACY, reasonRetired: 'Governing body packet work now documented via Evidence Studio manual', replacedByArticleId: 'HC-EVID-PACKET-STUDIO', replacementCategory: 'evidence-center' },
  { oldArticleId: 'KB-CO-001', oldPath: LEGACY, reasonRetired: 'Quarterly compliance report prep covered by CES reports manual', replacedByArticleId: 'HC-QAPI-CES-REPORTS', replacementCategory: 'qapi-reports' },
  { oldArticleId: 'KB-RM-001', oldPath: LEGACY, reasonRetired: 'Committee review guidance folded into QAPI overview', replacedByArticleId: 'HC-QAPI-OVERVIEW', replacementCategory: 'qapi-reports' },
  { oldArticleId: 'KB-FN-001', oldPath: LEGACY, reasonRetired: 'Billing workflow has no user-facing surface in the current app', notes: 'Kept on disk for Brad/event-workspace context only; regenerate when a billing surface ships.' },
  { oldArticleId: 'KB-FN-002', oldPath: LEGACY, reasonRetired: 'Billing hold review has no user-facing surface in the current app', notes: 'Kept on disk for Brad/event-workspace context only.' },
  { oldArticleId: 'KB-CL-001', oldPath: LEGACY, reasonRetired: 'Signature follow-up covered by signature status tracking manual', replacedByArticleId: 'HC-ECIGN-STATUS', replacementCategory: 'ecign-signatures' },
  { oldArticleId: 'KB-GV-002', oldPath: LEGACY, reasonRetired: 'Policy review cycle is leadership workflow; end-user side covered by policies overview', replacedByArticleId: 'HC-POL-OVERVIEW', replacementCategory: 'policies' },
  { oldArticleId: 'KB-IS-001', oldPath: LEGACY, reasonRetired: 'Information security review is admin governance material', replacedByArticleId: 'HC-ADMIN-OVERVIEW', replacementCategory: 'admin-settings' },
  { oldArticleId: 'KB-OP-001', oldPath: LEGACY, reasonRetired: 'Emergency preparedness review has no dedicated app surface', notes: 'Kept for Brad/event-workspace context; regenerate when a surface ships.' },
  { oldArticleId: 'KB-GCAL-001', oldPath: LEGACY, reasonRetired: 'Calendar work covered by CES calendar manual; Google integration behavior needs confirmation', replacedByArticleId: 'HC-CES-CALENDAR', replacementCategory: 'ces-events' },
  { oldArticleId: 'KB-GCAL-002', oldPath: LEGACY, reasonRetired: 'Sync troubleshooting folded into troubleshooting library', replacedByArticleId: 'HC-TS-OVERVIEW', replacementCategory: 'troubleshooting' },
  { oldArticleId: 'KB-EXEC-001', oldPath: LEGACY, reasonRetired: 'Gates/locks explained in CES overview', replacedByArticleId: 'HC-CES-OVERVIEW', replacementCategory: 'ces-events' },
  { oldArticleId: 'KB-EXEC-002', oldPath: LEGACY, reasonRetired: 'Regulatory calendar auto-generation covered by CES calendar manual', replacedByArticleId: 'HC-CES-CALENDAR', replacementCategory: 'ces-events' },
  { oldArticleId: 'KB-EXEC-003', oldPath: LEGACY, reasonRetired: 'Audit mode has a dedicated canonical manual', replacedByArticleId: 'HC-AUDIT-MODE', replacementCategory: 'audit-survey' },
  { oldArticleId: 'COMMUNITY-HOW-TO-USE', oldPath: LEGACY, reasonRetired: 'Superseded by community overview', replacedByArticleId: 'HC-COM-OVERVIEW', replacementCategory: 'community' },
  { oldArticleId: 'THREADS-HOW-TO-USE', oldPath: LEGACY, reasonRetired: 'Superseded by threads overview', replacedByArticleId: 'HC-THR-OVERVIEW', replacementCategory: 'threads-discussions' },
  { oldArticleId: 'PROFILE-VISIBILITY', oldPath: LEGACY, reasonRetired: 'Superseded by profile management manual', replacedByArticleId: 'HC-COM-PROFILE', replacementCategory: 'community' },
  { oldArticleId: 'THREADS-PUBLIC-INTERNALLY', oldPath: LEGACY, reasonRetired: 'Visibility explanation folded into threads overview', replacedByArticleId: 'HC-THR-OVERVIEW', replacementCategory: 'threads-discussions' },
  { oldArticleId: 'NO-PHI-COMMUNITY-THREADS', oldPath: LEGACY, reasonRetired: 'No-PHI rule embedded in every community/thread article safety note', replacedByArticleId: 'HC-COM-OVERVIEW', replacementCategory: 'community' },
  { oldArticleId: 'JOURNEY-ACHIEVEMENTS-PROFILE', oldPath: LEGACY, reasonRetired: 'Achievements covered by profile manual', replacedByArticleId: 'HC-COM-PROFILE', replacementCategory: 'community' },
  { oldArticleId: 'STAFF-COMMENDATIONS-BADGES', oldPath: LEGACY, reasonRetired: 'Commendations covered by community participation manual', replacedByArticleId: 'HC-COM-PARTICIPATE', replacementCategory: 'community' },

  // --- VisualHelpArticles (v1 visual system) --------------------------------
  { oldArticleId: 'CES-EVIDENCE-PACKET', oldPath: VISUAL, reasonRetired: 'Migrated into canonical Studio manual', replacedByArticleId: 'HC-EVID-PACKET-STUDIO', replacementCategory: 'evidence-center' },
  { oldArticleId: 'EVIDENCE-UPLOAD', oldPath: VISUAL, reasonRetired: 'Migrated into canonical intake manual', replacedByArticleId: 'HC-EVID-UPLOAD', replacementCategory: 'evidence-center' },
  { oldArticleId: 'GETTING-STARTED-BASICS', oldPath: VISUAL, reasonRetired: 'Migrated into canonical getting-started set', replacedByArticleId: 'HC-GS-OVERVIEW', replacementCategory: 'getting-started' },
  { oldArticleId: 'FORMS-FIND-AND-FILL', oldPath: VISUAL, reasonRetired: 'Split into find/fill/print canonical manuals', replacedByArticleId: 'HC-FORMS-LIBRARY', replacementCategory: 'forms' },
  { oldArticleId: 'POLICIES-SEARCH-CITE', oldPath: VISUAL, reasonRetired: 'Split into search/read/print canonical manuals', replacedByArticleId: 'HC-POL-LIBRARY', replacementCategory: 'policies' },
  { oldArticleId: 'QAPI-DASH-AND-PACKETS', oldPath: VISUAL, reasonRetired: 'Migrated into QAPI overview + reports manuals', replacedByArticleId: 'HC-QAPI-OVERVIEW', replacementCategory: 'qapi-reports' },
  { oldArticleId: 'ADMISSION-PACKET-FLOW', oldPath: VISUAL, reasonRetired: 'Migrated into admission packet build manual', replacedByArticleId: 'HC-ADM-BUILD', replacementCategory: 'admission-packets' },
  { oldArticleId: 'ONBOARDING-JOURNEY', oldPath: VISUAL, reasonRetired: 'Migrated into Journey canonical set', replacedByArticleId: 'HC-JRN-OVERVIEW', replacementCategory: 'onboarding-journey' },
  { oldArticleId: 'TROUBLESHOOTING-COMMON', oldPath: VISUAL, reasonRetired: 'Split into per-failure-mode troubleshooting manuals', replacedByArticleId: 'HC-TS-OVERVIEW', replacementCategory: 'troubleshooting' },
];

/** Slug/id → replacement lookup used by the retired-article redirect handling. */
export function findRetirementByOldId(oldIdOrSlug: string): RetiredArticleEntry | undefined {
  const needle = oldIdOrSlug.toUpperCase();
  return RETIRED_ARTICLES.find((r) => r.oldArticleId === needle);
}
