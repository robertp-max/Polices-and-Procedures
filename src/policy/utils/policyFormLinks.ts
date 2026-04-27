import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';

const POLICY_ID_RE = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/;
const ACK_FORM_ID = 'EN-FM-001';
const GVGB_POLICY_ID = 'GV-GB-001';

export const POLICY_ACK_FORM_ID = ACK_FORM_ID;

export function isPolicyId(value: string): boolean {
  return POLICY_ID_RE.test(value);
}

export function getFormById(formId: string): FormRecord | undefined {
  return FORMS_DATASET.find(f => f.id === formId);
}

export function getFormsForPolicy(policyId: string): FormRecord[] {
  const forms = FORMS_DATASET.filter(f => f.policies.some(p => p === policyId));
  const ack = getFormById(ACK_FORM_ID);

  if (!ack || policyId === GVGB_POLICY_ID) {
    return forms;
  }

  const withoutAck = forms.filter(f => f.id !== ACK_FORM_ID);
  return [ack, ...withoutAck];
}

export function mapPolicyTags(policies: string[]): Array<{ label: string; policyId?: string }> {
  return policies.map(p => ({
    label: p,
    policyId: isPolicyId(p) ? p : undefined,
  }));
}
