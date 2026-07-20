import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  SUPPLEMENTAL_CLASSIFICATION_OPTIONS,
  SUPPLEMENTAL_DESTINATION_OPTIONS,
  SUPPLEMENTAL_LIFECYCLE_TO_ITEM,
  type SupplementalClassification,
  type SupplementalDestination,
  type SupplementalInformationItem,
  type SupplementalItemLifecycleStatus,
  type SupplementalLifecycleStatus,
  type SupplementalValidationStatus,
} from '@/policy/packets/contracts';

export type SupplementalApplicationMode =
  | 'append'
  | 'link'
  | 'metric'
  | 'workflow'
  | 'action'
  | 'form'
  | 'attach'
  | 'index'
  | 'confidential'
  | 'replace'
  | 'note'
  | 'exclude';

export interface SupplementalDestinationPreview {
  destination: SupplementalDestination;
  targetArea: string;
  applicationMode: SupplementalApplicationMode;
  impactSummary: string;
  stagedUntilAccepted: boolean;
  canApply: boolean;
  willModifyPacket: boolean;
}

export interface SupplementalStoreItem extends SupplementalInformationItem {
  revision: number;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  appliedAt: string | null;
  destinationPreview: SupplementalDestinationPreview;
}

export interface CreateSupplementalInformationInput {
  packetInstanceId: string;
  originalContent?: string | null;
  originalFilename?: string | null;
  submittedBy: string;
  classification: SupplementalClassification;
  destination: SupplementalDestination;
  evidenceHash?: string | null;
  confidentialityLevel?: string | null;
  relatedFindingIds?: string[];
  relatedWorkflowIds?: string[];
  relatedFormIds?: string[];
}

export interface TransitionSupplementalInformationInput {
  packetInstanceId: string;
  intakeId: string;
  expectedRevision: number;
  toStatus: SupplementalLifecycleStatus;
  classification?: SupplementalClassification;
  destination?: SupplementalDestination;
  validationStatus?: SupplementalValidationStatus;
  reviewerId?: string | null;
  appliedChangeIds?: string[];
  relatedFindingIds?: string[];
  relatedWorkflowIds?: string[];
  relatedFormIds?: string[];
}

export interface SupplementalInformationStore {
  create(input: CreateSupplementalInformationInput): Promise<SupplementalStoreItem>;
  get(packetInstanceId: string, intakeId: string): Promise<SupplementalStoreItem | null>;
  list(packetInstanceId: string): Promise<SupplementalStoreItem[]>;
  transition(input: TransitionSupplementalInformationInput): Promise<SupplementalStoreItem>;
}

export class SupplementalValidationError extends Error {
  readonly code: string;
  readonly status: number;
  readonly field: string;

  constructor(code: string, message: string, field = 'supplementalInformation', status = 400) {
    super(message);
    this.name = 'SupplementalValidationError';
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

export class SupplementalNotFoundError extends Error {
  readonly code = 'supplemental_not_found' as const;
  readonly packetInstanceId: string;
  readonly intakeId: string;

  constructor(packetInstanceId: string, intakeId: string) {
    super(`Supplemental information item not found: ${intakeId}`);
    this.name = 'SupplementalNotFoundError';
    this.packetInstanceId = packetInstanceId;
    this.intakeId = intakeId;
  }
}

export class SupplementalStaleWriteError extends Error {
  readonly code = 'supplemental_stale_write' as const;
  readonly packetInstanceId: string;
  readonly intakeId: string;
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(
    packetInstanceId: string,
    intakeId: string,
    expectedRevision: number,
    actualRevision: number,
  ) {
    super(
      `Stale supplemental write for ${intakeId}: expected revision ${expectedRevision}, actual ${actualRevision}`,
    );
    this.name = 'SupplementalStaleWriteError';
    this.packetInstanceId = packetInstanceId;
    this.intakeId = intakeId;
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}

export class IllegalSupplementalTransitionError extends Error {
  readonly code = 'illegal_supplemental_transition' as const;
  readonly packetInstanceId: string;
  readonly intakeId: string;
  readonly fromStatus: SupplementalLifecycleStatus;
  readonly toStatus: SupplementalLifecycleStatus;

  constructor(
    packetInstanceId: string,
    intakeId: string,
    fromStatus: SupplementalLifecycleStatus,
    toStatus: SupplementalLifecycleStatus,
  ) {
    super(
      `Illegal supplemental lifecycle transition: ${fromStatus} to ${toStatus} (${intakeId})`,
    );
    this.name = 'IllegalSupplementalTransitionError';
    this.packetInstanceId = packetInstanceId;
    this.intakeId = intakeId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}

const CLASSIFICATION_SET = new Set<string>(SUPPLEMENTAL_CLASSIFICATION_OPTIONS);
const DESTINATION_SET = new Set<string>(SUPPLEMENTAL_DESTINATION_OPTIONS);
const VALIDATION_STATUSES = [
  'pending',
  'validated',
  'validated-with-limitation',
  'provisional',
  'conflicted',
  'unknown',
  'excluded',
] as const satisfies readonly SupplementalValidationStatus[];
const VALIDATION_STATUS_SET = new Set<string>(VALIDATION_STATUSES);

const ITEM_TO_LIFECYCLE = Object.fromEntries(
  (Object.entries(SUPPLEMENTAL_LIFECYCLE_TO_ITEM) as Array<
    [SupplementalLifecycleStatus, SupplementalItemLifecycleStatus]
  >).map(([machine, item]) => [item, machine]),
) as Record<SupplementalItemLifecycleStatus, SupplementalLifecycleStatus>;

const LEGAL_SUPPLEMENTAL_TRANSITIONS = {
  RECEIVED: ['CLASSIFIED'],
  CLASSIFIED: ['MAPPED'],
  MAPPED: ['VALIDATED'],
  VALIDATED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['APPLIED'],
  REJECTED: [],
  APPLIED: [],
} as const satisfies Record<SupplementalLifecycleStatus, readonly SupplementalLifecycleStatus[]>;

const DESTINATION_DETAILS = {
  'Executive analysis': {
    targetArea: 'Executive analysis',
    applicationMode: 'append',
    impactSummary: 'Adds accepted context to the executive analysis section.',
  },
  'Specific finding': {
    targetArea: 'Finding register',
    applicationMode: 'link',
    impactSummary: 'Links the accepted item to one or more finding records.',
  },
  KPI: {
    targetArea: 'KPI dashboard',
    applicationMode: 'metric',
    impactSummary: 'Stages a governed KPI input or correction for recalculation.',
  },
  'Triggered workflow': {
    targetArea: 'Workflow trigger register',
    applicationMode: 'workflow',
    impactSummary: 'Associates the accepted item with a triggered workflow.',
  },
  'Action item': {
    targetArea: 'Action register',
    applicationMode: 'action',
    impactSummary: 'Adds accepted follow-up context to an action item.',
  },
  'Specific form': {
    targetArea: 'Form pages',
    applicationMode: 'form',
    impactSummary: 'Maps the accepted item to a generated form instance.',
  },
  'New attachment': {
    targetArea: 'Attachment manifest',
    applicationMode: 'attach',
    impactSummary: 'Adds accepted evidence metadata as a new attachment.',
  },
  'Evidence index': {
    targetArea: 'Evidence index',
    applicationMode: 'index',
    impactSummary: 'Indexes the accepted item as supporting evidence.',
  },
  'Confidential addendum': {
    targetArea: 'Confidential addendum',
    applicationMode: 'confidential',
    impactSummary: 'Routes the accepted item to a restricted addendum.',
  },
  'Replace/correct value': {
    targetArea: 'Corrected value register',
    applicationMode: 'replace',
    impactSummary: 'Stages a governed replacement value for reviewer acceptance.',
  },
  'Reviewer note only': {
    targetArea: 'Reviewer notes',
    applicationMode: 'note',
    impactSummary: 'Records the accepted note without changing packet output.',
  },
  'Exclude from final packet': {
    targetArea: 'Exclusion register',
    applicationMode: 'exclude',
    impactSummary: 'Records the accepted exclusion decision outside the final packet.',
  },
} as const satisfies Record<
  SupplementalDestination,
  {
    targetArea: string;
    applicationMode: SupplementalApplicationMode;
    impactSummary: string;
  }
>;

const supplementalUpdateChains = new Map<string, Promise<unknown>>();

export function isSupplementalClassification(value: unknown): value is SupplementalClassification {
  return typeof value === 'string' && CLASSIFICATION_SET.has(value);
}

export function isSupplementalDestination(value: unknown): value is SupplementalDestination {
  return typeof value === 'string' && DESTINATION_SET.has(value);
}

export function isSupplementalLifecycleStatus(value: unknown): value is SupplementalLifecycleStatus {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(SUPPLEMENTAL_LIFECYCLE_TO_ITEM, value)
  );
}

export function isSupplementalValidationStatus(
  value: unknown,
): value is SupplementalValidationStatus {
  return typeof value === 'string' && VALIDATION_STATUS_SET.has(value);
}

export function toSupplementalLifecycleStatus(
  status: SupplementalItemLifecycleStatus,
): SupplementalLifecycleStatus {
  return ITEM_TO_LIFECYCLE[status];
}

export function buildSupplementalDestinationPreview(
  destination: SupplementalDestination,
  lifecycleStatus: SupplementalItemLifecycleStatus,
): SupplementalDestinationPreview {
  const detail = DESTINATION_DETAILS[destination];
  const canApply = lifecycleStatus === 'accepted';
  return {
    destination,
    targetArea: detail.targetArea,
    applicationMode: detail.applicationMode,
    impactSummary: detail.impactSummary,
    stagedUntilAccepted: !['accepted', 'applied', 'rejected'].includes(lifecycleStatus),
    canApply,
    willModifyPacket: !['Reviewer note only', 'Exclude from final packet'].includes(destination),
  };
}

function requireNonEmpty(name: string, value: string | null | undefined): string {
  if (typeof value !== 'string') {
    throw new SupplementalValidationError(
      'required_field_missing',
      `Field "${name}" is required.`,
      name,
    );
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new SupplementalValidationError(
      'required_field_missing',
      `Field "${name}" is required.`,
      name,
    );
  }
  return trimmed;
}

function optionalTrimmed(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw new SupplementalValidationError(
      'field_type_invalid',
      'Optional supplemental metadata fields must be strings when provided.',
      'value',
    );
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function assertClassification(value: unknown): SupplementalClassification {
  if (!isSupplementalClassification(value)) {
    throw new SupplementalValidationError(
      'supplemental_classification_invalid',
      'Supplemental classification must be one of the 15 governed FR-019 options.',
      'classification',
    );
  }
  return value;
}

function assertDestination(value: unknown): SupplementalDestination {
  if (!isSupplementalDestination(value)) {
    throw new SupplementalValidationError(
      'supplemental_destination_invalid',
      'Supplemental destination must be one of the 12 governed FR-019 options.',
      'destination',
    );
  }
  return value;
}

function assertStringArray(name: string, values: string[] | undefined): string[] {
  if (values === undefined) return [];
  return values.map((value) => requireNonEmpty(name, value));
}

function defaultConfidentialityLevel(classification: SupplementalClassification): string {
  if (classification === 'Confidential personnel information') return 'personnel-confidential';
  if (classification === 'Legal/privileged information') return 'legal-privileged';
  return 'agency-confidential';
}

function nowIso(): string {
  return new Date().toISOString();
}

function safeId(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}

function supplementalHash(input: {
  packetInstanceId: string;
  originalContent: string | null;
  originalFilename: string | null;
}): string | null {
  if (!input.originalContent && !input.originalFilename) return null;
  const hash = createHash('sha256')
    .update(JSON.stringify(input), 'utf8')
    .digest('hex');
  return `sha256:${hash}`;
}

function withSupplementalUpdateLock<T>(
  packetInstanceId: string,
  intakeId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const key = `${packetInstanceId}:${intakeId}`;
  const prev = supplementalUpdateChains.get(key) ?? Promise.resolve();
  const run = prev.then(
    () => fn(),
    () => fn(),
  );
  const settled = run.then(
    () => undefined,
    () => undefined,
  );
  supplementalUpdateChains.set(key, settled);
  void settled.then(() => {
    if (supplementalUpdateChains.get(key) === settled) {
      supplementalUpdateChains.delete(key);
    }
  });
  return run;
}

function assertLegalTransition(
  item: SupplementalStoreItem,
  toStatus: SupplementalLifecycleStatus,
): void {
  const fromStatus = toSupplementalLifecycleStatus(item.lifecycleStatus);
  const allowed: readonly SupplementalLifecycleStatus[] =
    LEGAL_SUPPLEMENTAL_TRANSITIONS[fromStatus];
  if (!allowed.includes(toStatus)) {
    throw new IllegalSupplementalTransitionError(
      item.packetInstanceId,
      item.intakeId,
      fromStatus,
      toStatus,
    );
  }
}

function assertValidatedStatus(status: SupplementalValidationStatus): void {
  if (status === 'pending' || status === 'unknown') {
    throw new SupplementalValidationError(
      'supplemental_not_validated',
      'Supplemental information must have a conclusive validationStatus before acceptance or rejection.',
      'validationStatus',
      409,
    );
  }
}

function applyLifecycleFields(
  current: SupplementalStoreItem,
  input: TransitionSupplementalInformationInput,
): SupplementalStoreItem {
  assertLegalTransition(current, input.toStatus);

  if (input.appliedChangeIds !== undefined && input.toStatus !== 'APPLIED') {
    throw new SupplementalValidationError(
      'supplemental_applied_changes_before_apply',
      'appliedChangeIds may be set only during the APPLIED transition.',
      'appliedChangeIds',
      409,
    );
  }

  const ts = nowIso();
  const next: SupplementalStoreItem = {
    ...current,
    classification: input.classification ?? current.classification,
    destination: input.destination ?? current.destination,
    validationStatus: input.validationStatus ?? current.validationStatus,
    reviewerId: input.reviewerId === undefined ? current.reviewerId : input.reviewerId,
    relatedFindingIds: input.relatedFindingIds ?? current.relatedFindingIds,
    relatedWorkflowIds: input.relatedWorkflowIds ?? current.relatedWorkflowIds,
    relatedFormIds: input.relatedFormIds ?? current.relatedFormIds,
    lifecycleStatus: SUPPLEMENTAL_LIFECYCLE_TO_ITEM[input.toStatus],
    revision: current.revision + 1,
    updatedAt: ts,
  };

  if (input.toStatus === 'CLASSIFIED') {
    next.classification = assertClassification(next.classification);
  }

  if (input.toStatus === 'MAPPED') {
    next.destination = assertDestination(next.destination);
  }

  if (input.toStatus === 'VALIDATED') {
    next.validationStatus = input.validationStatus ?? 'validated';
    assertValidatedStatus(next.validationStatus);
  }

  if (input.toStatus === 'ACCEPTED') {
    assertValidatedStatus(next.validationStatus);
    next.reviewerId = requireNonEmpty('reviewerId', next.reviewerId);
    next.acceptedAt = ts;
    next.rejectedAt = null;
  }

  if (input.toStatus === 'REJECTED') {
    assertValidatedStatus(next.validationStatus);
    next.reviewerId = requireNonEmpty('reviewerId', next.reviewerId);
    next.appliedChangeIds = [];
    next.rejectedAt = ts;
    next.acceptedAt = null;
  }

  if (input.toStatus === 'APPLIED') {
    const appliedChangeIds = assertStringArray('appliedChangeIds', input.appliedChangeIds);
    if (appliedChangeIds.length === 0) {
      throw new SupplementalValidationError(
        'supplemental_applied_change_required',
        'At least one appliedChangeId is required for APPLIED.',
        'appliedChangeIds',
        409,
      );
    }
    next.appliedChangeIds = appliedChangeIds;
    next.appliedAt = ts;
  }

  next.destinationPreview = buildSupplementalDestinationPreview(next.destination, next.lifecycleStatus);
  return next;
}

export class FileLocalSupplementalInformationStore implements SupplementalInformationStore {
  private readonly root: string;

  constructor(cacheRoot?: string) {
    this.root =
      cacheRoot && cacheRoot.trim().length > 0
        ? path.resolve(cacheRoot)
        : path.join(process.cwd(), '.cache', 'packet-supplemental-information');
  }

  private ensurePacketDir(packetInstanceId: string): string {
    const dir = path.join(this.root, safeId(packetInstanceId));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  private packetDir(packetInstanceId: string): string {
    return path.join(this.root, safeId(packetInstanceId));
  }

  private fileFor(packetInstanceId: string, intakeId: string): string {
    return path.join(this.packetDir(packetInstanceId), `${safeId(intakeId)}.json`);
  }

  private read(packetInstanceId: string, intakeId: string): SupplementalStoreItem | null {
    const file = this.fileFor(packetInstanceId, intakeId);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8')) as SupplementalStoreItem;
  }

  private write(item: SupplementalStoreItem): void {
    const dir = this.ensurePacketDir(item.packetInstanceId);
    const file = path.join(dir, `${safeId(item.intakeId)}.json`);
    const tmp = `${file}.${randomUUID()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(item, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  }

  async create(input: CreateSupplementalInformationInput): Promise<SupplementalStoreItem> {
    const packetInstanceId = requireNonEmpty('packetInstanceId', input.packetInstanceId);
    const submittedBy = requireNonEmpty('submittedBy', input.submittedBy);
    const classification = assertClassification(input.classification);
    const destination = assertDestination(input.destination);
    const originalContent = optionalTrimmed(input.originalContent);
    const originalFilename = optionalTrimmed(input.originalFilename);

    if (!originalContent && !originalFilename) {
      throw new SupplementalValidationError(
        'supplemental_content_required',
        'Supplemental information requires pasted content or a file name.',
        'originalContent',
      );
    }

    const ts = nowIso();
    const intakeId = `supp_${randomUUID()}`;
    const item: SupplementalStoreItem = {
      intakeId,
      packetInstanceId,
      originalContent,
      originalFilename,
      submittedBy,
      submittedAt: ts,
      classification,
      destination,
      validationStatus: 'pending',
      reviewerId: null,
      appliedChangeIds: [],
      relatedFindingIds: assertStringArray('relatedFindingIds', input.relatedFindingIds),
      relatedWorkflowIds: assertStringArray('relatedWorkflowIds', input.relatedWorkflowIds),
      relatedFormIds: assertStringArray('relatedFormIds', input.relatedFormIds),
      evidenceHash: optionalTrimmed(input.evidenceHash) ?? supplementalHash({
        packetInstanceId,
        originalContent,
        originalFilename,
      }),
      confidentialityLevel:
        optionalTrimmed(input.confidentialityLevel) ?? defaultConfidentialityLevel(classification),
      lifecycleStatus: 'received',
      revision: 1,
      createdAt: ts,
      updatedAt: ts,
      acceptedAt: null,
      rejectedAt: null,
      appliedAt: null,
      destinationPreview: buildSupplementalDestinationPreview(destination, 'received'),
    };

    this.write(item);
    return item;
  }

  async get(packetInstanceId: string, intakeId: string): Promise<SupplementalStoreItem | null> {
    return this.read(
      requireNonEmpty('packetInstanceId', packetInstanceId),
      requireNonEmpty('intakeId', intakeId),
    );
  }

  async list(packetInstanceId: string): Promise<SupplementalStoreItem[]> {
    const id = requireNonEmpty('packetInstanceId', packetInstanceId);
    const dir = this.packetDir(id);
    if (!fs.existsSync(dir)) return [];
    const rows = fs.readdirSync(dir)
      .filter((name) => name.endsWith('.json') && !name.endsWith('.tmp'))
      .map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')) as SupplementalStoreItem)
      .filter((item) => item.packetInstanceId === id);
    rows.sort((a, b) => (a.submittedAt < b.submittedAt ? -1 : a.submittedAt > b.submittedAt ? 1 : 0));
    return rows;
  }

  async transition(input: TransitionSupplementalInformationInput): Promise<SupplementalStoreItem> {
    const packetInstanceId = requireNonEmpty('packetInstanceId', input.packetInstanceId);
    const intakeId = requireNonEmpty('intakeId', input.intakeId);
    if (typeof input.expectedRevision !== 'number' || !Number.isFinite(input.expectedRevision)) {
      throw new SupplementalValidationError(
        'expected_revision_required',
        'expectedRevision is required for supplemental information mutation.',
        'expectedRevision',
        428,
      );
    }

    return withSupplementalUpdateLock(packetInstanceId, intakeId, async () => {
      const current = this.read(packetInstanceId, intakeId);
      if (!current) {
        throw new SupplementalNotFoundError(packetInstanceId, intakeId);
      }
      if (current.revision !== input.expectedRevision) {
        throw new SupplementalStaleWriteError(
          packetInstanceId,
          intakeId,
          input.expectedRevision,
          current.revision,
        );
      }

      const next = applyLifecycleFields(current, input);
      this.write(next);
      return next;
    });
  }
}
