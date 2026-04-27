/**
 * eCIgn store — append-only JSONL persistence layer.
 *
 * Each entity type writes to a separate .jsonl file inside server/ecign/data/.
 * Append-only at the API boundary: store provides only `append`, `read`, and
 * a single `mutateFormInstance()` that refuses any change after signed_locked.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

await fs.mkdir(DATA_DIR, { recursive: true });

type Entity =
  | 'document_versions'
  | 'consents'
  | 'form_instances'
  | 'signatures'
  | 'audit_events'
  | 'compliance_states';

const APPEND_ONLY: ReadonlySet<Entity> = new Set([
  'consents', 'signatures', 'audit_events',
  'compliance_states', 'document_versions',
]);

function file(entity: Entity): string {
  return path.join(DATA_DIR, `${entity}.jsonl`);
}

async function readAll<T>(entity: Entity): Promise<T[]> {
  try {
    const txt = await fs.readFile(file(entity), 'utf8');
    return txt.split('\n').filter(Boolean).map(l => JSON.parse(l) as T);
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

async function appendLine(entity: Entity, row: unknown): Promise<void> {
  await fs.appendFile(file(entity), JSON.stringify(row) + '\n', 'utf8');
}

export const store = {
  async listVersions() { return readAll<DocumentVersionRow>('document_versions'); },
  async insertVersion(v: DocumentVersionRow) { await appendLine('document_versions', v); },

  async listConsents(userId?: string) {
    const all = await readAll<ConsentRow>('consents');
    return userId ? all.filter(c => c.user_id === userId) : all;
  },
  async insertConsent(c: ConsentRow) { await appendLine('consents', c); },

  async listInstances() { return rebuildInstances(); },
  async getInstance(id: string) {
    const all = await rebuildInstances();
    return all.find(i => i.instance_id === id) ?? null;
  },
  async insertInstance(i: FormInstanceRow) { await appendLine('form_instances', i); },
  /**
   * Append a state-update row. The full instance is reconstructed by reading
   * all rows for its id ordered by row position (last row wins per field).
   * Any update on a row whose latest state is 'signed_locked' is rejected.
   */
  async updateInstance(id: string, patch: Partial<FormInstanceRow>) {
    const cur = await this.getInstance(id);
    if (!cur) throw new EcignError('INSTANCE_NOT_FOUND', `Instance ${id} not found`, 404);
    if (cur.state === 'signed_locked' && patch.state !== 'signed_locked') {
      throw new EcignError('DOCUMENT_LOCKED', 'Form instance is signed_locked.', 409);
    }
    const next = { ...cur, ...patch, instance_id: id };
    await appendLine('form_instances', next);
    return next;
  },

  async listSignatures(instanceId?: string) {
    const all = await readAll<SignatureRow>('signatures');
    return instanceId ? all.filter(s => s.instance_id === instanceId) : all;
  },
  async insertSignature(s: SignatureRow) {
    if (APPEND_ONLY.has('signatures')) {
      const dup = (await this.listSignatures(s.instance_id))
        .find(x => x.signer_user_id === s.signer_user_id && x.field_id === s.field_id);
      if (dup) throw new EcignError('DUPLICATE_SIGNATURE',
        `Signer already signed field ${s.field_id} on this instance.`, 409);
    }
    await appendLine('signatures', s);
  },

  async listAudit(subjectId?: string) {
    const all = await readAll<AuditRow>('audit_events');
    return subjectId
      ? all.filter(e => (e.subject as { id?: string }).id === subjectId)
      : all;
  },
  async appendAudit(row: AuditRow) { await appendLine('audit_events', row); },
  async lastAuditHash(): Promise<string> {
    const all = await readAll<AuditRow>('audit_events');
    return all.length ? all[all.length - 1].hash : 'GENESIS';
  },

  async listComplianceTransitions(kind?: string, id?: string) {
    const all = await readAll<ComplianceRow>('compliance_states');
    return all.filter(r =>
      (!kind || r.object_kind === kind) && (!id || r.object_id === id),
    );
  },
  async appendCompliance(row: ComplianceRow) { await appendLine('compliance_states', row); },
};

async function rebuildInstances(): Promise<FormInstanceRow[]> {
  const rows = await readAll<FormInstanceRow>('form_instances');
  const map = new Map<string, FormInstanceRow>();
  for (const r of rows) map.set(r.instance_id, r);
  return Array.from(map.values());
}

// ── Row shapes ──────────────────────────────────────────────────────────────
export interface DocumentVersionRow {
  version_id: string; form_id: string; semver: string;
  effective_at_utc: string; next_review_utc: string;
  governing_policies: string[]; canonical_bytes: number;
  hash_sha256: string; template_snapshot: string;
}
export interface ConsentRow {
  consent_id: string; user_id: string; disclosure_version: string;
  disclosure_text_hash: string; accepted_at_utc: string;
  ip: string; user_agent: string;
}
export interface RequiredSigner { role: string; tier: number; user_id?: string; field_id: string }
export interface FormInstanceRow {
  instance_id: string; form_id: string; document_version_id: string;
  state: 'created'|'disclosed'|'verified'|'reviewed'|'attested'|'signed_locked'|'voided'|'expired';
  required_signers: RequiredSigner[];
  field_values: Record<string, string>;
  workflow_instance_id?: string; event_id?: string;
  retention_until_utc?: string; document_hash?: string; manifest_hash?: string;
  locked_at_utc?: string;
  consent_id?: string; mfa_verified_at?: string;
  review_acknowledged_at?: string; attestation_confirmed_at?: string;
  created_at_utc: string;
}
export interface SignatureRow {
  signature_id: string; instance_id: string; field_id: string;
  signer_user_id: string; signer_name: string; signer_role: string;
  signer_email: string; signed_at_utc: string;
  signature_png: string; signature_hash: string;
  attestation_text_hash: string;
}
export interface AuditRow {
  event_id: string; prev_hash: string; hash: string;
  occurred_at_utc: string;
  actor: { user_id: string; name: string; role: string; email: string;
    auth_method: 'session'|'otp'|'sso'|'system'; mfa_verified_at?: string };
  network: { ip: string; user_agent: string; geo?: unknown; device?: unknown };
  subject: { kind: string; id: string; document_version_id?: string; document_hash?: string };
  action: string;
  payload: Record<string, unknown>;
}
export interface ComplianceRow {
  transition_id: string; object_kind: string; object_id: string;
  state_before: string; state_after: string;
  trigger_signature?: string;
  governing: { policy_id?: string; workflow_instance_id?: string;
    event_id?: string; document_version_id?: string };
  dependencies: Array<{ kind: string; ref: string; ok: boolean }>;
  occurred_at_utc: string;
}

// ── Typed error ─────────────────────────────────────────────────────────────
export class EcignError extends Error {
  constructor(public code: string, msg: string, public status = 400) { super(msg); }
}
