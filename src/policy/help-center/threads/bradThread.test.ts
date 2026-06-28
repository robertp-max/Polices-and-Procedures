import { describe, it, expect } from 'vitest';
import type { HelpThread, HelpThreadMessage, ThreadSourceReference } from './types';
import { composeThreadAnswer, NO_VERIFIED_SOURCE, BRAD_LIMITATIONS } from './bradThreadResponder';
import { autoTagThread, summarizeThread, findStaleThreads, surfaceUnansweredHighUpvote } from './bradThreadOrganizer';

const src = (id: string): ThreadSourceReference => ({
  id,
  sourceType: 'policy',
  sourceId: id,
  title: `Policy ${id}`,
});

describe('composeThreadAnswer (spec tests #14, #15, #16)', () => {
  it('#14 answers with citations when verified sources exist', () => {
    const r = composeThreadAnswer({
      responseId: 'r1',
      question: 'Where do I find the evidence upload steps?',
      candidateSources: [src('P1'), src('P2')],
    });
    expect(r.status).toBe('answered');
    expect(r.meta.sourceReferences).toHaveLength(2);
    expect(r.meta.confidence).toBe('high');
    expect(r.meta.limitations).toEqual(BRAD_LIMITATIONS);
  });

  it('#15 never fabricates a citation when no source is found', () => {
    const r = composeThreadAnswer({
      responseId: 'r2',
      question: 'How do I do something undocumented?',
      candidateSources: [],
    });
    expect(r.body).toContain(NO_VERIFIED_SOURCE);
    expect(r.meta.sourceReferences).toHaveLength(0);
    expect(r.status).toBe('needs_human_review');
  });

  it('#16 marks needs_human_review for compliance/legal/approval questions even with sources', () => {
    const r = composeThreadAnswer({
      responseId: 'r3',
      question: 'Can Brad approve and sign this compliance certification?',
      candidateSources: [src('P1')],
    });
    expect(r.status).toBe('needs_human_review');
    expect(r.meta.confidence).toBe('medium');
  });

  it('#16 routes PHI-bearing questions to human review', () => {
    const r = composeThreadAnswer({
      responseId: 'r4',
      question: 'patient John Smith MRN AB12345 — what next?',
      candidateSources: [src('P1')],
    });
    expect(r.status).toBe('needs_human_review');
  });
});

let n = 0;
function thread(over: Partial<HelpThread>): HelpThread {
  n++;
  return {
    id: over.id ?? `ht-${n}`,
    title: over.title ?? 'Thread',
    normalizedTitle: 'thread',
    topicKey: 'general.thread',
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

function msg(over: Partial<HelpThreadMessage> & { id: string }): HelpThreadMessage {
  return {
    threadId: 't',
    authorType: 'user',
    body: 'hello',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

describe('bradThreadOrganizer', () => {
  it('auto-tags from title + message bodies', () => {
    const t = thread({ title: 'Evidence upload', tags: ['evidence'] });
    const tags = autoTagThread(t, [msg({ id: 'm1', body: 'the 485 form fails on /evidence/upload' })]);
    expect(tags).toContain('evidence');
    expect(tags).toContain('485');
  });

  it('only summarizes threads longer than the threshold', () => {
    const t = thread({ id: 't', participantCount: 2 });
    const few = [msg({ id: 'a' })];
    expect(summarizeThread(t, few, '2026-02-01T00:00:00.000Z')).toBeNull();
    const many = Array.from({ length: 12 }, (_, i) =>
      msg({ id: `m${i}`, body: i % 2 ? 'How do I do X?' : 'answer', authorType: i % 2 ? 'user' : 'brad' }),
    );
    const summary = summarizeThread(t, many, '2026-02-01T00:00:00.000Z');
    expect(summary).not.toBeNull();
    expect(summary!.openQuestions.length).toBeGreaterThan(0);
  });

  it('finds stale threads and surfaces unanswered high-upvote threads', () => {
    const now = Date.parse('2026-03-01T00:00:00.000Z');
    const stale = thread({ id: 'stale', lastActivityAt: '2026-01-01T00:00:00.000Z' });
    const fresh = thread({ id: 'fresh', lastActivityAt: '2026-02-28T00:00:00.000Z' });
    expect(findStaleThreads([stale, fresh], now, 30)).toEqual(['stale']);

    const hot = thread({ id: 'hot', status: 'open', upvoteCount: 5 });
    const cold = thread({ id: 'cold', status: 'open', upvoteCount: 0 });
    const surfaced = surfaceUnansweredHighUpvote([cold, hot], 1);
    expect(surfaced.map(t => t.id)).toEqual(['hot']);
  });
});
