export const AUTHORITY_DOMAINS = [
  'clinical',
  'qapi',
  'compliance',
  'governance',
  'finance',
  'accounting',
  'hr',
  'operations',
  'it',
  'risk',
  'emergency-preparedness',
] as const;

export type AuthorityDomain = typeof AUTHORITY_DOMAINS[number];
export type ProductionSignerTier = 1 | 2 | 3 | 4 | 5;
export type SignatureMode = 'sequential' | 'parallel';

export interface SignerDelegation {
  delegatedByUserId: string;
  domain: AuthorityDomain;
  roles: string[];
  expiresAt: string;
  auditEventId?: string;
}

export interface SignerAuthorityProfile {
  userId: string;
  name?: string;
  role: string;
  tier: ProductionSignerTier;
  authorityDomains: AuthorityDomain[];
  delegations?: SignerDelegation[];
}

export interface CanonicalSignerRequirement {
  signatureRequirementId: string;
  formId: string;
  workflowId?: string;
  eventId?: string;
  taskId?: string;
  slotOrder: number;
  slotFieldId: string;
  slotPurpose: string;
  requiredDomain: AuthorityDomain;
  allowedRoles: string[];
  minTier: ProductionSignerTier;
  maxTier?: ProductionSignerTier;
  required: boolean;
  mode: SignatureMode;
  canDelegate: boolean;
  requiresSameDomain: boolean;
  blocksSelfApproval: boolean;
  requiredForFinalPackage: boolean;
  allowSameTierWitness?: boolean;
}

export interface SignatureCompletion {
  slotOrder: number;
  fieldId: string;
  signerUserId: string;
  signerRole: string;
  signerTier: ProductionSignerTier;
  signerDomains: AuthorityDomain[];
  signedAt: string;
  documentHash?: string;
}

export interface SignerEligibilityContext {
  previousSignatures?: SignatureCompletion[];
  preparerUserId?: string;
  currentActorUserId?: string;
  now?: string;
}

export interface SignerEligibilityResult {
  eligible: boolean;
  reasons: string[];
  matchedByDelegation?: boolean;
}

export interface SlotLike {
  field_id: string;
  role: string;
  tier?: number;
  required?: boolean;
  sequence_group?: number;
}

export interface RequiredSignerPayload {
  role: string;
  tier: ProductionSignerTier;
  user_id?: string;
  field_id: string;
  slot_order: number;
  slot_purpose: string;
  required_domain: AuthorityDomain;
  allowed_roles: string[];
  min_tier: ProductionSignerTier;
  max_tier?: ProductionSignerTier;
  required: boolean;
  sequential: boolean;
  can_delegate: boolean;
  requires_same_domain: boolean;
  blocks_self_approval: boolean;
  required_for_final_package: boolean;
}

const DOMAIN_ALIASES: Record<string, AuthorityDomain> = {
  cl: 'clinical',
  clinical: 'clinical',
  qa: 'qapi',
  qapi: 'qapi',
  quality: 'qapi',
  co: 'compliance',
  compliance: 'compliance',
  gv: 'governance',
  governance: 'governance',
  governing: 'governance',
  fn: 'finance',
  finance: 'finance',
  financial: 'finance',
  accounting: 'accounting',
  acct: 'accounting',
  hr: 'hr',
  humanresources: 'hr',
  op: 'operations',
  operations: 'operations',
  it: 'it',
  is: 'it',
  informationtechnology: 'it',
  security: 'it',
  rm: 'risk',
  risk: 'risk',
  ep: 'emergency-preparedness',
  emergencypreparedness: 'emergency-preparedness',
};

const PREFIX_DOMAIN: Record<string, AuthorityDomain> = {
  CL: 'clinical',
  QA: 'qapi',
  CO: 'compliance',
  GV: 'governance',
  FN: 'finance',
  HR: 'hr',
  OP: 'operations',
  IT: 'it',
  IS: 'it',
  RM: 'risk',
  EP: 'emergency-preparedness',
};

function compactKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function roleKey(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function clampTier(value: number): ProductionSignerTier {
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  return 5;
}

export function normalizeAuthorityDomain(input?: string): AuthorityDomain | undefined {
  if (!input) return undefined;
  const normalized = compactKey(input);
  return DOMAIN_ALIASES[normalized];
}

export function authorityDomainForId(id?: string): AuthorityDomain | undefined {
  const prefix = String(id ?? '').trim().split('-')[0]?.toUpperCase();
  return PREFIX_DOMAIN[prefix];
}

export function deriveAuthorityDomain(input: {
  workflowId?: string;
  formId?: string;
  explicitDomain?: string;
  signerRole?: string;
}): AuthorityDomain {
  const explicit = normalizeAuthorityDomain(input.explicitDomain);
  if (explicit) return explicit;

  const role = roleKey(input.signerRole ?? '');
  if (/governing body|board chair|board member/.test(role)) return 'governance';

  return authorityDomainForId(input.workflowId)
    ?? authorityDomainForId(input.formId)
    ?? authorityDomainsForRole(input.signerRole)[0]
    ?? 'operations';
}

export function productionTierForRole(role?: string): ProductionSignerTier {
  const normalized = roleKey(role ?? '');
  if (!normalized) return 1;
  if (/governing body|board chair|board member|gb chair/.test(normalized)) return 5;
  if (/administrator|administrator designee|executive|chief executive/.test(normalized)) return 4;
  if (/qapi lead|qapi chair|compliance officer|clinical manager|director of nursing|\bdon\b|domain owner|finance|cfo|controller|accounting manager|hr|risk manager|operations director|it director|ciso|infection preventionist|medical director|data analyst/.test(normalized)) return 3;
  if (/supervisor|reviewer|liaison|coordinator|lead/.test(normalized)) return 2;
  return 1;
}

export function normalizeProductionTier(value: unknown, role?: string): ProductionSignerTier {
  if (typeof value === 'number' && Number.isFinite(value)) return clampTier(value);
  return productionTierForRole(role);
}

export function minTierForRequiredSlot(role?: string, legacySlotTier?: number): ProductionSignerTier {
  const inferred = productionTierForRole(role);
  const normalized = roleKey(role ?? '');
  if (/assigned owner|task owner|preparer|staff/.test(normalized)) return 1;
  if (inferred !== 1 || legacySlotTier == null) return inferred;
  return clampTier(6 - legacySlotTier);
}

export function authorityDomainsForRole(role?: string): AuthorityDomain[] {
  const normalized = roleKey(role ?? '');
  const domains = new Set<AuthorityDomain>();

  if (/clinical|nurse|\brn\b|director of nursing|\bdon\b|medical director|physician|therapist|staff rn|chha|oasis/.test(normalized)) domains.add('clinical');
  if (/qapi|quality|data analyst|quality source|infection preventionist|committee/.test(normalized)) domains.add('qapi');
  if (/compliance|regulatory|liaison/.test(normalized)) domains.add('compliance');
  if (/governing body|board|administrator/.test(normalized)) domains.add('governance');
  if (/finance|cfo|revenue|billing/.test(normalized)) domains.add('finance');
  if (/accounting|controller|bookkeeper/.test(normalized)) domains.add('accounting');
  if (/\bhr\b|human resources|employee|workforce/.test(normalized)) domains.add('hr');
  if (/operations|scheduler|intake|administrator/.test(normalized)) domains.add('operations');
  if (/\bit\b|security|ciso|information security/.test(normalized)) domains.add('it');
  if (/risk|safety/.test(normalized)) domains.add('risk');
  if (/emergency|preparedness|disaster/.test(normalized)) domains.add('emergency-preparedness');

  if (domains.size === 0) domains.add('operations');
  return Array.from(domains);
}

export function normalizeSignerProfile(input: {
  userId: string;
  name?: string;
  role: string;
  tier?: number;
  authorityDomains?: string[] | AuthorityDomain[];
  delegations?: SignerDelegation[];
}): SignerAuthorityProfile {
  const derivedDomains = authorityDomainsForRole(input.role);
  const explicitDomains = (input.authorityDomains ?? [])
    .map(domain => normalizeAuthorityDomain(domain))
    .filter((domain): domain is AuthorityDomain => Boolean(domain));
  const tier = normalizeProductionTier(input.tier, input.role);
  return {
    userId: input.userId,
    name: input.name,
    role: input.role,
    tier,
    authorityDomains: Array.from(new Set([...explicitDomains, ...derivedDomains])),
    delegations: input.delegations,
  };
}

function normalizeRoleForCompare(role: string): string {
  return roleKey(role)
    .replace(/\bdesignee\b/g, '')
    .replace(/\bchair\b/g, 'lead')
    .replace(/\s+/g, ' ')
    .trim();
}

export function roleAllowedForSlot(signerRole: string, allowedRoles: readonly string[]): boolean {
  if (allowedRoles.length === 0) return true;
  const signer = normalizeRoleForCompare(signerRole);
  return allowedRoles.some(role => {
    const allowed = normalizeRoleForCompare(role);
    if (allowed === 'assigned owner' || allowed === 'task owner') return true;
    return signer === allowed
      || signer.includes(allowed)
      || allowed.includes(signer)
      || (allowed === 'administrator' && signer.includes('administrator'))
      || (allowed === 'governing body' && /governing body|board/.test(signer));
  });
}

function hasValidDelegation(
  signer: SignerAuthorityProfile,
  requirement: CanonicalSignerRequirement,
  nowIso: string,
): boolean {
  if (!requirement.canDelegate) return false;
  const now = Date.parse(nowIso);
  return (signer.delegations ?? []).some(delegation => {
    if (delegation.domain !== requirement.requiredDomain) return false;
    if (Date.parse(delegation.expiresAt) <= now) return false;
    return roleAllowedForSlot(signer.role, delegation.roles.length ? delegation.roles : requirement.allowedRoles);
  });
}

export function validateSignerEligibility(
  signer: SignerAuthorityProfile,
  requirement: CanonicalSignerRequirement,
  context: SignerEligibilityContext = {},
): SignerEligibilityResult {
  const reasons: string[] = [];
  const now = context.now ?? new Date().toISOString();
  const previous = [...(context.previousSignatures ?? [])]
    .sort((a, b) => b.slotOrder - a.slotOrder)
    .find(item => item.slotOrder < requirement.slotOrder);
  const sameDomain = signer.authorityDomains.includes(requirement.requiredDomain);
  const delegated = !sameDomain && hasValidDelegation(signer, requirement, now);

  if (signer.tier < requirement.minTier) {
    reasons.push(`Signer tier ${signer.tier} is below required tier ${requirement.minTier}.`);
  }
  if (requirement.maxTier && signer.tier > requirement.maxTier) {
    reasons.push(`Signer tier ${signer.tier} exceeds allowed maximum tier ${requirement.maxTier}.`);
  }
  if (previous && requirement.mode === 'sequential' && signer.tier <= previous.signerTier && !requirement.allowSameTierWitness) {
    reasons.push(`Signer tier ${signer.tier} must be higher than previous signer tier ${previous.signerTier}.`);
  }
  if (requirement.requiresSameDomain && !sameDomain && !delegated) {
    reasons.push(`Signer lacks required ${requirement.requiredDomain} authority domain.`);
  }
  if (!roleAllowedForSlot(signer.role, requirement.allowedRoles)) {
    reasons.push(`Signer role "${signer.role}" is not allowed for ${requirement.slotPurpose}.`);
  }
  if (
    requirement.blocksSelfApproval
    && (
      (context.preparerUserId && signer.userId === context.preparerUserId)
      || (context.currentActorUserId && signer.userId === context.currentActorUserId)
      || (previous && previous.signerUserId === signer.userId)
    )
  ) {
    reasons.push('Self-approval is blocked for this signer slot.');
  }

  return { eligible: reasons.length === 0, reasons, matchedByDelegation: delegated };
}

function requirementId(input: {
  eventId?: string;
  workflowId?: string;
  taskId?: string;
  formId: string;
  slotFieldId: string;
  slotOrder: number;
}) {
  const safe = (value?: string) => String(value ?? 'NA').replace(/[^A-Za-z0-9_-]+/g, '-');
  return [
    'SIGREQ',
    safe(input.eventId),
    safe(input.workflowId),
    safe(input.taskId),
    safe(input.formId),
    String(input.slotOrder).padStart(2, '0'),
    safe(input.slotFieldId),
  ].join('-');
}

function makeRequirement(input: {
  formId: string;
  workflowId?: string;
  eventId?: string;
  taskId?: string;
  slotOrder: number;
  slotFieldId: string;
  slotPurpose: string;
  role: string;
  requiredDomain?: string;
  minTier?: ProductionSignerTier;
  required?: boolean;
  mode?: SignatureMode;
  canDelegate?: boolean;
  requiredForFinalPackage?: boolean;
}): CanonicalSignerRequirement {
  const requiredDomain = deriveAuthorityDomain({
    workflowId: input.workflowId,
    formId: input.formId,
    explicitDomain: input.requiredDomain,
    signerRole: input.role,
  });
  return {
    signatureRequirementId: requirementId(input),
    formId: input.formId,
    workflowId: input.workflowId,
    eventId: input.eventId,
    taskId: input.taskId,
    slotOrder: input.slotOrder,
    slotFieldId: input.slotFieldId,
    slotPurpose: input.slotPurpose,
    requiredDomain,
    allowedRoles: [input.role],
    minTier: input.minTier ?? productionTierForRole(input.role),
    required: input.required ?? true,
    mode: input.mode ?? 'sequential',
    canDelegate: input.canDelegate ?? false,
    requiresSameDomain: true,
    blocksSelfApproval: input.slotOrder > 1,
    requiredForFinalPackage: input.requiredForFinalPackage ?? true,
  };
}

export function deriveCanonicalSignerRequirements(input: {
  formId: string;
  workflowId?: string;
  eventId?: string;
  taskId?: string;
  domain?: string;
  slots?: readonly SlotLike[];
}): CanonicalSignerRequirement[] {
  const explicitSlots = (input.slots ?? [])
    .filter(slot => slot.required !== false)
    .sort((a, b) => (a.sequence_group ?? 0) - (b.sequence_group ?? 0));

  if (explicitSlots.length > 0) {
    return explicitSlots.map((slot, index) => makeRequirement({
      formId: input.formId,
      workflowId: input.workflowId,
      eventId: input.eventId,
      taskId: input.taskId,
      slotOrder: index + 1,
      slotFieldId: slot.field_id,
      slotPurpose: slot.role,
      role: slot.role,
      requiredDomain: input.domain,
      minTier: minTierForRequiredSlot(slot.role, slot.tier),
      required: slot.required ?? true,
    }));
  }

  const baseDomain = deriveAuthorityDomain({
    workflowId: input.workflowId,
    formId: input.formId,
    explicitDomain: input.domain,
  });
  const requirements = [
    makeRequirement({
      formId: input.formId,
      workflowId: input.workflowId,
      eventId: input.eventId,
      taskId: input.taskId,
      slotOrder: 1,
      slotFieldId: 'sig_preparer',
      slotPurpose: 'Preparer / task owner attestation',
      role: 'Assigned Owner',
      requiredDomain: baseDomain,
      minTier: 1,
    }),
  ];

  if (baseDomain === 'qapi') {
    requirements.push(makeRequirement({
      formId: input.formId,
      workflowId: input.workflowId,
      eventId: input.eventId,
      taskId: input.taskId,
      slotOrder: 2,
      slotFieldId: 'sig_qapi_lead',
      slotPurpose: 'QAPI lead review',
      role: 'QAPI Lead / Chair',
      requiredDomain: 'qapi',
      minTier: 3,
    }));
    if (input.workflowId === 'QA-WF-03') {
      requirements.push(makeRequirement({
        formId: input.formId,
        workflowId: input.workflowId,
        eventId: input.eventId,
        taskId: input.taskId,
        slotOrder: 3,
        slotFieldId: 'sig_governing_body',
        slotPurpose: 'Governing Body final authority',
        role: 'Governing Body Chair',
        requiredDomain: 'governance',
        minTier: 5,
      }));
    }
  } else if (baseDomain === 'clinical') {
    requirements.push(makeRequirement({
      formId: input.formId,
      workflowId: input.workflowId,
      eventId: input.eventId,
      taskId: input.taskId,
      slotOrder: 2,
      slotFieldId: 'sig_clinical_manager',
      slotPurpose: 'Clinical manager validation',
      role: 'Clinical Manager',
      requiredDomain: 'clinical',
      minTier: 3,
    }));
  }

  return requirements;
}

export function requiredSignerPayloads(requirements: readonly CanonicalSignerRequirement[]): RequiredSignerPayload[] {
  return requirements.map(requirement => ({
    role: requirement.allowedRoles[0] ?? requirement.slotPurpose,
    tier: requirement.minTier,
    field_id: requirement.slotFieldId,
    slot_order: requirement.slotOrder,
    slot_purpose: requirement.slotPurpose,
    required_domain: requirement.requiredDomain,
    allowed_roles: [...requirement.allowedRoles],
    min_tier: requirement.minTier,
    max_tier: requirement.maxTier,
    required: requirement.required,
    sequential: requirement.mode === 'sequential',
    can_delegate: requirement.canDelegate,
    requires_same_domain: requirement.requiresSameDomain,
    blocks_self_approval: requirement.blocksSelfApproval,
    required_for_final_package: requirement.requiredForFinalPackage,
  }));
}

export function resolveNextRequiredSigner(
  requirements: readonly CanonicalSignerRequirement[],
  completed: readonly SignatureCompletion[],
): CanonicalSignerRequirement | undefined {
  const completedOrders = new Set(completed.map(item => item.slotOrder));
  return [...requirements]
    .filter(requirement => requirement.required && !completedOrders.has(requirement.slotOrder))
    .sort((a, b) => a.slotOrder - b.slotOrder)[0];
}

export function canGenerateFinalPackage(
  requirements: readonly CanonicalSignerRequirement[],
  completed: readonly SignatureCompletion[],
): boolean {
  const completedOrders = new Set(completed.map(item => item.slotOrder));
  return requirements
    .filter(requirement => requirement.required && requirement.requiredForFinalPackage)
    .every(requirement => completedOrders.has(requirement.slotOrder));
}
