import { useMemo, useState } from 'react';
import { Bot, Check, CopyCheck, FilePenLine, Save, Sparkles, X } from 'lucide-react';
import type { PacketInstance } from '@/policy/packets/contracts';

type PacketWithRevision = PacketInstance & { revision: number };

type BradPatchAction = 'accept' | 'accept-related' | 'modify' | 'save-as-note';

interface BradPatchMetadata {
  object_id: string;
  write_status: string;
  immutable_audit_hash: string;
  generated_at: string;
}

interface BradProposedPatch {
  requestedChange: string;
  existingContent: unknown;
  proposedContent: unknown;
  reason: string;
  sources: unknown[];
  pagesAffected: string[];
  kpisAffected: string[];
  findingsAffected: string[];
  workflowsAffected: string[];
  formsAffected: string[];
  approvalsSignaturesAffected: string[];
  validationEffect: string;
  regenerationRequirement: string;
}

interface BradPatchContent {
  proposedPatch: BradProposedPatch;
  editPatch: Record<string, unknown> | null;
  applyEndpoint: string;
}

interface BradPatchProposal {
  metadata: BradPatchMetadata;
  content: BradPatchContent;
}

interface ProposalResponse {
  status: 'ok';
  proposal: BradPatchProposal;
  packetEffectApplied: false;
}

interface AcceptResponse {
  status: 'ok' | 'accepted';
  action: BradPatchAction;
  packet?: PacketWithRevision;
  proposal: BradPatchProposal;
  packetEffectApplied: boolean;
}

interface RejectResponse {
  status: 'ok' | 'rejected';
  action: 'reject';
  proposal: BradPatchProposal;
  packetEffectApplied: false;
}

export interface AskBradTabProps {
  packetInstanceId: string;
  expectedRevision: number;
  fetchImpl?: typeof fetch;
  onPacketUpdated?: (packet: PacketWithRevision) => void;
}

const PATCH_FIELDS = [
  ['Requested change', 'requestedChange'],
  ['Existing content', 'existingContent'],
  ['Proposed content', 'proposedContent'],
  ['Reason', 'reason'],
  ['Sources', 'sources'],
  ['Pages affected', 'pagesAffected'],
  ['KPIs affected', 'kpisAffected'],
  ['Findings affected', 'findingsAffected'],
  ['Workflows affected', 'workflowsAffected'],
  ['Forms affected', 'formsAffected'],
  ['Approvals/signatures affected', 'approvalsSignaturesAffected'],
  ['Validation effect', 'validationEffect'],
  ['Regeneration requirement', 'regenerationRequirement'],
] as const satisfies readonly (readonly [string, keyof BradProposedPatch])[];

const buttonBase =
  'inline-flex h-10 items-center justify-center gap-xs rounded-md border px-md text-sm font-medium transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50';

function apiPath(packetInstanceId: string, suffix: string): string {
  return `/api/packets/${encodeURIComponent(packetInstanceId)}/brad${suffix}`;
}

function formatValue(value: BradProposedPatch[keyof BradProposedPatch]): string {
  if (Array.isArray(value)) {
    return value.every((item) => typeof item === 'string') ? value.join(', ') : JSON.stringify(value, null, 2);
  }
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const parsed = text ? JSON.parse(text) as unknown : {};
  if (!response.ok) {
    const message = typeof parsed === 'object' && parsed && 'error' in parsed
      ? JSON.stringify((parsed as { error: unknown }).error)
      : `Brad packet request failed with ${response.status}`;
    throw new Error(message);
  }
  return parsed as T;
}

function parseModifiedPatch(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Modified patch must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

export default function AskBradTab({
  packetInstanceId,
  expectedRevision,
  fetchImpl = fetch,
  onPacketUpdated,
}: AskBradTabProps) {
  const [requestText, setRequestText] = useState('');
  const [packetRevision, setPacketRevision] = useState(expectedRevision);
  const [proposal, setProposal] = useState<BradPatchProposal | null>(null);
  const [modifiedPatchText, setModifiedPatchText] = useState('');
  const [modifyOpen, setModifyOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const patchJson = useMemo(
    () => proposal ? JSON.stringify(proposal.content.editPatch ?? {}, null, 2) : '',
    [proposal],
  );

  async function propose(): Promise<void> {
    const requestedChange = requestText.trim();
    if (!requestedChange) {
      setErrorText('Enter a requested change.');
      return;
    }
    setBusy(true);
    setErrorText(null);
    try {
      const response = await fetchImpl(apiPath(packetInstanceId, '/propose'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ requestedChange }),
      });
      const body = await parseJsonResponse<ProposalResponse>(response);
      setProposal(body.proposal);
      setModifiedPatchText(JSON.stringify(body.proposal.content.editPatch ?? {}, null, 2));
      setStatusText(body.packetEffectApplied ? 'Applied' : 'Proposed');
      setModifyOpen(false);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Brad proposal failed.');
    } finally {
      setBusy(false);
    }
  }

  async function accept(action: BradPatchAction): Promise<void> {
    if (!proposal) return;
    setBusy(true);
    setErrorText(null);
    try {
      const payload: Record<string, unknown> = { expectedRevision: packetRevision, action };
      if (action === 'modify') {
        payload.modifiedPatch = parseModifiedPatch(modifiedPatchText);
      }
      const response = await fetchImpl(
        apiPath(packetInstanceId, `/proposals/${encodeURIComponent(proposal.metadata.object_id)}/accept`),
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const body = await parseJsonResponse<AcceptResponse>(response);
      setProposal(body.proposal);
      if (body.packet) setPacketRevision(body.packet.revision);
      setStatusText(body.packetEffectApplied ? 'Applied' : 'Proposed');
      setModifyOpen(false);
      if (body.packet) onPacketUpdated?.(body.packet);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Brad patch acceptance failed.');
    } finally {
      setBusy(false);
    }
  }

  async function reject(): Promise<void> {
    if (!proposal) return;
    setBusy(true);
    setErrorText(null);
    try {
      const response = await fetchImpl(
        apiPath(packetInstanceId, `/proposals/${encodeURIComponent(proposal.metadata.object_id)}/reject`),
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ reason: requestText.trim() || undefined }),
        },
      );
      const body = await parseJsonResponse<RejectResponse>(response);
      setProposal(body.proposal);
      setStatusText(body.packetEffectApplied ? 'Applied' : 'Rejected');
      setModifyOpen(false);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Brad patch rejection failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-lg text-ink" aria-labelledby="ask-brad-tab-title">
      <div className="flex flex-col gap-md border-b border-hairline pb-lg lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-sm text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            <Bot className="h-4 w-4" aria-hidden />
            Brad
          </div>
          <h2 id="ask-brad-tab-title" className="mt-xs text-2xl font-semibold tracking-normal text-ink">
            Ask Brad
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-sm text-xs">
          <span className="rounded-md border border-hairline bg-surface-glass px-sm py-xs text-muted">
            Revision {packetRevision}
          </span>
          {proposal ? (
            <span className="rounded-md border border-brand-teal/25 bg-brand-teal/10 px-sm py-xs text-brand-teal">
              {proposal.metadata.write_status}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-md lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <div className="grid gap-sm">
          <label htmlFor="brad-patch-request" className="text-sm font-medium text-ink">
            Requested change
          </label>
          <textarea
            id="brad-patch-request"
            rows={8}
            value={requestText}
            onChange={(event) => setRequestText(event.target.value)}
            className="min-h-40 rounded-md border border-hairline bg-surface px-md py-sm text-sm leading-6 text-ink outline-none transition focus:border-brand-teal focus:shadow-focus"
          />
          <button
            type="button"
            className={`${buttonBase} border-brand-teal bg-brand-teal text-on-brand hover:bg-brand-teal-deep`}
            onClick={() => void propose()}
            disabled={busy}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Request Patch
          </button>
          {errorText ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-md py-sm text-sm text-rose-900">
              {errorText}
            </div>
          ) : null}
          {statusText ? (
            <div className="rounded-md border border-hairline bg-surface-glass px-md py-sm text-sm text-muted">
              {statusText}
            </div>
          ) : null}
        </div>

        {proposal ? (
          <div className="grid gap-md">
            <div className="rounded-md border border-hairline bg-surface-glass p-md">
              <div className="flex flex-wrap items-center justify-between gap-sm border-b border-hairline pb-sm">
                <div>
                  <div className="text-sm font-semibold text-ink">Proposed patch</div>
                  <div className="mt-1 text-xs text-muted">{proposal.metadata.object_id}</div>
                </div>
                <div className="text-xs text-muted">sha256 {proposal.metadata.immutable_audit_hash.slice(0, 16)}</div>
              </div>
              <dl className="mt-md grid gap-sm">
                {PATCH_FIELDS.map(([label, key]) => (
                  <div className="grid gap-xs rounded-md border border-hairline bg-surface px-md py-sm" key={key}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</dt>
                    <dd className="whitespace-pre-wrap text-sm leading-6 text-ink">{formatValue(proposal.content.proposedPatch[key])}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-md border border-hairline bg-surface-glass p-md">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div className="text-sm font-semibold text-ink">Packet patch JSON</div>
                <button
                  type="button"
                  className={`${buttonBase} border-hairline bg-surface hover:bg-surface-hover`}
                  onClick={() => {
                    setModifiedPatchText(patchJson);
                    setModifyOpen((open) => !open);
                  }}
                  disabled={busy}
                >
                  <FilePenLine className="h-4 w-4" aria-hidden />
                  Modify
                </button>
              </div>
              <pre className="mt-sm max-h-64 overflow-auto rounded-md border border-hairline bg-white p-md text-xs text-ink">
                {patchJson}
              </pre>
              {modifyOpen ? (
                <div className="mt-md grid gap-sm">
                  <label htmlFor="brad-modified-patch" className="text-sm font-medium text-ink">
                    Modified patch
                  </label>
                  <textarea
                    id="brad-modified-patch"
                    rows={7}
                    value={modifiedPatchText}
                    onChange={(event) => setModifiedPatchText(event.target.value)}
                    className="rounded-md border border-hairline bg-surface px-md py-sm font-mono text-xs leading-5 text-ink outline-none transition focus:border-brand-teal focus:shadow-focus"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-sm">
              <button
                type="button"
                className={`${buttonBase} border-brand-teal bg-brand-teal text-on-brand hover:bg-brand-teal-deep`}
                onClick={() => void accept('accept')}
                disabled={busy}
              >
                <Check className="h-4 w-4" aria-hidden />
                Accept
              </button>
              <button
                type="button"
                className={`${buttonBase} border-hairline bg-surface hover:bg-surface-hover`}
                onClick={() => void accept('accept-related')}
                disabled={busy}
              >
                <CopyCheck className="h-4 w-4" aria-hidden />
                Accept Related
              </button>
              <button
                type="button"
                className={`${buttonBase} border-hairline bg-surface hover:bg-surface-hover`}
                onClick={() => void accept('modify')}
                disabled={busy || !modifyOpen}
              >
                <FilePenLine className="h-4 w-4" aria-hidden />
                Apply Modified
              </button>
              <button
                type="button"
                className={`${buttonBase} border-hairline bg-surface hover:bg-surface-hover`}
                onClick={() => void accept('save-as-note')}
                disabled={busy}
              >
                <Save className="h-4 w-4" aria-hidden />
                Save as Note
              </button>
              <button
                type="button"
                className={`${buttonBase} border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100`}
                onClick={() => void reject()}
                disabled={busy}
              >
                <X className="h-4 w-4" aria-hidden />
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-md border border-dashed border-hairline bg-surface-glass px-lg text-center text-sm text-muted">
            No proposed patch.
          </div>
        )}
      </div>
    </section>
  );
}
