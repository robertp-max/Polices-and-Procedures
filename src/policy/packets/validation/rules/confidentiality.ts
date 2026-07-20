import type { PacketPageContentBlock, PacketValidationFinding } from '@/policy/packets/contracts';
import { assertNoConfidentialLeak } from '@/policy/packets/registries/confidentialityPolicies';

import type { RuleContext } from '../validatePacket';

type UnknownRecord = Record<string, unknown>;

export function validateConfidentiality(context: RuleContext): PacketValidationFinding[] {
  const findings: PacketValidationFinding[] = [];

  if (context.personnelGeneralPacketFieldNames.length > 0) {
    try {
      assertNoConfidentialLeak(context.personnelGeneralPacketFieldNames);
    } catch (error) {
      findings.push(finding({
        id: 'confidential-personnel-fields-disallowed',
        path: 'personnelGeneralPacketFieldNames',
        message: `Confidential personnel data in general packet: ${leakedFieldList(error)}.`,
        remediation: 'Move disallowed personnel details to the restricted personnel addendum and keep only the §20.2 reference fields in the general packet.',
      }));
    }
  }

  if (context.model.classification === 'restricted-personnel') return findings;

  context.model.pagePlan?.forEach((page) => {
    if (page.isConfidential) return;
    const pageText = [
      page.title,
      ...page.contentBlocks.flatMap(contentBlockText),
    ].join('\n');
    const leakedMarker = confidentialPersonnelMarker(pageText);
    if (leakedMarker !== null) {
      findings.push(finding({
        id: `confidential-personnel-text-${slug(page.pageId)}-${slug(leakedMarker)}`,
        path: `pagePlan.${page.pageNumber}.contentBlocks`,
        message: `Confidential personnel data in general packet: ${leakedMarker}.`,
        remediation: 'Redact the personnel detail from the general packet and reference the restricted addendum instead.',
      }));
    }
  });

  return findings;
}

function contentBlockText(block: PacketPageContentBlock): string[] {
  switch (block.kind) {
    case 'heading':
    case 'paragraph':
    case 'notice':
      return [block.text];
    case 'list':
      return block.items;
    case 'table':
      return [
        ...block.headers,
        ...block.rows.flatMap((row) => row),
        block.caption ?? '',
      ];
    case 'kpi-card':
      return [block.label, block.value, block.unit ?? ''];
    case 'chart':
      return [
        block.chartId,
        block.chartType,
        ...block.accessibleTable.headers,
        ...block.accessibleTable.rows.flatMap((row) => row),
      ];
    case 'signature-block':
      return [block.capacity, block.signerName ?? ''];
    case 'spacer':
      return [];
  }

  return unsupportedContentBlock(block);
}

function unsupportedContentBlock(block: never): string[] {
  throw new Error(`Unsupported packet content block: ${JSON.stringify(block)}`);
}

function confidentialPersonnelMarker(text: string): string | null {
  const markers = [
    'employee name',
    'disciplinary action',
    'disciplinary outcome',
    'disciplinary sanction',
    'sanction',
    'allegation',
    'investigation facts',
    'termination reason',
    'personnel file',
  ];
  const lower = text.toLowerCase();
  return markers.find((marker) => lower.includes(`${marker}:`)) ?? null;
}

function leakedFieldList(error: unknown): string {
  if (isRecord(error) && Array.isArray(error.leakedFields)) {
    return error.leakedFields.filter((value): value is string => typeof value === 'string').join(', ');
  }
  return 'disallowed personnel fields';
}

function finding(args: {
  id: string;
  path: string;
  message: string;
  remediation: string;
}): PacketValidationFinding {
  return {
    findingId: args.id,
    severity: 'blocker',
    code: 'confidential-personnel-data-in-general-packet',
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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'unknown';
}
