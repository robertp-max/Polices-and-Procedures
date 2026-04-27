export function normalizeComparable(text?: string): string {
  return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function isSameDisplayText(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return normalizeComparable(a) === normalizeComparable(b);
}

export function toReadableStepText(text?: string): string {
  let value = (text || '').trim();
  if (!value) return '';

  value = value
    .replace(/^(workflow[_\-\s]*derived|event[_\-\s]*authored[_\-\s]*exception)[\s:._-]*/i, '')
    .replace(/^step(?=[A-Z0-9])/, '')
    .replace(/^step[_-]+/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getDistinctDisplayText(
  candidate: string | undefined,
  ...existingValues: Array<string | undefined>
): string | undefined {
  const value = (candidate || '').trim();
  if (!value) return undefined;
  const duplicate = existingValues.some((existing) => isSameDisplayText(value, existing));
  return duplicate ? undefined : value;
}

export function buildFormDisplayText(
  formId: string | undefined,
  formTitle: string | undefined,
  fallbackId?: string,
): string {
  const id = (formId || '').trim() || (fallbackId || '').trim();
  const title = (formTitle || '').trim();

  if (id && title && !isSameDisplayText(id, title)) {
    return `${id} — ${title}`;
  }
  if (id) return id;
  if (title) return title;
  return 'Unlabeled form';
}
