import { google, Auth } from 'googleapis';

/* ═══════════════════════════════════════════════════════════════
   Google Drive authentication — DRIVE ONLY. Calendar keeps its own
   independent auth path in googleCalendar.ts (key-file based) and is
   deliberately NOT routed through this module.

   Two modes:

   1. `impersonation` (production / Cloud Run — keyless):
        Application Default Credentials of the runtime identity
        (care-indeed-hh-v2-runner@data-hangout-500409-j4) mint
        short-lived tokens for the approved Drive service account
        (careindeed-drive-evidence@orbital-stage-443721-v1) via the
        IAM Credentials API. No JSON private key exists anywhere.

   2. `key_file` (LOCAL DEVELOPMENT ONLY):
        The existing external JSON credential file referenced by
        GOOGLE_APPLICATION_CREDENTIALS (kept OUTSIDE the repository).
        This is the historical path and remains the default so local
        behavior is unchanged.

   planDriveAuth() is PURE (no I/O, never reads key material) so the
   fail-closed rules are unit-testable. createDriveAuthClient() is the
   only impure step.
   ═══════════════════════════════════════════════════════════════ */

/** Scopes required by the existing Drive integration (unchanged). */
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  // Required for the explicit "select source from Drive" flow: the service
  // account reads only the file the user picked, then hands it to source ingest.
  'https://www.googleapis.com/auth/drive.readonly',
];

export type DriveAuthMode = 'impersonation' | 'key_file';

export interface DriveAuthConfig {
  /** Raw GOOGLE_DRIVE_AUTH_MODE value ('' → key_file for local-dev compat). */
  authMode: string;
  /** GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT — required in impersonation mode. */
  impersonateServiceAccount: string;
  /** Resolved GOOGLE_APPLICATION_CREDENTIALS path (may be empty). */
  credentialsPath: string;
  /** Whether the credential file exists on this host. */
  credentialsPresent: boolean;
  /** The ONLY identity Drive may run as (DRIVE_EVIDENCE_LOCK.serviceAccountEmail). */
  approvedServiceAccountEmail: string;
}

export interface DriveAuthPlan {
  mode: DriveAuthMode;
  scopes: string[];
  /** Impersonation target (impersonation mode only). */
  targetPrincipal?: string;
  /** Key-file path (key_file mode only — local development). */
  keyFilePath?: string;
  /** True for the key-file path: development-only, never production. */
  developmentOnly: boolean;
  warnings: string[];
}

export class DriveAuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DriveAuthConfigError';
  }
}

/**
 * Decide how Drive will authenticate. Pure and fail-closed:
 *  - unknown mode → throw
 *  - impersonation without a target → throw
 *  - impersonation of anything but the approved Drive identity → throw
 *  - impersonation NEVER uses a JSON key (a configured key path is ignored
 *    with a warning — raw-key auth is rejected in production-shaped mode)
 */
export function planDriveAuth(cfg: DriveAuthConfig): DriveAuthPlan {
  const mode = (cfg.authMode || 'key_file').trim().toLowerCase();
  const warnings: string[] = [];

  if (mode === 'impersonation') {
    const target = cfg.impersonateServiceAccount.trim();
    if (!target) {
      throw new DriveAuthConfigError(
        'GOOGLE_DRIVE_AUTH_MODE=impersonation requires GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT. ' +
        'Refusing to start Drive auth without an impersonation target (fail closed).',
      );
    }
    if (target !== cfg.approvedServiceAccountEmail) {
      throw new DriveAuthConfigError(
        `Impersonation target "${target}" is not the approved Drive service account ` +
        `"${cfg.approvedServiceAccountEmail}" (DRIVE_EVIDENCE_LOCK). Refusing (fail closed).`,
      );
    }
    if (cfg.credentialsPath && cfg.credentialsPresent) {
      warnings.push(
        'A JSON credential file is configured but IGNORED: impersonation mode is keyless. ' +
        'Remove GOOGLE_APPLICATION_CREDENTIALS from production-shaped environments.',
      );
    }
    return { mode: 'impersonation', scopes: DRIVE_SCOPES, targetPrincipal: target, developmentOnly: false, warnings };
  }

  if (mode === 'key_file') {
    if (cfg.impersonateServiceAccount.trim()) {
      warnings.push(
        'GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT is set but GOOGLE_DRIVE_AUTH_MODE is not ' +
        '"impersonation" — the impersonation target is ignored in key_file mode.',
      );
    }
    warnings.push('key_file mode is DEVELOPMENT-ONLY. Production must use GOOGLE_DRIVE_AUTH_MODE=impersonation.');
    return {
      mode: 'key_file',
      scopes: DRIVE_SCOPES,
      keyFilePath: cfg.credentialsPath || undefined,
      developmentOnly: true,
      warnings,
    };
  }

  throw new DriveAuthConfigError(
    `Unknown GOOGLE_DRIVE_AUTH_MODE "${cfg.authMode}". Use "impersonation" (production) or "key_file" (local dev only).`,
  );
}

/** Safe, key-free summary of a plan for logs. Never includes key material. */
export function describeDriveAuthPlan(plan: DriveAuthPlan): Record<string, string> {
  return {
    mode: plan.mode,
    ...(plan.targetPrincipal ? { targetPrincipal: plan.targetPrincipal } : {}),
    ...(plan.keyFilePath ? { keyFilePath: plan.keyFilePath } : {}),
    developmentOnly: String(plan.developmentOnly),
    scopes: plan.scopes.join(' '),
  };
}

/**
 * Build the auth client for a plan. The ONLY impure step.
 *  - impersonation: ADC source client → Auth.Impersonated(target, Drive scopes)
 *  - key_file: GoogleAuth with the external dev key file (unchanged behavior)
 */
export async function createDriveAuthClient(plan: DriveAuthPlan): Promise<Auth.AuthClient> {
  if (plan.mode === 'impersonation') {
    // Application Default Credentials — on Cloud Run this is the runtime
    // service account (care-indeed-hh-v2-runner@…). No key file involved.
    const source = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const sourceClient = await source.getClient();
    return new Auth.Impersonated({
      sourceClient: sourceClient as Auth.AuthClient,
      targetPrincipal: plan.targetPrincipal,
      targetScopes: plan.scopes,
      lifetime: 3600,
      delegates: [],
    });
  }
  // key_file — LOCAL DEVELOPMENT ONLY (external file, outside the repository).
  const auth = new google.auth.GoogleAuth({
    keyFile: plan.keyFilePath,
    scopes: plan.scopes,
  });
  return (await auth.getClient()) as Auth.AuthClient;
}
