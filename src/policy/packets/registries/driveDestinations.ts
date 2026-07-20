/**
 * Drive-destination registry — PRD §29 #10, §19.4, FR-031.
 * Pure data + pure functions only. Zero runtime side effects.
 *
 * Missing bindings throw a typed error — never silently substitute.
 */

/**
 * §19.4 suggested Drive hierarchy template (single-line form of the PRD tree).
 *
 * Care Indeed Home Health/Compliance Packets/{year}/{domain}/{event_family_id}/
 *   {reporting_period}/{event_instance_id}/{packet_instance_id}/v{packet_version}
 */
export const COMPLIANCE_PACKETS_DRIVE_TEMPLATE =
  'Care Indeed Home Health/Compliance Packets/{year}/{domain}/{event_family_id}/{reporting_period}/{event_instance_id}/{packet_instance_id}/v{packet_version}';

/** Placeholder names required by the §19.4 compliance-packets template. */
export const COMPLIANCE_PACKETS_BINDING_KEYS = [
  'year',
  'domain',
  'event_family_id',
  'reporting_period',
  'event_instance_id',
  'packet_instance_id',
  'packet_version',
] as const;

export type CompliancePacketsBindingKey =
  (typeof COMPLIANCE_PACKETS_BINDING_KEYS)[number];

/** Binding map for Drive path resolution. Values must be non-empty when present. */
export type DriveDestinationBindings = Readonly<
  Partial<Record<string, string | number | null | undefined>>
>;

/** Destination template registry entry (PRD §29 #10). */
export interface DriveDestinationTemplate {
  templateId: string;
  title: string;
  description: string;
  /** Path template with `{placeholder}` segments (§19.4). */
  template: string;
  requiredBindings: readonly string[];
  prdRefs: readonly string[];
}

export const COMPLIANCE_PACKETS_TEMPLATE_ID = 'compliance-packets-§19.4';

export const COMPLIANCE_PACKETS_DESTINATION: DriveDestinationTemplate = {
  templateId: COMPLIANCE_PACKETS_TEMPLATE_ID,
  title: 'Compliance Packets Drive hierarchy',
  description:
    'Governed publication destination for mandated-event packets (PRD §19.4).',
  template: COMPLIANCE_PACKETS_DRIVE_TEMPLATE,
  requiredBindings: COMPLIANCE_PACKETS_BINDING_KEYS,
  prdRefs: ['§19.4', 'FR-031'],
};

/** Full Drive-destination registry (PRD §29 #10). */
export const DRIVE_DESTINATION_TEMPLATES: readonly DriveDestinationTemplate[] = [
  COMPLIANCE_PACKETS_DESTINATION,
];

export function getDriveDestinationTemplate(
  templateId: string,
): DriveDestinationTemplate | undefined {
  return DRIVE_DESTINATION_TEMPLATES.find((t) => t.templateId === templateId);
}

/** Typed error for missing or empty Drive path bindings. */
export class MissingDriveBindingError extends Error {
  readonly code = 'MISSING_DRIVE_BINDING' as const;
  readonly missingBindings: readonly string[];
  readonly template: string;

  constructor(missingBindings: readonly string[], template: string) {
    const list = missingBindings.join(', ');
    super(
      `Missing Drive destination binding(s): ${list}. Template does not allow silent substitution.`,
    );
    this.name = 'MissingDriveBindingError';
    this.missingBindings = missingBindings;
    this.template = template;
  }
}

const PLACEHOLDER_RE = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/** Extract unique placeholder names from a template string (order of first appearance). */
export function listTemplatePlaceholders(template: string): readonly string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  PLACEHOLDER_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PLACEHOLDER_RE.exec(template)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  return ordered;
}

function isPresentBinding(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  return value.trim().length > 0;
}

/**
 * Resolve a Drive destination path from a template and bindings.
 *
 * Pure. Throws MissingDriveBindingError on any missing/empty binding.
 * Never silently substitutes empty strings, zeros, or defaults.
 */
export function resolveDriveDestination(
  template: string,
  bindings: DriveDestinationBindings,
): string {
  const placeholders = listTemplatePlaceholders(template);
  const missing: string[] = [];

  for (const key of placeholders) {
    if (!isPresentBinding(bindings[key])) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new MissingDriveBindingError(missing, template);
  }

  return template.replace(PLACEHOLDER_RE, (_full, key: string) => {
    const raw = bindings[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return String(raw);
    }
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
    // Defensive: should be unreachable after the pre-check.
    throw new MissingDriveBindingError([key], template);
  });
}
