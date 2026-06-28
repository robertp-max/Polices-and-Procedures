import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  buildTopicKey,
  sourceObjectKey,
  errorSignature,
  extractEntities,
} from './threadTopicKey';

describe('threadTopicKey', () => {
  it('normalizes text deterministically and idempotently', () => {
    const a = normalizeText('  How do I  Upload Drive Metadata?? ');
    expect(a).toBe('how do i upload drive metadata');
    expect(normalizeText(a)).toBe(a);
  });

  it('builds dotted topic keys with the right namespace (spec examples)', () => {
    // Namespace derives from source/category; the intent slug is an
    // order-insensitive set of meaningful tokens.
    expect(
      buildTopicKey({
        title: 'Generate event packet',
        category: 'guided_tours',
        source: { kind: 'guided_tour', tourId: 'T1' },
      }),
    ).toBe('guided-tour.event-generate-packet');

    expect(
      buildTopicKey({
        title: 'Weekly rating modal',
        category: 'brad_ai',
        source: { kind: 'brad_response', bradResponseId: 'r1' },
      }),
    ).toBe('brad.modal-rating-weekly');

    // Deterministic: same input → same key.
    const input = {
      title: 'Upload drive metadata',
      category: 'evidence_center' as const,
      source: { kind: 'general' as const },
    };
    expect(buildTopicKey(input)).toBe(buildTopicKey(input));
    expect(buildTopicKey(input).startsWith('evidence.')).toBe(true);
  });

  it('two threads on the same topic share a topic key regardless of word order (spec test #7)', () => {
    const k1 = buildTopicKey({
      title: 'Feature requests upvotes not counting',
      category: 'help_center',
      source: { kind: 'help_article', articleId: 'KB-1', title: 'x' },
    });
    const k2 = buildTopicKey({
      title: 'Upvotes on feature requests are not counting',
      category: 'help_center',
      source: { kind: 'help_article', articleId: 'KB-1', title: 'x' },
    });
    expect(k1).toBe(k2);
  });

  it('sourceObjectKey identifies the same object regardless of title', () => {
    const a = sourceObjectKey({ kind: 'feature_request', featureRequestId: 'FR-9', title: 'a' });
    const b = sourceObjectKey({ kind: 'feature_request', featureRequestId: 'FR-9', title: 'b' });
    expect(a).toBe(b);
  });

  it('errorSignature collapses numbers so step N variants match', () => {
    expect(errorSignature('failed at step 3')).toBe(errorSignature('failed at step 7'));
  });

  it('extractEntities pulls forms, routes, and tags', () => {
    const e = extractEntities('The 485 form on /evidence/upload throws an error');
    expect(e.formIds).toContain('485');
    expect(e.routes).toContain('/evidence/upload');
    expect(e.tags.length).toBeGreaterThan(0);
  });
});
