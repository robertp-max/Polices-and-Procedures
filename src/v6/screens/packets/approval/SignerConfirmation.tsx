import type { ReactNode } from 'react';
import type { PacketEnvelope, PacketSignerTask } from '@/policy/packets/contracts';
import {
  DEFAULT_SIGNATURE_POLICY,
  resolveDualCapacityDecision,
  type DualCapacityAttestationRecord,
  type SignatureCapacityRequirement,
  type SignaturePolicy,
} from '@/policy/packets/registries/signaturePolicies';

export type SignerConfirmationDecision = 'allow' | 'deny' | 'not requested';

export interface SignerConfirmationInput {
  signaturePolicy?: SignaturePolicy | null;
  envelope?: PacketEnvelope | null;
  signerTasks?: readonly PacketSignerTask[] | null;
  dualCapacityRecords?: Readonly<Record<string, DualCapacityAttestationRecord>> | null;
}

export interface SignerConfirmationRow {
  rowId: string;
  requiredCapacity: string;
  signer: string;
  signerEmail: string;
  signerRole: string;
  authorityVerified: string;
  order: string;
  requiredOptional: 'required' | 'optional';
  dualCapacityRule: string;
  dualCapacityDecision: SignerConfirmationDecision;
  status: string;
  confirmIdentity: string;
  confirmEmail: string;
  confirmRole: string;
  confirmAuthority: string;
  confirmSequence: string;
  attachmentAccess: string;
  dueDate: string;
  expiration: string;
  reminders: string;
  confidentiality: string;
  blockers: readonly string[];
}

export interface SignerConfirmationModel {
  policyId: string;
  rows: readonly SignerConfirmationRow[];
  blockers: readonly string[];
  confirmationReady: boolean;
}

export interface SignerConfirmationProps extends SignerConfirmationInput {
  onConfirm?: (model: SignerConfirmationModel) => void;
}

interface InternalSignerRow extends SignerConfirmationRow {
  task: PacketSignerTask | null;
  mutableBlockers: string[];
}

function textValue(value: string | null | undefined): string {
  if (typeof value !== 'string') return 'unknown';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : 'unknown';
}

function yesNo(value: boolean): string {
  return value ? 'yes' : 'no';
}

function reminderCountValue(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? String(value)
    : 'unknown';
}

function signerKey(task: PacketSignerTask | null): string | null {
  if (task === null) return null;
  const userId = textValue(task.signerUserId);
  if (userId !== 'unknown') return `user:${userId}`;
  const email = textValue(task.signerEmail).toLowerCase();
  if (email !== 'unknown') return `email:${email}`;
  const name = textValue(task.signerName).toLowerCase();
  return name === 'unknown' ? null : `name:${name}`;
}

function taskForCapacity(
  tasks: readonly PacketSignerTask[],
  capacity: string,
): PacketSignerTask | null {
  return tasks.find((task) => task.requiredCapacity === capacity) ??
    tasks.find((task) => task.dualCapacities?.includes(capacity) ?? false) ??
    null;
}

function recordFromTask(task: PacketSignerTask | null): DualCapacityAttestationRecord | null {
  if (task === null || task.dualCapacities === null) return null;
  return {
    dualCapacities: task.dualCapacities,
    attestationEvidencePresent: task.dualCapacityRuleId !== null,
    dualCapacityRuleId: task.dualCapacityRuleId,
  };
}

function recordForRows(
  first: InternalSignerRow,
  second: InternalSignerRow,
  records: Readonly<Record<string, DualCapacityAttestationRecord>>,
): DualCapacityAttestationRecord | null {
  const firstTask = first.task;
  const secondTask = second.task;
  if (firstTask && records[firstTask.signerTaskId]) return records[firstTask.signerTaskId] ?? null;
  if (secondTask && records[secondTask.signerTaskId]) return records[secondTask.signerTaskId] ?? null;
  return recordFromTask(firstTask) ?? recordFromTask(secondTask);
}

function addBlocker(row: InternalSignerRow, blocker: string): void {
  if (!row.mutableBlockers.includes(blocker)) {
    row.mutableBlockers.push(blocker);
  }
}

function rowForRequirement(
  requirement: SignatureCapacityRequirement,
  task: PacketSignerTask | null,
): InternalSignerRow {
  const blockers: string[] = [];
  const coveredByDualTask = task !== null &&
    task.requiredCapacity !== requirement.capacity &&
    (task.dualCapacities?.includes(requirement.capacity) ?? false);
  const sequenceConfirmed = task !== null &&
    (task.order === requirement.order || coveredByDualTask);
  if (task === null) {
    blockers.push(`Missing signer task for ${requirement.capacity}.`);
  } else {
    if (textValue(task.signerName) === 'unknown' && textValue(task.signerUserId) === 'unknown') {
      blockers.push(`Confirm identity for ${requirement.capacity}.`);
    }
    if (textValue(task.signerEmail) === 'unknown') {
      blockers.push(`Confirm email for ${requirement.capacity}.`);
    }
    if (textValue(task.signerRole) === 'unknown') {
      blockers.push(`Confirm role for ${requirement.capacity}.`);
    }
    if (!task.authorityVerified) {
      blockers.push(`Confirm authority for ${requirement.capacity}.`);
    }
    if (!sequenceConfirmed) {
      blockers.push(`Confirm sequence for ${requirement.capacity}.`);
    }
    if (requirement.required && !task.required) {
      blockers.push(`Capacity ${requirement.capacity} must be required.`);
    }
    if (!task.attachmentAccessGranted) {
      blockers.push(`Grant attachment access for ${requirement.capacity}.`);
    }
    if (textValue(task.dueDate) === 'unknown') {
      blockers.push(`Set due date for ${requirement.capacity}.`);
    }
    if (textValue(task.expiresAt) === 'unknown') {
      blockers.push(`Set expiration for ${requirement.capacity}.`);
    }
    if (reminderCountValue(task.reminderCount) === 'unknown') {
      blockers.push(`Confirm reminders for ${requirement.capacity}.`);
    }
    if (!task.confidentialityAcknowledged) {
      blockers.push(`Confirm confidentiality for ${requirement.capacity}.`);
    }
  }
  const row: InternalSignerRow = {
    rowId: task?.signerTaskId ?? `missing:${requirement.capacity}`,
    requiredCapacity: requirement.capacity,
    signer: textValue(task?.signerName ?? task?.signerUserId ?? null),
    signerEmail: textValue(task?.signerEmail ?? null),
    signerRole: textValue(task?.signerRole ?? null),
    authorityVerified: task ? yesNo(task.authorityVerified) : 'unknown',
    order: task ? String(task.order) : String(requirement.order),
    requiredOptional: requirement.required ? 'required' : 'optional',
    dualCapacityRule: textValue(task?.dualCapacityRuleId ?? null),
    dualCapacityDecision: task?.dualCapacities ? 'deny' : 'not requested',
    status: textValue(task?.status ?? null),
    confirmIdentity: task ? yesNo(textValue(task.signerName ?? task.signerUserId) !== 'unknown') : 'unknown',
    confirmEmail: task ? yesNo(textValue(task.signerEmail) !== 'unknown') : 'unknown',
    confirmRole: task ? yesNo(textValue(task.signerRole) !== 'unknown') : 'unknown',
    confirmAuthority: task ? yesNo(task.authorityVerified) : 'unknown',
    confirmSequence: task ? yesNo(sequenceConfirmed) : 'unknown',
    attachmentAccess: task ? yesNo(task.attachmentAccessGranted) : 'unknown',
    dueDate: textValue(task?.dueDate ?? null),
    expiration: textValue(task?.expiresAt ?? null),
    reminders: task ? reminderCountValue(task.reminderCount) : 'unknown',
    confidentiality: task ? yesNo(task.confidentialityAcknowledged) : 'unknown',
    blockers,
    mutableBlockers: blockers,
    task,
  };
  return row;
}

function optionalRows(
  tasks: readonly PacketSignerTask[],
  requirements: readonly SignatureCapacityRequirement[],
): InternalSignerRow[] {
  const requiredCapacities = new Set(requirements.map((requirement) => requirement.capacity));
  return tasks
    .filter((task) => !requiredCapacities.has(task.requiredCapacity))
    .map((task) => ({
      rowId: task.signerTaskId,
      requiredCapacity: task.requiredCapacity,
      signer: textValue(task.signerName ?? task.signerUserId),
      signerEmail: textValue(task.signerEmail),
      signerRole: textValue(task.signerRole),
      authorityVerified: yesNo(task.authorityVerified),
      order: String(task.order),
      requiredOptional: task.required ? 'required' : 'optional',
      dualCapacityRule: textValue(task.dualCapacityRuleId),
      dualCapacityDecision: task.dualCapacities ? 'deny' : 'not requested',
      status: textValue(task.status),
      confirmIdentity: yesNo(textValue(task.signerName ?? task.signerUserId) !== 'unknown'),
      confirmEmail: yesNo(textValue(task.signerEmail) !== 'unknown'),
      confirmRole: yesNo(textValue(task.signerRole) !== 'unknown'),
      confirmAuthority: yesNo(task.authorityVerified),
      confirmSequence: 'yes',
      attachmentAccess: yesNo(task.attachmentAccessGranted),
      dueDate: textValue(task.dueDate),
      expiration: textValue(task.expiresAt),
      reminders: reminderCountValue(task.reminderCount),
      confidentiality: yesNo(task.confidentialityAcknowledged),
      blockers: [],
      mutableBlockers: [],
      task,
    }));
}

function enforceDualCapacity(
  rows: readonly InternalSignerRow[],
  policy: SignaturePolicy,
  records: Readonly<Record<string, DualCapacityAttestationRecord>>,
): void {
  for (let i = 0; i < rows.length; i += 1) {
    const first = rows[i];
    if (!first) continue;
    for (let j = i + 1; j < rows.length; j += 1) {
      const second = rows[j];
      if (!second || first.requiredCapacity === second.requiredCapacity) continue;
      const firstSigner = signerKey(first.task);
      const secondSigner = signerKey(second.task);
      if (firstSigner === null || firstSigner !== secondSigner) continue;
      const record = recordForRows(first, second, records);
      const decision = resolveDualCapacityDecision(
        policy,
        first.requiredCapacity,
        second.requiredCapacity,
        record,
      );
      first.dualCapacityDecision = decision;
      second.dualCapacityDecision = decision;
      if (decision !== 'allow') {
        const blocker =
          `One signer cannot satisfy ${first.requiredCapacity} and ${second.requiredCapacity} unless an explicit approved dual-capacity rule permits it and the record shows both capacities.`;
        addBlocker(first, blocker);
        addBlocker(second, blocker);
      }
    }
  }
}

function finalizedRow(row: InternalSignerRow): SignerConfirmationRow {
  return {
    rowId: row.rowId,
    requiredCapacity: row.requiredCapacity,
    signer: row.signer,
    signerEmail: row.signerEmail,
    signerRole: row.signerRole,
    authorityVerified: row.authorityVerified,
    order: row.order,
    requiredOptional: row.requiredOptional,
    dualCapacityRule: row.dualCapacityRule,
    dualCapacityDecision: row.dualCapacityDecision,
    status: row.status,
    confirmIdentity: row.confirmIdentity,
    confirmEmail: row.confirmEmail,
    confirmRole: row.confirmRole,
    confirmAuthority: row.confirmAuthority,
    confirmSequence: row.confirmSequence,
    attachmentAccess: row.attachmentAccess,
    dueDate: row.dueDate,
    expiration: row.expiration,
    reminders: row.reminders,
    confidentiality: row.confidentiality,
    blockers: [...row.mutableBlockers],
  };
}

export function deriveSignerConfirmationModel(
  input: SignerConfirmationInput,
): SignerConfirmationModel {
  const policy = input.signaturePolicy ?? DEFAULT_SIGNATURE_POLICY;
  const tasks = input.signerTasks ?? input.envelope?.signerTasks ?? [];
  const requirementRows = policy.requiredCapacities.map((requirement) =>
    rowForRequirement(requirement, taskForCapacity(tasks, requirement.capacity)),
  );
  const rows = [...requirementRows, ...optionalRows(tasks, policy.requiredCapacities)];
  enforceDualCapacity(rows, policy, input.dualCapacityRecords ?? {});
  const finalized = rows.map(finalizedRow);
  const blockers = finalized.flatMap((row) => row.blockers);
  return {
    policyId: policy.policyId,
    rows: finalized,
    blockers,
    confirmationReady: blockers.length === 0,
  };
}

const TABLE_COLUMNS = [
  'Required capacity',
  'Signer',
  'Authority-verified',
  'Order',
  'Required/optional',
  'Dual-capacity rule',
  'Status',
  'Confirm identity',
  'Email',
  'Role',
  'Authority',
  'Sequence',
  'Attachment access',
  'Due date',
  'Expiration',
  'Reminders',
  'Confidentiality',
] as const;

export function SignerConfirmation(props: SignerConfirmationProps): ReactNode {
  const model = deriveSignerConfirmationModel(props);
  return (
    <section aria-label="Signer confirmation" className="grid gap-md">
      <header className="flex flex-wrap items-center justify-between gap-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-teal">
            Signer confirmation
          </p>
          <h2 className="text-xl font-semibold text-ink">{model.policyId}</h2>
        </div>
        <button
          type="button"
          disabled={!model.confirmationReady}
          title={model.confirmationReady ? undefined : model.blockers.join(' ')}
          onClick={() => props.onConfirm?.(model)}
          className="min-h-tap rounded-md border border-hairline px-md text-xs font-medium text-brand-teal disabled:cursor-not-allowed disabled:text-muted disabled:opacity-60"
        >
          Confirm signers
        </button>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            <tr>
              {TABLE_COLUMNS.map((column) => (
                <th key={column} scope="col" className="border-b border-hairline px-sm py-xs font-semibold text-muted">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.rows.map((row) => (
              <tr key={`${row.rowId}:${row.requiredCapacity}`}>
                <td className="border-b border-hairline px-sm py-xs">{row.requiredCapacity}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.signer}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.authorityVerified}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.order}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.requiredOptional}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.dualCapacityRule}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.status}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.confirmIdentity}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.signerEmail}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.signerRole}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.confirmAuthority}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.confirmSequence}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.attachmentAccess}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.dueDate}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.expiration}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.reminders}</td>
                <td className="border-b border-hairline px-sm py-xs">{row.confidentiality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {model.blockers.length > 0 && (
        <ul aria-label="Signer confirmation blockers" className="grid gap-xs text-sm text-red-700">
          {model.blockers.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SignerConfirmation;
