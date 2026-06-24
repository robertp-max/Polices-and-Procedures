import type {
  CloudApplyResult, CloudChangeOp, CloudChangeSetPlan, CloudChangeType, RiskLevel,
} from './types.js';
import { superAdminAudit } from './superadminAudit.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad Google Cloud change sets.
   ----------------------------------------------------------------------------
   Brad NEVER mutates Google Cloud directly. He produces a BradGeneratedCloud
   ChangeSet, runs a SAFE dry-run (no mutation), and an apply is attempted ONLY
   after Super Admin approval AND allowlist validation. Disallowed operations
   (deletes, IAM Owner/Editor grants, new compute/db, public buckets, disabling
   audit logs, inline secret values, …) are refused outright.
   ═══════════════════════════════════════════════════════════════════════════ */

const ALLOWED_TYPES: ReadonlySet<CloudChangeType> = new Set<CloudChangeType>([
  'cloudrun.env.update',
  'cloudrun.scaling.update',
  'cloudrun.secret.attach',
  'cloudrun.service_account.update',
  'gcp.api.enable',
  'deploy.labels.update',
  'secretmanager.brad_entry.upsert',
  'artifactregistry.brad_metadata.upsert',
]);

const RISK_BY_TYPE: Record<CloudChangeType, RiskLevel> = {
  'cloudrun.scaling.update': 'low',
  'deploy.labels.update': 'low',
  'artifactregistry.brad_metadata.upsert': 'low',
  'cloudrun.env.update': 'medium',
  'cloudrun.secret.attach': 'medium',
  'secretmanager.brad_entry.upsert': 'medium',
  'gcp.api.enable': 'medium',
  'cloudrun.service_account.update': 'high',
};

/** Patterns that are NEVER allowed, regardless of the declared op type. */
const DISALLOWED_PATTERNS: Array<{ rx: RegExp; reason: string }> = [
  { rx: /\broles\/(owner|editor)\b/i, reason: 'grants Owner/Editor IAM role' },
  { rx: /\b(owner|editor)\s+role\b/i, reason: 'grants Owner/Editor IAM role' },
  { rx: /\bdelete\s+(project|service|secret|repo|repository|bucket)\b/i, reason: 'deletes a protected resource' },
  { rx: /\b(gke|kubernetes|compute\s+engine|cloud\s+sql|bigquery|gpu|tpu)\b/i, reason: 'creates disallowed infrastructure' },
  { rx: /\bpublic\s+bucket\b|allUsers|allAuthenticatedUsers/i, reason: 'creates a public bucket / public IAM binding' },
  { rx: /\bdisable\s+(audit|logging)\b/i, reason: 'disables audit logging' },
  { rx: /\b(adc|application[-\s]?default[-\s]?credentials)\b/i, reason: 'uses local ADC in runtime' },
];

/** Keys that would imply an INLINE secret value rather than a Secret Manager ref. */
const INLINE_SECRET_KEYS = /^(value|secret|secret_value|password|token|api[_-]?key|cookie|auth[_-]?header)$/i;

export function detectDisallowed(op: CloudChangeOp): string[] {
  const reasons: string[] = [];
  if (!ALLOWED_TYPES.has(op.type)) {
    reasons.push(`change type '${op.type}' is not on the Brad allowlist`);
  }
  const haystack = `${op.type} ${op.resource} ${op.description}`;
  for (const { rx, reason } of DISALLOWED_PATTERNS) {
    if (rx.test(haystack)) reasons.push(reason);
  }
  // No inline secret values — only Secret Manager references are allowed.
  for (const [k, v] of Object.entries(op.params ?? {})) {
    if (INLINE_SECRET_KEYS.test(k)) {
      reasons.push(`inline secret value in param '${k}' (use a Secret Manager reference instead)`);
    }
    if (typeof v === 'string' && /^projects\/.+\/secrets\/.+\/versions\/.+/.test(v) === false && /sensitive/i.test(k)) {
      reasons.push(`param '${k}' must be a Secret Manager reference`);
    }
  }
  return reasons;
}

function maxRisk(ops: CloudChangeOp[]): RiskLevel {
  const order: RiskLevel[] = ['low', 'medium', 'high'];
  return ops.reduce<RiskLevel>((acc, op) => {
    const r = RISK_BY_TYPE[op.type] ?? 'high';
    return order.indexOf(r) > order.indexOf(acc) ? r : acc;
  }, 'low');
}

/** Build a change-set plan and run a SAFE dry-run. Never mutates Google Cloud. */
export function planCloudChangeSet(ops: CloudChangeOp[]): CloudChangeSetPlan {
  const disallowedReasons: string[] = [];
  const dryRunSummary: string[] = [];

  for (const op of ops) {
    const reasons = detectDisallowed(op);
    if (reasons.length) {
      disallowedReasons.push(`[${op.type} ${op.resource}] ${reasons.join('; ')}`);
      dryRunSummary.push(`✗ BLOCKED ${op.type} on ${op.resource}: ${reasons.join('; ')}`);
    } else {
      dryRunSummary.push(
        `• DRY-RUN ${op.type} on ${op.resource}: ${op.description}` +
          (op.secretRefs?.length ? ` [secretRefs: ${op.secretRefs.join(', ')}]` : ''),
      );
    }
  }

  const allowlistValid = disallowedReasons.length === 0;
  superAdminAudit.record({
    type: 'cloud.dryrun',
    outcome: allowlistValid ? 'allowed' : 'blocked',
    reason: allowlistValid ? `dry-run ok (${ops.length} ops, no mutation)` : disallowedReasons.join(' | '),
  });

  return { ops, allowlistValid, disallowedReasons, dryRunSummary, riskLevel: maxRisk(ops) };
}

/** Apply a plan. FAIL CLOSED: requires Super Admin approval AND a valid
    allowlist. In the MVP the apply step is intentionally NOT wired to live GCP
    mutation — it records the approved intent and returns applied=false with an
    explicit reason, so nothing is silently changed. */
export function applyCloudChangeSet(
  plan: CloudChangeSetPlan,
  opts: { approved: boolean; approverId?: string },
): CloudApplyResult {
  if (!plan.allowlistValid) {
    superAdminAudit.record({ type: 'cloud.blocked', outcome: 'blocked', reason: 'allowlist invalid' });
    return { applied: false, reason: `allowlist invalid: ${plan.disallowedReasons.join('; ')}`, verified: false, appliedOps: 0 };
  }
  if (!opts.approved) {
    superAdminAudit.record({ type: 'cloud.blocked', outcome: 'blocked', reason: 'no Super Admin approval' });
    return { applied: false, reason: 'Super Admin approval required before apply', verified: false, appliedOps: 0 };
  }
  // Approved + valid: in MVP we do not execute live GCP mutations.
  superAdminAudit.record({
    type: 'cloud.apply',
    actorId: opts.approverId,
    outcome: 'recorded',
    reason: `approved change set (${plan.ops.length} ops) — live apply not wired in MVP`,
  });
  return {
    applied: false,
    reason: 'approved + allowlist-valid; live GCP apply is not wired in MVP (no mutation performed)',
    verified: false,
    appliedOps: 0,
  };
}
