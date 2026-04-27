/**
 * Compliance event evaluator. Triggered on document_locked. Maps the form
 * instance to a compliance object and records a state transition.
 */
import { ulid } from './hashChain.js';
import { appendAudit } from './hashChain.js';
import { store, type FormInstanceRow, type SignatureRow } from './store.js';

interface RuleContext {
  instance: FormInstanceRow;
  signatures: SignatureRow[];
}

interface Rule {
  matches(form_id: string): boolean;
  objectKind: string;
  derive(ctx: RuleContext): { id: string; state_before: string; state_after: string };
  governing(ctx: RuleContext): {
    policy_id?: string; workflow_instance_id?: string;
    event_id?: string; document_version_id?: string;
  };
}

const RULES: Rule[] = [
  {
    matches: (id) => id.startsWith('CL-POC') || id === 'EN-FM-485',
    objectKind: 'plan_of_care',
    derive: () => ({ id: 'poc', state_before: 'incomplete', state_after: 'billable' }),
    governing: ({ instance }) => ({
      policy_id: 'CL-CC-001',
      workflow_instance_id: instance.workflow_instance_id,
      document_version_id: instance.document_version_id,
    }),
  },
  {
    matches: (id) => id.startsWith('EN-CM') || id.startsWith('CO-CP'),
    objectKind: 'policy_ack',
    derive: ({ instance, signatures }) => ({
      id: `${instance.form_id}::${signatures[0]?.signer_user_id ?? 'unknown'}`,
      state_before: 'pending_employee_ack',
      state_after: 'acknowledged',
    }),
    governing: ({ instance }) => ({
      policy_id: instance.form_id,
      document_version_id: instance.document_version_id,
    }),
  },
  {
    matches: (id) => id.startsWith('QAPI') || id === 'EN-FM-033',
    objectKind: 'qapi_minutes',
    derive: ({ instance }) => ({
      id: instance.event_id ?? instance.instance_id,
      state_before: 'event_open',
      state_after: 'closed',
    }),
    governing: ({ instance }) => ({
      policy_id: 'CO-CP-001',
      event_id: instance.event_id,
      document_version_id: instance.document_version_id,
    }),
  },
  {
    matches: (id) => id.startsWith('EN-LC') || id.startsWith('EN-TG'),
    objectKind: 'hr_doc',
    derive: ({ instance, signatures }) => ({
      id: `${instance.form_id}::${signatures[0]?.signer_user_id ?? 'unknown'}`,
      state_before: 'incomplete_personnel_file',
      state_after: 'signed',
    }),
    governing: ({ instance }) => ({
      policy_id: instance.form_id,
      document_version_id: instance.document_version_id,
    }),
  },
];

export async function evaluateOnLock(instance: FormInstanceRow): Promise<void> {
  const sigs = await store.listSignatures(instance.instance_id);
  const rule = RULES.find(r => r.matches(instance.form_id));
  if (!rule) return; // generic form — no compliance state machine

  const der = rule.derive({ instance, signatures: sigs });
  const transition_id = ulid();
  const dependencies = [
    { kind: 'consent',       ref: instance.consent_id ?? '',          ok: !!instance.consent_id },
    { kind: 'identity',      ref: instance.mfa_verified_at ?? 'session', ok: true },
    { kind: 'review_ack',    ref: instance.review_acknowledged_at ?? '', ok: !!instance.review_acknowledged_at },
    { kind: 'document_hash', ref: instance.document_hash ?? '',       ok: !!instance.document_hash },
    { kind: 'all_required_signed', ref: String(sigs.length),          ok: sigs.length >= instance.required_signers.length },
  ];
  const allDepsOk = dependencies.every(d => d.ok);
  const state_after = allDepsOk ? der.state_after : der.state_before;

  await store.appendCompliance({
    transition_id,
    object_kind: rule.objectKind,
    object_id: der.id,
    state_before: der.state_before,
    state_after,
    trigger_signature: sigs[sigs.length - 1]?.signature_id,
    governing: rule.governing({ instance, signatures: sigs }),
    dependencies,
    occurred_at_utc: new Date().toISOString(),
  });

  await appendAudit({
    actor: { user_id: 'system', name: 'eCIgn', role: 'system', email: 'system@ecign',
      auth_method: 'system' },
    network: { ip: '127.0.0.1', user_agent: 'eCIgn/server' },
    subject: { kind: 'compliance_object', id: der.id,
      document_version_id: instance.document_version_id,
      document_hash: instance.document_hash },
    action: 'compliance.transitioned',
    payload: {
      object_kind: rule.objectKind,
      state_before: der.state_before,
      state_after,
      transition_id,
      dependencies_verified: dependencies,
    },
  });
}

export async function currentState(kind: string, id: string): Promise<{
  state: string; history: Awaited<ReturnType<typeof store.listComplianceTransitions>>;
}> {
  const history = await store.listComplianceTransitions(kind, id);
  history.sort((a, b) => a.occurred_at_utc.localeCompare(b.occurred_at_utc));
  const state = history.length ? history[history.length - 1].state_after : 'unknown';
  return { state, history };
}
