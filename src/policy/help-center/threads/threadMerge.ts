/* ═══════════════════════════════════════════════════════════════════════════
   Thread merge — canonical selection + non-destructive merge.
   ----------------------------------------------------------------------------
   Merging is NEVER destructive. When a duplicate thread is merged into a
   canonical one we:
     - move every message into the canonical thread in chronological order,
       preserving authors, timestamps, Brad responses, references, attachments;
     - preserve votes without double-counting the same user;
     - merge related-entity links and admin decisions;
     - post a system message in the canonical thread;
     - leave a redirect stub on the duplicate thread (status 'duplicate');
     - emit an auditable HelpThreadMergeRecord.

   Everything here is PURE: callers pass in the messages + id/now factories, and
   get back the new objects to persist. No store/clock/randomness inside.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  HelpThread,
  HelpThreadMessage,
  HelpThreadMergeRecord,
  HelpThreadSource,
} from './types';

/** Human-readable origin label for messages moved out of a duplicate thread. */
export function originLabelForSource(source: HelpThreadSource): string {
  switch (source.kind) {
    case 'feature_request': return 'Feature Request';
    case 'brad_response': return 'Brad Response';
    case 'help_article': return 'Help Article';
    case 'guided_tour': return 'Guided Tour';
    case 'workflow': return 'Workflow Help';
    case 'form': return 'Form Help';
    case 'event': return 'Event Help';
    case 'general':
    default:
      return 'General Thread';
  }
}

/** Priority tier for canonical selection (higher wins; ties → oldest createdAt). */
function canonicalTier(t: HelpThread): number {
  if (t.curated) return 4;
  if (t.source.kind === 'feature_request') return 3;
  if (t.acceptedAnswerMessageId) return 2;
  if (t.adminPinned) return 1;
  return 0;
}

/**
 * Decide which of two threads is canonical. Rules (spec):
 *   curated/system > feature-request > accepted-answer > admin-pinned,
 *   then oldest createdAt wins by default.
 */
export function selectCanonicalThread(
  a: HelpThread,
  b: HelpThread,
): { canonical: HelpThread; duplicate: HelpThread } {
  const ta = canonicalTier(a);
  const tb = canonicalTier(b);
  if (ta !== tb) {
    return ta > tb ? { canonical: a, duplicate: b } : { canonical: b, duplicate: a };
  }
  // Same tier → oldest wins.
  const aOlder = a.createdAt <= b.createdAt;
  return aOlder ? { canonical: a, duplicate: b } : { canonical: b, duplicate: a };
}

export type MergeParams = {
  /** The thread being absorbed (becomes a redirect stub). */
  duplicate: HelpThread;
  /** The surviving canonical thread. */
  canonical: HelpThread;
  duplicateMessages: HelpThreadMessage[];
  canonicalMessages: HelpThreadMessage[];
  mergedBy: HelpThreadMergeRecord['mergedBy'];
  mergeReason: string;
  confidence: number;
  now: string;
  newId: (prefix: string) => string;
};

export type MergeOutcome = {
  /** Updated canonical thread (counts, votes, links, lastActivity). */
  canonical: HelpThread;
  /** The duplicate thread, converted to a redirect stub. */
  stub: HelpThread;
  /** Duplicate's messages, re-pointed to the canonical thread + origin-labelled. */
  movedMessages: HelpThreadMessage[];
  /** System "merged" message posted in the canonical thread. */
  systemMessage: HelpThreadMessage;
  /** Redirect stub message posted on the duplicate thread. */
  redirectMessage: HelpThreadMessage;
  /** Full chronological message list for the canonical thread post-merge. */
  canonicalMessages: HelpThreadMessage[];
  record: HelpThreadMergeRecord;
};

function uniqUnion(a: string[] = [], b: string[] = []): string[] {
  return Array.from(new Set([...a, ...b]));
}

function mergeRelated(
  target: string[] | undefined,
  source: string[] | undefined,
): string[] | undefined {
  if (!target && !source) return undefined;
  return uniqUnion(target ?? [], source ?? []);
}

function distinctParticipants(messages: HelpThreadMessage[]): number {
  const ids = new Set<string>();
  for (const m of messages) {
    if (m.authorUserId && (m.authorType === 'user' || m.authorType === 'admin')) {
      ids.add(m.authorUserId);
    }
  }
  return ids.size;
}

/** Perform a non-destructive merge of `duplicate` into `canonical`. Pure. */
export function mergeThreadInto(params: MergeParams): MergeOutcome {
  const {
    duplicate,
    canonical,
    duplicateMessages,
    canonicalMessages,
    mergedBy,
    mergeReason,
    confidence,
    now,
    newId,
  } = params;

  const originLabel = originLabelForSource(duplicate.source);

  // Move duplicate's messages into the canonical thread, preserving everything.
  const movedMessages: HelpThreadMessage[] = duplicateMessages.map(m => ({
    ...m,
    threadId: canonical.id,
    // Keep the first-seen origin label; nested merges shouldn't overwrite it.
    originLabel: m.originLabel ?? `Originally posted from: ${originLabel}.`,
  }));

  // System message announcing the merge, posted in the canonical thread.
  const systemMessage: HelpThreadMessage = {
    id: newId('htm'),
    threadId: canonical.id,
    authorType: 'system',
    body: `Merged duplicate thread "${duplicate.title}" into this thread.`,
    createdAt: now,
  };

  // Redirect stub left on the (now duplicate) thread.
  const redirectMessage: HelpThreadMessage = {
    id: newId('htm'),
    threadId: duplicate.id,
    authorType: 'system',
    body: `This thread was merged into "${canonical.title}".`,
    createdAt: now,
  };

  // Combined canonical messages in chronological order (stable on ties).
  const combined = [...canonicalMessages, ...movedMessages, systemMessage]
    .map((m, i) => ({ m, i }))
    .sort((x, y) => (x.m.createdAt === y.m.createdAt ? x.i - y.i : x.m.createdAt < y.m.createdAt ? -1 : 1))
    .map(({ m }) => m);

  // Votes: union of upvoter ids — same user never double-counted.
  const upvotedByUserIds = uniqUnion(canonical.upvotedByUserIds, duplicate.upvotedByUserIds);

  const updatedCanonical: HelpThread = {
    ...canonical,
    upvotedByUserIds,
    upvoteCount: upvotedByUserIds.length,
    messageCount: combined.length,
    participantCount: distinctParticipants(combined),
    mergedThreadIds: uniqUnion(canonical.mergedThreadIds, [duplicate.id]),
    relatedPolicyIds: mergeRelated(canonical.relatedPolicyIds, duplicate.relatedPolicyIds),
    relatedWorkflowIds: mergeRelated(canonical.relatedWorkflowIds, duplicate.relatedWorkflowIds),
    relatedFormIds: mergeRelated(canonical.relatedFormIds, duplicate.relatedFormIds),
    relatedEventIds: mergeRelated(canonical.relatedEventIds, duplicate.relatedEventIds),
    relatedHelpArticleIds: mergeRelated(canonical.relatedHelpArticleIds, duplicate.relatedHelpArticleIds),
    relatedFeatureRequestIds: mergeRelated(
      canonical.relatedFeatureRequestIds,
      duplicate.relatedFeatureRequestIds,
    ),
    tags: uniqUnion(canonical.tags, duplicate.tags),
    updatedAt: now,
    lastActivityAt: now,
  };

  const stub: HelpThread = {
    ...duplicate,
    status: 'duplicate',
    canonicalThreadId: canonical.id,
    duplicateOfThreadId: canonical.id,
    updatedAt: now,
    lastActivityAt: now,
  };

  const record: HelpThreadMergeRecord = {
    id: newId('htmr'),
    sourceThreadId: duplicate.id,
    targetCanonicalThreadId: canonical.id,
    mergedBy,
    mergeReason,
    confidence,
    createdAt: now,
    preservedMessageIds: duplicateMessages.map(m => m.id),
    redirectStubCreated: true,
  };

  return {
    canonical: updatedCanonical,
    stub,
    movedMessages,
    systemMessage,
    redirectMessage,
    canonicalMessages: combined,
    record,
  };
}
