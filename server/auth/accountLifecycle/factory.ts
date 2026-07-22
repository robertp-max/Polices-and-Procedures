/**
 * Account-lifecycle store factory (ADR-0002 2B).
 *
 * Selects the durable DynamoDB adapter when the existing registration table is
 * configured, else the fail-closed Unavailable adapter. It is intentionally
 * SEPARATE from getAppIdentityPersistence() — lifecycle CAS never lives inside
 * the whole-registry persistence class. There is NO file-local mutation adapter.
 */
import { env } from '../../env.js';
import type { AccountLifecycleStore, LifecycleStoreDeps } from './store.js';
import { DynamoAccountLifecycleStore, type LifecycleDynamoClient } from './dynamoStore.js';
import { UnavailableAccountLifecycleStore } from './unavailableStore.js';

const defaultDeps: LifecycleStoreDeps = { nowIso: () => new Date().toISOString() };

/** Lazily-initialized real DynamoDB document client (imported on first use).
 *  Commands are emitted as tagged wrappers and translated into real SDK command
 *  instances at send time (the SDK is imported asynchronously). */
type Kind = 'Get' | 'Put' | 'Update' | 'TransactWrite';
interface Tagged { __kind: Kind; input: unknown }
const tagged = (kind: Kind) => class { readonly __kind = kind; input: unknown; constructor(i: unknown) { this.input = i; } };

function buildRealDynamoClient(region: string): LifecycleDynamoClient {
  let inner: { doc: { send: (c: unknown) => Promise<unknown> }; ctors: Record<Kind, new (i: unknown) => unknown> } | null = null;
  async function init() {
    if (inner) return inner;
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const lib = await import('@aws-sdk/lib-dynamodb');
    const base = new DynamoDBClient({ region: region || 'us-west-1' });
    inner = {
      doc: lib.DynamoDBDocumentClient.from(base) as unknown as { send: (c: unknown) => Promise<unknown> },
      ctors: {
        Get: lib.GetCommand as unknown as new (i: unknown) => unknown,
        Put: lib.PutCommand as unknown as new (i: unknown) => unknown,
        Update: lib.UpdateCommand as unknown as new (i: unknown) => unknown,
        TransactWrite: lib.TransactWriteCommand as unknown as new (i: unknown) => unknown,
      },
    };
    return inner;
  }
  return {
    async send(cmd: unknown) {
      const { doc, ctors } = await init();
      const t = cmd as Tagged;
      const real = new ctors[t.__kind](t.input);
      return doc.send(real);
    },
    cmds: {
      Get: tagged('Get') as unknown as new (i: unknown) => unknown,
      Put: tagged('Put') as unknown as new (i: unknown) => unknown,
      Update: tagged('Update') as unknown as new (i: unknown) => unknown,
      TransactWrite: tagged('TransactWrite') as unknown as new (i: unknown) => unknown,
    },
  };
}

let cached: AccountLifecycleStore | null = null;

/** Build (and cache) the account-lifecycle store for the current environment. */
export function getAccountLifecycleStore(deps: LifecycleStoreDeps = defaultDeps): AccountLifecycleStore {
  if (cached) return cached;
  const table = env.registrationTableName;
  cached = table
    ? new DynamoAccountLifecycleStore(table, buildRealDynamoClient(env.awsRegion), deps)
    : new UnavailableAccountLifecycleStore();
  return cached;
}

/** Test seam: reset the cached store. */
export function __resetAccountLifecycleStoreForTests(): void { cached = null; }
