import type { PacketValidationFinding, ValidationSeverity } from '@/policy/packets/contracts';

import type { RuleContext } from '../validatePacket';

export function validateKpis(context: RuleContext): PacketValidationFinding[] {
  const findings: PacketValidationFinding[] = [];

  context.kpis.forEach((kpi, index) => {
    if (isMalformedState(kpi.valueState) || kpi.validationStatus === 'Conflicted — reconciliation required') {
      findings.push(finding({
        id: `malformed-calculated-kpi-${slug(kpi.indicatorId)}-${index + 1}`,
        severity: 'blocker',
        code: 'malformed-kpi',
        path: `kpis.${index}.valueState`,
        message: `Malformed KPI "${kpi.title}" has state "${kpi.valueState}" and validation status "${kpi.validationStatus}".`,
        remediation: 'Reconcile the KPI source values and recalculate the KPI before approval or lock.',
      }));
      return;
    }

    if (kpi.valueState === 'KNOWN' && kpi.currentValue === null) {
      findings.push(finding({
        id: `malformed-known-kpi-null-value-${slug(kpi.indicatorId)}-${index + 1}`,
        severity: 'blocker',
        code: 'malformed-kpi',
        path: `kpis.${index}.currentValue`,
        message: `Malformed KPI "${kpi.title}" is marked KNOWN but has no recovered current value.`,
        remediation: 'Recover the actual source value or mark the KPI with the correct non-known validation state.',
      }));
      return;
    }

    if (kpi.valueState === 'UNKNOWN' || isUnknownText(kpi.displayValue)) {
      findings.push(finding({
        id: `unknown-calculated-kpi-${slug(kpi.indicatorId)}-${index + 1}`,
        severity: 'warning',
        code: 'kpi-source-not-recovered',
        path: `kpis.${index}.displayValue`,
        message: `KPI "${kpi.title}" is not recovered and must remain disclosed as "${kpi.displayValue}".`,
        remediation: 'Acknowledge the unrecovered KPI limitation or recover the source value before lock.',
      }));
    }
  });

  context.kpiDashboard?.cards.forEach((card, index) => {
    if (isMalformedState(card.currentValue.state)) {
      findings.push(finding({
        id: `malformed-dashboard-kpi-${slug(card.indicatorId)}-${index + 1}`,
        severity: 'blocker',
        code: 'malformed-kpi',
        path: `kpiDashboard.cards.${index}.currentValue.state`,
        message: `Malformed KPI dashboard card "${card.title}" has state "${card.currentValue.state}".`,
        remediation: 'Rebuild the KPI dashboard after source reconciliation.',
      }));
      return;
    }

    if (card.status === 'UNKNOWN' || isUnknownText(card.currentValue.display)) {
      findings.push(finding({
        id: `unknown-dashboard-kpi-${slug(card.indicatorId)}-${index + 1}`,
        severity: 'warning',
        code: 'kpi-source-not-recovered',
        path: `kpiDashboard.cards.${index}.currentValue.display`,
        message: `KPI dashboard card "${card.title}" has an unrecovered current value.`,
        remediation: 'Acknowledge the KPI limitation or recover the source value before lock.',
      }));
    }
  });

  context.model.pagePlan?.forEach((page) => {
    page.contentBlocks.forEach((block, blockIndex) => {
      if (block.kind !== 'kpi-card') return;
      const path = `pagePlan.${page.pageNumber}.contentBlocks.${blockIndex}`;
      if (isBlank(block.kpiId) || isBlank(block.label) || isInvalidRenderedValue(block.value)) {
        findings.push(finding({
          id: `malformed-rendered-kpi-${slug(page.pageId)}-${blockIndex + 1}`,
          severity: 'blocker',
          code: 'malformed-kpi',
          path,
          message: `Malformed rendered KPI card "${block.label || 'Unknown — not recovered'}" has an invalid id, label, or value.`,
          remediation: 'Render KPI cards only from validated KPI output; do not render placeholders as KPI values.',
        }));
        return;
      }

      if (isUnknownText(block.value)) {
        findings.push(finding({
          id: `unknown-rendered-kpi-${slug(page.pageId)}-${blockIndex + 1}`,
          severity: 'warning',
          code: 'kpi-source-not-recovered',
          path,
          message: `Rendered KPI card "${block.label}" discloses an unrecovered value.`,
          remediation: 'Acknowledge the unrecovered KPI limitation or recover the source value before lock.',
        }));
      }
    });
  });

  return findings;
}

function finding(args: {
  id: string;
  severity: ValidationSeverity;
  code: string;
  path: string;
  message: string;
  remediation: string;
}): PacketValidationFinding {
  return {
    findingId: args.id,
    severity: args.severity,
    code: args.code,
    path: args.path,
    message: args.message,
    remediation: args.remediation,
    requiresAcknowledgment: args.severity === 'warning',
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: null,
    relatedWorkflowId: null,
  };
}

function isMalformedState(state: string): boolean {
  return state === 'REJECTED' || state === 'CONFLICTED' || state === 'ZERO_DENOMINATOR';
}

function isInvalidRenderedValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === 0 || /^(nan|undefined|null|tbd)$/i.test(trimmed);
}

function isUnknownText(value: string): boolean {
  return /unknown\s+(?:—|-)\s+(?:not recovered|source not recovered)/i.test(value);
}

function isBlank(value: string): boolean {
  return value.trim().length === 0 || value.trim() === '—';
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'unknown';
}
