import { describe, it, expect, beforeEach } from 'vitest';
import { useThreadStore, type CreateThreadInput } from './threadStore';

const base: Omit<CreateThreadInput, 'source' | 'type' | 'category'> = {
  title: 'Untitled',
  body: 'Some operational question about the app.',
  createdByUserId: 'u1',
  createdByDisplayName: 'User One',
};

beforeEach(() => {
  useThreadStore.getState().reset();
  if (typeof localStorage !== 'undefined') localStorage.clear();
});

describe('createThread — Brad response privacy (spec tests #4, #5)', () => {
  it('#4 thread from a Brad response is private_to_user by default', () => {
    const r = useThreadStore.getState().createThread({
      ...base,
      title: 'Explain weekly rating modal',
      type: 'brad_response',
      category: 'brad_ai',
      source: { kind: 'brad_response', bradResponseId: 'resp-1' },
    });
    expect(r.ok && r.outcome === 'created').toBe(true);
    if (r.ok && r.outcome === 'created') {
      expect(r.thread.visibility).toBe('private_to_user');
    }
  });

  it('#5 user can publish a non-PHI Brad thread to the Help Center', () => {
    const r = useThreadStore.getState().createThread({
      ...base,
      type: 'brad_response',
      category: 'brad_ai',
      source: { kind: 'brad_response', bradResponseId: 'resp-2' },
    });
    if (!r.ok || r.outcome !== 'created') throw new Error('expected created');
    useThreadStore.getState().publishToHelpCenter(r.thread.id);
    expect(useThreadStore.getState().getThread(r.thread.id)?.visibility).toBe('all_staff');
  });
});

describe('createThread — PHI guard (spec test #6)', () => {
  it('refuses to save PHI-bearing content by default', () => {
    const r = useThreadStore.getState().createThread({
      ...base,
      body: 'patient John Smith MRN AB12345 has a wound',
      type: 'general_question',
      category: 'other',
      source: { kind: 'general' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('phi');
    expect(useThreadStore.getState().threads.length).toBe(0);
  });

  it('saves a sanitized version when the user opts to sanitize', () => {
    const r = useThreadStore.getState().createThread(
      {
        ...base,
        body: 'patient John Smith MRN AB12345 cannot open the form',
        type: 'general_question',
        category: 'other',
        source: { kind: 'general' },
      },
      { sanitize: true },
    );
    expect(r.ok && r.outcome === 'created').toBe(true);
    const t = useThreadStore.getState().threads[0];
    const msg = useThreadStore.getState().getMessages(t.id)[0];
    expect(msg.body).toContain('[redacted]');
    expect(msg.sanitized).toBe(true);
  });
});

describe('duplicate detection + merge (spec tests #7, #8, #9)', () => {
  it('#7 detectDuplicates finds a same-topic thread', () => {
    const first = useThreadStore.getState().createThread({
      ...base,
      title: 'Upvotes on feature requests not counting',
      type: 'knowledge_article',
      category: 'help_center',
      source: { kind: 'help_article', articleId: 'KB-1', title: 'Feature requests' },
    });
    if (!first.ok || first.outcome !== 'created') throw new Error('expected created');

    const matches = useThreadStore.getState().detectDuplicates({
      normalizedTitle: 'upvotes on feature requests not counting',
      topicKey: first.thread.topicKey,
      category: 'help_center',
      source: { kind: 'help_article', articleId: 'KB-1', title: 'Feature requests' },
    });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].candidateThreadId).toBe(first.thread.id);
  });

  it('#8 high-confidence duplicate auto-merges into the older canonical thread', () => {
    const store = useThreadStore.getState();
    const a = store.createThread({
      ...base,
      title: 'Upvotes not counting',
      type: 'knowledge_article',
      category: 'help_center',
      source: { kind: 'help_article', articleId: 'KB-9', title: 'FR' },
    });
    if (!a.ok || a.outcome !== 'created') throw new Error('expected created A');

    const b = useThreadStore.getState().createThread({
      ...base,
      createdByUserId: 'u2',
      title: 'Upvotes not counting',
      type: 'knowledge_article',
      category: 'help_center',
      source: { kind: 'help_article', articleId: 'KB-9', title: 'FR' },
    });
    expect(b.ok && b.outcome === 'auto_merged').toBe(true);
    if (b.ok && b.outcome === 'auto_merged') {
      // older thread A is canonical
      expect(b.thread.id).toBe(a.thread.id);
      expect(b.thread.mergedThreadIds).toContain(b.duplicateThreadId);
      // duplicate is now a stub
      const stub = useThreadStore.getState().getThread(b.duplicateThreadId);
      expect(stub?.status).toBe('duplicate');
      expect(stub?.canonicalThreadId).toBe(a.thread.id);
      // a merge record was written
      expect(useThreadStore.getState().mergeRecords.length).toBe(1);
    }
  });

  it('#9 medium-confidence duplicate is suggested, not forced', () => {
    const a = useThreadStore.getState().createThread({
      ...base,
      title: 'Print preview background rendering',
      type: 'form_help',
      category: 'forms',
      source: { kind: 'general' },
    });
    if (!a.ok || a.outcome !== 'created') throw new Error('expected created A');

    const b = useThreadStore.getState().createThread({
      ...base,
      createdByUserId: 'u2',
      title: 'Print preview background rendering please help',
      type: 'form_help',
      category: 'forms',
      source: { kind: 'general' },
    });
    expect(b.ok && b.outcome === 'suggested').toBe(true);
    if (b.ok && b.outcome === 'suggested') {
      expect(b.suggestion.shouldSuggestMerge).toBe(true);
      expect(b.suggestion.shouldAutoMerge).toBe(false);
      expect(b.candidate.id).toBe(a.thread.id);
    }
    // The second thread was NOT created (not forced).
    expect(useThreadStore.getState().threads.length).toBe(1);
  });

  it('#9 user can override a suggestion and create a separate thread', () => {
    useThreadStore.getState().createThread({
      ...base,
      title: 'Print preview background rendering',
      type: 'form_help',
      category: 'forms',
      source: { kind: 'general' },
    });
    const b = useThreadStore.getState().createThread(
      {
        ...base,
        createdByUserId: 'u2',
        title: 'Print preview background rendering please help',
        type: 'form_help',
        category: 'forms',
        source: { kind: 'general' },
      },
      { confirmCreateDespiteDuplicate: true },
    );
    expect(b.ok && b.outcome === 'created').toBe(true);
    expect(useThreadStore.getState().threads.length).toBe(2);
  });
});

describe('feature requests share one canonical discussion thread', () => {
  it('routes a second feature-request thread into the existing one', () => {
    const a = useThreadStore.getState().createThread({
      ...base,
      title: 'Dark mode',
      type: 'feature_request',
      category: 'feature_requests',
      source: { kind: 'feature_request', featureRequestId: 'FR-7', title: 'Dark mode' },
    });
    if (!a.ok || a.outcome !== 'created') throw new Error('expected created');

    const b = useThreadStore.getState().createThread({
      ...base,
      createdByUserId: 'u2',
      title: 'Please add dark mode',
      body: 'Would love a dark theme.',
      type: 'feature_request',
      category: 'feature_requests',
      source: { kind: 'feature_request', featureRequestId: 'FR-7', title: 'Dark mode' },
    });
    expect(b.ok && b.outcome === 'routed_to_existing').toBe(true);
    if (b.ok && b.outcome === 'routed_to_existing') {
      expect(b.thread.id).toBe(a.thread.id);
      expect(useThreadStore.getState().getMessages(a.thread.id).length).toBe(2);
    }
    expect(useThreadStore.getState().threads.length).toBe(1);
  });
});

describe('guided tour failure thread (spec test #19)', () => {
  const tourSource = { kind: 'guided_tour' as const, tourId: 'tour-evidence', stepId: 'step-3' };

  it('creates a PHI-safe support thread from a tour failure', () => {
    const r = useThreadStore.getState().createThread({
      ...base,
      title: 'Guided tour failed at step 3',
      body: 'The tour could not find the upload button on /evidence/upload.',
      type: 'guided_tour',
      category: 'guided_tours',
      source: tourSource,
      errorSignature: 'tour target not found at step 3',
    });
    expect(r.ok && r.outcome === 'created').toBe(true);
  });

  it('blocks a tour thread that carries patient PHI in the error detail', () => {
    const r = useThreadStore.getState().createThread({
      ...base,
      title: 'Tour failed',
      body: 'crashed while viewing patient John Smith MRN AB12345',
      type: 'guided_tour',
      category: 'guided_tours',
      source: { kind: 'guided_tour', tourId: 'tour-x' },
      errorSignature: 'crash on patient view',
    });
    expect(r.ok).toBe(false);
  });

  it('dedupes a repeated identical tour failure into the existing thread', () => {
    const first = useThreadStore.getState().createThread({
      ...base,
      title: 'Tour failed at step 3',
      body: 'tour target not found at step 3 on /evidence',
      type: 'guided_tour',
      category: 'guided_tours',
      source: tourSource,
      errorSignature: 'tour target not found at step 3',
    });
    if (!first.ok || first.outcome !== 'created') throw new Error('expected created');
    const second = useThreadStore.getState().createThread({
      ...base,
      createdByUserId: 'u2',
      title: 'Tour failed at step 3',
      body: 'tour target not found at step 3 on /evidence',
      type: 'guided_tour',
      category: 'guided_tours',
      source: tourSource,
      errorSignature: 'tour target not found at step 3',
    });
    // same source object + same topic key → auto-merge (not a second standalone thread)
    expect(second.ok && (second.outcome === 'auto_merged' || second.outcome === 'routed_to_existing')).toBe(true);
  });
});

describe('admin moderation (spec tests #17, #18)', () => {
  function seedTwo() {
    const a = useThreadStore.getState().createThread({
      ...base, title: 'Canonical topic', type: 'general_question', category: 'other', source: { kind: 'general' },
    });
    const b = useThreadStore.getState().createThread({
      ...base, createdByUserId: 'u2', title: 'Another topic entirely', type: 'general_question', category: 'other', source: { kind: 'general' },
    });
    if (!a.ok || a.outcome !== 'created' || !b.ok || b.outcome !== 'created') throw new Error('seed failed');
    return { a: a.thread.id, b: b.thread.id };
  }

  it('#17 admin can accept an answer', () => {
    const r = useThreadStore.getState().createThread({
      ...base, type: 'general_question', category: 'other', source: { kind: 'general' },
    });
    if (!r.ok || r.outcome !== 'created') throw new Error('expected created');
    const msg = useThreadStore.getState().addMessage({
      threadId: r.thread.id, authorType: 'user', authorUserId: 'u2', body: 'Here is the answer',
    });
    if (!msg.ok) throw new Error('expected message');
    useThreadStore.getState().acceptAnswer(r.thread.id, msg.message.id);
    const t = useThreadStore.getState().getThread(r.thread.id);
    expect(t?.acceptedAnswerMessageId).toBe(msg.message.id);
    expect(t?.status).toBe('answered');
  });

  it('#18 admin can merge then unmerge, restoring the source thread', () => {
    const { a, b } = seedTwo();
    const record = useThreadStore.getState().mergeThreads(b, a, 'admin', 'manual', 1);
    expect(record).not.toBeNull();
    expect(useThreadStore.getState().getThread(b)?.status).toBe('duplicate');
    expect(useThreadStore.getState().getThread(a)?.mergedThreadIds).toContain(b);

    const ok = useThreadStore.getState().unmergeThread(b);
    expect(ok).toBe(true);
    const restored = useThreadStore.getState().getThread(b);
    expect(restored?.status).toBe('open');
    expect(restored?.canonicalThreadId).toBeUndefined();
    expect(useThreadStore.getState().getThread(a)?.mergedThreadIds ?? []).not.toContain(b);
    // the duplicate's original message is back on the source thread
    expect(useThreadStore.getState().getMessages(b).length).toBeGreaterThan(0);
  });
});

describe('upvote de-dup', () => {
  it('toggling the same user does not inflate the count', () => {
    const r = useThreadStore.getState().createThread({
      ...base,
      type: 'general_question',
      category: 'other',
      source: { kind: 'general' },
    });
    if (!r.ok || r.outcome !== 'created') throw new Error('expected created');
    const id = r.thread.id;
    useThreadStore.getState().toggleUpvote(id, 'u1');
    useThreadStore.getState().toggleUpvote(id, 'u1'); // toggle off
    useThreadStore.getState().toggleUpvote(id, 'u1'); // toggle on
    expect(useThreadStore.getState().getThread(id)?.upvoteCount).toBe(1);
  });
});
