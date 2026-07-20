/**
 * Cognito-backed LifecycleProviderClient (ADR-0002 Phase 2C).
 *
 * The real provider seam the orchestration service uses in production. It maps
 * the three lifecycle provider operations to admin-initiated Cognito commands:
 *   - disableUser      → AdminDisableUserCommand
 *   - enableUser       → AdminEnableUserCommand
 *   - globalSignOut    → AdminUserGlobalSignOutCommand
 *
 * ADMIN-initiated commands are used deliberately: an operator suspending another
 * user has no access token for the target, so GlobalSignOutCommand (which needs
 * the target's own token) is NOT appropriate — AdminUserGlobalSignOut revokes
 * all of the target's sessions by username.
 *
 * All three are idempotent (disabling an already-disabled user, enabling an
 * already-enabled user, and repeated admin sign-out are no-op successes), which
 * the orchestrator's crash-resume relies on. The provider client is injected as
 * a thin `send(command)` seam so this module never binds the SDK at import time
 * and stays trivially fakeable in tests.
 */
import type { LifecycleProviderClient, LifecycleProviderTarget } from './service.js';

/** Minimal Cognito seam: a `send` plus the three admin command constructors. */
export interface CognitoAdminClient {
  send(command: unknown): Promise<unknown>;
  commands: {
    AdminDisableUser: new (input: { UserPoolId: string; Username: string }) => unknown;
    AdminEnableUser: new (input: { UserPoolId: string; Username: string }) => unknown;
    AdminUserGlobalSignOut: new (input: { UserPoolId: string; Username: string }) => unknown;
  };
}

export function createCognitoLifecycleProvider(client: CognitoAdminClient, userPoolId: string): LifecycleProviderClient {
  const username = (t: LifecycleProviderTarget): string => {
    // The provider username is the Cognito Username binding for the canonical
    // user; it is never the email and never derived from client input here.
    const u = String(t.providerUsername ?? '').trim();
    if (!u) throw new Error('AdminProviderUsernameMissing');
    return u;
  };
  return {
    async disableUser(t) {
      await client.send(new client.commands.AdminDisableUser({ UserPoolId: userPoolId, Username: username(t) }));
    },
    async enableUser(t) {
      await client.send(new client.commands.AdminEnableUser({ UserPoolId: userPoolId, Username: username(t) }));
    },
    async globalSignOut(t) {
      await client.send(new client.commands.AdminUserGlobalSignOut({ UserPoolId: userPoolId, Username: username(t) }));
    },
  };
}
