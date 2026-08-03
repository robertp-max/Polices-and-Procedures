import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = path.resolve(here, '..', 'assets', 'governance-tabletop-packets');
const MANIFEST_PATH = path.join(ASSET_DIR, 'manifest.json');
const CLASSIFICATION = 'SYNTHETIC MOCK DATA - NO REAL PHI - NOT FOR PRODUCTION';

export type GovernancePacketStatus =
  | 'not_generated'
  | 'generating'
  | 'review_required'
  | 'approved_for_uat'
  | 'failed'
  | 'superseded';

export interface GovernancePacketArtifact {
  packetId: string;
  caseId: string;
  period: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  version: string;
  status: GovernancePacketStatus;
  sourceCutoff: string;
  sourceHash: string;
  generatedAt: string;
  generatedBy: 'Fable';
  pdfHash: string;
  pageCount: number;
  protectedOpenUrl: string;
  supersedesPacketId?: string;
  reviewFindings: string[];
  filename: string;
}

export interface GovernancePacketManifest {
  schemaVersion: 1;
  generatedBy: 'Fable';
  classification: string;
  artifacts: GovernancePacketArtifact[];
}

function isArtifact(value: unknown): value is GovernancePacketArtifact {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.packetId === 'string' &&
    typeof item.caseId === 'string' &&
    typeof item.filename === 'string' &&
    typeof item.protectedOpenUrl === 'string' &&
    typeof item.status === 'string'
  );
}

export function currentGovernancePacketArtifacts(
  manifest: GovernancePacketManifest,
): GovernancePacketArtifact[] {
  return manifest.artifacts
    .filter((artifact) => artifact.status !== 'superseded')
    .sort((a, b) => a.period.localeCompare(b.period));
}

async function readManifest(): Promise<GovernancePacketManifest | null> {
  try {
    const parsed = JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as Partial<GovernancePacketManifest>;
    if (
      parsed.schemaVersion !== 1 ||
      parsed.classification !== CLASSIFICATION ||
      !Array.isArray(parsed.artifacts) ||
      !parsed.artifacts.every(isArtifact)
    ) {
      return null;
    }
    return parsed as GovernancePacketManifest;
  } catch {
    return null;
  }
}

function actorId(req: { actor?: { user_id?: string; email?: string } }): string {
  return req.actor?.email ?? req.actor?.user_id ?? 'unknown';
}

export const governanceTabletopPacketsRouter = Router();

governanceTabletopPacketsRouter.get('/', async (_req, res) => {
  const manifest = await readManifest();
  if (!manifest) {
    res.status(503).json({
      connected: false,
      classification: CLASSIFICATION,
      artifacts: [],
      notice: 'Tabletop packet artifacts have not been generated on this server instance.',
    });
    return;
  }

  res.setHeader('Cache-Control', 'no-store, private');
  res.json({
    connected: true,
    classification: manifest.classification,
    artifacts: currentGovernancePacketArtifacts(manifest).map(({ filename: _filename, ...artifact }) => artifact),
  });
});

governanceTabletopPacketsRouter.get('/:packetId/pdf', async (req, res) => {
  const manifest = await readManifest();
  const packetId = String(req.params.packetId);
  const artifact = manifest?.artifacts.find(
    (candidate) => candidate.packetId === packetId && candidate.status !== 'superseded',
  );
  if (!artifact) {
    res.status(404).json({ error: { code: 'TABLETOP_PACKET_NOT_FOUND' } });
    return;
  }

  let pdf: Buffer;
  try {
    pdf = await readFile(path.join(ASSET_DIR, artifact.filename));
  } catch {
    res.status(503).json({
      error: {
        code: 'TABLETOP_PACKET_UNAVAILABLE',
        message: 'The controlled packet PDF is not available from this server instance.',
      },
    });
    return;
  }

  const actualHash = createHash('sha256').update(pdf).digest('hex');
  if (actualHash !== artifact.pdfHash) {
    res.status(503).json({
      error: {
        code: 'TABLETOP_PACKET_INTEGRITY_FAILURE',
        message: 'The controlled packet failed its integrity check.',
      },
    });
    return;
  }

  console.log(
    JSON.stringify({
      event: 'governance.tabletop_packet.accessed',
      packetId: artifact.packetId,
      caseId: artifact.caseId,
      status: artifact.status,
      actor: actorId(req),
      at: new Date().toISOString(),
      sha256: actualHash.slice(0, 16),
    }),
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${artifact.filename}"`);
  res.setHeader('Content-Length', String(pdf.byteLength));
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Document-Classification', CLASSIFICATION);
  res.status(200).send(pdf);
});
