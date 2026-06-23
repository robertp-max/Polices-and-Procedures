/**
 * eCIgn Path B — Phase 2-live A: live-sandbox readiness gate (Gate B).
 *
 * Pure check that the explicit, non-secret preconditions for a LIVE sandbox are
 * present. Does NOT touch Google, network, or secrets. Until ready, live mode
 * must not be selected.
 */
import type { SandboxConfig } from './sandboxConfig';

export type LiveReadinessIssue = 'sandbox_disabled' | 'missing_sandbox_folder' | 'missing_credentials';

export interface LiveReadiness {
  readonly ready: boolean;
  readonly issues: readonly LiveReadinessIssue[];
}

export function assessLiveReadiness(cfg: SandboxConfig): LiveReadiness {
  const issues: LiveReadinessIssue[] = [];
  if (!cfg.enabled) issues.push('sandbox_disabled');
  if (cfg.sandboxDriveFolderId === undefined) issues.push('missing_sandbox_folder');
  if (!cfg.credentialConfigured) issues.push('missing_credentials');
  return issues.length === 0 ? { ready: true, issues: [] } : { ready: false, issues };
}
