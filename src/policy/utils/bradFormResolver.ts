import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { buildFormContent, type FormContent, type FormRecord } from '@/policy/data/formsLibraryContent';
import { resolveCanonicalFormId } from '@/policy/data/formIdAliases';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad form resolver.
   ----------------------------------------------------------------------------
   Resolves a form reference to the CANONICAL operational form record + its
   structured field schema (buildFormContent), so the right panel can render a
   real fillable form rather than a raw .txt source. Precedence: canonical form
   record → schema renderer. Returns null when the form does not exist (UI shows
   "Form unavailable" — never a raw-text fallback).
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ResolvedForm {
  formId: string;
  record: FormRecord;
  content: FormContent;
  signable: boolean;
}

function findRecord(formId: string): FormRecord | undefined {
  const canonical = resolveCanonicalFormId(formId) ?? formId;
  return (
    FORMS_DATASET.find((f) => f.id === canonical) ??
    FORMS_DATASET.find((f) => f.id === formId)
  );
}

/** A form is signable when its schema declares signature blocks/slots or a signature field. */
export function isFormSignable(content: FormContent): boolean {
  if ((content.signerSlots?.length ?? 0) > 0) return true;
  if ((content.signatures?.length ?? 0) > 0) return true;
  for (const s of content.sections) {
    if (s.layout === 'signature' || s.layout === 'attestation') return true;
    for (const f of s.fields ?? []) if (f.type === 'signature') return true;
  }
  return false;
}

export function resolveForm(formId: string): ResolvedForm | null {
  const record = findRecord(formId);
  if (!record) return null;
  const content = buildFormContent(record);
  return { formId: record.id, record, content, signable: isFormSignable(content) };
}
