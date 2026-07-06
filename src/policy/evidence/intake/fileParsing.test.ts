import { describe, it, expect } from 'vitest';
import { parseSourceFile } from './fileParsing';

describe('parseSourceFile JSON fallback', () => {
  it('parses well-formed JSON normally', () => {
    const text = JSON.stringify({ patients: [{ client_id: 'P1' }, { client_id: 'P2' }] });
    const result = parseSourceFile({ fileName: 'clean.json', mimeType: 'application/json', text, byteLength: text.length });
    expect(result.parseStatus).toBe('parsed');
    expect(result.records.length).toBe(2);
  });

  it('never returns failed/empty for malformed JSON that carries readable text', () => {
    const text = 'Some narrative prose before the data.\n{"a":1,"b":2}\nTrailing prose that breaks strict JSON.parse.';
    const result = parseSourceFile({ fileName: 'messy.json', mimeType: 'application/json', text, byteLength: text.length });
    expect(result.parseStatus).toBe('parsed');
    expect(result.records.length).toBeGreaterThan(0);
    expect(result.note).toMatch(/Invalid JSON/);
  });

  it('recovers an embedded JSON object when prose precedes it and nothing follows the JSON', () => {
    const text = '🔥 Dataset header prose that is not JSON at all.\n' + JSON.stringify({
      clinicians: [
        { clinicianId: 'C1', performanceFlags: ['no_call_no_show_3_instances'] },
        { clinicianId: 'C2', performanceFlags: ['late_documentation'] },
      ],
    });
    const result = parseSourceFile({ fileName: 'mixed.json', mimeType: 'application/json', text, byteLength: text.length });
    expect(result.parseStatus).toBe('parsed');
    // one record per clinician, plus the full-text fallback record
    expect(result.records.length).toBe(3);
    expect(result.columnHeaders).toContain('clinicianId');
    const textFallback = result.records[result.records.length - 1];
    expect(textFallback.pointer).toBe('page:1');
    expect(textFallback.text).toContain('Dataset header prose');
  });

  it('falls back to a single plain-text record when no JSON value can be recovered at all', () => {
    const text = 'This is entirely prose with no braces or brackets whatsoever, just narrative text.';
    const result = parseSourceFile({ fileName: 'nojson.json', mimeType: 'application/json', text, byteLength: text.length });
    expect(result.parseStatus).toBe('parsed');
    expect(result.records.length).toBe(1);
    expect(result.records[0].pointer).toBe('page:1');
    expect(result.note).toMatch(/Fell back to plain-text parsing/);
  });

  it('still reports empty (not failed) when the JSON is valid but structurally empty', () => {
    const text = '[]';
    const result = parseSourceFile({ fileName: 'empty.json', mimeType: 'application/json', text, byteLength: text.length });
    expect(result.parseStatus).toBe('empty');
  });
});
