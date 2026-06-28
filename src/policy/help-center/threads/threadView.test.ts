import { describe, it, expect } from 'vitest';
import type { HelpThread } from './types';
import { buildThreadList, canViewThread, relativeTime } from './threadView';

let n = 0;
function thread(over: Partial<HelpThread>): HelpThread {
  n++;
  return {
    id: over.id ?? `ht-${n}`,
    title: over.title ?? `Thread ${n}`,
    normalizedTitle: (over.title ?? `thread ${n}`).toLowerCase(),
    topicKey: 'general.thread',
    type: 'general_question',
    status: 'open',
    source: { kind: 'general' },
    category: 'other',
    visibility: 'all_staff',
    tags: [],
    createdByUserId: 'u1',
    createdAt: `2026-01-0${n}T00:00:00.000Z`,
    updatedAt: `2026-01-0${n}T00:00:00.000Z`,
    lastActivityAt: `2026-01-0${n}T00:00:00.000Z`,
    messageCount: 1,
    participantCount: 1,
    upvoteCount: 0,
    upvotedByUserIds: [],
    ...over,
  };
}

describe('canViewThread', () => {
  it('hides another user’s private thread but shows it to its owner / admins', () => {
    const t = thread({ visibility: 'private_to_user', createdByUserId: 'owner' });
    expect(canViewThread(t, 'owner', false)).toBe(true);
    expect(canViewThread(t, 'someone', false)).toBe(false);
    expect(canViewThread(t, 'someone', true)).toBe(true);
  });

  it('hides admin_only threads from non-admins', () => {
    const t = thread({ visibility: 'admin_only' });
    expect(canViewThread(t, 'u1', false)).toBe(false);
    expect(canViewThread(t, 'u1', true)).toBe(true);
  });
});

describe('buildThreadList', () => {
  const base = { userId: 'u1', isAdmin: false, search: '' } as const;

  it('hides duplicate stubs unless the duplicates filter is active', () => {
    const open = thread({ id: 'a', status: 'open' });
    const dup = thread({ id: 'b', status: 'duplicate', canonicalThreadId: 'a' });
    const all = buildThreadList([open, dup], { ...base, filter: 'all', sort: 'recent' });
    expect(all.map(t => t.id)).toEqual(['a']);
    const dups = buildThreadList([open, dup], { ...base, filter: 'duplicates', sort: 'recent', includeDuplicates: true });
    expect(dups.map(t => t.id)).toContain('b');
  });

  it('filters "mine" to the current user', () => {
    const mine = thread({ id: 'm', createdByUserId: 'u1' });
    const theirs = thread({ id: 't', createdByUserId: 'u2' });
    const out = buildThreadList([mine, theirs], { ...base, filter: 'mine', sort: 'recent' });
    expect(out.map(t => t.id)).toEqual(['m']);
  });

  it('floats admin-pinned threads to the top regardless of sort', () => {
    const plain = thread({ id: 'p', lastActivityAt: '2026-09-01T00:00:00.000Z' });
    const pinned = thread({ id: 'pin', adminPinned: true, lastActivityAt: '2026-01-01T00:00:00.000Z' });
    const out = buildThreadList([plain, pinned], { ...base, filter: 'all', sort: 'recent' });
    expect(out[0].id).toBe('pin');
  });
});

describe('relativeTime', () => {
  it('renders compact buckets from a fixed now', () => {
    const now = Date.parse('2026-01-10T00:00:00.000Z');
    expect(relativeTime('2026-01-10T00:00:00.000Z', now)).toBe('just now');
    expect(relativeTime('2026-01-09T00:00:00.000Z', now)).toBe('1d ago');
  });
});
