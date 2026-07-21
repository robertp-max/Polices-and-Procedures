/**
 * Concrete Firebase Admin SDK binding for the Firestore audit backend.
 *
 * Server-side only. Uses Application Default Credentials; the Firestore
 * emulator is auto-detected via FIRESTORE_EMULATOR_HOST. No service-account
 * JSON key is read from the repository. This module is imported only when the
 * firestore backend is explicitly selected (see factory.ts).
 *
 * Accepted configuration:
 *   GOOGLE_CLOUD_PROJECT / GCLOUD_PROJECT  — GCP project id
 *   FIRESTORE_DATABASE_ID                  — optional named database (default "(default)")
 *   FIRESTORE_EMULATOR_HOST                — host:port for the emulator (auto-detected by the SDK)
 */
import { getApps, initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, FieldPath, type Firestore } from 'firebase-admin/firestore';
import type { DocRef, DocSnapshot, FirestoreLike, PageResult, Transaction } from './firestorePort.js';

export class AuditStoreInitError extends Error {
  constructor(msg: string, public cause?: unknown) { super(msg); this.name = 'AuditStoreInitError'; }
}

const APP_NAME = 'cihh-audit';

/** Adapter mapping firebase-admin Firestore to the FirestoreLike port. */
export class AdminFirestoreAdapter implements FirestoreLike {
  constructor(private readonly db: Firestore) {}

  doc(collection: string, id: string): DocRef { return { collection, id }; }

  private ref(ref: DocRef) { return this.db.doc(`${ref.collection}/${ref.id}`); }

  async runTransaction<T>(fn: (txn: Transaction) => Promise<T>): Promise<T> {
    const runOnce = () => this.db.runTransaction(async (t) => {
      const wrapper: Transaction = {
        get: async <G = Record<string, unknown>>(ref: DocRef): Promise<DocSnapshot<G>> => {
          const snap = await t.get(this.ref(ref));
          return { exists: snap.exists, data: () => snap.data() as G | undefined };
        },
        create: (ref: DocRef, data: Record<string, unknown>) => { t.create(this.ref(ref), data); },
        set: (ref: DocRef, data: Record<string, unknown>) => { t.set(this.ref(ref), data); },
      };
      return fn(wrapper);
    }, { maxAttempts: 1 });

    // Contention retry: a hot stream-head document under heavy concurrency
    // surfaces ABORTED / "Transaction lock timeout" that the SDK does not
    // classify as transient. We own the retry here with SHORT backoff + jitter
    // so contending appends re-submit promptly and the per-document lock cycles
    // quickly (long backoffs idle the herd and balloon latency). The callback's
    // inputs are retry-stable (event_id/timestamp fixed by the caller before
    // the transaction), so a retry re-derives the same event for its allocated
    // sequence + prior hash.
    const maxOuter = 60;
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await runOnce();
      } catch (e) {
        const code = (e as { code?: number }).code;
        const msg = String((e as Error).message ?? '');
        const retryable = code === 10 /* ABORTED */ || /aborted|lock timeout|contention|deadline exceeded/i.test(msg);
        if (!retryable || attempt >= maxOuter) throw e;
        const backoff = Math.min(150, 5 + 3 * attempt) + Math.floor(Math.random() * 20);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  async listCollection<T = Record<string, unknown>>(collection: string): Promise<T[]> {
    const snap = await this.db.collection(collection).get();
    return snap.docs.map(d => d.data() as T);
  }

  async listCollectionPaged<T = Record<string, unknown>>(
    collection: string, opts: { pageSize: number; startAfterId?: string },
  ): Promise<PageResult<T>> {
    let q = this.db.collection(collection).orderBy(FieldPath.documentId()).limit(opts.pageSize);
    if (opts.startAfterId) q = q.startAfter(opts.startAfterId);
    const snap = await q.get();
    return {
      docs: snap.docs.map(d => d.data() as T),
      lastId: snap.size === opts.pageSize ? snap.docs[snap.docs.length - 1].id : undefined,
    };
  }
}

let cachedApp: App | null = null;
let cachedAdapter: AdminFirestoreAdapter | null = null;

/**
 * Initialize (once) the Admin app + Firestore and return the port adapter.
 * Fail-closed: any initialization error throws AuditStoreInitError.
 */
export function initAdminFirestore(env: NodeJS.ProcessEnv = process.env): AdminFirestoreAdapter {
  if (cachedAdapter) return cachedAdapter;
  try {
    const projectId = env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT || undefined;
    const databaseId = env.FIRESTORE_DATABASE_ID || undefined;
    if (!cachedApp) {
      const existing = getApps().find(a => a.name === APP_NAME);
      cachedApp = existing ?? initializeApp({ credential: applicationDefault(), projectId }, APP_NAME);
    }
    const db = databaseId ? getFirestore(cachedApp, databaseId) : getFirestore(cachedApp);
    // Firestore rejects undefined field values. Optional audit-event fields are
    // undefined when unset; omitting them matches the v2 canonical hash (which
    // omits undefined) and JSONL's JSON.stringify semantics, so the stored doc
    // round-trips to the same hash. Must be set once, before first use.
    db.settings({ ignoreUndefinedProperties: true });
    cachedAdapter = new AdminFirestoreAdapter(db);
    return cachedAdapter;
  } catch (e) {
    throw new AuditStoreInitError(
      'Failed to initialize Firebase Admin Firestore for the audit backend. '
      + 'Verify GOOGLE_CLOUD_PROJECT / credentials (ADC) / FIRESTORE_EMULATOR_HOST. '
      + 'The audit store will NOT fall back to JSONL.',
      e,
    );
  }
}

/** Test hook. */
export function _resetAdminFirestore(): void {
  cachedApp = null;
  cachedAdapter = null;
}
