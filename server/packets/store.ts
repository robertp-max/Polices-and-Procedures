/**
 * PacketInstance metadata store — WP-1.4 / FR-004 / FR-005 / §18.9 / §19.1.
 *
 * File-local seam (mirrors cesMetadataStore): one JSON doc per instance,
 * atomic tmp+rename, metadata-only (no file bytes / PHI free-text).
 * Browser must never be the system of record.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  buildPacketIdentityKey,
  isAllowedPacketTransition,
  type PacketAuditActor,
  type PacketAuditEventType,
  type PacketInstance,
  type PacketLifecycleStatus,
} from '@/policy/packets/contracts';
import { emitPacketAudit, systemPacketActor, userPacketActor } from './auditEvents.js';

/** Store selection seam — env wiring lands in a later package. Do not touch server/env.ts. */
export const PACKET_STORE_PROVIDER = 'file_local' as const;

/**
 * Field names that signal file bodies, blobs, PHI free-text, or
 * personnel-confidential content — forbidden in packet metadata.
 */
export const FORBIDDEN_FIELDS = [
  /* file bodies / blobs */
  'localDataUrl',
  'base64',
  'rawBytes',
  'pdfBlob',
  'signedPacketBlob',
  'certificateHtml',
  'htmlSnapshot',
  /* clinical / patient PHI keys */
  'ssn',
  'social_security_number',
  'mrn',
  'medical_record_number',
  'patient_name',
  'patientName',
  'patient_first_name',
  'patient_last_name',
  'patient_address',
  'patient_dob',
  'date_of_birth',
  'diagnosis_text',
  'note_text',
  'clinical_note',
  /* personnel-confidential */
  'employee_name',
  'employeeName',
  'employee_first_name',
  'employee_last_name',
  'allegation',
  'allegation_text',
  'investigation',
  'investigation_notes',
  'investigation_summary',
  'sanction',
  'sanction_text',
  'discipline',
  'disciplinary_action',
  'disciplinary_note',
  'complainant',
  'complainant_name',
  'witness',
  'witness_name',
  'witness_statement',
  'personnel_note',
  'hr_note',
  'performance_note',
] as const;

/**
 * Identity fields immutable after create (FR-004).
 * Includes FR-004 key components and packetId family.
 */
export const IMMUTABLE_IDENTITY_FIELDS = [
  'agencyId',
  'eventInstanceId',
  'workflowInstanceId',
  'packetTemplateId',
  'packetId',
  'packetInstanceId',
  'identityKey',
] as const;

/** Strings longer than this that look like narrative free text are rejected. */
export const PHI_FREE_TEXT_LENGTH_THRESHOLD = 80;

/** Document persisted by the packet metadata store (§16.3 + concurrency stamps). */
export interface PacketStoreDocument extends PacketInstance {
  /** Optimistic concurrency revision — monotonic per instance (§18.9). */
  revision: number;
  /** FR-004 identity key (agency + event_instance + workflow_instance + template). */
  identityKey: string;
}

export interface CreatePacketInstanceInput {
  agencyId: string;
  eventFamilyId: string;
  eventInstanceId: string;
  archetypeId: string;
  archetypeVersion: string;
  packetTemplateId: string;
  workflowId: string;
  workflowInstanceId: string;
  createdBy: string;
  packetId?: string;
  subtype?: string | null;
  reportingPeriodStart?: string | null;
  reportingPeriodEnd?: string | null;
  dataThroughDate?: string | null;
  status?: PacketLifecycleStatus;
  moduleInstances?: PacketInstance['moduleInstances'];
  attachmentInstances?: PacketInstance['attachmentInstances'];
  blockerIds?: string[];
  warningIds?: string[];
  approvalIds?: string[];
  signatureIds?: string[];
  evidenceManifestId?: string;
  auditChronologyId?: string;
  sourceClassification?: PacketInstance['sourceClassification'];
  supersedesPacketInstanceId?: string | null;
  contentHash?: string | null;
  packetVersion?: number;
  /** Optional fixed id (tests / supersession). Generated when omitted. */
  packetInstanceId?: string;
  actor?: PacketAuditActor;
  reason?: string | null;
}

export interface CreatePacketInstanceResult {
  instance: PacketStoreDocument;
  created: boolean;
}

export interface PacketListQuery {
  agencyId?: string;
  eventFamilyId?: string;
  status?: PacketLifecycleStatus;
  reportingPeriodStart?: string | null;
  reportingPeriodEnd?: string | null;
}

/**
 * Patch fields allowed on public update.
 * Identity-key / packetId-family fields are rejected with ImmutableIdentityError.
 */
export type PacketInstancePatch = Partial<
  Omit<
    PacketStoreDocument,
    | 'packetInstanceId'
    | 'identityKey'
    | 'revision'
    | 'createdAt'
    | 'createdBy'
    | 'agencyId'
    | 'eventInstanceId'
    | 'workflowInstanceId'
    | 'packetTemplateId'
    | 'packetId'
  >
>;

export interface PacketUpdateOptions {
  actor?: PacketAuditActor;
  reason?: string | null;
  auditEventType?: PacketAuditEventType;
}

export interface PacketMetadataStore {
  readonly provider: typeof PACKET_STORE_PROVIDER;
  createPacketInstance(input: CreatePacketInstanceInput): Promise<CreatePacketInstanceResult>;
  getById(id: string): Promise<PacketStoreDocument | null>;
  findByIdentityKey(key: string): Promise<PacketStoreDocument | null>;
  list(query: PacketListQuery): Promise<PacketStoreDocument[]>;
  update(
    id: string,
    expectedRevision: number,
    patch: PacketInstancePatch,
    options?: PacketUpdateOptions,
  ): Promise<PacketStoreDocument>;
}

/** §18.9 — typed stale optimistic-concurrency failure. */
export class StaleWriteError extends Error {
  readonly code = 'stale_write' as const;
  readonly packetInstanceId: string;
  readonly expectedRevision: number;
  readonly actualRevision: number;

  constructor(packetInstanceId: string, expectedRevision: number, actualRevision: number) {
    super(
      `Stale write for packet ${packetInstanceId}: expected revision ${expectedRevision}, actual ${actualRevision}`,
    );
    this.name = 'StaleWriteError';
    this.packetInstanceId = packetInstanceId;
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}

/** Forbidden metadata field / PHI free-text rejected at the store boundary. */
export class ForbiddenFieldError extends Error {
  readonly code = 'forbidden_field' as const;
  readonly field: string;
  readonly context: string;

  constructor(field: string, context: string, message?: string) {
    super(message ?? `Packet metadata may not contain forbidden field "${field}" in ${context}.`);
    this.name = 'ForbiddenFieldError';
    this.field = field;
    this.context = context;
  }
}

/** Attempt to mutate immutable identity after create (FR-004). */
export class ImmutableIdentityError extends Error {
  readonly code = 'immutable_identity' as const;
  readonly packetInstanceId: string;
  readonly field: string;

  constructor(packetInstanceId: string, field: string) {
    super(
      `Packet identity field "${field}" is immutable after create (packet ${packetInstanceId}).`,
    );
    this.name = 'ImmutableIdentityError';
    this.packetInstanceId = packetInstanceId;
    this.field = field;
  }
}

/** Mutation attempted against an immutable LOCKED (or terminal) packet. */
export class LockedPacketError extends Error {
  readonly code = 'locked_packet' as const;
  readonly packetInstanceId: string;
  readonly status: PacketLifecycleStatus;

  constructor(packetInstanceId: string, status: PacketLifecycleStatus) {
    super(
      `Packet ${packetInstanceId} is ${status} and rejects mutation without amendment/supersession.`,
    );
    this.name = 'LockedPacketError';
    this.packetInstanceId = packetInstanceId;
    this.status = status;
  }
}

export class PacketNotFoundError extends Error {
  readonly code = 'packet_not_found' as const;
  readonly packetInstanceId: string;

  constructor(packetInstanceId: string) {
    super(`Packet instance not found: ${packetInstanceId}`);
    this.name = 'PacketNotFoundError';
    this.packetInstanceId = packetInstanceId;
  }
}

/** Illegal §17.1 transition (used by amendment entry point in this module). */
export class IllegalTransitionError extends Error {
  readonly code = 'illegal_transition' as const;
  readonly packetInstanceId: string;
  readonly fromStatus: PacketLifecycleStatus;
  readonly toStatus: PacketLifecycleStatus;

  constructor(
    packetInstanceId: string,
    fromStatus: PacketLifecycleStatus,
    toStatus: PacketLifecycleStatus,
  ) {
    super(
      `Illegal packet lifecycle transition: ${fromStatus} → ${toStatus} (packet ${packetInstanceId})`,
    );
    this.name = 'IllegalTransitionError';
    this.packetInstanceId = packetInstanceId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}

const FORBIDDEN_FIELD_SET = new Set<string>(FORBIDDEN_FIELDS);
const IMMUTABLE_IDENTITY_SET = new Set<string>(IMMUTABLE_IDENTITY_FIELDS);

/** Opaque id / hash / url-like strings may exceed the free-text threshold. */
function isOpaqueIdentifier(value: string): boolean {
  if (/\s/.test(value)) return false;
  // Hex hashes, UUIDs, URL-ish paths, underscore/hyphen ids — not narrative PHI.
  return /^[A-Za-z0-9._\-:/@+%=]+$/.test(value);
}

function looksLikePhiFreeText(value: string): boolean {
  if (value.length <= PHI_FREE_TEXT_LENGTH_THRESHOLD) {
    // Still reject SSN-shaped values even when short.
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(value)) return true;
    return false;
  }
  if (isOpaqueIdentifier(value)) return false;
  // Narrative / multi-word free text over threshold is not allowed in metadata.
  if (/\s/.test(value)) return true;
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(value)) return true;
  if (/\b(patient|diagnosis|mrn|dob|ssn|allegation|sanction)\b/i.test(value)) return true;
  return false;
}

/**
 * Reject objects that smuggle file bodies, personnel-confidential keys,
 * or PHI-like free-text values into metadata.
 */
export function assertNoForbiddenFields(obj: unknown, context: string): void {
  const seen = new Set<unknown>();
  const walk = (node: unknown, pathHint: string): void => {
    if (node == null) return;
    if (typeof node === 'string') {
      if (looksLikePhiFreeText(node)) {
        throw new ForbiddenFieldError(
          pathHint || '(value)',
          context,
          `Packet metadata may not contain PHI-like free text at "${pathHint || '(value)'}" in ${context}.`,
        );
      }
      return;
    }
    if (typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${pathHint}[${i}]`));
      return;
    }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const childPath = pathHint ? `${pathHint}.${k}` : k;
      if (FORBIDDEN_FIELD_SET.has(k) && v != null && v !== '') {
        throw new ForbiddenFieldError(k, context);
      }
      walk(v, childPath);
    }
  };
  walk(obj, '');
}

/**
 * Reject any attempt to patch identity-key / packetId-family fields.
 * Missing keys are fine; present keys (even same value) are rejected —
 * identity is store-owned after create.
 */
export function assertNoIdentityMutation(
  packetInstanceId: string,
  patch: Record<string, unknown>,
): void {
  for (const field of IMMUTABLE_IDENTITY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(patch, field)) {
      throw new ImmutableIdentityError(packetInstanceId, field);
    }
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function requireNonEmpty(name: string, value: string | null | undefined): string {
  if (value === null || value === undefined) {
    throw new Error(`Required field "${name}" is missing`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Required field "${name}" must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`Required field "${name}" is empty`);
  }
  return trimmed;
}

function safeId(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]/g, '_');
}

function isActiveForIdentity(doc: PacketStoreDocument): boolean {
  return doc.status !== 'SUPERSEDED';
}

function resolveActor(
  actor: PacketAuditActor | undefined,
  fallbackUserId: string | undefined,
): PacketAuditActor {
  if (actor) return actor;
  if (fallbackUserId && fallbackUserId.trim().length > 0) {
    return userPacketActor(fallbackUserId.trim());
  }
  return systemPacketActor();
}

/**
 * Per-packet in-process mutex for the read-check-write critical section.
 *
 * Scope of guarantee: **single Node process only** (file_local store).
 * Concurrent updates within this process are serialized so only one writer
 * can observe a given expectedRevision. Cross-process / multi-host races
 * are out of scope for file_local — a multi-process backend must use
 * conditional writes or transactions.
 */
const packetUpdateChains = new Map<string, Promise<unknown>>();

function withPacketUpdateLock<T>(packetInstanceId: string, fn: () => Promise<T>): Promise<T> {
  const prev = packetUpdateChains.get(packetInstanceId) ?? Promise.resolve();
  const run = prev.then(
    () => fn(),
    () => fn(),
  );
  // Keep the chain settled so a failure does not block subsequent writers.
  const settled = run.then(
    () => undefined,
    () => undefined,
  );
  packetUpdateChains.set(packetInstanceId, settled);
  // Drop the entry once the queue drains so the map does not grow without
  // bound (one leaked promise per packet ever updated). Only delete when we
  // are still the tail — a writer enqueued after us replaces the entry.
  void settled.then(() => {
    if (packetUpdateChains.get(packetInstanceId) === settled) {
      packetUpdateChains.delete(packetInstanceId);
    }
  });
  return run;
}

/** Diagnostics only (read-only): number of packet update chains currently held. */
export function getActiveUpdateChainCount(): number {
  return packetUpdateChains.size;
}

/**
 * Module-private registry of each store's data directory, captured at
 * construction. Reads inside the update critical section resolve through
 * this registry and the module's own file I/O, so a subclass overriding
 * getById()/readDoc() cannot spoof the revision or terminal-state checks.
 */
const STORE_DATA_DIRS = new WeakMap<FileLocalPacketStore, string>();

function readDocumentAuthoritative(
  store: FileLocalPacketStore,
  packetInstanceId: string,
): PacketStoreDocument | null {
  const dir = STORE_DATA_DIRS.get(store);
  if (!dir) {
    throw new Error(
      'Unrecognized store instance: refusing to update outside a constructor-registered FileLocalPacketStore',
    );
  }
  const file = path.join(dir, `${safeId(packetInstanceId)}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as PacketStoreDocument;
  } catch {
    throw new Error(`Failed to read packet instance document: ${packetInstanceId}`);
  }
}

/* ─── File-local implementation ─────────────────────────────────────── */

export class FileLocalPacketStore implements PacketMetadataStore {
  readonly provider = PACKET_STORE_PROVIDER;
  private readonly dir: string;

  /**
   * @param cacheRoot Optional root directory for packet instance JSON files.
   *   Defaults to `<cwd>/.cache/packet-instances`. Tests inject a temp dir.
   */
  constructor(cacheRoot?: string) {
    this.dir =
      cacheRoot && cacheRoot.trim().length > 0
        ? path.resolve(cacheRoot)
        : path.join(process.cwd(), '.cache', 'packet-instances');
    // Register the authoritative data dir for module-private reads inside the
    // update critical section (defeats overridden-getById spoofing).
    STORE_DATA_DIRS.set(this, this.dir);
  }

  private ensure(): void {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  private fileFor(packetInstanceId: string): string {
    return path.join(this.dir, `${safeId(packetInstanceId)}.json`);
  }

  private writeJson(file: string, value: unknown): void {
    this.ensure();
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  }

  private readDoc(packetInstanceId: string): PacketStoreDocument | null {
    this.ensure();
    const file = this.fileFor(packetInstanceId);
    if (!fs.existsSync(file)) return null;
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as PacketStoreDocument;
    } catch {
      throw new Error(`Failed to read packet instance document: ${packetInstanceId}`);
    }
  }

  private listAllDocs(): PacketStoreDocument[] {
    this.ensure();
    const names = fs.readdirSync(this.dir).filter((n) => n.endsWith('.json') && !n.endsWith('.tmp'));
    const out: PacketStoreDocument[] = [];
    for (const name of names) {
      const file = path.join(this.dir, name);
      try {
        const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as PacketStoreDocument;
        if (doc && typeof doc.packetInstanceId === 'string') {
          out.push(doc);
        }
      } catch {
        continue;
      }
    }
    return out;
  }

  async getById(id: string): Promise<PacketStoreDocument | null> {
    const packetInstanceId = requireNonEmpty('packetInstanceId', id);
    return this.readDoc(packetInstanceId);
  }

  /**
   * FR-004 lookup — returns the active (non-superseded) instance for a key,
   * or null when none exists. Never invents a default instance.
   */
  async findByIdentityKey(key: string): Promise<PacketStoreDocument | null> {
    const identityKey = requireNonEmpty('identityKey', key);
    const matches = this.listAllDocs().filter(
      (d) => d.identityKey === identityKey && isActiveForIdentity(d),
    );
    if (matches.length === 0) return null;
    matches.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));
    return matches[0] ?? null;
  }

  async list(query: PacketListQuery = {}): Promise<PacketStoreDocument[]> {
    let rows = this.listAllDocs();
    if (query.agencyId !== undefined) {
      const agencyId = requireNonEmpty('agencyId', query.agencyId);
      rows = rows.filter((d) => d.agencyId === agencyId);
    }
    if (query.eventFamilyId !== undefined) {
      const eventFamilyId = requireNonEmpty('eventFamilyId', query.eventFamilyId);
      rows = rows.filter((d) => d.eventFamilyId === eventFamilyId);
    }
    if (query.status !== undefined) {
      rows = rows.filter((d) => d.status === query.status);
    }
    if (query.reportingPeriodStart !== undefined && query.reportingPeriodStart !== null) {
      rows = rows.filter((d) => d.reportingPeriodStart === query.reportingPeriodStart);
    }
    if (query.reportingPeriodEnd !== undefined && query.reportingPeriodEnd !== null) {
      rows = rows.filter((d) => d.reportingPeriodEnd === query.reportingPeriodEnd);
    }
    rows.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
    return rows;
  }

  /**
   * FR-004 idempotent create: same identity key → return existing with created:false
   * (when existing is not superseded). Distinct event_instance_id → distinct instance.
   */
  async createPacketInstance(input: CreatePacketInstanceInput): Promise<CreatePacketInstanceResult> {
    assertNoForbiddenFields(input, 'createPacketInstance');

    const agencyId = requireNonEmpty('agencyId', input.agencyId);
    const eventInstanceId = requireNonEmpty('eventInstanceId', input.eventInstanceId);
    const workflowInstanceId = requireNonEmpty('workflowInstanceId', input.workflowInstanceId);
    const packetTemplateId = requireNonEmpty('packetTemplateId', input.packetTemplateId);
    const createdBy = requireNonEmpty('createdBy', input.createdBy);
    const eventFamilyId = requireNonEmpty('eventFamilyId', input.eventFamilyId);
    const archetypeId = requireNonEmpty('archetypeId', input.archetypeId);
    const archetypeVersion = requireNonEmpty('archetypeVersion', input.archetypeVersion);
    const workflowId = requireNonEmpty('workflowId', input.workflowId);

    const identityKey = buildPacketIdentityKey({
      agency_id: agencyId,
      event_instance_id: eventInstanceId,
      workflow_instance_id: workflowInstanceId,
      packet_template_id: packetTemplateId,
    });

    const existing = await this.findByIdentityKey(identityKey);
    if (existing) {
      return { instance: existing, created: false };
    }

    const ts = nowIso();
    const packetInstanceId =
      input.packetInstanceId && input.packetInstanceId.trim().length > 0
        ? input.packetInstanceId.trim()
        : randomUUID();

    if (await this.getById(packetInstanceId)) {
      throw new Error(`Packet instance id already exists: ${packetInstanceId}`);
    }

    const packetVersion =
      typeof input.packetVersion === 'number' && Number.isFinite(input.packetVersion)
        ? input.packetVersion
        : 1;
    if (packetVersion < 1) {
      throw new Error('packetVersion must be a positive finite number');
    }

    const doc: PacketStoreDocument = {
      packetInstanceId,
      packetId: input.packetId?.trim() || packetInstanceId,
      packetVersion,
      agencyId,
      eventFamilyId,
      eventInstanceId,
      archetypeId,
      archetypeVersion,
      packetTemplateId,
      subtype: input.subtype ?? null,
      workflowId,
      workflowInstanceId,
      reportingPeriodStart: input.reportingPeriodStart ?? null,
      reportingPeriodEnd: input.reportingPeriodEnd ?? null,
      dataThroughDate: input.dataThroughDate ?? null,
      status: input.status ?? 'SOURCE_COLLECTION',
      moduleInstances: input.moduleInstances ?? [],
      attachmentInstances: input.attachmentInstances ?? [],
      blockerIds: input.blockerIds ?? [],
      warningIds: input.warningIds ?? [],
      approvalIds: input.approvalIds ?? [],
      signatureIds: input.signatureIds ?? [],
      evidenceManifestId: input.evidenceManifestId?.trim() || `em_${packetInstanceId}`,
      auditChronologyId: input.auditChronologyId?.trim() || `ac_${packetInstanceId}`,
      driveFolderUrl: null,
      finalArtifactUrl: null,
      createdAt: ts,
      createdBy,
      updatedAt: ts,
      certifiedAt: null,
      lockedAt: null,
      contentHash: input.contentHash ?? null,
      supersedesPacketInstanceId: input.supersedesPacketInstanceId ?? null,
      supersededByPacketInstanceId: null,
      sourceClassification: input.sourceClassification ?? null,
      revision: 1,
      identityKey,
    };

    assertNoForbiddenFields(doc, 'createPacketInstance.doc');
    this.writeJson(this.fileFor(packetInstanceId), doc);

    const actor = resolveActor(input.actor, createdBy);
    await emitPacketAudit({
      eventType: 'packet.template_selected',
      packetInstanceId,
      actor,
      reason: input.reason ?? null,
      summary: 'Packet instance created',
      packetVersion: doc.packetVersion,
      revision: doc.revision,
      after: {
        packetInstanceId: doc.packetInstanceId,
        status: doc.status,
        identityKey: doc.identityKey,
        packetVersion: doc.packetVersion,
        revision: doc.revision,
      },
      resource: {
        resourceType: 'packet',
        resourceId: packetInstanceId,
        parentResourceId: null,
        packetInstanceId,
        packetVersion: doc.packetVersion,
      },
    });

    return { instance: doc, created: true };
  }

  /**
   * Public optimistic-concurrency update.
   * Rejects stale revision, identity mutation, and LOCKED/SUPERSEDED/CANCELLED.
   * Always emits exactly one audit event.
   *
   * Terminal-state (LOCKED) mutation is **not** available through this API.
   * Use {@link beginAmendment} or {@link createSupersedingInstance} only.
   */
  async update(
    id: string,
    expectedRevision: number,
    patch: PacketInstancePatch,
    options: PacketUpdateOptions = {},
  ): Promise<PacketStoreDocument> {
    return applyUpdate(this, id, expectedRevision, patch, options, /* allowTerminal */ false);
  }
}

/**
 * Core update implementation — **not exported**.
 *
 * `allowTerminal` is only ever true when called from {@link beginAmendment} or
 * {@link createSupersedingInstance} in this same module. No privileged handle
 * crosses the module boundary.
 *
 * Critical section (read → revision check → write) runs under
 * {@link withPacketUpdateLock} (single-process guarantee; see that helper).
 */
async function applyUpdate(
  store: FileLocalPacketStore,
  id: string,
  expectedRevision: number,
  patch: PacketInstancePatch,
  options: PacketUpdateOptions,
  allowTerminal: boolean,
): Promise<PacketStoreDocument> {
  const packetInstanceId = requireNonEmpty('packetInstanceId', id);
  if (typeof expectedRevision !== 'number' || !Number.isFinite(expectedRevision)) {
    throw new Error('expectedRevision must be a finite number');
  }
  assertNoForbiddenFields(patch, 'update');
  assertNoIdentityMutation(packetInstanceId, patch as Record<string, unknown>);

  // Defense in depth: strip identity fields even if types are bypassed.
  const patchRecord = { ...(patch as Record<string, unknown>) };
  for (const field of IMMUTABLE_IDENTITY_SET) {
    delete patchRecord[field];
  }
  delete patchRecord.revision;
  delete patchRecord.createdAt;
  delete patchRecord.createdBy;

  return withPacketUpdateLock(packetInstanceId, async () => {
    // Re-read inside the lock so concurrent writers cannot both pass the same
    // revision. Authoritative module-private read — never the instance's
    // (overridable) getById/readDoc surface.
    const current = readDocumentAuthoritative(store, packetInstanceId);
    if (!current) {
      throw new PacketNotFoundError(packetInstanceId);
    }

    if (current.revision !== expectedRevision) {
      throw new StaleWriteError(packetInstanceId, expectedRevision, current.revision);
    }

    if (
      !allowTerminal &&
      (current.status === 'LOCKED' ||
        current.status === 'SUPERSEDED' ||
        current.status === 'CANCELLED')
    ) {
      throw new LockedPacketError(packetInstanceId, current.status);
    }

    const ts = nowIso();
    const next: PacketStoreDocument = {
      ...current,
      ...(patchRecord as PacketInstancePatch),
      packetInstanceId: current.packetInstanceId,
      packetId: current.packetId,
      agencyId: current.agencyId,
      eventInstanceId: current.eventInstanceId,
      workflowInstanceId: current.workflowInstanceId,
      packetTemplateId: current.packetTemplateId,
      identityKey: current.identityKey,
      createdAt: current.createdAt,
      createdBy: current.createdBy,
      revision: current.revision + 1,
      updatedAt: ts,
    };

    if (next.status === 'LOCKED' && next.lockedAt == null) {
      next.lockedAt = ts;
    }
    if (next.status === 'CERTIFIED' && next.certifiedAt == null) {
      next.certifiedAt = ts;
    }

    assertNoForbiddenFields(next, 'update.doc');

    const rootDir = (store as unknown as { dir: string }).dir;
    const file = path.join(rootDir, `${safeId(packetInstanceId)}.json`);
    const tmp = `${file}.tmp`;
    if (!fs.existsSync(path.dirname(file))) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
    }
    fs.writeFileSync(tmp, JSON.stringify(next, null, 2), 'utf8');
    fs.renameSync(tmp, file);

    const actor = resolveActor(
      options.actor,
      typeof (patch as { updatedBy?: string }).updatedBy === 'string'
        ? (patch as { updatedBy?: string }).updatedBy
        : undefined,
    );
    await emitPacketAudit({
      eventType: options.auditEventType ?? 'packet.edited',
      packetInstanceId,
      actor,
      reason: options.reason ?? null,
      summary: 'Packet instance updated',
      packetVersion: next.packetVersion,
      revision: next.revision,
      before: {
        status: current.status,
        packetVersion: current.packetVersion,
        revision: current.revision,
      },
      after: {
        status: next.status,
        packetVersion: next.packetVersion,
        revision: next.revision,
      },
      resource: {
        resourceType: 'packet',
        resourceId: packetInstanceId,
        parentResourceId: null,
        packetInstanceId,
        packetVersion: next.packetVersion,
      },
    });

    return next;
  });
}

/* ─── Amendment / supersession — ONLY privileged terminal writers ───── */
/* These live in the same module as applyUpdate so allowTerminal=true never   */
/* crosses an export boundary. lifecycle.ts transitionPacket rejects LOCKED.  */

/**
 * Amendment entry point — permitted even for LOCKED packets (FR-005 / FR-032).
 * Emits exactly one audit event per successful status write.
 */
export async function beginAmendment(
  store: PacketMetadataStore,
  id: string,
  expectedRevision: number,
  actor: PacketAuditActor,
  reason?: string,
): Promise<PacketStoreDocument> {
  if (!actor?.actorId?.trim()) {
    throw new Error('actor.actorId is required');
  }
  if (!(store instanceof FileLocalPacketStore)) {
    throw new Error('beginAmendment requires FileLocalPacketStore');
  }

  const current = await store.getById(id);
  if (!current) {
    throw new PacketNotFoundError(id);
  }
  if (current.status === 'SUPERSEDED' || current.status === 'CANCELLED') {
    throw new LockedPacketError(id, current.status);
  }
  if (current.status === 'AMENDMENT_REQUIRED') {
    if (current.revision !== expectedRevision) {
      throw new StaleWriteError(id, expectedRevision, current.revision);
    }
    return current;
  }

  const allowedNormally = isAllowedPacketTransition(current.status, 'AMENDMENT_REQUIRED');
  if (!allowedNormally && current.status !== 'LOCKED') {
    throw new IllegalTransitionError(id, current.status, 'AMENDMENT_REQUIRED');
  }

  // LOCKED: non-exported applyUpdate(..., allowTerminal=true) — not available publicly.
  if (current.status === 'LOCKED') {
    return applyUpdate(
      store,
      id,
      expectedRevision,
      { status: 'AMENDMENT_REQUIRED' },
      {
        actor,
        reason: reason ?? null,
        auditEventType: 'packet.amended',
      },
      true,
    );
  }

  return store.update(
    id,
    expectedRevision,
    { status: 'AMENDMENT_REQUIRED' },
    {
      actor,
      reason: reason ?? null,
      auditEventType: 'packet.amended',
    },
  );
}

export interface CreateSupersedingInstanceInput {
  createdBy: string;
  actor: PacketAuditActor;
  reason?: string;
  eventInstanceId?: string;
  workflowInstanceId?: string;
  packetTemplateId?: string;
  packetId?: string;
  status?: PacketLifecycleStatus;
}

/**
 * Supersession entry point (FR-005). Prior doc retained; never deleted.
 * Emits one audit event per persisted mutation (status, create, link).
 */
export async function createSupersedingInstance(
  store: PacketMetadataStore,
  priorId: string,
  expectedRevision: number,
  input: CreateSupersedingInstanceInput,
): Promise<{ prior: PacketStoreDocument; next: PacketStoreDocument }> {
  if (!input?.actor?.actorId?.trim()) {
    throw new Error('actor.actorId is required');
  }
  const createdBy = input.createdBy?.trim();
  if (!createdBy) {
    throw new Error('createdBy is required');
  }
  if (!(store instanceof FileLocalPacketStore)) {
    throw new Error('createSupersedingInstance requires FileLocalPacketStore');
  }

  const prior = await store.getById(priorId);
  if (!prior) {
    throw new PacketNotFoundError(priorId);
  }
  if (prior.status === 'SUPERSEDED') {
    throw new Error(`Packet ${priorId} is already SUPERSEDED`);
  }
  if (prior.revision !== expectedRevision) {
    throw new StaleWriteError(priorId, expectedRevision, prior.revision);
  }

  // Mutation 1: mark prior SUPERSEDED (module-private allowTerminal path).
  const markedPrior = await applyUpdate(
    store,
    priorId,
    expectedRevision,
    { status: 'SUPERSEDED' },
    {
      actor: input.actor,
      reason: input.reason ?? null,
      auditEventType: 'packet.superseded',
    },
    true,
  );

  // Mutation 2: create successor (public create emits packet.template_selected).
  const createInput: CreatePacketInstanceInput = {
    agencyId: prior.agencyId,
    eventFamilyId: prior.eventFamilyId,
    eventInstanceId: input.eventInstanceId ?? prior.eventInstanceId,
    archetypeId: prior.archetypeId,
    archetypeVersion: prior.archetypeVersion,
    packetTemplateId: input.packetTemplateId ?? prior.packetTemplateId,
    workflowId: prior.workflowId,
    workflowInstanceId: input.workflowInstanceId ?? prior.workflowInstanceId,
    createdBy,
    packetId: input.packetId ?? prior.packetId,
    subtype: prior.subtype,
    reportingPeriodStart: prior.reportingPeriodStart,
    reportingPeriodEnd: prior.reportingPeriodEnd,
    dataThroughDate: prior.dataThroughDate,
    status: input.status ?? 'SOURCE_COLLECTION',
    sourceClassification: prior.sourceClassification,
    supersedesPacketInstanceId: prior.packetInstanceId,
    actor: input.actor,
    reason: input.reason ?? null,
  };

  const created = await store.createPacketInstance(createInput);
  if (!created.created) {
    throw new Error(
      `Superseding create returned existing instance ${created.instance.packetInstanceId}; expected a new instance`,
    );
  }

  // Mutation 3: link prior → successor.
  const linkedPrior = await applyUpdate(
    store,
    prior.packetInstanceId,
    markedPrior.revision,
    { supersededByPacketInstanceId: created.instance.packetInstanceId },
    {
      actor: input.actor,
      reason: input.reason ?? null,
      auditEventType: 'packet.edited',
    },
    true,
  );

  return { prior: linkedPrior, next: created.instance };
}
