import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { FORM_OVERRIDES } from '@/policy/data/formsLibraryContent';
import { buildSignatureRequirementId, buildSignatureTaskRecord, dedupeSignatureRequirements, dedupeSignatureTasks } from './signatureTaskBuilder';
import { normalizeSignerRole, resolveSignerHierarchyRule, uniqueSignerRoles } from './signerHierarchy';
import type {
  ResolvedSignaturePath,
  SignatureRequirement,
  SignatureResolverApprovalContext,
  SignatureResolverContext,
  SignerRole,
} from './types';

function uniqueStrings(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function includesAny(text: string, patterns: RegExp[]) {
  return patterns.some(pattern => pattern.test(text));
}

function inferAcknowledgmentSignerRole(context: SignatureResolverContext): SignerRole {
  const text = `${context.title} ${context.description ?? ''}`.toLowerCase();
  if (/employee|workforce|personnel|staff|onboarding|policy|code of conduct/.test(text)) return 'Workforce Member';
  if (/patient|consent|rights|admission/.test(text)) return 'Assigned Owner';
  return normalizeSignerRole(context.ownerRole, 'Assigned Owner');
}

function inferQapiReviewers(context: SignatureResolverContext) {
  const text = `${context.title} ${context.description ?? ''} ${context.forms.map(form => form.formId).join(' ')}`.toLowerCase();
  return uniqueSignerRoles([
    includesAny(text, [/dashboard/, /trend/, /metric/, /data/, /benchmark/, /indicator/, /score/]) ? 'Data Analyst / Quality Source' : undefined,
    includesAny(text, [/rca/, /adverse/, /clinical/, /care/, /plan of care/, /patient safety/, /poc/]) ? 'Clinical Manager' : undefined,
    includesAny(text, [/complaint/, /compliance/, /sanction/, /regulatory/, /corrective action/, /exclusion/, /oig/, /sam/]) ? 'Compliance Officer' : undefined,
    includesAny(text, [/infection/, /surveillance/, /line list/, /infection control/]) ? 'Infection Preventionist' : undefined,
    includesAny(text, [/minutes/, /committee/, /vote/, /meeting/]) ? 'Committee / Voting Members' : undefined,
  ]);
}

function inferRuleBasedRoles(context: SignatureResolverContext) {
  const rule = resolveSignerHierarchyRule(context.domain);
  const ownerRole = normalizeSignerRole(context.ownerRole, rule.ownerRole);
  const reviewerRoles = context.domain === 'QAPI'
    ? uniqueSignerRoles([...inferQapiReviewers(context), ...rule.reviewerRoles])
    : rule.reviewerRoles;
  const signerRoles = rule.signerRoles;
  const finalApproverRoles = rule.finalApproverRoles;
  const governingBodyRequired = Boolean(
    rule.governingBodyRequired
    || finalApproverRoles.includes('Governing Body')
    || (context.approvals ?? []).some(approval => /governing body|board/.test(approval.approverRole.toLowerCase())),
  );
  return {
    ownerRole,
    reviewerRoles,
    signerRoles,
    finalApproverRoles,
    governingBodyRequired,
  };
}

function resolveFormSpecificRequirements(
  context: SignatureResolverContext,
  roles: ReturnType<typeof inferRuleBasedRoles>,
): SignatureRequirement[] {
  const titleText = `${context.title} ${context.description ?? ''}`.toLowerCase();
  const requirements: SignatureRequirement[] = [];
  let order = 1;

  context.forms.forEach(form => {
    const record = FORMS_DATASET.find(item => item.id === form.formId);
    const override = FORM_OVERRIDES[form.formId];
    const explicitSlots = override?.signerSlots ?? [];
    const text = `${titleText} ${record?.name ?? form.formId}`.toLowerCase();
    const applicableApprovals = (context.approvals ?? []).filter(approval =>
      approval.targetKind === 'form'
        ? text.includes(approval.targetLabel.toLowerCase()) || approval.targetLabel.toLowerCase().includes((record?.name ?? form.formId).toLowerCase())
        : false,
    );

    if (explicitSlots.length > 0) {
      explicitSlots
        .filter(slot => slot.required)
        .sort((a, b) => a.sequence_group - b.sequence_group)
        .forEach(slot => {
          const signerRole = normalizeSignerRole(slot.role, roles.signerRoles[0] ?? roles.ownerRole);
          requirements.push({
            signatureRequirementId: buildSignatureRequirementId({
              eventId: context.eventId,
              workflowId: context.workflowId,
              parentTaskId: context.parentTaskId,
              formId: form.formId,
              signatureSlot: slot.field_id,
              signerRole,
            }),
            eventId: context.eventId,
            workflowId: context.workflowId,
            parentTaskId: context.parentTaskId,
            formId: form.formId,
            formInstanceId: form.formInstanceId,
            signatureSlot: slot.field_id,
            signerRole,
            reviewerRole: roles.reviewerRoles[0],
            order: order++,
            required: true,
            status: form.formInstanceId ? 'pending' : 'blocked',
            source: 'form_signature',
          });
        });
      return;
    }

    const recordType = record?.type.toLowerCase() ?? '';
    const isAcknowledgment = includesAny(text, [/acknowledg/, /attestation/, /consent/, /signature/, /sign off/]);
    const shouldRequireSignature = isAcknowledgment || applicableApprovals.length > 0 || includesAny(titleText, [/sign/, /approve/, /attest/]);
    if (!shouldRequireSignature) return;

    const signerRole = isAcknowledgment
      ? inferAcknowledgmentSignerRole(context)
      : normalizeSignerRole(applicableApprovals[0]?.approverRole, roles.signerRoles[0] ?? roles.ownerRole);
    const reviewerRole = roles.reviewerRoles[0];
    requirements.push({
      signatureRequirementId: buildSignatureRequirementId({
        eventId: context.eventId,
        workflowId: context.workflowId,
        parentTaskId: context.parentTaskId,
        formId: form.formId,
        signatureSlot: recordType === 'attestation' || isAcknowledgment ? 'primary-attestation' : 'primary-signature',
        signerRole,
      }),
      eventId: context.eventId,
      workflowId: context.workflowId,
      parentTaskId: context.parentTaskId,
      formId: form.formId,
      formInstanceId: form.formInstanceId,
      signatureSlot: recordType === 'attestation' || isAcknowledgment ? 'primary-attestation' : 'primary-signature',
      signerRole,
      reviewerRole,
      order: order++,
      required: true,
      status: form.formInstanceId ? 'pending' : 'blocked',
      source: applicableApprovals.length > 0 ? 'event_approval' : 'generated',
    });
  });

  return requirements;
}

function resolveApprovalRequirements(
  context: SignatureResolverContext,
  roles: ReturnType<typeof inferRuleBasedRoles>,
): SignatureRequirement[] {
  const requirements: SignatureRequirement[] = [];
  let order = 100;
  const existingFormIds = new Set(context.forms.map(form => form.formId));

  (context.approvals ?? []).forEach((approval: SignatureResolverApprovalContext) => {
    if (!approval.required) return;
    if (approval.targetKind === 'form' && context.forms.length > 0) return;
    const signerRole = normalizeSignerRole(approval.approverRole, roles.signerRoles[0] ?? roles.ownerRole);
    const signatureSlot = approval.targetKind === 'event'
      ? `event-approval-${approval.id}`
      : approval.targetKind === 'minutes'
        ? `minutes-approval-${approval.id}`
        : `approval-${approval.id}`;
    requirements.push({
      signatureRequirementId: buildSignatureRequirementId({
        eventId: context.eventId,
        workflowId: context.workflowId,
        parentTaskId: context.parentTaskId,
        formId: existingFormIds.size === 1 ? Array.from(existingFormIds)[0] : undefined,
        signatureSlot,
        signerRole,
      }),
      eventId: context.eventId,
      workflowId: context.workflowId,
      parentTaskId: context.parentTaskId,
      formId: existingFormIds.size === 1 ? Array.from(existingFormIds)[0] : undefined,
      formInstanceId: context.forms.length === 1 ? context.forms[0].formInstanceId : undefined,
      signatureSlot,
      signerRole,
      reviewerRole: roles.reviewerRoles[0],
      order: order++,
      required: true,
      status: context.forms.length > 0 && !context.forms[0].formInstanceId ? 'blocked' : 'pending',
      source: approval.targetKind === 'event' ? 'event_approval' : 'workflow_approval',
    });
  });

  uniqueStrings(context.minutesSignOffRoles ?? []).forEach((role, index) => {
    const signerRole = normalizeSignerRole(role, 'QAPI Lead / Chair');
    requirements.push({
      signatureRequirementId: buildSignatureRequirementId({
        eventId: context.eventId,
        workflowId: context.workflowId,
        parentTaskId: context.parentTaskId,
        formId: undefined,
        signatureSlot: `minutes-signoff-${index + 1}`,
        signerRole,
      }),
      eventId: context.eventId,
      workflowId: context.workflowId,
      parentTaskId: context.parentTaskId,
      signatureSlot: `minutes-signoff-${index + 1}`,
      signerRole,
      reviewerRole: roles.reviewerRoles[0],
      order: order++,
      required: true,
      status: 'pending',
      source: 'workflow_approval',
    });
  });

  return requirements;
}

export function resolveCanonicalSignaturePath(context: SignatureResolverContext): ResolvedSignaturePath {
  const roles = inferRuleBasedRoles(context);
  const formRequirements = resolveFormSpecificRequirements(context, roles);
  const approvalRequirements = resolveApprovalRequirements(context, roles);
  const signatureRequirements = dedupeSignatureRequirements([...formRequirements, ...approvalRequirements])
    .sort((a, b) => a.order - b.order)
    .map((requirement, index) => ({ ...requirement, order: index + 1 }));
  const signatureTasks = dedupeSignatureTasks(signatureRequirements.map(buildSignatureTaskRecord));

  return {
    ownerRole: roles.ownerRole,
    reviewerRoles: roles.reviewerRoles,
    signerRoles: uniqueSignerRoles(signatureRequirements.map(requirement => requirement.signerRole)),
    finalApproverRoles: roles.finalApproverRoles,
    governingBodyRequired: roles.governingBodyRequired,
    signatureRequirements,
    signatureTasks,
    noSignatureRequired: signatureTasks.length === 0,
  };
}
