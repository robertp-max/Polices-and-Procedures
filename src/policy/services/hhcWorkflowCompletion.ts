/**
 * Workflow-completion gate for the HHC Phase-1 backend.
 *
 * A workflow can only be marked complete when every required form has an
 * APPROVED_EVIDENCE row, every required evidence_kind is present, every
 * declared event_id has at least one evidence row, and no row is still in
 * PENDING_APPROVAL / signature_status=PENDING. The backend persists either
 * `WORKFLOW_COMPLETED` or `COMPLETION_BLOCKED` to the audit log.
 */

const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_HHC_API_BASE ||
  'https://rtllnugat0.execute-api.us-west-1.amazonaws.com';

export interface PendingApproval {
  evidence_id:        string;
  event_id:           string;
  form_id:            string | null;
  status:             string;
  signature_status:   string;
}

export interface CompletionStatus {
  workflow_id:             string;
  canComplete:             boolean;
  missing_forms:           string[];
  missing_evidence_kinds:  string[];
  incomplete_events:       string[];
  pending_approvals:       PendingApproval[];
  approved_count:          number;
}

export interface CompletionRequest {
  event_ids:                 string[];
  required_forms?:           string[];
  required_evidence_kinds?:  string[];
  primary_event_id?:         string;
  source_system?:            string;
}

export interface CompletionSuccess {
  workflow_id:    string;
  completed:      true;
  completed_at:   string;
  completed_by:   string;
  approved_count: number;
  event_ids:      string[];
}

export interface CompletionBlocked extends CompletionStatus {
  completed: false;
}

export type CompletionResult = CompletionSuccess | CompletionBlocked;

function actorHeaders(): Record<string, string> {
  try {
    const id   = localStorage.getItem('hhc_actor_id')   || 'demo-user';
    const role = localStorage.getItem('hhc_actor_role') || 'Compliance Officer';
    return { 'x-hhc-actor-id': id, 'x-hhc-actor-role': role };
  } catch {
    return { 'x-hhc-actor-id': 'demo-user', 'x-hhc-actor-role': 'Compliance Officer' };
  }
}

export async function fetchWorkflowCompletionStatus(
  workflow_id: string,
  args: { event_ids: string[]; required_forms?: string[]; required_evidence_kinds?: string[] }
): Promise<CompletionStatus> {
  const qs = new URLSearchParams();
  qs.set('event_ids', args.event_ids.join(','));
  if (args.required_forms?.length)          qs.set('required_forms',          args.required_forms.join(','));
  if (args.required_evidence_kinds?.length) qs.set('required_evidence_kinds', args.required_evidence_kinds.join(','));
  const res = await fetch(
    `${API_BASE}/workflows/${encodeURIComponent(workflow_id)}/completion-status?${qs.toString()}`,
    { headers: actorHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  return data as CompletionStatus;
}

/**
 * Attempts to mark the workflow complete. The backend returns HTTP 409 with the
 * blocked reasons when the gate fails (still resolves with `completed:false`).
 */
export async function completeWorkflow(
  workflow_id: string,
  body: CompletionRequest
): Promise<CompletionResult> {
  const res = await fetch(
    `${API_BASE}/workflows/${encodeURIComponent(workflow_id)}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...actorHeaders() },
      body: JSON.stringify(body),
    }
  );
  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (res.status === 409) return data as CompletionBlocked;
  if (!res.ok) throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`);
  return data as CompletionResult;
}
