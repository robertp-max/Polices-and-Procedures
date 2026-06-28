/* ═══════════════════════════════════════════════════════════════════════════
   Presentation helpers for the Threads UI.
   ----------------------------------------------------------------------------
   Pure label maps + visibility/filter/sort functions. Kept free of React so the
   list logic is unit-testable and the components stay thin.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  HelpThread,
  HelpThreadStatus,
  HelpThreadCategory,
  HelpThreadSource,
} from './types';

export const THREAD_STATUS_LABEL: Record<HelpThreadStatus, string> = {
  open: 'Open',
  answered: 'Answered',
  needs_brad: 'Needs Brad',
  needs_human_review: 'Needs human review',
  planned: 'Planned',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
  duplicate: 'Duplicate',
  archived: 'Archived',
};

/** Tone keyword used to pick a status color class (see statusToneClass). */
export function statusToneClass(status: HelpThreadStatus): string {
  switch (status) {
    case 'answered':
    case 'resolved':
      return 'text-tone-green-text';
    case 'needs_human_review':
    case 'needs_brad':
      return 'text-tone-amber-text';
    case 'duplicate':
    case 'archived':
    case 'closed':
      return 'text-muted';
    default:
      return 'text-brand-teal';
  }
}

export const THREAD_CATEGORY_LABEL: Record<HelpThreadCategory, string> = {
  brad_ai: 'Brad AI',
  guided_tours: 'Guided Tours',
  help_center: 'Help Center',
  feature_requests: 'Feature Requests',
  evidence_center: 'Evidence Center',
  ecign: 'eCIgn',
  ces_events: 'CES & Events',
  qapi_packets: 'QAPI Packets',
  admission_packets: 'Admission Packets',
  forms: 'Forms',
  policy_library: 'Policy Library',
  onboarding_journey: 'Onboarding / Journey',
  reports_dashboards: 'Reports & Dashboards',
  ui_accessibility: 'UI / Accessibility',
  performance: 'Performance',
  bug: 'Bug',
  other: 'Other',
};

export function sourceKindLabel(source: HelpThreadSource): string {
  switch (source.kind) {
    case 'help_article': return 'Help article';
    case 'feature_request': return 'Feature request';
    case 'brad_response': return 'Brad response';
    case 'guided_tour': return 'Guided tour';
    case 'workflow': return 'Workflow';
    case 'form': return 'Form';
    case 'event': return 'Event';
    case 'general':
    default:
      return 'General';
  }
}

/** Compact relative time. Accepts an explicit `now` for deterministic tests. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const sec = Math.max(0, Math.round((now - then) / 1000));
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mon = Math.round(day / 30);
  if (mon < 12) return `${mon}mo ago`;
  return `${Math.round(mon / 12)}y ago`;
}

/* ── visibility / filter / sort ────────────────────────────────────────────── */

export type ThreadListFilter =
  | 'all'
  | 'mine'
  | 'unanswered'
  | 'answered'
  | 'needs_brad'
  | 'needs_human_review'
  | 'feature_requests'
  | 'guided_tours'
  | 'brad_responses'
  | 'bugs'
  | 'duplicates';

export type ThreadListSort =
  | 'newest'
  | 'recent'
  | 'most_upvoted'
  | 'unanswered_first'
  | 'needs_human_review'
  | 'resolved';

export const THREAD_FILTERS: { id: ThreadListFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My threads' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'answered', label: 'Answered' },
  { id: 'needs_brad', label: 'Needs Brad' },
  { id: 'needs_human_review', label: 'Needs human review' },
  { id: 'feature_requests', label: 'Feature requests' },
  { id: 'guided_tours', label: 'Guided tours' },
  { id: 'brad_responses', label: 'Brad responses' },
  { id: 'bugs', label: 'Bugs' },
  { id: 'duplicates', label: 'Duplicates' },
];

export const THREAD_SORTS: { id: ThreadListSort; label: string }[] = [
  { id: 'recent', label: 'Recently active' },
  { id: 'newest', label: 'Newest' },
  { id: 'most_upvoted', label: 'Most upvoted' },
  { id: 'unanswered_first', label: 'Unanswered first' },
  { id: 'needs_human_review', label: 'Needs human review' },
  { id: 'resolved', label: 'Resolved' },
];

/** True when `userId` (optionally admin) may see `t`. Mirrors matcher access. */
export function canViewThread(t: HelpThread, userId: string, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  switch (t.visibility) {
    case 'private_to_user':
      return t.createdByUserId === userId;
    case 'admin_only':
    case 'hidden':
      return false;
    case 'all_staff':
    case 'team':
    case 'role_restricted':
    default:
      return true;
  }
}

const UNANSWERED_STATUSES: HelpThreadStatus[] = ['open', 'needs_brad', 'needs_human_review', 'in_progress'];

export function matchesFilter(t: HelpThread, filter: ThreadListFilter, userId: string): boolean {
  switch (filter) {
    case 'all': return true;
    case 'mine': return t.createdByUserId === userId;
    case 'unanswered': return UNANSWERED_STATUSES.includes(t.status);
    case 'answered': return t.status === 'answered' || t.status === 'resolved';
    case 'needs_brad': return t.status === 'needs_brad';
    case 'needs_human_review': return t.status === 'needs_human_review';
    case 'feature_requests': return t.type === 'feature_request';
    case 'guided_tours': return t.type === 'guided_tour';
    case 'brad_responses': return t.type === 'brad_response';
    case 'bugs': return t.type === 'bug_report' || t.category === 'bug';
    case 'duplicates': return t.status === 'duplicate' || Boolean(t.canonicalThreadId);
    default: return true;
  }
}

export function matchesSearch(t: HelpThread, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    t.title.toLowerCase().includes(q) ||
    t.normalizedTitle.includes(q) ||
    t.topicKey.includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

function isUnanswered(t: HelpThread): boolean {
  return UNANSWERED_STATUSES.includes(t.status);
}

export function sortThreads(threads: HelpThread[], sort: ThreadListSort): HelpThread[] {
  const out = [...threads];
  const byNewest = (a: HelpThread, b: HelpThread) => (a.createdAt < b.createdAt ? 1 : -1);
  const byRecent = (a: HelpThread, b: HelpThread) => (a.lastActivityAt < b.lastActivityAt ? 1 : -1);
  switch (sort) {
    case 'newest':
      out.sort(byNewest);
      break;
    case 'most_upvoted':
      out.sort((a, b) => b.upvoteCount - a.upvoteCount || (byRecent(a, b)));
      break;
    case 'unanswered_first':
      out.sort((a, b) => Number(isUnanswered(b)) - Number(isUnanswered(a)) || byRecent(a, b));
      break;
    case 'needs_human_review':
      out.sort(
        (a, b) =>
          Number(b.status === 'needs_human_review') - Number(a.status === 'needs_human_review') ||
          byRecent(a, b),
      );
      break;
    case 'resolved':
      out.sort(
        (a, b) =>
          Number(b.status === 'resolved' || b.status === 'answered') -
            Number(a.status === 'resolved' || a.status === 'answered') || byRecent(a, b),
      );
      break;
    case 'recent':
    default:
      out.sort(byRecent);
  }
  // Admin-pinned threads always float to the top.
  out.sort((a, b) => Number(Boolean(b.adminPinned)) - Number(Boolean(a.adminPinned)));
  return out;
}

export type ThreadListQuery = {
  filter: ThreadListFilter;
  sort: ThreadListSort;
  search: string;
  userId: string;
  isAdmin: boolean;
  /** When false (default), merged duplicate stubs are hidden unless explicitly filtered. */
  includeDuplicates?: boolean;
};

/** Apply visibility + filter + search + sort in one pass. */
export function buildThreadList(threads: HelpThread[], q: ThreadListQuery): HelpThread[] {
  const filtered = threads.filter(t => {
    if (!canViewThread(t, q.userId, q.isAdmin)) return false;
    if (t.status === 'duplicate' && q.filter !== 'duplicates' && !q.includeDuplicates) return false;
    if (t.status === 'archived' && q.filter !== 'all') return false;
    if (!matchesFilter(t, q.filter, q.userId)) return false;
    if (!matchesSearch(t, q.search)) return false;
    return true;
  });
  return sortThreads(filtered, q.sort);
}
