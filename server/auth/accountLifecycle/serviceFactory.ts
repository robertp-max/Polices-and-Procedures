/**
 * Account-lifecycle service assembly (ADR-0002 Phase 2E).
 *
 * Wires the orchestration service to real substrates: the durable DynamoDB
 * lifecycle store (or the fail-closed Unavailable adapter), admin-initiated
 * Cognito commands, the two legacy-plane projections, and the append-only audit
 * stream. Under the HARD-CUT policy the service will 503 whenever the durable
 * store is not configured — never silently falling back to a canonical-only
 * mutation (that was the two-plane defect).
 *
 * The Cognito SDK is imported lazily via tagged command wrappers (mirroring the
 * lifecycle store factory) so importing this module never binds the SDK.
 */
import crypto from 'node:crypto';
import { env } from '../../env.js';
import { getAppIdentityPersistence } from '../appIdentityPersistence.js';
import { buildDemoAuthServiceFromEnv } from '../service.js';
import { getAccountLifecycleStore } from './factory.js';
import { createLifecycleProjections } from './projections.js';
import { createLifecycleAuditSink } from './auditSink.js';
import { createCognitoLifecycleProvider, type CognitoAdminClient } from './cognitoProvider.js';
import { AccountLifecycleService } from './service.js';

type Kind = 'AdminDisableUser' | 'AdminEnableUser' | 'AdminUserGlobalSignOut';
interface Tagged { __kind: Kind; input: unknown }
const tagged = (kind: Kind) => class { readonly __kind = kind; input: unknown; constructor(i: unknown) { this.input = i; } };

function buildCognitoAdminClient(region: string): CognitoAdminClient {
  let inner: { client: { send: (c: unknown) => Promise<unknown> }; ctors: Record<Kind, new (i: unknown) => unknown> } | null = null;
  async function init() {
    if (inner) return inner;
    const sdk = await import('@aws-sdk/client-cognito-identity-provider');
    const client = new sdk.CognitoIdentityProviderClient({ region: region || 'us-west-1' });
    inner = {
      client: client as unknown as { send: (c: unknown) => Promise<unknown> },
      ctors: {
        AdminDisableUser: sdk.AdminDisableUserCommand as unknown as new (i: unknown) => unknown,
        AdminEnableUser: sdk.AdminEnableUserCommand as unknown as new (i: unknown) => unknown,
        AdminUserGlobalSignOut: sdk.AdminUserGlobalSignOutCommand as unknown as new (i: unknown) => unknown,
      },
    };
    return inner;
  }
  return {
    async send(cmd: unknown) {
      const { client, ctors } = await init();
      const t = cmd as Tagged;
      return client.send(new ctors[t.__kind](t.input));
    },
    commands: {
      AdminDisableUser: tagged('AdminDisableUser') as unknown as new (i: { UserPoolId: string; Username: string }) => unknown,
      AdminEnableUser: tagged('AdminEnableUser') as unknown as new (i: { UserPoolId: string; Username: string }) => unknown,
      AdminUserGlobalSignOut: tagged('AdminUserGlobalSignOut') as unknown as new (i: { UserPoolId: string; Username: string }) => unknown,
    },
  };
}

let cached: AccountLifecycleService | null = null;

/** Build (and cache) the account-lifecycle orchestration service. */
export function getAccountLifecycleService(): AccountLifecycleService {
  if (cached) return cached;
  const authService = buildDemoAuthServiceFromEnv(process.env);
  cached = new AccountLifecycleService({
    store: getAccountLifecycleStore(),
    provider: createCognitoLifecycleProvider(buildCognitoAdminClient(env.awsRegion), env.cognitoUserPoolId),
    projections: createLifecycleProjections({
      setRegistrationAccess: (email, access) => authService.setRegistrationLifecycleAccess(email, access),
      getCanonicalRegistry: () => getAppIdentityPersistence().getAll(),
      putCanonicalRegistry: (registry) => getAppIdentityPersistence().putAll(registry),
    }),
    audit: createLifecycleAuditSink(),
    newOperationId: () => crypto.randomUUID(),
    newCorrelationId: () => crypto.randomUUID(),
  });
  return cached;
}

/** Test seam: reset the cached service. */
export function __resetAccountLifecycleServiceForTests(): void { cached = null; }
