import type { PacketValidationFinding } from '@/policy/packets/contracts';

import type { RuleContext } from '../validatePacket';

export function validateIdentityAndPeriod(context: RuleContext): PacketValidationFinding[] {
  const findings: PacketValidationFinding[] = [];
  const identity = context.model.identity;
  const expectedAgency = context.expectedAgencyId;

  if (expectedAgency !== null && !sameText(identity.agencyId, expectedAgency)) {
    findings.push(finding({
      id: `identity-agency-mismatch-${slug(identity.agencyId)}-${slug(expectedAgency)}`,
      code: 'agency-mismatch',
      path: 'model.identity.agencyId',
      message: `Agency mismatch: packet agency "${identity.agencyId}" does not match expected agency "${expectedAgency}".`,
      remediation: 'Select the correct agency packet or regenerate the packet from the matching agency source set.',
    }));
  }

  if (context.instance !== null && !sameText(identity.agencyId, context.instance.agencyId)) {
    findings.push(finding({
      id: `identity-instance-agency-mismatch-${slug(identity.agencyId)}-${slug(context.instance.agencyId)}`,
      code: 'agency-mismatch',
      path: 'instance.agencyId',
      message: `Agency mismatch: PacketModel agency "${identity.agencyId}" differs from PacketInstance agency "${context.instance.agencyId}".`,
      remediation: 'Reconcile the PacketModel and PacketInstance identity before review, approval, or lock.',
    }));
  }

  if (isMissing(identity.reportingPeriodStart) || isMissing(identity.reportingPeriodEnd)) {
    findings.push(finding({
      id: 'identity-reporting-period-missing',
      code: 'period-contamination',
      path: 'model.identity.reportingPeriodStart',
      message: 'Reporting period is missing or incomplete; period contamination cannot be ruled out.',
      remediation: 'Recover the packet reporting period from source metadata before approval readiness review.',
    }));
  }

  if (
    context.instance !== null &&
    (
      identity.reportingPeriodStart !== context.instance.reportingPeriodStart ||
      identity.reportingPeriodEnd !== context.instance.reportingPeriodEnd
    )
  ) {
    findings.push(finding({
      id: 'identity-instance-period-mismatch',
      code: 'period-contamination',
      path: 'instance.reportingPeriodStart',
      message: `Period contamination: PacketModel period ${periodRange(identity.reportingPeriodStart, identity.reportingPeriodEnd)} differs from PacketInstance period ${periodRange(context.instance.reportingPeriodStart, context.instance.reportingPeriodEnd)}.`,
      remediation: 'Use one canonical packet identity and rerun source segmentation before continuing.',
    }));
  }

  const expectedPeriod = context.expectedReportingPeriod;
  if (
    expectedPeriod !== null &&
    (
      identity.reportingPeriodStart !== expectedPeriod.start ||
      identity.reportingPeriodEnd !== expectedPeriod.end
    )
  ) {
    findings.push(finding({
      id: `identity-expected-period-mismatch-${slug(expectedPeriod.start)}-${slug(expectedPeriod.end)}`,
      code: 'period-contamination',
      path: 'model.identity.reportingPeriodStart',
      message: `Period contamination: packet period ${periodRange(identity.reportingPeriodStart, identity.reportingPeriodEnd)} does not match expected period ${periodRange(expectedPeriod.start, expectedPeriod.end)}.`,
      remediation: 'Regenerate the packet with the requested reporting-period boundary.',
    }));
  }

  const segmentation = context.segmentation;
  if (segmentation === null) return findings;

  if (segmentation.status === 'failed-closed') {
    const code = /agency/i.test(segmentation.reason) ? 'agency-mismatch' : 'period-contamination';
    findings.push(finding({
      id: `source-segmentation-failed-closed-${slug(segmentation.reason)}`,
      code,
      path: 'segmentation.status',
      message: `Source boundary validation failed closed: ${segmentation.reason}`,
      remediation: 'Resolve the source boundary conflict before using the source in the packet.',
    }));
  }

  const selected = segmentation.selectedSegment;
  if (selected !== null) {
    if (expectedAgency !== null && selected.agency !== null && !sameText(selected.agency, expectedAgency)) {
      findings.push(finding({
        id: `selected-segment-agency-mismatch-${slug(selected.segmentId)}`,
        code: 'agency-mismatch',
        path: 'segmentation.selectedSegment.agency',
        message: `Agency mismatch: selected source segment "${selected.segmentId}" belongs to "${selected.agency}", not "${expectedAgency}".`,
        remediation: 'Exclude the mismatched source segment and select the segment for the packet agency.',
      }));
    }

    if (
      expectedPeriod !== null &&
      selected.periodStart !== null &&
      selected.periodEnd !== null &&
      (selected.periodStart !== expectedPeriod.start || selected.periodEnd !== expectedPeriod.end)
    ) {
      findings.push(finding({
        id: `selected-segment-period-contamination-${slug(selected.segmentId)}`,
        code: 'period-contamination',
        path: 'segmentation.selectedSegment.period',
        message: `Period contamination: selected source segment "${selected.segmentId}" covers ${periodRange(selected.periodStart, selected.periodEnd)}, not ${periodRange(expectedPeriod.start, expectedPeriod.end)}.`,
        remediation: 'Use source segmentation to select only records within the packet reporting period.',
      }));
    }
  }

  segmentation.excludedSegments.forEach((segment, index) => {
    const reason = segment.reason;
    if (/agency hard stop/i.test(reason)) {
      findings.push(finding({
        id: `excluded-segment-agency-mismatch-${slug(segment.segmentId)}`,
        code: 'agency-mismatch',
        path: `segmentation.excludedSegments.${index}`,
        message: `Agency mismatch: ${segment.detail}`,
        remediation: 'Keep cross-agency material out of the packet source set.',
      }));
    }
    if (/period hard stop|event-date hard stop|dataset hard stop/i.test(reason)) {
      findings.push(finding({
        id: `excluded-segment-period-contamination-${slug(segment.segmentId)}`,
        code: 'period-contamination',
        path: `segmentation.excludedSegments.${index}`,
        message: `Period contamination: ${segment.detail}`,
        remediation: 'Keep cross-period or wrong-dataset material out of the packet source set.',
      }));
    }
  });

  return findings;
}

function finding(args: {
  id: string;
  code: string;
  path: string;
  message: string;
  remediation: string;
}): PacketValidationFinding {
  return {
    findingId: args.id,
    severity: 'blocker',
    code: args.code,
    path: args.path,
    message: args.message,
    remediation: args.remediation,
    requiresAcknowledgment: false,
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: null,
    relatedWorkflowId: null,
  };
}

function sameText(left: string | null, right: string | null): boolean {
  return normalize(left) === normalize(right);
}

function normalize(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function isMissing(value: string | null): boolean {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 || trimmed === '—';
}

function periodRange(start: string | null, end: string | null): string {
  return `${start ?? 'Unknown — not recovered'} to ${end ?? 'Unknown — not recovered'}`;
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'unknown';
}
