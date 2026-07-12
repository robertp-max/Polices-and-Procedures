import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Eye, Send, ShieldCheck, XCircle } from 'lucide-react';
import {
  SUPPLEMENTAL_CLASSIFICATION_OPTIONS,
  SUPPLEMENTAL_DESTINATION_OPTIONS,
  SUPPLEMENTAL_LIFECYCLE_TO_ITEM,
  type SupplementalClassification,
  type SupplementalDestination,
  type SupplementalItemLifecycleStatus,
  type SupplementalLifecycleStatus,
  type SupplementalValidationStatus,
} from '@/policy/packets/contracts';

type BusyAction = 'submit' | SupplementalLifecycleStatus | null;

interface SupplementalDestinationPreview {
  destination: SupplementalDestination;
  targetArea: string;
  applicationMode: string;
  impactSummary: string;
  stagedUntilAccepted: boolean;
  canApply: boolean;
  willModifyPacket: boolean;
}

interface SupplementalStoreItem {
  intakeId: string;
  packetInstanceId: string;
  originalContent: string | null;
  originalFilename: string | null;
  submittedBy: string;
  submittedAt: string;
  classification: SupplementalClassification;
  destination: SupplementalDestination;
  validationStatus: SupplementalValidationStatus;
  reviewerId: string | null;
  appliedChangeIds: string[];
  relatedFindingIds: string[];
  relatedWorkflowIds: string[];
  relatedFormIds: string[];
  evidenceHash: string | null;
  confidentialityLevel: string;
  lifecycleStatus: SupplementalItemLifecycleStatus;
  revision: number;
  destinationPreview: SupplementalDestinationPreview;
}

interface AddInformationTabProps {
  packetInstanceId: string;
  submittedBy?: string;
  fetchImpl?: typeof fetch;
  className?: string;
  onItemChange?: (item: SupplementalStoreItem) => void;
}

interface SupplementalResponse {
  status: 'ok';
  item: SupplementalStoreItem;
  destinationPreview: SupplementalDestinationPreview;
}

const ITEM_TO_LIFECYCLE = Object.fromEntries(
  (Object.entries(SUPPLEMENTAL_LIFECYCLE_TO_ITEM) as Array<
    [SupplementalLifecycleStatus, SupplementalItemLifecycleStatus]
  >).map(([machine, item]) => [item, machine]),
) as Record<SupplementalItemLifecycleStatus, SupplementalLifecycleStatus>;

const LIFECYCLE_STEPS: SupplementalLifecycleStatus[] = [
  'RECEIVED',
  'CLASSIFIED',
  'MAPPED',
  'VALIDATED',
  'ACCEPTED',
  'APPLIED',
];

const DESTINATION_PREVIEW_DETAILS: Record<
  SupplementalDestination,
  Pick<SupplementalDestinationPreview, 'targetArea' | 'applicationMode' | 'impactSummary' | 'willModifyPacket'>
> = {
  'Executive analysis': {
    targetArea: 'Executive analysis',
    applicationMode: 'append',
    impactSummary: 'Accepted content updates executive analysis.',
    willModifyPacket: true,
  },
  'Specific finding': {
    targetArea: 'Finding register',
    applicationMode: 'link',
    impactSummary: 'Accepted content links to a finding.',
    willModifyPacket: true,
  },
  KPI: {
    targetArea: 'KPI dashboard',
    applicationMode: 'metric',
    impactSummary: 'Accepted content stages KPI recalculation.',
    willModifyPacket: true,
  },
  'Triggered workflow': {
    targetArea: 'Workflow trigger register',
    applicationMode: 'workflow',
    impactSummary: 'Accepted content links to a workflow.',
    willModifyPacket: true,
  },
  'Action item': {
    targetArea: 'Action register',
    applicationMode: 'action',
    impactSummary: 'Accepted content updates action context.',
    willModifyPacket: true,
  },
  'Specific form': {
    targetArea: 'Form pages',
    applicationMode: 'form',
    impactSummary: 'Accepted content maps to a form.',
    willModifyPacket: true,
  },
  'New attachment': {
    targetArea: 'Attachment manifest',
    applicationMode: 'attach',
    impactSummary: 'Accepted content adds attachment metadata.',
    willModifyPacket: true,
  },
  'Evidence index': {
    targetArea: 'Evidence index',
    applicationMode: 'index',
    impactSummary: 'Accepted content updates evidence indexing.',
    willModifyPacket: true,
  },
  'Confidential addendum': {
    targetArea: 'Confidential addendum',
    applicationMode: 'confidential',
    impactSummary: 'Accepted content routes to restricted output.',
    willModifyPacket: true,
  },
  'Replace/correct value': {
    targetArea: 'Corrected value register',
    applicationMode: 'replace',
    impactSummary: 'Accepted content stages a value correction.',
    willModifyPacket: true,
  },
  'Reviewer note only': {
    targetArea: 'Reviewer notes',
    applicationMode: 'note',
    impactSummary: 'Accepted content remains a reviewer note.',
    willModifyPacket: false,
  },
  'Exclude from final packet': {
    targetArea: 'Exclusion register',
    applicationMode: 'exclude',
    impactSummary: 'Accepted content records an exclusion.',
    willModifyPacket: false,
  },
};

function buildLocalDestinationPreview(
  destination: SupplementalDestination,
  lifecycleStatus: SupplementalItemLifecycleStatus,
): SupplementalDestinationPreview {
  const detail = DESTINATION_PREVIEW_DETAILS[destination];
  return {
    destination,
    ...detail,
    stagedUntilAccepted: !['accepted', 'applied', 'rejected'].includes(lifecycleStatus),
    canApply: lifecycleStatus === 'accepted',
  };
}

function machineStatus(status: SupplementalItemLifecycleStatus): SupplementalLifecycleStatus {
  return ITEM_TO_LIFECYCLE[status];
}

function actionForStatus(
  status: SupplementalItemLifecycleStatus,
): Array<{ label: string; toStatus: SupplementalLifecycleStatus; icon: 'check' | 'shield' | 'x' }> {
  switch (status) {
    case 'received':
      return [{ label: 'Classify', toStatus: 'CLASSIFIED', icon: 'check' }];
    case 'classified':
      return [{ label: 'Map', toStatus: 'MAPPED', icon: 'check' }];
    case 'mapped':
      return [{ label: 'Validate', toStatus: 'VALIDATED', icon: 'shield' }];
    case 'validated':
      return [
        { label: 'Accept', toStatus: 'ACCEPTED', icon: 'check' },
        { label: 'Reject', toStatus: 'REJECTED', icon: 'x' },
      ];
    case 'accepted':
      return [{ label: 'Apply', toStatus: 'APPLIED', icon: 'check' }];
    default:
      return [];
  }
}

function ActionIcon({ icon }: { icon: 'check' | 'shield' | 'x' }) {
  if (icon === 'shield') return <ShieldCheck className="h-4 w-4" aria-hidden="true" />;
  if (icon === 'x') return <XCircle className="h-4 w-4" aria-hidden="true" />;
  return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />;
}

export default function AddInformationTab({
  packetInstanceId,
  submittedBy,
  fetchImpl = fetch,
  className = '',
  onItemChange,
}: AddInformationTabProps) {
  const [originalContent, setOriginalContent] = useState('');
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [classification, setClassification] = useState<SupplementalClassification>(
    SUPPLEMENTAL_CLASSIFICATION_OPTIONS[0],
  );
  const [destination, setDestination] = useState<SupplementalDestination>(
    SUPPLEMENTAL_DESTINATION_OPTIONS[0],
  );
  const [item, setItem] = useState<SupplementalStoreItem | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(
    () => item?.destinationPreview ?? buildLocalDestinationPreview(destination, 'received'),
    [destination, item],
  );

  const actions = useMemo(() => (item ? actionForStatus(item.lifecycleStatus) : []), [item]);

  async function requestSupplemental(
    method: 'POST' | 'PATCH',
    path: string,
    body: Record<string, unknown>,
  ): Promise<SupplementalStoreItem> {
    const response = await fetchImpl(path, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json() as SupplementalResponse | { error?: { message?: string } };
    if (!response.ok || !('status' in payload) || payload.status !== 'ok') {
      const message = 'error' in payload ? payload.error?.message : undefined;
      throw new Error(message ?? `Supplemental request failed with ${response.status}`);
    }
    return payload.item;
  }

  function acceptItem(nextItem: SupplementalStoreItem): void {
    setItem(nextItem);
    setClassification(nextItem.classification);
    setDestination(nextItem.destination);
    onItemChange?.(nextItem);
  }

  async function submit(): Promise<void> {
    if (!originalContent.trim() && !originalFilename) {
      setError('Pasted content or file metadata is required.');
      return;
    }
    setBusyAction('submit');
    setError(null);
    try {
      const nextItem = await requestSupplemental(
        'POST',
        `/api/packets/${encodeURIComponent(packetInstanceId)}/supplemental-information`,
        {
          originalContent: originalContent.trim() || null,
          originalFilename,
          submittedBy,
          classification,
          destination,
        },
      );
      acceptItem(nextItem);
      setOriginalContent('');
      setOriginalFilename(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Supplemental request failed.');
    } finally {
      setBusyAction(null);
    }
  }

  async function transition(toStatus: SupplementalLifecycleStatus): Promise<void> {
    if (!item) return;
    setBusyAction(toStatus);
    setError(null);
    const body: Record<string, unknown> = {
      expectedRevision: item.revision,
      lifecycleStatus: toStatus,
    };
    if (toStatus === 'CLASSIFIED') body.classification = classification;
    if (toStatus === 'MAPPED') body.destination = destination;
    if (toStatus === 'VALIDATED') body.validationStatus = 'validated';
    if (toStatus === 'APPLIED') {
      body.appliedChangeIds = [`supplemental:${item.intakeId}:${item.destination}`];
    }

    try {
      const nextItem = await requestSupplemental(
        'PATCH',
        `/api/packets/${encodeURIComponent(packetInstanceId)}/supplemental-information/${encodeURIComponent(item.intakeId)}`,
        body,
      );
      acceptItem(nextItem);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Supplemental request failed.');
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className={`grid gap-lg xl:grid-cols-[minmax(0,1fr)_360px] ${className}`}>
      <div className="flex flex-col gap-md">
        <div className="grid gap-sm md:grid-cols-2">
          <label className="grid gap-xs text-sm font-semibold text-ink">
            Classification
            <select
              value={classification}
              onChange={(event) => setClassification(event.target.value as SupplementalClassification)}
              className="h-10 rounded-md border border-hairline bg-white px-sm text-sm font-normal text-ink focus-visible:outline-none focus-visible:shadow-focus"
            >
              {SUPPLEMENTAL_CLASSIFICATION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-xs text-sm font-semibold text-ink">
            Destination
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value as SupplementalDestination)}
              className="h-10 rounded-md border border-hairline bg-white px-sm text-sm font-normal text-ink focus-visible:outline-none focus-visible:shadow-focus"
            >
              {SUPPLEMENTAL_DESTINATION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-xs text-sm font-semibold text-ink">
          Supplemental information
          <textarea
            value={originalContent}
            onChange={(event) => setOriginalContent(event.target.value)}
            rows={8}
            className="min-h-40 resize-y rounded-md border border-hairline bg-white p-sm text-sm font-normal leading-6 text-ink focus-visible:outline-none focus-visible:shadow-focus"
          />
        </label>

        <div className="flex flex-wrap items-center gap-sm">
          <label className="inline-flex h-10 cursor-pointer items-center gap-xs rounded-md border border-hairline bg-surface-glass px-sm text-sm font-semibold text-ink hover:bg-surface-hover">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            File metadata
            <input
              type="file"
              className="sr-only"
              onChange={(event) => setOriginalFilename(event.target.files?.[0]?.name ?? null)}
            />
          </label>
          {originalFilename ? (
            <span className="rounded-md border border-hairline bg-white px-sm py-xs text-sm text-muted">
              {originalFilename}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busyAction !== null}
            className="inline-flex h-10 items-center gap-xs rounded-md bg-brand-teal px-md text-sm font-semibold text-white hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Submit
          </button>
        </div>

        {item ? (
          <div className="grid gap-sm border-t border-hairline pt-md">
            <div className="flex flex-wrap gap-xs">
              {LIFECYCLE_STEPS.map((step) => {
                const active = machineStatus(item.lifecycleStatus) === step;
                return (
                  <span
                    key={step}
                    className={[
                      'rounded-md border px-sm py-xs text-xs font-semibold',
                      active
                        ? 'border-brand-teal bg-brand-teal/10 text-brand-teal-deep'
                        : 'border-hairline bg-surface-glass text-muted',
                    ].join(' ')}
                  >
                    {step}
                  </span>
                );
              })}
              {item.lifecycleStatus === 'rejected' ? (
                <span className="rounded-md border border-rose-200 bg-rose-50 px-sm py-xs text-xs font-semibold text-rose-800">
                  REJECTED
                </span>
              ) : null}
            </div>

            {actions.length > 0 ? (
              <div className="flex flex-wrap gap-sm">
                {actions.map((action) => (
                  <button
                    key={action.toStatus}
                    type="button"
                    title={`${action.label} supplemental information`}
                    onClick={() => void transition(action.toStatus)}
                    disabled={busyAction !== null}
                    className="inline-flex h-10 items-center gap-xs rounded-md border border-hairline bg-white px-md text-sm font-semibold text-ink hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ActionIcon icon={action.icon} />
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-md py-sm text-sm text-rose-900">
            {error}
          </div>
        ) : null}
      </div>

      <aside className="flex flex-col gap-sm rounded-md border border-hairline bg-surface-glass p-md">
        <div className="flex items-center gap-xs text-sm font-semibold text-ink">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Destination preview
        </div>
        <div className="grid gap-xs text-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Target</div>
          <div className="font-semibold text-ink">{preview.targetArea}</div>
        </div>
        <div className="grid gap-xs text-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Mode</div>
          <div className="font-semibold text-ink">{preview.applicationMode}</div>
        </div>
        <p className="text-sm leading-6 text-muted">{preview.impactSummary}</p>
        <div className="flex flex-wrap gap-xs pt-xs">
          <span className="rounded-md border border-hairline bg-white px-sm py-xs text-xs font-semibold text-muted">
            {preview.stagedUntilAccepted ? 'STAGED' : 'DECIDED'}
          </span>
          <span className="rounded-md border border-hairline bg-white px-sm py-xs text-xs font-semibold text-muted">
            {preview.willModifyPacket ? 'PACKET OUTPUT' : 'NO OUTPUT CHANGE'}
          </span>
          {preview.canApply ? (
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-sm py-xs text-xs font-semibold text-emerald-800">
              READY
            </span>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
