/**
 * Form-submission bridge to the HHC Phase-1 evidence backend.
 *
 * Posts a JSON snapshot of form field values to `${API_BASE}/forms/submit`,
 * which writes the artifact to the prod S3 bucket, an EVIDENCE row to
 * DynamoDB, and a `FORM_SUBMITTED` audit record.
 *
 * Set `requires_signature: true` to leave the row at status=PENDING_APPROVAL
 * (the workflow-completion gate will then block the parent event until a
 * subsequent eSign + DOCUMENT_SIGNED audit fires).
 */

const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_HHC_API_BASE ||
  'https://rtllnugat0.execute-api.us-west-1.amazonaws.com';

export interface RecordFormSubmissionArgs {
  policy_id?:          string;
  workflow_id?:        string;
  event_id?:           string;
  form_id:             string;
  form_instance_id?:   string;
  fields:              Record<string, unknown>;
  requires_signature?: boolean;
  source_system?:      string;
}

export interface FormSubmissionResponse {
  evidence_id:        string;
  status:             string;
  signature_status:   string;
  s3_bucket:          string;
  s3_key:             string;
  sha256:             string;
  policy_id:          string;
  workflow_id:        string;
  event_id:           string;
  form_id:            string;
  requires_signature: boolean;
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

/**
 * Walk the given DOM root and harvest every `name`-bearing form control.
 * Falls back to `id` when `name` is missing. Used by Save-as-Evidence so we
 * never have to touch the heavy FormViewer state machine.
 */
export function harvestFormFields(root: HTMLElement): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const controls = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select'
  );
  controls.forEach((el) => {
    const key = el.name || el.id;
    if (!key) return;
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
      if (el.type === 'radio' && !el.checked) return;
      out[key] = el.checked;
    } else {
      out[key] = el.value;
    }
  });
  return out;
}

export async function recordFormSubmission(
  args: RecordFormSubmissionArgs
): Promise<FormSubmissionResponse> {
  const res = await fetch(`${API_BASE}/forms/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...actorHeaders() },
    body: JSON.stringify({
      policy_id:          args.policy_id        || undefined,
      workflow_id:        args.workflow_id      || undefined,
      event_id:           args.event_id         || undefined,
      form_id:            args.form_id,
      form_instance_id:   args.form_instance_id || undefined,
      fields:             args.fields,
      requires_signature: args.requires_signature === true,
      source_system:      args.source_system    || 'hhc',
      submitted_at:       new Date().toISOString(),
    }),
  });
  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data as { error?: string })?.error || `HTTP ${res.status}`;
    throw new Error(`hhc.forms.submit: ${msg}`);
  }
  return data as FormSubmissionResponse;
}
