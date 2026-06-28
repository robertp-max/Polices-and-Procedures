import { describe, it, expect } from 'vitest';
import type { HelpThread, HelpThreadMessage } from './types';
import { selectCanonicalThread, mergeThreadInto } from './threadMerge';

let seq = 0;
const newId = (p: string) => `${p}-${++seq}`;

function thread(over: Partial<HelpThread>): HelpThread {
  return {
    id: over.id ?? newId('ht'),
    title: 'A thread',
    normalizedTitle: 'a thread',
    topicKey: 'general.a-thread',
    type: 'general_question',
    status: 'open',
    source: { kind: 'general' },
    category: 'other',
    visibility: 'all_staff',
    tags: [],
    createdByUserId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastActivityAt: '2026-01-01T00:00:00.000Z',
    messageCount: 1,
    participantCount: 1,
    upvoteCount: 0,
    upvotedByUserIds: [],
    ...over,
  };
}

function msg(over: Partial<HelpThreadMessage> & { threadId: string }): HelpThreadMessage {
  return {
    id: over.id ?? newId('htm'),
    authorType: 'user',
    body: 'hello',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

describe('selectCanonicalThread (spec test #10 — oldest wins unless override)', () => {
  it('oldest createdAt wins by default', () => {
    const older = thread({ id: 'old', createdAt: '2026-01-01T00:00:00.000Z' });
    const newer = thread({ id: 'new', createdAt: '2026-02-01T00:00:00.000Z' });
    expect(selectCanonicalThread(newer, older).canonical.id).toBe('old');
  });

  it('admin-pinned beats a plain older thread', () => {
    const older = thread({ id: 'old', createdAt: '2026-01-01T00:00:00.000Z' });
    const pinned = thread({ id: 'pin', createdAt: '2026-03-01T00:00:00.000Z', adminPinned: true });
    expect(selectCanonicalThread(older, pinned).canonical.id).toBe('pin');
  });

  it('feature-request thread beats an admin-pinned thread', () => {
    const pinned = thread({ id: 'pin', adminPinned: true, createdAt: '2026-01-01T00:00:00.000Z' });
    const fr = thread({
      id: 'fr',
      createdAt: '2026-05-01T00:00:00.000Z',
      source: { kind: 'feature_request', featureRequestId: 'FR-1', title: 'x' },
    });
    expect(selectCanonicalThread(pinned, fr).canonical.id).toBe('fr');
  });

  it('curated/system thread beats everything else', () => {
    const fr = thread({
      id: 'fr',
      source: { kind: 'feature_request', featureRequestId: 'FR-1', title: 'x' },
    });
    const curated = thread({ id: 'cur', curated: true, createdAt: '2026-09-01T00:00:00.000Z' });
    expect(selectCanonicalThread(fr, curated).canonical.id).toBe('cur');
  });
});

describe('mergeThreadInto (spec tests #11, #12, #13)', () => {
  const canonical = thread({
    id: 'canon',
    title: 'Canonical',
    upvotedByUserIds: ['u1', 'u2'],
    upvoteCount: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  });
  const duplicate = thread({
    id: 'dup',
    title: 'Duplicate',
    source: { kind: 'brad_response', bradResponseId: 'r1' },
    upvotedByUserIds: ['u2', 'u3'], // u2 overlaps
    upvoteCount: 2,
    createdAt: '2026-02-01T00:00:00.000Z',
  });

  const canonicalMessages = [
    msg({ threadId: 'canon', id: 'c1', createdAt: '2026-01-01T00:00:00.000Z', authorUserId: 'u1' }),
  ];
  const duplicateMessages = [
    msg({
      threadId: 'dup',
      id: 'd1',
      createdAt: '2026-02-01T00:00:00.000Z',
      authorUserId: 'u3',
      attachments: [{ id: 'a1', name: 'log.txt', kind: 'log' }],
    }),
    msg({
      threadId: 'dup',
      id: 'd2',
      createdAt: '2026-02-02T00:00:00.000Z',
      authorType: 'brad',
      body: 'Brad answer',
      bradResponseMeta: {
        responseId: 'br1',
        sourceReferences: [{ id: 's1', sourceType: 'policy', sourceId: 'P1', title: 'Policy 1' }],
        confidence: 'high',
      },
    }),
  ];

  const out = mergeThreadInto({
    duplicate,
    canonical,
    duplicateMessages,
    canonicalMessages,
    mergedBy: 'system',
    mergeReason: 'test',
    confidence: 0.95,
    now: '2026-03-01T00:00:00.000Z',
    newId,
  });

  it('#11 preserves all messages with authors/timestamps/brad responses/attachments', () => {
    const ids = out.canonicalMessages.map(m => m.id);
    expect(ids).toContain('c1');
    expect(ids).toContain('d1');
    expect(ids).toContain('d2');
    const moved = out.canonicalMessages.find(m => m.id === 'd2')!;
    expect(moved.bradResponseMeta?.sourceReferences[0].sourceId).toBe('P1');
    expect(moved.threadId).toBe('canon');
    const withAttach = out.canonicalMessages.find(m => m.id === 'd1')!;
    expect(withAttach.attachments?.[0].name).toBe('log.txt');
    // origin label preserved
    expect(withAttach.originLabel).toContain('Brad Response');
  });

  it('#11 messages land in chronological order', () => {
    const times = out.canonicalMessages.map(m => m.createdAt);
    const sorted = [...times].sort();
    expect(times).toEqual(sorted);
  });

  it('#12 creates a redirect stub on the duplicate', () => {
    expect(out.stub.status).toBe('duplicate');
    expect(out.stub.canonicalThreadId).toBe('canon');
    expect(out.redirectMessage.body).toContain('merged into');
    expect(out.record.redirectStubCreated).toBe(true);
    // system message posted in canonical
    expect(out.systemMessage.body).toContain('Merged duplicate thread');
  });

  it('#13 votes from the same user are not double-counted', () => {
    // u1 (canon) + u2 (both) + u3 (dup) = 3 distinct
    expect(out.canonical.upvoteCount).toBe(3);
    expect(out.canonical.upvotedByUserIds.sort()).toEqual(['u1', 'u2', 'u3']);
  });

  it('records preserved message ids and links the merged thread', () => {
    expect(out.record.preservedMessageIds).toEqual(['d1', 'd2']);
    expect(out.canonical.mergedThreadIds).toContain('dup');
  });
});
