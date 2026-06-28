/* ═══════════════════════════════════════════════════════════════════════════
   Help Center Threads — Zustand store (client-side, persisted).
   ----------------------------------------------------------------------------
   Single stateful surface for the Threads feature. Holds threads, their
   messages, merge records, and Brad rolling summaries. All non-trivial logic
   (topic keys, PHI detection, duplicate matching, merging) lives in the pure
   sibling modules and is composed here.

   Persisted to localStorage following the repo's autogen/enforcement store
   convention. Never stores PHI: createThread/addMessage run the PHI guard and
   refuse unsafe writes by default.
   ═══════════════════════════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type {
  HelpThread,
  HelpThreadMessage,
  HelpThreadMergeRecord,
  HelpThreadSource,
  HelpThreadType,
  HelpThreadCategory,
  HelpThreadStatus,
  ThreadVisibility,
  ThreadAttachment,
  BradThreadResponseMeta,
  BradThreadSummary,
  ThreadMatchResult,
} from './types';
import { defaultVisibilityForSource } from './types';
import { buildTopicKey, normalizeTitle, extractEntities, errorSignature } from './threadTopicKey';
import { scanForPhi, sanitizePhi, type PhiScanResult } from './threadPhiGuard';
import {
  findThreadMatches,
  bestThreadMatch,
  type ThreadMatchInput,
  type MatchContext,
} from './threadDuplicateMatcher';
import { selectCanonicalThread, mergeThreadInto } from './threadMerge';

/* ── id / time helpers ───────────────────────────────────────────────────── */
function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.round(Math.random() * 1e9).toString(36)}`;
  return `${prefix}-${rand}`;
}
const nowIso = () => new Date().toISOString();

/* ── inputs / results ────────────────────────────────────────────────────── */

export type CreateThreadInput = {
  title: string;
  body: string;
  type: HelpThreadType;
  category: HelpThreadCategory;
  source: HelpThreadSource;
  createdByUserId: string;
  createdByDisplayName?: string;
  tags?: string[];
  visibility?: ThreadVisibility;
  attachments?: ThreadAttachment[];
  /** Optional explicit error signature (e.g. from a guided-tour failure). */
  errorSignature?: string;
};

export type CreateThreadOptions = {
  /** Sanitize PHI then proceed (redacts before saving). */
  sanitize?: boolean;
  /** Save despite PHI (only for admin/secure-routed flows). */
  forceUnsafe?: boolean;
  /** Default true. When false, high-confidence duplicates are NOT auto-merged. */
  allowAutoMerge?: boolean;
  /** User explicitly chose "create separate thread anyway" past a suggestion. */
  confirmCreateDespiteDuplicate?: boolean;
  matchContext?: MatchContext;
};

export type ThreadCreateResult =
  | { ok: false; reason: 'phi'; phi: PhiScanResult }
  | { ok: true; outcome: 'created'; thread: HelpThread }
  | { ok: true; outcome: 'routed_to_existing'; thread: HelpThread }
  | {
      ok: true;
      outcome: 'auto_merged';
      thread: HelpThread; // the canonical thread
      duplicateThreadId: string;
      record: HelpThreadMergeRecord;
    }
  | {
      ok: true;
      outcome: 'suggested';
      suggestion: ThreadMatchResult;
      candidate: HelpThread;
    };

export type AddMessageInput = {
  threadId: string;
  authorType: HelpThreadMessage['authorType'];
  authorUserId?: string;
  authorDisplayName?: string;
  body: string;
  attachments?: ThreadAttachment[];
  bradResponseMeta?: BradThreadResponseMeta;
};

export type AddMessageResult =
  | { ok: false; reason: 'phi'; phi: PhiScanResult }
  | { ok: false; reason: 'not_found' }
  | { ok: true; message: HelpThreadMessage };

export type AddMessageOptions = { sanitize?: boolean; forceUnsafe?: boolean };

/* ── store shape ─────────────────────────────────────────────────────────── */

interface ThreadState {
  threads: HelpThread[];
  messages: HelpThreadMessage[];
  mergeRecords: HelpThreadMergeRecord[];
  summaries: Record<string, BradThreadSummary>;

  // creation / messaging
  createThread: (input: CreateThreadInput, opts?: CreateThreadOptions) => ThreadCreateResult;
  addMessage: (input: AddMessageInput, opts?: AddMessageOptions) => AddMessageResult;

  // votes / publish
  toggleUpvote: (threadId: string, userId: string) => void;
  publishToHelpCenter: (threadId: string) => void;

  // duplicate detection (read-only helper for UI)
  detectDuplicates: (input: ThreadMatchInput, ctx?: MatchContext) => ThreadMatchResult[];

  // merge
  mergeThreads: (
    sourceThreadId: string,
    targetThreadId: string,
    mergedBy: HelpThreadMergeRecord['mergedBy'],
    reason: string,
    confidence?: number,
  ) => HelpThreadMergeRecord | null;
  unmergeThread: (sourceThreadId: string) => boolean;

  // admin / status
  setStatus: (threadId: string, status: HelpThreadStatus) => void;
  acceptAnswer: (threadId: string, messageId: string) => void;
  pinThread: (threadId: string, pinned: boolean) => void;
  archiveThread: (threadId: string) => void;
  hideMessage: (messageId: string, hidden: boolean) => void;
  setDoNotMerge: (threadId: string, value: boolean) => void;

  // Brad organization
  recomputeTopicKey: (threadId: string) => void;
  setSummary: (summary: BradThreadSummary) => void;

  // selectors
  getThread: (threadId: string) => HelpThread | undefined;
  getMessages: (threadId: string) => HelpThreadMessage[];

  reset: () => void;
}

/* ── internal helpers ────────────────────────────────────────────────────── */

function makeThread(input: CreateThreadInput, sanitized: boolean, phiShown: boolean): HelpThread {
  const ts = nowIso();
  const entities = extractEntities(`${input.title}\n${input.body}`);
  const topicKey = buildTopicKey({
    title: input.title,
    body: input.body,
    category: input.category,
    source: input.source,
    errorSignature: input.errorSignature,
  });
  const tags = Array.from(new Set([...(input.tags ?? []), ...entities.tags]));
  return {
    id: newId('ht'),
    title: input.title,
    normalizedTitle: normalizeTitle(input.title),
    topicKey,
    type: input.type,
    status: input.type === 'feature_request' ? 'open' : input.type === 'bug_report' ? 'needs_human_review' : 'open',
    source: input.source,
    category: input.category,
    visibility: input.visibility ?? defaultVisibilityForSource(input.source),
    tags,
    createdByUserId: input.createdByUserId,
    createdByDisplayName: input.createdByDisplayName,
    createdAt: ts,
    updatedAt: ts,
    lastActivityAt: ts,
    messageCount: 1,
    participantCount: 1,
    upvoteCount: 0,
    upvotedByUserIds: [],
    relatedWorkflowIds: entities.workflowIds.length ? entities.workflowIds : undefined,
    relatedFormIds: entities.formIds.length ? entities.formIds : undefined,
    relatedPolicyIds: entities.policyIds.length ? entities.policyIds : undefined,
    containsPhiWarningShown: phiShown || undefined,
    sanitized: sanitized || undefined,
  };
}

function openingMessage(thread: HelpThread, input: CreateThreadInput): HelpThreadMessage {
  return {
    id: newId('htm'),
    threadId: thread.id,
    authorType: 'user',
    authorUserId: input.createdByUserId,
    authorDisplayName: input.createdByDisplayName,
    body: input.body,
    createdAt: thread.createdAt,
    attachments: input.attachments,
    sanitized: thread.sanitized,
    containsPhiWarningShown: thread.containsPhiWarningShown,
  };
}

/* ── store ───────────────────────────────────────────────────────────────── */

export const useThreadStore = create<ThreadState>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: [],
      mergeRecords: [],
      summaries: {},

      createThread: (input, opts = {}) => {
        // 1) PHI guard over title + body.
        const phi = scanForPhi(`${input.title}\n${input.body}`);
        let working = input;
        let sanitized = false;
        let phiShown = false;
        if (phi.hasPhi) {
          phiShown = true;
          if (opts.sanitize) {
            working = {
              ...input,
              title: sanitizePhi(input.title),
              body: sanitizePhi(input.body),
            };
            sanitized = true;
          } else if (!opts.forceUnsafe) {
            return { ok: false, reason: 'phi', phi };
          }
        }

        // 2) Feature requests share ONE canonical discussion thread. Route to it.
        if (working.source.kind === 'feature_request') {
          const frId = working.source.featureRequestId;
          const existing = get().threads.find(
            t =>
              t.source.kind === 'feature_request' &&
              t.source.featureRequestId === frId &&
              !t.canonicalThreadId &&
              t.status !== 'duplicate',
          );
          if (existing) {
            get().addMessage(
              {
                threadId: existing.id,
                authorType: 'user',
                authorUserId: working.createdByUserId,
                authorDisplayName: working.createdByDisplayName,
                body: working.body,
                attachments: working.attachments,
              },
              { sanitize: sanitized, forceUnsafe: opts.forceUnsafe },
            );
            return { ok: true, outcome: 'routed_to_existing', thread: get().getThread(existing.id)! };
          }
        }

        // 3) Duplicate detection.
        const entities = extractEntities(`${working.title} ${working.body}`);
        const errSig =
          working.errorSignature?.trim()
            ? errorSignature(working.errorSignature)
            : entities.errorSignatures[0] || undefined;
        const matchInput: ThreadMatchInput = {
          normalizedTitle: normalizeTitle(working.title),
          topicKey: buildTopicKey({
            title: working.title,
            body: working.body,
            category: working.category,
            source: working.source,
            errorSignature: working.errorSignature,
          }),
          category: working.category,
          source: working.source,
          body: working.body,
          errorSignature: errSig,
          tags: Array.from(new Set([...(working.tags ?? []), ...entities.tags])),
        };
        const best = bestThreadMatch(matchInput, get().threads, opts.matchContext);

        const allowAuto = opts.allowAutoMerge !== false;
        if (best) {
          const candidate = get().getThread(best.candidateThreadId);
          if (candidate) {
            if (best.shouldAutoMerge && allowAuto) {
              // Create the new thread, then merge it into whichever is canonical.
              const created = commitThread(set, working, sanitized, phiShown);
              // Pass the pre-existing candidate first so equal-timestamp ties
              // resolve to the older/existing thread (oldest-wins default).
              const { canonical, duplicate } = selectCanonicalThread(candidate, created);
              const record = get().mergeThreads(
                duplicate.id,
                canonical.id,
                'system',
                `Auto-merge (${best.reason}, conf ${best.confidence}).`,
                best.confidence,
              );
              return {
                ok: true,
                outcome: 'auto_merged',
                thread: get().getThread(canonical.id)!,
                duplicateThreadId: duplicate.id,
                record: record!,
              };
            }
            if (best.shouldSuggestMerge && !opts.confirmCreateDespiteDuplicate) {
              // Medium confidence: suggest, do NOT create yet.
              return { ok: true, outcome: 'suggested', suggestion: best, candidate };
            }
          }
        }

        // 4) No duplicate (or user confirmed separate): create.
        const thread = commitThread(set, working, sanitized, phiShown);
        return { ok: true, outcome: 'created', thread };
      },

      addMessage: (input, opts = {}) => {
        const thread = get().getThread(input.threadId);
        if (!thread) return { ok: false, reason: 'not_found' };

        let body = input.body;
        let sanitized = false;
        let phiShown = false;
        // System + Brad authored content is trusted (Brad never emits PHI by design);
        // user/admin free text is scanned.
        if (input.authorType === 'user' || input.authorType === 'admin') {
          const phi = scanForPhi(input.body);
          if (phi.hasPhi) {
            phiShown = true;
            if (opts.sanitize) {
              body = sanitizePhi(input.body);
              sanitized = true;
            } else if (!opts.forceUnsafe) {
              return { ok: false, reason: 'phi', phi };
            }
          }
        }

        const ts = nowIso();
        const message: HelpThreadMessage = {
          id: newId('htm'),
          threadId: input.threadId,
          authorType: input.authorType,
          authorUserId: input.authorUserId,
          authorDisplayName: input.authorDisplayName,
          body,
          createdAt: ts,
          attachments: input.attachments,
          bradResponseMeta: input.bradResponseMeta,
          sanitized: sanitized || undefined,
          containsPhiWarningShown: phiShown || undefined,
        };

        set(s => {
          const messages = [...s.messages, message];
          const threadMsgs = messages.filter(m => m.threadId === input.threadId);
          const participantIds = new Set<string>();
          for (const m of threadMsgs) {
            if (m.authorUserId && (m.authorType === 'user' || m.authorType === 'admin')) {
              participantIds.add(m.authorUserId);
            }
          }
          const threads = s.threads.map(t =>
            t.id === input.threadId
              ? {
                  ...t,
                  messageCount: threadMsgs.length,
                  participantCount: participantIds.size,
                  updatedAt: ts,
                  lastActivityAt: ts,
                }
              : t,
          );
          return { messages, threads };
        });

        return { ok: true, message };
      },

      toggleUpvote: (threadId, userId) => {
        set(s => ({
          threads: s.threads.map(t => {
            if (t.id !== threadId) return t;
            const has = t.upvotedByUserIds.includes(userId);
            const upvotedByUserIds = has
              ? t.upvotedByUserIds.filter(u => u !== userId)
              : [...t.upvotedByUserIds, userId];
            return {
              ...t,
              upvotedByUserIds,
              upvoteCount: upvotedByUserIds.length,
              userHasUpvoted: !has,
            };
          }),
        }));
      },

      publishToHelpCenter: threadId => {
        set(s => ({
          threads: s.threads.map(t =>
            t.id === threadId && t.visibility === 'private_to_user'
              ? { ...t, visibility: 'all_staff', updatedAt: nowIso() }
              : t,
          ),
        }));
      },

      detectDuplicates: (input, ctx) => findThreadMatches(input, get().threads, ctx),

      mergeThreads: (sourceThreadId, targetThreadId, mergedBy, reason, confidence = 1) => {
        const source = get().getThread(sourceThreadId);
        const target = get().getThread(targetThreadId);
        if (!source || !target || source.id === target.id) return null;

        const outcome = mergeThreadInto({
          duplicate: source,
          canonical: target,
          duplicateMessages: get().getMessages(sourceThreadId),
          canonicalMessages: get().getMessages(targetThreadId),
          mergedBy,
          mergeReason: reason,
          confidence,
          now: nowIso(),
          newId,
        });

        set(s => {
          // Re-point duplicate's messages to canonical; append system + redirect msgs.
          const messages = s.messages.map(m => {
            const moved = outcome.movedMessages.find(mm => mm.id === m.id);
            return moved ?? m;
          });
          messages.push(outcome.systemMessage, outcome.redirectMessage);

          const threads = s.threads.map(t => {
            if (t.id === outcome.canonical.id) return outcome.canonical;
            if (t.id === outcome.stub.id) return outcome.stub;
            return t;
          });

          return {
            messages,
            threads,
            mergeRecords: [outcome.record, ...s.mergeRecords],
          };
        });

        return outcome.record;
      },

      unmergeThread: sourceThreadId => {
        const record = get().mergeRecords.find(r => r.sourceThreadId === sourceThreadId);
        const stub = get().getThread(sourceThreadId);
        if (!record || !stub) return false;

        set(s => {
          // Move the preserved messages back to the source thread.
          const preserved = new Set(record.preservedMessageIds);
          const messages = s.messages
            // drop the system + redirect markers tied to this merge
            .filter(
              m =>
                !(
                  m.authorType === 'system' &&
                  (m.threadId === record.targetCanonicalThreadId || m.threadId === record.sourceThreadId) &&
                  (m.body.startsWith('Merged duplicate thread') || m.body.startsWith('This thread was merged'))
                ),
            )
            .map(m => (preserved.has(m.id) ? { ...m, threadId: record.sourceThreadId } : m));

          const threads = s.threads.map(t => {
            if (t.id === record.sourceThreadId) {
              const { canonicalThreadId: _c, duplicateOfThreadId: _d, ...rest } = t;
              void _c;
              void _d;
              return { ...rest, status: 'open' as HelpThreadStatus, updatedAt: nowIso() };
            }
            if (t.id === record.targetCanonicalThreadId) {
              return {
                ...t,
                mergedThreadIds: (t.mergedThreadIds ?? []).filter(id => id !== record.sourceThreadId),
                updatedAt: nowIso(),
              };
            }
            return t;
          });

          return {
            messages,
            threads,
            mergeRecords: s.mergeRecords.filter(r => r.id !== record.id),
          };
        });
        return true;
      },

      setStatus: (threadId, status) =>
        set(s => ({
          threads: s.threads.map(t => (t.id === threadId ? { ...t, status, updatedAt: nowIso() } : t)),
        })),

      acceptAnswer: (threadId, messageId) =>
        set(s => ({
          threads: s.threads.map(t =>
            t.id === threadId
              ? { ...t, acceptedAnswerMessageId: messageId, status: 'answered', updatedAt: nowIso() }
              : t,
          ),
        })),

      pinThread: (threadId, pinned) =>
        set(s => ({
          threads: s.threads.map(t => (t.id === threadId ? { ...t, adminPinned: pinned, updatedAt: nowIso() } : t)),
        })),

      archiveThread: threadId =>
        set(s => ({
          threads: s.threads.map(t => (t.id === threadId ? { ...t, status: 'archived', updatedAt: nowIso() } : t)),
        })),

      hideMessage: (messageId, hidden) =>
        set(s => ({
          messages: s.messages.map(m => (m.id === messageId ? { ...m, hiddenByAdmin: hidden } : m)),
        })),

      setDoNotMerge: (threadId, value) =>
        set(s => ({
          threads: s.threads.map(t => (t.id === threadId ? { ...t, doNotMerge: value, updatedAt: nowIso() } : t)),
        })),

      recomputeTopicKey: threadId =>
        set(s => ({
          threads: s.threads.map(t => {
            if (t.id !== threadId) return t;
            const first = s.messages.find(m => m.threadId === threadId && m.authorType === 'user');
            return {
              ...t,
              topicKey: buildTopicKey({
                title: t.title,
                body: first?.body,
                category: t.category,
                source: t.source,
              }),
              updatedAt: nowIso(),
            };
          }),
        })),

      setSummary: summary =>
        set(s => ({ summaries: { ...s.summaries, [summary.threadId]: summary } })),

      getThread: threadId => get().threads.find(t => t.id === threadId),
      getMessages: threadId =>
        get()
          .messages.filter(m => m.threadId === threadId)
          .sort((a, b) => (a.createdAt === b.createdAt ? 0 : a.createdAt < b.createdAt ? -1 : 1)),

      reset: () => set({ threads: [], messages: [], mergeRecords: [], summaries: {} }),
    }),
    {
      name: 'help-threads-v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * Commit a brand-new thread + its opening message to the store. Returns the
 * created thread. Extracted so createThread can reuse it on both the plain and
 * auto-merge paths.
 */
function commitThread(
  set: (fn: (s: ThreadState) => Partial<ThreadState>) => void,
  input: CreateThreadInput,
  sanitized: boolean,
  phiShown: boolean,
): HelpThread {
  const thread = makeThread(input, sanitized, phiShown);
  const message = openingMessage(thread, input);
  set(s => ({
    threads: [thread, ...s.threads],
    messages: [...s.messages, message],
  }));
  return thread;
}
