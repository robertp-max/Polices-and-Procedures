import { sha256 } from './hashChain.js';
import { store, type FormInstanceRow, type DocumentVersionRow } from './store.js';

/**
 * Canonical bytes = template_snapshot ‖ sorted(field_values).
 * Excludes appended pages and watermark, per Outputs spec §06.
 */
export function canonicalBytes(
  instance: FormInstanceRow,
  version: DocumentVersionRow,
): { bytes: Buffer; hash: string } {
  const sorted = Object.keys(instance.field_values).sort()
    .map(k => `${k}=${instance.field_values[k] ?? ''}`).join('\x1f');
  const bytes = Buffer.from(`${version.template_snapshot}\x1e${sorted}`, 'utf8');
  return { bytes, hash: sha256(bytes) };
}

/** Pre-print template integrity check. Throws TEMPLATE_DRIFT on mismatch. */
export async function assertTemplateIntegrity(versionId: string, renderedSnapshot: string) {
  const versions = await store.listVersions();
  const v = versions.find(x => x.version_id === versionId);
  if (!v) throw Object.assign(new Error('VERSION_NOT_FOUND'),
    { code: 'VERSION_NOT_FOUND', status: 404 });
  if (v.template_snapshot !== renderedSnapshot) {
    throw Object.assign(new Error('TEMPLATE_DRIFT detected'),
      { code: 'TEMPLATE_DRIFT', status: 500 });
  }
}
