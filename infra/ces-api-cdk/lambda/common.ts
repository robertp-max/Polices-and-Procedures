import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

/* ═══════════════════════════════════════════════════════════════
   CES metadata Lambda — shared helpers.

   Mirrors the contract of server/cesMetadataStore.ts (the local Express
   seam) so dev and deployed behavior match. Stores NON-PHI metadata +
   pointers only. File bytes are rejected by assertNoFileBytes — they
   belong in Google Drive, never here.
   ═══════════════════════════════════════════════════════════════ */

const region = process.env.AWS_REGION || 'us-west-1';
export const TABLE = mustEnv('CES_METADATA_TABLE_NAME');

export const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
});

export const cmds = { GetCommand, PutCommand, QueryCommand };

export function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(body),
  };
}

export function jsonError(statusCode: number, code: string, message: string) {
  return json(statusCode, { error: { code, message } });
}

/** Field names that signal a file body / blob — forbidden in CES metadata. */
export const FORBIDDEN_METADATA_FIELDS = [
  'localDataUrl', 'base64', 'rawBytes', 'pdfBlob',
  'signedPacketBlob', 'certificateHtml', 'htmlSnapshot',
];

/** Throws if any nested object smuggles a file body / blob into metadata. */
export function assertNoFileBytes(obj: unknown, context: string): void {
  const seen = new Set<unknown>();
  const walk = (node: unknown) => {
    if (node == null || typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) { node.forEach(walk); return; }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (FORBIDDEN_METADATA_FIELDS.includes(k) && v != null && v !== '') {
        throw new Error(`CES metadata may not contain file bytes ("${k}") in ${context}.`);
      }
      walk(v);
    }
  };
  walk(obj);
}

export function parseBody(raw: string | null | undefined, isBase64?: boolean): Record<string, unknown> {
  if (!raw) return {};
  try {
    const text = isBase64 ? Buffer.from(raw, 'base64').toString('utf8') : raw;
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}
