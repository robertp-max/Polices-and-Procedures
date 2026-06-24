import type { BradPhiReadinessResult, HarnessConfig } from './types.js';
import { assertSeparateIdentities } from './config.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad PHI Production-Readiness Gate — FAIL CLOSED.
   ----------------------------------------------------------------------------
   `vertex-phi` mode must not activate until EVERY control is verified. Cloud/org
   controls (BAA, VPC-SC, CMEK, pentest, human sign-off, …) cannot be proven from
   application code, so each is gated on an explicit attestation env flag
   (`BRAD_GATE_*=true`) recorded by security/compliance. Any unset/false control
   is a FAILURE. Two controls are enforced in code and always pass:
     • web-tools-disabled  (Brad adapters declare canReachInternet:false)
     • separate-identities (config check)
   The model can never override this result.
   ═══════════════════════════════════════════════════════════════════════════ */

interface ControlSpec {
  controlId: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  envFlag?: string;        // attestation flag; pass when === 'true'
  codeVerified?: boolean;  // enforced in code (always passes)
}

const CONTROLS: ControlSpec[] = [
  { controlId: 'baa-executed', message: 'Google Cloud BAA executed', severity: 'critical', envFlag: 'BRAD_GATE_BAA_EXECUTED' },
  { controlId: 'services-covered', message: 'Exact services used with PHI confirmed BAA-covered', severity: 'critical', envFlag: 'BRAD_GATE_SERVICES_COVERED' },
  { controlId: 'correct-org-project', message: 'Correct GCP organization/project selected', severity: 'critical', envFlag: 'BRAD_GATE_ORG_PROJECT' },
  { controlId: 'prod-nonprod-separation', message: 'Separate production and non-production projects', severity: 'high', envFlag: 'BRAD_GATE_PROD_SEPARATION' },
  { controlId: 'least-privilege-sa', message: 'Least-privilege service account configured', severity: 'critical', envFlag: 'BRAD_GATE_LEAST_PRIV_SA' },
  { controlId: 'no-longlived-creds', message: 'No long-lived credentials in source control', severity: 'critical', envFlag: 'BRAD_GATE_NO_LONGLIVED_CREDS' },
  { controlId: 'secret-manager', message: 'Secret Manager (or equivalent) configured', severity: 'high', envFlag: 'BRAD_GATE_SECRET_MANAGER' },
  { controlId: 'vpc-sc-perimeter', message: 'VPC Service Controls perimeter configured before deploy', severity: 'critical', envFlag: 'BRAD_GATE_VPC_SC' },
  { controlId: 'internet-blocked', message: 'Public internet egress blocked for Brad (network)', severity: 'critical', envFlag: 'BRAD_GATE_INTERNET_BLOCKED' },
  { controlId: 'web-tools-disabled', message: 'Direct web/search/browser tools disabled for Brad', severity: 'critical', codeVerified: true },
  { controlId: 'private-google-access', message: 'Private Google API access configured where applicable', severity: 'high', envFlag: 'BRAD_GATE_PRIVATE_GOOGLE_ACCESS' },
  { controlId: 'cmek', message: 'CMEK configured where required', severity: 'medium', envFlag: 'BRAD_GATE_CMEK' },
  { controlId: 'approved-region', message: 'Approved region/resource location selected', severity: 'high', envFlag: 'BRAD_GATE_APPROVED_REGION' },
  { controlId: 'audit-logging', message: 'Audit logging configured', severity: 'high', envFlag: 'BRAD_GATE_AUDIT_LOGGING' },
  { controlId: 'phi-excluded-from-names-logs', message: 'PHI excluded from names, labels, URLs, ordinary logs', severity: 'critical', envFlag: 'BRAD_GATE_PHI_EXCLUDED_LOGS' },
  { controlId: 'retention-policy', message: 'Prompt/response retention policy approved', severity: 'high', envFlag: 'BRAD_GATE_RETENTION_APPROVED' },
  { controlId: 'internal-store-approved', message: 'Internal retrieval store approved for PHI', severity: 'high', envFlag: 'BRAD_GATE_INTERNAL_STORE_APPROVED' },
  { controlId: 'cross-tenant-isolation', message: 'Cross-tenant isolation verified', severity: 'critical', envFlag: 'BRAD_GATE_TENANT_ISOLATION' },
  { controlId: 'pentest-egress', message: 'Penetration and PHI-egress tests passed', severity: 'critical', envFlag: 'BRAD_GATE_PENTEST_PASSED' },
  { controlId: 'separate-identities', message: 'Brad/Nolan use separate projects + service accounts', severity: 'critical', codeVerified: true },
  { controlId: 'human-signoff', message: 'Human security/compliance sign-off recorded', severity: 'critical', envFlag: 'BRAD_GATE_HUMAN_SIGNOFF' },
];

export function evaluateBradPhiReadiness(
  cfg: HarnessConfig,
  env: NodeJS.ProcessEnv = process.env,
): BradPhiReadinessResult {
  const failures: BradPhiReadinessResult['failures'] = [];
  const idSeparation = assertSeparateIdentities(cfg);

  for (const c of CONTROLS) {
    if (c.codeVerified) {
      if (c.controlId === 'separate-identities' && idSeparation.length > 0) {
        failures.push({ controlId: c.controlId, message: idSeparation.join('; '), severity: c.severity });
      }
      // web-tools-disabled: enforced by BradModelAdapter.canReachInternet:false → pass.
      continue;
    }
    if (env[c.envFlag!] !== 'true') {
      failures.push({ controlId: c.controlId, message: `${c.message} — not attested (${c.envFlag}!=='true')`, severity: c.severity });
    }
  }

  return {
    ready: failures.length === 0,
    checkedAt: new Date().toISOString(),
    projectId: cfg.brad.vertexProjectId || undefined,
    modelId: cfg.brad.modelId,
    failures,
  };
}
