/**
 * Protected delivery for controlled Governing Body reference documents (spec §6 / B6).
 *
 * These are counsel-review drafts and template sources. Previously they were
 * imported into the CLIENT BUNDLE with Vite `?raw`, which meant the full text
 * shipped inside application JS and could be retrieved by anyone who could load
 * the bundle — "hidden from the URL" is not access control.
 *
 * They now live on the server (server/assets/governance-references) and are
 * served ONLY through this router, which is mounted AFTER requireApiAuth() so
 * every request carries a verified session. Each access is audit-logged.
 */
import { Router } from 'express';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = path.resolve(here, '..', 'assets', 'governance-references');

export function toDocumentClassificationHeader(value: string): string {
  const safeValue = value
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[^\x20-\x7e]/g, '')
    .trim();
  return safeValue || 'CONTROLLED';
}

export interface GovernanceReferenceDescriptor {
  id: string;
  filename: string;
  title: string;
  classification: string;
  posture: string;
}

/**
 * Allowlist. The `:docId` param is matched against these ids ONLY — the
 * filename never comes from the request, so path traversal is impossible.
 */
const DOCUMENTS: Record<string, GovernanceReferenceDescriptor> = {
  'handbook-2026-counsel-review-draft': {
    id: 'handbook-2026-counsel-review-draft',
    filename: 'handbook-2026-counsel-review-draft.html',
    title: 'Recommended 2026 Employee and Field Workforce Handbook — counsel-review draft',
    classification: 'CONTROLLED — BOARD APPROVAL REFERENCE',
    posture:
      'DRAFT pending California employment-counsel review. Not effective, not acknowledgeable, and not a substitute for the handbook of record.',
  },
  'patient-admission-packet-letter-form': {
    id: 'patient-admission-packet-letter-form',
    filename: 'patient-admission-packet-letter-form.html',
    title: 'Patient Admission Packet — template source',
    classification: 'CONTROLLED — TEMPLATE SOURCE',
    posture:
      'Template source for Board approval reference. Production use requires the Patient Admission Packet controls decision to pass.',
  },
};

export const governanceReferencesRouter = Router();

/** Metadata only — never the document body. */
governanceReferencesRouter.get('/', (_req, res) => {
  res.json({
    documents: Object.values(DOCUMENTS).map(({ filename: _filename, ...rest }) => rest),
  });
});

governanceReferencesRouter.get('/:docId', async (req, res) => {
  const descriptor = DOCUMENTS[String(req.params.docId)];
  if (!descriptor) {
    res.status(404).json({ error: { code: 'REFERENCE_NOT_FOUND' } });
    return;
  }

  let html: string;
  try {
    html = await readFile(path.join(ASSET_DIR, descriptor.filename), 'utf8');
  } catch {
    res.status(503).json({
      error: {
        code: 'REFERENCE_UNAVAILABLE',
        message: 'The controlled document is not available from this server instance.',
      },
    });
    return;
  }

  // Audit the access (identity comes from the authenticated session, never the body).
  const actor = req.actor?.email ?? req.actor?.user_id ?? 'unknown';
  console.log(
    JSON.stringify({
      event: 'governance.reference.accessed',
      docId: descriptor.id,
      actor,
      at: new Date().toISOString(),
      sha256: createHash('sha256').update(html).digest('hex').slice(0, 16),
    }),
  );

  // Controlled: never cached by shared caches, never framed by another origin,
  // and no referrer leakage when the user follows a link out of the document.
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Document-Classification', toDocumentClassificationHeader(descriptor.classification));
  res.status(200).send(html);
});
