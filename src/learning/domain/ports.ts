/**
 * Care Indeed LMS — domain ports (hexagonal boundaries).
 *
 * The domain depends only on these interfaces. Phase-1 adapters implement them on
 * Google Cloud (Firestore/GCS/Cloud KMS/Cloud Tasks per ADR-LEARNING-001); tests use
 * in-memory fakes. No cloud SDK types appear here.
 */
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
} from './types';

/** Wall clock — injected so tests are deterministic (Date is otherwise ambient). */
export interface Clock {
  now(): Date;
}

/** Resolves whether an exact content revision can be launched (§5.2). */
export interface ContentRegistry {
  resolve(id: string, version: string): Promise<ContentRevision | null>;
  /** True only when the adapter can resolve AND launch the exact version+hash. */
  isAvailable(id: string, version: string, sha256: string): Promise<boolean>;
}

/** Append-only event + outbox writer (ADR-LEARNING-002). */
export interface LearningEventStore {
  append(event: LearningActivityEvent): Promise<void>;
  /** Returns true if an event with this idempotencyKey was already recorded. */
  seen(idempotencyKey: string): Promise<boolean>;
}

/** KMS-backed signer for GateDecisions and certificate manifests (ADR-LEARNING-005). */
export interface Signer {
  sign(payloadSha256: string): Promise<string>;
  verify(payloadSha256: string, signature: string): Promise<boolean>;
}

/** Immutable artifact storage (GCS): staging → validated promotion. */
export interface ArtifactStore {
  putStaging(key: string, bytes: Uint8Array, contentType: string): Promise<{ locator: string; sha256: string }>;
  promote(stagingLocator: string): Promise<{ locator: string; versionId: string; sha256: string }>;
  signedDownloadUrl(locator: string, ttlSeconds: number): Promise<string>;
}

/** Async job dispatch (Cloud Tasks / Pub-Sub) via the outbox relay. */
export interface JobQueue {
  enqueue(queue: string, payload: Record<string, unknown>, idempotencyKey: string): Promise<void>;
}

/** Persistence for the per-subject learning record aggregate (Firestore). */
export interface LearningRecordStore {
  getRoleAssignments(subjectId: string): Promise<RoleAssignment[]>;
  putAssignment(a: LearningAssignment): Promise<void>;
  getAssignment(subjectId: string, assignmentId: string): Promise<LearningAssignment | null>;
  listAssignments(subjectId: string): Promise<LearningAssignment[]>;

  listAttempts(assignmentId: string): Promise<AssessmentAttempt[]>;
  appendAttempt(a: AssessmentAttempt): Promise<void>;
  putScore(s: ScoreResult): Promise<void>;
  putGrade(g: GradeResult): Promise<void>;

  listEvidence(subjectId: string): Promise<CompletionEvidence[]>;
  listSignoffs(assignmentId: string): Promise<SignoffRecord[]>;

  putGateDecision(d: GateDecision): Promise<void>;
  putCertificate(c: CertificateRecord): Promise<void>;

  /** Published, versioned requirement definitions applicable to resolution. */
  listPublishedRequirements(): Promise<RequirementDefinition[]>;
}
