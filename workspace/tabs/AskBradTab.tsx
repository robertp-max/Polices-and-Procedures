import { useState } from 'react';

const PROPOSED_PATCH_FIELDS = [
  'requestedChange',
  'existingContent',
  'proposedContent',
  'reason',
  'sources',
  'pagesAffected',
  'kpisAffected',
  'findingsAffected',
  'workflowsAffected',
  'formsAffected',
  'approvalsSignaturesAffected',
  'validationEffect',
  'regenerationRequirement',
] as const;

type ProposedPatchField = (typeof PROPOSED_PATCH_FIELDS)[number];
type ProposedPatch = Record<ProposedPatchField, unknown>;

interface BradProposalResponse {
  proposalId: string;
  proposedPatch: Partial<ProposedPatch>;
  applyEndpoint: string;
  packetMutationApplied: boolean;
}

interface BradAcceptResponse {
  proposalId: string;
  applyEndpoint: string;
  packetMutationApplied: boolean;
}

interface PacketEditResponse {
  packet: unknown;
  appliedVia: string;
}

export interface AskBradTabProps {
  packetInstanceId: string;
  expectedRevision: number;
  defaultRequestedChange?: string;
  onPacketUpdated?: (packet: unknown) => void;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as unknown;
  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof (payload as { error?: { message?: unknown } }).error?.message === 'string'
        ? (payload as { error: { message: string } }).error.message
        : `Request failed with HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

function missingPatchFields(patch: Partial<ProposedPatch>): ProposedPatchField[] {
  return PROPOSED_PATCH_FIELDS.filter((field) => !Object.prototype.hasOwnProperty.call(patch, field));
}

export default function AskBradTab({
  packetInstanceId,
  expectedRevision,
  defaultRequestedChange = '',
  onPacketUpdated,
}: AskBradTabProps) {
  const [requestedChange, setRequestedChange] = useState(defaultRequestedChange);
  const [proposedContent, setProposedContent] = useState('');
  const [proposal, setProposal] = useState<BradProposalResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function propose() {
    setBusy(true);
    setError(null);
    try {
      const response = await postJson<BradProposalResponse>(
        `/api/packets/${packetInstanceId}/brad/propose`,
        {
          requestedChange,
          proposedContent,
          editPatch: { warningIds: [`brad-review-${Date.now()}`] },
        },
      );
      const missing = missingPatchFields(response.proposedPatch);
      if (response.packetMutationApplied || missing.length > 0) {
        throw new Error('Brad returned an invalid packet proposal.');
      }
      setProposal(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Brad proposal failed.');
    } finally {
      setBusy(false);
    }
  }

  async function acceptAndApply() {
    if (!proposal) return;
    setBusy(true);
    setError(null);
    try {
      const accepted = await postJson<BradAcceptResponse>(
        `/api/packets/${packetInstanceId}/brad/proposals/${proposal.proposalId}/accept`,
        {},
      );
      if (accepted.packetMutationApplied) {
        throw new Error('Brad accept unexpectedly changed the packet.');
      }
      const edited = await postJson<PacketEditResponse>(accepted.applyEndpoint, {
        expectedRevision,
        bradProposalId: accepted.proposalId,
        reason: 'Human accepted Brad packet proposal.',
      });
      if (edited.appliedVia !== accepted.applyEndpoint) {
        throw new Error('Brad edit was not applied through the governed edit endpoint.');
      }
      onPacketUpdated?.(edited.packet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Brad edit failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        Requested change
        <textarea
          value={requestedChange}
          onChange={(event) => setRequestedChange(event.target.value)}
          className="min-h-24 rounded-md border border-hairline bg-surface px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        Proposed content
        <textarea
          value={proposedContent}
          onChange={(event) => setProposedContent(event.target.value)}
          className="min-h-24 rounded-md border border-hairline bg-surface px-3 py-2 text-sm"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !requestedChange.trim() || !proposedContent.trim()}
          onClick={propose}
          className="rounded-md border border-hairline px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Propose
        </button>
        <button
          type="button"
          disabled={busy || !proposal}
          onClick={acceptAndApply}
          className="rounded-md border border-hairline px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Accept
        </button>
      </div>
      {proposal ? (
        <pre className="max-h-64 overflow-auto rounded-md border border-hairline bg-surface-glass p-3 text-xs">
          {JSON.stringify(proposal.proposedPatch, null, 2)}
        </pre>
      ) : null}
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {error}
        </div>
      ) : null}
    </section>
  );
}
