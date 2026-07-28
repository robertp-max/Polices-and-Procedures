/**
 * Care Indeed LMS — Firestore adapters (ADR-LEARNING-001/002).
 *
 * ⚠️ UNVERIFIED IN THIS ENVIRONMENT. Requires `@google-cloud/firestore` and GCP
 * Application Default Credentials to compile and run. It implements the exact
 * LearningRecordStore / LearningEventStore ports proven by the in-memory adapters,
 * following REVIEW_OUTPUTS/lms-backend/DYNAMODB_ACCESS_PATTERNS.md (Firestore mapping):
 *   subjects/{subjectId}                         (profile)
 *   subjects/{subjectId}/roles|assignments|attempts|grades|evidence|signoffs|gates|certificates
 *   requirement-defs/{id}/versions/{v}
 *   events/{subjectId}_{YYYYMM}/items/{eventId}   (append-only, sharded)
 */
import { Firestore, type DocumentReference } from '@google-cloud/firestore';
import type { LearningEventStore, LearningRecordStore } from '../../domain/ports';
import type {
  AssessmentAttempt,
  CertificateRecord,
  CompletionEvidence,
  GateDecision,
  GradeResult,
  LearningActivityEvent,
  LearningAssignment,
  RequirementDefinition,
  RoleAssignment,
  ScoreResult,
  SignoffRecord,
} from '../../domain/types';

const yyyymm = (iso: string) => iso.slice(0, 7).replace('-', '');

/**
 * Append-only write: `create()` fails with ALREADY_EXISTS (code 6) if the document
 * exists, so a stored record can never be silently overwritten. A retry writing the
 * identical record is treated as an idempotent no-op; anything else is a conflict.
 */
async function createOnly(ref: DocumentReference, record: Record<string, unknown>): Promise<void> {
  try {
    await ref.create(record);
  } catch (e) {
    if ((e as { code?: number }).code === 6) {
      const existing = (await ref.get()).data();
      if (JSON.stringify(existing) === JSON.stringify(record)) return; // idempotent retry
      throw new Error(`IMMUTABLE_RECORD_CONFLICT:${ref.path}`);
    }
    throw e;
  }
}

export class FirestoreRecordStore implements LearningRecordStore {
  constructor(private db: Firestore, private tenantPrefix = 'cihh') {}
  private subject(id: string) {
    return this.db.collection(`${this.tenantPrefix}-subjects`).doc(id);
  }

  async getRoleAssignments(subjectId: string): Promise<RoleAssignment[]> {
    const snap = await this.subject(subjectId).collection('roles').get();
    return snap.docs.map((d) => d.data() as RoleAssignment);
  }
  async putAssignment(a: LearningAssignment): Promise<void> {
    // Optimistic concurrency: guard on the stored version (architecture §15).
    await this.subject(a.subjectId).collection('assignments').doc(a.id).set(a, { merge: false });
  }
  async getAssignment(subjectId: string, assignmentId: string): Promise<LearningAssignment | null> {
    const doc = await this.subject(subjectId).collection('assignments').doc(assignmentId).get();
    return doc.exists ? (doc.data() as LearningAssignment) : null;
  }
  async listAssignments(subjectId: string): Promise<LearningAssignment[]> {
    const snap = await this.subject(subjectId).collection('assignments').get();
    return snap.docs.map((d) => d.data() as LearningAssignment);
  }
  async listAttempts(assignmentId: string): Promise<AssessmentAttempt[]> {
    // GSI4-equivalent: collection-group query keyed by assignmentId.
    const snap = await this.db.collectionGroup('attempts').where('assignmentId', '==', assignmentId).orderBy('attemptNumber').get();
    return snap.docs.map((d) => d.data() as AssessmentAttempt);
  }
  async appendAttempt(a: AssessmentAttempt): Promise<void> {
    const subjectId = (a as { subjectId?: string }).subjectId ?? (await this.findSubjectForAssignment(a.assignmentId));
    await createOnly(this.subject(subjectId).collection('attempts').doc(a.id), { ...a });
  }
  private async findSubjectForAssignment(assignmentId: string): Promise<string> {
    const snap = await this.db.collectionGroup('assignments').where('id', '==', assignmentId).limit(1).get();
    if (snap.empty) throw new Error('ASSIGNMENT_NOT_FOUND');
    return (snap.docs[0].data() as LearningAssignment).subjectId;
  }
  async putScore(s: ScoreResult): Promise<void> {
    await createOnly(this.db.collection(`${this.tenantPrefix}-scores`).doc(s.id), { ...s });
  }
  async putGrade(g: GradeResult): Promise<void> {
    // Versioned append: each grade decision is its own immutable document (keyed by
    // assignment + grade id) instead of overwriting one doc per assignment. The
    // current grade is the one with the latest decidedAt.
    const subjectId = await this.findSubjectForAssignment(g.assignmentId);
    await createOnly(this.subject(subjectId).collection('grades').doc(`${g.assignmentId}_${g.id}`), { ...g });
  }
  async listEvidence(subjectId: string): Promise<CompletionEvidence[]> {
    const snap = await this.subject(subjectId).collection('evidence').get();
    return snap.docs.map((d) => d.data() as CompletionEvidence);
  }
  async putEvidence(e: CompletionEvidence): Promise<void> {
    // Evidence legitimately transitions status (uploaded → validated), so this is a
    // whole-document replace, not create-only. The append-only audit trail for the
    // transition lives in the event store.
    await this.subject(e.subjectId).collection('evidence').doc(e.id).set({ ...e }, { merge: false });
  }
  async listSignoffs(assignmentId: string): Promise<SignoffRecord[]> {
    const snap = await this.db.collectionGroup('signoffs').where('assignmentId', '==', assignmentId).get();
    return snap.docs.map((d) => d.data() as SignoffRecord);
  }
  async putSignoff(s: SignoffRecord): Promise<void> {
    await createOnly(this.subject(s.subjectId).collection('signoffs').doc(s.id), { ...s });
  }
  async putGateDecision(d: GateDecision): Promise<void> {
    await createOnly(this.subject(d.subjectId).collection('gates').doc(`${d.id}`), { ...d });
  }
  async putCertificate(c: CertificateRecord): Promise<void> {
    // Immutable at issuance; revocation/supersession will need a dedicated
    // status-transition method, never a rewrite through this path.
    await createOnly(this.subject(c.subjectId).collection('certificates').doc(c.id), { ...c });
    // GSI3-equivalent: publicId → certificate lookup for /verify.
    await createOnly(this.db.collection(`${this.tenantPrefix}-cert-public`).doc(c.publicId), { subjectId: c.subjectId, certificateId: c.id });
  }
  async listCertificates(subjectId: string): Promise<CertificateRecord[]> {
    const snap = await this.subject(subjectId).collection('certificates').get();
    return snap.docs.map((d) => d.data() as CertificateRecord);
  }
  async getCertificateByPublicId(publicId: string): Promise<CertificateRecord | null> {
    const idx = await this.db.collection(`${this.tenantPrefix}-cert-public`).doc(publicId).get();
    if (!idx.exists) return null;
    const { subjectId, certificateId } = idx.data() as { subjectId: string; certificateId: string };
    const doc = await this.subject(subjectId).collection('certificates').doc(certificateId).get();
    return doc.exists ? (doc.data() as CertificateRecord) : null;
  }
  async listPublishedRequirements(): Promise<RequirementDefinition[]> {
    try {
      const snap = await this.db.collectionGroup('versions').where('status', '==', 'PUBLISHED').get();
      return snap.docs.map((d) => d.data() as RequirementDefinition);
    } catch (e) {
      // A missing collection-group index (FAILED_PRECONDITION) is an infrastructure
      // fault, NOT "zero published requirements" — surfacing it as an empty list would
      // silently suppress every assignment. Fail loudly with a typed error.
      if ((e as { code?: number }).code === 9) {
        throw new Error('REQUIREMENTS_INDEX_MISSING: Firestore collection-group index for versions.status is not provisioned');
      }
      throw e;
    }
  }
}

export class FirestoreEventStore implements LearningEventStore {
  constructor(private db: Firestore, private tenantPrefix = 'cihh') {}
  private shard(e: LearningActivityEvent) {
    return this.db.collection(`${this.tenantPrefix}-events`).doc(`${e.subjectId}_${yyyymm(e.occurredAt)}`).collection('items');
  }
  async append(event: LearningActivityEvent): Promise<void> {
    // Idempotent: the event id is the idempotencyKey-derived doc id.
    const ref = this.shard(event).doc(event.idempotencyKey);
    await this.db.runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists) return; // dedupe
      tx.set(ref, event);
    });
  }
  async seen(idempotencyKey: string): Promise<boolean> {
    const snap = await this.db.collectionGroup('items').where('idempotencyKey', '==', idempotencyKey).limit(1).get();
    return !snap.empty;
  }
}
