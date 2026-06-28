/* ════════════════════════════════════════════════════════════════
   PHASE 2 — Hard-stop validation before packet lock / certification.

   A packet MUST NOT lock while any of these survive: placeholder strings,
   TBD/blank required governance roles, missing census/recert/high-risk
   rollups, missing prior-period comparison (when a trend is claimed),
   a signature line shown without an actual signer record, a failed
   source-data window, or a required-but-missing confidential addendum.
   ════════════════════════════════════════════════════════════════ */
import type { ValidationFinding, ValidationResult, Severity } from './qapiTypes';

export interface PacketSignatureLine {
  role: string;
  rendered: boolean;          // is a signature line / checkmark shown?
  signerRecord?: {
    signerId?: string; signerName?: string; signerRole?: string;
    authorityBasis?: string; timestamp?: string; evidenceId?: string; artifactHash?: string;
  } | null;
}
export interface PacketForLock {
  packetId: string;
  packetType?: 'interim' | 'final';
  html?: string;                       // rendered packet text (placeholder scan)
  governanceRoles?: Array<{ role: string; name?: string; authorityConfirmed?: boolean }>;
  rollups?: {
    activeCensus?: number | null;
    recertCounts?: number | null;
    highRiskRollupPresent?: boolean;
    priorPeriodComparisonPresent?: boolean;
    claimsTrend?: boolean;             // does the packet claim a Q1 vs Q2 trend?
  };
  signatures?: PacketSignatureLine[];
  dateWindowViolations?: Array<{ code: string; reason: string; sourceArtifactId?: string }>;
  addendum?: { required: boolean; generatedId?: string | null };
  sourceExceptions?: ValidationFinding[]; // from extraction (Phase 3)
}

const PLACEHOLDER_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /please use evidence studio/i, label: '"Please use Evidence Studio"' },
  { re: /required missing information/i, label: '"required missing information"' },
  { re: /\bTBD\b/, label: '"TBD"' },
  { re: /\[(?:[A-Za-z ]+)\]/, label: 'bracketed placeholder (e.g. [Physician])' },
  { re: /_{4,}/, label: 'blank fill line "____"' },
];

function f(severity: Severity, path: string, reason: string, remediation: string, sourceArtifactId?: string): ValidationFinding {
  return { pass: false, severity, path, reason, remediation, sourceArtifactId };
}

export function validateQapiPacketForLock(packet: PacketForLock): ValidationResult {
  const findings: ValidationFinding[] = [];

  // 1) placeholder strings in the rendered packet
  const html = packet.html ?? '';
  for (const p of PLACEHOLDER_PATTERNS) {
    if (p.re.test(html)) findings.push(f('blocker', 'packet.html', `Unresolved placeholder ${p.label} present in the packet.`, 'Replace with real source-derived content before lock.'));
  }

  // 2) governance roles — no TBD / blank name / unconfirmed authority
  for (const g of packet.governanceRoles ?? []) {
    const name = String(g.name ?? '').trim();
    if (!name || /^tbd$/i.test(name)) findings.push(f('blocker', `governance.${g.role}.name`, `Approver name blank/TBD for role "${g.role}".`, 'Enter the actual approver name.'));
    if (!g.authorityConfirmed) findings.push(f('blocker', `governance.${g.role}.authority`, `Signature-authority not confirmed for "${g.role}".`, 'Confirm signing authority for this role.'));
  }

  // 3) required rollups
  const r = packet.rollups ?? {};
  if (r.activeCensus == null) findings.push(f('high', 'rollups.activeCensus', 'Missing active census denominator.', 'Derive active census from source data.'));
  if (r.recertCounts == null) findings.push(f('high', 'rollups.recertCounts', 'Missing recertification counts (chart-audit methodology references census).', 'Derive recert counts from source data.'));
  if (!r.highRiskRollupPresent) findings.push(f('high', 'rollups.highRisk', 'Missing high-risk flag rollup.', 'Generate the high-risk rollup from source flags.'));
  if (r.claimsTrend && !r.priorPeriodComparisonPresent) findings.push(f('high', 'rollups.priorPeriod', 'Packet claims a Q1 vs Q2 trend but no prior-period comparison is present.', 'Include the prior-period comparison or remove the trend claim.'));

  // 4) signatures — a rendered line without a real signer record is a hard fail
  for (const s of packet.signatures ?? []) {
    if (!s.rendered) continue;
    const rec = s.signerRecord;
    const ok = !!(rec && rec.signerId && rec.signerName && rec.signerRole && rec.authorityBasis && rec.timestamp && (rec.evidenceId || rec.artifactHash));
    if (!ok) findings.push(f('blocker', `signature.${s.role}`, `Signature line for "${s.role}" rendered with a checkmark but no complete signer record (id/name/role/authority/timestamp/evidence).`, 'Capture a real eCIgn signature; do not render checkmarks without a signer record.'));
  }

  // 5) date-window violations
  for (const v of packet.dateWindowViolations ?? []) {
    findings.push(f('blocker', 'dateWindow', `${v.code}: ${v.reason}`, 'Switch to an interim packet or exclude post-meeting source events.', v.sourceArtifactId));
  }

  // 6) confidential addendum required but not generated
  if (packet.addendum?.required && !packet.addendum.generatedId) {
    findings.push(f('blocker', 'addendum', 'Confidential personnel-action addendum is required (disciplinary triggers present) but was not generated.', 'Generate the sealed HR/Compliance addendum and reference it from the packet.'));
  }

  // 7) blocker-level source exceptions (e.g. unreported critical labs)
  for (const e of packet.sourceExceptions ?? []) {
    if (e.severity === 'blocker') findings.push(e);
  }

  const blocking = findings.filter((x) => x.severity === 'blocker' || x.severity === 'high');
  return { pass: blocking.length === 0, findings };
}
