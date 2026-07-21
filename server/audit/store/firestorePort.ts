/**
 * Firestore port — the minimal transactional + query surface the
 * FirestoreAuditEventStore needs, plus a transaction-accurate in-memory fake
 * for tests.
 *
 * A concrete binding over firebase-admin Firestore is in ./firebaseAdmin.ts.
 * The in-memory fake enforces Firestore semantics used by the store:
 *   - optimistic-concurrency transactions (read-set conflict -> retry);
 *   - create() fails if the document already exists (immutability + collision);
 *   - ordered, bounded pagination by document id.
 */

export interface DocSnapshot<T = Record<string, unknown>> {
  exists: boolean;
  data(): T | undefined;
}

export interface DocRef {
  /** Collection path (may be nested, e.g. audit_streams/{h}/events). */
  readonly collection: string;
  readonly id: string;
}

export interface Transaction {
  get<T = Record<string, unknown>>(ref: DocRef): Promise<DocSnapshot<T>>;
  /** Create-only: fails the transaction if the document already exists. */
  create(ref: DocRef, data: Record<string, unknown>): void;
  /** Create-or-overwrite (used for the mutable stream head only). */
  set(ref: DocRef, data: Record<string, unknown>): void;
}

export interface PageResult<T> {
  docs: T[];
  /** Id to pass as startAfterId for the next page; undefined when exhausted. */
  lastId?: string;
}

export interface FirestoreLike {
  doc(collection: string, id: string): DocRef;
  runTransaction<T>(fn: (txn: Transaction) => Promise<T>): Promise<T>;
  /** Immediate children docs of a collection path (bounded collections only). */
  listCollection<T = Record<string, unknown>>(collection: string): Promise<T[]>;
  /** Bounded, ordered-by-id pagination for potentially large collections. */
  listCollectionPaged<T = Record<string, unknown>>(
    collection: string, opts: { pageSize: number; startAfterId?: string },
  ): Promise<PageResult<T>>;
}

export class FirestoreContention extends Error {
  constructor() { super('firestore_contention'); this.name = 'FirestoreContention'; }
}

export class FirestoreAlreadyExists extends Error {
  constructor(public path: string) { super(`document already exists: ${path}`); this.name = 'FirestoreAlreadyExists'; }
}

interface StoredDoc { version: number; data: Record<string, unknown> }

/**
 * In-memory Firestore fake with real transaction semantics:
 *  - a transaction records the version of every doc it reads (read-set);
 *  - create() buffers a create and, on commit, fails if the doc exists;
 *  - buffered writes apply atomically on commit ONLY IF no read doc changed
 *    since it was read (else FirestoreContention -> bounded retry).
 */
export class InMemoryFirestore implements FirestoreLike {
  private readonly docs = new Map<string, StoredDoc>();
  onAfterReads?: () => Promise<void> | void;
  private readonly maxAttempts: number;

  constructor(opts: { maxAttempts?: number } = {}) {
    this.maxAttempts = opts.maxAttempts ?? 12;
  }

  private key(ref: DocRef): string { return `${ref.collection}/${ref.id}`; }

  doc(collection: string, id: string): DocRef { return { collection, id }; }

  async listCollection<T = Record<string, unknown>>(collection: string): Promise<T[]> {
    const prefix = `${collection}/`;
    const out: T[] = [];
    for (const [k, v] of this.docs) {
      // immediate children only (no deeper nesting)
      if (k.startsWith(prefix) && !k.slice(prefix.length).includes('/')) out.push(v.data as T);
    }
    return out;
  }

  async listCollectionPaged<T = Record<string, unknown>>(
    collection: string, opts: { pageSize: number; startAfterId?: string },
  ): Promise<PageResult<T>> {
    const prefix = `${collection}/`;
    const ids = [...this.docs.keys()]
      .filter(k => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
      .map(k => k.slice(prefix.length))
      .sort();
    const start = opts.startAfterId ? ids.findIndex(id => id > opts.startAfterId!) : 0;
    const from = start === -1 ? ids.length : (opts.startAfterId ? start : 0);
    const page = ids.slice(from, from + opts.pageSize);
    const docs = page.map(id => this.docs.get(`${collection}/${id}`)!.data as T);
    return { docs, lastId: page.length === opts.pageSize ? page[page.length - 1] : undefined };
  }

  async runTransaction<T>(fn: (txn: Transaction) => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const readVersions = new Map<string, number>();
      const creates = new Map<string, Record<string, unknown>>();
      const sets = new Map<string, Record<string, unknown>>();
      let interleaved = false;

      const txn: Transaction = {
        get: async <G = Record<string, unknown>>(ref: DocRef): Promise<DocSnapshot<G>> => {
          const k = this.key(ref);
          const cur = this.docs.get(k);
          readVersions.set(k, cur?.version ?? 0);
          if (!interleaved && this.onAfterReads) { interleaved = true; await this.onAfterReads(); }
          return { exists: !!cur, data: () => (cur ? ({ ...cur.data } as unknown as G) : undefined) };
        },
        create: (ref: DocRef, data: Record<string, unknown>) => { creates.set(this.key(ref), { ...data }); },
        set: (ref: DocRef, data: Record<string, unknown>) => { sets.set(this.key(ref), { ...data }); },
      };

      // Application errors propagate (no retry); only commit contention retries.
      const result: T = await fn(txn);

      let conflict = false;
      for (const [k, ver] of readVersions) {
        if ((this.docs.get(k)?.version ?? 0) !== ver) { conflict = true; break; }
      }
      // create() must fail if the target already exists at commit time.
      for (const k of creates.keys()) {
        if (this.docs.has(k)) { conflict = true; break; }
      }
      if (conflict) {
        if (attempt === this.maxAttempts) throw new FirestoreContention();
        continue;
      }
      for (const [k, data] of creates) this.docs.set(k, { version: (this.docs.get(k)?.version ?? 0) + 1, data });
      for (const [k, data] of sets) this.docs.set(k, { version: (this.docs.get(k)?.version ?? 0) + 1, data });
      return result;
    }
    throw new FirestoreContention();
  }

  /** Test helper: direct write bypassing transactions (for interleaving). */
  _rawSet(collection: string, id: string, data: Record<string, unknown>): void {
    const k = `${collection}/${id}`;
    this.docs.set(k, { version: (this.docs.get(k)?.version ?? 0) + 1, data });
  }
}
