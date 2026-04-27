/**
 * Bridge from the eCIgn signing flow to the HHC Phase-1 evidence backend.
 *
 * After a document locks (terminal eCIgn state), we POST the signature event
 * to `${API_BASE}/esign/complete` so the same audit-trail / compliance-evidence
 * machinery that file uploads use also fires for signatures.
 *
 * No-op if the API base is unreachable; the eCIgn server-side persistence is
 * authoritative for the signature itself, this is just compliance evidence
 * mirroring + cross-system audit linkage.
 */

const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_HHC_API_BASE ||
  'https://rtllnugat0.execute-api.us-west-1.amazonaws.com';

export interface RecordEsignArgs {
  policy_id?:         string;       // e.g. "GV-OG-005"; falls back to "POL-UNLINKED"
  workflow_id?:       string;       // e.g. "WF-GV-FM-017"; falls back to "WF-FORM-{form_id}"
  /** The regulatory / calendar event ID this signing belongs to.
   *  Distinct from form_instance_id. Falls back to "EVT-FORM-{form_instance_id}". */
  event_id?:          string;
  form_id:            string;
  /** The eCIgn form instance ID (FI-…). Stored separately from event_id. */
  form_instance_id?:  string;
  document_id?:       string;
  document_hash?:     string | null;
  signature_hash:     string;
  attestation_text?:  string;
  signer_id:          string;
  signer_name:        string;
  signer_role?:       string;
  signer_email?:      string;
  signed_at?:         string;       // ISO; defaults to now()
  network_location?: {
    ip_address: string;
    city: string;
    state_region: string;
    country: string;
    postal: string;
    org_isp: string;
    source: string;
    captured_at: string;
    user_agent: string;
    lookup_status: string;
    failure_reason?: string;
  };
}

export interface EsignEvidenceResponse {
  evidence_id:      string;
  status:           string;
  signature_status: string;
  s3_bucket:        string;
  s3_key:           string;
  sha256:           string;
  policy_id:        string;
  workflow_id:      string;
  event_id:         string;
  form_id:          string;
}

export interface EvidenceFileSummary {
  evidence_id:      string;
  filename:         string;
  policy_id:        string;
  workflow_id:      string;
  event_id:         string;
  form_id:          string | null;
  status:           string;
  signature_status: string | null;
  source_system:    string | null;
  mime_type:        string | null;
  size_bytes:       number | null;
  created_at:       string;
  updated_at:       string;
}

interface EventFilesResponse {
  event_id: string;
  files:    EvidenceFileSummary[];
}

export interface QueryEvidenceContextArgs {
  event_id?:         string;
  event_candidates?: string[];
  form_id?:          string;
  policy_id?:        string;
  evidence_id?:      string;
}

export interface QueryEvidenceContextResult {
  searched_events: string[];
  matches:         EvidenceFileSummary[];
}

function actorHeaders(): Record<string, string> {
  try {
    const id   = localStorage.getItem('hhc_actor_id')   || 'demo-user';
    const role = localStorage.getItem('hhc_actor_role') || 'Compliance Officer';
    return { 'x-hhc-actor-id': id, 'x-hhc-actor-role': role };
  } catch {
    return { 'x-hhc-actor-id': 'demo-user', 'x-hhc-actor-role': 'Compliance Officer' };
  }
}

export async function recordEsignEvidence(args: RecordEsignArgs): Promise<EsignEvidenceResponse> {
  const res = await fetch(`${API_BASE}/esign/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...actorHeaders() },
    body: JSON.stringify({
      policy_id:        args.policy_id        || undefined,
      workflow_id:      args.workflow_id       || undefined,
      event_id:         args.event_id          || undefined,
      form_id:          args.form_id,
      form_instance_id: args.form_instance_id  || undefined,
      document_id:      args.document_id       || args.form_id,
      document_hash:    args.document_hash     ?? undefined,
      signature_hash:   args.signature_hash,
      attestation_text: args.attestation_text  ?? undefined,
      signer_id:        args.signer_id,
      signer_name:      args.signer_name,
      signer_role:      args.signer_role       || undefined,
      signer_email:     args.signer_email      || undefined,
      signed_at:        args.signed_at         || new Date().toISOString(),
      network_location: args.network_location  || undefined,
    }),
  });
  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data as { error?: string })?.error || `HTTP ${res.status}`;
    throw new Error(`hhc.esign.complete: ${msg}`);
  }
  return data as EsignEvidenceResponse;
}

async function listEventEvidence(eventId: string): Promise<EvidenceFileSummary[]> {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}/files`, {
    headers: actorHeaders(),
  });
  const text = await res.text();
  if (!res.ok) {
    return [];
  }
  try {
    const data = (text ? JSON.parse(text) : null) as EventFilesResponse | null;
    return Array.isArray(data?.files) ? data.files : [];
  } catch {
    return [];
  }
}

export async function queryEvidenceByContext(args: QueryEvidenceContextArgs): Promise<QueryEvidenceContextResult> {
  const candidates = [
    args.event_id,
    ...(args.event_candidates || []),
  ]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  // If no event hint exists, backend cannot list evidence without an event partition key.
  if (candidates.length === 0) {
    return { searched_events: [], matches: [] };
  }

  const allRows: EvidenceFileSummary[] = [];
  for (const eventId of candidates) {
    const rows = await listEventEvidence(eventId);
    allRows.push(...rows);
  }

  const byEvidence = new Map<string, EvidenceFileSummary>();
  for (const row of allRows) {
    byEvidence.set(row.evidence_id, row);
  }

  const filtered = Array.from(byEvidence.values()).filter((row) => {
    if (args.evidence_id && row.evidence_id !== args.evidence_id) return false;
    if (args.form_id && (row.form_id || '') !== args.form_id) return false;
    if (args.policy_id && row.policy_id !== args.policy_id) return false;
    if (args.event_id && row.event_id !== args.event_id) return false;
    return true;
  });

  return {
    searched_events: candidates,
    matches: filtered,
  };
}
