import type { ReactNode } from 'react';
import type {
  PacketInstance,
  PacketSignerTask,
  PacketValidationFinding,
  PacketValidationResult,
} from '@/policy/packets/contracts';
import {
  APPROVAL_READINESS_ACTIONS,
  DEFAULT_APPROVAL_POLICY,
  canApproveWithDocumentedException,
  type ApprovalPolicy,
  type ApprovalReadinessAction as ApprovalReadinessActionLabel,
} from '@/policy/packets/registries/approvalPolicies';
import {
  DEFAULT_SIGNATURE_POLICY,
  resolveDualCapacityDecision,
  type DualCapacityAttestationRecord,
  type SignaturePolicy,
} from '@/policy/packets/registries/signaturePolicies';

export type UnknownApprovalValue = 'unknown';

export type ApprovalReadinessActionId =
  | 'return-for-correction'
  | 'approve'
  | 'approve-with-documented-exception'
  | 'reject'
  | 'proceed-to-signer-confirmation';

export type ReadinessItemStatus =
  | 'complete'
  | 'incomplete'
  | 'missing'
  | 'unvalidated'
  | 'active'
  | 'open'
  | 'decided'
  | 'not_applicable'
  | UnknownApprovalValue;

export interface ApprovalReadinessTrackedItem {
  id: string;
  label: string;
  status: ReadinessItemStatus;
}

export interface ApprovalReadinessInput {
  packet: PacketInstance | null;
  validation?: PacketValidationResult | null;
  approvalPolicy?: ApprovalPolicy | null;
  signaturePolicy?: SignaturePolicy | null;
  missingIncompleteForms?: readonly ApprovalReadinessTrackedItem[] | null;
  missingUnvalidatedEvidence?: readonly ApprovalReadinessTrackedItem[] | null;
  openWorkflowCandidates?: readonly ApprovalReadinessTrackedItem[] | null;
  activatedWorkflows?: readonly ApprovalReadinessTrackedItem[] | null;
  outstandingDecisions?: readonly ApprovalReadinessTrackedItem[] | null;
  confidentialAddendums?: readonly ApprovalReadinessTrackedItem[] | null;
  approvers?: readonly string[] | null;
  signerTasks?: readonly PacketSignerTask[] | null;
  dualCapacityRecords?: Readonly<Record<string, DualCapacityAttestationRecord>> | null;
  pageCount?: number | null;
  hashStatus?: string | null;
  driveDestination?: string | null;
}

export interface ApprovalReadinessDisplayField {
  label: string;
  value: string;
  tone: 'normal' | 'muted' | 'warning' | 'blocked';
}

export interface ApprovalReadinessSection {
  title: string;
  fields: readonly ApprovalReadinessDisplayField[];
}

export interface ApprovalReadinessUiAction {
  id: ApprovalReadinessActionId;
  label: ApprovalReadinessActionLabel;
  enabled: boolean;
  reason: string | null;
}

export interface ApprovalReadinessModel {
  title: string;
  sections: readonly ApprovalReadinessSection[];
  actions: readonly ApprovalReadinessUiAction[];
  approvalState: 'eligible' | 'blocked' | UnknownApprovalValue;
  lockEligibility: 'eligible' | 'blocked' | UnknownApprovalValue;
  blockers: readonly string[];
  warnings: readonly string[];
}

export interface ApprovalReadinessProps extends ApprovalReadinessInput {
  onAction?: (action: ApprovalReadinessActionId, model: ApprovalReadinessModel) => void;
}

export const UNKNOWN_APPROVAL_VALUE: UnknownApprovalValue = 'unknown';

const ACTION_ID_BY_LABEL = {
  'Return for correction': 'return-for-correction',
  'Approve content': 'approve',
  'Approve with documented exception': 'approve-with-documented-exception',
  Reject: 'reject',
  'Proceed to signer confirmation': 'proceed-to-signer-confirmation',
} as const satisfies Record<ApprovalReadinessActionLabel, ApprovalReadinessActionId>;

function textValue(value: string | null | undefined): string {
  if (typeof value !== 'string') return UNKNOWN_APPROVAL_VALUE;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : UNKNOWN_APPROVAL_VALUE;
}

function numberValue(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : UNKNOWN_APPROVAL_VALUE;
}

function yesNoUnknown(value: boolean | null | undefined): string {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  return UNKNOWN_APPROVAL_VALUE;
}

function toneForValue(value: string): ApprovalReadinessDisplayField['tone'] {
  if (value === UNKNOWN_APPROVAL_VALUE) return 'muted';
  if (/block|missing|incomplete|unvalidated|no$/i.test(value)) return 'blocked';
  if (/warning|open|pending/i.test(value)) return 'warning';
  return 'normal';
}

function field(label: string, value: string): ApprovalReadinessDisplayField {
  return { label, value, tone: toneForValue(value) };
}

function itemList(items: readonly ApprovalReadinessTrackedItem[] | null | undefined): string {
  if (items === null || items === undefined) return UNKNOWN_APPROVAL_VALUE;
  if (items.length === 0) return 'none';
  return items.map((item) => `${item.label} (${item.status})`).join(', ');
}

function stringList(items: readonly string[] | null | undefined): string {
  if (items === null || items === undefined) return UNKNOWN_APPROVAL_VALUE;
  const cleaned = items.map((item) => item.trim()).filter((item) => item.length > 0);
  return cleaned.length > 0 ? cleaned.join(', ') : 'none';
}

function findingLabel(finding: PacketValidationFinding): string {
  return `${finding.code}: ${finding.message}`;
}

function blockersFrom(input: ApprovalReadinessInput): readonly string[] {
  if (input.validation) {
    return input.validation.findings
      .filter((finding) => finding.severity === 'blocker')
      .map(findingLabel);
  }
  return input.packet?.blockerIds ?? [];
}

function warningsFrom(input: ApprovalReadinessInput): readonly string[] {
  if (input.validation) {
    return input.validation.findings
      .filter((finding) => finding.severity === 'warning')
      .map(findingLabel);
  }
  return input.packet?.warningIds ?? [];
}

function approvalState(input: ApprovalReadinessInput): ApprovalReadinessModel['approvalState'] {
  if (input.validation) return input.validation.approvalEligible ? 'eligible' : 'blocked';
  if (input.packet) return input.packet.blockerIds.length === 0 ? 'eligible' : 'blocked';
  return UNKNOWN_APPROVAL_VALUE;
}

function lockEligibility(input: ApprovalReadinessInput): ApprovalReadinessModel['lockEligibility'] {
  if (input.validation) return input.validation.lockEligible ? 'eligible' : 'blocked';
  return UNKNOWN_APPROVAL_VALUE;
}

function reportingPeriod(packet: PacketInstance | null): string {
  const start = textValue(packet?.reportingPeriodStart);
  const end = textValue(packet?.reportingPeriodEnd);
  if (start === UNKNOWN_APPROVAL_VALUE && end === UNKNOWN_APPROVAL_VALUE) {
    return UNKNOWN_APPROVAL_VALUE;
  }
  return `${start} -> ${end}`;
}

function taskRecord(task: PacketSignerTask): DualCapacityAttestationRecord | null {
  if (task.dualCapacities === null) return null;
  return {
    dualCapacities: task.dualCapacities,
    attestationEvidencePresent: task.dualCapacityRuleId !== null,
    dualCapacityRuleId: task.dualCapacityRuleId,
  };
}

function dualCapacityEligibility(input: ApprovalReadinessInput): string {
  const tasks = input.signerTasks;
  if (tasks === null || tasks === undefined) return UNKNOWN_APPROVAL_VALUE;
  const dualTasks = tasks.filter((task) => task.dualCapacities !== null);
  if (dualTasks.length === 0) return 'none requested';
  const policy = input.signaturePolicy ?? DEFAULT_SIGNATURE_POLICY;
  const records = input.dualCapacityRecords ?? {};
  return dualTasks.map((task) => {
    const capacities = task.dualCapacities;
    if (capacities === null) return `${task.requiredCapacity}: deny`;
    const record = records[task.signerTaskId] ?? taskRecord(task);
    const decision = resolveDualCapacityDecision(policy, capacities[0], capacities[1], record);
    return `${capacities[0]} + ${capacities[1]}: ${decision}`;
  }).join(', ');
}

function approverSignerSummary(input: ApprovalReadinessInput): string {
  const approvers = input.approvers ?? input.approvalPolicy?.requiredApproverRoles ?? null;
  const signaturePolicy = input.signaturePolicy ?? DEFAULT_SIGNATURE_POLICY;
  const signers = signaturePolicy.requiredCapacities.map((item) => item.capacity);
  return `Approvers: ${stringList(approvers)}; Signers: ${stringList(signers)}`;
}

function hashStatus(input: ApprovalReadinessInput): string {
  if (input.hashStatus !== undefined && input.hashStatus !== null) return textValue(input.hashStatus);
  if (input.packet?.contentHash) return 'hash present';
  if (input.packet) return 'missing hash';
  return UNKNOWN_APPROVAL_VALUE;
}

function driveDestination(input: ApprovalReadinessInput): string {
  return textValue(input.driveDestination ?? input.packet?.driveFolderUrl ?? null);
}

function actionReason(input: {
  id: ApprovalReadinessActionId;
  state: ApprovalReadinessModel['approvalState'];
  packet: PacketInstance | null;
  approvalPolicy: ApprovalPolicy;
}): string | null {
  if (!input.packet) return 'Packet identity is unknown.';
  if (
    (input.id === 'approve' ||
      input.id === 'approve-with-documented-exception' ||
      input.id === 'proceed-to-signer-confirmation') &&
    input.state === 'blocked'
  ) {
    return 'Approval is blocked by unresolved validation blockers.';
  }
  if (
    (input.id === 'approve' || input.id === 'approve-with-documented-exception') &&
    input.packet.status !== 'READY_FOR_APPROVAL'
  ) {
    return 'Packet must be Ready for approval.';
  }
  if (
    input.id === 'approve-with-documented-exception' &&
    !canApproveWithDocumentedException(input.approvalPolicy)
  ) {
    return 'Approval policy does not permit Approve with documented exception.';
  }
  if (
    input.id === 'proceed-to-signer-confirmation' &&
    input.packet.status !== 'APPROVED_FOR_SIGNATURE'
  ) {
    return 'Packet must be Approved for signature.';
  }
  if (input.state === UNKNOWN_APPROVAL_VALUE && input.id !== 'return-for-correction' && input.id !== 'reject') {
    return 'Approval readiness is unknown.';
  }
  return null;
}

function buildActions(
  input: ApprovalReadinessInput,
  state: ApprovalReadinessModel['approvalState'],
): readonly ApprovalReadinessUiAction[] {
  const policy = input.approvalPolicy ?? DEFAULT_APPROVAL_POLICY;
  return APPROVAL_READINESS_ACTIONS.map((label) => {
    const id = ACTION_ID_BY_LABEL[label];
    const reason = actionReason({ id, state, packet: input.packet, approvalPolicy: policy });
    return {
      id,
      label,
      enabled: reason === null,
      reason,
    };
  });
}

export function deriveApprovalReadinessModel(input: ApprovalReadinessInput): ApprovalReadinessModel {
  const state = approvalState(input);
  const lockState = lockEligibility(input);
  const blockers = blockersFrom(input);
  const warnings = warningsFrom(input);
  const packet = input.packet;
  const title = packet
    ? `${packet.packetId} v${packet.packetVersion}`
    : 'Approval readiness';
  const sections: ApprovalReadinessSection[] = [
    {
      title: 'Packet',
      fields: [
        field('Packet identity', textValue(packet?.packetId ?? packet?.packetInstanceId ?? null)),
        field('Packet version', numberValue(packet?.packetVersion)),
        field('Event/workflow', packet
          ? `${textValue(packet.eventInstanceId)} / ${textValue(packet.workflowInstanceId)}`
          : UNKNOWN_APPROVAL_VALUE),
        field('Reporting period', reportingPeriod(packet)),
        field('Page count', numberValue(input.pageCount)),
        field('Hash status', hashStatus(input)),
        field('Drive destination', driveDestination(input)),
      ],
    },
    {
      title: 'Readiness',
      fields: [
        field('Blockers', blockers.length > 0 ? blockers.join(', ') : 'none'),
        field('Warnings', warnings.length > 0 ? warnings.join(', ') : 'none'),
        field('Missing/incomplete forms', itemList(input.missingIncompleteForms)),
        field('Missing/unvalidated evidence', itemList(input.missingUnvalidatedEvidence)),
        field('Open workflow candidates', itemList(input.openWorkflowCandidates)),
        field('Activated workflows', itemList(input.activatedWorkflows)),
        field('Outstanding decisions', itemList(input.outstandingDecisions)),
        field('Confidential addendums', itemList(input.confidentialAddendums)),
      ],
    },
    {
      title: 'Approval And Signature',
      fields: [
        field('Approvers/signers', approverSignerSummary(input)),
        field('Dual-capacity eligibility', dualCapacityEligibility(input)),
        field('Approval eligible', state),
        field('Lock eligibility', lockState),
        field('Content hash present', yesNoUnknown(packet ? packet.contentHash !== null : null)),
      ],
    },
  ];
  return {
    title,
    sections,
    actions: buildActions(input, state),
    approvalState: state,
    lockEligibility: lockState,
    blockers,
    warnings,
  };
}

function FieldRow({ field: displayField }: { field: ApprovalReadinessDisplayField }): ReactNode {
  const toneClass = {
    normal: 'text-ink',
    muted: 'text-muted italic',
    warning: 'text-amber-700',
    blocked: 'text-red-700',
  }[displayField.tone];
  return (
    <div className="grid grid-cols-[minmax(150px,220px)_1fr] gap-sm border-b border-hairline py-sm text-sm">
      <dt className="text-muted">{displayField.label}</dt>
      <dd className={toneClass}>{displayField.value}</dd>
    </div>
  );
}

export function ApprovalReadiness(props: ApprovalReadinessProps): ReactNode {
  const model = deriveApprovalReadinessModel(props);
  return (
    <section aria-label="Approval readiness review" className="grid gap-lg">
      <header className="grid gap-xs">
        <p className="text-xs font-semibold uppercase text-brand-teal">
          Approval readiness
        </p>
        <h2 className="text-xl font-semibold text-ink">{model.title}</h2>
      </header>
      <div className="grid gap-lg lg:grid-cols-3">
        {model.sections.map((section) => (
          <section key={section.title} aria-label={section.title} className="grid content-start gap-sm">
            <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
            <dl className="grid gap-0">
              {section.fields.map((displayField) => (
                <FieldRow key={displayField.label} field={displayField} />
              ))}
            </dl>
          </section>
        ))}
      </div>
      <div className="flex flex-wrap gap-sm" aria-label="Approval readiness actions">
        {model.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={!action.enabled}
            title={action.reason ?? undefined}
            onClick={() => props.onAction?.(action.id, model)}
            className="min-h-tap rounded-md border border-hairline px-md text-xs font-medium text-brand-teal disabled:cursor-not-allowed disabled:text-muted disabled:opacity-60"
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default ApprovalReadiness;
