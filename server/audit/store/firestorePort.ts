/**
 * Firestore port — the minimal transactional surface the FirestoreAuditEventStore
 * needs, plus a transaction-accurate in-memory fake for tests.
 *
 * The real binding (a thin adapter over `@google-cloud/firestore` /
 * firebase-admin) is deliberately NOT added here: no Firebase Admin dependency
 * is introduced, nothing is provisioned, and no live Firestore is contacted.
 * The store's transactional algorithm is fully exercised against the fake,
 * which enforces Firestore's optimistic-concurrency semantics (read-set
 * conflict → retry) so concurrency behavior is provable without a live backend.
 */

export interface DocSnapshot<T = Record<string, unknown>> {
  exists: boolean;
  data(): T | undefined;
}

export interface DocRef {
  readonly collection: string;
  readonly id: string;
}

export interface Transaction {
  get<T = Record<string, unknown>>(ref: DocRef): Promise<DocSnapshot<T>>;
  set(ref: DocRef, data: Record<string, unknown>): void;
}

export interface FirestoreLike {
  doc(collection: string, id: string): DocRef;
  runTransaction<T>(fn: (txn: Transaction) => Promise<T>): Promise<T>;
  /** Read every doc in a collection (audit reads/verification; not in a txn). */
  listCollection<T = Record<string, unknown>>(collection: string): Promise<T[]>;
}

export class FirestoreContention extends Error {
  constructor() { super('firestore_contention'); this.name = 'FirestoreContention'; }
}

interface StoredDoc { version: number; data: Record<string, unknown> }

/**
 * In-memory Firestore fake with real transaction semantics:
 *  - a transaction records the version of every doc it reads;
 *  - buffered writes are applied atomically on commit ONLY IF no read doc was
 *    changed by another transaction since it was read (else FirestoreContention);
 *  - runTransaction retries on contention (bounded), exactly like Firestore.
 */
export class InMemoryFirestore implements FirestoreLike {
  private readonly docs = new Map<string, StoredDoc>();
  /** Optional hook to interleave a concurrent mutation right after reads. */
  onAfterReads?: () => Promise<void> | void;
  private readonly maxAttempts: number;

  constructor(opts: { maxAttempts?: number } = {}) {
    this.maxAttempts = opts.maxAttempts ?? 8;
  }

  private key(ref: DocRef): string { return `${ref.collection}/${ref.id}`; }

  doc(collection: string, id: string): DocRef {
    return { collection, id };
  }

  async listCollection<T = Record<string, unknown>>(collection: string): Promise<T[]> {
    const out: T[] = [];
    for (const [k, v] of this.docs) {
      if (k.startsWith(`${collection}/`)) out.push(v.data as T);
    }
    return out;
  }

  async runTransaction<T>(fn: (txn: Transaction) => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const readVersions = new Map<string, number>();
      const writes = new Map<string, Record<string, unknown>>();
      let interleaved = false;

      const txn: Transaction = {
        get: async <G = Record<string, unknown>>(ref: DocRef): Promise<DocSnapshot<G>> => {
          const k = this.key(ref);
          const cur = this.docs.get(k);
          readVersions.set(k, cur?.version ?? 0);
          // Simulate a concurrent writer landing after this txn's reads, once.
          if (!interleaved && this.onAfterReads) {
            interleaved = true;
            await this.onAfterReads();
          }
          return {
            exists: !!cur,
            data: () => (cur ? ({ ...cur.data } as unknown as G) : undefined),
          };
        },
        set: (ref: DocRef, data: Record<string, unknown>) => {
          writes.set(this.key(ref), { ...data });
        },
      };

      // Application errors propagate (no retry); only commit contention retries.
      const result: T = await fn(txn);

      // Commit: verify read-set unchanged, then apply writes atomically.
      let conflict = false;
      for (const [k, ver] of readVersions) {
        if ((this.docs.get(k)?.version ?? 0) !== ver) { conflict = true; break; }
      }
      if (conflict) {
        if (attempt === this.maxAttempts) throw new FirestoreContention();
        continue; // retry
      }
      for (const [k, data] of writes) {
        const prev = this.docs.get(k);
        this.docs.set(k, { version: (prev?.version ?? 0) + 1, data });
      }
      return result;
    }
    throw new FirestoreContention();
  }

  /** Test helper: direct write bypassing transactions (for interleaving). */
  _rawSet(collection: string, id: string, data: Record<string, unknown>): void {
    const k = `${collection}/${id}`;
    const prev = this.docs.get(k);
    this.docs.set(k, { version: (prev?.version ?? 0) + 1, data });
  }
}
