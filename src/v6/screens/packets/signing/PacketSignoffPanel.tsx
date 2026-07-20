/**
 * Packet Studio "Send for signature" step.
 *
 * Deliberately reuses the SAME eCIgn path DefenCIble uses (see
 * Defensible2Studio `EcignWorkspacePanel`): create a shared eCIgn form instance
 * via `ecignApi.createInstance`, then link each signer into the existing
 * `/forms/:title/esign` signing workspace. No bespoke signing UI, no parallel
 * envelope store — the packet lands in the same eCIgn instance list, signatures
 * flow through the same disclose → verify → review → sign → lock state machine,
 * and the same audit ledger records every action.
 */
import { useState } from 'react';
import { ecignApi, EcignApiError } from '@/policy/ecign/api';
import type { AuthorityDomain, ProductionSignerTier } from '@/policy/ecign/signerAuthority';
import type { RequiredSignerPayload } from '@/policy/ecign/signerAuthority';

export interface PacketSignoffPanelProps {
  readonly packetTitle: string;
  readonly packetTemplateId: string;
  readonly packetInstanceId: string;
  readonly workflowInstanceId: string;
  readonly eventInstanceId: string;
  /** Required signing capacities in order (e.g. Administrator, Clinical Manager, QAPI Chair). */
  readonly signerCapacities: readonly string[];
  readonly onBack?: () => void;
}

/** Map a signing capacity label to the authority domain that owns it. */
function domainForCapacity(capacity: string): AuthorityDomain {
  const c = capacity.toLowerCase();
  if (c.includes('qapi')) return 'qapi';
  if (c.includes('clinical') || c.includes('don') || c.includes('nurse')) return 'clinical';
  if (c.includes('compliance')) return 'compliance';
  if (c.includes('administrator') || c.includes('governing') || c.includes('board')) return 'governance';
  return 'operations';
}

/**
 * Build the eCIgn required-signer payloads from the packet's ordered capacities.
 * min_tier is left at 1 so the signing workspace's authority gate resolves the
 * real signer's tier rather than pre-blocking; the capacity/domain still bind the
 * slot to the correct role (FR-026).
 */
function buildRequiredSigners(capacities: readonly string[]): RequiredSignerPayload[] {
  return capacities.map((capacity, index) => {
    const tier: ProductionSignerTier = 3;
    return {
      role: capacity,
      tier,
      field_id: `packet-signature-${index + 1}`,
      slot_order: index + 1,
      slot_purpose: capacity,
      required_domain: domainForCapacity(capacity),
      allowed_roles: [capacity],
      min_tier: 1,
      required: true,
      sequential: true,
      can_delegate: false,
      requires_same_domain: true,
      blocks_self_approval: true,
      required_for_final_package: true,
    } satisfies RequiredSignerPayload;
  });
}

type SendState =
  | { phase: 'idle' }
  | { phase: 'sending' }
  | { phase: 'sent'; instanceId: string }
  | { phase: 'error'; message: string };

export function PacketSignoffPanel({
  packetTitle,
  packetTemplateId,
  packetInstanceId,
  workflowInstanceId,
  eventInstanceId,
  signerCapacities,
  onBack,
}: PacketSignoffPanelProps) {
  const [state, setState] = useState<SendState>({ phase: 'idle' });

  const capacities = signerCapacities.length > 0 ? signerCapacities : ['Authorized Approver'];

  async function handleSend() {
    setState({ phase: 'sending' });
    try {
      const result = await ecignApi.createInstance({
        form_id: packetTemplateId,
        document_version_id: `${packetInstanceId}:v1`,
        required_signers: buildRequiredSigners(capacities),
        form_instance_id: packetInstanceId,
        workflow_instance_id: workflowInstanceId,
        event_id: eventInstanceId,
      });
      setState({ phase: 'sent', instanceId: result.instance_id });
    } catch (error) {
      const message =
        error instanceof EcignApiError
          ? `${error.code}: ${error.message}`
          : error instanceof Error
            ? error.message
            : 'Failed to send packet for signature.';
      setState({ phase: 'error', message });
    }
  }

  const esignHref =
    state.phase === 'sent'
      ? `/forms/${encodeURIComponent(packetTitle)}/esign?form_instance_id=${encodeURIComponent(state.instanceId)}`
      : null;

  return (
    <section className="grid gap-md rounded-md border border-hairline bg-surface p-lg" aria-label="Send for signature">
      <header className="grid gap-xs">
        <h2 className="text-lg font-semibold text-brand-teal">Send for signature</h2>
        <p className="text-sm text-muted">
          This routes the packet into the shared eCIgn signing workspace. Each required signer
          reviews the packet, verifies identity, and applies their signature; the signed package
          and audit trail are recorded automatically.
        </p>
      </header>

      <div className="grid gap-xs rounded-md border border-hairline bg-surface-glass p-md">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Required signers (in order)</span>
        <ol className="grid gap-xs">
          {capacities.map((capacity, index) => (
            <li key={capacity} className="flex items-center gap-sm text-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-teal text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="font-medium">{capacity}</span>
              <span className="text-xs text-muted">· {domainForCapacity(capacity)}</span>
            </li>
          ))}
        </ol>
      </div>

      {state.phase === 'error' ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-md py-sm text-sm text-amber-900" role="alert">
          {state.message}
        </div>
      ) : null}

      {state.phase === 'sent' && esignHref ? (
        <div className="grid gap-sm rounded-md border border-emerald-200 bg-emerald-50 p-md">
          <p className="text-sm font-medium text-emerald-900">
            Packet sent for signature. Signature instance <code className="font-mono">{state.instanceId}</code> is now
            in the eCIgn workspace.
          </p>
          <div className="flex flex-wrap gap-sm">
            <a
              href={esignHref}
              className="min-h-tap w-fit rounded-md bg-brand-teal px-md py-sm text-sm font-semibold text-white hover:opacity-90"
            >
              Review &amp; sign
            </a>
            <a
              href="/forms"
              className="min-h-tap w-fit rounded-md border border-hairline px-md py-sm text-sm font-semibold text-brand-teal hover:bg-surface-hover"
            >
              Track signatures
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-sm">
          <button
            type="button"
            className="min-h-tap w-fit rounded-md border border-hairline bg-brand-teal px-md py-sm text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            onClick={handleSend}
            disabled={state.phase === 'sending'}
          >
            {state.phase === 'sending' ? 'Sending…' : 'Send for signature'}
          </button>
          {onBack ? (
            <button
              type="button"
              className="min-h-tap w-fit rounded-md border border-hairline px-md py-sm text-sm font-semibold text-brand-teal hover:bg-surface-hover"
              onClick={onBack}
            >
              Back to workspace
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default PacketSignoffPanel;
