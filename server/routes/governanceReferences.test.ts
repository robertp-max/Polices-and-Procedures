import { describe, expect, it } from 'vitest';

import { toDocumentClassificationHeader } from './governanceReferences';

describe('governance reference response headers', () => {
  it('normalizes controlled-document punctuation to an ASCII-safe header value', () => {
    const value = toDocumentClassificationHeader('CONTROLLED — BOARD APPROVAL REFERENCE');
    expect(value).toBe('CONTROLLED - BOARD APPROVAL REFERENCE');
    expect(value).toMatch(/^[\x20-\x7e]+$/);
  });

  it('removes line breaks and fails closed when no ASCII classification remains', () => {
    expect(toDocumentClassificationHeader('CONTROLLED\r\nX-Injected: yes')).toBe(
      'CONTROLLEDX-Injected: yes',
    );
    expect(toDocumentClassificationHeader('——')).toBe('--');
    expect(toDocumentClassificationHeader('控制')).toBe('CONTROLLED');
  });
});
