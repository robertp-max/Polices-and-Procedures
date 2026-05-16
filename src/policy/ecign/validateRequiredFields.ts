/**
 * MVP-P1-ECIGN-004 — Required-fields completeness gate before lock.
 *
 * Pure validator: given a form template (set of fields with required flags)
 * and the current set of field values (keyed by stable field id), returns
 * the list of required fields whose values are missing or empty.
 *
 * Used by `FormSigningWorkspace.tsx` at lock time to BLOCK the
 * LOCKED transition when required fields are incomplete. Behind feature
 * flag `flag.required_fields_lock_gate` (defaults ON for safety; flip OFF
 * to revert to legacy unchecked behavior).
 *
 * SCOPE BOUNDARY:
 *   - This module is a pure function. It does not read DOM, does not
 *     mutate state, does not emit audit rows. The caller composes it
 *     with `regulatoryExecutionStore.setFormInstanceStatus`.
 *   - Empty-string and whitespace-only values are treated as missing.
 *   - Checkboxes: value === true / 'true' / 'on' / 'yes' counts as
 *     present; everything else counts as missing.
 *   - Radio groups: any non-empty option string counts as present.
 *   - Signature fields: the caller is responsible for checking signature
 *     presence separately (signature state lives in the eCIgn store, not
 *     in the generic field-value map). Signature fields are SKIPPED by
 *     this validator.
 */

/** Minimal subset of FormField the validator needs. */
export interface ValidatableField {
  /** Stable id used as the key in the values map. Typically `${sectionId}.${fieldKey}` or similar. */
  id: string;
  /** Human-readable label for error messages. */
  label: string;
  /** Field type. 'signature' is SKIPPED. */
  type: string;
  /** Whether this field is required. */
  required?: boolean;
}

export interface MissingRequiredField {
  /** The field that was missing. */
  field: ValidatableField;
  /** Why it failed: 'empty' | 'whitespace_only' | 'checkbox_unchecked' | 'unknown_value_type'. */
  reason: 'empty' | 'whitespace_only' | 'checkbox_unchecked' | 'unknown_value_type';
}

export interface ValidateRequiredFieldsResult {
  /** True when no required fields are missing. */
  complete: boolean;
  /** Empty array when complete. */
  missing: MissingRequiredField[];
  /** Total count of required fields evaluated (signature fields excluded). */
  totalRequired: number;
  /** Count of required fields actually filled. */
  filledRequired: number;
}

function isMap<K, V>(v: unknown): v is ReadonlyMap<K, V> {
  return v instanceof Map;
}

function isPresentCheckboxValue(v: unknown): boolean {
  return v === true || v === 'true' || v === 'on' || v === 'yes' || v === '1';
}

function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function isWhitespaceOnly(v: string): boolean {
  return v.trim() === '';
}

/**
 * Validate required-field completeness.
 *
 * @param fields - Form template field array (e.g. flatMap of section.fields)
 * @param values - Map from field id → string|boolean|undefined (current values)
 */
export function validateRequiredFields(
  fields: readonly ValidatableField[],
  values: ReadonlyMap<string, string | boolean | undefined> | Readonly<Record<string, string | boolean | undefined>>,
): ValidateRequiredFieldsResult {
  const missing: MissingRequiredField[] = [];
  let totalRequired = 0;
  let filledRequired = 0;

  for (const field of fields) {
    if (!field.required) continue;
    if (field.type === 'signature') continue;

    totalRequired++;

    const rawValue = isMap(values) ? values.get(field.id) : values[field.id];

    let reason: MissingRequiredField['reason'] | null = null;

    if (field.type === 'checkbox') {
      if (!isPresentCheckboxValue(rawValue)) {
        reason = 'checkbox_unchecked';
      }
    } else if (isEmptyValue(rawValue)) {
      reason = 'empty';
    } else if (typeof rawValue === 'string') {
      if (isWhitespaceOnly(rawValue)) {
        reason = 'whitespace_only';
      }
    } else if (typeof rawValue === 'boolean') {
      // boolean non-checkbox: only true is present, but we already handled checkbox
      if (!rawValue) {
        reason = 'checkbox_unchecked'; // reuse for falsey bool
      }
    } else if (rawValue !== undefined && rawValue !== null) {
      // non-string/boolean, treat as present if truthy
      // but per spec, for unknown treat accordingly
    } else {
      reason = 'unknown_value_type';
    }

    if (reason) {
      missing.push({ field, reason });
    } else {
      filledRequired++;
    }
  }

  const complete = missing.length === 0;
  return { complete, missing, totalRequired, filledRequired };
}

/**
 * Human-readable summary for UI / toast / audit.
 *
 * @example
 *   const result = validateRequiredFields(fields, values);
 *   if (!result.complete) toast.error(formatMissingFieldsMessage(result));
 */
export function formatMissingFieldsMessage(result: ValidateRequiredFieldsResult): string {
  if (result.complete) return '';
  const n = result.missing.length;
  const labels = result.missing.map(m => m.field.label);
  if (n > 5) {
    const shown = labels.slice(0, 5).join(', ');
    return `Missing ${n} required field(s): ${shown} (...and ${n - 5} more)`;
  }
  return `Missing ${n} required field(s): ${labels.join(', ')}`;
}
