/**
 * Defense-in-depth tests for buildSignedDocumentBundle (ADR-0002 Phase 1).
 *
 * The builder must refuse to emit a certificate/watermark/manifest "signed
 * bundle" for any instance that has not passed the full signed-lock lifecycle —
 * even if a caller reaches it without the route-level containment check.
 *
 * The store is monkeypatched, so no test reads or writes the on-disk JSONL.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { store } from './store.js';
import { buildSignedDocumentBundle } from './pdf.js';

const original: Record<string, unknown> = {};
function patch(instance: unknown, signatures: unknown[] = []) {
  for (const m of ['getInstance', 'listSignatures', 'listAudit']) original[m] ??= (store as Record<string, unknown>)[m];
  (store as Record<string, unknown>).getInstance = async () => instance;
  (store as Record<string, unknown>).listSignatures = async () => signatures;
  (store as Record<string, unknown>).listAudit = async () => [];
}
afterEach(() => { for (const [m, fn] of Object.entries(original)) (store as Record<string, unknown>)[m] = fn; });

const lockedInstance = (over: Record<string, unknown> = {}) => ({
  instance_id: 'i1', form_id: 'F', document_version_id: 'v1', state: 'signed_locked',
  required_signers: [{ field_id: 'f1', role: 'unknown', slot_order: 1 }],
  document_hash: 'd', manifest_hash: 'm', locked_at_utc: '2027-01-01T00:00:00Z',
  attestation_confirmed_at: '2027-01-01T00:00:00Z', field_values: {}, ...over,
});
const signatureRow = () => ({
  signature_id: 'SIG-1', instance_id: 'i1', field_id: 'f1', signer_user_id: 'usr-1',
  signer_name: 'Nora', signer_role: 'unknown', signer_email: 'n@careindeed.com',
  signed_at_utc: '2027-01-01T00:00:00Z', signature_png: 'data:image/png;base64,AAAA',
  signature_hash: 'abcdef0123456789abcdef', attestation_text_hash: 'h',
});

describe('buildSignedDocumentBundle — fail-closed', () => {
  it('refuses a non-existent instance (404)', async () => {
    patch(undefined);
    await expect(buildSignedDocumentBundle('i1', 'C')).rejects.toMatchObject({ status: 404 });
  });

  it.each(['created', 'disclosed', 'reviewed', 'attested'])('refuses an unlocked instance in state %s', async (state) => {
    patch(lockedInstance({ state }), [signatureRow()]);
    await expect(buildSignedDocumentBundle('i1', 'C')).rejects.toMatchObject({ code: 'BUNDLE_NOT_LOCKED', status: 409 });
  });

  it('refuses an instance with no required signers', async () => {
    patch(lockedInstance({ required_signers: [] }), []);
    await expect(buildSignedDocumentBundle('i1', 'C')).rejects.toMatchObject({ code: 'SIGNER_REQUIREMENTS_MISSING' });
  });

  it('refuses when document/manifest/lock integrity fields are missing', async () => {
    patch(lockedInstance({ document_hash: undefined }), [signatureRow()]);
    await expect(buildSignedDocumentBundle('i1', 'C')).rejects.toMatchObject({ code: 'BUNDLE_INTEGRITY_INCOMPLETE' });
  });

  it('refuses when a required signature is missing', async () => {
    patch(lockedInstance(), []); // required f1 but no signatures
    await expect(buildSignedDocumentBundle('i1', 'C')).rejects.toMatchObject({ code: 'SIGNATURES_INCOMPLETE' });
  });

  it('generates a bundle for a fully valid signed_locked instance', async () => {
    patch(lockedInstance(), [signatureRow()]);
    const bundle = await buildSignedDocumentBundle('i1', 'CERT-i1');
    expect(bundle.instance.instance_id).toBe('i1');
    expect(typeof bundle.appended).toBe('string');
    expect(bundle.appended.length).toBeGreaterThan(0);
    expect(bundle.watermark).toContain('CERT-i1');
  });

  it('a missing OPTIONAL signer does not block a bundle once every required signer is present', async () => {
    const inst = lockedInstance({
      required_signers: [
        { field_id: 'f1', role: 'unknown', slot_order: 1 },                 // required (default)
        { field_id: 'f2', role: 'unknown', slot_order: 2, required: false }, // optional, unsigned
      ],
    });
    patch(inst, [signatureRow()]); // only f1 signed
    const bundle = await buildSignedDocumentBundle('i1', 'CERT-i1');
    expect(bundle.instance.instance_id).toBe('i1');
  });

  it('a missing REQUIRED signer still blocks the bundle', async () => {
    const inst = lockedInstance({
      required_signers: [
        { field_id: 'f1', role: 'unknown', slot_order: 1, required: false }, // optional, signed
        { field_id: 'f2', role: 'unknown', slot_order: 2 },                   // required, unsigned
      ],
    });
    patch(inst, [{ ...signatureRow(), field_id: 'f1' }]); // f2 (required) missing
    await expect(buildSignedDocumentBundle('i1', 'C')).rejects.toMatchObject({ code: 'SIGNATURES_INCOMPLETE' });
  });
});
