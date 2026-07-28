/**
 * Care Indeed LMS — in-memory port adapters.
 *
 * Runnable, dependency-free implementations of the domain ports (ports.ts) for
 * local runs, integration tests, and the migration shadow harness. The production
 * GCP adapters (Firestore/GCS/Cloud KMS/Cloud Tasks — ADR-LEARNING-001) implement
 * the exact same interfaces; swapping them requires no domain change.
 */
import type {
  ArtifactStore,
  Clock,
  ContentRegistry,
  JobQueue,
  LearningEventStore,
  LearningRecordStore,
  Signer,
} from '../domain/ports';
import type {
  AssessmentAttempt,
  CertificateRecord,
  CompletionEvidence,
  ContentRevision,
  GateDecision,
  GradeResult,
  LearningActivityEvent,
  LearningAssignment,
  RequirementDefinition,
  RoleAssignment,
  ScoreResult,
  SignoffRecord,
} from '../domain/types';

export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return this.current;
  }
  set(next: Date): void {
    this.current = next;
  }
}

export class MemoryContentRegistry implements ContentRegistry {
  private revisions = new Map<string, ContentRevision>();
  private key(id: string, version: string) {
    return `${id}@${version}`;
  }
  put(rev: ContentRevision): void {
    this.revisions.set(this.key(rev.id, rev.version), rev);
  }
  async resolve(id: string, version: string): Promise<ContentRevision | null> {
    return this.revisions.get(this.key(id, version)) ?? null;
  }
  async isAvailable(id: string, version: string, sha256: string): Promise<boolean> {
    const r = this.revisions.get(this.key(id, version));
    return !!r && r.available && r.sha256 === sha256;
  }
}

export class MemoryEventStore implements LearningEventStore {
  readonly events: LearningActivityEvent[] = [];
  private keys = new Set<string>();
  async append(event: LearningActivityEvent): Promise<void> {
    if (this.keys.has(event.idempotencyKey)) return; // idempotent
    this.keys.add(event.idempotencyKey);
    this.events.push(event);
  }
  async seen(idempotencyKey: string): Promise<boolean> {
    return this.keys.has(idempotencyKey);
  }
}

/** Deterministic non-cryptographic signer stand-in for Cloud KMS (tests only). */
export class MemorySigner implements Signer {
  constructor(private secret = 'test-key') {}
  private mac(payloadSha256: string): string {
    let h = 2166136261 >>> 0;
    for (const ch of `${this.secret}:${payloadSha256}`) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return `kms_${h.toString(16)}`;
  }
  async sign(payloadSha256: string): Promise<string> {
    return this.mac(payloadSha256);
  }
  async verify(payloadSha256: string, signature: string): Promise<boolean> {
    return this.mac(payloadSha256) === signature;
  }
}

export class MemoryArtifactStore implements ArtifactStore {
  private staging = new Map<string, { bytes: Uint8Array; contentType: string; sha256: string }>();
  private artifacts = new Map<string, { bytes: Uint8Array; versionId: string; sha256: string }>();
  private seq = 0;
  private hash(bytes: Uint8Array): string {
    let h = 5381;
    for (let i = 0; i < bytes.length; i++) h = ((h << 5) + h + bytes[i]) >>> 0;
    return `sha_${h.toString(16)}`;
  }
  async putStaging(key: string, bytes: Uint8Array, contentType: string) {
    const sha256 = this.hash(bytes);
    const locator = `gs://staging/${key}`;
    this.staging.set(locator, { bytes, contentType, sha256 });
    return { locator, sha256 };
  }
  async promote(stagingLocator: string) {
    const s = this.staging.get(stagingLocator);
    if (!s) throw new Error('STAGING_NOT_FOUND');
    const locator = stagingLocator.replace('gs://staging/', 'gs://artifacts/');
    const versionId = `v${++this.seq}`;
    this.artifacts.set(locator, { bytes: s.bytes, versionId, sha256: s.sha256 });
    return { locator, versionId, sha256: s.sha256 };
  }
  async signedDownloadUrl(locator: string, ttlSeconds: number): Promise<string> {
    return `${locator}?exp=${ttlSeconds}`;
  }
}

export class MemoryJobQueue implements JobQueue {
  readonly jobs: { queue: string; payload: Record<string, unknown>; idempotencyKey: string }[] = [];
  private keys = new Set<string>();
  async enqueue(queue: string, payload: Record<string, unknown>, idempotencyKey: string): Promise<void> {
    if (this.keys.has(idempotencyKey)) return;
    this.keys.add(idempotencyKey);
    this.jobs.push({ queue, payload, idempotencyKey });
  }
}

export class MemoryRecordStore implements LearningRecordStore {
  roles = new Map<string, RoleAssignment[]>();
  assignments = new Map<string, LearningAssignment>();
  attempts = new Map<string, AssessmentAttempt[]>();
  scores: ScoreResult[] = [];
  grades = new Map<string, GradeResult>();
  evidence = new Map<string, CompletionEvidence[]>();
  signoffs = new Map<string, SignoffRecord[]>();
  gates: GateDecision[] = [];
  certificates: CertificateRecord[] = [];
  requirements: RequirementDefinition[] = [];

  async getRoleAssignments(subjectId: string) {
    return this.roles.get(subjectId) ?? [];
  }
  async putAssignment(a: LearningAssignment) {
    this.assignments.set(a.id, a);
  }
  async getAssignment(_subjectId: string, assignmentId: string) {
    return this.assignments.get(assignmentId) ?? null;
  }
  async listAssignments(subjectId: string) {
    return [...this.assignments.values()].filter((a) => a.subjectId === subjectId);
  }
  async listAttempts(assignmentId: string) {
    return this.attempts.get(assignmentId) ?? [];
  }
  async appendAttempt(a: AssessmentAttempt) {
    const list = this.attempts.get(a.assignmentId) ?? [];
    list.push(a);
    this.attempts.set(a.assignmentId, list);
  }
  async putScore(s: ScoreResult) {
    this.scores.push(s);
  }
  async putGrade(g: GradeResult) {
    this.grades.set(g.assignmentId, g);
  }
  async listEvidence(subjectId: string) {
    return this.evidence.get(subjectId) ?? [];
  }
  async listSignoffs(assignmentId: string) {
    return this.signoffs.get(assignmentId) ?? [];
  }
  async putGateDecision(d: GateDecision) {
    this.gates.push(d);
  }
  async putCertificate(c: CertificateRecord) {
    this.certificates.push(c);
  }
  async listPublishedRequirements() {
    return this.requirements.filter((r) => r.status === 'PUBLISHED');
  }
}

export interface MemoryEnv {
  clock: FixedClock;
  content: MemoryContentRegistry;
  events: MemoryEventStore;
  signer: MemorySigner;
  artifacts: MemoryArtifactStore;
  jobs: MemoryJobQueue;
  records: MemoryRecordStore;
}

export function makeMemoryEnv(now: Date): MemoryEnv {
  return {
    clock: new FixedClock(now),
    content: new MemoryContentRegistry(),
    events: new MemoryEventStore(),
    signer: new MemorySigner(),
    artifacts: new MemoryArtifactStore(),
    jobs: new MemoryJobQueue(),
    records: new MemoryRecordStore(),
  };
}
