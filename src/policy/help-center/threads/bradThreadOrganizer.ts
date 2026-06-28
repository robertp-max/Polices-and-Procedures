/* ═══════════════════════════════════════════════════════════════════════════
   Brad thread organizer (pure).
   ----------------------------------------------------------------------------
   Background/local organization logic Brad runs over threads: recompute topic
   keys, auto-tag, suggest merges, summarize long threads, mark stale threads,
   and surface unanswered high-upvote threads.

   These functions NEVER delete user content — organization is merge / redirect /
   archive only. Everything is pure so it can run client-side or be unit-tested.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { HelpThread, HelpThreadMessage, BradThreadSummary, ThreadMatchResult } from './types';
import { buildTopicKey, extractEntities } from './threadTopicKey';
import { findThreadMatches, type ThreadMatchInput } from './threadDuplicateMatcher';

/** The number of messages above which Brad maintains a rolling summary. */
export const SUMMARY_THRESHOLD = 10;

/** Recompute a thread's topic key from its current title + first user message. */
export function recomputeTopicKey(thread: HelpThread, firstUserBody?: string): string {
  return buildTopicKey({
    title: thread.title,
    body: firstUserBody,
    category: thread.category,
    source: thread.source,
  });
}

/** Auto-tags derived from the thread title + all message bodies. */
export function autoTagThread(thread: HelpThread, messages: HelpThreadMessage[]): string[] {
  const corpus = [thread.title, ...messages.map(m => m.body)].join('\n');
  const entities = extractEntities(corpus);
  return Array.from(new Set([...thread.tags, ...entities.tags])).slice(0, 12);
}

/** Suggest merges for a thread against the rest of the set. */
export function suggestMergesForThread(thread: HelpThread, all: HelpThread[]): ThreadMatchResult[] {
  const input: ThreadMatchInput = {
    normalizedTitle: thread.normalizedTitle,
    topicKey: thread.topicKey,
    category: thread.category,
    source: thread.source,
    tags: thread.tags,
  };
  return findThreadMatches(
    input,
    all.filter(t => t.id !== thread.id),
  );
}

function endsWithQuestion(body: string): boolean {
  return body.trim().endsWith('?');
}

/**
 * Maintain a rolling summary for a long thread. Returns null when the thread is
 * shorter than SUMMARY_THRESHOLD (no summary needed yet).
 */
export function summarizeThread(
  thread: HelpThread,
  messages: HelpThreadMessage[],
  now: string,
): BradThreadSummary | null {
  const visible = messages.filter(m => !m.hiddenByAdmin);
  if (visible.length <= SUMMARY_THRESHOLD) return null;

  const ordered = [...visible].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const userMsgs = ordered.filter(m => m.authorType === 'user');
  const bradMsgs = ordered.filter(m => m.authorType === 'brad');

  const openQuestions = userMsgs
    .filter(m => endsWithQuestion(m.body))
    .map(m => m.body.trim())
    .slice(-5);

  const decisions: string[] = [];
  if (thread.acceptedAnswerMessageId) {
    const accepted = ordered.find(m => m.id === thread.acceptedAnswerMessageId);
    if (accepted) decisions.push(`Accepted answer: ${accepted.body.slice(0, 160)}`);
  }

  const relatedSources = bradMsgs
    .flatMap(m => m.bradResponseMeta?.sourceReferences ?? [])
    .filter((ref, i, arr) => arr.findIndex(r => r.id === ref.id) === i)
    .slice(0, 8);

  const summary =
    `${thread.title} — ${ordered.length} messages from ${thread.participantCount} participant(s). ` +
    `Status: ${thread.status}. ${bradMsgs.length} Brad response(s).`;

  return {
    threadId: thread.id,
    summary,
    openQuestions,
    decisions,
    relatedSources,
    lastSummarizedAt: now,
    summarizedThroughMessageId: ordered[ordered.length - 1].id,
  };
}

/** Ids of threads with no activity for `staleDays` and not yet resolved/closed. */
export function findStaleThreads(threads: HelpThread[], now: number, staleDays = 30): string[] {
  const cutoff = now - staleDays * 24 * 60 * 60 * 1000;
  return threads
    .filter(t => !['resolved', 'closed', 'archived', 'duplicate'].includes(t.status))
    .filter(t => {
      const last = Date.parse(t.lastActivityAt);
      return !Number.isNaN(last) && last < cutoff;
    })
    .map(t => t.id);
}

/** Unanswered threads ordered by upvotes (for a "needs attention" surface). */
export function surfaceUnansweredHighUpvote(threads: HelpThread[], minUpvotes = 1): HelpThread[] {
  const unanswered: HelpThread['status'][] = ['open', 'needs_brad', 'needs_human_review', 'in_progress'];
  return threads
    .filter(t => unanswered.includes(t.status) && !t.canonicalThreadId)
    .filter(t => t.upvoteCount >= minUpvotes)
    .sort((a, b) => b.upvoteCount - a.upvoteCount);
}
